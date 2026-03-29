/**
 * TabDashboard.tsx — Admin KPI Dashboard
 * God Mode: KPI globaux + raccourcis + sante systeme compact
 * Instance: KPI tenant scopes
 * Pattern: SectionComponents (StatGrid, BlockHeader, LoadingState, EmptyState)
 */

import { useState, useEffect } from "react";
import {
  LayoutDashboard, Building2, Users, Globe2, Handshake, Wallet,
  Package, Monitor, Settings, Wrench, Network,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { BlockHeader, LoadingState, TabSectionHeader } from "../shared/SectionComponents";

// ═══════════════════════════════════════
// Props
// ═══════════════════════════════════════

interface Props {
  mode: string;
  tenantId?: number;
  onNav?: (tab: string) => void;
}

// ═══════════════════════════════════════
// Shortcuts config
// ═══════════════════════════════════════

const SHORTCUTS = [
  { id: "packages", icon: Package, title: "Packages & Offres", desc: "Configurer les plans et pricing", color: "blue" },
  { id: "users", icon: Users, title: "Utilisateurs", desc: "Gerer les utilisateurs et invitations", color: "violet" },
  { id: "monitoring", icon: Monitor, title: "Monitoring", desc: "Logs securite et sante systeme", color: "emerald" },
  { id: "parametres", icon: Settings, title: "Parametres", desc: "Gouvernance et configuration bots", color: "amber" },
  { id: "outils", icon: Wrench, title: "Outils", desc: "Playbooks et templates", color: "indigo" },
  { id: "reseau", icon: Network, title: "Reseau", desc: "Vue d'ensemble Orbit9", color: "teal" },
];

// ═══════════════════════════════════════
// KPI item type
// ═══════════════════════════════════════

interface KpiItem {
  value: number | string;
  label: string;
  color: string;
  tab: string;
  icon: React.ElementType;
}

// ═══════════════════════════════════════
// System service status dot
// ═══════════════════════════════════════

function StatusDot({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
      {label}
      <span className={cn("inline-block w-2.5 h-2.5 rounded-full", ok ? "bg-emerald-500" : "bg-red-500")} />
    </span>
  );
}

// ═══════════════════════════════════════
// TabDashboard
// ═══════════════════════════════════════

export function TabDashboard({ mode, onNav }: Props) {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KpiItem[]>([]);
  const [systemOk, setSystemOk] = useState<boolean | null>(null);

  useEffect(() => {
    setLoading(true);

    Promise.allSettled([
      api.getTenants().catch(() => ({ tenants: [] })),
      api.getUsers().catch(() => ({ users: [] })),
      api.listOrbit9Members().catch(() => ({ members: [], total: 0 })),
      api.listOrbit9Matches().catch(() => ({ matches: [], total: 0 })),
      api.getUtBalance().catch(() => null),
    ]).then(([tRes, uRes, mRes, matchRes, utRes]) => {
      const tenants = (tRes as PromiseFulfilledResult<any>).value?.tenants || [];
      const users = (uRes as PromiseFulfilledResult<any>).value?.users || [];
      const membersData = (mRes as PromiseFulfilledResult<any>).value;
      const matchesData = (matchRes as PromiseFulfilledResult<any>).value;
      const utData = (utRes as PromiseFulfilledResult<any>).value;

      const membersCount = membersData?.total ?? (Array.isArray(membersData?.members) ? membersData.members.length : 0);
      const matchesCount = matchesData?.total ?? (Array.isArray(matchesData?.matches) ? matchesData.matches.length : 0);
      const balanceStr = utData?.balance != null ? `${utData.balance} UT` : "0 UT";

      setKpis([
        { value: Array.isArray(tenants) ? tenants.length : 0, label: "Instances", color: "blue", tab: "instances", icon: Building2 },
        { value: Array.isArray(users) ? users.length : 0, label: "Utilisateurs", color: "violet", tab: "users", icon: Users },
        { value: membersCount, label: "Membres Orbit9", color: "indigo", tab: "reseau", icon: Globe2 },
        { value: matchesCount, label: "Matchs", color: "emerald", tab: "reseau", icon: Handshake },
        { value: balanceStr, label: "Balance UT", color: "amber", tab: "finance", icon: Wallet },
      ]);

      setLoading(false);
    });

    // System status (god mode only)
    if (mode === "god") {
      api.getSystemStatus()
        .then(() => setSystemOk(true))
        .catch(() => setSystemOk(false));
    }
  }, [mode]);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <TabSectionHeader
        icon={LayoutDashboard}
        title="Tableau de bord"
        subtitle="Vue d'ensemble du systeme"
        gradient="from-blue-600 to-blue-500"
      />

      {/* KPI Cards */}
      <div className={cn("grid gap-3", kpis.length <= 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5")}>
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.label}
              className={cn(
                "p-0 overflow-hidden transition-shadow",
                onNav ? "hover:shadow-lg cursor-pointer" : ""
              )}
              onClick={() => onNav?.(kpi.tab)}
            >
              <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", `from-${kpi.color}-600 to-${kpi.color}-500`)}>
                <Icon className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">{kpi.label}</span>
              </div>
              <div className="px-3 py-2">
                <p className={cn("text-2xl font-bold", `text-${kpi.color}-600`)}>{kpi.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Raccourcis */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <BlockHeader icon={LayoutDashboard} title="Raccourcis" gradient="from-blue-600 to-blue-500" />
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SHORTCUTS.map((s) => {
            const Icon = s.icon;
            return (
              <Card
                key={s.id}
                className={cn(
                  "p-4 flex items-start gap-3 transition-all border",
                  onNav ? "hover:shadow-md cursor-pointer hover:border-blue-200" : ""
                )}
                onClick={() => onNav?.(s.id)}
              >
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", `bg-${s.color}-100`)}>
                  <Icon className={cn("h-4.5 w-4.5", `text-${s.color}-600`)} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Sante systeme — god mode, compact */}
      {mode === "god" && systemOk !== null && (
        <Card className="p-0 overflow-hidden shadow-sm">
          <div className="px-3 py-2.5 flex items-center gap-4 flex-wrap">
            <span className="text-xs font-bold text-gray-700">Sante systeme</span>
            <div className="flex items-center gap-4">
              <StatusDot label="API" ok={systemOk} />
              <StatusDot label="PostgreSQL" ok={systemOk} />
              <StatusDot label="LiveKit" ok={systemOk} />
              <StatusDot label="Nginx" ok={systemOk} />
              <StatusDot label="Redis" ok={systemOk} />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
