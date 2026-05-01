"use client";
import React, { useState, useCallback } from "react";
import {
  IoShareSocialOutline,
  IoCopyOutline,
  IoCheckmark,
  IoMailOutline,
  IoLinkOutline,
} from "react-icons/io5";
import {
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaLinkedin,
  FaPinterest,
  FaShareAltSquare,
} from "react-icons/fa";
import { showModal } from "../common/modal/modal-provider";
import kunsul from "kunsul";

type ShareModalCompactProps = {
  url?: string;
  title: string;
  description?: string;
  imageUrl?: string;
};

// Modal Content Component - This needs to manage its own state
function ShareModalContent({
  url,
  title,
  description,
  imageUrl,
}: ShareModalCompactProps) {
  const [copied, setCopied] = useState(false);
  const _url =
    url || (typeof window !== "undefined" ? window.location.href : "");

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(_url);
      setCopied(true);
      kunsul.log("Link copied successfully");
      // setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [_url]);

  const shareOptions = [
    {
      name: "Copy Link",
      icon: copied ? IoCheckmark : IoCopyOutline,
      action: handleCopyLink,
      color: copied
        ? "text-green-600 dark:text-green-400"
        : "text-gray-600 dark:text-gray-400",
      bgColor: copied
        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
        : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
      isSpecial: true,
    },
    {
      name: "Facebook",
      icon: FaFacebook,
      action: () => {
        window.open(
          `https://www.facebook.com/share_channel/?type=reshare&link=${encodeURIComponent(_url)}&source_surface=external_reshare&display=popup`,
          "_blank",
          "width=600,height=400,noopener,noreferrer",
        );
      },
      color: "text-blue-600 dark:text-blue-400",
      bgColor:
        "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(_url)}&text=${encodeURIComponent(title)}`,
          "_blank",
          "width=600,height=400,noopener,noreferrer",
        ),
      color: "text-sky-500 dark:text-sky-400",
      bgColor:
        "bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800",
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      action: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(title + " " + _url)}`,
          "_blank",
          "noopener,noreferrer",
        ),
      color: "text-green-600 dark:text-green-400",
      bgColor:
        "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      action: () =>
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(_url)}`,
          "_blank",
          "width=600,height=400,noopener,noreferrer",
        ),
      color: "text-blue-700 dark:text-blue-500",
      bgColor:
        "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    },
    {
      name: "Email",
      icon: IoMailOutline,
      action: () =>
        (window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
          description ? `${description}\n\n${_url}` : _url,
        )}`),
      color: "text-red-600 dark:text-red-400",
      bgColor:
        "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    },
    {
      name: "Pinterest",
      icon: FaPinterest,
      action: () =>
        window.open(
          `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(_url)}&description=${encodeURIComponent(title)}${imageUrl ? `&media=${encodeURIComponent(imageUrl)}` : ""}`,
          "_blank",
          "width=600,height=400,noopener,noreferrer",
        ),
      color: "text-red-600 dark:text-red-400",
      bgColor:
        "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    },
  ];

  return (
    <div className="w-full p-2 mx-auto ">
      {/* Copied Success Message */}
      <div
        className={`mb-4 overflow-hidden transition-all duration-300 ${
          copied ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
          <IoCheckmark className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            Link copied to clipboard!
          </span>
        </div>
      </div>

      {/* Share Options Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {shareOptions.map((option) => {
          const Icon = option.icon;
          const isCopyButton = option.isSpecial;

          return (
            <button
              key={option.name}
              onClick={option.action}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 active:scale-95 ${option.bgColor} ${
                isCopyButton && copied ? "ring-2 ring-green-500 " : ""
              }`}
              title={option.name}
              aria-label={option.name}
            >
              <Icon
                className={`w-6 h-6 transition-colors duration-200 ${option.color}`}
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center line-clamp-1">
                {isCopyButton && copied ? "Copied!" : option.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* URL Input Section */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Share Link
        </label>
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 group">
          <IoLinkOutline className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <input
            type="text"
            value={_url}
            readOnly
            className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none cursor-text select-all"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm ${
              copied
                ? "bg-green-600 hover:bg-green-700 text-white "
                : "bg-blue-600 hover:bg-blue-700 text-white "
            }`}
            aria-label="Copy link to clipboard"
          >
            {copied ? (
              <>
                <IoCheckmark className="w-4 h-4" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <IoCopyOutline className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Native Share (Mobile) */}
      {typeof navigator !== "undefined" && navigator.share && (
        <button
          onClick={async () => {
            try {
              await navigator.share({ title, text: description, url: _url });
            } catch (err) {
              if ((err as Error).name !== "AbortError") {
                console.error("Share failed:", err);
              }
            }
          }}
          className="w-full mt-4 flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
          aria-label="Open native share menu"
        >
          <IoShareSocialOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            More sharing options
          </span>
        </button>
      )}
    </div>
  );
}

// Main Component
export default function ShareEbextractorLink(props: ShareModalCompactProps) {
  const handleOpenModal = useCallback(() => {
    showModal({
      title: "Share",
      content: <ShareModalContent {...props} />,
    });
  }, [props]);

  return (
    <div>
      <button
        className="flex underline w-full justify-end items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
        onClick={handleOpenModal}
        aria-label="Open share modal"
      >
        <FaShareAltSquare className="w-4 h-4" />
        <span>Share</span>
      </button>
    </div>
  );
}
