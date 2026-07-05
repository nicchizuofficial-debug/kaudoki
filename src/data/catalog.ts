import type { CatalogEntry } from './productFactory';

function urlsFor(seed: string): CatalogEntry['urls'] {
  return {
    amazon: `https://www.amazon.co.jp/dp/B0${seed.toUpperCase()}?tag=nicchizu-22`,
    rakuten: `https://hb.afl.rakuten.co.jp/hgc/55844017.6cee9c62.55844018.ab51d449/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fexample-shop%2F${seed}%2F`,
    yahoo: `https://store.shopping.yahoo.co.jp/example-shop/${seed}.html?sc_i=YOUR_VALUECOMMERCE_ID`,
  };
}

export const CATALOG: CatalogEntry[] = [
  {
    id: 'prod_001',
    title: 'ワイヤレスノイズキャンセリングヘッドホン WH-1000XM6',
    imageUrl: 'https://picsum.photos/seed/headphones/400/400',
    basePrice: 12800,
    dipDaysAgo: 9,
    dipAmount: 1800,
    waveAmplitude: 600,
    jitters: { amazon: 180, rakuten: -320, yahoo: 90 },
    urls: urlsFor('headphones01'),
  },
  {
    id: 'prod_002',
    title: 'ロボット掃除機 パワーサイクロン RX-9',
    imageUrl: 'https://picsum.photos/seed/robotvacuum/400/400',
    basePrice: 38000,
    dipDaysAgo: 14,
    dipAmount: 4200,
    waveAmplitude: 1200,
    jitters: { amazon: -650, rakuten: 420, yahoo: 210 },
    urls: urlsFor('robotvacuum02'),
  },
  {
    id: 'prod_003',
    title: 'メカニカルキーボード SILENT-TKL 静音赤軸',
    imageUrl: 'https://picsum.photos/seed/keyboard/400/400',
    basePrice: 9800,
    dipDaysAgo: 5,
    dipAmount: 1100,
    waveAmplitude: 350,
    jitters: { amazon: 60, rakuten: 140, yahoo: -190 },
    urls: urlsFor('keyboard03'),
  },
  {
    id: 'prod_004',
    title: 'モバイルバッテリー 20000mAh PD急速充電対応',
    imageUrl: 'https://picsum.photos/seed/powerbank/400/400',
    basePrice: 4200,
    dipDaysAgo: 11,
    dipAmount: 700,
    waveAmplitude: 200,
    jitters: { amazon: -110, rakuten: 60, yahoo: 40 },
    urls: urlsFor('powerbank04'),
  },
  {
    id: 'prod_005',
    title: '4Kウェブカメラ オートフォーカス ノイズキャンセルマイク内蔵',
    imageUrl: 'https://picsum.photos/seed/webcam/400/400',
    basePrice: 8600,
    dipDaysAgo: 20,
    dipAmount: 1300,
    waveAmplitude: 300,
    jitters: { amazon: 130, rakuten: -80, yahoo: 220 },
    urls: urlsFor('webcam05'),
  },
  {
    id: 'prod_006',
    title: '音波振動歯ブラシ ホワイトニングモード搭載',
    imageUrl: 'https://picsum.photos/seed/toothbrush/400/400',
    basePrice: 6400,
    dipDaysAgo: 3,
    dipAmount: 900,
    waveAmplitude: 220,
    jitters: { amazon: -60, rakuten: 30, yahoo: -140 },
    urls: urlsFor('toothbrush06'),
  },
  {
    id: 'prod_007',
    title: '折りたたみ電動アシスト自転車 20インチ',
    imageUrl: 'https://picsum.photos/seed/ebike/400/400',
    basePrice: 89000,
    dipDaysAgo: 17,
    dipAmount: 8500,
    waveAmplitude: 2500,
    jitters: { amazon: 1200, rakuten: -1800, yahoo: 500 },
    urls: urlsFor('ebike07'),
  },
  {
    id: 'prod_008',
    title: '全自動コーヒーメーカー ミル内蔵 ドリップ式',
    imageUrl: 'https://picsum.photos/seed/coffeemaker/400/400',
    basePrice: 15400,
    dipDaysAgo: 8,
    dipAmount: 2100,
    waveAmplitude: 450,
    jitters: { amazon: -280, rakuten: 190, yahoo: -50 },
    urls: urlsFor('coffeemaker08'),
  },
];

export const DEFAULT_TRACKED_IDS: readonly string[] = ['prod_001', 'prod_002', 'prod_003'];

export function searchCatalog(query: string): CatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CATALOG.filter((entry) => entry.title.toLowerCase().includes(q));
}

export function getCatalogEntry(id: string): CatalogEntry | undefined {
  return CATALOG.find((entry) => entry.id === id);
}
