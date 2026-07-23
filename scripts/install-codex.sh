#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
FORCE="${1:-}"
CODEX_ROOT="${CODEX_HOME:-${HOME:?HOME must be set}/.codex}"
CODEX_BIN="${CODEX_BIN:-codex}"
GLOBAL_AGENTS="$CODEX_ROOT/AGENTS.md"
GLOBAL_AGENTS_BACKUP="$GLOBAL_AGENTS.backup"
MARKETPLACE_ROOT="$ROOT/codex"
MARKETPLACE_NAME="ai-dev-workflow"
PLUGIN_NAME="ai-dev-workflow"

if [[ $# -gt 1 || ( -n "$FORCE" && "$FORCE" != "--force" ) ]]; then
  echo "Usage: $0 [--force]" >&2
  exit 2
fi

same_link() {
  local source="$1"
  local destination="$2"
  local target

  [[ -L "$destination" ]] || return 1
  target="$(readlink "$destination")"
  if [[ "$target" != /* ]]; then
    target="$(dirname "$destination")/$target"
  fi
  if [[ -e "$target" ]]; then
    target="$(cd "$(dirname "$target")" && pwd -P)/$(basename "$target")"
  fi
  [[ "$target" == "$source" ]]
}

if ! same_link "$ROOT/templates/AGENTS.global.md" "$GLOBAL_AGENTS"; then
  if [[ -e "$GLOBAL_AGENTS" || -L "$GLOBAL_AGENTS" ]]; then
    if [[ "$FORCE" != "--force" ]]; then
      echo "Refusing to replace $GLOBAL_AGENTS; rerun with --force" >&2
      exit 3
    fi
    if [[ -e "$GLOBAL_AGENTS_BACKUP" || -L "$GLOBAL_AGENTS_BACKUP" ]]; then
      echo "Refusing to overwrite existing backup $GLOBAL_AGENTS_BACKUP" >&2
      exit 3
    fi
  fi
fi

mkdir -p "$CODEX_ROOT"
if ! same_link "$ROOT/templates/AGENTS.global.md" "$GLOBAL_AGENTS"; then
  if [[ -e "$GLOBAL_AGENTS" || -L "$GLOBAL_AGENTS" ]]; then
    mv "$GLOBAL_AGENTS" "$GLOBAL_AGENTS_BACKUP"
  fi
  ln -s "$ROOT/templates/AGENTS.global.md" "$GLOBAL_AGENTS"
fi

"$CODEX_BIN" plugin marketplace add "$MARKETPLACE_ROOT"
"$CODEX_BIN" plugin add "$PLUGIN_NAME@$MARKETPLACE_NAME"

printf 'Linked global guidance into %s\n' "$GLOBAL_AGENTS"
printf 'Installed %s from %s\n' "$PLUGIN_NAME" "$MARKETPLACE_ROOT"
printf 'Start a new Codex task and invoke: $dev-workflow <request>\n'
