import { readFileSync } from "node:fs";

const authority = readFileSync(new URL("./orchestrator.md", import.meta.url), "utf8").trim();
const additionalContext = [
  "Codavio recovery reminder: applies only to an explicitly invoked, still-active Codavio workflow in this conversation.",
  "Do not start or resume Codavio merely because this hook ran or a work item exists. Ignore this reminder if the workflow was completed, paused, cancelled, or exited.",
  authority,
  "Before the next workflow action, reload `codavio-orchestrate` and restore the selected work item's brief, approvals, evidence, unfinished gates and next role. Follow the recovery checkpoint before delegation or a phase transition. Missing evidence keeps an obligation pending.",
].join("\n\n");

process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext } }));
