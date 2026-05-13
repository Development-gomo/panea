// src/app/not-found.jsx

import Link from "next/link";
import Image from "next/image";
import { DEFAULT_LANG } from "@/config";
import ArrowSvg from "../../public/right-arrow.svg";

export default function GlobalNotFound() {
  return (
    <html lang={DEFAULT_LANG}>
      <body className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white px-4 text-center">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
            404
          </p>
          <h1 className="text-4xl font-semibold">Page not found</h1>
          <p className="text-gray-600 max-w-lg">
            We couldn&apos;t find the page you were looking for. Try starting
            from the English homepage.
          </p>
        </div>
        <Link
              href="/"
              className="
                gap-3 group relative inline-flex items-center
                rounded-sm bg-(--color-brand) px-6 py-4 text-white
                transition-all duration-300 hover:bg-(--color-brand)
                w-[154px] overflow-hidden select-none">
              {/* DOT */}
              <span className="relative w-6 flex items-center justify-center">
                <span
                  className="
                    absolute h-2 w-2 rounded-full bg-[#27E0C0]
                    transition-all duration-300 ease-out
                    group-hover:opacity-0 group-hover:-translate-x-1
                  "
                ></span>
              </span>

              {/* TEXT */}
              <span
                className="
                  flex-1 text-[16px] leading-none whitespace-nowrap
                  transition-all duration-300 ease-out
                  group-hover:-translate-x-3">Go to panea.dk</span>
              <span className="relative w-4 flex items-center justify-center">
                <span
                  className="
                    w-4 absolute opacity-0 -translate-x-4
                    transition-all duration-300 ease-out
                    group-hover:opacity-100 group-hover:-translate-x-1
                  "
                >
                  <Image src={ArrowSvg} width={13} height={13} alt="arrow" />
                </span>
              </span>
            </Link>
      </body>
    </html>
  );
}

