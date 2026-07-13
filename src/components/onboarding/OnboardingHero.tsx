import { useAppTheme } from "@/hooks/useAppTheme";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

export function ViolaHero() {
  const { theme } = useAppTheme();
  return (
    <View
      accessibilityLabel="Ilustração de uma viola caipira"
      accessibilityRole="image"
      style={[styles.hero, { backgroundColor: theme.colors.accentSoft, borderRadius: theme.radii.full }]}
    >
      <View style={[styles.neck, { backgroundColor: theme.colors.textPrimary }]} />
      <View style={[styles.head, { backgroundColor: theme.colors.textPrimary, borderRadius: theme.radii.sm }]} />
      <View style={[styles.body, { backgroundColor: theme.colors.accent, borderRadius: theme.radii.full }]}>
        <View style={[styles.soundHole, { borderColor: theme.colors.accentSoft, borderRadius: theme.radii.full }]} />
      </View>
      <View style={[styles.string, { backgroundColor: theme.colors.background }]} />
    </View>
  );
}

export function CircleSymbol({ children }: { readonly children: ReactNode }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.symbol, { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radii.full }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: 220,
    height: 220,
    alignSelf: "center",
    position: "relative",
    marginVertical: 18,
  },
  neck: {
    position: "absolute",
    width: 32,
    height: 122,
    left: 96,
    top: 18,
    transform: [{ rotate: "-8deg" }],
  },
  head: {
    position: "absolute",
    width: 56,
    height: 34,
    left: 77,
    top: 8,
    transform: [{ rotate: "-8deg" }],
  },
  body: {
    position: "absolute",
    width: 112,
    height: 132,
    left: 56,
    bottom: 3,
    transform: [{ rotate: "-5deg" }],
    alignItems: "center",
    justifyContent: "center",
  },
  soundHole: {
    width: 44,
    height: 44,
    borderWidth: 8,
  },
  string: {
    position: "absolute",
    width: 2,
    height: 172,
    left: 111,
    top: 24,
    transform: [{ rotate: "-8deg" }],
  },
  symbol: {
    width: 128,
    height: 128,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
});
