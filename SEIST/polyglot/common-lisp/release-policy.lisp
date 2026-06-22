(defpackage :seis-release-policy
  (:use :cl)
  (:export :*server-target-confirmed* :*reduced-motion-supported* :ready-for-upload))

(in-package :seis-release-policy)

(defparameter *server-target-confirmed* nil)
(defparameter *reduced-motion-supported* t)
(defparameter *minimum-evidence-items* 3)

(defun ready-for-upload (accessibility-reviewed rollback-planned)
  (and *server-target-confirmed* accessibility-reviewed rollback-planned))
