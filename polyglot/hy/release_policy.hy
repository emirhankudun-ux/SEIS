;; SEIS Release Policy — Hy (Lisp on Python)
;; Motion policy and deploy gate using Hy's Python-hosted Lisp syntax

(import os)
(import typing [Optional])

;; ─── Motion Duration Table ────────────────────────────────────────────────
(setv MOTION-DURATIONS
  {"instant"   0
   "fast"      150
   "standard"  300
   "slow"      500
   "cinematic" 800})

;; ─── Motion Duration Ms ───────────────────────────────────────────────────
(defn motion-duration-ms [token mode]
  "Returns duration in ms for token; collapses to 0 in reduced modes."
  (setv base (.get MOTION-DURATIONS token 300))
  (if (or (= mode "reduced") (= mode "manual-low"))
    0
    base))

;; ─── Resolve Motion Mode ─────────────────────────────────────────────────
(defn resolve-motion-mode []
  "Reads SEIS_MOTION_MODE env var or defaults to full."
  (or (.get os.environ "SEIS_MOTION_MODE") "full"))

;; ─── Gate Status ──────────────────────────────────────────────────────────
(defn gate-status [checks]
  "Returns 'ready' if all checks pass, 'blocked' otherwise."
  (setv fail-count
    (len (lfor c checks :if (not (get c "passed")) c)))
  (if (= fail-count 0) "ready" "blocked"))

;; ─── Can Deploy ───────────────────────────────────────────────────────────
(defn can-deploy? [checks]
  (= "ready" (gate-status checks)))

;; ─── Status String ────────────────────────────────────────────────────────
(defn status-string [status]
  (cond
    (= status "ready")   "READY"
    (= status "pending") "PENDING"
    (= status "blocked") "BLOCKED"
    (= status "draft")   "DRAFT"
    True                 "UNKNOWN"))

;; ─── Mode String ──────────────────────────────────────────────────────────
(defn mode-string [mode]
  (cond
    (= mode "reduced")    "reduced"
    (= mode "manual-low") "manual-low"
    True                  "full"))

;; ─── Resolve All Durations ────────────────────────────────────────────────
(defn resolve-durations [mode]
  "Returns dict of all motion durations for the given mode."
  {k (motion-duration-ms k mode)
   for k (.keys MOTION-DURATIONS)})

;; ─── Print Gate Report ────────────────────────────────────────────────────
(defn print-gate-report [version mode checks]
  (setv status (gate-status checks))
  (print f"SEIS Release Gate — {version}")
  (print (* "-" 40))
  (print f"Status:       {(status-string status)}")
  (print f"Motion mode:  {(mode-string mode)}")
  (print f"Fast (ms):    {(motion-duration-ms "fast" mode)}")
  (print f"Standard (ms):{(motion-duration-ms "standard" mode)}")
  (print (* "-" 40))
  (for [check checks]
    (setv marker (if (get check "passed") "PASS" "FAIL"))
    (print f"  [{marker}]  {(get check "name")}"))
  (print (* "-" 40))
  (print (if (can-deploy? checks)
           "Deploy: AUTHORISED"
           "Deploy: BLOCKED")))

;; ─── Main Execution ───────────────────────────────────────────────────────
(setv checks
  [{"name" "typecheck"          "passed" True}
   {"name" "lint"               "passed" True}
   {"name" "content validation" "passed" True}
   {"name" "accessibility"      "passed" False}])

(setv mode (resolve-motion-mode))

;; Demonstrate duration resolution
(print f"standard/full:    {(motion-duration-ms "standard" "full")}")
(print f"standard/reduced: {(motion-duration-ms "standard" "reduced")}")
(print "")

;; Full report
(print-gate-report "v2.4.0" mode checks)
