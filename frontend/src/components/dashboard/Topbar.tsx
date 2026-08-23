"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
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

export function Topbar() {
  const { user, tenant, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <button
          className="rounded-md p-2 text-gray-600 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
        <div className="hidden md:block" />
        <div className="flex items-center gap-3">
          <Image
            src="/images/teacher-profile.jpg"
            alt={tenant?.ownerName || "Teacher"}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>

      {open && (
        <nav className="space-y-0.5 border-t border-gray-200 px-3 py-3 md:hidden">
          {navItems.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium",
                  active ? "bg-brand-light text-brand-dark" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
