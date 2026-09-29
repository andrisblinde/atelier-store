"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { BagIcon } from "@/components/icons";
import { BAG_CHANGE_EVENT, BAG_COOKIE, bagCount, parseBag } from "@/lib/cart";

/*
 * The header's bag link with an item count read from the bag cookie in the
 * browser, so the header (and every page) stays static. The count is a hint;
 * the bag page re-checks every line against live stock.
 */
function readCount() {
  const entry = document.cookie.split("; ").find((cookie) => cookie.startsWith(`${BAG_COOKIE}=`));
  if (!entry) return 0;
  try {
    return bagCount(parseBag(decodeURIComponent(entry.slice(BAG_COOKIE.length + 1))));
  } catch {
    return 0;
  }
}

function subscribe(onChange: () => void) {
  // Bag actions in this tab fire BAG_CHANGE_EVENT; focus catches other tabs.
  window.addEventListener(BAG_CHANGE_EVENT, onChange);
  window.addEventListener("focus", onChange);
  return () => {
    window.removeEventListener(BAG_CHANGE_EVENT, onChange);
    window.removeEventListener("focus", onChange);
  };
}

export function BagLink() {
  const count = useSyncExternalStore(subscribe, readCount, () => 0);

  return (
    <Link
      href="/bag"
      className="btn btn-icon relative"
      aria-label={
        count === 0 ? "Shopping bag, empty" : `Shopping bag, ${count} item${count === 1 ? "" : "s"}`
      }
    >
      <BagIcon />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1.5 right-0.5 flex h-4 min-w-4 items-center justify-center bg-ink px-1 text-2xs leading-none text-canvas tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
