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

expected_commands = {"analyze", "plan", "build", "review", "ship"}
expected_agents = {"analyst", "planner", "builder", "worker-mini", "worker-luna", "reviewer", "shipper"}
expected_skills = {"testing-policy"}

if {p.stem for p in commands} != expected_commands:
    ERRORS.append("commands do not match expected workflow")
if {p.stem for p in agents} != expected_agents:
    ERRORS.append("agents do not match expected workflow")
if {p.parent.name for p in skills} != expected_skills:
    ERRORS.append("skills do not match expected workflow")

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

for path in commands:
    data = frontmatter(path)
    for key in ("description", "agent"):
        if not data.get(key):
            ERRORS.append(f"{path.relative_to(ROOT)}: missing {key}")
    if data.get("agent") not in agent_names:
        ERRORS.append(f"{path.relative_to(ROOT)}: unknown agent {data.get('agent')}")

for path in skills:
    data = frontmatter(path)
    for key in ("name", "description"):
        if not data.get(key):
            ERRORS.append(f"{path.relative_to(ROOT)}: missing {key}")
    if data.get("name") != path.parent.name:
        ERRORS.append(f"{path.relative_to(ROOT)}: skill name/path mismatch")

if not (ROOT / "templates/AGENTS.global.md").is_file():
    ERRORS.append("missing global AGENTS template")
if not (ROOT / "scripts/install.sh").is_file():
    ERRORS.append("missing installer")

if ERRORS:
    for error in ERRORS:
        print(f"ERROR: {error}", file=sys.stderr)
    raise SystemExit(1)

print(f"OK: {len(commands)} commands, {len(agents)} agents, {len(skills)} skill")
