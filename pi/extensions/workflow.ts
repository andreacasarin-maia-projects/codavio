import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

function gitRoot(cwd: string): string | undefined {
  try {
    return execFileSync("git", ["-C", cwd, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  } catch {
    return undefined;
  }
}

function branchSlug(root: string): string | undefined {
  try {
    const branch = execFileSync("git", ["-C", root, "branch", "--show-current"], { encoding: "utf8" }).trim();
    return branch ? branch.replace(/[^A-Za-z0-9._-]+/g, "-") : undefined;
  } catch {
    return undefined;
  }
}

export default function workflow(pi: ExtensionAPI): void {
  pi.registerCommand("workflow-status", {
    description: "Report the active AI workflow work-file status",
    handler: async (_args, ctx) => {
      const root = gitRoot(ctx.cwd);
      if (!root) {
        ctx.ui.notify("Not inside a Git worktree.", "warning");
        return;
      }
      const slug = branchSlug(root);
      const path = slug ? join(root, ".ai", "work", `${slug}.md`) : undefined;
      ctx.ui.notify(path && existsSync(path) ? `Active work file exists: ${path}` : `Active work file missing: ${path ?? "unknown branch"}`, path && existsSync(path) ? "info" : "warning");
    },
  });
}
