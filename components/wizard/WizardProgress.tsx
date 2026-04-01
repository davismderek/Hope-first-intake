"use client";

import type { WizardStepConfig } from "@/lib/wizard/types";

interface Props {
  steps: WizardStepConfig[];
  currentIndex: number;
}

export function WizardProgress({ steps, currentIndex }: Props) {
  const totalSteps = steps.length;
  const progress = Math.round(((currentIndex + 1) / totalSteps) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-calm-500">
        <span>
          Step {currentIndex + 1} of {totalSteps}
        </span>
        <span>{progress}% complete</span>
      </div>
      <div className="h-2 w-full rounded-full bg-calm-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Step ${currentIndex + 1} of ${totalSteps}`}
        />
      </div>
    </div>
  );
}
