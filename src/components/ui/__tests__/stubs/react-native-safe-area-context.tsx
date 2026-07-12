import React, { type PropsWithChildren } from "react";

export function SafeAreaView({ children, ...props }: PropsWithChildren<Record<string, unknown>>) {
  return React.createElement("SafeAreaView", props, children);
}

export function SafeAreaProvider({ children }: PropsWithChildren<Record<string, unknown>>) {
  return React.createElement("SafeAreaProvider", null, children);
}

export function useSafeAreaInsets() {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
}
