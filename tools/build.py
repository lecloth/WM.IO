"""Assemble site/index.html from src/index.template.html + src/parts/<name>.html, and link every site/css/sheet-*.css.
Run after any markup change:  python -I tools/build.py"""
import re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
tpl = (ROOT / "src" / "index.template.html").read_text(encoding="utf-8")
def part(m):
    f = ROOT / "src" / "parts" / f"{m.group(1)}.html"
    return f.read_text(encoding="utf-8").rstrip() + "\n" if f.exists() else ""
html = re.sub(r"<!-- @part ([\w-]+) -->\n?", part, tpl)
css = sorted((ROOT / "site" / "css").glob("page-*.css"))   # Take 2: page-NN.css (Take 1 sheet-NN.css stay on disk, unlinked)
html = html.replace("<!-- @styles -->\n", "".join(f'  <link rel="stylesheet" href="css/{p.name}">\n' for p in css))
(ROOT / "site" / "index.html").write_text(html, encoding="utf-8")
import subprocess, shutil
dist = ROOT / "site" / "dist"
if dist.exists(): shutil.rmtree(dist)
subprocess.run(["node", str(ROOT / "tools" / "bundle.mjs")], check=True)
print("built site/index.html,", len(html), "bytes,", len(css), "sheet stylesheets")

# round 5: cache-busting. The plain local server sends no cache headers, so a phone's Chrome may keep an old stylesheet
# or entry script for hours (it did: Wajih's S23 ran new markup with round 4's page-02.css). Every stylesheet and entry
# script URL in the built page and the dev pages gets ?v=<its content hash>.
import hashlib
pat = re.compile(r'((?:href|src)=")((?:\.\./)?)(css|dist)/([\w.-]+\.(?:css|js))(?:\?v=\w+)?"')
def ver2(m):
    attr, up, rel, name = m.group(1), m.group(2), m.group(3), m.group(4)
    f = ROOT / "site" / rel / name
    if not f.exists(): return m.group(0)
    return f'{attr}{up}{rel}/{name}?v={hashlib.sha1(f.read_bytes()).hexdigest()[:10]}"'
for page in [ROOT / "site" / "index.html", *sorted((ROOT / "site" / "dev").glob("*.html"))]:
    t = page.read_text(encoding="utf-8"); t2 = pat.sub(ver2, t)
    if t2 != t: page.write_text(t2, encoding="utf-8"); print("versioned", page.relative_to(ROOT))
