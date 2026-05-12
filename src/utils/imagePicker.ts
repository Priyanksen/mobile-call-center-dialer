import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export type AvatarSource = 'camera' | 'library';

async function ensurePermission(source: AvatarSource): Promise<boolean> {
  if (source === 'camera') {
    const r = await ImagePicker.requestCameraPermissionsAsync();
    return r.granted;
  }
  const r = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return r.granted;
}

export async function pickAvatar(source: AvatarSource): Promise<string | null> {
  const granted = await ensurePermission(source);
  if (!granted) {
    Alert.alert(
      'Permission required',
      `Please allow ${source === 'camera' ? 'camera' : 'photo library'} access in settings.`,
    );
    return null;
  }
  const opts: ImagePicker.ImagePickerOptions = {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);
  if (result.canceled || !result.assets?.[0]?.uri) return null;
  return result.assets[0].uri;
}
