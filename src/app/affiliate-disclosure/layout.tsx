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
  description: ` Ebextractor participates in the following affiliate programs: eBay Partner Network (EPN), Amazon Associates Program`,
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
}
