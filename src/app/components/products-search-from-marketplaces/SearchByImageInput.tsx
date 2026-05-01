"use client";

import { useSearchStore } from "@/app/store/marketplace-search/store";
import { useEbaySearchByImageStore } from "@/app/store/ebay-search-by-image/store";
import { ebaySiteLocaleMapping } from "@/app/utils/ebaySiteMapping";
import React, { useRef, useCallback, useEffect } from "react";
import { logger } from "@/app/utils/logger";
import Link from "next/link";
import { FaMagnifyingGlass } from "react-icons/fa6";
import ImagePreview from "../common/ui/ImagePreview";
import CheckOnOtherPlatformButton from "../common/ui/Buttons/CheckOnOtherPlatformButton";
import LoadingGrid from "./LoadingGrid";
import { api_paths } from "@/app/contants/api-paths";

// Types
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

const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

async function urlToBase64(
  url: string,
  outputFormat = "image/png",
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL(outputFormat));
    };
    img.onerror = reject;
    img.src = url;
    if (img.complete || img.complete === undefined) {
      img.src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      img.src = url;
    }
  });
}

const validateImageUrl = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      new URL(url);
    } catch {
      resolve(false);
      return;
    }

    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
    ];
    const hasImageExtension = imageExtensions.some((ext) =>
      url.toLowerCase().includes(ext),
    );

    const img = new Image();
    img.crossOrigin = "Anonymous";

    const timeout = setTimeout(() => {
      img.src = "";
      resolve(false);
    }, 5000);

    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };

    img.src = url;
  });
};

const SearchByImagePage: React.FC = () => {
  const {
    image,
    imagePreview,
    imageUrl,
    isLoading,
    results,
    error,
    setImage,
    setImagePreview,
    setImageUrl,
    setIsLoading,
    setResults,
    setError,
  } = useEbaySearchByImageStore();
  const { defaultEbaySite } = useSearchStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const urlValidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showStickyImage, setShowStickyImage] = React.useState(false);

  const handleFileUpload = async (file: File): Promise<void> => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setImage(file);
      setImagePreview(base64);
      setImageUrl("");
      setError("");
    } catch (err) {
      setError("Error processing image");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileUpload(files[0]);
  }, []);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items || []);
    for (let item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) handleFileUpload(file);
        return;
      }
    }
  }, []);

  const handleUrlChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const url = e.target.value.trim();
    setImageUrl(url);

    if (urlValidationTimeoutRef.current) {
      clearTimeout(urlValidationTimeoutRef.current);
    }

    setImage(null);
    setError("");
    setImagePreview("");

    if (!url) {
      return;
    }

    urlValidationTimeoutRef.current = setTimeout(async () => {
      try {
        new URL(url);
        // setIsLoading(true);
        const isValid = await validateImageUrl(url);

        if (isValid) {
          setImagePreview(url);
          setError("");
        } else {
          setError("Invalid image URL or image could not be loaded");
          setImagePreview("");
        }
      } catch (err: any) {
        setError("Invalid URL format");
        setImagePreview("");
      }
    }, 800);
  };

  const fetchListings = async ({
    base64Data,
  }: {
    base64Data: string;
  }): Promise<any> => {
    const response = await fetch(`${api_paths.ebay_search_by_image}`, {
      method: "POST",
      body: JSON.stringify({ base64Image: base64Data, site: defaultEbaySite }),
    });
    const data = await response.json();
    return data;
  };

  const performImageSearch = async (): Promise<void> => {
    if (!imagePreview) {
      setError("Please provide an image");
      return;
    }
    setResults(null);
    setIsLoading(true);
    setError("");

    try {
      let base64Data = "";

      if (image) {
        const fileBase64 = await fileToBase64(image);
        base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, "");
      } else if (imageUrl) {
        const urlBase64 = await urlToBase64(imageUrl);
        base64Data = urlBase64.replace(/^data:image\/\w+;base64,/, "");
      }

      if (!base64Data) {
        setError("Failed to process image");
        return;
      }

      const json: any = await fetchListings({ base64Data });
      logger.debug.log(json);

      if (json.errors) {
        setError(json.errors[0].message);
        setResults(null);
        return;
      }

      const transformed: SearchResults = {
        total: json?.total || 0,
        items: (json?.itemSummaries || []).map((item: any, index: number) => ({
          id: index,
          title: item.title,
          price: item.price,
          image: item.image?.imageUrl,
          url: item.itemAffiliateWebUrl,
          itemId: item.itemId,
          condition: item.condition,
          seller: item.seller,
          shippingOptions: item.shippingOptions,
          buyingOptions: item.buyingOptions,
          marketingPrice: item.marketingPrice,
          thumbnailImages: item.thumbnailImages,
          itemWebUrl: item.itemWebUrl,
        })),
      };

      setResults(transformed);
    } catch (err: any) {
      setError(err?.message || "Search failed. Please try again.");
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = (): void => {
    setImage(null);
    setImagePreview("");
    setImageUrl("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
      if (urlValidationTimeoutRef.current) {
        clearTimeout(urlValidationTimeoutRef.current);
      }
    };
  }, [handlePaste]);

  useEffect(() => {
    if (imagePreview && results?.total === 0) {
      performImageSearch();
    }
  }, [defaultEbaySite]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollDistance = window.scrollY;
      setShowStickyImage(scrollDistance > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark py-8 px-4">
      <div className="mx-auto">
        {/* Sticky Image Comparison - Shows on Scroll */}
        {showStickyImage &&
          imagePreview &&
          results &&
          results.items.length > 0 && (
            // left-1/2 -translate-x-1/2
            //left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0
            <div className="fixed top-15 left-0 w-full z-50 bg-white dark:bg-light-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 animate-in fade-in slide-in-from-top md:slide-in-from-right duration-300">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">
                  You are searching for
                </span>
                <img
                  src={imagePreview}
                  alt="Search reference"
                  className="h-50 w-50 object-contain rounded-lg border border-gray-200 dark:border-gray-600"
                />
                <button
                  title="search"
                  onClick={performImageSearch}
                  className="text-xs font-semibold text-white dark:text-gray-300 bg-blue-500 dark:bg-gray-800 px-5 rounded-full"
                >
                  Search
                </button>
              </div>
            </div>
          )}

        <div className="bg-white dark:bg-light-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 max-w-2xl mx-auto">
          <div className="mb-3">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">
              Search by Image
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Upload an image or enter a URL to find similar products
            </p>
          </div>

          <div
            ref={dropZoneRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200"
          >
            {imagePreview ? (
              <div className="space-y-2 flex flex-col items-center">
                <div className="relative inline-block max-w-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-20 rounded-lg shadow object-contain"
                  />
                </div>
                <button
                  onClick={clearImage}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg font-medium transition-colors duration-200"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-4xl">📷</div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Upload or paste image
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Drop file, click to browse, or Ctrl+V
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFileUpload(e.target.files[0])
                  }
                  className="hidden"
                />
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Or enter image URL:
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {error && (
            <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-xs">
              {error}
            </div>
          )}

          <button
            onClick={performImageSearch}
            disabled={isLoading || !imagePreview || !!error}
            className={`w-full py-2.5 px-4 text-sm rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 ${
              isLoading || !imagePreview || !!error
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            ) : (
              "Search"
            )}
          </button>

          <div className="mt-2.5 text-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark py-1.5 px-2 rounded">
            💡 Paste images with Ctrl+V (Cmd+V on Mac)
          </div>
        </div>

        {isLoading && !results && (
          <div className="mt-6 bg-white dark:bg-light-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <LoadingGrid />
          </div>
        )}

        {results && results.items.length > 0 && (
          <div className="mt-6 bg-white dark:bg-light-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Results Found:{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  {results.total?.toLocaleString(
                    ebaySiteLocaleMapping[defaultEbaySite],
                  )}
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {results.items.map((item: any) => (
                <ResultItem
                  key={item.id}
                  item={item}
                  defaultSite={defaultEbaySite}
                />
              ))}
            </div>
          </div>
        )}

        {results && results.items.length === 0 && (
          <div className="mt-6 bg-white dark:bg-light-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try a different image or adjust your search
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

function ResultItem({ item, defaultSite }: { item: any; defaultSite: string }) {
  const fallbackImage = "/placeholder.svg?height=300&width=300";

  const formattedPrice = item.price?.value
    ? `${item.price.currency === "USD" ? "$" : item.price.currency}${
        item.price.value
      }`
    : item.price;

  const getShippingCostDisplay = (shippingOption: any) => {
    if (!shippingOption) return null;
    const { shippingCostType, shippingCost } = shippingOption;

    if (shippingCostType === "FREE" || shippingCost?.value === "0.00") {
      return "Free Shipping";
    }

    if (shippingCostType === "FIXED") {
      const currencySymbol = shippingCost?.currency;
      return `${currencySymbol} ${shippingCost?.value} Shipping`;
    }

    return "Calculated Shipping";
  };

  const otherPics =
    item?.thumbnailImages?.slice(1)?.map((img: any) => img.imageUrl) || [];

  const hasDiscount =
    item?.marketingPrice?.discountPercentage &&
    parseFloat(item.marketingPrice.discountPercentage) > 0;

  return (
    <div className="w-full bg-white dark:bg-light-dark border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-200 dark:hover:border-gray-500 transition-all duration-300 group flex flex-col min-h-[400px]">
      <div className="relative aspect-square overflow-y-scroll small-scrollbar min-h-[100px] bg-gray-50 dark:bg-dark group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors duration-200">
        {hasDiscount && (
          <div className="absolute top-3 right-3 z-40">
            <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-sm">
              {item.marketingPrice.discountPercentage}% OFF
            </span>
          </div>
        )}
        <ImagePreview
          otherPics={otherPics}
          itemId={item?.itemId}
          src={
            item?.thumbnailImages && item?.thumbnailImages?.length > 0
              ? item?.thumbnailImages[0]?.imageUrl
              : item?.imageUrl || fallbackImage
          }
          alt={item.title}
          width={500}
          height={500}
          image_quality_for_preview={10}
          image_quality_when_modal_open={75}
          Icon={FaMagnifyingGlass}
          loading="lazy"
          itemTitle={item.title}
        />
        <Link
          prefetch={false}
          title="Check it on eBay"
          href={item.url || "#"}
          target="_blank"
          className="absolute inset-0"
        >
          <span className="sr-only">View product details</span>
        </Link>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <Link
          prefetch={false}
          title={item.title}
          href={item.url || "#"}
          target="_blank"
          className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 leading-relaxed"
        >
          {item.title}
        </Link>

        <div className="flex items-baseline justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formattedPrice}
            </span>
            {item?.marketingPrice?.originalPrice && hasDiscount && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                {`${
                  item.marketingPrice.originalPrice.currency === "USD"
                    ? "$"
                    : item.marketingPrice.originalPrice.currency
                }${item.marketingPrice.originalPrice.value}`}
              </span>
            )}
          </div>
          {item?.seller && (
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                {item.seller.username}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-semibold text-blue-600 dark:text-gray-400">
                  {item.seller.feedbackPercentage}%
                </span>
                <svg
                  className="w-3 h-3 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {item?.condition && item.condition !== "Unspecified" && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-gray-300 border border-blue-200 dark:border-blue-700">
              {item.condition}
            </span>
          )}
          {item?.buyingOptions?.length > 1 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-gray-300 border border-blue-200 dark:border-blue-700">
              {item.buyingOptions[1] === "BEST_OFFER"
                ? "ACCEPTS OFFER"
                : item.buyingOptions[1]}
            </span>
          )}
          {item?.shippingOptions?.[0] && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-dark text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
              {getShippingCostDisplay(item.shippingOptions[0])}
            </span>
          )}
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex justify-between items-center">
            <Link
              prefetch={false}
              title="View More Details"
              className="text-blue-600 dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors duration-200"
              href={`/ebay?itm=${item?.itemId}&site=${defaultSite}&title=${item?.title}`}
              target="_blank"
            >
              Details
            </Link>
            <CheckOnOtherPlatformButton
              title={item.title}
              imageUrl={item.image}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchByImagePage;
