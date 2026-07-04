import React, { useCallback, useMemo } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from './AnimatedPressable';
import { cardShadow, useAppTheme, type AppTheme } from '../theme/theme';
import type { ShopOffer } from '../types/product';

interface ShopOfferListProps {
  offers: ShopOffer[];
}

function shopColor(theme: AppTheme, shopId: ShopOffer['shopId']): string {
  if (shopId === 'amazon') return theme.shopAmazon;
  if (shopId === 'yahoo') return theme.shopYahoo;
  return theme.shopRakuten;
}

function formatCheckedAt(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}時点`;
}

async function openOffer(url: string) {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('リンクを開けませんでした', 'しばらくしてから再度お試しください。');
    }
  } catch {
    Alert.alert('エラー', 'リンクを開く際に問題が発生しました。');
  }
}

export const ShopOfferList: React.FC<ShopOfferListProps> = ({ offers }) => {
  const theme = useAppTheme();
  const sorted = useMemo(() => [...offers].sort((a, b) => a.price - b.price), [offers]);

  const handlePress = useCallback((url: string) => {
    openOffer(url);
  }, []);

  return (
    <View style={[styles.card, cardShadow(theme), { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.titleRow}>
        <Ionicons name="storefront-outline" size={16} color={theme.seriesBlue} />
        <Text style={[styles.cardTitle, { color: theme.primaryText }]}>ショップ別の価格を比較</Text>
      </View>

      {sorted.map((offer, index) => {
        const isBest = index === 0;
        const color = shopColor(theme, offer.shopId);

        if (isBest) {
          return (
            <AnimatedPressable
              key={offer.shopId}
              onPress={() => handlePress(offer.affiliateUrl)}
              scaleTo={0.97}
              style={styles.bestRowWrap}
            >
              <LinearGradient
                colors={[theme.ctaFrom, theme.ctaTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bestRow}
              >
                <View style={styles.shopBadgeBest}>
                  <Text style={styles.shopBadgeTextBest}>{offer.shopName.charAt(0)}</Text>
                </View>
                <View style={styles.rowBody}>
                  <View style={styles.bestTopLine}>
                    <Text style={styles.bestShopName}>{offer.shopName}</Text>
                    <View style={styles.bestChip}>
                      <Text style={styles.bestChipText}>最安</Text>
                    </View>
                  </View>
                  <Text style={styles.bestPrice}>¥{offer.price.toLocaleString()}</Text>
                  <Text style={styles.bestCheckedAt}>
                    {formatCheckedAt(offer.lastCheckedAt)}（公式APIより取得）
                  </Text>
                </View>
                <Ionicons name="cart" size={20} color="#ffffff" />
              </LinearGradient>
            </AnimatedPressable>
          );
        }

        return (
          <AnimatedPressable
            key={offer.shopId}
            onPress={() => handlePress(offer.affiliateUrl)}
            scaleTo={0.98}
            style={[styles.row, { borderTopColor: theme.gridline }]}
          >
            <View style={[styles.shopBadge, { backgroundColor: color }]}>
              <Text style={styles.shopBadgeText}>{offer.shopName.charAt(0)}</Text>
            </View>
            <View style={styles.rowBody}>
              <Text style={[styles.shopName, { color: theme.primaryText }]}>{offer.shopName}</Text>
              <Text style={[styles.checkedAt, { color: theme.mutedText }]}>
                {formatCheckedAt(offer.lastCheckedAt)}（公式APIより取得）
              </Text>
            </View>
            <Text style={[styles.price, { color: theme.secondaryText }]}>¥{offer.price.toLocaleString()}</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.mutedText} />
          </AnimatedPressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 12,
    overflow: 'hidden',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 18,
    marginBottom: 12,
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bestRowWrap: {
    marginHorizontal: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  shopBadgeBest: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopBadgeTextBest: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  rowBody: {
    flex: 1,
  },
  bestTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bestShopName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  bestChip: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 6,
  },
  bestChipText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  bestPrice: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  bestCheckedAt: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    paddingVertical: 12,
    paddingHorizontal: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  shopBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  shopName: {
    fontSize: 13,
    fontWeight: '600',
  },
  checkedAt: {
    fontSize: 11,
    marginTop: 1,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 2,
  },
});
