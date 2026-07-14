# AI Workstation — Template

Eine sofort einsatzbereite Vorlage für eine autonome Claude-Code-"Workstation": bei jeder Aufgabe
läuft automatisch der Loop **Understand & Plan → Load Skills & Context → Run Hooks & Validate →
Delegate to Subagents → Ship, Learn & Improve** — mit Debug-Loop, Context-Management,
Versionierung, Task-Queue, Human-Gates, Kosten-Tracking und automatischer Doku (siehe `CLAUDE.md`
für die vollständige Systembeschreibung, `docs/ARCHITECTURE.md` für den Datenfluss-Überblick).

## Dieses Template für ein neues Projekt nutzen

```bash
# Einmalig: neues Projekt aus der Vorlage anlegen (kopiert alles, setzt Queue/Logs zurück,
# macht Hooks ausführbar, initialisiert git im Zielverzeichnis)
./init.sh ~/Projekte/mein-neues-projekt
cd ~/Projekte/mein-neues-projekt

# Claude Code im neuen Verzeichnis öffnen, dann:
#  1. CLAUDE.md an das konkrete Projekt anpassen (Domäne, Coding-Standards ergänzen)
#  2. Erste Aufgabe eintragen (siehe tasks/TASK_TEMPLATE.md) oder direkt frei formulieren
#  3. Workflow starten:
/workflow-autonomous <Aufgabenbeschreibung>

# Alternativ headless/außerhalb des Chats:
python3 orchestrator/run_workflow.py
```

Ohne Zielpfad initialisiert `./init.sh` stattdessen das aktuelle Verzeichnis selbst (chmod auf
Hooks/Skripte, Abhängigkeits-Check) — nützlich direkt nach dem Klonen dieser Vorlage.

## Wichtigste Einstiegspunkte

| Datei | Zweck |
|---|---|
| `CLAUDE.md` | Vollständige System-/Architekturbeschreibung, verbindlich für jede Session |
| `init.sh` | Bootstrap: Vorlage → neues Projekt, oder Selbst-Init |
| `.claude/commands/workflow-autonomous.md` | `/workflow-autonomous` — Haupt-Loop für eine Aufgabe |
| `.claude/commands/debug-loop.md` | `/debug-loop` — strukturiertes Debugging bei Fehlern |
| `.claude/commands/daily-review.md` | `/daily-review` — Reflection-Routine (Layer 06) |
| `orchestrator/run_workflow.py` | Externer, headless-fähiger Treiber über die Task-Queue |
| `tasks/queue.json` | Aufgaben mit Priorität (P0–P3), siehe `tasks/TASK_TEMPLATE.md` |

## Neue Skills / Hooks / Subagents hinzufügen

1. Vorlage kopieren: `.claude/skills/_TEMPLATE/SKILL.md`, `.claude/hooks/templates/HOOK_TEMPLATE.md`
   bzw. `.claude/agents/_TEMPLATE.md`.
2. Ausfüllen (inkl. Version 0.1.0, Test-Cases/Beispiele).
3. Bei Hooks zusätzlich in `.claude/settings.json` registrieren.
4. Changelog-Eintrag in `docs/CHANGELOG_SKILLS.md` bzw. `docs/CHANGELOG_HOOKS.md`.

Details und Best Practices: `CLAUDE.md` Abschnitt 10.

## Reife Kombinationen als Plugin teilen

Siehe `plugins/_TEMPLATE/README.md` — sobald eine Skill/Hook/Agent-Kombination sich in ≥2
unabhängigen Projekten bewährt hat, nach `plugins/<name>/` extrahieren.

## Beobachtung & tägliche/wöchentliche Reviews automatisieren

`/daily-review` kann manuell aufgerufen werden, eignet sich aber auch für die eingebauten
`schedule`- oder `loop`-Skills, um es täglich/wöchentlich automatisch laufen zu lassen, ohne
manuell daran denken zu müssen.

## Ordnerstruktur

Siehe `docs/ARCHITECTURE.md` für den vollständigen Datenfluss; Kurzüberblick über die 7 Schichten
(00 Core/Bootstrap bis 06 Observability & Learning) in `CLAUDE.md` Abschnitt 1.
