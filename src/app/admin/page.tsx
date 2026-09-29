import type { Metadata } from "next";
import { ListingHeader } from "@/components/product-listing";
import { getCatalogueCounts } from "@/db/queries/products";
import { getRecentUsers, getUserStats } from "@/db/queries/users";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const joined = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function AdminPage() {
  // Signed out → sign in; signed in without the admin role → 404.
  await requireAdmin();
  const [catalogue, users, recent] = await Promise.all([
    getCatalogueCounts(),
    getUserStats(),
    getRecentUsers(),
  ]);

  const stats = [
    { label: "Products", value: catalogue.products },
    { label: "Categories", value: catalogue.categories },
    { label: "Customers", value: users.customers },
    { label: "Admins", value: users.admins },
  ];

  return (
    <main id="main">
      <ListingHeader eyebrow="Atelier admin" title="Overview" intro="Store totals and recent sign-ups." />
      <div className="container-page pb-section">
        <dl className="grid grid-cols-2 gap-px border bg-line md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-canvas p-6">
              <dt className="type-label text-ink-muted">{stat.label}</dt>
              <dd className="type-h1 mt-3 tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <section aria-labelledby="recent-title" className="mt-12">
          <h2 id="recent-title" className="type-label mb-4 text-ink-muted">
            Recent sign-ups
          </h2>
          <div className="overflow-x-auto">
            <table className="type-small w-full min-w-[32rem] border-y text-left">
              <thead>
                <tr className="border-b">
                  <th scope="col" className="type-label py-3 pr-4 font-medium">Name</th>
                  <th scope="col" className="type-label py-3 pr-4 font-medium">Email</th>
                  <th scope="col" className="type-label py-3 pr-4 font-medium">Role</th>
                  <th scope="col" className="type-label py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recent.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 pr-4">{row.name}</td>
                    <td className="py-3 pr-4 text-ink-muted">{row.email}</td>
                    <td className="py-3 pr-4 capitalize">{row.role}</td>
                    <td className="py-3 tabular-nums text-ink-muted">{joined.format(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
