import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

export const SESSION_STATE = "codavio-session";

export function isCodavioActive(ctx: ExtensionContext): boolean {
  if (process.env.PI_SUBAGENT_CHILD_AGENT) return false;
  const sessionId = ctx.sessionManager.getSessionId();
  if (!sessionId) return false;
  const entry = ctx.sessionManager.getBranch().findLast((entry) =>
    entry.type === "custom" && entry.customType === SESSION_STATE);
  if (!entry || entry.type !== "custom") return false;
  const state = entry.data as { sessionId?: string; cwd?: string; active?: boolean } | undefined;
  return state?.sessionId === sessionId && state.cwd === ctx.cwd && state.active === true;
}
