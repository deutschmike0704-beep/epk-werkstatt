# Task-Eintrag-Vorlage (für `tasks/queue.json`)

Jeder Eintrag in `tasks/queue.json` folgt diesem Schema:

```json
{
  "id": "T-0002",
  "title": "Kurzer, aktionsorientierter Titel",
  "description": "1-3 Sätze: was ist zu tun, warum, welcher Kontext ist relevant.",
  "priority": "P0 | P1 | P2 | P3",
  "status": "pending | in_progress | blocked | done",
  "created_at": "ISO-8601 UTC Zeitstempel",
  "completed_at": "ISO-8601 UTC Zeitstempel (nur wenn status=done)"
}
```

## Priorisierung (siehe CLAUDE.md Abschnitt 7)

- **P0 — Blocker**: Produktion kaputt, Sicherheitsvorfall. Unterbricht laufende Arbeit.
- **P1 — Hoch**: vom Nutzer explizit für "jetzt" angefordert.
- **P2 — Normal**: Standard-Feature-/Bugfix-Arbeit. (Default, falls nicht angegeben.)
- **P3 — Hintergrund**: Doku, Refactoring-Ideen, vom `reflector`-Subagent vorgeschlagen.

## Konventionen

- IDs sind fortlaufend (`T-0001`, `T-0002`, ...), nie wiederverwendet.
- `status: blocked` wird vom Orchestrator gesetzt, wenn ein Lauf mit Fehler endete — nicht manuell
  auf `done` setzen, ohne den zugrunde liegenden Fehler zu beheben (siehe Debugging-Protokoll).
- Vom `reflector`-Subagenten vorgeschlagene Tasks bekommen standardmäßig `P3`, außer die
  Beobachtung deutet auf akutes Risiko hin.
