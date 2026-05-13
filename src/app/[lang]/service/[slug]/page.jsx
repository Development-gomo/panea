// src/app/[lang]/service/[slug]/page.jsx

import Header from "@/components/major/Header";
import ServicePageBuilder from "@/components/major/ServiceBuilder";
import Footer from "@/components/major/Footer";
import { resolveParams } from "@/lib/params";
import { getServiceBySlug, getAllServices, getMenu, getThemeOptions } from "@/lib/api";
import { buildMetadataFromYoast } from "@/lib/seo";
import { notFound } from "next/navigation";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";

export const revalidate = 3600;

export async function generateStaticParams() {
  const results = await Promise.all(
    SUPPORTED_LANGS.map((lang) => getAllServices(lang))
  );
  return SUPPORTED_LANGS.flatMap((lang, i) =>
    (Array.isArray(results[i]) ? results[i] : []).map((s) => ({ lang, slug: s.slug }))
  );
}

export default async function ServiceSinglePage({ params }) {
  const resolved = await params;
  const parsed = resolveParams(resolved);

  const lang = parsed?.lang || DEFAULT_LANG;
  const slug = parsed?.slug;

  if (!slug) notFound();

  const [service, menu, themeOptions] = await Promise.all([
    getServiceBySlug(slug, lang),
    getMenu(lang),
    getThemeOptions(lang),
  ]);

  if (!service) notFound();

  return (
    <>
      <Header
        lang={lang}
        currentSlug={slug}
        entryType="services"
        pathPrefix="service"
        entryId={service?.id}
        prefetchedMenu={menu}
        prefetchedOptions={themeOptions?.header || {}}
        logoUrl={themeOptions?.header?.logo_light?.url || ""}
      />
      <main>
        <ServicePageBuilder sections={service?.acf?.services_page_builder} lang={lang} />
      </main>
      <Footer lang={lang} currentSlug={slug} />
    </>
  );
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const parsed = resolveParams(resolved);
  const lang = parsed?.lang || DEFAULT_LANG;
  const slug = parsed?.slug;

  if (!slug) {
    return {
      title: "Service | panea",
    };
  }

  const service = await getServiceBySlug(slug, lang);
  return buildMetadataFromYoast(service, {
    fallbackTitle: `${slug} | panea`,
    lang,
  });
}
