import { eGrantChecker } from "@/app/utils/eGrantChecker";
import crypto from "crypto";
import { NextRequest } from "next/server";

// ---- Affiliate Product Query Params ----
export interface AliExpressAffiliateProductQueryParams {
  app_signature?: string;
  category_ids?: string;
  fields?: string;
  keywords?: string;
  max_sale_price?: string;
  min_sale_price?: string;
  page_no?: string;
  page_size?: string;
  platform_product_type?: "ALL" | "PLAZA" | "TMALL";
  sort?:
    | "SALE_PRICE_ASC"
    | "SALE_PRICE_DESC"
    | "LAST_VOLUME_ASC"
    | "LAST_VOLUME_DESC";
  target_currency?:
    | "USD"
    | "GBP"
    | "CAD"
    | "EUR"
    | "UAH"
    | "MXN"
    | "TRY"
    | "RUB"
    | "BRL"
    | "AUD"
    | "INR"
    | "JPY"
    | "IDR"
    | "SEK"
    | "KRW"
    | "ILS"
    | "THB"
    | "CLP"
    | "VND";
  target_language?:
    | "EN"
    | "RU"
    | "PT"
    | "ES"
    | "FR"
    | "ID"
    | "IT"
    | "TH"
    | "JA"
    | "AR"
    | "VI"
    | "TR"
    | "DE"
    | "HE"
    | "KO"
    | "NL"
    | "PL"
    | "MX"
    | "CL"
    | "IN";
  tracking_id?: string;
  promotion_name?: string;
  ship_to_country?: string;
  delivery_days?: "3" | "5" | "7" | "10";
}

// ---- Signature Builder ----
function signApiRequest(
  params: Record<string, string>,
  appSecret: string
): string {
  // Sort all request params (excluding "sign")
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== "sign")
    .sort();

  // Concatenate key + value
  let query = "";
  for (const key of sortedKeys) {
    const value = params[key];
    if (key && value) {
      query += key + value;
    }
  }

  // HMAC-SHA256
  const hmac = crypto.createHmac("sha256", appSecret);
  hmac.update(query, "utf8");
  return hmac.digest("hex").toUpperCase();
}

// ---- API Route Handler ----
export async function GET(req: NextRequest): Promise<Response> {
  const headers = req.headers;
  const eGrant = await eGrantChecker(req);
  if (eGrant.granted === false) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);

    const appKey = process.env.ALI_APP_KEY ?? "";
    const appSecret = process.env.ALI_APP_SECRET ?? "";
    const method = "aliexpress.affiliate.product.query";

    // System-level params
    const params: Record<string, string> = {
      method,
      app_key: appKey,
      sign_method: "sha256",
      timestamp: Date.now().toString(),
    };

    // Merge incoming query params (validated via interface type)
    searchParams.forEach((value, key) => {
      // Cast as any to satisfy TS, since all query params are strings
      (params as any)[key] = value;
    });

    // Generate signature
    params.sign = signApiRequest(params, appSecret);

    // Call upstream AliExpress API
    const url = `https://api-sg.aliexpress.com/sync?${new URLSearchParams(
      params
    ).toString()}`;
    const upstreamRes = await fetch(url);

    // Stream the response body directly
    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("AliExpress proxy error:", err);
    return new Response("Upstream error", { status: 500 });
  }
}
