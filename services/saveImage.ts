import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

/**
 * Pede permissão para acessar a galeria (Android/iOS).
 * Retorna true se concedida.
 */
export const requestMediaPermission = async (): Promise<boolean> => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
};

/**
 * Salva um arquivo de imagem na galeria do dispositivo.
 * @param uri - URI local da imagem (gerada pelo ViewShot)
 */
export const saveImageToGallery = async (uri: string): Promise<boolean> => {
  try {
    const granted = await requestMediaPermission();
    if (!granted) {
      Alert.alert(
        'Permissão negada',
        'Para salvar a imagem, permita o acesso à galeria nas configurações.'
      );
      return false;
    }
    await MediaLibrary.saveToLibraryAsync(uri);
    return true;
  } catch (e) {
    console.error('saveImageToGallery error:', e);
    return false;
  }
};

/**
 * Compartilha uma imagem via share sheet nativo.
 * @param uri - URI local da imagem
 */
export const shareImage = async (uri: string): Promise<void> => {
  try {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert('Compartilhamento não disponível neste dispositivo.');
      return;
    }
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Compartilhar frase',
    });
  } catch (e) {
    console.error('shareImage error:', e);
  }
};
