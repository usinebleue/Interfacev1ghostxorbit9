/**
 * TabVerticals.tsx — Gestion Verticaux, Regions, Pionniers (God Mode only)
 * Sous-tabs: Liste | Regions | Pionniers
 */

import { useState, useEffect, useCallback } from "react";
import { Layers, Plus, Inbox, Pencil, Loader2, MapPin, Users, ChevronDown } from "lucide-react";
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
  { id: "liste", label: "Liste" },
  { id: "regions", label: "Regions" },
  { id: "pionniers", label: "Pionniers" },
];

const VERTICAL_FIELDS: FieldDef[] = [
  { key: "nom_fr", label: "Nom (FR)", type: "text", required: true, placeholder: "Manufacturier alimentaire" },
  { key: "code", label: "Code", type: "text", required: true, placeholder: "alim" },
  { key: "description_fr", label: "Description", type: "textarea", placeholder: "Description du vertical industriel..." },
];

// ═══════════════════════════════════════
// TabVerticals
// ═══════════════════════════════════════

export function TabVerticals({ mode }: Props) {
  const [sub, setSub] = useState("liste");
  const [verticals, setVerticals] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [pioneers, setPioneers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [selectedVertical, setSelectedVertical] = useState("");
  const [pioneersLoading, setPioneersLoading] = useState(false);

  // ── Refresh verticals ──
  const refreshVerticals = useCallback(() => {
    setLoading(true);
    api.getVerticals()
      .then(data => { if (Array.isArray(data)) setVerticals(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Refresh regions ──
  const refreshRegions = useCallback(() => {
    setLoading(true);
    api.getRegions()
      .then(data => { if (Array.isArray(data)) setRegions(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refreshVerticals(); }, [refreshVerticals]);

  useEffect(() => {
    if (sub === "regions") refreshRegions();
  }, [sub, refreshRegions]);

  // ── Load pioneers when vertical selected ──
  useEffect(() => {
    if (!selectedVertical) { setPioneers([]); return; }
    setPioneersLoading(true);
    api.getOrbit9Pioneers(selectedVertical)
      .then(data => { if (data && Array.isArray(data.pioneers)) setPioneers(data.pioneers); else setPioneers([]); })
      .catch(() => setPioneers([]))
      .finally(() => setPioneersLoading(false));
  }, [selectedVertical]);

  if (mode !== "god") return null;

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

      {/* ═══ Liste ═══ */}
      {sub === "liste" && (
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
          ) : verticals.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Inbox className="h-8 w-8" />
              <span className="text-sm">Aucun vertical</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {verticals.map(v => (
                <Card key={v.id} className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500">
                    <Layers className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white truncate flex-1">{v.nom_fr}</span>
                    <span className="text-[9px] font-bold text-white bg-white/20 px-1.5 py-0.5 rounded">
                      {(v.code || "??").slice(0, 3).toUpperCase()}
                    </span>
                    <button onClick={() => setEditing(v)} className="p-1 hover:bg-white/20 rounded transition-colors">
                      <Pencil className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                  {v.description_fr && (
                    <div className="px-3 py-2">
                      <div className="text-[9px] text-gray-500 truncate">{v.description_fr}</div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Nouveau vertical
          </button>
        </div>
      )}

      {/* ═══ Regions ═══ */}
      {sub === "regions" && (
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
          ) : regions.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Inbox className="h-8 w-8" />
              <span className="text-sm">Aucune region</span>
            </div>
          ) : (
            regions.map(r => (
              <Card key={r.id || r.code || r.name} className="p-0 overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
                  <MapPin className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white truncate">{r.name || r.nom_fr || r.code}</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-[9px] text-gray-500">
                    Niveau {r.level ?? "—"} {r.country_code ? `— ${r.country_code}` : ""}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ═══ Pionniers ═══ */}
      {sub === "pionniers" && (
        <div className="space-y-3">
          {/* Vertical selector */}
          <div className="relative">
            <select
              value={selectedVertical}
              onChange={e => setSelectedVertical(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none pr-8"
            >
              <option value="">-- Choisir un vertical --</option>
              {verticals.map(v => (
                <option key={v.id} value={v.code}>{v.nom_fr} ({v.code})</option>
              ))}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {!selectedVertical ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Users className="h-8 w-8" />
              <span className="text-sm">Selectionnez un vertical pour voir ses pionniers</span>
            </div>
          ) : pioneersLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
          ) : pioneers.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Inbox className="h-8 w-8" />
              <span className="text-sm">Aucun pionnier pour ce vertical</span>
            </div>
          ) : (
            pioneers.map((p, i) => (
              <Card key={p.id || i} className="p-0 overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-500">
                  <Users className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white truncate flex-1">
                    {p.nom || p.name || p.company_name || `Pionnier ${i + 1}`}
                  </span>
                </div>
                {(p.email || p.description) && (
                  <div className="px-3 py-2">
                    <div className="text-[9px] text-gray-500 truncate">{p.email || p.description}</div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal create */}
      {creating && (
        <AdminModal
          title="Creer un vertical"
          fields={VERTICAL_FIELDS}
          onSave={async (data) => { await api.createVertical(data); refreshVerticals(); }}
          onClose={() => setCreating(false)}
        />
      )}

      {/* Modal edit */}
      {editing && (
        <AdminModal
          title={`Modifier — ${editing.nom_fr}`}
          fields={VERTICAL_FIELDS}
          initialData={editing}
          onSave={async (data) => { await api.updateVertical(editing.id, data); refreshVerticals(); }}
          onDelete={async () => { await api.deleteVertical(editing.id); refreshVerticals(); }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
