object SeisReleaseContract {
  val packagePath: String = "dist/seis-static.zip"
  val locales: List[String] = List("tr", "en", "fr", "it", "de", "es", "ar")
  val reducedMotionRequired: Boolean = true
  val liveUploadRequiresTarget: Boolean = true

  def supportsLocale(locale: String): Boolean = locales.contains(locale)
}
