"use client";
import React, { useState, useEffect, useRef } from "react";
// Declare Turnstile on window object
declare global {
  interface Window {
    turnstile: any;
    onloadTurnstileCallback: () => void;
  }
}

interface CapchaCloudflareProps {
  captchaError: string;
  setCapchaSuccess: React.Dispatch<React.SetStateAction<boolean>>;
}

const CapchaCloudflare = ({ captchaError, setCapchaSuccess }: CapchaCloudflareProps ) => {
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [widgetId, setWidgetId] = useState<string>("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile"]'
    );

    if (existingScript && window.turnstile) {
      renderWidget();
      return;
    }

    window.onloadTurnstileCallback = () => {
      renderWidget();
    };

    if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
      script.async = true;
      script.defer = true;

      script.onerror = () => {
        console.error("Failed to load Turnstile script");
      };

      document.head.appendChild(script);
    }

    return () => {
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch (e) {
          console.warn("Error removing turnstile widget:", e);
        }
      }
    };
  }, []);

  useEffect(() => {
    setError(captchaError);
    if (!!captchaToken) {
      setError("");
    }
  }, [captchaToken, captchaError]);

  const renderWidget = () => {
    const sitekey =
      process.env.NODE_ENV === "development"
        ? "3x00000000000000000000FF"
        : "0x4AAAAAABoIX0VQRc3xxn4i";
    if (window.turnstile && turnstileRef.current && !widgetId) {
      // Clear any existing content in the container
      turnstileRef.current.innerHTML = "";

      const id = window.turnstile.render(turnstileRef.current, {
        sitekey: sitekey,
        callback: (token: string) => {
          setCapchaSuccess(true);
          setCaptchaToken(token);
        },
        "error-callback": (error: any) => {
          console.log("Turnstile error:", error);
          setCaptchaToken("");
        },
        "expired-callback": () => {
          console.log("Turnstile expired");
          setCaptchaToken("");
        },
        size: "normal",
      });

      if (id) {
        setWidgetId(id);
        // console.info("Turnstile widget rendered with ID:", id);
      }
    }
  };

  return (
    <div>
      <div
        className="dark:bg-light-dark flex items-center justify-center w-full"
        ref={turnstileRef}
        style={{ minHeight: "65px" }}
      ></div>
      <input type="hidden" name="cf-turnstile-response" value={captchaToken} />
      {error && typeof window !== "undefined" && captchaToken === "" && (
        <p className="text-red-500 text-center">{error}</p>
      )}
      {captchaToken && error === "" && (
        <p className="text-green-500 mt-2">✅ Verification complete!</p>
      )}{" "}
    </div>
  );
};

export default CapchaCloudflare;
