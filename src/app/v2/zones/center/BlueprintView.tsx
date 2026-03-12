/**
 * BlueprintView.tsx — Blueprint Unifie (fusion RD.7 + BlueprintLiveView + BlueprintGestionView)
 * 8 tabs: Vue d'ensemble, Timeline, Chantiers, Projets, Missions, Taches, Opportunites, Equipes
 * Donnees seed RD.7 (plan Carl) + API reelles (COMMAND, templates, CRUD) fusionnees
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Rocket, Wrench, Shield, Package, Users, Globe,
  Target, Brain, ChevronRight, ChevronDown,
  Flame, Bot, Code2, Eye, Zap,
  CheckCircle2, Clock, Lock,
  Layers, CreditCard, Network,
  BarChart3, Cpu,
  BookOpen, Scale, Radio, FileText, Route,
  Sparkles, Calendar, ListChecks,
  Loader2, AlertCircle,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { BOT_AVATAR } from "../../api/types";
import { api } from "../../api/client";
import { BlueprintFrame } from "./shared/BlueprintFrame";
import { PlaybookCard, KPICard } from "./shared/BlueprintComponents";
import { HierarchieGHML } from "./shared/HierarchieGHML";
import {
  BLUEPRINT_TABS, BOT_INFO,
  PLAYBOOK_TEMPLATES,
} from "./shared/blueprint-config";
import type { BlueprintTabId, BlueprintNav } from "./shared/blueprint-types";

// ================================================================
// COMMAND STAGES (from BlueprintLiveView)
// ================================================================

const STAGE_LABELS: Record<string, { label: string; progress: number }> = {
  scan: { label: "Scan en cours", progress: 25 },
  strategie: { label: "Strategie", progress: 50 },
  execution: { label: "Execution", progress: 75 },
  bilan: { label: "Bilan", progress: 90 },
  done: { label: "Termine", progress: 100 },
};

const CLEVEL_BOTS = [
  { code: "CEOB", nom: "CarlOS", role: "CEO", dept: "Direction", deptColor: "bg-blue-100 text-blue-700" },
  { code: "CTOB", nom: "Thierry", role: "CTO", dept: "Technologie", deptColor: "bg-violet-100 text-violet-700" },
  { code: "CFOB", nom: "Francois", role: "CFO", dept: "Finance", deptColor: "bg-emerald-100 text-emerald-700" },
  { code: "CMOB", nom: "Martine", role: "CMO", dept: "Marketing", deptColor: "bg-pink-100 text-pink-700" },
  { code: "CSOB", nom: "Sophie", role: "CSO", dept: "Strategie", deptColor: "bg-red-100 text-red-700" },
  { code: "COOB", nom: "Olivier", role: "COO", dept: "Operations", deptColor: "bg-orange-100 text-orange-700" },
];

// ================================================================
// TAB: VUE D'ENSEMBLE
// ================================================================

function TabOverview({ nav, stats, onDeploy }: { nav: BlueprintNav; stats: { chantiers: number; projets: number; missions: number; taches: number; missionsDone: number; tachesDone: number }; onDeploy?: (playbookId: string) => Promise<void> }) {
  const [commandMissions, setCommandMissions] = useState<Record<string, unknown>[]>([]);
  const [loadingCommand, setLoadingCommand] = useState(true);

  useEffect(() => {
    api.commandMissions(10)
      .then((res) => setCommandMissions(Array.isArray(res) ? res : (res as Record<string, unknown>).missions as Record<string, unknown>[] || []))
      .catch(() => setCommandMissions([]))
      .finally(() => setLoadingCommand(false));
  }, []);

  const totalMissions = stats.missions || 1;
  const pctDone = Math.round((stats.missionsDone / totalMissions) * 100);
  const missionsEnCours = stats.missions - stats.missionsDone;
  const pctEnCours = Math.round((missionsEnCours / totalMissions) * 100);
  const pctAFaire = Math.max(0, 100 - pctDone - pctEnCours);

  const botStatus = (code: string) => {
    const activeMission = commandMissions.find(
      (m) => Array.isArray(m.scan_bots) && (m.scan_bots as string[]).includes(code) && m.current_stage !== "done"
    );
    if (activeMission) {
      const stage = STAGE_LABELS[activeMission.current_stage as string] || { label: "Actif", progress: 50 };
      return { label: stage.label, progress: stage.progress, active: true };
    }
    return { label: "Standby", progress: 0, active: false };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* COLONNE GAUCHE */}
      <div className="space-y-4">
        {/* 4 KPIs */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Chantiers", value: String(stats.chantiers), sub: "actifs", color: "red", icon: Flame, tab: "chantiers" as BlueprintTabId },
            { label: "Projets", value: String(stats.projets), sub: "en cours", color: "blue", icon: Package, tab: "projets" as BlueprintTabId },
            { label: "Missions", value: String(stats.missions), sub: `${stats.missionsDone} completes`, color: "violet", icon: ListChecks, tab: "missions" as BlueprintTabId },
            { label: "Taches", value: String(stats.taches), sub: `${stats.tachesDone} terminees`, color: "emerald", icon: CheckCircle2, tab: "taches" as BlueprintTabId },
          ].map((kpi) => (
            <KPICard key={kpi.label} kpi={{ ...kpi, onClick: () => nav.goTo(kpi.tab) }} />
          ))}
        </div>

        {/* Progression */}
        <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
          <div className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Progression</span>
            <span className="ml-auto text-sm font-bold text-emerald-400">{pctDone}%</span>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full flex items-center justify-center transition-all" style={{ width: `${pctDone}%` }}>
                {pctDone > 8 && <span className="text-[8px] font-bold text-white">{pctDone}%</span>}
              </div>
              <div className="bg-amber-400 h-full flex items-center justify-center transition-all" style={{ width: `${pctEnCours}%` }}>
                {pctEnCours > 8 && <span className="text-[8px] font-bold text-white">{pctEnCours}%</span>}
              </div>
              <div className="bg-gray-200 h-full flex items-center justify-center transition-all" style={{ width: `${pctAFaire}%` }}>
                {pctAFaire > 8 && <span className="text-[8px] font-bold text-gray-500">{pctAFaire}%</span>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { v: stats.missionsDone, l: "COMPLETES", c: "emerald" },
                { v: missionsEnCours, l: "EN COURS", c: "amber" },
                { v: stats.taches, l: "TACHES", c: "blue" },
              ].map((s) => (
                <div key={s.l} className={cn("text-center p-2 rounded-lg border", `bg-${s.c}-50 border-${s.c}-100`)}>
                  <div className={cn("text-lg font-bold", `text-${s.c}-600`)}>{s.v}</div>
                  <div className={cn("text-[9px] font-medium", `text-${s.c}-600`)}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Arbre chantiers (API) */}
        <div>
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-2">{stats.chantiers} Chantier{stats.chantiers > 1 ? "s" : ""} — {stats.projets} Projets</div>
          <HierarchieGHML key="overview-tree" compact />
        </div>
      </div>

      {/* COLONNE DROITE */}
      <div className="space-y-4">
        {/* Bots COMMAND Status (live) */}
        <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
          <div className="px-4 py-2 bg-gradient-to-r from-violet-700 to-violet-600 flex items-center gap-2">
            <Bot className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Equipe C-Level</span>
            {loadingCommand && <Loader2 className="h-3.5 w-3.5 animate-spin text-white/50 ml-auto" />}
          </div>
          <div className="p-3 grid grid-cols-3 gap-2">
            {CLEVEL_BOTS.map((bot) => {
              const status = botStatus(bot.code);
              return (
                <div key={bot.code} className="p-2 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-1.5 mb-1">
                    <img src={BOT_AVATAR[bot.code]} alt={bot.nom} className="w-6 h-6 rounded-full ring-1 ring-white shadow-sm" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-gray-800 truncate">{bot.nom}</p>
                      <p className="text-[8px] text-gray-400">{bot.role}</p>
                    </div>
                    {status.active && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-auto shrink-0" />}
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", status.active ? "bg-blue-500" : "bg-gray-300")} style={{ width: `${status.progress}%` }} />
                  </div>
                  <p className="text-[8px] text-gray-400 mt-0.5">{status.label}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Playbooks Populaires */}
        <div>
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" />
            Playbooks Populaires
          </div>
          <div className="space-y-2">
            {PLAYBOOK_TEMPLATES.filter((p) => p.populaire).map((pb) => (
              <PlaybookCard key={pb.id} pb={pb} onDeploy={onDeploy} />
            ))}
          </div>
        </div>

        {/* Flow CREDO → Blueprint */}
        <Card className="p-0 overflow-hidden border border-gray-200">
          <div className="px-4 py-2 bg-gradient-to-r from-violet-700 to-violet-600 flex items-center gap-2">
            <Route className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Flow CREDO → Blueprint</span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: "Discussion", color: "gray", desc: "LiveChat CREDO" },
                { label: "→", color: "" },
                { label: "Action Footer", color: "violet", desc: "Nuancer, Deleguer..." },
                { label: "→", color: "" },
                { label: "Mission creee", color: "blue", desc: "Dans un projet" },
                { label: "→", color: "" },
                { label: "Blueprint", color: "emerald", desc: "Execution + suivi" },
              ].map((step, i) => step.label === "→" ? (
                <ChevronRight key={i} className="h-4 w-4 text-gray-300" />
              ) : (
                <div key={i} className={cn("text-center p-2 rounded-lg border min-w-[70px]", `bg-${step.color}-50 border-${step.color}-200`)}>
                  <div className={cn("text-[9px] font-bold", `text-${step.color}-700`)}>{step.label}</div>
                  <div className="text-[8px] text-gray-400">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ================================================================
// TAB: OPPORTUNITES (API — missions avec tags externe/fournisseur)
// ================================================================

function TabOpportunites() {
  return (
    <div className="space-y-4">
      <Card className="p-0 overflow-hidden border-2 border-orange-200">
        <div className="px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-500 flex items-center gap-2">
          <Zap className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Opportunites</span>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-gray-600">Les missions necessitant une expertise externe ou un partenaire apparaitront ici automatiquement.</p>
          <p className="text-[9px] text-gray-400 mt-1">Publiables sur Orbit9 pour jumelage inter-entreprises.</p>
        </div>
      </Card>
    </div>
  );
}

// ================================================================
// TAB: EQUIPE
// ================================================================

function TabEquipe() {
  const team = [
    { role: "Carl Fugere", code: "N1 Commandant", color: "cyan", icon: Users, chantiers: ["CH-9", "CH-13"], desc: "Vision, decisions, GO/STOP.", actions: ["Valider plans avant execution", "Pioneer Circle: 9 meetings"] },
    { role: "Claude Code", code: "CTOB D1-D2 CTO", color: "violet", icon: Code2, chantiers: ["CH-1", "CH-2", "CH-4", "CH-8"], desc: "Execution technique. Code, build, deploy.", actions: ["Nettoyage code (CH-1)", "JWT auth (CH-2)", "Wiring reel (CH-4)"] },
    { role: "Gemini", code: "PM D2 Sentinelle", color: "amber", icon: Eye, chantiers: ["CH-3", "CH-5", "CH-11", "CH-12"], desc: "Generation contenu bulk. SOULs enrichis.", actions: ["7 catalogues JSON (CH-3)", "SOULs 12 bots (CH-5)"] },
    { role: "CarlOS (CEOB)", code: "CEO Bot", color: "blue", icon: Bot, chantiers: ["CH-6", "CH-10"], desc: "Onboarding, GPS, orchestration COMMAND.", actions: ["Playbooks M1/M2/M3 (CH-6)", "Orbit9 scout (CH-10)"] },
    { role: "12 Bots C-Level", code: "Specialistes", color: "gray", icon: Users, chantiers: ["Selon specialite"], desc: "Chaque bot dans son domaine.", actions: ["CFOB: Stripe + pricing", "CMOB: Marketing", "CSOB: Strategie", "CLOB: Legal", "CISOB: Securite"] },
  ];

  return (
    <div className="space-y-4">
      {team.map((m) => {
        const Icon = m.icon;
        return (
          <Card key={m.role} className="p-0 overflow-hidden border shadow-sm">
            <div className={cn("px-4 py-2.5 flex items-center gap-2 border-b bg-gradient-to-r", `from-${m.color}-600 to-${m.color}-500`)}>
              <Icon className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">{m.role}</span>
              <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-medium bg-white/90 text-gray-700">{m.code}</span>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-600 mb-2">{m.desc}</p>
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                <span className="text-[9px] font-bold text-gray-500">Chantiers:</span>
                {m.chantiers.map((chId) => (
                  <span key={chId} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{chId}</span>
                ))}
              </div>
              <div className="space-y-1 pt-2 border-t border-gray-100">
                {m.actions.map((a, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-[9px] text-gray-600">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ================================================================
// TAB: TIMELINE
// ================================================================

function TabTimeline() {
  const phases = [
    { phase: "Phase 1", label: "Fondations + Contenu", timing: "Semaine 1-2", color: "violet", chantiers: ["CH-1", "CH-2", "CH-3"], milestone: "Base solide + contenu reel" },
    { phase: "Phase 2", label: "Produit + Intelligence + Parcours", timing: "Semaine 3-5", color: "blue", chantiers: ["CH-4", "CH-5", "CH-6"], milestone: "Produit demo-ready avec bots intelligents" },
    { phase: "Phase 3", label: "Gouvernance + Communication + Commercial", timing: "Semaine 5-8", color: "pink", chantiers: ["CH-7", "CH-8", "CH-9"], milestone: "9 pioneers signes" },
    { phase: "Phase 4", label: "Reseau + Documentation", timing: "Mois 2-3", color: "orange", chantiers: ["CH-10", "CH-11"], milestone: "Effet de reseau + docs auto" },
    { phase: "Phase 5", label: "Intelligence Predictive + Scale", timing: "Mois 3-12", color: "amber", chantiers: ["CH-12", "CH-13"], milestone: "Ecosysteme autonome et profitable" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">5 phases, 13 chantiers, de fondations a ecosysteme.</p>
      {phases.map((p, i) => (
        <Card key={p.phase} className="p-0 overflow-hidden border shadow-sm">
          <div className={cn("px-4 py-2.5 flex items-center gap-2 border-b bg-gradient-to-r", `from-${p.color}-600 to-${p.color}-500`)}>
            <span className="text-sm font-bold text-white">{p.phase}</span>
            <span className="text-xs text-white/80">— {p.label}</span>
            <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-medium bg-white/90 text-gray-700">{p.timing}</span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              <span className="text-[9px] font-bold text-gray-500">Chantiers:</span>
              {p.chantiers.map((chId) => (
                <span key={chId} className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", `bg-${p.color}-100 text-${p.color}-700`)}>{chId}</span>
              ))}
            </div>
            <div className={cn("p-2 rounded-lg border", `bg-${p.color}-50 border-${p.color}-200`)}>
              <div className="flex items-center gap-1.5">
                <Target className={cn("h-3.5 w-3.5", `text-${p.color}-600`)} />
                <span className={cn("text-[9px] font-bold", `text-${p.color}-700`)}>Milestone:</span>
                <span className={cn("text-[9px]", `text-${p.color}-600`)}>{p.milestone}</span>
              </div>
            </div>
            {i < phases.length - 1 && <div className="flex justify-center pt-2"><ChevronRight className="h-4 w-4 text-gray-300 rotate-90" /></div>}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export function BlueprintView() {
  const { setActiveView } = useFrameMaster();
  const [activeTab, setActiveTab] = useState<BlueprintTabId>("overview");

  // API data — source unique de vérité
  const [apiChantiers, setApiChantiers] = useState<Record<string, unknown>[]>([]);
  const [apiProjets, setApiProjets] = useState<Record<string, unknown>[]>([]);
  const [apiMissions, setApiMissions] = useState<Record<string, unknown>[]>([]);
  const [apiTaches, setApiTaches] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    api.listChantiers().then((r) => setApiChantiers((r as Record<string, unknown>).chantiers as Record<string, unknown>[] || [])).catch(() => {});
    api.listProjets().then((r) => setApiProjets(Array.isArray(r) ? r : [])).catch(() => {});
    api.listMissions().then((r) => setApiMissions((r as Record<string, unknown>).missions as Record<string, unknown>[] || [])).catch(() => {});
    api.listTachesUser().then((r) => setApiTaches(Array.isArray(r) ? r : [])).catch(() => {});
  }, []);

  const stats = useMemo(() => {
    const nbMissionsDone = apiMissions.filter((m) => m.status === "completee" || m.status === "complete").length;
    const nbTachesDone = apiTaches.filter((t) => t.status === "complete").length;
    return {
      chantiers: apiChantiers.length,
      projets: apiProjets.length,
      missions: apiMissions.length,
      taches: apiTaches.length,
      missionsDone: nbMissionsDone,
      tachesDone: nbTachesDone,
    };
  }, [apiChantiers, apiProjets, apiMissions, apiTaches]);

  const goTo = (tab: BlueprintTabId) => {
    setActiveTab(tab);
  };

  // Deploy playbook composable — refresh data after deploy
  const handleDeployPlaybook = useCallback(async (playbookId: string, options?: { parent_chantier_id?: number; parent_projet_id?: number; parent_mission_id?: number }) => {
    await api.deployPlaybook(playbookId, options);
    // Refresh all data
    api.listChantiers().then((r) => setApiChantiers((r as Record<string, unknown>).chantiers as Record<string, unknown>[] || [])).catch(() => {});
    api.listProjets().then((r) => setApiProjets(Array.isArray(r) ? r : [])).catch(() => {});
    api.listMissions().then((r) => setApiMissions((r as Record<string, unknown>).missions as Record<string, unknown>[] || [])).catch(() => {});
    api.listTachesUser().then((r) => setApiTaches(Array.isArray(r) ? r : [])).catch(() => {});
  }, []);

  const nav: BlueprintNav = { tab: activeTab, chantierId: null, projetId: null, missionIdx: null, goTo: (t) => goTo(t) };

  return (
    <BlueprintFrame
      title="Strategique"
      subtitle=""
      icon={Rocket}
      iconColor="text-blue-600"
      tabs={BLUEPRINT_TABS}
      activeTab={activeTab}
      onTabChange={(t) => goTo(t as BlueprintTabId)}
      onBack={() => setActiveView("dashboard")}
    >
      {activeTab === "overview" && <TabOverview nav={nav} stats={stats} onDeploy={handleDeployPlaybook} />}
      {activeTab === "timeline" && <TabTimeline />}
      {activeTab === "chantiers" && <HierarchieGHML key="bp-chantiers" showStats showTemplates onDeploy={handleDeployPlaybook} />}
      {activeTab === "projets" && <HierarchieGHML key="bp-projets" defaultLevel="projets" showStats showTemplates onDeploy={handleDeployPlaybook} />}
      {activeTab === "missions" && <HierarchieGHML key="bp-missions" defaultLevel="missions" showTemplates onDeploy={handleDeployPlaybook} />}
      {activeTab === "taches" && <HierarchieGHML key="bp-taches" defaultLevel="taches" showTemplates onDeploy={handleDeployPlaybook} />}
      {activeTab === "opportunites" && <TabOpportunites />}
      {activeTab === "equipes" && <TabEquipe />}
    </BlueprintFrame>
  );
}
