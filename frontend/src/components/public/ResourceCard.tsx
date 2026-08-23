import Image from "next/image";
import { formatCurrency, whatsappLink } from "@/lib/utils";
import type { PublicResource } from "@/types";

export function ResourceCard({ resource }: { resource: PublicResource }) {
  const isFree = !resource.price || resource.price <= 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="relative aspect-[3/4] w-full bg-gray-100">
        <Image
          src={resource.coverImageUrl || "/images/handbook-cover-dark.jpg"}
          alt={resource.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-brand sm:text-xs">
          {resource.type.replaceAll("_", " ")}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900">{resource.title}</h3>
        {resource.description && (
          <p className="mt-1.5 line-clamp-2 hidden text-xs text-gray-500 sm:block">
            {resource.description}
          </p>
        )}
        <div className="mt-auto space-y-2 pt-3">
          <span className="block text-sm font-semibold text-gray-900">
            {isFree ? "Free" : formatCurrency(resource.price)}
          </span>
          <a
            href={whatsappLink(`Hi, I'd like to get "${resource.title}".`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-md bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-dark"
          >
            {isFree ? "Get on WhatsApp" : "Buy on WhatsApp"}
          </a>
        </div>
      </div>
    </div>
  );
}
