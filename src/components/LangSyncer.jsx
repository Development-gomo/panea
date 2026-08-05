"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SUPPORTED_LANGS, DEFAULT_LANG } from "@/config";

export default function LangSyncer() {
  const pathname = usePathname();

  useEffect(() => {
    const firstSegment = pathname.split("/")[1] || "";
    const lang = SUPPORTED_LANGS.includes(firstSegment) ? firstSegment : DEFAULT_LANG;
    document.documentElement.lang = lang;
  }, [pathname]);

  return null;
}
