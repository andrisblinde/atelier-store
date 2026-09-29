import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { ListingHeader } from "@/components/product-listing";
import { getSession, safeNext } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next);

  return (
    <main id="main">
      <ListingHeader
        eyebrow="Your account"
        title="Create an account"
        intro="Create an account to keep your details with Atelier."
      />
      <div className="container-page pb-section">
        <AuthForm mode="sign-up" next={next} />
      </div>
    </main>
  );
}
