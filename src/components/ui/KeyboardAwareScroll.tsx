import { type ReactNode, type Ref } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type KeyboardAwareScrollProps = Omit<ScrollViewProps, 'contentContainerStyle'> & {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Extra offset for fixed headers / safe-area chrome above the scroll area. */
  keyboardVerticalOffset?: number;
  scrollRef?: Ref<ScrollView>;
  style?: StyleProp<ViewStyle>;
};

/**
 * Scrollable form body that stays usable while the keyboard is open.
 * Prefer this for any screen whose primary inputs live in the scroll content.
 */
export function KeyboardAwareScroll({
  children,
  contentContainerStyle,
  keyboardVerticalOffset = Platform.OS === 'ios' ? 8 : 0,
  scrollRef,
  style,
  ...scrollProps
}: KeyboardAwareScrollProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={[styles.fill, style]}
    >
      <ScrollView
        ref={scrollRef}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...scrollProps}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        style={styles.fill}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  fill: {
    flex: 1,
  },
});
