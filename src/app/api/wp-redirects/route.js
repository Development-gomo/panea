// Internal API route — called by middleware to fetch WP redirects
// Runs on Node.js runtime (full process.env access)

import { WP_BASE } from "@/config";

const PER_PAGE = 200;
// Upper bound on pagination — mirrors the cap used elsewhere (see fetchAllWP
// in src/lib/api.js). Without this, a backend bug that keeps returning a
// full page of items would loop forever: Vercel's function timeout would
// kill that eventually, but on a long-running Node server it can hang an
// event-loop worker indefinitely and pile up requests behind it.
const MAX_PAGES = 100;

export async function GET() {
  const allItems = [];

  const credentials = btoa(
    `${process.env.WP_API_USER}:${process.env.WP_API_PASS}`
  );

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const res = await fetch(
      `${WP_BASE}/redirection/v1/redirect?per_page=${PER_PAGE}&page=${page}`,
      {
        cache: "no-store",
        headers: { Authorization: `Basic ${credentials}` },
      }
    );

    if (!res.ok) break;

    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];
    allItems.push(...items);

    if (items.length < PER_PAGE) break;
  }

  return Response.json(allItems);
}
