import { create } from "zustand";

interface SearchResult {
  id: number;
  title: string;
  price: string;
  image: string;
  url?: string;
}

interface SearchResults {
  total: number;
  items: SearchResult[];
}

interface EbaySearchByImageState {
  image: File | null;
  imagePreview: string;
  imageUrl: string;
  isLoading: boolean;
  results: SearchResults | null;
  error: string;
}

interface EbaySearchByImageAction {
  setImageUrl: (url: string) => void;
  setImagePreview: (url: string) => void;
  setImage: (file: File | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setResults: (results: SearchResults | null) => void;
  setError: (error: string) => void;
}

type EbaySearchByImageStore = EbaySearchByImageState & EbaySearchByImageAction;

export const useEbaySearchByImageStore = create<EbaySearchByImageStore>()((set, get) => ({
  image: null,
  imagePreview: "",
  imageUrl: "",
  isLoading: false,
  results: null,
  error: "",
  setImageUrl: (url: string) => set({ imageUrl: url }),
  setImagePreview: (url: string) => set({ imagePreview: url }),
  setImage: (file: File | null) => set({ image: file }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setResults: (results: SearchResults | null) => set({ results }),
  setError: (error: string) => set({ error }),
}));