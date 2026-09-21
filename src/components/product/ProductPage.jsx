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

function getProductContactForm(product, themeOptions) {
  const acf = getProductAcf(product);

  if (!Array.isArray(acf.product_page_builder)) return null;

  // The contact form section's own fields are no longer used — its content
  // is now managed centrally in Theme Options. The block's presence in the
  // builder still controls whether the section shows on this product page.
  const hasContactForm = acf.product_page_builder.some((block) =>
    ["contact_form_section", "contact_form"].includes(block?.acf_fc_layout)
  );

  if (!hasContactForm) return null;

  return themeOptions?.contact_form_section || null;
}

function getProductTeamData(product, themeOptions) {
  const acf = getProductAcf(product);

  if (!Array.isArray(acf.product_page_builder)) return null;

  // Same as above — content now comes from Theme Options instead of the
  // block's own fields; presence of the layout still toggles the section.
  const hasTeamSection = acf.product_page_builder.some(
    (block) => block?.acf_fc_layout === "team_member_section"
  );

  if (!hasTeamSection) return null;

  return themeOptions?.team_member_section || null;
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
  const contactForm = getProductContactForm(product, themeOptions);
  const teamData = getProductTeamData(product, themeOptions);
  const whyChooseUs = getProductWhyChooseUs(product);
  const whyChoosePanea = getProductWhyChoosePanea(product, themeOptions);

  return (
    <>
      <ProductBreadcrumbs product={product} lang={lang} />

      <section className="w-full bg-[#F2EBE2] pt-[30px] pb-0 md:pt-[30px]">
        <div className="web-width-sm mx-auto px-6">
          <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-20">
            <section aria-label="Product media" className="min-w-0">
              <ProductGallery product={product} />
            </section>
            <section className="min-w-0">
              <ProductDetails product={product} lang={lang} />
            </section>
          </div>
        </div>
      </section>

      <ProductTabs product={product} lang={lang} />
      <RelatedProducts
        product={product}
        products={relatedProducts}
        lang={lang}
        themeOptions={themeOptions}
      />
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
