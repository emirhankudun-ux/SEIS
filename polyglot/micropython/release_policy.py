# SEIS Release Policy — MicroPython (embedded systems)
# Runs on RP2040, ESP32, STM32, and compatible microcontrollers

from micropython import const

CINEMATIC = const(0)
BALANCED  = const(1)
REDUCED   = const(2)

READY   = const(0)
BLOCKED = const(1)
PENDING = const(2)

MOTION_DURATIONS = (600, 300, 0)


def resolve_motion(requested: int, prefers_reduced: bool) -> int:
    return REDUCED if prefers_reduced else requested


def can_deploy(status: int) -> bool:
    return status == READY


def motion_duration_ms(mode: int) -> int:
    if 0 <= mode < len(MOTION_DURATIONS):
        return MOTION_DURATIONS[mode]
    return 0


# Embedded main — runs on boot
mode     = resolve_motion(CINEMATIC, True)
duration = motion_duration_ms(mode)
deploy   = can_deploy(READY)

print("SEIS Gate — motion:", ["cinematic","balanced","reduced"][mode],
      "| duration:", duration, "ms | deploy:", deploy)
