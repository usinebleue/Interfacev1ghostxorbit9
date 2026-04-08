/**
 * SimulationFullPage.tsx — Page full-screen autonome pour simulations
 * Route: /simulation/:id — bypass auth, meme pattern que MeetingGuestPage
 *
 * LAYOUT:
 * +═══ BANDE BLANCHE pleine largeur: ← Phase Réflexion ═══════+
 * +═══ color line ═════════════════════════════════════════════+
 * | UB_BLUE cockpit | UB_BLUE chat    | UB_BLUE contenu       |
 * | COCKPIT (rétract)| DISCUSSION     | CONTENT               |
 *
 * Bande blanche = label de la simulation (pas dans la vraie app)
 * 3 barres bleues au meme niveau sous la bande blanche
 */

"use client";

import { useState, useRef } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../../../../components/ui/resizable";
import {
  Phone,
  Video,
  MessageSquare,
  Gauge,
  Users,
  UserCircle,
  Mic,
  Send,
  Activity,
  Bot,
  Zap,
  Brain,
  BarChart3,
  Target,
  Sparkles,
  Swords,
  Scale,
  ClipboardList,
  Rocket,
  MessagesSquare,
  Waves,
  Flame,
  Glasses,
  ArrowLeft,
  RotateCcw,
  Paperclip,
  Home,
  Globe,
  Shield,
  ChevronRight,
  FolderOpen,
  FileCheck,
  CheckCircle2,
  TowerControl,
  Settings,
  ArrowRight,
  Hexagon,
  Layers,
  Newspaper,
  Network,
  Atom,
  Handshake,
  Calendar,
  Database,
  BookOpen,
  Palette,
  Eye,
  DoorOpen,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { BOT_COLORS } from "../shared/simulation-data";
import { BotAvatar } from "../shared/simulation-components";

// Simulation imports
import { SimPhaseReflexion } from "./demos/SimPhaseReflexion";
import { SimPhaseAtelier } from "./demos/SimPhaseAtelier";
import { SimPhaseCOMMAND } from "./demos/SimPhaseCOMMAND";
import { SimMonDepartement } from "./demos/SimMonDepartement";
import { SimMesSalles } from "./demos/SimMesSalles";
import { SimMonEquipe } from "./demos/SimMonEquipe";
import { SimAdmin } from "./demos/SimAdmin";
import { SimMonReseau } from "./demos/SimMonReseau";
import { AtelierAnalyse } from "./demos/AtelierAnalyse";
import { AtelierBrainstorm } from "./demos/AtelierBrainstorm";
import { AtelierStrategie } from "./demos/AtelierStrategie";
import { AtelierDebat } from "./demos/AtelierDebat";
import { AtelierDecision } from "./demos/AtelierDecision";
import { AtelierCrise } from "./demos/AtelierCrise";
import { AtelierInnovation } from "./demos/AtelierInnovation";
import { AtelierDeepResonance } from "./demos/AtelierDeepResonance";
import { AtelierTimCode } from "./demos/AtelierTimCode";
import { AtelierDiagnostic } from "./demos/AtelierDiagnostic";
import { AtelierJumelage } from "./demos/AtelierJumelage";
import { AtelierCahierProjet } from "./demos/AtelierCahierProjet";
import { AtelierSiteWeb } from "./demos/AtelierSiteWeb";
import { AtelierRealtorClient } from "./demos/AtelierRealtorClient";
import { SimAmorcer } from "./demos/SimAmorcer";
import { DEPT_SHORT_LABEL, DEPT_DASH_ICON } from "../blueprint/BlueprintDepartement";

const UB_BLUE = "#073E5A";

// ========== SIMULATION ROUTER ==========

const SIMULATION_MAP: Record<string, React.ComponentType<{ onBack: () => void }>> = {
  "sim-reflexion": SimPhaseReflexion,
  "sim-atelier": SimPhaseAtelier,
  "sim-command": SimPhaseCOMMAND,
  "sim-departement": SimMonDepartement,
  "sim-salles": SimMesSalles,
  "sim-equipe": SimMonEquipe,
  "sim-admin": SimAdmin,
  "sim-reseau": SimMonReseau,
  "analyse": AtelierAnalyse,
  "brainstorm": AtelierBrainstorm,
  "strategie": AtelierStrategie,
  "debat": AtelierDebat,
  "decision": AtelierDecision,
  "crise": AtelierCrise,
  "innovation": AtelierInnovation,
  "deep": AtelierDeepResonance,
  "timcode": AtelierTimCode,
  "diagnostic": AtelierDiagnostic,
  "jumelage": AtelierJumelage,
  "cahier-projet": AtelierCahierProjet,
  "site-web": AtelierSiteWeb,
  "realtor-client": AtelierRealtorClient,
  "sim-amorcer": SimAmorcer,
};

// ========== SIMULATION META (titre + couleur pour la bande blanche) ==========

const SIMULATION_META: Record<string, { title: string; icon: React.ElementType; colorLine: string }> = {
  "sim-reflexion": { title: "Phase Réflexion", icon: Brain, colorLine: "bg-red-500" },
  "sim-atelier": { title: "Phase Création", icon: Brain, colorLine: "bg-amber-500" },
  "sim-command": { title: "Phase Exécution", icon: Brain, colorLine: "bg-emerald-500" },
  "sim-departement": { title: "Mon Département", icon: Brain, colorLine: "bg-blue-600" },
  "sim-salles": { title: "Conférence AI", icon: Video, colorLine: "bg-violet-500" },
  "sim-equipe": { title: "Mon Équipe", icon: Brain, colorLine: "bg-cyan-500" },
  "sim-admin": { title: "Administration", icon: Brain, colorLine: "bg-gray-500" },
  "sim-reseau": { title: "Mon Réseau", icon: Brain, colorLine: "bg-indigo-500" },
  "analyse": { title: "Atelier Analyse", icon: BarChart3, colorLine: "bg-red-500" },
  "brainstorm": { title: "Atelier Brainstorm", icon: Brain, colorLine: "bg-amber-500" },
  "strategie": { title: "Atelier Stratégie", icon: Target, colorLine: "bg-emerald-500" },
  "debat": { title: "Atelier Débat", icon: MessagesSquare, colorLine: "bg-orange-500" },
  "decision": { title: "Atelier Décision", icon: Scale, colorLine: "bg-indigo-500" },
  "crise": { title: "Atelier Crise", icon: Swords, colorLine: "bg-red-600" },
  "innovation": { title: "Atelier Innovation", icon: Sparkles, colorLine: "bg-pink-500" },
  "deep": { title: "Deep Resonance", icon: Waves, colorLine: "bg-cyan-600" },
  "timcode": { title: "TimCode", icon: Zap, colorLine: "bg-violet-600" },
  "diagnostic": { title: "Diagnostic", icon: Activity, colorLine: "bg-blue-500" },
  "jumelage": { title: "Jumelage", icon: Users, colorLine: "bg-teal-500" },
  "cahier-projet": { title: "Cahier de Projet", icon: Brain, colorLine: "bg-indigo-500" },
  "site-web": { title: "Site Web", icon: Brain, colorLine: "bg-blue-500" },
  "realtor-client": { title: "Realtor Client", icon: Brain, colorLine: "bg-emerald-500" },
  "sim-amorcer": { title: "Protocole AMORCER", icon: Rocket, colorLine: "bg-red-500" },
};

// ========== BOT CONSTANTS ==========

const BOT_CODES = ["CEOB", "CTOB", "CFOB", "CMOB", "CSOB", "COOB", "CPOB", "CHROB", "CINOB", "CROB", "CLOB", "CISOB"] as const;

const BOT_NAME: Record<string, string> = {
  CEOB: "CarlOS", CTOB: "Tim", CFOB: "Frank", CMOB: "Mathilde",
  CSOB: "Simone", COOB: "Olivier", CPOB: "Paco", CHROB: "Hélène",
  CINOB: "Inès", CROB: "Rich", CLOB: "Loulou", CISOB: "Sébastien",
};
const BOT_ROLE: Record<string, string> = {
  CEOB: "CEO", CTOB: "CTO", CFOB: "CFO", CMOB: "CMO",
  CSOB: "CSO", COOB: "COO", CPOB: "CPO", CHROB: "CHRO",
  CINOB: "CINO", CROB: "CRO", CLOB: "CLO", CISOB: "CISO",
};
const BOT_STANDBY: Record<string, string> = {
  CEOB: "/agents/generated/ceo-carlos-standby-v3.png",
  CTOB: "/agents/generated/cto-thierry-standby-v3.png",
  CFOB: "/agents/generated/cfo-francois-standby-v3.png",
  CMOB: "/agents/generated/cmo-martine-standby-v3.png",
  CSOB: "/agents/generated/cso-sophie-standby-v3.png",
  COOB: "/agents/generated/coo-olivier-standby-v3.png",
  CPOB: "/agents/generated/factory-bot-standby-v3.png",
  CHROB: "/agents/generated/chro-helene-standby-v3.png",
  CINOB: "/agents/generated/cino-ines-standby-v3.png",
  CROB: "/agents/generated/cro-raphael-standby-v3.png",
  CLOB: "/agents/generated/clo-louise-standby-v3.png",
  CISOB: "/agents/generated/ciso-secbot-standby-v3.png",
};
const BOT_AVATAR: Record<string, string> = {
  CEOB: "/agents/generated/ceo-carlos-profil-v3.png",
  CTOB: "/agents/generated/cto-thierry-profil-v3.png",
  CFOB: "/agents/generated/cfo-francois-profil-v3.png",
  CMOB: "/agents/generated/cmo-martine-profil-v3.png",
  CSOB: "/agents/generated/cso-sophie-profil-v3.png",
  COOB: "/agents/generated/coo-olivier-profil-v3.png",
  CPOB: "/agents/generated/factory-bot-profil-v3.png",
  CHROB: "/agents/generated/chro-helene-profil-v3.png",
  CINOB: "/agents/generated/cino-ines-profil-v3.png",
  CROB: "/agents/generated/cro-raphael-profil-v3.png",
  CLOB: "/agents/generated/clo-louise-profil-v3.png",
  CISOB: "/agents/generated/ciso-secbot-profil-v3.png",
};

// Département — grille 2x4 boutons (Carl S82: réorganisation)
const DEPT_ITEMS_WITH_SECTIONS: { label: string; icon: React.ElementType; state: string | null }[] = [
  // Rangée 1
  { label: "Cockpit", icon: Gauge, state: null },
  { label: "Chantiers", icon: Flame, state: null },
  { label: "Conférence AI", icon: Video, state: null },
  { label: "Agenda", icon: Calendar, state: null },
  // Rangée 2
  { label: "Blueprint", icon: Layers, state: null },
  { label: "Data Room", icon: Database, state: null },
  { label: "Playbook Store", icon: BookOpen, state: null },
  { label: "Orbit9", icon: Atom, state: null },
];

// État AMORCER → dot couleur pour les items (Carl vocal 12h53: "se servir des modes d'attention")
const STATE_DOT: Record<string, string> = {
  attention: "bg-red-500",
  moderation: "bg-pink-500",
  observation: "bg-blue-500",
  reflexion: "bg-orange-500",
  creation: "bg-yellow-500",
  execution: "bg-green-500",
  retroaction: "bg-emerald-500",
};

// Couleur icône par département (design-system.md)
const DEPT_ICON_COLOR: Record<string, string> = {
  CEOB: "text-blue-600", CTOB: "text-violet-600", CFOB: "text-emerald-600", CMOB: "text-pink-600",
  CSOB: "text-red-600", COOB: "text-orange-600", CPOB: "text-amber-600", CHROB: "text-teal-600",
  CINOB: "text-rose-600", CROB: "text-amber-700", CLOB: "text-indigo-600", CISOB: "text-gray-600",
};

// Brain Team — département + last action + état (Carl vocal 13h09: mini business card)
const BOT_DEPT: Record<string, string> = {
  CEOB: "Direction", CTOB: "Technologie", CFOB: "Finances", CMOB: "Marketing",
  CSOB: "Stratégie", COOB: "Opérations", CPOB: "Usine", CHROB: "Ressources Humaines",
  CINOB: "Innovation", CROB: "Revenus", CLOB: "Juridique", CISOB: "Sécurité",
};
const BOT_ACTIONS: Record<string, { lastAction: string; state: string }> = {
  CEOB: { lastAction: "Scan alertes complété", state: "attention" },
  CTOB: { lastAction: "Migration DB phase 2", state: "execution" },
  CFOB: { lastAction: "Rapport Q4 terminé", state: "attention" },
  CMOB: { lastAction: "Campagne email analysée", state: "reflexion" },
  CSOB: { lastAction: "Appel d'offres HQ identifié", state: "creation" },
  COOB: { lastAction: "Audit processus livraison", state: "observation" },
  CPOB: { lastAction: "5S ligne A complété", state: "execution" },
  CHROB: { lastAction: "Entrevues détectées", state: "attention" },
  CINOB: { lastAction: "Veille tech hebdomadaire", state: "observation" },
  CROB: { lastAction: "3 leads qualifiés", state: "moderation" },
  CLOB: { lastAction: "Contrats fournisseurs revus", state: "reflexion" },
  CISOB: { lastAction: "Scan sécurité complété", state: "execution" },
};

// État AMORCER → label court pour tags
const STATE_LABEL: Record<string, string> = {
  attention: "Attention", moderation: "Modération", observation: "Observation",
  reflexion: "Réflexion", creation: "Conception", execution: "Exécution", retroaction: "Rétroaction",
};
const STATE_TAG: Record<string, string> = {
  attention: "bg-red-100 text-red-700", moderation: "bg-pink-100 text-pink-700",
  observation: "bg-blue-100 text-blue-700", reflexion: "bg-orange-100 text-orange-700",
  creation: "bg-yellow-100 text-yellow-700", execution: "bg-green-100 text-green-700",
  retroaction: "bg-emerald-100 text-emerald-700",
};

// (3 phases retirées du cockpit — Carl vocal 11h41: cockpit = navigation + alertes seulement)

// (AMORCER tabs/colors moved into SimAmorcer.tsx — self-contained)

// ========== MAIN COMPONENT ==========

export function SimulationFullPage({ simulationId }: { simulationId: string }) {
  const [cockpitTab, setCockpitTab] = useState<"departement" | "equipe_ai" | "orbit9">("departement");
  const [o9SelectedCellule, setO9SelectedCellule] = useState<number | null>(null);
  const [o9Section, setO9Section] = useState<string>("cellules");
  const [activeBotCode, setActiveBotCode] = useState("CEOB");
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [amorcerTrigger, setAmorcerTrigger] = useState<number>(0);
  const [rightSection, setRightSection] = useState<string | null>("cockpit");
  const [showIconCatalog, setShowIconCatalog] = useState(false);

  const leftPanelRef = useRef<ImperativePanelHandle>(null);

  const SimComponent = SIMULATION_MAP[simulationId];
  const simMeta = SIMULATION_META[simulationId];

  if (!SimComponent || !simMeta) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">Simulation introuvable</p>
          <p className="text-sm text-gray-500 mt-1">ID: {simulationId}</p>
          <button onClick={() => window.close()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 cursor-pointer">Fermer</button>
        </div>
      </div>
    );
  }

  const handleBack = () => { window.close(); };

  const botName = BOT_NAME[activeBotCode] || "CarlOS";
  const botRole = BOT_ROLE[activeBotCode] || "CEO";
  const standbyImg = BOT_STANDBY[activeBotCode] || BOT_STANDBY.CEOB;
  const SimIcon = simMeta.icon;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">

      {/* ═══ BANDE BLANCHE PLEINE LARGEUR ═══ */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-3">
        <button onClick={handleBack} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <SimIcon className={cn("h-4 w-4", simMeta.colorLine.replace("bg-", "text-"))} />
        <span className="text-sm font-bold text-gray-800">{simMeta.title}</span>
        <span className="text-xs text-gray-400">— Simulation</span>
        <div className="flex-1" />
        {simulationId === "sim-amorcer" && (
          <button
            onClick={() => setShowIconCatalog(!showIconCatalog)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer mr-2",
              showIconCatalog
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
            )}
            title="Catalogue d'icônes"
          >
            <Palette className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Icônes</span>
          </button>
        )}
        <span className="text-[9px] text-gray-400">ID: {simulationId}</span>
      </div>

      {/* ═══ COLOR LINE pleine largeur (pas pour sim-amorcer — color line dans le panel droit) ═══ */}
      {simulationId !== "sim-amorcer" && (
        <div className={cn("h-1 shrink-0", simMeta.colorLine)} />
      )}

      {/* ═══ 2 ZONES — barres bleues au meme niveau (sous la bande blanche) ═══ */}
      {/* CSS: cache le header interne + color line de la sim (deja affiches en pleine largeur au-dessus) */}
      <style>{`.sim-hide-internal-hdr > div > *:nth-child(1), .sim-hide-internal-hdr > div > *:nth-child(2) { display: none !important; }`}</style>

      <ResizablePanelGroup direction="horizontal" autoSaveId="sim-fullpage-v3" className="flex-1">

        {/* ═══ ZONE 1 — COCKPIT GAUCHE (rétractable) ═══ */}
        <ResizablePanel
          ref={leftPanelRef}
          defaultSize={14}
          minSize={4}
          maxSize={22}
          collapsible
          collapsedSize={4}
          onCollapse={() => setLeftCollapsed(true)}
          onExpand={() => setLeftCollapsed(false)}
          className="min-w-[56px]"
        >
          <div className="h-full flex flex-col overflow-hidden">
            {/* TopBarCockpit — barre bleue (alignee avec les barres bleues de la sim) */}
            {leftCollapsed ? (
              <div className="h-12 flex items-center justify-center gap-1.5 px-1 shrink-0" style={{ backgroundColor: UB_BLUE }}>
                <img src="/logo-usine-bleue-icon.png" alt="UB" className="h-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).src = "/logo-ub-small.png"; }} />
              </div>
            ) : (
              <div className="h-12 flex items-center gap-2 px-3 shrink-0" style={{ backgroundColor: UB_BLUE }}>
                <img src="/logo-usine-bleue.png" alt="Usine Bleue" className="h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div className="flex-1" />
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <img src="/agents/carl-fugere.jpg" alt="Carl" className="w-7 h-7 rounded-full object-cover ring-1 ring-white/30" />
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#073E5A]" />
                  </div>
                  <span className="text-[11px] text-white/80 max-w-[110px] truncate">Carl Fugère</span>
                </div>
              </div>
            )}

            {/* Sidebar content */}
            <div className="flex-1 overflow-hidden border-r border-gray-200">
              {leftCollapsed ? (
                <CockpitCollapsed />
              ) : (
                <div className="h-full flex flex-col bg-white overflow-hidden">
                  {/* Tour de contrôle — header AU-DESSUS de la photo (Carl vocal 12h53/13h03) */}
                  {simulationId === "sim-amorcer" && (
                    <div className="mx-3 mt-2 shrink-0 px-3 py-1.5 rounded-t-lg flex items-center gap-2" style={{ backgroundColor: UB_BLUE }}>
                      <TowerControl className="h-3.5 w-3.5 text-white/80" />
                      <span className="text-[11px] font-bold text-white">Tour de contrôle</span>
                    </div>
                  )}

                  {/* VideoCallWidget mock — image CarlOS */}
                  <div className={cn("mx-3 shrink-0 space-y-0", simulationId === "sim-amorcer" ? "" : "mt-2")}>
                    <div className={cn("relative overflow-hidden aspect-video bg-gray-900", simulationId === "sim-amorcer" ? "" : "rounded-lg")}>
                      <img src={standbyImg} alt={botName} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,14,26,0.3) 100%)", pointerEvents: "none" }} />
                      <div className="absolute bottom-0 left-0 right-0 z-[5]">
                        <div className="bg-gradient-to-t from-black/80 to-transparent px-3.5 pt-10 pb-2.5">
                          <div className="text-lg text-white font-extrabold tracking-wide drop-shadow-lg leading-none">{botName}</div>
                          <div className="text-[9px] text-white/70 font-medium tracking-[0.2em] uppercase drop-shadow-md mt-1">{botRole} AI · Brain Team</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CockpitPanel — 2 tabs (Bureau + Orbit9) */}
                  <div className="flex-1 overflow-hidden flex flex-col mt-2">
                    <div className="flex border-b shrink-0 bg-gray-50/50">
                      {([
                        { id: "departement" as const, label: "Bureau", icon: Home },
                        { id: "orbit9" as const, label: "Orbit⁹", icon: Atom },
                      ]).map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => { setCockpitTab(tab.id); if (tab.id === "orbit9") setRightSection(null); else if (tab.id === "departement" && !rightSection) setRightSection("cockpit"); }}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors cursor-pointer",
                            cockpitTab === tab.id
                              ? "text-blue-600 border-b-2 border-blue-500 bg-white"
                              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                          )}
                        >
                          <tab.icon className="h-3.5 w-3.5" />
                          <span className="hidden xl:inline">{tab.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {cockpitTab === "departement" && <TabBureauMock onSection={(s) => setRightSection(s)} activeBotCode={activeBotCode} onSelectBot={(code) => { setActiveBotCode(code); setRightSection("cockpit"); }} />}
                      {cockpitTab === "orbit9" && <TabOrbit9Cockpit selectedCellule={o9SelectedCellule} onSelectCellule={setO9SelectedCellule} activeSection={o9Section} onSection={setO9Section} />}
                    </div>
                  </div>

                  {/* Cockpit = zone navigation + alertes seulement (Carl vocal 11h41: pas d'input bar ici) */}
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle className="cursor-col-resize" />

        {/* ═══ ZONE 2 — SIMULATION (discussion + contenu) ═══ */}
        <ResizablePanel defaultSize={90} minSize={50}>
          {simulationId === "sim-amorcer" ? (
            /* AMORCER: self-contained, gere ses propres tabs/phases */
            <div className="h-full overflow-hidden">
              <SimAmorcer onBack={handleBack} attentionTrigger={amorcerTrigger} cockpitTab={cockpitTab} o9Section={o9Section} onO9Section={setO9Section} rightSection={rightSection} onCloseSection={() => setRightSection(null)} activeBotCode={activeBotCode} showIconCatalog={showIconCatalog} />
            </div>
          ) : (
            /* Standard: cache le header interne + color line (deja en pleine largeur au-dessus) */
            <div className="sim-hide-internal-hdr h-full overflow-hidden">
              <SimComponent onBack={handleBack} />
            </div>
          )}
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  );
}

// ========== COCKPIT COLLAPSED ==========

function CockpitCollapsed() {
  return (
    <div className="h-full flex flex-col bg-white py-2 overflow-hidden">
      <div className="flex-1 space-y-1 px-1 overflow-hidden">
        {[
          { icon: BarChart3, label: "Recap", color: "text-gray-400" },
          { icon: Activity, label: "Signaux", color: "text-gray-400" },
          { icon: Zap, label: "Actions", color: "text-gray-400" },
          { icon: Video, label: "CarlOS Live", color: "text-purple-500" },
        ].map((item, i) => (
          <button
            key={i}
            className="w-full flex justify-center py-2 rounded hover:bg-gray-100 transition-colors"
            title={item.label}
          >
            <item.icon className={cn("h-4 w-4", item.color)} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ========== TAB BUREAU (Département + 3 phases avec bandes colorées) ==========

const SECTION_MAP: Record<string, string> = { "Cockpit": "cockpit", "Blueprint": "blueprint", "Data Room": "dataroom", "Playbook Store": "playbooks", "Conférence AI": "conferenceai" };

function TabBureauMock({ onSection, activeBotCode = "CEOB", onSelectBot }: { onSection?: (section: string) => void; activeBotCode?: string; onSelectBot?: (code: string) => void }) {
  const [activeDeptItem, setActiveDeptItem] = useState<string | null>("Cockpit");
  const [cockpitSubTab, setCockpitSubTab] = useState<"brainteam" | "cellules">("brainteam");
  const DeptIconComp = DEPT_DASH_ICON[activeBotCode] || Zap;
  const deptName = DEPT_SHORT_LABEL[activeBotCode] || "Direction";

  return (
    <div className="overflow-y-auto h-full text-[11px] flex flex-col">
      {/* Bande — Département dynamique (pastel bleu cyan + icône couleur dept) */}
      <div className="mx-3 mt-2 px-3 py-1.5 flex items-center gap-2 rounded-t-lg shrink-0 bg-[#00B4D8]/10">
        <DeptIconComp className={cn("h-3.5 w-3.5", DEPT_ICON_COLOR[activeBotCode] || "text-blue-600")} />
        <span className="text-[11px] font-bold text-gray-900">Département {deptName}</span>
      </div>
      <div className="px-3 py-2 grid grid-cols-4 gap-1.5 shrink-0">
        {DEPT_ITEMS_WITH_SECTIONS.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              setActiveDeptItem(item.label);
              const s = SECTION_MAP[item.label];
              if (s && onSection) onSection(s);
            }}
            className={cn(
              "relative flex flex-col items-center gap-1 px-1.5 py-2 rounded-lg border text-center transition-all cursor-pointer",
              activeDeptItem === item.label
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600"
            )}
          >
            <item.icon className={cn("h-3.5 w-3.5 shrink-0", activeDeptItem === item.label ? "text-blue-600" : "text-gray-600")} />
            <span className="text-[9px] font-medium w-full leading-tight text-center">{item.label}</span>
            {item.state && (
              <span className={cn("absolute top-1 right-1 w-2 h-2 rounded-full", STATE_DOT[item.state])} />
            )}
          </button>
        ))}
      </div>

      {/* ═══ TABS PERMANENTS — Brain Team + Mes Cellules (Carl S82) ═══ */}
      <div className="flex border-y border-gray-200 shrink-0 bg-gray-50/50 mt-1">
        {([
          { id: "brainteam" as const, label: "Brain Team", icon: Bot },
          { id: "cellules" as const, label: "Mes Cellules", icon: Network },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setCockpitSubTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors cursor-pointer",
              cockpitSubTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-500 bg-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu du tab actif */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {cockpitSubTab === "brainteam" && (
          <TabEquipeAIMock activeBotCode={activeBotCode || "CEOB"} onSelectBot={onSelectBot || (() => {})} embedded />
        )}
        {cockpitSubTab === "cellules" && (
          <CockpitCellulesList />
        )}
      </div>
    </div>
  );
}

// ========== COCKPIT CELLULES LIST (tab permanent — Carl S82) ==========

function CockpitCellulesList() {
  const [selectedCellule, setSelectedCellule] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"interne" | "externe">("interne");

  return (
    <div className="text-[11px]">
      {selectedCellule !== null ? (
        /* ═══ DRILL-DOWN — cartes d'identité humains (copié de TabOrbit9Cockpit) ═══ */
        <div className="p-3 space-y-1.5">
          <button
            onClick={() => setSelectedCellule(null)}
            className="flex items-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-800 cursor-pointer font-medium mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour
          </button>
          {/* Header cellule pastel */}
          <div className="rounded-lg px-2.5 py-2 bg-teal-50 border border-teal-200 flex items-center gap-2">
            <Network className="h-3.5 w-3.5 text-teal-600" />
            <span className="text-[11px] font-bold text-teal-800 flex-1">{O9_CELLULES[selectedCellule].name}</span>
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", STATE_TAG[O9_CELLULES[selectedCellule].status] || "bg-gray-100 text-gray-700")}>
              <span className={cn("w-2 h-2 rounded-full", STATE_DOT[O9_CELLULES[selectedCellule].status] || "bg-gray-400")} />
              {STATE_LABEL[O9_CELLULES[selectedCellule].status] || O9_CELLULES[selectedCellule].status}
            </span>
          </div>
          {/* Cartes humains avec photos */}
          {O9_CELLULES[selectedCellule].membres.map((m, i) => (
            <div key={i} className="rounded-lg border border-gray-200 hover:border-gray-300 bg-white transition-all overflow-hidden">
              <div className="flex items-center gap-2 px-2.5 py-2">
                <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 bg-gray-100">
                  <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold text-gray-800">{m.name}</span>
                  <span className="text-[9px] text-gray-400 block truncate">{m.role} · {O9_CELLULES[selectedCellule].name}</span>
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
          ))}
        </div>
      ) : (
        /* ═══ LISTE DES CELLULES (copié de TabOrbit9Cockpit) ═══ */
        <div className="p-3 space-y-1.5">
          {/* Créer cellule EN HAUT */}
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="w-full px-3 py-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer font-medium text-[11px] flex items-center justify-center gap-1.5"
          >
            <Network className="h-3.5 w-3.5" />
            {showCreate ? "Annuler" : "Créer une cellule"}
          </button>

          {/* Section création inline */}
          {showCreate && (
            <div className="rounded-lg border border-teal-200 overflow-hidden bg-white">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-50 border-b border-teal-100">
                <Network className="h-3.5 w-3.5 text-teal-600" />
                <span className="text-[11px] font-bold text-teal-800">Nouvelle cellule</span>
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
                <button
                  className="w-full px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer font-medium text-[11px] flex items-center justify-center gap-1.5"
                >
                  <Network className="h-3.5 w-3.5" />
                  Créer
                </button>
              </div>
            </div>
          )}

          {/* Liste cellules — click → drill-down vers membres */}
          {O9_CELLULES.map((cell, i) => {
            const stDot = STATE_DOT[cell.status] || "bg-gray-400";
            const stLabel = STATE_LABEL[cell.status] || "";
            const stTag = STATE_TAG[cell.status] || "";
            return (
              <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setSelectedCellule(i)}
                  className="flex items-center gap-2 w-full px-2.5 py-2 text-left cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Network className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                  <span className="text-[11px] font-semibold text-gray-800 truncate flex-1">{cell.name}</span>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", stTag)}>
                    <span className={cn("w-2 h-2 rounded-full", stDot)} />
                    {stLabel}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                </button>
                <div className="border-t border-gray-100 px-2.5 py-1.5 flex items-center gap-2 bg-gray-50/50">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-[9px] text-gray-500">{cell.members}/{cell.maxMembers}</span>
                  </div>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
                    cell.type === "interne" ? "bg-teal-50 text-teal-600" : "bg-cyan-50 text-cyan-600"
                  )}>
                    {cell.type === "interne" ? "Interne" : "Externe"}
                  </span>
                  <div className="flex-1" />
                  <div className="flex items-center gap-0.5">
                    {cell.membres.slice(0, 4).map((m, mi) => (
                      <div key={mi} className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-white shrink-0">
                        <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {cell.membres.length > 4 && (
                      <span className="text-[8px] text-gray-400 ml-0.5">+{cell.membres.length - 4}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ========== TAB CHANTIERS (drill-down Chantier > Projet > Mission > Tâche) ==========

// Chantiers data avec états AMORCER (Carl vocal 13h24: différents états par chantier)
const COCKPIT_CHANTIERS = [
  {
    name: "Transformation Numérique", state: "execution",
    projets: [
      { name: "Site web corporatif", missions: [
        { name: "Maquette V1", taches: ["Wireframes desktop", "Wireframes mobile", "Revue design"] },
        { name: "Contenu rédactionnel", taches: ["Pages principales", "Blog articles"] },
        { name: "Tests QA", taches: ["Tests navigateur", "Tests performance"] },
      ]},
      { name: "CRM intégration", missions: [] },
      { name: "Automatisation usine", missions: [] },
    ],
  },
  {
    name: "Expansion Marché US", state: "creation",
    projets: [
      { name: "Étude de marché", missions: [
        { name: "Analyse concurrence", taches: ["Benchmark prix", "Positionnement"] },
        { name: "Segments cibles", taches: ["Profils acheteurs", "Canaux distribution"] },
      ]},
      { name: "Partenariats distribution", missions: [] },
    ],
  },
  { name: "Optimisation Production", state: "retroaction", projets: [] },
  { name: "Développement RH", state: "reflexion", projets: [] },
  { name: "Stratégie Commerciale Q2", state: "attention", projets: [] },
  { name: "Infrastructure TI", state: "observation", projets: [] },
];

function TabChantiersMock() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [openProj, setOpenProj] = useState<number | null>(0);
  const [openMission, setOpenMission] = useState<number | null>(0);

  return (
    <div className="p-3 space-y-1.5 overflow-y-auto h-full text-[11px]">
      {COCKPIT_CHANTIERS.map((ch, ci) => {
        const isOpen = openIdx === ci;
        const stDot = STATE_DOT[ch.state] || "bg-gray-400";
        const stLabel = STATE_LABEL[ch.state] || "";
        const stTag = STATE_TAG[ch.state] || "";
        return (
          <div key={ci} className={cn("rounded-lg border overflow-hidden", isOpen ? "border-blue-200" : "border-gray-200")}>
            {/* Chantier header */}
            <button
              onClick={() => { setOpenIdx(isOpen ? null : ci); setOpenProj(0); setOpenMission(0); }}
              className="flex items-center gap-2 w-full px-2.5 py-2 text-left cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Flame className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span className="text-[11px] font-semibold text-gray-800 truncate flex-1">{ch.name}</span>
              <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", stTag)}>
                <span className={cn("w-2 h-2 rounded-full", stDot)} />
                {stLabel}
              </span>
              <ChevronRight className={cn("h-3.5 w-3.5 text-gray-300 transition-transform shrink-0", isOpen && "rotate-90")} />
            </button>

            {/* Projets drill-down */}
            {isOpen && ch.projets.length > 0 && (
              <div className="border-t border-gray-200 bg-white">
                {ch.projets.map((proj, pi) => {
                  const projOpen = openProj === pi;
                  return (
                    <div key={pi} className="border-b border-gray-100 last:border-0">
                      <button
                        onClick={() => { setOpenProj(projOpen ? null : pi); setOpenMission(0); }}
                        className="flex items-center gap-2 w-full px-2.5 py-1.5 pl-6 text-left cursor-pointer hover:bg-gray-50"
                      >
                        <Rocket className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span className="text-[11px] text-gray-700 font-medium truncate flex-1">{proj.name}</span>
                        {proj.missions.length > 0 && <ChevronRight className={cn("h-3.5 w-3.5 text-gray-300 transition-transform", projOpen && "rotate-90")} />}
                      </button>

                      {/* Missions drill-down */}
                      {projOpen && proj.missions.length > 0 && (
                        <div className="bg-gray-50/50">
                          {proj.missions.map((mission, mi) => {
                            const mOpen = openMission === mi;
                            return (
                              <div key={mi}>
                                <button
                                  onClick={() => setOpenMission(mOpen ? null : mi)}
                                  className="flex items-center gap-2 w-full px-2.5 py-1.5 pl-10 text-left cursor-pointer hover:bg-gray-100"
                                >
                                  <FolderOpen className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                                  <span className="text-[11px] text-gray-600 truncate flex-1">{mission.name}</span>
                                  {mission.taches.length > 0 && <ChevronRight className={cn("h-3.5 w-3.5 text-gray-300 transition-transform", mOpen && "rotate-90")} />}
                                </button>

                                {/* Tâches drill-down (Carl vocal 13h24) */}
                                {mOpen && mission.taches.length > 0 && (
                                  <div className="bg-gray-100/50">
                                    {mission.taches.map((t, ti) => (
                                      <button key={ti} className="flex items-center gap-2 w-full px-2.5 py-1.5 pl-14 text-left cursor-pointer hover:bg-gray-100">
                                        <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0", ti === 0 ? "text-green-500" : "text-gray-300")} />
                                        <span className="text-[11px] text-gray-500 truncate flex-1">{t}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ========== TAB EQUIPE AI ==========

function TabEquipeAIMock({ activeBotCode, onSelectBot, embedded = false }: { activeBotCode: string; onSelectBot: (code: string) => void; embedded?: boolean }) {
  return (
    <div className={cn("p-2 text-[11px]", !embedded && "overflow-y-auto h-full")}>
      <div className="space-y-1.5">
        {BOT_CODES.map((code) => {
          const isActive = activeBotCode === code;
          const actions = BOT_ACTIONS[code];
          const dept = BOT_DEPT[code] || "";
          return (
            <div
              key={code}
              className={cn(
                "rounded-lg border transition-all overflow-hidden",
                isActive ? "border-blue-200 bg-blue-50/50" : "border-gray-200 hover:border-gray-300 bg-white",
              )}
            >
              {/* Header département — pastel bleu */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#00B4D8]/10">
                <span className="text-[9px] font-bold text-gray-600 truncate">{dept}</span>
              </div>
              {/* Avatar + nom + rôle */}
              <div className="flex items-center gap-2 px-2.5 py-2">
                <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 bg-gray-100">
                  <img src={BOT_AVATAR[code]} alt={BOT_NAME[code]} className="w-full h-full object-cover" />
                </div>
                <button onClick={() => onSelectBot(code)} className="flex-1 min-w-0 text-left cursor-pointer">
                  <span className={cn("text-[11px] font-semibold", isActive ? "text-blue-700" : "text-gray-800")}>{BOT_NAME[code]} {BOT_ROLE[code]}</span>
                </button>
                {actions && (
                  <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0 flex items-center gap-1", STATE_TAG[actions.state])}>
                    <span className={cn("w-2 h-2 rounded-full shrink-0", STATE_DOT[actions.state])} />
                    {STATE_LABEL[actions.state]}
                  </span>
                )}
              </div>
              {/* Separator + last action + go button (Carl vocal 13h24: gras partout) */}
              <div className="border-t border-gray-100 px-2.5 py-1.5 flex items-center gap-2 bg-gray-50/50">
                <span className="text-[11px] font-bold text-gray-600 truncate flex-1">{actions?.lastAction || "—"}</span>
                <button
                  onClick={() => onSelectBot(code)}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer shrink-0"
                >
                  <span className="hidden xl:inline">Aller</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========== TAB EQUIPE HUMAINE ==========

// Humains mock — même pattern que Brain Team (Carl vocal 13h17)
const HUMAN_TEAM = [
  { name: "Carl Fugère", role: "CEO", dept: "Direction", avatar: "/agents/carl-fugere.jpg", lastAction: "Revue stratégique Q4", state: "reflexion" },
  { name: "Marie-Ève Tremblay", role: "VP Opérations", dept: "Opérations", avatar: BOT_AVATAR.CMOB, lastAction: "Audit processus production", state: "observation" },
  { name: "Jean-Philippe Roy", role: "Dir. Technologie", dept: "Technologie", avatar: BOT_AVATAR.CTOB, lastAction: "Déploiement infrastructure", state: "execution" },
];

function TabEquipeHumaineMock() {
  return (
    <div className="p-2 overflow-y-auto h-full text-[11px]">
      <div className="space-y-1.5">
        {HUMAN_TEAM.map((person, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 hover:border-gray-300 bg-white transition-all overflow-hidden"
          >
            {/* Top: avatar + nom + rôle + département */}
            <div className="flex items-center gap-2 px-2.5 py-2">
              <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 bg-gray-100">
                <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold text-gray-800">{person.name}</span>
                <span className="text-[9px] text-gray-400 block truncate">{person.role} · {person.dept}</span>
              </div>
              <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0 flex items-center gap-1", STATE_TAG[person.state])}>
                <span className={cn("w-2 h-2 rounded-full shrink-0", STATE_DOT[person.state])} />
                {STATE_LABEL[person.state]}
              </span>
            </div>
            {/* Separator + last action + go button (Carl vocal 13h24: gras) */}
            <div className="border-t border-gray-100 px-2.5 py-1.5 flex items-center gap-2 bg-gray-50/50">
              <span className="text-[11px] font-bold text-gray-600 truncate flex-1">{person.lastAction}</span>
              <button className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer shrink-0">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">Écrire</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Bouton inviter */}
      <button className="mt-3 w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer font-medium text-[11px] flex items-center justify-center gap-1.5">
        <Users className="h-3.5 w-3.5" />
        Inviter un membre
      </button>
    </div>
  );
}

// ========== ORBIT9 DATA ==========

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

// ========== TAB ORBIT9 — dans le cockpit gauche (remplace "Humains") ==========

const O9_MENU = [
  { key: "dashboard", label: "Accueil", icon: Home },
  { key: "blueprint", label: "Blueprint", icon: BookOpen },
  { key: "cellules", label: "Cellules", icon: Atom },
  { key: "jumelage", label: "Jumelage", icon: Handshake },
  { key: "gouvernance", label: "Gouvernance", icon: Shield },
  { key: "pionniers", label: "Pionniers", icon: Rocket },
  { key: "vitaa", label: "VITAA", icon: Activity },
  { key: "perso", label: "Mon profil", icon: UserCircle },
];

function TabOrbit9Cockpit({ selectedCellule, onSelectCellule, activeSection, onSection }: { selectedCellule: number | null; onSelectCellule: (i: number | null) => void; activeSection: string; onSection: (s: string) => void }) {
  return (
    <div className="overflow-y-auto h-full text-[11px]">
      {/* Menu Orbit⁹ — même pattern que Bureau > Département Direction */}
      <div className="mx-3 mt-2 px-3 py-1.5 flex items-center gap-2 rounded-t-lg" style={{ backgroundColor: "rgba(7,62,90,0.12)" }}>
        <Atom className="h-3.5 w-3.5" style={{ color: UB_BLUE }} />
        <span className="text-[11px] font-bold text-gray-900">Réseau Orbit⁹</span>
      </div>
      <div className="px-3 py-2 grid grid-cols-3 gap-1.5 border-b border-gray-200">
        {O9_MENU.map(item => (
          <button
            key={item.key}
            onClick={() => { onSection(item.key); if (item.key !== "cellules") onSelectCellule(null); }}
            className={cn(
              "relative flex flex-col items-center gap-1 px-1.5 py-2 rounded-lg border text-center transition-all cursor-pointer",
              activeSection === item.key
                ? "bg-teal-50 border-teal-300 text-teal-700"
                : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600"
            )}
          >
            <item.icon className={cn("h-3.5 w-3.5 shrink-0", activeSection === item.key ? "text-teal-600" : "text-gray-600")} />
            <span className="text-[9px] font-medium w-full leading-tight text-center">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Cellules — même pattern que Chantiers (phase AMORCER tags) */}
      <div className="mx-3 mt-2 px-3 py-1.5 flex items-center gap-2 rounded-t-lg" style={{ backgroundColor: "rgba(7,62,90,0.12)" }}>
        <Atom className="h-3.5 w-3.5 text-teal-500" />
        <span className="text-[11px] font-bold text-gray-900">Cellules</span>
      </div>

      {selectedCellule !== null ? (
        /* Drill-down — cartes d'identité humains avec photos */
        <div className="p-3 space-y-1.5">
          <button
            onClick={() => onSelectCellule(null)}
            className="flex items-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-800 cursor-pointer font-medium mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour
          </button>
          {/* Header cellule pastel */}
          <div className="rounded-lg px-2.5 py-2 bg-teal-50 border border-teal-200 flex items-center gap-2">
            <Atom className="h-3.5 w-3.5 text-teal-600" />
            <span className="text-[11px] font-bold text-teal-800 flex-1">{O9_CELLULES[selectedCellule].name}</span>
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", STATE_TAG[O9_CELLULES[selectedCellule].status] || "bg-gray-100 text-gray-700")}>
              <span className={cn("w-2 h-2 rounded-full", STATE_DOT[O9_CELLULES[selectedCellule].status] || "bg-gray-400")} />
              {STATE_LABEL[O9_CELLULES[selectedCellule].status] || O9_CELLULES[selectedCellule].status}
            </span>
          </div>
          {/* Cartes humains avec photos */}
          {O9_CELLULES[selectedCellule].membres.map((m, i) => (
            <div key={i} className="rounded-lg border border-gray-200 hover:border-gray-300 bg-white transition-all overflow-hidden">
              <div className="flex items-center gap-2 px-2.5 py-2">
                <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 bg-gray-100">
                  <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold text-gray-800">{m.name}</span>
                  <span className="text-[9px] text-gray-400 block truncate">{m.role} · {O9_CELLULES[selectedCellule].name}</span>
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
          ))}
        </div>
      ) : (
        /* Liste des cellules — même pattern que chantiers (Carl vocal 14h24: phases AMORCER, pastel, créer en haut) */
        <div className="p-3 space-y-1.5">
          {/* Créer cellule EN HAUT (Carl vocal 14h24) */}
          <button
            onClick={() => onSection("creer-cellule")}
            className="w-full px-3 py-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer font-medium text-[11px] flex items-center justify-center gap-1.5"
          >
            <Atom className="h-3.5 w-3.5" />
            Créer une cellule
          </button>

          {O9_CELLULES.map((cell, i) => {
            const stDot = STATE_DOT[cell.status] || "bg-gray-400";
            const stLabel = STATE_LABEL[cell.status] || "";
            const stTag = STATE_TAG[cell.status] || "";
            return (
              <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => onSelectCellule(i)}
                  className="flex items-center gap-2 w-full px-2.5 py-2 text-left cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Atom className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                  <span className="text-[11px] font-semibold text-gray-800 truncate flex-1">{cell.name}</span>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", stTag)}>
                    <span className={cn("w-2 h-2 rounded-full", stDot)} />
                    {stLabel}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                </button>
                <div className="border-t border-gray-100 px-2.5 py-1.5 flex items-center gap-2 bg-gray-50/50">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-[9px] text-gray-500">{cell.members}/{cell.maxMembers}</span>
                  </div>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
                    cell.type === "interne" ? "bg-teal-50 text-teal-600" : "bg-cyan-50 text-cyan-600"
                  )}>
                    {cell.type === "interne" ? "Interne" : "Externe"}
                  </span>
                  <div className="flex-1" />
                  <div className="flex items-center gap-0.5">
                    {cell.membres.slice(0, 4).map((m, mi) => (
                      <div key={mi} className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-white shrink-0">
                        <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {cell.membres.length > 4 && (
                      <span className="text-[8px] text-gray-400 ml-0.5">+{cell.membres.length - 4}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
