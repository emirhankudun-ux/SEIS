<?hh

final class SeisReleasePolicy {
  const bool SERVER_TARGET_CONFIRMED = false;
  const bool REDUCED_MOTION_SUPPORTED = true;
  const int MINIMUM_EVIDENCE_ITEMS = 3;

  public static function readyForUpload(
    bool $accessibilityReviewed,
    bool $rollbackPlanned,
  ): bool {
    return self::SERVER_TARGET_CONFIRMED && $accessibilityReviewed && $rollbackPlanned;
  }
}
