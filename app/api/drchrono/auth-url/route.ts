import { NextResponse } from "next/server";
import { buildAuthorizeUrl } from "@/lib/integrations/drchrono/oauth";

export async function GET() {
  try {
    const url = buildAuthorizeUrl();
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
