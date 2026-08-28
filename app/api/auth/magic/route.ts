import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { verifyMagicToken } from "@/lib/db/auth-codes";
import { createSession } from "@/lib/db/sessions";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/session-cookie";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login?error=missing_token", request.url));
  }

  const result = await verifyMagicToken(token);

  if (!result.success) {
    return NextResponse.redirect(new URL("/admin/login?error=expired_magic_link", request.url));
  }

  const { token: sessionToken } = await createSession(result.user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, sessionCookieOptions());

  return NextResponse.redirect(new URL("/admin", request.url));
}
