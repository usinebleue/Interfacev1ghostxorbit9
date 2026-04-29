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
  Shield,
  Eye,
  ChevronDown,
  Sparkles,
  Server,
  Atom,
  Radio,
  AlertTriangle,
  Gem,
  GraduationCap,
  TrendingUp,
  EyeOff,
  Gauge,
  Landmark,
  Stethoscope,
  Library,
  Megaphone,
  Scale,
  Bot,
  Zap,
  Crosshair,
  Rocket,
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
import { useTenant } from "../context/TenantContext";
import { api } from "../api/client";
import type { KitInfo, KitUserProfile, NiveauAcces, TypeActeur } from "../api/types";

const UB_BLUE = "#073E5A";

// ═══════════════════════════════════════
// Master BTML — 31 pages en 4 blocs
// Meme donnees que SectionMasterGHML.tsx
// ═══════════════════════════════════════

export interface BTMLItem {
  id: ActiveView;
  label: string;
  icon: React.ElementType;
  color: string;
}

export interface BTMLBloc {
  bloc: string;
  label: string;
  icon: React.ElementType;
  color: string;
  items: BTMLItem[];
}

export const MASTER_BTML_BLOCS: BTMLBloc[] = [
  {
    bloc: "FE", label: "Frontend", icon: BookOpen, color: "text-blue-600",
    items: [
      { id: "bible-officielle", label: "Bible Visuelle Officielle", icon: BookOpen, color: "text-emerald-500" },
      { id: "bible-visuelle", label: "Vieille Bible 1", icon: BookOpen, color: "text-gray-400" },
      { id: "master-bible-live", label: "Vieille Bible 2", icon: Sparkles, color: "text-gray-400" },
      { id: "bible-visuelle-cible", label: "Vieille Bible 3", icon: Crosshair, color: "text-gray-400" },
      { id: "animation-showcase", label: "FE.4 Lab Animations", icon: Sparkles, color: "text-amber-500" },
      { id: "agent-gallery", label: "FE.4b Galerie Agents AI", icon: Users, color: "text-blue-500" },
      { id: "master-navigation", label: "FE.5 Structure Navigation", icon: Map, color: "text-slate-600" },
      { id: "master-flows", label: "FE.6 Atlas des Flows", icon: Route, color: "text-cyan-600" },
      { id: "master-parcours", label: "FE.7 Parcours Client", icon: Route, color: "text-pink-500" },
      { id: "fe-sidebar-droite", label: "FE.8 Console Droite", icon: Map, color: "text-indigo-500" },
      { id: "fe-mon-reseau", label: "FE.9 Mon Réseau", icon: Network, color: "text-orange-600" },
      { id: "accueil-hero", label: "FE.10 Accueil Hero", icon: Rocket, color: "text-blue-600" },
    ],
  },
  {
    bloc: "BE", label: "Backend", icon: Server, color: "text-violet-600",
    items: [
      { id: "bible-technique", label: "BE.1 Bible Technique", icon: Server, color: "text-emerald-500" },
      { id: "bible-ghml", label: "BE.2 Bible GHML Complete", icon: Atom, color: "text-violet-500" },
      { id: "master-communication", label: "BE.3 Stack Communication", icon: Radio, color: "text-teal-500" },
      { id: "master-dette", label: "BE.4 Dette Technique", icon: AlertTriangle, color: "text-rose-500" },
      { id: "master-training", label: "BE.5 Entrainement Agents", icon: GraduationCap, color: "text-purple-500" },
      { id: "master-cortex-robot", label: "BE.6 Cortex Robot Humanoide", icon: Bot, color: "text-gray-700" },
      { id: "master-minedor", label: "BE.7 Mine d'Or & Data", icon: Gem, color: "text-yellow-500" },
      { id: "master-cartographie", label: "BE.8 Cartographie Industrielle", icon: Map, color: "text-cyan-600" },
      { id: "master-hydro-quebec", label: "BE.9 Hydro-Quebec & Multi-Agent", icon: Zap, color: "text-cyan-600" },
      { id: "master-guides-legaux", label: "BE.10 Guides Legaux & C-Level", icon: Scale, color: "text-slate-700" },
    ],
  },
  {
    bloc: "RD", label: "Roadmap Dev", icon: Route, color: "text-emerald-600",
    items: [
      { id: "master-roadmap", label: "RD.1 Roadmap & Decisions", icon: Map, color: "text-amber-500" },
      { id: "master-routine", label: "RD.2 Routine de Dev", icon: Shield, color: "text-cyan-500" },
      { id: "master-diagnostics", label: "RD.3 Diagnostics (54)", icon: Stethoscope, color: "text-orange-600" },
      { id: "master-playbooks", label: "RD.4 Playbooks & Missions", icon: Play, color: "text-violet-600" },
      { id: "master-bibliotheque-exec", label: "RD.5 Bibliothèque Exécution", icon: Library, color: "text-indigo-600" },
      { id: "master-angles-morts", label: "RD.6 Angles Morts & Risques", icon: EyeOff, color: "text-red-600" },
      { id: "playbook-usine-bleue", label: "RD.7 Plan Stratégique", icon: Rocket, color: "text-blue-600" },
      { id: "strategique-reseau", label: "RD.8 Stratégique Réseau", icon: Network, color: "text-orange-600" },
    ],
  },
  {
    bloc: "SA", label: "Strategies Affaires", icon: Briefcase, color: "text-amber-600",
    items: [
      { id: "master-strategie", label: "SA.1 Vision & Stratégie", icon: Rocket, color: "text-red-500" },
      { id: "master-instance-fonds", label: "SA.2 Instance Fonds & Investissement", icon: Landmark, color: "text-emerald-600" },
      { id: "master-orbit9", label: "SA.3 Orbit9 & Reseau", icon: Network, color: "text-orange-500" },
      { id: "master-profils", label: "SA.4 Profils & Demos", icon: Users, color: "text-sky-500" },
      { id: "master-marketing-360", label: "SA.5 Marketing 360", icon: Megaphone, color: "text-pink-600" },
      { id: "master-oracle9", label: "SA.6 Oracle9", icon: Radio, color: "text-amber-600" },
      { id: "flow-usine-bleue", label: "SA.7 Flow Transformation", icon: Rocket, color: "text-blue-500" },
      { id: "master-capacites", label: "SA.8 Capacités & ROI", icon: Gauge, color: "text-blue-600" },
    ],
  },
];

export const KIT_BRAND: Record<string, { color: string; initials: string }> = {
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

export function getKitBrand(slug: string) {
  return KIT_BRAND[slug] || { color: "#6B7280", initials: slug.slice(0, 2).toUpperCase() };
}

// ═══════════════════════════════════════
// COCKPIT TOP — Instance + User Profile (panel gauche)
// Remplace l'ancien logo Usine Bleue
// ═══════════════════════════════════════

export function TopBarCockpit({ collapsed = false }: { collapsed?: boolean }) {
  const { setActiveView, currentUser, setAuthenticated } = useFrameMaster();
  const { isDieu, mode, setMode, profile, setNiveau, setTypeActeur } = useTenant();

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

  // Collapsed — logo icon + user avatar stacked
  if (collapsed) {
    return (
      <div className="h-12 flex items-center justify-center gap-1.5 px-1 shrink-0" style={{ backgroundColor: UB_BLUE }}>
        <img
          src="/logo-usine-bleue-icon.png"
          alt="Usine Bleue"
          className="h-6 object-contain cursor-pointer"
          onClick={() => setActiveView("dashboard")}
        />
      </div>
    );
  }

  return (
    <div className="h-12 flex items-center gap-2 px-3 shrink-0" style={{ backgroundColor: UB_BLUE }}>
      {/* GAUCHE — Logo Usine Bleue */}
      <img
        src="/logo-usine-bleue.png"
        alt="Usine Bleue"
        className="h-7 object-contain cursor-pointer"
        onClick={() => setActiveView("dashboard")}
      />

      <div className="flex-1" />

      {/* DROITE — User Profile (MOI) */}
      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 gap-1.5 px-1.5 text-white/80 hover:text-white hover:bg-white/10 inline-flex items-center rounded-md text-sm outline-none">
          <div className="relative">
            <img src={displayPhoto} alt={displayName} className="w-7 h-7 rounded-full object-cover ring-1 ring-white/30" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#073E5A]" />
          </div>
          <span className="text-[11px] text-white/80 max-w-[110px] truncate">{displayName}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Mon compte</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setActiveView("espace-bureau")} className="flex items-center gap-2 cursor-pointer">
            <User className="h-3.5 w-3.5" />
            Mon Profil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveView("agent-settings")} className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-3.5 w-3.5" />
            Réglages Généraux
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveView("agent-settings")} className="flex items-center gap-2 cursor-pointer">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Reglages Agents AI
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setActiveView("bible-officielle")} className="flex items-center gap-2 cursor-pointer">
            <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
            Bible & Référence
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-muted-foreground">
            <HelpCircle className="h-3.5 w-3.5" />
            FAQ
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5" />
            Abonnement
          </DropdownMenuItem>
          {isDieu && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
                  <Layers className="h-3.5 w-3.5 text-violet-600" />
                  Master BTML
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56">
                  {MASTER_BTML_BLOCS.map((bloc) => {
                    const BlocIcon = bloc.icon;
                    return (
                      <DropdownMenuSub key={bloc.bloc}>
                        <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
                          <BlocIcon className={cn("h-3.5 w-3.5", bloc.color)} />
                          <span className="flex-1">{bloc.bloc} — {bloc.label}</span>
                          <span className="text-[9px] text-muted-foreground ml-1">{bloc.items.length}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-64 max-h-80 overflow-y-auto">
                          {bloc.items.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <DropdownMenuItem
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <ItemIcon className={cn("h-3.5 w-3.5 shrink-0", item.color)} />
                                <span className="truncate text-xs">{item.label}</span>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    );
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setActiveView("scenarios")} className="flex items-center gap-2 cursor-pointer">
            <Map className="h-3.5 w-3.5 text-emerald-600" />
            Tour Guide
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveView("scenarios")} className="flex items-center gap-2 cursor-pointer text-muted-foreground">
            <Play className="h-3.5 w-3.5" />
            Scenarios de simulation
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveView("ateliers")} className="flex items-center gap-2 cursor-pointer">
            <Play className="h-3.5 w-3.5 text-violet-600" />
            Ateliers split-screen
          </DropdownMenuItem>
          {/* Toggle Personnel / Professionnel */}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">Mode</DropdownMenuLabel>
          <div className="px-2 pb-1.5">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                className={cn(
                  "flex-1 px-2 py-1 rounded-md text-[9px] font-medium transition-all",
                  mode === "perso" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
                onClick={() => setMode("perso")}
              >
                Personnel
              </button>
              <button
                className={cn(
                  "flex-1 px-2 py-1 rounded-md text-[9px] font-medium transition-all",
                  mode === "pro" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
                onClick={() => setMode("pro")}
              >
                Professionnel
              </button>
            </div>
          </div>
          {/* Instance / Mode de vue */}
          {isDieu && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
                  <Eye className="h-3.5 w-3.5 text-blue-600" />
                  Instance & Vue
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Mode de vue</DropdownMenuLabel>
                  {VIEW_MODES.map(opt => {
                    const OptIcon = opt.icon;
                    const isSelected = profile.niveau === opt.niveau && (!opt.typeActeur || profile.type_acteur === opt.typeActeur);
                    return (
                      <DropdownMenuItem
                        key={opt.id}
                        onSelect={() => {
                          setNiveau(opt.niveau);
                          if (opt.typeActeur) setTypeActeur(opt.typeActeur);
                        }}
                        className={cn("flex items-center gap-2 py-1.5 cursor-pointer", isSelected && "bg-accent")}
                      >
                        <OptIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1 text-sm">{opt.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />}
                      </DropdownMenuItem>
                    );
                  })}
                  {kits.length > 1 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-muted-foreground">Demos Clients</DropdownMenuLabel>
                      {realKits.map(kit => {
                        const brand = getKitBrand(kit.slug);
                        const isActive = kit.slug === activeSlug;
                        return (
                          <DropdownMenuItem
                            key={kit.slug}
                            onSelect={() => handleSwitch(kit.slug)}
                            className={cn("flex items-center gap-2 py-1.5 cursor-pointer", isActive && "bg-accent")}
                          >
                            <div
                              className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                              style={{ backgroundColor: brand.color }}
                            >
                              {brand.initials}
                            </div>
                            <span className="text-sm truncate flex-1">{kit.nom}</span>
                            {isActive && <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />}
                          </DropdownMenuItem>
                        );
                      })}
                    </>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          )}
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

// ═══════════════════════════════════════
// Mode de vue — definitions
// ═══════════════════════════════════════

export interface ViewModeOption {
  id: string;
  label: string;
  niveau: NiveauAcces;
  typeActeur?: TypeActeur;
  icon: React.ElementType;
}

export const VIEW_MODES: ViewModeOption[] = [
  { id: "dieu",        label: "Mode Dieu",         niveau: "dieu",      icon: Shield },
  { id: "mfg",         label: "Vue Manufacturier", niveau: "client",    typeActeur: "MFG", icon: Building2 },
  { id: "int",         label: "Vue Integrateur",   niveau: "client",    typeActeur: "INT", icon: Building2 },
  { id: "operateur",   label: "Vue Operateur",     niveau: "operateur", icon: Eye },
  { id: "expert",      label: "Vue Expert",        niveau: "client",    typeActeur: "EXP", icon: Users },
];

export function TopBarContent() {
  const { activeView, activeBotCode, setActiveView, navigateToDepartment } = useFrameMaster();
  const { isDieu } = useTenant();

  const NAV_ITEMS = [
    { id: "departement", label: "Mon Département", icon: Building2,
      onClick: () => navigateToDepartment("CEOB"),
      isActive: (activeView === "department" && activeBotCode === "CEOB") || activeView === "mon-entreprise" || activeView === "blueprint" || activeView === "cockpit" || activeView === "health" },
    { id: "salles", label: "Mes Salles", icon: DoorOpen,
      onClick: () => setActiveView("salles-hub"),
      isActive: activeView === "salles-hub" || activeView === "meeting-room" || activeView === "conference-ai" || activeView === "board-room" || activeView === "war-room" || activeView === "think-room" },
    { id: "equipe", label: "Mon Équipe", icon: Users,
      onClick: () => setActiveView("mon-equipe"),
      isActive: activeView === "mon-equipe" || (activeView === "department" && activeBotCode !== "CEOB") },
    { id: "reseau", label: "Mon Réseau", icon: Network,
      onClick: () => setActiveView("mon-reseau"),
      isActive: activeView === "mon-reseau" },
    // Admin — visible seulement en God Mode
    ...(isDieu ? [{
      id: "admin",
      label: "Admin",
      icon: Shield,
      onClick: () => setActiveView("admin"),
      isActive: activeView === "admin",
    }] : []),
  ];

  return (
    <div className="h-12 flex items-center px-2 shrink-0 relative z-10" style={{ backgroundColor: UB_BLUE }}>
      <div className="flex-1" />
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
      <div className="flex-1" />
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
