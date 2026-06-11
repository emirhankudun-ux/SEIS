#!/usr/bin/env guile
!#
; SEIS HTML hreflang auditor — GNU Guile script.
;
; Reads apps/web/index.html and validates hreflang link tags:
;   • All 5 site locales (tr, en, fr, it, de) must have an alternate link
;   • x-default alternate must be present
;   • All href values must use https://
;   • No duplicate hreflang values
;
; Usage: guile polyglot/guile/seis_hreflang_audit.scm [--self-test]
; Exit:  0 PASS, 1 FAIL

(use-modules (ice-9 regex)
             (ice-9 rdelim)
             (srfi srfi-1)
             (srfi srfi-13))

(define default-html "apps/web/index.html")
(define expected-locales '("tr" "en" "fr" "it" "de" "x-default"))

; Read entire file as a string.
(define (file->string path)
  (call-with-input-file path
    (lambda (port) (read-delimited "" port))))

; Extract (hreflang href) pairs from HTML.
; Finds every <link ...> tag containing hreflang= and href=.
(define (extract-hreflang-entries html)
  (let* ((lc-html  (string-downcase html))
         (tag-re   (make-regexp "<link[^>]+hreflang=[^>]+>" regexp/icase))
         (hl-re    (make-regexp "hreflang=[\"']([^\"']+)[\"']" regexp/icase))
         (href-re  (make-regexp "href=[\"']([^\"']+)[\"']" regexp/icase)))
    (let loop ((pos 0) (acc '()))
      (let ((m (regexp-exec tag-re lc-html pos)))
        (if (not m)
            (reverse acc)
            (let* ((start   (match:start m))
                   (end     (match:end m))
                   (lc-tag  (substring lc-html start end))
                   (hl-m    (regexp-exec hl-re lc-tag))
                   (href-m  (regexp-exec href-re lc-tag))
                   (hreflang (and hl-m (match:substring hl-m 1)))
                   (href     (and href-m (match:substring href-m 1))))
              (loop (+ start 1)
                    (if hreflang
                        (cons (list hreflang (or href "")) acc)
                        acc))))))))

; Return locales missing from entries.
(define (missing-locales entries)
  (let ((found (map car entries)))
    (filter (lambda (loc) (not (member loc found))) expected-locales)))

; Return duplicate hreflang values.
(define (duplicate-hreflangs entries)
  (let ((langs (map car entries)))
    (filter (lambda (lang)
      (> (count (lambda (l) (string=? l lang)) langs) 1))
      (delete-duplicates langs))))

; Return entries whose href doesn't start with https://.
(define (non-https-entries entries)
  (filter (lambda (e)
    (and (not (string-null? (cadr e)))
         (not (string-prefix? "https://" (cadr e)))))
    entries))

; ─── self-tests ────────────────────────────────────────────────────────────────

(define (self-test)
  (define pass  0)
  (define total 0)
  (define (check label ok)
    (set! total (+ total 1))
    (if ok
        (set! pass (+ pass 1))
        (format #t "  [FAIL] self-test: ~a\n" label)))

  (define sample
    (string-append
     "<link rel=\"alternate\" hreflang=\"tr\" href=\"https://ex.com/\">"
     "<link rel=\"alternate\" hreflang=\"en\" href=\"https://ex.com/en/\">"
     "<link rel=\"alternate\" hreflang=\"x-default\" href=\"https://ex.com/\">"))

  (check "extract finds 3 entries"
    (= (length (extract-hreflang-entries sample)) 3))

  (check "extract finds tr locale"
    (member "tr" (map car (extract-hreflang-entries sample))))

  (check "extract finds x-default"
    (member "x-default" (map car (extract-hreflang-entries sample))))

  (check "extract from empty string returns empty list"
    (null? (extract-hreflang-entries "")))

  (define full
    (string-append
     "<link rel=\"alternate\" hreflang=\"tr\" href=\"https://ex.com/\">"
     "<link rel=\"alternate\" hreflang=\"en\" href=\"https://ex.com/en/\">"
     "<link rel=\"alternate\" hreflang=\"fr\" href=\"https://ex.com/fr/\">"
     "<link rel=\"alternate\" hreflang=\"it\" href=\"https://ex.com/it/\">"
     "<link rel=\"alternate\" hreflang=\"de\" href=\"https://ex.com/de/\">"
     "<link rel=\"alternate\" hreflang=\"x-default\" href=\"https://ex.com/\">"))

  (check "missing-locales empty for complete set"
    (null? (missing-locales (extract-hreflang-entries full))))

  (check "missing-locales detects missing fr/it/de"
    (> (length (missing-locales (extract-hreflang-entries sample))) 0))

  (define dup
    (string-append
     "<link rel=\"alternate\" hreflang=\"en\" href=\"https://ex.com/en/\">"
     "<link rel=\"alternate\" hreflang=\"en\" href=\"https://ex.com/en2/\">"))

  (check "duplicate-hreflangs detects en repeated"
    (> (length (duplicate-hreflangs (extract-hreflang-entries dup))) 0))

  (check "duplicate-hreflangs empty for unique set"
    (null? (duplicate-hreflangs (extract-hreflang-entries full))))

  (define http-link
    "<link rel=\"alternate\" hreflang=\"tr\" href=\"http://ex.com/\">")

  (check "non-https-entries detects http link"
    (> (length (non-https-entries (extract-hreflang-entries http-link))) 0))

  (check "non-https-entries empty for https links"
    (null? (non-https-entries (extract-hreflang-entries full))))

  (check "non-https-entries ignores empty href"
    (null? (non-https-entries (list (list "en" "")))))

  (let ((passed (= pass total)))
    (format #t "[~a] html-hreflang-audit  ~a/~a self-tests passed\n"
      (if passed "PASS" "FAIL") pass total)
    passed))

; ─── main ──────────────────────────────────────────────────────────────────────

(define cmdargs (command-line))

(when (member "--self-test" cmdargs)
  (exit (if (self-test) 0 1)))

(define html-path default-html)

(unless (file-exists? html-path)
  (format #t "[FAIL] html-hreflang-audit  ~a not found\n" html-path)
  (exit 1))

(define html (file->string html-path))
(define entries (extract-hreflang-entries html))

(format #t "       ~a: ~a hreflang link(s) found\n" html-path (length entries))

(define failures '())

(for-each (lambda (loc)
  (set! failures (cons (format #f "missing locale: ~a" loc) failures)))
  (missing-locales entries))

(for-each (lambda (lang)
  (set! failures (cons (format #f "duplicate hreflang: ~a" lang) failures)))
  (duplicate-hreflangs entries))

(for-each (lambda (e)
  (set! failures (cons (format #f "non-https href for hreflang=~a: ~a" (car e) (cadr e)) failures)))
  (non-https-entries entries))

(if (null? failures)
    (begin
      (format #t "[PASS] html-hreflang-audit  all ~a hreflang(s) valid\n" (length entries))
      (exit 0))
    (begin
      (format #t "[FAIL] html-hreflang-audit  ~a issue(s):\n" (length failures))
      (for-each (lambda (f) (format #t "       ~a\n" f)) (reverse failures))
      (exit 1)))
