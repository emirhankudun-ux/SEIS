(* SEIS CSS selector statistics auditor — OCaml single-file script.
 *
 * Reads apps/web/style.css, counts selector types (class, ID, element,
 * pseudo, at-rule), and reports the distribution.
 *
 * A high ID-selector ratio causes CSS specificity problems: later rules
 * cannot easily override earlier ones without more IDs or !important.
 * This audit fails if ID selectors exceed 25 % of rule selectors.
 *
 * Usage: ocaml polyglot/ocaml/seis_css_selector_stats.ml [--self-test] [file]
 * Exit:  0 PASS, 1 FAIL
 *)

let default_css = "apps/web/style.css"

(* ─── helpers ────────────────────────────────────────────────────────────── *)

let trim s =
  let n = String.length s in
  let i = ref 0 in
  while !i < n && (s.[!i] = ' ' || s.[!i] = '\t') do incr i done;
  let j = ref (n - 1) in
  while !j >= !i && (s.[!j] = ' ' || s.[!j] = '\t') do decr j done;
  if !j < !i then "" else String.sub s !i (!j - !i + 1)

let starts_with prefix s =
  let lp = String.length prefix and ls = String.length s in
  lp <= ls && String.sub s 0 lp = prefix

let contains_char c s =
  let found = ref false in
  String.iter (fun ch -> if ch = c then found := true) s;
  !found

let count_char c s =
  let n = ref 0 in
  String.iter (fun ch -> if ch = c then incr n) s;
  !n

let read_lines filename =
  let ic = open_in filename in
  let lines = ref [] in
  (try while true do lines := input_line ic :: !lines done
   with End_of_file -> ());
  close_in ic;
  List.rev !lines

(* ─── selector classification ───────────────────────────────────────────── *)

type selector_kind =
  | ClassSel   (* starts with . *)
  | IdSel      (* starts with # *)
  | AtRule     (* starts with @ *)
  | PseudoSel  (* starts with : *)
  | ElementSel (* anything else *)

let classify_selector s =
  match s with
  | "" -> None
  | _ ->
    let t = trim s in
    if String.length t = 0 then None
    else match t.[0] with
    | '.' -> Some ClassSel
    | '#' -> Some IdSel
    | '@' -> Some AtRule
    | ':' -> Some PseudoSel
    | '/' -> None  (* comment *)
    | _   -> Some ElementSel

(* Inspect lines that open a rule block (contain '{').
 * Take the part before '{', trim it, and classify.  *)
let classify_rule_line line =
  match String.index_opt line '{' with
  | None   -> None
  | Some i ->
    let sel = trim (String.sub line 0 i) in
    classify_selector sel

type stats = {
  classes  : int;
  ids      : int;
  at_rules : int;
  pseudos  : int;
  elements : int;
  total    : int;
}

let zero_stats = { classes = 0; ids = 0; at_rules = 0; pseudos = 0; elements = 0; total = 0 }

let add_kind st kind =
  match kind with
  | ClassSel   -> { st with classes  = st.classes  + 1; total = st.total + 1 }
  | IdSel      -> { st with ids      = st.ids      + 1; total = st.total + 1 }
  | AtRule     -> { st with at_rules = st.at_rules + 1 }
  | PseudoSel  -> { st with pseudos  = st.pseudos  + 1; total = st.total + 1 }
  | ElementSel -> { st with elements = st.elements + 1; total = st.total + 1 }

let audit_css lines =
  List.fold_left (fun st line ->
    let trimmed = trim line in
    (* skip pure comment lines and closing-brace-only lines *)
    if starts_with "/*" trimmed || starts_with "//" trimmed
       || starts_with "}" trimmed
    then st
    else match classify_rule_line trimmed with
         | None      -> st
         | Some kind -> add_kind st kind
  ) zero_stats lines

(* ─── self-tests ─────────────────────────────────────────────────────────── *)

let self_test () =
  let pass = ref 0 and total = ref 0 in
  let check label ok =
    incr total;
    if ok then incr pass
    else Printf.printf "  [FAIL] self-test: %s\n" label
  in

  check "trim removes leading spaces"   (trim "  hello  " = "hello");
  check "trim empty string"             (trim "" = "");
  check "starts_with matches"           (starts_with "." ".foo { color: red; }");
  check "starts_with rejects mismatch"  (not (starts_with "#" ".foo {}"));
  check "count_char counts correctly"   (count_char '.' ".foo .bar .baz" = 3);
  check "classify .class"               (classify_selector ".btn" = Some ClassSel);
  check "classify #id"                  (classify_selector "#nav" = Some IdSel);
  check "classify @media"               (classify_selector "@media print" = Some AtRule);
  check "classify :root"                (classify_selector ":root" = Some PseudoSel);
  check "classify element"              (classify_selector "body" = Some ElementSel);
  check "classify empty string"         (classify_selector "" = None);

  let sample_css = [
    ":root { --c: red; }";
    ".btn { color: blue; }";
    ".btn:hover { opacity: .8; }";
    "#nav { display: flex; }";
    "body { margin: 0; }";
    "@media (max-width: 768px) {";
    "  .btn { font-size: .9rem; }";
    "}";
  ] in
  let st = audit_css sample_css in
  (* .btn, .btn:hover, and the nested .btn inside @media = 3 class *)
  check "class count"   (st.classes  = 3);
  check "id count"      (st.ids      = 1);
  check "element count" (st.elements = 1);
  check "at-rule count" (st.at_rules = 1);
  (* total = class(3) + id(1) + element(1) + pseudo(:root=1) = 6; at-rules excluded *)
  check "total count"   (st.total    = 6);

  let passed = !pass = !total in
  Printf.printf "[%s] css-selector-stats  %d/%d self-tests passed\n"
    (if passed then "PASS" else "FAIL") !pass !total;
  passed

(* ─── main ───────────────────────────────────────────────────────────────── *)

let () =
  let args = Array.to_list Sys.argv in
  match List.tl args with
  | ["--self-test"] ->
    if self_test () then exit 0 else exit 1

  | rest ->
    let path = match rest with f :: _ -> f | [] -> default_css in
    if not (Sys.file_exists path) then begin
      Printf.printf "[FAIL] css-selector-stats  %s not found\n" path;
      exit 1
    end;
    let lines = read_lines path in
    let st    = audit_css lines in

    Printf.printf "       %s: %d lines, %d rule selectors\n"
      path (List.length lines) st.total;
    Printf.printf "       class=%d  id=%d  element=%d  pseudo=%d  at-rule=%d\n"
      st.classes st.ids st.elements st.pseudos st.at_rules;

    let id_ratio = if st.total = 0 then 0.0
                   else float_of_int st.ids /. float_of_int st.total *. 100.0 in
    Printf.printf "       id-selector ratio: %.1f%%  (threshold: 25%%)\n" id_ratio;

    if id_ratio > 25.0 then begin
      Printf.printf "[FAIL] css-selector-stats  too many ID selectors (%.1f%% > 25%%)\n"
        id_ratio;
      exit 1
    end else
      Printf.printf "[PASS] css-selector-stats  selector distribution OK\n"
