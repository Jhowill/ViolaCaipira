import { BottomSheet } from "@/components/ui/BottomSheet";
import { Dialog } from "@/components/ui/Dialog";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export interface SelectFieldOption<TValue extends string | number = string> {
  readonly value: TValue;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
  readonly icon?: ReactNode;
}

export interface SelectFieldProps<TValue extends string | number = string> {
  readonly label: string;
  readonly value: TValue | null | undefined;
  readonly options: readonly SelectFieldOption<TValue>[];
  readonly onValueChange: (value: TValue) => void;
  readonly placeholder?: string;
  readonly helperText?: string;
  readonly errorText?: string;
  readonly title?: string;
  readonly emptyLabel?: string;
  readonly disabled?: boolean;
  readonly containerStyle?: StyleProp<ViewStyle>;
}

const TABLET_BREAKPOINT = 720;

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

export function SelectField<TValue extends string | number = string>({
  label,
  value,
  options,
  onValueChange,
  placeholder = "Selecionar",
  helperText,
  errorText,
  title,
  emptyLabel = "Nenhuma opção disponível",
  disabled = false,
  containerStyle,
}: SelectFieldProps<TValue>) {
  const { theme } = useAppTheme();
  const [open, setOpen] = useState(false);

  const isTabletLayout = Dimensions.get("window").width >= TABLET_BREAKPOINT;
  const selectedOption = useMemo(() => options.find((option) => Object.is(option.value, value)) ?? null, [options, value]);

  const handleOpen = useCallback(() => {
    if (!disabled) {
      setOpen(true);
    }
  }, [disabled]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSelect = useCallback(
    (nextValue: TValue) => {
      onValueChange(nextValue);
      setOpen(false);
    },
    [onValueChange],
  );

  const borderColor = errorText ? theme.colors.danger : open ? theme.colors.focusRing : theme.colors.border;
  const displayValue = selectedOption?.label ?? placeholder;
  const isPlaceholder = selectedOption === null;
  const accessibilityHint = errorText ?? helperText ?? "Abre uma lista de opções";

  const optionList = (
    <View style={styles.optionList}>
      {options.length === 0 ? <Text style={[styles.emptyLabel, { color: theme.colors.textMuted, ...theme.typography.bodySmall }]}>{emptyLabel}</Text> : null}

      {options.map((option) => {
        const isSelected = selectedOption?.value === option.value;
        const isOptionDisabled = disabled || option.disabled;

        return (
          <Pressable
            key={String(option.value)}
            accessibilityLabel={option.label}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected, disabled: isOptionDisabled }}
            disabled={isOptionDisabled}
            onPress={() => handleSelect(option.value)}
            style={(state) => {
              const { focused, hovered, pressed } = resolvePressableInteractionState(state);

              return [
                styles.option,
                {
                  backgroundColor: isSelected ? theme.colors.primarySoft : theme.colors.surface,
                  borderColor: focused ? theme.colors.focusRing : isSelected ? theme.colors.primary : theme.colors.border,
                  opacity: isOptionDisabled ? 0.5 : pressed ? 0.76 : hovered ? 0.92 : 1,
                },
              ];
            }}
          >
            {option.icon ? <View style={styles.optionIcon}>{option.icon}</View> : null}

            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, { color: theme.colors.textPrimary, ...theme.typography.bodyLarge }]}>{option.label}</Text>
              {option.description ? <Text style={[styles.optionDescription, { color: theme.colors.textSecondary, ...theme.typography.bodySmall }]}>{option.description}</Text> : null}
            </View>

            {isSelected ? <Text style={[styles.optionCheck, { color: theme.colors.primary, ...theme.typography.labelLarge }]}>✓</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );

  const content = isTabletLayout ? (
    <Dialog visible={open} title={title ?? label} description={helperText} onClose={handleClose}>
      {optionList}
    </Dialog>
  ) : (
    <BottomSheet visible={open} title={title ?? label} subtitle={helperText} onClose={handleClose}>
      {optionList}
    </BottomSheet>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, { color: theme.colors.textSecondary, ...theme.typography.labelMedium }]}>{label}</Text>

      <Pressable
          accessibilityHint={accessibilityHint}
          accessibilityLabel={`${label}${selectedOption ? `, ${selectedOption.label}` : ""}`}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={handleOpen}
          style={(state) => {
            const { pressed, hovered } = resolvePressableInteractionState(state);

            return [
              styles.field,
              {
                minHeight: 56,
                borderColor,
                borderWidth: theme.borderWidth,
                backgroundColor: disabled ? theme.colors.surfaceMuted : theme.colors.surface,
                borderRadius: theme.radii.lg,
                paddingHorizontal: theme.spacing[4],
                opacity: disabled ? 0.7 : pressed ? 0.78 : hovered ? 0.92 : 1,
              },
            ];
          }}
        >
        <Text
          numberOfLines={1}
          style={[
            styles.value,
            {
              color: isPlaceholder ? theme.colors.textDisabled : theme.colors.textPrimary,
              ...theme.typography.bodyLarge,
            },
          ]}
        >
          {displayValue}
        </Text>

        <Text style={[styles.chevron, { color: theme.colors.textMuted, ...theme.typography.titleSmall }]}>⌄</Text>
      </Pressable>

      {helperText || errorText ? (
        <Text style={[styles.helper, { color: errorText ? theme.colors.danger : theme.colors.textSecondary, ...theme.typography.caption }]}>
          {errorText ?? helperText}
        </Text>
      ) : null}

      {content}
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
    justifyContent: "space-between",
    gap: 12,
  },
  value: {
    flex: 1,
    padding: 0,
    margin: 0,
  },
  chevron: {
    marginTop: -2,
  },
  helper: {
    marginLeft: 2,
  },
  optionList: {
    gap: 8,
  },
  emptyLabel: {
    textAlign: "center",
    paddingVertical: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    flexShrink: 1,
  },
  optionDescription: {
    flexShrink: 1,
  },
  optionCheck: {
    marginTop: -1,
  },
});
