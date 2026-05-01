"use client";
import { encodeTextToURI } from "@/app/utils/encodeTextToURI";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import AffliateDisclosure from "../affilate-disclosure/AffliateDisclosure";
import ImagePreview from "../common/ui/ImagePreview";

const RedirectToEbayHandler = ({
  site,
  title,
  img
}: {
  site: string;
  title: string;
  img: string;
}) => {
  const [isClicked, setIsClicked] = useState(false);
  
  const handleSearchClick = () => {
    setIsClicked(true);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-start font-sans p-4 dark:bg-dark-gray transition-colors">
      <div className="w-full max-w-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8">
          {img && (
            <div className="flex justify-center mb-6 max-h-[200px] mx-auto">
              <ImagePreview
                onHoverTitle={"Link To eBay | "+ title}
                href={`${site}sch/i.html?_nkw=${encodeTextToURI(title)}&_sacat=0&_from=R40&_dmd=1&_ipg=240&campid=5339079461&customid=ebextractor&toolid=10049&srt=e24`}
                onClick={handleSearchClick}
                src={img}
                alt={title}
                itemTitle={title}
                width={200}
                height={200}
                image_quality_for_preview={15}
                image_quality_when_modal_open={100}
              />
            </div>
          )}

          <div className="text-center mb-6">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Ready to search for your item on eBay? Click the button below to
              proceed.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Searching for:
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                readOnly
                className="w-full text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="mb-6 flex justify-center">
            <a
              href={`${site}/sch/i.html?_nkw=${encodeTextToURI(title)}&_sacat=0&_from=R40&_dmd=1&_ipg=240&campid=5339079461&customid=ebextractor&toolid=10049&srt=e24`}
              onClick={handleSearchClick}
              className="w-full text-center py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform bg-blue-600 text-white shadow-lg hover:shadow-xl"
            >
              {isClicked ? "Opening eBay..." : "Check Now on eBay"}
            </a>
          </div>

          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              How it works
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Click the search button above and we&apos;ll take you directly to
              eBay&apos;s search results page with your query.
            </p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Why choose eBay?
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Find unique items, vintage collectibles, and great deals from sellers worldwide with buyer protection.
            </p>
          </div>

          {!isClicked && (
            <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
              <span className="text-sm">Click above to start your search</span>
            </div>
          )}
        </div>

        <AffliateDisclosure />

        <div className=" dark:bg-gray-900 p-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Powered by Ebextractor
            </span>
          </div>
          <div className="text-center mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your trusted companion for finding the best deals on eBay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedirectToEbayHandler;












// "use client";
// import { encodeTextToURI } from "@/app/utils/encodeTextToURI";
// import { useRouter } from "next/navigation";
// import React, { useEffect, useState } from "react";
// import AffliateDisclosure from "../affilate-disclosure/AffliateDisclosure";

// const RedirectToEbayHandler = ({
//   site,
//   title,
// }: {
//   site: string;
//   title: string;
// }) => {
//   const [progress, setProgress] = useState(0);
//   const router = useRouter();
  
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setProgress((prevProgress) => {
//         if (prevProgress >= 100) {
//           clearInterval(interval);
//             router.push(`${site}sch/i.html?_nkw=${encodeTextToURI(title)}&_sacat=0&_from=R40&_dmd=1&_ipg=240&campid=5339079461&customid=ebextractor&toolid=10049&srt=e24`);
//           return 100;
//         }
//         return prevProgress + 10;
//       });
//     }, 50);

//     return () => clearInterval(interval);
//   }, [site, title]);

//   return (
//     <div className="h-full z-[-1] w-full flex flex-col items-center justify-start text-white font-sans p-4 dark:bg-light-dark">
//       <div className="w-full max-w-[600px] bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
//         <div className="p-6 sm:p-8">
//           <div className="text-center mb-6">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
//               <svg
//                 className="w-8 h-8 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                 />
//               </svg>
//             </div>
//             <h1 className="text-2xl sm:text-3xl font-bold mb-2">
//               Redirecting to eBay
//             </h1>
//             <p className="text-gray-300 text-sm">
//               You will be redirected to eBay shortly to search for your item
//             </p>
//           </div>

//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-300 mb-2">
//               Searching for:
//             </label>
//             <div className="relative">
//               <svg
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                 />
//               </svg>
//               <input
//                 type="text"
//                 value={title}
//                 readOnly
//                 className="w-full text-sm bg-gray-700 text-white rounded-lg py-3 px-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>

//           <div className="mb-6">
//             <div className="flex justify-between mb-2">
//               <span className="text-sm font-medium">Preparing redirect...</span>
//               <span className="text-sm font-medium">{progress}%</span>
//             </div>
//             <div className="w-full bg-gray-700 rounded-full h-3">
//               <div
//                 className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
//                 style={{ width: `${progress}%` }}
//               ></div>
//             </div>
//           </div>

//           <div className="bg-gray-700 rounded-lg p-4 mb-4">
//             <div className="flex items-start space-x-3">
//               <div className="flex-shrink-0">
//                 <svg
//                   className="w-5 h-5 text-blue-400 mt-0.5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//               </div>
//               <div>
//                 <h3 className="text-sm font-medium text-white mb-1">
//                   What&apos;s happening?
//                 </h3>
//                 <p className="text-xs text-gray-300">
//                   We&apos;re preparing your search query and will redirect you to
//                   eBay&apos;s search results page. This helps you find the best deals
//                   and compare prices from multiple sellers.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center justify-center space-x-2 text-gray-400">
//             <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-blue-500"></div>
//             <span className="text-sm">Redirecting in a moment...</span>
//           </div>
//         </div>

//         <AffliateDisclosure />

//         <div className="bg-gray-900 p-4">
//           <div className="flex items-center justify-center space-x-2">
//             <svg
//               className="w-6 h-6 text-yellow-400"
//               viewBox="0 0 24 24"
//               fill="currentColor"
//             >
//               <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
//               <path d="M14.829 14.828a4.055 4.055 0 0 1-5.657 0 .999.999 0 1 1 1.414-1.414 2.082 2.082 0 0 0 2.828 0 .999.999 0 1 1 1.415 1.414z" />
//               <circle cx="9" cy="10" r="1.25" />
//               <circle cx="15" cy="10" r="1.25" />
//             </svg>
//             <span className="text-sm text-gray-300">
//               Powered by Ebextractor
//             </span>
//           </div>
//           <div className="text-center mt-2">
//             <p className="text-xs text-gray-400">
//               Connecting you to eBay&apos;s marketplace for the best shopping
//               experience
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RedirectToEbayHandler;
