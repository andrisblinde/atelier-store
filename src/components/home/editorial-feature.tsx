import Image from "next/image";
import Link from "next/link";
import { editorial } from "@/lib/catalog";

/* Image-led story block: large photo beside a short piece of copy. */
export function EditorialFeature() {
  return (
    <section aria-labelledby="editorial-title" className="bg-surface">
      <div className="grid md:grid-cols-2">
        <div className="media-frame aspect-editorial md:aspect-auto md:min-h-[40rem]">
          <Image
            src={editorial.image.src}
            alt={editorial.image.alt}
            fill
            sizes="(min-width: 48rem) 50vw, 100vw"
            className="object-[50%_25%]"
          />
        </div>

        <div className="flex items-center px-gutter py-section md:px-[max(var(--spacing-gutter),6vw)]">
          <div className="max-w-md">
            <p className="type-label mb-4 text-ink-muted">{editorial.eyebrow}</p>
            <h2 id="editorial-title" className="type-h1">
              {editorial.title}
            </h2>
            <p className="type-body mt-5 text-ink-muted">{editorial.body}</p>
            <Link href={editorial.href} className="btn btn-secondary mt-8">
              Read the story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
