// import { decodeURIToText } from "@/app/utils/decodeURIToText";
// import requests from "@/app/utils/http";
// import type { NextRequest } from "next/server";

// export async function GET(request: NextRequest) {
//   // const {data} = middleware(request)
//   // if(data==="Unauthorized"){
//   //   return new Response('Unauthorized', { status: 401 });
//   // }
//   const searchQuery = request.nextUrl.searchParams.get("q") || ""
//   const site = request.nextUrl.searchParams.get("siteamz")
//   const decodedSearchQuery = decodeURIToText(searchQuery);
//   try {
//     const response = await requests.get(`https://seekearch.vercel.app/api/search?q=https://${site}/s?k=${decodedSearchQuery}`, {
//       headers: {
//         "Content-Type": "application/json",
//         "Origin": "https://www.ebextractor.com/",
//       }
//     });
//     const htmlContent = await response.data
//     return new Response(htmlContent, {
//       headers: { "Content-Type": "text/html" },
//     });

//   } catch (error) {
//     console.error("Error fetching page:", error);
//     return new Response("Failed at amazon-search api", {
//       status: 400,
//       headers: { "Content-Type": "text/plain" },
//     });
//   }
// }

// app/api/amazon-search/route.ts
import {
  MARKETPLACE_TO_CURRENCY_ISO_4217,
  MARKETPLACE_TO_LANGUAGE_LOCALE_CODE,
} from "@/app/utils/amazonSiteMapping";
import { decodeURIToText } from "@/app/utils/decodeURIToText";
import type { NextRequest } from "next/server";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

const generateSessionId = () => {
  return `${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
};

export async function GET(request: NextRequest) {
  const searchQuery = request.nextUrl.searchParams.get("q") || "";
  const site = request.nextUrl.searchParams.get("siteamz");

  if (!site) {
    return new Response("Missing 'siteamz' parameter", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Validate Amazon domain to prevent abuse
  if (!site.includes("amazon.")) {
    return new Response("Invalid Amazon domain", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const decodedSearchQuery = decodeURIToText(searchQuery);
  const currency = MARKETPLACE_TO_CURRENCY_ISO_4217[site];
  const language = MARKETPLACE_TO_LANGUAGE_LOCALE_CODE[site];
  const sessionId = generateSessionId();
  const headers: Record<string, string> = {
    "User-Agent": getRandomUserAgent(),
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    // "Accept-Language": `${language.replace("_", "-")},en;q=0.9`,
    "Accept-Encoding": "gzip, deflate, br",
    Cookie: [
      `i18n-prefs=${currency}`,
      `lc-main=${language}`,
      `session-id=${sessionId}`,
      `session-id-time=${Date.now()}`,
      `ubid-main=${Math.random().toString(36).substring(2, 15)}`,
    ].join("; "),
    Referer: `https://${site}/`,
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "max-age=0",
  };

  // Add Chrome-specific headers if using Chrome user agent
  if (headers["User-Agent"].includes("Chrome")) {
    headers["sec-ch-ua"] =
      '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
    headers["sec-ch-ua-mobile"] = "?0";
    headers["sec-ch-ua-platform"] = '"Windows"';
  }

  try {
    const response = await fetch(
      `https://${site}/s?k=${encodeURIComponent(decodedSearchQuery)}`,
      {
        // headers: {
        //   "User-Agent": getRandomUserAgent(),
        //   Accept:
        //     "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        //   "Accept-Language": "en-US,en;q=0.9",
        //   "Accept-Encoding": "gzip, deflate, br",
        //   DNT: "1",
        //   Connection: "keep-alive",
        //   "Upgrade-Insecure-Requests": "1",
        //   "Sec-Fetch-Dest": "document",
        //   "Sec-Fetch-Mode": "navigate",
        //   "Sec-Fetch-Site": "none",
        //   "Sec-Fetch-User": "?1",
        //   "Cache-Control": "max-age=0",
        //   // Referer helps appear more legitimate
        //   Referer: `https://${site}/`,
        //   // Add some common browser headers
        //   "sec-ch-ua":
        //     '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        //   "sec-ch-ua-mobile": "?0",
        //   "sec-ch-ua-platform": '"Windows"',
        // },
        headers: headers,
        // Important: Follow redirects
        // redirect: "follow",
        // // Add signal for timeout control
        // signal: AbortSignal.timeout(15000), // 15 second timeout
      },
    );

    if (!response.ok) {
      // Log the status for debugging
      console.error(`Amazon returned status ${response.status}`);

      // Return more specific error messages
      if (response.status === 503) {
        return new Response(
          "Amazon is temporarily unavailable. Please try again later.",
          {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          },
        );
      }

      if (response.status === 403) {
        return new Response(
          "Access denied by Amazon. Request may have been blocked.",
          {
            status: 403,
            headers: { "Content-Type": "text/plain" },
          },
        );
      }

      return new Response(
        `Failed to fetch from Amazon (Status: ${response.status})`,
        {
          status: response.status,
          headers: { "Content-Type": "text/plain" },
        },
      );
    }

    // const htmlContent = await response.text();

    // Check if we got a CAPTCHA page (common blocking mechanism)
    // if (
    //   htmlContent.includes("captcha") ||
    //   htmlContent.includes("Robot Check")
    // ) {
    //   console.error("CAPTCHA detected from Amazon");
    //   return new Response("Amazon CAPTCHA detected. Please try again later.", {
    //     status: 429,
    //     headers: {
    //       "Content-Type": "text/plain",
    //       "Retry-After": "60", // Suggest retry after 60 seconds
    //     },
    //   });
    // }

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "text/html",
        // Add cache headers to reduce repeated requests
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching page:", error);

    // More specific error messages
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return new Response(
          "Request timeout - Amazon took too long to respond",
          {
            status: 504,
            headers: { "Content-Type": "text/plain" },
          },
        );
      }

      console.error("Error details:", error.message);
    }

    return new Response("Failed at amazon-search api", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
