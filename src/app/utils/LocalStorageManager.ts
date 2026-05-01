// localStorageManager.ts
// A generic, type-agnostic localStorage manager with fixed transaction responses

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
export interface StorageItem<T = any> {
  id: string;
  value: T;
  createdAt: number;
  updatedAt: number;
}

/**
 * Generic LocalStorage Manager
 * Handles any data structure while maintaining consistent response format
 * @note When creating an Item you need an unique `id` it is `required`
 */
export class LocalStorageManager {
  private storageKey: string;

  constructor(storageKey: string = "app_storage") {
    this.storageKey = storageKey;
  }

  /**
   * Get all items from storage
   */
  getAll<T = any>(): StorageResponse<StorageItem<T>[]> {
    try {
      const items = localStorage.getItem(this.storageKey);
      const data = items ? JSON.parse(items) : [];

      return {
        success: true,
        data,
        message: `Retrieved ${data.length} items`,
      };
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
  getById<T = any>(id: string): StorageResponse<StorageItem<T> | null> {
    try {
      const response = this.getAll<T>();
      if (!response.success) {
        return {
          success: false,
          error: response.error,
          data: null,
        };
      }

      const item = response.data?.find((item) => item.id === id) || null;

      return {
        success: true,
        data: item,
        message: item ? "Item found" : "Item not found",
      };
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
  exists(id: string): StorageResponse<boolean> {
    try {
      const response = this.getById(id);
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
  create<T = any>(id: string, data: T): StorageResponse<StorageItem<T>> {
    try {
      const allItems = this.getAll<T>();
      if (!allItems.success) {
        return {
          success: false,
          error: allItems.error,
        };
      }

      // Check if item already exists
      const existsResponse = this.exists(id);
      if (existsResponse.data) {
        return {
          success: false,
          error: "Item already exists",
          message: "Use update() to modify existing items",
        };
      }

      const timestamp = Date.now();
      const newItem: StorageItem<T> = {
        id,
        value: data,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const items = allItems.data || [];
      items.push(newItem);

      localStorage.setItem(this.storageKey, JSON.stringify(items));

      return {
        success: true,
        data: newItem,
        message: "Item created successfully",
      };
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
  update<T = any>(
    id: string,
    data: Partial<T>,
  ): StorageResponse<StorageItem<T>> {
    try {
      const allItems = this.getAll<T>();
      if (!allItems.success) {
        return {
          success: false,
          error: allItems.error,
        };
      }

      const items = allItems.data || [];
      const index = items.findIndex((item) => item.id === id);

      if (index === -1) {
        return {
          success: false,
          error: "Item not found",
          message: "Use create() for new items",
        };
      }

      // Merge existing data with updates
      const updatedItem: StorageItem<T> = {
        ...items[index],
        value: { ...items[index].value, ...data },
        updatedAt: Date.now(),
      };

      items[index] = updatedItem;
      localStorage.setItem(this.storageKey, JSON.stringify(items));

      return {
        success: true,
        data: updatedItem,
        message: "Item updated successfully",
      };
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
  replace<T = any>(id: string, data: T): StorageResponse<StorageItem<T>> {
    try {
      const allItems = this.getAll<T>();
      if (!allItems.success) {
        return {
          success: false,
          error: allItems.error,
        };
      }

      const items = allItems.data || [];
      const index = items.findIndex((item) => item.id === id);

      if (index === -1) {
        return {
          success: false,
          error: "Item not found",
          message: "Use create() for new items",
        };
      }

      const replacedItem: StorageItem<T> = {
        id,
        value: data,
        createdAt: items[index].createdAt,
        updatedAt: Date.now(),
      };

      items[index] = replacedItem;
      localStorage.setItem(this.storageKey, JSON.stringify(items));

      return {
        success: true,
        data: replacedItem,
        message: "Item replaced successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to replace item",
      };
    }
  }

  /**
   * Delete an item by ID
   */
  delete(id: string): StorageResponse<string> {
    try {
      const allItems = this.getAll();
      if (!allItems.success) {
        return {
          success: false,
          error: allItems.error,
        };
      }

      const items = allItems.data || [];
      const filteredItems = items.filter((item) => item.id !== id);

      if (filteredItems.length === items.length) {
        return {
          success: false,
          error: "Item not found",
          message: "No item was deleted",
        };
      }

      localStorage.setItem(this.storageKey, JSON.stringify(filteredItems));

      return {
        success: true,
        data: id,
        message: "Item deleted successfully",
      };
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
  upsert<T = any>(id: string, data: T): StorageResponse<StorageItem<T>> {
    const existsResponse = this.exists(id);

    if (existsResponse.data) {
      return this.replace(id, data);
    } else {
      return this.create(id, data);
    }
  }

  /**
   * Clear all items
   */
  clear(): StorageResponse<number> {
    try {
      const allItems = this.getAll();
      const count = allItems.data?.length || 0;

      localStorage.removeItem(this.storageKey);

      return {
        success: true,
        data: count,
        message: `Cleared ${count} items`,
      };
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
  count(): StorageResponse<number> {
    try {
      const allItems = this.getAll();
      const count = allItems.data?.length || 0;

      return {
        success: true,
        data: count,
        message: `Total items: ${count}`,
      };
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
  find<T = any>(
    predicate: (item: StorageItem<T>) => boolean,
  ): StorageResponse<StorageItem<T>[]> {
    try {
      const allItems = this.getAll<T>();
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
  export(): StorageResponse<string> {
    try {
      const allItems = this.getAll();
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
  import(jsonString: string, merge: boolean = false): StorageResponse<number> {
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
        const existingItems = this.getAll();
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

      localStorage.setItem(this.storageKey, JSON.stringify(finalItems));

      return {
        success: true,
        data: finalItems.length,
        message: `Imported ${finalItems.length} items`,
      };
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
  batch<T = any>(
    operations: Array<{
      type: "create" | "update" | "delete" | "upsert";
      id: string;
      data?: T;
    }>,
  ): StorageResponse<{ successful: number; failed: number; results: any[] }> {
    try {
      const results: any[] = [];
      let successful = 0;
      let failed = 0;

      operations.forEach((op) => {
        let result;

        switch (op.type) {
          case "create":
            result = this.create(op.id, op.data);
            break;
          case "update":
            result = this.update(op.id, op.data || {});
            break;
          case "delete":
            result = this.delete(op.id);
            break;
          case "upsert":
            result = this.upsert(op.id, op.data);
            break;
        }

        results.push(result);
        if (result?.success) successful++;
        else failed++;
      });

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
}

export const usidStorageLocalStorage = new LocalStorageManager("usid");

// React Hook for generic storage
// export function useLocalStorage<T = any>(storageKey: string = 'app_storage') {
//   const [storage] = useState(() => new LocalStorageManager(storageKey));
//   const [items, setItems] = useState<StorageItem<T>[]>([]);
//   const [isLoaded, setIsLoaded] = useState(false);

//   useEffect(() => {
//     const response = storage.getAll<T>();
//     if (response.success && response.data) {
//       setItems(response.data);
//     }
//     setIsLoaded(true);
//   }, [storage]);

//   const refresh = useCallback(() => {
//     const response = storage.getAll<T>();
//     if (response.success && response.data) {
//       setItems(response.data);
//     }
//   }, [storage]);

//   const create = useCallback((id: string, data: T) => {
//     const response = storage.create(id, data);
//     if (response.success) {
//       refresh();
//     }
//     return response;
//   }, [storage, refresh]);

//   const update = useCallback((id: string, data: Partial<T>) => {
//     const response = storage.update(id, data);
//     if (response.success) {
//       refresh();
//     }
//     return response;
//   }, [storage, refresh]);

//   const remove = useCallback((id: string) => {
//     const response = storage.delete(id);
//     if (response.success) {
//       refresh();
//     }
//     return response;
//   }, [storage, refresh]);

//   const upsert = useCallback((id: string, data: T) => {
//     const response = storage.upsert(id, data);
//     if (response.success) {
//       refresh();
//     }
//     return response;
//   }, [storage, refresh]);

//   const clear = useCallback(() => {
//     const response = storage.clear();
//     if (response.success) {
//       setItems([]);
//     }
//     return response;
//   }, [storage]);

//   return {
//     items,
//     isLoaded,
//     storage,
//     create,
//     update,
//     remove,
//     upsert,
//     clear,
//     refresh,
//     count: items.length
//   };
// }
