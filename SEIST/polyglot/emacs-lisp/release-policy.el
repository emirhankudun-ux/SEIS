(defconst seis-server-target-confirmed nil)
(defconst seis-reduced-motion-supported t)
(defconst seis-minimum-evidence-items 3)

(defun seis-ready-for-upload (accessibility-reviewed rollback-planned)
  (and seis-server-target-confirmed accessibility-reviewed rollback-planned))

(provide 'seis-release-policy)
