# Architektur — AI Workstation

> Dieser Ordner (`docs/auto-generated/`) wird zusätzlich vom `reflector`-Subagenten gepflegt und
> kann sich zwischen Reviews ändern. Dieses Dokument (`docs/ARCHITECTURE.md`) ist die
> von Menschen gepflegte Grundlage; `docs/auto-generated/` enthält abgeleitete Detail-Snapshots.

## Die 7 Schichten im Überblick

Siehe `CLAUDE.md` Abschnitt 1 für die vollständige, autoritative Beschreibung. Kurzfassung:

```
06 Observability & Learning  ── beobachtet & verbessert alle anderen Schichten
05 Plugins                   ── verpackt 01-04 für Weitergabe
04 Subagents                 ── delegiert Teilaufgaben rollenbasiert
03 Hooks                     ── erzwingt Guardrails deterministisch
02 Skills                    ── liefert Fachwissen on-demand
01 CLAUDE.md                 ── Projekt-Gedächtnis, immer geladen
00 Core/Bootstrap             ── erzeugt und startet alles andere
```

## Datenfluss einer Aufgabe

```
Nutzer-Prompt / tasks/queue.json Eintrag
        │
        ▼
/workflow-autonomous (.claude/commands/workflow-autonomous.md)
        │
        ├─▶ planner-Subagent .............. Plan + offene Fragen
        │        │
        │        ▼ (Scope-Gate falls nötig) ──▶ Mensch
        │
        ├─▶ Skills (.claude/skills/*) ..... Fachwissen on-demand
        │
        ├─▶ Hooks (.claude/settings.json) . laufen deterministisch bei jedem Tool-Call
        │        │
        │        ▼ (Destructive/Security-Gate falls Block) ──▶ Mensch
        │
        ├─▶ implementer-Subagent .......... Umsetzung pro Plan-Schritt
        │        │
        │        ▼ (bei Fehler) debugger-Subagent (.claude/commands/debug-loop.md, max 3 Retries)
        │                 │
        │                 ▼ (nach 3 Fehlversuchen) ──▶ Mensch (Debug-Gate)
        │
        ├─▶ reviewer-Subagent ............. Korrektheits-/Security-Review vor "fertig"
        │
        └─▶ Ship, Learn & Improve
                 ├─ Verifikation (Tests/Typecheck/manuell)
                 ├─ logs/metrics/, logs/debug/, logs/sessions/ (Layer 06)
                 └─ reflector-Subagent (täglich/wöchentlich, .claude/commands/daily-review.md)
                          └─▶ neue P3-Tasks, docs/auto-generated/ Updates
```

## Erweiterungspunkte

- Neuer Skill → `.claude/skills/_TEMPLATE/SKILL.md` kopieren.
- Neuer Hook → `.claude/hooks/templates/HOOK_TEMPLATE.md` + Registrierung in `.claude/settings.json`.
- Neuer Subagent → `.claude/agents/_TEMPLATE.md` kopieren.
- Reife Skill/Hook/Agent-Kombination → nach `plugins/<name>/` extrahieren (Layer 05).
