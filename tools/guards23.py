"""Page 3's guards and the five ways, in a headless browser (nothing leaves the machine: the endpoint is intercepted).
  python -I tools/guards23.py"""
import asyncio, json, sys, urllib.parse
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from browserlock import BrowserLock
async def main():
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True)
        ctx = await b.new_context(viewport={"width": 384, "height": 734}, is_mobile=True, has_touch=True)
        posts = []
        async def handle(route):
            posts.append(json.loads(route.request.post_data or "{}")); await route.fulfill(status=200, body="ok", headers={"Access-Control-Allow-Origin": "*"})
        await ctx.route("https://example.invalid/**", handle)
        p = await ctx.new_page(); ev = lambda js, arg=None: p.evaluate(js, arg, isolated_context=False)
        await p.goto("http://127.0.0.1:8109/?first&nosnap", wait_until="load")
        await p.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000); await p.keyboard.press("Enter")
        await p.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000); await p.wait_for_timeout(3000)
        R = {}
        # typed text: caps, control and bidi-override characters, Arabic kept, the link capped
        await ev("""() => { const f = document.getElementById('slip'); window.__p23.tick('web'); window.__p23.tick('ai');
          const n = f.querySelector('#slip-name'); n.removeAttribute('maxlength'); n.value = 'A'.repeat(90) + '\u202Eevil'; n.dispatchEvent(new Event('input', { bubbles: true }));
          const o = f.querySelector('#slip-note'); o.removeAttribute('maxlength'); o.value = ('مرحبا، نريد تطبيقاً للحجوزات. ' + 'x\u0007\u2066y ').repeat(60); o.dispatchEvent(new Event('input', { bubbles: true })); }""")
        s = await ev("() => ({ name: window.__p23.slip.name, note: window.__p23.slip.note, href: document.querySelector('.send').href })")
        text = urllib.parse.unquote(s["href"].split("text=")[1])
        R["name_len"] = len(s["name"]); R["note_len_codepoints"] = len(s["note"]); R["href_len"] = len(s["href"])
        R["bad_chars_in_link"] = any(c in text for c in "‮⁦\u0007"); R["arabic_kept"] = "مرحبا" in text; R["note_shortened_with_ellipsis"] = text.rstrip().endswith("…")
        R["wa_prefix"] = s["href"].startswith("https://wa.me/21600000000?text=")
        ways = {}
        for by in ["email", "call", "page", "book", "whatsapp"]:
            await ev(f"() => document.querySelector('#slip input[name=by][value={by}]').click()")
            ways[by] = await ev("() => { const a = document.querySelector('.send'); return { href: a.getAttribute('href').slice(0, 90), target: a.target, k: a.querySelector('.js-send-k').textContent, w: a.querySelector('.js-send-w').textContent, say: a.querySelector('.js-send-say').textContent }; }")
        R["ways_switched_off"] = ways
        # switch ON (this browser only): send from the page, with honeypot and rate limit
        await ev("() => { window.__p23.setSwitch('page', true); document.querySelector('#slip input[name=by][value=page]').click(); }")
        await ev("() => document.querySelector('.send').click()"); await p.wait_for_timeout(800)
        R["page_on_first"] = [len(posts), await ev("() => document.querySelector('.slip__said').textContent")]
        await ev("() => document.querySelector('.send').click()"); await p.wait_for_timeout(500)
        R["page_on_second_within_30s"] = [len(posts), await ev("() => document.querySelector('.slip__said').textContent")]
        await ev("() => { localStorage.removeItem('wm:sent'); window.__p23.send && (document.querySelector('.slip__hp input').value = 'http://spam'); document.querySelector('.send').click(); }"); await p.wait_for_timeout(500)
        R["page_on_honeypot_filled"] = [len(posts), await ev("() => document.querySelector('.slip__said').textContent")]
        R["posted_fields"] = sorted(posts[0].keys()) if posts else []
        R["posted_name_len"] = len(posts[0]["name"]) if posts else None
        # booking ON: slots in the visitor's own time, a slot is needed, then it posts
        await ev("() => { document.querySelector('.slip__hp input').value = ''; localStorage.removeItem('wm:sent'); window.__p23.setSwitch('book', true); document.querySelector('#slip input[name=by][value=book]').click(); }")
        R["slots"] = await ev("() => ({ shown: !document.querySelector('.slip__slots').hidden, days: document.querySelectorAll('.slip__day').length, each: document.querySelectorAll('.slip__day')[0]?.querySelectorAll('input').length, first: document.querySelector('.slip__day-k')?.textContent })")
        await ev("() => document.querySelector('.send').click()"); await p.wait_for_timeout(400)
        R["book_without_slot"] = [len(posts), await ev("() => document.querySelector('.slip__said').textContent")]
        await ev("() => { document.querySelector('.slip__day input').click(); document.querySelector('.send').click(); }"); await p.wait_for_timeout(800)
        R["book_with_slot"] = [len(posts), await ev("() => document.querySelector('.slip__said').textContent"), posts[-1].get("kind") if posts else None, bool(posts[-1].get("slot")) if posts else None]
        await ev("() => { const y = document.querySelector('.slip__sec--by').getBoundingClientRect().top + scrollY - 60; window.__t2.engine.lenis.scrollTo(y, { immediate: true, force: true }); }"); await p.wait_for_timeout(600)
        await p.screenshot(path="tools/shots/p23/guards_booking_on.png", full_page=False)
        print(json.dumps(R, indent=1, ensure_ascii=False))
        await b.close()
with BrowserLock(): asyncio.run(main())
