#!/usr/bin/env python3
"""Validate the repository's OpenCode and Pi definitions using stdlib only."""

from __future__ import annotations

import re
import json
import sys
from fnmatch import fnmatchcase
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ERRORS: list[str] = []


def frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        ERRORS.append(f"{path.relative_to(ROOT)}: missing opening frontmatter")
        return {}
    match = re.search(r"\n---\n", text[4:])
    if not match:
        ERRORS.append(f"{path.relative_to(ROOT)}: missing closing frontmatter")
        return {}
    block = text[4 : match.start() + 4]
    result: dict[str, str] = {}
    for line in block.splitlines():
        if line and not line.startswith((" ", "\t")) and ":" in line:
            key, value = line.split(":", 1)
            result[key.strip()] = value.strip()
    if not text[match.end() + 4 :].strip():
        ERRORS.append(f"{path.relative_to(ROOT)}: empty body")
    return result


def permission_rules(path: Path) -> dict[str, list[tuple[str, str]]]:
    """Read the ordered, two-level permission subset used by this workflow."""
    lines = path.read_text(encoding="utf-8").splitlines()
    try:
        start = lines.index("permission:") + 1
    except ValueError:
        return {}
    rules: dict[str, list[tuple[str, str]]] = {}
    tool = None
    for line in lines[start:]:
        if line and not line.startswith(" "):
            break
        if line.startswith("  ") and not line.startswith("    "):
            flat = re.fullmatch(r"  (\w+): (allow|ask|deny)", line)
            if flat:
                tool, action = flat.groups()
                rules[tool] = [("*", action)]
            elif line.rstrip().endswith(":"):
                tool = line.strip()[:-1]
                rules[tool] = []
        elif tool and line.startswith("    "):
            match = re.fullmatch(r' {4,}"(.*)": (allow|ask|deny)', line)
            if match:
                rules[tool].append(match.groups())
    return rules


def effective(rules: list[tuple[str, str]], value: str) -> str | None:
    result = None
    for pattern, action in rules:
        if fnmatchcase(value, pattern):
            result = action
    return result


def require_rules(path: Path, tool: str, expected: list[tuple[str, str]]) -> None:
    actual = permission_rules(path).get(tool, [])
    if actual != expected:
        ERRORS.append(f"{path.relative_to(ROOT)}: unexpected ordered {tool} rules")


def require_effective(path: Path, tool: str, cases: dict[str, str]) -> None:
    rules = permission_rules(path).get(tool, [])
    for command, action in cases.items():
        if effective(rules, command) != action:
            ERRORS.append(f"{path.relative_to(ROOT)}: {tool} {command!r} is not effectively {action}")


def require_ordered(path: Path, tool: str, before: tuple[str, str], after: tuple[str, str]) -> None:
    rules = permission_rules(path).get(tool, [])
    try:
        before_index = rules.index(before)
        after_index = rules.index(after)
    except ValueError:
        ERRORS.append(f"{path.relative_to(ROOT)}: missing ordered {tool} rules")
        return
    if before_index >= after_index:
        ERRORS.append(f"{path.relative_to(ROOT)}: {after!r} must follow {before!r}")


def require_markers(path: Path, markers: tuple[str, ...]) -> None:
    text = path.read_text(encoding="utf-8")
    for marker in markers:
        if marker not in text:
            ERRORS.append(f"{path.relative_to(ROOT)}: missing workflow marker {marker!r}")


def ordered_rules_safe(rules: list[tuple[str, str]]) -> bool:
    """Broad defaults are safe only as the first and sole broad rule."""
    return bool(rules) and rules[0][0] == "*" and not any(pattern == "*" for pattern, _ in rules[1:])


agents = sorted((ROOT / ".opencode/agents").glob("*.md"))
commands = sorted((ROOT / ".opencode/commands").glob("*.md"))
skills = sorted((ROOT / ".opencode/skills").glob("*/SKILL.md"))

expected_commands = {"dev"}
expected_agents = {"orchestrator", "analyst", "explorer", "builder-junior", "builder-senior", "reviewer", "shipper"}
expected_models = {
    "orchestrator": "openai/gpt-5.6-terra",
    "analyst": "openai/gpt-5.6-sol",
    "explorer": "openai/gpt-5.4-mini",
    "builder-junior": "openai/gpt-5.4-mini",
    "builder-senior": "openai/gpt-5.6-luna",
    "reviewer": "openai/gpt-5.6-terra",
    "shipper": "openai/gpt-5.4-mini",
}

if {p.stem for p in commands} != expected_commands:
    ERRORS.append("commands do not match expected workflow")
if {p.stem for p in agents} != expected_agents:
    ERRORS.append("agents do not match expected workflow")
if skills:
    ERRORS.append("workflow must not define skills")

agent_names = {p.stem for p in agents}
for path in agents:
    data = frontmatter(path)
    for key in ("description", "mode", "model"):
        if not data.get(key):
            ERRORS.append(f"{path.relative_to(ROOT)}: missing {key}")
    if data.get("mode") not in {"primary", "subagent"}:
        ERRORS.append(f"{path.relative_to(ROOT)}: invalid mode")
    if not data.get("model", "").startswith("openai/"):
        ERRORS.append(f"{path.relative_to(ROOT)}: expected explicit OpenAI model")
    if data.get("model") != expected_models.get(path.stem):
        ERRORS.append(f"{path.relative_to(ROOT)}: unexpected model")
    expected_mode = "primary" if path.stem == "orchestrator" else "subagent"
    if data.get("mode") != expected_mode:
        ERRORS.append(f"{path.relative_to(ROOT)}: expected {expected_mode} mode")

for path in commands:
    data = frontmatter(path)
    for key in ("description", "agent"):
        if not data.get(key):
            ERRORS.append(f"{path.relative_to(ROOT)}: missing {key}")
    if data.get("agent") not in agent_names:
        ERRORS.append(f"{path.relative_to(ROOT)}: unknown agent {data.get('agent')}")
    if path.stem == "dev" and data.get("agent") != "orchestrator":
        ERRORS.append(f"{path.relative_to(ROOT)}: expected orchestrator agent")

orchestrator_text = (ROOT / ".opencode/agents/orchestrator.md").read_text(encoding="utf-8")
for delegated_agent in expected_agents - {"orchestrator"}:
    if f'    "{delegated_agent}": allow' not in orchestrator_text:
        ERRORS.append(f"orchestrator does not allow {delegated_agent}")
if '    "*": deny' not in orchestrator_text:
    ERRORS.append("orchestrator must deny unspecified subagents")

for name in expected_agents - {"orchestrator"}:
    text = (ROOT / f".opencode/agents/{name}.md").read_text(encoding="utf-8")
    if "  task: deny" not in text:
        ERRORS.append(f".opencode/agents/{name}.md: nested delegation must be denied")

common_read = [("*", "allow")]
common_flat = [("*", "allow")]
for name in expected_agents:
    path = ROOT / f".opencode/agents/{name}.md"
    rules = permission_rules(path)
    if rules.get("read") != common_read:
        ERRORS.append(f"{path.relative_to(ROOT)}: read rules must allow repository reads")
    for tool in ("glob", "grep", "list"):
        if rules.get(tool) != common_flat:
            ERRORS.append(f"{path.relative_to(ROOT)}: {tool} must be silently allowed")
    if rules.get("external_directory") != [("*", "deny")]:
        ERRORS.append(f"{path.relative_to(ROOT)}: external directories must be denied")
    expected_network = "deny" if name == "shipper" else "allow"
    for tool in ("webfetch", "websearch"):
        if rules.get(tool) != [("*", expected_network)]:
            ERRORS.append(f"{path.relative_to(ROOT)}: {tool} must be {expected_network}")
    expected_edit = [("*", "deny"), (".ai/work/**", "allow")] if name == "orchestrator" else [("*", "allow")] if name in {"builder-junior", "builder-senior"} else [("*", "deny")]
    if rules.get("edit") != expected_edit:
        ERRORS.append(f"{path.relative_to(ROOT)}: unexpected edit rules")

for name in {"builder-junior", "builder-senior"}:
    path = ROOT / f".opencode/agents/{name}.md"
    rules = permission_rules(path).get("bash", [])
    expected_baseline = ("*", "allow") if name == "builder-senior" else ("*", "ask")
    if not rules or rules[0] != expected_baseline:
        ERRORS.append(f"{path.relative_to(ROOT)}: bash baseline is incorrect")
    require_effective(path, "bash", {
        "ls": "allow", "ls src": "allow", "less README.md": "allow",
        "cat README.md": "allow", "head -n 1 README.md": "allow",
        "tail -n 1 README.md": "allow", "pwd": "allow", "find .": "allow",
        "wc -l README.md": "allow", "sort README.md": "allow",
        "npm test": "allow", "npm test -- --runInBand": "allow",
        "npm testfoo": "ask" if name == "builder-junior" else "allow", "docker build .": "allow",
        "docker system prune": "ask", "docker volume rm data": "ask",
        "docker container rm data": "ask", "docker image rm data": "ask",
        "docker rmi data": "ask", "docker rm data": "ask",
        "mkdir project": "allow", "touch file": "allow", "cp a b": "allow",
        "mv a b": "allow", "tee file": "allow", "rm file": "allow",
        "rmdir empty": "allow", "unlink file": "allow",
        "sed -n 1p README.md": "allow", "printf text > file": "allow",
        "printf text >file": "allow", "printf text>file": "allow",
        "curl https://example.com": "ask", "aws s3 ls": "ask", "psql db": "ask",
        "sudo ls": "deny", "git status": "allow", "git status --short": "allow",
        "git diff": "allow", "git diff --stat": "allow", "git log": "allow", "git log -1": "allow",
        "git add": "deny", "git add file": "deny",
        "git commit -m message": "deny", "git push origin main": "deny",
         "git rebase main": "deny", "git merge main": "deny",
         "git revert HEAD": "deny", "git stash pop": "deny",
         "git branch -d old": "deny", "git worktree remove ../other": "deny",
         "git status && git add file": "deny",
         "git status ; git add file": "deny", "git status | git add file": "deny",
         "git status || git add file": "deny", "git status & git add file": "deny",
          "git status --short && git add file": "deny",
          "git status&&git add file": "deny", "git status --short&&git add file": "deny",
          "git status;git add file": "deny", "git status --short;git add file": "deny",
          "git status|git add file": "deny", "git status --short|git add file": "deny",
          "git status||git add file": "deny", "git status --short||git add file": "deny",
          "git status&git add file": "deny", "git status --short&git add file": "deny",
          "git diff && git add file": "deny", "git log && git commit -m message": "deny",
          "git diff&&git add file": "deny", "git log&&git commit -m message": "deny",
          "git diff;git add file": "deny", "git log;git commit -m message": "deny",
          "git diff|git add file": "deny", "git log|git commit -m message": "deny",
          "git diff||git add file": "deny", "git log||git commit -m message": "deny",
          "git diff&git add file": "deny", "git log&git commit -m message": "deny",
         "git diff ; git add file": "deny", "git diff | git add file": "deny",
         "git diff || git add file": "deny", "git diff & git add file": "deny",
         "git log ; git commit -m message": "deny", "git log | git commit -m message": "deny",
         "git log || git commit -m message": "deny", "git log & git commit -m message": "deny",
         "git log -1 && git commit -m message": "deny",
         "docker pull image": "ask",
    })
    docker_cases = {
        "docker exec app sh": "allow" if name == "builder-senior" else "ask",
        "docker compose exec app sh": "allow" if name == "builder-senior" else "ask",
        "docker compose run app command": "allow" if name == "builder-senior" else "ask",
        "docker compose restart": "allow" if name == "builder-senior" else "ask",
        "docker compose restart app": "allow" if name == "builder-senior" else "ask",
         "docker compose -p demo restart": "ask",
         "docker compose --env-file .env restart": "ask",
         "docker compose -f compose.yml restart": "ask",
         "docker compose --project-directory . restart": "ask",
         "docker compose --profile dev restart": "ask",
          "docker compose --project-name demo restart": "ask",
          "docker compose --project-name demo restart app": "ask",
         "docker compose -p demo run": "ask",
         "docker compose -p demo run app command": "ask",
         "docker compose -p demo exec": "ask",
         "docker compose -p demo exec app sh": "ask",
         "docker compose --env-file .env run": "ask",
         "docker compose --env-file .env run app command": "ask",
         "docker compose --env-file .env exec": "ask",
         "docker compose --env-file .env exec app sh": "ask",
         "docker compose -f compose.yml run": "ask",
         "docker compose -f compose.yml run app command": "ask",
         "docker compose -f compose.yml exec": "ask",
         "docker compose -f compose.yml exec app sh": "ask",
         "docker compose --project-directory . run": "ask",
         "docker compose --project-directory . run app command": "ask",
         "docker compose --project-directory . exec": "ask",
         "docker compose --project-directory . exec app sh": "ask",
          "docker compose --project-name demo run": "ask",
          "docker compose --project-name demo run app command": "ask",
          "docker compose --project-name demo exec": "ask",
          "docker compose --project-name demo exec app sh": "ask",
         "docker compose --profile dev run": "ask",
         "docker compose --profile dev run app command": "ask",
         "docker compose --profile dev exec": "ask",
          "docker compose --profile dev exec app sh": "ask",
          "docker compose -p=demo restart": "ask",
          "docker compose --env-file=.env restart": "ask",
          "docker compose -f=compose.yml restart": "ask",
          "docker compose --project-directory=. restart": "ask",
          "docker compose --profile=dev restart": "ask",
          "docker compose -p=demo run": "ask",
          "docker compose --env-file=.env run": "ask",
          "docker compose -f=compose.yml run": "ask",
          "docker compose --project-directory=. run": "ask",
          "docker compose --profile=dev run": "ask",
          "docker compose -p=demo exec": "ask",
          "docker compose --env-file=.env exec": "ask",
          "docker compose -f=compose.yml exec": "ask",
          "docker compose --project-directory=. exec": "ask",
          "docker compose --profile=dev exec": "ask",
           "docker compose --project-name=demo restart": "ask",
           "docker compose --project-name=demo restart app": "ask",
           "docker compose --project-name=demo run": "ask",
           "docker compose --project-name=demo run app command": "ask",
           "docker compose --project-name=demo exec": "ask",
           "docker compose --project-name=demo exec app sh": "ask",
        "docker compose pull": "ask",
        "docker compose pull image": "ask",
        "docker compose up": "ask",
        "docker compose up app": "ask",
        "docker compose down": "ask",
        "docker compose down app": "ask",
        "docker compose -f compose.yml pull": "ask",
        "docker compose --project-name demo up": "ask",
        "docker compose -f compose.yml down": "ask",
    }
    require_effective(path, "bash", docker_cases)
    require_ordered(path, "bash", expected_baseline, ("git *", "deny"))
    require_ordered(path, "bash", ("git *", "deny"), ("git status", "allow"))
    require_ordered(path, "bash", ("git *", "deny"), ("git status *", "allow"))
    require_ordered(path, "bash", ("git *", "deny"), ("git diff", "allow"))
    require_ordered(path, "bash", ("git *", "deny"), ("git diff *", "allow"))
    require_ordered(path, "bash", ("git *", "deny"), ("git log", "allow"))
    require_ordered(path, "bash", ("git *", "deny"), ("git log *", "allow"))

orchestrator_path = ROOT / ".opencode/agents/orchestrator.md"
require_effective(orchestrator_path, "bash", {
    "git rev-parse --show-toplevel": "allow", "git branch --show-current": "allow",
    "git status": "allow", "git status --short": "allow", "git worktree list": "allow",
    "git diff": "allow", "git diff --stat": "allow", "git diff --name-only": "allow",
    "git diff --check": "allow", "git log": "allow", "git log -1": "allow",
    "ls": "deny", "npm test": "deny", "docker ps": "deny",
    "git add file": "deny", "git status && git add file": "deny",
})
require_ordered(orchestrator_path, "bash", ("*", "deny"), ("git rev-parse --show-toplevel", "allow"))

reviewer_text = (ROOT / ".opencode/agents/reviewer.md").read_text(encoding="utf-8")
if not all(rule in reviewer_text for rule in ("  edit: deny", "  task: deny", '    "*": deny')):
    ERRORS.append("reviewer must enforce read-only permissions")

shipper_text = (ROOT / ".opencode/agents/shipper.md").read_text(encoding="utf-8")
if not all(rule in shipper_text for rule in ("  edit: deny", "  task: deny", '    "*": deny')):
    ERRORS.append("shipper must deny edits, delegation, and non-Git shell commands")
shipper_path = ROOT / ".opencode/agents/shipper.md"
require_effective(shipper_path, "bash", {
    "git status": "allow", "git diff --stat": "allow", "git log -1": "allow",
    "git add file": "allow", "git commit -m message": "allow",
    "git push": "ask", "git push origin main": "deny", "git push --force": "deny",
    "ls": "deny",
})
require_effective(ROOT / ".opencode/agents/reviewer.md", "bash", {
    "git status": "allow", "git diff": "allow", "git log": "allow",
    "ls": "deny", "git add file": "deny", "git status && git add file": "deny",
    "docker exec app sh": "deny", "docker compose exec app sh": "deny",
    "docker compose run app command": "deny", "npm test": "deny",
})

analyst_path = ROOT / ".opencode/agents/analyst.md"
if permission_rules(analyst_path).get("bash") != [("*", "deny")]:
    ERRORS.append(".opencode/agents/analyst.md: bash execution must remain denied")

for name in ("builder-junior", "builder-senior"):
    require_markers(ROOT / f".opencode/agents/{name}.md", ("Run task-local checks",))
require_markers(orchestrator_path, (
    "delegate one sequential final builder-senior integration-verification task",
    "approved cross-component test paths only within an existing suitable suite",
    "run the combined check",
    "must not silently fix or re-scope failures",
    "baselines are encouraged, not mandatory",
    "preserve the failure evidence",
))
require_markers(ROOT / ".opencode/agents/reviewer.md", (
    "Assess the diff against the approved definition and the supplied verification evidence",
    "remain read-only",
    "do not execute tests, Docker, or other commands",
))

for name in ("orchestrator", "reviewer", "shipper"):
    path = ROOT / f".opencode/agents/{name}.md"
    rules = permission_rules(path).get("bash", [])
    if not rules:
        ERRORS.append(f"{path.relative_to(ROOT)}: missing bash rules")
    if name == "orchestrator" and rules[0] != ("*", "deny"):
        ERRORS.append(f"{path.relative_to(ROOT)}: bash baseline must be first and deny")

for name in ("orchestrator", "builder-junior", "builder-senior", "reviewer", "shipper"):
    path = ROOT / f".opencode/agents/{name}.md"
    rules = permission_rules(path).get("bash", [])
    if rules and not ordered_rules_safe(rules):
        ERRORS.append(f"{path.relative_to(ROOT)}: bash broad default must be first and only broad rule")

# An unsafe broad rule at the end silently overrides every specific exception.
for path in agents:
    for tool, rules in permission_rules(path).items():
        if len(rules) > 1 and rules[-1][0] == "*":
            ERRORS.append(f"{path.relative_to(ROOT)}: unsafe broad rule is last for {tool}")

if not (ROOT / "templates/AGENTS.global.md").is_file():
    ERRORS.append("missing global AGENTS template")
installer = ROOT / "scripts/install.sh"
if not installer.is_file():
    ERRORS.append("missing installer")
elif ".ai/work" in installer.read_text(encoding="utf-8"):
    ERRORS.append("global installer must not create project runtime state")


def require_text(path: Path, markers: tuple[str, ...]) -> str:
    if not path.is_file():
        ERRORS.append(f"missing {path.relative_to(ROOT)}")
        return ""
    text = path.read_text(encoding="utf-8")
    for marker in markers:
        if marker not in text:
            ERRORS.append(f"{path.relative_to(ROOT)}: missing {marker}")
    return text


package_path = ROOT / "package.json"
try:
    package = json.loads(package_path.read_text(encoding="utf-8"))
except (OSError, json.JSONDecodeError) as exc:
    ERRORS.append(f"package.json: invalid JSON ({exc})")
    package = {}
if package.get("name") != "ai-dev-workflow":
    ERRORS.append("package.json: expected name ai-dev-workflow")
if not isinstance(package.get("keywords"), list) or package["keywords"].count("pi-package") != 1:
    ERRORS.append("package.json: expected pi-package keyword")
dependencies = package.get("dependencies", {})
if not isinstance(dependencies, dict) or dependencies.get("pi-subagents") != "0.35.1":
    ERRORS.append("package.json: pi-subagents must be pinned to 0.35.1")

package_lock_path = ROOT / "package-lock.json"
try:
    package_lock = json.loads(package_lock_path.read_text(encoding="utf-8"))
except (OSError, json.JSONDecodeError) as exc:
    ERRORS.append(f"package-lock.json: invalid JSON ({exc})")
    package_lock = {}
lock_packages = package_lock.get("packages", {})
if not isinstance(lock_packages, dict):
    ERRORS.append("package-lock.json: missing packages block")
    lock_packages = {}
lock_root = lock_packages.get("")
if not isinstance(lock_root, dict):
    ERRORS.append("package-lock.json: missing root package entry")
    lock_root = {}
lock_dependencies = lock_root.get("dependencies", {})
if not isinstance(lock_dependencies, dict) or lock_dependencies.get("pi-subagents") != "0.35.1":
    ERRORS.append("package-lock.json: root package must pin pi-subagents to 0.35.1")

pi_declarations = package.get("pi", {})
expected_pi_declarations = {
    "prompts": ["./pi/prompts"],
    "extensions": [
        "./pi/extensions/workflow.ts",
        "./pi/extensions/builder-guard.ts",
        "./pi/extensions/reviewer-guard.ts",
        "./pi/extensions/shipper-guard.ts",
    ],
}
if not isinstance(pi_declarations, dict):
    ERRORS.append("package.json: missing Pi declaration block")
    pi_declarations = {}
for declaration, expected in expected_pi_declarations.items():
    if pi_declarations.get(declaration) != expected:
        ERRORS.append(f"package.json: unexpected Pi declaration {declaration}")
subagents = pi_declarations.get("subagents", {})
if not isinstance(subagents, dict) or subagents.get("agents") != ["./pi/agents"]:
    ERRORS.append("package.json: unexpected Pi declaration subagents.agents")

pi_agent_dir = ROOT / "pi/agents"
pi_agents = sorted(pi_agent_dir.glob("*.md"))
if {path.stem for path in pi_agents} != expected_agents - {"orchestrator"}:
    ERRORS.append("Pi agents do not match expected six roles")
expected_pi_tools = {
    "analyst": "read,grep,find,ls",
    "explorer": "read,grep,find,ls",
    "builder-junior": "read,grep,find,ls,edit,write,bash",
    "builder-senior": "read,grep,find,ls,edit,write,bash",
    "reviewer": "read,grep,find,ls,bash",
    "shipper": "read,grep,find,ls,bash",
}
for path in pi_agents:
    data = frontmatter(path)
    for key in ("name", "description", "tools", "maxSubagentDepth"):
        if not data.get(key):
            ERRORS.append(f"{path.relative_to(ROOT)}: missing {key}")
    if data.get("name") != path.stem:
        ERRORS.append(f"{path.relative_to(ROOT)}: name must match filename")
    if data.get("maxSubagentDepth") != "0":
        ERRORS.append(f"{path.relative_to(ROOT)}: maxSubagentDepth must be 0")
    if data.get("tools") != expected_pi_tools.get(path.stem):
        ERRORS.append(f"{path.relative_to(ROOT)}: unexpected tools")
    if "package" in data:
        ERRORS.append(f"{path.relative_to(ROOT)}: package role namespace is not allowed")
    if "subagentOnlyExtensions" in data:
        ERRORS.append(f"{path.relative_to(ROOT)}: guards must load from the global package")

for path in sorted(path for path in (ROOT / "pi").rglob("*") if path.is_file()):
    text = path.read_text(encoding="utf-8")
    if re.search(r"(?i)(?:model\s*[:=]|(?:openai|anthropic|google|mistral)/)", text):
        ERRORS.append(f"{path.relative_to(ROOT)}: models must remain provider-neutral")

dev_prompt = ROOT / "pi/prompts/dev.md"
dev_text = require_text(dev_prompt, ("$ARGUMENTS", "analyst", "explorer", "builder-junior", "builder-senior", "reviewer", "shipper", "explicit approval", ".worktrees", ".ai/work"))
if dev_text and not frontmatter(dev_prompt):
    ERRORS.append("pi/prompts/dev.md: invalid frontmatter")

for filename, markers in {
    "builder-guard.ts": ("PI_SUBAGENT_CHILD_AGENT", "builder-junior", "builder-senior", 'from "./command-policy"', "block"),
    "reviewer-guard.ts": ("PI_SUBAGENT_CHILD_AGENT", "reviewer", 'from "./command-policy"', "block"),
    "shipper-guard.ts": ("PI_SUBAGENT_CHILD_AGENT", "shipper", 'from "./command-policy"', "block", "isNormalPush"),
    "workflow.ts": ("registerCommand(\"workflow-status\"", "gitRoot", "existsSync"),
}.items():
    require_text(ROOT / "pi/extensions" / filename, markers)

policy_path = ROOT / "pi/extensions/command-policy.ts"
require_text(policy_path, ("parseCommand", "isReviewerCommand", "isShipperCommand", "builderCommandBlocked", "--output", "--no-verify"))
test_path = ROOT / "tests/pi-command-policy.test.ts"
require_text(test_path, ("node:test", "isReviewerCommand", "isShipperCommand", "builderCommandBlocked"))

gitignore = (ROOT / ".gitignore").read_text(encoding="utf-8")
if not any(line.strip() == "node_modules/" for line in gitignore.splitlines()):
    ERRORS.append(".gitignore: node_modules/ must be ignored")

pi_extensions = sorted((ROOT / "pi/extensions").glob("*.ts"))
loadable_extensions = [path for path in pi_extensions if path.name != "command-policy.ts"]
if len(loadable_extensions) != 4:
    ERRORS.append(f"expected 4 loadable Pi extensions, found {len(loadable_extensions)}")

if ERRORS:
    for error in ERRORS:
        print(f"ERROR: {error}", file=sys.stderr)
    raise SystemExit(1)

print(f"OK: OpenCode ({len(commands)} commands, {len(agents)} agents) and Pi (6 agents, {len(loadable_extensions)} extensions)")
