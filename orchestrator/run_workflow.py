#!/usr/bin/env python3
"""
Orchestrator (Layer 00 Core/Bootstrap) — externer Treiber für den autonomen Workflow.

Dies ist KEIN Ersatz für den in Claude Code eingebauten Agent-Loop, sondern ein optionaler,
schlanker Wrapper darum: er priorisiert die Task-Queue (tasks/queue.json), ruft für jede Task
den `claude` CLI im headless-Modus mit dem `/workflow-autonomous`-Slash-Command auf, respektiert
das Cost-Gate aus orchestrator/config.yaml, und loggt Ergebnis/Kosten strukturiert für Layer 06.

Nutzung:
    python3 orchestrator/run_workflow.py                 # nächste fällige Task(s) abarbeiten
    python3 orchestrator/run_workflow.py --task <id>      # eine bestimmte Task erzwingen
    python3 orchestrator/run_workflow.py --dry-run        # nur Plan/Reihenfolge anzeigen, nichts ausführen

Für echte Mehrfach-Iteration / kontinuierliches Laufen die eingebaute `loop`- oder `schedule`-Skill
von Claude Code nutzen, statt dieses Skript in einer eigenen Endlosschleife laufen zu lassen
(siehe CLAUDE.md Abschnitt 2).
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / "orchestrator" / "config.yaml"


def load_config() -> dict:
    """Minimaler YAML-Reader für die flache config.yaml, um ohne externe Dependency (PyYAML)
    auszukommen. Bei Bedarf durch `yaml.safe_load` ersetzen, falls PyYAML im Projekt ohnehin
    vorhanden ist."""
    config: dict = {"priority_order": ["P0", "P1", "P2", "P3"], "paths": {}}
    if not CONFIG_PATH.exists():
        return config
    current_section = None
    for raw_line in CONFIG_PATH.read_text().splitlines():
        line = raw_line.split("#", 1)[0].rstrip()
        if not line.strip():
            continue
        if not line.startswith(" "):
            key, _, value = line.partition(":")
            key, value = key.strip(), value.strip()
            if value:
                config[key] = _parse_scalar(value)
                current_section = None
            else:
                current_section = key
                config[key] = {}
        elif current_section:
            key, _, value = line.strip().partition(":")
            config[current_section][key.strip()] = _parse_scalar(value.strip())
    return config


def _parse_scalar(value: str):
    value = value.strip().strip('"')
    if value.startswith("[") and value.endswith("]"):
        return [v.strip().strip('"') for v in value[1:-1].split(",") if v.strip()]
    try:
        return float(value) if "." in value else int(value)
    except ValueError:
        return value


def load_queue(path: Path) -> dict:
    if not path.exists():
        return {"tasks": []}
    return json.loads(path.read_text())


def save_queue(path: Path, queue: dict) -> None:
    path.write_text(json.dumps(queue, indent=2, ensure_ascii=False) + "\n")


def select_next_tasks(queue: dict, priority_order: list[str], limit: int, forced_id: str | None):
    tasks = queue.get("tasks", [])
    if forced_id:
        return [t for t in tasks if t.get("id") == forced_id and t.get("status") != "done"]
    pending = [t for t in tasks if t.get("status") not in ("done", "blocked")]
    pending.sort(key=lambda t: (priority_order.index(t.get("priority", "P2"))
                                 if t.get("priority", "P2") in priority_order else 99,
                                 t.get("created_at", "")))
    return pending[:limit]


def log_metric(metrics_log: Path, entry: dict) -> None:
    metrics_log.parent.mkdir(parents=True, exist_ok=True)
    with metrics_log.open("a") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def run_task(task: dict, config: dict, dry_run: bool) -> dict:
    prompt = f"/workflow-autonomous {task['id']}: {task['title']}"
    print(f"→ Task {task['id']} [{task.get('priority', 'P2')}]: {task['title']}")

    if dry_run:
        return {"task_id": task["id"], "status": "dry-run", "duration_s": 0}

    binary = config.get("claude_binary", "claude")
    start = time.time()
    result = subprocess.run(
        [binary, "-p", prompt],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    duration = round(time.time() - start, 2)

    status = "ok" if result.returncode == 0 else "error"
    if status == "error":
        print(f"  ✗ Fehlgeschlagen (exit {result.returncode}). stderr:\n{result.stderr[-2000:]}",
              file=sys.stderr)
    else:
        print(f"  ✓ Abgeschlossen in {duration}s")

    return {"task_id": task["id"], "status": status, "duration_s": duration,
             "returncode": result.returncode}


def main() -> int:
    parser = argparse.ArgumentParser(description="AI-Workstation Orchestrator")
    parser.add_argument("--task", help="Bestimmte Task-ID erzwingen, statt Priorisierung zu nutzen")
    parser.add_argument("--dry-run", action="store_true", help="Nur anzeigen, was ausgeführt würde")
    args = parser.parse_args()

    config = load_config()
    queue_path = ROOT / config.get("paths", {}).get("task_queue", "tasks/queue.json")
    metrics_log = ROOT / config.get("paths", {}).get("metrics_log", "logs/metrics/cost_tracking.jsonl")

    queue = load_queue(queue_path)
    priority_order = config.get("priority_order", ["P0", "P1", "P2", "P3"])
    limit = int(config.get("max_tasks_per_run", 5))

    next_tasks = select_next_tasks(queue, priority_order, limit, args.task)
    if not next_tasks:
        print("Keine offenen Tasks in der Queue (oder Task-ID nicht gefunden/bereits erledigt).")
        return 0

    print(f"{len(next_tasks)} Task(s) ausgewählt (Priorität: {priority_order}).")

    for task in next_tasks:
        outcome = run_task(task, config, args.dry_run)
        if args.dry_run:
            continue
        log_metric(metrics_log, {
            "ts": datetime.now(timezone.utc).isoformat(),
            "task_id": task["id"],
            "title": task["title"],
            **{k: v for k, v in outcome.items() if k != "task_id"},
        })
        if outcome["status"] == "ok":
            for t in queue["tasks"]:
                if t["id"] == task["id"]:
                    t["status"] = "done"
                    t["completed_at"] = datetime.now(timezone.utc).isoformat()
        else:
            for t in queue["tasks"]:
                if t["id"] == task["id"]:
                    t["status"] = "blocked"

    if not args.dry_run:
        save_queue(queue_path, queue)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
