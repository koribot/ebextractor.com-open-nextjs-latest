"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  getCookie,
  getCookies,
  setCookie,
  deleteCookie,
  hasCookie,
  useGetCookies,
  useSetCookie,
  useHasCookie,
  useDeleteCookie,
  useGetCookie,
} from 'cookies-next/client';

const ToggleTheme = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const cookies = getCookies();
  useEffect(() => {
    if (cookies?.theme === undefined) {
      setCookie("theme", theme, {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-2 rounded-lg text-gray-500 dark:text-gray-400">
        <div className="w-5 h-5 rounded-full relative overflow-hidden dark:before:bg-gradient-to-r dark:before:from-gray-700 dark:before:via-gray-600 dark:before:to-gray-700 before:bg-gradient-to-r before:from-gray-200 before:via-gray-100 before:to-gray-200 before:absolute before:inset-0 before:animate-shimmer before:bg-[length:200%_100%]" />
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setTheme(theme === "dark" ? "light" : "dark");
        setCookie("theme", theme === "dark" ? "light" : "dark", {
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
        });
      }}
      className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
      aria-label="Toggle dark mode"
    >
      {theme === "light" ? (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
};

export default ToggleTheme;
