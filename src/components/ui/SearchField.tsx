import { useAppTheme } from "@/hooks/useAppTheme";
import { useCallback, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type StyleProp,
  type PressableStateCallbackType,
  type TextInputProps,
  type ViewStyle,
  View,
} from "react-native";

export interface SearchFieldProps extends Omit<TextInputProps, "style" | "value" | "onChangeText" | "editable" | "placeholder" | "multiline" | "numberOfLines"> {
  readonly value: string;
  readonly onChangeText: (value: string) => void;
  readonly placeholder?: string;
  readonly accessibilityLabel?: string;
  readonly onClearPress?: () => void;
  readonly clearLabel?: string;
  readonly onFilterPress?: () => void;
  readonly filterLabel?: string;
  readonly disabled?: boolean;
  readonly containerStyle?: StyleProp<ViewStyle>;
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

export function SearchField({
  value,
  onChangeText,
  placeholder = "Buscar",
  accessibilityLabel = "Buscar",
  onClearPress,
  clearLabel = "Limpar busca",
  onFilterPress,
  filterLabel = "Filtros",
  containerStyle,
  disabled = false,
  onFocus,
  onBlur,
  onChange,
  ...textInputProps
}: SearchFieldProps) {
  const { theme } = useAppTheme();
  const [focused, setFocused] = useState(false);

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

    onClearPress?.();
    onChangeText("");
  }, [disabled, onChangeText, onClearPress]);

  const borderColor = focused ? theme.colors.focusRing : theme.colors.border;
  const backgroundColor = disabled ? theme.colors.surfaceMuted : theme.colors.surface;

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.field,
          {
            borderColor,
            borderWidth: theme.borderWidth,
            backgroundColor,
            borderRadius: theme.radii.lg,
            paddingHorizontal: theme.spacing[4],
            minHeight: 56,
          },
        ]}
      >
        <Text style={[styles.icon, { color: theme.colors.textMuted, ...theme.typography.titleSmall }]}>⌕</Text>

        <TextInput
          {...textInputProps}
          accessibilityLabel={accessibilityLabel}
          editable={!disabled}
          onBlur={handleBlur}
          onChange={onChange}
          onFocus={handleFocus}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textDisabled}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor={theme.colors.focusRing}
          style={[
            styles.input,
            {
              color: disabled ? theme.colors.textDisabled : theme.colors.textPrimary,
              ...theme.typography.bodyLarge,
            },
          ]}
        />

        {value.length > 0 && !disabled ? (
          <Pressable
            accessibilityLabel={clearLabel}
            accessibilityRole="button"
            onPress={handleClearPress}
            style={(state) => {
              const { focused: isFocused, hovered, pressed } = resolvePressableInteractionState(state);

              return [
                styles.clearButton,
                {
                  borderColor: isFocused ? theme.colors.focusRing : "transparent",
                  opacity: pressed ? 0.72 : hovered ? 0.88 : 1,
                },
              ];
            }}
          >
            <Text style={[styles.clearButtonText, { color: theme.colors.textMuted, ...theme.typography.labelLarge }]}>×</Text>
          </Pressable>
        ) : null}

        {onFilterPress ? (
          <Pressable
            accessibilityLabel={filterLabel}
            accessibilityRole="button"
            onPress={onFilterPress}
            style={(state) => {
              const { focused: isFocused, hovered, pressed } = resolvePressableInteractionState(state);

              return [
                styles.filterButton,
                {
                  borderColor: isFocused ? theme.colors.focusRing : theme.colors.border,
                  backgroundColor: theme.colors.surfaceMuted,
                  opacity: pressed ? 0.84 : hovered ? 0.92 : 1,
                },
              ];
            }}
          >
            <Text style={[styles.filterButtonText, { color: theme.colors.textSecondary, ...theme.typography.labelMedium }]}>Filtros</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    marginTop: -1,
  },
  input: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  clearButtonText: {
    marginTop: -1,
  },
  filterButton: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  filterButtonText: {
    marginTop: -1,
  },
});
