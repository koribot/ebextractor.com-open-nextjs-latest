PRAGMA defer_foreign_keys=TRUE;
DROP TABLE IF EXISTS "Search_Analytics_Table";
CREATE TABLE "Search_Analytics_Table" (
    "id" integer PRIMARY KEY AUTOINCREMENT,
    "user_id" text default null,
    "user_email" text default null,
    "avatar" text default null,
    "created_at" text,
    "data" text,
    "location" text,
    "is_anonymous" text,
    "user_agent" text
);
