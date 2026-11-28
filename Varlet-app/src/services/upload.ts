import { Platform } from 'react-native';
import { File } from 'expo-file-system';

/** A file chosen with the image or document picker. */
export interface LocalFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
  /** Present on web only. */
  file?: Blob;
}

export async function toFormData(file: LocalFile): Promise<FormData> {
  const form = new FormData();
  if (Platform.OS === 'web') {
    const blob = file.file ?? (await (await fetch(file.uri)).blob());
    form.append('file', blob, file.name);
  } else {
    // Expo's fetch does not accept React Native's { uri } shortcut. It reads
    // any part that has bytes(), which also lets us choose the file name the
    // server sees (it checks the .csv / .xlsx ending).
    const source = new File(file.uri);
    const part = { name: file.name, type: file.mimeType, bytes: () => source.bytes() };
    form.append('file', part as unknown as Blob);
  }
  return form;
}
