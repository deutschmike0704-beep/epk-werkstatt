#!/usr/bin/env bash
# Hook: validate-input
# Version: 1.0.0
# Event: PreToolUse (matcher: Bash)
# Zweck: Technische Durchsetzung des "Destructive-Gate" aus CLAUDE.md Abschnitt 3 — blockiert
#        offensichtlich irreversible/gefährliche Shell-Kommandos, statt sich auf reine
#        Prompt-Disziplin zu verlassen. Ergänzt, ersetzt NICHT die Sorgfaltspflicht des Agents.
#
# Hinweis: Das exakte Hook-I/O-Format (JSON-Felder, Exit-Code-Semantik) folgt der jeweils
# aktuellen Claude-Code-Hook-Doku. Diese Implementierung nutzt exit code 2 + stderr als
# dokumentierten "block + feed reason back to agent"-Mechanismus.
set -euo pipefail

INPUT="$(cat)"

if command -v jq >/dev/null 2>&1; then
  TOOL_NAME="$(echo "$INPUT" | jq -r '.tool_name // empty')"
  COMMAND="$(echo "$INPUT" | jq -r '.tool_input.command // empty')"
else
  TOOL_NAME=""
  COMMAND="$INPUT"
fi

# Denylist irreversibler/hoch-riskanter Muster. Bewusst konservativ und erweiterbar.
DENY_PATTERNS=(
  'rm[[:space:]]+-rf[[:space:]]+/'
  'git[[:space:]]+push[[:space:]]+.*--force'
  'git[[:space:]]+reset[[:space:]]+--hard'
  'git[[:space:]]+clean[[:space:]]+-f'
  'DROP[[:space:]]+TABLE'
  ':(){:|:&};:'
)

for pattern in "${DENY_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$pattern"; then
    echo "BLOCKED durch validate-input.sh (Destructive-Gate): Kommando entspricht Muster '$pattern'." >&2
    echo "Dies erfordert explizite menschliche Bestätigung (siehe CLAUDE.md Abschnitt 3, Destructive-Gate)." >&2
    exit 2
  fi
done

exit 0
