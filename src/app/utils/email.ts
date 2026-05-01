interface EmailResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

interface ForgotPasswordEmailParams {
  email_api_key: string;
  token: string;
  userId: string;
  username: string;
  email: string;
  expiration_text: string;
  base_url: string;
}

interface ActivationEmailParams {
  email_api_key: string;
  token: string;
  userId: string;
  username: string;
  email: string;
  expirationText: string;
  baseUrl: string;
}

/**
 * Sends an activation email to a user
 * @param token - The activation token
 * @param userId - The user's ID
 * @param username - The user's username
 * @param email - The user's email address
 * @returns Promise<EmailResponse> - The response from the email service
 * @throws Error if the email sending fails
 */
export async function sendActivationEmail({email_api_key, token, userId, username, email, expirationText, baseUrl}: ActivationEmailParams): Promise<EmailResponse> {
//   const isServer = typeof window === "undefined";

//   if (!isServer) {
//     const data: EmailResponse = {
//       success: false,
//       message: "Error Sending Forgot Token Email",
//       errorDescription:
//         "You are not on the server! This is strictly for the server use",
//     };
//     return data;
//   }
  try {
    const formData = new FormData();
    formData.append("token", token);
    formData.append("user_id", userId);
    formData.append("username", username);
    formData.append("email", email);
    formData.append("baseUrl", baseUrl);
    formData.append("expirationText", expirationText);
    const response = await fetch(
      "https://ebextractor.pythonanywhere.com/send-activation-email",
      {
        method: "POST",
        headers: {
          "X-API-Key": email_api_key,
        },
        body: formData,
      }
    );

    const data: EmailResponse = await response.json();
    if (data.success) {
      console.log("Email sent successfully");
      return data;
    } else {
      console.error("Failed to send email:", data.message);
      return {
        success: false,
        message: data.message,
      };
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message: "Error sending email",
    }
  }
}

/**
 * Sends a password reset email to a user
 * @param params - Object containing token, userId, username, and email
 * @returns Promise<EmailResponse> - The response from the email service
 * @throws Error if the email sending fails
 */
export async function sendForgotTokenEmail(
  params: ForgotPasswordEmailParams
): Promise<EmailResponse> {
//   const isServer = typeof window === "undefined";
//   if (!isServer) {
//     const data: EmailResponse = {
//       success: false,
//       message: "Error Sending Forgot Token Email",
//       errorDescription:
//         "You are not on the server! This is strictly for the server use",
//     };
//     return data;
//   }
  try {
    const formData = new FormData();
    formData.append("token", params.token);
    formData.append("user_id", params.userId);
    formData.append("username", params.username);
    formData.append("email", params.email);
    formData.append("expiration_text", params.expiration_text);
    formData.append("base_url", params.base_url);
    const response = await fetch(
      "https://ebextractor.pythonanywhere.com/send-email-forgot-password",
      {
        method: "POST",
        headers: {
          "X-API-Key": params.email_api_key,
        },
        body: formData,
      }
    );

    const data: EmailResponse = await response.json();
    if (data.success) {
      console.log("Password reset email sent successfully");
      return data;
    } else {
      console.error("Failed to send password reset email:", data.message);
      throw new Error(data.message || "Failed to send password reset email");
    }
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}
