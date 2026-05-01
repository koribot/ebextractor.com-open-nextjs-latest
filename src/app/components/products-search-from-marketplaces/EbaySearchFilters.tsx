"use client";

import { useSearchStore } from "@/app/store/marketplace-search/store";
import { useEbayFilterStore } from "@/app/store/ebay-search-filter/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { run } from "node:test";
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  use,
  useCallback,
} from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoClose, IoSearchOutline } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";
import { BiFilterAlt } from "react-icons/bi";

// Custom Icons using react-icons
const ClearIcon = ({ className = "" }: { className?: string }) => (
  <IoClose className={className} />
);

const StarIcon = ({
  className = "",
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) => (
  <AiFillStar
    className={`${className} ${filled ? "text-yellow-400" : "text-gray-300"}`}
  />
);

const SearchIcon = ({ className = "" }: { className?: string }) => (
  <IoSearchOutline className={className} />
);

const FilterIcon = ({ className = "" }: { className?: string }) => (
  <BiFilterAlt className={className} />
);

type DualRangeSliderProps = {
  applyFilter: () => void;
  addRouterPath: ({ path, value }: { path: string; value: string }) => void;
  deleteRouterPath: ({ path }: { path: string }) => void;
};

// Dual Range Slider Component
const DualRangeSlider = ({
  applyFilter,
  addRouterPath,
  deleteRouterPath,
}: DualRangeSliderProps) => {
  const { priceMin, priceMax, setPriceMin, setPriceMax } = useEbayFilterStore();
  const maxPrice = 1000;

  // Calculate percentages for visual display
  const minPercentage = (priceMin / maxPrice) * 100;
  const maxPercentage = (priceMax / maxPrice) * 100;

  // Create a debounced version of applyFilter
  const debouncedApplyFilter = useMemo(
    () => debounce(applyFilter, 300), // 300ms delay
    [applyFilter, priceMin, priceMax]
  );

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= priceMax) {
      setPriceMin(priceMax);
    } else {
      setPriceMin(value);
    }
    if (value > 0) {
      addRouterPath({ path: "priceMin", value: value.toString() });
    } else {
      deleteRouterPath({ path: "priceMin" });
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value <= priceMin) {
      setPriceMax(priceMin);
    } else {
      setPriceMax(value);
    }
    if (value > 0) {
      addRouterPath({ path: "priceMax", value: value.toString() });
    } else {
      deleteRouterPath({ path: "priceMax" });
    }
  };

  // Simple debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(), delay);
    };
  }
  return (
    <div className="relative">
      <div className="h-2 bg-gray-200 rounded-full relative">
        {/* Active range */}
        <div
          className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`,
            maxWidth: `${maxPercentage > 100 ? 100 - minPercentage : 100}%`,
            overflow: "hidden",
          }}
        />
      </div>

      {/* Range inputs container */}
      <div className="relative">
        {/* Min range input */}
        <input
          type="range"
          min="0"
          max={maxPrice}
          value={priceMin}
          onChange={handleMinChange}
          onMouseUp={debouncedApplyFilter}
          onTouchEnd={debouncedApplyFilter}
          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb z-10"
          style={{ zIndex: priceMin >= priceMax - 10 ? 5 : 1 }}
        />
        {/* Max range input */}
        <input
          type="range"
          min="0"
          max={maxPrice}
          value={priceMax}
          onChange={handleMaxChange}
          onMouseUp={debouncedApplyFilter}
          onTouchEnd={debouncedApplyFilter}
          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb z-10"
          style={{ zIndex: priceMax <= priceMin + 10 ? 5 : 2 }}
        />
      </div>

      <style jsx>{`
        .slider-thumb {
          pointer-events: none;
        }
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: white;
          border: 2px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          pointer-events: all;
          position: relative;
        }
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: white;
          border: 2px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          pointer-events: all;
        }
        .slider-thumb::-webkit-slider-track {
          background: transparent;
        }
        .slider-thumb::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

// Main Component
export default function EbaySearchFilters() {
  const {
    selectedCondition,
    priceMin,
    selectedSellers,
    selectedDiscounts,
    priceMax,
    isEbayFiltersModalOpen,
    setSelectedCondition,
    runEbayFilters,
    setSelectedDiscounts,
    setSelectedSellers,
    setPriceMin,
    setPriceMax,
    clearAllFilters,
    removeFilter,
    getActiveFilterCount,
    hasActiveFilters,
    setIsEbayFiltersModalOpen,
  } = useEbayFilterStore();
  const {
    isEbayLoading,
    isEbayLoadingMore,
    availableItemConditions,
    availableDiscounts,
    availableSellers,
    ebayResults,
    ebayUnfilteredResults,
    totalNumberOfItemsForthatSearchKeyword,
  } = useSearchStore();

  // Local state for text inputs
  const [minInput, setMinInput] = useState(priceMin.toString());
  const [maxInput, setMaxInput] = useState(priceMax.toString());
  const [sellerSearchQuery, setSellerSearchQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const pathname = usePathname();

  const addRouterPath = ({ path, value }: { path: string; value: string }) => {
    params.set(path, value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };
  const deleteRouterPath = ({ path }: { path: string }) => {
    params.delete(path);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Filter sellers based on search query
  const filteredSellers = useMemo(() => {
    return availableSellers.filter((seller) =>
      seller
        .split(":")[0]
        .toLowerCase()
        .includes(sellerSearchQuery.toLowerCase())
    );
  }, [sellerSearchQuery, isEbayLoading, isEbayLoadingMore]);

  // Handle key filtering for price inputs
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      [8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true)
    ) {
      return;
    }
    // Ensure that it's a number or decimal point and stop the keypress
    if (
      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105)
    ) {
      e.preventDefault();
    }
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string and valid decimal numbers
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setMinInput(value);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string and valid decimal numbers
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setMaxInput(value);
    }
  };

  // Update your handleMinBlur function
  const handleMinBlur = () => {
    const value = Number.parseFloat(minInput) || 0;
    const clampedValue = Math.max(0, Math.min(value, priceMax));
    setPriceMin(clampedValue);
    setMinInput(clampedValue.toString());
    // Pass the new value directly to runEbayFilters
    runEbayFilters();

    if (clampedValue === 0) {
      deleteRouterPath({ path: "priceMin" });
    }
    addRouterPath({
      path: "priceMin",
      value:
        clampedValue >= priceMax
          ? priceMax.toString()
          : clampedValue.toString(),
    });
  };

  // Update your handleMaxBlur function
  const handleMaxBlur = () => {
    const value = Number.parseFloat(maxInput) || 0;
    const clampedValue = Math.max(priceMin, value);
    setPriceMax(clampedValue);
    setMaxInput(clampedValue.toString());
    // Pass the new value directly to runEbayFilters
    runEbayFilters();

    if (clampedValue === 0) {
      deleteRouterPath({ path: "priceMax" });
    }
    addRouterPath({
      path: "priceMax",
      value:
        clampedValue <= priceMin
          ? priceMin.toString()
          : clampedValue.toString(),
    });
  };

  useEffect(() => {
    setMinInput(priceMin.toString());
    setMaxInput(priceMax.toString());
    if (priceMin === 0 && priceMax === 0) {
      runEbayFilters();
    }
  }, [priceMin, priceMax]);

  // for some reason zustand is not immediate in updating the state so we have to use a ref
  const temporary_holder_for_sellers_for_immediate_use = useRef<string[]>([]);
  const handleSellerToggle = (sellerName: string) => {
    setSelectedSellers((prev) =>
      prev.includes(sellerName)
        ? prev.filter((name) => name !== sellerName)
        : [...prev, sellerName]
    );
    temporary_holder_for_sellers_for_immediate_use.current =
      temporary_holder_for_sellers_for_immediate_use.current.includes(
        sellerName
      )
        ? temporary_holder_for_sellers_for_immediate_use.current.filter(
            (name) => name !== sellerName
          )
        : [
            ...temporary_holder_for_sellers_for_immediate_use.current,
            sellerName,
          ];
  };

  // for some reason zustand is not immediate in updating the state so we have to use a ref
  const temporary_holder_for_discounts_for_immediate_use = useRef<string[]>([]);
  const handleDiscountToggle = (discountValue: string) => {
    setSelectedDiscounts((prev) =>
      prev.includes(discountValue)
        ? prev.filter((value) => value !== discountValue)
        : [...prev, discountValue]
    );
    temporary_holder_for_discounts_for_immediate_use.current =
      temporary_holder_for_discounts_for_immediate_use.current.includes(
        discountValue
      )
        ? temporary_holder_for_discounts_for_immediate_use.current.filter(
            (value) => value !== discountValue
          )
        : [
            ...temporary_holder_for_discounts_for_immediate_use.current,
            discountValue,
          ];
  };

  const activeFilterCount = getActiveFilterCount();
  const totalActiveFilters = activeFilterCount + selectedDiscounts?.length;
  const isFiltersActive =
    hasActiveFilters() ||
    selectedSellers?.length > 0 ||
    selectedDiscounts?.length > 0;

  const handleClearAll = () => {
    params.delete("condition");
    params.delete("sellers");
    params.delete("discounts");
    params.delete("priceMin");
    params.delete("priceMax");
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
    clearAllFilters();
    temporary_holder_for_discounts_for_immediate_use.current = [];
    temporary_holder_for_sellers_for_immediate_use.current = [];
    setSelectedSellers([]);
    setSelectedDiscounts([]);
    runEbayFilters();
  };

  return (
    <div className="relative">
      {/* Floating Filter Button - Always visible at bottom */}
      {/* {isEbaySearchFilterPanelHidden && (
        <button
          title={`Show Filters | Active Filters: ${totalActiveFilters}`}
          onClick={() => setIsEbaySearchFilterPanelHidden(false)}
          className="fixed bottom-[14px] left-0 z-[1000] bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-full shadow-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 border-2 border-white dark:border-gray-700"
        >
          <FilterIcon className="w-5 h-5" /> Filters
          {totalActiveFilters > 0 && (
            <span className="bg-gray-700 dark:bg-gray-400 bg-opacity-20 text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
              {totalActiveFilters}
            </span>
          )}
        </button>
      )} */}

      {/* Modal Overlay */}
      {isEbayFiltersModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[1001]">
          <div
            className="absolute inset-0 bg-black/50 flex items-center justify-center min-h-screen p-4"
            onClick={(e) => {
              // Only close if clicking the backdrop itself, not the modal content
              if (e.target === e.currentTarget) {
                setIsEbayFiltersModalOpen(false);
              }
            }}
            style={{ zIndex: 1001 }}
          />
          {/* Modal Content */}
          <div className="relative z-[1001] flex items-center justify-center  p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-h-[90vh] flex flex-col rounded-2xl border border-gray-200 dark:border-gray-600 overflow-y-scroll very-small-scrollbar shadow-2xl">
              {/* Modal Close Button */}
              <button
                title="Hide Filter"
                onClick={() => setIsEbayFiltersModalOpen(false)}
                className="absolute top-0 right-0 z-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-2 rounded-full transition-colors shadow-lg"
              >
                <ClearIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Loading Overlay */}
              {(isEbayLoading || isEbayLoadingMore) && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-50 flex items-start justify-center rounded-2xl opacity-60">
                  <div className="flex flex-col items-center gap-4">
                    <AiOutlineLoading3Quarters className="w-8 h-8 mt-[10rem] text-blue-600 animate-spin" />
                  </div>
                </div>
              )}

              {/* Modal Content */}
              <div
                className={`flex flex-col h-full ${
                  isEbayLoading || isEbayLoadingMore
                    ? "pointer-events-none opacity-60"
                    : ""
                }`}
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r rounded-t-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <FilterIcon className="w-5 h-5 text-blue-600" />
                      Filters
                    </h2>
                    {isFiltersActive && (
                      <button
                        title="Clear all filters"
                        onClick={handleClearAll}
                        disabled={isEbayLoading || isEbayLoadingMore}
                        className="text-sm mr-12 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-2 px-3 py-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 border border-transparent hover:border-red-200 dark:hover:border-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ClearIcon className="w-4 h-4" />
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {/* Active Filters Summary */}
                    <div className="p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-700 shadow-sm">
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        Active Filters ({totalActiveFilters})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCondition &&
                          selectedCondition !== "Any Condition" && (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full font-medium border border-blue-200 dark:border-blue-700 shadow-sm">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              {selectedCondition}
                              <button
                                onClick={() => {
                                  removeFilter("condition");
                                  params.delete("condition");
                                  runEbayFilters();
                                }}
                                disabled={isEbayLoading || isEbayLoadingMore}
                                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ClearIcon className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                        {selectedSellers?.length > 0 && (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm rounded-full font-medium border border-green-200 dark:border-green-700 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            {selectedSellers?.length} Seller
                            {selectedSellers?.length > 1 ? "s" : ""}
                            <button
                              onClick={() => {
                                removeFilter("seller");
                                runEbayFilters();
                              }}
                              disabled={isEbayLoading || isEbayLoadingMore}
                              className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ClearIcon className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {selectedDiscounts?.length > 0 && (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-sm rounded-full font-medium border border-orange-200 dark:border-orange-700 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                            {selectedDiscounts?.length} Discount
                            {selectedDiscounts?.length > 1 ? "s" : ""}
                            <button
                              onClick={() => {
                                removeFilter("discount");
                                runEbayFilters();
                              }}
                              disabled={isEbayLoading || isEbayLoadingMore}
                              className="hover:bg-orange-200 dark:hover:bg-orange-800 rounded-full p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ClearIcon className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {(priceMin > 0 || priceMax > 0) && (
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm rounded-full font-medium border border-purple-200 dark:border-purple-700 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                            ${priceMin} - ${priceMax}
                            <button
                              onClick={() => {
                                removeFilter("price");
                                params.delete("priceMin");
                                params.delete("priceMax");
                                runEbayFilters();
                              }}
                              disabled={isEbayLoading || isEbayLoadingMore}
                              className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ClearIcon className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                    {ebayResults?.length > 0 && (
                      <div className="space-y-2 flex flex-col">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                          Filters apply to{" "}
                          {ebayUnfilteredResults?.length.toLocaleString()}
                          {" items "} out of{" "}
                          {totalNumberOfItemsForthatSearchKeyword}
                          {" results,"} which is why it may feel faster.
                        </span>
                        <span
                          role="button"
                          title="Go To View More Button"
                          className="underline w-[fit-content] cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                          onClick={() => {
                            window.scrollTo({
                              top: document.body.scrollHeight,
                              behavior: "smooth",
                            });
                            setIsEbayFiltersModalOpen(false);
                          }}
                        >
                          View More
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Scrollable Content */}
                <div className="px-6 py-6 space-y-8 flex-1 overflow-y-auto">
                  {/* Price Range */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                        <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                        Price Range
                      </label>
                      <div className="flex items-center gap-2 text-sm">
                        {priceMax === 0 && priceMin === 0 && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              i
                            </span>
                          </div>
                        )}
                        <span className="text-gray-600 dark:text-gray-400">
                          {priceMax === 0 && priceMin === 0 && (
                            <span className="flex items-center gap-2 text-nowrap">
                              <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium">
                                No Price filter applied
                              </span>
                              - showing all prices
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="px-2">
                        <DualRangeSlider
                          applyFilter={runEbayFilters}
                          addRouterPath={addRouterPath}
                          deleteRouterPath={deleteRouterPath}
                        />
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-3">
                          <span>$0</span>
                          <span>$1000+</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-gray-600 dark:text-gray-300 whitespace-nowrap font-medium">
                            Min:
                          </span>
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                              $
                            </span>
                            <input
                              type="text"
                              value={minInput}
                              onChange={handleMinInputChange}
                              onBlur={handleMinBlur}
                              onKeyDown={handleKeyPress}
                              disabled={isEbayLoading || isEbayLoadingMore}
                              className="w-full pl-6 pr-3 py-3 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-blue-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-gray-600 dark:text-gray-300 whitespace-nowrap font-medium">
                            Max:
                          </span>
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                              $
                            </span>
                            <input
                              type="text"
                              value={maxInput}
                              onChange={handleMaxInputChange}
                              onBlur={handleMaxBlur}
                              onKeyDown={handleKeyPress}
                              disabled={isEbayLoading || isEbayLoadingMore}
                              className="w-full pl-6 pr-3 py-3 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-blue-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              placeholder="1000"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Available Discounts */}
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                      <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                      Available Discounts
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-b from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 shadow-inner">
                      {/* Any-Discount Option */}
                      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="any-discount"
                            checked={selectedDiscounts.includes("Any-Discount")}
                            onChange={(e) => {
                              handleDiscountToggle("Any-Discount");
                              runEbayFilters();
                              if (
                                temporary_holder_for_discounts_for_immediate_use
                                  .current.length === 0 &&
                                !e.target.checked
                              ) {
                                deleteRouterPath({
                                  path: "discounts",
                                });
                                return;
                              }
                              addRouterPath({
                                path: "discounts",
                                value:
                                  temporary_holder_for_discounts_for_immediate_use.current.join(
                                    ","
                                  ),
                              });
                            }}
                            disabled={isEbayLoading || isEbayLoadingMore}
                            className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <label
                            htmlFor="any-discount"
                            className="cursor-pointer"
                          >
                            <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                              Any-Discount
                            </div>
                          </label>
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded-full">
                          All
                        </div>
                      </div>
                      {/* Individual Discounts */}
                      {availableDiscounts.map((discount, index) => (
                        <div
                          key={discount + index}
                          className={`flex items-center justify-between p-4 hover:bg-white dark:hover:bg-gray-700 transition-colors ${
                            index !== availableDiscounts?.length - 1
                              ? "border-b border-gray-100 dark:border-gray-600"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id={discount.split(":")[0].split("%")[0]}
                              checked={selectedDiscounts.includes(
                                discount.split(":")[0].split("%")[0]
                              )}
                              onChange={(e) => {
                                handleDiscountToggle(discount.split("%")[0]);
                                runEbayFilters();
                                if (
                                  temporary_holder_for_discounts_for_immediate_use
                                    .current?.length === 0
                                ) {
                                  deleteRouterPath({ path: "discounts" });
                                } else {
                                  addRouterPath({
                                    path: "discounts",
                                    value:
                                      temporary_holder_for_discounts_for_immediate_use.current.join(
                                        ","
                                      ),
                                  });
                                }
                              }}
                              disabled={
                                isEbayLoading ||
                                isEbayLoadingMore ||
                                selectedDiscounts.includes("Any-Discount")
                              }
                              className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <label
                              htmlFor={discount.split(":")[0]}
                              className={`cursor-pointer ${
                                selectedDiscounts.includes("Any-Discount")
                                  ? "text-gray-400"
                                  : ""
                              }`}
                            >
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {discount.split(":")[0]}
                              </div>
                            </label>
                          </div>
                          <div
                            className={`text-sm font-medium px-2 py-1 rounded-full ${
                              selectedDiscounts.includes("Any-Discount")
                                ? "text-gray-400 bg-gray-100 dark:bg-gray-600"
                                : "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600"
                            }`}
                          >
                            {discount.split(": ")[1].toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Item Condition */}
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                      <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                      Item Condition
                    </label>
                    <select
                      value={selectedCondition || ""}
                      onChange={(e) => {
                        setSelectedCondition(
                          e.target.value?.split(":")[0] || ""
                        );
                        runEbayFilters();
                        addRouterPath({
                          path: "condition",
                          value: e.target.value?.split(":")[0] || "",
                        });
                      }}
                      disabled={isEbayLoading || isEbayLoadingMore}
                      className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
                    >
                      {availableItemConditions.map((option, index) => (
                        <option key={index} value={option.split(":")[0]}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Available Sellers */}
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                      <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                      Available Sellers
                    </label>
                    {/* Search Input */}
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={sellerSearchQuery}
                        onChange={(e) => setSellerSearchQuery(e.target.value)}
                        disabled={isEbayLoading || isEbayLoadingMore}
                        placeholder="Search sellers..."
                        className="w-full pl-10 pr-10 py-3 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      {sellerSearchQuery && (
                        <button
                          onClick={() => setSellerSearchQuery("")}
                          disabled={isEbayLoading || isEbayLoadingMore}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ClearIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-b from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 shadow-inner">
                      {filteredSellers?.length === 0 && sellerSearchQuery ? (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                          <SearchIcon className="w-8 h-8 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                          No sellers found for "{sellerSearchQuery}"
                        </div>
                      ) : (
                        filteredSellers.map((seller, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-4 hover:bg-white dark:hover:bg-gray-700 transition-colors ${
                              index !== filteredSellers?.length - 1
                                ? "border-b border-gray-100 dark:border-gray-600"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id={seller.split(":")[0]}
                                checked={selectedSellers.includes(
                                  seller.split(":")[0]
                                )}
                                onChange={(e) => {
                                  handleSellerToggle(seller.split(":")[0]);
                                  runEbayFilters();
                                  if (
                                    temporary_holder_for_sellers_for_immediate_use
                                      .current?.length === 0
                                  ) {
                                    deleteRouterPath({ path: "sellers" });
                                  } else {
                                    addRouterPath({
                                      path: "sellers",
                                      value:
                                        temporary_holder_for_sellers_for_immediate_use.current.join(
                                          ","
                                        ),
                                    });
                                  }
                                }}
                                disabled={isEbayLoading || isEbayLoadingMore}
                                className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <label
                                htmlFor={seller.split(":")[0]}
                                className="cursor-pointer"
                              >
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {seller.split(":")[0]}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {seller.split(":")[3]} items
                                </div>
                              </label>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                              <StarIcon
                                className="w-3 h-3 text-yellow-400"
                                filled
                              />
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {seller.split(":")[2]}%
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
