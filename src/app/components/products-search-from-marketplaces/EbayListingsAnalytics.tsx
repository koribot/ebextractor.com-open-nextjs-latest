import { useSearchStore } from "@/app/store/marketplace-search/store";
import { useEbaySearchAnalytics } from "@/app/store/ebay-search-analytics/store";
import React, { useEffect, useMemo, useRef } from "react";
import { EbayItem } from "./types";
import { useAuthStore } from "@/app/store/auth/store";
import { Spinner } from "@/app/components/common/ui/Spinner";

interface PriceStats {
  average: number;
  lowest: number;
  highest: number;
  median: number;
  lowestCount: number;
  highestCount: number;
  medianCount: number;
}

interface Keyword {
  word: string;
  count: number;
}

interface PriceRange {
  range: string;
  count: number;
}

interface AnalyticsData {
  priceStats: PriceStats;
  totalListings: number;
  keywords: Keyword[];
  priceRanges: PriceRange[];
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
}

const EbayListingsAnalytics: React.FC<{ results?: EbayItem[] }> = ({
  results,
}: {
  results?: EbayItem[];
}) => {
  useEbaySearchAnalytics();
  const { ebayResults: _ebayResults } = useSearchStore();
  const { user, hydrateUser, isLoading } = useAuthStore();

  const ebayResults = useRef<EbayItem[]>(results || _ebayResults);

  // Calculate analytics data from actual eBay results
  const analyticsData: AnalyticsData = useMemo(() => {
    if (!ebayResults || ebayResults.current.length === 0) {
      return {
        priceStats: {
          average: 0,
          lowest: 0,
          highest: 0,
          median: 0,
          lowestCount: 0,
          highestCount: 0,
          medianCount: 0,
        },
        totalListings: 0,
        keywords: [],
        priceRanges: [],
      };
    }

    // Extract and parse prices
    const prices = ebayResults.current
      .map((item: EbayItem) => parseFloat(item.price.value))
      .filter((price: number) => !isNaN(price))
      .sort((a: number, b: number) => a - b);

    // Count occurrences of each price
    const priceCount: { [key: number]: number } = {};
    prices.forEach((price) => {
      priceCount[price] = (priceCount[price] || 0) + 1;
    });

    // Calculate price statistics with counts
    const lowest = prices.length > 0 ? prices[0] : 0;
    const highest = prices.length > 0 ? prices[prices.length - 1] : 0;
    const median =
      prices.length > 0
        ? prices.length % 2 === 0
          ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
          : prices[Math.floor(prices.length / 2)]
        : 0;

    const priceStats: PriceStats = {
      average:
        prices.length > 0
          ? Math.round(
              (prices.reduce((sum, price) => sum + price, 0) / prices.length) *
                100
            ) / 100
          : 0,
      lowest,
      highest,
      median,
      lowestCount: priceCount[lowest] || 0,
      highestCount: priceCount[highest] || 0,
      medianCount: priceCount[median] || 0,
    };

    // Extract keywords from titles
    const wordCount: { [key: string]: number } = {};
    ebayResults.current.forEach((item: EbayItem) => {
      const words = item.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(
          (word) =>
            word.length > 3 &&
            ![
              "with",
              "from",
              "this",
              "that",
              "they",
              "them",
              "were",
              "been",
              "have",
              "will",
              "your",
              "what",
              "when",
              "where",
              "more",
              "some",
              "like",
              "just",
              "only",
              "also",
              "very",
              "much",
              "many",
            ].includes(word)
        );

      words.forEach((word) => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
    });

    const keywords: Keyword[] = Object.entries(wordCount)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate price distribution using exact prices
    const exactPriceCount: { [key: string]: number } = {};
    prices.forEach((price) => {
      const priceKey = price.toFixed(2);
      exactPriceCount[priceKey] = (exactPriceCount[priceKey] || 0) + 1;
    });

    const priceRanges: PriceRange[] = Object.entries(exactPriceCount)
      .map(([price, count]) => ({
        range: price,
        count,
      }))
      .sort((a, b) => parseFloat(b.range) - parseFloat(a.range));

    return {
      priceStats,
      totalListings: ebayResults.current.length,
      keywords,
      priceRanges,
    };
  }, [ebayResults]);

  const StatCard = ({
    title,
    value,
    subtitle,
    color = "blue",
  }: StatCardProps) => (
    <div className="bg-white dark:bg-light-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-main-white">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );

  useEffect(() => {
    if (!user) {
      hydrateUser();
    }
  }, []);

  if (!ebayResults || ebayResults.current.length === 0) {
    return <div>{results?.length}</div>;
  }

  return (
    <div>
      <div className="h-full">
        {isLoading ? (
          <div className="relative z-[1002] bg-white dark:bg-dark rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center min-w-[300px]">
            <Spinner size={48} color="#4F46E5" className="mb-4" />
            <p className="text-gray-600 dark:text-main-white text-center">Loading analytics...</p>
          </div>
        ) : (
          <div className="relative z-[999] bg-white dark:bg-dark rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
            <div className="bg-blue-500 dark:bg-light-dark p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 mt-1">
                    Comprehensive insights from {analyticsData.totalListings}{" "}
                    listings
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Price Statistics */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-main-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 bg-green-500 rounded-full"></div>
                  Price Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    title="Average Price"
                    value={`${analyticsData.priceStats.average.toFixed(2)}`}
                    color="green"
                  />
                  <StatCard
                    title="Lowest Price"
                    value={`${analyticsData.priceStats.lowest.toFixed(2)}`}
                    subtitle={`${analyticsData.priceStats.lowestCount} item${
                      analyticsData.priceStats.lowestCount !== 1 ? "s" : ""
                    }`}
                    color="red"
                  />
                  <StatCard
                    title="Highest Price"
                    value={`${analyticsData.priceStats.highest.toFixed(2)}`}
                    subtitle={`${analyticsData.priceStats.highestCount} item${
                      analyticsData.priceStats.highestCount !== 1 ? "s" : ""
                    }`}
                    color="purple"
                  />
                  <StatCard
                    title="Median Price"
                    value={`${analyticsData.priceStats.median.toFixed(2)}`}
                    subtitle={`${analyticsData.priceStats.medianCount} item${
                      analyticsData.priceStats.medianCount !== 1 ? "s" : ""
                    }`}
                    color="blue"
                  />
                </div>
              </div>

              {/* Top Keywords */}
              {analyticsData.keywords.length > 0 && (
                <div className="mb-8">
                  <div className="text-lg font-semibold text-gray-800 dark:text-main-white mb-4 flex items-center gap-2 bg-white dark:bg-dark">
                    <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
                    <span className="flex justify-between w-full p-2">
                      <h3>Top Keywords</h3>
                      <h3>Occurence</h3>
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-light-dark rounded-xl max-h-[400px] overflow-y-auto very-small-scrollbar">
                    {analyticsData.keywords.map((keyword, index) => (
                      <div
                        key={keyword.word}
                        className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-800 dark:text-main-white capitalize ml-2">
                            {keyword.word}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-orange-100 dark:bg-orange-900/30 h-2 rounded-full overflow-hidden w-20">
                            <div
                              className="bg-orange-500 dark:bg-orange-400 h-full rounded-full"
                              style={{
                                width: `${
                                  analyticsData.keywords.length > 0
                                    ? (keyword.count /
                                        analyticsData.keywords[0].count) *
                                      100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 min-w-[2rem]">
                            {keyword.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Distribution */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-main-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                  Price Distribution
                </h3>
                <div className="bg-gray-50 dark:bg-light-dark rounded-xl p-4 overflow-y-scroll very-small-scrollbar max-h-[400px]">
                  {analyticsData.priceRanges.map((range, index) => {
                    const maxCount = Math.max(
                      ...analyticsData.priceRanges.map((r) => r.count)
                    );
                    return (
                      <div
                        key={range.range}
                        className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                      >
                        <span className="font-medium text-gray-800 dark:text-main-white">
                          {range.range}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-100 dark:bg-indigo-900/30 h-3 rounded-full overflow-hidden w-32">
                            <div
                              className="bg-indigo-500 dark:bg-indigo-400 h-full rounded-full"
                              style={{
                                width: `${
                                  maxCount > 0
                                    ? (range.count / maxCount) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 min-w-[2rem]">
                            {range.count}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            listings
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EbayListingsAnalytics;

// {!user && !isLoading && (
//       <>
//         <div
//           className="absolute inset-0 bg-black/85 transition-opacity w-full h-full z-[999]"
//           onClick={() => setIsEbayAnalyticsModalOpen(false)}
//         />
//         <div className="fixed inset-0 z-[1003] flex items-center justify-center p-4 pointer-events-none w-full h-full">
//           <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all pointer-events-auto">
//             <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-8 rounded-t-3xl relative overflow-hidden">
//               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
//               <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-4 -translate-x-4" />

//               <div className="relative z-10 text-center">
//                 <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
//                   <FaShieldAlt className="w-8 h-8 text-white" />
//                 </div>

//                 <h2 className="text-2xl font-bold text-white mb-2">
//                   Hey Buddy! 👋
//                 </h2>

//                 <p className="text-blue-100 text-sm">
//                   Account required for eBay Analytics
//                 </p>
//               </div>
//             </div>

//             <div className="p-8">
//               <div className="text-center mb-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-3">
//                   Why do we need this? 🤔
//                 </h3>

//                 <div className="space-y-3 text-left">
//                   <div className="flex items-start gap-3">
//                     <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
//                       <FaRobot className="w-4 h-4 text-red-600" />
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-800">
//                         I just want to know if you are a real human or not
//                       </p>
//                       <p className="text-xs text-gray-600">
//                         prevent unverified user from spamming the site
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
//                       <FaChartLine className="w-4 h-4 text-green-600" />
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-800">
//                         To deliver precise data
//                       </p>
//                       <p className="text-xs text-gray-600">
//                         So I can create features more accurately based on
//                         users’ preferences and activities
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-3">
//                 <a
//                   href={`/login${
//                     pathName !== "/"
//                       ? `?callback_url=${encodeURIComponent(
//                           pathName +
//                             (params.size > 0
//                               ? "?" + params.toString()
//                               : "")
//                         )}`
//                       : ""
//                   }`}
//                   className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
//                 >
//                   <FaUserPlus className="w-4 h-4" />
//                   Sign In / Create Account
//                   <IoSparkles className="w-4 h-4" />
//                 </a>

//                 <button
//                   onClick={() => setIsEbayAnalyticsModalOpen(false)}
//                   className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200"
//                 >
//                   Maybe Later
//                 </button>
//               </div>

//               {/* Additional Info */}
//               <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
//                 <div className="flex items-center gap-2 mb-2">
//                   <IoSparkles className="w-4 h-4 text-blue-600" />
//                   <span className="text-sm font-medium text-blue-800">
//                     Quick & Easy
//                   </span>
//                 </div>
//                 <p className="text-xs text-blue-700">
//                   Takes less than 30 seconds • No spam, we promise! • Free
//                   forever
//                 </p>
//                 <p className="text-xs text-yellow-700 mt-2">
//                   If you know html you can go to dev tools and disable the
//                   blur on it and see the actual analytics this is a client
//                   side logic, I will be moving this to sever side in the
//                   future
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </>
//     )}

// import { useSearchStore } from "@/app/store/marketplace-search/store";
// import { useEbaySearchAnalytics } from "@/app/store/ebay-search-analytics/store";
// import React, { useEffect, useMemo } from "react";
// import { EbayItem } from "./types";
// import { useAuthStore } from "@/app/store/auth/store";
// import { FaShieldAlt, FaUserPlus, FaRobot, FaChartLine } from "react-icons/fa";
// import { IoSparkles } from "react-icons/io5";
// import { MdSecurity } from "react-icons/md";
// import { Spinner } from "@/app/components/common/ui/Spinner";
// import { usePathname, useSearchParams } from "next/navigation";

// // Your existing Item interface

// interface PriceStats {
//   average: number;
//   lowest: number;
//   highest: number;
//   median: number;
//   lowestCount: number;
//   highestCount: number;
//   medianCount: number;
// }

// interface Keyword {
//   word: string;
//   count: number;
// }

// interface PriceRange {
//   range: string;
//   count: number;
// }

// interface AnalyticsData {
//   priceStats: PriceStats;
//   totalListings: number;
//   keywords: Keyword[];
//   priceRanges: PriceRange[];
// }

// interface StatCardProps {
//   title: string;
//   value: string;
//   subtitle?: string;
//   color?: string;
// }

// const EbayListingsAnalytics: React.FC = () => {
//   const { isEbayAnalyticsModalOpen, setIsEbayAnalyticsModalOpen } =
//     useEbaySearchAnalytics();
//   const { ebayResults } = useSearchStore();
//   const { user, hydrateUser, isLoading } = useAuthStore();

//   const params = useSearchParams();
//   const pathName = usePathname();

//   // Calculate analytics data from actual eBay results
//   const analyticsData: AnalyticsData = useMemo(() => {
//     if (!ebayResults || ebayResults.length === 0) {
//       return {
//         priceStats: {
//           average: 0,
//           lowest: 0,
//           highest: 0,
//           median: 0,
//           lowestCount: 0,
//           highestCount: 0,
//           medianCount: 0,
//         },
//         totalListings: 0,
//         keywords: [],
//         priceRanges: [],
//       };
//     }

//     // Extract and parse prices
//     const prices = ebayResults
//       .map((item: EbayItem) => parseFloat(item.price.value))
//       .filter((price: number) => !isNaN(price))
//       .sort((a: number, b: number) => a - b);

//     // Count occurrences of each price
//     const priceCount: { [key: number]: number } = {};
//     prices.forEach((price) => {
//       priceCount[price] = (priceCount[price] || 0) + 1;
//     });

//     // Calculate price statistics with counts
//     const lowest = prices.length > 0 ? prices[0] : 0;
//     const highest = prices.length > 0 ? prices[prices.length - 1] : 0;
//     const median =
//       prices.length > 0
//         ? prices.length % 2 === 0
//           ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
//           : prices[Math.floor(prices.length / 2)]
//         : 0;

//     const priceStats: PriceStats = {
//       average:
//         prices.length > 0
//           ? Math.round(
//               (prices.reduce((sum, price) => sum + price, 0) / prices.length) *
//                 100
//             ) / 100
//           : 0,
//       lowest,
//       highest,
//       median,
//       lowestCount: priceCount[lowest] || 0,
//       highestCount: priceCount[highest] || 0,
//       medianCount: priceCount[median] || 0,
//     };

//     // Extract keywords from titles
//     const wordCount: { [key: string]: number } = {};
//     ebayResults.forEach((item: EbayItem) => {
//       const words = item.title
//         .toLowerCase()
//         .replace(/[^a-z0-9\s]/g, "")
//         .split(/\s+/)
//         .filter(
//           (word) =>
//             word.length > 3 &&
//             ![
//               "with",
//               "from",
//               "this",
//               "that",
//               "they",
//               "them",
//               "were",
//               "been",
//               "have",
//               "will",
//               "your",
//               "what",
//               "when",
//               "where",
//               "more",
//               "some",
//               "like",
//               "just",
//               "only",
//               "also",
//               "very",
//               "much",
//               "many",
//             ].includes(word)
//         );

//       words.forEach((word) => {
//         wordCount[word] = (wordCount[word] || 0) + 1;
//       });
//     });

//     const keywords: Keyword[] = Object.entries(wordCount)
//       .map(([word, count]) => ({ word, count }))
//       .sort((a, b) => b.count - a.count);

//     // Calculate price distribution using exact prices
//     const exactPriceCount: { [key: string]: number } = {};
//     prices.forEach((price) => {
//       const priceKey = price.toFixed(2);
//       exactPriceCount[priceKey] = (exactPriceCount[priceKey] || 0) + 1;
//     });

//     const priceRanges: PriceRange[] = Object.entries(exactPriceCount)
//       .map(([price, count]) => ({
//         range: price,
//         count,
//       }))
//       .sort((a, b) => parseFloat(b.range) - parseFloat(a.range));

//     return {
//       priceStats,
//       totalListings: ebayResults.length,
//       keywords,
//       priceRanges,
//     };
//   }, [ebayResults]);

//   const StatCard = ({
//     title,
//     value,
//     subtitle,
//     color = "blue",
//   }: StatCardProps) => (
//     <div className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
//       <div className="flex items-center justify-between mb-2">
//         <h3 className="text-sm font-medium text-gray-600">{title}</h3>
//         <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
//       </div>
//       <p className="text-2xl font-bold text-gray-900">{value}</p>
//       {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
//     </div>
//   );

//   useEffect(() => {
//     // document.body.style.overflow = "hidden";
//     if (!user) {
//       hydrateUser();
//     }
//     // return () => {
//     //   document.body.style.overflow = "auto";
//     // };
//   }, []);

//   if (!ebayResults || ebayResults.length === 0) {
//     return null;
//   }

//   return (
//     <div>
//       {isEbayAnalyticsModalOpen && (
//         <div
//           style={{ zIndex: !user ? 999 : 1000 }}
//           className="fixed inset-0 flex items-center justify-center p-4"
//         >
//           {/* Blurred Analytics Background for All Users */}
//           <div
//             className="absolute inset-0 bg-black/50 transition-opacity"
//             onClick={() => setIsEbayAnalyticsModalOpen(false)}
//           />

//           {/* Show loading spinner while hydrating */}
//           {isLoading ? (
//             <div className="relative z-[1002] bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center min-w-[300px] min-h-[200px]">
//               <Spinner size={48} color="#4F46E5" className="mb-4" />
//               <p className="text-gray-600 text-center">Loading analytics...</p>
//             </div>
//           ) : (
//             // Only render analytics content when user exists
//             <div className="relative z-[999] bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
//               <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className="text-2xl font-bold">
//                       eBay Listings Analytics
//                     </h2>
//                     <p className="text-blue-100 mt-1">
//                       Comprehensive insights from {analyticsData.totalListings}{" "}
//                       listings
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => setIsEbayAnalyticsModalOpen(false)}
//                     className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
//                   >
//                     <svg
//                       className="w-6 h-6"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M6 18L18 6M6 6l12 12"
//                       />
//                     </svg>
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
//                 {/* Price Statistics */}
//                 <div className="mb-8">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                     <div className="w-2 h-6 bg-green-500 rounded-full"></div>
//                     Price Statistics
//                   </h3>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <StatCard
//                       title="Average Price"
//                       value={`${analyticsData.priceStats.average.toFixed(2)}`}
//                       color="green"
//                     />
//                     <StatCard
//                       title="Lowest Price"
//                       value={`${analyticsData.priceStats.lowest.toFixed(2)}`}
//                       subtitle={`${analyticsData.priceStats.lowestCount} item${
//                         analyticsData.priceStats.lowestCount !== 1 ? "s" : ""
//                       }`}
//                       color="red"
//                     />
//                     <StatCard
//                       title="Highest Price"
//                       value={`${analyticsData.priceStats.highest.toFixed(2)}`}
//                       subtitle={`${analyticsData.priceStats.highestCount} item${
//                         analyticsData.priceStats.highestCount !== 1 ? "s" : ""
//                       }`}
//                       color="purple"
//                     />
//                     <StatCard
//                       title="Median Price"
//                       value={`${analyticsData.priceStats.median.toFixed(2)}`}
//                       subtitle={`${analyticsData.priceStats.medianCount} item${
//                         analyticsData.priceStats.medianCount !== 1 ? "s" : ""
//                       }`}
//                       color="blue"
//                     />
//                   </div>
//                 </div>

//                 {/* Top Keywords */}
//                 {analyticsData.keywords.length > 0 && (
//                   <div className="mb-8">
//                     <div className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 bg-white dark:bg-light-dark">
//                       <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
//                       <span className="flex justify-between w-full p-2">
//                         <h3>Top Keywords</h3>
//                         <h3>Occurence</h3>
//                       </span>
//                     </div>
//                     <div className="bg-gray-50 rounded-xl max-h-[400px] overflow-y-auto very-small-scrollbar">
//                       {analyticsData.keywords.map((keyword, index) => (
//                         <div
//                           key={keyword.word}
//                           className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
//                         >
//                           <div className="flex items-center gap-3">
//                             {/* <span className="bg-orange-500 text-white text-sm font-bold w-[fit-content] p-2 h-6 rounded-full flex items-center justify-center">
//                               {index + 1}
//                             </span> */}
//                             <span className="font-medium text-gray-800 capitalize ml-2">
//                               {keyword.word}
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <div className="bg-orange-100 h-2 rounded-full overflow-hidden w-20">
//                               <div
//                                 className="bg-orange-500 h-full rounded-full"
//                                 style={{
//                                   width: `${
//                                     analyticsData.keywords.length > 0
//                                       ? (keyword.count /
//                                           analyticsData.keywords[0].count) *
//                                         100
//                                       : 0
//                                   }%`,
//                                 }}
//                               ></div>
//                             </div>
//                             <span className="text-sm font-semibold text-gray-600 min-w-[2rem]">
//                               {keyword.count}
//                             </span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Price Distribution */}
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                     <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
//                     Price Distribution
//                   </h3>
//                   <div className="bg-gray-50 rounded-xl p-4 overflow-y-scroll very-small-scrollbar max-h-[400px]">
//                     {analyticsData.priceRanges.map((range, index) => {
//                       const maxCount = Math.max(
//                         ...analyticsData.priceRanges.map((r) => r.count)
//                       );
//                       return (
//                         <div
//                           key={range.range}
//                           className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
//                         >
//                           <span className="font-medium text-gray-800">
//                             {range.range}
//                           </span>
//                           <div className="flex items-center gap-3">
//                             <div className="bg-indigo-100 h-3 rounded-full overflow-hidden w-32">
//                               <div
//                                 className="bg-indigo-500 h-full rounded-full"
//                                 style={{
//                                   width: `${
//                                     maxCount > 0
//                                       ? (range.count / maxCount) * 100
//                                       : 0
//                                   }%`,
//                                 }}
//                               ></div>
//                             </div>
//                             <span className="text-sm font-semibold text-gray-600 min-w-[2rem]">
//                               {range.count}
//                             </span>
//                             <span className="text-xs text-gray-500">
//                               listings
//                             </span>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Auth Prompt Overlay for Non-Users (only show when not loading and no user) */}

//         </div>
//       )}
//     </div>
//   );

// };

// export default EbayListingsAnalytics;

//       // {!user && !isLoading && (
//       //       <>
//       //         <div
//       //           className="absolute inset-0 bg-black/85 transition-opacity w-full h-full z-[999]"
//       //           onClick={() => setIsEbayAnalyticsModalOpen(false)}
//       //         />
//       //         <div className="fixed inset-0 z-[1003] flex items-center justify-center p-4 pointer-events-none w-full h-full">
//       //           <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all pointer-events-auto">
//       //             <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-8 rounded-t-3xl relative overflow-hidden">
//       //               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
//       //               <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-4 -translate-x-4" />

//       //               <div className="relative z-10 text-center">
//       //                 <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
//       //                   <FaShieldAlt className="w-8 h-8 text-white" />
//       //                 </div>

//       //                 <h2 className="text-2xl font-bold text-white mb-2">
//       //                   Hey Buddy! 👋
//       //                 </h2>

//       //                 <p className="text-blue-100 text-sm">
//       //                   Account required for eBay Analytics
//       //                 </p>
//       //               </div>
//       //             </div>

//       //             <div className="p-8">
//       //               <div className="text-center mb-6">
//       //                 <h3 className="text-lg font-semibold text-gray-800 mb-3">
//       //                   Why do we need this? 🤔
//       //                 </h3>

//       //                 <div className="space-y-3 text-left">
//       //                   <div className="flex items-start gap-3">
//       //                     <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
//       //                       <FaRobot className="w-4 h-4 text-red-600" />
//       //                     </div>
//       //                     <div>
//       //                       <p className="text-sm font-medium text-gray-800">
//       //                         I just want to know if you are a real human or not
//       //                       </p>
//       //                       <p className="text-xs text-gray-600">
//       //                         prevent unverified user from spamming the site
//       //                       </p>
//       //                     </div>
//       //                   </div>
//       //                   <div className="flex items-start gap-3">
//       //                     <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
//       //                       <FaChartLine className="w-4 h-4 text-green-600" />
//       //                     </div>
//       //                     <div>
//       //                       <p className="text-sm font-medium text-gray-800">
//       //                         To deliver precise data
//       //                       </p>
//       //                       <p className="text-xs text-gray-600">
//       //                         So I can create features more accurately based on
//       //                         users’ preferences and activities
//       //                       </p>
//       //                     </div>
//       //                   </div>
//       //                 </div>
//       //               </div>

//       //               <div className="space-y-3">
//       //                 <a
//       //                   href={`/login${
//       //                     pathName !== "/"
//       //                       ? `?callback_url=${encodeURIComponent(
//       //                           pathName +
//       //                             (params.size > 0
//       //                               ? "?" + params.toString()
//       //                               : "")
//       //                         )}`
//       //                       : ""
//       //                   }`}
//       //                   className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
//       //                 >
//       //                   <FaUserPlus className="w-4 h-4" />
//       //                   Sign In / Create Account
//       //                   <IoSparkles className="w-4 h-4" />
//       //                 </a>

//       //                 <button
//       //                   onClick={() => setIsEbayAnalyticsModalOpen(false)}
//       //                   className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200"
//       //                 >
//       //                   Maybe Later
//       //                 </button>
//       //               </div>

//       //               {/* Additional Info */}
//       //               <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
//       //                 <div className="flex items-center gap-2 mb-2">
//       //                   <IoSparkles className="w-4 h-4 text-blue-600" />
//       //                   <span className="text-sm font-medium text-blue-800">
//       //                     Quick & Easy
//       //                   </span>
//       //                 </div>
//       //                 <p className="text-xs text-blue-700">
//       //                   Takes less than 30 seconds • No spam, we promise! • Free
//       //                   forever
//       //                 </p>
//       //                 <p className="text-xs text-yellow-700 mt-2">
//       //                   If you know html you can go to dev tools and disable the
//       //                   blur on it and see the actual analytics this is a client
//       //                   side logic, I will be moving this to sever side in the
//       //                   future
//       //                 </p>
//       //               </div>
//       //             </div>
//       //           </div>
//       //         </div>
//       //       </>
//       //     )}
