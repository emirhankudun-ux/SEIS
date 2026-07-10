module seis_budget;

struct SeisBudget {
  ushort mobileParticles = 24;
  ushort desktopParticles = 64;
  ulong curatedAssetBudgetBytes = 10_485_760;
  bool supportsReducedMotion = true;
}

SeisBudget foundationBudget() {
  return SeisBudget();
}
