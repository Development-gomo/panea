"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import ArrowSvg from "../../../../public/right-arrow.svg";
import CalenerSvg from "../../../../public/calender.svg";
import { DEFAULT_LANG, langHref } from "@/config";

export default function HomeNews({ data, lang = DEFAULT_LANG, prefetchedPosts }) {
  const posts = prefetchedPosts || [];
  const { sub_heading, heading, cta_text, cta_url } = data || {};

  if (!posts.length) return null;

  /* ------------------------------------------------------------
     EXTRACT CATEGORY ("webinar", "insights", etc.)
  ------------------------------------------------------------ */
  function getCategories(post) {
    const terms = post?._embedded?.["wp:term"]?.[0] || [];
    return terms.filter((t) => t.taxonomy === "category");
  }

  // First post with category "webinar"
  const webinarPost =
    posts.find((post) =>
      getCategories(post).some((cat) => cat.slug === "webinar")
    ) || posts[0]; // fallback

  // Other posts (non-webinar)
  const otherPosts = posts
    .filter(
      (post) =>
        !getCategories(post).some((cat) => cat.slug === "webinar") &&
        post.id !== webinarPost.id
    )
    .slice(0, 2);

  return (
    <section className="py-15 md:py-30 web-width px-6">
      {/* SUB HEADING */}
      {sub_heading && (
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
      )}

      {/* HEADING + CTA */}
      <div className="md:flex md:justify-between items-end mb-12">
        <motion.div
          className="section-heading mb-5 md:mb-0"
          dangerouslySetInnerHTML={{ __html: heading }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          viewport={{ once: true }}
        />

        {cta_text && cta_url && (
          <Link
            href={langHref(cta_url, lang)}
            className="
              gap-3 group relative inline-flex items-center
              rounded-sm bg-(--color-brand) px-6 py-4 text-white
              transition-all duration-300 hover:bg-(--color-brand)
              w-[235px] overflow-hidden select-none
            "
          >
            {/* LEFT DOT */}
            <span className="relative w-6 flex items-center justify-center">
              <span
                className="
                  absolute h-2 w-2 rounded-full bg-[#27E0C0]
                  transition-all duration-300 ease-out
                  group-hover:opacity-0 group-hover:-translate-x-1
                "
              ></span>
            </span>

            {/* TEXT */}
            <span
              className="
                flex-1 text-[16px] leading-none
                transition-all duration-300 ease-out
                group-hover:-translate-x-4
                whitespace-nowrap
              "
            >
              {cta_text}
            </span>

            {/* ARROW */}
            <span className="relative w-4 flex items-center justify-center">
              <span
                className="
                  w-4 absolute opacity-0 -translate-x-4
                  transition-all duration-300 ease-out
                  group-hover:opacity-100 group-hover:-translate-x-2
                "
              >
                <Image src={ArrowSvg} width={13} height={13} alt="arrow" />
              </span>
            </span>
          </Link>
        )}
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8">
        {/* ------------------------------------------------------------
           LEFT BIG WEBINAR CARD
        ------------------------------------------------------------ */}
        <Link
          href={langHref(`/post/${webinarPost.slug}`, lang)}
          className="relative rounded-lg overflow-hidden block group"
        >
          {/* FEATURED IMAGE */}
          {webinarPost?._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
            <Image
              src={webinarPost._embedded["wp:featuredmedia"][0].source_url}
              width={700}
              height={420}
              alt={webinarPost.title.rendered}
              className="w-full h-[430px] object-cover group-hover:scale-105 transition-all duration-500"
            />
          )}

          {/* GRADIENT OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

          {/* CATEGORY BADGE */}
          <div className="absolute top-8 left-8">
            <span className="bg-(--color-bg) backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[12px] leading-[15px] flex items-center gap-2">
              <span className="h-2 w-2 bg-(--color-accent) rounded-full"></span>
              {getCategories(webinarPost)[0]?.name || "Webinar"}
            </span>
          </div>

          {/* TEXT */}
          <div className="absolute flex bottom-8 left-8 right-8 md:justify-between  flex-col md:flex-row">
            <div className="mt-4 max-w-[380px]">
              <h3
                className="text-white text-[32px] leading-[34px] font-medium mb-6"
                dangerouslySetInnerHTML={{ __html: webinarPost.title.rendered }}
              />
              {/* CTA BUTTON */}

              <p className=" gap-3 group relative inline-flex items-center rounded-sm bg-(--color-brand) px-6 py-4 text-white transition-all duration-300 hover:bg-(--color-brand) w-[180px] overflow-hidden select-none">
                {/* LEFT DOT */}
                <span className="relative w-6 flex items-center justify-center">
                  <span className="absolute h-2 w-2 rounded-full bg-[#27E0C0] transition-all duration-300 ease-out group-hover:opacity-0 group-hover:-translate-x-1"></span>
                </span>

                {/* TEXT */}
                <span
                  className="
                      flex-1 text-[16px] leading-none
                      transition-all duration-300 ease-out
                      group-hover:-translate-x-4
                      whitespace-nowrap">Join the session</span>

                {/* ARROW */}
                <span className="relative w-4 flex items-center justify-center">
                  <span
                    className="
                        w-4 absolute opacity-0 -translate-x-4
                        transition-all duration-300 ease-out
                        group-hover:opacity-100 group-hover:-translate-x-2
                      "
                  >
                    <Image src={ArrowSvg} width={13} height={13} alt="arrow" />
                  </span>
                </span>
              </p>
            </div>
            <div className="div mt-6 md:mt-0">
              {(webinarPost?.acf?.webinar_date ||
                webinarPost?.acf?.webinar_time) && (
                <div className="text-white/90 md:mb-4">
                  <p className="text-sm">Starts:</p>
                  <p className="font-semibold">
                    {webinarPost?.acf?.webinar_date || ""}
                    {webinarPost?.acf?.webinar_time && (
                      <>
                        <br />
                        {webinarPost.acf.webinar_time}
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* ------------------------------------------------------------
           RIGHT SIDE — TWO SMALL POSTS
        ------------------------------------------------------------ */}
        <div className="flex flex-col gap-6">
          {otherPosts.map((post) => {
            const img =
              post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";

            const category = getCategories(post)[0]?.name || "Insights";

            return (
              <Link
                key={post.id}
                href={langHref(`/post/${post.slug}`, lang)}
                className="flex gap-6 group items-center"
              >
                {/* IMAGE */}
                <div className="w-[140px] h-[204px] overflow-hidden rounded-lg">
                  {img && (
                    <Image
                      src={img}
                      width={140}
                      height={120}
                      alt={post.title.rendered}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                  )}
                </div>

                {/* TEXT AREA */}
                <div className="flex-1">
                  <span className="bg-white/20 border border-gray-300 w-[85px] mb-3 text-[#9192A0] px-3 py-[6px] rounded-full text-xs flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 bg-(--color-accent) rounded-full"></span>
                    {category}
                  </span>

                  <h4
                    className="font-medium text-[18px] leading-[26px] mb-4"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />

                  <div className="text-[14px] text-[#9192A0]">
                    <Image
                      src={CalenerSvg}
                      width={12}
                      height={12}
                      alt="calendar"
                      className="inline-block mr-1 mb-1"
                    />
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
