/**
 * MasterNavigationPage.tsx — Structure de Navigation
 * Arborescence complete de la plateforme CarlOS/GhostX avec toutes les couches d'instances.
 * Master GHML — Session 47
 */

import {
  Map, Layout, Briefcase, DollarSign, Target, Factory, Settings,
  TrendingUp, Megaphone, Users, Shield, Scale, Lightbulb, Activity,
  Crown, AlertTriangle, Network, Store, Handshake, Sparkles, Rocket,
  Newspaper, Calendar, Globe, BookOpen, Server, Package, Atom,
  Radio, GitBranch, Gem, GraduationCap, Route, Gauge,
  ChevronRight, ArrowRight, CheckCircle2, Monitor, Smartphone,
  MessageSquare, FileText, FolderKanban, Flame, Wrench,
  CheckSquare, CalendarDays, DoorOpen, Cpu, Eye, User, HelpCircle, BarChart3,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ======================================================================
// HELPER COMPONENTS
// ======================================================================

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

function StatusBadge({ status }: { status: "live" | "partiel" | "planifie" | "futur" }) {
  const styles = {
    live: "bg-emerald-50 text-emerald-700 border-emerald-200",
    partiel: "bg-amber-50 text-amber-700 border-amber-200",
    planifie: "bg-blue-50 text-blue-700 border-blue-200",
    futur: "bg-gray-50 text-gray-500 border-gray-200",
  };
  const labels = { live: "Live", partiel: "Partiel", planifie: "Planifié", futur: "Futur" };
  return (
    <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full border", styles[status])}>
      {labels[status]}
    </span>
  );
}

function NavLevel({ depth = 0, children }: { depth?: number; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1", depth > 0 && "ml-4 pl-3 border-l-2 border-gray-100")}>
      {children}
    </div>
  );
}

function NavItem({ icon: Icon, label, viewId, status, color, sub, tabs }: {
  icon: React.ElementType;
  label: string;
  viewId?: string;
  status: "live" | "partiel" | "planifie" | "futur";
  color: string;
  sub?: string;
  tabs?: string[];
}) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", color)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-800">{label}</span>
          <StatusBadge status={status} />
          {viewId && (
            <code className="text-[9px] text-gray-400 font-mono bg-gray-50 px-1 rounded">{viewId}</code>
          )}
        </div>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        {tabs && tabs.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tabs.map((t) => (
              <span key={t} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ======================================================================
// DATA — Navigation Stats
// ======================================================================

const NAV_STATS = [
  { label: "Routes ActiveView", value: "48", color: "blue" },
  { label: "Sections Sidebar", value: "6", color: "violet" },
  { label: "Sous-tabs", value: "20+", color: "emerald" },
  { label: "Pages Master GHML", value: "18", color: "amber" },
  { label: "State Variables", value: "12", color: "rose" },
  { label: "Navigate Methods", value: "10", color: "teal" },
];

// ======================================================================
// DATA — Context State
// ======================================================================

const CONTEXT_VARS = [
  { name: "activeView", type: "ActiveView (48 values)", desc: "Route principale du canvas central", scope: "Global" },
  { name: "activeBotCode", type: "string", desc: "Bot actif (BCO, BCT, etc.) — couleur bande + contexte", scope: "Global" },
  { name: "activeEspaceSection", type: "EspaceSection", desc: "Sous-tab dans EspaceBureauView", scope: "Mon Espace" },
  { name: "activeDiscussionTab", type: "DiscussionTab", desc: "Sous-tab dans MesChantiersView", scope: "Mon Espace" },
  { name: "activeBlueprintSection", type: "BlueprintSection", desc: "Sous-tab dans BluePrintView", scope: "Mon Équipe" },
  { name: "activeOrbit9Section", type: "string", desc: "Section Orbit9 active", scope: "Mon Réseau" },
  { name: "chatSourceView", type: "string", desc: "Vue source quand LiveChat ouvre depuis Room (D-109)", scope: "Rooms" },
  { name: "leftSidebarCollapsed", type: "boolean", desc: "Sidebar gauche réduite (icônes seulement)", scope: "UI" },
  { name: "rightSidebarCollapsed", type: "boolean", desc: "Sidebar droite (LiveChat) visible/cachée", scope: "UI" },
  { name: "isAuthenticated", type: "boolean", desc: "Login state (localStorage)", scope: "Auth" },
  { name: "isOnboarded", type: "boolean", desc: "Onboarding complété", scope: "Auth" },
  { name: "hasSeenSimulation", type: "boolean", desc: "Simulation CREDO vue (tutorial)", scope: "Auth" },
];

const NAV_METHODS = [
  { name: "setActiveView", signature: "(view: ActiveView)", desc: "Change la route principale du canvas" },
  { name: "setActiveBot", signature: "(bot: BotInfo)", desc: "Change le bot actif + code bot" },
  { name: "navigateToDepartment", signature: "(code: string, view?)", desc: "Bot + vue département (défaut: tour de contrôle)" },
  { name: "navigateOrbit9", signature: "(sectionId: string)", desc: "Section Orbit9 + vue orbit9-detail" },
  { name: "navigateEspace", signature: "(section: EspaceSection)", desc: "Sous-section bureau + vue espace-bureau" },
  { name: "navigateBlueprint", signature: "(section: BlueprintSection)", desc: "Sous-section blueprint + vue blueprint" },
  { name: "navigateDiscussionTab", signature: "(tab: DiscussionTab)", desc: "Change le tab dans MesChantiersView" },
  { name: "navigateToChat", signature: "(sourceView: string)", desc: "Ouvre LiveChat avec source (D-109 Rooms)" },
  { name: "toggleLeftSidebar", signature: "()", desc: "Collapse/expand sidebar gauche" },
  { name: "toggleRightSidebar", signature: "()", desc: "Collapse/expand sidebar droite (LiveChat)" },
];

// ======================================================================
// DATA — Bot Identity Colors
// ======================================================================

const BOT_COLORS = [
  { code: "BCO", role: "CEO — Direction", band: "bg-blue-500", text: "text-blue-600" },
  { code: "BCT", role: "CTO — Technologie", band: "bg-violet-500", text: "text-violet-600" },
  { code: "BCF", role: "CFO — Finance", band: "bg-emerald-500", text: "text-emerald-600" },
  { code: "BCM", role: "CMO — Marketing", band: "bg-pink-500", text: "text-pink-600" },
  { code: "BCS", role: "CSO — Stratégie", band: "bg-red-500", text: "text-red-600" },
  { code: "BOO", role: "COO — Opérations", band: "bg-orange-500", text: "text-orange-600" },
  { code: "BFA", role: "CPO — Production", band: "bg-slate-400", text: "text-slate-600" },
  { code: "BHR", role: "CHRO — RH", band: "bg-teal-500", text: "text-teal-600" },
  { code: "BIO", role: "CINO — Innovation", band: "bg-rose-500", text: "text-rose-600" },
  { code: "BRO", role: "CRO — Ventes", band: "bg-amber-500", text: "text-amber-600" },
  { code: "BLE", role: "CLO — Légal", band: "bg-indigo-500", text: "text-indigo-600" },
  { code: "BSE", role: "CISO — Sécurité", band: "bg-zinc-400", text: "text-zinc-600" },
];

// ======================================================================
// MAIN COMPONENT
// ======================================================================

export function MasterNavigationPage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout maxWidth="4xl" showPresence={false} onBack={() => setActiveView("dashboard")}>
      <PageHeader
        icon={Map}
        title="Structure de Navigation"
        subtitle="Arborescence complète — Top Bar + 6 sections sidebar + 48 routes + tabs centre"
        gradient="from-slate-700 to-slate-500"
      />

      {/* ============================================================ */}
      {/* VUE D'ENSEMBLE — Stats */}
      {/* ============================================================ */}

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        {NAV_STATS.map((s) => (
          <Card key={s.label} className="p-3 text-center">
            <div className={cn("text-2xl font-bold", `text-${s.color}-600`)}>{s.value}</div>
            <div className="text-[9px] text-gray-500 mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* ============================================================ */}
      {/* SECTION 1 — Architecture 3 Zones */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Layout className="h-4 w-4 text-slate-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.1</span>Architecture — Top Bar + 3 Zones</h2>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          L'interface CarlOS suit un layout <strong>Top Bar fixe + 3 colonnes</strong>. La barre du haut est
          la navigation CEO-level. La zone centrale est le canvas principal,
          contrôlé par <code className="text-xs bg-gray-100 px-1 rounded">activeView</code> dans FrameMasterContext.
        </p>

        {/* === TOP BAR — 3 sous-zones === */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Top Bar — Barre Supérieure</div>
          <div className="grid grid-cols-3 gap-3 mb-2">
            <Card className="p-3 border-t-4 border-t-blue-500">
              <div className="text-xs font-semibold text-blue-700 mb-1">Zone Gauche</div>
              <div className="text-[9px] text-gray-500 space-y-0.5">
                <div className="font-medium text-gray-700">Logo Usine Bleue</div>
                <div>Logo de l'instance client</div>
                <div>Click → retour Tour de Contrôle</div>
              </div>
            </Card>
            <Card className="p-3 border-t-4 border-t-emerald-500">
              <div className="text-xs font-semibold text-emerald-700 mb-1">Zone Centre</div>
              <div className="text-[9px] text-gray-500 space-y-0.5">
                <div className="font-medium text-gray-700">Niveau Entreprise — CEO + CarlOS</div>
                <div>Tour de Contrôle</div>
                <div>Cockpit</div>
                <div>Blueprint</div>
                <div>Santé Globale</div>
                <div className="text-gray-400 italic">= raccourcis vers Mon Entreprise (C.2.2.1)</div>
              </div>
            </Card>
            <Card className="p-3 border-t-4 border-t-violet-500">
              <div className="text-xs font-semibold text-violet-700 mb-1">Zone Droite</div>
              <div className="text-[9px] text-gray-500 space-y-0.5">
                <div className="font-medium text-gray-700">Instance + Utilisateur</div>
                <div>Nom instance client (ex: "Couche-Tard")</div>
                <div>Icône utilisateur → menu déroulant:</div>
                <div className="ml-2">• Mon Profil</div>
                <div className="ml-2">• Réglages Généraux</div>
                <div className="ml-2">• Réglages Agents AI (ex-sidebar)</div>
                <div className="ml-2">• FAQ (CarlOS répond)</div>
                <div className="ml-2">• Abonnement</div>
                <div className="ml-2">• Déconnexion</div>
              </div>
            </Card>
          </div>
          <div className="p-2.5 bg-blue-50 rounded-lg border border-dashed border-blue-200">
            <p className="text-[9px] text-blue-700 font-medium">
              SPRINT DÉDIÉ: La section Réglages (profil, agents AI, FAQ, abonnement) sera détaillée dans un sprint dédié.
              Éléments standards — pas réinventer la roue. CarlOS disponible en FAQ contextuelle.
            </p>
          </div>
        </div>

        {/* === 3 ZONES COLONNES === */}
        <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">3 Zones Colonnes</div>
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 border-l-4 border-l-blue-400">
            <div className="text-xs font-semibold text-blue-700 mb-1">Sidebar Gauche</div>
            <div className="text-[9px] text-gray-500 space-y-0.5">
              <div>6 sections collapsibles</div>
              <div>Navigation principale</div>
              <div>Mode collapsed = icônes</div>
              <div className="font-mono text-gray-400">SidebarLeft.tsx</div>
            </div>
          </Card>
          <Card className="p-3 border-l-4 border-l-emerald-400">
            <div className="text-xs font-semibold text-emerald-700 mb-1">Canvas Central</div>
            <div className="text-[9px] text-gray-500 space-y-0.5">
              <div>48 routes ActiveView</div>
              <div>Router conditionnel</div>
              <div>Bande couleur par bot</div>
              <div className="font-mono text-gray-400">CenterZone.tsx</div>
            </div>
          </Card>
          <Card className="p-3 border-l-4 border-l-violet-400">
            <div className="text-xs font-semibold text-violet-700 mb-1">Sidebar Droite</div>
            <div className="text-[9px] text-gray-500 space-y-0.5">
              <div>LiveChat permanent</div>
              <div>Alertes + contexte</div>
              <div>CarlOS Presence</div>
              <div className="font-mono text-gray-400">SidebarRight.tsx</div>
            </div>
          </Card>
        </div>
      </Card>

      {/* ============================================================ */}
      {/* SECTION 2 — Sidebar Gauche — 7 Sections */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-4 w-4 text-blue-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.2</span>Sidebar Gauche — 6 Sections + Réglages Top Bar</h2>
        </div>

        {/* === PATTERN UNIVERSEL DE NAVIGATION === */}
        <Card className="p-4 mb-4 bg-slate-50/50 border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Route className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-bold text-slate-800">Pattern Universel: Sidebar → Tabs Centre</span>
            <Badge className="text-[9px] bg-slate-100 text-slate-700 border-slate-200">CONVENTION</Badge>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            <strong>Réflexe gauche → droite:</strong> Chaque section master dans la sidebar gauche ouvre une vue
            dans le canvas central avec des <strong>tabs horizontaux</strong> pour ses sous-sections.
            Les sous-sections listées dans le sidebar = les mêmes tabs affichés dans le centre.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="text-[9px] font-bold text-emerald-700 uppercase">Sections avec tabs centre</div>
              <div className="text-[9px] text-gray-600 space-y-0.5">
                <div>Mon Entreprise → 5 tabs (Direction, TdC, Cockpit, Blueprint, Santé)</div>
                <div>Mon Bureau → 5 tabs (Idées, Documents, Outils, Tâches, Agenda)</div>
                <div>Mes Salles → 3 tabs (Board, War, Think Room)</div>
                <div>Mon Réseau → 7 tabs (Profil, Cellules, Jumelage, Pionniers, Gouvernance, Dashboard, Industrie)</div>
                <div>Master GHML → 4 blocs (FE, BE, RD, SA)</div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-[9px] font-bold text-violet-700 uppercase">Exception: Mon Équipe AI</div>
              <div className="text-[9px] text-gray-600 space-y-0.5">
                <div>Sidebar = liste des 11 agents AI</div>
                <div>Click agent → vue intro agent avec ses propres tabs</div>
                <div>Tabs agent: Vue d'ensemble | Pipeline | Documents | Diagnostics</div>
                <div className="italic text-gray-400">Les tabs ne sont PAS dans la sidebar mais dans la vue agent</div>
              </div>
            </div>
          </div>
        </Card>

        {/* === 2.1 Mon Entreprise (CEO + CarlOS) === */}
        <Card className="p-4 mb-4 bg-blue-50/30 border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="text-sm font-semibold text-blue-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.2.1</span>Mon Entreprise</span>
            <Badge className="text-[9px] bg-blue-100 text-blue-700 border-blue-200">NOUVEAU</Badge>
            <StatusBadge status="planifie" />
          </div>
          <p className="text-xs text-gray-500 mb-2 italic">Vue CEO — CarlOS est le OS, il gouverne tout en dessous. Carl + CarlOS au sommet.</p>
          <NavLevel>
            <NavItem icon={Crown} label="Direction (CarlOS)" viewId="department → BCO" status="live" color="text-blue-600" sub="Le CEO Bot — département Direction. CarlOS = le OS au sommet de tout." tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Layout} label="Tour de Contrôle" viewId="dashboard" status="live" color="text-blue-500" sub="Dashboard principal — 10 blocs KPI" />
            <NavItem icon={Eye} label="Cockpit" viewId="cockpit" status="live" color="text-violet-500" sub="Vue opérationnelle 360° — tous les bots" />
            <NavItem icon={Activity} label="Blueprint" viewId="blueprint" status="live" color="text-cyan-500" sub="Schéma directeur — Chantiers/Projets/Missions/Tâches" tabs={["Vue d'ensemble", "Timeline", "Chantiers", "Projets", "Missions", "Tâches", "Opportunités", "Équipes"]} />
            <NavItem icon={Activity} label="Santé Globale" viewId="health" status="live" color="text-emerald-500" sub="Métriques système, uptime, API stats" />
          </NavLevel>
        </Card>

        {/* === 2.2 Mon Bureau (workspace perso) === */}
        <Card className="p-4 mb-4 bg-indigo-50/30 border-indigo-100">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="h-4 w-4 text-indigo-600 shrink-0" />
            <span className="text-sm font-semibold text-indigo-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.2.2</span>Mon Bureau</span>
            <Badge className="text-[9px] bg-indigo-100 text-indigo-700 border-indigo-200">SectionEspaceBureau.tsx</Badge>
            <StatusBadge status="planifie" />
          </div>
          <p className="text-xs text-gray-500 mb-2 italic">Espace personnel du CEO — ressources et organisation quotidienne.</p>
          <NavLevel>
            <NavItem icon={Sparkles} label="Idées" viewId="espace-bureau → idees" status="live" color="text-amber-500" sub="Capture d'idées rapide (localStorage)" />
            <NavItem icon={FileText} label="Documents" viewId="espace-bureau → documents" status="live" color="text-blue-500" sub="Upload + PostgreSQL réel" />
            <NavItem icon={Wrench} label="Outils" viewId="espace-bureau → outils" status="live" color="text-slate-500" sub="Outils intégrés" />
            <NavItem icon={CheckSquare} label="Tâches" viewId="espace-bureau → taches" status="live" color="text-emerald-500" sub="Option C: Plane.so perso + Tâches Blueprint assignées à l'humain (liées)" />
            <NavItem icon={CalendarDays} label="Agenda" viewId="espace-bureau → agenda" status="partiel" color="text-rose-500" sub="Mock — Google Calendar à connecter" />
          </NavLevel>
          <div className="mt-3 p-2.5 bg-amber-50 rounded-lg border border-dashed border-amber-200">
            <p className="text-[9px] text-amber-700 font-medium">
              OPTION C APPROUVÉE: Les Tâches Mon Bureau seront liées aux Tâches Blueprint.
              2 sous-onglets: "Mes Tâches" (Plane.so perso) + "Tâches Projet" (Blueprint filtrées pour l'utilisateur humain).
              Sprint dédié — pas dans le sprint actuel.
            </p>
          </div>
        </Card>

        {/* === 2.3 Mes Salles (ex-Rooms) === */}
        <Card className="p-4 mb-4 bg-amber-50/30 border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <DoorOpen className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-sm font-semibold text-amber-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.2.3</span>Mes Salles (ex-Rooms, D-109)</span>
            <Badge className="text-[9px] bg-amber-100 text-amber-700 border-amber-200">SectionRooms.tsx → renommer</Badge>
          </div>
          <NavLevel>
            <NavItem icon={Crown} label="Board Room" viewId="board-room" status="live" color="text-amber-600" sub="CA robotique — décisions stratégiques" />
            <NavItem icon={AlertTriangle} label="War Room" viewId="war-room" status="live" color="text-red-500" sub="Gestion de crise — mode urgence" />
            <NavItem icon={Lightbulb} label="Think Room" viewId="think-room" status="live" color="text-amber-500" sub="Innovation — brainstorm libre" />
          </NavLevel>
          <p className="text-xs text-gray-500 mt-2 italic">Chaque Room → navigateToChat() avec chatSourceView pour retour contextuel</p>
        </Card>

        {/* === 2.4 Mon Équipe AI — 12 Départements === */}
        <Card className="p-4 mb-4 bg-violet-50/30 border-violet-100">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-violet-600 shrink-0" />
            <span className="text-sm font-semibold text-violet-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.2.4</span>Mon Équipe AI — 11 Départements</span>
            <Badge className="text-[9px] bg-violet-100 text-violet-700 border-violet-200">SectionEntreprise.tsx → renommer</Badge>
          </div>
          <p className="text-xs text-gray-500 mb-2 italic">11 C-Level bots (Direction/BCO retiré → Mon Entreprise). Blueprint retiré d'ici → Mon Entreprise.</p>
          <NavLevel>
            <NavItem icon={DollarSign} label="Finance" viewId="department → BCF" status="live" color="text-emerald-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Cpu} label="Technologie" viewId="department → BCT" status="live" color="text-violet-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Factory} label="Production" viewId="department → BFA" status="live" color="text-slate-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Settings} label="Opérations" viewId="department → BOO" status="live" color="text-orange-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={TrendingUp} label="Ventes" viewId="department → BRO" status="live" color="text-amber-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Megaphone} label="Marketing" viewId="department → BCM" status="live" color="text-pink-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Target} label="Stratégie" viewId="department → BCS" status="live" color="text-red-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Users} label="RH" viewId="department → BHR" status="live" color="text-teal-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Shield} label="Sécurité" viewId="department → BSE" status="live" color="text-zinc-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Scale} label="Légal" viewId="department → BLE" status="live" color="text-indigo-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
            <NavItem icon={Lightbulb} label="Innovation" viewId="department → BIO" status="live" color="text-rose-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
          </NavLevel>
        </Card>

        {/* === 2.5 Mon Réseau — Centre Nerveux Orbit9 (7 tabs) === */}
        <Card className="p-4 mb-4 bg-orange-50/30 border-orange-100">
          <div className="flex items-center gap-2 mb-3">
            <Network className="h-4 w-4 text-orange-600 shrink-0" />
            <span className="text-sm font-semibold text-orange-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.2.5</span>Mon Réseau — Centre Nerveux Orbit9</span>
            <Badge className="text-[9px] bg-orange-100 text-orange-700 border-orange-200">7 tabs — Réseau élite augmenté AI</Badge>
          </div>
          <p className="text-xs text-gray-500 mb-2 italic">
            Réseau élite de collaborateurs vérifiés. Pas n'importe qui entre — processus de sélection rigoureux (inspiré REAI).
            CarlOS = médiateur proactif entre membres. Meetings sur la plateforme, interventions temps réel.
          </p>

          {/* ——— TAB 1: MON PROFIL RÉSEAU ——— */}
          <div className="mt-3 mb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">TAB 1</span>
              <span className="text-xs font-bold text-gray-800">Mon Profil Réseau</span>
              <span className="text-[9px] text-gray-400">— Crédibilité = monnaie d'échange</span>
            </div>
          </div>
          <NavLevel>
            <NavItem icon={User} label="Fiche Entreprise" viewId="orbit9 → profil → fiche" status="planifie" color="text-sky-600" sub="CV entreprise vérifié: nom, secteur, spécialités, taille, stade Orbit9, VITAA score" />
            <NavItem icon={Shield} label="Certifications & Sceaux" viewId="orbit9 → profil → certifications" status="planifie" color="text-emerald-600" sub="ISO, RBQ, HACCP, C-TPAT, MEI, licences — validées par CarlOS via documents. Chaque sceau = confiance accrue" />
            <NavItem icon={TrendingUp} label="Score Réputation" viewId="orbit9 → profil → reputation" status="planifie" color="text-amber-600" sub="Calculé sur: collaborations terminées, avis vérifiés, respect engagements, délais, qualité. Visible aux partenaires potentiels" />
            <NavItem icon={Eye} label="Avis & Références" viewId="orbit9 → profil → avis" status="planifie" color="text-violet-500" sub="Avis vérifiés post-collaboration. Étoiles + commentaire. Confiance bidirectionnelle: donneur d'ordre ET fournisseur se notent mutuellement" />
            <NavItem icon={Settings} label="Visibilité & Contrôle" viewId="orbit9 → profil → visibilite" status="planifie" color="text-gray-600" sub="Contrôle ce que les autres voient AVANT matching. Données privées révélées seulement après accord mutuel — dating professionnel progressif" />
          </NavLevel>

          {/* ——— PROCESSUS DE SÉLECTION RIGOUREUX ——— */}
          <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-orange-700" />
              <span className="text-xs font-bold text-orange-800">Processus de Sélection Rigoureux (inspiré REAI)</span>
            </div>
            <p className="text-[9px] text-gray-600 mb-2 italic">
              Réseau élite augmenté AI — on ne prend pas n'importe qui. La crédibilité est la monnaie d'échange.
              Même les fournisseurs invités gratuitement passent par le processus complet.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white/80 rounded border border-orange-100">
                <div className="text-[9px] font-bold text-orange-700 mb-1">1. INVITATION & QUALIFICATION AUTO</div>
                <div className="text-[9px] text-gray-600">
                  Client UB a besoin d'un fournisseur → CarlOS invite le prospect gratuitement →
                  Le prospect démarre le processus de qualification automatisé par AI.
                </div>
              </div>
              <div className="p-2 bg-white/80 rounded border border-orange-100">
                <div className="text-[9px] font-bold text-orange-700 mb-1">2. VALIDATION AI</div>
                <div className="text-[9px] text-gray-600">
                  CarlOS valide automatiquement: réputation web (Google Reviews, LinkedIn, NEQ),
                  références vérifiables, certifications documentées, historique litiges, santé financière.
                </div>
              </div>
              <div className="p-2 bg-white/80 rounded border border-orange-100">
                <div className="text-[9px] font-bold text-orange-700 mb-1">3. CRITÈRES D'ADMISSION (style REAI)</div>
                <div className="text-[9px] text-gray-600">
                  ✓ Entreprise active 2+ ans · ✓ Assurances valides · ✓ Aucun litige majeur ouvert ·
                  ✓ Minimum 1 certification pertinente · ✓ Références vérifiées (2+) · ✓ Engagement charte réseau
                </div>
              </div>
              <div className="p-2 bg-white/80 rounded border border-orange-100">
                <div className="text-[9px] font-bold text-orange-700 mb-1">4. ADMISSION & ONBOARDING</div>
                <div className="text-[9px] text-gray-600">
                  Score de qualification calculé → Profil créé avec sceaux vérifiés →
                  Accès au réseau → CarlOS assigne comme agent personnel → Premier jumelage possible.
                </div>
              </div>
            </div>
            <div className="mt-2 p-1.5 bg-orange-100/50 rounded">
              <p className="text-[9px] text-orange-800 font-medium text-center">
                STRATÉGIE ACQUISITION: Le fournisseur invité gratuitement découvre CarlOS → devient client lui-même → invite SES fournisseurs → flywheel
              </p>
            </div>
          </div>

          {/* ——— TAB 2: MES CELLULES ——— */}
          <div className="mt-4 mb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">TAB 2</span>
              <span className="text-xs font-bold text-gray-800">Mes Cellules</span>
              <span className="text-[9px] text-gray-400">— Drill-down imbriqué + Opportunités</span>
            </div>
          </div>
          <NavLevel>
            <NavItem icon={Handshake} label="Mes Cellules Actives" viewId="orbit9 → cellules" status="live" color="text-emerald-600" sub="Groupes de 3 entreprises complémentaires. Drill-down: Cellule → Chantiers → Projets → Missions → Tâches. Même hiérarchie que Blueprint interne" />
            <NavItem icon={Sparkles} label="Opportunités" viewId="orbit9 → cellules → opportunites" status="planifie" color="text-amber-500" sub="Missions ouvertes dans le réseau, besoins détectés par CarlOS, appels d'offres internes. Aussi visible sur Tour de Contrôle (widget)" />
            <NavItem icon={MessageSquare} label="Meetings Cellule" viewId="orbit9 → cellules → meetings" status="planifie" color="text-blue-500" sub="Meetings SUR la plateforme (LiveKit). CarlOS = médiateur proactif: transcription live, détection tensions, interventions temps réel, action items auto-générés" />
            <NavItem icon={BarChart3} label="Performance Cellule" viewId="orbit9 → cellules → performance" status="planifie" color="text-indigo-500" sub="Heures sauvées par CarlOS, livrables à temps, ROI par chantier, score confiance inter-membres" />
          </NavLevel>

          {/* ——— TAB 3: JUMELAGE ——— */}
          <div className="mt-4 mb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">TAB 3</span>
              <span className="text-xs font-bold text-gray-800">Jumelage</span>
              <span className="text-[9px] text-gray-400">— ACTION: Pipeline CarlOS → Cahier → Expert → Contrat</span>
            </div>
          </div>
          <NavLevel>
            <NavItem icon={Sparkles} label="Détection CarlOS" viewId="orbit9 → jumelage → detection" status="planifie" color="text-amber-500" sub="CarlOS détecte le bon moment (diagnostic VITAA, conversations, besoin identifié). Propose le jumelage quand le client est prêt" />
            <NavItem icon={FileText} label="Qualification & Upload" viewId="orbit9 → jumelage → qualification" status="planifie" color="text-blue-600" sub="CarlOS demande le kit complet: specs, budgets, dessins, échéancier. Évalue si tout est en main. 'Il te manque X' ou 'T'es complet'" />
            <NavItem icon={BookOpen} label="Cahier de Jumelage" viewId="orbit9 → jumelage → cahier" status="planifie" color="text-violet-600" sub="CarlOS génère le document structuré pour le fournisseur. Cahier pro = contrat pro. Qualité du cahier = qualité du résultat" />
            <NavItem icon={CheckCircle2} label="Validation Expert" viewId="orbit9 → jumelage → validation" status="planifie" color="text-emerald-600" sub="Expert humain valide le cahier avant envoi. Contrôle qualité final. Le réseau élite ne laisse rien passer de broche-à-foin" />
            <NavItem icon={Handshake} label="Match & Contrat" viewId="orbit9 → jumelage → match" status="planifie" color="text-green-600" sub="Rencontre organisée par CarlOS → Négociation assistée → Contrat réel signé. CarlOS reste médiateur pendant toute l'exécution" />
          </NavLevel>
          <div className="mt-2 p-2 bg-amber-50 rounded border border-dashed border-amber-200">
            <p className="text-[9px] text-amber-800 font-medium">
              FLOW ACTION: CarlOS détecte → Qualification kit → Cahier généré → Expert valide → Match → Contrat signé → CarlOS médie l'exécution.
              Chaque étape visible dans le pipeline. Le fournisseur invité gratuitement entre par ici.
            </p>
          </div>

          {/* ——— TAB 4: PIONNIERS ——— */}
          <div className="mt-4 mb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">TAB 4</span>
              <span className="text-xs font-bold text-gray-800">Pionniers</span>
              <span className="text-[9px] text-gray-400">— Mouvement AI + Franchise Intelligente</span>
            </div>
          </div>
          <NavLevel>
            <NavItem icon={Crown} label="Mouvement Pionniers AI" viewId="orbit9 → pionniers → mouvement" status="planifie" color="text-violet-600" sub="Leaders de l'automatisation du Québec qui prennent le virage AI avec CarlOS. Même les intégrateurs ont besoin du virage" />
            <NavItem icon={Rocket} label="Franchise Intelligente" viewId="orbit9 → pionniers → franchise" status="planifie" color="text-orange-600" sub="Modèle: intégrateur rejoint → reçoit CarlOS pour SES clients → ses clients embarquent → réseau grossit de l'intérieur. Scale sans vendre direct" />
            <NavItem icon={Users} label="Programme Partenaires" viewId="orbit9 → pionniers → partenaires" status="planifie" color="text-sky-600" sub="Onboarding partenaires-intégrateurs: formation CarlOS, certification, outils de vente, territoire, revenus partagés" />
            <NavItem icon={TrendingUp} label="Tableau Pionniers" viewId="orbit9 → pionniers → tableau" status="planifie" color="text-emerald-600" sub="Classement des pionniers actifs, contributions au réseau, cellules créées, valeur générée. Reconnaissance publique" />
          </NavLevel>

          {/* ——— TAB 5: GOUVERNANCE ——— */}
          <div className="mt-4 mb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">TAB 5</span>
              <span className="text-xs font-bold text-gray-800">Gouvernance</span>
              <span className="text-[9px] text-gray-400">— Règles du réseau élite</span>
            </div>
          </div>
          <NavLevel>
            <NavItem icon={Scale} label="Charte du Réseau" viewId="orbit9 → gouvernance → charte" status="planifie" color="text-slate-700" sub="Engagement qualité, respect des délais, confidentialité, résolution conflits. Signée à l'admission" />
            <NavItem icon={Shield} label="Standards Qualité" viewId="orbit9 → gouvernance → standards" status="planifie" color="text-emerald-600" sub="Seuils minimaux: certifications, assurances, historique, comportement réseau. Réévaluation annuelle" />
            <NavItem icon={AlertTriangle} label="Litiges & Sanctions" viewId="orbit9 → gouvernance → litiges" status="planifie" color="text-red-500" sub="Processus résolution: CarlOS médiation → Comité → Avertissement → Suspension → Exclusion. Tolérance zéro comportement toxique" />
          </NavLevel>

          {/* ——— TAB 6: DASHBOARD ——— */}
          <div className="mt-4 mb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">TAB 6</span>
              <span className="text-xs font-bold text-gray-800">Dashboard Réseau</span>
              <span className="text-[9px] text-gray-400">— ROI, heures sauvées, santé cellules</span>
            </div>
          </div>
          <NavLevel>
            <NavItem icon={BarChart3} label="Métriques Réseau" viewId="orbit9 → dashboard → metriques" status="planifie" color="text-blue-600" sub="Membres actifs, cellules formées, chantiers en cours, valeur totale générée, contrats signés ce mois" />
            <NavItem icon={Gauge} label="ROI & Temps Sauvé" viewId="orbit9 → dashboard → roi" status="planifie" color="text-emerald-600" sub="Heures sauvées par CarlOS (médiations, interventions proactives), coûts évités (retards interceptés), valeur des contrats facilités" />
            <NavItem icon={Activity} label="Santé des Cellules" viewId="orbit9 → dashboard → sante" status="planifie" color="text-orange-500" sub="Score santé par cellule: communication, livrables, tensions, satisfaction. Triangle du Feu appliqué aux collaborations" />
          </NavLevel>

          {/* ——— TAB 7: INDUSTRIE ——— */}
          <div className="mt-4 mb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">TAB 7</span>
              <span className="text-xs font-bold text-gray-800">Industrie</span>
              <span className="text-[9px] text-gray-400">— Nouvelles + Événements + Veille (3-en-1)</span>
            </div>
          </div>
          <NavLevel>
            <NavItem icon={Newspaper} label="Nouvelles" viewId="orbit9 → industrie → nouvelles" status="live" color="text-blue-500" sub="Fil d'actualité sectoriel automatisation, robotique, IA industrielle" />
            <NavItem icon={Calendar} label="Événements" viewId="orbit9 → industrie → evenements" status="live" color="text-rose-500" sub="Calendrier industrie: salons, formations, webinaires, meetups REAI" />
            <NavItem icon={Globe} label="Veille Industrie" viewId="orbit9 → industrie → veille" status="live" color="text-indigo-500" sub="Vue macro: tendances sectorielles, subventions disponibles, réglementations, signaux marché" />
          </NavLevel>

          {/* ——— NOTE ARCHITECTURALE ——— */}
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-dashed border-orange-200">
            <p className="text-[9px] text-orange-700 font-medium leading-relaxed">
              ARCHITECTURE: Même frame que Blueprint (RD.7) — Cellule → Chantiers → Projets → Missions → Tâches (drill-down imbriqué).
              CarlOS = médiateur proactif dans CHAQUE interaction entre membres (meetings live, détection tensions, action items auto).
              Processus de sélection rigoureux inspiré REAI — réseau élite, pas n'importe qui entre.
              Stratégie acquisition: invitation gratuite fournisseur → qualification AI → découvre CarlOS → devient client → invite SES fournisseurs → flywheel.
              Widget Opportunités aussi sur Tour de Contrôle pour ne rien rater.
              Modélisé en détail dans RD.8 Blueprint Réseau.
            </p>
          </div>
        </Card>

        {/* === 2.6 Master GHML === */}
        <Card className="p-4 mb-4 bg-purple-50/30 border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-purple-600 shrink-0" />
            <span className="text-sm font-semibold text-purple-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.2.6</span>Master GHML — 32 Sous-sections</span>
            <Badge className="text-[9px] bg-purple-100 text-purple-700 border-purple-200">SectionMasterGHML.tsx</Badge>
          </div>
          <NavLevel>
            <NavItem icon={BookOpen} label="Bible Visuelle" viewId="bible-visuelle" status="live" color="text-indigo-500" />
            <NavItem icon={Server} label="Bible Technique" viewId="bible-technique" status="live" color="text-emerald-500" />
            <NavItem icon={Atom} label="Bible GHML" viewId="bible-ghml" status="live" color="text-violet-500" />
            <NavItem icon={Map} label="Roadmap & Décisions" viewId="master-roadmap" status="live" color="text-amber-500" />
            <NavItem icon={Rocket} label="Stratégie & Lancement" viewId="master-strategie" status="live" color="text-red-500" />
            <NavItem icon={Network} label="Orbit9 & Réseau" viewId="master-orbit9" status="live" color="text-orange-500" />
            <NavItem icon={Radio} label="Stack Communication" viewId="master-communication" status="live" color="text-teal-500" />
            <NavItem icon={AlertTriangle} label="Dette Technique" viewId="master-dette" status="live" color="text-rose-500" />
            <NavItem icon={Shield} label="Routine & Flow" viewId="master-routine" status="live" color="text-cyan-500" />
            <NavItem icon={Gem} label="Mine d'Or & Data" viewId="master-minedor" status="live" color="text-yellow-500" />
            <NavItem icon={GraduationCap} label="Entraînement Agents" viewId="master-training" status="live" color="text-purple-500" />
            <NavItem icon={Users} label="Profils & Démos" viewId="master-profils" status="live" color="text-sky-500" />
            <NavItem icon={Route} label="Parcours Client" viewId="master-parcours" status="live" color="text-pink-500" />
            <NavItem icon={Gauge} label="Capacités & ROI" viewId="master-capacites" status="live" color="text-blue-600" />
            <NavItem icon={Map} label="Structure Navigation" viewId="master-navigation" status="live" color="text-slate-600" sub="Cette page (méta-navigation)" />
          </NavLevel>
        </Card>

        {/* === 2.8 Réglages — DÉPLACÉ vers Top Bar droite === */}
        <Card className="p-4 bg-gray-50/50 border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-gray-600 shrink-0" />
            <span className="text-sm font-semibold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.2.7</span>Réglages</span>
            <Badge className="text-[9px] bg-amber-100 text-amber-700 border-amber-200">DÉPLACÉ → Top Bar droite</Badge>
          </div>
          <p className="text-xs text-gray-500 mb-2 italic">Les réglages sont maintenant accessibles via l'icône utilisateur dans la Top Bar (zone droite).</p>
          <NavLevel>
            <NavItem icon={User} label="Mon Profil" status="planifie" color="text-gray-500" sub="Informations personnelles, photo, préférences" />
            <NavItem icon={Settings} label="Réglages Généraux" status="planifie" color="text-gray-500" sub="Paramètres de l'instance, notifications" />
            <NavItem icon={Settings} label="Réglages Agents AI" viewId="agent-settings" status="live" color="text-violet-500" sub="Configuration voix, modèles, comportement (ex-sidebar)" />
            <NavItem icon={HelpCircle} label="FAQ CarlOS" status="planifie" color="text-blue-500" sub="CarlOS répond aux questions — guide contextuel" />
          </NavLevel>
          <div className="mt-3 p-2.5 bg-blue-50 rounded-lg border border-dashed border-blue-200">
            <p className="text-[9px] text-blue-700 font-medium">
              SPRINT DÉDIÉ: Détailler le contenu exact des réglages (standards).
              Ne pas réinventer la roue — éléments de base classiques.
              Retirer le bouton "Mes Réglages" fixe en bas de la sidebar gauche.
            </p>
          </div>
        </Card>
      </Card>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 3 — Routes Core (hors sidebar) */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="h-4 w-4 text-emerald-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.3</span>Routes Core (canvas principal)</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Routes accessibles par clic direct (dashboard blocks, boutons) — pas dans la sidebar.
        </p>
        <NavLevel>
          <NavItem icon={Layout} label="Dashboard" viewId="dashboard" status="live" color="text-blue-500" sub="Page d'accueil — 10 blocs KPI cliquables → navigation directe" />
          <NavItem icon={Eye} label="Cockpit" viewId="cockpit" status="live" color="text-violet-500" sub="Vue opérationnelle 360° — tous les bots en un coup d'oeil" />
          <NavItem icon={Activity} label="Santé" viewId="health" status="live" color="text-emerald-500" sub="Métriques système, uptime, API stats" />
          <NavItem icon={MessageSquare} label="LiveChat" viewId="live-chat" status="live" color="text-indigo-500" sub="Chat centré (aussi dans sidebar droite) — branches, perspectives, sentinelle" />
          <NavItem icon={FileText} label="Cahier Smart" viewId="cahier" status="live" color="text-amber-500" sub="Cahier de projet interactif — données entreprise réelles" />
          <NavItem icon={GitBranch} label="Branch Patterns" viewId="branches" status="live" color="text-pink-500" sub="Démo des patterns de branches conversationnelles" />
          <NavItem icon={Rocket} label="Scénarios" viewId="scenarios" status="live" color="text-red-500" sub="Hub de scénarios de démonstration" />
          <NavItem icon={Monitor} label="Smart Canvas" viewId="canvas" status="live" color="text-teal-500" sub="Canvas interactif — push_content depuis vocal/chat" />
        </NavLevel>
      </Card>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 4 — Dashboard → Action Map */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ArrowRight className="h-4 w-4 text-blue-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.4</span>Dashboard — Carte d'Actions</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Chaque bloc du Dashboard est cliquable et mène à une vue spécifique.
        </p>

        <div className="space-y-2">
          {[
            { bloc: "Bloc CEO (Direction)", target: "department → BCO", icon: Briefcase, color: "text-blue-500" },
            { bloc: "Bloc CFO (Finance)", target: "department → BCF", icon: DollarSign, color: "text-emerald-500" },
            { bloc: "Bloc CTO (Technologie)", target: "department → BCT", icon: Cpu, color: "text-violet-500" },
            { bloc: "Bloc CMO (Marketing)", target: "department → BCM", icon: Megaphone, color: "text-pink-500" },
            { bloc: "Bloc CSO (Stratégie)", target: "department → BCS", icon: Target, color: "text-red-500" },
            { bloc: "Mes Priorités", target: "mes-chantiers → chantiers", icon: Flame, color: "text-orange-500" },
            { bloc: "Pipeline Vente", target: "mes-chantiers → missions", icon: TrendingUp, color: "text-green-500" },
            { bloc: "Mes Projets", target: "mes-chantiers → projets", icon: FolderKanban, color: "text-indigo-500" },
            { bloc: "Mon Réseau", target: "orbit9-detail → marketplace", icon: Network, color: "text-amber-500" },
            { bloc: "Mon Blue Print", target: "blueprint → live", icon: Activity, color: "text-cyan-500" },
          ].map((a) => (
            <div key={a.bloc} className="flex items-center gap-3 py-1.5">
              <a.icon className={cn("h-4 w-4 shrink-0", a.color)} />
              <span className="text-sm text-gray-800 w-40">{a.bloc}</span>
              <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
              <code className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded">{a.target}</code>
            </div>
          ))}
        </div>
      </Card>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 5 — Context State Variables */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-4 w-4 text-violet-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.5</span>FrameMasterContext — State Variables</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Toute la navigation est pilotée par React Context (pas d'URL routing). Fichier source :
          <code className="text-xs bg-gray-100 px-1 rounded ml-1">FrameMasterContext.tsx</code>
        </p>

        <div className="space-y-2">
          {CONTEXT_VARS.map((v) => (
            <div key={v.name} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
              <code className="text-xs font-mono text-violet-600 bg-violet-50 px-2 py-0.5 rounded shrink-0 mt-0.5">{v.name}</code>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 font-mono">{v.type}</span>
                  <Badge className="text-[9px] bg-gray-100 text-gray-500 border-gray-200">{v.scope}</Badge>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ============================================================ */}
      {/* SECTION 6 — Navigation Methods */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ChevronRight className="h-4 w-4 text-teal-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.6</span>Méthodes de Navigation</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          10 méthodes exposées par FrameMasterContext pour naviguer entre les vues.
        </p>

        <div className="space-y-2">
          {NAV_METHODS.map((m) => (
            <div key={m.name} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
              <div className="shrink-0 mt-0.5">
                <code className="text-xs font-mono text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{m.name}</code>
              </div>
              <div className="flex-1 min-w-0">
                <code className="text-[9px] text-gray-400 font-mono">{m.signature}</code>
                <p className="text-xs text-gray-600 mt-0.5">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 7 — Bot Identity Colors */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-4 w-4 text-pink-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.7</span>Identité Visuelle — 12 Bots</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Chaque bot a une couleur unique utilisée pour la bande du canvas, la sidebar, et les gradient headers.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BOT_COLORS.map((b) => (
            <div key={b.code} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100">
              <div className={cn("w-6 h-6 rounded-md", b.band)} />
              <div>
                <code className="text-xs font-mono font-semibold text-gray-700">{b.code}</code>
                <div className="text-[9px] text-gray-500">{b.role}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 8 — Couches d'Instances */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-indigo-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.8</span>Couches d'Instances (Multi-Tenant)</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Architecture prévue pour supporter N instances (1 par entreprise/CEO).
          Actuellement: instance unique "Usine Bleue".
        </p>

        <div className="space-y-3">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="text-sm font-semibold text-blue-800 mb-1"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.8.1</span>Couche 1 — Instance Entreprise</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 1 instance = 1 entreprise = 1 CEO</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Kit entreprise chargé au login (usine-bleue.json)</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 12 départements + data KPI par instance</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> SOULs personnalisées par instance (14 fichiers)</div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-emerald-500">
            <div className="text-sm font-semibold text-emerald-800 mb-1"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.8.2</span>Couche 2 — Réseau Orbit9</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Cross-instance: Marketplace, Cellules, Jumelage</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> orbit9_members + orbit9_cellules + orbit9_matches (PostgreSQL)</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Matching scoring Gemini Flash + trisociation LiveKit</div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-violet-500">
            <div className="text-sm font-semibold text-violet-800 mb-1"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.8.3</span>Couche 3 — Plateforme GhostX</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5 text-violet-500" /> Templates partagés (141 templates, 12 départements)</div>
              <div className="flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5 text-violet-500" /> GHML Engine commun (tableau périodique, protocoles)</div>
              <div className="flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5 text-violet-500" /> Routage IA 5-tiers partagé entre instances</div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-amber-500">
            <div className="text-sm font-semibold text-amber-800 mb-1"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.8.4</span>Couche 4 — Industrie (TRG)</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5 text-amber-500" /> Nouvelles sectorielles partagées</div>
              <div className="flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5 text-amber-500" /> Événements industrie (calendrier commun)</div>
              <div className="flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5 text-amber-500" /> Dashboard industrie agrégé</div>
            </div>
          </Card>
        </div>
      </Card>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 9 — Flow Diagram */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="h-4 w-4 text-lime-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.9</span>Arborescence Complète</h2>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs text-gray-700 overflow-x-auto whitespace-pre leading-relaxed">
{`TOP BAR — BARRE SUPÉRIEURE (fixe, pleine largeur)
│
├─ [GAUCHE]  Logo instance client → click = Tour de Contrôle
├─ [CENTRE]  Niveau Entreprise CEO + CarlOS
│  ├─ Tour de Contrôle    → dashboard
│  ├─ Cockpit             → cockpit
│  ├─ Blueprint           → blueprint
│  └─ Santé Globale       → health
└─ [DROITE]  Instance + Utilisateur
   ├─ Nom instance (ex: "Couche-Tard")
   └─ Icône utilisateur → menu:
      ├─ Mon Profil, Réglages Généraux, Réglages Agents AI
      ├─ FAQ (CarlOS répond), Abonnement, Déconnexion
      └─ (Sprint dédié — éléments standards)

PATTERN: Sidebar click → Canvas centre avec TABS (gauche → droite)
Exception: Mon Équipe AI → tabs dans la vue agent, pas dans sidebar

SIDEBAR GAUCHE — 6 SECTIONS
│
├─ [1] MON ENTREPRISE (CEO + CarlOS = le OS)
│  ├─ tabs centre: Direction | TdC | Cockpit | Blueprint | Santé
│  ├─ Direction (CarlOS)  → department → BCO (le OS au sommet)
│  ├─ Tour de Contrôle    → dashboard (10 blocs KPI)
│  ├─ Cockpit             → cockpit (360° tous bots)
│  ├─ Blueprint           → blueprint / playbook-usine-bleue
│  │  └─ 8 tabs: Vue d'ensemble | Timeline | Chantiers | Projets | Missions | Tâches | Opportunités | Équipes
│  └─ Santé Globale       → health
│
├─ [2] MON BUREAU (workspace perso)
│  ├─ tabs centre: Idées | Documents | Outils | Tâches | Agenda
│  ├─ Idées               → espace-bureau → idees
│  ├─ Documents            → espace-bureau → documents (PostgreSQL)
│  ├─ Outils              → espace-bureau → outils
│  ├─ Tâches              → espace-bureau → taches
│  │  ├─ Mes Tâches       (Plane.so perso)
│  │  └─ Tâches Projet    (Blueprint filtrées — Option C)
│  └─ Agenda              → espace-bureau → agenda
│
├─ [3] MES SALLES (ex-Rooms, D-109)
│  ├─ tabs centre: Board Room | War Room | Think Room
│  ├─ Board Room          → board-room (CA robotique)
│  ├─ War Room            → war-room (gestion de crise)
│  └─ Think Room          → think-room (brainstorm)
│
├─ [4] MON ÉQUIPE AI (11 agents — EXCEPTION: tabs dans vue agent)
│  ├─ sidebar = liste 11 agents AI (click → vue agent)
│  ├─ Finance (BCF)       → department + 4 tabs agent
│  ├─ Technologie (BCT)   → department + 4 tabs agent
│  ├─ Production (BFA)    → department + 4 tabs agent
│  ├─ Opérations (BOO)    → department + 4 tabs agent
│  ├─ Ventes (BRO)        → department + 4 tabs agent
│  ├─ Marketing (BCM)     → department + 4 tabs agent
│  ├─ Stratégie (BCS)     → department + 4 tabs agent
│  ├─ RH (BHR)            → department + 4 tabs agent
│  ├─ Sécurité (BSE)      → department + 4 tabs agent
│  ├─ Légal (BLE)         → department + 4 tabs agent
│  └─ Innovation (BIO)    → department + 4 tabs agent
│     └─ 4 tabs par agent: Vue d'ensemble | Pipeline | Documents | Diagnostics
│
├─ [5] MON RÉSEAU — Centre Nerveux Orbit9 (réseau élite augmenté AI)
│  ├─ 7 tabs: Profil | Cellules | Jumelage | Pionniers | Gouvernance | Dashboard | Industrie
│  ├─ [T1] Mon Profil     → CV entreprise vérifié, certifications, sceaux, réputation, visibilité
│  │  └─ Processus sélection rigoureux (inspiré REAI): qualification AI auto + critères admission élite
│  ├─ [T2] Mes Cellules   → drill-down Cellule → Chantiers → Projets → Missions + Opportunités + Meetings live + Performance
│  │  └─ CarlOS = médiateur proactif: transcription, détection tensions, interventions temps réel
│  ├─ [T3] Jumelage       → ACTION: Détection CarlOS → Upload kit → Cahier généré → Expert valide → Match → Contrat signé
│  ├─ [T4] Pionniers      → Mouvement AI Québec, franchise intelligente, programme partenaires-intégrateurs, tableau pionniers
│  ├─ [T5] Gouvernance    → Charte réseau, standards qualité, litiges & sanctions
│  ├─ [T6] Dashboard      → ROI, heures sauvées (CarlOS médiations), santé cellules, valeur contrats
│  └─ [T7] Industrie      → Nouvelles + Événements + Veille (3-en-1)
│
└─ [6] MASTER GHML (dev — 32 sous-sections)
   └─ FE (8) + BE (10) + RD (8) + SA (8)

ROUTES CANVAS ADDITIONNELLES (hors sidebar):
├─ live-chat    → LiveChat (centré ou sidebar droite)
├─ cahier       → CahierSmartDemo
├─ branches     → BranchPatternsDemo
├─ scenarios    → ScenarioHub
└─ canvas       → SmartCanvas`}
        </div>
      </Card>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 10 — Fichiers Source */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-gray-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900"><span className="text-[9px] font-bold text-gray-400 mr-1">C.2.10</span>Fichiers Source Clés</h2>
        </div>

        <div className="space-y-2">
          {[
            { file: "FrameMasterContext.tsx", desc: "State global — ActiveView, navigation methods, 12 variables", lines: "~200" },
            { file: "CenterZone.tsx", desc: "Router central — 48 routes conditionnelles", lines: "~350" },
            { file: "SidebarLeft.tsx", desc: "Sidebar gauche — 7 sections collapsibles", lines: "~100" },
            { file: "TopBar.tsx", desc: "Top Bar — Logo + Nav CEO + Instance/User (À CRÉER)", lines: "~80" },
            { file: "SectionEspaceBureau.tsx", desc: "Mon Espace → à renommer Mon Entreprise + Mon Bureau", lines: "~120" },
            { file: "SectionRooms.tsx", desc: "Mes Rooms — Board/War/Think", lines: "~60" },
            { file: "SectionEntreprise.tsx", desc: "Mon Équipe — 12 départements + Blueprint", lines: "~80" },
            { file: "SectionOrbit9.tsx", desc: "Mon Réseau — 5 sections Orbit9", lines: "~60" },
            { file: "SectionTrgIndustries.tsx", desc: "Mon Industrie — 3 sections TRG", lines: "~50" },
            { file: "SectionMasterGHML.tsx", desc: "Master GHML — 18 sous-sections", lines: "~130" },
          ].map((f) => (
            <div key={f.file} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
              <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded shrink-0">{f.file}</code>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600">{f.desc}</p>
              </div>
              <span className="text-[9px] text-gray-400 shrink-0">{f.lines} lignes</span>
            </div>
          ))}
        </div>
      </Card>

    </PageLayout>
  );
}
