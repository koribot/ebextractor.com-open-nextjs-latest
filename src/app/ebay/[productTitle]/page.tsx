import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { Item } from "../types";
import { baseUrl } from "@/app/contants/baseUrl";
import { api_paths } from "@/app/contants/api-paths";
import MainLayout from "@/app/layout/MainLayout";
import EbayProductFullDetailsCard from "@/app/server-components/ebay-product-full-details-card/EbayProductFullDetailsCard";
import { cache } from "react";
import requests from "@/app/utils/http";

type Props = {
  params: Promise<{ productTitle: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type ItemVariationsResponse = {
  commonDescriptions: {
    description: string;
    itemIds: string[];
  }[];
  items: Item[];
};

type ParsedProductTitle = {
  itemId: string;
  site: string;
  segments: string[];
  isValid: boolean;
  isLegacy: boolean;
  hasVariations: boolean;
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Parse the productTitle parameter into structured data
 */
function parseProductTitle(productTitle: string): ParsedProductTitle {
  const isValidFormat = isValidItemIdFormat(productTitle);
  const segments = productTitle.split("-");
  const [rawItemId, site = "EBAY_US"] = productTitle.split("~");

  const isLegacy = !rawItemId?.includes("v1");
  const cleanItemId = rawItemId?.replaceAll("-", "|") || "";
  const cleanSite = site.replace("-", "_").toUpperCase();

  // Legacy items: valid if segments < 3
  // Modern items: valid if includes "v1" and segments >= 3
  // const isValid = isLegacy ? segments.length < 3 : segments.length >= 3;
  const hasVariations = !isLegacy && segments[2] !== "0";

  return {
    itemId: cleanItemId,
    site: cleanSite,
    segments,
    isValid: isValidFormat,
    isLegacy,
    hasVariations,
  };
}

// ============================================================================
// API FUNCTIONS (cached)
// ============================================================================

const getItemData = cache(async (itemId: string, site: string) => {
  const res = await requests.get<Item>(
    `${baseUrl}${api_paths.ebay_get_item_by_id}?itemId=${itemId}&site=${site}&mode=PRODUCT-PAGE-EBAY-SEARCH-GET-ITEM-BY-ID&q=${itemId}`,
  );
  return res;
});

const getItemByLegacyId = cache(async (itemId: string, site: string) => {
  const res = await requests.get<Item & { errors: any }>(
    `${baseUrl}${api_paths.ebay_get_item_by_legacy_id}?itemId=${itemId}&site=${site}&q=${itemId}`,
    { headers: { "referer": "ebextractor" } },
  );
  return res;
});

const getItemVariations = cache(async (itemId: string, site: string) => {
  const res = await requests.get<ItemVariationsResponse>(
    `${baseUrl}${api_paths.ebay_get_items_by_item_group}?itemId=${itemId}&site=${site}&q=${itemId}`,
  );
  return res;
});

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

// ============================================================================
// DATA FETCHING HELPERS
// ============================================================================

/**
 * Fetch item data using the appropriate endpoint (legacy or modern)
 */
// async function fetchItemData(parsed: ParsedProductTitle) {
//   if (parsed.isLegacy) {
//     return await getItemByLegacyId(parsed.itemId, parsed.site);
//   }
//   return await getItemData(parsed.itemId, parsed.site);
// }
async function fetchItemData(
  parsed: ParsedProductTitle,
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
  const { productTitle } = await params;
  const parsed = parseProductTitle(productTitle);

  if (!parsed.isValid) {
    return {
      metadataBase: new URL("https://www.ebextractor.com"),
      title: "Page Not Found",
      description: "Page not found",
    };
  }

  const itemDataRes = await fetchItemData(parsed);

  if (!itemDataRes || !itemDataRes.itemId || itemDataRes.errors) {
    return {
      metadataBase: new URL("https://www.ebextractor.com"),
      title: "Page Not Found",
      description: "Page not found",
    };
  }

  const itemData = itemDataRes;
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
  const { productTitle } = await params;
  const parsed = parseProductTitle(productTitle);

  // Validate itemId format
  // it might be confusing but the producTitle is just for fancy basically we we are in this page we check if adheres valid Id format
  // if the user decided to strip the actual product title from the URl and put the LEGACY_ID/group, or v1-0000-0 format
  // if not then its just bunch of charachters maybe actual product name but we dont care of those its just for "SEO"
  if (!parsed.isValid) {
    notFound();
  }

  // Fetch main item data (uses legacy or modern endpoint based on format)
  const itemDataRes = await fetchItemData(parsed);

  if (!itemDataRes || !itemDataRes?.itemId || itemDataRes.errors) {
    notFound();
  }

  // Fetch variations if needed (only for modern/v1 items)
  let itemsInVariation: { items: Item[]; itemIds: string[] } | null = null;

  // if (parsed.hasVariations && parsed.segments[1]) {
  //   const variationsRes = await getItemVariations(
  //     parsed.segments[1],
  //     parsed.site,
  //   );

  //   if (variationsRes.success && variationsRes.requestsData) {
  //     itemsInVariation = {
  //       items: variationsRes.requestsData.items || [],
  //       itemIds:
  //         variationsRes.requestsData.commonDescriptions?.[0]?.itemIds || [],
  //     };
  //   }
  // }

  // Fetch variations if needed
  // const segments = itemId.split("-");
  const variationId = parsed.segments[1] || parsed.itemId;

  const variationsData = itemDataRes.variation
    ? itemDataRes.variation
    : await fetchItemVariations(variationId, parsed.site, parsed.hasVariations);

  return (
    <MainLayout>
      <EbayProductFullDetailsCard
        itemData={itemDataRes}
        cleanSite={parsed.site}
        itemsInVariation={{
          items: variationsData?.items || [],
          itemIds: variationsData?.commonDescriptions?.[0]?.itemIds || [],
        }}
      />
    </MainLayout>
  );
}
