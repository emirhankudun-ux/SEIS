# frozen_string_literal: true

# SEIS i18n statistics — translation-quality lens over translations.json.
#
# The JS suite enforces key *parity*; this tool measures the *content*:
# per-locale word/character volume, and values left identical to the
# Turkish source in another locale — the classic sign of an untranslated
# string. Proper nouns and brand words are expected to match and are
# filtered through an allowlist.
#
# Exit codes: 0 report printed (suspects are informational),
#             1 locale parity broken, 2 file unreadable.
#
# Usage: ruby polyglot/ruby/i18n_stats.rb [translations.json]

require "json"

module SeisI18nStats
  SOURCE_LOCALE = "tr"

  # Values expected to be identical across locales (brands, names, format
  # strings, bare numbers/punctuation).
  ALLOWLIST = [
    /\A[A-Z][a-zA-Z]*\z/,                  # single capitalised word: Behance, Portfolio
    /\AEmirhan(\s|\z)/,                    # owner name
    /\A[\d\s:%.,+\-—–·\/]*\z/,             # numbers & punctuation only
    /\A(UI\/UX|UX|UI|SEIS)(\s|\z)/i,       # discipline acronyms / project name
    /\A\S+@\S+\z/,                         # email addresses
    /\Ahttps?:/                            # URLs
  ].freeze

  module_function

  def expected_match?(value)
    ALLOWLIST.any? { |re| value.match?(re) }
  end

  def stats_for(values)
    words = values.sum { |v| v.split(/\s+/).reject(&:empty?).length }
    chars = values.sum(&:length)
    { keys: values.length, words: words, chars: chars }
  end

  # => { ok:, locales:, stats:, suspects: { locale => [keys] } }
  def analyse(translations)
    locales = translations.keys
    source = translations[SOURCE_LOCALE] or
      return { ok: false, error: "source locale #{SOURCE_LOCALE} missing", locales: locales }

    key_sets = translations.values.map { |t| t.keys.sort }
    parity = key_sets.uniq.length == 1

    stats = translations.to_h { |locale, table| [locale, stats_for(table.values)] }

    suspects = {}
    (locales - [SOURCE_LOCALE]).each do |locale|
      same = translations[locale].select do |key, value|
        src = source[key]
        !value.empty? && value == src && value.length > 3 && !expected_match?(value)
      end
      suspects[locale] = same.keys.sort unless same.empty?
    end

    { ok: parity, locales: locales, stats: stats, suspects: suspects }
  end

  def report(path)
    translations = JSON.parse(File.read(path, encoding: "utf-8"))
    result = analyse(translations)

    mark = result[:ok] ? "PASS" : "FAIL"
    puts "[#{mark}] i18n-stats  #{result[:locales]&.join('/')}"
    return 2 if result[:error]

    result[:stats].each do |locale, s|
      printf("        %-4s %4d keys  %5d words  %6d chars\n",
             locale, s[:keys], s[:words], s[:chars])
    end
    result[:suspects].each do |locale, keys|
      puts "        info: #{locale} identical to #{SOURCE_LOCALE} (#{keys.length}): #{keys.first(8).join(', ')}#{keys.length > 8 ? ', …' : ''}"
    end
    result[:ok] ? 0 : 1
  rescue Errno::ENOENT, JSON::ParserError => e
    warn "i18n-stats: #{e.message}"
    2
  end
end

if $PROGRAM_NAME == __FILE__
  default = File.expand_path("../../apps/web/translations.json", __dir__)
  exit SeisI18nStats.report(ARGV[0] || default)
end
