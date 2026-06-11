# frozen_string_literal: true

require "minitest/autorun"
require_relative "i18n_stats"

class I18nStatsTest < Minitest::Test
  def balanced
    {
      "tr" => { "hero.title" => "Çizim ve tasarım", "nav.home" => "Ana Sayfa", "brand" => "Behance" },
      "en" => { "hero.title" => "Drawing and design", "nav.home" => "Home", "brand" => "Behance" },
      "fr" => { "hero.title" => "Dessin et design", "nav.home" => "Accueil", "brand" => "Behance" }
    }
  end

  def test_parity_ok_for_matching_key_sets
    result = SeisI18nStats.analyse(balanced)
    assert result[:ok]
    assert_equal %w[tr en fr], result[:locales]
  end

  def test_parity_fails_on_missing_key
    data = balanced
    data["fr"].delete("nav.home")
    refute SeisI18nStats.analyse(data)[:ok]
  end

  def test_stats_count_keys_words_chars
    s = SeisI18nStats.analyse(balanced)[:stats]["tr"]
    assert_equal 3, s[:keys]
    assert_equal 6, s[:words] # "Çizim ve tasarım" 3 + "Ana Sayfa" 2 + "Behance" 1
    assert_operator s[:chars], :>, 20
  end

  def test_flags_untranslated_value
    data = balanced
    data["en"]["hero.title"] = "Çizim ve tasarım" # copied from tr
    suspects = SeisI18nStats.analyse(data)[:suspects]
    assert_equal ["hero.title"], suspects["en"]
  end

  def test_brand_words_are_not_suspects
    suspects = SeisI18nStats.analyse(balanced)[:suspects]
    assert_nil suspects["en"] # "Behance" matches everywhere but is allowlisted
  end

  def test_owner_name_allowlisted
    assert SeisI18nStats.expected_match?("Emirhan Kudun")
    assert SeisI18nStats.expected_match?("UI/UX Designer")
    assert SeisI18nStats.expected_match?("2024")
    refute SeisI18nStats.expected_match?("Projenizden bahsedin")
  end

  def test_missing_source_locale_reports_error
    result = SeisI18nStats.analyse({ "en" => { "a" => "x" } })
    refute result[:ok]
    assert_match(/source locale/, result[:error])
  end
end
