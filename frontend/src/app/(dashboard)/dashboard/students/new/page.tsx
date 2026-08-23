"use client";

import { useRouter } from "next/navigation";
import { StudentForm, type StudentFormValues } from "@/components/dashboard/StudentForm";
import { api } from "@/lib/api";
import type { Student } from "@/types";

export default function NewStudentPage() {
  const router = useRouter();

  async function handleSubmit(values: StudentFormValues) {
    const student = await api.post<Student>("/students", values);
    router.push(`/dashboard/students/${student.id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Add Student</h1>
        <p className="mt-1 text-sm text-gray-500">
          The student code will be generated automatically.
        </p>
      </div>
      <StudentForm onSubmit={handleSubmit} submitLabel="Add student" />
    </div>
  );
}
