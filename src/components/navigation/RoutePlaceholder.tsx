import { APP_ROUTES } from "@/constants/routes";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import type { AppCardVariant, ChipVariant } from "@/types/ui";
import {
  AppButton,
  AppCard,
  Chip,
  ScreenContainer,
  AppHeader,
} from "@/components/ui";
import { StyleSheet, View } from "react-native";
import type { ReactNode } from "react";
import { ActiveTuningPill } from "@/components/navigation/ActiveTuningPill";

export interface RoutePlaceholderChip {
  readonly label: string;
  readonly variant?: ChipVariant;
  readonly selected?: boolean;
}

export interface RoutePlaceholderProps {
  readonly eyebrow?: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly heroTitle: string;
  readonly heroDescription: string;
  readonly heroVariant?: AppCardVariant;
  readonly heroTag?: string;
  readonly activeTuningValue?: string;
  readonly activeTuningDetail?: string;
  readonly chips?: ReadonlyArray<RoutePlaceholderChip>;
  readonly primaryActionLabel?: string;
  readonly onPrimaryActionPress?: () => void;
  readonly secondaryActionLabel?: string;
  readonly onSecondaryActionPress?: () => void;
  readonly children?: ReactNode;
}

export function RoutePlaceholder({
  eyebrow,
  title,
  subtitle,
  heroTitle,
  heroDescription,
  heroVariant = "informative",
  heroTag,
  activeTuningValue,
  activeTuningDetail,
  chips,
  primaryActionLabel,
  onPrimaryActionPress,
  secondaryActionLabel,
  onSecondaryActionPress,
  children,
}: RoutePlaceholderProps) {
  const navigation = useSafeNavigation();

  return (
    <ScreenContainer scroll background="default">
      <AppHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        centerTitle
        onBackPress={() => navigation.safeBack(APP_ROUTES.home)}
      />

      {activeTuningValue ? (
        <View style={styles.section}>
          <ActiveTuningPill
            value={activeTuningValue}
            detail={activeTuningDetail}
            onPress={() => navigation.replace(APP_ROUTES.tunings)}
          />
        </View>
      ) : null}

      <AppCard
        variant={heroVariant}
        padding="lg"
        title={heroTitle}
        description={heroDescription}
      >
        <View style={styles.heroContent}>
          {heroTag ? (
            <Chip label={heroTag} variant="tag" />
          ) : null}

          <View style={styles.actions}>
            {primaryActionLabel ? (
              <AppButton
                fullWidth
                disabled={!onPrimaryActionPress}
                onPress={onPrimaryActionPress}
                variant="primary"
              >
                {primaryActionLabel}
              </AppButton>
            ) : null}
            {secondaryActionLabel ? (
              <AppButton
                fullWidth
                disabled={!onSecondaryActionPress}
                onPress={onSecondaryActionPress}
                variant="secondary"
              >
                {secondaryActionLabel}
              </AppButton>
            ) : null}
          </View>
        </View>
      </AppCard>

      {chips && chips.length > 0 ? (
        <View style={styles.chipRow}>
          {chips.map((chip) => (
            <Chip
              key={chip.label}
              label={chip.label}
              selected={chip.selected}
              variant={chip.variant ?? "filter"}
            />
          ))}
        </View>
      ) : null}

      {children ? <View style={styles.children}>{children}</View> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
  heroContent: {
    gap: 12,
  },
  actions: {
    gap: 10,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  children: {
    gap: 12,
    marginTop: 16,
  },
});
