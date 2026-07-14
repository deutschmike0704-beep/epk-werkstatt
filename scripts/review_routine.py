#!/usr/bin/env python3
"""
Review-Routine-Helfer (Layer 06 — unterstützt den reflector-Subagenten und
.claude/commands/daily-review.md).

Liefert dem reflector-Subagenten eine vorverdichtete Rohdaten-Basis (statt dass der Subagent
jede Log-Datei selbst einzeln durchsuchen muss): Anzahl/Klassen der Debug-Vorfälle im Zeitraum,
Metrik-Zusammenfassung, und ob Skill-/Hook-Changelogs seit dem letzten Review aktualisiert wurden.

Nutzung:
    python3 scripts/review_routine.py --since 24h
    python3 scripts/review_routine.py --since 7d
"""
from __future__ import annotations

import argparse
import re
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEBUG_LOG_DIR = ROOT / "logs" / "debug"
CHANGELOG_SKILLS = ROOT / "docs" / "CHANGELOG_SKILLS.md"
CHANGELOG_HOOKS = ROOT / "docs" / "CHANGELOG_HOOKS.md"


def parse_since(value: str) -> timedelta:
    match = re.fullmatch(r"(\d+)([hd])", value)
    if not match:
        raise ValueError(f"Ungültiges --since Format: {value}")
    amount, unit = int(match.group(1)), match.group(2)
    return timedelta(hours=amount) if unit == "h" else timedelta(days=amount)


def debug_incidents_since(cutoff: datetime) -> Counter:
    """Zählt Debug-Log-Dateien (siehe CLAUDE.md Abschnitt 6) nach Root-Cause-Klasse.
    Erwartet Dateinamen im Format <ISO-Zeitstempel>_<klasse>.md, siehe debugger-Subagent."""
    classes: Counter = Counter()
    if not DEBUG_LOG_DIR.exists():
        return classes
    for f in DEBUG_LOG_DIR.glob("*.md"):
        try:
            ts = datetime.fromisoformat(f.stem.split("_")[0].replace("Z", "+00:00"))
        except (ValueError, IndexError):
            continue
        if ts >= cutoff:
            klass = f.stem.split("_", 1)[1] if "_" in f.stem else "unklassifiziert"
            classes[klass] += 1
    return classes


def changelog_touched_since(path: Path, cutoff: datetime) -> bool:
    if not path.exists():
        return False
    mtime = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
    return mtime >= cutoff


def main() -> int:
    parser = argparse.ArgumentParser(description="Vorverdichtete Basis für die Review-Routine.")
    parser.add_argument("--since", default="24h")
    args = parser.parse_args()

    cutoff = datetime.now(timezone.utc) - parse_since(args.since)

    print(f"== Review-Rohdaten seit {args.since} ==\n")

    incidents = debug_incidents_since(cutoff)
    if incidents:
        print("Debug-Vorfälle nach Klasse:")
        for klass, count in incidents.most_common():
            print(f"  {klass}: {count}")
    else:
        print("Keine Debug-Vorfälle im Zeitraum.")

    print()
    print(f"CHANGELOG_SKILLS.md aktualisiert im Zeitraum: {changelog_touched_since(CHANGELOG_SKILLS, cutoff)}")
    print(f"CHANGELOG_HOOKS.md aktualisiert im Zeitraum:  {changelog_touched_since(CHANGELOG_HOOKS, cutoff)}")
    print()
    print("Hinweis: für Kosten-/Laufzeit-Metriken zusätzlich `scripts/metrics_tracker.py` aufrufen.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
