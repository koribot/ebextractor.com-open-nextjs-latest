import React from "react";

const PromotionBanner = () => {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-950">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`,
          }}
        />
      </div>

      {/* Content */}
      <a
        href="https://www.amazon.com/primebigdealdays?tag=ebextractor0d-20"
        target="_blank"
        rel="noopener noreferrer"
        className="relative block py-3 px-4 hover:opacity-90 transition-opacity duration-200"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap">
          {/* Lightning icon */}
          <svg
            className="w-4 h-4 text-yellow-300 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
              clipRule="evenodd"
            />
          </svg>

          {/* Text */}
          <span className="text-sm sm:text-base font-bold text-white">
            AMAZON PRIME <span className="text-yellow-300">BIG DEAL DAYS</span>
          </span>

          {/* Badge */}
          <span className="text-xs font-semibold px-2 py-1 bg-yellow-400 text-gray-900 rounded-full flex-shrink-0">
            Shop Now
          </span>

          {/* Arrow */}
          <svg
            className="w-4 h-4 text-white flex-shrink-0"
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
      </a>
    </div>
  );
};

export default PromotionBanner;
