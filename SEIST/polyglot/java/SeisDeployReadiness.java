public final class SeisDeployReadiness {
  private SeisDeployReadiness() {}

  public static boolean canUpload(String activeTarget, String confirmedPath, boolean packageHasManifest) {
    return packageHasManifest
      && activeTarget != null
      && !activeTarget.isBlank()
      && confirmedPath != null
      && !confirmedPath.isBlank();
  }

  public static String status(String activeTarget) {
    return activeTarget == null || activeTarget.isBlank()
      ? "blocked_until_server_target_is_confirmed"
      : "ready_for_provider_adapter";
  }
}
