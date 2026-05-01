import { cookies } from "next/headers";
import MainLayout from "../layout/MainLayout";
import LoginForm from "../components/login/LoginForm";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const error = cookieStore.get("captcha-error")?.value || "";
  const returningUser = cookieStore.get("returningUser")?.value || "";
  const authError = cookieStore.get("auth-error")?.value || "";
  return (
    <div className="flex flex-col min-h-screen">
      <MainLayout>
        <div className="p-5 flex items-center justify-center flex-grow bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl w-full max-w-lg">
            <h1 className="text-3xl font-extrabold text-center mb-4 text-gray-900 dark:text-gray-100">
              {returningUser === "true" ? "Welcome Back!" : "Welcome!"}
            </h1>
            <h2 className="text-center text-gray-600 dark:text-gray-300 mb-8 text-sm">
              Sign in to your account
            </h2>

            {/* Display error message if exists */}
            {authError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {authError}
              </div>
            )}
            <LoginForm />
     

            {/* <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                  Sign up
                </a>
              </p>
            </div> */}

          </div>
        </div>
      </MainLayout>
    </div>
  );
}