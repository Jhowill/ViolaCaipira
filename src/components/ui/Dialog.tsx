import { AppButton } from "@/components/ui/AppButton";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AppButtonVariant } from "@/types/ui";
import type { ReactNode } from "react";
import {
  Dimensions,
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

export interface DialogAction {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: AppButtonVariant;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly accessibilityLabel?: string;
}

export interface DialogProps {
  readonly visible: boolean;
  readonly title: string;
  readonly description?: string;
  readonly icon?: ReactNode;
  readonly children?: ReactNode;
  readonly footer?: ReactNode;
  readonly actions?: readonly DialogAction[];
  readonly onClose: () => void;
  readonly dismissible?: boolean;
  readonly closeLabel?: string;
  readonly maxWidth?: number;
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

export function Dialog({
  visible,
  title,
  description,
  icon,
  children,
  footer,
  actions,
  onClose,
  dismissible = true,
  closeLabel = "Fechar",
  maxWidth,
  testID,
}: DialogProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  if (!visible) {
    return null;
  }

  const viewportWidth = Dimensions.get("window").width;
  const sheetMaxWidth = Math.min(maxWidth ?? 560, Math.max(320, viewportWidth - theme.spacing[4] * 2));

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
              styles.card,
              {
                width: "100%",
                maxWidth: sheetMaxWidth,
                backgroundColor: theme.colors.surfaceRaised,
                borderColor: theme.colors.border,
                borderWidth: theme.borderWidth,
                borderRadius: 24,
                padding: theme.spacing[4],
                paddingBottom: theme.spacing[4] + insets.bottom,
              },
            ]}
          >
            <View style={styles.header}>
              {icon ? <View style={styles.iconContainer}>{icon}</View> : null}

              <View style={styles.headerText}>
                <Text style={[styles.title, { color: theme.colors.textPrimary, ...theme.typography.titleMedium }]}>{title}</Text>
                {description ? <Text style={[styles.description, { color: theme.colors.textSecondary, ...theme.typography.bodyMedium }]}>{description}</Text> : null}
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

            {actions && actions.length > 0 ? (
              <View style={styles.actions}>
                {actions.map((action, index) => (
                  <AppButton
                    key={`${action.label}-${index}`}
                    accessibilityLabel={action.accessibilityLabel}
                    disabled={action.disabled}
                    fullWidth
                    loading={action.loading}
                    onPress={action.onPress}
                    variant={action.variant ?? (index === 0 ? "primary" : "secondary")}
                  >
                    {action.label}
                  </AppButton>
                ))}
              </View>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  keyboard: {
    width: "100%",
  },
  card: {
    alignSelf: "center",
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconContainer: {
    marginTop: 1,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    flexShrink: 1,
  },
  description: {
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
  },
  footer: {
    paddingTop: 4,
  },
  actions: {
    gap: 8,
  },
});
