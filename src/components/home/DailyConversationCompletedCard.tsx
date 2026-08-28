import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { displayStatement } from '@/lib/display-statement';
import { useTheme } from '@/theme';

type DailyConversationCompletedCardProps = {
  thought: string;
};

export function DailyConversationCompletedCard({
  thought,
}: DailyConversationCompletedCardProps) {
  const theme = useTheme();
  const takeaway = displayStatement(thought);

  return (
    <View
      accessible
      accessibilityLabel={`Daily conversation. ${takeaway}. Come back tomorrow`}
      style={{
        backgroundColor: '#EFE7DD',
        borderRadius: theme.radii.xxl,
        gap: theme.spacing.lg,
        opacity: 0.92,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.xxl,
      }}
    >
      {takeaway ? (
        <AppText
          variant="subtitle"
          style={{
            color: theme.colors.text,
            fontSize: 22,
            fontWeight: '600',
            lineHeight: 32,
            textAlign: 'center',
          }}
        >
          {takeaway}
        </AppText>
      ) : null}
      <AppText
        variant="caption"
        style={{
          color: theme.colors.textMuted,
          fontWeight: '500',
          textAlign: 'center',
        }}
      >
        Daily conversation · Come back tomorrow
      </AppText>
    </View>
  );
}
