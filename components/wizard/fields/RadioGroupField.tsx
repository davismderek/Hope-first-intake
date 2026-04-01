"use client";

import { useFormContext } from "react-hook-form";
import type { FieldConfig } from "@/lib/wizard/types";

export function RadioGroupField({ field }: { field: FieldConfig }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[field.id];

  return (
    <fieldset className="space-y-2">
      <legend className="block text-sm font-medium text-calm-800 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </legend>
      <div className="space-y-2">
        {field.options?.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 rounded-lg border border-calm-200 px-4 py-3
                       cursor-pointer transition-colors hover:border-brand-300 hover:bg-brand-50
                       has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
          >
            <input
              type="radio"
              value={option.value}
              {...register(field.id)}
              className="h-4 w-4 text-brand-600 border-calm-300 focus:ring-brand-500"
            />
            <span className="text-sm text-calm-800">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1" role="alert">
          {error.message as string}
        </p>
      )}
    </fieldset>
  );
}
