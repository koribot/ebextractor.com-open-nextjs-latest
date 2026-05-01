"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTokenConfirmation } from "@/app/store/tokenConfirmationStore";

interface TokenConfirmationFormProps {
  userId?: string | undefined;
  _token?: string | undefined;
}

export default function TokenConfirmationForm({
  userId,
  _token,
}: TokenConfirmationFormProps) {
  const router = useRouter();
  const {
    token,
    error,
    isVerifying,
    isResending,
    isVerified,
    setToken,
    setError,
    verifyToken,
    resendVerification,
  } = useTokenConfirmation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Please enter verification code");
      return;
    }
    await verifyToken(userId, token);
    if (error === "") {
      router.push("/login");
    }
  };

  useEffect(() => {
    if (_token) {
      setToken(_token);
    }
  }, [_token, setToken, error]);

  useEffect(() => {
    if (_token && userId) {
      verifyToken(userId, _token);
    }
  }, [_token, userId, verifyToken]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      useTokenConfirmation.getState().reset();
      setError("");
    };
  }, []);

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-light">
          Verify Your Account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="token"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-light"
              >
                Verification Code
              </label>
            </div>
            <div className="mt-2">
              <input
                id="token"
                name="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-offset-2 sm:text-sm sm:leading-6 dark:bg-light-dark dark:text-light"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={isVerifying || isResending}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline  focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {isVerifying ? "Verifying..." : "Verify Account"}
            </button>
          </div>
        </form>

        <div className="mt-4">
          <button
            onClick={() => resendVerification(userId)}
            disabled={isVerifying || isResending}
            className="flex w-full justify-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold leading-6 text-indigo-600 shadow-sm border border-indigo-600 hover:bg-indigo-50"
          >
            {isResending ? "Sending..." : "Send Verification Code"}
          </button>
        </div>
      </div>
    </div>
  );
}
