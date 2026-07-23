#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
PI_BIN="${PI_BIN:-pi}"
NPM_BIN="${NPM_BIN:-npm}"
PERMISSION_PACKAGE="npm:@gotgenes/pi-permission-system"
WORKFLOW_PACKAGE="$ROOT"

if [[ $# -ne 0 ]]; then
  echo "Usage: $0" >&2
  exit 2
fi

if ! command -v "$PI_BIN" >/dev/null 2>&1; then
  echo "Pi executable not found: $PI_BIN" >&2
  exit 3
fi

if ! command -v "$NPM_BIN" >/dev/null 2>&1; then
  echo "npm executable not found: $NPM_BIN" >&2
  exit 3
fi

(
  cd "$ROOT"
  "$NPM_BIN" install
)

"$PI_BIN" install "$PERMISSION_PACKAGE"
"$PI_BIN" install "$WORKFLOW_PACKAGE"

LIST_OUTPUT="$("$PI_BIN" list)"
if [[ "$LIST_OUTPUT" != *"pi-permission-system"* ]]; then
  echo "Pi did not list pi-permission-system after installation." >&2
  exit 4
fi
if [[ "$LIST_OUTPUT" != *"ai-dev-workflow"* && "$LIST_OUTPUT" != *"$WORKFLOW_PACKAGE"* ]]; then
  echo "Pi did not list ai-dev-workflow after installation." >&2
  exit 4
fi

printf '%s\n' "$LIST_OUTPUT"
printf 'Installed AI Dev Workflow with Pi permission enforcement.\n'
printf 'Start Pi, run /subagents-doctor, then invoke: /dev <request>\n'
