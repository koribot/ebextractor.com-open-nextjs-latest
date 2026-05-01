import { obtainAccessToken } from "@/app/utils/obtainAccessToken";
import { eGrantChecker } from "@/app/utils/eGrantChecker";
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

const fetchDeals = async ({
  params,
  token,
  site,
}: {
  params: URLSearchParams;
  token: string;
  site: string;
}) => {
  // const response = await requests.get(
  //   `https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`,
  //   {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //       "X-EBAY-C-MARKETPLACE-ID": site,
  //       "X-EBAY-C-ENDUSERCTX":
  //         "affiliateCampaignId=5339079461,affiliateReferenceId=ebextractor",
  //     },
  //   }
  // );
  const response = await fetch(
    `https://api.ebay.com/buy/deal/v1/event_item?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": site,
        "X-EBAY-C-ENDUSERCTX":
          "affiliateCampaignId=5339079461,affiliateReferenceId=ebextractor",
      },
    }
  );
  return response;
};

export async function GET(request: NextRequest) {
  const site = request.nextUrl.searchParams.get("site");
  const event_ids = request.nextUrl.searchParams.get("event_ids");
  // const countryCode = request.nextUrl.searchParams.get("countryCode");
  const eGrant = await eGrantChecker(request);
  if (eGrant.granted === false) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!site || !event_ids) {
    return new Response("Invalid site parameter", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const token = await obtainAccessToken();
  try {
    const response = await fetchDeals({
      params: new URLSearchParams({
        limit: "200",
        event_ids: event_ids,
      }),
      token: token,
      site: site,
    });

    if (response.status !== 200) {
      return new Response(`Failed to fetch ebay-default-deals-v2 for ${site}`, {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(`Error fetching ebay-default-deals-v2 for ${site}:`, error);
    return new Response(`Failed to fetch ebay-default-deals-v2 for ${site}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
