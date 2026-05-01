export interface EbayItem {
  itemId: string;
  title: string;
  leafCategoryIds: string[];
  categories: {
    categoryId: string;
    categoryName: string;
  }[];
  image: {
    imageUrl: string;
  };
  price: {
    value: string;
    currency: string;
  };
  itemHref: string;
  seller: {
    username: string;
    feedbackPercentage: string;
    feedbackScore: number;
  };
  marketingPrice?: {
    originalPrice: {
      value: string;
      currency: string;
    };
    discountPercentage: string;
    discountAmount: {
      value: string;
      currency: string;
    };
    priceTreatment: string;
  };
  condition: string;
  conditionId: string;
  thumbnailImages: {
    imageUrl: string;
  }[];
  shippingOptions: {
    shippingCostType: string;
    shippingCost: {
      value: string;
      currency: string;
    };
    minEstimatedDeliveryDate?: string;
    maxEstimatedDeliveryDate?: string;
    guaranteedDelivery?: boolean;
  }[];
  buyingOptions: string[];
  epid?: string;
  itemAffiliateWebUrl: string;
  itemWebUrl: string;
  itemLocation: {
    city?: string;
    postalCode: string;
    country: string;
  };
  additionalImages: {
    imageUrl: string;
  }[];
  adultOnly: boolean;
  legacyItemId: string;
  availableCoupons: boolean;
  itemCreationDate: string;
  topRatedBuyingExperience: boolean;
  priorityListing: boolean;
  listingMarketplaceId: string;
  shortDescription?: string;
}

import { useSearchParams } from "next/navigation";

export type LoadingGridProps = {
  otherCollapsed: boolean;
  otherChecked: boolean;
};

export type ResultsGridProps = {
  results: EbayItem[] | AmazonResult[];
  defaultSite: string;
  title: string;
};

export type ResultItemProps = {
  result: EbayItem | AmazonResult;
  defaultSite: string;
  title: string;
};

export type NoResultsProps = {
  searchParams: ReturnType<typeof useSearchParams>;
  searchTerm: string;
  searchUrlParam: string;
  isLoading: boolean | null;
  isLoadingMore: boolean | null;
};

export type AmazonResult = {
  asin: string;
  title: string;
  price: string;
  img: string;
  href: string;
  typicalPrice: string;
};

export type ResultsSectionProps = {
  title: string;
  isLoading: boolean | null;
  results: EbayItem[] | AmazonResult[];
  isLoadingMore: boolean | null;
  hasNextPage: boolean;
  handleLoadMore: (additionlParamsForAnalytics: string) => void;
  defaultSite: string;
  searchTerm: string;
  searchUrlParam: string;
  totalNumberOfItemsForthatSearchKeyword: number;
  searchParams: ReturnType<typeof useSearchParams>;
};

// AliExpress Product Types
export interface AliExpressProduct {
  product_id: number;
  product_title: string;
  product_main_image_url: string;
  product_small_image_urls: {
    string: string[];
  };
  product_video_url?: string;
  target_sale_price: string;
  target_original_price: string;
  target_sale_price_currency: string;
  target_original_price_currency: string;
  discount: string;
  commission_rate: string;
  hot_product_commission_rate?: string;
  evaluate_rate?: string;
  lastest_volume: number;
  product_detail_url: string;
  promotion_link: string;
  first_level_category_name: string;
  second_level_category_name: string;
  shop_url: string;
  shop_name: string;
  shop_id: number;
  app_sale_price?: string;
  app_sale_price_currency?: string;
  target_app_sale_price?: string;
  target_app_sale_price_currency?: string;
  promo_code_info?: {
    promo_code: string;
    code_value: string;
    code_mini_spend: string;
    code_quantity: string;
    code_availabletime_start: string;
    code_availabletime_end: string;
    code_campaigntype: string;
  };
}

export interface AliExpressApiResponse {
  aliexpress_affiliate_product_query_response: {
    resp_result: {
      result: {
        current_record_count: number;
        total_record_count: number;
        current_page_no: number;
        products: {
          product: AliExpressProduct[];
        };
      };
    };
    resp_code: number;
    resp_msg: string;
    request_id: string;
  };
}

export interface AliExpressResultsSectionProps {
  title: string;
  isLoading: boolean;
  results: AliExpressProduct[] | null;
  isLoadingMore: boolean | null;
  hasNextPage: boolean;
  handleLoadMore: (filterParams?: string) => void;
  searchTerm: string;
  searchUrlParam: string;
  searchParams: ReturnType<typeof useSearchParams>;
  defaultSite: string;
}

export interface AliExpressResultsGridProps {
  results: AliExpressProduct[];
}

export interface AliExpressResultItemProps {
  result: AliExpressProduct;
}
