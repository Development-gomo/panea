"use client";

import dynamic from "next/dynamic";

const ProductCategoryProductsSection = dynamic(
  () => import("./ProductCategoryProductsSection"),
  {
    ssr: false,
    loading: () => (
      <section className="w-full bg-[#F2EBE2] pt-[60px] pb-0 md:pt-[24px]" />
    ),
  }
);

export default function ProductCategoryProductsSectionNoSsr(props) {
  return <ProductCategoryProductsSection {...props} />;
}
