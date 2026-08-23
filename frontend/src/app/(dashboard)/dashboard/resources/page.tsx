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
import { formatCurrency } from "@/lib/utils";
import type {
  Course,
  ListResponse,
  Resource,
  ResourceStatus,
  ResourceType,
  ResourceVisibility,
} from "@/types";

interface ResourceFormState {
  title: string;
  description: string;
  type: ResourceType;
  subject: string;
  courseId: string;
  chapterTopic: string;
  fileUrl: string;
  coverImageUrl: string;
  visibility: ResourceVisibility;
  price: string;
  status: ResourceStatus;
}

const emptyForm: ResourceFormState = {
  title: "",
  description: "",
  type: "NOTES",
  subject: "Chemistry",
  courseId: "",
  chapterTopic: "",
  fileUrl: "",
  coverImageUrl: "",
  visibility: "PUBLIC",
  price: "",
  status: "DRAFT",
};

export default function ResourcesPage() {
  const [typeFilter, setTypeFilter] = useState("");
  const { data, loading, error, refetch } = useApiGet<ListResponse<Resource> | Resource[]>("/resources", {
    type: typeFilter,
  });
  const resources: Resource[] = data ? (Array.isArray(data) ? data : data.data) : [];

  const { data: coursesData } = useApiGet<ListResponse<Course> | Course[]>("/courses");
  const courses: Course[] = coursesData ? (Array.isArray(coursesData) ? coursesData : coursesData.data) : [];

  const [editing, setEditing] = useState<Resource | null | "new">(null);
  const [form, setForm] = useState<ResourceFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function courseName(courseId?: string | null) {
    return courses.find((c) => c.id === courseId)?.name || "-";
  }

  function openNew() {
    setForm(emptyForm);
    setFormError(null);
    setEditing("new");
  }

  function openEdit(resource: Resource) {
    setForm({
      title: resource.title,
      description: resource.description || "",
      type: resource.type,
      subject: resource.subject || "",
      courseId: resource.courseId || "",
      chapterTopic: resource.chapterTopic || "",
      fileUrl: resource.fileUrl || "",
      coverImageUrl: resource.coverImageUrl || "",
      visibility: resource.visibility,
      price: resource.price ? String(resource.price) : "",
      status: resource.status,
    });
    setFormError(null);
    setEditing(resource);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        ...form,
        courseId: form.courseId || undefined,
        price: form.price ? Number(form.price) : 0,
      };
      if (editing === "new") {
        await api.post("/resources", payload);
      } else if (editing) {
        await api.patch(`/resources/${editing.id}`, payload);
      }
      setEditing(null);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save resource");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Resources</h1>
          <p className="mt-1 text-sm text-gray-500">Manage notes, papers and other materials.</p>
        </div>
        <Button onClick={openNew}>+ New Resource</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="max-w-[220px]">
          <option value="">All types</option>
          <option value="NOTES">Notes</option>
          <option value="PDF_BOOK">PDF Book</option>
          <option value="QUESTION_PAPER">Question Paper</option>
          <option value="REVISION_MAP">Revision Map</option>
          <option value="EXAM_PACK">Exam Pack</option>
          <option value="RECORDED_LECTURE">Recorded Lecture</option>
        </Select>
      </div>

      {loading && <LoadingState label="Loading resources..." />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && resources.length === 0 && (
        <EmptyState
          title="No resources yet"
          description="Add your first resource for students."
          action={<Button onClick={openNew}>+ New Resource</Button>}
        />
      )}
      {!loading && !error && resources.length > 0 && (
        <DataTable
          rows={resources}
          rowKey={(row) => row.id}
          columns={[
            { header: "Title", accessor: (row) => row.title },
            { header: "Type", accessor: (row) => row.type.replaceAll("_", " ") },
            { header: "Course", accessor: (row) => courseName(row.courseId) },
            { header: "Visibility", accessor: (row) => <StatusBadge status={row.visibility} /> },
            { header: "Price", accessor: (row) => (row.price ? formatCurrency(row.price) : "Free") },
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
        <Modal title={editing === "new" ? "New Resource" : "Edit Resource"} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit}>
            {formError && (
              <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
            )}
            <FormRow>
              <Label htmlFor="r-title" required>Title</Label>
              <Input id="r-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </FormRow>
            <FormRow>
              <Label htmlFor="r-desc">Description</Label>
              <Textarea id="r-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </FormRow>
            <div className="grid grid-cols-2 gap-4">
              <FormRow>
                <Label htmlFor="r-type" required>Type</Label>
                <Select id="r-type" required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ResourceType })}>
                  <option value="NOTES">Notes</option>
                  <option value="PDF_BOOK">PDF Book</option>
                  <option value="QUESTION_PAPER">Question Paper</option>
                  <option value="REVISION_MAP">Revision Map</option>
                  <option value="EXAM_PACK">Exam Pack</option>
                  <option value="RECORDED_LECTURE">Recorded Lecture</option>
                </Select>
              </FormRow>
              <FormRow>
                <Label htmlFor="r-course">Course</Label>
                <Select id="r-course" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
                  <option value="">No course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </FormRow>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormRow>
                <Label htmlFor="r-subject">Subject</Label>
                <Input id="r-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </FormRow>
              <FormRow>
                <Label htmlFor="r-chapter">Chapter / Topic</Label>
                <Input id="r-chapter" value={form.chapterTopic} onChange={(e) => setForm({ ...form, chapterTopic: e.target.value })} />
              </FormRow>
            </div>
            <FormRow>
              <Label htmlFor="r-file">File URL</Label>
              <Input id="r-file" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." />
            </FormRow>
            <FormRow>
              <Label htmlFor="r-cover">Cover image URL</Label>
              <Input id="r-cover" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} placeholder="https://..." />
            </FormRow>
            <div className="grid grid-cols-3 gap-4">
              <FormRow>
                <Label htmlFor="r-visibility">Visibility</Label>
                <Select id="r-visibility" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value as ResourceVisibility })}>
                  <option value="PUBLIC">Public</option>
                  <option value="ENROLLED_ONLY">Enrolled only</option>
                  <option value="PRIVATE">Private</option>
                </Select>
              </FormRow>
              <FormRow>
                <Label htmlFor="r-price">Price (0 = free)</Label>
                <Input id="r-price" type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </FormRow>
              <FormRow>
                <Label htmlFor="r-status">Status</Label>
                <Select id="r-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ResourceStatus })}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
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
