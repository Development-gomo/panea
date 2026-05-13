// src/components/sections/clients/ClientsLogoSlider.jsx

"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Reusable client logo marquee slider.
 * Props:
 *   clients  — array of { client_logo: { url, alt, width, height } }
 *              (comes from themeOptions.clients.client_images)
 *   title    — optional heading above the slider (logo_slider_title)
 *   speed    — animation duration in seconds (default 30)
 */
export default function ClientsLogoSlider({ clients = [], speed = 30, title }) {
  if (!clients || clients.length === 0) return null;

  // Duplicate items for a seamless infinite loop
  const logos = [...clients, ...clients];

  return (
    <section className="clients-slider-section pt-[60px] md:pt-[120px] pb-0 overflow-hidden">
      {title && (
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-heading">{title}</h2>
        </motion.div>
      )}
      <motion.div
        className="flex gap-4"
        style={{
          width: "max-content",
          animation: `clients-marquee ${speed}s linear infinite`,
        }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: title ? 0.15 : 0 }}
        viewport={{ once: true }}
      >
        {logos.map((item, index) => {
          const logo = item?.client_logo;
          if (!logo?.url) return null;

          return (
            <div
              key={index}
              className="flex items-center justify-center rounded-[7px] border px-6 min-w-[200px] h-[96px] shrink-0"
              style={{ borderColor: "#1E2E314D" }}
            >
              <Image
                src={logo.url}
                alt={logo.alt || "Client logo"}
                width={logo.width || 120}
                height={logo.height || 50}
                className="w-auto max-h-[50px] object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
              />
            </div>
          );
        })}
      </motion.div>

      <style jsx>{`
        @keyframes clients-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
