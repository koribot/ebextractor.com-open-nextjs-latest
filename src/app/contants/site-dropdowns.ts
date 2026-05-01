export const CANT_ACCESS_DEALS_EBAY_SITES = [
  "EBAY_HK",
  "EBAY_SG",
  "EBAY_IE",
  "EBAY_NL",
  "EBAY_AT",
  "EBAY_CH",
  "EBAY_BE",
  "EBAY_PL",
] as const;

export const EBAY_SITE_OPTIONS = [
  { code: "EBAY_US", label: "United States" },
  { code: "EBAY_GB", label: "United Kingdom" },
  { code: "EBAY_DE", label: "Germany" },
  { code: "EBAY_AU", label: "Australia" },
  { code: "EBAY_IT", label: "Italy" },
  { code: "EBAY_CA", label: "Canada" },
  { code: "EBAY_ES", label: "Spain" },
  { code: "EBAY_FR", label: "France" },
  { code: "EBAY_PL", label: "Poland" },
  { code: "EBAY_NL", label: "Netherlands" },
  { code: "EBAY_AT", label: "Austria" },
  { code: "EBAY_CH", label: "Switzerland" },
  { code: "EBAY_BE", label: "Belgium" },
  { code: "EBAY_HK", label: "Hong Kong" },
  { code: "EBAY_SG", label: "Singapore" },
  { code: "EBAY_IE", label: "Ireland" },
] as const;

export const AMAZON_SITE_OPTIONS = [
  { code: "amazon.com", label: "United States" },
  { code: "amazon.co.uk", label: "United Kingdom" },
] as const;

export const ALIEXPRESS_SITE_OPTIONS = [
  { code: "USD", label: "United States" },
  { code: "GBP", label: "United Kingdom" },
  { code: "CAD", label: "Canada" },
  { code: "EUR", label: "European Union" },
  { code: "UAH", label: "Ukraine" },
  { code: "MXN", label: "Mexico" },
  { code: "TRY", label: "Türkiye" },
  { code: "RUB", label: "Russia" },
  { code: "BRL", label: "Brazil" },
  { code: "AUD", label: "Australia" },
  { code: "INR", label: "India" },
  { code: "JPY", label: "Japan" },
  { code: "IDR", label: "Indonesia" },
  { code: "SEK", label: "Sweden" },
  { code: "KRW", label: "South Korea" },
  { code: "THB", label: "Thailand" },
  { code: "CLP", label: "Chile" },
  { code: "VND", label: "Vietnam" },
] as const;