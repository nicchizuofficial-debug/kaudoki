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

function mapItem(item: RakutenApiItem): RakutenSearchResult {
  return {
    itemCode: item.itemCode,
    title: item.itemName,
    imageUrl: (item.mediumImageUrls?.[0]?.imageUrl ?? '').replace(/\?.*$/, ''),
    price: item.itemPrice,
    shopName: item.shopName,
    itemUrl: item.affiliateUrl ?? item.itemUrl,
  };
}

async function callSearchEndpoint(params: Record<string, string>): Promise<RakutenApiResponse> {
  const search = new URLSearchParams({
    applicationId: RAKUTEN_APP_ID,
    affiliateId: RAKUTEN_AFFILIATE_ID,
    format: 'json',
    ...params,
  });

  const response = await fetch(`${SEARCH_ENDPOINT}?${search.toString()}`);
  const data: RakutenApiResponse = await response.json();

  if (data.error) {
    throw new Error(data.error_description ?? data.error);
  }

  return data;
}

export function isRakutenConfigured(): boolean {
  return RAKUTEN_APP_ID !== 'YOUR_RAKUTEN_APP_ID' && RAKUTEN_APP_ID.length > 0;
}

export async function searchRakutenItems(keyword: string): Promise<RakutenSearchResult[]> {
  const data = await callSearchEndpoint({ keyword, hits: '20' });
  return (data.Items ?? []).map(({ Item: item }) => mapItem(item));
}

/** Re-fetches a single tracked item's current price/details by its exact item code. */
export async function fetchRakutenItemByCode(itemCode: string): Promise<RakutenSearchResult | null> {
  const data = await callSearchEndpoint({ itemCode });
  const wrapper = data.Items?.[0];
  return wrapper ? mapItem(wrapper.Item) : null;
}
