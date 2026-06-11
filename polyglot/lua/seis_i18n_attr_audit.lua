#!/usr/bin/env lua5.4
-- SEIS i18n attribute auditor — Lua 5.4
--
-- Extracts every data-i18n, data-i18n-placeholder, and data-i18n-aria-label
-- value from apps/web/index.html then verifies each key exists in the "tr"
-- base locale of apps/web/translations.json.
--
-- Usage: lua5.4 polyglot/lua/seis_i18n_attr_audit.lua [--self-test]
-- Exit:  0 PASS, 1 FAIL

local HTML_FILE = "apps/web/index.html"
local JSON_FILE = "apps/web/translations.json"

-- ─── helpers ─────────────────────────────────────────────────────────────────

local function read_file(path)
  local f, err = io.open(path, "r")
  if not f then return nil, err end
  local content = f:read("*a")
  f:close()
  return content
end

local function count_keys(t)
  local n = 0
  for _ in pairs(t) do n = n + 1 end
  return n
end

-- ─── extraction ──────────────────────────────────────────────────────────────

-- Extract all data-i18n* attribute values from HTML source.
local function extract_html_keys(html)
  local keys = {}
  -- matches: data-i18n="key", data-i18n-placeholder="key", data-i18n-aria-label="key"
  for key in html:gmatch('data%-i18n[%w%-]*="([^"]+)"') do
    keys[key] = true
  end
  return keys
end

-- Extract all keys from the "tr" locale block in translations.json.
-- Uses a manual brace-depth walk so no JSON library is needed.
local function extract_tr_keys(json)
  -- Locate "tr": {
  local search_start = json:find('"tr"%s*:')
  if not search_start then return nil, '"tr" locale not found' end

  -- Walk from that position to find the opening brace
  local block_start = nil
  local depth = 0
  local keys = {}

  for i = search_start, #json do
    local ch = json:sub(i, i)
    if ch == "{" then
      depth = depth + 1
      if depth == 1 then block_start = i end
    elseif ch == "}" and depth > 0 then
      depth = depth - 1
      if depth == 0 then
        -- Extract every "key": token inside the block
        local block = json:sub(block_start + 1, i - 1)
        for key in block:gmatch('"([^"]+)"%s*:') do
          keys[key] = true
        end
        return keys
      end
    end
  end
  return nil, "unmatched brace — tr locale block not closed"
end

-- ─── self-test ───────────────────────────────────────────────────────────────

local function self_test()
  local pass, total = 0, 0

  local function check(label, cond)
    total = total + 1
    if cond then
      pass = pass + 1
    else
      io.stderr:write("  [FAIL] self-test: " .. label .. "\n")
    end
  end

  -- extract_html_keys
  local html = '<p data-i18n="nav.home">x</p><input data-i18n-placeholder="form.name">' ..
               '<button data-i18n-aria-label="btn.close">×</button>'
  local hk = extract_html_keys(html)
  check("data-i18n extracted",             hk["nav.home"] == true)
  check("data-i18n-placeholder extracted", hk["form.name"] == true)
  check("data-i18n-aria-label extracted",  hk["btn.close"] == true)
  check("no stray keys (3 total)",         count_keys(hk) == 3)

  -- extract_tr_keys
  local json = '{"tr":{"nav.home":"Ana Sayfa","hero.title":"Başlık"},' ..
               '"en":{"nav.home":"Home","hero.title":"Title"}}'
  local tk, err = extract_tr_keys(json)
  check("no extract error",                err == nil)
  check("nav.home in tr",                  tk ~= nil and tk["nav.home"] == true)
  check("hero.title in tr",                tk ~= nil and tk["hero.title"] == true)
  check("en keys not in tr result",        tk ~= nil and tk["Home"] == nil)
  check("only 2 keys extracted",           tk ~= nil and count_keys(tk) == 2)

  -- audit: all keys present → no missing
  local missing = {}
  for k in pairs(hk) do
    if not tk[k] then table.insert(missing, k) end
  end
  -- nav.home and form.name and btn.close are all absent from our minimal tr
  -- so this test confirms detection works
  -- nav.home IS in tr_keys; form.name and btn.close are not → 2 missing
  check("missing keys detected (2)",       #missing == 2)

  -- audit: subset check — only keys from tr
  local hk2 = extract_html_keys('<p data-i18n="nav.home">x</p>')
  local missing2 = {}
  for k in pairs(hk2) do
    if not tk[k] then table.insert(missing2, k) end
  end
  check("known good key has no missing",   #missing2 == 0)

  if pass == total then
    print(string.format("[PASS] lua-i18n-attr  %d/%d self-tests passed", total, total))
    return true
  end
  print(string.format("[FAIL] lua-i18n-attr  %d/%d self-tests passed", pass, total))
  return false
end

-- ─── main ────────────────────────────────────────────────────────────────────

if arg[1] == "--self-test" then
  os.exit(self_test() and 0 or 1)
end

local html, e1 = read_file(HTML_FILE)
if not html then
  print("[FAIL] lua-i18n-attr  cannot read " .. HTML_FILE .. ": " .. (e1 or ""))
  os.exit(1)
end

local json, e2 = read_file(JSON_FILE)
if not json then
  print("[FAIL] lua-i18n-attr  cannot read " .. JSON_FILE .. ": " .. (e2 or ""))
  os.exit(1)
end

local html_keys         = extract_html_keys(html)
local tr_keys, tr_err   = extract_tr_keys(json)
if not tr_keys then
  print("[FAIL] lua-i18n-attr  " .. tr_err)
  os.exit(1)
end

local html_count = count_keys(html_keys)
local tr_count   = count_keys(tr_keys)

local missing = {}
for k in pairs(html_keys) do
  if not tr_keys[k] then table.insert(missing, k) end
end
table.sort(missing)

print(string.format("       html i18n attrs: %d unique keys  /  tr locale: %d keys", html_count, tr_count))

if #missing == 0 then
  print(string.format("[PASS] lua-i18n-attr  all %d HTML i18n keys present in tr locale", html_count))
else
  print(string.format("[FAIL] lua-i18n-attr  %d key(s) in HTML missing from tr locale:", #missing))
  for _, k in ipairs(missing) do
    print("       missing: " .. k)
  end
  os.exit(1)
end
