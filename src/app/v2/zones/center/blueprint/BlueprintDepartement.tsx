/**
 * BlueprintDepartement.tsx — Composant générique Blueprint Vivant par département
 * Rend dynamiquement les sous-sections Blueprint selon la taille de l'entreprise et la phase.
 * Source: blueprint-config.ts (12 départements × ~97 sous-sections)
 *
 * Utilisé dans DepartmentTourDeControle.tsx pour le tab "Blueprint" de TOUS les bots.
 * CEOB garde ses TabSommaire/TabObjectifs existants pour profil/swot/bmc/objectifs/finances,
 * MAIS les nouvelles sections (gouvernance, risques, culture, vue consolidée) utilisent ce composant.
 * Les 11 autres bots utilisent UNIQUEMENT ce composant pour leur Blueprint tab.
 */

import { useState, useEffect, useCallback } from "react";
import {
  Building2, Target, Layers, Rocket, DollarSign, Shield, Compass,
  TrendingUp, ListChecks, Settings, Flame, Save, Loader2,
  CheckCircle2, AlertTriangle, Info,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import {
  getBlueprintConfig,
  getSizeTier,
  getVisibleSubSections,
  getFieldsForTier,
  calculateCompletionScore,
  type SizeTier,
  type Phase,
  type SubSectionDef,
  type FieldDef,
  type KPIDef,
  type DeptBlueprintConfig,
  type Pertinence,
  SIZE_TIERS,
  PHASES,
} from "./blueprint-config";

// ── Icon resolver ──
const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Target, Layers, Rocket, DollarSign, Shield, Compass,
  TrendingUp, ListChecks, Settings, Flame,
};
function resolveIcon(name: string): React.ElementType {
  return ICON_MAP[name] || Layers;
}

// ── Pertinence badge ──
const PERTINENCE_STYLE: Record<Pertinence, { label: string; bg: string; text: string }> = {
  C: { label: "Critique", bg: "bg-red-50", text: "text-red-700" },
  I: { label: "Important", bg: "bg-amber-50", text: "text-amber-700" },
  O: { label: "Optionnel", bg: "bg-blue-50", text: "text-blue-600" },
  H: { label: "Caché", bg: "bg-gray-50", text: "text-gray-400" },
  R: { label: "Réglementaire", bg: "bg-purple-50", text: "text-purple-700" },
};

function PertinenceBadge({ p }: { p: Pertinence }) {
  const s = PERTINENCE_STYLE[p];
  return <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", s.bg, s.text)}>{s.label}</span>;
}

// ── Score bar ──
function ScoreBar({ value, seuils }: { value: number; seuils: { vert: number; jaune: number; rouge: number } }) {
  const color = value >= seuils.vert ? "bg-emerald-500" : value >= seuils.jaune ? "bg-amber-400" : "bg-red-500";
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Field renderer ──
function BlueprintField({ field, value, onChange }: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const base = "w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-white";

  if (field.type === "textarea") {
    return <textarea className={cn(base, "min-h-[60px] resize-y")} value={value} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || field.label} />;
  }
  if (field.type === "select" && field.options) {
    return (
      <select className={base} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">— Sélectionner —</option>
        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (field.type === "list") {
    return <textarea className={cn(base, "min-h-[40px] resize-y")} value={value} onChange={e => onChange(e.target.value)} placeholder={`${field.label} (un par ligne)`} />;
  }
  if (field.type === "json") {
    return <textarea className={cn(base, "min-h-[60px] resize-y font-mono text-[9px]")} value={value} onChange={e => onChange(e.target.value)} placeholder={`${field.label} (JSON)`} />;
  }

  const inputType = field.type === "number" || field.type === "currency" || field.type === "percentage" ? "number" : field.type === "date" ? "date" : "text";
  const prefix = field.type === "currency" ? "$" : field.type === "percentage" ? "%" : null;

  return (
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{prefix}</span>}
      <input
        type={inputType}
        className={cn(base, prefix ? "pl-7" : "")}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder || field.label}
      />
    </div>
  );
}

// ── KPI Card ──
function KPIDisplay({ kpi, value }: { kpi: KPIDef; value?: number }) {
  const displayValue = value ?? 0;
  const color = displayValue >= kpi.seuils.vert ? "text-emerald-600" : displayValue >= kpi.seuils.jaune ? "text-amber-600" : "text-red-600";
  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-3 py-2 bg-gradient-to-r from-gray-700 to-gray-600 flex items-center gap-2">
        <TrendingUp className="h-3.5 w-3.5 text-white" />
        <span className="text-xs font-bold text-white">{kpi.label}</span>
      </div>
      <div className="px-3 py-2">
        <div className={cn("text-2xl font-bold", color)}>{displayValue}{kpi.unite}</div>
        <div className="text-[9px] text-gray-400">Benchmark: {kpi.benchmark}</div>
        {kpi.formule && <div className="text-[9px] text-gray-300 mt-0.5">{kpi.formule}</div>}
        <ScoreBar value={displayValue} seuils={kpi.seuils} />
      </div>
    </Card>
  );
}

// ── Sub-section content ──
function SubSectionContent({ section, tier, data, onFieldChange }: {
  section: SubSectionDef;
  tier: SizeTier;
  data: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
}) {
  const fields = getFieldsForTier(section.fields, tier);
  const hasKpis = section.kpis.length > 0;

  return (
    <div className="space-y-4">
      {/* Description */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
        <Info className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <p className="text-xs text-gray-500">{section.description}</p>
      </div>

      {/* Fields */}
      {fields.length > 0 && (
        <div className="space-y-3">
          {fields.map(field => (
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

      {/* KPIs */}
      {hasKpis && (
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">KPIs</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {section.kpis.map(kpi => (
              <KPIDisplay key={kpi.id} kpi={kpi} />
            ))}
          </div>
        </div>
      )}

      {/* Templates liés */}
      {section.templates && section.templates.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-bold text-gray-400">Templates:</span>
          {section.templates.map(t => (
            <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{t}</span>
          ))}
        </div>
      )}

      {/* Playbooks liés */}
      {section.playbooks && section.playbooks.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-bold text-gray-400">Playbooks:</span>
          {section.playbooks.map(p => (
            <span key={p} className="text-[9px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 font-medium">{p}</span>
          ))}
        </div>
      )}

      {/* Empty state */}
      {fields.length === 0 && !hasKpis && (
        <p className="text-xs text-gray-400 text-center py-6">Cette section sera alimentée automatiquement par les diagnostics et les documents créés.</p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════

interface BlueprintDepartementProps {
  botCode: string;
  headerGradient: string;
  /** Override la taille detectée (sinon charge depuis EntrepriseProfil) */
  sizeTier?: SizeTier;
}

export function BlueprintDepartement({ botCode, headerGradient, sizeTier: propTier }: BlueprintDepartementProps) {
  const config = getBlueprintConfig(botCode);
  const [tier, setTier] = useState<SizeTier>(propTier || "T2");
  const [phase, setPhase] = useState<Phase>("startup");
  const [activeSub, setActiveSub] = useState<string>("");
  const [data, setData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger la taille depuis le profil entreprise + données canvas
  useEffect(() => {
    if (!config) return;

    // Charger le profil pour déterminer la taille
    if (!propTier) {
      api.getEntrepriseProfil().then(res => {
        if (res.profil?.nb_employes) {
          setTier(getSizeTier(res.profil.nb_employes));
        }
      }).catch(() => {});
    }

    // Charger les données Blueprint du canvas
    api.getOrCreateCanvas(`blueprint_${botCode}`).then(res => {
      if (res.data && typeof res.data === "object") {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(res.data)) {
          flat[k] = typeof v === "string" ? v : JSON.stringify(v);
        }
        setData(flat);
      }
    }).catch(() => {}).finally(() => setLoading(false));

    // Initialiser le premier sub-tab visible
    const visible = getVisibleSubSections(config, propTier || "T2");
    if (visible.length > 0 && !activeSub) {
      setActiveSub(visible[0].id);
    }
  }, [botCode, config, propTier]); // eslint-disable-line react-hooks/exhaustive-deps

  // Quand le tier change, vérifier que le sub-tab actif est encore visible
  useEffect(() => {
    if (!config) return;
    const visible = getVisibleSubSections(config, tier);
    if (visible.length > 0 && !visible.find(s => s.id === activeSub)) {
      setActiveSub(visible[0].id);
    }
  }, [tier, config, activeSub]);

  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    setData(prev => ({ ...prev, [fieldId]: value }));
    setDirty(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const canvas = await api.getOrCreateCanvas(`blueprint_${botCode}`);
      await api.updateCanvas(canvas.id, data as Record<string, unknown>);
      setDirty(false);
    } catch {
      // silently fail — will retry
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return <p className="text-xs text-gray-400 text-center py-8">Configuration Blueprint non disponible pour {botCode}</p>;
  }

  const visibleSections = getVisibleSubSections(config, tier);
  const activeSection = visibleSections.find(s => s.id === activeSub) || visibleSections[0];
  const completionScore = calculateCompletionScore(config, tier, data as Record<string, unknown>);

  // Sub-tab definitions
  const subTabs = visibleSections.map(s => ({
    id: s.id,
    label: s.label,
    pertinence: s.pertinence[tier],
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ═══ HEADER — Gradient + titre + score + save ═══ */}
      <div className={cn("bg-gradient-to-r rounded-xl p-4 transition-all duration-300", headerGradient)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Blueprint — {config.deptLabel}</h2>
              <p className="text-sm text-white/70">{visibleSections.length} sections • {SIZE_TIERS.find(t => t.id === tier)?.label || tier}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Score complétion */}
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{completionScore}%</div>
              <div className="text-[9px] text-white/60">Complétion</div>
            </div>
            {/* Save button */}
            {dirty && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-all"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            )}
          </div>
        </div>

        {/* Sélecteurs Phase + Taille */}
        <div className="flex items-center gap-4">
          {/* Phase selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Phase:</span>
            {PHASES.map(p => (
              <button
                key={p.id}
                onClick={() => setPhase(p.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[9px] font-medium transition-all cursor-pointer",
                  phase === p.id ? "bg-white/25 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/10"
                )}
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
          {/* Taille selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Taille:</span>
            {SIZE_TIERS.map(t => (
              <button
                key={t.id}
                onClick={() => setTier(t.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[9px] font-medium transition-all cursor-pointer",
                  tier === t.id ? "bg-white/25 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/10"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ SUB-TABS — Sections visibles ═══ */}
      <div className="flex gap-1.5 flex-wrap">
        {subTabs.map(tab => {
          const isCritical = tab.pertinence === "C" || tab.pertinence === "R";
          const isActive = tab.id === activeSub;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSub(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
                isActive
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              )}
            >
              {tab.label}
              {isCritical && !isActive && (
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  tab.pertinence === "R" ? "bg-purple-500" : "bg-red-400"
                )} />
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ CONTENU — Section active ═══ */}
      {activeSection && (
        <Card className="p-0 overflow-hidden shadow-sm">
          {/* Section header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-white">
            {(() => {
              const Icon = resolveIcon(activeSection.icon);
              return <Icon className="h-4 w-4 text-gray-600" />;
            })()}
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">{activeSection.label}</p>
              <p className="text-[9px] text-gray-400">{activeSection.description}</p>
            </div>
            <PertinenceBadge p={activeSection.pertinence[tier]} />
          </div>
          {/* Content */}
          <div className="p-4">
            <SubSectionContent
              section={activeSection}
              tier={tier}
              data={data}
              onFieldChange={handleFieldChange}
            />
          </div>
        </Card>
      )}

      {/* ═══ OVERVIEW — Résumé des sections ═══ */}
      <Card className="p-0 overflow-hidden">
        <div className="px-3 py-2 bg-gray-50 border-b flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Aperçu des sections</span>
        </div>
        <div className="p-3 grid grid-cols-2 lg:grid-cols-3 gap-2">
          {visibleSections.map(section => {
            const Icon = resolveIcon(section.icon);
            const sectionFields = getFieldsForTier(section.fields, tier);
            const filled = sectionFields.filter(f => {
              const v = data[`${section.id}.${f.id}`];
              return v !== undefined && v !== "" && v !== "[]";
            }).length;
            const total = sectionFields.length;
            const pct = total > 0 ? Math.round((filled / total) * 100) : (section.kpis.length > 0 ? 0 : 100);
            const p = section.pertinence[tier];

            return (
              <button
                key={section.id}
                onClick={() => setActiveSub(section.id)}
                className={cn(
                  "p-2.5 rounded-lg border text-left transition-all cursor-pointer hover:shadow-sm",
                  activeSub === section.id ? "border-blue-300 bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-700 truncate flex-1">{section.label}</span>
                  <PertinenceBadge p={p} />
                </div>
                {total > 0 && (
                  <>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-0.5">
                      <div className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-emerald-500" : pct > 0 ? "bg-blue-500" : "bg-gray-200")} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[9px] text-gray-400">{filled}/{total} champs</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
