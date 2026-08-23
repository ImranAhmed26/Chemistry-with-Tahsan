"use client";

import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Select } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useApiGet } from "@/lib/useApiGet";
import { formatDate } from "@/lib/utils";
import type { Batch, ClassSession, ListResponse } from "@/types";

export default function ClassSessionsPage() {
  const [batchFilter, setBatchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: batchesData } = useApiGet<ListResponse<Batch> | Batch[]>("/batches");
  const batches: Batch[] = batchesData ? (Array.isArray(batchesData) ? batchesData : batchesData.data) : [];

  const { data, loading, error, refetch } = useApiGet<ListResponse<ClassSession> | ClassSession[]>(
    "/class-sessions",
    { batchId: batchFilter, status: statusFilter }
  );
  const sessions: ClassSession[] = data ? (Array.isArray(data) ? data : data.data) : [];

  function batchName(batchId: string) {
    return batches.find((b) => b.id === batchId)?.name || "-";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Class Sessions</h1>
          <p className="mt-1 text-sm text-gray-500">Schedule sessions and mark attendance.</p>
        </div>
        <ButtonLink href="/dashboard/class-sessions/new">+ New Session</ButtonLink>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)} className="max-w-[220px]">
          <option value="">All batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-[180px]">
          <option value="">All statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </div>

      {loading && <LoadingState label="Loading sessions..." />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && sessions.length === 0 && (
        <EmptyState
          title="No class sessions yet"
          description="Schedule a session for one of your batches."
          action={<ButtonLink href="/dashboard/class-sessions/new">+ New Session</ButtonLink>}
        />
      )}
      {!loading && !error && sessions.length > 0 && (
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
            { header: "Batch", accessor: (row) => row.batchName || batchName(row.batchId) },
            { header: "Topic", accessor: (row) => row.topic || "-" },
            { header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
      )}
    </div>
  );
}
