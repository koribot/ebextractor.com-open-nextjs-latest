"use client";

import { categories, Category } from "@/app/contants/categories";
import Link from "next/link";
import React, { useState } from "react";
import { showModal } from "../common/modal/modal-provider";

interface ExpandedState {
  [key: string]: boolean;
}

const Content = ({
  path,
  HeaderContent,
}: {
  HeaderContent?: React.ReactElement;
  path: string;
}) => {
  const [expandedCategories, setExpandedCategories] = useState<ExpandedState>(
    {},
  );

  const toggleCategory = (categoryId: string): void => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  return (
    <aside className="w-64 bg-white dark:bg-light-dark border-r border-gray-200 dark:border-gray-700  overflow-y-auto very-small-scrollbar">
      {/* Header */}
      {!HeaderContent && (
        <div className="sticky top-0 bg-white dark:bg-light-dark border-b border-gray-200 dark:border-gray-700 p-4 z-10">
          <h2 className="text-lg  text-gray-800 dark:text-white flex items-center gap-2">
            <span className="text-xs font-bold ">
              {" "}
              Find Items with Deals & Discounts
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            From categories below
          </p>
        </div>
      )}

      {/* Categories Navigation */}
      <nav className="p-0">
        {categories.map((category: Category) => (
          <div
            key={category.id}
            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {/* Main Category Button */}
            <div className="flex items-center gap-2">
              <Link
                prefetch={false}
                href={`/${path}/${category.normalizedUriName}`}
                className="flex-1 flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">
                  {category.icon}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
                  {category.name}
                </span>
              </Link>

              {/* Expand/Collapse Toggle */}
              {category.subCategories && category.subCategories.length > 0 && (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-expanded={expandedCategories[category.id]}
                  aria-label={`Toggle ${category.name} subcategories`}
                >
                  <svg
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
                      expandedCategories[category.id] ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Subcategories Dropdown */}
            {expandedCategories[category.id] && category.subCategories && (
              <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                {category.subCategories.map((subCategory: Category) => (
                  <Link
                    key={subCategory.id}
                    href={`/${path}/${subCategory.normalizedUriName}`}
                    className="flex items-center gap-3 px-4 py-2.5 ml-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-l-3 border-transparent hover:border-blue-500 dark:hover:border-blue-400 group"
                  >
                    <span className="text-sm group-hover:scale-110 transition-transform">
                      {subCategory.icon}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                      {subCategory.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default function CategorySidebar({
  HeaderContent,
  path = "/deals",
}: {
  HeaderContent?: React.ReactElement;
  path: string;
}): React.ReactElement {
  return (
    <div>
      {/* Desktop View */}
      <div className="hidden lg:block">
        <Content path={path} HeaderContent={HeaderContent} />
      </div>

      {/* Mobile View */}
      <div className="flex justify-center lg:hidden">
        <button
          title="Explore more deals on other categories"
          onClick={() =>
            showModal({
              title: "Deals & Discounts",
              content: <Content path={path} HeaderContent={HeaderContent} />,
            })
          }
          className="p-2 border-1 dark:bg-gray-800 dark:text-main-white text-light-dark font-medium rounded-lg transition-colors mb-2 cursor-pointer text-xs md:text-lg font-mono"
        >
          Discover More Deals & Discounts in other Categories
        </button>
      </div>
    </div>
  );
}
