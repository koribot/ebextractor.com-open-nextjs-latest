import { Metadata } from "next";
import MainLayout from "../layout/MainLayout";

export const metadata: Metadata = {
  title: "Terms and Conditions | eBextractor",
  metadataBase: new URL("https://www.ebextractor.com"),
  openGraph: {
    images: ["/logo-icon-transparent.png"],
  },
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
  alternates: {
    canonical: "https://www.ebextractor.com/terms-and-conditions",
  },
  description: ` By accessing and using Ebextractor and its services, you agree
                to be bound by these Terms and Conditions, our Privacy Policy,
                and any additional terms and conditions that may apply to
                specific sections of our website or to products and services
                available through our website or from Ebextractor.`,
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
}
