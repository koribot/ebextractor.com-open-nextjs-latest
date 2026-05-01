// app/global-error.tsx
"use client";

import { Suspense, useEffect } from "react";
import PromotionBanner from "./components/promotion-banner/PromotionBanner";
import TopBanner from "./components/top-banner/TopBanner";
import AdSenseWrapperWithDynamicImport from "./components/ads/AdSenseWrapper";
import Navbar from "./components/nav-bar/Navbar";
import NavbarFallback from "./components/common/ui/fallbacks/NavbarFallback";
import Footer from "./components/footer/Footer";
import BackToTopButton from "./components/common/ui/Buttons/BackToTop";

interface GlobalErrorProps {
  error: Error;
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <>
      <PromotionBanner />
      <TopBanner />
      <AdSenseWrapperWithDynamicImport />
      <Navbar />
      <main className="flex flex-col items-center justify-center flex-1 px-6 text-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong.</h1>
        <p className="mb-6">
          It’s not you — it’s us. We’re aware of the problem and are working to
          fix it.
        </p>
        <p className="text-sm bg-gray-50  mb-6">
          Error: {error.message}
        </p>

        <div className="flex gap-4">
          If the problem persists, please{" "} <strong>contact: support@ebextractor.com</strong>
        </div>
      </main>
      <Footer />
      <BackToTopButton />
    </>
  );
}
