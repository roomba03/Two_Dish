# Design changelog

This file covers the major design iterations of Two Dish: what changed, and why. It records visual and UX direction only; code history lives in `git log`. Newest entries come first.

Each entry's "Why" comes from the commit messages and from DESIGN.md as it read at that point. Where the reasoning was never written down, the entry says so rather than guessing.

---

## 2026-09-27: One palette. Versions retired

**What changed**

- Deleted the runtime version switcher and the dormant palettes, version 0 (light) and version 8 ("Parchment & Moss"). "Midnight Violet" is now simply *the* design: its values are the base tokens in `globals.css`.
- Removed the features only the retired versions used:
  - the full-bleed tacos hero photo
  - the full-screen intro splash
  - the side-by-side "What we offer" + delivery checker layout
  - a highlighted middle "process" card
  - a separate light-mode grain texture
- The homepage now renders in plain source order. Before, it relied on CSS `order` tricks and blocks hidden per version.
- Polished leftover inconsistencies:
  - `/menu` now uses the shared nav.
  - Menu cards now have the standard card shadow.
  - The one homepage CTA that was missing the raised-button shadow now has it.
  - The gold calendar icon on the pale-yellow "no meal scheduled" block, which was nearly invisible, is now violet.
- `globals.css` went from about 750 lines to about 460.

**Why**

- Version 9 had been the only version visitors could reach since Aug 19, so the others were dead weight.
- Keeping three palettes meant every style change needed per-version overrides. It also meant the markup rendered sections that were then hidden. Both made the code harder to reason about.

---

## 2026-08-23: Midnight Violet goes down to two tones

**What changed**

- Version 9 originally ran three near-identical pale tones: gold was used for both primary text and the accent, and mint for secondary text and surfaces.
- It now uses two: ivory `#FBF6E9` for all text and surfaces, and gold `#FFE19C` kept for the accent.
- Every heading (`h1`–`h3`) is gold. The nav wordmark was pulled out of the uniform nav-link color so it reads as a title, and this was applied to the customer, account and cook navs alike.

**Why**

- Gold and mint were so close in lightness that they read as the same off-white at text size. The hierarchy looked arbitrary: you couldn't tell which text mattered.
- With two clearly different tones, gold now *means* something: a title, or something you can click.

Around the same time (Aug 23), the delivery-zone reminder banners were switched from raw Tailwind amber to design tokens. The raw amber would have shown up as a mismatched light box on the dark theme. Order-history status badges were also split into three visually distinct tiers, instead of every status sharing one muted style.

---

## 2026-08-19 → 08-21: Midnight Violet becomes the default, and gets atmosphere

**What changed**

- **Aug 19:** Versions 0 and 8 were disabled and version 9 became what every visitor sees. That was described as "for now" at the time and was made permanent on Sep 27.
- **Aug 19:** Added a very faint ambient gold glow behind the whole homepage.
- **Aug 20:** The glow's two blooms now drift slowly toward the cursor, with a limit on how far they move.
- **Aug 20:** The "no meal scheduled" placeholders changed from pale green to light yellow.
- **Aug 21:** A spacing pass standardized section padding, eyebrow and heading margins, and CTA padding across the homepage.

**Why**

- **Moving glow:** blooms that only lean part of the way toward the cursor, each at its own slow speed, read as two separate light sources, not as a visible cursor tracker. The opacity was also turned down for subtlety.
- **Yellow placeholders:** the green placeholder clashed with the violet palette. The yellow was given its own class so the shared `midsage` token, which many unrelated parts of the UI use, didn't have to change.
- **Spacing pass:** sections and buttons that shared the same visual pattern had drifted to different values.

---

## 2026-08-15: Versions, and the move to elevation

**What changed**

- Added a runtime "version" switcher, where pressing 0, 8 or 9 swaps the palette, to test whole-site palettes side by side:
  - **Version 0:** the base palette, changed at the same time to a warm off-white `#FAF8F2` page with a single deep-maroon `#280004` accent, replacing the amber-gold.
  - **Version 8, "Parchment & Moss":** parchment page, forest-ink text, burnt-sienna accent, and a linen surface for cards.
  - **Version 9, "Midnight Violet":** dark violet page with gold and mint text. This was the first dark palette.
- **Drop shadows became allowed.** DESIGN.md had said "no drop shadows anywhere" because every surface was the same color. It now allowed soft, warm-toned elevation shadows, with the hairline border kept alongside them.
- Primary buttons gained the raised-key look: a solid offset edge that disappears when pressed.
- The "how it works" cards gained a hover lift.
- Version 9 gained the sparkle cursor.

**Why**

- The single-surface rule, where cards use the same color as the page, left cards and buttons feeling flat. A hairline border alone didn't separate them enough, so elevation was brought in as a controlled exception with a fixed shadow spec.
- The rest of the reasoning, such as why maroon replaced amber and why these three palettes were picked, wasn't recorded. The switcher itself shows the intent: compare full palettes on the real site instead of in isolation.

---

## 2026-08-11 → 08-12: The homepage becomes a real landing page

**What changed**

- **Branding and nav:**
  - The branding changed to "Two Dish Catering Services".
  - "Order now" became "Order online".
  - A "Delivery area" nav link was added.
  - The same nav was reused across cart and checkout, where there had been one-off minimal headers.
- **Hero and offer:**
  - A full-bleed tacos photo replaced the tomorrow's-dish hero.
  - A "What we offer" section was added, with the delivery checker embedded beside it.
- **Loader:** the text intro splash was replaced by the looping **pan-flip loader** (`PanLoader`).
- **Cart:** a hover-to-add-to-cart action was added to the preview cards.
- **Mobile pass:**
  - Inputs are 16px so iOS doesn't zoom in on focus.
  - Icon-only buttons got larger touch targets.
  - Tables scroll instead of being cut off.

**Why**

- A shared nav gives the whole purchase flow one consistent frame.
- The mobile changes fix concrete problems found on phones.

---

## 2026-07-14 → 08-08: Full-bleed hero, intro splash, sanctioned glow

**What changed**

- **Jul 14:**
  - The homepage hero filled the viewport, and tomorrow's dish photo stretched edge to edge instead of sitting in a bordered card.
  - An intro splash ("Welcome to Two Dish / We serve one dish a day.") played on load and slid up to reveal the page. It used a taupe-brown backdrop, film grain and a new **glow accent**.
- **Aug 8:**
  - Added a responsive mobile nav.
  - Added a "Coming up" preview of the next 3 days.
  - Tightened section spacing.

**Why**

- DESIGN.md banned gradients, so the glow needed an explicit exception. It was limited to hero and splash moments, amber-gold only, at low opacity, with at most two blooms placed off-center. The aim was for glows to feel like ambient light, not decoration.

---

## 2026-07-13: Green out, warm cream and amber-gold in

**What changed**

- Replaced the sage-green palette with a warm cream page `#F3EFE4`, plum-charcoal text `#3A2B2E` and a single **amber-gold accent** `#A9773F`.
- DESIGN.md was rewritten around "one amber-gold accent doing all the contrast work" and stated that "green is not part of this palette."
- The token names (`sage`, `herb`, `terracotta`…) were kept, which is why they no longer describe their colors.

**Why**

- DESIGN.md recorded it directly: the green/terracotta system was abandoned "after testing showed it read as cluttered and clashing."
- One warm neutral with one accent was meant to feel calmer and more grounded.

---

## 2026-07-07: The first real design system

**What changed**

- Replaced the create-next-app defaults with a defined system:
  - soft sage page `#EAF3DE`
  - deep-leaf green text
  - herb-green secondary color
  - terracotta accent `#D97C4A`
  - **Cormorant Garamond** headings and **Karla** body text, which are still in use today
  - 6–10px radii everywhere
  - hairline borders **instead of shadows**
- Added the line-art dish icon set and the `DishImage` component, which falls back to a placeholder automatically.
- Applied it to every page, including the cook dashboard. This removed stray reds, greens and ambers, monospace labels, pill buttons and drop shadows.

**Why**

- Before this, the app had mixed typography and one-off colors. The goal was one system with one accent color, used sparingly.
- The placeholder component means every dish card (menu, spotlight, cart) looks consistent before real photos exist, and callers don't each build their own placeholder.

---

## 2026-06-18: Starting point

The initial app used the create-next-app scaffold with a warm cream background (`#FDF8F2`), near-black text, Geist and Arial fonts, and a few homepage entrance animations (`tfb-rise`). Those animations are the only visual element from this era still in use.
