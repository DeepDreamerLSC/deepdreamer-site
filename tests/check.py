#!/usr/bin/env python3
"""Check static pages without dependencies; run from any working directory."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import shutil
import sys
import tempfile
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent
PAGES = ("index.html", "lecturer.html", "finance.html", "teams.html", "explorations.html")


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids, self.links, self.h1, self.main, self.active = [], [], 0, 0, []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        if tag == "h1":
            self.h1 += 1
        if tag == "main":
            self.main += 1
        if attrs.get("aria-current") == "page":
            self.active.append(attrs.get("href"))
        for attr in ("href", "src"):
            if attrs.get(attr):
                self.links.append(attrs[attr])


def check(root=ROOT):
    parsed = {name: Page((root / name).read_text()) for name in PAGES}
    count = 0
    for name, page in parsed.items():
        duplicate = [key for key, n in Counter(page.ids).items() if n > 1]
        assert not duplicate, f"{name}: duplicate IDs {duplicate}"
        assert page.h1 == page.main == 1, f"{name}: requires one h1 and main"
        assert page.active == ([] if name == "index.html" else [name]), f"{name}: active navigation"
        count += 3
        for href in page.links:
            url = urlsplit(href)
            if url.scheme or url.netloc:
                assert url.scheme in ("https", "mailto", "tel"), f"{name}: unsafe URL {href}"
                continue
            assert not url.path.startswith("/"), f"{name}: root path breaks project-site base {href}"
            target = root / (unquote(url.path) or name)
            assert target.is_file(), f"{name}: missing target {href}"
            if url.fragment:
                destination = parsed.get(target.name)
                assert destination and unquote(url.fragment) in destination.ids, f"{name}: missing anchor {href}"
            count += 1
    return count


def self_test():
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        for name in PAGES:
            shutil.copy2(ROOT / name, root / name)
        shutil.copytree(ROOT / "assets", root / "assets")
        count = check(root)
        assert count > 0, "valid links and cross-page fragments must pass"
        index = root / "index.html"
        original = index.read_text()
        for old, new, expected in (
            ('href="finance.html"', 'href="missing.html"', "missing target"),
            ('href="index.html#contact"', 'href="index.html#missing"', "missing anchor"),
            ('href="finance.html"', 'href="/finance.html"', "root path"),
        ):
            assert old in original
            index.write_text(original.replace(old, new))
            try:
                check(root)
            except AssertionError as error:
                assert expected in str(error), str(error)
            else:
                raise AssertionError(f"checker missed {expected}")
            finally:
                index.write_text(original)
    print("Checker self-test passed: valid cross-page anchors, missing page, missing anchor, project-base path.")


if __name__ == "__main__":
    print(f"Passed {check()} static checks across {len(PAGES)} pages.")
    if "--self-test" in sys.argv:
        self_test()
