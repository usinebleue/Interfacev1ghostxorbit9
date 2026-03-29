/**
 * TabTelephonie.tsx — Administration telephonie et vocal
 * 3 sections empilees: Appels | Auth NIP | Sessions Vocales
 * Pattern: department (BlockHeader + gradient cards)
 */

import { useState, useEffect } from "react";
import { Phone, PhoneIncoming, PhoneOutgoing, Shield, Mic } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { BotBadge, BlockHeader, LoadingState, EmptyState, TabSectionHeader } from "../shared/SectionComponents";

interface Props {
  mode: string;
  tenantId?: number;
}

// ================================================================
// HELPERS
// ================================================================

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "\u2014";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "\u2014";
  try {
    return new Date(dateStr).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

// ================================================================
// SECTION 1 — Appels recents
// ================================================================

function SectionAppels() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.listPhoneSessions()
      .then(data => {
        setSessions(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setSessions([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="p-0 overflow-hidden shadow-sm">
      <BlockHeader
        icon={Phone}
        title="Appels recents"
        gradient="from-blue-600 to-blue-500"
        count={loading ? undefined : sessions.length}
      />
      <p className="px-3 pt-2 text-xs text-gray-500">Historique des appels telephoniques entrants et sortants via le bridge vocal.</p>
      <div className="p-3">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <EmptyState message="Endpoint non disponible" />
        ) : sessions.length === 0 ? (
          <EmptyState message="Aucun appel enregistre" />
        ) : (
          <div className="space-y-2">
            {sessions.map((s: any, i: number) => {
              const isInbound = s.direction === "in" || s.direction === "inbound";
              const DirectionIcon = isInbound ? PhoneIncoming : PhoneOutgoing;
              const dirColor = isInbound ? "green" : "blue";
              return (
                <Card key={s.id || i} className="p-0 overflow-hidden shadow-sm">
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2 bg-gradient-to-r",
                    isInbound ? "from-green-600 to-green-500" : "from-blue-600 to-blue-500"
                  )}>
                    <DirectionIcon className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white truncate flex-1">
                      {s.phone_number || s.from_number || s.to_number || "Inconnu"}
                    </span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between">
                    <div className="text-[9px] text-gray-400">
                      {formatDate(s.created_at || s.started_at)}
                    </div>
                    <div className="text-[9px] font-medium text-gray-500">
                      {formatDuration(s.duration || s.duree)}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

// ================================================================
// SECTION 2 — Authentification NIP
// ================================================================

function SectionAuthNIP() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.listPhoneAuth()
      .then(data => {
        setEntries(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setEntries([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="p-0 overflow-hidden shadow-sm">
      <BlockHeader
        icon={Shield}
        title="Authentification NIP"
        gradient="from-amber-600 to-amber-500"
        count={loading ? undefined : entries.length}
      />
      <p className="px-3 pt-2 text-xs text-gray-500">Codes NIP pour l'authentification telephonique. Chaque utilisateur a un PIN unique pour se connecter par telephone.</p>
      <div className="p-3">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <EmptyState message="Endpoint non disponible" />
        ) : entries.length === 0 ? (
          <EmptyState message="Aucune autorisation NIP" />
        ) : (
          <div className="space-y-2">
            {entries.map((e: any, i: number) => {
              const isActive = e.status === "active" || e.is_active !== false;
              return (
                <Card key={e.id || i} className="p-0 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
                    <Shield className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white truncate flex-1">
                      {e.user_name || e.nom || "Utilisateur"}
                    </span>
                    <span className="text-[9px] font-medium text-white/80">
                      {e.phone_number || e.numero || "\u2014"}
                    </span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between">
                    <div className="text-[9px] text-gray-400 font-mono tracking-wider">
                      ••••
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                      isActive
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    )}>
                      {isActive ? "Actif" : "Revoque"}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

// ================================================================
// SECTION 3 — Sessions vocales
// ================================================================

function SectionSessionsVocales() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.listVocalSessions()
      .then(data => {
        setSessions(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setSessions([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="p-0 overflow-hidden shadow-sm">
      <BlockHeader
        icon={Mic}
        title="Sessions vocales"
        gradient="from-violet-600 to-violet-500"
        count={loading ? undefined : sessions.length}
      />
      <p className="px-3 pt-2 text-xs text-gray-500">Sessions de conversation vocale via LiveKit. Inclut les appels web et telephoniques.</p>
      <div className="p-3">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <EmptyState message="Endpoint non disponible" />
        ) : sessions.length === 0 ? (
          <EmptyState message="Aucune session vocale" />
        ) : (
          <div className="space-y-2">
            {sessions.map((s: any, i: number) => (
              <Card key={s.id || i} className="p-0 overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
                  <Mic className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white truncate flex-1">
                    {s.room_name || s.room || "Session"}
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BotBadge code={s.bot_code || s.agent_code || "CEOB"} />
                    <span className="text-[9px] text-gray-400">
                      {formatDuration(s.duration || s.duree)}
                    </span>
                  </div>
                  <div className="text-[9px] text-gray-400">
                    {formatDate(s.created_at || s.started_at)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ================================================================
// TabTelephonie — Composant principal (3 sections empilees)
// ================================================================

export function TabTelephonie({ mode, tenantId }: Props) {
  return (
    <div className="space-y-6">
      <TabSectionHeader icon={Phone} title="Téléphonie" subtitle="Appels, authentification et sessions vocales" gradient="from-teal-600 to-teal-500" />
      <SectionAppels />
      <SectionAuthNIP />
      <SectionSessionsVocales />
    </div>
  );
}
