import { NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/integrations/drchrono/oauth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    const desc = searchParams.get("error_description") ?? error;
    return NextResponse.redirect(
      new URL(`/admin/drchrono?error=${encodeURIComponent(desc)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/drchrono?error=Missing+authorization+code", request.url)
    );
  }

  try {
    await exchangeCodeForTokens(code);
    return NextResponse.redirect(
      new URL("/admin/drchrono?connected=true", request.url)
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Token exchange failed";
    console.error("DrChrono OAuth callback error:", message);
    return NextResponse.redirect(
      new URL(`/admin/drchrono?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}
