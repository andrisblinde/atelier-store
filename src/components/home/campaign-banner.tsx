import Image from "next/image";
import Link from "next/link";
import { banner } from "@/lib/catalog";

export function CampaignBanner() {
  return (
    <section
      aria-labelledby="banner-title"
      className="relative isolate flex min-h-[28rem] items-center justify-center overflow-hidden bg-surface md:aspect-hero md:min-h-0 md:max-h-[52rem] md:w-full"
    >
      <Image
        src={banner.image.src}
        alt={banner.image.alt}
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-black/35" />

      <div className="container-prose flex flex-col items-center gap-5 py-section text-center text-canvas">
        <p className="type-label">{banner.eyebrow}</p>
        <h2 id="banner-title" className="type-display">
          {banner.title}
        </h2>
        <Link href={banner.href} className="btn btn-inverse mt-3">
          Shop essentials
        </Link>
      </div>
    </section>
  );
}
