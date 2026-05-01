// ALL OF THIS SHOULD BE RUN IN CLIENT SIDE DONT RUN IT ON SERVER

import { api_paths } from "@/app/contants/api-paths";
import requests from "../http";
import {
  MySavedMethod,
  MySavedArrayResponse,
  SavedItemData,
  SavedSearchesData,
  SavedSellerData,
} from "@/app/model/MySaved";
import { logger } from "../logger";
import {
  savedItemsStorage,
  savedSearchesStorage,
  savedSellersStorage,
  StorageItem,
} from "../IndexedDBManager";
import { getCookie } from "cookies-next";
import { usidStorageLocalStorage } from "../LocalStorageManager";
import { xorDecode } from "../simpleObfuscator";

interface methodTypes {
  type: "SELLERS" | "ITEMS" | "SEARCHES";
}
interface IaddSavedItemToDb {
  type: methodTypes["type"];
  item: {
    id: string;
    createdAt: number;
    updatedAt: number;
    data: SavedItemData | SavedSellerData | SavedSearchesData;
  };
}
interface IdeleteMySavedDataToDb {
  id: string;
  type: methodTypes["type"];
}
export const addMySavedDataToDb = async ({ type, item }: IaddSavedItemToDb) => {
  const value = await getCookie("authenticatedUser");
  const usid = await getCookie("usid");

  if ((!value && value !== "true") || !usid) {
    logger.debug.log(
      "addMySavedDataToDb",
      "Unable to ADD item, not authenticated",
    );
    return;
  }
  // const value = usidStorageLocalStorage.getById("usid");
  // if (!value.data || value.data?.value === "") {
  //   logger.debug.log(
  //     "addMySavedDataToDb",
  //     "Unable to ADD item, not authenticated",
  //   );
  //   return;
  // }
  const method =
    type === "ITEMS"
      ? MySavedMethod.ADD_SAVED_ITEMS
      : type === "SELLERS"
        ? MySavedMethod.ADD_SAVED_SELLERS
        : MySavedMethod.ADD_SAVED_SEARCHES;
  const _storage =
    type === "ITEMS"
      ? savedItemsStorage
      : type === "SELLERS"
        ? savedSellersStorage
        : savedSearchesStorage;
  const res = await requests.post(api_paths.my_saved, {
    ...item,
    method: method,
  });
  if (res.success) {
    const upRes = await _storage.update(
      item.id,
      { synced: true },
      item.updatedAt,
    );
    logger.debug.log(
      `updating ${type} ${upRes.success ? "Success" : "Failed"}`,
      res.requestsData,
    );
  } else {
    logger.debug.log(`${type} error | addMySavedDataToDb`, res.requestsData);
  }
  return res;
};

export const deleteMySavedDataToDb = async ({
  id,
  type,
}: IdeleteMySavedDataToDb) => {
  const value = await getCookie("authenticatedUser");
  const usid = await getCookie("usid");
  if ((!value && value !== "true") || !usid) {
    logger.debug.log(
      "deleteSavedItemFromDb",
      "Unable to DELETE item, not authenticated",
    );
    return;
  }
  // const value = usidStorageLocalStorage.getById("usid");
  // if (!value.data || value.data?.value === "") {
  //   logger.debug.log(
  //     "deleteSavedItemFromDb",
  //     "Unable to DELETE item, not authenticated",
  //   );
  //   return;
  // }
  const method =
    type === "ITEMS"
      ? MySavedMethod.DELETE_SAVED_ITEMS
      : type === "SELLERS"
        ? MySavedMethod.DELETE_SAVED_SELLERS
        : type === "SEARCHES" && MySavedMethod.DELETE_SAVED_SEARCHES;
  const res = await requests.post(api_paths.my_saved, {
    id,
    method: method,
  });
  logger.debug.log(
    `Deleting ${type} ${res.success ? "Success" : "Failed"}`,
    res,
  );
  return res;
};

export const deleteAllMySavedDataToDb = async (type: methodTypes["type"]) => {
  const value = await getCookie("authenticatedUser");
  const usid = await getCookie("usid");

  if ((!value && value !== "true") || !usid) {
    logger.debug.log(
      "deleteSavedItemFromDb",
      "Unable to DELETE item, not authenticated",
    );
    return;
  }
  // const value = usidStorageLocalStorage.getById("usid");
  // if (!value.data || value.data?.value === "") {
  //   logger.debug.log(
  //     "deleteAllMySavedDataToDb",
  //     "Unable to DELETE item, not authenticated",
  //   );
  //   return;
  // }
  const method =
    type === "ITEMS"
      ? MySavedMethod.DELETE_ALL_SAVED_ITEMS
      : type === "SELLERS"
        ? MySavedMethod.DELETE_ALL_SAVED_SELLERS
        : MySavedMethod.DELETE_ALL_SAVED_SEARCHES;
  const res = await requests.post(api_paths.my_saved, {
    method: method,
  });
  logger.debug.log(
    `Deleting ${type} ${res.success ? "Success" : "Failed"} | deleteAllMySavedDataToDb`,
    res,
  );
  return res;
};

export const getMySavedDataFromDb = async (type: methodTypes["type"]) => {
  const value = await getCookie("authenticatedUser");
  if (!value && value !== "true") {
    logger.debug.log(
      "getMySavedDataFromDb",
      "Unable to GET item, not authenticated",
    );
    return;
  }
  const method =
    type === "ITEMS"
      ? MySavedMethod.GET_SAVED_ITEMS
      : type === "SELLERS"
        ? MySavedMethod.GET_SAVED_SELLERS
        : MySavedMethod.GET_SAVED_SEARCHES;
  const res = await requests.post<MySavedArrayResponse>(api_paths.my_saved, {
    method: method,
  });
  logger.debug.log(
    `Getting ${type} from db ${res.success ? "Success" : "Failed"}| getMySavedDataFromDb`,
    res,
  );
  return res;
};

export const getAllDataFromDbAndReplaceItOnIndexedDb = async (
  type: methodTypes["type"],
) => {
  const value = await getCookie("authenticatedUser");
  const usid = await getCookie("usid");
  if (!value || value !== "true" || !usid) {
    logger.debug.log(
      "getAllDataFromDbAndReplaceItOnIndexedDb",
      "Unable to GET item, not authenticated",
    );
    return;
  }
  // const value = usidStorageLocalStorage.getById("usid");
  // if (!value.data || value.data?.value === "") {
  //   logger.debug.log(
  //     "getAllDataFromDbAndReplaceItOnIndexedDb",
  //     "Unable to GET item, not authenticated",
  //   );
  //   return;
  // }
  const itemsFromDb = await getMySavedDataFromDb(type);
  const _storage =
    type === "ITEMS"
      ? savedItemsStorage
      : type === "SELLERS"
        ? savedSellersStorage
        : savedSearchesStorage;
  type _T = StorageTypeMap[typeof type];
  if (itemsFromDb?.success) {
    const items = itemsFromDb.requestsData?.data?.map((item) => ({
      ...item,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      data: JSON.parse(item.data),
      userId: item.userId,
    }));
    const b = await _storage.replaceAll<_T>(items, {
      key: "userId",
      value: undefined,
    });
    logger.debug.log(
      `Replacing all Data in IndexedDB ${b.success ? "Success" : "Failed"} getAllItemsFromDbAndReplaceItOnIndexedDb`,
      itemsFromDb,
    );
    return itemsFromDb;
  }
};

type StorageTypeMap = {
  ITEMS: SavedItemData;
  SELLERS: SavedSellerData;
  SEARCHES: SavedSearchesData;
};

// This is crucial if something happened on saving the data to db cause the data still in indexed db but it is marked as synced = false
export const getAllUnSyncedSavedDataFromIndexedDbAndSaveToDb = async (
  type: methodTypes["type"],
) => {
  const value = await getCookie("authenticatedUser");
  const usid = await getCookie("usid");
  if (!value || value !== "true" || !usid) {
    logger.debug.log(
      "getMySavedDataFromDb",
      "Unable to GET item, not authenticated",
    );
    return;
  }
  // const value = usidStorageLocalStorage.getById("usid");
  // if (!value.data || value.data?.value === "") {
  //   logger.debug.log(
  //     "getMySavedDataFromDb",
  //     "Unable to GET item, not authenticated",
  //   );
  //   return;
  // }
  const _storage =
    type === "ITEMS"
      ? savedItemsStorage
      : type === "SELLERS"
        ? savedSellersStorage
        : savedSearchesStorage;
  type _T = StorageTypeMap[typeof type];
  const response = (await _storage.getAll<_T>()) as {
    success: boolean;
    data?: Array<StorageItem<_T> & { userId?: string }>;
  };
  if (response.success && response.data) {
    const decodedUsid = xorDecode(decodeURIComponent(usid));
    const unsyncedItems = response.data.filter(
      (item) => !item.data.synced && item.userId === decodedUsid,
    );
    if (unsyncedItems.length === 0) {
      logger.debug.log(
        `All data are synced | getAllUnSyncedSavedDataFromIndexedDbAndSaveToDb`,
      );
      return;
    }

    // Use for-of with await instead of forEach + async
    for (const item of unsyncedItems) {
      const updatedItem = { ...item, data: { ...item.data, synced: true } };

      const res = await addMySavedDataToDb({
        type, // make sure to use dynamic type here
        item: updatedItem,
      });

      logger.debug.log(
        ` syncing data into DB ${res?.success ? "Success" : "Error"} | getAllUnSyncedSavedDataFromIndexedDbAndSaveToDb`,
        res,
      );
    }
  }
};

export const updateNoteDataInDb = async ({
  id,
  type,
  noteText,
}: {
  id: string;
  type: methodTypes["type"];
  noteText: string;
}): Promise<boolean> => {
  const value = await getCookie("authenticatedUser");
  if (!value && value !== "true") {
    logger.debug.log(
      "updateNoteDataInDb",
      `Unable to Update Note ${type} on Database, not authenticated`,
    );
    return false;
  }
  // const value = usidStorageLocalStorage.getById("usid");
  // if (!value.data || value.data?.value === "") {
  //   logger.debug.log(
  //     "updateNoteDataInDb",
  //     `Unable to Update Note ${type} on Database, not authenticated`,
  //   );
  //   return false;
  // }

  const method =
    type === "ITEMS"
      ? MySavedMethod.UPDATE_NOTE_ITEMS
      : type === "SELLERS"
        ? MySavedMethod.UPDATE_NOTE_SELLERS
        : MySavedMethod.UPDATE_NOTE_SEARCHES;
  const _storage =
    type === "ITEMS"
      ? savedItemsStorage
      : type === "SELLERS"
        ? savedSellersStorage
        : savedSearchesStorage;
  const response = await requests.post(api_paths.my_saved, {
    method: method,
    id,
    data: {
      note: noteText,
    },
  });

  if (response.success) {
    const timestamp = Date.now();
    const upRes = await _storage.update(id, { synced: true }, timestamp);
    logger.debug.log(
      `Updating synced ${type} in IndexedDB ${upRes.success ? "Success" : "Failed"} | updateNoteDataInDb`,
      upRes,
    );
  }

  logger.debug.log(
    `Updating note ${type} in DB ${response.success ? "Success" : "Failed"}`,
    response,
  );
  return response.success;
};

export const removeDataWithUserIdFromIndexDB = async (
  type: methodTypes["type"],
): Promise<boolean> => {
  const _storage =
    type === "ITEMS"
      ? savedItemsStorage
      : type === "SELLERS"
        ? savedSellersStorage
        : savedSearchesStorage;
  type _T = StorageTypeMap[typeof type];
  const b = await _storage.removeAllExcept<_T>({
    key: "userId",
    value: undefined,
  });
  logger.debug.log(
    `Removing all Data in IndexedDB Except (GUEST USER) ${b.success ? "Success" : "Failed"} | removeDataFromVerifiedUserWhenThereIsNoUser`,
    b,
  );

  return b.success;
};

export const getDataFromIndexedDb = async (
  type: "ITEMS" | "SELLERS" | "SEARCHES",
) => {
  const _storage =
    type === "ITEMS"
      ? savedItemsStorage
      : type === "SELLERS"
        ? savedSellersStorage
        : savedSearchesStorage;
  type _T = StorageTypeMap[typeof type];
  const response = (await _storage.getAll<_T>()) as {
    success: boolean;
    data?: Array<StorageItem<_T> & { userId?: string }>;
  };
  const usid = await getCookie("usid");

  if (response.success && response.data) {
    const _data = response.data.filter((item) =>
      usid
        ? item.userId === xorDecode(decodeURIComponent(usid))
        : item.userId === null || item.userId === undefined,
    );
    return _data;
  }
};

export const syncDataBetweenDbAndIndexedDb = async (
  type: "ITEMS" | "SELLERS" | "SEARCHES",
) => {
  const usid = await getCookie("usid");
  if (usid) {
    await getAllUnSyncedSavedDataFromIndexedDbAndSaveToDb(type);
    await getAllDataFromDbAndReplaceItOnIndexedDb(type);
  } else {
    removeDataWithUserIdFromIndexDB(type);
  }
};

export const clearAllDataFromIndexedDb = async (
  type: "ITEMS" | "SELLERS" | "SEARCHES",
) => {
  const _storage =
    type === "ITEMS"
      ? savedItemsStorage
      : type === "SELLERS"
        ? savedSellersStorage
        : savedSearchesStorage;
  const res = await _storage.clear();
  logger.debug.log(
    `Clearing all Data in IndexedDB ${res.success ? "Success" : "Failed"} | clearDataFromIndexedDb`,
    res,
  );

  return res.success;
};


