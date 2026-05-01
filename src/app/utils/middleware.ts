import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export  function middleware(request: NextRequest): {data:string, status:string, success:boolean} {
  const apiKey = request.headers.get('x-api-key');
  const referer = request.headers.get("referer") 
  const host = request.headers.get("host")
  if (process.env.NODE_ENV === 'development' && host === "localhost:3000") {
    return {data: "Authorized", status: "ok", success: true}
  } 
  // if (apiKey !== process.env.INTERNAL_API_KEY) {
  //   return new Response('Unauthorized', { status: 401 });
  // }
  if(referer!==null && !referer.includes('api') && (host==="ebextractor.com" || 
    host==="www.ebextractor.com" || host==="dev.ebextractor-com.pages.dev" ||
    host === "dev-zustand.ebextractor-com.pages.dev" || host === "ebextractor-com.pages.dev"
  )){
    return {data: "Authorized", status: "ok", success: true}
  }else{
    return {data: "Unauthorized", status: "rejected", success: false}
  }
}
