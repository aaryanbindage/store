#!/usr/bin/env python3
"""Rebuild app/index.html from the original bundled export + app/app-logic.js.

The shipped "AutoStore AI.html" is a self-extracting bundle: a JSON manifest of
gzip+base64 blobs plus an HTML template that references them by UUID.  This
script unpacks it once into plain files under app/ and rewrites the template so
every asset is a normal relative path, so the app can be edited by hand.

    python3 build.py
"""
import base64
import gzip
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
BUNDLE = ROOT / "AutoStore AI.html"
APP = ROOT / "app"
LOGIC = APP / "app-logic.js"

# UUID -> path the rewritten template should reference
ASSETS = {
    "f6f9dd9c-4e19-40b0-be29-f326f6ab9882": "support.js",
    "904f5720-c700-490c-8b7e-a7abf934276c": "ds-bundle.js",
    "8b8bad10-5454-4649-acf1-f412bccf7072": "fonts/archivo-vietnamese.woff2",
    "bfa04f1b-167a-4331-abae-f3868e7bb478": "fonts/archivo-latin-ext.woff2",
    "b2d289b9-1bd1-4761-9826-f6650d4d971e": "fonts/archivo-latin.woff2",
}

# support.js loads these from unpkg unless window.__resources redirects them.
RESOURCE_MAP = {
    "https://unpkg.com/react@18.3.1/umd/react.production.min.js": "vendor/react.production.min.js",
    "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js": "vendor/react-dom.production.min.js",
    "https://unpkg.com/@babel/standalone@7.29.0/babel.min.js": "vendor/babel.min.js",
}


def section(src: str, name: str) -> str:
    m = re.search(r'<script type="__bundler/%s">\s*(.*?)\s*</script>' % name, src, re.S)
    if not m:
        raise SystemExit("bundle is missing the %s section" % name)
    return m.group(1)


def main() -> None:
    src = BUNDLE.read_text()
    manifest = json.loads(section(src, "manifest"))
    template = json.loads(section(src, "template"))

    APP.mkdir(exist_ok=True)
    (APP / "fonts").mkdir(exist_ok=True)
    (APP / "vendor").mkdir(exist_ok=True)

    for uuid, rel in ASSETS.items():
        entry = manifest.get(uuid)
        if not entry:
            raise SystemExit("bundle is missing asset %s" % uuid)
        raw = base64.b64decode(entry["data"])
        if entry.get("compressed"):
            raw = gzip.decompress(raw)
        (APP / rel).write_bytes(raw)

    html = template
    for uuid, rel in ASSETS.items():
        html = html.replace(uuid, rel)

    # Point the runtime at the vendored React/Babel instead of unpkg.
    shim = ("<script>window.__resources = %s;</script>\n"
            % json.dumps(RESOURCE_MAP, indent=2))
    html = html.replace("<script src=\"support.js\">", shim + "<script src=\"support.js\">", 1)

    # Swap the bundled demo logic for the live version in app/app-logic.js.
    logic = LOGIC.read_text()
    m = re.search(r'(<script[^>]*data-dc-script[^>]*>)(.*?)(</script>)', html, re.S)
    if not m:
        raise SystemExit("could not find the x-dc logic script in the template")
    html = html[:m.start()] + m.group(1) + "\n" + logic + "\n" + m.group(3) + html[m.end():]

    # The markup hardcodes the old demo's model name; bind it to the live one.
    html = html.replace("Gemini writes in your", "{{ agentName }} writes in your")
    if "Gemini" in html.split("data-dc-script")[0]:
        print("warning: 'Gemini' still present in markup")

    out = APP / "index.html"
    out.write_text(html)
    print("wrote %s (%d KB)" % (out, len(html) // 1024))
    print("assets:", ", ".join(sorted(ASSETS.values())))


if __name__ == "__main__":
    main()
