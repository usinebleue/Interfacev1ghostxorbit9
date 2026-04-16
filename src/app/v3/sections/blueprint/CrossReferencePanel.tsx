// ── Panel Donnees Liees — Cross-Reference entre departements ──

import { useState, useEffect } from "react";
import { Link2, Loader2 } from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { api } from "../../../v2/api/client";
import { getBlueprintConfig, getCrossReferences, type CrossRef } from "../../../v2/zones/center/blueprint/blueprint-config";

const DEPT_COLORS: Record<string, { gradient: string; text: string }> = {
  CEOB: { gradient: "from-blue-600 to-blue-500", text: "text-blue-600" },
  CTOB: { gradient: "from-violet-600 to-violet-500", text: "text-violet-600" },
  CFOB: { gradient: "from-emerald-600 to-emerald-500", text: "text-emerald-600" },
  CMOB: { gradient: "from-pink-600 to-pink-500", text: "text-pink-600" },
  CSOB: { gradient: "from-red-600 to-red-500", text: "text-red-600" },
  COOB: { gradient: "from-orange-600 to-orange-500", text: "text-orange-600" },
  CPOB: { gradient: "from-amber-600 to-amber-500", text: "text-amber-600" },
  CHROB: { gradient: "from-teal-600 to-teal-500", text: "text-teal-600" },
  CINOB: { gradient: "from-rose-600 to-rose-500", text: "text-rose-600" },
  CROB: { gradient: "from-amber-600 to-amber-500", text: "text-amber-700" },
  CLOB: { gradient: "from-indigo-600 to-indigo-500", text: "text-indigo-600" },
  CISOB: { gradient: "from-gray-600 to-gray-500", text: "text-gray-600" },
  ORBIT9: { gradient: "from-cyan-600 to-blue-500", text: "text-cyan-600" },
};

// ── LABELS DÉPARTEMENTS (source unique) ──
const DEPT_SHORT_LABEL: Record<string, string> = {
  CEOB: "Direction", CROB: "Ventes", CFOB: "Finance",
  CMOB: "Marketing", CTOB: "Technologie", COOB: "Opérations",
  CPOB: "Production", CHROB: "RH", CINOB: "Innovation",
  CSOB: "Stratégie", CLOB: "Juridique", CISOB: "Sécurité",
  ORBIT9: "Collaboration Orbit⁹",
};
// Alias pour compatibilité interne
const DEPT_LABELS = DEPT_SHORT_LABEL;

interface LinkedFieldValue {
  ref: CrossRef;
  values: { fieldId: string; label: string; value: string }[];
  loaded: boolean;
}

export function CrossReferencePanel({ botCode, sectionId }: { botCode: string; sectionId: string }) {
  const [linkedData, setLinkedData] = useState<LinkedFieldValue[]>([]);
  const [loading, setLoading] = useState(true);
  const crossRefs = getCrossReferences(botCode, sectionId);

  useEffect(() => {
    if (crossRefs.length === 0) { setLoading(false); return; }

    (async () => {
      const results: LinkedFieldValue[] = [];
      // Group refs by sourceDept to avoid duplicate canvas fetches
      const byDept = new Map<string, CrossRef[]>();
      for (const ref of crossRefs) {
        const existing = byDept.get(ref.sourceDept) || [];
        existing.push(ref);
        byDept.set(ref.sourceDept, existing);
      }

      for (const [dept, refs] of byDept) {
        let canvasData: Record<string, unknown> = {};
        try {
          const res = await api.getOrCreateCanvas(`blueprint_${dept}`);
          canvasData = (res.data && typeof res.data === "object") ? res.data as Record<string, unknown> : {};
        } catch { /* empty */ }

        for (const ref of refs) {
          const cfg = getBlueprintConfig(ref.sourceDept);
          const sourceSection = cfg?.subSections.find(s => s.id === ref.sourceSection);
          const values: { fieldId: string; label: string; value: string }[] = [];

          for (const fieldId of ref.sourceFields) {
            const field = sourceSection?.fields.find(f => f.id === fieldId);
            const raw = canvasData[`${ref.sourceSection}.${fieldId}`];
            const value = raw !== undefined && raw !== null && raw !== "" ? String(raw) : "";
            values.push({
              fieldId,
              label: field?.label || fieldId,
              value,
            });
          }
          results.push({ ref, values, loaded: true });
        }
      }
      setLinkedData(results);
      setLoading(false);
    })();
  }, [botCode, sectionId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (crossRefs.length === 0) return null;
  if (loading) return (
    <div className="mt-3 border border-dashed border-blue-200 rounded-lg p-3 flex items-center gap-2">
      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
      <span className="text-[9px] text-gray-400">Chargement des données liées...</span>
    </div>
  );

  const hasAnyData = linkedData.some(d => d.values.some(v => v.value !== ""));
  const emptyCount = linkedData.filter(d => d.values.every(v => v.value === "")).length;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-2">
        <Link2 className="h-3.5 w-3.5 text-blue-500" />
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Données liées ({linkedData.length} sources)</span>
        {emptyCount > 0 && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-medium">
            {emptyCount} non renseigné{emptyCount > 1 ? "es" : "e"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        {linkedData.map((item, idx) => {
          const colors = DEPT_COLORS[item.ref.sourceDept] || DEPT_COLORS.CEOB;
          const deptLabel = DEPT_LABELS[item.ref.sourceDept] || item.ref.sourceDept;
          const anyFilled = item.values.some(v => v.value !== "");

          return (
            <div
              key={idx}
              className={cn(
                "rounded-lg border overflow-hidden",
                anyFilled ? "border-gray-200" : "border-dashed border-gray-200 bg-gray-50/50"
              )}
            >
              <div className={cn("flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r", colors.gradient)}>
                <Link2 className="h-3.5 w-3.5 text-white/70" />
                <span className="text-[9px] font-bold text-white flex-1">{item.ref.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/20 text-white">{deptLabel}</span>
              </div>
              <div className="px-3 py-2">
                {item.values.map(v => (
                  <div key={v.fieldId} className="flex items-center justify-between py-0.5">
                    <span className="text-[9px] text-gray-500">{v.label}</span>
                    {v.value ? (
                      <span className={cn("text-[9px] font-medium", colors.text)}>
                        {v.value.length > 60 ? v.value.slice(0, 60) + "..." : v.value}
                      </span>
                    ) : (
                      <span className="text-[9px] text-gray-300 italic">Non renseigné</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!hasAnyData && (
        <p className="text-[9px] text-gray-400 text-center mt-2">
          Les départements liés n'ont pas encore rempli leurs blueprints. Les données apparaîtront automatiquement.
        </p>
      )}
    </div>
  );
}
