export type ParsedCommand = { argv: string[] } | { error: string };

const unsafeShellSyntax = /[\r\n;|&`$<>\\{}()!~*?]/;

export function parseCommand(command: string): ParsedCommand {
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
  return argv.slice(2).every((argument) => argument.startsWith("-") || argument === "list");
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

export function isNormalPush(command: string): boolean {
  const parsed = parseCommand(command);
  return isGitCommand(parsed) && parsed.argv[1] === "push" && !isForcePush(parsed.argv);
}

export function builderCommandBlocked(command: string): boolean {
  const parsed = parseCommand(command);
  if ("error" in parsed) return true;
  const lowered = parsed.argv.map((argument) => argument.toLowerCase());
  const commandStringInterpreters = new Set(["sh", "bash", "zsh", "dash", "ksh", "fish", "python", "python3", "node", "ruby", "perl", "php", "lua"]);
  if (lowered.some((argument, index) => commandStringInterpreters.has(argument.split("/").at(-1) ?? "") && lowered.slice(index + 1).some((flag) => flag === "-c" || flag === "-e" || flag === "--eval"))) return true;
  if (lowered.some((argument) => argument === "git" || argument.endsWith("/git") || argument === "rm" || argument === "sudo")) return true;
  const docker = lowered[0] === "docker";
  if (!docker) return false;
  return lowered.slice(1).some((argument) => argument === "rm" || argument === "rmi" || argument === "prune");
}
