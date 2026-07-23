#!/usr/bin/env python3
"""Validate the repository's OpenCode Markdown definitions using stdlib only."""

from __future__ import annotations

import re
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
            match = re.fullmatch(r'    "(.*)": (allow|ask|deny)', line)
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
    expected_edit = "allow" if name in {"orchestrator", "builder-junior", "builder-senior"} else "deny"
    if rules.get("edit") != [("*", expected_edit)]:
        ERRORS.append(f"{path.relative_to(ROOT)}: edit must be {expected_edit}")

for name in {"builder-junior", "builder-senior"}:
    path = ROOT / f".opencode/agents/{name}.md"
    rules = permission_rules(path).get("bash", [])
    if not rules or rules[0] != ("*", "ask"):
        ERRORS.append(f"{path.relative_to(ROOT)}: bash baseline must be first and ask")
    require_effective(path, "bash", {
        "ls": "allow", "ls src": "allow", "less README.md": "allow",
        "cat README.md": "allow", "head -n 1 README.md": "allow",
        "tail -n 1 README.md": "allow", "pwd": "allow", "find .": "allow",
        "wc -l README.md": "allow", "sort README.md": "allow",
        "npm test": "allow", "npm test -- --runInBand": "allow",
        "npm testfoo": "ask", "docker build .": "allow",
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
        "git diff && git add file": "deny", "git log && git commit -m message": "deny",
        "docker pull image": "ask",
    })
    docker_cases = {
        "docker exec app sh": "allow" if name == "builder-senior" else "ask",
        "docker compose exec app sh": "allow" if name == "builder-senior" else "ask",
        "docker compose run app command": "allow" if name == "builder-senior" else "ask",
    }
    require_effective(path, "bash", docker_cases)
    require_ordered(path, "bash", ("*", "ask"), ("git *", "deny"))
    require_ordered(path, "bash", ("git *", "deny"), ("git status", "allow"))
    require_ordered(path, "bash", ("git *", "deny"), ("git status *", "allow"))
    require_ordered(path, "bash", ("git *", "deny"), ("git diff", "allow"))
    require_ordered(path, "bash", ("git *", "deny"), ("git diff *", "allow"))
    require_ordered(path, "bash", ("git *", "deny"), ("git log", "allow"))
    require_ordered(path, "bash", ("git *", "deny"), ("git log *", "allow"))

orchestrator_path = ROOT / ".opencode/agents/orchestrator.md"
require_effective(orchestrator_path, "bash", {
    "rm file": "allow", "rmdir empty": "allow", "unlink file": "allow",
    "mkdir project": "allow", "touch file": "allow", "cp a b": "allow",
    "mv a b": "allow", "tee file": "allow", "sed -n 1p README.md": "allow",
    "printf text > file": "allow", "printf text >file": "allow", "printf text>file": "allow",
    "docker system prune": "ask", "docker volume rm data": "ask",
    "docker container rm data": "ask", "docker image rm data": "ask",
    "docker rmi data": "ask", "docker rm data": "ask",
    "curl https://example.com": "ask", "psql db": "ask", "sudo ls": "deny",
    "git status": "allow", "git status --short": "allow",
    "git diff": "allow", "git diff --stat": "allow", "git log": "allow", "git log -1": "allow",
    "git add": "deny", "git add file": "deny", "git push origin main": "deny",
    "git status && git add file": "deny", "git diff && git add file": "deny",
    "git log && git commit -m message": "deny",
})
require_ordered(orchestrator_path, "bash", ("*", "ask"), ("git *", "deny"))
require_ordered(orchestrator_path, "bash", ("git *", "deny"), ("git status", "allow"))

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
    if name == "orchestrator" and rules[0] != ("*", "ask"):
        ERRORS.append(f"{path.relative_to(ROOT)}: bash baseline must be first and ask")

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

if ERRORS:
    for error in ERRORS:
        print(f"ERROR: {error}", file=sys.stderr)
    raise SystemExit(1)

print(f"OK: {len(commands)} commands, {len(agents)} agents, {len(skills)} skills")
