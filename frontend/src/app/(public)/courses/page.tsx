import { CourseCard } from "@/components/public/CourseCard";
import { EmptyState } from "@/components/ui/States";
import { getPublicCourses } from "@/lib/public";
import { ACADEMIC_LEVELS } from "@/types";
import type { PublicCourse } from "@/types";

export default async function CoursesPage() {
  const courses = await getPublicCourses();

  const grouped = new Map<string, PublicCourse[]>();
  for (const level of ACADEMIC_LEVELS) grouped.set(level, []);
  for (const course of courses) {
    const key = grouped.has(course.academicLevel) ? course.academicLevel : "Other";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(course);
  }

  const groupsWithCourses = Array.from(grouped.entries()).filter(
    ([, list]) => list.length > 0
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <p className="mt-2 text-sm text-gray-500">
          Structured Chemistry programs from Cambridge Pre-O Level through
          CAIE A2, run in small batches with a fixed weekly schedule.
        </p>
      </div>

      {groupsWithCourses.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Courses coming soon"
            description="Course listings will appear here shortly. Message on WhatsApp for current batch availability."
          />
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {groupsWithCourses.map(([level, list]) => (
            <section key={level}>
              <h2 className="text-lg font-semibold text-gray-900">{level}</h2>
              <div className="mt-4 grid gap-5 md:grid-cols-3">
                {list.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
