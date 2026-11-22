"""Work order (sheet 08) check: jump to the form, type like a visitor, read the live title block and the hand-off URLs,
try the error paths.  python -I tools/wo.py [--mobile]"""
import asyncio, json, sys, urllib.parse
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock

STATE = """() => { const s = document.getElementById('sheet-08'); const q = (k) => s.querySelector(`[data-out="${k}"]`);
  return { no: q('no').textContent, date: q('date').textContent, project: q('project').textContent, sheets: q('sheets').textContent, reply: q('reply').textContent,
    disc: [...s.querySelectorAll('.s08__d.is-hit')].map(li => li.querySelector('.s08__dn').textContent + ' ' + li.querySelector('.s08__hit').textContent),
    errWay: s.querySelector('#s08-way-err').textContent, errReach: s.querySelector('#s08-reach-err').textContent,
    status: s.querySelector('.s08__status').textContent, active: document.activeElement?.id || document.activeElement?.tagName,
    mail: s.querySelector('#s08-mail').getAttribute('href'), wa: s.querySelector('#s08-wa').getAttribute('href'),
    direct: [...s.querySelectorAll('.s08__direct a')].map(a => a.getAttribute('href') + ' | ' + a.textContent.trim()) }; }"""


async def main(mobile):
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"])
        kw = dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True) if mobile else dict(viewport={"width": 1440, "height": 900})
        ctx = await b.new_context(**kw)
        page = await ctx.new_page()
        errs = []; page.on("pageerror", lambda e: errs.append(str(e)[:200])); page.on("console", lambda m: m.type in ("error", "warning") and errs.append(m.text[:200]))
        popups = []; ctx.on("page", lambda p: popups.append(p.url))
        reqs = []; page.on("request", lambda r: (not r.url.startswith("http://127.0.0.1:8109")) and reqs.append(r.url))
        await page.goto("http://127.0.0.1:8109/", wait_until="load")
        await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
        y = await page.evaluate("() => window.__engine.targetOf('#sheet-08')", isolated_context=False)
        await page.evaluate(f"() => (window.__engine.lenis.scrollTo({y} + innerHeight * 0.8, {{immediate: true, force: true}}), scrollTo(0, {y} + innerHeight * 0.8))", isolated_context=False)
        await page.wait_for_timeout(1200)
        out = {}
        # 1. send with nothing typed: error in words, focus to the field, no navigation
        await page.click("#s08-mail"); await page.wait_for_timeout(300)
        out["empty_send"] = await page.evaluate(STATE)
        # 2. type a problem
        await page.click("#s08-way")
        await page.keyboard.type("Our booking spreadsheet breaks every week & customers can't book appointments online. We'd like an app + AI to answer messages.", delay=4)
        await page.click("#s08-have"); await page.keyboard.type("A WordPress site and an Excel sheet", delay=4)
        await page.wait_for_timeout(300)
        out["typed"] = await page.evaluate(STATE)
        # 3. a bad contact line
        await page.click("#s08-reach"); await page.keyboard.type("call me maybe", delay=4)
        await page.click("#s08-have"); await page.wait_for_timeout(200)
        out["bad_reach"] = await page.evaluate(STATE)
        # 4. a good email
        await page.fill("#s08-reach", ""); await page.click("#s08-reach"); await page.keyboard.type("ana@example.tn", delay=4)
        await page.wait_for_timeout(200)
        out["good_reach"] = await page.evaluate(STATE)
        # decode the hand-offs
        m = out["good_reach"]["mail"]; w = out["good_reach"]["wa"]
        pm = urllib.parse.urlparse(m); qs = urllib.parse.parse_qs(pm.query)
        out["mail_decoded"] = {"to": pm.path, "subject": qs.get("subject", [""])[0], "body": qs.get("body", [""])[0]}
        pw_ = urllib.parse.urlparse(w); out["wa_decoded"] = {"host": pw_.netloc, "path": pw_.path, "text": urllib.parse.parse_qs(pw_.query).get("text", [""])[0]}
        out["mail_raw_ok"] = all(c not in m for c in " \n\r&<>\"") or "&body=" in m
        # 5. press Enter in the contact field (form submit) moves focus to the email button
        await page.focus("#s08-reach"); await page.keyboard.press("Enter"); await page.wait_for_timeout(200)
        out["enter_focus"] = await page.evaluate("() => document.activeElement.id")
        out["external_requests"] = reqs; out["popups"] = popups; out["errors"] = errs
        await page.screenshot(path="tools/shots/sweep/wo_%s.jpg" % ("m" if mobile else "d"), type="jpeg", quality=70)
        await b.close()
    print(json.dumps(out, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    with BrowserLock():
        asyncio.run(main("--mobile" in sys.argv))
