import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Share,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { Colors } from '../constants/colors';
import { Quote } from '../constants/quotes';
import { addFavorite, removeFavorite } from '../services/storage';
import { saveImageToGallery, shareImage } from '../services/saveImage';
import { QuoteImageCard } from './QuoteImageCard';

type Props = {
  quote: Quote;
  isFav: boolean;
  onFavToggle: () => void;
  onInspire: () => void;
};

export const ActionButtons: React.FC<Props> = ({
  quote,
  isFav,
  onFavToggle,
  onInspire,
}) => {
  const [saving, setSaving] = useState(false);
  const imageRef = useRef<ViewShot>(null);

  const handleFav = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isFav) {
      await removeFavorite(quote.id);
    } else {
      await addFavorite(quote);
    }
    onFavToggle();
  }, [isFav, quote]);

  const handleShareText = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `"${quote.text}"\n\n— ${quote.author}\n\n⚔️ Sem Mimo`,
        title: 'Sem Mimo',
      });
    } catch {}
  }, [quote]);

  const handleDownloadImage = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSaving(true);
    try {
      if (!imageRef.current) {
        Alert.alert('Erro', 'Não foi possível capturar a imagem.');
        return;
      }
      // Capture the hidden QuoteImageCard as PNG
      const uri = await captureRef(imageRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      const saved = await saveImageToGallery(uri);
      if (saved) {
        Alert.alert('✅ Salvo!', 'Frase salva na sua galeria.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível salvar a imagem.');
    } finally {
      setSaving(false);
    }
  }, [quote]);

  const handleShareImage = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      if (!imageRef.current) return;
      const uri = await captureRef(imageRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      await shareImage(uri);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }, [quote]);

  const handleInspire = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onInspire();
  }, [onInspire]);

  return (
    <View style={styles.container}>
      {/*
        Hidden off-screen card for capture.
        Positioned absolutely so it doesn't affect layout.
      */}
      <View style={styles.offscreen} pointerEvents="none">
        <ViewShot ref={imageRef} options={{ format: 'png', quality: 1 }}>
          <QuoteImageCard quote={quote} />
        </ViewShot>
      </View>

      {/* Action row */}
      <View style={styles.row}>
        <ActionBtn
          icon={isFav ? 'heart' : 'heart-outline'}
          label="Favoritar"
          color={isFav ? Colors.danger : Colors.gold}
          onPress={handleFav}
        />
        <ActionBtn
          icon="share-outline"
          label="Texto"
          color={Colors.gold}
          onPress={handleShareText}
        />
        <ActionBtn
          icon={saving ? 'hourglass-outline' : 'image-outline'}
          label="Salvar img"
          color={Colors.gold}
          onPress={handleDownloadImage}
          loading={saving}
        />
        <ActionBtn
          icon="share-social-outline"
          label="Compartilhar"
          color={Colors.gold}
          onPress={handleShareImage}
          loading={saving}
        />
      </View>

      {/* Inspire button */}
      <TouchableOpacity
        style={styles.inspireBtn}
        onPress={handleInspire}
        activeOpacity={0.85}
      >
        <Ionicons name="sparkles" size={18} color={Colors.bg} />
        <Text style={styles.inspireBtnText}>Inspirar-me novamente</Text>
      </TouchableOpacity>
    </View>
  );
};

const ActionBtn = ({
  icon,
  label,
  color,
  onPress,
  loading = false,
}: {
  icon: any;
  label: string;
  color: string;
  onPress: () => void;
  loading?: boolean;
}) => (
  <TouchableOpacity
    style={styles.actionBtn}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={loading}
  >
    <View style={[styles.actionBtnIcon, { borderColor: color + '40' }]}>
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Ionicons name={icon} size={22} color={color} />
      )}
    </View>
    <Text style={styles.actionBtnLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { gap: 16 },
  offscreen: {
    position: 'absolute',
    top: -9999,
    left: -9999,
    width: 1080,
    opacity: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionBtn: { alignItems: 'center', gap: 7 },
  actionBtnIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  inspireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 16,
  },
  inspireBtnText: {
    color: Colors.bg,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
