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
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { Colors } from '../../constants/colors';
import {
  getCustomQuotes,
  deleteCustomQuote,
  CustomQuote,
  addFavorite,
  isFavorite,
} from '../../services/storage';
import { saveImageToGallery, shareImage } from '../../services/saveImage';
import { QuoteImageCard } from '../../components/QuoteImageCard';
import CustomQuoteEditor from '../../components/CustomQuoteEditor';

export default function MyQuotesScreen() {
  const [quotes, setQuotes] = useState<CustomQuote[]>([]);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editing, setEditing] = useState<CustomQuote | undefined>();

  const load = useCallback(() => {
    getCustomQuotes().then(setQuotes);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openCreate = useCallback(() => {
    setEditing(undefined);
    setEditorVisible(true);
  }, []);

  const openEdit = useCallback((q: CustomQuote) => {
    setEditing(q);
    setEditorVisible(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    Alert.alert('Excluir frase', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteCustomQuote(id);
          setQuotes((prev) => prev.filter((q) => q.id !== id));
        },
      },
    ]);
  }, []);

  const handleEditorSave = useCallback(() => {
    setEditorVisible(false);
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Minhas Frases</Text>
          <Text style={styles.subtitle}>{quotes.length} criadas</Text>
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={openCreate}>
          <Ionicons name="add" size={20} color={Colors.bg} />
          <Text style={styles.createBtnText}>Nova</Text>
        </TouchableOpacity>
      </View>

      {quotes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>✍️</Text>
          <Text style={styles.emptyTitle}>Nenhuma frase criada</Text>
          <Text style={styles.emptySub}>
            Crie suas próprias frases com texto, cores, fontes e imagens personalizadas.
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={openCreate}>
            <Ionicons name="add-circle" size={18} color={Colors.bg} />
            <Text style={styles.emptyBtnText}>Criar minha primeira frase</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={quotes}
          keyExtractor={(q) => q.id}
          renderItem={({ item }) => (
            <CustomQuoteItem
              quote={item}
              onEdit={() => openEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Editor Modal */}
      <Modal
        visible={editorVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditorVisible(false)}
      >
        <CustomQuoteEditor
          existing={editing}
          onSave={handleEditorSave}
          onCancel={() => setEditorVisible(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

function CustomQuoteItem({
  quote,
  onEdit,
  onDelete,
}: {
  quote: CustomQuote;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const imageRef = useRef<ViewShot>(null);

  const handleCopy = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Clipboard.setString(`"${quote.text}"\n\n— ${quote.author}`);
    Alert.alert('✅ Copiado!', 'Texto copiado para a área de transferência.');
  }, [quote]);

  const handleShare = useCallback(async () => {
    await Share.share({
      message: `"${quote.text}"\n\n— ${quote.author}\n\n⚔️ Sem Mimo`,
    });
  }, [quote]);

  const handleFavorite = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const already = await isFavorite(quote.id);
    if (!already) {
      await addFavorite(quote);
      Alert.alert('💛 Adicionado!', 'Frase adicionada aos favoritos.');
    } else {
      Alert.alert('Já favorito', 'Esta frase já está nos favoritos.');
    }
  }, [quote]);

  const handleDownload = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const uri = await captureRef(imageRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await saveImageToGallery(uri);
      Alert.alert('✅ Salvo!', 'Imagem salva na galeria.');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar.');
    }
  }, []);

  const handleShareImg = useCallback(async () => {
    try {
      const uri = await captureRef(imageRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await shareImage(uri);
    } catch {}
  }, []);

  const textColor = quote.textColor ?? Colors.gold;
  const bgColor = quote.bgColor ?? Colors.bgCard;

  return (
    <View style={styles.item}>
      {/* Hidden capture */}
      <View style={styles.offscreen} pointerEvents="none">
        <ViewShot ref={imageRef} options={{ format: 'png', quality: 1 }}>
          <QuoteImageCard quote={quote} />
        </ViewShot>
      </View>

      {/* Card Preview */}
      <View style={[styles.previewCard, { backgroundColor: bgColor }]}>
        {quote.imageUri && (
          <Image source={{ uri: quote.imageUri }} style={styles.bgImg} blurRadius={3} />
        )}
        <View style={styles.previewOverlay}>
          <Text style={[styles.previewMark, { color: textColor }]}>"</Text>
          <Text
            style={[
              styles.previewText,
              { color: textColor, fontFamily: quote.fontFamily ?? undefined },
            ]}
            numberOfLines={4}
          >
            {quote.text}
          </Text>
          <Text style={[styles.previewAuthor, { color: textColor + 'AA' }]}>
            — {quote.author}
          </Text>
        </View>
      </View>

      {/* Action bar */}
      <View style={styles.actionBar}>
        <ActionIcon icon="copy-outline" label="Copiar" onPress={handleCopy} />
        <ActionIcon icon="share-outline" label="Texto" onPress={handleShare} />
        <ActionIcon icon="heart-outline" label="Favoritar" onPress={handleFavorite} />
        <ActionIcon icon="download-outline" label="Baixar" onPress={handleDownload} />
        <ActionIcon icon="share-social-outline" label="Imagem" onPress={handleShareImg} />
        <ActionIcon icon="create-outline" label="Editar" onPress={onEdit} color={Colors.categories['Filosofia']} />
        <ActionIcon icon="trash-outline" label="Excluir" onPress={onDelete} color={Colors.danger} />
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
      <Ionicons name={icon} size={16} color={color} />
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
    paddingBottom: 10,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  createBtnText: { color: Colors.bg, fontWeight: '800', fontSize: 14 },

  list: { padding: 16, gap: 16, paddingBottom: 48 },

  item: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)' },
  offscreen: { position: 'absolute', top: -9999, left: -9999, width: 1080, opacity: 0 },

  previewCard: { minHeight: 160, overflow: 'hidden' },
  bgImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  previewOverlay: { padding: 20, backgroundColor: 'rgba(0,0,0,0.4)' },
  previewMark: { fontSize: 40, lineHeight: 36, fontWeight: '900', opacity: 0.4 },
  previewText: { fontSize: 16, lineHeight: 26, fontStyle: 'italic' },
  previewAuthor: { fontSize: 12, marginTop: 10, textAlign: 'right', fontWeight: '600' },

  actionBar: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    paddingVertical: 10,
    paddingHorizontal: 4,
    justifyContent: 'space-around',
  },
  actionIcon: { alignItems: 'center', gap: 3, paddingHorizontal: 2 },
  actionIconLabel: { fontSize: 8, fontWeight: '600' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 40 },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 8,
  },
  emptyBtnText: { color: Colors.bg, fontWeight: '800', fontSize: 14 },
});
