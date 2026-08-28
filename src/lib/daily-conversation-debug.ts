import type {
  DailyConversationCandidate,
  DailyConversationConfidence,
  DailyConversationFocus,
  DailyConversationMessageDebug,
  DailyConversationPatternId,
  DailyConversationPhase,
  DailyConversationPromptContext,
  DailyConversationState,
  DailyConversationTheme,
} from '@/lib/firebase/daily-conversation';

const THEME_LABELS: Record<DailyConversationTheme, string> = {
  'self-esteem': 'Self-Esteem',
  money: 'Money',
};

const PATTERN_LABELS: Record<DailyConversationPatternId, string> = {
  'harsh-self-criticism': 'Harsh self-criticism',
  comparison: 'Comparison',
  'low-confidence-avoidance': 'Low confidence / avoidance',
  'financial-avoidance': 'Financial avoidance',
  'spending-guilt': 'Spending guilt',
  'financial-insecurity': 'Financial insecurity',
};

const CONFIDENCE_LABELS: Record<DailyConversationConfidence, string> = {
  low: 'Low confidence',
  medium: 'Medium confidence',
  high: 'High confidence',
};

/** In-memory only. Cleared when the JS runtime reloads. */
let selectedDebug: DailyConversationMessageDebug | null = null;

export function snapshotDailyConversationState(
  state: DailyConversationState,
): DailyConversationState {
  return {
    phase: state.phase,
    turnCount: state.turnCount,
    isComplete: state.isComplete,
    finalThought: state.finalThought,
    focus: state.focus ? { ...state.focus } : null,
    candidates: state.candidates.map((item) => ({ ...item })),
  };
}

export function snapshotDailyConversationPromptContext(
  context: DailyConversationPromptContext,
): DailyConversationPromptContext {
  return {
    turnCount: context.turnCount,
    phase: context.phase,
    previousFocus: context.previousFocus ? { ...context.previousFocus } : null,
    injectedGuide: context.injectedGuide ? { ...context.injectedGuide } : null,
    previousConversation: context.previousConversation
      ? { ...context.previousConversation }
      : null,
  };
}

export function snapshotDailyConversationMessageDebug(input: {
  assessment: DailyConversationState;
  promptContext: DailyConversationPromptContext | null;
}): DailyConversationMessageDebug {
  return {
    assessment: snapshotDailyConversationState(input.assessment),
    promptContext: input.promptContext
      ? snapshotDailyConversationPromptContext(input.promptContext)
      : null,
  };
}

export function setDailyConversationDebugSnapshot(
  debug: DailyConversationMessageDebug,
): void {
  selectedDebug = snapshotDailyConversationMessageDebug(debug);
}

export function getDailyConversationDebugSnapshot(): DailyConversationMessageDebug | null {
  return selectedDebug;
}

export function dailyConversationThemeLabel(theme: DailyConversationTheme): string {
  return THEME_LABELS[theme];
}

export function dailyConversationPatternLabel(
  pattern: DailyConversationPatternId,
): string {
  return PATTERN_LABELS[pattern];
}

export function dailyConversationConfidenceLabel(
  confidence: DailyConversationConfidence,
): string {
  return CONFIDENCE_LABELS[confidence];
}

export function dailyConversationPhaseLabel(phase: DailyConversationPhase): string {
  return phase.charAt(0).toUpperCase() + phase.slice(1);
}

export function formatDailyConversationFocus(
  focus: DailyConversationFocus | null,
): { theme: string; pattern: string } | null {
  if (!focus) {
    return null;
  }
  return {
    theme: dailyConversationThemeLabel(focus.theme),
    pattern: dailyConversationPatternLabel(focus.pattern),
  };
}

export function formatDailyConversationFocusArrow(
  focus: DailyConversationFocus | null,
): string | null {
  const formatted = formatDailyConversationFocus(focus);
  if (!formatted) {
    return null;
  }
  return `${formatted.theme} → ${formatted.pattern}`;
}

export function formatDailyConversationCandidate(candidate: DailyConversationCandidate): {
  theme: string;
  pattern: string;
  confidence: string;
} {
  return {
    theme: dailyConversationThemeLabel(candidate.theme),
    pattern: dailyConversationPatternLabel(candidate.pattern),
    confidence: dailyConversationConfidenceLabel(candidate.confidence),
  };
}
