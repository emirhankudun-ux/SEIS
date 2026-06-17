const SEIS_SUPPORTS_REDUCED_MOTION: bool = true;
const SEIS_MOBILE_PARTICLE_LIMIT: i32 = 24;
const SEIS_DESKTOP_PARTICLE_LIMIT: i32 = 64;

fn seis_scene_within_budget(particle_count: i32, mobile_viewport: bool) -> bool {
  let limit = select(SEIS_DESKTOP_PARTICLE_LIMIT, SEIS_MOBILE_PARTICLE_LIMIT, mobile_viewport);
  return particle_count <= limit;
}
