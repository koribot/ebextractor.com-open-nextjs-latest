import { Suspense } from "react";

const SearchFallback = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-center flex-col">
          <form className="flex w-full justify-center">
            <input
              name="searchInput"
              type="text"
              placeholder="Search..."
              className="bg-main-white px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-grow w-full"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Search
            </button>
          </form>

          <div className="flex items-center mt-4 gap-4">
            <div className="flex items-center gap-2 bg-white rounded-lg p-2">
              <input
                type="checkbox"
                id="ebay"
                name="ebay"
                defaultChecked
                className="h-4 w-4"
              />
              <select
                name="ebaySite"
                defaultValue="EBAY_US"
                className="bg-transparent border-none focus:ring-0 text-sm"
              >
                <option value="EBAY_US">eBay United States</option>
                <option value="EBAY_GB">eBay United Kingdom</option>
                <option value="EBAY_DE">eBay Germany</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg p-2">
              <input
                type="checkbox"
                id="amazon"
                name="amazon"
                defaultChecked
                className="h-4 w-4"
              />
              <select
                name="amazonSite"
                defaultValue="amazon.com"
                className="bg-transparent border-none focus:ring-0 text-sm"
              >
                <option value="amazon.com">Amazon US</option>
                <option value="amazon.co.uk">Amazon UK</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Marketplace Results">
            <button
              className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm"
              disabled
            >
              eBay Results
            </button>
            <button
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 font-medium text-sm"
              disabled
            >
              Amazon Results
            </button>
          </nav>
        </div>

        <div className="py-6">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFallback;