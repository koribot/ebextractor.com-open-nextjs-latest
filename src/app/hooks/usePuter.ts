import { useEffect, useState } from "react";

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (
          prompt: string,
          options?: { model?: string; stream?: boolean }
        ) => Promise<any>;
        txt2img: (prompt: string) => Promise<HTMLImageElement>;
      };
      print: (content: any) => void;
    };
  }
}

export const usePuter = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load on client side
    if (typeof window === "undefined") return;

    // Check if already loaded
    if (window.puter) {
      setIsLoaded(true);
      return;
    }

    // Load the script dynamically
    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;

    script.onload = () => {
      setIsLoaded(true);
      console.log("Puter.js loaded dynamically");
    };

    script.onerror = () => {
      setError("Failed to load Puter.js");
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return {
    puter: typeof window !== "undefined" ? window.puter : null,
    isLoaded,
    error,
  };
};
