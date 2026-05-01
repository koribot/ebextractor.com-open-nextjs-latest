"use client";

import { useState, useEffect } from "react";
import {
  FaSearch,
  FaTrash,
  FaPlay,
  FaUser,
  FaEdit,
  FaSave,
  FaTimes,
  FaFilter,
  FaCalendar,
} from "react-icons/fa";
import { FaNoteSticky } from "react-icons/fa6";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SavedSearchesData } from "@/app/model/MySaved";
import {
  savedSearchesStorage,
  StorageItem,
} from "@/app/utils/IndexedDBManager";
import {
  clearAllDataFromIndexedDb,
  deleteAllMySavedDataToDb,
  deleteMySavedDataToDb,
  getDataFromIndexedDb,
  removeDataWithUserIdFromIndexDB,
  syncDataBetweenDbAndIndexedDb,
  updateNoteDataInDb,
} from "@/app/utils/my-saved-utils/my-saved-utils";
import MySavedLinkNavigator from "./MySavedLinkNavigator";
import { getCookie } from "cookies-next";

export default function SavedSearches() {
  const [searches, setSearches] = useState<StorageItem<SavedSearchesData>[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const timestamp = Date.now();

  const loadSearchesFromIndexedDb = async () => {
    const data = (await getDataFromIndexedDb(
      "SEARCHES",
    )) as StorageItem<SavedSearchesData>[];
    setSearches(data);
    setIsLoading(false);
  };

  useEffect(() => {
    syncDataBetweenDbAndIndexedDb("SEARCHES");
    loadSearchesFromIndexedDb();
  }, []);

  // Filter searches
  const filteredSearches = searches.filter(
    (search) =>
      search.data.query.toLowerCase().includes(searchFilter.toLowerCase()) ||
      search.data.seller?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      search.data.note?.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  // Delete handlers
  const handleDelete = async (id: string) => {
    if (confirm("Remove this saved search?")) {
      setIsDeleting(true);
      const response = await savedSearchesStorage.delete(id);
      if (response.success) {
        await loadSearchesFromIndexedDb();
        deleteMySavedDataToDb({ id, type: "SEARCHES" });
      }
      setIsDeleting(false);
    }
  };

  const handleClearAll = async () => {
    if (confirm(`Remove all ${searches.length} saved searches?`)) {
      const usid = await getCookie("usid");
      setIsDeleting(true);
      const response = usid
        ? await removeDataWithUserIdFromIndexDB("SEARCHES")
        : await clearAllDataFromIndexedDb("SEARCHES");
      if (response) {
        deleteAllMySavedDataToDb("SEARCHES");
        setSearches([]);
      }
      setIsDeleting(false);
    }
  };

  // Note editing handlers
  const handleEditNote = (id: string, currentNote?: string) => {
    setEditingNoteId(id);
    setNoteText(currentNote || "");
  };

  const handleSaveNote = async (id: string) => {
    const response = await savedSearchesStorage.update<SavedSearchesData>(
      id,
      { note: noteText.trim(), synced: false },
      timestamp,
    );

    if (response.success) {
      setIsLoading(true);
      const res = updateNoteDataInDb({
        id: id,
        type: "SEARCHES",
        noteText,
      });
      await loadSearchesFromIndexedDb();
      setIsLoading(false);
      setEditingNoteId(null);
      // setNoteText(res ? noteText : "");
      return;
    }
    setEditingNoteId(null);
    setNoteText("");
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setNoteText("");
  };

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

  // Empty state
  if (searches.length === 0 && !isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-10">
        <MySavedLinkNavigator />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-full p-8 mb-6">
            <FaSearch className="text-6xl text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            No Saved Searches Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md text-lg">
            Save your search queries to quickly access them later and keep track
            of your research.
          </p>
          <Link
            prefetch={false}
            href="/search"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Searching
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10">
      {/* Loading/Deleting Overlay */}
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

      <MySavedLinkNavigator />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaSearch className="text-blue-600 dark:text-blue-400" />
              Saved Searches
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              {filteredSearches.length}{" "}
              {filteredSearches.length === 1 ? "search" : "searches"}
              {searchFilter && " found"}
            </p>
          </div>
          {searches.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-6 py-3 bg-red-600 dark:bg-light-dark text-white rounded-lg hover:bg-red-700 transition-all font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <FaTrash />
              Clear All
            </button>
          )}
        </div>

        {/* Search Filter */}
        <div className="relative">
          <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by keyword, seller, or note..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
      </div>

      {/* Searches List */}
      {filteredSearches.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <FaSearch className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No searches match your filter
          </p>
          <button
            onClick={() => setSearchFilter("")}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSearches.map((search) => (
            <div
              key={search.id}
              className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  {/* Search Query */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-semibold">
                      Search Query
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white break-words">
                      {search.data.query}
                    </h3>
                  </div>

                  {/* Seller */}
                  {search.data.seller && (
                    <div className="flex items-start gap-3 mb-4">
                      <FaUser className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-semibold">
                          Seller
                        </p>
                        <p className="text-base font-medium text-gray-900 dark:text-white">
                          {search.data.seller}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Note Section */}
                  <div className="flex items-start gap-3 mb-4">
                    <FaNoteSticky className="text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                          Notes
                        </p>
                        {editingNoteId !== search.id && (
                          <button
                            onClick={() =>
                              handleEditNote(search.id, search.data.note)
                            }
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 font-medium"
                          >
                            <FaEdit />
                            Edit
                          </button>
                        )}
                      </div>

                      {editingNoteId === search.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            onKeyDown={(e) => handleNoteKeyPress(e, search.id)}
                            placeholder="Add a note about this search..."
                            rows={3}
                            autoFocus
                            className="w-full px-3 py-2 border-2 border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveNote(search.id)}
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
                          {search.data.note || (
                            <span className="text-gray-400 dark:text-gray-500 italic">
                              No notes added. Click Edit to add notes.
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <FaCalendar />
                    <span>Last updated {formatDate(search.updatedAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 flex-shrink-0">
                  <Link
                    prefetch={false}
                    href={search.data.href}
                    className="px-5 py-3 bg-gradient-to-r dark:bg-light-dark bg-blue-700 text-main-white transition-all flex items-center gap-2 text-sm font-semibold whitespace-nowrap shadow-md hover:shadow-lg"
                  >
                    <FaPlay className="text-xs" />
                    Run Search
                  </Link>
                  <button
                    onClick={() => handleDelete(search.id)}
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
