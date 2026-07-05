import React, { useMemo } from 'react';
import { FlatList, Image, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppHeader } from '../components/AppHeader';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { cardShadow, useAppTheme, type AppTheme } from '../theme/theme';
import type { ProductDetailData } from '../types/product';

interface ProductListScreenProps {
  products: ProductDetailData[];
  onSelectProduct: (id: string) => void;
  onAddPress: () => void;
}

const GREAT_DEAL_THRESHOLD = 1.03;

function getBestOffer(item: ProductDetailData) {
  return [...item.offers].sort((a, b) => a.price - b.price)[0];
}

function ProductRow({
  item,
  theme,
  onPress,
}: {
  item: ProductDetailData;
  theme: AppTheme;
  onPress: () => void;
}) {
  const bestOffer = useMemo(() => getBestOffer(item), [item]);
  const isGreatDeal = useMemo(() => {
    if (item.priceHistory.length < 5) return false;
    const minPrice = Math.min(...item.priceHistory.map((point) => point.price));
    return bestOffer.price <= minPrice * GREAT_DEAL_THRESHOLD;
  }, [item, bestOffer]);

  return (
    <AnimatedPressable
      onPress={onPress}
      scaleTo={0.97}
      style={[styles.card, cardShadow(theme), { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <View style={[styles.thumbRing, { borderColor: theme.border }]}>
        <Image source={{ uri: item.product.imageUrl }} style={styles.thumb} resizeMode="cover" />
        {item.product.alertThreshold != null && (
          <View style={[styles.alertBadge, { backgroundColor: theme.accentRed, borderColor: theme.surface }]}>
            <Ionicons name="notifications" size={11} color="#ffffff" />
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.title, { color: theme.primaryText }]} numberOfLines={2}>
          {item.product.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: theme.accentRed }]}>¥{bestOffer.price.toLocaleString()}</Text>
          <Text style={[styles.shopTag, { color: theme.mutedText }]}>{bestOffer.shopName}が最安</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="storefront-outline" size={12} color={theme.mutedText} />
          <Text style={[styles.compareNote, { color: theme.mutedText }]}>
            {item.offers.length}ショップの価格を比較中
          </Text>
        </View>

        {isGreatDeal && (
          <LinearGradient colors={[theme.ctaFrom, theme.ctaTo]} style={styles.dealChip}>
            <Ionicons name="flame" size={11} color="#ffffff" />
            <Text style={styles.dealChipText}>買い時</Text>
          </LinearGradient>
        )}
      </View>

      <Ionicons name="chevron-forward" size={18} color={theme.mutedText} />
    </AnimatedPressable>
  );
}

export const ProductListScreen: React.FC<ProductListScreenProps> = ({ products, onSelectProduct, onAddPress }) => {
  const theme = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.page }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />

      <AppHeader />

      <FlatList
        data={products}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>価格をパトロール中の商品</Text>
            <Text style={[styles.sectionCount, { color: theme.mutedText }]}>{products.length}件</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductRow item={item} theme={theme} onPress={() => onSelectProduct(item.product.id)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <AnimatedPressable
        onPress={onAddPress}
        scaleTo={0.9}
        style={[styles.fab, cardShadow(theme)]}
        accessibilityRole="button"
        accessibilityLabel="商品を追加"
      >
        <LinearGradient colors={[theme.ctaFrom, theme.ctaTo]} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color="#ffffff" />
        </LinearGradient>
      </AnimatedPressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  thumbRing: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 2,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  alertBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
    gap: 6,
  },
  price: {
    fontSize: 19,
    fontWeight: '800',
  },
  shopTag: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  compareNote: {
    fontSize: 11,
  },
  dealChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 6,
    gap: 3,
  },
  dealChipText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    borderRadius: 28,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
