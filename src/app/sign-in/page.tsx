import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { ListingHeader } from "@/components/product-listing";
import { getSession, safeNext } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next);

  return (
    <main id="main">
      <ListingHeader
        eyebrow="Your account"
        title="Sign in"
        intro="Sign in to see your account."
      />
      <div className="container-page pb-section">
        <AuthForm mode="sign-in" next={next} />
      </div>
    </main>
  );
}
