import { hexToRgba } from '@/components/auth/AuthKit';
import {
  assessmentPurposeOptions,
  occupationExamples,
} from '@/components/financial-assessment/data';
import {
  AssessmentPrimaryButton,
  AssessmentSectionCard,
  AssessmentShell,
} from '@/components/financial-assessment/shared';
import { useFinancialAssessment } from '@/hooks/use-financial-assessment';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function FinancialAssessmentEssentialsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { state, setFullName, setOccupation, setPurposeId } = useFinancialAssessment();
  const isReady = Boolean(state.fullName.trim() && state.occupation.trim() && state.purposeId);

  return (
    <AssessmentShell
      step={1}
      totalSteps={5}
      eyebrow="Section 1 of 5"
      title="Tell us who you are and why you are here."
      body="Identity and purpose stay together here so the advisor can interpret later financial signals with the right user context."
      scrollable
      footer={
        <AssessmentPrimaryButton
          label="Continue to income profile"
          disabled={!isReady}
          onPress={() => router.push('/(finance)/financial-assessment/income-profile')}
        />
      }
    >
      <View style={[styles.heroCard, { backgroundColor: hexToRgba(colors.primaryDark, 0.08) }]}>
        <View style={[styles.avatar, { backgroundColor: colors.card }]}>
          <Text style={[styles.avatarText, { color: colors.primaryDark }]}>
            {(state.fullName.trim().charAt(0) || 'F').toUpperCase()}
          </Text>
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroLabel, { color: colors.primaryDark }]}>Profile basics</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            {state.fullName.trim() || 'Your assessment profile'}
          </Text>
          <Text style={[styles.heroBody, { color: hexToRgba(colors.text, 0.6) }]}>
            {state.occupation.trim() || 'Add your work context so Finpal can tune the assessment.'}
          </Text>
        </View>
      </View>

      <AssessmentSectionCard
        title="About you"
        body="Capture the human context that will later shape tone, guidance and follow-up actions."
      >
        <View style={styles.fieldStack}>
          <View>
            <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.54) }]}>
              Full name
            </Text>
            <TextInput
              value={state.fullName}
              onChangeText={setFullName}
              placeholder="Jonathan T. Doe"
              placeholderTextColor={hexToRgba(colors.text, 0.34)}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.backgroundSoft,
                },
              ]}
              autoCapitalize="words"
            />
          </View>

          <View>
            <Text style={[styles.fieldLabel, { color: hexToRgba(colors.text, 0.54) }]}>
              What do you do for a living?
            </Text>
            <TextInput
              value={state.occupation}
              onChangeText={setOccupation}
              placeholder="Enter your role, field or the type of work you do..."
              placeholderTextColor={hexToRgba(colors.text, 0.34)}
              style={[
                styles.textarea,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.backgroundSoft,
                },
              ]}
              multiline
            />
          </View>
        </View>

        <View style={styles.exampleWrap}>
          {occupationExamples.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.exampleChip,
                {
                  backgroundColor: colors.backgroundSoft,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setOccupation(item)}
            >
              <Text style={[styles.exampleText, { color: colors.text }]}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </AssessmentSectionCard>

      <AssessmentSectionCard
        title="Why are you using Finpal?"
        body="We keep the same purpose choices from the kit, but avoid forcing another full-screen step."
      >
        <View style={styles.purposeStack}>
          {assessmentPurposeOptions.map((item) => {
            const active = state.purposeId === item.id;

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.purposeCard,
                  {
                    backgroundColor: active ? hexToRgba(colors.primaryDark, 0.08) : colors.card,
                    borderColor: active ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => setPurposeId(item.id)}
              >
                <View
                  style={[
                    styles.purposeIcon,
                    {
                      backgroundColor: active
                        ? hexToRgba(colors.primaryDark, 0.12)
                        : colors.backgroundSoft,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={20}
                    color={active ? colors.primaryDark : hexToRgba(colors.text, 0.55)}
                  />
                </View>
                <View style={styles.purposeCopy}>
                  <Text style={[styles.purposeLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.purposeHelper, { color: hexToRgba(colors.text, 0.54) }]}>
                    {item.helper}
                  </Text>
                </View>
                <View
                  style={[
                    styles.purposeCheck,
                    {
                      backgroundColor: active ? colors.primaryDark : colors.card,
                      borderColor: active ? colors.primaryDark : colors.border,
                    },
                  ]}
                >
                  {active ? <MaterialIcons name="check" size={15} color={colors.card} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </AssessmentSectionCard>
    </AssessmentShell>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    heroCard: {
      borderRadius: 28,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    avatar: {
      width: 62,
      height: 62,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 28,
      fontWeight: '900',
    },
    heroCopy: {
      flex: 1,
      minWidth: 0,
    },
    heroLabel: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },
    heroTitle: {
      marginTop: 6,
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: -0.4,
    },
    heroBody: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '500',
    },
    fieldStack: {
      gap: 14,
    },
    fieldLabel: {
      marginBottom: 8,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    input: {
      minHeight: 50,
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 14,
      fontSize: 15,
      fontWeight: '600',
    },
    textarea: {
      minHeight: 118,
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 14,
      fontSize: 15,
      fontWeight: '600',
      textAlignVertical: 'top',
    },
    exampleWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    exampleChip: {
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    exampleText: {
      fontSize: 12,
      fontWeight: '700',
    },
    purposeStack: {
      gap: 12,
    },
    purposeCard: {
      borderRadius: 22,
      borderWidth: 1,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    purposeIcon: {
      width: 42,
      height: 42,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    purposeCopy: {
      flex: 1,
      minWidth: 0,
    },
    purposeLabel: {
      fontSize: 14,
      lineHeight: 19,
      fontWeight: '800',
    },
    purposeHelper: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
    },
    purposeCheck: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
