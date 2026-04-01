import Stripe from "stripe";

// ============================================================================
// Stripe server-side operations
//
// All Stripe API calls that touch secret keys happen here (server-only).
// Raw card data never touches our server — Stripe Elements handles that.
//
// No-show charge architecture:
//   1. During intake, a SetupIntent saves the patient's payment method
//   2. The payment method is attached to a Stripe Customer
//   3. Later, if a no-show occurs, create a PaymentIntent with:
//      - customer: stripeCustomerId
//      - payment_method: stripePaymentMethodId
//      - off_session: true
//      - confirm: true
//   4. Optionally sync charge status back to DrChrono via custom field
// ============================================================================

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

/**
 * Creates a Stripe Customer and a SetupIntent for saving a payment method.
 * Called before the payment step renders.
 */
export async function createSetupIntent(params: {
  email: string;
  name: string;
}): Promise<{
  customerId: string;
  setupIntentId: string;
  clientSecret: string;
}> {
  const stripe = getStripe();

  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      source: "hope-first-intake-wizard",
    },
  });

  const setupIntent = await stripe.setupIntents.create({
    customer: customer.id,
    payment_method_types: ["card"],
    metadata: {
      intake_source: "wizard",
    },
  });

  return {
    customerId: customer.id,
    setupIntentId: setupIntent.id,
    clientSecret: setupIntent.client_secret!,
  };
}

/**
 * Retrieves the confirmed SetupIntent to extract the saved payment method.
 * Called after the patient completes the payment step.
 */
export async function getSetupIntentResult(setupIntentId: string): Promise<{
  paymentMethodId: string;
  status: string;
}> {
  const stripe = getStripe();
  const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

  return {
    paymentMethodId: setupIntent.payment_method as string,
    status: setupIntent.status,
  };
}

/**
 * Placeholder: Charge a no-show fee off-session.
 * Call this from an admin tool or scheduled job.
 */
export async function chargeNoShowFee(params: {
  customerId: string;
  paymentMethodId: string;
  amountCents: number;
  description?: string;
}): Promise<{ paymentIntentId: string }> {
  const stripe = getStripe();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amountCents,
    currency: "usd",
    customer: params.customerId,
    payment_method: params.paymentMethodId,
    off_session: true,
    confirm: true,
    description: params.description ?? "No-show fee — Hope First Wellness",
    metadata: {
      charge_type: "no_show",
    },
  });

  return { paymentIntentId: paymentIntent.id };
}
