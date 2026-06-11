// seis_translations_lint — structural linter for translations.json.
//
// JavaScript's JSON.parse silently keeps the LAST duplicate key, so a
// copy-paste duplicate in translations.json is invisible to the entire
// JS audit suite — the file parses, parity holds, and one translation
// quietly shadows another. This linter uses its own recursive-descent
// parser that REJECTS duplicates, and then validates the SEIS shape:
// top level is an object of locale → flat object of string values.
//
// Build: g++ -std=c++17 -Wall -Wextra -Werror -O2
//        -o seis_translations_lint polyglot/cpp/seis_translations_lint.cpp
// Usage: seis_translations_lint [translations.json] | --self-test
// Exit:  0 clean · 1 structural finding · 2 unreadable/parse error

#include <cstdio>
#include <fstream>
#include <set>
#include <sstream>
#include <string>
#include <vector>

namespace seis {

struct Finding {
    std::string message;
};

// Minimal JSON scanner specialised for the translations shape:
// values are only objects or strings at the depths we accept.
class Parser {
public:
    explicit Parser(const std::string& text) : text_(text) {}

    // Parse "{ locale: { key: "value", … }, … }", recording findings.
    bool parse(std::vector<Finding>& findings,
               std::vector<std::pair<std::string, size_t>>& locales) {
        skipWs();
        if (!consume('{')) return fail("top level must be an object");
        std::set<std::string> seenLocales;
        skipWs();
        if (peek() == '}') { ++pos_; return true; }
        while (true) {
            std::string locale;
            if (!parseString(locale)) return fail("expected locale name string");
            if (!seenLocales.insert(locale).second)
                findings.push_back({"duplicate locale \"" + locale + "\""});
            skipWs();
            if (!consume(':')) return fail("expected ':' after locale name");
            size_t keyCount = 0;
            if (!parseLocaleTable(locale, keyCount, findings)) return false;
            locales.emplace_back(locale, keyCount);
            skipWs();
            if (consume(',')) { skipWs(); continue; }
            if (consume('}')) break;
            return fail("expected ',' or '}' after locale table");
        }
        skipWs();
        if (pos_ != text_.size()) return fail("trailing content after document");
        return true;
    }

    const std::string& error() const { return error_; }
    size_t errorLine() const {
        size_t line = 1;
        for (size_t i = 0; i < pos_ && i < text_.size(); ++i)
            if (text_[i] == '\n') ++line;
        return line;
    }

private:
    bool parseLocaleTable(const std::string& locale, size_t& keyCount,
                          std::vector<Finding>& findings) {
        skipWs();
        if (!consume('{')) return fail("locale \"" + locale + "\" must map to an object");
        std::set<std::string> seen;
        skipWs();
        if (consume('}')) return true;
        while (true) {
            std::string key;
            if (!parseString(key)) return fail("expected key string in \"" + locale + "\"");
            if (!seen.insert(key).second)
                findings.push_back({"duplicate key \"" + key + "\" in locale \"" + locale + "\""});
            skipWs();
            if (!consume(':')) return fail("expected ':' after key \"" + key + "\"");
            skipWs();
            std::string value;
            if (!parseString(value))
                return fail("value of \"" + locale + "." + key + "\" must be a string");
            ++keyCount;
            skipWs();
            if (consume(',')) { skipWs(); continue; }
            if (consume('}')) return true;
            return fail("expected ',' or '}' in locale \"" + locale + "\"");
        }
    }

    bool parseString(std::string& out) {
        skipWs();
        if (!consume('"')) return false;
        out.clear();
        while (pos_ < text_.size()) {
            char c = text_[pos_++];
            if (c == '"') return true;
            if (c == '\\') {
                if (pos_ >= text_.size()) return false;
                char esc = text_[pos_++];
                switch (esc) {
                    case '"': out += '"'; break;
                    case '\\': out += '\\'; break;
                    case '/': out += '/'; break;
                    case 'b': out += '\b'; break;
                    case 'f': out += '\f'; break;
                    case 'n': out += '\n'; break;
                    case 'r': out += '\r'; break;
                    case 't': out += '\t'; break;
                    case 'u': {
                        if (pos_ + 4 > text_.size()) return false;
                        out += "\\u" + text_.substr(pos_, 4); // keep escaped; content unused
                        pos_ += 4;
                        break;
                    }
                    default: return false;
                }
            } else if (static_cast<unsigned char>(c) < 0x20) {
                return false; // raw control character inside string
            } else {
                out += c;
            }
        }
        return false;
    }

    void skipWs() {
        while (pos_ < text_.size()) {
            char c = text_[pos_];
            if (c == ' ' || c == '\t' || c == '\n' || c == '\r') ++pos_;
            else break;
        }
    }
    bool consume(char c) {
        if (pos_ < text_.size() && text_[pos_] == c) { ++pos_; return true; }
        return false;
    }
    char peek() const { return pos_ < text_.size() ? text_[pos_] : '\0'; }
    bool fail(const std::string& message) { error_ = message; return false; }

    const std::string& text_;
    size_t pos_ = 0;
    std::string error_;
};

struct Report {
    bool parsed = false;
    std::string parseError;
    size_t parseErrorLine = 0;
    std::vector<Finding> findings;
    std::vector<std::pair<std::string, size_t>> locales;
};

Report lint(const std::string& text) {
    Report report;
    Parser parser(text);
    report.parsed = parser.parse(report.findings, report.locales);
    if (!report.parsed) {
        report.parseError = parser.error();
        report.parseErrorLine = parser.errorLine();
        return report;
    }
    // SEIS shape: every locale carries at least one key; empty locale
    // tables are merge accidents.
    for (const auto& [locale, count] : report.locales)
        if (count == 0)
            report.findings.push_back({"locale \"" + locale + "\" has no keys"});
    return report;
}

int selfTest() {
    int failures = 0;
    auto check = [&](const char* name, bool ok) {
        if (!ok) { std::printf("  FAIL %s\n", name); ++failures; }
    };

    {
        Report r = lint(R"({"tr":{"a":"x","b":"y"},"en":{"a":"x","b":"y"}})");
        check("clean document parses", r.parsed && r.findings.empty());
        check("locales counted", r.locales.size() == 2 && r.locales[0].second == 2);
    }
    {
        Report r = lint(R"({"tr":{"a":"1","a":"2"}})");
        check("duplicate key detected", r.parsed && r.findings.size() == 1 &&
              r.findings[0].message.find("duplicate key \"a\"") != std::string::npos);
    }
    {
        Report r = lint(R"({"tr":{"a":"1"},"tr":{"a":"2"}})");
        check("duplicate locale detected", r.parsed && !r.findings.empty());
    }
    {
        Report r = lint(R"({"tr":{"a":123}})");
        check("non-string value rejected", !r.parsed);
    }
    {
        Report r = lint(R"({"tr":"flat"})");
        check("non-object locale rejected", !r.parsed);
    }
    {
        Report r = lint(R"({"tr":{}})");
        check("empty locale flagged", r.parsed && !r.findings.empty());
    }
    {
        Report r = lint(R"({"tr":{"k":"çizim ışığı — élégant"}})");
        check("unicode values accepted", r.parsed && r.findings.empty());
    }
    {
        Report r = lint(R"({"tr":{"k":"line\nbreak ç"}})");
        check("escapes accepted", r.parsed && r.findings.empty());
    }
    {
        Report r = lint("{\"tr\":{\"k\":\"raw\ntab\"}}");
        check("raw control char rejected", !r.parsed);
    }

    std::printf("[%s] translations-lint self-test  9 checks, %d failures\n",
                failures ? "FAIL" : "PASS", failures);
    return failures ? 1 : 0;
}

} // namespace seis

int main(int argc, char** argv) {
    if (argc >= 2 && std::string(argv[1]) == "--self-test")
        return seis::selfTest();

    const char* path = argc >= 2 ? argv[1] : "apps/web/translations.json";
    std::ifstream in(path, std::ios::binary);
    if (!in) {
        std::fprintf(stderr, "translations-lint: cannot open %s\n", path);
        return 2;
    }
    std::ostringstream buf;
    buf << in.rdbuf();
    const std::string text = buf.str();

    seis::Report report = seis::lint(text);
    if (!report.parsed) {
        std::printf("[FAIL] translations-lint  %s: %s (line %zu)\n",
                    path, report.parseError.c_str(), report.parseErrorLine);
        return 2;
    }
    if (!report.findings.empty()) {
        std::printf("[FAIL] translations-lint  %zu finding(s)\n", report.findings.size());
        for (const auto& f : report.findings)
            std::printf("        %s\n", f.message.c_str());
        return 1;
    }
    std::printf("[PASS] translations-lint  ");
    for (size_t i = 0; i < report.locales.size(); ++i)
        std::printf("%s:%zu%s", report.locales[i].first.c_str(), report.locales[i].second,
                    i + 1 < report.locales.size() ? " " : "\n");
    return 0;
}
