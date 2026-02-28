"use client";

/**
 * SmartCanvas.tsx — Page d'accueil intelligente de CarlOS
 * Affiche des pastilles dynamiques basees sur l'analyse de CarlOS
 * de la progression et des besoins de l'utilisateur.
 * Sprint A — Frame Master V2
 */

import { useState, useEffect } from "react";
import {
  Zap,
  Brain,
  Scale,
  AlertTriangle,
  Target,
  Sparkles,
  MessageSquare,
  Bot,
  Loader2,
  FolderOpen,
  ArrowRight,
  Activity,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { fetchSuggestions, fetchHealth, type SuggestionItem, type SuggestionsResponse, type HealthResponse } from "./carlosApi";

// Icon mapping from string names to components
const ICON_MAP: Record<string, typeof Zap> = {
  zap: Zap,
  brain: Brain,
  scale: Scale,
  "alert-triangle": AlertTriangle,
  target: Target,
  sparkles: Sparkles,
  swords: MessageSquare,
  play: ArrowRight,
};

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; hover: string }> = {
  red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", hover: "hover:bg-red-100" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", hover: "hover:bg-amber-100" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", hover: "hover:bg-indigo-100" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", hover: "hover:bg-emerald-100" },
  violet: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", hover: "hover:bg-violet-100" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", hover: "hover:bg-blue-100" },
  fuchsia: { bg: "bg-fuchsia-50", border: "border-fuchsia-200", text: "text-fuchsia-700", hover: "hover:bg-fuchsia-100" },
  cyan: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", hover: "hover:bg-cyan-100" },
};

export function SmartCanvas({
  onStartChat,
  onOpenScenarios,
}: {
  onStartChat: (mode: string) => void;
  onOpenScenarios?: () => void;
}) {
  const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [sug, h] = await Promise.all([fetchSuggestions(1), fetchHealth()]);
        setSuggestions(sug);
        setHealth(h);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Connexion au serveur impossible");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-sm text-gray-500">Connexion a CarlOS...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">CarlOS est hors ligne</h3>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer"
          >
            Reessayer
          </button>
        </div>
      </div>
    );
  }

  const greeting = suggestions?.greeting || "Bonjour.";
  const quickFlows = suggestions?.suggestions.filter(s => s.action === "chat") || [];
  const resumeItems = suggestions?.suggestions.filter(s => s.action === "resume") || [];
  const projects = suggestions?.active_projects || [];

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Greeting + Status */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
              {health && (
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Systeme actif
                  </span>
                  <span>{health.souls_charges} SOULs</span>
                  <span>${health.budget_jour_usd.toFixed(2)} / ${health.budget_max_usd.toFixed(0)} budget</span>
                  {health.db_connectee && <span>DB connectee</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resume session (priority items) */}
        {resumeItems.length > 0 && (
          <div className="space-y-3">
            {resumeItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onStartChat(item.mode || "analyse")}
                className="w-full bg-blue-50 border-2 border-blue-200 rounded-xl px-5 py-4 flex items-center gap-4 hover:bg-blue-100 transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                  <ArrowRight className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-blue-800">{item.label}</div>
                  <div className="text-xs text-blue-600">{item.description}</div>
                </div>
                <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Reprendre
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Quick Flows — the pastilles */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              CarlOS te propose
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickFlows.map((flow) => {
              const colors = COLOR_MAP[flow.color] || COLOR_MAP.blue;
              const Icon = ICON_MAP[flow.icon] || Sparkles;
              return (
                <button
                  key={flow.id}
                  onClick={() => onStartChat(flow.mode || "analyse")}
                  className={cn(
                    "border rounded-xl px-4 py-4 flex items-start gap-3 transition-all cursor-pointer text-left",
                    colors.bg, colors.border, colors.hover,
                  )}
                >
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", colors.bg)}>
                    <Icon className={cn("h-5 w-5", colors.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn("text-sm font-bold", colors.text)}>{flow.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{flow.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Projects */}
        {projects.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Tes projets actifs
              </span>
            </div>
            <div className="space-y-2">
              {projects.map((proj) => (
                <button
                  key={proj.slug}
                  onClick={() => onStartChat("analyse")}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <FolderOpen className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{proj.nom}</div>
                    <div className="text-xs text-gray-400">{proj.secteur} — {proj.stage}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Simulations link */}
        {onOpenScenarios && (
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={onOpenScenarios}
              className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Activity className="h-3.5 w-3.5" />
              Voir les simulations de demonstration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
