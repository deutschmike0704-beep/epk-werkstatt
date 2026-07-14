#!/usr/bin/env bash
# Hook: quality-check
# Version: 1.0.0
# Event: PostToolUse (matcher: Edit|Write)
# Zweck: Layer-03-Qualitätsgate. Nach Datei-Änderungen leichte, schnelle Checks fahren
#        (Syntax/Lint, sofern vorhanden) und Ergebnis strukturiert loggen (Layer 06).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
LOG="$ROOT/logs/metrics/cost_tracking.jsonl"
INPUT="$(cat)"

if command -v jq >/dev/null 2>&1; then
  FILE_PATH="$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')"
else
  FILE_PATH=""
fi

STATUS="ok"
DETAIL=""

# Projekt-agnostischer, best-effort Check: nur ausführen, wenn ein bekannter Linter/Typechecker
# im Zielprojekt vorhanden ist. Bewusst nicht hart fehlschlagen, wenn Tooling fehlt.
if [ -n "$FILE_PATH" ] && [ -f "$FILE_PATH" ]; then
  case "$FILE_PATH" in
    *.py)
      if command -v python3 >/dev/null 2>&1; then
        if ! python3 -m py_compile "$FILE_PATH" 2>/tmp/quality-check.err; then
          STATUS="fail"; DETAIL="$(tail -n1 /tmp/quality-check.err)"
        fi
      fi
      ;;
    *.sh)
      if command -v bash >/dev/null 2>&1; then
        if ! bash -n "$FILE_PATH" 2>/tmp/quality-check.err; then
          STATUS="fail"; DETAIL="$(tail -n1 /tmp/quality-check.err)"
        fi
      fi
      ;;
  esac
fi

mkdir -p "$(dirname "$LOG")"
printf '{"ts":"%s","hook":"quality-check","file":"%s","status":"%s","detail":"%s"}\n' \
  "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "${FILE_PATH:-unknown}" "$STATUS" "${DETAIL//\"/\\\"}" >> "$LOG"

if [ "$STATUS" = "fail" ]; then
  echo "Quality-Check fehlgeschlagen für $FILE_PATH: $DETAIL" >&2
  echo "Root-Cause-Analyse gemäß CLAUDE.md Abschnitt 6 (Debugging-Protokoll) einleiten." >&2
  exit 2
fi

exit 0
