import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

type ScreenProps = ViewProps & {
  /** When false, content can draw behind the status bar / home indicator. */
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
};

export function Screen({ style, children, edges, ...rest }: ScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={edges ?? ['top', 'right', 'bottom', 'left']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      {...rest}
    >
      <View style={[styles.content, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
