export type ShopId = 'amazon' | 'rakuten' | 'yahoo';

export interface ShopOffer {
  shopId: ShopId;
  shopName: string;
  price: number;
  /** Affiliate link used by the shop's CTA */
  affiliateUrl: string;
  /** ISO 8601 datetime this offer's price was fetched from the shop's official API */
  lastCheckedAt: string;
}

export interface PricePoint {
  /** ISO 8601 date string, e.g. "2026-06-05" */
  date: string;
  price: number;
}

export interface Product {
  id: string;
  title: string;
  imageUrl: string;
  currency: 'JPY';
  /** User-configured price alert: notify when the best offer drops to or below this amount */
  alertThreshold?: number;
}

export interface ProductDetailData {
  product: Product;
  /** Ascending by date, expected to cover the last 30 days (lowest price seen each day) */
  priceHistory: PricePoint[];
  /** Current price per shop, one entry per API source (Amazon PA-API / Rakuten / Yahoo!ショッピングAPI) */
  offers: ShopOffer[];
}
