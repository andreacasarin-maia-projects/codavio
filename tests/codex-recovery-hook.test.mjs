import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("Codex recovery hook restores conditional role authority as developer context", (t) => {
  const root = mkdtempSync(join(tmpdir(), "codavio-recovery-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const hooks = join(root, "plugin with spaces", "hooks");
  mkdirSync(hooks, { recursive: true });
  copyFileSync(new URL("../adapters/codex/plugins/codavio/hooks/recover.mjs", import.meta.url),
    join(hooks, "recover.mjs"));
  writeFileSync(join(hooks, "orchestrator.md"), "Canonical authority kernel for this test.");

  const result = spawnSync(process.execPath, [join(hooks, "recover.mjs")], {
    cwd: tmpdir(), encoding: "utf8",
    input: JSON.stringify({ hook_event_name: "SessionStart", source: "compact" }),
  });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout).hookSpecificOutput;
  assert.equal(output.hookEventName, "SessionStart");
  assert.match(output.additionalContext, /only to an explicitly invoked, still-active Codavio workflow/);
  assert.match(output.additionalContext, /Do not start or resume Codavio merely because this hook ran/);
  assert.match(output.additionalContext, /Canonical authority kernel for this test/);
  assert.match(output.additionalContext, /reload `codavio-orchestrate`/);
  assert.match(output.additionalContext, /unfinished gates and next role/);
});
