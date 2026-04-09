import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { getDailyQuote, getRandomQuote, Quote } from '../../constants/quotes';
import { getDailyChallenge } from '../../constants/challenges';
import { QuoteCard } from '../../components/QuoteCard';
import { ActionButtons } from '../../components/ActionButtons';
import { StreakBadge } from '../../components/StreakBadge';
import { getStreak, isFavorite, incrementQuotesRead } from '../../services/storage';

export default function HomeScreen() {
  const [quote, setQuote] = useState<Quote>(getDailyQuote());
  const [fav, setFav] = useState(false);
  const [streak, setStreak] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const challenge = getDailyChallenge();

  useEffect(() => {
    const load = async () => {
      const s = await getStreak();
      setStreak(s.count);
      const f = await isFavorite(quote.id);
      setFav(f);
      await incrementQuotesRead();
    };
    load();
  }, [quote.id]);

  const handleInspire = useCallback(() => {
    setQuote(getRandomQuote(quote.id));
  }, [quote.id]);

  const handleFavToggle = useCallback(async () => {
    const f = await isFavorite(quote.id);
    setFav(!f);
  }, [quote.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setQuote(getRandomQuote(quote.id));
    setRefreshing(false);
  }, [quote.id]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>SEM</Text>
            <Text style={styles.headerTitle}>MIMO ⚔️</Text>
          </View>
          <StreakBadge count={streak} />
        </View>

        {/* Section divider */}
        <View style={styles.sectionRow}>
          <LinearGradient
            colors={[Colors.gold, Colors.goldDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.labelLine}
          />
          <Text style={styles.sectionLabelText}>FRASE DO DIA</Text>
          <LinearGradient
            colors={[Colors.goldDark, Colors.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.labelLine}
          />
        </View>

        {/* Quote */}
        <QuoteCard quote={quote} />

        {/* Actions: Favorite, Share text, Save image, Share image, Inspire */}
        <ActionButtons
          quote={quote}
          isFav={fav}
          onFavToggle={handleFavToggle}
          onInspire={handleInspire}
        />

        {/* Daily Challenge */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeIcon}>{challenge.icon}</Text>
            <View>
              <Text style={styles.challengeLabel}>DESAFIO DO DIA</Text>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
            </View>
          </View>
          <Text style={styles.challengeDesc}>{challenge.description}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 16, gap: 20, paddingBottom: 48 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 10,
    color: Colors.gold,
    letterSpacing: 3,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 26,
    color: Colors.textPrimary,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionLabelText: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 2,
    fontWeight: '700',
  },
  labelLine: { flex: 1, height: 1, opacity: 0.4 },
  challengeCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.12)',
    gap: 12,
  },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  challengeIcon: { fontSize: 32 },
  challengeLabel: {
    fontSize: 9,
    color: Colors.gold,
    letterSpacing: 2,
    fontWeight: '700',
  },
  challengeTitle: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  challengeDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
