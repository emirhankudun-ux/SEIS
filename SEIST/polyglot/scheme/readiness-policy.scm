(define seis-readiness-policy
  '((reduced-motion-required . #t)
    (dependency-budget-locked . #t)
    (live-upload-requires-target . #t)))

(define (seis-ready? policy)
  (and (cdr (assoc 'reduced-motion-required policy))
       (cdr (assoc 'dependency-budget-locked policy))
       (cdr (assoc 'live-upload-requires-target policy))))
