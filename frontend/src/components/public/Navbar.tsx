"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/resources", label: "Resources" },
  { href: "/recorded-lectures", label: "Recorded Lectures" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ brandName }: { brandName?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.jpg"
            alt={brandName || "Chemistry with Tahsan"}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <span className="text-base font-semibold text-gray-900">
            {brandName || "Chemistry with Tahsan"}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand",
                pathname === link.href ? "text-brand" : "text-gray-600"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Teacher Login
          </Link>
        </nav>

        <button
          className="flex items-center justify-center rounded-md p-2 text-gray-600 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-gray-200 bg-white px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-md px-2 py-2 text-sm font-medium",
                pathname === link.href
                  ? "bg-brand-light text-brand-dark"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-1 rounded-md border border-gray-300 px-2 py-2 text-sm font-medium text-gray-700"
          >
            Teacher Login
          </Link>
        </nav>
      )}
    </header>
  );
}
