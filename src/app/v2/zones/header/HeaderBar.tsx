/**
 * HeaderBar.tsx — Barre superieure fixe (h-14)
 * Fond Midnight Blue #073E5A uniforme sur toute la bande
 * Sprint A — Frame Master V2
 */

import { useState, useEffect, useCallback } from "react";
import { Gauge, Settings, LayoutDashboard, SlidersHorizontal, HeartPulse, MessageSquare, Check, Building2, Users, Map, Play } from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { Button } from "../../../components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../../components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { useChatContext } from "../../context/ChatContext";
import { api } from "../../api/client";
import type { KitInfo, KitUserProfile } from "../../api/types";

const UB_BLUE = "#073E5A";

/** Couleurs de marque pour les initiales des kits entreprise */
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

/** Header colonne GAUCHE — Logo Usine Bleue */
export function HeaderLeft({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="h-14 border-b border-white/10 flex items-center justify-center px-3 shrink-0" style={{ backgroundColor: UB_BLUE }}>
      {collapsed ? (
        <img src="/logo-usine-bleue-icon.png" alt="Usine Bleue" className="h-7 object-contain" />
      ) : (
        <img src="/logo-usine-bleue.png" alt="Usine Bleue" className="h-8 object-contain" />
      )}
    </div>
  );
}

/** Header colonne CENTRE — Navigation principale */
export function HeaderCenter() {
  const { activeBotCode, activeView, setActiveView } = useFrameMaster();
  const { messages, threads } = useChatContext();
  const hasMessages = messages.length > 0 || threads.some(t => t.status !== "completed");
  const userMsgCount = messages.filter(m => m.role === "user").length;
  const openThreadCount = threads.filter(t => t.status !== "completed").length;
  const parkedCount = threads.filter(t => t.status === "parked").length;
  // Badge: nb de fils ouverts si > 0, sinon nb d'échanges user
  const badgeCount = openThreadCount > 0 ? openThreadCount : userMsgCount;

  return (
    <div className="h-14 border-b border-white/10 flex items-center shrink-0" style={{ backgroundColor: UB_BLUE }}>
      {/* Navigation centrée */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setActiveView(activeBotCode === "BCO" ? "dashboard" : "department")}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Tour de Controle</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Tour de Controle</TooltipContent>
        </Tooltip>

        {/* Discussion — ouvre la liste des fils */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1.5 text-xs relative",
                activeView === "discussion" || activeView === "live-chat"
                  ? "text-white bg-white/15 hover:bg-white/20"
                  : hasMessages
                    ? "text-blue-300 hover:text-blue-200 hover:bg-white/10"
                    : "text-white/80 hover:text-white hover:bg-white/10"
              )}
              onClick={() => setActiveView("discussion")}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Missions</span>
              {badgeCount > 0 && (
                <span className={cn(
                  "absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5",
                  parkedCount > 0 ? "bg-amber-500" : "bg-blue-500"
                )}>
                  {badgeCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mes Missions</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setActiveView("cockpit")}
            >
              <Gauge className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Cockpit</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cockpit</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setActiveView("health")}
            >
              <HeartPulse className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Sante Globale</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sante Globale de l'entreprise</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setActiveView("agent-settings")}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Reglage Agent AI</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reglage de l'Agent AI</TooltipContent>
        </Tooltip>

        </div>
      </div>
    </div>
  );
}

/** Header colonne DROITE — Gear (client switcher) + Profil */
export function HeaderRight({ collapsed = false }: { collapsed?: boolean }) {
  const { currentUser, setAuthenticated, setActiveView } = useFrameMaster();
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
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => { loadKits(); }, [loadKits]);

  const handleSwitch = async (slug: string) => {
    if (slug === activeSlug || switching) return;
    setSwitching(true);
    try {
      await api.setKit(slug);
      setActiveSlug(slug);
      // Recharger la page pour que tout le contexte reflète la nouvelle entreprise
      window.location.reload();
    } catch {
      // silently fail
    } finally {
      setSwitching(false);
    }
  };

  const activeKit = kits.find(k => k.slug === activeSlug);
  const activeBrand = activeSlug ? getKitBrand(activeSlug) : null;

  // Filtrer les kits de test, separer grandes entreprises vs PME
  const realKits = kits.filter(k => !k.slug.startsWith("test"));
  const bigSlugs = ["couche-tard", "saputo", "wsp-global", "usine-bleue", "premier-tech", "consignaction", "fonds-ftq", "investissement-quebec"];
  const bigKits = realKits.filter(k => bigSlugs.includes(k.slug));
  const otherKits = realKits.filter(k => !bigSlugs.includes(k.slug));

  const displayName = userProfile?.nom || currentUser;
  const displayPhoto = userProfile?.photo || "/agents/carl-fugere.jpg";

  if (collapsed) {
    return (
      <div className="h-14 border-b border-white/10 flex items-center justify-center px-1 shrink-0" style={{ backgroundColor: UB_BLUE }}>
        <div className="relative">
          <img src={displayPhoto} alt={displayName} className="w-6 h-6 rounded-full object-cover ring-1 ring-white/30" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#073E5A]" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-14 border-b border-white/10 flex items-center justify-between px-3 shrink-0" style={{ backgroundColor: UB_BLUE }}>
      {/* Profil utilisateur — à gauche */}
      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 gap-2 px-2 text-white/80 hover:text-white hover:bg-white/10 inline-flex items-center rounded-md text-sm outline-none">
            <div className="relative">
              <img src={displayPhoto} alt={displayName} className="w-7 h-7 rounded-full object-cover ring-1 ring-white/30" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#073E5A]" />
            </div>
            <span className="text-sm hidden xl:inline">{displayName}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Mon profil</DropdownMenuItem>
          <DropdownMenuItem>Mon entreprise</DropdownMenuItem>
          <DropdownMenuItem>Abonnement</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setActiveView("scenarios")} className="flex items-center gap-2">
            <Map className="h-3.5 w-3.5 text-emerald-600" />
            <span>Tour Guidé</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveView("scenarios")} className="flex items-center gap-2 text-muted-foreground">
            <Play className="h-3.5 w-3.5" />
            <span>Scenarios de simulation</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setAuthenticated(false)}>
            Se deconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Instance corporative — à droite */}
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
              <Settings className="h-4 w-4" />
            )}
            {activeKit && (
              <span className="text-xs hidden lg:inline text-white/60 max-w-[120px] truncate ml-2">
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

/** Legacy — plus utilise directement, garde pour mobile */
export function HeaderBar() {
  return (
    <header className="h-14 border-b flex items-center px-4 shrink-0" style={{ backgroundColor: UB_BLUE }}>
      <img src="/logo-usine-bleue.png" alt="Usine Bleue" className="h-8 object-contain" />
    </header>
  );
}
