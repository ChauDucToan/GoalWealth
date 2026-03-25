import { ReceiptImportDraft } from '@/context/assistantContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export type ReceiptImportSourceKey = 'camera' | 'files' | 'gallery';

export const receiptImportSourceCards: {
  id: ReceiptImportSourceKey;
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  helper: string;
}[] = [
  { id: 'camera', label: 'Take photo', icon: 'photo-camera', helper: 'Best for paper receipts' },
  { id: 'files', label: 'Browse files', icon: 'folder-open', helper: 'Import PDF or image' },
  { id: 'gallery', label: 'Gallery', icon: 'collections', helper: 'Use an existing photo' },
];

function buildReceiptImportDraft(
  draft: Omit<ReceiptImportDraft, 'ocrRawText' | 'ocrStatus' | 'ocrError'>
): ReceiptImportDraft {
  return {
    ...draft,
    ocrRawText: '',
    ocrStatus: draft.kind === 'image' ? 'idle' : 'error',
    ocrError: draft.kind === 'image' ? null : 'OCR only runs on image receipts.',
    ocrProvider: draft.kind === 'image' ? 'manual-review' : 'manual-review',
  };
}

export async function importReceiptFromSource(
  source: ReceiptImportSourceKey,
  onDraftReady: (draft: ReceiptImportDraft) => void
) {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Allow camera access to capture a bill or receipt.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];

    onDraftReady(
      buildReceiptImportDraft({
        source: 'camera',
        uri: asset.uri,
        name: asset.fileName ?? 'Camera receipt',
        mimeType: asset.mimeType,
        fileSize: asset.fileSize,
        kind: 'image',
      })
    );

    return;
  }

  if (source === 'gallery') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo library access to import a receipt image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];

    onDraftReady(
      buildReceiptImportDraft({
        source: 'gallery',
        uri: asset.uri,
        name: asset.fileName ?? 'Gallery receipt',
        mimeType: asset.mimeType,
        fileSize: asset.fileSize,
        kind: 'image',
      })
    );

    return;
  }

  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
    type: ['image/*', 'application/pdf'],
  });

  if (result.canceled || !result.assets?.[0]) {
    return;
  }

  const asset = result.assets[0];

  onDraftReady(
    buildReceiptImportDraft({
      source: 'files',
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType,
      fileSize: asset.size,
      kind: asset.mimeType?.startsWith('image/') ? 'image' : 'document',
    })
  );
}
