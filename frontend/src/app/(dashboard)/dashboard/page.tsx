"use client";

import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useApiGet } from "@/lib/useApiGet";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DashboardSummary } from "@/types";

export default function DashboardPage() {
  const { data, loading, error, refetch } = useApiGet<DashboardSummary>(
    "/dashboard/summary"
  );

  if (loading) return <LoadingState label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          A quick summary of your students, batches and payments.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Students" value={data.totalStudents} />
        <StatCard label="Active Students" value={data.activeStudents} />
        <StatCard label="Active Batches" value={data.activeBatches} />
        <StatCard label="Active Courses" value={data.activeCourses} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Upcoming Classes</h2>
            <Link href="/dashboard/class-sessions" className="text-sm text-brand hover:underline">
              View all
            </Link>
          </div>
          {data.upcomingClasses.length === 0 ? (
            <EmptyState title="No upcoming classes" />
          ) : (
            <DataTable
              rowKey={(row) => row.id}
              rows={data.upcomingClasses}
              columns={[
                { header: "Date", accessor: (r) => formatDate(r.date) },
                { header: "Time", accessor: (r) => `${r.startTime} - ${r.endTime}` },
                { header: "Batch", accessor: (r) => r.batchName },
                { header: "Topic", accessor: (r) => r.topic || "-" },
              ]}
            />
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Attendance</h2>
          </div>
          {data.recentAttendance.length === 0 ? (
            <EmptyState title="No attendance recorded yet" />
          ) : (
            <DataTable
              rowKey={(row) => row.id}
              rows={data.recentAttendance}
              columns={[
                { header: "Date", accessor: (r) => formatDate(r.date) },
                { header: "Batch", accessor: (r) => r.batchName },
                {
                  header: "Present",
                  accessor: (r) => `${r.presentCount} / ${r.totalCount}`,
                },
              ]}
            />
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Pending Payments</h2>
            <Link href="/dashboard/payments" className="text-sm text-brand hover:underline">
              View all
            </Link>
          </div>
          {data.pendingPayments.length === 0 ? (
            <EmptyState title="No pending payments" />
          ) : (
            <DataTable
              rowKey={(row) => row.id}
              rows={data.pendingPayments}
              columns={[
                { header: "Student", accessor: (r) => r.studentName },
                { header: "Due", accessor: (r) => formatCurrency(r.dueAmount) },
                { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
              ]}
            />
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recently Added Students</h2>
            <Link href="/dashboard/students" className="text-sm text-brand hover:underline">
              View all
            </Link>
          </div>
          {data.recentStudents.length === 0 ? (
            <EmptyState title="No students yet" />
          ) : (
            <DataTable
              rowKey={(row) => row.id}
              rows={data.recentStudents}
              columns={[
                { header: "Name", accessor: (r) => r.name },
                { header: "Code", accessor: (r) => r.studentCode },
                { header: "Added", accessor: (r) => formatDate(r.createdAt) },
              ]}
            />
          )}
        </section>
      </div>
    </div>
  );
}
