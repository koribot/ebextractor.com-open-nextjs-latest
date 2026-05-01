import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaMagnifyingGlass } from "react-icons/fa6";
import LoadingSkeleton from "../common/skeleton/LoadingSkeleton";
import LoadingGrid from "./LoadingGrid";
import NoResults from "./NoResult";
import { useSearchParams } from "next/navigation";
import ImagePreview from "../common/ui/ImagePreview";
import DotdotdotLoading from "../common/ui/DotdotdotLoading";
import { amazonDefualtSiteToEbaySiteMapping } from "@/app/utils/amazonSiteMapping";
import AmazonPriceHistoryModal from "./AmazonPriceHistoryModal";
import { showModal } from "../common/modal/modal-provider";
import CheckOnOtherPlatformButton from "../common/ui/Buttons/CheckOnOtherPlatformButton";
import { noImg } from "@/app/contants/logo";

interface Ancestor {
  ContextFreeName: string;
  DisplayName: string;
  id: string;
  Ancestors?: Ancestor;
}

export interface Product {
  Items: Array<{
    ASIN: string;
    DetailPageURL: string;
    Images: {
      Primary: {
        Small: {
          URL: string;
        };
      };
    };
    ItemInfo: {
      Title: {
        DisplayValue: string;
      };
    };
    Offers?: {
      Listings: Array<{
        Price: {
          Amount: number;
          DisplayAmount: string;
          Savings?: {
            Percentage: number;
            Currency?: string;
            Amount?: number;
            DisplayAmount?: string;
          };
        };
      }>;
    };
    BrowseNodeInfo?: {
      BrowseNodes: Array<{
        Ancestor: Ancestor;
        ContextFreeName: string;
        DisplayName: string;
        Id: string;
        IsRoot: boolean;
        SalesRank?: number;
      }>;
      WebsiteSalesRank?: {
        ContextFreeName: string;
        DisplayName: string;
        SalesRank: number;
      };
    };
  }>;
  SearchURL: string;
  TotalResultCount: number;
}

interface AmazonResultCardProps {
  products: Product;
  defaultSite: string;
  handleLoadMore: () => void;
  hasNextPage: boolean;
  isLoading: boolean;
  searchParams: ReturnType<typeof useSearchParams>;
  searchTerm: string;
  searchUrlParam: string;
  isLoadingMore: boolean;
}

const AmazonResultCard: React.FC<AmazonResultCardProps> = ({
  products,
  defaultSite,
  isLoading,
  searchParams,
  handleLoadMore,
  hasNextPage,
  searchTerm,
  searchUrlParam,
  isLoadingMore,
}) => {
  function getLastAncestorDisplayName(node: any) {
    let current = node.Ancestor;
    while (current.Ancestor) {
      current = current.Ancestor;
    }
    return current.ContextFreeName;
  }

  const getSalesRankInfo = (item: Product["Items"][0]) => {
    const salesRanks = [];

    if (item.BrowseNodeInfo?.BrowseNodes) {
      const salesRankNode = item.BrowseNodeInfo.BrowseNodes.find(
        (node) => node.SalesRank !== undefined,
      );

      if (salesRankNode) {
        salesRanks.push({
          category: salesRankNode.ContextFreeName,
          rank: salesRankNode.SalesRank,
        });
      }
    }

    if (item.BrowseNodeInfo?.WebsiteSalesRank) {
      const mainCategorySalesRank = getLastAncestorDisplayName(
        item.BrowseNodeInfo.BrowseNodes[0],
      );
      salesRanks.push({
        category: mainCategorySalesRank,
        rank: item.BrowseNodeInfo.WebsiteSalesRank.SalesRank,
      });
    }

    return salesRanks;
  };

  return (
    <div className="flex flex-col w-full bg-white dark:bg-light-dark rounded-lg shadow-lg min-h-[fit-content]">
      <div className="p-5 w-full">
        {isLoading ? (
          <LoadingGrid />
        ) : products?.Items?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products?.Items?.map((item) => {
              const salesRankInfo = getSalesRankInfo(item);
              return (
                <div
                  key={item.ASIN}
                  className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group flex flex-col min-h-[350px] dark:bg-light-dark dark:border-gray-700 dark:border-2"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-50 group-hover:bg-gray-100 transition-colors duration-200">
                    <Image
                      src={
                        item.Images.Primary.Small.URL.replace(
                          "._SL75_",
                          "._SL400_",
                        ) || noImg
                      }
                      alt={item.ItemInfo.Title.DisplayValue}
                      width={300}
                      height={300}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      quality={15}
                    />
                    {item.Offers?.Listings[0]?.Price?.Savings && (
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {item?.Offers?.Listings[0].Price?.Savings?.Percentage}
                          % OFF
                        </span>
                      </div>
                    )}
                    <div className="absolute w-fit bottom-1/2 right-10">
                      <ImagePreview
                        src={item.Images.Primary.Small.URL.replace(
                          "._SL75_",
                          "._SL800_",
                        )}
                        alt={item.ItemInfo.Title.DisplayValue}
                        width={800}
                        height={800}
                        image_quality_when_modal_open={75}
                        Icon={FaMagnifyingGlass}
                        loading="lazy"
                        mode="icon-only"
                      />
                    </div>
                    <Link
                      prefetch={false}
                      href={item.DetailPageURL}
                      target="_blank"
                      className="absolute inset-0"
                    >
                      <span className="sr-only">View product details</span>
                    </Link>
                  </div>
                  <div className="pt-4 px-4 flex-grow">
                    <Link
                      prefetch={false}
                      href={item.DetailPageURL}
                      target="_blank"
                    >
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors duration-200 dark:text-light dark:group-hover:text-light dark:group-hover:underline">
                        {item.ItemInfo.Title.DisplayValue}
                      </h3>
                      <div className="space-y-2.5">
                        <div className="flex items-baseline justify-between">
                          <div className="flex flex-col">
                            {item.Offers?.Listings[0]?.Price && (
                              <>
                                <span className="text-lg font-semibold text-gray-900 dark:text-light">
                                  {item.Offers.Listings[0].Price.DisplayAmount}
                                </span>
                                {item.Offers.Listings[0].Price.Savings && (
                                  <span className="text-sm text-gray-500 line-through dark:text-gray-300">
                                    {(
                                      item.Offers.Listings[0].Price.Amount +
                                      (item.Offers.Listings[0].Price.Savings
                                        .Amount || 0)
                                    ).toFixed(2)}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {salesRankInfo.map((rank, index) =>
                            index === 0 ? (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700"
                              >
                                #{rank.rank} in {rank.category}
                              </span>
                            ) : (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700"
                              >
                                #{rank.rank} in {rank.category}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                  {/* <Link
                      prefetch={false}
                      className="text-blue-600 hover:underline flex justify-center mt-auto p-4 text-sm dark:text-light dark:underline"
                      href={`/amz?asin=${item.ASIN}&title=${encodeURIComponent(
                        item?.ItemInfo?.Title?.DisplayValue
                      )}&price=${encodeURIComponent(
                        item.Offers?.Listings[0]?.Price?.DisplayAmount || ""
                      )}&img=${encodeURIComponent(
                        item.Images.Primary.Small.URL.replace(
                          "._SL75_",
                          "._SL400_"
                        )
                      )}&site=${defaultSite}`}
                      target="_blank"
                    >
                      View More Details
                    </Link> */}
                  <div className="mt-2 space-y-1 px-4">
                    <div className="flex justify-between items-center">
                      <Link
                        title="View More Details"
                        prefetch={false}
                        className="text-blue-600 hover:underline flex justify-center mt-auto text-sm dark:text-light dark:underline"
                        href={`/amz?asin=${
                          item.ASIN
                        }&title=${encodeURIComponent(
                          item?.ItemInfo?.Title?.DisplayValue,
                        )}&price=${encodeURIComponent(
                          item.Offers?.Listings[0]?.Price?.DisplayAmount || "",
                        )}&img=${encodeURIComponent(
                          item.Images.Primary.Small.URL.replace(
                            "._SL75_",
                            "._SL400_",
                          ),
                        )}&site=${defaultSite}`}
                        target="_blank"
                      >
                        Details
                      </Link>
                      {/* <Link
                        title="Check on Ebay"
                        prefetch={false}
                        className="text-blue-600 px-4 dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors duration-200"
                        href={`${amazonDefualtSiteToEbaySiteMapping[defaultSite]}sch/i.html?_nkw=${item.ItemInfo.Title.DisplayValue}&campid=5339079461&customid=ebextractor&toolid=10049`}
                        target="_blank"
                      >
                        Ebay
                      </Link> */}
                      <CheckOnOtherPlatformButton
                        title={item.ItemInfo.Title.DisplayValue}
                        imageUrl={item.Images.Primary.Small.URL.replace(
                          "._SL75_",
                          "._SL400_",
                        )}
                      />
                    </div>
                    <div className="flex justify-between items-center pt-2 pb-2 border-t border-gray-100 dark:border-gray-700">
                      {/* <EbayPriceAlertModal
                          itemId={result?.itemId}
                          imgUrl={
                            (result?.thumbnailImages &&
                              result?.thumbnailImages[0]?.imageUrl) ||
                            ""
                          }
                          itemTitle={result?.title}
                          currentPrice={Number(result?.price.value || 0)}
                        /> */}

                      <button
                        className="text-blue-600 dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors duration-200"
                        onClick={() =>
                          showModal({
                            title: "Price History",
                            content: (
                              <AmazonPriceHistoryModal
                                asin={item.ASIN}
                                title={item.ItemInfo.Title.DisplayValue}
                              />
                            ),
                          })
                        }
                        type="button"
                      >
                        Price History
                      </button>
                      {/* <Link
                        role="div"
                        title={`See Price History`}
                        target="_blank"
                        className="text-blue-600 px-4  dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors duration-200"
                        href={`https://camelcamelcamel.com/product/${item.ASIN}`}
                      >
                        Price History
                      </Link> */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <NoResults
            searchParams={searchParams}
            searchTerm={searchTerm}
            searchUrlParam={searchUrlParam}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
          />
        )}
      </div>
      {!isLoading && hasNextPage && products?.Items?.length > 0 && (
        <div className="p-5 text-center flex items-center flex-col">
          <Link
            prefetch={false}
            href={products?.SearchURL || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex justify-center mt-auto p-4 text-sm dark:text-light dark:underline"
          >
            View all results on Amazon
          </Link>
          <button
            disabled={isLoadingMore !== null ? isLoadingMore : false}
            // className="mt-5 p-2 bg-greenish text-white flex justify-center text-center h-10 items-center w-full dark:bg-light-dark dark:border-2 dark:border-gray-700"
            onClick={handleLoadMore}
            className="mt-5 p-2 bg-blue-500 hover:bg-blue-600 text-white flex justify-center text-center h-10 items-center w-full rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-wait disabled:bg-blue-500"
          >
            {isLoadingMore /* From Uiverse.io by Javierrocadev */ ? (
              <DotdotdotLoading />
            ) : (
              "View More"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AmazonResultCard;
