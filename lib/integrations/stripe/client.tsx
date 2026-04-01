"use client";

import { loadStripe } from "@stripe/stripe-js";

// ============================================================================
// Stripe client-side setup
//
// The publishable key is safe to expose in the browser.
// All sensitive operations happen server-side via API routes.
// ============================================================================

let stripePromise: ReturnType<typeof loadStripe> | null = null;

export function getStripePromise() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}
