/**
 * ControlTowerPanel.tsx — Panneau Gauche V3
 *
 * Tour de contrôle : header UB, image bot banner, grille nav,
 * tabs Bureau/Orbit9, liste Brain Team, Cellules.
 *
 * CONSTANTES importées de constants.ts — JAMAIS redéfinir ici.
 */

import { useState } from "react";
import {
  Gauge, Video, Calendar, Layers, Database, BookOpen, Atom,
  Bot, BrainCog, Network, ArrowRight, ArrowLeft, Zap, TowerControl,
  Home, ChevronRight, Users, MessageSquare,
  Handshake, Shield, Rocket, Activity, UserCircle, OctagonX,
  User, Settings, LogOut, SlidersHorizontal,
  BookOpenCheck, Play, Map as MapIcon, CreditCard, Building2,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
} from "../components/ui/dropdown-menu";
import { useAmorcer } from "./AmorcerContext";
import { useFrameMaster } from "../v2/context/FrameMasterContext";
import { useTenant } from "../v2/context/TenantContext";
import { useBots, useStandingOrders } from "../v2/api/hooks";
import type { BotInfo } from "../v2/api/types";

import {
  BOT_CODES, BOT_NAME, BOT_ROLE, BOT_AVATAR, BOT_STANDBY,
  BOT_ACTIONS, STATE_DOT, STATE_LABEL, STATE_TAG, DEPT_ICON_COLOR,
  DEPT_SHORT_LABEL, DEPT_DASH_ICON,
} from "./constants";
// ═══ DEMOS CLIENTS — données inline (évite import circulaire TopBar) ═══

const KIT_BRAND: Record<string, { color: string; initials: string }> = {
  "usine-bleue":        { color: "#073E5A", initials: "UB" },
  "alimentation-boreal":{ color: "#2D7D46", initials: "AB" },
  "couche-tard":        { color: "#E4002B", initials: "CT" },
  "saputo":             { color: "#003DA5", initials: "SA" },
  "wsp-global":         { color: "#FF6900", initials: "WS" },
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

function switchKit(slug: string) {
  const userId = localStorage.getItem("ghostx_user_id") || "carl";
  fetch(`/api/v1/kit/set?slug=${encodeURIComponent(slug)}&user_id=${encodeURIComponent(userId)}`, { method: "POST" })
    .then(() => window.location.reload());
}

// ═══ CONFIG LOCALE (spécifique à ce panneau, pas partageable) ═══

interface DeptNavItem {
  label: string;
  icon: React.ElementType;
  state: string | null;
}

const DEPT_NAV_ITEMS: DeptNavItem[] = [
  { label: "Cockpit", icon: Gauge, state: null },
  { label: "Chantiers", icon: Rocket, state: null },
  { label: "Réunion", icon: Video, state: null },
  { label: "Agenda", icon: Calendar, state: null },
  { label: "Blueprint", icon: Layers, state: null },
  { label: "Données", icon: Database, state: null },
  { label: "Playbook", icon: BookOpen, state: null },
  { label: "Orbit9", icon: Atom, state: null },
];

const DEPT_SECTION_MAP: Record<string, string> = {
  "Cockpit": "cockpit",
  // "Chantiers" retiré — route via activePhase("execution"), pas une SECTION (rightSection)
  "Blueprint": "blueprint",
  "Données": "dataroom",
  "Playbook": "playbooks",
  "Réunion": "conferenceai",
  "Agenda": "bureau-agenda",
};

const O9_MENU = [
  { key: "dashboard", label: "Accueil", icon: Home },
  { key: "blueprint", label: "Blueprint", icon: BookOpen },
  { key: "cellules", label: "Cellules", icon: Atom },
  { key: "jumelage", label: "Jumelage", icon: Handshake },
  { key: "gouvernance", label: "Gouvernance", icon: Shield },
  { key: "pionniers", label: "Pionniers", icon: Rocket },
  { key: "vitaa", label: "VITAA", icon: Activity },
  { key: "perso", label: "Mon profil", icon: UserCircle },
  { key: "opportunites", label: "Opportunités", icon: Handshake },
];

// ═══ ORBIT9 MOCK DATA ═══

interface VitaaScore { v: number; i: number; t: number; a1: number; a2: number; }
interface CelluleMember { name: string; role: string; avatar: string; photo: string; vitaa: VitaaScore; }
interface O9Cellule {
  name: string; type: "interne" | "externe"; members: number; maxMembers: number;
  gradient: string; membres: CelluleMember[]; sousCellules: string[]; status: string;
}

const O9_CELLULES: O9Cellule[] = [
  {
    name: "Les Titans", type: "interne", members: 6, maxMembers: 9,
    gradient: "from-teal-600 to-teal-500",
    membres: [
      { name: "Carl F.", role: "Fondateur", avatar: "CF", photo: "/agents/carl-fugere.jpg", vitaa: { v: 0.7, i: 0.8, t: 0.6, a1: 0.5, a2: 0.4 } },
      { name: "Marie D.", role: "Ops", avatar: "MD", photo: BOT_AVATAR.CMOB, vitaa: { v: 0.5, i: 0.6, t: 0.8, a1: 0.3, a2: 0.2 } },
      { name: "Jean-P. L.", role: "Ventes", avatar: "JL", photo: BOT_AVATAR.CROB, vitaa: { v: 0.9, i: 0.4, t: 0.5, a1: 0.7, a2: 0.6 } },
      { name: "Sophie B.", role: "Marketing", avatar: "SB", photo: BOT_AVATAR.CSOB, vitaa: { v: 0.6, i: 0.7, t: 0.5, a1: 0.4, a2: 0.8 } },
      { name: "Luc T.", role: "Tech", avatar: "LT", photo: BOT_AVATAR.CTOB, vitaa: { v: 0.3, i: 0.9, t: 0.7, a1: 0.6, a2: 0.3 } },
      { name: "Nathalie R.", role: "Finance", avatar: "NR", photo: BOT_AVATAR.CFOB, vitaa: { v: 0.5, i: 0.5, t: 0.4, a1: 0.8, a2: 0.7 } },
    ],
    sousCellules: ["Marketing", "Ops", "Stratégie"],
    status: "execution",
  },
  {
    name: "Escouade Ventes", type: "interne", members: 3, maxMembers: 9,
    gradient: "from-teal-600 to-teal-500",
    membres: [
      { name: "Jean-P. L.", role: "Lead Ventes", avatar: "JL", photo: BOT_AVATAR.CROB, vitaa: { v: 0.9, i: 0.4, t: 0.5, a1: 0.7, a2: 0.6 } },
      { name: "Marc A.", role: "Rep. Senior", avatar: "MA", photo: BOT_AVATAR.COOB, vitaa: { v: 0.8, i: 0.3, t: 0.6, a1: 0.5, a2: 0.4 } },
      { name: "Chantal V.", role: "Rep. Junior", avatar: "CV", photo: BOT_AVATAR.CHROB, vitaa: { v: 0.6, i: 0.5, t: 0.4, a1: 0.3, a2: 0.2 } },
    ],
    sousCellules: ["Prospection", "Closing"],
    status: "creation",
  },
  {
    name: "Innovation Lab", type: "interne", members: 4, maxMembers: 9,
    gradient: "from-teal-600 to-teal-500",
    membres: [
      { name: "Luc T.", role: "Lead Tech", avatar: "LT", photo: BOT_AVATAR.CTOB, vitaa: { v: 0.3, i: 0.9, t: 0.7, a1: 0.6, a2: 0.3 } },
      { name: "Amélie C.", role: "R&D", avatar: "AC", photo: BOT_AVATAR.CINOB, vitaa: { v: 0.4, i: 0.8, t: 0.9, a1: 0.5, a2: 0.4 } },
      { name: "David M.", role: "Data", avatar: "DM", photo: BOT_AVATAR.CISOB, vitaa: { v: 0.2, i: 0.7, t: 0.8, a1: 0.4, a2: 0.3 } },
      { name: "Sophie B.", role: "Design", avatar: "SB", photo: BOT_AVATAR.CSOB, vitaa: { v: 0.6, i: 0.7, t: 0.5, a1: 0.4, a2: 0.8 } },
    ],
    sousCellules: ["Prototypage", "Veille"],
    status: "reflexion",
  },
  {
    name: "Collab MetalPro", type: "externe", members: 5, maxMembers: 9,
    gradient: "from-cyan-600 to-cyan-500",
    membres: [
      { name: "Pierre M.", role: "Dir. Général", avatar: "PM", photo: BOT_AVATAR.CPOB, vitaa: { v: 0.6, i: 0.5, t: 0.7, a1: 0.6, a2: 0.5 } },
      { name: "Sylvie L.", role: "Achats", avatar: "SL", photo: BOT_AVATAR.CLOB, vitaa: { v: 0.7, i: 0.4, t: 0.6, a1: 0.5, a2: 0.3 } },
      { name: "Robert D.", role: "Production", avatar: "RD", photo: BOT_AVATAR.COOB, vitaa: { v: 0.4, i: 0.6, t: 0.8, a1: 0.7, a2: 0.4 } },
      { name: "Julie P.", role: "Qualité", avatar: "JP", photo: BOT_AVATAR.CMOB, vitaa: { v: 0.5, i: 0.5, t: 0.5, a1: 0.4, a2: 0.6 } },
      { name: "Martin B.", role: "Logistique", avatar: "MB", photo: BOT_AVATAR.CHROB, vitaa: { v: 0.3, i: 0.7, t: 0.6, a1: 0.5, a2: 0.3 } },
    ],
    sousCellules: ["Intégration", "Livraison"],
    status: "observation",
  },
];

// ═══ SOUS-COMPOSANTS ═══

/** Barre de section — bandeau pastel UB avec icône + label */
function SectionBand({ icon: Icon, label, iconClassName }: { icon: React.ElementType; label: string; iconClassName?: string }) {
  return (
    <div className="mx-3 mt-2 px-3 py-1.5 flex items-center gap-2 rounded-t-xl bg-[#00B4D8]/10">
      <Icon className={cn("h-4 w-4 text-gray-900 stroke-[2.5]", iconClassName)} />
      <span className="text-sm font-bold text-gray-900">{label}</span>
    </div>
  );
}

/** Badge état (dot couleur + label) */
function StateBadge({ state }: { state: string }) {
  return (
    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", STATE_TAG[state] || "bg-gray-100 text-gray-700")}>
      <span className={cn("w-2 h-2 rounded-full", STATE_DOT[state] || "bg-gray-400")} />
      {STATE_LABEL[state] || state}
    </span>
  );
}

/** Card membre (avatar + nom + rôle + action) */
function MemberCard({ member, celluleName }: { member: CelluleMember; celluleName: string }) {
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
      <div className="flex items-center gap-2 px-2.5 py-2">
        <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 bg-gray-100">
          <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-gray-800">{member.name}</span>
          <span className="text-[9px] text-gray-400 block truncate">{member.role} · {celluleName}</span>
        </div>
      </div>
      <div className="border-t border-gray-100 px-2.5 py-1.5 flex items-center gap-2 bg-gray-50/50">
        <span className="text-[11px] font-bold text-gray-600 truncate flex-1">Actif dans la cellule</span>
        <button className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer shrink-0">
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">Écrire</span>
        </button>
      </div>
    </div>
  );
}

/** Card cellule (résumé avec membres + type + état) */
function CelluleCard({ cellule, onClick }: { cellule: O9Cellule; onClick: () => void }) {
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
      <button
        onClick={onClick}
        className="flex items-center gap-2 w-full px-2.5 py-2 text-left cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <Network className="h-3.5 w-3.5 text-teal-500 shrink-0" />
        <span className="text-[11px] font-semibold text-gray-800 truncate flex-1">{cellule.name}</span>
        <StateBadge state={cellule.status} />
        <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
      </button>
      <div className="border-t border-gray-100 px-2.5 py-1.5 flex items-center gap-2 bg-gray-50/50">
        <div className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-[9px] text-gray-500">{cellule.members}/{cellule.maxMembers}</span>
        </div>
        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
          cellule.type === "interne" ? "bg-teal-50 text-teal-600" : "bg-cyan-50 text-cyan-600"
        )}>
          {cellule.type === "interne" ? "Interne" : "Externe"}
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-0.5">
          {cellule.membres.slice(0, 4).map((m, mi) => (
            <div key={mi} className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-white shrink-0">
              <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
            </div>
          ))}
          {cellule.membres.length > 4 && (
            <span className="text-[8px] text-gray-400 ml-0.5">+{cellule.membres.length - 4}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══ KILL SWITCH — Stopper toute autonomie ═══

function KillSwitchButton({ collapsed }: { collapsed: boolean }) {
  const { orders, pauseAll } = useStandingOrders();
  const [confirming, setConfirming] = useState(false);
  const activeCount = orders.filter((o: any) => o.status === "actif").length;

  if (activeCount === 0) return null;

  const handleClick = async () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    await pauseAll();
    setConfirming(false);
  };

  return (
    <button
      onClick={handleClick}
      title={collapsed ? "Stop autonomie" : undefined}
      className={cn(
        "rounded-lg border transition-all cursor-pointer",
        collapsed
          ? "w-9 h-9 flex items-center justify-center"
          : "relative flex items-center gap-1.5 px-2 py-1.5",
        confirming
          ? "bg-red-100 border-red-400 text-red-700 animate-pulse"
          : "bg-red-50 hover:bg-red-100 border-red-200 text-red-600",
      )}
    >
      <OctagonX className="h-3.5 w-3.5 shrink-0" />
      {!collapsed && (
        <span className="text-[9px] font-medium leading-tight">
          {confirming ? "Confirmer STOP" : `Stop (${activeCount})`}
        </span>
      )}
    </button>
  );
}

// ═══ DROPDOWN UTILISATEUR (réutilisé expanded + collapsed) ═══

function UserDropdownContent({ setRightSection, setAuthenticated, isDieu, mode, setMode }: {
  setRightSection: (s: string) => void;
  setAuthenticated: (v: boolean) => void;
  isDieu: boolean;
  mode: string;
  setMode: (m: "perso" | "pro") => void;
}) {
  return (
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel className="text-xs text-muted-foreground">Mon compte</DropdownMenuLabel>
      <DropdownMenuItem onClick={() => setRightSection("bureau")} className="flex items-center gap-2 cursor-pointer">
        <User className="h-3.5 w-3.5" />
        Mon Profil
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setRightSection("reglages")} className="flex items-center gap-2 cursor-pointer">
        <Settings className="h-3.5 w-3.5" />
        Réglages Généraux
      </DropdownMenuItem>
      <DropdownMenuItem disabled className="flex items-center gap-2 cursor-default opacity-50">
        <CreditCard className="h-3.5 w-3.5" />
        Abonnement
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="text-xs text-muted-foreground">Référence & Simulations</DropdownMenuLabel>
      <DropdownMenuItem onClick={() => setRightSection("bible-officielle")} className="flex items-center gap-2 cursor-pointer">
        <BookOpenCheck className="h-3.5 w-3.5" />
        Bible & Référence
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setRightSection("simulations")} className="flex items-center gap-2 cursor-pointer">
        <Layers className="h-3.5 w-3.5" />
        Toutes les Simulations
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="text-xs text-muted-foreground">Mode</DropdownMenuLabel>
      <div className="px-2 py-1.5 flex items-center gap-1.5">
        {(["perso", "pro"] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "flex-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer text-center",
              mode === m
                ? "bg-[#073E5A] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {m === "perso" ? "Personnel" : "Professionnel"}
          </button>
        ))}
      </div>
      {isDieu && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
              <Building2 className="h-3.5 w-3.5" />
              Demos Clients
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-52 max-h-60 overflow-y-auto">
              {Object.entries(KIT_BRAND).map(([slug, brand]) => (
                <DropdownMenuItem key={slug} onClick={() => switchKit(slug)} className="flex items-center gap-2 cursor-pointer">
                  <span
                    className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                    style={{ backgroundColor: brand.color }}
                  >
                    {brand.initials}
                  </span>
                  <span className="text-xs truncate">{slug}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => setAuthenticated(false)} className="flex items-center gap-2 cursor-pointer text-red-600">
        <LogOut className="h-3.5 w-3.5" />
        Se déconnecter
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

// ═══ COMPOSANT PRINCIPAL ═══

export function ControlTowerPanel() {
  const {
    activeBotCode, setActiveBotCode,
    cockpitTab, setCockpitTab,
    o9Section, setO9Section,
    rightSection, setRightSection,
    resetChat,
  } = useAmorcer();
  const [activeDeptItem, setActiveDeptItem] = useState<string | null>("Cockpit");
  const [cockpitSubTab, setCockpitSubTab] = useState<"brainteam" | "cellules">("brainteam");
  const [o9SelectedCellule, setO9SelectedCellule] = useState<number | null>(null);
  const { setAuthenticated, leftSidebarCollapsed } = useFrameMaster();
  const { isDieu, mode, setMode } = useTenant();
  const collapsed = leftSidebarCollapsed;
  const DeptIconComp = DEPT_DASH_ICON[activeBotCode] || Zap;
  const deptName = DEPT_SHORT_LABEL[activeBotCode] || "Direction";
  const botName = BOT_NAME[activeBotCode] || "CarlOS";
  const botRole = BOT_ROLE[activeBotCode] || "CEO";
  const standbyImg = BOT_STANDBY[activeBotCode] || BOT_STANDBY.CEOB;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* TopBarCockpit — barre bleue UB */}
      <div className={cn("h-12 flex items-center shrink-0 bg-[#073E5A]",
        collapsed ? "justify-center px-1" : "gap-2 px-3"
      )}>
        <img
          src={collapsed ? "/logo-usine-bleue-icon.png" : "/logo-usine-bleue.png"}
          alt="Usine Bleue"
          className={cn("object-contain", collapsed ? "h-6" : "h-7")}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        {!collapsed && (
          <>
            <div className="flex-1" />
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 gap-1.5 px-1.5 text-white/80 hover:text-white hover:bg-white/10 inline-flex items-center rounded-md text-sm outline-none cursor-pointer">
                <div className="relative">
                  <img src="/agents/carl-fugere.jpg" alt="Carl" className="w-7 h-7 rounded-full object-cover ring-1 ring-white/30" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#073E5A]" />
                </div>
                <span className="text-[11px] text-white/80 max-w-28 truncate">Carl Fugère</span>
              </DropdownMenuTrigger>
              <UserDropdownContent setRightSection={setRightSection} setAuthenticated={setAuthenticated} isDieu={isDieu} mode={mode} setMode={setMode} />
            </DropdownMenu>
          </>
        )}
      </div>

      {/* Avatar utilisateur cliquable en mode collapsed */}
      {collapsed && (
        <div className="flex justify-center py-2 shrink-0 bg-white border-r border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none cursor-pointer">
              <img src="/agents/carl-fugere.jpg" alt="Carl" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30" />
            </DropdownMenuTrigger>
            <UserDropdownContent setRightSection={setRightSection} setAuthenticated={setAuthenticated} isDieu={isDieu} mode={mode} setMode={setMode} />
          </DropdownMenu>
        </div>
      )}

      {/* Sidebar content */}
      <div className="flex-1 overflow-hidden border-r border-gray-200">
        <div className="h-full flex flex-col bg-white overflow-hidden">
          {/* Image bot banner — masqué en collapsed */}
          {!collapsed && (
            <div className="mx-3 mt-2 shrink-0">
              <div className="relative overflow-hidden rounded-t-lg aspect-video bg-gray-900">
                <img src={standbyImg} alt={botName} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,14,26,0.3)_100%)] pointer-events-none" />
                {/* Tour de contrôle — overlay haut */}
                <div className="absolute top-0 left-0 right-0 z-[5]">
                  <div className="bg-gradient-to-b from-black/50 to-transparent px-2.5 pt-1.5 pb-5 flex items-center gap-1">
                    <TowerControl className="h-2.5 w-2.5 text-white stroke-[2] drop-shadow-lg" />
                    <span className="text-[9px] font-bold text-white drop-shadow-lg">Tour de contrôle</span>
                  </div>
                </div>
                {/* Nom du bot — overlay bas */}
                <div className="absolute bottom-0 left-0 right-0 z-[5]">
                  <div className="bg-gradient-to-t from-black/80 to-transparent px-4 pt-10 pb-2.5">
                    <div className="text-base font-bold text-white tracking-wide drop-shadow-lg leading-none">{botName}</div>
                    <div className="text-[9px] text-white/80 font-medium tracking-[0.2em] uppercase drop-shadow-md mt-1">{botRole} AI · Brain Team</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenu Bureau — toujours visible (Orbit9 = section du panneau droit, pas un tab gauche) */}
          <div className="flex-1 overflow-hidden flex flex-col mt-2">
            <div className="flex-1 overflow-hidden">
              <TabBureau collapsed={collapsed} activeBotCode={activeBotCode} setActiveBotCode={setActiveBotCode} activeDeptItem={activeDeptItem} setActiveDeptItem={setActiveDeptItem} cockpitSubTab={cockpitSubTab} setCockpitSubTab={setCockpitSubTab} DeptIconComp={DeptIconComp} deptName={deptName} setCockpitTab={setCockpitTab} setRightSection={setRightSection} resetChat={resetChat} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ TAB ORBIT9 ═══

interface TabOrbit9Props {
  o9Section: string;
  setO9Section: (s: string) => void;
  o9SelectedCellule: number | null;
  setO9SelectedCellule: (i: number | null) => void;
}

function TabOrbit9({ o9Section, setO9Section, o9SelectedCellule, setO9SelectedCellule }: TabOrbit9Props) {
  return (
    <div className="overflow-y-auto h-full text-[11px]">
      {/* Menu Orbit9 */}
      <SectionBand icon={Atom} label="Réseau Orbit⁹" />
      <div className="px-3 py-2 grid grid-cols-3 gap-1.5 border-b border-gray-200">
        {O9_MENU.map(item => (
          <button
            key={item.key}
            onClick={() => { setO9Section(item.key); if (item.key !== "cellules") setO9SelectedCellule(null); }}
            className={cn(
              "relative flex flex-col items-center gap-1 px-1.5 py-2 rounded-lg border text-center transition-all cursor-pointer",
              o9Section === item.key
                ? "bg-teal-50 border-teal-300 text-teal-700"
                : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600"
            )}
          >
            <item.icon className={cn("h-3.5 w-3.5 shrink-0", o9Section === item.key ? "text-teal-600" : "text-gray-600")} />
            <span className="text-[9px] font-medium w-full leading-tight text-center">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Cellules */}
      <SectionBand icon={Atom} label="Cellules" iconClassName="text-teal-500" />
      {o9SelectedCellule !== null ? (
        <CelluleDetail cellule={O9_CELLULES[o9SelectedCellule]} onBack={() => setO9SelectedCellule(null)} />
      ) : (
        <div className="p-3 space-y-1.5">
          <button
            onClick={() => setO9Section("creer-cellule")}
            className="w-full px-3 py-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer font-medium text-[11px] flex items-center justify-center gap-1.5"
          >
            <Atom className="h-3.5 w-3.5" />
            Créer une cellule
          </button>
          {O9_CELLULES.map((cell, i) => (
            <CelluleCard key={i} cellule={cell} onClick={() => setO9SelectedCellule(i)} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Vue détaillée d'une cellule (membres) */
function CelluleDetail({ cellule, onBack }: { cellule: O9Cellule; onBack: () => void }) {
  return (
    <div className="p-3 space-y-1.5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-800 cursor-pointer font-medium mb-1">
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour
      </button>
      <div className="rounded-lg px-2.5 py-2 bg-teal-50 border border-teal-200 flex items-center gap-2">
        <Atom className="h-3.5 w-3.5 text-teal-600" />
        <span className="text-[11px] font-bold text-teal-800 flex-1">{cellule.name}</span>
        <StateBadge state={cellule.status} />
      </div>
      {cellule.membres.map((m, i) => (
        <MemberCard key={i} member={m} celluleName={cellule.name} />
      ))}
    </div>
  );
}

// ═══ TAB BUREAU ═══

interface TabBureauProps {
  collapsed: boolean;
  activeBotCode: string;
  setActiveBotCode: (code: string) => void;
  activeDeptItem: string | null;
  setActiveDeptItem: (item: string | null) => void;
  cockpitSubTab: "brainteam" | "cellules";
  setCockpitSubTab: (tab: "brainteam" | "cellules") => void;
  DeptIconComp: React.ElementType;
  deptName: string;
  setCockpitTab: (tab: "bureau" | "orbit9") => void;
  setRightSection: (s: string) => void;
  resetChat: () => void;
}

function TabBureau({ collapsed, activeBotCode, setActiveBotCode, activeDeptItem, setActiveDeptItem, cockpitSubTab, setCockpitSubTab, DeptIconComp, deptName, setCockpitTab, setRightSection, resetChat }: TabBureauProps) {
  const { setActivePhase } = useAmorcer();
  const { isDieu } = useTenant();
  return (
    <div className="overflow-y-auto h-full text-[11px] flex flex-col">
      {/* Département dynamique — masqué en collapsed */}
      {!collapsed && (
        <div className="mx-3 mt-2 px-3 py-1.5 flex items-center gap-2 rounded-t-xl shrink-0 bg-[#00B4D8]/10">
          <DeptIconComp className={cn("h-4 w-4 text-gray-900 stroke-[2.5]", DEPT_ICON_COLOR[activeBotCode] || "text-blue-600")} />
          <span className="text-xs font-bold text-gray-900">Département {deptName}</span>
        </div>
      )}
      {/* Nav grid — icônes seulement en collapsed */}
      <div className={cn("shrink-0",
        collapsed ? "px-1 py-2 flex flex-col items-center gap-1" : "px-3 py-2 grid grid-cols-3 gap-1.5"
      )}>
        {DEPT_NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              setActiveDeptItem(item.label);
              if (item.label === "Chantiers") {
                // Chantiers = section dashboard — route via rightSection (pas activePhase)
                setCockpitTab("bureau");
                setRightSection("chantiers");
              } else if (item.label === "Orbit9") {
                setCockpitTab("orbit9");
                setRightSection(null);
              } else if (DEPT_SECTION_MAP[item.label]) {
                setCockpitTab("bureau");
                setRightSection(DEPT_SECTION_MAP[item.label]);
              }
            }}
            title={collapsed ? item.label : undefined}
            className={cn(
              "rounded-lg border transition-all cursor-pointer",
              collapsed
                ? "w-9 h-9 flex items-center justify-center"
                : "relative flex items-center gap-1.5 px-2 py-1.5",
              activeDeptItem === item.label
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600"
            )}
          >
            <item.icon className={cn("h-3.5 w-3.5 shrink-0", activeDeptItem === item.label ? "text-blue-600" : "text-gray-600")} />
            {!collapsed && <span className="text-[9px] font-medium leading-tight">{item.label}</span>}
            {!collapsed && item.state && (
              <span className={cn("absolute top-1 right-1 w-2 h-2 rounded-full", STATE_DOT[item.state])} />
            )}
          </button>
        ))}
        {/* God Mode — Admin */}
        {isDieu && (
          <button
            onClick={() => { setActiveDeptItem("Admin"); setRightSection("admin"); }}
            title={collapsed ? "Admin" : undefined}
            className={cn(
              "rounded-lg border transition-all cursor-pointer",
              collapsed
                ? "w-9 h-9 flex items-center justify-center"
                : "relative flex items-center gap-1.5 px-2 py-1.5",
              activeDeptItem === "Admin"
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600"
            )}
          >
            <Shield className={cn("h-3.5 w-3.5 shrink-0", activeDeptItem === "Admin" ? "text-blue-600" : "text-gray-600")} />
            {!collapsed && <span className="text-[9px] font-medium leading-tight">Admin</span>}
          </button>
        )}

        {/* Kill Switch — Stopper toute autonomie */}
        <KillSwitchButton collapsed={collapsed} />
      </div>

      {/* Tabs Brain Team + Mes Cellules — icônes seulement en collapsed */}
      <div className={cn("flex border-y border-gray-200 shrink-0 bg-gray-50/50 mt-1",
        collapsed && "flex-col"
      )}>
        {([
          { id: "brainteam" as const, label: "Brain Team", icon: BrainCog },
          { id: "cellules" as const, label: "Mes Cellules", icon: Network },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setCockpitSubTab(tab.id)}
            title={collapsed ? tab.label : undefined}
            className={cn(
              "flex items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors cursor-pointer",
              collapsed ? "w-full" : "flex-1",
              cockpitSubTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-500 bg-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {!collapsed && tab.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {cockpitSubTab === "brainteam" && <BrainTeamList collapsed={collapsed} activeBotCode={activeBotCode} setActiveBotCode={setActiveBotCode} />}
        {cockpitSubTab === "cellules" && <CockpitCellulesList collapsed={collapsed} />}
      </div>
    </div>
  );
}

// ═══ BRAIN TEAM LIST ═══

function BrainTeamList({ collapsed, activeBotCode, setActiveBotCode }: { collapsed: boolean; activeBotCode: string; setActiveBotCode: (code: string) => void }) {
  const { bots: apiBots } = useBots();
  const botMap = new Map((apiBots || []).map(b => [b.code, b]));

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-2">
        {BOT_CODES.filter(code => code !== activeBotCode).map((code) => (
          <button
            key={code}
            onClick={() => setActiveBotCode(code)}
            title={BOT_NAME[code]}
            className="cursor-pointer"
          >
            <img
              src={BOT_AVATAR[code]}
              alt={BOT_NAME[code]}
              className={cn("w-7 h-7 rounded-full object-cover transition-all",
                activeBotCode === code ? "ring-2 ring-blue-500" : "ring-1 ring-gray-200 hover:ring-blue-300"
              )}
            />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="p-2 text-[11px]">
      <div className="space-y-1.5">
        {BOT_CODES.filter(code => code !== activeBotCode).map((code) => {
          const isActive = false;
          const apiBot = botMap.get(code);
          const actions = BOT_ACTIONS[code];
          const dept = DEPT_SHORT_LABEL[code] || "";
          return (
            <div
              key={code}
              className={cn(
                "rounded-xl border shadow-sm transition-all overflow-hidden",
                isActive ? "border-blue-200 bg-blue-50/50" : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md",
              )}
            >
              {/* Header bleu pastel — icône dept + dept name + Aller → (cliquable) */}
              <button
                onClick={() => setActiveBotCode(code)}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-[#00B4D8]/10 rounded-t-xl cursor-pointer hover:bg-[#00B4D8]/20 transition-colors"
              >
                {(() => { const DIcon = DEPT_DASH_ICON[code] || Zap; return <DIcon className={cn("h-3.5 w-3.5 shrink-0", DEPT_ICON_COLOR[code] || "text-blue-600")} />; })()}
                <span className="text-[11px] font-bold text-gray-700 truncate flex-1 text-left">{dept}</span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 shrink-0">
                  <span className="hidden xl:inline">Aller</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
              {/* Avatar + name + role + state badge */}
              <div className="flex items-center gap-2 px-2.5 py-2">
                <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 bg-gray-100">
                  <img src={BOT_AVATAR[code]} alt={BOT_NAME[code]} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={cn("text-[11px] font-semibold", isActive ? "text-blue-700" : "text-gray-800")}>{BOT_NAME[code]} {BOT_ROLE[code]}</span>
                </div>
                {apiBot ? (
                  <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0 flex items-center gap-1", apiBot.actif ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500")}>
                    <span className={cn("w-2 h-2 rounded-full shrink-0", apiBot.actif ? "bg-green-500" : "bg-gray-400")} />
                    {apiBot.actif ? "Actif" : "Veille"}
                  </span>
                ) : actions && (
                  <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0 flex items-center gap-1", STATE_TAG[actions.state])}>
                    <span className={cn("w-2 h-2 rounded-full shrink-0", STATE_DOT[actions.state])} />
                    {STATE_LABEL[actions.state]}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══ COCKPIT CELLULES LIST ═══

function CockpitCellulesList({ collapsed }: { collapsed: boolean }) {
  const [selectedCellule, setSelectedCellule] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"interne" | "externe">("interne");

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-2">
        {O9_CELLULES.map((cell, i) => (
          <button key={i} title={cell.name} className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center cursor-pointer hover:bg-teal-100 transition-colors">
            <Atom className="h-3.5 w-3.5 text-teal-600" />
          </button>
        ))}
      </div>
    );
  }

  if (selectedCellule !== null) {
    return <CelluleDetail cellule={O9_CELLULES[selectedCellule]} onBack={() => setSelectedCellule(null)} />;
  }

  return (
    <div className="p-3 space-y-1.5 text-[11px]">
      <button
        onClick={() => setShowCreate(!showCreate)}
        className="w-full px-3 py-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer font-medium text-[11px] flex items-center justify-center gap-1.5"
      >
        <Network className="h-3.5 w-3.5" />
        {showCreate ? "Annuler" : "Créer une cellule"}
      </button>

      {showCreate && (
        <div className="rounded-xl border border-teal-200 shadow-sm overflow-hidden bg-white">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-50 border-b border-teal-100 rounded-t-xl">
            <Network className="h-4 w-4 text-teal-600 stroke-[2.5]" />
            <span className="text-sm font-bold text-teal-800">Nouvelle cellule</span>
          </div>
          <div className="p-2.5 space-y-2.5">
            <div>
              <label className="text-[9px] font-medium text-gray-500 mb-1 block">Nom</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full text-[11px] px-2.5 py-1.5 rounded-lg border border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none"
                placeholder="Ex: Les Titans..."
              />
            </div>
            <div>
              <label className="text-[9px] font-medium text-gray-500 mb-1 block">Type</label>
              <div className="flex gap-1.5">
                {([
                  { val: "interne" as const, label: "Interne" },
                  { val: "externe" as const, label: "Externe" },
                ]).map(t => (
                  <button
                    key={t.val}
                    onClick={() => setNewType(t.val)}
                    className={cn(
                      "flex-1 rounded-lg border px-2 py-1.5 text-[9px] font-medium cursor-pointer transition-all text-center",
                      newType === t.val ? "border-teal-300 bg-teal-50 text-teal-700" : "border-gray-200 text-gray-500 hover:border-teal-200"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <button className="w-full px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer font-medium text-[11px] flex items-center justify-center gap-1.5">
              <Network className="h-3.5 w-3.5" />
              Créer
            </button>
          </div>
        </div>
      )}

      {O9_CELLULES.map((cell, i) => (
        <CelluleCard key={i} cellule={cell} onClick={() => setSelectedCellule(i)} />
      ))}
    </div>
  );
}
