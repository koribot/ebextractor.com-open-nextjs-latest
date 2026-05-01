import CategorySidebar from "@/app/components/deals/CategorySidebar";
import DealsSlugContent from "@/app/components/deals/DealsSlugContent";
import { categories } from "@/app/contants/categories";
import MainLayout from "@/app/layout/MainLayout";
import { notFound } from "next/navigation";
import React from "react";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const generateMetadata = async ({ params }: PageProps) => {
  const { slug } = await params;
  const category = categories.find(
    (c) =>
      c.normalizedUriName === slug ||
      c.subCategories?.some((sub) => sub.normalizedUriName === slug)
  );
  const subCategory = category?.subCategories?.find(
    (sub) => sub.normalizedUriName === slug
  );
  const displayCategory = subCategory || category;
  if (!displayCategory) {
    return notFound();
  }
  return {
    title: `Deals | ${displayCategory.name} - Ebextractor`,
    description: `Find Best Deals, Discounted Price in ${displayCategory.description} - Ebextractor`,
  };
};

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  return (
    <MainLayout>
      <div className="bg-main-white dark:bg-light-dark">
        <div className="flex p-5 flex-col lg:flex-row">
          {/* Sidebar */}
          <CategorySidebar path="deals" />

          {/* Main Content Area */}
          <DealsSlugContent categoryNameFromUrl={slug} />
        </div>
      </div>
    </MainLayout>
  );
};

export default page;
