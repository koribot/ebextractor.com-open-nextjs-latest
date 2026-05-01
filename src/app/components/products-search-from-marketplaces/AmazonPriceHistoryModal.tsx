"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const AmazonPriceHistoryModal = ({
  asin,
  title,
}: {
  asin: string;
  title: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="space-y-4">
      {/* Product Title */}
      <div className="text-center">
        {/* <h3 className="text-lg font-medium text-gray-800 line-clamp-2">
          {title}
        </h3> */}
        <p className="text-sm text-gray-500 mt-1">ASIN: {asin}</p>
      </div>

      {/* Price Chart */}
      <div className="bg-gray-50 rounded-lg p-4 flex flex-col w-[1100px] h-[600px] relative">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-4 flex items-center justify-center bg-gray-50 rounded-md">
            <div className="flex flex-col items-center space-y-4">
              {/* Spinner */}
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <p className="text-sm text-gray-600 font-medium">
                Loading price history...
              </p>
              <p className="text-xs text-gray-500">
                This may take a few moments
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
          <div className="absolute inset-4 flex items-center justify-center bg-gray-50 rounded-md">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Failed to load price history
              </p>
              <p className="text-xs text-gray-500">
                The chart could not be loaded at this time
              </p>
            </div>
          </div>
        )}

        {/* Image */}
        {/* <Image
          src={`https://charts.camelcamelcamel.com/us/${asin}/amazon-new-used.png?force=1&zero=0&w=1200&h=600&desired=false&legend=1&ilt=1&tp=all&fo=0&lang=en`}
          alt={`Price history chart for ${title}`}
          width={1200}
          height={600}
          unoptimized
          className={`w-full h-auto rounded-md shadow-sm transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          referrerPolicy="no-referrer"
        /> */}
        <img
          src={`https://charts.camelcamelcamel.com/us/${asin}/amazon-new-used.png?force=1&zero=0&w=1200&h=600&desired=false&legend=1&ilt=1&tp=all&fo=0&lang=en`}
          alt={`Price history chart for ${title}`}
          width={1200}
          height={600}
          className={`w-full h-auto rounded-md shadow-sm transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          referrerPolicy="no-referrer"
        />

        {/* Link - only show when image is loaded successfully */}
        {!isLoading && !hasError && (
          <Link
            prefetch={false}
            role="div"
            title={`See Price History on CamelCamelCamel for ${title}`}
            target="_blank"
            className="text-blue-600 p-4 mx-auto w-fit dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors duration-200"
            href={`https://camelcamelcamel.com/product/${asin}`}
          >
            View Price History on CamelCamelCamel
          </Link>
        )}
      </div>

      {/* Chart Legend/Info */}
      <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-md">
        <p className="font-medium mb-1">Price History Chart Information:</p>
        <ul className="space-y-1">
          <li>• Green line shows Amazon's price over time</li>
          <li>• Blue line shows 3rd party new item prices</li>
          <li>• Orange line shows 3rd party used item prices</li>
          <li>• Data provided by CamelCamelCamel price tracking service</li>
        </ul>
      </div>
    </div>
  );
};

export default AmazonPriceHistoryModal;
