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
css = sorted((ROOT / "site" / "css").glob("sheet-*.css"))
html = html.replace("<!-- @styles -->\n", "".join(f'  <link rel="stylesheet" href="css/{p.name}">\n' for p in css))
(ROOT / "site" / "index.html").write_text(html, encoding="utf-8")
import subprocess, shutil
dist = ROOT / "site" / "dist"
if dist.exists(): shutil.rmtree(dist)
subprocess.run(["node", str(ROOT / "tools" / "bundle.mjs")], check=True)
print("built site/index.html,", len(html), "bytes,", len(css), "sheet stylesheets")
