// ============================================================================
// Wizard configuration types — these define the schema for config-driven steps
// ============================================================================

export type FieldType =
  | "short-text"
  | "long-text"
  | "email"
  | "phone"
  | "date"
  | "address"
  | "radio"
  | "checkbox-group"
  | "select"
  | "acknowledgment"
  | "contact-group"
  | "consent-forms"
  | "payment"
  | "calendar";

export interface FieldOption {
  label: string;
  value: string;
  /** When true, selecting this option deselects all others (e.g., "None of the above") */
  exclusive?: boolean;
}

export interface VisibilityCondition {
  /** The fully-qualified field key: "stepId.fieldId" */
  field: string;
  operator: "equals" | "includes" | "not_equals";
  value: string | string[];
}

export interface FieldConfig {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  options?: FieldOption[];
  /** For address fields: whether to validate state */
  validateState?: boolean;
  /** Condition under which this field becomes visible */
  visibleWhen?: VisibilityCondition;
}

export type RuleOperator =
  | "equals"
  | "not_equals"
  | "includes"
  | "not_includes"
  | "includes_any_except"
  | "age_under"
  | "state_not_in";

export type RuleAction = "disqualify" | "skip_to" | "next";

export interface StepRule {
  /** Field id within the current step to evaluate */
  field: string;
  operator: RuleOperator;
  value: unknown;
  action: RuleAction;
  /** Message to display if action is "disqualify" */
  message?: string;
  /** Target step id if action is "skip_to" */
  targetStep?: string;
}

export interface WizardStepConfig {
  id: string;
  title: string;
  description?: string;
  introText?: string;
  fields: FieldConfig[];
  rules?: StepRule[];
  /** If true, this step is a special type (payment, calendar, etc.) */
  isCustomStep?: boolean;
}

export interface WizardConfig {
  steps: WizardStepConfig[];
}

// ============================================================================
// Wizard runtime state
// ============================================================================

export interface DisqualificationInfo {
  stepId: string;
  message: string;
}

export interface WizardState {
  currentStepIndex: number;
  formData: Record<string, Record<string, unknown>>;
  disqualification: DisqualificationInfo | null;
  completed: boolean;
  /** Track which steps were actually visited (for progress) */
  visitedSteps: string[];
  /** Stripe references once payment method is captured */
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
  stripeSetupIntentId?: string;
  /** Appointment selection */
  selectedAppointment?: {
    date: string;
    time: string;
    slotId?: string;
  };
}

export type WizardAction =
  | { type: "SET_STEP"; index: number }
  | { type: "SAVE_STEP_DATA"; stepId: string; data: Record<string, unknown> }
  | { type: "DISQUALIFY"; stepId: string; message: string }
  | { type: "COMPLETE" }
  | { type: "SET_STRIPE_REFS"; customerId: string; paymentMethodId: string; setupIntentId: string }
  | { type: "SET_APPOINTMENT"; date: string; time: string; slotId?: string }
  | { type: "MARK_VISITED"; stepId: string };
