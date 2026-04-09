# ⚔️ Mentalidade de Aço

App mobile profissional de frases motivacionais com download de imagem estilo Pinterest,
jogo de memória, streak de disciplina, desafios diários e notificações às 07h.

---

## 🚀 Instalação e Execução

### 1. Instalar dependências
```bash
npm install
```

### 2. Criar pasta assets (obrigatório)
```bash
mkdir assets
```
Coloque dentro qualquer imagem `.png` com os nomes:
- `icon.png` (1024×1024)
- `splash.png` (qualquer tamanho)
- `adaptive-icon.png` (1024×1024)
- `notification-icon.png` (96×96, fundo transparente)

### 3. Iniciar
```bash
npx expo start
```
Escaneie o QR Code com o **Expo Go** no celular.

---

## 📲 Funcionalidade de Download de Imagem

Sem login ou cadastro. O utilizador toca em **"Salvar img"** e a frase é
capturada como imagem PNG (1080×1080) estilo Pinterest e guardada na galeria.
Também pode partilhar diretamente pelo share sheet nativo.

### Como funciona tecnicamente
- `react-native-view-shot` renderiza o `QuoteImageCard` (1080px) off-screen
- `expo-media-library` salva o ficheiro na galeria
- `expo-sharing` permite partilhar para WhatsApp, Instagram, etc.

---

## 🔔 Notificações Diárias

Configuradas automaticamente para as **07:00** ao abrir o app pela primeira vez.
Usa `expo-notifications` com trigger diário nativo.

Para reconfigurar o horário, edite `services/notifications.ts`:
```typescript
trigger: {
  type: Notifications.SchedulableTriggerInputTypes.DAILY,
  hour: 7,   // ← altere aqui
  minute: 0,
},
```

---

## 📦 Versões SDK 54 usadas

| Pacote | Versão |
|---|---|
| expo | ~54.0.9 |
| react | 19.1.0 |
| react-native | 0.81.4 |
| expo-router | ~6.0.7 |
| react-native-reanimated | ~4.3.0 |
| react-native-gesture-handler | ~2.24.0 |
| expo-notifications | ~0.29.13 |
| expo-media-library | ~17.0.6 |
| react-native-view-shot | 4.0.3 |

---

## 📁 Estrutura

```
mentalidade-de-aco/
├── app/
│   ├── _layout.tsx              ← Root layout + init
│   └── (tabs)/
│       ├── _layout.tsx          ← Tab bar
│       ├── index.tsx            ← Tela principal
│       ├── categories.tsx       ← Frases por categoria
│       ├── favorites.tsx        ← Favoritos
│       ├── games.tsx            ← Jogo de Memória + Desafios
│       └── profile.tsx          ← Perfil + Apoie o Criador
├── components/
│   ├── QuoteCard.tsx            ← Card animado
│   ├── QuoteImageCard.tsx       ← Card 1080px para captura
│   ├── ActionButtons.tsx        ← Ações (salvar, partilhar, favoritar)
│   └── StreakBadge.tsx
├── constants/
│   ├── colors.ts
│   ├── quotes.ts                ← ~130 frases
│   └── challenges.ts
├── services/
│   ├── storage.ts               ← AsyncStorage
│   ├── notifications.ts         ← Notificações diárias
│   └── saveImage.ts             ← Guardar/partilhar imagem
├── app.json
├── babel.config.js
└── package.json
```

---

## 📦 Gerar APK com EAS

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview   # APK de teste
eas build -p android --profile production # AAB para Play Store
```
