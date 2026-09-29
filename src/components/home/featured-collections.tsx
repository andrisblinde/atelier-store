import Image from "next/image";
import Link from "next/link";
import { collections } from "@/lib/catalog";
import { SectionHeading } from "@/components/section-heading";

export function FeaturedCollections() {
  return (
    <section aria-labelledby="collections-title" className="container-page section-space">
      <SectionHeading
        id="collections-title"
        eyebrow="Featured collections"
        title="Dressed for every occasion"
      />

      <ul className="grid gap-x-grid-x gap-y-grid-y md:grid-cols-3">
        {collections.map((collection) => (
          <li key={collection.slug}>
            <Link href={`/collections/${collection.slug}`} className="group block">
              <div className="media-frame aspect-editorial">
                <Image
                  src={collection.image.src}
                  alt={collection.image.alt}
                  fill
                  sizes="(min-width: 48rem) 33vw, 100vw"
                  className="transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <h3 className="type-h2 mt-5">{collection.name}</h3>
              <p className="type-small mt-1 text-ink-muted">{collection.description}</p>
              <span className="type-label link-quiet mt-4 inline-block group-hover:decoration-current">
                Explore
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
