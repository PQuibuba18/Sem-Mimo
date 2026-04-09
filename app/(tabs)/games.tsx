import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { DAILY_CHALLENGES } from '../../constants/challenges';
import { getCompletedChallenges, completeChallenge } from '../../services/storage';

type GameState = 'idle' | 'showing' | 'input' | 'result';
type Tab = 'game' | 'challenges';

const LEVEL_CONFIG = {
  1: { count: 4, range: 9, label: 'Fácil' },
  2: { count: 6, range: 99, label: 'Médio' },
  3: { count: 8, range: 99, label: 'Difícil' },
} as const;

export default function GamesScreen() {
  const [tab, setTab] = useState<Tab>('game');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getCompletedChallenges().then(setCompletedIds);
  }, []);

  const startGame = useCallback(() => {
    const cfg = LEVEL_CONFIG[level];
    const nums = Array.from({ length: cfg.count }, () =>
      Math.floor(Math.random() * cfg.range) + 1
    );
    const decoys = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * cfg.range) + 1
    );
    const pool = [...new Set([...nums, ...decoys])];
    setOptions(pool.sort(() => Math.random() - 0.5).slice(0, 12));
    setNumbers(nums);
    setSelected([]);
    setCurrentIndex(0);
    setCorrect(null);
    setGameState('showing');
  }, [level]);

  useEffect(() => {
    if (gameState !== 'showing') return;
    if (currentIndex >= numbers.length) {
      const t = setTimeout(() => setGameState('input'), 700);
      return () => clearTimeout(t);
    }
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.35, duration: 140, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => setCurrentIndex((i) => i + 1), 950);
    return () => clearTimeout(t);
  }, [gameState, currentIndex, numbers.length]);

  const toggleNumber = (n: number) => {
    setSelected((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );
  };

  const checkAnswer = () => {
    const isCorrect =
      JSON.stringify([...numbers].sort((a, b) => a - b)) ===
      JSON.stringify([...selected].sort((a, b) => a - b));
    setCorrect(isCorrect);
    if (isCorrect) setScore((s) => s + level * 10);
    setGameState('result');
  };

  const handleComplete = async (id: string) => {
    await completeChallenge(id);
    setCompletedIds((prev) => [...prev, id]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['game', 'challenges'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
              {t === 'game' ? '🧠  Memória' : '⚔️  Desafios'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'game' ? (
          <>
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.title}>Jogo de Memória</Text>
                <Text style={styles.subtitle}>Memorize e selecione os números</Text>
              </View>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreLabel}>PTS</Text>
                <Text style={styles.scoreValue}>{score}</Text>
              </View>
            </View>

            {/* Level buttons */}
            <View style={styles.levels}>
              {([1, 2, 3] as (1 | 2 | 3)[]).map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.levelBtn, level === l && styles.levelBtnActive]}
                  onPress={() => { setLevel(l); setGameState('idle'); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.levelBtnText, level === l && styles.levelBtnTextActive]}>
                    {LEVEL_CONFIG[l].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {gameState === 'idle' && (
              <TouchableOpacity style={styles.startBtn} onPress={startGame} activeOpacity={0.85}>
                <Text style={styles.startBtnText}>▶  Iniciar Jogo</Text>
              </TouchableOpacity>
            )}

            {gameState === 'showing' && (
              <View style={styles.showArea}>
                <Text style={styles.showHint}>MEMORIZE</Text>
                <Animated.Text style={[styles.bigNumber, { transform: [{ scale: scaleAnim }] }]}>
                  {currentIndex < numbers.length ? numbers[currentIndex] : '⏳'}
                </Animated.Text>
                <Text style={styles.showProgress}>
                  {Math.min(currentIndex + 1, numbers.length)} / {numbers.length}
                </Text>
              </View>
            )}

            {gameState === 'input' && (
              <View style={styles.inputArea}>
                <Text style={styles.showHint}>Quais números apareceram?</Text>
                <View style={styles.optionsGrid}>
                  {options.map((n, i) => (
                    <TouchableOpacity
                      key={`${n}-${i}`}
                      style={[styles.optionBtn, selected.includes(n) && styles.optionBtnSel]}
                      onPress={() => toggleNumber(n)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.optionText, selected.includes(n) && styles.optionTextSel]}>
                        {n}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.checkBtn} onPress={checkAnswer} activeOpacity={0.8}>
                  <Text style={styles.checkBtnText}>Confirmar Resposta</Text>
                </TouchableOpacity>
              </View>
            )}

            {gameState === 'result' && (
              <View style={styles.resultArea}>
                <Text style={styles.resultIcon}>{correct ? '🎉' : '💀'}</Text>
                <Text style={styles.resultTitle}>{correct ? 'Correto!' : 'Errou!'}</Text>
                <Text style={styles.resultSub}>
                  Os números eram:{' '}
                  <Text style={{ color: Colors.gold, fontWeight: '700' }}>
                    {numbers.join('  ·  ')}
                  </Text>
                </Text>
                <TouchableOpacity style={styles.startBtn} onPress={startGame} activeOpacity={0.85}>
                  <Text style={styles.startBtnText}>Jogar Novamente</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.title}>Desafios</Text>
            <Text style={styles.subtitle}>Complete e fortaleça sua mente</Text>
            {DAILY_CHALLENGES.map((ch) => {
              const done = completedIds.includes(ch.id);
              return (
                <View key={ch.id} style={[styles.challengeCard, done && styles.challengeDone]}>
                  <Text style={styles.challengeIcon}>{ch.icon}</Text>
                  <View style={styles.challengeInfo}>
                    <Text style={styles.challengeTitle}>{ch.title}</Text>
                    <Text style={styles.challengeDesc}>{ch.description}</Text>
                  </View>
                  {done ? (
                    <Text style={styles.doneCheck}>✅</Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.doneBtn}
                      onPress={() => handleComplete(ch.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.doneBtnText}>Feito</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  tabBar: {
    flexDirection: 'row',
    margin: 20,
    marginBottom: 0,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: Colors.bgElevated },
  tabBtnText: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  tabBtnTextActive: { color: Colors.gold },
  content: { padding: 20, paddingBottom: 48, gap: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  scoreBadge: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.goldMuted,
    minWidth: 60,
  },
  scoreLabel: { fontSize: 9, color: Colors.textMuted, letterSpacing: 1.5 },
  scoreValue: { fontSize: 26, fontWeight: '900', color: Colors.gold },
  levels: { flexDirection: 'row', gap: 10 },
  levelBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.bgHover,
  },
  levelBtnActive: { backgroundColor: Colors.goldMuted, borderColor: Colors.gold },
  levelBtnText: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  levelBtnTextActive: { color: Colors.gold },
  startBtn: { backgroundColor: Colors.gold, borderRadius: 14, padding: 18, alignItems: 'center' },
  startBtnText: { color: Colors.bg, fontSize: 16, fontWeight: '800' },
  showArea: {
    alignItems: 'center', gap: 16, padding: 48,
    backgroundColor: Colors.bgCard, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.goldMuted,
  },
  showHint: { color: Colors.textSecondary, fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase' },
  bigNumber: { fontSize: 96, fontWeight: '900', color: Colors.gold, lineHeight: 110 },
  showProgress: { color: Colors.textMuted, fontSize: 12 },
  inputArea: { gap: 16 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  optionBtn: {
    width: 64, height: 64, borderRadius: 14,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.bgHover,
  },
  optionBtnSel: { backgroundColor: Colors.goldMuted, borderColor: Colors.gold },
  optionText: { fontSize: 22, fontWeight: '700', color: Colors.textSecondary },
  optionTextSel: { color: Colors.gold },
  checkBtn: {
    backgroundColor: Colors.bgElevated, borderRadius: 14, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.gold + '60',
  },
  checkBtnText: { color: Colors.gold, fontSize: 15, fontWeight: '700' },
  resultArea: {
    alignItems: 'center', gap: 14, padding: 32,
    backgroundColor: Colors.bgCard, borderRadius: 20,
  },
  resultIcon: { fontSize: 72 },
  resultTitle: { fontSize: 32, fontWeight: '900', color: Colors.textPrimary },
  resultSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  challengeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgCard, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.bgHover,
  },
  challengeDone: { opacity: 0.45 },
  challengeIcon: { fontSize: 28 },
  challengeInfo: { flex: 1 },
  challengeTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 },
  challengeDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  doneCheck: { fontSize: 22 },
  doneBtn: {
    backgroundColor: Colors.goldMuted, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.gold,
  },
  doneBtnText: { color: Colors.gold, fontSize: 12, fontWeight: '700' },
});
