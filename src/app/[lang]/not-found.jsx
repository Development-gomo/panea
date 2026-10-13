// src/app/[lang]/not-found.jsx

import Link from "next/link";
import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import { DEFAULT_LANG, langFromPath, langHome } from "@/config";
import { headers } from "next/headers";

export default async function LangScopedNotFound() {
  // next/navigation params are not passed to not-found components;
  // read the request pathname from headers instead.
  const h = await headers();
  const pathname = h.get("x-pathname") ?? h.get("referer") ?? "";
  const lang = langFromPath(pathname);

  // Language-specific messages
  const messages = {
    en: {
      title: "Unfortunately, the content you were looking for is not available.",
      buttonText: "Go to Homepage",
    },
    sv: {
      title: "Tyvärr, innehållet du försökte finna är inte tillgängligt.",
      buttonText: "Gå till Startsidan",
    },
  };

  const currentMessages = messages[lang] || messages[DEFAULT_LANG];

  return (
    <>
      <Header lang={lang} />
      <main className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">404</p>
        <h1 className="text-4xl font-semibold">{currentMessages.title}</h1>
        <Link
          href={langHome(lang)}
          className="inline-flex rounded-[50px] bg-(--color-body) px-9 py-4 text-[16px] leading-none text-white transition-colors duration-300 hover:bg-white hover:text-(--color-body)"
        >
          {currentMessages.buttonText}
        </Link>
      </main>
      <Footer lang={lang} />
    </>
  );
}
