// NO ONE IS USING THIS DONT DELETE MIGHT BE VALUABLE IN FUTURE
export function EbayAndAmazonSearchStaticFallBack() {
  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-center flex-col">
          <form className="flex w-full justify-center">
            <input
              name="searchInput"
              type="text"
              placeholder="Search..."
              required
              className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-grow"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Search
            </button>
          </form>
          <div className="flex items-center mt-3 gap-5 flex-col md:flex-row lg:flex-row">
            <div className="flex items-center gap-1 justify-center bg-white py-1 px-2 rounded-full">
              <input
                type="checkbox"
                id="ebay"
                name="ebay"
                defaultChecked
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
              />
              <label htmlFor="ebay" className="ml-2 text-sm">
                Ebay
              </label>
              <select
                defaultValue="EBAY_US"
                className="ml-2 bg-transparent text-sm border-none focus:ring-0"
              >
                <option value="EBAY_US">United States</option>
                <option value="EBAY_GB">United Kingdom</option>
                <option value="EBAY_DE">Germany</option>
                <option value="EBAY_AU">Australia</option>
                <option value="EBAY_IT">Italy</option>
                <option value="EBAY_CA">Canada</option>
                <option value="EBAY_ES">Spain</option>
                <option value="EBAY_FR">France</option>
                <option value="EBAY_HK">Hong Kong</option>
                <option value="EBAY_SG">Singapore</option>
                <option value="EBAY_IE">Ireland</option>
                <option value="EBAY_PL">Poland</option>
                <option value="EBAY_NL">Netherlands</option>
                <option value="EBAY_AT">Austria</option>
                <option value="EBAY_CH">Switzerland</option>
                <option value="EBAY_BE">Belgium</option>
              </select>
            </div>
            <div className="flex items-center gap-1 justify-center bg-white py-1 px-2 rounded-full">
              <input
                type="checkbox"
                id="amazon"
                name="amazon"
                defaultChecked
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
              />
              <label htmlFor="amazon" className="ml-2 text-sm text-gray-600">
                Amazon
              </label>
              <select
                defaultValue="amazon.com"
                className="ml-2 bg-transparent text-sm border-none focus:ring-0"
              >
                <option value="amazon.com">United States</option>
                <option value="amazon.co.uk">United Kingdom</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-8 p-5 flex-col justify-center lg:flex-row md:flex-col">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Ebay Results
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <div className="px-4 py-5 sm:px-6">
              <p className="text-sm text-gray-500">
                Search for products to see results here.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full max-w-md bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Amazon Results
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <div className="px-4 py-5 sm:px-6">
              <p className="text-sm text-gray-500">
                Search for products to see results here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
