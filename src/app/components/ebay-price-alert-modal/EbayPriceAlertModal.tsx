"use client";

import { useSearchStore } from "@/app/store/marketplace-search/store";
import { ebaySiteCurrencySymbolMapping } from "@/app/utils/ebaySiteMapping";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaBell,
  FaDollarSign,
  FaExternalLinkAlt,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import ImagePreview from "../common/ui/ImagePreview";
import { FaRocket } from "react-icons/fa6";
import { showModal } from "../common/modal/modal-provider";

interface EbayPriceAlertModalProps {
  itemId?: string | null;
  imgUrl?: string | null;
  itemTitle?: string | null;
  currentPrice?: number | null;
}

interface FormErrors {
  emails?: string[];
  targetPrice?: string;
  submit?: string;
}

interface PriceAlertPayload {
  itemId: string;
  emails: string[];
  targetPrice: number;
}

const EbayPriceAlertModal: React.FC<EbayPriceAlertModalProps> = ({
  itemId = null,
  imgUrl = null,
  itemTitle = null,
  currentPrice = null,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [emails, setEmails] = useState<string[]>([""]);
  const [targetPrice, setTargetPrice] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showComingSoon, setShowComingSoon] = useState<boolean>(false);

  const { defaultEbaySite } = useSearchStore();

  // useEffect(() => {
  //   const handleEscape = (e: KeyboardEvent): void => {
  //     if (e.key === "Escape") setIsOpen(false);
  //   };

  //   if (isOpen) {
  //     document.addEventListener("keydown", handleEscape);
  //     // Prevent scrolling on the main body
  //     const scrollbarWidth =
  //       window.innerWidth - document.documentElement.clientWidth;
  //     document.body.style.overflow = "hidden";
  //     document.body.style.paddingRight = `${scrollbarWidth}px`;
  //   } else {
  //     document.removeEventListener("keydown", handleEscape);
  //     document.body.style.overflow = "";
  //     document.body.style.paddingRight = "";
  //   }

  //   return () => {
  //     document.removeEventListener("keydown", handleEscape);
  //     document.body.style.overflow = "";
  //     document.body.style.paddingRight = "";
  //   };
  // }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = { emails: [] };
    let hasValidEmail = false;

    // Validate emails - check for empty emails and invalid formats
    emails.forEach((email, index) => {
      if (!email.trim()) {
        newErrors.emails![index] = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
        newErrors.emails![index] = "Please enter a valid email";
      } else {
        hasValidEmail = true;
      }
    });

    // Check if we have at least one valid email
    if (!hasValidEmail) {
      if (!newErrors.emails![0]) {
        newErrors.emails![0] = "At least one valid email is required";
      }
    }

    // Validate target price
    if (!targetPrice) {
      newErrors.targetPrice = "Target price is required";
    } else if (isNaN(Number(targetPrice)) || parseFloat(targetPrice) <= 0) {
      newErrors.targetPrice = "Please enter a valid price";
    }

    setErrors(newErrors);

    // Form is valid if we have no email errors and no target price error
    const hasEmailErrors = newErrors.emails?.some((error) => error);
    return !hasEmailErrors && !newErrors.targetPrice;
  };

  // Check if form can be submitted (no empty emails)
  const canSubmitForm = (): boolean => {
    const hasEmptyEmails = emails.some((email) => !email.trim());
    const hasValidTargetPrice =
      targetPrice && !isNaN(Number(targetPrice)) && parseFloat(targetPrice) > 0;
    return !hasEmptyEmails && !!hasValidTargetPrice;
  };

  // Check if "Add Email" button should be enabled
  const canAddEmail = (): boolean => {
    const firstEmail = emails[0].trim();
    return firstEmail !== "" && /\S+@\S+\.\S+/.test(firstEmail);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (!validateForm() || !itemId || !canSubmitForm()) return;

    setIsSubmitting(true);
    try {
      const validEmails = emails.filter(
        (email) => email.trim() && /\S+@\S+\.\S+/.test(email.trim()),
      );

      const payload: PriceAlertPayload = {
        itemId,
        emails: validEmails,
        targetPrice: parseFloat(targetPrice),
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEmails([""]);
      setTargetPrice("");
      setErrors({});
      setIsOpen(false);
    } catch (error) {
      setErrors({ submit: "Failed to create price alert. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (index: number, value: string): void => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);

    // Clear the specific email error when user starts typing
    if (errors.emails?.[index]) {
      const newEmailErrors = [...(errors.emails || [])];
      newEmailErrors[index] = "";
      setErrors({ ...errors, emails: newEmailErrors });
    }
  };

  const addEmailField = (): void => {
    if (canAddEmail()) {
      setEmails([...emails, ""]);
      // Clear any existing email errors when adding a new field
      if (errors.emails) {
        setErrors({ ...errors, emails: [] });
      }
    }
  };

  const removeEmailField = (index: number): void => {
    if (emails.length > 1) {
      const newEmails = emails.filter((_, i) => i !== index);
      setEmails(newEmails);

      // Remove the corresponding error if it exists
      if (errors.emails) {
        const newEmailErrors = errors.emails.filter((_, i) => i !== index);
        setErrors({ ...errors, emails: newEmailErrors });
      }
    }
  };

  const handleTargetPriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setTargetPrice(e.target.value);
  };

  const handlePercentageClick = (percentage: number) => {
    if (currentPrice) {
      const calculatedPrice = currentPrice * (1 - percentage / 100);
      setTargetPrice(calculatedPrice.toFixed(2));
    }
  };

  const handleAnyPriceDropClick = () => {
    if (currentPrice) {
      setTargetPrice((currentPrice - 0.01).toFixed(2));
    } else {
      setTargetPrice("0.01");
    }
  };

  const openModal = (): void => {
    showModal({
      title: "eBay Price Alert - Coming Soon",
      content: (
        <div className="flex items-center justify-center p-4">
          <div
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >

            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex justify-center gap-3 w-full aspect-auto relative">
                {imgUrl && itemId && itemTitle && (
                  <>
                    <Image
                      src={imgUrl || "/placeholder.svg"}
                      alt={itemId ? itemId : "Image Preview for this item"}
                      width={100}
                      height={100}
                      loading="eager"
                    />
                    <ImagePreview
                      src={imgUrl}
                      alt={itemId}
                      itemTitle={itemTitle}
                      itemId={itemId}
                      loading="eager"
                      mode="icon-only"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-center flex-col items-center w-full">
              <h1 className="text-lg py-2 bg-blue-700 text-white w-full dark:text-main-white text-center dark:bg-light-gray">
                Current Price: {ebaySiteCurrencySymbolMapping[defaultEbaySite]}{" "}
                {currentPrice}
              </h1>
              <a
                href={`/price-history?itemId=${itemId}`}
                target="_blank"
                className="underline flex items-center justify-center gap-2 mt-3"
              >
                View Price History <FaExternalLinkAlt className="w-4 h-4" />
              </a>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Addresses
                  </label>
                  <button
                    type="button"
                    onClick={addEmailField}
                    disabled={!canAddEmail()}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                      canAddEmail()
                        ? "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    <FaPlus className="w-3 h-3" />
                    Add Another Email
                  </button>
                </div>

                <div className="space-y-2">
                  {emails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                          handleEmailChange(index, e.target.value)
                        }
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          errors.emails?.[index]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder={`email${index + 1}@example.com`}
                      />
                      {emails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEmailField(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {errors.emails?.some((error) => error) && (
                  <div className="mt-1 space-y-1">
                    {errors.emails.map((error, index) =>
                      error ? (
                        <p
                          key={index}
                          className="text-sm text-red-600 dark:text-red-400"
                        >
                          Email {index + 1}: {error}
                        </p>
                      ) : null,
                    )}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="targetPrice"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Target Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">
                      {ebaySiteCurrencySymbolMapping[defaultEbaySite]}
                    </span>
                  </div>
                  <input
                    type="number"
                    id="targetPrice"
                    value={targetPrice}
                    onChange={handleTargetPriceChange}
                    step="0.01"
                    min="0"
                    max={currentPrice ? currentPrice.toFixed(2) : "0.00"}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.targetPrice ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.targetPrice && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.targetPrice}
                  </p>
                )}

                <div className="flex items-center justify-center my-4">
                  <span className="flex-grow border-t border-gray-300 dark:border-gray-600" />
                  <span className="mx-3 text-sm text-gray-500 dark:text-gray-400">
                    or
                  </span>
                  <span className="flex-grow border-t border-gray-300 dark:border-gray-600" />
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePercentageClick(5)}
                    disabled={!currentPrice}
                    className="flex items-center gap-1 px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    5% off
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePercentageClick(10)}
                    disabled={!currentPrice}
                    className="flex items-center gap-1 px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    10% off
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePercentageClick(15)}
                    disabled={!currentPrice}
                    className="flex items-center gap-1 px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    15% off
                  </button>
                  <button
                    type="button"
                    onClick={handleAnyPriceDropClick}
                    disabled={!currentPrice}
                    className="px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Any Price Drop
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  You&apos;ll receive an email when the price drops to or below
                  this amount
                </p>
              </div>

              {errors.submit && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.submit}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !canSubmitForm()}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white dark:bg-light-dark bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Alert...
                    </>
                  ) : (
                    <>
                      <FaBell className="w-4 h-4" />
                      Create Price Alert
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="px-6 pb-6 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
              <p>• We check prices multiple times per day</p>
              <p>• You can add multiple email addresses for notifications</p>
              <p>• Your emails are only used for price notifications</p>
              <p>• All added emails will receive the same price alert</p>
            </div>
          </div>

          {/* Coming Out Soon */}
          <div
            className="absolute flex items-center justify-center h-dvh"
            style={{ zIndex: 10001 }}
          >
            <div className="relative bg-gradient-to-br  from-blue-600/50 to-purple-700 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center text-white">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                  <FaRocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Coming Soon!</h3>
                <p className="text-blue-100 text-sm text-wrap">
                  I am working on it to bring you automated price alerts. This
                  feature will be available very soon!
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col items-center justify-center gap-2 text-sm">
                  <span>Email notifications</span>
                  <span>Get notified when the price drops</span>
                </div>
              </div>
{/* 
              <button
                onClick={closeModal}
                className="mt-6 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
              >
                Got it!
              </button> */}

              <p className="text-xs text-blue-200 mt-4">
                Stay tuned for updates 🚀
              </p>
            </div>
          </div>
        </div>
      ),
    });
    setIsOpen(true);
  };
  const closeComingSoon = (): void => {
    setShowComingSoon(false);
  };

  const closeModal = (): void => {
    setIsOpen(false);
    // Reset form when closing
    setEmails([""]);
    setTargetPrice("");
    setErrors({});
  };

  return (
    <div>
      <button
        title="Get Notified on Price Drop - Coming Soon"
        type="button"
        onClick={openModal}
        className="text-blue-600 hover:underline flex text-xs justify-center dark:text-light cursor-pointer"
      >
        Price Watch
      </button>
    </div>
  );
};

export default EbayPriceAlertModal;
