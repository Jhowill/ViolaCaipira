import { APP_ROUTES } from "@/constants/routes";
import { usePathname, useRouter, useSegments } from "expo-router";
import { useCallback } from "react";
import type { Href } from "expo-router";
import type { SafeNavigation } from "@/types/navigation";

export function useSafeNavigation(): SafeNavigation {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();

  const safeBack = useCallback(
    (fallbackHref: Href = APP_ROUTES.home) => {
      if (router.canDismiss()) {
        router.dismiss();
        return;
      }

      if (router.canGoBack()) {
        router.back();
        return;
      }

      if (pathname !== fallbackHref) {
        router.replace(fallbackHref);
      }
    },
    [pathname, router],
  );

  const goHome = useCallback(() => {
    router.replace(APP_ROUTES.home);
  }, [router]);

  const isInTabsGroup = segments.includes("(tabs)");

  return {
    pathname,
    segments,
    isInTabsGroup,
    canGoBack: router.canGoBack(),
    canDismiss: router.canDismiss(),
    back: router.back,
    safeBack,
    goHome,
    push: router.push,
    replace: router.replace,
    navigate: router.navigate,
    dismiss: router.dismiss,
    dismissTo: router.dismissTo,
    dismissAll: router.dismissAll,
    reload: router.reload,
    prefetch: router.prefetch,
    setParams: router.setParams,
  };
}
