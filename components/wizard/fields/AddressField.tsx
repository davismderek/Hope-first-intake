"use client";

import { useFormContext } from "react-hook-form";
import type { FieldConfig } from "@/lib/wizard/types";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

export function AddressField({ field }: { field: FieldConfig }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const addressErrors = errors[field.id] as Record<string, { message?: string }> | undefined;

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
        <label htmlFor={`${field.id}.street`} className="sr-only">Street Address</label>
        <input
          id={`${field.id}.street`}
          type="text"
          placeholder="Street Address"
          autoComplete="street-address"
          {...register(`${field.id}.street`)}
          className={inputClass(!!addressErrors?.street)}
        />
        {addressErrors?.street && (
          <p className="text-sm text-red-600 mt-1">{addressErrors.street.message}</p>
        )}
      </div>

      <div className="grid grid-cols-6 gap-3">
        <div className="col-span-3">
          <label htmlFor={`${field.id}.city`} className="sr-only">City</label>
          <input
            id={`${field.id}.city`}
            type="text"
            placeholder="City"
            autoComplete="address-level2"
            {...register(`${field.id}.city`)}
            className={inputClass(!!addressErrors?.city)}
          />
          {addressErrors?.city && (
            <p className="text-sm text-red-600 mt-1">{addressErrors.city.message}</p>
          )}
        </div>

        <div className="col-span-1">
          <label htmlFor={`${field.id}.state`} className="sr-only">State</label>
          <select
            id={`${field.id}.state`}
            autoComplete="address-level1"
            {...register(`${field.id}.state`)}
            className={inputClass(!!addressErrors?.state)}
          >
            <option value="">State</option>
            {US_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          {addressErrors?.state && (
            <p className="text-sm text-red-600 mt-1">{addressErrors.state.message}</p>
          )}
        </div>

        <div className="col-span-2">
          <label htmlFor={`${field.id}.zipCode`} className="sr-only">ZIP Code</label>
          <input
            id={`${field.id}.zipCode`}
            type="text"
            placeholder="ZIP Code"
            autoComplete="postal-code"
            {...register(`${field.id}.zipCode`)}
            className={inputClass(!!addressErrors?.zipCode)}
          />
          {addressErrors?.zipCode && (
            <p className="text-sm text-red-600 mt-1">{addressErrors.zipCode.message}</p>
          )}
        </div>
      </div>
    </fieldset>
  );
}
