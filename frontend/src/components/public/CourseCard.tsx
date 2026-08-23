import { whatsappLink } from "@/lib/utils";
import type { PublicCourse } from "@/types";

export function CourseCard({ course }: { course: PublicCourse }) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-brand">
        {course.academicLevel} · {course.examBoard}
      </p>
      <h3 className="mt-1 text-lg font-semibold text-gray-900">{course.name}</h3>
      {course.description && (
        <p className="mt-2 text-sm text-gray-500">{course.description}</p>
      )}

      {course.batches?.length > 0 ? (
        <ul className="mt-4 space-y-1.5 text-sm text-gray-600">
          {course.batches.map((batch, i) => (
            <li key={i} className="flex items-center justify-between rounded bg-gray-50 px-2.5 py-1.5">
              <span>{batch.name}{batch.schedule ? ` — ${batch.schedule}` : ""}</span>
              <span className="text-xs text-gray-400">{batch.status}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-gray-400">Batches announced soon.</p>
      )}

      <a
        href={whatsappLink(`Hi, I'm interested in the ${course.name} course.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center justify-center rounded-md border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light"
      >
        Contact on WhatsApp
      </a>
    </div>
  );
}
