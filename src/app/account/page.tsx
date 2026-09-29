import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ListingHeader } from "@/components/product-listing";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

const memberSince = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

export default async function AccountPage() {
  const { user } = await requireUser("/account");

  return (
    <main id="main">
      <ListingHeader
        eyebrow="Your account"
        title={`Hello, ${user.name.trim().split(/\s+/)[0] || "there"}`}
        intro="Your details at Atelier."
      />
      <div className="container-page pb-section">
        <dl className="max-w-md divide-y border-y">
          <Detail label="Name" value={user.name} />
          <Detail label="Email" value={user.email} />
          <Detail label="Member since" value={memberSince.format(user.createdAt)} />
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <SignOutButton />
          {user.role === "admin" && (
            <Link href="/admin" className="btn btn-secondary">
              Admin
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-4">
      <dt className="type-label text-ink-muted">{label}</dt>
      <dd className="type-body">{value}</dd>
    </div>
  );
}
