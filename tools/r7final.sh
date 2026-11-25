#!/usr/bin/env bash
# Round 7's final emulated pass (one browser at a time): on-grid at 14 sizes (light) + 4 dark, overlaps and shares at 14,
# stretch at 14, geometry at 14 (light and dark), axe + length, then the screenshot set.
cd "$(dirname "$0")/.."
O=tools/shots/r7
python -I tools/gridcheck.py --out $O/grid > $O/gridcheck_light.txt 2>&1
python -I tools/gridcheck.py --themes dark --sizes 384x734@2.8125,1440x900@1,2160x1147@1.333,412x915@2.625 --out $O/grid-dark > $O/gridcheck_dark.txt 2>&1
python -I tools/overlap.py --out $O/overlap > $O/overlap.txt 2>&1
python -I tools/stretch.py > $O/stretch.txt 2>&1
python -I tools/geom.py --out $O/geom > $O/geom.txt 2>&1
rm -f $O/axe.txt
for a in "--size 384x734" "--size 384x734 --dark" "--size 1440x900" "--size 2160x1147 --dark" "--size 384x734 --reduced" "--size 1440x900 --reduced"; do
  echo "== axe page 1 $a" >> $O/axe.txt; python -I tools/axe2.py $a >> $O/axe.txt 2>&1
  echo "== axe pages 2-3 $a" >> $O/axe.txt; python -I tools/axe23.py $a >> $O/axe.txt 2>&1
done
PS="0.1,0.24,0.6,1.3,1.72,2.2,2.45,2.5,2.72,2.92,3.12,3.9,4.8,5.05,5.49,6.26,6.83,7.4,7.97,8.62,9.16"
python -I tools/t2shot.py --size 384x734 --dpr 2.8125 --mobile --ps $PS --out $O/shots-phone --wait 1500 > $O/shots.txt 2>&1
python -I tools/t2shot.py --size 384x734 --dpr 2.8125 --mobile --dark --ps $PS --out $O/shots-phone --wait 1500 >> $O/shots.txt 2>&1
python -I tools/t2shot.py --size 2160x1147 --dpr 1.333 --ps $PS --out $O/shots-laptop --wait 1500 >> $O/shots.txt 2>&1
python -I tools/t2shot.py --size 1440x900 --ps $PS --out $O/shots-laptop --wait 1500 >> $O/shots.txt 2>&1
for tr in A B C; do python -I tools/t2shot.py --size 384x734 --dpr 2.8125 --mobile --pre 4.95 --ps 5.05 --wait 450 --query tr=$tr --out $O/shots-transition >> $O/shots.txt 2>&1; python -I tools/t2shot.py --size 2160x1147 --dpr 1.333 --pre 4.95 --ps 5.05 --wait 450 --query tr=$tr --out $O/shots-transition >> $O/shots.txt 2>&1; done
for hall in B C; do python -I tools/t2shot.py --size 384x734 --dpr 2.8125 --mobile --ps 6.26,7.4 --query hall=$hall --out $O/shots-treatments --wait 1500 >> $O/shots.txt 2>&1; done
python -I tools/t2shot.py --size 384x734 --dpr 2.8125 --mobile --reduced --out $O/shots-reduced >> $O/shots.txt 2>&1
echo ALLDONE >> $O/shots.txt
