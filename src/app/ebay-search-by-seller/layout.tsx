import { Metadata } from "next";

export const metadata: Metadata = {
  title: "eBay Search by Seller | Ebextractor",
  metadataBase: new URL("https://www.ebextractor.com"),
  keywords: [
    "multi marketplace search",
    "compare prices online",
    "product price comparison",
    "eBay Amazon search",
    "AliExpress product finder",
    "online shopping search engine",
    "best deals finder",
    "cross-platform product search",
    "marketplace comparison tool",
    "real-time price comparison",
    "product availability checker",
    "shopping comparison engine",
    "unified marketplace search",
    "global marketplace search",
    "international shopping comparison",
    "electronics price comparison",
    "fashion deals finder",
    "home goods search",
    "collectibles marketplace search",
    "wholesale price comparison",
    "retail arbitrage tool",
    "product finder",
    "reseller search tool",
    "price tracker multi platform",
    "universal product search",
  ],
  openGraph: {
    title: "Search on ebay by using seller name together with keywords",
    description:
      "Search millions of products on ebay by using seller name together with keywords. Compare prices from multiple marketplaces in one place and find the best deals with Ebextractor's universal search engine.",
    url: "https://www.ebextractor.com/ebay-search-by-seller",
    siteName: "Ebextractor",
    images: [
      {
        url: "/logo-icon-transparent.png",
        width: 1200,
        height: 630,
        alt: "Ebextractor - Multi-Marketplace Product Search & Price Comparison Tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search on ebay by using seller name together with keywords",
    description:
      "Find the best deals across eBay, Amazon, AliExpress, and more with one unified search. Real-time price comparison across multiple platforms.",
    images: ["/logo-icon-transparent.png"],
    creator: "@ebextractor",
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
    canonical: "https://www.ebextractor.com/ebay-search-by-seller",
  },
  description:
    "Find the best deals across eBay, Amazon, AliExpress, and more with one unified search. Real-time price comparison across multiple platforms.",
  applicationName: "Ebextractor",
  referrer: "origin-when-cross-origin",
  authors: [{ name: "Ebextractor" }],
  creator: "Ebextractor",
  publisher: "Ebextractor",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "E-commerce",
  other: {
    "pinterest-rich-pin": "true",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
