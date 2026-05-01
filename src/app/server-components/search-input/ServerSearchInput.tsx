import AffliateDisclosure from "@/app/components/affilate-disclosure/AffliateDisclosure";
import RecentSearches from "@/app/components/recent-searches/RecentSearches";
import {
  ALIEXPRESS_SITE_OPTIONS,
  AMAZON_SITE_OPTIONS,
  EBAY_SITE_OPTIONS,
} from "@/app/contants/site-dropdowns";
import React from "react";

const ServerSearchInput = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <form id="searchForm" action="/search" method="GET" className="space-y-3">
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex flex-col justify-center w-full gap-1">
            <input
              name="q"
              type="text"
              placeholder="Search for products..."
              required
              className="flex-1 px-4 py-2.5 text-base bg-white dark:bg-light-dark text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none "
            />
            <RecentSearches />
          </div>
          <button
            type="submit"
            className="h-fit px-8 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-light-dark dark:hover:bg-gray-900 border border-gray-300 dark:border-gray-700  text-white font-medium rounded-lg transition-colors"
          >
            Search
          </button>
        </div>

        <input type="hidden" name="rld" value="true" />

        <div className="flex flex-wrap items-center gap-4 text-sm justify-start">
          <span className="text-gray-600 dark:text-gray-400 font-medium">
            Search on:
          </span>

          {/* ebay */}
          <div className="flex items-center gap-2">
            <input
              defaultChecked
              type="checkbox"
              name="ebay-enabled"
              form="searchForm"
              value="true"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="ebay"
              className="font-medium text-gray-700 dark:text-gray-300"
            >
              eBay
            </label>
            <select
              name="site"
              id="ebay"
              form="searchForm"
              className="px-2 py-1 bg-gray-50 dark:bg-light-dark border border-gray-300 dark:border-gray-700 rounded text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {EBAY_SITE_OPTIONS.map((opt) => (
                <option
                  key={opt.code}
                  value={opt.code}
                  className="bg-white dark:bg-light-dark"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amazon */}
          <div className="flex items-center gap-2">
            <input
              defaultChecked
              type="checkbox"
              name="amz-enabled"
              form="searchForm"
              value="true"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />

            <label
              htmlFor="amazon"
              className="font-medium text-gray-700 dark:text-gray-300"
            >
              Amazon
            </label>
            <select
              name="siteamz"
              id="amazon"
              form="searchForm"
              className="px-2 py-1 bg-gray-50 dark:bg-light-dark border border-gray-300 dark:border-gray-700 rounded text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {AMAZON_SITE_OPTIONS.map((opt) => (
                <option
                  key={opt.code}
                  value={opt.code}
                  className="bg-white dark:bg-light-dark"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* AliExpress */}
          <div className="flex items-center gap-2">
            <input
              defaultChecked
              type="checkbox"
              name="ali-enabled"
              form="searchForm"
              value="true"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="aliexpress"
              className="font-medium text-gray-700 dark:text-gray-300"
            >
              AliExpress
            </label>
            <select
              name="siteali"
              id="aliexpress"
              form="searchForm"
              className="px-2 py-1 bg-gray-50 dark:bg-light-dark border border-gray-300 dark:border-gray-700 rounded text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ALIEXPRESS_SITE_OPTIONS.map((opt) => (
                <option
                  key={opt.code}
                  value={opt.code}
                  className="bg-white dark:bg-light-dark"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
      {/* Affiliate Disclosure */}
      <div className="mt-4">
        <AffliateDisclosure />
      </div>
    </div>
  );
};

export default ServerSearchInput;
