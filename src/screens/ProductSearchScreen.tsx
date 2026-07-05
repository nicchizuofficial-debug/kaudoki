import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppHeader } from '../components/AppHeader';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { isRakutenConfigured, searchRakutenItems, type RakutenSearchResult } from '../data/rakutenSearch';
import { cardShadow, useAppTheme, type AppTheme } from '../theme/theme';

interface ProductSearchScreenProps {
  trackedIds: Set<string>;
  onBack: () => void;
  onAddProduct: (item: RakutenSearchResult) => void;
}

type Phase = 'idle' | 'searching' | 'done' | 'error';

function ResultRow({
  item,
  theme,
  isTracked,
  onAdd,
}: {
  item: RakutenSearchResult;
  theme: AppTheme;
  isTracked: boolean;
  onAdd: () => void;
}) {
  return (
    <View style={[styles.resultCard, cardShadow(theme), { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Image source={{ uri: item.imageUrl }} style={styles.resultThumb} resizeMode="cover" />
      <View style={styles.resultBody}>
        <Text style={[styles.resultTitle, { color: theme.primaryText }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.resultPrice, { color: theme.accentRed }]}>¥{item.price.toLocaleString()}</Text>
        <View style={styles.resultMetaRow}>
          <Ionicons name="storefront-outline" size={12} color={theme.mutedText} />
          <Text style={[styles.resultMetaText, { color: theme.mutedText }]} numberOfLines={1}>
            {item.shopName}（楽天市場）
          </Text>
        </View>
      </View>

      {isTracked ? (
        <View style={[styles.trackedChip, { borderColor: theme.border }]}>
          <Ionicons name="checkmark" size={13} color={theme.mutedText} />
          <Text style={[styles.trackedChipText, { color: theme.mutedText }]}>追跡中</Text>
        </View>
      ) : (
        <AnimatedPressable onPress={onAdd} scaleTo={0.92} style={styles.addButtonWrap}>
          <LinearGradient colors={[theme.ctaFrom, theme.ctaTo]} style={styles.addButton}>
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text style={styles.addButtonText}>追加</Text>
          </LinearGradient>
        </AnimatedPressable>
      )}
    </View>
  );
}

export const ProductSearchScreen: React.FC<ProductSearchScreenProps> = ({ trackedIds, onBack, onAddProduct }) => {
  const theme = useAppTheme();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [results, setResults] = useState<RakutenSearchResult[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!submittedQuery) return;

    let cancelled = false;
    setPhase('searching');
    setResults([]);
    setErrorMessage('');

    if (!isRakutenConfigured()) {
      setErrorMessage(
        '楽天ウェブサービスのアプリIDが未設定です。src/data/rakutenSearch.ts のRAKUTEN_APP_IDを設定してください。'
      );
      setPhase('error');
      return;
    }

    searchRakutenItems(submittedQuery)
      .then((items) => {
        if (cancelled) return;
        setResults(items);
        setPhase('done');
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setErrorMessage(error.message || '検索に失敗しました。しばらくしてから再度お試しください。');
        setPhase('error');
      });

    return () => {
      cancelled = true;
    };
  }, [submittedQuery]);

  const handleSubmit = useCallback(() => {
    if (!query.trim()) return;
    setSubmittedQuery(query.trim());
  }, [query]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.page }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <AppHeader onBack={onBack} />

      <View style={styles.content}>
        <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.mutedText} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            placeholder="商品名で検索（楽天市場）"
            placeholderTextColor={theme.mutedText}
            style={[styles.searchInput, { color: theme.primaryText }]}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={theme.mutedText} />
            </Pressable>
          )}
        </View>

        {phase === 'idle' && (
          <View style={styles.centerState}>
            <Ionicons name="pricetags-outline" size={40} color={theme.mutedText} />
            <Text style={[styles.centerText, { color: theme.mutedText }]}>
              商品名を入力すると、楽天市場の実在する商品を{'\n'}楽天商品検索APIでリアルタイムに検索します
            </Text>
          </View>
        )}

        {phase === 'searching' && (
          <View style={styles.apiStatusRow}>
            <ActivityIndicator size="small" color={theme.seriesBlue} />
            <Text style={[styles.apiStatusText, { color: theme.secondaryText }]}>楽天商品検索APIで検索中…</Text>
          </View>
        )}

        {phase === 'error' && (
          <View style={styles.centerState}>
            <Ionicons name="warning-outline" size={40} color={theme.accentRed} />
            <Text style={[styles.centerText, { color: theme.mutedText }]}>{errorMessage}</Text>
          </View>
        )}

        {phase === 'done' && results.length === 0 && (
          <View style={styles.centerState}>
            <Ionicons name="sad-outline" size={40} color={theme.mutedText} />
            <Text style={[styles.centerText, { color: theme.mutedText }]}>
              「{submittedQuery}」に一致する商品が見つかりませんでした
            </Text>
          </View>
        )}

        {phase === 'done' && results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.itemCode}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={[styles.resultsCount, { color: theme.mutedText }]}>{results.length}件見つかりました</Text>
            }
            renderItem={({ item }) => (
              <ResultRow
                item={item}
                theme={theme}
                isTracked={trackedIds.has(`rakuten-${item.itemCode}`)}
                onAdd={() => onAddProduct(item)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 2,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 72,
    paddingHorizontal: 24,
    gap: 12,
  },
  centerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  apiStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    justifyContent: 'center',
    gap: 10,
  },
  apiStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultsList: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  resultsCount: {
    fontSize: 12,
    marginBottom: 10,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    gap: 10,
  },
  resultThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  resultBody: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  resultPrice: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  resultMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  resultMetaText: {
    fontSize: 10,
    flexShrink: 1,
  },
  addButtonWrap: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 3,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  trackedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 7,
    gap: 3,
  },
  trackedChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
