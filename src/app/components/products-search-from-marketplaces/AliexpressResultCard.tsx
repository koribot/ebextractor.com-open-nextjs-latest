"use client";

import Link from "next/link";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoFilterCircleOutline } from "react-icons/io5";
import LoadingGrid from "./LoadingGrid";
import NoResults from "./NoResult";
import ImagePreview from "../common/ui/ImagePreview";
import DotdotdotLoading from "../common/ui/DotdotdotLoading";
import { AliExpressProduct, AliExpressResultsSectionProps } from "./types";
import { showModal } from "../common/modal/modal-provider";
import CheckOnOtherPlatformButton from "../common/ui/Buttons/CheckOnOtherPlatformButton";

export default function AliExpressResultCard({
  isLoading,
  results,
  isLoadingMore,
  hasNextPage,
  handleLoadMore,
  searchTerm,
  searchUrlParam,
  searchParams,
}: AliExpressResultsSectionProps) {
  return (
    <div className="flex w-full">
      <div className="flex flex-col p-6 w-full bg-white dark:bg-light-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 min-h-[fit-content]">
        {/* <div className="bg-white dark:bg-light-dark flex flex-col md:flex-row gap-4 pt-2 pb-6 mb-6 border-b border-gray-200 dark:border-gray-700 sticky top-[65px] z-[50]">
          <button
            disabled={!!isLoading}
            title="Show Filters"
            style={{ cursor: `${!!isLoading ? "not-allowed" : "pointer"}` }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
          >
            <IoFilterCircleOutline className="w-5 h-5" />
            Filters
          </button>
        </div> */}

        {isLoading ? (
          <LoadingGrid />
        ) : results && results?.length > 0 ? (
          <AliExpressResultsGrid results={results as AliExpressProduct[]} />
        ) : (
          <NoResults
            searchParams={searchParams}
            searchTerm={searchTerm}
            searchUrlParam={searchUrlParam}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
          />
        )}

        {hasNextPage && results && results?.length > 0 && (
          <button
            title="View More Items"
            disabled={isLoadingMore !== null ? isLoadingMore : false}
            className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-wait disabled:bg-blue-600 flex justify-center items-center"
            onClick={() => handleLoadMore()}
          >
            {isLoadingMore ? <DotdotdotLoading color="white" /> : "View More"}
          </button>
        )}
      </div>
    </div>
  );
}

function AliExpressResultsGrid({ results }: { results: AliExpressProduct[] }) {
  return (
    <div className="h-[fit-content]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {results.map((result, index) => (
          <AliExpressResultItem key={index} result={result} />
        ))}
      </div>
    </div>
  );
}

function AliExpressResultItem({ result }: { result: AliExpressProduct }) {
  const otherPics = result?.product_small_image_urls?.string || [];
  const mainImage =
    result?.product_main_image_url || "/placeholder.svg?height=300&width=300";

  const salePrice = `${
    result?.target_sale_price_currency === "USD"
      ? "$"
      : result?.target_sale_price_currency
  }${result?.target_sale_price}`;

  const originalPrice =
    result?.target_original_price !== result?.target_sale_price
      ? `${
          result?.target_original_price_currency === "USD"
            ? "$"
            : result?.target_original_price_currency
        }${result?.target_original_price}`
      : null;

  const discountPercentage =
    result?.discount && result?.discount !== "0%" ? result?.discount : null;

  const handlePromoClick = () => {
    if (result?.promo_code_info) {
      const promoContent = (
        <div className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Promo Code:
              </span>
              <button
                onClick={(e) => {
                  navigator.clipboard.writeText(
                    result.promo_code_info!.promo_code,
                  );
                  const btn = e.currentTarget;
                  const originalText = btn.textContent;
                  btn.textContent = "Code Copied!";
                  btn.classList.add("bg-green-600");
                  btn.classList.remove("bg-orange-600", "hover:bg-orange-700");
                  setTimeout(() => {
                    btn.textContent = originalText;
                    btn.classList.remove("bg-green-600");
                    btn.classList.add("bg-orange-600", "hover:bg-orange-700");
                  }, 2000);
                }}
                className="text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded transition-colors"
              >
                Copy Code
              </button>
            </div>
            <div className="text-lg font-bold text-orange-700 dark:text-orange-300 mb-3">
              {result.promo_code_info.promo_code}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>
                <strong>Offer:</strong> {result.promo_code_info.code_value}
              </p>
              {result.promo_code_info.code_mini_spend && (
                <p>
                  <strong>Min Spend:</strong> $
                  {result.promo_code_info.code_mini_spend}
                </p>
              )}
              <p>
                <strong>Valid:</strong>{" "}
                {new Date(
                  result.promo_code_info.code_availabletime_start,
                ).toLocaleDateString()}{" "}
                -{" "}
                {new Date(
                  result.promo_code_info.code_availabletime_end,
                ).toLocaleDateString()}
              </p>
              <p>
                <strong>Remaining:</strong>{" "}
                {result.promo_code_info.code_quantity} uses
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Click the button above to copy the promo code, then apply it at
            checkout on AliExpress.
          </div>
        </div>
      );

      showModal({
        title: "Promo Code Details",
        content: promoContent,
      });
    }
  };

  return (
    <div className="w-full bg-white dark:bg-light-dark border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-200 dark:hover:border-gray-500 transition-all duration-300 group flex flex-col min-h-[400px]">
      <div className="relative overflow-y-auto small-scrollbar aspect-square overflow-hidden bg-gray-50 dark:bg-light-dark group-hover:bg-gray-100 dark:group-hover:bg-gray-600 transition-colors duration-200">
        {discountPercentage && (
          <div className="absolute top-3 right-3 z-40">
            <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold bg-red-600 dark:bg-red-700 text-white shadow-sm">
              {discountPercentage}
            </span>
          </div>
        )}

        <ImagePreview
          otherPics={otherPics}
          //   itemId={result?.product_id?.toString()}
          src={mainImage}
          alt={result?.product_title}
          width={800}
          height={800}
          image_quality_for_preview={10}
          image_quality_when_modal_open={75}
          Icon={FaMagnifyingGlass}
          loading="lazy"
          itemTitle={result?.product_title}
        />

        <Link
          title="Check it on AliExpress"
          prefetch={false}
          href={result?.promotion_link || result?.product_detail_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0"
        >
          <span className="sr-only">View product details</span>
        </Link>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <Link
          prefetch={false}
          title={result.product_title}
          href={result?.promotion_link || result?.product_detail_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 leading-relaxed"
        >
          {result?.product_title}
        </Link>

        <div className="flex items-baseline justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {salePrice}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                {originalPrice}
              </span>
            )}
          </div>

          {result?.shop_name && (
            <div className="flex flex-col items-end">
              <span
                title={`Shop: ${result?.shop_name}`}
                className="text-xs text-gray-600 dark:text-gray-300 font-medium truncate max-w-[100px]"
              >
                {result?.shop_name}
              </span>
              {result?.evaluate_rate && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs font-semibold text-blue-600 dark:text-gray-400">
                    {result?.evaluate_rate}
                  </span>
                  <svg
                    className="w-3 h-3 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {result?.lastest_volume > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-gray-300 border border-purple-200 dark:border-purple-700">
              {result?.lastest_volume} sold
            </span>
          )}

          {result?.second_level_category_name && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-light-dark text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
              {result?.second_level_category_name}
            </span>
          )}

          {result?.promo_code_info && (
            <button
              onClick={handlePromoClick}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-gray-300 border border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors cursor-pointer"
            >
              Promo Available
            </button>
          )}
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
            <Link
              title="View Store"
              prefetch={false}
              className="text-blue-600 dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors duration-200"
              href={result?.shop_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              Store
            </Link>
            <CheckOnOtherPlatformButton
              title={result?.product_title || ""}
              imageUrl={result?.product_main_image_url}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
