"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import type { WizardStepConfig } from "@/lib/wizard/types";
import { useWizard } from "@/lib/wizard/context";
import { buildStepSchema, getStepDefaults } from "@/lib/validation/schemas";
import { FieldRenderer } from "./fields/FieldRenderer";
import { WizardNavigation } from "./WizardNavigation";

interface Props {
  step: WizardStepConfig;
  steps: WizardStepConfig[];
  isFirst: boolean;
  isLast: boolean;
}

export function StepRenderer({ step, steps, isFirst, isLast }: Props) {
  const { state, goToNext, goToPrevious } = useWizard();
  const schema = useMemo(() => buildStepSchema(step), [step]);

  const savedData = state.formData[step.id] ?? {};
  const defaults = useMemo(() => {
    const base = getStepDefaults(step);
    return { ...base, ...savedData };
  }, [step, savedData]);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: "onBlur",
  });

  useEffect(() => {
    methods.reset(defaults);
  }, [step.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function onSubmit(data: Record<string, unknown>) {
    // For calendar steps, also update appointment in wizard state
    if (step.id === "appointment" && data.appointmentSelection) {
      const appt = data.appointmentSelection as { date: string; time: string };
      if (appt.date && appt.time) {
        // Dispatched via goToNext saving the step data
      }
    }

    goToNext(steps, data);
  }

  const isPaymentStep = step.id === "payment";
  const paymentSaved = !!state.stripePaymentMethodId;

  // For payment step: if payment is saved, allow proceeding
  function handlePaymentNext() {
    goToNext(steps, { paymentMethod: "saved" });
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Step header */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-calm-800">{step.title}</h2>
          {step.introText && (
            <div className="text-sm text-calm-600 leading-relaxed whitespace-pre-line">
              {step.introText}
            </div>
          )}
          {step.description && (
            <p className="text-sm text-calm-500 leading-relaxed whitespace-pre-line">
              {step.description}
            </p>
          )}
        </div>

        {/* Fields */}
        <div className="space-y-5">
          {step.fields.map((field) => (
            <FieldRenderer key={field.id} field={field} />
          ))}
        </div>

        {/* Navigation */}
        {isPaymentStep ? (
          <div className="pt-6 border-t border-calm-100">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goToPrevious}
                disabled={isFirst}
                className="rounded-lg border border-calm-200 px-5 py-2.5 text-sm font-medium text-calm-700
                           hover:bg-calm-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Back
              </button>
              {paymentSaved && (
                <button
                  type="button"
                  onClick={handlePaymentNext}
                  className="rounded-lg bg-brand-500 px-8 py-2.5 text-sm font-medium text-white
                             hover:bg-brand-600 transition-colors"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        ) : (
          <WizardNavigation
            onBack={goToPrevious}
            canGoBack={!isFirst}
            isSubmitting={methods.formState.isSubmitting}
            isLastStep={isLast}
          />
        )}
      </form>
    </FormProvider>
  );
}
