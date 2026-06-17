#lang racket

(provide readiness-policy ready?)

(define readiness-policy
  (hash 'reduced-motion-required #t
        'dependency-budget-locked #t
        'live-upload-requires-target #t))

(define (ready? policy)
  (and (hash-ref policy 'reduced-motion-required #f)
       (hash-ref policy 'dependency-budget-locked #f)
       (hash-ref policy 'live-upload-requires-target #f)))
