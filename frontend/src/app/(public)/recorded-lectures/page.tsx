import { WhatsAppButton } from "@/components/public/WhatsAppButton";

export default function RecordedLecturesPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Recorded Lectures</h1>
      <p className="mt-4 text-sm text-gray-500">
        Recorded lecture access will be added gradually. Check back soon, or
        message us on WhatsApp to ask about availability for your course.
      </p>
      <WhatsAppButton className="mt-6" message="Hi, I'd like to know about recorded lecture access." />
    </div>
  );
}
