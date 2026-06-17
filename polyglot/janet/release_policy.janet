# SEIS Release Policy — Janet Language
# Motion policy and deploy gate using Janet's functional style

# ─── Motion Duration Table ────────────────────────────────────────────────
(def motion-durations
  {:instant   0
   :fast      150
   :standard  300
   :slow      500
   :cinematic 800})

# ─── Motion Duration Ms ───────────────────────────────────────────────────
(defn motion-duration-ms
  "Returns duration in ms for token; collapses to 0 in reduced modes."
  [token mode]
  (let [base (get motion-durations token 300)]
    (if (or (= mode :reduced) (= mode :manual-low))
      0
      base)))

# ─── Gate Status ──────────────────────────────────────────────────────────
(defn gate-status
  "Returns :ready if all checks pass, :blocked otherwise."
  [checks]
  (let [fail-count (length (filter (fn [c] (not (c :passed))) checks))]
    (if (= fail-count 0) :ready :blocked)))

# ─── Can Deploy ───────────────────────────────────────────────────────────
(defn can-deploy? [checks]
  (= :ready (gate-status checks)))

# ─── Status String ────────────────────────────────────────────────────────
(defn status-string [status]
  (case status
    :ready   "READY"
    :pending "PENDING"
    :blocked "BLOCKED"
    :draft   "DRAFT"
    "UNKNOWN"))

# ─── Mode String ──────────────────────────────────────────────────────────
(defn mode-string [mode]
  (case mode
    :reduced    "reduced"
    :manual-low "manual-low"
    "full"))

# ─── Print Gate Report ────────────────────────────────────────────────────
(defn print-gate-report [version mode checks]
  (let [status (gate-status checks)]
    (printf "SEIS Release Gate — %s" version)
    (print (string/repeat "-" 40))
    (printf "Status:       %s" (status-string status))
    (printf "Motion mode:  %s" (mode-string mode))
    (printf "Fast (ms):    %d" (motion-duration-ms :fast mode))
    (printf "Standard (ms):%d" (motion-duration-ms :standard mode))
    (print (string/repeat "-" 40))
    (each check checks
      (let [marker (if (check :passed) "PASS" "FAIL")]
        (printf "  [%s]  %s" marker (check :name))))
    (print (string/repeat "-" 40))
    (print (if (can-deploy? checks)
             "Deploy: AUTHORISED"
             "Deploy: BLOCKED"))))

# ─── Motion Duration Lookup (table form) ─────────────────────────────────
(defn resolve-durations [mode]
  "Returns a table of all resolved durations for a motion mode."
  {:instant   (motion-duration-ms :instant   mode)
   :fast      (motion-duration-ms :fast      mode)
   :standard  (motion-duration-ms :standard  mode)
   :slow      (motion-duration-ms :slow      mode)
   :cinematic (motion-duration-ms :cinematic mode)})

# ─── Main Execution ───────────────────────────────────────────────────────
(def checks
  [{:name "typecheck"          :passed true}
   {:name "lint"               :passed true}
   {:name "content validation" :passed true}
   {:name "accessibility"      :passed false}])

(def mode :full)

# Demonstrate duration resolution
(printf "standard/full:    %d" (motion-duration-ms :standard :full))
(printf "standard/reduced: %d" (motion-duration-ms :standard :reduced))
(printf "cinematic/full:   %d" (motion-duration-ms :cinematic :full))
(print "")

# Full report
(print-gate-report "v2.4.0" mode checks)

# Resolved durations table
(def durations-full    (resolve-durations :full))
(def durations-reduced (resolve-durations :reduced))
