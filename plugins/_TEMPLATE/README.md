# Plugin-Template (Layer 05 — Distribution & Sharing)

Ein Plugin bündelt eine reife, projektübergreifend nützliche Kombination aus Skills, Hooks,
Subagents und Commands aus diesem Template, damit sie in andere Projekte übernommen oder als
Claude-Code-Plugin verteilt werden kann.

## Wann etwas ein Plugin wird

Reifekriterium (siehe `CLAUDE.md` Abschnitt 11): mindestens 2 unabhängige Kontexte, in denen die
Kombination unverändert nützlich war. Vorher bleibt es projektspezifisch in `.claude/`.

## Struktur

```
plugins/<name>/
├── .claude-plugin/
│   └── plugin.json       ← Metadaten (siehe Vorlage in diesem Ordner)
├── skills/                ← Kopien der zugehörigen SKILL.md-Ordner
├── hooks/                 ← Kopien der zugehörigen Hook-Skripte
├── agents/                ← Kopien der zugehörigen Subagent-Definitionen
├── commands/               ← Kopien der zugehörigen Slash-Commands
└── README.md               ← Zweck, Installationshinweise, Versionshistorie
```

## Vorgehen beim Extrahieren

1. Ordner `plugins/<name>/` aus dieser Vorlage kopieren.
2. Betroffene Dateien aus `.claude/skills|hooks|agents|commands/` hineinkopieren (nicht verschieben —
   sie bleiben im Ursprungsprojekt aktiv).
3. `plugin.json` ausfüllen (Version 0.1.0 für die erste Extraktion).
4. In der Ziel-Umgebung installieren/kopieren und dort erneut gegen echte Aufgaben testen.
