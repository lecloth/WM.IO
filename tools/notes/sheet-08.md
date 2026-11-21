# Sheet 08 · Contact (builder C, slice 10)

## What I built
- **Entry (p 0 → 1): the title block grows into the work order** (`site/js/sheet08/grow.js`).
  - The page's fixed title block is "selected" like a CAD object: a dashed outline and eight grips just outside it.
  - Its top-left grip is then dragged, with a rubber-band line, until the block fills the drawing frame. The bottom-right
    corner stays anchored, and the title block's own cells stretch with it.
  - Then the cells subdivide into the work order's cells. Every edge of every final cell starts on the nearest line of
    the stretched title block and slides along its axis, so it stays a clean grid all the way.
  - The form appears in the finished cells (0.25 s fade). Lines only move; no text moves.
  - The title block is only read (`getBoundingClientRect`), never written.
- **The work order.**
  - Header "Bring us the problem." plus one line on how sending works.
  - A WO number, today's date and "Drawn by: You".
  - Three fields with real `<label>`s: 01 "What's in the way?" (required), 02 "What do you have today?" (optional),
    03 "How do we reach you?" (optional, email or phone).
  - The live title block, the send row and the direct contact line.
  - On desktop its bottom-right cell IS the page's title block: our right column and bottom row are sized to it. The size
    is measured on a detached copy filled with sheet 08's values, so the form never shifts when the page's title block
    switches.
- **Live title block, all in the browser** (`site/js/sheet08/workorder.js`, no outside service):
  - Project name: the strongest run of consecutive content words, at most three
    ("…can't book appointments online…" → "Book Appointments Online").
  - Work-order number: a stable hash of the words.
  - Disciplines: keyword matching against the 8 disciplines, and it shows the word that matched. With no match it falls
    back to Consulting, "to find the right desk".
  - Sheets: diagnose + one per discipline + hand over.
  - Reply by: Email / Phone or WhatsApp / Where you send from.
- **Send to the board: two buttons.**
  - "Send by email" is a `mailto:` link to `settings.email`. The subject and body are percent-encoded, with CRLF line
    breaks per RFC 6068.
  - "Send on WhatsApp" is `https://wa.me/<digits of settings.whatsapp>?text=…`, opened in a new tab.
  - The hrefs are live links, updated on every keystroke. A click with nothing in field 01 (or a malformed contact
    line) is blocked: the error appears in words, `aria-invalid` is set and focus moves to the field.
  - Nothing is ever sent from the page. After a valid click a status line says what is opening and gives the address to
    write to if nothing opens.
- **Errors and status take the place of the hint / note**, so nothing below them moves (stable for tired people).
- **Settings:** `site/js/settings.js` holds `{ email, whatsapp, location }`. `fillSettings()` writes them into every
  `[data-setting]` slot on the page at load (text and `mailto:` / `wa.me` hrefs). Swapping the placeholders is a one-line
  change.
- **Taller than the screen (phones, short windows):** the stage keeps the chapter contract (100lvh, so sheet 09's
  shrink-into-the-set still works). The sheet inside scrolls by a translate that is 1:1 with the scroll.
  - Sheet 08 sets its own `--units` = 1 + extra height + 1.25 hold, and refreshes ScrollTrigger only when that changes
    (fonts loaded, resize).
- **Desktop scaling:** sizes inside the work order use `--u = min(1rem, 100lvh / 56.25)`, so it fits the frame on 16:9
  screens as well as 16:10 (checked at 1280×720, 1440×900 and 1920×1080).
- **While a field has focus**, the work order is held in its finished state whatever the scroll does.
- `data-lenis-prevent` on the textareas lets them scroll. `scroll-margin` keeps a focused field clear of the fixed
  title block.

## Decisions I made alone
- **Only field 01 is required.** The reply can come back to wherever they send it from, and fewer required fields means
  fewer errors for people on autopilot.
- **The buttons are real links** (`<a href="mailto:…">`, `<a href="https://wa.me/…">`) rather than `window.open` from
  script: long-press, middle-click and copy-link all work.
- **No reply-time promise anywhere.**
- **B&W errors** (a "Check ·" prefix in words plus a 2px border), never colour only.
- **"Drawn by: You"** in the work order's header. The page's title block keeps the discipline rule (Drawn Design ·
  Checked Strategy · Approved Engineering).

## Script test (`formtest.py` in my scratchpad; desktop and 390×844)
- **Empty send:** blocked; error "Tell us what's in the way first. One line is enough."; `aria-invalid="true"`; focus on
  field 01.
- **Typed** "Our clients can't book appointments online & the website is slow. 50% of calls are about bookings?":
  - project "Book Appointments Online", WO-2053, sheets 05;
  - disciplines Websites ("website"), Platforms and web apps ("booking"), Engineering and infrastructure ("slow");
  - reach "hello" → error "Not an email or a phone number yet. Or leave it empty.", Reply by "Check the contact line";
  - reach "+216 22 333 444" → "Phone or WhatsApp".
- **`mailto:`** is `mailto:hello@testing?subject=Work%20order%20WO-2053%3A%20Book%20Appointments%20Online&body=…`.
  It has no raw spaces, CRLF as `%0D%0A`, and `&`, `%`, `?` and new lines all encoded. It decodes back to the exact text.
- **`wa.me`** is `https://wa.me/21600000000?text=…` and decodes back to the same work order.
- **Tab order:** 01 → 02 → 03 → Send by email → Send on WhatsApp → email link → WhatsApp link.
- **Valid click:** the default isn't prevented, and the status line is shown.
- **Direct links:** `mailto:hello@testing`, `https://wa.me/21600000000`; "Studio in Tunis".

## Outside assets
None. Everything is made in code.

## Facts used
None. The disciplines list is from STUDIO_BRIEF Part 2c.

## Checks
- Freeze-frame through the entry and on the form at 1440×900, 1920×1080, 1280×720 and 390×844. No console errors.
- Reduced motion shows the finished form, fully usable. fps: see sheet-07.md (measured across 07 + 08 together).

## Known limits / for the lead
- `main.js` switches the title block and strip to a chapter at `absTop(el) + 0.5·vh`, which is half a viewport AFTER
  the entry ends (p = 1.5 with the new true-vh contract), not half-way through it.
  - So during 08's entry, and up to p 1.5, the page's title block still reads "07 Studio".
  - The work order is sized for the 08 values, so nothing breaks, but `absTop(el) - 0.5·vh` would match the comment
    ("half-way through its entry").
- Sheet 09 runs its accessibility check (axe) during its entry: one 580–700 ms frame while 08 is pinned underneath.
- Reduced motion on mobile: `.s6__door--r` (sheet 06) reaches x ≈ 585 at 390 px wide, which widens the page to about
  417 px. Not in my files.
- The plain http.server drops connections when another builder is testing at the same time. My test scripts retry the
  load.
