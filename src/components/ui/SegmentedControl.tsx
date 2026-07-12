import { useAppTheme } from "@/hooks/useAppTheme";
import type { SegmentedControlOption, SegmentedControlProps } from "@/types/ui";
import { useMemo } from "react";
import {
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
} from "react-native";

function resolvePressableInteractionState(state: PressableStateCallbackType) {
  const extendedState = state as PressableStateCallbackType & {
    readonly focused?: boolean;
    readonly hovered?: boolean;
  };

  return {
    pressed: state.pressed,
    focused: Boolean(extendedState.focused),
    hovered: Boolean(extendedState.hovered),
  };
}

function Segment<T extends string>({
  option,
  selected,
  onPress,
}: {
  readonly option: SegmentedControlOption<T>;
  readonly selected: boolean;
  readonly onPress: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={option.accessibilityLabel ?? option.label}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: option.disabled }}
      disabled={option.disabled}
      hitSlop={4}
      onPress={onPress}
      style={(state) => {
        const interactionState = resolvePressableInteractionState(state);

        return [
          styles.segment,
          {
            backgroundColor: selected ? theme.colors.primarySoft : "transparent",
            borderColor: selected ? theme.colors.primary : "transparent",
            borderWidth: theme.borderWidth,
            opacity: option.disabled ? 0.56 : 1,
          },
          interactionState.pressed && !selected
            ? {
                backgroundColor: theme.colors.surfaceRaised,
              }
            : null,
          interactionState.focused
            ? {
                outlineColor: theme.colors.focusRing,
                outlineStyle: "solid",
                outlineWidth: theme.borderWidth + 1,
              }
            : null,
        ];
      }}
    >
      <Text
        numberOfLines={1}
        style={[
          theme.typography.labelMedium,
          {
            color: selected ? theme.colors.primaryPressed : theme.colors.textSecondary,
            fontWeight: selected ? "700" : "600",
          },
        ]}
      >
        {option.label}
      </Text>
    </Pressable>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const { theme } = useAppTheme();
  const containerStyle = useMemo(
    () => [
      styles.root,
      {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: theme.borderWidth,
      },
    ],
    [theme],
  );

  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole="radiogroup" style={containerStyle}>
      {options.map((option, index) => (
        <View
          key={option.value}
          style={[
            styles.segmentWrapper,
            index > 0 && {
              marginLeft: 6,
            },
          ]}
        >
          <Segment
            option={option}
            selected={option.value === value}
            onPress={() => onValueChange(option.value)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 999,
    borderStyle: "solid",
    overflow: "hidden",
  },
  segmentWrapper: {
    flex: 1,
  },
  segment: {
    minHeight: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "solid",
    paddingHorizontal: 12,
  },
});
