import SavedItems from "@/app/components/my-saved/SavedItems";
import SavedSearches from "@/app/components/my-saved/SavedSearches";
import SavedSellers from "@/app/components/my-saved/SavedSellers";
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
  return {
    title: `My Saved | ${slug} - Ebextractor`,
    description: `Explore your saved ${slug} on Ebextractor`,
  };
};

const SavedSlugPage = async ({ params }: PageProps) => {
  const { slug } = await params;

  // Validate slug before rendering - this prevents hooks from being called conditionally
  const validSlugs = ['items', 'searches', 'sellers'];
  if (!validSlugs.includes(slug)) {
    notFound();
  }

  // Map slug to corresponding component
  const renderContent = () => {
    switch (slug) {
      case 'items':
        return <SavedItems />;
      
      case 'searches':
        return <SavedSearches />;
      
      case 'sellers':
        return <SavedSellers />;
      
      default:
        // This should never happen now due to validation above
        return null;
    }
  };

  return (
    <MainLayout>
      {renderContent()}
    </MainLayout>
  );
};

export default SavedSlugPage;