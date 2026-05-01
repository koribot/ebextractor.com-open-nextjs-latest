import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClientServer } from "@/lib/supabase/server";

// List of all auth-related cookies to clear
const AUTH_COOKIES = [
  "usid",
  "authenticatedUser",
  "_SEC_auth_token",
  "__auth_token",
  "_session_token",
  "__secure_session_id",
  "_auth_session_key",
  "__oauth2_access_token",
  "_api_session_token",
  "token", // Added 'token' to the list
  "token_type", // Legacy cookie
];

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = await createClientServer();
  await supabase.auth.signOut({ scope: "global" });
  const domain = process.env.NEXT_PUBLIC_DOMAIN;
  // Clear all auth-related cookies

  const response = NextResponse.json({ req });
  AUTH_COOKIES.forEach((cookieName) => {
    response.cookies.delete(cookieName);
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 0, //
      path: "/",
      domain,
      expires: new Date(0),
    });
  });

  // Create response with redirect

  // Add no-cache headers
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Surrogate-Control", "no-store");
  response.headers.set("Location", "/login");
  response.headers.set("Content-Type", "application/json");

  return response;
}
