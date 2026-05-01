import type { MetadataRoute } from "next";
import { categories } from "./contants/categories";

const BASE_URL = "https://www.ebextractor.com";

type SitemapItem = MetadataRoute.Sitemap[number];

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  const categoryPages: SitemapItem[] = categories.flatMap((category) => {
    const basePages: SitemapItem[] = [
      {
        url: `${BASE_URL}/deals/${category.normalizedUriName}`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/products/${category.normalizedUriName}`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.8,
      },
    ];

    const subPages: SitemapItem[] =
      category.subCategories?.flatMap((sub) => [
        {
          url: `${BASE_URL}/deals/${sub.normalizedUriName}`,
          lastModified: currentDate,
          changeFrequency: "weekly",
          priority: 0.7,
        },
        {
          url: `${BASE_URL}/products/${sub.normalizedUriName}`,
          lastModified: currentDate,
          changeFrequency: "weekly",
          priority: 0.7,
        },
      ]) ?? [];

    return [...basePages, ...subPages];
  });

  const staticPages: SitemapItem[] = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: "always",
      priority: 1,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: currentDate,
      changeFrequency: "always",
      priority: 1,
    },
    {
      url: `${BASE_URL}/ebay-image-search`,
      lastModified: currentDate,
      changeFrequency: "always",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date("2024-01-10"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date("2024-01-10"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date("2024-01-10"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms-and-conditions`,
      lastModified: new Date("2024-01-10"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/affiliate-disclosure`,
      lastModified: new Date("2024-01-10"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/deals`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  return [...staticPages, ...categoryPages];
}
