// src/app/api/revalidate/route.js

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { SUPPORTED_LANGS } from "@/config";

// Map WordPress post types to Next.js URL segments
const POST_TYPE_PREFIX = {
  page:       "",            // /en/about-us
  pages:      "",
  service:    "service",     // /en/service/seo
  services:   "service",
  case_study: "case-study",  // /en/case-study/project-x
  post:       "post",        // /en/post/my-article
  posts:      "post",
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

    const path = prefix
      ? `/${lang}/${prefix}/${slug}`
      : `/${lang}/${slug}`;

    revalidatePath(path);
    revalidated.push(path);
  }

  return NextResponse.json({ revalidated, timestamp: new Date().toISOString() });
}
