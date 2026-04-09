import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote } from '../constants/quotes';

const KEYS = {
  FAVORITES: 'favorites_v2',
  STREAK: 'streak_v2',
  STATS: 'stats_v2',
  COMPLETED_CHALLENGES: 'completed_challenges_v2',
  CUSTOM_QUOTES: 'custom_quotes_v1',
  NOTIFICATION_SOUND: 'notification_sound_v1',
};

// ─── FAVORITES ───
export const getFavorites = async (): Promise<Quote[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addFavorite = async (quote: Quote): Promise<void> => {
  const favs = await getFavorites();
  if (!favs.find((f) => f.id === quote.id)) {
    await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify([...favs, quote]));
  }
};

export const removeFavorite = async (quoteId: string): Promise<void> => {
  const favs = await getFavorites();
  await AsyncStorage.setItem(
    KEYS.FAVORITES,
    JSON.stringify(favs.filter((f) => f.id !== quoteId))
  );
};

export const isFavorite = async (quoteId: string): Promise<boolean> => {
  const favs = await getFavorites();
  return favs.some((f) => f.id === quoteId);
};

// ─── STREAK ───
export type StreakData = { count: number; lastDate: string };

export const getStreak = async (): Promise<StreakData> => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.STREAK);
    return raw ? JSON.parse(raw) : { count: 0, lastDate: '' };
  } catch {
    return { count: 0, lastDate: '' };
  }
};

export const updateStreak = async (): Promise<StreakData> => {
  const today = new Date().toDateString();
  const streak = await getStreak();
  if (streak.lastDate === today) return streak;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const newStreak: StreakData = {
    count: streak.lastDate === yesterday.toDateString() ? streak.count + 1 : 1,
    lastDate: today,
  };
  await AsyncStorage.setItem(KEYS.STREAK, JSON.stringify(newStreak));
  return newStreak;
};

// ─── STATS ───
export type StatsData = { quotesRead: number; challengesCompleted: number };

export const getStats = async (): Promise<StatsData> => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.STATS);
    return raw ? JSON.parse(raw) : { quotesRead: 0, challengesCompleted: 0 };
  } catch {
    return { quotesRead: 0, challengesCompleted: 0 };
  }
};

export const incrementQuotesRead = async (): Promise<void> => {
  const stats = await getStats();
  await AsyncStorage.setItem(
    KEYS.STATS,
    JSON.stringify({ ...stats, quotesRead: stats.quotesRead + 1 })
  );
};

// ─── CHALLENGES ───
export const getCompletedChallenges = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.COMPLETED_CHALLENGES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const completeChallenge = async (challengeId: string): Promise<void> => {
  const completed = await getCompletedChallenges();
  if (!completed.includes(challengeId)) {
    await AsyncStorage.setItem(
      KEYS.COMPLETED_CHALLENGES,
      JSON.stringify([...completed, challengeId])
    );
    const stats = await getStats();
    await AsyncStorage.setItem(
      KEYS.STATS,
      JSON.stringify({ ...stats, challengesCompleted: stats.challengesCompleted + 1 })
    );
  }
};

// ─── CUSTOM QUOTES ───
export type CustomQuote = Quote & {
  isCustom: true;
  textColor?: string;
  bgColor?: string;
  fontFamily?: string;
  imageUri?: string;
  createdAt: string;
};

export const getCustomQuotes = async (): Promise<CustomQuote[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CUSTOM_QUOTES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCustomQuote = async (quote: CustomQuote): Promise<void> => {
  const quotes = await getCustomQuotes();
  const idx = quotes.findIndex((q) => q.id === quote.id);
  if (idx >= 0) {
    quotes[idx] = quote;
  } else {
    quotes.unshift(quote);
  }
  await AsyncStorage.setItem(KEYS.CUSTOM_QUOTES, JSON.stringify(quotes));
};

export const deleteCustomQuote = async (id: string): Promise<void> => {
  const quotes = await getCustomQuotes();
  await AsyncStorage.setItem(
    KEYS.CUSTOM_QUOTES,
    JSON.stringify(quotes.filter((q) => q.id !== id))
  );
};

// ─── NOTIFICATION SOUND ───
export type NotificationSoundOption = 'default' | 'none' | string;

export const getNotificationSound = async (): Promise<NotificationSoundOption> => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.NOTIFICATION_SOUND);
    return raw ?? 'default';
  } catch {
    return 'default';
  }
};

export const setNotificationSound = async (sound: NotificationSoundOption): Promise<void> => {
  await AsyncStorage.setItem(KEYS.NOTIFICATION_SOUND, sound);
};
