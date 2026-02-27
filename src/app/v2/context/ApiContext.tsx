/**
 * ApiContext.tsx — Provider du client API
 * Sprint A — Frame Master V2
 */

import { createContext, useContext } from "react";
import { api } from "../api/client";

type ApiClient = typeof api;

const ApiContext = createContext<ApiClient>(api);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiClient {
  return useContext(ApiContext);
}
