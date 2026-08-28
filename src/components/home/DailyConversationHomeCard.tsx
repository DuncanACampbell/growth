import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme';

type DailyConversationHomeCardProps = {
  onPress: () => void;
};

export function DailyConversationHomeCard({
  onPress,
}: DailyConversationHomeCardProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: '#EFE7DD',
        borderRadius: theme.radii.xxl,
        flexDirection: 'row',
        gap: theme.spacing.md,
        minHeight: 88,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.xl,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="How are you today? Talk about what’s on your mind."
        onPress={onPress}
        style={{ flex: 1, gap: theme.spacing.xs, justifyContent: 'center' }}
      >
        <AppText variant="subtitle" style={{ fontSize: 22, lineHeight: 28 }}>
          How are you today?
        </AppText>
        <AppText variant="body" tone="muted">
          Talk about what’s on your mind.
        </AppText>
      </Pressable>
      <AppButton
        circular
        accessibilityLabel="Start today’s conversation"
        onPress={onPress}
        leadingIcon={
          <Ionicons
            name="arrow-forward"
            size={20}
            color={theme.colors.buttonOnPrimary}
          />
        }
      />
    </View>
  );
}
