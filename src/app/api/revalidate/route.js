// src/app/api/revalidate/route.js

import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";

// Map WordPress post types to Next.js URL segments
const POST_TYPE_PREFIX = {
  page:       "",            // /en/about-us
  pages:      "",
  solution:   "",
  solutions:  "",
  business_area:  "",
  business_areas: "",
  case_study: "",
  post:       "",            // /my-article
  posts:      "",
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

  const { slug, postType = "page", lang: requestedLang } = body;
  const isMenuUpdate = ["menu", "nav_menu", "nav_menu_item"].includes(postType);

  if (!slug && !isMenuUpdate) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  if (isMenuUpdate) {
    const languages = SUPPORTED_LANGS.includes(requestedLang)
      ? [requestedLang]
      : SUPPORTED_LANGS;
    const revalidated = languages.map((lang) => {
      const tag = `menu-${lang}`;
      revalidateTag(tag, { expire: 0 });
      return tag;
    });

    return NextResponse.json({
      revalidated,
      timestamp: new Date().toISOString(),
    });
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

    const localizedPrefix = ["post", "posts"].includes(postType)
      ? ""
      : prefix;
    const langPrefix = lang === DEFAULT_LANG ? "" : `/${lang}`;
    const path = localizedPrefix
      ? `${langPrefix}/${localizedPrefix}/${slug}`
      : `${langPrefix}/${slug}`;

    revalidatePath(path);
    revalidated.push(path);
  }

  return NextResponse.json({ revalidated, timestamp: new Date().toISOString() });
}
