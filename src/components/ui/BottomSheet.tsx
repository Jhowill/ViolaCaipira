import { useAppTheme } from "@/hooks/useAppTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableStateCallbackType,
} from "react-native";

export interface BottomSheetProps {
  readonly visible: boolean;
  readonly title: string;
  readonly subtitle?: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly onClose: () => void;
  readonly dismissible?: boolean;
  readonly closeLabel?: string;
  readonly testID?: string;
}

type PressableInteractionState = PressableStateCallbackType & {
  readonly focused?: boolean;
  readonly hovered?: boolean;
};

function resolvePressableInteractionState(state: PressableStateCallbackType) {
  const interactionState = state as PressableInteractionState;

  return {
    pressed: interactionState.pressed,
    focused: interactionState.focused ?? false,
    hovered: interactionState.hovered ?? false,
  };
}

export function BottomSheet({
  visible,
  title,
  subtitle,
  children,
  footer,
  onClose,
  dismissible = true,
  closeLabel = "Fechar",
  testID,
}: BottomSheetProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  if (!visible) {
    return null;
  }

  const handleClose = () => {
    if (dismissible) {
      onClose();
    }
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={handleClose}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]} testID={testID}>
        {dismissible ? <Pressable accessibilityLabel={closeLabel} onPress={handleClose} style={StyleSheet.absoluteFill} /> : null}

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.colors.surfaceRaised,
                borderColor: theme.colors.border,
                borderTopWidth: theme.borderWidth,
                paddingHorizontal: theme.spacing[4],
                paddingTop: theme.spacing[3],
                paddingBottom: insets.bottom + theme.spacing[4],
              },
            ]}
          >
            <View style={[styles.handle, { backgroundColor: theme.colors.borderStrong }]} />

            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: theme.colors.textPrimary, ...theme.typography.titleMedium }]}>{title}</Text>
                {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.textSecondary, ...theme.typography.bodySmall }]}>{subtitle}</Text> : null}
              </View>

              <Pressable
                accessibilityLabel={closeLabel}
                accessibilityRole="button"
                accessibilityState={{ disabled: !dismissible }}
                disabled={!dismissible}
                onPress={handleClose}
                style={(state) => {
                  const { focused, hovered, pressed } = resolvePressableInteractionState(state);

                  return [
                    styles.closeButton,
                    {
                      borderColor: focused ? theme.colors.focusRing : theme.colors.border,
                      backgroundColor: theme.colors.surface,
                      opacity: dismissible ? (pressed ? 0.76 : hovered ? 0.92 : 1) : 0.5,
                    },
                  ];
                }}
              >
                <Text style={[styles.closeButtonText, { color: theme.colors.textSecondary, ...theme.typography.labelLarge }]}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  keyboard: {
    width: "100%",
  },
  sheet: {
    width: "100%",
    maxHeight: "92%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    gap: 12,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 999,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    flexShrink: 1,
  },
  subtitle: {
    flexShrink: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    marginTop: -1,
  },
  content: {
    gap: 12,
    paddingBottom: 4,
  },
  footer: {
    paddingTop: 4,
  },
});
