// SEIS Release Policy — MQL5 (MetaQuotes Language 5 — MetaTrader)

#property copyright "SEIS"
#property version   "1.00"
#property strict

enum ENUM_MOTION_MODE   { CINEMATIC, BALANCED, REDUCED };
enum ENUM_RELEASE_STATUS{ READY, BLOCKED, PENDING };

int MotionDurationMs(ENUM_MOTION_MODE mode) {
   switch (mode) {
      case CINEMATIC: return 600;
      case BALANCED:  return 300;
      case REDUCED:   return 0;
      default:        return 0;
   }
}

ENUM_MOTION_MODE ResolveMotionMode(ENUM_MOTION_MODE requested, bool prefersReduced) {
   return prefersReduced ? REDUCED : requested;
}

bool CanDeploy(ENUM_RELEASE_STATUS status) {
   return status == READY;
}

// Script entry point
void OnStart() {
   ENUM_MOTION_MODE resolved = ResolveMotionMode(CINEMATIC, true);
   int duration               = MotionDurationMs(resolved);
   bool deploy                = CanDeploy(READY);

   Print("SEIS Release Gate");
   PrintFormat("  Resolved motion: %s", EnumToString(resolved));
   PrintFormat("  Duration ms:     %d", duration);
   PrintFormat("  Can deploy:      %s", deploy ? "Yes" : "No");
}
