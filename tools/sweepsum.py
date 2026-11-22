"""Summarise a sweep folder's flags.json with the known false positives filtered out:
  - frame zone letters / numbers (A-F, 1-8) touched by a passing sheet or a sheet's own caption,
  - a leader label and its sub-line (SVG glyph boxes of two stacked mono lines touch),
  - the strip's own labels (~),
  - the title block moving in the last frame (the loop back to the singularity has started).
  python -I tools/sweepsum.py tools/shots/sweep/F1440 [more dirs]"""
import json, sys, re
from pathlib import Path

TB = {"Project", "Sheet", "Title", "Scale", "Print", "Light", "Dark", "Drawn", "Checked", "Approved", "Rev", "/ 09", "1:1", "11.26",
      "Opening", "The first drawing", "Principles", "Method", "Work", "Process", "Studio", "Contact", "Spec sheet",
      "Design", "Engineering", "Security", "AI", "Strategy"}
for d in sys.argv[1:]:
    f = json.loads((Path(d) / "flags.json").read_text(encoding="utf-8"))
    last = max((fr[0] for fr in f.get("frames", [])), default=0)
    keep, raw = {}, 0
    for fr in f["flagged"]:
        for i in fr["issues"]:
            raw += 1
            kind, a = i[0], str(i[1])
            b = str(i[2]) if len(i) > 2 else ""
            if kind == "move" and fr["y"] >= last - 5: continue
            if kind == "over":
                if re.fullmatch(r"[A-F1-8]", a) or re.fullmatch(r"[A-F1-8]", b): continue
                if a.startswith("~") or b.startswith("~"): continue
                if re.match(r"^0\d ", a) or a in ("One door", "Backups", "Zone A", "Zone B"): continue
                # text scrolling under the page's opaque title block (reduced motion flows like a normal page)
                if b in TB or a in TB or re.fullmatch(r"0\d", b) or b.startswith(("Disciplines", "Wajih Mansouri")): continue
            keep.setdefault(json.dumps(i[:3], ensure_ascii=False), []).append(fr["y"])
    frames = f.get("frames", [])
    widths = [fr for fr in frames if fr[3] and fr[3] > 0 and False]
    print(f"== {d}: {f['summary']['frames']} frames, raw flags {raw}, after filters {sum(len(v) for v in keep.values())}, logs {len(f['logs'])}")
    for k, ys in sorted(keep.items(), key=lambda kv: kv[1][0]):
        print(f"   {k}  at y={ys[:6]}{'…' if len(ys) > 6 else ''}")
