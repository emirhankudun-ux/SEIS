# SEIS Release Policy — Puppet DSL

class seis::release_policy (
  Enum['cinematic','balanced','reduced'] $motion_mode     = 'balanced',
  Boolean                                $prefers_reduced = false,
  Enum['ready','blocked','pending']      $release_status  = 'pending',
) {

  $resolved_mode = $prefers_reduced ? {
    true    => 'reduced',
    default => $motion_mode,
  }

  $motion_duration_ms = $resolved_mode ? {
    'cinematic' => 600,
    'balanced'  => 300,
    'reduced'   => 0,
    default     => 0,
  }

  $can_deploy = $release_status ? {
    'ready' => true,
    default => false,
  }

  notify { 'seis_release_gate':
    message => "SEIS gate — mode: ${resolved_mode} (${motion_duration_ms}ms) deploy: ${can_deploy}",
  }

  if $can_deploy {
    exec { 'seis_deploy_trigger':
      command => '/usr/local/bin/seis-deploy.sh',
      onlyif  => "/usr/local/bin/seis-check.sh ${release_status}",
      unless  => '/usr/local/bin/seis-deploy-check.sh',
      timeout => 120,
    }
  }
}
