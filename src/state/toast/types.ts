import type { ReactNode } from "react";
import type { ToastVariant } from "@/components/ui/Toast";

export interface ToastRequest {
  readonly title: string;
  readonly description?: string;
  readonly actionLabel?: string;
  readonly onActionPress?: () => void;
  readonly icon?: ReactNode;
  readonly variant?: ToastVariant;
  readonly durationMs?: number;
}

export interface ToastItem extends ToastRequest {
  readonly id: string;
}

export interface ToastContextValue {
  readonly showToast: (toast: ToastRequest) => string;
  readonly dismissToast: (id?: string) => void;
  readonly clearToasts: () => void;
  readonly currentToast: ToastItem | null;
}
