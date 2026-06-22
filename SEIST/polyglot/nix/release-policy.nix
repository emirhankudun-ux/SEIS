{
  serverTargetConfirmed ? false,
  reducedMotionSupported ? true,
  minimumEvidenceItems ? 3
}:

{
  readyForUpload = serverTargetConfirmed && reducedMotionSupported && minimumEvidenceItems >= 3;
  policy = {
    inherit serverTargetConfirmed reducedMotionSupported minimumEvidenceItems;
  };
}
