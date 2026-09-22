#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUILD = path.join(ROOT, "build");
const SUPPORTED = ["opencode", "pi", "codex"];
const OBSOLETE_OPENCODE_PATHS = [
  "agents/builder-junior.md", "agents/builder-senior.md", "agents/explore.md",
  "agents/worker-mini.md", "agents/worker-luna.md",
  "commands/analyze.md", "commands/build.md", "commands/plan.md", "commands/review.md",
  "commands/ship.md", "commands/dev.md", "skills/testing-policy",
];

function usage() { console.error("Usage: node scripts/install.mjs <opencode|pi|codex|all> [--force]"); }

function parseArgs() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const positional = args.filter((arg) => arg !== "--force");
  if (positional.length !== 1 || ![...SUPPORTED, "all"].includes(positional[0])) {
    usage();
    process.exit(2);
  }
  return { force, targets: positional[0] === "all" ? [...SUPPORTED] : positional };
}
function resolveExecutable(command) {
  if (command.includes(path.sep) || (path.sep === "\\" && command.includes("/"))) {
    const candidate = path.resolve(command);
    return fs.existsSync(candidate) ? candidate : null;
  }
  const extensions = process.platform === "win32"
    ? (process.env.PATHEXT ?? ".EXE;.CMD;.BAT").split(";") : [""];
  for (const directory of (process.env.PATH ?? "").split(path.delimiter)) {
    for (const extension of extensions) {
      const candidate = path.join(directory, command + extension);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT, encoding: "utf8", stdio: options.capture ? "pipe" : "inherit", ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = options.capture ? result.stderr.trim() : "";
    throw new Error(path.basename(command) + " " + args.join(" ") + " failed" +
      (detail ? ": " + detail : ""));
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
    if (resolved) commands[label] = resolved;
    else missing.push(label + " (" + command + ")");
  }
  if (missing.length) throw new Error("missing required executables: " + missing.join(", "));
  run(process.execPath, [path.join(ROOT, "scripts/generate.mjs")]);
  return commands;
}

function exists(target) {
  try { fs.lstatSync(target); return true; } catch { return false; }
}

function exactTextLink(destination, source) {
  try {
    if (!fs.lstatSync(destination).isSymbolicLink()) return false;
    return path.resolve(path.dirname(destination), fs.readlinkSync(destination)) === path.resolve(source);
  } catch {
    return false;
  }
}

function destinationIsUsable(source, destination, legacySource) {
  return !exists(destination) || exactTextLink(destination, source) ||
    (legacySource && exactTextLink(destination, legacySource));
}

function checkDestination(source, destination, force, legacySource) {
  if (destinationIsUsable(source, destination, legacySource)) return;
  if (!force) throw new Error("refusing to replace " + destination + "; rerun with --force");
  const backup = destination + ".backup";
  if (exists(backup)) throw new Error("refusing to overwrite existing backup " + backup);
}

function linkDestination(source, destination, force, legacySource) {
  if (exactTextLink(destination, source)) return;
  checkDestination(source, destination, force, legacySource);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (exists(destination)) {
    if (legacySource && exactTextLink(destination, legacySource)) fs.unlinkSync(destination);
    else fs.renameSync(destination, destination + ".backup");
  }
  fs.symlinkSync(source, destination, fs.statSync(source).isDirectory() ? "junction" : "file");
}

function manifest() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "workflow/manifest.json"), "utf8"));
}

function openCodePaths(target) {
  const pairs = [];
  const command = manifest().command;
  for (const role of [...manifest().harnesses.opencode.roles, "orchestrator"]) {
    pairs.push([path.join(BUILD, "opencode/agents", role + ".md"),
      path.join(target, "agents", role + ".md"),
      path.join(ROOT, ".opencode/agents", role + ".md")]);
  }
  pairs.push([path.join(BUILD, "opencode/commands", command + ".md"),
    path.join(target, "commands", command + ".md"),
    path.join(ROOT, ".opencode/commands", command + ".md")]);
  pairs.push([path.join(BUILD, "opencode/AGENTS.md"), path.join(target, "AGENTS.md"),
    path.join(ROOT, "templates/AGENTS.global.md")]);
  return pairs;
}

function installOpenCode(force) {
  const configRoot = process.env.XDG_CONFIG_HOME ?? path.join(process.env.HOME ?? os.homedir(), ".config");
  const target = path.join(configRoot, "opencode");
  const pairs = openCodePaths(target);
  for (const [source, destination, legacy] of pairs) checkDestination(source, destination, force, legacy);
  for (const [source, destination, legacy] of pairs) linkDestination(source, destination, force, legacy);
  for (const relative of OBSOLETE_OPENCODE_PATHS) {
    const destination = path.join(target, relative);
    const legacy = path.join(ROOT, ".opencode", relative);
    const generated = path.join(BUILD, "opencode", relative);
    if (exactTextLink(destination, legacy) || exactTextLink(destination, generated)) {
      fs.unlinkSync(destination);
    }
  }
  console.log("Linked Codavio into " + target);
  console.log("Start with: /codavio <request>");
  console.log("Restart OpenCode after repository updates.");
}

function installPi(commands) {
  const packageRoot = path.join(BUILD, "pi");
  run(commands.npm, ["install"], { cwd: packageRoot });
  run(commands.pi, ["install", "npm:@gotgenes/pi-permission-system"]);
  run(commands.pi, ["install", "npm:pi-web-access"]);
  run(commands.pi, ["install", packageRoot]);
  const listing = run(commands.pi, ["list"], { capture: true });
  if (!listing.includes("pi-permission-system")) {
    throw new Error("Pi did not list pi-permission-system after installation");
  }
  if (!listing.includes("codavio") && !listing.includes(packageRoot)) {
    throw new Error("Pi did not list codavio after installation");
  }
  process.stdout.write(listing.endsWith("\n") ? listing : listing + "\n");
  console.log("Installed Codavio with Pi permission enforcement from " + packageRoot);
  console.log("Start Pi, run /subagents-doctor, then invoke: /codavio <request>");
}

function installMarketplace(force, commands, marketplace) {
  const listing = JSON.parse(run(commands.codex, ["plugin", "marketplace", "list", "--json"], { capture: true }));
  const existing = listing.marketplaces.find((entry) => entry.name === "codavio");
  if (existing && path.resolve(existing.root) !== path.resolve(marketplace)) {
    if (!force) {
      throw new Error("codavio marketplace is already registered from " + existing.root +
        "; rerun with --force to replace it with " + marketplace);
    }
    run(commands.codex, ["plugin", "marketplace", "remove", "codavio"]);
  }
  if (!existing || path.resolve(existing.root) !== path.resolve(marketplace)) {
    run(commands.codex, ["plugin", "marketplace", "add", marketplace]);
  }
}

function installCodex(force, commands) {
  const codexRoot = process.env.CODEX_HOME ?? path.join(process.env.HOME ?? os.homedir(), ".codex");
  const sourceAgents = path.join(BUILD, "codex/AGENTS.md");
  const globalAgents = path.join(codexRoot, "AGENTS.md");
  const legacyAgents = path.join(ROOT, "templates/AGENTS.global.md");
  checkDestination(sourceAgents, globalAgents, force, legacyAgents);
  linkDestination(sourceAgents, globalAgents, force, legacyAgents);
  const marketplace = path.join(BUILD, "codex");
  installMarketplace(force, commands, marketplace);
  run(commands.codex, ["plugin", "add", "codavio@codavio"]);
  console.log("Linked global guidance into " + globalAgents);
  console.log("Installed codavio from " + marketplace);
  console.log("Start a new Codex task and invoke: $codavio <request>");
}

const { force, targets } = parseArgs();
try {
  const commands = preflight(targets);
  for (const target of targets) {
    if (target === "opencode") installOpenCode(force);
    else if (target === "pi") installPi(commands);
    else installCodex(force, commands);
  }
  console.log("Installed Codavio for: " + targets.join(", "));
} catch (error) {
  console.error("Installation failed: " + error.message);
  process.exit(1);
}
