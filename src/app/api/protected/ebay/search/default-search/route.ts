import { decodeURIToText } from "@/app/utils/decodeURIToText";
// import requests from "@/app/utils/http";
import { obtainAccessToken } from "@/app/utils/obtainAccessToken";
import { ebextractor_analytics_engine } from "@/lib/d1-cloudflare/analytics_engine";
import { eGrantChecker } from "@/app/utils/eGrantChecker";
// import { ebextractor_analytics_engine } from "@/lib/d1-cloudflare/analytics_engine";
import { after, NextRequest } from "next/server";

// const responseEncryptor = (response: any) => {
//   // Convert response to string if it's not already
//   const responseString =
//     typeof response === "string" ? response : JSON.stringify(response);

//   // Convert each character to its ASCII code
//   const asciiCodes = responseString
//     .split("")
//     .map((char) => char.charCodeAt(0))
//     .join("-"); // Using dash as delimiter

//   return asciiCodes;
// };

const fetchListings = async ({
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
    `https://api.ebay.com/buy/browse/v1/item_summary/search?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": site,
        "X-EBAY-C-ENDUSERCTX":
          "affiliateCampaignId=5339079461,affiliateReferenceId=ebextractor",
      },
    },
  );
  return response;
};
export async function GET(request: NextRequest) {
  // const {data} = middleware(request)
  // if(data==="Unauthorized"){
  //   return new Response('Unauthorized', { status: 401 });
  // }
  const eGrant = await eGrantChecker(request);
  if (eGrant.granted === false) {
    return new Response("Unauthorized", { status: 401 });
  }
  const searchQuery = request.nextUrl.searchParams.get("q") || "";
  const category_ids = request.nextUrl.searchParams.get("category_ids") || "";
  const filters = request.nextUrl.searchParams.get("filter") || "";
  const site = request.nextUrl.searchParams.get("site") || "EBAY_US";
  const decodedSearchQuery = decodeURIToText(searchQuery);
  const offset = request.nextUrl.searchParams.get("offset") || 0;
  const limit = request.nextUrl.searchParams.get("limit") || 100;
  const mode = request.nextUrl.searchParams.get("mode") || "FULL_KEYWORDS";
  const soldItemsOnly =
    request.nextUrl.searchParams.get("soldItemsOnly") || false;
  const token = await obtainAccessToken();
  const params = new URLSearchParams();
  params.append("q", decodedSearchQuery);
  params.append("category_ids", category_ids.toString());
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());
  params.append("soldItemsOnly", soldItemsOnly.toString());
  params.append("fieldgroups", "EXTENDED");
  if (filters !== "") {
    params.append("filter", filters);
  }

  try {
    const response = await fetchListings({ params, token, site });
    // if (eGrant) {
    // if (response.data.total <= 0) {
    //   let fewKeywords = decodedSearchQuery.split(" ");
    //   if (fewKeywords.length > 2) {
    //     fewKeywords = fewKeywords.slice(0, 2);
    //   }
    //   params.set("q", fewKeywords.join(" "));
    //   const fewKeywordsResponse = await fetchListings({
    //     params,
    //     token,
    //     site,
    //   });
    //   if (fewKeywordsResponse.data.total > 0) {
    //     after(async () => {
    //       await ebextractor_analytics_engine({
    //         req: request,
    //         additionalFields: {
    //           totalResult:
    //             fewKeywordsResponse?.data?.itemSummaries?.length || 0,
    //           totalEbayItemsForthisSearch:
    //             fewKeywordsResponse?.data?.total || 0,
    //           eGrant: eGrant || "unknown",
    //           fewKeywords: fewKeywords.join(" "),
    //         },
    //       });
    //     });
    //     const toreturn = {
    //       ...fewKeywordsResponse.data,
    //       searchKeywordType: "FEW_KEYWORDS",
    //     };
    //     return new Response(JSON.stringify(toreturn), {
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //     });
    //   }
    // }
    // after(async () => {
    //   await ebextractor_analytics_engine({
    //     req: request,
    //     additionalFields: {
    //       totalResult: response?.data?.itemSummaries?.length || 0,
    //       totalEbayItemsForthisSearch: response?.data?.total || 0,
    //       eGrant: eGrant || "unknown",
    //     },
    //   });
    // });

    // const toreturn = {
    //   ...response.data,
    //   searchKeywordType: "FULL_KEYWORDS",
    // };
    // if (
    //   (eGrant && referer.includes("ebextractor")) ||
    //   process.env.NODE_ENV === "development"
    // ) {
    // const r = response.clone();
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
    return new Response(response.body, {
      status: response.status,
      headers: {
        "search-mode": mode,
        "Content-Type": "application/json",
      },
    });
    // }
    // }
    // return new Response(JSON.stringify(responseEncryptor(response.data)), {
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ data: "Error at ebay-search api" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
