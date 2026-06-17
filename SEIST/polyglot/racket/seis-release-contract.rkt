#lang racket

(provide package-path supported-locales reduced-motion-required? live-upload-requires-target?)

(define package-path "dist/seis-static.zip")
(define supported-locales '("tr" "en" "fr" "it" "de" "es" "ar"))
(define reduced-motion-required? #t)
(define live-upload-requires-target? #t)
