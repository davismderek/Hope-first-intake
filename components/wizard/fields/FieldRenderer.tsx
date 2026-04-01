"use client";

import type { FieldConfig } from "@/lib/wizard/types";
import { isFieldVisible } from "@/lib/wizard/engine";
import { useWizard } from "@/lib/wizard/context";

import { TextField } from "./TextField";
import { TextareaField } from "./TextareaField";
import { EmailField } from "./EmailField";
import { PhoneField } from "./PhoneField";
import { DateField } from "./DateField";
import { AddressField } from "./AddressField";
import { RadioGroupField } from "./RadioGroupField";
import { CheckboxGroupField } from "./CheckboxGroupField";
import { SelectField } from "./SelectField";
import { AcknowledgmentField } from "./AcknowledgmentField";
import { ContactGroupField } from "./ContactGroupField";
import { CalendarField } from "./CalendarField";
import { ConsentFormsField } from "./ConsentFormsField";
import { PaymentField } from "./PaymentField";

const FIELD_COMPONENTS: Record<string, React.ComponentType<{ field: FieldConfig }>> = {
  "short-text": TextField,
  "long-text": TextareaField,
  email: EmailField,
  phone: PhoneField,
  date: DateField,
  address: AddressField,
  radio: RadioGroupField,
  "checkbox-group": CheckboxGroupField,
  select: SelectField,
  acknowledgment: AcknowledgmentField,
  "contact-group": ContactGroupField,
  calendar: CalendarField,
  "consent-forms": ConsentFormsField,
};

export function FieldRenderer({ field }: { field: FieldConfig }) {
  const { state } = useWizard();

  if (!isFieldVisible(field.visibleWhen, state.formData)) {
    return null;
  }

  // Payment field is special — it manages its own state
  if (field.type === "payment") {
    return <PaymentField />;
  }

  const Component = FIELD_COMPONENTS[field.type];
  if (!Component) {
    return (
      <p className="text-sm text-red-600">
        Unknown field type: {field.type}
      </p>
    );
  }

  return <Component field={field} />;
}
