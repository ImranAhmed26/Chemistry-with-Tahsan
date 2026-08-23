"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormRow, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { LoadingState } from "@/components/ui/States";
import { api } from "@/lib/api";
import { useApiGet } from "@/lib/useApiGet";
import type { Batch, ClassSession, ListResponse } from "@/types";

export default function NewClassSessionPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading..." />}>
      <NewClassSessionForm />
    </Suspense>
  );
}

function NewClassSessionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBatchId = searchParams.get("batchId") || "";

  const { data: batchesData, loading } = useApiGet<ListResponse<Batch> | Batch[]>("/batches");
  const batches: Batch[] = batchesData ? (Array.isArray(batchesData) ? batchesData : batchesData.data) : [];

  const [batchId, setBatchId] = useState(preselectedBatchId);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveBatchId = batchId || batches[0]?.id || "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const session = await api.post<ClassSession>("/class-sessions", {
        batchId: effectiveBatchId,
        date,
        startTime,
        endTime,
        topic: topic || undefined,
        notes: notes || undefined,
      });
      router.push(`/dashboard/class-sessions/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create session");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState label="Loading batches..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">New Class Session</h1>
        <p className="mt-1 text-sm text-gray-500">Schedule a session for a batch.</p>
      </div>

      {batches.length === 0 ? (
        <p className="text-sm text-gray-500">Create a batch first before scheduling a session.</p>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-xl">
          {error && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <FormRow>
            <Label htmlFor="s-batch" required>Batch</Label>
            <Select id="s-batch" required value={effectiveBatchId} onChange={(e) => setBatchId(e.target.value)}>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>
          </FormRow>
          <FormRow>
            <Label htmlFor="s-date" required>Date</Label>
            <Input id="s-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </FormRow>
          <div className="grid grid-cols-2 gap-4">
            <FormRow>
              <Label htmlFor="s-start" required>Start time</Label>
              <Input id="s-start" type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </FormRow>
            <FormRow>
              <Label htmlFor="s-end" required>End time</Label>
              <Input id="s-end" type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </FormRow>
          </div>
          <FormRow>
            <Label htmlFor="s-topic">Topic</Label>
            <Input id="s-topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </FormRow>
          <FormRow>
            <Label htmlFor="s-notes">Notes</Label>
            <Textarea id="s-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </FormRow>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create session"}
          </Button>
        </form>
      )}
    </div>
  );
}
