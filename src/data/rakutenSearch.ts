/**
 * Rakuten Ichiba Item Search API client.
 * Register an app at https://webservice.rakuten.co.jp/ to obtain an application ID.
 */

const RAKUTEN_APP_ID: string = 'YOUR_RAKUTEN_APP_ID';
const RAKUTEN_AFFILIATE_ID = '55844017.6cee9c62.55844018.ab51d449';

const SEARCH_ENDPOINT = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601';

export interface RakutenSearchResult {
  itemCode: string;
  title: string;
  imageUrl: string;
  price: number;
  shopName: string;
  /** Affiliate-wrapped product URL, ready to open directly */
  itemUrl: string;
}

interface RakutenApiItem {
  itemCode: string;
  itemName: string;
  itemPrice: number;
  shopName: string;
  itemUrl: string;
  affiliateUrl?: string;
  mediumImageUrls?: { imageUrl: string }[];
}

interface RakutenApiResponse {
  Items?: { Item: RakutenApiItem }[];
  error?: string;
  error_description?: string;
}

export function isRakutenConfigured(): boolean {
  return RAKUTEN_APP_ID !== 'YOUR_RAKUTEN_APP_ID' && RAKUTEN_APP_ID.length > 0;
}

export async function searchRakutenItems(keyword: string): Promise<RakutenSearchResult[]> {
  const params = new URLSearchParams({
    applicationId: RAKUTEN_APP_ID,
    affiliateId: RAKUTEN_AFFILIATE_ID,
    keyword,
    format: 'json',
    hits: '20',
  });

  const response = await fetch(`${SEARCH_ENDPOINT}?${params.toString()}`);
  const data: RakutenApiResponse = await response.json();

  if (data.error) {
    throw new Error(data.error_description ?? data.error);
  }

  return (data.Items ?? []).map(({ Item: item }) => ({
    itemCode: item.itemCode,
    title: item.itemName,
    imageUrl: (item.mediumImageUrls?.[0]?.imageUrl ?? '').replace(/\?.*$/, ''),
    price: item.itemPrice,
    shopName: item.shopName,
    itemUrl: item.affiliateUrl ?? item.itemUrl,
  }));
}
