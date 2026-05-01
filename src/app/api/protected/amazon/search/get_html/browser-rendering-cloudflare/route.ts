// import { decodeURIToText } from "@/app/utils/decodeURIToText";
// import requests from "@/app/utils/http";
// import type { NextRequest } from "next/server";

// export async function GET(request: NextRequest) {
//   // const {data} = middleware(request)
//   // if(data==="Unauthorized"){
//   //   return new Response('Unauthorized', { status: 401 });
//   // }
//   const searchQuery = request.nextUrl.searchParams.get("q") || ""
//   const site = request.nextUrl.searchParams.get("siteamz")
//   const decodedSearchQuery = decodeURIToText(searchQuery);
//   try {
//     const response = await requests.get(`https://seekearch.vercel.app/api/search?q=https://${site}/s?k=${decodedSearchQuery}`, {
//       headers: {
//         "Content-Type": "application/json",
//         "Origin": "https://www.ebextractor.com/",
//       }
//     });
//     const htmlContent = await response.data
//     return new Response(htmlContent, {
//       headers: { "Content-Type": "text/html" },
//     });

//   } catch (error) {
//     console.error("Error fetching page:", error);
//     return new Response("Failed at amazon-search api", {
//       status: 400,
//       headers: { "Content-Type": "text/plain" },
//     });
//   }
// }

// app/api/amazon-search/route.ts
import { decodeURIToText } from "@/app/utils/decodeURIToText";
import { getHtml } from "@/lib/browser-rendering-cloudflare/get_hml";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchQuery = request.nextUrl.searchParams.get("q") || "";
  const site = request.nextUrl.searchParams.get("siteamz");

  if (!site) {
    return new Response("Missing 'siteamz' parameter", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  if (!site.includes("amazon.")) {
    return new Response("Invalid Amazon domain", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const decodedSearchQuery = decodeURIToText(searchQuery);
  try {
    const html = await getHtml(
      `https://${site}/s?k=${encodeURIComponent(decodedSearchQuery)}`,
      site,
    );
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        // Add cache headers to reduce repeated requests
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.log("error", error);
    return new Response("Failed at amazon/search/html api", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
