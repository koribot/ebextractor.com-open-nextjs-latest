export const ebaySiteUrlMapping: Record<string, string> = {
  EBAY_US: "https://www.ebay.com/",
  EBAY_GB: "https://www.ebay.co.uk/",
  EBAY_DE: "https://www.ebay.de/",
  EBAY_AU: "https://www.ebay.com.au/",
  EBAY_IT: "https://www.ebay.it/",
  EBAY_CA: "https://www.ebay.ca/",
  EBAY_ES: "https://www.ebay.es/",
  EBAY_FR: "https://www.ebay.fr/",
  EBAY_HK: "https://www.ebay.com.hk/",
  EBAY_SG: "https://www.ebay.com.sg/",
  EBAY_IE: "https://www.ebay.ie/",
  EBAY_PL: "https://www.ebay.pl/",
  EBAY_NL: "https://www.ebay.nl/",
  EBAY_AT: "https://www.ebay.at/",
  EBAY_CH: "https://www.ebay.ch/",
  EBAY_BE: "https://www.ebay.be/",
};
export const ebaySiteCodeToNameMapping: Record<string, string> = {
  EBAY_US: "Ebay USA",
  EBAY_GB: "Ebay UK",
  EBAY_DE: "Ebay Germany",
  EBAY_AU: "Ebay Australia",
  EBAY_IT: "Ebay Italy",
  EBAY_CA: "Ebay Canada",
  EBAY_ES: "Ebay Spain",
  EBAY_FR: "Ebay France",
  EBAY_HK: "Ebay Hong Kong",
  EBAY_SG: "Ebay Singapore",
  EBAY_IE: "Ebay Ireland",
  EBAY_PL: "Ebay Poland",
  EBAY_NL: "Ebay Netherlands",
  EBAY_AT: "Ebay Austria",
  EBAY_CH: "Ebay Switzerland",
  EBAY_BE: "Ebay Belgium",
};
export const ebaySiteToAmazonMapping: Record<string, string> = {
  EBAY_US: "https://www.amazon.com/",
  EBAY_GB: "https://www.amazon.co.uk/",
  EBAY_DE: "https://www.amazon.de/",
  EBAY_AU: "https://www.amazon.com.au/",
  EBAY_IT: "https://www.amazon.it/",
  EBAY_CA: "https://www.amazon.ca/",
  EBAY_ES: "https://www.amazon.es/",
  EBAY_FR: "https://www.amazon.fr/",
  EBAY_HK: "https://www.amazon.com.hk/", // Note: Amazon HK redirects to Amazon Global
  EBAY_SG: "https://www.amazon.sg/",
  EBAY_IE: "https://www.amazon.ie/", // Note: Not a standalone Amazon domain, use .co.uk or .de
  EBAY_PL: "https://www.amazon.pl/",
  EBAY_NL: "https://www.amazon.nl/",
  EBAY_AT: "https://www.amazon.de/", // Austria uses Amazon Germany
  EBAY_CH: "https://www.amazon.de/", // Switzerland mostly uses Amazon Germany or France
  EBAY_BE: "https://www.amazon.fr/", // Belgium often uses Amazon France or Germany
};

export const ebaySiteCountryMapping: Record<string, string> = {
  EBAY_US: "United States",
  EBAY_GB: "United Kingdom",
  EBAY_DE: "Germany",
  EBAY_AU: "Australia",
  EBAY_IT: "Italy",
  EBAY_CA: "Canada",
  EBAY_ES: "Spain",
  EBAY_FR: "France",
  EBAY_HK: "Hong Kong",
  EBAY_SG: "Singapore",
  EBAY_IE: "Ireland",
  EBAY_PL: "Poland",
  EBAY_NL: "Netherlands",
  EBAY_AT: "Austria",
  EBAY_CH: "Switzerland",
  EBAY_BE: "Belgium",
};

export const ebayMarketPlaceCodeToISOCountryCode: Record<string, string> = {
  EBAY_US: "US", // United States
  EBAY_GB: "GB", // United Kingdom
  EBAY_DE: "DE", // Germany
  EBAY_AU: "AU", // Australia
  EBAY_IT: "IT", // Italy
  EBAY_CA: "CA", // Canada
  EBAY_ES: "ES", // Spain
  EBAY_FR: "FR", // France
  EBAY_HK: "HK", // Hong Kong
  EBAY_SG: "SG", // Singapore
  EBAY_IE: "IE", // Ireland
  EBAY_PL: "PL", // Poland
  EBAY_NL: "NL", // Netherlands
  EBAY_AT: "AT", // Austria
  EBAY_CH: "CH", // Switzerland
  EBAY_BE: "BE", // Belgium
}

export const ebaySiteCurrencySymbolMapping: Record<string, string> = {
  EBAY_US: "$",
  EBAY_GB: "£",
  EBAY_DE: "€",
  EBAY_AU: "$",
  EBAY_IT: "€",
  EBAY_CA: "$",
  EBAY_ES: "€",
  EBAY_FR: "€",
  EBAY_HK: "$",
  EBAY_SG: "$",
  EBAY_IE: "€",
  EBAY_PL: "zł",
  EBAY_NL: "€",
  EBAY_AT: "€",
  EBAY_CH: "Fr",
  EBAY_BE: "€",
};

export const ebaySiteLocaleMapping: Record<string, string> = {
  EBAY_US: "en-US", // United States
  EBAY_GB: "en-GB", // United Kingdom
  EBAY_DE: "de-DE", // Germany
  EBAY_AU: "en-AU", // Australia
  EBAY_IT: "it-IT", // Italy
  EBAY_CA: "en-CA", // Canada (assumes English, change to fr-CA for French)
  EBAY_ES: "es-ES", // Spain
  EBAY_FR: "fr-FR", // France
  EBAY_HK: "zh-HK", // Hong Kong
  EBAY_SG: "en-SG", // Singapore (not in your list but en-SG is standard)
  EBAY_IE: "en-IE", // Ireland
  EBAY_PL: "pl-PL", // Poland
  EBAY_NL: "nl-NL", // Netherlands
  EBAY_AT: "de-AT", // Austria
  EBAY_CH: "de-CH", // Switzerland (defaulted to German)
  EBAY_BE: "fr-BE", // Belgium (defaulted to French; could also be nl-BE)
};
