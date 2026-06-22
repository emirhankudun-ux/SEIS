#!/usr/bin/env swipl
% SEIS HTML tabindex accessibility auditor - SWI-Prolog script.
%
% Reads apps/web/index.html and reports any tabindex value > 0.
% Positive tabindex creates custom focus order that skips natural DOM
% order, which is an accessibility anti-pattern (WCAG 2.4.3).
%
%   tabindex="-1"  -- fine (removes from natural tab flow, JS-manageable)
%   tabindex="0"   -- fine (adds to natural tab order)
%   tabindex="N>0" -- FAIL (custom tab order, a11y anti-pattern)
%
% Usage: swipl -g main -t halt polyglot/prolog/seis_html_tabindex_audit.pl [--self-test]
%        OR: swipl polyglot/prolog/seis_html_tabindex_audit.pl --self-test
% Exit: 0 PASS, 1 FAIL

:- initialization(main, main).

default_html('apps/web/index.html').

% --- string helpers -----------------------------------------------------------

% Extract all tabindex="N" values from an HTML string.
% Returns a list of strings (the values, e.g. "-1", "0", "3").
extract_tabindex_values(HTML, Values) :-
    string_lower(HTML, LC),
    string_length(LC, Len),
    findall(V,
      ( sub_string(LC, Before, 10, _, "tabindex=\""),
        StartVal is Before + 10,
        RemLen is Len - StartVal,
        sub_string(LC, StartVal, RemLen, 0, Suffix),
        (   sub_string(Suffix, ValLen, 1, _, "\""),
            ValLen > 0
        ->  sub_string(Suffix, 0, ValLen, _, V)
        ;   fail
        )
      ),
      Values).

% True if a tabindex value string represents a positive integer.
positive_tabindex(ValStr) :-
    number_string(N, ValStr),
    integer(N),
    N > 0.

% Find all positive tabindex values.
find_positive(HTML, Bad) :-
    extract_tabindex_values(HTML, Vals),
    include(positive_tabindex, Vals, Bad).

% --- self-tests ---------------------------------------------------------------

:- dynamic test_pass/1, test_total/1.

run_check(Label, Goal) :-
    (   call(Goal)
    ->  succ_test(Label)
    ;   fail_test(Label)
    ).

succ_test(_) :-
    (retract(test_pass(P)) -> P1 is P + 1 ; P1 = 1),
    (retract(test_total(T)) -> T1 is T + 1 ; T1 = 1),
    assertz(test_pass(P1)), assertz(test_total(T1)).

fail_test(Label) :-
    (retract(test_total(T)) -> T1 is T + 1 ; T1 = 1),
    assertz(test_total(T1)),
    format("  [FAIL] self-test: ~w~n", [Label]).

self_test :-
    assertz(test_pass(0)), assertz(test_total(0)),

    % tabindex extraction -- each uses its own local variable via once/1
    run_check("extract empty from no tabindex",
      once(extract_tabindex_values("<p>hello</p>", []))),

    run_check("extract -1 value",
      once((extract_tabindex_values("<input tabindex=\"-1\">", V1), V1 = ["-1"]))),

    run_check("extract 0 value",
      once((extract_tabindex_values("<div tabindex=\"0\">", V2), V2 = ["0"]))),

    run_check("extract positive value",
      once((extract_tabindex_values("<div tabindex=\"3\">", V3), V3 = ["3"]))),

    run_check("extract multiple values",
      once((extract_tabindex_values("<div tabindex=\"-1\"><span tabindex=\"0\">", V4),
        length(V4, 2)))),

    % positive_tabindex predicate
    run_check("positive_tabindex true for 1",   positive_tabindex("1")),
    run_check("positive_tabindex true for 5",   positive_tabindex("5")),
    run_check("positive_tabindex false for 0",  \+ positive_tabindex("0")),
    run_check("positive_tabindex false for -1", \+ positive_tabindex("-1")),

    % find_positive
    run_check("find_positive empty for safe HTML",
      find_positive("<div tabindex=\"-1\"><p tabindex=\"0\">", [])),

    run_check("find_positive finds bad value",
      once((find_positive("<div tabindex=\"3\">", Bad), Bad \= []))),

    test_pass(P), test_total(T),
    (P =:= T -> Tag = "PASS" ; Tag = "FAIL"),
    format("[~w] html-tabindex-audit  ~w/~w self-tests passed~n", [Tag, P, T]),
    P =:= T.

% --- main ---------------------------------------------------------------------

main(Args) :-
    ( member('--self-test', Args) ->
        ( self_test -> halt(0) ; halt(1) )
    ;
        default_html(HtmlPath),
        ( exists_file(HtmlPath) ->
            true
        ;
            format("[FAIL] html-tabindex-audit  ~w not found~n", [HtmlPath]),
            halt(1)
        ),
        read_file_to_string(HtmlPath, HTML, [encoding(utf8)]),
        extract_tabindex_values(HTML, Vals),
        find_positive(HTML, Bad),
        length(Vals, N),
        format("       ~w: ~w tabindex attribute(s) checked~n", [HtmlPath, N]),
        ( Bad = [] ->
            format("[PASS] html-tabindex-audit  no positive tabindex values found~n"),
            halt(0)
        ;
            length(Bad, Nb),
            format("[FAIL] html-tabindex-audit  ~w positive tabindex value(s):~n", [Nb]),
            forall(member(V, Bad), format("       tabindex=\"~w\"~n", [V])),
            halt(1)
        )
    ).
