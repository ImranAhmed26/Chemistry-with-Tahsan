"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { FormRow, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { api } from "@/lib/api";
import { useApiGet } from "@/lib/useApiGet";
import { ACADEMIC_LEVELS, EXAM_BOARDS } from "@/types";
import type { Course, ListResponse } from "@/types";

interface CourseFormState {
  name: string;
  academicLevel: string;
  examBoard: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
}

const emptyForm: CourseFormState = {
  name: "",
  academicLevel: ACADEMIC_LEVELS[0],
  examBoard: EXAM_BOARDS[0],
  description: "",
  status: "ACTIVE",
};

export default function CoursesPage() {
  const { data, loading, error, refetch } = useApiGet<ListResponse<Course> | Course[]>("/courses");
  const [editing, setEditing] = useState<Course | null | "new">(null);
  const [form, setForm] = useState<CourseFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const courses: Course[] = data ? (Array.isArray(data) ? data : data.data) : [];

  function openNew() {
    setForm(emptyForm);
    setFormError(null);
    setEditing("new");
  }

  function openEdit(course: Course) {
    setForm({
      name: course.name,
      academicLevel: course.academicLevel,
      examBoard: course.examBoard,
      description: course.description || "",
      status: course.status,
    });
    setFormError(null);
    setEditing(course);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (editing === "new") {
        await api.post("/courses", form);
      } else if (editing) {
        await api.patch(`/courses/${editing.id}`, form);
      }
      setEditing(null);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save course");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Courses</h1>
          <p className="mt-1 text-sm text-gray-500">Manage the programs you teach.</p>
        </div>
        <Button onClick={openNew}>+ New Course</Button>
      </div>

      {loading && <LoadingState label="Loading courses..." />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && courses.length === 0 && (
        <EmptyState
          title="No courses yet"
          description="Create your first course to start building batches."
          action={<Button onClick={openNew}>+ New Course</Button>}
        />
      )}
      {!loading && !error && courses.length > 0 && (
        <DataTable
          rows={courses}
          rowKey={(row) => row.id}
          columns={[
            { header: "Name", accessor: (row) => row.name },
            { header: "Level", accessor: (row) => row.academicLevel },
            { header: "Board", accessor: (row) => row.examBoard },
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
        <Modal title={editing === "new" ? "New Course" : "Edit Course"} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit}>
            {formError && (
              <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
            )}
            <FormRow>
              <Label htmlFor="c-name" required>Name</Label>
              <Input id="c-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </FormRow>
            <div className="grid grid-cols-2 gap-4">
              <FormRow>
                <Label htmlFor="c-level" required>Academic level</Label>
                <Select id="c-level" required value={form.academicLevel} onChange={(e) => setForm({ ...form, academicLevel: e.target.value })}>
                  {ACADEMIC_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </Select>
              </FormRow>
              <FormRow>
                <Label htmlFor="c-board" required>Exam board</Label>
                <Select id="c-board" required value={form.examBoard} onChange={(e) => setForm({ ...form, examBoard: e.target.value })}>
                  {EXAM_BOARDS.map((board) => (
                    <option key={board} value={board}>{board}</option>
                  ))}
                </Select>
              </FormRow>
            </div>
            <FormRow>
              <Label htmlFor="c-desc">Description</Label>
              <Textarea id="c-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </FormRow>
            <FormRow>
              <Label htmlFor="c-status">Status</Label>
              <Select id="c-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "ACTIVE" | "INACTIVE" })}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </FormRow>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
