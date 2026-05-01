export interface Item {
  itemId: string;
  shortDescription: string;
  sellerItemRevision: string;
  title: string;
  gtin?: string;
  mpn?: string;
  price: Price;
  categoryPath: string;
  categoryIdPath: string;
  condition: string;
  conditionId: string;
  conditionDescription?: string;
  itemLocation: ItemLocation;
  image: Image;
  additionalImages: Image[];
  brand: string;
  itemCreationDate: Date;
  seller: Seller;
  estimatedAvailabilities: EstimatedAvailability[];
  shippingOptions: ShippingOption[];
  shipToLocations: ShipToLocations;
  returnTerms: ReturnTerms;
  taxes: Tax[];
  localizedAspects: LocalizedAspect[];
  topRatedBuyingExperience: boolean;
  buyingOptions: string[];
  itemAffiliateWebUrl: string;
  itemWebUrl: string;
  description: string;
  paymentMethods: PaymentMethod[];
  enabledForGuestCheckout: boolean;
  eligibleForInlineCheckout: boolean;
  lotSize: number;
  legacyItemId: string;
  priorityListing: boolean;
  adultOnly: boolean;
  categoryId: string;
  listingMarketplaceId: string;
  primaryItemGroup?: IPrimaryItemGroup;
  marketingPrice?: IMarketingPrice;
}

export interface IMarketingPrice {
  originalPrice: {
    value: string;
    currency: string;
  };
  discountPercentage: string;
  discountAmount: {
    value: string;
    currency: string;
  };
  priceTreatment: string;
}
export interface IPrimaryItemGroup {
  itemGroupId: string;
  itemGroupType: "SELLER_DEFINED_VARIATIONS";
  itemGroupHref: string;
  itemGroupTitle: string;
  itemGroupImage: {
    imageUrl: string;
    width: number;
    height: number;
  };
  itemGroupAdditionalImages: {
    imageUrl: string;
    width: number;
    height: number;
  }[];
}

export interface Image {
  imageUrl: string;
  width: number;
  height: number;
}

export interface EstimatedAvailability {
  deliveryOptions: string[];
  availabilityThresholdType: string;
  availabilityThreshold: number;
  estimatedAvailabilityStatus: string;
  estimatedSoldQuantity: number;
  estimatedRemainingQuantity: number;
}

export interface ItemLocation {
  city: string;
  stateOrProvince: string;
  postalCode: string;
  country: string;
}

export interface LocalizedAspect {
  type: string;
  name: string;
  value: string;
}

export interface PaymentMethod {
  paymentMethodType: string;
  paymentMethodBrands?: PaymentMethodBrand[];
}

export interface PaymentMethodBrand {
  paymentMethodBrandType: string;
}

export interface Price {
  value: string;
  currency: string;
}

export interface ReturnTerms {
  returnsAccepted: boolean;
  returnShippingCostPayer: string;
  returnPeriod: ReturnPeriod;
}

export interface ReturnPeriod {
  value: number;
  unit: string;
}

export interface Seller {
  userId: string;
  username: string;
  feedbackPercentage: string;
  feedbackScore: number;
  sellerLegalInfo: SellerLegalInfo;
}

export interface SellerLegalInfo {}

export interface ShipToLocations {
  regionIncluded: RegionCluded[];
  regionExcluded: RegionCluded[];
}

export interface RegionCluded {
  regionName?: string;
  regionType: RegionExcludedRegionType;
  regionId: string;
}

export enum RegionExcludedRegionType {
  Country = "COUNTRY",
}

export interface ShippingOption {
  shippingServiceCode: string;
  type: string;
  shippingCost: Price;
  quantityUsedForEstimate: number;
  minEstimatedDeliveryDate: Date;
  maxEstimatedDeliveryDate: Date;
  additionalShippingCostPerUnit: Price;
  shippingCostType: string;
}

export interface Tax {
  taxJurisdiction: TaxJurisdiction;
  taxType: TaxType;
  shippingAndHandlingTaxed: boolean;
  includedInPrice: boolean;
  ebayCollectAndRemitTax: boolean;
}

export interface TaxJurisdiction {
  region: Region;
  taxJurisdictionId: string;
}

export interface Region {
  regionName: string;
  regionType: RegionRegionType;
}

export enum RegionRegionType {
  StateOrProvince = "STATE_OR_PROVINCE",
}

export enum TaxType {
  StateSalesTax = "STATE_SALES_TAX",
}
