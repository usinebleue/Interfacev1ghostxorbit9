/**
 * DemoChatPlayer.tsx — Chat demo dans la zone Discussion
 *
 * Rend les VRAIS composants chat de SimAmorcer (ReflexionChat, ConceptionChat,
 * ExecutionChat, DeliverableConceptionChat) pilotes par demoStage du DemoContext.
 * Chaque composant a ses propres animations, TypewriterText, et boutons d'action.
 */

import { useState, useEffect } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useDemo } from "./DemoContext";
import {
  ReflexionChat,
  ConceptionChat,
  ExecutionChat,
  RetroactionChat,
  DeliverableConceptionChat,
  PlaceholderChat,
  PC,
} from "../v2/zones/center/atelier/demos/SimAmorcer";

// ═══ Titres par simulation ═══

const SIM_TITLES: Record<string, string> = {
  "phase:reflexion":   "Demo — Phase Reflexion",
  "phase:conception":  "Demo — Phase Conception",
  "phase:execution":   "Demo — Phase Execution",
  "phase:retroaction": "Demo — Phase Retroaction",
  "livrable:document":     "Demo — Document / Cahier",
  "livrable:tableur":      "Demo — Tableur",
  "livrable:presentation": "Demo — Presentation",
  "livrable:code":         "Demo — Code (Tim)",
  "livrable:jumelage":     "Demo — Jumelage",
};

// ═══ Composant principal ═══

export function DemoChatPlayer() {
  const { demoSimId, demoStage, advanceDemo, setDemoSimId, resetDemo } = useDemo();
  const [typed, setTyped] = useState(false);

  // Reset typed quand le stage change
  useEffect(() => {
    setTyped(false);
  }, [demoStage]);

  const title = (demoSimId && SIM_TITLES[demoSimId]) || "Demo";

  const advance = () => {
    advanceDemo();
    setTyped(false);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header demo */}
      <div className="h-12 shrink-0 flex items-center gap-2 bg-[#073E5A] px-3">
        <button
          onClick={() => setDemoSimId(null)}
          className="flex items-center gap-1 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-[11px] text-white font-medium">{title}</span>
        <div className="flex-1" />
        <button
          onClick={resetDemo}
          className="text-white/50 hover:text-white transition-colors cursor-pointer"
          title="Recommencer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Chat content — composants SimAmorcer */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <DemoChatContent
          simId={demoSimId}
          stage={demoStage}
          typed={typed}
          setTyped={setTyped}
          advance={advance}
        />
      </div>
    </div>
  );
}

// ═══ Routeur de chat par type de simulation ═══

function DemoChatContent({ simId, stage, typed, setTyped, advance }: {
  simId: string | null;
  stage: number;
  typed: boolean;
  setTyped: (v: boolean) => void;
  advance: () => void;
}) {
  if (!simId) return null;

  // Phase Reflexion — ReflexionChat complet (4 agents, animations)
  if (simId === "phase:reflexion") {
    return (
      <ReflexionChat
        stage={stage}
        typed={typed}
        setTyped={setTyped}
        advance={advance}
        pc={PC["reflexion"]}
        context="Analyse strategique"
      />
    );
  }

  // Phase Conception — ConceptionChat
  if (simId === "phase:conception") {
    return (
      <ConceptionChat
        stage={stage}
        typed={typed}
        setTyped={setTyped}
        advance={advance}
        onBackToReflexion={() => {}}
      />
    );
  }

  // Phase Execution — ExecutionChat
  if (simId === "phase:execution") {
    return (
      <ExecutionChat
        stage={stage}
        typed={typed}
        setTyped={setTyped}
        advance={advance}
        pc={PC["execution"]}
        context="Projet en cours"
      />
    );
  }

  // Phase Retroaction — RetroactionChat (bilan, apprentissages, recommandations, archivage)
  if (simId === "phase:retroaction") {
    return (
      <RetroactionChat
        stage={stage}
        typed={typed}
        setTyped={setTyped}
        advance={advance}
        pc={PC["retroaction"]}
      />
    );
  }

  // Livrables — DeliverableConceptionChat
  if (simId.startsWith("livrable:")) {
    const deliverable = simId.replace("livrable:", "");
    return (
      <DeliverableConceptionChat
        deliverable={deliverable}
        stage={stage}
        typed={typed}
        setTyped={setTyped}
        advance={advance}
        onBack={() => {}}
      />
    );
  }

  return <PlaceholderChat phase="observation" />;
}
