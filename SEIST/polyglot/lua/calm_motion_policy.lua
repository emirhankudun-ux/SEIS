local policy = {
  reduced_motion_supported = true,
  mobile_particle_limit = 24,
  desktop_particle_limit = 64,
  live_upload_requires_target = true
}

function policy.motion_limit(device)
  if device == "mobile" then
    return policy.mobile_particle_limit
  end
  return policy.desktop_particle_limit
end

return policy
