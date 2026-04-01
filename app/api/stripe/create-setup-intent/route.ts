import { NextResponse } from "next/server";
import { createSetupIntent } from "@/lib/integrations/stripe/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    const result = await createSetupIntent({ email, name });

    return NextResponse.json({
      clientSecret: result.clientSecret,
      customerId: result.customerId,
      setupIntentId: result.setupIntentId,
    });
  } catch (error) {
    console.error("Failed to create setup intent:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment setup" },
      { status: 500 }
    );
  }
}
