import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";

function sessionMarker(cwd, sessionId) {
  if (typeof cwd !== "string" || !isAbsolute(cwd) ||
      typeof sessionId !== "string" || !sessionId.trim()) return;
  let root = realpathSync(cwd);
  while (!existsSync(join(root, ".git"))) {
    const parent = dirname(root);
    if (parent === root) return;
    root = parent;
  }
  const key = createHash("sha256").update(sessionId).digest("hex");
  return join(root, ".ai", "work", ".codavio-sessions", key);
}

function setActivation(action) {
  if (!["activate", "deactivate"].includes(action) || process.argv.length !== 3) {
    throw new Error("Usage: node codavio-recovery.mjs activate|deactivate (from the active checkout)");
  }
  const sessionId = process.env.CODEX_SESSION_ID;
  if (!sessionId || process.env.CODEX_THREAD_ID !== sessionId) {
    throw new Error("Codavio activation requires the main Codex session's CODEX_SESSION_ID and CODEX_THREAD_ID.");
  }
  const marker = sessionMarker(process.cwd(), sessionId);
  if (!marker) throw new Error("Codavio activation requires a current Git checkout.");
  if (action === "deactivate") rmSync(marker, { force: true });
  else {
    mkdirSync(dirname(marker), { recursive: true });
    writeFileSync(marker, "active\n");
  }
}

function recover() {
  let event;
  try { event = JSON.parse(readFileSync(0, "utf8")); } catch { return; }
  if (!event || event.hook_event_name !== "SessionStart" ||
      !["resume", "compact"].includes(event.source)) return;
  try {
    const marker = sessionMarker(event.cwd, event.session_id);
    if (!marker || readFileSync(marker, "utf8") !== "active\n") return;
  } catch { return; }

  const authority = readFileSync(new URL("./orchestrator.md", import.meta.url), "utf8").trim();
  const additionalContext = [
    authority,
    readFileSync(new URL("./recovery.md", import.meta.url), "utf8").trim(),
  ].join("\n\n");

  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext } }));
}

if (process.argv.length > 2) {
  try { setActivation(process.argv[2]); }
  catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
} else recover();
