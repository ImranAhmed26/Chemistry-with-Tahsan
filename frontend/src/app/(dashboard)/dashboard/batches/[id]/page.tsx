"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { FormRow, Label, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { api } from "@/lib/api";
import { useApiGet } from "@/lib/useApiGet";
import { formatDate } from "@/lib/utils";
import type { BatchDetail, ClassSession, ListResponse, Student } from "@/types";

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: batch, loading, error, refetch } = useApiGet<BatchDetail>(id ? `/batches/${id}` : null);
  const { data: sessionsData } = useApiGet<ListResponse<ClassSession> | ClassSession[]>(
    id ? "/class-sessions" : null,
    { batchId: id }
  );
  const sessions: ClassSession[] = sessionsData
    ? Array.isArray(sessionsData)
      ? sessionsData
      : sessionsData.data
    : [];

  const { data: studentsData } = useApiGet<ListResponse<Student> | Student[]>("/students", { status: "ACTIVE" });
  const students: Student[] = studentsData
    ? Array.isArray(studentsData)
      ? studentsData
      : studentsData.data
    : [];

  const [enrolling, setEnrolling] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const enrolledIds = new Set((batch?.students || []).map((s) => s.id));
  const availableStudents = students.filter((s) => !enrolledIds.has(s.id));

  function openEnroll() {
    setSelectedStudentId(availableStudents[0]?.id || "");
    setEnrollError(null);
    setEnrolling(true);
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!batch || !selectedStudentId) return;
    setSubmitting(true);
    setEnrollError(null);
    try {
      await api.post("/enrollments", {
        studentId: selectedStudentId,
        courseId: batch.courseId,
        batchId: batch.id,
      });
      setEnrolling(false);
      refetch();
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : "Could not enroll student");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState label="Loading batch..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!batch) return null;

  const enrolledCount = batch.enrolledCount ?? batch.students?.length ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">{batch.name}</h1>
            <StatusBadge status={batch.status} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {batch.course?.name || "Course"} · {batch.schedule || "No schedule set"}
          </p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href={`/dashboard/class-sessions/new?batchId=${batch.id}`} variant="outline">
            + New Session
          </ButtonLink>
          <Button onClick={openEnroll}>+ Enroll Student</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Enrolled</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {enrolledCount}{batch.capacity ? ` / ${batch.capacity}` : ""}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Start date</p>
          <p className="mt-1 text-lg font-medium text-gray-900">{formatDate(batch.startDate)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">End date</p>
          <p className="mt-1 text-lg font-medium text-gray-900">{formatDate(batch.endDate)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Sessions</p>
          <p className="mt-1 text-lg font-medium text-gray-900">{sessions.length}</p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Enrolled Students</h2>
        {batch.students?.length ? (
          <DataTable
            rows={batch.students}
            rowKey={(row) => row.id}
            columns={[
              {
                header: "Name",
                accessor: (row) => (
                  <Link href={`/dashboard/students/${row.id}`} className="font-medium text-gray-900 hover:text-brand">
                    {row.name}
                  </Link>
                ),
              },
              { header: "Code", accessor: (row) => row.studentCode },
            ]}
          />
        ) : (
          <EmptyState title="No students enrolled yet" action={<Button onClick={openEnroll}>+ Enroll Student</Button>} />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Class Sessions</h2>
        {sessions.length ? (
          <DataTable
            rows={sessions}
            rowKey={(row) => row.id}
            columns={[
              {
                header: "Date",
                accessor: (row) => (
                  <Link href={`/dashboard/class-sessions/${row.id}`} className="font-medium text-gray-900 hover:text-brand">
                    {formatDate(row.date)}
                  </Link>
                ),
              },
              { header: "Time", accessor: (row) => `${row.startTime} - ${row.endTime}` },
              { header: "Topic", accessor: (row) => row.topic || "-" },
              { header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
            ]}
          />
        ) : (
          <EmptyState
            title="No class sessions yet"
            action={
              <ButtonLink href={`/dashboard/class-sessions/new?batchId=${batch.id}`}>+ New Session</ButtonLink>
            }
          />
        )}
      </section>

      {enrolling && (
        <Modal title="Enroll Student" onClose={() => setEnrolling(false)}>
          <form onSubmit={handleEnroll}>
            {enrollError && (
              <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{enrollError}</p>
            )}
            {availableStudents.length === 0 ? (
              <p className="text-sm text-gray-500">All active students are already enrolled in this batch.</p>
            ) : (
              <>
                <FormRow>
                  <Label htmlFor="e-student" required>Student</Label>
                  <Select
                    id="e-student"
                    required
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                  >
                    {availableStudents.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.studentCode})</option>
                    ))}
                  </Select>
                </FormRow>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Enrolling..." : "Enroll"}
                </Button>
              </>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}
