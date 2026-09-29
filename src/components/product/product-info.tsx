import type { ReactNode } from "react";

type Section = { title: string; content: ReactNode; open?: boolean };

/* Native disclosure widgets; the shared `name` makes them an exclusive accordion. */
export function ProductInfo({ sections }: { sections: Section[] }) {
  return (
    <div className="border-t">
      {sections.map((section) => (
        <details
          key={section.title}
          name="product-info"
          open={section.open}
          className="group border-b"
        >
          <summary className="type-label flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
            {section.title}
            <span
              aria-hidden="true"
              className="text-base font-light transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="type-small pb-6 text-ink-muted">{section.content}</div>
        </details>
      ))}
    </div>
  );
}
