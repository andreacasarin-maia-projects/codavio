import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isReviewerCommand } from "./command-policy";

export default function reviewerGuard(pi: ExtensionAPI): void {
  if (process.env.PI_SUBAGENT_CHILD_AGENT !== "reviewer") return;
  pi.on("tool_call", async (event) => {
    if (event.toolName !== "bash" || isReviewerCommand(String(event.input.command ?? ""))) return;
    return { block: true, reason: "Reviewer guard permits only documented Git inspection commands." };
  });
}
