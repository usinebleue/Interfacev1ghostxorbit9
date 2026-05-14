/**
 * LiveReflexionView.tsx — Phase Réflexion LIVE (workspace = zone OUTPUT)
 *
 * COPIE EXACTE des 8 étapes modélisées par Carl (phase-sections.ts):
 * 1. Diagnostic initial
 * 2. Brainstorm SCAMPER
 * 3. Synthèse brainstorm
 * 4. Analyse 5 Pourquoi
 * 5. Deep Search
 * 6. Synthèse recherche
 * 7. Challenge / Défense
 * 8. Pré-rapport
 *
 * SEUL CHANGEMENT vs ancien code: le workspace est PASSIF.
 * Il REÇOIT le contenu de la discussion (auto-capture).
 * Pas de boutons "Lancer" qui déclenchent le chat.
 *
 * Hero compact orange + SF sidebar w-[180px] + Contenu flex-1
 * Stage gating: chaque réponse bot débloque l'étape suivante.
 */

import { useState, useEffect } from "react";
import {
  Brain,
  Stethoscope,
  Lightbulb,
  Layers,
  Search,
  Globe,
  FileBarChart,
  Swords,
  FileText,
  CheckCircle2,
  Zap,
  X,
  Target,
  Crown,
  ArrowLeftRight,
  RotateCcw,
  Leaf,
  Shield,
  Eye,
  Sparkles,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import { SF } from "../core/styles";
import { useIsMobile } from "../../components/ui/use-mobile";
import { MobileSidebarSheet } from "../core/MobileSidebarSheet";
import { useChatContext } from "../../v2/context/ChatContext";
import { useAmorcer } from "../AmorcerContext";
// ═══ 8 étapes — EXACTEMENT comme modélisé par Carl ═══
const REFLEXION_STEPS: { id: string; title: string; subtitle: string; icon: React.ElementType; minStage: number }[] = [
  { id: "ref-1-diagnostic",        title: "Diagnostic initial",   subtitle: "Analyse de la situation",              icon: Stethoscope, minStage: 0 },
  { id: "ref-2-brainstorm",        title: "Brainstorm SCAMPER",   subtitle: "Idées créatives tous angles",          icon: Lightbulb,   minStage: 1 },
  { id: "ref-3-synthese-brainstorm", title: "Synthèse brainstorm", subtitle: "Regroupement et priorisation",        icon: Layers,      minStage: 2 },
  { id: "ref-4-cinq-pourquoi",     title: "Analyse 5 Pourquoi",   subtitle: "Causes racines",                       icon: Search,      minStage: 3 },
  { id: "ref-5-deep-search",       title: "Deep Search",          subtitle: "Données, benchmarks, pratiques",        icon: Globe,       minStage: 4 },
  { id: "ref-6-synthese-recherche", title: "Synthèse recherche",  subtitle: "Croisement sources et constats",        icon: FileBarChart, minStage: 5 },
  { id: "ref-7-challenge",         title: "Challenge / Défense",  subtitle: "Avocat du diable, angles morts",        icon: Swords,      minStage: 6 },
  { id: "ref-8-pre-rapport",       title: "Pré-rapport",          subtitle: "Synthèse et recommandations",           icon: FileText,    minStage: 7 },
];

interface LiveReflexionViewProps {
  context: string | null;
  onPhaseComplete?: () => void;
}

// MODE_PREFIX retiré — les modes sont maintenant des boutons d'ACTION directe (ReflexionModeActions)

// ═══ IDs d'étapes où les techniques de créativité sont pertinentes ═══
const EXPLORATION_STEP_IDS = ["ref-2-brainstorm", "ref-4-cinq-pourquoi", "ref-5-deep-search", "ref-7-challenge"];

export function LiveReflexionView({ context, onPhaseComplete }: LiveReflexionViewProps) {
  const isMobile = useIsMobile();
  const { chatStage, workflowItems, removeWorkflowItem, addWorkflowItem, getCristallise, activeBotCode, activePhase } = useAmorcer();
  const { sendMessage } = useChatContext();
  const displayContext = context || "Réflexion";

  // useWorkspaceCapture() → déplacé dans WorkspacePhasesPanel (toujours actif)

  const [activeStepId, setActiveStepId] = useState<string>("ref-1-diagnostic");

  // Auto-switch vers la dernière étape qui vient de recevoir du contenu
  useEffect(() => {
    const latestWithContent = [...REFLEXION_STEPS].reverse().find(s => getCristallise(s.id) !== null);
    if (latestWithContent && latestWithContent.id !== activeStepId) {
      setActiveStepId(latestWithContent.id);
    }
  }, [chatStage]);

  const activeStep = REFLEXION_STEPS.find(s => s.id === activeStepId) || REFLEXION_STEPS[0];
  const completedCount = REFLEXION_STEPS.filter(s => getCristallise(s.id) !== null).length;
  const progress = Math.round((completedCount / REFLEXION_STEPS.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 pb-12 space-y-4">

      {/* ═══ HERO COMPACT — orange (réflexion) ═══ */}
      <div className="relative rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all px-5 py-4 flex items-center gap-4 overflow-hidden">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-200 rounded-full blur-2xl opacity-40" />
        <div className="absolute -bottom-4 right-12 w-16 h-16 bg-amber-200 rounded-full blur-xl opacity-30" />
        <div className="relative z-10 p-2 rounded-xl bg-orange-50 border border-orange-100">
          <Brain className="h-4 w-4 text-orange-600 stroke-[2.5]" />
        </div>
        <div className="relative z-10 flex-1">
          <h2 className="text-sm font-bold text-gray-900">Réflexion</h2>
          <p className="text-xs text-gray-500 mt-0.5">{displayContext}</p>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-28 h-2 bg-orange-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-bold text-gray-900">{completedCount}/{REFLEXION_STEPS.length}</span>
        </div>
      </div>

      {/* ═══ SIDEBAR 8 ÉTAPES + CONTENU ═══ */}
      <div className={cn("flex gap-3", isMobile && "flex-col gap-0")}>
        {/* Sidebar */}
        {(() => {
          const activeLabel = activeStep?.title || "Réflexion";
          const sidebarContent = (<>
            {REFLEXION_STEPS.map((s) => {
              const isUnlocked = chatStage >= s.minStage;
              const isActive = activeStepId === s.id;
              const hasContent = getCristallise(s.id) !== null;
              return (
                <button
                  key={s.id}
                  onClick={() => isUnlocked && setActiveStepId(s.id)}
                  disabled={!isUnlocked}
                  className={cn(
                    SF.btnBase,
                    isActive ? SF.btnActive : isUnlocked ? SF.btnInactive : "opacity-40 cursor-not-allowed border border-transparent"
                  )}
                >
                  <s.icon className={cn(isActive ? SF.iconActive : isUnlocked ? SF.iconInactive : "h-3.5 w-3.5 text-gray-300")} />
                  <span className={cn(isActive ? SF.labelActive : isUnlocked ? SF.labelInactive : "text-[10px] text-gray-400")}>{s.title}</span>
                  {hasContent && (
                    <span className="ml-auto w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                    </span>
                  )}
                  {!hasContent && isUnlocked && chatStage === s.minStage && (
                    <span className="ml-auto w-3 h-3 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  )}
                </button>
              );
            })}
          </>);
          return isMobile ? (
            <MobileSidebarSheet currentLabel={activeLabel} itemCount={REFLEXION_STEPS.length}>
              {sidebarContent}
            </MobileSidebarSheet>
          ) : (
            <div className={SF.sidebarW}>
              {sidebarContent}
            </div>
          );
        })()}

        {/* Contenu */}
        <div className={SF.content}>
          {/* Modes de réflexion — boutons d'ACTION (chaque clic envoie un prompt au bot) */}
          <ReflexionModeActions context={displayContext} onSend={(prompt) => sendMessage(prompt, activeBotCode, undefined, undefined, { workspacePhase: "reflexion" })} />

          <StepContent
            step={activeStep}
            captured={getCristallise(activeStep.id)}
            isUnlocked={chatStage >= activeStep.minStage}
            onPin={(text) => addWorkflowItem("reflexion", text.substring(0, 300), "capture")}
            onDeepen={(topic) => sendMessage(`Approfondir en détail: ${topic}`, activeBotCode, undefined, undefined, { workspacePhase: "reflexion" })}
          />

          {/* Techniques de créativité — visibles sur les étapes d'exploration */}
          {EXPLORATION_STEP_IDS.includes(activeStepId) && (
            <TechniqueSelector
              context={displayContext}
              modePrefix=""
              onSend={(prompt) => sendMessage(prompt, activeBotCode, undefined, undefined, { workspacePhase: "reflexion" })}
            />
          )}

          {/* Notes capturées */}
          {workflowItems.filter(w => w.phase === "reflexion").length > 0 && (
            <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50/50 p-4">
              <h4 className="text-[10px] font-bold text-orange-700 uppercase tracking-wider mb-2">Notes capturées ({workflowItems.filter(w => w.phase === "reflexion").length})</h4>
              <div className="space-y-1.5">
                {workflowItems.filter(w => w.phase === "reflexion").map(item => (
                  <div key={item.id} className="flex items-start gap-2 group/note">
                    <Zap className="h-3 w-3 text-orange-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-gray-700 leading-relaxed flex-1">{item.text}</p>
                    <button onClick={() => removeWorkflowItem(item.id)} className="p-0.5 rounded opacity-0 group-hover/note:opacity-100 hover:bg-red-100 transition-all cursor-pointer shrink-0" title="Retirer">
                      <X className="h-3 w-3 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase transitions via ControlTowerPanel sidebar + progress bar uniquement (Carl feedback 13 mai) */}
        </div>
      </div>

    </div>
  );
}

// ═══ Techniques de créativité — grille cliquable ═══
function TechniqueSelector({ context, modePrefix, onSend }: {
  context: string;
  modePrefix: string;
  onSend: (prompt: string) => void;
}) {
  const TECHNIQUES = [
    { id: "scamper", label: "SCAMPER", icon: Lightbulb,
      color: "bg-amber-100 text-amber-700 border-amber-300",
      prompt: `${modePrefix}Applique SCAMPER (Substituer, Combiner, Adapter, Modifier, Put to other use, Éliminer, Réorganiser) à: ${context}` },
    { id: "5pourquoi", label: "5 Pourquoi", icon: Search,
      color: "bg-orange-100 text-orange-700 border-orange-300",
      prompt: `${modePrefix}Analyse les 5 Pourquoi en profondeur pour: ${context}` },
    { id: "6chapeaux", label: "6 Chapeaux", icon: Crown,
      color: "bg-violet-100 text-violet-700 border-violet-300",
      prompt: `${modePrefix}Analyse avec les 6 Chapeaux de Bono pour: ${context}` },
    { id: "analogie", label: "Analogie", icon: ArrowLeftRight,
      color: "bg-blue-100 text-blue-700 border-blue-300",
      prompt: `${modePrefix}Trouve des analogies d'autres industries pour: ${context}` },
    { id: "inversion", label: "Inversion", icon: RotateCcw,
      color: "bg-pink-100 text-pink-700 border-pink-300",
      prompt: `${modePrefix}Inverse le problème pour: ${context}` },
    { id: "biomimetisme", label: "Biomimétisme", icon: Leaf,
      color: "bg-emerald-100 text-emerald-700 border-emerald-300",
      prompt: `${modePrefix}Applique le biomimétisme à: ${context}` },
    { id: "deepsearch", label: "Deep Search", icon: Globe,
      color: "bg-cyan-100 text-cyan-700 border-cyan-300",
      prompt: `${modePrefix}Recherche approfondie: tendances, benchmarks pour: ${context}` },
    { id: "challenge", label: "Challenge", icon: Shield,
      color: "bg-red-100 text-red-700 border-red-300",
      prompt: `${modePrefix}Challenge cette approche, trouve les failles: ${context}` },
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

// ═══ Modes de réflexion — boutons d'ACTION (chaque clic ENVOIE un prompt au bot) ═══
function ReflexionModeActions({ context, onSend }: {
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

// ═══ Parser le contenu en sections individuelles (concepts numérotés, items à puces) ═══
function parseContentSections(text: string): { title: string; body: string }[] {
  const lines = text.split('\n');
  const sections: { title: string; body: string }[] = [];
  let current: { title: string; body: string } | null = null;

  for (const line of lines) {
    // Détecter les items numérotés (1. ..., 2. ...) ou avec emoji en tête
    const isSection = /^\s*\d+[\.\)]\s+/.test(line) || /^\s*[🎬🎤🧩💡🔍⚡📊🎯✅❌🟢🔴🧠⚙️🏭📈🔥⭐🚀]\s+/.test(line);
    if (isSection) {
      if (current) sections.push(current);
      current = { title: line.trim(), body: '' };
    } else if (current) {
      current.body += (current.body ? '\n' : '') + line;
    } else {
      // Préambule avant les sections numérotées
      if (!sections.length) {
        current = { title: '', body: line };
      }
    }
  }
  if (current) sections.push(current);
  return sections;
}

// ═══ Contenu d'une étape — avec PARSING en sections individuelles ═══
function StepContent({ step, captured, isUnlocked, onPin, onDeepen }: {
  step: typeof REFLEXION_STEPS[number];
  captured: string | null;
  isUnlocked: boolean;
  onPin?: (text: string) => void;
  onDeepen?: (topic: string) => void;
}) {
  const [appeared, setAppeared] = useState(false);
  useEffect(() => { setAppeared(false); const t = setTimeout(() => setAppeared(true), 80); return () => clearTimeout(t); }, [step.id]);

  return (
    <div className={cn("transition-all duration-300", appeared ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
          <step.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <h3 className="text-sm font-bold text-gray-900 flex-1">{step.title}</h3>
          {captured && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">Cristallisé</span>
          )}
          {!captured && isUnlocked && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 animate-pulse">En attente</span>
          )}
          {!isUnlocked && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Verrouillé</span>
          )}
        </div>
        {/* Body */}
        <div className="px-5 py-4">
          {captured ? (
            (() => {
              const sections = parseContentSections(captured);
              // Si 2+ sections détectées → afficher comme cards individuelles
              if (sections.length >= 2 && sections.some(s => s.title)) {
                return (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {sections.map((s, i) => (
                      <div key={i} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 group/item hover:border-orange-200 transition-colors">
                        {s.title && <p className="text-xs font-bold text-gray-900 mb-1">{s.title}</p>}
                        {s.body.trim() && <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap">{s.body.trim()}</p>}
                        <div className="flex gap-1.5 mt-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          {onPin && (
                            <button onClick={() => onPin(s.title + (s.body ? '\n' + s.body.trim() : ''))}
                              className="text-[9px] px-2 py-0.5 rounded border border-emerald-200 text-emerald-600 hover:bg-emerald-50 cursor-pointer font-medium">
                              Épingler
                            </button>
                          )}
                          {onDeepen && (
                            <button onClick={() => onDeepen(s.title)}
                              className="text-[9px] px-2 py-0.5 rounded border border-orange-200 text-orange-600 hover:bg-orange-50 cursor-pointer font-medium">
                              Approfondir
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
              // Sinon → texte simple
              return (
                <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                  {captured}
                </div>
              );
            })()
          ) : isUnlocked ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center animate-pulse">
                <step.icon className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">En attente de la discussion...</p>
                <p className="text-[10px] text-gray-400">{step.subtitle} — le contenu apparaîtra ici automatiquement.</p>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 italic text-center">Cette étape se débloquera au fil de la discussion.</p>
          )}
        </div>
      </div>
    </div>
  );
}
