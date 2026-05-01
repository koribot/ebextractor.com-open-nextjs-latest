"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { encodeTextToURI } from "@/app/utils/encodeTextToURI";
import AffliateDisclosure from "../affilate-disclosure/AffliateDisclosure";
import ImagePreview from "../common/ui/ImagePreview";
import { logger } from "@/app/utils/logger";
import { parseAmazonSearchResult } from "@/app/utils/parseAmazonSearchResult";
import { useSearchStore } from "@/app/store/marketplace-search/store";
import LoadingGrid from "../products-search-from-marketplaces/LoadingGrid";
import { WHAT_AMAZON_API_WE_ARE_USING } from "@/app/contants/amazon-api-we-are-using";
import { MARKETPLACE_TO_COUNTRY } from "@/app/utils/amazonSiteMapping";
import { api_paths } from "@/app/contants/api-paths";

type SearchHandlerProps = {
  origin: string;
  title: string;
  img: string;
};

type resultsType = {
  img: string | null;
  title: string | null;
  asin: string | null;
  href: string | null;
  price: string | null;
  typicalPrice: string | null;
};
interface Ancestor {
  ContextFreeName: string;
  DisplayName: string;
  id: string;
  Ancestors?: Ancestor;
}

interface resultsTypePAAPI {
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

// Product Card Component
// function ProductCard({ product }: { product: any }) {
//   logger.debug.log(product);
//   const { defaultAmazonSite } = useSearchStore();
//   const discountPercent =
//     product.typicalPrice && product.price
//       ? Math.round(
//           (1 -
//             parseFloat(product.price.replace("$", "")) /
//               parseFloat(product.typicalPrice.replace("$", ""))) *
//             100
//         )
//       : 0;
//   const typicalPriceContainsTypical =
//     product?.typicalPrice?.includes("Typical:");
//   let originalPrice = null;
//   if (typicalPriceContainsTypical) {
//     const typicalMatch = product?.typicalPrice?.match(
//       /Typical:\s*\$(\d+\.\d+)/
//     );
//     if (typicalMatch) {
//       originalPrice = `$${typicalMatch[1]}`;
//     }
//   }
//   const price =
//     product.price === "Price not available"
//       ? "Check Price on Amazon"
//       : product.price;

//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
//       <div className="relative">
//         {originalPrice && (
//           <div className="absolute top-3 right-3 z-40">
//             <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold bg-red-600 dark:bg-red-700 text-white shadow-sm">
//               SALE
//             </span>
//           </div>
//         )}
//         <img
//           src={product.img}
//           alt={product.title}
//           className="w-full h-48 object-cover rounded-t-lg"
//           onError={(e) => {
//             e.currentTarget.src =
//               "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iI0Q1RDdEQSIvPgo8L3N2Zz4K";
//           }}
//         />
//         {discountPercent > 0 && (
//           <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
//             {discountPercent}% OFF
//           </div>
//         )}
//       </div>

//       <div className="p-4">
//         <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[2.5rem]">
//           {product.title}
//         </h3>

//         <div className="flex items-center justify-between mb-3">
//           <div className="flex flex-col">
//             <span className="text-lg font-bold text-green-600 dark:text-green-400">
//               {product.price}
//             </span>
//             {originalPrice && (
//               <span className="text-sm text-gray-500 line-through">
//                 {originalPrice}
//               </span>
//             )}
//           </div>
//           {originalPrice && (
//             <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-gray-300 border border-red-200 dark:border-red-700">
//               On Sale
//             </span>
//           )}
//         </div>

//         <a
//           href={`https://${defaultAmazonSite}${product.href}`}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2"
//         >
//           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
//             <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
//             <path d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z" />
//           </svg>
//           <span>View on Amazon</span>
//           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
//             <path d="M14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14ZM19 19H5V5H12V3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V12H19V19Z" />
//           </svg>
//         </a>
//       </div>
//     </div>
//   );
// }
function ProductCard({ product }: { product: any }) {
  const { defaultAmazonSite } = useSearchStore();

  // 🔑 Normalize fields depending on structure
  const asin = product?.asin || product?.ASIN || null;

  const href = product?.href || product?.DetailPageURL || "";

  const img =
    product?.img ||
    product?.Images?.Primary?.Small?.URL.replace("._SL75_", "._SL400_") ||
    "";

  const title = product?.title || product?.ItemInfo?.Title?.DisplayValue || "";

  const price =
    product?.price ||
    product?.Offers?.Listings?.[0]?.Price?.DisplayAmount ||
    "Price not available";

  const typicalPrice =
    product?.typicalPrice ||
    product?.Offers?.Listings?.[0]?.Price?.Savings?.DisplayAmount ||
    null;

  // 🔑 Handle discount if both prices exist
  const discountPercent =
    typicalPrice && price && price !== "Price not available"
      ? Math.round(
          (1 -
            parseFloat(price.replace(/[^0-9.]/g, "")) /
              parseFloat(typicalPrice.replace(/[^0-9.]/g, ""))) *
            100,
        )
      : 0;

  const typicalPriceContainsTypical = typicalPrice?.includes("Typical:");
  let originalPrice = null;
  if (typicalPriceContainsTypical) {
    const typicalMatch = typicalPrice?.match(/Typical:\s*\$(\d+\.\d+)/);
    if (typicalMatch) {
      originalPrice = `$${typicalMatch[1]}`;
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
      <div className="relative">
        {originalPrice && (
          <div className="absolute top-3 right-3 z-40">
            <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold bg-red-600 dark:bg-red-700 text-white shadow-sm">
              SALE
            </span>
          </div>
        )}
        <img
          src={img}
          alt={title}
          className="w-full h-48 object-cover rounded-t-lg"
          onError={(e) => {
            e.currentTarget.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iI0Q1RDdEQSIvPgo8L3N2Zz4K";
          }}
        />
        {discountPercent > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {discountPercent}% OFF
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[2.5rem]">
          {title}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {price}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {originalPrice}
              </span>
            )}
          </div>
          {originalPrice && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-gray-300 border border-red-200 dark:border-red-700">
              On Sale
            </span>
          )}
        </div>

        <a
          // href={`https://${defaultAmazonSite}${href}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>View on Amazon</span>
        </a>
      </div>
    </div>
  );
}

export function RedirectHandler({ origin, title, img }: SearchHandlerProps) {
  const [href, setHref] = useState("");
  const [isClicked, setIsClicked] = useState(false);
  const { paapiStatus } = useSearchStore();
  const [results, setResults] = useState<resultsType[] | resultsTypePAAPI[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  const handleSearchClick = () => {
    setIsClicked(true);
  };

  const fetchListings = async (option?: string) => {
    const cleanOrigin = origin
      .trim() // remove leading/trailing spaces
      .replace(/^([a-z]+:)?\/\//i, "") // remove protocol
      .replace(/\/+$/, "") // remove trailing slashes
      .replace(/\/+/g, ""); // remove remaining slashes
    const response = await fetch(
      `${api_paths.amazon_search_pa_api}?q=${encodeTextToURI(title)}&marketplace=${
        MARKETPLACE_TO_COUNTRY[cleanOrigin]
      }`,
    );
    const data: any = await response.json();
    if (response.status !== 200) {
      logger.debug.log(cleanOrigin);
      const response = await fetch(
        `${api_paths.get_amazon_html}?q=${encodeTextToURI(title)}&siteamz=${cleanOrigin}`,
      );
      const data: any = await response.text();
      let parsedData = parseAmazonSearchResult(data, origin);
      let counter = 0;
      while (parsedData.length == 0 && counter <= 5) {
        const res = await fetch(
          `${api_paths.get_amazon_html}?q=${encodeTextToURI(
            title,
          )}&siteamz=${cleanOrigin}`,
        );
        const data: any = await res.text();
        parsedData = parseAmazonSearchResult(data, origin);
        counter++;
      }
      logger.debug.log(parsedData);
      setResults(parsedData);
      setIsLoading(false);
      return data;
    }
    setIsLoading(false);
    setIsLoading(false);
    setResults(data?.SearchResult?.Items || []);
    return data;
  };

  useEffect(() => {
    setHref(window.location.href);
    fetchListings();
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center justify-start font-sans  dark:bg-dark-gray transition-colors">
      <div className="w-full max-w-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden mb-2">
        <div className="px-6 pt-2">
          {img && (
            <div className="flex justify-center mb-6 max-h-[200px] mx-auto">
              <ImagePreview
                onHoverTitle={"Link To Amazon | " + title}
                href={`${origin}s?k=${encodeTextToURI(
                  title,
                )}&tag=ebextractor0d-20`}
                onClick={handleSearchClick}
                src={img}
                alt={title}
                itemTitle={title}
                width={200}
                height={200}
                image_quality_for_preview={15}
                image_quality_when_modal_open={100}
              />
            </div>
          )}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Searching for:
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                readOnly
                className="w-full text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5"
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
          </div>
          <div className="mb-6 flex justify-center">
            {/* &asc_refurl=${encodeURIComponent(href)} */}
            <a
              href={`${origin}s?k=${encodeTextToURI(
                title,
              )}&tag=ebextractor0d-20`}
              onClick={handleSearchClick}
              className="w-full text-center p-2 rounded-lg font-semibold text-lg transition-all duration-300 transform bg-blue-600 text-white shadow-lg hover:shadow-xl"
            >
              {isClicked ? "Opening Amazon..." : "Check Now on Amazon"}
            </a>
          </div>
        </div>
      </div>
      <div className="w-full max-w-6xl">
        <div className="text-center mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                      Searching for "{title}"...
                    </div>
                  ) : (
                    `${results.length} results found for "${title}"`
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500">Sorted by relevance</div>
            </div>
          </div>
        </div>
        {isLoading ? (
          <LoadingGrid />
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No results found on eBextractor try checking it on amazon directly
            </h3>
          </div>
        )}
        {results.length > 0 && (
          <div className="mt-12 bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
            <AffliateDisclosure />
          </div>
        )}
      </div>
    </div>
  );
}
// "use client";
// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { encodeTextToURI } from "@/app/utils/encodeTextToURI";
// import AffliateDisclosure from "../affilate-disclosure/AffliateDisclosure";

// type RedirectHandlerProps = {
//   origin: string;
//   title: string;
// };

// export function RedirectHandler({ origin, title }: RedirectHandlerProps) {
//   const [progress, setProgress] = useState(0);
//   const router = useRouter();

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setProgress((prevProgress) => {
//         // if (prevProgress >= 100) {
//         //   clearInterval(interval)
//         //   // router.push(`${origin}s?k=${encodeTextToURI(title)}&tag=ebextractor0d-20&linkCode=ogi&th=1&psc=1`);
//         //   router.push(`${origin}s?k=${encodeTextToURI(title)}&tag=ebextractor0d-20`);
//         //   return 100
//         // }
//         if (prevProgress >= 100) {
//           clearInterval(interval);
//           window.location.href = `${origin}s?k=${encodeTextToURI(
//             title
//           )}&tag=ebextractor0d-20`;
//           return 100;
//         }
//         return prevProgress + 10;
//       });
//     }, 10);

//     return () => clearInterval(interval);
//   }, [origin, title]);

//   return (
//     <div className="h-full z-[-1] w-full flex flex-col items-center justify-start text-white font-sans p-4 dark:bg-light-dark">
//       <div className="w-full max-w-[600px] bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
//         <div className="p-6 sm:p-8">
//           <div className="text-center mb-6">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
//               <svg
//                 className="w-8 h-8 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                 />
//               </svg>
//             </div>
//             <h1 className="text-2xl sm:text-3xl font-bold mb-2">
//               Redirecting to Amazon
//             </h1>
//             <p className="text-gray-300 text-sm">
//               You will be redirected to Amazon shortly to search for your item
//             </p>
//           </div>

//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-300 mb-2">
//               Searching for:
//             </label>
//             <div className="relative">
//               <svg
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                 />
//               </svg>
//               <input
//                 type="text"
//                 value={title}
//                 readOnly
//                 className="w-full text-sm bg-gray-700 text-white rounded-lg py-3 px-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
//               />
//             </div>
//           </div>

//           <div className="mb-6">
//             <div className="flex justify-between mb-2">
//               <span className="text-sm font-medium">Preparing...</span>
//               <span className="text-sm font-medium">{progress}%</span>
//             </div>
//             <div className="w-full bg-gray-700 rounded-full h-3">
//               <div
//                 className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-300 ease-out"
//                 style={{ width: `${progress}%` }}
//               ></div>
//             </div>
//           </div>

//           <div className="bg-gray-700 rounded-lg p-4 mb-4">
//             <div className="flex items-start space-x-3">
//               <div className="flex-shrink-0">
//                 <svg
//                   className="w-5 h-5 text-orange-400 mt-0.5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//               </div>
//               <div>
//                 <h3 className="text-sm font-medium text-white mb-1">
//                   What&apos;s happening?
//                 </h3>
//                 <p className="text-xs text-gray-300">
//                   We&apos;re preparing your search query and will redirect you
//                   to Amazon&apos;s search results page. This helps you find the
//                   best deals and compare prices from multiple sellers.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gray-700 rounded-lg p-4 mb-4">
//             <div className="flex items-start space-x-3">
//               <div className="flex-shrink-0">
//                 <svg
//                   className="w-5 h-5 text-green-400 mt-0.5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//               </div>
//               <div>
//                 <h3 className="text-sm font-medium text-white mb-1">
//                   Why Amazon?
//                 </h3>
//                 <p className="text-xs text-gray-300">
//                   Amazon offers millions of products with competitive prices,
//                   fast shipping, and reliable customer service. Perfect for
//                   finding exactly what you&apos;re looking for.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center justify-center space-x-2 text-gray-400">
//             <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-orange-500"></div>
//             <span className="text-sm">Redirecting in a moment...</span>
//           </div>
//         </div>

//         <AffliateDisclosure />

//         <div className="bg-gray-900 p-4">
//           <div className="flex items-center justify-center space-x-2">
//             <svg
//               className="w-6 h-6 text-yellow-400"
//               viewBox="0 0 24 24"
//               fill="currentColor"
//             >
//               <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
//               <path d="M14.829 14.828a4.055 4.055 0 0 1-5.657 0 .999.999 0 1 1 1.414-1.414 2.082 2.082 0 0 0 2.828 0 .999.999 0 1 1 1.415 1.414z" />
//               <circle cx="9" cy="10" r="1.25" />
//               <circle cx="15" cy="10" r="1.25" />
//             </svg>
//             <span className="text-sm text-gray-300">
//               Powered by Ebextractor
//             </span>
//           </div>
//           <div className="text-center mt-2">
//             <p className="text-xs text-gray-400">
//               Connecting you to Amazon&apos;s marketplace for the best shopping
//               experience
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
