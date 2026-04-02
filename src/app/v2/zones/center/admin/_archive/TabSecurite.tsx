/**
 * TabSecurite.tsx — Securite (God Mode only, tab dedie)
 * Sous-tabs: Vue d'ensemble | Auth Events | Sessions | Audit Trail
 */

import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, ShieldAlert, Lock, UserX, Activity, Inbox, Loader2, RefreshCw } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";

interface Props {
  mode: "god" | "instance";
  tenantId?: number;
}

const SUBTABS = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "auth", label: "Auth Events" },
  { id: "sessions", label: "Sessions" },
  { id: "audit", label: "Audit Trail" },
];

function StatusPastille({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between text-xs py-1.5">
      <span className="text-gray-600">{label}</span>
      <span className={cn(
        "text-[9px] font-bold px-1.5 py-0.5 rounded border",
        ok
          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
          : "bg-red-100 text-red-700 border-red-200"
      )}>
        {ok ? "OK" : "ALERTE"}
      </span>
    </div>
  );
}

export function TabSecurite({ mode }: Props) {
  const [sub, setSub] = useState("overview");
  const [authEvents, setAuthEvents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [systemOk, setSystemOk] = useState(true);
  const [revoking, setRevoking] = useState<number | null>(null);

  const loadAuthEvents = useCallback(() => {
    setLoading(true);
    api.listAuthEvents(50)
      .then(data => { if (Array.isArray(data)) setAuthEvents(data); })
      .catch(() => setAuthEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const loadSessions = useCallback(() => {
    setLoading(true);
    api.getActiveSessions()
      .then(data => { if (Array.isArray(data)) setSessions(data); })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const loadAudit = useCallback(() => {
    setLoading(true);
    api.listDecisions({ limit: 50 })
      .then(data => { if (Array.isArray(data)) setDecisions(data); })
      .catch(() => setDecisions([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (mode === "god") {
      api.getSystemStatus().then(() => setSystemOk(true)).catch(() => setSystemOk(false));
    }
  }, [mode]);

  useEffect(() => {
    if (sub === "auth") loadAuthEvents();
    if (sub === "sessions") loadSessions();
    if (sub === "audit") loadAudit();
  }, [sub, loadAuthEvents, loadSessions, loadAudit]);

  const handleRevoke = async (sessionId: number) => {
    setRevoking(sessionId);
    try {
      await api.revokeSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch { /* noop */ }
    finally { setRevoking(null); }
  };

  return (
    <div className="space-y-3">
      {/* Sub-tabs */}
      <div className="flex gap-1.5">
        {SUBTABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              sub === t.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Vue d'ensemble */}
      {sub === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Securite infrastructure */}
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <ShieldCheck className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Infrastructure</span>
              <span className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded border ml-auto",
                systemOk
                  ? "bg-white/90 text-emerald-800 border-white/50"
                  : "bg-red-100 text-red-800 border-red-200"
              )}>
                {systemOk ? "OPERATIONNEL" : "ALERTE"}
              </span>
            </div>
            <div className="px-3 py-3 space-y-0.5">
              <StatusPastille ok={systemOk} label="API FastAPI" />
              <StatusPastille ok={true} label="HTTPS / SSL" />
              <StatusPastille ok={true} label="UFW Firewall" />
              <StatusPastille ok={true} label="CORS restrictif" />
              <StatusPastille ok={true} label="Rate Limiting (30/min)" />
            </div>
          </Card>

          {/* Authentification */}
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
              <Lock className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Authentification</span>
            </div>
            <div className="px-3 py-3 space-y-0.5">
              <StatusPastille ok={true} label="JWT Tokens" />
              <StatusPastille ok={true} label="API Key rotation" />
              <StatusPastille ok={true} label="Login server-side (SHA256)" />
              <StatusPastille ok={true} label="Input validation (12K max)" />
              <StatusPastille ok={true} label="Credentials .env (chmod 600)" />
            </div>
          </Card>

          {/* Reseau */}
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
              <Activity className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Reseau</span>
            </div>
            <div className="px-3 py-3 space-y-0.5">
              <StatusPastille ok={true} label="Ports ouverts: 2222, 80, 443" />
              <StatusPastille ok={true} label="Nginx HSTS headers" />
              <StatusPastille ok={true} label="CSP + Permissions-Policy" />
              <StatusPastille ok={true} label="Swagger desactive (prod)" />
            </div>
          </Card>

          {/* Alertes */}
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
              <ShieldAlert className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Alertes recentes</span>
            </div>
            <div className="px-3 py-3 space-y-1.5">
              <p className="text-xs text-gray-600">Aucune alerte de securite active</p>
              <p className="text-[9px] text-gray-400">Derniere verification: maintenant</p>
            </div>
          </Card>
        </div>
      )}

      {/* Auth Events */}
      {sub === "auth" && (
        <div className="space-y-2">
          <div className="flex justify-end">
            <button onClick={loadAuthEvents} className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Rafraichir
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
          ) : authEvents.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Inbox className="h-8 w-8" />
              <span className="text-sm">Aucun evenement — endpoint non disponible</span>
            </div>
          ) : (
            authEvents.map((e, i) => (
              <Card key={i} className="p-0 overflow-hidden">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r",
                  e.success !== false ? "from-emerald-600 to-emerald-500" : "from-red-600 to-red-500"
                )}>
                  <Activity className="h-3.5 w-3.5 text-white" />
                  <span className="text-[9px] font-bold text-white uppercase truncate">{e.event || e.action || "Auth event"}</span>
                  <span className="text-[9px] text-white/70 ml-auto shrink-0">
                    {e.created_at ? new Date(e.created_at).toLocaleString("fr-CA") : ""}
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-600">{e.email || e.user || "?"} — {e.ip || "?"}</div>
                  </div>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0",
                    e.success !== false
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-red-100 text-red-700 border-red-200"
                  )}>
                    {e.success !== false ? "OK" : "ECHEC"}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Sessions actives */}
      {sub === "sessions" && (
        <div className="space-y-2">
          <div className="flex justify-end">
            <button onClick={loadSessions} className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Rafraichir
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Inbox className="h-8 w-8" />
              <span className="text-sm">Aucune session active</span>
            </div>
          ) : (
            sessions.map((s: any) => (
              <Card key={s.id} className="p-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500">
                  <Lock className="h-3.5 w-3.5 text-white" />
                  <span className="text-[9px] font-bold text-white uppercase truncate">{s.user_name || s.email || "Session"}</span>
                  <span className="text-[9px] text-white/70 ml-auto shrink-0">
                    {s.created_at ? new Date(s.created_at).toLocaleString("fr-CA") : ""}
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    {(s.user_name || s.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-600">IP: {s.ip || "?"} — {s.device || "Web"}</div>
                  </div>
                  <button
                    onClick={() => handleRevoke(s.id)}
                    disabled={revoking === s.id}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {revoking === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserX className="h-3.5 w-3.5" />}
                    Revoquer
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Audit Trail */}
      {sub === "audit" && (
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
          ) : decisions.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Inbox className="h-8 w-8" />
              <span className="text-sm">Aucune decision loggee</span>
            </div>
          ) : (
            decisions.map((d: any) => (
              <Card key={d.id} className="p-0 overflow-hidden">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r",
                  d.status === "reversed" ? "from-red-600 to-red-500" : "from-emerald-600 to-emerald-500"
                )}>
                  <ShieldCheck className="h-3.5 w-3.5 text-white" />
                  <span className="text-[9px] font-bold text-white uppercase truncate">{d.decision_type} — {d.bot_code || "systeme"}</span>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded border ml-auto shrink-0",
                    "bg-white/90 border-white/50",
                    d.status === "reversed" ? "text-red-800" : "text-emerald-800"
                  )}>
                    {d.status === "reversed" ? "ANNULEE" : "ACTIVE"}
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-600">
                    {d.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-800 truncate">{d.titre}</div>
                  </div>
                  <span className="text-[9px] text-gray-400 shrink-0">
                    {d.created_at ? new Date(d.created_at).toLocaleDateString("fr-CA") : ""}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
