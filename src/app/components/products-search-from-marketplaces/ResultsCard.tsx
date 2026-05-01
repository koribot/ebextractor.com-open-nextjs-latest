import Link from "next/link";
import { AmazonResult, NoResultsProps } from "./types";
import React from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import ImagePreview from "../common/ui/ImagePreview";
import { ReadonlyURLSearchParams } from "next/navigation";
import DotdotdotLoading from "../common/ui/DotdotdotLoading";
import { amazonDefualtSiteToEbaySiteMapping } from "@/app/utils/amazonSiteMapping";
import { showModal } from "../common/modal/modal-provider";
import AmazonPriceHistoryModal from "./AmazonPriceHistoryModal";
import CheckOnOtherPlatformButton from "../common/ui/Buttons/CheckOnOtherPlatformButton";

export default function ResultsCard({
  title,
  isLoading,
  results,
  isLoadingMore,
  hasNextPage,
  handleLoadMore,
  defaultSite,
  searchTerm,
  searchUrlParam,
  searchParams,
}: {
  title: string;
  isLoading: boolean | null;
  results: AmazonResult[];
  isLoadingMore: boolean | null;
  hasNextPage: boolean;
  handleLoadMore: () => void;
  defaultSite: string;
  searchTerm: string;
  searchUrlParam: string;
  searchParams: ReadonlyURLSearchParams;
}) {
  return (
    <div className="flex w-full">
      <div className="flex flex-col p-6 w-full bg-white dark:bg-light-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 min-h-[fit-content]">
        {/* <div className="bg-white dark:bg-light-dark flex flex-col md:flex-row gap-4 pt-2 pb-6 mb-6 border-b border-gray-200 dark:border-gray-700 sticky top-[65px] z-[50]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        </div> */}

        {isLoading ? (
          <LoadingGrid />
        ) : results?.length > 0 ? (
          <AmazonResultsGrid results={results} defaultSite={defaultSite} />
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
            onClick={handleLoadMore}
          >
            {isLoadingMore ? <DotdotdotLoading color="white" /> : "View More"}
          </button>
        )}
      </div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="h-[fit-content]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {Array.from({ length: 20 }).map((_, index) => (
          <div
            key={index}
            className="min-h-[400px] bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse"
          >
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-xl"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AmazonResultsGrid({
  results,
  defaultSite,
}: {
  results: AmazonResult[];
  defaultSite: string;
}) {
  return (
    <div className="h-[fit-content]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {results.map((result, index) => (
          <AmazonResultItem
            key={index}
            result={result}
            defaultSite={defaultSite}
          />
        ))}
      </div>
    </div>
  );
}

function AmazonResultItem({
  result,
  defaultSite,
}: {
  result: AmazonResult;
  defaultSite: string;
}) {
  // Fix for Amazon title - if title contains $ symbols, use ASIN instead
  const displayTitle = result?.title?.includes("$")
    ? result.asin
    : result.title;
  // Extract typical price if available (for displaying original price)
  const typicalPriceContainsTypical =
    result?.typicalPrice?.includes("Typical:");
  let originalPrice = null;
  if (typicalPriceContainsTypical) {
    const typicalMatch = result?.typicalPrice?.match(/Typical:\s*\$(\d+\.\d+)/);
    if (typicalMatch) {
      originalPrice = `$${typicalMatch[1]}`;
    }
  }
  const price =
    result.price === "Price not available"
      ? "Check Price on Amazon"
      : result.price;
  const fallbackImage = "/placeholder.svg?height=300&width=300";

  return (
    <div className="w-full bg-white dark:bg-light-dark border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-200 dark:hover:border-gray-500 transition-all duration-300 group flex flex-col min-h-[400px]">
      <div className="relative overflow-y-auto small-scrollbar aspect-square overflow-hidden bg-gray-50 dark:bg-light-dark group-hover:bg-gray-100 dark:group-hover:bg-gray-600 transition-colors duration-200">
        {originalPrice && (
          <div className="absolute top-3 right-3 z-40">
            <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold bg-red-600 dark:bg-red-700 text-white shadow-sm">
              SALE
            </span>
          </div>
        )}
        <ImagePreview
          itemTitle={displayTitle}
          src={result.img || fallbackImage}
          alt={displayTitle}
          width={800}
          height={800}
          image_quality_for_preview={10}
          image_quality_when_modal_open={75}
          Icon={FaMagnifyingGlass}
          loading="lazy"
        />
        <Link
          title="Check it on Amazon"
          prefetch={false}
          href={`https://${defaultSite}${result.href}` || "#"}
          target="_blank"
          className="absolute inset-0"
        >
          <span className="sr-only">View product details</span>
        </Link>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <Link
          prefetch={false}
          title={displayTitle}
          href={`https://${defaultSite}${result.href}` || "#"}
          target="_blank"
          className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 leading-relaxed"
        >
          {displayTitle}
        </Link>

        <div className="flex items-baseline justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {price}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                {originalPrice}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-gray-300 border border-orange-200 dark:border-orange-700">
            Amazon
          </span>
          {originalPrice && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-gray-300 border border-red-200 dark:border-red-700">
              On Sale
            </span>
          )}
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex justify-between items-center">
            <Link
              prefetch={false}
              title="View More Details"
              className="text-blue-600 dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors duration-200"
              href={`/amz?asin=${result.asin}&title=${displayTitle}&price=${result.price}&img=${result.img}&site=${defaultSite}`}
              target="_blank"
            >
              Details
            </Link>
            {/* <Link
              title="Check on eBay"
              prefetch={false}
              className="text-blue-600 dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors duration-200"
              href={`${
                amazonDefualtSiteToEbaySiteMapping[defaultSite]
              }sch/i.html?_nkw=${encodeURIComponent(
                displayTitle
              )}&campid=5339079461&customid=ebextractor&toolid=10049`}
              target="_blank"
            >
              eBay
            </Link> */}
            <CheckOnOtherPlatformButton
              title={displayTitle}
              imageUrl={result.img || fallbackImage}
            />
            {/* <Link
              title="View Price History"
              prefetch={false}
              className="text-blue-600 dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors duration-200"
              href={`https://camelcamelcamel.com/search?sq=${result.asin}`}
              target="_blank"
            >
              Price History
            </Link> */}
          </div>
          {/* <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
            <Link
              title="View Price History"
              prefetch={false}
              className="text-blue-600 dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors duration-200"
              href={`https://camelcamelcamel.com/search?sq=${result.asin}`}
              target="_blank"
            >
              Price History
            </Link>
          </div> */}
          <button
            className="text-blue-600 dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors duration-200"
            onClick={() =>
              showModal({
                title: "Price History",
                content: (
                  <AmazonPriceHistoryModal
                    asin={result.asin}
                    title={displayTitle}
                  />
                ),
              })
            }
            type="button"
          >
            Price History
          </button>
        </div>
      </div>
    </div>
  );
}

function NoResults({
  searchParams,
  searchTerm,
  searchUrlParam,
  isLoading,
  isLoadingMore,
}: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      {!searchParams.get("q") ? (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <FaMagnifyingGlass className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Ready to Search
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Enter a product name to start exploring
            </p>
          </div>
        </div>
      ) : (
        searchParams.get("q") &&
        !isLoading &&
        searchUrlParam !== "" &&
        !isLoadingMore && (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <FaMagnifyingGlass className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Results Found
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                No matches found for &quot;{searchTerm}&quot;
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
