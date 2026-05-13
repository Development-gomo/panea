// src/proxy.js
// 1. Sets x-lang header so root layout can set <html lang> correctly.
// 2. Fetches redirects from /api/wp-redirects and applies them.

import { NextResponse } from "next/server";
import { SUPPORTED_LANGS, DEFAULT_LANG } from "@/config";

// ─── In-memory redirect cache ────────────────────────────────────────────────
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let _redirectsCache = null;
let _cacheExpiry = 0;

async function getRedirects(origin) {
  if (_redirectsCache !== null && Date.now() < _cacheExpiry) {
    return _redirectsCache;
  }

  try {
    const res = await fetch(`${origin}/api/wp-redirects`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        _redirectsCache = data;
        _cacheExpiry = Date.now() + CACHE_TTL_MS;
        return _redirectsCache;
      }
    }
  } catch {}

  // Don't cache failures — retry on next request
  return _redirectsCache ?? [];
}

// ─── Match pathname against redirect list ─────────────────────────────────────
function matchRedirect(redirects, pathname) {
  for (const r of redirects) {
    const source = r.url;
    const destination = r.action_data?.url;
    const code = r.action_code || 301;
    const matchType = r.match_type || "url";

    if (!source || !destination) continue;

    const ignoreTrailing = r.match_data?.source?.flag_trailing ?? false;
    const norm = (p) => (ignoreTrailing ? p.replace(/\/$/, "") : p);

    if (matchType === "url") {
      if (norm(pathname) === norm(source)) return { destination, code };
    } else if (matchType === "url-nocase") {
      if (norm(pathname).toLowerCase() === norm(source).toLowerCase())
        return { destination, code };
    } else if (matchType === "regex") {
      try {
        const re = new RegExp(source, "i");
        const match = pathname.match(re);
        if (match) {
          const resolved = destination.replace(/\$(\d+)/g, (_, n) => match[n] ?? "");
          return { destination: resolved, code };
        }
      } catch {}
    }
  }
  return null;
}

// ─── Proxy ───────────────────────────────────────────────────────────────────
export async function middleware(request){
  const { pathname, origin } = request.nextUrl;

  // Serve custom robots.txt with Content-Signal directives.
  // Middleware intercepts before the static robots.js metadata route runs.
  if (pathname === "/robots.txt") {
    const siteUrl = process.env.SITE_URL;
    const body = [
      "User-agent: *",
      "Allow: /",
      "Disallow: /api/",
      `Sitemap: ${siteUrl}/sitemap.xml`,
      "",
      "# AI content usage preferences (contentsignals.org)",
      "Content-Signal: ai-train=no, search=yes, ai-input=no",
    ].join("\n");
    return new Response(body, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // 1. Check WordPress redirects
  const redirects = await getRedirects(origin);
  const hit = matchRedirect(redirects, pathname);

  if (hit) {
    const dest = hit.destination.startsWith("http")
      ? new URL(hit.destination)
      : new URL(hit.destination, origin);
    return NextResponse.redirect(dest, { status: hit.code });
  }

  // 2. Pass through — set x-lang and x-pathname headers for layouts / not-found pages
  const firstSegment = pathname.split("/")[1] || "";
  const lang = SUPPORTED_LANGS.includes(firstSegment) ? firstSegment : DEFAULT_LANG;
  const response = NextResponse.next();
  response.headers.set("x-lang", lang);
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico).*)"],
};
