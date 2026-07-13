import { ErrorState, LoadingState, ScreenContainer } from "@/components/ui";
import { APP_ROUTES } from "@/constants/routes";
import { useOnboarding } from "@/hooks/useOnboarding";
import type { OnboardingStep } from "@/repositories/onboardingRepository";
import { Redirect, usePathname } from "expo-router";
import type { PropsWithChildren } from "react";

const routeByStep: Record<OnboardingStep, (typeof APP_ROUTES)[keyof Pick<typeof APP_ROUTES,
  | "onboardingWelcome"
  | "onboardingExperience"
  | "onboardingTuning"
  | "onboardingDiagram"
  | "onboardingHandedness"
  | "onboardingMicrophone"
  | "onboardingSummary"
>]> = {
  welcome: APP_ROUTES.onboardingWelcome,
  experience: APP_ROUTES.onboardingExperience,
  tuning: APP_ROUTES.onboardingTuning,
  diagram: APP_ROUTES.onboardingDiagram,
  handedness: APP_ROUTES.onboardingHandedness,
  microphone: APP_ROUTES.onboardingMicrophone,
  summary: APP_ROUTES.onboardingSummary,
};

export function OnboardingGate({ children }: PropsWithChildren) {
  const onboarding = useOnboarding();
  const pathname = usePathname();
  const isOnboardingRoute = pathname.startsWith("/onboarding");

  if (onboarding.phase === "error") {
    return (
      <ScreenContainer variant="centered">
        <ErrorState
          title="Não foi possível salvar suas escolhas"
          description="O banco local continua protegido. Tente carregar novamente."
          details={onboarding.error?.message}
          actionLabel="Tentar novamente"
          onActionPress={() => void onboarding.retry()}
        />
      </ScreenContainer>
    );
  }

  if (onboarding.phase === "loading" || !onboarding.snapshot) {
    return (
      <ScreenContainer variant="centered">
        <LoadingState title="Preparando seu espaço" description="Carregando preferências locais…" />
      </ScreenContainer>
    );
  }

  const isCompleted = onboarding.snapshot.profile.onboardingStatus === "completed";

  if (isCompleted && isOnboardingRoute) {
    return <Redirect href={APP_ROUTES.home} />;
  }

  if (!isCompleted && !isOnboardingRoute) {
    const step = onboarding.snapshot.profile.onboardingStep;
    const destination = step && step in routeByStep
      ? routeByStep[step as OnboardingStep]
      : APP_ROUTES.onboardingWelcome;
    return <Redirect href={destination} />;
  }

  return children;
}
