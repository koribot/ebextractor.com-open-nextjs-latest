import { obtainAccessToken } from "@/app/utils/obtainAccessToken";
import { ebextractor_analytics_engine } from "@/lib/d1-cloudflare/analytics_engine";
import { after, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const headers = request.headers;
  const eGrant = headers.get("e-grant");
  const referer = request.headers.get("referer") || "";
  if (
    eGrant !== "ebextractor-20" &&
    !referer.includes("ebextractor") &&
    process.env.NODE_ENV !== "development"
  ) {
    return new Response("Unauthorized", { status: 401 });
  }
  const body: { base64Image: string; site: string; limit: number } =
    await request.json();
  const { base64Image, site = "EBAY_US", limit = 200 } = body;
  const accessToken = await obtainAccessToken();
  try {
    const res = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search_by_image?&limit=${limit}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-EBAY-C-MARKETPLACE-ID": site,
          "X-EBAY-C-ENDUSERCTX":
            "affiliateCampaignId=5339079461,affiliateReferenceId=ebextractor",
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      }
    );

    after(async () => {
      await ebextractor_analytics_engine({
        req: request,
        additionalFields: {
          searchMode: "ebay-search-by-image",
          site: site,
        },
      });
    });
    return new Response(res.body, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
  }
  return new Response(undefined, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
