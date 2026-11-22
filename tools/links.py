"""Link check: every src / href / url() / import / fetch / string path in site/index.html, site/css/*.css,
site/dist/*.js and site/js/** must resolve to a local file that the server returns 200 for, and nothing may point
off 127.0.0.1 (mailto: / wa.me hand-offs are reported separately: they are links the visitor follows, not requests).
  python -I tools/links.py"""
import re, sys, urllib.request, urllib.parse, json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1] / "site"
BASE = "http://127.0.0.1:8109/"
files = [ROOT / "index.html", *sorted((ROOT / "css").glob("*.css")), *sorted((ROOT / "dist").glob("*.js")), *sorted((ROOT / "js").rglob("*.js"))]
pat = [
    re.compile(r'''\b(?:src|href|poster)\s*=\s*["']([^"'#\s+,<>{}][^"'\s<>+{}]*)["']'''),
    re.compile(r'''url\(\s*["']?([^"')#\s][^"')\s]*)["']?\s*\)'''),
    re.compile(r'''\b(?:import|from)\s*\(?\s*["']((?:\.{1,2}/|three)[^"'\s]*)["']'''),
    re.compile(r'''fetch\(\s*["'`]([^"'`]+)["'`]'''),
    re.compile(r'''["'`]((?:\.{0,2}/)?(?:media|fonts|vendor|css|dist|js)/[^"'`\s${}]+\.(?:webp|png|jpe?g|svg|woff2?|js|css|json|mp4|webm|avif|gif|txt))["'`]'''),
]
ext, handoff, refs = set(), set(), {}
for f in files:
    txt = f.read_text(encoding="utf-8", errors="replace")
    for p in pat:
        for m in p.finditer(txt):
            u = m.group(1).strip()
            if u.startswith(("data:", "%23")) or u.startswith("#") or u.startswith("blob:") or "${" in u: continue
            if u.startswith(("mailto:", "https://wa.me", "tel:")): handoff.add(u[:80]); continue
            if re.match(r"^[a-z]+:", u) or u.startswith("//"):
                if u.startswith(("http://www.w3.org/", "http://127.0.0.1:8109")): continue
                ext.add((u[:100], f.relative_to(ROOT).as_posix())); continue
            if u in ("three",) or u.startswith("three/"):
                u = "vendor/three/" + ("three.module.min.js" if u == "three" else "addons/" + u[len("three/addons/"):])
            # resolve relative to the referencing file (css/js) or the page
            if f.suffix == ".css": base = BASE + "css/"
            elif f.parent.name == "dist" or f.name == "index.html": base = BASE
            else: base = BASE + f.parent.relative_to(ROOT).as_posix() + "/"
            # strings used at runtime from the page (e.g. 'media/...') resolve against the page, not the module
            if f.parent.name == "dist" and u.startswith("./"): base = BASE + "dist/"
            if not u.startswith((".", "/")) and f.suffix == ".js": base = BASE
            full = urllib.parse.urljoin(base, u.split("?")[0])
            refs.setdefault(full, set()).add(f.relative_to(ROOT).as_posix())
bad = []
for u, by in sorted(refs.items()):
    try:
        code = urllib.request.urlopen(urllib.request.Request(u, method="GET"), timeout=10).status
    except Exception as e:
        code = getattr(e, "code", str(e))
    if code != 200: bad.append((u, code, sorted(by)))
print(json.dumps({"checked": len(refs), "bad": bad, "external": sorted(ext), "handoff": sorted(handoff)}, indent=1))
