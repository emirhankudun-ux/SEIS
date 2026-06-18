#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const files = {
  longHorizon: "roadmap/seis-18-60-month-long-horizon-ops-blueprint.md",
  qualityGates: "docs/governance/quality-gates.md",
  enterpriseGates: "docs/governance/enterprise-change-gates.md",
  qualityGatesRoot: "governance/quality-gates.md",
  enterpriseGatesRoot: "governance/enterprise-change-gates.md",
  kpiFramework: "roadmap/seis-long-horizon-kpi-framework.md",
  adr2: "docs/decisions/adr-0002-seis-5-layer-operating-manifesto.md",
  adr3: "docs/decisions/adr-0003-seis-evolutionary-governance-throttle.md",
};

const checks = [
  {
    file: files.longHorizon,
    label: "Long-horizon blueprint missing",
    tokens: [
      "# SEIS 18-60 Aylık Uzun Vade Operasyon BluePrinti",
      "D1",
      "D2",
      "D3",
      "KPI ve Durdurma Mekanizması",
      "roadmap/seis-365-day-blueprint.md",
    ],
  },
  {
    file: files.qualityGates,
    label: "Quality gates missing long-horizon throttle section",
    tokens: [
      "Uzun Vadeli Kapı Rejimi",
      "D1",
      "D2",
      "D3",
      "roadmap/seis-18-60-month-long-horizon-ops-blueprint.md",
    ],
  },
  {
    file: files.enterpriseGates,
    label: "Enterprise gates missing long-horizon throttle section",
    tokens: [
      "Uzun Vade Dönüşüm Kuralı",
      "Uyarı Tetiklemesi",
      "Tekrarlı Uyarı Tetiklemesi",
      "Çözüm Tetiklemesi",
      "roadmap/seis-18-60-month-long-horizon-ops-blueprint.md",
    ],
  },
  {
    file: files.qualityGatesRoot,
    label: "Root quality gates file missing",
    tokens: [
      "# SEIS Quality + Security + AI Gates (Operasyonel Görev Seti)",
    ],
  },
  {
    file: files.enterpriseGatesRoot,
    label: "Root enterprise gates file missing",
    tokens: [
      "# SEIS Kurumsal Değişiklik Kapıları",
    ],
  },
  {
    file: files.kpiFramework,
    label: "KPI framework missing long-horizon throttle notes",
    tokens: [
      "Kural Seti",
      "2 haftalık genişleme kuralı",
      "ölçüm düşüşü",
      "docs/governance/enterprise-change-gates.md",
    ],
  },
  {
    file: files.adr3,
    label: "ADR-0003 missing throttle command references",
    tokens: [
      "Long-Horizon Evolutionary Governance Throttle",
      "D1 Uyarı",
      "D2 Dondurma",
      "D3 Yeniden Açılım",
      "docs/governance/enterprise-change-gates.md",
      "docs/governance/quality-gates.md",
    ],
  },
  {
    file: files.adr2,
    label: "ADR-0002 missing operational governance reference",
    tokens: [
      "5-layer operating model",
      "docs/governance/quality-gates.md",
      "docs/governance/enterprise-change-gates.md",
    ],
  },
];

for (const check of checks) {
  const content = read(check.file);
  for (const token of check.tokens) {
    if (!content.includes(token)) {
      failures.push(`${check.file}: missing token -> ${token}`);
    }
  }
}

if (failures.length > 0) {
  console.error("SEIS long-horizon throttle check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS long-horizon throttle check passed.");

function read(filePath) {
  const fullPath = path.join(root, filePath);
  if (!existsSync(fullPath)) {
    failures.push(`missing file: ${filePath}`);
    return "";
  }
  return readFileSync(fullPath, "utf8");
}
