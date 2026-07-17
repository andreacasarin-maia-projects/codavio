#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
FORCE="${1:-}"
CONFIG_ROOT="${XDG_CONFIG_HOME:-${HOME:?HOME must be set}/.config}"
TARGET="$CONFIG_ROOT/opencode"

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

check_directory() {
  local destination="$1"
  local backup="$destination.backup"

  if [[ -d "$destination" ]]; then
    return
  fi
  if [[ -e "$destination" || -L "$destination" ]]; then
    if [[ "$FORCE" != "--force" ]]; then
      echo "Refusing to replace $destination; rerun with --force" >&2
      exit 3
    fi
    if [[ -e "$backup" || -L "$backup" ]]; then
      echo "Refusing to overwrite existing backup $backup" >&2
      exit 3
    fi
  fi
}

prepare_directory() {
  local destination="$1"

  if [[ -d "$destination" ]]; then
    return
  fi
  if [[ -e "$destination" || -L "$destination" ]]; then
    mv "$destination" "$destination.backup"
  fi
  mkdir -p "$destination"
}

check_path() {
  local source="$1"
  local destination="$2"
  local backup="$destination.backup"

  if same_link "$source" "$destination"; then
    return
  fi

  if [[ -e "$destination" || -L "$destination" ]]; then
    if [[ "$FORCE" != "--force" ]]; then
      echo "Refusing to replace $destination; rerun with --force" >&2
      exit 3
    fi
    if [[ -e "$backup" || -L "$backup" ]]; then
      echo "Refusing to overwrite existing backup $backup" >&2
      exit 3
    fi
  fi
}

link_path() {
  local source="$1"
  local destination="$2"

  if same_link "$source" "$destination"; then
    return
  fi

  if [[ -e "$destination" || -L "$destination" ]]; then
    mv "$destination" "$destination.backup"
  fi

  ln -s "$source" "$destination"
}

visit_paths() {
  local action="$1"
  local source
  local skill_file

  for source in "$ROOT/.opencode/agents/"*.md; do
    "$action" "$source" "$TARGET/agents/$(basename "$source")"
  done

  for source in "$ROOT/.opencode/commands/"*.md; do
    "$action" "$source" "$TARGET/commands/$(basename "$source")"
  done

  for skill_file in "$ROOT/.opencode/skills/"*/SKILL.md; do
    source="$(dirname "$skill_file")"
    "$action" "$source" "$TARGET/skills/$(basename "$source")"
  done

  "$action" "$ROOT/templates/AGENTS.global.md" "$TARGET/AGENTS.md"
}

check_directory "$TARGET"
check_directory "$TARGET/agents"
check_directory "$TARGET/commands"
check_directory "$TARGET/skills"
visit_paths check_path

prepare_directory "$TARGET"
prepare_directory "$TARGET/agents"
prepare_directory "$TARGET/commands"
prepare_directory "$TARGET/skills"
visit_paths link_path

printf 'Linked AI Dev Workflow into %s\n' "$TARGET"
printf 'Start with: /analyze <request>\n'
printf 'Restart OpenCode after repository updates.\n'
