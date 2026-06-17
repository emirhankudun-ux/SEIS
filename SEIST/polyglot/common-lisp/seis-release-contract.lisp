(defpackage :seis-release-contract
  (:use :cl)
  (:export :*package-path* :*supported-locales* :supports-locale-p))

(in-package :seis-release-contract)

(defparameter *package-path* "dist/seis-static.zip")
(defparameter *supported-locales* '("tr" "en" "fr" "it" "de" "es" "ar"))
(defparameter *reduced-motion-required* t)
(defparameter *live-upload-requires-target* t)

(defun supports-locale-p (locale)
  (member locale *supported-locales* :test #'string=))
