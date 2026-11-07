#!/usr/bin/env python3
"""Check that the corporate shell exposes the configured OINK appearance."""

from html.parser import HTMLParser
from pathlib import Path
import sys


class Appearance(HTMLParser):
    def __init__(self):
        super().__init__()
        self.root = {}
        self.styles = set()
        self.redirect = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html":
            self.root = attrs
        if tag == "input" and "data-td-preset-value" in attrs:
            self.styles.add(attrs["data-td-preset-value"])
        if tag == "meta" and attrs.get("http-equiv", "").lower() == "refresh":
            self.redirect = True


def main():
    public = Path(sys.argv[1] if len(sys.argv) > 1 else "public")
    errors = []
    checked = 0
    for path in sorted(public.rglob("*.html")):
        page = Appearance()
        page.feed(path.read_text())
        if page.redirect or not page.root or "print" in path.relative_to(public).parts:
            continue
        checked += 1
        if (page.root.get("data-td-site-preset") != "paper"
                or page.root.get("data-td-preset") != "paper"
                or page.styles != {"paper", "slate", "ink", "terminal"}):
            errors.append(str(path))
    if not checked:
        errors.append("no rendered HTML pages found")
    if errors:
        print("Appearance missing or incomplete:\n" + "\n".join(errors))
        return 1
    print(f"Appearance: Paper default and four styles on {checked} pages")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
