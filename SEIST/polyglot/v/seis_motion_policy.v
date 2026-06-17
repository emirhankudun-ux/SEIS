module polyglot

pub struct SeisMotionPolicy {
pub:
  supports_reduced_motion bool
  mobile_particle_limit int
  desktop_particle_limit int
  continuous_scene_limit int
}

pub const foundation_motion_policy = SeisMotionPolicy{
  supports_reduced_motion: true
  mobile_particle_limit: 24
  desktop_particle_limit: 64
  continuous_scene_limit: 1
}
