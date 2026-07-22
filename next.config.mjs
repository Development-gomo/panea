/** @type {import('next').NextConfig} */

import { SUPPORTED_LANGS, DEFAULT_LANG } from "./src/config/index.js";

if (!process.env.NEXT_PUBLIC_WP_BASE) {
  throw new Error(
    "Environment variable NEXT_PUBLIC_WP_BASE is not defined. Please check your env.local file."
  );
}
let wpHostname;
try {
  wpHostname = new URL(process.env.NEXT_PUBLIC_WP_BASE).hostname;
} catch (e) {
  throw new Error(
    `Invalid NEXT_PUBLIC_WP_BASE URL: ${process.env.NEXT_PUBLIC_WP_BASE}. Error: ${e.message}`
  );
}
const nonDefaultLangs = SUPPORTED_LANGS.filter((l) => l !== DEFAULT_LANG);

const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: wpHostname, pathname: "/**" },
      { protocol: "https", hostname: `www.${wpHostname}`, pathname: "/**" },
    ],
  },

  async headers() {
    const siteUrl = process.env.SITE_URL;
    return [ 
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value: `<${siteUrl}/sitemap.xml>; rel="sitemap", <${siteUrl}/robots.txt>; rel="robots"`,
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      ...SUPPORTED_LANGS.map((lang) => ({
        source: lang === DEFAULT_LANG ? "/hem" : `/${lang}/hem`,
        destination: lang === DEFAULT_LANG ? "/" : `/${lang}`,
        permanent: true,
      })),
      {
        source: "/post/:slug",
        destination: "/artiklar/:slug",
        permanent: true,
      },
      {
        source: "/en/post/:slug",
        destination: "/en/article/:slug",
        permanent: true,
      },
      {
        source: "/solutions/:slug",
        destination: "/:slug",
        permanent: true,
      },
      {
        source: "/solution/:slug",
        destination: "/:slug",
        permanent: true,
      },
      {
        source: "/losningar/:slug",
        destination: "/:slug",
        permanent: true,
      },
      {
        source: "/en/solutions/:slug",
        destination: "/en/:slug",
        permanent: true,
      },
      {
        source: "/en/solution/:slug",
        destination: "/en/:slug",
        permanent: true,
      },
      {
        source: "/case/:slug",
        destination: "/:slug",
        permanent: true,
      },
      {
        source: "/en/case/:slug",
        destination: "/en/:slug",
        permanent: true,
      },
      {
        source: "/webshop",
        destination: "/webbshop",
        permanent: true,
      },
      {
        source: "/product/:slug",
        destination: "/:slug/",
        permanent: true,
      },
      {
        source: "/en/product/:slug",
        destination: "/en/:slug/",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      { source: "/karriar", destination: "/career" },
      { source: "/webbshop", destination: "/webshop" },
      { source: "/artiklar/:slug", destination: `/${DEFAULT_LANG}/post/:slug` },
      { source: "/en/article/:slug", destination: "/en/post/:slug" },
      // Pass-throughs for each non-default language (prevents catch-all rewrite below from grabbing them)
      ...nonDefaultLangs.flatMap((lang) => [
        { source: `/${lang}`, destination: `/${lang}` },
        { source: `/${lang}/:path*`, destination: `/${lang}/:path*` },
      ]),
      // Default language: rewrite everything else to /en/...
      { source: "/", destination: `/${DEFAULT_LANG}` },
      { source: "/:path*", destination: `/${DEFAULT_LANG}/:path*` },
    ];
  },
};

export default nextConfig;
