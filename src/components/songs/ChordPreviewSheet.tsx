import { AppButton, AppCard, BottomSheet } from "@/components/ui";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { ChipVariant } from "@/types/ui";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export interface ChordPreviewMetric {
  readonly label: string;
  readonly value: string;
  readonly variant?: ChipVariant;
}

export interface ChordPreviewSheetProps {
  readonly visible: boolean;
  readonly title: string;
  readonly subtitle?: string;
  readonly metrics?: readonly ChordPreviewMetric[];
  readonly note?: string;
  readonly children: ReactNode;
  readonly confirmLabel?: string;
  readonly secondaryLabel?: string;
  readonly confirmDisabled?: boolean;
  readonly secondaryDisabled?: boolean;
  readonly onConfirm: () => void;
  readonly onSecondaryPress?: () => void;
  readonly onClose: () => void;
}

export function ChordPreviewSheet({
  visible,
  title,
  subtitle,
  metrics = [],
  note,
  children,
  confirmLabel = "Salvar rascunho",
  secondaryLabel,
  confirmDisabled = false,
  secondaryDisabled = false,
  onConfirm,
  onSecondaryPress,
  onClose,
}: ChordPreviewSheetProps) {
  const { theme } = useAppTheme();

  return (
    <BottomSheet onClose={onClose} subtitle={subtitle} title={title} visible={visible}>
      <View style={styles.content}>
        {metrics.length > 0 ? (
          <AppCard variant="informative" padding="md">
            <View style={styles.metrics}>
              {metrics.map((metric, index) => (
                <View key={`${metric.label}-${index}`} style={[styles.metricRow, index > 0 ? styles.metricDivider : null]}>
                  <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary }]}>{metric.label}</Text>
                  <Text
                    style={[
                      theme.typography.labelLarge,
                      {
                        color: metric.variant === "note" ? theme.colors.accent : metric.variant === "status" ? theme.colors.textPrimary : theme.colors.primaryPressed,
                      },
                    ]}
                  >
                    {metric.value}
                  </Text>
                </View>
              ))}
            </View>
          </AppCard>
        ) : null}

        <View style={styles.previewBlock}>{children}</View>

        {note ? (
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, textAlign: "center" }]}>{note}</Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        {secondaryLabel && onSecondaryPress ? (
          <AppButton
            accessibilityLabel={secondaryLabel}
            disabled={secondaryDisabled}
            fullWidth
            onPress={onSecondaryPress}
            variant="secondary"
          >
            {secondaryLabel}
          </AppButton>
        ) : null}

        <AppButton
          accessibilityLabel={confirmLabel}
          disabled={confirmDisabled}
          fullWidth
          onPress={onConfirm}
          variant="primary"
        >
          {confirmLabel}
        </AppButton>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  previewBlock: {
    gap: 12,
  },
  metrics: {
    gap: 0,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
  },
  metricDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  footer: {
    gap: 10,
    paddingTop: 4,
  },
});
