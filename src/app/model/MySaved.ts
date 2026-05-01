export interface SavedItemData {
  marketplace: string;
  id: string;
  title: string;
  price: {
    value: string;
    currency: string;
  };
  imageUrl?: string;
  itemWebUrl?: string;
  itemAffiliateWebUrl?: string;
  condition?: string;
  seller?: {
    username: string;
    feedbackPercentage?: string;
    feedbackScore?: number;
  };
  note?: string;
  synced?: boolean;
}
export interface SavedSellerData {
  feedbackPercentage?: string;
  feedbackScore?: number;
  username: string;
  sellerUrl?: string;
  note?: string;
  marketplace: string;
  synced?: boolean;
}
export interface SavedSearchesData {
  href: string;
  query: string;
  seller?: string;
  note?: string;
  synced?: boolean;
}

export enum MySavedMethod {
  ADD_SAVED_ITEMS = "ADD_SAVED_ITEMS",
  DELETE_SAVED_ITEMS = "DELETE_SAVED_ITEMS",
  UPDATE_SAVED_ITEMS = "UPDATE_SAVED_ITEMS",
  GET_SAVED_ITEMS = "GET_SAVED_ITEMS",
  ADD_SAVED_SELLERS = "ADD_SAVED_SELLERS",
  UPDATE_SAVED_SELLERS = "UPDATE_SAVED_SELLERS",
  GET_SAVED_SELLERS = "GET_SAVED_SELLERS",
  ADD_SAVED_SEARCHES = "ADD_SAVED_SEARCHES",
  DELETE_SAVED_SEARCHES = "DELETE_SAVED_SEARCHES",
  UPDATE_SAVED_SEARCHES = "UPDATE_SAVED_SEARCHES",
  GET_SAVED_SEARCHES = "GET_SAVED_SEARCHES",
  GET_ALL_MY_SAVED = "GET_ALL_MY_SAVED",
  DELETE_ALL_MY_SAVED = "DELETE_ALL_MY_SAVED",
  DELETE_SAVED_SELLERS = "DELETE_SAVED_SELLERS",
  DELETE_ALL_SAVED_ITEMS = "DELETE_ALL_SAVED_ITEMS",
  DELETE_ALL_SAVED_SEARCHES = "DELETE_ALL_SAVED_SEARCHES",
  DELETE_ALL_SAVED_SELLERS = "DELETE_ALL_SAVED_SELLERS",
  UPDATE_NOTE_ITEMS = "UPDATE_NOTE_ITEMS",
  UPDATE_NOTE_SELLERS = "UPDATE_NOTE_SELLERS",
  UPDATE_NOTE_SEARCHES = "UPDATE_NOTE_SEARCHES",
}

export interface MySavedRequest {
  method: MySavedMethod;
  id: string;
  createdAt?: number;
  updatedAt?: number;
  data?: SavedItemData | SavedSellerData | SavedSearchesData;
  userId?: string;
}
export interface MySavedArrayResponse {
  success: boolean;
  error?: string;
  data: {
    id: string;
    createdAt: number;
    updatedAt: number;
    data: string;
    userId?: string;
  }[];
}
