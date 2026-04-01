"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { consentForms, type ConsentFormConfig } from "@/config/consent-forms";
import type { FieldConfig } from "@/lib/wizard/types";

export function ConsentFormsField({ field }: { field: FieldConfig }) {
  const { setValue, formState: { errors } } = useFormContext();
  const [acknowledgments, setAcknowledgments] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(consentForms.map((f) => [f.id, false]))
  );

  const allRequired = consentForms.filter((f) => f.required);
  const allAcknowledged = allRequired.every((f) => acknowledgments[f.id]);

  function toggleAcknowledgment(formId: string) {
    const next = { ...acknowledgments, [formId]: !acknowledgments[formId] };
    setAcknowledgments(next);

    const consentsData = consentForms.map((f) => ({
      formId: f.id,
      formTitle: f.title,
      acknowledged: next[f.id] ?? false,
      acknowledgedAt: next[f.id] ? new Date().toISOString() : undefined,
    }));

    setValue(field.id, consentsData, { shouldValidate: true });
  }

  const error = errors[field.id];

  return (
    <div className="space-y-4">
      {consentForms.map((form: ConsentFormConfig) => (
        <div
          key={form.id}
          className={`rounded-lg border p-4 transition-colors ${
            acknowledgments[form.id]
              ? "border-brand-400 bg-brand-50"
              : "border-calm-200"
          }`}
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h4 className="text-sm font-semibold text-calm-800">{form.title}</h4>
              <p className="text-xs text-calm-500 mt-0.5">{form.description}</p>
            </div>
            <a
              href={form.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs font-medium text-brand-600 hover:text-brand-700
                         border border-brand-200 rounded-md px-3 py-1.5 hover:bg-brand-50 transition-colors"
            >
              View PDF
            </a>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer mt-3 pt-3 border-t border-calm-100">
            <input
              type="checkbox"
              checked={acknowledgments[form.id]}
              onChange={() => toggleAcknowledgment(form.id)}
              className="h-4 w-4 rounded text-brand-600 border-calm-300 focus:ring-brand-500"
            />
            <span className="text-sm text-calm-700">
              I have read and acknowledge the {form.title}
              {form.required && <span className="text-red-500 ml-0.5">*</span>}
            </span>
          </label>
        </div>
      ))}

      {!allAcknowledged && error && (
        <p className="text-sm text-red-600" role="alert">
          Please acknowledge all required consent forms to continue.
        </p>
      )}
    </div>
  );
}
