import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';

type Props = { count: number };

export const StreakBadge: React.FC<Props> = ({ count }) => (
  <LinearGradient
    colors={['rgba(255,107,53,0.15)', 'rgba(255,59,0,0.05)']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.container}
  >
    <Text style={styles.fire}>🔥</Text>
    <View>
      <Text style={styles.count}>{count} {count === 1 ? 'dia' : 'dias'}</Text>
      <Text style={styles.label}>fortalecendo sua mente</Text>
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.2)',
  },
  fire: { fontSize: 24 },
  count: { fontSize: 18, fontWeight: '800', color: Colors.fire, letterSpacing: -0.5 },
  label: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
});
