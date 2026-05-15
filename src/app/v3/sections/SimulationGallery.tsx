/**
 * SimulationGallery.tsx — Galerie fusionnee de toutes les simulations
 *
 * Regroupe en UNE page:
 * - Phases (Focus views: Reflexion, Conception, Execution, Retroaction)
 * - Livrables Conception (Document, Tableur, Presentation, Code, Jumelage)
 * - Scenarios (ScenarioHub existant)
 * - Ateliers (AtelierHub existant)
 * - Composants (SimulationLibrary existant)
 */

import { useState, lazy, Suspense } from "react";
import {
  ArrowLeft,
  Brain,
  Hammer,
  Rocket,
  RotateCcw,
  FileText,
  Table2,
  Presentation,
  Code2,
  Users,
  Play,
  Map as MapIcon,
  Library,
  Layers,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { useDemo } from "../DemoContext";
import { useAmorcer, AmorcerCtx } from "../AmorcerContext";

// SimAmorcer — vrais composants workspace animes (pilotes par stage)
import {
  PhaseReflexion,
  PhaseConception,
  PhaseExecution,
  PhaseConceptionDocument,
  PhaseConceptionTableur,
  PhaseConceptionPresentation,
  PhaseConceptionCode,
  PhaseConceptionJumelage,
} from "../simulation/sim-content-map";

// FocusRetroactionView — pas de SimAmorcer equivalent, on garde le Focus view
import { FocusRetroactionView } from "../simulation/FocusRetroactionView";

// Lazy imports for existing hubs
const LazyScenarioHub = lazy(() => import("../../v2/zones/center/ScenarioHub").then(m => ({ default: m.ScenarioHub })));
const LazyAtelierHub = lazy(() => import("../../v2/zones/center/atelier/AtelierHub").then(m => ({ default: m.AtelierHub })));
const LazySimulationLibrary = lazy(() => import("./SimulationLibrary").then(m => ({ default: m.SimulationLibrary })));

// ═══ Types ═══

type TabKey = "phases" | "livrables" | "scenarios" | "ateliers" | "composants";

interface CardDef {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly icon: React.ElementType;
  readonly color: string;
}

// ═══ Constantes ═══

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "phases",     label: "Phases",               icon: Layers },
  { key: "livrables",  label: "Livrables",            icon: FileText },
  { key: "scenarios",  label: "Scénarios",            icon: Play },
  { key: "ateliers",   label: "Ateliers",             icon: MapIcon },
  { key: "composants", label: "Composants",           icon: Library },
];

const PHASE_CARDS: CardDef[] = [
  { id: "reflexion",   title: "Phase Réflexion",    subtitle: "Diagnostic, Exploration, Analyse, Pré-rapport",  icon: Brain,     color: "orange" },
  { id: "conception",  title: "Phase Conception",   subtitle: "Structure, Objectifs, Plan, Livrables",          icon: Hammer,    color: "amber" },
  { id: "execution",   title: "Phase Exécution",    subtitle: "Briefing, Suivi, Livrables, Bilan",              icon: Rocket,    color: "green" },
  { id: "retroaction", title: "Phase Rétroaction",   subtitle: "Revue, Apprentissages, Ajustements, Clôture",   icon: RotateCcw, color: "purple" },
];

const LIVRABLE_CARDS: CardDef[] = [
  { id: "document",     title: "Document / Cahier",  subtitle: "Conception d'un document structuré",     icon: FileText,     color: "blue" },
  { id: "tableur",      title: "Tableur",            subtitle: "Conception d'un tableur analytique",      icon: Table2,       color: "emerald" },
  { id: "presentation", title: "Présentation",       subtitle: "Conception d'une présentation visuelle",  icon: Presentation, color: "violet" },
  { id: "code",         title: "Code (Tim)",          subtitle: "Conception d'un projet technique",       icon: Code2,        color: "cyan" },
  { id: "jumelage",     title: "Jumelage",           subtitle: "Conception d'un jumelage collaboratif",    icon: Users,        color: "rose" },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; iconBg: string; hover: string }> = {
  orange:  { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  iconBg: "bg-orange-100",  hover: "hover:border-orange-300 hover:shadow-orange-100" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   iconBg: "bg-amber-100",   hover: "hover:border-amber-300 hover:shadow-amber-100" },
  green:   { bg: "bg-green-50",   border: "border-green-200",   text: "text-green-700",   iconBg: "bg-green-100",   hover: "hover:border-green-300 hover:shadow-green-100" },
  purple:  { bg: "bg-purple-50",  border: "border-purple-200",  text: "text-purple-700",  iconBg: "bg-purple-100",  hover: "hover:border-purple-300 hover:shadow-purple-100" },
  blue:    { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    iconBg: "bg-blue-100",    hover: "hover:border-blue-300 hover:shadow-blue-100" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", iconBg: "bg-emerald-100", hover: "hover:border-emerald-300 hover:shadow-emerald-100" },
  violet:  { bg: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700",  iconBg: "bg-violet-100",  hover: "hover:border-violet-300 hover:shadow-violet-100" },
  cyan:    { bg: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700",    iconBg: "bg-cyan-100",    hover: "hover:border-cyan-300 hover:shadow-cyan-100" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    iconBg: "bg-rose-100",    hover: "hover:border-rose-300 hover:shadow-rose-100" },
};

// ═══ Composant principal ═══

export function SimulationGallery() {
  const [activeTab, setActiveTab] = useState<TabKey>("phases");
  const { demoSimId, setDemoSimId } = useDemo();

  // Si une simulation est active, la rendre en plein workspace
  // (DemoChatPlayer s'affiche cote Discussion via DemoContext)
  if (demoSimId) {
    return <SimulationRenderer id={demoSimId} onBack={() => setDemoSimId(null)} />;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-gray-800">Toutes les Simulations</h2>
        <p className="text-xs text-gray-500 mt-0.5">Explorez les démos de phases, livrables, scénarios et ateliers</p>
      </div>

      {/* Tabs — grille 5 colonnes, pas de scroll horizontal */}
      <div className="px-4 pb-2 grid grid-cols-5 gap-1 border-b border-gray-100">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-t-md text-xs font-medium transition-all cursor-pointer",
                isActive
                  ? "bg-[#073E5A] text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === "phases" && (
          <CardGrid cards={PHASE_CARDS} onSelect={id => setDemoSimId(`phase:${id}`)} />
        )}
        {activeTab === "livrables" && (
          <CardGrid cards={LIVRABLE_CARDS} onSelect={id => setDemoSimId(`livrable:${id}`)} />
        )}
        {activeTab === "scenarios" && (
          <Suspense fallback={<LoadingFallback />}>
            <LazyScenarioHub />
          </Suspense>
        )}
        {activeTab === "ateliers" && (
          <Suspense fallback={<LoadingFallback />}>
            <LazyAtelierHub />
          </Suspense>
        )}
        {activeTab === "composants" && (
          <Suspense fallback={<LoadingFallback />}>
            <LazySimulationLibrary />
          </Suspense>
        )}
      </div>
    </div>
  );
}

// ═══ Sous-composants ═══

function CardGrid({ cards, onSelect }: { cards: CardDef[]; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(card => {
        const Icon = card.icon;
        const colors = COLOR_MAP[card.color] || COLOR_MAP.blue;
        return (
          <button
            key={card.id}
            onClick={() => onSelect(card.id)}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer",
              colors.bg, colors.border, colors.hover,
              "hover:shadow-md"
            )}
          >
            <div className={cn("p-2 rounded-md shrink-0", colors.iconBg)}>
              <Icon className={cn("h-5 w-5", colors.text)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn("text-sm font-semibold", colors.text)}>{card.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{card.subtitle}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400 animate-pulse text-sm">Chargement...</div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all cursor-pointer mb-3"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Retour à la galerie
    </button>
  );
}

function SimulationRenderer({ id, onBack }: { id: string; onBack: () => void }) {
  const { demoStage } = useDemo();
  const parentCtx = useAmorcer();

  // Wrapper commun — BackButton + scroll
  const Wrap = ({ children }: { children: React.ReactNode }) => (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-3"><BackButton onClick={onBack} /></div>
      {children}
    </div>
  );

  // ── Phases — vrais composants SimAmorcer pilotes par demoStage ──

  if (id === "phase:reflexion") {
    return (
      <Wrap>
        <PhaseReflexion stage={demoStage} context="Analyse strategique" />
      </Wrap>
    );
  }

  if (id === "phase:conception") {
    return (
      <Wrap>
        <PhaseConception stage={demoStage} context="Plan strategique" />
      </Wrap>
    );
  }

  if (id === "phase:execution") {
    return (
      <Wrap>
        <PhaseExecution stage={demoStage} />
      </Wrap>
    );
  }

  // Retroaction — pas de SimAmorcer equivalent, on garde le Focus view avec chatStage override
  if (id === "phase:retroaction") {
    const focusCtxValue = { ...parentCtx, chatStage: demoStage * 3 };
    return (
      <AmorcerCtx.Provider value={focusCtxValue}>
        <div className="h-full overflow-y-auto">
          <FocusRetroactionView context={null} onBack={onBack} onAdvancePhase={() => {}} />
        </div>
      </AmorcerCtx.Provider>
    );
  }

  // ── Livrables Conception — composants SimAmorcer avec stage ──

  const livrableMap: Record<string, React.ReactNode> = {
    "livrable:document":     <PhaseConceptionDocument stage={demoStage} />,
    "livrable:tableur":      <PhaseConceptionTableur stage={demoStage} />,
    "livrable:presentation": <PhaseConceptionPresentation stage={demoStage} />,
    "livrable:code":         <PhaseConceptionCode stage={demoStage} />,
    "livrable:jumelage":     <PhaseConceptionJumelage stage={demoStage} />,
  };

  const content = livrableMap[id];
  if (content) {
    return <Wrap>{content}</Wrap>;
  }

  // Fallback
  return (
    <div className="p-4">
      <BackButton onClick={onBack} />
      <div className="text-xs text-gray-500">Simulation non trouvee: {id}</div>
    </div>
  );
}
