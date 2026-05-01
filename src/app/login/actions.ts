"use server";

import { createClientServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { baseUrl } from "../contants/baseUrl";
import { validateCaptchaHandler } from "../utils/validate-turnstile";
import { cookies, headers } from "next/headers";
import SQLInjectionPrevention from "../utils/sanitizer";

export async function loginOrSignupWithGoogle(formData: FormData) {
  const cookieStore = await cookies();
  const headerLists = await headers();
  const referer = headerLists.get("Referer");
  const { searchParams } = new URL(referer || "");
  const decodedSearchParams = decodeURIComponent(searchParams.toString());
  const callbackUrl = searchParams.get("callback_url") || "/";
  const decodedCallbackUrl = decodeURIComponent(callbackUrl);
  const supabase = await createClientServer();
  const captchaToken = formData.get("cf-turnstile-response") as string; // NOTE do not use JSON.stringify as it will break the token for validation
  const validCapcha = await validateCaptchaHandler(captchaToken);
  if (!captchaToken || !validCapcha.success) {
    const errorCookie = (
      validCapcha.error
        ? validCapcha.error === "No token provided"
          ? "Please complete the captcha by checking the box"
          : "Invalid captcha: Please try again if the problem persists, please contact support: support@ebextractor.com"
        : "Captcha error"
    ) as string;

    cookieStore.set("captcha-error", errorCookie, { path: "/login" });
    if (callbackUrl !== "/") {
      redirect(`/login?callback_url=${encodeURIComponent(decodedCallbackUrl)}`);
    }
    redirect(`/login`);
  }
  // type-casting here for convenienc
  // in practice, you should validate your inputs
  //   const data = {
  //     email: formData.get("email") as string,
  //     password: formData.get("password") as string,
  //   };

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      redirectTo: `${baseUrl}/auth/callback?next=/refresh-all-page?callback_url=${encodeURIComponent(
        decodedCallbackUrl,
      )}`,
    },
  });
  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect(`${data.url}`);
}

export async function loginWithEmailAndPassword(formData: FormData) {
  const cookieStore = await cookies();
  const headerLists = await headers();
  const referer = headerLists.get("Referer");
  const supabase = await createClientServer();
  const captchaToken = formData.get("cf-turnstile-response") as string; // NOTE do not use JSON.stringify as it will break the token for validation
  const email = formData.get("email") as string;
  const { searchParams } = new URL(referer || "");

  const callbackUrl = searchParams.get("callback_url") || "/";
  const decodedCallbackUrl = decodeURIComponent(callbackUrl);

  const password = formData.get("password") as string;
  const validCapcha = await validateCaptchaHandler(captchaToken);
  const sanitizedEmail = SQLInjectionPrevention.sanitizeAndValidate(email);
  const sanitizedPassword =
    SQLInjectionPrevention.sanitizeAndValidate(password);
  if (!sanitizedEmail.isValid || !sanitizedPassword.isValid) {
    cookieStore.set("auth-error", "‼️Invalid email or password format‼️", {
      path: "/login",
    });
    redirect(`/login?callback_url=${encodeURIComponent(decodedCallbackUrl)}`);
  }
  if (!captchaToken || !validCapcha.success) {
    const errorCookie = (
      validCapcha.error
        ? validCapcha.error === "No token provided"
          ? "Please complete the captcha by checking the box"
          : "Invalid captcha: Please try again if the problem persists, please contact support: support@ebextractor.com"
        : "Captcha error"
    ) as string;

    cookieStore.set("captcha-error", errorCookie, { path: "/login" });
    redirect(`/login?callback_url=${encodeURIComponent(decodedCallbackUrl)}`);
  }
  // type-casting here for convenienc
  // in practice, you should validate your inputs
  //   const data = {
  //     email: formData.get("email") as string,
  //     password: formData.get("password") as string,
  //   };
  const { data, error } = await supabase.auth.signInWithPassword({
    email: sanitizedEmail.sanitizedInput,
    password: sanitizedPassword.sanitizedInput,
  });

  if (error) {
    cookieStore.set("auth-error", error.message, {
      path: "/login",
    });
    redirect("/login");
  }
  revalidatePath("/", "layout");
  redirect(`${baseUrl}${decodedCallbackUrl}`);
}

export async function signup(formData: FormData) {
  const supabase = await createClientServer();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
