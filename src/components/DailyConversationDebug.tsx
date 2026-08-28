import { type ReactNode, useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import {
  dailyConversationPhaseLabel,
  formatDailyConversationCandidate,
  formatDailyConversationFocus,
  formatDailyConversationFocusArrow,
  getDailyConversationDebugSnapshot,
} from '@/lib/daily-conversation-debug';
import { useTheme } from '@/theme';

export function DailyConversationDebug() {
  const theme = useTheme();
  const [rawOpen, setRawOpen] = useState(false);
  const debug = getDailyConversationDebugSnapshot();

  if (!debug) {
    return (
      <View style={{ paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.lg }}>
        <AppText variant="body" tone="muted">
          No assessment selected.
        </AppText>
      </View>
    );
  }

  const { assessment, promptContext } = debug;
  const newFocus = formatDailyConversationFocus(assessment.focus);
  const thought = assessment.finalThought?.trim() ?? '';
  const previousFocusLabel = formatDailyConversationFocusArrow(
    promptContext?.previousFocus ?? null,
  );
  const injectedGuideLabel = formatDailyConversationFocusArrow(
    promptContext?.injectedGuide ?? null,
  );

  return (
    <ScrollView
      contentContainerStyle={{
        gap: theme.spacing.xxl,
        paddingBottom: theme.spacing.xxxl,
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.lg,
      }}
    >
      <DebugSection title="Assessment produced by this reply">
        <DebugField label="Phase" value={dailyConversationPhaseLabel(assessment.phase)} />
        <DebugField label="Turn" value={String(assessment.turnCount)} />
        <DebugField label="Complete" value={assessment.isComplete ? 'Yes' : 'No'} />
      </DebugSection>

      <DebugSection title="New focus">
        {newFocus ? (
          <>
            <DebugField label="Theme" value={newFocus.theme} />
            <DebugField label="Pattern" value={newFocus.pattern} />
          </>
        ) : (
          <AppText variant="body" tone="muted">
            No selected focus
          </AppText>
        )}
      </DebugSection>

      <DebugSection title="Candidates">
        {assessment.candidates.length === 0 ? (
          <AppText variant="body" tone="muted">
            No specialised pattern detected
          </AppText>
        ) : (
          assessment.candidates.map((candidate, index) => {
            const formatted = formatDailyConversationCandidate(candidate);
            return (
              <View
                key={`${candidate.theme}-${candidate.pattern}-${index}`}
                style={{
                  gap: theme.spacing.xs,
                  marginTop: index === 0 ? 0 : theme.spacing.lg,
                }}
              >
                <AppText variant="body">{formatted.theme}</AppText>
                <AppText variant="body">{formatted.pattern}</AppText>
                <AppText variant="caption" tone="muted">
                  {formatted.confidence}
                </AppText>
              </View>
            );
          })
        )}
      </DebugSection>

      {thought ? (
        <DebugSection title="Final thought">
          <AppText variant="body">{thought}</AppText>
        </DebugSection>
      ) : null}

      <DebugSection title="Context used to generate this reply">
        <DebugField
          label="Previous focus"
          value={previousFocusLabel ?? 'No previous focus'}
        />
        <DebugField
          label="Detailed guide injected"
          value={injectedGuideLabel ?? 'No detailed pattern guide'}
        />
        {promptContext ? (
          <>
            <DebugField
              label="Conversation phase used"
              value={dailyConversationPhaseLabel(promptContext.phase)}
            />
            <DebugField
              label="Turn used for generation"
              value={String(promptContext.turnCount)}
            />
          </>
        ) : (
          <AppText variant="body" tone="muted">
            Generation context was not returned for this reply.
          </AppText>
        )}
        <AppText variant="caption" tone="muted" style={{ marginTop: theme.spacing.sm }}>
          The context above was used to generate this reply. The assessment shown
          above was produced by the reply and may change the focus for the next
          turn.
        </AppText>
      </DebugSection>

      <View style={{ gap: theme.spacing.sm }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={rawOpen ? 'Hide raw state' : 'Show raw state'}
          onPress={() => {
            setRawOpen((open) => !open);
          }}
          hitSlop={8}
        >
          <AppText variant="label" tone="muted">
            Raw state{rawOpen ? '  ▾' : '  ▸'}
          </AppText>
        </Pressable>
        {rawOpen ? (
          <AppText
            variant="caption"
            tone="muted"
            selectable
            style={{
              fontFamily:
                Platform.OS === 'ios'
                  ? 'Menlo'
                  : Platform.OS === 'android'
                    ? 'monospace'
                    : 'ui-monospace',
              lineHeight: 20,
            }}
          >
            {JSON.stringify(
              {
                assessment,
                promptContext,
              },
              null,
              2,
            )}
          </AppText>
        ) : null}
      </View>
    </ScrollView>
  );
}

function DebugSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.md }}>
      <AppText variant="label" tone="muted">
        {title}
      </AppText>
      {children}
    </View>
  );
}

function DebugField({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText variant="body">{value}</AppText>
    </View>
  );
}
