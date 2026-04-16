// ── Sub-section content — champs + KPIs ──
import { Loader2, Save } from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { getFieldsForTier, type SubSectionDef, type SizeTier } from "../../../v2/zones/center/blueprint/blueprint-config";
import { BlueprintField, isWideField, KPIDisplay } from "./blueprint-helpers";

export function SubSectionContent({ section, tier, data, onFieldChange, onSave, saving, dirty }: {
  section: SubSectionDef;
  tier: SizeTier;
  data: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
}) {
  const fields = getFieldsForTier(section.fields, tier);
  const hasKpis = section.kpis.length > 0;

  const wideFields = fields.filter(isWideField);
  const narrowFields = fields.filter(f => !isWideField(f));

  return (
    <div className="space-y-4">
      {narrowFields.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {narrowFields.map(field => (
            <div key={field.id}>
              <label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1.5">
                {field.label}
                {field.required && <span className="text-red-400">*</span>}
              </label>
              <BlueprintField
                field={field}
                value={data[`${section.id}.${field.id}`] || ""}
                onChange={v => onFieldChange(`${section.id}.${field.id}`, v)}
              />
            </div>
          ))}
        </div>
      )}

      {wideFields.length > 0 && (
        <div className="space-y-3">
          {wideFields.map(field => (
            <div key={field.id}>
              <label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1.5">
                {field.label}
                {field.required && <span className="text-red-400">*</span>}
              </label>
              <BlueprintField
                field={field}
                value={data[`${section.id}.${field.id}`] || ""}
                onChange={v => onFieldChange(`${section.id}.${field.id}`, v)}
              />
            </div>
          ))}
        </div>
      )}

      {hasKpis && (
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Indicateurs cles</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {section.kpis.map(kpi => (
              <KPIDisplay key={kpi.id} kpi={kpi} />
            ))}
          </div>
        </div>
      )}

      {fields.length === 0 && !hasKpis && (
        <p className="text-xs text-gray-400 text-center py-6">Cette section sera alimentee automatiquement par les diagnostics et les documents crees.</p>
      )}

      {fields.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-[9px] text-gray-400">{dirty ? "Modifications non sauvegardees" : "A jour"}</span>
          <button
            onClick={onSave}
            disabled={saving || !dirty}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all",
              dirty
                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      )}
    </div>
  );
}
