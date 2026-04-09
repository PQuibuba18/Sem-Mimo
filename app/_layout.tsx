import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import {
  requestNotificationPermissions,
  scheduleAllNotifications,
} from '../services/notifications';
import { updateStreak, getNotificationSound } from '../services/storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    const init = async () => {
      try {
        await updateStreak();
        const granted = await requestNotificationPermissions();
        if (granted) {
          const sound = await getNotificationSound();
          await scheduleAllNotifications(sound === 'none' ? undefined : sound);
        }
      } catch (e) {
        console.warn('Init error:', e);
      } finally {
        await SplashScreen.hideAsync();
      }
    };
    init();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" backgroundColor="#0A0A0F" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0F' },
});
