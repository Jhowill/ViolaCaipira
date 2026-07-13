import { createContext } from "react";

import type { AudioSessionCoordinator } from "@/types/audio";

export const AudioSessionContext = createContext<AudioSessionCoordinator | undefined>(undefined);
