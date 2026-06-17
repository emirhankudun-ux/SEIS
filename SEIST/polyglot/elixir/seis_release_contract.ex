defmodule SeisReleaseContract do
  @package "dist/seis-static.zip"
  @locales ["tr", "en", "fr", "it", "de", "es", "ar"]

  def package, do: @package
  def locales, do: @locales
  def supports_locale?(locale), do: locale in @locales
  def live_upload_status(nil), do: :blocked_until_target_confirmed
  def live_upload_status(_target), do: :ready_for_configured_target
end
