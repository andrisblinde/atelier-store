import { getNewArrivals } from "@/db/queries/products";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";

export async function NewArrivals() {
  const products = await getNewArrivals();

  return (
    <section aria-labelledby="new-arrivals-title" className="container-page section-space border-t">
      <SectionHeading
        id="new-arrivals-title"
        eyebrow="Just landed"
        title="New arrivals"
        link={{ label: "View all", href: "/new-in" }}
      />

      <ul className="product-grid">
        {products.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
