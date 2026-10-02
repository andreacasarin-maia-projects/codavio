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
      return { block: true, reason: "Worktree changes require visible approval of a direct, non-forced command; reviewer owns diff inspection." };
    }
  });
}
