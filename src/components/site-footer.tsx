import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { footerNav } from "@/components/navigation";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-surface">
      <div className="container-page grid gap-12 py-section lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-gutter">
        <div className="max-w-md">
          <h2 className="type-h3">Join the Atelier list</h2>
          <p className="type-small mt-2 mb-6 text-ink-muted">
            Early access to new collections, private sales and stories from
            the workshop. Unsubscribe at any time.
          </p>
          <NewsletterForm />
        </div>

        <div className="grid grid-cols-2 gap-x-gutter gap-y-10 sm:grid-cols-3">
          {footerNav.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="type-label mb-4">{group.heading}</h2>
              <ul className="type-small space-y-2.5 text-ink-muted">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="link-quiet hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t">
        <div className="container-page type-small flex flex-col gap-2 py-6 text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Atelier. All rights reserved.</p>
          <p>United States (USD $)</p>
        </div>
      </div>
    </footer>
  );
}
