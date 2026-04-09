import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


export const requestNotificationPermissions = async (): Promise<boolean> => {
  const isDevice = Constants.isDevice;
  if (!isDevice) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('mentalidade-manha', {
      name: '☀️ Manhã – Sem Mimo',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C9A84C',
      sound: 'default',
    });
    await Notifications.setNotificationChannelAsync('mentalidade-noite', {
      name: '🌙 Noite – Sem Mimo',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#9B7FE8',
      sound: 'default',
    });
  }

  return true;
};

// ─── MANHÃ (07:00) — Frases para começar o dia ───
const MORNING_MESSAGES = [
  {
    title: '☀️ Bom Dia, Guerreiro!',
    body: 'Disciplina pesa gramas. Arrependimento pesa toneladas. Comece forte hoje.',
  },
  {
    title: '🔥 O Dia Começa Agora',
    body: 'Você não está cansado. Você está fraco. E fraco se constrói. Levanta!',
  },
  {
    title: 'Apoie o Criador❤️',
    body: 'Cada contribuição mantém o app vivo e em constante evolução. Transferência Express: 927 760 485.',
  },
  {
    title: '⚔️ Acorda, Campeão!',
    body: 'Enquanto você dorme, alguém treina. Hoje você decide quem vai vencer.',
  },
  {
    title: '🚀 Manhã de Aço',
    body: 'Somos o que repetidamente fazemos. Excelência é um hábito — comece agora.',
  },
  {
    title: '💎 Seu Dia. Sua Escolha.',
    body: 'O impedimento para a ação avança a ação. Que está no caminho torna-se o caminho.',
  },
  {
    title: '⚡ Desperte e Conquiste!',
    body: 'Enquanto você explica seus motivos, seu concorrente está agindo. Foco!',
  },
  {
    title: '🏆 O Dia Pertence a Você',
    body: 'A única maneira de fazer um ótimo trabalho é amar o que você faz. Hoje é seu dia.',
  },
];

// ─── NOITE (20:00) — Frases para encerrar e relaxar ───
const NIGHT_MESSAGES = [
  {
    title: 'Apoie o Criador❤️',
    body: 'Cada contribuição mantém o app vivo e em constante evolução. Transferência Express: 927 760 485.',
  },
  {
    title: '🌙 Encerre o Dia com Força',
    body: 'Você fez o suficiente hoje. Descanse para amanhã ser ainda maior.',
  },
  {
    title: '✨ Reflexão Noturna',
    body: 'Não é que tenhamos pouco tempo; é que aproveitamos bem o que temos. Você aproveitou?',
  },
  {
    title: 'Apoie o Criador❤️',
    body: 'Cada contribuição mantém o app vivo e em constante evolução. Transferência Express: 927 760 485.',
  },
  {
    title: '🌟 Gratidão e Paz',
    body: 'Ao fim de cada dia, pergunte: aprendi, cresci, contribuí? Se sim, você venceu.',
  },
  {
    title: '🧘 Hora de Recarregar',
    body: 'O descanso não é fraqueza — é parte da estratégia. Durma bem, guerreiro.',
  },
  {
    title: '💜 Mente em Paz',
    body: 'Você tem poder sobre sua mente, não sobre eventos externos. Solte o que não pode controlar.',
  },
  {
    title: '🌙 Fim do Dia Glorioso',
    body: 'Quando acorda de manhã, você tem um privilégio. Esta noite, celebre cada passo dado.',
  },
  {
    title: '⭐ Descanse e Renasça',
    body: 'Grandes coisas requerem construção. Você plantou sementes hoje. Elas crescerão amanhã.',
  },
  {
    title: 'Apoie o Criador❤️',
    body: 'Cada contribuição mantém o app vivo e em constante evolução. Transferência Express: 927 760 485.',
  },
];

export const scheduleAllNotifications = async (customSound?: string): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const morningMsg = MORNING_MESSAGES[Math.floor(Math.random() * MORNING_MESSAGES.length)];
  const nightMsg = NIGHT_MESSAGES[Math.floor(Math.random() * NIGHT_MESSAGES.length)];

  const soundValue: boolean | string = customSound ? customSound : true;

  // ─── Notificação das 07:00 ───
  await Notifications.scheduleNotificationAsync({
    content: {
      title: morningMsg.title,
      body: morningMsg.body,
      sound: soundValue,
      data: { type: 'morning_quote' },
      ...(Platform.OS === 'android' && { channelId: 'mentalidade-manha' }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 7,
      minute: 0,
    },
  });

  // ─── Notificação das 20:00 ───
  await Notifications.scheduleNotificationAsync({
    content: {
      title: nightMsg.title,
      body: nightMsg.body,
      sound: soundValue,
      data: { type: 'night_quote' },
      ...(Platform.OS === 'android' && { channelId: 'mentalidade-noite' }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
};

/** @deprecated use scheduleAllNotifications */
export const scheduleDailyNotification = scheduleAllNotifications;

export const getPushToken = async (): Promise<string | null> => {
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    return token.data;
  } catch {
    return null;
  }
};
