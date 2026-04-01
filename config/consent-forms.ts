// ============================================================================
// Consent forms configuration
//
// Edit this file to add, remove, or reorder consent forms.
// PDFs should be placed in /public/consent/ or fetched from DrChrono.
// ============================================================================

export interface ConsentFormConfig {
  id: string;
  title: string;
  description: string;
  /** URL to the PDF — relative path to /public or full URL */
  pdfUrl: string;
  required: boolean;
}

export const consentForms: ConsentFormConfig[] = [
  {
    id: "privacy-policy",
    title: "Privacy Policy",
    description: "Our privacy policy describes how we collect, use, and protect your personal information.",
    pdfUrl: "/consent/privacy-policy.pdf",
    required: true,
  },
  {
    id: "treatment-policy",
    title: "Treatment Policy",
    description: "Our treatment policy outlines the terms and expectations for care at Hope First Wellness.",
    pdfUrl: "/consent/treatment-policy.pdf",
    required: true,
  },
  {
    id: "hipaa-notice",
    title: "HIPAA Notice of Privacy Practices",
    description: "This notice describes how medical information about you may be used and disclosed.",
    pdfUrl: "/consent/hipaa-notice.pdf",
    required: true,
  },
  {
    id: "telehealth-consent",
    title: "Telehealth Informed Consent",
    description: "Consent for receiving healthcare services through our virtual platform.",
    pdfUrl: "/consent/telehealth-consent.pdf",
    required: true,
  },
];
