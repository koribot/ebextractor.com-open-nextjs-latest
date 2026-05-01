import { create } from "zustand";
import { Toast } from "../utils/toast";

interface TokenConfirmationState {
  token: string;
  error: string;
  isVerifying: boolean;
  isResending: boolean;
  isVerified: boolean;
  setToken: (token: string) => void;
  setError: (error: string) => void;
  verifyToken: (
    userId: string | undefined,
    tokenToVerify: string
  ) => Promise<void>;
  resendVerification: (userId: string | undefined) => Promise<void>;
  reset: () => void;
}

export const useTokenConfirmation = create<TokenConfirmationState>(
  (set, get) => ({
    token: "",
    error: "",
    isVerifying: false,
    isResending: false,
    isVerified: false,
    setToken: (token) => set({ token }),
    setError: (error) => set({ error }),

    verifyToken: async (userId, tokenToVerify) => {
      try {
        set({ isVerifying: true, error: "" });

        const response = await fetch("/api/verify-account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: tokenToVerify, userId }),
        });
        const data: any = await response.json();

        if (data?.verified) {
          Toast().fire({
            icon: "success",
            title: "Account is Verified! Login now",
          });
          set({ isVerified: true });
          console.log(data);
          window.location.href = "/login";
        } else {
          set({ error: data.error || "Invalid confirmation token" });
          if (data.expired) {
            Toast().fire({
              icon: "warning",
              title: "Verification code has expired",
            });
          }
          set({ isVerified: true });
        }
      } catch (error) {
        set({ error: "An error occurred during verification" });
        set({ isVerified: true });
      } finally {
        set({ isVerifying: false });
        set({ isVerified: true });
      }
    },

    resendVerification: async (userId) => {
      try {
        set({ isResending: true, error: "" });

        const response = await fetch("/api/resend-verification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });

        const data: any = await response.json();

        if (!response.ok) {
          set({ error: data.error || "Failed to resend verification code" });
          return;
        }

        Toast().fire({
          icon: "success",
          title: "New verification code sent!",
        });
      } catch (err) {
        set({ error: "Failed to resend verification code" });
      } finally {
        set({ isResending: false });
      }
    },

    reset: () =>
      set({
        token: "",
        error: "",
        isVerifying: false,
        isResending: false,
      }),
  })
);
