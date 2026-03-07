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
  Radio, GitBranch, Gem, GraduationCap, Route, ScrollText,
  ChevronRight, ArrowRight, CheckCircle2, Monitor, Smartphone,
  MessageSquare, FileText, FolderKanban, Flame, Wrench,
  CheckSquare, CalendarDays, DoorOpen, Cpu, Eye,
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
  { label: "Sections Sidebar", value: "7", color: "violet" },
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
        subtitle="Arborescence complète de la plateforme CarlOS — 48 routes, 7 sections sidebar, 20+ sous-tabs"
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
          <h2 className="text-base font-semibold text-gray-900">1. Architecture 3 Zones</h2>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          L'interface CarlOS suit un layout 3 colonnes fixe. La zone centrale est le canvas principal,
          contrôlé par <code className="text-xs bg-gray-100 px-1 rounded">activeView</code> dans FrameMasterContext.
        </p>

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 border-l-4 border-l-blue-400">
            <div className="text-xs font-semibold text-blue-700 mb-1">Sidebar Gauche</div>
            <div className="text-[9px] text-gray-500 space-y-0.5">
              <div>7 sections collapsibles</div>
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
          <h2 className="text-base font-semibold text-gray-900">2. Sidebar Gauche — 7 Sections</h2>
        </div>

        {/* === 2.1 Mon Espace === */}
        <Card className="p-4 mb-4 bg-blue-50/30 border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="text-sm font-semibold text-blue-800">2.1 Mon Espace</span>
            <Badge className="text-[9px] bg-blue-100 text-blue-700 border-blue-200">SectionEspaceBureau.tsx</Badge>
          </div>
          <NavLevel>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Pipeline</div>
            <NavItem icon={MessageSquare} label="Discussions" viewId="mes-chantiers → discussions" status="live" color="text-violet-500" sub="Conversations organisées par sujet" />
            <NavItem icon={Target} label="Missions" viewId="mes-chantiers → missions" status="live" color="text-green-500" sub="Missions COMMAND actives" />
            <NavItem icon={FolderKanban} label="Projets" viewId="mes-chantiers → projets" status="live" color="text-indigo-500" sub="Projets en cours (PostgreSQL)" />
            <NavItem icon={Flame} label="Chantiers" viewId="mes-chantiers → chantiers" status="live" color="text-red-500" sub="Chantiers stratégiques avec chaleur" />
          </NavLevel>
          <NavLevel>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 mt-3">Ressources</div>
            <NavItem icon={Sparkles} label="Idées" viewId="espace-bureau → idees" status="live" color="text-amber-500" sub="Capture d'idées rapide" />
            <NavItem icon={FileText} label="Documents" viewId="espace-bureau → documents" status="live" color="text-blue-500" sub="Upload + PostgreSQL réel" />
            <NavItem icon={Wrench} label="Outils" viewId="espace-bureau → outils" status="live" color="text-slate-500" sub="Outils intégrés" />
            <NavItem icon={CheckSquare} label="Tâches" viewId="espace-bureau → taches" status="live" color="text-emerald-500" sub="Plane.so API" />
            <NavItem icon={CalendarDays} label="Agenda" viewId="espace-bureau → agenda" status="partiel" color="text-rose-500" sub="Mock — Google Calendar à connecter" />
          </NavLevel>
        </Card>

        {/* === 2.2 Mes Rooms === */}
        <Card className="p-4 mb-4 bg-amber-50/30 border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <DoorOpen className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-sm font-semibold text-amber-800">2.2 Mes Rooms (D-109)</span>
            <Badge className="text-[9px] bg-amber-100 text-amber-700 border-amber-200">SectionRooms.tsx</Badge>
          </div>
          <NavLevel>
            <NavItem icon={Crown} label="Board Room" viewId="board-room" status="live" color="text-amber-600" sub="CA robotique — décisions stratégiques" />
            <NavItem icon={AlertTriangle} label="War Room" viewId="war-room" status="live" color="text-red-500" sub="Gestion de crise — mode urgence" />
            <NavItem icon={Lightbulb} label="Think Room" viewId="think-room" status="live" color="text-amber-500" sub="Innovation — brainstorm libre" />
          </NavLevel>
          <p className="text-xs text-gray-500 mt-2 italic">Chaque Room → navigateToChat() avec chatSourceView pour retour contextuel</p>
        </Card>

        {/* === 2.3 Mon Équipe === */}
        <Card className="p-4 mb-4 bg-violet-50/30 border-violet-100">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-violet-600 shrink-0" />
            <span className="text-sm font-semibold text-violet-800">2.3 Mon Équipe — 12 Départements</span>
            <Badge className="text-[9px] bg-violet-100 text-violet-700 border-violet-200">SectionEntreprise.tsx</Badge>
          </div>
          <NavLevel>
            <NavItem icon={Briefcase} label="Direction" viewId="department → BCO" status="live" color="text-blue-500" tabs={["Vue d'ensemble", "Pipeline", "Documents", "Diagnostics"]} />
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
          <NavLevel>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 mt-3">Bonus</div>
            <NavItem icon={Activity} label="Blue Print" viewId="blueprint" status="live" color="text-cyan-500" tabs={["Live", "Hub", "Pipeline"]} />
          </NavLevel>
        </Card>

        {/* === 2.4 Mon Réseau === */}
        <Card className="p-4 mb-4 bg-orange-50/30 border-orange-100">
          <div className="flex items-center gap-2 mb-3">
            <Network className="h-4 w-4 text-orange-600 shrink-0" />
            <span className="text-sm font-semibold text-orange-800">2.4 Mon Réseau — Orbit9</span>
            <Badge className="text-[9px] bg-orange-100 text-orange-700 border-orange-200">SectionOrbit9.tsx</Badge>
          </div>
          <NavLevel>
            <NavItem icon={Store} label="Marketplace" viewId="orbit9-detail → marketplace" status="live" color="text-orange-500" tabs={["Bots & Agents", "Opportunités"]} />
            <NavItem icon={Handshake} label="Cellules Orbit9" viewId="orbit9-detail → cellules" status="live" color="text-emerald-500" sub="Groupes de matching 3 entreprises" />
            <NavItem icon={Sparkles} label="Jumelage" viewId="orbit9-detail → jumelage" status="live" color="text-amber-500" sub="Trisociation LiveKit en temps réel" />
            <NavItem icon={Crown} label="Gouvernance" viewId="orbit9-detail → gouvernance" status="live" color="text-violet-500" sub="Decision log + protocole gouvernance" />
            <NavItem icon={Rocket} label="Pionniers" viewId="orbit9-detail → pionniers" status="live" color="text-indigo-500" sub="Programme early adopters" />
          </NavLevel>
        </Card>

        {/* === 2.5 Mon Industrie === */}
        <Card className="p-4 mb-4 bg-indigo-50/30 border-indigo-100">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-indigo-600 shrink-0" />
            <span className="text-sm font-semibold text-indigo-800">2.5 Mon Industrie — TRG</span>
            <Badge className="text-[9px] bg-indigo-100 text-indigo-700 border-indigo-200">SectionTrgIndustries.tsx</Badge>
          </div>
          <NavLevel>
            <NavItem icon={Newspaper} label="Nouvelles" viewId="orbit9-detail → nouvelles" status="live" color="text-blue-500" sub="Fil d'actualité sectoriel" />
            <NavItem icon={Calendar} label="Événements" viewId="orbit9-detail → evenements" status="live" color="text-rose-500" sub="Calendrier industrie" />
            <NavItem icon={Globe} label="Dashboard Industrie" viewId="orbit9-detail → trg-industrie" status="live" color="text-indigo-500" sub="Vue macro sectorielle" />
          </NavLevel>
        </Card>

        {/* === 2.6 Master GHML === */}
        <Card className="p-4 mb-4 bg-purple-50/30 border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-purple-600 shrink-0" />
            <span className="text-sm font-semibold text-purple-800">2.6 Master GHML — 16 Sous-sections</span>
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
            <NavItem icon={ScrollText} label="Protocoles & Acronymes" viewId="master-protocoles" status="live" color="text-fuchsia-500" />
            <NavItem icon={TrendingUp} label="Vision d'Affaires & Produit" viewId="master-vision-affaires" status="live" color="text-green-600" />
            <NavItem icon={Map} label="Structure Navigation" viewId="master-navigation" status="live" color="text-slate-600" sub="Cette page (méta-navigation)" />
          </NavLevel>
        </Card>

        {/* === 2.7 Réglages === */}
        <Card className="p-4 bg-gray-50/50 border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-gray-600 shrink-0" />
            <span className="text-sm font-semibold text-gray-800">2.7 Mes Réglages</span>
            <Badge className="text-[9px] bg-gray-100 text-gray-600 border-gray-200">Fixe en bas</Badge>
          </div>
          <NavLevel>
            <NavItem icon={Settings} label="Paramètres Agent" viewId="agent-settings" status="live" color="text-gray-500" sub="Configuration des agents IA, voix, modèles" />
          </NavLevel>
        </Card>
      </Card>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 3 — Routes Core (hors sidebar) */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="h-4 w-4 text-emerald-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900">3. Routes Core (canvas principal)</h2>
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
          <h2 className="text-base font-semibold text-gray-900">4. Dashboard — Carte d'Actions</h2>
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
          <h2 className="text-base font-semibold text-gray-900">5. FrameMasterContext — State Variables</h2>
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
          <h2 className="text-base font-semibold text-gray-900">6. Méthodes de Navigation</h2>
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
          <h2 className="text-base font-semibold text-gray-900">7. Identité Visuelle — 12 Bots</h2>
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
          <h2 className="text-base font-semibold text-gray-900">8. Couches d'Instances (Multi-Tenant)</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Architecture prévue pour supporter N instances (1 par entreprise/CEO).
          Actuellement: instance unique "Usine Bleue".
        </p>

        <div className="space-y-3">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="text-sm font-semibold text-blue-800 mb-1">Couche 1 — Instance Entreprise</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 1 instance = 1 entreprise = 1 CEO</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Kit entreprise chargé au login (usine-bleue.json)</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 12 départements + data KPI par instance</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> SOULs personnalisées par instance (14 fichiers)</div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-emerald-500">
            <div className="text-sm font-semibold text-emerald-800 mb-1">Couche 2 — Réseau Orbit9</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Cross-instance: Marketplace, Cellules, Jumelage</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> orbit9_members + orbit9_cellules + orbit9_matches (PostgreSQL)</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Matching scoring Gemini Flash + trisociation LiveKit</div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-violet-500">
            <div className="text-sm font-semibold text-violet-800 mb-1">Couche 3 — Plateforme GhostX</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5 text-violet-500" /> Templates partagés (141 templates, 12 départements)</div>
              <div className="flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5 text-violet-500" /> GHML Engine commun (tableau périodique, protocoles)</div>
              <div className="flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5 text-violet-500" /> Routage IA 5-tiers partagé entre instances</div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-amber-500">
            <div className="text-sm font-semibold text-amber-800 mb-1">Couche 4 — Industrie (TRG)</div>
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
          <h2 className="text-base font-semibold text-gray-900">9. Arborescence Complète</h2>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs text-gray-700 overflow-x-auto whitespace-pre leading-relaxed">
{`APP (CenterZone.tsx)
├─ dashboard → DashboardView
│  └─ 10 blocs cliquables → navigateToDepartment / setActiveView
├─ cockpit → CockpitView
├─ health → HealthView
│
├─ department → DepartmentTourDeControle (12 départements)
│  └─ detail → DepartmentDetailView
│     └─ 4 tabs: Vue d'ensemble | Pipeline | Documents | Diagnostics
│
├─ mes-chantiers → MesChantiersView
│  ├─ discussions → DiscussionView
│  ├─ missions → Missions list (COMMAND)
│  ├─ projets → Projets list (PostgreSQL)
│  └─ chantiers → Chantiers list (chaleur)
│
├─ espace-bureau → EspaceBureauView
│  ├─ idees → Capture idées
│  ├─ documents → Upload + PostgreSQL
│  ├─ outils → Outils intégrés
│  ├─ taches → Plane.so API
│  └─ agenda → Calendrier
│
├─ blueprint → BluePrintView
│  ├─ live → 6 C-Level bots status
│  ├─ hub → 41 templates
│  └─ pipeline → Orbit9 pipeline
│
├─ orbit9-detail → Orbit9DetailView
│  ├─ marketplace → MarketplacePage (Bots)
│  ├─ marketplace-cahiers → MarketplacePage (Opportunités)
│  ├─ cellules → CellulesPage
│  ├─ jumelage → JumelageLivePage
│  ├─ gouvernance → GouvernancePage
│  ├─ pionniers → PionniersPage
│  ├─ nouvelles → NouvellesPage
│  ├─ evenements → EvenementsPage
│  └─ trg-industrie → TrgIndustriePage
│
├─ board-room → BoardRoomView
├─ war-room → WarRoomView
├─ think-room → ThinkRoomView
│
├─ live-chat → LiveChat (centré ou sidebar droite)
├─ cahier → CahierSmartDemo
├─ branches → BranchPatternsDemo
├─ scenarios → ScenarioHub
├─ canvas → SmartCanvas
├─ agent-settings → AgentSettingsView
│
└─ Master GHML (16 sous-sections)
   ├─ bible-visuelle → PageTypePage
   ├─ bible-technique → BibleTechniquePage
   ├─ bible-ghml → BibleGHMLPage
   ├─ master-roadmap → MasterRoadmapPage
   ├─ master-strategie → MasterStrategiePage
   ├─ master-orbit9 → MasterOrbit9Page
   ├─ master-communication → MasterCommunicationPage
   ├─ master-dette → MasterDettePage
   ├─ master-routine → MasterRoutinePage
   ├─ master-minedor → MasterMinedorPage
   ├─ master-training → MasterTrainingPage
   ├─ master-profils → MasterProfilsPage
   ├─ master-parcours → MasterParcoursPage
   ├─ master-protocoles → MasterProtocolesPage
   ├─ master-vision-affaires → MasterVisionAffairesPage
   └─ master-navigation → MasterNavigationPage`}
        </div>
      </Card>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 10 — Fichiers Source */}
      {/* ============================================================ */}

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-gray-600 shrink-0" />
          <h2 className="text-base font-semibold text-gray-900">10. Fichiers Source Clés</h2>
        </div>

        <div className="space-y-2">
          {[
            { file: "FrameMasterContext.tsx", desc: "State global — ActiveView, navigation methods, 12 variables", lines: "~200" },
            { file: "CenterZone.tsx", desc: "Router central — 48 routes conditionnelles", lines: "~350" },
            { file: "SidebarLeft.tsx", desc: "Sidebar gauche — 7 sections collapsibles", lines: "~100" },
            { file: "SectionEspaceBureau.tsx", desc: "Mon Espace — Pipeline + Ressources", lines: "~120" },
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
