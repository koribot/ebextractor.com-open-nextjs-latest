import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Ebextractor - Search on Ebay, Amazon and other Marketplaces | Deals | Ebay Research",
  metadataBase: new URL("https://www.ebextractor.com"),
  keywords: [
    "ebay",
    "amazon",
    "search",
    "products",
    "price comparison",
    "product research",
    "eCommerce",
    "online shopping",
    "auction platform",
    "marketplace",
    "shopping tools",
    "shopping insights",
    "seller tools",
    "product analysis",
    "competitive analysis",
    "market research",
    "product discovery",
    "product listing",
    "product catalog",
    "product feed",
    "product data",
    "product information",
    "product specs",
    "product reviews",
    "product ratings",
    "product images",
    "product videos",
    "product descriptions",
    "product attributes",
    "product categories",
    "product tags",
    "product filters",
    "product sorting",
    "product search",
    "product navigation",
    "product browsing",
    "product comparison tools",
    "product recommendation tools",
    "product discovery tools",
    "product listing tools",
    "product catalog tools",
    "product feed tools",
    "product data tools",
    "product information tools",
    "product specs tools",
    "product reviews tools",
    "product ratings tools",
    "product images tools",
    "product videos tools",
    "product descriptions tools",
    "product attributes tools",
    "product categories tools",
    "product tags tools",
    "product filters tools",
    "product sorting tools",
    "product search tools",
    "product navigation tools",
    "product browsing tools",
    "product comparison services",
    "product recommendation services",
    "product discovery services",
    "product listing services",
    "product catalog services",
    "product feed services",
    "product data services",
    "product information services",
    "product specs services",
    "product reviews services",
    "product ratings services",
    "product images services",
    "product videos services",
    "product descriptions services",
    "product attributes services",
    "product categories services",
    "product tags services",
    "product filters services",
    "product sorting services",
    "product search services",
    "product navigation services",
    "product browsing services",
  ],
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
    },
  },
  openGraph: {
    images: ["/logo-icon-transparent.png"],
  },
  description: `Ebextractor is your go-to tool for product search on eBay, Amazon and other marketplaces. With Ebextractor, you can compare prices, find deals, and get real-time updates on product availability and price drop notifications, 
    In eBextractor you can search on multiple platforms at once. Additionally, 
    Ebextractor provides valuable research insights for eBay sellers, including the highest price, 
    average price, lowest price, middle price, keyword & price counter, and more. 
    Whether you're a seasoned seller or just starting out, Ebextractor helps you make informed decisions and stay competitive in the market.`,
  alternates: {
    canonical: "https://www.ebextractor.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Global Site Tag (gtag.js) - Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-9G59XLKR4F"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-9G59XLKR4F');
            `,
          }}
        />

        {/* Puter.js */}
        {/* <Script src="https://js.puter.com/v2/" strategy="beforeInteractive" /> */}


        {/* Google AdSense */}
        {/* <Script
          id="adsense-script"
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1641237888636714"
          crossOrigin="anonymous"
        /> */}


      </head>
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
