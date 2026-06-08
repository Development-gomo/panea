"use client";

import Image from "next/image";
import { motion } from "framer-motion";

function getClientLogos(data) {
  const rows = data?.client_logos || [];

  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => row?.our_clients || row?.client_logo || row)
    .filter((logo) => logo?.url);
}

export default function SolutionOurClients({ data }) {
  const textAboveTitle = data?.text_above_title || "";
  const logos = getClientLogos(data);

  if (!logos.length) return null;

  return (
    <section className="w-full pt-[60px] pb-0 md:pt-[120px]">
      <div className="web-width mx-auto px-6">
        {textAboveTitle && (
          <motion.p
            className="ff-larken mb-10 text-center text-[16px] font-light leading-normal text-(--color-body)"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {textAboveTitle}
          </motion.p>
        )}

        <div className="flex flex-wrap justify-center gap-4">
          {logos.map((logo, index) => (
            <motion.div
              key={`${logo.id || logo.url}-${index}`}
              className="flex h-[96px] w-full items-center justify-center rounded-[7px] border px-6 sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(16.666%-14px)]"
              style={{ borderColor: "#1E2E314D" }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              viewport={{ once: true }}
            >
              <Image
                src={logo.url}
                alt={logo.alt || "Client logo"}
                width={logo.width || 120}
                height={logo.height || 50}
                sizes="(max-width: 639px) calc(100vw - 48px), (max-width: 1023px) 33vw, 16vw"
                className="h-auto w-auto max-h-[70px] max-w-full object-contain"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
