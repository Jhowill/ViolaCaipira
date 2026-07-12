import { useAppTheme } from "@/hooks/useAppTheme";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type StyleProp,
  type PressableStateCallbackType,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
  View,
} from "react-native";

export interface TextFieldCounterProps {
  readonly maximum?: number;
  readonly label?: string;
}

export interface TextFieldProps extends Omit<TextInputProps, "style" | "value" | "onChangeText" | "editable" | "multiline" | "numberOfLines" | "placeholder"> {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (value: string) => void;
  readonly placeholder?: string;
  readonly helperText?: string;
  readonly errorText?: string;
  readonly counter?: boolean | TextFieldCounterProps;
  readonly leadingAccessory?: ReactNode;
  readonly trailingAccessory?: ReactNode;
  readonly clearable?: boolean;
  readonly clearLabel?: string;
  readonly disabled?: boolean;
  readonly multiline?: boolean;
  readonly numberOfLines?: number;
  readonly containerStyle?: StyleProp<ViewStyle>;
  readonly inputStyle?: StyleProp<TextStyle>;
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

function resolveCounterLabel(counter: boolean | TextFieldCounterProps | undefined) {
  if (!counter) {
    return null;
  }

  const details = typeof counter === "boolean" ? {} : counter;
  const label = details.label ?? "caracteres";

  return { label, maximum: details.maximum };
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  helperText,
  errorText,
  counter,
  leadingAccessory,
  trailingAccessory,
  clearable = false,
  clearLabel = "Limpar campo",
  containerStyle,
  inputStyle,
  disabled = false,
  multiline = false,
  numberOfLines,
  onFocus,
  onBlur,
  onChange,
  ...textInputProps
}: TextFieldProps) {
  const { theme } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const counterInfo = useMemo(() => resolveCounterLabel(counter), [counter]);

  const handleFocus = useCallback<NonNullable<TextInputProps["onFocus"]>>(
    (event) => {
      setFocused(true);
      onFocus?.(event);
    },
    [onFocus],
  );

  const handleBlur = useCallback<NonNullable<TextInputProps["onBlur"]>>(
    (event) => {
      setFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  const handleClearPress = useCallback(() => {
    if (disabled) {
      return;
    }

    onChangeText("");
  }, [disabled, onChangeText]);

  const borderColor = errorText
    ? theme.colors.danger
    : focused
      ? theme.colors.focusRing
      : theme.colors.border;
  const wrapperBackgroundColor = disabled ? theme.colors.surfaceMuted : theme.colors.surface;
  const textColor = disabled ? theme.colors.textDisabled : theme.colors.textPrimary;
  const helperColor = errorText ? theme.colors.danger : theme.colors.textSecondary;
  const counterColor = theme.colors.textMuted;
  const minHeight = multiline ? 160 : 56;

  const counterText = counterInfo ? `${value.length}${counterInfo.maximum ? `/${counterInfo.maximum}` : ""} ${counterInfo.label}` : null;
  const accessibilityHint = errorText ?? helperText;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, { color: theme.colors.textSecondary, ...theme.typography.labelMedium }]}>{label}</Text>

      <View
        style={[
          styles.field,
          {
            minHeight,
            borderColor,
            borderWidth: theme.borderWidth,
            backgroundColor: wrapperBackgroundColor,
            borderRadius: theme.radii.lg,
            paddingHorizontal: theme.spacing[4],
            paddingVertical: multiline ? theme.spacing[4] : theme.spacing[3],
          },
        ]}
      >
        {leadingAccessory ? <View style={styles.leadingAccessory}>{leadingAccessory}</View> : null}

        <TextInput
          {...textInputProps}
          accessibilityLabel={label}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled }}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onBlur={handleBlur}
          onChange={onChange}
          onFocus={handleFocus}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textDisabled}
          selectionColor={theme.colors.focusRing}
          style={[
            styles.input,
            {
              color: textColor,
              minHeight: multiline ? 120 : undefined,
              textAlignVertical: multiline ? "top" : "center",
              ...theme.typography.bodyLarge,
            },
            inputStyle,
          ]}
        />

        {clearable && value.length > 0 && !disabled ? (
          <Pressable
            accessibilityLabel={clearLabel}
            accessibilityRole="button"
            onPress={handleClearPress}
            style={(state) => {
              const { focused: isFocused, hovered, pressed } = resolvePressableInteractionState(state);

              return [
                styles.iconButton,
                {
                  borderColor: isFocused ? theme.colors.focusRing : "transparent",
                  opacity: pressed ? 0.72 : hovered ? 0.88 : 1,
                },
              ];
            }}
          >
            <Text style={[styles.iconButtonText, { color: theme.colors.textMuted, ...theme.typography.labelLarge }]}>×</Text>
          </Pressable>
        ) : null}

        {trailingAccessory ? <View style={styles.trailingAccessory}>{trailingAccessory}</View> : null}
      </View>

      {helperText || errorText || counterText ? (
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: helperColor, ...theme.typography.caption }]}>{errorText ?? helperText ?? ""}</Text>
          {counterText ? <Text style={[styles.metaText, { color: counterColor, ...theme.typography.caption }]}>{counterText}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 8,
  },
  label: {
    marginLeft: 2,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  leadingAccessory: {
    alignItems: "center",
    justifyContent: "center",
  },
  trailingAccessory: {
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  iconButtonText: {
    marginTop: -1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  metaText: {
    flexShrink: 1,
  },
});
