/// we are not using this one
"use client";
import React, { useEffect, useState } from "react";
import ImagePreview from "../common/ui/ImagePreview";
import requests from "@/app/utils/http";
import { format } from "date-fns";
import {
  FaMoneyBillWave,
  FaBox,
  FaTruck,
  FaInfoCircle,
  FaTag,
  FaStore,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaFileAlt,
} from "react-icons/fa";
import { AiOutlineSafety, AiOutlineFileText } from "react-icons/ai";
import { RiCustomerService2Line } from "react-icons/ri";
import { Item } from "@/app/ebay/types";
import AffliateDisclosure from "../affilate-disclosure/AffliateDisclosure";
import Description from "./Description";
import { useRouter } from "next/navigation";
import { get } from "http";
import SpinnerFallback from "../common/ui/fallbacks/SpinnerFallback";
import { getCookie } from "cookies-next/client";
import ShowSpinnerFallBackWithDelay from "../common/ui/fallbacks/ShowSpinnerFallBackWhenComponentNotMounted";

const EbayItem = ({
  title,
  site,
}: {
  title: string | string[];
  site: string | string[];
}) => {
  const [itemData, setItemData] = useState<Item>();
  const [loading, setIsLoading] = useState(false);
  const theme  = getCookie('theme');
  const router = useRouter();
  const getItem = async () => {
    setIsLoading(true);
    const res: any = await requests.get<Item>(
      `/api/getItem?itm=${title}&site=${site}`
    );
    const data = await res.requestsData;
    if (!res.success) {
      setIsLoading(false);
      router.replace("/not-found");
      return;
    }
    setItemData(data);
    setIsLoading(false);
  };
  const numColumns = Math.min(itemData?.additionalImages?.length || 0, 4);

  useEffect(() => {
    getItem();
  }, []);
  if (!itemData) {
    // router.replace("/not-found");
    return <ShowSpinnerFallBackWithDelay />;
  }
  return (
    <div className="max-w-7xl mx-auto py-12 px-6 bg-gray-50 dark:bg-light-dark my-5">
      {/* Item Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 rounded-lg shadow-md ">
        {/* Image Section */}
        <div className="flex flex-col">
          {/* Main Image */}
          {/* <div className="relative flex justify-center">
      {itemData?.image && (
        <ImagePreview
          src={itemData?.image.imageUrl}
          alt={itemData?.title}
          width={400} // Adjust as needed
        />
      )}
    </div>
    <div>
      {itemData?.additionalImages?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          {itemData?.additionalImages.map((image, idx) => (
            <div key={idx} className="bg-gray-100">
              <ImagePreview
                src={image.imageUrl}
                alt={image.imageUrl}
                width={50} // Adjust as needed
                height={50} // Adjust as needed
              />
            </div>
          ))}
        </div>
      )}
    </div>
     */}
          {itemData?.image && (
            <div className="relative flex justify-center mb-4">
              <ImagePreview
                src={itemData?.image.imageUrl}
                alt={itemData?.title}
                width={800}
                height={800}
              />
            </div>
          )}
          {/* Additional Images */}
          {itemData?.additionalImages?.length > 0 && (
            <div
              className={`grid gap-4 justify-center ${
                numColumns === 1
                  ? "grid-cols-1"
                  : numColumns === 2
                  ? "grid-cols-2"
                  : numColumns === 3
                  ? "grid-cols-3"
                  : "grid-cols-4"
              }`}
            >
              {itemData?.additionalImages.map((image, idx) => (
                <div
                  key={idx}
                  className="relative flex-shrink-0 max-w-[100px] flex items-center justify-center"
                >
                  <ImagePreview
                    width={800}
                    height={800}
                    src={image.imageUrl}
                    alt={`Additional Image ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="flex flex-col md:items-start space-y-4">
          <h1 className="text-sm md:text-4xl font-bold text-gray-800 dark:text-light">
            {itemData?.title}
          </h1>
          <p className="text-sm md:text-lg text-gray-600 dark:text-light">
            {itemData?.shortDescription}
          </p>
          {itemData?.price?.value && (
            <div className="flex flex-col justify-start md:flex-row">
              <p className="flex w-full text-3xl font-semibold text-green-600">
                <FaMoneyBillWave className="inline mr-2" />
                {itemData.price.value} {itemData.price.currency}
              </p>
              {itemData?.shippingOptions &&
                itemData.shippingOptions.map(
                  (item, index) =>
                    index <= 0 &&
                    item.shippingCost?.value?.startsWith("0.00") && (
                      <span
                        key={index}
                        className="flex items-center mt-5 md:mt-0 md:ml-5 justify-start w-full"
                      >
                        &#x00A9;
                        <p className="text-lg md:text-3xl font-semibold text-white text-[20px] px-2 rounded-full bg-gray-800 dark:text-light dark:bg-gray-800">
                          FREESHIPPING
                        </p>
                      </span>
                    )
                )}
            </div>
          )}

          <span className="w-full flex items-center dark:text-light">
            <FaMapMarkerAlt className="mr-2" />
            {itemData.itemLocation?.city}, {itemData.itemLocation?.country}
          </span>
          {/* Buy Button */}
          {itemData?.itemAffiliateWebUrl && (
            <>
              <a
                href={itemData?.itemAffiliateWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-center font-bold hover:bg-blue-700 transition dark:text-light"
              >
                Buy Now on eBay
              </a>
              <AffliateDisclosure />
            </>
          )}
          <p className="text-md text-gray-600 dark:text-light">
            <FaInfoCircle className="inline mr-2" />
            Condition:{" "}
            <span className="font-semibold">{itemData?.condition}</span>
          </p>
          {itemData?.conditionDescription && (
            <>
              <p className="text-md text-gray-600 dark:text-light">
                <FaFileAlt className="inline mr-2" />
                Condition Description:
              </p>
              <div className="f-ull overflow-y-auto border border-gray-300 p-3 rounded-md dark:text-light">
                <span className="font-semibold">
                  {itemData?.conditionDescription}
                </span>
              </div>
            </>
          )}

          {itemData?.brand && (
            <p className="text-md text-gray-600 dark:text-light">
              <FaTag className="inline mr-2" />
              Brand: <span className="font-semibold">{itemData?.brand}</span>
            </p>
          )}
          <p className="text-md text-gray-600 dark:text-light">
            <FaBox className="inline mr-2" />
            Category: {itemData?.categoryPath?.replaceAll("|", " > ")}
          </p>
          {itemData?.gtin && (
            <p className="text-md text-gray-600 dark:text-light">
              <AiOutlineFileText className="inline mr-2" />
              GTIN: {itemData?.gtin}
            </p>
          )}
          {itemData?.mpn && (
            <p className="text-md text-gray-600 dark:text-light">
              <AiOutlineFileText className="inline mr-2" />
              MPN: {itemData?.mpn}
            </p>
          )}
          {itemData?.itemCreationDate && (
            <p className="text-md text-gray-600 dark:text-light">
              <FaCalendarAlt className="inline mr-2" />
              Listed on:{" "}
              {format(new Date(itemData?.itemCreationDate), "dd MMM yyyy")}
            </p>
          )}
          {/* Additional Aspects */}
          {itemData?.localizedAspects?.length > 0 && (
            <div className="mt-12 p-8 rounded-lg shadow-md">
              <h2 className="text-sm md:text-2xl font-semibold text-gray-800 mb-4 dark:text-light">
                Additional Aspects
              </h2>
              <ul className="list-disc pl-5 text-sm md:text-lg">
                {itemData?.localizedAspects.map((aspect, idx) => (
                  <li key={idx} className="text-gray-600 dark:text-light">
                    {aspect.name}: {aspect.value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Seller Information */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 dark:bg-light-dark dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-light">
            <RiCustomerService2Line className="inline mr-2" />
            Seller Information
          </h2>
          {itemData?.seller && (
            <>
              <p className="text-gray-600 dark:text-light">
                <FaStore className="inline mr-2" />
                Username:{" "}
                <span className="font-semibold">
                  {itemData?.seller.username}
                </span>
              </p>
              <p className="text-gray-600 dark:text-light">
                Feedback Score: {itemData?.seller.feedbackScore}
              </p>
              <p className="text-gray-600 dark:text-light">
                Feedback Percentage: {itemData?.seller.feedbackPercentage}%
              </p>
            </>
          )}
        </div>

        {/* Return Policy */}
        {itemData?.returnTerms && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 dark:bg-light-dark dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-light">
              <AiOutlineSafety className="inline mr-2" />
              Return Policy
            </h2>
            <p className="text-gray-600 dark:text-light">
              Returns Accepted:{" "}
              {itemData?.returnTerms.returnsAccepted ? "Yes" : "No"}
            </p>
            <p className="text-gray-600 dark:text-light">
              Return Shipping Cost:{" "}
              {itemData?.returnTerms.returnShippingCostPayer || "No"}
            </p>
            <p className="text-gray-600 dark:text-light">
              Return Period: {itemData?.returnTerms.returnPeriod?.value || "No"}{" "}
              {itemData?.returnTerms.returnPeriod?.unit}
            </p>
          </div>
        )}

        {/* Shipping Information */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 md:col-span-2 lg:col-span-2 dark:bg-light-dark dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-light">
            <FaTruck className="inline mr-2" />
            Shipping Information
          </h2>
          {itemData.shippingOptions?.length > 0 &&
            itemData.shippingOptions?.map((option, index) => (
              <ul
                className="border-2 p-2 list-disc pl-5 dark:text-light dark:border-gray-700"
                key={index}
              >
                <li key={option.shippingServiceCode} className="mt-2 mb-2">
                  <h3>{option.type}</h3>
                </li>
                <li key={"shippingCost"} className="mt-2 mb-2">
                  <span className="mt-2 mb-2 flex items-center">
                    <p className="mr-2">Shipping cost: </p>{" "}
                    {option.shippingCost.value} {option.shippingCost?.currency}
                  </span>
                </li>
                <li
                  className="mt-2 mb-2"
                  key={`${option.shippingServiceCode}-delivery`}
                >
                  <p>
                    Estimated delivery:{" "}
                    {new Date(
                      option?.minEstimatedDeliveryDate
                    )?.toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      option.maxEstimatedDeliveryDate
                    )?.toLocaleDateString()}
                  </p>
                </li>
                <li
                  className="mt-2 mb-2"
                  key={`${option.shippingServiceCode}-additionalCost`}
                >
                  <p>
                    Additional cost per unit:
                    {option?.additionalShippingCostPerUnit?.value}{" "}
                    {option?.additionalShippingCostPerUnit?.currency}
                  </p>
                </li>
                <li
                  className="mt-2 mb-2"
                  key={`${option.shippingServiceCode}-costType`}
                >
                  <p>Shipping cost type: {option?.shippingCostType}</p>
                </li>
              </ul>
            ))}

          {/* {itemData?.itemLocation && (
      <div className="text-gray-600 border-2 p-2">
        {itemData?.itemLocation && (
          <span className="text-gray-600 mb-2 flex items-center">
            <p className="font-bold">Ships from:</p> {itemData?.itemLocation.city},{" "}
            {itemData?.itemLocation.country}
          </span>
        )}
        {itemData.shippingOptions?.map((option) => (
          <div
            className="flex flex-col gap-2"
            key={option.shippingServiceCode}
          >
            <h3>{option.type}</h3>
            <span className="text-gray-600 mb-2 flex items-center">
              <p>Shipping cost:</p> {option.shippingCost.value}{" "}
              {option.shippingCost?.currency}
            </span>
            <p>
              Estimated delivery:{" "}
              {new Date(
                option?.minEstimatedDeliveryDate
              )?.toLocaleDateString()}{" "}
              -{" "}
              {new Date(
                option.maxEstimatedDeliveryDate
              )?.toLocaleDateString()}
            </p>
            <p>
              Additional cost per unit:
              {option?.additionalShippingCostPerUnit?.value}{" "}
              {option?.additionalShippingCostPerUnit?.currency}
            </p>
            <p>Shipping cost type: {option?.shippingCostType}</p>
          </div>
        ))}
      </div>
    )} */}

          <div className="mt-2">
            {itemData?.shipToLocations && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 ">
                {itemData?.shipToLocations.regionIncluded?.length > 0 && (
                  <div className="mt-2 text-gray-600 border-2 p-2 dark:text-light dark:bg-light-dark dark:border-gray-700">
                    <strong>Shipping Regions:</strong>
                    <ul className="list-disc pl-5 mt-1 max-h-40 overflow-auto">
                      {itemData?.shipToLocations.regionIncluded.map(
                        (region, idx) => (
                          <li key={idx}>{region.regionName}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
                {itemData?.shipToLocations.regionExcluded?.length > 0 && (
                  <div className="mt-2 text-gray-600 border-2 p-2 dark:text-light dark:bg-light-dark dark:border-gray-700">
                    <strong>Excluded Regions:</strong>
                    <ul className="list-disc pl-5 mt-1 max-h-40 overflow-auto">
                      {itemData?.shipToLocations.regionExcluded.map(
                        (region, idx) => (
                          <li key={idx}>{region.regionName}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-12 bg-white p-8 rounded-lg shadow-md border border-gray-200 dark:bg-light-dark dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 dark:text-light">
          <AiOutlineFileText className="inline mr-2" />
          Description
        </h2>
        {itemData?.description && (
          <div className="prose max-w-full">
            <Description html={itemData?.description} />
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="mt-12 bg-white p-8 rounded-lg shadow-md dark:bg-light-dark dark:border-gray-700 dark:border">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 dark:text-light">
          Payment Methods
        </h2>
        {itemData?.paymentMethods?.length > 0 && (
          <ul className="list-disc pl-5">
            {itemData?.paymentMethods.map((method, idx) => (
              <li key={idx} className="text-gray-600 dark:text-light">
                {method.paymentMethodType}:{" "}
                {method.paymentMethodBrands
                  ?.map((brand) => brand.paymentMethodBrandType)
                  .join(", ")}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Taxes */}
      {itemData?.taxes?.length > 0 && (
        <div className="mt-12 bg-white p-8 rounded-lg shadow-md dark:bg-light-dark dark:border-gray-700 dark:border">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 dark:text-light">
            Taxes
          </h2>
          {itemData?.taxes.map((tax, idx) => (
            <div key={idx} className="mb-4 text-gray-600 dark:text-light">
              <p>
                Tax Jurisdiction: {tax?.taxJurisdiction?.region?.regionName}
              </p>
              <p>Tax Type: {tax?.taxType}</p>
              <p>
                Shipping and Handling Taxed:{" "}
                {tax?.shippingAndHandlingTaxed ? "Yes" : "No"}
              </p>
              <p>Included in Price: {tax?.includedInPrice ? "Yes" : "No"}</p>
              <p>
                eBay Collect and Remit Tax:{" "}
                {tax?.ebayCollectAndRemitTax ? "Yes" : "No"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EbayItem;
