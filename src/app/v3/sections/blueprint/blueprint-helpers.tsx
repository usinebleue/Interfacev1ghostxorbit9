/** blueprint-helpers.tsx — Shared helpers for Blueprint V3 components. Extracted from BlueprintDepartement.tsx */

import React from "react";
import {
  Building2, Target, Layers, Rocket, DollarSign, Shield, Compass,
  TrendingUp, ListChecks, Settings, Flame, FileText, BookOpen, Sparkles,
  Heart,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { cn } from "../../../components/ui/utils";
import type { Pertinence, FieldDef, KPIDef } from "../../../v2/zones/center/blueprint/blueprint-config";

// ── Icon resolver ──
export const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Target, Layers, Rocket, DollarSign, Shield, Compass,
  TrendingUp, ListChecks, Settings, Flame, FileText, BookOpen, Sparkles,
};
export function resolveIcon(name: string): React.ElementType {
  return ICON_MAP[name] || Layers;
}

// ── Pertinence badge ──
export const PERTINENCE_STYLE: Record<Pertinence, { label: string; bg: string; text: string }> = {
  C: { label: "Critique", bg: "bg-red-50", text: "text-red-700" },
  I: { label: "Important", bg: "bg-amber-50", text: "text-amber-700" },
  O: { label: "Optionnel", bg: "bg-blue-50", text: "text-blue-600" },
  H: { label: "Cache", bg: "bg-gray-50", text: "text-gray-400" },
  R: { label: "Reglementaire", bg: "bg-purple-50", text: "text-purple-700" },
};

export function PertinenceBadge({ p }: { p: Pertinence }) {
  const s = PERTINENCE_STYLE[p];
  return <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", s.bg, s.text)}>{s.label}</span>;
}

// ── Score bar ──
export function ScoreBar({ value, seuils }: { value: number; seuils: { vert: number; jaune: number; rouge: number } }) {
  const color = value >= seuils.vert ? "bg-emerald-500" : value >= seuils.jaune ? "bg-amber-400" : "bg-red-500";
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Field renderer ──
export function BlueprintField({ field, value, onChange }: {
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
        <option value="">— Selectionner —</option>
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

// ── Champ "wide" = textarea, list, json -> full width. Sinon = colonne ──
export function isWideField(f: FieldDef): boolean {
  return f.type === "textarea" || f.type === "list" || f.type === "json";
}

// ── KPI Card ──
export function KPIDisplay({ kpi, value }: { kpi: KPIDef; value?: number }) {
  const displayValue = value ?? 0;
  const color = displayValue >= kpi.seuils.vert ? "text-emerald-600" : displayValue >= kpi.seuils.jaune ? "text-amber-600" : "text-red-600";
  return (
    <Card className="p-0 gap-0 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-[#00B4D8]/10">
        <TrendingUp className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
        <span className="text-xs font-bold text-gray-900">{kpi.label}</span>
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

// ── VITAA Table ──
// NOTE: VitaaTable is a data-display table, NOT a clickable card — no hover states needed
export function VitaaTable({ data, title }: { data: { letter: string; label: string; score: number; avg: number; color: string }[]; title: string }) {
  const tableContainerClass = [
    "rounded-xl border",
    "border-gray-200",
    "shadow-sm",
    "bg-white",
  ].join(" ");
  return (
    <div className={tableContainerClass}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
        <Heart className="h-4 w-4 text-gray-900 stroke-[2.5]" />
        <span className="text-sm font-bold text-gray-900 flex-1">{title}</span>
        <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Secteur</span>
        <span className="flex items-center gap-1 text-[9px] text-gray-400 ml-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Toi</span>
      </div>
      <div className="p-2.5 space-y-2">
        {data.map((p) => (
          <div key={p.letter + p.label} className="rounded-lg px-1 -mx-1">
            <div className="flex items-center gap-2 mb-0.5">
              <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0", p.color)}>{p.letter[0]}</div>
              <span className="text-xs font-medium text-gray-800 flex-1">{p.label}</span>
              <span className={cn("text-xs font-bold", p.score >= p.avg ? "text-green-600" : "text-red-600")}>{p.score}</span>
              <span className="text-[9px] text-gray-400 w-8">/ {p.avg}</span>
              <span className={cn("text-[8px] px-1 py-0.5 rounded border font-medium",
                p.score < 35 ? "text-red-600 bg-red-50 border-red-200" :
                p.score < 50 ? "text-amber-600 bg-amber-50 border-amber-200" :
                "text-green-600 bg-green-50 border-green-200"
              )}>{p.score < 35 ? "critique" : p.score < 50 ? "risque" : "sain"}</span>
            </div>
            <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden ml-7">
              <div className="h-full rounded-full bg-gray-200/80 absolute" style={{ width: `${p.avg}%` }} />
              <div className={cn("h-full rounded-full absolute", p.color)} style={{ width: `${p.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
