import { StaticImageData } from "next/image";
import categoryInJson from "./categories.json"
export const categoryVersion = "0.0.2";
export interface PlatformCategoryMapping {
  id: string;
  categoryName: string;
  parentId?: string;
  parentName?: string;
  site?: string;
}

export interface CategoryMap {
  ebay?: PlatformCategoryMapping[] | string;
  amazon?: PlatformCategoryMapping[] | string;
  aliexpress?: PlatformCategoryMapping[] | string;
}

export interface Category {
  id: string;
  name: string;
  normalizedUriName: string;
  icon: string;
  description: string;
  itemCount: number;
  platforms: ("ebay" | "amazon" | "aliexpress")[];
  trending: boolean;
  image: string | StaticImageData;
  parentId?: string;
  parentName?: string;
  categoryMap?: CategoryMap;
  subCategories?: Category[];
}

// async function fetchCategoryJS(): Promise<Category[] | undefined> {
//   const url =
//     "https://unpkg.com/ebextractor-category-tree-data@latest/src/categories.json;

//   try {
//     const response = await fetch(url);

//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     const text = await response.text();

//     // If you want to return it for further use
//     return JSON.parse(text);
//   } catch (error) {
//     console.error("Error fetching category.js:", error);
//   }
// }




// const categoryJS =   await fetchCategoryJS();
// export const categoryJS = categoryJS || []
export const categories = categoryInJson.category_tree as Category[];
