import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from './AnimatedPressable';
import { cardShadow, useAppTheme } from '../theme/theme';

interface PriceAlertCardProps {
  currentPrice: number;
  threshold?: number;
  onSave: (threshold: number) => void;
  onClear: () => void;
  onRefreshPrice: () => void;
}

function suggestedThreshold(currentPrice: number): string {
  return String(Math.round((currentPrice * 0.9) / 10) * 10);
}

export const PriceAlertCard: React.FC<PriceAlertCardProps> = ({
  currentPrice,
  threshold,
  onSave,
  onClear,
  onRefreshPrice,
}) => {
  const theme = useAppTheme();
  const [isEditing, setIsEditing] = useState(threshold == null);
  const [inputValue, setInputValue] = useState(String(threshold ?? suggestedThreshold(currentPrice)));

  const achieved = threshold != null && currentPrice <= threshold;

  const handleSave = () => {
    const value = Number(inputValue.replace(/[^0-9]/g, ''));
    if (!value || value <= 0) {
      Alert.alert('金額を入力してください', '1円以上の金額を指定してください。');
      return;
    }
    onSave(value);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setInputValue(String(threshold ?? suggestedThreshold(currentPrice)));
    setIsEditing(true);
  };

  return (
    <View style={[styles.card, cardShadow(theme), { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.titleRow}>
        <Ionicons name="notifications-outline" size={16} color={theme.seriesBlue} />
        <Text style={[styles.cardTitle, { color: theme.primaryText }]}>値下げ通知</Text>
      </View>

      {isEditing ? (
        <>
          <View style={[styles.editRow, { borderColor: theme.border, backgroundColor: theme.page }]}>
            <Text style={[styles.yen, { color: theme.primaryText }]}>¥</Text>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="number-pad"
              style={[styles.input, { color: theme.primaryText }]}
              placeholder="9000"
              placeholderTextColor={theme.mutedText}
            />
            <Text style={[styles.editSuffix, { color: theme.secondaryText }]}>以下で通知</Text>
          </View>

          <AnimatedPressable onPress={handleSave} scaleTo={0.97} style={styles.saveButtonWrap}>
            <LinearGradient colors={[theme.ctaFrom, theme.ctaTo]} style={styles.saveButton}>
              <Ionicons name="notifications" size={15} color="#ffffff" />
              <Text style={styles.saveButtonText}>この価格で通知を設定</Text>
            </LinearGradient>
          </AnimatedPressable>
        </>
      ) : (
        <>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: achieved ? theme.goodGreen : theme.seriesBlue },
              ]}
            />
            <Text style={[styles.statusText, { color: theme.primaryText }]}>
              ¥{(threshold ?? 0).toLocaleString()}以下になったら通知
            </Text>
          </View>

          {achieved ? (
            <View style={[styles.achievedBanner, { backgroundColor: theme.page, borderColor: theme.border }]}>
              <Ionicons name="checkmark-circle" size={14} color={theme.goodGreen} />
              <Text style={[styles.achievedText, { color: theme.goodGreen }]}>
                条件を満たしています（現在¥{currentPrice.toLocaleString()}）
              </Text>
            </View>
          ) : (
            <Text style={[styles.watchingText, { color: theme.mutedText }]}>
              現在¥{currentPrice.toLocaleString()} — 監視を継続中
            </Text>
          )}

          <View style={styles.actionsRow}>
            <AnimatedPressable
              onPress={onRefreshPrice}
              scaleTo={0.95}
              style={[styles.secondaryButton, { borderColor: theme.border }]}
            >
              <Ionicons name="refresh" size={14} color={theme.secondaryText} />
              <Text style={[styles.secondaryButtonText, { color: theme.secondaryText }]}>価格を再チェック</Text>
            </AnimatedPressable>
            <AnimatedPressable
              onPress={handleEdit}
              scaleTo={0.95}
              style={[styles.secondaryButton, { borderColor: theme.border }]}
            >
              <Ionicons name="create-outline" size={14} color={theme.secondaryText} />
              <Text style={[styles.secondaryButtonText, { color: theme.secondaryText }]}>編集</Text>
            </AnimatedPressable>
            <AnimatedPressable
              onPress={onClear}
              scaleTo={0.9}
              style={[styles.iconButton, { borderColor: theme.border }]}
              accessibilityLabel="通知を削除"
            >
              <Ionicons name="trash-outline" size={15} color={theme.accentRed} />
            </AnimatedPressable>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 4,
  },
  yen: {
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 8,
  },
  editSuffix: {
    fontSize: 12,
  },
  saveButtonWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  achievedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 10,
    gap: 6,
  },
  achievedText: {
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
  },
  watchingText: {
    fontSize: 12,
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 5,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconButton: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 9,
    marginLeft: 'auto',
  },
});
