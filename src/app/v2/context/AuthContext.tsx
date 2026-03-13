/**
 * AuthContext.tsx — Context d'authentification multi-user
 * Sprint F4 — Multi-User MVP
 *
 * Gere: user profile, memberships, tenant switching, JWT lifecycle.
 * Source unique de verite pour l'identite du user connecte.
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { api } from "../api/client";

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

export interface AuthUser {
  id: number;
  email: string;
  nom: string;
  avatar: string;
}

export interface Membership {
  id: number;
  user_id: number;
  tenant_id: number;
  role: string;          // admin / manager / membre / invite / bot
  department_scope: string[] | null;
  autonomy_override: string | null;
  is_primary: boolean;
  tenant_name: string;
  tenant_slug: string;
  tenant_type: string;
}

export interface AuthState {
  user: AuthUser | null;
  membership: Membership | null;       // Membership actif (tenant courant)
  memberships: Membership[];           // Tous les tenants du user
  isAuthenticated: boolean;
  isLoading: boolean;
  can: (capability: string) => boolean;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchTenant: (tenantId: number) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

type AuthContextType = AuthState & AuthActions;

// ═══════════════════════════════════════════
// Role hierarchy
// ═══════════════════════════════════════════

const ROLE_LEVEL: Record<string, number> = {
  admin: 5,
  manager: 4,
  membre: 3,
  invite: 2,
  bot: 1,
};

// Capability → minimum role
const CAPABILITY_ROLES: Record<string, string> = {
  "manage_users": "admin",
  "manage_tenant": "admin",
  "approve_actions": "manager",
  "create_chantier": "manager",
  "create_mission": "membre",
  "view_dashboard": "invite",
  "view_chantiers_internes": "membre",
  "view_chantiers_client": "invite",
  "configure_bots": "manager",
};

// ═══════════════════════════════════════════
// JWT helpers
// ═══════════════════════════════════════════

function getJwt(): string | null {
  try { return localStorage.getItem("ghostx-jwt"); } catch { return null; }
}
function setJwt(token: string) {
  try { localStorage.setItem("ghostx-jwt", token); } catch { /* noop */ }
}
function clearJwt() {
  try {
    localStorage.removeItem("ghostx-jwt");
    localStorage.removeItem("ghostx-jwt-refresh");
  } catch { /* noop */ }
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch { return null; }
}

// ═══════════════════════════════════════════
// Context
// ═══════════════════════════════════════════

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has a capability
  const can = useCallback((capability: string): boolean => {
    if (!membership) return false;
    const requiredRole = CAPABILITY_ROLES[capability];
    if (!requiredRole) return true; // Unknown capability = allow
    const userLevel = ROLE_LEVEL[membership.role] || 0;
    const requiredLevel = ROLE_LEVEL[requiredRole] || 0;
    return userLevel >= requiredLevel;
  }, [membership]);

  // Login
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (!res.ok) return false;
      const data = await res.json();

      if (data.access_token) {
        setJwt(data.access_token);
        try {
          if (data.refresh_token) localStorage.setItem("ghostx-jwt-refresh", data.refresh_token);
        } catch { /* noop */ }

        // Set auth state from login response
        setUser({
          id: data.user_id || 1,
          email: data.user || email,
          nom: data.nom || "",
          avatar: "",
        });

        const ms = (data.memberships || []) as Membership[];
        setMemberships(ms);

        // Find active membership (from JWT tenant_id or primary)
        const activeTenantId = data.tenant_id || 1;
        const active = ms.find(m => m.tenant_id === activeTenantId) || ms[0] || null;
        setMembership(active);
        setIsAuthenticated(true);

        // Persist auth marker
        try { localStorage.setItem("ghostx-auth", "authenticated"); } catch { /* noop */ }

        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    // Fire and forget logout API call
    try {
      const jwt = getJwt();
      if (jwt) {
        fetch("/api/v1/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`,
            "X-API-Key": import.meta.env.VITE_API_KEY || "",
          },
        }).catch(() => {});
      }
    } catch { /* noop */ }

    clearJwt();
    setUser(null);
    setMembership(null);
    setMemberships([]);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem("ghostx-auth");
    } catch { /* noop */ }
  }, []);

  // Switch tenant (Couche 2 — multi-org)
  const switchTenant = useCallback(async (tenantId: number): Promise<boolean> => {
    try {
      const res = await api.switchTenant(tenantId);
      if (res.access_token) {
        setJwt(res.access_token);
        if (res.refresh_token) {
          try { localStorage.setItem("ghostx-jwt-refresh", res.refresh_token); } catch { /* noop */ }
        }
        // Update active membership
        const active = memberships.find(m => m.tenant_id === tenantId) || null;
        setMembership(active);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [memberships]);

  // Refresh profile from /auth/me
  const refreshProfile = useCallback(async () => {
    try {
      const data = await api.getMe();
      if (data) {
        setUser({
          id: data.user_id,
          email: data.email || "",
          nom: data.nom || "",
          avatar: data.avatar || "",
        });
        if (data.memberships) {
          setMemberships(data.memberships);
          const activeTenantId = data.tenant_id || 1;
          const active = data.memberships.find((m: Membership) => m.tenant_id === activeTenantId) || data.memberships[0] || null;
          setMembership(active);
        }
      }
    } catch { /* noop */ }
  }, []);

  // On mount: check existing JWT
  useEffect(() => {
    const jwt = getJwt();
    if (jwt) {
      const payload = parseJwtPayload(jwt);
      if (payload) {
        const exp = payload.exp as number;
        if (exp && exp * 1000 > Date.now()) {
          // Token still valid — hydrate from payload
          setUser({
            id: (payload.user_id as number) || 1,
            email: (payload.sub as string) || "",
            nom: "",
            avatar: "",
          });
          setIsAuthenticated(true);
          // Fetch full profile in background
          refreshProfile().finally(() => setIsLoading(false));
          return;
        }
        // Token expired — try refresh
        const refreshToken = localStorage.getItem("ghostx-jwt-refresh");
        if (refreshToken) {
          fetch("/api/v1/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
              if (data?.access_token) {
                setJwt(data.access_token);
                setUser({
                  id: data.user_id || 1,
                  email: data.user || "",
                  nom: "",
                  avatar: "",
                });
                setIsAuthenticated(true);
                refreshProfile();
              } else {
                clearJwt();
                setIsAuthenticated(false);
                try { localStorage.removeItem("ghostx-auth"); } catch { /* noop */ }
              }
            })
            .catch(() => {
              clearJwt();
              setIsAuthenticated(false);
            })
            .finally(() => setIsLoading(false));
          return;
        }
      }
      // Invalid token
      clearJwt();
    }
    setIsAuthenticated(false);
    setIsLoading(false);
  }, [refreshProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        membership,
        memberships,
        isAuthenticated,
        isLoading,
        can,
        login,
        logout,
        switchTenant,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

/**
 * Helper: get current user ID (for API calls).
 * Falls back to 1 for compat.
 */
export function getCurrentUserId(): number {
  const jwt = getJwt();
  if (jwt) {
    const payload = parseJwtPayload(jwt);
    if (payload?.user_id) return payload.user_id as number;
  }
  return 1;
}

/**
 * Helper: get current tenant ID.
 * Falls back to 1 for compat.
 */
export function getCurrentTenantId(): number {
  const jwt = getJwt();
  if (jwt) {
    const payload = parseJwtPayload(jwt);
    if (payload?.tenant_id) return payload.tenant_id as number;
  }
  return 1;
}

/**
 * Helper: get current role.
 */
export function getCurrentRole(): string {
  const jwt = getJwt();
  if (jwt) {
    const payload = parseJwtPayload(jwt);
    if (payload?.role) return payload.role as string;
  }
  return "admin";
}
