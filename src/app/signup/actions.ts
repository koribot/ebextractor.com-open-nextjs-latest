"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClientServer } from "@/lib/supabase/server";
import { validateCaptchaHandler } from "../utils/validate-turnstile";
import SQLInjectionPrevention from "../utils/sanitizer";
import { baseUrl } from "../contants/baseUrl";

export async function signupWithGoogle(formData: FormData) {
  const cookieStore = await cookies();
  const headerLists = await headers();
  const referer = headerLists.get("Referer");
  const supabase = await createClientServer();
  const captchaToken = formData.get("cf-turnstile-response") as string;
  const { searchParams } = new URL(referer || "");

  const callbackUrl = searchParams.get("callback_url") || "/";
  const decodedCallbackUrl = decodeURIComponent(callbackUrl);

  const validCapcha = await validateCaptchaHandler(captchaToken);

  if (!captchaToken || !validCapcha.success) {
    const errorCookie = (
      validCapcha.error
        ? validCapcha.error === "No token provided"
          ? "Please complete the captcha by checking the box"
          : "Invalid captcha: Please try again if the problem persists, please contact support: support@ebextractor.com"
        : "Captcha error"
    ) as string;

    cookieStore.set("captcha-error", errorCookie, { path: "/signup" });
    if (callbackUrl !== "/") {
      redirect(
        `/signup?callback_url=${encodeURIComponent(decodedCallbackUrl)}`
      );
    }
    redirect(`/signup`);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/callback?callback_url=${encodeURIComponent(
        decodedCallbackUrl
      )}`,
    },
  });

  if (error) {
    cookieStore.set("auth-error", error.message, {
      path: "/signup",
    });
    redirect("/signup");
  }

  redirect(data.url);
}

export async function signupWithEmailAndPassword(formData: FormData) {
  const cookieStore = await cookies();
  const headerLists = await headers();
  const referer = headerLists.get("Referer");
  const supabase = await createClientServer();
  const captchaToken = formData.get("cf-turnstile-response") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const name = formData.get("name") as string;
  const terms = formData.get("terms") as string;
  const { searchParams } = new URL(referer || "");

  const callbackUrl = searchParams.get("callback_url") || "/";
  const decodedCallbackUrl = decodeURIComponent(callbackUrl);

  // Validate captcha
  const validCapcha = await validateCaptchaHandler(captchaToken);
  if (!captchaToken || !validCapcha.success) {
    const errorCookie = (
      validCapcha.error
        ? validCapcha.error === "No token provided"
          ? "Please complete the captcha by checking the box"
          : "Invalid captcha: Please try again if the problem persists, please contact support: support@ebextractor.com"
        : "Captcha error"
    ) as string;

    cookieStore.set("captcha-error", errorCookie, { path: "/signup" });
    if (callbackUrl !== "/") {
      redirect(
        `/signup?callback_url=${encodeURIComponent(decodedCallbackUrl)}`
      );
    }
    redirect(`/signup`);
  }

  // Sanitize and validate inputs
  const sanitizedEmail = SQLInjectionPrevention.sanitizeAndValidate(email);
  const sanitizedPassword =
    SQLInjectionPrevention.sanitizeAndValidate(password);
  const sanitizedName = SQLInjectionPrevention.sanitizeAndValidate(name);

  if (
    !sanitizedEmail.isValid ||
    !sanitizedPassword.isValid ||
    !sanitizedName.isValid
  ) {
    cookieStore.set("auth-error", "‼️Invalid input format‼️", {
      path: "/signup",
    });
    redirect(`/signup?callback_url=${encodeURIComponent(decodedCallbackUrl)}`);
  }

  // Validate required fields
  if (!email || !password || !confirmPassword) {
    cookieStore.set("auth-error", "All fields are required", {
      path: "/signup",
    });
    redirect(`/signup?callback_url=${encodeURIComponent(decodedCallbackUrl)}`);
  }

  // Check password match
  if (password !== confirmPassword) {
    cookieStore.set("auth-error", "Passwords do not match", {
      path: "/signup",
    });
    redirect(`/signup?callback_url=${encodeURIComponent(decodedCallbackUrl)}`);
  }

  // Validate password strength (basic validation)
  if (password.length < 8) {
    cookieStore.set(
      "auth-error",
      "Password must be at least 8 characters long",
      {
        path: "/signup",
      }
    );
    redirect(`/signup?callback_url=${encodeURIComponent(decodedCallbackUrl)}`);
  }

  // Check if terms are accepted
  if (!terms) {
    cookieStore.set(
      "auth-error",
      "You must agree to the Terms of Service and Privacy Policy",
      {
        path: "/signup",
      }
    );
    redirect(`/signup?callback_url=${encodeURIComponent(decodedCallbackUrl)}`);
  }

  // Create user account
  const { data, error } = await supabase.auth.signUp({
    email: sanitizedEmail.sanitizedInput,
    password: sanitizedPassword.sanitizedInput,
    options: {
      emailRedirectTo: `${baseUrl}`,
      data: {
        name: sanitizedName.sanitizedInput,
        full_name: sanitizedName.sanitizedInput,
      },
    },
  });

  if (error) {
    cookieStore.set("auth-error", error.message, {
      path: "/signup",
    });
    redirect(`/signup?callback_url=${encodeURIComponent(decodedCallbackUrl)}`);
  }

  // If user needs to confirm email
  if (data.user && !data.session) {
    cookieStore.set(
      "auth-success",
      "Please check your email to confirm your account",
      {
        path: "/signup",
      }
    );
    redirect("/signup");
  }

  revalidatePath("/", "layout");
  redirect(`${baseUrl}${decodedCallbackUrl}`);
}
