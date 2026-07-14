# AI Workstation — Projekt-DNA & Betriebssystem-Beschreibung

Dieses Dokument ist die **Verfassung** dieses Projekts. Claude liest es bei jeder Session automatisch.
Es beschreibt, wie das Projekt als autonomes AI-Operating-System funktioniert: welche Schichten es gibt,
welcher Workflow bei jeder Aufgabe abläuft, und welche Standards gelten.

> Kurzfassung für eilige Leser: Jede Aufgabe durchläuft **Understand & Plan → Load Skills & Context →
> Run Hooks & Validate → Delegate to Subagents → Ship, Learn & Improve**. Das ist keine Empfehlung,
> sondern der Standard-Loop dieses Projekts (siehe `.claude/commands/workflow-autonomous.md`).

---

## 0. Projekt-Steckbrief: EPK-Werkstatt

**Was:** Eine intuitive Web-App zum Erstellen ereignisgesteuerter Prozessketten (EPK). Zielgruppe sind
**Auszubildende**, die EPK-Notation lernen — nicht Prozessmodellierungs-Profis. Das Tool priorisiert
Verständlichkeit und Lerneffekt vor Funktionsumfang.

**Kernfeatures:**
- Symbolpalette mit den EPK-Normsymbolen (Ereignis, Funktion, Konnektoren UND/ODER/XOR, Prozesswegweiser,
  Organisationseinheit, Informationsobjekt), Drag & Drop auf eine Zeichenfläche.
- Verbindungen zwischen Symbolen per Ziehen aus Anschlusspunkten.
- Echtzeit-Hinweise bei Verstößen gegen die EPK-Syntaxregeln (z. B. Ereignis/Funktion-Alternierung),
  didaktisch formuliert statt nur "Fehler".
- Interaktive Tutorial-Overlays (Spotlight-Tour) und ein geschriebener Leitfaden für Einsteiger.
- Lokales Speichern/Laden (localStorage) sowie JSON-/SVG-Export.

**Tech-Stack-Entscheidung:** Vanilla HTML/CSS/JavaScript, **kein Build-Step, keine Frameworks/Dependencies**.
Begründung: kleine, in sich geschlossene App; Zielgruppe (Azubis) soll den Quellcode ohne npm-Toolchain
lesen/verstehen können; Deployment direkt über GitHub Pages ohne CI-Build. Diese Entscheidung gilt, bis ein
konkreter Bedarf (z. B. komplexe State-Verwaltung) das Gegenteil begründet — siehe Abschnitt 8
(keine Abstraktion für hypothetische Zukunft).

**Ordnerstruktur der App:**
```
app/
  index.html          Einstiegspunkt, lädt Palette/Canvas/Tutorial-UI
  css/style.css        Styles (hell/dunkel-freundlich, responsive)
  js/symbols.js         Normsymbol-Definitionen (Form, Farbe, Anschlusspunkte)
  js/model.js           Graph-Datenmodell + EPK-Syntaxvalidierung
  js/canvas.js           Rendering, Drag & Drop, Verbindungen zeichnen
  js/tutorial.js         Interaktive Spotlight-Tour für Einsteiger
  js/storage.js          localStorage Speichern/Laden
  js/export.js           JSON-/SVG-Export
docs/
  leitfaden-azubis.md   Geschriebener Einsteiger-Leitfaden mit Übungsbeispielen
```

Domänenwissen zu EPK-Normsymbolen und -Syntaxregeln liegt im Skill `.claude/skills/epk-notation/SKILL.md`
(Layer 02) — dort nachschlagen statt aus dem Gedächtnis zu raten, bevor Symbole/Regeln geändert werden.

---

## 1. Architektur — die 7 Schichten (Layer 00–06)

```
06  Observability & Learning   →  logs/, scripts/metrics_tracker.py, docs/auto-generated/, Reflection-Agent
05  Plugins                    →  plugins/  (Distribution & Sharing über Teams/Repos hinweg)
04  Subagents                  →  .claude/agents/  (Delegation Layer mit klaren Rollen)
03  Hooks                      →  .claude/hooks/ + .claude/settings.json  (Guardrails & Qualität)
02  Skills                     →  .claude/skills/  (Wissens-/Fähigkeiten-Layer, on-demand geladen)
01  CLAUDE.md                  →  dieses Dokument  (Memory + Project DNA, immer geladen)
00  Core / Bootstrap           →  init.sh, orchestrator/  (Fundament, das alles andere erzeugt/startet)
```

Warum diese Reihenfolge? Jede Schicht baut auf der darunterliegenden auf:
- **00 Core** existiert bevor irgendein Projekt existiert — es *erzeugt* die Struktur.
- **01 CLAUDE.md** ist die einzige Schicht, die *immer* im Kontext ist (kein Laden nötig).
- **02 Skills** werden nur bei Bedarf nachgeladen (Context-Window-Schonung).
- **03 Hooks** laufen deterministisch und außerhalb des LLM-Kontexts (Code, kein Prompt).
- **04 Subagents** delegieren Teilaufgaben in isolierte Kontexte (Parallelisierung, Fokus).
- **05 Plugins** verpacken 01–04 wiederverwendbar für andere Projekte/Teams.
- **06 Observability** schließt den Kreis: beobachtet 00–05 und verbessert sie iterativ.

### Schicht-Details

| Layer | Ordner | Zweck | Wird geladen... |
|---|---|---|---|
| 00 Core/Bootstrap | `init.sh`, `orchestrator/` | Projekt aufsetzen, Workflow starten | einmalig / bei `claude-code init` |
| 01 CLAUDE.md | `CLAUDE.md` | Projekt-Gedächtnis, Standards, Workflow-Vertrag | immer (Session-Start) |
| 02 Skills | `.claude/skills/*/SKILL.md` | Fachwissen, Anleitungen, Checklisten | on-demand per Trigger/Beschreibung |
| 03 Hooks | `.claude/hooks/*.sh`, `.claude/settings.json` | Pre/Post-Validierung, Security, Style | deterministisch bei jedem Tool-Call |
| 04 Subagents | `.claude/agents/*.md` | Rollenbasierte Delegation | via `Task`/`Agent`-Tool |
| 05 Plugins | `plugins/*/` | Bündelung von Skills+Hooks+Agents für Weitergabe | bei Installation in Fremdprojekten |
| 06 Observability | `logs/`, `scripts/`, `docs/auto-generated/` | Metriken, Kosten, Reflexion, Doku-Generierung | kontinuierlich / Cron / Stop-Hook |

---

## 2. Der Standard-Workflow (bei jeder nicht-trivialen Aufgabe)

```
┌─────────────────┐   ┌──────────────────────┐   ┌────────────────────┐
│ 1. Understand    │──▶│ 2. Load Skills &     │──▶│ 3. Run Hooks &     │
│    & Plan        │   │    Context           │   │    Validate        │
└─────────────────┘   └──────────────────────┘   └────────────────────┘
                                                            │
        ┌───────────────────────────────────────────────────┘
        ▼
┌─────────────────┐   ┌──────────────────────┐   ┌────────────────────┐
│ 4. Delegate to   │──▶│ 5. Ship, Learn &     │──▶│ 6. Debug-Loop bei  │
│    Subagents     │   │    Improve           │   │    Fehlern         │
└─────────────────┘   └──────────────────────┘   └────────────────────┘
```

1. **Understand & Plan** — Anforderung paraphrasieren, Annahmen klären (via `AskUserQuestion` bei echter
   Ambiguität), Aufgabe in `tasks/queue.json` eintragen und priorisieren (P0–P3, siehe unten).
2. **Load Skills & Context** — passende Skills aus `.claude/skills/` anhand von Trigger-Beschreibung
   aktivieren, relevante Dateien/History lesen. Bei sehr langem Kontext: `scripts/context_summarizer.py`
   bzw. natives Context-Compaction nutzen (siehe Abschnitt 5).
3. **Run Hooks & Validate** — Hooks laufen automatisch (`SessionStart`, `PreToolUse`, `PostToolUse`,
   `Stop`, siehe `.claude/settings.json`). Sie sind **Code, nicht Vorschlag** — ein blockierender Hook
   darf nicht umgangen werden (kein `--no-verify`-Reflex).
4. **Delegate to Subagents** — komplexe/parallelisierbare Teilaufgaben an spezialisierte Subagents aus
   `.claude/agents/` übergeben (`planner`, `implementer`, `reviewer`, `debugger`, `reflector`). Klare
   Rollen statt ein Generalist für alles.
5. **Ship, Learn & Improve** — Ergebnis validieren (Tests/Typecheck/manuelles Verifizieren gemäß
   `verify`-Skill), Diff zusammenfassen, Metriken/Kosten loggen (`scripts/metrics_tracker.py`), bei
   Bedarf Doku in `docs/auto-generated/` aktualisieren.
6. **Debug-Loop** — bei Fehlern: siehe Debugging-Protokoll (Abschnitt 6). Kein stilles Retry ohne
   Root-Cause-Analyse.

Dieser Loop ist als Slash-Command implementiert: `.claude/commands/workflow-autonomous.md`
(aufrufbar als `/workflow-autonomous`). Für echte Autonomie über mehrere Iterationen die eingebaute
`loop`-Skill nutzen (`/loop`), nicht neu erfinden.

---

## 3. Human-in-the-Loop Gates (verbindlich)

An folgenden Punkten **muss** pausiert und die Zustimmung des Menschen eingeholt werden — unabhängig
davon, wie "autonom" der Workflow gerade läuft:

| Gate | Auslöser | Warum |
|---|---|---|
| **Scope-Gate** | Anforderung ist mehrdeutig oder hat >1 sinnvolle Interpretation | Falsche Annahme = verschwendete Arbeit |
| **Destructive-Gate** | `rm -rf`, `git push --force`, `git reset --hard`, Löschen von Branches/Dateien, DB-Migrationen | Nicht reversibel |
| **Cost-Gate** | Geschätzte Kosten/Laufzeit eines Subagent-Batches über Schwellwert (`orchestrator/config.yaml: cost_gate_usd`) | Budget-Kontrolle |
| **External-Gate** | Push zu Remote, PR/Issue erstellen, Nachricht an Dritte senden, Veröffentlichung | Sichtbar für andere |
| **Security-Gate** | Neue Dependency, Secrets-Handling, Auth-/Permission-Änderungen | Angriffsfläche |
| **Release-Gate** | Versionierung von Skills/Hooks mit Breaking Change (siehe Abschnitt 4) | Downstream-Projekte betroffen |

Diese Gates werden technisch über `.claude/hooks/pre-tool-use/validate-input.sh` (blockiert riskante
Tool-Calls) und organisatorisch über explizite Rückfragen durchgesetzt.

---

## 4. Versionierung von Skills & Hooks

- Jede `SKILL.md` und jeder Hook trägt ein `version:`-Feld (SemVer) im Metadaten-Block.
- Änderungen werden in `docs/CHANGELOG_SKILLS.md` bzw. `docs/CHANGELOG_HOOKS.md` protokolliert
  (Format: `## [skill-name] 1.1.0 — 2026-07-13` + Bullet-Liste der Änderungen + Grund).
- Breaking Changes (Trigger-Bedeutung ändert sich, Hook blockiert jetzt was vorher erlaubt war) lösen
  das **Release-Gate** aus (Abschnitt 3) und erfordern ein Minor/Major-Bump.
- Der `reflector`-Subagent prüft bei der wöchentlichen Review-Routine, ob Skills/Hooks seit dem letzten
  Review verändert wurden, und mahnt fehlende Changelog-Einträge an.

---

## 5. Context-Window-Management

- **Grundsatz:** Nur laden, was für die aktuelle Aufgabe gebraucht wird (Skills sind on-demand, nicht
  eager). CLAUDE.md bleibt kurz und stabil — Details wandern in Skills.
- Native Context-Kompression des Harnesses greift automatisch bei langen Sessions (siehe System-Hinweis
  "context management"). Zusätzlich steht `scripts/context_summarizer.py` bereit, um projektspezifische
  lange Artefakte (z. B. große Logs, Diskussionsverläufe) *vor* dem Laden in den Kontext auf das
  Wesentliche einzudampfen.
- Faustregel: Wenn ein Subagent nur eine Recherche-Frage beantworten muss, gib ihm die Frage — nicht den
  gesamten bisherigen Gesprächsverlauf. Das hält Kontext-Fenster und Kosten klein (siehe `04 Subagents`).

---

## 6. Debugging-Protokoll (Auto-Debug-Loop)

Bei jedem Fehler (fehlgeschlagener Test, Exception, Hook-Block, falsches Ergebnis) gilt dieser Ablauf —
implementiert im `debugger`-Subagent (`.claude/agents/debugger.md`) und als Slash-Command
`.claude/commands/debug-loop.md`:

1. **Reproduzieren** — Fehler exakt nachstellen, nicht aus der Erinnerung raten.
2. **Root-Cause-Analyse** — die tiefste Ursache finden, nicht das erste Symptom flicken (kein
   Try/Except um das Problem herum bauen).
3. **Klassifizieren** — ist die Ursache: (a) Code-Bug, (b) fehlendes/falsches Skill-Wissen,
   (c) zu laxer/zu strenger Hook, (d) falsche Annahme im Plan?
4. **Anpassen** —
   - (a) → Code fixen + Regressionstest ergänzen.
   - (b) → betroffene `SKILL.md` korrigieren, Version bumpen, Changelog-Eintrag.
   - (c) → betroffenen Hook korrigieren, Version bumpen, Changelog-Eintrag.
   - (d) → zurück zu Schritt 1 des Standard-Workflows (Understand & Plan), ggf. Human-Gate.
5. **Retry** — Aufgabe erneut ausführen.
6. **Log & Lernen** — Eintrag in `logs/debug/` (Zeitstempel, Symptom, Root Cause, Fix, betroffene
   Datei) + Kurz-Reflexion in der nächsten `reflector`-Runde. Maximal 3 automatische Retry-Zyklen,
   danach **Human-in-the-Loop Gate** (Debug-Gate).

Explizit verboten: Fehler durch Weglassen von Validierung, `--no-verify`, stummes Verschlucken von
Exceptions oder wiederholtes identisches Retry "auf gut Glück" zum Verschwinden bringen.

---

## 7. Task Queue & Priorisierung

Aufgaben leben in `tasks/queue.json` (Struktur siehe Datei). Priorität:

- **P0 — Blocker**: Produktion kaputt, Sicherheitsvorfall. Sofort, unterbricht laufende Arbeit.
- **P1 — Hoch**: vom Nutzer explizit für "jetzt" angefordert.
- **P2 — Normal**: Standard-Feature-/Bugfix-Arbeit.
- **P3 — Hintergrund**: Doku, Refactoring-Ideen, vom `reflector` vorgeschlagene Verbesserungen.

Der Orchestrator (`orchestrator/run_workflow.py`) sortiert die Queue vor jedem Lauf nach Priorität und
Alter (älteste P-gleiche Aufgabe zuerst, FIFO innerhalb einer Priorität).

---

## 8. Coding Standards (gelten projektübergreifend, sofern nicht durch Sub-CLAUDE.md überschrieben)

- Keine Kommentare, die erklären *was* der Code tut — nur *warum*, wenn nicht offensichtlich.
- Keine Abstraktion für hypothetische Zukunft; drei ähnliche Zeilen > verfrühte Abstraktion.
- Fehlerbehandlung nur an echten Systemgrenzen (User-Input, externe APIs), nicht "just in case".
  Existierende Codebasen und Framework-Garantien werden vertraut.
- Sicherheit: keine Command-Injection, XSS, SQL-Injection etc. (OWASP Top 10 im Blick behalten).
- Bestehende Dateien bearbeiten statt neue anzulegen, wo sinnvoll.
- Jede nicht-triviale Änderung wird vor "fertig" gemeldet tatsächlich verifiziert (siehe `verify`-Skill),
  nicht nur kompiliert/typegecheckt.

---

## 9. Beobachtung & Selbstverbesserung (Layer 06)

- **Logging**: jede Subagent-Delegation, jeder Hook-Block, jeder Debug-Zyklus wird strukturiert in
  `logs/` geschrieben (JSONL, siehe `scripts/metrics_tracker.py`).
- **Metrics & Cost Tracking**: Tokens, geschätzte Kosten, Laufzeit pro Task in
  `logs/metrics/cost_tracking.jsonl`. Der Orchestrator warnt beim Cost-Gate (Abschnitt 3).
- **Automated Documentation**: nach jedem Merge/Shipping-Schritt aktualisiert der `reflector`-Subagent
  bei Bedarf `docs/auto-generated/` (Architekturänderungen, neue Skills/Agents/Hooks).
- **Daily/Weekly Review**: `.claude/commands/daily-review.md` triggert den `reflector`-Subagent, der
  Logs der letzten 24h/7 Tage auswertet, Muster erkennt (wiederkehrende Fehler, teure Tasks, veraltete
  Skills) und priorisierte P3-Verbesserungsvorschläge in `tasks/queue.json` einträgt. Auslösbar manuell
  oder über die `schedule`/`loop`-Skills als wiederkehrender Cloud-Agent.

---

## 10. Wie neue Skills/Hooks/Agents hinzugefügt werden

1. Template kopieren (`.claude/skills/_TEMPLATE/SKILL.md`, `.claude/hooks/templates/HOOK_TEMPLATE.md`,
   `.claude/agents/_TEMPLATE.md`).
2. Metadaten ausfüllen (Version 0.1.0 für Neues), Test-Cases/Beispiele ergänzen.
3. Bei Hooks: in `.claude/settings.json` unter passendem Event registrieren.
4. Changelog-Eintrag anlegen.
5. Kurzer Testlauf über `/workflow-autonomous` oder gezielt über den betroffenen Subagent.

---

## 11. Plugins (Layer 05) — Distribution

Reife, projektübergreifend nützliche Kombinationen aus Skills+Hooks+Agents werden nach `plugins/<name>/`
extrahiert (Struktur siehe `plugins/_TEMPLATE/`) und können in andere Projekte kopiert oder als
Claude-Code-Plugin verteilt werden. Ein Plugin ist "reif" für die Extraktion, wenn es in mind. 2
unabhängigen Kontexten unverändert nützlich war.
