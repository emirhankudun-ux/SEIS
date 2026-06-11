#!/usr/bin/env racket
#lang racket
; SEIS PWA manifest deep auditor — Racket script.
;
; Reads apps/web/manifest.json and performs structural validation:
;   • display  — must be fullscreen | standalone | minimal-ui | browser
;   • theme_color / background_color — must be valid CSS hex (#RGB or #RRGGBB)
;   • icons — must be non-empty; each icon must have src and sizes
;   • PWA installability — icons array must include 192×192 and 512×512 sizes
;
; Uses Racket's built-in json library (no external deps).
;
; Usage: racket polyglot/racket/seis_pwa_manifest_audit.rkt [--self-test]
; Exit:  0 PASS, 1 FAIL

(require json
         racket/string
         racket/port)

(define DEFAULT_MANIFEST "apps/web/manifest.json")
(define VALID_DISPLAY_MODES '("fullscreen" "standalone" "minimal-ui" "browser"))
(define REQUIRED_ICON_SIZES '("192x192" "512x512"))

; ─── validators ────────────────────────────────────────────────────────────────

(define hex-color-re #px"^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$")

(define (valid-hex-color? s)
  (and (string? s) (regexp-match? hex-color-re s)))

(define (check-display manifest)
  (define d (hash-ref manifest 'display #f))
  (cond
    [(not d)                              "display field missing"]
    [(not (member d VALID_DISPLAY_MODES)) (format "display '~a' invalid; must be one of: ~a"
                                            d (string-join VALID_DISPLAY_MODES ", "))]
    [else                                 #f]))

(define (check-color manifest key)
  (define val (hash-ref manifest key #f))
  (cond
    [(not val)               (format "~a field missing" key)]
    [(not (valid-hex-color? (format "~a" val)))
                             (format "~a '~a' is not a valid CSS hex color" key val)]
    [else                    #f]))

(define (check-icons manifest)
  (define icons (hash-ref manifest 'icons #f))
  (cond
    [(not icons)           "icons field missing"]
    [(null? icons)         "icons array is empty"]
    [else
     (define icon-failures
       (append-map
        (lambda (icon)
          (define errs '())
          (unless (hash-ref icon 'src #f)
            (set! errs (cons "icon missing src" errs)))
          (unless (hash-ref icon 'sizes #f)
            (set! errs (cons "icon missing sizes" errs)))
          errs)
        icons))
     (define found-sizes
       (map (lambda (icon) (hash-ref icon 'sizes ""))
            (filter (lambda (i) (hash-ref i 'sizes #f)) icons)))
     (define missing-sizes
       (filter (lambda (sz) (not (member sz found-sizes))) REQUIRED_ICON_SIZES))
     (define size-failures
       (map (lambda (sz) (format "no icon with sizes=~a (required for PWA installability)" sz))
            missing-sizes))
     (cond
       [(not (null? icon-failures)) (string-join icon-failures "; ")]
       [(not (null? size-failures)) (string-join size-failures "; ")]
       [else #f])]))

; ─── self-tests ────────────────────────────────────────────────────────────────

(define (self-test)
  (define pass  0)
  (define total 0)
  (define (check label ok)
    (set! total (+ total 1))
    (if ok
        (set! pass (+ pass 1))
        (printf "  [FAIL] self-test: ~a\n" label)))

  (check "valid-hex-color? #RGB"       (valid-hex-color? "#abc"))
  (check "valid-hex-color? #RRGGBB"    (valid-hex-color? "#0a0a0a"))
  (check "valid-hex-color? #RRGGBBAA"  (valid-hex-color? "#c8a96eff"))
  (check "valid-hex-color? false for bare name" (not (valid-hex-color? "red")))
  (check "valid-hex-color? false for empty"     (not (valid-hex-color? "")))

  (define good-manifest
    (hasheq 'display "standalone"
            'theme_color "#c8a96e"
            'background_color "#0a0a0a"
            'icons (list (hasheq 'src "icon-192.png" 'sizes "192x192" 'type "image/png")
                         (hasheq 'src "icon-512.png" 'sizes "512x512" 'type "image/png"))))

  (check "check-display passes standalone"  (not (check-display good-manifest)))
  (check "check-display detects missing"    (string? (check-display (hash-remove good-manifest 'display))))
  (check "check-display detects invalid"
    (string? (check-display (hash-set good-manifest 'display "fullscreen-pwa"))))

  (check "check-color theme_color passes"   (not (check-color good-manifest 'theme_color)))
  (check "check-color detects bad color"
    (string? (check-color (hash-set good-manifest 'theme_color "blue") 'theme_color)))

  (check "check-icons passes good icons"    (not (check-icons good-manifest)))
  (check "check-icons detects empty array"  (string? (check-icons (hash-set good-manifest 'icons '()))))
  (check "check-icons detects missing 512"
    (string? (check-icons (hash-set good-manifest 'icons
                            (list (hasheq 'src "icon-192.png" 'sizes "192x192"))))))

  (let ((passed (= pass total)))
    (printf "[~a] pwa-manifest-audit  ~a/~a self-tests passed\n"
      (if passed "PASS" "FAIL") pass total)
    passed))

; ─── main ──────────────────────────────────────────────────────────────────────

(define cmdargs (vector->list (current-command-line-arguments)))

(when (member "--self-test" cmdargs)
  (exit (if (self-test) 0 1)))

(define manifest-path DEFAULT_MANIFEST)

(unless (file-exists? manifest-path)
  (printf "[FAIL] pwa-manifest-audit  ~a not found\n" manifest-path)
  (exit 1))

(define manifest
  (with-handlers ([exn:fail? (lambda (e)
                    (printf "[FAIL] pwa-manifest-audit  JSON parse error: ~a\n"
                      (exn-message e))
                    (exit 1))])
    (call-with-input-file manifest-path read-json)))

(printf "       ~a: validating PWA manifest\n" manifest-path)

(define failures
  (filter string?
    (list (check-display manifest)
          (check-color manifest 'theme_color)
          (check-color manifest 'background_color)
          (check-icons manifest))))

(if (null? failures)
    (begin
      (printf "[PASS] pwa-manifest-audit  display/colors/icons all valid\n")
      (exit 0))
    (begin
      (printf "[FAIL] pwa-manifest-audit  ~a issue(s):\n" (length failures))
      (for-each (lambda (f) (printf "       ~a\n" f)) failures)
      (exit 1)))
