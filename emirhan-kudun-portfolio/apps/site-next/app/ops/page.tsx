import type { Metadata } from "next";
import Link from "next/link";

import {
  ecosystemAggressiveDevelopmentLanes,
  ecosystemAiHelperLanes,
  ecosystemOutputSurfaces,
  ecosystemSourceExportIndex,
  ecosystemSourceActionBoard,
  ecosystemSourceActionPackets,
  ecosystemSourceQualityGates,
  ecosystemSourceRunbook,
  ecosystemSourceExecutionReceipts,
  ecosystemSourceExecutionDigest,
  ecosystemSourceContinuationBrief,
  ecosystemSourceExecutionQueue,
  ecosystemSourceSignalMap,
  ecosystemSourceTotal,
  polyglotSourceContracts
} from "@seis/content";
import { getDeploymentTargets, getMcpReadinessSnapshot, getRuntimeSnapshot } from "@seis/runtime";

import { buildPageMetadata } from "../../lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Ops Command Center",
  description: "Aggressive portfolio operations center for plugin sources, runtime readiness, GitHub publishing and deployment gates.",
  path: "/ops"
});

const apiLinks = [
  "/api/ops-command-center",
  "/api/source-execution-queue",
  "/api/source-action-board",
  "/api/source-action-packets",
  "/api/source-quality-gates",
  "/api/source-runbook",
  "/api/source-execution-receipts",
  "/api/source-execution-digest",
  "/api/source-continuation-brief",
  "/api/source-signal-map",
  "/api/aggressive-development-plan",
  "/api/source-package",
  "/api/source-export-index",
  "/api/health",
  "/api/deployment-targets",
  "/api/mcp-readiness"
];

export default function OpsPage() {
  const runtime = getRuntimeSnapshot();
  const mcp = getMcpReadinessSnapshot();
  const deploymentTargets = getDeploymentTargets();
  const activeDeploymentTargets = deploymentTargets.filter((target) => target.status === "active" || target.status === "configured");
  const blockedDeploymentTargets = deploymentTargets.filter((target) => target.status === "needs_credentials" || target.status === "unavailable");
  const githubTarget = deploymentTargets.find((target) => target.id === "github-origin");

  const metrics = [
    { label: "Plugin sources", value: ecosystemSourceTotal, detail: "complete source ledger" },
    { label: "Signal groups", value: ecosystemSourceSignalMap.length, detail: "source family map" },
    { label: "Queue items", value: ecosystemSourceExecutionQueue.length, detail: "bounded next actions" },
    { label: "Board columns", value: ecosystemSourceActionBoard.columns.length, detail: "priority control" },
    { label: "Action packets", value: ecosystemSourceActionPackets.length, detail: "agent handoffs" },
    { label: "Quality gates", value: ecosystemSourceQualityGates.length, detail: "validation map" },
    { label: "Runbook steps", value: ecosystemSourceRunbook.steps.length, detail: "safe sequence" },
    { label: "Receipts", value: ecosystemSourceExecutionReceipts.length, detail: "proof surfaces" },
    { label: "Digest metrics", value: ecosystemSourceExecutionDigest.metrics.length, detail: "fast overview" },
    { label: "Brief paths", value: ecosystemSourceContinuationBrief.readFirstPaths.length, detail: "continue handoff" },
    { label: "Aggressive lanes", value: ecosystemAggressiveDevelopmentLanes.length, detail: "governed sprint map" },
    { label: "Runtime ready", value: `${runtime.summary.active + runtime.summary.configured}/${runtime.summary.total}`, detail: "connectors + skills" },
    { label: "Deploy ready", value: `${activeDeploymentTargets.length}/${deploymentTargets.length}`, detail: "publish targets" },
    { label: "Output APIs", value: ecosystemOutputSurfaces.length, detail: "inspectable surfaces" },
    { label: "Polyglot contracts", value: polyglotSourceContracts.length, detail: "repo language proof" }
  ];

  const stages = [
    {
      title: "Source cockpit",
      status: "active",
      metric: `${ecosystemSourceSignalMap.length} signal groups`,
      detail: "All submitted plugin refs stay visible through UI, API, signal map, proof, export and delivery outputs."
    },
    {
      title: "Aggressive execution",
      status: "active",
      metric: `${ecosystemAggressiveDevelopmentLanes.length} lanes`,
      detail: "Builders, creative tools, growth, ops, quality and research are routed without bulk external writes."
    },
    {
      title: "GitHub persistence",
      status: githubTarget?.status || "configured",
      metric: githubTarget?.targetUrl || "origin branch",
      detail: "The Codex branch is the recoverable source of truth before production hosting."
    },
    {
      title: "AI helper routing",
      status: "configured",
      metric: `${ecosystemAiHelperLanes.length} helper lanes`,
      detail: "Codex is active; model, creative, research, quality and ops helpers remain task-routed."
    },
    {
      title: "Deployment gates",
      status: blockedDeploymentTargets.length ? "needs_credentials" : "active",
      metric: `${blockedDeploymentTargets.length} gated`,
      detail: "Vercel and custom server work remain explicit-confirmation tasks with credentials outside git."
    },
    {
      title: "MCP readiness",
      status: mcp.summary.needsCredentials || mcp.summary.unavailable ? "needs_credentials" : "active",
      metric: `${mcp.summary.active + mcp.summary.configured}/${mcp.summary.total} ready`,
      detail: "MCP availability is represented separately from source identity and external auth."
    }
  ];

  return (
    <main className="page-shell ops-command-page" id="page-main-content">
      <a href="#ops-content" className="skip-link">Icerige gec</a>
      <nav className="top-nav" aria-label="Ops navigation">
        <Link href="/" className="brand">Emirhan Kudun</Link>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/lab">Lab</Link>
          <Link href="/ops" aria-current="page">Ops</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>

      <section className="section page-hero ops-command-hero" id="ops-content">
        <p className="eyebrow">SEIS / aggressive operations</p>
        <h1>Portfolio ops command center.</h1>
        <p className="page-lead">
          Plugin kaynaklari, runtime hazirligi, GitHub persistence ve deploy kapilari tek komuta yuzeyinde toplandi.
        </p>

        <div className="ops-command-metrics" aria-label="Ops command metrics">
          {metrics.map((metric) => (
            <article key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
              <small>{metric.detail}</small>
            </article>
          ))}
        </div>

        <div className="ops-stage-grid" aria-label="Aggressive development stages">
          {stages.map((stage) => (
            <article className="ops-stage-card" data-status={stage.status} key={stage.title}>
              <span>{stage.status}</span>
              <strong>{stage.metric}</strong>
              <h2>{stage.title}</h2>
              <p>{stage.detail}</p>
            </article>
          ))}
        </div>

        <div className="ops-command-split">
          <section className="ops-block">
            <p className="eyebrow">Sprint lanes</p>
            <h2>Connected-source execution map</h2>
            <div className="ops-lane-grid">
              {ecosystemAggressiveDevelopmentLanes.map((lane) => (
                <article className="ops-lane-card" data-priority={lane.priority} key={lane.id}>
                  <span>{lane.posture} / {lane.priority}</span>
                  <strong>{lane.count}</strong>
                  <h3>{lane.title}</h3>
                  <p>{lane.actionNow}</p>
                  <small>{lane.callableCount} callable / {lane.blockedCount} blocked</small>
                </article>
              ))}
            </div>
          </section>

          <section className="ops-block">
            <p className="eyebrow">Deployment gates</p>
            <h2>Publish and hosting control</h2>
            <div className="ops-target-grid">
              {deploymentTargets.map((target) => (
                <article className="ops-target-card" data-status={target.status} key={target.id}>
                  <span>{target.status}</span>
                  <h3>{target.name}</h3>
                  <p>{target.scope}</p>
                  <small>{target.persistence}</small>
                  <code>{target.command}</code>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="ops-api-panel" aria-label="Ops API outputs">
          <div>
            <p className="eyebrow">Agent outputs</p>
            <h2>Machine-readable command surfaces</h2>
            <p>
              Bu linkler GitHub, Codex veya baska bir agent icin ayni operasyon haritasini JSON olarak verir.
            </p>
          </div>
          <div className="api-list">
            {apiLinks.map((href) => (
              <Link className="text-link" href={href} key={href}>{href}</Link>
            ))}
          </div>
        </section>

        <section className="ops-api-panel" aria-label="Source export index summary">
          <div>
            <p className="eyebrow">Export index</p>
            <h2>{ecosystemSourceExportIndex.length} source handoff surfaces</h2>
            <p>Source package, proof, install plan, side panel receipt, AI routing ve aggressive plan tek indexte.</p>
          </div>
          <div className="ops-export-grid">
            {ecosystemSourceExportIndex.map((item) => (
              <article className="ops-export-card" data-status={item.status} key={item.id}>
                <span>{item.format} / {item.status}</span>
                <strong>{item.count}</strong>
                <h3>{item.label}</h3>
                <code>{item.path}</code>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
