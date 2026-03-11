/**
 * CarlOSHooks.tsx — Zone dynamique de process robot AI
 * 5 zones: Voice Waveform + Processus Reflexion + Mix Equipe + Hooks Contextuels + Quick Action
 * Le sidebar droit devient un tableau de bord cognitif temps reel
 * Sprint B — Session 51
 */

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  Target,
  X,
  ChevronRight,
  Brain,
  Search,
  FileText,
  CheckCircle2,
  Users,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { useFrameMaster } from "../../context/FrameMasterContext";
import { BOT_AVATAR, BOT_SUBTITLE } from "../../api/types";

// ================================================================
// THINKING PROCESS — Processus de reflexion CarlOS
// ================================================================

interface ThinkingStep {
  id: string;
  label: string;
  icon: React.ElementType;
  status: "done" | "active" | "pending";
  detail?: string;
}

function ThinkingProcess({ steps, question }: { steps: ThinkingStep[]; question: string }) {
  return (
    <div className="rounded-lg border border-violet-200 bg-gradient-to-b from-violet-50 to-white p-2.5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Brain className="h-3.5 w-3.5 text-violet-600" />
        <span className="text-[9px] font-bold text-violet-700 uppercase tracking-wide">Processus de reflexion</span>
        <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 font-bold">ACTIF</span>
      </div>

      {/* Question */}
      <div className="text-[9px] text-violet-600 italic mb-2 px-1 truncate">"{question}"</div>

      {/* Steps */}
      <div className="space-y-1">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex items-center gap-2">
              {/* Step indicator */}
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all",
                step.status === "done" ? "bg-emerald-500" :
                step.status === "active" ? "bg-violet-500 animate-pulse" :
                "bg-gray-200"
              )}>
                {step.status === "done" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                ) : (
                  <Icon className={cn("h-3.5 w-3.5", step.status === "active" ? "text-white" : "text-gray-400")} />
                )}
              </div>

              {/* Label + detail */}
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-[9px] font-medium",
                  step.status === "done" ? "text-emerald-700" :
                  step.status === "active" ? "text-violet-700 font-bold" :
                  "text-gray-400"
                )}>
                  {step.label}
                </div>
                {step.detail && step.status !== "pending" && (
                  <div className="text-[8px] text-gray-400 truncate">{step.detail}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
// TEAM ASSEMBLY — Mix d'equipe dynamique
// ================================================================

interface TeamMember {
  code: string;
  role: string;
  status: "joined" | "joining" | "called";
}

function TeamAssembly({ members, context }: { members: TeamMember[]; context: string }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-gradient-to-b from-blue-50 to-white p-2.5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-3.5 w-3.5 text-blue-600" />
        <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wide">Mix Equipe</span>
        <span className="ml-auto text-[8px] text-blue-500">{members.length} agents</span>
      </div>

      {/* Context */}
      <div className="text-[9px] text-gray-500 mb-2">{context}</div>

      {/* Members */}
      <div className="space-y-1.5">
        {members.map((m, i) => {
          const avatar = BOT_AVATAR[m.code] || BOT_AVATAR["BCO"];
          const subtitle = BOT_SUBTITLE[m.code] || m.role;
          return (
            <div
              key={m.code}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all",
                m.status === "joined" ? "bg-white border-emerald-200" :
                m.status === "joining" ? "bg-blue-50/50 border-blue-200 animate-pulse" :
                "bg-gray-50 border-gray-200"
              )}
              style={{ animationDelay: `${i * 200}ms` }}
            >
              {/* Avatar */}
              <div className={cn(
                "w-6 h-6 rounded-full overflow-hidden ring-2 shrink-0",
                m.status === "joined" ? "ring-emerald-300" :
                m.status === "joining" ? "ring-blue-300" :
                "ring-gray-200"
              )}>
                <img src={avatar} alt={m.code} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-bold text-gray-700">{m.code}</div>
                <div className="text-[8px] text-gray-400 truncate">{subtitle}</div>
              </div>

              {/* Status */}
              <div className={cn(
                "text-[8px] font-bold px-1.5 py-0.5 rounded",
                m.status === "joined" ? "bg-emerald-100 text-emerald-700" :
                m.status === "joining" ? "bg-blue-100 text-blue-700" :
                "bg-gray-100 text-gray-500"
              )}>
                {m.status === "joined" ? "ACTIF" : m.status === "joining" ? "REJOINT..." : "APPELE"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
// HOOKS DATA — Messages contextuels de CarlOS
// ================================================================

interface CarlOSHook {
  id: string;
  type: "greeting" | "suggestion" | "alert" | "nudge" | "insight";
  message: string;
  action?: { label: string; view: string };
  bot?: string;
  priority: number;
}

const TYPE_CONFIG = {
  greeting:   { icon: MessageSquare, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
  suggestion: { icon: Lightbulb, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  alert:      { icon: AlertTriangle, bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500" },
  nudge:      { icon: Target, bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", dot: "bg-violet-500" },
  insight:    { icon: Sparkles, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
};

const VIEW_HOOKS: Record<string, CarlOSHook[]> = {
  dashboard: [
    { id: "dash-1", type: "greeting", message: "Bonjour! Vos KPIs sont stables. Voulez-vous qu'on regarde les tendances?", priority: 1 },
    { id: "dash-2", type: "suggestion", message: "3 discussions sont en attente de verdict. On les ferme ensemble?", action: { label: "Voir les discussions", view: "mes-chantiers" }, priority: 2 },
  ],
  department: [
    { id: "dept-1", type: "greeting", message: "Voici votre departement. Cliquez sur un bloc pour qu'on l'explore.", priority: 1 },
    { id: "dept-2", type: "nudge", message: "2 missions sont en retard. On fait le point?", priority: 2 },
  ],
  cockpit: [
    { id: "cock-1", type: "insight", message: "Score VITAA global en hausse. Pilier 'Actifs' merite attention.", priority: 2 },
  ],
  health: [
    { id: "health-1", type: "alert", message: "Dimension 'Temps' en zone orange — 3 projets depassent les delais.", priority: 1 },
  ],
  "mes-chantiers": [
    { id: "mc-1", type: "suggestion", message: "5 discussions pourraient devenir des missions. On qualifie?", priority: 2 },
  ],
  "live-chat": [
    { id: "lc-1", type: "greeting", message: "Discussion en cours. Je mobilise les specialistes au besoin.", priority: 1 },
  ],
  "board-room": [
    { id: "br-1", type: "greeting", message: "Board Room. Proposez un sujet pour lancer le debat.", priority: 1 },
  ],
  "war-room": [
    { id: "wr-1", type: "alert", message: "War Room activee. Decrivez la situation critique.", priority: 1 },
  ],
  "think-room": [
    { id: "tr-1", type: "suggestion", message: "Think Room. Partagez votre idee — 6 etapes vers le Go/No-Go.", priority: 1 },
  ],
  "espace-bureau": [
    { id: "eb-1", type: "nudge", message: "4 idees non classees. On les rattache a des projets?", priority: 3 },
  ],
};

const GENERIC_HOOKS: CarlOSHook[] = [
  { id: "gen-trailing", type: "alert", message: "Une discussion traine depuis 3 jours sans conclusion.", action: { label: "Resoudre", view: "mes-chantiers" }, priority: 2 },
];

// ================================================================
// DEMO DATA — Exemples simules pour montrer les zones dynamiques
// ================================================================

const DEMO_THINKING_STEPS: ThinkingStep[] = [
  { id: "t1", label: "Analyse du contexte", icon: Search, status: "done", detail: "PME manufacturiere, 45 employes, secteur metal" },
  { id: "t2", label: "Recherche GHML", icon: FileText, status: "done", detail: "3 patterns trouves dans Tableau Periodique" },
  { id: "t3", label: "Synthese multi-agent", icon: Brain, status: "active", detail: "BCT + BCF + BCS en trisociation..." },
  { id: "t4", label: "Generation recommandation", icon: Sparkles, status: "pending" },
];

const DEMO_TEAM: TeamMember[] = [
  { code: "BCO", role: "CEO — Orchestrateur", status: "joined" },
  { code: "BCT", role: "CTO — Analyse technique", status: "joined" },
  { code: "BCF", role: "CFO — Impact financier", status: "joining" },
  { code: "BCS", role: "CSO — Strategie", status: "called" },
];

// ================================================================
// MAIN COMPONENT
// ================================================================

export function CarlOSHooks() {
  const { activeView, activeBotCode, setActiveView, navigateToDepartment } = useFrameMaster();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  // Demo states — driven by real events in production
  const [showThinking, setShowThinking] = useState(true);
  const [showTeam, setShowTeam] = useState(true);

  useEffect(() => {
    setDismissedIds(new Set());
  }, [activeView]);

  const dismiss = useCallback((id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  }, []);

  const handleAction = useCallback((view: string) => {
    if (view === "department") {
      navigateToDepartment(activeBotCode, "department");
    } else {
      setActiveView(view as any);
    }
  }, [setActiveView, navigateToDepartment, activeBotCode]);

  const viewHooks = VIEW_HOOKS[activeView] || [];
  const allHooks = [...viewHooks, ...GENERIC_HOOKS]
    .filter((h) => !dismissedIds.has(h.id))
    .sort((a, b) => a.priority - b.priority);

  const botAvatar = BOT_AVATAR[activeBotCode] || BOT_AVATAR["BCO"];

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="px-3 py-2 space-y-2">
        {/* Header compact */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-white shadow-sm shrink-0">
            <img src={botAvatar} alt="CarlOS" className="w-full h-full object-cover" />
          </div>
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">CarlOS — Process AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
        </div>

        {/* ---- ZONE 1: Thinking Process ---- */}
        {showThinking && (
          <ThinkingProcess
            steps={DEMO_THINKING_STEPS}
            question="Comment optimiser ma chaine de production?"
          />
        )}

        {/* ---- ZONE 2: Team Assembly ---- */}
        {showTeam && (
          <TeamAssembly
            members={DEMO_TEAM}
            context="Trisociation pour analyse strategique"
          />
        )}

        {/* ---- ZONE 3: Hook cards contextuels ---- */}
        {allHooks.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">Hooks</div>
            {allHooks.map((hook, i) => {
              const cfg = TYPE_CONFIG[hook.type];
              return (
                <div
                  key={hook.id}
                  className={cn("rounded-lg border p-2 transition-all", cfg.bg, cfg.border)}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start gap-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full inline-block mt-1 shrink-0", cfg.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-[9px] leading-relaxed", cfg.text)}>{hook.message}</p>
                      {hook.action && (
                        <button
                          onClick={() => handleAction(hook.action!.view)}
                          className={cn("mt-1 flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md transition-colors", cfg.text, "hover:bg-white/50")}
                        >
                          {hook.action.label}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <button onClick={() => dismiss(hook.id)} className="shrink-0 p-0.5 rounded-full hover:bg-white/50 transition-colors">
                      <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ---- ZONE 5: Demo toggles (dev only) ---- */}
        <div className="rounded-lg border border-dashed border-gray-300 p-2">
          <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Demo — Toggles dev</div>
          <div className="flex flex-wrap gap-1">
            {[
              { label: "Thinking", active: showThinking, toggle: () => setShowThinking(!showThinking), icon: Brain },
              { label: "Team", active: showTeam, toggle: () => setShowTeam(!showTeam), icon: Users },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.label}
                  onClick={t.toggle}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md text-[8px] font-bold transition-colors",
                    t.active ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-gray-100 text-gray-400 border border-gray-200"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick action — aller au canvas */}
        <button
          onClick={() => setActiveView("live-chat")}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 transition-colors group"
        >
          <MessageSquare className="h-3.5 w-3.5 text-blue-400 group-hover:text-blue-600" />
          <span className="text-[9px] font-medium text-blue-500 group-hover:text-blue-700 flex-1 text-left">Ouvrir une discussion approfondie...</span>
          <ChevronRight className="h-3.5 w-3.5 text-blue-300 group-hover:text-blue-500" />
        </button>
      </div>
    </div>
  );
}
