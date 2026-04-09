import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { CATEGORIES, getQuotesByCategory } from '../../constants/quotes';
import { QuoteCard } from '../../components/QuoteCard';

export default function CategoriesScreen() {
  const [selected, setSelected] = useState('Todos');
  const quotes = getQuotesByCategory(selected);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Frases</Text>
        <Text style={styles.count}>{quotes.length} frases</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
      >
        {CATEGORIES.map((cat) => {
          const color =
            cat === 'Todos' ? Colors.gold : Colors.categories[cat] || Colors.gold;
          const active = selected === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                active && { backgroundColor: color, borderColor: color },
              ]}
              onPress={() => setSelected(cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active && { color: Colors.bg }]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={quotes}
        keyExtractor={(q) => q.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <QuoteCard quote={item} compact />
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  count: { fontSize: 13, color: Colors.textMuted },
  chipsScroll: { maxHeight: 52 },
  chipsContent: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.bgHover,
    backgroundColor: Colors.bgCard,
  },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  list: { padding: 20, gap: 12, paddingBottom: 48 },
  cardWrap: {},
});
