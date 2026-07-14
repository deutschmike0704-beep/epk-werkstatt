---
description: Triggert die Daily/Weekly Review Routine (Layer 06) - der reflector-Subagent wertet Logs/Metriken aus und trägt priorisierte Verbesserungsvorschläge in tasks/queue.json ein.
argument-hint: "[daily|weekly] (Standard: daily)"
---

Führe die Review-Routine für Zeitraum "$ARGUMENTS" (Standard: `daily` = letzte 24h, `weekly` =
letzte 7 Tage) aus, wie in `CLAUDE.md` Abschnitt 9 beschrieben:

1. Delegiere an den `reflector`-Subagenten mit dem Zeitraum.
2. Der Reflector liest `logs/debug/`, `logs/metrics/cost_tracking.jsonl`, `logs/sessions/`,
   sowie `docs/CHANGELOG_SKILLS.md`/`docs/CHANGELOG_HOOKS.md`.
3. Lass ihn Muster berichten (wiederkehrende Fehlerklassen, teure Tasks, veraltete/undokumentierte
   Skill- oder Hook-Änderungen) und daraus priorisierte Tasks (Default P3) in `tasks/queue.json`
   eintragen.
4. Falls signifikante Architekturänderungen erkannt wurden: `docs/auto-generated/` aktualisieren.

Für automatisierte, wiederkehrende Ausführung (statt manuellem Aufruf) diesen Command über die
`schedule`-Skill als Cron-Routine registrieren (z. B. täglich 07:00 Uhr) oder über `/loop` als
sich selbst taktende Routine laufen lassen.

Melde am Ende knapp: Kernbeobachtungen + Liste der neu angelegten Tasks.
