import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const REQUIRED_TECHNOLOGIES = new Set([
  "javascript",
  "nodejs",
  "mysql",
  "react",
  "expressjs",
  "typescript"
]);

export function loadRequestedSoftwareStack(root = process.cwd()) {
  const file = resolve(join(root, "content/development/requested-software-stack.json"));

  if (!existsSync(file)) {
    return { ok: false, error: "requested_software_stack_missing", file };
  }

  const source = JSON.parse(readFileSync(file, "utf8"));
  const technologies = Array.isArray(source.technologies) ? source.technologies : [];
  const visible = new Set(technologies.map((technology) => technology.id));
  const missing = [...REQUIRED_TECHNOLOGIES].filter((id) => !visible.has(id));

  return {
    ok: missing.length === 0,
    file,
    technologyCount: technologies.length,
    missing
  };
}
