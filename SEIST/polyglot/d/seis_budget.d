module seis_budget;

struct SeisBudget {
  ushort mobileParticles = 24;
  ushort desktopParticles = 64;
  ulong curatedAssetBudgetBytes = 7_000_000;
  bool supportsReducedMotion = true;
}

SeisBudget foundationBudget() {
  return SeisBudget();
}
