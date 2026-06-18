"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

function GalleryArrowIcon({ direction = "prev" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      className={direction === "next" ? "rotate-180" : ""}
      aria-hidden="true"
    >
      <rect
        x="0.416667"
        y="0.416667"
        width="39.1667"
        height="39.1667"
        rx="19.5833"
        stroke="#1E2E31"
        strokeOpacity="0.3"
        strokeWidth="0.833333"
      />
      <path
        d="M22.3536 23.9798C22.5488 24.1751 22.5488 24.4917 22.3536 24.6869C22.1583 24.8822 21.8417 24.8822 21.6464 24.6869L17.6464 20.6869C17.4512 20.4917 17.4512 20.1751 17.6464 19.9798L21.6464 15.9798C21.8417 15.7846 22.1583 15.7846 22.3536 15.9798C22.5488 16.1751 22.5488 16.4917 22.3536 16.6869L18.7071 20.3334L22.3536 23.9798Z"
        fill="#1E2E31"
      />
    </svg>
  );
}

function getImageUrl(image) {
  if (!image) return "";
  if (typeof image === "string") return image;

  return (
    image.src ||
    image.source_url ||
    image.url ||
    image.thumbnail ||
    image.full_src ||
    image.sizes?.woocommerce_single ||
    image.sizes?.large ||
    image.media_details?.sizes?.full?.source_url ||
    image.media_details?.sizes?.large?.source_url ||
    ""
  );
}

function getImageAlt(image, fallback = "Product image") {
  if (!image || typeof image === "string") return fallback;

  return (
    image.alt ||
    image.alt_text ||
    image.name ||
    image.title?.rendered ||
    image.title ||
    fallback
  );
}

function addImage(images, image) {
  const url = getImageUrl(image);
  if (!url || images.some((item) => item.url === url)) return;

  images.push({
    url,
    alt: getImageAlt(image),
  });
}

function getGalleryImages(product) {
  const images = [];

  addImage(images, product?._embedded?.["wp:featuredmedia"]?.[0]);
  addImage(images, product?.featured_image);
  addImage(images, product?.featured_image_url);

  [
    product?.woo?.images,
    product?.images,
    product?.gallery_images,
    product?.product_gallery,
    product?.acf?.gallery,
    product?.acf?.product_gallery,
    product?.acf?.product_images,
  ].forEach((gallery) => {
    if (!Array.isArray(gallery)) return;
    gallery.forEach((image) => addImage(images, image));
  });

  return images;
}

export default function ProductGallery({ product }) {
  const images = useMemo(() => getGalleryImages(product), [product]);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  if (images.length === 0) {
    return null;
  }

  const showNavigation = images.length > 1;

  return (
    <div className="product-gallery">
      <div className="relative bg-white rounded-lg">
        <Swiper
          modules={[Navigation, Thumbs]}
          navigation={
            showNavigation
              ? {
                  prevEl: ".product-gallery-prev",
                  nextEl: ".product-gallery-next",
                }
              : false
          }
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          className="product-gallery-main"
        >
          {images.map((image, index) => (
            <SwiperSlide key={`${image.url}-${index}`}>
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1408px) 664px, (min-width: 1024px) calc((100vw - 128px) / 2), 100vw"
                  className="object-contain p-4 md:p-4"
                  priority={index === 0}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {showNavigation && (
          <>
            <button
              type="button"
              aria-label="Previous product image"
              className="product-gallery-prev absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition hover:bg-white/60"
            >
              <GalleryArrowIcon />
            </button>
            <button
              type="button"
              aria-label="Next product image"
              className="product-gallery-next absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition hover:bg-white/60"
            >
              <GalleryArrowIcon direction="next" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbsSwiper}
          slidesPerView={4}
          spaceBetween={8}
          watchSlidesProgress
          breakpoints={{
            640: { slidesPerView: 5, spaceBetween: 10 },
            1024: { slidesPerView: 5, spaceBetween: 12 },
          }}
          className="product-gallery-thumbs mt-2"
        >
          {images.map((image, index) => (
            <SwiperSlide key={`thumb-${image.url}-${index}`}>
              <button
                type="button"
                className="relative block aspect-square w-full overflow-hidden rounded-sm border border-[#C7C0B6] bg-white"
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="110px"
                  className="object-contain p-2"
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
