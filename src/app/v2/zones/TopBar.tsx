/**
 * TopBar.tsx — 3 barres superieures pour le layout 3 zones
 * COCKPIT (gauche) = Instance selector + User Profile
 * CHAT (centre) = label discussion
 * CONTENT (droite) = 4 nav buttons centres
 * Session 70 — Layout 3 Zones (fix vocal Carl 12h07)
 */

import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Users,
  Check,
  LogOut,
  User,
  Settings,
  SlidersHorizontal,
  HelpCircle,
  CreditCard,
  BookOpen,
  DoorOpen,
  Network,
  Map,
  Play,
  MessageSquare,
  Layers,
  Code2,
  Route,
  Briefcase,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "../../components/ui/dropdown-menu";
import { useFrameMaster } from "../context/FrameMasterContext";
import type { ActiveView } from "../context/FrameMasterContext";
import { api } from "../api/client";
import type { KitInfo, KitUserProfile } from "../api/types";

const UB_BLUE = "#073E5A";

const KIT_BRAND: Record<string, { color: string; initials: string }> = {
  "couche-tard":        { color: "#E4002B", initials: "CT" },
  "saputo":             { color: "#003DA5", initials: "SA" },
  "wsp-global":         { color: "#FF6900", initials: "WS" },
  "usine-bleue":        { color: "#073E5A", initials: "UB" },
  "alimentation-boreal":{ color: "#2D7D46", initials: "AB" },
  "derlea":             { color: "#8B6914", initials: "DL" },
  "pharmatech":         { color: "#7C3AED", initials: "PT" },
  "precision-qc":       { color: "#475569", initials: "PQ" },
  "plastipro":          { color: "#0891B2", initials: "PP" },
  "acier-plus":         { color: "#374151", initials: "A+" },
  "boisnoble":          { color: "#92400E", initials: "BN" },
  "boucher-alim":       { color: "#DC2626", initials: "BA" },
  "premier-tech":       { color: "#00843D", initials: "PT" },
  "consignaction":      { color: "#0077C8", initials: "CQ" },
  "fonds-ftq":          { color: "#003B71", initials: "FQ" },
  "investissement-quebec": { color: "#00529B", initials: "IQ" },
};

function getKitBrand(slug: string) {
  return KIT_BRAND[slug] || { color: "#6B7280", initials: slug.slice(0, 2).toUpperCase() };
}

// ═══════════════════════════════════════
// COCKPIT TOP — Instance + User Profile (panel gauche)
// Remplace l'ancien logo Usine Bleue
// ═══════════════════════════════════════

export function TopBarCockpit({ collapsed = false }: { collapsed?: boolean }) {
  const { setActiveView, currentUser, setAuthenticated } = useFrameMaster();

  const [kits, setKits] = useState<KitInfo[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const [userProfile, setUserProfile] = useState<KitUserProfile | null>(null);

  const loadKits = useCallback(async () => {
    try {
      const data = await api.getActiveKit();
      setKits(data.kits_info || []);
      setActiveSlug(data.kit);
      setUserProfile(data.user_profile || null);
    } catch { /* silently fail */ }
  }, []);

  useEffect(() => { loadKits(); }, [loadKits]);

  const handleSwitch = async (slug: string) => {
    if (slug === activeSlug || switching) return;
    setSwitching(true);
    try {
      await api.setKit(slug);
      setActiveSlug(slug);
      window.location.reload();
    } catch { /* silently fail */ }
    finally { setSwitching(false); }
  };

  const activeKit = kits.find(k => k.slug === activeSlug);
  const activeBrand = activeSlug ? getKitBrand(activeSlug) : null;
  const realKits = kits.filter(k => !k.slug.startsWith("test"));
  const bigSlugs = ["couche-tard", "saputo", "wsp-global", "usine-bleue", "premier-tech", "consignaction", "fonds-ftq", "investissement-quebec"];
  const bigKits = realKits.filter(k => bigSlugs.includes(k.slug));
  const otherKits = realKits.filter(k => !bigSlugs.includes(k.slug));
  const displayName = userProfile?.nom || currentUser;
  const displayPhoto = userProfile?.photo || "/agents/carl-fugere.jpg";

  // Collapsed — user avatar + instance icon stacked
  if (collapsed) {
    return (
      <div className="h-12 flex items-center justify-center gap-1.5 px-1 shrink-0" style={{ backgroundColor: UB_BLUE }}>
        <img src={displayPhoto} alt={displayName} className="w-6 h-6 rounded-full object-cover ring-1 ring-white/30" />
        {activeBrand && (
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white shrink-0"
            style={{ backgroundColor: activeBrand.color }}
          >
            {activeBrand.initials}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-12 flex items-center gap-2 px-3 shrink-0" style={{ backgroundColor: UB_BLUE }}>
      {/* GAUCHE — User Profile (MOI) avec nom complet */}
      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 gap-1.5 px-1.5 text-white/80 hover:text-white hover:bg-white/10 inline-flex items-center rounded-md text-sm outline-none">
          <div className="relative">
            <img src={displayPhoto} alt={displayName} className="w-7 h-7 rounded-full object-cover ring-1 ring-white/30" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#073E5A]" />
          </div>
          <span className="text-[11px] text-white/80 max-w-[110px] truncate">{displayName}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Mon compte</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setActiveView("espace-bureau")} className="flex items-center gap-2 cursor-pointer">
            <User className="h-3.5 w-3.5" />
            Mon Profil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveView("agent-settings")} className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-3.5 w-3.5" />
            Reglages Generaux
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveView("agent-settings")} className="flex items-center gap-2 cursor-pointer">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Reglages Agents AI
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setActiveView("bible-officielle")} className="flex items-center gap-2 cursor-pointer">
            <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
            Bible & Reference
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-muted-foreground">
            <HelpCircle className="h-3.5 w-3.5" />
            FAQ
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5" />
            Abonnement
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
              <Layers className="h-3.5 w-3.5 text-violet-600" />
              Master GHML
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-52">
              <DropdownMenuItem onClick={() => setActiveView("bible-officielle")} className="flex items-center gap-2 cursor-pointer">
                <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                FE — Frontend (12 pages)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveView("bible-technique")} className="flex items-center gap-2 cursor-pointer">
                <Code2 className="h-3.5 w-3.5 text-violet-600" />
                BE — Backend (10 pages)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveView("master-roadmap")} className="flex items-center gap-2 cursor-pointer">
                <Route className="h-3.5 w-3.5 text-emerald-600" />
                RD — Roadmap Dev (8 pages)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveView("master-strategie")} className="flex items-center gap-2 cursor-pointer">
                <Briefcase className="h-3.5 w-3.5 text-amber-600" />
                SA — Strategies Affaires (8 pages)
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setActiveView("scenarios")} className="flex items-center gap-2 cursor-pointer">
            <Map className="h-3.5 w-3.5 text-emerald-600" />
            Tour Guide
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveView("scenarios")} className="flex items-center gap-2 cursor-pointer text-muted-foreground">
            <Play className="h-3.5 w-3.5" />
            Scenarios de simulation
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setAuthenticated(false)} className="flex items-center gap-2 cursor-pointer text-red-600">
            <LogOut className="h-3.5 w-3.5" />
            Se deconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1" />

      {/* DROITE — Instance corporative (client) */}
      <DropdownMenu onOpenChange={(open) => { if (open) loadKits(); }}>
        <DropdownMenuTrigger className="h-8 gap-2 px-1.5 text-white/70 hover:text-white hover:bg-white/10 inline-flex items-center rounded-md text-sm outline-none">
          {activeBrand ? (
            <div
              className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white shrink-0"
              style={{ backgroundColor: activeBrand.color }}
            >
              {activeBrand.initials}
            </div>
          ) : (
            <Building2 className="h-4 w-4" />
          )}
          {activeKit && (
            <span className="text-[11px] text-white/60 max-w-[100px] truncate">
              {activeKit.nom.replace(/ Inc\.$/, "").replace(/ Ltee$/, "")}
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            Instance entreprise
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {bigKits.map(kit => {
            const brand = getKitBrand(kit.slug);
            const isActive = kit.slug === activeSlug;
            return (
              <DropdownMenuItem
                key={kit.slug}
                onSelect={() => handleSwitch(kit.slug)}
                className={cn("flex items-center gap-3 py-2.5 cursor-pointer", isActive && "bg-accent")}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: brand.color }}
                >
                  {brand.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{kit.nom}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {kit.ticker ? `${kit.ticker} — ` : ""}{kit.secteur ? kit.secteur.split(" / ")[0] : kit.localisation}
                  </div>
                </div>
                {isActive && <Check className="h-4 w-4 text-green-600 shrink-0" />}
              </DropdownMenuItem>
            );
          })}
          {otherKits.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                PME & tests
              </DropdownMenuLabel>
              {otherKits.map(kit => {
                const brand = getKitBrand(kit.slug);
                const isActive = kit.slug === activeSlug;
                return (
                  <DropdownMenuItem
                    key={kit.slug}
                    onSelect={() => handleSwitch(kit.slug)}
                    className={cn("flex items-center gap-3 py-2 cursor-pointer", isActive && "bg-accent")}
                  >
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                      style={{ backgroundColor: brand.color }}
                    >
                      {brand.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{kit.nom}</div>
                    </div>
                    {isActive && <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />}
                  </DropdownMenuItem>
                );
              })}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ═══════════════════════════════════════
// CHAT — Label discussion (panel centre)
// ═══════════════════════════════════════

export function TopBarChat() {
  return (
    <div className="h-12 flex items-center gap-2 px-3 shrink-0" style={{ backgroundColor: UB_BLUE }}>
      <MessageSquare className="h-3.5 w-3.5 text-white/60" />
      <span className="text-xs text-white/80 font-medium">Discussion</span>
    </div>
  );
}

// ═══════════════════════════════════════
// CONTENT — 4 nav buttons centres (panel droite)
// Instance + User moved to cockpit top bar
// ═══════════════════════════════════════

export function TopBarContent() {
  const { activeView, activeBotCode, setActiveView, navigateToDepartment } = useFrameMaster();

  const NAV_ITEMS = [
    { id: "departement", label: "Mon Departement", icon: Building2,
      onClick: () => navigateToDepartment("CEOB"),
      isActive: (activeView === "department" && activeBotCode === "CEOB") || activeView === "mon-entreprise" || activeView === "blueprint" || activeView === "cockpit" || activeView === "health" },
    { id: "salles", label: "Mes Salles", icon: DoorOpen,
      onClick: () => setActiveView("salles-hub"),
      isActive: activeView === "salles-hub" || activeView === "meeting-room" || activeView === "conference-ai" || activeView === "board-room" || activeView === "war-room" || activeView === "think-room" },
    { id: "equipe", label: "Mon Equipe", icon: Users,
      onClick: () => setActiveView("mon-equipe"),
      isActive: activeView === "mon-equipe" || (activeView === "department" && activeBotCode !== "CEOB") },
    { id: "reseau", label: "Mon Reseau", icon: Network,
      onClick: () => setActiveView("mon-reseau"),
      isActive: activeView === "mon-reseau" },
  ];

  return (
    <div className="h-12 flex items-center justify-center px-2 shrink-0 relative z-10" style={{ backgroundColor: UB_BLUE }}>
      <div className="flex items-center gap-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1 px-2 text-[11px] cursor-pointer",
                item.isActive
                  ? "text-white bg-white/15 hover:bg-white/20"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
              onClick={item.onClick}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// LEGACY — Anciens exports pour compatibilite (ne plus utiliser)
// ═══════════════════════════════════════

export function TopBarLeft() {
  const { setActiveView, leftSidebarCollapsed } = useFrameMaster();
  return (
    <div className={cn("h-12 flex items-center px-3 shrink-0 relative z-10", leftSidebarCollapsed ? "justify-center" : "justify-start")} style={{ backgroundColor: UB_BLUE }}>
      <img
        src={leftSidebarCollapsed ? "/logo-usine-bleue-icon.png" : "/logo-usine-bleue.png"}
        alt="Usine Bleue"
        className={cn("object-contain cursor-pointer transition-all duration-200", leftSidebarCollapsed ? "h-6" : "h-7")}
        onClick={() => setActiveView("dashboard")}
      />
    </div>
  );
}

export function TopBarCenter() {
  return <TopBarContent />;
}

export function TopBarRight() {
  return <TopBarCockpit />;
}

export function TopBar() {
  return (
    <div className="h-12 flex shrink-0" style={{ backgroundColor: UB_BLUE }}>
      <TopBarLeft />
      <div className="flex-1"><TopBarContent /></div>
    </div>
  );
}
