/**
 * reflexion-tools.tsx — Sprint 2A v2: Outils de réflexion + Techniques interactives
 *
 * Architecture:
 * - ReflexionModeActions: 8 pills mode (Analyse/Débat/Brainstorm/...) — sidebar
 * - TechniqueSidebarList: Compact sidebar list — clic = navigue vers sous-section
 * - TechniquePanel: Vue workspace d'une technique — lancer guidé/solo, session progress
 * - parseContentSections: Détecte items numérotés, split en cards
 *
 * Flux: Sidebar clic → setSelectedTechnique → TechniquePanel dans workspace
 *       TechniquePanel → Lancer → session guidée → résultats cristallisés en blocks
 */

import { useState, useCallback } from "react";
import {
  Eye, Swords, Lightbulb, Target, Sparkles, CheckCircle2, Zap, Brain,
  Search, Crown, ArrowLeftRight, RotateCcw, Leaf, Globe, Shield,
  Play, SkipForward, X as XIcon,
} from "lucide-react";
import { cn } from "../../components/ui/utils";

// ═══ Modes de réflexion — boutons d'ACTION (chaque clic ENVOIE un prompt au bot) ═══

export function ReflexionModeActions({ context, onSend }: {
  context: string;
  onSend: (prompt: string) => void;
}) {
  const MODES = [
    { id: "analyse", label: "Analyse", icon: Eye, bg: "bg-blue-100", text: "text-blue-700",
      prompt: `Fais une analyse approfondie et structurée de: ${context}` },
    { id: "debat", label: "Débat", icon: Swords, bg: "bg-red-100", text: "text-red-700",
      prompt: `Joue l'avocat du diable — débats les pour et les contre de: ${context}` },
    { id: "brainstorm", label: "Brainstorm", icon: Lightbulb, bg: "bg-amber-100", text: "text-amber-700",
      prompt: `Génère un maximum d'idées créatives et originales pour: ${context}` },
    { id: "strategie", label: "Stratégie", icon: Target, bg: "bg-purple-100", text: "text-purple-700",
      prompt: `Pense long terme — propose une vision stratégique pour: ${context}` },
    { id: "innovation", label: "Innovation", icon: Sparkles, bg: "bg-pink-100", text: "text-pink-700",
      prompt: `Sors du cadre — propose des approches innovantes et disruptives pour: ${context}` },
    { id: "decision", label: "Décision", icon: CheckCircle2, bg: "bg-green-100", text: "text-green-700",
      prompt: `Tranche et recommande — quelle décision prendre pour: ${context}` },
    { id: "crise", label: "Crise", icon: Zap, bg: "bg-orange-100", text: "text-orange-700",
      prompt: `Mode crise — urgence et pragmatisme. Que faire MAINTENANT pour: ${context}` },
    { id: "deep", label: "Deep", icon: Brain, bg: "bg-indigo-100", text: "text-indigo-700",
      prompt: `Réflexion profonde et nuancée — explore toutes les dimensions de: ${context}` },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {MODES.map(m => (
        <button key={m.id} onClick={() => onSend(m.prompt)}
          className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border cursor-pointer transition-colors hover:shadow-sm",
            m.bg, m.text, "border-current/30"
          )}>
          <m.icon className="h-3 w-3" />
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}

// ═══ Technique Session State ═══

interface TechniqueSession {
  technique: string;
  currentStep: number;
  totalSteps: number;
  accumulatedContext: string;
  mode: "guided" | "solo";
}

export const TECHNIQUE_CONFIGS: Record<string, { label: string; totalSteps: number; stepLabels: string[]; colors: string[]; description: string }> = {
  scamper: {
    label: "SCAMPER",
    totalSteps: 7,
    stepLabels: ["S", "C", "A", "M", "P", "E", "R"],
    colors: ["bg-pink-50 text-pink-700", "bg-blue-50 text-blue-700", "bg-violet-50 text-violet-700", "bg-amber-50 text-amber-700", "bg-emerald-50 text-emerald-700", "bg-red-50 text-red-700", "bg-indigo-50 text-indigo-700"],
    description: "7 leviers créatifs: Substituer, Combiner, Adapter, Modifier, Proposer d'autres usages, Éliminer, Réorganiser. Chaque lettre est une étape guidée.",
  },
  "5pourquoi": {
    label: "5 Pourquoi",
    totalSteps: 5,
    stepLabels: ["P1", "P2", "P3", "P4", "P5"],
    colors: ["bg-orange-50 text-orange-700", "bg-orange-100 text-orange-800", "bg-amber-100 text-amber-800", "bg-red-50 text-red-700", "bg-red-100 text-red-800"],
    description: "Creuser les causes racines en 5 niveaux de profondeur. Chaque Pourquoi est basé sur la réponse précédente.",
  },
  "6chapeaux": {
    label: "6 Chapeaux",
    totalSteps: 6,
    stepLabels: ["⚪", "🔴", "⚫", "🟡", "🟢", "🔵"],
    colors: ["bg-gray-50 text-gray-700", "bg-red-50 text-red-700", "bg-gray-100 text-gray-800", "bg-yellow-50 text-yellow-700", "bg-green-50 text-green-700", "bg-blue-50 text-blue-700"],
    description: "6 perspectives de Bono: Faits, Émotions, Risques, Opportunités, Créativité, Processus. Un chapeau à la fois.",
  },
};

// All techniques (multi-step + one-shot)
export const ALL_TECHNIQUES = [
  { id: "scamper", label: "SCAMPER", icon: Lightbulb,
    color: "bg-amber-50 text-amber-700",
    soloPrompt: (ctx: string) => `Applique SCAMPER complet (Substituer, Combiner, Adapter, Modifier, Proposer d'autres usages, Éliminer, Réorganiser) à: ${ctx}. Pour chaque lettre, donne 2-3 idées. Termine par un Top 3 classé par faisabilité.` },
  { id: "5pourquoi", label: "5 Pourquoi", icon: Search,
    color: "bg-orange-50 text-orange-700",
    soloPrompt: (ctx: string) => `Analyse les 5 Pourquoi en profondeur pour: ${ctx}. Chaque Pourquoi creuse basé sur la réponse précédente. Termine par la cause racine et 3 actions.` },
  { id: "6chapeaux", label: "6 Chapeaux", icon: Crown,
    color: "bg-violet-50 text-violet-700",
    soloPrompt: (ctx: string) => `Analyse avec les 6 Chapeaux de Bono pour: ${ctx}. Un chapeau à la fois (Blanc/Rouge/Noir/Jaune/Vert/Bleu). Termine par une synthèse avec Top 3 conclusions.` },
  { id: "analogie", label: "Analogie", icon: ArrowLeftRight,
    color: "bg-blue-50 text-blue-700",
    soloPrompt: (ctx: string) => `Trouve des analogies d'autres industries pour: ${ctx}` },
  { id: "inversion", label: "Inversion", icon: RotateCcw,
    color: "bg-pink-50 text-pink-700",
    soloPrompt: (ctx: string) => `Inverse le problème pour: ${ctx}` },
  { id: "biomimetisme", label: "Biomimétisme", icon: Leaf,
    color: "bg-emerald-50 text-emerald-700",
    soloPrompt: (ctx: string) => `Applique le biomimétisme à: ${ctx}` },
  { id: "deepsearch", label: "Deep Search", icon: Globe,
    color: "bg-cyan-50 text-cyan-700",
    soloPrompt: (ctx: string) => `Recherche approfondie: tendances, benchmarks, meilleures pratiques pour: ${ctx}` },
  { id: "challenge", label: "Challenge", icon: Shield,
    color: "bg-red-50 text-red-700",
    soloPrompt: (ctx: string) => `Challenge cette approche, trouve les failles: ${ctx}` },
];

// ═══ TechniqueSidebarList — compact sidebar items ═══

export function TechniqueSidebarList({ selectedId, onSelect }: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="space-y-0.5">
      {ALL_TECHNIQUES.map(t => {
        const isSelected = selectedId === t.id;
        const hasSteps = !!TECHNIQUE_CONFIGS[t.id];
        return (
          <button
            key={t.id}
            onClick={() => onSelect(isSelected ? null : t.id)}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all cursor-pointer",
              isSelected
                ? "bg-orange-50 border border-orange-200 shadow-sm"
                : "hover:bg-gray-50 border border-transparent"
            )}
          >
            <div className={cn("w-5 h-5 rounded-md flex items-center justify-center shrink-0", isSelected ? "bg-orange-100" : "bg-gray-100")}>
              <t.icon className={cn("h-3 w-3", isSelected ? "text-orange-600" : "text-gray-500")} />
            </div>
            <span className={cn("text-[10px] font-bold truncate", isSelected ? "text-orange-700" : "text-gray-700")}>{t.label}</span>
            {hasSteps && (
              <span className="ml-auto text-[8px] text-gray-400 shrink-0">{TECHNIQUE_CONFIGS[t.id].totalSteps}×</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ═══ TechniquePanel — workspace panel for selected technique ═══

export function TechniquePanel({ techniqueId, context, onSend, onSendWithMeta, onClose }: {
  techniqueId: string;
  context: string;
  onSend: (prompt: string) => void;
  onSendWithMeta?: (prompt: string, meta: { techniqueActive: string; techniqueStep: number; techniqueContext: string }) => void;
  onClose: () => void;
}) {
  const [session, setSession] = useState<TechniqueSession | null>(null);
  const tech = ALL_TECHNIQUES.find(t => t.id === techniqueId);
  const config = TECHNIQUE_CONFIGS[techniqueId];

  const startSession = useCallback((mode: "guided" | "solo") => {
    if (mode === "solo" || !config) {
      if (tech) onSend(tech.soloPrompt(context));
      return;
    }
    // Start guided session
    const newSession: TechniqueSession = {
      technique: techniqueId,
      currentStep: 0,
      totalSteps: config.totalSteps,
      accumulatedContext: "",
      mode: "guided",
    };
    setSession(newSession);
    const msg = `Lance l'atelier ${config.label} guidé sur: ${context}`;
    if (onSendWithMeta) {
      onSendWithMeta(msg, { techniqueActive: techniqueId, techniqueStep: 0, techniqueContext: "" });
    } else {
      onSend(msg);
    }
  }, [techniqueId, context, config, tech, onSend, onSendWithMeta]);

  const advanceStep = useCallback(() => {
    if (!session || !config) return;
    const nextStep = session.currentStep + 1;
    if (nextStep >= config.totalSteps) {
      setSession(null);
      return;
    }
    const updated = {
      ...session,
      currentStep: nextStep,
      accumulatedContext: session.accumulatedContext + `\nÉtape ${session.currentStep + 1} complétée.`,
    };
    setSession(updated);
    const msg = `Continue l'atelier ${config.label} — passe à l'étape ${nextStep + 1}/${config.totalSteps}: ${config.stepLabels[nextStep]}`;
    if (onSendWithMeta) {
      onSendWithMeta(msg, { techniqueActive: session.technique, techniqueStep: nextStep, techniqueContext: updated.accumulatedContext });
    } else {
      onSend(msg);
    }
  }, [session, config, onSend, onSendWithMeta]);

  if (!tech) return null;

  // ═══ Active Session View ═══
  if (session && config) {
    return (
      <div className="rounded-xl border border-orange-200 bg-orange-50/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold text-orange-700">
            Atelier {config.label} en cours
          </h4>
          <button onClick={() => { setSession(null); onClose(); }} className="p-1 rounded-md hover:bg-orange-100 cursor-pointer transition-colors">
            <XIcon className="h-3 w-3 text-orange-500" />
          </button>
        </div>

        {/* Pipeline visual — progress dots */}
        <div className="flex items-center gap-1">
          {config.stepLabels.map((label, i) => {
            const isComplete = i < session.currentStep;
            const isActive = i === session.currentStep;
            return (
              <div key={i} className="flex items-center">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                  isComplete ? "bg-emerald-100 text-emerald-700" :
                  isActive ? cn(config.colors[i], "ring-2 ring-orange-300") :
                  "bg-gray-100 text-gray-400"
                )}>
                  {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : label}
                </div>
                {i < config.stepLabels.length - 1 && (
                  <div className={cn("w-3 h-0.5 mx-0.5", isComplete ? "bg-emerald-400" : "bg-gray-200")} />
                )}
              </div>
            );
          })}
        </div>

        {/* Advance / Complete */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-orange-600 font-medium flex-1">
            Étape {session.currentStep + 1}/{config.totalSteps} — {config.stepLabels[session.currentStep]}
          </span>
          {session.currentStep < config.totalSteps - 1 ? (
            <button onClick={advanceStep}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-bold hover:bg-orange-600 cursor-pointer transition-colors">
              <SkipForward className="h-3 w-3" /> Suivante: {config.stepLabels[session.currentStep + 1]}
            </button>
          ) : (
            <button onClick={() => { advanceStep(); onClose(); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 cursor-pointer transition-colors">
              <CheckCircle2 className="h-3 w-3" /> Terminer
            </button>
          )}
        </div>
      </div>
    );
  }

  // ═══ Technique Detail Panel — launch options ═══
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", tech.color)}>
            <tech.icon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-gray-900">{tech.label}</h4>
            {config && <span className="text-[9px] text-gray-400">{config.totalSteps} étapes guidées</span>}
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer transition-colors">
          <XIcon className="h-3.5 w-3.5 text-gray-400" />
        </button>
      </div>

      {config && <p className="text-[10px] text-gray-500 leading-relaxed">{config.description}</p>}

      <div className="flex gap-2">
        {config && (
          <button onClick={() => startSession("guided")}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-orange-500 text-white text-[10px] font-bold hover:bg-orange-600 cursor-pointer transition-colors">
            <Play className="h-3 w-3" /> Lancer l'atelier guidé
          </button>
        )}
        <button onClick={() => startSession("solo")}
          className={cn(
            "flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[10px] font-medium cursor-pointer transition-colors border",
            config ? "flex-1 border-gray-200 text-gray-700 hover:bg-gray-50" : "flex-1 bg-orange-500 text-white font-bold hover:bg-orange-600 border-orange-500"
          )}>
          <Zap className="h-3 w-3" /> {config ? "L'agent fait seul" : "Lancer"}
        </button>
      </div>
    </div>
  );
}

// ═══ Legacy TechniqueSelector — backward compat wrapper ═══
export function TechniqueSelector({ context, onSend, onSendWithMeta, sidebarMode }: {
  context: string;
  onSend: (prompt: string) => void;
  onSendWithMeta?: (prompt: string, meta: { techniqueActive: string; techniqueStep: number; techniqueContext: string }) => void;
  sidebarMode?: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (sidebarMode) {
    return <TechniqueSidebarList selectedId={selectedId} onSelect={setSelectedId} />;
  }

  return selectedId ? (
    <TechniquePanel techniqueId={selectedId} context={context} onSend={onSend} onSendWithMeta={onSendWithMeta} onClose={() => setSelectedId(null)} />
  ) : null;
}

// ═══ Parser le contenu en sections individuelles (concepts numérotés, items à puces) ═══

export function parseContentSections(text: string): { title: string; body: string }[] {
  const lines = text.split('\n');
  const sections: { title: string; body: string }[] = [];
  let current: { title: string; body: string } | null = null;

  for (const line of lines) {
    const isSection = /^\s*\d+[\.\)]\s+/.test(line) || /^\s*[🎬🎤🧩💡🔍⚡📊🎯✅❌🟢🔴🧠⚙️🏭📈🔥⭐🚀]\s+/.test(line);
    if (isSection) {
      if (current) sections.push(current);
      current = { title: line.trim(), body: '' };
    } else if (current) {
      current.body += (current.body ? '\n' : '') + line;
    } else {
      if (!sections.length) {
        current = { title: '', body: line };
      }
    }
  }
  if (current) sections.push(current);
  return sections;
}

// ═══ IDs des outils réflexion dans la sidebar ═══

export const REFLEXION_TOOL_IDS = [
  { id: "analyse", label: "Analyse", icon: Eye, bg: "bg-blue-100", text: "text-blue-600", prompt: (ctx: string) => `Fais une analyse approfondie et structuree de: ${ctx}` },
  { id: "debat", label: "Debat", icon: Swords, bg: "bg-red-100", text: "text-red-600", prompt: (ctx: string) => `Joue l'avocat du diable — debats les pour et les contre de: ${ctx}` },
  { id: "brainstorm", label: "Brainstorm", icon: Lightbulb, bg: "bg-amber-100", text: "text-amber-600", prompt: (ctx: string) => `Genere un maximum d'idees creatives pour: ${ctx}` },
  { id: "strategie", label: "Strategie", icon: Target, bg: "bg-purple-100", text: "text-purple-600", prompt: (ctx: string) => `Pense long terme — propose une vision strategique pour: ${ctx}` },
  { id: "innovation", label: "Innovation", icon: Sparkles, bg: "bg-pink-100", text: "text-pink-600", prompt: (ctx: string) => `Sors du cadre — propose des approches innovantes pour: ${ctx}` },
  { id: "decision", label: "Decision", icon: CheckCircle2, bg: "bg-green-100", text: "text-green-600", prompt: (ctx: string) => `Tranche et recommande — quelle decision prendre pour: ${ctx}` },
  { id: "crise", label: "Crise", icon: Zap, bg: "bg-orange-100", text: "text-orange-600", prompt: (ctx: string) => `Mode crise — urgence et pragmatisme. Que faire MAINTENANT pour: ${ctx}` },
  { id: "deep", label: "Deep", icon: Brain, bg: "bg-indigo-100", text: "text-indigo-600", prompt: (ctx: string) => `Reflexion profonde et nuancee — explore toutes les dimensions de: ${ctx}` },
] as const;
