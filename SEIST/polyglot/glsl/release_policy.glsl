const bool SEIS_SERVER_TARGET_CONFIRMED = false;
const bool SEIS_REDUCED_MOTION_SUPPORTED = true;
const int SEIS_MINIMUM_EVIDENCE_ITEMS = 3;

bool seisReadyForUpload(bool accessibilityReviewed, bool rollbackPlanned) {
  return SEIS_SERVER_TARGET_CONFIRMED && accessibilityReviewed && rollbackPlanned;
}
