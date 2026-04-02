/**
 * TabFinance.tsx — Finances: abonnement, tiers, usage UT, distribution, overrides
 * Fusionne TabBilling + TabAnalytics en sections empilees (pas de sub-tabs).
 * Sections: KPI Cards | Abonnement | Tiers disponibles | Usage UT | Distribution Tiers (god) | Overrides (god)
 */

import { useState, useEffect, useCallback } from "react";
import { CreditCard, Layers, TrendingUp, ArrowUpRight, ArrowDownRight, Minus, Plus, Trash2 } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { BlockHeader, Bloc, type BlocConfig, LoadingState, EmptyState, StatGrid, TabSectionHeader } from "../shared/SectionComponents";
import { AdminModal, type FieldDef } from "./AdminModal";

// =======================================
// Types
// =======================================

interface Props {
  mode: string;
  tenantId?: number;
}

// =======================================
// Tier definitions (pricing)
// =======================================

interface TierDef {
  code: string;
  name: string;
  price: string;
  bots: number;
  ut: number;
  features: string[];
  highlight?: boolean;
  color: string;
}

const PRICING_TIERS: TierDef[] = [
  {
    code: "free",
    name: "Free",
    price: "$0",
    bots: 1,
    ut: 0,
    features: ["1 bot CarlOS", "Chat illimite", "Pas de UT"],
    color: "gray",
  },
  {
    code: "solo",
    name: "Solo",
    price: "$97",
    bots: 1,
    ut: 100,
    features: ["1 bot au choix", "100 UT/mois", "Vocal inclus", "Templates de base"],
    color: "blue",
  },
  {
    code: "direction",
    name: "Direction",
    price: "$497",
    bots: 6,
    ut: 500,
    features: ["6 bots C-Level", "500 UT/mois", "Vocal + Video", "Templates avances", "Blueprint"],
    highlight: true,
    color: "violet",
  },
  {
    code: "csuite",
    name: "C-Suite",
    price: "$997",
    bots: 12,
    ut: 2000,
    features: ["12 bots complets", "2000 UT/mois", "Tout inclus", "Orbit9 Matching", "Board Room", "COMMAND Engine"],
    color: "emerald",
  },
  {
    code: "pioneer",
    name: "Pioneer",
    price: "$0",
    bots: 12,
    ut: 9999,
    features: ["Acces complet", "9999 UT/mois", "Beta features", "Support prioritaire", "Tout deboque"],
    color: "amber",
  },
];

// =======================================
// API tier distribution definitions
// =======================================

const API_TIERS = [
  { id: "T0", label: "T0 — Cache/Regex", rate: "Gratuit", color: "emerald", targetPct: 35, description: "Reponses mises en cache, regex, instant" },
  { id: "T1", label: "T1 — Gemini Flash", rate: "Gratuit", color: "green", targetPct: 30, description: "1500 req/jour, rapide, leger" },
  { id: "T2", label: "T2 — Gemini Pro", rate: "Gratuit", color: "sky", targetPct: 20, description: "500 req/jour, raisonnement moyen" },
  { id: "T3", label: "T3 — Claude Sonnet", rate: "~$0.01-0.05", color: "violet", targetPct: 10, description: "Payant, raisonnement avance" },
  { id: "T4", label: "T4 — Claude Opus", rate: "~$0.15-0.60", color: "rose", targetPct: 5, description: "Premium, taches critiques seulement" },
];

const TIER_BAR_COLORS: Record<string, { bar: string; text: string }> = {
  emerald: { bar: "bg-emerald-500", text: "text-emerald-600" },
  green:   { bar: "bg-green-500",   text: "text-green-600" },
  sky:     { bar: "bg-sky-500",     text: "text-sky-600" },
  violet:  { bar: "bg-violet-500",  text: "text-violet-600" },
  rose:    { bar: "bg-rose-500",    text: "text-rose-600" },
};

// =======================================
// Tier card color maps (static for Tailwind)
// =======================================

const TIER_GRADIENTS: Record<string, string> = {
  gray: "from-gray-600 to-gray-500",
  blue: "from-blue-600 to-blue-500",
  violet: "from-violet-600 to-violet-500",
  emerald: "from-emerald-600 to-emerald-500",
  amber: "from-amber-600 to-amber-500",
};

const TIER_VALUE_COLORS: Record<string, string> = {
  gray: "text-gray-600",
  blue: "text-blue-600",
  violet: "text-violet-600",
  emerald: "text-emerald-600",
  amber: "text-amber-600",
};

const TIER_RING_COLORS: Record<string, string> = {
  violet: "ring-2 ring-violet-400",
};

// =======================================
// Override modal fields
// =======================================

const OVERRIDE_FIELDS: FieldDef[] = [
  { key: "tenant_id", label: "Tenant ID", type: "number", required: true, placeholder: "1" },
  { key: "tier_code", label: "Tier", type: "select", required: true, options: PRICING_TIERS.map(t => ({ value: t.code, label: t.name })) },
  { key: "discount_pct", label: "Rabais (%)", type: "number", placeholder: "0" },
  { key: "note", label: "Note", type: "textarea", placeholder: "Raison du override..." },
];

// ═══════════════════════════════════════
// SECTION 1 — KPI Cards
// ═══════════════════════════════════════

function SectionKPI() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
          <CreditCard className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Budget cible</span>
        </div>
        <div className="px-3 py-2">
          <div className="text-2xl font-bold text-blue-600">$5/jour</div>
          <div className="text-[9px] text-gray-500">Objectif quotidien</div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
          <TrendingUp className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Tiers gratuits</span>
        </div>
        <div className="px-3 py-2">
          <div className="text-2xl font-bold text-emerald-600">85%</div>
          <div className="text-[9px] text-gray-500">T0 + T1 + T2</div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
          <CreditCard className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Tiers payants</span>
        </div>
        <div className="px-3 py-2">
          <div className="text-2xl font-bold text-amber-600">15%</div>
          <div className="text-[9px] text-gray-500">T3 + T4</div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════
// SECTION 2 — Abonnement
// ═══════════════════════════════════════

function SectionAbonnement() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getSubscriptionCurrent()
      .then(data => setSubscription(data))
      .catch(() => setError("Endpoint non disponible"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <Card className="p-4 text-center">
        <p className="text-sm text-gray-400">{error}</p>
      </Card>
    );
  }

  if (!subscription) return <EmptyState message="Aucun abonnement actif" />;

  const rawTier = subscription.tier_code || subscription.tier || "free";
  const tierCode = typeof rawTier === "object" ? (rawTier?.code || "free") : String(rawTier);
  const tierDef = PRICING_TIERS.find(t => t.code === tierCode);

  return (
    <Card className="p-0 overflow-hidden">
      <BlockHeader
        icon={CreditCard}
        title="Mon abonnement"
        gradient="from-blue-600 to-blue-500"
      />
      <div className="px-4 py-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Tier</span>
          <span className="text-sm font-bold text-gray-800">{tierDef?.name || tierCode}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Prix</span>
          <span className="text-sm font-bold text-blue-600">{tierDef?.price || "$0"}/mois</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Bots</span>
          <span className="text-xs text-gray-600">{subscription.max_bots || tierDef?.bots || 1}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">UT inclus</span>
          <span className="text-xs text-gray-600">{subscription.ut_included || tierDef?.ut || 0}/mois</span>
        </div>
        {subscription.status && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Statut</span>
            <span className={cn(
              "text-[9px] font-bold px-1.5 py-0.5 rounded border",
              subscription.status === "active"
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-amber-100 text-amber-700 border-amber-200"
            )}>
              {subscription.status}
            </span>
          </div>
        )}
        {tierDef?.features && (
          <div className="pt-2 border-t">
            <span className="text-xs font-bold text-gray-800 block mb-1">Fonctionnalites incluses</span>
            {tierDef.features.map((f, i) => (
              <div key={i} className="text-[9px] text-gray-600 flex items-start gap-1">
                <span className="text-emerald-500 mt-0.5 shrink-0">&#10003;</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════
// SECTION 3 — Tiers disponibles
// ═══════════════════════════════════════

function SectionTiers() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Layers className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-bold text-gray-800">Tiers disponibles</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRICING_TIERS.map(tier => (
          <Card
            key={tier.code}
            className={cn(
              "p-0 overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all",
              tier.highlight && (TIER_RING_COLORS[tier.color] || "")
            )}
          >
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 bg-gradient-to-r",
              TIER_GRADIENTS[tier.color] || "from-gray-600 to-gray-500"
            )}>
              <Layers className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">{tier.name}</span>
              <span className="text-sm font-bold text-white ml-auto">
                {tier.price}
                {tier.price !== "$0" && <span className="text-[9px] font-normal text-white/70 ml-0.5">/mois</span>}
              </span>
            </div>
            <div className="px-3 py-2 space-y-1">
              <div className="flex justify-between text-xs text-gray-600 border-b pb-1 mb-1">
                <span>{tier.bots} bot{tier.bots > 1 ? "s" : ""}</span>
                <span className={cn("font-bold", TIER_VALUE_COLORS[tier.color] || "text-gray-600")}>{tier.ut} UT/mois</span>
              </div>
              {tier.features.map((f, i) => (
                <div key={i} className="text-[9px] text-gray-600 flex items-start gap-1">
                  <span className="text-emerald-500 mt-0.5 shrink-0">&#10003;</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// SECTION 4 — Usage UT (balance + transactions)
// ═══════════════════════════════════════

function SectionUsageUT() {
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

  if (loading) return <LoadingState />;

  if (error && !balance && transactions.length === 0) {
    return <EmptyState message={error} />;
  }

  return (
    <div className="space-y-3">
      {/* Balance card */}
      {balance && (
        <Card className="p-0 overflow-hidden">
          <BlockHeader
            icon={TrendingUp}
            title="Balance UT"
            gradient="from-emerald-600 to-emerald-500"
          />
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-emerald-600">
              {balance.balance ?? balance.ut_balance ?? 0}
              <span className="text-xs font-normal text-gray-400 ml-1">UT</span>
            </div>
            {balance.ut_used !== undefined && (
              <div className="text-[9px] text-gray-500">
                {balance.ut_used} utilises / {balance.ut_total || balance.ut_included || "?"} inclus
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Transactions list */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
          <CreditCard className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Transactions</span>
          <span className="text-xs font-bold bg-white/25 text-white px-2 py-0.5 rounded-full ml-auto">
            {transactions.length}
          </span>
        </div>
        <div className="p-3">
          {transactions.length === 0 ? (
            <EmptyState message="Aucune transaction" />
          ) : (
            <div className="space-y-1.5">
              {transactions.slice(0, 50).map((tx, i) => {
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
                        {tx.description || tx.label || tx.type || `Transaction #${tx.id || i + 1}`}
                      </div>
                      <div className="text-[9px] text-gray-400">
                        {(tx.date || tx.created_at)
                          ? new Date(tx.date || tx.created_at).toLocaleDateString("fr-CA")
                          : "\u2014"}
                        {tx.bot_code && <span className="ml-2 font-medium">{tx.bot_code}</span>}
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs font-bold tabular-nums shrink-0",
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

// ═══════════════════════════════════════
// SECTION 5 — Distribution Tiers (God only)
// ═══════════════════════════════════════

function SectionDistribution() {
  return (
    <Card className="p-0 overflow-hidden">
      <BlockHeader
        icon={TrendingUp}
        title="Distribution cible des requetes"
        gradient="from-indigo-600 to-indigo-500"
      />
      <div className="p-4 space-y-3">
        {API_TIERS.map(tier => {
          const tc = TIER_BAR_COLORS[tier.color];
          return (
            <div key={tier.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">{tier.id} — {tier.label.split(" — ")[1]}</span>
                <span className={cn("text-xs font-bold", tc.text)}>{tier.targetPct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000 ease-out", tc.bar)}
                  style={{ width: `${tier.targetPct}%` }}
                />
              </div>
              <p className="text-[9px] text-gray-400">{tier.description} — {tier.rate}</p>
            </div>
          );
        })}

        {/* Summary */}
        <div className="border-t border-gray-100 pt-3 mt-3 space-y-1.5">
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
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════
// SECTION 6 — Overrides pricing (God only)
// ═══════════════════════════════════════

function SectionOverrides() {
  const [overrides, setOverrides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    api.listPricingOverrides()
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setOverrides(list);
      })
      .catch(() => setError("Endpoint non disponible"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await api.deletePricingOverride(id);
      refresh();
    } catch {
      setError("Endpoint non disponible");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <Card className="p-0 overflow-hidden">
      <BlockHeader
        icon={Layers}
        title="Overrides de prix"
        count={overrides.length}
        gradient="from-violet-600 to-violet-500"
      />
      <div className="p-3 space-y-2">
        {overrides.length === 0 ? (
          <EmptyState message="Aucun override de prix" />
        ) : (
          overrides.map(o => (
            <Card key={o.id} className="p-0 overflow-hidden hover:shadow-md transition-all">
              <div className="px-3 py-2 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-800">
                    Tenant #{o.tenant_id} — <span className="text-violet-600">{o.tier_code}</span>
                  </div>
                  <div className="text-[9px] text-gray-400">
                    {o.discount_pct > 0 && <span className="mr-2 text-emerald-600">-{o.discount_pct}%</span>}
                    {o.note && <span className="truncate">{o.note}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(o.id)}
                  disabled={deleting === o.id}
                  className="flex items-center gap-1 px-2.5 py-1 text-red-600 hover:bg-red-50 text-[9px] font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer
                </button>
              </div>
            </Card>
          ))
        )}

        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Nouveau override
        </button>

        {error && (
          <div className="text-xs text-red-500 px-1">{error}</div>
        )}

        {/* Modal create override */}
        {creating && (
          <AdminModal
            title="Creer un override de prix"
            fields={OVERRIDE_FIELDS}
            initialData={{ tenant_id: 0, tier_code: "pioneer", discount_pct: 0, note: "" }}
            onSave={async (data) => {
              try {
                await api.createPricingOverride({
                  tenant_id: Number(data.tenant_id),
                  tier_code: String(data.tier_code),
                  discount_pct: Number(data.discount_pct || 0),
                  note: String(data.note || ""),
                });
                refresh();
              } catch {
                throw new Error("Endpoint non disponible");
              }
            }}
            onClose={() => setCreating(false)}
          />
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════
// MAIN EXPORT — TabFinance
// ═══════════════════════════════════════

export function TabFinance({ mode, tenantId }: Props) {
  const isGod = mode === "god";

  return (
    <div className="space-y-6">
      <TabSectionHeader icon={CreditCard} title="Facturation & Finances" subtitle="Abonnements, tiers et usage" gradient="from-emerald-600 to-emerald-500" />
      {/* Section 1 — KPI Cards */}
      <SectionKPI />

      {/* Section 2 — Abonnement */}
      <SectionAbonnement />

      {/* Section 3 — Tiers disponibles */}
      <SectionTiers />

      {/* Section 4 — Usage UT */}
      <SectionUsageUT />

      {/* Section 5 — Distribution Tiers (God only) */}
      {isGod && <SectionDistribution />}

      {/* Section 6 — Overrides (God only) */}
      {isGod && <SectionOverrides />}
    </div>
  );
}
