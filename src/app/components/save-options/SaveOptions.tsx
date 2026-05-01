import React, { useState, useEffect, useRef } from "react";
import {
  SavedItemData,
  SavedSearchesData,
  SavedSellerData,
} from "@/app/model/MySaved";
import {
  savedItemsStorage,
  savedSellersStorage,
  savedSearchesStorage,
} from "@/app/utils/IndexedDBManager";
import { Toast } from "@/app/utils/toast";
import { FaHeart, FaRegHeart, FaTimes } from "react-icons/fa";
import {
  addMySavedDataToDb,
  deleteMySavedDataToDb,
  updateNoteDataInDb,
} from "@/app/utils/my-saved-utils/my-saved-utils";
import { IndexDbIdEncoder } from "@/app/utils/IndexDbIdCoder";
import { getCookie } from "cookies-next";
import { xorDecode } from "@/app/utils/simpleObfuscator";

const parseSellerUsernames = (username: string | undefined): string[] => {
  if (!username) return [];
  return username
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
};

interface SellerState {
  username: string;
  isSaved: boolean;
  isLoading: boolean;
  note: string;
}
const SaveOptions = ({
  item,
  seller,
  search,
  callBackFn,
}: {
  item?: SavedItemData;
  seller?: SavedSellerData;
  search?: SavedSearchesData;
  callBackFn?: (...args: any[]) => any;
}) => {
  const [isSaved, setIsSaved] = useState({
    item: false,
    search: false,
  });
  const [isLoading, setIsLoading] = useState({
    item: false,
    search: false,
  });

  const [sellers, setSellers] = useState<SellerState[]>([]);

  const itemNoteRef = useRef<HTMLInputElement>(null);
  const searchNoteRef = useRef<HTMLInputElement>(null);

  const sellerNoteRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const timestamp = Date.now();

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const checks = await Promise.allSettled([
          // Check item and load note
          item ? checkItem() : null,
          // Check search and load note
          search ? checkSearch() : null,
          // Check sellers (handles multiple)
          seller ? checkSellers() : null,
        ]);

        // Handle any rejected promises
        checks.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(`Check ${index} failed:`, result.reason);
          }
        });
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };

    const checkItem = async () => {
      if (!item) return;
      const _id = await IndexDbIdEncoder(item.id);
      const itemResponse = await savedItemsStorage.exists(_id);

      setIsSaved((prev) => ({
        ...prev,
        item: itemResponse.data || false,
      }));

      // Load notes if saved
      if (itemResponse.success && itemResponse.data && itemNoteRef.current) {
        const itemData = await savedItemsStorage.getById<SavedItemData>(_id);
        if (itemData.data?.data.note) {
          itemNoteRef.current.value = itemData.data.data.note;
        }
      }
    };

    const checkSellers = async () => {
      if (!seller?.username) return;

      const usernames = parseSellerUsernames(seller.username);

      // Initialize sellers state
      const sellersData: SellerState[] = await Promise.all(
        usernames.map(async (username) => {
          const _id = await IndexDbIdEncoder(username);
          const sellerResponse = await savedSellersStorage.exists(_id);

          let note = "";
          // Load note if seller is saved
          if (sellerResponse.success && sellerResponse.data) {
            const sellerData =
              await savedSellersStorage.getById<SavedSellerData>(_id);
            note = sellerData.data?.data.note || "";
          }

          return {
            username,
            isSaved: sellerResponse.data || false,
            isLoading: false,
            note,
          };
        }),
      );

      setSellers(sellersData);
    };

    const checkSearch = async () => {
      if (!search) return;
      const _id = await IndexDbIdEncoder(search.href);
      const searchResponse = await savedSearchesStorage.exists(_id);
      setIsSaved((prev) => ({
        ...prev,
        search: searchResponse.data || false,
      }));

      if (
        searchResponse.success &&
        searchResponse.data &&
        searchNoteRef.current
      ) {
        const searchData =
          await savedSearchesStorage.getById<SavedSearchesData>(_id);
        if (searchData.data?.data.note) {
          searchNoteRef.current.value = searchData.data.data.note;
        }
      }
    };

    checkIfSaved();
  }, [item?.id, search?.href, seller?.username]);

  const handleToggleSaveItem = async () => {
    if (!item) return;

    setIsLoading((prev) => ({ ...prev, item: true }));
    const _id = await IndexDbIdEncoder(item.id);

    if (isSaved.item) {
      // Delete the item
      const deleteResponse = await savedItemsStorage.delete(_id);

      if (deleteResponse.success) {
        setIsSaved((prev) => ({ ...prev, item: false }));
        if (itemNoteRef.current) {
          itemNoteRef.current.value = "";
        }
        Toast().fire({
          icon: "success",
          title: "Item removed successfully",
        });
        deleteMySavedDataToDb({ id: _id, type: "ITEMS" });
      } else {
        Toast().fire({
          icon: "error",
          title: `Failed to remove: ${deleteResponse.error}`,
        });
      }
    } else {
      // Save the item
      const itemData: SavedItemData = {
        marketplace: "ebay",
        id: item.id,
        title: item.title,
        price: item.price,
        imageUrl: item.imageUrl,
        itemWebUrl: item.itemWebUrl,
        itemAffiliateWebUrl: item.itemAffiliateWebUrl,
        condition: item.condition,
        seller: item.seller,
        note: itemNoteRef.current?.value || "",
        synced: false,
      };
      // const usid = usidStorageLocalStorage.getById("usid").data?.value;
      // const decodedUsid = usid === "" ? undefined : xorDecode(usid);
      const usid = await getCookie("usid");
      const decodedUsid = usid && xorDecode(decodeURIComponent(usid));
      const createResponse = await savedItemsStorage.create<SavedItemData>(
        _id,
        itemData,
        timestamp,
        {
          userId: decodedUsid,
        },
      );

      if (createResponse.success) {
        setIsSaved((prev) => ({ ...prev, item: true }));
        Toast().fire({
          icon: "success",
          html: `
            <div style="text-align: center;">
              <p style="font-weight: 600; margin-bottom: 8px;">Item saved successfully!</p>
              <a href="/my-saved/items" target="_blank" style="color: #3b82f6; text-decoration: underline;">
                View Saved Items
              </a>
            </div>
          `,
        });
        addMySavedDataToDb({
          type: "ITEMS",
          item: {
            id: _id,
            createdAt: timestamp,
            updatedAt: timestamp,
            data: { ...itemData, synced: true },
          },
        });
      } else {
        Toast().fire({
          icon: "error",
          title: `Failed to save: ${createResponse.error}`,
        });
      }
    }

    callBackFn?.(isSaved);
    setIsLoading((prev) => ({ ...prev, item: false }));
  };

  const handleToggleSaveSeller = async (username: string) => {
    if (!seller) return;

    const _id = await IndexDbIdEncoder(username);

    // Update loading state for this specific seller
    setSellers((prev) =>
      prev.map((s) =>
        s.username === username ? { ...s, isLoading: true } : s,
      ),
    );

    const currentSeller = sellers.find((s) => s.username === username);

    if (currentSeller?.isSaved) {
      // Delete the seller
      const deleteResponse = await savedSellersStorage.delete(_id);

      if (deleteResponse.success) {
        setSellers((prev) =>
          prev.map((s) =>
            s.username === username
              ? { ...s, isSaved: false, isLoading: false, note: "" }
              : s,
          ),
        );
        if (sellerNoteRefs.current[username]) {
          sellerNoteRefs.current[username]!.value = "";
        }
        Toast().fire({
          icon: "success",
          title: `Seller "${username}" removed successfully`,
        });
        deleteMySavedDataToDb({ id: _id, type: "SELLERS" });
      } else {
        Toast().fire({
          icon: "error",
          title: `Failed to remove: ${deleteResponse.error}`,
        });
        setSellers((prev) =>
          prev.map((s) =>
            s.username === username ? { ...s, isLoading: false } : s,
          ),
        );
      }
    } else {
      // Save the seller
      const sellerData: SavedSellerData = {
        feedbackPercentage: seller.feedbackPercentage,
        feedbackScore: seller.feedbackScore,
        username: username,
        marketplace: "ebay",
        note: sellerNoteRefs.current[username]?.value || "",
        synced: false,
      };
      // const usid = usidStorageLocalStorage.getById("usid").data?.value;
      // const decodedUsid = usid === "" ? undefined : xorDecode(usid);
      const usid = await getCookie("usid");
      const decodedUsid = usid && xorDecode(decodeURIComponent(usid));
      const createResponse = await savedSellersStorage.create<SavedSellerData>(
        _id,
        sellerData,
        timestamp,
        {
          userId: decodedUsid,
        },
      );

      if (createResponse.success) {
        setSellers((prev) =>
          prev.map((s) =>
            s.username === username
              ? { ...s, isSaved: true, isLoading: false }
              : s,
          ),
        );
        Toast().fire({
          icon: "success",
          html: `
            <div style="text-align: center;">
              <p style="font-weight: 600; margin-bottom: 8px;">Seller "${username}" saved successfully!</p>
              <a href="/my-saved/sellers" target="_blank" style="color: #3b82f6; text-decoration: underline;">
                View Saved Sellers
              </a>
            </div>
          `,
        });
        addMySavedDataToDb({
          type: "SELLERS",
          item: {
            id: _id,
            createdAt: timestamp,
            updatedAt: timestamp,
            data: { ...sellerData, synced: true },
          },
        });
      } else {
        Toast().fire({
          icon: "error",
          title: `Failed to save: ${createResponse.error}`,
        });
        setSellers((prev) =>
          prev.map((s) =>
            s.username === username ? { ...s, isLoading: false } : s,
          ),
        );
      }
    }

    callBackFn?.({ ...isSaved, sellers });
  };

  const handleToggleSaveSearch = async () => {
    if (!search) return;
    if (!search?.href) {
      Toast().fire({
        icon: "error",
        title: "Search information not available",
      });
      return;
    }

    setIsLoading((prev) => ({ ...prev, search: true }));
    const _id = await IndexDbIdEncoder(search.href);

    if (isSaved.search) {
      // Delete the search
      const deleteResponse = await savedSearchesStorage.delete(_id);

      if (deleteResponse.success) {
        setIsSaved((prev) => ({ ...prev, search: false }));
        if (searchNoteRef.current) {
          searchNoteRef.current.value = "";
        }
        Toast().fire({
          icon: "success",
          title: "Search removed successfully",
        });
        deleteMySavedDataToDb({ id: _id, type: "SEARCHES" });
      } else {
        Toast().fire({
          icon: "error",
          title: `Failed to remove: ${deleteResponse.error}`,
        });
      }
    } else {
      // Save the search
      const searchData: SavedSearchesData = {
        href: search.href,
        query: search.query,
        seller: search.seller,
        note: searchNoteRef.current?.value || "",
        synced: false,
      };
      // const usid = usidStorageLocalStorage.getById("usid").data?.value;
      // const decodedUsid = usid === "" ? undefined : xorDecode(usid);
      const usid = await getCookie("usid");
      const decodedUsid = usid && xorDecode(decodeURIComponent(usid));
      const createResponse =
        await savedSearchesStorage.create<SavedSearchesData>(
          _id,
          searchData,
          timestamp,
          {
            userId: decodedUsid,
          },
        );

      if (createResponse.success) {
        setIsSaved((prev) => ({ ...prev, search: true }));
        Toast().fire({
          icon: "success",
          html: `
            <div style="text-align: center;">
              <p style="font-weight: 600; margin-bottom: 8px;">Search saved successfully!</p>
              <a href="/my-saved/searches" target="_blank" style="color: #3b82f6; text-decoration: underline;">
                View Saved Searches
              </a>
            </div>
          `,
        });
        addMySavedDataToDb({
          type: "SEARCHES",
          item: {
            id: _id,
            createdAt: timestamp,
            updatedAt: timestamp,
            data: { ...searchData, synced: true },
          },
        });
      } else {
        Toast().fire({
          icon: "error",
          title: `Failed to save: ${createResponse.error}`,
        });
      }
    }
    callBackFn?.(isSaved);
    setIsLoading((prev) => ({ ...prev, search: false }));
  };

  const handleUpdateNoteItem = async () => {
    if (!item) return;
    const _id = await IndexDbIdEncoder(item.id);
    setIsLoading((prev) => ({ ...prev, item: true }));

    const itemData: SavedItemData = {
      marketplace: "ebay",
      id: item.id,
      title: item.title,
      price: item.price,
      imageUrl: item.imageUrl,
      itemWebUrl: item.itemWebUrl,
      itemAffiliateWebUrl: item.itemAffiliateWebUrl,
      condition: item.condition,
      seller: item.seller,
      note: itemNoteRef.current?.value || "",
      synced: false,
    };

    const updateResponse = await savedItemsStorage.update<SavedItemData>(
      _id,
      itemData,
      timestamp,
    );

    if (updateResponse.success) {
      Toast().fire({
        icon: "success",
        title: "Item note updated successfully",
      });
      updateNoteDataInDb({
        id: _id,
        type: "ITEMS",
        noteText: itemNoteRef.current?.value || "",
      });
    } else {
      Toast().fire({
        icon: "error",
        title: `Failed to update: ${updateResponse.error}`,
      });
    }

    setIsLoading((prev) => ({ ...prev, item: false }));
  };

  const handleUpdateNoteSeller = async (username: string) => {
    if (!seller) return;

    const _id = await IndexDbIdEncoder(username);

    // Update loading state for this specific seller
    setSellers((prev) =>
      prev.map((s) =>
        s.username === username ? { ...s, isLoading: true } : s,
      ),
    );

    const sellerData: SavedSellerData = {
      feedbackPercentage: seller.feedbackPercentage,
      feedbackScore: seller.feedbackScore,
      username: username,
      marketplace: "ebay",
      note: sellerNoteRefs.current[username]?.value || "",
      synced: false,
    };

    const updateResponse = await savedSellersStorage.update<SavedSellerData>(
      _id,
      sellerData,
      timestamp,
    );

    if (updateResponse.success) {
      setSellers((prev) =>
        prev.map((s) =>
          s.username === username
            ? {
                ...s,
                isLoading: false,
                note: sellerNoteRefs.current[username]?.value || "",
              }
            : s,
        ),
      );
      Toast().fire({
        icon: "success",
        title: `Seller "${username}" note updated successfully`,
      });
      updateNoteDataInDb({
        id: _id,
        type: "SELLERS",
        noteText: sellerNoteRefs.current[username]?.value || "",
      });
    } else {
      Toast().fire({
        icon: "error",
        title: `Failed to update: ${updateResponse.error}`,
      });
      setSellers((prev) =>
        prev.map((s) =>
          s.username === username ? { ...s, isLoading: false } : s,
        ),
      );
    }
  };

  const handleUpdateNoteSearch = async () => {
    if (!search?.href) return;
    const _id = await IndexDbIdEncoder(search.href);

    setIsLoading((prev) => ({ ...prev, search: true }));

    const searchData: SavedSearchesData = {
      href: search.href,
      query: search.query,
      seller: search.seller,
      note: searchNoteRef.current?.value || "",
      synced: false,
    };

    const updateResponse = await savedSearchesStorage.update<SavedSearchesData>(
      _id,
      searchData,
      timestamp,
    );

    if (updateResponse.success) {
      Toast().fire({
        icon: "success",
        title: "Search note updated successfully",
      });
      updateNoteDataInDb({
        id: _id,
        type: "SEARCHES",
        noteText: searchNoteRef.current?.value || "",
      });
    } else {
      Toast().fire({
        icon: "error",
        title: `Failed to update: ${updateResponse.error}`,
      });
    }

    setIsLoading((prev) => ({ ...prev, search: false }));
  };

  const itemContent = item && (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Save Item
      </h3>
      <p className="text-xs p-1 border-1 border-gray-700/50">{item.title}</p>
      <div className="space-y-2">
        <div className="relative">
          <input
            ref={itemNoteRef}
            type="text"
            placeholder="Add a note (optional)"
            disabled={isLoading.item}
            className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed transition-all"
          />
          <button
            onClick={() => {
              if (itemNoteRef.current) {
                itemNoteRef.current.value = "";
              }
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleToggleSaveItem}
            disabled={isLoading.item}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              isSaved.item
                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
                : "bg-blue-500 dark:bg-light-dark text-white dark:hover:bg-gray-900 shadow-sm hover:shadow-md"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading.item ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : isSaved.item ? (
              <>
                <FaHeart className="w-4 h-4" />
                <span>Remove Item</span>
              </>
            ) : (
              <>
                <FaRegHeart className="w-4 h-4" />
                <span>Save Item</span>
              </>
            )}
          </button>
          {isSaved.item && (
            <button
              onClick={handleUpdateNoteItem}
              disabled={isLoading.item}
              className="px-4 py-2.5 rounded-lg font-medium text-sm bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Note
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const sellersContent = sellers.length > 0 && (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Save Seller{sellers.length > 1 ? "s" : ""}
      </h3>
      <div className="space-y-4">
        {sellers.map((sellerState, index) => (
          <div
            key={sellerState.username}
            className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div className="flex w-full items-center gap-1.5 sm:gap-2 px-2 py-1.5 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Seller{sellers.length > 1 ? ` ${index + 1}:` : ":"}
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-gray-100 truncate min-w-0">
                {sellerState.username}
              </span>
              {seller?.feedbackPercentage && (
                <span className="ml-auto flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs shrink-0">
                  <span className="text-yellow-500">★</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {seller.feedbackPercentage}%
                  </span>
                </span>
              )}
            </div>

            <div className="relative">
              <input
                ref={(el) => {
                  sellerNoteRefs.current[sellerState.username] = el;
                }}
                type="text"
                placeholder="Add a note about seller (optional)"
                defaultValue={sellerState.note}
                disabled={sellerState.isLoading}
                className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed transition-all"
              />
              <button
                onClick={() => {
                  if (sellerNoteRefs.current[sellerState.username]) {
                    sellerNoteRefs.current[sellerState.username]!.value = "";
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleToggleSaveSeller(sellerState.username)}
                disabled={sellerState.isLoading}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  sellerState.isSaved
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
                    : "bg-blue-500 dark:bg-light-dark text-white dark:hover:bg-gray-900 shadow-sm hover:shadow-md"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {sellerState.isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : sellerState.isSaved ? (
                  <>
                    <FaHeart className="w-4 h-4" />
                    <span>Remove Seller</span>
                  </>
                ) : (
                  <>
                    <FaRegHeart className="w-4 h-4" />
                    <span>Save Seller</span>
                  </>
                )}
              </button>
              {sellerState.isSaved && (
                <button
                  onClick={() => handleUpdateNoteSeller(sellerState.username)}
                  disabled={sellerState.isLoading}
                  className="px-4 py-2.5 rounded-lg font-medium text-sm bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Note
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const searchContent = search && (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Save Search
      </h3>
      <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Query:
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {search.query}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            link:
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 underline">
            {search.href}
          </span>
        </div>
        {search.seller && (
          <div className="flex flex-col gap-1 pt-2 border-t border-gray-200 dark:border-gray-600">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Seller Filter:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {search.seller}
            </span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="relative">
          <input
            ref={searchNoteRef}
            type="text"
            placeholder="Add a note about this search (optional)"
            disabled={isLoading.search}
            className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed transition-all"
          />
          <button
            onClick={() => {
              if (searchNoteRef.current) {
                searchNoteRef.current.value = "";
              }
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleToggleSaveSearch}
            disabled={isLoading.search}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              isSaved.search
                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
                : "bg-blue-500 dark:bg-light-dark text-white dark:hover:bg-gray-900 shadow-sm hover:shadow-md"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading.search ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : isSaved.search ? (
              <>
                <FaHeart className="w-4 h-4" />
                <span>Remove Search</span>
              </>
            ) : (
              <>
                <FaRegHeart className="w-4 h-4" />
                <span>Save Search</span>
              </>
            )}
          </button>
          {isSaved.search && (
            <button
              onClick={handleUpdateNoteSearch}
              disabled={isLoading.search}
              className="px-4 py-2.5 rounded-lg font-medium text-sm bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Note
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {itemContent}
      {itemContent && sellersContent && (
        <div className="border-t border-gray-200 dark:border-gray-700" />
      )}
      {sellersContent}
      {(itemContent || sellersContent) && searchContent && (
        <div className="border-t border-gray-200 dark:border-gray-700" />
      )}
      {searchContent}
    </div>
  );
};

export default SaveOptions;

// import React, { useState, useEffect, useRef } from "react";
// import {
//   SavedItemData,
//   SavedSearchesData,
//   SavedSellerData,
// } from "@/app/model/MySaved";
// import {
//   savedItemsStorage,
//   savedSellersStorage,
//   savedSearchesStorage,
// } from "@/app/utils/IndexedDBManager";
// import { Toast } from "@/app/utils/toast";
// import { FaHeart, FaRegHeart, FaTimes } from "react-icons/fa";
// import {
//   addMySavedDataToDb,
//   deleteMySavedDataToDb,
//   updateNoteDataInDb,
// } from "@/app/utils/my-saved-utils/my-saved-utils";
// import { IndexDbIdEncoder } from "@/app/utils/IndexDbIdCoder";
// import { usidStorageLocalStorage } from "@/app/utils/LocalStorageManager";

// /**
//  * SaveOptions
//  *
//  * A component that renders save options for items, sellers, and searches.
//  *
//  * @param {object} item - The item data to be saved.
//  * @param {object} seller - The seller data to be saved.
//  * @param {object} search - The search data to be saved.
//  * @param {function} callBackFn - An optional callback function to call after saving an item, seller, or search it passes the ```isSaved``` Object.
//  * @returns {JSX.Element} A component that renders save options for items, sellers, and searches.
//  */
// const SaveOptions = ({
//   item,
//   seller,
//   search,
//   callBackFn,
// }: {
//   item?: SavedItemData;
//   seller?: SavedSellerData;
//   search?: SavedSearchesData;
//   callBackFn?: (...args: any[]) => any;
// }) => {
//   const [isSaved, setIsSaved] = useState({
//     item: false,
//     seller: false,
//     search: false,
//   });
//   const [isLoading, setIsLoading] = useState({
//     item: false,
//     seller: false,
//     search: false,
//   });

//   // Use refs for input values instead of state
//   const itemNoteRef = useRef<HTMLInputElement>(null);
//   const sellerNoteRef = useRef<HTMLInputElement>(null);
//   const searchNoteRef = useRef<HTMLInputElement>(null);
//   const timestamp = Date.now();

//   useEffect(() => {
//     const checkIfSaved = async () => {
//       try {
//         const checks = await Promise.allSettled([
//           // Check item and load note
//           item ? checkItem() : null,
//           // Check search and load note
//           search ? checkSearch() : null,
//           // Check seller
//           seller ? checkSeller() : null,
//         ]);

//         // Handle any rejected promises
//         checks.forEach((result, index) => {
//           if (result.status === "rejected") {
//             console.error(`Check ${index} failed:`, result.reason);
//           }
//         });
//       } catch (error) {
//         console.error("Error checking saved status:", error);
//       }
//     };

//     const checkItem = async () => {
//       if (!item) return;
//       const _id = await IndexDbIdEncoder(item.id);
//       const [itemResponse, sellerResponse] = await Promise.all([
//         savedItemsStorage.exists(_id),
//         item.seller?.username
//           ? savedSellersStorage.exists(item.seller.username)
//           : Promise.resolve({ data: false, success: false }),
//       ]);
//       setIsSaved((prev) => ({
//         ...prev,
//         item: itemResponse.data || false,
//         seller: sellerResponse.data || false,
//       }));

//       // Load notes if saved
//       if (itemResponse.success && itemResponse.data && itemNoteRef.current) {
//         const itemData = await savedItemsStorage.getById<SavedItemData>(_id);
//         if (itemData.data?.data.note) {
//           itemNoteRef.current.value = itemData.data.data.note;
//         }
//       }

//       if (
//         sellerResponse.success &&
//         sellerResponse.data &&
//         sellerNoteRef.current &&
//         item.seller?.username
//       ) {
//         const sellerData = await savedSellersStorage.getById<SavedSellerData>(
//           item.seller.username,
//         );
//         if (sellerData.data?.data.note) {
//           sellerNoteRef.current.value = sellerData.data.data.note;
//         }
//       }
//     };

//     const checkSearch = async () => {
//       if (!search) return;
//       const _id = await IndexDbIdEncoder(search.href);
//       const searchResponse = await savedSearchesStorage.exists(_id);
//       setIsSaved((prev) => ({
//         ...prev,
//         search: searchResponse.data || false,
//       }));

//       if (
//         searchResponse.success &&
//         searchResponse.data &&
//         searchNoteRef.current
//       ) {
//         const searchData =
//           await savedSearchesStorage.getById<SavedSearchesData>(_id);
//         if (searchData.data?.data.note) {
//           searchNoteRef.current.value = searchData.data.data.note;
//         }
//       }
//     };

//     const checkSeller = async () => {
//       if (!seller) return;
//       const _id = await IndexDbIdEncoder(seller.username);
//       const sellerResponse = await savedSellersStorage.exists(_id);
//       setIsSaved((prev) => ({
//         ...prev,
//         seller: sellerResponse.data || false,
//       }));

//       if (
//         sellerResponse.success &&
//         sellerResponse.data &&
//         sellerNoteRef.current
//       ) {
//         const sellerData =
//           await savedSellersStorage.getById<SavedSellerData>(_id);
//         if (sellerData.data?.data.note) {
//           sellerNoteRef.current.value = sellerData.data.data.note;
//         }
//       }
//     };

//     checkIfSaved();
//   }, [item?.id, item?.seller?.username, search?.href, seller?.username]);

//   const handleToggleSaveItem = async () => {
//     if (!item) return;

//     setIsLoading((prev) => ({ ...prev, item: true }));
//     const _id = await IndexDbIdEncoder(item.id);

//     if (isSaved.item) {
//       // Delete the item
//       const deleteResponse = await savedItemsStorage.delete(_id);

//       if (deleteResponse.success) {
//         setIsSaved((prev) => ({ ...prev, item: false }));
//         if (itemNoteRef.current) {
//           itemNoteRef.current.value = "";
//         }
//         Toast().fire({
//           icon: "success",
//           title: "Item removed successfully",
//         });
//         deleteMySavedDataToDb({ id: _id, type: "ITEMS" });
//       } else {
//         Toast().fire({
//           icon: "error",
//           title: `Failed to remove: ${deleteResponse.error}`,
//         });
//       }
//     } else {
//       // Save the item
//       const itemData: SavedItemData = {
//         marketplace: "ebay",
//         id: item.id,
//         title: item.title,
//         price: item.price,
//         imageUrl: item.imageUrl,
//         itemWebUrl: item.itemWebUrl,
//         itemAffiliateWebUrl: item.itemAffiliateWebUrl,
//         condition: item.condition,
//         seller: item.seller,
//         note: itemNoteRef.current?.value || "",
//         synced: false,
//       };
//       // const usid = await getCookie("usid");
//       const usid = usidStorageLocalStorage.getById("usid").data?.value;
//       const decodedUsid = usid === "" ? undefined : usid;
//       // const decodedUsid = usid && xorDecode(decodeURIComponent(usid));
//       const createResponse = await savedItemsStorage.create<SavedItemData>(
//         _id,
//         itemData,
//         timestamp,
//         {
//           userId: decodedUsid,
//         },
//       );

//       if (createResponse.success) {
//         setIsSaved((prev) => ({ ...prev, item: true }));
//         Toast().fire({
//           icon: "success",
//           html: `
//             <div style="text-align: center;">
//               <p style="font-weight: 600; margin-bottom: 8px;">Item saved successfully!</p>
//               <a href="/my-saved/items" target="_blank" style="color: #3b82f6; text-decoration: underline;">
//                 View Saved Items
//               </a>
//             </div>
//           `,
//         });
//         addMySavedDataToDb({
//           type: "ITEMS",
//           item: {
//             id: _id,
//             createdAt: timestamp,
//             updatedAt: timestamp,
//             data: itemData,
//           },
//         });
//       } else {
//         Toast().fire({
//           icon: "error",
//           title: `Failed to save: ${createResponse.error}`,
//         });
//       }
//     }

//     callBackFn?.(isSaved);
//     setIsLoading((prev) => ({ ...prev, item: false }));
//   };

//   const handleToggleSaveSeller = async () => {
//     if (!seller) return;
//     if (!seller?.username) {
//       Toast().fire({
//         icon: "error",
//         title: "Seller information not available",
//       });
//       return;
//     }
//     const _id = await IndexDbIdEncoder(seller.username);
//     setIsLoading((prev) => ({ ...prev, seller: true }));

//     if (isSaved.seller) {
//       // Delete the seller
//       const deleteResponse = await savedSellersStorage.delete(_id);

//       if (deleteResponse.success) {
//         setIsSaved((prev) => ({ ...prev, seller: false }));
//         if (sellerNoteRef.current) {
//           sellerNoteRef.current.value = "";
//         }
//         Toast().fire({
//           icon: "success",
//           title: "Seller removed successfully",
//         });
//         deleteMySavedDataToDb({ id: _id, type: "SELLERS" });
//       } else {
//         Toast().fire({
//           icon: "error",
//           title: `Failed to remove: ${deleteResponse.error}`,
//         });
//       }
//     } else {
//       // Save the seller
//       const sellerData: SavedSellerData = {
//         feedbackPercentage: seller.feedbackPercentage,
//         feedbackScore: seller.feedbackScore,
//         username: seller.username,
//         marketplace: "ebay",
//         note: sellerNoteRef.current?.value || "",
//         synced: false,
//       };
//       // const usid = await getCookie("usid");
//       const usid = usidStorageLocalStorage.getById("usid").data?.value;
//       // const decodedUsid = usid && xorDecode(decodeURIComponent(usid));
//       const decodedUsid = usid === "" ? undefined : usid;
//       const createResponse = await savedSellersStorage.create<SavedSellerData>(
//         _id,
//         sellerData,
//         timestamp,
//         {
//           userId: decodedUsid,
//         },
//       );

//       if (createResponse.success) {
//         setIsSaved((prev) => ({ ...prev, seller: true }));
//         Toast().fire({
//           icon: "success",
//           html: `
//             <div style="text-align: center;">
//               <p style="font-weight: 600; margin-bottom: 8px;">Seller saved successfully!</p>
//               <a href="/my-saved/sellers" target="_blank" style="color: #3b82f6; text-decoration: underline;">
//                 View Saved Sellers
//               </a>
//             </div>
//           `,
//         });
//         addMySavedDataToDb({
//           type: "SELLERS",
//           item: {
//             id: _id,
//             createdAt: timestamp,
//             updatedAt: timestamp,
//             data: sellerData,
//           },
//         });
//       } else {
//         Toast().fire({
//           icon: "error",
//           title: `Failed to save: ${createResponse.error}`,
//         });
//       }
//     }

//     callBackFn?.(isSaved);
//     setIsLoading((prev) => ({ ...prev, seller: false }));
//   };

//   const handleToggleSaveSearch = async () => {
//     if (!search) return;
//     if (!search?.href) {
//       Toast().fire({
//         icon: "error",
//         title: "Search information not available",
//       });
//       return;
//     }

//     setIsLoading((prev) => ({ ...prev, search: true }));
//     const _id = await IndexDbIdEncoder(search.href);

//     if (isSaved.search) {
//       // Delete the search
//       const deleteResponse = await savedSearchesStorage.delete(_id);

//       if (deleteResponse.success) {
//         setIsSaved((prev) => ({ ...prev, search: false }));
//         if (searchNoteRef.current) {
//           searchNoteRef.current.value = "";
//         }
//         Toast().fire({
//           icon: "success",
//           title: "Search removed successfully",
//         });
//         deleteMySavedDataToDb({ id: _id, type: "SEARCHES" });
//       } else {
//         Toast().fire({
//           icon: "error",
//           title: `Failed to remove: ${deleteResponse.error}`,
//         });
//       }
//     } else {
//       // Save the search
//       const searchData: SavedSearchesData = {
//         href: search.href,
//         query: search.query,
//         seller: search.seller,
//         note: searchNoteRef.current?.value || "",
//         synced: false,
//       };
//       // const usid = await getCookie("usid");
//       const usid = usidStorageLocalStorage.getById("usid").data?.value;
//       const decodedUsid = usid === "" ? undefined : usid;
//       // const decodedUsid = usid && xorDecode(decodeURIComponent(usid));
//       const createResponse =
//         await savedSearchesStorage.create<SavedSearchesData>(
//           _id,
//           searchData,
//           timestamp,
//           {
//             userId: decodedUsid,
//           },
//         );

//       if (createResponse.success) {
//         setIsSaved((prev) => ({ ...prev, search: true }));
//         Toast().fire({
//           icon: "success",
//           html: `
//             <div style="text-align: center;">
//               <p style="font-weight: 600; margin-bottom: 8px;">Search saved successfully!</p>
//               <a href="/my-saved/searches" target="_blank" style="color: #3b82f6; text-decoration: underline;">
//                 View Saved Searches
//               </a>
//             </div>
//           `,
//         });
//         addMySavedDataToDb({
//           type: "SEARCHES",
//           item: {
//             id: _id,
//             createdAt: timestamp,
//             updatedAt: timestamp,
//             data: searchData,
//           },
//         });
//       } else {
//         Toast().fire({
//           icon: "error",
//           title: `Failed to save: ${createResponse.error}`,
//         });
//       }
//     }
//     callBackFn?.(isSaved);
//     setIsLoading((prev) => ({ ...prev, search: false }));
//   };

//   const handleUpdateNoteItem = async () => {
//     if (!item) return;
//     const _id = await IndexDbIdEncoder(item.id);
//     setIsLoading((prev) => ({ ...prev, item: true }));

//     const itemData: SavedItemData = {
//       marketplace: "ebay",
//       id: item.id,
//       title: item.title,
//       price: item.price,
//       imageUrl: item.imageUrl,
//       itemWebUrl: item.itemWebUrl,
//       itemAffiliateWebUrl: item.itemAffiliateWebUrl,
//       condition: item.condition,
//       seller: item.seller,
//       note: itemNoteRef.current?.value || "",
//       synced: false,
//     };

//     const updateResponse = await savedItemsStorage.update<SavedItemData>(
//       _id,
//       itemData,
//       timestamp,
//     );

//     if (updateResponse.success) {
//       Toast().fire({
//         icon: "success",
//         title: "Item note updated successfully",
//       });
//       updateNoteDataInDb({
//         id: _id,
//         type: "SELLERS",
//         noteText: itemNoteRef.current?.value || "",
//       });
//     } else {
//       Toast().fire({
//         icon: "error",
//         title: `Failed to update: ${updateResponse.error}`,
//       });
//     }

//     setIsLoading((prev) => ({ ...prev, item: false }));
//   };

//   const handleUpdateNoteSeller = async () => {
//     if (!item?.seller?.username) return;
//     const _id = await IndexDbIdEncoder(item.seller.username);

//     setIsLoading((prev) => ({ ...prev, seller: true }));

//     const sellerData: SavedSellerData = {
//       feedbackPercentage: item.seller.feedbackPercentage,
//       feedbackScore: item.seller.feedbackScore,
//       username: item.seller.username,
//       marketplace: "ebay",
//       note: sellerNoteRef.current?.value || "",
//       synced: false,
//     };

//     const updateResponse = await savedSellersStorage.update<SavedSellerData>(
//       item.seller.username,
//       sellerData,
//       timestamp,
//     );

//     if (updateResponse.success) {
//       Toast().fire({
//         icon: "success",
//         title: "Seller note updated successfully",
//       });
//       updateNoteDataInDb({
//         id: _id,
//         type: "SELLERS",
//         noteText: sellerNoteRef.current?.value || "",
//       });
//     } else {
//       Toast().fire({
//         icon: "error",
//         title: `Failed to update: ${updateResponse.error}`,
//       });
//     }

//     setIsLoading((prev) => ({ ...prev, seller: false }));
//   };

//   const handleUpdateNoteSearch = async () => {
//     if (!search?.href) return;
//     const _id = await IndexDbIdEncoder(search.href);

//     setIsLoading((prev) => ({ ...prev, search: true }));

//     const searchData: SavedSearchesData = {
//       href: search.href,
//       query: search.query,
//       seller: search.seller,
//       note: searchNoteRef.current?.value || "",
//       synced: false,
//     };

//     const updateResponse = await savedSearchesStorage.update<SavedSearchesData>(
//       _id,
//       searchData,
//       timestamp,
//     );

//     if (updateResponse.success) {
//       Toast().fire({
//         icon: "success",
//         title: "Search note updated successfully",
//       });
//       updateNoteDataInDb({
//         id: _id,
//         type: "SELLERS",
//         noteText: searchNoteRef.current?.value || "",
//       });
//     } else {
//       Toast().fire({
//         icon: "error",
//         title: `Failed to update: ${updateResponse.error}`,
//       });
//     }

//     setIsLoading((prev) => ({ ...prev, search: false }));
//   };

//   const itemContent = item && (
//     <div className="space-y-3">
//       <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
//         Save Item
//       </h3>
//       <div className="space-y-2">
//         <div className="relative">
//           <input
//             ref={itemNoteRef}
//             type="text"
//             placeholder="Add a note (optional)"
//             disabled={isLoading.item}
//             className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed transition-all"
//           />
//           <button
//             onClick={() => {
//               if (itemNoteRef.current) {
//                 itemNoteRef.current.value = "";
//               }
//             }}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//           >
//             <FaTimes className="w-4 h-4" />
//           </button>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={handleToggleSaveItem}
//             disabled={isLoading.item}
//             className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
//               isSaved.item
//                 ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
//                 : "bg-blue-500 dark:bg-light-dark text-white dark:hover:bg-gray-900 shadow-sm hover:shadow-md"
//             } disabled:opacity-50 disabled:cursor-not-allowed`}
//           >
//             {isLoading.item ? (
//               <>
//                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 <span>Processing...</span>
//               </>
//             ) : isSaved.item ? (
//               <>
//                 <FaHeart className="w-4 h-4" />
//                 <span>Remove Item</span>
//               </>
//             ) : (
//               <>
//                 <FaRegHeart className="w-4 h-4" />
//                 <span>Save Item</span>
//               </>
//             )}
//           </button>
//           {isSaved.item && (
//             <button
//               onClick={handleUpdateNoteItem}
//               disabled={isLoading.item}
//               className="px-4 py-2.5 rounded-lg font-medium text-sm bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Update Note
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   const sellerContent = seller && (
//     <div className="space-y-3">
//       <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
//         Save Seller
//       </h3>
//       <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
//         <span className="text-xs text-gray-500 dark:text-gray-400">
//           Seller:
//         </span>
//         <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
//           {seller.username}
//         </span>
//         {seller.feedbackPercentage && (
//           <span className="ml-auto flex items-center gap-1 text-xs">
//             <span className="text-yellow-500">★</span>
//             <span className="font-semibold text-gray-700 dark:text-gray-300">
//               {seller.feedbackPercentage}%
//             </span>
//           </span>
//         )}
//       </div>
//       <div className="space-y-2">
//         <div className="relative">
//           <input
//             ref={sellerNoteRef}
//             type="text"
//             placeholder="Add a note about seller (optional)"
//             disabled={isLoading.seller}
//             className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed transition-all"
//           />
//           <button
//             onClick={() => {
//               if (sellerNoteRef.current) {
//                 sellerNoteRef.current.value = "";
//               }
//             }}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//           >
//             <FaTimes className="w-4 h-4" />
//           </button>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={handleToggleSaveSeller}
//             disabled={isLoading.seller}
//             className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
//               isSaved.seller
//                 ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
//                 : "bg-blue-500 dark:bg-light-dark text-white dark:hover:bg-gray-900 shadow-sm hover:shadow-md"
//             } disabled:opacity-50 disabled:cursor-not-allowed`}
//           >
//             {isLoading.seller ? (
//               <>
//                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 <span>Processing...</span>
//               </>
//             ) : isSaved.seller ? (
//               <>
//                 <FaHeart className="w-4 h-4" />
//                 <span>Remove Seller</span>
//               </>
//             ) : (
//               <>
//                 <FaRegHeart className="w-4 h-4" />
//                 <span>Save Seller</span>
//               </>
//             )}
//           </button>
//           {isSaved.seller && (
//             <button
//               onClick={handleUpdateNoteSeller}
//               disabled={isLoading.seller}
//               className="px-4 py-2.5 rounded-lg font-medium text-sm bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Update Note
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   const searchContent = search && (
//     <div className="space-y-3">
//       <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
//         Save Search
//       </h3>
//       <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
//         <div className="flex flex-col gap-1">
//           <span className="text-xs text-gray-500 dark:text-gray-400">
//             Query:
//           </span>
//           <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
//             {search.query}
//           </span>
//         </div>
//         <div className="flex flex-col gap-1">
//           <span className="text-xs text-gray-500 dark:text-gray-400">
//             link:
//           </span>
//           <span className="text-sm font-medium text-gray-900 dark:text-gray-100 underline">
//             {search.href}
//           </span>
//         </div>
//         {search.seller && (
//           <div className="flex flex-col gap-1 pt-2 border-t border-gray-200 dark:border-gray-600">
//             <span className="text-xs text-gray-500 dark:text-gray-400">
//               Seller Filter:
//             </span>
//             <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
//               {search.seller}
//             </span>
//           </div>
//         )}
//       </div>
//       <div className="space-y-2">
//         <div className="relative">
//           <input
//             ref={searchNoteRef}
//             type="text"
//             placeholder="Add a note about this search (optional)"
//             disabled={isLoading.search}
//             className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed transition-all"
//           />
//           <button
//             onClick={() => {
//               if (searchNoteRef.current) {
//                 searchNoteRef.current.value = "";
//               }
//             }}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//           >
//             <FaTimes className="w-4 h-4" />
//           </button>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={handleToggleSaveSearch}
//             disabled={isLoading.search}
//             className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
//               isSaved.search
//                 ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
//                 : "bg-blue-500 dark:bg-light-dark text-white dark:hover:bg-gray-900 shadow-sm hover:shadow-md"
//             } disabled:opacity-50 disabled:cursor-not-allowed`}
//           >
//             {isLoading.search ? (
//               <>
//                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 <span>Processing...</span>
//               </>
//             ) : isSaved.search ? (
//               <>
//                 <FaHeart className="w-4 h-4" />
//                 <span>Remove Search</span>
//               </>
//             ) : (
//               <>
//                 <FaRegHeart className="w-4 h-4" />
//                 <span>Save Search</span>
//               </>
//             )}
//           </button>
//           {isSaved.search && (
//             <button
//               onClick={handleUpdateNoteSearch}
//               disabled={isLoading.search}
//               className="px-4 py-2.5 rounded-lg font-medium text-sm bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Update Note
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
//       {itemContent}
//       {itemContent && sellerContent && (
//         <div className="border-t border-gray-200 dark:border-gray-700" />
//       )}
//       {sellerContent}
//       {(itemContent || sellerContent) && searchContent && (
//         <div className="border-t border-gray-200 dark:border-gray-700" />
//       )}
//       {searchContent}
//     </div>
//   );
// };

// export default SaveOptions;
