PRAGMA defer_foreign_keys=TRUE;

DROP TABLE IF EXISTS "SavedItems";
CREATE TABLE "SavedItems" (
    id TEXT PRIMARY KEY NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    userId TEXT NOT NULL,
    data TEXT NOT NULL  
);

CREATE INDEX idx_saveditems_userId ON "SavedItems"(userId);
CREATE INDEX idx_saveditems_createdAt ON "SavedItems"(createdAt);

DROP TABLE IF EXISTS "SavedSearches";
CREATE TABLE "SavedSearches" (
    id TEXT PRIMARY KEY NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    userId TEXT NOT NULL,
    data TEXT NOT NULL  
);

CREATE INDEX idx_savedsearches_userId ON "SavedSearches"(userId);
CREATE INDEX idx_savedsearches_createdAt ON "SavedSearches"(createdAt);

DROP TABLE IF EXISTS "SavedSellers";
CREATE TABLE "SavedSellers" (
    id TEXT PRIMARY KEY NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    userId TEXT NOT NULL,
    data TEXT NOT NULL  
);

CREATE INDEX idx_savedsellers_userId ON "SavedSellers"(userId);
CREATE INDEX idx_savedsellers_createdAt ON "SavedSellers"(createdAt);