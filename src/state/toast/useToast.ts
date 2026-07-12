import { useContext } from "react";
import { ToastContext } from "@/state/toast/context";

export function useToast() {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast deve ser usado dentro de ToastProvider.");
  }

  return context;
}
