import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";
import { useSearchStore } from "../marketplace-search/store";
import { Item } from "@/app/ebay/types";

export interface EbaySearchFilterState {
  selectedCondition: string;
  selectedDiscounts: string[];
  selectedSellers: string[];
  priceMin: number;
  priceMax: number;
  listOfActiveFilters: string[];
  isEbayFiltersModalOpen: boolean;
  setIsEbayFiltersModalOpen: (value: boolean) => void;
  setSelectedCondition: (condition: string) => void;
  runEbayFilters: () => void;
  setSelectedSellers: Dispatch<SetStateAction<string[]>>;
  setSelectedDiscounts: Dispatch<SetStateAction<string[]>>;
  setPriceMin: (price: number) => void;
  setPriceMax: (price: number) => void;
  clearAllFilters: () => void;
  removeFilter: (filterType: string) => void;
  getActiveFilterCount: () => number;
  hasActiveFilters: () => boolean;
}

export const useEbayFilterStore = create<EbaySearchFilterState>((set, get) => ({
  // Initial state
  selectedCondition: "",
  selectedDiscounts: [],
  selectedSellers: [],
  seller: [],
  priceMin: 0,
  priceMax: 0,
  isEbayFiltersModalOpen: false,
  listOfActiveFilters:[],

  setIsEbayFiltersModalOpen(value) {
    set({ isEbayFiltersModalOpen: value });
  },
  // Actions
  setSelectedCondition: (selectedCondition) => set({ selectedCondition }),
  runEbayFilters: () => {
    const {
      selectedCondition,
      selectedSellers,
      selectedDiscounts,
      priceMin,
      priceMax,
    } = get();
    const { setEbayResults, ebayUnfilteredResults, setAvailableDiscounts } =
      useSearchStore.getState();

    const _temp = ebayUnfilteredResults?.filter((item: any) => {
      // Check condition filter
      const conditionMatches =
        !selectedCondition ||
        selectedCondition === "Any Condition" ||
        item.condition === selectedCondition;

      // Check seller filter
      const sellerMatches =
        selectedSellers.length === 0 ||
        selectedSellers.includes(item.seller.username);

      // Check discount filter
      let discountMatches = true;
      if (selectedDiscounts.length > 0) {
        if (selectedDiscounts.includes("Any-Discount")) {
          // If "Any-Discount" is selected, item must have a discount
          discountMatches = item?.marketingPrice ? true : false;
        } else {
          // Check if item's discount percentage matches selected discounts
          const itemDiscountPercentage =
            item?.marketingPrice?.discountPercentage;
          discountMatches = selectedDiscounts.includes(itemDiscountPercentage);
        }
      }

      // Check minimum price filter
      const minPriceMatches = priceMin <= 0 || item.price.value > priceMin;

      // Check maximum price filter
      const maxPriceMatches = priceMax <= 0 || item.price.value < priceMax;

      // Item passes all filters
      return (
        conditionMatches &&
        sellerMatches &&
        discountMatches &&
        minPriceMatches &&
        maxPriceMatches
      );
    });
    setEbayResults(_temp);
  },
  setSelectedSellers: (value) =>
    set({
      selectedSellers:
        typeof value === "function"
          ? (value as (prev: string[]) => string[])(get().selectedSellers)
          : value,
    }),
  setSelectedDiscounts: (value) =>
    set({
      selectedDiscounts:
        typeof value === "function"
          ? (value as (prev: string[]) => string[])(get().selectedDiscounts)
          : value,
    }),
  setPriceMin: (priceMin) => set({ priceMin }),
  setPriceMax: (priceMax) => set({ priceMax }),

  clearAllFilters: () => {
    const { runEbayFilters } = get();
    const url = new URL(window.location.href);
    const params = url.searchParams;
    params.delete("condition");
    params.delete("sellers");
    params.delete("discounts");
    params.delete("priceMin");
    params.delete("priceMax");
    window.history.replaceState(null, "", url.href);
    set({
      selectedCondition: "",
      selectedSellers: [],
      selectedDiscounts: [],
      priceMin: 0,
      priceMax: 0,
    });
    runEbayFilters();
  },

  removeFilter: (filterType) =>
    set((state) => {
      const url = new URL(window.location.href);
      const params = url.searchParams;
      switch (filterType) {
        case "condition":
          params.delete("condition");
          window.history.pushState(null, "", url.href);
          return { selectedCondition: "" };
        case "seller":
          params.delete("sellers");
          window.history.pushState(null, "", url.href);
          return { selectedSellers: [] };
        case "discount":
          params.delete("discounts");
          window.history.pushState(null, "", url.href);
          return { selectedDiscounts: [] };
        case "rating":
          return { rating: 0 };
        case "price":
          params.delete("priceMin");
          params.delete("priceMax");
          window.history.pushState(null, "", url.href);
          return { priceMin: 0, priceMax: 0 };
        default:
          return state;
      }
    }),

  // Computed values
  getActiveFilterCount: () => {
    const state = get();
    return [
      !!state.selectedCondition && state.selectedCondition !== "Any Condition",
      state.selectedSellers.length > 0,
      state.priceMin > 0 || state.priceMax > 0,
    ].filter(Boolean).length;
  },

  hasActiveFilters: () => {
    const state = get();
    return !!(
      (state.selectedCondition &&
        state.selectedCondition !== "Any Condition") ||
      state.selectedSellers.length > 0 ||
      state.selectedDiscounts.length > 0 ||
      state.priceMin > 0 ||
      state.priceMax > 0
    );
  },
}));
