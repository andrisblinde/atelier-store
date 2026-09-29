"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { primaryNav } from "@/components/navigation";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const openButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    openButton.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        openButton.current?.focus();
      }
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={openButton}
        type="button"
        className="btn btn-icon -ml-3"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </button>

      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className="fixed inset-0 z-50 overflow-y-auto bg-canvas"
      >
        <div className="container-page flex h-header items-center border-b">
          <button
            ref={closeButton}
            type="button"
            className="btn btn-icon -ml-3"
            aria-label="Close menu"
            onClick={close}
          >
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Mobile">
          <ul className="container-page divide-y divide-line py-2">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="type-h2 block py-4"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="container-page flex flex-col gap-4 pt-6 pb-10">
          <Link
            href="/account"
            className="btn btn-secondary"
            onClick={() => setOpen(false)}
          >
            Sign in
          </Link>
          <Link
            href="/contact"
            className="type-label link-quiet self-center py-2 text-ink-muted"
            onClick={() => setOpen(false)}
          >
            Client services
          </Link>
        </div>
      </div>
    </div>
  );
}
