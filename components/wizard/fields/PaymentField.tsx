"use client";

import { useState, useEffect } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripePromise } from "@/lib/integrations/stripe/client";
import { useWizard } from "@/lib/wizard/context";

function PaymentForm({ onComplete }: { onComplete: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { dispatch } = useWizard();
  const [error, setError] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  async function handleSubmit() {
    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Payment setup failed.");
      setProcessing(false);
      return;
    }

    const { error: confirmError, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}`,
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment setup failed.");
      setProcessing(false);
      return;
    }

    if (setupIntent && setupIntent.status === "succeeded") {
      const res = await fetch("/api/stripe/confirm-payment-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupIntentId: setupIntent.id }),
      });

      if (res.ok) {
        const data = await res.json();
        dispatch({
          type: "SET_STRIPE_REFS",
          customerId: data.customerId,
          paymentMethodId: data.paymentMethodId,
          setupIntentId: setupIntent.id,
        });
        onComplete();
      } else {
        setError("Failed to save payment method. Please try again.");
      }
    }

    setProcessing(false);
  }

  return (
    <div className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <p className="text-xs text-calm-500 leading-relaxed">
        Your card will be stored securely by Stripe. It will only be charged in accordance with
        our no-show and cancellation policy. No charges will be made at this time.
      </p>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!stripe || processing}
        className="w-full rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white
                   hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? "Saving..." : "Save Payment Method"}
      </button>
    </div>
  );
}

export function PaymentField() {
  const { state } = useWizard();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (state.stripePaymentMethodId) {
      setSaved(true);
      setLoading(false);
      return;
    }

    async function init() {
      try {
        const contactData = state.formData["contact-details"] ?? {};
        const res = await fetch("/api/stripe/create-setup-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: contactData.email ?? "",
            name: `${contactData.firstName ?? ""} ${contactData.lastName ?? ""}`.trim(),
          }),
        });

        if (!res.ok) throw new Error("Failed to initialize payment");

        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch {
        setError("Unable to initialize payment. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [state.formData, state.stripePaymentMethodId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (saved) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <svg className="w-10 h-10 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium text-green-800">Payment method saved successfully.</p>
        <p className="text-xs text-green-600 mt-1">You can proceed to the next step.</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  const stripePromise = getStripePromise();
  if (!stripePromise || !clientSecret) {
    return <p className="text-sm text-calm-500">Payment setup is unavailable.</p>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#3d8d6c",
            borderRadius: "8px",
          },
        },
      }}
    >
      <PaymentForm onComplete={() => setSaved(true)} />
    </Elements>
  );
}
