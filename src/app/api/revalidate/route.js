// src/app/api/revalidate/route.js

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";

// Map WordPress post types to Next.js URL segments
const POST_TYPE_PREFIX = {
  page:       "",            // /en/about-us
  pages:      "",
  service:    "service",     // /en/service/seo
  services:   "service",
  business_area:  "",
  business_areas: "",
  case_study: "case",        // /en/case/project-x
  post:       "artiklar",    // /artiklar/my-article
  posts:      "artiklar",
};

export async function POST(req) {
  const token = req.headers.get("x-revalidate-token");

  if (!token || token !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { slug, postType = "page" } = body;

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const prefix = POST_TYPE_PREFIX[postType] ?? postType;
  const revalidated = [];

  for (const lang of SUPPORTED_LANGS) {
    // Home page (slug = "frontpage")
    if (slug === "frontpage") {
      revalidatePath(`/${lang}`);
      revalidated.push(`/${lang}`);
      continue;
    }

    const postPrefix = lang === "en" ? "article" : "artiklar";
    const localizedPrefix = ["post", "posts"].includes(postType) ? postPrefix : prefix;
    const langPrefix = lang === DEFAULT_LANG ? "" : `/${lang}`;
    const path = localizedPrefix
      ? `${langPrefix}/${localizedPrefix}/${slug}`
      : `${langPrefix}/${slug}`;

    revalidatePath(path);
    revalidated.push(path);
  }

  return NextResponse.json({ revalidated, timestamp: new Date().toISOString() });
}
