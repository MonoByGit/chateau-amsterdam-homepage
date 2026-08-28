import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { verifyMagicToken } from "@/lib/db/auth-codes";
import { createSession } from "@/lib/db/sessions";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/session-cookie";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    redirect("/admin/login?error=missing_token");
  }

  const result = await verifyMagicToken(token);

  if (!result.success) {
    redirect("/admin/login?error=expired_magic_link");
  }

  const { token: sessionToken } = await createSession(result.user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, sessionCookieOptions());

  redirect("/admin");
}
