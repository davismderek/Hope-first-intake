"use client";

import { useFormContext, useWatch } from "react-hook-form";
import type { FieldConfig } from "@/lib/wizard/types";

/**
 * Handles exclusive options (e.g., "None of the above" deselects others,
 * and selecting any other option deselects the exclusive one).
 */
export function CheckboxGroupField({ field }: { field: FieldConfig }) {
  const {
    setValue,
    formState: { errors },
    control,
  } = useFormContext();

  const currentValues: string[] = useWatch({ control, name: field.id }) ?? [];
  const error = errors[field.id];

  const exclusiveValues = new Set(
    field.options?.filter((o) => o.exclusive).map((o) => o.value) ?? []
  );

  function handleChange(optionValue: string, checked: boolean) {
    let next: string[];

    if (checked) {
      if (exclusiveValues.has(optionValue)) {
        next = [optionValue];
      } else {
        next = [...currentValues.filter((v) => !exclusiveValues.has(v)), optionValue];
      }
    } else {
      next = currentValues.filter((v) => v !== optionValue);
    }

    setValue(field.id, next, { shouldValidate: true });
  }

  return (
    <fieldset className="space-y-2">
      <legend className="block text-sm font-medium text-calm-800 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </legend>
      <div className="space-y-2">
        {field.options?.map((option) => {
          const isChecked = currentValues.includes(option.value);
          return (
            <label
              key={option.value}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3
                         cursor-pointer transition-colors hover:border-brand-300 hover:bg-brand-50
                         ${isChecked ? "border-brand-500 bg-brand-50" : "border-calm-200"}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => handleChange(option.value, e.target.checked)}
                className="h-4 w-4 rounded text-brand-600 border-calm-300 focus:ring-brand-500"
              />
              <span className="text-sm text-calm-800">{option.label}</span>
            </label>
          );
        })}
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1" role="alert">
          {error.message as string}
        </p>
      )}
    </fieldset>
  );
}
