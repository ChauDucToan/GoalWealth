import { ThemeButton } from '@/components/ThemeButton';
import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { AssistantCard, AssistantScreen } from '@/components/assistant/AssistantScaffold';
import { hexToRgba } from '@/components/auth/AuthKit';
import { useAssistant } from '@/hooks/use-assistant';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

const recentReceipts = [
  { id: 'r1', title: 'FreshMart Grocery', amount: '$88.00', icon: 'shopping-bag' },
  { id: 'r2', title: 'Home Utilities', amount: '$124.00', icon: 'bolt' },
  { id: 'r3', title: 'Metro Transit', amount: '$14.50', icon: 'directions-bus' },
  { id: 'r4', title: 'Coffee Subscription', amount: '$9.99', icon: 'local-cafe' },
] as const;

const importSources: {
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
}[] = [
  { label: 'Take photo', icon: 'photo-camera' },
  { label: 'Browse files', icon: 'folder-open' },
  { label: 'Gallery', icon: 'collections' },
];

export default function ReceiptUploadScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { selectAssistantScenario, setReceiptImportDraft } = useAssistant();
  const [activeSource, setActiveSource] = useState<'camera' | 'gallery' | 'files' | null>(null);

  const openScanWithDraft = (draft: {
    source: 'camera' | 'gallery' | 'files' | 'demo';
    uri?: string;
    name: string;
    mimeType?: string | null;
    fileSize?: number | null;
    kind: 'image' | 'document' | 'mock';
  }) => {
    setReceiptImportDraft(draft);
    router.push('/(assistant)/receipt-scan');
  };

  const pickFromCamera = async () => {
    setActiveSource('camera');

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Camera access needed', 'Allow camera access to capture a receipt for OCR review.');
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

      openScanWithDraft({
        source: 'camera',
        uri: asset.uri,
        name: asset.fileName ?? 'Camera receipt',
        mimeType: asset.mimeType,
        fileSize: asset.fileSize,
        kind: 'image',
      });
    } finally {
      setActiveSource(null);
    }
  };

  const pickFromGallery = async () => {
    setActiveSource('gallery');

    try {
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

      openScanWithDraft({
        source: 'gallery',
        uri: asset.uri,
        name: asset.fileName ?? 'Gallery receipt',
        mimeType: asset.mimeType,
        fileSize: asset.fileSize,
        kind: 'image',
      });
    } finally {
      setActiveSource(null);
    }
  };

  const pickFromFiles = async () => {
    setActiveSource('files');

    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: ['image/*', 'application/pdf'],
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];

      openScanWithDraft({
        source: 'files',
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
        fileSize: asset.size,
        kind: asset.mimeType?.startsWith('image/') ? 'image' : 'document',
      });
    } finally {
      setActiveSource(null);
    }
  };

  const importActions: Record<(typeof importSources)[number]['label'], () => Promise<void>> = {
    'Take photo': pickFromCamera,
    'Browse files': pickFromFiles,
    Gallery: pickFromGallery,
  };

  return (
    <AssistantScreen
      title="Receipt Upload"
      subtitle="Upload a receipt, scan it, then send the extracted result back into chat"
    >
      <View style={styles.stack}>
        <AssistantCard style={[styles.heroCard, { backgroundColor: colors.primaryDark }]}>
          <View
            style={[
              styles.heroBadge,
              { backgroundColor: hexToRgba(colors.card, 0.14) },
            ]}
          >
            <MaterialIcons name="receipt-long" size={16} color={colors.card} />
            <Text style={[styles.heroBadgeText, { color: colors.card }]}>Receipt OCR</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.card }]}>Add your latest bill or receipt</Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.card, 0.8) }]}>
            Finpal can extract merchant, amount, date and suggest a category.
          </Text>
          <View style={styles.heroActions}>
            <ThemeButton
              title="Start demo scan"
              onPress={() =>
                openScanWithDraft({
                  source: 'demo',
                  name: 'FreshMart Grocery receipt',
                  kind: 'mock',
                })
              }
              colorBackground={colors.card}
              colorText={colors.primaryDark}
              style={styles.heroButton}
            />
            <ThemeButton
              title="Use demo result"
              onPress={() => {
                selectAssistantScenario('receipt');
                router.replace({
                  pathname: '/(assistant)/chat/[scenario]',
                  params: { scenario: 'receipt' },
                });
              }}
              colorBackground={hexToRgba(colors.card, 0.14)}
              colorText={colors.card}
              style={[styles.heroButton, styles.heroOutline]}
            />
          </View>
        </AssistantCard>

        <AssistantCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Import source</Text>
          <ResponsiveGrid
            minItemWidth={104}
            horizontalPadding={36}
            gap={10}
            maxColumns={3}
            style={styles.cardGrid}
          >
            {importSources.map((item) => (
              <Pressable
                key={item.label}
                style={[
                  styles.sourceCard,
                  { backgroundColor: colors.backgroundSoft },
                  activeSource ===
                  (item.label === 'Take photo'
                    ? 'camera'
                    : item.label === 'Browse files'
                      ? 'files'
                      : 'gallery')
                    ? styles.sourceCardActive
                    : null,
                ]}
                onPress={() => {
                  void importActions[item.label]();
                }}
              >
                <View
                  style={[
                    styles.sourceIcon,
                    { backgroundColor: hexToRgba(colors.primaryDark, 0.1) },
                  ]}
                >
                  <MaterialIcons name={item.icon} size={20} color={colors.primaryDark} />
                </View>
                <Text style={[styles.sourceText, { color: colors.text }]}>{item.label}</Text>
              </Pressable>
            ))}
          </ResponsiveGrid>
        </AssistantCard>

        <AssistantCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent receipts</Text>
          <Text style={[styles.sectionBody, { color: hexToRgba(colors.text, 0.56) }]}>
            Demo tiles to mirror the uploaded history state from the design board.
          </Text>

          <ResponsiveGrid
            minItemWidth={140}
            horizontalPadding={36}
            gap={10}
            maxColumns={2}
            style={styles.cardGrid}
          >
            {recentReceipts.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.receiptCard, { backgroundColor: colors.backgroundSoft }]}
                onPress={() =>
                  openScanWithDraft({
                    source: 'demo',
                    name: `${item.title}.jpg`,
                    kind: 'mock',
                  })
                }
              >
                <View
                  style={[
                    styles.receiptIcon,
                    { backgroundColor: hexToRgba(colors.success, 0.14) },
                  ]}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={18}
                    color={colors.success}
                  />
                </View>
                <Text style={[styles.receiptTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.receiptAmount, { color: colors.primaryDark }]}>
                  {item.amount}
                </Text>
              </Pressable>
            ))}
          </ResponsiveGrid>
        </AssistantCard>
      </View>
    </AssistantScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    marginTop: 18,
    gap: 16,
  },
  heroCard: {
    borderWidth: 0,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroBadgeText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  heroTitle: {
    marginTop: 18,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  heroBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 21,
  },
  heroActions: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroButton: {
    flex: 1,
    flexBasis: 150,
    minWidth: 0,
  },
  heroOutline: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionBody: {
    marginTop: 8,
    fontSize: Typography.body,
    lineHeight: 21,
  },
  cardGrid: {
    marginTop: 16,
  },
  sourceCard: {
    width: '100%',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    gap: 12,
  },
  sourceCardActive: {
    opacity: 0.82,
  },
  sourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceText: {
    fontSize: Typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  receiptCard: {
    width: '100%',
    borderRadius: 20,
    padding: 14,
  },
  receiptIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptTitle: {
    marginTop: 12,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  receiptAmount: {
    marginTop: 6,
    fontSize: Typography.body,
    fontWeight: '700',
  },
});
