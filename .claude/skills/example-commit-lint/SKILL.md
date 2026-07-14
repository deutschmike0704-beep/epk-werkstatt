---
name: example-commit-lint
description: Use this skill whenever the user asks to write, review, or clean up a git commit message in this project. Enforces the project's Conventional-Commits-based style and catches vague messages ("fix stuff", "wip"). Triggers on "commit message", "commit", "write a commit".
---

## Metadaten

- **Version:** 1.0.0
- **Owner:** platform-team
- **Status:** stable
- **Dependencies:** Tools: `Bash` (für `git log` als Stilreferenz); keine anderen Skills
- **Performance-Hinweis:** liest nur `git log -5` und den aktuellen Diff, <2s
- **Letzte Review:** 2026-07-13 durch reflector

## Zweck

Sorgt dafür, dass Commit-Messages in diesem Projekt konsistent, aussagekräftig und im
Conventional-Commits-Stil verfasst werden, statt generischer Messages wie "fix" oder "update".

## Vorgehen

1. `git log -5 --oneline` lesen, um den bestehenden Stil des Repos zu übernehmen.
2. `git diff --staged` (bzw. `--cached`) lesen, um den *Grund* der Änderung zu verstehen, nicht nur das Was.
3. Message im Format `<type>(<scope>): <kurze Zusammenfassung im Imperativ>` formulieren.
   Erlaubte Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.
4. Body (optional, bei nicht-trivialen Changes): 1–2 Sätze zum *Warum*, nicht zum *Was* (das zeigt der Diff).
5. Niemals Messages wie "fix stuff", "wip", "updates" akzeptieren — immer konkretisieren.

## Beispiele

### Beispiel 1: kleiner Bugfix
**Eingabe/Situation:** Diff behebt einen Off-by-one-Fehler in der Pagination.
**Erwartetes Verhalten:** `fix(pagination): correct off-by-one in page count calculation`

### Beispiel 2: neues Feature mit Kontext
**Eingabe/Situation:** Neuer Retry-Mechanismus für flaky externe API-Calls.
**Erwartetes Verhalten:**
```
feat(api-client): add exponential backoff retry for external calls

Prevents transient 503s from the payments provider from surfacing
as user-facing errors.
```

## Test-Cases

| # | Eingabe | Erwartetes Ergebnis | Zuletzt geprüft |
|---|---|---|---|
| 1 | Diff ändert nur einen Tippfehler in einem Kommentar | `docs(...)` oder `chore(...)`, keine feat/fix-Übertreibung | 2026-07-13 |
| 2 | Nutzer schlägt "wip" als Message vor | Skill lehnt ab und schlägt konkretere Alternative vor | 2026-07-13 |

## Grenzen / Was dieser Skill NICHT tut

Erstellt keine Commits selbst (das bleibt eine explizite Nutzeraktion/Bestätigung, siehe
CLAUDE.md Abschnitt 3, External-Gate) — liefert nur den Text.
