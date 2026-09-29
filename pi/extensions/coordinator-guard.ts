import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { coordinatorCommandBlocked, resolveGitRoot } from "./command-policy";

export default function coordinatorGuard(pi: ExtensionAPI): void {
  if (process.env.PI_SUBAGENT_CHILD_AGENT) return;
  pi.on("tool_call", async (event) => {
    if (event.toolName !== "bash") return;
    const command = String(event.input.command ?? "");
    if (coordinatorCommandBlocked(command, resolveGitRoot(process.cwd()))) {
      return { block: true, reason: "Coordinator guard permits only the listed worktree reads and approved project-local add forms; reviewer owns diff inspection." };
    }
  });
}
