// ============================================================================
// Branding configuration
//
// Edit this file to match the look and feel of the parent Squarespace site.
// Colors here are also reflected in tailwind.config.ts under "brand" palette.
// ============================================================================

export const branding = {
  name: "Hope First Wellness",
  logoUrl: "/logo.png",
  logoAlt: "Hope First Wellness",
  tagline: "Your journey to wellness starts here.",

  colors: {
    primary: "#3d8d6c",
    primaryDark: "#2d7156",
    accent: "#d88032",
    background: "#f5f7fa",
    card: "#ffffff",
    text: "#1f2633",
    textMuted: "#5c769c",
    error: "#dc2626",
    success: "#16a34a",
  },

  /** External website URL for header link / back button */
  websiteUrl: "https://hopefirstwellness.com",

  /** Footer text shown at the bottom of the wizard */
  footerText: "© Hope First Wellness. All rights reserved.",

  /** Support contact for disqualification screens */
  supportEmail: "info@hopefirstwellness.com",
  supportPhone: "(555) 123-4567",
} as const;
