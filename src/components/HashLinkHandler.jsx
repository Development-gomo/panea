"use client";

import { useEffect } from "react";
import { WP_BASE } from "@/config";

const normalizePath = (path) => path.replace(/\/+$/, "") || "/";

function getWpOrigin() {
  try {
    return WP_BASE ? new URL(WP_BASE).origin : null;
  } catch {
    return null;
  }
}

// Scrolls to on-page anchors (e.g. #contact-form) without a page reload,
// even when the CMS gives a full URL or a trailing slash for the current page.
export default function HashLinkHandler() {
  useEffect(() => {
    const wpOrigin = getWpOrigin();

    const handleClick = (e) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = e.target.closest?.("a[href]");
      if (!link || (link.target && link.target !== "_self")) return;

      let url;
      try {
        url = new URL(link.getAttribute("href"), window.location.href);
      } catch {
        return;
      }

      if (!url.hash) return;
      if (url.origin !== window.location.origin && url.origin !== wpOrigin) return;
      if (normalizePath(url.pathname) !== normalizePath(window.location.pathname)) return;

      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;

      e.preventDefault();
      e.stopPropagation();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(window.history.state, "", url.hash);
    };

    window.addEventListener("click", handleClick, true);
    return () => window.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
