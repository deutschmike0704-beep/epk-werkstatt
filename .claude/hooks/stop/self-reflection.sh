#!/usr/bin/env bash
# Hook: self-reflection
# Version: 1.0.0
# Event: Stop
# Zweck: Layer-06-Grundstein. Schreibt bei jedem Antwortende eine Session-Notiz (Zeitstempel,
#        offene Tasks) weg, damit load-context.sh (SessionStart) und der reflector-Subagent
#        einen Verlauf haben, ohne dass der Mensch manuell mitschreiben muss.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
SESSIONS_DIR="$ROOT/logs/sessions"
mkdir -p "$SESSIONS_DIR"

TS="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
NOTE_FILE="$SESSIONS_DIR/${TS}.md"

{
  echo "# Session-Notiz $TS"
  echo
  echo "Automatisch erzeugt durch .claude/hooks/stop/self-reflection.sh"
  if [ -f "$ROOT/tasks/queue.json" ] && command -v jq >/dev/null 2>&1; then
    echo
    echo "## Offene Tasks"
    jq -r '.tasks[]? | select(.status != "done") | "- [\(.priority)] \(.id): \(.title)"' \
      "$ROOT/tasks/queue.json" 2>/dev/null || echo "(Queue nicht lesbar)"
  fi
} > "$NOTE_FILE"

# Housekeeping: nur die letzten 200 Notizen behalten, um logs/ nicht unbegrenzt wachsen zu lassen.
# (portabel für macOS/BSD und GNU xargs, daher Schleife statt `xargs -r`)
ls -t "$SESSIONS_DIR"/*.md 2>/dev/null | tail -n +201 | while IFS= read -r old_note; do
  rm -f -- "$old_note"
done

exit 0
