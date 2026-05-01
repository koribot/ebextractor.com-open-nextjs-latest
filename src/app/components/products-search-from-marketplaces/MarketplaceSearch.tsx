"use client";

import { useSearchStore } from "@/app/store/marketplace-search/store";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { decodeURIToText } from "@/app/utils/decodeURIToText";
import { useRouter } from "next/navigation";
import AffliateDisclosure from "../affilate-disclosure/AffliateDisclosure";
import AmazonResultCard from "./AmazonResultCard";
import EbayResultCard from "./EbayResultCard";
import { SearchInput } from "./SearchInput";
import { useEbayFilterStore } from "@/app/store/ebay-search-filter/store";
import ResultsCard from "./ResultsCard";
import { WHAT_AMAZON_API_WE_ARE_USING } from "@/app/contants/amazon-api-we-are-using";
import AliExpressResultCard from "./AliexpressResultCard";
import {
  ALIEXPRESS_SITE_OPTIONS,
  AMAZON_SITE_OPTIONS,
  EBAY_SITE_OPTIONS,
} from "@/app/contants/site-dropdowns";
import { addRecentSearchesToIndexedDb } from "@/app/utils/recent-searches-utils/recent-searches-utils";
import RecentSearches from "../recent-searches/RecentSearches";
import kunsul from "kunsul";

export default function MarketplaceSearch() {
  const {
    searchTerm,
    searchUrlParam,
    ebayResults,
    aliexpressResults,
    amazonResults,
    amazonResults2,
    totalNumberOfItemsForthatSearchKeyword,
    mkState,
    isEbayLoading,
    isAmazonLoading,
    isEbayLoadingMore,
    isAmazonLoadingMore,
    isAliExpressLoading,
    isAliExpressLoadingMore,
    isAliExpressHasNextPage,
    isAmazonHasNextPage,
    isEbayResHasNextPage,
    defaultEbaySite,
    defaultAliexpressSite,
    defaultAmazonSite,
    activeTabOnDisplay,
    paapiStatus,
    setSearchTerm,
    setSearchUrlParam,
    setDefaultEbaySite,
    setDefaultAmazonSite,
    setDefaultAliexpressSite,
    handleSearch,
    handleEbayLoadMore,
    handleAmazonLoadMore,
    handleAliexpressLoadMore,
    saveToLocalStorage,
    initializeFromLocalStorage,
    setEbayResults,
    setAmazonResults,
    setAmazonResults2,
    setActiveTabOnDisplay,
    cancelOngoingRequests,
    setIsAmazonLoading,
    setIsEbayLoading,
    setIsAliexpressLoading
  } = useSearchStore();
  const {
    selectedCondition,
    selectedSellers,
    selectedDiscounts,
    priceMin,
    priceMax,
  } = useEbayFilterStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const params = new URLSearchParams(searchParams.toString());
  const concatenatedFilterParams = `&condition=${selectedCondition}&sellers=${selectedSellers.join(
    ",",
  )}&discounts=${selectedDiscounts.join(
    ",",
  )}&priceMin=${priceMin}&priceMax=${priceMax}`;

  const _handlesearch = ({
    mode,
    additionalParams,
  }: {
    mode: "all" | "ebay" | "amazon" | "aliexpress";
    additionalParams?: string;
  }) => {
    handleSearch(mode, additionalParams);
  };
  useEffect(() => {
    if (searchParams.size <= 0) {
      setIsAliexpressLoading(false);
      setIsAmazonLoading(false);
      setIsEbayLoading(false);
    }
    const refetchParam = searchParams.get("rld") || null;
    if (searchTerm && refetchParam !== "true") {
      params.set("q", searchTerm);
      params.set("site", defaultEbaySite);
      params.set("siteamz", defaultAmazonSite);
      selectedCondition && params.set("condition", selectedCondition);
      selectedSellers.length > 0 &&
        params.set("sellers", selectedSellers.join(","));
      selectedDiscounts.length > 0 &&
        params.set("discounts", selectedDiscounts.join(","));
      priceMin > 0 && params.set("priceMin", priceMin.toString());
      priceMax > 0 && params.set("priceMax", priceMax.toString());
      router.replace(`?${params.toString()}`, { scroll: false });
    }
    const query = searchParams.get("q") || searchTerm;
    const site = searchParams.get("site") || defaultEbaySite;
    const amzSite = searchParams.get("siteamz") || defaultAmazonSite;
    const aliexpressSite = searchParams.get("siteali") || defaultAliexpressSite;
    const isEbayEnabled = searchParams.get("ebay-enabled");
    const isAliEnabled = searchParams.get("ali-enabled");
    const isAmzEnabled = searchParams.get("amz-enabled");
    if (isEbayEnabled === "true") {
      saveToLocalStorage("ebay", true, site);
    } else if (refetchParam === "true" && !isEbayEnabled) {
      saveToLocalStorage("ebay", false, site);
    }
    if (isAliEnabled === "true") {
      saveToLocalStorage("aliexpress", true, aliexpressSite);
    } else if (refetchParam === "true" && !isAliEnabled) {
      saveToLocalStorage("aliexpress", false, aliexpressSite);
    }
    if (isAmzEnabled === "true") {
      saveToLocalStorage("amazon", true, amzSite);
    } else if (refetchParam === "true" && !isAmzEnabled) {
      saveToLocalStorage("amazon", false, amzSite);
    }

    const decodedQuery = decodeURIToText(query);
    setSearchTerm(decodedQuery);
    setSearchUrlParam(decodedQuery);
    setDefaultEbaySite(site);
    setDefaultAliexpressSite(aliexpressSite);
    setDefaultAmazonSite(amzSite);
    initializeFromLocalStorage();
    if (
      refetchParam === "true" ||
      (ebayResults?.length === 0 && mkState.ebay.checked) ||
      (amazonResults?.length === 0 && mkState.amazon.checked)
    ) {
      query !== "" &&
        _handlesearch({
          mode: "all",
          additionalParams: concatenatedFilterParams,
        });
      return;
    }
    const currentAmazonResultMarketplaceFromStore =
      amazonResults?.SearchURL &&
      amazonResults.SearchURL.split("https://www.")[1].split("/s?k=")[0];
    if (
      ebayResults?.length > 0 &&
      ebayResults[0].listingMarketplaceId !== site
    ) {
      _handlesearch({
        mode: "all",
        additionalParams: concatenatedFilterParams,
      });
      return;
    }
    if (currentAmazonResultMarketplaceFromStore !== amzSite) {
      _handlesearch({
        mode: "amazon",
        additionalParams: concatenatedFilterParams,
      });
      return;
    }

    if (
      decodedQuery &&
      ebayResults?.length === 0 &&
      amazonResults?.length === 0
    ) {
      _handlesearch({
        mode: activeTabOnDisplay,
        additionalParams: concatenatedFilterParams,
      });
    }
  }, []);

  useEffect(() => {
    const activeTabOnDisplayFromSearchParams =
      (searchParams.get("current-tab") as "ebay" | "amazon" | "aliexpress") ||
      activeTabOnDisplay;
    if (
      activeTabOnDisplayFromSearchParams === "aliexpress" &&
      mkState.aliexpress.checked
    ) {
      setActiveTabOnDisplay(activeTabOnDisplayFromSearchParams);
    }
    if (
      activeTabOnDisplayFromSearchParams === "amazon" &&
      mkState.amazon.checked
    ) {
      setActiveTabOnDisplay(activeTabOnDisplayFromSearchParams);
    }
    if (activeTabOnDisplayFromSearchParams === "ebay" && mkState.ebay.checked) {
      setActiveTabOnDisplay(activeTabOnDisplayFromSearchParams);
    }
  }, []);

  const search = (e?: React.FormEvent) => {
    if (e) {
      const searchInput = (e.target as HTMLFormElement).elements.namedItem(
        "searchInput",
      ) as HTMLInputElement;
      setSearchTerm(searchInput.value);
      params.set("q", searchInput.value);
      params.set("site", defaultEbaySite);
      params.set("siteamz", defaultAmazonSite);
      // params.set("rld", "true");
      params.set("current-tab", activeTabOnDisplay);
      router.push(`/search?${params.toString()}`, { scroll: false });
    }
    _handlesearch({ mode: "all", additionalParams: concatenatedFilterParams });
  };

  const handleTabChange = (tab: "ebay" | "amazon" | "aliexpress") => {
    // Prevent navigation if marketplace is not checked
    if (!mkState[tab]?.checked) return;

    setActiveTabOnDisplay(tab);
    if (searchTerm) {
      if (tab === "ebay") {
        params.set("current-tab", "ebay");
        router.replace(`?${params.toString()}`, { scroll: false });
        ebayResults?.length === 0 &&
          (!isAmazonLoading || !isEbayLoading || !isAliExpressLoading) &&
          _handlesearch({ mode: "all" });
      } else if (tab === "amazon") {
        params.set("current-tab", "amazon");
        router.replace(`?${params.toString()}`, { scroll: false });
        amazonResults?.length === 0 &&
          (!isAmazonLoading || !isEbayLoading || !isAliExpressLoading) &&
          amazonResults2?.length === 0 &&
          _handlesearch({ mode: "amazon" });
      } else if (tab === "aliexpress") {
        params.set("current-tab", "aliexpress");
        router.replace(`?${params.toString()}`, { scroll: false });
        aliexpressResults?.length === 0 &&
          (!isAmazonLoading || !isEbayLoading || !isAliExpressLoading) &&
          _handlesearch({
            mode: "aliexpress",
            additionalParams: concatenatedFilterParams,
          });
      }
    }
  };

  const handleEbaySiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSite = e.target.value;
    params.set("site", newSite);
    // params.set("siteamz", defaultAmazonSite);
    // params.set("siteali", defaultAliexpressSite);
    router.replace(`?${params.toString()}`, { scroll: false });
    setDefaultEbaySite(newSite);
    saveToLocalStorage("ebay", true, newSite);
    if (searchTerm) {
      _handlesearch({
        mode: "ebay",
        additionalParams: concatenatedFilterParams,
      });
    }
  };

  const handleAmazonSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSite = e.target.value;
    // params.set("site", defaultEbaySite);
    params.set("siteamz", newSite);
    // params.set("siteali", defaultAliexpressSite);
    router.replace(`?${params.toString()}`, { scroll: false });
    setDefaultAmazonSite(newSite);
    saveToLocalStorage("amazon", true, newSite);
    if (searchTerm) {
      _handlesearch({
        mode: "amazon",
        additionalParams: concatenatedFilterParams,
      });
    }
  };

  const handleAliExpressSiteChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newSite = e.target.value;
    // params.set("site", defaultEbaySite);
    // params.set("siteamz", defaultAmazonSite);
    params.set("siteali", newSite);
    router.replace(`?${params.toString()}`, { scroll: false });
    setDefaultAliexpressSite(newSite);
    saveToLocalStorage("aliexpress", true, newSite);
    if (searchTerm) {
      _handlesearch({
        mode: "aliexpress",
        additionalParams: concatenatedFilterParams,
      });
    }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-light-dark">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-center flex-col">
          <SearchInput
            initialSearchTerm={searchTerm}
            defaultEbaySite={defaultEbaySite}
            defaultAmazonSite={defaultAmazonSite}
            onSearch={search}
            setSearchTerm={setSearchTerm}
          />
          <div className="flex w-full">
            <RecentSearches />
          </div>

          <div className="flex items-center w-full">
            <nav
              className="flex overflow-x-auto small-scrollbar gap-2 mt-4"
              id="marketplace-selection-nav"
            >
              <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm dark:bg-light-dark dark:border dark:border-gray-700">
                <input
                  type="checkbox"
                  id="ebay"
                  name="ebay"
                  checked={mkState?.ebay?.checked}
                  onChange={() => {
                    const newChecked = !mkState?.ebay?.checked;
                    params.set("ebay-enabled", newChecked.toString());
                    router.push(`?${params.toString()}`, { scroll: false });
                    saveToLocalStorage(
                      "ebay",
                      newChecked,
                      mkState?.ebay?.defaultVal,
                    );
                    if (newChecked) {
                      setActiveTabOnDisplay("ebay");
                      params.set("current-tab", "ebay");
                      router.push(`?${params.toString()}`, { scroll: false });
                      setEbayResults([]);
                      if (searchTerm)
                        _handlesearch({
                          mode: "ebay",
                          additionalParams: concatenatedFilterParams,
                        });
                    } else {
                      cancelOngoingRequests("ebay");
                      setEbayResults([]);
                      if (
                        activeTabOnDisplay === "ebay" &&
                        mkState.ebay.checked
                      ) {
                        setActiveTabOnDisplay("ebay");
                      }
                      if (mkState.amazon.checked) {
                        setActiveTabOnDisplay("amazon");
                        params.set("current-tab", "amazon");
                        router.push(`?${params.toString()}`, { scroll: false });
                        return;
                      }
                      if (mkState.aliexpress.checked) {
                        setActiveTabOnDisplay("aliexpress");
                        params.set("current-tab", "aliexpress");
                        router.push(`?${params.toString()}`, { scroll: false });
                        return;
                      }
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <select
                  onChange={handleEbaySiteChange}
                  value={defaultEbaySite}
                  disabled={!mkState?.ebay?.checked}
                  className={`bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-light ${
                    !mkState?.ebay?.checked
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {EBAY_SITE_OPTIONS.map((option) => (
                    <option
                      key={option.code}
                      className="dark:bg-light-dark"
                      value={option.code}
                    >
                      eBay {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm dark:bg-light-dark dark:border-gray-700 dark:border">
                <input
                  type="checkbox"
                  id="amazon"
                  name="amazon"
                  checked={mkState?.amazon?.checked}
                  onChange={() => {
                    const newChecked = !mkState?.amazon?.checked;
                    params.set("amz-enabled", newChecked.toString());
                    router.push(`?${params.toString()}`, { scroll: false });
                    saveToLocalStorage(
                      "amazon",
                      newChecked,
                      mkState?.amazon?.defaultVal,
                    );
                    if (newChecked) {
                      setActiveTabOnDisplay("amazon");
                      params.set("current-tab", "amazon");
                      router.push(`?${params.toString()}`, { scroll: false });
                      setAmazonResults([]);
                      setAmazonResults2([]);
                      if (searchTerm)
                        _handlesearch({
                          mode: "amazon",
                          additionalParams: concatenatedFilterParams,
                        });
                    } else {
                      cancelOngoingRequests("amazon");
                      setAmazonResults([]);
                      setAmazonResults2([]);
                      if (
                        activeTabOnDisplay === "amazon" &&
                        mkState.amazon.checked
                      ) {
                        setActiveTabOnDisplay("ebay");
                      }
                      if (mkState.aliexpress.checked) {
                        setActiveTabOnDisplay("aliexpress");
                        params.set("current-tab", "aliexpress");
                        router.push(`?${params.toString()}`, { scroll: false });
                        return;
                      }
                      if (mkState.ebay.checked) {
                        setActiveTabOnDisplay("ebay");
                        params.set("current-tab", "ebay");
                        router.push(`?${params.toString()}`, { scroll: false });
                        return;
                      }
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <select
                  onChange={handleAmazonSiteChange}
                  value={defaultAmazonSite}
                  disabled={!mkState?.amazon?.checked}
                  className={`bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-light ${
                    !mkState?.amazon?.checked
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {AMAZON_SITE_OPTIONS.map((site) => (
                    <option
                      key={site.code}
                      className="dark:bg-light-dark"
                      value={site.code}
                    >
                      Amazon {site.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm dark:bg-light-dark dark:border-gray-700 dark:border">
                <input
                  type="checkbox"
                  id="aliexpress"
                  name="aliexpress"
                  checked={mkState?.aliexpress?.checked}
                  onChange={() => {
                    const newChecked = !mkState?.aliexpress?.checked;
                    params.set("ali-enabled", newChecked.toString());
                    router.push(`?${params.toString()}`, { scroll: false });
                    saveToLocalStorage(
                      "aliexpress",
                      newChecked,
                      mkState?.aliexpress?.defaultVal,
                    );
                    if (newChecked) {
                      setActiveTabOnDisplay("aliexpress");
                      params.set("current-tab", "aliexpress");
                      router.push(`?${params.toString()}`, { scroll: false });
                      if (searchTerm)
                        _handlesearch({
                          mode: "aliexpress",
                          additionalParams: concatenatedFilterParams,
                        });
                    } else {
                      cancelOngoingRequests("aliexpress");
                      if (
                        activeTabOnDisplay === "aliexpress" &&
                        mkState.aliexpress.checked
                      ) {
                        setActiveTabOnDisplay("aliexpress");
                      }
                      if (mkState.ebay.checked) {
                        setActiveTabOnDisplay("ebay");
                        params.set("current-tab", "ebay");
                        router.push(`?${params.toString()}`, { scroll: false });
                        return;
                      }
                      if (mkState.amazon.checked) {
                        setActiveTabOnDisplay("amazon");
                        params.set("current-tab", "amazon");
                        router.push(`?${params.toString()}`, { scroll: false });
                        return;
                      }
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <select
                  onChange={handleAliExpressSiteChange}
                  value={defaultAliexpressSite}
                  disabled={!mkState?.aliexpress?.checked}
                  className={`bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-light ${
                    !mkState?.aliexpress?.checked
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {ALIEXPRESS_SITE_OPTIONS.map((option) => (
                    <option
                      key={option.code}
                      className="dark:bg-light-dark"
                      value={option.code}
                    >
                      AliExpress - {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4">
        <AffliateDisclosure />

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 sticky top-[93px] z-[100] bg-gray-50 dark:bg-light-dark">
          <nav
            className="flex overflow-x-auto small-scrollbar md:flex space-x-8"
            aria-label="Marketplace Results"
          >
            <button
              onClick={() => handleTabChange("ebay")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                !mkState.ebay.checked
                  ? "opacity-40 cursor-not-allowed border-transparent text-gray-400 dark:text-gray-600"
                  : activeTabOnDisplay === "ebay"
                    ? "border-blue-500 text-blue-600 dark:text-light"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-blue-400"
              }`}
              disabled={!mkState.ebay.checked}
            >
              eBay
              {ebayResults?.length > 0 && (
                <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded-full text-xs dark:bg-gray-700">
                  {ebayResults?.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("amazon")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                !mkState.amazon.checked
                  ? "opacity-40 cursor-not-allowed border-transparent text-gray-400 dark:text-gray-600"
                  : activeTabOnDisplay === "amazon"
                    ? "border-blue-500 text-blue-600 dark:text-light"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-blue-400"
              }`}
              disabled={!mkState.amazon.checked}
            >
              Amazon
              {amazonResults?.Items?.length > 0 && (
                <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded-full text-xs dark:bg-gray-700">
                  {amazonResults?.Items?.length}
                </span>
              )}
              {amazonResults2?.length > 0 && (
                <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded-full text-xs dark:bg-gray-700">
                  {amazonResults2?.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("aliexpress")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                !mkState.aliexpress.checked
                  ? "opacity-40 cursor-not-allowed border-transparent text-gray-400 dark:text-gray-600"
                  : activeTabOnDisplay === "aliexpress"
                    ? "border-blue-500 text-blue-600 dark:text-light"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-blue-400"
              }`}
              disabled={!mkState.aliexpress.checked}
            >
              AliExpress
              {aliexpressResults?.length > 0 && (
                <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded-full text-xs dark:bg-gray-700">
                  {aliexpressResults?.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Results - Using hidden class instead of conditional rendering to prevent lag */}
        <div className="py-6 flex">
          <div
            className={
              activeTabOnDisplay === "ebay" && mkState.ebay.checked
                ? "block w-full"
                : "hidden"
            }
          >
            <EbayResultCard
              title="Ebay Results"
              totalNumberOfItemsForthatSearchKeyword={
                totalNumberOfItemsForthatSearchKeyword
              }
              isLoading={isEbayLoading}
              results={ebayResults}
              isLoadingMore={isEbayLoadingMore}
              hasNextPage={isEbayResHasNextPage}
              handleLoadMore={handleEbayLoadMore}
              defaultSite={defaultEbaySite}
              searchTerm={searchTerm}
              searchUrlParam={searchUrlParam}
              searchParams={searchParams}
            />
          </div>

          <div
            className={
              activeTabOnDisplay === "amazon" && mkState.amazon.checked
                ? "block w-full"
                : "hidden"
            }
          >
            {WHAT_AMAZON_API_WE_ARE_USING === "SCRAPE" ||
            paapiStatus === "NOT_WORKING" ? (
              <ResultsCard
                title="Amazon Results"
                isLoading={isAmazonLoading}
                results={amazonResults2}
                isLoadingMore={false}
                hasNextPage={false}
                handleLoadMore={() => {}}
                defaultSite={defaultAmazonSite}
                searchTerm={searchTerm}
                searchUrlParam={searchUrlParam}
                searchParams={searchParams}
              />
            ) : (
              <AmazonResultCard
                isLoadingMore={isAmazonLoadingMore}
                searchParams={searchParams}
                searchTerm={searchTerm}
                searchUrlParam={searchUrlParam}
                hasNextPage={isAmazonHasNextPage}
                handleLoadMore={handleAmazonLoadMore}
                isLoading={isAmazonLoading}
                defaultSite={defaultAmazonSite}
                products={amazonResults}
              />
            )}
          </div>

          <div
            className={
              activeTabOnDisplay === "aliexpress" && mkState.aliexpress.checked
                ? "block w-full"
                : "hidden"
            }
          >
            <AliExpressResultCard
              title="AliExpress Results"
              isLoading={isAliExpressLoading}
              results={aliexpressResults}
              isLoadingMore={isAliExpressLoadingMore}
              hasNextPage={isAliExpressHasNextPage}
              handleLoadMore={handleAliexpressLoadMore}
              defaultSite={defaultAliexpressSite}
              searchTerm={searchTerm}
              searchUrlParam={searchUrlParam}
              searchParams={searchParams}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useSearchStore } from "@/app/store/marketplace-search/store";
// import { useSearchParams } from "next/navigation";
// import { useEffect } from "react";
// import { decodeURIToText } from "@/app/utils/decodeURIToText";
// import { useRouter } from "next/navigation";
// import AffliateDisclosure from "../affilate-disclosure/AffliateDisclosure";
// import AmazonResultCard from "./AmazonResultCard";
// import EbayResultCard from "./EbayResultCard";
// import { SearchInput } from "./SearchInput";
// import { useEbayFilterStore } from "@/app/store/ebay-search-filter/store";
// import ResultsCard from "./ResultsCard";
// import { WHAT_AMAZON_API_WE_ARE_USING } from "@/app/contants/amazon-api-we-are-using";
// import AliExpressResultCard from "./AliexpressResultCard";

// export default function MarketplaceSearch() {
//   const {
//     searchTerm,
//     searchUrlParam,
//     ebayResults,
//     aliexpressResults,
//     amazonResults,
//     amazonResults2,
//     totalNumberOfItemsForthatSearchKeyword,
//     mkState,
//     isEbayLoading,
//     isAmazonLoading,
//     isEbayLoadingMore,
//     isAmazonLoadingMore,
//     isAliExpressLoading,
//     isAliExpressLoadingMore,
//     isAliExpressHasNextPage,
//     isAmazonHasNextPage,
//     isEbayResHasNextPage,
//     defaultEbaySite,
//     defaultAliexpressSite,
//     defaultAmazonSite,
//     activeTabOnDisplay,
//     paapiStatus,
//     ebayUnfilteredResults,
//     setSearchTerm,
//     setSearchUrlParam,
//     setDefaultEbaySite,
//     setDefaultAmazonSite,
//     setDefaultAliexpressSite,
//     handleSearch,
//     handleEbayLoadMore,
//     handleAmazonLoadMore,
//     handleAliexpressLoadMore,
//     saveToLocalStorage,
//     initializeFromLocalStorage,
//     setEbayResults,
//     setAmazonResults,
//     setActiveTabOnDisplay,
//     cancelOngoingRequests,
//   } = useSearchStore();
//   const {
//     selectedCondition,
//     selectedSellers,
//     selectedDiscounts,
//     priceMin,
//     priceMax,
//   } = useEbayFilterStore();
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const params = new URLSearchParams(searchParams.toString());
//   // this is for the analytics engine to pass on each search so we can track what filters are being used
//   const concatenatedFilterParams = `&condition=${selectedCondition}&sellers=${selectedSellers.join(
//     ",",
//   )}&discounts=${selectedDiscounts.join(
//     ",",
//   )}&priceMin=${priceMin}&priceMax=${priceMax}`;
//   useEffect(() => {
//     const refetchParam = searchParams.get("rld") || null;
//     if (searchTerm && refetchParam !== "true") {
//       params.set("q", searchTerm);
//       params.set("site", defaultEbaySite);
//       params.set("siteamz", defaultAmazonSite);
//       selectedCondition && params.set("condition", selectedCondition);
//       selectedSellers.length > 0 &&
//         params.set("sellers", selectedSellers.join(","));
//       selectedDiscounts.length > 0 &&
//         params.set("discounts", selectedDiscounts.join(","));
//       priceMin > 0 && params.set("priceMin", priceMin.toString());
//       priceMax > 0 && params.set("priceMax", priceMax.toString());
//       // router.push(
//       //   `/search?q=${searchTerm}&site=${defaultEbaySite}&siteamz=${defaultAmazonSite}`
//       // );
//       router.replace(`?${params.toString()}`, { scroll: false });
//     }
//     const query = searchParams.get("q") || searchTerm;
//     const site = searchParams.get("site") || defaultEbaySite;
//     const amzSite = searchParams.get("siteamz") || defaultAmazonSite;
//     const decodedQuery = decodeURIToText(query);
//     setSearchTerm(decodedQuery);
//     setSearchUrlParam(decodedQuery);
//     setDefaultEbaySite(site);
//     setDefaultAmazonSite(amzSite);
//     initializeFromLocalStorage();
//     if (
//       refetchParam === "true" ||
//       (ebayResults?.length === 0 && mkState.ebay.checked) ||
//       (amazonResults?.length === 0 && mkState.amazon.checked)
//     ) {
//       query !== "" && handleSearch("all", concatenatedFilterParams);
//       return;
//     }
//     const currentAmazonResultMarketplaceFromStore =
//       amazonResults?.SearchURL &&
//       amazonResults.SearchURL.split("https://www.")[1].split("/s?k=")[0];
//     if (
//       ebayResults?.length > 0 &&
//       ebayResults[0].listingMarketplaceId !== site
//     ) {
//       handleSearch("ebay", concatenatedFilterParams);
//       return;
//     }
//     if (currentAmazonResultMarketplaceFromStore !== amzSite) {
//       handleSearch("amazon", concatenatedFilterParams);
//       return;
//     }

//     if (
//       decodedQuery &&
//       ebayResults?.length === 0 &&
//       amazonResults?.length === 0
//     ) {
//       handleSearch(activeTabOnDisplay, concatenatedFilterParams);
//     }

//     // return () => {
//     //   setIsEbayLoading(false);
//     //   setIsAmazonLoading(false);
//     // };
//   }, []); // Only depend on searchParams

//   useEffect(() => {
//     const activeTabOnDisplayFromSearchParams =
//       (searchParams.get("current-tab") as "ebay" | "amazon" | "aliexpress") ||
//       activeTabOnDisplay;
//     setActiveTabOnDisplay(activeTabOnDisplayFromSearchParams);
//   }, []);

//   const search = (e?: React.FormEvent) => {
//     if (e) {
//       // e.preventDefault();
//       const searchInput = (e.target as HTMLFormElement).elements.namedItem(
//         "searchInput",
//       ) as HTMLInputElement;
//       setSearchTerm(searchInput.value);
//       params.set("q", searchInput.value);
//       params.set("site", defaultEbaySite);
//       params.set("siteamz", defaultAmazonSite);
//       params.set("rld", "true");
//       params.set("current-tab", activeTabOnDisplay);
//       router.push(`/search?${params.toString()}`, { scroll: false });

//       // router.push(
//       //   `/search?q=${encodeURIComponent(
//       //     searchInput.value
//       //   )}&site=${defaultEbaySite}&siteamz=${defaultAmazonSite}&rld=true`
//       // );
//     }
//     handleSearch("all", concatenatedFilterParams);
//   };

//   const handleTabChange = (tab: "ebay" | "amazon" | "aliexpress") => {
//     setActiveTabOnDisplay(tab);
//     if (searchTerm) {
//       if (tab === "ebay") {
//         params.set("current-tab", "ebay");
//         router.replace(`?${params.toString()}`, { scroll: false });
//         ebayResults?.length === 0 &&
//           (!isAmazonLoading || !isEbayLoading || !isAliExpressLoading) &&
//           handleSearch("ebay");
//       } else if (tab === "amazon") {
//         params.set("current-tab", "amazon");
//         router.replace(`?${params.toString()}`, { scroll: false });
//         amazonResults?.length === 0 &&
//           (!isAmazonLoading || !isEbayLoading || !isAliExpressLoading) &&
//           amazonResults2?.length === 0 &&
//           handleSearch("amazon", concatenatedFilterParams);
//       } else if (tab === "aliexpress") {
//         params.set("current-tab", "aliexpress");
//         router.replace(`?${params.toString()}`, { scroll: false });
//         aliexpressResults?.length === 0 &&
//           (!isAmazonLoading || !isEbayLoading || !isAliExpressLoading) &&
//           handleSearch("aliexpress", concatenatedFilterParams);
//       }
//     }
//   };

//   const handleEbaySiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newSite = e.target.value;
//     params.set("site", newSite);
//     params.set("siteamz", defaultAmazonSite);
//     // router.push(
//     //   `/search?q=${encodeURIComponent(
//     //     searchTerm
//     //   )}&site=${newSite}&siteamz=${defaultAmazonSite}`
//     // );
//     router.replace(`?${params.toString()}`, { scroll: false });
//     setDefaultEbaySite(newSite);
//     saveToLocalStorage("ebay", true, newSite);
//     if (searchTerm) {
//       handleSearch("ebay", concatenatedFilterParams);
//     }
//   };

//   const handleAmazonSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newSite = e.target.value;
//     params.set("site", defaultEbaySite);
//     params.set("siteamz", newSite);
//     // router.push(
//     //   `/search?q=${encodeURIComponent(
//     //     searchTerm
//     //   )}&site=${defaultEbaySite}&siteamz=${newSite}`
//     // );
//     router.replace(`?${params.toString()}`, { scroll: false });
//     setDefaultAmazonSite(newSite);
//     saveToLocalStorage("amazon", true, newSite);
//     if (searchTerm) {
//       handleSearch("amazon", concatenatedFilterParams);
//     }
//   };

//   const handleAliExpressSiteChange = (
//     e: React.ChangeEvent<HTMLSelectElement>,
//   ) => {
//     const newSite = e.target.value;
//     params.set("site", defaultEbaySite);
//     params.set("siteamz", defaultAmazonSite);
//     params.set("siteali", newSite);
//     // router.push(
//     //   `/search?q=${encodeURIComponent(
//     //     searchTerm
//     //   )}&site=${defaultEbaySite}&siteamz=${defaultAmazonSite}`
//     // );
//     router.replace(`?${params.toString()}`, { scroll: false });
//     setDefaultAliexpressSite(newSite);
//     saveToLocalStorage("aliexpress", true, newSite);
//     if (searchTerm) {
//       handleSearch("aliexpress", concatenatedFilterParams);
//     }
//   };

//   return (
//     <div className="h-full bg-gray-50 dark:bg-light-dark">
//       <div className="max-w-3xl mx-auto p-6">
//         <div className="flex items-center justify-center flex-col">
//           <SearchInput
//             initialSearchTerm={searchTerm}
//             defaultEbaySite={defaultEbaySite}
//             defaultAmazonSite={defaultAmazonSite}
//             onSearch={search}
//             setSearchTerm={setSearchTerm}
//           />

//           <div className="flex items-center w-full">
//             <nav
//               className="flex overflow-x-auto small-scrollbar gap-2 mt-4 "
//               id="marketplace-selection-nav"
//             >
//               <div className="flex items-center gap-2 bg-white rounded-lg p-2 dark:bg-light-dark dark:border dark:border-gray-700">
//                 <input
//                   type="checkbox"
//                   id="ebay"
//                   name="ebay"
//                   checked={mkState?.ebay?.checked}
//                   onChange={() => {
//                     const newChecked = !mkState?.ebay?.checked;
//                     saveToLocalStorage(
//                       "ebay",
//                       newChecked,
//                       mkState?.ebay?.defaultVal,
//                     );
//                     if (newChecked) {
//                       setEbayResults([]);
//                       if (searchTerm)
//                         handleSearch("ebay", concatenatedFilterParams);
//                     } else {
//                       cancelOngoingRequests("ebay");
//                       setEbayResults([]);
//                       if (
//                         activeTabOnDisplay === "ebay" &&
//                         mkState.amazon.checked
//                       ) {
//                         setActiveTabOnDisplay("amazon");
//                       }
//                     }
//                   }}
//                   className="h-4 w-4"
//                 />
//                 <select
//                   onChange={handleEbaySiteChange}
//                   value={defaultEbaySite}
//                   disabled={!mkState?.ebay?.checked}
//                   className={`bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-light ${
//                     !mkState?.ebay?.checked
//                       ? "opacity-50 cursor-not-allowed"
//                       : ""
//                   }`}
//                 >
//                   <option className="dark:bg-light-dark" value="EBAY_US">
//                     eBay United States
//                   </option>
//                   <option className="dark:bg-light-dark" value="EBAY_GB">
//                     eBay United Kingdom
//                   </option>
//                   <option className="dark:bg-light-dark" value="EBAY_DE">
//                     eBay Germany
//                   </option>
//                   <option className="dark:bg-light-dark" value="EBAY_AU">
//                     eBay Australia
//                   </option>
//                   <option className="dark:bg-light-dark" value="EBAY_IT">
//                     eBay Italy
//                   </option>
//                   <option className="dark:bg-light-dark" value="EBAY_CA">
//                     eBay Canada
//                   </option>
//                   <option className="dark:bg-light-dark" value="EBAY_ES">
//                     eBay Spain
//                   </option>
//                   <option className="dark:bg-light-dark" value="EBAY_FR">
//                     eBay France
//                   </option>
//                   <option className="dark:bg-light-dark" value="EBAY_HK">
//                     eBay Hong Kong
//                   </option>
//                   <option className="dark:bg-light-dark" value="EBAY_SG">
//                     eBay Singapore
//                   </option>
//                   <option className="dark:bg-light-dark" value="EBAY_IE">
//                     eBay Ireland
//                   </option>
//                   <option className="dark:bg-light-dark" value="EBAY_PL">
//                     eBay Poland
//                   </option>
//                   <option className="dark:bg-light-dark" value="EBAY_NL">
//                     eBay Netherlands
//                   </option>
//                   <option className="dark:bg-light-dark" value="EBAY_AT">
//                     eBay Austria
//                   </option>
//                   <option className="dark:bg-light-dark" value="EBAY_CH">
//                     eBay Switzerland
//                   </option>
//                   <option className="dark:bg-light-dark" value="EBAY_BE">
//                     eBay Belgium
//                   </option>
//                 </select>
//               </div>

//               <div className="flex items-center gap-2 bg-white rounded-lg p-2 dark:bg-light-dark dark:border-gray-700 dark:border">
//                 <input
//                   type="checkbox"
//                   id="amazon"
//                   name="amazon"
//                   checked={mkState?.amazon?.checked}
//                   onChange={() => {
//                     const newChecked = !mkState?.amazon?.checked;

//                     saveToLocalStorage(
//                       "amazon",
//                       newChecked,
//                       mkState?.amazon?.defaultVal,
//                     );
//                     if (newChecked) {
//                       setAmazonResults([]);
//                       if (searchTerm)
//                         handleSearch("amazon", concatenatedFilterParams);
//                     } else {
//                       cancelOngoingRequests("amazon");
//                       setAmazonResults([]);
//                       if (
//                         activeTabOnDisplay === "amazon" &&
//                         mkState.ebay.checked
//                       ) {
//                         setActiveTabOnDisplay("ebay");
//                       }
//                     }
//                   }}
//                   className="h-4 w-4"
//                 />
//                 <select
//                   onChange={handleAmazonSiteChange}
//                   value={defaultAmazonSite}
//                   disabled={!mkState?.amazon?.checked}
//                   className={`bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-light${
//                     !mkState?.amazon?.checked
//                       ? "opacity-50 cursor-not-allowed"
//                       : ""
//                   }`}
//                 >
//                   <option className="dark:bg-light-dark" value="amazon.com">
//                     Amazon US
//                   </option>
//                   <option className="dark:bg-light-dark" value="amazon.co.uk">
//                     Amazon UK
//                   </option>
//                 </select>
//               </div>

//               <div className="flex items-center gap-2 bg-white rounded-lg p-2 dark:bg-light-dark dark:border-gray-700 dark:border">
//                 <input
//                   type="checkbox"
//                   id="aliexpress"
//                   name="aliexpress"
//                   checked={mkState?.aliexpress?.checked}
//                   onChange={() => {
//                     const newChecked = !mkState?.aliexpress?.checked;

//                     saveToLocalStorage(
//                       "aliexpress",
//                       newChecked,
//                       mkState?.aliexpress?.defaultVal,
//                     );
//                     if (newChecked) {
//                       if (searchTerm)
//                         handleSearch("aliexpress", concatenatedFilterParams);
//                     } else {
//                       cancelOngoingRequests("aliexpress");
//                       if (
//                         activeTabOnDisplay === "aliexpress" &&
//                         mkState.aliexpress.checked
//                       ) {
//                         setActiveTabOnDisplay("aliexpress");
//                       }
//                     }
//                   }}
//                   className="h-4 w-4"
//                 />
//                 <select
//                   onChange={handleAliExpressSiteChange}
//                   value={defaultAliexpressSite}
//                   disabled={!mkState?.aliexpress?.checked}
//                   className={`bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-light ${
//                     !mkState?.aliexpress?.checked
//                       ? "opacity-50 cursor-not-allowed"
//                       : ""
//                   }`}
//                 >
//                   <option className="dark:bg-light-dark" value="USD">
//                     AliExpress - United States
//                   </option>
//                   <option className="dark:bg-light-dark" value="GBP">
//                     AliExpress - United Kingdom
//                   </option>
//                   <option className="dark:bg-light-dark" value="CAD">
//                     AliExpress - Canada
//                   </option>
//                   <option className="dark:bg-light-dark" value="EUR">
//                     AliExpress - European Union
//                   </option>
//                   <option className="dark:bg-light-dark" value="UAH">
//                     AliExpress - Ukraine
//                   </option>
//                   <option className="dark:bg-light-dark" value="MXN">
//                     AliExpress - Mexico
//                   </option>
//                   <option className="dark:bg-light-dark" value="TRY">
//                     AliExpress - Türkiye
//                   </option>
//                   <option className="dark:bg-light-dark" value="RUB">
//                     AliExpress - Russia
//                   </option>
//                   <option className="dark:bg-light-dark" value="BRL">
//                     AliExpress - Brazil
//                   </option>
//                   <option className="dark:bg-light-dark" value="AUD">
//                     AliExpress - Australia
//                   </option>
//                   <option className="dark:bg-light-dark" value="INR">
//                     AliExpress - India
//                   </option>
//                   <option className="dark:bg-light-dark" value="JPY">
//                     AliExpress - Japan
//                   </option>
//                   <option className="dark:bg-light-dark" value="IDR">
//                     AliExpress - Indonesia
//                   </option>
//                   <option className="dark:bg-light-dark" value="SEK">
//                     AliExpress - Sweden
//                   </option>
//                   <option className="dark:bg-light-dark" value="KRW">
//                     AliExpress - South Korea
//                   </option>
//                   <option className="dark:bg-light-dark" value="THB">
//                     AliExpress - Thailand
//                   </option>
//                   <option className="dark:bg-light-dark" value="CLP">
//                     AliExpress - Chile
//                   </option>
//                   <option className="dark:bg-light-dark" value="VND">
//                     AliExpress - Vietnam
//                   </option>
//                 </select>
//               </div>
//             </nav>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-full mx-auto px-4">
//         <AffliateDisclosure />

//         {/* Tab Navigation */}
//         <div className="border-b border-gray-200 dark:border-gray-700">
//           <nav
//             className="flex overflow-x-auto small-scrollbar md:flex space-x-8"
//             aria-label="Marketplace Results"
//           >
//             <button
//               onClick={() => handleTabChange("ebay")}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                 activeTabOnDisplay === "ebay"
//                   ? "border-blue-500 text-blue-600  dark:bg-light-dark dark:text-light"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-blue-400"
//               }`}
//               disabled={!mkState.ebay.checked}
//             >
//               eBay
//               {ebayResults?.length > 0 && (
//                 <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded-full text-xs  dark:bg-light-dark">
//                   {ebayResults?.length}
//                 </span>
//               )}
//             </button>
//             <button
//               onClick={() => handleTabChange("amazon")}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                 activeTabOnDisplay === "amazon"
//                   ? "border-blue-500 text-blue-600 dark:text-light dark:bg-light-dark"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-blue-400"
//               }`}
//               disabled={!mkState.amazon.checked}
//             >
//               Amazon
//               {amazonResults?.Items?.length > 0 && (
//                 <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded-full text-xs dark:bg-light-dark ">
//                   {amazonResults?.Items?.length}
//                 </span>
//               )}
//               {amazonResults2?.length > 0 && (
//                 <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded-full text-xs dark:bg-light-dark ">
//                   {amazonResults2?.length}
//                 </span>
//               )}
//             </button>
//             <button
//               onClick={() => handleTabChange("aliexpress")}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                 activeTabOnDisplay === "aliexpress"
//                   ? "border-blue-500 text-blue-600 dark:text-light dark:bg-light-dark"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-blue-400"
//               }`}
//               disabled={!mkState.aliexpress.checked}
//             >
//               AliExpress
//               {aliexpressResults?.length > 0 && (
//                 <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded-full text-xs dark:bg-light-dark ">
//                   {aliexpressResults?.length}
//                 </span>
//               )}
//             </button>
//           </nav>
//         </div>

//         <div className="py-6 flex">
//           {activeTabOnDisplay === "ebay" && mkState.ebay.checked && (
//             <EbayResultCard
//               title="Ebay Results"
//               totalNumberOfItemsForthatSearchKeyword={
//                 totalNumberOfItemsForthatSearchKeyword
//               }
//               isLoading={isEbayLoading}
//               results={ebayResults}
//               isLoadingMore={isEbayLoadingMore}
//               hasNextPage={isEbayResHasNextPage}
//               handleLoadMore={handleEbayLoadMore}
//               defaultSite={defaultEbaySite}
//               searchTerm={searchTerm}
//               searchUrlParam={searchUrlParam}
//               searchParams={searchParams}
//             />
//           )}
//           {activeTabOnDisplay === "amazon" &&
//             mkState.amazon.checked &&
//             (WHAT_AMAZON_API_WE_ARE_USING === "SCRAPE" ||
//             paapiStatus === "NOT_WORKING" ? (
//               <ResultsCard
//                 title="Amazon Results"
//                 isLoading={isAmazonLoading}
//                 results={amazonResults2}
//                 isLoadingMore={false}
//                 hasNextPage={false}
//                 handleLoadMore={() => {}}
//                 defaultSite={defaultAmazonSite}
//                 searchTerm={searchTerm}
//                 searchUrlParam={searchUrlParam}
//                 searchParams={searchParams}
//               />
//             ) : (
//               <AmazonResultCard
//                 isLoadingMore={isAmazonLoadingMore}
//                 searchParams={searchParams}
//                 searchTerm={searchTerm}
//                 searchUrlParam={searchUrlParam}
//                 hasNextPage={isAmazonHasNextPage}
//                 handleLoadMore={handleAmazonLoadMore}
//                 isLoading={isAmazonLoading}
//                 defaultSite={defaultAmazonSite}
//                 products={amazonResults}
//               />
//             ))}
//           {activeTabOnDisplay === "aliexpress" &&
//             mkState.aliexpress.checked && (
//               <AliExpressResultCard
//                 title="AliExpress Results"
//                 isLoading={isAliExpressLoading}
//                 results={aliexpressResults}
//                 isLoadingMore={isAliExpressLoadingMore}
//                 hasNextPage={isAliExpressHasNextPage}
//                 handleLoadMore={handleAliexpressLoadMore}
//                 defaultSite={defaultAliexpressSite}
//                 searchTerm={searchTerm}
//                 searchUrlParam={searchUrlParam}
//                 searchParams={searchParams}
//               />
//             )}
//         </div>
//       </div>
//     </div>
//   );
// }
