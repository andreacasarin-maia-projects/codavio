import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

interface WorkItem {
  id: string;
  title?: string;
  status?: string;
  branch?: string;
  worktree?: string;
  path: string;
  legacy: boolean;
}

function gitRoot(cwd: string): string | undefined {
  try {
    return execFileSync("git", ["-C", cwd, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  } catch {
    return undefined;
  }
}

function branchName(root: string): string | undefined {
  try {
    return execFileSync("git", ["-C", root, "branch", "--show-current"], { encoding: "utf8" }).trim() || undefined;
  } catch {
    return undefined;
  }
}

function branchSlug(branch: string | undefined): string | undefined {
  return branch?.replace(/[^A-Za-z0-9._-]+/g, "-");
}

function metadata(text: string, key: string): string | undefined {
  const value = text.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"))?.[1];
  return value?.replace(/^['"]|['"]$/g, "");
}

function workItems(root: string, currentBranch: string | undefined): WorkItem[] {
  const directory = join(root, ".ai", "work");
  if (!existsSync(directory)) return [];
  const legacySlug = branchSlug(currentBranch);
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => {
      const path = join(directory, entry.name);
      const fallbackId = basename(entry.name, ".md");
      const text = readFileSync(path, "utf8");
      const id = metadata(text, "work_id") ?? fallbackId;
      return {
        id,
        title: metadata(text, "title"),
        status: metadata(text, "status"),
        branch: metadata(text, "branch"),
        worktree: metadata(text, "worktree"),
        path,
        legacy: !metadata(text, "work_id") && fallbackId === legacySlug,
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

function describe(item: WorkItem): string {
  const title = item.title && item.title !== item.id ? ` — ${item.title}` : "";
  const status = item.status ?? (item.legacy ? "legacy branch-named state" : "unknown status");
  return `${item.id}${title} [${status}]`;
}

function matchesWorktree(root: string, worktree: string | undefined): boolean {
  if (!worktree) return false;
  const normalizedRoot = root.replaceAll("\\", "/").replace(/\/$/, "");
  const normalizedWorktree = worktree.replaceAll("\\", "/").replace(/^\.\//, "").replace(/\/$/, "");
  return normalizedRoot === normalizedWorktree || normalizedRoot.endsWith(`/${normalizedWorktree}`);
}

export default function workflow(pi: ExtensionAPI): void {
  pi.registerCommand("workflow-status", {
    description: "Report or list AI workflow work-item status",
    handler: async (args, ctx) => {
      const root = gitRoot(ctx.cwd);
      if (!root) {
        ctx.ui.notify("Not inside a Git worktree.", "warning");
        return;
      }

      const currentBranch = branchName(root);
      const items = workItems(root, currentBranch);
      const requested = args.trim();
      if (requested) {
        const match = items.find((item) => item.id === requested);
        ctx.ui.notify(match ? `Work item: ${describe(match)}\n${match.path}` : `Work item not found: ${requested}`,
          match ? "info" : "warning");
        return;
      }

      const contextMatches = items.filter((item) =>
        item.branch === currentBranch || matchesWorktree(root, item.worktree) || item.legacy);
      const nonterminal = items.filter((item) => item.status !== "shipped");
      const inferred = contextMatches.length === 1 ? contextMatches[0] : nonterminal.length === 1 ? nonterminal[0] : undefined;
      if (inferred) {
        ctx.ui.notify(`Active work item: ${describe(inferred)}\n${inferred.path}`, "info");
        return;
      }

      if (items.length === 0) {
        ctx.ui.notify(`No work items found under ${join(root, ".ai", "work")}.`, "warning");
        return;
      }

      ctx.ui.notify(`Work items:\n${items.map((item) => `- ${describe(item)}`).join("\n")}`, "info");
    },
  });
}
