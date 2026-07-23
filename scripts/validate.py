#!/usr/bin/env python3
"""Validate the repository's OpenCode and Pi definitions using stdlib only."""

from __future__ import annotations

import re
import json
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

common_permission_rules = (
    '  read:\n    "*": allow\n    "**/.env": deny\n    "**/.env.*": deny\n    "**/.env.example": allow',
    "  glob: allow",
    "  grep: allow",
    "  list: allow",
)
for name in expected_agents:
    text = (ROOT / f".opencode/agents/{name}.md").read_text(encoding="utf-8")
    for required_rule in common_permission_rules:
        if required_rule not in text:
            ERRORS.append(f".opencode/agents/{name}.md: missing balanced permission rule")
    network_action = "deny" if name == "shipper" else "ask"
    for tool in ("external_directory", "webfetch", "websearch"):
        if f"  {tool}: {network_action}" not in text:
            ERRORS.append(f".opencode/agents/{name}.md: expected {tool} to {network_action}")

for name in {"builder-junior", "builder-senior"}:
    text = (ROOT / f".opencode/agents/{name}.md").read_text(encoding="utf-8")
    for required_rule in (
        '    "npm test*": allow',
        '    "npm run build*": allow',
        '    "bundle exec rspec*": allow',
        '    "pytest*": allow',
        '    "ruff check*": allow',
        '    "go test*": allow',
        '    "cargo test*": allow',
        '    "cargo check*": allow',
        '    "ctest*": allow',
        '    "yamllint*": allow',
        '    "docker build*": allow',
        '    "docker compose build*": allow',
        '    "docker system prune*": deny',
        '    "docker volume rm*": deny',
        '    "git push*": deny',
        '    "git reset*": deny',
        '    "rm *": deny',
        '    "sudo *": deny',
    ):
        if required_rule not in text:
            ERRORS.append(f".opencode/agents/{name}.md: missing builder shell rule {required_rule.strip()}")

reviewer_text = (ROOT / ".opencode/agents/reviewer.md").read_text(encoding="utf-8")
if not all(rule in reviewer_text for rule in ("  edit: deny", "  task: deny", '    "*": deny')):
    ERRORS.append("reviewer must enforce read-only permissions")

shipper_text = (ROOT / ".opencode/agents/shipper.md").read_text(encoding="utf-8")
if not all(rule in shipper_text for rule in ("  edit: deny", "  task: deny", '    "*": deny')):
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
