import assert from "node:assert/strict";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import coordinatorGuard from "../pi/extensions/coordinator-guard.ts";

function fixture(t: test.TestContext) {
  const root = mkdtempSync(join(tmpdir(), "codavio-native-recovery-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const authority = readFileSync(new URL("../workflow/orchestrator.md", import.meta.url), "utf8").trim();
  const reminder = readFileSync(new URL("../workflow/recovery.md", import.meta.url), "utf8").trim();
  const context = authority + "\n\n" + reminder;
  const definition = { name: "codavio_session", label: "Codavio-recovery", description: "Session registration", parameters: {
    type: "object", properties: { action: { type: "string", enum: ["activate", "deactivate"] } }, required: ["action"],
  }, authority, reminder, context };
  return { root, authority, reminder, context, definition };
}

async function openCode(t: test.TestContext) {
  const f = fixture(t);
  copyFileSync(new URL("../adapters/opencode/plugins/codavio/index.js", import.meta.url), join(f.root, "index.mjs"));
  writeFileSync(join(f.root, "recovery.json"), JSON.stringify(f.definition));
  const plugin = (await import(pathToFileURL(join(f.root, "index.mjs")).href)).default;
  const sessions = new Map([
    ["main", { id: "main", agent: "orchestrator", location: { directory: f.root } }],
    ["other", { id: "other", agent: "orchestrator", location: { directory: f.root } }],
    ["worker", { id: "worker", agent: "orchestrator", parentID: "main", location: { directory: f.root } }],
    ["build", { id: "build", agent: "build", location: { directory: f.root } }],
  ]);
  const storage = new Map();
  let tool: any;
  let hook: any;
  const ctx = {
    session: {
      get: async ({ sessionID }: { sessionID: string }) => {
        if (!sessions.has(sessionID)) throw new Error("missing session");
        return sessions.get(sessionID);
      },
      hook: async (name: string, callback: unknown) => { assert.equal(name, "context"); hook = callback; },
    },
    tool: { transform: async (callback: any) => callback({ add: (value: any) => { tool = value; } }) },
    storage: {
      get: async (key: string) => storage.get(key),
      set: async (key: string, value: unknown) => { storage.set(key, value); },
      remove: async (key: string) => { storage.delete(key); },
    },
  };
  await plugin.setup(ctx);
  return { ...f, sessions, storage,
    reload: () => plugin.setup(ctx),
    action: (action: string, sessionID = "main") => tool.execute({ action }, { sessionID }),
    async request(sessionID = "main", agent = "orchestrator", system: any[] = []) {
      const event = { sessionID, agent, system, messages: [] };
      await hook(event);
      return event;
    },
  };
}

async function piSession(t: test.TestContext) {
  const f = fixture(t);
  const directory = join(f.root, "extensions");
  mkdirSync(directory);
  for (const name of ["codavio-recovery.ts", "session-state.ts"]) {
    copyFileSync(new URL("../pi/extensions/" + name, import.meta.url), join(directory, name));
  }
  writeFileSync(join(f.root, "recovery.json"), JSON.stringify(f.definition));
  const recovery = (await import(pathToFileURL(join(directory, "codavio-recovery.ts")).href)).default;
  const entries: any[] = [];
  let sessionId = "main";
  let tool: any;
  let hook: any;
  const api = {
    registerTool: (value: any) => { tool = value; },
    on: (name: string, callback: unknown) => { assert.equal(name, "context"); hook = callback; },
    appendEntry: (customType: string, data: unknown) => entries.push({ type: "custom", customType, data }),
  };
  const ctx = { cwd: f.root, sessionManager: { getSessionId: () => sessionId, getBranch: () => entries } };
  recovery(api);
  return { ...f, entries, ctx, recovery,
    switchSession(id: string) { sessionId = id; },
    reload() { recovery(api); },
    action: (action: string) => tool.execute("call", { action }, undefined, undefined, ctx),
    request: (messages: any[] = []) => hook({ type: "context", messages }, ctx),
  };
}

test("OpenCode recovery is silent until explicit registration and after cleanup", async (t) => {
  const f = await openCode(t);
  assert.deepEqual((await f.request()).system, []);
  assert.equal(f.storage.size, 0);
  await f.action("activate");
  const request = await f.request();
  assert.deepEqual(request.system, [{ type: "text", text: f.context }]);
  assert.equal((await f.request("main", "orchestrator", request.system)).system.length, 1);
  const native = await f.request("main", "orchestrator", [{ type: "text", text: f.authority }]);
  assert.equal(native.system[1].text, f.reminder, "native agent kernel must not be duplicated");
  // Fresh request context after compaction or a new plugin instance on resume.
  await f.reload();
  assert.equal((await f.request()).system.length, 1);
  assert.deepEqual((await f.request("other")).system, []);
  await f.action("deactivate");
  assert.deepEqual((await f.request()).system, []);
  await f.action("deactivate");
  assert.equal(f.storage.size, 0);
});

test("OpenCode excludes workers, other agents, invalid identity, and moved checkouts", async (t) => {
  const f = await openCode(t);
  for (const id of ["worker", "build", "missing"]) await assert.rejects(f.action("activate", id));
  await assert.rejects(f.action("unknown"));
  assert.equal(f.storage.size, 0);
  await f.action("activate");
  assert.deepEqual((await f.request("worker")).system, []);
  assert.deepEqual((await f.request("main", "build")).system, []);
  assert.deepEqual((await f.request("missing")).system, []);
  const moved = join(f.root, "moved");
  mkdirSync(moved);
  f.sessions.get("main")!.location.directory = moved;
  assert.deepEqual((await f.request()).system, []);
  f.storage.set("session/main", null);
  assert.deepEqual((await f.request()).system, []);
});

test("Pi recovery survives compaction and resume without accumulating reminder messages", async (t) => {
  const f = await piSession(t);
  assert.equal(await f.request(), undefined);
  assert.equal(f.entries.length, 0);
  await f.action("activate");
  const summary = { role: "compactionSummary", summary: "Prior work" };
  const user = { role: "user", content: "Continue", timestamp: 1 };
  const messages = [summary, user];
  const recovered = await f.request(messages);
  assert.equal(messages.length, 2, "request context must not mutate persisted history");
  assert.deepEqual(recovered.messages, [summary, { role: "user", content: [{ type: "text", text: f.context }], timestamp: 0 }, user]);
  assert.equal(await f.request(recovered.messages), undefined, "existing recovery context must not duplicate");
  assert.equal((await f.request(messages)).messages.length, 3);
  const native = await f.request([{ role: "user", content: f.authority, timestamp: 1 }]);
  assert.equal(native.messages[0].content[0].text, f.reminder, "existing entry kernel must not be duplicated");
  f.reload();
  assert.equal((await f.request([summary])).messages.length, 2);
  await f.action("deactivate");
  assert.equal(await f.request(messages), undefined);
});

test("Pi registration follows the active session branch and checkout, not inherited history", async (t) => {
  const f = await piSession(t);
  await f.action("activate");
  f.switchSession("other");
  assert.equal(await f.request(), undefined);
  f.switchSession("main");
  const cwd = f.ctx.cwd;
  f.ctx.cwd = join(cwd, "other checkout");
  assert.equal(await f.request(), undefined);
  f.ctx.cwd = cwd;
  assert.ok(await f.request());
  await f.action("deactivate");
  assert.equal(await f.request(), undefined);
  f.entries.pop(); // Native tree navigation back before deactivation.
  assert.ok(await f.request());
  await assert.rejects(f.action("unknown"));
  f.switchSession("");
  await assert.rejects(f.action("activate"));
});

test("Pi workers do not register coordinator recovery tools or hooks", async (t) => {
  const f = await piSession(t);
  const previous = process.env.PI_SUBAGENT_CHILD_AGENT;
  try {
    process.env.PI_SUBAGENT_CHILD_AGENT = "builder";
    f.recovery({ registerTool: () => assert.fail("worker tool registration"), on: () => assert.fail("worker recovery hook") });
    await assert.rejects(f.action("activate"));
    assert.equal(await f.request(), undefined);
  } finally {
    if (previous === undefined) delete process.env.PI_SUBAGENT_CHILD_AGENT;
    else process.env.PI_SUBAGENT_CHILD_AGENT = previous;
  }
});

test("Pi coordinator guard applies only while this main session is registered", async (t) => {
  const f = await piSession(t);
  let guard: any;
  coordinatorGuard({ on: (_event: string, handler: unknown) => { guard = handler; } } as never);
  const event = { toolName: "bash", input: { command: "cat package.json" } };
  assert.equal(await guard(event, f.ctx), undefined);
  await f.action("activate");
  assert.equal((await guard(event, f.ctx)).block, true);
  await f.action("deactivate");
  assert.equal(await guard(event, f.ctx), undefined);
});
