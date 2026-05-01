"use client";

import { api_paths } from "@/app/contants/api-paths";
import requests from "@/app/utils/http";
import { Toast } from "@/app/utils/toast";
import type React from "react";
import { useState, useMemo, useEffect, type ChangeEvent } from "react";

interface Price {
  value: string;
  currency?: string;
}

interface MarketingPrice {
  originalPrice?: Price;
  discountPercentage?: string;
}

interface ShippingOption {
  shippingCost?: Price;
  shippingCostType?: string;
}

interface EventItem {
  itemId: string;
  title: string;
  price: Price;
  image?: { imageUrl?: string };
  marketingPrice?: MarketingPrice;
  shippingOptions?: ShippingOption[];
  itemWebUrl: string;
  itemAffiliateWebUrl?: string;
}

interface EventItemsResponse {
  eventItems?: EventItem[];
}

interface EventData {
  eventId: string;
  description?: string;
  endDate?: string;
  applicableCoupons?: Array<{ redemptionCode?: string }>;
  eventWebUrl?: string;
  eventAffiliateWebUrl?: string;
}

interface PreviewEventItemsProps {
  event: EventData;
  site?: string;
}

type SortOption = "discount" | "price-low" | "price-high";

const safeParseFloat = (
  value: string | undefined | null,
  defaultValue: number = 0
): number => {
  if (value === undefined || value === null || value === "")
    return defaultValue;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

const PreviewEventItems: React.FC<PreviewEventItemsProps> = ({
  event,
  site = "EBAY_US",
}) => {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("discount");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchEventItems = async (): Promise<void> => {
      setLoading(true);
      const response = await requests.get<EventItemsResponse>(
        `${api_paths.ebay_get_event_items_by_id}?site=${site}&event_ids=${event?.eventId}`
      );
      if (response.status !== 200) {
        Toast().fire({
          icon: "error",
          title: "Error fetching event items",
          text: "Please try again later",
        });
        return;
      }
      const data = response.requestsData;
      setItems(data?.eventItems || []);
      setError(null);
      setLoading(false);
    };

    if (event?.eventId) {
      fetchEventItems();
    }
  }, [event?.eventId, site]);

  const filteredItems = useMemo<EventItem[]>(() => {
    let filtered = [...items];

    if (searchQuery?.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) => item?.title?.toLowerCase().includes(query) ?? false
      );
    }

    if (sortBy === "discount") {
      filtered.sort((a, b) => {
        const aDiscount = safeParseFloat(a?.marketingPrice?.discountPercentage);
        const bDiscount = safeParseFloat(b?.marketingPrice?.discountPercentage);
        return bDiscount - aDiscount;
      });
    } else if (sortBy === "price-low") {
      filtered.sort((a, b) => {
        const aPrice = safeParseFloat(a?.price?.value);
        const bPrice = safeParseFloat(b?.price?.value);
        return aPrice - bPrice;
      });
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => {
        const aPrice = safeParseFloat(a?.price?.value);
        const bPrice = safeParseFloat(b?.price?.value);
        return bPrice - aPrice;
      });
    }

    return filtered;
  }, [searchQuery, sortBy, items]);

  const DealCard: React.FC<{ item: EventItem }> = ({ item }) => {
    const currentPrice = safeParseFloat(item?.price?.value);
    const originalPrice = safeParseFloat(
      item?.marketingPrice?.originalPrice?.value
    );
    const discount = safeParseFloat(item?.marketingPrice?.discountPercentage);
    const savings =
      originalPrice > currentPrice
        ? (originalPrice - currentPrice).toFixed(2)
        : null;
    const shipping = item?.shippingOptions?.[0];
    const isShippingFree =
      !shipping ||
      safeParseFloat(shipping?.shippingCost?.value) === 0 ||
      shipping?.shippingCostType === "FREE";

    const href = item?.itemAffiliateWebUrl || item?.itemWebUrl;
    const validHref = href || "#";

    return (
      <a
        href={validHref}
        target={href ? "_blank" : undefined}
        rel={href ? "noopener noreferrer" : undefined}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl overflow-hidden hover:shadow-lg sm:hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/20 transition-all duration-300 group flex flex-col h-full"
      >
        {/* Image Container */}
        <div className="relative w-full aspect-square overflow-hidden bg-gray-50 dark:bg-gray-700">
          {discount > 0 && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-40 bg-red-500 text-white font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm shadow-lg">
              {discount}% OFF
            </div>
          )}
          <img
            src={item?.image?.imageUrl || "/placeholder.svg"}
            alt={item?.title || "Product image"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              const target = e.target as HTMLImageElement;
              if (target) {
                target.src = "/placeholder.svg?height=400&width=400";
              }
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          {/* Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 sm:mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {item?.title || "Untitled Product"}
          </h3>

          {/* Price Section */}
          <div className="mb-2 sm:mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {item?.price?.currency}{currentPrice.toFixed(2)}
              </span>
              {originalPrice > currentPrice && (
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-through">
                  {item?.price?.currency}{originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {savings && (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                Save {savings}
              </p>
            )}
          </div>

          {/* Shipping & Condition */}
          <div className="flex gap-1 sm:gap-2 flex-wrap">
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded">
              {isShippingFree
                ? "Free"
                : `$${safeParseFloat(shipping?.shippingCost?.value).toFixed(
                    2
                  )}`}
            </span>
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded">
              New
            </span>
          </div>
        </div>
      </a>
    );
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e?.target?.value || "");
  };

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSortBy((e?.target?.value as SortOption) || "discount");
  };

  const handleClearSearch = (): void => {
    setSearchQuery("");
  };

  const formattedEndDate = event?.endDate
    ? new Date(event.endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      className={`w-full lg:w-[1024px] mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 bg-white dark:bg-gray-900 min-h-screen`}
    >
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        {event?.description && (
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {event.description}
          </p>
        )}
        {formattedEndDate && (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-2">
            Ends {formattedEndDate}
          </p>
        )}
      </div>

      {/* Coupons Section */}
      {event?.applicableCoupons?.[0]?.redemptionCode && (
        <div className="mb-4 sm:mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Available Coupon:
          </p>
          <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-blue-400 dark:border-blue-600 rounded px-3 sm:px-4 py-2 inline-block">
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm sm:text-lg break-all">
              {event.applicableCoupons[0].redemptionCode}
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <svg
            className="absolute left-3 top-3 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500"
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
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Sort & Results Count */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-medium w-full sm:w-auto"
          >
            <option value="discount">Sort by Discount</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

          {/* Results Count */}
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
            {filteredItems.length} of {items.length} items
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl aspect-square animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6 text-center">
          <p className="text-red-700 dark:text-red-400 text-xs sm:text-sm">
            {error}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filteredItems?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {filteredItems.map((item, index) => (
            <DealCard key={item?.itemId || index} item={item} />
          ))}
        </div>
      )}

      {/* No Results State */}
      {!loading &&
        !error &&
        filteredItems?.length === 0 &&
        items?.length > 0 && (
          <div className="text-center py-12 sm:py-16">
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-lg mb-4">
              No items found matching your search
            </p>
            <button
              onClick={handleClearSearch}
              className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

      {/* Empty State - Go Directly Link */}
      {!loading && !error && items?.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-lg mb-4 sm:mb-6">
            Unable to retrieve items on this event
          </p>
          {event?.eventWebUrl || event?.eventAffiliateWebUrl ? (
            <a
              href={event?.eventAffiliateWebUrl || event?.eventWebUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-gray-800 dark:hover:bg-gray-500 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors"
            >
              Go Directly Instead →
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default PreviewEventItems;

// "use client"

// import type React from "react"
// import { useState, useMemo, useEffect, type ChangeEvent } from "react"
// import type { EventItem, EventItemsResponse, PreviewEventItemsProps, SortOption } from "./types"

// const PreviewEventItems: React.FC<PreviewEventItemsProps> = ({ event, site = "EBAY_US" }) => {
//   const [items, setItems] = useState<EventItem[]>([])
//   const [loading, setLoading] = useState<boolean>(true)
//   const [error, setError] = useState<string | null>(null)
//   const [searchQuery, setSearchQuery] = useState<string>("")
//   const [sortBy, setSortBy] = useState<SortOption>("discount")

//   useEffect(() => {
//     const fetchEventItems = async (): Promise<void> => {
//       try {
//         setLoading(true)
//         const response = await fetch(`${api_paths.ebay_get_event_items_by_id}?site=${site}&event_ids=${event.eventId}`)
//         if (!response.ok) throw new Error("Failed to fetch items")
//         const data: EventItemsResponse = await response.json()
//         setItems(data.eventItems || [])
//         setError(null)
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Failed to load items")
//         setItems([])
//       } finally {
//         setLoading(false)
//       }
//     }

//     if (event?.eventId) {
//       fetchEventItems()
//     }
//   }, [event, site])

//   const filteredItems = useMemo<EventItem[]>(() => {
//     let filtered = [...items]

//     if (searchQuery.trim()) {
//       const query = searchQuery.toLowerCase()
//       filtered = filtered.filter((item) => item.title.toLowerCase().includes(query))
//     }

//     // Sort
//     if (sortBy === "discount") {
//       filtered.sort((a, b) => {
//         const aDiscount = a.marketingPrice?.discountPercentage
//           ? Number.parseFloat(a.marketingPrice.discountPercentage)
//           : 0
//         const bDiscount = b.marketingPrice?.discountPercentage
//           ? Number.parseFloat(b.marketingPrice.discountPercentage)
//           : 0
//         return bDiscount - aDiscount
//       })
//     } else if (sortBy === "price-low") {
//       filtered.sort((a, b) => Number.parseFloat(a.price.value) - Number.parseFloat(b.price.value))
//     } else if (sortBy === "price-high") {
//       filtered.sort((a, b) => Number.parseFloat(b.price.value) - Number.parseFloat(a.price.value))
//     }

//     return filtered
//   }, [searchQuery, sortBy, items])

//   const DealCard: React.FC<{ item: EventItem }> = ({ item }) => {
//     const currentPrice = Number.parseFloat(item.price.value)
//     const originalPrice = item.marketingPrice?.originalPrice
//       ? Number.parseFloat(item.marketingPrice.originalPrice.value)
//       : null
//     const discount = item.marketingPrice?.discountPercentage
//       ? Number.parseFloat(item.marketingPrice.discountPercentage)
//       : null
//     const savings = originalPrice ? (originalPrice - currentPrice).toFixed(2) : null
//     const shipping = item.shippingOptions?.[0]
//     const isShippingFree =
//       !shipping || shipping?.shippingCost?.value === "0.00" || shipping?.shippingCostType === "FREE"

//     const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
//       e.preventDefault()
//     }

//     return (
//       <a
//         href={item.itemAffiliateWebUrl || item.itemWebUrl}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/20 transition-all duration-300 group flex flex-col h-full"
//       >
//         {/* Image Container */}
//         <div className="relative w-full aspect-square overflow-hidden bg-gray-50 dark:bg-gray-700">
//           {discount && (
//             <div className="absolute top-3 right-3 z-40 bg-red-500 text-white font-bold px-3 py-1.5 rounded-full text-sm shadow-lg">
//               {discount}% OFF
//             </div>
//           )}
//           <img
//             src={item.image?.imageUrl || "/placeholder.svg"}
//             alt={item.title}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//             onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
//               const target = e.target as HTMLImageElement
//               target.src = "/placeholder.svg?height=400&width=400"
//             }}
//           />
//           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
//         </div>

//         {/* Content */}
//         <div className="p-4 flex flex-col flex-grow">
//           {/* Title */}
//           <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
//             {item.title}
//           </h3>

//           {/* Price Section */}
//           <div className="mb-3">
//             <div className="flex items-baseline gap-2">
//               <span className="text-xl font-bold text-gray-900 dark:text-white">${currentPrice.toFixed(2)}</span>
//               {originalPrice && (
//                 <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
//                   ${originalPrice.toFixed(2)}
//                 </span>
//               )}
//             </div>
//             {savings && <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">Save ${savings}</p>}
//           </div>

//           {/* Shipping & Condition */}
//           <div className="flex gap-2 mb-4 flex-wrap">
//             <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded">
//               {isShippingFree ? "Free Shipping" : `$${shipping?.shippingCost?.value} Shipping`}
//             </span>
//             <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2.5 py-1 rounded">
//               New
//             </span>
//           </div>
//         </div>
//       </a>
//     )
//   }

//   const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
//     setSearchQuery(e.target.value)
//   }

//   const handleSortChange = (e: ChangeEvent<HTMLSelectElement>): void => {
//     setSortBy(e.target.value as SortOption)
//   }

//   const handleClearSearch = (): void => {
//     setSearchQuery("")
//   }

//   return (
//     <div className="w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white dark:bg-gray-900 min-h-screen">
//       {/* Header */}
//       <div className="mb-8">
//         {event?.description && <p className="text-gray-600 dark:text-gray-400">{event.description}</p>}
//         {event?.endDate && (
//           <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
//             Ends{" "}
//             {new Date(event.endDate).toLocaleDateString("en-US", {
//               month: "short",
//               day: "numeric",
//               year: "numeric",
//             })}
//           </p>
//         )}
//       </div>

//       {/* Coupons Section */}
//       {event?.applicableCoupons && event.applicableCoupons.length > 0 && event.applicableCoupons[0]?.redemptionCode && (
//         <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
//           <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Coupon:</p>
//           <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-blue-400 dark:border-blue-600 rounded px-4 py-2 inline-block">
//             <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-lg">
//               {event.applicableCoupons[0].redemptionCode}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Controls */}
//       <div className="mb-8 space-y-4">
//         {/* Search Bar */}
//         <div className="relative">
//           <svg
//             className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//             />
//           </svg>
//           <input
//             type="text"
//             placeholder="Search items..."
//             value={searchQuery}
//             onChange={handleSearchChange}
//             className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//           />
//         </div>

//         {/* Sort & Results Count */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <select
//             value={sortBy}
//             onChange={handleSortChange}
//             className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
//           >
//             <option value="discount">Sort by Discount</option>
//             <option value="price-low">Price: Low to High</option>
//             <option value="price-high">Price: High to Low</option>
//           </select>

//           {/* Results Count */}
//           <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
//             {filteredItems.length} of {items.length} items
//           </p>
//         </div>
//       </div>

//       {/* Loading State */}
//       {loading && (
//         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
//           {[...Array(8)].map((_, i) => (
//             <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-xl aspect-square animate-pulse" />
//           ))}
//         </div>
//       )}

//       {/* Error State */}
//       {error && !loading && (
//         <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
//           <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
//         </div>
//       )}

//       {/* Grid */}
//       {!loading && !error && filteredItems.length > 0 && (
//         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
//           {filteredItems.map((item, index) => (
//             <DealCard key={index} item={item} />
//           ))}
//         </div>
//       )}

//       {/* No Results State */}
//       {!loading && !error && filteredItems.length === 0 && items.length > 0 && (
//         <div className="text-center py-16">
//           <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No items found matching your search</p>
//           <button
//             onClick={handleClearSearch}
//             className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
//           >
//             Clear Search
//           </button>
//         </div>
//       )}

//       {/* Empty State - Go Directly Link */}
//       {!loading && !error && items.length === 0 && (
//         <div className="text-center py-16">
//           <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">Unable to retrieve items on this event</p>
//           {event?.eventWebUrl && (
//             <a
//               href={event?.eventAffiliateWebUrl || event?.eventWebUrl || "#"}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-block px-6 py-2 bg-blue-600  hover:bg-blue-700 dark:bg-gray-800 dark:hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors"
//             >
//               Go Directly Instead →
//             </a>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

// export default PreviewEventItems
