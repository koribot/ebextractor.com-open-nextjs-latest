"use client";
import { Category } from "@/app/contants/categories";
import { useState, useEffect } from "react";
import { EbayResultsGrid } from "../products-search-from-marketplaces/EbayResultCard";
import { EbayItem } from "../products-search-from-marketplaces/types";
import LoadingGrid from "../products-search-from-marketplaces/LoadingGrid";
import { useSearchParams, useRouter } from "next/navigation";
import { api_paths } from "@/app/contants/api-paths";
import requests from "@/app/utils/http";

interface ProductsContentPerCategoryProps {
  displayCategory?: Category;
  currentSlug?: string;
}

const EBAY_SITES = [
  { value: "EBAY_US", label: "eBay United States" },
  { value: "EBAY_GB", label: "eBay United Kingdom" },
  { value: "EBAY_DE", label: "eBay Germany" },
  { value: "EBAY_AU", label: "eBay Australia" },
  { value: "EBAY_IT", label: "eBay Italy" },
  { value: "EBAY_CA", label: "eBay Canada" },
  { value: "EBAY_ES", label: "eBay Spain" },
  { value: "EBAY_FR", label: "eBay France" },
  { value: "EBAY_HK", label: "eBay Hong Kong" },
  { value: "EBAY_SG", label: "eBay Singapore" },
  { value: "EBAY_IE", label: "eBay Ireland" },
  { value: "EBAY_PL", label: "eBay Poland" },
  { value: "EBAY_NL", label: "eBay Netherlands" },
  { value: "EBAY_AT", label: "eBay Austria" },
  { value: "EBAY_CH", label: "eBay Switzerland" },
  { value: "EBAY_BE", label: "eBay Belgium" },
];

export default function ProductsContentPerCategory({
  displayCategory,
  currentSlug,
}: ProductsContentPerCategoryProps) {
  const [eBayitems, setEbayItems] = useState<EbayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentSite = searchParams.get("site") || "EBAY_US";

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSite = e.target.value;
    const params = new URLSearchParams(searchParams);
    params.set("site", newSite);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const fetchItems = async () => {
    if (!displayCategory) {
      return;
    }
    const ebayMapping = displayCategory.categoryMap?.ebay;
    if (
      !ebayMapping ||
      typeof ebayMapping === "string" ||
      !Array.isArray(ebayMapping) ||
      ebayMapping.length === 0
    ) {
      return;
    }
    let categoryId = ebayMapping[0].id;
    setLoading(true);
    // logger.debug.log("slug", currentSlug);
    // if (currentSite.includes("EBAY") && currentSlug === "electronics") {
    //   const electronicsCategory = ebayMapping.find(
    //     (cat) => cat.site === currentSite && cat.categoryName === "Electronics"
    //   );
    //   if (electronicsCategory) categoryId = electronicsCategory.id;
    // }
    try {
      const cleanSlug = currentSlug
        ?.replaceAll("-", " ")
        .replaceAll("and", " ");
      const response = await requests.get(
        `${api_paths.ebay_default_search}?category_ids=${
          currentSlug !== "smart-tech-wearable" &&
          currentSlug !== "cameras-and-photography"
            ? categoryId
            : ""
        }&site=${currentSite}&mode=search-by-categoryids&category=${currentSlug}&q=${
          currentSlug === "niche-items" ? "Everything Else" : cleanSlug
        }`
      );
      const data: any = await response.requestsData;
      setEbayItems(data.itemSummaries || []);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      setEbayItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    return () => {
      setEbayItems([]);
    };
  }, [displayCategory, currentSite]);

  return (
    <div className="w-full">
      {/* Site Selector */}
      <div className="mb-6 flex justify-start">
        <div className="flex items-center gap-2 bg-white rounded-lg px-2 dark:bg-gray-800 dark:border dark:border-gray-700 w-full sm:w-auto">
          <label
            htmlFor="site-select"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap ml-2"
          >
            Select Site:
          </label>
          <select
            id="site-select"
            value={currentSite}
            onChange={handleSiteChange}
            className="bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-gray-200 flex-1 sm:flex-initial py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {EBAY_SITES.map((site) => (
              <option
                key={site.value}
                value={site.value}
                className="dark:bg-gray-800 bg-white text-gray-900 dark:text-gray-100"
              >
                {site.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div>
        {loading ? (
          <LoadingGrid />
        ) : eBayitems.length > 0 ? (
          <EbayResultsGrid results={eBayitems} defaultSite={currentSite} />
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No items found</p>
          </div>
        )}
      </div>
    </div>
  );
}
