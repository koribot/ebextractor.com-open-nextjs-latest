import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deals - Find the Best Deals Across various Marketplaces | Ebextractor",
};
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
