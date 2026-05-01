"use client";
import React from "react";
import SpinnerFallback from "../components/common/ui/fallbacks/SpinnerFallback";
import ShowSpinnerFallBackWhenComponentNotMounted from "../components/common/ui/fallbacks/ShowSpinnerFallBackWhenComponentNotMounted";
export default function TermsAndConditions() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-6 bg-gray-50 dark:bg-light-dark">
      <ShowSpinnerFallBackWhenComponentNotMounted />
      <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-gray-800 p-5 rounded-md">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8 dark:text-light">
          Terms and Conditions
        </h1>
        <div className="shadow overflow-hidden sm:rounded-lg ">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-light">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 mb-6 dark:text-light">
              By accessing and using Ebextractor and its services, you agree to
              be bound by these Terms and Conditions, our Privacy Policy, and
              any additional terms and conditions that may apply to specific
              sections of our website or to products and services available
              through our website or from Ebextractor.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-light">
              2. Description of Service
            </h2>
            <p className="text-gray-600 mb-6 dark:text-light">
              Ebextractor provides tools for product search and analysis on
              eBay, AliExpress and Amazon. We do not guarantee the accuracy,
              completeness, or timeliness of the information provided through
              our service.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-light">
              3. User Account
            </h2>
            <p className="text-gray-600 mb-6 dark:text-light">
              To use certain features of our service, you may be required to
              create an account. You are responsible for maintaining the
              confidentiality of your account information and for all activities
              that occur under your account.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-light">
              4. Intellectual Property
            </h2>
            <p className="text-gray-600 mb-6 dark:text-light">
              The content, organization, graphics, design, and other matters
              related to Ebextractor are protected under applicable copyrights
              and other proprietary laws. The copying, redistribution, use, or
              publication by you of any such content or any part of our service
              is prohibited.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-light">
              5. Limitation of Liability
            </h2>
            <p className="text-gray-600 mb-6 dark:text-light">
              Ebextractor shall not be liable for any direct, indirect,
              incidental, special, or consequential damages resulting from the
              use or inability to use our services or for the cost of
              procurement of substitute goods and services.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-light">
              6. Changes to Terms
            </h2>
            <p className="text-gray-600 mb-6 dark:text-light">
              We reserve the right to modify these Terms and Conditions at any
              time. We will notify users of any changes by posting the new Terms
              and Conditions on this page.
            </p>

            <p className="text-sm text-gray-500 mt-8 dark:text-light">
              Last updated: October 2, 2025
            </p>
          </div>
        </div>
        <div className="mt-8 text-center space-y-4 flex flex-col">
          <a
            // href={`${baseUrl}/privacy`}
            href={`/privacy`}
            className="block text-blue-600 hover:text-blue-800 transition-colors duration-300 dark:text-light dark:underline"
          >
            View Privacy Policy
          </a>
          <a
            // href={`${baseUrl}/affiliate-disclosure`}
            href={`/affiliate-disclosure`}
            className="block text-blue-600 hover:text-blue-800 transition-colors duration-300 dark:text-light dark:underline"
          >
            View Affiliate Disclosure
          </a>
        </div>
      </div>
    </div>
  );
}
