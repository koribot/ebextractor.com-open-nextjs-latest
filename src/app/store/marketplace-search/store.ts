import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { parseAmazonSearchResult } from "@/app/utils/parseAmazonSearchResult";
import { encodeTextToURI } from "@/app/utils/encodeTextToURI";
import { ChangeEvent } from "react";
import {
  AliExpressProduct,
  EbayItem,
} from "@/app/components/products-search-from-marketplaces/types";
import requests from "@/app/utils/http";
import { useEbayFilterStore } from "../ebay-search-filter/store";
import { ebaySiteLocaleMapping } from "@/app/utils/ebaySiteMapping";
import { WHAT_AMAZON_API_WE_ARE_USING } from "@/app/contants/amazon-api-we-are-using";
import { logger } from "@/app/utils/logger";
import { MARKETPLACE_TO_COUNTRY } from "@/app/utils/amazonSiteMapping";
import { api_paths } from "@/app/contants/api-paths";
import { recentSearchesStorage } from "@/app/utils/IndexedDBManager";
import { IRecentSearchesData } from "@/app/model/RecentSearches";
import { xorEncode } from "@/app/utils/simpleObfuscator";
import { addRecentSearchesToIndexedDb } from "@/app/utils/recent-searches-utils/recent-searches-utils";
import kunsul from "kunsul";

const DEFAULT_SITES = {
  ebay: "EBAY_US",
  amazon: "amazon.com",
  aliexpress: "USD",
} as const;

// Types
interface MarketplaceState {
  checked: boolean;
  defaultVal: string;
}

interface SearchState {
  // Filter options
  availableDiscounts: string[];
  availableItemConditions: string[];
  availableSellers: string[];

  // UI state
  activeTabOnDisplay: "ebay" | "amazon" | "aliexpress";
  isEbayLoading: boolean;
  isAmazonLoading: boolean;
  isEbayLoadingMore: boolean;
  isEbayCollapsed: boolean;
  isAmazonCollapsed: boolean;
  isAliExpressLoading: boolean;
  isAliExpressLoadingMore: boolean;
  isAmazonLoadingMore: boolean;

  // Search data
  searchTerm: string;
  searchUrlParam: string;
  ebayResults: EbayItem[];
  searchKeywordType: string;
  ebayUnfilteredResults: EbayItem[];
  amazonResults: any;
  amazonResults2: any;
  aliexpressResults: AliExpressProduct[];
  paapiStatus: "WORKING" | "NOT_WORKING";

  // Marketplace settings
  mkState: {
    ebay: MarketplaceState;
    amazon: MarketplaceState;
    aliexpress: MarketplaceState;
  };
  defaultEbaySite: string;
  defaultAmazonSite: string;
  defaultAliexpressSite: string;

  // Pagination
  isEbayResHasNextPage: boolean;
  isAliExpressHasNextPage: boolean;
  isAmazonHasNextPage: boolean;
  aliexpressCurrentPage: number;
  amazonCurrentPage: number;
  totalNumberOfItemsForthatSearchKeyword: number;
}

interface SearchActions {
  // Basic setters
  setActiveTabOnDisplay: (tab: "ebay" | "amazon" | "aliexpress") => void;
  setSearchTerm: (term: string) => void;
  setSearchUrlParam: (param: string) => void;

  // Site setters
  setDefaultEbaySite: (event: ChangeEvent<HTMLSelectElement> | string) => void;
  setDefaultAmazonSite: (
    event: ChangeEvent<HTMLSelectElement> | string,
  ) => void;
  setDefaultAliexpressSite: (
    event: ChangeEvent<HTMLSelectElement> | string,
  ) => void;

  // Filter setters
  setAvailableDiscounts: (discounts: string[]) => void;
  setAvailableItemConditions: (conditions: string[]) => void;
  setAvailableSellers: (sellers: string[]) => void;
  setAllEbayFilterswithValues: (items: any) => void;

  // Results setters
  setEbayResults: (results: EbayItem[]) => void;
  setEbayUnfilteredResults: (results: EbayItem[]) => void;
  setAmazonResults: (results: any[]) => void;
  setAmazonResults2: (results: any[]) => void;

  // Loading state setters
  setIsEbayLoading: (loading: boolean) => void;
  setIsAmazonLoading: (loading: boolean) => void;
  setIsEbayLoadingMore: (loading: boolean) => void;
  setIsAliexpressLoading: (loading: boolean) => void;

  // UI state setters
  setIsEbayCollapsed: (collapsed: boolean) => void;
  setIsAmazonCollapsed: (collapsed: boolean) => void;
  setIsEbayResHasNextPage: (hasNextPage: boolean) => void;
  setAmazonCurrentPage: (page: number) => void;
  setTotalNumberOfItemsForthatSearchKeyword: (num: number) => void;
  setMkState: (state: Partial<SearchState["mkState"]>) => void;

  // Main actions
  handleSearch: (
    activeTab?: "ebay" | "amazon" | "aliexpress" | "all",
    additionalParams?: string,
    ebaySearchMode?: string,
  ) => Promise<void>;
  debouncedHandleSearch: (activeTab?: "ebay" | "amazon" | "aliexpress") => void;
  cancelOngoingRequests: (
    key: "all" | "ebay" | "amazon" | "aliexpress",
  ) => void;
  handleEbayLoadMore: (additionalParams?: string) => Promise<void>;
  handleAliexpressLoadMore: () => Promise<void>;
  handleAmazonLoadMore: () => Promise<void>;

  // Storage actions
  saveToLocalStorage: (
    key: string,
    checked: boolean,
    defaultVal: string,
  ) => void;
  initializeFromLocalStorage: () => void;
}

type SearchStore = SearchState & SearchActions;

// Request controllers
let ebayController: AbortController | null = null;
let aliexpressController: AbortController | null = null;
let amazonController: AbortController | null = null;
let debounceTimer: NodeJS.Timeout | null = null;

// Utilities
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number) => {
  return (...args: Parameters<T>) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func(...args), wait);
  };
};

const createController = () => new AbortController();

const extractFiltersFromItems = (items: any[]) => {
  const itemConditions = new Map<string, number>();
  const discounts = new Map<string, number>();
  const sellers = new Map<string, number>();

  items.forEach((item) => {
    // Item conditions
    const condition = item.condition || "Unknown";
    itemConditions.set(condition, (itemConditions.get(condition) || 0) + 1);

    // Discounts
    const discount = item.marketingPrice?.discountPercentage;
    if (discount) {
      discounts.set(discount, (discounts.get(discount) || 0) + 1);
    }

    // Sellers
    const seller = `${item.seller?.username}:${item.seller?.feedbackScore}:${item.seller?.feedbackPercentage}`;
    if (item.seller?.username) {
      sellers.set(seller, (sellers.get(seller) || 0) + 1);
    }
  });

  return {
    itemConditions: Array.from(itemConditions.entries()).map(
      ([condition, count]) => `${condition}: ${count}`,
    ),
    discounts: Array.from(discounts.entries())
      .map(([discount, count]) => `${discount}% Off: ${count}`)
      .reverse(),
    sellers: Array.from(sellers.entries()).map(
      ([seller, count]) => `${seller}: ${count}`,
    ),
  };
};

const getUrlParams = () => {
  const url = new URL(window.location.href);
  return {
    sellers: url.searchParams.get("sellers")?.split(",") || [],
    priceMin: url.searchParams.get("priceMin"),
    priceMax: url.searchParams.get("priceMax"),
    discounts: url.searchParams.get("discounts")?.split(",") || [],
    condition: url.searchParams.get("condition"),
    query: url.searchParams.get("q"),
  };
};

const cleanSearchTerm = (searchTerm: string) => {
  return searchTerm?.replaceAll("&", " and ")?.replace(/\s+/g, " ")?.trim();
};
export const useSearchStore = create<SearchStore>()(
  (set, get) => ({
    // Initial state
    availableDiscounts: [],
    availableItemConditions: ["Any-Condition"],
    availableSellers: [],
    activeTabOnDisplay: "ebay",
    searchTerm: "",
    searchUrlParam: "",
    ebayResults: [],
    aliexpressResults: [],
    searchKeywordType: "",
    ebayUnfilteredResults: [],
    amazonResults: [],
    amazonResults2: [],
    paapiStatus: "NOT_WORKING",
    mkState: {
      ebay: { checked: true, defaultVal: DEFAULT_SITES.ebay },
      amazon: { checked: true, defaultVal: DEFAULT_SITES.amazon },
      aliexpress: { checked: true, defaultVal: DEFAULT_SITES.aliexpress },
    },
    isEbayLoading: true,
    isAmazonLoading: true,
    isEbayLoadingMore: false,
    isAmazonLoadingMore: false,
    isEbayCollapsed: true,
    isAmazonCollapsed: true,
    isEbayResHasNextPage: true,
    isAliExpressResHasNextPage: true,
    isAliExpressLoading: true,
    isAliExpressLoadingMore: false,

    amazonCurrentPage: 1,
    aliexpressCurrentPage: 1,
    isAliExpressHasNextPage: true,
    isAmazonHasNextPage: true,
    aliExpressCurrency: "USD",
    defaultEbaySite: DEFAULT_SITES.ebay,
    defaultAmazonSite: DEFAULT_SITES.amazon,
    defaultAliexpressSite: DEFAULT_SITES.aliexpress,
    totalNumberOfItemsForthatSearchKeyword: 0,

    // Basic setters
    setActiveTabOnDisplay: (tab) => set({ activeTabOnDisplay: tab }),
    setSearchTerm: (term) => set({ searchTerm: term }),
    setSearchUrlParam: (param) => set({ searchUrlParam: param }),
    setTotalNumberOfItemsForthatSearchKeyword: (count) =>
      set({ totalNumberOfItemsForthatSearchKeyword: count }),


    // Site setters with state sync
    setDefaultEbaySite: (event) => {
      const newSite = typeof event === "string" ? event : event.target.value;
      set((state) => ({
        defaultEbaySite: newSite,
        mkState: {
          ...state.mkState,
          ebay: { ...state.mkState.ebay, defaultVal: newSite },
        },
      }));
    },
    setDefaultAmazonSite: (event) => {
      const newSite = typeof event === "string" ? event : event.target.value;
      set((state) => ({
        defaultAmazonSite: newSite,
        mkState: {
          ...state.mkState,
          amazon: { ...state.mkState.amazon, defaultVal: newSite },
        },
      }));
    },
    setDefaultAliexpressSite: (event) => {
      const newSite = typeof event === "string" ? event : event.target.value;
      set((state) => ({
        defaultAliexpressSite: newSite,
        mkState: {
          ...state.mkState,
          aliexpress: { ...state.mkState.aliexpress, defaultVal: newSite },
        },
      }));
    },

    // Filter setters
    setAvailableDiscounts: (discounts) =>
      set({ availableDiscounts: discounts }),
    setAvailableItemConditions: (conditions) =>
      set({ availableItemConditions: ["Any-Condition", ...conditions] }),
    setAvailableSellers: (sellers) => set({ availableSellers: sellers }),

    setAllEbayFilterswithValues: (items) => {
      const { itemConditions, discounts, sellers } =
        extractFiltersFromItems(items);
      const {
        setAvailableItemConditions,
        setAvailableSellers,
        setAvailableDiscounts,
      } = get();

      setAvailableItemConditions(itemConditions);
      setAvailableDiscounts(discounts);
      setAvailableSellers(sellers);
    },

    // Results setters
    setEbayResults: (results) => set({ ebayResults: results }),
    setEbayUnfilteredResults: (results) =>
      set({ ebayUnfilteredResults: results }),
    setAmazonResults: (results) => set({ amazonResults: results }),
    setAmazonResults2: (results) => set({ amazonResults2: results }),

    // Loading state setters
    setIsEbayLoading: (loading) => set({ isEbayLoading: loading }),
    setIsAmazonLoading: (loading) => set({ isAmazonLoading: loading }),
    setIsEbayLoadingMore: (loading) => set({ isEbayLoadingMore: loading }),
    setIsAliexpressLoading: (loading) => set({ isAliExpressLoading: loading }),

    // UI state setters
    setIsEbayCollapsed: (collapsed) => set({ isEbayCollapsed: collapsed }),
    setIsAmazonCollapsed: (collapsed) => set({ isAmazonCollapsed: collapsed }),
    setIsEbayResHasNextPage: (hasNextPage) =>
      set({ isEbayResHasNextPage: hasNextPage }),
    setAmazonCurrentPage: (page) => set({ amazonCurrentPage: page }),
    setMkState: (state) =>
      set((prevState) => ({ mkState: { ...prevState.mkState, ...state } })),

    // Request management
    cancelOngoingRequests: (key) => {
      if (key === "ebay") {
        ebayController?.abort();
        ebayController = null;
      }
      if (key === "amazon") {
        amazonController?.abort();
        amazonController = null;
      }
      if (key === "aliexpress") {
        aliexpressController?.abort();
        aliexpressController = null;
      }
      if (key === "all") {
        set({ isEbayLoading: false, isAmazonLoading: false });
        amazonController?.abort();
        ebayController?.abort();
        amazonController = null;
        ebayController = null;
      }
    },

    // Main search function
    handleSearch: async (
      activeTab = "all",
      additionalParams = "",
      ebaySearchMode = "FULL_KEYWORDS",
    ) => {
      set({ searchKeywordType: "" });
      const state = get();
      const { mkState, searchTerm, defaultEbaySite, defaultAmazonSite } = state;
      addRecentSearchesToIndexedDb({ searchTerm: searchTerm });
      // Reset results and pagination
      if (activeTab === "all") {
        state.cancelOngoingRequests("all");
        set({
          amazonResults: [],
          amazonResults2: [],
          ebayResults: [],
          amazonCurrentPage: 1,
          aliexpressResults: [],
        });
      } else if (activeTab === "ebay") {
        state.cancelOngoingRequests("ebay");
        set({ ebayResults: [] });
      } else if (activeTab === "amazon") {
        state.cancelOngoingRequests("amazon");
        set({ amazonResults: [], amazonCurrentPage: 1 });
        set({ amazonResults2: [], amazonCurrentPage: 1 });
      } else if (activeTab === "aliexpress") {
        state.cancelOngoingRequests("aliexpress");
        set({ aliexpressResults: [] });
      } else {
        state.cancelOngoingRequests("all");
        set({ amazonResults: [], ebayResults: [], amazonCurrentPage: 1 });
      }

      const promises: {
        ebay?: Promise<any>;
        amazon?: Promise<any>;
        aliexpress?: Promise<any>;
      } = {};
      const encodedSearchTerm = encodeTextToURI(cleanSearchTerm(searchTerm));
      const urlParams = getUrlParams();
      const searchQuery = urlParams.query || searchTerm;

      // eBay search
      if (
        mkState.ebay.checked &&
        (activeTab === "all" || activeTab === "ebay" || !activeTab)
      ) {
        state.setIsEbayLoading(true);
        ebayController = createController();
        const s =
          ebaySearchMode === "FULL_KEYWORDS"
            ? encodedSearchTerm
            : encodeTextToURI(
                cleanSearchTerm(searchTerm)?.split(" ").slice(0, 3).join(" "),
              );

        const ebayUrl = `${api_paths.ebay_default_search}?q=${s}&site=${defaultEbaySite}&limit=200&${additionalParams}`;

        promises.ebay = requests.get(ebayUrl, {
          signal: ebayController.signal,
        });
      }

      // Amazon search
      if (
        mkState.amazon.checked &&
        (activeTab === "all" || activeTab === "amazon" || !activeTab)
      ) {
        state.setIsAmazonLoading(true);
        amazonController = createController();

        const marketplace = MARKETPLACE_TO_COUNTRY[defaultAmazonSite];
        const amazonQuery =
          activeTab === "all"
            ? encodedSearchTerm
            : encodeTextToURI(cleanSearchTerm(searchTerm));
        if (WHAT_AMAZON_API_WE_ARE_USING === "PAAPI") {
          promises.amazon = requests.get(
            `${api_paths.amazon_search_pa_api}?q=${amazonQuery}&marketplace=${marketplace}&site=${defaultAmazonSite}`,
            {
              signal: amazonController.signal,
            },
          );
        } else {
          promises.amazon = requests.get(
            `${api_paths.get_amazon_html}?q=${amazonQuery}&siteamz=www.${defaultAmazonSite}`,
            {
              signal: amazonController.signal,
            },
          );
        }
      }
      // AliExpress search
      if (
        mkState.aliexpress.checked &&
        (activeTab === "all" || activeTab === "aliexpress" || !activeTab)
      ) {
        set({ isAliExpressLoading: true });
        aliexpressController = createController();
        promises.aliexpress = requests.get(
          `${api_paths.ali_express_default_search}?keywords=${encodedSearchTerm}&target_currency=${state.defaultAliexpressSite}`,
          {
            signal: aliexpressController.signal,
          },
        );
      }

      try {
        if (promises.amazon || promises.ebay || promises.aliexpress) {
          const entries = Object.entries(promises);

          const resultsArray = await Promise.all(
            entries.map(([key, promise]) => promise),
          );

          const resultsObj = Object.fromEntries(
            entries.map(([key], index) => [key, resultsArray[index]]),
          );

          // Process eBay results
          if (
            mkState.ebay.checked &&
            (activeTab === "all" || activeTab === "ebay" || !activeTab)
          ) {
            const ebayRes = resultsObj.ebay;
            const items = ebayRes?.requestsData?.itemSummaries || [];
            const totalItems = ebayRes?.requestsData?.total || 0;
            const searchKeywordType = ebayRes?.headers.get("search-mode");
            if (
              searchKeywordType === "FULL_KEYWORDS" &&
              items.length === 0 &&
              state.searchTerm.split(" ").length > 3
            ) {
              // set({ searchTerm: state.searchTerm.split(" ").slice(0, 3).join(" ") });
              state.handleSearch("ebay", "mode=FEW_KEYWORDS", "FEW_KEYWORDS");
            }
            state.setTotalNumberOfItemsForthatSearchKeyword(
              totalItems.toLocaleString(ebaySiteLocaleMapping[defaultEbaySite]),
            );
            state.setIsEbayResHasNextPage(!!ebayRes?.requestsData?.next);
            state.setEbayResults(items);
            state.setEbayUnfilteredResults(items);
            state.setIsEbayLoading(false);
            state.setAllEbayFilterswithValues(items);
            set({ searchKeywordType });

            // Apply URL filters if present
            const filterStore = useEbayFilterStore.getState();
            if (urlParams.condition)
              filterStore.setSelectedCondition(urlParams.condition);
            if (urlParams.sellers.length)
              filterStore.setSelectedSellers(urlParams.sellers);
            if (urlParams.discounts.length)
              filterStore.setSelectedDiscounts(urlParams.discounts);
            if (urlParams.priceMin)
              filterStore.setPriceMin(parseInt(urlParams.priceMin));
            if (urlParams.priceMax)
              filterStore.setPriceMax(parseInt(urlParams.priceMax));

            if (Object.values(urlParams).some((val) => val)) {
              filterStore.runEbayFilters();
            }

            logger.debug.log("Ebay search response:", ebayRes?.requestsData);
          }

          // Process Amazon results
          if (
            mkState.amazon.checked &&
            (activeTab === "all" || activeTab === "amazon" || !activeTab)
          ) {
            const amazonRes = resultsObj.amazon;
            if (
              WHAT_AMAZON_API_WE_ARE_USING === "PAAPI" &&
              amazonRes.status === 200
            ) {
              set({ paapiStatus: "WORKING" });
              state.setAmazonResults(
                amazonRes?.requestsData?.SearchResult || [],
              );
              logger.debug.log(
                "Amazon search response:",
                amazonRes?.requestsData,
              );
              state.setIsAmazonLoading(false);
              set({
                amazonCurrentPage: 1,
              });
            } else {
              set({ paapiStatus: "NOT_WORKING" });
              let parsedResults = parseAmazonSearchResult(amazonRes);
              let counter = 0;
              while (parsedResults.length === 0 && counter <= 5) {
                // we do this cause sometimes encodeUriComponent iss not working properly on cloudflare server
                const amazonQuery =
                  activeTab === "all"
                    ? encodedSearchTerm
                    : encodeTextToURI(cleanSearchTerm(searchTerm));
                amazonController = new AbortController();
                const res = await requests.get(
                  `${api_paths.get_amazon_html}?q=${amazonQuery}&siteamz=www.${defaultAmazonSite}`,
                  {
                    signal: amazonController.signal,
                    headers: { "e-grant": "ebextractor-20" },
                  },
                );
                parsedResults = parseAmazonSearchResult(res.requestsData);
                counter++;
              }
              state.setAmazonResults2(parsedResults);
              state.isAmazonHasNextPage = parsedResults.length > 0;
              state.setIsAmazonLoading(false);
            }
          }

          // Process AliExpress results
          if (
            mkState.aliexpress.checked &&
            (activeTab === "all" || activeTab === "aliexpress" || !activeTab)
          ) {
            const aliexpressRes = resultsObj.aliexpress;
            logger.debug.log(
              "AliExpress defualt site:",
              state.defaultAliexpressSite,
            );
            logger.debug.log("AliExpress response:", aliexpressRes);
            if (
              aliexpressRes?.requestsData
                ?.aliexpress_affiliate_product_query_response.resp_result
                .resp_code !== 200
            ) {
              set({ isAliExpressLoading: false });
              set({ isAliExpressHasNextPage: false });
              set({ aliexpressResults: [] });
              set({ aliexpressCurrentPage: 1 });
              return;
            }
            const items =
              aliexpressRes?.requestsData
                ?.aliexpress_affiliate_product_query_response.resp_result.result
                .products.product || [];
            set({ aliexpressResults: items });
            set({ isAliExpressLoading: false });
            set({
              aliexpressCurrentPage:
                aliexpressRes?.requestsData
                  ?.aliexpress_affiliate_product_query_response.resp_result
                  .result.current_page_no || 1,
              isAliExpressHasNextPage: items.length > 0,
            });
          }
        }

        set({
          isAliExpressLoading: false,
          isEbayLoading: false,
          isAmazonLoading: false,
        });
      } catch (error) {
        // Handle errors silently for now
        //
        logger.debug.log("Search error:", error);
        set({
          isAliExpressLoading: false,
          isEbayLoading: false,
          isAmazonLoading: false,
        });
      }
    },

    // Load more for eBay
    handleEbayLoadMore: async (additionalParams = "") => {
      const state = get();
      const { searchTerm, ebayUnfilteredResults, defaultEbaySite } = state;

      state.setIsEbayLoadingMore(true);

      try {
        const res = await requests.get(
          `${api_paths.ebay_default_search}?q=${cleanSearchTerm(
            searchTerm,
          )}&limit=200&offset=${
            ebayUnfilteredResults.length
          }&site=${defaultEbaySite}&type=loadmore&${additionalParams}`,
        );

        if (res.success) {
          const newItems = res.requestsData.itemSummaries || [];
          const allItems = [...ebayUnfilteredResults, ...newItems];

          state.setEbayResults(allItems);
          state.setEbayUnfilteredResults(allItems);
          state.setIsEbayResHasNextPage(!!res.requestsData.next);
          state.setAllEbayFilterswithValues(allItems);

          useEbayFilterStore.getState().runEbayFilters();
        }
      } catch (error) {
        logger.debug.log("Amazon load more error:", error);
        state.setIsEbayLoadingMore(false);
      } finally {
        state.setIsEbayLoadingMore(false);
      }
    },

    //Load more for Amazon
    handleAmazonLoadMore: async () => {
      const state = get();
      const { searchTerm, amazonResults } = state;
      set({ isAmazonLoadingMore: true });
      try {
        const res = await requests.get(
          `${api_paths.amazon_search_pa_api}?q=${cleanSearchTerm(searchTerm)}&page=${
            state.amazonCurrentPage + 1
          }`,
        );
        if (res.success && res?.requestsData?.SearchResult) {
          const newItems = res?.requestsData?.SearchResult;
          const allItems = [...amazonResults.Items, ...newItems.Items];
          state.setAmazonResults({ ...amazonResults, Items: allItems });
          set({
            amazonCurrentPage: state.amazonCurrentPage + 1,
            isAmazonHasNextPage: newItems.Items.length > 0,
          });
          logger.debug.log("Amazon load more response:", res);
          return;
        }
        set({ isAmazonHasNextPage: false });
      } catch (error) {
        logger.debug.log("Amazon load more error:", error);
        set({ isAmazonLoadingMore: false });
        set({ isAmazonHasNextPage: false });
      } finally {
        set({ isAmazonLoadingMore: false });
      }
    },

    // Load more for AliExpress
    handleAliexpressLoadMore: async () => {
      const state = get();
      const { searchTerm, aliexpressResults } = state;

      set({ isAliExpressLoadingMore: true });

      try {
        const res = await requests.get(
          `${api_paths.ali_express_default_search}?keywords=${cleanSearchTerm(
            searchTerm,
          )}&page_no=${state.aliexpressCurrentPage + 1}&target_currency=${
            state.defaultAliexpressSite
          }`,
        );

        if (
          res.success &&
          res.requestsData.aliexpress_affiliate_product_query_response
            .resp_result.resp_code === 200
        ) {
          const newItems =
            res.requestsData.aliexpress_affiliate_product_query_response
              .resp_result.result.products.product || [];
          const allItems = [...aliexpressResults, ...newItems];
          set({
            aliexpressCurrentPage:
              res.requestsData.aliexpress_affiliate_product_query_response
                .resp_result.result.current_page_no ||
              state.aliexpressCurrentPage + 1,
          });
          set({ aliexpressResults: allItems });
          set({ isAliExpressHasNextPage: newItems.length > 0 });
          return;
        }
        set({ isAliExpressHasNextPage: false });
      } catch (error) {
        logger.debug.error("AliExpress Load more error:", error);
      } finally {
        set({ isAliExpressLoadingMore: false });
      }
    },

    // Storage management
    saveToLocalStorage: (key, checked, defaultVal) => {
      set((state) => ({
        mkState: {
          ...state.mkState,
          [key]: { checked, defaultVal },
        },
        ...(key === "ebay" && { defaultEbaySite: defaultVal }),
        ...(key === "amazon" && { defaultAmazonSite: defaultVal }),
        ...(key === "aliexpress" && { defaultAliexpressSite: defaultVal }),
      }));
    },

    initializeFromLocalStorage: () => {
      const { mkState } = get();
      set({
        defaultEbaySite: mkState.ebay.defaultVal,
        defaultAmazonSite: mkState.amazon.defaultVal,
        defaultAliexpressSite: mkState.aliexpress.defaultVal,
        activeTabOnDisplay: mkState.ebay.checked
          ? "ebay"
          : mkState.amazon.checked
            ? "amazon"
            : "aliexpress",
        mkState,
      });
    },

    // Debounced search
    debouncedHandleSearch: debounce(
      (activeTab?: "ebay" | "amazon" | "aliexpress") => {
        get().handleSearch(activeTab);
      },
      300,
    ),
  }),
  // persist(
  //   // put the set here
  //   {
  //     name: "search-store-v2",
  //     storage: createJSONStorage(() => localStorage),
  //     partialize: (state) => ({
  //       mkState: state.mkState,
  //       defaultEbaySite: state.defaultEbaySite,
  //       defaultAmazonSite: state.defaultAmazonSite,
  //       defaultAliexpressSite: state.defaultAliexpressSite,
  //     }),
  //   },
  // ),
);

// import { create } from "zustand";
// import { createJSONStorage, persist } from "zustand/middleware";
// import { parseAmazonSearchResult } from "@/app/utils/parseAmazonSearchResult";
// import { encodeTextToURI } from "@/app/utils/encodeTextToURI";
// import { ChangeEvent } from "react";
// import { Item } from "@/app/components/ebay-amazon-search/types";
// import requests from "@/app/utils/http";
// import { Product } from "@/app/components/ebay-amazon-search/AmazonResultCard";
// import { useEbayFilterStore } from "../ebay-search-filter/store";
// import { ebaySiteLocaleMapping } from "@/app/utils/ebaySiteMapping";
// const marketplaceToCountryCode: Record<string, string> = {
//   "amazon.com": "US",
//   "amazon.co.uk": "UK",
//   "amazon.de": "DE",
//   "amazon.fr": "FR",
//   "amazon.it": "IT",
//   "amazon.es": "ES",
//   "amazon.ca": "CA",
//   "amazon.co.jp": "JP",
// };
// interface MkState {
//   ebay: { checked: boolean; defaultVal: string };
//   amazon: { checked: boolean; defaultVal: string };
// }

// interface SearchStore {
//   availableDiscounts: string[];
//   availableItemConditions: string[];
//   availableSellers: string[];
//   activeTabOnDisplay: "ebay" | "amazon";
//   searchTerm: string;
//   searchUrlParam: string;
//   ebayResults: Item[];
//   ebayUnfilteredResults: Item[];
//   amazonResults: any;
//   mkState: MkState;
//   isEbayLoading: boolean;
//   isAmazonLoading: boolean;
//   isEbayLoadingMore: boolean;
//   isEbayCollapsed: boolean;
//   isAmazonCollapsed: boolean;
//   isEbayResHasNextPage: boolean;
//   amazonCurrentPage: number;
//   defaultEbaySite: string;
//   defaultAmazonSite: string;
//   totalNumberOfItemsForthatSearchKeyword: number;
//   setActiveTabOnDisplay: (tab: "ebay" | "amazon") => void;
//   setAllEbayFilterswithValues: (items: any) => void;
//   setAvailableDiscounts: (discounts: string[]) => void;
//   setAvailableItemConditions: (conditions: string[]) => void;
//   setAvailableSellers: (sellers: string[]) => void;
//   setSearchTerm: (term: string) => void;
//   setDefaultEbaySite: (event: ChangeEvent<HTMLSelectElement> | string) => void;
//   setDefaultAmazonSite: (
//     event: ChangeEvent<HTMLSelectElement> | string
//   ) => void;
//   setSearchUrlParam: (param: string) => void;
//   setEbayResults: (results: Item[]) => void;
//   setEbayUnfilteredResults: (results: Item[]) => void;
//   setAmazonResults: (results: any[]) => void;
//   setMkState: (state: Partial<MkState>) => void;
//   setIsEbayLoading: (loading: boolean) => void;
//   setIsAmazonLoading: (loading: boolean) => void;
//   setIsEbayLoadingMore: (loading: boolean) => void;
//   setIsEbayCollapsed: (collapsed: boolean) => void;
//   setIsAmazonCollapsed: (collapsed: boolean) => void;
//   setIsEbayResHasNextPage: (hasNextPage: boolean) => void;
//   setAmazonCurrentPage: (page: number) => void;
//   setTotalNumberOfItemsForthatSearchKeyword: (num: number) => void;
//   handleSearch: (activeTab?: "ebay" | "amazon" | "both", additionlParamsForAnalytics?: string) => Promise<void>;
//   debouncedHandleSearch: (activeTab?: "ebay" | "amazon") => void;
//   cancelOngoingRequests: (key: "both" | "ebay" | "amazon") => void;
//   handleEbayLoadMore: (additionlParamsForAnalytics: string) => Promise<void>;
//   saveToLocalStorage: (
//     key: string,
//     checked: boolean,
//     defaultVal: string
//   ) => void;
// initializeFromLocalStorage: () => void;
// }

// let ebaySource: AbortController | null = new AbortController();
// let amazonSource: AbortController | null = new AbortController();
// let debounceTimer: NodeJS.Timeout | null = null;

// function debounce<T extends (...args: any[]) => any>(
//   func: T,
//   wait: number
// ): (...args: Parameters<T>) => void {
//   return (...args: Parameters<T>) => {
//     if (debounceTimer) clearTimeout(debounceTimer);
//     debounceTimer = setTimeout(() => func(...args), wait);
//   };
// }

// export const useSearchStore = create<SearchStore>()(
//   persist(
//     (set, get) => ({
//       availableDiscounts: [],
//       availableItemConditions: ["Any-Condition"],
//       activeTabOnDisplay: "ebay",
//       availableSellers: [],
//       searchTerm: "",
//       defaultEbaySite: "EBAY_US",
//       defaultAmazonSite: "amazon.com",
//       searchUrlParam: "",
//       ebayResults: [],
//       ebayUnfilteredResults: [],
//       amazonResults: [],
//       mkState: {
//         ebay: { checked: true, defaultVal: "EBAY_US" },
//         amazon: { checked: true, defaultVal: "amazon.com" },
//       },
//       isEbayLoading: false,
//       isAmazonLoading: false,
//       isEbayLoadingMore: false,
//       isEbayCollapsed: false,
//       isAmazonCollapsed: false,
//       isEbayResHasNextPage: true,
//       amazonCurrentPage: 1,
//       totalNumberOfItemsForthatSearchKeyword: 0,
//       setActiveTabOnDisplay: (tab: "ebay" | "amazon") =>
//         set({ activeTabOnDisplay: tab }),
//       setAvailableDiscounts: (discounts: string[]) => {
//         set({ availableDiscounts: discounts });
//       },
//       setAllEbayFilterswithValues: (items: any) => {
//         const {
//           setAvailableItemConditions,
//           setAvailableSellers,
//           setAvailableDiscounts,
//         } = get();
//         // Extracting Item Conditions
//         const itemConditionsWithCounts = items.reduce((acc: any, item: any) => {
//           const cond = item.condition || "Unknown";
//           acc[cond] = (acc[cond] || 0) + 1;
//           return acc;
//         }, {});
//         const itemConditions: string[] = Object.entries(
//           itemConditionsWithCounts
//         ).map(([condition, count]) => `${condition}: ${count}`);
//         setAvailableItemConditions(itemConditions);

//         // Extracting Discounts
//         const discountsWithCounts = items.reduce((acc: any, item: any) => {
//           const discount = item.marketingPrice?.discountPercentage;
//           if (!discount) return acc;

//           acc[discount] = (acc[discount] || 0) + 1;
//           return acc;
//         }, {});
//         const discounts: string[] = Object.entries(discountsWithCounts).map(
//           ([discount, count]) => `${discount}% Off: ${count}`
//         );
//         setAvailableDiscounts(discounts.reverse());

//         // Extracting Sellers
//         const sellersWithCounts = items.reduce((acc: any, item: any) => {
//           const seller = `${
//             item.seller?.username +
//             ":" +
//             item.seller?.feedbackScore +
//             ":" +
//             item.seller?.feedbackPercentage
//           }`;
//           if (!seller) return acc;

//           acc[seller] = (acc[seller] || 0) + 1;
//           return acc;
//         }, {});
//         const sellers: string[] = Object.entries(sellersWithCounts).map(
//           ([seller, count]) => `${seller}: ${count}`
//         );
//         setAvailableSellers(sellers);
//       },
//       setAvailableItemConditions: (conditions: string[]) => {
//         set({ availableItemConditions: ["Any-Condition", ...conditions] });
//       },
//       setAvailableSellers: (sellers: string[]) => {
//         set({ availableSellers: sellers });
//       },
//       cancelOngoingRequests: (key: "both" | "ebay" | "amazon") => {
//         if (ebaySource && key === "ebay") {
//           ebaySource.abort();
//           ebaySource = null;
//         }
//         if (amazonSource && key === "amazon") {
//           amazonSource.abort();
//           amazonSource = null;
//         }

//         if (key === "both" && ebaySource && amazonSource) {
//           ebaySource.abort();
//           amazonSource.abort();
//           ebaySource = null;
//           amazonSource = null;
//           set({ isEbayLoading: false });
//           set({ isAmazonLoading: false });
//         }
//       },
//       setDefaultEbaySite: (event: ChangeEvent<HTMLSelectElement> | string) => {
//         const newSite = typeof event !== "string" ? event.target.value : event;
//         set((state) => ({
//           defaultEbaySite: newSite,
//           mkState: {
//             ...state.mkState,
//             ebay: { ...state.mkState.ebay, defaultVal: newSite },
//           },
//         }));
//       },
//       setDefaultAmazonSite: (
//         event: ChangeEvent<HTMLSelectElement> | string
//       ) => {
//         const newSite = typeof event !== "string" ? event.target.value : event;
//         set((state) => ({
//           defaultAmazonSite: newSite,
//           mkState: {
//             ...state.mkState,
//             amazon: { ...state.mkState.amazon, defaultVal: newSite },
//           },
//         }));
//       },
//       setSearchTerm: (term: string) => set({ searchTerm: term }),
//       setTotalNumberOfItemsForthatSearchKeyword: (count: number) =>
//         set({ totalNumberOfItemsForthatSearchKeyword: count }),
//       setSearchUrlParam: (param: string) => set({ searchUrlParam: param }),
//       setEbayResults: (results: Item[]) => set({ ebayResults: results }),
//       setEbayUnfilteredResults: (results: Item[]) =>
//         set({ ebayUnfilteredResults: results }),
//       setAmazonResults: (results: any[]) => set({ amazonResults: results }),
//       setMkState: (state: Partial<MkState>) =>
//         set((prevState) => ({
//           mkState: { ...prevState.mkState, ...state },
//         })),
//       setIsEbayLoading: (loading: boolean) => set({ isEbayLoading: loading }),
//       setIsAmazonLoading: (loading: boolean) =>
//         set({ isAmazonLoading: loading }),
//       setIsEbayLoadingMore: (loading: boolean) =>
//         set({ isEbayLoadingMore: loading }),
//       setIsEbayCollapsed: (collapsed: boolean) =>
//         set({ isEbayCollapsed: collapsed }),
//       setIsAmazonCollapsed: (collapsed: boolean) =>
//         set({ isAmazonCollapsed: collapsed }),
//       setIsEbayResHasNextPage: (hasNextPage: boolean) =>
//         set({ isEbayResHasNextPage: hasNextPage }),
//       setAmazonCurrentPage: (page: number) => set({ amazonCurrentPage: page }),
//       handleSearch: async (
//         activeTab?: "ebay" | "amazon" | "both",
//         additionlParamsForAnalytics?: string
//       ) => {
//         const {
//           setAmazonResults,
//           setEbayResults,
//           setAmazonCurrentPage,
//           setIsEbayLoading,
//           setIsAmazonLoading,
//           setIsEbayResHasNextPage,
//           setEbayUnfilteredResults,
//           setAllEbayFilterswithValues,
//           defaultEbaySite,
//           defaultAmazonSite,
//           searchTerm,
//           mkState,
//           cancelOngoingRequests,
//           setTotalNumberOfItemsForthatSearchKeyword,
//         } = get();
//         if (activeTab === "both") {
//           cancelOngoingRequests("both");
//           setAmazonResults([]);
//           setEbayResults([]);
//         } else if (activeTab) {
//           if (activeTab === "amazon") setAmazonResults([]);
//           if (activeTab === "ebay") setEbayResults([]);
//         } else if (activeTab === undefined) {
//           amazonSource && cancelOngoingRequests("amazon");
//           ebaySource && cancelOngoingRequests("ebay");
//           cancelOngoingRequests("ebay");
//           setAmazonResults([]);
//           setEbayResults([]);
//         }
//         setAmazonCurrentPage(1);

//         let ebayPromise: Promise<any> | undefined;
//         let amazonPromise: Promise<any> | undefined;

//         if (activeTab === "both") {
//           const encodedSearchTerm = encodeTextToURI(searchTerm);
//           if (mkState.ebay.checked) {
//             setIsEbayLoading(true);
//             ebaySource = new AbortController();
//             ebayPromise = requests.get(
//               `/api/ebay-search?q=${encodedSearchTerm}&site=${defaultEbaySite}&limit=200&${additionlParamsForAnalytics}`,
//               {
//                 headers: {
//                   "e-grant": "ebextractor-20",
//                 },
//                 signal: ebaySource.signal,
//               }
//             );
//           }
//           if (mkState.amazon.checked) {
//             setIsAmazonLoading(true);
//             amazonSource = new AbortController();
//             amazonPromise = requests.get(
//               `${api_paths.amazon_search_pa_api}?q=${encodedSearchTerm}&marketplace=${marketplaceToCountryCode[defaultAmazonSite]}&site=${defaultAmazonSite}`,
//               {
//                 headers: {
//                   "e-grant": "ebextractor-20",
//                 },
//                 signal: amazonSource.signal,
//               }
//             );
//           }
//         } else {
//           const url = new URL(window.location.href);
//           const query = url.searchParams.get("q") || searchTerm;
//           const ebaysite = defaultEbaySite;
//           const amzsite = defaultAmazonSite;
//           if (mkState.ebay.checked && (!activeTab || activeTab === "ebay")) {
//             setIsEbayLoading(true);
//             cancelOngoingRequests("ebay");
//             ebaySource = new AbortController();
//             ebayPromise = requests.get(
//               `/api/ebay-search?q=${query}&site=${ebaysite}&limit=200`,
//               {
//                 signal: ebaySource.signal,
//                 headers: {
//                   "e-grant": "ebextractor-20",
//                 },
//               }
//             );
//           }
//           if (
//             mkState.amazon.checked &&
//             (!activeTab || activeTab === "amazon")
//           ) {
//             setIsAmazonLoading(true);
//             cancelOngoingRequests("amazon");
//             amazonSource = new AbortController();
//             amazonPromise = requests.get(
//               `${api_paths.amazon_search_pa_api}?q=${query}&marketplace=${marketplaceToCountryCode[defaultAmazonSite]}&site=${amzsite}`,
//               {
//                 signal: amazonSource.signal,
//                 headers: {
//                   "e-grant": "ebextractor-20",
//                 },
//               }
//             );
//           }
//         }
//         try {
//           if (ebayPromise || amazonPromise) {
//             const promises = [];
//             ebayPromise && promises.push(ebayPromise);
//             amazonPromise && promises.push(amazonPromise);
//             const results = await Promise.all(promises);
//             let resultIndex = 0;

//             const {
//               setSelectedCondition,
//               runEbayFilters,
//               setSelectedSellers,
//               setSelectedDiscounts,
//               setPriceMin,
//               setPriceMax,
//             } = useEbayFilterStore.getState();

//             const url = new URL(window.location.href);
//             const sellersUrlParam = url.searchParams.get("sellers");
//             const minPriceUrlParam = url.searchParams.get("priceMin");
//             const maxPriceUrlParam = url.searchParams.get("priceMax");
//             const discountUrlParam = url.searchParams.get("discounts");
//             const conditionUrlParam = url.searchParams.get("condition");

//             conditionUrlParam && setSelectedCondition(conditionUrlParam);
//             if (sellersUrlParam) {
//               setSelectedSellers(sellersUrlParam.split(","));
//             }
//             if (discountUrlParam) {
//               setSelectedDiscounts(discountUrlParam.split(","));
//             }
//             if (minPriceUrlParam) {
//               setPriceMin(parseInt(minPriceUrlParam));
//             }
//             if (maxPriceUrlParam) {
//               setPriceMax(parseInt(maxPriceUrlParam));
//             }

//             if (mkState.ebay.checked && ebayPromise) {
//               const ebayRes = results[resultIndex++]; // this says first position is ebay and increase the index which is now 1
//               const items = ebayRes?.requestsData?.itemSummaries;
//               const totalNumberOfItems = ebayRes?.requestsData?.total || 0;
//               setTotalNumberOfItemsForthatSearchKeyword(
//                 totalNumberOfItems.toLocaleString(
//                   ebaySiteLocaleMapping[defaultEbaySite]
//                 )
//               );
//               setIsEbayResHasNextPage(ebayRes?.requestsData?.next ? true : false);
//               setEbayResults(ebayRes?.requestsData?.itemSummaries); // This is the filtered display base on the filters applied by the user
//               setEbayUnfilteredResults(ebayRes?.requestsData?.itemSummaries); // This will act as the main result not filtered important for Clear All

//               setIsEbayLoading(false);
//               setAllEbayFilterswithValues(items);
//               if (
//                 sellersUrlParam ||
//                 minPriceUrlParam ||
//                 maxPriceUrlParam ||
//                 discountUrlParam ||
//                 conditionUrlParam
//               ) {
//                 runEbayFilters();
//               }
//             }

//             if (mkState.amazon.checked && amazonPromise) {
//               const amazonRes = results[resultIndex];

//               {
//                 /**old implemantation */
//               }
//               // let parsedResults = parseAmazonSearchResult(amazonRes);
//               // let counter = 0;
//               // while (parsedResults.length === 0 && counter < 40) {
//               //   const encodedSearchTerm = encodeURIComponent(searchTerm);
//               //   amazonSource = new AbortController();
//               //   const res = await requests.get(
//               //     `/api/amazon-search?q=${encodedSearchTerm}&siteamz=${defaultAmazonSite}`,
//               //     { signal: amazonSource.signal }
//               //   );
//               //   parsedResults = parseAmazonSearchResult(res.requestsData);
//               //   counter++;
//               // }
//               setAmazonResults(amazonRes.requestsData.SearchResult);
//               // console.log(amazonRes.requestsData.SearchResult);
//               setIsAmazonLoading(false);
//             }
//           }
//         } catch (e) {
//           // there are error on first mount need to use http util using fetch
//           // setIsEbayLoading(false);
//           // setIsAmazonLoading(false);
//         }
//       },
//       handleEbayLoadMore: async (additionlParamsForAnalytics?: string) => {
//         const {
//           setIsEbayLoadingMore,
//           setEbayResults,
//           setEbayUnfilteredResults,
//           setIsEbayResHasNextPage,
//           setAllEbayFilterswithValues,
//           searchTerm,
//           ebayResults,
//           ebayUnfilteredResults,
//           defaultEbaySite,
//         } = get();
//         const { runEbayFilters } = useEbayFilterStore.getState();
//         setIsEbayLoadingMore(true);
//         const res = await requests.get(
//           `/api/ebay-search?q=${searchTerm}&limit=${200}&offset=${
//             ebayUnfilteredResults.length
//           }&site=${defaultEbaySite}&type=loadmore&${additionlParamsForAnalytics}`
//         );
//         if (res.success) {
//           setEbayResults([...ebayUnfilteredResults, ...res.requestsData.itemSummaries]);
//           setEbayUnfilteredResults([
//             ...ebayUnfilteredResults,
//             ...res.requestsData.itemSummaries,
//           ]);
//           setIsEbayResHasNextPage(res.requestsData.next ? true : false);
//           setAllEbayFilterswithValues([
//             ...ebayUnfilteredResults,
//             ...res.requestsData.itemSummaries,
//           ]);
//           runEbayFilters();
//         }
//         setIsEbayLoadingMore(false);
//       },
//       saveToLocalStorage: (
//         key: string,
//         checked: boolean,
//         defaultVal: string
//       ) => {
//         set((state) => {
//           const updatedMkState = {
//             ...state.mkState,
//             [key]: { checked, defaultVal },
//           };
//           return {
//             mkState: updatedMkState,
//             ...(key === "ebay" ? { defaultEbaySite: defaultVal } : {}),
//             ...(key === "amazon" ? { defaultAmazonSite: defaultVal } : {}),
//           };
//         });
//       },
// initializeFromLocalStorage: () => {
//         const storedState = get();
//         if (storedState.mkState) {
//           set({
//             defaultEbaySite: storedState.mkState.ebay.defaultVal,
//             defaultAmazonSite: storedState.mkState.amazon.defaultVal,
//             activeTabOnDisplay: storedState.mkState.ebay.checked
//               ? "ebay"
//               : "amazon",
//           });
//         }
//       },
//       debouncedHandleSearch: debounce((activeTab?: "ebay" | "amazon") => {
//         get().handleSearch(activeTab);
//       }, 300),
//     }),
//     {
//       name: "search-store",
//       storage: createJSONStorage(() => localStorage),
//       partialize: (state) => ({
//         mkState: state.mkState,
//         defaultEbaySite: state.defaultEbaySite,
//         defaultAmazonSite: state.defaultAmazonSite,
//       }),
//     }
//   )
// );
