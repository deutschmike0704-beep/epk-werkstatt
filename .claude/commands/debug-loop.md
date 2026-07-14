---
description: Startet das Debugging-Protokoll aus CLAUDE.md Abschnitt 6 für einen konkreten Fehler (reproduzieren → root cause → klassifizieren → fixen → retry → loggen), mit Retry-Limit und Human-Gate.
argument-hint: <Fehlerbeschreibung, Testname oder Stacktrace>
---

Ein Fehler ist aufgetreten: $ARGUMENTS

Delegiere an den `debugger`-Subagenten und folge dem Protokoll aus `CLAUDE.md` Abschnitt 6:

1. Reproduzieren lassen.
2. Root-Cause-Analyse (nicht das erste Symptom flicken).
3. Klassifizieren: Code-Bug / Skill-Wissen / Hook / Plan-Annahme.
4. Passenden Fix anwenden lassen (inkl. Versionsbump + Changelog bei Skill-/Hook-Änderungen).
5. Retry zur Verifikation.
6. Log-Eintrag in `logs/debug/` sicherstellen.

**Retry-Limit:** Nach maximal 3 erfolglosen Fix-Versuchen für denselben Fehler NICHT weiter
versuchen, sondern das Debug-Gate auslösen: fasse alle Versuche zusammen und frage den Nutzer,
wie weiter vorgegangen werden soll.

Melde am Ende: Symptom, Root Cause, angewandter Fix, Verifikationsnachweis (oder: warum eskaliert
wurde).
