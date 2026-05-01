import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const MySavedLinkNavigator = () => {
  const path = usePathname();
  const arrayOfPaths = path.split("/");
  return (
    <nav>
      <ol className="flex items-center flex-wrap gap-1 text-sm text-gray-600 dark:text-gray-300 mb-2">
        {arrayOfPaths.map((item, index) => {
          const isLast = index === arrayOfPaths.length - 1;
          const label = item === "" ? "Home" : decodeURIComponent(item);

          return (
            <li key={index} className="flex items-center gap-1">
              {!isLast ? (
                <Link
                  prefetch={false}
                  href={`/${item}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {label}
                </Link>
              ) : (
                <span className="font-medium text-gray-900 underline dark:text-white">
                  {label}
                </span>
              )}
              {!isLast && (
                <span className="text-gray-400 dark:text-gray-500">/</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default MySavedLinkNavigator;
