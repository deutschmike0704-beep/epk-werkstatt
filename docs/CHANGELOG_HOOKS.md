# Changelog — Hooks

Format: `## [hook-name] X.Y.Z — YYYY-MM-DD` gefolgt von Bullet-Liste der Änderungen und dem Grund.
Siehe `CLAUDE.md` Abschnitt 4 (Versionierung von Skills & Hooks).

## [load-context] 1.0.0 — 2026-07-13
- Initiale Version. Grund: SessionStart-Hook für Kontext-Vorschau (offene Tasks, letzte Notiz).

## [validate-input] 1.0.0 — 2026-07-13
- Initiale Version. Grund: technische Durchsetzung des Destructive-Gate für Bash-Kommandos.

## [quality-check] 1.0.0 — 2026-07-13
- Initiale Version. Grund: leichter Post-Edit-Syntax-Check + strukturiertes Logging für Layer 06.

## [self-reflection] 1.0.0 — 2026-07-13
- Initiale Version. Grund: Session-Notizen als Grundlage für load-context.sh und den reflector.
