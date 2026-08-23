"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { FormRow, Textarea } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { api } from "@/lib/api";
import { useApiGet } from "@/lib/useApiGet";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import type { StudentDetail } from "@/types";

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: student, loading, error, refetch } = useApiGet<StudentDetail>(
    id ? `/students/${id}` : null
  );
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setSavingNote(true);
    setActionError(null);
    try {
      await api.post(`/students/${id}/notes`, { content: note.trim() });
      setNote("");
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not add note");
    } finally {
      setSavingNote(false);
    }
  }

  async function toggleStatus() {
    if (!student) return;
    setStatusChanging(true);
    setActionError(null);
    try {
      const action = student.status === "ACTIVE" ? "archive" : "reactivate";
      await api.patch(`/students/${id}/${action}`);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not update status");
    } finally {
      setStatusChanging(false);
    }
  }

  if (loading) return <LoadingState label="Loading student..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!student) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">{student.name}</h1>
            <StatusBadge status={student.status} />
          </div>
          <p className="mt-1 text-sm text-gray-500">{student.studentCode}</p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href={`/dashboard/students/${id}/edit`} variant="outline">Edit</ButtonLink>
          <Button
            variant={student.status === "ACTIVE" ? "danger" : "primary"}
            onClick={toggleStatus}
            disabled={statusChanging}
          >
            {student.status === "ACTIVE" ? "Archive" : "Reactivate"}
          </Button>
        </div>
      </div>

      {actionError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-900">Profile</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Phone" value={student.phone} />
            <Row label="WhatsApp" value={student.whatsapp} />
            <Row label="Email" value={student.email} />
            <Row label="Parent" value={student.parentName} />
            <Row label="Parent contact" value={student.parentContact} />
            <Row label="Academic level" value={student.academicLevel} />
            <Row label="Exam board" value={student.examBoard} />
          </dl>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900">Attendance</h2>
          <div className="mt-3 flex items-center gap-6">
            <p className="text-3xl font-semibold text-gray-900">
              {student.attendanceSummary?.percentage ?? 0}%
            </p>
            <p className="text-sm text-gray-500">
              {student.attendanceSummary?.presentCount ?? 0} present of{" "}
              {student.attendanceSummary?.totalCount ?? 0} sessions
            </p>
          </div>

          <h2 className="mt-6 text-sm font-semibold text-gray-900">Enrollments</h2>
          {student.enrollments?.length ? (
            <div className="mt-3">
              <DataTable
                rows={student.enrollments}
                rowKey={(row) => row.id}
                columns={[
                  { header: "Course", accessor: (r) => r.courseName || "-" },
                  { header: "Batch", accessor: (r) => r.batchName || "-" },
                  { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
                  { header: "Enrolled", accessor: (r) => formatDate(r.enrolledAt) },
                ]}
              />
            </div>
          ) : (
            <EmptyState title="No enrollments yet" />
          )}
        </section>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Payments</h2>
        {student.payments?.length ? (
          <div className="mt-3">
            <DataTable
              rows={student.payments}
              rowKey={(row) => row.id}
              columns={[
                { header: "Date", accessor: (r) => formatDate(r.paymentDate) },
                { header: "Amount", accessor: (r) => formatCurrency(r.amount) },
                { header: "Paid", accessor: (r) => formatCurrency(r.paidAmount) },
                { header: "Due", accessor: (r) => formatCurrency(r.dueAmount) },
                { header: "Method", accessor: (r) => r.method },
                { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
              ]}
            />
          </div>
        ) : (
          <EmptyState
            title="No payments yet"
            action={<Link href="/dashboard/payments" className="text-sm text-brand hover:underline">Add a payment →</Link>}
          />
        )}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Notes</h2>
        <form onSubmit={handleAddNote} className="mt-3 max-w-xl">
          <FormRow>
            <Textarea
              rows={2}
              placeholder="Add a note about this student..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </FormRow>
          <Button type="submit" size="sm" disabled={savingNote || !note.trim()}>
            {savingNote ? "Saving..." : "Add note"}
          </Button>
        </form>

        {student.studentNotes?.length ? (
          <ul className="mt-5 space-y-3">
            {student.studentNotes.map((n) => (
              <li key={n.id} className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                <p>{n.content}</p>
                <p className="mt-1 text-xs text-gray-400">{formatDateTime(n.createdAt)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-gray-400">No notes yet.</p>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right text-gray-900">{value || "-"}</dd>
    </div>
  );
}
