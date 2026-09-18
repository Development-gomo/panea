import ProductBreadcrumbs from "./ProductBreadcrumbs";
import ProductDetails from "./ProductDetails";
import ProductFAQ from "./FAQ";
import ProductGallery from "./ProductGallery";
import RelatedProducts from "./RelatedProducts";
import ProductTabs from "./ProductTabs";
import ProductContactFormSection from "./ContactFormSection";
import ProductOurApproach from "./OurApproach";
import ProductTestimonialSlider from "./TestimonialSlider";
import ProductWhyChooseUs from "./ProductWhyChooseUs";
import BusinessAreaOurApproach from "../sections/business-area/OurApproach";

function getProductAcf(product) {
  return {
    ...(product?.acf || {}),
    ...(product?.acf_fields || {}),
    ...(product?.advanced_custom_fields || {}),
    ...(product?.meta?.acf || {}),
  };
}

function getProductWhyChooseUs(product) {
  const acf = getProductAcf(product);

  if (!Array.isArray(acf.product_page_builder)) return null;

  return acf.product_page_builder.find(
    (block) => block?.acf_fc_layout === "why_choose_us"
  );
}

function getProductWhyChoosePanea(product, themeOptions) {
  const acf = getProductAcf(product);

  if (!Array.isArray(acf.product_page_builder)) return null;

  // "why_choose_panea" is an empty layout — when it's present, the section's
  // content is managed centrally in Theme Options instead of per product.
  const usesPaneaThemeContent = acf.product_page_builder.some(
    (block) => block?.acf_fc_layout === "why_choose_panea"
  );

  if (!usesPaneaThemeContent) return null;

  return themeOptions?.why_choose_us || null;
}

function getProductOurApproach(product) {
  const acf = getProductAcf(product);

  if (!Array.isArray(acf.product_page_builder)) return null;

  return acf.product_page_builder.find((block) =>
    ["our_approach", "our_approach_section"].includes(block?.acf_fc_layout)
  );
}

function getProductStructuredProcess(product, themeOptions) {
  const acf = getProductAcf(product);

  if (!Array.isArray(acf.product_page_builder)) return null;

  // "structured_process" is an empty layout — when it's present, the section's
  // content is managed centrally in Theme Options instead of per product.
  const usesStructuredProcess = acf.product_page_builder.some(
    (block) => block?.acf_fc_layout === "structured_process"
  );

  if (!usesStructuredProcess) return null;

  return themeOptions?.our_approach || null;
}

function getProductTestimonial(product) {
  const acf = getProductAcf(product);

  if (!Array.isArray(acf.product_page_builder)) return null;

  return acf.product_page_builder.find((block) =>
    ["testimonial", "testimonials", "testimonial_slider"].includes(
      block?.acf_fc_layout
    )
  );
}

function getProductFAQ(product) {
  const acf = getProductAcf(product);

  if (!Array.isArray(acf.product_page_builder)) return null;

  return acf.product_page_builder.find((block) =>
    ["faq", "faq_section"].includes(block?.acf_fc_layout)
  );
}

function getProductContactForm(product) {
  const acf = getProductAcf(product);

  if (!Array.isArray(acf.product_page_builder)) return null;

  return acf.product_page_builder.find((block) =>
    ["contact_form_section", "contact_form"].includes(block?.acf_fc_layout)
  );
}

function getProductTeamData(product) {
  const acf = getProductAcf(product);

  if (!Array.isArray(acf.product_page_builder)) return null;

  return acf.product_page_builder.find(
    (block) => block?.acf_fc_layout === "team_member_section"
  );
}

export default function ProductPage({
  product,
  lang,
  relatedProducts = [],
  prefetchedTestimonials = [],
  prefetchedTeamMembers = [],
  themeOptions = null,
}) {
  const ourApproach = getProductOurApproach(product);
  const structuredProcess = getProductStructuredProcess(product, themeOptions);
  const testimonial = getProductTestimonial(product);
  const faq = getProductFAQ(product);
  const contactForm = getProductContactForm(product);
  const teamData = getProductTeamData(product);
  const whyChooseUs = getProductWhyChooseUs(product);
  const whyChoosePanea = getProductWhyChoosePanea(product, themeOptions);

  return (
    <>
      <ProductBreadcrumbs product={product} lang={lang} />

      <article className="bg-[#F2EBE2]">
        <div className="web-width mx-auto grid min-w-0 gap-8 px-4 pt-[40px] pb-[60px] sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-20">
          <section aria-label="Product media" className="min-w-0">
            <ProductGallery product={product} />
          </section>
          <section className="min-w-0">
            <ProductDetails product={product} lang={lang} />
          </section>
        </div>
      </article>

      <ProductTabs product={product} />
      <RelatedProducts product={product} products={relatedProducts} lang={lang} />
      <ProductOurApproach data={ourApproach} />
      <BusinessAreaOurApproach data={structuredProcess} />
      <ProductWhyChooseUs data={whyChooseUs} lang={lang} />
      <ProductWhyChooseUs data={whyChoosePanea} lang={lang} />
      <ProductTestimonialSlider
        data={testimonial}
        prefetchedTestimonials={prefetchedTestimonials}
      />
      <ProductFAQ data={faq} />
      <ProductContactFormSection
        data={contactForm}
        teamData={teamData}
        lang={lang}
        prefetchedTeamMembers={prefetchedTeamMembers}
      />
    </>
  );
}
