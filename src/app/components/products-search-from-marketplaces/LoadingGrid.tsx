import React from 'react';
import LoadingSkeleton from "../common/skeleton/LoadingSkeleton";

export default function LoadingGrid({length = 25}: {length?: number}) {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: length }).map((_, index) => (
        <div key={index} className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-[350px] dark:bg-light-dark dark:border-gray-700">
          <LoadingSkeleton cname="w-full aspect-square" />
          <div className="p-4 flex-grow">
            <LoadingSkeleton cname="w-full h-4 mb-2" />
            <LoadingSkeleton cname="w-2/3 h-4 mb-2" />
            <LoadingSkeleton cname="w-1/3 h-4 mb-4" />
            <LoadingSkeleton cname="w-full h-8 mt-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

