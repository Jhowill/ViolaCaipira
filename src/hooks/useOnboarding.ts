import { OnboardingContext } from "@/state/onboarding";
import { useContext } from "react";

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("useOnboarding deve ser usado dentro de OnboardingProvider.");
  }

  return context;
}
