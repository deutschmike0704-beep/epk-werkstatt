#!/usr/bin/env python3
"""
Context-Summarizer (Layer 06 / unterstützt CLAUDE.md Abschnitt 5, Context-Window-Management).

Dampft ein großes Textartefakt (z. B. ein langer Log, ein alter Diskussionsverlauf) auf eine
kompakte Zusammenfassung ein, BEVOR es in den Claude-Kontext geladen wird. Bewusst simpel und
deterministisch (keine LLM-Abhängigkeit) gehalten, damit es ohne API-Zugriff als Vorfilter läuft;
für inhaltliche Zusammenfassung feinerer Granularität delegiert der Haupt-Agent stattdessen an
einen Subagenten.

Nutzung:
    python3 scripts/context_summarizer.py <datei> [--max-lines 50] [--head 10] [--tail 10]
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path


def summarize(text: str, max_lines: int, head: int, tail: int) -> str:
    lines = text.splitlines()
    if len(lines) <= max_lines:
        return text

    head_lines = lines[:head]
    tail_lines = lines[-tail:]
    omitted = len(lines) - head - tail

    error_lines = [l for l in lines[head:-tail] if _looks_significant(l)]
    significant_preview = error_lines[:max(0, max_lines - head - tail)]

    parts = head_lines
    parts.append(f"\n... [{omitted} Zeilen ausgelassen — Vorschau relevanter Zeilen unten] ...\n")
    parts.extend(significant_preview)
    parts.append(f"\n... [Ende der Vorschau, {omitted - len(significant_preview)} weitere Zeilen ausgelassen] ...\n")
    parts.extend(tail_lines)
    return "\n".join(parts)


def _looks_significant(line: str) -> bool:
    markers = ("error", "fail", "exception", "traceback", "warn", "critical", "blocked")
    lowered = line.lower()
    return any(m in lowered for m in markers)


def main() -> int:
    parser = argparse.ArgumentParser(description="Fasst ein langes Textartefakt kompakt zusammen.")
    parser.add_argument("file", type=Path, help="Zu verdichtende Datei")
    parser.add_argument("--max-lines", type=int, default=50, help="Ab wie vielen Zeilen verdichtet wird")
    parser.add_argument("--head", type=int, default=10, help="Zeilen vom Anfang, die immer erhalten bleiben")
    parser.add_argument("--tail", type=int, default=10, help="Zeilen vom Ende, die immer erhalten bleiben")
    args = parser.parse_args()

    if not args.file.exists():
        print(f"Datei nicht gefunden: {args.file}", file=sys.stderr)
        return 1

    text = args.file.read_text(errors="replace")
    print(summarize(text, args.max_lines, args.head, args.tail))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
