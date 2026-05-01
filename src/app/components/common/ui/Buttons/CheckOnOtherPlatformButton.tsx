import Link from "next/link";
import React from "react";
import { showModal } from "../../modal/modal-provider";
import Image from "next/image";

interface Platform {
  name: string;
  url: (title: string) => string;
  gradient: string;
  icon: string;
  description: string;
}

const CheckOnOtherPlatformButton = ({
  title,
  exclude = "",
  imageUrl = null,
}: {
  title: string;
  exclude?: string;
  imageUrl?: string | null;
}) => {
  const UI = () => {
    const platforms: Platform[] = [
      {
        name: "eBay",
        url: (title) =>
          `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
            title,
          )}&campid=5339079461&customid=ebextractor&toolid=10049`,
        gradient: "bg-gray-600",
        icon: "🛒",
        description: "Auctions & Buy Now",
      },
      {
        name: "Amazon",
        url: (title) =>
          `https://www.amazon.com/s?k=${encodeURIComponent(
            title,
          )}&tag=ebextractor0d-20`,
        gradient: "bg-gray-600",
        icon: "📦",
        description: "Fast Prime Shipping",
      },
      {
        name: "AliExpress",
        url: (title) =>
          `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(
            title,
          )}&terminal_id=feb1c430a7064eb980a23522543fcdca`,
        gradient: "bg-gray-600",
        icon: "🌏",
        description: "Global Wholesale",
      },
    ];
    return (
      <div className="w-2xl dark:bg-dark">
        {/* Product Title Display */}
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Searching for
          </p>
          <h3 className="text-xs font-semibold text-gray-900 dark:text-light px-4 leading-snug text-wrap">
            {title}
          </h3>
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={title}
              width={150}
              height={150}
              className="mx-auto mt-4 rounded-lg object-contain"
            />
          )}
        </div>

        {/* Platform Cards Grid */}
        <div className="flex gap-2 justify-center flex-wrap">
          {platforms.map(
            (platform) =>
              exclude.toLocaleLowerCase() !==
                platform.name.toLocaleLowerCase() && (
                <Link
                  key={platform.name}
                  title={`Check on ${platform.name}`}
                  prefetch={false}
                  href={platform.url(title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden bg-gradient-to-br bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-transparent transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                >
                  {/* Gradient Overlay on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  {/* Card Content */}
                  <div className="relative p-6 flex flex-col items-center text-center space-y-3">
                    {/* Icon */}
                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {platform.icon}
                    </div>

                    {/* Platform Name */}
                    <h4 className="text-xl font-bold text-gray-900 dark:text-light group-hover:text-white transition-colors duration-300">
                      {platform.name}
                    </h4>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-white/90 transition-colors duration-300">
                      {platform.description}
                    </p>

                    {/* Arrow Indicator */}
                    <div className="pt-2 text-gray-400 group-hover:text-white transition-colors duration-300">
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ),
          )}
        </div>

        {/* Helper Text */}
        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500">
          Click any platform to compare prices and find the best deals
        </p>
      </div>
    );
  };

  return (
    <button
      onClick={() =>
        showModal({
          title: "Compare Prices",
          content: <UI />,
        })
      }
      title="Compare prices on eBay, Amazon, and more"
      className="text-blue-600 text-xs dark:text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium transition-colors duration-200"
    >
      Check on Other Sites
    </button>
  );
};

export default CheckOnOtherPlatformButton;
