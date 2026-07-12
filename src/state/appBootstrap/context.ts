import { createContext } from "react";

import type { AppBootstrapContextValue } from "@/types/bootstrap";

export const AppBootstrapContext = createContext<AppBootstrapContextValue | undefined>(undefined);
