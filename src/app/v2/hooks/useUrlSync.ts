/**
 * useUrlSync.ts — Synchronisation URL ↔ FrameMasterContext
 * Back/forward navigateur + deep links + refresh = état restauré
 * URLs = miroir de la structure DB (départements, chantiers, projets, missions, tâches)
 */

import { useEffect, useRef, useCallback } from "react";
import { useFrameMaster } from "../context/FrameMasterContext";
import type { ActiveView, ReseauSection, BureauSection } from "../context/FrameMasterContext";

// ── Bot codes valides ──
const VALID_BOT_CODES = new Set([
  "ceob", "ctob", "cfob", "cmob", "csob", "coob",
  "cpob", "chrob", "cinob", "crob", "clob", "cisob",
]);

// ── Dept tabs valides ──
const VALID_DEPT_TABS = new Set([
  "cockpit", "blueprint", "sante", "chantiers", "projets",
  "missions", "taches", "discussions", "documents", "agenda", "performance",
]);

// ── Map activeView → URL path ──
type ViewUrlMap = Record<string, string>;

const VIEW_TO_URL: ViewUrlMap = {
  // Accueil & global
  "cockpit": "/cockpit",
  "health": "/sante",
  "live-chat": "/chat",
  "diagnostic-ia": "/diagnostic",
  "mon-equipe": "/equipe",
  "agent-settings": "/agent-settings",
  "status": "/status",
  "onboarding": "/onboarding",
  // Salles
  "salles-hub": "/salles",
  "board-room": "/salles/board-room",
  "war-room": "/salles/war-room",
  "think-room": "/salles/think-room",
  // Bibles
  "bible-visuelle": "/bible/visuelle",
  "bible-visuelle-cible": "/bible/visuelle-cible",
  "bible-technique": "/bible/technique",
  "bible-ghml": "/bible/ghml",
  "bible-officielle": "/bible/officielle",
  // Bureau
  "espace-bureau": "/bureau",
};

// ── Map master-* views → /reference/{nom} ──
const MASTER_PREFIX = "master-";
const masterViewToRef = (view: string): string | null => {
  if (view.startsWith(MASTER_PREFIX)) {
    return `/reference/${view.slice(MASTER_PREFIX.length)}`;
  }
  return null;
};

// ── Réseau sections ──
const VALID_RESEAU_SECTIONS = new Set<ReseauSection>([
  "profil", "cellules", "jumelage", "chantiers", "pionniers",
  "gouvernance", "dashboard", "nouvelles", "evenements", "industrie",
]);

// ── Bureau sections ──
const VALID_BUREAU_SECTIONS = new Set<BureauSection>([
  "blueprint-perso", "taches", "documents", "agenda",
  "discussions", "notifications", "claude-code",
]);

// ── Reverse maps (URL → state) ──
const URL_TO_VIEW: Record<string, ActiveView> = {};
for (const [view, url] of Object.entries(VIEW_TO_URL)) {
  URL_TO_VIEW[url] = view as ActiveView;
}

/**
 * Dérive l'URL depuis l'état du contexte
 */
function stateToUrl(
  activeView: ActiveView,
  activeBotCode: string,
  activeDeptTab: string,
  activeReseauSection: string,
  activeBureauSection: string,
  activeAdminTab?: string,
): string {
  // Admin (God Mode)
  if (activeView === "admin") {
    if (activeAdminTab && activeAdminTab !== "dashboard") {
      return `/admin/${activeAdminTab}`;
    }
    return "/admin";
  }

  // Reglages (Instance Admin)
  if (activeView === "reglages") {
    if (activeAdminTab && activeAdminTab !== "dashboard") {
      return `/reglages/${activeAdminTab}`;
    }
    return "/reglages";
  }

  // Département
  if (activeView === "department" || activeView === "mon-entreprise") {
    const code = activeBotCode.toLowerCase();
    if (activeDeptTab && activeDeptTab !== "cockpit") {
      return `/departement/${code}/${activeDeptTab}`;
    }
    return `/departement/${code}`;
  }

  // Réseau
  if (activeView === "mon-reseau") {
    if (activeReseauSection && activeReseauSection !== "profil") {
      return `/reseau/${activeReseauSection}`;
    }
    return "/reseau";
  }

  // Bureau
  if (activeView === "espace-bureau") {
    if (activeBureauSection && activeBureauSection !== "taches") {
      return `/bureau/${activeBureauSection}`;
    }
    return "/bureau";
  }

  // Master/Reference pages
  const refUrl = masterViewToRef(activeView);
  if (refUrl) return refUrl;

  // Direct mapping
  const url = VIEW_TO_URL[activeView];
  if (url) return url;

  // Default = département CEOB
  return "/";
}

/**
 * Parse URL → appelle les navigate du contexte
 */
function urlToState(
  pathname: string,
  ctx: {
    navigateToDepartment: (code: string, view?: ActiveView) => void;
    navigateDeptTab: (tab: string) => void;
    setActiveView: (v: ActiveView) => void;
    navigateReseau: (s: ReseauSection) => void;
    navigateBureau: (s: BureauSection) => void;
    setActiveBotCode: (code: string) => void;
    navigateAdminTab: (tab: string) => void;
    navigateReglagesTab: (tab: string) => void;
  },
): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  const segments = path.split("/").filter(Boolean);

  // ── / (racine) → département CEOB cockpit ──
  if (segments.length === 0) {
    ctx.navigateToDepartment("CEOB", "department");
    ctx.navigateDeptTab("cockpit");
    return true;
  }

  const first = segments[0];

  // ── /departement/{code}/{tab?} ──
  if (first === "departement" && segments.length >= 2) {
    const code = segments[1].toLowerCase();
    if (VALID_BOT_CODES.has(code)) {
      const botCode = code.toUpperCase();
      const tab = segments[2] || "cockpit";
      if (VALID_DEPT_TABS.has(tab)) {
        ctx.navigateToDepartment(botCode, "department");
        ctx.navigateDeptTab(tab);
        return true;
      }
    }
    return false;
  }

  // ── /reseau/{section?} ──
  if (first === "reseau") {
    const section = (segments[1] || "profil") as ReseauSection;
    if (VALID_RESEAU_SECTIONS.has(section)) {
      ctx.navigateReseau(section);
      return true;
    }
    return false;
  }

  // ── /bureau/{section?} ──
  if (first === "bureau") {
    const section = (segments[1] || "taches") as BureauSection;
    if (VALID_BUREAU_SECTIONS.has(section)) {
      ctx.navigateBureau(section);
      return true;
    }
    return false;
  }

  // ── /admin/{tab?} ──
  if (first === "admin") {
    const tab = segments[1] || "dashboard";
    ctx.navigateAdminTab(tab);
    return true;
  }

  // ── /reglages/{tab?} ──
  if (first === "reglages") {
    const tab = segments[1] || "dashboard";
    ctx.navigateReglagesTab(tab);
    return true;
  }

  // ── /salles/{room?} ──
  if (first === "salles") {
    const room = segments[1];
    if (!room) {
      ctx.setActiveView("salles-hub");
      return true;
    }
    const roomMap: Record<string, ActiveView> = {
      "board-room": "board-room",
      "war-room": "war-room",
      "think-room": "think-room",
    };
    if (roomMap[room]) {
      ctx.setActiveView(roomMap[room]);
      return true;
    }
    return false;
  }

  // ── /reference/{nom} ──
  if (first === "reference" && segments[1]) {
    const viewName = `master-${segments[1]}` as ActiveView;
    ctx.setActiveView(viewName);
    return true;
  }

  // ── /bible/{nom} ──
  if (first === "bible" && segments[1]) {
    const bibleMap: Record<string, ActiveView> = {
      "visuelle": "bible-visuelle",
      "visuelle-cible": "bible-visuelle-cible",
      "technique": "bible-technique",
      "ghml": "bible-ghml",
      "officielle": "bible-officielle",
    };
    if (bibleMap[segments[1]]) {
      ctx.setActiveView(bibleMap[segments[1]]);
      return true;
    }
    return false;
  }

  // ── /meeting/{slug} — handled by AppV2.tsx, skip ──
  if (first === "meeting") {
    return false;
  }

  // ── Direct URL → view mapping ──
  const directView = URL_TO_VIEW[path];
  if (directView) {
    ctx.setActiveView(directView);
    return true;
  }

  // ── Fallback: département CEOB ──
  ctx.navigateToDepartment("CEOB", "department");
  ctx.navigateDeptTab("cockpit");
  return true;
}

/**
 * Hook principal — synchronise URL ↔ contexte
 * 3 effets: mount (URL→state), state change (state→URL), popstate (back/forward)
 */
export function useUrlSync() {
  const ctx = useFrameMaster();
  const {
    activeView,
    activeBotCode,
    activeDeptTab,
    activeReseauSection,
    activeBureauSection,
    activeAdminTab,
    navigateToDepartment,
    navigateDeptTab,
    setActiveView,
    navigateReseau,
    navigateBureau,
    setActiveBotCode,
    navigateAdminTab,
    navigateReglagesTab,
  } = ctx;

  // Anti-boucle: quand on restaure depuis URL, skip le pushState
  const suppressPush = useRef(false);
  const isInitialMount = useRef(true);
  const lastPushedUrl = useRef("");

  const navCtx = {
    navigateToDepartment,
    navigateDeptTab,
    setActiveView,
    navigateReseau,
    navigateBureau,
    setActiveBotCode,
    navigateAdminTab,
    navigateReglagesTab,
  };

  // Stable ref for navCtx to avoid effect re-runs
  const navCtxRef = useRef(navCtx);
  navCtxRef.current = navCtx;

  // ── Effet 1: Mount — lire URL initiale → restaurer état ──
  useEffect(() => {
    const path = window.location.pathname;
    // Skip si on est sur / (état par défaut déjà bon)
    if (path === "/" || path === "") {
      isInitialMount.current = false;
      return;
    }
    // Skip /meeting (handled by AppV2)
    if (path.startsWith("/meeting/")) {
      isInitialMount.current = false;
      return;
    }
    suppressPush.current = true;
    urlToState(path, navCtxRef.current);
    // Petit délai pour que le state se propage avant de réactiver le push
    requestAnimationFrame(() => {
      suppressPush.current = false;
      isInitialMount.current = false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mount only

  // ── Effet 2: State change → pushState ──
  useEffect(() => {
    if (isInitialMount.current) return;
    if (suppressPush.current) return;

    const url = stateToUrl(
      activeView,
      activeBotCode,
      activeDeptTab,
      activeReseauSection,
      activeBureauSection,
      activeAdminTab,
    );

    // Skip si même URL
    if (url === lastPushedUrl.current) return;
    // Skip si déjà la bonne URL dans le navigateur
    if (url === window.location.pathname) {
      lastPushedUrl.current = url;
      return;
    }

    lastPushedUrl.current = url;
    window.history.pushState({ ghostx: true }, "", url);
  }, [activeView, activeBotCode, activeDeptTab, activeReseauSection, activeBureauSection, activeAdminTab]);

  // ── Effet 3: Popstate — back/forward navigateur ──
  const handlePopstate = useCallback(() => {
    suppressPush.current = true;
    const path = window.location.pathname;
    urlToState(path, navCtxRef.current);
    lastPushedUrl.current = path;
    requestAnimationFrame(() => {
      suppressPush.current = false;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, [handlePopstate]);
}
