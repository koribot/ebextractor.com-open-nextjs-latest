import { WHAT_AMAZON_API_WE_ARE_USING } from "@/app/contants/amazon-api-we-are-using";
import { AwsV4 } from "@/app/utils/aws4";
import { NextRequest, NextResponse } from "next/server";

interface SearchItemsRequest {
  PartnerType: string;
  PartnerTag: string;
  Keywords: string;
  SearchIndex: string;
  Resources: string[];
  Marketplace: string;
  ItemCount: number;
  ItemPage: number;
}

interface MarketplaceConfig {
  host: string;
  region: string;
  marketplace: string;
  target: string;
  currency: string;
}

interface MarketplaceConfigs {
  [key: string]: MarketplaceConfig;
}

const MARKETPLACE_CONFIGS: MarketplaceConfigs = {
  US: {
    host: "webservices.amazon.com",
    region: "us-east-1",
    marketplace: "www.amazon.com",
    target: "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
    currency: "USD",
  },
  UK: {
    host: "webservices.amazon.co.uk",
    region: "eu-west-1",
    marketplace: "www.amazon.co.uk",
    target: "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
    currency: "GBP",
  },
  DE: {
    host: "webservices.amazon.de",
    region: "eu-west-1",
    marketplace: "www.amazon.de",
    target: "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
    currency: "EUR",
  },
  FR: {
    host: "webservices.amazon.fr",
    region: "eu-west-1",
    marketplace: "www.amazon.fr",
    target: "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
    currency: "EUR",
  },
  IT: {
    host: "webservices.amazon.it",
    region: "eu-west-1",
    marketplace: "www.amazon.it",
    target: "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
    currency: "EUR",
  },
  ES: {
    host: "webservices.amazon.es",
    region: "eu-west-1",
    marketplace: "www.amazon.es",
    target: "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
    currency: "EUR",
  },
  CA: {
    host: "webservices.amazon.ca",
    region: "us-east-1",
    marketplace: "www.amazon.ca",
    target: "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
    currency: "CAD",
  },
  JP: {
    host: "webservices.amazon.co.jp",
    region: "us-west-2",
    marketplace: "www.amazon.co.jp",
    target: "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
    currency: "JPY",
  },
};

export async function GET(request: NextRequest) {
  const eGrant = request.headers.get("e-grant");
  const referer = request.headers.get("referer") || "";
  if (
    eGrant !== "ebextractor-20" &&
    !referer.includes("ebextractor") &&
    process.env.NODE_ENV !== "development"
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (WHAT_AMAZON_API_WE_ARE_USING === "SCRAPE") {
    return NextResponse.json(
      {
        message: "Error Occured",
        error: "amazon-search-pa-api error",
        errorDescription: "We have no access yet",
        success: false,
        data: null,
      },
      {
        status: 200,
      }
    );
  }
  try {
    // const ctx = getRequestContext();
    // const ACCESS_KEY = ctx.env.AMZ_ACCESS_KEY as string;
    // const SECRET_KEY = ctx.env.AMZ_SECRET_KEY as string;
    // const PARTNER_TAG = ctx.env.AMZ_PARTNER_TAG as string;

    const ACCESS_KEY = process.env.AMZ_ACCESS_KEY as string;
    const SECRET_KEY = process.env.AMZ_SECRET_KEY as string;
    const PARTNER_TAG = process.env.AMZ_PARTNER_TAG as string;

    if (!ACCESS_KEY || !SECRET_KEY || !PARTNER_TAG) {
      return new Response("Missing required environment variables", {
        status: 500,
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const marketplace = (searchParams.get("marketplace") || "US").toUpperCase();
    const keywords = searchParams.get("q");
    const itemPage = searchParams.get("page") || 1;

    if (!keywords || !itemPage) {
      return NextResponse.json(
        {
          message: "Error Occured",
          error: "amazon-search-pa-api error",
          errorDescription: "Missing required parameters",
          success: false,
          data: null,
        },
        {
          status: 400,
        }
      );
    }
    // Get marketplace configuration
    const config = MARKETPLACE_CONFIGS[marketplace];
    if (!config) {
      return NextResponse.json(
        {
          message: "Error Occured",
          error: "amazon-search-pa-api error",
          errorDescription: "Invalid marketplace",
          success: false,
          data: null,
        },
        {
          status: 400,
        }
      );
    }

    const searchItemRequest: SearchItemsRequest & Record<string, any> = {
      PartnerType: "Associates",
      PartnerTag: PARTNER_TAG,
      Keywords: keywords,
      SearchIndex: "All",
      Resources: [
        "Images.Primary.Small",
        "ItemInfo.Title",
        "ItemInfo.ByLineInfo",
        "ItemInfo.ContentInfo",
        "ItemInfo.ContentRating",
        "ItemInfo.Classifications",
        "ItemInfo.ExternalIds",
        "ItemInfo.Features",
        "ItemInfo.ManufactureInfo",
        "ItemInfo.ProductInfo",
        "ItemInfo.TechnicalInfo",
        "ItemInfo.TradeInInfo",

        // "CustomerReviews.Count",
        // "CustomerReviews.StarRating",
        "Offers.Listings.Price",
        "Offers.Listings.Condition",
        "Offers.Listings.Condition.ConditionNote",
        "Offers.Listings.Condition.SubCondition",
        "Offers.Listings.MerchantInfo",
        "Offers.Listings.DeliveryInfo.IsAmazonFulfilled",
        "Offers.Listings.DeliveryInfo.IsFreeShippingEligible",
        "Offers.Listings.DeliveryInfo.IsPrimeEligible",
        "Offers.Listings.DeliveryInfo.ShippingCharges",
        "Offers.Listings.LoyaltyPoints.Points",
        "Offers.Listings.Promotions",
        "Offers.Listings.SavingBasis",
        "Offers.Summaries.HighestPrice",
        "Offers.Summaries.LowestPrice",
        "Offers.Summaries.OfferCount",
        "BrowseNodeInfo.BrowseNodes.Ancestor",
        "Offers.Listings.IsBuyBoxWinner",
        "SearchRefinements",
        // "BrowseNodeInfo.BrowseNodes",
        "BrowseNodeInfo.BrowseNodes.SalesRank",
        "BrowseNodeInfo.WebsiteSalesRank",
      ],
      ItemCount: 10,
      Merchant: "All",
      CurrencyOfPreference: config.currency,
      ItemPage: Number(itemPage),
      Marketplace: config.marketplace,
    };

    const path = "/paapi5/searchitems";
    const payload = JSON.stringify(searchItemRequest);

    const awsv4 = new AwsV4(ACCESS_KEY, SECRET_KEY);
    awsv4.setRegionName(config.region);
    awsv4.setServiceName("ProductAdvertisingAPI");
    awsv4.setPath(path);
    awsv4.setPayload(payload);
    awsv4.setRequestMethod("POST");
    awsv4.addHeader("content-encoding", "amz-1.0");
    awsv4.addHeader("content-type", "application/json; charset=utf-8");
    awsv4.addHeader("host", config.host);
    awsv4.addHeader("x-amz-target", config.target);

    const headers = await awsv4.getHeaders();

    // Log request details for debugging
    // console.log("Request details:", {
    //   url: `https://${config.host}${path}`,
    //   marketplace,
    //   region: config.region,
    //   target: config.target,
    // });

    const response: any = await fetch(`https://${config.host}${path}`, {
      method: "POST",
      headers: headers,
      body: payload,
    });
    // const data = await response.json();
    // if (!response.ok) {
    //   console.log("Amazon API Error:", data);
    //   return NextResponse.json({
    //     message: "Error Occured",
    //     error: "amazon-search-pa-api error",
    //     errorDescription: data || JSON.stringify(data),
    //     success: false,
    //     data: null,
    //   });
    // }

    // return new Response(JSON.stringify(data), {
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Cache-Control": "public, max-age=300",
    //   },
    // });
    // return NextResponse.json(
    //   {
    //     message: `Seach for ${keywords} is successfully done on ${marketplace} marketplace`,
    //     success: true,
    //     ...data,
    //   },
    //   {
    //     status: 200,
    //   }
    // );
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("Error in Amazon API route:", error);
    return NextResponse.json(
      {
        message: "Error Occured",
        error: "amazon-search-pa-api error at catch block",
        errorDescription:
          error instanceof Error ? error.message : "Unknown error",
        success: false,
        data: null,
      },
      {
        status: 500,
      }
    );
  }
}
