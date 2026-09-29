import Link from "next/link";
import { AccountIcon, BagIcon, SearchIcon } from "@/components/icons";
import { MobileMenu } from "@/components/mobile-menu";
import { primaryNav } from "@/components/navigation";

export function SiteHeader() {
  return (
    <>
      <p className="type-label flex h-announcement items-center justify-center bg-ink px-gutter text-center text-canvas">
        Complimentary shipping and returns
        <span className="hidden sm:inline">&nbsp;on all orders</span>
      </p>

      {/* No backdrop-filter here: it would trap the fixed mobile menu inside the header. */}
      <header className="sticky top-0 z-30 border-b bg-canvas">
        <div className="container-page grid h-header grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center">
            <MobileMenu />
            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-7">
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="type-label link-quiet">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <Link
            href="/"
            className="text-lg font-medium tracking-[0.35em] sm:text-xl"
            aria-label="Atelier, home"
          >
            {/* Trailing tracking would push the wordmark off-centre. */}
            <span className="-mr-[0.35em]">ATELIER</span>
          </Link>

          <div className="-mr-3 flex items-center justify-end">
            <Link href="/search" className="btn btn-icon" aria-label="Search">
              <SearchIcon />
            </Link>
            <Link
              href="/account"
              className="btn btn-icon hidden sm:inline-flex"
              aria-label="Account"
            >
              <AccountIcon />
            </Link>
            <Link href="/bag" className="btn btn-icon" aria-label="Shopping bag, empty">
              <BagIcon />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
