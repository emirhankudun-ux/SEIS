import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { services } from "@seis/content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type BriefPayload = {
  name?: unknown;
  email?: unknown;
  service?: unknown;
  scope?: unknown;
  timeline?: unknown;
  budget?: unknown;
  priority?: unknown;
  goal?: unknown;
};

function isEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function clean(value: unknown, fallback = "not_specified") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim().slice(0, 1200) : fallback;
}

function workspaceRoot() {
  if (process.env.SEIS_RUNTIME_DIR) {
    return path.resolve(process.env.SEIS_RUNTIME_DIR);
  }

  return process.cwd().endsWith(path.join("apps", "site-next"))
    ? path.resolve(process.cwd(), "../..")
    : process.cwd();
}

async function appendRuntimeRecord(fileName: string, payload: Record<string, unknown>) {
  const runtimeDirectory = process.env.SEIS_RUNTIME_DIR
    ? path.resolve(process.env.SEIS_RUNTIME_DIR)
    : path.join(workspaceRoot(), "runtime");
  const target = path.join(runtimeDirectory, fileName);
  await mkdir(runtimeDirectory, { recursive: true });
  await appendFile(target, `${JSON.stringify(payload)}\n`, "utf8");
  return path.relative(workspaceRoot(), target);
}

export function GET() {
  return Response.json({
    fields: ["name", "email", "service", "scope", "timeline", "budget", "priority", "goal"],
    required: ["goal"],
    services: services.map((service) => ({
      id: service.id,
      title: service.title
    })),
    storage: "local_jsonl",
    externalDeliveryConfigured: Boolean(process.env.CONTACT_ENDPOINT)
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as BriefPayload | null;

  if (!body || typeof body.goal !== "string" || body.goal.trim().length < 12) {
    return Response.json({ ok: false, error: "brief_goal_required" }, { status: 400 });
  }

  if (body.email !== undefined && !isEmail(body.email)) {
    return Response.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const record = {
    id: crypto.randomUUID(),
    kind: "brief",
    createdAt: now,
    name: clean(body.name),
    email: isEmail(body.email) ? body.email.trim() : "not_specified",
    service: clean(body.service),
    scope: clean(body.scope),
    timeline: clean(body.timeline),
    budget: clean(body.budget),
    priority: clean(body.priority, "calm"),
    goal: clean(body.goal),
    readinessScore: body.email && body.service && body.scope ? "qualified" : "needs_followup",
    storage: "local_jsonl"
  };

  const runtimePath = await appendRuntimeRecord("brief-submissions.jsonl", record).catch(() => null);

  return Response.json(
    {
      ok: true,
      briefId: record.id,
      status: runtimePath ? "accepted_local" : "accepted_memory_only",
      runtimePath,
      received: {
        service: record.service,
        scope: record.scope,
        timeline: record.timeline,
        priority: record.priority,
        readinessScore: record.readinessScore
      }
    },
    { status: 202 }
  );
}
