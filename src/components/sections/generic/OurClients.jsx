"use client";

import ClientsLogoSlider from "../clients/ClientsLogoSlider";

function getClientLogos(data) {
  const rows = data?.client_logos || [];

  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => row?.our_clients || row?.client_logo || row)
    .filter((logo) => logo?.url)
    .map((logo) => ({ client_logo: logo }));
}

// Generic pages (e.g. Om oss) show client logos as the same infinite
// marquee carousel used on the homepage.
export default function GenericOurClients({ data }) {
  return (
    <ClientsLogoSlider
      clients={getClientLogos(data)}
      title={data?.text_above_title || ""}
    />
  );
}
