import { cookies } from "next/headers";
import CapchaCloudflare from "../components/captcha-cloudflare/CloudflareCaptcha";
import MainLayout from "../layout/MainLayout";
import { FaGoogle, FaEnvelope, FaLock, FaRocket, FaUser } from "react-icons/fa";
import { signupWithEmailAndPassword, signupWithGoogle } from "./actions";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const cookieStore = await cookies();
  const error = cookieStore.get("captcha-error")?.value || "";
  const authError = cookieStore.get("auth-error")?.value || "";
  const authSuccess = cookieStore.get("auth-success")?.value || "";

  redirect("/") // we need to figure how to use email verification usign our own SMPT as supabase has rate limits
  return (
    <div className="flex flex-col min-h-screen">
      <MainLayout>
        <div className="p-5 flex items-center justify-center flex-grow bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          
          <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl w-full max-w-lg">
                        {/* Display success message if exists */}
            {authSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                {authSuccess}
              </div>
            )}
            <h1 className="text-3xl font-extrabold text-center mb-4 text-gray-900 dark:text-gray-100">
              Create Account
            </h1>
            <h2 className="text-center text-gray-600 dark:text-gray-300 mb-8 text-sm">
              Join us today and get started
            </h2>

            {/* Display error message if exists */}
            {authError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {authError}
              </div>
            )}

            {/* Single Form with both signup methods */}
            <form className="space-y-6">
              {/* Google Sign-up Section */}
              <div className="space-y-3">
                {/* Google Benefits Message */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <FaRocket
                      className="text-green-500 mt-0.5 flex-shrink-0"
                      size={14}
                    />
                    <div className="text-xs text-green-700 dark:text-green-300">
                      <strong>Instant Setup:</strong> Create your account in
                      seconds using Google. No forms to fill out, no email
                      verification needed.{" "}
                      <strong>Get started immediately!</strong>
                    </div>
                  </div>
                </div>

                {/* Google Sign-up Button */}
                <button
                  formAction={signupWithGoogle} // using the login actions basically the same
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-gray-800 border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:border-green-400 dark:hover:bg-gray-600 transition focus:outline-none focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900"
                >
                  <FaGoogle size={24} className="text-red-500" />
                  <span className="text-lg font-medium">
                    Sign up with Google
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or create account with email
                  </span>
                </div>
              </div>

              {/* Email/Password Fields */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="sr-only">
                    Full Name
                  </label>
                  <div className="relative">
                    <FaUser
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <div className="relative">
                    <FaEnvelope
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
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
                    <FaLock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Create a password"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="sr-only">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FaLock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>

                {/* Terms and Privacy Policy */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="terms"
                      className="text-gray-600 dark:text-gray-400"
                    >
                      I agree to the{" "}
                      <a
                        href="/terms"
                        className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                </div>

                <button
                  formAction={signupWithEmailAndPassword}
                  className="w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 transition"
                >
                  Create Account
                </button>
              </div>

              {/* Single Captcha for the entire form */}
              {/* <CapchaCloudflare captchaError={error} /> */}
            </form>

            {/* Sign in link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    </div>
  );
}
