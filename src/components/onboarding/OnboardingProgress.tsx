import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet, View } from "react-native";

export function OnboardingProgress({ step, total = 6 }: { readonly step: number; readonly total?: number }) {
  const { theme } = useAppTheme();

  return (
    <View
      accessibilityLabel={`Etapa ${step} de ${total}`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: total, now: step }}
      style={styles.root}
    >
      {Array.from({ length: total }, (_, index) => {
        const active = index + 1 === step;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              {
                width: active ? 40 : 10,
                borderRadius: theme.radii.full,
                backgroundColor: active ? theme.colors.primary : theme.colors.border,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  dot: {
    height: 10,
  },
});
