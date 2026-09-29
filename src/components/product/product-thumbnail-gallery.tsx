"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/product";

type ProductThumbnailGalleryProps = {
  images: ProductImage[];
  /* `sizes` for the main image. */
  sizes: string;
};

export function ProductThumbnailGallery({ images, sizes }: ProductThumbnailGalleryProps) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    // Thumbnails sit under the main image on small screens and in a column to its left on desktop.
    <div className="lg:grid lg:grid-cols-[4.5rem_minmax(0,1fr)] lg:items-start lg:gap-grid-x">
      <div className="media-frame lg:col-start-2 lg:row-start-1">
        {/* Keyed so the new image replaces the old one instead of morphing its src. */}
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          preload={active === 0}
          sizes={sizes}
        />
      </div>

      <ul
        aria-label="Product images"
        className="mt-grid-x grid grid-cols-5 gap-grid-x px-gutter sm:grid-cols-6 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:grid-cols-1 lg:px-0"
      >
        {images.map((image, index) => (
          <li key={image.src}>
            <button
              type="button"
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-current={index === active}
              onClick={() => setActive(index)}
              className={`media-frame block w-full cursor-pointer border transition-colors ${
                index === active ? "border-line-strong" : "border-transparent hover:border-line"
              }`}
            >
              {/* Eager: thumbnails sit near the top of the page, and the first shares the main image's src. */}
              <Image src={image.src} alt="" fill loading="eager" sizes="(min-width: 64rem) 72px, (min-width: 40rem) 15vw, 18vw" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
