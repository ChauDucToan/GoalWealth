import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import { FinanceCard, FinanceScreen } from '@/components/finance/FinanceScaffold';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme-colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

export default function AddNoteScreen() {
  const { transactionDraft, updateTransactionDraft } = useFinance();
  const { colors } = useTheme();
  const router = useRouter();
  const [note, setNote] = useState(transactionDraft.note);

  return (
    <FinanceScreen title="Add Note" subtitle="Save a note into the current draft">
      <FinanceCard>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Enter your note here..."
          placeholderTextColor={hexToRgba(colors.text, 0.34)}
          multiline
          style={[
            styles.input,
            {
              backgroundColor: colors.backgroundSoft,
              color: colors.text,
              borderColor: hexToRgba(colors.primaryDark, 0.08),
            },
          ]}
        />

        <ThemeButton
          title="Save Note"
          onPress={() => {
            updateTransactionDraft({ note });
            router.back();
          }}
          colorBackground={colors.primaryDark}
          colorText={colors.card}
          style={styles.button}
        />
      </FinanceCard>
    </FinanceScreen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 140,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 18,
  },
});
