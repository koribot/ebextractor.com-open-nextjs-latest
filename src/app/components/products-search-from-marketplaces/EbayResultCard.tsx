"use client";

import Link from "next/link";
import {
  FaLocationDot,
  FaMagnifyingGlass,
} from "react-icons/fa6";
import type { EbayItem, ResultsSectionProps } from "./types";
import LoadingGrid from "./LoadingGrid";
import NoResults from "./NoResult";
import ImagePreview from "../common/ui/ImagePreview";
import DotdotdotLoading from "../common/ui/DotdotdotLoading";
import EbaySearchFilters from "./EbaySearchFilters";
import {
  ebaySiteCodeToNameMapping,
  ebaySiteUrlMapping,
} from "@/app/utils/ebaySiteMapping";
import EbayPriceAlertModal from "../ebay-price-alert-modal/EbayPriceAlertModal";
import { IoFilterCircleOutline, IoSearchCircleOutline } from "react-icons/io5";
import { useEbayFilterStore } from "@/app/store/ebay-search-filter/store";
import { useEbaySearchAnalytics } from "@/app/store/ebay-search-analytics/store";
import { useSearchStore } from "@/app/store/marketplace-search/store";
import CheckOnOtherPlatformButton from "../common/ui/Buttons/CheckOnOtherPlatformButton";
import { showModal } from "../common/modal/modal-provider";
import EbayListingsAnalytics from "./EbayListingsAnalytics";
import {
  FaChevronDown,
  FaChevronUp,
  FaRegHeart,
} from "react-icons/fa";
import { useState } from "react";
import SaveOptions from "../save-options/SaveOptions";
import PopularItemsv2 from "../home/PopularItemsv2";
import { normaliseTitleToAdaptInUrl } from "@/app/utils/normaliseTitleToAdaptInUrl";

export default function EbayResultCard({
  isLoading,
  results,
  isLoadingMore,
  hasNextPage,
  handleLoadMore,
  defaultSite,
  searchTerm,
  searchUrlParam,
  searchParams,
}: ResultsSectionProps) {
  const {
    getActiveFilterCount,
    setIsEbayFiltersModalOpen,
    selectedDiscounts,
    selectedCondition,
    selectedSellers,
    priceMin,
    priceMax,
  } = useEbayFilterStore();
  const { searchKeywordType, ebayResults } = useSearchStore();
  const { setIsEbayAnalyticsModalOpen, isEbayAnalyticsModalOpen } =
    useEbaySearchAnalytics();
  const activeFilterCount = getActiveFilterCount();
  const params = new URLSearchParams(searchParams.toString());
  const totalActiveFilters = activeFilterCount + selectedDiscounts?.length;
  const concatenatedFilterParams = `&condition=${selectedCondition}&sellers=${selectedSellers.join(
    ",",
  )}&discounts=${selectedDiscounts.join(
    ",",
  )}&priceMin=${priceMin}&priceMax=${priceMax}`;

  return (
    <div className="flex w-full flex-col">
      <EbaySearchFilters />
      <div className="flex flex-col p-6 w-full bg-white dark:bg-light-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 min-h-[fit-content]">
        {searchKeywordType === "FEW_KEYWORDS" && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 z-[50]">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="w-5 h-5 text-amber-600 dark:text-amber-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  No exact matches found
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                  Showing results that match some of your search keywords. For
                  better results, try:
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  • Use specific model names or numbers • Include UPC/EAN codes
                  • Add product identifiers • Try fewer keywords
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white dark:bg-light-dark flex flex-col md:flex-row gap-4
          pt-2 pb-2 mb-2 border-b border-gray-200 dark:border-gray-700 sticky top-[140px] z-[50]">
          <button
            disabled={!!isLoading}
            title={`Show Filters | Active Filters: ${totalActiveFilters}`}
            onClick={() => setIsEbayFiltersModalOpen(true)}
            style={{ cursor: `${!!isLoading ? "not-allowed" : "pointer"}` }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
          >
            <IoFilterCircleOutline className="w-5 h-5" />
            Filters
            {totalActiveFilters > 0 && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2 py-1 rounded-full">
                {totalActiveFilters}
              </span>
            )}
          </button>
          <button
            disabled={!!isLoading}
            style={{
              cursor: `${!!isLoading || !results ? "not-allowed" : "pointer"}`,
            }}
            title={
              results?.length <= 0 && !isLoading
                ? "No results to show"
                : `Show Listings Analytics | You need to be logged in`
            }
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
            onClick={() => {
              results?.length > 0 &&
                showModal({
                  title: "eBay Listings Analytics",
                  content: <EbayListingsAnalytics />,
                });
            }}
          >
            <IoSearchCircleOutline className="w-5 h-5" />
            Analytics
          </button>
        </div>

        {isLoading ? (
          <LoadingGrid />
        ) : results?.length > 0 ? (
          <EbayResultsGrid
            results={results as EbayItem[]}
            defaultSite={defaultSite}
          />
        ) : (
          <NoResults
            searchParams={searchParams}
            searchTerm={searchTerm}
            searchUrlParam={searchUrlParam}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
          />
        )}
        {hasNextPage && results?.length > 0 && (
          <button
            title="View More Items"
            disabled={isLoadingMore !== null ? isLoadingMore : false}
            className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-wait disabled:bg-blue-600 flex justify-center items-center"
            onClick={() => handleLoadMore(concatenatedFilterParams)}
          >
            {isLoadingMore ? <DotdotdotLoading color="white" /> : "View More"}
          </button>
        )}
      </div>

      {ebayResults.length <= 0 && !isLoading && (
        <div className="mt-5 p-10">
          <div className="flex justify-start items-center">
            <p className="text-gray-400">Check this hot deals on ebay</p>
          </div>
          <PopularItemsv2 __site__={defaultSite} />
        </div>
      )}
    </div>
  );
}

export function EbayResultsGrid({
  results,
  defaultSite,
}: {
  results: EbayItem[];
  defaultSite: string;
}) {
  return (
    <div className="h-[fit-content]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {results.map((result, index) => (
          <EbayResultItem
            key={index}
            result={result}
            defaultSite={defaultSite}
          />
        ))}
      </div>
    </div>
  );
}

export function EbayResultItem({
  result,
  defaultSite,
}: {
  result: EbayItem;
  defaultSite: string;
}) {
  const [IsMouseEntered, setIsMouseEntered] = useState({
    item: false,
    seller: false,
  });
  const [isSaved, setIsSaved] = useState({
    item: false,
    seller: false,
  });
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);

  const otherPics = result?.additionalImages?.map((image) => image.imageUrl);
  const webpId =
    result?.itemAffiliateWebUrl?.split("%3Ag%3A")[1]?.split("&")[0] || "";
  const webpUrl =
    webpId !== ""
      ? `https://i.ebayimg.com/thumbs/images/g/${webpId}/s-l300.webp`
      : "";

  const formattedPrice = `${
    result?.price?.currency === "USD" ? "$" : result?.price?.currency
  }${result?.price?.value}`;

  const fallbackImage = "/no-image.svg";

  const getShippingCostDisplay = (shippingOption: any) => {
    const { shippingCostType, shippingCost } = shippingOption;

    if (shippingCostType === "FREE" || shippingCost?.value === "0.00") {
      return "Free Shipping";
    }

    if (shippingCostType === "FIXED") {
      const currencySymbol = shippingCost?.currency;
      return `${currencySymbol} ${shippingCost?.value} Shipping`;
    }

    return "Calculated Shipping";
  };

  const cleanTitle = normaliseTitleToAdaptInUrl(result?.title);
  const cleanSite = defaultSite.replaceAll("_", "-").toLocaleLowerCase();
  const cleanItemId = result?.itemId.replaceAll("|", "-");

  const handleSave = () => {
    showModal({
      title: "Save Options",
      content: (
        <SaveOptions
          item={{
            marketplace: "ebay",
            id: result.itemId,
            title: result.title,
            price: {
              value: result.price.value,
              currency: result.price.currency,
            },
            imageUrl: result.thumbnailImages?.[0]?.imageUrl,
            itemWebUrl: result.itemWebUrl,
            itemAffiliateWebUrl: result.itemAffiliateWebUrl,
            condition: result.condition,
            seller: {
              username: result.seller?.username,
              feedbackPercentage: result.seller?.feedbackPercentage,
              feedbackScore: result.seller?.feedbackScore,
            },
          }}
          seller={{
            username: result.seller?.username,
            feedbackPercentage: result.seller?.feedbackPercentage,
            feedbackScore: result.seller?.feedbackScore,
            marketplace: "ebay",
          }}
        />
      ),
    });
  };

  return (
    <div
      onMouseEnter={() => {
        setIsMouseEntered({ ...IsMouseEntered, item: true });
      }}
      onMouseLeave={() => {
        setIsMouseEntered({ ...IsMouseEntered, item: false });
      }}
      className="w-full bg-white dark:bg-light-dark border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-200 dark:hover:border-gray-500 transition-all duration-300 group flex flex-col min-h-[300px]"
    >
      <div className="relative overflow-y-auto small-scrollbar aspect-square flex items-center justify-center
        overflow-hidden bg-gray-50 dark:bg-light-dark group-hover:bg-gray-100
        dark:group-hover:bg-gray-600 transition-colors duration-200">
        {IsMouseEntered.item && (
          <button
            onClick={handleSave}
            title={"Save Options"}
            className={`absolute top-1 left-1 z-40 hover:scale-125 text-xl rounded-full p-1 transition-all ${
              isSaved.item
                ? "text-blue-700 dark:text-main-white bg-white dark:bg-light-dark hover:bg-red-50"
                : "text-black/60 dark:text-main-white bg-white dark:bg-light-dark hover:bg-gray-100"
            }`}
          >
            <FaRegHeart />
          </button>
        )}

        {result?.marketingPrice && (
          <div className="absolute top-3 right-3 z-40">
            <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold bg-blue-600 dark:bg-light-dark dark:text-gray-200 text-white shadow-sm">
              {result?.marketingPrice?.discountPercentage}% OFF
            </span>
          </div>
        )}
        <ImagePreview
          otherPics={otherPics}
          itemId={result?.itemId}
          src={
            result?.thumbnailImages && result?.thumbnailImages?.length > 0
              ? result?.thumbnailImages[0].imageUrl
              : fallbackImage
          }
          alt={result?.title}
          width={800}
          height={800}
          image_quality_for_preview={10}
          image_quality_when_modal_open={75}
          Icon={FaMagnifyingGlass}
          loading="lazy"
          itemTitle={result?.title}
          ebay_site={defaultSite}
          mode="image-with-icon"
          enableSlider={true}
        />
        <Link
          title="Check it on Ebay"
          prefetch={false}
          href={
            result?.itemAffiliateWebUrl
              ? result?.itemAffiliateWebUrl
              : result?.itemWebUrl || "#"
          }
          target="_blank"
          className="absolute inset-0"
        >
          <span className="sr-only">View product details</span>
        </Link>
      </div>

      <div className="px-4 pt-4 flex-grow flex flex-col relative justify-around">
        {result?.itemLocation.city && (
          <div className="absolute top-[0] left-0 text-xs px-4 flex items-center">
            <FaLocationDot className="text-red-700 dark:text-main-white" />{" "}
            {result?.itemLocation.city.toLocaleLowerCase()}
          </div>
        )}
        {result?.itemLocation.country && !result?.itemLocation.city && (
          <div className="absolute top-[0] left-0 text-xs px-4 flex items-center">
            <FaLocationDot className="text-red-700 dark:text-main-white" />{" "}
            {result?.itemLocation.country.toLocaleLowerCase()}
          </div>
        )}
        <Link
          title={`Open Product Page - ${result.title}`}
          href={`/ebay/${cleanTitle}/${cleanItemId}~${cleanSite}` || "#"}
          prefetch={false}
          target="_blank"
          className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 leading-relaxed"
        >
          {result?.title}
        </Link>

        {/*<Link
          title={`${result.title}`}
          href={result?.itemAffiliateWebUrl || result?.itemWebUrl || "#"}
          target="_blank"
          prefetch={false}
          className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 leading-relaxed"
        >
          {result?.title}
        </Link>*/}

        <div className="flex items-baseline justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formattedPrice}
            </span>
            {result?.marketingPrice &&
              !result?.condition?.includes("Refurbished") &&
              result?.marketingPrice?.originalPrice?.currency && (
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  {`${
                    result?.marketingPrice.originalPrice.currency === "USD"
                      ? "$"
                      : result?.marketingPrice.originalPrice.currency
                  }${result?.marketingPrice.originalPrice.value}`}
                </span>
              )}
          </div>
          {result?.seller && (
            <div className="flex flex-col items-end">
              <span className="text-xs flex items-center">
                <a
                  title={result?.seller.username}
                  target="_blank"
                  href={`/ebay-search-by-seller?sellers=${result?.seller.username}&site=${defaultSite}`}
                  className="underline text-gray-600  dark:text-gray-300 font-medium text-xs truncate max-w-[100px]"
                >
                  {result?.seller.username}
                </a>
              </span>
              <div className="flex items-center ">
                <span className="text-[10px] font-semibold text-blue-600 dark:text-gray-400">
                  {result?.seller.feedbackPercentage}%
                </span>
                <svg
                  className="w-2 h-2 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {result?.condition && result?.condition !== "Unspecified" && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-gray-300 border border-blue-200 dark:border-blue-700">
              {result?.condition}
            </span>
          )}
          {result?.buyingOptions?.length > 1 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-gray-300 border border-blue-200 dark:border-blue-700">
              {result?.buyingOptions[1] === "BEST_OFFER"
                ? "ACCEPTS OFFER"
                : result?.buyingOptions[1]}
            </span>
          )}
          {result?.shippingOptions && result?.shippingOptions[0] && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-light-dark text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
              {getShippingCostDisplay(result.shippingOptions[0])}
            </span>
          )}
        </div>

        {/* Toggle Button - bottom right corner, hidden when open */}
        {!moreOptionsOpen && (
          <button
            onClick={() => setMoreOptionsOpen(true)}
            className="absolute bottom-0 right-0 z-30 p-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md group/toggle"
            title="Show more options"
          >
            <FaChevronUp className="w-3 h-3 text-gray-600 dark:text-gray-400 group-hover/toggle:text-blue-600 dark:group-hover/toggle:text-blue-400 transition-colors" />
          </button>
        )}

        {/* bottom section - absolute positioned overlay */}
        <div
          className={`absolute left-0 right-0 bottom-0 bg-white dark:bg-light-dark px-4 pb-4 pt-3 space-y-3 transition-all duration-300 ease-in-out rounded-b-xl border-t border-gray-100 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] ${
            moreOptionsOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <button
            onClick={() => setMoreOptionsOpen(false)}
            className="absolute top-[-20] left-1/2 transform -translate-x-1/2 z-30 p-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md group/toggle"
            title="Close more options"
          >
            <FaChevronDown className="w-3 h-3 text-gray-600 dark:text-gray-400 group-hover/toggle:text-blue-600 dark:group-hover/toggle:text-blue-400 transition-colors" />
          </button>
          <div className="flex justify-between items-center">
            <Link
              prefetch={false}
              title="View More Details on eBextractor"
              className="text-blue-600 text-xs dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium transition-colors duration-200"
              href={`/ebay/${cleanTitle}/${cleanItemId}~${cleanSite}`}
              target="_blank"
            >
              Details
            </Link>
            <CheckOnOtherPlatformButton
              title={result?.title}
              imageUrl={result?.thumbnailImages?.[0]?.imageUrl}
            />
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
            <EbayPriceAlertModal
              itemId={result?.itemId}
              imgUrl={
                (result?.thumbnailImages &&
                  result?.thumbnailImages[0]?.imageUrl) ||
                ""
              }
              itemTitle={result?.title}
              currentPrice={Number(result?.price.value || 0)}
            />
            <Link
              prefetch={false}
              role="div"
              title={`You need to be signed-in to ${ebaySiteCodeToNameMapping[defaultSite]} to view this page`}
              target="_blank"
              className="text-blue-600 text-xs dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium transition-colors duration-200"
              href={`${
                ebaySiteUrlMapping[defaultSite]
              }bin/purchaseHistory?item=${
                result?.itemId?.split("|")[1]
              }&site=${defaultSite}&title=${result?.title}`}
            >
              Sold History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
// export function EbayResultItem({
//   result,
//   defaultSite,
// }: {
//   result: EbayItem;
//   defaultSite: string;
// }) {
//   const [IsMouseEntered, setIsMouseEntered] = useState({
//     item: false,
//     seller: false,
//   });
//   const [isSaved, setIsSaved] = useState({
//     item: false,
//     seller: false,
//   });
//   const otherPics = result?.additionalImages?.map((image) => image.imageUrl);
//   const webpId =
//     result?.itemAffiliateWebUrl?.split("%3Ag%3A")[1]?.split("&")[0] || "";
//   const webpUrl =
//     webpId !== ""
//       ? `https://i.ebayimg.com/thumbs/images/g/${webpId}/s-l300.webp`
//       : "";

//   const formattedPrice = `${
//     result?.price?.currency === "USD" ? "$" : result?.price?.currency
//   }${result?.price?.value}`;

//   const fallbackImage = "/no-image.svg";

//   const getShippingCostDisplay = (shippingOption: any) => {
//     const { shippingCostType, shippingCost } = shippingOption;

//     if (shippingCostType === "FREE" || shippingCost?.value === "0.00") {
//       return "Free Shipping";
//     }

//     if (shippingCostType === "FIXED") {
//       const currencySymbol = shippingCost?.currency;
//       return `${currencySymbol} ${shippingCost?.value} Shipping`;
//     }

//     return "Calculated Shipping";
//   };

//   const handleSave = () => {
//     showModal({
//       title: "Save Options",
//       content: (
//         <SaveOptions
//           item={{
//             marketplace: "ebay",
//             id: result.itemId,
//             title: result.title,
//             price: {
//               value: result.price.value,
//               currency: result.price.currency,
//             },
//             imageUrl: result.thumbnailImages?.[0]?.imageUrl,
//             itemWebUrl: result.itemWebUrl,
//             itemAffiliateWebUrl: result.itemAffiliateWebUrl,
//             condition: result.condition,
//             seller: {
//               username: result.seller?.username,
//               feedbackPercentage: result.seller?.feedbackPercentage,
//               feedbackScore: result.seller?.feedbackScore,
//             },
//           }}
//           seller={{
//             username: result.seller?.username,
//             feedbackPercentage: result.seller?.feedbackPercentage,
//             feedbackScore: result.seller?.feedbackScore,
//             marketplace: "ebay",
//           }}
//         />
//       ),
//     });
//   };

//   return (
//     <div
//       onMouseEnter={() => {
//         setIsMouseEntered({ ...IsMouseEntered, item: true });
//       }}
//       onMouseLeave={() => {
//         setIsMouseEntered({ ...IsMouseEntered, item: false });
//       }}
//       className="w-full bg-white dark:bg-light-dark border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-200 dark:hover:border-gray-500 transition-all duration-300 group flex flex-col min-h-[400px]"
//     >
//       <div className="relative overflow-y-auto small-scrollbar aspect-square overflow-hidden bg-gray-50 dark:bg-light-dark group-hover:bg-gray-100 dark:group-hover:bg-gray-600 transition-colors duration-200">
//         {IsMouseEntered.item && (
//           <button
//             onClick={handleSave}
//             title={"Save Options"}
//             className={`absolute top-1 left-1 z-40 hover:scale-125 text-xl rounded-full p-1 transition-all ${
//               isSaved.item
//                 ? "text-blue-700 dark:text-main-white bg-white dark:bg-light-dark hover:bg-red-50"
//                 : "text-black/60 dark:text-main-white bg-white dark:bg-light-dark hover:bg-gray-100"
//             }`}
//           >
//             <FaRegHeart />
//             {/* {isSaved.item ? <FaHeart /> : <FaRegHeart />} */}
//             {/* <FaGripLines /> */}
//           </button>
//         )}

//         {result?.marketingPrice && (
//           <div className="absolute top-3 right-3 z-40">
//             <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold bg-blue-600 dark:bg-light-dark dark:text-gray-200 text-white shadow-sm">
//               {result?.marketingPrice?.discountPercentage}% OFF
//             </span>
//           </div>
//         )}
//         <ImagePreview
//           otherPics={otherPics}
//           itemId={result?.itemId}
//           src={
//             result?.thumbnailImages && result?.thumbnailImages?.length > 0
//               ? result?.thumbnailImages[0].imageUrl
//               : fallbackImage
//           }
//           alt={result?.title}
//           width={800}
//           height={800}
//           image_quality_for_preview={10}
//           image_quality_when_modal_open={75}
//           Icon={FaMagnifyingGlass}
//           loading="lazy"
//           itemTitle={result?.title}
//           EbaySite={defaultSite}
//         />
//         <Link
//           title="Check it on Ebay"
//           prefetch={false}
//           href={
//             result?.itemAffiliateWebUrl
//               ? result?.itemAffiliateWebUrl
//               : result?.itemWebUrl || "#"
//           }
//           target="_blank"
//           className="absolute inset-0"
//         >
//           <span className="sr-only">View product details</span>
//         </Link>
//       </div>

//       <div className="p-4 flex-grow flex flex-col">
//         <Link
//           title={`${result.title}`}
//           href={result?.itemAffiliateWebUrl || result?.itemWebUrl || "#"}
//           target="_blank"
//           prefetch={false}
//           className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 leading-relaxed"
//         >
//           {result?.title}
//         </Link>

//         <div className="flex items-baseline justify-between mb-3">
//           <div className="flex flex-col">
//             <span className="text-lg font-bold text-gray-900 dark:text-white">
//               {formattedPrice}
//             </span>
//             {result?.marketingPrice &&
//               !result?.condition?.includes("Refurbished") &&
//               result?.marketingPrice?.originalPrice?.currency && (
//                 <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
//                   {`${
//                     result?.marketingPrice.originalPrice.currency === "USD"
//                       ? "$"
//                       : result?.marketingPrice.originalPrice.currency
//                   }${result?.marketingPrice.originalPrice.value}`}
//                 </span>
//               )}
//           </div>
//           {result?.seller && (
//             <div className="flex flex-col items-end">
//               <span className="text-xs flex gap-1 items-center">
//                 {/* <button
//                   onClick={(e) => handleToggleSave(e, "seller")}
//                   title={
//                     isSaved.seller ? "Remove seller from saved" : "Save seller"
//                   }
//                   className={` z-40 hover:scale-125 text-xs rounded-full  ${
//                     isSaved.seller
//                       ? "text-blue-700 dark:text-red-300 bg-white dark:bg-light-dark hover:bg-red-50"
//                       : "text-black/60 dark:text-main-white bg-white dark:bg-light-dark hover:bg-gray-100"
//                   }`}
//                 >
//                   {isSaved.seller ? <FaHeart /> : <FaRegHeart />}
//                 </button> */}

//                 <a
//                   target="_blank"
//                   href={`/ebay-search-by-seller?sellers=${result?.seller.username}&site=${defaultSite}`}
//                   className="underline text-gray-600  dark:text-gray-300 font-medium"
//                 >
//                   {result?.seller.username}
//                 </a>
//               </span>
//               <div className="flex items-center gap-1 mt-1">
//                 <span className="text-xs font-semibold text-blue-600 dark:text-gray-400">
//                   {result?.seller.feedbackPercentage}%
//                 </span>
//                 <svg
//                   className="w-3 h-3 text-blue-500"
//                   fill="currentColor"
//                   viewBox="0 0 20 20"
//                 >
//                   <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                 </svg>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="flex flex-wrap gap-2 mb-4">
//           {result?.condition && result?.condition !== "Unspecified" && (
//             <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-gray-300 border border-blue-200 dark:border-blue-700">
//               {result?.condition}
//             </span>
//           )}
//           {result?.buyingOptions?.length > 1 && (
//             <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-gray-300 border border-blue-200 dark:border-blue-700">
//               {result?.buyingOptions[1] === "BEST_OFFER"
//                 ? "ACCEPTS OFFER"
//                 : result?.buyingOptions[1]}
//             </span>
//           )}
//           {result?.shippingOptions && result?.shippingOptions[0] && (
//             <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-light-dark text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
//               {getShippingCostDisplay(result.shippingOptions[0])}
//             </span>
//           )}
//         </div>

//         <div className="mt-auto space-y-3">
//           <div className="flex justify-between items-center">
//             <Link
//               title="View More Details on eBextractor"
//               prefetch={false}
//               className="text-blue-600 dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors duration-200"
//               href={`/ebay?itm=${result?.itemId}&site=${defaultSite}&title=${result?.title}`}
//               target="_blank"
//             >
//               Details
//             </Link>
//             {/* <Link
//               title="Check on Amazon"
//               prefetch={false}
//               className="text-blue-600 dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors duration-200"
//               href={`${
//                 ebaySiteToAmazonMapping[defaultSite]
//               }s?k=${encodeURIComponent(result?.title)}&tag=ebextractor0d-20`}
//               target="_blank"
//             >
//               Amazon
//             </Link> */}
//             <CheckOnOtherPlatformButton
//               title={result?.title}
//               imageUrl={result?.thumbnailImages?.[0]?.imageUrl}
//             />
//           </div>
//           <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
//             <EbayPriceAlertModal
//               itemId={result?.itemId}
//               imgUrl={
//                 (result?.thumbnailImages &&
//                   result?.thumbnailImages[0]?.imageUrl) ||
//                 ""
//               }
//               itemTitle={result?.title}
//               currentPrice={Number(result?.price.value || 0)}
//             />
//             <Link
//               role="div"
//               title={`You need to be signed-in to ${ebaySiteCodeToNameMapping[defaultSite]} to view this page`}
//               target="_blank"
//               className="text-blue-600 dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors duration-200"
//               href={`${
//                 ebaySiteUrlMapping[defaultSite]
//               }bin/purchaseHistory?item=${
//                 result?.itemId?.split("|")[1]
//               }&site=${defaultSite}&title=${result?.title}`}
//             >
//               Sold History
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
