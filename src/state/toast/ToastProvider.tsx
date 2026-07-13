import { Toast } from "@/components/ui/Toast";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ToastContext } from "@/state/toast/context";
import type { ToastItem, ToastRequest } from "@/state/toast/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

export interface ToastProviderProps extends PropsWithChildren {
  readonly defaultDurationMs?: number;
}

export function ToastProvider({ children, defaultDurationMs = 3000 }: ToastProviderProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const nextIdRef = useRef(1);
  const [queue, setQueue] = useState<ToastItem[]>([]);

  const currentToast = queue[0] ?? null;

  const showToast = useCallback(
    (toast: ToastRequest) => {
      const id = `toast-${nextIdRef.current++}`;
      setQueue((current) => [...current, { ...toast, id }]);
      return id;
    },
    [],
  );

  const dismissToast = useCallback((id?: string) => {
    setQueue((current) => {
      if (current.length === 0) {
        return current;
      }

      if (id === undefined) {
        return current.slice(1);
      }

      return current.filter((item) => item.id !== id);
    });
  }, []);

  const clearToasts = useCallback(() => {
    setQueue([]);
  }, []);

  useEffect(() => {
    if (currentToast === null) {
      return undefined;
    }

    const durationMs = currentToast.durationMs ?? defaultDurationMs;

    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      dismissToast(currentToast.id);
    }, durationMs);

    return () => clearTimeout(timeout);
  }, [currentToast, defaultDurationMs, dismissToast]);

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
      clearToasts,
      currentToast,
    }),
    [clearToasts, currentToast, dismissToast, showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {currentToast ? (
        <View
          style={[
            styles.viewport,
            {
              paddingHorizontal: theme.spacing[4],
              paddingBottom: insets.bottom + theme.spacing[4],
            },
          ]}
        >
          <View style={styles.toastShell}>
            <Toast
              actionLabel={currentToast.actionLabel}
              description={currentToast.description}
              icon={currentToast.icon}
              onActionPress={
                currentToast.onActionPress
                  ? () => {
                      currentToast.onActionPress?.();
                      dismissToast(currentToast.id);
                    }
                  : undefined
              }
              onDismiss={() => dismissToast(currentToast.id)}
              title={currentToast.title}
              variant={currentToast.variant}
              visible
            />
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  viewport: {
    pointerEvents: "box-none",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  toastShell: {
    width: "100%",
    maxWidth: 560,
  },
});
