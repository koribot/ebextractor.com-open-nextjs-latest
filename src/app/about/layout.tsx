import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Ebextractor - Story, and Goals",
  metadataBase: new URL("https://www.ebextractor.com/about"),
  keywords: [
    "about ebextractor",
    "ebextractor story",
    "ebextractor goals",
    "about us ebextractor",
    "company information ebextractor",
    "ebextractor mission",
    "ebextractor vision",
    "team ebextractor",
    "ebextractor background",
    "ebextractor values",
    "ebextractor history",
    "ebextractor founders",
    "ebextractor purpose",
    "ebextractor objectives",
    "ebextractor overview",
  ],
  openGraph: {
    title: "About Ebextractor - Story, and Goals",
    description:
      "Learn about Ebextractor's story and goals. Discover how we aim to simplify online shopping by providing a multi-marketplace search engine that compares prices across platforms like eBay, Amazon, and AliExpress.",
    url: "https://www.ebextractor.com/about",
    siteName: "Ebextractor",
    images: [
      {
        url: "/logo-icon-transparent.png",
        width: 1200,
        height: 630,
        alt: "Ebextractor - eBay Image Search Tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Ebextractor - Story, and Goals",
    description:
      "Learn about Ebextractor's story and goals. Discover how we aim to simplify online shopping by providing a multi-marketplace search engine that compares prices across platforms like eBay, Amazon, and AliExpress.",
    images: ["/logo-icon-transparent.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.ebextractor.com/about",
  },
  description: ``,
  other: {
    "pinterest-rich-pin": "true",
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
