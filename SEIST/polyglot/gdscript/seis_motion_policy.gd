class_name SeisMotionPolicy

const SUPPORTS_REDUCED_MOTION := true
const MOBILE_PARTICLE_LIMIT := 24
const DESKTOP_PARTICLE_LIMIT := 64

static func ready_for_scene(is_mobile: bool, particle_count: int) -> bool:
    var limit := MOBILE_PARTICLE_LIMIT if is_mobile else DESKTOP_PARTICLE_LIMIT
    return particle_count <= limit
