import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { Colors } from '../../constants/colors';
import { getFavorites, removeFavorite } from '../../services/storage';
import { Quote } from '../../constants/quotes';
import { QuoteCard } from '../../components/QuoteCard';
import { saveImageToGallery, shareImage } from '../../services/saveImage';
import { QuoteImageCard } from '../../components/QuoteImageCard';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Quote[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getFavorites().then(setFavorites);
    }, [])
  );

  const handleRemove = useCallback(async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Remover favorito', 'Deseja remover esta frase dos favoritos?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          await removeFavorite(id);
          setFavorites((prev) => prev.filter((f) => f.id !== id));
        },
      },
    ]);
  }, []);

  const handleCopyText = useCallback(async (quote: Quote) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const content = `"${quote.text}"\n\n— ${quote.author}`;
    Clipboard.setString(content);
    Alert.alert('✅ Copiado!', 'Texto copiado para a área de transferência.');
  }, []);

  const handleShareText = useCallback(async (quote: Quote) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Share.share({
      message: `"${quote.text}"\n\n— ${quote.author}\n\n⚔️ Sem Mimo`,
    });
  }, []);

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Favoritos</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💛</Text>
          <Text style={styles.emptyTitle}>Nenhuma frase salva</Text>
          <Text style={styles.emptySub}>
            Toque no coração nas frases que tocarem você.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Favoritos</Text>
        <Text style={styles.count}>{favorites.length} frases</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(q) => q.id}
        renderItem={({ item }) => (
          <FavoriteItem
            quote={item}
            saving={savingId === item.id}
            onRemove={() => handleRemove(item.id)}
            onCopy={() => handleCopyText(item)}
            onShare={() => handleShareText(item)}
            onSaveImage={async () => {
              setSavingId(item.id);
              // handled inside component
              setSavingId(null);
            }}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function FavoriteItem({
  quote,
  saving,
  onRemove,
  onCopy,
  onShare,
  onSaveImage,
}: {
  quote: Quote;
  saving: boolean;
  onRemove: () => void;
  onCopy: () => void;
  onShare: () => void;
  onSaveImage: () => void;
}) {
  const imageRef = useRef<ViewShot>(null);

  const handleDownload = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const uri = await captureRef(imageRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await saveImageToGallery(uri);
      Alert.alert('✅ Salvo!', 'Imagem salva na galeria.');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a imagem.');
    }
  }, []);

  const handleShareImg = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const uri = await captureRef(imageRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await shareImage(uri);
    } catch {}
  }, []);

  return (
    <View style={styles.cardWrap}>
      {/* Hidden image for capture */}
      <View style={styles.offscreen} pointerEvents="none">
        <ViewShot ref={imageRef} options={{ format: 'png', quality: 1 }}>
          <QuoteImageCard quote={quote} />
        </ViewShot>
      </View>

      <QuoteCard quote={quote} compact />

      {/* Action bar */}
      <View style={styles.actionBar}>
        <ActionIcon icon="copy-outline" label="Copiar" onPress={onCopy} />
        <ActionIcon icon="share-outline" label="Texto" onPress={onShare} />
        <ActionIcon icon="image-outline" label="Baixar" onPress={handleDownload} />
        <ActionIcon icon="share-social-outline" label="Compartilhar" onPress={handleShareImg} />
        <ActionIcon icon="trash-outline" label="Remover" onPress={onRemove} color={Colors.danger} />
      </View>
    </View>
  );
}

function ActionIcon({
  icon,
  label,
  onPress,
  color = Colors.gold,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <TouchableOpacity style={styles.actionIcon} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.actionIconLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 8,
  },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  count: { fontSize: 13, color: Colors.textMuted },
  list: { padding: 20, gap: 16, paddingBottom: 48 },
  cardWrap: { gap: 0 },
  offscreen: { position: 'absolute', top: -9999, left: -9999, width: 1080, opacity: 0 },
  actionBar: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: 'rgba(201,168,76,0.1)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
  },
  actionIcon: { alignItems: 'center', gap: 4, paddingHorizontal: 4 },
  actionIconLabel: { fontSize: 9, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
