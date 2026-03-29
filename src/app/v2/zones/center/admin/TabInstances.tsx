/**
 * TabInstances.tsx — Instances + Verticaux + Regions (God Mode only)
 * CRUD tenants, CRUD verticaux, read-only regions
 * Pattern: SectionComponents + AdminModal
 */

import { useState, useEffect, useCallback } from "react";
import { Building2, Layers, MapPin, Pencil, Plus } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { BlockHeader, LoadingState, EmptyState, StatGrid, TabSectionHeader } from "../shared/SectionComponents";
import { AdminModal, type FieldDef } from "./AdminModal";

// ═══════════════════════════════════════
// Field definitions
// ═══════════════════════════════════════

const TENANT_FIELDS: FieldDef[] = [
  { key: "nom", label: "Nom", type: "text", required: true, placeholder: "Mon Entreprise Inc." },
  { key: "slug", label: "Slug", type: "text", required: true, placeholder: "mon-entreprise" },
  { key: "vertical_id", label: "Vertical", type: "number", placeholder: "1" },
  { key: "tier_code", label: "Tier", type: "select", options: [
    { value: "free", label: "Free" },
    { value: "solo", label: "Solo" },
    { value: "direction", label: "Direction" },
    { value: "csuite", label: "C-Suite" },
    { value: "pioneer", label: "Pioneer" },
  ]},
  { key: "is_active", label: "Actif", type: "toggle" },
];

const VERTICAL_FIELDS: FieldDef[] = [
  { key: "nom_fr", label: "Nom (FR)", type: "text", required: true, placeholder: "Manufacturier alimentaire" },
  { key: "code", label: "Code", type: "text", required: true, placeholder: "alim" },
  { key: "description_fr", label: "Description", type: "textarea", placeholder: "Description du vertical industriel..." },
];

// ═══════════════════════════════════════
// Props
// ═══════════════════════════════════════

interface Props {
  mode: string;
  tenantId?: number;
}

// ═══════════════════════════════════════
// Helper: resolve vertical name from ID
// ═══════════════════════════════════════

function resolveVerticalName(verticalId: number | string | undefined | null, verticals: any[]): string {
  if (!verticalId) return "---";
  const v = verticals.find((vx: any) => vx.id === Number(verticalId));
  return v?.nom_fr || v?.code || String(verticalId);
}

// ═══════════════════════════════════════
// Table header cell style
// ═══════════════════════════════════════

const TH_CLASS = "text-[9px] font-bold text-gray-500 uppercase";

// ═══════════════════════════════════════
// TabInstances
// ═══════════════════════════════════════

export function TabInstances({ mode }: Props) {
  const [tenants, setTenants] = useState<any[]>([]);
  const [verticals, setVerticals] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state — Tenants
  const [editingTenant, setEditingTenant] = useState<any | null>(null);
  const [creatingTenant, setCreatingTenant] = useState(false);

  // Modal state — Verticals
  const [editingVertical, setEditingVertical] = useState<any | null>(null);
  const [creatingVertical, setCreatingVertical] = useState(false);

  // ── Refresh all data ──
  const refreshAll = useCallback(() => {
    setLoading(true);
    Promise.allSettled([
      api.getTenants().catch(() => ({ tenants: [] })),
      api.getVerticals().catch(() => []),
      api.getRegions().catch(() => []),
    ]).then(([tRes, vRes, rRes]) => {
      const tData = (tRes as PromiseFulfilledResult<any>).value;
      const vData = (vRes as PromiseFulfilledResult<any>).value;
      const rData = (rRes as PromiseFulfilledResult<any>).value;

      // getTenants returns { tenants: [] } or could be an array
      if (tData && Array.isArray(tData.tenants)) setTenants(tData.tenants);
      else if (Array.isArray(tData)) setTenants(tData);
      else setTenants([]);

      if (Array.isArray(vData)) setVerticals(vData);
      else if (vData && Array.isArray(vData.verticals)) setVerticals(vData.verticals);
      else setVerticals([]);

      if (Array.isArray(rData)) setRegions(rData);
      else if (rData && Array.isArray(rData.regions)) setRegions(rData.regions);
      else setRegions([]);

      setLoading(false);
    });
  }, []);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  if (mode !== "god") return null;
  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <TabSectionHeader
        icon={Building2}
        title="Instances"
        subtitle="Gestion des instances et verticaux"
        gradient="from-blue-600 to-blue-500"
      />

      {/* StatGrid — 3 KPI */}
      <StatGrid items={[
        { value: tenants.length, label: "Instances", color: "blue" },
        { value: verticals.length, label: "Verticaux", color: "indigo" },
        { value: regions.length, label: "Regions", color: "teal" },
      ]} />

      {/* ═══ Section: Instances ═══ */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <BlockHeader icon={Building2} title="Instances" gradient="from-blue-600 to-blue-500" count={tenants.length} />
        <div className="p-3">
          {tenants.length === 0 ? (
            <EmptyState message="Aucune instance" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className={cn("text-left px-3 py-2", TH_CLASS)}>Nom</th>
                    <th className={cn("text-left px-3 py-2", TH_CLASS)}>Slug</th>
                    <th className={cn("text-left px-3 py-2", TH_CLASS)}>Vertical</th>
                    <th className={cn("text-left px-3 py-2", TH_CLASS)}>Tier</th>
                    <th className={cn("text-center px-3 py-2", TH_CLASS)}>Actif</th>
                    <th className={cn("text-right px-3 py-2", TH_CLASS)}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t) => (
                    <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5 text-xs font-medium text-gray-900">{t.nom || "---"}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 font-mono">{t.slug || "---"}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-600">{resolveVerticalName(t.vertical_id, verticals)}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant="outline" className="text-[9px] font-bold uppercase">
                          {t.tier_code || "---"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={cn(
                          "inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border",
                          t.is_active !== false
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {t.is_active !== false ? "ACTIF" : "INACTIF"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => setEditingTenant(t)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            onClick={() => setCreatingTenant(true)}
            className="flex items-center gap-1.5 px-3 py-2 mt-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Nouvelle instance
          </button>
        </div>
      </Card>

      {/* ═══ Section: Verticaux ═══ */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <BlockHeader icon={Layers} title="Verticaux" gradient="from-indigo-600 to-indigo-500" count={verticals.length} />
        <div className="p-3">
          {verticals.length === 0 ? (
            <EmptyState message="Aucun vertical" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className={cn("text-left px-3 py-2", TH_CLASS)}>Code</th>
                    <th className={cn("text-left px-3 py-2", TH_CLASS)}>Nom</th>
                    <th className={cn("text-left px-3 py-2", TH_CLASS)}>Description</th>
                    <th className={cn("text-right px-3 py-2", TH_CLASS)}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verticals.map((v) => (
                    <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5">
                        <Badge variant="outline" className="text-[9px] font-bold uppercase font-mono">
                          {v.code || "---"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-xs font-medium text-gray-900">{v.nom_fr || "---"}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500 max-w-xs truncate">{v.description_fr || "---"}</td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => setEditingVertical(v)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            onClick={() => setCreatingVertical(true)}
            className="flex items-center gap-1.5 px-3 py-2 mt-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Nouveau vertical
          </button>
        </div>
      </Card>

      {/* ═══ Section: Regions (read-only, compact) ═══ */}
      <div className="max-w-lg">
        <Card className="p-0 overflow-hidden shadow-sm">
          <BlockHeader icon={MapPin} title="Regions" gradient="from-teal-600 to-teal-500" count={regions.length} />
          <div className="p-3">
            {regions.length === 0 ? (
              <EmptyState message="Aucune region" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className={cn("text-left px-3 py-2", TH_CLASS)}>Nom</th>
                      <th className={cn("text-left px-3 py-2", TH_CLASS)}>Niveau</th>
                      <th className={cn("text-left px-3 py-2", TH_CLASS)}>Pays</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regions.map((r, idx) => (
                      <tr key={r.id || r.code || idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 text-xs font-medium text-gray-900">{r.name || r.nom_fr || r.code || "---"}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{r.level ?? "---"}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{r.country_code || "---"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ═══ Modals — Tenant CRUD ═══ */}
      {creatingTenant && (
        <AdminModal
          title="Creer une instance"
          fields={TENANT_FIELDS}
          initialData={{ is_active: true, tier_code: "pioneer" }}
          onSave={async (data) => { await api.createTenant(data); refreshAll(); }}
          onClose={() => setCreatingTenant(false)}
        />
      )}
      {editingTenant && (
        <AdminModal
          title={`Modifier — ${editingTenant.nom}`}
          fields={TENANT_FIELDS}
          initialData={editingTenant}
          onSave={async (data) => { await api.updateTenant(editingTenant.id, data); refreshAll(); }}
          onDelete={async () => { await api.deleteTenant(editingTenant.id); refreshAll(); }}
          onClose={() => setEditingTenant(null)}
        />
      )}

      {/* ═══ Modals — Vertical CRUD ═══ */}
      {creatingVertical && (
        <AdminModal
          title="Creer un vertical"
          fields={VERTICAL_FIELDS}
          onSave={async (data) => { await api.createVertical(data); refreshAll(); }}
          onClose={() => setCreatingVertical(false)}
        />
      )}
      {editingVertical && (
        <AdminModal
          title={`Modifier — ${editingVertical.nom_fr}`}
          fields={VERTICAL_FIELDS}
          initialData={editingVertical}
          onSave={async (data) => { await api.updateVertical(editingVertical.id, data); refreshAll(); }}
          onDelete={async () => { await api.deleteVertical(editingVertical.id); refreshAll(); }}
          onClose={() => setEditingVertical(null)}
        />
      )}
    </div>
  );
}
