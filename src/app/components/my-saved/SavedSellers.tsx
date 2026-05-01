"use client";

import { useState, useEffect } from "react";
import {
  FaUserCircle,
  FaTrash,
  FaStar,
  FaExternalLinkAlt,
  FaFilter,
  FaTimes,
  FaStore,
  FaCalendar,
  FaChartLine,
  FaEdit,
  FaSave,
} from "react-icons/fa";
import { FaNoteSticky } from "react-icons/fa6";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SavedSellerData } from "@/app/model/MySaved";
import { savedSellersStorage, StorageItem } from "@/app/utils/IndexedDBManager";
import {
  clearAllDataFromIndexedDb,
  deleteAllMySavedDataToDb,
  deleteMySavedDataToDb,
  getDataFromIndexedDb,
  removeDataWithUserIdFromIndexDB,
  syncDataBetweenDbAndIndexedDb,
  updateNoteDataInDb,
} from "@/app/utils/my-saved-utils/my-saved-utils";
import { getCookie } from "cookies-next";

export default function SavedSellers() {
  const [sellers, setSellers] = useState<StorageItem<SavedSellerData>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "recent">("recent");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const path = usePathname();
  const arrayOfPaths = path.split("/");
  const timestamp = Date.now();
  const loadSellersFromIndexedDb = async () => {
    const data = (await getDataFromIndexedDb(
      "SELLERS",
    )) as StorageItem<SavedSellerData>[];
    setSellers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    syncDataBetweenDbAndIndexedDb("SELLERS");
    loadSellersFromIndexedDb();
  }, []);

  const filteredAndSortedSellers =
    sellers &&
    sellers
      ?.filter((seller) => {
        // Add safety checks for undefined values
        const username = seller?.data?.username || "";
        const note = seller?.data?.note || "";
        const filter = searchFilter || "";

        return (
          username.toLowerCase().includes(filter.toLowerCase()) ||
          note.toLowerCase().includes(filter.toLowerCase())
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return (a?.data?.username || "").localeCompare(
              b?.data?.username || "",
            );
          case "rating":
            return (
              parseFloat(b?.data?.feedbackPercentage || "0") -
              parseFloat(a?.data?.feedbackPercentage || "0")
            );
          case "recent":
          default:
            return (b?.createdAt || 0) - (a?.createdAt || 0);
        }
      });

  // Delete a seller
  const handleDelete = async (id: string) => {
    if (confirm("Remove this seller from saved?")) {
      setIsDeleting(true);
      const response = await savedSellersStorage.delete(id);
      if (response.success) {
        await loadSellersFromIndexedDb();
        deleteMySavedDataToDb({ id: id, type: "SELLERS" });
      }
      setIsDeleting(false);
    }
  };

  // Clear all sellers
  const handleClearAll = async () => {
    if (confirm(`Remove all ${sellers.length} saved sellers?`)) {
      const usid = await getCookie("usid");
      setIsDeleting(true);
      const response = usid
        ? await removeDataWithUserIdFromIndexDB("SELLERS")
        : await clearAllDataFromIndexedDb("SELLERS");
      if (response) {
        deleteAllMySavedDataToDb("SELLERS");
        setSellers([]);
      }
      setIsDeleting(false);
    }
  };

  // Start editing a note
  const startEditingNote = (id: string, currentNote?: string) => {
    setEditingNoteId(id);
    setNoteText(currentNote || "");
  };

  // Cancel editing
  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setNoteText("");
  };

  // Save note
  const saveNote = async (id: string) => {
    const response = await savedSellersStorage.update<SavedSellerData>(
      id,
      {
        note: noteText.trim(),
      },
      timestamp,
    );
    if (response.success) {
      setIsLoading(true);
      const res = updateNoteDataInDb({
        id: id,
        type: "SELLERS",
        noteText,
      });
      await loadSellersFromIndexedDb();
      setIsLoading(false);
      setEditingNoteId(null);
      // setNoteText(res ? noteText : "");
      return;
    }
    setEditingNoteId(null);
    setNoteText("");
  };

  // Handle Enter key to save
  const handleNoteKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveNote(id);
    } else if (e.key === "Escape") {
      cancelEditingNote();
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

  // if (isLoading) {
  //   return (
  //     <div className="max-w-6xl mx-auto py-10">
  //       {/* Breadcrumb */}
  //       <nav>
  //         <ol className="flex items-center flex-wrap gap-1 text-sm text-gray-600 dark:text-gray-300 mb-2">
  //           {arrayOfPaths.map((item, index) => {
  //             const isLast = index === arrayOfPaths.length - 1;
  //             const label = item === "" ? "Home" : decodeURIComponent(item);

  //             return (
  //               <li key={index} className="flex items-center gap-1">
  //                 {!isLast ? (
  //                   <Link
  //                     href={`/${item}`}
  //                     className="hover:text-green-600 dark:hover:text-green-400 transition"
  //                   >
  //                     {label}
  //                   </Link>
  //                 ) : (
  //                   <span className="font-medium text-gray-900 underline dark:text-white">
  //                     {label}
  //                   </span>
  //                 )}

  //                 {!isLast && (
  //                   <span className="text-gray-400 dark:text-gray-500">/</span>
  //                 )}
  //               </li>
  //             );
  //           })}
  //         </ol>
  //       </nav>

  //     </div>
  //   );
  // }

  if (sellers.length === 0 && !isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-10">
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
                      className="hover:text-green-600 dark:hover:text-green-400 transition"
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
          <div className=" dark:from-gray-800 dark:to-gray-900 rounded-full p-8 mb-6">
            <FaUserCircle className="text-6xl text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            No Saved Sellers Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md text-lg">
            Follow your favorite eBay sellers to easily find their listings and
            track their activity.
          </p>
          <Link
            prefetch={false}
            href="/ebay-search-by-seller"
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
                    className="hover:text-green-600 dark:hover:text-green-400 transition"
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
              <FaUserCircle className="text-green-600 dark:text-green-400" />
              Saved Sellers
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              {filteredAndSortedSellers.length}{" "}
              {filteredAndSortedSellers.length === 1 ? "seller" : "sellers"}
              {searchFilter && " found"}
            </p>
          </div>
          {sellers.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-6 py-3 bg-red-600 dark:bg-light-dark text-white rounded-lg hover:bg-red-700 transition-all font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <FaTrash />
              Clear All
            </button>
          )}
        </div>

        {/* Search Filter and Sort */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by username or note..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter("")}
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
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="recent">Recently Added</option>
              <option value="name">Name (A-Z)</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sellers List */}
      {filteredAndSortedSellers.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <FaUserCircle className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No sellers match your filter
          </p>
          <button
            onClick={() => setSearchFilter("")}
            className="mt-4 text-green-600 dark:text-green-400 hover:underline font-medium"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedSellers.map((seller) => (
            <div
              key={seller.id}
              className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-xl hover:border-green-300 dark:hover:border-green-600 transition-all"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  {/* Seller Info */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* {seller.data.avatarUrl ? (
                      <img
                        src={seller.data.avatarUrl}
                        alt={seller.data.username}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-green-200 dark:border-green-700"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                        <FaUserCircle className="text-3xl text-white" />
                      </div>
                    )} */}
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-semibold">
                        Seller
                      </p>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {seller.data.username}
                      </h3>
                      {seller.data.marketplace && (
                        <span className="inline-block mt-1 text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                          {seller.data.marketplace}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {seller.data.feedbackPercentage && (
                      <div className="flex items-start gap-3">
                        <FaStar className="text-yellow-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                            Rating
                          </p>
                          <p className="text-base font-bold text-gray-900 dark:text-white">
                            {seller.data.feedbackPercentage}%
                          </p>
                        </div>
                      </div>
                    )}
                    {seller.data.feedbackScore !== undefined && (
                      <div className="flex items-start gap-3">
                        <FaChartLine className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                            Feedback
                          </p>
                          <p className="text-base font-bold text-gray-900 dark:text-white">
                            {seller.data.feedbackScore.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {/* {seller.data.itemsSold !== undefined && (
                      <div className="flex items-start gap-3">
                        <FaShoppingBag className="text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                            Items Sold
                          </p>
                          <p className="text-base font-bold text-gray-900 dark:text-white">
                            {seller.data.itemsSold.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {seller.data.memberSince && (
                      <div className="flex items-start gap-3">
                        <FaCalendar className="text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                            Member Since
                          </p>
                          <p className="text-base font-bold text-gray-900 dark:text-white">
                            {seller.data.memberSince}
                          </p>
                        </div>
                      </div>
                    )} */}
                  </div>

                  {/* Note */}
                  <div className="flex items-start gap-3 mb-4">
                    <FaNoteSticky className="text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                          Note
                        </p>
                        {editingNoteId !== seller.id && (
                          <button
                            onClick={() =>
                              startEditingNote(seller.id, seller.data.note)
                            }
                            className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1 font-medium"
                          >
                            <FaEdit />
                            Edit
                          </button>
                        )}
                      </div>

                      {editingNoteId === seller.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            onKeyDown={(e) => handleNoteKeyPress(e, seller.id)}
                            placeholder="Add a note about this seller..."
                            rows={3}
                            autoFocus
                            className="w-full px-3 py-2 border-2 border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => saveNote(seller.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-semibold"
                            >
                              <FaSave />
                              Save
                            </button>
                            <button
                              onClick={cancelEditingNote}
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
                          {seller.data.note || (
                            <span className="text-gray-400 dark:text-gray-500 italic">
                              No note added. Click Edit to add note.
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <FaCalendar />
                    <span>Saved {formatDate(seller.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 flex-shrink-0">
                  <a
                    href={
                      seller.data.sellerUrl ||
                      `https://www.ebay.com/usr/${seller.data.username}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-gradient-to-r dark:bg-light-dark bg-green-700 text-main-white transition-all flex items-center gap-2 text-sm font-semibold whitespace-nowrap shadow-md hover:shadow-lg"
                  >
                    <FaStore className="text-xs" />
                    View Store
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                  <button
                    onClick={() => handleDelete(seller.id)}
                    className="px-5 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all flex items-center gap-2 text-sm font-semibold shadow-sm hover:shadow-md"
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
