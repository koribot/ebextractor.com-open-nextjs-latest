"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSearchStore } from "@/app/store/marketplace-search/store";
import requests from "@/app/utils/http";
import { FaMagnifyingGlass } from "react-icons/fa6";
import ImagePreview from "../common/ui/ImagePreview";
import LoadingGrid from "../products-search-from-marketplaces/LoadingGrid";
import { DealItem, EbayDealsApiResponse } from "./types";
import { logger } from "@/app/utils/logger";
import { api_paths } from "@/app/contants/api-paths";
import {
  CANT_ACCESS_DEALS_EBAY_SITES,
  EBAY_SITE_OPTIONS,
} from "@/app/contants/site-dropdowns";

const PopularItemsv2 = ({ __site__ }: { __site__?: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ebayDeals, setEbayDeals] = useState<DealItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [hdes, setHdes] = useState<string>(__site__ || "EBAY_US");
  const params = new URLSearchParams(searchParams);
  const { setSearchTerm, initializeFromLocalStorage } = useSearchStore();
  const getDeals = useCallback(async (site?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const siteParam = site || "EBAY_US";
      const response = await requests.get<EbayDealsApiResponse>(
        `${api_paths.ebay_default_deals}?site=${siteParam}`,
      );
      setEbayDeals(response.requestsData?.dealItems || []);
      logger.debug.log("ebay-deals", response.requestsData);
    } catch (error) {
      logger.debug.error("Error fetching eBay deals:", error);
      setError("Failed to load deals. Please try again later.");
      setEbayDeals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSite = e.target.value;
    // setDefaultEbaySite(newSite);
    if (CANT_ACCESS_DEALS_EBAY_SITES.includes(newSite as any)) {
      return;
    }
    params.set("hdes", newSite);
    router.push(`?${params.toString()}`, { scroll: false });
    setHdes(newSite);
    getDeals(newSite);
  };

  useEffect(() => {
    initializeFromLocalStorage();
    const site = searchParams.get("hdes") || __site__ || "EBAY_US";
    if (ebayDeals.length === 0) {
      const siteToFetch = CANT_ACCESS_DEALS_EBAY_SITES.includes(site as any)
        ? "EBAY_US"
        : site;
      setHdes(siteToFetch !== "undefined" ? siteToFetch : "EBAY_US");
      getDeals(siteToFetch !== "undefined" ? siteToFetch : "EBAY_US");
    }
  }, [__site__]);

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, [ebayDeals]);

  const getShippingText = (item: DealItem) => {
    const shippingCost = item.shippingOptions?.[0]?.shippingCost;
    if (!shippingCost) return "N/A";
    return shippingCost.value === "0.00"
      ? "Free Shipping"
      : `${shippingCost.currency} ${shippingCost.value}`;
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Featured Deals Section */}
      <div className="rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        {!__site__ && (
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Featured Deals on eBay
            </h2>
            <div className="flex items-center gap-2">
              <label
                htmlFor="deals-site"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Region:
              </label>
              <select
                id="deals-site"
                onChange={handleSiteChange}
                value={hdes}
                className="px-3 py-1.5 bg-gray-50 dark:bg-light-dark border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none "
              >
                {EBAY_SITE_OPTIONS.map((opt) => {
                  return (
                    !CANT_ACCESS_DEALS_EBAY_SITES.includes(opt.code as any) && (
                      <option
                        key={opt.code}
                        value={opt.code}
                        className="bg-white dark:bg-light-dark"
                      >
                        {/*{CANT_ACCESS_DEALS_EBAY_SITES.includes(opt.code as any)
                        ? opt.label + " (no deals)"
                        : opt.label}*/}
                        {opt.label}
                      </option>
                    )
                  );
                })}
              </select>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <LoadingGrid length={5} />
        ) : ebayDeals.length > 0 ? (
          <div className="relative group">
            {/* Left Arrow */}
            {showLeftArrow && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-label="Scroll left"
              >
                <svg
                  className="w-6 h-6 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Right Arrow */}
            {showRightArrow && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-label="Scroll right"
              >
                <svg
                  className="w-6 h-6 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}

            <div
              ref={scrollContainerRef}
              className={`overflow-x-auto pb-4 -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent`}
            >
              <div className="flex gap-4 min-w-min">
                {ebayDeals.map((item, index) => (
                  <div
                    key={`${item.itemId}-${index}`}
                    className="relative flex-shrink-0 w-[280px]"
                  >
                    <Link
                      prefetch={false}
                      href={item.itemAffiliateWebUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <div className="rounded-lg p-4 transition-all duration-200 hover:bg-gray-50 h-full flex flex-col border border-gray-200 dark:border-gray-700 dark:hover:bg-gray-800">
                        <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                          {item.image?.imageUrl ? (
                            <Image
                              src={item.image.imageUrl}
                              alt={item.title}
                              className="object-cover w-full h-full duration-200"
                              width={200}
                              height={200}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>

                        <h3 className="text-gray-700 font-medium line-clamp-2 mb-3 flex-grow dark:text-gray-200">
                          {item.title}
                        </h3>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm lg:text-lg font-bold text-blue-600 dark:text-blue-400">
                              {item.price
                                ? item.price?.currency + " " + item.price?.value
                                : "Go to eBay to see the price"}
                            </span>
                            {item.marketingPrice?.discountPercentage && (
                              <span className="text-sm font-semibold bg-red-100 text-red-700 px-2 py-1 rounded whitespace-nowrap dark:bg-red-900 dark:text-red-200">
                                {item.marketingPrice.discountPercentage}% OFF
                              </span>
                            )}
                          </div>

                          {item.marketingPrice?.originalPrice?.value && (
                            <div className="text-sm text-gray-400 line-through dark:text-gray-500">
                              {item.marketingPrice.originalPrice.currency || ""}{" "}
                              {item.marketingPrice.originalPrice.value}
                            </div>
                          )}

                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {getShippingText(item)}
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="absolute bottom-[45%] w-fit right-10">
                      <ImagePreview
                        mode="icon-only"
                        src={item.image?.imageUrl || ""}
                        alt={item.title}
                        width={800}
                        height={800}
                        Icon={FaMagnifyingGlass}
                        itemTitle={item.title}
                        ebay_site={hdes}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No deals available for this marketplace at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularItemsv2;

// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import Image from "next/image";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { encodeTextToURI } from "@/app/utils/encodeTextToURI";
// import { useSearchStore } from "@/app/store/marketplace-search/store";
// import { ebaySiteCountryMapping } from "@/app/utils/ebaySiteMapping";
// import requests from "@/app/utils/http";
// import { FaMagnifyingGlass } from "react-icons/fa6";
// import ImagePreview from "../common/ui/ImagePreview";
// import LoadingGrid from "../products-search-from-marketplaces/LoadingGrid";
// import { DealItem, EbayDealsApiResponse } from "./types";
// import { logger } from "@/app/utils/logger";
// import { api_paths } from "@/app/contants/api-paths";

// const CANT_ACCESS_DEALS_EBAY_SITES = [
//   "EBAY_HK",
//   "EBAY_SG",
//   "EBAY_IE",
//   "EBAY_NL",
//   "EBAY_AT",
//   "EBAY_CH",
//   "EBAY_BE",
//   "EBAY_PL",
// ] as const;

// const EBAY_SITE_OPTIONS = [
//   { code: "EBAY_US", label: "United States" },
//   { code: "EBAY_GB", label: "United Kingdom" },
//   { code: "EBAY_DE", label: "Germany" },
//   { code: "EBAY_AU", label: "Australia" },
//   { code: "EBAY_IT", label: "Italy" },
//   { code: "EBAY_CA", label: "Canada" },
//   { code: "EBAY_ES", label: "Spain" },
//   { code: "EBAY_FR", label: "France" },
//   { code: "EBAY_PL", label: "Poland" },
//   { code: "EBAY_NL", label: "Netherlands" },
//   { code: "EBAY_AT", label: "Austria" },
//   { code: "EBAY_CH", label: "Switzerland" },
//   { code: "EBAY_BE", label: "Belgium" },
//   { code: "EBAY_HK", label: "Hong Kong" },
//   { code: "EBAY_SG", label: "Singapore" },
//   { code: "EBAY_IE", label: "Ireland" },
// ] as const;

// const AMAZON_SITE_OPTIONS = [
//   { code: "amazon.com", label: "United States" },
//   { code: "amazon.co.uk", label: "United Kingdom" },
// ] as const;

// const ALIEXPRESS_SITE_OPTIONS = [
//   { code: "USD", label: "United States" },
//   { code: "GBP", label: "United Kingdom" },
//   { code: "CAD", label: "Canada" },
//   { code: "EUR", label: "European Union" },
//   { code: "UAH", label: "Ukraine" },
//   { code: "MXN", label: "Mexico" },
//   { code: "TRY", label: "Türkiye" },
//   { code: "RUB", label: "Russia" },
//   { code: "BRL", label: "Brazil" },
//   { code: "AUD", label: "Australia" },
//   { code: "INR", label: "India" },
//   { code: "JPY", label: "Japan" },
//   { code: "IDR", label: "Indonesia" },
//   { code: "SEK", label: "Sweden" },
//   { code: "KRW", label: "South Korea" },
//   { code: "THB", label: "Thailand" },
//   { code: "CLP", label: "Chile" },
//   { code: "VND", label: "Vietnam" },
// ] as const;

// const PopularItemsv2 = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [ebayDeals, setEbayDeals] = useState<DealItem[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const {
//     mkState,
//     defaultAmazonSite,
//     defaultEbaySite,
//     setDefaultEbaySite,
//     setDefaultAmazonSite,
//     setDefaultAliexpressSite,
//     saveToLocalStorage,
//     setSearchTerm,
//     initializeFromLocalStorage,
//   } = useSearchStore();

//   const getDeals = useCallback(
//     async (site?: string) => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const siteParam = site || defaultEbaySite;
//         const response = await requests.get<EbayDealsApiResponse>(
//           `${api_paths.ebay_default_deals}?site=${siteParam}`,
//         );
//         setEbayDeals(response.requestsData?.dealItems || []);
//         logger.debug.log("ebay-deals", response.requestsData);
//       } catch (error) {
//         logger.debug.error("Error fetching eBay deals:", error);
//         setError("Failed to load deals. Please try again later.");
//         setEbayDeals([]);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [defaultEbaySite],
//   );

//   const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newSite = e.target.value;

//     setDefaultEbaySite(newSite);
//     if (CANT_ACCESS_DEALS_EBAY_SITES.includes(newSite as any)) {
//       return;
//     }
//     router.push(`?site=${newSite}`, { scroll: false });
//     getDeals(newSite);
//   };

//   const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     const input =
//       (
//         event.currentTarget.elements.namedItem(
//           "searchInput",
//         ) as HTMLInputElement
//       )?.value || "";
//     if (!input.trim()) return;

//     const encoded = encodeTextToURI(input);
//     router.push(
//       `/search?q=${encoded}&site=${defaultEbaySite}&siteamz=${defaultAmazonSite}`,
//     );
//     setSearchTerm(encoded);
//   };

//   useEffect(() => {
//     initializeFromLocalStorage();
//     const site = searchParams.get("site") || defaultEbaySite;
//     if (ebayDeals.length === 0) {
//       const siteToFetch = CANT_ACCESS_DEALS_EBAY_SITES.includes(site as any)
//         ? "EBAY_US"
//         : site;
//       getDeals(siteToFetch !== "undefined" ? siteToFetch : "EBAY_US");
//     }
//     return () => {
//       setEbayDeals([]);
//       setError(null);
//       setIsLoading(false);
//       setSearchTerm("");
//     };
//   }, []);

//   const getShippingText = (item: DealItem) => {
//     const shippingCost = item.shippingOptions?.[0]?.shippingCost;
//     if (!shippingCost) return "N/A";
//     return shippingCost.value === "0.00"
//       ? "Free Shipping"
//       : `${shippingCost.currency} ${shippingCost.value}`;
//   };

//   return (
//     <div className="flex flex-col space-y-6">
//       {/* Search Bar */}
//       <div className="rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
//         <form
//           onSubmit={handleSearch}
//           className="flex flex-col md:flex-row gap-4"
//         >
//           <input
//             name="searchInput"
//             type="text"
//             placeholder="Search for an item (e.g. iPhone, UPC, Model Number, MPN, etc)"
//             required
//             className="flex-grow px-4 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:bg-light-dark dark:border-gray-600 dark:focus:ring-0 dark:text-white"
//           />
//           <button
//             type="submit"
//             className="px-6 py-3 bg-blue-600 dark:bg-light-dark text-white hover:bg-blue-700 font-medium rounded-lg shadow-sm transition-colors  dark:hover:bg-gray-900 dark:border dark:border-main-white/20 whitespace-nowrap"
//           >
//             Search
//           </button>
//         </form>

//         {error && (
//           <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-200">
//             {error}
//           </div>
//         )}

//         {/* Marketplace Selection */}
//         <div className="flex flex-col md:flex-row items-center justify-center mt-6 gap-4 flex-wrap">
//           {/* eBay */}
//           <div className="flex items-center gap-3 bg-gray-50 py-2 px-4 rounded-full border border-gray-200 dark:bg-light-dark dark:border-gray-700">
//             <input
//               type="checkbox"
//               id="ebay"
//               checked={mkState?.ebay?.checked}
//               onChange={() =>
//                 saveToLocalStorage(
//                   "ebay",
//                   !mkState?.ebay?.checked,
//                   mkState?.ebay?.defaultVal,
//                 )
//               }
//               className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
//             />
//             <label
//               htmlFor="ebay"
//               className={`text-sm font-medium dark:text-white ${
//                 !mkState?.ebay?.checked ? "opacity-50" : "cursor-pointer"
//               }`}
//             >
//               eBay
//             </label>
//             <select
//               onChange={handleSiteChange}
// value={defaultEbaySite}
//               disabled={!mkState?.ebay?.checked}
//               className={`bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-white font-medium outline-none ${
//                 !mkState?.ebay?.checked ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//             >
//               {EBAY_SITE_OPTIONS.map((opt) => (
//                 <option
//                   key={opt.code}
//                   value={opt.code}
//                   className="dark:bg-light-dark dark:text-main-white"
//                 >
//                   {CANT_ACCESS_DEALS_EBAY_SITES.includes(opt.code as any)
//                     ? opt.label + " (no deals)"
//                     : opt.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Amazon */}
//           <div className="flex items-center gap-3 bg-gray-50 py-2 px-4 rounded-full border border-gray-200 dark:bg-light-dark dark:border-gray-700">
//             <input
//               type="checkbox"
//               id="amazon"
//               checked={mkState?.amazon?.checked}
//               onChange={() =>
//                 saveToLocalStorage(
//                   "amazon",
//                   !mkState?.amazon?.checked,
//                   mkState?.amazon?.defaultVal,
//                 )
//               }
//               className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
//             />
//             <label
//               htmlFor="amazon"
//               className={`text-sm font-medium dark:text-white ${
//                 !mkState?.amazon?.checked ? "opacity-50" : "cursor-pointer"
//               }`}
//             >
//               Amazon
//             </label>
//             <select
//               onChange={(e) => setDefaultAmazonSite(e.target.value)}
//               value={defaultAmazonSite}
//               disabled={!mkState?.amazon?.checked}
//               className={`bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-white font-medium outline-none ${
//                 !mkState?.amazon?.checked ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//             >
//               {AMAZON_SITE_OPTIONS.map((opt) => (
//                 <option
//                   key={opt.code}
//                   value={opt.code}
//                   className="dark:bg-light-dark dark:text-main-white"
//                 >
//                   {opt.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* AliExpress */}
//           <div className="flex items-center gap-3 bg-gray-50 py-2 px-4 rounded-full border border-gray-200 dark:bg-light-dark dark:border-gray-700">
//             <input
//               type="checkbox"
//               id="aliexpress"
//               checked={mkState?.aliexpress?.checked}
//               onChange={() =>
//                 saveToLocalStorage(
//                   "aliexpress",
//                   !mkState?.aliexpress?.checked,
//                   mkState?.aliexpress?.defaultVal,
//                 )
//               }
//               className="w-4 h-4 cursor-pointer"
//             />
//             <label
//               htmlFor="aliexpress"
//               className={`text-sm font-medium dark:text-white ${
//                 !mkState?.aliexpress?.checked ? "opacity-50" : "cursor-pointer"
//               }`}
//             >
//               AliExpress
//             </label>
//             <select
//               onChange={(e) => setDefaultAliexpressSite(e.target.value)}
//               value={mkState?.aliexpress?.defaultVal}
//               disabled={!mkState?.aliexpress?.checked}
//               className={`bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-white font-medium outline-none ${
//                 !mkState?.aliexpress?.checked
//                   ? "opacity-50 cursor-not-allowed"
//                   : ""
//               }`}
//             >
//               {ALIEXPRESS_SITE_OPTIONS.map((opt) => (
//                 <option
//                   key={opt.code}
//                   value={opt.code}
//                   className="dark:bg-light-dark dark:text-main-white"
//                 >
//                   {opt.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Featured Deals Section */}
//       <div className="rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
//         {defaultEbaySite && ebayDeals.length > 0 && !isLoading && (
//           <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white font-mono">
//             Featured Deals on eBay{" "}
//             {
//               ebaySiteCountryMapping[
//                 CANT_ACCESS_DEALS_EBAY_SITES.includes(defaultEbaySite as any)
//                   ? "EBAY_US"
//                   : defaultEbaySite
//               ]
//             }
//           </h2>
//         )}

//         {isLoading ? (
//           <LoadingGrid />
//         ) : ebayDeals.length > 0 ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
//             {ebayDeals.map((item, index) => (
//               <div key={`${item.itemId}-${index}`} className="relative">
//                 <Link
//                   href={item.itemAffiliateWebUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="group block"
//                 >
//                   <div className="rounded-lg p-4 transition-all duration-200 hover:bg-gray-50 h-full flex flex-col border border-gray-200 dark:border-gray-700 dark:hover:bg-gray-800">
//                     <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
//                       {item.image?.imageUrl ? (
//                         <Image
//                           src={item.image.imageUrl}
//                           alt={item.title}
//                           className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
//                           width={200}
//                           height={200}
//                           loading="lazy"
//                         />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center text-gray-400">
//                           No Image
//                         </div>
//                       )}
//                     </div>

//                     <h3 className="text-gray-700 font-medium line-clamp-2 mb-3 flex-grow dark:text-gray-200">
//                       {item.title}
//                     </h3>

//                     <div className="space-y-2">
//                       <div className="flex items-center justify-between gap-2">
//                         <span className="text-sm lg:text-lg font-bold text-blue-600 dark:text-blue-400">
//                           {item.price
//                             ? item.price?.currency + " " + item.price?.value
//                             : "Go to eBay to see the price"}
//                         </span>
//                         {item.marketingPrice?.discountPercentage && (
//                           <span className="text-sm font-semibold bg-red-100 text-red-700 px-2 py-1 rounded whitespace-nowrap dark:bg-red-900 dark:text-red-200">
//                             {item.marketingPrice.discountPercentage}% OFF
//                           </span>
//                         )}
//                       </div>

//                       {item.marketingPrice?.originalPrice?.value && (
//                         <div className="text-sm text-gray-400 line-through dark:text-gray-500">
//                           {item.marketingPrice.originalPrice.currency || ""}{" "}
//                           {item.marketingPrice.originalPrice.value}
//                         </div>
//                       )}

//                       <div className="text-sm text-gray-600 dark:text-gray-400">
//                         {getShippingText(item)}
//                       </div>
//                     </div>
//                   </div>
//                 </Link>

//                 <ImagePreview
//                   mode="icon-only"
//                   src={item.image?.imageUrl || ""}
//                   alt={item.title}
//                   width={800}
//                   height={800}
//                   Icon={FaMagnifyingGlass}
//                   itemTitle={item.title}
//                   ebay_site={defaultEbaySite}
//                 />
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-12">
//             <p className="text-gray-500 dark:text-gray-400">
//               No deals available for this marketplace at the moment.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PopularItemsv2;
