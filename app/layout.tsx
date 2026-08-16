import type { Metadata } from "next";
import { Cormorant_Garamond, Karla } from "next/font/google";
import { CartProvider } from "@/app/components/CartContext";
import VersionSwitcher from "@/app/components/VersionSwitcher";
import SparkleCursor from "@/app/components/SparkleCursor";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Two Dish",
  description:
    "One fresh dish delivered to your door each day. Order by 11:59 PM the night before.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${karla.variable} h-full antialiased`}
      // The blocking script below sets data-version pre-hydration, which
      // legitimately differs from the server-rendered markup — expected,
      // not a real mismatch, so don't warn about it.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Blocking, runs before first paint — sets data-version from
            localStorage synchronously so version-9's CSS overrides (e.g.
            hiding the IntroSplash loading screen) are already active by
            the time anything renders. VersionSwitcher still owns the
            React-side state/keydown handling; this just closes the gap
            between first paint and its useEffect. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var v=localStorage.getItem("tfb-version");if(v&&v!=="0")document.documentElement.setAttribute("data-version",v);}catch(e){}})();`,
          }}
        />
        <VersionSwitcher />
        <SparkleCursor />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
