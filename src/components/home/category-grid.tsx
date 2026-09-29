import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/catalog";
import { SectionHeading } from "@/components/section-heading";

export function CategoryGrid() {
  return (
    <section aria-labelledby="categories-title" className="container-page section-space">
      <SectionHeading
        id="categories-title"
        eyebrow="Shop by category"
        title="Explore the house"
        link={{ label: "Shop all", href: "/shop" }}
      />

      <ul className="grid grid-cols-2 gap-x-grid-x gap-y-8 lg:grid-cols-4">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link href={`/${category.slug}`} className="group block">
              <div className="media-frame aspect-editorial">
                <Image
                  src={category.image.src}
                  alt=""
                  fill
                  sizes="(min-width: 64rem) 25vw, 50vw"
                  className="transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <p className="type-label link-quiet mt-4 group-hover:decoration-current">
                {category.name}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
