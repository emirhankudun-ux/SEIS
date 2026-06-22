<?hh

final class SeisReleaseContract {
  const bool REQUIRES_CONFIRMED_TARGET = true;
  const bool SUPPORTS_REDUCED_MOTION = true;
  const int MINIMUM_EVIDENCE_ITEMS = 3;

  public static function readyForUpload(
    bool $targetConfirmed,
    bool $accessibilityReviewed,
    bool $rollbackPlanned,
  ): bool {
    return $targetConfirmed && $accessibilityReviewed && $rollbackPlanned;
  }
}
