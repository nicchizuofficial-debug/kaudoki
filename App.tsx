import React, { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { ProductListScreen } from './src/screens/ProductListScreen';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';
import { ProductSearchScreen } from './src/screens/ProductSearchScreen';
import { initialProducts } from './src/data/mockProducts';
import { getCatalogEntry } from './src/data/catalog';
import { buildProduct, buildProductFromRakutenItem } from './src/data/productFactory';
import type { RakutenSearchResult } from './src/data/rakutenSearch';
import { ensureNotificationPermission, sendPriceAlertNotification } from './src/notifications/priceAlerts';
import type { ProductDetailData } from './src/types/product';

type Screen = { name: 'list' } | { name: 'detail'; id: string } | { name: 'search' };

function bestOfferOf(item: ProductDetailData) {
  return [...item.offers].sort((a, b) => a.price - b.price)[0];
}

export default function App() {
  const [products, setProducts] = useState<ProductDetailData[]>(initialProducts);
  const [screen, setScreen] = useState<Screen>({ name: 'list' });

  const trackedIds = useMemo(() => new Set(products.map((item) => item.product.id)), [products]);

  const selectedProduct = useMemo(() => {
    if (screen.name !== 'detail') return null;
    return products.find((item) => item.product.id === screen.id) ?? null;
  }, [screen, products]);

  const handleAddProduct = (item: RakutenSearchResult) => {
    const id = `rakuten-${item.itemCode}`;
    if (trackedIds.has(id)) return;
    setProducts((prev) => [...prev, buildProductFromRakutenItem(item)]);
  };

  const handleSetAlert = useCallback(
    async (id: string, threshold: number) => {
      await ensureNotificationPermission();

      setProducts((prev) =>
        prev.map((item) =>
          item.product.id === id ? { ...item, product: { ...item.product, alertThreshold: threshold } } : item
        )
      );

      const current = products.find((item) => item.product.id === id);
      if (current) {
        const best = bestOfferOf(current);
        if (best.price <= threshold) {
          await sendPriceAlertNotification(current.product.title, best.price, best.shopName);
        }
      }
    },
    [products]
  );

  const handleClearAlert = useCallback((id: string) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.product.id === id ? { ...item, product: { ...item.product, alertThreshold: undefined } } : item
      )
    );
  }, []);

  const handleRefreshPrice = useCallback(
    async (id: string) => {
      const entry = getCatalogEntry(id);
      if (!entry) {
        Alert.alert('未対応', 'この商品は楽天商品検索APIから追加されたため、自動での価格再取得にはまだ対応していません。');
        return;
      }

      const current = products.find((item) => item.product.id === id);
      const threshold = current?.product.alertThreshold;
      const refreshed = buildProduct(entry);
      const merged: ProductDetailData = {
        ...refreshed,
        product: { ...refreshed.product, alertThreshold: threshold },
      };

      setProducts((prev) => prev.map((item) => (item.product.id === id ? merged : item)));

      if (threshold != null) {
        const best = bestOfferOf(merged);
        if (best.price <= threshold) {
          await sendPriceAlertNotification(merged.product.title, best.price, best.shopName);
        }
      }
    },
    [products]
  );

  if (screen.name === 'search') {
    return (
      <ProductSearchScreen
        trackedIds={trackedIds}
        onBack={() => setScreen({ name: 'list' })}
        onAddProduct={handleAddProduct}
      />
    );
  }

  if (selectedProduct) {
    return (
      <ProductDetailScreen
        data={selectedProduct}
        onBack={() => setScreen({ name: 'list' })}
        onSetAlert={handleSetAlert}
        onClearAlert={handleClearAlert}
        onRefreshPrice={handleRefreshPrice}
      />
    );
  }

  return (
    <ProductListScreen
      products={products}
      onSelectProduct={(id) => setScreen({ name: 'detail', id })}
      onAddPress={() => setScreen({ name: 'search' })}
    />
  );
}
