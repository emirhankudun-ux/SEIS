const bool SEIS_SUPPORTS_REDUCED_MOTION = true;
const int SEIS_MOBILE_PARTICLE_LIMIT = 24;
const int SEIS_DESKTOP_PARTICLE_LIMIT = 64;

bool seisSceneWithinBudget(int particleCount, bool mobileViewport) {
  int limit = mobileViewport ? SEIS_MOBILE_PARTICLE_LIMIT : SEIS_DESKTOP_PARTICLE_LIMIT;
  return particleCount <= limit;
}
