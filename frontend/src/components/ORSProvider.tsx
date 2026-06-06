import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import { ORS_ENV } from "../env";
import Openrouteservice from "../openrouteservice-api";

const ORSContext = createContext<Openrouteservice | null>(null);

export function ORSProvider({ children }: PropsWithChildren) {
  const client = useMemo(() => {
    return new Openrouteservice(ORS_ENV.host, ORS_ENV.apiKey);
  }, []);

  return <ORSContext.Provider value={client}>{children}</ORSContext.Provider>;
}

export function useORS(): Openrouteservice {
  const ctx = useContext(ORSContext);

  if (!ctx) {
    throw new Error("useORS must be used within ORSProvider");
  }

  return ctx;
}
