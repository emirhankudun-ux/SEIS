;; SEIS Release Policy — Fennel (Lisp for Lua)
;; Motion policy and deploy gate using Fennel's macro-enhanced Lisp syntax

;; ─── Motion Duration Table ────────────────────────────────────────────────
(local motion-durations
  {:instant   0
   :fast      150
   :standard  300
   :slow      500
   :cinematic 800})

;; ─── Motion Duration Ms ───────────────────────────────────────────────────
(fn motion-duration-ms [token mode]
  "Returns duration in ms for token; collapses to 0 in reduced modes."
  (let [base (or (. motion-durations token) 300)]
    (if (or (= mode :reduced) (= mode :manual-low))
      0
      base)))

;; ─── Gate Status ──────────────────────────────────────────────────────────
(fn gate-status [checks]
  "Returns :ready if all checks pass, :blocked otherwise."
  (let [fail-count (accumulate [n 0 _ c (ipairs checks)]
                    (if (not c.passed) (+ n 1) n))]
    (if (= fail-count 0) :ready :blocked)))

;; ─── Can Deploy ───────────────────────────────────────────────────────────
(fn can-deploy? [checks]
  (= :ready (gate-status checks)))

;; ─── Mode String ──────────────────────────────────────────────────────────
(fn mode-string [mode]
  (match mode
    :reduced   "reduced"
    :manual-low "manual-low"
    _ "full"))

;; ─── Status String ────────────────────────────────────────────────────────
(fn status-string [status]
  (match status
    :ready   "READY"
    :pending "PENDING"
    :blocked "BLOCKED"
    :draft   "DRAFT"
    _ "UNKNOWN"))

;; ─── Print Gate Report ────────────────────────────────────────────────────
(fn print-gate-report [version mode checks]
  (let [status (gate-status checks)]
    (print (.. "SEIS Release Gate — " version))
    (print (string.rep "-" 40))
    (print (.. "Status:       " (status-string status)))
    (print (.. "Motion mode:  " (mode-string mode)))
    (print (.. "Fast (ms):    " (tostring (motion-duration-ms :fast mode))))
    (print (.. "Standard (ms):" (tostring (motion-duration-ms :standard mode))))
    (print (string.rep "-" 40))
    (each [_ check (ipairs checks)]
      (let [marker (if check.passed "PASS" "FAIL")]
        (print (.. "  [" marker "]  " check.name))))
    (print (string.rep "-" 40))
    (print (if (can-deploy? checks)
             "Deploy: AUTHORISED"
             "Deploy: BLOCKED"))))

;; ─── Main Execution ───────────────────────────────────────────────────────
(local checks
  [{:name "typecheck"          :passed true}
   {:name "lint"               :passed true}
   {:name "content validation" :passed true}
   {:name "accessibility"      :passed false}])

(local mode :full)

;; Demonstrate duration resolution
(print (.. "standard/full:    " (tostring (motion-duration-ms :standard :full))))
(print (.. "standard/reduced: " (tostring (motion-duration-ms :standard :reduced))))
(print "")

;; Full report
(print-gate-report "v2.4.0" mode checks)
