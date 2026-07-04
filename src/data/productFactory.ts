import type { PricePoint, ProductDetailData, ShopOffer } from '../types/product';

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

/** Preview price range shown in search results, before the full history is generated. */
export function previewPriceRange(entry: CatalogEntry): { min: number; max: number } {
  const prices = [
    entry.basePrice + entry.jitters.amazon,
    entry.basePrice + entry.jitters.rakuten,
    entry.basePrice + entry.jitters.yahoo,
  ];
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
