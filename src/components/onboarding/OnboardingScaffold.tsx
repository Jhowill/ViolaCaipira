import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { AppButton, AppHeader, ScreenContainer } from "@/components/ui";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

interface OnboardingScaffoldProps {
  readonly children: ReactNode;
  readonly headerTitle?: string;
  readonly step?: number;
  readonly onBackPress?: () => void;
  readonly primaryLabel: string;
  readonly onPrimaryPress: () => void;
  readonly primaryDisabled?: boolean;
  readonly primaryLoading?: boolean;
  readonly secondaryLabel?: string;
  readonly onSecondaryPress?: () => void;
}

export function OnboardingScaffold({
  children,
  headerTitle,
  step,
  onBackPress,
  primaryLabel,
  onPrimaryPress,
  primaryDisabled,
  primaryLoading,
  secondaryLabel,
  onSecondaryPress,
}: OnboardingScaffoldProps) {
  const { theme } = useAppTheme();

  return (
    <ScreenContainer variant="scroll" maxWidth={620}>
      {headerTitle ? (
        <AppHeader title={headerTitle} centerTitle onBackPress={onBackPress} variant="compact" />
      ) : null}
      {step ? <OnboardingProgress step={step} /> : null}
      <View style={[styles.content, { marginTop: theme.spacing[5] }]}>{children}</View>
      <View style={[styles.actions, { gap: theme.spacing[2], paddingTop: theme.spacing[8] }]}>
        <AppButton
          accessibilityHint="Avança para a próxima etapa"
          disabled={primaryDisabled}
          fullWidth
          loading={primaryLoading}
          onPress={onPrimaryPress}
          size="lg"
        >
          {primaryLabel}
        </AppButton>
        {secondaryLabel && onSecondaryPress ? (
          <AppButton fullWidth onPress={onSecondaryPress} size="lg" variant="tertiary">
            {secondaryLabel}
          </AppButton>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
  },
  actions: {
    marginTop: "auto",
    width: "100%",
  },
});
