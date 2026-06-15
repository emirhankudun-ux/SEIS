unit SeisReleasePolicy;

{$APPTYPE CONSOLE}

interface

type
  TMotionMode = (mmCinematic, mmBalanced, mmReducedMotion);
  TReleaseStatus = (rsReady, rsBlocked, rsPending);

function ResolveMotionMode(Requested: TMotionMode; PrefersReduced: Boolean): TMotionMode;
function CanDeploy(Status: TReleaseStatus): Boolean;
function MotionDurationMs(Mode: TMotionMode): Integer;

implementation

function ResolveMotionMode(Requested: TMotionMode; PrefersReduced: Boolean): TMotionMode;
begin
  if PrefersReduced then
    Result := mmReducedMotion
  else
    Result := Requested;
end;

function CanDeploy(Status: TReleaseStatus): Boolean;
begin
  Result := Status = rsReady;
end;

function MotionDurationMs(Mode: TMotionMode): Integer;
begin
  case Mode of
    mmCinematic:     Result := 600;
    mmBalanced:      Result := 300;
    mmReducedMotion: Result := 0;
  else
    Result := 0;
  end;
end;

var
  ResolvedMode: TMotionMode;
begin
  ResolvedMode := ResolveMotionMode(mmCinematic, True);
  Writeln('Resolved mode duration: ', MotionDurationMs(ResolvedMode), 'ms');
  Writeln('Can deploy: ', CanDeploy(rsReady));
end.
