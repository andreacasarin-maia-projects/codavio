import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readFileSync } from "node:fs";
import { isCodavioActive, SESSION_STATE } from "./session-state.ts";

export default function recovery(pi: ExtensionAPI): void {
  if (process.env.PI_SUBAGENT_CHILD_AGENT) return;
  const definition = JSON.parse(readFileSync(new URL("../recovery.json", import.meta.url), "utf8"));
  pi.registerTool({
    name: definition.name,
    label: definition.label,
    description: definition.description,
    parameters: definition.parameters,
    async execute(_id, { action }: { action: string }, _signal, _onUpdate, ctx) {
      if (!["activate", "deactivate"].includes(action)) throw new Error("Use activate or deactivate.");
      const sessionId = ctx.sessionManager.getSessionId();
      if (!sessionId || process.env.PI_SUBAGENT_CHILD_AGENT) throw new Error("A main Pi session is required.");
      pi.appendEntry(SESSION_STATE, { sessionId, cwd: ctx.cwd, active: action === "activate" });
      return { content: [{ type: "text", text: `Codavio recovery ${action === "activate" ? "enabled" : "disabled"} for this session.` }], details: {} };
    },
  });
  pi.on("context", async (event, ctx) => {
    if (!isCodavioActive(ctx)) return;
    const userTexts = event.messages.filter((message) => message.role === "user").flatMap((message) =>
      typeof message.content === "string" ? [message.content] : message.content.filter((part) =>
        part.type === "text").map((part) => part.text));
    if (userTexts.some((text) => [definition.context, definition.reminder].includes(text))) return;
    const text = userTexts.some((text) => text.includes(definition.authority)) ? definition.reminder : definition.context;
    // Request-local context survives loss of earlier messages without adding reminder turns.
    const messages = [...event.messages];
    const firstConversation = messages.findIndex((message) => message.role !== "compactionSummary");
    messages.splice(firstConversation < 0 ? messages.length : firstConversation, 0, {
      role: "user", content: [{ type: "text", text }], timestamp: 0,
    });
    return { messages };
  });
}
