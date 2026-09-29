import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="container-prose section-space flex flex-1 flex-col items-center justify-center text-center">
      <p className="type-label text-ink-muted">Error 404</p>
      <h1 className="type-h1 mt-4">This page could not be found</h1>
      <p className="type-body mt-4 text-ink-muted">
        The piece or page you&rsquo;re looking for may have moved or is no longer available.
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        Return home
      </Link>
    </main>
  );
}
