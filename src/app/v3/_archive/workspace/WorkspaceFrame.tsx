/**
 * WorkspaceFrame.tsx — Composant universel du Workspace Dynamique V3
 *
 * Pattern DocForge: sidebar TOC w-[180px] + contenu dynamique + footer actions.
 * Lit le registre de phases → rend les sections dynamiquement.
 *
 * RÈGLE: design-system.md SF constants pour la sidebar.
 * RÈGLE: sections vides à remplir manuellement (Carl Q5 = vide).
 */

import { useState, useMemo } from "react";
import {
  FileText, Stethoscope, AlertTriangle, Lightbulb, CheckCircle,
  Brain, LayoutDashboard, Sparkles, HelpCircle, Search, Swords,
  ClipboardList, ListChecks, Building2, Target, Grid2x2, DollarSign,
  ShieldCheck, Download, Gauge, KanbanSquare, UserCheck, Bot,
  AlertOctagon, TrendingUp, Package, BarChart3, GraduationCap,
  Users, RefreshCw, Archive, Settings, Calendar, Bell,
  MessageCircle, Hammer, Rocket, ChevronRight, ChevronLeft,
  Circle, CheckCircle2,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { PHASE_CONFIG } from "../core/phases";
import type { PhaseKey } from "../core/types";
import { WORKSPACE_PHASES, getNextSection, getPrevSection } from "./phase-registry";
import type { WorkspacePhaseKey, WorkspaceTocSection, SectionStatus } from "./types";

// ═══ Renderers ═══
import { WorkspaceEditor } from "./renderers/WorkspaceEditor";
import { WorkspaceChecklist } from "./renderers/WorkspaceChecklist";
import { WorkspaceDashboard } from "./renderers/WorkspaceDashboard";
import { WorkspaceMultiBot } from "./renderers/WorkspaceMultiBot";
import { WorkspaceHierarchie } from "./renderers/WorkspaceHierarchie";

// ═══ Map icônes string → composant ═══
const ICON_MAP: Record<string, React.ElementType> = {
  FileText, Stethoscope, AlertTriangle, Lightbulb, CheckCircle,
  Brain, LayoutDashboard, Sparkles, HelpCircle, Search, Swords,
  ClipboardList, ListChecks, Building2, Target, Grid2x2, DollarSign,
  ShieldCheck, Download, Gauge, KanbanSquare, UserCheck, Bot,
  AlertOctagon, TrendingUp, Package, BarChart3, GraduationCap,
  Users, RefreshCw, Archive, Settings, Calendar, Bell,
  MessageCircle, Hammer, Rocket,
};

function resolveIcon(name: string): React.ElementType {
  return ICON_MAP[name] || Circle;
}

// ═══ Renderer switcher ═══
function renderSection(
  section: WorkspaceTocSection,
  phaseKey: WorkspacePhaseKey,
  botCode: string,
  contextId?: number,
) {
  const props = { sectionConfig: section, phaseKey, botCode, contextId };

  switch (section.renderer) {
    case "editor":
      return <WorkspaceEditor {...props} />;
    case "checklist":
      return <WorkspaceChecklist {...props} />;
    case "dashboard":
      return <WorkspaceDashboard {...props} />;
    case "multi-bot":
      return <WorkspaceMultiBot {...props} />;
    case "hierarchie":
      return <WorkspaceHierarchie {...props} />;
    // V1 simple: les renderers avancés tombent sur editor par défaut
    case "matrix":
    case "document":
    case "form":
    case "timeline":
    case "kanban":
      return <WorkspaceEditor {...props} />;
    default:
      return <WorkspaceEditor {...props} />;
  }
}

// ═══ COMPOSANT PRINCIPAL ═══

interface WorkspaceFrameProps {
  phase: WorkspacePhaseKey;
  botCode: string;
  contextId?: number;
  contextType?: "chantier" | "projet" | "mission" | "tache";
  onPhaseComplete?: (nextPhase: WorkspacePhaseKey) => void;
}

export function WorkspaceFrame({
  phase,
  botCode,
  contextId,
  onPhaseComplete,
}: WorkspaceFrameProps) {
  const phaseConfig = WORKSPACE_PHASES[phase];
  const [activeSectionId, setActiveSectionId] = useState(phaseConfig.sections[0]?.id || "");
  const [sectionStatuses, setSectionStatuses] = useState<Record<string, SectionStatus>>({});

  // Couleurs depuis PHASE_CONFIG existant
  const colorKey = phaseConfig.colorKey as PhaseKey;
  const pc = PHASE_CONFIG[colorKey] || PHASE_CONFIG.observation;

  const activeSection = useMemo(
    () => phaseConfig.sections.find((s) => s.id === activeSectionId) || phaseConfig.sections[0],
    [phaseConfig.sections, activeSectionId]
  );

  const completedCount = useMemo(
    () => phaseConfig.sections.filter((s) => sectionStatuses[s.id] === "completed").length,
    [phaseConfig.sections, sectionStatuses]
  );

  const totalSections = phaseConfig.sections.length;
  const progressPct = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;

  // Navigation
  const nextSectionId = getNextSection(phase, activeSectionId);
  const prevSectionId = getPrevSection(phase, activeSectionId);

  function handleNext() {
    if (nextSectionId) {
      setActiveSectionId(nextSectionId);
    } else if (phaseConfig.nextPhase && onPhaseComplete) {
      onPhaseComplete(phaseConfig.nextPhase);
    }
  }

  function handlePrev() {
    if (prevSectionId) {
      setActiveSectionId(prevSectionId);
    }
  }

  function toggleSectionStatus(sectionId: string) {
    setSectionStatuses((prev) => {
      const current = prev[sectionId] || "empty";
      const next: SectionStatus = current === "completed" ? "empty" : "completed";
      return { ...prev, [sectionId]: next };
    });
  }

  const PhaseIcon = resolveIcon(phaseConfig.icon);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ═══ HEADER PASTEL h-12 ═══ */}
      <div className={cn("h-12 px-3 shrink-0 flex items-center gap-2 border-b border-gray-200", pc.bg)}>
        <PhaseIcon className={cn("h-4 w-4 stroke-[2.5]", pc.text)} />
        <span className="text-sm font-bold text-gray-900">{phaseConfig.label}</span>
        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        <span className={cn("text-[11px] font-medium", pc.text)}>
          {activeSection?.label}
        </span>
        <div className="flex-1" />
        <span className="text-[10px] text-gray-500">
          {completedCount}/{totalSections} sections
        </span>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", pc.badge)}>
          {progressPct}%
        </span>
      </div>

      {/* ═══ CORPS: TOC + CONTENU ═══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar TOC w-[180px] — Pattern SF depuis styles.ts */}
        <div className="w-[180px] shrink-0 border-r border-gray-200 bg-white overflow-y-auto py-3 px-1.5">
          {/* Sections */}
          <div className="space-y-0.5">
            {phaseConfig.sections.map((section, idx) => {
              const isActive = section.id === activeSectionId;
              const status = sectionStatuses[section.id] || "empty";
              const SectionIcon = resolveIcon(section.icon);

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={cn(
                    "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer flex items-center gap-2",
                    isActive
                      ? "bg-blue-50 border border-blue-200 shadow-sm"
                      : "hover:bg-gray-50 border border-transparent"
                  )}
                >
                  {/* Status indicator */}
                  {status === "completed" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <SectionIcon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-blue-500" : "text-gray-400")} />
                  )}
                  <span className={cn(
                    "text-[10px] font-bold flex-1 leading-tight",
                    isActive ? "text-blue-700" : "text-gray-700"
                  )}>
                    {section.label}
                  </span>
                  {section.optional && (
                    <span className="text-[8px] text-gray-400">opt.</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Séparateur */}
          <div className="h-px bg-gray-100 mx-2 my-3" />

          {/* Livrables */}
          <div className="px-2.5">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              Livrables
            </span>
            <div className="mt-1.5 space-y-1">
              {phaseConfig.livrables.map((livrable) => (
                <div key={livrable} className="flex items-center gap-1.5">
                  <Circle className="h-2.5 w-2.5 text-gray-300" />
                  <span className="text-[9px] text-gray-500 capitalize">{livrable}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Barre de progression */}
          <div className="px-2.5 mt-4">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", pc.dot.replace("bg-", "bg-"))}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[9px] text-gray-400 mt-1 block">
              Progression: {progressPct}%
            </span>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-gray-50">
          <div className="max-w-3xl mx-auto px-6 py-4 pb-12">
            {/* Bouton marquer comme complété */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                {(() => {
                  const ActiveIcon = resolveIcon(activeSection?.icon || "Circle");
                  return <ActiveIcon className={cn("h-4 w-4", pc.text)} />;
                })()}
                {activeSection?.label}
              </h3>
              <button
                onClick={() => toggleSectionStatus(activeSectionId)}
                className={cn(
                  "text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer",
                  sectionStatuses[activeSectionId] === "completed"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {sectionStatuses[activeSectionId] === "completed" ? "Complété" : "Marquer complété"}
              </button>
            </div>

            {/* Renderer dynamique */}
            {activeSection && renderSection(activeSection, phase, botCode, contextId)}
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ACTIONS ═══ */}
      <div className="h-12 px-4 shrink-0 flex items-center justify-between border-t border-gray-200 bg-white">
        <button
          onClick={handlePrev}
          disabled={!prevSectionId}
          className={cn(
            "text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer",
            prevSectionId
              ? "text-gray-700 hover:bg-gray-100"
              : "text-gray-300 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Précédent
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">
            {phaseConfig.sections.findIndex((s) => s.id === activeSectionId) + 1} / {totalSections}
          </span>
        </div>

        <button
          onClick={handleNext}
          className={cn(
            "text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer",
            nextSectionId
              ? "text-gray-700 hover:bg-gray-100"
              : phaseConfig.nextPhase
                ? cn(pc.btnBg, pc.btnText, pc.btnBorder, "border")
                : "text-gray-300 cursor-not-allowed"
          )}
        >
          {nextSectionId ? "Suivant" : phaseConfig.nextPhase ? `→ ${phaseConfig.nextPhase === "operations" ? "Opérations" : WORKSPACE_PHASES[phaseConfig.nextPhase]?.label}` : "Fin"}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
