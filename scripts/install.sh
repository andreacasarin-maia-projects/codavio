#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-}"
FORCE="${2:-}"

if [[ -z "$TARGET" ]]; then
  echo "Usage: $0 /path/to/project [--force]" >&2
  exit 2
fi

TARGET="$(cd "$TARGET" && pwd)"
if [[ ! -d "$TARGET/.git" ]]; then
  echo "Target must be a Git repository: $TARGET" >&2
  exit 2
fi

mkdir -p "$TARGET/.opencode/agents" "$TARGET/.opencode/commands" "$TARGET/.opencode/skills" "$TARGET/.ai/work"

copy_tree() {
  local source="$1"
  local destination="$2"
  if [[ "$FORCE" != "--force" ]]; then
    while IFS= read -r source_file; do
      local relative="${source_file#"$source"/}"
      if [[ -e "$destination/$relative" ]]; then
        echo "Refusing to overwrite $destination/$relative; rerun with --force" >&2
        exit 3
      fi
    done < <(find "$source" -type f)
  fi
  cp -R "$source/." "$destination/"
}

copy_tree "$ROOT/.opencode/agents" "$TARGET/.opencode/agents"
copy_tree "$ROOT/.opencode/commands" "$TARGET/.opencode/commands"
copy_tree "$ROOT/.opencode/skills" "$TARGET/.opencode/skills"

touch "$TARGET/.ai/work/.gitkeep"

AGENTS="$TARGET/AGENTS.md"
MARKER="## AI development workflow"
if [[ ! -f "$AGENTS" ]]; then
  cp "$ROOT/templates/AGENTS.workflow.md" "$AGENTS"
elif ! grep -Fq "$MARKER" "$AGENTS"; then
  printf '\n' >> "$AGENTS"
  cat "$ROOT/templates/AGENTS.workflow.md" >> "$AGENTS"
fi

printf 'Installed AI Dev Workflow into %s\n' "$TARGET"
printf 'Start with: /define <request>\n'
