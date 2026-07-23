import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isShipperCommand } from "./command-policy";

export default function shipperGuard(pi: ExtensionAPI): void {
  if (process.env.PI_SUBAGENT_CHILD_AGENT !== "shipper") return;
  pi.on("tool_call", async (event) => {
    if (event.toolName !== "bash") return;
    const command = String(event.input.command ?? "");
    if (!isShipperCommand(command)) return { block: true, reason: "Shipper guard permits validated Git commands only." };
  });
}
