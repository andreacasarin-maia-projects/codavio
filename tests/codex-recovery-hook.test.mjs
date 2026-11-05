import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const compact = { hook_event_name: "SessionStart", source: "compact" };

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "codavio-recovery-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const hooks = join(root, "plugin with spaces", "hooks");
  const checkout = join(root, "project");
  mkdirSync(hooks, { recursive: true });
  mkdirSync(join(checkout, ".git"), { recursive: true });
  copyFileSync(new URL("../adapters/codex/plugins/codavio/hooks/codavio-recovery.mjs", import.meta.url),
    join(hooks, "codavio-recovery.mjs"));
  writeFileSync(join(hooks, "orchestrator.md"), "Canonical authority kernel for this test.");
  copyFileSync(new URL("../workflow/recovery.md", import.meta.url), join(hooks, "recovery.md"));
  const invoke = (args, input, { cwd = checkout, env = {} } = {}) => spawnSync(
    process.execPath, [join(hooks, "codavio-recovery.mjs"), ...args], {
      cwd, encoding: "utf8",
      env: { ...process.env, CODEX_SESSION_ID: "session-one", CODEX_THREAD_ID: "session-one", ...env },
      input,
    });
  return {
    root, checkout,
    markers: join(checkout, ".ai", "work", ".codavio-sessions"),
    action(action, options) { return invoke([action], undefined, options); },
    run(event, options) {
      const result = invoke([], typeof event === "string" ? event : JSON.stringify({
        session_id: "session-one", cwd: checkout, ...event,
      }), options);
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stderr, "");
      return result.stdout;
    },
  };
}

test("unrelated sessions and prompt mentions stay silent without creating state", (t) => {
  const f = fixture(t);
  assert.equal(f.run(compact), "");
  for (const prompt of ["Fix the tests", "Use $codavio", "What does $codavio do?"]) {
    assert.equal(f.run({ hook_event_name: "UserPromptSubmit", prompt }), "");
    assert.equal(f.run(compact), "");
  }
  assert.equal(existsSync(join(f.checkout, ".ai")), false);
  const work = join(f.checkout, ".ai", "work");
  mkdirSync(work, { recursive: true });
  writeFileSync(join(work, "existing-feature.md"), "---\nwork_id: existing-feature\nstatus: building\n---\n");
  assert.equal(f.run(compact), "", "a resumable work item must not activate another chat");
  assert.equal(existsSync(f.markers), false);
});

test("explicit registration persists recovery across processes", (t) => {
  const f = fixture(t);
  const activation = f.action("activate");
  assert.equal(activation.status, 0, activation.stderr);
  assert.equal(activation.stdout, "");
  for (const source of ["compact", "resume"]) {
    const output = JSON.parse(f.run({ ...compact, source })).hookSpecificOutput;
    assert.equal(output.hookEventName, "SessionStart");
    assert.match(output.additionalContext, /Canonical authority kernel for this test/);
    assert.match(output.additionalContext, /reload `codavio-orchestrate`/);
    assert.match(output.additionalContext, /do not repeat completed tasks with valid evidence/);
    assert.match(output.additionalContext, /recorded\s+next action/);
  }
  assert.equal(f.run({ hook_event_name: "UserPromptSubmit", prompt: "Keep going" }), "");
});

test("recovery is scoped to the registered session and checkout", (t) => {
  const f = fixture(t);
  assert.equal(f.action("activate").status, 0);
  assert.equal(f.run({ ...compact, session_id: "session-two" }), "");
  const other = join(f.root, "other checkout");
  mkdirSync(other);
  writeFileSync(join(other, ".git"), "gitdir: /another/worktree\n");
  assert.equal(f.run({ ...compact, cwd: other }), "");
  assert.equal(existsSync(join(other, ".ai")), false);
  const nested = join(f.checkout, "src", "nested");
  mkdirSync(nested, { recursive: true });
  assert.ok(f.run({ ...compact, cwd: nested }));
  assert.equal(f.action("deactivate", { cwd: nested }).status, 0);
  assert.equal(f.run(compact), "");
  assert.equal(f.action("activate", { cwd: other }).status, 0);
  assert.ok(f.run({ ...compact, cwd: other }));
  assert.equal(f.run(compact), "");
});

test("worker events and startup, clear, and fork never restore coordinator context", (t) => {
  const f = fixture(t);
  assert.equal(f.action("activate").status, 0);
  for (const source of ["startup", "clear", "fork"]) {
    assert.equal(f.run({ ...compact, source }), "");
  }
  // Codex dispatches SubagentStart for spawned workers and skips their resume/compaction hooks.
  assert.equal(f.run({ ...compact, hook_event_name: "SubagentStart", agent_id: "worker" }), "");
  const worker = f.action("activate", { env: { CODEX_THREAD_ID: "worker" } });
  assert.equal(worker.status, 1);
  assert.match(worker.stderr, /main Codex session/);
  assert.equal(f.action("deactivate", { env: { CODEX_THREAD_ID: "worker" } }).status, 1);
  assert.ok(f.run(compact));
});

test("completion and pause cleanup is idempotent and clears only the current session", (t) => {
  const f = fixture(t);
  const other = { env: { CODEX_SESSION_ID: "session-two", CODEX_THREAD_ID: "session-two" } };
  assert.equal(f.action("deactivate").status, 0);
  assert.equal(existsSync(join(f.checkout, ".ai")), false);
  assert.equal(f.action("activate").status, 0);
  assert.equal(f.action("activate", other).status, 0);
  assert.equal(f.action("deactivate").status, 0);
  assert.equal(f.action("deactivate").status, 0);
  assert.equal(f.run(compact), "");
  assert.ok(f.run({ ...compact, session_id: "session-two" }));
  assert.equal(f.action("activate").status, 0);
  assert.ok(f.run(compact));
});

test("invalid registration identity or checkout fails visibly without writing state", (t) => {
  const f = fixture(t);
  for (const env of [
    { CODEX_SESSION_ID: "" }, { CODEX_THREAD_ID: "" },
    { CODEX_SESSION_ID: " ", CODEX_THREAD_ID: " " },
  ]) {
    const result = f.action("activate", { env });
    assert.equal(result.status, 1);
    assert.ok(result.stderr);
  }
  assert.equal(f.action("invalid").status, 1);
  assert.equal(f.action("activate", { cwd: f.root }).status, 1);
  assert.equal(existsSync(join(f.checkout, ".ai")), false);
  assert.equal(existsSync(join(f.root, ".ai")), false);
});

test("malformed events and missing identity or storage fail closed", (t) => {
  const f = fixture(t);
  assert.equal(f.action("activate").status, 0);
  for (const event of [
    "not JSON", "null", "[]", { ...compact, session_id: null },
    { ...compact, session_id: " " }, { ...compact, session_id: 123 },
    { ...compact, cwd: null }, { ...compact, cwd: "relative" },
    { ...compact, cwd: join(f.root, "missing") }, { ...compact, cwd: f.root },
  ]) assert.equal(f.run(event), "");
  const marker = join(f.markers, readdirSync(f.markers)[0]);
  writeFileSync(marker, "corrupt\n");
  assert.equal(f.run(compact), "");
  rmSync(marker);
  mkdirSync(marker);
  assert.equal(f.run(compact), "");
  const activation = f.action("activate");
  assert.equal(activation.status, 1);
  assert.ok(activation.stderr);
});

test("registration uses the same physical checkout through a symlink", (t) => {
  const f = fixture(t);
  const alias = join(f.root, "project alias");
  symlinkSync(f.checkout, alias, "dir");
  assert.equal(f.action("activate", { cwd: alias }).status, 0);
  assert.ok(f.run({ ...compact, cwd: alias }));
  assert.ok(f.run(compact));
  assert.equal(f.action("deactivate").status, 0);
  assert.equal(f.run({ ...compact, cwd: alias }), "");
});
