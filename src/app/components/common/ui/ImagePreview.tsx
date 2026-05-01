"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image, { StaticImageData } from "next/image";
import { IconType } from "react-icons";
import {
  FaMapMarkerAlt,
  FaTruck,
  FaShieldAlt,
  FaStar,
  FaCalendarAlt,
  FaAmazon,
  FaEbay,
} from "react-icons/fa";
import { Spinner } from "./Spinner";
import { Item } from "@/app/ebay/types";
import { FaArrowLeft, FaArrowRight, FaMagnifyingGlass } from "react-icons/fa6";
import { ebaySiteUrlMapping } from "@/app/utils/ebaySiteMapping";
import AffliateDisclosure from "../../affilate-disclosure/AffliateDisclosure";
import { amazonSiteUrlMapping } from "@/app/utils/amazonSiteMapping";
import { useSearchStore } from "@/app/store/marketplace-search/store";
import requests from "@/app/utils/http";
import { api_paths } from "@/app/contants/api-paths";
import { showModal } from "../modal/modal-provider";
import ScarcityChart from "@/app/server-components/ebay-product-full-details-card/ScarcityChart";
import kunsul from "kunsul";

type TImagePreviewModalContentProps = {
  otherPics?: string[];
  src: string | StaticImageData;
  alt: string;
  width?: number;
  height?: number;
  image_quality_when_modal_open?: number;
  itemId?: string;
  itemTitle?: string;
  defaultEbaySite?: string;
  defaultAmazonSite?: string;
  defaultAliexpressSite?: string;
  initialIndex?: number;
};

// Pure display component - just focuses on rendering the modal content
const ImagePreviewModalContent: React.FC<TImagePreviewModalContentProps> = ({
  otherPics = [],
  initialIndex = 0,
  src,
  alt,
  width = 800,
  height = 800,
  image_quality_when_modal_open = 75,
  itemId,
  itemTitle = "Item Title",
  defaultEbaySite,
  defaultAmazonSite,
  defaultAliexpressSite,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
  const [itemData, setItemData] = useState<Item | null>(null);
  const [isLoadingItemData, setIsLoadingItemData] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const allImages = [src as string, ...otherPics];

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isZoomed && imageRef.current) {
      const { left, top, width, height } =
        imageRef.current.getBoundingClientRect();
      const x = (event.clientX - left) / width;
      const y = (event.clientY - top) / height;
      imageRef.current.style.transformOrigin = `${x * 100}% ${y * 100}%`;
    }
  };

  const handleMouseLeave = () => {
    if (imageRef.current) {
      setIsZoomed(false);
    }
  };

  const fetchItemData = async () => {
    if (!itemId || !defaultEbaySite) return;

    setIsLoadingItemData(true);
    try {
      const response = await requests.get(
        `${api_paths.ebay_get_item_by_id}?itemId=${itemId}&site=${defaultEbaySite}&mode=IMAGE-PREVIEW-EBAY-SEARCH-GET-ITEM-BY-ID`,
        {
          headers: {
            "e-grant": "ebextractor-20",
          },
        },
      );
      const data: Item = await response.requestsData;
      setItemData(data);
    } catch (error) {
      console.error("Failed to fetch item data:", error);
    } finally {
      setIsLoadingItemData(false);
    }
  };

  useEffect(() => {
    if (isZoomed && imageRef.current) {
      imageRef.current.style.transform = "scale(2.5)";
    } else if (!isZoomed && imageRef.current) {
      imageRef.current.style.transform = "scale(1)";
    }
  }, [isZoomed]);

  useEffect(() => {
    if (itemId && defaultEbaySite) {
      fetchItemData();
    }
  }, [itemId, defaultEbaySite]);

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsZoomed(false);
  };

  const formatPrice = (price: any) => {
    if (!price) return "N/A";
    const symbol = price.currency === "USD" ? "$" : price.currency;
    return `${symbol}${price.value}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getShippingInfo = (shippingOptions: any[]) => {
    if (!shippingOptions || shippingOptions.length === 0) return "N/A";

    const option = shippingOptions[0];
    if (
      option.shippingCostType === "FREE" ||
      option.shippingCost?.value === "0.00"
    ) {
      return "Free Shipping";
    }

    if (option.shippingCostType === "FIXED") {
      const symbol =
        option.shippingCost?.currency === "USD"
          ? "$"
          : option.shippingCost?.currency;
      return `${symbol}${option.shippingCost?.value} Shipping`;
    }

    return "Calculated Shipping";
  };

  const handleBuyOnEbay = () => {
    const _site = defaultEbaySite === undefined ? "EBAY_US" : defaultEbaySite;
    if (itemTitle) {
      const eBayUrl = itemData?.itemAffiliateWebUrl
        ? itemData.itemAffiliateWebUrl
        : `${ebaySiteUrlMapping[_site]}sch/i.html?_nkw=${encodeURIComponent(
            itemTitle,
          )}&mkevt=1&mkcid=1&mkrid=711-53200-19255-0&campid=5339079461&customid=ebextractor&toolid=10049`;
      window.open(itemData?.itemAffiliateWebUrl || eBayUrl, "_blank");
    }
  };

  const handleCheckOnAmazon = () => {
    const _site =
      defaultAmazonSite === undefined ? "amazon.com" : defaultAmazonSite;
    if (itemTitle) {
      const amazonUrl = `${amazonSiteUrlMapping[_site]}s?k=${encodeURIComponent(
        itemTitle,
      )}&tag=ebextractor0d-20`;
      window.open(amazonUrl, "_blank");
    }
  };

  const handleCheckOnAliExpress = () => {
    const aliexpressUrl = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(
      itemTitle,
    )}&terminal_id=feb1c430a7064eb980a23522543fcdca`;
    window.open(aliexpressUrl, "_blank");
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex-1 flex flex-col p-4 sm:p-6">
        <div
          className="relative flex-1 flex items-center justify-center mb-3 sm:mb-4 min-h-[50vh]"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner className="w-8 h-8 text-blue-500" />
            </div>
          )}
          <Image
            ref={imageRef}
            src={allImages[currentImageIndex]}
            alt={alt}
            width={700}
            height={700}
            className="max-w-full max-h-full object-contain transition-transform duration-300 rounded-lg"
            style={{
              cursor: isZoomed ? "zoom-out" : "zoom-in",
            }}
            quality={image_quality_when_modal_open}
            loading="eager"
            onLoad={() => setIsLoading(false)}
            onClick={handleZoomToggle}
          />
        </div>

        {!isZoomed && allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allImages.map((img, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  currentImageIndex === index
                    ? "border-blue-500 ring-2 ring-blue-200 shadow-md"
                    : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  quality={50}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {!isZoomed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex-wrap gap-2 mb-1 md:flex">
            {itemTitle && (
              <>
                <button
                  onClick={handleBuyOnEbay}
                  className="flex-1 border border-gray-300 text-light-dark dark:text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <FaEbay className="w-4 h-4" />
                  Check on eBay
                </button>
                <button
                  onClick={handleCheckOnAmazon}
                  className="flex-1 border border-gray-300 text-light-dark dark:text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <FaAmazon className="w-4 h-4" />
                  Check on Amazon
                </button>
                <button
                  onClick={handleCheckOnAliExpress}
                  className="flex-1 border border-gray-300 text-light-dark dark:text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <FaAmazon className="w-4 h-4" />
                  Check on AliExpress
                </button>
              </>
            )}
          </div>
          {itemData && (
            <div className="flex justify-center  ">
              <button
                className="w-full border p-2"
                onClick={() =>
                  showModal({
                    title: "",
                    content: <ScarcityChart itemData={itemData} />,
                  })
                }
              >
                View Demand Metrics
              </button>
            </div>
          )}
          <AffliateDisclosure />

          {itemId && defaultEbaySite && (
            <div className="mt-4">
              <div className="mt-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto small-scrollbar">
                <div className="p-4">
                  {isLoadingItemData ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner className="w-6 h-6 text-blue-500" />
                    </div>
                  ) : itemData ? (
                    <div className="space-y-3">
                      {itemData.price && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                            Price
                          </h4>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            {formatPrice(itemData.price)}
                          </p>
                        </div>
                      )}

                      {itemData.condition && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                            Condition
                          </h4>
                          <div className="flex items-center gap-2">
                            <FaShieldAlt className="text-blue-500 w-3 h-3" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                              {itemData.condition}
                            </span>
                          </div>
                          {itemData.conditionDescription && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {itemData.conditionDescription}
                            </p>
                          )}
                        </div>
                      )}

                      {itemData.itemLocation && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                            Location
                          </h4>
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-red-500 w-3 h-3" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                              {itemData.itemLocation.city},{" "}
                              {itemData.itemLocation.stateOrProvince}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {itemData.itemLocation.country}
                          </p>
                        </div>
                      )}

                      {itemData.shippingOptions &&
                        itemData.shippingOptions.length > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                              Shipping
                            </h4>
                            <div className="flex items-center gap-2">
                              <FaTruck className="text-blue-500 w-3 h-3" />
                              <span className="text-gray-700 dark:text-gray-300 text-sm">
                                {getShippingInfo(itemData.shippingOptions)}
                              </span>
                            </div>
                            {itemData.shippingOptions[0]
                              .minEstimatedDeliveryDate && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Delivery:{" "}
                                {formatDate(
                                  itemData.shippingOptions[0].minEstimatedDeliveryDate.toString(),
                                )}
                                {itemData.shippingOptions[0]
                                  .maxEstimatedDeliveryDate &&
                                  ` - ${formatDate(
                                    itemData.shippingOptions[0].maxEstimatedDeliveryDate.toString(),
                                  )}`}
                              </p>
                            )}
                          </div>
                        )}

                      {itemData.seller && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                            Seller
                          </h4>
                          <div className="space-y-1">
                            <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                              {itemData.seller.username}
                            </p>
                            <div className="flex items-center gap-2">
                              <FaStar className="text-yellow-500 w-3 h-3" />
                              <span className="text-gray-700 dark:text-gray-300 text-sm">
                                {itemData.seller.feedbackPercentage}% positive
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {itemData.seller.feedbackScore} reviews
                            </p>
                          </div>
                        </div>
                      )}

                      {itemData.returnTerms && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                            Returns
                          </h4>
                          <div className="space-y-1">
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {itemData.returnTerms.returnsAccepted
                                ? "Returns accepted"
                                : "No returns"}
                            </p>
                            {itemData.returnTerms.returnPeriod && (
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {itemData.returnTerms.returnPeriod.value}{" "}
                                {itemData.returnTerms.returnPeriod.unit}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {itemData.itemCreationDate && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                            Listed
                          </h4>
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-500 w-3 h-3" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                              {formatDate(itemData.itemCreationDate.toString())}
                            </span>
                          </div>
                        </div>
                      )}

                      {itemData.brand && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
                            Brand
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {itemData.brand}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Failed to load item details
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Simplified ImagePreview component
type TImagePreviewProps = {
  otherPics?: string[];
  src: string | StaticImageData;
  alt: string;
  loading?: "lazy" | "eager" | undefined;
  width?: number;
  height?: number;
  image_quality_when_modal_open?: number;
  image_quality_for_preview?: number;
  Icon?: React.ComponentType<{ className?: string }>; // More flexible typing
  itemId?: string;
  mode?: "icon-only" | "default" | "image-with-icon" | "image-only";
  itemTitle?: string;
  href?: string | undefined;
  target?: "_blank" | "_self" | "_parent" | "_top";
  onHoverTitle?: string;
  onClick?: ((e?: React.MouseEvent) => void | undefined) | null;
  ebay_site?: string | undefined;
  amazon_site?: string | undefined;
  aliexpress_site?: string | undefined;
  pHeight?: number;
  enableSlider?: boolean;
};

export default function ImagePreview({
  otherPics = [],
  src,
  alt,
  width = 800,
  height = 800,
  pHeight = undefined,
  image_quality_when_modal_open = 75,
  image_quality_for_preview = 75,
  loading = "lazy",
  Icon,
  itemId,
  mode = "default",
  itemTitle = "Item Title",
  href = "#",
  target = "_self",
  onHoverTitle = "",
  onClick = null,
  ebay_site,
  amazon_site,
  aliexpress_site,
  enableSlider = false,
}: TImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const {
    defaultEbaySite: _defaultEbaySite,
    defaultAmazonSite: _defaultAmazonSite,
    defaultAliexpressSite: _defaultAliexpressSite,
  } = useSearchStore();
  const defaultEbaySite = ebay_site || _defaultEbaySite;
  const defaultAmazonSite = amazon_site || _defaultAmazonSite;
  const defaultAliexpressSite = aliexpress_site || _defaultAliexpressSite;
  const [currentIndex, setCurrentIndex] = useState(0);
  const allPics = [src, ...otherPics];
  const handlePreviewClick = () => {
    showModal({
      title: itemTitle || alt || "",
      showTitle: true,
      content: (
        <div className="w-[90vw] max-w-6xl overflow-hidden">
          <ImagePreviewModalContent
            otherPics={otherPics}
            initialIndex={currentIndex}
            src={src}
            alt={alt}
            width={width}
            height={height}
            image_quality_when_modal_open={image_quality_when_modal_open}
            itemId={itemId}
            itemTitle={itemTitle}
            defaultEbaySite={defaultEbaySite}
            defaultAmazonSite={defaultAmazonSite}
            defaultAliexpressSite={defaultAliexpressSite}
          />
        </div>
      ),
    });
  };
  const handleNextClick = useCallback(() => {
    setIsLoading(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % allPics.length);
  }, []);
  const handlePrevClick = useCallback(() => {
    setIsLoading(true);
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + allPics.length) % allPics.length,
    );
  }, []);
  return (
    <div
      style={{ height: pHeight ? `${pHeight}px` : "auto" }}
      className={`relative w-fit mx-auto my-auto group aspect-square`}
    >
      {isLoading && mode !== "icon-only" && (
        <Spinner className="w-4 h-4 absolute mx-auto my-auto inset-0 text-black" />
      )}

      {mode !== "icon-only" && mode!=="image-only" && (
        <a
          onClick={onClick ? onClick : (e) => e.preventDefault()}
          href={href}
          target={target}
        >
          <Image
            title={onHoverTitle}
            src={allPics[currentIndex]}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-full object-contain cursor-auto"
            quality={image_quality_for_preview}
            loading={loading}
            onLoad={() => setIsLoading(false)}
          />
        </a>
      )}
      {mode === "image-with-icon" || mode === "image-only" && (
        <Image
          onClick={handlePreviewClick}
          title={onHoverTitle}
          src={allPics[currentIndex]}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-full object-contain cursor-zoom-in rounded-lg top-0"
          quality={image_quality_for_preview}
          loading={loading}
          onLoad={() => setIsLoading(false)}
          />
      )}
      {mode === "icon-only"  && (
        <button
          title="Preview"
          onClick={handlePreviewClick}
          className={`
            absolute  p-2 bg-white/90 dark:bg-light-dark hover:bg-white
            rounded-full shadow-lg transition-all duration-200 z-10 backdrop-blur-sm`}
          aria-label="Open image preview"
        >
          {Icon ? (
            <Icon className="w-3 h-3 text-gray-700 dark:text-white" />
          ) : (
            <FaMagnifyingGlass className="w-3 h-3 text-gray-700 dark:text-white" />
          )}
        </button>
      )}
      {mode === "image-with-icon"  && (
        <button
          title="Preview"
          onClick={handlePreviewClick}
          className={`
            absolute  p-2 bg-white/90 dark:bg-light-dark hover:bg-white
            rounded-full shadow-lg transition-all duration-200 z-10 backdrop-blur-sm bottom-1 right-1`}
          aria-label="Open image preview"
        >
          {Icon ? (
            <Icon className="w-3 h-3 text-gray-700 dark:text-white" />
          ) : (
            <FaMagnifyingGlass className="w-3 h-3 text-gray-700 dark:text-white" />
          )}
        </button>
      )}
      {enableSlider && otherPics.length > 0 && !isLoading && (
        <button
          onClick={handlePrevClick}
          className="
          hidden group-hover:block z-[50]
          absolute top-1/2 left-0 transform -translate-y-1/2
          p-2 bg-main-white text-black rounded-full
          dark:bg-light-dark dark:text-main-white
          "
        >
          <FaArrowLeft />
        </button>
      )}
      {enableSlider && otherPics.length > 0 && !isLoading && (
        <button
          onClick={handleNextClick}
          className="
          hidden group-hover:block z-[50] absolute top-1/2
          right-0 transform -translate-y-1/2 p-2 bg-main-white
          text-black rounded-full dark:bg-light-dark dark:text-main-white
         "
        >
          <FaArrowRight />
        </button>
      )}
    </div>
  );
}

// // Key differences and fixes for ImagePreview modal:

// // 1. Z-INDEX ISSUE:
// // EbayPriceAlertModal uses z-[1000]
// // ImagePreview uses z-[9999] - This might be causing layering issues

// // 2. BODY OVERFLOW HANDLING:
// // EbayPriceAlertModal properly handles body overflow in useEffect
// // ImagePreview doesn't manage body overflow

// // 3. MODAL CONTAINER STRUCTURE:
// // EbayPriceAlertModal has proper overflow handling on the modal content

// // Here's the corrected ImagePreview component with the fixes:

// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import Image, { StaticImageData } from "next/image";
// import { IconType } from "react-icons";
// import {
//   FaMapMarkerAlt,
//   FaTruck,
//   FaShieldAlt,
//   FaStar,
//   FaCalendarAlt,
//   FaAmazon,
//   FaEbay,
// } from "react-icons/fa";
// import { Spinner } from "./Spinner";
// import { Item } from "@/app/ebay/types";
// import { FaMagnifyingGlass } from "react-icons/fa6";
// import {
//   ebaySiteToAmazonMapping,
//   ebaySiteUrlMapping,
// } from "@/app/utils/ebaySiteMapping";
// import AffliateDisclosure from "../../affilate-disclosure/AffliateDisclosure";
// import { amazonSiteUrlMapping } from "@/app/utils/amazonSiteMapping";
// import { useSearchStore } from "@/app/store/marketplace-search/store";
// import requests from "@/app/utils/http";
// import { api_paths } from "@/app/contants/api-paths";

// type TImagePreviewProps = {
//   otherPics?: string[];
//   src: string | StaticImageData;
//   alt: string;
//   loading?: "lazy" | "eager" | undefined;
//   width?: number;
//   height?: number;
//   image_quality_when_modal_open?: number;
//   image_quality_for_preview?: number;
//   Icon?: IconType;
//   itemId?: string;
//   ebay_site?: string;
//   amz_site?: string;
//   mode?: "icon-only" | "default" | "image-only";
//   itemTitle?: string;
//   href?: string | undefined;
//   target?: "_blank" | "_self" | "_parent" | "_top";
//   onHoverTitle?: string;
//   onClick?: (e: React.MouseEvent) => void | undefined;
//   EbaySite?: string;
//   AmazonSite?: string;
//   AliexpressSite?: string;
// };

// export default function ImagePreview({
//   otherPics = [],
//   src,
//   alt,
//   width = 800,
//   height = 800,
//   image_quality_when_modal_open = 75,
//   image_quality_for_preview = 75,
//   loading = "lazy",
//   Icon,
//   itemId,
//   mode = "default",
//   itemTitle = "Item Title",
//   href = "#",
//   target = "_self",
//   onHoverTitle = "",
//   onClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//   },
//   EbaySite,
//   AmazonSite,
//   AliexpressSite,
// }: TImagePreviewProps) {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isZoomed, setIsZoomed] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [itemData, setItemData] = useState<Item | null>(null);
//   const [isLoadingItemData, setIsLoadingItemData] = useState(false);
//   const imageRef = useRef<HTMLImageElement>(null);
//   const allImages = [src as string, ...otherPics];
//   const {
//     defaultEbaySite: _defaultEbaySite,
//     defaultAmazonSite: _defaultAmazonSite,
//     defaultAliexpressSite: _defaultAliexpressSite,
//   } = useSearchStore();
//   const defaultEbaySite = EbaySite || _defaultEbaySite;
//   const defaultAmazonSite = AmazonSite || _defaultAmazonSite;
//   const defaultAliexpressSite = AliexpressSite || _defaultAliexpressSite;
//   // FIX 1: Add proper body overflow management like EbayPriceAlertModal
//   useEffect(() => {
//     const handleEscape = (e: KeyboardEvent): void => {
//       if (e.key === "Escape") {
//         setIsModalOpen(false);
//         setIsZoomed(false);
//         setCurrentImageIndex(0);
//       }
//     };

//     if (isModalOpen) {
//       document.addEventListener("keydown", handleEscape);
//       document.body.style.overflow = "hidden"; // This is the key fix!
//     }

//     return () => {
//       document.removeEventListener("keydown", handleEscape);
//       document.body.style.overflow = "unset"; // Reset on cleanup
//     };
//   }, [isModalOpen]);

//   const handleZoomToggle = () => {
//     setIsZoomed(!isZoomed);
//   };

//   const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
//     if (isZoomed && imageRef.current) {
//       const { left, top, width, height } =
//         imageRef.current.getBoundingClientRect();
//       const x = (event.clientX - left) / width;
//       const y = (event.clientY - top) / height;
//       imageRef.current.style.transformOrigin = `${x * 100}% ${y * 100}%`;
//     }
//   };

//   const handleMouseLeave = () => {
//     if (imageRef.current) {
//       setIsZoomed(false);
//     }
//   };

//   const fetchItemData = async () => {
//     if (!itemId || !defaultEbaySite) return;

//     setIsLoadingItemData(true);
//     try {
//       const response = await requests.get(
//         `${api_paths.ebay_get_item_by_id}?itm=${itemId}&site=${defaultEbaySite}`,
//         {
//           headers: {
//             "e-grant": "ebextractor-20",
//           },
//         },
//       );
//       const data: Item = await response.requestsData;
//       setItemData(data);
//     } catch (error) {
//       console.error("Failed to fetch item data:", error);
//     } finally {
//       setIsLoadingItemData(false);
//     }
//   };

//   useEffect(() => {
//     if (isZoomed && imageRef.current) {
//       imageRef.current.style.transform = "scale(2.5)";
//     } else if (!isZoomed && imageRef.current) {
//       imageRef.current.style.transform = "scale(1)";
//     }
//   }, [isZoomed]);

//   useEffect(() => {
//     if (isModalOpen && itemId && defaultEbaySite) {
//       fetchItemData();
//     }
//   }, [isModalOpen, itemId, defaultEbaySite]);

//   const handleThumbnailClick = (index: number) => {
//     setCurrentImageIndex(index);
//     setIsZoomed(false);
//   };

//   const formatPrice = (price: any) => {
//     if (!price) return "N/A";
//     const symbol = price.currency === "USD" ? "$" : price.currency;
//     return `${symbol}${price.value}`;
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString();
//   };

//   const getShippingInfo = (shippingOptions: any[]) => {
//     if (!shippingOptions || shippingOptions.length === 0) return "N/A";

//     const option = shippingOptions[0];
//     if (
//       option.shippingCostType === "FREE" ||
//       option.shippingCost?.value === "0.00"
//     ) {
//       return "Free Shipping";
//     }

//     if (option.shippingCostType === "FIXED") {
//       const symbol =
//         option.shippingCost?.currency === "USD"
//           ? "$"
//           : option.shippingCost?.currency;
//       return `${symbol}${option.shippingCost?.value} Shipping`;
//     }

//     return "Calculated Shipping";
//   };

//   const handleBuyOnEbay = () => {
//     const _site = defaultEbaySite === undefined ? "EBAY_US" : defaultEbaySite;
//     if (itemTitle) {
//       const eBayUrl = itemData?.itemAffiliateWebUrl
//         ? itemData.itemAffiliateWebUrl
//         : `${ebaySiteUrlMapping[_site]}sch/i.html?_nkw=${encodeURIComponent(
//             itemTitle,
//           )}&mkevt=1&mkcid=1&mkrid=711-53200-19255-0&campid=5339079461&customid=ebextractor&toolid=10049`;
//       window.open(itemData?.itemAffiliateWebUrl || eBayUrl, "_blank");
//     }
//   };

//   const handleCheckOnAmazon = () => {
//     const _site =
//       defaultAmazonSite === undefined ? "amazon.com" : defaultAmazonSite;
//     if (itemTitle) {
//       const amazonUrl = `${amazonSiteUrlMapping[_site]}s?k=${encodeURIComponent(
//         itemTitle,
//       )}&tag=ebextractor0d-20`;
//       window.open(amazonUrl, "_blank");
//     }
//   };
//   const handleCheckOnAliExpress = () => {
//     const aliexpressUrl = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(
//       itemTitle,
//     )}&terminal_id=feb1c430a7064eb980a23522543fcdca`;
//     window.open(aliexpressUrl, "_blank");
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setIsZoomed(false);
//     setCurrentImageIndex(0);
//   };

//   return (
//     <>
//       <div className="relative">
//         {isLoading && mode !== "icon-only" && (
//           <Spinner className="w-4 h-4 absolute mx-auto my-auto inset-0 text-black" />
//         )}
//         {mode !== "icon-only" && mode !== "image-only" ? (
//           <a onClick={onClick} href={href} target={target}>
//             <Image
//               title={onHoverTitle}
//               src={src}
//               alt={alt}
//               width={width}
//               height={height}
//               className="w-full h-full object-contain cursor-pointer rounded-lg top-0"
//               quality={image_quality_for_preview}
//               loading={loading}
//               onLoad={() => setIsLoading(false)}
//             />
//           </a>
//         ) : (
//           mode === "image-only" && (
//             <Image
//               title={onHoverTitle}
//               src={src}
//               alt={alt}
//               width={width}
//               height={height}
//               className="w-full h-full object-contain cursor-pointer rounded-lg top-0"
//               quality={image_quality_for_preview}
//               loading={loading}
//               onLoad={() => setIsLoading(false)}
//             />
//           )
//         )}

//         {!Icon && mode !== "image-only" ? (
//           <button
//             title="Preview"
//             onClick={() => setIsModalOpen(true)}
//             className="absolute bottom-0 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10 backdrop-blur-sm"
//             aria-label="Open image preview"
//           >
//             <FaMagnifyingGlass className="w-3 h-3 text-gray-700" />
//           </button>
//         ) : (
//           mode !== "image-only" &&
//           Icon && (
//             <button
//               title="Preview"
//               onClick={() => setIsModalOpen(true)}
//               className="absolute bottom-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10 dark:bg-gray-800/90 dark:hover:bg-gray-800 dark:border-gray-600 dark:border backdrop-blur-sm"
//               aria-label="Open image preview"
//             >
//               <Icon className="w-3 h-3 text-gray-700 dark:text-white" />
//             </button>
//           )
//         )}
//       </div>

//       {isModalOpen && (
//         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
//           <div
//             className="absolute inset-0 bg-black/70 bg-opacity-50 transition-opacity"
//             onClick={closeModal}
//           />
//           <div
//             className="relative bg-white dark:bg-gray-900 w-full h-full max-w-6xl flex flex-col shadow-2xl m-2 sm:m-4 max-h-[90vh] overflow-y-auto small-scrollbar rounded-xl"
//             onClick={(e) => e.stopPropagation()}
//             style={{ overflow: `${isZoomed ? "hidden" : "auto"}` }}
//           >
//             <button
//               onClick={closeModal}
//               className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-gray-900/80 hover:bg-gray-900 rounded-full text-white z-20 transition-all duration-200 backdrop-blur-sm"
//               aria-label="Close modal"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>

//             <div className="flex-1 flex flex-col p-4 sm:p-6">
//               <div
//                 className="relative flex-1 flex items-center justify-center mb-3 sm:mb-4 min-h-[50vh]"
//                 onMouseMove={handleMouseMove}
//                 onMouseLeave={handleMouseLeave}
//               >
//                 {isLoading && (
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <Spinner className="w-8 h-8 text-blue-500" />
//                   </div>
//                 )}
//                 <Image
//                   ref={imageRef}
//                   src={allImages[currentImageIndex]}
//                   alt={alt}
//                   width={700}
//                   height={700}
//                   className="max-w-full max-h-full object-contain transition-transform duration-300 rounded-lg"
//                   style={{
//                     cursor: isZoomed ? "zoom-out" : "zoom-in",
//                   }}
//                   quality={image_quality_when_modal_open}
//                   loading="eager"
//                   onLoad={() => setIsLoading(false)}
//                   onClick={handleZoomToggle}
//                 />
//               </div>

//               {!isZoomed && allImages.length > 1 && (
//                 <div className="flex gap-2 overflow-x-auto pb-2">
//                   {allImages.map((img, index) => (
//                     <button
//                       key={index}
//                       onClick={() => handleThumbnailClick(index)}
//                       className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
//                         currentImageIndex === index
//                           ? "border-blue-500 ring-2 ring-blue-200 shadow-md"
//                           : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
//                       }`}
//                     >
//                       <Image
//                         src={img}
//                         alt={`Thumbnail ${index + 1}`}
//                         width={64}
//                         height={64}
//                         className="w-full h-full object-cover"
//                         quality={50}
//                       />
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {!isZoomed && (
//               <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
//                 <div className="flex-wrap gap-2 mb-1 md:flex">
//                   {itemTitle && (
//                     <button
//                       onClick={handleBuyOnEbay}
//                       className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
//                     >
//                       <FaEbay className="w-4 h-4" />
//                       Buy on eBay
//                     </button>
//                   )}
//                   {itemTitle && (
//                     <button
//                       onClick={handleCheckOnAmazon}
//                       className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
//                     >
//                       <FaAmazon className="w-4 h-4" />
//                       Check on Amazon
//                     </button>
//                   )}
//                   {itemTitle && (
//                     <button
//                       onClick={handleCheckOnAliExpress}
//                       className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
//                     >
//                       <FaAmazon className="w-4 h-4" />
//                       Check on AliExpress
//                     </button>
//                   )}
//                 </div>
//                 <AffliateDisclosure />

//                 {itemId && defaultEbaySite && (
//                   <div className="mt-4">
//                     <div className="mt-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto small-scrollbar">
//                       <div className="p-4">
//                         {isLoadingItemData ? (
//                           <div className="flex items-center justify-center py-8">
//                             <Spinner className="w-6 h-6 text-blue-500" />
//                           </div>
//                         ) : itemData ? (
//                           <div className="space-y-3">
//                             {itemData.price && (
//                               <div className="space-y-3">
//                                 {itemData.price && (
//                                   <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
//                                     <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
//                                       Price
//                                     </h4>
//                                     <p className="text-xl font-bold text-green-600 dark:text-green-400">
//                                       {formatPrice(itemData.price)}
//                                     </p>
//                                   </div>
//                                 )}

//                                 {itemData.condition && (
//                                   <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
//                                     <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
//                                       Condition
//                                     </h4>
//                                     <div className="flex items-center gap-2">
//                                       <FaShieldAlt className="text-blue-500 w-3 h-3" />
//                                       <span className="text-gray-700 dark:text-gray-300 text-sm">
//                                         {itemData.condition}
//                                       </span>
//                                     </div>
//                                     {itemData.conditionDescription && (
//                                       <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
//                                         {itemData.conditionDescription}
//                                       </p>
//                                     )}
//                                   </div>
//                                 )}

//                                 {itemData.itemLocation && (
//                                   <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
//                                     <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
//                                       Location
//                                     </h4>
//                                     <div className="flex items-center gap-2">
//                                       <FaMapMarkerAlt className="text-red-500 w-3 h-3" />
//                                       <span className="text-gray-700 dark:text-gray-300 text-sm">
//                                         {itemData.itemLocation.city},{" "}
//                                         {itemData.itemLocation.stateOrProvince}
//                                       </span>
//                                     </div>
//                                     <p className="text-xs text-gray-600 dark:text-gray-400">
//                                       {itemData.itemLocation.country}
//                                     </p>
//                                   </div>
//                                 )}

//                                 {itemData.shippingOptions &&
//                                   itemData.shippingOptions.length > 0 && (
//                                     <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
//                                       <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
//                                         Shipping
//                                       </h4>
//                                       <div className="flex items-center gap-2">
//                                         <FaTruck className="text-blue-500 w-3 h-3" />
//                                         <span className="text-gray-700 dark:text-gray-300 text-sm">
//                                           {getShippingInfo(
//                                             itemData.shippingOptions,
//                                           )}
//                                         </span>
//                                       </div>
//                                       {itemData.shippingOptions[0]
//                                         .minEstimatedDeliveryDate && (
//                                         <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
//                                           Delivery:{" "}
//                                           {formatDate(
//                                             itemData.shippingOptions[0].minEstimatedDeliveryDate.toString(),
//                                           )}
//                                           {itemData.shippingOptions[0]
//                                             .maxEstimatedDeliveryDate &&
//                                             ` - ${formatDate(
//                                               itemData.shippingOptions[0].maxEstimatedDeliveryDate.toString(),
//                                             )}`}
//                                         </p>
//                                       )}
//                                     </div>
//                                   )}

//                                 {itemData.seller && (
//                                   <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
//                                     <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
//                                       Seller
//                                     </h4>
//                                     <div className="space-y-1">
//                                       <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">
//                                         {itemData.seller.username}
//                                       </p>
//                                       <div className="flex items-center gap-2">
//                                         <FaStar className="text-yellow-500 w-3 h-3" />
//                                         <span className="text-gray-700 dark:text-gray-300 text-sm">
//                                           {itemData.seller.feedbackPercentage}%
//                                           positive
//                                         </span>
//                                       </div>
//                                       <p className="text-xs text-gray-600 dark:text-gray-400">
//                                         {itemData.seller.feedbackScore} reviews
//                                       </p>
//                                     </div>
//                                   </div>
//                                 )}

//                                 {itemData.returnTerms && (
//                                   <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
//                                     <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
//                                       Returns
//                                     </h4>
//                                     <div className="space-y-1">
//                                       <p className="text-gray-700 dark:text-gray-300 text-sm">
//                                         {itemData.returnTerms.returnsAccepted
//                                           ? "Returns accepted"
//                                           : "No returns"}
//                                       </p>
//                                       {itemData.returnTerms.returnPeriod && (
//                                         <p className="text-xs text-gray-600 dark:text-gray-400">
//                                           {
//                                             itemData.returnTerms.returnPeriod
//                                               .value
//                                           }{" "}
//                                           {
//                                             itemData.returnTerms.returnPeriod
//                                               .unit
//                                           }
//                                         </p>
//                                       )}
//                                     </div>
//                                   </div>
//                                 )}

//                                 {itemData.itemCreationDate && (
//                                   <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
//                                     <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
//                                       Listed
//                                     </h4>
//                                     <div className="flex items-center gap-2">
//                                       <FaCalendarAlt className="text-gray-500 w-3 h-3" />
//                                       <span className="text-gray-700 dark:text-gray-300 text-sm">
//                                         {formatDate(
//                                           itemData.itemCreationDate.toString(),
//                                         )}
//                                       </span>
//                                     </div>
//                                   </div>
//                                 )}

//                                 {/* Brand */}
//                                 {itemData.brand && (
//                                   <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
//                                     <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm">
//                                       Brand
//                                     </h4>
//                                     <p className="text-gray-700 dark:text-gray-300 text-sm">
//                                       {itemData.brand}
//                                     </p>
//                                   </div>
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                         ) : (
//                           <p className="text-gray-500 dark:text-gray-400 text-sm">
//                             Failed to load item details
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
