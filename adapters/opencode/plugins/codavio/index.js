import { readFileSync, realpathSync } from "node:fs";

export default {
  id: "codavio-recovery",
  async setup(ctx) {
    const definition = JSON.parse(readFileSync(new URL("./recovery.json", import.meta.url), "utf8"));
    async function mainSession(sessionID) {
      if (typeof sessionID !== "string" || !sessionID) return;
      const session = await ctx.session.get({ sessionID });
      if (session.id !== sessionID || session.parentID != null || session.agent !== "orchestrator" ||
          typeof session.location?.directory !== "string") return;
      return { directory: realpathSync(session.location.directory) };
    }
    await ctx.tool.transform((editor) => {
      editor.add({
        name: definition.name,
        description: definition.description,
        input: definition.parameters,
        execute: async ({ action }, context) => {
          if (!["activate", "deactivate"].includes(action)) throw new Error("Use activate or deactivate.");
          const session = await mainSession(context.sessionID);
          if (!session) throw new Error("Codavio recovery requires a main orchestrator session.");
          const key = `session/${context.sessionID}`;
          if (action === "activate") await ctx.storage.set(key, session);
          else await ctx.storage.remove(key);
          return { content: `Codavio recovery ${action === "activate" ? "enabled" : "disabled"} for this session.` };
        },
      });
    });
    await ctx.session.hook("context", async (event) => {
      if (event.agent !== "orchestrator") return;
      try {
        const session = await mainSession(event.sessionID);
        if (!session) return;
        const registered = await ctx.storage.get(`session/${event.sessionID}`);
        if (registered?.directory !== session.directory) return;
        if (event.system.some((part) => part.type === "text" &&
            [definition.context, definition.reminder].includes(part.text))) return;
        const hasAuthority = event.system.some((part) => part.type === "text" && part.text.includes(definition.authority));
        event.system.push({ type: "text", text: hasAuthority ? definition.reminder : definition.context });
      } catch {
        // Missing session identity or unreadable registration never activates a workflow.
      }
    });
  },
};
