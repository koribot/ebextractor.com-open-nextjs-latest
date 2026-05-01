// // this should always be run on server

import { logger } from "@/app/utils/logger";
import { NextRequest } from "next/server";
export const eGrantChecker = async (request: NextRequest): Promise<{granted:boolean, string: string | undefined | null}> => {
  const headers = request.headers;
  const eGrant = headers.get("e-grant");
  logger.debug.log("***EGRANT-CHECKER-ENVIRONMENT***", `(${process.env.NODE_ENV})\n`);
  const referer = request.headers.get("rr") || "";
  if(eGrant === "ebextractor-20"){
    return {granted: true, string: eGrant};
  }
  return {granted: false, string: eGrant};
};

// import { logger } from "@/app/utils/logger";
// import { NextRequest } from "next/server";
// export const eGrantChecker = async (request: NextRequest): Promise<{granted:boolean, string: string | undefined | null}> => {
//   const headers = request.headers;
//   const eGrant = headers.get("e-grant");
//   logger.debug.log("***EGRANT-CHECKER-ENVIRONMENT***", `(${process.env.NODE_ENV})\n`);
//   const referer = request.headers.get("referer") || "";

//   if(process.env.NODE_ENV === "development"){
//     return {granted: true, string: eGrant};
//   }
//   if (
//      eGrant !== "ebextractor-20" 
//     !referer.includes("ebextractor") &&
//   ) {
//     return {granted: false, string: eGrant};
//   }else{
//     return {granted: true, string: eGrant};
//   }
// };
