# Hook-Template & Konventionen

Ein Hook ist ein deterministisches Shell-/Python-Skript, das der Claude-Code-Harness bei einem
bestimmten Event ausführt — **kein** Prompt an das LLM, sondern echter Code. Genau deshalb eignen sich
Hooks für Guardrails, die *nicht* umgangen werden dürfen (im Gegensatz zu Skills, die nur Ratschläge
für das LLM sind).

## Verfügbare Events (in `.claude/settings.json` registriert)

| Event | Wann | Typischer Einsatz in diesem Projekt |
|---|---|---|
| `SessionStart` | neue Session / Resume | Kontext laden, Task-Queue-Status anzeigen |
| `UserPromptSubmit` | bevor der Prompt verarbeitet wird | Prompt anreichern/loggen |
| `PreToolUse` | bevor ein Tool ausgeführt wird | Destructive-/Security-Gate, Input validieren |
| `PostToolUse` | nachdem ein Tool gelaufen ist | Qualitätscheck (Lint/Typecheck), Logging |
| `Stop` | Ende einer Agent-Antwort | Selbst-Reflexion, Metriken schreiben |
| `SubagentStop` | ein Subagent ist fertig | Ergebnis eines Subagents loggen/validieren |
| `PreCompact` | vor Context-Kompression | wichtige Fakten vor dem Summarizing sichern |

## Vertrag (Ein-/Ausgabe)

- **Input:** JSON über stdin (Event-spezifisches Payload, z. B. bei `PreToolUse`: `tool_name`, `tool_input`).
- **Output:** entweder nichts (= erlauben, Standardverhalten fortsetzen) oder JSON auf stdout mit einer
  `decision`, um zu blockieren/zu kommentieren. Exit-Code `0` = ok, ungleich `0` je nach Event = Fehler/Block.
- Hooks müssen **schnell** sein (<2s Faustregel) — sie blockieren den Agent-Loop.
- Hooks müssen **idempotent** sein — mehrfaches Ausführen mit gleichem Input darf nichts kaputt machen.

## Vorlage (Shell)

```bash
#!/usr/bin/env bash
# Hook: <name>
# Version: 0.1.0
# Event: <PreToolUse|PostToolUse|SessionStart|Stop|...>
# Zweck: <ein Satz>
set -euo pipefail

INPUT="$(cat)"                                  # JSON-Payload vom Harness
# TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# --- Validierungslogik hier ---
# Beispiel: Block-Entscheidung zurückgeben
# echo '{"decision":"block","reason":"..."}'
# exit 1

exit 0
```

## Metadaten-Pflichtfelder (als Kommentarblock im Skript-Header)

- **Version** (SemVer)
- **Event**
- **Zweck** (1 Satz)
- **Breaking-Change-Historie** → Verweis auf `docs/CHANGELOG_HOOKS.md`

## Registrierung in `.claude/settings.json`

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash", "hooks": [{ "type": "command", "command": ".claude/hooks/pre-tool-use/validate-input.sh" }] }
    ]
  }
}
```

## Checkliste vor dem Commit eines neuen/geänderten Hooks

- [ ] Läuft in <2s im Normalfall
- [ ] Kein stiller Fehlschlag (Fehler werden geloggt, nicht verschluckt)
- [ ] Version gebumpt + Changelog-Eintrag in `docs/CHANGELOG_HOOKS.md`
- [ ] In `.claude/settings.json` mit korrektem Event/Matcher registriert
- [ ] Mit mind. 1 positivem und 1 negativem Testfall manuell geprüft
