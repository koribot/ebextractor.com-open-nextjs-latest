// indexedDBManager.ts
// A generic, type-agnostic IndexedDB manager with consistent response structure

const EBEXTRACTOR_INDEXEDDB_VERSION = 1;

/**
 * Standard response structure for all operations
 */
export interface StorageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Stored item wrapper with metadata
 */
export type StorageItem<T = any, E = {}> = {
  id: string;
  data: T;
  createdAt: number;
  updatedAt: number;
} & E;

// Shared database instances and promises per database
const dbInstances = new Map<string, IDBDatabase>();
const dbInitPromises = new Map<string, Promise<IDBDatabase>>();
const storeRegistry = new Map<string, Set<string>>();

function getRequiredVersion(dbName: string): number {
  const stores = storeRegistry.get(dbName);
  return stores ? stores.size : 1;
}

/**
 * Register a store name for a specific database
 */
function registerStore(dbName: string, storeName: string): void {
  if (!storeRegistry.has(dbName)) {
    storeRegistry.set(dbName, new Set());
  }
  storeRegistry.get(dbName)!.add(storeName);
}

/**
 * Initialize a shared database with all registered stores
 */
async function initializeSharedDatabase(
  dbName: string,
  _requestedVersion: number, // Ignore the requested version
): Promise<IDBDatabase> {
  // Return existing instance if available
  if (dbInstances.has(dbName)) {
    return dbInstances.get(dbName)!;
  }

  // Return existing promise if initialization is in progress
  if (dbInitPromises.has(dbName)) {
    return dbInitPromises.get(dbName)!;
  }

  // Calculate version based on number of registered stores
  const version = getRequiredVersion(dbName);

  // Create new initialization promise
  const initPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onerror = () => {
      dbInitPromises.delete(dbName);
      reject(new Error(`Failed to open database: ${dbName}`));
    };

    request.onsuccess = () => {
      const db = request.result;
      dbInstances.set(dbName, db);
      dbInitPromises.delete(dbName);
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Get all registered stores for this database
      const stores = storeRegistry.get(dbName) || new Set();

      // Create all registered stores during upgrade
      stores.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      });
    };
  });

  dbInitPromises.set(dbName, initPromise);
  return initPromise;
}

// /**
//  * Initialize a shared database with all registered stores
//  */
// async function initializeSharedDatabase(
//   dbName: string,
//   version: number,
// ): Promise<IDBDatabase> {
//   // Return existing instance if available
//   if (dbInstances.has(dbName)) {
//     return dbInstances.get(dbName)!;
//   }

//   // Return existing promise if initialization is in progress
//   if (dbInitPromises.has(dbName)) {
//     return dbInitPromises.get(dbName)!;
//   }

//   // Create new initialization promise
//   const initPromise = new Promise<IDBDatabase>((resolve, reject) => {
//     const request = indexedDB.open(dbName, version);

//     request.onerror = () => {
//       dbInitPromises.delete(dbName);
//       reject(new Error(`Failed to open database: ${dbName}`));
//     };

//     request.onsuccess = () => {
//       const db = request.result;
//       dbInstances.set(dbName, db);
//       dbInitPromises.delete(dbName);
//       resolve(db);
//     };

//     request.onupgradeneeded = (event) => {
//       const db = (event.target as IDBOpenDBRequest).result;

//       // Get all registered stores for this database
//       const stores = storeRegistry.get(dbName) || new Set();

//       // Create all registered stores during upgrade
//       stores.forEach((storeName) => {
//         if (!db.objectStoreNames.contains(storeName)) {
//           db.createObjectStore(storeName, { keyPath: "id" });
//         }
//       });
//     };
//   });

//   dbInitPromises.set(dbName, initPromise);
//   return initPromise;
// }

/**
 * Generic IndexedDB Manager
 * Handles any data structure while maintaining consistent response format
 * @note When creating an Item you need a unique `id` - it is `required`
 */
export class IndexedDBManager {
  private dbName: string;
  private storeName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(
    dbName: string = "app_database",
    storeName: string = "app_storage",
    version: number = 1,
  ) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;

    // Register this store for the database
    registerStore(dbName, storeName);
  }

  /**
   * Initialize the database connection
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    // Use shared database initialization for all databases
    this.db = await initializeSharedDatabase(this.dbName, this.version);
    return this.db;
  }

  /**
   * Get a transaction for the object store
   */
  private async getTransaction(
    mode: IDBTransactionMode = "readonly",
  ): Promise<IDBObjectStore> {
    const db = await this.initDB();
    const transaction = db.transaction([this.storeName], mode);
    return transaction.objectStore(this.storeName);
  }

  /**
   * Get all items from storage
   */
  async getAll<T = any>(): Promise<StorageResponse<StorageItem<T>[]>> {
    try {
      const store = await this.getTransaction("readonly");

      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const data = request.result as StorageItem<T>[];
          resolve({
            success: true,
            data,
            message: `Retrieved ${data.length} items`,
          });
        };

        request.onerror = () => {
          resolve({
            success: false,
            error: "Failed to retrieve items",
            data: [],
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to retrieve items",
        data: [],
      };
    }
  }

  /**
   * Get a single item by ID
   */
  async getById<T = any>(
    id: string,
  ): Promise<StorageResponse<StorageItem<T> | null>> {
    try {
      const store = await this.getTransaction("readonly");

      return new Promise((resolve) => {
        const request = store.get(id);

        request.onsuccess = () => {
          const item = request.result as StorageItem<T> | undefined;
          resolve({
            success: true,
            data: item || null,
            message: item ? "Item found" : "Item not found",
          });
        };

        request.onerror = () => {
          resolve({
            success: false,
            error: "Failed to get item",
            data: null,
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get item",
        data: null,
      };
    }
  }

  /**
   * Check if an item exists
   */
  async exists(id: string): Promise<StorageResponse<boolean>> {
    try {
      const response = await this.getById(id);
      const exists = response.data !== null;

      return {
        success: true,
        data: exists,
        message: exists ? "Item exists" : "Item does not exist",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to check existence",
        data: false,
      };
    }
  }

  /**
   * Create/Save a new item with generic data structure
   */
  async create<T = any>(
    id: string,
    data: T,
    timestamp: number,
    additionalData?: Partial<Record<string, any>>,
  ): Promise<StorageResponse<StorageItem<T>>> {
    try {
      // Check if Data already exists
      const existsResponse = await this.exists(id);
      if (existsResponse.data) {
        return {
          success: false,
          error: "Data already exists",
          message: "Use update() to modify existing items",
        };
      }

      const newItem: StorageItem<T> = {
        id,
        data: data,
        createdAt: timestamp,
        updatedAt: timestamp,
        ...additionalData,
      };

      const store = await this.getTransaction("readwrite");

      return new Promise((resolve) => {
        const request = store.add(newItem);

        request.onsuccess = () => {
          resolve({
            success: true,
            data: newItem,
            message: "Item created successfully",
          });
        };
        request.onerror = () => {
          resolve({
            success: false,
            error: "Failed to create item",
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create item",
      };
    }
  }

  /**
   * Update an existing item (partial or full update)
   */
  async update<T = any>(
    id: string,
    data: Partial<T>,
    timestamp: number,
  ): Promise<StorageResponse<StorageItem<T>>> {
    try {
      const existingResponse = await this.getById<T>(id);

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: "Item not found",
          message: "Use create() for new items",
        };
      }

      const existingItem = existingResponse.data;

      // Merge existing data with updates
      const updatedItem: StorageItem<T> = {
        ...existingItem,
        data: { ...existingItem.data, ...data },
        updatedAt: timestamp,
      };
      const store = await this.getTransaction("readwrite");

      return new Promise((resolve) => {
        const request = store.put(updatedItem);

        request.onsuccess = () => {
          resolve({
            success: true,
            data: updatedItem,
            message: "Item updated successfully",
          });
        };

        request.onerror = () => {
          resolve({
            success: false,
            error: "Failed to update item",
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update item",
      };
    }
  }

  /**
   * Replace entire item data (not partial update)
   */
  async replace<T = any>(
    id: string,
    data: T,
  ): Promise<StorageResponse<StorageItem<T>>> {
    try {
      const existingResponse = await this.getById<T>(id);

      if (!existingResponse.success || !existingResponse.data) {
        return {
          success: false,
          error: "Item not found",
          message: "Use create() for new items",
        };
      }

      const replacedItem: StorageItem<T> = {
        id,
        data,
        createdAt: existingResponse.data.createdAt,
        updatedAt: Date.now(),
      };

      const store = await this.getTransaction("readwrite");

      return new Promise((resolve) => {
        const request = store.put(replacedItem);

        request.onsuccess = () => {
          resolve({
            success: true,
            data: replacedItem,
            message: "Item replaced successfully",
          });
        };

        request.onerror = () => {
          resolve({
            success: false,
            error: "Failed to replace item",
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to replace item",
      };
    }
  }

  /**
   * Replace all items in the store with new data
   *
   * @template T - The type of data being stored
   * @template E - Base extended properties type
   * @template EXT - Extended type that may include additional caller-specific properties
   * @param data - Array of items with potential extended properties
   * @param options - Optional configuration including callback for extended items
   */

  async replaceAll<T = any>(
    data: StorageItem<T>[],
    retain?: { key: string; value: any },
  ): Promise<StorageResponse<StorageItem<T>[]>> {
    try {
      const store = await this.getTransaction("readwrite");

      return new Promise((resolve) => {
        // If retain is specified, read items to keep first
        if (retain) {
          const retainedItems: StorageItem<T>[] = [];
          const cursorRequest = store.openCursor();

          cursorRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
              .result;

            if (cursor) {
              const item = cursor.value as StorageItem<T>;

              // Check if this item should be retained using bracket notation
              if ((item as any)[retain.key] === retain.value) {
                retainedItems.push(item);
              }

              cursor.continue();
            } else {
              // Done collecting items to retain, now clear and re-add
              performClearAndReplace(retainedItems);
            }
          };

          cursorRequest.onerror = () => {
            resolve({
              success: false,
              error: "Failed to read items for retention",
            });
          };
        } else {
          // No retention needed, proceed directly
          performClearAndReplace([]);
        }

        function performClearAndReplace(retainedItems: StorageItem<T>[]) {
          const clearRequest = store.clear();

          clearRequest.onsuccess = () => {
            // Combine retained items with new data
            const allItems = [...retainedItems, ...data];

            // Handle empty array case
            if (allItems.length === 0) {
              resolve({
                success: true,
                data: [],
                message: "All items cleared, no new items to add",
              });
              return;
            }

            // Add all items (retained + new)
            const addedItems: StorageItem<T>[] = [];
            let completed = 0;
            let failed = 0;

            allItems.forEach((item) => {
              const addRequest = store.add(item);

              addRequest.onsuccess = () => {
                addedItems.push(item);
                completed++;

                if (completed + failed === allItems.length) {
                  resolve({
                    success: failed === 0,
                    data: addedItems,
                    message: `Replaced items: ${completed} successful${retain ? ` (${retainedItems.length} retained)` : ""}${failed > 0 ? `, ${failed} failed` : ""}`,
                    error: failed > 0 ? "Some items failed to add" : undefined,
                  });
                }
              };

              addRequest.onerror = () => {
                failed++;
                if (completed + failed === allItems.length) {
                  resolve({
                    success: failed === 0,
                    data: addedItems,
                    message: `Replaced items: ${completed} successful, ${failed} failed`,
                    error: "Some items failed to add",
                  });
                }
              };
            });
          };

          clearRequest.onerror = () => {
            resolve({
              success: false,
              error: "Failed to clear existing data",
            });
          };
        }
      });
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to replace all items",
      };
    }
  }

  // async replaceAll<T = any>(
  //   data: StorageItem<T>[],
  // ): Promise<StorageResponse<StorageItem<T>[]>> {
  //   try {
  //     const store = await this.getTransaction("readwrite");

  //     return new Promise((resolve) => {
  //       // Clear all existing data first
  //       const clearRequest = store.clear();

  //       clearRequest.onsuccess = () => {
  //         // Handle empty array case
  //         if (data.length === 0) {
  //           resolve({
  //             success: true,
  //             data: [],
  //             message: "All items cleared, no new items to add",
  //           });
  //           return;
  //         }

  //         // Add all new items
  //         const addedItems: StorageItem<T>[] = [];
  //         let completed = 0;
  //         let failed = 0;

  //         data.forEach((item) => {
  //           const addRequest = store.add(item);

  //           addRequest.onsuccess = () => {
  //             addedItems.push(item);
  //             completed++;

  //             if (completed + failed === data.length) {
  //               resolve({
  //                 success: failed === 0,
  //                 data: addedItems,
  //                 message: `Replaced all items: ${completed} successful${failed > 0 ? `, ${failed} failed` : ""}`,
  //                 error: failed > 0 ? "Some items failed to add" : undefined,
  //               });
  //             }
  //           };

  //           addRequest.onerror = () => {
  //             failed++;
  //             if (completed + failed === data.length) {
  //               resolve({
  //                 success: failed === 0,
  //                 data: addedItems,
  //                 message: `Replaced items: ${completed} successful, ${failed} failed`,
  //                 error: "Some items failed to add",
  //               });
  //             }
  //           };
  //         });
  //       };

  //       clearRequest.onerror = () => {
  //         resolve({
  //           success: false,
  //           error: "Failed to clear existing data",
  //         });
  //       };
  //     });
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error:
  //         error instanceof Error
  //           ? error.message
  //           : "Failed to replace all items",
  //     };
  //   }
  // }

  async removeAllExcept<T = any>(retain?: {
    key: string;
    value: any;
  }): Promise<StorageResponse<StorageItem<T>[]>> {
    try {
      const store = await this.getTransaction("readwrite");

      return new Promise((resolve) => {
        const retainedItems: StorageItem<T>[] = [];
        const cursorRequest = store.openCursor();

        cursorRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
            .result;

          if (cursor) {
            const item = cursor.value as StorageItem<T>;

            // If retain is specified and item doesn't match, delete it
            if (retain && (item as any)[retain.key] !== retain.value) {
              cursor.delete();
            }
            // If no retain specified, delete everything
            else if (!retain) {
              cursor.delete();
            }
            // Otherwise, keep it
            else {
              retainedItems.push(item);
            }

            cursor.continue();
          } else {
            // Done processing all items
            resolve({
              success: true,
              data: retainedItems,
              message: retain
                ? `Removed all items except ${retainedItems.length} matching ${retain.key}=${retain.value}`
                : "Removed all items",
            });
          }
        };

        cursorRequest.onerror = () => {
          resolve({
            success: false,
            error: "Failed to remove items",
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to remove items",
      };
    }
  }

  /**
   * Delete an item by ID
   */
  async delete(id: string): Promise<StorageResponse<string>> {
    try {
      const existsResponse = await this.exists(id);

      if (!existsResponse.data) {
        return {
          success: false,
          error: "Item not found",
          message: "No item was deleted",
        };
      }

      const store = await this.getTransaction("readwrite");

      return new Promise((resolve) => {
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve({
            success: true,
            data: id,
            message: "Item deleted successfully",
          });
        };

        request.onerror = () => {
          resolve({
            success: false,
            error: "Failed to delete item",
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete item",
      };
    }
  }

  /**
   * Upsert: Create if doesn't exist, update if exists
   */
  async upsert<T = any>(
    id: string,
    data: T,
    timestamp: number,
  ): Promise<StorageResponse<StorageItem<T>>> {
    const existsResponse = await this.exists(id);

    if (existsResponse.data) {
      return this.replace(id, data);
    } else {
      return this.create(id, data, timestamp);
    }
  }

  /**
   * Clear all items
   */
  async clear(): Promise<StorageResponse<number>> {
    try {
      const allItems = await this.getAll();
      const count = allItems.data?.length || 0;

      const store = await this.getTransaction("readwrite");

      return new Promise((resolve) => {
        const request = store.clear();

        request.onsuccess = () => {
          resolve({
            success: true,
            data: count,
            message: `Cleared ${count} items`,
          });
        };

        request.onerror = () => {
          resolve({
            success: false,
            error: "Failed to clear storage",
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to clear storage",
      };
    }
  }

  /**
   * Get count of items
   */
  async count(): Promise<StorageResponse<number>> {
    try {
      const store = await this.getTransaction("readonly");

      return new Promise((resolve) => {
        const request = store.count();

        request.onsuccess = () => {
          const count = request.result;
          resolve({
            success: true,
            data: count,
            message: `Total items: ${count}`,
          });
        };

        request.onerror = () => {
          resolve({
            success: false,
            error: "Failed to count items",
            data: 0,
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to count items",
        data: 0,
      };
    }
  }

  /**
   * Find items by custom predicate function
   */
  async find<T = any>(
    predicate: (item: StorageItem<T>) => boolean,
  ): Promise<StorageResponse<StorageItem<T>[]>> {
    try {
      const allItems = await this.getAll<T>();
      if (!allItems.success) {
        return allItems;
      }

      const items = allItems.data || [];
      const found = items.filter(predicate);

      return {
        success: true,
        data: found,
        message: `Found ${found.length} items`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to find items",
        data: [],
      };
    }
  }

  /**
   * Export all data as JSON string
   */
  async export(): Promise<StorageResponse<string>> {
    try {
      const allItems = await this.getAll();
      if (!allItems.success) {
        return {
          success: false,
          error: allItems.error,
        };
      }

      const jsonString = JSON.stringify(allItems.data, null, 2);

      return {
        success: true,
        data: jsonString,
        message: "Data exported successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to export data",
      };
    }
  }

  /**
   * Import data from JSON string
   */
  async import(
    jsonString: string,
    merge: boolean = false,
  ): Promise<StorageResponse<number>> {
    try {
      const importedItems = JSON.parse(jsonString);

      if (!Array.isArray(importedItems)) {
        return {
          success: false,
          error: "Invalid format: expected an array",
        };
      }

      let finalItems = importedItems;

      if (merge) {
        const existingItems = await this.getAll();
        if (existingItems.success && existingItems.data) {
          // Merge: imported items override existing ones with same ID
          const existingMap = new Map(
            existingItems.data.map((item) => [item.id, item]),
          );

          importedItems.forEach((item) => {
            existingMap.set(item.id, item);
          });

          finalItems = Array.from(existingMap.values());
        }
      }

      // Clear and add all items
      await this.clear();

      const store = await this.getTransaction("readwrite");

      return new Promise((resolve) => {
        let completed = 0;
        let failed = 0;

        finalItems.forEach((item: StorageItem) => {
          const request = store.add(item);

          request.onsuccess = () => {
            completed++;
            if (completed + failed === finalItems.length) {
              resolve({
                success: true,
                data: completed,
                message: `Imported ${completed} items${failed > 0 ? ` (${failed} failed)` : ""}`,
              });
            }
          };

          request.onerror = () => {
            failed++;
            if (completed + failed === finalItems.length) {
              resolve({
                success: failed < finalItems.length,
                data: completed,
                message: `Imported ${completed} items (${failed} failed)`,
                error: failed > 0 ? "Some items failed to import" : undefined,
              });
            }
          };
        });

        // Handle empty array case
        if (finalItems.length === 0) {
          resolve({
            success: true,
            data: 0,
            message: "Imported 0 items",
          });
        }
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to import data",
      };
    }
  }

  /**
   * Batch operations
   */
  async batch<T = any>(
    operations: Array<{
      type: "create" | "update" | "delete" | "upsert";
      id: string;
      data?: T;
      timestamp: number;
    }>,
  ): Promise<
    StorageResponse<{ successful: number; failed: number; results: any[] }>
  > {
    try {
      const results: any[] = [];
      let successful = 0;
      let failed = 0;

      for (const op of operations) {
        let result;

        switch (op.type) {
          case "create":
            result = await this.create(op.id, op.data, op.timestamp);
            break;
          case "update":
            result = await this.update(op.id, op.data || {}, op.timestamp);
            break;
          case "delete":
            result = await this.delete(op.id);
            break;
          case "upsert":
            result = await this.upsert(op.id, op.data, op.timestamp);
            break;
        }

        results.push(result);
        if (result?.success) successful++;
        else failed++;
      }

      return {
        success: true,
        data: { successful, failed, results },
        message: `Batch completed: ${successful} successful, ${failed} failed`,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Batch operation failed",
      };
    }
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Delete the entire database
   */
  async deleteDatabase(): Promise<StorageResponse<boolean>> {
    try {
      this.close();

      return new Promise((resolve) => {
        const request = indexedDB.deleteDatabase(this.dbName);

        request.onsuccess = () => {
          resolve({
            success: true,
            data: true,
            message: "Database deleted successfully",
          });
        };

        request.onerror = () => {
          resolve({
            success: false,
            error: "Failed to delete database",
            data: false,
          });
        };

        request.onblocked = () => {
          resolve({
            success: false,
            error: "Database deletion blocked - close all connections first",
            data: false,
          });
        };
      });
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete database",
        data: false,
      };
    }
  }
}

export const savedSellersStorage = new IndexedDBManager(
  "ebextractor",
  "saved_sellers",
  EBEXTRACTOR_INDEXEDDB_VERSION,
);
export const savedSearchesStorage = new IndexedDBManager(
  "ebextractor",
  "saved_searches",
  EBEXTRACTOR_INDEXEDDB_VERSION,
);
export const savedItemsStorage = new IndexedDBManager(
  "ebextractor",
  "saved_items",
  EBEXTRACTOR_INDEXEDDB_VERSION,
);
export const recentSearchesStorage = new IndexedDBManager(
  "ebextractor",
  "recent_searches",
  EBEXTRACTOR_INDEXEDDB_VERSION,
);
/// with userId

// indexedDBManager.ts
// A generic, type-agnostic IndexedDB manager with consistent response structure

/**
 * Standard response structure for all operations
 */
// export interface StorageResponse<T = any> {
//   success: boolean;
//   data?: T;
//   error?: string;
//   message?: string;
// }

// /**
//  * Stored item wrapper with metadata
//  */
// export interface StorageItem<T = any> {
//   id: string;
//   data: T;
//   createdAt: number;
//   updatedAt: number;
//   userId?: string;
// }

// // Shared database instances and promises per database
// const dbInstances = new Map<string, IDBDatabase>();
// const dbInitPromises = new Map<string, Promise<IDBDatabase>>();
// const storeRegistry = new Map<string, Set<string>>();

// /**
//  * Register a store name for a specific database
//  */
// function registerStore(dbName: string, storeName: string): void {
//   if (!storeRegistry.has(dbName)) {
//     storeRegistry.set(dbName, new Set());
//   }
//   storeRegistry.get(dbName)!.add(storeName);
// }

// /**
//  * Initialize a shared database with all registered stores
//  */
// async function initializeSharedDatabase(
//   dbName: string,
//   version: number,
// ): Promise<IDBDatabase> {
//   // Return existing instance if available
//   if (dbInstances.has(dbName)) {
//     return dbInstances.get(dbName)!;
//   }

//   // Return existing promise if initialization is in progress
//   if (dbInitPromises.has(dbName)) {
//     return dbInitPromises.get(dbName)!;
//   }

//   // Create new initialization promise
//   const initPromise = new Promise<IDBDatabase>((resolve, reject) => {
//     const request = indexedDB.open(dbName, version);

//     request.onerror = () => {
//       dbInitPromises.delete(dbName);
//       reject(new Error(`Failed to open database: ${dbName}`));
//     };

//     request.onsuccess = () => {
//       const db = request.result;
//       dbInstances.set(dbName, db);
//       dbInitPromises.delete(dbName);
//       resolve(db);
//     };

//     request.onupgradeneeded = (event) => {
//       const db = (event.target as IDBOpenDBRequest).result;

//       // Get all registered stores for this database
//       const stores = storeRegistry.get(dbName) || new Set();

//       // Create all registered stores during upgrade
//       stores.forEach((storeName) => {
//         if (!db.objectStoreNames.contains(storeName)) {
//           db.createObjectStore(storeName, { keyPath: "id" });
//         }
//       });
//     };
//   });

//   dbInitPromises.set(dbName, initPromise);
//   return initPromise;
// }

// /**
//  * Generic IndexedDB Manager
//  * Handles any data structure while maintaining consistent response format
//  * @note When creating an Item you need a unique `id` - it is `required`
//  */
// export class IndexedDBManager {
//   private dbName: string;
//   private storeName: string;
//   private version: number;
//   private db: IDBDatabase | null = null;

//   constructor(
//     dbName: string = "app_database",
//     storeName: string = "app_storage",
//     version: number = 1,
//   ) {
//     this.dbName = dbName;
//     this.storeName = storeName;
//     this.version = version;

//     // Register this store for the database
//     registerStore(dbName, storeName);
//   }

//   /**
//    * Initialize the database connection
//    */
//   private async initDB(): Promise<IDBDatabase> {
//     if (this.db) {
//       return this.db;
//     }

//     // Use shared database initialization for all databases
//     this.db = await initializeSharedDatabase(this.dbName, this.version);
//     return this.db;
//   }

//   /**
//    * Get a transaction for the object store
//    */
//   private async getTransaction(
//     mode: IDBTransactionMode = "readonly",
//   ): Promise<IDBObjectStore> {
//     const db = await this.initDB();
//     const transaction = db.transaction([this.storeName], mode);
//     return transaction.objectStore(this.storeName);
//   }

//   /**
//    * Get all items from storage
//    */
//   async getAll<T = any>(
//     userId?: string,
//   ): Promise<StorageResponse<StorageItem<T>[]>> {
//     try {
//       const store = await this.getTransaction("readonly");

//       return new Promise((resolve) => {
//         const request = store.getAll();

//         request.onsuccess = () => {
//           let data = request.result as StorageItem<T>[];

//           // Filter by userId if provided
//           if (userId !== undefined) {
//             data = data.filter((item) => item.userId === userId);
//           }

//           resolve({
//             success: true,
//             data,
//             message: `Retrieved ${data.length} items`,
//           });
//         };

//         request.onerror = () => {
//           resolve({
//             success: false,
//             error: "Failed to retrieve items",
//             data: [],
//           });
//         };
//       });
//     } catch (error) {
//       return {
//         success: false,
//         error:
//           error instanceof Error ? error.message : "Failed to retrieve items",
//         data: [],
//       };
//     }
//   }

//   /**
//    * Get a single item by ID
//    */
//   async getById<T = any>(
//     id: string,
//   ): Promise<StorageResponse<StorageItem<T> | null>> {
//     try {
//       const store = await this.getTransaction("readonly");

//       return new Promise((resolve) => {
//         const request = store.get(id);

//         request.onsuccess = () => {
//           const item = request.result as StorageItem<T> | undefined;
//           resolve({
//             success: true,
//             data: item || null,
//             message: item ? "Item found" : "Item not found",
//           });
//         };

//         request.onerror = () => {
//           resolve({
//             success: false,
//             error: "Failed to get item",
//             data: null,
//           });
//         };
//       });
//     } catch (error) {
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : "Failed to get item",
//         data: null,
//       };
//     }
//   }

//   /**
//    * Check if an item exists
//    */
//   async exists(id: string): Promise<StorageResponse<boolean>> {
//     try {
//       const response = await this.getById(id);
//       const exists = response.data !== null;

//       return {
//         success: true,
//         data: exists,
//         message: exists ? "Item exists" : "Item does not exist",
//       };
//     } catch (error) {
//       return {
//         success: false,
//         error:
//           error instanceof Error ? error.message : "Failed to check existence",
//         data: false,
//       };
//     }
//   }

//   /**
//    * Create/Save a new item with generic data structure
//    */
//   async create<T = any>(
//     id: string,
//     data: T,
//     userId?: string,
//   ): Promise<StorageResponse<StorageItem<T>>> {
//     try {
//       // Check if Data already exists
//       const existsResponse = await this.exists(id);
//       if (existsResponse.data) {
//         return {
//           success: false,
//           error: "Data already exists",
//           message: "Use update() to modify existing items",
//         };
//       }

//       const timestamp = Date.now();
//       const newItem: StorageItem<T> = {
//         id,
//         data,
//         createdAt: timestamp,
//         updatedAt: timestamp,
//         ...(userId !== undefined && { userId }),
//       };

//       const store = await this.getTransaction("readwrite");

//       return new Promise((resolve) => {
//         const request = store.add(newItem);

//         request.onsuccess = () => {
//           resolve({
//             success: true,
//             data: newItem,
//             message: "Item created successfully",
//           });
//         };

//         request.onerror = () => {
//           resolve({
//             success: false,
//             error: "Failed to create item",
//           });
//         };
//       });
//     } catch (error) {
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : "Failed to create item",
//       };
//     }
//   }

//   /**
//    * Update an existing item (partial or full update)
//    */
//   async update<T = any>(
//     id: string,
//     data: Partial<T>,
//     userId?: string,
//   ): Promise<StorageResponse<StorageItem<T>>> {
//     try {
//       const existingResponse = await this.getById<T>(id);

//       if (!existingResponse.success || !existingResponse.data) {
//         return {
//           success: false,
//           error: "Item not found",
//           message: "Use create() for new items",
//         };
//       }

//       const existingItem = existingResponse.data;

//       // Merge existing data with updates
//       const updatedItem: StorageItem<T> = {
//         ...existingItem,
//         data: { ...existingItem.data, ...data },
//         updatedAt: Date.now(),
//         ...(userId !== undefined && { userId }),
//       };

//       const store = await this.getTransaction("readwrite");

//       return new Promise((resolve) => {
//         const request = store.put(updatedItem);

//         request.onsuccess = () => {
//           resolve({
//             success: true,
//             data: updatedItem,
//             message: "Item updated successfully",
//           });
//         };

//         request.onerror = () => {
//           resolve({
//             success: false,
//             error: "Failed to update item",
//           });
//         };
//       });
//     } catch (error) {
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : "Failed to update item",
//       };
//     }
//   }

//   /**
//    * Replace entire item data (not partial update)
//    */
//   async replace<T = any>(
//     id: string,
//     data: T,
//     userId?: string,
//   ): Promise<StorageResponse<StorageItem<T>>> {
//     try {
//       const existingResponse = await this.getById<T>(id);

//       if (!existingResponse.success || !existingResponse.data) {
//         return {
//           success: false,
//           error: "Item not found",
//           message: "Use create() for new items",
//         };
//       }

//       const replacedItem: StorageItem<T> = {
//         id,
//         data,
//         createdAt: existingResponse.data.createdAt,
//         updatedAt: Date.now(),
//         ...(userId !== undefined && { userId }),
//       };

//       const store = await this.getTransaction("readwrite");

//       return new Promise((resolve) => {
//         const request = store.put(replacedItem);

//         request.onsuccess = () => {
//           resolve({
//             success: true,
//             data: replacedItem,
//             message: "Item replaced successfully",
//           });
//         };

//         request.onerror = () => {
//           resolve({
//             success: false,
//             error: "Failed to replace item",
//           });
//         };
//       });
//     } catch (error) {
//       return {
//         success: false,
//         error:
//           error instanceof Error ? error.message : "Failed to replace item",
//       };
//     }
//   }

//   /**
//    * Delete an item by ID
//    */
//   async delete(id: string): Promise<StorageResponse<string>> {
//     try {
//       const existsResponse = await this.exists(id);

//       if (!existsResponse.data) {
//         return {
//           success: false,
//           error: "Item not found",
//           message: "No item was deleted",
//         };
//       }

//       const store = await this.getTransaction("readwrite");

//       return new Promise((resolve) => {
//         const request = store.delete(id);

//         request.onsuccess = () => {
//           resolve({
//             success: true,
//             data: id,
//             message: "Item deleted successfully",
//           });
//         };

//         request.onerror = () => {
//           resolve({
//             success: false,
//             error: "Failed to delete item",
//           });
//         };
//       });
//     } catch (error) {
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : "Failed to delete item",
//       };
//     }
//   }

//   /**
//    * Upsert: Create if doesn't exist, update if exists
//    */
//   async upsert<T = any>(
//     id: string,
//     data: T,
//     userId?: string,
//   ): Promise<StorageResponse<StorageItem<T>>> {
//     const existsResponse = await this.exists(id);

//     if (existsResponse.data) {
//       return this.replace(id, data, userId);
//     } else {
//       return this.create(id, data, userId);
//     }
//   }

//   /**
//    * Clear all items (optionally for a specific user)
//    */
//   async clear(userId?: string): Promise<StorageResponse<number>> {
//     try {
//       if (userId !== undefined) {
//         // Delete only items for specific user
//         const allItems = await this.getAll(userId);
//         const itemsToDelete = allItems.data || [];

//         let deleted = 0;
//         for (const item of itemsToDelete) {
//           const result = await this.delete(item.id);
//           if (result.success) deleted++;
//         }

//         return {
//           success: true,
//           data: deleted,
//           message: `Cleared ${deleted} items for user ${userId}`,
//         };
//       }

//       // Clear all items
//       const allItems = await this.getAll();
//       const count = allItems.data?.length || 0;

//       const store = await this.getTransaction("readwrite");

//       return new Promise((resolve) => {
//         const request = store.clear();

//         request.onsuccess = () => {
//           resolve({
//             success: true,
//             data: count,
//             message: `Cleared ${count} items`,
//           });
//         };

//         request.onerror = () => {
//           resolve({
//             success: false,
//             error: "Failed to clear storage",
//           });
//         };
//       });
//     } catch (error) {
//       return {
//         success: false,
//         error:
//           error instanceof Error ? error.message : "Failed to clear storage",
//       };
//     }
//   }

//   /**
//    * Get count of items (optionally for a specific user)
//    */
//   async count(userId?: string): Promise<StorageResponse<number>> {
//     try {
//       if (userId !== undefined) {
//         const items = await this.getAll(userId);
//         const count = items.data?.length || 0;
//         return {
//           success: true,
//           data: count,
//           message: `Total items for user ${userId}: ${count}`,
//         };
//       }

//       const store = await this.getTransaction("readonly");

//       return new Promise((resolve) => {
//         const request = store.count();

//         request.onsuccess = () => {
//           const count = request.result;
//           resolve({
//             success: true,
//             data: count,
//             message: `Total items: ${count}`,
//           });
//         };

//         request.onerror = () => {
//           resolve({
//             success: false,
//             error: "Failed to count items",
//             data: 0,
//           });
//         };
//       });
//     } catch (error) {
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : "Failed to count items",
//         data: 0,
//       };
//     }
//   }

//   /**
//    * Find items by custom predicate function
//    */
//   async find<T = any>(
//     predicate: (item: StorageItem<T>) => boolean,
//     userId?: string,
//   ): Promise<StorageResponse<StorageItem<T>[]>> {
//     try {
//       const allItems = await this.getAll<T>(userId);
//       if (!allItems.success) {
//         return allItems;
//       }

//       const items = allItems.data || [];
//       const found = items.filter(predicate);

//       return {
//         success: true,
//         data: found,
//         message: `Found ${found.length} items`,
//       };
//     } catch (error) {
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : "Failed to find items",
//         data: [],
//       };
//     }
//   }

//   /**
//    * Export all data as JSON string (optionally for a specific user)
//    */
//   async export(userId?: string): Promise<StorageResponse<string>> {
//     try {
//       const allItems = await this.getAll(userId);
//       if (!allItems.success) {
//         return {
//           success: false,
//           error: allItems.error,
//         };
//       }

//       const jsonString = JSON.stringify(allItems.data, null, 2);

//       return {
//         success: true,
//         data: jsonString,
//         message: "Data exported successfully",
//       };
//     } catch (error) {
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : "Failed to export data",
//       };
//     }
//   }

//   /**
//    * Import data from JSON string
//    */
//   async import(
//     jsonString: string,
//     merge: boolean = false,
//   ): Promise<StorageResponse<number>> {
//     try {
//       const importedItems = JSON.parse(jsonString);

//       if (!Array.isArray(importedItems)) {
//         return {
//           success: false,
//           error: "Invalid format: expected an array",
//         };
//       }

//       let finalItems = importedItems;

//       if (merge) {
//         const existingItems = await this.getAll();
//         if (existingItems.success && existingItems.data) {
//           // Merge: imported items override existing ones with same ID
//           const existingMap = new Map(
//             existingItems.data.map((item) => [item.id, item]),
//           );

//           importedItems.forEach((item) => {
//             existingMap.set(item.id, item);
//           });

//           finalItems = Array.from(existingMap.values());
//         }
//       }

//       // Clear and add all items
//       await this.clear();

//       const store = await this.getTransaction("readwrite");

//       return new Promise((resolve) => {
//         let completed = 0;
//         let failed = 0;

//         finalItems.forEach((item: StorageItem) => {
//           const request = store.add(item);

//           request.onsuccess = () => {
//             completed++;
//             if (completed + failed === finalItems.length) {
//               resolve({
//                 success: true,
//                 data: completed,
//                 message: `Imported ${completed} items${failed > 0 ? ` (${failed} failed)` : ""}`,
//               });
//             }
//           };

//           request.onerror = () => {
//             failed++;
//             if (completed + failed === finalItems.length) {
//               resolve({
//                 success: failed < finalItems.length,
//                 data: completed,
//                 message: `Imported ${completed} items (${failed} failed)`,
//                 error: failed > 0 ? "Some items failed to import" : undefined,
//               });
//             }
//           };
//         });

//         // Handle empty array case
//         if (finalItems.length === 0) {
//           resolve({
//             success: true,
//             data: 0,
//             message: "Imported 0 items",
//           });
//         }
//       });
//     } catch (error) {
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : "Failed to import data",
//       };
//     }
//   }

//   /**
//    * Batch operations
//    */
//   async batch<T = any>(
//     operations: Array<{
//       type: "create" | "update" | "delete" | "upsert";
//       id: string;
//       data?: T;
//       userId?: string;
//     }>,
//   ): Promise<
//     StorageResponse<{ successful: number; failed: number; results: any[] }>
//   > {
//     try {
//       const results: any[] = [];
//       let successful = 0;
//       let failed = 0;

//       for (const op of operations) {
//         let result;

//         switch (op.type) {
//           case "create":
//             result = await this.create(op.id, op.data, op.userId);
//             break;
//           case "update":
//             result = await this.update(op.id, op.data || {}, op.userId);
//             break;
//           case "delete":
//             result = await this.delete(op.id);
//             break;
//           case "upsert":
//             result = await this.upsert(op.id, op.data, op.userId);
//             break;
//         }

//         results.push(result);
//         if (result?.success) successful++;
//         else failed++;
//       }

//       return {
//         success: true,
//         data: { successful, failed, results },
//         message: `Batch completed: ${successful} successful, ${failed} failed`,
//       };
//     } catch (error) {
//       return {
//         success: false,
//         error:
//           error instanceof Error ? error.message : "Batch operation failed",
//       };
//     }
//   }

//   /**
//    * Close the database connection
//    */
//   close(): void {
//     if (this.db) {
//       this.db.close();
//       this.db = null;
//     }
//   }

//   /**
//    * Delete the entire database
//    */
//   async deleteDatabase(): Promise<StorageResponse<boolean>> {
//     try {
//       this.close();

//       return new Promise((resolve) => {
//         const request = indexedDB.deleteDatabase(this.dbName);

//         request.onsuccess = () => {
//           resolve({
//             success: true,
//             data: true,
//             message: "Database deleted successfully",
//           });
//         };

//         request.onerror = () => {
//           resolve({
//             success: false,
//             error: "Failed to delete database",
//             data: false,
//           });
//         };

//         request.onblocked = () => {
//           resolve({
//             success: false,
//             error: "Database deletion blocked - close all connections first",
//             data: false,
//           });
//         };
//       });
//     } catch (error) {
//       return {
//         success: false,
//         error:
//           error instanceof Error ? error.message : "Failed to delete database",
//         data: false,
//       };
//     }
//   }
// }

// export const savedSellersStorage = new IndexedDBManager(
//   "ebextractor",
//   "saved_sellers",
// );
// export const savedSearchesStorage = new IndexedDBManager(
//   "ebextractor",
//   "saved_searches",
// );
// export const savedItemsStorage = new IndexedDBManager(
//   "ebextractor",
//   "saved_items",
// );
