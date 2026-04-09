import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/colors';
import {
  getStats,
  getStreak,
  getNotificationSound,
  setNotificationSound,
  NotificationSoundOption,
} from '../../services/storage';
import {
  requestNotificationPermissions,
  scheduleAllNotifications,
} from '../../services/notifications';
import * as Notifications from 'expo-notifications';

const SOUND_OPTIONS: { label: string; value: NotificationSoundOption; icon: string }[] = [
  { label: 'Som padrão', value: 'default', icon: '🔔' },
  { label: 'Sem som', value: 'none', icon: '🔕' },
];

export default function ProfileScreen() {
  const [stats, setStats] = useState({ quotesRead: 0, challengesCompleted: 0 });
  const [streak, setStreak] = useState(0);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [sound, setSound] = useState<NotificationSoundOption>('default');
  const [scheduledCount, setScheduledCount] = useState(0);

  const loadData = useCallback(async () => {
    const [s, st, snd] = await Promise.all([
      getStats(),
      getStreak(),
      getNotificationSound(),
    ]);
    setStats(s);
    setStreak(st.count);
    setSound(snd);

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    setScheduledCount(scheduled.length);
    setNotifEnabled(scheduled.length > 0);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleToggleNotifications = useCallback(async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permissão negada',
          'Ative as notificações nas configurações do seu dispositivo.'
        );
        return;
      }
      const snd = await getNotificationSound();
      await scheduleAllNotifications(snd === 'none' ? undefined : snd);
      setNotifEnabled(true);
      Alert.alert(
        '✅ Notificações ativadas!',
        'Você receberá:\n☀️ 07:00 — Frase para começar o dia\n🌙 20:00 — Frase para encerrar e relaxar'
      );
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
      setNotifEnabled(false);
    }
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    setScheduledCount(scheduled.length);
  }, []);

  const handleSoundChange = useCallback(async (option: NotificationSoundOption) => {
    setSound(option);
    await setNotificationSound(option);
    if (notifEnabled) {
      await scheduleAllNotifications(option === 'none' ? undefined : option);
      Alert.alert('✅ Configuração salva', 'Som das notificações atualizado.');
    }
  }, [notifEnabled]);

  const handleTestMorning = useCallback(async () => {
    const granted = await requestNotificationPermissions();
    if (!granted) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '☀️ Bom Dia, Guerreiro! (Teste)',
        body: 'Esta é a notificação das 07:00 — para começar o dia com força.',
        sound: sound === 'none' ? false : true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3 },
    });
    Alert.alert('🔔 Teste enviado', 'A notificação de manhã chegará em 3 segundos.');
  }, [sound]);

  const handleTestNight = useCallback(async () => {
    const granted = await requestNotificationPermissions();
    if (!granted) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 Encerre o Dia com Força (Teste)',
        body: 'Esta é a notificação das 20:00 — para relaxar e refletir.',
        sound: sound === 'none' ? false : true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3 },
    });
    Alert.alert('🔔 Teste enviado', 'A notificação de noite chegará em 3 segundos.');
  }, [sound]);

  const StatCard = ({ icon, label, value }: { icon: string; label: string; value: number }) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const SettingRow = ({
    icon,
    label,
    sub,
    right,
  }: {
    icon: string;
    label: string;
    sub?: string;
    right: React.ReactNode;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View>
          <Text style={styles.settingLabel}>{label}</Text>
          {sub ? <Text style={styles.settingSub}>{sub}</Text> : null}
        </View>
      </View>
      {right}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>⚔️</Text>
          </View>
          <Text style={styles.name}>Guerreiro</Text>
          <Text style={styles.sub}>Sem Mimo</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="🔥" label="Sequência" value={streak} />
          <StatCard icon="📖" label="Frases lidas" value={stats.quotesRead} />
          <StatCard icon="🏆" label="Desafios" value={stats.challengesCompleted} />
        </View>

        {/* Notifications */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔔 Notificações</Text>

          <SettingRow
            icon="🔔"
            label="Ativar notificações"
            sub={
              notifEnabled
                ? `${scheduledCount} alarmes ativos`
                : 'Desativadas'
            }
            right={
              <Switch
                value={notifEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: Colors.bgElevated, true: Colors.gold }}
                thumbColor={notifEnabled ? Colors.goldLight : Colors.textMuted}
              />
            }
          />

          {notifEnabled && (
            <>
              <View style={styles.divider} />

              {/* Schedule info */}
              <View style={styles.scheduleInfo}>
                <View style={styles.scheduleItem}>
                  <Text style={styles.scheduleTime}>07:00</Text>
                  <Text style={styles.scheduleDesc}>☀️ Frase para começar o dia</Text>
                </View>
                <View style={styles.scheduleItem}>
                  <Text style={styles.scheduleTime}>20:00</Text>
                  <Text style={styles.scheduleDesc}>🌙 Frase para relaxar e encerrar</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Sound */}
              <Text style={styles.subSectionLabel}>SOM DA NOTIFICAÇÃO</Text>
              <View style={styles.soundOptions}>
                {SOUND_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.soundOption,
                      sound === opt.value && styles.soundOptionActive,
                    ]}
                    onPress={() => handleSoundChange(opt.value)}
                  >
                    <Text style={styles.soundOptionIcon}>{opt.icon}</Text>
                    <Text
                      style={[
                        styles.soundOptionText,
                        sound === opt.value && styles.soundOptionTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {sound === opt.value && (
                      <Ionicons name="checkmark-circle" size={16} color={Colors.gold} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider} />

              {/* Test buttons */}
              <Text style={styles.subSectionLabel}>TESTAR NOTIFICAÇÕES</Text>
              <View style={styles.testRow}>
                <TouchableOpacity style={styles.testBtn} onPress={handleTestMorning}>
                  <Text style={styles.testBtnIcon}>☀️</Text>
                  <Text style={styles.testBtnText}>Testar manhã</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.testBtn, styles.testBtnNight]} onPress={handleTestNight}>
                  <Text style={styles.testBtnIcon}>🌙</Text>
                  <Text style={styles.testBtnText}>Testar noite</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* App info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ℹ️ Sobre o App</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versão</Text>
            <Text style={styles.infoValue}>1.1.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plataforma</Text>
            <Text style={styles.infoValue}>{Platform.OS === 'ios' ? 'iOS' : 'Android'}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Criado por</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Moisés Quibuba  -</Text>
            <Text style={styles.infoValue}>Desenvolvedor Angolano</Text>
          </View>
          {/* <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plataforma</Text>
            <Text style={styles.infoValue}>{Platform.OS === 'ios' ? 'iOS' : 'Android'}</Text>
          </View> */}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 20 },

  header: { alignItems: 'center', gap: 8, paddingVertical: 10 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.gold + '60',
  },
  avatarIcon: { fontSize: 36 },
  name: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  sub: { fontSize: 13, color: Colors.textMuted },

  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.1)',
  },
  statIcon: { fontSize: 22 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.1)',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingIcon: { fontSize: 20 },
  settingLabel: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  settingSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },

  divider: { height: 1, backgroundColor: 'rgba(201,168,76,0.08)' },

  scheduleInfo: { gap: 10 },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bgElevated,
    borderRadius: 10,
    padding: 12,
  },
  scheduleTime: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.gold,
    minWidth: 56,
  },
  scheduleDesc: { fontSize: 13, color: Colors.textSecondary, flex: 1 },

  subSectionLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 2,
    fontWeight: '700',
  },

  soundOptions: { gap: 8 },
  soundOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.bgElevated,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  soundOptionActive: { borderColor: Colors.gold + '60', backgroundColor: Colors.goldMuted },
  soundOptionIcon: { fontSize: 18 },
  soundOptionText: { flex: 1, fontSize: 14, color: Colors.textSecondary },
  soundOptionTextActive: { color: Colors.gold, fontWeight: '600' },

  testRow: { flexDirection: 'row', gap: 10 },
  testBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.bgElevated,
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.gold + '30',
  },
  testBtnNight: { borderColor: Colors.categories['Filosofia'] + '40' },
  testBtnIcon: { fontSize: 16 },
  testBtnText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: { fontSize: 14, color: Colors.textSecondary },
  infoValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
});
