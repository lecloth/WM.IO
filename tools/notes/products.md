# Slice 4: concept products (builder P)

Made-up products that show the range of what the studio can build. They are never clients and are always labelled
"Concept sheet". Every screen is drawn in code on a canvas: no outside assets, no logos, only Newsreader and DM Mono.

## Files
- `site/js/products/index.js`: registry. Exports `PRODUCTS`, `PHONES`, `WEBS`, `byId(id)`, `tagLine(p)`,
  `render(p, { scale, accent, canvas })` and `ensureFonts()`.
- `site/js/products/kit.js`: shared drawing kit (palettes, type, hairlines, status bar, header, meters, chips, buttons).
- One file per product: `lofthaul.js` (moved from `sheet01/lofthaul.js`, drawing unchanged), `quaycall.js`,
  `stringwalk.js`, `overwing.js`, `nightwell.js`, `halvane.js`, `wardcast.js`, `quillfield.js`, `fernpay.js`.
- `site/js/products/rotation.js`: `currentPhoneProduct()` and `nextPhoneProduct()`, with the index in localStorage `wm:product`.
  It falls back to memory when storage is blocked, and a fresh visit gets LOFTHAUL.
- `site/dev/products.html`: dev gallery. It draws every product at 1:1, plain and with its accent, with name, kind,
  industry and accent swatch. It takes these query parameters:
  - `?solo=<id>&accent=1` draws one product alone at 1:1 in the top-left corner (web products fill a 1440×900 viewport);
  - `?dpr=2` draws at 2×;
  - `?only=phone|web` filters the list.
- `site/js/sheet01/lofthaul.js`: now a one-line re-export of the products version, so older imports keep working.
- Minimal edits:
  - `site/js/sheet01/phone.js`:
    - `setProduct(product)` redraws the screen texture and the 03 FLOW layer, which now draws the product's own user flow and loop-back.
    - `setScreen({ accent })` draws the current product.
    - `refreshTextures()` uses the current product.
    - The LOFTHAUL path is unchanged.
  - `site/js/sheet01/act.js`:
    - On init it shows `currentPhoneProduct()`, rewrites `#s01-final .read__tag` and updates the canvas `aria-label`.
    - The tag keeps the "Concept sheet" label and the wording "Made up to show the range, not a client."
    - On `loop:wrap` it clears the hover and calls `nextPhoneProduct()`, `phone.setProduct()` and the tag update.

## Product object
`{ id, name, kind, desc, industry, form: 'phone'|'web', accent, w, h, theme, draw(canvas, { accent }), flow? }`
- `draw` fills the whole canvas at any resolution (scale = `canvas.width / w`). The canvas should have the aspect ratio w:h.
- `desc` is the lower-case phrase for running text ("a drone-delivery dispatcher").
- Phones are 390×844. Web products are 1440×900.
- Call `ensureFonts()` before the first draw, then redraw on font load if you draw early.

## The products
| # | Name | What it is | Form | Screen | Accent (hover only) |
|---|---|---|---|---|---|
| 1 | LOFTHAUL | Drone-delivery dispatcher: route arcs over a harbour district, battery and wind per drone, release queue | phone | dark | `#FF5B1F` signal orange |
| 2 | QUAYCALL | Container-port operations: berth plan with ships alongside and cranes working, next-arrival countdown, yard map (blocks A–F, reefer row, staged block), crane queues with a wind hold, tab bar | phone | dark | `#FFC400` crane yellow |
| 3 | STRINGWALK | Solar-farm field app: panel-health heat map (12 rows × 22 modules, soiled band, hotspot, offline modules, cleaning robot), output vs forecast with a cloud dip, robot schedule, "send crew" action | phone | light (made for use in full sun) | `#19A35B` field green |
| 4 | OVERWING | Private-jet charter app: route, departure countdown, top-down cabin seat map (flight deck, galley, club four, divan, lav) with each guest's note, crew | phone | dark | `#D8B98A` champagne |
| 5 | NIGHTWELL | Observatory's telescope-time booking site: live all-sky map (alt-az, generated stars and a band, moon phase, cloud bank, three telescope reticles, tonight's queue path), the night as a timeline, telescopes, the request | web | dark (night use) | `#E5484D` night-vision red |
| 6 | HALVANE | Watchmaker's online shop: exploded-movement configurator (crystal, case, heat-blued hands, open-heart dial, calibre with gear train/balance/jewels/screws, rotor with Geneva stripes, caseback), options, specification, reservation | web | light | `#2B4ACB` heat-blued steel |
| 7 | WARDCAST | Hospital bed-flow command board: KPIs, 8 wards' beds by state, ED queue (patients as codes), next 24 h demand vs staffed beds with the shortfall hatched, a suggested move that waits for the bed manager | web | light | `#0E9F9A` clinical teal |
| 8 | QUILLFIELD | Insurer's AI claims assistant: claims queue, claim with evidence drawings and a cost table, an assistant that cites its sources, a recommendation with checks, and the rule "nothing is paid until a handler approves" | web | light | `#B4236B` plum |
| 9 | FERNPAY | Payments company's live security command board: KPIs, auth attempts per minute with a card-testing burst caught, service map with the attacked surface, incidents, a rule change waiting for a second approver | web | dark | `#C6F432` signal lime |

Each phone also has a `flow` (six steps plus one loop back) for the hero phone's 03 FLOW layer.

## Name checks (WebSearch, 21 Nov 2026)
| Name | Query | Result | Decision |
|---|---|---|---|
| LOFTHAUL | `"Lofthaul" drone delivery` | No company or product by that name; only general drone-delivery material | keep |
| QUAYCALL | `"Quaycall" port container terminal software`; `"Quaycall" OR "QuayCall" app` | Nothing; only unrelated apps (QRCALL, QuickCall, Safe2Call) and terminal operating systems | keep |
| STRINGWALK | `"Stringwalk" solar`; `"Stringwalk" app OR software OR company` | Nothing; only solar string lights and "Strings"/"StringApps" apps | keep |
| OVERWING | `"Overwing" private jet charter`; `"Overwing" aviation company OR app` | Nothing; nearest are the apps OverFlight and OverPilot | keep |
| NIGHTWELL | `"Nightwell" observatory telescope`; `"Nightwell" astronomy OR observatory OR telescope booking` | Nothing | keep |
| Tournel (watchmaker) | `"Tournel" watch watchmaker` | Close to Philippe Tournaire, a real French watch creator | **dropped** |
| Vantelle (watchmaker) | `"Vantelle" watches` | Close to Vontélle, an eyewear brand that sells watches with Timex | **dropped** |
| Arbor & Pallet (watchmaker) | `"Arbor & Pallet" OR "Arbor and Pallet" watch` | Close to Arbor & Pride, a Bristol watch brand | **dropped** |
| HALVANE | `"Halvane" watch OR watches OR horlogerie`; `"Halvane"` | Nothing; nearest watch names are Halchimy, Halda and Vianney Halter, all clearly different | keep |
| WARDCAST | `"Wardcast" hospital bed management`; `"Wardcast"` | Only a game-development podcast; nothing in healthcare | keep |
| Northwake Mutual (insurer) | `"Northwake Mutual" insurance` | Too close to Northwestern Mutual | **dropped** |
| Lanternfield (insurer) | `"Lanternfield" insurance` | Too close to Lantern Insurance (NZ) and Lantern Life (US) | **dropped** |
| Corvane (insurer) | `"Corvane" insurance` | Results all about Corvus Insurance, which reads as the same name | **dropped** |
| Mereline (insurer) | `"Mereline" insurance OR company` | Close to Mereo Insurance, a reinsurer | not used |
| QUILLFIELD | `"Quillfield" insurance OR insurer` | Nothing; nearest is Quility (US life insurance), a different name in a different line | keep |
| FERNPAY | `"Fernpay" payments` | Nothing; nearest is Fergus Pay, a different name | keep |
| Ostrel Field / Avelline Coast (OVERWING's airfields) | `"Ostrel Field" OR "Avelline Coast" OR "Avelline" airport` | Nothing; the first draft's "Northgate Field" was replaced because Northgate is a common real place name | keep |
| ICAO "Q" codes (QOSF, QAVC) | `ICAO airport code prefixes unused letters I J Q X` | Wikipedia "ICAO airport code": Q is reserved for radio communications and non-geographic uses, so no airport has a Q code | keep |

The other names inside the screens are made-up placeholders, not brands:
- ships: Ondine, Harrow Star, Tallis Gray;
- merchant, claim and program codes, ward names, "Field 18" and similar;
- people: guests are "Guest 1–6", crew are "Crew 07/12/21", patients are "ED-0412" and similar, policyholders are numbers.

No real people, companies, logos or places are named. The night sky is generated, not a real sky.

## Decisions I made alone
- **Kept the starting list and added nothing beyond the 9 products asked for.** Each brief item got a product that
  does real work, with one specific moment in it:
  - the crane wind hold;
  - the hotspot plus the crew dispatch;
  - the guest notes on the seat map;
  - the night timeline;
  - the exploded calibre;
  - the shortfall forecast;
  - cited AI answers;
  - the card-testing burst.
- **Human checkpoints are built into the AI and ops products.** These are Wardcast's suggested move, Quillfield's
  recommendation and Fernpay's second approver. They match the studio's AI offer ("with human checkpoints").
- **Light and dark screens are chosen per product, for a reason.** STRINGWALK is light because it is used in full sun.
  NIGHTWELL is dark because it is used at night. The others are dark for 24-hour ops rooms and light for office or
  retail use. On the cyanotype hero, a light screen develops as a blueprint and a dark one as a light negative. Both
  read well (checked).
- **HALVANE's accent is blue (heat-blued steel).** Blued hands and screws are the watch's own heritage colour, and it
  only shows on hover. The site keeps blue for the cyanotype and plate moments, so if the lead thinks this clashes on
  sheet 05, change the one `accent` value and the `A` constant in `halvane.js` (brass `#B98A3E` is the fallback).
- **Rotation only advances on `loop:wrap`.** A reload keeps the current product. I found that `main.js`/`opening.js`
  already emit and listen for `loop:wrap` (title-block reset), so the hook works end to end now.
- **The 03 FLOW layer follows the product.** LOFTHAUL's flow and its "HOLD" loop render exactly as before. The other
  phones have their own flows (e.g. QUAYCALL: CHECK WIND → HOLD back to ASSIGN CRANES).

## Verification
- **Gallery:** solo screenshots of every product, plain and accent, at 1× (web) and 2× (phones), plus the full gallery
  page scrolled. Every label is readable, nothing overflows, the fonts are Newsreader and DM Mono, and there are no
  console errors. Shots are in `tools/shots/p/`.
- **Hero, desktop 1440×900:** the exploded phone at y = 13000 with `--mouse 560,470` hovering the screen. The accent
  shows on hover for LOFTHAUL, QUAYCALL, STRINGWALK and OVERWING. Four emitted `loop:wrap` events cycled
  LOFTHAUL → QUAYCALL → STRINGWALK → OVERWING → LOFTHAUL, and the tag text and `wm:product` updated each time. A
  reload keeps the stored product.
- **Hero, mobile 390×844:** same cycle at y = 11500, no errors.
- **Reduced motion:** no errors.

## Known limits
- Text inside the web screens is 9.5–12 px at 1:1, because they are full desktop UIs. Sheet 05 should show them at
  1:1 or larger, or crop to a region. Small text is fine as texture but should not be relied on for reading.
- The hero phone's screen texture is 780×1688 (2×). The phone products all share 390×844, so `setProduct` never needs
  a resize in practice.
