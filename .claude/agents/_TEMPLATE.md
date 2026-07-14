---
name: _template
description: WANN soll dieser Subagent aufgerufen werden? Konkret und spezifisch, damit der Haupt-Agent (oder der Nutzer per Name) richtig delegiert. Schlecht: "hilft bei Code". Gut: "Use PROACTIVELY after any multi-file edit to review for correctness bugs before shipping."
tools: Read, Grep, Glob, Bash
model: sonnet
---

<!--
  Dies ist die REALE Subagent-Frontmatter (name, description, tools, model werden vom Harness
  gelesen). Die folgenden Abschnitte sind Body-Text, den der Subagent als Systemprompt bekommt —
  hier gehören Rolle, Kontext-Vertrag und Eskalationspfad rein.
-->

## Rolle

Ein bis zwei Sätze: Wer/was ist dieser Subagent, was ist sein EINE klare Verantwortlichkeit
(nicht "macht alles ein bisschen")?

## Kontext, den dieser Subagent bekommt

- Was wird ihm beim Aufruf explizit mitgegeben (Dateipfade, konkrete Frage, Diff)?
- Was soll er selbst nachschlagen (z. B. `git log`, bestimmte Skills)?
- Was bekommt er explizit NICHT (z. B. den gesamten Gesprächsverlauf — Context-Window-Schonung,
  siehe CLAUDE.md Abschnitt 5)?

## Werkzeuge & Grenzen

- Erlaubte Tools: siehe `tools:` oben — bewusst minimal halten (Principle of Least Privilege).
- Was darf dieser Subagent NICHT tun (z. B. kein `Write`/`Edit` bei einem reinen Review-Agent,
  kein `Bash` mit Schreibzugriff bei einem reinen Rechercheur)?

## Vorgehen

1. ...
2. ...
3. ...

## Output-Format

Wie soll das Ergebnis an den aufrufenden Agent zurückgegeben werden? (Strukturiert, kurz,
mit/ohne Begründung, mit klaren Handlungsempfehlungen?)

## Eskalationspfad (Escalation Path)

Wann gibt dieser Subagent die Aufgabe zurück an den Haupt-Agent bzw. löst ein
Human-in-the-Loop-Gate aus (siehe CLAUDE.md Abschnitt 3), statt selbst weiterzumachen?

- Beispiel: "Wenn nach 3 Fixversuchen der Test weiterhin fehlschlägt → zurück an Haupt-Agent
  mit Zusammenfassung aller Versuche, Debug-Gate auslösen."
- Beispiel: "Wenn die Aufgabe eine destruktive Aktion erfordert → nicht selbst ausführen,
  sondern als Empfehlung an den Haupt-Agent zurückgeben."
