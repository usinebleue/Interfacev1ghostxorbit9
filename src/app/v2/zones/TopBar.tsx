/**
 * TopBar.tsx — Barre superieure eclatee en 3 zones
 * Chaque zone est placee dans son panel resizable par FrameMaster.tsx
 * LEFT = Logo | CENTER = 8 nav | RIGHT = Instance + User
 * Sprint C — Restructuration Plateforme
 */

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Gauge,
  Layers,
  HeartPulse,
  Building2,
  Users,
  Settings,
  Check,
  LogOut,
  User,
  SlidersHorizontal,
  HelpCircle,
  CreditCard,
  BookOpen,
  FolderOpen,
  DoorOpen,
  Bot,
  Network,
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
// LEFT — Logo (dans le panel sidebar gauche)
// ═══════════════════════════════════════

export function TopBarLeft() {
  const { setActiveView, leftSidebarCollapsed } = useFrameMaster();

  return (
    <div className={cn("h-12 flex items-center px-3 shrink-0 relative z-10", leftSidebarCollapsed ? "justify-center" : "justify-start")} style={{ backgroundColor: UB_BLUE }}>
      <img
        src={leftSidebarCollapsed ? "/logo-usine-bleue-icon.png" : "/logo-usine-bleue.png"}
        alt="Usine Bleue"
        className={cn(
          "object-contain cursor-pointer transition-all duration-200",
          leftSidebarCollapsed ? "h-6" : "h-7"
        )}
        onClick={() => setActiveView("dashboard")}
      />
    </div>
  );
}

// ═══════════════════════════════════════
// CENTER — 8 boutons navigation (dans le panel central)
// ═══════════════════════════════════════

export function TopBarCenter() {
  const { activeView, activeBotCode, setActiveView, navigateToDepartment } = useFrameMaster();

  const NAV_ITEMS = [
    { id: "cockpit", label: "Cockpit", icon: Gauge,
      onClick: () => navigateToDepartment("CEOB"),
      isActive: activeView === "department" && activeBotCode === "CEOB" },
    { id: "blueprint", label: "Blueprint", icon: Layers,
      onClick: () => setActiveView("blueprint"),
      isActive: activeView === "blueprint" },
    { id: "sante", label: "Sante", icon: HeartPulse,
      onClick: () => setActiveView("health"),
      isActive: activeView === "health" || activeView === "diagnostic-hub" || activeView === "diagnostic-ia" },
    { id: "bureau", label: "Bureau", icon: FolderOpen,
      onClick: () => setActiveView("espace-bureau"),
      isActive: activeView === "espace-bureau" },
    { id: "salles", label: "Salles", icon: DoorOpen,
      onClick: () => setActiveView("meeting-room"),
      isActive: activeView === "meeting-room" || activeView === "board-room" || activeView === "war-room" || activeView === "think-room" },
    { id: "equipe", label: "Equipe AI", icon: Bot,
      onClick: () => setActiveView("agent-gallery"),
      isActive: activeView === "agent-gallery" || activeView === "department" },
    { id: "reseau", label: "Reseau", icon: Network,
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
// RIGHT — Instance + User (dans le panel sidebar droite)
// ═══════════════════════════════════════

export function TopBarRight() {
  const { activeView, setActiveView, currentUser, setAuthenticated } = useFrameMaster();

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

  return (
    <div className="h-12 flex items-center gap-3 px-3 shrink-0 relative z-10" style={{ backgroundColor: UB_BLUE }}>
      {/* Instance corporative */}
      <DropdownMenu onOpenChange={(open) => { if (open) loadKits(); }}>
        <DropdownMenuTrigger className="h-8 gap-2 px-2 text-white/70 hover:text-white hover:bg-white/10 inline-flex items-center rounded-md text-sm outline-none">
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
            <span className="text-xs hidden xl:inline text-white/60 max-w-[120px] truncate">
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

      <div className="flex-1" />
      <div className="w-px h-6 bg-white/20" />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 gap-2 px-2 text-white/80 hover:text-white hover:bg-white/10 inline-flex items-center rounded-md text-sm outline-none">
          <div className="relative">
            <img src={displayPhoto} alt={displayName} className="w-7 h-7 rounded-full object-cover ring-1 ring-white/30" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#073E5A]" />
          </div>
          <span className="text-xs hidden xl:inline">{displayName}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
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
          <DropdownMenuItem onClick={() => setAuthenticated(false)} className="flex items-center gap-2 cursor-pointer text-red-600">
            <LogOut className="h-3.5 w-3.5" />
            Se deconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ═══════════════════════════════════════
// LEGACY — Garde l'export TopBar pour compatibilité (mais plus utilisé)
// ═══════════════════════════════════════

export function TopBar() {
  return (
    <div className="h-12 flex shrink-0" style={{ backgroundColor: UB_BLUE }}>
      <TopBarLeft />
      <div className="flex-1"><TopBarCenter /></div>
      <TopBarRight />
    </div>
  );
}
