#!/usr/bin/env python3
"""
Metrics & Cost Tracker (Layer 06 — Observability & Learning).

Liest logs/metrics/cost_tracking.jsonl (befüllt von .claude/hooks/post-tool-use/quality-check.sh
und orchestrator/run_workflow.py) und liefert eine kompakte Übersicht: teuerste/langsamste Tasks,
Fehlerquote, Trend über Zeit. Wird u. a. vom reflector-Subagenten für die Daily/Weekly Review
genutzt (siehe CLAUDE.md Abschnitt 9 und .claude/commands/daily-review.md).

Nutzung:
    python3 scripts/metrics_tracker.py [--since 24h|7d] [--top 5]
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
METRICS_LOG = ROOT / "logs" / "metrics" / "cost_tracking.jsonl"


def parse_since(value: str) -> timedelta:
    match = re.fullmatch(r"(\d+)([hd])", value)
    if not match:
        raise ValueError(f"Ungültiges --since Format: {value} (erwartet z. B. '24h' oder '7d')")
    amount, unit = int(match.group(1)), match.group(2)
    return timedelta(hours=amount) if unit == "h" else timedelta(days=amount)


def load_entries(path: Path, cutoff: datetime) -> list[dict]:
    if not path.exists():
        return []
    entries = []
    for line in path.read_text().splitlines():
        if not line.strip():
            continue
        try:
            entry = json.loads(line)
        except json.JSONDecodeError:
            continue
        ts_raw = entry.get("ts")
        if not ts_raw:
            continue
        try:
            ts = datetime.fromisoformat(ts_raw.replace("Z", "+00:00"))
        except ValueError:
            continue
        if ts >= cutoff:
            entries.append(entry)
    return entries


def main() -> int:
    parser = argparse.ArgumentParser(description="Zeigt Metriken/Kosten aus logs/metrics/.")
    parser.add_argument("--since", default="24h", help="Zeitfenster, z. B. '24h' oder '7d' (Default: 24h)")
    parser.add_argument("--top", type=int, default=5, help="Anzahl teuerster/langsamster Einträge")
    args = parser.parse_args()

    cutoff = datetime.now(timezone.utc) - parse_since(args.since)
    entries = load_entries(METRICS_LOG, cutoff)

    if not entries:
        print(f"Keine Metrik-Einträge seit {args.since}.")
        return 0

    total = len(entries)
    failed = [e for e in entries if e.get("status") in ("fail", "error")]
    durations = sorted(
        (e for e in entries if isinstance(e.get("duration_s"), (int, float))),
        key=lambda e: e["duration_s"],
        reverse=True,
    )

    print(f"== Metrics seit {args.since} ==")
    print(f"Einträge gesamt: {total}")
    print(f"Fehlgeschlagen:  {len(failed)} ({round(100 * len(failed) / total, 1)}%)")

    if durations:
        print(f"\nTop {args.top} langsamste Einträge:")
        for e in durations[: args.top]:
            print(f"  {e.get('duration_s')}s  {e.get('task_id', e.get('file', '?'))}  ({e.get('status')})")

    if failed:
        print(f"\nZuletzt fehlgeschlagen:")
        for e in failed[-args.top:]:
            print(f"  {e.get('ts')}  {e.get('task_id', e.get('file', '?'))}  {e.get('detail', '')}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
