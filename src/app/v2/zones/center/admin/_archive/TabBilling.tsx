/**
 * TabBilling.tsx — Facturation et abonnements admin
 * Sous-tabs: Tiers | Abonnement | Overrides | Usage UT
 * God mode: overrides pricing. Instance: consultation seulement.
 */

import { useState, useEffect, useCallback } from "react";
import { CreditCard, Layers, Settings2, BarChart3, Loader2, Inbox, Plus, Trash2 } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { AdminModal, type FieldDef } from "./AdminModal";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface Props {
  mode: "god" | "instance";
  tenantId?: number;
}

const SUBTABS = [
  { id: "tiers", label: "Tiers", icon: Layers },
  { id: "abonnement", label: "Abonnement", icon: CreditCard },
  { id: "overrides", label: "Overrides", icon: Settings2 },
  { id: "usage", label: "Usage UT", icon: BarChart3 },
];

// ═══════════════════════════════════════
// Tiers hardcodes
// ═══════════════════════════════════════

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

const TIERS: TierDef[] = [
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

const OVERRIDE_FIELDS: FieldDef[] = [
  { key: "tenant_id", label: "Tenant ID", type: "number", required: true, placeholder: "1" },
  { key: "tier_code", label: "Tier", type: "select", required: true, options: TIERS.map(t => ({ value: t.code, label: t.name })) },
  { key: "discount_pct", label: "Rabais (%)", type: "number", placeholder: "0" },
  { key: "note", label: "Note", type: "textarea", placeholder: "Raison du override..." },
];

// ═══════════════════════════════════════
// TabBilling
// ═══════════════════════════════════════

export function TabBilling({ mode, tenantId }: Props) {
  const [sub, setSub] = useState("tiers");

  return (
    <div className="space-y-3">
      {/* Sub-tabs */}
      <div className="flex gap-1.5">
        {SUBTABS.map(t => {
          // Overrides = God only
          if (t.id === "overrides" && mode !== "god") return null;
          return (
            <button
              key={t.id}
              onClick={() => setSub(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                sub === t.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {sub === "tiers" && <TiersGrid />}
      {sub === "abonnement" && <AbonnementView mode={mode} tenantId={tenantId} />}
      {sub === "overrides" && mode === "god" && <OverridesView />}
      {sub === "usage" && <UsageUT mode={mode} tenantId={tenantId} />}
    </div>
  );
}

// ═══════════════════════════════════════
// Grille des tiers
// ═══════════════════════════════════════

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

function TiersGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {TIERS.map(tier => (
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
  );
}

// ═══════════════════════════════════════
// Abonnement courant
// ═══════════════════════════════════════

function AbonnementView({ mode, tenantId }: { mode: string; tenantId?: number }) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 text-center">
        <p className="text-sm text-gray-400">{error}</p>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
        <Inbox className="h-8 w-8" />
        <span className="text-sm">Aucun abonnement actif</span>
      </div>
    );
  }

  const tierCode = subscription.tier_code || subscription.tier || "free";
  const tierDef = TIERS.find(t => t.code === tierCode);

  return (
    <Card className="p-0 overflow-hidden rounded-lg border shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
        <CreditCard className="h-4 w-4 text-white" />
        <span className="text-sm font-bold text-white">Abonnement actif</span>
      </div>
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
              subscription.status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"
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
// Overrides pricing (God only)
// ═══════════════════════════════════════

function OverridesView() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Chargement...</span>
      </div>
    );
  }

  if (error && overrides.length === 0) {
    return (
      <Card className="p-4 text-center">
        <p className="text-sm text-gray-400">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {overrides.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
          <Inbox className="h-8 w-8" />
          <span className="text-sm">Aucun override de prix</span>
        </div>
      ) : (
        overrides.map(o => (
          <Card key={o.id} className="p-3 flex items-center gap-3 hover:shadow-md transition-all">
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
              {deleting === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Supprimer
            </button>
          </Card>
        ))
      )}

      <button
        onClick={() => setCreating(true)}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
      >
        <Plus className="h-3.5 w-3.5" /> Nouveau override
      </button>

      {error && overrides.length > 0 && (
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
  );
}

// ═══════════════════════════════════════
// Usage UT (balance + transactions)
// ═══════════════════════════════════════

function UsageUT({ mode, tenantId }: { mode: string; tenantId?: number }) {
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
    ]).then(([b, t]) => {
      const balVal = (b as PromiseFulfilledResult<any>).value;
      if (balVal) setBalance(balVal);
      const txVal = (t as PromiseFulfilledResult<any[]>).value;
      if (Array.isArray(txVal)) setTransactions(txVal);
      if (!balVal && (!txVal || !Array.isArray(txVal))) {
        setError("Endpoint non disponible");
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Chargement...</span>
      </div>
    );
  }

  if (error && !balance && transactions.length === 0) {
    return (
      <Card className="p-4 text-center">
        <p className="text-sm text-gray-400">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Balance card */}
      {balance && (
        <Card className="p-0 overflow-hidden rounded-lg border shadow-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
            <BarChart3 className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Balance UT</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-emerald-600">
              {balance.balance ?? balance.ut_balance ?? 0}
              <span className="text-xs font-normal text-gray-400 ml-1">UT</span>
            </div>
            {balance.ut_used !== undefined && (
              <div className="text-[9px] text-gray-400">
                {balance.ut_used} utilises / {balance.ut_total || balance.ut_included || "?"} inclus
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Transactions list */}
      <div>
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-sm font-bold text-gray-800">Transactions</span>
          <span className="text-[9px] text-gray-400">({transactions.length})</span>
        </div>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
            <Inbox className="h-8 w-8" />
            <span className="text-sm">Aucune transaction</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {transactions.slice(0, 50).map((tx, i) => (
              <Card key={tx.id || i} className="px-3 py-2 flex items-center gap-3 hover:shadow-md transition-all">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-800 truncate">
                    {tx.description || tx.type || tx.action || `Transaction #${tx.id || i + 1}`}
                  </div>
                  <div className="text-[9px] text-gray-400">
                    {tx.created_at && new Date(tx.created_at).toLocaleDateString("fr-CA")}
                    {tx.bot_code && <span className="ml-2">{tx.bot_code}</span>}
                  </div>
                </div>
                <span className={cn(
                  "text-xs font-bold tabular-nums",
                  (tx.amount || tx.montant || 0) >= 0 ? "text-emerald-600" : "text-red-600"
                )}>
                  {(tx.amount || tx.montant || 0) >= 0 ? "+" : ""}{tx.amount || tx.montant || 0} UT
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
