import type { PropsWithChildren } from "react";

import { Redirect, usePathname } from "expo-router";

import { APP_ROUTE_GROUPS } from "@/constants/routes";
import { useAppBootstrap } from "@/hooks/useAppBootstrap";
import { BootstrapScreen } from "@/screens/system/BootstrapScreen";

const recoveryRoute = "/error/recovery";

export function AppBootstrapGate({ children }: PropsWithChildren) {
  const bootstrap = useAppBootstrap();
  const pathname = usePathname();
  const isRecoveryRoute = pathname === recoveryRoute;

  if (bootstrap.phase === "ready") {
    if (isRecoveryRoute) {
      return <Redirect href={APP_ROUTE_GROUPS.tabs} />;
    }

    return children;
  }

  if (bootstrap.phase === "recoverable_error" || bootstrap.phase === "fatal_error") {
    if (!isRecoveryRoute) {
      return <Redirect href={recoveryRoute} />;
    }

    return children;
  }

  return <BootstrapScreen phase={bootstrap.phase} />;
}
