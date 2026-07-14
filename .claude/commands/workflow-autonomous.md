---
description: Führt den vollständigen Standard-Workflow (Understand & Plan → Load Skills & Context → Run Hooks & Validate → Delegate to Subagents → Ship, Learn & Improve) für die genannte Aufgabe aus.
argument-hint: <Aufgabenbeschreibung oder Task-ID aus tasks/queue.json>
---

Führe für folgende Aufgabe den vollständigen Standard-Workflow aus `CLAUDE.md` Abschnitt 2 aus:

**Aufgabe:** $ARGUMENTS

Gehe dabei exakt so vor:

## 1. Understand & Plan
- Falls `$ARGUMENTS` eine Task-ID ist, lies den Eintrag aus `tasks/queue.json`.
- Delegiere an den `planner`-Subagenten, um die Aufgabe in verifizierbare Schritte zu zerlegen.
- Falls der Planner offene Fragen zurückgibt: stelle sie dem Nutzer via Rückfrage (Scope-Gate,
  CLAUDE.md Abschnitt 3), bevor du fortfährst. Rate nicht.
- Trage/aktualisiere den Eintrag in `tasks/queue.json` (Status `in_progress`).

## 2. Load Skills & Context
- Prüfe `.claude/skills/*/SKILL.md` auf passende Trigger-Beschreibungen für diese Aufgabe.
- Lies nur die Dateien, die für die identifizierten Schritte tatsächlich relevant sind.
- Bei sehr umfangreichem Kontext: fasse via `scripts/context_summarizer.py` zusammen, statt alles
  roh zu laden (siehe CLAUDE.md Abschnitt 5).

## 3. Run Hooks & Validate
- Hooks aus `.claude/settings.json` laufen automatisch bei jedem Tool-Call — nichts zu tun,
  aber: wenn ein Hook blockiert (`exit 2`), behandle das als verbindliches Signal, nicht als
  Hindernis, das umgangen werden soll.

## 4. Delegate to Subagents
- Für jeden Plan-Schritt: entscheide, ob `implementer` (Code-Änderung), Recherche via `Explore`,
  oder Parallelisierung sinnvoll ist.
- Nach Abschluss der Implementierung: delegiere an `reviewer` für ein Korrektheits-/Security-Review,
  BEVOR du das Ergebnis als fertig meldest.

## 5. Ship, Learn & Improve
- Verifiziere das Ergebnis tatsächlich (Tests/Typecheck/manuelles Ausführen, nicht nur "sieht
  richtig aus").
- Aktualisiere `tasks/queue.json` (Status `done`) mit Kurz-Notiz.
- Falls die Änderung Skills/Hooks/Agents betraf: Changelog-Eintrag in `docs/CHANGELOG_SKILLS.md`
  bzw. `docs/CHANGELOG_HOOKS.md` ergänzen.
- Falls Fehler auftraten: siehe `/debug-loop`.

Melde am Ende knapp: was wurde geändert, was wurde verifiziert, was ist offen.
