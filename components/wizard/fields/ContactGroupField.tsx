"use client";

import { useFormContext } from "react-hook-form";
import type { FieldConfig } from "@/lib/wizard/types";

export function ContactGroupField({ field }: { field: FieldConfig }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const groupErrors = errors[field.id] as Record<string, { message?: string }> | undefined;

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border px-4 py-2.5 text-sm transition-colors
     focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
     ${hasError ? "border-red-400 bg-red-50" : "border-calm-200 bg-white hover:border-calm-300"}`;

  return (
    <fieldset className="space-y-3">
      <legend className="block text-sm font-medium text-calm-800 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </legend>

      <div>
        <label htmlFor={`${field.id}.name`} className="block text-xs text-calm-500 mb-1">
          Full Name
        </label>
        <input
          id={`${field.id}.name`}
          type="text"
          placeholder="Contact name"
          {...register(`${field.id}.name`)}
          className={inputClass(!!groupErrors?.name)}
        />
        {groupErrors?.name && (
          <p className="text-sm text-red-600 mt-1">{groupErrors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor={`${field.id}.relationship`} className="block text-xs text-calm-500 mb-1">
          Relationship to You
        </label>
        <input
          id={`${field.id}.relationship`}
          type="text"
          placeholder="e.g., Spouse, Parent, Sibling"
          {...register(`${field.id}.relationship`)}
          className={inputClass(!!groupErrors?.relationship)}
        />
        {groupErrors?.relationship && (
          <p className="text-sm text-red-600 mt-1">{groupErrors.relationship.message}</p>
        )}
      </div>

      <div>
        <label htmlFor={`${field.id}.phone`} className="block text-xs text-calm-500 mb-1">
          Phone Number
        </label>
        <input
          id={`${field.id}.phone`}
          type="tel"
          placeholder="(555) 555-5555"
          {...register(`${field.id}.phone`)}
          className={inputClass(!!groupErrors?.phone)}
        />
        {groupErrors?.phone && (
          <p className="text-sm text-red-600 mt-1">{groupErrors.phone.message}</p>
        )}
      </div>
    </fieldset>
  );
}
