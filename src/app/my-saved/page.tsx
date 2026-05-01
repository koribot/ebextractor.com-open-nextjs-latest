import React from "react";
import MainLayout from "../layout/MainLayout";
import { FaHeart, FaSearch, FaUserCircle, FaBookmark } from "react-icons/fa";
import Link from "next/link";

const SavedPage = () => {
  const sections = [
    {
      label: "Items",
      href: "/my-saved/items",
      icon: FaHeart,
      description: "Quick access to your saved items",
      color: "red",
    },
    {
      label: "Searches",
      href: "/my-saved/searches",
      icon: FaSearch,
      description: "Quick access to your saved search queries",
      color: "blue",
    },
    {
      label: "Sellers",
      href: "/my-saved/sellers",
      icon: FaUserCircle,
      description: "Follow and track your favorite sellers",
      color: "green",
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaBookmark className="text-4xl text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              My Saved
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Manage your saved items, searches, and sellers all in one place
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                prefetch={false}
                key={section.href}
                href={section.href}
                className="group bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-xl p-8 text-center"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110
                  ${
                    section.color === "red"
                      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                      : ""
                  }
                  ${
                    section.color === "blue"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : ""
                  }
                  ${
                    section.color === "green"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : ""
                  }
                `}
                >
                  <Icon className="text-2xl" />
                </div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {section.label}
                </h2>

                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {section.description}
                </p>

                <div className="mt-6">
                  <span className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:gap-2 transition-all">
                    View {section.label.toLowerCase()}
                    <svg
                      className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
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
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats (Optional) */}
        {/* <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-100 dark:border-gray-600">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Note
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              All the items in My Saved are stored in your browser's local
              storage. They will be deleted when you clear your browser's cache.
              If you want to save items online, you need to have an account and
              click the Sync button.
            </p>
          </div>
        </div> */}
      </div>
    </MainLayout>
  );
};

export default SavedPage;
