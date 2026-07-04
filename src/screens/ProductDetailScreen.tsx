import React, { useMemo } from 'react';
import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PriceChart } from '../components/PriceChart';
import { ShopOfferList } from '../components/ShopOfferList';
import { PriceAlertCard } from '../components/PriceAlertCard';
import { AppHeader } from '../components/AppHeader';
import { cardShadow, useAppTheme } from '../theme/theme';
import type { ProductDetailData } from '../types/product';

interface ProductDetailScreenProps {
  data: ProductDetailData;
  onBack: () => void;
  onSetAlert: (id: string, threshold: number) => void;
  onClearAlert: (id: string) => void;
  onRefreshPrice: (id: string) => void;
}

const GREAT_DEAL_THRESHOLD = 1.03;

function formatFullDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  data,
  onBack,
  onSetAlert,
  onClearAlert,
  onRefreshPrice,
}) => {
  const theme = useAppTheme();
  const { product, priceHistory, offers } = data;

  const { latestPoint, bestOffer, avgPrice, deltaPct, isGreatDeal } = useMemo(() => {
    const prices = priceHistory.map((point) => point.price);
    const minPrice = Math.min(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const bestOffer = [...offers].sort((a, b) => a.price - b.price)[0];
    const deltaPct = ((bestOffer.price - avgPrice) / avgPrice) * 100;

    return {
      latestPoint: priceHistory[priceHistory.length - 1],
      bestOffer,
      avgPrice,
      deltaPct,
      isGreatDeal: bestOffer.price <= minPrice * GREAT_DEAL_THRESHOLD,
    };
  }, [priceHistory, offers]);

  const isBelowAverage = deltaPct < 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.page }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />

      <AppHeader onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            styles.header,
            cardShadow(theme),
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {isGreatDeal && (
            <LinearGradient
              colors={[theme.ctaFrom, theme.ctaTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.dealBanner}
            >
              <Ionicons name="flame" size={14} color="#ffffff" />
              <Text style={styles.dealBannerText}>今が買い時！過去30日の最安値クラス</Text>
            </LinearGradient>
          )}

          <View style={styles.imageWrap}>
            <View style={[styles.glow, styles.glowFar, { backgroundColor: theme.ctaFrom }]} />
            <View style={[styles.glow, styles.glowMid, { backgroundColor: theme.ctaFrom }]} />
            <View style={[styles.glow, styles.glowNear, { backgroundColor: theme.ctaTo }]} />
            <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
          </View>

          <Text style={[styles.productTitle, { color: theme.primaryText }]} numberOfLines={2}>
            {product.title}
          </Text>

          <View style={styles.priceRow}>
            <Text style={[styles.currentPrice, { color: theme.accentRed }]}>
              ¥{bestOffer.price.toLocaleString()}
            </Text>
            <Text style={[styles.currencyNote, { color: theme.secondaryText }]}>（税込・{bestOffer.shopName}）</Text>
          </View>

          <View style={styles.deltaRow}>
            <Ionicons
              name={isBelowAverage ? 'trending-down' : 'trending-up'}
              size={14}
              color={isBelowAverage ? theme.goodGreen : theme.mutedText}
            />
            <Text style={[styles.deltaText, { color: isBelowAverage ? theme.goodGreen : theme.mutedText }]}>
              平均（¥{Math.round(avgPrice).toLocaleString()}）より{Math.abs(deltaPct).toFixed(1)}%
              {isBelowAverage ? '安い' : '高い'}
            </Text>
          </View>

          <Text style={[styles.apiNote, { color: theme.mutedText }]}>
            {formatFullDate(latestPoint.date)}時点の価格（各社公式APIより取得）
          </Text>
        </View>

        <PriceChart priceHistory={priceHistory} />

        <PriceAlertCard
          currentPrice={bestOffer.price}
          threshold={product.alertThreshold}
          onSave={(threshold) => onSetAlert(product.id, threshold)}
          onClear={() => onClearAlert(product.id)}
          onRefreshPrice={() => onRefreshPrice(product.id)}
        />

        <ShopOfferList offers={offers} />

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
  },
  header: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  dealBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 6,
  },
  dealBannerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  imageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
  },
  glowFar: {
    width: 280,
    height: 280,
    opacity: 0.1,
  },
  glowMid: {
    width: 240,
    height: 240,
    opacity: 0.14,
    top: 8,
  },
  glowNear: {
    width: 205,
    height: 205,
    opacity: 0.2,
    top: 12,
  },
  image: {
    width: 190,
    height: 190,
    borderRadius: 16,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
    lineHeight: 22,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: '800',
  },
  currencyNote: {
    fontSize: 13,
    marginLeft: 6,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  apiNote: {
    fontSize: 11,
    marginTop: 10,
  },
  spacer: {
    height: 8,
  },
});
