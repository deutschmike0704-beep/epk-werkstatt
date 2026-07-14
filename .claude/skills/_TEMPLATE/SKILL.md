---
name: _template
description: KURZ & PRÄZISE beschreiben WANN dieser Skill greifen soll (Trigger-Wörter, Situationen) und WAS er liefert. Dies ist das einzige Feld, das Claude vor dem Laden sieht — es entscheidet, ob der Skill aktiviert wird. Beispiel eines guten Description-Stils: "Use this skill whenever the user asks to X or Y. Produces Z using method W. Triggers on: 'keyword1', 'keyword2'."
---

<!--
  METADATEN — Diese Skill-eigenen Felder sind NICHT Teil des offiziellen Claude-Code-Frontmatters
  (das kennt nur `name` und `description`). Sie werden hier als strukturierter Kommentar/Abschnitt
  geführt, damit Version, Dependencies und Test-Cases für Menschen und den `reflector`-Subagent
  sichtbar und versionierbar sind, ohne das Lade-Verhalten des Skills zu beeinflussen.
-->

## Metadaten

- **Version:** 0.1.0 (SemVer — bump bei jeder inhaltlichen Änderung, siehe `docs/CHANGELOG_SKILLS.md`)
- **Owner:** <Name/Team>
- **Status:** draft | stable | deprecated
- **Dependencies:**
  - Skills: keine | `<skill-name>` (>=x.y.z)
  - Tools: `Read`, `Bash`, ... (welche Tools braucht dieser Skill zwingend?)
  - Externe Systeme: keine | z. B. "benötigt `jq` im PATH"
- **Performance-Hinweis:** grobe Einschätzung, z. B. "liest max. 3 Dateien, <5s", "kann bei großen
  Repos >30s dauern wegen Volltextsuche — bei Bedarf `Explore`-Agent statt direktem Grep nutzen"
- **Letzte Review:** YYYY-MM-DD durch <wer/reflector>

## Zweck

Ein bis zwei Sätze: welches Problem löst dieser Skill, für wen, in welchem Kontext.

## Vorgehen

Schritt-für-Schritt-Anleitung, die Claude befolgen soll. Konkret, nicht generisch. Bei Verzweigungen
klare Bedingungen ("Wenn X der Fall ist, tue A, sonst B").

1. ...
2. ...
3. ...

## Beispiele

### Beispiel 1: <typischer Fall>
**Eingabe/Situation:** ...
**Erwartetes Verhalten:** ...

### Beispiel 2: <Randfall>
**Eingabe/Situation:** ...
**Erwartetes Verhalten:** ...

## Test-Cases

Konkrete, überprüfbare Fälle, mit denen sich nach einer Änderung schnell prüfen lässt, ob der Skill
noch funktioniert wie gedacht (manuell oder durch den `reviewer`-Subagent gegenzuchecken):

| # | Eingabe | Erwartetes Ergebnis | Zuletzt geprüft |
|---|---|---|---|
| 1 | ... | ... | YYYY-MM-DD |
| 2 | ... | ... | YYYY-MM-DD |

## Grenzen / Was dieser Skill NICHT tut

Explizit machen, wofür der Skill *nicht* zuständig ist, um Scope-Creep und Fehlaktivierung zu vermeiden.

## Referenzen (optional: `references/`-Unterordner)

Falls dieser Skill größere Nachschlagewerke braucht (z. B. eine API-Referenz, eine Palette-Definition),
lagere sie in einen `references/`-Unterordner neben dieser Datei aus und verlinke sie hier, statt alles
in SKILL.md selbst aufzublähen (Context-Window-Schonung, siehe CLAUDE.md Abschnitt 5).
