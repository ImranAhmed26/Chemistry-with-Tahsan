"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { FormRow, Input, Label, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { api } from "@/lib/api";
import { useApiGet } from "@/lib/useApiGet";
import { formatDate } from "@/lib/utils";
import type { Batch, BatchStatus, Course, ListResponse } from "@/types";

interface BatchFormState {
  courseId: string;
  name: string;
  schedule: string;
  startDate: string;
  endDate: string;
  capacity: string;
  status: BatchStatus;
}

const emptyForm: BatchFormState = {
  courseId: "",
  name: "",
  schedule: "",
  startDate: "",
  endDate: "",
  capacity: "",
  status: "UPCOMING",
};

export default function BatchesPage() {
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: coursesData } = useApiGet<ListResponse<Course> | Course[]>("/courses");
  const courses: Course[] = coursesData ? (Array.isArray(coursesData) ? coursesData : coursesData.data) : [];

  const { data, loading, error, refetch } = useApiGet<ListResponse<Batch> | Batch[]>("/batches", {
    courseId: courseFilter,
    status: statusFilter,
  });
  const batches: Batch[] = data ? (Array.isArray(data) ? data : data.data) : [];

  const [editing, setEditing] = useState<Batch | null | "new">(null);
  const [form, setForm] = useState<BatchFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function courseName(courseId: string) {
    return courses.find((c) => c.id === courseId)?.name || "-";
  }

  function openNew() {
    setForm({ ...emptyForm, courseId: courses[0]?.id || "" });
    setFormError(null);
    setEditing("new");
  }

  function openEdit(batch: Batch) {
    setForm({
      courseId: batch.courseId,
      name: batch.name,
      schedule: batch.schedule || "",
      startDate: batch.startDate ? batch.startDate.slice(0, 10) : "",
      endDate: batch.endDate ? batch.endDate.slice(0, 10) : "",
      capacity: batch.capacity ? String(batch.capacity) : "",
      status: batch.status,
    });
    setFormError(null);
    setEditing(batch);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        ...form,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      };
      if (editing === "new") {
        await api.post("/batches", payload);
      } else if (editing) {
        await api.patch(`/batches/${editing.id}`, payload);
      }
      setEditing(null);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save batch");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Batches</h1>
          <p className="mt-1 text-sm text-gray-500">Manage batches and enrollment capacity.</p>
        </div>
        <Button onClick={openNew} disabled={courses.length === 0}>+ New Batch</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="max-w-[220px]">
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-[180px]">
          <option value="">All statuses</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
      </div>

      {loading && <LoadingState label="Loading batches..." />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && batches.length === 0 && (
        <EmptyState
          title="No batches yet"
          description={courses.length === 0 ? "Create a course first, then add a batch." : "Create your first batch."}
          action={courses.length > 0 ? <Button onClick={openNew}>+ New Batch</Button> : undefined}
        />
      )}
      {!loading && !error && batches.length > 0 && (
        <DataTable
          rows={batches}
          rowKey={(row) => row.id}
          columns={[
            {
              header: "Name",
              accessor: (row) => (
                <Link href={`/dashboard/batches/${row.id}`} className="font-medium text-gray-900 hover:text-brand">
                  {row.name}
                </Link>
              ),
            },
            { header: "Course", accessor: (row) => courseName(row.courseId) },
            { header: "Schedule", accessor: (row) => row.schedule || "-" },
            { header: "Capacity", accessor: (row) => row.capacity ?? "-" },
            { header: "Start", accessor: (row) => formatDate(row.startDate) },
            { header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
            {
              header: "",
              accessor: (row) => (
                <button onClick={() => openEdit(row)} className="text-sm font-medium text-brand hover:underline cursor-pointer">
                  Edit
                </button>
              ),
            },
          ]}
        />
      )}

      {editing && (
        <Modal title={editing === "new" ? "New Batch" : "Edit Batch"} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit}>
            {formError && (
              <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
            )}
            <FormRow>
              <Label htmlFor="b-course" required>Course</Label>
              <Select id="b-course" required value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </FormRow>
            <FormRow>
              <Label htmlFor="b-name" required>Batch name</Label>
              <Input id="b-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </FormRow>
            <FormRow>
              <Label htmlFor="b-schedule">Schedule</Label>
              <Input id="b-schedule" placeholder="e.g. Sat/Mon 5-7pm" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} />
            </FormRow>
            <div className="grid grid-cols-2 gap-4">
              <FormRow>
                <Label htmlFor="b-start">Start date</Label>
                <Input id="b-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </FormRow>
              <FormRow>
                <Label htmlFor="b-end">End date</Label>
                <Input id="b-end" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </FormRow>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormRow>
                <Label htmlFor="b-capacity">Capacity</Label>
                <Input id="b-capacity" type="number" min={0} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
              </FormRow>
              <FormRow>
                <Label htmlFor="b-status">Status</Label>
                <Select id="b-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as BatchStatus })}>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </Select>
              </FormRow>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
