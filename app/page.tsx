import { Fraunces, DM_Sans } from "next/font/google";
import Link from "next/link";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
  variable: "--font-fraunces",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-dm-sans",
});

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  cream: "#FDF8F2",
  ink: "#1C1008",
  rust: "#C4622D",
  sand: "#F0E6D8",
  border: "#E5D4C0",
  muted: "#9B7E6A",
  dim: "#C4A992",
  darkCard: "#231409",
  darkBorder: "rgba(255,248,242,0.07)",
} as const;

// ── Arrow icon ────────────────────────────────────────────────────────────────

function ArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path
        d="M2 7.5h11M9 3.5l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div
      className={`${fraunces.variable} ${dmSans.variable}`}
      style={{ background: C.cream, color: C.ink, overflowX: "hidden" }}
    >
      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav
        className="tfb-rise"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: `1px solid ${C.border}`,
          background: `${C.cream}e8`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 1.5rem",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: "1.1875rem",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              color: C.ink,
            }}
          >
            Two Dish
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
            <Link
              href="/cook/login"
              className="transition-opacity hover:opacity-60"
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: C.muted,
                textDecoration: "none",
              }}
            >
              Staff Login
            </Link>
            <Link
              href="/account/signup"
              className="transition-opacity hover:opacity-60"
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: C.muted,
                textDecoration: "none",
              }}
            >
              Sign Up
            </Link>
            <Link
              href="/menu"
              className="transition-opacity hover:opacity-80"
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: C.cream,
                background: C.ink,
                padding: "0.5625rem 1.25rem",
                borderRadius: "999px",
                textDecoration: "none",
                letterSpacing: "0.01em",
              }}
            >
              Order Now
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Ambient light */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `
              radial-gradient(ellipse 65% 55% at 78% 45%, rgba(196,98,45,0.09) 0%, transparent 65%),
              radial-gradient(ellipse 45% 65% at 8% 75%, rgba(196,98,45,0.05) 0%, transparent 55%)
            `,
          }}
        />

        {/* Giant "1" — the brand in a single glyph */}
        <div
          aria-hidden
          className="tfb-drift"
          style={{
            position: "absolute",
            right: "-4vw",
            top: "50%",
            fontFamily: "var(--font-fraunces)",
            fontSize: "clamp(22rem, 44vw, 60rem)",
            lineHeight: 1,
            fontWeight: 900,
            color: "rgba(196,98,45,0.058)",
            userSelect: "none",
            pointerEvents: "none",
            letterSpacing: "-0.06em",
          }}
        >
          1
        </div>

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "5rem 1.5rem 6rem",
          }}
        >
          {/* Delivery pill */}
          <div
            className="tfb-rise tfb-delay-1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "2.75rem",
              padding: "0.4375rem 1rem 0.4375rem 0.5625rem",
              borderRadius: "999px",
              border: `1px solid ${C.border}`,
              background: C.sand,
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: C.rust,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: C.muted,
              }}
            >
              Now Delivering · ZIP 66221
            </span>
          </div>

          {/* Headline */}
          <h1
            className="tfb-rise tfb-delay-2"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: "clamp(3.5rem, 7.5vw, 7rem)",
              fontWeight: 400,
              lineHeight: 0.93,
              letterSpacing: "-0.025em",
              maxWidth: "13ch",
              marginBottom: "2.25rem",
            }}
          >
            We prepare
            <br />
            &amp; deliver{" "}
            <em style={{ fontStyle: "italic", color: C.rust }}>one</em>
            <br />
            tasty dish
            <br />
            each day.
          </h1>

          {/* Tagline */}
          <p
            className="tfb-rise tfb-delay-3"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "clamp(1rem, 1.6vw, 1.1875rem)",
              lineHeight: 1.72,
              color: C.muted,
              maxWidth: "36ch",
              marginBottom: "3rem",
            }}
          >
            No long lines. No long drives.
            <br />
            Just order the dish a day ahead and enjoy it
            <br className="hidden sm:block" />
            with friends and family in the comfort of your home.
          </p>

          {/* CTA row */}
          <div
            className="tfb-rise tfb-delay-4"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.875rem",
            }}
          >
            <Link
              href="/menu"
              className="transition-opacity hover:opacity-80"
              style={{
                fontFamily: "var(--font-dm-sans)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "1.0625rem 2rem",
                borderRadius: "999px",
                background: C.ink,
                color: C.cream,
                fontSize: "0.9375rem",
                fontWeight: 600,
                letterSpacing: "0.01em",
                textDecoration: "none",
              }}
            >
              View This Week&apos;s Menu
              <ArrowRight />
            </Link>

            <Link
              href="/order"
              className="transition-opacity hover:opacity-60"
              style={{
                fontFamily: "var(--font-dm-sans)",
                display: "inline-flex",
                alignItems: "center",
                padding: "1.0625rem 1.75rem",
                borderRadius: "999px",
                border: `1.5px solid ${C.border}`,
                color: C.muted,
                fontSize: "0.9375rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Order Tomorrow&apos;s Dish
            </Link>
          </div>

          {/* Divider label */}
          <div
            className="tfb-rise tfb-delay-5"
            style={{
              marginTop: "5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.875rem",
            }}
          >
            <div style={{ width: "2rem", height: "1px", background: C.border }} />
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.6875rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: C.dim,
              }}
            >
              How it works
            </span>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
      <section style={{ background: C.ink, color: C.cream }}>
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "6rem 1.5rem 7rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: C.rust,
              marginBottom: "3.5rem",
            }}
          >
            The process
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1px",
              border: `1px solid ${C.darkBorder}`,
              borderRadius: "1.75rem",
              overflow: "hidden",
              background: C.darkBorder,
            }}
          >
            {[
              {
                num: "01",
                title: "Check the menu",
                body: "Browse the 7-day schedule. Each date carries exactly one dish — made fresh, nothing frozen, nothing repeated.",
                highlight: false,
              },
              {
                num: "02",
                title: "Order by 11:59 PM",
                body: "Place your order before midnight the night before. That's your window. We plan every ingredient to the exact headcount.",
                highlight: true,
              },
              {
                num: "03",
                title: "Delivered warm",
                body: "Pick your evening slot — 6:30 or 7:30 PM. We bring it straight to your door, ready to serve at the table.",
                highlight: false,
              },
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  background: step.highlight ? C.darkCard : "transparent",
                  padding: "3rem 2.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontSize: "3.5rem",
                    lineHeight: 1,
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    color: step.highlight
                      ? "rgba(196,98,45,0.75)"
                      : "rgba(196,98,45,0.3)",
                  }}
                >
                  {step.num}
                </span>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-fraunces)",
                      fontSize: "1.625rem",
                      fontWeight: 400,
                      letterSpacing: "-0.015em",
                      lineHeight: 1.15,
                      color: C.cream,
                      marginBottom: "0.875rem",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "0.9375rem",
                      lineHeight: 1.72,
                      color: "rgba(253,248,242,0.52)",
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DELIVERY BAND ───────────────────────────────────────────── */}
      <section
        style={{
          background: C.sand,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "3.5rem 1.5rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: C.rust,
                marginBottom: "0.5rem",
              }}
            >
              Delivery coverage
            </p>
            <p
              style={{
                fontFamily: "var(--font-fraunces)",
                fontSize: "clamp(1.5rem, 2.75vw, 2.125rem)",
                fontWeight: 400,
                letterSpacing: "-0.015em",
                color: C.ink,
                lineHeight: 1.1,
              }}
            >
              Currently serving{" "}
              <em style={{ fontStyle: "italic", color: C.rust }}>
                ZIP 66221
              </em>
            </p>
          </div>

          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "0.875rem",
              color: C.muted,
              maxWidth: "30ch",
              lineHeight: 1.65,
            }}
          >
            Enter your ZIP at checkout — we&apos;ll confirm if we deliver to
            your address. Expanding soon.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────── */}
      <section
        style={{
          background: C.cream,
          padding: "9rem 1.5rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 55% 70% at 50% 50%, rgba(196,98,45,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 10 }}>
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: C.rust,
              marginBottom: "1.375rem",
            }}
          >
            Ready to eat well?
          </p>

          <h2
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: "clamp(2.75rem, 6vw, 5.25rem)",
              fontWeight: 400,
              lineHeight: 1.0,
              letterSpacing: "-0.025em",
              color: C.ink,
              margin: "0 auto 3rem",
              maxWidth: "16ch",
            }}
          >
            See what&apos;s cooking{" "}
            <em style={{ fontStyle: "italic", color: C.rust }}>this week.</em>
          </h2>

          <Link
            href="/menu"
            className="transition-opacity hover:opacity-80"
            style={{
              fontFamily: "var(--font-dm-sans)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "1.125rem 2.25rem",
              borderRadius: "999px",
              background: C.rust,
              color: C.cream,
              fontSize: "0.9375rem",
              fontWeight: 600,
              letterSpacing: "0.01em",
              textDecoration: "none",
            }}
          >
            View the Full Menu
            <ArrowRight />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, background: C.cream }}>
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "1.75rem 1.5rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: "0.9375rem",
              color: C.muted,
            }}
          >
            Two Dish
          </span>
        </div>
      </footer>
    </div>
  );
}
