"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { langHref } from "@/config";
import CloseIcon from "../../../public/p-close-icon.svg";
import InstagramIcon from "../../../public/p-mm-instagram.svg";
import FacebookIcon from "../../../public/p-mm-facebook.svg";
import LinkedInIcon from "../../../public/p-mm-linkedin.svg";
import MegaMenuLogo from "../../../public/p-mm-logo.svg";

const SOCIAL_ICONS = [
  { platform: "Instagram", match: ["instagram.com"], icon: InstagramIcon },
  { platform: "Facebook", match: ["facebook.com", "fb.com"], icon: FacebookIcon },
  { platform: "LinkedIn", match: ["linkedin.com"], icon: LinkedInIcon },
];

function hasChildren(item) {
  return Array.isArray(item?.children) && item.children.length > 0;
}

export default function MegaMenu({
  items = [],
  socialMedia = [],
  lang,
  open = false,
  onClose,
}) {
  const menuItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  const socialLinks = useMemo(
    () =>
      (Array.isArray(socialMedia) ? socialMedia : [])
        .map((item) => {
          const href = item?.url || item?.media_url || "";
          const normalizedUrl = href.toLocaleLowerCase();
          const social = SOCIAL_ICONS.find(({ match }) =>
            match.some((domain) => normalizedUrl.includes(domain))
          );

          return href && social ? { ...social, href } : null;
        })
        .filter(Boolean),
    [socialMedia]
  );
  const firstParentWithChildren = useMemo(
    () => menuItems.find((item) => hasChildren(item)) || null,
    [menuItems]
  );
  const [activeParentId, setActiveParentId] = useState(
    firstParentWithChildren?.id ?? null
  );
  const [shouldRender, setShouldRender] = useState(open);
  const [isVisible, setIsVisible] = useState(false);
  const closeButtonRef = useRef(null);

  const activeParent =
    menuItems.find(
      (item) => item.id === activeParentId && hasChildren(item)
    ) || firstParentWithChildren;

  useEffect(() => {
    let frameId;
    let visibilityFrameId;
    let exitTimer;

    frameId = window.requestAnimationFrame(() => {
      if (open) {
        setShouldRender(true);
        setActiveParentId(firstParentWithChildren?.id ?? null);
        visibilityFrameId = window.requestAnimationFrame(() => {
          setIsVisible(true);
        });
      } else {
        setIsVisible(false);
        exitTimer = window.setTimeout(() => setShouldRender(false), 300);
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(visibilityFrameId);
      window.clearTimeout(exitTimer);
    };
  }, [open, firstParentWithChildren]);

  useEffect(() => {
    if (!shouldRender) return;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const computedPaddingRight = Number.parseFloat(
      window.getComputedStyle(body).paddingRight
    ) || 0;
    const previouslyFocused = document.activeElement;

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${computedPaddingRight + scrollbarWidth}px`;
    }
    body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose, shouldRender]);

  if (!shouldRender || menuItems.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Close mega menu"
        onClick={onClose}
        className={`absolute inset-0 cursor-pointer bg-black/45 transition-opacity duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Mega menu"
        className={`absolute inset-y-0 right-0 flex h-dvh w-full flex-col overflow-y-auto bg-[#F2EBE2] px-8 py-8 shadow-[-12px_0_30px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out lg:w-1/2 lg:px-12 lg:py-12 ${
          isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="absolute right-6 top-6 z-20 inline-flex h-10 w-10 cursor-pointer items-center justify-center text-(--color-body) lg:right-[90px] lg:top-8"
        >
          <Image src={CloseIcon} alt="" width={26} height={26} aria-hidden="true" />
        </button>

        <div className="relative z-10 grid flex-1 grid-cols-2 gap-10 pt-12 xl:gap-16">
          <nav aria-label="Mega menu sections">
            <ul className="space-y-4">
              {menuItems.map((item) => {
                const itemHasChildren = hasChildren(item);
                const isActive = itemHasChildren && item.id === activeParent?.id;
                const className = `flex w-full items-center justify-between gap-5 text-left ff-larken text-[28px] leading-tight transition-colors ${
                  isActive ? "text-(--color-body)" : "text-(--color-body)/50"
                }`;

                return (
                  <li key={item.id}>
                    {itemHasChildren ? (
                      <button
                        type="button"
                        aria-expanded={isActive}
                        onMouseEnter={() => setActiveParentId(item.id)}
                        onFocus={() => setActiveParentId(item.id)}
                        onClick={() => setActiveParentId(item.id)}
                        className={`${className} cursor-pointer`}
                      >
                        <span>{item.title}</span>
                        {isActive && (
                          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true" className="shrink-0">
                            <path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    ) : (
                      <Link
                        href={langHref(item.url, lang)}
                        onClick={onClose}
                        className={className}
                      >
                        {item.title}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div aria-live="polite">
            {activeParent && (
              <ul className="space-y-5 pt-2">
                {activeParent.children.map((child, index) => (
                  <li key={child.id}>
                    <Link
                      href={langHref(child.url, lang)}
                      onClick={onClose}
                      className="grid grid-cols-[28px_minmax(0,1fr)] gap-2 text-[16px] leading-snug text-(--color-body) transition-opacity hover:opacity-60"
                    >
                      <span className="ff-larken text-[14px] font-light italic">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{child.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <Image
          src={MegaMenuLogo}
          alt=""
          width={410}
          height={533}
          aria-hidden="true"
          data-mega-menu-decoration
          className="pointer-events-none absolute bottom-0 right-0 z-0 h-auto w-[38%] max-w-[410px]"
        />

        {socialLinks.length > 0 && (
          <nav aria-label="Social media" className="relative z-10 mt-8 flex items-center gap-3">
            {socialLinks.map(({ platform, href, icon }) => (
              <a
                key={`${platform}-${href}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform}
                className="block h-12 w-12 shrink-0 transition-opacity hover:opacity-70"
              >
                <Image src={icon} alt="" width={48} height={48} aria-hidden="true" />
              </a>
            ))}
          </nav>
        )}
      </section>
    </div>
  );
}
