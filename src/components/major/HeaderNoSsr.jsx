"use client";

import dynamic from "next/dynamic";

const Header = dynamic(() => import("./Header"), {
  ssr: false,
  loading: () => (
    <header className="sticky top-0 z-50 w-full bg-[#F2EBE2] py-4">
      <div className="web-width mx-auto h-12 px-6" />
    </header>
  ),
});

export default function HeaderNoSsr(props) {
  return <Header {...props} />;
}
