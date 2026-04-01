import type {
  WizardStepConfig,
  StepRule,
  RuleOperator,
  VisibilityCondition,
  WizardState,
} from "./types";

// ============================================================================
// Wizard branching & eligibility engine
//
// All business rules are evaluated here — never inside UI components.
// To add new rule operators, extend evaluateCondition() below.
// ============================================================================

/**
 * Evaluates a single rule condition against the current step's form data.
 * Returns true if the condition is met.
 */
function evaluateCondition(
  operator: RuleOperator,
  fieldValue: unknown,
  ruleValue: unknown
): boolean {
  switch (operator) {
    case "equals":
      return fieldValue === ruleValue;

    case "not_equals":
      return fieldValue !== ruleValue;

    case "includes": {
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(ruleValue as string);
      }
      return fieldValue === ruleValue;
    }

    case "not_includes": {
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(ruleValue as string);
      }
      return fieldValue !== ruleValue;
    }

    case "includes_any_except": {
      // True if the array contains any value other than the specified one
      if (Array.isArray(fieldValue)) {
        return fieldValue.some((v) => v !== ruleValue);
      }
      return false;
    }

    case "age_under": {
      const dob = fieldValue as string;
      if (!dob) return false;
      const age = calculateAge(dob);
      return age < (ruleValue as number);
    }

    case "state_not_in": {
      const allowedStates = ruleValue as string[];
      const state = (fieldValue as string)?.toUpperCase?.() ?? "";
      return !allowedStates.includes(state);
    }

    default:
      return false;
  }
}

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export interface NavigationResult {
  action: "next" | "skip_to" | "disqualify";
  /** Target step id when action is "skip_to" */
  targetStep?: string;
  /** Disqualification message */
  message?: string;
}

/**
 * Resolves a potentially dot-notated field path against step data.
 * e.g., "address.state" → stepData.address.state
 */
function resolveFieldValue(stepData: Record<string, unknown>, fieldPath: string): unknown {
  const parts = fieldPath.split(".");
  let current: unknown = stepData;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * Evaluates all rules for a step and returns the navigation action.
 * Rules are evaluated in order; first matching rule wins.
 * If no rules match, returns "next".
 */
export function evaluateStepRules(
  step: WizardStepConfig,
  stepData: Record<string, unknown>
): NavigationResult {
  if (!step.rules || step.rules.length === 0) {
    return { action: "next" };
  }

  for (const rule of step.rules) {
    const fieldValue = resolveFieldValue(stepData, rule.field);
    const matched = evaluateCondition(rule.operator, fieldValue, rule.value);

    if (matched) {
      return {
        action: rule.action,
        targetStep: rule.targetStep,
        message: rule.message,
      };
    }
  }

  return { action: "next" };
}

/**
 * Determines the next step index based on rule evaluation.
 * Returns -1 if the wizard should end (disqualification is handled separately).
 */
export function getNextStepIndex(
  steps: WizardStepConfig[],
  currentIndex: number,
  result: NavigationResult
): number {
  switch (result.action) {
    case "next":
      return currentIndex + 1;

    case "skip_to": {
      const targetIndex = steps.findIndex((s) => s.id === result.targetStep);
      return targetIndex >= 0 ? targetIndex : currentIndex + 1;
    }

    case "disqualify":
      return -1;

    default:
      return currentIndex + 1;
  }
}

/**
 * Evaluates whether a field should be visible based on its visibility condition.
 * Checks against all form data across all steps.
 */
export function isFieldVisible(
  condition: VisibilityCondition | undefined,
  allFormData: Record<string, Record<string, unknown>>
): boolean {
  if (!condition) return true;

  const [stepId, fieldId] = condition.field.split(".");
  const stepData = allFormData[stepId];
  if (!stepData) return false;

  const fieldValue = stepData[fieldId];

  switch (condition.operator) {
    case "equals":
      return fieldValue === condition.value;

    case "includes": {
      if (Array.isArray(condition.value)) {
        return condition.value.includes(fieldValue as string);
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(condition.value as string);
      }
      return fieldValue === condition.value;
    }

    case "not_equals":
      return fieldValue !== condition.value;

    default:
      return true;
  }
}

/**
 * Computes the effective list of visible step indices
 * (for progress bar calculation, excluding any steps that might be skipped).
 * For simplicity, returns all non-confirmation steps.
 */
export function getVisibleStepCount(steps: WizardStepConfig[]): number {
  return steps.length;
}
