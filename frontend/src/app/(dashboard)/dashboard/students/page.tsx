"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Input, Select } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { ButtonLink } from "@/components/ui/Button";
import { useApiGet } from "@/lib/useApiGet";
import { ACADEMIC_LEVELS } from "@/types";
import type { ListResponse, Student } from "@/types";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const router = useRouter();

  const { data, loading, error, refetch } = useApiGet<ListResponse<Student>>(
    "/students",
    { search, status, academicLevel }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Students</h1>
          <p className="mt-1 text-sm text-gray-500">
            {data ? `${data.total} student${data.total === 1 ? "" : "s"}` : "Manage your students"}
          </p>
        </div>
        <ButtonLink href="/dashboard/students/new">+ Add Student</ButtonLink>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[160px]">
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
        <Select
          value={academicLevel}
          onChange={(e) => setAcademicLevel(e.target.value)}
          className="max-w-[200px]"
        >
          <option value="">All levels</option>
          {ACADEMIC_LEVELS.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </Select>
      </div>

      {loading && <LoadingState label="Loading students..." />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && data && data.data.length === 0 && (
        <EmptyState
          title="No students found"
          description="Try adjusting your filters, or add a new student."
          action={<ButtonLink href="/dashboard/students/new">+ Add Student</ButtonLink>}
        />
      )}
      {!loading && !error && data && data.data.length > 0 && (
        <DataTable
          rows={data.data}
          rowKey={(row) => row.id}
          onRowClick={(row) => router.push(`/dashboard/students/${row.id}`)}
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
            { header: "Level", accessor: (row) => row.academicLevel || "-" },
            { header: "Board", accessor: (row) => row.examBoard || "-" },
            { header: "Phone", accessor: (row) => row.phone || "-" },
            { header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
      )}
    </div>
  );
}
