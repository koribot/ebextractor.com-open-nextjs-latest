export interface TermsInfo {
  summary?: string;
  fullText?: string;
}

export interface ApplicableCoupon {
  redemptionCode?: string;
}

export interface BannerImage {
  imageUrl: string;
  height: string;
  width: string;
  text: string;
}

export interface Event {
  eventId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  images?: BannerImage[];
  eventWebUrl?: string;
  eventAffiliateWebUrl: string;
  terms?: TermsInfo;
  applicableCoupons?: ApplicableCoupon[];
}

export interface EventsResponse {
  events: Event[];
  total: number;
  next?: string;
  prev?: string;
  offset?: number;
  limit?: number;
}

// Item Types
export interface Price {
  value: string;
  currency: string;
}

export interface MarketingPrice {
  originalPrice?: Price;
  discountPercentage?: string;
  discountAmount?: Price;
  priceTreatment?: string;
}

export interface ShippingOption {
  shippingCost: Price;
  shippingCostType?: "FIXED" | "FREE" | "CALCULATED";
}

export interface ItemImage {
  imageUrl: string;
}

export interface EventItem {
  itemId: string;
  legacyItemId: string;
  title: string;
  image: ItemImage;
  marketingPrice?: MarketingPrice;
  price: Price;
  shippingOptions?: ShippingOption[];
  itemWebUrl: string;
  itemAffiliateWebUrl: string;
  categoryId: string;
  categoryAncestorIds: string[];
  eventId: string;
}

export interface EventItemsResponse {
  eventItems: EventItem[];
  total: number;
  href: string;
  limit: number;
  offset: number;
}

// Component Props
export interface PreviewEventItemsProps {
  event: Event;
  site?: string
}

// Item Type Constants
export type ItemType =
  | "Robot"
  | "Cordless Stick"
  | "Upright"
  | "Portable"
  | "Vacuum";

// Sort Options
export type SortOption = "discount" | "price-low" | "price-high";
