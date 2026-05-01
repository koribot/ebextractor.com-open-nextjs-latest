import React from "react";
import ShowSpinnerFallBackWhenComponentNotMounted from "../components/common/ui/fallbacks/ShowSpinnerFallBackWhenComponentNotMounted";

export default function AffiliateDisclosure() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-6 bg-gray-50 dark:bg-light-dark">
      <ShowSpinnerFallBackWhenComponentNotMounted />
      <div className="max-w-3xl mx-auto dark:bg-gray-800 p-5 bg-gray-50 rounded-md">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8 dark:text-light">
          Affiliate Disclosure
        </h1>
        <div className="shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-light">
              Affiliate Programs
            </h2>
            <p className="text-gray-600 mb-4 dark:text-light">
              Ebextractor participates in the following affiliate programs:
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-600 dark:text-light">
              <li>eBay Partner Network (EPN)</li>
              <li>Amazon Associates Program</li>
              <li>AliExpress Affiliate Program</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-light">
              How It Works
            </h2>
            <p className="text-gray-600 mb-6 dark:text-light">
              When you click on links to eBay or Amazon products on our website,
              you will be redirected to the respective platform. If you make a
              purchase, we may receive a small commission from the sale. This
              comes at no additional cost to you and helps us maintain and
              improve our services.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-light">
              Transparency
            </h2>
            <p className="text-gray-600 mb-6 dark:text-light">
              We are committed to transparency in our affiliate relationships.
              Our product recommendations are based on our genuine belief in
              their quality and value, regardless of any potential commission.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-light">
              Questions
            </h2>
            <p className="text-gray-600 mb-6 dark:text-light">
              If you have any questions about our affiliate relationships or how
              we use affiliate links, please do not hesitate to contact us at
              support@ebextractor.com.
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
            className="text-blue-600 hover:text-blue-800 transition-colors duration-300 dark:text-light dark:underline"
          >
            View Privacy Policy
          </a>
          <a
            // href={`${baseUrl}/terms-and-conditions`}
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
