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
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ListResponse, Payment, PaymentMethod, Student } from "@/types";

interface PaymentFormState {
  studentId: string;
  amount: string;
  paidAmount: string;
  paymentDate: string;
  method: PaymentMethod;
  notes: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm: PaymentFormState = {
  studentId: "",
  amount: "",
  paidAmount: "",
  paymentDate: today(),
  method: "CASH",
  notes: "",
};

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data, loading, error, refetch } = useApiGet<ListResponse<Payment> | Payment[]>("/payments", {
    status: statusFilter,
  });
  const payments: Payment[] = data ? (Array.isArray(data) ? data : data.data) : [];

  const { data: studentsData } = useApiGet<ListResponse<Student> | Student[]>("/students", { status: "ACTIVE" });
  const students: Student[] = studentsData ? (Array.isArray(studentsData) ? studentsData : studentsData.data) : [];

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<PaymentFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function studentName(studentId: string) {
    return students.find((s) => s.id === studentId)?.name || studentId;
  }

  function openNew() {
    setForm({ ...emptyForm, studentId: students[0]?.id || "", paymentDate: today() });
    setFormError(null);
    setCreating(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await api.post("/payments", {
        studentId: form.studentId,
        amount: Number(form.amount),
        paidAmount: Number(form.paidAmount || 0),
        paymentDate: form.paymentDate,
        method: form.method,
        notes: form.notes || undefined,
      });
      setCreating(false);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save payment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Payments</h1>
          <p className="mt-1 text-sm text-gray-500">Track student payments and dues.</p>
        </div>
        <Button onClick={openNew} disabled={students.length === 0}>+ New Payment</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-[200px]">
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PARTIALLY_PAID">Partially paid</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
        </Select>
      </div>

      {loading && <LoadingState label="Loading payments..." />}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && payments.length === 0 && (
        <EmptyState
          title="No payments yet"
          description="Record your first payment."
          action={<Button onClick={openNew}>+ New Payment</Button>}
        />
      )}
      {!loading && !error && payments.length > 0 && (
        <DataTable
          rows={payments}
          rowKey={(row) => row.id}
          columns={[
            { header: "Student", accessor: (row) => row.studentName || studentName(row.studentId) },
            { header: "Date", accessor: (row) => formatDate(row.paymentDate) },
            { header: "Amount", accessor: (row) => formatCurrency(row.amount) },
            { header: "Paid", accessor: (row) => formatCurrency(row.paidAmount) },
            { header: "Due", accessor: (row) => formatCurrency(row.dueAmount) },
            { header: "Method", accessor: (row) => row.method },
            { header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
      )}

      {creating && (
        <Modal title="New Payment" onClose={() => setCreating(false)}>
          <form onSubmit={handleSubmit}>
            {formError && (
              <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
            )}
            <FormRow>
              <Label htmlFor="p-student" required>Student</Label>
              <Select id="p-student" required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.studentCode})</option>
                ))}
              </Select>
            </FormRow>
            <div className="grid grid-cols-2 gap-4">
              <FormRow>
                <Label htmlFor="p-amount" required>Amount</Label>
                <Input id="p-amount" type="number" min={0} required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </FormRow>
              <FormRow>
                <Label htmlFor="p-paid">Paid amount</Label>
                <Input id="p-paid" type="number" min={0} value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} />
              </FormRow>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormRow>
                <Label htmlFor="p-date" required>Payment date</Label>
                <Input id="p-date" type="date" required value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} />
              </FormRow>
              <FormRow>
                <Label htmlFor="p-method">Method</Label>
                <Select id="p-method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethod })}>
                  <option value="CASH">Cash</option>
                  <option value="BKASH">bKash</option>
                  <option value="NAGAD">Nagad</option>
                  <option value="BANK_TRANSFER">Bank transfer</option>
                  <option value="OTHER">Other</option>
                </Select>
              </FormRow>
            </div>
            <FormRow>
              <Label htmlFor="p-notes">Notes</Label>
              <Textarea id="p-notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </FormRow>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save payment"}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
