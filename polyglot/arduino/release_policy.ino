// SEIS Release Policy — Arduino Sketch

enum MotionMode   { CINEMATIC, BALANCED, REDUCED };
enum ReleaseStatus{ READY, BLOCKED, PENDING };

const int MOTION_DURATIONS[] = { 800, 300, 0 };

MotionMode resolveMotionMode(MotionMode requested, bool prefersReduced) {
  return prefersReduced ? REDUCED : requested;
}

bool canDeploy(ReleaseStatus status) {
  return status == READY;
}

void setup() {
  Serial.begin(9600);

  MotionMode mode   = resolveMotionMode(CINEMATIC, true);
  int        dur    = MOTION_DURATIONS[mode];
  bool       deploy = canDeploy(READY);

  Serial.print("Motion mode: ");
  Serial.println(mode == REDUCED ? "reduced" : mode == BALANCED ? "balanced" : "cinematic");
  Serial.print("Duration ms: ");
  Serial.println(dur);
  Serial.print("Can deploy:  ");
  Serial.println(deploy ? "yes" : "no");
}

void loop() {
  // Nothing to loop — this is a one-shot readiness check
}
