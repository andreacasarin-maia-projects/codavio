import test from "node:test";
import assert from "node:assert/strict";
import { builderCommandBlocked, coordinatorCommandBlocked, isNormalPush, isReviewerCommand, isShipperCommand } from "../pi/extensions/command-policy.ts";

test("reviewer allows only direct inspection Git commands", () => {
  for (const command of ["git status", "git diff --stat", "git log -1", "git worktree", "git worktree list"]) {
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

test("coordinator guard blocks only git diff and log reads", () => {
  for (const command of ["git diff", "git diff --stat", "git log", "git log -1", "/usr/bin/git diff", "command git log"]) {
    assert.equal(coordinatorCommandBlocked(command), true, command);
  }
  for (const command of ["git status --short", "git branch --show-current", "git rev-parse --show-toplevel", "git worktree list", "npm test", "ls"]) {
    assert.equal(coordinatorCommandBlocked(command), false, command);
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
  assert.equal(isNormalPush("git push origin main"), true);
  assert.equal(isNormalPush("git push --force"), false);
});
