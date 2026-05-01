import { api_paths } from "@/app/contants/api-paths";
import MainLayout from "@/app/layout/MainLayout";
import requests from "@/app/utils/http";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { Item } from "@/app/ebay/types";
import { baseUrl } from "@/app/contants/baseUrl";
import EbayProductFullDetailsCard from "@/app/server-components/ebay-product-full-details-card/EbayProductFullDetailsCard";
import { cache } from "react";
import kunsul from "kunsul";

type Props = {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type ItemVariationsResponse = {
  commonDescriptions: {
    description: string;
    itemIds: string[];
  }[];
  items: Item[];
};

type ParsedItemId = {
  itemId: string;
  site: string;
  isLegacy: boolean;
  hasVariations: boolean;
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Parse the itemId parameter into structured data
 */
function parseItemId(itemId: string): ParsedItemId {
  const segments = itemId.split("-");
  const [rawItemId, site = "EBAY_US"] = itemId.split("~");

  const cleanItemId = rawItemId?.replaceAll("-", "|") || "";
  const cleanSite = site.replace("-", "_").toUpperCase();
  const isLegacy = !rawItemId?.includes("v1");
  const hasVariations =
    segments.length >= 3 && segments[2]?.split("~")[0] !== "0";

  return {
    itemId: cleanItemId,
    site: cleanSite,
    isLegacy,
    hasVariations,
  };
}

// ============================================================================
// API FUNCTIONS (cached)
// ============================================================================

const getItemData = cache(async (itemId: string, site: string) => {
  const res = await requests.get<Item>(
    `${baseUrl}${api_paths.ebay_get_item_by_id}?itemId=${itemId}&site=${site}&q=${itemId}&mode=PRODUCT-PAGE-EBAY-SEARCH-GET-ITEM-BY-ID`,
  );
  return res;
});

const getItemByLegacyId = cache(async (itemId: string, site: string) => {
  const res = await requests.get<Item & { errors: any }>(
    `${baseUrl}${api_paths.ebay_get_item_by_legacy_id}?itemId=${itemId}&site=${site}&q=${itemId}`,
  );
  return res;
});

const getItemVariations = cache(async (itemId: string, site: string) => {
  const res = await requests.get<ItemVariationsResponse>(
    `${baseUrl}${api_paths.ebay_get_items_by_item_group}?itemId=${itemId}&site=${site}&q=${itemId}`,
  );
  return res;
});

// ============================================================================
// DATA FETCHING
// ============================================================================

async function fetchItemData(
  parsed: ParsedItemId,
): Promise<
  (Item & { errors?: any[]; variation?: ItemVariationsResponse | null }) | null
> {
  try {
    if (parsed.isLegacy) {
      const res = await getItemByLegacyId(parsed.itemId, parsed.site);
      if (
        !res.success ||
        (res.requestsData.errors &&
          res.requestsData.errors[0] &&
          res.requestsData.errors[0].message &&
          res.requestsData.errors[0].message.includes(
            "The legacy Id is invalid",
          ))
      ) {
        const variations = await getItemVariations(parsed.itemId, parsed.site);
        if (variations.success) {
          const b = variations.requestsData.items[0] || []; // we just need the first one since its variation
          return { ...b, variation: variations.requestsData };
        } else {
          return null;
        }
      }
      return res.requestsData;
    } else {
      const res = await getItemData(parsed.itemId, parsed.site);
      return res.success ? res.requestsData : null;
    }
  } catch (error) {
    return null;
  }
}

async function fetchItemVariations(
  itemId: string,
  site: string,
  hasVariations: boolean,
): Promise<ItemVariationsResponse | null> {
  if (!hasVariations) return null;

  try {
    const res = await getItemVariations(itemId, site);
    return res.success ? res.requestsData : null;
  } catch (error) {
    return null;
  }
}

function isValidItemIdFormat(itemId: string) {
  const isValidItemId =
    /^\d+$|^v1[-|]\d+[-|]\d+(?:~[a-zA-Z]+[-_][a-zA-Z]+)?$/.test(itemId);
  return isValidItemId;
}

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { itemId } = await params;
  const parsed = parseItemId(itemId);

  const itemData = await fetchItemData(parsed);

  if (!itemData || !itemData.itemId || itemData.errors) {
    return {
      metadataBase: new URL("https://www.ebextractor.com"),
      title: "Page Not Found",
      description: "Page Not Found",
    };
  }

  const images = itemData.image?.imageUrl ? [itemData.image.imageUrl] : [];
  const itemName = itemData.title || "View Item";
  const itemDesc = itemData.shortDescription || itemName;

  return {
    metadataBase: new URL("https://www.ebextractor.com"),
    openGraph: {
      images,
    },
    title: `${itemName} | ${parsed.itemId}`,
    description: itemDesc,
  };
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function Page({ params }: Props) {
  const { itemId } = await params;
  const parsed = parseItemId(itemId);

  // Validate itemId format
  // it might be confusing but the producTitle is just for fancy basically we we are in this page we check if adheres valid Id format
  // if the user decided to strip the actual product title from the URl and put the LEGACY_ID/group_id, or v1-0000-0 format
  // if not then its just bunch of charachters maybe actual product name but we dont care of those its just for "SEO"
  if (!isValidItemIdFormat(itemId)) {
    notFound();
  }

  // Fetch item data
  let itemData = await fetchItemData(parsed);
  if (!itemData || !itemData.itemId || itemData.errors) {
    notFound();
  }

  // Fetch variations if needed
  const segments = itemId.split("-");
  const variationId = segments[1] || parsed.itemId;

  const variationsData = itemData.variation
    ? itemData.variation
    : await fetchItemVariations(variationId, parsed.site, parsed.hasVariations);

  return (
    <MainLayout>
      <EbayProductFullDetailsCard
        itemData={itemData}
        cleanSite={parsed.site}
        itemsInVariation={{
          items: variationsData?.items || [],
          itemIds: variationsData?.commonDescriptions?.[0]?.itemIds || [],
        }}
      />
    </MainLayout>
  );
}
