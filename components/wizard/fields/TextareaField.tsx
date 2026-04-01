"use client";

import { useFormContext } from "react-hook-form";
import type { FieldConfig } from "@/lib/wizard/types";

export function TextareaField({ field }: { field: FieldConfig }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[field.id];

  return (
    <div className="space-y-1.5">
      <label htmlFor={field.id} className="block text-sm font-medium text-calm-800">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea
        id={field.id}
        placeholder={field.placeholder}
        rows={5}
        {...register(field.id)}
        className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors resize-y
          focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
          ${error ? "border-red-400 bg-red-50" : "border-calm-200 bg-white hover:border-calm-300"}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
      />
      {error && (
        <p id={`${field.id}-error`} className="text-sm text-red-600" role="alert">
          {error.message as string}
        </p>
      )}
    </div>
  );
}
