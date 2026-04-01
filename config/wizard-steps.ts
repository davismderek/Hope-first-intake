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
                {
                    id: "firstName",
                    type: "short-text",
                    label: "First Name",
                    required: true,
                    placeholder: "First name",
                },
                {
                    id: "lastName",
                    type: "short-text",
                    label: "Last Name",
                    required: true,
                    placeholder: "Last name",
                },
                {
                    id: "dateOfBirth",
                    type: "date",
                    label: "Date of Birth",
                    required: true,
                },
                {
                    id: "email",
                    type: "email",
                    label: "Email Address",
                    required: true,
                    placeholder: "you@example.com",
                },
                {
                    id: "cellPhone",
                    type: "phone",
                    label: "Cell Phone",
                    required: true,
                    placeholder: "(555) 555-5555",
                },
                {
                    id: "address",
                    type: "address",
                    label: "Address",
                    required: true,
                    validateState: true,
                },
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
                        "Thank you for your interest in Hope First Wellness. At this time, we are only able to treat patients who are physically located in Florida due to licensing requirements. We recommend seeking care with a provider licensed in your state. If you need urgent support, please seek local care or contact a crisis resource in your area.",
                },
                {
                    field: "dateOfBirth",
                    operator: "age_under",
                    value: 18,
                    action: "disqualify",
                    message:
                        "Thank you for your interest in Hope First Wellness. At this time, we only treat patients who are 18 years of age or older. We recommend seeking care with a provider who treats minors.",
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
                "Are you currently experiencing any of the following symptoms or situations?",
            fields: [
                {
                    id: "crisisSymptoms",
                    type: "checkbox-group",
                    label: "Current symptoms or situations",
                    required: true,
                    options: [
                        {
                            label: "I am actively harming myself or others",
                            value: "self-harm",
                        },
                        {
                            label: "I am having suicidal thoughts or ideas",
                            value: "suicidal-thoughts",
                        },
                        {
                            label: "I am having withdrawals from illicit drugs and/or alcohol",
                            value: "withdrawals",
                        },
                        {
                            label: "I am seeking an official Autism diagnosis or evaluation",
                            value: "autism-diagnosis",
                        },
                        {
                            label: "I am seeking an official ADHD diagnosis or evaluation",
                            value: "adhd-diagnosis",
                        },
                        {
                            label: "I am having auditory or visual hallucinations",
                            value: "hallucinations",
                        },
                        {
                            label: "I have brain trauma, concussions, or neurological issues",
                            value: "neurological-issues",
                        },
                        {
                            label: "I have involuntary movement of my muscles and/or limbs",
                            value: "involuntary-movement",
                        },
                        {
                            label: "Another individual is responsible for my medical decisions",
                            value: "other-individual-responsible",
                        },
                        {
                            label: "None of these apply",
                            value: "none",
                            exclusive: true,
                        },
                    ],
                },
            ],
            rules: [
                // High-risk / urgent: always evaluate first
                {
                    field: "crisisSymptoms",
                    operator: "includes",
                    value: [
                        "self-harm",
                        "suicidal-thoughts",
                        "withdrawals",
                        "hallucinations",
                        "neurological-issues",
                        "involuntary-movement",
                    ],
                    action: "disqualify",
                    message:
                        "Thank you for completing this assessment. Based on your responses, your current needs may be best supported with in-person care or a higher level of support. As a virtual practice, we are not able to provide the appropriate level of care at this time. We strongly encourage you to seek care locally with a qualified provider or visit an urgent care or emergency setting if needed. If you are experiencing urgent symptoms or feel at risk, please call 911, go to your nearest emergency room, or contact the 988 Suicide & Crisis Lifeline by calling or texting 988.",
                },

                // Moderate / out-of-scope: only applies if no high-risk rule matched
                {
                    field: "crisisSymptoms",
                    operator: "includes",
                    value: [
                        "autism-diagnosis",
                        "adhd-diagnosis",
                        "other-individual-responsible",
                    ],
                    action: "disqualify",
                    message:
                        "Thank you for completing this assessment. Based on your responses, your needs may be best supported through in-person care or a provider with specialized services. As a virtual practice, we are not able to offer the appropriate services for your situation at this time. We recommend seeking care with a qualified provider in your area.",
                },
            ],
        },

        // ------------------------------------------------------------------
        // Step 3: Recent Suicide Attempt
        // ------------------------------------------------------------------
        {
            id: "suicide-attempt",
            title: "Recent History",
            description:
                "Have you had a suicide attempt in the last 12 months?",
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
                        "Thank you for completing this assessment. Based on your response, your needs may be best supported through in-person care. As a virtual practice, we are not able to provide the appropriate level of care at this time. Please seek care locally with a qualified provider. If you are in immediate danger or feel unable to stay safe, call 911, go to the nearest emergency room, or call or text 988.",
                },
            ],
        },

        // ------------------------------------------------------------------
        // Step 4: Suboxone Exclusion
        // ------------------------------------------------------------------
        {
            id: "suboxone",
            title: "Medication Screening",
            introText:
                "Are you currently taking Suboxone or receiving Suboxone maintenance treatment?",
            fields: [
                {
                    id: "suboxoneStatus",
                    type: "radio",
                    label: "Suboxone status",
                    required: true,
                    options: [
                        {
                            label: "Yes, I am currently taking Suboxone or receiving Suboxone maintenance treatment",
                            value: "on-suboxone",
                        },
                        {
                            label: "No, I am not currently taking Suboxone or receiving Suboxone maintenance treatment",
                            value: "not-on-suboxone",
                        },
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
                        "Thank you for completing this assessment. At this time, our practice does not provide treatment for patients receiving Suboxone maintenance treatment. We recommend seeking care with a provider or clinic that offers medication-assisted treatment services.",
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
                        {
                            label: "Selective Mutism",
                            value: "selective-mutism",
                        },
                        {
                            label: "Conduct Disorder",
                            value: "conduct-disorder",
                        },
                        {
                            label: "Developmental Delay",
                            value: "developmental-delay",
                        },
                        {
                            label: "Antisocial Personality Disorder",
                            value: "antisocial-personality-disorder",
                        },
                        {
                            label: "Dissociative Identity Disorder",
                            value: "dissociative-identity-disorder",
                        },
                        {
                            label: "Intermittent Explosive Disorder",
                            value: "intermittent-explosive-disorder",
                        },
                        {
                            label: "Oppositional Defiance Disorder",
                            value: "oppositional-defiance-disorder",
                        },
                        {
                            label: "Alcohol Use Disorder (Not Currently in Recovery)",
                            value: "alcohol-use-disorder",
                        },
                        {
                            label: "Opioid Addiction (Not Currently in Recovery)",
                            value: "opioid-addiction",
                        },
                        {
                            label: "None of the Above",
                            value: "none",
                            exclusive: true,
                        },
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
                        "Thank you for completing this assessment. Based on your responses, your needs may be best supported through in-person care or with a provider who offers specialized services. As a virtual practice, we are not able to provide the appropriate level of care for these conditions at this time. We recommend seeking care with a qualified provider in your area.",
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
                    placeholder:
                        "Please describe what brings you here today...",
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
                    label: "I acknowledge that Hope First Wellness will not prescribe or manage controlled substances.",
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
                "Hope First Wellness is a fully virtual practice. All appointments are conducted through a safe and secure video platform.",
            fields: [
                {
                    id: "virtualCareAcknowledgment",
                    type: "acknowledgment",
                    label: "I acknowledge that all appointments are conducted virtually.",
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
                    fields: [
                        {
                            id: "name",
                            type: "short-text",
                            label: "Full Name",
                            required: true,
                        },
                        {
                            id: "relationship",
                            type: "short-text",
                            label: "Relationship to You",
                            required: true,
                        },
                        {
                            id: "phone",
                            type: "phone",
                            label: "Cell Phone Number",
                            required: true,
                        },
                    ],
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
                        {
                            label: "Search Engine Results (Google, Bing, Yelp, etc.)",
                            value: "search-engine",
                        },
                        { label: "Therapist", value: "therapist" },
                        {
                            label: "Psychology Today",
                            value: "psychology-today",
                        },
                        { label: "Doctor", value: "doctor" },
                        {
                            label: "Returning Hope First Patient",
                            value: "returning-patient",
                        },
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
