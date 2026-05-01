"use client";
import { Item } from "@/app/ebay/types";
import kunsul from "kunsul";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function EbayItemVariationForFullProductPage({
  itemsData,
}: {
  itemsData?: { items: Item[]; itemIds: string[] } | null;
}) {
  const pathName = usePathname();
  const params = useSearchParams();
  const searchParams = new URLSearchParams(params.toString());
  const router = useRouter();
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  // Extract unique variation values
  // const getUniqueVariations = (items: Item[]): string[] => {
  //   if (!items || items.length === 0) return [];

  //   // Get all aspect names
  //   const aspectNames = new Set<string>();
  //   items.forEach((item) => {
  //     item.localizedAspects?.forEach((aspect) => {
  //       aspectNames.add(aspect.name);
  //     });
  //   });

  //   // For each aspect name, check if values vary across items
  //   const variationNames: string[] = [];
  //   aspectNames.forEach((name) => {
  //     const values = new Set<string>();
  //     items.forEach((item) => {
  //       const aspect = item.localizedAspects?.find((a) => a.name === name);
  //       if (aspect) {
  //         values.add(aspect.value);
  //       }
  //     });
  //     kunsul.log(name);
  //     // If there are multiple unique values, this is a variation
  //     if (values.size > 1) {
  //       variationNames.push(name);
  //     }
  //   });

  //   return variationNames;
  // };

  // // Get variation values for a specific item
  // const getVariationValues = (item: Item, variationNames: string[]): string => {
  //   const values: string[] = [];
  //   variationNames.forEach((name) => {
  //     const aspect = item.localizedAspects?.find((a) => a.name === name);
  //     if (aspect) {
  //       values.push(aspect.value);
  //     }
  //   });
  //   return values.join(", ");
  // };
  //
  // // Preprocess items to create a map of aspectName -> aspectValue
  const preprocessItems = (items: Item[]) => {
    return items.map((item) => {
      const aspectMap: Record<string, string> = {};
      item.localizedAspects?.forEach((aspect) => {
        aspectMap[aspect.name] = aspect.value;
      });
      return {
        ...item,
        aspectMap,
      };
    });
  };

  // Get unique variation names
  const getUniqueVariations = (
    items: (Item & { aspectMap: Record<string, string> })[],
  ) => {
    if (!items || items.length === 0) return [];

    const aspectNames = new Set<string>();
    items.forEach((item) => {
      Object.keys(item.aspectMap).forEach((name) => aspectNames.add(name));
    });

    const variationNames: string[] = [];
    aspectNames.forEach((name) => {
      const values = new Set<string>();
      items.forEach((item) => {
        const value = item.aspectMap[name];
        if (value) values.add(value);
      });
      if (values.size > 1) variationNames.push(name);
    });

    return variationNames;
  };

  // Get variation values for a specific item
  const getVariationValues = (
    item: Item & { aspectMap: Record<string, string> },
    variationNames: string[],
  ) => {
    return variationNames
      .map((name) => item.aspectMap[name])
      .filter(Boolean)
      .join(", ");
  };

  useEffect(() => {
    kunsul.log("EbayItemVariationForFullProductPage", itemsData);
    const idWithPossibleSite = pathName.split("/").pop();
    const [itmId = "", site = ""] = idWithPossibleSite
      ? idWithPossibleSite.split("~")
      : [];
    const cleanId = itmId.replaceAll("-", "|");
    const toBe = itemsData?.itemIds.filter((id) => id === cleanId);
    const cleanString = toBe ? toBe[0] : "";
    kunsul.log("clean", cleanString);
    setSelectedItemId(cleanString);
  }, []);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const _selectedItemId = e.target.value;
    const itmIdFromPathName = pathName.split("/").pop();
    const [itmId = "", site = ""] = itmIdFromPathName
      ? itmIdFromPathName.split("~")
      : [];
    const _cleanSelectedItemId = _selectedItemId.replaceAll("|", "-");
    const newPath = pathName.replace(itmId, _cleanSelectedItemId);
    kunsul.log(newPath);
    router.replace(newPath);
  };

  if (!itemsData || !itemsData.items || itemsData.items.length === 0) {
    return null;
  }

  // const variationNames = getUniqueVariations(itemsData.items);

  // const dropDownItems = itemsData.items.map((item, index) => {
  //   const variationText = getVariationValues(item, variationNames);
  //   const isInStock =
  //     (item.estimatedAvailabilities?.[0]?.estimatedRemainingQuantity ?? 0) > 0;

  //   return (
  //     <option
  //       className={`${
  //         isInStock
  //           ? "bg-white font-bold text-gray-900 dark:text-main-white dark:font-normal"
  //           : "bg-gray-50 text-gray-900/50 dark:text-gray-400/60"
  //       } dark:bg-light-dark`}
  //       key={index}
  //       value={item.itemId}
  //     >
  //       {variationText}
  //     </option>
  //   );
  // });

  const preprocessedItems = preprocessItems(itemsData.items);
  const variationNames = getUniqueVariations(preprocessedItems);

  const dropDownItems = preprocessedItems.map((item) => {
    const variationText = getVariationValues(item, variationNames);
    const isInStock =
      (item.estimatedAvailabilities?.[0]?.estimatedRemainingQuantity ?? 0) > 0;

    return (
      <option
        key={item.itemId}
        value={item.itemId}
        className={`${
          isInStock
            ? "bg-white font-bold text-gray-900 dark:text-main-white dark:font-normal"
            : "bg-gray-50 text-gray-900/50 dark:text-gray-400/60"
        } dark:bg-light-dark`}
      >
        {variationText}
      </option>
    );
  });

  return (
    <select
      className="w-full md:w-xs border dark:bg-light-dark dark:border-gray-100/20"
      value={selectedItemId}
      onChange={handleSelectChange}
    >
      {dropDownItems}
    </select>
  );
}

export default EbayItemVariationForFullProductPage;
