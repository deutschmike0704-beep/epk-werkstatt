#!/usr/bin/env bash
# Hook: load-context
# Version: 1.0.0
# Event: SessionStart
# Zweck: Beim Sessionstart Projekt-Status (offene Tasks, letzte Reflexion) kompakt einblenden,
#        damit Claude sofort mit aktuellem Kontext startet statt bei 0 anzufangen.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
QUEUE="$ROOT/tasks/queue.json"
LAST_REFLECTION="$(ls -t "$ROOT"/logs/sessions/*.md 2>/dev/null | head -n1 || true)"

echo "== AI Workstation: Kontext geladen =="

if [ -f "$QUEUE" ] && command -v jq >/dev/null 2>&1; then
  OPEN_COUNT=$(jq '[.tasks[]? | select(.status != "done")] | length' "$QUEUE" 2>/dev/null || echo "?")
  echo "Offene Tasks in tasks/queue.json: $OPEN_COUNT"
  jq -r '.tasks[]? | select(.status != "done") | "  [\(.priority)] \(.id): \(.title)"' "$QUEUE" 2>/dev/null | head -n 5 || true
fi

if [ -n "${LAST_REFLECTION:-}" ]; then
  echo "Letzte Session-Notiz: $(basename "$LAST_REFLECTION")"
fi

exit 0
