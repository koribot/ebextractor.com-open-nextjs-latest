import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getDB(dbName: keyof CloudflareEnv) {
  const {env} = await getCloudflareContext({ async: true });
  const db =env[dbName] as D1Database;
  return db;
}
