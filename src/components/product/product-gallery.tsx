import Image from "next/image";
import { ProductThumbnailGallery } from "@/components/product/product-thumbnail-gallery";
import type { Product } from "@/lib/product";

const MAIN_IMAGE_SIZES = "(min-width: 64rem) 58vw, 100vw";

/* Shows exactly the images in the product data: a single image on its own,
   or a main image with thumbnails when there are several. */
export function ProductGallery({ product }: { product: Product }) {
  const [first, ...rest] = product.images;

  if (rest.length === 0) {
    return (
      <div className="media-frame">
        <Image src={first.src} alt={first.alt} fill preload sizes={MAIN_IMAGE_SIZES} />
      </div>
    );
  }

  return <ProductThumbnailGallery images={product.images} sizes={MAIN_IMAGE_SIZES} />;
}
