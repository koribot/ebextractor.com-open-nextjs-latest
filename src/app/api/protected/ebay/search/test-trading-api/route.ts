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
    request.nextUrl.searchParams.get("mode") || "EBAY-SEARCH-GET-ITEM-BY-ID";
  const token = await obtainAccessToken();
  const aaw = `<?xml version="1.0" encoding="utf-8"?>
        <GetItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
	<ErrorLanguage>en_US</ErrorLanguage>
	<WarningLevel>High</WarningLevel>
              <!--Enter an ItemID-->
          <ItemID>157194960528</ItemID>
        </GetItemRequest>
  `;
  try {
    const response = await requests.post(
      `https://api.ebay.com/ws/api.dll`,
      aaw,
      {
        headers: {
          "Content-type": "application/xml",
          "X-EBAY-API-SITEID": "0",
          "X-EBAY-API-COMPATIBILITY-LEVEL": "1421",
          "X-EBAY-API-CALL-NAME": "GetItem",
          "X-EBAY-API-IAF-TOKEN": `v^1.1#i^1#f^0#p^3#r^0#I^3#t^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`,
        },
      },
    );

    if (response.success && response.requestsData) {
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

    return new Response(response.requestsData, {
      status: response.status,
      headers: {
        "Content-Type": "application/xml",
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
