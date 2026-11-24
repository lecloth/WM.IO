#!/usr/bin/env bash
# Round 6's final emulated pass (one browser at a time): on-grid at 9 sizes (light) and 3 sizes dark, geometry, stretch, axe + length.
cd "$(dirname "$0")/.."
O=tools/shots/r6
python -I tools/gridcheck.py --out $O/grid > $O/gridcheck_light.txt 2>&1
python -I tools/gridcheck.py --themes dark --sizes 384x734@2.8125,1440x900@1,2160x1147@1.333 --out $O/grid-dark > $O/gridcheck_dark.txt 2>&1
python -I tools/geom.py --out $O/geom > $O/geom.txt 2>&1
python -I tools/stretch.py > $O/stretch.txt 2>&1
for a in "--size 384x734" "--size 384x734 --dark" "--size 1440x900" "--size 2160x1147 --dark" "--size 384x734 --reduced" "--size 1440x900 --reduced"; do
  echo "== axe page 1 $a" >> $O/axe.txt; python -I tools/axe2.py $a >> $O/axe.txt 2>&1
  echo "== axe pages 2-3 $a" >> $O/axe.txt; python -I tools/axe23.py $a >> $O/axe.txt 2>&1
done
echo ALLDONE >> $O/axe.txt
