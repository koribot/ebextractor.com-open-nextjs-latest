import {
  MySavedMethod,
  SavedItemData,
  SavedSearchesData,
  SavedSellerData,
} from "@/app/model/MySaved";
import { getDB } from "./get-database";
import { DB_NAMES } from "./db-name";
import { logger } from "@/app/utils/logger";

interface MySaved {
  method: MySavedMethod;
  id?: string;
  createdAt?: number;
  updatedAt?: number;
  userId: string;
  data?:
    | Partial<SavedItemData>
    | Partial<SavedSellerData>
    | Partial<SavedSearchesData>;
}

interface MySavedResponse {
  success: boolean;
  d1Data?: any;
  error?: string;
  message?: string;
}

// Table configuration
const TABLES = {
  ITEMS: "SavedItems",
  SELLERS: "SavedSellers",
  SEARCHES: "SavedSearches",
} as const;

type TableName = (typeof TABLES)[keyof typeof TABLES];

// Validation helpers
const validateAddFromData = ({
  id,
  createdAt,
  updatedAt,
  data,
}: {
  id?: string;
  createdAt?: number;
  updatedAt?: number;
  data?: any;
}):
  | { valid: false; message: string }
  | {
      valid: true;
      id: string;
      createdAt: number;
      updatedAt: number;
      data: any;
    } => {
  if (!id || !createdAt || !updatedAt || typeof data !== "object") {
    return {
      valid: false,
      message: "data object must contain id, createdAt, updatedAt, and data",
    };
  }
  return { valid: true, id, createdAt, updatedAt, data };
};

const validateId = (
  id?: any,
): { valid: false; message: string } | { valid: true; id: string } => {
  if (!id) {
    return { valid: false, message: "id is required for deletion" };
  }
  return { valid: true, id };
};

type ValidationResult<T extends Record<string, unknown>> = {
  fields: {
    [K in keyof T]: {
      valid: boolean;
      data: T[K];
      message?: string;
    };
  };
  overallValidity: boolean;
  overallMessage?: string;
};
export const validate = <T extends Record<string, unknown>>(
  input: T,
): ValidationResult<T> => {
  const keys = Object.keys(input);
  if (keys.length === 0) {
    return {
      fields: {} as ValidationResult<T>["fields"],
      overallValidity: false,
      overallMessage: "No fields provided",
    };
  }

  const fields = {} as ValidationResult<T>["fields"];
  let overallValidity = true;
  const invalidFields: string[] = [];

  for (const key of keys) {
    const typedKey = key as keyof T;
    const value = input[typedKey];

    let valid = true;
    let message = "";

    if (value === undefined) {
      valid = false;
      message = `${String(key)} is undefined`;
    } else if (value === null) {
      valid = false;
      message = `${String(key)} is null`;
    } else if (typeof value === "string" && value.trim() === "") {
      valid = false;
      message = `${String(key)} cannot be empty`;
    } else if (Array.isArray(value) && value.length === 0) {
      valid = false;
      message = `${String(key)} cannot be an empty array`;
    } else if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    ) {
      valid = false;
      message = `${String(key)} cannot be an empty object`;
    }

    fields[typedKey] = {
      valid,
      data: value,
      message: valid ? undefined : message,
    };

    if (!valid) {
      overallValidity = false;
      invalidFields.push(String(key));
    }
  }

  return {
    fields,
    overallValidity,
    overallMessage: overallValidity
      ? undefined
      : `Validation failed for: ${invalidFields.join(", ")}`,
  };
};
// Generic database operations
const addSavedRecord = async (
  db: D1Database,
  table: TableName,
  id: string,
  createdAt: number,
  updatedAt: number,
  userId: string,
  data: any,
) => {
  return db
    .prepare(
      `
      INSERT INTO ${table} (id, createdAt, updatedAt, userId, data)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        data = excluded.data,
        updatedAt = excluded.updatedAt
    `,
    )
    .bind(id, createdAt, updatedAt, userId, JSON.stringify(data))
    .run();
};

const deleteSavedRecord = async (
  db: D1Database,
  table: TableName,
  id: string,
  userId: string,
) => {
  logger.debug.log("deleteSavedRecord", { id, userId, table });
  return db
    .prepare(`DELETE FROM ${table} WHERE id = ? AND userId = ?`)
    .bind(id, userId)
    .run();
};

const updateNoteRecord = async ({
  db,
  table,
  id,
  noteText,
}: {
  db: D1Database;
  table: TableName;
  id: string;
  noteText: string;
}) => {
  const updatedAt = Date.now(); // unix ms

  return db
    .prepare(
      `
      UPDATE ${table}
      SET 
        data = json_set(data, '$.note', ?),
        updatedAt = ?
      WHERE id = ?
    `,
    )
    .bind(noteText, updatedAt, id)
    .run();
};

const getSavedRecords = async (
  db: D1Database,
  table: TableName,
  userId: string,
) => {
  return db
    .prepare(`SELECT * FROM ${table} WHERE userId = ?`)
    .bind(userId)
    .all();
};

const deleteAllFromTable = async (
  db: D1Database,
  table: TableName,
  userId: string,
) => {
  return db.prepare(`DELETE FROM ${table} WHERE userId = ?`).bind(userId).run();
};

const getAllMySaved = async (db: D1Database, userId: string) => {
  return db
    .prepare(
      `
      SELECT id, createdAt, updatedAt, userId, data, 'item' as type FROM ${TABLES.ITEMS} WHERE userId = ?
      UNION ALL
      SELECT id, createdAt, updatedAt, userId, data, 'seller' as type FROM ${TABLES.SELLERS} WHERE userId = ?
      UNION ALL
      SELECT id, createdAt, updatedAt, userId, data, 'search' as type FROM ${TABLES.SEARCHES} WHERE userId = ?
      ORDER BY createdAt DESC
    `,
    )
    .bind(userId, userId, userId)
    .all();
};

// Main function
export const my_saved_engine = async ({
  method,
  userId,
  data,
  id,
  createdAt,
  updatedAt,
}: MySaved): Promise<MySavedResponse> => {
  try {
    const db: D1Database = await getDB(DB_NAMES.EBEXTRACTOR_MY_SAVED_DB);

    // Route to appropriate handler

    switch (method) {
      case MySavedMethod.ADD_SAVED_ITEMS: {
        const validation = validateAddFromData({
          id,
          createdAt,
          updatedAt,
          data,
        });
        if (!validation.valid) {
          return { success: false, error: validation.message };
        }
        const result = await addSavedRecord(
          db,
          TABLES.ITEMS,
          validation.id,
          validation.createdAt,
          validation.updatedAt,
          userId,
          validation.data,
        );
        return { success: result.success, d1Data: result };
      }

      case MySavedMethod.DELETE_SAVED_ITEMS: {
        const validation = validateId(id);
        if (!validation.valid) {
          return { success: false, error: validation.message };
        }
        const result = await deleteSavedRecord(
          db,
          TABLES.ITEMS,
          validation.id,
          userId,
        );
        return { success: result.success, d1Data: result };
      }

      case MySavedMethod.GET_SAVED_ITEMS: {
        const result = await getSavedRecords(db, TABLES.ITEMS, userId);
        return { success: result.success, d1Data: result.results };
      }

      case MySavedMethod.ADD_SAVED_SELLERS: {
        const validation = validateAddFromData({
          id,
          createdAt,
          updatedAt,
          data,
        });
        if (!validation.valid) {
          return { success: false, error: validation.message };
        }
        const result = await addSavedRecord(
          db,
          TABLES.SELLERS,
          validation.id,
          validation.createdAt,
          validation.updatedAt,
          userId,
          validation.data,
        );
        return { success: result.success, d1Data: result };
      }

      case MySavedMethod.DELETE_SAVED_SELLERS: {
        const validation = validateId(id);
        if (!validation.valid) {
          return { success: false, error: validation.message };
        }
        const result = await deleteSavedRecord(
          db,
          TABLES.SELLERS,
          validation.id,
          userId,
        );
        return { success: result.success, d1Data: result };
      }

      case MySavedMethod.GET_SAVED_SELLERS: {
        const result = await getSavedRecords(db, TABLES.SELLERS, userId);
        return { success: result.success, d1Data: result.results };
      }

      case MySavedMethod.ADD_SAVED_SEARCHES: {
        const validation = validateAddFromData({
          id: id,
          createdAt: createdAt,
          updatedAt: updatedAt,
          data: data,
        });
        if (!validation.valid) {
          return { success: false, error: validation.message };
        }
        const result = await addSavedRecord(
          db,
          TABLES.SEARCHES,
          validation.id,
          validation.createdAt,
          validation.updatedAt,
          userId,
          validation.data,
        );
        return { success: result.success, d1Data: result };
      }

      case MySavedMethod.DELETE_SAVED_SEARCHES: {
        const validation = validateId(id);
        if (!validation.valid) {
          return { success: false, error: validation.message };
        }
        const result = await deleteSavedRecord(
          db,
          TABLES.SEARCHES,
          validation.id,
          userId,
        );
        return { success: result.success, d1Data: result };
      }

      case MySavedMethod.GET_SAVED_SEARCHES: {
        const result = await getSavedRecords(db, TABLES.SEARCHES, userId);
        return { success: result.success, d1Data: result.results };
      }

      case MySavedMethod.DELETE_ALL_SAVED_ITEMS: {
        const result = await deleteAllFromTable(db, TABLES.ITEMS, userId);
        return { success: result.success, d1Data: result };
      }

      case MySavedMethod.DELETE_ALL_SAVED_SELLERS: {
        const result = await deleteAllFromTable(db, TABLES.SELLERS, userId);
        return { success: result.success, d1Data: result };
      }

      case MySavedMethod.DELETE_ALL_SAVED_SEARCHES: {
        const result = await deleteAllFromTable(db, TABLES.SEARCHES, userId);
        return { success: result.success, d1Data: result };
      }

      case MySavedMethod.GET_ALL_MY_SAVED: {
        const result = await getAllMySaved(db, userId);
        return { success: result.success, d1Data: result.results };
      }

      case MySavedMethod.UPDATE_NOTE_ITEMS: {
        if (!id || !data || !data.note) {
          return { success: false, error: "Invalid data or id", d1Data: null };
        }
        const result = await updateNoteRecord({
          db,
          table: TABLES.ITEMS,
          id: id,
          noteText: data.note || "",
        });
        return { success: result.success, d1Data: result };
      }
      case MySavedMethod.UPDATE_NOTE_SELLERS: {
        if (!id || !data || typeof(data.note) !== "string") {
          return { success: false, error: "Invalid data or id", d1Data: null };
        }
        const result = await updateNoteRecord({
          db,
          table: TABLES.SELLERS,
          id: id,
          noteText: data.note || "",
        });
        return { success: result.success, d1Data: result };
      }
      case MySavedMethod.UPDATE_NOTE_SEARCHES: {
        if (!id || !data || !data.note) {
          return { success: false, error: "Invalid data or id", d1Data: null };
        }
        const result = await updateNoteRecord({
          db,
          table: TABLES.SEARCHES,
          id: id,
          noteText: data.note || "",
        });
        return { success: result.success, d1Data: result };
      }

      default:
        return {
          success: false,
          error: `Invalid method: ${method}`,
        };
    }
  } catch (error) {
    logger.debug.error("Database operation failed", { method, userId, error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
