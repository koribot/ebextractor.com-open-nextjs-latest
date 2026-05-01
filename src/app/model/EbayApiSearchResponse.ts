import { EbayItem } from "../components/products-search-from-marketplaces/types";

export interface EbayApiSearchResponse {
  href: string;
  itemSummaries: EbayItem[];
  limit: number;
  next?: string;
  offset?: number;
  total: number;
}
