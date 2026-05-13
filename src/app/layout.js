import "./globals.css";
import { Instrument_Sans, Tinos } from "next/font/google";
import { DEFAULT_LANG } from "@/config";
import { headers } from "next/headers";
import NextTopLoader from "nextjs-toploader";
import LangSyncer from "@/components/LangSyncer";
// import Script from "next/script"; // uncomment when adding tracking scripts

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument-sans",
  style: ["normal", "italic"],
  display: "swap",
});

const tinos = Tinos({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-tinos",
  style: ["normal", "italic"],
  display: "swap",
});

export default async function RootLayout({ children }) {
  // Read lang set by middleware (src/middleware.js) so <html lang> is correct
  // for both EN and DA without nesting a second <html> in [lang]/layout.js.
  const h = await headers();
  const lang = h.get("x-lang") || DEFAULT_LANG;

  return (
    <html lang={lang} className={`${instrumentSans.variable} ${tinos.variable}`} suppressHydrationWarning>
      <head>
        {/* ── Cookiebot ── add data-cbid and uncomment when live
        <Script
          id="cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="YOUR-COOKIEBOT-ID"
          data-blockingmode="auto"
          strategy="beforeInteractive"
        />
        */}

        {/* ── Google Tag Manager ── add GTM-XXXXXX and uncomment when live
        <Script
          id="gtm"
          src="https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXX"
          strategy="afterInteractive"
        />
        */}

        {/* ── Other tracking scripts go here ── */}
      </head>
      <body suppressHydrationWarning>
        {/* ── GTM noscript fallback ── uncomment when live
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        */}

        <NextTopLoader
          color="#00fec3"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #00fec3,0 0 5px #00fec3"
        />
        <LangSyncer />
        {children}
      </body>
    </html>
  );
}
