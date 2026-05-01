"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "@/app/utils/toast";
import Link from "next/link";

interface ForgotPasswordFormProps {
  error?: string;
}

export default function ForgotPasswordForm({ error }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(!!error);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data: any = await response.json();
      if (response.ok) {
        Toast().fire({
          icon: "success",
          title: data.message,
        });
        setShowError(false);
        router.replace("/forgot-password");
      } else {
        Toast().fire({
          icon: "error",
          title: data.message,
        });
      }
    } catch (error) {
      Toast().fire({
        icon: "error",
        title: "Failed to send reset link",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {showError && (
        <div className="mb-6 rounded-lg bg-gradient-to-r from-red-50 to-red-100 p-4 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {`Password reset link is ${error}. Please request a new one.`}
              </h3>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email address
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full rounded-lg pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600
                       text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                       bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500
                       focus:border-transparent transition-all duration-200 ease-in-out
                       disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending reset link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between space-x-4">
          <Link
            prefetch={false}
            href="/login"
            className={`text-sm text-blue-600 hover:text-blue-500 ${
              isLoading ? "pointer-events-none opacity-50" : ""
            }`}
            onClick={(e) => {
              if (isLoading) e.preventDefault();
            }}
          >
            Back to login
          </Link>
          <Link
            prefetch={false}
            href="/signup"
            className={`text-sm text-blue-600 hover:text-blue-500 ${
              isLoading ? "pointer-events-none opacity-50" : ""
            }`}
            onClick={(e) => {
              if (isLoading) e.preventDefault();
            }}
          >
            Create an account
          </Link>
        </div>
      </form>
    </div>
  );
}
