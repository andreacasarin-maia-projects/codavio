#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUILD = path.join(ROOT, "build");
const CODE = String.fromCharCode(96);

function read(relative) { return fs.readFileSync(path.join(ROOT, relative), "utf8"); }
function json(relative) { return JSON.parse(read(relative)); }

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: ROOT, encoding: "utf8", ...options });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, command + " " + args.join(" ") + " failed:\n" +
    (result.stderr || result.stdout));
  return result;
}

function fails(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: ROOT, encoding: "utf8", ...options });
  assert.notEqual(result.status, 0, command + " unexpectedly succeeded");
  return result;
}

function names(relative) {
  return fs.readdirSync(path.join(ROOT, relative)).sort();
}

function contains(relative, markers) {
  const text = read(relative);
  for (const marker of markers) assert.ok(text.includes(marker), relative + " missing " + marker);
}

function frontmatter(relative) {
  const text = read(relative);
  assert.match(text, /^---\n[\s\S]*?\n---\n\n\S/, relative + " has invalid frontmatter");
  return text.slice(4, text.indexOf("\n---\n", 4));
}

function linkTarget(relative) {
  const target = path.join(ROOT, relative);
  assert.ok(fs.lstatSync(target).isSymbolicLink(), relative + " is not a symlink");
  return path.resolve(path.dirname(target), fs.readlinkSync(target));
}

function generated(relative) { return path.join("build", relative); }

for (const relative of ["build/opencode", "build/pi", "build/codex"]) {
  fs.rmSync(path.join(ROOT, relative), { recursive: true, force: true });
}
const beforeGeneration = run("git", ["status", "--porcelain"]).stdout;
run(process.execPath, [path.join(ROOT, "scripts/generate.mjs")]);
run(process.execPath, [path.join(ROOT, "scripts/generate.mjs"), "--check"]);
assert.equal(run("git", ["status", "--porcelain"]).stdout, beforeGeneration,
  "generation changed Git-tracked files");

const manifest = json("workflow/manifest.json");
const capabilities = json("workflow/capabilities.json");
const ROLES = Object.keys(manifest.roles);
assert.equal(manifest.command, "codavio");
assert.deepEqual(ROLES, ["analyst", "planner", "explorer", "builder", "reviewer", "shipper"]);
assert.deepEqual(Object.keys(capabilities.roles), ["orchestrator", ...ROLES]);
for (const [role, capability] of Object.entries(capabilities.roles)) {
  assert.ok(["gpt-6-astra", "gpt-6-sol", "gpt-6-luna"].includes(capability.model),
    role + " has an unsupported model");
  assert.ok(["low", "medium", "high"].includes(capability.reasoning),
    role + " has an unsupported reasoning level");
  if (role === "orchestrator") {
    assert.equal(typeof capability.description, "string", "orchestrator has no description");
  } else {
    assert.equal("description" in capability, false,
      role + " description belongs only in workflow/manifest.json");
  }
}
for (const [role, definition] of Object.entries(manifest.roles)) {
  assert.equal(typeof definition.description, "string", role + " has no description");
  assert.ok(definition.description.length > 0, role + " has an empty description");
}
for (const harness of ["opencode", "pi", "codex"]) {
  assert.deepEqual([...manifest.harnesses[harness].roles].sort(), [...ROLES].sort());
}

contains("workflow/guidance/implementation.md", [
  "existing repository", "approved change boundary", "credentials or secrets", "Preserve unrelated",
]);
contains("workflow/guidance/code-quality.md", [
  "ongoing liability", "reasons to change", "cognitive load", "change blast radius",
  "approximately 500 human-authored lines", "responsibility-review trigger",
  "volatile design decisions", "automate the", "semantic edits", "fragmented micro-files",
]);
contains("workflow/guidance/verification.md", [
  "observable completion criteria", "repository-defined checks", "regression coverage",
  "Never introduce a test framework",
]);
contains("workflow/guidance/web-use.md", [
  "Web research guidance", "official or primary sources", "Never paste whole pages",
]);
contains("workflow/guidance/memory.md", [
  "Repository memory", "read the applicable `AGENTS.md` first", "`AGENTS.md` is authoritative",
]);
contains("workflow/guidance/work-state.md", [
  "`.ai/work/<work-id>.md`", "stable, lowercase, hyphenated feature name",
  "legacy `.ai/work/<branch-slug>.md`", "Multiple work items may coexist", "### Task graph",
  "### Commit plan", "minimal task envelope",
]);
contains("workflow/capabilities.md", [
  "orchestrator → `work-state.md`", "every role → `memory.md`",
  "planner, builder, and reviewer → `code-quality.md`",
  "builder gets memory, code quality, implementation", "reviewer gets memory, code quality",
]);
contains("templates/AGENTS.global.md", [
  "Think Before Coding", "Simplicity First", "Surgical Changes", "Goal-Driven Execution",
  "repository-root `MEMORY.md`", "`AGENTS.md` is authoritative",
]);
for (const forbidden of ["/codavio", "/dev", "builder", "docker compose", ".worktrees", "openai/", "permission"]) {
  assert.ok(!read("templates/AGENTS.global.md").toLowerCase().includes(forbidden.toLowerCase()),
    "templates/AGENTS.global.md must not contain workflow-specific marker " + forbidden);
}
for (const role of ROLES) {
  assert.match(read("workflow/roles/" + role + ".md"), /do not[\s\S]{0,200}delegate/i,
    "workflow/roles/" + role + ".md must forbid delegation");
}
contains("workflow/orchestrator.md", [
  "QUICK", "BUGFIX", "FEATURE", "explicit approval", "shipping approval", ".ai/work",
  ".worktrees", "Implementation plan", "Routing is a mandatory, visible gate",
  "The analyst is mandatory for every FEATURE", "actual builder invocation",
  "always invoke the analyst first", "definition confidence", "`DISCOVERY` exploration brief",
  "`PLANNING` exploration brief", "explicit feature acceptance", "<work-id>",
  "After every implementation path completes successful verification",
  "Role definitions are capability profiles, not singletons",
  "Invoke multiple explorers", "Invoke multiple builders", "memory closeout",
  "Zero is valid", "dense living bullet list",
]);
contains("MEMORY.md", ["# Repository memory", "compact living context", "defer to `AGENTS.md`"]);
contains("workflow/roles/analyst.md", [
  "product analyst and solution-design partner", "definition confidence", "`HIGH`", "`MEDIUM`",
  "`LOW`", "Event Storming", "flow analysis", "recommended answer", "proposed feature definition",
  "belongs to the planner",
]);
contains("workflow/roles/planner.md", [
  "approved feature definition", "focused exploration brief", "target components or modules",
  "interfaces, contracts", "data and state lifecycle", "executable task graph",
  "### Architecture decisions", "### Task graph", "### Integration verification", "### Commit plan",
  "acceptance scenario", "owning component", "activated dimensions", "explicit cohesion assessment",
  "approximately 500 human-authored lines", "large mechanical refactor",
  "advisory or compulsory policy", "destructive contraction", "acceptable regression threshold",
]);
contains("workflow/roles/reviewer.md", [
  "readability and simplicity", "performance and resource bounds", "maintained result",
  "approximately 500 lines", "Size alone is not a finding", "fragmented micro-files",
  "`BLOCKER`, `OPTIONAL`, or `FYI`", "smallest acceptable correction",
  "commit plan maps cleanly",
]);
contains("workflow/roles/explorer.md", ["`DISCOVERY`", "`PLANNING`", "`BUGFIX`", "supply evidence"]);
contains("pi/extensions/workflow.ts", [
  "work_id", "Report or list AI workflow work-item status", "legacy branch-named state",
  "Work items:",
]);

assert.deepEqual(names(generated("opencode/agents")),
  [...ROLES, "orchestrator"].map((role) => role + ".md").sort());
assert.deepEqual(names(generated("opencode/commands")), ["codavio.md"]);
assert.deepEqual(names(generated("pi/pi/agents")), ROLES.map((role) => role + ".md").sort());
assert.deepEqual(names(generated("pi/pi/prompts")), ["codavio.md"]);
assert.ok(fs.existsSync(path.join(BUILD, "pi/package.json")));
assert.ok(fs.existsSync(path.join(BUILD, "pi/package-lock.json")));
assert.deepEqual(names(generated("pi/pi/extensions")), names("pi/extensions"));
assert.ok(fs.existsSync(path.join(BUILD, "codex/AGENTS.md")));
assert.ok(fs.existsSync(path.join(BUILD, "codex/.agents/plugins/marketplace.json")));
assert.ok(fs.existsSync(path.join(BUILD,
  "codex/plugins/codavio/.codex-plugin/plugin.json")));
assert.ok(fs.existsSync(path.join(BUILD,
  "codex/plugins/codavio/skills/codavio/agents/openai.yaml")));

for (const role of ROLES) {
  const description = manifest.roles[role].description;
  contains(generated("opencode/agents/" + role + ".md"),
    ["description: " + description, "mode: subagent"]);
  contains(generated("pi/pi/agents/" + role + ".md"),
    ["name: " + role, "description: " + description, "maxSubagentDepth: 0"]);
  contains(generated("opencode/agents/" + role + ".md"), ["## Repository memory"]);
  contains(generated("pi/pi/agents/" + role + ".md"), ["## Repository memory"]);
  assert.match(frontmatter(generated("opencode/agents/" + role + ".md")), /description:|name:/);
  assert.match(frontmatter(generated("pi/pi/agents/" + role + ".md")),
    new RegExp("name: " + role));
}
contains(generated("opencode/agents/builder.md"), [
  "## Code quality guidance", "## Implementation guidance", "## Verification guidance",
]);
contains(generated("pi/pi/agents/builder.md"), [
  "## Code quality guidance", "## Implementation guidance", "## Verification guidance",
]);
contains(generated("opencode/agents/reviewer.md"),
  ["## Code quality guidance", "## Verification guidance"]);
contains(generated("pi/pi/agents/reviewer.md"),
  ["## Code quality guidance", "## Verification guidance"]);
for (const relative of [
  "opencode/agents/builder.md", "pi/pi/agents/builder.md",
  "opencode/agents/planner.md", "pi/pi/agents/planner.md",
  "opencode/agents/reviewer.md", "pi/pi/agents/reviewer.md",
]) {
  contains(generated(relative), [
    "## Code quality guidance", "ongoing liability", "raw line count",
    "approximately 500 human-authored lines",
  ]);
}
for (const role of ["analyst", "planner"]) {
  contains(generated("opencode/agents/" + role + ".md"), ["## Web research guidance"]);
  contains(generated("pi/pi/agents/" + role + ".md"),
    ["## Web research guidance", "web_search", "fetch_content"]);
}
contains(generated("codex/plugins/codavio/skills/codavio/references/roles.md"),
  ["## Web research guidance", "## Code quality guidance", "ongoing liability",
    "approximately 500 human-authored lines", "`BLOCKER`, `OPTIONAL`, or `FYI`"]);
for (const role of ["explorer", "builder", "reviewer", "orchestrator", "shipper"]) {
  contains(generated("opencode/agents/" + role + ".md"), ["webfetch: deny", "websearch: deny"]);
}
contains(generated("opencode/agents/orchestrator.md"), [
  "mode: primary", "\"planner\": allow",
  "## Repository memory", "`AGENTS.md` is authoritative",
]);
contains(generated("opencode/agents/planner.md"), [
  "mode: subagent", "edit: deny", "bash: deny",
]);
contains(generated("pi/pi/agents/planner.md"), [
  "tools: read,grep,find,ls",
]);
for (const role of ROLES) {
  const model = "openai/" + capabilities.roles[role].model;
  contains(generated("opencode/agents/" + role + ".md"), ["model: " + model]);
  contains(generated("pi/pi/agents/" + role + ".md"), ["model: " + model]);
  contains(generated("opencode/agents/" + role + ".md"),
    ["reasoningEffort: " + capabilities.roles[role].reasoning]);
  contains(generated("pi/pi/agents/" + role + ".md"),
    ["thinking: " + capabilities.roles[role].reasoning]);
}
const packageJson = json("package.json");
assert.equal(packageJson.name, "codavio");
assert.equal(packageJson.license, "MIT");
assert.equal(packageJson.repository.url,
  "git+https://github.com/andreacasarin-maia-projects/codavio.git");
assert.equal(packageJson.dependencies["pi-subagents"], "0.35.1");
assert.deepEqual(packageJson.pi.subagents.agents, ["./pi/agents"]);
assert.equal(packageJson.scripts.generate, "node scripts/generate.mjs");
assert.equal(packageJson.scripts.validate, "node scripts/validate.mjs");

const plugin = json("codex/plugins/codavio/.codex-plugin/plugin.json");
assert.equal(plugin.name, "codavio");
assert.equal(plugin.skills, "./skills/");
const marketplace = json("codex/.agents/plugins/marketplace.json");
assert.equal(marketplace.name, "codavio");
assert.equal(marketplace.plugins.length, 1);
assert.equal(marketplace.plugins[0].name, plugin.name);
assert.equal(marketplace.plugins[0].source.path, "./plugins/codavio");

contains(generated("opencode/commands/codavio.md"), [
  "$ARGUMENTS", "generated into the `orchestrator`", "feature definition", "approved shipping",
]);
contains(generated("pi/pi/prompts/codavio.md"), [
  "$ARGUMENTS", "`pi-subagents`", "pinned model", "`<project-root>/.worktrees/`",
  "`.ai/work/<work-id>.md`", "Use each role's pinned model and reasoning without a per-run override.",
  ...ROLES,
]);
contains(generated("codex/plugins/codavio/skills/codavio/SKILL.md"), [
  "name: codavio", "$codavio", "# Codavio", "`gpt-6-astra`", "`gpt-6-sol`",
  "`gpt-6-luna`", "`medium` reasoning", "`high` reasoning", "`low` reasoning",
  "`fork_turns: \"none\"`", "[roles.md](references/roles.md)",
]);
contains(generated("codex/plugins/codavio/skills/codavio/references/roles.md"), [
  "canonical `workflow/roles/` sources", "active worktree, `AGENTS.md`",
  "only the referenced decisions and acceptance scenarios", "peer path boundaries",
  "network sandbox escalation", "sandbox_permissions: \"require_escalated\"",
]);
contains(generated("codex/plugins/codavio/skills/codavio/agents/openai.yaml"),
  ["allow_implicit_invocation: false"]);
contains(generated("codex/plugins/codavio/skills/codavio/SKILL.md"), [
  "main session model is selected in Codex", "explorer and shipper",
  "shipper with " + CODE + "gpt-6-luna" + CODE, "shipping approval", "planner",
  "Route: QUICK", "The analyst is mandatory for every FEATURE", "actual builder invocation",
  "definition confidence", "explicit feature acceptance", ".ai/work/<work-id>.md",
  "Invoke multiple explorers", "Invoke multiple builders", "memory closeout",
  "## Repository memory",
]);
for (const obsolete of [
  "scripts/install.sh", "scripts/install-pi.sh", "scripts/install-codex.sh", "scripts/install.py",
  "scripts/generate.py", "scripts/validate.py",
]) {
  assert.equal(fs.existsSync(path.join(ROOT, obsolete)), false, obsolete + " still exists");
}

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "codavio-validate-"));
try {
  const fakeCli = path.join(temporary, "fake-cli.mjs");
  const fakeLog = path.join(temporary, "cli.log");
  fs.writeFileSync(fakeCli, "#!" + process.execPath + "\n" +
    "import fs from 'node:fs';\n" +
    "fs.appendFileSync(process.env.FAKE_CLI_LOG, JSON.stringify(process.argv.slice(2)) + '\\n');\n" +
    "if (process.argv.includes('--json')) console.log(JSON.stringify({ marketplaces: process.env.FAKE_MARKETPLACE_ROOT ? [{ name: 'codavio', root: process.env.FAKE_MARKETPLACE_ROOT }] : [] }));\n" +
    "if (process.argv.includes('list') && !process.argv.includes('--json')) console.log('pi-permission-system\\ncodavio');\n");
  fs.chmodSync(fakeCli, 0o755);

  fs.rmSync(path.join(BUILD, "opencode"), { recursive: true, force: true });
  run(process.execPath, [path.join(ROOT, "scripts/install.mjs"), "opencode"], {
    env: { ...process.env, XDG_CONFIG_HOME: temporary },
  });
  const installed = path.join(temporary, "opencode");
  assert.equal(linkTarget(path.relative(ROOT, path.join(installed, "AGENTS.md"))),
    path.join(BUILD, "opencode/AGENTS.md"));
  for (const role of [...ROLES, "orchestrator"]) {
    assert.equal(linkTarget(path.relative(ROOT, path.join(installed, "agents", role + ".md"))),
      path.join(BUILD, "opencode/agents", role + ".md"));
  }
  assert.equal(linkTarget(path.relative(ROOT, path.join(installed, "commands", "codavio.md"))),
    path.join(BUILD, "opencode/commands/codavio.md"));

  fs.rmSync(path.join(BUILD, "pi"), { recursive: true, force: true });
  run(process.execPath, [path.join(ROOT, "scripts/install.mjs"), "pi"], {
    env: { ...process.env, NPM_BIN: fakeCli, PI_BIN: fakeCli, FAKE_CLI_LOG: fakeLog },
  });
  const codexHome = path.join(temporary, "codex-home");
  fs.rmSync(path.join(BUILD, "codex"), { recursive: true, force: true });
  run(process.execPath, [path.join(ROOT, "scripts/install.mjs"), "codex"], {
    env: { ...process.env, CODEX_BIN: fakeCli, CODEX_HOME: codexHome, FAKE_CLI_LOG: fakeLog },
  });
  assert.equal(linkTarget(path.relative(ROOT, path.join(codexHome, "AGENTS.md"))),
    path.join(BUILD, "codex/AGENTS.md"));

  const codexLegacyHome = path.join(temporary, "codex-legacy");
  fs.mkdirSync(codexLegacyHome, { recursive: true });
  const codexLegacyAgents = path.join(codexLegacyHome, "AGENTS.md");
  fs.symlinkSync(path.join(ROOT, "templates/AGENTS.global.md"), codexLegacyAgents);
  run(process.execPath, [path.join(ROOT, "scripts/install.mjs"), "codex"], {
    env: { ...process.env, CODEX_BIN: fakeCli, CODEX_HOME: codexLegacyHome, FAKE_CLI_LOG: fakeLog },
  });
  assert.equal(linkTarget(path.relative(ROOT, codexLegacyAgents)), path.join(BUILD, "codex/AGENTS.md"));

  const wrongCodexHome = path.join(temporary, "codex-wrong-legacy");
  fs.mkdirSync(wrongCodexHome, { recursive: true });
  const wrongCodexAgents = path.join(wrongCodexHome, "AGENTS.md");
  fs.symlinkSync(path.join(ROOT, ".opencode/agents/analyst.md"), wrongCodexAgents);
  fails(process.execPath, [path.join(ROOT, "scripts/install.mjs"), "codex"], {
    env: { ...process.env, CODEX_BIN: fakeCli, CODEX_HOME: wrongCodexHome, FAKE_CLI_LOG: fakeLog },
  });
  assert.equal(path.resolve(path.dirname(wrongCodexAgents), fs.readlinkSync(wrongCodexAgents)),
    path.join(ROOT, ".opencode/agents/analyst.md"));

  const calls = fs.readFileSync(fakeLog, "utf8");
  assert.ok(calls.includes(JSON.stringify(["install", "npm:@gotgenes/pi-permission-system"])));
  assert.ok(calls.includes(JSON.stringify(["install", "npm:pi-web-access"])));
  assert.ok(calls.includes(JSON.stringify(["install", path.join(BUILD, "pi")])));
  assert.ok(calls.includes(JSON.stringify(["plugin", "marketplace", "add", path.join(BUILD, "codex")])));

  const staleMarketplaceHome = path.join(temporary, "codex-stale-marketplace");
  run(process.execPath, [path.join(ROOT, "scripts/install.mjs"), "codex", "--force"], {
    env: {
      ...process.env,
      CODEX_BIN: fakeCli,
      CODEX_HOME: staleMarketplaceHome,
      FAKE_CLI_LOG: fakeLog,
      FAKE_MARKETPLACE_ROOT: path.join(ROOT, "codex"),
    },
  });
  const staleCalls = fs.readFileSync(fakeLog, "utf8");
  assert.ok(staleCalls.includes(JSON.stringify(["plugin", "marketplace", "remove", "codavio"])));

  const legacyRoot = path.join(temporary, "legacy");
  const legacyAgents = path.join(legacyRoot, "opencode", "agents");
  fs.mkdirSync(legacyAgents, { recursive: true });
  fs.symlinkSync(path.join(ROOT, ".opencode/agents/analyst.md"),
    path.join(legacyAgents, "analyst.md"));
  run(process.execPath, [path.join(ROOT, "scripts/install.mjs"), "opencode"], {
    env: { ...process.env, XDG_CONFIG_HOME: legacyRoot },
  });
  assert.equal(linkTarget(path.relative(ROOT, path.join(legacyAgents, "analyst.md"))),
    path.join(BUILD, "opencode/agents/analyst.md"));

  const wrongLegacyRoot = path.join(temporary, "wrong-legacy");
  const wrongLegacyAgents = path.join(wrongLegacyRoot, "opencode", "agents");
  fs.mkdirSync(wrongLegacyAgents, { recursive: true });
  const wrongLegacy = path.join(wrongLegacyAgents, "explorer.md");
  fs.symlinkSync(path.join(ROOT, ".opencode/agents/analyst.md"), wrongLegacy);
  fails(process.execPath, [path.join(ROOT, "scripts/install.mjs"), "opencode"], {
    env: { ...process.env, XDG_CONFIG_HOME: wrongLegacyRoot },
  });
  assert.equal(path.resolve(path.dirname(wrongLegacy), fs.readlinkSync(wrongLegacy)),
    path.join(ROOT, ".opencode/agents/analyst.md"));

  const conflictRoot = path.join(temporary, "conflict");
  fs.mkdirSync(path.join(conflictRoot, "opencode"), { recursive: true });
  fs.writeFileSync(path.join(conflictRoot, "opencode", "AGENTS.md"), "unrelated");
  fails(process.execPath, [path.join(ROOT, "scripts/install.mjs"), "opencode"], {
    env: { ...process.env, XDG_CONFIG_HOME: conflictRoot },
  });
  fs.writeFileSync(path.join(conflictRoot, "opencode", "AGENTS.md.backup"), "backup");
  fails(process.execPath, [path.join(ROOT, "scripts/install.mjs"), "opencode", "--force"], {
    env: { ...process.env, XDG_CONFIG_HOME: conflictRoot },
  });

  const forceRoot = path.join(temporary, "force");
  const forceOpenCode = path.join(forceRoot, "opencode");
  fs.mkdirSync(forceOpenCode, { recursive: true });
  const forceTarget = path.join(forceOpenCode, "AGENTS.md");
  fs.writeFileSync(forceTarget, "unrelated guidance");
  run(process.execPath, [path.join(ROOT, "scripts/install.mjs"), "opencode", "--force"], {
    env: { ...process.env, XDG_CONFIG_HOME: forceRoot },
  });
  assert.equal(fs.readFileSync(forceTarget + ".backup", "utf8"), "unrelated guidance");
  assert.equal(linkTarget(path.relative(ROOT, forceTarget)), path.join(BUILD, "opencode/AGENTS.md"));
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

console.log("OK: build outputs, native metadata, and installer integration");
