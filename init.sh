#!/usr/bin/env bash
# init.sh — Bootstrap-Skript (Layer 00 Core/Bootstrap) der AI-Workstation-Vorlage.
#
# Zwei Modi:
#   1) Ohne Argument: initialisiert DIESES Template selbst (chmod, Abhängigkeiten prüfen,
#      erste Session-Notiz anlegen). Nützlich direkt nach dem Klonen/Entpacken der Vorlage.
#
#   2) Mit Zielpfad: kopiert die Vorlage in ein NEUES Projektverzeichnis, setzt Task-Queue/Logs
#      auf einen sauberen Ausgangszustand zurück und richtet dort git ein (sofern gewünscht).
#      Das ist der Weg, um dieses Template für ein neues Projekt zu verwenden:
#
#        ./init.sh ~/Projekte/mein-neues-projekt
#
# Nach dem Lauf: Zielverzeichnis in Claude Code öffnen, dort `/workflow-autonomous <erste Aufgabe>`
# oder `python3 orchestrator/run_workflow.py` ausführen.
set -euo pipefail

TEMPLATE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-}"

bold() { printf '\033[1m%s\033[0m\n' "$1"; }

check_dependency() {
  local bin="$1" hint="$2"
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "  ⚠ '$bin' nicht gefunden — $hint"
    return 1
  fi
  echo "  ✓ $bin gefunden"
  return 0
}

check_dependencies() {
  bold "Prüfe Abhängigkeiten:"
  check_dependency python3 "wird für orchestrator/ und scripts/ benötigt" || true
  check_dependency jq "optional, verbessert Hooks (Task-Queue-Anzeige); ohne jq laufen Hooks mit reduzierter Funktion" || true
  check_dependency git "optional, für Versionierung des Zielprojekts empfohlen" || true
  check_dependency claude "die Claude-Code-CLI selbst — ohne sie funktioniert nur das Grundgerüst, keine Agent-Loops" || true
}

make_hooks_executable() {
  local root="$1"
  bold "Mache Hooks & Skripte ausführbar:"
  find "$root/.claude/hooks" -type f -name "*.sh" -exec chmod +x {} \;
  chmod +x "$root/orchestrator/run_workflow.py" 2>/dev/null || true
  chmod +x "$root"/scripts/*.py 2>/dev/null || true
  echo "  ✓ erledigt"
}

reset_project_state() {
  local root="$1"
  bold "Setze Task-Queue/Logs auf sauberen Ausgangszustand zurück:"
  cat > "$root/tasks/queue.json" <<'EOF'
{
  "tasks": []
}
EOF
  rm -f "$root"/logs/sessions/*.md "$root"/logs/debug/*.md "$root"/logs/metrics/*.jsonl 2>/dev/null || true
  echo "  ✓ tasks/queue.json geleert, logs/ geleert"
}

init_in_place() {
  bold "== AI Workstation: Selbst-Initialisierung ($TEMPLATE_ROOT) =="
  check_dependencies
  make_hooks_executable "$TEMPLATE_ROOT"

  mkdir -p "$TEMPLATE_ROOT"/logs/{sessions,metrics,debug}
  touch "$TEMPLATE_ROOT"/logs/sessions/.gitkeep "$TEMPLATE_ROOT"/logs/metrics/.gitkeep "$TEMPLATE_ROOT"/logs/debug/.gitkeep

  echo
  bold "Fertig. Nächste Schritte:"
  cat <<EOF
  1. Öffne dieses Verzeichnis in Claude Code.
  2. Lies CLAUDE.md einmal komplett durch (bzw. lass Claude es zu Beginn zusammenfassen).
  3. Trage eine erste echte Aufgabe in tasks/queue.json ein (Vorlage: tasks/TASK_TEMPLATE.md).
  4. Starte den Workflow: /workflow-autonomous T-0002 (oder frei formuliert).
  5. Für ein NEUES Projekt statt Selbst-Init: ./init.sh <zielpfad>
EOF
}

init_new_project() {
  bold "== AI Workstation: neues Projekt unter '$TARGET_DIR' anlegen =="

  if [ -e "$TARGET_DIR" ] && [ -n "$(ls -A "$TARGET_DIR" 2>/dev/null)" ]; then
    echo "Zielverzeichnis '$TARGET_DIR' existiert bereits und ist nicht leer." >&2
    echo "Breche ab, um kein bestehendes Projekt zu überschreiben." >&2
    exit 1
  fi

  mkdir -p "$TARGET_DIR"
  check_dependencies

  bold "Kopiere Vorlage nach '$TARGET_DIR':"
  # rsync bevorzugt (sauberer Exclude-Support), Fallback auf cp für Minimal-Systeme ohne rsync.
  if command -v rsync >/dev/null 2>&1; then
    rsync -a \
      --exclude '.git' \
      --exclude '__pycache__' \
      --exclude '*.pyc' \
      --exclude 'logs/sessions/*.md' \
      --exclude 'logs/debug/*.md' \
      --exclude 'logs/metrics/*.jsonl' \
      "$TEMPLATE_ROOT"/ "$TARGET_DIR"/
  else
    cp -R "$TEMPLATE_ROOT"/. "$TARGET_DIR"/
    rm -rf "$TARGET_DIR/.git" 2>/dev/null || true
    find "$TARGET_DIR" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
  fi
  echo "  ✓ kopiert"

  make_hooks_executable "$TARGET_DIR"
  reset_project_state "$TARGET_DIR"

  if command -v git >/dev/null 2>&1; then
    bold "Initialisiere git im Zielprojekt:"
    (cd "$TARGET_DIR" && git init -q && git add -A && git commit -q -m "Initial commit: AI Workstation template bootstrap")
    echo "  ✓ git-Repo mit initialem Commit erstellt"
  fi

  echo
  bold "Fertig. Nächste Schritte:"
  cat <<EOF
  1. cd "$TARGET_DIR"
  2. Claude Code im neuen Verzeichnis öffnen.
  3. CLAUDE.md an das konkrete Projekt anpassen (Coding Standards, Domänen-Kontext ergänzen).
  4. Erste Aufgabe in tasks/queue.json eintragen.
  5. /workflow-autonomous <Aufgabe> ausführen, oder:
     python3 orchestrator/run_workflow.py
EOF
}

if [ -z "$TARGET_DIR" ]; then
  init_in_place
else
  init_new_project
fi
