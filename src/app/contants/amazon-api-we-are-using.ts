function getAmazonApiType(envVar: string | undefined): 'SCRAPE' | 'PAAPI' {
  if (envVar === 'SCRAPE' || envVar === 'PAAPI') {
    return envVar;
  } else {
    return 'SCRAPE';
  }
}
export const WHAT_AMAZON_API_WE_ARE_USING: 'SCRAPE' | 'PAAPI' = getAmazonApiType(process.env.NEXT_PUBLIC_WHAT_AMAZON_API);
