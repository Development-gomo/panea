// src/app/[lang]/loading.js
// Suspense boundary — shown instantly while any [lang]/* page renders.
// Matches the fixed header height so content area doesn't shift on load.

export default function Loading() {
  return (
    <div className="min-h-screen w-full animate-pulse">
      {/* Header placeholder — matches fixed header height */}
      <div className="fixed top-0 w-full h-[88px] z-50 bg-black/10 backdrop-blur-sm" />

      {/* Content placeholder */}
      <div className="pt-[88px] web-width mx-auto px-6 py-20 space-y-6">
        <div className="h-10 w-2/3 rounded-md bg-gray-200" />
        <div className="h-5 w-full rounded-md bg-gray-100" />
        <div className="h-5 w-5/6 rounded-md bg-gray-100" />
        <div className="h-5 w-4/6 rounded-md bg-gray-100" />
        <div className="mt-10 h-64 w-full rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}
