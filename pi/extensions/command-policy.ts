import capabilities from "../../workflow/capabilities.json" with { type: "json" };

type ParsedCommand = { argv: string[] } | { error: string };

const unsafeShellSyntax = /[\r\n;|&`$<>\\{}()!~*?]/;
const commandStringInterpreters = new Set([
  "sh", "bash", "zsh", "dash", "ksh", "fish", "python", "python3", "node", "ruby", "perl",
  "php", "lua",
]);

function parseCommand(command: string): ParsedCommand {
  if (!command.trim() || unsafeShellSyntax.test(command)) return { error: "unsafe shell syntax" };

  const argv: string[] = [];
  let current = "";
  let quote: "'" | '"' | undefined;
  let quoted = false;
  for (const character of command.trim()) {
    if (quote) {
      if (character === quote) quote = undefined;
      else current += character;
    } else if (character === "'" || character === '"') {
      quote = character;
      quoted = true;
    } else if (/\s/.test(character)) {
      if (current || quoted) argv.push(current);
      current = "";
      quoted = false;
    } else {
      current += character;
    }
  }
  if (quote) return { error: "unterminated quote" };
  if (current || quoted) argv.push(current);
  return argv.length ? { argv } : { error: "empty command" };
}

function isGitCommand(parsed: ParsedCommand): parsed is { argv: string[] } {
  return "argv" in parsed && parsed.argv[0] === "git";
}

function isInspection(argv: string[]): boolean {
  if (argv.length < 2 || argv[0] !== "git") return false;
  const action = argv[1];
  if (!(action === "status" || action === "diff" || action === "log" || action === "worktree")) return false;
  if (action === "diff") {
    return !argv.slice(2).some((argument) => argument === "--output" || argument.startsWith("--output=") || argument === "--ext-diff" || argument === "--no-ext-diff");
  }
  if (action !== "worktree") return true;
  return argv[2] === "list" && argv.slice(3).every((argument) => argument.startsWith("-"));
}

export function isReviewerCommand(command: string): boolean {
  const parsed = parseCommand(command);
  return isGitCommand(parsed) && isInspection(parsed.argv);
}

function isForcePush(argv: string[]): boolean {
  return argv.slice(2).some((argument) => argument === "-f" || /^-f+/.test(argument) || argument.startsWith("--force"));
}

export function isShipperCommand(command: string): boolean {
  const parsed = parseCommand(command);
  if (!isGitCommand(parsed) || isForcePush(parsed.argv)) return false;
  const action = parsed.argv[1];
  if ((action === "commit" || action === "push") && parsed.argv.slice(2).some((argument) => argument === "-n" || argument === "--no-verify")) return false;
  return isInspection(parsed.argv) || action === "add" || action === "commit" || action === "push";
}

export function builderCommandBlocked(command: string): boolean {
  const parsed = parseCommand(command);
  if ("error" in parsed) return true;
  const lowered = parsed.argv.map((argument) => argument.toLowerCase());
  if (lowered.some((argument, index) => commandStringInterpreters.has(argument.split("/").at(-1) ?? "") && lowered.slice(index + 1).some((flag) => flag === "-c" || flag === "-e" || flag === "--eval"))) return true;
  if (lowered.some((argument) => argument === "sudo")) return true;
  if (lowered[0] === "git") return true;
  return lowered.some((argument) => argument === "git" || argument.endsWith("/git"));
}

export function isWorktreeLifecycleCommand(command: string): boolean {
  const parsed = parseCommand(command);
  if (!isGitCommand(parsed) || parsed.argv[1] !== "worktree") return false;
  if (!["add", "remove", "move", "prune", "repair", "lock", "unlock"].includes(parsed.argv[2])) return false;
  return !parsed.argv.slice(3).some((argument) => argument === "-B" || /^-f+$/.test(argument) || argument.startsWith("--force"));
}

export function coordinatorCommandBlocked(command: string, worktreeApproved = false): boolean {
  const parsed = parseCommand(command);
  if (!isGitCommand(parsed)) return true;
  if (worktreeApproved && isWorktreeLifecycleCommand(command)) return false;
  return !capabilities.constants.git.orient.some((allowed) => {
    const expected = allowed.split(" ");
    return parsed.argv.length === expected.length &&
      parsed.argv.every((argument, index) => argument === expected[index]);
  });
}
