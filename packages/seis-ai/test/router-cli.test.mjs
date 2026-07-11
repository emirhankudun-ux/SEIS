import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

describe("SEIS router CLI", () => {
  it("does not consume a following flag as a missing option value", async () => {
    const { stdout } = await execFileAsync(
      process.execPath,
      ["packages/seis-ai/bin/seis-router.mjs", "--task-type", "--capability", "validation", "--local-only"],
      { cwd: packageRoot },
    );
    const decision = JSON.parse(stdout);

    assert.notEqual(decision.taskType, "--capability");
    assert.equal(decision.taskType, "general-assistant-task");
    assert.equal(decision.capability, "validation");
    assert.equal(decision.localOnly, true);
  });
});
