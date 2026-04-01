"use client";

import { useFormContext } from "react-hook-form";
import type { FieldConfig } from "@/lib/wizard/types";

export function AcknowledgmentField({ field }: { field: FieldConfig }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[field.id];

  return (
    <div className="space-y-2">
      <label
        className="flex items-start gap-3 rounded-lg border border-calm-200 px-4 py-4
                   cursor-pointer transition-colors hover:border-brand-300 hover:bg-brand-50
                   has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
      >
        <input
          type="radio"
          value="acknowledged"
          {...register(field.id)}
          className="mt-0.5 h-4 w-4 text-brand-600 border-calm-300 focus:ring-brand-500"
        />
        <span className="text-sm text-calm-800 leading-relaxed">{field.label}</span>
      </label>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error.message as string}
        </p>
      )}
    </div>
  );
}
