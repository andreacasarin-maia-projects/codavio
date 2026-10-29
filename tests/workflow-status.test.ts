import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import workflow from "../pi/extensions/workflow.ts";

interface Notification {
  message: string;
  level: string;
}

function repository(t: test.TestContext): string {
  const root = mkdtempSync(join(tmpdir(), "codavio-workflow-status-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync("git", ["init", "-b", "feature/current"], { cwd: root, stdio: "ignore" });
  mkdirSync(join(root, ".ai", "work"), { recursive: true });
  return root;
}

function statusHandler(): (args: string, context: unknown) => Promise<void> {
  let handler: ((args: string, context: unknown) => Promise<void>) | undefined;
  workflow({
    registerCommand: (_name: string, command: { handler: typeof handler }) => {
      handler = command.handler;
    },
  } as never);
  assert.ok(handler);
  return handler;
}

async function notify(handler: ReturnType<typeof statusHandler>, root: string, args = ""): Promise<Notification> {
  const notifications: Notification[] = [];
  await handler(args, {
    cwd: root,
    ui: { notify: (message: string, level: string) => notifications.push({ message, level }) },
  });
  assert.equal(notifications.length, 1);
  return notifications[0];
}

test("workflow status resolves an explicit feature work ID", async (t) => {
  const root = repository(t);
  writeFileSync(join(root, ".ai", "work", "guest-checkout.md"), `---
work_id: guest-checkout
title: Guest checkout
status: planning
branch: feature/current
---
`);
  writeFileSync(join(root, ".ai", "work", "invoice-reminders.md"), `---
work_id: invoice-reminders
status: discovery
---
`);

  const result = await notify(statusHandler(), root, "guest-checkout");
  assert.equal(result.level, "info");
  assert.match(result.message, /Work item: guest-checkout — Guest checkout \[planning\]/);
});

test("workflow status prefers branch metadata and recognizes legacy branch state", async (t) => {
  const root = repository(t);
  writeFileSync(join(root, ".ai", "work", "guest-checkout.md"), `---
work_id: guest-checkout
status: building
branch: feature/current
---
`);
  writeFileSync(join(root, ".ai", "work", "other.md"), `---
work_id: other
status: planning
---
`);

  const selected = await notify(statusHandler(), root);
  assert.match(selected.message, /Active work item: guest-checkout \[building\]/);

  rmSync(join(root, ".ai", "work", "guest-checkout.md"));
  writeFileSync(join(root, ".ai", "work", "feature-current.md"), "# Legacy work state\n");
  const legacy = await notify(statusHandler(), root);
  assert.match(legacy.message, /feature-current \[legacy branch-named state\]/);
});

for (const status of ["completed", "shipped", "cancelled"]) {
  test(`workflow status lists ${status} work without selecting it as active`, async (t) => {
    const root = repository(t);
    writeFileSync(join(root, ".ai", "work", "finished.md"), `---
work_id: finished
status: ${status}
branch: feature/current
worktree: ${root}
---
`);

    const handler = statusHandler();
    const listed = await notify(handler, root);
    assert.match(listed.message, /^Work items:/);
    assert.ok(listed.message.includes(`finished [${status}]`));
    const explicit = await notify(handler, root, "finished");
    assert.ok(explicit.message.startsWith(`Work item: finished [${status}]`));

    writeFileSync(join(root, ".ai", "work", "ongoing.md"), `---
work_id: ongoing
status: analysis
---
`);
    const selected = await notify(handler, root);
    assert.match(selected.message, /^Active work item: ongoing \[analysis\]/);
  });
}

for (const status of ["paused", "blocked"]) {
  test(`workflow status keeps ${status} work available for resume`, async (t) => {
    const root = repository(t);
    writeFileSync(join(root, ".ai", "work", "ongoing.md"), `---
work_id: ongoing
status: ${status}
---
`);
    const result = await notify(statusHandler(), root);
    assert.ok(result.message.startsWith(`Active work item: ongoing [${status}]`));
  });
}
