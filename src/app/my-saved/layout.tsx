import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Saved - Manage your saved items | Ebextractor",
  description: "Manage your saved items on Ebextractor",
};
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
