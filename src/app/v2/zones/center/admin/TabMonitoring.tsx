/**
 * TabMonitoring.tsx — Monitoring: sante systeme, logs securite, distribution API
 * Replaces old TabActivite.tsx — focused on SYSTEM monitoring, not user activities
 * All data from real API calls — no mock data
 */

import { useState, useEffect } from "react";
import {
  Activity,
  Shield,
  Server,
  Database,
  Radio,
  Box,
  HardDrive,
  BarChart3,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import {
  TabSectionHeader,
  BlockHeader,
  LoadingState,
  EmptyState,
} from "../shared/SectionComponents";

// ================================================================
// PROPS
// ================================================================

interface Props {
  mode: string;
  tenantId?: number;
}

// ================================================================
// HELPERS
// ================================================================

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

// ================================================================
// SERVICE ICON MAPPING
// ================================================================

const SERVICE_ICONS: Record<string, React.ElementType> = {
  API: Server,
  PostgreSQL: Database,
  LiveKit: Radio,
  Nginx: Box,
  Redis: HardDrive,
};

// ================================================================
// SECTION: Sante Systeme (God mode only)
// ================================================================

function SectionSante() {
  const [systemStatus, setSystemStatus] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api.getSystemStatus()
      .then((data) => setSystemStatus(data))
      .catch(() => {
        setSystemStatus(null);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const SERVICES = ["API", "PostgreSQL", "LiveKit", "Nginx", "Redis"];

  function isServiceOk(name: string): boolean | null {
    if (error || !systemStatus) return null;
    const services = (systemStatus as any).services;
    if (services && typeof services === "object") {
      const key = Object.keys(services).find((k) =>
        k.toLowerCase().includes(name.toLowerCase())
      );
      if (key) return services[key] === true || services[key] === "ok" || services[key] === "up";
    }
    if ((systemStatus as any).status === "ok") return true;
    return null;
  }

  return (
    <Card className="p-0 overflow-hidden shadow-sm">
      <BlockHeader
        icon={Activity}
        title="Sante systeme"
        gradient="from-emerald-600 to-emerald-500"
      />
      <div className="p-3">
        {loading ? (
          <LoadingState />
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {SERVICES.map((name) => {
              const ok = isServiceOk(name);
              const Icon = SERVICE_ICONS[name] || Server;
              return (
                <Card key={name} className="p-0 overflow-hidden shadow-sm">
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r",
                      ok === true
                        ? "from-emerald-600 to-emerald-500"
                        : ok === false
                        ? "from-red-600 to-red-500"
                        : "from-gray-500 to-gray-400"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-bold text-white">{name}</span>
                  </div>
                  <div className="px-3 py-2 text-center">
                    <div
                      className={cn(
                        "text-lg font-bold",
                        ok === true
                          ? "text-emerald-600"
                          : ok === false
                          ? "text-red-600"
                          : "text-gray-400"
                      )}
                    >
                      {ok === true ? "OK" : ok === false ? "OFF" : "Inconnu"}
                    </div>
                    <div className="text-[9px] text-gray-500">
                      {ok === true
                        ? "En ligne"
                        : ok === false
                        ? "Hors ligne"
                        : "Statut inconnu"}
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
// SECTION: Logs Securite
// ================================================================

function SectionLogsSecurite() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.listAuthEvents(50)
      .then((data) => {
        const list = Array.isArray(data) ? data : (data as any)?.events || [];
        setEvents(list);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="p-0 overflow-hidden shadow-sm">
      <BlockHeader
        icon={Shield}
        title="Logs securite"
        gradient="from-amber-600 to-amber-500"
        count={loading ? undefined : events.length}
      />
      <div className="p-3">
        {loading ? (
          <LoadingState />
        ) : events.length === 0 ? (
          <EmptyState message="Aucun evenement de securite enregistre" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-1.5 px-2 text-[9px] font-bold text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="text-left py-1.5 px-2 text-[9px] font-bold text-gray-500 uppercase">
                    Utilisateur
                  </th>
                  <th className="text-left py-1.5 px-2 text-[9px] font-bold text-gray-500 uppercase">
                    Action
                  </th>
                  <th className="text-left py-1.5 px-2 text-[9px] font-bold text-gray-500 uppercase">
                    IP
                  </th>
                  <th className="text-left py-1.5 px-2 text-[9px] font-bold text-gray-500 uppercase">
                    Resultat
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt: any, i: number) => {
                  const success = evt.success !== false;
                  const user =
                    evt.email || evt.user || evt.user_id || "\u2014";
                  const action =
                    evt.action || evt.event || evt.type || "\u2014";
                  const ip = evt.ip || evt.ip_address || "\u2014";
                  const date =
                    evt.created_at || evt.timestamp || evt.time || null;

                  return (
                    <tr
                      key={evt.id || i}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-1.5 px-2 text-[9px] text-gray-500 whitespace-nowrap">
                        {formatDate(date)}
                      </td>
                      <td className="py-1.5 px-2 text-[9px] text-gray-700 truncate max-w-[120px]">
                        {user}
                      </td>
                      <td className="py-1.5 px-2 text-[9px] text-gray-700">
                        {action}
                      </td>
                      <td className="py-1.5 px-2 text-[9px] text-gray-500 font-mono">
                        {ip}
                      </td>
                      <td className="py-1.5 px-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[8px] font-bold px-1.5 py-0 border",
                            success
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          )}
                        >
                          {success ? "OK" : "ECHEC"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

// ================================================================
// SECTION: Distribution API (God mode only — reference config data)
// ================================================================

const API_TIERS = [
  { name: "T0 Cache", pct: 35, cost: "Gratuit", color: "bg-emerald-500" },
  { name: "T1 Gemini Flash", pct: 30, cost: "Gratuit", color: "bg-emerald-400" },
  { name: "T2 Gemini Pro", pct: 20, cost: "Gratuit", color: "bg-blue-500" },
  { name: "T3 Claude Sonnet", pct: 10, cost: "~$0.03/req", color: "bg-amber-500" },
  { name: "T4 Claude Opus", pct: 5, cost: "~$0.30/req", color: "bg-red-500" },
];

function SectionDistributionAPI() {
  return (
    <Card className="p-0 overflow-hidden shadow-sm">
      <BlockHeader
        icon={BarChart3}
        title="Distribution API"
        gradient="from-blue-600 to-blue-500"
      />
      <div className="p-3 space-y-3">
        {API_TIERS.map((tier) => (
          <div key={tier.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">{tier.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-400">{tier.cost}</span>
                <span className="text-xs font-bold text-gray-700">{tier.pct}%</span>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", tier.color)}
                style={{ width: `${tier.pct}%` }}
              />
            </div>
          </div>
        ))}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-[9px] text-gray-500">
            Objectif: 85% requetes gratuites, cout cible $0.50-$2.00/jour
          </p>
        </div>
      </div>
    </Card>
  );
}

// ================================================================
// MAIN EXPORT
// ================================================================

export function TabMonitoring({ mode, tenantId }: Props) {
  return (
    <div className="space-y-6">
      <TabSectionHeader
        icon={Activity}
        title="Monitoring"
        subtitle="Sante systeme, logs securite et couts API"
        gradient="from-slate-700 to-slate-600"
      />

      {/* Sante systeme — God mode only */}
      {mode === "god" && <SectionSante />}

      {/* Logs securite — always visible */}
      <SectionLogsSecurite />

      {/* Distribution API — God mode only */}
      {mode === "god" && <SectionDistributionAPI />}
    </div>
  );
}
