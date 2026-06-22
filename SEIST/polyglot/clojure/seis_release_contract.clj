(ns seis-release-contract)

(def package-path "dist/seis-static.zip")
(def supported-locales #{"tr" "en" "fr" "it" "de" "es" "ar"})
(def reduced-motion-required true)
(def live-upload-requires-target true)

(defn supports-locale? [locale]
  (contains? supported-locales locale))
