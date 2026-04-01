"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";
import type { WizardState, WizardAction, WizardStepConfig } from "./types";
import { evaluateStepRules, getNextStepIndex } from "./engine";

const initialState: WizardState = {
  currentStepIndex: 0,
  formData: {},
  disqualification: null,
  completed: false,
  visitedSteps: [],
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStepIndex: action.index };

    case "SAVE_STEP_DATA":
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.stepId]: {
            ...state.formData[action.stepId],
            ...action.data,
          },
        },
      };

    case "DISQUALIFY":
      return {
        ...state,
        disqualification: {
          stepId: action.stepId,
          message: action.message,
        },
      };

    case "COMPLETE":
      return { ...state, completed: true };

    case "SET_STRIPE_REFS":
      return {
        ...state,
        stripeCustomerId: action.customerId,
        stripePaymentMethodId: action.paymentMethodId,
        stripeSetupIntentId: action.setupIntentId,
      };

    case "SET_APPOINTMENT":
      return {
        ...state,
        selectedAppointment: {
          date: action.date,
          time: action.time,
          slotId: action.slotId,
        },
      };

    case "MARK_VISITED":
      return {
        ...state,
        visitedSteps: state.visitedSteps.includes(action.stepId)
          ? state.visitedSteps
          : [...state.visitedSteps, action.stepId],
      };

    default:
      return state;
  }
}

interface WizardContextValue {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  goToNext: (steps: WizardStepConfig[], currentStepData: Record<string, unknown>) => void;
  goToPrevious: () => void;
  saveStepData: (stepId: string, data: Record<string, unknown>) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const saveStepData = useCallback(
    (stepId: string, data: Record<string, unknown>) => {
      dispatch({ type: "SAVE_STEP_DATA", stepId, data });
    },
    []
  );

  const goToNext = useCallback(
    (steps: WizardStepConfig[], currentStepData: Record<string, unknown>) => {
      const currentStep = steps[state.currentStepIndex];
      if (!currentStep) return;

      dispatch({ type: "SAVE_STEP_DATA", stepId: currentStep.id, data: currentStepData });
      dispatch({ type: "MARK_VISITED", stepId: currentStep.id });

      const result = evaluateStepRules(currentStep, currentStepData);

      if (result.action === "disqualify") {
        dispatch({
          type: "DISQUALIFY",
          stepId: currentStep.id,
          message: result.message ?? "You are not eligible to continue.",
        });
        return;
      }

      const nextIndex = getNextStepIndex(steps, state.currentStepIndex, result);

      if (nextIndex >= steps.length) {
        dispatch({ type: "COMPLETE" });
      } else {
        dispatch({ type: "SET_STEP", index: nextIndex });
        dispatch({ type: "MARK_VISITED", stepId: steps[nextIndex].id });
      }
    },
    [state.currentStepIndex]
  );

  const goToPrevious = useCallback(() => {
    if (state.currentStepIndex > 0) {
      dispatch({ type: "SET_STEP", index: state.currentStepIndex - 1 });
    }
  }, [state.currentStepIndex]);

  return (
    <WizardContext.Provider value={{ state, dispatch, goToNext, goToPrevious, saveStepData }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}
