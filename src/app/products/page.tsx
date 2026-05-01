import React from "react";
import MainLayout from "../layout/MainLayout";
import { categories } from "../contants/categories";

const CategoryTreePage = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        {/* <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Browse All Categories
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Find deals and discounts across all product categories
            </p>
          </div>
        </div> */}

        {/* Category Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Category Header */}
                <a
                  href={`/products/${category.normalizedUriName}`}
                  className="block p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-750 border-b border-gray-200 dark:border-gray-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-600 dark:hover:to-gray-650 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h2>
                  </div>
                </a>

                {/* Subcategories */}
                <div className="p-2">
                  {category?.subCategories?.map((sub) => (
                    <a
                      key={sub.id}
                      href={`/products/${sub.normalizedUriName}`}
                      className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <span className="text-sm">{sub.icon}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {sub.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        {/* <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-6 border border-blue-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              💡 Shopping Tip
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Browse by category to discover the best deals and discounts. Each
              category page is updated regularly with the latest offers.
            </p>
          </div>
        </div> */}
      </div>
    </MainLayout>
  );
};

export default CategoryTreePage;
