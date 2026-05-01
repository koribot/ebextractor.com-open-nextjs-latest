import { create } from "zustand";

interface SearchStore {
  isEbayAnalyticsModalOpen: boolean;
  setIsEbayAnalyticsModalOpen: (value: boolean) => void;
}

export const useEbaySearchAnalytics = create<SearchStore>()((set, get) => ({
  isEbayAnalyticsModalOpen: false,
  setIsEbayAnalyticsModalOpen: (value: boolean) =>
    set({ isEbayAnalyticsModalOpen: value }),
}));
