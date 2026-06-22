import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { siteMeta } from "@seis/content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function workspaceRoot() {
  if (process.env.SEIS_RUNTIME_DIR) {
    return path.resolve(process.env.SEIS_RUNTIME_DIR);
  }

  return process.cwd().endsWith(path.join("apps", "site-next"))
    ? path.resolve(process.cwd(), "../..")
    : process.cwd();
}

async function appendRuntimeRecord(payload: Record<string, unknown>) {
  const runtimeDirectory = process.env.SEIS_RUNTIME_DIR
    ? path.resolve(process.env.SEIS_RUNTIME_DIR)
    : path.join(workspaceRoot(), "runtime");
  const target = path.join(runtimeDirectory, "contact-submissions.jsonl");
  await mkdir(runtimeDirectory, { recursive: true });
  await appendFile(target, `${JSON.stringify(payload)}\n`, "utf8");
  return path.relative(workspaceRoot(), target);
}

export function GET() {
  return Response.json({
    email: siteMeta.email,
    endpointConfigured: Boolean(process.env.CONTACT_ENDPOINT),
    localRuntimeCapture: true
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    email?: unknown;
    message?: unknown;
    service?: unknown;
  } | null;

  if (!body || typeof body.name !== "string" || !isEmail(body.email) || typeof body.message !== "string") {
    return Response.json({ ok: false, error: "invalid_contact_payload" }, { status: 400 });
  }

  if (body.message.trim().length < 12) {
    return Response.json({ ok: false, error: "message_too_short" }, { status: 400 });
  }

  const record = {
    id: crypto.randomUUID(),
    kind: "contact",
    createdAt: new Date().toISOString(),
    name: body.name.trim().slice(0, 180),
    email: body.email.trim(),
    service: typeof body.service === "string" ? body.service.trim().slice(0, 180) : "not_specified",
    message: body.message.trim().slice(0, 1600),
    storage: "local_jsonl"
  };
  const runtimePath = await appendRuntimeRecord(record).catch(() => null);

  return Response.json(
    {
      ok: true,
      status: process.env.CONTACT_ENDPOINT ? "configured_and_captured" : "queued_local",
      runtimePath,
      nextStep: process.env.CONTACT_ENDPOINT
        ? "Contact endpoint is configured for downstream handling."
        : `No CONTACT_ENDPOINT is configured. Use mailto:${siteMeta.email} as the safe fallback.`
    },
    { status: 202 }
  );
}
