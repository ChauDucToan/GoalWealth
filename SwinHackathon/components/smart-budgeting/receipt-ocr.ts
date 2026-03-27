import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

type MlKitTextRecognitionModule = typeof import('@infinitered/react-native-mlkit-text-recognition');

export type ReceiptOcrResult = {
  text: string;
  error: string | null;
  provider: 'mlkit' | 'manual-review';
  status: 'success' | 'empty' | 'unavailable' | 'error';
};

function logReceiptRawText(rawText: string) {
  console.log(
    JSON.stringify(
      {
        raw_text: rawText,
      },
      null,
      2
    )
  );
}

function isExpoGoRuntime() {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

export function getReceiptOcrAvailability(kind: 'image' | 'document' | 'mock') {
  if (kind !== 'image') {
    return {
      available: false,
      reason: 'OCR only runs on image receipts.',
    };
  }

  if (Platform.OS === 'web') {
    return {
      available: false,
      reason: 'OCR is only available on iOS and Android builds.',
    };
  }

  if (isExpoGoRuntime()) {
    return {
      available: false,
      reason: 'OCR requires a development build. Expo Go can import the receipt, but cannot run ML Kit OCR.',
    };
  }

  return {
    available: true,
    reason: null,
  };
}

async function loadMlKitModule(): Promise<MlKitTextRecognitionModule> {
  return import('@infinitered/react-native-mlkit-text-recognition');
}

export async function recognizeReceiptText(
  uri: string,
  kind: 'image' | 'document' | 'mock'
): Promise<ReceiptOcrResult> {
  const availability = getReceiptOcrAvailability(kind);

  if (!availability.available) {
    logReceiptRawText('');
    return {
      text: '',
      error: availability.reason,
      provider: 'manual-review',
      status: 'unavailable',
    };
  }

  if (!uri) {
    logReceiptRawText('');
    return {
      text: '',
      error: 'No image was provided for OCR.',
      provider: 'manual-review',
      status: 'error',
    };
  }

  try {
    const { recognizeText } = await loadMlKitModule();
    const result = await recognizeText(uri);
    const text = result.text?.trim() ?? '';
    logReceiptRawText(text);

    if (!text) {
      return {
        text: '',
        error: 'No readable text was detected. Review the draft manually before saving.',
        provider: 'mlkit',
        status: 'empty',
      };
    }

    return {
      text,
      error: null,
      provider: 'mlkit',
      status: 'success',
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'OCR could not run in this build. Review the draft manually before saving.';
    logReceiptRawText('');

    return {
      text: '',
      error: message,
      provider: 'manual-review',
      status: 'error',
    };
  }
}
