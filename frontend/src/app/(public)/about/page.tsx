import Image from "next/image";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { getPublicTenant } from "@/lib/public";

export default async function AboutPage() {
  const tenant = await getPublicTenant();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="grid gap-8 md:grid-cols-3 md:items-start">
        <div className="relative mx-auto aspect-[900/1600] w-full max-w-[220px] overflow-hidden rounded-xl md:mx-0">
          <Image
            src="/images/teacher-profile.jpg"
            alt={tenant?.ownerName || "MD. Manirul Islam Bhuyan"}
            fill
            className="object-cover"
            sizes="220px"
          />
        </div>
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {tenant?.ownerName || "MD. Manirul Islam Bhuyan"} — &ldquo;Tahsan&rdquo;
          </h1>
          <p className="mt-1 text-sm font-medium text-brand">
            Cambridge (CAIE) &amp; Edexcel Chemistry Specialist
          </p>

          <div className="mt-5 space-y-4 text-sm leading-relaxed text-gray-600">
            <p>
              With over 17 years of teaching experience, {tenant?.ownerName || "Tahsan"} has
              guided hundreds of students through O Level, IGCSE, AS and A2
              Chemistry across both the Cambridge (CAIE) and Edexcel syllabi.
              He holds a B.Pharm background, which grounds his teaching in a
              strong command of the underlying chemistry rather than rote
              memorisation, and is based in Uttara, Dhaka.
            </p>
            <p>
              {tenant?.bio}
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-brand-light bg-brand-light/40 p-5">
            <h2 className="text-sm font-semibold text-gray-900">Teaching philosophy</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Chemistry rewards structure, not shortcuts — every topic is
              broken into clear building blocks, connected back to the exact
              command words and mark schemes examiners use, and reinforced
              through timed past-paper practice rather than passive notes.
              The goal isn&apos;t just a good grade; it&apos;s a student who can
              walk into any exam hall and reason through an unfamiliar
              question with confidence.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppButton message="Hi, I'd like to know more about your teaching and classes." />
          </div>
        </div>
      </div>
    </div>
  );
}
