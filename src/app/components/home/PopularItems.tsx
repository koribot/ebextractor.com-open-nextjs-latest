"use client";

import React from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { EbayItemDealsDetails } from "./types";
import { parseEbayDeals } from "@/app/utils/parseEbayDeals";
import { encodeTextToURI } from "@/app/utils/encodeTextToURI";
import { useSearchStore } from "@/app/store/marketplace-search/store";
import { ebaySiteCountryMapping } from "@/app/utils/ebaySiteMapping";
import requests from "@/app/utils/http";
import { FaMagnifyingGlass } from "react-icons/fa6";
import ImagePreview from "../common/ui/ImagePreview";
import LoadingGrid from "../products-search-from-marketplaces/LoadingGrid";
import { api_paths } from "@/app/contants/api-paths";

const CantAccessDealsEbaySites = [
  "EBAY_HK",
  "EBAY_SG",
  "EBAY_IE",
  "EBAY_NL",
  "EBAY_AT",
  "EBAY_CH",
  "EBAY_BE",
];

const PopularItems = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ebayDeals, setEbayDeals] = useState<EbayItemDealsDetails[]>([]);
  const [amazonPopularItemsState, setAmazonPopularItemsState] = useState<any[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean | null>(null);
  const {
    mkState,
    defaultAmazonSite,
    defaultEbaySite,
    setDefaultEbaySite,
    setDefaultAmazonSite,
    setDefaultAliexpressSite,
    saveToLocalStorage,
    setSearchTerm,
    initializeFromLocalStorage,
  } = useSearchStore();

  const parseAmazonDeals = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const target = doc.querySelector(`div[data-id=discount-asin-grid]`);

    const script = target?.querySelector(
      `div[data-csa-c-slot-id="slot-14"] > script`,
    );
  };
  const handleSiteChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEbayDeals([]);
    setDefaultEbaySite(e.target.value);
    setIsLoading(true);
    router.push(`?site=${e.target.value}&rld=true`, { scroll: false });
    const ebayDealsPromise = await requests.get(
      `${api_paths.ebay_get_html_deals}?site=${e.target.value}`,
    );
    const eBayResult = parseEbayDeals(ebayDealsPromise.requestsData);
    setEbayDeals(eBayResult);
    setIsLoading(false);
  };

  const getDeals = async (site?: string) => {
    setIsLoading(true);
    const ebayDealsPromise = requests.get(
      `${api_paths.ebay_get_html_deals}?site=${site ? site : defaultEbaySite}`,
    );
    // const amazonDealsPromise = requests.get("/api/amazon-deals");

    const [ebayDealsRes] = await Promise.all([
      ebayDealsPromise,
      // amazonDealsPromise,
    ]);
    const eBayResult = parseEbayDeals(ebayDealsRes.requestsData);
    setEbayDeals(eBayResult);
    // const amzResult = parseAmazonDeals(amazonDealsRes.data);
    setIsLoading(false);
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = event.currentTarget.searchInput.value;
    const encoded = encodeTextToURI(input);
    router.push(
      `/search?q=${encoded}&site=${defaultEbaySite}&siteamz=${defaultAmazonSite}&rld=true`,
    );
    setSearchTerm(encoded);
  };
  useEffect(() => {
    const site = searchParams.get("site") || defaultEbaySite;
    initializeFromLocalStorage();
    // if(defaultEbaySite!==""){
    //   router.push(`?site=${defaultEbaySite}`)
    // }
    if (ebayDeals.length === 0) {
      if (CantAccessDealsEbaySites.includes(site)) {
        getDeals("EBAY_US");
      } else {
        // move this to zustand to save the latest ebayDeals
        getDeals(site);
      }
    }
  }, []);

  return (
    <>
      <div className="flex flex-col space-b-6">
        {/* Search Bar */}
        <div className="rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex-grow">
              <input
                name="searchInput"
                type="text"
                placeholder="Search for an item (e.g. iPhone, UPC, Model Number, MPN, etc)"
                required
                className="w-full px-4 py-3 bg-main-white text-gray-900 rounded-lg border focus:outline-none placeholder-gray-400 dark:bg-light-gray dark:border-gray-700 dark:text-light"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-sm dark:bg-light-dark dark:border-gray-700 dark:border-2 dark:hover:bg-gray-700"
            >
              Search
            </button>
          </form>

          {/* Marketplace Selection */}
          <div className="flex flex-col md:flex-row items-center justify-center mt-6 gap-4">
            <div className="flex items-center gap-3 bg-gray-50 py-2 px-4 rounded-full border border-gray-200 dark:bg-light-dark dark:border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ebay"
                  name="ebay"
                  checked={mkState?.ebay?.checked}
                  onChange={() =>
                    saveToLocalStorage(
                      "ebay",
                      !mkState?.ebay?.checked,
                      mkState?.ebay?.defaultVal,
                    )
                  }
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="ebay"
                  className={`text-gray-700 dark:text-light ${
                    !mkState?.ebay?.checked
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  eBay
                </label>
              </div>
              <select
                onChange={handleSiteChange}
                name="site_options"
                id="marketplace-selection"
                className={`bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-light ${
                  !mkState?.ebay?.checked ? "opacity-50 cursor-not-allowed" : ""
                }`}
                value={defaultEbaySite}
                disabled={!mkState?.ebay?.checked}
              >
                <option className="dark:bg-light-dark" value="EBAY_US">
                  United States
                </option>
                <option className="dark:bg-light-dark" value="EBAY_GB">
                  United Kingdom
                </option>
                <option className="dark:bg-light-dark" value="EBAY_DE">
                  Germany
                </option>
                <option className="dark:bg-light-dark" value="EBAY_AU">
                  Australia
                </option>
                <option className="dark:bg-light-dark" value="EBAY_IT">
                  Italy
                </option>
                <option className="dark:bg-light-dark" value="EBAY_CA">
                  Canada
                </option>
                <option className="dark:bg-light-dark" value="EBAY_ES">
                  Spain
                </option>
                <option className="dark:bg-light-dark" value="EBAY_FR">
                  France
                </option>
                <option className="dark:bg-light-dark" value="EBAY_PL">
                  Poland
                </option>
              </select>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 py-2 px-4 rounded-full border border-gray-200 dark:bg-light-dark dark:border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="amazon"
                  name="amazon"
                  checked={mkState?.amazon?.checked}
                  onChange={() =>
                    saveToLocalStorage(
                      "amazon",
                      !mkState?.amazon?.checked,
                      mkState?.amazon?.defaultVal,
                    )
                  }
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="amazon"
                  className={`text-gray-700 dark:text-light ${
                    !mkState?.amazon?.checked
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Amazon
                </label>
              </div>
              <select
                onChange={(e) => setDefaultAmazonSite(e.target.value)}
                id="amazon-marketplace-selection"
                className={`bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-light ${
                  !mkState?.amazon?.checked
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                value={defaultAmazonSite}
                disabled={!mkState?.amazon?.checked}
              >
                <option className="dark:bg-light-dark" value="amazon.com">
                  United States
                </option>
                <option className="dark:bg-light-dark" value="amazon.co.uk">
                  United Kingdom
                </option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg p-2 dark:bg-light-dark dark:border-gray-700 dark:border">
              <input
                type="checkbox"
                id="aliexpress"
                name="aliexpress"
                checked={mkState?.aliexpress?.checked}
                onChange={() => {
                  saveToLocalStorage(
                    "aliexpress",
                    !mkState?.aliexpress?.checked,
                    mkState?.aliexpress?.defaultVal,
                  );
                }}
                className="h-4 w-4"
              />
              <select
                onChange={(e) => setDefaultAliexpressSite(e.target.value)}
                id="aliexpress-marketplace-selection"
                value={mkState?.aliexpress?.defaultVal}
                disabled={!mkState?.aliexpress?.checked}
                className={`bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-light ${
                  !mkState?.aliexpress?.checked
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <option className="dark:bg-light-dark" value="USD">
                  AliExpress - United States
                </option>
                <option className="dark:bg-light-dark" value="GBP">
                  AliExpress - United Kingdom
                </option>
                <option className="dark:bg-light-dark" value="CAD">
                  AliExpress - Canada
                </option>
                <option className="dark:bg-light-dark" value="EUR">
                  AliExpress - European Union
                </option>
                <option className="dark:bg-light-dark" value="UAH">
                  AliExpress - Ukraine
                </option>
                <option className="dark:bg-light-dark" value="MXN">
                  AliExpress - Mexico
                </option>
                <option className="dark:bg-light-dark" value="TRY">
                  AliExpress - Türkiye
                </option>
                <option className="dark:bg-light-dark" value="RUB">
                  AliExpress - Russia
                </option>
                <option className="dark:bg-light-dark" value="BRL">
                  AliExpress - Brazil
                </option>
                <option className="dark:bg-light-dark" value="AUD">
                  AliExpress - Australia
                </option>
                <option className="dark:bg-light-dark" value="INR">
                  AliExpress - India
                </option>
                <option className="dark:bg-light-dark" value="JPY">
                  AliExpress - Japan
                </option>
                <option className="dark:bg-light-dark" value="IDR">
                  AliExpress - Indonesia
                </option>
                <option className="dark:bg-light-dark" value="SEK">
                  AliExpress - Sweden
                </option>
                <option className="dark:bg-light-dark" value="KRW">
                  AliExpress - South Korea
                </option>
                <option className="dark:bg-light-dark" value="THB">
                  AliExpress - Thailand
                </option>
                <option className="dark:bg-light-dark" value="CLP">
                  AliExpress - Chile
                </option>
                <option className="dark:bg-light-dark" value="VND">
                  AliExpress - Vietnam
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Featured Deals Section */}
        <div className="rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          {defaultEbaySite && ebayDeals.length !== 0 && !isLoading && (
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-light">
              Featured Deals on eBay{" "}
              {CantAccessDealsEbaySites.includes(defaultEbaySite)
                ? ebaySiteCountryMapping["EBAY_US"]
                : ebaySiteCountryMapping[defaultEbaySite]}
            </h2>
          )}

          {isLoading || isLoading === null ? (
            // <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            //   {Array.from({ length: 25 }).map((_, index) => (
            //     <div key={index} className="animate-pulse">
            //       <div className="bg-gray-100 rounded-lg h-48 mb-2"></div>
            //       <div className="h-4 bg-gray-100 rounded mb-2"></div>
            //       <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            //     </div>
            //   ))}
            // </div>
            <LoadingGrid />
          ) : (
            ebayDeals.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 h-ful">
                {ebayDeals.map((item: EbayItemDealsDetails, index: number) => (
                  <div className="relative " key={index}>
                    <Link
                      prefetch={false}
                      href={`${item.href}?mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=5339079461&customid=ebextractor&toolid=10001&mkevt=1`}
                      target="_blank"
                      className="group"
                    >
                      <div className="rounded-lg p-4 transition-all duration-200 hover:bg-gray-50 h-full flex flex-col border border-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">
                        <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                          <Image
                            src={item.image}
                            alt={item.title}
                            className="object-cover w-full h-full"
                            width={200}
                            height={200}
                          />
                        </div>
                        <h3 className="text-gray-700 font-medium line-clamp-2 mb-2 flex-grow dark:text-light">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-blue-600 font-bold">
                              {item.price}
                            </span>
                            {item.prevPrice &&
                              item.prevPrice.split("|")[0] !== " " && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-gray-400 line-through">
                                    {item.prevPrice.split("|")[0]}
                                  </span>
                                  {item.prevPrice.split("|")[1] !== " " && (
                                    <span className="text-emerald-600 dark:font-extrabold">
                                      {item.prevPrice.split("|")[1]}
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                          {/* {item.shipping && (
                        <span className="text-gray-500 text-sm">{item.shipping}</span>
                      )} */}
                        </div>
                      </div>
                    </Link>
                    <ImagePreview
                      mode="icon-only"
                      src={item.image}
                      alt={item.title}
                      width={800}
                      height={800}
                      Icon={FaMagnifyingGlass}
                      itemTitle={item.title}
                      ebay_site={defaultEbaySite}
                    />
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default PopularItems;
