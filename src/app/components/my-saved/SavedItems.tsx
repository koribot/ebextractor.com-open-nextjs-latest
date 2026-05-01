"use client";

import { useState, useEffect } from "react";
import {
  FaHeart,
  FaTrash,
  FaExternalLinkAlt,
  FaFilter,
  FaTimes,
  FaEdit,
  FaSave,
  FaCalendar,
  FaUser,
  FaStar,
  FaTag,
  FaDollarSign,
} from "react-icons/fa";
import { FaNoteSticky } from "react-icons/fa6";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { savedItemsStorage, StorageItem } from "@/app/utils/IndexedDBManager";
import {
  clearAllDataFromIndexedDb,
  deleteAllMySavedDataToDb,
  deleteMySavedDataToDb,
  getDataFromIndexedDb,
  removeDataWithUserIdFromIndexDB,
  syncDataBetweenDbAndIndexedDb,
  updateNoteDataInDb,
} from "@/app/utils/my-saved-utils/my-saved-utils";
import { SavedItemData } from "@/app/model/MySaved";
import { getCookie } from "cookies-next";

type SortOption = "newest" | "oldest" | "price-low" | "price-high" | "title";
export default function SavedItems() {
  const [items, setItems] = useState<StorageItem<SavedItemData>[] | undefined>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const path = usePathname();
  const arrayOfPaths = path.split("/");
  const timestamp = Date.now();

  const loadItemsFromIndexedDb = async () => {
    const data = (await getDataFromIndexedDb(
      "ITEMS",
    )) as StorageItem<SavedItemData>[];
    setItems(data);
    setIsLoading(false);
  };

  useEffect(() => {
    syncDataBetweenDbAndIndexedDb("ITEMS");
    loadItemsFromIndexedDb();
  }, []);

  // Filter and sort items
  const filteredAndSortedItems = items
    ?.filter((item) => {
      if (searchQuery.trim() === "") return true;
      const query = searchQuery.toLowerCase();
      return (
        item.data.title.toLowerCase().includes(query) ||
        item.data.seller?.username.toLowerCase().includes(query) ||
        item.data.condition?.toLowerCase().includes(query) ||
        item.data.note?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt - a.createdAt;
        case "oldest":
          return a.createdAt - b.createdAt;
        case "price-low":
          return (
            parseFloat(a.data.price.value) - parseFloat(b.data.price.value)
          );
        case "price-high":
          return (
            parseFloat(b.data.price.value) - parseFloat(a.data.price.value)
          );
        case "title":
          return a.data.title.localeCompare(b.data.title);
        default:
          return 0;
      }
    });

  // Delete single item
  const handleDelete = async (itemId: string) => {
    if (confirm("Remove this item from saved?")) {
      setIsDeleting(true);
      const response = await savedItemsStorage.delete(itemId);
      if (response.success) {
        await loadItemsFromIndexedDb();
        deleteMySavedDataToDb({ id: itemId, type: "ITEMS" });
      }
      setIsDeleting(false);
    }
  };

  // Clear all items
  const handleClearAll = async () => {
    if (confirm(`Remove all ${items?.length} saved items?`)) {
      const usid = await getCookie("usid");
      setIsDeleting(true);
      const response = usid
        ? await removeDataWithUserIdFromIndexDB("ITEMS")
        : await clearAllDataFromIndexedDb("ITEMS");

      if (response) {
        deleteAllMySavedDataToDb("ITEMS");
        setItems([]);
      }
      setIsDeleting(false);
    }
  };

  // Export data
  const handleExport = async () => {
    const response = await savedItemsStorage.export();
    if (response.success && response.data) {
      const blob = new Blob([response.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `saved-ebay-items-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Start editing note
  const handleEditNote = (
    itemId: string,
    currentNote: string | null | undefined = "",
  ) => {
    setEditingNoteId(itemId);
    setNoteText(currentNote || "");
  };

  // Save edited note
  const handleSaveNote = async (itemId: string) => {
    const response = await savedItemsStorage.update<SavedItemData>(
      itemId,
      {
        note: noteText,
        synced: false,
      },
      timestamp,
    );

    if (response.success) {
      setIsLoading(true);
      const res = updateNoteDataInDb({
        id: itemId,
        type: "ITEMS",
        noteText,
      });
      await loadItemsFromIndexedDb();
      setIsLoading(false);
      setEditingNoteId(null);
      // setNoteText(res ? noteText : "");
      return;
    }
    setEditingNoteId(null);
    setNoteText("");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setNoteText("");
  };

  // Handle Enter key to save
  const handleNoteKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveNote(id);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  // Format date
  const formatDate = (_timestamp: number) => {
    const date = new Date(_timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  if (items?.length === 0 && !isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-10">
        <nav>
          <ol className="flex items-center flex-wrap gap-1 text-sm text-gray-600 dark:text-gray-300 mb-2">
            {arrayOfPaths.map((item, index) => {
              const isLast = index === arrayOfPaths.length - 1;
              const label = item === "" ? "Home" : decodeURIComponent(item);

              return (
                <li key={index} className="flex items-center gap-1">
                  {!isLast ? (
                    <Link
                      prefetch={false}
                      href={`/${item}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span className="font-medium text-gray-900 underline dark:text-white">
                      {label}
                    </span>
                  )}

                  {!isLast && (
                    <span className="text-gray-400 dark:text-gray-500">/</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-full p-8 mb-6">
            <FaHeart className="text-6xl text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            No Saved Items Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md text-lg">
            Start saving items by clicking the heart icon on any eBay listing.
            Your saved items will appear here.
          </p>
          <Link
            prefetch={false}
            href="/search"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Browsing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10">
      {/* Breadcrumb */}
      {(isDeleting || isLoading) && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-white font-medium drop-shadow-lg">
              {isLoading ? "Loading Please wait..." : "Deleting Please wait..."}
            </p>
          </div>
        </div>
      )}
      {/* Breadcrumb */}
      <nav>
        <ol className="flex items-center flex-wrap gap-1 text-sm text-gray-600 dark:text-gray-300 mb-2">
          {arrayOfPaths.map((item, index) => {
            const isLast = index === arrayOfPaths.length - 1;
            const label = item === "" ? "Home" : decodeURIComponent(item);

            return (
              <li key={index} className="flex items-center gap-1">
                {!isLast ? (
                  <Link
                    prefetch={false}
                    href={`/${item}`}
                    className="hover:text-red-600 dark:hover:text-red-400 transition"
                  >
                    {label}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-900 underline dark:text-white">
                    {label}
                  </span>
                )}

                {!isLast && (
                  <span className="text-gray-400 dark:text-gray-500">/</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaHeart className="text-blue-600 dark:text-blue-400" />
              Saved Items
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              {filteredAndSortedItems?.length}{" "}
              {filteredAndSortedItems?.length === 1 ? "item" : "items"}
              {searchQuery && " found"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* <button
              onClick={handleExport}
              className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-900 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              Export JSON
            </button> */}
            {items && items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-6 py-3 bg-red-600 dark:bg-light-dark text-white rounded-lg hover:bg-red-700 transition-all font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <FaTrash />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Search Filter and Sort */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by title, seller, condition, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items List */}
      {filteredAndSortedItems?.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <FaHeart className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No items match your filter
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedItems?.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex gap-4 flex-1 min-w-0">
                  {/* Image */}
                  <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                    {item.data.imageUrl ? (
                      <Image
                        src={item.data.imageUrl}
                        alt={item.data.title}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-semibold">
                        Item
                      </p>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white break-words">
                        {item.data.title}
                      </h3>
                    </div>

                    {/* Price and Condition */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start gap-3">
                        <FaDollarSign className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                            Price
                          </p>
                          <p className="text-base font-bold text-gray-900 dark:text-white">
                            {item?.data?.price?.currency === "USD"
                              ? "$"
                              : item?.data?.price?.currency}
                            {item?.data?.price?.value}
                          </p>
                        </div>
                      </div>

                      {item.data.condition && (
                        <div className="flex items-start gap-3">
                          <FaTag className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                              Condition
                            </p>
                            <p className="text-base font-medium text-gray-900 dark:text-white">
                              {item.data.condition}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Seller Info */}
                    {item.data.seller && (
                      <div className="flex items-start gap-3 mb-4">
                        <FaUser className="text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-semibold">
                            Seller
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-base font-medium text-gray-900 dark:text-white">
                              {item.data.seller.username}
                            </p>
                            <div className="flex items-center gap-1">
                              <FaStar className="text-yellow-500 text-xs" />
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {item.data.seller.feedbackPercentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Note Section */}
                    <div className="flex items-start gap-3">
                      <FaNoteSticky className="text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                            Notes
                          </p>
                          {editingNoteId !== item.id && (
                            <button
                              onClick={() =>
                                handleEditNote(item.id, item.data.note)
                              }
                              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 font-medium"
                            >
                              <FaEdit />
                              Edit
                            </button>
                          )}
                        </div>

                        {editingNoteId === item.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              onKeyDown={(e) => handleNoteKeyPress(e, item.id)}
                              placeholder="Add a note about this item..."
                              rows={3}
                              autoFocus
                              className="w-full px-3 py-2 border-2 border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSaveNote(item.id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-semibold"
                              >
                                <FaSave />
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm font-semibold"
                              >
                                <FaTimes />
                                Cancel
                              </button>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                Press Enter to save, Esc to cancel
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 min-h-[60px]">
                            {item.data.note || (
                              <span className="text-gray-400 dark:text-gray-500 italic">
                                No notes added. Click Edit to add notes.
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
                      <FaCalendar />
                      <span>Saved {formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 flex-shrink-0">
                  <a
                    href={
                      item.data.itemAffiliateWebUrl ||
                      item.data.itemWebUrl ||
                      "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-gradient-to-r dark:bg-light-dark bg-blue-700 text-main-white transition-all flex items-center gap-2 text-sm font-semibold whitespace-nowrap shadow-md hover:shadow-lg"
                  >
                    <span>View on eBay</span>
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-5 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center gap-2 text-sm font-semibold shadow-sm hover:shadow-md"
                  >
                    <FaTrash className="text-xs" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
