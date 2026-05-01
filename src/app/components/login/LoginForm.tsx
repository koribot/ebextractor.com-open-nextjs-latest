"use client";
import React from "react";
import CapchaCloudflare from "../captcha-cloudflare/CloudflareCaptcha";
import { FaGoogle, FaRocket } from "react-icons/fa6";
import { loginOrSignupWithGoogle } from "@/app/login/actions";
import { CookieValueTypes, deleteCookie, getCookie } from "cookies-next/client";

const LoginForm = () => {
  const [isCaptchaSuccess, setIsCaptchaSuccess] = React.useState(false);
  const [captchaError, setCaptchaError] = React.useState("");
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isCaptchaSuccess) {
      setCaptchaError("Please verify that you are not a robot. By checking the box above");
    } else {
      deleteCookie("captcha-error", { path: "/login" });
      loginOrSignupWithGoogle(new FormData(e.currentTarget));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <FaRocket
              className="text-blue-500 mt-0.5 flex-shrink-0"
              size={14}
            />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Quick & Easy:</strong> No account? No problem! We will
              automatically create one for you using your Google. It's much
              faster than email signup.{" "}
              <strong>No more passwords to remember.</strong>
            </div>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-gray-800 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900">
          <FaGoogle size={24} className="text-red-500" />
          <span className="text-lg font-medium">Continue with Google</span>
        </button>
      </div>

      {/* <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or continue with email
                  </span>
                </div>
              </div> */}

      {/* <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <button
                  formAction={loginWithEmailAndPassword}
                  className="w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 transition"
                >
                  Sign in with Email
                </button>
              </div> */}
      <CapchaCloudflare
        captchaError={captchaError}
        setCapchaSuccess={setIsCaptchaSuccess}
      />
    </form>
  );
};

export default LoginForm;
