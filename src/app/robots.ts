import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/ebay-image-search', '/ebay-search-by-seller', '/search'],
      },
    ],
    sitemap: 'https://yoursite.com/sitemap.xml', // optional
  }
}