import { Platform } from 'react-native';

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
    // React Native reads the file from its address while sending.
    form.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
  }
  return form;
}
