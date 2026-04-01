import { NextResponse } from "next/server";
import { getTokenStore } from "@/lib/integrations/drchrono/token-store";

export async function GET() {
  try {
    const store = getTokenStore();
    const tokens = await store.getTokens();

    if (!tokens) {
      return NextResponse.json({ connected: false });
    }

    const now = Date.now();
    const expiresInMs = tokens.expiresAt - now;
    const expiresInMinutes = Math.round(expiresInMs / 60_000);

    return NextResponse.json({
      connected: true,
      expiresAt: new Date(tokens.expiresAt).toISOString(),
      expiresInMinutes,
      isExpired: expiresInMs <= 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
