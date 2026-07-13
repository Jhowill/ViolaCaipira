import type {
  OnboardingDraft,
  OnboardingSnapshot,
  OnboardingStep,
} from "@/repositories/onboardingRepository";
import { createContext } from "react";

export interface OnboardingContextValue {
  readonly phase: "loading" | "ready" | "error";
  readonly snapshot: OnboardingSnapshot | null;
  readonly error: Error | null;
  readonly saveStep: (
    updates: Partial<OnboardingDraft>,
    nextStep: OnboardingStep,
  ) => Promise<void>;
  readonly complete: () => Promise<void>;
  readonly retry: () => Promise<void>;
}

export const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);
