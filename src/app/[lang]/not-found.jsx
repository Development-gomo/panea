// src/app/[lang]/not-found.jsx

import Link from "next/link";
import Image from "next/image";
import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import { DEFAULT_LANG, langFromPath, langHome } from "@/config";
import { headers } from "next/headers";
import ArrowSvg from "../../../public/right-arrow.svg";

export default async function LangScopedNotFound() {
  // next/navigation params are not passed to not-found components;
  // read the request pathname from headers instead.
  const h = await headers();
  const pathname = h.get("x-pathname") ?? h.get("referer") ?? "";
  const lang = langFromPath(pathname);

  // Language-specific messages
  const messages = {
    en: {
      title: "The page you're looking for doesn't exist.",
      description:
        "It might have been removed, renamed, or is temporarily unavailable. Please double-check the URL or head back to the homepage.",
      buttonText: "Go to Homepage",
    },
    sv: {
      title: "Sidan du letar efter finns inte.",
      description:
        "Den kan ha tagits bort, bytt namn eller är tillfälligt otillgänglig. Kontrollera URL:en eller gå tillbaka till startsidan.",
      buttonText: "Gå till Startsidan",
    },
  };

  const currentMessages = messages[lang] || messages[DEFAULT_LANG];

  return (
    <>
      <Header lang={lang} />
      <div className="h-28 w-full bg-black"></div>
      <main className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">404</p>
        <h1 className="text-4xl font-semibold">{currentMessages.title}</h1>
        <p className="text-gray-600 max-w-xl">{currentMessages.description}</p>
        <Link
          href={langHome(lang)}
          className="gap-3 group relative inline-flex items-center rounded-sm bg-(--color-brand) px-6 py-4 text-white transition-all duration-300 hover:bg-(--color-brand) w-[195px] overflow-hidden select-none"
        >
          {/* DOT */}
          <span className="relative w-6 flex items-center justify-center">
            <span
              className="absolute h-2 w-2 rounded-full bg-[#27E0C0] transition-all duration-300 ease-out group-hover:opacity-0 group-hover:-translate-x-1"
            ></span>
          </span>

          {/* TEXT */}
          <span
            className="flex-1 text-[16px] leading-none whitespace-nowrap transition-all duration-300 ease-out group-hover:-translate-x-3"
          >
            {currentMessages.buttonText}
          </span>
          <span className="relative w-4 flex items-center justify-center">
            <span
              className="w-4 absolute opacity-0 -translate-x-4 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:-translate-x-1"
            >
              <Image src={ArrowSvg} width={13} height={13} alt="arrow" />
            </span>
          </span>
        </Link>
      </main>
      <Footer lang={lang} />
    </>
  );
}
