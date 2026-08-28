import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { CircleRecommendation } from '@/lib/firebase/user-recommendations';
import { avatarGradientForUser } from '@/lib/user-avatar-gradient';
import { useTheme } from '@/theme';

type CircleRecommendationsCarouselProps = {
  recommendations: CircleRecommendation[];
  addingUserId: string | null;
  onAdd: (recommendation: CircleRecommendation) => void;
};

export function CircleRecommendationsCarousel({
  recommendations,
  addingUserId,
  onAdd,
}: CircleRecommendationsCarouselProps) {
  const theme = useTheme();

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.xxl }}>
      <AppText variant="subtitle">People you might know</AppText>
      <ScrollView
        horizontal
        contentContainerStyle={{
          gap: theme.spacing.md,
          paddingRight: theme.spacing.xl,
        }}
        showsHorizontalScrollIndicator={false}
      >
        {recommendations.map((item) => {
          const [gradientStart, gradientEnd] = avatarGradientForUser(item.userId);
          const busy = addingUserId === item.userId;

          return (
            <View
              key={item.userId}
              style={{
                alignItems: 'center',
                gap: theme.spacing.sm,
                width: 104,
              }}
            >
              <LinearGradient
                colors={[gradientStart, gradientEnd]}
                end={{ x: 1, y: 1 }}
                start={{ x: 0, y: 0 }}
                style={{
                  borderRadius: 999,
                  height: 56,
                  width: 56,
                }}
              />
              <AppText
                variant="caption"
                numberOfLines={2}
                style={{
                  lineHeight: 18,
                  minHeight: 36,
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                {item.displayLabel}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Add ${item.displayLabel}`}
                accessibilityState={{ disabled: busy || addingUserId != null }}
                disabled={busy || addingUserId != null}
                onPress={() => {
                  onAdd(item);
                }}
                style={({ pressed }) => ({
                  alignItems: 'center',
                  backgroundColor: theme.colors.buttonPrimary,
                  borderRadius: theme.radii.full,
                  minWidth: 56,
                  opacity: pressed ? 0.85 : busy ? 0.55 : 1,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.xs,
                })}
              >
                <AppText
                  variant="caption"
                  style={{
                    color: theme.colors.buttonOnPrimary,
                    fontWeight: '600',
                  }}
                >
                  {busy ? 'Adding…' : 'Add'}
                </AppText>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
