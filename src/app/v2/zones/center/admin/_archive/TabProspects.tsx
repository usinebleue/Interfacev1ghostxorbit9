/**
 * TabProspects.tsx — Gestion des prospects et campagnes
 * Sous-tabs: Campagnes | Targets | Sessions
 */

import { useState, useEffect, useCallback } from "react";
import { Megaphone, Target, CalendarClock, Inbox, Loader2, ChevronDown, Users, Mail } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { StatusBadge } from "../shared/SectionComponents";
import { STATUS_CONFIG } from "../shared/section-config";

interface Props {
  mode: "god" | "instance";
  tenantId?: number;
}

const SUBTABS = [
  { id: "campagnes", label: "Campagnes" },
  { id: "targets", label: "Targets" },
  { id: "sessions", label: "Sessions" },
];

/** Map prospect statuses to STATUS_CONFIG keys */
function mapProspectStatus(status: string): keyof typeof STATUS_CONFIG {
  const s = (status || "").toLowerCase();
  if (s === "active") return "en-cours";
  if (s === "paused" || s === "pending") return "a-faire";
  if (s === "done" || s === "completed") return "done";
  if (s === "bloque" || s === "blocked") return "bloque";
  return "a-faire";
}

export function TabProspects({ mode, tenantId }: Props) {
  const [sub, setSub] = useState("campagnes");

  // --- Campagnes ---
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);

  const loadCampaigns = useCallback(() => {
    setCampaignsLoading(true);
    setCampaignsError(null);
    api.listProspectCampaigns()
      .then(data => { if (Array.isArray(data)) setCampaigns(data); })
      .catch(() => setCampaignsError("Endpoint non disponible"))
      .finally(() => setCampaignsLoading(false));
  }, []);

  useEffect(() => { if (sub === "campagnes") loadCampaigns(); }, [sub, loadCampaigns]);

  // --- Targets ---
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [targets, setTargets] = useState<any[]>([]);
  const [targetsLoading, setTargetsLoading] = useState(false);
  const [targetsError, setTargetsError] = useState<string | null>(null);

  useEffect(() => {
    if (sub !== "targets" || !selectedCampaignId) return;
    setTargetsLoading(true);
    setTargetsError(null);
    api.listCampaignTargets(selectedCampaignId)
      .then(data => { if (Array.isArray(data)) setTargets(data); })
      .catch(() => setTargetsError("Endpoint non disponible"))
      .finally(() => setTargetsLoading(false));
  }, [sub, selectedCampaignId]);

  // Pre-load campaigns for the targets dropdown
  useEffect(() => {
    if (sub === "targets" && campaigns.length === 0) {
      api.listProspectCampaigns()
        .then(data => { if (Array.isArray(data)) setCampaigns(data); })
        .catch(() => {});
    }
  }, [sub, campaigns.length]);

  // --- Sessions ---
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  useEffect(() => {
    if (sub !== "sessions") return;
    setSessionsLoading(true);
    setSessionsError(null);
    api.listProspectSessions()
      .then(data => { if (Array.isArray(data)) setSessions(data); })
      .catch(() => setSessionsError("Endpoint non disponible"))
      .finally(() => setSessionsLoading(false));
  }, [sub]);

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

      {/* --- Campagnes --- */}
      {sub === "campagnes" && (
        <div className="space-y-2">
          {campaignsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : campaignsError ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Megaphone className="h-8 w-8" />
              <span className="text-sm">{campaignsError}</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Inbox className="h-8 w-8" />
              <span className="text-sm">Aucune campagne</span>
            </div>
          ) : (
            campaigns.map((c: any) => (
              <Card key={c.id} className="p-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500">
                  <Megaphone className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white truncate">
                    {c.name || c.nom || `Campagne #${c.id}`}
                  </span>
                  <span className="ml-auto">
                    <StatusBadge status={mapProspectStatus(c.status)} />
                  </span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-[9px] text-gray-500">
                    {c.target_count ?? c.targets_count ?? "—"} targets
                    {c.created_at && ` — ${new Date(c.created_at).toLocaleDateString("fr-CA")}`}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* --- Targets --- */}
      {sub === "targets" && (
        <div className="space-y-3">
          {/* Campaign selector */}
          <div className="relative">
            <select
              value={selectedCampaignId ?? ""}
              onChange={e => setSelectedCampaignId(e.target.value ? Number(e.target.value) : null)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Selectionner une campagne...</option>
              {campaigns.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.nom || `Campagne #${c.id}`}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {!selectedCampaignId ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Target className="h-8 w-8" />
              <span className="text-sm">Selectionner une campagne pour voir les targets</span>
            </div>
          ) : targetsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : targetsError ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Target className="h-8 w-8" />
              <span className="text-sm">{targetsError}</span>
            </div>
          ) : targets.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Inbox className="h-8 w-8" />
              <span className="text-sm">Aucun target pour cette campagne</span>
            </div>
          ) : (
            <div className="space-y-2">
              {targets.map((t: any, i: number) => (
                <Card key={t.id ?? i} className="p-0 overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold text-white">
                      {(t.company_name || t.nom_entreprise || "?").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-white truncate">
                      {t.company_name || t.nom_entreprise || "—"}
                    </span>
                    <span className="ml-auto">
                      <StatusBadge status={mapProspectStatus(t.status)} />
                    </span>
                  </div>
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2 text-[9px] text-gray-500">
                      {(t.contact_name || t.contact) && (
                        <span className="flex items-center gap-0.5">
                          <Users className="h-3.5 w-3.5" />
                          {t.contact_name || t.contact}
                        </span>
                      )}
                      {(t.email) && (
                        <span className="flex items-center gap-0.5">
                          <Mail className="h-3.5 w-3.5" />
                          {t.email}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- Sessions --- */}
      {sub === "sessions" && (
        <div className="space-y-2">
          {sessionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : sessionsError ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <CalendarClock className="h-8 w-8" />
              <span className="text-sm">{sessionsError}</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Inbox className="h-8 w-8" />
              <span className="text-sm">Aucune session prospect</span>
            </div>
          ) : (
            sessions.map((s: any, i: number) => (
              <Card key={s.id ?? i} className="p-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
                  <CalendarClock className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white truncate">
                    {s.prospect_name || s.nom_prospect || `Session #${s.id ?? i + 1}`}
                  </span>
                  <span className="ml-auto">
                    <StatusBadge status={mapProspectStatus(s.status)} />
                  </span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-[9px] text-gray-500">
                    {s.session_date || s.created_at
                      ? new Date(s.session_date || s.created_at).toLocaleDateString("fr-CA")
                      : "—"}
                    {s.score != null && ` — Score: ${s.score}`}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
