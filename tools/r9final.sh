#!/usr/bin/env bash
# The final full check (Part 5 "Finish the site", step 3), emulated half, one browser at a time: the type rules (14 sizes,
# light and dark, and reduced motion), readability of the hallway's drawings (14), on-grid (14 light + 4 dark), overlaps
# (14), geometry (14, light and dark), axe + lengths at every stop (6 runs). Results in tools/shots/r9-final/.
cd "$(dirname "$0")/.."
O=tools/shots/r9-final
mkdir -p $O
python -I tools/typecheck.py --jobs 2 --out $O/typecheck > $O/typecheck.txt 2>&1
python -I tools/typecheck.py --reduced --jobs 2 --out $O/typecheck-rm > $O/typecheck_reduced.txt 2>&1
python -I tools/readcheck.py --out $O/readcheck.json > $O/readcheck.txt 2>&1
python -I tools/gridcheck.py --out $O/grid > $O/gridcheck_light.txt 2>&1
python -I tools/gridcheck.py --themes dark --sizes 384x734@2.8125,1440x900@1,2160x1147@1.333,412x915@2.625 --out $O/grid-dark > $O/gridcheck_dark.txt 2>&1
python -I tools/overlap.py --out $O/overlap > $O/overlap.txt 2>&1
python -I tools/geom.py --out $O/geom > $O/geom.txt 2>&1
rm -f $O/axe.txt
for a in "--size 384x734" "--size 384x734 --dark" "--size 1440x900" "--size 2160x1147 --dark" "--size 384x734 --reduced" "--size 1440x900 --reduced"; do
  python -I tools/axe8.py $a >> $O/axe.txt 2>&1
done
echo ALLDONE >> $O/axe.txt
