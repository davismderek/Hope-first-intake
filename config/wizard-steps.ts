import type { WizardConfig } from "@/lib/wizard/types";

// ============================================================================
// Wizard steps configuration
//
// This is the single source of truth for the intake wizard flow.
// To add/remove/reorder steps, edit this file.
// Business rules (disqualification, branching) are defined via the `rules` array.
// ============================================================================

export const wizardConfig: WizardConfig = {
  steps: [
    // ------------------------------------------------------------------
    // Step 1: Contact Details
    // ------------------------------------------------------------------
    {
      id: "contact-details",
      title: "Contact Details",
      introText:
        "Your contact details and the answers you provide throughout this assessment will be kept confidential.",
      fields: [
        { id: "firstName", type: "short-text", label: "First Name", required: true, placeholder: "First name" },
        { id: "lastName", type: "short-text", label: "Last Name", required: true, placeholder: "Last name" },
        { id: "dateOfBirth", type: "date", label: "Date of Birth", required: true },
        { id: "email", type: "email", label: "Email Address", required: true, placeholder: "you@example.com" },
        { id: "cellPhone", type: "phone", label: "Cell Phone", required: true, placeholder: "(555) 555-5555" },
        { id: "address", type: "address", label: "Address", required: true, validateState: true },
        {
          id: "sex",
          type: "radio",
          label: "Sex",
          required: true,
          options: [
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ],
        },
      ],
      rules: [
        {
          field: "address.state",
          operator: "state_not_in",
          value: ["FL", "FLORIDA"],
          action: "disqualify",
          message:
            "Sorry, we can only see patients located in Florida. Please seek treatment in the state in which you reside.",
        },
        {
          field: "dateOfBirth",
          operator: "age_under",
          value: 18,
          action: "disqualify",
          message: "We only treat patients over the age of 18.",
        },
      ],
    },

    // ------------------------------------------------------------------
    // Step 2: Crisis / Safety Screening
    // ------------------------------------------------------------------
    {
      id: "crisis-screening",
      title: "Crisis & Safety Screening",
      description:
        "Are you currently experiencing any of the following symptoms or lifestyle situations?",
      fields: [
        {
          id: "crisisSymptoms",
          type: "checkbox-group",
          label: "Current symptoms or situations",
          required: true,
          options: [
            { label: "I am actively harming myself or others", value: "self-harm" },
            { label: "I am having suicidal thoughts or ideas", value: "suicidal-thoughts" },
            { label: "I am having withdrawals from illicit drugs and/or alcohol", value: "withdrawals" },
            { label: "None of these apply", value: "none", exclusive: true },
          ],
        },
      ],
      rules: [
        {
          field: "crisisSymptoms",
          operator: "includes_any_except",
          value: "none",
          action: "disqualify",
          message:
            "Because we are a virtual practice, we advise seeking treatment at an inpatient facility. If you are in immediate danger, please call 988 (Suicide & Crisis Lifeline) or 911.",
        },
      ],
    },

    // ------------------------------------------------------------------
    // Step 3: Recent Suicide Attempt
    // ------------------------------------------------------------------
    {
      id: "suicide-attempt",
      title: "Recent History",
      description: "Have you had a suicide attempt in the last 12 months?",
      fields: [
        {
          id: "recentSuicideAttempt",
          type: "radio",
          label: "Suicide attempt in last 12 months",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
      ],
      rules: [
        {
          field: "recentSuicideAttempt",
          operator: "equals",
          value: "yes",
          action: "disqualify",
          message:
            "Because we are a virtual practice, we advise seeing someone in person for the best treatment. Please reach out to a local provider or call 988 for support.",
        },
      ],
    },

    // ------------------------------------------------------------------
    // Step 4: Suboxone Exclusion
    // ------------------------------------------------------------------
    {
      id: "suboxone",
      title: "Medication Screening",
      introText: "We do not take patients currently on suboxone.",
      fields: [
        {
          id: "suboxoneStatus",
          type: "radio",
          label: "Suboxone status",
          required: true,
          options: [
            { label: "I am on suboxone", value: "on-suboxone" },
            { label: "I am NOT on suboxone", value: "not-on-suboxone" },
          ],
        },
      ],
      rules: [
        {
          field: "suboxoneStatus",
          operator: "equals",
          value: "on-suboxone",
          action: "disqualify",
          message:
            "We don't currently treat patients on suboxone. Please seek treatment at a suboxone clinic for the best care.",
        },
      ],
    },

    // ------------------------------------------------------------------
    // Step 5: Excluded Diagnoses
    // ------------------------------------------------------------------
    {
      id: "excluded-diagnoses",
      title: "Diagnosis History",
      description:
        "Have you been diagnosed with any of the following mental health conditions (past or present)?",
      fields: [
        {
          id: "excludedConditions",
          type: "checkbox-group",
          label: "Conditions",
          required: true,
          options: [
            { label: "Selective Mutism", value: "selective-mutism" },
            { label: "Conduct Disorder", value: "conduct-disorder" },
            { label: "None of the Above", value: "none", exclusive: true },
          ],
        },
      ],
      rules: [
        {
          field: "excludedConditions",
          operator: "includes_any_except",
          value: "none",
          action: "disqualify",
          message:
            "Because we are a virtual practice, we advise seeking treatment at an inpatient facility for these conditions.",
        },
      ],
    },

    // ------------------------------------------------------------------
    // Step 6: Reason for Treatment
    // ------------------------------------------------------------------
    {
      id: "treatment-reason",
      title: "Reason for Treatment",
      description:
        "Tell us why you're currently seeking treatment.\nFeel free to list any symptoms, feelings, or thoughts that are causing you concern.",
      fields: [
        {
          id: "treatmentReason",
          type: "long-text",
          label: "Reason for seeking treatment",
          required: true,
          placeholder: "Please describe what brings you here today...",
        },
      ],
    },

    // ------------------------------------------------------------------
    // Step 7: Self-Pay Acknowledgment
    // ------------------------------------------------------------------
    {
      id: "self-pay",
      title: "Payment Information",
      introText:
        "We are a self-pay practice. Our initial evaluations last between 60–90 minutes and cost $245. Our follow-ups are 30 minutes and cost $125.\n\nAt any point, if you would like a superbill, feel free to request one to submit to your insurance company.\n\nYou will be asked to enter payment information after you select an appointment time to secure your booking.",
      fields: [
        {
          id: "selfPayAcknowledgment",
          type: "acknowledgment",
          label: "I acknowledge this is a self-pay practice.",
          required: true,
        },
      ],
    },

    // ------------------------------------------------------------------
    // Step 8: Controlled Substance Acknowledgment
    // ------------------------------------------------------------------
    {
      id: "controlled-substances",
      title: "Controlled Substances Policy",
      introText:
        "Hope First Wellness does not prescribe or manage prescription medications that are classified as controlled substances.",
      description:
        "Examples include: Adderall, Xanax, Klonopin, Ativan, Vyvanse, and other Schedule II–V medications.",
      fields: [
        {
          id: "controlledSubstanceAcknowledgment",
          type: "acknowledgment",
          label:
            "I acknowledge that Hope First Wellness will not prescribe or manage controlled substances.",
          required: true,
        },
      ],
    },

    // ------------------------------------------------------------------
    // Step 9: Virtual Care Acknowledgment
    // ------------------------------------------------------------------
    {
      id: "virtual-care",
      title: "Virtual Practice",
      introText:
        "Hope First Wellness is a fully virtual practice. All appointments will be conducted through a safe and secure video platform.",
      fields: [
        {
          id: "virtualCareAcknowledgment",
          type: "acknowledgment",
          label: "I acknowledge that Hope First Wellness is a virtual practice.",
          required: true,
        },
      ],
    },

    // ------------------------------------------------------------------
    // Step 10: Emergency Contact
    // ------------------------------------------------------------------
    {
      id: "emergency-contact",
      title: "Emergency Contact",
      description: "Please provide an emergency contact.",
      fields: [
        {
          id: "emergencyContact",
          type: "contact-group",
          label: "Emergency Contact",
          required: true,
        },
      ],
    },

    // ------------------------------------------------------------------
    // Step 11: Appointment Scheduling
    // ------------------------------------------------------------------
    {
      id: "appointment",
      title: "Schedule Your Appointment",
      description:
        "Select an available date and time for your initial evaluation.",
      fields: [
        {
          id: "appointmentSelection",
          type: "calendar",
          label: "Appointment",
          required: true,
        },
      ],
      isCustomStep: true,
    },

    // ------------------------------------------------------------------
    // Step 12: Consent Forms
    // ------------------------------------------------------------------
    {
      id: "consent-forms",
      title: "Consent Forms",
      description:
        "Please review and acknowledge the following documents before proceeding.",
      fields: [
        {
          id: "consents",
          type: "consent-forms",
          label: "Consent Forms",
          required: true,
        },
      ],
      isCustomStep: true,
    },

    // ------------------------------------------------------------------
    // Step 13: Payment (Stripe)
    // ------------------------------------------------------------------
    {
      id: "payment",
      title: "Payment Method",
      introText:
        "To secure your appointment, please add a payment method. Your card will be kept on file and may be charged in accordance with our no-show policy.",
      fields: [
        {
          id: "paymentMethod",
          type: "payment",
          label: "Payment Method",
          required: true,
        },
      ],
      isCustomStep: true,
    },

    // ------------------------------------------------------------------
    // Step 14: Referral Source
    // ------------------------------------------------------------------
    {
      id: "referral",
      title: "How Did You Hear About Us?",
      description: "How did you hear about Hope First Wellness?",
      fields: [
        {
          id: "referralSource",
          type: "radio",
          label: "Referral source",
          required: true,
          options: [
            { label: "Search Engine Results (Google, Bing, Yelp, etc.)", value: "search-engine" },
            { label: "Therapist", value: "therapist" },
            { label: "Doctor", value: "doctor" },
            { label: "Returning Hope First Patient", value: "returning-patient" },
          ],
        },
        {
          id: "referrerName",
          type: "short-text",
          label: "Who was your therapist or doctor?",
          required: true,
          placeholder: "Provider name",
          visibleWhen: {
            field: "referral.referralSource",
            operator: "includes",
            value: ["therapist", "doctor"],
          },
        },
      ],
    },

    // ------------------------------------------------------------------
    // Step 15: Confirmation (handled by ConfirmationScreen component)
    // ------------------------------------------------------------------
    {
      id: "confirmation",
      title: "You're All Set!",
      fields: [],
      isCustomStep: true,
    },
  ],
};
