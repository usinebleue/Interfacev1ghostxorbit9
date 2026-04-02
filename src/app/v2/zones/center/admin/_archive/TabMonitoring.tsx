/**
 * TabMonitoring.tsx — Monitoring admin
 * Sous-tabs: Sante | Activites | Tensions | Decisions
 * God Mode: toutes les sous-tabs
 * Instance: Activites, Tensions, Decisions (pas Sante)
 */

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  ScrollText,
  AlertTriangle,
  CheckCircle2,
  Inbox,
  Loader2,
  XCircle,
  Undo2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { BotBadge } from "../shared/SectionComponents";

interface Props {
  mode: "god" | "instance";
  tenantId?: number;
}

const SERVICES = ["API", "PostgreSQL", "LiveKit", "Nginx", "ElevenLabs"];

export function TabMonitoring({ mode, tenantId }: Props) {
  const subtabs = mode === "god"
    ? [
        { id: "sante", label: "Sante", icon: Activity },
        { id: "activites", label: "Activites", icon: ScrollText },
        { id: "tensions", label: "Tensions", icon: AlertTriangle },
        { id: "decisions", label: "Decisions", icon: CheckCircle2 },
      ]
    : [
        { id: "activites", label: "Activites", icon: ScrollText },
        { id: "tensions", label: "Tensions", icon: AlertTriangle },
        { id: "decisions", label: "Decisions", icon: CheckCircle2 },
      ];

  const [sub, setSub] = useState(subtabs[0].id);

  // --- Sante ---
  const [systemStatus, setSystemStatus] = useState<Record<string, unknown> | null>(null);
  const [santeLoading, setSanteLoading] = useState(false);
  const [santeError, setSanteError] = useState<string | null>(null);

  // --- Activites ---
  const [activities, setActivities] = useState<Record<string, unknown>[]>([]);
  const [activitesLoading, setActivitesLoading] = useState(false);

  // --- Tensions ---
  const [tensions, setTensions] = useState<any[]>([]);
  const [tensionsLoading, setTensionsLoading] = useState(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  // --- Decisions ---
  const [decisions, setDecisions] = useState<any[]>([]);
  const [decisionsLoading, setDecisionsLoading] = useState(false);
  const [reversingId, setReversingId] = useState<number | null>(null);

  // --- Loaders ---

  const loadSante = useCallback(() => {
    if (mode !== "god") return;
    setSanteLoading(true);
    setSanteError(null);
    api.getSystemStatus()
      .then((data) => setSystemStatus(data))
      .catch((err) => setSanteError(err.message || "Erreur systeme"))
      .finally(() => setSanteLoading(false));
  }, [mode]);

  const loadActivites = useCallback(() => {
    setActivitesLoading(true);
    try {
      api.memoryActivities(20)
        .then((data: any) => {
          const list = data?.activities || data;
          if (Array.isArray(list)) setActivities(list);
        })
        .catch(() => setActivities([]))
        .finally(() => setActivitesLoading(false));
    } catch {
      setActivities([]);
      setActivitesLoading(false);
    }
  }, []);

  const loadTensions = useCallback(() => {
    setTensionsLoading(true);
    api.listTensions()
      .then((data: any) => {
        const list = data?.tensions || data;
        if (Array.isArray(list)) setTensions(list);
      })
      .catch(() => setTensions([]))
      .finally(() => setTensionsLoading(false));
  }, []);

  const loadDecisions = useCallback(() => {
    setDecisionsLoading(true);
    api.listDecisions({ limit: 20 })
      .then((data: any) => {
        const list = data?.decisions || data;
        if (Array.isArray(list)) setDecisions(list);
      })
      .catch(() => setDecisions([]))
      .finally(() => setDecisionsLoading(false));
  }, []);

  useEffect(() => {
    if (sub === "sante") loadSante();
    else if (sub === "activites") loadActivites();
    else if (sub === "tensions") loadTensions();
    else if (sub === "decisions") loadDecisions();
  }, [sub, loadSante, loadActivites, loadTensions, loadDecisions]);

  // --- Handlers ---

  const handleResolveTension = async (id: number) => {
    setResolvingId(id);
    try {
      await api.resolveTension(id);
      loadTensions();
    } catch {
      // silently fail
    } finally {
      setResolvingId(null);
    }
  };

  const handleReverseDecision = async (id: number) => {
    setReversingId(id);
    try {
      await api.reverseDecision(id);
      loadDecisions();
    } catch {
      // silently fail
    } finally {
      setReversingId(null);
    }
  };

  // --- Helpers ---

  function serviceStatus(name: string): boolean {
    if (!systemStatus) return false;
    // Try common shapes: { services: { name: ok } } or flat { api: ok }
    const services = (systemStatus as any).services;
    if (services && typeof services === "object") {
      const key = Object.keys(services).find((k) => k.toLowerCase().includes(name.toLowerCase()));
      if (key) return services[key] === true || services[key] === "ok" || services[key] === "up";
    }
    // If status returns { status: "ok" } treat everything as up
    if ((systemStatus as any).status === "ok") return true;
    return false;
  }

  const typeBadgeColor = (type: string) => {
    switch (type) {
      case "action": return "bg-blue-100 text-blue-700 border-blue-200";
      case "creation": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "suppression": return "bg-red-100 text-red-700 border-red-200";
      case "modification": return "bg-amber-100 text-amber-700 border-amber-200";
      case "recommandation": return "bg-purple-100 text-purple-700 border-purple-200";
      case "navigation": return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="space-y-3">
      {/* Sub-tabs */}
      <div className="flex gap-1.5">
        {subtabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              sub === t.id
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* --- SANTE — God only --- */}
      {sub === "sante" && mode === "god" && (
        <div className="space-y-2">
          {santeLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Chargement...</span>
            </div>
          ) : santeError ? (
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-600 to-red-500">
                <XCircle className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Erreur</span>
              </div>
              <div className="px-3 py-3">
                <p className="text-xs text-red-600">{santeError}</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SERVICES.map((name) => {
                const ok = systemStatus ? serviceStatus(name) : false;
                return (
                  <Card key={name} className="p-0 overflow-hidden">
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-2 bg-gradient-to-r",
                      ok ? "from-emerald-600 to-emerald-500" : "from-red-600 to-red-500"
                    )}>
                      {ok
                        ? <Wifi className="h-4 w-4 text-white" />
                        : <WifiOff className="h-4 w-4 text-white" />
                      }
                      <span className="text-sm font-bold text-white">{name}</span>
                    </div>
                    <div className="px-3 py-2">
                      <div className={cn("text-2xl font-bold", ok ? "text-emerald-600" : "text-red-600")}>
                        {ok ? "OK" : "OFF"}
                      </div>
                      <div className="text-[9px] text-gray-500">
                        {ok ? "En ligne" : "Hors ligne"}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- ACTIVITES --- */}
      {sub === "activites" && (
        <div className="space-y-2">
          {activitesLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Chargement...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Inbox className="h-8 w-8" />
              <span className="text-xs">Aucune activite recente</span>
            </div>
          ) : (
            activities.map((a, i) => (
              <Card key={i} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-800 truncate">
                      {(a as any).description || (a as any).action || (a as any).message || JSON.stringify(a).slice(0, 80)}
                    </p>
                    {(a as any).type && (
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                        typeBadgeColor((a as any).type)
                      )}>
                        {(a as any).type}
                      </span>
                    )}
                  </div>
                  {((a as any).timestamp || (a as any).created_at || (a as any).time) && (
                    <span className="text-[9px] text-gray-400 shrink-0">
                      {new Date((a as any).timestamp || (a as any).created_at || (a as any).time).toLocaleString("fr-CA", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* --- TENSIONS --- */}
      {sub === "tensions" && (
        <div className="space-y-2">
          {tensionsLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Chargement...</span>
            </div>
          ) : tensions.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Inbox className="h-8 w-8" />
              <span className="text-xs">Aucune tension</span>
            </div>
          ) : (
            tensions.map((t: any) => (
              <Card key={t.id} className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {t.titre || t.description || `Tension #${t.id}`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {t.type_vitaa && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-violet-100 text-violet-700 border-violet-200">
                          {t.type_vitaa}
                        </span>
                      )}
                      {t.intensite && (
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                          t.intensite === "critique" ? "bg-red-100 text-red-700 border-red-200"
                            : t.intensite === "haute" ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-yellow-100 text-yellow-700 border-yellow-200"
                        )}>
                          {t.intensite}
                        </span>
                      )}
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                        t.status === "active" ? "bg-blue-100 text-blue-700 border-blue-200"
                          : t.status === "resolved" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      )}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                  {t.status === "active" && (
                    <button
                      onClick={() => handleResolveTension(t.id)}
                      disabled={resolvingId === t.id}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-medium transition-colors",
                        resolvingId === t.id
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      )}
                    >
                      {resolvingId === t.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Resoudre
                    </button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* --- DECISIONS --- */}
      {sub === "decisions" && (
        <div className="space-y-2">
          {decisionsLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Chargement...</span>
            </div>
          ) : decisions.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Inbox className="h-8 w-8" />
              <span className="text-xs">Aucune decision</span>
            </div>
          ) : (
            decisions.map((d: any) => (
              <Card key={d.id} className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {d.titre || d.description || `Decision #${d.id}`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {d.type_decision && (
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                          typeBadgeColor(d.type_decision)
                        )}>
                          {d.type_decision}
                        </span>
                      )}
                      {d.bot_code && (
                        <BotBadge code={d.bot_code} />
                      )}
                      {d.created_at && (
                        <span className="text-[9px] text-gray-400">
                          {new Date(d.created_at).toLocaleDateString("fr-CA")}
                        </span>
                      )}
                    </div>
                  </div>
                  {d.status !== "reversed" && (
                    <button
                      onClick={() => handleReverseDecision(d.id)}
                      disabled={reversingId === d.id}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-medium transition-colors",
                        reversingId === d.id
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      )}
                    >
                      {reversingId === d.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Undo2 className="h-3.5 w-3.5" />
                      )}
                      Annuler
                    </button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
