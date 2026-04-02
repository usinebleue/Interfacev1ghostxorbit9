/**
 * TabLogs.tsx — Logs admin view (6 sources)
 * Sous-tabs: Decisions | Auth | Activites | Discussions | Meetings | COMMAND
 * All sources wrapped in try/catch with graceful fallback.
 */

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  ShieldCheck,
  Activity,
  MessageSquare,
  Video,
  Terminal,
  Inbox,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { BotBadge } from "../shared/SectionComponents";

interface Props {
  mode: "god" | "instance";
  tenantId?: number;
}

const SUBTABS = [
  { id: "decisions", label: "Decisions", icon: CheckCircle2 },
  { id: "auth", label: "Auth", icon: ShieldCheck },
  { id: "activites", label: "Activites", icon: Activity },
  { id: "discussions", label: "Discussions", icon: MessageSquare },
  { id: "meetings", label: "Meetings", icon: Video },
  { id: "command", label: "COMMAND", icon: Terminal },
] as const;

// ═══════════════════════════════════════
// Shared helpers
// ═══════════════════════════════════════

function formatDate(d: string | undefined | null): string {
  if (!d) return "\u2014";
  try {
    return new Date(d).toLocaleDateString("fr-CA", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return d;
  }
}

/** Type badge — design-system: text-[9px] font-bold px-1.5 py-0.5 rounded border + semantic colors */
function TypeBadge({ label, color }: { label: string; color?: { bg: string; text: string; border: string } }) {
  const cfg = color || { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap", cfg.bg, cfg.text, cfg.border)}>
      {label}
    </span>
  );
}

/** Status badge — design-system: text-[9px] font-bold px-1.5 py-0.5 rounded border + semantic colors */
function LogStatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    active:    { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
    actif:     { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
    open:      { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
    ouverte:   { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
    completed: { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200" },
    completee: { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200" },
    done:      { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200" },
    running:   { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200" },
    en_cours:  { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200" },
    pending:   { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200" },
    archived:  { bg: "bg-gray-100",    text: "text-gray-600",    border: "border-gray-200" },
    archivee:  { bg: "bg-gray-100",    text: "text-gray-600",    border: "border-gray-200" },
    failed:    { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200" },
    erreur:    { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200" },
  };
  const cfg = colors[status?.toLowerCase()] || { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap", cfg.bg, cfg.text, cfg.border)}>
      {status || "\u2014"}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-xs">Chargement...</span>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
      <Inbox className="h-8 w-8" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

function ErrorState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
      <AlertCircle className="h-8 w-8" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

// ═══════════════════════════════════════
// Decisions sub-tab
// ═══════════════════════════════════════

const DECISION_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  strategique:    { bg: "bg-purple-100",  text: "text-purple-700",  border: "border-purple-200" },
  operationnelle: { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200" },
  technique:      { bg: "bg-indigo-100",  text: "text-indigo-700",  border: "border-indigo-200" },
  governance:     { bg: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-200" },
  automatique:    { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
};

function DecisionsView() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api.listDecisions({ limit: 30 })
      .then(data => {
        const list = Array.isArray(data) ? data : (data as any)?.decisions || [];
        setItems(list);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState label="Endpoint non disponible" />;
  if (items.length === 0) return <EmptyState label="Aucune decision" />;

  return (
    <div className="space-y-2">
      {items.map((d: any) => (
        <Card key={d.id} className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-500">
            <CheckCircle2 className="h-4 w-4 text-white" />
            <span className="text-[9px] font-bold text-white/80">#{d.id}</span>
            <span className="text-sm font-bold text-white truncate flex-1">{d.titre || "Sans titre"}</span>
          </div>
          <div className="px-3 py-2 flex items-center gap-2">
            <TypeBadge
              label={d.decision_type || d.type || "\u2014"}
              color={DECISION_TYPE_COLORS[(d.decision_type || d.type || "").toLowerCase()]}
            />
            <span className="text-[9px] text-gray-400 ml-auto">{formatDate(d.created_at)}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// Auth sub-tab
// ═══════════════════════════════════════

function AuthView() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api.listAuthEvents(30)
      .then(data => {
        const list = Array.isArray(data) ? data : (data as any)?.events || [];
        setItems(list);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState label="Endpoint non disponible" />;
  if (items.length === 0) return <EmptyState label="Aucun evenement auth" />;

  return (
    <div className="space-y-2">
      {items.map((e: any, i: number) => (
        <Card key={e.id || i} className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
            <ShieldCheck className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white truncate flex-1">{e.event || e.type || e.action || "\u2014"}</span>
          </div>
          <div className="px-3 py-2 flex items-center gap-3">
            <span className="text-xs text-gray-600 truncate">{e.user || e.email || e.user_id || "\u2014"}</span>
            <span className="text-[9px] text-gray-400 font-mono">{e.ip || e.ip_address || "\u2014"}</span>
            <span className="text-[9px] text-gray-400 ml-auto">{formatDate(e.timestamp || e.created_at)}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// Activites sub-tab
// ═══════════════════════════════════════

function ActivitesView() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api.memoryActivities(30)
      .then(data => {
        const list = Array.isArray(data) ? data : (data as any)?.activities || [];
        setItems(list);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState label="Endpoint non disponible" />;
  if (items.length === 0) return <EmptyState label="Aucune activite recente" />;

  return (
    <div className="space-y-2">
      {items.map((a: any, i: number) => (
        <Card key={a.id || i} className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
            <Activity className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white truncate flex-1">{a.description || a.action || a.message || JSON.stringify(a).slice(0, 80)}</span>
          </div>
          <div className="px-3 py-2">
            <span className="text-[9px] text-gray-400">{formatDate(a.timestamp || a.created_at || a.time)}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// Discussions sub-tab
// ═══════════════════════════════════════

function DiscussionsView() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api.listDiscussions()
      .then(data => {
        const list = Array.isArray(data) ? data : (data as any)?.discussions || [];
        setItems(list);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState label="Endpoint non disponible" />;
  if (items.length === 0) return <EmptyState label="Aucune discussion" />;

  return (
    <div className="space-y-2">
      {items.map((d: any) => (
        <Card key={d.id} className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
            <MessageSquare className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white truncate flex-1">{d.titre || d.title || "Discussion sans titre"}</span>
            <LogStatusBadge status={d.status || "ouverte"} />
          </div>
          <div className="px-3 py-2">
            <span className="text-[9px] text-gray-400">{formatDate(d.created_at)}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// Meetings sub-tab
// ═══════════════════════════════════════

function MeetingsView() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api.meetingList()
      .then(data => {
        const list = Array.isArray(data) ? data : (data as any)?.meetings || [];
        setItems(list);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState label="Endpoint non disponible" />;
  if (items.length === 0) return <EmptyState label="Aucun meeting" />;

  return (
    <div className="space-y-2">
      {items.map((m: any) => (
        <Card key={m.id || m.slug} className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-teal-600 to-teal-500">
            <Video className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white truncate flex-1">{m.title || m.titre || "Meeting sans titre"}</span>
            <LogStatusBadge status={m.status || "\u2014"} />
          </div>
          <div className="px-3 py-2">
            <div className="text-xs text-gray-600">
              {m.participants && Array.isArray(m.participants) ? `${m.participants.length} participant${m.participants.length !== 1 ? "s" : ""}` : ""}
              {m.participants && m.scheduled_at ? " \u2014 " : ""}
              <span className="text-[9px] text-gray-400">{formatDate(m.scheduled_at || m.created_at)}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// COMMAND sub-tab
// ═══════════════════════════════════════

function CommandView() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api.commandMissionsList()
      .then(data => {
        const list = Array.isArray(data) ? data : (data as any)?.missions || [];
        setItems(list);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState label="Endpoint non disponible" />;
  if (items.length === 0) return <EmptyState label="Aucune mission COMMAND" />;

  return (
    <div className="space-y-2">
      {items.map((m: any, i: number) => (
        <Card key={m.id || m.mission_id || i} className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-500">
            <Terminal className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white truncate flex-1">{m.titre || m.message || "Mission sans titre"}</span>
            <LogStatusBadge status={m.status || "pending"} />
          </div>
          <div className="px-3 py-2 flex items-center gap-2">
            {m.bot_primaire && <BotBadge code={m.bot_primaire} />}
            {m.scan_bots && Array.isArray(m.scan_bots) && m.scan_bots.map((b: string) => (
              <BotBadge key={b} code={b} />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// Main export
// ═══════════════════════════════════════

export function TabLogs({ mode, tenantId }: Props) {
  const [sub, setSub] = useState<string>("decisions");

  return (
    <div className="space-y-3">
      {/* Sub-tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {SUBTABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSub(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                sub === t.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {sub === "decisions" && <DecisionsView />}
      {sub === "auth" && <AuthView />}
      {sub === "activites" && <ActivitesView />}
      {sub === "discussions" && <DiscussionsView />}
      {sub === "meetings" && <MeetingsView />}
      {sub === "command" && <CommandView />}
    </div>
  );
}
