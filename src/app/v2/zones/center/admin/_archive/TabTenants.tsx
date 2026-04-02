/**
 * TabTenants.tsx — CRUD tenants (God Mode only)
 * Sous-tabs: Liste | Creer | Configurer
 */

import { useState, useEffect, useCallback } from "react";
import { Building2, Plus, Inbox, Pencil, Loader2 } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { AdminModal, type FieldDef } from "./AdminModal";

const SUBTABS = [
  { id: "liste", label: "Liste" },
  { id: "creation", label: "Creer" },
  { id: "config", label: "Configurer" },
];

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

interface Props {
  mode: "god" | "instance";
  tenantId?: number;
}

export function TabTenants({ mode }: Props) {
  const [sub, setSub] = useState("liste");
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    api.getTenants()
      .then(data => { if (Array.isArray(data)) setTenants(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  if (mode !== "god") return null;

  return (
    <div className="space-y-3">
      {/* Sub-tabs */}
      <div className="flex gap-1.5">
        {SUBTABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setSub(t.id); if (t.id === "creation") setCreating(true); }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              sub === t.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {sub === "liste" && (
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Chargement...</span>
            </div>
          ) : tenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
              <Inbox className="h-8 w-8" />
              <span className="text-sm">Aucun tenant</span>
            </div>
          ) : (
            tenants.map(t => (
              <Card key={t.id} className="p-0 overflow-hidden hover:shadow-md transition-all">
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                    {(t.slug || "??").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-800 truncate">{t.nom}</div>
                    <div className="text-[11px] text-gray-400">{t.slug} — {t.tier_code || "pioneer"}</div>
                  </div>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                    t.is_active !== false ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200"
                  )}>
                    {t.is_active !== false ? "ACTIF" : "INACTIF"}
                  </span>
                  <button onClick={() => setEditing(t)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <Pencil className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                </div>
              </Card>
            ))
          )}
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Nouveau tenant
          </button>
        </div>
      )}

      {sub === "config" && (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
          <Inbox className="h-8 w-8" />
          <span className="text-sm">Selectionnez un tenant dans la liste pour le configurer</span>
        </div>
      )}

      {/* Modal create */}
      {creating && (
        <AdminModal
          title="Creer un tenant"
          fields={TENANT_FIELDS}
          initialData={{ is_active: true, tier_code: "pioneer" }}
          onSave={async (data) => { await api.createTenant(data); refresh(); }}
          onClose={() => { setCreating(false); setSub("liste"); }}
        />
      )}

      {/* Modal edit */}
      {editing && (
        <AdminModal
          title={`Modifier — ${editing.nom}`}
          fields={TENANT_FIELDS}
          initialData={editing}
          onSave={async (data) => { await api.updateTenant(editing.id, data); refresh(); }}
          onDelete={async () => { await api.deleteTenant(editing.id); refresh(); }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
