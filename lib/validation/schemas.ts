import { z } from "zod";
import type { WizardStepConfig, FieldConfig } from "@/lib/wizard/types";

// ============================================================================
// Dynamic Zod schema generation from wizard step config
//
// Each field type maps to a Zod schema. The buildStepSchema() function
// generates a complete schema for a step based on its field definitions.
// ============================================================================

const phoneRegex = /^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;

function buildFieldSchema(field: FieldConfig): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case "short-text":
    case "long-text":
      schema = field.required
        ? z.string().min(1, `${field.label} is required`)
        : z.string().optional();
      break;

    case "email":
      schema = field.required
        ? z.string().min(1, "Email is required").email("Please enter a valid email")
        : z.string().email("Please enter a valid email").optional().or(z.literal(""));
      break;

    case "phone":
      schema = field.required
        ? z.string().min(1, "Phone number is required").regex(phoneRegex, "Please enter a valid phone number")
        : z.string().regex(phoneRegex, "Please enter a valid phone number").optional().or(z.literal(""));
      break;

    case "date":
      schema = field.required
        ? z.string().min(1, `${field.label} is required`)
        : z.string().optional();
      break;

    case "address":
      schema = z.object({
        street: z.string().min(1, "Street address is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        zipCode: z.string().min(1, "ZIP code is required").regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
      });
      break;

    case "radio":
    case "select":
      schema = field.required
        ? z.string().min(1, "Please select an option")
        : z.string().optional();
      break;

    case "checkbox-group":
      schema = field.required
        ? z.array(z.string()).min(1, "Please select at least one option")
        : z.array(z.string()).optional();
      break;

    case "acknowledgment":
      schema = z.string().min(1, "You must acknowledge to continue");
      break;

    case "contact-group":
      schema = z.object({
        name: z.string().min(1, "Name is required"),
        relationship: z.string().min(1, "Relationship is required"),
        phone: z.string().min(1, "Phone is required").regex(phoneRegex, "Please enter a valid phone number"),
      });
      break;

    case "calendar":
      schema = z.object({
        date: z.string().min(1, "Please select an appointment date"),
        time: z.string().min(1, "Please select an appointment time"),
      });
      break;

    case "payment":
      // Payment validation is handled by Stripe Elements
      schema = z.any();
      break;

    case "consent-forms":
      // Validated separately by the consent forms component
      schema = z.any();
      break;

    default:
      schema = z.any();
  }

  return schema;
}

/**
 * Builds a Zod validation schema from a step's field configuration.
 * Used by React Hook Form's zodResolver.
 */
export function buildStepSchema(step: WizardStepConfig): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of step.fields) {
    shape[field.id] = buildFieldSchema(field);
  }

  return z.object(shape);
}

/**
 * Returns default values for a step's fields, used as initial form state.
 */
export function getStepDefaults(step: WizardStepConfig): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  for (const field of step.fields) {
    switch (field.type) {
      case "checkbox-group":
        defaults[field.id] = [];
        break;
      case "address":
        defaults[field.id] = { street: "", city: "", state: "", zipCode: "" };
        break;
      case "contact-group":
        defaults[field.id] = { name: "", relationship: "", phone: "" };
        break;
      case "calendar":
        defaults[field.id] = { date: "", time: "" };
        break;
      default:
        defaults[field.id] = "";
    }
  }

  return defaults;
}
