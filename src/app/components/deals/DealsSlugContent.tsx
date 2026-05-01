"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchStore } from "@/app/store/marketplace-search/store";
import requests from "@/app/utils/http";
import { logger } from "@/app/utils/logger";
import ImagePreview from "../common/ui/ImagePreview";
import LoadingGrid from "../products-search-from-marketplaces/LoadingGrid";
import type { DealItem, EbayDealsApiResponse } from "../home/types";
import { categories } from "@/app/contants/categories";
import { useRouter, useSearchParams } from "next/navigation";
import { api_paths } from "@/app/contants/api-paths";

const CANT_ACCESS_DEALS_EBAY_SITES = [
  "EBAY_HK",
  "EBAY_SG",
  "EBAY_IE",
  "EBAY_NL",
  "EBAY_AT",
  "EBAY_CH",
  "EBAY_BE",
  "EBAY_PL",
] as const;

const CATEGORY_IDS_BATCH_SIZE = 20;
const BATCHES_PER_LOAD = 1;

const EBAY_SITE_OPTIONS = [
  { code: "EBAY_US", label: "United States" },
  { code: "EBAY_GB", label: "United Kingdom" },
  { code: "EBAY_DE", label: "Germany" },
  { code: "EBAY_AU", label: "Australia" },
  { code: "EBAY_IT", label: "Italy" },
  { code: "EBAY_CA", label: "Canada" },
  { code: "EBAY_ES", label: "Spain" },
  { code: "EBAY_FR", label: "France" },
];

// Exported helper function to map deal items for display
export const mapEbayDealItem = (item: DealItem) => {
  const getShippingText = (): string => {
    const shippingCost = item.shippingOptions?.[0]?.shippingCost;
    if (!shippingCost) return "N/A";
    return shippingCost.value === "0.00"
      ? "Free Shipping"
      : `${shippingCost.currency} ${shippingCost.value}`;
  };

  const formatPrice = (price?: { value: string; currency: string }): string => {
    if (!price) return "N/A";
    return `${price.currency} ${price.value}`;
  };

  const getDaysRemaining = (): number => {
    const endDate = new Date(item.dealEndDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return {
    shippingText: getShippingText(),
    formattedPrice: formatPrice(item.price),
    formattedOriginalPrice: item.marketingPrice?.originalPrice?.value
      ? formatPrice(item.marketingPrice.originalPrice)
      : null,
    daysRemaining: getDaysRemaining(),
    discountPercentage: item.marketingPrice?.discountPercentage
      ? Number(item.marketingPrice.discountPercentage).toFixed(0)
      : null,
  };
};

// Exported component for rendering a single eBay deal card
export const EbayDealCard: React.FC<{
  item: DealItem;
  selectedSite: string;
  defaultEbaySite?: string;
}> = ({ item, selectedSite, defaultEbaySite }) => {
  const mappedData = mapEbayDealItem(item);

  return (
    <div className="group relative flex flex-col h-full w-full">
      <Link
        prefetch={false}
        href={item.itemAffiliateWebUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col h-full"
      >
        <div className="rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md h-full flex flex-col border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-600">
            {item.image?.imageUrl ? (
              <>
                <Image
                  src={item.image.imageUrl || "/placeholder.svg"}
                  alt={item.title}
                  loading="lazy"
                  width={300}
                  height={300}
                />

                {mappedData.discountPercentage && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white font-bold text-sm px-2.5 py-1.5 rounded-lg shadow-lg z-10">
                    {mappedData.discountPercentage}% OFF
                  </div>
                )}

                {mappedData.daysRemaining > 0 && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded z-10">
                    {mappedData.daysRemaining} day
                    {mappedData.daysRemaining !== 1 ? "s" : ""} left
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                No Image
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-grow">
            {/* Title */}
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100 line-clamp-2 mb-3 flex-grow leading-tight">
              {item.title}
            </h3>

            {/* Price Section */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {mappedData.formattedPrice}
                </span>
              </div>

              {mappedData.formattedOriginalPrice && (
                <div className="text-xs text-gray-400 line-through dark:text-gray-500">
                  {mappedData.formattedOriginalPrice}
                </div>
              )}

              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {mappedData.shippingText}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Image Preview Icon */}
      {item.image?.imageUrl && (
        <div className="absolute w-fit bottom-[45%] right-10">
          <ImagePreview
            mode="icon-only"
            itemId={item.legacyItemId}
            src={item.image.imageUrl || "/placeholder.svg"}
            alt={item.title}
            width={800}
            height={800}
            itemTitle={item.title}
            ebay_site={selectedSite || defaultEbaySite}
          />
        </div>
      )}
    </div>
  );
};

const DealsSlugContent: React.FC<{ categoryNameFromUrl: string }> = ({
  categoryNameFromUrl,
}) => {
  const [ebayDeals, setEbayDeals] = useState<DealItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string>("EBAY_US");
  const batches = useRef<string[][]>([]);
  const [nextBatchIndex, setNextBatchIndex] = useState<number>(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  const search_params = useSearchParams();
  const router = useRouter();

  const { defaultEbaySite } = useSearchStore();
  const main_category = categories.find(
    (c) =>
      c.normalizedUriName === categoryNameFromUrl ||
      c.subCategories?.some(
        (sub) => sub.normalizedUriName === categoryNameFromUrl,
      ),
  );
  const subCategory = main_category?.subCategories?.find(
    (sub) => sub.normalizedUriName === categoryNameFromUrl,
  );

  const category = subCategory || main_category;
  const parentCategory = subCategory ? main_category : null;

  const getCategoryIds = useCallback((): string[] => {
    if (!category?.categoryMap?.ebay) return [];

    const ebayData = category.categoryMap.ebay;
    if (typeof ebayData === "string") return [ebayData];

    if (Array.isArray(ebayData)) {
      return ebayData.map((cat) => cat.id);
    }

    return [];
  }, [category]);

  const batchCategoryIds = useCallback((ids: string[]): string[][] => {
    const batches: string[][] = [];
    for (let i = 0; i < ids.length; i += CATEGORY_IDS_BATCH_SIZE) {
      batches.push(ids.slice(i, i + CATEGORY_IDS_BATCH_SIZE));
    }
    return batches;
  }, []);

  const getDeals = useCallback(
    async (site?: string, batchIndex: number = 0) => {
      const isInitialLoad = batchIndex === 0;
      isInitialLoad ? setIsLoading(true) : setIsLoadingMore(true);
      setError(null);

      try {
        const siteParam = site || selectedSite || defaultEbaySite;

        if (batches.current.length === 0) {
          setEbayDeals([]);
          batches.current = batchCategoryIds(getCategoryIds());
          isInitialLoad ? setIsLoading(false) : setIsLoadingMore(false);
          return;
        }
        logger.debug.log("batches", batches.current);

        // Check if we've reached the end
        if (batchIndex >= batches.current.length) {
          logger.debug.log("no-more-batches", { batchIndex });
          isInitialLoad ? setIsLoading(false) : setIsLoadingMore(false);
          return;
        }

        // Process up to 3 batches starting from batchIndex
        const endIndex = Math.min(
          batchIndex + BATCHES_PER_LOAD,
          batches.current.length,
        );

        for (let b = batchIndex; b < endIndex; b++) {
          const batch = batches.current[b];
          const queryParams = new URLSearchParams();
          queryParams.append("site", siteParam);
          queryParams.append("category_ids", batch.join(","));

          logger.debug.log("fetching-batch", {
            batchIndex: b,
            batchSize: batch.length,
            categoryIds: batch,
          });

          const response = await requests.get<EbayDealsApiResponse>(
            `${api_paths.ebay_default_deals}?${queryParams.toString()}`,
          );

          logger.debug.log("response", response.requestsData);

          if (response.requestsData?.dealItems) {
            setEbayDeals((prevDeals) => {
              const allDeals = [
                ...prevDeals,
                ...response.requestsData.dealItems,
              ];

              // Remove duplicates based on legacyItemId
              const seenLegacyIds = new Set<string>();
              const filteredDeals = allDeals.filter((deal) => {
                if (seenLegacyIds.has(deal.legacyItemId)) {
                  return false;
                }
                seenLegacyIds.add(deal.legacyItemId);
                return true;
              });

              return filteredDeals;
            });

            logger.debug.log("batch-loaded", {
              batchIndex: b,
              itemsInBatch: response.requestsData.dealItems.length,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching deals:", error);
        setError("Failed to load deals. Please try again later.");
      } finally {
        isInitialLoad ? setIsLoading(false) : setIsLoadingMore(false);
      }
    },
    [selectedSite, defaultEbaySite, getCategoryIds, batchCategoryIds, batches],
  );

  useEffect(() => {
    logger.debug.log("search-paramss", search_params.get("site"));

    const categoryIds = getCategoryIds();
    const currentBatches = batchCategoryIds(categoryIds);
    batches.current = currentBatches;
    setSelectedSite(search_params.get("site") || selectedSite);
    getDeals(search_params.get("site") || selectedSite, 0);
    return () => {
      batches.current = [];
      setEbayDeals([]);
      setNextBatchIndex(0);
      setIsLoading(false);
      setIsLoadingMore(false);
    };
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          !isLoadingMore &&
          nextBatchIndex + BATCHES_PER_LOAD < batches.current.length
        ) {
          const nextIndex = nextBatchIndex + BATCHES_PER_LOAD;
          setNextBatchIndex(nextIndex);
          getDeals(selectedSite, nextIndex);
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [
    nextBatchIndex,
    isLoading,
    isLoadingMore,
    selectedSite,
    defaultEbaySite,
    getDeals,
    batches,
  ]);

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSite = e.target.value;
    setSelectedSite(newSite);
    const params = new URLSearchParams(search_params.toString());
    params.set("site", newSite);
    router.replace(`?${params.toString()}`, { scroll: false });
    setEbayDeals([]);
    setNextBatchIndex(0);
    getDeals(newSite, 0);
  };

  const hasMoreBatches =
    nextBatchIndex + BATCHES_PER_LOAD < batches.current.length;

  if (!category) {
    return (
      <div className="flex-1 text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Category not found.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-6 px-6">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <Link
          prefetch={false}
          href="/deals"
          className="text-gray-900 dark:text-blue-400 hover:underline font-medium"
        >
          Deals-Events & Discounts
        </Link>
        <span className="mx-2">{">"}</span>
        {parentCategory && (
          <>
            <Link
              prefetch={false}
              href={`/deals/${parentCategory.normalizedUriName}`}
              className="text-gray-900 dark:text-blue-400 hover:underline font-medium"
            >
              {parentCategory.name}
            </Link>
            <span className="mx-2">{">"}</span>
          </>
        )}
        <span className="font-medium text-blue-600 dark:text-gray-100">
          {category.name}
        </span>
      </div>

      {/* Category Header */}
      <div className="rounded-xl p-6 bg-white dark:bg-light-dark shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex flex-col">
            <h1 className="text-3xl text-gray-900 dark:text-white mb-2 font-mono">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                {category.description}
              </p>
            )}
            {!isLoading && (
              <div className="flex flex-wrap gap-2 items-center">
                {category.trending && (
                  <span className="text-sm font-medium bg-red-100 text-red-800 px-3 py-1 rounded-full dark:bg-red-900 dark:text-red-200">
                    🔥 Trending
                  </span>
                )}
              </div>
            )}
          </div>
          {category.image && (
            <div className="relative w-[500px] h-24 rounded-lg overflow-hidden flex-1 hidden lg:block">
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                className="object-contain w-full h-full"
                width={500}
                height={500}
              />
            </div>
          )}
        </div>
      </div>

      {/* Deals Section */}
      <div className="rounded-xl p-6 bg-white dark:bg-light-dark shadow-sm border border-gray-200 dark:border-gray-700 relative">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div></div>
          <div className="flex items-center gap-3">
            <label
              htmlFor="ebay-site-select"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              site:
            </label>
            <select
              id="ebay-site-select"
              value={selectedSite}
              onChange={handleSiteChange}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {EBAY_SITE_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  Ebay {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <LoadingGrid />
        ) : ebayDeals.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {ebayDeals.map((item, index) => (
                <EbayDealCard
                  key={index}
                  item={item}
                  selectedSite={selectedSite}
                  defaultEbaySite={defaultEbaySite}
                />
              ))}
            </div>
            {isLoadingMore && (
              <div className="mt-8 flex flex-col justify-center items-center">
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
            {/* Infinite scroll trigger */}
            {hasMoreBatches && (
              <div
                ref={observerTarget}
                className=" flex items-center justify-center"
              >
                {/* <div className="flex gap-2">
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  ></div>
                </div> */}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No deals available for this category at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsSlugContent;

// "use client";

// import type React from "react";
// import { useState, useEffect, useCallback, useRef } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useSearchStore } from "@/app/store/marketplace-search/store";
// import requests from "@/app/utils/http";
// import { logger } from "@/app/utils/logger";
// import ImagePreview from "../common/ui/ImagePreview";
// import LoadingGrid from "../products-search-from-marketplaces/LoadingGrid";
// import type { DealItem, EbayDealsApiResponse } from "../home/types";
// import { categories } from "@/app/contants/categories";
// import { useRouter, useSearchParams } from "next/navigation";

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

// const CATEGORY_IDS_BATCH_SIZE = 20;
// const BATCHES_PER_LOAD = 1;

// const EBAY_SITE_OPTIONS = [
//   { code: "EBAY_US", label: "United States" },
//   { code: "EBAY_GB", label: "United Kingdom" },
//   { code: "EBAY_DE", label: "Germany" },
//   { code: "EBAY_AU", label: "Australia" },
//   { code: "EBAY_IT", label: "Italy" },
//   { code: "EBAY_CA", label: "Canada" },
//   { code: "EBAY_ES", label: "Spain" },
//   { code: "EBAY_FR", label: "France" },
// ];

// const DealsSlugContent: React.FC<{ categoryNameFromUrl: string }> = ({
//   categoryNameFromUrl,
// }) => {
//   const [ebayDeals, setEbayDeals] = useState<DealItem[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isLoadingMore, setIsLoadingMore] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedSite, setSelectedSite] = useState<string>("EBAY_US");
//   const batches = useRef<string[][]>([]);
//   const [nextBatchIndex, setNextBatchIndex] = useState<number>(0);
//   const observerTarget = useRef<HTMLDivElement>(null);
//   const search_params = useSearchParams();
//   const router = useRouter();

//   const { defaultEbaySite } = useSearchStore();
//   const main_category = categories.find(
//     (c) =>
//       c.normalizedUriName === categoryNameFromUrl ||
//       c.subCategories?.some(
//         (sub) => sub.normalizedUriName === categoryNameFromUrl
//       )
//   );
//   const subCategory = main_category?.subCategories?.find(
//     (sub) => sub.normalizedUriName === categoryNameFromUrl
//   );

//   const category = subCategory || main_category;
//   const parentCategory = subCategory ? main_category : null;

//   const getCategoryIds = useCallback((): string[] => {
//     if (!category?.categoryMap?.ebay) return [];

//     const ebayData = category.categoryMap.ebay;
//     if (typeof ebayData === "string") return [ebayData];

//     if (Array.isArray(ebayData)) {
//       return ebayData.map((cat) => cat.id);
//     }

//     return [];
//   }, [category]);

//   const batchCategoryIds = useCallback((ids: string[]): string[][] => {
//     const batches: string[][] = [];
//     for (let i = 0; i < ids.length; i += CATEGORY_IDS_BATCH_SIZE) {
//       batches.push(ids.slice(i, i + CATEGORY_IDS_BATCH_SIZE));
//     }
//     return batches;
//   }, []);

//   const getDeals = useCallback(
//     async (site?: string, batchIndex: number = 0) => {
//       const isInitialLoad = batchIndex === 0;
//       isInitialLoad ? setIsLoading(true) : setIsLoadingMore(true);
//       setError(null);

//       try {
//         const siteParam = site || selectedSite || defaultEbaySite;

//         if (batches.current.length === 0) {
//           setEbayDeals([]);
//           batches.current = batchCategoryIds(getCategoryIds());
//           isInitialLoad ? setIsLoading(false) : setIsLoadingMore(false);
//           return;
//         }
//         logger.debug.log("batches", batches.current);

//         // Check if we've reached the end
//         if (batchIndex >= batches.current.length) {
//           logger.debug.log("no-more-batches", { batchIndex });
//           isInitialLoad ? setIsLoading(false) : setIsLoadingMore(false);
//           return;
//         }

//         // Process up to 3 batches starting from batchIndex
//         const endIndex = Math.min(
//           batchIndex + BATCHES_PER_LOAD,
//           batches.current.length
//         );

//         for (let b = batchIndex; b < endIndex; b++) {
//           const batch = batches.current[b];
//           const queryParams = new URLSearchParams();
//           queryParams.append("site", siteParam);
//           queryParams.append("category_ids", batch.join(","));

//           logger.debug.log("fetching-batch", {
//             batchIndex: b,
//             batchSize: batch.length,
//             categoryIds: batch,
//           });

//           const response = await requests.get<EbayDealsApiResponse>(
//             `${api_paths.ebay_default_deals}?${queryParams.toString()}`
//           );

//           logger.debug.log("response", response.data);

//           if (response.data?.dealItems) {
//             setEbayDeals((prevDeals) => {
//               const allDeals = [...prevDeals, ...response.data.dealItems];

//               // Remove duplicates based on legacyItemId
//               const seenLegacyIds = new Set<string>();
//               const filteredDeals = allDeals.filter((deal) => {
//                 if (seenLegacyIds.has(deal.legacyItemId)) {
//                   return false;
//                 }
//                 seenLegacyIds.add(deal.legacyItemId);
//                 return true;
//               });

//               return filteredDeals;
//             });

//             logger.debug.log("batch-loaded", {
//               batchIndex: b,
//               itemsInBatch: response.data.dealItems.length,
//             });
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching deals:", error);
//         setError("Failed to load deals. Please try again later.");
//       } finally {
//         isInitialLoad ? setIsLoading(false) : setIsLoadingMore(false);
//       }
//     },
//     [selectedSite, defaultEbaySite, getCategoryIds, batchCategoryIds, batches]
//   );

//   useEffect(() => {
//     logger.debug.log("search-paramss", search_params.get("site"));

//     const categoryIds = getCategoryIds();
//     const currentBatches = batchCategoryIds(categoryIds);
//     batches.current = currentBatches;
//     setSelectedSite(search_params.get("site") || selectedSite);
//     getDeals(search_params.get("site") || selectedSite, 0);
//     return () => {
//       batches.current = [];
//       setEbayDeals([]);
//       setNextBatchIndex(0);
//       setIsLoading(false);
//       setIsLoadingMore(false);
//     }
//   }, []);

//   // Intersection Observer for infinite scroll
//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (
//           entries[0].isIntersecting &&
//           !isLoading &&
//           !isLoadingMore &&
//           nextBatchIndex + BATCHES_PER_LOAD < batches.current.length
//         ) {
//           const nextIndex = nextBatchIndex + BATCHES_PER_LOAD;
//           setNextBatchIndex(nextIndex);
//           getDeals(selectedSite, nextIndex);
//         }
//       },
//       { threshold: 0.1 }
//     );

//     if (observerTarget.current) {
//       observer.observe(observerTarget.current);
//     }

//     return () => {
//       observer.disconnect();
//     };
//   }, [
//     nextBatchIndex,
//     isLoading,
//     isLoadingMore,
//     selectedSite,
//     defaultEbaySite,
//     getDeals,
//     batches,
//   ]);

//   const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newSite = e.target.value;
//     setSelectedSite(newSite);
//     const params = new URLSearchParams(search_params.toString());
//     params.set("site", newSite);
//     router.replace(`?${params.toString()}`, { scroll: false });
//     setEbayDeals([]);
//     setNextBatchIndex(0);
//     getDeals(newSite, 0);
//   };

//   const getShippingText = (item: DealItem): string => {
//     const shippingCost = item.shippingOptions?.[0]?.shippingCost;
//     if (!shippingCost) return "N/A";
//     return shippingCost.value === "0.00"
//       ? "Free Shipping"
//       : `${shippingCost.currency} ${shippingCost.value}`;
//   };

//   const formatPrice = (price?: { value: string; currency: string }): string => {
//     if (!price) return "N/A";
//     return `${price.currency} ${price.value}`;
//   };

//   const getDaysRemaining = (dealEndDate: string): number => {
//     const endDate = new Date(dealEndDate);
//     const today = new Date();
//     const diffTime = endDate.getTime() - today.getTime();
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   };

//   const hasMoreBatches =
//     nextBatchIndex + BATCHES_PER_LOAD < batches.current.length;

//   if (!category) {
//     return (
//       <div className="flex-1 text-center py-12">
//         <p className="text-gray-500 dark:text-gray-400">Category not found.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col space-y-6 px-6">
//       <div className="text-sm text-gray-600 dark:text-gray-400">
//         <Link
//           href="/deals"
//           className="text-gray-900 dark:text-blue-400 hover:underline font-medium"
//         >
//           Deals-Events & Discounts
//         </Link>
//         <span className="mx-2">{">"}</span>
//         {parentCategory && (
//           <>
//             <Link
//               href={`/deals/${parentCategory.normalizedUriName}`}
//               className="text-gray-900 dark:text-blue-400 hover:underline font-medium"
//             >
//               {parentCategory.name}
//             </Link>
//             <span className="mx-2">{">"}</span>
//           </>
//         )}
//         <span className="font-medium text-blue-600 dark:text-gray-100">
//           {category.name}
//         </span>
//       </div>

//       {/* Category Header */}
//       <div className="rounded-xl p-6 bg-white dark:bg-light-dark shadow-sm border border-gray-200 dark:border-gray-700">
//         <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
//           <div className="flex flex-col">
//             <h1 className="text-3xl text-gray-900 dark:text-white mb-2 font-mono">
//               {category.name}
//             </h1>
//             {category.description && (
//               <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
//                 {category.description}
//               </p>
//             )}
//             {!isLoading && (
//               <div className="flex flex-wrap gap-2 items-center">
//                 {category.trending && (
//                   <span className="text-sm font-medium bg-red-100 text-red-800 px-3 py-1 rounded-full dark:bg-red-900 dark:text-red-200">
//                     🔥 Trending
//                   </span>
//                 )}
//               </div>
//             )}
//           </div>
//           {category.image && (
//             <div className="relative w-[500px] h-24 rounded-lg overflow-hidden flex-1 hidden lg:block">
//               <Image
//                 src={category.image || "/placeholder.svg"}
//                 alt={category.name}
//                 className="object-contain w-full h-full"
//                 width={500}
//                 height={500}
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Deals Section */}
//       <div className="rounded-xl p-6 bg-white dark:bg-light-dark shadow-sm border border-gray-200 dark:border-gray-700 relative">
//         <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div></div>
//           <div className="flex items-center gap-3">
//             <label
//               htmlFor="ebay-site-select"
//               className="text-sm font-medium text-gray-700 dark:text-gray-300"
//             >
//               site:
//             </label>
//             <select
//               id="ebay-site-select"
//               value={selectedSite}
//               onChange={handleSiteChange}
//               disabled={isLoading}
//               className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors disabled:opacity-50 cursor-pointer"
//             >
//               {EBAY_SITE_OPTIONS.map((option) => (
//                 <option key={option.code} value={option.code}>
//                   Ebay {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {error && (
//           <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-200">
//             {error}
//           </div>
//         )}

//         {isLoading ? (
//           <LoadingGrid />
//         ) : ebayDeals.length > 0 ? (
//           <>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
//               {ebayDeals.map((item, index) => {
//                 const daysRemaining = getDaysRemaining(item.dealEndDate);

//                 return (
//                   <div
//                     key={index}
//                     className="group relative flex flex-col h-full"
//                   >
//                     <Link
//                       href={item.itemAffiliateWebUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex flex-col h-full"
//                     >
//                       <div className="rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md h-full flex flex-col border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
//                         {/* Image Container */}
//                         <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-600">
//                           {item.image?.imageUrl ? (
//                             <>
//                               <ImagePreview
//                                 mode="image-only"
//                                 src={item.image.imageUrl || "/placeholder.svg"}
//                                 alt={item.title}
//                                 loading="lazy"
//                                 width={300}
//                                 height={300}
//                                 image_quality_for_preview={100}
//                                 itemTitle={item.title}
//                                 href={item.itemAffiliateWebUrl}
//                                 target="_blank"
//                               />

//                               {/* Deal Badge */}
//                               {item.marketingPrice?.discountPercentage && (
//                                 <div className="absolute top-2 right-2 bg-red-600 text-white font-bold text-sm px-2.5 py-1.5 rounded-lg shadow-lg z-10">
//                                   {Number(
//                                     item.marketingPrice.discountPercentage
//                                   ).toFixed(0)}
//                                   % OFF
//                                 </div>
//                               )}

//                               {/* Days Remaining Badge */}
//                               {daysRemaining > 0 && (
//                                 <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded z-10">
//                                   {daysRemaining} day
//                                   {daysRemaining !== 1 ? "s" : ""} left
//                                 </div>
//                               )}
//                             </>
//                           ) : (
//                             <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
//                               No Image
//                             </div>
//                           )}
//                         </div>

//                         {/* Content */}
//                         <div className="p-4 flex flex-col flex-grow">
//                           {/* Title */}
//                           <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100 line-clamp-2 mb-3 flex-grow leading-tight">
//                             {item.title}
//                           </h3>

//                           {/* Price Section */}
//                           <div className="space-y-1.5">
//                             <div className="flex items-center gap-2">
//                               <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
//                                 {formatPrice(item.price)}
//                               </span>
//                             </div>

//                             {item.marketingPrice?.originalPrice?.value && (
//                               <div className="text-xs text-gray-400 line-through dark:text-gray-500">
//                                 {formatPrice(item.marketingPrice.originalPrice)}
//                               </div>
//                             )}

//                             <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
//                               {getShippingText(item)}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </Link>

//                     {/* Image Preview Icon */}
//                     {item.image?.imageUrl && (
//                       <div className="absolute right-0 w-full bottom-2">
//                         <ImagePreview
//                           mode="icon-only"
//                           itemId={item.legacyItemId}
//                           src={item.image.imageUrl || "/placeholder.svg"}
//                           alt={item.title}
//                           width={800}
//                           height={800}
//                           itemTitle={item.title}
//                           ebay_site={selectedSite || defaultEbaySite}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Infinite scroll trigger */}
//             {hasMoreBatches && (
//               <div
//                 ref={observerTarget}
//                 className="mt-8 h-12 flex items-center justify-center"
//               >
//                 <div className="flex gap-2">
//                   <div
//                     className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
//                     style={{ animationDelay: "0s" }}
//                   ></div>
//                   <div
//                     className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
//                     style={{ animationDelay: "0.15s" }}
//                   ></div>
//                   <div
//                     className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
//                     style={{ animationDelay: "0.3s" }}
//                   ></div>
//                 </div>
//               </div>
//             )}
//           </>
//         ) : (
//           <div className="text-center py-12">
//             <p className="text-gray-500 dark:text-gray-400">
//               No deals available for this category at the moment.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DealsSlugContent;

// "use client";

// import type React from "react";
// import { useState, useEffect, useCallback, useRef } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useSearchStore } from "@/app/store/marketplace-search/store";
// import requests from "@/app/utils/http";
// import { logger } from "@/app/utils/logger";
// import ImagePreview from "../common/ui/ImagePreview";
// import LoadingGrid from "../products-search-from-marketplaces/LoadingGrid";
// import type { DealItem, EbayDealsApiResponse } from "../home/types";
// import { categories } from "@/app/contants/categories";

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

// const CATEGORY_IDS_BATCH_SIZE = 20;
// const BATCHES_PER_LOAD = 1;

// const EBAY_SITE_OPTIONS = [
//   { code: "EBAY_US", label: "United States" },
//   { code: "EBAY_GB", label: "United Kingdom" },
//   { code: "EBAY_DE", label: "Germany" },
//   { code: "EBAY_AU", label: "Australia" },
//   { code: "EBAY_IT", label: "Italy" },
//   { code: "EBAY_CA", label: "Canada" },
//   { code: "EBAY_ES", label: "Spain" },
//   { code: "EBAY_FR", label: "France" },
// ];

// const DealsSlugContent: React.FC<{ categoryNameFromUrl: string }> = ({
//   categoryNameFromUrl,
// }) => {
//   const [ebayDeals, setEbayDeals] = useState<DealItem[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isLoadingMore, setIsLoadingMore] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedSite, setSelectedSite] = useState<string>("");
//   const batches = useRef<string[][]>([]);
//   const [nextBatchIndex, setNextBatchIndex] = useState<number>(0);

//   const { defaultEbaySite } = useSearchStore();
//   const main_category = categories.find(
//     (c) =>
//       c.normalizedUriName === categoryNameFromUrl ||
//       c.subCategories?.some(
//         (sub) => sub.normalizedUriName === categoryNameFromUrl
//       )
//   );
//   const subCategory = main_category?.subCategories?.find(
//     (sub) => sub.normalizedUriName === categoryNameFromUrl
//   );

//   const category = subCategory || main_category;
//   const parentCategory = subCategory ? main_category : null;

//   const getCategoryIds = useCallback((): string[] => {
//     if (!category?.categoryMap?.ebay) return [];

//     const ebayData = category.categoryMap.ebay;
//     if (typeof ebayData === "string") return [ebayData];

//     if (Array.isArray(ebayData)) {
//       return ebayData.map((cat) => cat.id);
//     }

//     return [];
//   }, [category]);

//   const batchCategoryIds = useCallback((ids: string[]): string[][] => {
//     const batches: string[][] = [];
//     for (let i = 0; i < ids.length; i += CATEGORY_IDS_BATCH_SIZE) {
//       batches.push(ids.slice(i, i + CATEGORY_IDS_BATCH_SIZE));
//     }
//     return batches;
//   }, []);

//   useEffect(() => {
//     if (!selectedSite && defaultEbaySite) {
//       setSelectedSite(defaultEbaySite);
//     }
//   }, [defaultEbaySite, selectedSite]);

//   const getDeals = useCallback(
//     async (site?: string, batchIndex: number = 0) => {
//       const isInitialLoad = batchIndex === 0;
//       isInitialLoad ? setIsLoading(true) : setIsLoadingMore(true);
//       setError(null);

//       try {
//         const siteParam = site || selectedSite || defaultEbaySite;

//         if (batches.current.length === 0) {
//           setEbayDeals([]);
//           batches.current = batchCategoryIds(getCategoryIds());
//           isInitialLoad ? setIsLoading(false) : setIsLoadingMore(false);
//           return;
//         }
//         logger.debug.log("batches", batches.current);

//         // Check if we've reached the end
//         if (batchIndex >= batches.current.length) {
//           logger.debug.log("no-more-batches", { batchIndex });
//           isInitialLoad ? setIsLoading(false) : setIsLoadingMore(false);
//           return;
//         }

//         // Process up to 3 batches starting from batchIndex
//         const endIndex = Math.min(
//           batchIndex + BATCHES_PER_LOAD,
//           batches.current.length
//         );

//         for (let b = batchIndex; b < endIndex; b++) {
//           const batch = batches.current[b];
//           const queryParams = new URLSearchParams();
//           queryParams.append("site", siteParam);
//           queryParams.append("category_ids", batch.join(","));

//           logger.debug.log("fetching-batch", {
//             batchIndex: b,
//             batchSize: batch.length,
//             categoryIds: batch,
//           });

//           const response = await requests.get<EbayDealsApiResponse>(
//             `${api_paths.ebay_default_deals}?${queryParams.toString()}`
//           );

//           logger.debug.log("response", response.data);

//           if (response.data?.dealItems) {
//             setEbayDeals((prevDeals) => {
//               const allDeals = [...prevDeals, ...response.data.dealItems];

//               // Remove duplicates based on legacyItemId
//               const seenLegacyIds = new Set<string>();
//               const filteredDeals = allDeals.filter((deal) => {
//                 if (seenLegacyIds.has(deal.legacyItemId)) {
//                   return false;
//                 }
//                 seenLegacyIds.add(deal.legacyItemId);
//                 return true;
//               });

//               return filteredDeals;
//             });

//             logger.debug.log("batch-loaded", {
//               batchIndex: b,
//               itemsInBatch: response.data.dealItems.length,
//             });
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching deals:", error);
//         setError("Failed to load deals. Please try again later.");
//       } finally {
//         isInitialLoad ? setIsLoading(false) : setIsLoadingMore(false);
//       }
//     },
//     [selectedSite, defaultEbaySite, getCategoryIds, batchCategoryIds, batches]
//   );

//   useEffect(() => {
//     const categoryIds = getCategoryIds();
//     const currentBatches = batchCategoryIds(categoryIds);
//     batches.current = currentBatches;
//     getDeals(selectedSite || defaultEbaySite, 0);
//   }, []);

//   const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newSite = e.target.value;
//     setSelectedSite(newSite);
//     setEbayDeals([]);
//     setNextBatchIndex(0);
//     getDeals(newSite, 0);
//   };

//   const handleLoadMore = () => {
//     const nextIndex = nextBatchIndex + BATCHES_PER_LOAD;
//     setNextBatchIndex(nextIndex);
//     getDeals(selectedSite || defaultEbaySite, nextIndex);
//   };

//   const getShippingText = (item: DealItem): string => {
//     const shippingCost = item.shippingOptions?.[0]?.shippingCost;
//     if (!shippingCost) return "N/A";
//     return shippingCost.value === "0.00"
//       ? "Free Shipping"
//       : `${shippingCost.currency} ${shippingCost.value}`;
//   };

//   const formatPrice = (price?: { value: string; currency: string }): string => {
//     if (!price) return "N/A";
//     return `${price.currency} ${price.value}`;
//   };

//   const getDaysRemaining = (dealEndDate: string): number => {
//     const endDate = new Date(dealEndDate);
//     const today = new Date();
//     const diffTime = endDate.getTime() - today.getTime();
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   };

//   const hasMoreBatches =
//     nextBatchIndex + BATCHES_PER_LOAD < batches.current.length;

//   if (!category) {
//     return (
//       <div className="flex-1 text-center py-12">
//         <p className="text-gray-500 dark:text-gray-400">Category not found.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col space-y-6 px-6">
//       <div className="text-sm text-gray-600 dark:text-gray-400">
//         <Link
//           href="/deals"
//           className="text-gray-900 dark:text-blue-400 hover:underline font-medium"
//         >
//           Deals-Events & Discounts
//         </Link>
//         <span className="mx-2">{">"}</span>
//         {parentCategory && (
//           <>
//             <Link
//               href={`/deals/${parentCategory.normalizedUriName}`}
//               className="text-gray-900 dark:text-blue-400 hover:underline font-medium"
//             >
//               {parentCategory.name}
//             </Link>
//             <span className="mx-2">{">"}</span>
//           </>
//         )}
//         <span className="font-medium text-blue-600 dark:text-gray-100">
//           {category.name}
//         </span>
//       </div>

//       {/* Category Header */}
//       <div className="rounded-xl p-6 bg-white dark:bg-light-dark shadow-sm border border-gray-200 dark:border-gray-700">
//         <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
//           <div className="flex flex-col">
//             <h1 className="text-3xl text-gray-900 dark:text-white mb-2 font-mono">
//               {category.name}
//             </h1>
//             {category.description && (
//               <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
//                 {category.description}
//               </p>
//             )}
//             {!isLoading && (
//               <div className="flex flex-wrap gap-2 items-center">
//                 {/* <span className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-200">
//                   {ebayDeals.length}{batches.current.length > 0 ? "+" : ""}{" "}
//                   Items
//                 </span> */}
//                 {category.trending && (
//                   <span className="text-sm font-medium bg-red-100 text-red-800 px-3 py-1 rounded-full dark:bg-red-900 dark:text-red-200">
//                     🔥 Trending
//                   </span>
//                 )}
//               </div>
//             )}
//           </div>
//           {category.image && (
//             <div className="relative w-[500px] h-24 rounded-lg overflow-hidden flex-1 hidden lg:block">
//               <Image
//                 src={category.image || "/placeholder.svg"}
//                 alt={category.name}
//                 className="object-contain w-full h-full"
//                 width={500}
//                 height={500}
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Deals Section */}
//       <div className="rounded-xl p-6 bg-white dark:bg-light-dark shadow-sm border border-gray-200 dark:border-gray-700 relative">
//         <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div></div>
//           <div className="flex items-center gap-3">
//             <label
//               htmlFor="ebay-site-select"
//               className="text-sm font-medium text-gray-700 dark:text-gray-300"
//             >
//               site:
//             </label>
//             <select
//               id="ebay-site-select"
//               value={selectedSite}
//               onChange={handleSiteChange}
//               disabled={isLoading}
//               className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors disabled:opacity-50 cursor-pointer"
//             >
//               {EBAY_SITE_OPTIONS.map((option) => (
//                 <option key={option.code} value={option.code}>
//                   Ebay {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {error && (
//           <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-200">
//             {error}
//           </div>
//         )}

//         {isLoading ? (
//           <LoadingGrid />
//         ) : ebayDeals.length > 0 ? (
//           <>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
//               {ebayDeals.map((item, index) => {
//                 const daysRemaining = getDaysRemaining(item.dealEndDate);

//                 return (
//                   <div
//                     key={index}
//                     className="group relative flex flex-col h-full"
//                   >
//                     <Link
//                       href={item.itemAffiliateWebUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex flex-col h-full"
//                     >
//                       <div className="rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md h-full flex flex-col border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
//                         {/* Image Container */}
//                         <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-600">
//                           {item.image?.imageUrl ? (
//                             <>
//                               <ImagePreview
//                                 mode="image-only"
//                                 src={item.image.imageUrl || "/placeholder.svg"}
//                                 alt={item.title}
//                                 loading="lazy"
//                                 width={300}
//                                 height={300}
//                                 image_quality_for_preview={100}
//                                 itemTitle={item.title}
//                                 href={item.itemAffiliateWebUrl}
//                                 target="_blank"
//                               />

//                               {/* Deal Badge */}
//                               {item.marketingPrice?.discountPercentage && (
//                                 <div className="absolute top-2 right-2 bg-red-600 text-white font-bold text-sm px-2.5 py-1.5 rounded-lg shadow-lg z-10">
//                                   {Number(
//                                     item.marketingPrice.discountPercentage
//                                   ).toFixed(0)}
//                                   % OFF
//                                 </div>
//                               )}

//                               {/* Days Remaining Badge */}
//                               {daysRemaining > 0 && (
//                                 <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded z-10">
//                                   {daysRemaining} day
//                                   {daysRemaining !== 1 ? "s" : ""} left
//                                 </div>
//                               )}
//                             </>
//                           ) : (
//                             <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
//                               No Image
//                             </div>
//                           )}
//                         </div>

//                         {/* Content */}
//                         <div className="p-4 flex flex-col flex-grow">
//                           {/* Title */}
//                           <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100 line-clamp-2 mb-3 flex-grow leading-tight">
//                             {item.title}
//                           </h3>

//                           {/* Price Section */}
//                           <div className="space-y-1.5">
//                             <div className="flex items-center gap-2">
//                               <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
//                                 {formatPrice(item.price)}
//                               </span>
//                             </div>

//                             {item.marketingPrice?.originalPrice?.value && (
//                               <div className="text-xs text-gray-400 line-through dark:text-gray-500">
//                                 {formatPrice(item.marketingPrice.originalPrice)}
//                               </div>
//                             )}

//                             <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
//                               {getShippingText(item)}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </Link>

//                     {/* Image Preview Icon */}
//                     {item.image?.imageUrl && (
//                       <div className="absolute right-0 w-full bottom-2">
//                         <ImagePreview
//                           mode="icon-only"
//                           itemId={item.legacyItemId}
//                           src={item.image.imageUrl || "/placeholder.svg"}
//                           alt={item.title}
//                           width={800}
//                           height={800}
//                           itemTitle={item.title}
//                           ebay_site={selectedSite || defaultEbaySite}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           </>
//         ) : (
//           <div className="text-center py-12">
//             <p className="text-gray-500 dark:text-gray-400">
//               No deals available for this category at the moment.
//             </p>
//           </div>
//         )}
//         {/* Load More Button */}
//         {hasMoreBatches && (
//           <div className="mt-8 flex justify-center">
//             <button
//               onClick={handleLoadMore}
//               disabled={isLoadingMore}
//               className="px-6 py-3 bg-blue-600 dark:bg-gray-800 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-wait"
//             >
//               {isLoadingMore ? "Loading..." : "View More Deals"}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DealsSlugContent;
