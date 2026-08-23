"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormRow, Input, Label, Textarea } from "@/components/ui/Field";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-brand-light bg-brand-light/40 p-6 text-sm text-gray-700">
        <p className="font-medium text-gray-900">Thanks for reaching out!</p>
        <p className="mt-1">
          We&apos;ve noted your message. For the fastest response, please also
          message us directly on WhatsApp — we&apos;ll get back to you there.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <FormRow>
        <Label htmlFor="name" required>Name</Label>
        <Input id="name" name="name" required placeholder="Your name" />
      </FormRow>
      <FormRow>
        <Label htmlFor="phone" required>Phone / WhatsApp</Label>
        <Input id="phone" name="phone" required placeholder="01XXXXXXXXX" />
      </FormRow>
      <FormRow>
        <Label htmlFor="message" required>Message</Label>
        <Textarea id="message" name="message" required rows={4} placeholder="What would you like to ask?" />
      </FormRow>
      <Button type="submit">Send inquiry</Button>
    </form>
  );
}
