#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SUPPORTED = ["opencode", "pi", "codex"];
const OBSOLETE_OPENCODE_PATHS = [
  "agents/builder.md",
  "agents/explore.md",
  "agents/worker-mini.md",
  "agents/worker-luna.md",
  "commands/analyze.md",
  "commands/build.md",
  "commands/plan.md",
  "commands/review.md",
  "commands/ship.md",
  "skills/testing-policy",
];

function usage() {
  console.error("Usage: node scripts/install.mjs <opencode|pi|codex|all> [--force]");
}

function parseArgs() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const positional = args.filter((arg) => arg !== "--force");
  if (positional.length !== 1 || ![...SUPPORTED, "all"].includes(positional[0])) {
    usage();
    process.exit(2);
  }
  return {
    force,
    targets: positional[0] === "all" ? [...SUPPORTED] : positional,
  };
}

function resolveExecutable(command) {
  if (command.includes(path.sep) || (path.sep === "\\" && command.includes("/"))) {
    const candidate = path.resolve(command);
    return fs.existsSync(candidate) ? candidate : null;
  }
  const pathValue = process.env.PATH ?? "";
  const extensions =
    process.platform === "win32"
      ? (process.env.PATHEXT ?? ".EXE;.CMD;.BAT").split(";")
      : [""];
  for (const directory of pathValue.split(path.delimiter)) {
    for (const extension of extensions) {
      const candidate = path.join(directory, `${command}${extension}`);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = options.capture ? result.stderr.trim() : "";
    throw new Error(
      `${path.basename(command)} ${args.join(" ")} failed${detail ? `: ${detail}` : ""}`,
    );
  }
  return result.stdout ?? "";
}

function preflight(targets) {
  const commands = {};
  if (targets.includes("pi")) {
    commands.npm = process.env.NPM_BIN ?? "npm";
    commands.pi = process.env.PI_BIN ?? "pi";
  }
  if (targets.includes("codex")) commands.codex = process.env.CODEX_BIN ?? "codex";
  const missing = [];
  for (const [label, command] of Object.entries(commands)) {
    const resolved = resolveExecutable(command);
    if (!resolved) missing.push(`${label} (${command})`);
    else commands[label] = resolved;
  }
  if (missing.length) throw new Error(`missing required executables: ${missing.join(", ")}`);
  run(process.execPath, [path.join(ROOT, "scripts/generate.mjs"), "--check"]);
  return commands;
}

function pathExists(target) {
  try {
    fs.lstatSync(target);
    return true;
  } catch {
    return false;
  }
}

function sameLink(source, destination) {
  try {
    if (!fs.lstatSync(destination).isSymbolicLink()) return false;
    const target = fs.readlinkSync(destination);
    const resolved = path.resolve(path.dirname(destination), target);
    return fs.realpathSync(resolved) === fs.realpathSync(source);
  } catch {
    return false;
  }
}

function checkDestination(source, destination, force) {
  if (sameLink(source, destination) || !pathExists(destination)) return;
  if (!force) throw new Error(`refusing to replace ${destination}; rerun with --force`);
  const backup = `${destination}.backup`;
  if (pathExists(backup)) throw new Error(`refusing to overwrite existing backup ${backup}`);
}

function linkDestination(source, destination, force) {
  if (sameLink(source, destination)) return;
  checkDestination(source, destination, force);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (pathExists(destination)) fs.renameSync(destination, `${destination}.backup`);
  fs.symlinkSync(source, destination, fs.statSync(source).isDirectory() ? "junction" : "file");
}

function openCodePaths(target) {
  const result = [];
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, "workflow/manifest.json"), "utf8"),
  );
  for (const role of [...manifest.harnesses.opencode.roles, "orchestrator"]) {
    const name = `${role}.md`;
    result.push([
      path.join(ROOT, ".opencode/agents", name),
      path.join(target, "agents", name),
    ]);
  }
  result.push([
    path.join(ROOT, ".opencode/commands/dev.md"),
    path.join(target, "commands/dev.md"),
  ]);
  result.push([
    path.join(ROOT, "templates/AGENTS.global.md"),
    path.join(target, "AGENTS.md"),
  ]);
  return result;
}

function installOpenCode(force) {
  const configRoot =
    process.env.XDG_CONFIG_HOME ?? path.join(process.env.HOME ?? os.homedir(), ".config");
  const target = path.join(configRoot, "opencode");
  const paths = openCodePaths(target);
  for (const [source, destination] of paths) checkDestination(source, destination, force);
  for (const [source, destination] of paths) linkDestination(source, destination, force);
  for (const relative of OBSOLETE_OPENCODE_PATHS) {
    const destination = path.join(target, relative);
    if (!sameLink(path.join(ROOT, ".opencode", relative), destination)) continue;
    fs.unlinkSync(destination);
  }
  console.log(`Linked AI Dev Workflow into ${target}`);
  console.log("Start with: /dev <request>");
  console.log("Restart OpenCode after repository updates.");
}

function installPi(commands) {
  run(commands.npm, ["install"]);
  run(commands.pi, ["install", "npm:@gotgenes/pi-permission-system"]);
  run(commands.pi, ["install", ROOT]);
  const listing = run(commands.pi, ["list"], { capture: true });
  if (!listing.includes("pi-permission-system")) {
    throw new Error("Pi did not list pi-permission-system after installation");
  }
  if (!listing.includes("ai-dev-workflow") && !listing.includes(ROOT)) {
    throw new Error("Pi did not list ai-dev-workflow after installation");
  }
  process.stdout.write(listing.endsWith("\n") ? listing : `${listing}\n`);
  console.log("Installed AI Dev Workflow with Pi permission enforcement.");
  console.log("Start Pi, run /subagents-doctor, then invoke: /dev <request>");
}

function installCodex(force, commands) {
  const codexRoot =
    process.env.CODEX_HOME ?? path.join(process.env.HOME ?? os.homedir(), ".codex");
  const globalAgents = path.join(codexRoot, "AGENTS.md");
  const sourceAgents = path.join(ROOT, "templates/AGENTS.global.md");
  checkDestination(sourceAgents, globalAgents, force);
  linkDestination(sourceAgents, globalAgents, force);
  run(commands.codex, ["plugin", "marketplace", "add", path.join(ROOT, "codex")]);
  run(commands.codex, ["plugin", "add", "ai-dev-workflow@ai-dev-workflow"]);
  console.log(`Linked global guidance into ${globalAgents}`);
  console.log(`Installed ai-dev-workflow from ${path.join(ROOT, "codex")}`);
  console.log("Start a new Codex task and invoke: $dev-workflow <request>");
}

const { force, targets } = parseArgs();
try {
  const commands = preflight(targets);
  for (const target of targets) {
    if (target === "opencode") installOpenCode(force);
    else if (target === "pi") installPi(commands);
    else installCodex(force, commands);
  }
  console.log(`Installed AI Dev Workflow for: ${targets.join(", ")}`);
} catch (error) {
  console.error(`Installation failed: ${error.message}`);
  process.exit(1);
}
