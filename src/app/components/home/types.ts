export interface EbayItemDealsDetails {
  title: string;
  price: string;
  image: string;
  prevPrice: string;
  href: string;
}



// eBay Deals API Response Types

export interface Price {
  value: string;
  currency: string;
}

export interface Image {
  imageUrl: string;
}

export interface MarketingPrice {
  originalPrice?: Price;
  discountPercentage?: string;
  discountAmount?: Price;
  priceTreatment?: "LIST_PRICE" | "MINIMUM_ADVERTISED_PRICE" | string;
}

export interface ShippingOption {
  shippingCost: Price;
  shippingCostType: "FIXED" | "CALCULATED" | string;
}

export interface DealItem {
  itemId?: string;
  legacyItemId: string;
  itemGroupId?: string;
  itemGroupType?: string;
  title: string;
  image?: Image;
  marketingPrice?: MarketingPrice;
  price?: Price;
  shippingOptions: ShippingOption[];
  itemWebUrl: string;
  itemAffiliateWebUrl: string;
  categoryId: string;
  categoryAncestorIds: string[];
  commissionable: boolean;
  dealWebUrl: string;
  dealAffiliateWebUrl: string;
  dealStartDate: string;
  dealEndDate: string;
}

export interface EbayDealsApiResponse {
  dealItems: DealItem[];
  total?: number;
  href?: string;
  next?: string;
  limit?: number;
  offset?: number;
}