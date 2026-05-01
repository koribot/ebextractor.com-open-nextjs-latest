import requests from "@/app/utils/http";
import { obtainAccessToken } from "@/app/utils/obtainAccessToken";
import { eGrantChecker } from "@/app/utils/eGrantChecker";
import { after, NextRequest } from "next/server";
import { ebextractor_analytics_engine } from "@/lib/d1-cloudflare/analytics_engine";

export async function GET(request: NextRequest) {
  // const {data} = middleware(request)
  // if(data==="Unauthorized"){
  //   return new Response('Unauthorized', { status: 401 });
  // }
  const eGrant = await eGrantChecker(request);
  if (eGrant.granted === false) {
    return new Response("Unauthorized", { status: 401 });
  }
  const itemid = request.nextUrl.searchParams.get("itemId") || "";
  const site = request.nextUrl.searchParams.get("site") || "";
  const mode =
    request.nextUrl.searchParams.get("mode") ||
    "EBAY-SEARCH-GET-ITEM-BY-LEGACY-ID";
  const token = await obtainAccessToken();
  try {
    const response = await requests.get(
      `https://api.ebay.com/buy/browse/v1/item/get_item_by_legacy_id?legacy_item_id=${itemid}&fieldGroups=ADDITIONAL_SELLER_DETAILS,PRODUCT`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-EBAY-C-MARKETPLACE-ID": site,
          "X-EBAY-C-ENDUSERCTX":
            "affiliateCampaignId=5339079461,affiliateReferenceId=ebextractor",
        },
      },
    );
    if (response.success) {
      after(async () => {
        // const b: any = await r.json();
        await ebextractor_analytics_engine({
          req: request,
          additionalFields: {
            // totalResult: b?.itemSummaries?.length || 0,
            // totalEbayItemsForthisSearch: b?.total || 0,
            eGrant: eGrant.string || "unknown",
            searchMode: mode,
          },
        });
      });
    }

    return new Response(JSON.stringify(response.requestsData), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
    return new Response(undefined, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
