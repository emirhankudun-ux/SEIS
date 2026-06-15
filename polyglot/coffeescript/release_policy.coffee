# SEIS Release Policy — CoffeeScript

MOTION_DURATIONS =
  cinematic: 600
  balanced:  300
  reduced:   0

resolveMotion = (requested, prefersReduced) ->
  if prefersReduced then 'reduced' else requested

canDeploy = (status) -> status is 'ready'

motionDuration = (mode) -> MOTION_DURATIONS[mode] ? 0

module.exports = { resolveMotion, canDeploy, motionDuration, MOTION_DURATIONS }
