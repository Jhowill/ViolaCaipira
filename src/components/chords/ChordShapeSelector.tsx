import { Chip } from "@/components/ui";
import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet, Text, View } from "react-native";

export interface ChordShapeSelectorOption<TValue extends string> {
  readonly label: string;
  readonly value: TValue;
  readonly selected?: boolean;
  readonly disabled?: boolean;
  readonly accessibilityLabel?: string;
}

export interface ChordShapeSelectorSection<TValue extends string> {
  readonly title: string;
  readonly options: readonly ChordShapeSelectorOption<TValue>[];
  readonly onChange: (value: TValue) => void;
  readonly accessibilityLabel?: string;
}

export interface ChordShapeSelectorProps {
  readonly sections: readonly ChordShapeSelectorSection<string>[];
  readonly compact?: boolean;
  readonly accessibilityLabel?: string;
}

export function ChordShapeSelector({
  sections,
  compact = false,
  accessibilityLabel,
}: ChordShapeSelectorProps) {
  const { theme } = useAppTheme();

  return (
    <View accessibilityLabel={accessibilityLabel} style={styles.root}>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[theme.typography.headlineSmall, { color: theme.colors.textPrimary }]}>
            {section.title}
          </Text>

          <View style={styles.optionsRow}>
            {section.options.map((option) => (
              <Chip
                key={option.value}
                accessibilityLabel={option.accessibilityLabel ?? option.label}
                disabled={option.disabled}
                label={option.label}
                onPress={option.disabled ? undefined : () => section.onChange(option.value)}
                selected={option.selected}
                size={compact ? "sm" : "md"}
                variant="selection"
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    gap: 18,
  },
  section: {
    gap: 12,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
