// src/app/robots.js
// This file keeps the build happy (Next.js requires a default export).
// The actual /robots.txt response is served by middleware (src/middleware.js)
// which intercepts the route and adds Content-Signal directives.

const SITE_URL = process.env.SITE_URL;

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
