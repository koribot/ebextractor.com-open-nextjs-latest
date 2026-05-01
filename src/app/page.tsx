import { Suspense } from "react";
import MainLayout from "./layout/MainLayout";
import Loading from "./loading";
import PopularItemsv2 from "./components/home/PopularItemsv2";
import ServerSearchInput from "./server-components/search-input/ServerSearchInput";
import {
  ALIEXPRESS_SITE_OPTIONS,
  AMAZON_SITE_OPTIONS,
  CANT_ACCESS_DEALS_EBAY_SITES,
  EBAY_SITE_OPTIONS,
} from "./contants/site-dropdowns";

export default async function Home() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-light-dark">
        {/* Compact Hero with Search */}
        <div className="relative overflow-hidden border-b border-gray-200 dark:border-gray-700">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-indigo-500/10 dark:via-blue-500/5 dark:to-indigo-500/5"></div>
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Compact Header */}
            <div className="max-w-4xl mx-auto text-center mb-2">
              <h1 className="text-xs md:text-xl font-bold text-gray-500 dark:text-gray-200 mb-2 font-mono">
                Find the best products across marketplaces
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Search eBay, Amazon, and AliExpress in one place
              </p>
            </div>
            {/* Compact Search Form */}
            <ServerSearchInput />
          </div>
        </div>

        {/* Popular Items Section */}
        <div className="py-8">
          <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<Loading />}>
              <PopularItemsv2 />
            </Suspense>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
// import { Suspense } from "react";
// import PopularItems from "./components/home/PopularItems";
// import AffliateDisclosure from "./components/affilate-disclosure/AffliateDisclosure";
// import MainLayout from "./layout/MainLayout";
// import Loading from "./loading";
// export default async function Home() {

//   return (
//     <MainLayout>
//       <div className="min-h-screen bg-gray-50 dark:bg-light-dark ">
//         {/* Hero Section */}
//         <div className="max-w-7xl mx-auto px-4 mb-2 sm:px-6 lg:px-8 pt-8 ">
//           <div className="text-center">
//             <h1 className="text-4xl md:text-4xl font-extrabold text-blue-600 mb-4 dark:text-light">
//               Welcome to Ebextractor
//             </h1>
//             <p className="text-lg md:text-lg  text-gray-600 mb-6 max-w-2xl mx-auto">
//               Your smart shopping companion for finding the best deals across
//               eBay, Amazon, and other online marketplaces. Easily search, compare prices,
//               and discover top-rated products all in one place.
//             </p>
//             <AffliateDisclosure />
//           </div>
//         </div>

//         {/* Popular Items Section */}
//         <div className="pb-8 pt-2">
//           {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> */}
//           <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
//             <Suspense fallback={<Loading  />}>
//               <PopularItems />
//             </Suspense>
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// }
