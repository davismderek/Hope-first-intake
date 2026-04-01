"use client";

interface Props {
  onBack: () => void;
  canGoBack: boolean;
  isSubmitting: boolean;
  isLastStep: boolean;
  /** When true, the payment step handles its own "next" action */
  hideNext?: boolean;
}

export function WizardNavigation({ onBack, canGoBack, isSubmitting, isLastStep, hideNext }: Props) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-calm-100">
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        className="rounded-lg border border-calm-200 px-5 py-2.5 text-sm font-medium text-calm-700
                   hover:bg-calm-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Back
      </button>

      {!hideNext && (
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-500 px-8 py-2.5 text-sm font-medium text-white
                     hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     min-w-[120px]"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Saving...
            </span>
          ) : isLastStep ? (
            "Submit"
          ) : (
            "Continue"
          )}
        </button>
      )}
    </div>
  );
}
