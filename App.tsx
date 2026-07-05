import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { ProductListScreen } from './src/screens/ProductListScreen';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';
import { ProductSearchScreen } from './src/screens/ProductSearchScreen';
import { initialProducts } from './src/data/mockProducts';
import { getCatalogEntry } from './src/data/catalog';
import { buildProduct, buildProductFromRakutenItem, applyRakutenPriceUpdate } from './src/data/productFactory';
import { fetchRakutenItemByCode, isRakutenConfigured, type RakutenSearchResult } from './src/data/rakutenSearch';
import { loadStoredProducts, saveStoredProducts } from './src/data/persistence';
import { ensureNotificationPermission, sendPriceAlertNotification } from './src/notifications/priceAlerts';
import type { ProductDetailData } from './src/types/product';

type Screen = { name: 'list' } | { name: 'detail'; id: string } | { name: 'search' };

const RAKUTEN_ID_PREFIX = 'rakuten-';

function bestOfferOf(item: ProductDetailData) {
  return [...item.offers].sort((a, b) => a.price - b.price)[0];
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [products, setProducts] = useState<ProductDetailData[]>(initialProducts);
  const [screen, setScreen] = useState<Screen>({ name: 'list' });
  const hasLoadedRef = useRef(false);

  const trackedIds = useMemo(() => new Set(products.map((item) => item.product.id)), [products]);

  const selectedProduct = useMemo(() => {
    if (screen.name !== 'detail') return null;
    return products.find((item) => item.product.id === screen.id) ?? null;
  }, [screen, products]);

  // Load persisted tracked products on launch, then check for any Rakuten
  // items that haven't had their price checked yet today.
  useEffect(() => {
    (async () => {
      const stored = await loadStoredProducts();
      const loaded = stored ?? initialProducts;
      setProducts(loaded);
      hasLoadedRef.current = true;

      if (!isRakutenConfigured()) return;

      const today = todayString();
      const staleRakutenProducts = loaded.filter(
        (item) =>
          item.product.id.startsWith(RAKUTEN_ID_PREFIX) &&
          item.priceHistory[item.priceHistory.length - 1]?.date !== today
      );

      for (const product of staleRakutenProducts) {
        const itemCode = product.product.id.slice(RAKUTEN_ID_PREFIX.length);
        try {
          const fresh = await fetchRakutenItemByCode(itemCode);
          if (!fresh) continue;

          const updated = applyRakutenPriceUpdate(product, fresh);
          setProducts((prev) => prev.map((item) => (item.product.id === product.product.id ? updated : item)));

          const threshold = product.product.alertThreshold;
          if (threshold != null) {
            const best = bestOfferOf(updated);
            if (best.price <= threshold) {
              await sendPriceAlertNotification(updated.product.title, best.price, best.shopName);
            }
          }
        } catch {
          // Skip this product's daily check; try again next launch.
        }
      }
    })();
  }, []);

  // Persist whenever the tracked product list changes (after the initial load).
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    saveStoredProducts(products);
  }, [products]);

  const handleAddProduct = (item: RakutenSearchResult) => {
    const id = `${RAKUTEN_ID_PREFIX}${item.itemCode}`;
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
      const current = products.find((item) => item.product.id === id);
      if (!current) return;
      const threshold = current.product.alertThreshold;

      if (id.startsWith(RAKUTEN_ID_PREFIX)) {
        const itemCode = id.slice(RAKUTEN_ID_PREFIX.length);
        try {
          const fresh = await fetchRakutenItemByCode(itemCode);
          if (!fresh) {
            Alert.alert('取得失敗', '楽天商品検索APIから最新価格を取得できませんでした。');
            return;
          }
          const updated = applyRakutenPriceUpdate(current, fresh);
          setProducts((prev) => prev.map((item) => (item.product.id === id ? updated : item)));

          if (threshold != null) {
            const best = bestOfferOf(updated);
            if (best.price <= threshold) {
              await sendPriceAlertNotification(updated.product.title, best.price, best.shopName);
            }
          }
        } catch (error) {
          Alert.alert('取得失敗', error instanceof Error ? error.message : '価格の再チェックに失敗しました。');
        }
        return;
      }

      const entry = getCatalogEntry(id);
      if (!entry) return;

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
