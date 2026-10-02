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
function skillFor(role) { return manifest.roleSkills[role]; }
function skillSource(role) { return "skills/" + skillFor(role) + "/SKILL.md"; }
function skillBody(role) {
  const text = read(skillSource(role));
  return text.slice(text.indexOf("\n---\n", 4) + 5).trim();
}
function guidancePath(name) { return "workflow/guidance/" + name + ".md"; }
function expectedGuidance(role) {
  const capability = json("workflow/capabilities.json").roles[role];
  const docs = [];
  if (["analyst", "builder", "reviewer"].includes(role)) docs.push("code-quality");
  if (capability.edit === "owned" && capability.shell.startsWith("verify")) docs.push("implementation");
  if (capability.shell.startsWith("verify") || capability.git === "inspect") docs.push("verification");
  if (capability.web) docs.push("web-use");
  return docs;
}
function assertRoleArtifact(role, relative, harness) {
  const artifact = read(generated(relative));
  contains(generated(relative), [read("workflow/roles/" + role + ".md").trim()]);
  for (const guidance of expectedGuidance(role)) {
    contains(generated(relative), [read(guidancePath(guidance)).trim()]);
  }
  for (const other of ROLES) {
    if (other === role) continue;
    assert.ok(!artifact.includes(read("workflow/roles/" + other + ".md").trim()),
      relative + " embeds the " + other + " role body");
  }
  for (const worker of ROLES) {
    assert.ok(!artifact.includes(skillBody(worker)),
      relative + " embeds the " + worker + " skill procedure");
  }
  assert.ok(!artifact.includes(read("skills/codavio-archive/references/adrs.md").trim()),
    relative + " eagerly embeds ADR maintenance guidance");
  contains(generated(relative), [skillFor(role), "load", "stop"]);
  const capability = json("workflow/capabilities.json").roles[role];
  if (harness === "opencode") {
    contains(generated(relative), [
      "model: openai/" + capability.model,
      "reasoningEffort: " + capability.reasoning,
      `"${skillFor(role)}": allow`,
      "webfetch: " + (capability.web ? "allow" : "deny"),
      "websearch: " + (capability.web ? "allow" : "deny"),
    ]);
  } else if (harness === "pi") {
    contains(generated(relative), [
      "model: openai/" + capability.model,
      "thinking: " + capability.reasoning,
      "inheritProjectContext: false",
      "inheritSkills: false",
      "skills: " + skillFor(role),
      "skillPath: ../../skills",
    ]);
  } else {
    contains(generated(relative), [
      "Model assignment: `" + capability.model + "` at `" + capability.reasoning + "` reasoning.",
      "Return the complete deliverable and evidence required by this brief",
    ]);
  }
}

for (const relative of ["build/opencode", "build/pi", "build/codex"]) {
  fs.rmSync(path.join(ROOT, relative), { recursive: true, force: true });
}
const beforeGeneration = run("git", ["status", "--porcelain"]).stdout;
run(process.execPath, [path.join(ROOT, "scripts/generate.mjs")]);
run(process.execPath, [path.join(ROOT, "scripts/generate.mjs"), "--check"]);
assert.equal(run("git", ["status", "--porcelain"]).stdout, beforeGeneration,
  "generation changed Git-tracked files");
const staleCodexAggregate = path.join(BUILD,
  "codex/plugins/codavio/skills/codavio-orchestrate/references/roles.md");
fs.writeFileSync(staleCodexAggregate, "stale aggregate");
const staleAggregateCheck = fails(process.execPath,
  [path.join(ROOT, "scripts/generate.mjs"), "--check"]);
assert.ok((staleAggregateCheck.stderr + staleAggregateCheck.stdout).includes(
  "UNEXPECTED: build/codex/plugins/codavio/skills/codavio-orchestrate/references/roles.md"),
  "check mode did not identify the obsolete Codex aggregate");
run(process.execPath, [path.join(ROOT, "scripts/generate.mjs")]);
assert.equal(fs.existsSync(staleCodexAggregate), false,
  "normal generation retained the obsolete Codex aggregate");
run(process.execPath, [path.join(ROOT, "scripts/generate.mjs"), "--check"]);

const manifest = json("workflow/manifest.json");
const capabilities = json("workflow/capabilities.json");
const ROLES = Object.keys(manifest.roles);
const ALL_ROLES = ["orchestrator", ...ROLES];
const ROLE_SKILLS = {
  orchestrator: "codavio-orchestrate",
  designer: "codavio-design",
  analyst: "codavio-analyze",
  explorer: "codavio-explore",
  archivist: "codavio-archive",
  builder: "codavio-build",
  reviewer: "codavio-review",
  shipper: "codavio-ship",
};
const SKILLS = Object.values(ROLE_SKILLS);
assert.equal(manifest.command, "codavio");
assert.deepEqual(ROLES, ["designer", "analyst", "explorer", "archivist", "builder", "reviewer", "shipper"]);
assert.deepEqual(manifest.roleSkills, ROLE_SKILLS);
assert.deepEqual(names("skills"), [...SKILLS].sort());
assert.deepEqual(names("workflow/roles"), ROLES.map((role) => role + ".md").sort());
assert.deepEqual(Object.keys(capabilities.roles), ALL_ROLES);
assert.equal(capabilities.roles.orchestrator.worktreeLifecycle, "ask");
for (const role of ROLES) assert.equal("worktreeLifecycle" in capabilities.roles[role], false,
  role + " must not own worktree lifecycle");
for (const role of ALL_ROLES) assert.equal("unmanagedWorktreeFallback" in capabilities.roles[role], false,
  role + " must not own unmanaged worktree lifecycle");
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
assert.equal(fs.existsSync(path.join(ROOT,
  "skills/codavio-orchestrate/references/memory.md")), false,
  "legacy memory guidance must not remain a workflow source");
assert.equal(fs.existsSync(path.join(ROOT,
  "skills/codavio-orchestrate/references/adrs.md")), false,
  "ADR maintenance belongs only to the documentation skill");
assert.equal(spawnSync("git", ["check-ignore", "--no-index", ".ai/adrs/living-adrs.md"],
  { cwd: ROOT }).status, 1, "living ADRs must be versionable");
assert.equal(spawnSync("git", ["check-ignore", "--no-index", ".ai/work/example.md"],
  { cwd: ROOT }).status, 0, "runtime work state must remain ignored");
contains("skills/codavio-orchestrate/references/work-state.md", [
  "`.ai/work/<work-id>.md`", "stable, lowercase, hyphenated feature name",
  "legacy `.ai/work/<branch-slug>.md`", "Multiple work items may coexist",
  "A bounded change may contain one task", "minimal ephemeral envelope", "lifecycle_owner",
  "Work in the current checkout by default", "Workspace changes require an explicit user request",
  "Never create, switch, attach, or clean up worktrees",
  "Always keep `.ai/work/` inside the current checkout",
  "Recorded checkout metadata is resume context", "stop before dependent work",
  "At entry and resume, read the current branch and short Git status",
  "## Dispatch and delivery contract", "After each task or parallel group, update `## Delivery state`",
  "Legacy records may retain a `route`", "current blockers and the next task explicit",
  "worker failure, or unexpected required-check failure",
]);
contains("workflow/capabilities.md", ["roleSkills", "Portable Agent Skill", "native `skill` permission"]);
contains("templates/AGENTS.global.md", [
  "Think Before Coding", "Simplicity First", "Surgical Changes", "Goal-Driven Execution",
]);
for (const forbidden of [
  "/codavio", "/dev", "builder", "docker compose", ".worktrees", "openai/", "permission",
  "MEMORY.md", "adrs/",
]) {
  assert.ok(!read("templates/AGENTS.global.md").toLowerCase().includes(forbidden.toLowerCase()),
    "templates/AGENTS.global.md must not contain workflow-specific marker " + forbidden);
}
for (const role of ROLES) {
  assert.match(read("workflow/roles/" + role + ".md"), /do not[\s\S]{0,200}delegate/i,
    "workflow/roles/" + role + ".md must forbid delegation");
  contains("workflow/roles/" + role + ".md", [skillFor(role), "load", "stop"]);
}
contains("workflow/orchestrator.md", [
  "coordination-only", "`codavio-orchestrate`", "every subsequent user turn",
  "remembered from an earlier turn", "deviation changes routing", "authority. Continue", "stop",
]);
contains("skills/codavio-design/SKILL.md", [
  "product and domain design partner", "definition confidence", "`HIGH`", "`MEDIUM`", "`LOW`",
  "Event Storming", "actor and event flows", "proposed definition", "Never treat a recommendation as approval",
]);
contains("skills/codavio-analyze/SKILL.md", [
  "smallest repository-native implementation brief", "closest exemplary implementation",
  "### Minimum change", "justification for every new abstraction", "Parallel builders require design-independent work",
  "Default to one focused commit", "Stop rather than choosing a new public API",
]);
contains("skills/codavio-review/SKILL.md", [
  "readability and simplicity", "performance and resource bounds", "maintained result",
  "approximately 500 lines", "Size alone is not a finding", "fragmented micro-files",
  "`BLOCKER`, `OPTIONAL`, or `FYI`", "smallest acceptable correction",
  "commit plan maps cleanly",
]);
contains("skills/codavio-explore/SKILL.md", ["purpose and focused questions", "supply evidence"]);
contains("skills/codavio-orchestrate/SKILL.md", [
  "`Start: Builder`", "`Start: Analyst`", "`Start: Designer`", "Silence is never approval",
  "shipping approval", "Prefer one builder", "ADR and documentation closeout",
  "at the beginning of every active turn", "Deviations change routing", "authority.",
]);
for (const role of ALL_ROLES) {
  const relative = skillSource(role);
  const skillFrontmatter = frontmatter(relative);
  contains(relative, [
    "name: " + skillFor(role),
    "description:",
  ]);
  assert.ok(skillFrontmatter.length > 0, relative + " has empty frontmatter");
}
contains("pi/extensions/workflow.ts", [
  "work_id", "Report or list AI workflow work-item status", "legacy branch-named state",
  "Work items:",
]);

assert.deepEqual(names(generated("opencode/agents")),
  [...ROLES, "orchestrator"].map((role) => role + ".md").sort());
assert.deepEqual(names(generated("opencode/commands")), ["codavio.md"]);
assert.deepEqual(names(generated("opencode/skills")), [...SKILLS].sort());
assert.equal(fs.existsSync(path.join(BUILD, "opencode/references")), false,
  "OpenCode must use its native agent artifacts without duplicate references");
assert.deepEqual(names(generated("pi/pi/agents")), ROLES.map((role) => role + ".md").sort());
assert.deepEqual(names(generated("pi/pi/prompts")), ["codavio.md"]);
assert.deepEqual(names(generated("pi/skills")), [...SKILLS].sort());
assert.equal(fs.existsSync(path.join(BUILD, "pi/pi/references")), false,
  "Pi must use its native agent artifacts without duplicate references");
assert.ok(fs.existsSync(path.join(BUILD, "pi/package.json")));
assert.ok(fs.existsSync(path.join(BUILD, "pi/package-lock.json")));
assert.deepEqual(names(generated("pi/pi/extensions")), names("pi/extensions"));
assert.ok(fs.existsSync(path.join(BUILD, "codex/AGENTS.md")));
assert.ok(fs.existsSync(path.join(BUILD, "codex/.agents/plugins/marketplace.json")));
assert.ok(fs.existsSync(path.join(BUILD,
  "codex/plugins/codavio/.codex-plugin/plugin.json")));
assert.ok(fs.existsSync(path.join(BUILD,
  "codex/plugins/codavio/skills/codavio/agents/openai.yaml")));
assert.deepEqual(names(generated("codex/plugins/codavio/skills")), ["codavio", ...SKILLS].sort());
const codexReferences = generated("codex/plugins/codavio/skills/codavio-orchestrate/references");
assert.deepEqual(names(codexReferences),
  [...ROLES.map((role) => role + ".md"), "work-state.md"].sort());
assert.equal(fs.existsSync(path.join(BUILD,
  "codex/plugins/codavio/skills/codavio-orchestrate/references/roles.md")), false,
  "Codex generated tree contains no aggregate role brief");

for (const skill of SKILLS) {
  for (const harnessRoot of ["opencode/skills", "pi/skills"]) {
    contains(generated(harnessRoot + "/" + skill + "/SKILL.md"), ["name: " + skill]);
  }
  contains(generated("codex/plugins/codavio/skills/" + skill + "/agents/openai.yaml"),
    ["allow_implicit_invocation: false"]);
  for (const skillRoot of [
    "skills", "build/opencode/skills", "build/pi/skills", "build/codex/plugins/codavio/skills",
  ]) {
    const source = path.join(skillRoot, skill, "SKILL.md");
    for (const match of read(source).matchAll(/\[[^\]]+\]\(([^)#]+\.md)(?:#[^)]*)?\)/g)) {
      if (/^https?:/.test(match[1])) continue;
      const target = path.resolve(ROOT, path.dirname(source), match[1]);
      assert.ok(fs.existsSync(target), source + " has an unresolved reference: " + match[1]);
    }
  }
}

for (const role of ROLES) {
  assertRoleArtifact(role, "opencode/agents/" + role + ".md", "opencode");
  assertRoleArtifact(role, "pi/pi/agents/" + role + ".md", "pi");
  assertRoleArtifact(role,
    "codex/plugins/codavio/skills/codavio-orchestrate/references/" + role + ".md", "codex");
  const description = manifest.roles[role].description;
  contains(generated("opencode/agents/" + role + ".md"),
    ["description: " + description, "mode: subagent"]);
  contains(generated("pi/pi/agents/" + role + ".md"),
    ["name: " + role, "description: " + description, "maxSubagentDepth: 0"]);
  assert.match(frontmatter(generated("opencode/agents/" + role + ".md")), /description:|name:/);
  assert.match(frontmatter(generated("pi/pi/agents/" + role + ".md")),
    new RegExp("name: " + role));
  const openCodeFrontmatter = frontmatter(generated("opencode/agents/" + role + ".md"));
  const capability = capabilities.roles[role];
  contains(generated("opencode/agents/" + role + ".md"), [
    "description: " + manifest.roles[role].description,
    "mode: " + capability.mode,
    "model: openai/" + capability.model,
    "reasoningEffort: " + capability.reasoning,
    "external_directory: deny",
  ]);
  assert.match(openCodeFrontmatter, /permission:/);
  assert.ok(openCodeFrontmatter.includes("  skill:\n    \"*\": deny\n    \"" +
    skillFor(role) + "\": allow"), role + " OpenCode skill policy differs");
  assert.equal(openCodeFrontmatter.includes("  task: deny"), role !== "orchestrator",
    role + " OpenCode delegation permission differs");
  if (capability.edit === "owned") assert.ok(openCodeFrontmatter.includes("edit: allow"));
  else if (capability.edit === "work-file") {
    assert.ok(openCodeFrontmatter.includes('"*": deny'));
    assert.ok(openCodeFrontmatter.includes('".ai/work/**": allow'));
  } else assert.ok(openCodeFrontmatter.includes("edit: deny"));
  assert.ok(openCodeFrontmatter.includes("webfetch: " + (capability.web ? "allow" : "deny")));
  assert.ok(openCodeFrontmatter.includes("websearch: " + (capability.web ? "allow" : "deny")));
  if (capability.shell === "none" && capability.git === "none") {
    assert.ok(openCodeFrontmatter.includes("bash: deny"));
  } else if (capability.shell === "none") {
    assert.ok(openCodeFrontmatter.includes('"*": deny'));
  } else {
    assert.ok(openCodeFrontmatter.includes('"*": ask'));
    assert.ok(openCodeFrontmatter.includes('"git *": deny'));
    assert.ok(openCodeFrontmatter.includes('"sudo *": deny'));
  }
  const piFrontmatter = frontmatter(generated("pi/pi/agents/" + role + ".md"));
  assert.ok(piFrontmatter.includes("permission:\n  tools:"));
  assert.ok(piFrontmatter.includes("maxSubagentDepth: 0"));
  assert.ok(piFrontmatter.includes("inheritSkills: false"));
  assert.ok(piFrontmatter.includes("skills: " + skillFor(role)));
  assert.ok(piFrontmatter.includes("skillPath: ../../skills"));
  const expectedPiTools = ["read", "grep", "find", "ls"];
  if (capability.web) expectedPiTools.push("web_search", "fetch_content", "get_search_content");
  if (capability.edit === "owned") expectedPiTools.push("edit", "write");
  if (capability.git !== "none" || capability.shell !== "none") expectedPiTools.push("bash");
  assert.ok(piFrontmatter.includes("tools: " + expectedPiTools.join(",")),
    role + " Pi tool set differs from capabilities");
  assert.ok(piFrontmatter.includes('external_directory: deny'));
  const expectedPiGuard = capability.guard === "coordinator"
    ? "coordinator-guard"
    : capability.guard ? capability.guard + "-guard" : null;
  if (expectedPiGuard) {
    assert.ok(names(generated("pi/pi/extensions")).includes(expectedPiGuard + ".ts"),
      role + " Pi guard extension is missing");
  }
}
const codexBoundaries = {
  designer: "Remain read-only",
  analyst: "Remain read-only",
  explorer: "Remain read-only",
  archivist: "Do not run Git",
  builder: "do not run Git",
  reviewer: "Remain read-only",
  shipper: "Remain Git-only",
};
for (const role of ROLES) {
  contains(generated("codex/plugins/codavio/skills/codavio-orchestrate/references/" + role + ".md"),
    [skillFor(role), codexBoundaries[role], "selected active worktree", "exact owned paths",
      "applicable `AGENTS.md` constraints", "referenced decisions and acceptance scenarios",
      "peer path boundaries", "requested return evidence"]);
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
  "opencode/agents/analyst.md", "pi/pi/agents/analyst.md",
  "opencode/agents/reviewer.md", "pi/pi/agents/reviewer.md",
]) {
  contains(generated(relative), [
    "## Code quality guidance", "ongoing liability", "raw line count",
    "approximately 500 human-authored lines",
  ]);
}
for (const role of ["designer", "analyst"]) {
  contains(generated("opencode/agents/" + role + ".md"), ["## Web research guidance"]);
  contains(generated("pi/pi/agents/" + role + ".md"),
    ["## Web research guidance", "web_search", "fetch_content"]);
}
for (const name of names("pi/extensions")) {
  assert.equal(read(generated("pi/pi/extensions/" + name)), read("pi/extensions/" + name),
    "generated Pi extension differs from its native guard source: " + name);
}
for (const role of ["explorer", "archivist", "builder", "reviewer", "orchestrator", "shipper"]) {
  contains(generated("opencode/agents/" + role + ".md"), ["webfetch: deny", "websearch: deny"]);
}
contains(generated("opencode/agents/orchestrator.md"), [
  "mode: primary", "\"designer\": allow",
  "`codavio-orchestrate`", "every subsequent user turn",
  '"codavio-orchestrate": allow',
]);
for (const role of ROLES) {
  contains(generated("opencode/agents/orchestrator.md"), ['"' + role + '": allow']);
}
contains(generated("opencode/agents/orchestrator.md"), [
  '"git worktree add *": ask', '"git worktree remove *": ask', '"git worktree move *": ask',
]);
assert.ok(!read(generated("opencode/agents/orchestrator.md")).includes('"git worktree add *": allow'));
for (const role of ROLES) {
  const permissions = read(generated("opencode/agents/" + role + ".md"));
  assert.ok(!permissions.includes('"git worktree add'), role + " must not receive worktree creation permission");
}
contains(generated("pi/pi/prompts/codavio.md"), [
  "load the `codavio-orchestrate` skill", "Reload it at the beginning of every subsequent turn",
  "stop instead of performing role work yourself",
]);
for (const role of ["archivist", "builder", "reviewer", "shipper"]) {
  const permissions = read(generated("pi/pi/agents/" + role + ".md"));
  assert.ok(!permissions.includes('"git worktree add'), role + " must not receive worktree lifecycle permission");
}
contains(generated("opencode/agents/analyst.md"), [
  "mode: subagent", "edit: deny", "bash: deny",
]);
contains(generated("pi/pi/agents/analyst.md"), [
  "tools: read,grep,find,ls",
]);
const { git, web, edit, shell, delegate, guard } = capabilities.roles.archivist;
assert.deepEqual({ git, web, edit, shell, delegate, guard }, {
  git: "none", web: false,
  edit: "owned", shell: "none", delegate: false, guard: null,
}, "archivist must remain a documentation worker without execution or research authority");
contains(generated("opencode/agents/archivist.md"), [
  "edit: allow", "bash: deny", "task: deny", "webfetch: deny", "websearch: deny",
]);
contains(generated("pi/pi/agents/archivist.md"), ["tools: read,grep,find,ls,edit,write"]);
assert.ok(!frontmatter(generated("pi/pi/agents/archivist.md")).includes("    bash: allow"),
  "Pi archivist must not expose shell execution");
for (const skillRoot of ["opencode/skills", "pi/skills", "codex/plugins/codavio/skills"]) {
  assert.equal(read(generated(skillRoot + "/codavio-archive/references/adrs.md")),
    read("skills/codavio-archive/references/adrs.md"),
    skillRoot + " must package the on-demand ADR reference unchanged");
}
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
assert.deepEqual(packageJson.pi.skills, ["./skills"]);
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
  "$ARGUMENTS", "generated into the `orchestrator`", "product and domain choices", "approved shipping",
]);
contains(generated("pi/pi/prompts/codavio.md"), [
  "$ARGUMENTS", "`pi-subagents`", "pinned model",
  "`.ai/work/<work-id>.md`", "Use each role's pinned model and reasoning without a per-run override.",
  "Invoke only these `pi-subagents` roles:", ROLES.join(", "),
  ...ROLES,
]);
for (const coordinator of [
  "skills/codavio-orchestrate/references/work-state.md",
  generated("codex/plugins/codavio/skills/codavio-orchestrate/references/work-state.md"),
]) {
  const text = read(coordinator).replace(/\s+/g, " ");
  for (const marker of [
    "Work in the current checkout by default", "Workspace changes require an explicit user request",
    "Never create, switch, attach, or clean up worktrees",
    "also applies when the harness has no native worktree manager",
    "Always keep `.ai/work/` inside the current checkout",
    "Recorded checkout metadata is resume context", "stop before dependent work",
    "current blockers and the next task explicit",
  ]) assert.ok(text.includes(marker), coordinator + " missing ownership policy " + marker);
  for (const obsolete of ["git worktree add", "request a fresh checkout", "normally uses one branch and isolated worktree"]) {
    assert.ok(!text.includes(obsolete), coordinator + " retains worktree lifecycle guidance " + obsolete);
  }
  assert.ok(read(coordinator).includes([
    "branch: feature/guest-checkout",
    "worktree: /actual/path/to/selected/checkout",
    "lifecycle_owner: codex",
  ].join("\n")), coordinator + " has invalid work-state example metadata indentation");
}
const codexSkillPath = generated("codex/plugins/codavio/skills/codavio-orchestrate/SKILL.md");
contains(codexSkillPath, [
  "name: codavio-orchestrate", "# Codavio orchestration runtime", "`gpt-6-astra`", "`gpt-6-sol`",
  "`gpt-6-luna`", "`medium` reasoning", "`high` reasoning", "`low` reasoning",
  "`fork_turns: \"none\"`", "Load exactly one matching role brief for each delegation:",
]);
const codexSkillText = read(codexSkillPath);
contains(codexSkillPath, ["Use Codex collaboration agents", "Spawn"]);
const codexRoutes = [...codexSkillText.matchAll(/\[([a-z]+)\]\(references\/([a-z]+)\.md\)/g)];
assert.equal(codexRoutes.length, ROLES.length, "Codex skill must have one role route per worker");
assert.deepEqual(codexRoutes.map((match) => [match[1], match[2]]), ROLES.map((role) => [role, role]));
assert.ok(!codexSkillText.includes("roles.md"), "Codex skill retains an aggregate reference");
contains(generated("codex/plugins/codavio/skills/codavio-orchestrate/references/shipper.md"), [
  "network sandbox escalation", "sandbox_permissions: \"require_escalated\"",
]);
contains(generated("codex/plugins/codavio/skills/codavio-orchestrate/agents/openai.yaml"),
  ["allow_implicit_invocation: false"]);
contains(generated("codex/plugins/codavio/skills/codavio-orchestrate/SKILL.md"), [
  "main session model is selected in Codex", "explorer and shipper",
  "shipper with " + CODE + "gpt-6-luna" + CODE, "shipping approval", "designer",
  "Start: Builder", "Start: Analyst", "Start: Designer", "actual builder invocation",
  "high-confidence proposed definition", "smallest implementation brief",
  "Prefer one builder", "ADR and documentation closeout",
]);
contains(generated("codex/plugins/codavio/skills/codavio/SKILL.md"), [
  "name: codavio", "compatibility launcher", "activate `codavio-orchestrate`",
  "Do not perform workflow work from this launcher",
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
  const retiredAgents = path.join(temporary, "opencode", "agents");
  fs.mkdirSync(retiredAgents, { recursive: true });
  const retiredPlanner = path.join(retiredAgents, "planner.md");
  fs.symlinkSync(path.join(BUILD, "opencode/agents/planner.md"), retiredPlanner);
  run(process.execPath, [path.join(ROOT, "scripts/install.mjs"), "opencode"], {
    env: { ...process.env, XDG_CONFIG_HOME: temporary },
  });
  assert.throws(() => fs.lstatSync(retiredPlanner), { code: "ENOENT" },
    "OpenCode installation retained the managed retired planner link");
  const installed = path.join(temporary, "opencode");
  assert.equal(linkTarget(path.relative(ROOT, path.join(installed, "AGENTS.md"))),
    path.join(BUILD, "opencode/AGENTS.md"));
  for (const role of [...ROLES, "orchestrator"]) {
    assert.equal(linkTarget(path.relative(ROOT, path.join(installed, "agents", role + ".md"))),
      path.join(BUILD, "opencode/agents", role + ".md"));
  }
  assert.equal(linkTarget(path.relative(ROOT, path.join(installed, "commands", "codavio.md"))),
    path.join(BUILD, "opencode/commands/codavio.md"));
  for (const skill of SKILLS) {
    assert.equal(linkTarget(path.relative(ROOT, path.join(installed, "skills", skill))),
      path.join(BUILD, "opencode/skills", skill));
  }

  const obsoleteCommand = path.join(installed, "commands", "dev.md");
  const obsoleteSkill = path.join(installed, "skills", "testing-policy");
  fs.symlinkSync(path.join(ROOT, ".opencode/commands/dev.md"), obsoleteCommand);
  fs.symlinkSync(path.join(ROOT, ".opencode/skills/testing-policy"), obsoleteSkill);
  const unrelatedSource = path.join(temporary, "unrelated-agent.md");
  const unrelatedAgent = path.join(installed, "agents", "unrelated.md");
  fs.writeFileSync(unrelatedSource, "unrelated");
  fs.symlinkSync(unrelatedSource, unrelatedAgent);
  run(process.execPath, [path.join(ROOT, "scripts/install.mjs"), "opencode"], {
    env: { ...process.env, XDG_CONFIG_HOME: temporary },
  });
  assert.throws(() => fs.lstatSync(obsoleteCommand), { code: "ENOENT" },
    "OpenCode refresh retained an obsolete managed command link");
  assert.throws(() => fs.lstatSync(obsoleteSkill), { code: "ENOENT" },
    "OpenCode refresh retained an obsolete managed skill link");
  assert.equal(linkTarget(path.relative(ROOT, unrelatedAgent)), unrelatedSource,
    "OpenCode refresh removed an unrelated link");

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
  const installedMarketplace = path.join(BUILD, "codex");
  const installedMarketplaceDefinition = JSON.parse(fs.readFileSync(
    path.join(installedMarketplace, ".agents/plugins/marketplace.json"), "utf8"));
  const installedPlugin = path.resolve(installedMarketplace,
    installedMarketplaceDefinition.plugins[0].source.path);
  assert.equal(installedPlugin, path.join(installedMarketplace, "plugins/codavio"));
  const installedPluginDefinition = JSON.parse(fs.readFileSync(
    path.join(installedPlugin, ".codex-plugin/plugin.json"), "utf8"));
  const installedSkill = path.resolve(installedPlugin, installedPluginDefinition.skills,
    "codavio-orchestrate");
  assert.equal(installedSkill, path.join(installedPlugin, "skills/codavio-orchestrate"));
  const installedSkillText = fs.readFileSync(path.join(installedSkill, "SKILL.md"), "utf8");
  for (const role of ROLES) {
    const reference = path.join(installedSkill, "references", role + ".md");
    assert.ok(fs.existsSync(reference), "installed Codex skill reference missing: " + role);
    assert.ok(installedSkillText.includes("[" + role + "](references/" + role + ".md)"),
      "installed Codex skill does not route to " + role);
  }
  assert.equal(fs.existsSync(path.join(installedSkill, "references/roles.md")), false,
    "installed Codex skill contains an aggregate role brief");
  for (const skill of SKILLS) {
    assert.ok(fs.existsSync(path.join(installedPlugin, "skills", skill, "SKILL.md")),
      "installed Codex role skill missing: " + skill);
  }

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
  assert.ok(calls.includes(JSON.stringify(["plugin", "add", "codavio@codavio"])));

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

  const unrelatedRetiredRoot = path.join(temporary, "unrelated-retired");
  const unrelatedRetiredAgents = path.join(unrelatedRetiredRoot, "opencode", "agents");
  fs.mkdirSync(unrelatedRetiredAgents, { recursive: true });
  const unrelatedPlanner = path.join(unrelatedRetiredAgents, "planner.md");
  fs.writeFileSync(unrelatedPlanner, "unrelated planner");
  run(process.execPath, [path.join(ROOT, "scripts/install.mjs"), "opencode"], {
    env: { ...process.env, XDG_CONFIG_HOME: unrelatedRetiredRoot },
  });
  assert.equal(fs.readFileSync(unrelatedPlanner, "utf8"), "unrelated planner",
    "OpenCode installation removed an unrelated retired role file");

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
