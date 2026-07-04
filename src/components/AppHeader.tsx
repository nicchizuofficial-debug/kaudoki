import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../theme/theme';

interface AppHeaderProps {
  onBack?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onBack }) => {
  const theme = useAppTheme();

  if (onBack) {
    return (
      <View style={[styles.container, styles.compact, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={theme.primaryText} />
        </Pressable>
        <Text style={[styles.brandNameCompact, { color: theme.primaryText }]}>
          カウドキ<Text style={{ color: theme.accentRed }}>！</Text>
        </Text>
        <View style={styles.backButton} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={styles.brandRow}>
        <LinearGradient colors={[theme.ctaFrom, theme.ctaTo]} style={styles.logoBadge}>
          <Ionicons name="notifications" size={15} color="#ffffff" />
        </LinearGradient>
        <Text style={[styles.brandName, { color: theme.primaryText }]}>
          カウドキ<Text style={{ color: theme.accentRed }}>！</Text>
        </Text>
      </View>
      <Text style={[styles.tagline, { color: theme.mutedText }]}>値下げ、見逃さない。</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    width: 30,
  },
  brandNameCompact: {
    fontSize: 17,
    fontWeight: '800',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 11,
    marginTop: 3,
    marginLeft: 40,
    letterSpacing: 0.2,
  },
});
