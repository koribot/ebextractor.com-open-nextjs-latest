"use client";
import React, { useLayoutEffect, useState } from "react";
import { getCookies, setCookie } from "cookies-next/client";

const TopBanner: React.FC = () => {
  const [show, setShow] = useState(false); // Start with false to prevent flash

  const handleClose = (): void => {
    setCookie("topBanner", "hide", { path: "/", maxAge: 30 * 24 * 60 * 60 });
    setShow(false); // Immediately hide the banner
  };

  useLayoutEffect(() => {
    const cookies = getCookies();
    // Only show if neither cookie is set
    // if (cookies?.topBanner !== "hide" && !cookies?.authenticated) {
    //   setShow(true);
    // }
    setShow(true);
  }, []); // Remove dependencies since we only want this to run once

  if (!show) {
    return null;
  }

  return (
    <div className="bg-gray-100 opacity-95 border-b border-black  text-white shadow-lg dark:bg-dark dark:border-b dark:border-gray-700  flex items-center">
      {/* <div className="max-w-7xl mx-auto px-4 py-1 sm:px-6 lg:px-8"> */}
      <div className="mx-auto px-4 py-1">{promotionTenexPanels()}</div>
      {/* <button
        onClick={handleClose}
        className="px-4 py-2 hover:bg-white/10 transition-colors"
        aria-label="Close banner"
      >
        ✕
      </button> */}
    </div>
  );
};

const promotionTenexPanels = () => {
  return (
    <div className="flex items-center px-4 flex-col md:flex-row text-black dark:text-white">
      <div className="text-xs md:text-sm text-center">
        Are you looking for Wall Panels, Ceilingboard or trim pieces?
        <a
          href="https://texpanels.com/products?utm_source=ebextractor.com"
          target="_blank"
          className="underline font-semibold ml-1"
        >
          Check out Tenex Panels!
        </a>
      </div>
      <span className="mx-2 hidden md:block">|</span>
      <div className="text-xs md:text-sm text-center">
        Leader In Surplus Metal, Industrial Salvage, And Asset Liquidation.
        <a
          href="https://mbglick.com?utm_source=ebextractor.com"
          target="_blank"
          className="underline font-semibold ml-1"
        >
          Check out MBGLICK!
        </a>
      </div>
      {/* <div className="text-xs md:text-sm text-center">
        <a
          href="https://www.amazon.com/primebigdealdays?tag=ebextractor0d-20"
          target="_blank"
          className="underline font-semibold"
        >
          AMAZON PRIME BIG DEAL DAYS
        </a>
      </div> */}
      {/* <button
        onClick={handleClose}
        className="px-4 py-2 hover:bg-white/10 transition-colors"
        aria-label="Close banner"
      >
        ✕
      </button> */}
    </div>
  );
};

const thankyouAmazonApiIsNowApproved = () => {
  return (
    <div className="flex flex-col gap-2 md:flex-row lg:flex-row items-center justify-center space-x-4">
      <p className="text-xs md:text-sm lg:text-sm text-center font-medium sm:text-base">
        Thank you! Amazon search api is now approved! 🙏 thank you for the
        support
      </p>
    </div>
  );
};

const helpMeHaveAmazonApi = () => {
  return (
    <div className="flex flex-col gap-2 md:flex-row lg:flex-row items-center justify-center space-x-4">
      <p className="text-xs md:text-sm lg:text-sm text-center font-medium sm:text-base">
        Amazon search result isn't working yet - I need API approval. Help me
        get it by clicking the Amazon button when you shop!
      </p>

      <a
        // target="_blank"
        href="/how-to-help-amazon-api"
        className="cursor-pointer inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-sm font-medium group"
      >
        How To Help
        <svg
          className="ml-1.5 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </a>
    </div>
  );
};

const createAccount = () => {
  return (
    <div className="flex flex-col gap-2 md:flex-row lg:flex-row items-center justify-center space-x-4">
      <p className="text-xs md:text-sm lg:text-sm text-center font-medium sm:text-base">
        Create your account now to unlock more features for FREE
      </p>

      <a
        href="/signup"
        className="cursor-pointer inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-sm font-medium group"
      >
        Get Started
        <svg
          className="ml-1.5 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </a>
    </div>
  );
};
export default TopBanner;
