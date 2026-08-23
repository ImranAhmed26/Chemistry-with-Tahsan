"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { api } from "@/lib/api";
import { useApiGet } from "@/lib/useApiGet";
import { formatDate, cn } from "@/lib/utils";
import type { AttendanceStatus, ClassSessionDetail } from "@/types";

const statusOptions: AttendanceStatus[] = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

export default function ClassSessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, loading, error, refetch } = useApiGet<ClassSessionDetail>(
    id ? `/class-sessions/${id}` : null
  );

  const [records, setRecords] = useState<Record<string, AttendanceStatus | undefined>>({});
  const [loadedSessionId, setLoadedSessionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Initialize local attendance state once, the first time the session data
  // arrives (adjusting state during render, per React's guidance, rather
  // than in an effect, so local edits are never clobbered on refetch).
  if (session && session.id !== loadedSessionId) {
    const initial: Record<string, AttendanceStatus | undefined> = {};
    for (const s of session.students ?? []) {
      initial[s.studentId] = s.status;
    }
    setRecords(initial);
    setLoadedSessionId(session.id);
  }

  async function handleSave() {
    if (!session) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const recordsPayload = Object.entries(records)
        .filter(([, status]) => !!status)
        .map(([studentId, status]) => ({ studentId, status }));
      await api.put(`/class-sessions/${id}/attendance`, { records: recordsPayload });
      setSaved(true);
      refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save attendance");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Loading session..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!session) return null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-900">
            {formatDate(session.date)} · {session.startTime} - {session.endTime}
          </h1>
          <StatusBadge status={session.status} />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {session.batchName || "Batch"} {session.topic ? `— ${session.topic}` : ""}
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Attendance</h2>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save attendance"}
          </Button>
        </div>

        {saveError && (
          <p className="mx-4 mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>
        )}
        {saved && !saveError && (
          <p className="mx-4 mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            Attendance saved. Session marked completed.
          </p>
        )}

        {!session.students || session.students.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">No students enrolled in this batch.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {session.students.map((s) => (
              <li key={s.studentId} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span className="text-sm font-medium text-gray-900">{s.studentName}</span>
                <div className="flex gap-1.5">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setRecords((r) => ({ ...r, [s.studentId]: status }))}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                        records[s.studentId] === status
                          ? statusActiveClasses[status]
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const statusActiveClasses: Record<AttendanceStatus, string> = {
  PRESENT: "border-green-600 bg-green-100 text-green-800",
  ABSENT: "border-red-600 bg-red-100 text-red-700",
  LATE: "border-yellow-600 bg-yellow-100 text-yellow-800",
  EXCUSED: "border-blue-600 bg-blue-100 text-blue-800",
};
