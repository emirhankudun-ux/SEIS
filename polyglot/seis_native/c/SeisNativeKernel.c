#include <stddef.h>

struct SeisNativeLane {
    const char *name;
    int score;
    const char *primary_language;
};

static const struct SeisNativeLane SEIS_NATIVE_LANES[] = {
    {"Apple First", 100, "Swift"},
    {"Data AI", 88, "Python"},
    {"Systems", 84, "Rust"},
    {"Android", 76, "Kotlin"},
    {"Windows", 72, "CSharp"},
    {"Infrastructure", 70, "Go"}
};

size_t seis_native_lane_count(void) {
    return sizeof(SEIS_NATIVE_LANES) / sizeof(SEIS_NATIVE_LANES[0]);
}

const struct SeisNativeLane *seis_native_lanes(void) {
    return SEIS_NATIVE_LANES;
}

const struct SeisNativeLane *seis_native_top_lane(void) {
    return &SEIS_NATIVE_LANES[0];
}
