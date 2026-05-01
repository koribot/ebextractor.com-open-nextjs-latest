"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { categories } from "@/app/contants/categories";
import { usePathname, useSearchParams } from "next/navigation";

export const CategoriesNavbar: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const searchParams = useSearchParams();
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    container?.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      container?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };
  function buildProductsHref(
    categorySlug: string,
    searchParams: URLSearchParams | null,
    path: string,
  ) {
    const base = `/products/${categorySlug}`;

    if (!searchParams) {
      return base;
    }

    // If already inside /products → keep all params
    if (path.includes("/products/")) {
      const params = searchParams.toString();
      return params ? `${base}?${params}` : base;
    }

    // If coming from another page (not home)
    if (path !== "/") {
      const site = searchParams.get("site");
      const from = encodeURIComponent(`${path}/${searchParams.toString()}`);

      if (site) {
        return `${base}?site=${site}&from=${from}`;
      }
    }

    return base;
  }

  return (
    <div className="w-full bg-main-white dark:bg-light-dark border-b border-gray-200 dark:border-gray-700 sticky top-16 z-99">
      {/* max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 */}
      <div className="">
        <div className="relative flex items-center justify-center">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors z-10"
              aria-label="Scroll left"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Categories Container */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto small-scrollbar py-1"
            style={{ scrollBehavior: "smooth" }}
          >
            {categories.map((category) => (
              <Link
                prefetch={false}
                key={category.id}
                href={buildProductsHref(
                  category.normalizedUriName,
                  searchParams,
                  path,
                )}
              >
                <div className={`flex-shrink-0 px-3 `}>
                  <p
                    className={`text-sm font-medium dark:text-gray-300 hover:text-blue-700 dark:hover:text-emerald-400 transition-colors whitespace-nowrap ${
                      path === `/products/${category.normalizedUriName}`
                        ? "text-blue-700 underline"
                        : "text-gray-700"
                    }`}
                  >
                    {category.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors z-10"
              aria-label="Scroll right"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
