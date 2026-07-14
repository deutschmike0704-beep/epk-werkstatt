# Changelog — Skills

Format: `## [skill-name] X.Y.Z — YYYY-MM-DD` gefolgt von Bullet-Liste der Änderungen und dem Grund.
Siehe `CLAUDE.md` Abschnitt 4 (Versionierung von Skills & Hooks).

## [example-commit-lint] 1.0.0 — 2026-07-13

- Initiale Version.
- Grund: Referenz-Skill, um das SKILL.md-Format mit echten Metadaten/Test-Cases zu demonstrieren.

## [epk-notation] 0.1.0 — 2026-07-14

- Initiale Version: EPK-Normsymbole (Form/Farbe/Anschlusspunkte) und die 7 wichtigsten Syntaxregeln
  (Start/Ende, Alternierung, Ereignisse ohne Entscheidungsgewalt, Konnektor-Regeln) als verbindliche
  Referenz für App-Code und Tutorial-Texte dokumentiert.
- Grund: Fachliche Grundlage für den EPK-Editor (Layer 02 Skill), auf Basis von Web-Recherche
  abgesichert statt aus dem Gedächtnis geraten (siehe Quellenliste im Skill).

## [epk-notation] 0.2.0 — 2026-07-14

- Neue Regel 5 ergänzt: Verzweigung/Zusammenführung ausschließlich über explizite Konnektoren, nie
  implizit über mehrere direkte Pfeile an einem Ereignis/einer Funktion/einem Prozesswegweiser.
- Abschnitt "Anwendung in der App" korrigiert: stimmte nicht mit der tatsächlichen Implementierung
  überein (behauptete weiche Hinweise für Regel 5/6, die es nicht gab). Jetzt akkurat: Regel 1–5 als
  harte Validierung, Regel 7 als Warnung, Regel 6 (Konnektor-Typ-Konsistenz) bewusst nicht umgesetzt.
- Hinweis auf neues `genus`-Feld in `symbols.js` für grammatikalisch korrekte Hinweistexte ergänzt.
- Grund: Fresh-eyes Code-Review (reviewer-Rolle) deckte eine fachliche Lücke in der Validierung sowie
  eine veraltete/unzutreffende Beschreibung im Skill auf; beides korrigiert.
