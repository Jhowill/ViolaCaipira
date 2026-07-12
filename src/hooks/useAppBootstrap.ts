import { useContext } from "react";

import { AppBootstrapContext } from "@/state/appBootstrap/context";

export function useAppBootstrap() {
  const context = useContext(AppBootstrapContext);

  if (!context) {
    throw new Error("useAppBootstrap must be used inside AppBootstrapProvider.");
  }

  return context;
}
