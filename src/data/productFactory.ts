import type { PricePoint, ProductDetailData, ShopOffer } from '../types/product';
import type { RakutenSearchResult } from './rakutenSearch';

const HISTORY_DAYS = 30;

export interface CatalogEntry {
  id: string;
  title: string;
  imageUrl: string;
  basePrice: number;
  dipDaysAgo: number;
  dipAmount: number;
  waveAmplitude: number;
  jitters: { amazon: number; rakuten: number; yahoo: number };
  urls: { amazon: string; rakuten: string; yahoo: string };
}

function generatePriceHistory(
  spec: Pick<CatalogEntry, 'basePrice' | 'dipDaysAgo' | 'dipAmount' | 'waveAmplitude'>
): PricePoint[] {
  const today = new Date();
  const history: PricePoint[] = [];

  for (let daysAgo = HISTORY_DAYS - 1; daysAgo >= 0; daysAgo--) {
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);

    const wave = Math.sin((HISTORY_DAYS - daysAgo) / 5) * spec.waveAmplitude;
    const dip = daysAgo === spec.dipDaysAgo ? -spec.dipAmount : 0;
    const noise = (Math.random() - 0.5) * (spec.waveAmplitude * 0.5);
    const price = Math.round(spec.basePrice + wave + dip + noise);

    history.push({ date: date.toISOString().slice(0, 10), price });
  }

  return history;
}

function checkedMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function buildOffers(
  latestPrice: number,
  jitters: CatalogEntry['jitters'],
  urls: CatalogEntry['urls']
): ShopOffer[] {
  return [
    {
      shopId: 'amazon',
      shopName: 'Amazon',
      price: latestPrice + jitters.amazon,
      affiliateUrl: urls.amazon,
      lastCheckedAt: checkedMinutesAgo(12),
    },
    {
      shopId: 'rakuten',
      shopName: '楽天市場',
      price: latestPrice + jitters.rakuten,
      affiliateUrl: urls.rakuten,
      lastCheckedAt: checkedMinutesAgo(4),
    },
    {
      shopId: 'yahoo',
      shopName: 'Yahoo!ショッピング',
      price: latestPrice + jitters.yahoo,
      affiliateUrl: urls.yahoo,
      lastCheckedAt: checkedMinutesAgo(27),
    },
  ];
}

export function buildProduct(entry: CatalogEntry): ProductDetailData {
  const priceHistory = generatePriceHistory(entry);
  const latestPrice = priceHistory[priceHistory.length - 1].price;

  return {
    product: {
      id: entry.id,
      title: entry.title,
      imageUrl: entry.imageUrl,
      currency: 'JPY',
    },
    priceHistory,
    offers: buildOffers(latestPrice, entry.jitters, entry.urls),
  };
}

/**
 * Builds a newly tracked product from a real Rakuten Ichiba search result.
 * There's no history yet — it starts as a single real data point for today
 * and grows day by day as `applyRakutenPriceUpdate` records fresh checks.
 */
export function buildProductFromRakutenItem(item: RakutenSearchResult): ProductDetailData {
  const today = new Date().toISOString().slice(0, 10);

  return {
    product: {
      id: `rakuten-${item.itemCode}`,
      title: item.title,
      imageUrl: item.imageUrl,
      currency: 'JPY',
    },
    priceHistory: [{ date: today, price: item.price }],
    offers: [
      {
        shopId: 'rakuten',
        shopName: item.shopName,
        price: item.price,
        affiliateUrl: item.itemUrl,
        lastCheckedAt: new Date().toISOString(),
      },
    ],
  };
}

/**
 * Merges a freshly fetched Rakuten price into a tracked product's history:
 * updates today's point if already checked today, otherwise appends a new
 * day, keeping at most the last 30 days.
 */
export function applyRakutenPriceUpdate(product: ProductDetailData, fresh: RakutenSearchResult): ProductDetailData {
  const today = new Date().toISOString().slice(0, 10);
  const history = [...product.priceHistory];
  const lastPoint = history[history.length - 1];

  if (lastPoint?.date === today) {
    history[history.length - 1] = { date: today, price: fresh.price };
  } else {
    history.push({ date: today, price: fresh.price });
  }

  return {
    ...product,
    priceHistory: history.slice(-HISTORY_DAYS),
    offers: [
      {
        shopId: 'rakuten',
        shopName: fresh.shopName,
        price: fresh.price,
        affiliateUrl: fresh.itemUrl,
        lastCheckedAt: new Date().toISOString(),
      },
    ],
  };
}
