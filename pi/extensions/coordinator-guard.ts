import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { coordinatorCommandBlocked } from "./command-policy";

export default function coordinatorGuard(pi: ExtensionAPI): void {
  if (process.env.PI_SUBAGENT_CHILD_AGENT) return;
  pi.on("tool_call", async (event) => {
    if (event.toolName !== "bash") return;
    const command = String(event.input.command ?? "");
    if (coordinatorCommandBlocked(command)) return { block: true, reason: "Coordinator guard blocks git diff/log; the reviewer owns diff inspection." };
  });
}
