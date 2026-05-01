import type { NextRequest } from "next/server";

interface EbaySiteConfig {
  url: string;
  languageCode: string;
  countryCode: string;
}

const ebaySiteConfigs: Record<string, EbaySiteConfig> = {
  EBAY_US: {
    url: "https://www.ebay.com/",
    languageCode: "en-US",
    countryCode: "US",
  },
  EBAY_GB: {
    url: "https://www.ebay.co.uk/",
    languageCode: "en-GB",
    countryCode: "GB",
  },
  EBAY_DE: {
    url: "https://www.ebay.de/",
    languageCode: "de-DE",
    countryCode: "DE",
  },
  EBAY_AU: {
    url: "https://www.ebay.com.au/",
    languageCode: "en-AU",
    countryCode: "AU",
  },
  EBAY_IT: {
    url: "https://www.ebay.it/",
    languageCode: "it-IT",
    countryCode: "IT",
  },
  EBAY_CA: {
    url: "https://www.ebay.ca/",
    languageCode: "en-CA",
    countryCode: "CA",
  },
  EBAY_ES: {
    url: "https://www.ebay.es/",
    languageCode: "es-ES",
    countryCode: "ES",
  },
  EBAY_FR: {
    url: "https://www.ebay.fr/",
    languageCode: "fr-FR",
    countryCode: "FR",
  },
  EBAY_HK: {
    url: "https://www.ebay.com.hk/",
    languageCode: "zh-HK",
    countryCode: "HK",
  },
  EBAY_SG: {
    url: "https://www.ebay.com.sg/",
    languageCode: "en-SG",
    countryCode: "SG",
  },
  EBAY_IE: {
    url: "https://www.ebay.ie/",
    languageCode: "en-IE",
    countryCode: "IE",
  },
  EBAY_PL: {
    url: "https://www.ebay.pl/",
    languageCode: "pl-PL",
    countryCode: "PL",
  },
  EBAY_NL: {
    url: "https://www.ebay.nl/",
    languageCode: "nl-NL",
    countryCode: "NL",
  },
  EBAY_AT: {
    url: "https://www.ebay.at/",
    languageCode: "de-AT",
    countryCode: "AT",
  },
  EBAY_CH: {
    url: "https://www.ebay.ch/",
    languageCode: "de-CH",
    countryCode: "CH",
  },
  EBAY_BE: {
    url: "https://www.ebay.be/",
    languageCode: "nl-BE",
    countryCode: "BE",
  },
};

export async function GET(request: NextRequest) {
  const site = request.nextUrl.searchParams.get("site");

  if (!site || !ebaySiteConfigs[site]) {
    return new Response("Invalid site parameter", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const { url, languageCode, countryCode } = ebaySiteConfigs[site];

  try {
    const response = await fetch(`${url}deals`, {
      headers: {
        "Accept-Language": languageCode,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document",
      },
    });

    // const htmlContent = await response.text();

    // return new Response(htmlContent, {
    //   headers: {
    //     "Content-Type": "text/html",
    //   },
    // });

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error(`Error fetching eBay deals for ${site}:`, error);
    return new Response(`Failed to fetch eBay deals for ${site}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// import type { NextRequest } from "next/server";
// import axios from "axios";
// import { middleware } from "@/app/utils/middleware";
// import { ebaySiteUrlMapping } from "@/app/utils/ebaySiteMapping";

// export const runtime = "edge";

// export async function GET(request: NextRequest) {
//   // const { data } = middleware(request);
//   // if (data === "Unauthorized") {
//   //   return new Response("Unauthorized", { status: 401 });
//   // }
//   const site = request.nextUrl.searchParams.get("site");
//   if (site) {
//     try {
//       // const response = await axios.get(`${ebaySiteUrlMapping[site]}deals`);
//       const response = await axios.get(`https://seekearch.vercel.app/api/ebay-deals?site=${site}`); // alternative for now
//       const htmlContent = response.data;

//       // Return the HTML content as a string with the appropriate Content-Type header
//       return new Response(htmlContent, {
//         headers: { "Content-Type": "text/html" },
//       });
//     } catch (error) {
//       console.log(error);
//       return new Response("Failed at ebay-deals api", {
//         status: 500,
//         headers: { "Content-Type": "text/plain" },
//       });
//     }
//   }
// }
