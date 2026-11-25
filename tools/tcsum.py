"""Summarise tools/shots/r8/typecheck/typecheck.json: the distinct failures, grouped, most frequent first.
  python -I tools/tcsum.py [--json path] [--grep text] [--top 120]"""
import argparse, json, sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ap = argparse.ArgumentParser(); ap.add_argument('--json', default='tools/shots/r8/typecheck/typecheck.json'); ap.add_argument('--grep', default=''); ap.add_argument('--top', type=int, default=120)
a = ap.parse_args()
d = json.load(open(a.json, encoding='utf-8'))
print('totals:', d.get('totals'))
rows = [x for x in d['distinct'] if a.grep.lower() in json.dumps(x, ensure_ascii=False).lower()]
for x in sorted(rows, key=lambda x: -x.get('n', 0))[:a.top]:
    print(f"{x.get('n')} [{x.get('rule')}] {(x.get('text') or '')[:60]} :: {str(x.get('what') or '')[:60]} ({x.get('dist')}) e.g. {', '.join(x.get('where', [])[:2])}")
