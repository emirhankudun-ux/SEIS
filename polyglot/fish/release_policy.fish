#!/usr/bin/env fish
# SEIS Release Policy — Fish Shell

function resolve_motion --argument-names requested prefers_reduced
    if test "$prefers_reduced" = "true"
        echo "reduced"
    else
        echo $requested
    end
end

function motion_duration_ms --argument-names mode
    switch $mode
        case cinematic
            echo 800
        case balanced
            echo 300
        case reduced
            echo 0
        case '*'
            echo 0
    end
end

function can_deploy --argument-names status
    test "$status" = "ready"
end

set mode (resolve_motion "cinematic" "true")
set duration (motion_duration_ms $mode)
echo "Motion mode: $mode — Duration: {$duration}ms"
