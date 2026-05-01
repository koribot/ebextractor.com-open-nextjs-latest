"use client";
import requests from "@/app/utils/http";
import { logger } from "@/app/utils/logger";
import React, { useEffect, useRef, useState } from "react";
import { EbayItem } from "../products-search-from-marketplaces/types";
import { Toast } from "@/app/utils/toast";
import { EbayApiSearchResponse } from "@/app/model/EbayApiSearchResponse";
import { EbayResultsGrid } from "../products-search-from-marketplaces/EbayResultCard";
import LoadingGrid from "../products-search-from-marketplaces/LoadingGrid";
import EbayListingsAnalytics from "../products-search-from-marketplaces/EbayListingsAnalytics";
import { showModal } from "../common/modal/modal-provider";
import { IoSearchCircleOutline } from "react-icons/io5";
import { useRouter, useSearchParams } from "next/navigation";
import { FaRegHeart } from "react-icons/fa";
import { savedSearchesStorage } from "@/app/utils/IndexedDBManager";
import SaveOptions from "../save-options/SaveOptions";
import { api_paths } from "@/app/contants/api-paths";
import kunsul from "kunsul";

interface SiteOption {
  code: string;
  label: string;
}

const EbaySearchBySeller = () => {
  const keywordRef = useRef<HTMLInputElement>(null);
  const sellerRef = useRef<HTMLInputElement>(null);
  const readyOnlyParams = useSearchParams();
  const searchParams = new URLSearchParams(readyOnlyParams.toString());
  const [results, setResults] = useState<EbayItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const site = useRef<string>("EBAY_US");

  const [itemTotal, setItemTotal] = useState<number>(0);
  const [nextPage, setNextPage] = useState<string>("");
  const observerTarget = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const [isSaved, setIsSaved] = useState(false);

  const siteOptions: SiteOption[] = [
    { code: "EBAY_US", label: "eBay United States" },
    { code: "EBAY_GB", label: "eBay United Kingdom" },
    { code: "EBAY_DE", label: "eBay Germany" },
    { code: "EBAY_AU", label: "eBay Australia" },
    { code: "EBAY_IT", label: "eBay Italy" },
    { code: "EBAY_CA", label: "eBay Canada" },
    { code: "EBAY_ES", label: "eBay Spain" },
    { code: "EBAY_FR", label: "eBay France" },
    { code: "EBAY_HK", label: "eBay Hong Kong" },
    { code: "EBAY_SG", label: "eBay Singapore" },
    { code: "EBAY_IE", label: "eBay Ireland" },
    { code: "EBAY_PL", label: "eBay Poland" },
    { code: "EBAY_NL", label: "eBay Netherlands" },
    { code: "EBAY_AT", label: "eBay Austria" },
    { code: "EBAY_CH", label: "eBay Switzerland" },
    { code: "EBAY_BE", label: "eBay Belgium" },
  ];

  const updateRoute = () => {
    searchParams.set("site", site.current);
    keywordRef.current?.value !== ""
      ? searchParams.set("q", keywordRef.current?.value || "")
      : searchParams.delete("q");
    sellerRef.current?.value &&
      sellerRef.current?.value !== "" &&
      searchParams.set("sellers", sellerRef.current?.value?.replace(/\s/g, ""));
    router.replace(`?${searchParams.toString()}`, { scroll: false });
  };

  const getUrlSearchParams = () => {
    return {
      _site: searchParams.get("site") || "EBAY_US",
      q: searchParams.get("q") || "",
      sellers: searchParams.get("sellers") || "",
    };
  };

  const handleSearch = async ({
    e,
    nextString,
  }: {
    e?: React.FormEvent;
    nextString?: string;
  }) => {
    if (e) e.preventDefault();

    const keyword = keywordRef.current?.value || "";
    const seller = sellerRef.current?.value || "";

    if (!nextString) {
      if (!seller.trim()) {
        Toast().fire({
          icon: "warning",
          title: "Seller is required",
        });
        return;
      }

      setResults([]);
      setItemTotal(0);
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    updateRoute();
    try {
      const formattedSeller = seller.trim().split(",");

      const apiParams = nextString
        ? `${api_paths.ebay_default_search}?${nextString}&mode=LOADMORE-SEARCH-BY-SELLER-AND-KEYWORD`
        : `${api_paths.ebay_default_search}?q=${encodeURIComponent(
            keyword,
          )}&filter=sellers:{${formattedSeller.join("|")}}&site=${
            site.current
          }&limit=200&category_ids=0&mode=SEARCH-BY-SELLER-AND-KEYWORD`;

      const response = await requests.get<EbayApiSearchResponse | any>(
        apiParams,
      );
      const _nextString =
        response.requestsData.next && response.requestsData.next.split("?")[1];

      setNextPage(_nextString || "");
      setItemTotal(response.requestsData.total || 0);

      setResults((prev) =>
        nextString
          ? [...prev, ...(response.requestsData.itemSummaries || [])]
          : response.requestsData.itemSummaries || [],
      );

      setSearched(true);
    } catch (err) {
      Toast().fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch results",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  //   const handleKeyPress = (e: React.KeyboardEvent) => {
  //     if (e.key === "Enter" && !loading && sellerRef.current?.value.trim()) {
  //       handleSearch({});
  //     }
  //   };
  const handleToggleSave = async (e: React.MouseEvent) => {
    // if (
    //   searchParams.get("sellers") === null ||
    //   searchParams.get("sellers") === ""
    // ) {
    //   Toast().fire({
    //     icon: "warning",
    //     title: "Seller/Keyword is required",
    //   });
    //   return
    // }

    const href = window.location.href;
    showModal({
      title: "Save Options",
      content: (
        <SaveOptions
          search={
            readyOnlyParams.size > 0
              ? {
                  href: href || "",
                  query: keywordRef.current?.value || "",
                }
              : undefined
          }
          seller={{
            username: sellerRef.current?.value || "",
            marketplace: site.current.toLowerCase().includes("ebay")
              ? "ebay"
              : "",
          }}
        />
      ),
    });
  };
  // Check if item is saved on mount
  useEffect(() => {
    const checkIfSaved = async () => {
      const existsResponse = await savedSearchesStorage.exists(
        window.location.href,
      );
      setIsSaved(existsResponse.data || false);
    };

    checkIfSaved();
  }, [searchParams]);

  useEffect(() => {
    const { _site, q, sellers } = getUrlSearchParams();
    _site && (site.current = _site);
    keywordRef.current && (keywordRef.current.value = q || "");
    sellerRef.current && (sellerRef.current.value = sellers || "");
    sellerRef.current && sellerRef.current.value !== "" && handleSearch({});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loadingMore &&
          !loading &&
          nextPage &&
          results.length > 0
        ) {
          logger.debug.log("loadingmore", nextPage);
          handleSearch({ nextString: nextPage });
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadingMore, loading, nextPage, results.length]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        {/* Compact Search Card */}

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 gap-5 flex flex-col ">
          <form
            onSubmit={(e) => handleSearch({ e })}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
          >
            {/* Keyword Input */}
            <div className="md:col-span-3">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">
                Keyword{" "}
                <span className="text-zinc-400 dark:text-zinc-500">
                  (Optional)
                </span>
              </label>
              <input
                ref={keywordRef}
                placeholder="laptop, iPhone..."
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-md text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent outline-none transition"
                type="text"
              />
            </div>

            {/* Seller Input */}
            <div className="md:col-span-3">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">
                Sellers <span className="text-red-500">*</span>
              </label>
              <input
                defaultValue={sellerRef.current?.value}
                ref={sellerRef}
                placeholder="seller username"
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-md text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent outline-none transition"
                type="text"
              />
            </div>

            {/* Site Selector */}
            <div className="md:col-span-4">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">
                eBay Site
              </label>
              <select
                value={site.current}
                onChange={(e) => {
                  site.current = e.target.value;
                  updateRoute();

                  if (sellerRef.current?.value.trim()) {
                    handleSearch({});
                  }
                }}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-md text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent outline-none transition"
              >
                {siteOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div className="md:col-span-2">
              <button
                title="Click to search"
                type="submit"
                // onClick={() => handleSearch()}
                disabled={loading}
                className="w-full bg-blue-600 dark:bg-light-dark hover:bg-blue-700 disabled:bg-zinc-400 dark:disabled:bg-zinc-600 disabled:cursor-not-allowed text-white font-medium rounded-md py-2 transition-colors duration-200 text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin dark:bg-light-dark"></span>
                    Searching...
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </form>
          {(searchParams.get("sellers") !== null ||
            searchParams.get("sellers") !== "") &&
            searched && (
              <div className="flex gap-1">
                <button
                  onClick={handleToggleSave}
                  title={`Open Save Options`}
                  className={`flex justify-center items-center p-1 border border-gray-300 dark:border-none gap-1 w-fit text-black/60 dark:text-main-white bg-main-white dark:bg-light-dark hover:bg-gray-100`}
                >
                  <FaRegHeart />
                  <p className="text-xs">Save Options</p>
                </button>
              </div>
            )}
        </div>
        <span className="text-xs bg-gray-100 py-2 px-1 w-fit flex mb-8 font-mono dark:bg-light-dark rounded-md">
          Note: You can add multiple sellers by separating them with a comma ','
          Although the total result(items) might not be accurate
        </span>

        {/* Results Section */}
        <div>
          {loading && <LoadingGrid />}

          {searched && !loading && results.length === 0 && (
            <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-12 text-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-zinc-400 dark:text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <p className="text-zinc-900 dark:text-zinc-100 text-lg font-semibold">
                No results found
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">
                Make sure you are on the correct eBay site or try different
                search terms
              </p>
            </div>
          )}

          {itemTotal > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-zinc-900 dark:text-zinc-100 font-bold text-xl">
                  Results
                </h2>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                  {results.length} out of {itemTotal} items
                </span>
              </div>
              <button
                onClick={() =>
                  showModal({
                    title: "eBay Listings Analytics",
                    content: <EbayListingsAnalytics results={results} />,
                  })
                }
                className="flex items-center gap-2 px-4 py-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
              >
                {" "}
                <IoSearchCircleOutline className="w-5 h-5" />
                Analytics
              </button>
              <EbayResultsGrid results={results} defaultSite={site.current} />
            </div>
          )}

          {/* Infinite scroll trigger and loading indicator */}
          {nextPage && results.length > 0 && (
            <div
              ref={observerTarget}
              className="mt-8 h-16 flex items-center justify-center"
            >
              {loadingMore && (
                <div className="flex flex-col justify-center items-center">
                  <div className="flex gap-2">
                    <div
                      className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    ></div>
                  </div>
                  <span>Loading More</span>
                </div>
              )}
            </div>
          )}

          {!searched && !loading && (
            <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-12 text-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <p className="text-zinc-900 dark:text-zinc-100 text-lg font-semibold">
                Start searching for items
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">
                Enter a seller name and optional keyword to find listings
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EbaySearchBySeller;
