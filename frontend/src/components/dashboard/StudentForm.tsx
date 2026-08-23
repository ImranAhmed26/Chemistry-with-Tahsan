"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormRow, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { ACADEMIC_LEVELS, EXAM_BOARDS } from "@/types";

export interface StudentFormValues {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  parentName: string;
  parentContact: string;
  academicLevel: string;
  examBoard: string;
  notes: string;
}

const emptyValues: StudentFormValues = {
  name: "",
  phone: "",
  whatsapp: "",
  email: "",
  parentName: "",
  parentContact: "",
  academicLevel: "",
  examBoard: "",
  notes: "",
};

export function StudentForm({
  initialValues,
  onSubmit,
  submitLabel = "Save",
}: {
  initialValues?: Partial<StudentFormValues>;
  onSubmit: (values: StudentFormValues) => Promise<void>;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<StudentFormValues>({
    ...emptyValues,
    ...initialValues,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof StudentFormValues>(key: K, value: StudentFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormRow>
          <Label htmlFor="name" required>Full name</Label>
          <Input id="name" required value={values.name} onChange={(e) => update("name", e.target.value)} />
        </FormRow>
        <FormRow>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={values.phone} onChange={(e) => update("phone", e.target.value)} />
        </FormRow>
        <FormRow>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" value={values.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
        </FormRow>
        <FormRow>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={values.email} onChange={(e) => update("email", e.target.value)} />
        </FormRow>
        <FormRow>
          <Label htmlFor="parentName">Parent name</Label>
          <Input id="parentName" value={values.parentName} onChange={(e) => update("parentName", e.target.value)} />
        </FormRow>
        <FormRow>
          <Label htmlFor="parentContact">Parent contact</Label>
          <Input id="parentContact" value={values.parentContact} onChange={(e) => update("parentContact", e.target.value)} />
        </FormRow>
        <FormRow>
          <Label htmlFor="academicLevel">Academic level</Label>
          <Select id="academicLevel" value={values.academicLevel} onChange={(e) => update("academicLevel", e.target.value)}>
            <option value="">Select level</option>
            {ACADEMIC_LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </Select>
        </FormRow>
        <FormRow>
          <Label htmlFor="examBoard">Exam board</Label>
          <Select id="examBoard" value={values.examBoard} onChange={(e) => update("examBoard", e.target.value)}>
            <option value="">Select board</option>
            {EXAM_BOARDS.map((board) => (
              <option key={board} value={board}>{board}</option>
            ))}
          </Select>
        </FormRow>
      </div>

      <FormRow>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} value={values.notes} onChange={(e) => update("notes", e.target.value)} />
      </FormRow>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
