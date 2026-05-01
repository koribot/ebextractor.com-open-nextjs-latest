import { Metadata } from "next";

export const metadata: Metadata = {
  title: "eBay Image Search - Find Similar Products by Photo | Ebextractor",
  metadataBase: new URL("https://www.ebextractor.com"),
  keywords: [
    "eBay image search",
    "reverse image search eBay",
    "search by photo eBay",
    "visual search eBay",
    "find similar products",
    "eBay photo finder",
    "image recognition shopping",
    "reverse product search",
    "eBay visual search tool",
    "search eBay with picture",
    "find product by image",
    "eBay image finder",
    "product image search",
    "eBay reverse lookup",
    "visual product search",
  ],
  openGraph: {
    title: "eBay Image Search - Find Similar Products by Photo",
    description:
      "Upload any product image and instantly find similar items on eBay. Our advanced image search technology helps you discover matching products, compare prices, and find the best deals.",
    url: "https://www.ebextractor.com/ebay-image-search",
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
    title: "eBay Image Search - Find Products by Photo",
    description:
      "Upload any image to find similar products on eBay. Compare prices and discover the best deals with visual search.",
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
    canonical: "https://www.ebextractor.com/ebay-image-search",
  },
  description: `Discover products on eBay using images with Ebextractor's advanced visual search tool. 
  Upload a photo or paste an image URL to instantly find similar items across eBay's marketplace. 
  Our image recognition technology analyzes your photo and returns matching products with prices, 
  seller ratings, and shipping information. Perfect for finding exact matches, similar styles, 
  or identifying unknown products. Whether you're searching for electronics, fashion, collectibles, 
  home goods, or any product category, Ebextractor's image search makes it easy to find what you're 
  looking for. Compare prices, check seller feedback, and discover the best deals - all from a single image. 
  Support for multiple eBay sites worldwide with real-time results and accurate product matching.`,
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
