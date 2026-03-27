/**
 * AtelierUsineBleuFlow.tsx — Orchestrateur des 3 phases du pipeline Usine Bleue
 * Hub: 3 cartes de phase (Diagnostic, Jumelage, Cahier) avec indicateur de phase active
 * Click carte → rend le composant Atelier correspondant
 * Sprint B — Atelier Simulations — Flow Usine Bleue
 */

"use client";

import { useState } from "react";
import {
  Scan,
  Handshake,
  FileText,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Zap,
  Building2,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { AtelierDiagnostic } from "./AtelierDiagnostic";
import { AtelierJumelage } from "./AtelierJumelage";
import { AtelierCahierProjet } from "./AtelierCahierProjet";

type View = "hub" | "diagnostic" | "jumelage" | "cahier";

interface Phase {
  id: View;
  num: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  dotColor: string;
}

const PHASES: Phase[] = [
  {
    id: "diagnostic",
    num: 1,
    title: "Diagnostic Preliminaire",
    subtitle: "Acte 1 — La Tension de Depart",
    description: "CarlOS analyse la situation multi-axe, consulte ses specialistes (CFO, COO, CTO), et genere un pre-rapport de visite complet avec profil entreprise, axes d'intervention et recommandation.",
    icon: Scan,
    color: "text-red-600",
    bgGradient: "from-red-500 to-rose-600",
    borderColor: "border-red-300",
    textColor: "text-red-700",
    dotColor: "bg-red-500",
  },
  {
    id: "jumelage",
    num: 2,
    title: "Jumelage SMART",
    subtitle: "Acte 2 — Le Match Parfait",
    description: "Generation automatique des criteres de matching, scan du reseau 130+ membres, qualification sur 5 sessions, scoring comparatif sur 8 axes, et selection du meilleur integrateur.",
    icon: Handshake,
    color: "text-amber-600",
    bgGradient: "from-amber-500 to-orange-600",
    borderColor: "border-amber-300",
    textColor: "text-amber-700",
    dotColor: "bg-amber-500",
  },
  {
    id: "cahier",
    num: 3,
    title: "Cahier de Projet",
    subtitle: "Acte 3 — Le Livrable Final",
    description: "Construction automatique du cahier SMART en 7 sections : profil, diagnostic, solutions, budget/subventions, plan d'implantation, KPIs et validation avec signatures.",
    icon: FileText,
    color: "text-emerald-600",
    bgGradient: "from-emerald-500 to-green-600",
    borderColor: "border-emerald-300",
    textColor: "text-emerald-700",
    dotColor: "bg-emerald-500",
  },
];

export function AtelierUsineBleuFlow({ onBack }: { onBack: () => void }) {
  const [activeView, setActiveView] = useState<View>("hub");
  const [completedPhases, setCompletedPhases] = useState<Set<View>>(new Set());

  const handlePhaseBack = (phaseId: View) => {
    setCompletedPhases((prev) => new Set([...prev, phaseId]));
    setActiveView("hub");
  };

  // Render sub-ateliers
  if (activeView === "diagnostic") {
    return <AtelierDiagnostic onBack={() => handlePhaseBack("diagnostic")} />;
  }
  if (activeView === "jumelage") {
    return <AtelierJumelage onBack={() => handlePhaseBack("jumelage")} />;
  }
  if (activeView === "cahier") {
    return <AtelierCahierProjet onBack={() => handlePhaseBack("cahier")} />;
  }

  // Hub view
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="shrink-0 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Building2 className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-bold text-gray-800">Pipeline Usine Bleue</span>
        <span className="text-xs text-gray-500 ml-1">— 3 phases du diagnostic au cahier de projet</span>

        {/* Phase dots */}
        <div className="flex items-center gap-2 ml-auto">
          {PHASES.map((phase, i) => (
            <div key={phase.id} className="flex items-center gap-1">
              <div className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                completedPhases.has(phase.id)
                  ? "bg-green-400"
                  : phase.dotColor,
              )} />
              {i < PHASES.length - 1 && <div className="w-4 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>
      </div>

      {/* Hub content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-3">
            <Zap className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Pipeline de Developpement Economique</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">Aliments Boreal inc. — Saguenay</h2>
          <p className="text-sm text-gray-500">
            Manufacturier alimentaire, 85 employes — 3 axes : Energie + Palettisation + IoT
          </p>
        </div>

        {/* Phase pipeline indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {PHASES.map((phase, i) => {
            const isCompleted = completedPhases.has(phase.id);
            const PIcon = phase.icon;
            return (
              <div key={phase.id} className="flex items-center">
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all",
                  isCompleted
                    ? "bg-green-50 border-green-300 text-green-700"
                    : cn("bg-white", phase.borderColor, phase.textColor),
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <PIcon className={cn("h-4 w-4", phase.color)} />
                  )}
                  <span className="text-xs font-bold">Phase {phase.num}</span>
                </div>
                {i < PHASES.length - 1 && (
                  <ArrowRight className={cn(
                    "h-4 w-4 mx-2",
                    isCompleted ? "text-green-400" : "text-gray-300",
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Phase cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {PHASES.map((phase) => {
            const isCompleted = completedPhases.has(phase.id);
            const PIcon = phase.icon;
            return (
              <button
                key={phase.id}
                onClick={() => setActiveView(phase.id)}
                className={cn(
                  "text-left bg-white border rounded-xl overflow-hidden shadow-sm transition-all cursor-pointer",
                  "hover:shadow-lg hover:-translate-y-0.5",
                  isCompleted && "ring-2 ring-green-300",
                )}
              >
                {/* Card header gradient */}
                <div className={cn("bg-gradient-to-r px-4 py-3 flex items-center gap-2", phase.bgGradient)}>
                  <PIcon className="h-5 w-5 text-white" />
                  <div>
                    <div className="text-sm font-bold text-white">{phase.title}</div>
                    <div className="text-[9px] text-white/70">{phase.subtitle}</div>
                  </div>
                  {isCompleted && (
                    <CheckCircle2 className="h-5 w-5 text-white ml-auto" />
                  )}
                </div>

                {/* Card body */}
                <div className="p-4">
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">{phase.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] px-2 py-0.5 rounded-full font-bold",
                      isCompleted
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500",
                    )}>
                      {isCompleted ? "Complete" : "A explorer"}
                    </span>
                    <ArrowRight className={cn("h-3.5 w-3.5 ml-auto", phase.color)} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer message */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            Chaque phase est une simulation interactive — cliquez pour explorer
          </p>
        </div>
      </div>
    </div>
  );
}
