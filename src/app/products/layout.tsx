import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products - Explore a Wide Range of Products | Ebextractor",
  description:
    "Explore a wide range of products on Ebextractor, Find the best deals across multiple marketplaces",
};
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
