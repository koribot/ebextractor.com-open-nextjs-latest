import { xorEncode } from "@/app/utils/simpleObfuscator";
import {
  generateFakeJwtToken,
  generateRandomAuthToken,
} from "@/app/utils/token";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });
  const currentPath = request.nextUrl.pathname;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const ses = await supabase.auth.getSession();

    const exp =
      ses?.data.session?.expires_at && ses.data.session.expires_in
        ? ses.data.session.expires_at * ses.data.session.expires_in
        : 30 * 24 * 60 * 60;
    supabaseResponse.cookies.set({
      name: "authenticatedUser",
      value: JSON.stringify(!!user),
      maxAge: 30 * 24 * 60 * 60,
    });

    const usid = xorEncode(user.id);
    supabaseResponse.cookies.set({
      name: "usid",
      value: usid,
      maxAge: 30 * 24 * 60 * 60,
    });
    const imageUrl = xorEncode(user.user_metadata.avatar_url);
    supabaseResponse.cookies.set({
      name: "avtr",
      value: imageUrl,
      maxAge: 30 * 24 * 60 * 60,
    });

    supabaseResponse.cookies.set("topBanner", "hide", {
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    supabaseResponse.cookies.set("returningUser", "true", {
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    const decoyNames = [
      "_SEC_auth_token",
      "__auth_token",
      "_session_token",
      "__secure_session_id",
      "_auth_session_key",
      "__oauth2_access_token",
      "_api_session_token",
    ];

    // Add fake JWT tokens
    for (let i = 0; i < 3; i++) {
      const name = decoyNames[i];
      supabaseResponse.cookies.set(name, generateFakeJwtToken(), {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        // maxAge: 24 * 60 * 60,
        maxAge: 30 * 24 * 60 * 60, // = 30 days
      });
    }

    // Add random-looking auth tokens
    for (let i = 3; i < decoyNames.length; i++) {
      const name = decoyNames[i];
      supabaseResponse.cookies.set(name, generateRandomAuthToken(), {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        // maxAge: 24 * 60 * 60,
        maxAge: 30 * 24 * 60 * 60,
      });
    }
    if (currentPath === "/login") {
      const referer = request.headers.get("referer");
      const redirectUrl = referer || "/";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  } else {
    // To ensure fake cookies are deleted cause logout api endpoint seems problematic
    const AUTH_COOKIES = [
      "usid",
      "avtr",
      "authenticatedUser",
      "_SEC_auth_token",
      "__auth_token",
      "_session_token",
      "__secure_session_id",
      "_auth_session_key",
      "__oauth2_access_token",
      "_api_session_token",
      "token",
      "token_type",
    ];
    const allCookies = request.cookies.getAll();
    allCookies.forEach((cookie) => {
      if (AUTH_COOKIES.includes(cookie.name)) {
        supabaseResponse.cookies.delete(cookie.name);
        // supabaseResponse.cookies.set(cookie.name, "", {
        //   httpOnly: true,
        //   secure: true,
        //   sameSite: "strict",
        //   maxAge: 0, //
        //   path: "/",
        //   domain,
        //   expires: new Date(Date.now()),
        // });
      }
    });
    // await supabase.auth.signOut({scope: 'global'});
  }

  // if (
  //   !user &&
  //   !request.nextUrl.pathname.startsWith('/login') &&
  //   !request.nextUrl.pathname.startsWith('/auth')
  // ) {
  //   // no user, potentially respond by redirecting the user to the login page
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/login'
  //   return NextResponse.redirect(url)
  // }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
