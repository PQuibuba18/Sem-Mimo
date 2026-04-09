import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { Quote } from '../constants/quotes';

const { width } = Dimensions.get('window');

type Props = {
  quote: Quote;
  compact?: boolean;
  /** Ref for ViewShot capture — pass from parent */
  captureRef?: React.RefObject<View>;
};

export const QuoteCard: React.FC<Props> = ({ quote, compact = false, captureRef }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [quote.id]);

  const categoryColor = Colors.categories[quote.category] || Colors.gold;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Inner view used for screenshot capture */}
      <View ref={captureRef} collapsable={false} style={styles.captureContainer}>
        <LinearGradient
          colors={['#1E1E2E', '#12121A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, compact && styles.gradientCompact]}
        >
          {/* Top accent bar */}
          <LinearGradient
            colors={[categoryColor + '00', categoryColor, categoryColor + '00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topBar}
          />

          {/* Category badge */}
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: categoryColor + '22', borderColor: categoryColor + '55' },
            ]}
          >
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {quote.category.toUpperCase()}
            </Text>
          </View>

          {/* Big quotation mark */}
          <Text style={[styles.quoteMark, { color: categoryColor }]}>"</Text>

          {/* Quote text */}
          <Text style={[styles.quoteText, compact && styles.quoteTextCompact]}>
            {quote.text}
          </Text>

          {/* Divider */}
          <LinearGradient
            colors={['transparent', categoryColor, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.divider}
          />

          {/* Author */}
          <Text style={styles.author}>— {quote.author}</Text>

          {/* Watermark for saved images */}
          <Text style={styles.watermark}>⚔️ Sem Mimo</Text>
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.18)',
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  captureContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    padding: 28,
    paddingTop: 0,
  },
  gradientCompact: {
    padding: 18,
    paddingTop: 0,
  },
  topBar: {
    height: 2,
    marginBottom: 22,
    opacity: 0.6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  quoteMark: {
    fontSize: 80,
    lineHeight: 64,
    fontWeight: '900',
    marginBottom: 2,
    opacity: 0.35,
  },
  quoteText: {
    fontSize: 20,
    lineHeight: 32,
    color: Colors.textPrimary,
    fontWeight: '400',
    letterSpacing: 0.2,
    fontStyle: 'italic',
  },
  quoteTextCompact: {
    fontSize: 16,
    lineHeight: 26,
  },
  divider: {
    height: 1,
    marginVertical: 20,
    opacity: 0.4,
  },
  author: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  watermark: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 14,
    letterSpacing: 0.5,
  },
});
