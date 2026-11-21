# STUDIO_BRIEF.md: Wajih Mansouri studio site (local experiment)

21 Nov 2026. Parts 1–2 are Wajih's. Part 3 is the chief-engineer Claude chat's creative direction (Wajih handed it
the taste call this time). Part 4 is the hard rules.

---

## Part 1: Wajih's original brief (verbatim)

You're designing and building the website for my studio. Read everything below first. Then, before you build anything, ask me questions until you know me well enough to make this site feel like mine.

=== WHO I AM ===
- Wajih Mansouri. Tunisian, based in Tunis. I speak English, French and Tunisian Arabic.
- 7 years as Emirates cabin crew, based in Dubai (2019–2026). I left in July 2026 and moved back to Tunis.
- I founded and run Midnight Club, a café, snooker and events venue in l'Aouina, Tunis. I work the bar myself.
- I build software for businesses. Builds so far:
  - websites, including one for a clearance company in Italy and one for an advisory firm in Dubai;
  - an online sticker shop (order online, pick up in store);
  - an Android business-management app for a café-supplies distributor;
  - apps for a fabric factory owner and a real estate agency owner;
  - a point-of-sale system for my own café;
  - a car-rental marketplace (app plus website) launching in Dubai and Tunis.
- Self-taught: CS50 and the fundamentals. I build through my own workflow with AI coding tools.
- My effort goes into the problem, the workflow, the user experience and rigorous testing. Testing takes most of a build, and I test the feel by hand as the final barrier. I design for real people on autopilot: rushed, tired, tapping twice.
- My real speciality is finding the problem and solving it, whatever the tech. My past builds are results, not my niche. Don't box me into one industry.
- Clients I like most, in order: founders with an idea, small shop owners, agencies passing me work, growing companies.
- The parts I enjoy most, in order: figuring out the problem, designing how it works, testing, handing over.
- I love cryptography and software protection (app signing, locking an app to a company's devices). Happy to show that side.
- The goal is to grow into a small studio that companies hand their tech work to. So the site speaks as "we", but never invent team members.

=== WHAT THE SITE MUST DO ===
- Studio name = my full name: Wajih Mansouri.
- Who sees it first: people referred to me by a friend in Dubai who sends me clients. After that: businesses in Europe, the US, Canada and the Gulf. English first; French and Arabic later.
- Services I offer: websites, online shops, business management apps, monthly care (updates, fixes, backups), plus a door for anything else ("Another problem? Tell us"). Behind those, quieter, the wider range: marketplaces, products for founders, point-of-sale systems, automations, app protection, internal tools.
- No prices on the site. Every project is quoted on a call. For clients abroad I price upper-middle, so the site has to look like it earns that.
- The site itself is the proof: "we did this for ourselves, we can do it for you". It must still never lose a visitor on why they came.
- Every claim must be true and grounded. Nothing inflated, nothing that reads like a bot wrote it.
- Hosting: I usually deploy on EdgeOne Pages by drag and drop, so plan for a static build (HTML, CSS, JS) unless you have a better reason. Confirm with me.

=== THE VIBE (set) ===
- Reference: santalarch.com. Minimal, near-monochrome, numbered sections, short confident copy, and the page moves and reacts as you scroll. Take that spirit and aim it at what I build.
- Background: drafting paper. Fine grid lines and threads like real drafting film, monochrome (not the blue cliché). It moves and reacts to scroll and cursor, like the reference.
- Readability and visibility come first, always. The background steps back wherever there's text. Text contrast is at least WCAG AA, in both a dark and a light version.
- Visuals: 3D renders of engineered phones and websites, as if on an engineer's drawing board: dimension lines, numbered callouts, section cuts, exploded views.
- No AI look: no navy-to-violet glows, no neon gradients, no glossy stock phones, no code-on-screen clichés. Unique without looking alien.
- Respect reduced motion: drawings show their finished state, nothing moves with the scroll.

=== YOUR FREEDOM ===
You know this work better than I do. The vibe above is fixed; everything else is your call. Browse the web freely for references, techniques, libraries, fonts, textures, 3D assets and render approaches that make the result better. Tell me in one line what you used and why. Challenge anything in the draft below if you have a better idea; just say it's your idea, not mine.

=== DRAFT PITCH (written with Claude in another chat: a starting direction, not my words, not a spec) ===
Big idea: the site is one engineering drawing set, sheets 00 to 09 on a drafting board. Every phone is drawn, measured, then switched on.
Brand line: "Drawn to the millimetre. Felt in a second." Short line: "Engineered, not decorated."

Signature moves:
1. A real engineering title block in each section's corner that updates on scroll (e.g. SHEET 03/09 · WORK · SCALE 1:1 · DRAWN W.M. · REV 11.26).
2. The hero phone starts as a line drawing, fills into a matte 3D render, then explodes into labelled layers on scroll: Glass, Interface, Flow, Logic, Data, Lock.
3. Colour belongs to the client: the site is black, white and grey; the only colour is client work, revealed on hover.
4. The footer is this site's own spec sheet (page weight, load time, performance and accessibility scores, fonts, trackers), measured from the live site, never estimated.

Sheets:
00 Opening: "We draw it before we build it." Line: "Websites, shops and business apps, engineered to the millimetre, tested until nothing breaks, and handed over ready to run." Buttons: Start a project / See the sheets. Cue: "Scroll to assemble".
01 Principles: Exact (every screen drawn and measured before code), Felt (people don't read software, they feel it; every tap tested by hand), Proven (most of a build is testing; we break it before your customers can).
02 Method: Problem before pixels. Flow before form. Built for autopilot ("the tired Tuesday, not the perfect demo"). Handed over clean (you own the code, accounts, keys, notes).
03 Work: "Sheets from the set." Projects as drawing sheets with title blocks; hover shows the live screen in the client's colours.
04 Services: Websites ("A front door that never closes."), Online shops ("Your shop, in every pocket."), Business apps ("The whole business on one screen."), Monthly care ("We stay after launch."), Another problem? ("Bring us the problem, not the solution.").
05 Also on the board: marketplaces, products for founders, POS systems, automations, app protection, internal tools. "Not on the list? It probably fits on the board."
06 Process, "From sheet to screen": Diagnose, Draw, Build, Break, Hand over, Care. Each one says what the client gets.
07 Studio: "One name on the door." Founder card: cabin crew years sharpened an obsession with processes that hold up when everyone is tired; now runs a café in Tunis and builds the software it runs on.
08 Contact: "Bring us the problem." The form is a work order: What's in the way? / What do you have today? / How do we reach you? Button: "Send to the board".
09 Colophon: the spec sheet, "This site is our first case study. Every number above is measured, not claimed." Footer: © 2026 Wajih Mansouri · Drawn and built in Tunis.
Starting palette: board #0E0E0E, ink #F2F0EB, graphite #8C8B86 (dark); paper #F2F0EB, ink #121212, graphite #6B6A66 (light). Starting type: Archivo (Expanded for headlines) plus IBM Plex Mono for labels. Change any of it if you find better.

=== HOW TO WORK WITH ME ===
- Ask before you generate anything. First understand the task and agree on it with me, then build.
- I can't describe a look in words. Show me 2–3 distinct options side by side and I'll point. Do this for the hero and one section before building the full site.
- Ask questions in small batches (3 at most). Give each one options and your recommendation, and say why it's best.
- Talk like a smart friend: direct, short explanation first, then the answer. Tell me plainly when my idea has a flaw or there's a better path. No walls of text.
- One instruction per message. Wait for my result before the next step.
- Every time you deliver something, end with exactly what I do with it (which file to save, where to deploy, how).

=== QUESTIONS TO ASK ME (at least these, plus anything that makes it more mine) ===
- My contact email and WhatsApp number.
- Which projects I can show, whether I have screenshots, and whether client names are allowed.
- Whether every line of the founder card is true as written.
- Whether to show Dubai as a location.
- A portrait or no portrait (and if yes, photo or line drawing).
- The domain I'll use.
- Whether I can promise "we reply within one working day".
- What I'm proudest of in my work, what annoys me in other studios' sites, and the sites I love outside this reference.
---

## Part 2: Wajih's updates (21 Nov 2026). These override Part 1 where they differ.

- **Local only.** The site stays on Wajih's computer as an experiment to see if his ideas work. No hosting and no
  deploy for now (ignore the EdgeOne lines in Part 1).
- **Merge every look gracefully, not one theme:**
  - santalarch's spirit and motion;
  - old patent drawings: super-accurate thin lines, numbered figures, "Fig. 691";
  - blueprint blue and white;
  - black and white;
  - Da Vinci notebook sketches;
  - ~~the classic cartoon blueprint look~~ (dropped in Part 2b: chalk and hand-drawn lines read cheap and cartoony).

  Readability and high technical prowess come first; the story must keep the reader hooked.
- **Keep the moves he loved on santalarch, reinvented:**
  - the line that closes and then opens like a curtain, changing colour as it goes;
  - the beautiful curtain at the start;
  - black/white inversion as things pass;
  - an intro that holds you for one line;
  - heavy smooth scroll;
  - sticky scenes that hold while things change;
  - the timeline strip at the top that loads with the page, names the site's sections and fills as you scroll.
- **The site starts from a singularity** and opens up into something more interesting the further you scroll. The
  emotion and motion keep changing so the reader stays hooked.
- **Phones and websites pulled apart in 3D** (exploded views).
- **Borrow techniques** from santalarch or anywhere else. Browse the web freely for references, techniques,
  libraries, fonts, textures and 3D assets.

---

## Part 2b: Wajih's decisions (21 Nov 2026, evening). These override Parts 1, 2 and 3 where they differ.

- **Chalk is out.** Hand-drawn chalk, line boil and the cartoon blueprint look read cheap, unprofessional and
  cartoony. The site is sharp, edgy and precise.
- **Line language:** CAD precision hairlines + patent "Fig." plates.
- **3D look:** matte models with hairline edges.
- **Old drawings:** early telephone patents (Bell/Edison era) + Da Vinci machine studies.
- **Answers to your 3 questions:**
  1. What the curtain opens onto → **B**: black and white first; blue arrives later as a cyanotype when the hero
     phone pulls apart. No chalk anywhere.
  2. The hero phone → **none of A/B/C: made-up products only.** Never Wajih's existing builds (no POS, no
     car-rental app, nothing he has already made). Show what he *can* build, not what he has built, so past work
     never limits the aesthetic. Go crazy: ambitious, high-tech, across industries. This applies to every showcased
     piece: the hero phone, the website pulled apart, and the 03 Work sheets.
  3. Opening length → **B**: about 2.5 s on the first visit, skippable, near-instant on return.
- **Assets Wajih supplies: none.** You source everything (public domain or open licence, logged in `CREDITS.md`)
  or build it in code.

### The made-up products (the Claude chat's starting list; invent better ones if you can, keep the industry spread)

Phones (the hero phone rotates: each time the page loops back to the singularity, it reassembles as the next one):
- A drone-delivery dispatcher: live route arcs over a city, battery and wind per drone.
- A container-port operations app: crane queues, ship berth countdowns, yard map.
- A solar-farm field app: panel-health heat map, output curve, cleaning-robot schedule.
- A private-jet charter app: live cabin seat map, crew, departure countdown.

Websites and web apps (the website pulled apart, and the 03 Work sheets):
- An observatory's telescope-time booking site with a live sky map (website).
- A watchmaker's online shop with an exploded-movement configurator (online shop).
- A hospital bed-flow command board (business app).

Rules for them:
- Every brand name is invented. Web-search each name and drop any that a real company uses in that industry. No
  real logos or trademarks.
- Each one is designed for real: screens that would hold up as a genuine product, real-looking data, no lorem ipsum.
- Screens show in the site's black and white; each fictional client's own colour appears on hover (Part 1, move 3).
- In the Work section they are labelled honestly as concept builds (e.g. "Concept sheet"), never as past clients.

---

## Part 3: Creative direction (the Claude chat's taste call, rewritten 21 Nov evening to match Part 2b; challenge it if you have better)

### The thread: one line

A single hairline is the site's spine.
- It is born from the singularity.
- At every chapter change it closes, collapsing the old view into a line, then opens, a curtain revealing the next
  medium.
- It uses the difference blend, so anything it passes flips black/white.
- The same element appears at the start and the end, so the whole site reads as one continuous drawing.

### The opening (the singularity)

1. A black screen, with one white point at the centre breathing faintly while the page really loads.
2. The top timeline strip draws itself hairline by hairline with the real load progress: sheet numbers and section
   names appear one by one.
3. The point stretches into a horizontal hairline with ruler ticks counting outwards (SCALE 1:1).
4. The line opens vertically like a curtain onto the drawing board (black and white). Text crossing the curtain
   inverts.
5. One line to read holds you: "We draw it before we build it."
6. Scroll unlocks, with the cue "Scroll to assemble".

Timing: about 2.5 s from point to scroll unlocking on the first visit (longer only if the page genuinely hasn't
loaded yet). Any click, key or scroll skips it. On a return visit it plays near-instantly (well under a second).

### Four layers, each with a job

- **CAD precision = everything that moves.**
  - Modern engineering-drawing hairlines: dimension lines with arrowheads and live numbers, section cuts with
    hatching, centre lines, numbered callouts, small mono labels.
  - Lines draw on with exact stroke animation and land exactly on the grid. No wobble, no line boil, nothing that
    looks hand-drawn.
  - This is the site's default voice: black and white, sharp, precise.
- **Patent plates = the feature moments.**
  - Public-domain telephone patent drawings from the Bell and Edison era (1870s–80s), with their "Fig. 1" labels and
    engraved hatching, shown as full plates at key moments.
  - The story: from the first telephone ever drawn to the phones built today. Suggested signature moment: an
    1870s telephone figure redraws itself, line by line, into the modern hero phone's outline.
- **Matte 3D with hairline edges = the hero objects.**
  - Phones and websites as matte white/graphite parts with razor-thin outline edges, like a product engineer's
    render. No glass reflections, no glossy stock look.
  - Line drawing → matte fill → explode into labelled layers on scroll: Glass, Interface, Flow, Logic, Data, Lock.
- **Da Vinci studies = the margins.**
  - Public-domain machine studies (gears, mechanisms, flying machines) for the idea and problem moments. Never
    behind text.
  - Rendered in the site's ink; sepia only if it earns its place (show it side by side).
- **Black & white paper = the reading surface.** All body text sits on clean sheets at WCAG AA or better.

### Colour: black and white first, blue as the reward

- The site runs black and white. Blue arrives once, as a real cyanotype: the way actual blueprints were made,
  Prussian blue with white lines developing across the sheet.
- It happens when the hero phone pulls apart; after that, blue returns only for patent-plate moments. Never a blue
  default background.
- Fictional client colour appears on hover only (Part 2b).

### The process is a mechanism, not a cartoon

- Diagnose → Draw → Build → Break → Hand over → Care is one precise machine drawing (Da Vinci gear train meets
  patent plate) whose stages engage like gears as you scroll.
- "Break" is an engineering stress test, not slapstick: a part is loaded in a section view, a stress readout climbs,
  a crack line propagates, then the fixed part holds.

### Transitions are real drafting moves

- Tracing paper sliding over a sketch.
- A sheet developing from white to cyanotype blue (once, at the hero).
- The line closing and opening.
- Sheets passing over the board with black/white inversion.
- Dimension lines measuring the next section before it appears.

### The emotional arc down the page

| Stage | Where |
| :--- | :--- |
| Curiosity | the singularity |
| Awe | the patent figure redrawing into the hero phone, which pulls apart as the cyanotype develops |
| Understanding | principles and method on paper, with Da Vinci margins |
| Delight | the process mechanism engages; the stress test on "Break" |
| Trust | the work sheets and the studio card |
| Action | the work-order form |
| Closure | the spec sheet |

At the very end the line closes back into the point and the page loops to the singularity.

### Craft notes

- **Hairlines that stay crisp at any zoom:** SVG with non-scaling strokes; in Three.js, edge lines (LineSegments2).
- **Phones and websites:** parametric Three.js models built in code (no downloaded models), so every part separates
  cleanly and the screens can rotate between the made-up products.
- **Fonts:** open licences only, logged in `CREDITS.md`. Show Wajih 3 pairings side by side on port 8108; he points.
  Avoid fonts that read as AI-template defaults (e.g. Inter, Space Grotesk).
- **Public-domain sources:** Google Patents for the 19th-century telephone patent drawings, Wikimedia Commons for
  Da Vinci scans.
- **Reduced motion:** every drawing shows its finished state; nothing scrubs with scroll.

---

## Part 4: Hard rules

1. **Project folder:** `C:\wajih-mansouri-studio`.
   - From the santalarch clone you may carry over only your own generic engine code (smooth scroll setup,
     scroll-scene helpers, cursor, preloader timing). List every carried file in `ENGINE_REUSE.md`.
   - Never any santalarch asset, image, font, video, model, text, wordmark or scene.
2. **No cartoon characters, ever.** No Tom & Jerry or any other studio's characters, and no film frames used as
   assets. Draw the style new.
3. **`CREDITS.md`** logs every outside asset: source, licence, where it is used.
4. **Serve locally on port 8108 only.** Never 8000, 8100–8102 or 8105–8107.
5. **`STATE.md`** holds decisions made, options Wajih picked, and what is done and next. Keep it current so the work
   survives context compaction or a new session.
6. **Working with Wajih:**
   - Ask questions in batches of at most 3, each with options and your recommendation.
   - Show 2–3 options side by side for visual calls; he points.
   - One instruction per message.
   - Anything he must do goes in one block at the very bottom.
