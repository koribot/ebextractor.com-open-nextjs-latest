"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { logger } from "@/app/utils/logger";
import { LocalStorageManager } from "@/app/utils/LocalStorageManager";
import { Toast } from "@/app/utils/toast";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useIndexedDB } from "../provider/IndexDBProvider";
import { savedSearchesStorage } from "@/app/utils/IndexedDBManager";
import { showModal } from "../common/modal/modal-provider";
import SaveOptions from "../save-options/SaveOptions";
import { IndexDbIdEncoder } from "@/app/utils/IndexDbIdCoder";

interface SearchInputProps {
  initialSearchTerm: string;
  defaultEbaySite: string;
  defaultAmazonSite: string;
  onSearch: (e?: React.FormEvent) => void;
  setSearchTerm: (term: string) => void;
}

interface SavedSearchesData {
  href: string;
  query: string;
  note: string;
}
export const SearchInput = ({
  initialSearchTerm,
  defaultEbaySite,
  defaultAmazonSite,
  onSearch,
  setSearchTerm,
}: SearchInputProps) => {
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = e.target.value;
    setLocalSearchTerm(newTerm);
    // setSearchTerm(newTerm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    params.set("q", encodeURIComponent(localSearchTerm));
    params.set("site", defaultEbaySite);
    params.set("siteamz", defaultAmazonSite);
    router.push(`/search?${params.toString()}`, { scroll: false });
    onSearch(e);
    setSearchTerm(localSearchTerm);
  };

  // const handleToggleSave = async (e: React.MouseEvent) => {
  //   if (localSearchTerm === "") return;
  //   e.preventDefault();
  //   e.stopPropagation();
  //   const href = window.location.href;
  //   if (isSaved) {
  //     // Delete the item
  //     const deleteResponse = await savedSearchesStorage.delete(href);
  //     if (deleteResponse.success) {
  //       setIsSaved(false);
  //       Toast().fire({
  //         icon: "success",
  //         title: "Search deleted successfully",
  //       });
  //     } else {
  //       Toast().fire({
  //         icon: "error",
  //         title: `Search could not be deleted: ${deleteResponse.error}`,
  //       });
  //     }
  //   } else {
  //     const promptNote = prompt(
  //       "You can add note about this search (optional)",
  //     );
  //     const searchData = {
  //       href,
  //       query: localSearchTerm,
  //       note: promptNote || "",
  //     };
  //     const createResponse =
  //       await savedSearchesStorage.create<SavedSearchesData>(href, searchData);
  //     if (createResponse.success) {
  //       setIsSaved(true);

  //       Toast().fire({
  //         icon: "success",
  //         title: `<div>
  //         <span className="font-bold">Search saved successfully</span>
  //         <a target="_blank" href="/my-saved/searches" style="text-decoration: underline; color: #3b82f6, cursor: pointer; justify-self: flex-end ">View Saved Searches</a>
  //         </div>`,
  //       });
  //     } else {
  //       Toast().fire({
  //         icon: "error",
  //         title: `Search could not be saved: ${createResponse.error}`,
  //       });
  //     }
  //   }
  // };
  // Check if item is saved on mount
  const checkIfSaved = async () => {
    const _id = await IndexDbIdEncoder(window.location.href);
    const existsResponse = await savedSearchesStorage.exists(_id);
    setIsSaved(existsResponse.data || false);
  };
  const toggleSaveOptionModal = () => {
    showModal({
      title: "Saved Searches",
      content: (
        <SaveOptions
          search={{
            href: window.location.href,
            query: localSearchTerm,
          }}
          callBackFn={() => {
            checkIfSaved();
          }}
        />
      ),
    });
  };

  useEffect(() => {
    checkIfSaved();
  }, [params]);

  useEffect(() => {
    setLocalSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  return (
    <div className="flex w-full justify-center">
      <div className="py-2 flex">
        {searchParams.size > 0 && (
          <button
            onClick={toggleSaveOptionModal}
            title={isSaved ? "Remove from saved" : "Save Item"}
            className={`flex flex-col justify-center items-center p-1 border border-gray-300 dark:border-none ${
              isSaved
                ? "text-blue-700 dark:text-main-white bg-main-white dark:bg-light-dark hover:bg-red-50"
                : "text-black/60 dark:text-main-white bg-main-white dark:bg-light-dark hover:bg-gray-100"
            }`}
          >
            {isSaved ? <FaHeart /> : <FaRegHeart />}
            <p className="text-xs">{isSaved ? "Remove" : "Save"}</p>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex w-full justify-center">
        <div className="flex w-full justify-center relative p-2">
          <input
            name="searchInput"
            type="text"
            placeholder="Search for an item (e.g. iPhone, UPC, Model Number, MPN, etc)"
            required
            value={localSearchTerm}
            onChange={handleInputChange}
            className="bg-main-white px-4 py-2 border border-gray-300 rounded-l-md flex-grow w-full text-gray-700 focus:outline-none dark:bg-light-gray dark:border-gray-700 dark:text-light"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 dark:bg-main-bg text-white hover:bg-blue-600 dark:border dark:border-gray-700 dark:bg-light-dar mr-1"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

// "use client";
// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";

// interface SearchInputProps {
//   initialSearchTerm: string;
//   defaultEbaySite: string;
//   defaultAmazonSite: string;
//   onSearch: (e?: React.FormEvent) => void;
//   setSearchTerm: (term: string) => void;
// }

// export const SearchInput = ({
//   initialSearchTerm,
//   defaultEbaySite,
//   defaultAmazonSite,
//   onSearch,
//   setSearchTerm,
// }: SearchInputProps) => {
//   const [localSearchTerm, setLocalSearchTerm] = useState("");
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const params = new URLSearchParams(searchParams.toString());
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newTerm = e.target.value;
//     setLocalSearchTerm(newTerm);
//     // setSearchTerm(newTerm);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     params.set("q", encodeURIComponent(localSearchTerm));
//     params.set("site", defaultEbaySite);
//     params.set("siteamz", defaultAmazonSite);
//     router.push(`/search?${params.toString()}`, { scroll: false });
//     onSearch(e);
//     setSearchTerm(localSearchTerm);
//   };

//   useEffect(() => {
//     setLocalSearchTerm(initialSearchTerm);
//   }, [initialSearchTerm]);

//   return (
//     <>
//       <form
//         onSubmit={handleSubmit}
//         className="flex w-full justify-center relative p-2"
//       >
//         <input
//           name="searchInput"
//           type="text"
//           placeholder="Search for an item (e.g. iPhone, UPC, Model Number, MPN, etc)"
//           required
//           value={localSearchTerm}
//           onChange={handleInputChange}
//           className="bg-main-white px-4 py-2 border border-gray-300 rounded-l-md flex-grow w-full text-gray-700 focus:outline-none dark:bg-light-gray dark:border-gray-700 dark:text-light"
//         />
//         <button
//           type="submit"
//           className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 dark:border dark:border-gray-700 dark:bg-light-dar mr-1"
//         >
//           Search
//         </button>
//       </form>
//     </>
//   );
// };
