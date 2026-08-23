"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/students", label: "Students" },
  { href: "/dashboard/courses", label: "Courses" },
  { href: "/dashboard/batches", label: "Batches" },
  { href: "/dashboard/class-sessions", label: "Class Sessions" },
  { href: "/dashboard/payments", label: "Payments" },
  { href: "/dashboard/resources", label: "Resources" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col">
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
        <Image
          src="/images/logo.jpg"
          alt="Chemistry with Tahsan"
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
        <span className="text-sm font-semibold text-gray-900">Chemistry with Tahsan</span>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-light text-brand-dark"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 px-3 py-4">
        <Link href="/" className="block rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-50">
          ← Back to website
        </Link>
      </div>
    </aside>
  );
}
