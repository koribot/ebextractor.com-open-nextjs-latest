"use client";
import { IRecentSearchesData } from "@/app/model/RecentSearches";
import {
  recentSearchesStorage,
  StorageItem,
} from "@/app/utils/IndexedDBManager";
import React, { useEffect, useState } from "react";

const RecentSearches = () => {
  const [recentSearchesData, setRecentSearchesData] = useState<
    StorageItem<IRecentSearchesData>[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getRecentSearchesFromIndexedDb = async () => {
    const _recentSearches =
      await recentSearchesStorage.getAll<IRecentSearchesData>();
    // setRecentSearchesData(dummy);
    setRecentSearchesData(
      _recentSearches.data?.sort((a, b) => b.updatedAt - a.updatedAt) || [],
    );
    setIsLoading(false);
  };

  useEffect(() => {
    getRecentSearchesFromIndexedDb();
  }, []);

  if (!recentSearchesData.length && !isLoading) return null;
  if (isLoading) return null;

  return (
    <div className="px-3 py-1 border-b border-gray-700/10 dark:border-gray-500 w-full ">
      <div className="flex items-center gap-2 text-gray-600  overflow-auto small-scrollbar ">
        <span className="text-xs font-medium whitespace-nowrap dark:text-main-white">
          Recent:
        </span>
        <div className="flex gap-2 ">
          {recentSearchesData.map((item) => (
            <a
              // target="_blank"
              title={item.data.query}
              key={item.id}
              href={item.data.href}
              className="underline hover:text-gray-900 text-xs dark:text-main-white
              whitespace-nowrap
              max-w-[100px]
              overflow-hidden text-ellipsis
              block"
            >
              {item.data.query}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentSearches;
