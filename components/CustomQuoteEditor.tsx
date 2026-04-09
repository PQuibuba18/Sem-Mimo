import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { Colors } from '../constants/colors';
import { saveCustomQuote, CustomQuote } from '../services/storage';
import { saveImageToGallery, shareImage } from '../services/saveImage';

const FONT_OPTIONS = [
  { label: 'Padrão', value: undefined as string | undefined },
  { label: 'Serif', value: 'Georgia' },
  { label: 'Mono', value: 'Courier New' },
];

const BG_COLORS = [
  { label: 'Preto', value: '#0A0A0F' },
  { label: 'Azul', value: '#0D1B2A' },
  { label: 'Roxo', value: '#1A0D2E' },
  { label: 'Verde', value: '#0D2A1A' },
  { label: 'Escarlate', value: '#2A0D0D' },
];

const TEXT_COLORS = [
  { label: 'Ouro', value: '#C9A84C' },
  { label: 'Branco', value: '#F0EDE6' },
  { label: 'Azul', value: '#5BA4E5' },
  { label: 'Roxo', value: '#9B7FE8' },
  { label: 'Verde', value: '#4CAF7C' },
];

type Props = {
  existing?: CustomQuote;
  onSave?: () => void;
  onCancel?: () => void;
};

export default function CustomQuoteEditor({ existing, onSave, onCancel }: Props) {
  const [text, setText] = useState(existing?.text ?? '');
  const [author, setAuthor] = useState(existing?.author ?? '');
  const [textColor, setTextColor] = useState(existing?.textColor ?? '#C9A84C');
  const [bgColor, setBgColor] = useState(existing?.bgColor ?? '#0A0A0F');
  const [fontFamily, setFontFamily] = useState<string | undefined>(existing?.fontFamily);
  const [imageUri, setImageUri] = useState<string | undefined>(existing?.imageUri);
  const [saving, setSaving] = useState(false);
  const previewRef = useRef<ViewShot>(null);

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para adicionar imagens.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!text.trim()) {
      Alert.alert('Campo obrigatório', 'Escreva uma frase antes de salvar.');
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const quote: CustomQuote = {
      id: existing?.id ?? `custom_${Date.now()}`,
      text: text.trim(),
      author: author.trim() || 'Eu',
      category: 'Minhas Frases',
      isCustom: true,
      textColor,
      bgColor,
      fontFamily,
      imageUri,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    await saveCustomQuote(quote);
    onSave?.();
  }, [text, author, textColor, bgColor, fontFamily, imageUri, existing, onSave]);

  const handleDownload = useCallback(async () => {
    if (!previewRef.current) return;
    setSaving(true);
    try {
      const uri = await captureRef(previewRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await saveImageToGallery(uri);
      Alert.alert('✅ Salvo!', 'Imagem salva na sua galeria.');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a imagem.');
    } finally {
      setSaving(false);
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (!previewRef.current) return;
    setSaving(true);
    try {
      const uri = await captureRef(previewRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await shareImage(uri);
    } catch {} finally {
      setSaving(false);
    }
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          {onCancel && (
            <TouchableOpacity onPress={onCancel} style={styles.headerBtn}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>
            {existing ? 'Editar Frase' : 'Criar Frase'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* PREVIEW */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PRÉVIA</Text>
            <ViewShot ref={previewRef} options={{ format: 'png', quality: 1 }}>
              <View style={[styles.preview, { backgroundColor: bgColor }]}>
                {imageUri && (
                  <Image source={{ uri: imageUri }} style={styles.previewBg} blurRadius={4} />
                )}
                <View style={styles.previewOverlay}>
                  <Text style={[styles.previewMark, { color: textColor }]}>"</Text>
                  <Text
                    style={[
                      styles.previewText,
                      { color: textColor, fontFamily: fontFamily ?? undefined },
                    ]}
                  >
                    {text || 'Sua frase aparecerá aqui...'}
                  </Text>
                  {author ? (
                    <Text style={[styles.previewAuthor, { color: textColor + 'BB' }]}>
                      — {author}
                    </Text>
                  ) : null}
                  <Text style={styles.previewWatermark}>⚔️ Sem Mimo</Text>
                </View>
              </View>
            </ViewShot>
            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.previewAction} onPress={handleDownload} disabled={saving}>
                <Ionicons name="download-outline" size={18} color={Colors.gold} />
                <Text style={styles.previewActionText}>Baixar imagem</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.previewAction} onPress={handleShare} disabled={saving}>
                <Ionicons name="share-outline" size={18} color={Colors.gold} />
                <Text style={styles.previewActionText}>Compartilhar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* TEXT INPUT */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>FRASE</Text>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Escreva sua frase inspiradora..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              maxLength={300}
            />
            <Text style={styles.charCount}>{text.length}/300</Text>
          </View>

          {/* AUTHOR */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>AUTOR</Text>
            <TextInput
              style={[styles.input, styles.inputSingle]}
              value={author}
              onChangeText={setAuthor}
              placeholder="Quem disse? (opcional)"
              placeholderTextColor={Colors.textMuted}
              maxLength={60}
            />
          </View>

          {/* IMAGE */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>IMAGEM DE FUNDO</Text>
            <View style={styles.imageRow}>
              <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                <Ionicons name="image-outline" size={20} color={Colors.gold} />
                <Text style={styles.imagePickerText}>
                  {imageUri ? 'Trocar imagem' : 'Adicionar imagem'}
                </Text>
              </TouchableOpacity>
              {imageUri && (
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setImageUri(undefined)}
                >
                  <Ionicons name="close-circle" size={20} color={Colors.danger} />
                </TouchableOpacity>
              )}
            </View>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.imageThumbnail} />
            )}
          </View>

          {/* TEXT COLOR */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>COR DO TEXTO</Text>
            <View style={styles.colorRow}>
              {TEXT_COLORS.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c.value },
                    textColor === c.value && styles.colorSwatchActive,
                  ]}
                  onPress={() => setTextColor(c.value)}
                >
                  {textColor === c.value && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* BG COLOR */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>COR DE FUNDO</Text>
            <View style={styles.colorRow}>
              {BG_COLORS.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c.value, borderColor: '#444' },
                    bgColor === c.value && styles.colorSwatchActive,
                  ]}
                  onPress={() => setBgColor(c.value)}
                >
                  {bgColor === c.value && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* FONT */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>FONTE</Text>
            <View style={styles.fontRow}>
              {FONT_OPTIONS.map((f) => (
                <TouchableOpacity
                  key={f.label}
                  style={[
                    styles.fontBtn,
                    fontFamily === f.value && styles.fontBtnActive,
                  ]}
                  onPress={() => setFontFamily(f.value)}
                >
                  <Text
                    style={[
                      styles.fontBtnText,
                      { fontFamily: f.value ?? undefined },
                      fontFamily === f.value && styles.fontBtnTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,168,76,0.1)',
  },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  saveBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  saveBtnText: { color: Colors.bg, fontWeight: '800', fontSize: 14 },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 24 },
  section: { gap: 10 },
  sectionLabel: { fontSize: 10, color: Colors.textMuted, letterSpacing: 2, fontWeight: '700' },
  preview: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 200,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
  },
  previewBg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  previewOverlay: { padding: 24, backgroundColor: 'rgba(0,0,0,0.45)' },
  previewMark: { fontSize: 60, lineHeight: 50, fontWeight: '900', opacity: 0.4 },
  previewText: { fontSize: 18, lineHeight: 28, fontStyle: 'italic', fontWeight: '400' },
  previewAuthor: { fontSize: 13, marginTop: 14, textAlign: 'right', fontWeight: '600' },
  previewWatermark: { fontSize: 10, color: '#ffffff55', textAlign: 'center', marginTop: 16 },
  previewActions: { flexDirection: 'row', gap: 12 },
  previewAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.bgCard,
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.15)',
  },
  previewActionText: { color: Colors.gold, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.15)',
    color: Colors.textPrimary,
    fontSize: 15,
    padding: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputSingle: { minHeight: 50, paddingVertical: 14 },
  charCount: { fontSize: 11, color: Colors.textMuted, textAlign: 'right' },
  imageRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.bgCard,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
  },
  imagePickerText: { color: Colors.gold, fontSize: 13, fontWeight: '600' },
  removeImageBtn: { padding: 4 },
  imageThumbnail: { width: 80, height: 80, borderRadius: 10 },
  colorRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchActive: { borderColor: Colors.gold, borderWidth: 2.5 },
  fontRow: { flexDirection: 'row', gap: 10 },
  fontBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.15)',
  },
  fontBtnActive: { borderColor: Colors.gold, backgroundColor: 'rgba(201,168,76,0.15)' },
  fontBtnText: { color: Colors.textSecondary, fontSize: 13 },
  fontBtnTextActive: { color: Colors.gold, fontWeight: '700' },
});
