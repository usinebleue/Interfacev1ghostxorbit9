/**
 * MemoryPanel.tsx — Panneau memoire CarlOS (cross-canal Telegram + Web)
 * Affiche les insights extraits, activites recentes, et permet la recherche
 * dans la base knowledge.json partagee entre Telegram et Web
 */

import { useState, useEffect, useCallback } from "react";
import {
  Brain,
  Search,
  Clock,
  MessageSquare,
  Zap,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { api } from "../../api/client";

interface Activity {
  type: string;
  agent: string;
  description: string;
  timestamp: string;
  tier?: string;
  cout?: number;
}

interface MemorySummary {
  total_entries: number;
  last_updated: string;
  top_agents: Record<string, number>;
  recent_decisions: number;
  knowledge_size_kb: number;
}

export function MemoryPanel() {
  const [tab, setTab] = useState<"activities" | "search">("activities");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [summary, setSummary] = useState<MemorySummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger activites + summary au mount
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [actRes, sumRes] = await Promise.all([
        api.memoryActivities(20),
        api.memorySummary(),
      ]);
      setActivities(actRes.activities as Activity[]);
      setSummary(sumRes as unknown as MemorySummary);
    } catch (e) {
      setError("Impossible de charger la memoire");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Recherche
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.memorySearch(searchQuery.trim(), 10);
      setSearchResults(res.results || []);
    } catch {
      setError("Erreur de recherche");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50">
        <Brain className="h-4 w-4 text-purple-500" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-gray-900">Memoire CarlOS</div>
          <div className="text-[9px] text-gray-500">
            {summary ? `${summary.total_entries} insights` : "Chargement..."}
          </div>
        </div>
        <button
          onClick={loadData}
          className="p-1 rounded hover:bg-gray-200 transition-colors"
          title="Rafraichir"
        >
          <RefreshCw className={cn("h-3.5 w-3.5 text-gray-400", loading && "animate-spin")} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b px-2 py-1 gap-1">
        <button
          onClick={() => setTab("activities")}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium transition-colors",
            tab === "activities" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          Activites
        </button>
        <button
          onClick={() => setTab("search")}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium transition-colors",
            tab === "search" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
          )}
        >
          <Search className="h-3.5 w-3.5" />
          Recherche
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {error && (
          <div className="flex items-center gap-1.5 text-[9px] text-red-600 bg-red-50 rounded px-2 py-1.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        {loading && activities.length === 0 && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}

        {tab === "activities" && (
          <>
            {activities.map((act, i) => (
              <div key={i} className="bg-gray-50 rounded-lg px-2.5 py-2 text-[9px]">
                <div className="flex items-center gap-1.5">
                  {act.type === "message" ? (
                    <MessageSquare className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  ) : (
                    <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  )}
                  <span className="font-medium text-gray-700 truncate">{act.agent || "CarlOS"}</span>
                  {act.tier && (
                    <span className="text-gray-400 ml-auto shrink-0">T{act.tier}</span>
                  )}
                </div>
                <p className="text-gray-600 mt-0.5 line-clamp-2">{act.description}</p>
                {act.timestamp && (
                  <div className="text-gray-400 mt-0.5">
                    {new Date(act.timestamp).toLocaleString([], {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
            ))}
            {activities.length === 0 && !loading && (
              <div className="text-center py-4 text-[9px] text-gray-400">
                Aucune activite recente
              </div>
            )}
          </>
        )}

        {tab === "search" && (
          <>
            {/* Search input */}
            <div className="flex gap-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Chercher dans la memoire..."
                className="flex-1 text-xs px-2 py-1.5 border rounded bg-white focus:outline-none focus:ring-1 focus:ring-purple-300"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-2 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 disabled:opacity-50"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Search results */}
            {searchResults.map((result, i) => (
              <div key={i} className="bg-purple-50 border border-purple-100 rounded-lg px-2.5 py-2 text-[9px] text-gray-700">
                {result}
              </div>
            ))}
            {searchResults.length === 0 && searchQuery && !loading && (
              <div className="text-center py-4 text-[9px] text-gray-400">
                Aucun resultat pour "{searchQuery}"
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer — summary stats */}
      {summary && (
        <div className="px-2 py-1.5 border-t bg-gray-50 text-[9px] text-gray-400 flex items-center justify-between">
          <span>{summary.total_entries} insights</span>
          <span>{summary.knowledge_size_kb ? `${summary.knowledge_size_kb}KB` : ""}</span>
        </div>
      )}
    </div>
  );
}
