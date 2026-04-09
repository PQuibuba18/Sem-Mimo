/**
 * QuoteImageCard
 * Rendered off-screen at 1080px wide for high-quality PNG download.
 * Pinterest/Instagram story style — no login required.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { Quote } from '../constants/quotes';

type Props = { quote: Quote };

export const QuoteImageCard: React.FC<Props> = ({ quote }) => {
  const categoryColor = Colors.categories[quote.category] || Colors.gold;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0F0F1A', '#1A1A2E', '#0A0A0F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bg}
      >
        {/* Corner decorations */}
        <View style={[styles.cornerTL, { borderColor: categoryColor + '40' }]} />
        <View style={[styles.cornerBR, { borderColor: categoryColor + '40' }]} />

        {/* Top accent line */}
        <LinearGradient
          colors={['transparent', categoryColor, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentLine}
        />

        <View style={styles.content}>
          {/* Category */}
          <View style={[styles.categoryBadge, { borderColor: categoryColor + '55', backgroundColor: categoryColor + '18' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {quote.category.toUpperCase()}
            </Text>
          </View>

          {/* Quote mark */}
          <Text style={[styles.quoteMark, { color: categoryColor }]}>"</Text>

          {/* Quote text */}
          <Text style={styles.quoteText}>{quote.text}</Text>

          {/* Author divider */}
          <LinearGradient
            colors={['transparent', categoryColor, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.divider}
          />

          <Text style={styles.author}>— {quote.author}</Text>
        </View>

        {/* Bottom accent line */}
        <LinearGradient
          colors={['transparent', categoryColor, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentLine}
        />

        {/* Branding */}
        <View style={styles.branding}>
          <Text style={styles.brandIcon}>⚔️</Text>
          <Text style={styles.brandName}>Sem Mimo</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: 1080,
    height: 1080,
    borderRadius: 0,
    overflow: 'hidden',
  },
  bg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 80,
  },
  cornerTL: {
    position: 'absolute',
    top: 48,
    left: 48,
    width: 80,
    height: 80,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRadius: 4,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 48,
    right: 48,
    width: 80,
    height: 80,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderRadius: 4,
  },
  accentLine: {
    height: 2,
    width: '60%',
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  categoryBadge: {
    borderWidth: 2,
    borderRadius: 40,
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  categoryText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 4,
  },
  quoteMark: {
    fontSize: 200,
    lineHeight: 160,
    fontWeight: '900',
    opacity: 0.25,
    textAlign: 'center',
  },
  quoteText: {
    fontSize: 52,
    lineHeight: 80,
    color: '#F0EDE6',
    fontWeight: '400',
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  divider: {
    height: 2,
    width: '50%',
    opacity: 0.4,
    marginVertical: 8,
  },
  author: {
    fontSize: 36,
    color: '#9A9AA8',
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  brandIcon: { fontSize: 36 },
  brandName: {
    fontSize: 28,
    color: '#5A5A6A',
    fontWeight: '700',
    letterSpacing: 2,
  },
});
