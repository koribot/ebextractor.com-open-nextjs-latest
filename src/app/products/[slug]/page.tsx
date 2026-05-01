import ProductsContentPerCategory from "@/app/components/products/ProductsContentPerCategory";
import { categories } from "@/app/contants/categories";
import MainLayout from "@/app/layout/MainLayout";
import { logger } from "@/app/utils/logger";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    site?: string;
  }>;
};

export const generateMetadata = async ({ params }: PageProps) => {
  const { slug } = await params;
  const parentCategory = categories.find((c) => c.normalizedUriName === slug);
  const subCategory = categories
    .flatMap((c) => c.subCategories || [])
    .find((sub) => sub.normalizedUriName === slug);

  const displayCategory = parentCategory || subCategory;

  if (!displayCategory) {
    return notFound();
  }

  return {
    title: `Ebextractor | ${displayCategory.name}`,
    description: displayCategory.description,
  };
};

export default async function Page({ params, searchParams }: PageProps) {
  const awaitedSearchParams = await searchParams;
  const { slug } = await params;
  const allParams = new URLSearchParams(awaitedSearchParams).toString();
  // Find either parent category or subcategory that matches the slug
  const parentCategory = categories.find((c) => c.normalizedUriName === slug);
  const subCategory = categories
    .flatMap((c) => c.subCategories || [])
    .find((sub) => sub.normalizedUriName === slug);

  const displayCategory = parentCategory || subCategory;
  const parentCategoryId = parentCategory?.id || subCategory?.id.split("-")[0];
  const subCategoriesforParent = categories.find(
    (c) => c.id === parentCategoryId
  )?.subCategories;

  if (!displayCategory) {
    return notFound();
  }

  // Find the parent category for breadcrumb purposes
  const parent = parentCategory
    ? null
    : categories.find((c) =>
        c.subCategories?.some((sub) => sub.normalizedUriName === slug)
      );

  return (
    <MainLayout>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-blue-900 dark:bg-light-gray text-white py-4 sm:py-6 px-4 sm:px-5">
          <div className="mx-auto max-w-7xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 sm:gap-2 mb-3 text-blue-100 text-xs sm:text-sm overflow-x-auto pb-2">
              <a
                href="/products"
                className="hover:text-white transition-colors whitespace-nowrap"
              >
                Products
              </a>
              <span className="text-blue-100">/</span>
              {parent && (
                <>
                  <a
                    href={`/products/${parent.normalizedUriName}${
                      awaitedSearchParams && awaitedSearchParams.site
                        ? `?${allParams.toString()}`
                        : ``
                    }`}
                    className="hover:text-white transition-colors whitespace-nowrap"
                  >
                    {parent.name}
                  </a>
                  <span className="text-blue-100">/</span>
                </>
              )}
              <span className="text-white font-medium underline whitespace-nowrap">
                {displayCategory.name}
              </span>
            </div>

            {/* Title and Description */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold break-words">
                {displayCategory.name}
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {displayCategory.description}
              </p>
            </div>

            {/* Subcategories Navigation - Mobile Responsive */}
            {subCategoriesforParent && (
              <div className="mt-4 sm:mt-6">
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  {subCategoriesforParent.map((sub) => (
                    <a
                      key={sub.normalizedUriName}
                      href={`/products/${sub.normalizedUriName}${
                        awaitedSearchParams && awaitedSearchParams.site
                          ? `?${allParams.toString()}`
                          : ``
                      }`}
                      className={`pb-2 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        slug === sub.normalizedUriName
                          ? "text-white border-b-2 border-white"
                          : "text-blue-100 border-b-2 border-transparent hover:text-white hover:border-blue-300"
                      }`}
                    >
                      {sub.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-5 py-6 sm:py-12">
          {/* Products Grid */}
          <ProductsContentPerCategory
            displayCategory={displayCategory}
            currentSlug={slug}
          />
        </div>
      </div>
    </MainLayout>
  );
}
