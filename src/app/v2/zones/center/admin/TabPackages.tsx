/**
 * TabPackages.tsx — Packages & Offres: configurer plans, pricing, overrides, usage UT
 * Remplace TabFinance.tsx — panneau de controle (pas un affichage billing)
 * Toutes les donnees proviennent de l'API reelle.
 */

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Layers,
  TrendingUp,
  Plus,
  Trash2,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { BlockHeader, LoadingState, EmptyState, TabSectionHeader } from "../shared/SectionComponents";

// =======================================
// Types
// =======================================

interface Props {
  mode: string;
  tenantId?: number;
}

// =======================================
// SECTION 1 — Plans disponibles (from API)
// =======================================

function SectionPlans() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getSubscriptionTiers()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : [];
        setTiers(list);
      })
      .catch(() => setError("Endpoint non disponible"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <Card className="p-0 overflow-hidden">
        <BlockHeader icon={Layers} title="Plans disponibles" gradient="from-emerald-600 to-emerald-500" />
        <div className="p-4">
          <EmptyState message={error} />
        </div>
      </Card>
    );
  }

  if (tiers.length === 0) {
    return (
      <Card className="p-0 overflow-hidden">
        <BlockHeader icon={Layers} title="Plans disponibles" gradient="from-emerald-600 to-emerald-500" />
        <div className="p-4">
          <EmptyState message="Aucun tier configure" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <BlockHeader icon={Layers} title="Plans disponibles" count={tiers.length} gradient="from-emerald-600 to-emerald-500" />
      <div className="p-3">
        {/* Data table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-2 font-bold text-gray-600">Code</th>
                <th className="text-left py-2 px-2 font-bold text-gray-600">Nom</th>
                <th className="text-right py-2 px-2 font-bold text-gray-600">Prix/mois</th>
                <th className="text-right py-2 px-2 font-bold text-gray-600">UT inclus</th>
                <th className="text-right py-2 px-2 font-bold text-gray-600">Max Bots</th>
                <th className="text-center py-2 px-2 font-bold text-gray-600">Actif</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier: any, i: number) => {
                const code = tier.code || tier.tier_code || `tier-${i}`;
                const nom = tier.nom || tier.name || code;
                const price = tier.monthly_price_base ?? tier.price ?? tier.monthly_price ?? 0;
                const utIncluded = tier.ut_included ?? tier.ut ?? 0;
                const maxBots = tier.max_bots ?? tier.bots ?? "-";
                const actif = tier.actif !== undefined ? tier.actif : true;
                const features = tier.features;

                return (
                  <tr key={tier.id ?? code} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-2 px-2">
                      <Badge variant="outline" className="text-[9px] font-bold">
                        {code}
                      </Badge>
                    </td>
                    <td className="py-2 px-2 font-medium text-gray-800">{nom}</td>
                    <td className="py-2 px-2 text-right font-bold text-emerald-600">
                      ${typeof price === "number" ? price.toFixed(0) : price}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-700">{utIncluded}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{maxBots}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={cn(
                        "inline-block w-2 h-2 rounded-full",
                        actif ? "bg-emerald-500" : "bg-gray-300"
                      )} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Features expandable (show if any tier has features) */}
        {tiers.some((t: any) => t.features && (Array.isArray(t.features) ? t.features.length > 0 : typeof t.features === "object")) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[9px] font-bold text-gray-500 mb-2">Features par tier:</p>
            <div className="space-y-2">
              {tiers.map((tier: any, i: number) => {
                const code = tier.code || tier.tier_code || `tier-${i}`;
                const features = tier.features;
                if (!features) return null;

                const featureList = Array.isArray(features)
                  ? features
                  : typeof features === "object"
                  ? Object.entries(features).map(([k, v]) => `${k}: ${v}`)
                  : [String(features)];

                if (featureList.length === 0) return null;

                return (
                  <div key={code} className="flex items-start gap-2">
                    <Badge variant="outline" className="text-[9px] font-bold shrink-0 mt-0.5">
                      {code}
                    </Badge>
                    <div className="flex flex-wrap gap-1">
                      {featureList.map((f: any, j: number) => (
                        <span key={j} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {typeof f === "string" ? f : JSON.stringify(f)}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-[9px] text-gray-400 italic">
            Edition des tiers: bientot disponible
          </p>
        </div>
      </div>
    </Card>
  );
}

// =======================================
// SECTION 2 — Overrides de prix (God mode only)
// =======================================

const TIER_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "solo", label: "Solo" },
  { value: "direction", label: "Direction" },
  { value: "csuite", label: "C-Suite" },
  { value: "pioneer", label: "Pioneer" },
];

const TYPE_ACTEUR_OPTIONS = [
  { value: "", label: "\u2014 Aucun \u2014" },
  { value: "MFG", label: "MFG" },
  { value: "FEQ", label: "FEQ" },
  { value: "DEV", label: "DEV" },
  { value: "INT", label: "INT" },
  { value: "DST", label: "DST" },
  { value: "ORG", label: "ORG" },
];

const NIVEAU_OPTIONS = [
  { value: "", label: "\u2014 Aucun \u2014" },
  { value: "dieu", label: "Dieu" },
  { value: "coequipier", label: "Coequipier" },
  { value: "operateur", label: "Operateur" },
  { value: "client", label: "Client" },
];

const PRICING_TYPE_OPTIONS = [
  { value: "intelligence", label: "Intelligence" },
  { value: "doing", label: "Doing" },
];

interface OverrideForm {
  tenant_id: number;
  tier_code: string;
  type_acteur: string;
  niveau: string;
  monthly_price: number;
  ut_included: number;
  pricing_type: string;
  description: string;
}

const EMPTY_OVERRIDE_FORM: OverrideForm = {
  tenant_id: 0,
  tier_code: "free",
  type_acteur: "",
  niveau: "",
  monthly_price: 0,
  ut_included: 0,
  pricing_type: "intelligence",
  description: "",
};

function SectionOverrides() {
  const [overrides, setOverrides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<OverrideForm>({ ...EMPTY_OVERRIDE_FORM });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    api.listPricingOverrides()
      .then((data: any) => {
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
      setError("Erreur lors de la suppression");
    } finally {
      setDeleting(null);
    }
  };

  const handleSave = async () => {
    if (!form.tenant_id) {
      setSaveError("Tenant ID est requis");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await api.createPricingOverride({
        tenant_id: form.tenant_id,
        tier_code: form.tier_code,
        type_acteur: form.type_acteur || undefined,
        niveau: form.niveau || undefined,
        monthly_price: form.monthly_price,
        ut_included: form.ut_included,
        pricing_type: form.pricing_type,
        description: form.description,
      });
      setForm({ ...EMPTY_OVERRIDE_FORM });
      setShowForm(false);
      refresh();
    } catch {
      setSaveError("Erreur lors de la creation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <Card className="p-0 overflow-hidden">
      <BlockHeader icon={ShieldAlert} title="Overrides de prix" count={overrides.length} gradient="from-amber-600 to-amber-500" />
      <div className="p-3 space-y-3">
        {error && (
          <div className="text-xs text-red-500 px-1">{error}</div>
        )}

        {overrides.length === 0 ? (
          <EmptyState message="Aucun override de prix" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2 font-bold text-gray-600">Tenant</th>
                  <th className="text-left py-2 px-2 font-bold text-gray-600">Tier</th>
                  <th className="text-left py-2 px-2 font-bold text-gray-600">Type</th>
                  <th className="text-left py-2 px-2 font-bold text-gray-600">Niveau</th>
                  <th className="text-right py-2 px-2 font-bold text-gray-600">Prix</th>
                  <th className="text-right py-2 px-2 font-bold text-gray-600">UT</th>
                  <th className="text-left py-2 px-2 font-bold text-gray-600">Description</th>
                  <th className="text-center py-2 px-2 font-bold text-gray-600">Actif</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {overrides.map((o: any) => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-2 px-2 font-medium text-gray-800">#{o.tenant_id}</td>
                    <td className="py-2 px-2">
                      <Badge variant="outline" className="text-[9px]">{o.tier_code || "-"}</Badge>
                    </td>
                    <td className="py-2 px-2 text-gray-600">{o.type_acteur || "-"}</td>
                    <td className="py-2 px-2 text-gray-600">{o.niveau || "-"}</td>
                    <td className="py-2 px-2 text-right font-bold text-amber-600">
                      ${o.monthly_price ?? o.monthly_price_override ?? o.discount_pct ?? 0}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-700">{o.ut_included ?? "-"}</td>
                    <td className="py-2 px-2 text-gray-500 truncate max-w-[120px]">{o.description || o.note || "-"}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={cn(
                        "inline-block w-2 h-2 rounded-full",
                        (o.actif !== undefined ? o.actif : true) ? "bg-emerald-500" : "bg-gray-300"
                      )} />
                    </td>
                    <td className="py-2 px-2">
                      <button
                        onClick={() => handleDelete(o.id)}
                        disabled={deleting === o.id}
                        className="flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 text-[9px] font-bold rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deleting === o.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Inline create form */}
        {showForm && (
          <Card className="p-3 space-y-3 border-amber-200 bg-amber-50/30">
            <p className="text-xs font-bold text-amber-700">Nouveau override</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-medium text-gray-600 mb-0.5">Tenant ID *</label>
                <input
                  type="number"
                  value={form.tenant_id || ""}
                  onChange={(e) => setForm(prev => ({ ...prev, tenant_id: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-[9px] font-medium text-gray-600 mb-0.5">Tier *</label>
                <select
                  value={form.tier_code}
                  onChange={(e) => setForm(prev => ({ ...prev, tier_code: e.target.value }))}
                  className="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {TIER_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-medium text-gray-600 mb-0.5">Type Acteur</label>
                <select
                  value={form.type_acteur}
                  onChange={(e) => setForm(prev => ({ ...prev, type_acteur: e.target.value }))}
                  className="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {TYPE_ACTEUR_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-medium text-gray-600 mb-0.5">Niveau</label>
                <select
                  value={form.niveau}
                  onChange={(e) => setForm(prev => ({ ...prev, niveau: e.target.value }))}
                  className="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {NIVEAU_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-medium text-gray-600 mb-0.5">Prix mensuel</label>
                <input
                  type="number"
                  value={form.monthly_price || ""}
                  onChange={(e) => setForm(prev => ({ ...prev, monthly_price: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[9px] font-medium text-gray-600 mb-0.5">UT inclus</label>
                <input
                  type="number"
                  value={form.ut_included || ""}
                  onChange={(e) => setForm(prev => ({ ...prev, ut_included: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[9px] font-medium text-gray-600 mb-0.5">Type pricing</label>
                <select
                  value={form.pricing_type}
                  onChange={(e) => setForm(prev => ({ ...prev, pricing_type: e.target.value }))}
                  className="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {PRICING_TYPE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-medium text-gray-600 mb-0.5">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Raison du override..."
                />
              </div>
            </div>
            {saveError && (
              <div className="text-xs text-red-500">{saveError}</div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Sauvegarder
              </button>
              <button
                onClick={() => { setShowForm(false); setSaveError(null); }}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </Card>
        )}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Nouveau override
          </button>
        )}
      </div>
    </Card>
  );
}

// =======================================
// SECTION 3 — Usage UT (balance + transactions)
// =======================================

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
    return (
      <Card className="p-0 overflow-hidden">
        <BlockHeader icon={TrendingUp} title="Usage UT" gradient="from-blue-600 to-blue-500" />
        <div className="p-4">
          <EmptyState message={error} />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Balance card */}
      {balance && (
        <Card className="p-0 overflow-hidden">
          <BlockHeader icon={TrendingUp} title="Balance UT" gradient="from-blue-600 to-blue-500" />
          <div className="px-4 py-3">
            <div className="text-2xl font-bold text-blue-600">
              {balance.balance ?? balance.ut_balance ?? 0}
              <span className="text-xs font-normal text-gray-400 ml-1">UT</span>
            </div>
            {(balance.ut_used !== undefined || balance.ut_total !== undefined) && (
              <div className="text-[9px] text-gray-500 mt-1">
                {balance.ut_used ?? 0} utilises / {balance.ut_total || balance.ut_included || "?"} inclus
              </div>
            )}
            {/* Simple bar */}
            {balance.ut_total > 0 && (
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min(((balance.ut_used ?? 0) / balance.ut_total) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Transactions table */}
      <Card className="p-0 overflow-hidden">
        <BlockHeader icon={CreditCard} title="Transactions recentes" count={transactions.length} gradient="from-blue-600 to-blue-500" />
        <div className="p-3">
          {transactions.length === 0 ? (
            <EmptyState message="Aucune transaction" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-2 font-bold text-gray-600">Date</th>
                    <th className="text-left py-2 px-2 font-bold text-gray-600">Type</th>
                    <th className="text-right py-2 px-2 font-bold text-gray-600">Montant</th>
                    <th className="text-left py-2 px-2 font-bold text-gray-600">Description</th>
                    <th className="text-left py-2 px-2 font-bold text-gray-600">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 20).map((tx: any, i: number) => {
                    const amount = tx.amount ?? tx.montant ?? 0;
                    const isPositive = amount > 0;
                    const isZero = amount === 0;

                    return (
                      <tr key={tx.id ?? i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-2 px-2 text-gray-500 whitespace-nowrap">
                          {(tx.date || tx.created_at)
                            ? new Date(tx.date || tx.created_at).toLocaleDateString("fr-CA")
                            : "\u2014"}
                        </td>
                        <td className="py-2 px-2">
                          <Badge variant="outline" className="text-[9px]">
                            {tx.type || "-"}
                          </Badge>
                        </td>
                        <td className={cn(
                          "py-2 px-2 text-right font-bold tabular-nums",
                          isPositive ? "text-green-600" : isZero ? "text-gray-400" : "text-red-600"
                        )}>
                          {isPositive ? "+" : ""}{amount} UT
                        </td>
                        <td className="py-2 px-2 text-gray-600 truncate max-w-[160px]">
                          {tx.description || tx.label || "-"}
                        </td>
                        <td className="py-2 px-2 text-gray-400 truncate max-w-[100px]">
                          {tx.reference_type || tx.reference || "-"}
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
    </div>
  );
}

// =======================================
// MAIN EXPORT — TabPackages
// =======================================

export function TabPackages({ mode, tenantId }: Props) {
  const isGod = mode === "god";

  return (
    <div className="space-y-6">
      <TabSectionHeader
        icon={CreditCard}
        title="Packages & Offres"
        subtitle="Configurer les plans, pricing et features"
        gradient="from-emerald-600 to-emerald-500"
      />

      {/* Section 1 — Plans disponibles */}
      <SectionPlans />

      {/* Section 2 — Overrides (God mode only) */}
      {isGod && <SectionOverrides />}

      {/* Section 3 — Usage UT */}
      <SectionUsageUT />
    </div>
  );
}
