#!/usr/bin/env python3
"""刷新 data/portal/ 里的 GitHub 星数计数。

用法：
    bin/metrics.py           # 只打印抓到的数字
    bin/metrics.py update    # 回写 data/portal/metrics.yaml 与 projects.yaml
"""

from __future__ import annotations

import json
import re
import sys
import urllib.request
from pathlib import Path

TIMEOUT = 15
ROOT = Path(__file__).resolve().parent.parent
METRICS = ROOT / "data" / "portal" / "metrics.yaml"
PROJECTS = ROOT / "data" / "portal" / "projects.yaml"

# projects.yaml 里的 key -> GitHub 仓库
REPOS = {
    "pigsty": "pgsty/pigsty",
    "pig": "pgsty/pig",
    "pg_exporter": "pgsty/pg_exporter",
    "silo": "pgsty/minio",
    "piglet": "pgsty/pigsty",
}


def stars(repo: str) -> int:
    req = urllib.request.Request(
        f"https://api.github.com/repos/{repo}",
        headers={"Accept": "application/vnd.github+json", "User-Agent": "pgsty-portal-metrics"},
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return int(json.load(resp)["stargazers_count"])


def main() -> int:
    counts = {key: stars(repo) for key, repo in REPOS.items()}
    for key, n in counts.items():
        print(f"{key:12s} {n}")

    if len(sys.argv) > 1 and sys.argv[1] == "update":
        text = METRICS.read_text(encoding="utf-8")
        text = re.sub(r"^pigsty_stars: \d+", f"pigsty_stars: {counts['pigsty']}", text, flags=re.M)
        METRICS.write_text(text, encoding="utf-8")

        # projects.yaml：按条目顺序逐个替换 stars 字段
        lines = PROJECTS.read_text(encoding="utf-8").splitlines(keepends=True)
        current = None
        for i, line in enumerate(lines):
            m = re.match(r"- key: (\w+)", line)
            if m:
                current = m.group(1)
            elif current in counts and re.match(r"\s+stars: \d+", line):
                lines[i] = re.sub(r"\d+", str(counts[current]), line, count=1)
        PROJECTS.write_text("".join(lines), encoding="utf-8")
        print("updated:", METRICS.name, PROJECTS.name)
    return 0


if __name__ == "__main__":
    sys.exit(main())
