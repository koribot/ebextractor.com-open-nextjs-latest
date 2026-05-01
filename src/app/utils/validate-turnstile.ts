import { headers } from "next/headers";

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

export const validateTurnstile = async (token: string): Promise<boolean> => {
  try {
    const SECRET_KEY =
      process.env.NODE_ENV === "development"
        ? "1x0000000000000000000000000000000AA"
        : process.env.CLOUDFLARE_TURNSTILE_SECRETKEY!;

    // Create FormData as per Cloudflare documentation
    const formData = new FormData();
    formData.append("secret", SECRET_KEY);
    formData.append("response", token);

    const headersList = await headers();

    const ip =
      headersList.get("CF-Connecting-IP") ||
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip");

    // Include IP if available
    if (ip) {
      formData.append("remoteip", ip);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: TurnstileResponse = await response.json();

    // Log error codes if validation fails (for debugging)
    if (!result.success && result["error-codes"]) {
      console.error("Turnstile validation failed:", result["error-codes"]);
    }

    return result.success;
  } catch (error) {
    console.error("Error validating Turnstile token:", error);
    return false;
  }
};

// Then your server action becomes simpler:
export const validateCaptchaHandler = async (
  token: string
): Promise<{ success: boolean; error?: string }> => {
  if (!token) {
    return { success: false, error: "No token provided" };
  }

  const isValid = await validateTurnstile(token);

  if (!isValid) {
    return { success: false, error: "Invalid captcha token" };
  }

  return { success: true };
};
