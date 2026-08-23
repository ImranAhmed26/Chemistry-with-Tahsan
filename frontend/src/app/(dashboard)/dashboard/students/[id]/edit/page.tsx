"use client";

import { useParams, useRouter } from "next/navigation";
import { StudentForm, type StudentFormValues } from "@/components/dashboard/StudentForm";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { api } from "@/lib/api";
import { useApiGet } from "@/lib/useApiGet";
import type { StudentDetail } from "@/types";

export default function EditStudentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: student, loading, error, refetch } = useApiGet<StudentDetail>(
    id ? `/students/${id}` : null
  );

  async function handleSubmit(values: StudentFormValues) {
    await api.patch(`/students/${id}`, values);
    router.push(`/dashboard/students/${id}`);
  }

  if (loading) return <LoadingState label="Loading student..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!student) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Edit Student</h1>
        <p className="mt-1 text-sm text-gray-500">{student.studentCode}</p>
      </div>
      <StudentForm
        initialValues={{
          name: student.name,
          phone: student.phone || "",
          whatsapp: student.whatsapp || "",
          email: student.email || "",
          parentName: student.parentName || "",
          parentContact: student.parentContact || "",
          academicLevel: student.academicLevel || "",
          examBoard: student.examBoard || "",
          notes: student.notes || "",
        }}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}
