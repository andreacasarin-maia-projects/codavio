#!/usr/bin/env python3
"""Validate the repository's OpenCode Markdown definitions using stdlib only."""

from __future__ import annotations

import re
import sys
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


agents = sorted((ROOT / ".opencode/agents").glob("*.md"))
commands = sorted((ROOT / ".opencode/commands").glob("*.md"))
skills = sorted((ROOT / ".opencode/skills").glob("*/SKILL.md"))

expected_commands = {"analyze"}
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
    if path.stem == "analyze" and data.get("agent") != "orchestrator":
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

reviewer_text = (ROOT / ".opencode/agents/reviewer.md").read_text(encoding="utf-8")
if '  edit: deny\n  task: deny\n  bash:\n    "*": deny' not in reviewer_text:
    ERRORS.append("reviewer must enforce read-only permissions")

shipper_text = (ROOT / ".opencode/agents/shipper.md").read_text(encoding="utf-8")
if '  edit: deny\n  task: deny\n  bash:\n    "*": deny' not in shipper_text:
    ERRORS.append("shipper must deny edits, delegation, and non-Git shell commands")
for required_rule in ('    "git add *": allow', '    "git commit *": allow', '    "git push*": ask'):
    if required_rule not in shipper_text:
        ERRORS.append(f"shipper missing permission rule {required_rule.strip()}")

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
