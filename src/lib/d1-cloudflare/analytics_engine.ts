import { NextRequest } from "next/server";
import { getDB } from "./get-database";
import { DB_NAMES } from "./db-name";
import { createClientServer } from "../supabase/server";
import { logger } from "@/app/utils/logger";
interface Location {
  status: string;
  country: string;
  region: string;
  regionCode: string;
  city: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  timezone: string;
  continent: string;
  metroCode: string;
  query: string;
}
// function sanitizeQueryParam(value: string | null): string {
//   if (!value) return "";

//   // First remove control characters that should never be in search queries
//   const cleaned = value
//     .trim()
//     .replaceAll(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
//     .replaceAll(/[\n\r\/\\]/g, "") // Remove newlines, carriage returns, forward/back slashes
//     .replaceAll(/&/g, "and") // Replace & with 'and'
//     .replaceAll(/\s+/g, " ") // Replace multiple spaces with single space
//     .trim();

//   // URL encode the cleaned string to handle special characters safely
//   // This will encode &, <, >, ', ", spaces, and other special chars properly
//   return cleaned;
// }
export async function ebextractor_analytics_engine({
  req,
  additionalFields = {},
}: {
  req: NextRequest;
  additionalFields?: { [key: string]: any };
}): Promise<boolean> {
  try {
    const db: D1Database = await getDB(DB_NAMES.EBEXTRACTOR_ANALYTICS_DB);
    const params = new URLSearchParams(req.nextUrl.searchParams.toString());
    // const cleanedQuery = sanitizeQueryParam(query);
    // const base64Query = btoa(additionalFields.q); // to avoid d1 issues
    // params.set("q", additionalFields.q);

    // logger.debug.log({
    //   message: "ebextractor_analytics_engine",
    //   base64Query
    // })

    // cf-ipcity: The visitor's city (value from the ip.src.city field).
    // cf-ipcountry: The visitor's country (value from the ip.src.country field).
    // cf-ipcontinent: The visitor's continent (value from the ip.src.continent field).
    // cf-iplongitude: The visitor's longitude (value from the ip.src.lon field).
    // cf-iplatitude: The visitor's latitude (value from the ip.src.lat field).
    // cf-region: The visitor's region (value from the ip.src.region field).
    // cf-region-code: The visitor's region code (value from the ip.src.region_code field).
    // cf-metro-code: The visitor's metro code (value from the ip.src.metro_code field).
    // cf-postal-code: The visitor's postal code (value from the ip.src.postal_code field).
    // cf-timezone:
    const supabase = await createClientServer();
    const user = await supabase.auth.getUser();
    const referer = req.headers.get("referer") || "";
    const userIP =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for") || 
      req.headers.get("true-client-ip") ||
      "unknown";
    const userCountry = req.headers.get("cf-ipcountry") || "unknown";
    const userRegion = req.headers.get("cf-region") || "unknown";
    const userRegionCode = req.headers.get("cf-region-code") || "unknown";
    const userCity = req.headers.get("cf-ipcity") || "unknown";
    const userPostalCode = req.headers.get("cf-postal-code") || "unknown";
    const userLatitude = req.headers.get("cf-iplatitude") || "unknown";
    const userLongitude = req.headers.get("cf-iplongitude") || "unknown";
    const userTimezone = req.headers.get("cf-timezone") || "unknown";
    const userContinent = req.headers.get("cf-ipcontinent") || "unknown";
    const userMetroCode = req.headers.get("cf-metro-code") || "unknown";
 

    Object.entries(additionalFields).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    const listOfParamsInTheFormOfObject = Object.fromEntries(params.entries());
    listOfParamsInTheFormOfObject.referer = referer;
    logger.debug.log({
      message: "ebextractor_analytics_engine",
      listOfParamsInTheFormOfObject: JSON.stringify(
        listOfParamsInTheFormOfObject
      ),
    });

    const ipDetailsJson: Location =
      process.env.NODE_ENV === "development"
        ? {
            status: "success",
            country: "Test Country",
            region: "TR",
            regionCode: "TR",
            city: "Test City",
            postalCode: "12345",
            latitude: "0.0",
            longitude: "0.0",
            timezone: "UTC",
            continent: "Test Continent",
            metroCode: "123",
            query: "127.0.0.1",
          }
        : {
          status: "success",
          country: userCountry,
          region: userRegion,
          regionCode: userRegionCode,
          city: userCity,
          postalCode: userPostalCode,
          latitude: userLatitude,
          longitude: userLongitude,
          timezone: userTimezone,
          continent: userContinent,
          metroCode: userMetroCode,
          query: userIP
        };

    const userAgent = req.headers.get("user-agent") || "";
    const currentTime = new Date().toISOString();

    const userId = user.data.user?.id || null;
    const userEmail = user.data.user?.email || null;
    const avatar = user.data.user?.user_metadata.avatar_url || null;
    const isAnonymous = userId ? "false" : "true";
    const strigifyParams = JSON.stringify(listOfParamsInTheFormOfObject);
    logger.debug.log({
      message: "ebextractor_analytics_engine",
      strigifyParams,
    });
    const location = JSON.stringify(ipDetailsJson);
    
      // VALUES (?, ?, ?, ?, ?, ?, ?,?)

    const result = await db
      .prepare(
        `INSERT INTO Search_Analytics_Table
       (user_id, user_email, avatar, created_at, data, location, is_anonymous, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        userId,
        userEmail,
        avatar,
        currentTime,
        strigifyParams,
        location,
        isAnonymous,
        userAgent
      )
      .run();
    if (result.error) {
      console.log("Analytics error", result.error);
      return false;
    }
    console.log("Analytics inserted", new Date().toLocaleString());
    return true;
  } catch (error) {
    console.log("Analytics error", error);
    return false;
  }
}

// import { NextRequest } from "next/server";
// import { getDB } from "./get-database";
// import { DB_NAMES } from "./db-name";
// import { createClientServer } from "../supabase/server";

// interface Location {
//   status: string;
//   country: string;
//   countryCode: string;
//   region: string;
//   regionName: string;
//   city: string;
//   zip: string;
//   lat: string;
//   lon: string;
//   timezone: string;
//   isp: string;
//   org: string;
//   as: string;
//   query: string;
// }

// // Helper function to safely sanitize and validate query parameters
// function sanitizeQueryParam(value: string | null): string {
//   if (!value) return "";

//   // First remove control characters that should never be in search queries
//   const cleaned = value
//     .trim()
//     .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters

//   // URL encode the cleaned string to handle special characters safely
//   // This will encode &, <, >, ', ", spaces, and other special chars properly
//   return cleaned;
// }
// // Helper function to safely parse and clean all parameters
// function sanitizeParams(searchParams: URLSearchParams): Record<string, string> {
//   const cleanParams: Record<string, string> = {};

//   for (const [key, value] of searchParams.entries()) {
//     // Skip empty keys or values
//     if (!key.trim() || !value.trim()) continue;

//     // Sanitize key and value
//     const cleanKey = key.trim()
//     const cleanValue = sanitizeQueryParam(value);

//     cleanParams[cleanKey] = cleanValue;
//   }

//   return cleanParams;
// }

// export async function ebextractor_analytics_engine({
//   req,
//   additionalFields = {},
// }: {
//   req: NextRequest;
//   additionalFields?: { [key: string]: any };
// }): Promise<boolean> {
//   try {
//     const db: D1Database = await getDB(DB_NAMES.EBEXTRACTOR_ANALYTICS_DB);

//     // Create a copy of the URL search params to avoid modifying the original
//     const params = new URLSearchParams(req.nextUrl.searchParams.toString());

//     // Get and sanitize the query parameter
//     const rawQuery = params.get("q");
//     const sanitizedQuery = sanitizeQueryParam(rawQuery);

//     // Update the params with the sanitized query
//     if (sanitizedQuery) {
//       params.set("q", sanitizedQuery);
//     } else {
//       params.delete("q"); // Remove empty queries
//     }

//     // Add additional fields safely
//     Object.entries(additionalFields).forEach(([key, value]) => {
//       if (key && value !== null && value !== undefined) {
//         const cleanKey = key.trim();
//         const cleanValue = String(value);
//         params.set(cleanKey, cleanValue);
//       }
//     });

//     // Convert to clean object
//     const listOfParamsInTheFormOfObject = sanitizeParams(params);

//     const supabase = await createClientServer();
//     const user = await supabase.auth.getUser();

//     const userIP =
//       req.headers.get("cf-connecting-ip") ||
//       req.headers.get("x-forwarded-for") ||
//       "unknown";

//     let ipDetailsJson: Location;

//     try {
//       if (process.env.NODE_ENV === "development") {
//         ipDetailsJson = {
//           status: "success",
//           country: "Test Country",
//           countryCode: "TC",
//           region: "TR",
//           regionName: "Test Region",
//           city: "Test City",
//           zip: "12345",
//           lat: "0.0",
//           lon: "0.0",
//           timezone: "UTC",
//           isp: "Test ISP",
//           org: "Test Org",
//           as: "Test AS",
//           query: "127.0.0.1",
//         };
//       } else {
//         const response = await fetch(`http://ip-api.com/json/${userIP}`);
//         ipDetailsJson = await response.json();
//       }
//     } catch (ipError) {
//       console.warn("IP lookup failed:", ipError);
//       ipDetailsJson = {
//         status: "fail",
//         country: "Unknown",
//         countryCode: "XX",
//         region: "XX",
//         regionName: "Unknown",
//         city: "Unknown",
//         zip: "00000",
//         lat: "0.0",
//         lon: "0.0",
//         timezone: "UTC",
//         isp: "Unknown",
//         org: "Unknown",
//         as: "Unknown",
//         query: userIP,
//       };
//     }

//     const userAgent = req.headers.get("user-agent") || "";
//     const currentTime = new Date().toISOString();

//     const userId = user.data.user?.id || null;
//     const userEmail = user.data.user?.email || null;
//     const avatar = user.data.user?.user_metadata?.avatar_url || null;
//     const isAnonymous = userId ? "false" : "true";

//     // Safely stringify location data
//     const location =
//       ipDetailsJson.status === "fail" ? userIP : JSON.stringify(ipDetailsJson);

//     // Safely stringify params data
//     const dataString = JSON.stringify(listOfParamsInTheFormOfObject);

//     const result = await db
//       .prepare(
//         `INSERT INTO Search_Analytics_Table
//        (user_id, user_email, avatar, created_at, data, location, is_anonymous, user_agent)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
//       )
//       .bind(
//         userId,
//         userEmail,
//         avatar,
//         currentTime,
//         dataString,
//         location,
//         isAnonymous,
//         userAgent
//       )
//       .run();

//     if (result.error) {
//       console.error("Analytics database error:", result.error);
//       return false;
//     }

//     console.log(
//       "Analytics inserted successfully:",
//       new Date().toLocaleString()
//     );
//     return true;
//   } catch (error) {
//     console.error("Analytics engine error:", error);
//     return false;
//   }
// }
