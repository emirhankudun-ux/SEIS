unit SeisMotionPolicy;

interface

type
  TSeisMotionPolicy = record
    SupportsReducedMotion: Boolean;
    MobileParticleLimit: Integer;
    DesktopParticleLimit: Integer;
    ContinuousSceneLimit: Integer;
  end;

const
  FoundationMotionPolicy: TSeisMotionPolicy = (
    SupportsReducedMotion: True;
    MobileParticleLimit: 24;
    DesktopParticleLimit: 64;
    ContinuousSceneLimit: 1
  );

implementation

end.
