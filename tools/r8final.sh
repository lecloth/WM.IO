#!/usr/bin/env bash
# Round 8's final emulated pass (one browser at a time): the type rules (14 sizes, light and dark, and reduced motion),
# on-grid (14 light + 4 dark), overlaps and shares (14), stretch (14), geometry (14, light and dark), axe + length at
# every stop of the whole page (6 runs), then the screenshot set.
cd "$(dirname "$0")/.."
O=tools/shots/r8
mkdir -p $O
python -I tools/typecheck.py > $O/typecheck.txt 2>&1
python -I tools/typecheck.py --reduced --out $O/typecheck > $O/typecheck_reduced.txt 2>&1
python -I tools/gridcheck.py --out $O/grid > $O/gridcheck_light.txt 2>&1
python -I tools/gridcheck.py --themes dark --sizes 384x734@2.8125,1440x900@1,2160x1147@1.333,412x915@2.625 --out $O/grid-dark > $O/gridcheck_dark.txt 2>&1
python -I tools/overlap.py --out $O/overlap > $O/overlap.txt 2>&1
python -I tools/stretch.py > $O/stretch.txt 2>&1
python -I tools/geom.py --out $O/geom > $O/geom.txt 2>&1
rm -f $O/axe.txt
for a in "--size 384x734" "--size 384x734 --dark" "--size 1440x900" "--size 2160x1147 --dark" "--size 384x734 --reduced" "--size 1440x900 --reduced"; do
  python -I tools/axe8.py $a >> $O/axe.txt 2>&1
done
PS="0.1,0.24,0.6,1.3,1.72,2.2,2.45,2.5,2.72,2.92,3.12,3.9,4.8,5.11,5.48,5.97,6.2,6.77,7.34,7.91,8.54,8.72,9.22,9.5"
python -I tools/t2shot.py --size 384x734 --dpr 2.8125 --mobile --ps $PS --out $O/shots-phone --wait 1300 > $O/shots.txt 2>&1
python -I tools/t2shot.py --size 384x734 --dpr 2.8125 --mobile --dark --ps $PS --out $O/shots-phone --wait 1300 >> $O/shots.txt 2>&1
python -I tools/t2shot.py --size 2160x1147 --dpr 1.333 --ps $PS --out $O/shots-laptop --wait 1300 >> $O/shots.txt 2>&1
python -I tools/t2shot.py --size 1440x900 --ps $PS --out $O/shots-laptop --wait 1300 >> $O/shots.txt 2>&1
python -I tools/t2shot.py --size 360x800 --dpr 3 --mobile --ps 1.3,6.2,7.34 --out $O/shots-360 --wait 1300 >> $O/shots.txt 2>&1
python -I tools/t2shot.py --size 384x734 --dpr 2.8125 --mobile --reduced --out $O/shots-reduced >> $O/shots.txt 2>&1
echo ALLDONE >> $O/shots.txt
