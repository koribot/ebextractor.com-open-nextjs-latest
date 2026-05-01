import requests from "@/app/utils/http";
import { obtainAccessToken } from "@/app/utils/obtainAccessToken";
import { eGrantChecker } from "@/app/utils/eGrantChecker";
import { NextRequest } from "next/server";

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
  const token = await obtainAccessToken();
  try {
    const response = await requests.get(
      `https://api.ebay.com/buy/browse/v1/item/get_items_by_item_group?item_group_id=${itemid}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-EBAY-C-MARKETPLACE-ID": site,
          "X-EBAY-C-ENDUSERCTX":
            "affiliateCampaignId=5339079461,affiliateReferenceId=ebextractor",
        },
      },
    );
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
