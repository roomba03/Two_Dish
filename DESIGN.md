# Design system — Two Dish

Home-cooked Hyderabadi food delivery. Warm, grounded, single-neutral surfaces with one amber-gold accent doing all the contrast work. Line art as the identity layer, real photography for anything orderable.

## Colors

| Role | Hex | Notes |
|---|---|---|
| Background/page | `#F3EFE4` | Warm cream. Single neutral used everywhere — nav, cards, checkout, account, admin views. No separate "surface" color. |
| Card/surface border | `#DDD3CC` | 1px hairline border differentiates cards from background — never a different fill color. |
| Primary text/headlines | `#3A2B2E` | Warm plum-charcoal. |
| Secondary text/captions/metadata | `#6B564F` | Warm taupe. |
| Accent (CTAs, links, active/selected states, prices) | `#A9773F` | Warm amber-gold. The only accent color in the system — sparingly, never a large background fill except on primary buttons. |
| Placeholder image blocks | `#D9C9BC` | Warm taupe-rose. |
| Placeholder icon / line art | `#A9773F` | Matches accent, ties placeholders to the identity layer. |
| Error states | muted brick/rust | Warm, not a stock saturated red. |

Never a second accent color anywhere in the app, including admin/dashboard views. Never pure black or pure white. Green is not part of this palette.

## Typography

- Headings (h1–h3), every page: **Cormorant Garamond**, weight 500
- Body copy, nav labels, buttons, form fields, table content: **Karla** or **Work Sans**, weight 400
- Sentence case everywhere — nav items, buttons, form labels, error messages, page titles
- No bold beyond weight 500. No all-caps except tiny eyebrow labels (12px, letter-spacing 0.05em)

## Shape and edges

- Border radius 6–10px on every interactive element: buttons, inputs, cards, modals, dropdowns, toasts, photo/placeholder crops. Never 0, never above 12px
- Inputs and selects use hairline-border treatment (`#DDD3CC`), not heavy boxed borders
- Dividers between sections: 0.5–1px hairlines in the border color, never a hard box border
- No drop shadows anywhere, including modals — use hairline borders for separation, since there's no background/surface color contrast to lean on

## Navigation and structural chrome

- Header/footer stay on the same cream background as the rest of the page, separated only by a hairline border — no contrasting bar color
- Active nav item indicated with amber-gold underline or text color, not a filled pill
- Footer uses the amber-gold line-art motif as a small divider element

## Forms and interactive states

- Buttons: amber-gold fill for primary actions only (one per view), amber-gold outline/ghost style for secondary
- Focus states: visible amber-gold outline ring, never browser-default blue
- Hover states: slight background darken (cream → half-step darker), not a color change
- Disabled elements: warm taupe text/border, never grayed out to the point of looking broken

## Empty, loading, and error states

- Empty states: one line-art icon (amber-gold) plus one sentence in warm taupe
- Loading states: simple, in amber-gold or warm taupe, no clashing colors
- Error messages: plain language, muted-rust text, never a red banner

## Photography

- Every menu/order card uses a real photo of the dish — non-negotiable, people order sight-unseen
- Consistent crop and aspect ratio (e.g. 4:3 or 1:1), 6–10px radius, across every instance — cart, checkout, order history, not just the menu page
- No filters or heavy color grading — natural, true-to-food color. No stock photography.

## Photo placeholders (until real images exist)

- Placeholder block: solid `#D9C9BC`, same aspect ratio and radius as the eventual real photo, so layout doesn't shift on swap-in
- Center a single amber-gold line-art icon inside the placeholder, ideally matched to the dish type (grain icon for biryani, vegetable icon for baghara baingan, etc.) rather than one generic icon repeated everywhere
- No "image coming soon" text, no camera icons, no gray-with-diagonal-lines default
- Build the photo component with an automatic fallback: if no `src` is provided, render the placeholder + icon — don't hand-place placeholder divs per card
- Prioritize having 6–10 dish-appropriate line-art icons ready before writing much component code, since they're doing double duty as identity accents and photo stand-ins

## Line art (identity layer, non-photo contexts)

- Single-color line art, 1–1.2px stroke, no fills, amber-gold (`#A9773F`)
- Used for: section dividers, hero/story content, empty states, order confirmation screens, packaging/email graphics, and photo placeholders
- Never mixed with emoji or filled icon styles

## Layout and spacing

- Minimum 24px between sections, 16px internal card padding, at all breakpoints — reduce columns on mobile rather than compressing spacing
- Ingredient callouts (2–4 words, e.g. "saffron, mint") sit under the dish name, below the photo/placeholder
- Menu/order grids: 3 columns desktop → 2 tablet → 1 mobile, never horizontal scroll to fake more columns

## What to avoid, globally

- No gradients, neon colors, or drop shadows on any page, including admin/internal tools
- No component introducing its own one-off color or radius not covered above
- No mixing of icon styles anywhere in the product
- No second accent color, and no green — this palette was deliberately moved away from a green/terracotta system after testing showed it read as cluttered and clashing
