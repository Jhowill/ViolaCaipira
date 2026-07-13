import { AppThemeProvider } from "@/theme/AppThemeProvider";
import { ToastProvider } from "@/state/toast";
import { AppBootstrapProvider } from "@/state/appBootstrap";
import { AppBootstrapGate } from "@/components/system/AppBootstrapGate";
import { AppErrorBoundary } from "@/components/system/AppErrorBoundary";
import { OnboardingGate } from "@/components/system/OnboardingGate";
import { OnboardingProvider } from "@/state/onboarding";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { ReactNode } from "react";

function Providers({ children }: { readonly children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <AppErrorBoundary>
            <AppBootstrapProvider>
              <AppBootstrapGate>
                <OnboardingProvider>
                  <OnboardingGate>
                    <ToastProvider>{children}</ToastProvider>
                  </OnboardingGate>
                </OnboardingProvider>
              </AppBootstrapGate>
            </AppBootstrapProvider>
          </AppErrorBoundary>
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <Providers>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="error/recovery" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
    </Providers>
  );
}
