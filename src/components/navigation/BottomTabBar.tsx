import { MAIN_TABS } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { TabTrigger } from "expo-router/ui";
import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BottomTabButtonProps extends Omit<PressableProps, "children" | "style"> {
  readonly label: string;
  readonly icon: string;
  readonly isFocused?: boolean;
  readonly href?: string;
  readonly style?: StyleProp<ViewStyle>;
  readonly accessibilityLabel?: string;
}

function BottomTabButton({
  label,
  icon,
  isFocused = false,
  href,
  style,
  accessibilityLabel,
  ...pressableProps
}: BottomTabButtonProps) {
  const { theme } = useAppTheme();
  void href;

  return (
    <Pressable
      {...pressableProps}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      hitSlop={6}
      style={({ pressed }) => [
        styles.tabButton,
        style,
        {
          backgroundColor: isFocused ? theme.colors.primarySoft : "transparent",
          borderColor: isFocused ? theme.colors.primary : theme.colors.border,
          borderWidth: theme.borderWidth,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.tabContent}>
        <Text
          style={[
            theme.typography.titleSmall,
            { color: isFocused ? theme.colors.primary : theme.colors.textSecondary },
          ]}
        >
          {icon}
        </Text>
        <Text
          numberOfLines={1}
          style={[
            theme.typography.labelSmall,
            {
              color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
              marginTop: 4,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function BottomTabBar() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.outer,
        {
          paddingBottom: Math.max(insets.bottom, theme.spacing[3]),
          paddingHorizontal: theme.spacing[4],
          paddingTop: theme.spacing[2],
        },
      ]}
    >
      <View
        style={[
          styles.shell,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: theme.borderWidth,
          },
        ]}
      >
        {MAIN_TABS.map((item) => (
          <TabTrigger key={item.name} name={item.name} asChild resetOnFocus>
            <BottomTabButton
              accessibilityLabel={item.accessibilityLabel}
              icon={item.icon}
              label={item.label}
            />
          </TabTrigger>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: "100%",
  },
  shell: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    borderRadius: 28,
    padding: 6,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    minHeight: 62,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    overflow: "hidden",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
  },
});
