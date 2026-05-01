import { getCloudflareContext } from "@opennextjs/cloudflare";
import requests from "./http";
async function obtainAccessTokenProduction() {
  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env;
    const myKv = env.EBEXTRACTOR_KV;
    const token = await myKv.get("tk");
    return token || "";
  } catch (e) {
    console.error(e);
    return "";
  }
}

async function obtainAccessTokenDevelopment() {
  const context = await getCloudflareContext({ async: true });
  const env = context.env;
  const cid = env.CID;
  const cs = env.CS;
  const currentTime = Date.now();
  const myKv = env.EBEXTRACTOR_KV;
  const token = await myKv.get("tk");
  const expiration = await myKv.get("exp");
  if (token && Number(expiration) > currentTime) {
    return token;
  }
  const tokenEndpoint = "https://api.ebay.com/identity/v1/oauth2/token";
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${Buffer.from(`${cid}:${cs}`).toString("base64")}`,
  };
  // const data = new URLSearchParams();
  // data.append('grant_type', 'client_credentials');
  // data.append('scope', 'https://api.ebay.com/oauth/api_scope');
  // console.log(data)
  const reqBody =
    "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope%20https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope%2Fbuy.deal";
  // "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope";
  try {
    // const response = await fetch(tokenEndpoint, {
    //   method: "POST",
    //   headers: headers,
    //   body: reqBody,
    // });
    const response = await requests.post<{
      access_token: string;
      expires_in: number;
      token_type: string;
    }>(tokenEndpoint, reqBody, { headers });
    // const data = await response.text();
    if (!response.success) {
      console.log(
        "Something went wrong while getting the ebay application token",
      );
      return "";
    }
    const data = response.requestsData;
    const { access_token, expires_in } = data;
    const tw = currentTime + (expires_in - 60) * 1000; // Subtract 60 seconds to account for any potential delay
    await myKv.put("tk", access_token);
    await myKv.put("exp", tw.toString());
    return access_token;
  } catch (error) {
    console.error("Error obtaining access token:", error);
    return "";
    // throw error;
  }
}

const whatToExport =
  process.env.NEXTJS_ENV === "development"
    ? obtainAccessTokenDevelopment
    : obtainAccessTokenProduction;

export { whatToExport as obtainAccessToken };
