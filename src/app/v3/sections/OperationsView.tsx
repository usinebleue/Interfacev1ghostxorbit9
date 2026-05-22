/**
 * OperationsView.tsx — Gestion Opérations/Processus/Routines/Étapes (drill-down 4 niveaux)
 *
 * MÊME PATTERN que ChantierView:
 * Structure: LivingHero → Vedettes grid-cols-3 → Sidebar w-[180px] + Contenu cascade
 * Drill-down: OperationEntityDetail (hero grid-cols-5 + sous-éléments + smart detail blocks dBlocks)
 *
 * Vocabulaire CAPEX→OPEX:
 *   Chantier → Opération
 *   Projet   → Processus
 *   Mission  → Routine
 *   Tâche    → Étape
 */

import { useState, useEffect } from "react";
import { useIsMobile } from "../../components/ui/use-mobile";
import {
  Home, Target, Layers, Rocket, ChevronRight, ChevronLeft,
  Users, User, Briefcase, Search, FolderOpen, Clock,
  RefreshCw, Timer, Activity, BarChart3, MessageCircle,
  Brain, Hammer, Settings, Repeat, CheckCircle2,
  AlertTriangle, Zap, ArrowLeft, FileText, Calendar,
  TrendingUp, TrendingDown, Stethoscope, Shield,
  ClipboardCheck, BookOpen, Package, DollarSign,
  GitBranch, Lock, Route, Gavel, Video, ClipboardList,
  Plus, PenLine, RotateCcw, CheckSquare,
  LayoutGrid, LayoutList, Table2,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { LivingHero } from "./shared/LivingHero";
import { ProgressMiniPhased } from "./shared/ProgressMiniPhased";
import { DEPT_SHORT_LABEL, DEPT_DASH_ICON, PHASE_COLORS, BOT_DISPLAY, BOT_AVATAR_MAP, type PhaseKey } from "./shared/dept-data";
import { SF } from "../core/styles";
import { ViewModeToolbar } from "./shared/ViewModeToolbar";
import { CockpitSectionHeader, WorkActionsOverlay, WORK_ACTIONS, DEPT_ORDER } from "./CockpitView";

import {
  MOCK_OPERATIONS, getMockOperations,
  type MockExecutionLog, type MockDocument, type MockCheckItem,
  type MockRACIItem, type MockDecisionLog, type MockDependency,
  type MockConferenceAI, type MockActivityLog, type MockKPICible,
  type MockEtapeItem, type MockRoutineItem, type MockProcessusItem,
  type MockOperationItem,
} from "../data/mock/execution.mock";
import { useDataSource } from "../data/use-data-source";
import { DomainBadge } from "../data/source-badge";
import { MobileSidebarSheet } from "../core/MobileSidebarSheet";
import { api } from "../../v2/api/client";

// ═══ Types — même structure que ChantierView mais vocabulaire opérationnel ═══

type OperationLevel = "operations" | "processus" | "routines" | "etapes";

// ═══ Phase derivation ═══
function regularityToPhase(regularity: number): PhaseKey {
  if (regularity >= 90) return "execution";
  if (regularity >= 70) return "creation";
  if (regularity >= 50) return "reflexion";
  return "discussion";
}

// ═══ Progress bar — même pattern que ChantierView ═══
// ProgressMiniPhased — importé depuis shared/ProgressMiniPhased.tsx

// ═══ Statut étape — icône + couleur ═══
const ETAPE_STATUS = {
  complete: { icon: CheckCircle2, color: "text-emerald-500", label: "Complétée" },
  en_cours: { icon: Timer, color: "text-amber-500", label: "En cours" },
  "a-faire": { icon: Target, color: "text-gray-400", label: "À faire" },
};


// ═══ CommandMissionCard — Tracker live mission COMMAND (D-091) ═══

const COMMAND_STAGES = [
  { key: "scan_result",      label: "Scan",      color: "bg-blue-500" },
  { key: "execution_result", label: "Exécution", color: "bg-amber-500" },
  { key: "bilan_result",     label: "Bilan",     color: "bg-emerald-500" },
];

interface ActiveCommandMission {
  id: number;
  message_original: string;
  stage: string;
  scan_bots: string[];
  completed: boolean;
  started_at: string;
}

function CommandMissionCard({ mission }: { mission: ActiveCommandMission }) {
  const stagesDone = new Set(
    COMMAND_STAGES.slice(0, COMMAND_STAGES.findIndex(s => s.key === mission.stage) + 1).map(s => s.key)
  );
  const isActive = !mission.completed;

  return (
    <div className={cn(
      "rounded-xl border p-4 space-y-3 shadow-sm",
      isActive ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"
    )}>
      <div className="flex items-center gap-2">
        {isActive ? (
          <span className="flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-blue-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" /></span>
        ) : (
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        )}
        <span className="text-xs font-bold text-gray-800 leading-tight line-clamp-1">
          Mission COMMAND — {mission.message_original.slice(0, 60)}
        </span>
        <span className={cn(
          "ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0",
          isActive ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
        )}>
          {isActive ? "En cours" : "Terminé"}
        </span>
      </div>

      {/* Stage progress */}
      <div className="flex items-center gap-2">
        {COMMAND_STAGES.map((s, i) => {
          const done = stagesDone.has(s.key);
          const active = mission.stage === s.key && isActive;
          return (
            <div key={s.key} className="flex items-center gap-1.5 flex-1">
              <div className={cn(
                "h-1.5 flex-1 rounded-full transition-all",
                done ? s.color : active ? "bg-blue-200 animate-pulse" : "bg-gray-200"
              )} />
              <span className={cn(
                "text-[9px] font-semibold shrink-0",
                done ? "text-gray-700" : "text-gray-400"
              )}>{s.label}</span>
              {i < COMMAND_STAGES.length - 1 && <ChevronRight className="h-3 w-3 text-gray-300 shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Bots mobilisés */}
      {mission.scan_bots?.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[9px] text-gray-400 uppercase tracking-wider">Bots:</span>
          {mission.scan_bots.map(bot => (
            <span key={bot} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{bot}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ OperationEntityDetail — Fiche detail inline (pattern dBlocks de ChantierEntityDetail) ═══
function OperationEntityDetail({ type, title, description, cadence, sla, regularity, botPrimaire, botCodes, sourceChantier, derniereExecution, prochaineExecution, sante, historique, documents, checklist, instructions, validateur, dureeEstimee, assignee, raci, risques, livrables, kpisCibles, coutRecurrent, dependances, decisions, conferences, activites, bilanOptimisation, subItems, onSubItemClick, subTitle, subCount, onBack, onAction, backLabel }: {
  type: "operation" | "processus" | "routine" | "etape";
  title: string; description?: string; cadence: string; sla?: string; regularity: number;
  botPrimaire?: string; botCodes?: string[]; sourceChantier?: string;
  derniereExecution?: string; prochaineExecution?: string;
  sante?: { score: number; tendance: "up" | "down" | "stable"; conformite?: string; optimisation?: string };
  historique?: MockExecutionLog[]; documents?: MockDocument[]; checklist?: MockCheckItem[];
  instructions?: string; validateur?: string; dureeEstimee?: string; assignee?: string;
  raci?: MockRACIItem[]; risques?: string[]; livrables?: string[];
  kpisCibles?: MockKPICible[]; coutRecurrent?: string;
  dependances?: MockDependency[]; decisions?: MockDecisionLog[];
  conferences?: MockConferenceAI[]; activites?: MockActivityLog[];
  bilanOptimisation?: { positifs: string[]; negatifs: string[]; actions: string[] };
  subItems?: Array<{ id: number; titre: string; regularity: number; cadence: string; sla?: string; subCount?: number; subLabel?: string }>;
  onSubItemClick?: (id: number) => void; subTitle?: string; subCount?: number;
  onBack: () => void; onAction?: (phase: PhaseKey, ctx: string) => void; backLabel: string;
}) {
  const phase = regularityToPhase(regularity);
  const ps = PHASE_COLORS[phase];
  const TypeIcon = type === "operation" ? Repeat : type === "processus" ? FolderOpen : type === "routine" ? RefreshCw : Target;
  const gradients: Record<string, string> = { operation: "from-cyan-500 to-teal-500", processus: "from-blue-500 to-cyan-500", routine: "from-teal-500 to-emerald-500", etape: "from-violet-500 to-purple-500" };
  const typeLabels: Record<string, string> = { operation: "Opération", processus: "Processus", routine: "Routine", etape: "Étape" };
  const subTypeLabels: Record<string, string> = { processus: "Processus", routines: "Routines", "étapes": "Étapes" };
  const subTypeIcons: Record<string, React.ElementType> = { processus: FolderOpen, routines: RefreshCw, "étapes": Target };
  const SubIcon = subTitle ? (subTypeIcons[subTitle] || Layers) : Layers;

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
        <ChevronRight className="h-3.5 w-3.5 rotate-180" /> {backLabel}
      </button>

      {/* Hero + Details grid-cols-5 — MÊME PATTERN ChantierEntityDetail */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className={cn("col-span-3 relative bg-gradient-to-r rounded-xl overflow-hidden shadow-sm", gradients[type])}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <TypeIcon className="h-5 w-5 text-white" />
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white uppercase tracking-wider">{typeLabels[type]}</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white bg-white/15 flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" />{cadence}
              </span>
              {sla && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white bg-white/15">SLA {sla}</span>}
            </div>
            <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
            {description && <p className="text-xs text-white/80 leading-relaxed line-clamp-3">{description}</p>}
            <div className="flex items-center gap-3 text-[10px] text-white/70">
              <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />{regularity}% régularité</span>
              {subCount !== undefined && <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" />{subCount} {subTitle}</span>}
              {sourceChantier && <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" />ex-CAPEX</span>}
            </div>
            {onAction && (
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                {WORK_ACTIONS.map(wa => (
                  <button key={wa.key} onClick={(e) => { e.stopPropagation(); onAction(wa.key, title); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold text-white bg-white/15 hover:bg-white/25 rounded-lg cursor-pointer transition-colors">
                    <wa.icon className="h-3.5 w-3.5" /> {wa.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="col-span-2 rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Settings className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Détails</span>
          </div>
          <div className="px-4 py-3 space-y-1.5 flex-1">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Régularité</span>
              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1", ps.badge)}><span className={cn("w-2 h-2 rounded-full", ps.dot)} />{regularity}%</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Cadence</span>
              <span className="text-xs font-bold text-gray-700">{cadence}</span>
            </div>
            {sla && (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">SLA</span>
                <span className="text-xs font-bold text-gray-700">{sla}</span>
              </div>
            )}
            {botPrimaire && BOT_DISPLAY[botPrimaire] && (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Responsable</span>
                <div className="flex items-center gap-1.5">
                  {BOT_AVATAR_MAP[botPrimaire] && <img src={BOT_AVATAR_MAP[botPrimaire]} className="h-5 w-5 rounded-full object-cover" alt="" />}
                  <span className="text-xs font-bold text-gray-700">{BOT_DISPLAY[botPrimaire]?.name || botPrimaire}</span>
                </div>
              </div>
            )}
            {derniereExecution && (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Dernière exéc.</span>
                <span className="text-xs font-bold text-gray-500">{derniereExecution}</span>
              </div>
            )}
            {prochaineExecution && (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Prochaine</span>
                <span className="text-xs font-bold text-cyan-700">{prochaineExecution}</span>
              </div>
            )}
            <div className="pt-1"><ProgressMiniPhased value={regularity} phase={phase} /></div>
          </div>
        </div>
      </div>

      {/* ── ZONE 1: Sous-éléments (processus/routines/étapes) — box liste compacte ── */}
      {subItems && subItems.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <SubIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">{subTypeLabels[subTitle || ""] || subTitle}</span>
            <span className="text-[9px] text-gray-400 ml-auto">{subItems.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {subItems.map(item => {
              const itemPhase = regularityToPhase(item.regularity);
              const ips = PHASE_COLORS[itemPhase];
              return (
                <div key={item.id} onClick={() => onSubItemClick?.(item.id)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors">
                  <SubIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="text-xs font-bold text-gray-900 flex-1 min-w-0 truncate">{item.titre}</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0">{item.cadence}</span>
                  <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", ips.badge)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", ips.dot)} />{ips.label}
                  </span>
                  <div className="w-20 shrink-0"><ProgressMiniPhased value={item.regularity} phase={itemPhase} /></div>
                  {item.subCount !== undefined && <span className="text-[9px] text-gray-400 shrink-0">{item.subCount} {item.subLabel}</span>}
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Smart detail blocks grid — packing intelligent par zones sémantiques (MÊME PATTERN ChantierEntityDetail) ── */}
      {(() => {
        const dBlocks: { key: string; w: 1 | 2; node: React.ReactNode }[] = [];
        const formatColors: Record<string, string> = { PDF: "bg-red-100 text-red-700", Excel: "bg-green-100 text-green-700", Python: "bg-yellow-100 text-yellow-700", Markdown: "bg-gray-100 text-gray-700", HTML: "bg-blue-100 text-blue-700", DOCX: "bg-blue-100 text-blue-700", XLSX: "bg-green-100 text-green-700" };

        // ── BOX: Santé & Régularité ──
        if (sante) dBlocks.push({ key: "sante", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Stethoscope className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Santé & Régularité</span>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className={cn("text-2xl font-black", sante.score >= 90 ? "text-emerald-600" : sante.score >= 70 ? "text-amber-500" : "text-red-500")}>{sante.score}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    {sante.tendance === "up" ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : sante.tendance === "down" ? <TrendingDown className="h-3.5 w-3.5 text-red-500" /> : <Activity className="h-3.5 w-3.5 text-gray-400" />}
                    <span className="text-[10px] text-gray-500">{sante.tendance === "up" ? "En hausse" : sante.tendance === "down" ? "En baisse" : "Stable"}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                    <div className={cn("h-full rounded-full", sante.score >= 90 ? "bg-emerald-500" : sante.score >= 70 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${sante.score}%` }} />
                  </div>
                </div>
              </div>
              {sante.conformite && <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5"><span className="text-[10px] text-gray-400">Conformité</span><span className="text-xs font-bold text-gray-700">{sante.conformite}</span></div>}
            </div>
          </div>
        )});

        // ── BOX: Optimisation ──
        if (sante?.optimisation) dBlocks.push({ key: "optimisation", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <TrendingUp className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Optimisation</span>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-gray-700 leading-relaxed">{sante.optimisation}</p>
            </div>
          </div>
        )});

        // ── BOX: KPIs / SLA Cibles ──
        if (kpisCibles && kpisCibles.length > 0) dBlocks.push({ key: "kpis", w: kpisCibles.length > 3 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Target className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">KPIs / SLA Cibles</span>
              <span className="text-[9px] text-gray-400 ml-auto">{kpisCibles.filter(k => k.ok).length}/{kpisCibles.length} atteints</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {kpisCibles.map((k, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  {k.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                  <span className="text-xs text-gray-700 flex-1">{k.label}</span>
                  <span className="text-[10px] text-gray-400">Cible: {k.cible}</span>
                  <span className={cn("text-[10px] font-bold", k.ok ? "text-emerald-600" : "text-amber-600")}>{k.actuel}</span>
                </div>
              ))}
            </div>
          </div>
        )});

        // ── BOX: Coût récurrent ──
        if (coutRecurrent) dBlocks.push({ key: "coutRecurrent", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <DollarSign className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Coût récurrent</span>
            </div>
            <div className="px-4 py-3">
              <div className="text-lg font-bold text-gray-900">{coutRecurrent}</div>
              <div className="flex items-center gap-1.5 mt-1.5"><ProgressMiniPhased value={regularity} phase={phase} /></div>
              <span className="text-[9px] text-gray-400 mt-1 block">{regularity}% régularité d'exécution</span>
            </div>
          </div>
        )});

        // ── BOX: Temps & SLA (étape) ──
        if (type === "etape" && (dureeEstimee || sla)) dBlocks.push({ key: "temps", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Clock className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Temps & SLA</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {dureeEstimee && <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"><span className="text-[10px] text-gray-400">Durée estimée</span><span className="text-xs font-bold text-gray-700">{dureeEstimee}</span></div>}
              {sla && <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"><span className="text-[10px] text-gray-400">SLA</span><span className="text-xs font-bold text-gray-700">{sla}</span></div>}
              {assignee && <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"><span className="text-[10px] text-gray-400">Assigné</span><span className="text-xs font-bold text-gray-700">{assignee}</span></div>}
            </div>
          </div>
        )});

        // ── BOX: Équipe ──
        if (botCodes && botCodes.length > 0) dBlocks.push({ key: "team", w: botCodes.length > 4 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Équipe</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {botCodes.map(code => (
                <div key={code} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                  {BOT_AVATAR_MAP[code] && <img src={BOT_AVATAR_MAP[code]} className="h-7 w-7 rounded-full ring-2 ring-white/80 object-cover shrink-0" alt="" />}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-gray-800 block">{BOT_DISPLAY[code]?.name || code}</span>
                    <span className="text-[10px] text-gray-500">{BOT_DISPLAY[code]?.role || ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )});

        // ── BOX: Matrice RACI ──
        if (raci && raci.length > 0) dBlocks.push({ key: "raci", w: raci.length > 4 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Matrice RACI</span>
              <span className="text-[9px] text-gray-400 ml-auto">{raci.length}</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {raci.map((r, i) => {
                const raciColors: Record<string, string> = { R: "bg-blue-100 text-blue-700", A: "bg-red-100 text-red-700", C: "bg-amber-100 text-amber-700", I: "bg-gray-100 text-gray-600" };
                const raciLabels: Record<string, string> = { R: "Responsable", A: "Approbateur", C: "Consulté", I: "Informé" };
                return (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded", raciColors[r.type])}>{r.type}</span>
                    {BOT_AVATAR_MAP[r.bot] && <img src={BOT_AVATAR_MAP[r.bot]} className="h-5 w-5 rounded-full object-cover shrink-0" alt="" />}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-gray-800 block truncate">{r.role}</span>
                      <span className="text-[9px] text-gray-400">{BOT_DISPLAY[r.bot]?.name || r.bot} — {raciLabels[r.type]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )});

        // ── BOX: Source CAPEX → OPEX ──
        if (sourceChantier) dBlocks.push({ key: "sourceCapex", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Zap className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Origine CAPEX → OPEX</span>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 bg-cyan-50 rounded-lg px-3 py-2">
                <Zap className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                <span className="text-xs text-gray-700">Transformé du chantier: <span className="font-bold">{sourceChantier}</span></span>
              </div>
            </div>
          </div>
        )});

        // ── BOX: Risques opérationnels ──
        if (risques && risques.length > 0) dBlocks.push({ key: "risques", w: risques.length > 3 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <AlertTriangle className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Risques opérationnels</span>
              <span className="text-[9px] text-gray-400 ml-auto">{risques.length}</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {risques.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
          </div>
        )});

        // ── BOX: Livrables récurrents ──
        if (livrables && livrables.length > 0) dBlocks.push({ key: "livrables", w: livrables.length > 4 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Package className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Livrables récurrents</span>
              <span className="text-[9px] text-gray-400 ml-auto">{livrables.length}</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {livrables.map((l, i) => (
                <div key={i} className="group relative flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <CheckSquare className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span className="text-xs text-gray-700">{l}</span>
                  {onAction && <WorkActionsOverlay context={`Livrable: ${l}`} onAction={onAction} />}
                </div>
              ))}
            </div>
          </div>
        )});

        // ── BOX: Check-list de conformité ──
        if (checklist && checklist.length > 0) dBlocks.push({ key: "checklist", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <ClipboardCheck className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Check-list conformité</span>
              <span className="text-[9px] text-gray-400 ml-auto">{checklist.filter(c => c.done).length}/{checklist.length}</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {checklist.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center shrink-0", c.done ? "bg-emerald-500 border-emerald-500" : "border-gray-300")}>
                    {c.done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <span className={cn("text-xs leading-relaxed", c.done ? "text-gray-400 line-through" : "text-gray-700")}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        )});

        // ── BOX: Historique d'exécutions ──
        if (historique && historique.length > 0) dBlocks.push({ key: "historique", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Calendar className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Historique d'exécutions</span>
              <span className="text-[9px] text-gray-400 ml-auto">{historique.length} dernières</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {historique.map((h, i) => {
                const statusColors: Record<string, string> = { conforme: "bg-emerald-100 text-emerald-700", retard: "bg-amber-100 text-amber-700", echec: "bg-red-100 text-red-700", partiel: "bg-orange-100 text-orange-700" };
                const statusLabels: Record<string, string> = { conforme: "Conforme", retard: "Retard", echec: "Échec", partiel: "Partiel" };
                return (
                  <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-[10px] text-gray-400 w-20 shrink-0">{h.date}</span>
                    <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0", statusColors[h.statut])}>{statusLabels[h.statut]}</span>
                    <span className="text-[10px] text-gray-500 shrink-0">{h.duree}</span>
                    {h.note && <span className="text-[10px] text-gray-400 flex-1 truncate italic">— {h.note}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )});

        // ── BOX: Dépendances inter-processus ──
        if (dependances && dependances.length > 0) dBlocks.push({ key: "dependances", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <GitBranch className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Dépendances</span>
              <span className="text-[9px] text-gray-400 ml-auto">{dependances.length}</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {dependances.map((dep, i) => {
                const statusColors: Record<string, string> = { resolu: "bg-emerald-100 text-emerald-700", "en-cours": "bg-amber-100 text-amber-700", critique: "bg-red-100 text-red-700" };
                const statusLabels: Record<string, string> = { resolu: "Résolu", "en-cours": "En cours", critique: "Critique" };
                return (
                  <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 space-y-1">
                    <div className="flex items-center gap-2">
                      {dep.type === "bloque" ? <Lock className="h-3.5 w-3.5 text-red-400 shrink-0" /> : <Route className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                      <span className="text-xs text-gray-700 flex-1">{dep.label}</span>
                      <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded", statusColors[dep.statut])}>{statusLabels[dep.statut]}</span>
                    </div>
                    <span className="text-[9px] text-gray-400">{dep.type === "bloque" ? "Bloque →" : "Dépend de ←"} {dep.entite}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )});

        // ── BOX: Documents liés ──
        if (documents && documents.length > 0) dBlocks.push({ key: "docs", w: documents.length > 3 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <FileText className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Documents liés</span>
              <span className="text-[9px] text-gray-400 ml-auto">{documents.length}</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {documents.map(doc => (
                <div key={doc.id} className="group relative flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors cursor-pointer">
                  <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-gray-800 block truncate">{doc.titre}</span>
                    <span className="text-[9px] text-gray-400">{doc.auteur} — {doc.modifie}</span>
                  </div>
                  <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded", formatColors[doc.format] || "bg-gray-100 text-gray-600")}>{doc.format}</span>
                  {onAction && <WorkActionsOverlay context={`Document: ${doc.titre}`} onAction={onAction} />}
                </div>
              ))}
            </div>
          </div>
        )});

        // ── BOX: Journal des décisions ──
        if (decisions && decisions.length > 0) dBlocks.push({ key: "decisions", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Gavel className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Journal des décisions</span>
              <span className="text-[9px] text-gray-400 ml-auto">{decisions.length}</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {decisions.map((d, i) => (
                <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 shrink-0">{d.date}</span>
                    <span className="text-xs font-bold text-gray-800 flex-1">{d.decision}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="text-[10px] text-gray-500">{d.decideur}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 italic leading-relaxed">{d.rationnel}</p>
                </div>
              ))}
            </div>
          </div>
        )});

        // ── BOX: Conférences AI ──
        if (conferences && conferences.length > 0) dBlocks.push({ key: "conferences", w: conferences.length > 2 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Video className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Conférences AI</span>
              <span className="text-[9px] text-gray-400 ml-auto">{conferences.length}</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {conferences.map(conf => (
                <div key={conf.id} className="group relative bg-gray-50 rounded-lg px-3 py-2 space-y-1 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 shrink-0">{conf.date}</span>
                    <span className="text-xs font-bold text-gray-800 flex-1 truncate">{conf.titre}</span>
                    <span className="text-[9px] text-gray-400">{conf.duree}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {conf.participants.slice(0, 4).map(p => BOT_AVATAR_MAP[p] ? <img key={p} src={BOT_AVATAR_MAP[p]} className="h-4 w-4 rounded-full object-cover ring-1 ring-white" alt="" /> : <span key={p} className="text-[8px] text-gray-400">{BOT_DISPLAY[p]?.name?.charAt(0) || p}</span>)}
                    {conf.participants.length > 4 && <span className="text-[8px] text-gray-400">+{conf.participants.length - 4}</span>}
                  </div>
                  {conf.resume && <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2">{conf.resume}</p>}
                  {onAction && <WorkActionsOverlay context={`Conférence: ${conf.titre}`} onAction={onAction} />}
                </div>
              ))}
            </div>
          </div>
        )});

        // ── BOX: Logs d'activité ──
        if (activites && activites.length > 0) dBlocks.push({ key: "activites", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <ClipboardList className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Logs d'activité</span>
              <span className="text-[9px] text-gray-400 ml-auto">{activites.length} entrées</span>
            </div>
            <div className="px-4 py-3 space-y-1">
              {activites.slice(0, 8).map((a, i) => {
                const typeIcons: Record<string, React.ElementType> = { creation: Plus, modification: PenLine, decision: Gavel, livrable: Package, commentaire: MessageCircle };
                const typeColors: Record<string, string> = { creation: "text-emerald-500", modification: "text-blue-500", decision: "text-amber-500", livrable: "text-violet-500", commentaire: "text-gray-400" };
                const TI = typeIcons[a.type] || Activity;
                return (
                  <div key={i} className="flex items-start gap-2 py-1">
                    <TI className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", typeColors[a.type] || "text-gray-400")} />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-700 leading-relaxed">{a.action}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-gray-400">{a.date}</span>
                        <span className="text-[9px] text-gray-400">— {a.auteur}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )});

        // ── BOX: Bilan d'optimisation (comme Rétrospective) ──
        if (bilanOptimisation) dBlocks.push({ key: "bilanOptimisation", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <RotateCcw className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Bilan d'optimisation</span>
            </div>
            <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Ce qui va bien</span>
                {bilanOptimisation.positifs.map((p, i) => <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-emerald-50 rounded px-2 py-1">{p}</div>)}
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> À améliorer</span>
                {bilanOptimisation.negatifs.map((n, i) => <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-red-50 rounded px-2 py-1">{n}</div>)}
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1"><Rocket className="h-3.5 w-3.5" /> Actions</span>
                {bilanOptimisation.actions.map((a, i) => <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-blue-50 rounded px-2 py-1">{a}</div>)}
              </div>
            </div>
          </div>
        )});

        // ── BOX: Instructions & Contexte (étape) ──
        if (type === "etape" && instructions) dBlocks.push({ key: "instructions", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <BookOpen className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Instructions & Contexte</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              <pre className="text-xs text-gray-700 leading-relaxed bg-gray-50 rounded-lg px-3 py-2 font-mono whitespace-pre-wrap">{instructions}</pre>
              {validateur && <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"><Shield className="h-3.5 w-3.5 text-blue-400 shrink-0" /><span className="text-xs text-gray-600">Validateur: <span className="font-bold">{validateur}</span></span></div>}
            </div>
          </div>
        )});

        if (dBlocks.length === 0) return null;

        // Zone mapping — group blocks by semantic zone for logical flow
        const zoneMap: Record<string, number> = {
          sante: 2, optimisation: 2, coutRecurrent: 2, kpis: 2, temps: 2,
          team: 3, raci: 3, sourceCapex: 3, risques: 3, livrables: 3, checklist: 3,
          historique: 4, dependances: 4, docs: 4,
          decisions: 5, conferences: 5, activites: 5,
          bilanOptimisation: 6, instructions: 6,
        };

        // Group blocks by zone
        const zoneGroups: Map<number, typeof dBlocks> = new Map();
        for (const b of dBlocks) {
          const z = zoneMap[b.key] || 3;
          if (!zoneGroups.has(z)) zoneGroups.set(z, []);
          zoneGroups.get(z)!.push(b);
        }

        // Pack a group of blocks into rows (capacity 3, merge solo w=2 pairs)
        const packToRows = (blocks: typeof dBlocks) => {
          const rows: { blocks: typeof dBlocks; totalW: number }[] = [];
          let curRow: typeof dBlocks = [];
          let curW = 0;
          for (const b of blocks) {
            if (curW + b.w > 3) {
              if (curRow.length > 0) rows.push({ blocks: curRow, totalW: curW });
              curRow = [b]; curW = b.w;
            } else {
              curRow.push(b); curW += b.w;
            }
          }
          if (curRow.length > 0) rows.push({ blocks: curRow, totalW: curW });
          // Merge consecutive solo w=2 rows into pairs
          const merged: typeof rows = [];
          let mi = 0;
          while (mi < rows.length) {
            const cur = rows[mi];
            if (cur.blocks.length === 1 && cur.blocks[0].w === 2 && mi + 1 < rows.length && rows[mi + 1].blocks.length === 1 && rows[mi + 1].blocks[0].w === 2) {
              merged.push({ blocks: [cur.blocks[0], rows[mi + 1].blocks[0]], totalW: 4 });
              mi += 2;
            } else { merged.push(cur); mi++; }
          }
          return merged;
        };

        const renderRow = (row: { blocks: typeof dBlocks; totalW: number }, ri: number) => {
          const n = row.blocks.length;
          if (n === 2 && row.totalW === 4) return <div key={ri} className="grid grid-cols-2 gap-3">{row.blocks.map(b => <div key={b.key}>{b.node}</div>)}</div>;
          if (n === 1) return <div key={ri}>{row.blocks[0].node}</div>;
          if (n === 2 && row.totalW === 2) return <div key={ri} className="grid grid-cols-2 gap-3">{row.blocks.map(b => <div key={b.key}>{b.node}</div>)}</div>;
          if (n === 3) return <div key={ri} className="grid grid-cols-1 md:grid-cols-3 gap-3">{row.blocks.map(b => <div key={b.key}>{b.node}</div>)}</div>;
          if (n === 2 && row.totalW === 3) return <div key={ri} className="grid grid-cols-1 md:grid-cols-3 gap-3">{row.blocks.map(b => <div key={b.key} className={b.w === 2 ? "col-span-2" : ""}>{b.node}</div>)}</div>;
          return <div key={ri} className="grid grid-cols-2 gap-3">{row.blocks.map(b => <div key={b.key}>{b.node}</div>)}</div>;
        };

        // Render zones in order (2→3→4→5→6)
        return Array.from(zoneGroups.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([zoneNum, zoneBlocks]) => {
            const rows = packToRows(zoneBlocks);
            return <div key={`z${zoneNum}`} className="space-y-3">{rows.map((r, ri) => renderRow(r, ri))}</div>;
          });
      })()}
    </div>
  );
}

// ── SubElementsToolbar — PARTAGÉ depuis shared/ViewModeToolbar.tsx (classes SF standardisées) ──
// import { ViewModeToolbar } from "./shared/ViewModeToolbar"; (déjà importé en haut)

// ── SubElementsList — Rendu en mode liste ──
function SubElementsList({ items }: { items: { typeIcon: React.ElementType; title: string; regularity: number; cadence: string; sla?: string; onClick: () => void }[] }) {
  return (
    <div className="space-y-1">
      {items.map((item, i) => {
        const phase = regularityToPhase(item.regularity);
        const ps = PHASE_COLORS[phase];
        return (
          <div key={i} onClick={item.onClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-gray-200 hover:shadow-md hover:border-cyan-200 transition-all cursor-pointer group">
            <item.typeIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-xs font-bold text-gray-900 flex-1 min-w-0 truncate">{item.title}</span>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0">{item.cadence}</span>
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", ps.badge)}><span className={cn("w-1.5 h-1.5 rounded-full", ps.dot)} />{ps.label}</span>
            <div className="w-16 shrink-0"><ProgressMiniPhased value={item.regularity} phase={phase} /></div>
            {item.sla && <span className="text-[9px] text-gray-400 shrink-0">SLA {item.sla}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ── SubElementsTable — Rendu en mode tableau ──
function SubElementsTable({ items }: { items: { title: string; regularity: number; cadence: string; sla?: string; onClick: () => void }[] }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Nom</th>
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Cadence</th>
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Régularité</th>
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase w-24">Progression</th>
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">SLA</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const phase = regularityToPhase(item.regularity);
            const ps = PHASE_COLORS[phase];
            return (
              <tr key={i} onClick={item.onClick} className="border-b border-gray-100 last:border-0 hover:bg-cyan-50/50 cursor-pointer transition-colors">
                <td className="px-3 py-2 font-medium text-gray-900">{item.title}</td>
                <td className="px-3 py-2 text-gray-500">{item.cadence}</td>
                <td className="px-3 py-2"><span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", ps.badge)}>{item.regularity}%</span></td>
                <td className="px-3 py-2"><ProgressMiniPhased value={item.regularity} phase={phase} /></td>
                <td className="px-3 py-2 text-gray-500">{item.sla || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ═══ COMPOSANT PRINCIPAL — même pattern que ChantierView ═══

export function OperationsView({ botCode, showHeader = true, onAction }: {
  botCode: string;
  showHeader?: boolean;
  onAction?: (phase: PhaseKey, ctx: string) => void;
}) {
  const isMobile = useIsMobile();
  const { data: mockData } = useDataSource<MockOperationItem[]>("operations", getMockOperations(botCode));
  const [selectedDept, setSelectedDept] = useState(botCode);
  const [level, setLevel] = useState<OperationLevel>("operations");
  const [selectedOp, setSelectedOp] = useState<number | null>(null);
  const [selectedProc, setSelectedProc] = useState<number | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCadence, setFilterCadence] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string>("regularity");
  const [subViewMode, setSubViewMode] = useState<"cards" | "list" | "table">("cards");

  // D-091 — Fetch latest active COMMAND mission
  const [activeMission, setActiveMission] = useState<ActiveCommandMission | null>(null);
  useEffect(() => {
    let cancelled = false;
    const fetchMission = () => {
      api.commandMissionsList(5)
        .then(data => {
          if (cancelled) return;
          const missions = (data.missions ?? []) as ActiveCommandMission[];
          const active = missions.find(m => !m.completed);
          setActiveMission(active ?? null);
        })
        .catch(() => {});
    };
    fetchMission();
    const interval = setInterval(fetchMission, 8000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  useEffect(() => { setSelectedDept(botCode); resetNav(); }, [botCode]);
  const resetNav = () => { setLevel("operations"); setSelectedOp(null); setSelectedProc(null); setSelectedRoutine(null); };

  const deptOps = selectedDept === botCode ? mockData : getMockOperations(selectedDept);

  const filtered = deptOps
    .filter(o => !searchTerm || o.titre.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(o => filterCadence === "all" || o.cadence.toLowerCase().includes(filterCadence))
    .sort((a, b) => {
      if (sortKey === "regularity") return b.regularity - a.regularity;
      if (sortKey === "alpha") return a.titre.localeCompare(b.titre);
      return 0;
    });

  // Drill-down selections
  const selOp = deptOps.find(o => o.id === selectedOp);
  const selProc = selOp?.processus.find(p => p.id === selectedProc);
  const selRoutine = selProc?.routines.find(r => r.id === selectedRoutine);

  // Top 3 = highest regularity
  const top3 = [...deptOps].sort((a, b) => b.regularity - a.regularity).slice(0, 3);

  return (
    <div className="space-y-3">
      {/* 1. LIVING HERO — Pattern SectionView */}
      {showHeader && level === "operations" && (
        <LivingHero blur1="bg-cyan-100/70" blur2="bg-teal-100/60" title="Rôdé comme une horloge." description="Régularité, SLA et optimisation continue." badge={<DomainBadge domain="operations" />}>
          <div className="relative w-[360px] h-[140px]">
            <div className="glass-base absolute right-[70px] top-[10px] w-64 h-32 p-4 border-cyan-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cycles actifs</h4>
                <div className="w-4 h-4 rounded bg-cyan-100 text-cyan-500 flex items-center justify-center">
                  <Repeat className="w-3 h-3" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative"><div className="absolute left-0 top-0 bottom-0 w-[92%] bg-cyan-400 rounded-full" /></div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative"><div className="absolute left-0 top-0 bottom-0 bg-teal-400 rounded-full shadow-[0_0_10px_#2dd4bf] anim-progress" /></div>
              </div>
            </div>
          </div>
        </LivingHero>
      )}

      {/* D-091 — COMMAND mission tracker */}
      {level === "operations" && activeMission && (
        <CommandMissionCard mission={activeMission} />
      )}

      {/* 2. TOP 3 VEDETTES — Pattern SectionView (grid-cols-3) */}
      {level === "operations" && top3.length > 0 && (
        <div>
          <CockpitSectionHeader icon={Repeat} title={`Top 3 — Opérations prioritaires${selectedDept !== "CEOB" ? ` (${DEPT_SHORT_LABEL[selectedDept] || selectedDept})` : ""}`} count={deptOps.length} color="text-cyan-500" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {top3.map((op, i) => {
              const gradient = i === 0 ? "from-cyan-500 to-teal-500" : i === 1 ? "from-blue-500 to-cyan-500" : "from-teal-500 to-emerald-500";
              return (
                <div key={op.id} className={cn("group relative rounded-xl p-4 hover:shadow-lg transition-shadow bg-gradient-to-r cursor-pointer", gradient)} onClick={() => { setSelectedOp(op.id); setLevel("processus"); }}>
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <Repeat className="h-3.5 w-3.5 text-white/80" />
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white uppercase tracking-wider">Opération</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5" />{op.cadence}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-tight">{op.titre}</h4>
                  <p className="text-[9px] text-white/80 mt-1.5 leading-relaxed line-clamp-2">{op.description}</p>
                  <div className="flex items-center gap-3 mt-2.5 text-[9px] text-white/70">
                    <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />{op.regularity}%</span>
                    <span className="flex items-center gap-1"><FolderOpen className="h-3.5 w-3.5" />{op.processus.length} processus</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />SLA {op.sla}</span>
                  </div>
                  {onAction && <WorkActionsOverlay context={op.titre} onAction={onAction} position="top" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SIDEBAR + CONTENT — Pattern SectionView */}
      <div className={cn("flex gap-3", isMobile && "flex-col gap-0")}>
        {/* Sidebar w-[180px] */}
        {level === "operations" && (() => {
          const sidebarContent = (<>
            <button onClick={() => { setSelectedDept(botCode); resetNav(); }} className={cn(SF.btnBase, selectedDept === botCode ? SF.btnActive : SF.btnInactive)}>
              <Home className={selectedDept === botCode ? SF.iconActive : SF.iconInactive} />
              <span className={selectedDept === botCode ? SF.labelActive : SF.labelInactive}>Vue d'ensemble</span>
              <span className={SF.count}>{getMockOperations(botCode).length}</span>
            </button>
            <div className={SF.separator} />
            {(botCode === "CEOB" ? DEPT_ORDER : [botCode]).map(code => {
              const isActive = selectedDept === code && selectedDept !== botCode;
              const Icon = DEPT_DASH_ICON[code] || Zap;
              const label = DEPT_SHORT_LABEL[code] || code;
              const deptCount = getMockOperations(code).length;
              return (
                <button key={code} onClick={() => { setSelectedDept(code); resetNav(); }}
                  className={cn(SF.btnBase, isActive ? SF.btnActive : SF.btnInactive)}>
                  <Icon className={isActive ? SF.iconActive : SF.iconInactive} />
                  <span className={isActive ? SF.labelActive : SF.labelInactive}>{label}</span>
                  <span className={SF.count}>{deptCount}</span>
                </button>
              );
            })}
            <div className={SF.separator} />
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-2.5 pt-1">Cadence</span>
            {["all", "hebdo", "mensuel", "quotidien"].map(c => (
              <button key={c} onClick={() => setFilterCadence(c)} className={cn(SF.btnBase, filterCadence === c ? SF.btnActive : SF.btnInactive)}>
                <Timer className={filterCadence === c ? SF.iconActive : SF.iconInactive} />
                <span className={filterCadence === c ? SF.labelActive : SF.labelInactive}>{c === "all" ? "Toutes" : c.charAt(0).toUpperCase() + c.slice(1)}</span>
              </button>
            ))}
            <div className={SF.separator} />
            {[
              { id: "processus", label: "Processus", icon: FolderOpen, count: deptOps.reduce((s, o) => s + o.processus.length, 0) },
              { id: "routines", label: "Routines", icon: Repeat, count: deptOps.reduce((s, o) => s + o.processus.reduce((s2, p) => s2 + p.routines.length, 0), 0) },
              { id: "etapes", label: "Étapes", icon: Target, count: deptOps.reduce((s, o) => s + o.processus.reduce((s2, p) => s2 + p.routines.reduce((s3, r) => s3 + r.etapes.length, 0), 0), 0) },
            ].map(item => (
              <button key={item.id} onClick={() => {}} className={cn(SF.btnBase, SF.btnInactive)}>
                <item.icon className={SF.iconInactive} />
                <span className={SF.labelInactive}>{item.label}</span>
                <span className={SF.count}>{item.count}</span>
              </button>
            ))}
          </>);
          const deptItems = botCode === "CEOB" ? DEPT_ORDER : [botCode];
          const sidebarItemCount = 1 + deptItems.length + 4 + 3;
          const activeLabel = selectedDept === botCode ? "Vue d'ensemble" : (DEPT_SHORT_LABEL[selectedDept] || selectedDept);
          return isMobile ? (
            <MobileSidebarSheet currentLabel={activeLabel} itemCount={sidebarItemCount}>
              {sidebarContent}
            </MobileSidebarSheet>
          ) : (
            <div className={SF.sidebarW}>
              {sidebarContent}
            </div>
          );
        })()}

        {/* Content */}
        <div className={SF.content}>
          {/* LEVEL: operations — Toolbar + grid cards */}
          {level === "operations" && (
            <>
              <div className={SF.toolbarWrap}>
                <div className={SF.searchWrap}>
                  <Search className={SF.searchIcon} />
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher une opération..." className={SF.searchInput} />
                </div>
                <select value={filterCadence} onChange={e => setFilterCadence(e.target.value)} className={SF.select}>
                  <option value="all">Toutes cadences</option>
                  <option value="hebdo">Hebdomadaire</option>
                  <option value="mensuel">Mensuel</option>
                  <option value="quotidien">Quotidien</option>
                </select>
                <select value={sortKey} onChange={e => setSortKey(e.target.value)} className={SF.select}>
                  <option value="regularity">Régularité</option>
                  <option value="alpha">A → Z</option>
                </select>
                <div className={SF.viewToggleGroup}>
                  {([
                    { key: "cards" as const, icon: LayoutGrid, tip: "Cartes" },
                    { key: "list" as const, icon: LayoutList, tip: "Liste" },
                    { key: "table" as const, icon: Table2, tip: "Tableau" },
                  ]).map(v => (
                    <button key={v.key} onClick={() => setSubViewMode(v.key)} title={v.tip}
                      className={subViewMode === v.key ? SF.viewToggleBtnActive : SF.viewToggleBtnInactive}>
                      <v.icon className={SF.viewToggleIcon} />
                    </button>
                  ))}
                </div>
                <span className={SF.itemCount}>{filtered.length} opération{filtered.length > 1 ? "s" : ""}</span>
              </div>
              {subViewMode === "cards" && (
                <div className={SF.gridContent}>
                  {filtered.map(op => {
                    const phase = regularityToPhase(op.regularity);
                    const ps = PHASE_COLORS[phase];
                    const bot = BOT_DISPLAY[op.botPrimaire];
                    const avatar = BOT_AVATAR_MAP[op.botPrimaire];
                    return (
                      <div key={op.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-cyan-200 transition-all cursor-pointer" onClick={() => { setSelectedOp(op.id); setLevel("processus"); }}>
                        <div className="px-3.5 py-2.5 border-b border-gray-100 bg-cyan-50/30">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-gray-100">
                              {avatar && <img src={avatar} alt={bot?.name} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-gray-800 block truncate">{op.titre}</span>
                              <span className="text-[9px] text-gray-400">{bot?.name} · {op.cadence}</span>
                            </div>
                            <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-full", ps.badge)}>{ps.label}</span>
                          </div>
                        </div>
                        <div className="px-3.5 py-2.5">
                          <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{op.description}</p>
                          <ProgressMiniPhased value={op.regularity} phase={phase} />
                          <div className="flex items-center gap-3 mt-2 text-[9px] text-gray-400">
                            <span className="flex items-center gap-1"><FolderOpen className="h-3.5 w-3.5" />{op.processus.length} processus</span>
                            <span className="flex items-center gap-1"><Timer className="h-3.5 w-3.5" />SLA {op.sla}</span>
                            {op.sourceChantier && <span className="flex items-center gap-1 text-cyan-500"><Zap className="h-3.5 w-3.5" />ex-CAPEX</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {subViewMode === "list" && (
                <SubElementsList items={filtered.map(op => ({
                  typeIcon: Repeat,
                  title: op.titre,
                  regularity: op.regularity,
                  cadence: op.cadence,
                  sla: op.sla,
                  onClick: () => { setSelectedOp(op.id); setLevel("processus"); },
                }))} />
              )}
              {subViewMode === "table" && (
                <SubElementsTable items={filtered.map(op => ({
                  title: op.titre,
                  regularity: op.regularity,
                  cadence: op.cadence,
                  sla: op.sla,
                  onClick: () => { setSelectedOp(op.id); setLevel("processus"); },
                }))} />
              )}
            </>
          )}

          {/* LEVEL: processus — Fiche detail opération + sous-éléments processus */}
          {level === "processus" && selOp && (
            <OperationEntityDetail type="operation" title={selOp.titre} description={selOp.description} cadence={selOp.cadence} sla={selOp.sla} regularity={selOp.regularity} botPrimaire={selOp.botPrimaire} botCodes={selOp.botCodes} sourceChantier={selOp.sourceChantier} derniereExecution={selOp.derniereExecution} prochaineExecution={selOp.prochaineExecution} sante={selOp.sante} historique={selOp.historique} documents={selOp.documents} raci={selOp.raci} risques={selOp.risques} livrables={selOp.livrables} kpisCibles={selOp.kpisCibles} coutRecurrent={selOp.coutRecurrent} dependances={selOp.dependances} decisions={selOp.decisions} conferences={selOp.conferences} activites={selOp.activites} bilanOptimisation={selOp.bilanOptimisation} onBack={resetNav} onAction={onAction} backLabel="Retour aux opérations" subTitle="processus" subCount={selOp.processus.length}
              subItems={selOp.processus.map(pr => ({ id: pr.id, titre: pr.titre, regularity: pr.regularity, cadence: pr.cadence, subCount: pr.routines.length, subLabel: "routines" }))}
              onSubItemClick={(id) => { setSelectedProc(id); setLevel("routines"); }} />
          )}

          {/* LEVEL: routines — Fiche detail processus + sous-éléments routines */}
          {level === "routines" && selProc && (
            <OperationEntityDetail type="processus" title={selProc.titre} description={selProc.description} cadence={selProc.cadence} regularity={selProc.regularity} botPrimaire={selProc.botPrimaire} derniereExecution={selProc.derniereExecution} prochaineExecution={selProc.prochaineExecution} historique={selProc.historique} documents={selProc.documents} raci={selProc.raci} risques={selProc.risques} dependances={selProc.dependances} onBack={() => { setSelectedProc(null); setSelectedRoutine(null); setLevel("processus"); }} onAction={onAction} backLabel={`Retour — ${selOp?.titre || "Opération"}`} subTitle="routines" subCount={selProc.routines.length}
              subItems={selProc.routines.map(r => ({ id: r.id, titre: r.titre, regularity: r.regularity, cadence: r.cadence, sla: r.sla, subCount: r.etapes.length, subLabel: "étapes" }))}
              onSubItemClick={(id) => { setSelectedRoutine(id); setLevel("etapes"); }} />
          )}

          {/* LEVEL: etapes — Fiche detail routine + sous-éléments étapes */}
          {level === "etapes" && selRoutine && (
            <OperationEntityDetail type="routine" title={selRoutine.titre} description={selRoutine.description} cadence={selRoutine.cadence} sla={selRoutine.sla} regularity={selRoutine.regularity} botPrimaire={selRoutine.botPrimaire} checklist={selRoutine.checklist} historique={selRoutine.historique} documents={selRoutine.documents} risques={selRoutine.risques} kpisCibles={selRoutine.kpisCibles} onBack={() => { setSelectedRoutine(null); setLevel("routines"); }} onAction={onAction} backLabel={`Retour — ${selProc?.titre || "Processus"}`} subTitle="étapes" subCount={selRoutine.etapes.length}
              subItems={selRoutine.etapes.map(e => {
                const regMap: Record<string, number> = { complete: 100, en_cours: 50, "a-faire": 0 };
                return { id: e.id, titre: e.titre, regularity: regMap[e.statut] ?? 0, cadence: e.cadence };
              })}
              onSubItemClick={(id) => {
                /* Étape = dernier niveau, pas de drill-down supplémentaire */
              }} />
          )}
        </div>
      </div>
    </div>
  );
}
