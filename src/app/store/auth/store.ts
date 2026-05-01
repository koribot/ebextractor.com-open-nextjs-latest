import { create } from "zustand";
import requests from "../../utils/http";
import {
  LocalStorageManager,
  usidStorageLocalStorage,
} from "@/app/utils/LocalStorageManager";

interface AuthState {
  user: {
    userID: string | null;
    email: string;
    username: string;
    profilePic: string;
  } | null;
  createdAt: string;
  isLoading: boolean;
  error: string;
  accountType: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  updateIsLoading: (isLoading: boolean) => void;
  updateError: (error: string) => void;
  setIsloading: (isLoading: boolean) => void;
  logout: () => void;
  hydrateUser: (userPayload?: any | null | undefined) => Promise<void>;
}

const initialState = {
  user: null,
  createdAt: "",
  isLoading: false,
  error: "",
  accountType: null,
  isAuthenticated: false,
  isInitialized: false,
  profilePic: "",
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  ...initialState,
  updateIsLoading: (isLoading) => set({ isLoading }),
  updateError: (error) => set({ error }),
  setIsloading(isLoading) {
    set({ isLoading: isLoading });
  },
  hydrateUser: async (userPayload?: any | null | undefined) => {
    set({ isInitialized: false, isLoading: true });
    if (typeof window === "undefined") return;
    if (userPayload) {
      const user = get().user;
      set({
        user: {
          email: userPayload.email,
          username: userPayload.name,
          userID: userPayload.id,
          profilePic: userPayload.avatar_url,
        },
        accountType: userPayload.accountType,
        createdAt: userPayload.createdAt,
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
      });
      return;
    }
    try {
      const response = await requests.get("/api/auth/user-me", {
        credentials: "include",
      });
      const userPayload = response.requestsData;
      if (!userPayload.user) {
        set({
          isAuthenticated: false,
          isInitialized: true,
          user: null,
          accountType: null,
          isLoading: false,
        });
        return;
      }
      set({
        user: {
          email: userPayload?.user?.email,
          username: userPayload?.user?.name,
          userID: userPayload?.user?.id,
          profilePic: userPayload?.user?.avatar_url,
        },
        createdAt: userPayload?.user?.created_at,
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Auth check error:", error);
      set({
        isAuthenticated: false,
        isInitialized: true,
        user: null,
        accountType: null,
        isLoading: false,
      });
    }
  },
  logout: () => {
    set({ isLoading: true });
    requests
      .post("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      .then(() => {
        set({
          ...initialState,
          isInitialized: true,
          isLoading: false,
        });
        const url = new URL(window.location.href);
        const params = url.searchParams;
        window.location.href = url.href;
        // usidStorageLocalStorage.upsert("status", "logged-out");
        // usidStorageLocalStorage.upsert("usid", "");
        const bc = new BroadcastChannel("refresh");
        bc.postMessage("refresh");
        bc.close();
      })
      .catch((error) => {
        console.error("Error logging out:", error);
        set({ isLoading: false, error: "An error occurred during logout" });
      });
  },
}));
