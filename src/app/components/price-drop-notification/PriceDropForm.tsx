"use client";
import { useAuthStore } from "@/app/store/auth/store";
import React, { useEffect, useState } from "react";

interface MarketplaceData {
  itemIdentifier: string;
  desiredPrice: number;
  isLinkValid: boolean;
  itemPreview: ItemPreview | null;
}

interface FormData {
  marketplace: Marketplace;
  email: string;
  amazon: MarketplaceData;
  ebay: MarketplaceData;
}

interface ItemPreview {
  title: string;
  image: string;
  price: string;
  url: string;
}

type Marketplace = "amazon" | "ebay" | "";

interface FormErrors {
  marketplace?: string;
  itemIdentifier?: string;
  email?: string;
  desiredPrice?: string;
}

const PriceDropForm: React.FC = () => {
  const { user, hydrateUser, isLoading } = useAuthStore();
  const [formData, setFormData] = useState<FormData>({
    marketplace: "",
    email: user?.email || "",
    amazon: {
      itemIdentifier: "",
      desiredPrice: 0,
      isLinkValid: false,
      itemPreview: null,
    },
    ebay: {
      itemIdentifier: "",
      desiredPrice: 0,
      isLinkValid: false,
      itemPreview: null,
    },
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const getCurrentMarketplaceData = () => {
    return formData.marketplace ? formData[formData.marketplace] : null;
  };

  const validateItem = async () => {
    await hydrateUser();
    const currentMarketplace = formData.marketplace;
    if (!currentMarketplace || !formData[currentMarketplace].itemIdentifier)
      return;

    setIsValidating(true);
    try {
      const response = await fetch(`/api/validate-item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          marketplace: currentMarketplace,
          identifier: formData[currentMarketplace].itemIdentifier,
        }),
      });

      if (!response.ok) {
        setFormData((prev) => ({
          ...prev,
          [currentMarketplace]: {
            ...prev[currentMarketplace],
            isLinkValid: true,
          },
        }));
        return;
      }

      const data: ItemPreview = await response.json();
      setFormData((prev) => ({
        ...prev,
        [currentMarketplace]: {
          ...prev[currentMarketplace],
          itemPreview: data,
          isLinkValid: true,
        },
      }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        itemIdentifier:
          "Unable to find item. Please check the URL or identifier.",
      }));
      setFormData((prev) => ({
        ...prev,
        [currentMarketplace]: {
          ...prev[currentMarketplace],
          isLinkValid: false,
        },
      }));
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentMarketplace = formData.marketplace;
    if (!currentMarketplace || !formData[currentMarketplace].isLinkValid)
      return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Alert created successfully");
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarketplaceChange = (marketplace: Marketplace) => {
    setFormData((prev) => ({
      ...prev,
      marketplace,
    }));
  };

  const handleItemIdentifierChange = (value: string) => {
    const currentMarketplace = formData.marketplace;
    if (!currentMarketplace) return;

    setFormData((prev) => ({
      ...prev,
      [currentMarketplace]: {
        ...prev[currentMarketplace],
        itemIdentifier: value,
      },
    }));
  };

  const handleDesiredPriceChange = (value: number) => {
    const currentMarketplace = formData.marketplace;
    if (!currentMarketplace) return;

    setFormData((prev) => ({
      ...prev,
      [currentMarketplace]: {
        ...prev[currentMarketplace],
        desiredPrice: value,
      },
    }));
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, email: user?.email || "" }));
  }, [isLoading]);

  const currentMarketplaceData = getCurrentMarketplaceData();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Marketplace Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Marketplace
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleMarketplaceChange("amazon")}
            className={`p-4 border rounded-lg flex items-center justify-center transition-all ${
              formData.marketplace === "amazon"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
            }`}
          >
            <span className="font-medium text-gray-900 dark:text-light">
              Amazon
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleMarketplaceChange("ebay")}
            className={`p-4 border rounded-lg flex items-center justify-center transition-all ${
              formData.marketplace === "ebay"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
            }`}
          >
            <span className="font-medium text-gray-900 dark:text-light">
              eBay
            </span>
          </button>
        </div>
      </div>

      {/* Item Identifier Input with Validate Button */}
      <div>
        <label
          htmlFor="itemIdentifier"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {formData.marketplace === "amazon"
            ? "Amazon ASIN or Product URL"
            : formData.marketplace === "ebay" && "eBay Item Number or URL"}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="itemIdentifier"
            value={currentMarketplaceData?.itemIdentifier || ""}
            disabled={formData.marketplace === ""}
            onChange={(e) => handleItemIdentifierChange(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder={
              formData.marketplace === "amazon"
                ? "Enter ASIN or paste Amazon URL"
                : formData.marketplace === "ebay"
                ? "Enter item number or paste eBay URL"
                : "Choose Marketplace above"
            }
          />
          <button
            type="button"
            onClick={validateItem}
            disabled={
              !formData.marketplace ||
              !currentMarketplaceData?.itemIdentifier ||
              isValidating
            }
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isValidating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Validate"
            )}
          </button>
        </div>
        {errors.itemIdentifier && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.itemIdentifier}
          </p>
        )}
      </div>

      {/* Item Preview */}
      {currentMarketplaceData?.itemPreview &&
        currentMarketplaceData?.isLinkValid && (
          <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/30">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <img
                  src={currentMarketplaceData.itemPreview.image}
                  alt={currentMarketplaceData.itemPreview.title}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-light truncate">
                  {currentMarketplaceData.itemPreview.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Current Price: {currentMarketplaceData.itemPreview.price}
                </p>
                <div className="flex items-center mt-1">
                  <svg
                    className="w-5 h-5 text-green-500"
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
                  <span className="ml-1 text-sm text-green-600 dark:text-green-400">
                    Item found successfully
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Email Input - Only show if link is valid */}
      {currentMarketplaceData?.isLinkValid && (
        <div className="flex flex-col gap-5">
          <span>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your email for notifications"
            />
          </span>
          <div className="flex flex-col gap-2">
            <span>
              <label
                htmlFor="desiredPrice"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Desired Price
              </label>
              <input
                type="number"
                id="desiredPrice"
                value={currentMarketplaceData?.desiredPrice || 0}
                onChange={(e) =>
                  handleDesiredPriceChange(Number(e.target.value))
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your desired price"
              />
            </span>
            <span className="flex gap-3 text-sm text-black dark:text-light">
              <button
                type="button"
                onClick={() => handleDesiredPriceChange(10)}
                className="hover:bg-blue-300 dark:hover:bg-gray-500 rounded-full p-2 border border-gray-500 dark:border-2 dark:border-gray-700"
              >
                Any Price Drop!
              </button>
              <button
                type="button"
                className="hover:bg-blue-300 dark:hover:bg-gray-500 rounded-full p-2 border border-gray-500 dark:border-2 dark:border-gray-700"
              >
                -3%
              </button>
              <button
                type="button"
                className="hover:bg-blue-300 dark:hover:bg-gray-500 rounded-full p-2 border border-gray-500 dark:border-2 dark:border-gray-700"
              >
                -5%
              </button>
              <button
                type="button"
                className="hover:bg-blue-300 dark:hover:bg-gray-500 rounded-full p-2 border border-gray-500 dark:border-2 dark:border-gray-700"
              >
                -7%
              </button>
              <button
                type="button"
                className="hover:bg-blue-300 dark:hover:bg-gray-500 rounded-full p-2 border border-gray-500 dark:border-2 dark:border-gray-700"
              >
                -10%
              </button>
            </span>
          </div>
        </div>
      )}

      {/* Submit Button - Only enabled if link is valid and email is provided */}
      <button
        type="submit"
        disabled={
          !currentMarketplaceData?.isLinkValid ||
          !formData.email ||
          isSubmitting
        }
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Setting up alert..." : "Start Tracking Price"}
      </button>
    </form>
  );
};

export default PriceDropForm;

// "use client";
// import { useAuthStore } from "@/app/store/authStore";
// import React, { useEffect, useState } from "react";

// interface FormData {
//   marketplace: Marketplace;
//   itemIdentifier: string;
//   email: string;
//   desiredPrice: number;
// }

// interface ItemPreview {
//   title: string;
//   image: string;
//   price: string;
//   url: string;
// }

// type Marketplace = "amazon" | "ebay" | "";

// interface FormErrors {
//   marketplace?: string;
//   itemIdentifier?: string;
//   email?: string;
//   desiredPrice?: string;
// }

// const PriceDropForm: React.FC = () => {
//   const { email, hydrateUser, isLoading } = useAuthStore();
//   const [formData, setFormData] = useState<FormData>({
//     marketplace: "",
//     itemIdentifier: "",
//     email: email || "",
//     desiredPrice: 0,
//   });

//   const [errors, setErrors] = useState<FormErrors>({});
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [isValidating, setIsValidating] = useState<boolean>(false);
//   const [isLinkValid, setIsLinkValid] = useState<boolean>(false);
//   const [itemPreview, setItemPreview] = useState<ItemPreview | null>(null);

//   const validateItem = async () => {
//     await hydrateUser();
//     if (
//       !formData.marketplace ||
//       !formData.itemIdentifier ||
//       itemPreview !== null
//     )
//       return;
//     setIsValidating(true);
//     setIsLinkValid(false);
//     setItemPreview(null);
//     try {
//       // Mock API call - replace with your actual API endpoint
//       const response = await fetch(`/api/validate-item`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           marketplace: formData.marketplace,
//           identifier: formData.itemIdentifier,
//         }),
//       });

//       if (!response.ok) {
//         setIsLinkValid(true);
//         return;
//       }

//       const data: any = await response.json();
//       setItemPreview(data);
//       setIsLinkValid(true);
//     } catch (error) {
//       setErrors((prev) => ({
//         ...prev,
//         itemIdentifier:
//           "Unable to find item. Please check the URL or identifier.",
//       }));
//       setIsLinkValid(false);
//     } finally {
//       setIsValidating(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (!isLinkValid) return;

//     setIsSubmitting(true);
//     try {
//       // Add your API call here to save the price drop alert
//       await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock API call
//       console.log("Alert created successfully");
//     } catch (error) {
//       console.error("Submission error:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
//   useEffect(() => {
//     setFormData((prev) => ({ ...prev, email: email }));
//   }, [isLoading]);
//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {/* Marketplace Selection */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//           Select Marketplace
//         </label>
//         <div className="grid grid-cols-2 gap-4">
//           <button
//             type="button"
//             onClick={() =>
//               setFormData((prev) => ({ ...prev, marketplace: "amazon" }))
//             }
//             className={`p-4 border rounded-lg flex items-center justify-center transition-all ${
//               formData.marketplace === "amazon"
//                 ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
//                 : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
//             }`}
//           >
//             <span className="font-medium text-gray-900 dark:text-light">
//               Amazon
//             </span>
//           </button>

//           <button
//             type="button"
//             onClick={() => {
//               setFormData((prev) => ({ ...prev, marketplace: "ebay" }));
//               setIsLinkValid(false);
//             }}
//             className={`p-4 border rounded-lg flex items-center justify-center transition-all ${
//               formData.marketplace === "ebay"
//                 ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
//                 : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
//             }`}
//           >
//             <span className="font-medium text-gray-900 dark:text-light">
//               eBay
//             </span>
//           </button>
//         </div>
//       </div>

//       {/* Item Identifier Input with Validate Button */}
//       <div>
//         <label
//           htmlFor="itemIdentifier"
//           className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
//         >
//           {formData.marketplace === "amazon"
//             ? "Amazon ASIN or Product URL"
//             : formData.marketplace === "ebay" && "eBay Item Number or URL"}
//         </label>
//         <div className="flex gap-2">
//           <input
//             type="text"
//             id="itemIdentifier"
//             value={formData.itemIdentifier}
//             disabled={formData.marketplace === ""}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 itemIdentifier: e.target.value,
//               }))
//             }
//             className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//             placeholder={
//               formData.marketplace === "amazon"
//                 ? "Enter ASIN or paste Amazon URL"
//                 : formData.marketplace === "ebay"
//                 ? "Enter item number or paste eBay URL"
//                 : "Choose Marketplace above"
//             }
//           />
//           <button
//             type="button"
//             onClick={validateItem}
//             disabled={
//               !formData.marketplace || !formData.itemIdentifier || isValidating
//             }
//             className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
//           >
//             {isValidating ? (
//               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//             ) : (
//               "Validate"
//             )}
//           </button>
//         </div>
//         {errors.itemIdentifier && (
//           <p className="mt-1 text-sm text-red-600 dark:text-red-400">
//             {errors.itemIdentifier}
//           </p>
//         )}
//       </div>

//       {/* Item Preview */}
//       {itemPreview && isLinkValid && (
//         <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/30">
//           <div className="flex items-center space-x-4">
//             <div className="relative w-20 h-20 flex-shrink-0">
//               <img
//                 src={itemPreview.image}
//                 alt={itemPreview.title}
//                 className="w-full h-full object-cover rounded-md"
//               />
//             </div>
//             <div className="flex-1 min-w-0">
//               <h3 className="text-sm font-medium text-gray-900 dark:text-light truncate">
//                 {itemPreview.title}
//               </h3>
//               <p className="text-sm text-gray-600 dark:text-gray-300">
//                 Current Price: {itemPreview.price}
//               </p>
//               <div className="flex items-center mt-1">
//                 <svg
//                   className="w-5 h-5 text-green-500"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M5 13l4 4L19 7"
//                   />
//                 </svg>
//                 <span className="ml-1 text-sm text-green-600 dark:text-green-400">
//                   Item found successfully
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Email Input - Only show if link is valid */}
//       {isLinkValid && (
//         <div className="flex flex-col gap-5">
//           <span>
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
//             >
//               Email Address
//             </label>
//             <input
//               type="email"
//               id="email"
//               value={formData.email}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, email: e.target.value }))
//               }
//               className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//               placeholder="Enter your email for notifications"
//             />
//           </span>
//           <div className="flex flex-col gap-2">
//             <span>
//               <label
//                 htmlFor="desiredPrice"
//                 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
//               >
//                 Desired Price
//               </label>
//               <input
//                 type="number"
//                 id="desiredPrice"
//                 value={formData.desiredPrice}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     desiredPrice: Number(e.target.value),
//                   }))
//                 }
//                 className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-light focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                 placeholder="Enter your email for notifications"
//               />
//             </span>
//             <span className="flex gap-3 text-sm text-black dark:text-light">
//               <button
//                 type="button"
//                 onClick={() =>
//                   setFormData((prev) => ({ ...prev, desiredPrice: 10 }))
//                 }
//                 className="hover:bg-blue-300 dark:hover:bg-gray-500 rounded-full p-2 border border-gray-500 dark:border-2 dark:border-gray-700"
//               >
//                 Any Price Drop!
//               </button>
//               <button
//                 type="button"
//                 className="hover:bg-blue-300 dark:hover:bg-gray-500 rounded-full p-2 border border-gray-500 dark:border-2 dark:border-gray-700"
//               >
//                 -3%
//               </button>
//               <button
//                 type="button"
//                 className="hover:bg-blue-300 dark:hover:bg-gray-500 rounded-full p-2 border border-gray-500 dark:border-2 dark:border-gray-700"
//               >
//                 -5%
//               </button>
//               <button
//                 type="button"
//                 className="hover:bg-blue-300 dark:hover:bg-gray-500 rounded-full p-2 border border-gray-500 dark:border-2 dark:border-gray-700"
//               >
//                 -7%
//               </button>
//               <button
//                 type="button"
//                 className="hover:bg-blue-300 dark:hover:bg-gray-500 rounded-full p-2 border border-gray-500 dark:border-2 dark:border-gray-700"
//               >
//                 -10%
//               </button>
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Submit Button - Only enabled if link is valid and email is provided */}
//       <button
//         type="submit"
//         disabled={!isLinkValid || !formData.email || isSubmitting}
//         className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         {isSubmitting ? "Setting up alert..." : "Start Tracking Price"}
//       </button>
//     </form>
//   );
// };

// export default PriceDropForm;
