import Link from "next/link";
import type { PublicTenant } from "@/types";
import { whatsappLink } from "@/lib/utils";

export function Footer({ tenant }: { tenant: PublicTenant | null }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-base font-semibold text-gray-900">
            {tenant?.brandName || "Chemistry with Tahsan"}
          </p>
          <p className="mt-2 max-w-xs text-sm text-gray-500">
            Cambridge O Level / IGCSE / AS / A2 Chemistry — structured, clear
            and exam-focused, taught by {tenant?.ownerName || "MD. Manirul Islam Bhuyan"}.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">Quick links</p>
          <ul className="mt-2 space-y-1.5 text-sm text-gray-500">
            <li><Link href="/courses" className="hover:text-brand">Courses</Link></li>
            <li><Link href="/resources" className="hover:text-brand">Resources</Link></li>
            <li><Link href="/about" className="hover:text-brand">About</Link></li>
            <li><Link href="/contact" className="hover:text-brand">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">Get in touch</p>
          <ul className="mt-2 space-y-1.5 text-sm text-gray-500">
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-brand">
                WhatsApp: +{tenant?.whatsapp || "8801805722207"}
              </a>
            </li>
            {tenant?.address && <li>{tenant.address}</li>}
            {!tenant?.address && <li>Uttara, Dhaka</li>}
            <li className="flex gap-3 pt-1">
              {tenant?.facebookUrl && (
                <a href={tenant.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand">Facebook</a>
              )}
              {tenant?.instagramUrl && (
                <a href={tenant.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand">Instagram</a>
              )}
              {tenant?.youtubeUrl && (
                <a href={tenant.youtubeUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand">YouTube</a>
              )}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        © {year} {tenant?.brandName || "Chemistry with Tahsan"}. All rights reserved.
      </div>
    </footer>
  );
}
