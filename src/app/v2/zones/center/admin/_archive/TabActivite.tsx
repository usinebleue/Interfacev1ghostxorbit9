/**
 * TabActivite.tsx — Unified activity feed (merges TabLogs + TabSecurite + TabMonitoring)
 * Filter dropdown + chronological list + God-only Sante systeme at bottom.
 */

import { useState, useEffect, useCallback } from "react";
import { ScrollText, Shield, Activity, Zap, MessageSquare, Video, ChevronDown } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { StatusBadge, BotBadge, BlockHeader, LoadingState, EmptyState, TabSectionHeader } from "../shared/SectionComponents";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface Props {
  mode: string;
  tenantId?: number;
}

type FilterType = "all" | "decisions" | "auth" | "activites" | "discussions" | "meetings" | "command";

interface UnifiedItem {
  id: string;
  type: FilterType;
  title: string;
  date: string;
  icon: React.ElementType;
  gradient: string;
  badge?: string;
  badgeClass?: string;
  botCode?: string;
  detail?: string;
  raw: any;
}

// ═══════════════════════════════════════
// Helpers
// ═══════════════════════════════════════

function formatDate(d: string | undefined | null): string {
  if (!d) return "\u2014";
  try {
    return new Date(d).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

function parseDate(d: string | undefined | null): number {
  if (!d) return 0;
  try {
    return new Date(d).getTime();
  } catch {
    return 0;
  }
}

const DECISION_TYPE_BADGES: Record<string, string> = {
  strategique: "bg-purple-100 text-purple-700 border-purple-200",
  operationnelle: "bg-blue-100 text-blue-700 border-blue-200",
  technique: "bg-indigo-100 text-indigo-700 border-indigo-200",
  governance: "bg-orange-100 text-orange-700 border-orange-200",
  automatique: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

// ═══════════════════════════════════════
// Service health helpers (God only)
// ═══════════════════════════════════════

const SERVICES = ["API", "PostgreSQL", "LiveKit", "Nginx", "ElevenLabs"];

function serviceStatus(systemStatus: Record<string, unknown> | null, name: string): boolean {
  if (!systemStatus) return false;
  const services = (systemStatus as any).services;
  if (services && typeof services === "object") {
    const key = Object.keys(services).find((k) => k.toLowerCase().includes(name.toLowerCase()));
    if (key) return services[key] === true || services[key] === "ok" || services[key] === "up";
  }
  if ((systemStatus as any).status === "ok") return true;
  return false;
}

// ═══════════════════════════════════════
// Main component
// ═══════════════════════════════════════

export function TabActivite({ mode, tenantId }: Props) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<UnifiedItem[]>([]);

  // God-only: system health
  const [systemStatus, setSystemStatus] = useState<Record<string, unknown> | null>(null);
  const [santeLoading, setSanteLoading] = useState(false);

  // ─── Load all sources in parallel ───

  const loadAll = useCallback(async () => {
    setLoading(true);
    const unified: UnifiedItem[] = [];

    const safeCall = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
      try {
        return await fn();
      } catch {
        return fallback;
      }
    };

    const [
      decisionsRaw,
      authRaw,
      activitesRaw,
      discussionsRaw,
      meetingsRaw,
      commandRaw,
    ] = await Promise.all([
      safeCall(() => api.listDecisions({ limit: 30 }), []),
      safeCall(() => api.listAuthEvents(30), []),
      safeCall(() => api.memoryActivities(30), { activities: [], total: 0 }),
      safeCall(() => api.listDiscussions(), []),
      safeCall(() => api.meetingList(), { meetings: [], total: 0 }),
      safeCall(() => api.commandMissionsList(30), { missions: [], total: 0 }),
    ]);

    // --- Decisions ---
    const decisionsList = Array.isArray(decisionsRaw) ? decisionsRaw : (decisionsRaw as any)?.decisions || [];
    for (const d of decisionsList) {
      const dt = (d.decision_type || d.type || "").toLowerCase();
      unified.push({
        id: `dec-${d.id}`,
        type: "decisions",
        title: d.titre || "Sans titre",
        date: d.created_at || "",
        icon: ScrollText,
        gradient: "from-purple-600 to-purple-500",
        badge: d.decision_type || d.type || undefined,
        badgeClass: DECISION_TYPE_BADGES[dt] || "bg-gray-100 text-gray-600 border-gray-200",
        raw: d,
      });
    }

    // --- Auth events ---
    const authList = Array.isArray(authRaw) ? authRaw : (authRaw as any)?.events || [];
    for (const e of authList) {
      const success = e.success !== false;
      unified.push({
        id: `auth-${e.id || Math.random()}`,
        type: "auth",
        title: e.event || e.type || e.action || "Auth event",
        date: e.timestamp || e.created_at || "",
        icon: Shield,
        gradient: "from-amber-600 to-amber-500",
        badge: success ? "OK" : "ECHEC",
        badgeClass: success
          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
          : "bg-red-100 text-red-700 border-red-200",
        detail: e.user || e.email || e.user_id || undefined,
        raw: e,
      });
    }

    // --- Activites ---
    const actList = Array.isArray(activitesRaw) ? activitesRaw : (activitesRaw as any)?.activities || [];
    for (const a of actList) {
      unified.push({
        id: `act-${(a as any).id || Math.random()}`,
        type: "activites",
        title: (a as any).description || (a as any).action || (a as any).message || JSON.stringify(a).slice(0, 80),
        date: (a as any).timestamp || (a as any).created_at || (a as any).time || "",
        icon: Activity,
        gradient: "from-blue-600 to-blue-500",
        raw: a,
      });
    }

    // --- Discussions ---
    const discList = Array.isArray(discussionsRaw) ? discussionsRaw : (discussionsRaw as any)?.discussions || [];
    for (const d of discList) {
      unified.push({
        id: `disc-${d.id}`,
        type: "discussions",
        title: d.titre || d.title || "Discussion sans titre",
        date: d.created_at || "",
        icon: MessageSquare,
        gradient: "from-violet-600 to-violet-500",
        badge: d.status || "ouverte",
        badgeClass: (d.status === "active" || d.status === "ouverte")
          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
          : "bg-gray-100 text-gray-600 border-gray-200",
        raw: d,
      });
    }

    // --- Meetings ---
    const meetList = Array.isArray(meetingsRaw) ? meetingsRaw : (meetingsRaw as any)?.meetings || [];
    for (const m of meetList) {
      const pCount = m.participants && Array.isArray(m.participants) ? m.participants.length : 0;
      unified.push({
        id: `meet-${m.id || m.slug}`,
        type: "meetings",
        title: m.title || m.titre || "Meeting sans titre",
        date: m.scheduled_at || m.created_at || "",
        icon: Video,
        gradient: "from-teal-600 to-teal-500",
        detail: pCount > 0 ? `${pCount} participant${pCount !== 1 ? "s" : ""}` : undefined,
        raw: m,
      });
    }

    // --- COMMAND missions ---
    const cmdList = Array.isArray(commandRaw) ? commandRaw : (commandRaw as any)?.missions || [];
    for (const m of cmdList) {
      unified.push({
        id: `cmd-${m.id || m.mission_id || Math.random()}`,
        type: "command",
        title: m.titre || m.message || "Mission sans titre",
        date: m.created_at || "",
        icon: Zap,
        gradient: "from-orange-600 to-orange-500",
        badge: m.status || "pending",
        badgeClass: m.status === "completed" || m.status === "done"
          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
          : m.status === "running" || m.status === "en_cours"
            ? "bg-amber-100 text-amber-700 border-amber-200"
            : "bg-gray-100 text-gray-600 border-gray-200",
        botCode: m.bot_primaire || undefined,
        raw: m,
      });
    }

    // Sort by date descending
    unified.sort((a, b) => parseDate(b.date) - parseDate(a.date));
    setItems(unified);
    setLoading(false);
  }, []);

  // ─── Load system status (God only) ───

  const loadSante = useCallback(() => {
    if (mode !== "god") return;
    setSanteLoading(true);
    api.getSystemStatus()
      .then((data) => setSystemStatus(data))
      .catch(() => setSystemStatus(null))
      .finally(() => setSanteLoading(false));
  }, [mode]);

  useEffect(() => {
    loadAll();
    loadSante();
  }, [loadAll, loadSante]);

  // ─── Filter ───

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

  const TYPE_LABELS: Record<FilterType, string> = {
    all: "TOUT",
    decisions: "DECISION",
    auth: "AUTH",
    activites: "ACTIVITE",
    discussions: "DISCUSSION",
    meetings: "MEETING",
    command: "COMMAND",
  };

  // ─── Render ───

  return (
    <div className="space-y-4">
      <TabSectionHeader icon={ScrollText} title="Activite" subtitle="Logs, securite et monitoring" gradient="from-slate-700 to-slate-600" />
      {/* ── Filter dropdown ── */}
      <div className="relative">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          className="w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none pr-8"
        >
          <option value="all">Toute l'activite</option>
          <option value="decisions">Decisions</option>
          <option value="auth">Authentification</option>
          <option value="activites">Activites</option>
          <option value="discussions">Discussions</option>
          <option value="meetings">Meetings</option>
          <option value="command">COMMAND</option>
        </select>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* ── Unified list ── */}
      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState message="Aucune activite trouvee" />
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.id} className="p-0 overflow-hidden shadow-sm">
                {/* Gradient header */}
                <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", item.gradient)}>
                  <Icon className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white truncate flex-1">{item.title}</span>
                  <span className="text-[9px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded">
                    {TYPE_LABELS[item.type]}
                  </span>
                </div>

                {/* Body */}
                <div className="px-3 py-2 flex items-center gap-2 flex-wrap">
                  {/* Type-specific badge */}
                  {item.badge && (
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap", item.badgeClass)}>
                      {item.badge}
                    </span>
                  )}

                  {/* Bot badge for COMMAND */}
                  {item.botCode && <BotBadge code={item.botCode} />}

                  {/* Detail text (user for auth, participant count for meetings) */}
                  {item.detail && (
                    <span className="text-xs text-gray-600 truncate">{item.detail}</span>
                  )}

                  {/* Timestamp always right-aligned */}
                  <span className="text-[9px] text-gray-400 ml-auto shrink-0">{formatDate(item.date)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── God only: Sante systeme ── */}
      {mode === "god" && (
        <div className="space-y-2 pt-2">
          <Card className="p-0 overflow-hidden shadow-sm">
            <BlockHeader
              icon={Activity}
              title="Sante systeme"
              gradient="from-emerald-600 to-emerald-500"
            />
            <div className="p-3">
              {santeLoading ? (
                <LoadingState />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SERVICES.map((name) => {
                    const ok = systemStatus ? serviceStatus(systemStatus, name) : false;
                    return (
                      <Card key={name} className="p-0 overflow-hidden shadow-sm">
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r",
                          ok ? "from-emerald-600 to-emerald-500" : "from-red-600 to-red-500"
                        )}>
                          <span className="text-xs font-bold text-white">{name}</span>
                        </div>
                        <div className="px-3 py-2">
                          <div className={cn("text-lg font-bold", ok ? "text-emerald-600" : "text-red-600")}>
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
          </Card>
        </div>
      )}
    </div>
  );
}
