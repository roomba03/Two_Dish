# Two Dish

Two Dish is an ordering site for a small home catering kitchen that cooks Hyderabadi food. The kitchen makes one dish per day, and customers order it by 11:59 PM the night before for evening delivery.

Built with Next.js 16 (App Router), React 19, Tailwind CSS 4 and Supabase, which provides Postgres, auth and storage.

> **Note for AI agents:** this Next.js version differs from older ones. Read the relevant guide in `node_modules/next/dist/docs/` before changing framework code (see `AGENTS.md`).

## Getting started

```bash
npm install
npm run dev     # starts next dev and opens the site in your browser
npm run build   # production build
npm run lint
```

Create `.env.local` with these variables:

| Variable | Used for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | The Supabase project URL |
| `SUPABASE_ANON_KEY` | Checking sign-ins and session tokens |
| `SUPABASE_SERVICE_ROLE_KEY` | Reading and writing data on the server. Never expose this key to the browser |

### Database setup

Run these files in the Supabase SQL Editor, in this order:

1. `supabase/schema.sql` creates the base tables and enums and adds the single kitchen row
2. `supabase/add_delivery_zone.sql` adds the `kitchens.delivery_zone` polygon
3. `supabase/add_profile_address.sql` adds the saved delivery address to `profiles`
4. `supabase/atomic_place_order.sql` adds the `place_order` function, which checkout uses to reserve a spot atomically

Then:

- Create a **public** Storage bucket named `dish-images` for dish photos uploaded from the cook dashboard.
- **Create a cook account.** Signing up on the site always makes a customer. To make someone a cook, create their user in Supabase Auth and set `role` to `cook` (or `admin`) on their row in `profiles`.

## How ordering works

- **One dish per day.** Cooks add a dish to a date in the schedule, and each date has a maximum number of meals.
- **Order cutoff.** Orders for tomorrow close at 11:59 PM tonight, Central time (`America/Chicago`). Same-day orders aren't allowed.
- **One delivery day per order.** The cart holds one dish for one day, and a customer can order up to 15 meals.
- **Time slots.** Delivery is at 6:30 PM or 7:30 PM. Each slot fills up once it reaches half of that day's maximum.
- **Delivery zone.** The cook draws the zone as a polygon on a map. Customer addresses are located with OpenStreetMap's Nominatim service and checked against the polygon. If an address can't be located, or no polygon has been drawn yet, the kitchen's list of ZIP codes is used instead.
- **Payment is mocked.** Checkout stores a placeholder payment ID. The Stripe packages are installed, but nothing uses them yet.

## Project layout

| Path | What's there |
|---|---|
| `app/page.tsx`, `app/menu`, `app/cart`, `app/order` | The customer ordering flow |
| `app/(customer)/account` | Customer sign-up, sign-in, saved address and order history |
| `app/(auth)/cook` | Cook login, plus the `(dashboard)` pages: production board, ingredients, menu, schedule and delivery zone |
| `app/components` | Shared UI: navs, dish cards, the delivery checker, the cart context, and animation (`PanLoader`, `PageGlow`, `SparkleCursor`) |
| `app/globals.css` | Design tokens and shared `tfb-*` component classes |
| `lib/actions` | Server actions: auth, checkout, menu and schedule, delivery zone |
| `lib/data` | Server-side data reads |
| `lib/cookSession.ts` | Checks the cook session (valid token and cook/admin role) |
| `proxy.ts` | Sends visitors with no session cookie to the right login page |
| `supabase/` | SQL to run in the Supabase SQL Editor |

### Auth

Sessions are Supabase access tokens stored in the httpOnly cookies `cook-session` and `customer-session`. `proxy.ts` only checks that a cookie exists. The real check happens on the server:

- Every cook-only data read and server action calls `lib/cookSession.ts`.
- Customer data goes through `getCustomerUserId` in `lib/data/account.ts`, which confirms the token with Supabase.
- Server actions can be called directly as public endpoints. Any new cook-only action must check the session itself.

## Design

- [`DESIGN.md`](DESIGN.md) is the design system: the "Midnight Violet" palette tokens, typography, elevation, motion and layout rules.
- [`CHANGELOG.md`](CHANGELOG.md) is the design history: each major visual change and why it was made.

Update both whenever you make a significant design change.
