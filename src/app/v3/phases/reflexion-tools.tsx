/**
 * reflexion-tools.tsx — Outils de réflexion extraits de LiveReflexionView
 *
 * Composants réutilisables:
 * - ReflexionModeActions: 8 pills mode (Analyse/Débat/Brainstorm/...)
 * - TechniqueSelector: 8 boutons technique en grid-cols-2
 * - parseContentSections: Détecte items numérotés, split en cards
 *
 * Extraits pour être réutilisés dans LiveDiscussionView (fusion discussion + réflexion)
 */

import {
  Eye, Swords, Lightbulb, Target, Sparkles, CheckCircle2, Zap, Brain,
  Search, Crown, ArrowLeftRight, RotateCcw, Leaf, Globe, Shield,
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

// ═══ Techniques de créativité — grille cliquable ═══

export function TechniqueSelector({ context, onSend }: {
  context: string;
  onSend: (prompt: string) => void;
}) {
  const TECHNIQUES = [
    { id: "scamper", label: "SCAMPER", icon: Lightbulb,
      color: "bg-amber-100 text-amber-700 border-amber-300",
      prompt: `Applique SCAMPER (Substituer, Combiner, Adapter, Modifier, Put to other use, Éliminer, Réorganiser) à: ${context}` },
    { id: "5pourquoi", label: "5 Pourquoi", icon: Search,
      color: "bg-orange-100 text-orange-700 border-orange-300",
      prompt: `Analyse les 5 Pourquoi en profondeur pour: ${context}` },
    { id: "6chapeaux", label: "6 Chapeaux", icon: Crown,
      color: "bg-violet-100 text-violet-700 border-violet-300",
      prompt: `Analyse avec les 6 Chapeaux de Bono pour: ${context}` },
    { id: "analogie", label: "Analogie", icon: ArrowLeftRight,
      color: "bg-blue-100 text-blue-700 border-blue-300",
      prompt: `Trouve des analogies d'autres industries pour: ${context}` },
    { id: "inversion", label: "Inversion", icon: RotateCcw,
      color: "bg-pink-100 text-pink-700 border-pink-300",
      prompt: `Inverse le problème pour: ${context}` },
    { id: "biomimetisme", label: "Biomimétisme", icon: Leaf,
      color: "bg-emerald-100 text-emerald-700 border-emerald-300",
      prompt: `Applique le biomimétisme à: ${context}` },
    { id: "deepsearch", label: "Deep Search", icon: Globe,
      color: "bg-cyan-100 text-cyan-700 border-cyan-300",
      prompt: `Recherche approfondie: tendances, benchmarks pour: ${context}` },
    { id: "challenge", label: "Challenge", icon: Shield,
      color: "bg-red-100 text-red-700 border-red-300",
      prompt: `Challenge cette approche, trouve les failles: ${context}` },
  ];

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 space-y-3 mt-3">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
        Techniques de créativité — cliquez pour activer
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {TECHNIQUES.map(t => (
          <button key={t.id} onClick={() => onSend(t.prompt)}
            className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors hover:shadow-sm", t.color)}>
            <t.icon className="h-3.5 w-3.5 shrink-0" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
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

// ═══ IDs des 5 outils réflexion dans la sidebar ═══

export const REFLEXION_TOOL_IDS = [
  { id: "diagnostic", label: "Diagnostic", icon: Eye, prompt: (ctx: string) => `Fais un diagnostic complet de: ${ctx}` },
  { id: "scamper", label: "SCAMPER", icon: Lightbulb, prompt: (ctx: string) => `Applique SCAMPER à: ${ctx}` },
  { id: "5pourquoi", label: "5 Pourquoi", icon: Search, prompt: (ctx: string) => `Analyse les 5 Pourquoi pour: ${ctx}` },
  { id: "deepsearch", label: "Deep Search", icon: Globe, prompt: (ctx: string) => `Recherche approfondie pour: ${ctx}` },
  { id: "challenge", label: "Challenge", icon: Shield, prompt: (ctx: string) => `Challenge et trouve les failles de: ${ctx}` },
] as const;
