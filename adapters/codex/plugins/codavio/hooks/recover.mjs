import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function recover() {
  let event;
  try { event = JSON.parse(readFileSync(0, "utf8")); } catch { return; }
  const data = process.env.PLUGIN_DATA;
  if (!data || !event || typeof event.session_id !== "string" || !event.session_id ||
      typeof event.transcript_path !== "string" || !event.transcript_path) return;

  const key = createHash("sha256").update(`${event.session_id}\0${event.transcript_path}`).digest("hex");
  const directory = join(data, "codavio-sessions");
  const marker = join(directory, key);
  if (event.hook_event_name === "UserPromptSubmit") {
    if (typeof event.prompt !== "string") return;
    const prompt = event.prompt.trim();
    const entry = /^(?:please\s+)?(?:(?:use|run|start|resume|invoke)\s+(?:\$?codavio(?:-orchestrate)?|\/codavio|\/skill:codavio-orchestrate)|(?:\$codavio(?:-orchestrate)?|\/codavio|\/skill:codavio-orchestrate))(?=\s|$)/i;
    const exit = /^(?:please\s+)?(?:(?:pause|cancel|stop|exit)\s+(?:the\s+)?|(?:don't|do not)\s+(?:use|run)\s+)\$?codavio(?:-orchestrate)?(?:\s+workflow)?(?=\s|[.!?]|$)/i;
    if (exit.test(prompt)) rmSync(marker, { force: true });
    else if (entry.test(prompt)) {
      mkdirSync(directory, { recursive: true });
      writeFileSync(marker, "active\n");
    }
    return;
  }
  if (event.hook_event_name !== "SessionStart" || !["resume", "compact"].includes(event.source)) return;
  try { if (readFileSync(marker, "utf8") !== "active\n") return; } catch { return; }

  const authority = readFileSync(new URL("./orchestrator.md", import.meta.url), "utf8").trim();
  const additionalContext = [
    "Codavio recovery reminder: applies only to an explicitly invoked, still-active Codavio workflow in this conversation.",
    "Do not start or resume Codavio merely because this hook ran or a work item exists. Ignore this reminder if the workflow was completed, paused, cancelled, or exited.",
    authority,
    "Before the next workflow action, reload `codavio-orchestrate` and restore the selected work item's brief, approvals, evidence, unfinished gates and next role. Follow the recovery checkpoint before delegation or a phase transition. Missing evidence keeps an obligation pending.",
  ].join("\n\n");

  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext } }));
}

recover();
