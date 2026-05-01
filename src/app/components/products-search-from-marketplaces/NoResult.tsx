import React from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { NoResultsProps } from "./types";

export default function NoResults({
  searchParams,
  searchTerm,
  searchUrlParam,
  isLoading,
  isLoadingMore,
}: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center  p-8">
      {!searchParams.get("q") ? (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center dark:bg-light-dark dark:border dark:border-gray-700">
            <FaMagnifyingGlass className="w-10 h-10 text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2 dark:text-light">
              Ready to Search
            </h2>
            <p className="text-gray-500">
              Enter a product name to start exploring
            </p>
          </div>
        </div>
      ) : (
        searchParams.get("q") &&
        !isLoading &&
        searchUrlParam !== "" &&
        !isLoadingMore && (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center dark:bg-light-dark dark:border dark:border-gray-700">
              <FaMagnifyingGlass className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2 dark:text-light">
                No Results Found
              </h2>
              <p className="text-gray-500">
                No matches found for &quot;{searchParams.get("q")}&quot;
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
