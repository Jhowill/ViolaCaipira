import { createContext } from "react";
import type { ToastContextValue } from "@/state/toast/types";

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);
