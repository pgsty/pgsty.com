#!/usr/bin/env python3
"""Reject false registered-trademark claims for the PGSTY/PIGSTY brands."""

from __future__ import annotations

import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SELF = Path(__file__).resolve()
BRAND = r"\b(?:PGSTY|PIGSTY)\b"
REGISTERED_MARK = r"(?:®|&reg;|&#(?:174|x0*ae);)"
REGISTERED_CLAIM = r"(?:registered\s+trademarks?|注册商标)"
PATTERNS = (
    re.compile(rf"{BRAND}\s*{REGISTERED_MARK}", re.IGNORECASE),
    re.compile(
        rf"(?:{BRAND}.{{0,120}}{REGISTERED_CLAIM}|"
        rf"{REGISTERED_CLAIM}.{{0,120}}{BRAND})",
        re.IGNORECASE | re.DOTALL,
    ),
)


def repository_files() -> list[Path]:
    result = subprocess.run(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
        cwd=ROOT,
        check=True,
        capture_output=True,
    )
    paths = [ROOT / name for name in result.stdout.decode().split("\0") if name]
    public = ROOT / "public"
    if public.is_dir():
        paths.extend(path for path in public.rglob("*") if path.is_file())
    return paths


def read_text(path: Path) -> str | None:
    if path.resolve() == SELF:
        return None
    data = path.read_bytes()
    if b"\0" in data[:4096]:
        return None
    return data.decode("utf-8", errors="ignore")


def main() -> int:
    violations: list[tuple[Path, int, str]] = []
    seen: set[Path] = set()
    for path in repository_files():
        path = path.resolve()
        if path in seen:
            continue
        seen.add(path)
        text = read_text(path)
        if text is None:
            continue
        for pattern in PATTERNS:
            for match in pattern.finditer(text):
                line = text.count("\n", 0, match.start()) + 1
                excerpt = " ".join(match.group(0).split())
                violations.append((path.relative_to(ROOT), line, excerpt))

    if violations:
        print("false registered-trademark claim detected:")
        for path, line, excerpt in violations:
            print(f"  {path}:{line}: {excerpt}")
        return 1

    print("brand claim check passed: no PGSTY/PIGSTY registration claims")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
