import { ThemeButton } from '@/components/ThemeButton';
import { hexToRgba } from '@/components/auth/AuthKit';
import {
  AssistantCard,
  AssistantMessage,
} from '@/components/assistant/mock-data';
import { StockTrendChart } from '@/components/finance/StockTrendChart';
import { useTheme } from '@/hooks/use-theme-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

export function AssistantConversation({
  messages,
}: {
  messages: AssistantMessage[];
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.thread}>
      {messages.map((message) => {
        if (message.role === 'user') {
          return (
            <View key={message.id} style={styles.userRow}>
              <View style={[styles.userBubble, { backgroundColor: colors.success }]}>
                {message.text ? (
                  <Text style={[styles.userText, { color: colors.card }]}>{message.text}</Text>
                ) : null}
              </View>
            </View>
          );
        }

        return (
          <View key={message.id} style={styles.assistantRow}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: hexToRgba(colors.primaryDark, 0.12) },
              ]}
            >
              <MaterialIcons name="smart-toy" size={16} color={colors.primaryDark} />
            </View>

            <View style={styles.assistantBody}>
              {message.text ? (
                <View style={[styles.assistantBubble, { backgroundColor: colors.card }]}>
                  <Text style={[styles.assistantText, { color: colors.text }]}>{message.text}</Text>
                </View>
              ) : null}

              {message.card ? (
                <View style={[styles.cardShell, { backgroundColor: colors.card }]}>
                  <AssistantRichCard card={message.card} />
                </View>
              ) : null}

              {message.meta ? (
                <Text style={[styles.meta, { color: hexToRgba(colors.text, 0.38) }]}>
                  {message.meta}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function AssistantRichCard({ card }: { card: AssistantCard }) {
  const { colors } = useTheme();

  switch (card.type) {
    case 'budget':
      return (
        <View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Budget Snapshot</Text>
          <View style={styles.budgetRow}>
            <View
              style={[
                styles.ringWrap,
                { borderColor: hexToRgba(colors.primaryDark, 0.12) },
              ]}
            >
              <View
                style={[
                  styles.ringValue,
                  { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
                ]}
              >
                <Text style={[styles.ringAmount, { color: colors.text }]}>
                  ${card.spent.toFixed(0)}
                </Text>
                <Text style={[styles.ringMeta, { color: hexToRgba(colors.text, 0.48) }]}>
                  spent
                </Text>
              </View>
            </View>

            <View style={styles.budgetStats}>
              {[
                { label: 'Rent', value: card.rent, accent: colors.primaryDark },
                { label: 'Food', value: card.food, accent: colors.warning },
                { label: 'Transport', value: card.transport, accent: colors.success },
              ].map((item) => (
                <View key={item.label} style={styles.budgetStatRow}>
                  <View style={styles.budgetStatLabel}>
                    <View
                      style={[styles.dot, { backgroundColor: item.accent }]}
                    />
                    <Text style={[styles.inlineLabel, { color: colors.text }]}>{item.label}</Text>
                  </View>
                  <Text style={[styles.inlineValue, { color: colors.text }]}>
                    ${item.value.toFixed(0)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.summaryPill,
              { backgroundColor: hexToRgba(colors.success, 0.12) },
            ]}
          >
            <Text style={[styles.summaryPillText, { color: colors.success }]}>
              Personal saving ${card.savings.toFixed(0)}
            </Text>
          </View>
        </View>
      );
    case 'subscriptions':
      return (
        <View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Subscriptions</Text>
          <Text style={[styles.cardCaption, { color: hexToRgba(colors.text, 0.5) }]}>
            {card.monthLabel} summary
          </Text>
          <View style={styles.listGroup}>
            {card.items.map((item) => (
              <View key={item.name} style={styles.listRow}>
                <View>
                  <Text style={[styles.inlineLabel, { color: colors.text }]}>{item.name}</Text>
                  {item.status ? (
                    <Text style={[styles.listMeta, { color: hexToRgba(colors.text, 0.44) }]}>
                      {item.status}
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.inlineValue, { color: colors.text }]}>
                  ${item.amount}
                </Text>
              </View>
            ))}
          </View>
          {card.cancelled ? (
            <View
              style={[
                styles.alertBox,
                { backgroundColor: hexToRgba(colors.error, 0.08), borderColor: colors.error },
              ]}
            >
              <Text style={[styles.alertText, { color: colors.error }]}>{card.cancelled}</Text>
            </View>
          ) : null}
        </View>
      );
    case 'actions':
      return (
        <View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{card.title}</Text>
          <View style={styles.chipWrap}>
            {card.actions.map((item) => (
              <View
                key={item}
                style={[
                  styles.actionChip,
                  { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
                ]}
              >
                <Text style={[styles.actionChipText, { color: colors.primaryDark }]}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    case 'calendar': {
      const days = Array.from({ length: 31 }, (_, index) => index + 1);
      return (
        <View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{card.monthLabel}</Text>
          <View style={styles.calendarGrid}>
            {days.map((day) => {
              const selected = day === card.highlightedDate;
              return (
                <View
                  key={day}
                  style={[
                    styles.calendarCell,
                    {
                      backgroundColor: selected
                        ? colors.success
                        : colors.backgroundSoft,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarText,
                      { color: selected ? colors.card : colors.text },
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
          <View
            style={[
              styles.summaryPill,
              { backgroundColor: hexToRgba(colors.warning, 0.14) },
            ]}
          >
            <Text style={[styles.summaryPillText, { color: '#B45309' }]}>{card.footer}</Text>
          </View>
        </View>
      );
    }
    case 'confirmation':
      return (
        <View>
          <View style={styles.rowBetween}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{card.title}</Text>
            <MaterialIcons name="check-circle" size={20} color={colors.success} />
          </View>
          <Text style={[styles.cardBody, { color: hexToRgba(colors.text, 0.58) }]}>
            {card.summary}
          </Text>
          <View
            style={[
              styles.summaryPill,
              { backgroundColor: hexToRgba(colors.success, 0.12) },
            ]}
          >
            <Text style={[styles.summaryPillText, { color: colors.success }]}>
              {card.statusLabel}
            </Text>
          </View>
        </View>
      );
    case 'transaction':
      return (
        <View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{card.title}</Text>
          <View style={styles.listGroup}>
            {card.fields.map((field) => (
              <View key={field.label} style={styles.listRow}>
                <Text style={[styles.listMeta, { color: hexToRgba(colors.text, 0.48) }]}>
                  {field.label}
                </Text>
                <Text style={[styles.inlineValue, { color: colors.text }]}>{field.value}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    case 'quote':
      return (
        <View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{card.title}</Text>
          <Text style={[styles.quoteBody, { color: colors.text }]}>{card.body}</Text>
          {card.author ? (
            <Text style={[styles.cardCaption, { color: hexToRgba(colors.text, 0.48) }]}>
              {card.author}
            </Text>
          ) : null}
        </View>
      );
    case 'bar-chart':
      return (
        <View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{card.title}</Text>
          <View style={styles.barWrap}>
            {card.values.map((value, index) => (
              <View key={`${card.labels[index]}-${index}`} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: value,
                      backgroundColor:
                        index % 2 === 0 ? colors.error : colors.primaryDark,
                    },
                  ]}
                />
                <Text style={[styles.chartLabel, { color: hexToRgba(colors.text, 0.48) }]}>
                  {card.labels[index]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      );
    case 'projection':
      return (
        <View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{card.title}</Text>
          <StockTrendChart
            values={card.values}
            accent={colors.success}
            labelColor={hexToRgba(colors.text, 0.46)}
            labels={card.labels}
            height={90}
          />
          <Text style={[styles.cardCaption, { color: colors.success }]}>
            {card.targetLabel}
          </Text>
        </View>
      );
    case 'resource':
      return (
        <View>
          <View style={styles.mediaGrid}>
            {['calculate', 'payments', 'pie-chart', 'trending-up'].map((icon, index) => (
              <View
                key={`${icon}-${index}`}
                style={[
                  styles.mediaTile,
                  { backgroundColor: hexToRgba(colors.primaryDark, 0.08 + index * 0.02) },
                ]}
              >
                <MaterialIcons
                  name={icon as React.ComponentProps<typeof MaterialIcons>['name']}
                  size={18}
                  color={colors.primaryDark}
                />
              </View>
            ))}
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{card.title}</Text>
          <Text style={[styles.cardBody, { color: hexToRgba(colors.text, 0.58) }]}>
            {card.caption}
          </Text>
          <Text style={[styles.cardCaption, { color: colors.primaryDark }]}>{card.source}</Text>
        </View>
      );
    case 'map':
      return (
        <View>
          <View style={[styles.mapCard, { backgroundColor: colors.backgroundSoft }]}>
            <View style={styles.mapRoute} />
            <View style={[styles.mapPinStart, { backgroundColor: colors.primaryDark }]} />
            <View style={[styles.mapPinEnd, { backgroundColor: colors.success }]} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{card.title}</Text>
          <Text style={[styles.cardBody, { color: hexToRgba(colors.text, 0.58) }]}>
            {card.detail}
          </Text>
          <Text style={[styles.cardCaption, { color: colors.primaryDark }]}>{card.eta}</Text>
        </View>
      );
    case 'receipt':
      return (
        <View>
          <View style={styles.rowBetween}>
            <View
              style={[
                styles.fileBadge,
                { backgroundColor: hexToRgba(colors.success, 0.12) },
              ]}
            >
              <MaterialIcons name="description" size={16} color={colors.success} />
              <Text style={[styles.fileBadgeText, { color: colors.success }]}>{card.fileName}</Text>
            </View>
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{card.title}</Text>
          <View style={styles.listGroup}>
            {card.fields.map((field) => (
              <View key={field.label} style={styles.listRow}>
                <Text style={[styles.listMeta, { color: hexToRgba(colors.text, 0.48) }]}>
                  {field.label}
                </Text>
                <Text style={[styles.inlineValue, { color: colors.text }]}>{field.value}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    default:
      return null;
  }
}

export function AssistantActionDeck({
  onVoice,
  onReceipt,
  onSettings,
  onUpgrade,
}: {
  onVoice: () => void;
  onReceipt: () => void;
  onSettings: () => void;
  onUpgrade: () => void;
}) {
  const { colors } = useTheme();
  const actions = [
    { label: 'Voice', icon: 'keyboard-voice', onPress: onVoice },
    { label: 'Receipt', icon: 'photo-camera', onPress: onReceipt },
    { label: 'Settings', icon: 'tune', onPress: onSettings },
    { label: 'Upgrade', icon: 'workspace-premium', onPress: onUpgrade },
  ] as const;

  return (
    <View style={styles.actionDeck}>
      {actions.map((action) => (
        <Pressable
          key={action.label}
          style={[styles.actionDeckCard, { backgroundColor: colors.card }]}
          onPress={action.onPress}
        >
          <View
            style={[
              styles.actionDeckIcon,
              { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
            ]}
          >
            <MaterialIcons name={action.icon} size={18} color={colors.primaryDark} />
          </View>
          <Text style={[styles.actionDeckLabel, { color: colors.text }]}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function AssistantEmptyState({
  title,
  body,
  onPrimary,
}: {
  title: string;
  body: string;
  onPrimary: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: hexToRgba(colors.primaryDark, 0.08) },
        ]}
      >
        <MaterialIcons name="smart-toy" size={34} color={colors.primaryDark} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptyBody, { color: hexToRgba(colors.text, 0.56) }]}>{body}</Text>
      <ThemeButton
        title="Open Assistant"
        onPress={onPrimary}
        colorBackground={colors.primaryDark}
        colorText={colors.card}
        style={styles.emptyButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  thread: {
    gap: 14,
  },
  userRow: {
    alignItems: 'flex-end',
  },
  userBubble: {
    maxWidth: '84%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  userText: {
    fontSize: Typography.body,
    lineHeight: 20,
    fontWeight: '600',
  },
  assistantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantBody: {
    flex: 1,
    gap: 6,
  },
  assistantBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  assistantText: {
    fontSize: Typography.body,
    lineHeight: 21,
  },
  cardShell: {
    borderRadius: 22,
    padding: 16,
  },
  meta: {
    fontSize: Typography.body,
    marginLeft: 6,
  },
  cardTitle: {
    fontSize: Typography.body,
    fontWeight: '800',
  },
  cardCaption: {
    marginTop: 8,
    fontSize: Typography.body,
    fontWeight: '600',
  },
  cardBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 20,
  },
  budgetRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 14,
  },
  ringWrap: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  ringMeta: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  budgetStats: {
    flex: 1,
    gap: 10,
  },
  budgetStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetStatLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inlineLabel: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  inlineValue: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  summaryPill: {
    marginTop: 14,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  summaryPillText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  listGroup: {
    marginTop: 12,
    gap: 10,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  listMeta: {
    fontSize: Typography.body,
  },
  alertBox: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  alertText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  chipWrap: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionChipText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  calendarGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  calendarCell: {
    width: '12.8%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quoteBody: {
    marginTop: 12,
    fontSize: Typography.body,
    lineHeight: 22,
    fontWeight: '600',
  },
  barWrap: {
    marginTop: 14,
    height: 124,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barCol: {
    alignItems: 'center',
    gap: 10,
  },
  bar: {
    width: 22,
    borderRadius: 999,
  },
  chartLabel: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  mediaGrid: {
    marginBottom: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mediaTile: {
    width: '47%',
    height: 68,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCard: {
    marginBottom: 14,
    height: 124,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mapRoute: {
    position: 'absolute',
    left: '22%',
    top: '18%',
    width: '58%',
    height: 4,
    backgroundColor: '#1573fe',
    transform: [{ rotate: '-28deg' }],
  },
  mapPinStart: {
    position: 'absolute',
    left: '18%',
    top: '24%',
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  mapPinEnd: {
    position: 'absolute',
    right: '18%',
    bottom: '26%',
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  fileBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileBadgeText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  actionDeck: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionDeckCard: {
    width: '47%',
    borderRadius: 20,
    padding: 14,
  },
  actionDeckIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDeckLabel: {
    marginTop: 12,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 18,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyBody: {
    marginTop: 10,
    fontSize: Typography.body,
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyButton: {
    width: '100%',
    marginTop: 20,
  },
});
