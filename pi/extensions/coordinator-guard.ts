import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { coordinatorCommandBlocked, isWorktreeLifecycleCommand } from "./command-policy.ts";

export default function coordinatorGuard(pi: ExtensionAPI): void {
  if (process.env.PI_SUBAGENT_CHILD_AGENT) return;
  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName !== "bash") return;
    const command = String(event.input.command ?? "");
    let worktreeApproved = false;
    if (isWorktreeLifecycleCommand(command)) {
      worktreeApproved = ctx.hasUI && await ctx.ui.confirm("Approve requested workspace change?", command);
    }
    if (coordinatorCommandBlocked(command, worktreeApproved)) {
      return { block: true, reason: "Coordinator shell permits only canonical Git orientation commands and visibly approved direct workspace changes. Delegate exploration to explorer, implementation and checks to builder, and diff inspection to reviewer." };
    }
  });
}
