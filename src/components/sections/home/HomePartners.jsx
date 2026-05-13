// src/components/sections/home/HomePartners.jsx

"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HomePartners({ data }) {
  if (!data) return null;

  const { sub_heading, heading } = data;
  const partners_logo = data?.partners_logo || [];
  const bgImage = data?.bg_image?.url || "";

  if (partners_logo.length === 0) return null;

  // Duplicate for seamless infinite loop
  const logos = [...partners_logo, ...partners_logo];

  return (
    <section className="partners-section pb-15 md:pb-30 relative overflow-hidden">
      {bgImage ? (
        <div className="absolute inset-0 -z-2" style={{ backgroundImage: `url(${bgImage})`, backgroundPosition: '100% -10%', backgroundRepeat: 'no-repeat', backgroundSize: 'auto' }} suppressHydrationWarning />
      ) : null}
      {/* SUB HEADING WITH DOT */}
      <div className="web-width px-6">
        <motion.div
          className="flex items-center gap-2 mb-2 md:mb-4" 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
          <span className="subheading-label">{sub_heading}</span>
        </motion.div>

        <motion.div
          className="section-heading mb-10 md:mb-14"
          dangerouslySetInnerHTML={{ __html: heading }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          viewport={{ once: true }}
        />
      </div>

      {/* MARQUEE SLIDER */}
      <div className="overflow-hidden">
        <div
          className="flex gap-4"
          style={{
            width: "max-content",
            animation: "partners-marquee 30s linear infinite",
          }}
        >
          {logos.map((logo, index) => (
            <div
              key={index}
              className="flex items-center justify-center bg-[#f4f4f5] rounded-sm px-8 py-6 min-w-[220px] h-[110px] shrink-0"
            >
              <Image
                src={logo.url}
                alt={logo.alt || "Partner logo"}
                width={140}
                height={40}
                className="partner-logo w-auto grayscale opacity-70"
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes partners-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
