/**
 * DocumentWorkspaceView.tsx — Blueprint Atelier dans le workspace V3
 *
 * Copie du pattern BlueprintSectionFocus (FocusModeLayout.tsx L258-613)
 * DANS le workspace au lieu d'un overlay plein écran.
 *
 * Features:
 * - Sidebar TOC avec sections Blueprint + % complétion
 * - Zone contenu avec champs éditables (narrow 2-col + wide full-width)
 * - Canvas API auto-save (réutilise client.ts)
 * - CTA "Passer en exécution" quand assez de champs remplis
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Loader2, Check, FileText, ChevronRight } from "lucide-react";
import { useIsMobile } from "../../components/ui/use-mobile";
import { cn } from "../../components/ui/utils";
import { MobileSidebarSheet } from "../core/MobileSidebarSheet";
import { useAmorcer } from "../AmorcerContext";
import { api } from "../../v2/api/client";
import * as mod from "../../v2/zones/center/blueprint/blueprint-config";
import type { SubSectionDef, FieldDef } from "../../v2/zones/center/blueprint/blueprint-config";

interface SectionTOCItem {
  id: string;
  label: string;
  icon: React.ElementType;
  fieldCount: number;
  filledCount: number;
  description: string;
  intro: string;
}

interface DocumentWorkspaceViewProps {
  documentKey: string;
  botCode: string;
  initialSectionId?: string;
  context: string | null;
  onPhaseComplete: () => void;
}

export function DocumentWorkspaceView({
  documentKey,
  botCode,
  initialSectionId,
  context,
  onPhaseComplete,
}: DocumentWorkspaceViewProps) {
  const isMobile = useIsMobile();
  const { setActiveDocumentKey } = useAmorcer();

  // State
  const [sections, setSections] = useState<SectionTOCItem[]>([]);
  const [activeSectionId, setActiveSectionId] = useState(initialSectionId || "");
  const [allData, setAllData] = useState<Record<string, string>>({});
  const [canvasId, setCanvasId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const [tier, setTier] = useState<mod.SizeTier>("T2");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load blueprint config + canvas data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const configs = await import("../../v2/zones/center/blueprint/blueprint-config");
        const config = configs.getBlueprintConfig(botCode) || configs.getBlueprintConfig("CEOB");
        if (!config || cancelled) return;

        // Load canvas
        const canvasKey = `blueprint_${botCode}`;
        const canvas = await api.getOrCreateCanvas(canvasKey);
        if (cancelled) return;

        const flat: Record<string, string> = {};
        if (canvas.data && typeof canvas.data === "object") {
          for (const [k, v] of Object.entries(canvas.data as Record<string, unknown>)) {
            if (typeof v === "string") flat[k] = v;
          }
        }

        // Detect tier
        const tierRef = flat["identification.nb_employes"]
          ? mod.getSizeTier(parseInt(flat["identification.nb_employes"]) || 50)
          : "T2" as mod.SizeTier;
        setTier(tierRef);

        // Build TOC from visible sections
        const visible = mod.getVisibleSubSections(config, tierRef);
        const tocItems: SectionTOCItem[] = visible.map(s => {
          const sFields = mod.getFieldsForTier(s.fields, tierRef);
          const filled = sFields.filter(f => {
            const v = flat[`${s.id}.${f.id}`];
            return v !== undefined && v !== "" && v !== "[]";
          }).length;
          return {
            id: s.id,
            label: s.label,
            icon: s.icon,
            fieldCount: sFields.length,
            filledCount: filled,
            description: s.description,
            intro: s.intro || "",
          };
        });
        setSections(tocItems);
        setAllData(flat);
        setCanvasId(canvas.id);
        if (!activeSectionId && tocItems.length > 0) {
          setActiveSectionId(tocItems[0].id);
        }
      } catch (e) {
        console.error("DocumentWorkspaceView load:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [botCode, activeSectionId]);

  // Auto-save debounced
  const scheduleAutoSave = useCallback((newData: Record<string, string>) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaving("saving");
    saveTimerRef.current = setTimeout(async () => {
      if (canvasId) {
        try {
          await api.updateCanvas(canvasId, newData);
          setSaving("saved");
          setTimeout(() => setSaving("idle"), 1500);
        } catch (e) {
          console.error("Auto-save error:", e);
          setSaving("idle");
        }
      }
    }, 2000);
  }, [canvasId]);

  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    setAllData(prev => {
      const next = { ...prev, [`${activeSectionId}.${fieldId}`]: value };
      scheduleAutoSave(next);
      // Update TOC counts
      setSections(prevSections => prevSections.map(s => {
        if (s.id !== activeSectionId) return s;
        const key = `${s.id}.${fieldId}`;
        const newFilled = Object.keys(next).filter(k => k.startsWith(`${s.id}.`) && next[k] && next[k] !== "" && next[k] !== "[]").length;
        return { ...s, filledCount: newFilled };
      }));
      return next;
    });
  }, [activeSectionId, scheduleAutoSave]);

  // Get current section config
  const currentSection = sections.find(s => s.id === activeSectionId);
  const totalFilled = sections.reduce((sum, s) => sum + s.filledCount, 0);
  const totalFields = sections.reduce((sum, s) => sum + s.fieldCount, 0);
  const completionPct = totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0;

  // Get fields for active section
  const [activeFields, setActiveFields] = useState<(FieldDef & { value: string })[]>([]);
  useEffect(() => {
    async function loadFields() {
      try {
        const configs = await import("../../v2/zones/center/blueprint/blueprint-config");
        const config = configs.getBlueprintConfig(botCode) || configs.getBlueprintConfig("CEOB");
        if (!config) return;
        const sub = config.subSections.find(s => s.id === activeSectionId);
        if (!sub) { setActiveFields([]); return; }
        const tierFields = mod.getFieldsForTier(sub.fields, tier);
        setActiveFields(tierFields.map(f => ({
          ...f,
          value: allData[`${activeSectionId}.${f.id}`] || "",
        })));
      } catch { setActiveFields([]); }
    }
    loadFields();
  }, [activeSectionId, allData, tier, botCode]);

  const narrowFields = activeFields.filter(f => f.type === "text" || f.type === "number" || f.type === "date" || f.type === "select" || f.type === "currency" || f.type === "percentage");
  const wideFields = activeFields.filter(f => f.type === "textarea" || f.type === "list" || f.type === "json" || f.type === "markdown");
  const inputBase = "w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 text-gray-400 animate-spin stroke-[2.5]" />
        <span className="text-sm text-gray-400 ml-2">Chargement du Blueprint...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header compact */}
      <div className="px-4 py-2.5 border-b border-gray-200 bg-white flex items-center gap-3 shrink-0">
        <button
          onClick={() => setActiveDocumentKey(null)}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
        </button>
        <FileText className="h-4 w-4 text-yellow-500 stroke-[2.5]" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 truncate">
            Blueprint — {context || "Conception"}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400">{completionPct}% complété</span>
            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>
        {/* Save indicator */}
        <div className="flex items-center gap-1.5 text-[10px]">
          {saving === "saving" && (
            <>
              <Loader2 className="h-3 w-3 text-blue-400 animate-spin stroke-[2.5]" />
              <span className="text-blue-400">Sauvegarde...</span>
            </>
          )}
          {saving === "saved" && (
            <>
              <Check className="h-3 w-3 text-emerald-500 stroke-[2.5]" />
              <span className="text-emerald-500">Sauvegardé</span>
            </>
          )}
        </div>
      </div>

      {/* Body: sidebar TOC + content */}
      <div className={cn("flex-1 overflow-hidden flex", isMobile && "flex-col")}>
        {/* Sidebar TOC */}
        {(() => {
          const activeLabel = sections.find(s => s.id === activeSectionId)?.label || "Blueprint";
          const sidebarContent = (<>
            {sections.map((s) => {
              const isActive = s.id === activeSectionId;
              const pct = s.fieldCount > 0 ? Math.round((s.filledCount / s.fieldCount) * 100) : 0;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSectionId(s.id)}
                  className={cn(
                    "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                    isActive
                      ? "bg-blue-50 border border-blue-200 shadow-sm"
                      : "hover:bg-gray-50 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <s.icon className={cn("h-3.5 w-3.5", isActive ? "text-blue-500" : "text-gray-400")} />
                    <span className={cn(
                      "text-[10px] font-bold flex-1 leading-tight truncate",
                      isActive ? "text-blue-700" : "text-gray-700"
                    )}>
                      {s.label}
                    </span>
                    <span className={cn(
                      "text-[9px] font-medium",
                      pct === 100 ? "text-emerald-500" : pct > 0 ? "text-blue-400" : "text-gray-300"
                    )}>
                      {pct}%
                    </span>
                  </div>
                </button>
              );
            })}

            {/* CTA execution */}
            {completionPct >= 30 && (
              <div className="mt-4 px-2">
                <button
                  onClick={onPhaseComplete}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold hover:bg-green-100 transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                  Passer en exécution
                </button>
              </div>
            )}
          </>);
          return isMobile ? (
            <MobileSidebarSheet currentLabel={activeLabel} itemCount={sections.length}>
              {sidebarContent}
            </MobileSidebarSheet>
          ) : (
            <div className="w-[180px] shrink-0 border-r border-gray-100 overflow-y-auto bg-white py-3 px-2 space-y-0.5">
              {sidebarContent}
            </div>
          );
        })()}

        {/* Content area */}
        <div className="flex-1 min-w-0 overflow-y-auto px-6 py-4 space-y-5">
          {currentSection && (
            <>
              {/* Section header */}
              <div>
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <currentSection.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  {currentSection.label}
                </h2>
                {currentSection.description && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{currentSection.description}</p>
                )}
                {currentSection.intro && (
                  <div className="mt-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <p className="text-xs text-yellow-800 leading-relaxed">{currentSection.intro}</p>
                  </div>
                )}
              </div>

              {/* Narrow fields — 2 columns */}
              {narrowFields.length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {narrowFields.map(field => (
                    <div key={field.id}>
                      <label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1.5">
                        {field.label}
                        {field.required && <span className="text-red-400">*</span>}
                      </label>
                      {field.type === "select" && field.options ? (
                        <select
                          className={inputBase}
                          value={field.value}
                          onChange={e => handleFieldChange(field.id, e.target.value)}
                        >
                          <option value="">-- Selectionner --</option>
                          {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type={field.type === "number" || field.type === "currency" || field.type === "percentage" ? "number" : field.type === "date" ? "date" : "text"}
                          className={inputBase}
                          value={field.value}
                          onChange={e => handleFieldChange(field.id, e.target.value)}
                          placeholder={field.placeholder || field.label}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Wide fields — full width */}
              {wideFields.length > 0 && (
                <div className="space-y-3">
                  {wideFields.map(field => (
                    <div key={field.id}>
                      <label className="text-xs font-bold text-gray-600 mb-1 flex items-center gap-1.5">
                        {field.label}
                        {field.required && <span className="text-red-400">*</span>}
                      </label>
                      <textarea
                        className={cn(inputBase, "min-h-[80px] resize-y")}
                        value={field.value}
                        onChange={e => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder || `${field.label} (${field.type === "list" ? "un par ligne" : field.type === "json" ? "JSON" : "texte libre"})`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {activeFields.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <p className="text-xs text-gray-400">Aucun champ pour cette section au tier {tier}</p>
                </div>
              )}

              {/* Progress footer */}
              {currentSection && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>{currentSection.filledCount}/{currentSection.fieldCount} champs remplis</span>
                    <span>Section {sections.findIndex(s => s.id === activeSectionId) + 1}/{sections.length}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
