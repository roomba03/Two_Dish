# Design system: Two Dish

Two Dish delivers home-cooked Hyderabadi food. The design uses one dark violet surface for every page, warm ivory for text, and pale gold as the single accent. Line art carries the brand's identity, and anything you can order is shown with a real photo.

There is one palette, defined as tokens in `app/globals.css`. Earlier experiments with several palettes you could switch between have been retired. See [CHANGELOG.md](CHANGELOG.md) for how the design got here.

## Color tokens

Components never use raw hex values. They use Tailwind classes built from these tokens, such as `bg-sage` or `text-terracotta`. The token names come from an older green/terracotta palette, so read them as **role names**, not color descriptions.

| Token | Role | Value |
|---|---|---|
| `sage` | Page background and card fill. The same surface is used everywhere | `#3A3042` dark violet |
| `deep-leaf` | Primary text | `#FBF6E9` warm ivory |
| `warmgray` | Secondary text, captions, metadata | `#FBF6E9`, deliberately the same ivory |
| `herb` | Hairline borders and dividers | `rgb(251 246 233 / 0.18)`, a translucent ivory |
| `terracotta` | **The one accent.** Used for CTAs, links, prices, active states, line art and all headings | `#FFE19C` pale gold |
| `midsage` | Photo-placeholder blocks, skeletons, subtle tints | `#FBF6E9` |
| `rust` | Errors | `#E2725B` |
| `hover-gold` | Hover color for anything gold or ivory that is interactive | `#DB9D47` |

### Rules

- **Two tones only.** Ivory is for all text and surfaces, and gold is the accent. Don't add a third pale tone: gold next to mint was tried and read as the same off-white at text size.
- **Headings are gold.** `h1`–`h3` use `terracotta` globally. Anything else styled as a title opts in with `text-terracotta`, such as the nav wordmark `.tfb-nav-brand`.
- **Nav links are ivory** and turn `hover-gold` on hover. This includes the outlined "Order online" pill. The wordmark stays gold.
- **Interactive gold gets deeper on hover.** Links and buttons using `bg-`, `text-` or `border-terracotta`, plus `.tfb-btn-primary` and `.tfb-btn-secondary`, move to `hover-gold`. Passive gold such as prices and icons doesn't change on hover.
- **"No meal scheduled" placeholders** (`.tfb-day-placeholder`) use a light yellow `#FFF4DC`. Their calendar icon (`.tfb-day-placeholder-icon`) uses the violet page color, because gold on pale yellow can't be read.
- Use one accent only. Don't add a second accent color or neon colors anywhere, including the cook dashboard.
- Errors appear as `rust` text or inside a `rust/40` hairline box, never as a filled red banner.
- **Faded gold still has to be readable.** Decorative text in translucent gold, such as the large "01 / 02 / 03" process numbers, stays at `terracotta/50` or above. That gives 3.67:1 on the violet page, above the 3:1 minimum for large text. `/40` fails.

## Typography

- Headings (`h1`–`h3`) use **Cormorant Garamond** at weight 500, through `--font-heading` / `font-heading`.
- Everything else uses **Karla** at weight 400 or 500: body text, nav, buttons, forms and tables. It's set through `--font-sans`.
- Only weights 400 and 500 are loaded. Nothing is bolder than 500.
- Use sentence case everywhere, including badges such as the schedule's "Today" tag.
- The only all-caps text is the small eyebrow label `.tfb-eyebrow`: 12px, `0.05em` tracking, weight 500, `warmgray`.
  - Cook-dashboard stat labels ("Total meals", "Revenue", "Capacity") add `.tfb-eyebrow-accent` to turn gold.
  - Don't hand-roll `uppercase tracking-*` anywhere.
- Inputs are 16px, the only size above the 14px UI scale, because iOS Safari zooms in when an input under 16px gets focus.
- Nav links are 14px and grow to 16px on hover (`hover:text-[16px]`).

## Shape and edges

- Radii come from tokens only: `rounded-md` is 6px, `rounded-lg` is 8px and `rounded-xl` is 10px. The default for cards, buttons and inputs is 8px. Never go above 12px.
- There are two exceptions:
  - `rounded-full` is for small circular marks: the cart-count badge, the signed-in status dot and the order-confirmation icon disc.
  - `rounded-none` is for photos that sit flush inside a card whose rounded corners already clip them.
- Borders are 1px hairlines in `herb`. Section dividers use `.tfb-divider`. Don't use heavy boxed borders.

## Elevation

Shadows are pure black at a fairly high opacity, because softer tinted shadows can't be seen on the dark violet background.

- **Cards** (`.tfb-card`, or `.tfb-shadow-card` on hand-built elements) have a hairline border plus `0 1px 2px rgb(0 0 0/.25), 0 6px 20px rgb(0 0 0/.35)`. Always keep both the border and the shadow.
- **Modals** (`.tfb-card[aria-modal="true"]`) use `0 10px 32px rgb(0 0 0/.5)`.
- **Primary buttons** (`.tfb-btn-primary`, or `.tfb-shadow-btn` on hand-built CTAs) are styled like raised keys.
  - At rest, they have a solid `4px 4px 0` edge plus a soft ambient shadow.
  - On hover, the button moves 1px up and left, and the edge grows to 5px.
  - When pressed, the button moves 4px down and right, so the edge disappears into the page.
- **"How it works" process cards** sit flush against each other in a grid with 1px gaps. A hovered card lifts 6px, rounds its corners and gets its own shadow.
- Shadows are never colored and never inset.

## Buttons, links and forms

- **Primary buttons** have a gold fill, page-color text and the raised-key shadow.
- **Secondary buttons** (`.tfb-btn-secondary`) have a gold outline on a transparent background. On hover, both the outline and the text turn `hover-gold`.
- **Text links** are `warmgray` or `terracotta`. Ivory links fade to 70% on hover, and gold links turn `hover-gold`.
- **Inputs** use `.tfb-input` and `.tfb-label`: a hairline border on the page color.
  - On focus, the border turns gold and a 2px gold `focus-visible` ring appears.
  - On error, the border turns `rust`.
  - Disabled and read-only inputs get a taupe wash, `warmgray` text and a not-allowed cursor.
- **Focus rings** are always a 2px gold outline with a 2px offset, never the browser's default blue.
- **Disabled buttons** drop to 50% opacity and lose their shadow.

## Motion and atmosphere

- **Entrances:** `.tfb-rise` fades each element in and moves it up 28px over 0.8s. Delays are staggered with `.tfb-delay-1` through `.tfb-delay-5`. The sticky nav rises when the page loads.
- **Film grain:** a fixed SVG noise layer covers the whole app (`body::before`), blended with `overlay` so it reads as paper grain rather than a flat tint.
- **Ambient glow:** two very faint gold blooms sit behind the homepage (`.tfb-page-glow`, about 4% opacity). They drift slowly toward the cursor, controlled by `PageGlow.tsx`. They only move part of the way toward the cursor, so they feel like ambient light, not like something tracking the mouse. Don't put glows inside cards or forms. Cards get their lift from shadows.
- **Sparkle cursor:** small ivory four-pointed stars follow the mouse across the whole site (`SparkleCursor.tsx`). Each one pops, spins and fades over 650ms, and a new one appears at most every 45ms.
- **Pan loader:** a line-art frying pan with food pieces popping out, drawn in `warmgray` (`PanLoader.tsx`). It loops at the top of the homepage, above the page title.
- All motion driven by the cursor is turned off when the user has `prefers-reduced-motion` set.

## Navigation and structure

- **Customer nav (`HomeNav`):** sticky, `bg-sage/95` with backdrop blur and a hairline border underneath, on the same background as the page.
  - It contains the gold serif wordmark "Two Dish Catering Services", the auth links, "Delivery area", an outlined "Order online" pill and the cart icon.
  - Below the `md` breakpoint it collapses into a hamburger menu.
- **Which nav each area uses:**
  - The homepage, menu, cart, checkout and auth pages use `HomeNav`.
  - The signed-in account area uses `AccountNav`.
  - The cook dashboard uses `DashboardNav`.
- **Homepage order, top to bottom:**
  1. Nav
  2. Pan loader, then the page's `h1` ("Two Dish Catering Services") and the offer copy
  3. Delivery-area checker
  4. "Coming up" (the next 3 days)
  5. "The process"
  6. Final call to action
  7. Footer
- **Footer:** the wordmark in `warmgray` and one line-art icon in gold.
- **Page structure for accessibility:**
  - Every page has exactly one `h1` and wraps its content (everything between the nav and the footer) in `<main>`.
  - Heading levels never skip. On the menu, dish names are `h2` because they sit directly under the page `h1`.
  - Visual size comes from classes, not from the heading level.

## Photography and placeholders

- Every dish you can order shows a real photo (`DishImage`). Photos use the same **4:3** crop everywhere, with no filters and no stock photography.
- If a dish has no photo, or the photo fails to load, `DishImage` automatically shows a `midsage` block with a gold line-art icon matched to the dish name (`getDishIcon`). Don't use "coming soon" text or camera icons.
- Line art is drawn in one color with a 1.15px stroke and no fills (`app/components/icons/DishIcons.tsx`). Don't mix it with emoji or filled icon styles.

## Layout and spacing

- Page content uses `max-w-7xl` with `px-6`. Checkout and account pages are narrower (`max-w-5xl`), and auth and cart cards are `max-w-sm`.
- Homepage sections use `py-20`. Cards have at least 16px of padding inside. Keep at least 24px between sections at every screen size.
- Grids go from 3 columns on desktop to 2 on tablet (the menu) to 1 on mobile. On small screens, drop columns rather than squeeze the spacing. Never use horizontal scrolling to fit in extra columns.
- Order-history status badges come in three styles:
  - Outline: waiting or cancelled.
  - Solid accent: being prepared.
  - Solid primary: delivered.

## Known gaps (code that doesn't follow this doc yet)

- The Leaflet maps (delivery checker and zone editor) draw the zone in `#280004` maroon, left over from the retired light palette. Leaflet can't read CSS variables, and the map tiles are light, so it's still readable, but it isn't a token color.
- The taupe wash on disabled inputs (`rgb(217 201 188 / 0.35)`) is also left over from the light palette.
