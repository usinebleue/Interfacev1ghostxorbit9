/**
 * LiveDiscussionView.tsx — Vue unifiee Discussion + Reflexion
 *
 * Composant principal du workspace dynamique intelligent.
 * Remplace LivePhaseView (pour discussion) ET LiveReflexionView.
 *
 * LAYOUT (fidele aux simulations FocusDiscussionView/FocusReflexionView):
 * - Hero compact sky-blue (phase Discussion) avec CREDO progress dots
 * - Sidebar 180px (3 tiers: CREDO steps, outils reflexion, index blocks)
 * - Zone contenu: workspace blocks dynamiques cristallises
 *
 * Les actions (Approfondir/Challenger/Consulter) sont dans la zone chat
 * via BubbleActions.tsx — PAS dans le workspace.
 * Les outils reflexion sont dans la sidebar (envoient un prompt au bot).
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  CheckCircle2, Zap, X, ArrowRight, Plus, Check,
  Loader2, Network, FileText, Activity,
  AlertTriangle, Lightbulb, Target, TrendingUp,
  Eye, Brain, Swords, Sparkles, Search,
  Crown, ArrowLeftRight, RotateCcw, Leaf, Shield,
  MessageCircle, Users, Globe, BarChart3, Scale,
  MapPin, Wrench, Database, Star, ThumbsUp, ThumbsDown,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { SF } from "../core/styles";
import { useIsMobile } from "../../components/ui/use-mobile";
// MobileSidebarSheet removed — sidebar retired for flat timeline layout
import { useAmorcer } from "../AmorcerContext";
import { useChatContext } from "../../v2/context/ChatContext";
import { PHASE_CONFIGS } from "./phase-config";
import { TechniquePanel } from "./reflexion-tools";
import { WorkspaceReflexionHub } from "./WorkspaceReflexionHub";
import { BlockRenderer, SkeletonBlock, BLOCK_TYPE_LABELS, BlockDisplayContext } from "./workspace-block-renderers";
import { BotAvatar } from "../simulation/primitives";
import { BOT_NAME, BOT_AVATAR } from "../../v2/api/types";
import { api } from "../../v2/api/client";
import type { CascadeSuggestion } from "../../v2/api/types";
import { detectBlockTypeFrontend, extractStructuredDataFrontend, summarizeExpertForWorkspace, generateExpertBlockTitle } from "../hooks/useWorkspaceCapture";
// chantier-requirements.ts = mecanique interne pour guider le backend, pas affichee dans le UI

// ═══ Etape 5: Reflexion Flow — stage prompts (module-level for stable closures) ═══

const REFLEXION_STAGE_PROMPTS: Record<string, string[]> = {
  analyse: [
    "Fais un diagnostic precis de la situation suivante. Identifie les enjeux principaux, la complexite et l'urgence:\n\n{context}",
    "Approfondi ton analyse. Identifie les causes racines (methode 5 Pourquoi), les parties prenantes et les contraintes:\n\n{context}\n\nDiagnostic precedent:\n{prev}",
    "Synthese finale: recommandations concretes, actions prioritaires avec assignation, et prochaines etapes:\n\n{context}\n\nAnalyse complete:\n{prev}",
  ],
  debat: [
    "Presente les arguments POUR la position suivante, avec des donnees et exemples concrets:\n\n{context}",
    "Maintenant joue l'avocat du diable — presente les arguments CONTRE avec la meme rigueur:\n\n{context}\n\nArguments POUR:\n{prev}",
    "Verdict final: quelle position est la plus solide? Quels compromis sont possibles? Recommandation:\n\n{context}\n\nDebat complet:\n{prev}",
  ],
  brainstorm: [
    "BRAINSTORM Vague 1 — Idees en vrac.\n\nGenere exactement 8 idees creatives et variees. Format STRICT — une idee par ligne, numerotee:\n1. Titre court — Description en 1 phrase\n2. Titre court — Description en 1 phrase\n...\n\nPas de headers, pas de sous-titres, pas d'intro, pas de conclusion. JUSTE les 8 idees numerotees avec tiret entre titre et description.\n\nSujet:\n{context}",
    "BRAINSTORM Vague 2 — SCAMPER.\n\nA partir des idees precedentes, applique SCAMPER pour en extraire 5 idees enrichies. Pour chaque idee, indique la technique SCAMPER utilisee et donne un score sur 20.\n\nFormat STRICT — une par ligne:\n1. [SUBSTITUER] Titre — Description. Score: 16/20\n2. [COMBINER] Titre — Description. Score: 18/20\n...\n\nPas de headers, pas d'intro. JUSTE les 5 idees.\n\nIdees precedentes:\n{prev}\n\nSujet:\n{context}",
    "BRAINSTORM Top 3.\n\nSelectionne les 3 meilleures idees. Pour chacune, donne:\n- Le titre\n- Pourquoi elle gagne (1 phrase)\n- 2 actions concretes immediates\n\nFormat STRICT:\n### 1. Titre de l'idee\nPourquoi: explication courte\nAction 1: action concrete\nAction 2: action concrete\n\n### 2. Titre\nPourquoi: ...\nAction 1: ...\nAction 2: ...\n\n### 3. Titre\nPourquoi: ...\nAction 1: ...\nAction 2: ...\n\nIdees evaluees:\n{prev}\n\nSujet:\n{context}",
  ],
  strategie: [
    "Analyse l'etat des lieux strategique actuel (forces, faiblesses, opportunites, menaces):\n\n{context}",
    "Propose 3 options strategiques distinctes avec pour chacune: avantages, risques, investissement requis:\n\n{context}\n\nEtat des lieux:\n{prev}",
    "Recommandation strategique finale: option choisie, plan d'execution en 3 phases, metriques de succes:\n\n{context}\n\nOptions evaluees:\n{prev}",
  ],
  decision: [
    "Identifie les criteres de decision importants et leur poids relatif pour:\n\n{context}",
    "Evalue chaque option contre ces criteres (score 1-5 par critere) — tableau comparatif:\n\n{context}\n\nCriteres identifies:\n{prev}",
    "Decision finale: option recommandee, justification, risques a mitiger, prochaine action immediate:\n\n{context}\n\nEvaluation complete:\n{prev}",
  ],
  innovation: [
    "Recherche d'inspiration: quelles innovations dans d'autres industries pourraient s'appliquer ici?\n\n{context}",
    "Disruption: comment pourrait-on completement reinventer l'approche? Pense 10x pas 10%:\n\n{context}\n\nInspirations:\n{prev}",
    "Prototype conceptuel: decris la solution ideale en detail (fonctionnement, benefices, implementation):\n\n{context}\n\nIdees disruptives:\n{prev}",
  ],
};

const REFLEXION_STAGE_LABELS: Record<string, string[]> = {
  analyse: ["Diagnostic", "Approfondissement", "Synthese + Actions"],
  debat: ["Arguments Pour", "Arguments Contre", "Verdict"],
  brainstorm: ["Vague d'idees", "SCAMPER", "Top 3 + Plan"],
  strategie: ["Etat des lieux", "Options strategiques", "Recommandation"],
  decision: ["Criteres", "Evaluation", "Decision finale"],
  innovation: ["Inspiration", "Disruption", "Prototype"],
};

const REFLEXION_MODE_COLORS: Record<string, { bg: string; text: string }> = {
  analyse: { bg: "bg-blue-100", text: "text-blue-700" },
  debat: { bg: "bg-red-100", text: "text-red-700" },
  brainstorm: { bg: "bg-amber-100", text: "text-amber-700" },
  strategie: { bg: "bg-purple-100", text: "text-purple-700" },
  decision: { bg: "bg-green-100", text: "text-green-700" },
  innovation: { bg: "bg-pink-100", text: "text-pink-700" },
};

// ═══ S117-B: MODE_CONFIGS — 9 modes, 9 palettes, 9 sequences d'etapes ═══

interface ModeStage {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string; // tailwind class eg "bg-pink-50 text-pink-700"
}

interface ModeConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  color: { bg: string; text: string; bgLight: string; accent: string; glow1: string; glow2: string };
  stages: ModeStage[];
}

const MODE_CONFIGS: Record<string, ModeConfig> = {
  brainstorm: {
    id: "brainstorm", label: "Brainstorm", icon: Lightbulb,
    color: { bg: "bg-amber-100", text: "text-amber-700", bgLight: "bg-amber-50", accent: "bg-amber-400", glow1: "bg-amber-100/70", glow2: "bg-yellow-100/40" },
    stages: [
      { id: "S", title: "Substituer", subtitle: "Remplacer un element", icon: RotateCcw, color: "bg-pink-50 text-pink-700" },
      { id: "C", title: "Combiner", subtitle: "Fusionner des idees", icon: ArrowLeftRight, color: "bg-blue-50 text-blue-700" },
      { id: "A", title: "Adapter", subtitle: "Transposer d'ailleurs", icon: Crown, color: "bg-violet-50 text-violet-700" },
      { id: "M", title: "Modifier", subtitle: "Amplifier ou reduire", icon: Sparkles, color: "bg-amber-50 text-amber-700" },
      { id: "P", title: "Proposer", subtitle: "Autre usage", icon: Lightbulb, color: "bg-emerald-50 text-emerald-700" },
      { id: "E", title: "Eliminer", subtitle: "Supprimer le superflu", icon: AlertTriangle, color: "bg-red-50 text-red-700" },
      { id: "R", title: "Reorganiser", subtitle: "Inverser l'ordre", icon: ArrowLeftRight, color: "bg-indigo-50 text-indigo-700" },
    ],
  },
  analyser: {
    id: "analyser", label: "Analyse", icon: Eye,
    color: { bg: "bg-blue-100", text: "text-blue-700", bgLight: "bg-blue-50", accent: "bg-blue-400", glow1: "bg-blue-100/70", glow2: "bg-sky-100/40" },
    stages: [
      { id: "situation", title: "Situation actuelle", subtitle: "Etat des lieux", icon: Activity, color: "bg-blue-50 text-blue-700" },
      { id: "forces", title: "Forces en presence", subtitle: "Atouts et leviers", icon: TrendingUp, color: "bg-sky-50 text-sky-700" },
      { id: "contraintes", title: "Contraintes reelles", subtitle: "Limites et blocages", icon: AlertTriangle, color: "bg-amber-50 text-amber-700" },
      { id: "risques", title: "Risques critiques", subtitle: "Scenarios negatifs", icon: Shield, color: "bg-red-50 text-red-700" },
      { id: "leviers", title: "Leviers d'action", subtitle: "Opportunites cles", icon: Target, color: "bg-emerald-50 text-emerald-700" },
    ],
  },
  debat: {
    id: "debat", label: "Debat", icon: Swords,
    color: { bg: "bg-red-100", text: "text-red-700", bgLight: "bg-red-50", accent: "bg-red-400", glow1: "bg-red-100/70", glow2: "bg-rose-100/40" },
    stages: [
      { id: "these", title: "THESE (Pour)", subtitle: "Arguments favorables", icon: ThumbsUp, color: "bg-emerald-50 text-emerald-700" },
      { id: "antithese", title: "ANTITHESE (Contre)", subtitle: "Contre-arguments", icon: ThumbsDown, color: "bg-red-50 text-red-700" },
      { id: "synthese", title: "SYNTHESE", subtitle: "Verdict et compromis", icon: Scale, color: "bg-indigo-50 text-indigo-700" },
    ],
  },
  strategie: {
    id: "strategie", label: "Strategie", icon: Target,
    color: { bg: "bg-purple-100", text: "text-purple-700", bgLight: "bg-purple-50", accent: "bg-purple-400", glow1: "bg-purple-100/70", glow2: "bg-violet-100/40" },
    stages: [
      { id: "positionnement", title: "Positionnement", subtitle: "Ou sommes-nous?", icon: MapPin, color: "bg-purple-50 text-purple-700" },
      { id: "moats", title: "Moats & avantages", subtitle: "Fossés defensifs", icon: Shield, color: "bg-violet-50 text-violet-700" },
      { id: "sequencage", title: "Sequencage", subtitle: "Phases d'execution", icon: Target, color: "bg-indigo-50 text-indigo-700" },
      { id: "paris", title: "Paris strategiques", subtitle: "Risques calcules", icon: Zap, color: "bg-blue-50 text-blue-700" },
      { id: "anti", title: "Anti-strategie", subtitle: "Comment on perd", icon: Swords, color: "bg-red-50 text-red-700" },
    ],
  },
  innovation: {
    id: "innovation", label: "Innovation", icon: Sparkles,
    color: { bg: "bg-pink-100", text: "text-pink-700", bgLight: "bg-pink-50", accent: "bg-pink-400", glow1: "bg-pink-100/70", glow2: "bg-rose-100/40" },
    stages: [
      { id: "analogies", title: "Analogies 3 industries", subtitle: "Inspiration croisee", icon: ArrowLeftRight, color: "bg-blue-50 text-blue-700" },
      { id: "inversion", title: "Inversion", subtitle: "Et si l'inverse?", icon: RotateCcw, color: "bg-pink-50 text-pink-700" },
      { id: "contrainte", title: "Contrainte extreme", subtitle: "10x moins cher?", icon: Zap, color: "bg-orange-50 text-orange-700" },
      { id: "biomimetisme", title: "Biomimetisme", subtitle: "La nature resout", icon: Leaf, color: "bg-emerald-50 text-emerald-700" },
    ],
  },
  decision: {
    id: "decision", label: "Decision", icon: CheckCircle2,
    color: { bg: "bg-green-100", text: "text-green-700", bgLight: "bg-green-50", accent: "bg-green-400", glow1: "bg-green-100/70", glow2: "bg-emerald-100/40" },
    stages: [
      { id: "reformuler", title: "Reformuler le choix", subtitle: "Clarifier la question", icon: MessageCircle, color: "bg-green-50 text-green-700" },
      { id: "criteres", title: "Criteres ponderes", subtitle: "Poids et priorites", icon: BarChart3, color: "bg-emerald-50 text-emerald-700" },
      { id: "matrice", title: "Matrice de decision", subtitle: "Score par option", icon: BarChart3, color: "bg-teal-50 text-teal-700" },
      { id: "tradeoffs", title: "Trade-offs nommes", subtitle: "Ce qu'on sacrifie", icon: Scale, color: "bg-amber-50 text-amber-700" },
      { id: "recommandation", title: "Recommandation", subtitle: "Le verdict", icon: CheckCircle2, color: "bg-blue-50 text-blue-700" },
    ],
  },
  crise: {
    id: "crise", label: "Crise", icon: Zap,
    color: { bg: "bg-orange-100", text: "text-orange-700", bgLight: "bg-orange-50", accent: "bg-orange-400", glow1: "bg-orange-100/70", glow2: "bg-amber-100/40" },
    stages: [
      { id: "triage", title: "TRIAGE (0-4h)", subtitle: "Quoi en premier", icon: AlertTriangle, color: "bg-red-50 text-red-700" },
      { id: "containment", title: "CONTAINMENT (4-24h)", subtitle: "Limiter les degats", icon: Shield, color: "bg-orange-50 text-orange-700" },
      { id: "resolution", title: "RESOLUTION (24-72h)", subtitle: "Corriger le fond", icon: Wrench, color: "bg-amber-50 text-amber-700" },
      { id: "postmortem", title: "POST-MORTEM", subtitle: "Apprendre et prevenir", icon: FileText, color: "bg-emerald-50 text-emerald-700" },
    ],
  },
  deep_search: {
    id: "deep_search", label: "Deep Search", icon: Globe,
    color: { bg: "bg-cyan-100", text: "text-cyan-700", bgLight: "bg-cyan-50", accent: "bg-cyan-400", glow1: "bg-cyan-100/70", glow2: "bg-sky-100/40" },
    stages: [
      { id: "tendances", title: "Tendances", subtitle: "Ou va le marche", icon: TrendingUp, color: "bg-cyan-50 text-cyan-700" },
      { id: "benchmarks", title: "Benchmarks", subtitle: "Qui fait quoi", icon: BarChart3, color: "bg-blue-50 text-blue-700" },
      { id: "pratiques", title: "Meilleures pratiques", subtitle: "Ce qui marche", icon: Star, color: "bg-emerald-50 text-emerald-700" },
      { id: "contre_exemples", title: "Contre-exemples", subtitle: "Ce qui echoue", icon: AlertTriangle, color: "bg-red-50 text-red-700" },
      { id: "donnees", title: "Donnees cles", subtitle: "Chiffres a retenir", icon: Database, color: "bg-indigo-50 text-indigo-700" },
    ],
  },
  challenger: {
    id: "challenger", label: "Challenge", icon: Shield,
    color: { bg: "bg-red-100", text: "text-red-700", bgLight: "bg-red-50", accent: "bg-red-400", glow1: "bg-red-100/70", glow2: "bg-orange-100/40" },
    stages: [
      { id: "hypotheses", title: "Hypotheses cachees", subtitle: "Ce qu'on assume", icon: Eye, color: "bg-amber-50 text-amber-700" },
      { id: "falsification", title: "Tests de falsification", subtitle: "Comment prouver le faux", icon: Search, color: "bg-red-50 text-red-700" },
      { id: "biais", title: "Biais cognitifs", subtitle: "Nos angles morts", icon: Brain, color: "bg-violet-50 text-violet-700" },
      { id: "echec", title: "Scenarii d'echec", subtitle: "Pre-mortem", icon: AlertTriangle, color: "bg-orange-50 text-orange-700" },
      { id: "succes", title: "Conditions de succes", subtitle: "Go/No-Go/Conditionnel", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
    ],
  },
};

// ═══ S117-B: Reflexion Setup Panel (qualification before launch) ═══

function ReflexionSetupPanel({ mode, onLaunch, onCancel }: {
  mode: ModeConfig;
  onLaunch: (participants: string, experts: string[], subject: string) => void;
  onCancel: () => void;
}) {
  const [participants, setParticipants] = useState<"solo" | "duo" | "equipe">("duo");
  const [experts, setExperts] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const { activeBotCode } = useAmorcer();
  const { activeRoster } = useChatContext();

  const ModeIcon = mode.icon;
  const allBots = [
    { code: "CEOB", name: "CarlOS" }, { code: "CTOB", name: "Tim" }, { code: "CFOB", name: "Frank" },
    { code: "CMOB", name: "Mathilde" }, { code: "CSOB", name: "Simone" }, { code: "COOB", name: "Olivier" },
    { code: "CPOB", name: "Paco" }, { code: "CHROB", name: "Helene" }, { code: "CROB", name: "Rich" },
    { code: "CISOB", name: "Sebastien" }, { code: "CLOB", name: "Loulou" }, { code: "CINOB", name: "Ines" },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Hero du mode */}
      <div className="relative rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center px-6 py-5">
        <div className={cn("absolute rounded-full blur-[100px] opacity-60", mode.color.glow1)} style={{ top: "-50%", left: "-10%", width: "50%", height: "200%" }} />
        <div className={cn("absolute rounded-full blur-[80px] opacity-40", mode.color.glow2)} style={{ top: "0%", right: "-5%", width: "30%", height: "150%" }} />
        <div className="relative z-10 flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", mode.color.bg)}>
            <ModeIcon className={cn("h-5 w-5", mode.color.text)} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{mode.label}</h2>
            <p className="text-[10px] text-gray-500">{mode.stages.length} etapes structurees</p>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div>
        <div className="text-[10px] font-bold text-gray-600 mb-1.5">Participants</div>
        <div className="flex gap-1.5">
          {(["solo", "duo", "equipe"] as const).map(p => (
            <button key={p} onClick={() => setParticipants(p)}
              className={cn("flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border text-center cursor-pointer transition-colors",
                participants === p
                  ? `border-${mode.color.text.replace("text-", "")}/30 ${mode.color.bgLight} ${mode.color.text} ring-1 ring-${mode.color.text.replace("text-", "")}/20`
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              )}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Experts */}
      {participants !== "solo" && (
        <div>
          <div className="text-[10px] font-bold text-gray-600 mb-1.5">Expert(s)</div>
          <div className="flex flex-wrap gap-1">
            {allBots.filter(b => b.code !== activeBotCode).map(bot => (
              <button key={bot.code} onClick={() => setExperts(prev => prev.includes(bot.code) ? prev.filter(c => c !== bot.code) : [...prev, bot.code])}
                className={cn("px-2 py-1 rounded-full text-[9px] font-medium border flex items-center gap-1 cursor-pointer transition-colors",
                  experts.includes(bot.code)
                    ? `${mode.color.bgLight} ${mode.color.text} border-${mode.color.text.replace("text-", "")}/30`
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                )}>
                <BotAvatar code={bot.code} size="xs" />
                {bot.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subject */}
      <div>
        <div className="text-[10px] font-bold text-gray-600 mb-1.5">Sujet</div>
        <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onLaunch(participants, experts, subject)}
          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-300 bg-white outline-none"
          placeholder="Decris le sujet a explorer..." />
      </div>

      {/* Stages preview */}
      <div className="flex flex-wrap gap-1">
        {mode.stages.map((s, i) => (
          <span key={s.id} className={cn("px-2 py-0.5 rounded-full text-[8px] font-medium border", s.color, "border-current/20")}>
            {i + 1}. {s.title}
          </span>
        ))}
      </div>

      {/* Launch + Cancel */}
      <div className="flex gap-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 cursor-pointer">
          Annuler
        </button>
        <button onClick={() => onLaunch(participants, experts, subject)}
          className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-bold shadow-sm cursor-pointer transition-colors", mode.color.accent, "hover:opacity-90")}>
          <Zap className="h-3.5 w-3.5" /> Lancer →
        </button>
      </div>
    </div>
  );
}

// ═══ S117-B: Reflexion Flow View (hero + sidebar + animated stages) ═══

function ReflexionFlowView({ mode, flow, workspaceBlocks, onAdvanceStage, onCristallise }: {
  mode: ModeConfig;
  flow: { currentStage: number; results: Record<string, string> };
  workspaceBlocks: import("../core/types").WorkspaceBlock[];
  onAdvanceStage: () => void;
  onCristallise: () => void;
}) {
  const ModeIcon = mode.icon;
  const total = mode.stages.length;
  const current = flow.currentStage;
  const progress = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;
  const activeStage = mode.stages[current] || mode.stages[0];
  const StageIcon = activeStage?.icon || Eye;
  const isLastStage = current >= total - 1;

  // Fade-in for stage content
  const [appeared, setAppeared] = useState(false);
  useEffect(() => {
    setAppeared(false);
    const t = setTimeout(() => setAppeared(true), 80);
    return () => clearTimeout(t);
  }, [current]);

  // Get blocks for current stage
  const stageBlocks = workspaceBlocks.filter(b =>
    b.title?.toLowerCase().includes(activeStage?.title.toLowerCase() || "")
  );

  return (
    <div className="space-y-4">
      {/* Hero compact — mode-colored with progress */}
      <div className="relative w-full rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center px-6 py-4 hover:shadow-md transition-all">
        <div className={cn("absolute rounded-full blur-[100px] opacity-60", mode.color.glow1)} style={{ top: "-50%", left: "-10%", width: "50%", height: "200%" }} />
        <div className={cn("absolute rounded-full blur-[80px] opacity-40", mode.color.glow2)} style={{ top: "0%", right: "-5%", width: "30%", height: "150%" }} />

        <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", mode.color.bg)}>
            <ModeIcon className={cn("h-5 w-5", mode.color.text)} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 truncate">{mode.label}</h2>
            <p className="text-[10px] text-gray-500 truncate">{activeStage?.title}</p>
          </div>
          {/* Pipeline dots */}
          <div className="flex items-center gap-0.5 shrink-0">
            {mode.stages.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full transition-colors",
                  i < current ? "bg-emerald-400" : i === current ? cn(mode.color.accent, "ring-2 ring-white shadow-sm") : "bg-gray-200"
                )} title={s.title} />
                {i < total - 1 && <div className={cn("w-2 h-0.5 mx-0.5", i < current ? "bg-emerald-300" : "bg-gray-200")} />}
              </div>
            ))}
          </div>
          <span className="text-xs font-bold text-gray-500 shrink-0 ml-2">{current + 1}/{total}</span>
        </div>

        {/* Progress bar bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 z-10 rounded-b-xl overflow-hidden">
          <div className={cn("h-full transition-all duration-500 rounded-r-full", mode.color.accent)} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Layout: sidebar + content */}
      <div className="flex gap-4">
        {/* Sidebar stages */}
        <div className="w-[180px] shrink-0 space-y-1">
          {mode.stages.map((s, i) => {
            const SIcon = s.icon;
            const isActive = i === current;
            const isComplete = i < current;
            const isLocked = i > current + 1;
            return (
              <button key={s.id} disabled={isLocked}
                onClick={() => !isLocked && undefined} // stages advance via button, not click
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all",
                  isActive ? cn(mode.color.bgLight, "border shadow-sm", `border-${mode.color.text.replace("text-", "")}/20`) :
                  isComplete ? "hover:bg-gray-50 border border-transparent" :
                  isLocked ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50 border border-transparent"
                )}>
                <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0", s.color)}>
                  {isComplete ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> :
                   isActive ? <SIcon className="h-3.5 w-3.5" /> :
                   <span className="text-[9px] font-bold">{i + 1}</span>}
                </div>
                <div className="min-w-0">
                  <div className={cn("text-[10px] font-bold truncate", isActive ? mode.color.text : "text-gray-700")}>{s.title}</div>
                  <div className="text-[8px] text-gray-400 truncate">{s.subtitle}</div>
                </div>
                {isActive && !isComplete && (
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0 ml-auto" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content area */}
        <div className={cn("flex-1 min-w-0 transition-all duration-200", appeared ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
          {stageBlocks.length > 0 ? (
            <div className="space-y-3">
              {stageBlocks.map(block => (
                <div key={block.id} className={cn("rounded-xl border border-gray-200 bg-white p-4 shadow-sm", activeStage && "border-l-[3px]")}
                  style={activeStage ? { borderLeftColor: `var(--${mode.id}-accent, #60a5fa)` } : undefined}>
                  <div className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.summary || "" }} />
                </div>
              ))}
            </div>
          ) : (
            /* Waiting state */
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3", mode.color.bg)}>
                <StageIcon className={cn("h-5 w-5", mode.color.text)} />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Loader2 className={cn("h-3.5 w-3.5 animate-spin", mode.color.text)} />
                <span className="text-xs font-medium text-gray-600">En attente de la discussion...</span>
              </div>
              <p className="text-[10px] text-gray-400">
                Discutez avec votre equipe pour alimenter l'etape "{activeStage?.title}"
              </p>
            </div>
          )}

          {/* Inter-stage button */}
          <div className="mt-4 flex justify-end">
            {isLastStage ? (
              <button onClick={onCristallise}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 cursor-pointer transition-colors shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5" /> Cristalliser
              </button>
            ) : (
              <button onClick={onAdvanceStage}
                className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-bold cursor-pointer transition-colors shadow-sm", mode.color.accent, "hover:opacity-90")}>
                Suivante: {mode.stages[current + 1]?.title} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ Brainstorm visual: card colors + parsers (pattern AtelierBrainstorm.tsx) ═══

const IDEA_CARD_COLORS = [
  "bg-pink-50 border-pink-200",
  "bg-blue-50 border-blue-200",
  "bg-amber-50 border-amber-200",
  "bg-green-50 border-green-200",
  "bg-purple-50 border-purple-200",
  "bg-cyan-50 border-cyan-200",
  "bg-rose-50 border-rose-200",
  "bg-indigo-50 border-indigo-200",
  "bg-orange-50 border-orange-200",
  "bg-teal-50 border-teal-200",
];

/** Parse individual ideas from a brainstorm API response (bullets/numbered) */
function parseBrainstormIdeas(content: string): { num: number; title: string; desc: string; technique?: string; score?: number }[] {
  const lines = content.split("\n").filter(l => l.trim());
  const ideas: { num: number; title: string; desc: string; technique?: string; score?: number }[] = [];

  for (const line of lines) {
    // Match: "1. [TECHNIQUE] Title — Description. Score: 16/20"
    // or: "1. Title — Description"  or: "• Title — Description"
    const m = line.match(/^\s*(?:(\d+)[.)]\s*|[-*•]\s+)(?:\[([A-ZÉÈÊÀÂ]+(?:\s+[A-ZÉÈÊÀÂ]+)?)\]\s*)?(.+)/);
    if (!m) continue;
    const num = m[1] ? parseInt(m[1]) : ideas.length + 1;
    const technique = m[2] || undefined;
    const rest = m[3];

    // Split title — desc on " — " or " - "
    const dashIdx = rest.search(/\s[—–-]\s/);
    const title = dashIdx > 0 ? rest.substring(0, dashIdx).trim() : rest.substring(0, 80).trim();
    let desc = dashIdx > 0 ? rest.substring(dashIdx + 3).trim() : "";

    // Extract score if present
    const scoreMatch = desc.match(/Score\s*:\s*(\d+)\s*\/\s*20/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : undefined;
    if (scoreMatch) desc = desc.replace(scoreMatch[0], "").replace(/[.,]\s*$/, "").trim();

    ideas.push({ num, title, desc, technique, score });
  }
  return ideas;
}

/** Parse Top 3 from brainstorm stage 3 response */
function parseTop3(content: string): { title: string; why: string; actions: string[] }[] {
  const results: { title: string; why: string; actions: string[] }[] = [];
  // Split by "### N." or just "N." at start of line
  const sections = content.split(/(?=###\s*\d|^\d+[.)]\s)/m).filter(s => s.trim());

  for (const section of sections.slice(0, 3)) {
    const lines = section.split("\n").filter(l => l.trim());
    if (!lines.length) continue;
    const title = lines[0].replace(/^#{1,3}\s*/, "").replace(/^\d+[.)]\s*/, "").replace(/\*\*/g, "").trim();
    if (!title || title.length < 3) continue;
    let why = "";
    const actions: string[] = [];

    for (const line of lines.slice(1)) {
      const l = line.trim();
      if (/^pourquoi\s*:/i.test(l)) {
        why = l.replace(/^pourquoi\s*:\s*/i, "").trim();
      } else if (/^action\s*\d*\s*:/i.test(l)) {
        actions.push(l.replace(/^action\s*\d*\s*:\s*/i, "").trim());
      } else if (/^[-*•]\s/.test(l)) {
        actions.push(l.replace(/^[-*•]\s+/, "").trim());
      }
    }
    results.push({ title, why, actions });
  }
  return results;
}

// ═══ B.1: ThinkingAnimation steps par etape CREDO (pattern primitives.tsx ThinkingAnimation) ═══

const THINKING_STEPS: Record<string, string[]> = {
  C: ["Analyse du contexte", "Identification des enjeux", "Formulation"],
  R: ["Recherche d'insights", "Analyse croisee", "Synthese"],
  E: ["Evaluation des options", "Arguments cles", "Formulation"],
  D: ["Verification des donnees", "Validation logique", "Mise en forme"],
  O: ["Consolidation", "Plan d'action", "Recommandations"],
};

// ═══ B.4: Cascade suggestion border colors (pattern InlineOptions from primitives.tsx) ═══

const SUGGESTION_BORDER_COLORS = ["border-l-blue-500", "border-l-amber-500", "border-l-green-500", "border-l-red-500"];

interface LiveDiscussionViewProps {
  context: string | null;
  onPhaseComplete?: () => void;
}

export function LiveDiscussionView({ context, onPhaseComplete }: LiveDiscussionViewProps) {
  const config = PHASE_CONFIGS["discussion"];
  if (!config) return null;

  return <LiveDiscussionViewInner config={config} context={context} onPhaseComplete={onPhaseComplete} />;
}

function LiveDiscussionViewInner({ config, context, onPhaseComplete }: {
  config: import("./phase-config").PhaseConfig;
  context: string | null;
  onPhaseComplete?: () => void;
}) {
  const isMobile = useIsMobile();
  const {
    chatStage, workflowItems, removeWorkflowItem, getCristallise,
    getCristalliseItem, editCristallise, setPendingCapture, addWorkflowItem,
    activeBotCode, activePhase, setActivePhase, workspaceBlocks, addWorkspaceBlock,
    updateWorkspaceBlock, removeWorkspaceBlock, getBlocksByCredoStep, getBlocksByType,
    addWorkspaceTask,
    reflexionSetup, setReflexionSetup,
    reflexionFlow: ctxReflexionFlow, setReflexionFlow: setCtxReflexionFlow,
    setReflexionContext, setRightSection,
  } = useAmorcer();
  const { sendMessage, messages, isTyping, activeRoster, addBotToRoster, removeBotFromRoster, threads, activeThreadId, currentCREDOPhase } = useChatContext();
  const displayContext = context || "Discussion en cours";
  const blocksEndRef = useRef<HTMLDivElement>(null);

  const [activeStepId, setActiveStepId] = useState<string>(config.steps[0]?.id || "");
  // Hero tab: 3 functional tabs replacing CREDO buttons
  type DiscussionHeroTab = "discussion" | "agents" | "reflexion";
  const [activeHeroTab, setActiveHeroTab] = useState<DiscussionHeroTab>("discussion");
  // W.0: Sous-section active dans le sidebar dynamique
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);
  // W.0: Technique state machine
  const [activeTechnique, setActiveTechnique] = useState<{ id: string; label: string; totalSteps: number } | null>(null);
  const [techniqueStep, setTechniqueStep] = useState(0);
  const [techniqueContext, setTechniqueContext] = useState("");

  // Extract latest cascade suggestions from recent bot messages
  const latestCascadeSuggestions: CascadeSuggestion[] = (() => {
    const botMsgs = messages.filter(m => m.role === "assistant" && m.cascadeSuggestions?.length);
    const last = botMsgs[botMsgs.length - 1];
    return last?.cascadeSuggestions || [];
  })();

  // Zero-Silo — Extract latest consultation suggestions from recent bot messages
  const latestConsultationSuggestions = (() => {
    const botMsgs = messages.filter(m => m.role === "assistant" && m.consultationSuggestions?.length);
    const last = botMsgs[botMsgs.length - 1];
    return last?.consultationSuggestions || [];
  })();

  const [consultLoading, setConsultLoading] = useState<string | null>(null);

  const handleConsultBot = useCallback(async (suggestion: typeof latestConsultationSuggestions[0]) => {
    if (consultLoading) return;
    setConsultLoading(suggestion.consult);

    // Gather last 3 messages as consultation context
    const recentMsgs = messages.slice(-6).map(m =>
      `${m.role === "user" ? "Carl" : (BOT_NAME[m.agent || ""] || m.agent || "Bot")}: ${(m.content || "").substring(0, 300)}`
    ).join("\n");

    try {
      const resp = await api.chatMulti({
        message: messages.filter(m => m.role === "user").pop()?.content || "",
        agents: [suggestion.consult],
        consultation_mode: "consultation",
        consultation_context: recentMsgs,
        primary_agent: activeBotCode,
        workspace_phase: activeStepId,
      });

      if (resp.perspectives?.[0]) {
        const p = resp.perspectives[0];
        const block = p.workspace_block || {
          type: "expert_consultation",
          title: `Consultation ${suggestion.consult_titre}`,
          content: p.contenu,
          source: suggestion.consult,
          source_nom: suggestion.consult_nom,
          source_emoji: suggestion.consult_emoji,
          confidence: 0.85,
        };
        addWorkspaceBlock(block);
      }
    } catch (err) {
      console.error("[CONSULTATION] Error:", err);
    } finally {
      setConsultLoading(null);
    }
  }, [consultLoading, messages, activeBotCode, activeStepId, addWorkspaceBlock]);

  // Derive current CREDO letter from activeStepId
  const currentCredoLetter = activeStepId.includes("comprendre") ? "C"
    : activeStepId.includes("rechercher") ? "R"
    : activeStepId.includes("exposer") ? "E"
    : activeStepId.includes("demontrer") ? "D"
    : activeStepId.includes("objectif") ? "O" : "C";
  const [filterStep, setFilterStep] = useState<string | null>(null); // null = show ALL blocks (flat timeline)
  // Sprint 2A v2: technique panel — clic sidebar → sous-section workspace
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [contentAppeared, setContentAppeared] = useState(false);

  // Fade-in animation on content (pattern FocusReflexionView StepContent)
  useEffect(() => {
    setContentAppeared(false);
    const t = setTimeout(() => setContentAppeared(true), 80);
    return () => clearTimeout(t);
  }, [activeStepId]);

  // Auto-switch vers la derniere etape qui vient de recevoir du contenu
  useEffect(() => {
    const latestWithContent = [...config.steps].reverse().find(s => getCristallise(s.id) !== null);
    if (latestWithContent && latestWithContent.id !== activeStepId) {
      setActiveStepId(latestWithContent.id);
    }
  }, [chatStage]); // eslint-disable-line react-hooks/exhaustive-deps

  // S2.2.2: LoopGuard — detect stagnation on same CREDO step
  const loopGuardRef = useRef({ stage: chatStage, msgCount: 0 });
  const [loopGuardVisible, setLoopGuardVisible] = useState(false);
  useEffect(() => {
    if (chatStage !== loopGuardRef.current.stage) {
      // Stage advanced → reset
      loopGuardRef.current = { stage: chatStage, msgCount: 0 };
      setLoopGuardVisible(false);
    }
  }, [chatStage]);
  useEffect(() => {
    const userMsgCount = messages.filter(m => m.role === "user").length;
    if (chatStage === loopGuardRef.current.stage) {
      loopGuardRef.current.msgCount = userMsgCount;
      if (userMsgCount >= 6 && !loopGuardVisible) {
        setLoopGuardVisible(true);
      }
    }
  }, [messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // S3A.1: Track new blocks for animated entry — skip initial load (800ms grace)
  const animReadyRef = useRef(false);
  const seenBlocksRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const t = setTimeout(() => { animReadyRef.current = true; }, 800);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    workspaceBlocks.forEach(b => seenBlocksRef.current.add(b.id));
  }, [workspaceBlocks]);

  // Auto-scroll vers les nouveaux blocks
  const prevBlockCount = useRef(workspaceBlocks.length);
  useEffect(() => {
    if (workspaceBlocks.length > prevBlockCount.current) {
      blocksEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    prevBlockCount.current = workspaceBlocks.length;
  }, [workspaceBlocks.length]);

  // ═══ Delegation handler — ecoute CustomEvent bt-delegate-task depuis RapportRenderer ═══
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { titre: string; priorite?: string; bot?: string; assignee?: string; blockId?: string };
      if (!detail?.titre) return;
      const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      addWorkspaceTask({
        id: taskId,
        titre: detail.titre,
        priorite: (detail.priorite as "haute" | "moyenne" | "basse") || "moyenne",
        assignedBot: detail.bot || activeBotCode,
        assignedHuman: detail.assignee,
        status: "todo",
        createdFrom: detail.blockId,
        createdAt: Date.now(),
      });
      // Envoyer un message au bot assigne
      const targetBot = detail.bot || activeBotCode;
      sendMessage(`Tache assignee: ${detail.titre}. ${detail.assignee ? `Responsable: ${detail.assignee}.` : ""} Priorite: ${detail.priorite || "moyenne"}.`, targetBot);
    };
    window.addEventListener("bt-delegate-task", handler);
    return () => window.removeEventListener("bt-delegate-task", handler);
  }, [addWorkspaceTask, activeBotCode, sendMessage]);

  // B.1: ThinkingOverlay — uses isTyping from chat hook (same source as DiscussionWindow)
  // Show thinking only when waiting for bot AND bot hasn't started streaming yet
  const isAnyStreaming = messages.some(m => m.isStreaming);
  const isThinking = isTyping && !isAnyStreaming;
  const [currentThinkingStep, setCurrentThinkingStep] = useState(0);
  useEffect(() => {
    if (!isThinking) { setCurrentThinkingStep(0); return; }
    const timer = setInterval(() => {
      setCurrentThinkingStep(prev => prev < 2 ? prev + 1 : prev);
    }, 1200);
    return () => clearInterval(timer);
  }, [isThinking]); // eslint-disable-line react-hooks/exhaustive-deps

  // B.2: Multi-phase consultation detection
  const multiPhaseTargets = [...new Set(latestCascadeSuggestions.map(s => s.view || s.target_section).filter(Boolean))];
  const hasMultiPhaseConsult = multiPhaseTargets.length >= 2;

  // S3B.2: Pulse animation on block when workspace action triggered
  const [pulsingBlockId, setPulsingBlockId] = useState<string | null>(null);

  // Etape 1: Loading state for async block actions (bot thinking bubble visible during full API call)
  const [loadingBlockId, setLoadingBlockId] = useState<string | null>(null);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [loadingBotCode, setLoadingBotCode] = useState<string | null>(null);

  // Etape 4: Filter blocks by participant bot click
  const [filterBotCode, setFilterBotCode] = useState<string | null>(null);

  // Etape 5: Reflexion Flow — multi-stage progressive (replique simulations)
  const [reflexionFlow, setReflexionFlow] = useState<{
    mode: string;
    label: string;
    phase: "intro" | "running" | "done"; // intro = config, running = stages en cours
    stage: number; // result count (0=started, 1=got first, 2=got second, 3=done)
    results: string[];
    context: string;
    isThinking: boolean;
    selectedBots: string[]; // bots qui participent
    focusInput: string; // sujet/focus defini par l'user
    thinkingSteps: string[]; // etapes affichees pendant le thinking (simulation-style)
    error?: string; // message d'erreur visible si API echoue
  } | null>(null);

  // B.3: TypewriterText cursor — visible briefly after new block appears
  const [showTypingCursor, setShowTypingCursor] = useState(false);
  useEffect(() => {
    if (workspaceBlocks.length === 0) return;
    setShowTypingCursor(true);
    const t = setTimeout(() => setShowTypingCursor(false), 3000);
    return () => clearTimeout(t);
  }, [workspaceBlocks.length]);

  // N7 fix: pour blocs non-expert (sendMessage path), effacer le badge loading quand le streaming se termine
  useEffect(() => {
    if (!isTyping && loadingBlockId) {
      const t = setTimeout(() => setLoadingBlockId(null), 800);
      return () => clearTimeout(t);
    }
  }, [isTyping]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeStep = config.steps.find(s => s.id === activeStepId) || config.steps[0];
  const completedCount = config.steps.filter(s => getCristallise(s.id) !== null).length;
  const progress = Math.round((completedCount / config.steps.length) * 100);
  const phaseNotes = workflowItems.filter(w => w.phase === config.key);
  const minRequired = Math.max(1, config.steps.length - 1);
  const col = config.colors;
  const PhaseIcon = config.icon;

  // Filtered blocks for display (by CREDO step + optional bot filter)
  const displayBlocks = (() => {
    let blocks = filterStep ? workspaceBlocks.filter(b => b.credo_step === filterStep) : workspaceBlocks;
    if (filterBotCode) blocks = blocks.filter(b => b.source === filterBotCode);
    return blocks;
  })();

  // Block type counts + dominant bot for sidebar index
  const blockTypeCounts = workspaceBlocks.reduce<Record<string, number>>((acc, b) => {
    acc[b.type] = (acc[b.type] || 0) + 1;
    return acc;
  }, {});
  const blockTypeBots = workspaceBlocks.reduce<Record<string, Set<string>>>((acc, b) => {
    if (!acc[b.type]) acc[b.type] = new Set();
    if (b.source) acc[b.type].add(b.source);
    return acc;
  }, {});

  // Block counts per CREDO step for separators
  const blocksByCredoStep = workspaceBlocks.reduce<Record<string, number>>((acc, b) => {
    acc[b.credo_step] = (acc[b.credo_step] || 0) + 1;
    return acc;
  }, {});

  // Chantier completeness = mecanique interne (pas de UI visible)

  // Handle block actions
  const handleBlockAction = useCallback((action: string, blockId: string) => {
    // Parse effective block ID from composite formats (correct: "id||text")
    const effectiveId = blockId.includes("||") ? blockId.split("||")[0] : blockId;
    const block = workspaceBlocks.find(b => b.id === effectiveId);
    if (!block) return;

    // Expert blocks (sourceType=chat) — route actions to WORKSPACE, not discussion
    const isExpertBlock = block.sourceType === "chat" && block.source;

    // Build team awareness context for expert actions
    const teammates = activeRoster.filter(b => b !== (block.source || activeBotCode)).map(b => `${BOT_NAME[b] || b} (${BOT_ROLE_SHORT[b] || "Expert"})`);
    const teamNote = teammates.length > 0 ? `\n\n[EQUIPE PRESENTE: ${teammates.join(", ")}. Fais reference a tes collegues par nom si pertinent.]` : "";

    switch (action) {
      case "pin":
        addWorkflowItem("discussion", `[${BLOCK_TYPE_LABELS[block.type] || block.type}] ${block.title}: ${block.summary.substring(0, 120)}`, "insight");
        break;
      case "deepen": {
        setPulsingBlockId(blockId);
        setTimeout(() => setPulsingBlockId(null), 1500);
        const targetBot = block.source || activeBotCode;
        setLoadingBlockId(blockId);
        setLoadingLabel("Approfondissement en cours...");
        setLoadingBotCode(targetBot);
        if (isExpertBlock) {
          (async () => {
            try {
              const recentCtx = workspaceBlocks.slice(-3).map(b2 => `[${BOT_NAME[b2.source || ""] || ""}] ${b2.title}: ${(b2.summary || "").substring(0, 150)}`).join("\n");
              const res = await api.chatMulti({
                message: `Approfondir en detail: ${block.title}\n\nContexte: ${block.summary.substring(0, 500)}\n\nContexte recent:\n${recentCtx}${teamNote}`,
                user_id: 1,
                agents: [targetBot],
                primary_agent: targetBot,
                workspace_phase: activePhase,
              });
              const persp = res.perspectives?.[0];
              if (!persp) return;
              const blockType = detectBlockTypeFrontend(persp.contenu);
              addWorkspaceBlock({
                id: `expert-${targetBot}-${Date.now()}`,
                type: blockType,
                title: generateExpertBlockTitle(BOT_NAME[targetBot] || targetBot, persp.contenu, "Approfondissement"),
                summary: persp.contenu,
                structured_data: extractStructuredDataFrontend(persp.contenu, blockType),
                credo_step: block.credo_step,
                credo_sub_section: "experts",
                confidence: 0.8,
                source: targetBot,
                sourceType: "chat",
                timestamp: Date.now(),
                merge_label: "Approfondissement",
              });
            } catch (err) {
              console.error("[Expert deepen] Error:", err);
            } finally {
              setLoadingBlockId(null);
            }
          })();
        } else {
          sendMessage(`Approfondir en detail: ${block.title}\n\nContexte: ${block.summary}`, targetBot);
          // setLoadingBlockId(null) géré par useEffect isTyping (N7 fix)
        }
        break;
      }
      case "challenge": {
        setPulsingBlockId(blockId);
        setTimeout(() => setPulsingBlockId(null), 1500);
        const targetBot2 = block.source || activeBotCode;
        setLoadingBlockId(blockId);
        setLoadingLabel("Challenge en cours...");
        setLoadingBotCode(targetBot2);
        if (isExpertBlock) {
          (async () => {
            try {
              const recentCtx = workspaceBlocks.slice(-3).map(b2 => `[${BOT_NAME[b2.source || ""] || ""}] ${b2.title}: ${(b2.summary || "").substring(0, 150)}`).join("\n");
              const res = await api.chatMulti({
                message: `Challenge cet element, trouve les failles: ${block.title}\n\n${block.summary.substring(0, 500)}\n\nContexte recent:\n${recentCtx}${teamNote}`,
                user_id: 1,
                agents: [targetBot2],
                primary_agent: targetBot2,
                workspace_phase: activePhase,
              });
              const persp = res.perspectives?.[0];
              if (!persp) return;
              const blockType = detectBlockTypeFrontend(persp.contenu);
              addWorkspaceBlock({
                id: `expert-${targetBot2}-${Date.now()}`,
                type: blockType,
                title: generateExpertBlockTitle(BOT_NAME[targetBot2] || targetBot2, persp.contenu, "Challenge"),
                summary: persp.contenu,
                structured_data: extractStructuredDataFrontend(persp.contenu, blockType),
                credo_step: block.credo_step,
                credo_sub_section: "experts",
                confidence: 0.8,
                source: targetBot2,
                sourceType: "chat",
                timestamp: Date.now(),
                merge_label: "Challenge",
              });
            } catch (err) {
              console.error("[Expert challenge] Error:", err);
            } finally {
              setLoadingBlockId(null);
            }
          })();
        } else {
          sendMessage(`Challenge cet element, trouve les failles: ${block.title}\n\n${block.summary}`, targetBot2);
          // setLoadingBlockId(null) géré par useEffect isTyping (N7 fix)
        }
        break;
      }
      case "rework": {
        setPulsingBlockId(blockId);
        setTimeout(() => setPulsingBlockId(null), 1500);
        const targetBot3 = block.source || activeBotCode;
        setLoadingBlockId(blockId);
        setLoadingLabel("Retravail en cours...");
        setLoadingBotCode(targetBot3);
        if (isExpertBlock) {
          (async () => {
            try {
              const recentCtx = workspaceBlocks.slice(-3).map(b2 => `[${BOT_NAME[b2.source || ""] || ""}] ${b2.title}: ${(b2.summary || "").substring(0, 150)}`).join("\n");
              const res = await api.chatMulti({
                message: `Retravaille et enrichis: ${block.title}\n\n${block.summary.substring(0, 500)}\n\nContexte recent:\n${recentCtx}${teamNote}`,
                user_id: 1,
                agents: [targetBot3],
                primary_agent: targetBot3,
                workspace_phase: activePhase,
              });
              const persp = res.perspectives?.[0];
              if (!persp) return;
              const blockType = detectBlockTypeFrontend(persp.contenu);
              addWorkspaceBlock({
                id: `expert-${targetBot3}-${Date.now()}`,
                type: blockType,
                title: generateExpertBlockTitle(BOT_NAME[targetBot3] || targetBot3, persp.contenu, "Retravail"),
                summary: persp.contenu,
                structured_data: extractStructuredDataFrontend(persp.contenu, blockType),
                credo_step: block.credo_step,
                credo_sub_section: "experts",
                confidence: 0.8,
                source: targetBot3,
                sourceType: "chat",
                timestamp: Date.now(),
                merge_label: "Retravail",
              });
            } catch (err) {
              console.error("[Expert rework] Error:", err);
            } finally {
              setLoadingBlockId(null);
            }
          })();
        } else {
          sendMessage(`Retravaille et enrichis: ${block.title}\n\n${block.summary}`, targetBot3);
          // setLoadingBlockId(null) géré par useEffect isTyping (N7 fix)
        }
        break;
      }
      case "execute_action": {
        try {
          const action = JSON.parse(blockId) as { label: string; prompt: string; target_bot: string };
          const targetBot4 = action.target_bot || activeBotCode;
          setLoadingBlockId("pending-action");
          setLoadingLabel(action.label + "...");
          setLoadingBotCode(targetBot4);
          (async () => {
            try {
              const recentCtx = workspaceBlocks.slice(-3).map(b2 => `[${BOT_NAME[b2.source || ""] || ""}] ${b2.title}: ${(b2.summary || "").substring(0, 150)}`).join("\n");
              const res = await api.chatMulti({
                message: `${action.prompt}\n\nContexte recent:\n${recentCtx}`,
                user_id: 1,
                agents: [targetBot4],
                primary_agent: targetBot4,
                workspace_phase: activePhase,
              });
              const persp = res.perspectives?.[0];
              if (!persp) return;
              const blockType = detectBlockTypeFrontend(persp.contenu);
              addWorkspaceBlock({
                id: `action-${targetBot4}-${Date.now()}`,
                type: blockType,
                title: generateExpertBlockTitle(BOT_NAME[targetBot4] || targetBot4, persp.contenu, action.label),
                summary: persp.contenu,
                structured_data: extractStructuredDataFrontend(persp.contenu, blockType),
                credo_step: (workspaceBlocks[0]?.credo_step || "C") as "C" | "R" | "E" | "D" | "O",
                credo_sub_section: "experts",
                confidence: 0.75,
                source: targetBot4,
                sourceType: "chat",
                timestamp: Date.now(),
                is_action_result: true,
                merge_label: action.label,
              });
            } catch (err) {
              console.error("[Action execute] Error:", err);
            } finally {
              setLoadingBlockId(null);
            }
          })();
        } catch {
          console.error("[Action execute] Invalid JSON blockId");
          setLoadingBlockId(null);
        }
        break;
      }
      case "correct": {
        // blockId format: "actualBlockId||correctionText"
        const [actualId, correctionText] = blockId.split("||");
        const targetBlock = workspaceBlocks.find(b => b.id === actualId);
        if (!targetBlock || !correctionText) break;
        const targetBotC = targetBlock.source || activeBotCode;
        setPulsingBlockId(actualId);
        setTimeout(() => setPulsingBlockId(null), 1500);
        setLoadingBlockId(actualId);
        setLoadingLabel("Correction en cours...");
        setLoadingBotCode(targetBotC);
        (async () => {
          try {
            const res = await api.chatMulti({
              message: `Correction demandee sur ton analyse "${targetBlock.title}":\n\n${correctionText}\n\nContexte original: ${targetBlock.summary.substring(0, 200)}${teamNote}`,
              user_id: 1,
              agents: [targetBotC],
              primary_agent: targetBotC,
              workspace_phase: activePhase,
            });
            const persp = res.perspectives?.[0];
            if (!persp) return;
            const blockType = detectBlockTypeFrontend(persp.contenu);
            addWorkspaceBlock({
              id: `expert-${targetBotC}-${Date.now()}`,
              type: blockType,
              title: generateExpertBlockTitle(BOT_NAME[targetBotC] || targetBotC, persp.contenu, "Correction"),
              summary: persp.contenu,
              structured_data: extractStructuredDataFrontend(persp.contenu, blockType),
              credo_step: targetBlock.credo_step,
              credo_sub_section: "experts",
              confidence: 0.85,
              source: targetBotC,
              sourceType: "chat",
              timestamp: Date.now(),
              merge_label: "Correction",
            });
          } catch (err) {
            console.error("[Expert correct] Error:", err);
          } finally {
            setLoadingBlockId(null);
          }
        })();
        break;
      }
      case "edit": {
        // Modifier = retravail dirigé — même pipeline que rework
        setPulsingBlockId(effectiveId);
        setTimeout(() => setPulsingBlockId(null), 1500);
        const targetBotEdit = block.source || activeBotCode;
        setLoadingBlockId(effectiveId);
        setLoadingLabel("Modification en cours...");
        setLoadingBotCode(targetBotEdit);
        if (block.sourceType === "chat" && block.source) {
          (async () => {
            try {
              const recentCtx = workspaceBlocks.slice(-3).map(b2 => `[${BOT_NAME[b2.source || ""] || ""}] ${b2.title}: ${(b2.summary || "").substring(0, 150)}`).join("\n");
              const res = await api.chatMulti({
                message: `Modifie et améliore ce point: ${block.title}\n\n${block.summary.substring(0, 500)}\n\nContexte recent:\n${recentCtx}${teamNote}`,
                user_id: 1,
                agents: [targetBotEdit],
                primary_agent: targetBotEdit,
                workspace_phase: activePhase,
              });
              const persp = res.perspectives?.[0];
              if (!persp) return;
              const blockType = detectBlockTypeFrontend(persp.contenu);
              addWorkspaceBlock({
                id: `expert-${targetBotEdit}-${Date.now()}`,
                type: blockType,
                title: generateExpertBlockTitle(BOT_NAME[targetBotEdit] || targetBotEdit, persp.contenu, "Modification"),
                summary: persp.contenu,
                structured_data: extractStructuredDataFrontend(persp.contenu, blockType),
                credo_step: block.credo_step,
                credo_sub_section: "experts",
                confidence: 0.8,
                source: targetBotEdit,
                sourceType: "chat",
                timestamp: Date.now(),
                merge_label: "Modification",
              });
            } catch (err) {
              console.error("[Expert edit] Error:", err);
            } finally {
              setLoadingBlockId(null);
            }
          })();
        } else {
          sendMessage(`Modifie et améliore: ${block.title}\n\n${block.summary}`, targetBotEdit);
          // setLoadingBlockId(null) géré par useEffect isTyping (N7 fix)
        }
        break;
      }
      case "delete":
        removeWorkspaceBlock(blockId);
        break;
    }
  }, [workspaceBlocks, addWorkflowItem, sendMessage, activeBotCode, removeWorkspaceBlock, activePhase, addWorkspaceBlock, activeRoster]);

  // Reflexion tool click handler
  // ═══ REFLEXION/TECHNIQUE → WORKSPACE ONLY (JAMAIS dans la discussion) ═══
  // Les modes de réflexion et techniques envoient via chatMulti et créent des blocs workspace.
  // Le prompt n'apparaît JAMAIS dans la zone discussion.
  const handleReflexionSend = useCallback(async (prompt: string) => {
    try {
      const res = await api.chatMulti({
        message: prompt, user_id: 1,
        agents: [activeBotCode], primary_agent: activeBotCode,
        workspace_phase: "reflexion",
      });
      const persp = res.perspectives?.[0];
      if (!persp) return;
      const blockType = detectBlockTypeFrontend(persp.contenu);
      addWorkspaceBlock({
        id: `reflexion-hub-${Date.now()}`,
        type: blockType,
        title: generateExpertBlockTitle(BOT_NAME[activeBotCode] || activeBotCode, persp.contenu, "Réflexion"),
        summary: persp.contenu,
        structured_data: extractStructuredDataFrontend(persp.contenu, blockType),
        credo_step: currentCredoLetter as "C" | "R" | "E" | "D" | "O",
        credo_sub_section: "modes-reflexion",
        confidence: 0.75,
        source: activeBotCode,
        sourceType: "chat",
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error("[ReflexionSend] Error routing to workspace:", err);
    }
  }, [activeBotCode, addWorkspaceBlock, currentCredoLetter]);

  // Technique metadata handler — routes to workspace via chatMulti (JAMAIS dans discussion)
  const handleSendWithMeta = useCallback(async (prompt: string, meta: { techniqueActive: string; techniqueStep: number; techniqueContext: string }) => {
    try {
      const res = await api.chatMulti({
        message: prompt, user_id: 1,
        agents: [activeBotCode], primary_agent: activeBotCode,
        workspace_phase: "reflexion",
      });
      const persp = res.perspectives?.[0];
      if (!persp) return;
      const blockType = detectBlockTypeFrontend(persp.contenu);
      addWorkspaceBlock({
        id: `technique-${meta.techniqueActive}-${meta.techniqueStep}-${Date.now()}`,
        type: blockType,
        title: generateExpertBlockTitle(BOT_NAME[activeBotCode] || activeBotCode, persp.contenu, `${meta.techniqueActive} (${meta.techniqueStep + 1})`),
        summary: persp.contenu,
        structured_data: extractStructuredDataFrontend(persp.contenu, blockType),
        credo_step: currentCredoLetter as "C" | "R" | "E" | "D" | "O",
        credo_sub_section: "modes-reflexion",
        confidence: 0.75,
        source: activeBotCode,
        sourceType: "chat",
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error("[TechniqueSend] Error routing to workspace:", err);
    }
  }, [activeBotCode, addWorkspaceBlock, currentCredoLetter]);

  // CREDO step labels
  const CREDO_LABELS: Record<string, string> = { C: "Comprendre", R: "Rechercher", E: "Exposer", D: "Demontrer", O: "Objectif" };

  // ═══ Etape 5: Reflexion Flow runner + crystallizer (pattern simulations) ═══

  // Thinking step labels par mode (simulation-style: montre les etapes en cours)
  const REFLEXION_THINKING_STEPS: Record<string, string[][]> = {
    brainstorm: [
      ["Activation des axes creatifs...", "Exploration des possibilites...", "Generation des idees..."],
      ["Application SCAMPER...", "Combinaison des concepts...", "Enrichissement..."],
      ["Selection des meilleures idees...", "Structuration du plan...", "Synthese finale..."],
    ],
    analyse: [
      ["Collecte des signaux...", "Identification des enjeux...", "Diagnostic initial..."],
      ["Recherche des causes racines...", "Methode 5 Pourquoi...", "Mapping parties prenantes..."],
      ["Synthese des recommandations...", "Priorisation des actions...", "Plan de mise en oeuvre..."],
    ],
    debat: [
      ["Construction des arguments...", "Recherche de donnees...", "Structuration position..."],
      ["Exploration des contre-arguments...", "Identification failles...", "Avocat du diable..."],
      ["Pesee des positions...", "Recherche de compromis...", "Verdict final..."],
    ],
    strategie: [
      ["Analyse forces/faiblesses...", "Scan opportunites...", "Evaluation menaces..."],
      ["Formulation option A...", "Formulation option B...", "Formulation option C..."],
      ["Comparaison des options...", "Calcul risque/recompense...", "Recommandation..."],
    ],
    decision: [
      ["Identification des criteres...", "Ponderation relative...", "Grille de decision..."],
      ["Evaluation option par option...", "Scoring multicritere...", "Matrice comparaison..."],
      ["Analyse finale...", "Verdict...", "Plan d'action immediat..."],
    ],
    innovation: [
      ["Scan des innovations...", "Analogies inter-industries...", "Patterns disruptifs..."],
      ["Disruption radicale...", "Pensee 10x...", "Scenarios alternatifs..."],
      ["Prototype conceptuel...", "Faisabilite...", "Vision finale..."],
    ],
  };

  const runReflexionStage = useCallback(async (mode: string, stageIdx: number, ctx: string, prevResults: string[], bots: string[]) => {
    const prompts = REFLEXION_STAGE_PROMPTS[mode];
    if (!prompts?.[stageIdx]) return;

    // Set thinking state with simulation-style steps
    const steps = REFLEXION_THINKING_STEPS[mode]?.[stageIdx] || ["Reflexion en cours...", "Analyse...", "Structuration..."];
    setReflexionFlow(prev => prev ? { ...prev, isThinking: true, thinkingSteps: steps } : null);

    const prevText = prevResults.join("\n\n---\n\n");
    const prompt = prompts[stageIdx].replace("{context}", ctx).replace("{prev}", prevText);

    // Pick which bot answers this stage (rotate through selected bots)
    const stageBotCode = bots && bots.length > 0 ? bots[stageIdx % bots.length] : activeBotCode;

    try {
      const recentCtx = workspaceBlocks.slice(-3).map(b => `[${BOT_NAME[b.source || ""] || ""}] ${b.title}: ${(b.summary || "").substring(0, 150)}`).join("\n");

      // Enhanced prompt: ask for structured output
      const structuredInstruction = "\n\nIMPORTANT: Structure ta reponse avec des titres en **gras**, des listes numerotees, et une conclusion claire. Sois precis et actionnable (minimum 200 mots).";

      const res = await api.chatMulti({
        message: `${prompt}\n\nContexte workspace:\n${recentCtx}${structuredInstruction}`,
        user_id: 1,
        agents: [stageBotCode],
        primary_agent: stageBotCode,
        workspace_phase: "reflexion",
      });

      const content = res.perspectives?.[0]?.contenu || "";
      setReflexionFlow(prev => {
        if (!prev) return null;
        const newResults = [...prev.results, content];
        const isDone = newResults.length >= 3;
        return {
          ...prev,
          stage: newResults.length,
          results: newResults,
          isThinking: false,
          phase: isDone ? "done" : "running",
        };
      });
    } catch (err) {
      console.error("[ReflexionFlow] Error at stage", stageIdx, err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setReflexionFlow(prev => prev ? { ...prev, isThinking: false, error: `Erreur: ${errMsg}` } : null);
    }
  }, [activeBotCode, workspaceBlocks]);

  const finalizeReflexionFlow = useCallback(() => {
    if (!reflexionFlow) return;
    // Create ONE merged workspace block with all 3 stages as sections
    const allContent = reflexionFlow.results.map((content, i) => {
      const stageLabels = REFLEXION_STAGE_LABELS[reflexionFlow.mode] || REFLEXION_STAGE_LABELS.analyse;
      return `**${stageLabels[i]}**\n\n${content}`;
    }).join("\n\n━━━━━━━━━━━━━━━\n\n");

    const botName = BOT_NAME[activeBotCode] || "CarlOS";
    addWorkspaceBlock({
      id: `reflexion-${reflexionFlow.mode}-${Date.now()}`,
      type: detectBlockTypeFrontend(allContent) as any,
      title: generateExpertBlockTitle(botName, allContent, reflexionFlow.label),
      summary: allContent,
      credo_step: currentCredoLetter as "C" | "R" | "E" | "D" | "O",
      credo_sub_section: "modes-reflexion",
      confidence: 0.85,
      source: activeBotCode,
      sourceType: "chat",
      timestamp: Date.now(),
    });
    setReflexionFlow(null);
  }, [reflexionFlow, activeBotCode, addWorkspaceBlock, currentCredoLetter]);

  // Hero tab: toggle bot in roster → workspace (not discussion)
  const [rosterLoadingBots, setRosterLoadingBots] = useState<Set<string>>(new Set());
  const handleToggleBot = useCallback(async (code: string) => {
    if (activeRoster.includes(code)) {
      removeBotFromRoster(code);
      return;
    }
    // Add to roster (state tracking for UI checkmarks)
    addBotToRoster(code);
    // Create workspace block via chatMulti (same pattern as SuggestedExpertsPanel)
    if (rosterLoadingBots.has(code)) return;
    setRosterLoadingBots(prev => new Set([...prev, code]));
    // Insert catching-up skeleton block while API loads
    const tempId = `catching-up-${code}-${Date.now()}`;
    addWorkspaceBlock({
      id: tempId,
      type: "catching_up",
      title: `${BOT_NAME[code] || code} prend connaissance...`,
      summary: "Analyse de la discussion en cours...",
      structured_data: {},
      credo_step: currentCredoLetter as "C" | "R" | "E" | "D" | "O",
      credo_sub_section: "experts",
      confidence: 0.5,
      source: code,
      sourceType: "chat",
      timestamp: Date.now(),
      is_catching_up: true,
    });
    try {
      const lastUserMsg = messages.filter((m: any) => m.role === "user").pop()?.content || "";
      const lastBotMsg = messages.filter((m: any) => m.role === "assistant" && m.content).pop()?.content || "";
      const recentCtx = workspaceBlocks.slice(-3).map(b => `[${BOT_NAME[b.source || ""] || ""}] ${b.title}: ${(b.summary || "").substring(0, 150)}`).join("\n");
      // Build team context so bot knows about colleagues in the discussion
      const rosterWithNew = [...new Set([...activeRoster, code])];
      const teammates = rosterWithNew.filter(b => b !== code).map(b => `${BOT_NAME[b] || b} (${BOT_ROLE_SHORT[b] || "Expert"})`);
      const teamNote = teammates.length > 0
        ? `\n\n[EQUIPE PRESENTE: ${teammates.join(", ")}. Tu rejoins cette discussion d'equipe. Tu peux faire reference a tes collegues par nom et role.]`
        : "";
      const context = lastUserMsg || lastBotMsg
        ? `Question: ${lastUserMsg}\n\nAnalyse en cours: ${lastBotMsg.substring(0, 500)}\n\nContexte recent:\n${recentCtx}${teamNote}`
        : `Présente brièvement (3-4 phrases max) ce que tu peux apporter dans cette discussion, basé sur ton expertise. Sois direct et concis. Propose 2-3 pistes concrètes.${teamNote}`;

      const res = await api.chatMulti({
        message: context,
        user_id: 1,
        agents: [code],
        primary_agent: code,
        workspace_phase: activePhase,
      });

      const persp = res.perspectives?.[0];
      if (persp) {
        const blockType = detectBlockTypeFrontend(persp.contenu);
        addWorkspaceBlock({
          id: `roster-${code}-${Date.now()}`,
          type: blockType,
          title: generateExpertBlockTitle(BOT_NAME[code] || code, persp.contenu, "Consultation"),
          summary: persp.contenu,
          merge_label: "Expert",
          structured_data: extractStructuredDataFrontend(persp.contenu, blockType),
          credo_step: currentCredoLetter as "C" | "R" | "E" | "D" | "O",
          credo_sub_section: "experts",
          confidence: 0.7,
          source: code,
          sourceType: "chat",
          timestamp: Date.now(),
          replace_block_id: tempId,
        });
      } else {
        removeWorkspaceBlock(tempId);
      }
    } catch (err) {
      console.error("[RosterAdd] Error adding expert to workspace:", err);
      removeWorkspaceBlock(tempId);
    } finally {
      setRosterLoadingBots(prev => { const s = new Set(prev); s.delete(code); return s; });
    }
  }, [activeRoster, addBotToRoster, removeBotFromRoster, messages, workspaceBlocks, addWorkspaceBlock, removeWorkspaceBlock, activePhase, currentCredoLetter, rosterLoadingBots]);

  // W.0: Reset sub-section when CREDO step changes + sync filterStep
  useEffect(() => {
    setActiveSubSection(null);
    setActiveTechnique(null);
    setFilterStep(null);
  }, [activeStepId, currentCredoLetter]);

  // W.0: Technique handlers
  const startTechnique = useCallback((id: string, label: string, totalSteps: number) => {
    setActiveTechnique({ id, label, totalSteps });
    setTechniqueStep(0);
    setTechniqueContext("");
    const ctx = messages.filter(m => m.role === "assistant" && m.content).pop()?.content?.substring(0, 200) || "";
    sendMessage(ctx, activeBotCode, undefined, {
      workspacePhase: `discussion_${activeStepId.split("-").pop()}`,
      techniqueActive: id,
      techniqueStep: 0,
      techniqueContext: "",
    });
  }, [messages, activeBotCode, sendMessage, activeStepId]);

  const handleNextTechStep = useCallback(() => {
    if (!activeTechnique) return;
    const nextStep = techniqueStep + 1;
    if (nextStep >= activeTechnique.totalSteps) {
      setActiveTechnique(null);
      return;
    }
    setTechniqueStep(nextStep);
    const lastResult = messages.filter(m => m.role === "assistant").pop()?.content || "";
    const newContext = techniqueContext + "\n---\n" + lastResult;
    setTechniqueContext(newContext);
    sendMessage("Continue", activeBotCode, undefined, {
      workspacePhase: `discussion_${activeStepId.split("-").pop()}`,
      techniqueActive: activeTechnique.id,
      techniqueStep: nextStep,
      techniqueContext: newContext,
    });
  }, [activeTechnique, techniqueStep, techniqueContext, messages, activeBotCode, sendMessage, activeStepId]);

  // W.0: Sub-section block matching (simplified — matches new phase-config sub-sections)
  const blockMatchesSubSection = useCallback((block: import("../core/types").WorkspaceBlock, subSection: string): boolean => {
    if (subSection === "experts") return !!block.source && block.source !== activeBotCode;
    if (subSection === "deep-search") return block.type === "deep_search";
    if (subSection === "modes-reflexion") return ["libre", "debat", "decision", "crise", "challenge", "brainstorm", "scamper", "5pourquoi"].includes(block.type);
    if (subSection === "situation") return !block.source || block.source === activeBotCode; // all primary bot blocks in C
    if (subSection === "analyses") return ["diagnostic", "etat_des_lieux", "risques", "benchmark", "metriques"].includes(block.type);
    if (subSection === "solutions") return ["recommandations", "brainstorm", "libre"].includes(block.type);
    if (subSection === "comparaison") return ["benchmark", "metriques"].includes(block.type);
    if (subSection === "plan-action") return ["plan_action", "taches", "timeline", "budget"].includes(block.type);
    if (subSection === "ressources") return ["budget", "metriques"].includes(block.type);
    if (subSection === "decisions") return ["decision", "synthese"].includes(block.type);
    if (subSection === "plan-match") return ["plan_action", "synthese", "rapport"].includes(block.type);
    return true;
  }, [activeBotCode]);

  // W.0: Filtered blocks based on active sub-section
  const filteredBlocksBySubSection = activeSubSection
    ? workspaceBlocks.filter(b => b.credo_step === currentCredoLetter && blockMatchesSubSection(b, activeSubSection))
    : workspaceBlocks;

  // S117-B: Reflexion mode handlers
  const handleReflexionLaunch = useCallback((participants: string, experts: string[], subject: string) => {
    if (!reflexionSetup) return;
    const modeConfig = MODE_CONFIGS[reflexionSetup.mode];
    if (!modeConfig) return;
    const subjectText = subject.trim() || "la discussion en cours";
    // Add experts to roster
    experts.forEach(code => {
      if (!activeRoster.includes(code)) addBotToRoster(code);
    });
    // Set phase + context
    setActivePhase("reflexion" as any);
    setReflexionContext(subjectText);
    setRightSection(null);
    // Start reflexion flow
    setCtxReflexionFlow({
      mode: reflexionSetup.mode,
      stages: modeConfig.stages.map(s => ({ id: s.id, title: s.title, subtitle: s.subtitle })),
      currentStage: 0,
      results: {},
    });
    // Send prompt
    const stagePrompts = REFLEXION_STAGE_PROMPTS[reflexionSetup.mode];
    const prompt = stagePrompts?.[0]?.replace("{context}", subjectText) ||
      `Lance une reflexion ${modeConfig.label} sur: ${subjectText}`;
    sendMessage(prompt, activeBotCode);
    setReflexionSetup(null);
  }, [reflexionSetup, activeRoster, addBotToRoster, setActivePhase, setReflexionContext, setRightSection, setCtxReflexionFlow, sendMessage, activeBotCode, setReflexionSetup]);

  const handleAdvanceStage = useCallback(() => {
    if (!ctxReflexionFlow) return;
    const next = ctxReflexionFlow.currentStage + 1;
    const modeConfig = MODE_CONFIGS[ctxReflexionFlow.mode];
    if (!modeConfig || next >= modeConfig.stages.length) return;
    setCtxReflexionFlow({ ...ctxReflexionFlow, currentStage: next });
    // Send next stage prompt
    const stagePrompts = REFLEXION_STAGE_PROMPTS[ctxReflexionFlow.mode];
    const prompt = stagePrompts?.[next]?.replace("{context}", displayContext).replace("{prev}", "") ||
      `Continue l'etape: ${modeConfig.stages[next]?.title}`;
    sendMessage(prompt, activeBotCode);
  }, [ctxReflexionFlow, setCtxReflexionFlow, displayContext, sendMessage, activeBotCode]);

  const handleCristallise = useCallback(() => {
    setCtxReflexionFlow(null);
    setActivePhase("discussion" as any);
  }, [setCtxReflexionFlow, setActivePhase]);

  // S117-B: If reflexion setup is active, show setup panel
  if (reflexionSetup) {
    const modeConfig = MODE_CONFIGS[reflexionSetup.mode];
    if (modeConfig) {
      return (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <ReflexionSetupPanel
            mode={modeConfig}
            onLaunch={handleReflexionLaunch}
            onCancel={() => setReflexionSetup(null)}
          />
        </div>
      );
    }
  }

  // S117-B: If reflexion flow is active, show animated flow view
  if (ctxReflexionFlow) {
    const modeConfig = MODE_CONFIGS[ctxReflexionFlow.mode];
    if (modeConfig) {
      return (
        <div className="max-w-4xl mx-auto px-6 py-4 pb-12">
          <ReflexionFlowView
            mode={modeConfig}
            flow={ctxReflexionFlow}
            workspaceBlocks={workspaceBlocks}
            onAdvanceStage={handleAdvanceStage}
            onCristallise={handleCristallise}
          />
        </div>
      );
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 pb-12 space-y-4">

      {/* HERO COMPACT — blur gradients + CREDO buttons integres */}
      <div className="relative w-full rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center px-6 py-4 hover:shadow-md transition-all">
        {/* Blurred gradient orbs — exact simulation pattern */}
        <div className="absolute rounded-full blur-[100px] opacity-60 bg-sky-100/70" style={{ top: "-50%", left: "-10%", width: "50%", height: "200%" }} />
        <div className="absolute rounded-full blur-[80px] opacity-40 bg-blue-100/40" style={{ top: "0%", right: "-5%", width: "30%", height: "150%" }} />

        <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", col.hero.iconBg)}>
            <PhaseIcon className={cn("h-5 w-5", col.hero.iconText)} />
          </div>
          {(() => {
            const currentThread = threads?.find((t: any) => t.id === activeThreadId);
            const userMsgCount = messages.filter(m => m.role === "user").length;
            const fmtDate = (d?: string) => {
              if (!d) return "";
              try { return new Intl.DateTimeFormat("fr-CA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d)); }
              catch { return ""; }
            };
            return (
              <>
                {/* Gauche: titre + échanges */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-gray-900 truncate">
                    {currentThread?.title || displayContext || "Discussion"}
                  </h2>
                  <span className="text-[10px] text-gray-400">
                    {userMsgCount} échange{userMsgCount !== 1 ? "s" : ""}
                  </span>
                </div>
                {/* Droite: CREDO dots + date */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-1">
                    {([
                      { key: "C" as const, dot: "bg-sky-500" },
                      { key: "R" as const, dot: "bg-violet-500" },
                      { key: "E" as const, dot: "bg-amber-500" },
                      { key: "D" as const, dot: "bg-emerald-500" },
                      { key: "O" as const, dot: "bg-red-500" },
                    ]).map(phase => {
                      const hasBlocks = (blocksByCredoStep[phase.key] || 0) > 0;
                      const isCurrent = phase.key === currentCredoLetter;
                      return (
                        <div key={phase.key} className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors",
                          hasBlocks ? cn(phase.dot, "text-white")
                          : isCurrent ? cn(phase.dot, "opacity-60 text-white animate-pulse")
                          : "bg-gray-200 text-gray-400"
                        )} title={phase.key}>
                          {phase.key}
                        </div>
                      );
                    })}
                  </div>
                  {currentThread?.createdAt && (
                    <span className="text-[11px] font-bold text-gray-600">{fmtDate(currentThread.createdAt)}</span>
                  )}
                </div>
              </>
            );
          })()}
        </div>

        {/* Hero tabs removed — agents/modes now in ControlPanel toolbar */}

        {/* Progress bar — thin accent at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 z-10 rounded-b-xl overflow-hidden">
          <div
            className={cn("h-full transition-all duration-500 rounded-r-full", progress === 100 ? "bg-emerald-400" : "bg-sky-400")}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Titre retiré — déjà dans le hero compact */}

      {/* GPS Banner — removed (D-116: CREDO alerts were distracting) */}

      {/* CONTENU — sidebar + main area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* S117 Phase 2: CredoNav + BotFilter sidebar — desktop only, hidden when <=1 bot */}
        {!isMobile && (() => {
          const participatingBots = [...new Set([
            ...workspaceBlocks.map(b => b.source).filter(Boolean) as string[],
            ...activeRoster,
          ])];
          const botCounts = workspaceBlocks.reduce<Record<string, number>>((acc, b) => {
            if (b.source) acc[b.source] = (acc[b.source] || 0) + 1;
            return acc;
          }, {});
          const sortedBots = [...participatingBots].sort((a, b) => {
            if (a === activeBotCode) return -1;
            if (b === activeBotCode) return 1;
            return (botCounts[b] || 0) - (botCounts[a] || 0);
          });
          const CREDO_NAV = [
            { key: "C" as const, label: "Comprendre", dot: "bg-sky-500", bg: "bg-sky-50", text: "text-sky-700" },
            { key: "R" as const, label: "Rechercher", dot: "bg-violet-500", bg: "bg-violet-50", text: "text-violet-700" },
            { key: "E" as const, label: "Exposer", dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
            { key: "D" as const, label: "Demontrer", dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
            { key: "O" as const, label: "Objectif", dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700" },
          ];
          // Sidebar toujours visible — l'agent primaire est toujours present
          return (
            <div className="w-[180px] shrink-0 border-r border-gray-100 py-2 overflow-y-auto scrollbar-thin flex flex-col gap-3">
              {/* Section 1: Bot filter */}
              {sortedBots.length >= 1 && (
                <div className="space-y-1 px-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-2">Participants</span>
                  <button onClick={() => setFilterBotCode(null)}
                    className={cn("w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg transition-colors cursor-pointer",
                      !filterBotCode ? "bg-sky-50 text-sky-700 font-semibold" : "text-gray-500 hover:bg-gray-50")}>
                    <span>Tous</span>
                    <span className="ml-auto text-[10px] text-gray-400">{workspaceBlocks.length}</span>
                  </button>
                  {sortedBots.map(botCode => {
                    const count = botCounts[botCode] || 0;
                    const isLead = botCode === activeBotCode;
                    return (
                      <button key={botCode} onClick={() => setFilterBotCode(botCode === filterBotCode ? null : botCode)}
                        className={cn("w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg transition-colors cursor-pointer",
                          filterBotCode === botCode ? "bg-sky-50 text-sky-700 font-semibold ring-1 ring-sky-200" : "text-gray-600 hover:bg-gray-50")}>
                        <BotAvatar code={botCode} size="sm" />
                        <div className="flex flex-col items-start min-w-0 flex-1">
                          <span className="truncate text-[11px]">{BOT_NAME[botCode] || botCode}</span>
                          {isLead && <span className="text-[8px] font-bold uppercase tracking-wider text-sky-500">LEAD</span>}
                        </div>
                        {count > 0 && <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                          filterBotCode === botCode ? "bg-sky-200 text-sky-800" : "bg-gray-100 text-gray-500")}>{count}</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Section 2: CREDO navigation */}
              {workspaceBlocks.length > 0 && (
                <div className="space-y-1 px-1">
                  <div className="border-t border-gray-100 mx-1 mb-1" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-2">Étapes CREDO</span>
                  <button onClick={() => setFilterStep(null)}
                    className={cn("w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg transition-colors cursor-pointer",
                      !filterStep ? "bg-sky-50 text-sky-700 font-semibold" : "text-gray-500 hover:bg-gray-50")}>
                    <span>Vue globale</span>
                    <span className="ml-auto text-[10px] text-gray-400">{workspaceBlocks.length}</span>
                  </button>
                  {CREDO_NAV.map(phase => {
                    const phaseBlocks = workspaceBlocks.filter(b => b.credo_step === phase.key);
                    const count = phaseBlocks.length;
                    const isActive = currentCredoLetter === phase.key;
                    const hasFutureOnly = count === 0 && !isActive;
                    return (
                      <button
                        key={phase.key}
                        onClick={() => {
                          // Scroll to first block of this CREDO step
                          const target = document.querySelector(`[data-credo-step="${phase.key}"]`);
                          if (target) {
                            target.scrollIntoView({ behavior: "smooth", block: "start" });
                            // Flash blue briefly
                            target.classList.add("ring-2", "ring-blue-400", "rounded-lg");
                            setTimeout(() => target.classList.remove("ring-2", "ring-blue-400", "rounded-lg"), 1500);
                          }
                          setFilterStep(filterStep === phase.key ? null : phase.key);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg transition-colors cursor-pointer",
                          filterStep === phase.key ? cn(phase.bg, phase.text, "font-semibold") :
                          hasFutureOnly ? "text-gray-300" :
                          "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0",
                          count > 0 ? phase.dot : isActive ? cn(phase.dot, "opacity-60 animate-pulse") : "bg-gray-200"
                        )}>
                          {phase.key}
                        </div>
                        <span className="truncate">{phase.label}</span>
                        {count > 0 && (
                          <span className={cn("ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                            filterStep === phase.key ? cn(phase.bg, phase.text) : "bg-gray-100 text-gray-500"
                          )}>{count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Section 3: Synthese link */}
              {workspaceBlocks.length >= 3 && (
                <div className="px-1">
                  <div className="border-t border-gray-100 mx-1 mb-2" />
                  <button
                    onClick={() => {
                      const synthBlock = document.getElementById("workspace-synthese-section");
                      if (synthBlock) synthBlock.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full flex items-center gap-2 px-2 py-2 text-xs rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors font-medium"
                  >
                    <FileText className="h-3 w-3 shrink-0" />
                    <span>Synthese</span>
                  </button>
                </div>
              )}

              {/* Legend */}
              <div className="px-3 mt-1">
                <div className="flex items-center gap-1.5 text-[8px] text-gray-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" /> Blocs
                  <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse" /> En cours
                  <div className="w-2 h-2 rounded-full bg-gray-200" /> Futur
                </div>
              </div>
            </div>
          );
        })()}

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
        <div className="w-full">
         <div className={cn("transition-all duration-300", contentAppeared ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>

          {/* TAB: Ajouter un agent — roster panel */}
          {activeHeroTab === "agents" && (
            <AgentRosterPanel activeRoster={activeRoster} onToggleBot={handleToggleBot} loadingBots={rosterLoadingBots} />
          )}

          {/* TAB: Modes de reflexion — existing reflexion flow (Etape 5: flow simulation-style) */}
          {activeHeroTab === "reflexion" && activeSubSection === "modes-reflexion" && (
            <div className="mt-3 space-y-3">
              {/* Mode selector buttons — demarrage immediat (1-click) */}
              {!reflexionFlow && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {[
                    { id: "analyse", label: "Analyse", icon: Eye, bg: "bg-blue-100", text: "text-blue-700" },
                    { id: "debat", label: "Debat", icon: Swords, bg: "bg-red-100", text: "text-red-700" },
                    { id: "brainstorm", label: "Brainstorm", icon: Lightbulb, bg: "bg-amber-100", text: "text-amber-700" },
                    { id: "strategie", label: "Strategie", icon: Target, bg: "bg-purple-100", text: "text-purple-700" },
                    { id: "innovation", label: "Innovation", icon: Sparkles, bg: "bg-pink-100", text: "text-pink-700" },
                    { id: "decision", label: "Decision", icon: CheckCircle2, bg: "bg-green-100", text: "text-green-700" },
                  ].map(m => (
                    <button key={m.id}
                      onClick={() => {
                        const ctx = messages.filter(msg => msg.role === "assistant" && msg.content).pop()?.content?.substring(0, 500) || displayContext;
                        // Demarrage IMMEDIAT — UX directe (pas d'intro)
                        setReflexionFlow({
                          mode: m.id, label: m.label,
                          phase: "running",
                          stage: 0, results: [], context: ctx, isThinking: true,
                          selectedBots: [activeBotCode],
                          focusInput: ctx,
                          thinkingSteps: [],
                        });
                        runReflexionStage(m.id, 0, ctx, [], [activeBotCode]);
                      }}
                      className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-medium border cursor-pointer transition-colors hover:shadow-sm",
                        m.bg, m.text, "border-current/20")}>
                      <m.icon className="h-3 w-3" />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* ═══ INTRO PHASE supprimee — demarrage immediat. Config accessible via bouton dans le header ═══ */}

              {/* ═══ RUNNING/DONE PHASE: Flow 3 stages (pattern AtelierBrainstorm) ═══ */}
              {reflexionFlow && (reflexionFlow.phase === "running" || reflexionFlow.phase === "done") && (() => {
                const mc = REFLEXION_MODE_COLORS[reflexionFlow.mode] || REFLEXION_MODE_COLORS.analyse;
                const stageLabels = REFLEXION_STAGE_LABELS[reflexionFlow.mode] || REFLEXION_STAGE_LABELS.analyse;
                const stageIdx = reflexionFlow.results.length;
                const canAdvance = !reflexionFlow.isThinking && reflexionFlow.results.length > 0 && reflexionFlow.results.length < 3;
                const isDone = reflexionFlow.phase === "done";

                return (
                  <div className="space-y-4 p-4 rounded-xl border border-gray-200 bg-white/80 shadow-sm">
                    {/* Header avec mode + progress circles + bots actifs */}
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0", mc.bg, mc.text)}>
                        {reflexionFlow.label}
                      </span>
                      {/* 3 progress circles */}
                      {[0, 1, 2].map(i => (
                        <div key={i} className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                          stageIdx > i ? "bg-emerald-100 text-emerald-700" :
                          stageIdx === i && reflexionFlow.isThinking ? cn(mc.bg, mc.text, "ring-2 ring-current/30 animate-pulse") :
                          stageIdx === i ? cn(mc.bg, mc.text) :
                          "bg-gray-100 text-gray-400"
                        )}>
                          {stageIdx > i ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                        </div>
                      ))}
                      {/* Bots actifs (simulation-style) */}
                      <div className="flex items-center gap-0.5 ml-auto">
                        {(reflexionFlow.selectedBots || []).slice(0, 3).map(code => (
                          <div key={code} className="flex items-center gap-0.5 bg-gray-50 rounded-full px-1.5 py-0.5">
                            <BotAvatar code={code} size="sm" />
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setReflexionFlow(null)} className="p-1 rounded hover:bg-gray-100 cursor-pointer">
                        <X className="h-3.5 w-3.5 text-gray-400" />
                      </button>
                    </div>

                    {/* Stages rendered — mode-specific visual rendering */}
                    {reflexionFlow.results.map((content, i) => {
                      const stageBotCode = reflexionFlow.selectedBots?.length > 0 ? reflexionFlow.selectedBots[i % reflexionFlow.selectedBots.length] : activeBotCode;
                      const stageBotName = BOT_NAME[stageBotCode] || "CarlOS";

                      // ═══ BRAINSTORM: cartes d'idees visuelles (pattern AtelierBrainstorm) ═══
                      if (reflexionFlow.mode === "brainstorm") {
                        const ideas = parseBrainstormIdeas(content);

                        // Vague 1 — grille 2 colonnes de cartes colorees
                        if (i === 0 && ideas.length > 0) return (
                          <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-2">
                            <div className="flex items-center gap-2">
                              <BotAvatar code={stageBotCode} size="sm" />
                              <span className="text-[10px] font-bold text-gray-700">{stageBotName}</span>
                              <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold ml-auto", mc.bg, mc.text)}>{stageLabels[0]}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              {ideas.map((idea, j) => (
                                <div key={j} className={cn("rounded-lg p-2.5 border text-xs animate-in fade-in duration-300", IDEA_CARD_COLORS[j % IDEA_CARD_COLORS.length])} style={{ animationDelay: `${j * 80}ms` }}>
                                  <div className="flex items-start gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-white/70 flex items-center justify-center text-[9px] font-bold text-gray-600 shrink-0 mt-0.5">{idea.num}</span>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-gray-800 leading-tight">{idea.title}</p>
                                      {idea.desc && <p className="text-[10px] text-gray-600 mt-0.5 leading-tight">{idea.desc}</p>}
                                    </div>
                                  </div>
                                  <p className="text-[9px] text-gray-400 mt-1.5">{stageBotName}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );

                        // Vague 2 — SCAMPER stack avec votes
                        if (i === 1 && ideas.length > 0) return (
                          <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-2">
                            <div className="flex items-center gap-2">
                              <BotAvatar code={stageBotCode} size="sm" />
                              <span className="text-[10px] font-bold text-gray-700">{stageBotName}</span>
                              <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold ml-auto", mc.bg, mc.text)}>{stageLabels[1]}</span>
                            </div>
                            <div className="space-y-1.5">
                              {ideas.map((idea, j) => (
                                <div key={j} className={cn("rounded-lg p-2.5 border text-xs animate-in fade-in duration-300", IDEA_CARD_COLORS[j % IDEA_CARD_COLORS.length])} style={{ animationDelay: `${j * 100}ms` }}>
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5">
                                      {idea.technique && (
                                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/80 text-gray-700 uppercase tracking-wide">{idea.technique}</span>
                                      )}
                                      <span className="text-[9px] text-gray-400">{stageBotName}</span>
                                    </div>
                                    {idea.score != null && (
                                      <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-bold">⭐ {idea.score}/20</span>
                                    )}
                                  </div>
                                  <p className="font-semibold text-gray-800 leading-tight">{idea.title}</p>
                                  {idea.desc && <p className="text-[10px] text-gray-600 mt-0.5 leading-tight">{idea.desc}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        );

                        // Top 3 — cartes surlignees avec "Idee Phare"
                        if (i === 2) {
                          const top3 = parseTop3(content);
                          if (top3.length > 0) return (
                            <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-2">
                              <div className="flex items-center gap-2">
                                <BotAvatar code={stageBotCode} size="sm" />
                                <span className="text-[10px] font-bold text-gray-700">{stageBotName}</span>
                                <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold ml-auto", mc.bg, mc.text)}>{stageLabels[2]}</span>
                              </div>
                              <div className="space-y-2">
                                {top3.map((item, j) => (
                                  <div key={j} className={cn("rounded-xl p-3 border-2 animate-in fade-in duration-300",
                                    j === 0 ? "border-amber-300 bg-amber-50/80 shadow-sm" : j === 1 ? "border-blue-200 bg-blue-50/50" : "border-gray-200 bg-white"
                                  )} style={{ animationDelay: `${j * 150}ms` }}>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                        j === 0 ? "bg-amber-200 text-amber-800" : j === 1 ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-700"
                                      )}>{j + 1}</span>
                                      <span className="text-sm font-bold text-gray-900">{item.title}</span>
                                      {j === 0 && <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-bold ml-auto shrink-0">Idee Phare</span>}
                                    </div>
                                    {item.why && <p className="text-xs text-gray-600 mt-1 ml-8">{item.why}</p>}
                                    {item.actions.length > 0 && (
                                      <div className="mt-1.5 ml-8 space-y-0.5">
                                        {item.actions.map((a, k) => (
                                          <div key={k} className="flex items-center gap-1.5 text-[10px] text-gray-700">
                                            <ArrowRight className="h-3 w-3 text-emerald-500 shrink-0" />
                                            <span>{a}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                      }

                      // ═══ GENERIC: rendu texte enrichi (autres modes) ═══
                      return (
                        <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
                            <BotAvatar code={stageBotCode} size="sm" />
                            <span className="text-[10px] font-bold text-gray-700">{stageBotName}</span>
                            <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold ml-auto", mc.bg, mc.text)}>
                              {stageLabels[i]}
                            </span>
                          </div>
                          <div className="p-4">
                            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{ __html: content
                                .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                                .replace(/^\s*(\d+)[.)]\s+/gm, '<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold mr-1.5">$1</span>')
                                .replace(/^\s*[-*•]\s+(.+)/gm, '<div class="flex items-start gap-2 my-1"><span class="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0"></span><span>$1</span></div>')
                                .replace(/\n/g, '<br/>')
                              }} />
                          </div>
                        </div>
                      );
                    })}

                    {/* ThinkingAnimation (simulation-style: bouncing dots + etapes) */}
                    {reflexionFlow.isThinking && (
                      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
                          <BotAvatar code={reflexionFlow.selectedBots?.length > 0 ? reflexionFlow.selectedBots[stageIdx % reflexionFlow.selectedBots.length] : activeBotCode} size="sm" />
                          <span className="text-[10px] font-medium text-gray-500">
                            {BOT_NAME[reflexionFlow.selectedBots?.length > 0 ? reflexionFlow.selectedBots[stageIdx % reflexionFlow.selectedBots.length] : activeBotCode]} reflechit...
                          </span>
                          <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold ml-auto", mc.bg, mc.text)}>
                            {stageLabels[stageIdx] || "..."}
                          </span>
                        </div>
                        <div className="p-4 space-y-2">
                          {/* Bouncing dots (pattern AtelierBrainstorm — amber pour brainstorm, blue sinon) */}
                          <div className="flex gap-1 mb-3">
                            {[0, 150, 300].map(delay => (
                              <div key={delay} className={cn("w-2 h-2 rounded-full animate-bounce", reflexionFlow.mode === "brainstorm" ? "bg-amber-400" : "bg-blue-400")} style={{ animationDelay: `${delay}ms` }} />
                            ))}
                          </div>
                          {/* Thinking steps (like simulation) */}
                          {(reflexionFlow.thinkingSteps || []).map((step, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-500 animate-in fade-in duration-500" style={{ animationDelay: `${i * 800}ms` }}>
                              <Activity className={cn("h-3 w-3 animate-pulse", reflexionFlow.mode === "brainstorm" ? "text-amber-500" : "text-blue-400")} />
                              <span>{step}</span>
                              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse ml-auto", reflexionFlow.mode === "brainstorm" ? "bg-amber-500" : "bg-blue-500")} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error state — visible feedback + retry */}
                    {reflexionFlow.error && !reflexionFlow.isThinking && (
                      <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                          <span className="text-xs text-red-700 font-medium">{reflexionFlow.error}</span>
                        </div>
                        <button
                          onClick={() => {
                            setReflexionFlow(prev => prev ? { ...prev, error: undefined } : null);
                            runReflexionStage(reflexionFlow.mode, reflexionFlow.results.length, reflexionFlow.context, reflexionFlow.results, reflexionFlow.selectedBots);
                          }}
                          className="w-full py-2 rounded-lg border border-red-200 bg-white text-red-700 text-xs font-bold hover:bg-red-50 cursor-pointer transition-colors">
                          Reessayer
                        </button>
                      </div>
                    )}

                    {/* Bouton "Continuer" entre les stages */}
                    {canAdvance && (
                      <button onClick={() => runReflexionStage(reflexionFlow.mode, reflexionFlow.results.length, reflexionFlow.context, reflexionFlow.results, reflexionFlow.selectedBots)}
                        className={cn("w-full py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors",
                          "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100")}>
                        {stageLabels[stageIdx] || "Etape suivante"} →
                      </button>
                    )}

                    {/* Bouton fin — cristalliser dans workspace */}
                    {isDone && (
                      <button onClick={finalizeReflexionFlow}
                        className="w-full py-3 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 cursor-pointer transition-colors shadow-sm">
                        Cristalliser dans le workspace
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Blocs filtres par type reflexion */}
              <div className="space-y-2">
                {filteredBlocksBySubSection.map(b => (
                  <div key={b.id} className={cn(pulsingBlockId === b.id && "ring-2 ring-blue-400 rounded-xl")}>
                    <BlockRenderer block={b} onAction={handleBlockAction} animated={false} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* W.0: techniques creativite */}
          {activeHeroTab === "reflexion" && activeSubSection === "techniques" && (
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
                  Techniques de creativite
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "scamper", label: "SCAMPER", icon: Lightbulb, steps: 7,
                      color: "bg-amber-100 text-amber-700 border-amber-300" },
                    { id: "5pourquoi", label: "5 Pourquoi", icon: Search, steps: 5,
                      color: "bg-orange-100 text-orange-700 border-orange-300" },
                    { id: "6chapeaux", label: "6 Chapeaux", icon: Crown, steps: 6,
                      color: "bg-violet-100 text-violet-700 border-violet-300" },
                    { id: "analogie", label: "Analogie", icon: ArrowLeftRight, steps: 1,
                      color: "bg-blue-100 text-blue-700 border-blue-300" },
                    { id: "inversion", label: "Inversion", icon: RotateCcw, steps: 1,
                      color: "bg-rose-100 text-rose-700 border-rose-300" },
                    { id: "biomimetisme", label: "Biomimetisme", icon: Leaf, steps: 1,
                      color: "bg-green-100 text-green-700 border-green-300" },
                    { id: "challenge", label: "Challenge", icon: Shield, steps: 1,
                      color: "bg-red-100 text-red-700 border-red-300" },
                  ].map(t => (
                    <button key={t.id}
                      onClick={() => startTechnique(t.id, t.label, t.steps)}
                      className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors hover:shadow-sm", t.color)}>
                      <t.icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{t.label}</span>
                      {t.steps > 1 && <span className="ml-auto text-[9px] opacity-60">{t.steps} etapes</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-step progression */}
              {activeTechnique && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-xs font-medium text-amber-800">
                    {activeTechnique.label} — Etape {techniqueStep + 1}/{activeTechnique.totalSteps}
                  </span>
                  <div className="flex-1" />
                  <button onClick={handleNextTechStep}
                    className="text-xs font-medium px-2 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 cursor-pointer">
                    Etape suivante →
                  </button>
                </div>
              )}

              {/* Blocs techniques captures */}
              <div className="space-y-2">
                {filteredBlocksBySubSection.map(b => (
                  <div key={b.id} className={cn(pulsingBlockId === b.id && "ring-2 ring-blue-400 rounded-xl")}>
                    <BlockRenderer block={b} onAction={handleBlockAction} animated={false} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discussion content — visible when discussion tab is active */}
          {activeHeroTab === "discussion" && (<>

          {/* W.1b: SUB-SECTION CONTENT — deep search via Gemini grounding */}
          {activeSubSection === "deep-search" && (
            <DeepSearchPanel
              activeBotCode={activeBotCode}
              currentCredoLetter={currentCredoLetter}
              addWorkspaceBlock={addWorkspaceBlock}
              filteredBlocks={filteredBlocksBySubSection}
              onBlockAction={handleBlockAction}
              pulsingBlockId={pulsingBlockId}
            />
          )}

          {/* W.1: SUB-SECTION CONTENT — experts panel */}
          {activeSubSection === "experts" && (
            <SuggestedExpertsPanel
              messages={messages}
              activeBotCode={activeBotCode}
              workspaceBlocks={workspaceBlocks}
              addWorkspaceBlock={addWorkspaceBlock}
              currentCredoLetter={currentCredoLetter}
              activePhase={activePhase}
              filteredBlocks={filteredBlocksBySubSection}
              onBlockAction={handleBlockAction}
              pulsingBlockId={pulsingBlockId}
            />
          )}

          {/* TECHNIQUE PANEL — sous-section ouverte depuis le sidebar (legacy) */}
          {selectedTechnique && !activeSubSection && (
            <div className="mt-3">
              <TechniquePanel
                techniqueId={selectedTechnique}
                context={displayContext}
                onSend={handleReflexionSend}
                onSendWithMeta={handleSendWithMeta}
                onClose={() => setSelectedTechnique(null)}
              />
            </div>
          )}

          {/* WorkspaceReflexionHub retiré — les modes de réflexion se déclenchent depuis
             le panneau de contrôle de la chatbox et les boutons action des blocs/synthèses */}

          {/* B.1: Bot processing bubble — visible quand le bot synthetise la discussion */}
          {isThinking && (
            <div className="mt-3 flex gap-3 animate-in fade-in duration-300">
              <BotAvatar code={activeBotCode} size="md" />
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white rounded-tl-none px-4 py-3 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold text-gray-800">{BOT_NAME[activeBotCode] || "CarlOS"}</span>
                  <span className="text-[9px] text-gray-400">synthetise...</span>
                </div>
                <div className="space-y-1.5">
                  {(THINKING_STEPS[currentCredoLetter] || THINKING_STEPS.C).map((step, j) => (
                    <div key={j} className={cn(
                      "flex items-center gap-2 text-[10px] transition-all duration-300",
                      j < currentThinkingStep ? "text-emerald-600" :
                      j === currentThinkingStep ? "text-gray-800 font-medium" :
                      "text-gray-300"
                    )}>
                      {j < currentThinkingStep && <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />}
                      {j === currentThinkingStep && (
                        <div className="flex gap-1 shrink-0 w-3 justify-center">
                          {[0, 100, 200].map(d => (
                            <div key={d} className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                          ))}
                        </div>
                      )}
                      {j > currentThinkingStep && <div className="w-3 h-3 rounded-full border border-gray-200 shrink-0" />}
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* B.2: MultiConsultOverlay — visible quand cascade suggestions ciblent plusieurs phases */}
          {hasMultiPhaseConsult && !isThinking && (
            <div className="mt-3 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 p-3 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Network className="h-4 w-4 text-indigo-600 animate-pulse" />
                <span className="text-[10px] font-bold text-indigo-700">Perspectives multi-phases disponibles</span>
              </div>
              <div className="flex items-center gap-2">
                {multiPhaseTargets.map((phase, j) => (
                  <span key={j} className="text-[9px] px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-bold capitalize">
                    {phase}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Completude CREDO = interne. Les champs manquants sont injectes dans le
             prompt backend pour guider les options du bot, pas affiches a l'utilisateur. */}

          {/* Consultation suggestions retirées du workspace — gérées dans le footer des bulles
             via AutoConsultationPills (DiscussionWindow.tsx) — pas de duplication workspace/discussion */}

          {/* DYNAMIC STEP CONTENT — timeline plate de tous les blocs */}
          <DynamicStepContent
            allBlocks={displayBlocks}
            context={displayContext}
            onBlockAction={handleBlockAction}
            pulsingBlockId={pulsingBlockId}
            activeBotCode={activeBotCode}
            activeCredoStep={currentCredoLetter}
          />

          {/* Loading — bot thinking bubble (visible during full API call) */}
          {loadingBlockId && (
            <div className="mt-2 flex gap-2.5 animate-in fade-in duration-200">
              <BotAvatar code={loadingBotCode || activeBotCode} size="md" />
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white rounded-tl-none px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-gray-700">{BOT_NAME[loadingBotCode || activeBotCode] || "Bot"}</span>
                  <span className="text-[9px] text-gray-400">reflechit...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 150, 300].map(d => (
                      <div key={d} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                  <span className="text-xs text-blue-600 font-medium">{loadingLabel}</span>
                </div>
              </div>
            </div>
          )}

          {showTypingCursor && (
            <div className="flex items-center gap-1.5 px-4 py-2 animate-in fade-in duration-300">
              <span className="inline-block w-0.5 h-4 bg-gray-800 animate-pulse rounded-full" />
              <span className="text-[9px] text-gray-400 italic">cristallisation en cours...</span>
            </div>
          )}

          {/* S117 Phase 4B: Synthese section — visible quand >= 3 blocs */}
          {workspaceBlocks.length >= 3 && (
            <SyntheseSection
              workspaceBlocks={workspaceBlocks}
              activeBotCode={activeBotCode}
              displayContext={displayContext}
            />
          )}
          <div ref={blocksEndRef} />

          {/* CASCADE SUGGESTIONS — cross-phase (Sprint 1 Etape 6) + B.4 bordure gauche coloree */}
          {latestCascadeSuggestions.length > 0 && (
            <div className="mt-3 space-y-1.5 animate-in fade-in duration-500">
              {latestCascadeSuggestions.map((sug, sugIdx) => (
                <button
                  key={sugIdx}
                  onClick={() => {
                    // PAS de switch de phase auto — l'utilisateur reste en discussion
                    // La transition de phase se fait explicitement via la sidebar/ControlTower
                    sendMessage(sug.message, activeBotCode);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white/80",
                    "border-l-[3px]", SUGGESTION_BORDER_COLORS[sugIdx % SUGGESTION_BORDER_COLORS.length],
                    "hover:shadow-sm hover:bg-gray-50 cursor-pointer transition-all text-left",
                    "animate-in fade-in slide-in-from-bottom-1 duration-300"
                  )}
                  style={{ animationDelay: `${sugIdx * 100}ms`, animationFillMode: 'backwards' }}
                >
                  <ArrowRight className="h-3 w-3 text-gray-500 shrink-0" />
                  <span className="text-[10px] text-gray-700 font-medium">
                    Explorer en {sug.view || sug.target_section}: {sug.message.substring(0, 100)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Notes capturees */}
          {phaseNotes.length > 0 && (
            <div className={cn("mt-4 rounded-xl p-4", col.notes.border, col.notes.bg)}>
              <h4 className={cn("text-[10px] font-bold uppercase tracking-wider mb-2", col.notes.text)}>
                Notes capturees ({phaseNotes.length})
              </h4>
              <div className="space-y-1.5">
                {phaseNotes.map(item => (
                  <div key={item.id} className="flex items-start gap-2 group/note">
                    <Zap className={cn("h-3 w-3 mt-0.5 shrink-0", col.notes.iconText)} />
                    <p className="text-[11px] text-gray-700 leading-relaxed flex-1">{item.text}</p>
                    <button onClick={() => removeWorkflowItem(item.id)} className="p-0.5 rounded opacity-0 group-hover/note:opacity-100 hover:bg-red-100 transition-all cursor-pointer shrink-0" title="Retirer">
                      <X className="h-3 w-3 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          </>)}
          {/* end discussion content */}

         </div>{/* close fade-in wrapper */}
        </div>
      </div>{/* close main content area */}
      </div>{/* close flex sidebar+content */}
    </div>
  );
}

// ═══ AgentRosterPanel — grid of all bots with toggle to add/remove from roster ═══

const ALL_ROSTER_BOTS = ["CEOB","CTOB","CFOB","CMOB","CSOB","COOB","CPOB","CROB","CHROB","CLOB","CISOB","CINOB"];

const BOT_SPECIALTIES: Record<string, { tagline: string; specs: string[] }> = {
  CEOB: { tagline: "Vision strategique et leadership", specs: ["Strategie", "Decisions", "Culture"] },
  CTOB: { tagline: "Innovation et architecture tech", specs: ["Tech", "R&D", "Securite"] },
  CFOB: { tagline: "Performance financiere", specs: ["Finance", "Budget", "Previsions"] },
  CMOB: { tagline: "Croissance et marque", specs: ["Marketing", "Branding", "Digital"] },
  CSOB: { tagline: "Developpement des revenus", specs: ["Ventes", "Pipeline", "Clients"] },
  COOB: { tagline: "Excellence operationnelle", specs: ["Operations", "Process", "Qualite"] },
  CPOB: { tagline: "Production et fabrication", specs: ["Production", "Supply Chain", "Lean"] },
  CROB: { tagline: "Revenus et croissance", specs: ["Revenus", "Monetisation", "Expansion"] },
  CHROB: { tagline: "Capital humain et culture", specs: ["RH", "Recrutement", "Formation"] },
  CLOB: { tagline: "Conformite et gouvernance", specs: ["Legal", "Contrats", "Risques"] },
  CISOB: { tagline: "Cybersecurite et protection", specs: ["Securite", "Conformite", "Risques"] },
  CINOB: { tagline: "Innovation et disruption", specs: ["Innovation", "Veille", "Tendances"] },
};

function AgentRosterPanel({ activeRoster, onToggleBot, loadingBots }: {
  activeRoster: string[];
  onToggleBot: (botCode: string) => void;
  loadingBots?: Set<string>;
}) {
  return (
    <div className="space-y-4 px-1">
      <p className="text-[11px] text-gray-500">Ajoutez des experts pour enrichir la discussion.</p>
      <div className="grid grid-cols-2 gap-2.5">
        {ALL_ROSTER_BOTS.map(code => {
          const inRoster = activeRoster.includes(code);
          const role = BOT_ROLE_SHORT[code] || "";
          const specialty = BOT_SPECIALTIES[code];
          const isLoading = loadingBots?.has(code);
          return (
            <button key={code} onClick={() => onToggleBot(code)}
              className={cn(
                "flex flex-col gap-2 px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer group",
                inRoster
                  ? "border-sky-300 bg-sky-50/80 shadow-sm ring-1 ring-sky-200"
                  : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
              )}>
              <div className="flex items-center gap-2.5 w-full">
                <BotAvatar code={code} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-semibold text-gray-900 truncate">{BOT_NAME[code] || code}</span>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 uppercase tracking-wide",
                      inRoster ? "bg-sky-200 text-sky-700" : "bg-gray-100 text-gray-500"
                    )}>{role}</span>
                  </div>
                  {specialty && <div className="text-[10px] text-gray-400 italic truncate mt-0.5">{specialty.tagline}</div>}
                </div>
                {isLoading ? <Loader2 className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
                  : inRoster ? <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                  : <div className="w-4 h-4 rounded-full border-2 border-gray-300 group-hover:border-gray-400 shrink-0 transition-colors" />}
              </div>
              {specialty && (
                <div className="flex flex-wrap gap-1">
                  {specialty.specs.map(s => (
                    <span key={s} className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full",
                      inRoster ? "bg-sky-100 text-sky-600" : "bg-gray-100 text-gray-500"
                    )}>{s}</span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══ GPSBanner — contextual guidance based on discussion state heuristics ═══

function GPSBanner({ workspaceBlocks, chatStage, activeRoster, onTabSwitch }: {
  workspaceBlocks: import("../core/types").WorkspaceBlock[];
  chatStage: number;
  activeRoster: string[];
  onTabSwitch: (tab: "discussion" | "agents" | "reflexion") => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || workspaceBlocks.length < 3) return null;

  const uniqueBots = new Set(workspaceBlocks.map(b => b.source).filter(Boolean));
  const credoLetters = new Set(workspaceBlocks.map(b => b.credo_step).filter(Boolean));

  let message = "";
  let actionLabel = "";
  let actionTab: "agents" | "reflexion" | null = null;

  if (workspaceBlocks.length >= 5 && uniqueBots.size <= 1 && activeRoster.length <= 1) {
    message = "Un seul expert contribue. Ajoutez un agent pour diversifier les perspectives.";
    actionLabel = "Ajouter un agent";
    actionTab = "agents";
  } else if (workspaceBlocks.length >= 8 && chatStage >= 3) {
    message = "Discussion mature avec du contenu riche. Pret pour structurer en chantier ?";
  } else if (credoLetters.has("C") && credoLetters.has("R") && !credoLetters.has("E")) {
    message = "Vous avez compris et recherche. Exposez vos solutions pour avancer.";
  }

  if (!message) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-700">
      <Sparkles className="w-4 h-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {actionLabel && actionTab && (
        <button onClick={() => onTabSwitch(actionTab!)} className="text-sky-600 font-medium hover:underline cursor-pointer">
          {actionLabel}
        </button>
      )}
      <button onClick={() => setDismissed(true)} className="text-sky-400 hover:text-sky-600 cursor-pointer">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ═══ W.1b: DeepSearchPanel — recherche approfondie via Gemini grounding ═══

function DeepSearchPanel({ activeBotCode, currentCredoLetter, addWorkspaceBlock, filteredBlocks, onBlockAction, pulsingBlockId }: {
  activeBotCode: string;
  currentCredoLetter: string;
  addWorkspaceBlock: (block: import("../core/types").WorkspaceBlock) => void;
  filteredBlocks: import("../core/types").WorkspaceBlock[];
  onBlockAction: (action: string, blockId: string) => void;
  pulsingBlockId: string | null;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchThinkingStep, setSearchThinkingStep] = useState(0);

  useEffect(() => {
    if (!searchLoading) { setSearchThinkingStep(0); return; }
    const timer = setInterval(() => {
      setSearchThinkingStep(prev => prev < 2 ? prev + 1 : prev);
    }, 1500);
    return () => clearInterval(timer);
  }, [searchLoading]);

  const SEARCH_STEPS = ["Recherche de sources...", "Verification de fiabilite...", "Scoring des resultats..."];

  const handleDeepSearch = async () => {
    if (!searchQuery.trim() || searchLoading) return;
    setSearchLoading(true);
    try {
      const res = await api.deepSearch({ query: searchQuery, user_id: 1 });
      // Normalize Gemini grounding chunks into DeepSearchRenderer format
      const sources = (res.chunks || []).map((c: any, i: number) => ({
        title: c.title || `Source ${i + 1}`,
        detail: c.text || "",
        url: c.url || "",
        score: 70 + Math.round(Math.random() * 20), // Gemini ne donne pas de score, approximation
        type: "web",
      }));
      addWorkspaceBlock({
        id: `search-${Date.now()}`,
        type: "deep_search",
        title: `Recherche: ${searchQuery}`,
        summary: res.summary,
        structured_data: { sources, status: "complete", conclusion: res.summary.substring(0, 200) },
        credo_step: currentCredoLetter as "C" | "R" | "E" | "D" | "O",
        confidence: 0.8,
        source: activeBotCode,
        sourceType: "chat",
        timestamp: Date.now(),
      });
      setSearchQuery("");
    } catch (err) {
      console.error("[DeepSearch] Error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-2">
          Deep Search
        </h4>
        <p className="text-[10px] text-gray-500 mb-3">Recherche approfondie via IA — resultats dans le workspace</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleDeepSearch(); }}
            placeholder="Rechercher..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white"
            disabled={searchLoading}
          />
          <button
            onClick={handleDeepSearch}
            disabled={searchLoading || !searchQuery.trim()}
            className={cn("px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 cursor-pointer transition-colors",
              searchLoading ? "bg-gray-200 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-700")}
          >
            {searchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Chercher
          </button>
        </div>
      </div>

      {/* Loading animation */}
      {searchLoading && (
        <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 p-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-blue-700">Recherche en cours...</p>
              <div className="flex flex-wrap gap-3 mt-1.5">
                {SEARCH_STEPS.map((step, j) => (
                  <span key={j} className={cn(
                    "text-[9px] flex items-center gap-1 transition-all",
                    j < searchThinkingStep ? "text-emerald-600 line-through opacity-60" :
                    j === searchThinkingStep ? "text-blue-700 font-bold" :
                    "text-gray-400"
                  )}>
                    {j < searchThinkingStep && <CheckCircle2 className="h-2.5 w-2.5" />}
                    {j === searchThinkingStep && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                    {step}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blocs deep search */}
      <div className="space-y-2">
        {filteredBlocks.map(b => (
          <div key={b.id} className={cn(pulsingBlockId === b.id && "ring-2 ring-blue-400 rounded-xl")}>
            <BlockRenderer block={b} onAction={onBlockAction} animated={false} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ S117 Phase 4B: SyntheseSection — capsule de ce qui a été cerné ═══
// Redesign S131: auto-display par étape CREDO, sans bouton ni KPIs numériques.

function SyntheseSection({ workspaceBlocks }: {
  workspaceBlocks: import("../core/types").WorkspaceBlock[];
  activeBotCode: string;
  displayContext: string;
}) {
  const CREDO_LABELS: Record<string, string> = {
    C: "Connecter", R: "Rechercher", E: "Exposer", D: "Démontrer", O: "Objectif",
  };
  const CREDO_ORDER: ("C" | "R" | "E" | "D" | "O")[] = ["C", "R", "E", "D", "O"];

  // Grouper les blocs par étape CREDO dans l'ordre
  const blocksByStep = workspaceBlocks.reduce<Record<string, import("../core/types").WorkspaceBlock[]>>((acc, b) => {
    if (!acc[b.credo_step]) acc[b.credo_step] = [];
    acc[b.credo_step].push(b);
    return acc;
  }, {});
  const activeSteps = CREDO_ORDER.filter(s => (blocksByStep[s]?.length ?? 0) > 0);
  const uniqueBots = [...new Set(workspaceBlocks.map(b => b.source).filter(Boolean))];

  return (
    <div id="workspace-synthese-section" className="mt-4 mb-4">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Header compact */}
        <div className="flex items-center gap-2.5 px-3 py-2 border-b border-slate-100 bg-slate-50">
          <Target className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex-1">
            Ce que vous avez cerné
          </span>
          <span className="text-[9px] text-slate-400">
            {workspaceBlocks.length} élément{workspaceBlocks.length > 1 ? "s" : ""}
            {uniqueBots.length > 1 ? ` · ${uniqueBots.length} experts` : ""}
          </span>
        </div>
        {/* Blocs groupés par étape CREDO — dans l'ordre C→R→E→D→O */}
        <div className="divide-y divide-slate-100">
          {activeSteps.map(step => {
            const stepBlocks = blocksByStep[step] ?? [];
            const topBlocks = stepBlocks.slice(0, 3);
            return (
              <div key={step} className="px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 shrink-0 border border-slate-200">
                    {step}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide">
                    {CREDO_LABELS[step]}
                  </span>
                  {stepBlocks.length > 3 && (
                    <span className="text-[8px] text-slate-400 ml-1">+{stepBlocks.length - 3} autres</span>
                  )}
                </div>
                <div className="space-y-1 pl-[22px]">
                  {topBlocks.map(b => (
                    <div key={b.id} className="flex items-start gap-1.5">
                      <span className="text-slate-300 text-[10px] mt-0.5 shrink-0">·</span>
                      <p className="text-[10px] text-slate-700 leading-snug">
                        <span className="font-medium">{b.title}</span>
                        {b.summary && (
                          <span className="text-slate-400">
                            {" — "}{b.summary.replace(/\n/g, " ").substring(0, 90)}
                            {b.summary.length > 90 ? "…" : ""}
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══ W.1: buildExpertContext — percolation optimisee (max 2 phrases/expert, cap 1500 chars) ═══

const MAX_EXPERT_CTX = 1500;

/** Truncate at the last complete sentence within maxLen */
function truncateAtSentence(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastPeriod = Math.max(truncated.lastIndexOf("."), truncated.lastIndexOf("!"), truncated.lastIndexOf("?"));
  return lastPeriod > maxLen * 0.4 ? truncated.slice(0, lastPeriod + 1) : truncated + "...";
}

/** Extract max 2 meaningful sentences from expert content */
function extractExpertEssence(summary: string): string {
  const sentences = summary.replace(/\n+/g, " ").split(/(?<=[.!?])\s+/).filter(s => s.length > 15);
  const top2 = sentences.slice(0, 2).join(" ");
  return truncateAtSentence(top2, 200);
}

export function buildExpertContext(blocks: import("../core/types").WorkspaceBlock[], primaryBot: string): string | undefined {
  const expertBlocks = blocks.filter(b => b.source && b.source !== primaryBot && b.summary);
  if (expertBlocks.length === 0) return undefined;

  let result = "[PERSPECTIVES EXPERTS]\n";
  for (const b of expertBlocks) {
    const botName = BOT_NAME[b.source || ""] || b.source || "Expert";
    const essence = extractExpertEssence(b.summary || "");
    const line = `${botName}: ${essence}\n`;
    if (result.length + line.length > MAX_EXPERT_CTX) break;
    result += line;
  }
  return result + "[/PERSPECTIVES]";
}

// ═══ W.1: SuggestedExpertsPanel — Employee cards grid (11 agents toujours visibles) ═══

const BOT_STRENGTHS: Record<string, { conception: string; execution: string }> = {
  CEOB: { conception: "Vision strategique", execution: "Prise de decision" },
  CTOB: { conception: "Architecture systemes", execution: "Solutions techniques" },
  CFOB: { conception: "Modelisation financiere", execution: "Budget & previsions" },
  CMOB: { conception: "Strategie marketing", execution: "Campagnes & croissance" },
  CSOB: { conception: "Analyse concurrentielle", execution: "Plans de vente" },
  COOB: { conception: "Optimisation processus", execution: "Operations quotidiennes" },
  CPOB: { conception: "Automatisation", execution: "Production industrielle" },
  CHROB: { conception: "Culture d'entreprise", execution: "Recrutement & equipes" },
  CINOB: { conception: "Recherche & tendances", execution: "Innovation produit" },
  CROB: { conception: "Monetisation", execution: "Croissance revenus" },
  CLOB: { conception: "Conformite reglementaire", execution: "Contrats & juridique" },
  CISOB: { conception: "Cybersecurite", execution: "Gestion des risques" },
};

const BOT_ACCENT_CARDS: Record<string, string> = {
  CEOB: "border-l-sky-400", CTOB: "border-l-violet-400", CFOB: "border-l-emerald-400",
  CMOB: "border-l-pink-400", CSOB: "border-l-amber-400", COOB: "border-l-blue-400",
  CPOB: "border-l-orange-400", CHROB: "border-l-rose-400", CINOB: "border-l-teal-400",
  CROB: "border-l-lime-400", CLOB: "border-l-fuchsia-400", CISOB: "border-l-cyan-400",
};

const BOT_RING_COLOR: Record<string, string> = {
  CEOB: "ring-sky-300", CTOB: "ring-violet-300", CFOB: "ring-emerald-300",
  CMOB: "ring-pink-300", CSOB: "ring-amber-300", COOB: "ring-blue-300",
  CPOB: "ring-orange-300", CHROB: "ring-rose-300", CINOB: "ring-teal-300",
  CROB: "ring-lime-300", CLOB: "ring-fuchsia-300", CISOB: "ring-cyan-300",
};

const BOT_ROLE_SHORT: Record<string, string> = {
  CEOB: "CEO", CTOB: "CTO", CFOB: "CFO", CMOB: "CMO", CSOB: "CSO", COOB: "COO",
  CPOB: "CPO", CHROB: "CHRO", CINOB: "CINO", CROB: "CRO", CLOB: "CLO", CISOB: "CISO",
};

function SuggestedExpertsPanel({ messages, activeBotCode, workspaceBlocks, addWorkspaceBlock, currentCredoLetter, activePhase, filteredBlocks, onBlockAction, pulsingBlockId }: {
  messages: any[];
  activeBotCode: string;
  workspaceBlocks: import("../core/types").WorkspaceBlock[];
  addWorkspaceBlock: (block: import("../core/types").WorkspaceBlock) => void;
  currentCredoLetter: string;
  activePhase: string;
  filteredBlocks: import("../core/types").WorkspaceBlock[];
  onBlockAction: (action: string, blockId: string) => void;
  pulsingBlockId: string | null;
}) {
  const [expertLoadingBots, setExpertLoadingBots] = useState<Set<string>>(new Set());
  const [expertError, setExpertError] = useState<string | null>(null);

  // Extract latest team_proposal from messages
  const latestTeamProposal = (() => {
    const tp = messages.filter((m: any) => (m.msgType as string) === "team_proposal" && m.teamProposal);
    return tp.length > 0 ? (tp[tp.length - 1] as any).teamProposal : null;
  })();

  // Which bots are already in workspace
  const activeBotSources = new Set(workspaceBlocks.map(b => b.source).filter(Boolean));

  // All 11 agents (exclude primary bot)
  const ALL_EXPERT_CODES = ["CEOB", "CTOB", "CFOB", "CMOB", "CSOB", "COOB", "CPOB", "CHROB", "CINOB", "CROB", "CLOB", "CISOB"]
    .filter(code => code !== activeBotCode);

  // Suggested bots from team_proposal
  const suggestedBots = latestTeamProposal?.bots?.filter((b: any) => b.code !== activeBotCode) || [];
  const suggestedCodes = new Set(suggestedBots.map((b: any) => b.code));
  const suggestedReason = (code: string) => suggestedBots.find((b: any) => b.code === code)?.raison;

  const handleAddExpert = useCallback(async (botCode: string) => {
    if (expertLoadingBots.has(botCode)) return;
    setExpertLoadingBots(prev => new Set([...prev, botCode]));
    setExpertError(null);
    try {
      const lastUserMsg = messages.filter((m: any) => m.role === "user").pop()?.content || "";
      const lastBotMsg = messages.filter((m: any) => m.role === "assistant" && m.content).pop()?.content || "";
      const recentCtx = workspaceBlocks.slice(-3).map(b => `[${BOT_NAME[b.source || ""] || ""}] ${b.title}: ${(b.summary || "").substring(0, 150)}`).join("\n");
      const context = `Question: ${lastUserMsg}\n\nAnalyse en cours: ${lastBotMsg.substring(0, 500)}\n\nContexte recent:\n${recentCtx}`;

      const res = await api.chatMulti({
        message: context,
        user_id: 1,
        agents: [botCode],
        primary_agent: botCode,
        workspace_phase: activePhase,
      });

      const persp = res.perspectives?.[0];
      if (!persp) return;

      // A2: dedup — remplacer le bloc existant si meme source
      const existingBlock = workspaceBlocks.find(b => b.source === botCode);

      const blockType = detectBlockTypeFrontend(persp.contenu);
      addWorkspaceBlock({
        id: `expert-${botCode}-${Date.now()}`,
        type: blockType,
        title: generateExpertBlockTitle(BOT_NAME[botCode] || botCode, persp.contenu, "Perspective"),
        summary: persp.contenu,
        merge_label: "Consultation",
        structured_data: extractStructuredDataFrontend(persp.contenu, blockType),
        credo_step: currentCredoLetter as "C" | "R" | "E" | "D" | "O",
        credo_sub_section: "experts",
        confidence: 0.7,
        source: botCode,
        sourceType: "chat",
        timestamp: Date.now(),
        replace_block_id: existingBlock?.id,
      });
    } catch (err) {
      console.error("[Expert] Error:", err);
      setExpertError(`${BOT_NAME[botCode] || botCode} n'a pas pu contribuer`);
      setTimeout(() => setExpertError(null), 5000);
    } finally {
      setExpertLoadingBots(prev => { const s = new Set(prev); s.delete(botCode); return s; });
    }
  }, [messages, activeBotCode, activePhase, addWorkspaceBlock, currentCredoLetter, workspaceBlocks, expertLoadingBots]);

  return (
    <div className="mt-3 space-y-3">
      {/* Employee cards grid — 11 agents always visible */}
      <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/40 via-white to-indigo-50/30 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
            <Users className="h-3.5 w-3.5 text-violet-600" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-violet-800">
              Brain Team
            </h4>
            <p className="text-[9px] text-violet-500">Experts disponibles pour consultation</p>
          </div>
        </div>

        <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2">
          {ALL_EXPERT_CODES.map((code) => {
            const isDone = activeBotSources.has(code);
            const isLoading = expertLoadingBots.has(code);
            const isSuggested = suggestedCodes.has(code);
            const strengths = BOT_STRENGTHS[code];
            const ringCls = BOT_RING_COLOR[code] || "ring-gray-300";
            return (
              <div key={code} className={cn(
                "flex items-center gap-3 p-3 rounded-xl border bg-white transition-all group/card",
                "border-l-[3px] shadow-sm hover:shadow-md",
                BOT_ACCENT_CARDS[code] || "border-l-gray-400",
                isDone && "bg-emerald-50/30 border-emerald-200",
                isSuggested && !isDone && "ring-2 ring-violet-200 shadow-violet-100",
              )}>
                <div className={cn("w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 shadow-sm group-hover/card:shadow-md transition-all", ringCls)}>
                  <img src={BOT_AVATAR[code] || `/agents/${code.toLowerCase()}.png`}
                    alt={BOT_NAME[code] || code} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-gray-900 truncate">{BOT_NAME[code] || code}</span>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wide shrink-0">{BOT_ROLE_SHORT[code] || ""}</span>
                  </div>
                  {strengths && <span className="text-[10px] text-gray-500 block truncate mt-0.5">{strengths.conception}</span>}
                  {isSuggested && !isDone && suggestedReason(code) && (
                    <span className="text-[9px] text-violet-600 font-medium block truncate mt-0.5">
                      Recommande: {suggestedReason(code)?.substring(0, 50)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleAddExpert(code)}
                  disabled={isLoading}
                  className={cn(
                    "shrink-0 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                    isDone ? "px-2.5 py-1.5 bg-emerald-100 text-emerald-700 shadow-sm" :
                    isLoading ? "px-2.5 py-1.5 bg-gray-100 text-gray-400" :
                    "px-3 py-1.5 bg-violet-600 text-white hover:bg-violet-700 shadow-sm hover:shadow-md active:scale-95"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isDone ? (
                    <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Done</span>
                  ) : (
                    <span className="flex items-center gap-1"><Plus className="h-3 w-3" /> Ajouter</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Error banner */}
        {expertError && (
          <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-[10px] text-red-700 font-medium">
            {expertError}
          </div>
        )}
      </div>

      {/* Active expert bots contributions */}
      {filteredBlocks.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
            Contributions ({filteredBlocks.length})
          </span>
          <div className="grid gap-3 grid-cols-1">
            {filteredBlocks.map(b => (
              <div key={b.id} className={cn(pulsingBlockId === b.id && "ring-2 ring-blue-400 rounded-xl")}>
                <BlockRenderer block={b} onAction={onBlockAction} animated={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CPOB — CTA Cahier de Projet Usine Bleue — déclenché quand CREDO atteint phase D ou O */}
      {activeBotCode === "CPOB" && onPhaseComplete &&
        (currentCREDOPhase === "D" || currentCREDOPhase === "O" ||
         (currentCREDOPhase === null && messages.filter(m => m.role === "user").length >= 5)) && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">📋</span>
            <span className="text-amber-800 text-sm font-medium leading-tight">
              Paco a complété son diagnostic — prêt à rédiger le <strong>Cahier de Projet</strong>
            </span>
          </div>
          <button
            onClick={onPhaseComplete}
            className="shrink-0 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Lancer le Cahier →
          </button>
        </div>
      )}
    </div>
  );
}

// GenerateReportButton + CreateChantierButton RETIRÉS
// La Discussion produit un Chantier — pas de transition auto vers Conception.
// Le workflow: Discussion → Chantier → tâches du chantier → sessions spécialisées

// ═══ DynamicStepContent — workspace dynamique, pattern simulations ═══
// Montre TOUS les blocs cristallises (pas de filtrage par step).
// Le header donne le contexte de l'etape active, mais tous les blocs sont visibles.

const STEP_BADGE: Record<string, { badge: string; bg: string; dot: string; border: string }> = {
  C: { badge: "C", bg: "bg-sky-100 text-sky-700",     dot: "bg-sky-500",    border: "border-sky-200" },
  R: { badge: "R", bg: "bg-violet-100 text-violet-700", dot: "bg-violet-500", border: "border-violet-200" },
  E: { badge: "E", bg: "bg-amber-100 text-amber-700", dot: "bg-amber-500",  border: "border-amber-200" },
  D: { badge: "D", bg: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  O: { badge: "O", bg: "bg-red-100 text-red-700",     dot: "bg-red-500",    border: "border-red-200" },
};

const UNIVERSAL_BLOCK_TYPES = new Set(["rapport", "synthese"]);

const CREDO_EMPTY_STATE: Record<string, { title: string; hint: string }> = {
  C: { title: "Comprendre la situation", hint: "Posez des questions pour clarifier le contexte et les enjeux." },
  R: { title: "Recherche d'angles morts", hint: "Explorez les techniques de reflexion ou consultez des experts." },
  E: { title: "Solutions a exposer", hint: "Les options et propositions apparaitront ici." },
  D: { title: "Demonstration et ressources", hint: "Plans d'action, budgets et ressources seront captures ici." },
  O: { title: "Objectif et decisions", hint: "Le plan de match final et les decisions prises." },
};

function DynamicStepContent({ allBlocks, context, onBlockAction, pulsingBlockId, activeBotCode, activeCredoStep }: {
  allBlocks: import("../core/types").WorkspaceBlock[];
  context: string;
  onBlockAction: (action: string, blockId: string) => void;
  pulsingBlockId: string | null;
  activeBotCode?: string;
  activeCredoStep?: string;
}) {
  // Show ALL blocks — flat timeline (D-116: removed isMultiBot gate that was hiding blocks)
  const filteredBlocks = allBlocks;

  if (filteredBlocks.length === 0) {
    // No hardcoded text — just return empty (workspace will fill as discussion progresses)
    return null;
  }

  // Simple flat timeline — blocks stacked vertically with CREDO step separators
  const CREDO_NAMES: Record<string, string> = { C: "Comprendre", R: "Rechercher", E: "Exposer", D: "Demontrer", O: "Objectif" };

  return (
    <BlockDisplayContext.Provider value={{ compact: true, primaryBotCode: activeBotCode || "" }}>
    <div className="mt-3 space-y-3">
      {filteredBlocks.map((block, i) => {
        const prevBlock = i > 0 ? filteredBlocks[i - 1] : null;
        const showStepSeparator = !prevBlock || (prevBlock.credo_step !== block.credo_step && block.type !== "synthese");
        const badge = STEP_BADGE[block.credo_step] || STEP_BADGE.C;

        return (
          <div key={block.id}>
            {showStepSeparator && (
              <div className={cn("credo-separator flex items-center gap-3 my-4 py-2")} data-credo-step={block.credo_step}>
                <div className={cn("flex-1 h-px", badge.border, "border-t")} />
                <div className="flex items-center gap-2">
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-sm", badge.dot)}>
                    {block.credo_step}
                  </div>
                  <div className="flex flex-col">
                    <span className={cn("text-[11px] font-bold", badge.bg.split(" ")[1] || "text-gray-700")}>
                      {CREDO_NAMES[block.credo_step] || block.credo_step}
                    </span>
                    {block.credo_sub_section && (
                      <span className="text-[9px] text-gray-400 font-medium">{block.credo_sub_section}</span>
                    )}
                  </div>
                </div>
                <div className={cn("flex-1 h-px", badge.border, "border-t")} />
              </div>
            )}
            <div
              id={`block-${block.type}`}
              className={cn(pulsingBlockId === block.id && "ring-2 ring-blue-400 rounded-xl transition-all")}
            >
              <BlockRenderer block={block} onAction={onBlockAction} animated={false} />
            </div>
          </div>
        );
      })}
    </div>
    </BlockDisplayContext.Provider>
  );
}

// ═══ S2.4.2: Multi-phase accordion — resume des blocs par etape CREDO ═══

function MultiPhaseAccordion({ workspaceBlocks, credoLabels }: {
  workspaceBlocks: import("../core/types").WorkspaceBlock[];
  credoLabels: Record<string, string>;
}) {
  const [openStep, setOpenStep] = useState<string | null>(null);

  const STEP_COLORS: Record<string, { dot: string; bg: string; border: string; text: string }> = {
    C: { dot: "bg-sky-400", bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700" },
    R: { dot: "bg-blue-400", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
    E: { dot: "bg-amber-400", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
    D: { dot: "bg-green-400", bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
    O: { dot: "bg-purple-400", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  };

  const steps = ["C", "R", "E", "D", "O"];
  const grouped = steps.map(s => ({
    step: s,
    blocks: workspaceBlocks.filter(b => b.credo_step === s),
  })).filter(g => g.blocks.length > 0);

  if (grouped.length <= 1) return null;

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Resume CREDO</span>
      </div>
      {grouped.map(({ step, blocks }) => {
        const sc = STEP_COLORS[step] || STEP_COLORS.C;
        const isOpen = openStep === step;
        return (
          <div key={step} className="border-b border-gray-100 last:border-0">
            <button
              onClick={() => setOpenStep(isOpen ? null : step)}
              className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className={cn("w-2 h-2 rounded-full shrink-0", sc.dot)} />
              <span className={cn("text-[10px] font-bold flex-1 text-left", sc.text)}>
                {credoLabels[step] || step}
              </span>
              <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">
                {blocks.length} bloc{blocks.length > 1 ? "s" : ""}
              </span>
              <ArrowRight className={cn("h-3 w-3 text-gray-400 transition-transform", isOpen && "rotate-90")} />
            </button>
            {isOpen && (
              <div className="px-4 pb-3 space-y-1.5">
                {blocks.map(b => (
                  <div key={b.id} className={cn("flex items-start gap-2 px-3 py-2 rounded-lg border", sc.bg, sc.border)}>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5",
                      b.confidence >= 0.8 ? "bg-emerald-100 text-emerald-700" :
                      b.confidence >= 0.5 ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    )}>{Math.round(b.confidence * 100)}%</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-900 truncate">{b.title}</p>
                      <p className="text-[9px] text-gray-500 line-clamp-2 leading-relaxed">{b.summary.substring(0, 150)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
