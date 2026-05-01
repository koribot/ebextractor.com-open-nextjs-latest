import ImagePreview from "@/app/components/common/ui/ImagePreview";
import Description from "@/app/components/ebay/Description";
import { baseUrl } from "@/app/contants/baseUrl";
import { Item } from "@/app/ebay/types";
import React from "react";
import { format } from "date-fns";
import AffliateDisclosure from "@/app/components/affilate-disclosure/AffliateDisclosure";
import ScarcityChart from "./ScarcityChart";
import EbayItemVariationForFullProductPage from "@/app/components/ebay-item-variation-for-full-product-page/EbayItemVariationForFullProductPage";
import ShareEbextractorLink from "@/app/components/share-ebextractor-link/ShareEbextractorLink";
import Image from "next/image";

interface Props {
  itemData: Item;
  cleanSite?: string;
  itemsInVariation?: { items: Item[]; itemIds: string[] } | null;
}
function EbayProductFullDetailsCard({
  itemData,
  cleanSite = "EBAY_US",
  itemsInVariation,
}: Props) {
  const allImages = [
    ...(itemData.image ? [itemData.image] : []),
    ...(itemData.additionalImages || []),
  ];
  const additionalImageUrlsArr: string[] =
    (itemData.additionalImages &&
      itemData?.additionalImages.map((img) => img.imageUrl)) ||
    [];
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-light-dark">
      {/* Main Product Section */}
      <div className="flex bg-white dark:bg-light-dark border-b border-gray-200 dark:border-gray-800 ">
        <div className="flex flex-col md:flex-row gap-5 max-w-[1490px] mx-auto px-4 sm:px-6 lg:px-8 py-6 ">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Sticky Image Gallery */}
            <div className="lg:col-span-7">
              <div className="lg:sticky lg:top-6">
                {/* Thumbnail Navigation - Left Side on Desktop */}
                <div className="grid grid-flow-row md:grid-flow-col gap-2">
                  {allImages.length > 1 && (
                    <div className="grid grid-flow-col md:grid-flow-row max-h-[500px] overflow-x-auto place-items-center p-1">
                      {allImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="flex border p-1 h-25 w-25 justify-center border-gray-200
                          dark:border-gray-700 dark:bg-light-dark rounded-md
                          hover:border-blue-500 cursor-pointer overflow-hidden"
                        >
                          {/* <Image
                            src={img.imageUrl}
                            alt={`Thumbnail ${idx + 1}`}
                            width={100}
                            height={100}
                            className="object-contain"
                          /> */}
                          <ImagePreview
                            src={img.imageUrl}
                            alt={`Thumbnail ${idx + 1}`}
                            width={100}
                            height={100}
                            itemTitle={itemData.title}
                            mode="image-only"
                            otherPics={additionalImageUrlsArr}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Main Image */}
                  <div className="flex-6">
                    <div
                      className=" md:max-h-[500px] w-full flex items-center justify-center small-scrollbar
                      bg-white dark:bg-light-dark border border-gray-200 dark:border-gray-800 rounded-lg overflow-auto"
                    >
                      {itemData?.image && (
                        <div>
                          <ImagePreview
                            src={itemData.image.imageUrl}
                            alt={itemData.title}
                            width={500}
                            height={500}
                            itemTitle={itemData.title}
                            otherPics={additionalImageUrlsArr}
                            enableSlider={true}
                            mode="image-with-icon"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/*Call similar items later*/}
                {/*<button className="h-50">Hello</button>*/}
              </div>
            </div>

            {/* Right Column - Product Information */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex gap-1">
                {/* Condition Badge */}
                {itemData?.condition && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    {itemData.condition}
                  </div>
                )}
                {itemData?.estimatedAvailabilities &&
                  itemData?.estimatedAvailabilities.map((item, index) => (
                    <div key={index} className="flex gap-1">
                      {/*<div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        <p>
                          {item.estimatedAvailabilityStatus === "IN_STOCK"
                            ? "In-Stock"
                            : "Out of Stock"}
                        </p>
                      </div>*/}
                      <div
                        className={`${
                          item.estimatedRemainingQuantity <= 0
                            ? "bg-red-900 text-gray-50 "
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800"
                        } inline-flex items-center px-3 py-1 rounded-full text-xs font-medium    dark:text-gray-200`}
                      >
                        <p>
                          {item.estimatedRemainingQuantity <= 0
                            ? "SOLD OUT"
                            : `Qty:${item.estimatedRemainingQuantity}`}
                        </p>
                      </div>
                      <div className="inline-flex text-xs items-center px-3 py-1 rounded-full  font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        <p>Estimated Sold: {item.estimatedSoldQuantity}</p>
                      </div>
                    </div>
                  ))}
              </div>
              {/* Title */}
              <div>
                <h1 className="text-sm font-bold md:text-lg  text-gray-900 dark:text-gray-100 leading-tight">
                  {itemData?.title}
                </h1>{" "}
              </div>
              {/* Condition Description */}
              {itemData?.conditionDescription && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    <span className="font-semibold">Condition note: </span>
                    {itemData.conditionDescription}
                  </p>
                </div>
              )}
              {/* Price Section */}
              {itemData?.price?.value && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {itemData.price.currency} {itemData.price.value}
                    </span>
                    {itemData.marketingPrice?.originalPrice &&
                      !itemData?.condition?.includes("Refurbished") && (
                        <span className="line-through text-gray-500 dark:text-gray-400">
                          {itemData.marketingPrice.originalPrice.value}
                        </span>
                      )}
                  </div>
                  {itemData?.shippingOptions?.some((opt) =>
                    opt.shippingCost?.value?.startsWith("0.00"),
                  ) && (
                    <div className="mt-2 flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Free shipping</span>
                    </div>
                  )}
                </div>
              )}
              {itemData.primaryItemGroup && (
                <div>
                  <EbayItemVariationForFullProductPage
                    itemsData={itemsInVariation}
                  />
                  {itemData.estimatedAvailabilities[0]
                    .estimatedRemainingQuantity <= 0 && (
                    <div className="text-red-500 text-sm">
                      This Variation is Out of stock, please select another
                      variation.
                    </div>
                  )}
                </div>
              )}
              {/* Buy Button */}
              {itemData?.itemAffiliateWebUrl && (
                <div className="space-y-3">
                  <a
                    href={itemData.itemAffiliateWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                    ${
                      itemData.estimatedAvailabilities[0]
                        .estimatedRemainingQuantity <= 0
                        ? "bg-blue-600/30 pointer-events-none"
                        : "bg-blue-600"
                    }
                     block w-full bg-blue-600 dark:bg-light-dark
                    dark:border dark:border-gray-600 hover:bg-blue-700 text-white
                    font-bold py-2 px-2 rounded-lg text-center transition-colors shadow-sm text-lg`}
                  >
                    Buy It Now
                  </a>
                  <AffliateDisclosure />
                </div>
              )}
              {/* Meta Information */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3 text-sm">
                {itemData?.brand && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Brand
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {itemData.brand}
                    </span>
                  </div>
                )}

                {itemData?.itemLocation && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Location
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {itemData.itemLocation.city},{" "}
                      {itemData.itemLocation.country}
                    </span>
                  </div>
                )}

                {itemData?.itemCreationDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Listed
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {format(
                        new Date(itemData.itemCreationDate),
                        "MMM dd, yyyy",
                      )}
                    </span>
                  </div>
                )}
              </div>
              {/* Seller Information */}
              {itemData?.seller && (
                <div className="border-t border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Seller Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Username
                      </span>
                      <a
                        title={`View ${itemData.seller.username}'s products`}
                        target="_blank"
                        href={`${baseUrl}/ebay-search-by-seller?sellers=${itemData.seller.username}&site=${cleanSite}`}
                        className="font-semibold text-blue-600 dark:text-blue-400 underline"
                      >
                        {itemData.seller.username}
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Feedback
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {itemData.seller.feedbackPercentage}% (
                        {itemData.seller.feedbackScore})
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <ShareEbextractorLink
                // url={itemData.itemAffiliateWebUrl}
                title={itemData.title}
                imageUrl={itemData.image.imageUrl}
              />
            </div>
          </div>
          <ScarcityChart itemData={itemData} />
        </div>
      </div>

      {/* Full Width Sections Below */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Description */}
        <div className="bg-white dark:bg-light-dark rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
          {itemData?.description && (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <Description html={itemData.description} />
            </div>
          )}
          {itemData?.shortDescription && (
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-md">
              {itemData.shortDescription}
            </p>
          )}
        </div>

        {/* Item Specifics */}
        {itemData?.localizedAspects && itemData.localizedAspects.length > 0 && (
          <div className="bg-white dark:bg-light-dark rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Item Specifics
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {itemData.localizedAspects.map((aspect, idx) => (
                <div
                  key={idx}
                  className="flex flex-col py-2 border-b border-gray-100 dark:border-gray-800"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {aspect.name}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {aspect.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Additional IDs */}
            {(itemData?.gtin || itemData?.mpn) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {itemData?.gtin && (
                  <div className="flex flex-col py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      GTIN
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {itemData.gtin}
                    </span>
                  </div>
                )}
                {itemData?.mpn && (
                  <div className="flex flex-col py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      MPN
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {itemData.mpn}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Shipping & Returns - Two Column Layout */}
        <div className="bg-white dark:bg-light-dark rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Shipping & Returns
          </h2>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Shipping Options */}
            {itemData?.shippingOptions &&
              itemData.shippingOptions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                      />
                    </svg>
                    Shipping Options
                  </h3>
                  <div className="space-y-3">
                    {itemData.shippingOptions.map((option, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {option.type}
                          </span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">
                            {option.shippingCost.currency}{" "}
                            {option.shippingCost.value}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Delivery:{" "}
                          {new Date(
                            option.minEstimatedDeliveryDate,
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(
                            option.maxEstimatedDeliveryDate,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Return Policy */}
            {itemData?.returnTerms && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Return Policy
                </h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Returns Accepted
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {itemData.returnTerms.returnsAccepted ? "Yes" : "No"}
                    </span>
                  </div>
                  {itemData.returnTerms.returnPeriod && (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Return Period
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {itemData.returnTerms.returnPeriod.value}{" "}
                        {itemData.returnTerms.returnPeriod.unit}
                      </span>
                    </div>
                  )}
                  {itemData.returnTerms.returnShippingCostPayer && (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Return Shipping Paid By
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {itemData.returnTerms.returnShippingCostPayer}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ship To Locations */}
          {itemData?.shipToLocations && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="grid md:grid-cols-2 gap-6">
                {itemData.shipToLocations.regionIncluded?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Ships to
                    </h4>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-40 overflow-auto">
                      <ul className="text-sm space-y-1">
                        {itemData.shipToLocations.regionIncluded.map(
                          (region, idx) => (
                            <li
                              key={idx}
                              className="text-gray-700 dark:text-gray-300"
                            >
                              • {region.regionName}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                )}
                {itemData.shipToLocations.regionExcluded?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Does not ship to
                    </h4>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-40 overflow-auto">
                      <ul className="text-sm space-y-1">
                        {itemData.shipToLocations.regionExcluded.map(
                          (region, idx) => (
                            <li
                              key={idx}
                              className="text-gray-700 dark:text-gray-300"
                            >
                              • {region.regionName}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        {itemData?.paymentMethods && itemData.paymentMethods.length > 0 && (
          <div className="bg-white dark:bg-light-dark rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Payment Methods
            </h2>
            <div className="flex flex-wrap gap-3">
              {itemData.paymentMethods.map((method, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3"
                >
                  <span className="font-semibold text-gray-900 dark:text-gray-100 block mb-1">
                    {method.paymentMethodType}
                  </span>
                  {method.paymentMethodBrands &&
                    method.paymentMethodBrands.length > 0 && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {method.paymentMethodBrands
                          .map((b) => b.paymentMethodBrandType)
                          .join(", ")}
                      </span>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EbayProductFullDetailsCard;

// import ImagePreview from "@/app/components/common/ui/ImagePreview";
// import Description from "@/app/components/ebay/Description";
// import { baseUrl } from "@/app/contants/baseUrl";
// import { Item } from "@/app/ebay/types";
// import React from "react";
// import { format } from "date-fns";
// import AffliateDisclosure from "@/app/components/affilate-disclosure/AffliateDisclosure";
// import ScarcityChart from "./ScarcityChart";
// import EbayItemVariationForFullProductPage from "@/app/components/ebay-item-variation-for-full-product-page/EbayItemVariationForFullProductPage";
// import ShareEbextractorLink from "@/app/components/share-ebextractor-link/ShareEbextractorLink";
// import Image from "next/image";

// interface Props {
//   itemData: Item;
//   cleanSite?: string;
//   itemsInVariation?: { items: Item[]; itemIds: string[] } | null;
// }

// function EbayProductFullDetailsCard({
//   itemData,
//   cleanSite = "EBAY_US",
//   itemsInVariation,
// }: Props) {
//   const allImages = [
//     ...(itemData.image ? [itemData.image] : []),
//     ...(itemData.additionalImages || []),
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-light-dark">
//       {/* Main Product Section */}
//       <div className="bg-white dark:bg-light-dark border-b border-gray-200 dark:border-gray-800">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="flex flex-col lg:flex-row gap-8">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
//               {/* Left Column - Images */}
//               <div className="space-y-4">
//                 {/* Main Image */}
//                 <div className="bg-white dark:bg-light-dark border border-gray-200 dark:border-gray-800 rounded-lg max-h-[500px] overflow-auto">
//                   {itemData?.image && (
//                     <div className="flex items-center justify-center p-4">
//                       <ImagePreview
//                         src={itemData.image.imageUrl}
//                         alt={itemData.title}
//                         width={500}
//                         height={500}
//                         itemTitle={itemData.title}
//                       />
//                     </div>
//                   )}
//                 </div>

//                 {/* Thumbnail Gallery */}
//                 {allImages.length > 1 && (
//                   <div className="flex gap-2 overflow-x-auto pb-2">
//                     {allImages.map((img, idx) => (
//                       <div
//                         key={idx}
//                         className="
//                         flex-shrink-0 overflow-auto border-2 border-gray-200 dark:border-gray-700 small-scrollbar
//                         dark:bg-light-dark rounded-md hover:border-blue-500 cursor-pointer transition-colors"
//                       >
//                         <Image
//                           src={img.imageUrl}
//                           width={64}
//                           height={64}
//                           alt={`Thumbnail ${idx + 1}`}
//                         />
//                         <ImagePreview
//                           src={img.imageUrl}
//                           alt={`Thumbnail ${idx + 1}`}
//                           width={64}
//                           height={64}
//                           itemTitle={itemData.title}
//                           mode="icon-only"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Right Column - Product Info */}
//               <div className="space-y-2">
//                 {/* Badges */}
//                 <div className="flex gap-1">
//                   {itemData?.condition && (
//                     <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
//                       {itemData.condition}
//                     </div>
//                   )}
//                   {itemData?.estimatedAvailabilities?.map((item, index) => (
//                     <div key={index} className="flex gap-1">
//                       <div
//                         className={`${
//                           item.estimatedRemainingQuantity <= 0
//                             ? "bg-red-900 text-gray-50"
//                             : "bg-gray-100 text-gray-800 dark:bg-gray-800"
//                         } inline-flex items-center px-3 py-1 rounded-full text-xs font-medium dark:text-gray-200`}
//                       >
//                         <p>
//                           {item.estimatedRemainingQuantity <= 0
//                             ? "SOLD OUT"
//                             : `Qty:${item.estimatedRemainingQuantity}`}
//                         </p>
//                       </div>
//                       <div className="inline-flex text-xs items-center px-3 py-1 rounded-full font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
//                         <p>Estimated Sold: {item.estimatedSoldQuantity}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Title */}
//                 <div>
//                   <h1 className="text-sm font-bold md:text-lg text-gray-900 dark:text-gray-100 leading-tight">
//                     {itemData?.title}
//                   </h1>
//                 </div>

//                 {/* Condition Description */}
//                 {itemData?.conditionDescription && (
//                   <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-4 rounded">
//                     <p className="text-sm text-blue-900 dark:text-blue-200">
//                       <span className="font-semibold">Condition note: </span>
//                       {itemData.conditionDescription}
//                     </p>
//                   </div>
//                 )}

//                 {/* Price Section */}
//                 {itemData?.price?.value && (
//                   <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
//                     <div className="flex items-baseline gap-2">
//                       <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
//                         {itemData.price.currency} {itemData.price.value}
//                       </span>
//                     </div>
//                     {itemData?.shippingOptions?.some((opt) =>
//                       opt.shippingCost?.value?.startsWith("0.00"),
//                     ) && (
//                       <div className="mt-2 flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
//                         <svg
//                           className="w-5 h-5"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M5 13l4 4L19 7"
//                           />
//                         </svg>
//                         <span>Free shipping</span>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Variations */}
//                 {itemData.primaryItemGroup && (
//                   <div>
//                     <EbayItemVariationForFullProductPage
//                       itemsData={itemsInVariation}
//                     />
//                     {itemData.estimatedAvailabilities[0]
//                       .estimatedRemainingQuantity <= 0 && (
//                       <div className="text-red-500 text-sm">
//                         This Variation is Out of stock, please select another
//                         variation.
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Buy Button */}
//                 {itemData?.itemAffiliateWebUrl && (
//                   <div className="space-y-3">
//                     <a
//                       href={itemData.itemAffiliateWebUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className={`${
//                         itemData.estimatedAvailabilities[0]
//                           .estimatedRemainingQuantity <= 0
//                           ? "bg-blue-600/30 pointer-events-none"
//                           : "bg-blue-600"
//                       } block w-full bg-blue-600 dark:bg-light-dark dark:border dark:border-gray-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-center transition-colors shadow-sm text-lg`}
//                     >
//                       Buy It Now
//                     </a>
//                     <AffliateDisclosure />
//                   </div>
//                 )}

//                 {/* Meta Information */}
//                 <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3 text-sm">
//                   {itemData?.brand && (
//                     <div className="flex items-center justify-between">
//                       <span className="text-gray-600 dark:text-gray-400">
//                         Brand
//                       </span>
//                       <span className="font-semibold text-gray-900 dark:text-gray-100">
//                         {itemData.brand}
//                       </span>
//                     </div>
//                   )}

//                   {itemData?.itemLocation && (
//                     <div className="flex items-center justify-between">
//                       <span className="text-gray-600 dark:text-gray-400">
//                         Location
//                       </span>
//                       <span className="font-medium text-gray-900 dark:text-gray-100">
//                         {itemData.itemLocation.city},{" "}
//                         {itemData.itemLocation.country}
//                       </span>
//                     </div>
//                   )}

//                   {itemData?.itemCreationDate && (
//                     <div className="flex items-center justify-between">
//                       <span className="text-gray-600 dark:text-gray-400">
//                         Listed
//                       </span>
//                       <span className="font-medium text-gray-900 dark:text-gray-100">
//                         {format(
//                           new Date(itemData.itemCreationDate),
//                           "MMM dd, yyyy",
//                         )}
//                       </span>
//                     </div>
//                   )}
//                 </div>

//                 {/* Seller Information */}
//                 {itemData?.seller && (
//                   <div className="border-t border-gray-200 dark:border-gray-800">
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
//                       Seller Information
//                     </h3>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex items-center justify-between">
//                         <span className="text-gray-600 dark:text-gray-400">
//                           Username
//                         </span>
//                         <a
//                           title={`View ${itemData.seller.username}'s products`}
//                           target="_blank"
//                           href={`${baseUrl}/ebay-search-by-seller?sellers=${itemData.seller.username}&site=${cleanSite}`}
//                           className="font-semibold text-blue-600 dark:text-blue-400 underline"
//                         >
//                           {itemData.seller.username}
//                         </a>
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <span className="text-gray-600 dark:text-gray-400">
//                           Feedback
//                         </span>
//                         <span className="font-semibold text-gray-900 dark:text-gray-100">
//                           {itemData.seller.feedbackPercentage}% (
//                           {itemData.seller.feedbackScore})
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <ShareEbextractorLink
//                   title={itemData.title}
//                   imageUrl={itemData.image.imageUrl}
//                 />
//               </div>
//             </div>

//             {/* Scarcity Chart */}
//             <ScarcityChart itemData={itemData} />
//           </div>
//         </div>
//       </div>

//       {/* Full Width Sections Below */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* Description */}
//         <div className="bg-white dark:bg-light-dark rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
//           {itemData?.description && (
//             <div className="prose prose-sm max-w-none dark:prose-invert">
//               <Description html={itemData.description} />
//             </div>
//           )}
//           {itemData?.shortDescription && (
//             <p className="mt-2 text-gray-600 dark:text-gray-400 text-md">
//               {itemData.shortDescription}
//             </p>
//           )}
//         </div>

//         {/* Item Specifics */}
//         {itemData?.localizedAspects && itemData.localizedAspects.length > 0 && (
//           <div className="bg-white dark:bg-light-dark rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
//               Item Specifics
//             </h2>
//             <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {itemData.localizedAspects.map((aspect, idx) => (
//                 <div
//                   key={idx}
//                   className="flex flex-col py-2 border-b border-gray-100 dark:border-gray-800"
//                 >
//                   <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">
//                     {aspect.name}
//                   </span>
//                   <span className="font-medium text-gray-900 dark:text-gray-100">
//                     {aspect.value}
//                   </span>
//                 </div>
//               ))}
//             </div>

//             {/* Additional IDs */}
//             {(itemData?.gtin || itemData?.mpn) && (
//               <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {itemData?.gtin && (
//                   <div className="flex flex-col py-2">
//                     <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">
//                       GTIN
//                     </span>
//                     <span className="font-medium text-gray-900 dark:text-gray-100">
//                       {itemData.gtin}
//                     </span>
//                   </div>
//                 )}
//                 {itemData?.mpn && (
//                   <div className="flex flex-col py-2">
//                     <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">
//                       MPN
//                     </span>
//                     <span className="font-medium text-gray-900 dark:text-gray-100">
//                       {itemData.mpn}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Shipping & Returns - Two Column Layout */}
//         <div className="bg-white dark:bg-light-dark rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
//             Shipping & Returns
//           </h2>

//           <div className="grid lg:grid-cols-2 gap-6">
//             {/* Shipping Options */}
//             {itemData?.shippingOptions &&
//               itemData.shippingOptions.length > 0 && (
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
//                     <svg
//                       className="w-5 h-5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
//                       />
//                     </svg>
//                     Shipping Options
//                   </h3>
//                   <div className="space-y-3">
//                     {itemData.shippingOptions.map((option, idx) => (
//                       <div
//                         key={idx}
//                         className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
//                       >
//                         <div className="flex justify-between items-start mb-2">
//                           <span className="font-semibold text-gray-900 dark:text-gray-100">
//                             {option.type}
//                           </span>
//                           <span className="font-bold text-gray-900 dark:text-gray-100">
//                             {option.shippingCost.currency}{" "}
//                             {option.shippingCost.value}
//                           </span>
//                         </div>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                           Delivery:{" "}
//                           {new Date(
//                             option.minEstimatedDeliveryDate,
//                           ).toLocaleDateString()}{" "}
//                           -{" "}
//                           {new Date(
//                             option.maxEstimatedDeliveryDate,
//                           ).toLocaleDateString()}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//             {/* Return Policy */}
//             {itemData?.returnTerms && (
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
//                     />
//                   </svg>
//                   Return Policy
//                 </h3>
//                 <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
//                   <div className="flex flex-col">
//                     <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">
//                       Returns Accepted
//                     </span>
//                     <span className="font-semibold text-gray-900 dark:text-gray-100">
//                       {itemData.returnTerms.returnsAccepted ? "Yes" : "No"}
//                     </span>
//                   </div>
//                   {itemData.returnTerms.returnPeriod && (
//                     <div className="flex flex-col">
//                       <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">
//                         Return Period
//                       </span>
//                       <span className="font-semibold text-gray-900 dark:text-gray-100">
//                         {itemData.returnTerms.returnPeriod.value}{" "}
//                         {itemData.returnTerms.returnPeriod.unit}
//                       </span>
//                     </div>
//                   )}
//                   {itemData.returnTerms.returnShippingCostPayer && (
//                     <div className="flex flex-col">
//                       <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">
//                         Return Shipping Paid By
//                       </span>
//                       <span className="font-semibold text-gray-900 dark:text-gray-100">
//                         {itemData.returnTerms.returnShippingCostPayer}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Ship To Locations */}
//           {itemData?.shipToLocations && (
//             <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
//               <div className="grid md:grid-cols-2 gap-6">
//                 {itemData.shipToLocations.regionIncluded?.length > 0 && (
//                   <div>
//                     <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
//                       Ships to
//                     </h4>
//                     <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-40 overflow-auto">
//                       <ul className="text-sm space-y-1">
//                         {itemData.shipToLocations.regionIncluded.map(
//                           (region, idx) => (
//                             <li
//                               key={idx}
//                               className="text-gray-700 dark:text-gray-300"
//                             >
//                               • {region.regionName}
//                             </li>
//                           ),
//                         )}
//                       </ul>
//                     </div>
//                   </div>
//                 )}
//                 {itemData.shipToLocations.regionExcluded?.length > 0 && (
//                   <div>
//                     <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
//                       Does not ship to
//                     </h4>
//                     <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-40 overflow-auto">
//                       <ul className="text-sm space-y-1">
//                         {itemData.shipToLocations.regionExcluded.map(
//                           (region, idx) => (
//                             <li
//                               key={idx}
//                               className="text-gray-700 dark:text-gray-300"
//                             >
//                               • {region.regionName}
//                             </li>
//                           ),
//                         )}
//                       </ul>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Payment Methods */}
//         {itemData?.paymentMethods && itemData.paymentMethods.length > 0 && (
//           <div className="bg-white dark:bg-light-dark rounded-lg border border-gray-200 dark:border-gray-800 p-6">
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
//               Payment Methods
//             </h2>
//             <div className="flex flex-wrap gap-3">
//               {itemData.paymentMethods.map((method, idx) => (
//                 <div
//                   key={idx}
//                   className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3"
//                 >
//                   <span className="font-semibold text-gray-900 dark:text-gray-100 block mb-1">
//                     {method.paymentMethodType}
//                   </span>
//                   {method.paymentMethodBrands &&
//                     method.paymentMethodBrands.length > 0 && (
//                       <span className="text-sm text-gray-600 dark:text-gray-400">
//                         {method.paymentMethodBrands
//                           .map((b) => b.paymentMethodBrandType)
//                           .join(", ")}
//                       </span>
//                     )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default EbayProductFullDetailsCard;
