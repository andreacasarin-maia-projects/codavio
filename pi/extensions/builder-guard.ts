import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { builderCommandBlocked } from "./command-policy";

export default function builderGuard(pi: ExtensionAPI): void {
  if (!new Set(["builder-junior", "builder-senior"]).has(process.env.PI_SUBAGENT_CHILD_AGENT ?? "")) return;
  pi.on("tool_call", async (event) => {
    if (event.toolName !== "bash") return;
    const command = String(event.input.command ?? "");
    if (builderCommandBlocked(command)) return { block: true, reason: "Builder guard blocks unsafe shell syntax, Git, and destructive commands." };
  });
}
