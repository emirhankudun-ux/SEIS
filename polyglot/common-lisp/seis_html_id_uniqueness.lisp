#!/usr/bin/env sbcl --script
; SEIS HTML id-attribute uniqueness checker — Common Lisp (SBCL) script.
;
; Reads apps/web/index.html and verifies every id="..." attribute value
; is unique. Duplicate IDs break getElementById, aria-labelledby,
; aria-describedby, and CSS :target selectors.
;
; Usage: sbcl --script polyglot/common-lisp/seis_html_id_uniqueness.lisp [--self-test]
; Exit:  0 PASS, 1 FAIL

;;; ─── helpers ─────────────────────────────────────────────────────────────────

(defun string-downcase-ascii (s)
  (string-downcase s))

;; Extract all id="..." attribute values from an HTML string.
;; Returns a list of strings (one per id= occurrence).
(defun extract-ids (html)
  (let ((lc-html (string-downcase-ascii html))
        (ids '())
        (pos 0)
        (target "id=\""))
    (loop
      (let ((found (search target lc-html :start2 pos)))
        (unless found (return))
        (let* ((val-start (+ found (length target)))
               (val-end   (position #\" lc-html :start val-start)))
          (when val-end
            (push (subseq html val-start val-end) ids))
          (setf pos (+ found 1)))))
    (nreverse ids)))

;; Find duplicate values in a list (return list of duplicated strings).
(defun find-duplicates (lst)
  (let ((seen (make-hash-table :test 'equal))
        (dups '()))
    (dolist (item lst)
      (if (gethash item seen)
          (pushnew item dups :test #'equal)
          (setf (gethash item seen) t)))
    (nreverse dups)))

;;; ─── self-tests ──────────────────────────────────────────────────────────────

(defun self-test ()
  (let ((pass  0)
        (total 0))
    (flet ((check (label ok)
             (incf total)
             (if ok
                 (incf pass)
                 (format t "  [FAIL] self-test: ~a~%" label))))

      (check "extract-ids finds one id"
        (equal (extract-ids "<div id=\"main\">") '("main")))

      (check "extract-ids finds two ids"
        (= (length (extract-ids "<div id=\"a\"><span id=\"b\">")) 2))

      (check "extract-ids empty for no ids"
        (null (extract-ids "<p>hello</p>")))

      (check "extract-ids case-insensitive key"
        (equal (extract-ids "<div ID=\"upper\">") '("upper")))

      (check "extract-ids ignores class= attributes"
        (null (extract-ids "<div class=\"foo\">")))

      (check "find-duplicates returns empty for unique list"
        (null (find-duplicates '("a" "b" "c"))))

      (check "find-duplicates finds one duplicate"
        (equal (find-duplicates '("a" "b" "a")) '("a")))

      (check "find-duplicates finds multiple duplicates"
        (= (length (find-duplicates '("a" "a" "b" "b"))) 2))

      (check "find-duplicates deduplicates result"
        (= (length (find-duplicates '("a" "a" "a"))) 1))

      (check "no duplicates in clean HTML"
        (null (find-duplicates (extract-ids "<div id=\"x\"><p id=\"y\"></p></div>"))))

      (check "detects duplicate in HTML"
        (not (null (find-duplicates (extract-ids "<div id=\"dup\"><p id=\"dup\"></p></div>"))))))

    (let ((passed (= pass total)))
      (format t "[~a] html-id-uniqueness  ~a/~a self-tests passed~%"
        (if passed "PASS" "FAIL") pass total)
      passed)))

;;; ─── main ────────────────────────────────────────────────────────────────────

(defparameter *default-html* "apps/web/index.html")

(defun main ()
  (let ((args (cdr sb-ext:*posix-argv*)))
    (when (member "--self-test" args :test #'equal)
      (sb-ext:exit :code (if (self-test) 0 1)))

    (let ((html-path *default-html*))
      (unless (probe-file html-path)
        (format t "[FAIL] html-id-uniqueness  ~a not found~%" html-path)
        (sb-ext:exit :code 1))

      (let* ((html    (with-open-file (stream html-path
                                       :direction :input
                                       :external-format :utf-8)
                        (let ((contents (make-string (file-length stream))))
                          (read-sequence contents stream)
                          contents)))
             (ids     (extract-ids html))
             (dups    (find-duplicates ids)))

        (format t "       ~a: ~a id attribute(s) checked~%" html-path (length ids))

        (if dups
            (progn
              (format t "[FAIL] html-id-uniqueness  ~a duplicate id(s) found:~%" (length dups))
              (dolist (d dups)
                (format t "       ~a~%" d))
              (sb-ext:exit :code 1))
            (progn
              (format t "[PASS] html-id-uniqueness  all ~a id(s) unique~%" (length ids))
              (sb-ext:exit :code 0)))))))

(main)
