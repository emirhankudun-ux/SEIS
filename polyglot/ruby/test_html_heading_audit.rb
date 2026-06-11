#!/usr/bin/env ruby
require 'minitest/autorun'
require_relative 'html_heading_audit'

class TestHeadingAudit < Minitest::Test
  def test_valid_structure
    html = '<h1>Title</h1><main><h2>Sec</h2><h3>Sub</h3></main><nav></nav><footer></footer>'
    r = audit(html)
    assert r[:ok], r[:findings].inspect
  end

  def test_multiple_h1
    html = '<h1>A</h1><h1>B</h1><main></main><nav></nav><footer></footer>'
    r = audit(html)
    refute r[:ok]
    assert_match(/2.*h1/, r[:findings].join)
  end

  def test_skipped_level_h1_to_h3
    html = '<h1>A</h1><h3>Skipped</h3><main></main><nav></nav><footer></footer>'
    r = audit(html)
    refute r[:ok]
    assert r[:findings].any? { |f| f.include?('h1') && f.include?('h3') }
  end

  def test_missing_main_landmark
    html = '<h1>T</h1><nav></nav><footer></footer>'
    r = audit(html)
    refute r[:ok]
    assert r[:findings].any? { |f| f.include?('main') }
  end

  def test_missing_nav
    html = '<h1>T</h1><main></main><footer></footer>'
    r = audit(html)
    refute r[:ok]
    assert r[:findings].any? { |f| f.include?('nav') }
  end

  def test_extract_headings
    assert_equal [1, 2, 3, 2], extract_headings('<h1/><h2/><h3/><h2/>')
  end

  def test_h2_after_h1_is_valid
    html = '<h1>T</h1><h2>S</h2><main></main><nav></nav><footer></footer>'
    r = audit(html)
    assert r[:ok], r[:findings].inspect
  end
end
