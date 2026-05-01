import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Product Search - Multi-Marketplace - Compare Prices Across All Platforms | Ebextractor",
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
    title: "Search Multiple Marketplaces - Compare Prices Across All Platforms",
    description:
      "Search millions of products across eBay, Amazon, AliExpress, and more. Compare prices from multiple marketplaces in one place and find the best deals with Ebextractor's universal search engine.",
    url: "https://www.ebextractor.com/search",
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
    title: "Search All Marketplaces - Compare Prices Instantly",
    description:
      "Find the best deals across eBay, Amazon, AliExpress, and more with one unified search. Real-time price comparison across multiple platforms.",
    images: ["/logo-icon-transparent.png"],
    creator: "@ebextractor",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.ebextractor.com/search",
  },
  description:
    "Search and compare products across eBay, Amazon, AliExpress, and more marketplaces in one place. Find the best deals with real-time price comparison.",
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

// import { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Search - Ebextractor - Ebay and Amazon Search",
//   metadataBase: new URL('https://www.ebextractor.com'),
//    openGraph: {
//     images: ['/logo-icon-transparent.png'],
//   },
//   robots: {
//     index: true,
//     follow: true,
//     nocache: true,
//     googleBot: {
//       index: true,
//       follow: true,
//       noimageindex: true,
//     },
//   },
//   alternates: {
//     canonical: 'https://www.ebextractor.com/search',
//   },
//   description: `Discover the convenience of searching for products on both eBay and Amazon with Ebextractor.
//   Ebextractor search tool allows you to find the best products with just one query.
//   Whether you're looking for electronics, home goods, fashion, or anything else,
//   Ebextractor makes it easy to compare prices and find the best value.
//   Ebextractor search results are updated in real-time,
//   so you can be sure you're getting the latest and most accurate information.`
// };

// export default function Layout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>){
//   return(
//     children
//   )
// }
