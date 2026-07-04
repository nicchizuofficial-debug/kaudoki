import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Circle, Rect, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { cardShadow, useAppTheme } from '../theme/theme';
import type { PricePoint } from '../types/product';

interface PriceChartProps {
  priceHistory: PricePoint[];
}

const screenWidth = Dimensions.get('window').width;
const CARD_MARGIN = 16;
const CHART_HEIGHT = 220;
const LABEL_INTERVAL = 6;

function formatMonthDay(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export const PriceChart: React.FC<PriceChartProps> = ({ priceHistory }) => {
  const theme = useAppTheme();

  const { labels, prices, minIndex, minPrice, lastIndex } = useMemo(() => {
    const prices = priceHistory.map((point) => point.price);
    const minPrice = Math.min(...prices);
    const minIndex = prices.indexOf(minPrice);
    const lastIndex = prices.length - 1;

    const labels = priceHistory.map((point, index) => {
      const isEdge = index === 0 || index === priceHistory.length - 1;
      const isInterval = index % LABEL_INTERVAL === 0;
      return isEdge || index === minIndex || isInterval ? formatMonthDay(point.date) : '';
    });

    return { labels, prices, minIndex, minPrice, lastIndex };
  }, [priceHistory]);

  return (
    <View style={[styles.card, cardShadow(theme), { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.titleRow}>
        <Ionicons name="trending-down-outline" size={16} color={theme.seriesBlue} />
        <Text style={[styles.cardTitle, { color: theme.primaryText }]}>過去30日間の価格推移</Text>
      </View>

      <LineChart
        data={{
          labels,
          datasets: [
            {
              // react-native-chart-kit always calls this with a reduced opacity
              // for the stroke; ignore the argument to keep the line solid.
              color: () => theme.seriesBlue,
              data: prices,
              strokeWidth: 3,
            },
          ],
        }}
        width={screenWidth - CARD_MARGIN * 2 - 2}
        height={CHART_HEIGHT}
        bezier
        fromZero={false}
        segments={4}
        withInnerLines
        withVerticalLines={false}
        withOuterLines={false}
        withShadow
        chartConfig={{
          backgroundColor: theme.surface,
          backgroundGradientFrom: theme.surface,
          backgroundGradientTo: theme.surface,
          decimalPlaces: 0,
          color: () => theme.seriesBlue,
          labelColor: () => theme.mutedText,
          fillShadowGradientFrom: theme.seriesBlue,
          fillShadowGradientFromOpacity: 0.16,
          fillShadowGradientTo: theme.surface,
          fillShadowGradientToOpacity: 0,
          propsForDots: { r: '0' },
          propsForBackgroundLines: { stroke: theme.gridline, strokeDasharray: '' },
          propsForLabels: { fontSize: 10 },
        }}
        renderDotContent={({ x, y, index }) => {
          if (index === minIndex) {
            const badgeWidth = 46;
            const badgeHeight = 18;
            const badgeY = Math.max(y - 34, 2);
            return (
              <React.Fragment key={`min-marker-${index}`}>
                <Rect
                  x={x - badgeWidth / 2}
                  y={badgeY}
                  width={badgeWidth}
                  height={badgeHeight}
                  rx={9}
                  fill={theme.accentRed}
                />
                <SvgText
                  x={x}
                  y={badgeY + badgeHeight / 2 + 4}
                  fontSize={11}
                  fontWeight="bold"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  最安値
                </SvgText>
                <Circle cx={x} cy={y} r={5} fill={theme.accentRed} stroke={theme.surface} strokeWidth={2} />
              </React.Fragment>
            );
          }
          if (index === lastIndex && lastIndex !== minIndex) {
            return (
              <Circle
                key={`current-marker-${index}`}
                cx={x}
                cy={y}
                r={4.5}
                fill={theme.seriesBlue}
                stroke={theme.surface}
                strokeWidth={2}
              />
            );
          }
          return null;
        }}
        style={styles.chart}
      />

      <View style={styles.legendRow}>
        <View style={[styles.legendDot, { backgroundColor: theme.accentRed }]} />
        <Text style={[styles.legendText, { color: theme.secondaryText }]}>
          最安値: ¥{minPrice.toLocaleString()}（{formatMonthDay(priceHistory[minIndex].date)}）
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 18,
    marginHorizontal: CARD_MARGIN,
    marginTop: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 18,
    marginBottom: 6,
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  chart: {
    borderRadius: 16,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 18,
    marginTop: 10,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
  },
});
