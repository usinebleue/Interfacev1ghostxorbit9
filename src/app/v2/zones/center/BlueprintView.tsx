/**
 * BlueprintView.tsx — Blueprint Unifie (fusion Tactique + Strategique)
 * 12 tabs: Sommaire, Objectifs, Vue d'ensemble, Chantiers, Projets, Missions, Taches, Timeline, Documents, Playbooks, Diagnostics, Equipe
 * CEO voit TOUT — pas de filtre par bot
 * Remplace StrategiqueView + la partie CEOB de DepartmentTourDeControle
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Rocket, Package, Users,
  Target, Brain, ChevronRight, ChevronDown,
  Flame, Bot, Code2, Eye, Zap,
  CheckCircle2, Clock,
  Layers, BarChart3,
  BookOpen, FileText, Route,
  Sparkles, ListChecks,
  Loader2, Inbox,
  Stethoscope, FolderOpen, Pencil, Trash2,
  AlertTriangle, DollarSign, CalendarDays, Shield, TrendingUp,
  LayoutGrid, List, Columns, Table2,
  Building2, Save, Globe, MapPin, Briefcase,
  Search, Upload, Wand2,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { Card } from "../../../components/ui/card";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { useCanvasActions } from "../../context/CanvasActionContext";
import { BOT_AVATAR } from "../../api/types";
import { api } from "../../api/client";
import { useChantiers, useProjets, useMissions, useTachesUser } from "../../api/hooks";
import { HierarchieGHML } from "./shared/HierarchieGHML";
import type {
  Chantier as APIChantier,
  Projet as APIProjet,
  Mission as APIMission,
  TacheUser,
  DiagnosticCatalogue,
  TemplateDocumentaire,
  EntrepriseProfil,
} from "../../api/types";
import { SectionFrame } from "./shared/SectionFrame";
import { PlaybookCard, KPICard, StatusBadge, BotBadge, ChaleurBadge } from "./shared/SectionComponents";
import { BLUEPRINT_TABS, BOT_INFO, PLAYBOOK_TEMPLATES } from "./shared/section-config";
import { CrudToolbar, type SortField, type SortDir } from "./shared/CrudToolbar";
import { EntityModal, type EntityLevel } from "./shared/EntityModal";
import { CatalogueGrid } from "./shared/CatalogueGrid";
import { PixelAgentGrid, FlowSimulation, type PixelAgentState } from "./shared/PixelAgent";
import type { BlueprintTabId } from "./shared/section-types";

// ================================================================
// STATUS MAPPER
// ================================================================

function mapStatus(s: string): "done" | "en-cours" | "a-faire" | "bloque" {
  switch (s) {
    case "completee": case "completed": case "done": return "done";
    case "en_cours": case "en-cours": case "active": return "en-cours";
    case "en_attente": case "a-faire": case "a_faire": return "a-faire";
    case "bloque": case "archivee": return "bloque";
    default: return "a-faire";
  }
}

// ================================================================
// COMMAND STAGES
// ================================================================

const STAGE_LABELS: Record<string, { label: string; progress: number }> = {
  scan: { label: "Scan en cours", progress: 25 },
  strategie: { label: "Strategie", progress: 50 },
  execution: { label: "Execution", progress: 75 },
  bilan: { label: "Bilan", progress: 90 },
  done: { label: "Termine", progress: 100 },
};

const CLEVEL_BOTS = [
  { code: "CEOB", nom: "CarlOS", role: "CEO", dept: "Direction" },
  { code: "CTOB", nom: "Thierry", role: "CTO", dept: "Technologie" },
  { code: "CFOB", nom: "Francois", role: "CFO", dept: "Finance" },
  { code: "CMOB", nom: "Martine", role: "CMO", dept: "Marketing" },
  { code: "CSOB", nom: "Sophie", role: "CSO", dept: "Strategie" },
  { code: "COOB", nom: "Olivier", role: "COO", dept: "Operations" },
];

// ================================================================
// TAB: VUE D'ENSEMBLE (fusionnee)
// ================================================================

function TabOverview({ goTo, stats, onDeploy }: {
  goTo: (tab: BlueprintTabId) => void;
  stats: { chantiers: number; projets: number; missions: number; taches: number; missionsDone: number; tachesDone: number; docs: number; playbooks: number; diagnostics: number };
  onDeploy?: (playbookId: string) => Promise<void>;
}) {
  const [commandMissions, setCommandMissions] = useState<Record<string, unknown>[]>([]);
  const [loadingCommand, setLoadingCommand] = useState(true);
  const [urgentTaches, setUrgentTaches] = useState<Record<string, unknown>[]>([]);
  const [pendingDecisions, setPendingDecisions] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    api.commandMissions(10)
      .then((res) => setCommandMissions(Array.isArray(res) ? res : (res as Record<string, unknown>).missions as Record<string, unknown>[] || []))
      .catch(() => setCommandMissions([]))
      .finally(() => setLoadingCommand(false));
    // Taches urgentes — en_cours ou en_attente, top 5
    api.listTachesUser({ status: "en_cours" })
      .then((res) => setUrgentTaches((Array.isArray(res) ? res : []).slice(0, 5)))
      .catch(() => setUrgentTaches([]));
    // Decisions recentes
    api.listDecisions({ limit: 5 })
      .then((res) => setPendingDecisions(res.decisions || []))
      .catch(() => setPendingDecisions([]));
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
    <div className="space-y-5">
      {/* ═══ ZONE PRINCIPALE — 2 colonnes ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* COLONNE GAUCHE — KPIs + Arbre chantiers */}
        <div className="space-y-3">
          {/* 4 KPIs hierarchie */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Chantiers", value: String(stats.chantiers), sub: "actifs", color: "red", icon: Flame, tab: "chantiers" as BlueprintTabId },
              { label: "Projets", value: String(stats.projets), sub: "en cours", color: "blue", icon: Package, tab: "projets" as BlueprintTabId },
              { label: "Missions", value: String(stats.missions), sub: `${stats.missionsDone} completes`, color: "violet", icon: ListChecks, tab: "missions" as BlueprintTabId },
              { label: "Taches", value: String(stats.taches), sub: `${stats.tachesDone} terminees`, color: "emerald", icon: CheckCircle2, tab: "taches" as BlueprintTabId },
            ].map((kpi) => (
              <KPICard key={kpi.label} kpi={{ ...kpi, onClick: () => goTo(kpi.tab) }} />
            ))}
          </div>

          {/* Arbre chantiers — pleine largeur pour drill-down */}
          <div>
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-2">{stats.chantiers} Chantier{stats.chantiers > 1 ? "s" : ""} — {stats.projets} Projets</div>
            <HierarchieGHML key="overview-tree" compact />
          </div>
        </div>

        {/* COLONNE DROITE — Progression + 6 box Pouls CEO (2x3) */}
        <div className="space-y-3">
          {/* Progression */}
          <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
            <div className="px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-700 flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-bold text-white">Progression</span>
              <span className="ml-auto text-xs font-bold text-emerald-400">{pctDone}%</span>
            </div>
            <div className="px-3 py-2.5 space-y-2">
              <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full flex items-center justify-center transition-all" style={{ width: `${pctDone}%` }}>
                  {pctDone > 10 && <span className="text-[7px] font-bold text-white">{pctDone}%</span>}
                </div>
                <div className="bg-amber-400 h-full flex items-center justify-center transition-all" style={{ width: `${pctEnCours}%` }}>
                  {pctEnCours > 10 && <span className="text-[7px] font-bold text-white">{pctEnCours}%</span>}
                </div>
                <div className="bg-gray-200 h-full flex items-center justify-center transition-all" style={{ width: `${pctAFaire}%` }}>
                  {pctAFaire > 10 && <span className="text-[7px] font-bold text-gray-500">{pctAFaire}%</span>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { v: stats.missionsDone, l: "COMPLETES", c: "emerald" },
                  { v: missionsEnCours, l: "EN COURS", c: "amber" },
                  { v: stats.taches, l: "TACHES", c: "blue" },
                ].map((s) => (
                  <div key={s.l} className={cn("text-center py-1.5 px-1 rounded-lg border", `bg-${s.c}-50 border-${s.c}-100`)}>
                    <div className={cn("text-base font-bold", `text-${s.c}-600`)}>{s.v}</div>
                    <div className={cn("text-[8px] font-medium", `text-${s.c}-600`)}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* 6 box Pouls CEO — grille 2 colonnes */}
          <div className="grid grid-cols-2 gap-2">
            {/* 1. Taches Urgentes */}
            <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
              <div className="px-2.5 py-1.5 bg-gradient-to-r from-red-600 to-red-500 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold text-white">Taches Urgentes</span>
                <span className="ml-auto text-[8px] font-bold bg-white/25 text-white px-1 py-0.5 rounded-full">{urgentTaches.length}</span>
              </div>
              <div className="p-2 space-y-1.5">
                {urgentTaches.length === 0 ? (
                  <p className="text-[9px] text-gray-400 italic">Aucune tache urgente</p>
                ) : (
                  urgentTaches.slice(0, 3).map((t, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-red-400 mt-1 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-medium text-gray-800 truncate">{(t.titre as string) || "Sans titre"}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* 2. Agenda */}
            <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
              <div className="px-2.5 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold text-white">Agenda</span>
              </div>
              <div className="p-2 space-y-1.5">
                {[
                  { primary: "A connecter", sub: "Calendar / Plane.so" },
                  { primary: "Prochaine reunion", sub: "A configurer" },
                  { primary: "Echeances", sub: "A connecter" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-cyan-400 mt-1 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-medium text-gray-800">{item.primary}</p>
                      <p className="text-[8px] text-gray-400">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 3. Tresorerie */}
            <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
              <div className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold text-white">Tresorerie</span>
              </div>
              <div className="p-2 space-y-1.5">
                {[
                  { primary: "Cash flow", value: "—" },
                  { primary: "Reserves", value: "—" },
                  { primary: "Factures retard", value: "—" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <p className="text-[9px] font-medium text-gray-800">{item.primary}</p>
                    <span className="text-[9px] font-bold text-gray-400">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* 4. Pipeline Ventes */}
            <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
              <div className="px-2.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold text-white">Pipeline Ventes</span>
              </div>
              <div className="p-2 space-y-1.5">
                {[
                  { primary: "Pipeline total", value: "—" },
                  { primary: "Deals en cours", value: "—" },
                  { primary: "Taux closing", value: "—" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <p className="text-[9px] font-medium text-gray-800">{item.primary}</p>
                    <span className="text-[9px] font-bold text-gray-400">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* 5. Alertes */}
            <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
              <div className="px-2.5 py-1.5 bg-gradient-to-r from-orange-600 to-orange-500 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold text-white">Alertes</span>
              </div>
              <div className="p-2 space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <p className="text-[9px] font-medium text-emerald-600">Aucune alerte critique</p>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-gray-300 mt-1 shrink-0" />
                  <p className="text-[9px] font-medium text-gray-500">CFO · CISO a connecter</p>
                </div>
              </div>
            </Card>

            {/* 6. Decisions */}
            <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
              <div className="px-2.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold text-white">Decisions</span>
                <span className="ml-auto text-[8px] font-bold bg-white/25 text-white px-1 py-0.5 rounded-full">{pendingDecisions.length}</span>
              </div>
              <div className="p-2 space-y-1.5">
                {pendingDecisions.length === 0 ? (
                  <p className="text-[9px] text-gray-400 italic">Aucune decision recente</p>
                ) : (
                  pendingDecisions.slice(0, 3).map((d, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-medium text-gray-800 truncate">{(d.titre as string) || "Decision"}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ═══ PIXEL AGENTS — Bots au Travail ═══ */}
      <PixelAgentGrid
        botStates={Object.fromEntries(
          CLEVEL_BOTS.map((bot) => {
            const status = botStatus(bot.code);
            return [bot.code, status.active ? "typing" as PixelAgentState : "idle" as PixelAgentState];
          })
        )}
        onBotClick={(code) => goTo("equipe")}
      />

      {/* ═══ FLOW SIMULATION — Ligne de Production Usine Bleue ═══ */}
      <FlowSimulation />

      {/* ═══ ZONE CONCEPTS À FINALISER ═══ */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Concepts a finaliser</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 opacity-70">
          {/* Bots COMMAND Status */}
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
          <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
            <div className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Playbooks Populaires</span>
            </div>
            <div className="p-3 space-y-2">
              {PLAYBOOK_TEMPLATES.filter((p) => p.populaire).map((pb) => (
                <PlaybookCard key={pb.id} pb={pb} onDeploy={onDeploy} />
              ))}
            </div>
          </Card>

          {/* Flow CREDO → Blueprint */}
          <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-600 flex items-center gap-2">
              <Route className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Flow CREDO</span>
            </div>
            <div className="p-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: "Discussion", color: "gray" },
                  { label: "→", color: "" },
                  { label: "Action", color: "violet" },
                  { label: "→", color: "" },
                  { label: "Mission", color: "blue" },
                  { label: "→", color: "" },
                  { label: "Blueprint", color: "emerald" },
                ].map((step, i) => step.label === "→" ? (
                  <ChevronRight key={i} className="h-3.5 w-3.5 text-gray-300" />
                ) : (
                  <span key={i} className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded", `bg-${step.color}-50 text-${step.color}-700`)}>{step.label}</span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
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
// HIERARCHIE TAB — With CrudToolbar + drill-down via tab switch
// ================================================================

function HierarchieTab({
  level,
  goTo,
  parentFilter,
}: {
  level: "chantiers" | "projets" | "missions" | "taches";
  goTo: (tab: BlueprintTabId, filter?: { type: string; id: number; titre: string }) => void;
  parentFilter?: { type: string; id: number; titre: string } | null;
}) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("titre");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categorieFilter, setCategorieFilter] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "list" | "kanban" | "spreadsheet">("cards");

  // Data hooks — filter by parent if set
  const chantierId = parentFilter?.type === "chantier" ? parentFilter.id : undefined;
  const projetId = parentFilter?.type === "projet" ? parentFilter.id : undefined;
  const missionId = parentFilter?.type === "mission" ? parentFilter.id : undefined;

  const { chantiers, loading: loadC, refresh: refreshC, create: createChantier, remove: removeChantier } = useChantiers();
  const { projets, loading: loadP, refresh: refreshP, create: createProjet, remove: removeProjet } = useProjets(chantierId);
  const { missions, loading: loadM, refresh: refreshM, create: createMission, remove: removeMission } = useMissions(chantierId, projetId);
  const tacheFilters = useMemo(() => {
    if (missionId) return { mission_id: missionId };
    if (projetId) return { projet_id: projetId };
    if (chantierId) return { chantier_id: chantierId };
    return undefined;
  }, [missionId, projetId, chantierId]);
  const { taches, loading: loadT, refresh: refreshT, create: createTache, complete: completeTache, remove: removeTache } = useTachesUser(tacheFilters);

  // Parent title lookup maps (resolve IDs → titles from already-loaded data)
  const chantierTitreMap = useMemo(() => {
    const map: Record<number, string> = {};
    chantiers.forEach((c) => { map[c.id] = c.titre; });
    return map;
  }, [chantiers]);

  const projetTitreMap = useMemo(() => {
    const map: Record<number, string> = {};
    projets.forEach((p) => { map[p.id] = p.titre; });
    return map;
  }, [projets]);

  const missionTitreMap = useMemo(() => {
    const map: Record<number, string> = {};
    missions.forEach((m) => { map[m.id] = m.titre; });
    return map;
  }, [missions]);

  // Select data for current level
  const rawItems: Record<string, unknown>[] = useMemo(() => {
    switch (level) {
      case "chantiers": return chantiers as unknown as Record<string, unknown>[];
      case "projets": return projets as unknown as Record<string, unknown>[];
      case "missions": return missions as unknown as Record<string, unknown>[];
      case "taches": return taches as unknown as Record<string, unknown>[];
    }
  }, [level, chantiers, projets, missions, taches]);

  const loading = level === "chantiers" ? loadC : level === "projets" ? loadP : level === "missions" ? loadM : loadT;

  // Filter + sort
  const items = useMemo(() => {
    let list = [...rawItems];
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((item) => {
        const titre = (item.titre as string) || "";
        const desc = (item.description as string) || "";
        return titre.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
      });
    }
    // Status filter
    if (statusFilter) {
      list = list.filter((item) => mapStatus((item.status as string) || "") === statusFilter);
    }
    // Categorie filter
    if (categorieFilter) {
      list = list.filter((item) => (item.categorie as string) === categorieFilter);
    }
    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "titre") {
        cmp = ((a.titre as string) || "").localeCompare((b.titre as string) || "");
      } else if (sortField === "date") {
        cmp = ((a.created_at as string) || "").localeCompare((b.created_at as string) || "");
      } else if (sortField === "statut") {
        cmp = mapStatus((a.status as string) || "").localeCompare(mapStatus((b.status as string) || ""));
      } else if (sortField === "priorite") {
        cmp = ((a.priorite as number) || 0) - ((b.priorite as number) || 0);
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return list;
  }, [rawItems, search, statusFilter, categorieFilter, sortField, sortDir]);

  // Group items by parent — uses lookup maps to resolve parent titles
  // Groups in BOTH direct and drill-down views (drill-down groups by next parent level up)
  const groupedItems = useMemo(() => {
    if (level === "chantiers") return null; // top level, no grouping
    if (level === "projets") {
      const groups: Record<string, { parentTitre: string; items: Record<string, unknown>[] }> = {};
      items.forEach((item) => {
        const cid = item.chantier_id as number;
        const key = String(cid || "sans-chantier");
        const titre = (cid && chantierTitreMap[cid]) || "Sans chantier";
        if (!groups[key]) groups[key] = { parentTitre: titre, items: [] };
        groups[key].items.push(item);
      });
      return Object.values(groups);
    }
    if (level === "missions") {
      const groups: Record<string, { parentTitre: string; items: Record<string, unknown>[] }> = {};
      items.forEach((item) => {
        const pid = item.projet_id as number;
        const key = String(pid || "sans-projet");
        const titre = (pid && projetTitreMap[pid]) || "Sans projet";
        if (!groups[key]) groups[key] = { parentTitre: titre, items: [] };
        groups[key].items.push(item);
      });
      return Object.values(groups);
    }
    if (level === "taches") {
      const groups: Record<string, { parentTitre: string; items: Record<string, unknown>[] }> = {};
      items.forEach((item) => {
        const mid = item.mission_id as number;
        const key = String(mid || "sans-mission");
        const titre = (mid && missionTitreMap[mid]) || "Sans mission";
        if (!groups[key]) groups[key] = { parentTitre: titre, items: [] };
        groups[key].items.push(item);
      });
      return Object.values(groups);
    }
    return null;
  }, [level, items, chantierTitreMap, projetTitreMap, missionTitreMap]);

  // CRUD handlers
  const handleSave = async (data: Record<string, unknown>) => {
    if (editItem) {
      // Update
      const id = editItem.id as number;
      if (level === "chantiers") await api.updateChantier(id, data);
      else if (level === "projets") await api.updateProjet(id, data);
      else if (level === "missions") await api.updateMission(id, data);
      else if (level === "taches") await api.updateTacheUser(id, data);
    } else {
      // Create
      if (level === "chantiers") await createChantier((data.titre as string), (data.chaleur as string));
      else if (level === "projets") await createProjet(data as Parameters<typeof createProjet>[0]);
      else if (level === "missions") await createMission((data.titre as string), (data.bot_primaire as string));
      else if (level === "taches") await createTache(data);
    }
    // Refresh
    if (level === "chantiers") refreshC();
    else if (level === "projets") refreshP();
    else if (level === "missions") refreshM();
    else refreshT();
  };

  const handleDelete = async () => {
    if (!editItem) return;
    const id = editItem.id as number;
    if (level === "chantiers") await removeChantier(id);
    else if (level === "projets") await removeProjet(id);
    else if (level === "missions") await removeMission(id);
    else if (level === "taches") await removeTache(id);
  };

  const handleComplete = async (id: number) => {
    if (level === "taches") {
      await completeTache(id);
    }
  };

  // Drill-down on click
  const handleDrillDown = (item: Record<string, unknown>) => {
    const id = item.id as number;
    const titre = (item.titre as string) || "";
    if (level === "chantiers") goTo("projets", { type: "chantier", id, titre });
    else if (level === "projets") goTo("missions", { type: "projet", id, titre });
    else if (level === "missions") goTo("taches", { type: "mission", id, titre });
  };

  // Parent options for modal
  const parentOptions = useMemo(() => {
    if (level === "projets") return chantiers.map((c) => ({ id: c.id, titre: c.titre }));
    if (level === "missions") return projets.map((p) => ({ id: p.id, titre: p.titre }));
    if (level === "taches") return missions.map((m) => ({ id: m.id, titre: m.titre }));
    return undefined;
  }, [level, chantiers, projets, missions]);

  const parentLabel = level === "projets" ? "Chantier parent" : level === "missions" ? "Projet parent" : level === "taches" ? "Mission parent" : undefined;

  const levelLabels: Record<string, string> = { chantiers: "chantiers", projets: "projets", missions: "missions", taches: "taches" };
  const levelSingular: Record<string, EntityLevel> = { chantiers: "chantier", projets: "projet", missions: "mission", taches: "tache" };

  const gradients: Record<string, string> = {
    chantiers: "from-blue-600 to-blue-500",
    projets: "from-blue-600 to-blue-500",
    missions: "from-violet-600 to-violet-500",
    taches: "from-emerald-600 to-emerald-500",
  };

  const levelIcons: Record<string, React.ElementType> = {
    chantiers: Rocket,
    projets: FolderOpen,
    missions: ListChecks,
    taches: CheckCircle2,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Chargement...</span>
      </div>
    );
  }

  const LevelIcon = levelIcons[level];

  // Parent level info (for breadcrumb trail)
  const parentLevelLabels: Record<string, string> = {
    chantier: "Chantier",
    projet: "Projet",
    mission: "Mission",
  };
  const parentLevelIcons: Record<string, React.ElementType> = {
    chantier: Rocket,
    projet: FolderOpen,
    mission: ListChecks,
  };
  const parentGradients: Record<string, string> = {
    chantier: "from-blue-600 to-blue-500",
    projet: "from-blue-600 to-blue-500",
    mission: "from-violet-600 to-violet-500",
  };
  // Group header gradients (lighter, for section separators)
  const groupGradients: Record<string, string> = {
    projets: "from-blue-50 to-blue-100",
    missions: "from-violet-50 to-violet-100",
    taches: "from-emerald-50 to-emerald-100",
  };
  const groupTextColors: Record<string, string> = {
    projets: "text-blue-700",
    missions: "text-violet-700",
    taches: "text-emerald-700",
  };
  const groupIconColors: Record<string, string> = {
    projets: "text-blue-500",
    missions: "text-violet-500",
    taches: "text-emerald-500",
  };

  const renderItem = (item: Record<string, unknown>, idx: number) => {
    const status = mapStatus((item.status as string) || "");
    const isTache = level === "taches";
    const gradient = isTache
      ? (status === "done" ? "from-emerald-600 to-emerald-500" : status === "en-cours" ? "from-amber-600 to-amber-500" : "from-gray-500 to-gray-400")
      : gradients[level];

    const handleClick = () => {
      if (isTache) { setEditItem(item); setModalOpen(true); }
      else handleDrillDown(item);
    };

    // ── MODE LISTE (compact — 1 ligne par item) ──
    if (viewMode === "list") {
      return (
        <div
          key={(item.id as number) || idx}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer"
          onClick={handleClick}
        >
          <StatusBadge status={status} />
          <span className={cn("text-[9px] font-bold flex-1 truncate", isTache && status === "done" && "line-through text-gray-400")}>
            {(item.titre as string) || "Sans titre"}
          </span>
          {(item.bot_primaire as string) && <BotBadge code={item.bot_primaire as string} />}
          {(item.missions_count as number) > 0 && (
            <span className="text-[8px] text-gray-400">{item.missions_count} missions</span>
          )}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isTache && status !== "done" && (
              <button onClick={(e) => { e.stopPropagation(); handleComplete(item.id as number); }} className="p-0.5 rounded hover:bg-gray-200" title="Completer">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); setEditItem(item); setModalOpen(true); }} className="p-0.5 rounded hover:bg-gray-200" title="Modifier">
              <Pencil className="h-3.5 w-3.5 text-gray-400" />
            </button>
          </div>
          {!isTache && <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 shrink-0" />}
        </div>
      );
    }

    // ── MODE CARDS (défaut — gradient header + body) ──
    return (
      <div
        key={(item.id as number) || idx}
        className="w-full p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all group"
      >
        <div className={cn("px-3 py-2 flex items-center gap-2 bg-gradient-to-r", gradient)}>
          <LevelIcon className={cn("h-3.5 w-3.5 text-white shrink-0", isTache && status === "done" ? "opacity-100" : isTache ? "opacity-50" : "")} />
          <button
            onClick={handleClick}
            className={cn(
              "text-[9px] font-bold text-white flex-1 truncate text-left cursor-pointer hover:underline",
              isTache && status === "done" && "line-through opacity-80",
            )}
          >
            {(item.titre as string) || "Sans titre"}
          </button>
          <StatusBadge status={status} />
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isTache && status !== "done" && (
              <button onClick={() => handleComplete(item.id as number)} className="p-1 rounded hover:bg-white/20 transition-colors" title="Completer">
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              </button>
            )}
            <button onClick={() => { setEditItem(item); setModalOpen(true); }} className="p-1 rounded hover:bg-white/20 transition-colors" title="Modifier">
              <Pencil className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
          {!isTache && <ChevronRight className="h-3.5 w-3.5 text-white/50 group-hover:text-white transition-colors shrink-0 cursor-pointer" onClick={() => handleDrillDown(item)} />}
        </div>
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 flex-wrap">
            {(item.bot_primaire as string) && <BotBadge code={item.bot_primaire as string} />}
            {(item.chaleur as string) && <ChaleurBadge chaleur={item.chaleur as "brule" | "couve" | "meurt"} />}
            {(item.progression as number) > 0 && (
              <span className="text-[9px] text-gray-400">{item.progression}%</span>
            )}
            {(item.missions_count as number) > 0 && (
              <span className="text-[9px] text-gray-400">{item.missions_count} missions</span>
            )}
            {(item.assignee_nom as string) && (
              <span className="text-[9px] text-gray-400">{item.assignee_nom}</span>
            )}
            {(item.categorie as string) && (item.categorie as string) !== "interne" && (
              <span className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                (item.categorie as string) === "client" ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"
              )}>
                {(item.categorie as string) === "client" ? "Client" : "Partenaire"}
              </span>
            )}
          </div>
          {(item.description as string) && (
            <p className="text-[9px] text-gray-500 line-clamp-1 mt-1">{item.description as string}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* ═══ Section header (direct navigation — no drill-down) ═══ */}
      {!parentFilter && (
        <div className={cn("rounded-lg overflow-hidden border shadow-sm")}>
          <div className={cn("px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r", gradients[level])}>
            <LevelIcon className="h-3.5 w-3.5 text-white shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white capitalize">{levelLabels[level]}</p>
            </div>
            <span className="text-[9px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full shrink-0">
              {items.length} {levelLabels[level]}
            </span>
          </div>
        </div>
      )}

      {/* ═══ Parent context banner (drill-down header) ═══ */}
      {parentFilter && (() => {
        const ParentIcon = parentLevelIcons[parentFilter.type] || Rocket;
        const pGrad = parentGradients[parentFilter.type] || "from-gray-600 to-gray-500";
        const pLabel = parentLevelLabels[parentFilter.type] || "";
        return (
          <div className={cn("rounded-lg overflow-hidden border shadow-sm")}>
            <div className={cn("px-4 py-2.5 flex items-center gap-3 bg-gradient-to-r", pGrad)}>
              <button
                onClick={() => {
                  if (level === "projets") goTo("chantiers");
                  else if (level === "missions") goTo("projets");
                  else if (level === "taches") goTo("missions");
                }}
                className="px-2 py-1 rounded text-[9px] font-bold bg-white/20 text-white hover:bg-white/30 transition-colors shrink-0"
              >
                &larr; Retour
              </button>
              <ParentIcon className="h-3.5 w-3.5 text-white shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-medium text-white/70 uppercase tracking-wide">{pLabel}</p>
                <p className="text-xs font-bold text-white truncate">{parentFilter.titre}</p>
              </div>
              <span className="text-[9px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full shrink-0">
                {items.length} {levelLabels[level]}
              </span>
            </div>
          </div>
        );
      })()}

      {/* Toolbar + view toggle */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <CrudToolbar
            count={items.length}
            label={levelLabels[level]}
            search={search}
            onSearchChange={setSearch}
            sortField={sortField}
            sortDir={sortDir}
            onSortChange={(f, d) => { setSortField(f); setSortDir(d); }}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            categorieFilter={categorieFilter}
            onCategorieFilterChange={setCategorieFilter}
            onCreate={() => { setEditItem(null); setModalOpen(true); }}
          />
        </div>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
          {([
            { mode: "cards" as const, icon: LayoutGrid, title: "Cartes" },
            { mode: "list" as const, icon: List, title: "Liste" },
            { mode: "kanban" as const, icon: Columns, title: "Kanban" },
            { mode: "spreadsheet" as const, icon: Table2, title: "Tableur" },
          ] as const).map(({ mode, icon: Icon, title }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn("p-1.5 transition-colors", viewMode === mode ? "bg-blue-600 text-white" : "bg-white text-gray-400 hover:text-gray-600")}
              title={title}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Content — switch by viewMode */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
          <Inbox className="h-8 w-8" />
          <span className="text-sm">Aucun {levelLabels[level]}</span>
        </div>
      ) : viewMode === "kanban" ? (
        /* ═══ KANBAN VIEW ═══ */
        <div className="flex gap-3 overflow-x-auto pb-2">
          {(["a-faire", "en-cours", "done", "bloque"] as const).map((col) => {
            const colItems = items.filter((i) => mapStatus((i.status as string) || "") === col);
            const colLabels: Record<string, string> = { "a-faire": "A faire", "en-cours": "En cours", "done": "Completes", "bloque": "Bloques" };
            const colColors: Record<string, string> = { "a-faire": "border-t-amber-400", "en-cours": "border-t-blue-500", "done": "border-t-emerald-500", "bloque": "border-t-red-400" };
            return (
              <div key={col} className={cn("flex-1 min-w-[200px] max-w-[300px] bg-gray-50 rounded-lg border border-gray-200 border-t-4", colColors[col])}>
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-gray-600 uppercase">{colLabels[col]}</span>
                  <span className="text-[9px] font-bold text-gray-400 bg-white px-1.5 py-0.5 rounded-full">{colItems.length}</span>
                </div>
                <div className="px-2 pb-2 space-y-1.5 max-h-[500px] overflow-y-auto">
                  {colItems.map((item, idx) => renderItem(item, idx))}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === "spreadsheet" ? (
        /* ═══ SPREADSHEET VIEW ═══ */
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-[9px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-bold text-gray-500 uppercase">Titre</th>
                <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase w-20">Statut</th>
                <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase w-16">Priorite</th>
                <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase w-20">Bot</th>
                <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase w-20">Categorie</th>
                <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase w-20">Progression</th>
                <th className="text-right px-3 py-2 font-bold text-gray-500 uppercase w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const st = mapStatus((item.status as string) || "");
                const stColor: Record<string, string> = { "done": "text-emerald-600 bg-emerald-50", "en-cours": "text-blue-600 bg-blue-50", "a-faire": "text-amber-600 bg-amber-50", "bloque": "text-red-600 bg-red-50" };
                const stLabel: Record<string, string> = { "done": "Complete", "en-cours": "En cours", "a-faire": "A faire", "bloque": "Bloque" };
                return (
                  <tr
                    key={item.id as number}
                    className="border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors"
                    onClick={() => handleDrillDown(item)}
                  >
                    <td className="px-3 py-2">
                      <span className="font-medium text-gray-800 text-xs">{item.titre as string}</span>
                      {(item.description as string) && (
                        <p className="text-[9px] text-gray-400 line-clamp-1">{item.description as string}</p>
                      )}
                    </td>
                    <td className="px-2 py-2"><span className={cn("px-1.5 py-0.5 rounded-full text-[9px] font-bold", stColor[st])}>{stLabel[st]}</span></td>
                    <td className="px-2 py-2 text-gray-500">{(item.priorite as number) || 50}</td>
                    <td className="px-2 py-2"><BotBadge code={(item.bot_primaire as string) || "CEOB"} /></td>
                    <td className="px-2 py-2">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-full text-[9px] font-bold",
                        (item.categorie as string) === "client" ? "bg-amber-100 text-amber-700" :
                        (item.categorie as string) === "partenaire" ? "bg-purple-100 text-purple-700" :
                        "bg-gray-100 text-gray-500"
                      )}>
                        {(item.categorie as string) || "interne"}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(item.progression as number) || 0}%` }} />
                        </div>
                        <span className="text-[9px] text-gray-400">{(item.progression as number) || 0}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditItem(item); setModalOpen(true); }}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : groupedItems ? (
        // Grouped view — prominent section headers + 2-col grid for cards
        <div className="space-y-5">
          {groupedItems.map((group, gi) => {
            const gGrad = groupGradients[level] || "from-gray-50 to-gray-100";
            const gText = groupTextColors[level] || "text-gray-700";
            const gIcon = groupIconColors[level] || "text-gray-500";
            const GroupParentIcon = level === "projets" ? Rocket : level === "missions" ? FolderOpen : ListChecks;
            return (
              <div key={gi}>
                {/* Group section header — PROMINENT */}
                <div className={cn("px-4 py-2.5 rounded-t-lg flex items-center gap-3 bg-gradient-to-r border border-b-0 border-gray-200", gGrad)}>
                  <GroupParentIcon className={cn("h-4 w-4 shrink-0", gIcon)} />
                  <span className={cn("text-sm font-bold flex-1 truncate", gText)}>
                    {group.parentTitre}
                  </span>
                  <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/70 shrink-0", gText)}>
                    {group.items.length} {levelLabels[level]}
                  </span>
                </div>
                {/* Group items — 2 columns for cards, 1 column for list */}
                <div className={cn(
                  "p-2.5 rounded-b-lg border border-t-0 border-gray-200 bg-white",
                  viewMode === "cards" ? "grid grid-cols-1 md:grid-cols-2 gap-2" : "space-y-1"
                )}>
                  {group.items.map((item, idx) => renderItem(item, idx))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Flat view — 2 columns for cards
        <div className={cn(
          viewMode === "cards" ? "grid grid-cols-1 md:grid-cols-2 gap-2" : "space-y-1"
        )}>
          {items.map((item, idx) => renderItem(item, idx))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <EntityModal
          level={levelSingular[level]}
          mode={editItem ? "edit" : "create"}
          initialData={editItem || undefined}
          parentOptions={parentOptions}
          parentLabel={parentLabel}
          onSave={handleSave}
          onDelete={editItem ? handleDelete : undefined}
          onClose={() => { setModalOpen(false); setEditItem(null); }}
        />
      )}
    </div>
  );
}

// ================================================================
// TAB: SOMMAIRE EXECUTIF (Sprint F2)
// ================================================================

const TAILLE_OPTIONS = [
  { value: "micro", label: "Micro (1-10)" },
  { value: "petite", label: "Petite (11-50)" },
  { value: "moyenne", label: "Moyenne (51-250)" },
  { value: "grande", label: "Grande (250+)" },
];

function TabSommaire() {
  const [profil, setProfil] = useState<EntrepriseProfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  // Canaux CarlOS
  const [enriching, setEnriching] = useState(false);
  const [enrichResult, setEnrichResult] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractResult, setExtractResult] = useState<string | null>(null);

  // Form state
  const [nom, setNom] = useState("");
  const [industrie, setIndustrie] = useState("");
  const [sousSecteur, setSousSecteur] = useState("");
  const [taille, setTaille] = useState("");
  const [nbEmployes, setNbEmployes] = useState("");
  const [anneeFondation, setAnneeFondation] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [siteWeb, setSiteWeb] = useState("");
  const [chiffreAffaires, setChiffreAffaires] = useState("");
  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [valeurs, setValeurs] = useState("");
  // SWOT
  const [forces, setForces] = useState("");
  const [faiblesses, setFaiblesses] = useState("");
  const [opportunites, setOpportunites] = useState("");
  const [menaces, setMenaces] = useState("");

  // Helper: recharger profil depuis API
  const reloadProfil = useCallback(() => {
    api.getEntrepriseProfil().then((res) => {
      if (res.profil) {
        const p = res.profil;
        setProfil(p);
        setNom(p.nom || "");
        setIndustrie(p.industrie || "");
        setSousSecteur(p.sous_secteur || "");
        setTaille(p.taille || "");
        setNbEmployes(p.nb_employes ? String(p.nb_employes) : "");
        setAnneeFondation(p.annee_fondation ? String(p.annee_fondation) : "");
        setLocalisation(p.localisation || "");
        setSiteWeb(p.site_web || "");
        setChiffreAffaires(p.chiffre_affaires || "");
        setMission(p.mission || "");
        setVision(p.vision || "");
        setValeurs((p.valeurs || []).join(", "));
        setForces((p.forces || []).join("\n"));
        setFaiblesses((p.faiblesses || []).join("\n"));
        setOpportunites((p.opportunites || []).join("\n"));
        setMenaces((p.menaces || []).join("\n"));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    reloadProfil();
    setLoading(false);
  }, [reloadProfil]);

  // Canal 2 — Enrichir via web
  const handleEnrich = async () => {
    if (!nom.trim()) {
      setEnrichResult("Entrez d'abord le nom de l'entreprise");
      return;
    }
    setEnriching(true);
    setEnrichResult(null);
    try {
      const res = await api.enrichProfil({ nom, industrie, localisation });
      if (res.status === "ok" && res.updates > 0) {
        setEnrichResult(`${res.updates} champs enrichis par CarlOS`);
        reloadProfil();
        setDirty(false);
      } else {
        setEnrichResult(res.detail || "Aucune nouvelle info trouvee");
      }
    } catch {
      setEnrichResult("Erreur lors de l'enrichissement");
    } finally {
      setEnriching(false);
    }
  };

  // Canal 3 — Importer un document
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    setExtractResult(null);
    try {
      const res = await api.extractDocument(file);
      if (res.status === "ok" && res.updates > 0) {
        setExtractResult(`${res.updates} champs extraits de "${file.name}"`);
        reloadProfil();
        setDirty(false);
      } else {
        setExtractResult(res.detail || "Aucune info d'entreprise detectee dans le document");
      }
    } catch {
      setExtractResult("Erreur lors de l'extraction");
    } finally {
      setExtracting(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.saveEntrepriseProfil({
        nom,
        industrie,
        sous_secteur: sousSecteur,
        taille,
        nb_employes: nbEmployes ? parseInt(nbEmployes) : null,
        annee_fondation: anneeFondation ? parseInt(anneeFondation) : null,
        localisation,
        site_web: siteWeb,
        chiffre_affaires: chiffreAffaires,
        mission,
        vision,
        valeurs: valeurs.split(",").map(v => v.trim()).filter(Boolean),
        forces: forces.split("\n").map(v => v.trim()).filter(Boolean),
        faiblesses: faiblesses.split("\n").map(v => v.trim()).filter(Boolean),
        opportunites: opportunites.split("\n").map(v => v.trim()).filter(Boolean),
        menaces: menaces.split("\n").map(v => v.trim()).filter(Boolean),
      });
      setDirty(false);
    } catch { /* silently fail */ }
    finally { setSaving(false); }
  };

  const markDirty = () => { if (!dirty) setDirty(true); };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-xs">Chargement du profil...</span>
      </div>
    );
  }

  const inputCls = "w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400";
  const labelCls = "text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1 block";
  const textareaCls = cn(inputCls, "resize-none");

  return (
    <div className="space-y-4">
      {/* CarlOS Balayeuse — 3 canaux d'alimentation */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-2.5 flex items-center gap-2">
          <Wand2 className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-xs font-bold text-white">CarlOS Balayeuse</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300">3 canaux d'alimentation</span>
        </div>
        <div className="p-3">
          <div className="flex flex-wrap gap-2">
            {/* Canal 1 — Auto (toujours actif) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-emerald-700">Conversations</span>
              <span className="text-emerald-600">actif</span>
            </div>
            {/* Canal 2 — Enrichir via web */}
            <button
              onClick={handleEnrich}
              disabled={enriching}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              {enriching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              Enrichir via web
            </button>
            {/* Canal 3 — Importer document */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors cursor-pointer">
              {extracting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Importer un document
              <input type="file" className="hidden" accept=".pdf,.docx,.xlsx,.csv,.txt,.md" onChange={handleDocUpload} disabled={extracting} />
            </label>
          </div>
          {/* Result messages */}
          {enrichResult && (
            <div className={cn("mt-2 text-[9px] px-3 py-1.5 rounded-lg", enrichResult.includes("enrichis") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
              {enrichResult}
            </div>
          )}
          {extractResult && (
            <div className={cn("mt-2 text-[9px] px-3 py-1.5 rounded-lg", extractResult.includes("extraits") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
              {extractResult}
            </div>
          )}
          <p className="text-[9px] text-gray-400 mt-2">
            CarlOS aspire automatiquement les infos de vos conversations. Vous pouvez aussi enrichir via recherche web ou importer un plan d'affaires existant.
          </p>
        </div>
      </Card>

      {/* Save bar */}
      {dirty && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          <span className="text-xs text-amber-700 font-medium">Modifications non sauvegardees</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Sauvegarder
          </button>
        </div>
      )}

      {/* IDENTITE */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-bold text-white">Identite de l'entreprise</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nom de l'entreprise</label>
              <input className={inputCls} value={nom} onChange={(e) => { setNom(e.target.value); markDirty(); }} placeholder="Ex: Usine Bleue AI" />
            </div>
            <div>
              <label className={labelCls}>Industrie / Secteur</label>
              <input className={inputCls} value={industrie} onChange={(e) => { setIndustrie(e.target.value); markDirty(); }} placeholder="Ex: Manufacturier, SaaS, Distribution" />
            </div>
            <div>
              <label className={labelCls}>Sous-secteur</label>
              <input className={inputCls} value={sousSecteur} onChange={(e) => { setSousSecteur(e.target.value); markDirty(); }} placeholder="Ex: Automatisation industrielle" />
            </div>
            <div>
              <label className={labelCls}>Taille</label>
              <select className={inputCls} value={taille} onChange={(e) => { setTaille(e.target.value); markDirty(); }}>
                <option value="">Selectionner...</option>
                {TAILLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Nombre d'employes</label>
              <input className={inputCls} type="number" value={nbEmployes} onChange={(e) => { setNbEmployes(e.target.value); markDirty(); }} placeholder="Ex: 45" />
            </div>
            <div>
              <label className={labelCls}>Annee de fondation</label>
              <input className={inputCls} type="number" value={anneeFondation} onChange={(e) => { setAnneeFondation(e.target.value); markDirty(); }} placeholder="Ex: 2015" />
            </div>
            <div>
              <label className={labelCls}>Localisation</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input className={cn(inputCls, "pl-8")} value={localisation} onChange={(e) => { setLocalisation(e.target.value); markDirty(); }} placeholder="Ex: Montreal, QC" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Site web</label>
              <div className="relative">
                <Globe className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input className={cn(inputCls, "pl-8")} value={siteWeb} onChange={(e) => { setSiteWeb(e.target.value); markDirty(); }} placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className={labelCls}>Chiffre d'affaires</label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input className={cn(inputCls, "pl-8")} value={chiffreAffaires} onChange={(e) => { setChiffreAffaires(e.target.value); markDirty(); }} placeholder="Ex: 5M-10M" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* MVV — Mission, Vision, Valeurs */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 flex items-center gap-2">
          <Target className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-bold text-white">Mission, Vision, Valeurs</span>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className={labelCls}>Mission</label>
            <textarea className={textareaCls} rows={2} value={mission} onChange={(e) => { setMission(e.target.value); markDirty(); }} placeholder="Pourquoi l'entreprise existe..." />
          </div>
          <div>
            <label className={labelCls}>Vision</label>
            <textarea className={textareaCls} rows={2} value={vision} onChange={(e) => { setVision(e.target.value); markDirty(); }} placeholder="Ou l'entreprise veut aller..." />
          </div>
          <div>
            <label className={labelCls}>Valeurs (separees par virgule)</label>
            <input className={inputCls} value={valeurs} onChange={(e) => { setValeurs(e.target.value); markDirty(); }} placeholder="Innovation, Integrite, Excellence, Collaboration" />
          </div>
        </div>
      </Card>

      {/* SWOT — 4 quadrants */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 flex items-center gap-2">
          <LayoutGrid className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-bold text-white">Analyse SWOT</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white">4 quadrants</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Forces */}
            <div className="border border-emerald-200 rounded-lg overflow-hidden">
              <div className="bg-emerald-50 px-3 py-1.5 flex items-center gap-1.5 border-b border-emerald-200">
                <Shield className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[9px] font-bold text-emerald-700 uppercase">Forces (S)</span>
              </div>
              <textarea className="w-full px-3 py-2 text-xs border-0 focus:outline-none resize-none bg-white" rows={4} value={forces} onChange={(e) => { setForces(e.target.value); markDirty(); }} placeholder="1 force par ligne..." />
            </div>
            {/* Faiblesses */}
            <div className="border border-red-200 rounded-lg overflow-hidden">
              <div className="bg-red-50 px-3 py-1.5 flex items-center gap-1.5 border-b border-red-200">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                <span className="text-[9px] font-bold text-red-700 uppercase">Faiblesses (W)</span>
              </div>
              <textarea className="w-full px-3 py-2 text-xs border-0 focus:outline-none resize-none bg-white" rows={4} value={faiblesses} onChange={(e) => { setFaiblesses(e.target.value); markDirty(); }} placeholder="1 faiblesse par ligne..." />
            </div>
            {/* Opportunites */}
            <div className="border border-blue-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-3 py-1.5 flex items-center gap-1.5 border-b border-blue-200">
                <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-[9px] font-bold text-blue-700 uppercase">Opportunites (O)</span>
              </div>
              <textarea className="w-full px-3 py-2 text-xs border-0 focus:outline-none resize-none bg-white" rows={4} value={opportunites} onChange={(e) => { setOpportunites(e.target.value); markDirty(); }} placeholder="1 opportunite par ligne..." />
            </div>
            {/* Menaces */}
            <div className="border border-amber-200 rounded-lg overflow-hidden">
              <div className="bg-amber-50 px-3 py-1.5 flex items-center gap-1.5 border-b border-amber-200">
                <Flame className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-[9px] font-bold text-amber-700 uppercase">Menaces (T)</span>
              </div>
              <textarea className="w-full px-3 py-2 text-xs border-0 focus:outline-none resize-none bg-white" rows={4} value={menaces} onChange={(e) => { setMenaces(e.target.value); markDirty(); }} placeholder="1 menace par ligne..." />
            </div>
          </div>
        </div>
      </Card>

      {/* VITAA Scores (lecture seule — alimentés par diagnostics) */}
      {profil && (profil.score_vente > 0 || profil.score_idee > 0) && (
        <Card className="p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2.5 flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-bold text-white">Scores VITAA</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white">auto — depuis diagnostics</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: "Vente", value: profil.score_vente, color: "emerald" },
                { label: "Idee", value: profil.score_idee, color: "violet" },
                { label: "Temps", value: profil.score_temps, color: "amber" },
                { label: "Argent", value: profil.score_argent, color: "blue" },
                { label: "Actif", value: profil.score_actif, color: "red" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-xs font-bold text-gray-800">{s.value}/100</div>
                  <div className="h-2 bg-gray-100 rounded-full mt-1">
                    <div className={`h-2 rounded-full bg-${s.color}-500`} style={{ width: `${s.value}%` }} />
                  </div>
                  <div className="text-[9px] text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Save button bottom */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Sauvegarder le profil
        </button>
      </div>
    </div>
  );
}


// ================================================================
// TAB: OBJECTIFS STRATEGIQUES (Sprint F2 — Plan d'affaires vivant)
// ================================================================

// BMC 9 blocs — structure standard Business Model Canvas
const BMC_BLOCS = [
  { key: "partenaires", label: "Partenaires cles", color: "violet", placeholder: "Fournisseurs, alliances, sous-traitants..." },
  { key: "activites", label: "Activites cles", color: "blue", placeholder: "Production, R&D, distribution, service..." },
  { key: "ressources", label: "Ressources cles", color: "indigo", placeholder: "Equipements, brevets, equipe, capital..." },
  { key: "proposition", label: "Proposition de valeur", color: "emerald", placeholder: "Ce qu'on offre de unique au client..." },
  { key: "relations", label: "Relations clients", color: "teal", placeholder: "Service personnalise, communaute, self-service..." },
  { key: "canaux", label: "Canaux", color: "cyan", placeholder: "Web, distributeurs, vente directe, telephone..." },
  { key: "segments", label: "Segments clients", color: "amber", placeholder: "PME manufacturieres, grandes entreprises, export..." },
  { key: "couts", label: "Structure de couts", color: "red", placeholder: "Salaires, materiaux, loyer, R&D..." },
  { key: "revenus", label: "Sources de revenus", color: "green", placeholder: "Vente produits, services, abonnements, licences..." },
];

const VITAA_PILLARS = [
  { key: "vente", label: "Vente", color: "emerald", icon: TrendingUp },
  { key: "idee", label: "Idee", color: "violet", icon: Sparkles },
  { key: "temps", label: "Temps", color: "amber", icon: Clock },
  { key: "argent", label: "Argent", color: "blue", icon: DollarSign },
  { key: "actif", label: "Actif", color: "red", icon: Shield },
];

const HORIZON_LABELS = [
  { key: "court", label: "Court terme (0-6 mois)", color: "emerald" },
  { key: "moyen", label: "Moyen terme (6-18 mois)", color: "blue" },
  { key: "long", label: "Long terme (18+ mois)", color: "violet" },
];

function TabObjectifs() {
  const [bmcData, setBmcData] = useState<Record<string, string>>({});
  const [bmcId, setBmcId] = useState<number | null>(null);
  const [objectifsData, setObjectifsData] = useState<Record<string, { objectif: string; kpi_cible: string; kpi_actuel: string }>>({});
  const [objectifsId, setObjectifsId] = useState<number | null>(null);
  const [horizonsData, setHorizonsData] = useState<Record<string, string>>({});
  const [horizonsId, setHorizonsId] = useState<number | null>(null);
  const [avantagesData, setAvantagesData] = useState<string>("");
  const [avantagesId, setAvantagesId] = useState<number | null>(null);
  const [revenusData, setRevenusData] = useState<Record<string, string>>({});
  const [revenusId, setRevenusId] = useState<number | null>(null);
  const [diagnosticScores, setDiagnosticScores] = useState<Record<string, number>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getOrCreateCanvas("bmc"),
      api.getOrCreateCanvas("objectifs_vitaa"),
      api.getOrCreateCanvas("horizons"),
      api.getOrCreateCanvas("avantages"),
      api.getOrCreateCanvas("revenus"),
      api.getEntrepriseProfil(),
    ]).then(([bmc, obj, hor, ava, rev, profil]) => {
      setBmcId(bmc.id); setBmcData(bmc.data as Record<string, string> || {});
      setObjectifsId(obj.id); setObjectifsData(obj.data as Record<string, { objectif: string; kpi_cible: string; kpi_actuel: string }> || {});
      setHorizonsId(hor.id); setHorizonsData(hor.data as Record<string, string> || {});
      setAvantagesId(ava.id); setAvantagesData((ava.data as Record<string, string>)?.text || "");
      setRevenusId(rev.id); setRevenusData(rev.data as Record<string, string> || {});
      // Scores VITAA depuis le profil (alimentes par diagnostics)
      if (profil.profil) {
        setDiagnosticScores({
          vente: profil.profil.score_vente || 0,
          idee: profil.profil.score_idee || 0,
          temps: profil.profil.score_temps || 0,
          argent: profil.profil.score_argent || 0,
          actif: profil.profil.score_actif || 0,
        });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        bmcId && api.updateCanvas(bmcId, { data: bmcData }),
        objectifsId && api.updateCanvas(objectifsId, { data: objectifsData }),
        horizonsId && api.updateCanvas(horizonsId, { data: horizonsData }),
        avantagesId && api.updateCanvas(avantagesId, { data: { text: avantagesData } }),
        revenusId && api.updateCanvas(revenusId, { data: revenusData }),
      ].filter(Boolean));
      setDirty(false);
    } catch { /* silently fail */ }
    finally { setSaving(false); }
  };

  const markDirty = () => { if (!dirty) setDirty(true); };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-xs">Chargement des objectifs...</span>
      </div>
    );
  }

  const inputCls = "w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400";
  const labelCls = "text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1 block";

  return (
    <div className="space-y-4">
      {/* Save bar */}
      {dirty && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          <span className="text-xs text-amber-700 font-medium">Modifications non sauvegardees</span>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Sauvegarder
          </button>
        </div>
      )}

      {/* ═══ BUSINESS MODEL CANVAS — 9 blocs ═══ */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 flex items-center gap-2">
          <LayoutGrid className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-bold text-white">Business Model Canvas</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white">9 blocs</span>
        </div>
        <div className="p-4">
          {/* Row 1: Partenaires | Activites + Ressources | Proposition | Relations + Canaux | Segments */}
          <div className="grid grid-cols-5 gap-2">
            {/* Partenaires */}
            <div className="border border-gray-200 rounded-lg overflow-hidden row-span-2">
              <div className={`bg-violet-50 px-2 py-1 border-b border-gray-200`}>
                <span className="text-[9px] font-bold text-violet-700 uppercase">Partenaires cles</span>
              </div>
              <textarea className="w-full px-2 py-1.5 text-[11px] border-0 focus:outline-none resize-none bg-white" rows={5}
                value={bmcData.partenaires || ""} onChange={(e) => { setBmcData(p => ({...p, partenaires: e.target.value})); markDirty(); }}
                placeholder="Fournisseurs, alliances..." />
            </div>
            {/* Activites */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-2 py-1 border-b border-gray-200">
                <span className="text-[9px] font-bold text-blue-700 uppercase">Activites cles</span>
              </div>
              <textarea className="w-full px-2 py-1.5 text-[11px] border-0 focus:outline-none resize-none bg-white" rows={2}
                value={bmcData.activites || ""} onChange={(e) => { setBmcData(p => ({...p, activites: e.target.value})); markDirty(); }}
                placeholder="Production, R&D..." />
            </div>
            {/* Proposition de valeur — centre, tall */}
            <div className="border border-gray-200 rounded-lg overflow-hidden row-span-2 border-emerald-300 bg-emerald-50/30">
              <div className="bg-emerald-50 px-2 py-1 border-b border-emerald-200">
                <span className="text-[9px] font-bold text-emerald-700 uppercase">Proposition de valeur</span>
              </div>
              <textarea className="w-full px-2 py-1.5 text-[11px] border-0 focus:outline-none resize-none bg-white" rows={5}
                value={bmcData.proposition || ""} onChange={(e) => { setBmcData(p => ({...p, proposition: e.target.value})); markDirty(); }}
                placeholder="Ce qu'on offre de unique..." />
            </div>
            {/* Relations */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-teal-50 px-2 py-1 border-b border-gray-200">
                <span className="text-[9px] font-bold text-teal-700 uppercase">Relations clients</span>
              </div>
              <textarea className="w-full px-2 py-1.5 text-[11px] border-0 focus:outline-none resize-none bg-white" rows={2}
                value={bmcData.relations || ""} onChange={(e) => { setBmcData(p => ({...p, relations: e.target.value})); markDirty(); }}
                placeholder="Service perso, communaute..." />
            </div>
            {/* Segments */}
            <div className="border border-gray-200 rounded-lg overflow-hidden row-span-2">
              <div className="bg-amber-50 px-2 py-1 border-b border-gray-200">
                <span className="text-[9px] font-bold text-amber-700 uppercase">Segments clients</span>
              </div>
              <textarea className="w-full px-2 py-1.5 text-[11px] border-0 focus:outline-none resize-none bg-white" rows={5}
                value={bmcData.segments || ""} onChange={(e) => { setBmcData(p => ({...p, segments: e.target.value})); markDirty(); }}
                placeholder="PME, grandes entreprises..." />
            </div>
            {/* Ressources */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-indigo-50 px-2 py-1 border-b border-gray-200">
                <span className="text-[9px] font-bold text-indigo-700 uppercase">Ressources cles</span>
              </div>
              <textarea className="w-full px-2 py-1.5 text-[11px] border-0 focus:outline-none resize-none bg-white" rows={2}
                value={bmcData.ressources || ""} onChange={(e) => { setBmcData(p => ({...p, ressources: e.target.value})); markDirty(); }}
                placeholder="Equipements, brevets..." />
            </div>
            {/* Canaux */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-cyan-50 px-2 py-1 border-b border-gray-200">
                <span className="text-[9px] font-bold text-cyan-700 uppercase">Canaux</span>
              </div>
              <textarea className="w-full px-2 py-1.5 text-[11px] border-0 focus:outline-none resize-none bg-white" rows={2}
                value={bmcData.canaux || ""} onChange={(e) => { setBmcData(p => ({...p, canaux: e.target.value})); markDirty(); }}
                placeholder="Web, distributeurs..." />
            </div>
          </div>
          {/* Row 2: Couts | Revenus */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-red-50 px-2 py-1 border-b border-gray-200">
                <span className="text-[9px] font-bold text-red-700 uppercase">Structure de couts</span>
              </div>
              <textarea className="w-full px-2 py-1.5 text-[11px] border-0 focus:outline-none resize-none bg-white" rows={2}
                value={bmcData.couts || ""} onChange={(e) => { setBmcData(p => ({...p, couts: e.target.value})); markDirty(); }}
                placeholder="Salaires, materiaux, loyer..." />
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-green-50 px-2 py-1 border-b border-gray-200">
                <span className="text-[9px] font-bold text-green-700 uppercase">Sources de revenus</span>
              </div>
              <textarea className="w-full px-2 py-1.5 text-[11px] border-0 focus:outline-none resize-none bg-white" rows={2}
                value={bmcData.revenus || ""} onChange={(e) => { setBmcData(p => ({...p, revenus: e.target.value})); markDirty(); }}
                placeholder="Vente produits, services..." />
            </div>
          </div>
        </div>
      </Card>

      {/* ═══ OBJECTIFS STRATEGIQUES PAR PILIER VITAA ═══ */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2.5 flex items-center gap-2">
          <Target className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-bold text-white">Objectifs strategiques VITAA</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white">5 piliers</span>
        </div>
        <div className="p-4 space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-1">
            <div className="col-span-2 text-[9px] font-bold text-gray-500 uppercase">Pilier</div>
            <div className="col-span-4 text-[9px] font-bold text-gray-500 uppercase">Objectif</div>
            <div className="col-span-2 text-[9px] font-bold text-gray-500 uppercase">KPI cible</div>
            <div className="col-span-2 text-[9px] font-bold text-gray-500 uppercase">KPI actuel</div>
            <div className="col-span-2 text-[9px] font-bold text-gray-500 uppercase">Diagnostic</div>
          </div>
          {VITAA_PILLARS.map((p) => {
            const PIcon = p.icon;
            const current = objectifsData[p.key] || { objectif: "", kpi_cible: "", kpi_actuel: "" };
            const diagScore = diagnosticScores[p.key] || 0;
            return (
              <div key={p.key} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-2 flex items-center gap-1.5">
                  <PIcon className={`h-3.5 w-3.5 text-${p.color}-600`} />
                  <span className={`text-xs font-bold text-${p.color}-700`}>{p.label}</span>
                </div>
                <div className="col-span-4">
                  <input className={inputCls} value={current.objectif}
                    onChange={(e) => { setObjectifsData(prev => ({...prev, [p.key]: {...current, objectif: e.target.value}})); markDirty(); }}
                    placeholder={`Objectif ${p.label}...`} />
                </div>
                <div className="col-span-2">
                  <input className={inputCls} value={current.kpi_cible}
                    onChange={(e) => { setObjectifsData(prev => ({...prev, [p.key]: {...current, kpi_cible: e.target.value}})); markDirty(); }}
                    placeholder="Ex: 85/100" />
                </div>
                <div className="col-span-2">
                  <input className={inputCls} value={current.kpi_actuel}
                    onChange={(e) => { setObjectifsData(prev => ({...prev, [p.key]: {...current, kpi_actuel: e.target.value}})); markDirty(); }}
                    placeholder="Ex: 62/100" />
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  {diagScore > 0 ? (
                    <>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className={`h-2 rounded-full ${diagScore >= 70 ? "bg-emerald-500" : diagScore >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${diagScore}%` }} />
                      </div>
                      <span className="text-[9px] font-bold text-gray-600">{diagScore}</span>
                    </>
                  ) : (
                    <span className="text-[9px] text-gray-400 italic">Pas de diagnostic</span>
                  )}
                </div>
              </div>
            );
          })}
          {diagnosticScores.vente === 0 && (
            <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-[9px] text-blue-700">Les scores VITAA se remplissent automatiquement apres un diagnostic CarlOS. Lancez un diagnostic dans l'onglet Diagnostics.</span>
            </div>
          )}
        </div>
      </Card>

      {/* ═══ HORIZONS — Court / Moyen / Long terme ═══ */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2.5 flex items-center gap-2">
          <Route className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-bold text-white">Horizons strategiques</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {HORIZON_LABELS.map((h) => (
              <div key={h.key} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className={`bg-${h.color}-50 px-3 py-1.5 border-b border-gray-200`}>
                  <span className={`text-[9px] font-bold text-${h.color}-700 uppercase`}>{h.label}</span>
                </div>
                <textarea className="w-full px-3 py-2 text-xs border-0 focus:outline-none resize-none bg-white" rows={4}
                  value={horizonsData[h.key] || ""} onChange={(e) => { setHorizonsData(p => ({...p, [h.key]: e.target.value})); markDirty(); }}
                  placeholder={`Priorites ${h.label.toLowerCase()}...`} />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ═══ AVANTAGES CONCURRENTIELS ═══ */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-bold text-white">Avantages concurrentiels</span>
        </div>
        <div className="p-4">
          <textarea className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none" rows={4}
            value={avantagesData} onChange={(e) => { setAvantagesData(e.target.value); markDirty(); }}
            placeholder="1 avantage par ligne: brevets, expertise unique, reseau, technologie proprietaire, localisation..." />
        </div>
      </Card>

      {/* ═══ MODELE DE REVENUS ═══ */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2.5 flex items-center gap-2">
          <DollarSign className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-bold text-white">Modele de revenus</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Sources de revenus principales</label>
              <textarea className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none resize-none" rows={3}
                value={revenusData.sources || ""} onChange={(e) => { setRevenusData(p => ({...p, sources: e.target.value})); markDirty(); }}
                placeholder="Produits, services, abonnements, licences..." />
            </div>
            <div>
              <label className={labelCls}>Strategie de prix</label>
              <textarea className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none resize-none" rows={3}
                value={revenusData.prix || ""} onChange={(e) => { setRevenusData(p => ({...p, prix: e.target.value})); markDirty(); }}
                placeholder="Premium, volume, freemium, valeur ajoutee..." />
            </div>
            <div>
              <label className={labelCls}>Marges cibles</label>
              <input className={inputCls} value={revenusData.marges || ""}
                onChange={(e) => { setRevenusData(p => ({...p, marges: e.target.value})); markDirty(); }}
                placeholder="Ex: Marge brute 45%, marge nette 12%" />
            </div>
            <div>
              <label className={labelCls}>Objectif CA annuel</label>
              <input className={inputCls} value={revenusData.ca_cible || ""}
                onChange={(e) => { setRevenusData(p => ({...p, ca_cible: e.target.value})); markDirty(); }}
                placeholder="Ex: 15M d'ici 2027" />
            </div>
          </div>
        </div>
      </Card>

      {/* Save button bottom */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving || !dirty}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Sauvegarder les objectifs
        </button>
      </div>
    </div>
  );
}


// ================================================================
// MAIN COMPONENT
// ================================================================

export function BlueprintView() {
  const { setActiveView } = useFrameMaster();
  const { dispatch } = useCanvasActions();
  const [activeTab, setActiveTab] = useState<BlueprintTabId>("sommaire");
  const [parentFilter, setParentFilter] = useState<{ type: string; id: number; titre: string } | null>(null);

  // API data for stats
  const [apiChantiers, setApiChantiers] = useState<Record<string, unknown>[]>([]);
  const [apiProjets, setApiProjets] = useState<Record<string, unknown>[]>([]);
  const [apiMissions, setApiMissions] = useState<Record<string, unknown>[]>([]);
  const [apiTaches, setApiTaches] = useState<Record<string, unknown>[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticCatalogue[]>([]);
  const [templates, setTemplates] = useState<TemplateDocumentaire[]>([]);
  const [loadingCatalogues, setLoadingCatalogues] = useState(true);

  const refreshAll = useCallback(() => {
    api.listChantiers().then((r) => setApiChantiers((r as Record<string, unknown>).chantiers as Record<string, unknown>[] || [])).catch(() => {});
    api.listProjets().then((r) => setApiProjets(Array.isArray(r) ? r : [])).catch(() => {});
    api.listMissions().then((r) => setApiMissions((r as Record<string, unknown>).missions as Record<string, unknown>[] || [])).catch(() => {});
    api.listTachesUser().then((r) => setApiTaches(Array.isArray(r) ? r : [])).catch(() => {});
    api.listDiagnosticsEnrichis().then((d) => setDiagnostics(d || [])).catch(() => setDiagnostics([]));
    api.listTemplatesDocumentaires().then((t) => setTemplates(t || [])).catch(() => setTemplates([]));
    setLoadingCatalogues(false);
  }, []);

  useEffect(() => { refreshAll(); }, [refreshAll]);

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
      docs: templates.length,
      playbooks: PLAYBOOK_TEMPLATES.length,
      diagnostics: diagnostics.length,
    };
  }, [apiChantiers, apiProjets, apiMissions, apiTaches, templates, diagnostics]);

  const goTo = useCallback((tab: BlueprintTabId, filter?: { type: string; id: number; titre: string }) => {
    setActiveTab(tab);
    setParentFilter(filter || null);
  }, []);

  // Deploy playbook — refresh data after
  const handleDeployPlaybook = useCallback(async (playbookId: string) => {
    await api.deployPlaybook(playbookId);
    refreshAll();
  }, [refreshAll]);

  // Focus handler for catalogues
  const handleFocus = useCallback((title: string, elementType: string, data: unknown) => {
    dispatch({ type: "focus", layer: "cerveau", data: { title, element_type: elementType, data }, bot: "CEOB" });
    setActiveView("live-chat");
  }, [dispatch, setActiveView]);

  // ALWAYS reset parent filter when clicking a tab directly (not via drill-down)
  // This separates "direct navigation" (click tab) from "drill-down" (click item)
  const handleTabChange = useCallback((tab: string) => {
    setParentFilter(null);
    setActiveTab(tab as BlueprintTabId);
  }, []);

  return (
    <SectionFrame
      title="Blueprint"
      subtitle=""
      icon={Rocket}
      iconColor="text-blue-600"
      tabs={BLUEPRINT_TABS}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onBack={() => setActiveView("dashboard")}
    >
      {activeTab === "sommaire" && <TabSommaire />}

      {activeTab === "objectifs" && <TabObjectifs />}

      {activeTab === "overview" && (
        <TabOverview goTo={goTo} stats={stats} onDeploy={handleDeployPlaybook} />
      )}

      {activeTab === "chantiers" && (
        <HierarchieTab level="chantiers" goTo={goTo} parentFilter={parentFilter} />
      )}

      {activeTab === "projets" && (
        <HierarchieTab level="projets" goTo={goTo} parentFilter={parentFilter} />
      )}

      {activeTab === "missions" && (
        <HierarchieTab level="missions" goTo={goTo} parentFilter={parentFilter} />
      )}

      {activeTab === "taches" && (
        <HierarchieTab level="taches" goTo={goTo} parentFilter={parentFilter} />
      )}

      {activeTab === "timeline" && <TabTimeline />}

      {activeTab === "documents" && (
        <CatalogueGrid
          type="documents"
          items={templates as unknown as Parameters<typeof CatalogueGrid>[0]["items"]}
          loading={loadingCatalogues}
          onAction={(item) => handleFocus(`Template: ${item.titre}`, "template_documentaire", item)}
          actionLabel="Generer"
        />
      )}

      {activeTab === "playbooks" && (
        <CatalogueGrid
          type="playbooks"
          items={PLAYBOOK_TEMPLATES as unknown as Parameters<typeof CatalogueGrid>[0]["items"]}
          onAction={(item) => handleFocus(`Playbook: ${item.titre}`, "playbook", item)}
          actionLabel="Deployer"
        />
      )}

      {activeTab === "diagnostics" && (
        <CatalogueGrid
          type="diagnostics"
          items={diagnostics as unknown as Parameters<typeof CatalogueGrid>[0]["items"]}
          loading={loadingCatalogues}
          onAction={(item) => handleFocus(`Diagnostic: ${item.titre}`, "diagnostic_enrichi", item)}
          actionLabel="Lancer"
        />
      )}

      {activeTab === "equipe" && <TabEquipe />}
    </SectionFrame>
  );
}
