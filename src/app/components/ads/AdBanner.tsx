// "use client";
// import { useEffect, useRef, useState } from "react";

// export default function AdBanner({
//   slot,
//   showDisclaimer = true,
// }: {
//   slot: string;
//   showDisclaimer?: boolean;
// }) {
//   const adRef = useRef<HTMLModElement>(null);
//   const isAdPushed = useRef(false);
//   const [hasAd, setHasAd] = useState(true); // assume ad until proven otherwise
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (
//       process.env.NODE_ENV === "development" &&
//       !process.env.NEXT_PUBLIC_TEST_ADS
//     ) {
//       console.log("AdSense: Skipping in development mode");
//       setIsLoading(false);
//       setHasAd(false);
//       return;
//     }

//     if (!isAdPushed.current && adRef.current) {
//       try {
//         // @ts-ignore
//         (window.adsbygoogle = window.adsbygoogle || []).push({});
//         isAdPushed.current = true;
//         console.log("AdSense: Ad pushed for slot", slot);
//         checkAdAvailability();
//       } catch (e) {
//         console.error("AdSense error:", e);
//         setIsLoading(false);
//         setHasAd(false);
//       }
//     }
//   }, [slot]);

//   const checkAdAvailability = () => {
//     let attempts = 0;
//     const maxAttempts = 1;

//     const checkStatus = () => {
//       if (!adRef.current) {
//         setIsLoading(false);
//         setHasAd(false);
//         return;
//       }

//       const status = adRef.current.getAttribute("data-adsbygoogle-status");

//       if (status === "filled") {
//         setHasAd(true);
//         setIsLoading(false);
//         console.log("AdSense: Ad loaded successfully for slot", slot);
//       } else if (status === "unfilled") {
//         setHasAd(false);
//         setIsLoading(false);
//         console.log("AdSense: No ad available for slot", slot);
//       } else if (attempts < maxAttempts) {
//         attempts++;
//         setTimeout(checkStatus, 100);
//       } else {
//         setHasAd(false);
//         setIsLoading(false);
//         console.log("AdSense: Timeout waiting for ad status for slot", slot);
//       }
//     };

//     checkStatus();
//   };

//   useEffect(() => {
//     return () => {
//       isAdPushed.current = false;
//       setIsLoading(true);
//       setHasAd(true);
//     };
//   }, [slot]);

//   if (!hasAd && !isLoading) {
//     return null;
//   }

//   return (
//     <div className="w-full">
//       {/* Correct Ad Container */}
//       <div className={`w-full ${hasAd ? "h-[90px]" : "h-0"}`}>
//         <ins
//           className="adsbygoogle"
//           style={{ display: "inline-block", width: "728px", height: "90px" }}
//           data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT}
//           data-ad-slot={slot}
//         ></ins>
//       </div>

//       {/* Compact Disclaimer */}
//       {hasAd && !isLoading && showDisclaimer && (
//         <div className="text-center mt-1">
//           <p className="text-xs text-gray-500">
//             Ads & affiliate programs (eBay, Amazon) help cover hosting,
//             maintenance & keep this site free 🙏
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

// "use client";
// import { useEffect } from "react";

// export default function AdBanner({width = 728, height = 90}: {width?: number, height?: number}) {
//   useEffect(() => {
//     if (process.env.NODE_ENV === "development") return;
//     try {
//       // @ts-ignore
//       (window.adsbygoogle = window.adsbygoogle || []).push({});
//     } catch (e) {
//       console.error("AdSense error:", e);
//     }
//   }, []);

//   // if (process.env.NODE_ENV === "development") return null;

//   return (
//     <div className='w-full justify-center flex'>
//       <ins
//         className="adsbygoogle"
//         style={{ display: "inline-block", width: `${width}px`, height: `${height}px` }}
//         data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT}
//         data-ad-slot="5221013721"
//       ></ins>
//     </div>
//   );
// }

"use client";
import { useEffect, useRef, useState } from "react";

export default function AdBanner({
  width = 728,
  height = 90,
  slot = "5221013721",
  debug = false, // Add debug prop
}: {
  width?: number;
  height?: number;
  slot?: string;
  debug?: boolean;
}) {
  const adRef = useRef<HTMLModElement>(null);
  const [debugInfo, setDebugInfo] = useState({
    scriptLoaded: false,
    adsbygoogleExists: false,
    adInitialized: false,
    error: null as string | null,
    adElementExists: false,
  });

  const updateDebugInfo = (updates: Partial<typeof debugInfo>) => {
    setDebugInfo((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    if (process.env.NODE_ENV === "development") return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;
    if (!clientId) {
      updateDebugInfo({ error: "Missing NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT" });
      return;
    }

    const scriptSrc = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;

    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

    if (existingScript) {
      updateDebugInfo({ scriptLoaded: true });
      checkAdsbygoogle();
    } else {
      // Load the script
      const script = document.createElement("script");
      script.src = scriptSrc;
      script.async = true;
      script.crossOrigin = "anonymous";

      script.onload = () => {
        updateDebugInfo({ scriptLoaded: true });
        checkAdsbygoogle();
      };

      script.onerror = (error) => {
        updateDebugInfo({ error: `Script failed to load: ${error}` });
      };

      document.head.appendChild(script);
    }

    function checkAdsbygoogle() {
      // Check if adsbygoogle exists
      setTimeout(() => {
        const adsbygoogleExists = !!(window as any).adsbygoogle;
        updateDebugInfo({ adsbygoogleExists });

        if (adsbygoogleExists) {
          initializeAd();
        } else {
          updateDebugInfo({ error: "window.adsbygoogle not available" });
        }
      }, 100);
    }

    function initializeAd() {
      try {
        // Check if ad element exists
        const adElementExists = !!adRef.current;
        updateDebugInfo({ adElementExists });

        if (adElementExists) {
          ((window as any).adsbygoogle =
            (window as any).adsbygoogle || []).push({});
          updateDebugInfo({ adInitialized: true });

          // Check if ad was actually rendered
          setTimeout(() => {
            checkAdRendering();
          }, 2000);
        }
      } catch (error: any) {
        updateDebugInfo({
          error: `Ad initialization failed: ${error.message}`,
        });
      }
    }

    function checkAdRendering() {
      if (adRef.current) {
        const adElement = adRef.current;
        const hasContent = adElement.children.length > 0;
        const hasHeight = adElement.offsetHeight > 0;

        if (debug) {
          console.log("Ad Element Debug:", {
            hasContent,
            hasHeight,
            offsetHeight: adElement.offsetHeight,
            offsetWidth: adElement.offsetWidth,
            children: adElement.children.length,
            innerHTML: adElement.innerHTML.slice(0, 100),
          });
        }
      }
    }
  }, []);

  // Development mode
  if (process.env.NODE_ENV === "development") {
    return null;
  }

  return (
    <div className="w-full justify-center flex flex-col items-center">
      {/* <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "inline-block",
          width: `${width}px`,
          height: `${height}px`,
        }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      /> */}

      {/* {debug && (
        <div className="mt-2 p-3 bg-blue-50 rounded text-xs font-mono max-w-md">
          <h4 className="font-bold mb-2">Debug Info:</h4>
          <div className="space-y-1">
            <div
              className={
                debugInfo.scriptLoaded ? "text-green-600" : "text-red-600"
              }
            >
              Script Loaded: {debugInfo.scriptLoaded ? "✓" : "✗"}
            </div>
            <div
              className={
                debugInfo.adsbygoogleExists ? "text-green-600" : "text-red-600"
              }
            >
              window.adsbygoogle: {debugInfo.adsbygoogleExists ? "✓" : "✗"}
            </div>
            <div
              className={
                debugInfo.adElementExists ? "text-green-600" : "text-red-600"
              }
            >
              Ad Element: {debugInfo.adElementExists ? "✓" : "✗"}
            </div>
            <div
              className={
                debugInfo.adInitialized ? "text-green-600" : "text-red-600"
              }
            >
              Ad Initialized: {debugInfo.adInitialized ? "✓" : "✗"}
            </div>
            {debugInfo.error && (
              <div className="text-red-600">Error: {debugInfo.error}</div>
            )}
          </div>
        </div>
      )} */}
    </div>
  );
}
