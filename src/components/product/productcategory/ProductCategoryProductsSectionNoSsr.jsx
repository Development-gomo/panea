"use client";

import dynamic from "next/dynamic";

const ProductCategoryProductsSection = dynamic(
  () => import("./ProductCategoryProductsSection"),
  {
    ssr: false,
    loading: () => <section className="bg-[#F2EBE2] pt-[24px]" />,
  }
);

export default function ProductCategoryProductsSectionNoSsr(props) {
  return <ProductCategoryProductsSection {...props} />;
}
