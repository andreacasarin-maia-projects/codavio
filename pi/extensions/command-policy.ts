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

function gitAction(argv: string[]): { index: number; actionIndex: number } | undefined {
  const index = argv.findIndex((argument) => (argument.split("/").at(-1) ?? "") === "git");
  if (index < 0) return undefined;
  let actionIndex = index + 1;
  const optionsWithValues = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--super-prefix", "--exec-path", "--config-env"]);
  while (actionIndex < argv.length && argv[actionIndex].startsWith("-")) {
    if (optionsWithValues.has(argv[actionIndex])) actionIndex += 2;
    else actionIndex += 1;
  }
  return { index, actionIndex };
}

function wrappedGitWorktreeLifecycle(argv: string[]): boolean {
  const shells = new Set(["sh", "bash", "zsh", "dash", "ksh", "fish"]);
  let shellIndex = 0;
  while ((argv[shellIndex]?.split("/").at(-1) ?? "") === "env") {
    shellIndex += 1;
    while (argv[shellIndex]?.startsWith("-")) shellIndex += 1;
    while (argv[shellIndex]?.includes("=") && !argv[shellIndex].startsWith("-")) shellIndex += 1;
  }
  const executable = argv[shellIndex]?.split("/").at(-1) ?? "";
  if (!shells.has(executable)) return false;
  const commandIndex = argv.findIndex((argument, index) => index > shellIndex && /^-[^-]*[ce]/.test(argument));
  if (commandIndex < 0 || !argv[commandIndex + 1]) return false;
  const inner = parseCommand(argv[commandIndex + 1]);
  if (!("argv" in inner)) return false;
  if (containsWorktreeLifecycle("", inner.argv)) return true;
  const invocation = gitAction(inner.argv);
  if (!invocation || inner.argv[invocation.actionIndex] !== "worktree") return false;
  return ["add", "remove", "move", "prune", "repair", "lock", "unlock"].includes(inner.argv[invocation.actionIndex + 1] ?? "");
}

function shellCommandString(command: string): string | undefined {
  const match = /^\s*(?:env\s+(?:(?:-[^\s]+|[A-Za-z_][A-Za-z0-9_]*=[^\s]+)\s+)*)?((?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+)\s+(-[A-Za-z]*[ce][A-Za-z]*|--command)\s+(['"])([\s\S]*)\3\s*$/.exec(command);
  if (!match || !new Set(["sh", "bash", "zsh", "dash", "ksh", "fish"]).has(match[1].split("/").at(-1) ?? "")) return undefined;
  return match[4];
}

function containsWorktreeLifecycle(command: string, argv: string[], allowRawMarkers = false): boolean {
  const lifecycle = String.raw`(?:worktree\s+(?:add|remove|move|prune|repair|lock|unlock)|wt\s+(?:add|remove|move|prune|repair|lock|unlock))`;
  const invocation = gitAction(argv);
  const aliases = new Set<string>();
  if (invocation) {
    for (let index = invocation.index + 1; index < invocation.actionIndex; index += 1) {
      if (argv[index] !== "-c" || !argv[index + 1]) continue;
      const assignment = /^alias\.([\w.-]+)=(.*)$/i.exec(argv[index + 1]);
      if (assignment && /^(?:!\s*)?(?:git\s+)?worktree(?:\s|$)/i.test(assignment[2])) aliases.add(assignment[1]);
      index += 1;
    }
  }
  const actionIndex = invocation?.actionIndex;
  const aliasLifecycle = actionIndex !== undefined && aliases.has(argv[actionIndex]) &&
    ["add", "remove", "move", "prune", "repair", "lock", "unlock"].includes(argv[actionIndex + 1] ?? "");
  const argvLifecycle = new RegExp(`\\b${lifecycle}\\b`, "i").test(argv.join(" "));
  if (aliasLifecycle || argvLifecycle) return true;
  if (!allowRawMarkers) return false;
  return /(?:^|\s)-c\s+(?:(['"])alias\.[\w.-]+=(?:!?\s*(?:git\s+)?worktree)\1|alias\.[\w.-]+=(['"])(?:!?\s*(?:git\s+)?worktree)\2|alias\.[\w.-]+=(?:!?\s*(?:git\s+)?worktree))\s+/i.test(command) &&
    /\b[\w.-]+\s+(?:add|remove|move|prune|repair|lock|unlock)\b/i.test(command) ||
    new RegExp(`\\b${lifecycle}\\b`, "i").test(command);
}

export function isWorktreeLifecycleCommand(command: string): boolean {
  const parsed = parseCommand(command);
  if (!isGitCommand(parsed) || parsed.argv[1] !== "worktree") return false;
  if (!["add", "remove", "move", "prune", "repair", "lock", "unlock"].includes(parsed.argv[2])) return false;
  return !parsed.argv.slice(3).some((argument) => argument === "-B" || /^-f+$/.test(argument) || argument.startsWith("--force"));
}

export function coordinatorCommandBlocked(command: string, worktreeApproved = false): boolean {
  const parsed = parseCommand(command);
  if ("error" in parsed) {
    const payload = shellCommandString(command);
    if (payload === undefined) return true;
    return containsWorktreeLifecycle(payload, [], true) || /\bgit\s+(?:diff|log)\b/i.test(payload);
  }
  const argv = parsed.argv;
  if (worktreeApproved && isWorktreeLifecycleCommand(command)) return false;
  if (containsWorktreeLifecycle(command, argv)) return true;
  if (wrappedGitWorktreeLifecycle(argv)) return true;
  const invocation = gitAction(argv);
  if (!invocation) return false;
  const { actionIndex } = invocation;
  const action = argv[actionIndex];
  if (action === "diff" || action === "log") return true;
  if (action !== "worktree") return false;
  return argv[actionIndex + 1] !== "list";
}
