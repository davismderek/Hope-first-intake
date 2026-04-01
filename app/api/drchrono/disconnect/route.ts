import { NextResponse } from "next/server";
import { getTokenStore } from "@/lib/integrations/drchrono/token-store";

export async function POST() {
  try {
    const store = getTokenStore();
    await store.clearTokens();
    return NextResponse.json({ disconnected: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
