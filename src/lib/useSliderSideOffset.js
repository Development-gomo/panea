"use client";

import { useEffect, useState } from "react";

// Left/right Swiper offset that lines the first slide up with the
// .web-width container (max 1328px, 24px side padding) while letting the
// slider itself run full-bleed.
export default function useSliderSideOffset() {
  const [offset, setOffset] = useState(24);

  useEffect(() => {
    function updateOffset() {
      const viewportWidth = window.innerWidth;
      const containerWidth = Math.min(1328, viewportWidth);
      setOffset(Math.max(24, (viewportWidth - containerWidth) / 2 + 24));
    }

    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => window.removeEventListener("resize", updateOffset);
  }, []);

  return offset;
}
