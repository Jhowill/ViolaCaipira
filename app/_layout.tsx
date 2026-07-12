import { AppThemeProvider } from "@/theme/AppThemeProvider";
import { ToastProvider } from "@/state/toast";
import { AppBootstrapProvider } from "@/state/appBootstrap";
import { AppBootstrapGate } from "@/components/system/AppBootstrapGate";
import { AppErrorBoundary } from "@/components/system/AppErrorBoundary";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { ReactNode } from "react";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function Providers({ children }: { readonly children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <AppErrorBoundary>
            <AppBootstrapProvider>
              <AppBootstrapGate>
                <ToastProvider>{children}</ToastProvider>
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
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
    </Providers>
  );
}
