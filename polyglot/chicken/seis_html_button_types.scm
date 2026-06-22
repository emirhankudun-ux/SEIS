#!/usr/bin/env csi -script
; SEIS HTML button type auditor -- Chicken Scheme script.
;
; Reads apps/web/index.html and checks every <button> tag:
;   * Buttons INSIDE a <form> block MUST have an explicit type= attribute.
;     Without it, browsers default to type="submit", causing accidental form
;     submissions when the user presses Enter anywhere in the form.
;   * Advisory (not fail) for buttons outside forms with no explicit type.
;
; Usage: csi -script polyglot/chicken/seis_html_button_types.scm [--self-test]
; Exit:  0 PASS, 1 FAIL

(import (chicken process-context)
        (chicken file)
        (chicken io))

; ---- helpers ------------------------------------------------------------------

; Manual string-downcase using char-downcase (SRFI 13 not available by default).
(define (string-downcase s)
  (list->string (map char-downcase (string->list s))))

; Manual filter (SRFI 1 not available by default).
(define (filter pred lst)
  (cond
    ((null? lst) '())
    ((pred (car lst)) (cons (car lst) (filter pred (cdr lst))))
    (else (filter pred (cdr lst)))))

; True if haystack contains needle (case-insensitive).
(define (string-contains-ci? haystack needle)
  (let ((lc-haystack (string-downcase haystack))
        (lc-needle   (string-downcase needle)))
    (let loop ((i 0))
      (cond
        ((> (+ i (string-length lc-needle)) (string-length lc-haystack)) #f)
        ((string=? (substring lc-haystack i (+ i (string-length lc-needle))) lc-needle) #t)
        (else (loop (+ i 1)))))))

; Extract all <button ...> opening tags from HTML.
; Returns a list of strings.
(define (extract-button-tags html)
  (let ((lc (string-downcase html)))
    (let loop ((pos 0) (acc '()))
      (let ((start (let scan ((i pos))
                     (cond
                       ((> (+ i 7) (string-length lc)) #f)
                       ((string=? (substring lc i (+ i 7)) "<button") i)
                       (else (scan (+ i 1)))))))
        (if (not start)
            (reverse acc)
            ; find closing >
            (let ((end (let find-gt ((i (+ start 1)))
                         (cond
                           ((>= i (string-length html)) #f)
                           ((char=? (string-ref html i) #\>) i)
                           (else (find-gt (+ i 1)))))))
              (if (not end)
                  (reverse acc)
                  (let ((tag (substring html start (+ end 1))))
                    (loop (+ start 1) (cons tag acc))))))))))

; True if a button tag has a type= attribute.
(define (has-type? tag)
  (string-contains-ci? tag "type="))

; True if the tag looks like it came from inside a form context.
; We simulate this by checking the raw HTML for form wrapping.
; Returns list of (button-tag . in-form?) pairs.
(define (annotate-buttons html)
  (let ((lc (string-downcase html)))
    ; Find position of each button tag in original html
    (let loop ((pos 0) (acc '()))
      (let ((start (let scan ((i pos))
                     (cond
                       ((> (+ i 7) (string-length lc)) #f)
                       ((string=? (substring lc i (+ i 7)) "<button") i)
                       (else (scan (+ i 1)))))))
        (if (not start)
            (reverse acc)
            (let ((end (let find-gt ((i (+ start 1)))
                         (cond
                           ((>= i (string-length html)) #f)
                           ((char=? (string-ref html i) #\>) i)
                           (else (find-gt (+ i 1)))))))
              (if (not end)
                  (reverse acc)
                  (let* ((tag (substring html start (+ end 1)))
                         ; Check if there's an open <form before this position
                         ; and no </form> between it and our button
                         (before (substring lc 0 start))
                         ; Find last <form occurrence before button
                         (last-form (let find-last ((i (- (string-length before) 5)) (found -1))
                                      (cond
                                        ((< i 0) found)
                                        ((and (>= (+ i 5) 0)
                                              (>= (string-length before) (+ i 5))
                                              (string=? (substring before i (+ i 5)) "<form")) i)
                                        (else (find-last (- i 1) found)))))
                         ; Find last </form> occurrence before button
                         (last-close-form (let find-last ((i (- (string-length before) 7)) (found -1))
                                            (cond
                                              ((< i 0) found)
                                              ((and (>= (string-length before) (+ i 7))
                                                    (string=? (substring before i (+ i 7)) "</form>")) i)
                                              (else (find-last (- i 1) found)))))
                         (in-form? (and (>= last-form 0) (> last-form last-close-form))))
                    (loop (+ start 1) (cons (cons tag in-form?) acc))))))))))

; ---- self-tests ---------------------------------------------------------------

(define (self-test)
  (let ((pass  0)
        (total 0))
    (define (check label ok)
      (set! total (+ total 1))
      (if ok
          (set! pass (+ pass 1))
          (begin (display (string-append "  [FAIL] self-test: " label)) (newline))))

    (check "extract-button-tags finds one button"
      (= (length (extract-button-tags "<button type=\"button\">x</button>")) 1))

    (check "extract-button-tags finds two buttons"
      (= (length (extract-button-tags "<button>a</button><button type=\"submit\">b</button>")) 2))

    (check "extract-button-tags empty for no buttons"
      (= (length (extract-button-tags "<p>hello</p>")) 0))

    (check "has-type? true for type=button"
      (has-type? "<button type=\"button\">"))

    (check "has-type? true for type=submit"
      (has-type? "<button type=\"submit\">"))

    (check "has-type? false when missing"
      (not (has-type? "<button class=\"foo\">")))

    (check "has-type? case-insensitive"
      (has-type? "<BUTTON TYPE=\"button\">"))

    (check "in-form? true for button after form"
      (let ((pairs (annotate-buttons "<form><button class=\"x\"></button></form>")))
        (and (not (null? pairs)) (cdar pairs))))

    (check "in-form? false for button outside form"
      (let ((pairs (annotate-buttons "<button class=\"x\"></button>")))
        (and (not (null? pairs)) (not (cdar pairs)))))

    (check "in-form? false for button after closed form"
      (let ((pairs (annotate-buttons "<form></form><button class=\"x\"></button>")))
        (and (not (null? pairs)) (not (cdar pairs)))))

    (check "string-contains-ci? case-insensitive match"
      (string-contains-ci? "TYPE=\"submit\"" "type="))

    (let ((passed (= pass total)))
      (display (string-append
        "[" (if passed "PASS" "FAIL") "] html-button-types  "
        (number->string pass) "/" (number->string total) " self-tests passed"))
      (newline)
      passed)))

; ---- main ---------------------------------------------------------------------

(define default-html "apps/web/index.html")

(define (main args)
  (when (member "--self-test" args)
    (exit (if (self-test) 0 1)))

  (unless (file-exists? default-html)
    (display (string-append "[FAIL] html-button-types  " default-html " not found"))
    (newline)
    (exit 1))

  (let* ((port    (open-input-file default-html))
         (html    (read-string #f port))
         (_ (close-input-port port))
         (pairs   (annotate-buttons html))
         (total   (length pairs))
         (in-form (filter cdr pairs))
         (bad     (filter (lambda (p) (and (cdr p) (not (has-type? (car p))))) pairs)))

    (display (string-append "       " default-html ": " (number->string total)
      " button(s) found, " (number->string (length in-form)) " in form context"))
    (newline)

    (if (null? bad)
        (begin
          (display (string-append "[PASS] html-button-types  all form button(s) have explicit type"))
          (newline)
          (exit 0))
        (begin
          (display (string-append "[FAIL] html-button-types  "
            (number->string (length bad)) " form button(s) missing type= attribute:"))
          (newline)
          (for-each (lambda (p)
            (display (string-append "       " (substring (car p) 0 (min 80 (string-length (car p)))) "..."))
            (newline)) bad)
          (exit 1)))))

(main (command-line-arguments))
