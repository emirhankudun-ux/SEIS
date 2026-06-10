/* seis_utf8_check — strict UTF-8 validator for SEIS web text files.
 *
 * A 5-locale site (tr/en/fr/it/de) lives or dies on correct encoding:
 * one mojibake'd "ş" or "é" in translations.json ships to every visitor.
 * This validator rejects what lenient decoders silently accept:
 * overlong encodings, UTF-16 surrogates, code points above U+10FFFF,
 * and truncated sequences.
 *
 * Build:  gcc -std=c11 -Wall -Wextra -Werror -O2 -o seis_utf8_check seis_utf8_check.c
 * Usage:  seis_utf8_check FILE...        validate files (exit 1 on invalid)
 *         seis_utf8_check --self-test    run embedded test vectors
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Validate buf[0..len); on failure set *bad_off to the offending byte offset.
 * Returns 1 when valid, 0 when invalid. */
static int utf8_valid(const unsigned char *buf, size_t len, size_t *bad_off)
{
    size_t i = 0;
    while (i < len) {
        unsigned char b = buf[i];
        size_t need;
        unsigned long cp;

        if (b < 0x80) { i += 1; continue; }
        else if ((b & 0xE0) == 0xC0) { need = 1; cp = b & 0x1FUL; }
        else if ((b & 0xF0) == 0xE0) { need = 2; cp = b & 0x0FUL; }
        else if ((b & 0xF8) == 0xF0) { need = 3; cp = b & 0x07UL; }
        else { *bad_off = i; return 0; }          /* lone continuation / 0xFE 0xFF */

        if (len - i - 1 < need) { *bad_off = i; return 0; }   /* truncated */

        for (size_t k = 1; k <= need; k++) {
            unsigned char c = buf[i + k];
            if ((c & 0xC0) != 0x80) { *bad_off = i + k; return 0; }
            cp = (cp << 6) | (c & 0x3FUL);
        }

        /* overlong forms */
        if ((need == 1 && cp < 0x80) ||
            (need == 2 && cp < 0x800) ||
            (need == 3 && cp < 0x10000)) { *bad_off = i; return 0; }
        /* UTF-16 surrogate range is not valid in UTF-8 */
        if (cp >= 0xD800 && cp <= 0xDFFF) { *bad_off = i; return 0; }
        /* beyond Unicode */
        if (cp > 0x10FFFF) { *bad_off = i; return 0; }

        i += 1 + need;
    }
    return 1;
}

static int check_file(const char *path)
{
    FILE *f = fopen(path, "rb");
    if (!f) { fprintf(stderr, "cannot open %s\n", path); return 2; }
    fseek(f, 0, SEEK_END);
    long size = ftell(f);
    fseek(f, 0, SEEK_SET);
    if (size < 0) { fclose(f); return 2; }

    unsigned char *buf = malloc((size_t)size ? (size_t)size : 1);
    if (!buf) { fclose(f); return 2; }
    size_t got = fread(buf, 1, (size_t)size, f);
    fclose(f);

    size_t bad = 0;
    int ok = utf8_valid(buf, got, &bad);
    if (ok) {
        printf("[PASS] utf8  %s (%zu bytes)\n", path, got);
    } else {
        /* report 1-based line for editor jump */
        size_t line = 1;
        for (size_t j = 0; j < bad && j < got; j++)
            if (buf[j] == '\n') line++;
        printf("[FAIL] utf8  %s: invalid byte 0x%02X at offset %zu (line %zu)\n",
               path, buf[bad], bad, line);
    }
    free(buf);
    return ok ? 0 : 1;
}

struct vector { const char *name; const char *bytes; size_t len; int valid; };

static int self_test(void)
{
    /* Real text from the five locales, plus pathological sequences. */
    static const struct vector vectors[] = {
        { "ascii",            "hello",                    5, 1 },
        { "turkish",          "çizim ışığı ğüşöİ",       0, 1 },
        { "french",           "créativité élégante",      0, 1 },
        { "german",           "Schöpfung größer",         0, 1 },
        { "emoji (4-byte)",   "\xF0\x9F\x8E\xA8",         4, 1 },
        { "overlong slash",   "\xC0\xAF",                 2, 0 },
        { "overlong NUL 3b",  "\xE0\x80\x80",             3, 0 },
        { "surrogate D800",   "\xED\xA0\x80",             3, 0 },
        { "beyond U+10FFFF",  "\xF4\x90\x80\x80",         4, 0 },
        { "lone continuation","\x80",                     1, 0 },
        { "truncated 2-byte", "\xC3",                     1, 0 },
        { "truncated 4-byte", "\xF0\x9F\x8E",             3, 0 },
        { "0xFF never valid", "\xFF",                     1, 0 },
    };
    int failures = 0;
    for (size_t i = 0; i < sizeof vectors / sizeof vectors[0]; i++) {
        const struct vector *v = &vectors[i];
        size_t len = v->len ? v->len : strlen(v->bytes);
        size_t bad = 0;
        int got = utf8_valid((const unsigned char *)v->bytes, len, &bad);
        if (got != v->valid) {
            printf("  FAIL %s: expected %s\n", v->name, v->valid ? "valid" : "invalid");
            failures++;
        }
    }
    printf("[%s] utf8 self-test  %zu vectors, %d failures\n",
           failures ? "FAIL" : "PASS",
           sizeof vectors / sizeof vectors[0], failures);
    return failures ? 1 : 0;
}

int main(int argc, char **argv)
{
    if (argc >= 2 && strcmp(argv[1], "--self-test") == 0)
        return self_test();
    if (argc < 2) {
        fprintf(stderr, "usage: %s FILE... | --self-test\n", argv[0]);
        return 2;
    }
    int rc = 0;
    for (int i = 1; i < argc; i++) {
        int r = check_file(argv[i]);
        if (r > rc) rc = r;
    }
    return rc;
}
