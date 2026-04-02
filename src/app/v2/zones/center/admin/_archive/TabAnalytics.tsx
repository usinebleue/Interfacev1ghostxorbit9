/**
 * TabAnalytics.tsx — Analytics: couts API, distribution tiers, economie UT
 * Sous-tabs: Couts API | Distribution Tiers | Economie UT
 */

import { useState, useEffect } from "react";
import { DollarSign, BarChart3, Coins, Loader2, Inbox, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";

interface Props {
  mode: "god" | "instance";
  tenantId?: number;
}

const SUBTABS = [
  { id: "couts", label: "Couts API" },
  { id: "distribution", label: "Distribution Tiers" },
  { id: "economie", label: "Economie UT" },
];

// =======================================
// Tier rate definitions
// =======================================

const TIERS = [
  { id: "T0", label: "T0 — Cache/Regex", rate: "Gratuit", color: "emerald", targetPct: 35, description: "Reponses mises en cache, regex, instant" },
  { id: "T1", label: "T1 — Gemini Flash", rate: "Gratuit", color: "green", targetPct: 30, description: "1500 req/jour, rapide, leger" },
  { id: "T2", label: "T2 — Gemini Pro", rate: "Gratuit", color: "sky", targetPct: 20, description: "500 req/jour, raisonnement moyen" },
  { id: "T3", label: "T3 — Claude Sonnet", rate: "~$0.01-0.05", color: "violet", targetPct: 10, description: "Payant, raisonnement avance" },
  { id: "T4", label: "T4 — Claude Opus", rate: "~$0.15-0.60", color: "rose", targetPct: 5, description: "Premium, taches critiques seulement" },
];

/** Map tier color names to Tailwind classes (avoid dynamic class generation) */
const TIER_BAR_COLORS: Record<string, { bar: string; text: string }> = {
  emerald: { bar: "bg-emerald-500", text: "text-emerald-600" },
  green:   { bar: "bg-green-500",   text: "text-green-600" },
  sky:     { bar: "bg-sky-500",     text: "text-sky-600" },
  violet:  { bar: "bg-violet-500",  text: "text-violet-600" },
  rose:    { bar: "bg-rose-500",    text: "text-rose-600" },
};

// =======================================
// Couts API sub-tab
// =======================================

function CoutsAPIPanel() {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.health()
      .then(data => setHealthData(data))
      .catch(() => setHealthData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-3">
      {/* KPI Cards — Budget + Free Tier + Paid Tier */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
            <DollarSign className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Budget cible</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-blue-600">$5.00</div>
            <div className="text-[9px] text-gray-500">par jour max</div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
            <BarChart3 className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Tiers gratuits</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-emerald-600">85%</div>
            <div className="text-[9px] text-gray-500">T0 + T1 + T2</div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-500">
            <DollarSign className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Tiers payants</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-orange-600">15%</div>
            <div className="text-[9px] text-gray-500">T3 + T4</div>
          </div>
        </Card>
      </div>

      {/* Tier rates breakdown — Card with gradient header */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
          <BarChart3 className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Cout par tier</span>
        </div>
        <div className="p-4 space-y-2">
          {TIERS.map(tier => {
            const tc = TIER_BAR_COLORS[tier.color];
            return (
              <div key={tier.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", tc.bar)} />
                  <span className="text-xs text-gray-700 truncate">{tier.label}</span>
                </div>
                <span className={cn(
                  "text-xs font-medium shrink-0 ml-2",
                  tier.rate === "Gratuit" ? "text-green-600" : "text-orange-600"
                )}>
                  {tier.rate}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* System health stats — Card with gradient header */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
          <DollarSign className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Stats systeme</span>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : healthData ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Status</span>
                <span className="text-green-600 font-medium">{healthData.status || "OK"}</span>
              </div>
              {healthData.version && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Version</span>
                  <span className="text-gray-700 font-medium">{healthData.version}</span>
                </div>
              )}
              {healthData.uptime && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Uptime</span>
                  <span className="text-gray-700 font-medium">{healthData.uptime}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Impossible de charger les stats systeme</p>
          )}
        </div>
      </Card>
    </div>
  );
}

// =======================================
// Distribution Tiers sub-tab
// =======================================

function DistributionPanel() {
  return (
    <div className="space-y-3">
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500">
          <BarChart3 className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Distribution cible des requetes</span>
        </div>

        <div className="p-4 space-y-3">
          {TIERS.map(tier => {
            const tc = TIER_BAR_COLORS[tier.color];
            return (
              <div key={tier.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">{tier.id}</span>
                  <span className={cn("text-xs font-bold", tc.text)}>{tier.targetPct}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", tc.bar)}
                    style={{ width: `${tier.targetPct}%` }}
                  />
                </div>
                <p className="text-[9px] text-gray-400">{tier.description} — {tier.rate}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Summary card */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
          <DollarSign className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Resume economique</span>
        </div>
        <div className="p-4 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Tiers gratuits (T0+T1+T2)</span>
            <span className="text-green-600 font-bold">85%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Tiers payants (T3+T4)</span>
            <span className="text-orange-600 font-bold">15%</span>
          </div>
          <div className="flex justify-between text-xs border-t border-gray-100 pt-1.5 mt-1.5">
            <span className="text-gray-500">Cout estime/jour</span>
            <span className="text-gray-800 font-bold">$0.50 — $2.00</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// =======================================
// Economie UT sub-tab
// =======================================

function EconomieUTPanel() {
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.allSettled([
      api.getUtBalance().catch(() => null),
      api.getUtTransactions().catch(() => []),
    ]).then(([balRes, txRes]) => {
      const bal = (balRes as PromiseFulfilledResult<any>).value;
      if (bal) setBalance(bal);

      const txs = (txRes as PromiseFulfilledResult<any[]>).value;
      if (Array.isArray(txs)) setTransactions(txs);

      if (!bal && (!Array.isArray(txs) || txs.length === 0)) {
        setError("Endpoint non disponible");
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error && !balance && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
        <Coins className="h-8 w-8" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Balance card — KPI standard */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
          <Coins className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Solde UT (Unites de Temps)</span>
        </div>
        <div className="px-3 py-2">
          <div className="text-2xl font-bold text-amber-600">
            {balance?.balance ?? balance?.solde ?? "—"}
          </div>
          <div className="text-[9px] text-gray-500">
            UT disponibles{balance?.tier ? ` — Tier: ${balance.tier}` : ""}
          </div>
        </div>
      </Card>

      {/* Recent transactions — Card with gradient header */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
          <DollarSign className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Transactions recentes</span>
        </div>
        <div className="p-4">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center py-6 gap-2 text-gray-400">
              <Inbox className="h-8 w-8" />
              <span className="text-sm">Aucune transaction</span>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx: any, i: number) => {
                const amount = tx.amount ?? tx.montant ?? 0;
                const isPositive = amount > 0;
                const isZero = amount === 0;
                const AmountIcon = isPositive ? ArrowUpRight : isZero ? Minus : ArrowDownRight;

                return (
                  <div key={tx.id ?? i} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                      isPositive ? "bg-green-100" : isZero ? "bg-gray-100" : "bg-red-100"
                    )}>
                      <AmountIcon className={cn(
                        "h-3.5 w-3.5",
                        isPositive ? "text-green-600" : isZero ? "text-gray-400" : "text-red-600"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-700 truncate">
                        {tx.description || tx.label || "Transaction"}
                      </div>
                      <div className="text-[9px] text-gray-400">
                        {tx.date || tx.created_at
                          ? new Date(tx.date || tx.created_at).toLocaleDateString("fr-CA")
                          : "—"}
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs font-bold shrink-0",
                      isPositive ? "text-green-600" : isZero ? "text-gray-400" : "text-red-600"
                    )}>
                      {isPositive ? "+" : ""}{amount} UT
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// =======================================
// Main component
// =======================================

export function TabAnalytics({ mode, tenantId }: Props) {
  const [sub, setSub] = useState("couts");

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

      {sub === "couts" && <CoutsAPIPanel />}
      {sub === "distribution" && <DistributionPanel />}
      {sub === "economie" && <EconomieUTPanel />}
    </div>
  );
}
