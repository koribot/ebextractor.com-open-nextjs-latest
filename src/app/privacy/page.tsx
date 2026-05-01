"use client";
import React from "react";
import SpinnerFallback from "../components/common/ui/fallbacks/SpinnerFallback";
import ShowSpinnerFallBackWhenComponentNotMounted from "../components/common/ui/fallbacks/ShowSpinnerFallBackWhenComponentNotMounted";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-6 bg-gray-50 dark:bg-light-dark">
      <ShowSpinnerFallBackWhenComponentNotMounted />
      <div className="max-w-3xl mx-auto p-5 bg-gray-50 dark:bg-gray-800">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8 dark:text-light">
          Privacy Policy
        </h1>
        <div className="shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-light">
              Information Collection
            </h2>
            <p className="text-gray-600 mb-4 dark:text-light">
              At Ebextractor, the types of personal information we collect are
              as follows:
            </p>
            <ul className="list-disc list-inside mb-4 text-gray-600 dark:text-light">
              <li>
                Email address -{" "}
                <strong>
                  This will only be stored if you create an account
                </strong>
              </li>
              <li>
                Username -{" "}
                <strong>
                  This will only be stored if you create an account
                </strong>
              </li>
              <li>
                Password {`(encrypted)`} -{" "}
                <strong>
                  This will only be stored if you create an account
                </strong>
              </li>
              <li>
                Search Query -{" "}
                <strong>
                  To understand what keywords and categories are most popular
                  and relevant to improve the search experience
                </strong>
              </li>
              <li>
                Requesting IP Address -{" "}
                <strong>
                  To help determine what devices and locations are accessing our
                  services for usage analytics
                </strong>
              </li>
            </ul>
            <p className="text-gray-600 mb-6 dark:text-light">
              This information is securely stored in our database and is used
              solely for account management and analytics purposes.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-light">
              Data Security
            </h2>
            <p className="text-gray-600 mb-6 dark:text-light">
              We implement industry-standard security measures to protect your
              personal information from unauthorized access, alteration,
              disclosure, or destruction.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-light">
              Third-Party Services
            </h2>
            <p className="text-gray-600 mb-6 dark:text-light">
              We do not share your personal information with any third parties
              unless required by law. However, we use certain third-party
              services to improve your experience and maintain our platform:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-600 dark:text-light">
              <li>
                <strong>Google Analytics:</strong> Used to analyze website
                traffic and usage patterns to help us improve our services.
              </li>
              <li>
                <strong>Google AdSense:</strong> Displays relevant ads to help
                support the operation of our platform.
              </li>
              <li>
                <strong>Cloudflare Analytics:</strong> Helps us monitor site
                performance and security.
              </li>
            </ul>
            <p className="text-gray-600 mb-6 dark:text-light">
              These third-party providers may use cookies or similar tracking
              technologies. You can manage your preferences or opt-out by
              adjusting your browser settings or visiting Google and
              Cloudflare’s respective privacy policies. Or use ad-blocking tools
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-light">
              Changes to This Policy
            </h2>
            <p className="text-gray-600 mb-6 dark:text-light">
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page.
            </p>

            <p className="text-sm text-gray-500 mt-8 dark:text-light">
              Last updated: October 2, 2025
            </p>
          </div>
        </div>
        <div className="mt-8 text-center space-y-4 flex flex-col">
          <a
            href={`/affiliate-disclosure`}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-300 dark:text-light dark:underline"
          >
            View Affiliate Disclosure
          </a>
          <a
            href={`/terms-and-conditions`}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-300 dark:text-light dark:underline"
          >
            View Terms and Conditions
          </a>
        </div>
      </div>
    </div>
  );
}
