import Image from "next/image";
import Link from "next/link";
import { hero } from "@/lib/catalog";

/* Full-bleed split campaign image with the headline set over it. */
export function Hero() {
  const [primary, secondary] = hero.images;

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate grid h-[calc(100svh-var(--spacing-header)-var(--spacing-announcement))] min-h-[32rem] max-h-[64rem] grid-cols-1 bg-surface md:grid-cols-2"
    >
      <div className="relative">
        <Image
          src={primary.src}
          alt={primary.alt}
          fill
          preload
          sizes="(min-width: 48rem) 50vw, 100vw"
          className="object-cover object-[50%_30%]"
        />
      </div>
      <div className="relative hidden md:block">
        <Image
          src={secondary.src}
          alt={secondary.alt}
          fill
          loading="eager"
          sizes="50vw"
          className="object-cover object-[50%_35%]"
        />
      </div>

      {/* Bottom scrim keeps the white type readable on any photo. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0">
        <div className="container-page flex flex-col items-start gap-5 pb-10 text-canvas md:items-center md:pb-14 md:text-center">
          <p className="type-label">{hero.eyebrow}</p>
          <h1 id="hero-title" className="type-display">
            {hero.title}
          </h1>
          <p className="type-body max-w-md text-canvas/85">{hero.description}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link href={hero.href} className="btn btn-inverse">
              Discover the edit
            </Link>
            <Link
              href="/new-in"
              className="btn border-canvas text-canvas hover:bg-canvas hover:text-ink"
            >
              Shop new in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
