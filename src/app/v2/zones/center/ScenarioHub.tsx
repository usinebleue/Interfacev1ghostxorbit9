/**
 * ScenarioHub.tsx — Galerie des 9 scenarios de simulation
 * Chaque carte lance une simulation d'un mode de reflexion GHML
 * Sprint A — Frame Master V2
 */

"use client";

import { useState } from "react";
import {
  GitBranch,
  FileText,
  Swords,
  Zap,
  Lightbulb,
  Eye,
  Target,
  Sparkles,
  Brain,
  ArrowLeft,
  Play,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { BranchPatternsDemo } from "./BranchPatternsDemo";
import { CahierSmartDemo } from "./CahierSmartDemo";
import { DebatDemo } from "./scenarios/DebatDemo";
import { CriseDemo } from "./scenarios/CriseDemo";
import { BrainstormDemo } from "./scenarios/BrainstormDemo";
import { AnalyseDemo } from "./scenarios/AnalyseDemo";
import { StrategieDemo } from "./scenarios/StrategieDemo";
import { InnovationDemo } from "./scenarios/InnovationDemo";
import { DeepResonanceDemo } from "./scenarios/DeepResonanceDemo";

type ScenarioView = "hub" | "credo" | "cahier" | "debat" | "crise" | "brainstorm" | "analyse" | "strategie" | "innovation" | "deep";

interface ScenarioCard {
  id: ScenarioView;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  status: "ready" | "coming";
  description: string;
}

const SCENARIOS: ScenarioCard[] = [
  {
    id: "credo",
    title: "CREDO Complet",
    subtitle: "Developpement d'idee + Thread Parking",
    icon: GitBranch,
    color: "bg-blue-600",
    bgGradient: "from-blue-50 to-blue-100/50",
    borderColor: "border-blue-300",
    textColor: "text-blue-700",
    status: "ready",
    description: "Simulation complete du cycle CREDO : tension, multi-perspectives, challenge, suspension intelligente, synthese et cristallisation.",
  },
  {
    id: "cahier",
    title: "Cahier SMART",
    subtitle: "Tension \u2192 Diagnostic \u2192 Cahier PDF",
    icon: FileText,
    color: "bg-emerald-600",
    bgGradient: "from-emerald-50 to-emerald-100/50",
    borderColor: "border-emerald-300",
    textColor: "text-emerald-700",
    status: "ready",
    description: "3 actes : diagnostic multi-bot, jumelage SMART avec scoring, et generation d'un cahier de projet 34 pages.",
  },
  {
    id: "debat",
    title: "Mode D\u00e9bat",
    subtitle: "ERP 200K$ : pour ou contre?",
    icon: Swords,
    color: "bg-red-600",
    bgGradient: "from-red-50 to-red-100/50",
    borderColor: "border-red-300",
    textColor: "text-red-700",
    status: "ready",
    description: "CFO vs CRO en split-screen. Arguments structures, 3 rounds, puis verdict du CEO. Stress-test d'une decision strategique.",
  },
  {
    id: "crise",
    title: "Mode Crise",
    subtitle: "Client 35% CA menace de partir",
    icon: Zap,
    color: "bg-orange-600",
    bgGradient: "from-orange-50 to-orange-100/50",
    borderColor: "border-orange-300",
    textColor: "text-orange-700",
    status: "ready",
    description: "Timer 48h, boucle OODA rapide, decisions binaires sous pression. Mode urgence active.",
  },
  {
    id: "brainstorm",
    title: "Mode Brainstorm",
    subtitle: "Doubler les clients sans embaucher",
    icon: Lightbulb,
    color: "bg-amber-600",
    bgGradient: "from-amber-50 to-amber-100/50",
    borderColor: "border-amber-300",
    textColor: "text-amber-700",
    status: "ready",
    description: "Board de post-its, 4 bots contribuent simultanement, methode SCAMPER, zero jugement, clustering d'idees.",
  },
  {
    id: "analyse",
    title: "Mode Analyse",
    subtitle: "5 Pourquoi + Ishikawa",
    icon: Eye,
    color: "bg-cyan-600",
    bgGradient: "from-cyan-50 to-cyan-100/50",
    borderColor: "border-cyan-300",
    textColor: "text-cyan-700",
    status: "ready",
    description: "Decomposition systematique d'un probleme avec la technique des 5 Pourquoi et le diagramme d'Ishikawa.",
  },
  {
    id: "strategie",
    title: "Mode Strat\u00e9gie",
    subtitle: "SWOT + Roadmap 3 phases",
    icon: Target,
    color: "bg-purple-600",
    bgGradient: "from-purple-50 to-purple-100/50",
    borderColor: "border-purple-300",
    textColor: "text-purple-700",
    status: "ready",
    description: "Analyse SWOT 4 quadrants, 3 scenarios timeline (0-30j, 30-90j, 90j+), matrice de risques.",
  },
  {
    id: "innovation",
    title: "Mode Innovation",
    subtitle: "Analogie + Inversion + Biomim\u00e9tisme",
    icon: Sparkles,
    color: "bg-pink-600",
    bgGradient: "from-pink-50 to-pink-100/50",
    borderColor: "border-pink-300",
    textColor: "text-pink-700",
    status: "ready",
    description: "Cross-pollination d'idees avec 3 techniques creatives. Catalyse de combinaisons nouvelles.",
  },
  {
    id: "deep",
    title: "Deep Resonance",
    subtitle: "Spirale socratique 1-on-1",
    icon: Brain,
    color: "bg-indigo-600",
    bgGradient: "from-indigo-50 to-indigo-100/50",
    borderColor: "border-indigo-300",
    textColor: "text-indigo-700",
    status: "ready",
    description: "Dialogue profond 1-on-1 avec le CEO. Questions reflexives, modeles mentaux, exploration de paradoxes.",
  },
];

export function ScenarioHub() {
  const [view, setView] = useState<ScenarioView>("hub");

  if (view === "credo") return <WithBackButton onBack={() => setView("hub")}><BranchPatternsDemo /></WithBackButton>;
  if (view === "cahier") return <WithBackButton onBack={() => setView("hub")}><CahierSmartDemo /></WithBackButton>;
  if (view === "debat") return <WithBackButton onBack={() => setView("hub")}><DebatDemo /></WithBackButton>;
  if (view === "crise") return <WithBackButton onBack={() => setView("hub")}><CriseDemo /></WithBackButton>;
  if (view === "brainstorm") return <WithBackButton onBack={() => setView("hub")}><BrainstormDemo /></WithBackButton>;
  if (view === "analyse") return <WithBackButton onBack={() => setView("hub")}><AnalyseDemo /></WithBackButton>;
  if (view === "strategie") return <WithBackButton onBack={() => setView("hub")}><StrategieDemo /></WithBackButton>;
  if (view === "innovation") return <WithBackButton onBack={() => setView("hub")}><InnovationDemo /></WithBackButton>;
  if (view === "deep") return <WithBackButton onBack={() => setView("hub")}><DeepResonanceDemo /></WithBackButton>;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b px-6 py-4 shrink-0">
        <h1 className="text-lg font-bold text-gray-900">Scenarios de simulation</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          9 modes de reflexion GhostX — chaque scenario simule un type de discussion avec la Bot Team
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4">
          {SCENARIOS.map(s => {
            const Icon = s.icon;
            const isReady = s.status === "ready";
            return (
              <button
                key={s.id}
                onClick={() => isReady && setView(s.id)}
                disabled={!isReady}
                className={cn(
                  "text-left rounded-2xl border-2 overflow-hidden transition-all group",
                  isReady
                    ? cn("hover:shadow-lg hover:scale-[1.02] cursor-pointer", s.borderColor)
                    : "border-gray-200 opacity-60 cursor-not-allowed",
                )}
              >
                {/* Color band */}
                <div className={cn("h-2", isReady ? s.color : "bg-gray-300")} />

                <div className={cn("p-5 bg-gradient-to-b", isReady ? s.bgGradient : "from-gray-50 to-gray-100/50")}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      isReady ? cn(s.color, "text-white") : "bg-gray-300 text-gray-500",
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={cn("text-sm font-bold", isReady ? s.textColor : "text-gray-500")}>{s.title}</h3>
                        {!isReady && <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">Bientot</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{s.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{s.description}</p>

                  {isReady && (
                    <div className={cn(
                      "mt-3 flex items-center gap-1.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity",
                      s.textColor,
                    )}>
                      <Play className="h-3.5 w-3.5" /> Lancer la simulation
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WithBackButton({ onBack, children }: { onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 bg-white border-b px-3 py-1.5 flex items-center">
        <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour aux scenarios
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
