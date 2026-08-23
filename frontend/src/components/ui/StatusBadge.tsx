import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-100 text-gray-600",
  INACTIVE: "bg-gray-100 text-gray-600",
  UPCOMING: "bg-blue-100 text-blue-800",
  ONGOING: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-700",
  WITHDRAWN: "bg-red-100 text-red-700",
  SCHEDULED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-red-100 text-red-700",
  PRESENT: "bg-green-100 text-green-800",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-yellow-100 text-yellow-800",
  EXCUSED: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  PARTIALLY_PAID: "bg-orange-100 text-orange-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-700",
  DRAFT: "bg-gray-100 text-gray-600",
  PUBLISHED: "bg-green-100 text-green-800",
  PUBLIC: "bg-green-100 text-green-800",
  ENROLLED_ONLY: "bg-blue-100 text-blue-800",
  PRIVATE: "bg-gray-100 text-gray-600",
};

export function StatusBadge({ status }: { status: string }) {
  const classes = colorMap[status] || "bg-gray-100 text-gray-600";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        classes
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
