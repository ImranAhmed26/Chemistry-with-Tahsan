import Image from "next/image";
import Link from "next/link";
import { CourseCard } from "@/components/public/CourseCard";
import { ResourceCard } from "@/components/public/ResourceCard";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { getPublicCourses, getPublicResources } from "@/lib/public";

const testimonials = [
  {
    quote:
      "Sir's structured notes and past-paper drilling made the biggest difference in my A2 result. Every topic was broken down step by step.",
    name: "Rafid H.",
    detail: "CAIE A2 Chemistry",
  },
  {
    quote:
      "I went from struggling with organic chemistry to actually enjoying it. The revision maps before exams were a lifesaver.",
    name: "Nusrat J.",
    detail: "EDXL AS Chemistry",
  },
  {
    quote:
      "Very disciplined and exam-focused teaching. Clear explanations, regular tests, and honest feedback on where I stood.",
    name: "Tanvir A.",
    detail: "CAIE IGCSE Chemistry",
  },
];

export default async function HomePage() {
  const [courses, resources] = await Promise.all([
    getPublicCourses(),
    getPublicResources(),
  ]);

  const featuredCourses = courses.slice(0, 3);
  const featuredResources = resources.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 md:items-center md:py-20">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
            Cambridge O Level / IGCSE / AS / A2 Chemistry — Made Structured,
            Clear &amp; Exam-Focused
          </h1>
          <p className="mt-4 text-base text-gray-600">
            17+ years of teaching experience. Specialist in Cambridge (CAIE)
            &amp; Edexcel Chemistry, from Pre O-Level to A2.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/resources"
              className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Buy Chemistry Notes
            </Link>
            <Link
              href="/courses"
              className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Join Classes
            </Link>
            <Link
              href="/resources"
              className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Get Free Sample PDF
            </Link>
            <WhatsAppButton message="Hi, I'd like to know more about your Chemistry classes." />
          </div>
        </div>
        <div className="relative mx-auto aspect-[1324/1600] w-full max-w-sm overflow-hidden rounded-xl">
          <Image
            src="/images/teacher-hero-banner.jpg"
            alt="MD. Manirul Islam Bhuyan (Tahsan) — Chemistry Teacher"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      </section>

      {/* Featured courses */}
      {featuredCourses.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Featured Courses</h2>
              <Link href="/courses" className="text-sm font-medium text-brand hover:underline">
                View all courses →
              </Link>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured resources */}
      {featuredResources.length > 0 && (
        <section>
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Featured Resources</h2>
              <Link href="/resources" className="text-sm font-medium text-brand hover:underline">
                View all resources →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
              {featuredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-3 md:items-start">
            <div className="md:col-span-1">
              <h2 className="text-xl font-semibold text-gray-900">What students say</h2>
              <div className="relative mt-4 aspect-[1055/1491] w-full max-w-xs overflow-hidden rounded-xl">
                <Image
                  src="/images/teacher-with-student.jpg"
                  alt="Chemistry Handbook by Tahsan"
                  fill
                  className="object-contain"
                  sizes="320px"
                />
              </div>
            </div>
            <div className="grid gap-4 md:col-span-2 md:grid-cols-1">
              {testimonials.map((t, i) => (
                <blockquote key={i} className="rounded-lg border border-gray-200 bg-white p-5">
                  <p className="text-sm text-gray-600">&ldquo;{t.quote}&rdquo;</p>
                  <footer className="mt-3 text-sm font-medium text-gray-900">
                    {t.name} <span className="font-normal text-gray-400">— {t.detail}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp strip */}
      <section className="bg-brand">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:px-6 md:flex-row md:text-left">
          <p className="text-base font-medium text-white">
            Have a question about classes, notes, or schedules?
          </p>
          <WhatsAppButton variant="inverted" message="Hi, I have a question about your Chemistry classes.">
            Message on WhatsApp
          </WhatsAppButton>
        </div>
      </section>
    </div>
  );
}
