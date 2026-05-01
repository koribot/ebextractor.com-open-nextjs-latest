"use client";
import React, { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { showModal } from "../common/modal/modal-provider";
import kunsul from "kunsul";
import { FaLinkSlash } from "react-icons/fa6";
import { FiExternalLink } from "react-icons/fi";

type DescriptionProps = {
  html: string;
};

// Separate component for the modal content
function DescriptionIframe({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && html) {
      const sanitizedHtml = DOMPurify.sanitize(html);
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(sanitizedHtml);
        iframeDoc.close();
      }
    }
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      className="prose overflow-auto"
      sandbox="allow-scripts allow-same-origin"
      width="100%"
      height="100%"
    />
  );
}

export default function Description({ html }: DescriptionProps) {
  if (!html) {
    return null;
  }

  return (
    <button
      className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 hover:underline"
      onClick={() => {
        showModal({
          title: "Item Description",
          content: (
            <div className="w-[90vw] max-w-6xl overflow-hidden">
              <div style={{ height: "100vh" }}>
                <DescriptionIframe html={html} />
              </div>
            </div>
          ),
        });
      }}
    >
      <FiExternalLink /> Show Full Item Description
    </button>
  );
}

// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import DOMPurify from "dompurify";
// import { showModal } from "../common/modal/modal-provider";
// import kunsul from "kunsul";

// type DescriptionProps = {
//   html: string;
// };

// export default function Description({ html }: DescriptionProps) {
//   const [sanitizedHtml, setSanitizedHtml] = useState<string>("");
//   const iframeRef = useRef<HTMLIFrameElement>(null);
//   useEffect(() => {
//     kunsul.log("html", html);
//     if (typeof window !== "undefined") {
//       setSanitizedHtml(DOMPurify.sanitize(html));
//     }
//   }, [html]);

//   useEffect(() => {
//     if (iframeRef.current && sanitizedHtml) {
//       const iframeDoc = iframeRef.current.contentDocument;
//       if (iframeDoc) {
//         iframeDoc.open();
//         iframeDoc.write(sanitizedHtml);
//         iframeDoc.close();
//       }
//     }
//   }, [sanitizedHtml]);

//   if (!sanitizedHtml) {
//     return null;
//   }

//   return (
//     <button
//       onClick={() => {
//         showModal({
//           title: "Item Description",
//           content: (
//             <div className="w-[90vw] max-w-6xl overflow-hidden">
//               <div style={{ height: "100vh" }}>
//                 <iframe
//                   ref={iframeRef}
//                   className="prose overflow-auto"
//                   sandbox="allow-scripts allow-same-origin"
//                   width="100%"
//                   height="100%"
//                 />
//               </div>
//             </div>
//           ),
//         });
//       }}
//     >
//       Show Description
//     </button>
//   );
// }

// "use client";

// import React, { useState, useEffect } from "react";
// import DOMPurify from "dompurify";

// type DescriptionProps = {
//   html: string;
// };

// export default function Description({ html }: DescriptionProps) {
//   const [sanitizedHtml, setSanitizedHtml] = useState<string>("");

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       setSanitizedHtml(DOMPurify.sanitize(html));
//     }
//   }, [html]);

//   if (!sanitizedHtml) {
//     return null;
//   }

//   return (
//     <div
//       className="prose max-w-full overflow-x-auto"
//       dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
//     />
//   );
// }
// "use client";
// import React, { useState, useEffect } from "react";
// import DOMPurify from "dompurify";

// function Description({ html }: { html: string }) {
//   const [_html, setHtml] = useState<string>("")
//   useEffect(()=>{
//     const sanitizedHtml = DOMPurify.sanitize(html);
//     setHtml(sanitizedHtml)
//   })
//   return (
//       <div
//       suppressHydrationWarning
//       suppressContentEditableWarning
//         className="flex flex-col justify-center items-center"
//         dangerouslySetInnerHTML={{ __html: _html }}
//       />
//   );
// }

// export default Description;
