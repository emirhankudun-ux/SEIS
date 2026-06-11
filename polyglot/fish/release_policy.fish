#!/usr/bin/env fish
# SEIS Release Policy — Fish Shell

function resolve_motion --argument requested prefers_reduced
    if test "$prefers_reduced" = "true"
        echo "reduced"
    else
        echo $requested
    end
end

function motion_duration_ms --argument mode
    switch $mode
        case cinematic
            echo 600
        case balanced
            echo 300
        case reduced
            echo 0
        case '*'
            echo 0
    end
end

function can_deploy --argument status
    test "$status" = "ready"
end

set mode (resolve_motion "cinematic" "true")
set duration (motion_duration_ms $mode)
echo "Motion mode: $mode — Duration: {$duration}ms"
