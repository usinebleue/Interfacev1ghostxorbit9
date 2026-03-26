/**
 * BlueprintDepartement.tsx — Composant générique Blueprint Vivant par département
 * Rend dynamiquement les sous-sections Blueprint selon la taille de l'entreprise et la phase.
 * Source: blueprint-config.ts (12 départements × ~97 sous-sections)
 *
 * Utilisé dans DepartmentTourDeControle.tsx pour le tab "Blueprint" de TOUS les bots.
 * CEOB = le plus complet (11 sections + Vue consolidée des 11 autres départements)
 */

import { useState, useEffect, useCallback } from "react";
import {
  Building2, Target, Layers, Rocket, DollarSign, Shield, Compass,
  TrendingUp, ListChecks, Settings, Flame, Save, Loader2,
  CheckCircle2, AlertTriangle, Info, FileText, BookOpen,
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
import { getTemplatesForSection } from "./blueprint-templates";
import { getPlaybooksForSection } from "./blueprint-playbooks";

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

// ── Champ "wide" = textarea, list, json → full width. Sinon = colonne ──
function isWideField(f: FieldDef): boolean {
  return f.type === "textarea" || f.type === "list" || f.type === "json";
}

// ── KPI Card (même pattern CockpitView) ──
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

// ── Sub-section content — 2 colonnes pour champs courts ──
function SubSectionContent({ section, tier, botCode, data, onFieldChange, onSave, saving, dirty }: {
  section: SubSectionDef;
  tier: SizeTier;
  botCode: string;
  data: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
}) {
  const fields = getFieldsForTier(section.fields, tier);
  const hasKpis = section.kpis.length > 0;
  const templates = getTemplatesForSection(botCode, section.id);
  const playbooks = getPlaybooksForSection(botCode, section.id);

  // Séparer champs en wide (full) et narrow (2 cols)
  const wideFields = fields.filter(isWideField);
  const narrowFields = fields.filter(f => !isWideField(f));

  return (
    <div className="space-y-4">
      {/* Champs courts en 2 colonnes */}
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

      {/* Champs larges (textarea, list, json) en full width */}
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

      {/* KPIs */}
      {hasKpis && (
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Indicateurs clés</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {section.kpis.map(kpi => (
              <KPIDisplay key={kpi.id} kpi={kpi} />
            ))}
          </div>
        </div>
      )}

      {/* Templates + Playbooks — côte à côte */}
      {(templates.length > 0 || playbooks.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {templates.length > 0 && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileText className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Templates ({templates.length})</span>
              </div>
              <div className="space-y-1">
                {templates.slice(0, 4).map(t => (
                  <div key={t.id} className="text-[9px] text-blue-700 truncate">{t.name}</div>
                ))}
                {templates.length > 4 && <div className="text-[9px] text-blue-400">+{templates.length - 4} autres</div>}
              </div>
            </div>
          )}
          {playbooks.length > 0 && (
            <div className="bg-violet-50/50 border border-violet-100 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <BookOpen className="h-3.5 w-3.5 text-violet-500" />
                <span className="text-[9px] font-bold text-violet-600 uppercase tracking-wider">Playbooks ({playbooks.length})</span>
              </div>
              <div className="space-y-1">
                {playbooks.slice(0, 4).map(p => (
                  <div key={p.id} className="text-[9px] text-violet-700 truncate">{p.name}</div>
                ))}
                {playbooks.length > 4 && <div className="text-[9px] text-violet-400">+{playbooks.length - 4} autres</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {fields.length === 0 && !hasKpis && templates.length === 0 && playbooks.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-6">Cette section sera alimentée automatiquement par les diagnostics et les documents créés.</p>
      )}

      {/* ═══ Bouton Sauvegarder en bas ═══ */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-[9px] text-gray-400">{dirty ? "Modifications non sauvegardées" : "À jour"}</span>
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
    </div>
  );
}

// ── Vue consolidée 11 départements — CEOB uniquement ──
const OTHER_BOTS: { code: string; label: string; bot: string; short: string; gradient: string }[] = [
  { code: "CTOB", label: "Technologie", bot: "Tim", short: "CTO", gradient: "from-violet-600 to-violet-500" },
  { code: "CFOB", label: "Finance", bot: "Frank", short: "CFO", gradient: "from-emerald-600 to-emerald-500" },
  { code: "CMOB", label: "Marketing", bot: "Mathilde", short: "CMO", gradient: "from-pink-600 to-pink-500" },
  { code: "CSOB", label: "Stratégie", bot: "Simone", short: "CSO", gradient: "from-red-600 to-red-500" },
  { code: "COOB", label: "Opérations", bot: "Olivier", short: "COO", gradient: "from-orange-600 to-orange-500" },
  { code: "CPOB", label: "Production", bot: "Paco", short: "CPO", gradient: "from-amber-600 to-amber-500" },
  { code: "CHROB", label: "RH", bot: "Hélène", short: "CHRO", gradient: "from-teal-600 to-teal-500" },
  { code: "CINOB", label: "Innovation", bot: "Inès", short: "CINO", gradient: "from-rose-600 to-rose-500" },
  { code: "CROB", label: "Ventes", bot: "Rich", short: "CRO", gradient: "from-amber-600 to-amber-500" },
  { code: "CLOB", label: "Légal", bot: "Loulou", short: "CLO", gradient: "from-indigo-600 to-indigo-500" },
  { code: "CISOB", label: "Sécurité", bot: "Sébastien", short: "CISO", gradient: "from-gray-600 to-gray-500" },
];

interface DeptScore { code: string; score: number; sections: number; gaps: number; gapLabels: string[] }

function VueConsolidee({ tier }: { tier: SizeTier }) {
  const [scores, setScores] = useState<DeptScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const results: DeptScore[] = [];
      for (const bot of OTHER_BOTS) {
        const cfg = getBlueprintConfig(bot.code);
        if (!cfg) continue;
        let score = 0;
        let gaps = 0;
        const gapLabels: string[] = [];
        try {
          const res = await api.getOrCreateCanvas(`blueprint_${bot.code}`);
          const d = (res.data && typeof res.data === "object") ? res.data as Record<string, unknown> : {};
          score = calculateCompletionScore(cfg, tier, d);
          for (const s of getVisibleSubSections(cfg, tier)) {
            const p = s.pertinence[tier];
            if (p === "C" || p === "R") {
              const fields = getFieldsForTier(s.fields, tier);
              const filled = fields.filter(f => { const v = d[`${s.id}.${f.id}`]; return v !== undefined && v !== "" && v !== "[]"; }).length;
              if (filled === 0 && fields.length > 0) { gaps++; gapLabels.push(s.label); }
            }
          }
        } catch { /* empty */ }
        results.push({ code: bot.code, score, sections: getVisibleSubSections(cfg, tier).length, gaps, gapLabels });
      }
      setScores(results);
      setLoading(false);
    })();
  }, [tier]);

  if (loading) return <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  const avg = scores.length > 0 ? Math.round(scores.reduce((s, d) => s + d.score, 0) / scores.length) : 0;
  const totalGaps = scores.reduce((s, d) => s + d.gaps, 0);
  const sorted = [...scores].sort((a, b) => b.gaps - a.gaps || a.score - b.score);

  return (
    <div className="space-y-3">
      {/* 3 KPIs consolidés */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
            <Layers className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Score moyen</span>
          </div>
          <div className="px-3 py-2">
            <div className={cn("text-2xl font-bold", avg >= 70 ? "text-emerald-600" : avg >= 40 ? "text-amber-600" : "text-red-600")}>{avg}%</div>
            <div className="text-[9px] text-gray-400">11 départements</div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-600 to-red-500">
            <AlertTriangle className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Gaps critiques</span>
          </div>
          <div className="px-3 py-2">
            <div className={cn("text-2xl font-bold", totalGaps === 0 ? "text-emerald-600" : "text-red-600")}>{totalGaps}</div>
            <div className="text-[9px] text-gray-400">Sections obligatoires vides</div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
            <CheckCircle2 className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Couverture</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-emerald-600">{scores.filter(d => d.score >= 50).length}/11</div>
            <div className="text-[9px] text-gray-400">Au-dessus de 50%</div>
          </div>
        </Card>
      </div>

      {/* 11 départements — cards compactes 2×6 */}
      <div className="grid grid-cols-2 gap-2">
        {sorted.map(dept => {
          const info = OTHER_BOTS.find(b => b.code === dept.code)!;
          return (
            <Card key={dept.code} className={cn("p-0 overflow-hidden rounded-xl shadow-sm", dept.gaps > 0 ? "ring-1 ring-red-200" : "")}>
              <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", info.gradient)}>
                <span className="text-xs font-bold text-white flex-1">{info.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 text-white">{info.bot}</span>
                <span className="text-xs font-bold bg-white/25 text-white px-2 py-0.5 rounded-full">{dept.score}%</span>
              </div>
              <div className="px-3 py-2 space-y-1.5">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", dept.score >= 70 ? "bg-emerald-500" : dept.score >= 40 ? "bg-amber-400" : "bg-red-500")} style={{ width: `${dept.score}%` }} />
                </div>
                {dept.gaps > 0 ? (
                  <div className="text-[9px] text-red-500 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{dept.gaps} gap{dept.gaps > 1 ? "s" : ""}: {dept.gapLabels.slice(0, 2).join(", ")}</span>
                  </div>
                ) : (
                  <div className="text-[9px] text-emerald-500 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Aucun gap critique
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════

interface BlueprintDepartementProps {
  botCode: string;
  headerGradient: string;
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

  useEffect(() => {
    if (!config) return;
    if (!propTier) {
      api.getEntrepriseProfil().then(res => {
        if (res.profil?.nb_employes) setTier(getSizeTier(res.profil.nb_employes));
      }).catch(() => {});
    }
    api.getOrCreateCanvas(`blueprint_${botCode}`).then(res => {
      if (res.data && typeof res.data === "object") {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(res.data)) flat[k] = typeof v === "string" ? v : JSON.stringify(v);
        setData(flat);
      }
    }).catch(() => {}).finally(() => setLoading(false));
    const visible = getVisibleSubSections(config, propTier || "T2");
    if (visible.length > 0 && !activeSub) setActiveSub(visible[0].id);
  }, [botCode, config, propTier]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!config) return;
    const visible = getVisibleSubSections(config, tier);
    if (visible.length > 0 && !visible.find(s => s.id === activeSub)) setActiveSub(visible[0].id);
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
    } catch { /* retry later */ } finally { setSaving(false); }
  };

  if (!config) return <p className="text-xs text-gray-400 text-center py-8">Configuration Blueprint non disponible pour {botCode}</p>;

  const visibleSections = getVisibleSubSections(config, tier);
  const activeSection = visibleSections.find(s => s.id === activeSub) || visibleSections[0];
  const completionScore = calculateCompletionScore(config, tier, data as Record<string, unknown>);

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-3">
      {/* ═══ HEADER — Gradient + titre + score ═══ */}
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
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{completionScore}%</div>
            <div className="text-[9px] text-white/60">Complétion</div>
          </div>
        </div>
        {/* Phase + Taille selectors */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Phase:</span>
            {PHASES.map(p => (
              <button key={p.id} onClick={() => setPhase(p.id)}
                className={cn("px-2.5 py-1 rounded-lg text-[9px] font-medium transition-all cursor-pointer",
                  phase === p.id ? "bg-white/25 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/10")}>
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Taille:</span>
            {SIZE_TIERS.map(t => (
              <button key={t.id} onClick={() => setTier(t.id)}
                className={cn("px-2.5 py-1 rounded-lg text-[9px] font-medium transition-all cursor-pointer",
                  tier === t.id ? "bg-white/25 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/10")}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ INTRO DÉPARTEMENT — Contexte DeepSearch ═══ */}
      {config.intro && (
        <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 border border-blue-100/50 rounded-xl px-4 py-3">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600 leading-relaxed">{config.intro}</p>
          </div>
        </div>
      )}

      {/* ═══ NAVIGATION — Boxes compactes 4 colonnes ═══ */}
      <div className="grid grid-cols-4 gap-1.5">
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
          const isActive = activeSub === section.id;

          return (
            <button key={section.id} onClick={() => setActiveSub(section.id)}
              className={cn(
                "px-2 py-1.5 rounded-lg border text-left transition-all cursor-pointer",
                isActive ? "border-blue-300 bg-blue-50/50 shadow-sm" : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
              )}>
              <div className="flex items-center gap-1 mb-0.5">
                <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className={cn("text-[9px] font-bold truncate flex-1", isActive ? "text-blue-700" : "text-gray-700")}>{section.label}</span>
              </div>
              {total > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", pct === 100 ? "bg-emerald-500" : pct > 0 ? "bg-blue-500" : "bg-gray-200")} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[9px] text-gray-400 shrink-0">{pct}%</span>
                </div>
              )}
              {total === 0 && (
                <PertinenceBadge p={p} />
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ CONTENU — Section active ═══ */}
      {activeSection && activeSection.id === "vue_consolidee" && botCode === "CEOB" ? (
        <VueConsolidee tier={tier} />
      ) : activeSection && (
        <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
          {/* Section header gradient */}
          <div className={cn("flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r", headerGradient)}>
            {(() => { const Icon = resolveIcon(activeSection.icon); return <Icon className="h-4 w-4 text-white" />; })()}
            <span className="text-sm font-bold text-white flex-1">{activeSection.label}</span>
            <PertinenceBadge p={activeSection.pertinence[tier]} />
          </div>
          {/* Description + Intro contextuel */}
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 space-y-1.5">
            <p className="text-xs text-gray-500">{activeSection.description}</p>
            {activeSection.intro && (
              <p className="text-[11px] text-gray-400 leading-relaxed italic">{activeSection.intro}</p>
            )}
          </div>
          {/* Content — 2 colonnes pour champs, playbooks, save */}
          <div className="p-4">
            <SubSectionContent
              section={activeSection}
              tier={tier}
              botCode={botCode}
              data={data}
              onFieldChange={handleFieldChange}
              onSave={handleSave}
              saving={saving}
              dirty={dirty}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
