import {
  MARKETPLACE_TO_CURRENCY_ISO_4217,
  MARKETPLACE_TO_LANGUAGE_LOCALE_CODE,
} from "@/app/utils/amazonSiteMapping";
import { ebaySiteToAmazonMapping } from "@/app/utils/ebaySiteMapping";
import { logger } from "@/app/utils/logger";
import Cloudflare from "cloudflare";

const client = new Cloudflare({
  apiToken: process.env["CLOUDFLARE_BROWSER_RENDERING_API_TOKEN"],
});

// Rotate user agents to avoid pattern detection
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
];

const getRandomUserAgent = () => {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};


// Generate realistic session ID
const generateSessionId = () => {
  return `${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
};

export const getHtml = async (url: string, site: string) => {
  logger.debug.log("getHtml", { url, site })

  const currency = MARKETPLACE_TO_CURRENCY_ISO_4217[site];
  const language = MARKETPLACE_TO_LANGUAGE_LOCALE_CODE[site];
  const sessionId = generateSessionId();
  // More complete and realistic headers
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

  const content = await client.browserRendering.content.create({
    account_id: process.env["CLOUDFLARE_ACCOUNT_ID"]!!,
    url: url,
    setExtraHTTPHeaders: headers,
    gotoOptions: {
      waitUntil: "domcontentloaded",
    },
    rejectResourceTypes: ["image"],
  });

  return content;
};
