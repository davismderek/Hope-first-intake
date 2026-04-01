import { NextResponse } from "next/server";
import { getSetupIntentResult } from "@/lib/integrations/stripe/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { setupIntentId } = body;

    if (!setupIntentId) {
      return NextResponse.json(
        { error: "setupIntentId is required" },
        { status: 400 }
      );
    }

    const result = await getSetupIntentResult(setupIntentId);

    if (result.status !== "succeeded") {
      return NextResponse.json(
        { error: "Setup intent has not succeeded" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      paymentMethodId: result.paymentMethodId,
      customerId: "", // Returned from the create-setup-intent call, stored client-side
      status: result.status,
    });
  } catch (error) {
    console.error("Failed to confirm payment method:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment method" },
      { status: 500 }
    );
  }
}
