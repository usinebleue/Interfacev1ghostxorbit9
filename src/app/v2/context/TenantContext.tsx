/**
 * TenantContext.tsx — Profil tenant enrichi (vertical, tier, mode perso/pro)
 * Fondation Architecture — Phase 6.2
 *
 * Complète AuthContext (qui gère JWT/memberships) avec les données
 * spécifiques au tenant: vertical, tier, mode, baptême, capabilities.
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { api } from "../api/client";
import type { ModePersoPro, TierAbonnement, TypeActeur, NiveauAcces } from "../api/types";
import { useAuth } from "./AuthContext";

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

export interface TenantProfile {
  vertical: string;
  niveau: NiveauAcces;
  type_acteur: TypeActeur;
  tier: TierAbonnement;
  mode: ModePersoPro;
  bot_custom_name: string | null;

  // Dérivés calculés
  bots_enabled: string[];
  can_orbit9: boolean;
  can_board_room: boolean;
  can_matching: boolean;
}

interface TenantContextType {
  profile: TenantProfile;
  mode: ModePersoPro;
  setMode: (m: ModePersoPro) => void;
  setNiveau: (n: NiveauAcces) => void;
  setTypeActeur: (t: TypeActeur) => void;
  isDieu: boolean;
  baptize: (name: string) => Promise<boolean>;
  isLoading: boolean;
}

// ═══════════════════════════════════════════
// Defaults
// ═══════════════════════════════════════════

const ALL_BOTS = ["CEOB", "CTOB", "CFOB", "CMOB", "CSOB", "COOB", "CPOB", "CHROB", "CINOB", "CROB", "CLOB", "CISOB"];

function deriveCapabilities(tier: TierAbonnement): Pick<TenantProfile, "bots_enabled" | "can_orbit9" | "can_board_room" | "can_matching"> {
  switch (tier) {
    case "free":
      return { bots_enabled: ["CEOB"], can_orbit9: false, can_board_room: false, can_matching: false };
    case "solo":
      return { bots_enabled: ["CEOB"], can_orbit9: true, can_board_room: false, can_matching: false };
    case "direction":
      return { bots_enabled: ALL_BOTS.slice(0, 6), can_orbit9: true, can_board_room: false, can_matching: true };
    case "csuite":
      return { bots_enabled: ALL_BOTS, can_orbit9: true, can_board_room: true, can_matching: true };
    case "pioneer":
      return { bots_enabled: ALL_BOTS, can_orbit9: true, can_board_room: true, can_matching: true };
    default:
      return { bots_enabled: ALL_BOTS, can_orbit9: true, can_board_room: true, can_matching: true };
  }
}

const DEFAULT_PROFILE: TenantProfile = {
  vertical: "manufacturier",
  niveau: "dieu",
  type_acteur: "MFG",
  tier: "pioneer",
  mode: "pro",
  bot_custom_name: null,
  ...deriveCapabilities("pioneer"),
};

// ═══════════════════════════════════════════
// Context
// ═══════════════════════════════════════════

const TenantContext = createContext<TenantContextType | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, membership } = useAuth();
  const [profile, setProfile] = useState<TenantProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(false);

  // Load tenant profile from subscription/current
  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);

    // Fetch subscription info
    api.getSubscriptionCurrent()
      .then((data: { tier?: { code: string }; status?: string }) => {
        if (data?.tier?.code) {
          const tierCode = data.tier.code as TierAbonnement;
          const caps = deriveCapabilities(tierCode);
          setProfile(prev => ({ ...prev, tier: tierCode, ...caps }));
        }
      })
      .catch(() => { /* keep defaults */ })
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, membership?.tenant_id]);

  // Mode perso/pro
  const mode = profile.mode;
  const isDieu = profile.niveau === "dieu";

  const setMode = useCallback((m: ModePersoPro) => {
    setProfile(prev => ({ ...prev, mode: m }));
    try { localStorage.setItem("ghostx-mode", m); } catch { /* noop */ }
    // Persist to backend (fire-and-forget)
    api.setUserMode(m).catch(() => {});
  }, []);

  const setNiveau = useCallback((n: NiveauAcces) => {
    const caps = deriveCapabilities(n === "dieu" || n === "coequipier" ? profile.tier : "solo");
    setProfile(prev => ({ ...prev, niveau: n, ...caps }));
    try { localStorage.setItem("ghostx-niveau", n); } catch { /* noop */ }
  }, [profile.tier]);

  const setTypeActeur = useCallback((t: TypeActeur) => {
    setProfile(prev => ({ ...prev, type_acteur: t }));
    try { localStorage.setItem("ghostx-type-acteur", t); } catch { /* noop */ }
  }, []);

  // Restore mode, niveau, type_acteur from localStorage on mount
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("ghostx-mode") as ModePersoPro | null;
      if (savedMode === "perso" || savedMode === "pro") {
        setProfile(prev => ({ ...prev, mode: savedMode }));
      }
      const savedNiveau = localStorage.getItem("ghostx-niveau") as NiveauAcces | null;
      if (savedNiveau && ["dieu", "coequipier", "operateur", "client"].includes(savedNiveau)) {
        setProfile(prev => ({ ...prev, niveau: savedNiveau }));
      }
      const savedType = localStorage.getItem("ghostx-type-acteur") as TypeActeur | null;
      if (savedType && ["MFG", "INT", "EXP", "FND", "DST", "ORG", "DEV", "OPS"].includes(savedType)) {
        setProfile(prev => ({ ...prev, type_acteur: savedType }));
      }
    } catch { /* noop */ }
  }, []);

  // Baptize
  const baptize = useCallback(async (name: string): Promise<boolean> => {
    try {
      await api.baptizeBot(name);
      setProfile(prev => ({ ...prev, bot_custom_name: name }));
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <TenantContext.Provider value={{ profile, mode, setMode, setNiveau, setTypeActeur, isDieu, baptize, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextType {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be inside TenantProvider");
  return ctx;
}
