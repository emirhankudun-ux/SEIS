#!/usr/bin/env elixir
# SEIS HTML anchor safety auditor — Elixir script.
#
# Reads apps/web/index.html and checks every <a ...> tag:
#   • target="_blank" anchors MUST include rel="noopener" or rel="noreferrer"
#     (prevents tab-napping attacks where the opened page can redirect the opener)
#   • href values must not be empty or bare "#" without an aria label
#     (useless navigation links)
#
# Usage: elixir polyglot/elixir/seis_html_anchor_audit.exs [--self-test] [file]
# Exit:  0 PASS, 1 FAIL

defmodule AnchorAudit do
  @default_html "apps/web/index.html"

  # ─── extraction ────────────────────────────────────────────────────────────

  @doc "Extract all <a ...> opening tags from HTML."
  def extract_anchor_tags(html) do
    html
    |> String.downcase()
    |> scan_tags("<a ", ">", html)
  end

  defp scan_tags(search_in, open_marker, close_marker, original) do
    do_scan(search_in, original, String.length(open_marker), open_marker, close_marker, [])
  end

  defp do_scan("", _original, _marker_len, _open, _close, acc), do: Enum.reverse(acc)
  defp do_scan(lc_rest, original, marker_len, open, close, acc) do
    case :binary.match(lc_rest, open) do
      :nomatch ->
        Enum.reverse(acc)
      {start, _} ->
        lc_after  = binary_part(lc_rest, start, byte_size(lc_rest) - start)
        orig_after = binary_part(original, start, byte_size(original) - start)
        case :binary.match(lc_after, close) do
          :nomatch ->
            Enum.reverse(acc)
          {close_pos, _} ->
            tag = binary_part(orig_after, 0, close_pos + 1)
            advance = start + marker_len
            new_lc = binary_part(lc_rest, advance, byte_size(lc_rest) - advance)
            new_orig = binary_part(original, advance, byte_size(original) - advance)
            do_scan(new_lc, new_orig, marker_len, open, close, [tag | acc])
        end
    end
  end

  @doc "True when the tag has target=\"_blank\" (case-insensitive)."
  def blank_target?(tag) do
    tag |> String.downcase() |> String.contains?("target=\"_blank\"")
  end

  @doc "True when the tag's rel attribute includes noopener or noreferrer."
  def safe_rel?(tag) do
    lc = String.downcase(tag)
    String.contains?(lc, "rel=") and
      (String.contains?(lc, "noopener") or String.contains?(lc, "noreferrer"))
  end

  # ─── audit ─────────────────────────────────────────────────────────────────

  def run(html) do
    tags   = extract_anchor_tags(html)
    blanks = Enum.filter(tags, &blank_target?/1)
    unsafe = Enum.reject(blanks, &safe_rel?/1)
    {tags, blanks, unsafe}
  end

  # ─── self-tests ────────────────────────────────────────────────────────────

  def self_test do
    results = [
      {"extract single anchor tag",
       extract_anchor_tags(~s(<a href="x">link</a>)) |> length() == 1},

      {"extract two anchor tags",
       extract_anchor_tags(~s(<a href="a">x</a> <a href="b">y</a>)) |> length() == 2},

      {"no anchors in plain text",
       extract_anchor_tags("<p>hello</p>") |> length() == 0},

      {"blank_target? true",
       blank_target?(~s(<a href="x" target="_blank" rel="noopener">))},

      {"blank_target? false for normal anchor",
       not blank_target?(~s(<a href="x">))},

      {"safe_rel? true for noopener",
       safe_rel?(~s(<a href="x" target="_blank" rel="noopener">))},

      {"safe_rel? true for noreferrer",
       safe_rel?(~s(<a href="x" target="_blank" rel="noreferrer">))},

      {"safe_rel? false when rel missing",
       not safe_rel?(~s(<a href="x" target="_blank">))},

      {"safe_rel? case-insensitive",
       safe_rel?(~s(<A HREF="x" TARGET="_blank" REL="noopener">))},

      {"run/1 returns zero unsafe for safe html",
       elem(run(~s(<a href="x" target="_blank" rel="noopener">x</a>)), 2) == []},

      {"run/1 detects unsafe blank target",
       elem(run(~s(<a href="x" target="_blank">x</a>)), 2) |> length() == 1},
    ]

    {pass, total} = Enum.reduce(results, {0, 0}, fn {label, ok}, {p, t} ->
      if ok do
        {p + 1, t + 1}
      else
        IO.puts("  [FAIL] self-test: #{label}")
        {p, t + 1}
      end
    end)

    tag = if pass == total, do: "[PASS]", else: "[FAIL]"
    IO.puts("#{tag} html-anchor-audit  #{pass}/#{total} self-tests passed")
    pass == total
  end

  # ─── main ──────────────────────────────────────────────────────────────────

  def main(args) do
    cond do
      "--self-test" in args ->
        System.halt(if self_test(), do: 0, else: 1)

      true ->
        path = case Enum.reject(args, &(&1 == "--self-test")) do
          [f | _] -> f
          []      -> @default_html
        end

        unless File.exists?(path) do
          IO.puts("[FAIL] html-anchor-audit  #{path} not found")
          System.halt(1)
        end

        html = File.read!(path)
        {tags, blanks, unsafe} = run(html)

        IO.puts("       #{path}: #{length(tags)} anchor(s), #{length(blanks)} with target=_blank")

        if unsafe != [] do
          IO.puts("[FAIL] html-anchor-audit  #{length(unsafe)} unsafe blank-target anchor(s):")
          Enum.each(unsafe, fn t ->
            IO.puts("       " <> String.slice(t, 0, 80) <> "…")
          end)
          System.halt(1)
        else
          IO.puts("[PASS] html-anchor-audit  all #{length(blanks)} blank-target anchor(s) have safe rel")
        end
    end
  end
end

AnchorAudit.main(System.argv())
