import Link from "next/link";
import { ArrowIcon } from "@/components/icons";

type SectionHeadingProps = {
  id: string;
  eyebrow?: string;
  title: string;
  link?: { label: string; href: string };
};

export function SectionHeading({ id, eyebrow, title, link }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 md:mb-12">
      <div>
        {eyebrow && <p className="type-label mb-3 text-ink-muted">{eyebrow}</p>}
        <h2 id={id} className="type-h1">
          {title}
        </h2>
      </div>
      {link && (
        <Link
          href={link.href}
          className="type-label link-quiet flex shrink-0 items-center gap-2 py-2"
        >
          {link.label}
          <ArrowIcon width={16} height={16} />
        </Link>
      )}
    </div>
  );
}
