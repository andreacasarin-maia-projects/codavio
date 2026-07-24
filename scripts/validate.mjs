#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8");
}

function json(relative) {
  return JSON.parse(read(relative));
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    ...options,
  });
  if (result.error) throw result.error;
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(" ")} failed:\n${result.stderr || result.stdout}`,
  );
  return result;
}

function frontmatter(relative) {
  const text = read(relative);
  assert.match(text, /^---\n[\s\S]*?\n---\n\n\S/, `${relative} has invalid frontmatter`);
  return text.slice(4, text.indexOf("\n---\n", 4));
}

function names(directory) {
  return fs
    .readdirSync(path.join(ROOT, directory))
    .filter((name) => name.endsWith(".md"))
    .map((name) => path.basename(name, ".md"))
    .sort();
}

function assertContains(relative, markers) {
  const text = read(relative);
  for (const marker of markers) {
    assert.ok(text.includes(marker), `${relative} is missing ${JSON.stringify(marker)}`);
  }
}

run(process.execPath, [path.join(ROOT, "scripts/generate.mjs"), "--check"]);

const manifest = json("workflow/manifest.json");
const ROLES = Object.keys(manifest.roles);
assert.equal(manifest.command, "dev");
for (const harness of ["opencode", "pi", "codex"]) {
  assert.deepEqual([...manifest.harnesses[harness].roles].sort(), [...ROLES].sort());
}

for (const role of [...ROLES, "orchestrator"]) {
  assert.ok(names(".opencode/agents").includes(role), `missing OpenCode ${role}`);
}
assert.ok(names(".opencode/commands").includes("dev"), "missing OpenCode dev command");
for (const role of ROLES) {
  assert.ok(names("pi/agents").includes(role), `missing Pi ${role}`);
}

assertContains("workflow/guidance/implementation.md", [
  "existing repository",
  "approved change boundary",
  "credentials or secrets",
  "Preserve unrelated",
]);
assertContains("workflow/guidance/verification.md", [
  "observable completion criteria",
  "repository-defined checks",
  "regression coverage",
  "Never introduce a test framework",
]);
for (const role of ["builder-junior", "builder-senior"]) {
  assertContains(`.opencode/agents/${role}.md`, [
    "## Implementation guidance",
    "## Verification guidance",
  ]);
  assertContains(`pi/agents/${role}.md`, [
    "## Implementation guidance",
    "## Verification guidance",
  ]);
}
assertContains(".opencode/agents/reviewer.md", ["## Verification guidance"]);
assertContains("pi/agents/reviewer.md", ["## Verification guidance"]);

assertContains("templates/AGENTS.global.md", [
  "Think Before Coding",
  "Simplicity First",
  "Surgical Changes",
  "Goal-Driven Execution",
]);
for (const forbidden of [
  "/dev",
  "builder-senior",
  "docker compose",
  ".worktrees",
  "openai/",
  "permission",
]) {
  assert.ok(
    !read("templates/AGENTS.global.md").toLowerCase().includes(forbidden.toLowerCase()),
    `templates/AGENTS.global.md must not contain workflow-specific marker ${forbidden}`,
  );
}

for (const role of ROLES) {
  assert.match(
    read(`workflow/roles/${role}.md`),
    /do not[\s\S]{0,200}delegate/i,
    `workflow/roles/${role}.md must forbid delegation`,
  );
  assert.match(frontmatter(`.opencode/agents/${role}.md`), /description:|name:/);
  assert.match(frontmatter(`pi/agents/${role}.md`), new RegExp(`name: ${role}`));
}

assertContains("workflow/orchestrator.md", [
  "QUICK",
  "BUGFIX",
  "FEATURE",
  "explicit approval",
  "shipping approval",
  ".ai/work",
  ".worktrees",
  "architecture implementation brief",
]);
assertContains("workflow/roles/analyst.md", [
  "problem-definition brief",
  "orthogonal solution families",
  "decision criteria",
  "belongs to the planner",
]);
assertContains("workflow/roles/planner.md", [
  "target components or modules",
  "interfaces, contracts",
  "data and state lifecycle",
  "ordered implementation slices",
]);
assertContains(".opencode/agents/orchestrator.md", [
  "mode: primary",
  "model: openai/gpt-5.6-terra",
  '"planner": allow',
]);
assertContains(".opencode/agents/planner.md", [
  "mode: subagent",
  "model: openai/gpt-5.6-sol",
  "edit: deny",
  "bash: deny",
]);
assertContains("pi/agents/planner.md", [
  "name: planner",
  "model: openai/gpt-5.6-sol",
  "tools: read,grep,find,ls",
  "maxSubagentDepth: 0",
]);
const roleModels = {
  analyst: "openai/gpt-5.6-sol",
  planner: "openai/gpt-5.6-sol",
  explorer: "openai/gpt-5.4-mini",
  "builder-junior": "openai/gpt-5.4-mini",
  "builder-senior": "openai/gpt-5.6-luna",
  reviewer: "openai/gpt-5.6-terra",
  shipper: "openai/gpt-5.4-mini",
};
for (const [role, model] of Object.entries(roleModels)) {
  assertContains(`.opencode/agents/${role}.md`, [`model: ${model}`]);
  assertContains(`pi/agents/${role}.md`, [`model: ${model}`]);
}
assertContains("pi/prompts/dev.md", [
  "$ARGUMENTS",
  ...ROLES,
  "Use each role's pinned model without a per-run model override.",
]);

const packageJson = json("package.json");
assert.equal(packageJson.dependencies["pi-subagents"], "0.35.1");
assert.deepEqual(packageJson.pi.subagents.agents, ["./pi/agents"]);
assert.equal(packageJson.scripts.generate, "node scripts/generate.mjs");
assert.equal(packageJson.scripts.validate, "node scripts/validate.mjs");

const plugin = json("codex/plugins/ai-dev-workflow/.codex-plugin/plugin.json");
assert.equal(plugin.name, "ai-dev-workflow");
assert.equal(plugin.skills, "./skills/");
const marketplace = json("codex/.agents/plugins/marketplace.json");
assert.equal(marketplace.name, "ai-dev-workflow");
assert.equal(marketplace.plugins.length, 1);
assert.equal(marketplace.plugins[0].name, plugin.name);
assertContains("codex/plugins/ai-dev-workflow/skills/dev-workflow/SKILL.md", [
  "name: dev-workflow",
  "gpt-5.6-sol",
  "gpt-5.6-terra",
  "gpt-5.4-mini",
  "gpt-5.6-luna",
  "main session model is selected in Codex",
  "explorer, builder-junior, and shipper",
  "builder-senior with `gpt-5.6-luna`",
  "shipping approval",
  "planner",
]);
assertContains(
  "codex/plugins/ai-dev-workflow/skills/dev-workflow/agents/openai.yaml",
  ["allow_implicit_invocation: false"],
);

for (const obsolete of [
  "scripts/install.sh",
  "scripts/install-pi.sh",
  "scripts/install-codex.sh",
  "scripts/install.py",
  "scripts/generate.py",
  "scripts/validate.py",
]) {
  assert.equal(fs.existsSync(path.join(ROOT, obsolete)), false, `${obsolete} still exists`);
}

const temporaryConfig = fs.mkdtempSync(path.join(os.tmpdir(), "ai-dev-workflow-validate-"));
try {
  run(process.execPath, [path.join(ROOT, "scripts/install.mjs"), "opencode"], {
    env: { ...process.env, XDG_CONFIG_HOME: temporaryConfig },
  });
  const installed = path.join(temporaryConfig, "opencode");
  assert.ok(fs.lstatSync(path.join(installed, "AGENTS.md")).isSymbolicLink());
  assert.deepEqual(
    fs.readdirSync(path.join(installed, "agents")).sort(),
    [...ROLES, "orchestrator"].map((role) => `${role}.md`).sort(),
  );
  assert.deepEqual(fs.readdirSync(path.join(installed, "commands")).sort(), ["dev.md"]);

  const fakeCli = path.join(temporaryConfig, "fake-cli.mjs");
  const fakeLog = path.join(temporaryConfig, "cli.log");
  fs.writeFileSync(
    fakeCli,
    `#!${process.execPath}
import fs from "node:fs";
fs.appendFileSync(process.env.FAKE_CLI_LOG, JSON.stringify(process.argv.slice(2)) + "\\n");
if (process.argv.includes("list")) console.log("pi-permission-system\\nai-dev-workflow");
`,
  );
  fs.chmodSync(fakeCli, 0o755);

  run(process.execPath, [path.join(ROOT, "scripts/install.mjs"), "pi"], {
    env: {
      ...process.env,
      NPM_BIN: fakeCli,
      PI_BIN: fakeCli,
      FAKE_CLI_LOG: fakeLog,
    },
  });
  const codexHome = path.join(temporaryConfig, "codex-home");
  run(process.execPath, [path.join(ROOT, "scripts/install.mjs"), "codex"], {
    env: {
      ...process.env,
      CODEX_BIN: fakeCli,
      CODEX_HOME: codexHome,
      FAKE_CLI_LOG: fakeLog,
    },
  });
  assert.ok(fs.lstatSync(path.join(codexHome, "AGENTS.md")).isSymbolicLink());
  const calls = fs.readFileSync(fakeLog, "utf8");
  assertContains("scripts/install.mjs", [
    "npm:@gotgenes/pi-permission-system",
    "ai-dev-workflow@ai-dev-workflow",
  ]);
  assert.ok(calls.includes('"marketplace","add"'));
  assert.ok(calls.includes('"install","npm:@gotgenes/pi-permission-system"'));
} finally {
  fs.rmSync(temporaryConfig, { recursive: true, force: true });
}

console.log("OK: generated adapters, native manifests, and unified installer integration");
