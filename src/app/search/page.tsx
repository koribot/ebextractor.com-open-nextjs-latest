import { Suspense } from "react";
import { cookies } from "next/headers";
import dynamic from "next/dynamic";
import MainLayout from "@/app/layout/MainLayout";
import SpinnerFallback from "../components/common/ui/fallbacks/SpinnerFallback";
import MarketplaceSearch from "../components/products-search-from-marketplaces/MarketplaceSearch";
import { getCookie } from "cookies-next/server";
import Loading from "./loading";
import { Metadata } from "next";

type Props = {
  params: Promise<{ itm: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
export const generateMetadata = async ({
  searchParams,
}: Props): Promise<Metadata> => {
  const { q } = await searchParams;
  // console.log("searchParams:", awaitedSearchParams);
  const keyword: string | string[] | null = q || null;

  if (keyword) {
    return {
      title: `${keyword} | eBextractor Product Search`,
    };
  } else {
    return {
      title:
        "Product Search - Multi-Marketplace - Compare Prices Across All Platforms | Ebextractor",
    };
  }
};

export default async function EbayAndAmazonSearchPage() {
  // Server-side theme detection
  const theme = await getCookie("theme", { cookies });
  const isDark = theme === "dark";

  return (
    <MainLayout>
      {/*<Suspense fallback={<Loading />}>*/}
      <MarketplaceSearch />
      {/*</Suspense>*/}
    </MainLayout>
  );
}
