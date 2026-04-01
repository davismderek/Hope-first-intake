"use client";

import { useEffect } from "react";
import { useWizard } from "@/lib/wizard/context";
import { wizardConfig } from "@/config/wizard-steps";
import { branding } from "@/config/branding";
import { WizardProgress } from "./WizardProgress";
import { StepRenderer } from "./StepRenderer";
import { DisqualificationScreen } from "./DisqualificationScreen";
import { ConfirmationScreen } from "./ConfirmationScreen";

export function WizardShell() {
  const { state, dispatch } = useWizard();
  const { steps } = wizardConfig;
  const currentStep = steps[state.currentStepIndex];

  useEffect(() => {
    if (currentStep) {
      dispatch({ type: "MARK_VISITED", stepId: currentStep.id });
    }
  }, [currentStep, dispatch]);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.currentStepIndex, state.disqualification, state.completed]);

  // Save appointment selection when the appointment step data changes
  useEffect(() => {
    const apptData = state.formData["appointment"]?.appointmentSelection as
      | { date: string; time: string }
      | undefined;
    if (apptData?.date && apptData?.time) {
      dispatch({
        type: "SET_APPOINTMENT",
        date: apptData.date,
        time: apptData.time,
      });
    }
  }, [state.formData, dispatch]);

  return (
    <div className="min-h-screen bg-calm-50">
      {/* Header */}
      <header className="bg-white border-b border-calm-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href={branding.websiteUrl} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-lg font-heading font-semibold text-calm-800">
              {branding.name}
            </span>
          </a>
          <span className="text-xs text-calm-400">Patient Intake</span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-calm-100 overflow-hidden">
          {/* Disqualification screen */}
          {state.disqualification && (
            <div className="p-6 sm:p-8">
              <DisqualificationScreen message={state.disqualification.message} />
            </div>
          )}

          {/* Confirmation screen */}
          {!state.disqualification && state.completed && (
            <div className="p-6 sm:p-8">
              <ConfirmationScreen />
            </div>
          )}

          {/* Active wizard step */}
          {!state.disqualification && !state.completed && currentStep && (
            <>
              <div className="px-6 pt-6 sm:px-8 sm:pt-8">
                <WizardProgress steps={steps} currentIndex={state.currentStepIndex} />
              </div>
              <div className="p-6 sm:p-8">
                {currentStep.id === "confirmation" ? (
                  <ConfirmationScreen />
                ) : (
                  <StepRenderer
                    step={currentStep}
                    steps={steps}
                    isFirst={state.currentStepIndex === 0}
                    isLast={state.currentStepIndex === steps.length - 2}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-calm-400">
        {branding.footerText}
      </footer>
    </div>
  );
}
