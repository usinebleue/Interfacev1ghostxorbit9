/**
 * AtelierHub.tsx — Galerie des 12 ateliers split-screen
 * 2 sections: Flow Usine Bleue (3 phases) + Modes de reflexion (8+1)
 * Sprint B — Atelier Simulations
 */

"use client";

import { useState } from "react";
import {
  Wrench,
  Eye,
  Lightbulb,
  Target,
  Swords,
  CheckCircle2,
  Zap,
  Sparkles,
  Brain,
  Scan,
  Handshake,
  FileText,
  Code2,
  Play,
  ArrowRight,
  ChevronRight,
  Globe,
  Crown,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
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

type AtelierView =
  | "hub"
  | "analyse" | "brainstorm" | "strategie" | "debat"
  | "decision" | "crise" | "innovation" | "deep"
  | "timcode"
  | "diagnostic" | "jumelage" | "cahier-projet"
  | "site-web"
  | "realtor-client";

interface AtelierCard {
  id: AtelierView;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  description: string;
}

const FLOW_ATELIERS: AtelierCard[] = [
  {
    id: "diagnostic",
    title: "1. Diagnostic",
    subtitle: "Tension → Multi-bot → Pre-rapport",
    icon: Scan,
    color: "bg-red-600",
    bgGradient: "from-red-50 to-red-100/50",
    borderColor: "border-red-300",
    textColor: "text-red-700",
    description: "CarlOS analyse la tension, consulte 3 specialistes, synthetise un pre-rapport.",
  },
  {
    id: "jumelage",
    title: "2. Jumelage",
    subtitle: "Criteres → Scan → Scoring",
    icon: Handshake,
    color: "bg-amber-600",
    bgGradient: "from-amber-50 to-amber-100/50",
    borderColor: "border-amber-300",
    textColor: "text-amber-700",
    description: "Scan du reseau, criteres de matching, sessions AI, scoring et selection.",
  },
  {
    id: "cahier-projet",
    title: "3. Cahier Projet",
    subtitle: "7 sections → Budget → Validation",
    icon: FileText,
    color: "bg-emerald-600",
    bgGradient: "from-emerald-50 to-emerald-100/50",
    borderColor: "border-emerald-300",
    textColor: "text-emerald-700",
    description: "Co-construction guidee : profil, diagnostic, solutions, budget, timeline.",
  },
];

const MODE_ATELIERS: AtelierCard[] = [
  {
    id: "analyse",
    title: "Analyse",
    subtitle: "5 Pourquoi + Ishikawa",
    icon: Eye,
    color: "bg-cyan-600",
    bgGradient: "from-cyan-50 to-cyan-100/50",
    borderColor: "border-cyan-300",
    textColor: "text-cyan-700",
    description: "Decomposition systematique avec 5 Pourquoi et diagramme Ishikawa.",
  },
  {
    id: "brainstorm",
    title: "Brainstorm",
    subtitle: "Sticky board + SCAMPER",
    icon: Lightbulb,
    color: "bg-amber-600",
    bgGradient: "from-amber-50 to-amber-100/50",
    borderColor: "border-amber-300",
    textColor: "text-amber-700",
    description: "Board de post-its, 4 bots, methode SCAMPER, clustering d'idees.",
  },
  {
    id: "strategie",
    title: "Strategie",
    subtitle: "SWOT + Scenarios + Roadmap",
    icon: Target,
    color: "bg-purple-600",
    bgGradient: "from-purple-50 to-purple-100/50",
    borderColor: "border-purple-300",
    textColor: "text-purple-700",
    description: "Analyse SWOT 4 quadrants, 3 scenarios, matrice de risques.",
  },
  {
    id: "debat",
    title: "Debat",
    subtitle: "Pour vs Contre → Verdict",
    icon: Swords,
    color: "bg-red-600",
    bgGradient: "from-red-50 to-red-100/50",
    borderColor: "border-red-300",
    textColor: "text-red-700",
    description: "CFO vs CRO en split. 3 rounds d'arguments puis verdict CEO.",
  },
  {
    id: "decision",
    title: "Decision",
    subtitle: "Matrice GO/NO-GO",
    icon: CheckCircle2,
    color: "bg-slate-700",
    bgGradient: "from-slate-50 to-slate-100/50",
    borderColor: "border-slate-400",
    textColor: "text-slate-700",
    description: "Matrice ponderee, stakeholders, 4 scenarios, verdict du board.",
  },
  {
    id: "crise",
    title: "Crise",
    subtitle: "OODA Loop 48h",
    icon: Zap,
    color: "bg-orange-600",
    bgGradient: "from-orange-50 to-orange-100/50",
    borderColor: "border-orange-300",
    textColor: "text-orange-700",
    description: "Timer, boucle OODA rapide, decisions binaires sous pression.",
  },
  {
    id: "innovation",
    title: "Innovation",
    subtitle: "Analogie + Inversion + Bio",
    icon: Sparkles,
    color: "bg-pink-600",
    bgGradient: "from-pink-50 to-pink-100/50",
    borderColor: "border-pink-300",
    textColor: "text-pink-700",
    description: "3 techniques de pensee laterale. Catalyse de combinaisons nouvelles.",
  },
  {
    id: "deep",
    title: "Deep Resonance",
    subtitle: "Spirale socratique",
    icon: Brain,
    color: "bg-indigo-600",
    bgGradient: "from-indigo-50 to-indigo-100/50",
    borderColor: "border-indigo-300",
    textColor: "text-indigo-700",
    description: "Dialogue profond 1-on-1 avec CarlOS. Questions reflexives.",
  },
  {
    id: "timcode",
    title: "Tim Code",
    subtitle: "Plan → Code → Terminal",
    icon: Code2,
    color: "bg-violet-600",
    bgGradient: "from-violet-50 to-violet-100/50",
    borderColor: "border-violet-300",
    textColor: "text-violet-700",
    description: "Tim aide a coder : planification, code editor, debug, terminal.",
  },
];

export function AtelierHub() {
  const [view, setView] = useState<AtelierView>("hub");

  const handleBack = () => setView("hub");

  // Render active atelier
  if (view !== "hub") {
    switch (view) {
      case "analyse": return <AtelierAnalyse onBack={handleBack} />;
      case "brainstorm": return <AtelierBrainstorm onBack={handleBack} />;
      case "strategie": return <AtelierStrategie onBack={handleBack} />;
      case "debat": return <AtelierDebat onBack={handleBack} />;
      case "decision": return <AtelierDecision onBack={handleBack} />;
      case "crise": return <AtelierCrise onBack={handleBack} />;
      case "innovation": return <AtelierInnovation onBack={handleBack} />;
      case "deep": return <AtelierDeepResonance onBack={handleBack} />;
      case "timcode": return <AtelierTimCode onBack={handleBack} />;
      case "diagnostic": return <AtelierDiagnostic onBack={handleBack} />;
      case "jumelage": return <AtelierJumelage onBack={handleBack} />;
      case "cahier-projet": return <AtelierCahierProjet onBack={handleBack} />;
      case "site-web": return <AtelierSiteWeb onBack={handleBack} />;
      case "realtor-client": return <AtelierRealtorClient onBack={handleBack} />;
    }
  }

  return (
    <PageLayout
      maxWidth="5xl"
      spacing="space-y-6"
      header={
        <PageHeader
          icon={Wrench}
          iconColor="text-blue-600"
          title="Ateliers"
          subtitle="Simulations split-screen — chat + contenu riche"
        />
      }
    >
      {/* Flow Usine Bleue */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <ArrowRight className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Pipeline Client / Fournisseur</h2>
            <p className="text-xs text-gray-500">Le flow complet : diagnostic → jumelage → cahier de projet</p>
          </div>
          <div className="flex items-center gap-1 ml-auto text-[9px] text-gray-400">
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">1</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">2</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">3</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {FLOW_ATELIERS.map(a => (
            <AtelierCardButton key={a.id} atelier={a} onNavigate={setView} />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* Verticaux — Site Web, The Realtor, etc. */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center">
            <Globe className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Verticaux</h2>
            <p className="text-xs text-gray-500">Applications verticales — site web, immobilier, etc.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <AtelierCardButton
            atelier={{
              id: "site-web",
              title: "Usine Bleue — Site Web",
              subtitle: "Visiteur → Diagnostic → Conference",
              icon: Globe,
              color: "bg-teal-600",
              bgGradient: "from-teal-50 to-cyan-100/50",
              borderColor: "border-teal-300",
              textColor: "text-teal-700",
              description: "Simulation complete : visiteur arrive sur usinebleue.ai, CarlOS accueille, diagnostic VITAA, conference d'aiguillage avec Paco.",
            }}
            onNavigate={setView}
          />
          <AtelierCardButton
            atelier={{
              id: "realtor-client",
              title: "TheRealtor.ai — Acheteur",
              subtitle: "Portrait-Robot → Matching → Conference",
              icon: Crown,
              color: "bg-red-700",
              bgGradient: "from-stone-50 to-red-50/30",
              borderColor: "border-red-300",
              textColor: "text-red-800",
              description: "Parcours acheteur luxe : portrait-robot, mood board, AI matching, conference avec conseiller Engel & Volkers.",
            }}
            onNavigate={setView}
          />
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* Modes de reflexion */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Modes de reflexion</h2>
            <p className="text-xs text-gray-500">8+1 outils en mode atelier split-screen</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {MODE_ATELIERS.map(a => (
            <AtelierCardButton key={a.id} atelier={a} onNavigate={setView} />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

function AtelierCardButton({ atelier: a, onNavigate }: { atelier: AtelierCard; onNavigate: (id: AtelierView) => void }) {
  const Icon = a.icon;
  return (
    <button
      onClick={() => onNavigate(a.id)}
      className={cn(
        "text-left rounded-2xl border-2 overflow-hidden transition-all group flex flex-col",
        "hover:shadow-lg hover:scale-[1.02] cursor-pointer",
        a.borderColor,
      )}
    >
      <div className={cn("h-2 shrink-0", a.color)} />
      <div className={cn("p-5 bg-gradient-to-b flex-1 flex flex-col", a.bgGradient)}>
        <div className="flex items-start gap-3 mb-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white", a.color)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn("text-sm font-bold", a.textColor)}>{a.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{a.subtitle}</p>
          </div>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed flex-1">{a.description}</p>
        <div className={cn(
          "mt-3 flex items-center gap-1.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity",
          a.textColor,
        )}>
          <Play className="h-3.5 w-3.5" /> Ouvrir l'atelier
        </div>
      </div>
    </button>
  );
}
