/**
 * ChantierView.tsx — Gestion Chantiers/Projets/Missions/Tâches (drill-down 5 niveaux)
 *
 * Extrait de BlueprintDepartement.tsx L10642-12122 (1,481 lignes)
 * Structure: LivingHero → Vedettes grid-cols-3 → Sidebar w-[180px] + Contenu cascade
 */

import { useState, useEffect } from "react";
import {
  Home, Target, Layers, Rocket, DollarSign, Shield, TrendingUp,
  TrendingDown, ListChecks, Settings, Flame, CheckCircle2,
  AlertTriangle, Info, FileText, BookOpen, ChevronRight,
  Users, User, Briefcase, Plus, PenLine, Zap, Activity,
  BarChart3, MessageCircle, Search, GitBranch, LayoutList,
  LayoutGrid, Table2, FolderOpen, Filter, Package, Calendar,
  Clock, Lock, Play, RotateCcw, Brain, Hammer, ClipboardCheck,
  Gavel, Stethoscope, Video, CheckSquare, ClipboardList, Route,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { cn } from "../../components/ui/utils";
import { BOT_AVATAR } from "../../v2/api/types";
import { useChantiers } from "../../v2/api/hooks";
import { LivingHero } from "./shared/LivingHero";
import { ProgressMiniPhased } from "./shared/ProgressMiniPhased";
import { useDataSource } from "../data/use-data-source";
import { DomainBadge } from "../data/source-badge";
import { DEPT_SHORT_LABEL, DEPT_DASH_ICON, PHASE_COLORS, BOT_DISPLAY, BOT_AVATAR_MAP, type PhaseKey } from "./shared/dept-data";
import { SF } from "../core/styles";
import { useIsMobile } from "../../components/ui/use-mobile";
import { MobileSidebarSheet } from "../core/MobileSidebarSheet";
import { ViewModeToolbar } from "./shared/ViewModeToolbar";
import { CockpitSectionHeader, WorkActionsOverlay, DEPT_ORDER, WORK_ACTIONS } from "./CockpitView";
import { type MockChantierItem, type MockProjetItem, type MockMissionItem, type MockTacheItem, type MockDocument, type MockJalon, type MockRACIItem, type MockDecisionLog, type MockConferenceAI, type MockActivityLog, type MockCriterion, type MockDependency, MOCK_CHANTIERS, getMockChantiers } from "../data/mock/chantiers.mock";

type ChantierLevel = "chantiers" | "projets" | "missions" | "taches" | "tache-detail";
type ChantierSortKey = "recent" | "progression" | "phase" | "alpha";

// Phase derivation — maps status/progression to visual work phase
function statusToPhase(status: string, progression: number): PhaseKey {
  if (status === "completee" || status === "done") return "retroaction";
  if (status === "en-cours" || status === "in_progress") return "execution";
  if (status === "actif") return progression >= 80 ? "retroaction" : progression >= 20 ? "execution" : "creation";
  if (status === "pause") return "reflexion";
  return "discussion";
}

// ProgressMiniPhased — importé depuis shared/ProgressMiniPhased.tsx

// Mock interfaces and data imported from ../data/mock/chantiers.mock.ts

// ── ChantierCard — Card standard pattern SectionView (grid-cols-2, header bg-[#00B4D8]/10) ──
function ChantierCard({ typeLabel, typeIcon: TypeIcon, title, description, phase, progression, subCount, subLabel, echeance, assignee, onAction, onClick }: {
  typeLabel: string; typeIcon: React.ElementType;
  title: string; description?: string; phase: PhaseKey; progression: number;
  subCount?: number; subLabel?: string; echeance?: string; assignee?: string;
  onAction?: (phase: PhaseKey, ctx: string) => void; onClick: () => void;
}) {
  const ps = PHASE_COLORS[phase];
  return (
    <div className="group relative rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
        <TypeIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">{typeLabel}</span>
        <span className="text-sm font-bold text-gray-900 truncate flex-1">{title}</span>
        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", ps.badge)}>
          <span className={cn("w-2 h-2 rounded-full", ps.dot)} />{ps.label}
        </span>
      </div>
      <div className="px-4 py-3 space-y-2">
        {description && <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{description}</p>}
        <ProgressMiniPhased value={progression} phase={phase} />
        <div className="flex items-center gap-3 text-[9px] text-gray-400">
          {subCount !== undefined && <span>{subCount} {subLabel || "éléments"}</span>}
          {assignee && <span>{assignee}</span>}
          {echeance && <span>{echeance}</span>}
        </div>
      </div>
      {onAction && <WorkActionsOverlay context={title} onAction={onAction} />}
    </div>
  );
}

// ── ChantierEntityDetail — Fiche detail inline (pattern PlaybookFicheDetailInline) ──
function ChantierEntityDetail({ type, title, description, phase, progression, echeance, dateDebut, dateMaj, botPrimaire, botCodes, objectifs, budget, risques, livrables, documents, jalons, sante, raci, decisions, conferences, activites, retrospective, criteresAcceptation, dependances, equipe, instructions, validateur, tempsEstime, tempsReel, subItems, onSubItemClick, subTitle, subCount, extraContent, onBack, onAction, backLabel }: {
  type: "chantier" | "projet" | "mission" | "tache";
  title: string; description?: string; phase: PhaseKey; progression: number;
  echeance?: string; dateDebut?: string; dateMaj?: string; botPrimaire?: string; botCodes?: string[];
  objectifs?: string[]; budget?: string; risques?: string[]; livrables?: string[];
  documents?: MockDocument[]; jalons?: MockJalon[];
  sante?: { score: number; tendance: "up" | "down" | "stable"; burnRate?: string; roi?: string };
  raci?: MockRACIItem[]; decisions?: MockDecisionLog[]; conferences?: MockConferenceAI[];
  activites?: MockActivityLog[]; retrospective?: { positifs: string[]; negatifs: string[]; actions: string[] };
  criteresAcceptation?: MockCriterion[]; dependances?: MockDependency[]; equipe?: string[];
  instructions?: string; validateur?: string; tempsEstime?: string; tempsReel?: string;
  subItems?: Array<{ id: number; titre: string; phase: PhaseKey; progression: number; echeance?: string; assignee?: string; subCount?: number; subLabel?: string }>;
  onSubItemClick?: (id: number) => void; subTitle?: string; subCount?: number;
  extraContent?: React.ReactNode;
  onBack: () => void; onAction?: (phase: PhaseKey, ctx: string) => void; backLabel: string;
}) {
  const ps = PHASE_COLORS[phase];
  const TypeIcon = type === "chantier" ? Flame : type === "projet" ? FolderOpen : type === "mission" ? Target : ListChecks;
  const gradients: Record<string, string> = { chantier: "from-orange-500 to-amber-500", projet: "from-blue-500 to-cyan-500", mission: "from-green-500 to-emerald-500", tache: "from-violet-500 to-purple-500" };
  const typeLabels: Record<string, string> = { chantier: "Chantier", projet: "Projet", mission: "Mission", tache: "Tâche" };
  const subTypeLabels: Record<string, string> = { projets: "Projets", missions: "Missions", "tâches": "Tâches", détails: "Détails" };
  const subTypeIcons: Record<string, React.ElementType> = { projets: FolderOpen, missions: Target, "tâches": ListChecks, détails: FileText };
  const SubIcon = subTitle ? (subTypeIcons[subTitle] || Layers) : Layers;

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
        <ChevronRight className="h-3.5 w-3.5 rotate-180" /> {backLabel}
      </button>
          {/* Hero + Details grid-cols-5 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className={cn("col-span-3 relative bg-gradient-to-r rounded-xl overflow-hidden shadow-sm", gradients[type])}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <TypeIcon className="h-5 w-5 text-white" />
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white uppercase tracking-wider">{typeLabels[type]}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white bg-white/15 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60" />{ps.label}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
                {description && <p className="text-xs text-white/80 leading-relaxed line-clamp-3">{description}</p>}
                <div className="flex items-center gap-3 text-[10px] text-white/70">
                  <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />{progression}%</span>
                  {echeance && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{echeance}</span>}
                  {subCount !== undefined && <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" />{subCount} {subTitle}</span>}
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
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Phase</span>
                  <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1", ps.badge)}><span className={cn("w-2 h-2 rounded-full", ps.dot)} />{ps.label}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Progression</span>
                  <span className="text-xs font-bold text-gray-700">{progression}%</span>
                </div>
                {botPrimaire && BOT_DISPLAY[botPrimaire] && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Responsable</span>
                    <div className="flex items-center gap-1.5">
                      {BOT_AVATAR_MAP[botPrimaire] && <img src={BOT_AVATAR_MAP[botPrimaire]} className="h-5 w-5 rounded-full object-cover" alt="" />}
                      <span className="text-xs font-bold text-gray-700">{BOT_DISPLAY[botPrimaire]?.name || botPrimaire}</span>
                    </div>
                  </div>
                )}
                {echeance && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Échéance</span>
                    <span className="text-xs font-bold text-gray-700">{echeance}</span>
                  </div>
                )}
                {dateMaj && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Mise à jour</span>
                    <span className="text-xs font-bold text-gray-500">{dateMaj}</span>
                  </div>
                )}
                <div className="pt-1"><ProgressMiniPhased value={progression} phase={phase} /></div>
              </div>
            </div>
          </div>

      {/* ── ZONE 1: Sous-éléments (projets/missions/tâches) — box liste compacte ── */}
      {subItems && subItems.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <SubIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">{subTypeLabels[subTitle || ""] || subTitle}</span>
            <span className="text-[9px] text-gray-400 ml-auto">{subItems.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {subItems.map(item => {
              const ips = PHASE_COLORS[item.phase];
              return (
                <div key={item.id} onClick={() => onSubItemClick?.(item.id)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors">
                  <SubIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="text-xs font-bold text-gray-900 flex-1 min-w-0 truncate">{item.titre}</span>
                  <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", ips.badge)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", ips.dot)} />{ips.label}
                  </span>
                  <div className="w-20 shrink-0"><ProgressMiniPhased value={item.progression} phase={item.phase} /></div>
                  {item.subCount !== undefined && <span className="text-[9px] text-gray-400 shrink-0">{item.subCount} {item.subLabel}</span>}
                  {item.echeance && <span className="text-[9px] text-gray-400 shrink-0">{item.echeance}</span>}
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Smart detail blocks grid — packing intelligent par zones sémantiques ── */}
      {(() => {
        // Collect all visible detail blocks with weight (1=compact, 2=large)
        const dBlocks: { key: string; w: 1 | 2; node: React.ReactNode }[] = [];
        const formatColors: Record<string, string> = { PDF: "bg-red-100 text-red-700", XLSX: "bg-green-100 text-green-700", DOCX: "bg-blue-100 text-blue-700", PPTX: "bg-orange-100 text-orange-700", MD: "bg-gray-100 text-gray-700", JSON: "bg-violet-100 text-violet-700", SQL: "bg-cyan-100 text-cyan-700", PY: "bg-yellow-100 text-yellow-700" };

        if (objectifs && objectifs.length > 0) dBlocks.push({ key: "obj", w: objectifs.length > 4 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Target className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Objectifs</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {objectifs.map((obj, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 leading-relaxed">{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )});
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
        if (budget) dBlocks.push({ key: "budget", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <DollarSign className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Budget</span>
            </div>
            <div className="px-4 py-3">
              <div className="text-lg font-bold text-gray-900">{budget}</div>
              <div className="flex items-center gap-1.5 mt-1.5"><ProgressMiniPhased value={progression} phase={phase} /></div>
              <span className="text-[9px] text-gray-400 mt-1 block">{progression}% du budget consommé</span>
            </div>
          </div>
        )});
        if (risques && risques.length > 0) dBlocks.push({ key: "risques", w: risques.length > 3 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <AlertTriangle className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Risques</span>
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
        if (jalons && jalons.length > 0) dBlocks.push({ key: "jalons", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Calendar className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Timeline — Jalons</span>
              <span className="text-[9px] text-gray-400 ml-auto">{jalons.filter(j => j.done).length}/{jalons.length} complétés</span>
            </div>
            <div className="px-4 py-3">
              {dateDebut && echeance && (
                <div className="flex items-center gap-2 mb-3 text-[10px] text-gray-500">
                  <span>Début: <span className="font-bold text-gray-700">{dateDebut}</span></span>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span>Fin: <span className="font-bold text-gray-700">{echeance}</span></span>
                </div>
              )}
              <div className="space-y-1.5">
                {jalons.map((j, i) => (
                  <div key={i} className="group relative flex items-center gap-2.5">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2", j.done ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-300")}>
                      {j.done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className="text-[10px] text-gray-400 w-20 shrink-0">{j.date}</span>
                    <span className={cn("text-xs leading-tight flex-1", j.done ? "text-gray-500 line-through" : "text-gray-800 font-medium")}>{j.label}</span>
                    {onAction && <WorkActionsOverlay context={`Jalon: ${j.label}`} onAction={onAction} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )});
        if (livrables && livrables.length > 0) dBlocks.push({ key: "livrables", w: livrables.length > 4 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Package className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Livrables attendus</span>
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

        // ── BOX 1: Santé & KPIs (chantier, projet) ──
        if (sante) dBlocks.push({ key: "sante", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Stethoscope className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Santé & KPIs</span>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className={cn("text-2xl font-black", sante.score >= 70 ? "text-emerald-600" : sante.score >= 40 ? "text-amber-500" : "text-red-500")}>{sante.score}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    {sante.tendance === "up" ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : sante.tendance === "down" ? <TrendingDown className="h-3.5 w-3.5 text-red-500" /> : <Activity className="h-3.5 w-3.5 text-gray-400" />}
                    <span className="text-[10px] text-gray-500">{sante.tendance === "up" ? "En hausse" : sante.tendance === "down" ? "En baisse" : "Stable"}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                    <div className={cn("h-full rounded-full", sante.score >= 70 ? "bg-emerald-500" : sante.score >= 40 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${sante.score}%` }} />
                  </div>
                </div>
              </div>
              {sante.burnRate && <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5"><span className="text-[10px] text-gray-400">Burn rate</span><span className="text-xs font-bold text-gray-700">{sante.burnRate}</span></div>}
              {sante.roi && <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5"><span className="text-[10px] text-gray-400">ROI</span><span className="text-xs font-bold text-gray-700">{sante.roi}</span></div>}
            </div>
          </div>
        )});

        // ── BOX 2: Matrice RACI (chantier, projet) ──
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

        // ── BOX 3: Critères d'acceptation (mission, tâche) ──
        if (criteresAcceptation && criteresAcceptation.length > 0) dBlocks.push({ key: "criteres", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <ClipboardCheck className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Critères d'acceptation</span>
              <span className="text-[9px] text-gray-400 ml-auto">{criteresAcceptation.filter(c => c.done).length}/{criteresAcceptation.length}</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {criteresAcceptation.map((c, i) => (
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

        // ── BOX 4: Journal des décisions (chantier, projet) ──
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

        // ── BOX 5: Dépendances & Bloquants (projet, mission, tâche) ──
        if (dependances && dependances.length > 0) dBlocks.push({ key: "deps", w: 1, node: (
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
                    <span className="text-[9px] text-gray-400">{dep.type === "bloque" ? "Bloque →" : "Bloqué par ←"} {dep.entite}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )});

        // ── BOX 6: Conférences AI (tous niveaux) ──
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

        // ── BOX 7: Logs d'activité (chantier, projet) ──
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

        // ── BOX 8: Rétrospective (chantier) ──
        if (retrospective) dBlocks.push({ key: "retro", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <RotateCcw className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Rétrospective</span>
            </div>
            <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Ce qui va bien</span>
                {retrospective.positifs.map((p, i) => <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-emerald-50 rounded px-2 py-1">{p}</div>)}
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> À améliorer</span>
                {retrospective.negatifs.map((n, i) => <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-red-50 rounded px-2 py-1">{n}</div>)}
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1"><Rocket className="h-3.5 w-3.5" /> Actions</span>
                {retrospective.actions.map((a, i) => <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-blue-50 rounded px-2 py-1">{a}</div>)}
              </div>
            </div>
          </div>
        )});

        // ── BOX tâche: Instructions & Contexte ──
        if (type === "tache" && instructions) dBlocks.push({ key: "instructions", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <BookOpen className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Instructions & Contexte</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs text-gray-700 leading-relaxed">{instructions}</p>
              {validateur && <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"><Shield className="h-3.5 w-3.5 text-blue-400 shrink-0" /><span className="text-xs text-gray-600">Validateur: <span className="font-bold">{validateur}</span></span></div>}
            </div>
          </div>
        )});

        // ── BOX tâche: Temps & Délais ──
        if (type === "tache" && (tempsEstime || tempsReel)) dBlocks.push({ key: "temps", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Clock className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Temps & Délais</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {tempsEstime && <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"><span className="text-[10px] text-gray-400">Estimé</span><span className="text-xs font-bold text-gray-700">{tempsEstime}</span></div>}
              {tempsReel && <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"><span className="text-[10px] text-gray-400">Réel</span><span className="text-xs font-bold text-gray-700">{tempsReel}</span></div>}
              {tempsEstime && tempsReel && (() => {
                const est = parseFloat(tempsEstime); const reel = parseFloat(tempsReel);
                if (!isNaN(est) && !isNaN(reel) && est > 0) {
                  const ratio = reel / est;
                  return <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"><span className="text-[10px] text-gray-400">Efficacité</span><span className={cn("text-xs font-bold", ratio <= 1 ? "text-emerald-600" : "text-amber-600")}>{Math.round(ratio * 100)}%</span></div>;
                }
                return null;
              })()}
            </div>
          </div>
        )});

        // ── BOX mission/tâche: Équipe ──
        if ((type === "mission" || type === "tache") && equipe && equipe.length > 0) dBlocks.push({ key: "equipe-mi", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Équipe</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {equipe.map(code => (
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

        if (dBlocks.length === 0) return null;

        // Zone mapping — group blocks by semantic zone for logical flow
        const zoneMap: Record<string, number> = {
          sante: 2, budget: 2, temps: 2,
          obj: 3, team: 3, "equipe-mi": 3, raci: 3, risques: 3, livrables: 3, criteres: 3,
          jalons: 4, deps: 4, docs: 4,
          decisions: 5, conferences: 5, activites: 5,
          retro: 6, instructions: 6,
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

      {/* Extra content (tâche-detail actions) */}
      {extraContent && (
        <div className="space-y-3">{extraContent}</div>
      )}

    </div>
  );
}

// ── SubElementsToolbar — PARTAGÉ depuis shared/ViewModeToolbar.tsx (classes SF standardisées) ──
// Ancien code inline supprimé — utiliser <ViewModeToolbar /> importé en haut

// ── SubElementsList — Rendu en mode liste ──
function SubElementsList({ items, onAction }: { items: { typeLabel: string; typeIcon: React.ElementType; title: string; phase: PhaseKey; progression: number; echeance?: string; assignee?: string; onClick: () => void }[]; onAction?: (phase: PhaseKey, ctx: string) => void }) {
  return (
    <div className="space-y-1">
      {items.map((item, i) => {
        const ps = PHASE_COLORS[item.phase];
        return (
          <div key={i} onClick={item.onClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
            <item.typeIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-xs font-bold text-gray-900 flex-1 min-w-0 truncate">{item.title}</span>
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", ps.badge)}><span className={cn("w-1.5 h-1.5 rounded-full", ps.dot)} />{ps.label}</span>
            <div className="w-16 shrink-0"><ProgressMiniPhased value={item.progression} phase={item.phase} /></div>
            {item.echeance && <span className="text-[9px] text-gray-400 shrink-0">{item.echeance}</span>}
            {item.assignee && <span className="text-[9px] text-gray-500 shrink-0">{item.assignee}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ── SubElementsTable — Rendu en mode tableau ──
function SubElementsTable({ items, onAction }: { items: { typeLabel: string; title: string; phase: PhaseKey; progression: number; echeance?: string; assignee?: string; onClick: () => void }[]; onAction?: (phase: PhaseKey, ctx: string) => void }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Nom</th>
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Phase</th>
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase w-24">Progression</th>
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Échéance</th>
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Assigné</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const ps = PHASE_COLORS[item.phase];
            return (
              <tr key={i} onClick={item.onClick} className="border-b border-gray-100 last:border-0 hover:bg-blue-50/50 cursor-pointer transition-colors">
                <td className="px-3 py-2 font-medium text-gray-900">{item.title}</td>
                <td className="px-3 py-2"><span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", ps.badge)}>{ps.label}</span></td>
                <td className="px-3 py-2"><ProgressMiniPhased value={item.progression} phase={item.phase} /></td>
                <td className="px-3 py-2 text-gray-500">{item.echeance || "—"}</td>
                <td className="px-3 py-2 text-gray-500">{item.assignee || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ChantierView({ botCode, showHeader = true, onAction }: { botCode: string; showHeader?: boolean; onAction?: (phase: PhaseKey, ctx: string) => void }) {
  // API data (real DB) + mock data (simulation réaliste)
  const { chantiers: apiChantiers, loading: loadingCh } = useChantiers();
  const { data: mockChantiers } = useDataSource("chantiers", MOCK_CHANTIERS);
  const mockData = (mockChantiers[botCode] || mockChantiers.CEOB || []) as MockChantierItem[];
  const [selectedDept, setSelectedDept] = useState(botCode);
  const [level, setLevel] = useState<ChantierLevel>("chantiers");
  const [selectedChantier, setSelectedChantier] = useState<number | null>(null);
  const [selectedProjet, setSelectedProjet] = useState<number | null>(null);
  const [selectedMission, setSelectedMission] = useState<number | null>(null);
  const [detailTache, setDetailTache] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPhase, setFilterPhase] = useState<string>("all");
  const [sortKey, setSortKey] = useState<ChantierSortKey>("phase");
  const [subViewMode, setSubViewMode] = useState<"cards" | "list" | "table">("cards");
  const isMobile = useIsMobile();

  // Sync quand botCode change
  useEffect(() => { setSelectedDept(botCode); resetNav(); }, [botCode]);
  const resetNav = () => { setLevel("chantiers"); setSelectedChantier(null); setSelectedProjet(null); setSelectedMission(null); setDetailTache(null); };

  // Merge API + mock — API chantiers en premier, mock pour la simulation
  const deptMock = selectedDept === botCode ? mockData : (mockChantiers[selectedDept] || mockChantiers.CEOB || []) as MockChantierItem[];
  const apiConverted: MockChantierItem[] = (apiChantiers || [])
    .filter(ch => {
      if (!ch.bot_codes?.length) return selectedDept === "CEOB";
      return ch.bot_codes.includes(selectedDept);
    })
    .map(ch => ({
      id: ch.id + 90000,
      titre: ch.titre,
      description: ch.description || "",
      phase: statusToPhase(ch.status, ch.progression),
      progression: ch.progression || 0,
      dateDebut: ch.created_at?.slice(0, 10) || "",
      echeance: ch.echeance || "",
      botPrimaire: ch.bot_codes?.[0] || "CEOB",
      botCodes: ch.bot_codes || [],
      objectifs: ch.objectifs || [],
      budget: ch.budget_estime || "",
      risques: ch.risques || [],
      documents: [],
      jalons: [],
      projets: [],
    }));
  const allChantiers = [...apiConverted, ...deptMock];

  // Filter + sort
  const filtered = allChantiers
    .filter(c => !searchTerm || c.titre.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(c => filterPhase === "all" || c.phase === filterPhase)
    .sort((a, b) => {
      if (sortKey === "phase") { const phaseOrder: Record<string, number> = { discussion: 0, reflexion: 1, creation: 2, execution: 3, retroaction: 4 }; return (phaseOrder[a.phase] ?? 5) - (phaseOrder[b.phase] ?? 5); }
      if (sortKey === "progression") return b.progression - a.progression;
      if (sortKey === "alpha") return a.titre.localeCompare(b.titre);
      return 0;
    });

  // Drill-down selections
  const selCh = allChantiers.find(c => c.id === selectedChantier);
  const selPr = selCh?.projets.find(p => p.id === selectedProjet);
  const selMi = selPr?.missions.find(m => m.id === selectedMission);
  const selTa = selMi?.taches.find(t => t.id === detailTache);

  // Top 3 = highest progression in execution phase
  const top3 = [...allChantiers].sort((a, b) => {
    const phaseWeight: Record<string, number> = { execution: 3, creation: 2, reflexion: 1, retroaction: 0, discussion: 0 };
    return (phaseWeight[b.phase] ?? 0) - (phaseWeight[a.phase] ?? 0) || b.progression - a.progression;
  }).slice(0, 3);

  return (
    <div className="space-y-3">
      {/* 1. LIVING HERO — Pattern SectionView */}
      {showHeader && level === "chantiers" && (
        <LivingHero blur1="bg-orange-100/70" blur2="bg-amber-100/60" title="Brique par brique." description="Avancement, sprints et vélocité réelle." badge={<DomainBadge domain="chantiers" />}>
          <div className="relative w-[360px] h-[140px]">
            <div className="absolute right-[30px] bottom-[-20px] w-48 h-32 flex items-end justify-between px-4 opacity-50 space-x-2">
              <div className="w-12 bg-orange-200 border-t-4 border-orange-400 anim-block-1" />
              <div className="w-12 bg-amber-200 border-t-4 border-amber-400 anim-block-2" />
              <div className="w-12 bg-orange-300 border-t-4 border-orange-500 anim-block-3" />
            </div>
            <div className="glass-base absolute right-[70px] top-[10px] w-64 h-32 p-4 border-orange-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sprints Q2</h4>
                <div className="w-4 h-4 rounded bg-orange-100 text-orange-500 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
              </div>
              <div className="space-y-3">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative"><div className="absolute left-0 top-0 bottom-0 w-[60%] bg-orange-400 rounded-full" /></div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative"><div className="absolute left-0 top-0 bottom-0 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b] anim-progress" /></div>
              </div>
            </div>
          </div>
        </LivingHero>
      )}

      {/* 2. TOP 3 VEDETTES — Pattern SectionView (grid-cols-3 + CockpitSectionHeader) */}
      {level === "chantiers" && top3.length > 0 && (
        <div>
          <CockpitSectionHeader icon={Flame} title={`Top 3 — Chantiers prioritaires${selectedDept !== "CEOB" ? ` (${DEPT_SHORT_LABEL[selectedDept] || selectedDept})` : ""}`} count={allChantiers.length} color="text-orange-500" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {top3.map((ch, i) => {
              const ps = PHASE_COLORS[ch.phase];
              const gradient = i === 0 ? "from-orange-500 to-amber-500" : i === 1 ? "from-blue-500 to-cyan-500" : "from-emerald-500 to-teal-500";
              return (
                <div key={ch.id} className={cn("group relative rounded-xl p-4 hover:shadow-lg transition-shadow bg-gradient-to-r cursor-pointer", gradient)} onClick={() => { setSelectedChantier(ch.id); setLevel("projets"); }}>
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <Flame className="h-3.5 w-3.5 text-white/80" />
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white uppercase tracking-wider">Chantier</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60" />{ps.label}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-tight">{ch.titre}</h4>
                  <p className="text-[9px] text-white/80 mt-1.5 leading-relaxed line-clamp-2">{ch.description}</p>
                  <div className="flex items-center gap-3 mt-2.5 text-[9px] text-white/70">
                    <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />{ch.progression}%</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{ch.projets.length} projets</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{ch.echeance}</span>
                  </div>
                  {onAction && <WorkActionsOverlay context={ch.titre} onAction={onAction} position="top" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SIDEBAR DÉPARTEMENTS + CONTENT — Pattern SectionView */}
      <div className={cn("flex gap-3", isMobile && "flex-col gap-0")}>
        {/* Sidebar w-[180px] — départements (comme Cockpit) */}
        {level === "chantiers" && (() => {
          const deptItems = botCode === "CEOB" ? DEPT_ORDER : [botCode];
          const phaseFilters = [
            { key: "all", label: "Toutes", icon: Layers, count: allChantiers.length },
            { key: "discussion", label: "Discussion", icon: MessageCircle, count: allChantiers.filter(c => c.phase === "discussion").length },
            { key: "reflexion", label: "Réflexion", icon: Brain, count: allChantiers.filter(c => c.phase === "reflexion").length },
            { key: "creation", label: "Conception", icon: Hammer, count: allChantiers.filter(c => c.phase === "creation").length },
            { key: "execution", label: "Exécution", icon: Rocket, count: allChantiers.filter(c => c.phase === "execution").length },
            { key: "retroaction", label: "Rétroaction", icon: BarChart3, count: allChantiers.filter(c => c.phase === "retroaction").length },
          ] as const;
          const subSections = [
            { id: "projets", label: "Projets", icon: FolderOpen, count: allChantiers.reduce((s, c) => s + c.projets.length, 0) },
            { id: "missions", label: "Missions", icon: Target, count: allChantiers.reduce((s, c) => s + c.projets.reduce((s2, p) => s2 + p.missions.length, 0), 0) },
            { id: "taches", label: "Tâches", icon: ListChecks, count: allChantiers.reduce((s, c) => s + c.projets.reduce((s2, p) => s2 + p.missions.reduce((s3, m) => s3 + m.taches.length, 0), 0), 0) },
          ];
          const totalSidebarItems = 1 + deptItems.length + phaseFilters.length + subSections.length;
          const currentLabel = selectedDept === botCode ? "Vue d'ensemble" : (DEPT_SHORT_LABEL[selectedDept] || selectedDept);

          const sidebarContent = (<>
            {/* Vue d'ensemble */}
            <button onClick={() => { setSelectedDept(botCode); resetNav(); }} className={cn(SF.btnBase, selectedDept === botCode && level === "chantiers" ? SF.btnActive : SF.btnInactive)}>
              <Home className={selectedDept === botCode ? SF.iconActive : SF.iconInactive} />
              <span className={selectedDept === botCode ? SF.labelActive : SF.labelInactive}>Vue d'ensemble</span>
              <span className={SF.count}>{(mockChantiers[botCode] || []).length}</span>
            </button>
            <div className={SF.separator} />
            {/* Départements — comme Cockpit sidebar */}
            {deptItems.map(code => {
              const isActive = selectedDept === code && selectedDept !== botCode;
              const Icon = DEPT_DASH_ICON[code] || Zap;
              const label = DEPT_SHORT_LABEL[code] || code;
              const deptCount = (mockChantiers[code] || []).length;
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
            {/* Filtres par phase */}
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-2.5 pt-1">Phases</span>
            {phaseFilters.map(item => {
              const isPhaseActive = filterPhase === item.key;
              const phaseColor = item.key !== "all" ? PHASE_COLORS[item.key as PhaseKey] : null;
              return (
                <button key={item.key} onClick={() => setFilterPhase(item.key)}
                  className={cn(SF.btnBase, isPhaseActive ? SF.btnActive : SF.btnInactive)}>
                  {phaseColor && <span className={cn("w-2 h-2 rounded-full shrink-0", phaseColor.dot)} />}
                  {!phaseColor && <item.icon className={isPhaseActive ? SF.iconActive : SF.iconInactive} />}
                  <span className={isPhaseActive ? SF.labelActive : SF.labelInactive}>{item.label}</span>
                  <span className={SF.count}>{item.count}</span>
                </button>
              );
            })}
            <div className={SF.separator} />
            {/* Sous-sections par type */}
            {subSections.map(item => (
              <button key={item.id} onClick={() => {}} className={cn(SF.btnBase, SF.btnInactive)}>
                <item.icon className={SF.iconInactive} />
                <span className={SF.labelInactive}>{item.label}</span>
                <span className={SF.count}>{item.count}</span>
              </button>
            ))}
          </>);

          return isMobile ? (
            <MobileSidebarSheet currentLabel={currentLabel} itemCount={totalSidebarItems}>
              {sidebarContent}
            </MobileSidebarSheet>
          ) : (
            <div className={SF.sidebarW}>
              {sidebarContent}
            </div>
          );
        })()}

        {/* Content — Pattern SectionView (grid-cols-2 OU fiche detail) */}
        <div className={SF.content}>
          {/* LEVEL: chantiers — Toolbar + grid-cols-2 cards */}
          {level === "chantiers" && (
            <>
              {/* Toolbar — SF.toolbarWrap = UNE SEULE LIGNE */}
              <div className={SF.toolbarWrap}>
                <div className={SF.searchWrap}>
                  <Search className={SF.searchIcon} />
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher un chantier..." className={SF.searchInput} />
                </div>
                <select value={filterPhase} onChange={e => setFilterPhase(e.target.value)} className={SF.select}>
                  <option value="all">Toutes les phases</option>
                  <option value="discussion">Discussion</option>
                  <option value="reflexion">Réflexion</option>
                  <option value="creation">Conception</option>
                  <option value="execution">Exécution</option>
                  <option value="retroaction">Rétroaction</option>
                </select>
                <select value={sortKey} onChange={e => setSortKey(e.target.value as ChantierSortKey)} className={SF.select}>
                  <option value="phase">Phase</option>
                  <option value="progression">Progression</option>
                  <option value="recent">Récent</option>
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
                <span className={SF.itemCount}>{filtered.length} chantier{filtered.length > 1 ? "s" : ""}</span>
              </div>

              {/* Section header + contenu selon viewMode */}
              <CockpitSectionHeader icon={Flame} title="Chantiers" count={filtered.length} color="text-orange-500" />
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">Aucun chantier trouvé</div>
              ) : subViewMode === "list" ? (
                <SubElementsList items={filtered.map(ch => ({
                  typeLabel: "Chantier", typeIcon: Flame, title: ch.titre, phase: ch.phase, progression: ch.progression, echeance: ch.echeance, assignee: BOT_DISPLAY[ch.botPrimaire]?.name,
                  onClick: () => { setSelectedChantier(ch.id); setLevel("projets"); },
                }))} onAction={onAction} />
              ) : subViewMode === "table" ? (
                <SubElementsTable items={filtered.map(ch => ({
                  typeLabel: "Chantier", title: ch.titre, phase: ch.phase, progression: ch.progression, echeance: ch.echeance, assignee: BOT_DISPLAY[ch.botPrimaire]?.name,
                  onClick: () => { setSelectedChantier(ch.id); setLevel("projets"); },
                }))} onAction={onAction} />
              ) : (
                <div className={SF.gridContent}>
                  {filtered.map(ch => (
                    <ChantierCard key={ch.id} typeLabel="Chantier" typeIcon={Flame} title={ch.titre} description={ch.description} phase={ch.phase} progression={ch.progression} subCount={ch.projets.length} subLabel="projets" echeance={ch.echeance} assignee={BOT_DISPLAY[ch.botPrimaire]?.name} onAction={onAction} onClick={() => { setSelectedChantier(ch.id); setLevel("projets"); }} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* LEVEL: projets — Fiche detail chantier + sous-éléments projets en grid-cols-2 */}
          {level === "projets" && selCh && (
            <ChantierEntityDetail type="chantier" title={selCh.titre} description={selCh.description} phase={selCh.phase} progression={selCh.progression} echeance={selCh.echeance} dateDebut={selCh.dateDebut} dateMaj={selCh.dateMaj} botPrimaire={selCh.botPrimaire} botCodes={selCh.botCodes} objectifs={selCh.objectifs} budget={selCh.budget} risques={selCh.risques} documents={selCh.documents} jalons={selCh.jalons} sante={selCh.sante} raci={selCh.raci} decisions={selCh.decisions} conferences={selCh.conferences} activites={selCh.activites} retrospective={selCh.retrospective} onBack={resetNav} onAction={onAction} backLabel="Retour aux chantiers" subTitle="projets" subCount={selCh.projets.length}
              subItems={selCh.projets.map(pr => ({ id: pr.id, titre: pr.titre, phase: pr.phase, progression: pr.progression, echeance: pr.echeance, subCount: pr.missions.length, subLabel: "missions" }))}
              onSubItemClick={(id) => { setSelectedProjet(id); setLevel("missions"); }} />
          )}

          {/* LEVEL: missions — Fiche detail projet + sous-éléments missions en grid-cols-2 */}
          {level === "missions" && selPr && (
            <ChantierEntityDetail type="projet" title={selPr.titre} description={selPr.description} phase={selPr.phase} progression={selPr.progression} echeance={selPr.echeance} botPrimaire={selPr.botPrimaire} objectifs={selPr.objectifs} budget={selPr.budget} livrables={selPr.livrables} documents={selPr.documents} jalons={selPr.jalons} sante={selPr.sante} raci={selPr.raci} dependances={selPr.dependances} decisions={selPr.decisions} conferences={selPr.conferences} onBack={() => { setSelectedProjet(null); setSelectedMission(null); setDetailTache(null); setLevel("projets"); }} onAction={onAction} backLabel={`Retour — ${selCh?.titre || "Chantier"}`} subTitle="missions" subCount={selPr.missions.length}
              subItems={selPr.missions.map(mi => ({ id: mi.id, titre: mi.titre, phase: mi.phase, progression: mi.progression, echeance: mi.echeance, subCount: mi.taches.length, subLabel: "tâches" }))}
              onSubItemClick={(id) => { setSelectedMission(id); setLevel("taches"); }} />
          )}

          {/* LEVEL: taches — Fiche detail mission + sous-éléments tâches en grid-cols-2 */}
          {level === "taches" && selMi && (
            <ChantierEntityDetail type="mission" title={selMi.titre} description={selMi.description} phase={selMi.phase} progression={selMi.progression} botPrimaire={selMi.botPrimaire} objectifs={selMi.objectifs} equipe={selMi.equipe} livrables={selMi.livrables} documents={selMi.documents} jalons={selMi.jalons} criteresAcceptation={selMi.criteresAcceptation} dependances={selMi.dependances} conferences={selMi.conferences} onBack={() => { setSelectedMission(null); setDetailTache(null); setLevel("missions"); }} onAction={onAction} backLabel={`Retour — ${selPr?.titre || "Projet"}`} subTitle="tâches" subCount={selMi.taches.length}
              subItems={selMi.taches.map(ta => ({ id: ta.id, titre: ta.titre, phase: ta.phase, progression: ta.progression, echeance: ta.echeance, assignee: ta.assignee }))}
              onSubItemClick={(id) => { setDetailTache(id); setLevel("tache-detail"); }} />
          )}

          {/* LEVEL: tache-detail — Fiche detail tâche avec contenu actionnable */}
          {level === "tache-detail" && selTa && (
            <ChantierEntityDetail type="tache" title={selTa.titre} description={selTa.description} phase={selTa.phase} progression={selTa.progression} echeance={selTa.echeance} documents={selTa.documents} jalons={selTa.jalons} instructions={selTa.instructions} validateur={selTa.validateur} criteresAcceptation={selTa.criteresAcceptation} dependances={selTa.dependances} conferences={selTa.conferences} tempsEstime={selTa.tempsEstime} tempsReel={selTa.tempsReel} onBack={() => { setDetailTache(null); setLevel("taches"); }} onAction={onAction} backLabel={`Retour — ${selMi?.titre || "Mission"}`} extraContent={
              <div className="space-y-3">
                {/* Contenu contextuel selon la phase */}
                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                    <FileText className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                    <span className="text-sm font-bold text-gray-900">Contenu de la tâche</span>
                  </div>
                  <div className="px-4 py-3 space-y-3">
                    {selTa.description && <p className="text-xs text-gray-700 leading-relaxed">{selTa.description}</p>}
                    {selTa.assignee && <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"><Users className="h-3.5 w-3.5 text-gray-400" /><span className="text-xs text-gray-600">Assigné à <span className="font-bold">{selTa.assignee}</span></span></div>}
                    {selTa.echeance && <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"><Clock className="h-3.5 w-3.5 text-gray-400" /><span className="text-xs text-gray-600">Échéance: <span className="font-bold">{selTa.echeance}</span></span></div>}
                  </div>
                </div>
                {/* Actions possibles selon la phase */}
                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                    <Rocket className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                    <span className="text-sm font-bold text-gray-900">Actions disponibles</span>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    {selTa.phase === "discussion" && (
                      <>
                        <button className="w-full text-left flex items-center gap-2.5 bg-sky-50 rounded-lg px-3 py-2.5 hover:bg-sky-100 transition-colors cursor-pointer"><MessageCircle className="h-3.5 w-3.5 text-sky-600 shrink-0" /><div><span className="text-xs font-bold text-sky-800 block">Discuter de cette tâche</span><span className="text-[9px] text-sky-600">Ouvrir une discussion avec l'équipe assignée</span></div></button>
                        <button className="w-full text-left flex items-center gap-2.5 bg-orange-50 rounded-lg px-3 py-2.5 hover:bg-orange-100 transition-colors cursor-pointer"><Brain className="h-3.5 w-3.5 text-orange-600 shrink-0" /><div><span className="text-xs font-bold text-orange-800 block">Lancer une réflexion</span><span className="text-[9px] text-orange-600">Analyser les enjeux avant de commencer</span></div></button>
                      </>
                    )}
                    {selTa.phase === "reflexion" && (
                      <>
                        <button className="w-full text-left flex items-center gap-2.5 bg-orange-50 rounded-lg px-3 py-2.5 hover:bg-orange-100 transition-colors cursor-pointer"><Brain className="h-3.5 w-3.5 text-orange-600 shrink-0" /><div><span className="text-xs font-bold text-orange-800 block">Cristalliser la réflexion</span><span className="text-[9px] text-orange-600">Ouvrir DocForge pour documenter les conclusions</span></div></button>
                        <button className="w-full text-left flex items-center gap-2.5 bg-yellow-50 rounded-lg px-3 py-2.5 hover:bg-yellow-100 transition-colors cursor-pointer"><Hammer className="h-3.5 w-3.5 text-yellow-600 shrink-0" /><div><span className="text-xs font-bold text-yellow-800 block">Passer en conception</span><span className="text-[9px] text-yellow-600">Structurer le plan d'exécution</span></div></button>
                      </>
                    )}
                    {selTa.phase === "creation" && (
                      <>
                        <button className="w-full text-left flex items-center gap-2.5 bg-yellow-50 rounded-lg px-3 py-2.5 hover:bg-yellow-100 transition-colors cursor-pointer"><Hammer className="h-3.5 w-3.5 text-yellow-600 shrink-0" /><div><span className="text-xs font-bold text-yellow-800 block">Compléter le document</span><span className="text-[9px] text-yellow-600">Finaliser la conception en mode DocForge</span></div></button>
                        <button className="w-full text-left flex items-center gap-2.5 bg-green-50 rounded-lg px-3 py-2.5 hover:bg-green-100 transition-colors cursor-pointer"><Rocket className="h-3.5 w-3.5 text-green-600 shrink-0" /><div><span className="text-xs font-bold text-green-800 block">Lancer l'exécution</span><span className="text-[9px] text-green-600">Démarrer l'implémentation</span></div></button>
                      </>
                    )}
                    {selTa.phase === "execution" && (
                      <>
                        <button className="w-full text-left flex items-center gap-2.5 bg-green-50 rounded-lg px-3 py-2.5 hover:bg-green-100 transition-colors cursor-pointer"><CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" /><div><span className="text-xs font-bold text-green-800 block">Marquer comme complété</span><span className="text-[9px] text-green-600">Confirmer que la tâche est terminée</span></div></button>
                        <button className="w-full text-left flex items-center gap-2.5 bg-emerald-50 rounded-lg px-3 py-2.5 hover:bg-emerald-100 transition-colors cursor-pointer"><BarChart3 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /><div><span className="text-xs font-bold text-emerald-800 block">Passer en rétroaction</span><span className="text-[9px] text-emerald-600">Évaluer les résultats et documenter les apprentissages</span></div></button>
                      </>
                    )}
                    {selTa.phase === "retroaction" && (
                      <>
                        <button className="w-full text-left flex items-center gap-2.5 bg-emerald-50 rounded-lg px-3 py-2.5 hover:bg-emerald-100 transition-colors cursor-pointer"><BarChart3 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /><div><span className="text-xs font-bold text-emerald-800 block">Voir le bilan</span><span className="text-[9px] text-emerald-600">Consulter les métriques et le résumé d'exécution</span></div></button>
                        <button className="w-full text-left flex items-center gap-2.5 bg-sky-50 rounded-lg px-3 py-2.5 hover:bg-sky-100 transition-colors cursor-pointer"><MessageCircle className="h-3.5 w-3.5 text-sky-600 shrink-0" /><div><span className="text-xs font-bold text-sky-800 block">Discuter des résultats</span><span className="text-[9px] text-sky-600">Partager les apprentissages avec l'équipe</span></div></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            } />
          )}
        </div>
      </div>
    </div>
  );
}

