import test from "node:test";
import coordinatorGuard from "../pi/extensions/coordinator-guard.ts";
import assert from "node:assert/strict";
import { builderCommandBlocked, coordinatorCommandBlocked, isWorktreeLifecycleCommand, isReviewerCommand, isShipperCommand } from "../pi/extensions/command-policy.ts";

test("reviewer allows only direct inspection Git commands", () => {
  for (const command of ["git status", "git diff --stat", "git log -1", "git worktree list", "git worktree list --porcelain"]) {
    assert.equal(isReviewerCommand(command), true, command);
  }
  for (const command of ["reviewer git status", "git commit", "git worktree add ../other", "/usr/bin/git status", "command git status", "git -C . status", "git diff --output=result.patch", "git diff --ext-diff"]) {
    assert.equal(isReviewerCommand(command), false, command);
  }
});

test("shell syntax and unsafe builder commands are rejected", () => {
  for (const command of ["git status\ngit log", "git status; rm -rf .", "git status | cat", "git status > out", "git status $(id)", "git status $VAR", "git status \\;", "git status {x}"]) {
    assert.equal(isReviewerCommand(command), false, command);
    assert.equal(builderCommandBlocked(command), true, command);
  }
  for (const command of ["git status", "git diff --stat", "git log -1", "git -C . status", "command git status", "/usr/bin/git status", "sudo git status", "sh -c 'git commit -m x'", "bash -c 'rm file'", "python3 -c 'import os; os.system(\"git commit -m x\")'", "node --eval 'require(\"child_process\").execSync(\"rm file\")'"]) {
    assert.equal(builderCommandBlocked(command), true, command);
  }
  for (const command of ["rm file", "docker system prune", "docker volume rm data", "docker compose rm", "docker image prune", "curl https://example.com"]) {
    assert.equal(builderCommandBlocked(command), false, `${command} should reach the permission system`);
  }
});

test("coordinator guard blocks Git diff and log reads plus worktree lifecycle", () => {
  for (const command of ["git diff", "git diff --stat", "git log", "git log -1", "/usr/bin/git diff", "command git log"]) {
    assert.equal(coordinatorCommandBlocked(command), true, command);
  }
  for (const command of ["git status --short", "git branch --show-current", "git rev-parse --show-toplevel", "git worktree list", "npm test", "env npm test", "ls"]) {
    assert.equal(coordinatorCommandBlocked(command), false, command);
  }
});

test("coordinator blocks all worktree mutations including former fallback forms", () => {
  const root = "/repo/project";
  const target = `${root}/.worktrees/guest-checkout`;
  const rejected = [
    `git worktree add -b feature/guest-checkout ${target}`,
    `git worktree add ${target} feature/guest-checkout`,
    `git worktree add --force -b feature/guest-checkout ${target}`,
    `git worktree add -B feature/guest-checkout ${target}`,
    `git worktree add --detach ${target}`,
    "git worktree add -b feature/guest-checkout /tmp/guest-checkout",
    `git worktree add ${root}/.worktrees/../guest-checkout feature/guest-checkout`,
    `git worktree add ${root}/.worktrees/Bad_Id feature/guest-checkout`,
    `git worktree add ${target} --branch`,
    `git worktree add -b feature/guest-checkout ${target} --lock`,
    "git worktree remove " + target,
    "git worktree move " + target,
    "git worktree prune",
    "git worktree repair",
    "git worktree lock " + target,
    "git worktree unlock " + target,
    `git worktree add ${target} feature/guest-checkout; git worktree prune`,
    `command git worktree add -b feature/guest-checkout ${target}`,
    `/usr/bin/git worktree add -b feature/guest-checkout ${target}`,
    `env git worktree add -b feature/guest-checkout ${target}`,
    `git -C ${root} worktree add -b feature/guest-checkout ${target}`,
    `git --git-dir=${root}/.git worktree add -b feature/guest-checkout ${target}`,
  ];
  for (const command of rejected) {
    assert.equal(coordinatorCommandBlocked(command), true, command);
  }
});

test("only direct non-forced worktree mutations can receive approval", () => {
  for (const command of [
    "git worktree add -b feature/x /repo/x", "git worktree add /repo/x feature/x",
    "git worktree remove /repo/x", "git worktree move /repo/x /repo/y",
    "git worktree prune", "git worktree repair /repo/x", "git worktree lock /repo/x", "git worktree unlock /repo/x",
  ]) {
    assert.equal(isWorktreeLifecycleCommand(command), true, command);
    assert.equal(coordinatorCommandBlocked(command), true, command);
    assert.equal(coordinatorCommandBlocked(command, true), false, command);
  }
  for (const command of [
    "git worktree add --force /repo/x feature/x", "git worktree add -B feature/x /repo/x",
    "git worktree remove -ff /repo/x", "git diff", "git log",
    "sh -c 'git worktree prune'", "git -C /repo worktree prune", "git worktree prune; echo done",
  ]) {
    assert.equal(isWorktreeLifecycleCommand(command), false, command);
    assert.equal(coordinatorCommandBlocked(command, true), true, command);
  }
});

test("Pi coordinator requires visible approval for each workspace mutation", async () => {
  let handler: ((event: unknown, context: unknown) => Promise<{ block: boolean } | undefined>) | undefined;
  coordinatorGuard({ on: (_event: string, callback: typeof handler) => { handler = callback; } } as never);
  assert.ok(handler);
  const command = "git worktree add -b feature/x /repo/x";
  for (const [hasUI, approved, blocked] of [[true, true, false], [true, false, true], [false, true, true]]) {
    const prompts: string[] = [];
    const result = await handler({ toolName: "bash", input: { command } }, {
      hasUI,
      ui: { confirm: async (_title: string, message: string) => { prompts.push(message); return approved; } },
    });
    assert.equal(result?.block ?? false, blocked);
    assert.deepEqual(prompts, hasUI ? [command] : []);
  }
  const noPrompt = { hasUI: true, ui: { confirm: () => { assert.fail("read or blocked wrapper must not prompt"); } } };
  assert.equal(await handler({ toolName: "bash", input: { command: "git worktree list" } }, noPrompt), undefined);
  assert.equal((await handler({ toolName: "bash", input: { command: "sh -c 'git worktree prune'" } }, noPrompt))?.block, true);
});

test("coordinator blocks worktree lifecycle hidden in shell command strings", () => {
  for (const command of [
    "sh -c 'git worktree remove /tmp/x'",
    "sh -lc 'git worktree remove /tmp/x'",
    "env sh -c 'git worktree remove /tmp/x'",
    "env sh -lc 'git worktree remove /tmp/x'",
    "sh -lc 'git worktree add -b feature/x /repo/project/.worktrees/x'",
    "env sh -c 'git worktree add -b feature/x /repo/project/.worktrees/x'",
    "sh -c 'git worktree remove /tmp/x; echo done'",
    "sh -lc 'git worktree add -b feature/x /repo/project/.worktrees/x; echo done'",
    "env sh -c 'git worktree remove /tmp/x; echo done'",
    "git -c alias.wt=worktree wt remove /tmp/x",
    "git -c alias.foo=worktree foo add /tmp/x",
    "git -c 'alias.foo=worktree' foo remove /tmp/x",
    "git -c alias.foo='worktree' foo add /tmp/x",
    "git -c alias.foo=worktree foo prune",
    "sh -c 'git -c alias.foo=worktree foo add /tmp/x; echo done'",
    'sh -c \'git -c "alias.foo=worktree" foo add /tmp/x; echo done\'',
    "sh -c 'git -c alias.foo='worktree' foo add /tmp/x; echo done'",
    "/bin/bash -c 'git worktree add -b feature/x /repo/project/.worktrees/x'",
    "/usr/bin/zsh -c 'git worktree prune'",
  ]) {
    assert.equal(coordinatorCommandBlocked(command), true, command);
  }
  for (const command of ["sh -c 'echo hello'", "sh -c 'echo hello; echo world'", "bash -c 'git status'", "env sh -lc 'echo hello'", "env npm test"]) {
    assert.equal(coordinatorCommandBlocked(command), false, command);
  }
  for (const command of ["git -c color.ui=false status", "git -c 'color.ui=false' status"]) {
    assert.equal(coordinatorCommandBlocked(command), false, command);
  }
});

test("worktree lifecycle remains unavailable to builder, reviewer, and shipper", () => {
  for (const command of ["git worktree add -b feature/x /repo/project/.worktrees/x", "git worktree remove /repo/project/.worktrees/x"]) {
    assert.equal(builderCommandBlocked(command), true, command);
    assert.equal(isReviewerCommand(command), false, command);
    assert.equal(isShipperCommand(command), false, command);
  }
});

test("quoted arguments remain valid without shell expansion", () => {
  assert.equal(isShipperCommand('git commit -m "message with spaces"'), true);
  assert.equal(isShipperCommand("git commit -m 'message with spaces'"), true);
  assert.equal(isShipperCommand('git commit -m "$(uname)"'), false);
  assert.equal(isShipperCommand('git commit -m "$VAR"'), false);
});

test("shipper permits normal Git actions and rejects arbitrary or forced pushes", () => {
  for (const command of ["git status", "git diff", "git log", "git worktree list", "git add file", "git commit -m ok", "git push origin main"]) {
    assert.equal(isShipperCommand(command), true, command);
  }
  for (const command of ["git checkout main", "git reset --hard", "git worktree add ../other", "git push -f", "git push --force", "git push --force=origin/main", "git push --force-with-lease", "git push -ff", "git push --force-if-includes", "git commit --no-verify -m ok", "git commit -n -m ok", "git push --no-verify"]) {
    assert.equal(isShipperCommand(command), false, command);
  }
});
