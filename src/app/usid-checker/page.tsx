"use client";
import React, { useEffect } from "react";
import {
  LocalStorageManager,
  usidStorageLocalStorage,
} from "../utils/LocalStorageManager";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import logo from "../../public/logo-icon-transparent.png";
import requests from "../utils/http";
import { AuthUserMeResponse } from "../model/User";
import { api_paths } from "../contants/api-paths";

const Loading = () => {
  return (
    <>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out 0.2s both;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <div className="fixed inset-0 flex items-center justify-center z-[999999999999999999] w-full min-h-screen flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-900 dark:via-gray-900 dark:to-black">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-teal-500/10 dark:bg-teal-500/10 rounded-full blur-xl animate-pulse-glow"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-xl animate-pulse-glow animation-delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-xl animate-pulse-glow animation-delay-2000"></div>
        </div>

        {/* Main loading content */}
        <div className="flex flex-col items-center space-y-8 animate-fade-in relative z-10">
          {/* Enhanced Spinner with multiple rings */}
          <div className="relative animate-float">
            {/* Outer glow ring */}
            <div className="w-16 h-16 absolute animate-ping rounded-full bg-teal-400/20 dark:bg-teal-400/20"></div>

            {/* Secondary ring */}
            <div className="w-14 h-14 absolute top-1 left-1 animate-spin rounded-full border-2 border-transparent border-t-teal-600/50 border-r-teal-600/50 dark:border-t-teal-300/50 dark:border-r-teal-300/50"></div>

            {/* Main spinner */}
            <div
              className="w-16 h-16 border-4 animate-spin rounded-full border-r-transparent border-teal-600 dark:border-teal-400"
              role="status"
              aria-label="Loading"
            ></div>

            {/* Inner rotating dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-teal-600 dark:bg-teal-400 animate-pulse"></div>
            </div>
          </div>

          {/* Loading text with enhanced styling */}
          <div className="text-center space-y-4">
            <div className="text-gray-800 dark:text-white/90">
              <span className="sr-only">Authenticating</span>
              <span className="text-lg font-medium tracking-wide">
                Authenticating...
              </span>
            </div>

            {/* Enhanced loading dots animation */}
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 animate-bounce"></div>
            </div>

            {/* Progress bar */}
            <div className="w-48 h-1 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-500 to-blue-500 dark:from-teal-400 dark:to-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Enhanced bottom section */}
        <div className="fixed bottom-8 flex flex-col items-center space-y-4 animate-fade-in-up">
          {/* Logo placeholder with better styling */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100/80 to-blue-100/80 dark:from-teal-400/20 dark:to-blue-500/20 backdrop-blur-sm border border-gray-200/20 dark:border-white/10 flex items-center justify-center shadow-2xl hover:scale-105 transition-all duration-300 group">
            <Image src={logo} alt="eBextractor" width={100} height={100} />
          </div>

          <div className="text-center space-y-1">
            <span className="text-sm font-semibold tracking-wider text-gray-700 dark:text-white/80">
              eBextractor
            </span>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Please wait while we prepare everything
            </div>
          </div>
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1)_0%,transparent_50%)] pointer-events-none"></div>
      </div>
    </>
  );
};

const page = () => {
  const router = useRouter();
  
  // Extract the full callback_url by splitting the URL
  const getFullCallbackUrl = () => {
    if (typeof window === 'undefined') return '/';
    
    const urlParts = window.location.href.split('callback_url=');
    if (urlParts.length > 1) {
      return decodeURIComponent(urlParts[1]);
    }
    return '/';
  };
  
  const cb = getFullCallbackUrl();
  
  const checkAuth = async () => {
    const re = await requests.get<AuthUserMeResponse>(api_paths.get_user);
    const data = re.requestsData?.user?.id;
    const response = usidStorageLocalStorage.upsert("usid", data);
    if (data) {
      usidStorageLocalStorage.upsert("status", "logged-in");
    } else {
      usidStorageLocalStorage.upsert("status", "logged-out");
    }
    router.replace(cb);
  };
  
  useEffect(() => {
    checkAuth();
  }, []);

  // return <Loading />;
  return notFound();
};

export default page;