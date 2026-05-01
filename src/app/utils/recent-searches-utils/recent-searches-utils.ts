import { IRecentSearchesData } from "@/app/model/RecentSearches";
import { recentSearchesStorage } from "../IndexedDBManager";
import { xorEncode } from "../simpleObfuscator";
import kunsul from "kunsul";
import { encodeTextToURI } from "../encodeTextToURI";

export const addRecentSearchesToIndexedDb = async ({
  searchTerm,
}: {
  searchTerm: string;
}): Promise<boolean> => {
  if (!searchTerm) return false;
  const _id = xorEncode(searchTerm);
  const base = window.location.origin;
  const pathName = window.location.pathname;
  const href = `${base}${pathName}?q=${encodeTextToURI(searchTerm)}&rld=true&ebay-enabled=true&amz-enabled=true&ali-enabled=true`;
  const count = await recentSearchesStorage.count();
  if (count.success && count?.data && count?.data >= 6) {
    const all = await recentSearchesStorage.getAll<IRecentSearchesData>();
    if (all.success && all?.data) {
      const d = all.data.find((item) => item.id === _id);
      const idTobeDeleted = all.data.sort(
        (a, b) => a.createdAt - b.createdAt,
      )[0].id;
      if (!d) await recentSearchesStorage.delete(idTobeDeleted);
    }
  }
  const res = await recentSearchesStorage.upsert<IRecentSearchesData>(
    _id,
    {
      href: href,
      query: searchTerm,
    },
    Date.now(),
  );
  kunsul.log(
    `adding ${searchTerm} to RecentSearches IndexedDB ${res.success ? "success" : "failure"}`,
    res,
  );
  return res.success;
};
