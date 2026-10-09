import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "codavio-recovery-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const hooks = join(root, "plugin with spaces", "hooks");
  mkdirSync(hooks, { recursive: true });
  copyFileSync(new URL("../adapters/codex/plugins/codavio/hooks/recover.mjs", import.meta.url),
    join(hooks, "recover.mjs"));
  writeFileSync(join(hooks, "orchestrator.md"), "Canonical authority kernel for this test.");
  return (event, env = {}) => {
    const result = spawnSync(process.execPath, [join(hooks, "recover.mjs")], {
      cwd: tmpdir(), encoding: "utf8",
      env: { ...process.env, PLUGIN_DATA: join(root, "data"), ...env },
      input: typeof event === "string" ? event : JSON.stringify({
        session_id: "session-one", transcript_path: join(root, "root.jsonl"), ...event,
      }),
    });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  };
}

const compact = { hook_event_name: "SessionStart", source: "compact" };
const prompt = (text) => ({ hook_event_name: "UserPromptSubmit", prompt: text });

test("non-Codavio sessions emit no recovery context", (t) => {
  const run = fixture(t);
  assert.equal(run(compact), "");
  assert.equal(run(prompt("Fix the tests")), "");
  assert.equal(run(compact), "");
});

test("explicit invocation persists activation across hook processes", (t) => {
  const run = fixture(t);
  assert.equal(run(prompt("Use $codavio to implement this feature")), "");
  const output = JSON.parse(run(compact)).hookSpecificOutput;
  assert.equal(output.hookEventName, "SessionStart");
  assert.match(output.additionalContext, /Canonical authority kernel for this test/);
  assert.match(output.additionalContext, /reload `codavio-orchestrate`/);
  assert.match(output.additionalContext, /unfinished gates and next role/);
  assert.equal(run(prompt("Keep going")), "");
  assert.ok(run({ ...compact, source: "resume" }));
});

test("activation never leaks to another session or worker transcript", (t) => {
  const run = fixture(t);
  run(prompt("$codavio-orchestrate build the feature"));
  assert.equal(run({ ...compact, session_id: "session-two" }), "");
  assert.equal(run({ ...compact, transcript_path: "/other/worker.jsonl" }), "");
  assert.equal(run({ ...compact, transcript_path: null }), "");
  assert.ok(run(compact));
});

test("mentions, questions, quotations, and negations do not activate Codavio", (t) => {
  const run = fixture(t);
  for (const text of ["What does $codavio do?", "Explain how to use $codavio", "Don't use $codavio", "`$codavio`", "```\n$codavio fix it\n```", "$codavio-review inspect the diff", "$codavio-other fix it"]) {
    assert.equal(run(prompt(text)), "");
    assert.equal(run(compact), "", text);
  }
});

test("supported explicit entry forms activate recovery", (t) => {
  const run = fixture(t);
  for (const text of ["$codavio fix it", "/codavio fix it", "/skill:codavio-orchestrate fix it", "Please use Codavio to fix it", "resume $codavio-orchestrate"]) {
    run(prompt(text));
    assert.ok(run(compact), text);
    run(prompt("exit Codavio"));
    assert.equal(run(compact), "");
  }
});

test("explicit workflow exits clear only the matching session", (t) => {
  const run = fixture(t);
  for (const text of ["pause Codavio", "cancel $codavio", "exit Codavio", "stop the Codavio workflow", "Do not use $codavio"]) {
    run(prompt("Use $codavio"));
    run({ ...prompt("exit Codavio"), session_id: "session-two" });
    assert.ok(run(compact));
    run(prompt(text));
    assert.equal(run(compact), "", text);
  }
});

test("missing identity or storage and malformed hook input stay silent", (t) => {
  const run = fixture(t);
  run(prompt("Use $codavio"));
  for (const event of ["not JSON", "null", { ...compact, session_id: null }, { ...compact, source: "startup" }, { ...compact, hook_event_name: "SubagentStart" }]) {
    assert.equal(run(event), "");
  }
  assert.equal(run(compact, { PLUGIN_DATA: "" }), "");
  run({ ...prompt("Use $codavio"), transcript_path: null, session_id: "missing-transcript" });
  assert.equal(run({ ...compact, transcript_path: null, session_id: "missing-transcript" }), "");
});
