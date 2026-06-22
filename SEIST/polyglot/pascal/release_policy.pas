unit ReleasePolicy;

interface

const
  ServerTargetConfirmed = False;
  ReducedMotionSupported = True;
  MinimumEvidenceItems = 3;

function ReadyForUpload(AccessibilityReviewed: Boolean; RollbackPlanned: Boolean): Boolean;

implementation

function ReadyForUpload(AccessibilityReviewed: Boolean; RollbackPlanned: Boolean): Boolean;
begin
  ReadyForUpload := ServerTargetConfirmed and AccessibilityReviewed and RollbackPlanned;
end;

end.
