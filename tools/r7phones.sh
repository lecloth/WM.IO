#!/usr/bin/env bash
# Round 7: the phone-size half of r7final.sh, re-run after the ?nosnap fix (a stray control character in the head script
# kept the touch snap on in every emulated phone check, so programmatic scrolls were pulled to the nearest scene).
cd "$(dirname "$0")/.."
O=tools/shots/r7
PH="384x734@2.8125,390x844@3,360x800@3,375x667@2,393x852@3,412x915@2.625,430x932@3"
python -I tools/gridcheck.py --sizes $PH --out $O/grid-phones > $O/gridcheck_phones.txt 2>&1
python -I tools/gridcheck.py --themes dark --sizes 384x734@2.8125,412x915@2.625 --out $O/grid-dark-phones > $O/gridcheck_dark_phones.txt 2>&1
python -I tools/overlap.py --sizes $PH --out $O/overlap-phones > $O/overlap_phones.txt 2>&1
python -I tools/stretch.py --sizes $PH > $O/stretch_phones.txt 2>&1
python -I tools/geom.py --sizes $PH --out $O/geom-phones > $O/geom_phones.txt 2>&1
rm -f $O/axe_phones.txt
for a in "--size 384x734" "--size 384x734 --dark"; do
  echo "== axe page 1 $a" >> $O/axe_phones.txt; python -I tools/axe2.py $a >> $O/axe_phones.txt 2>&1
  echo "== axe pages 2-3 $a" >> $O/axe_phones.txt; python -I tools/axe23.py $a >> $O/axe_phones.txt 2>&1
done
PS="0.1,0.24,0.6,1.3,1.72,2.2,2.45,2.5,2.72,2.92,3.12,3.9,4.8,5.05,5.49,6.26,6.83,7.4,7.97,8.62,9.16"
rm -rf $O/shots-phone $O/shots-transition $O/shots-treatments
python -I tools/t2shot.py --size 384x734 --dpr 2.8125 --mobile --ps $PS --out $O/shots-phone --wait 1500 > $O/shots_phones.txt 2>&1
python -I tools/t2shot.py --size 384x734 --dpr 2.8125 --mobile --dark --ps $PS --out $O/shots-phone --wait 1500 >> $O/shots_phones.txt 2>&1
for tr in A B C; do for w in 250 550; do
  python -I tools/t2shot.py --size 384x734 --dpr 2.8125 --mobile --pre 4.95 --ps 5.05 --wait $w --query tr=$tr --out $O/shots-transition/${w}ms >> $O/shots_phones.txt 2>&1
  python -I tools/t2shot.py --size 2160x1147 --dpr 1.333 --pre 4.95 --ps 5.05 --wait $w --query tr=$tr --out $O/shots-transition/${w}ms >> $O/shots_phones.txt 2>&1
done; done
for hall in B C; do python -I tools/t2shot.py --size 384x734 --dpr 2.8125 --mobile --ps 6.26,7.4 --query hall=$hall --out $O/shots-treatments --wait 1500 >> $O/shots_phones.txt 2>&1; done
echo ALLDONE >> $O/shots_phones.txt
