(ns readiness-policy)

(def policy
  {:reduced-motion-required true
   :dependency-budget-locked true
   :live-upload-requires-target true})

(defn ready? [value]
  (and (:reduced-motion-required value)
       (:dependency-budget-locked value)
       (:live-upload-requires-target value)))
