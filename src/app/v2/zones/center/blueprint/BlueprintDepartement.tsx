/**
 * BlueprintDepartement.tsx — Sections departement (pattern SectionView)
 *
 * NOMS OFFICIELS (Session 84 — rename definitif):
 *   CockpitView        — Tableau de bord (hero + KPI + sidebar TOC)
 *   BlueprintView       — Plan de match departement (hero + DocForge sidebar + champs editables)
 *   DataRoomView        — Documents & Fichiers (hero + sidebar TOC + toolbar + contenu)
 *   PlaybookStoreView   — Automatisations / Playbooks (hero + sidebar TOC + toolbar + multi-view)
 *   ConferenceAIView    — Reunions intelligentes (hero + sidebar TOC + toolbar + contenu)
 *
 * PATTERN COMMUN "SectionView":
 *   LivingHero (banner anime) → Top 3 vedettes → Sidebar TOC w-[180px] + Content flex-1
 *   → Toolbar (search + filters + sort + viewMode) → Contenu multi-view (cards/list/table)
 *
 * Constantes partagees: SF.* (styles), LivingHero (composant hero), injectHeroStyles()
 * Aliases backward-compat exportes en fin de fichier.
 */

import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import {
  Home, Building2, Target, Layers, Rocket, DollarSign, Shield, Compass,
  TrendingUp, TrendingDown, ListChecks, Settings, Flame, Save, Loader2,
  CheckCircle2, AlertTriangle, Info, FileText, BookOpen, Heart,
  ChevronRight, ChevronLeft, Sparkles, Link2, Users, User, Briefcase, Plus, Trash2, UserPlus, PenLine,
  Bot, Cpu, Zap, Activity, BarChart3, Star, MessageCircle,
  Database, Search, GitBranch, ShoppingBag,
  LayoutList, LayoutGrid, Table2, FolderOpen, Filter,
  Package, Calendar, Clock, Lock, Bug, Headphones, Palette, MessageSquare,
  ChevronDown, ArrowUp, ArrowDown, ArrowUpDown, Upload,
  Crown, Eye, Factory, Wrench, Bookmark, Pause, Play, Share2, RotateCcw, ExternalLink, Brain, Hammer,
  Megaphone, Scale, ShieldCheck, Lightbulb, Gauge, Globe, Handshake, Banknote,
  Receipt, Wallet, PieChart, GraduationCap, HardHat, ClipboardCheck, Truck, Award,
  Newspaper, Network, Phone, Gavel, FileLock, Cog, Atom,
  Stethoscope, Repeat, Video, MapPin, CheckSquare,
  Landmark, ClipboardList, Bell, ShieldAlert, Route, Trophy,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { useChantiers, useProjets, useMissions, useTachesUser } from "../../../api/hooks";
import { BOT_AVATAR, BOT_NAME } from "../../../api/types";
import { BLUEPRINT_TEMPLATES, getTemplatesForBot, type BlueprintTemplate } from "./blueprint-templates";
import { useCanvasActions } from "../../../context/CanvasActionContext";
import { PageLayout } from "../layouts/PageLayout";
import {
  getBlueprintConfig,
  getSizeTier,
  getVisibleSubSections,
  getFieldsForTier,
  calculateCompletionScore,
  getCrossReferences,
  type SizeTier,
  type Phase,
  type SubSectionDef,
  type FieldDef,
  type KPIDef,
  type DeptBlueprintConfig,
  type Pertinence,
  type CrossRef,
  SIZE_TIERS,
  PHASES,
} from "./blueprint-config";

// ═══ LIVING HEROES V20 — CSS Animations (injected once) ═══
const LIVING_HEROES_STYLES = `
.bg-pattern-grid { background-image: radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px); background-size: 24px 24px; }
.glass-base { background: rgba(255,255,255,0.65); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 10px 40px rgba(0,0,0,0.06); border-radius: 16px; }
.glass-intense { background: rgba(255,255,255,0.2); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.6); box-shadow: inset 0 0 20px rgba(255,255,255,0.5); }
/* COCKPIT */
@keyframes radar-scan { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes bar-grow { 0%, 100% { height: var(--min-h); opacity: 0.8; } 50% { height: var(--max-h); opacity: 1; } }
@keyframes draw-curve { 0%, 100% { stroke-dashoffset: 150; } 50% { stroke-dashoffset: 0; } }
.anim-radar { animation: radar-scan 12s linear infinite; transform-origin: center; }
.anim-bar-1 { animation: bar-grow 8s ease-in-out infinite; --min-h: 30%; --max-h: 50%; }
.anim-bar-2 { animation: bar-grow 10s ease-in-out infinite 2s; --min-h: 40%; --max-h: 75%; }
.anim-bar-3 { animation: bar-grow 9s ease-in-out infinite 1s; --min-h: 60%; --max-h: 100%; }
.anim-curve { stroke-dasharray: 150; animation: draw-curve 10s ease-in-out infinite; }
/* CONFERENCE AI */
@keyframes packet-travel { 0% { offset-distance: 0%; opacity: 0; transform: scale(0.8); } 20% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 15px currentColor; } 80% { opacity: 1; transform: scale(1.2); } 100% { offset-distance: 100%; opacity: 0; transform: scale(0.8); } }
.anim-packet-1 { offset-path: path('M 60 75 L 140 25'); animation: packet-travel 7s ease-in-out infinite; }
.anim-packet-2 { offset-path: path('M 140 25 L 220 75'); animation: packet-travel 8s ease-in-out infinite 3s; }
.anim-packet-3 { offset-path: path('M 220 75 L 140 125'); animation: packet-travel 6.5s ease-in-out infinite 1.5s; }
.anim-packet-4 { offset-path: path('M 140 125 L 60 75'); animation: packet-travel 7.5s ease-in-out infinite 4s; }
@keyframes wave-pulse { 0%, 100% { transform: scaleY(0.7); opacity: 0.6; } 50% { transform: scaleY(1.3); opacity: 1; } }
/* BLUEPRINT */
.org-node { background: rgba(255,255,255,0.8); border: 2px solid rgba(255,255,255,0); border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.02); transition: all 0.5s ease; }
@keyframes org-pulse-root { 0%, 100% { border-color: rgba(99,102,241,0.2); box-shadow: none; } 10%, 30% { border-color: rgba(99,102,241,1); box-shadow: 0 0 15px rgba(99,102,241,0.5); } }
@keyframes org-pulse-child { 0%, 100% { border-color: rgba(56,189,248,0.2); box-shadow: none; } 10%, 30% { border-color: rgba(56,189,248,1); box-shadow: 0 0 15px rgba(56,189,248,0.5); } }
@keyframes flow-down { 0% { height: 0%; opacity: 0; } 10% { height: 0%; opacity: 1; } 40% { height: 100%; opacity: 1; } 50%, 100% { height: 100%; opacity: 0; } }
@keyframes flow-across { 0% { width: 0%; opacity: 0; } 10% { width: 0%; opacity: 1; } 40% { width: 100%; opacity: 1; } 50%, 100% { width: 100%; opacity: 0; } }
.anim-org-root { animation: org-pulse-root 6s infinite 0s; }
.anim-org-line-vert { animation: flow-down 6s infinite 1.5s; }
.anim-org-line-hor { animation: flow-across 6s infinite 2.5s; }
.anim-org-child-1 { animation: org-pulse-child 6s infinite 3.5s; }
.anim-org-child-2 { animation: org-pulse-child 6s infinite 3.8s; }
.anim-org-child-3 { animation: org-pulse-child 6s infinite 4.1s; }
/* DATA ROOM */
@keyframes laser-scan { 0%, 100% { top: 5%; opacity: 0; } 10%, 90% { opacity: 1; } 50% { top: 95%; } }
.anim-laser { animation: laser-scan 8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
@keyframes binary-fade { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.7; } }
.anim-binary { animation: binary-fade 3s ease-in-out infinite; }
@keyframes vault-lock-outer { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes vault-lock-inner { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
.anim-vault-out { animation: vault-lock-outer 40s linear infinite; }
.anim-vault-in { animation: vault-lock-inner 30s linear infinite; }
/* PLAYBOOK STORE */
.pb-node { background: rgba(255,255,255,0.8); border: 2px solid rgba(34,211,238,0.2); border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.02); transition: all 0.5s ease; }
@keyframes trigger-node { 0%, 100% { border-color: rgba(34,211,238,0.2); box-shadow: none; filter: brightness(1); } 10%, 20% { border-color: rgba(34,211,238,1); box-shadow: 0 0 15px rgba(34,211,238,0.5); filter: brightness(1.1); } }
@keyframes trigger-pulse { 0%, 5%, 35%, 100% { opacity: 0; transform: scale(0.5); } 10%, 25% { opacity: 1; transform: scale(1.5); } }
@keyframes flow-line { 0% { width: 0%; opacity: 0; } 10% { width: 0%; opacity: 1; } 40% { width: 100%; opacity: 1; } 50%, 100% { width: 100%; opacity: 0; } }
.anim-p-node-1 { animation: trigger-node 8s infinite 0s; }
.anim-p-line-1 { animation: flow-line 8s infinite 1s; }
.anim-p-pulse-1 { animation: trigger-pulse 8s infinite 0.8s; }
.anim-p-node-2 { animation: trigger-node 8s infinite 3s; }
.anim-p-line-2 { animation: flow-line 8s infinite 4s; }
.anim-p-pulse-2 { animation: trigger-pulse 8s infinite 3.8s; }
.anim-p-node-3 { border-color: rgba(59,130,246,0.3); }
.anim-p-node-3-activate { animation: trigger-node 8s infinite 6s; }
/* CHANTIERS */
@keyframes block-rise { 0%, 100% { height: 10px; opacity: 0.5; } 50% { height: var(--h); opacity: 1; } }
.anim-block-1 { animation: block-rise 8s cubic-bezier(0.4, 0, 0.2, 1) infinite; --h: 40px; }
.anim-block-2 { animation: block-rise 9s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.5s; --h: 70px; }
.anim-block-3 { animation: block-rise 7s cubic-bezier(0.4, 0, 0.2, 1) infinite 3s; --h: 50px; }
@keyframes progress-slide { 0%, 100% { width: 10%; } 50% { width: 90%; } }
.anim-progress { animation: progress-slide 10s ease-in-out infinite; }
/* AGENDA */
@keyframes clock-spin { 100% { transform: rotate(360deg); } }
.anim-clock-outer { animation: clock-spin 40s linear infinite; }
.anim-clock-inner { animation: clock-spin 25s linear infinite reverse; }
@keyframes ticker-slide { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(180px); } }
.anim-ticker { animation: ticker-slide 15s ease-in-out infinite; }
/* ORBIT9 STELLAR */
@keyframes celestial-spin { 100% { transform: rotate(360deg); } }
@keyframes celestial-spin-rev { 100% { transform: rotate(-360deg); } }
.anim-orb-1 { animation: celestial-spin 35s linear infinite; transform-origin: 100px 100px; }
.anim-orb-2 { animation: celestial-spin-rev 50s linear infinite; transform-origin: 100px 100px; }
.anim-orb-3 { animation: celestial-spin 65s linear infinite; transform-origin: 100px 100px; }
@keyframes dot-alive { 0%, 100% { filter: drop-shadow(0 0 5px currentColor); } 50% { filter: drop-shadow(0 0 20px currentColor); } }
.anim-dot { animation: dot-alive 4s ease-in-out infinite; }
`;
let heroStylesInjected = false;
function injectHeroStyles() {
  if (heroStylesInjected) return;
  heroStylesInjected = true;
  const s = document.createElement("style");
  s.textContent = LIVING_HEROES_STYLES;
  document.head.appendChild(s);
}

// ═══ LIVING HERO WRAPPER — V20 Carl's exact layout ═══
export function LivingHero({ blur1, blur2, subtitleColor, subtitle, title, description, scaleClass, children }: {
  blur1: string;
  blur2: string;
  subtitleColor: string;
  subtitle: string;
  title: string;
  description: string;
  scaleClass?: string;
  children?: React.ReactNode;
}) {
  useEffect(() => { injectHeroStyles(); }, []);
  return (
    <div className="relative w-full rounded-xl bg-white border border-gray-200 shadow-sm py-5 px-8 overflow-hidden min-h-[110px] flex items-center">
      <div className={cn("absolute rounded-full blur-[100px] opacity-60", blur1)} style={{ top: '-50%', left: '-10%', width: '50%', height: '200%' }} />
      <div className={cn("absolute rounded-full blur-[120px] opacity-50", blur2)} style={{ bottom: '-50%', right: '10%', width: '60%', height: '200%' }} />
      <div className="absolute inset-0 bg-pattern-grid opacity-[0.35]" />
      {/* Illustration */}
      <div className={cn("absolute top-0 bottom-0 flex items-center transform origin-right pointer-events-none", scaleClass === "scale-[0.80]" ? "right-0 scale-[0.80]" : "right-[1rem] scale-[0.70]")}>
        {children}
      </div>
      {/* Text */}
      <div className="relative z-20 w-full pr-[250px]">
        <p className={cn("uppercase tracking-widest text-[9px] font-bold mb-1", subtitleColor)}>{subtitle}</p>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">{title}</h2>
        <p className="text-slate-500 text-[12.5px] font-medium leading-snug">{description}</p>
      </div>
    </div>
  );
}
export { injectHeroStyles };

// ═══ SECTION FRAME STANDARDS ═══
const SF = {
  sidebarW: "w-[180px] shrink-0 space-y-0.5",
  btnBase: "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer flex items-center gap-2",
  btnActive: "bg-blue-50 border border-blue-200 shadow-sm",
  btnInactive: "hover:bg-gray-50 border border-transparent",
  iconActive: "h-3.5 w-3.5 shrink-0 text-blue-500",
  iconInactive: "h-3.5 w-3.5 shrink-0 text-gray-400",
  labelActive: "text-[10px] font-bold flex-1 leading-tight text-blue-700",
  labelInactive: "text-[10px] font-bold flex-1 leading-tight text-gray-700",
  count: "text-[9px] text-gray-400",
  separator: "h-px bg-gray-100 mx-2 my-1.5",
  sectionLabel: "text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2.5 py-1",
  subBase: "w-full pl-6 pr-2.5 py-1 rounded-lg text-left text-[9px] cursor-pointer",
  subActive: "bg-blue-50 text-blue-700 font-bold",
  subInactive: "text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-medium",
  subIcon: "h-3.5 w-3.5 shrink-0",
  chevron: "h-3.5 w-3.5 text-gray-400 shrink-0 transition-transform",
  toolbarWrap: "flex items-center gap-2 flex-wrap",
  searchWrap: "flex-1 min-w-[180px] relative",
  searchIcon: "h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none",
  searchInput: "w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white",
  select: "text-[9px] border border-gray-200 rounded-lg px-2 py-1.5 bg-white",
  itemCount: "text-[9px] font-bold text-gray-500 whitespace-nowrap",
  content: "flex-1 min-w-0 space-y-3",
  gridContent: "grid grid-cols-2 gap-3",
} as const;

// ── Icon resolver ──
const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Target, Layers, Rocket, DollarSign, Shield, Compass,
  TrendingUp, ListChecks, Settings, Flame, FileText, BookOpen, Sparkles,
};
export function resolveIcon(name: string): React.ElementType {
  return ICON_MAP[name] || Layers;
}

// ── Pertinence badge ──
const PERTINENCE_STYLE: Record<Pertinence, { label: string; bg: string; text: string }> = {
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
function isWideField(f: FieldDef): boolean {
  return f.type === "textarea" || f.type === "list" || f.type === "json";
}

// ── KPI Card ──
function KPIDisplay({ kpi, value }: { kpi: KPIDef; value?: number }) {
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

// ── Sub-section content — champs + KPIs ──
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

// ── Panel Donnees Liees — Cross-Reference entre departements ──

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
export const DEPT_SHORT_LABEL: Record<string, string> = {
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

// ── Vue d'ensemble 11 departements — CEOB uniquement ──
const OTHER_BOTS: { code: string; label: string; bot: string; short: string; gradient: string }[] = [
  { code: "CTOB", label: "Technologie", bot: "Tim", short: "CTO", gradient: "from-violet-600 to-violet-500" },
  { code: "CFOB", label: "Finance", bot: "Frank", short: "CFO", gradient: "from-emerald-600 to-emerald-500" },
  { code: "CMOB", label: "Marketing", bot: "Mathilde", short: "CMO", gradient: "from-pink-600 to-pink-500" },
  { code: "CSOB", label: "Strategie", bot: "Simone", short: "CSO", gradient: "from-red-600 to-red-500" },
  { code: "COOB", label: "Operations", bot: "Olivier", short: "COO", gradient: "from-orange-600 to-orange-500" },
  { code: "CPOB", label: "Production", bot: "Paco", short: "CPO", gradient: "from-amber-600 to-amber-500" },
  { code: "CHROB", label: "RH", bot: "Helene", short: "CHRO", gradient: "from-teal-600 to-teal-500" },
  { code: "CINOB", label: "Innovation", bot: "Ines", short: "CINO", gradient: "from-rose-600 to-rose-500" },
  { code: "CROB", label: "Ventes", bot: "Rich", short: "CRO", gradient: "from-amber-600 to-amber-500" },
  { code: "CLOB", label: "Legal", bot: "Loulou", short: "CLO", gradient: "from-indigo-600 to-indigo-500" },
  { code: "CISOB", label: "Securite", bot: "Sebastien", short: "CISO", gradient: "from-gray-600 to-gray-500" },
];

// Champs-clés par département — données les plus pertinentes pour la vue consolidée Direction
const DEPT_KEY_FIELDS: Record<string, { sectionId: string; fieldId: string; label: string }[]> = {
  CTOB: [
    { sectionId: "stack_technique", fieldId: "cloud_provider", label: "Cloud" },
    { sectionId: "infrastructure", fieldId: "cout_mensuel", label: "Coût infra/mois" },
    { sectionId: "dette_technique", fieldId: "score_dette", label: "Dette technique" },
  ],
  CFOB: [
    { sectionId: "modele_revenus", fieldId: "chiffre_affaires_estime", label: "CA estimé" },
    { sectionId: "tresorerie", fieldId: "solde_bancaire", label: "Solde bancaire" },
    { sectionId: "tresorerie", fieldId: "burn_rate", label: "Burn rate" },
  ],
  CMOB: [
    { sectionId: "personas_icp", fieldId: "icp_principal", label: "ICP principal" },
    { sectionId: "positionnement", fieldId: "uvp", label: "UVP" },
    { sectionId: "canaux_budget", fieldId: "budget_marketing", label: "Budget marketing" },
  ],
  CSOB: [
    { sectionId: "marche", fieldId: "tam", label: "TAM" },
    { sectionId: "concurrence", fieldId: "top_3_concurrents", label: "Top 3 concurrents" },
    { sectionId: "avantage_concurrentiel", fieldId: "differenciateur_cle", label: "Différenciateur" },
  ],
  COOB: [
    { sectionId: "processus", fieldId: "processus_livraison", label: "Processus livraison" },
    { sectionId: "capacite_planification", fieldId: "taux_utilisation_capacite", label: "Utilisation capacité" },
    { sectionId: "supply_chain", fieldId: "fournisseurs_cles", label: "Fournisseurs clés" },
  ],
  CPOB: [
    { sectionId: "planification_production", fieldId: "capacite_journaliere", label: "Capacité/jour" },
    { sectionId: "gestion_stocks", fieldId: "valeur_inventaire", label: "Inventaire" },
    { sectionId: "qualite", fieldId: "systeme_qualite", label: "Système qualité" },
  ],
  CHROB: [
    { sectionId: "organigramme", fieldId: "nb_employes_total", label: "Employés" },
    { sectionId: "recrutement", fieldId: "postes_ouverts", label: "Postes ouverts" },
    { sectionId: "remuneration", fieldId: "avantages_sociaux", label: "Avantages sociaux" },
  ],
  CINOB: [
    { sectionId: "pipeline_innovation", fieldId: "projets_actifs", label: "Projets R&D" },
    { sectionId: "propriete_intellectuelle", fieldId: "marques_commerce", label: "Marques" },
    { sectionId: "propriete_intellectuelle", fieldId: "brevets", label: "Brevets" },
  ],
  CROB: [
    { sectionId: "pipeline_funnel", fieldId: "valeur_pipeline", label: "Pipeline ($)" },
    { sectionId: "pipeline_funnel", fieldId: "nb_opportunites", label: "Opportunités" },
    { sectionId: "methodologie_vente", fieldId: "crm_integre_facturation", label: "CRM intégré" },
  ],
  CLOB: [
    { sectionId: "structure_corporative", fieldId: "type_entite", label: "Type entité" },
    { sectionId: "contrats", fieldId: "registre_centralise_clm", label: "CLM" },
    { sectionId: "pi_marques", fieldId: "marques_commerce_deposees", label: "Marques déposées" },
  ],
  CISOB: [
    { sectionId: "politiques_iam", fieldId: "mfa_active", label: "MFA" },
    { sectionId: "vulnerabilites", fieldId: "dernier_pentest", label: "Dernier pentest" },
    { sectionId: "sauvegardes", fieldId: "strategie_backup", label: "Backup" },
  ],
};

interface KeyFieldValue { label: string; value: string }
interface DeptScore { code: string; score: number; sections: number; gaps: number; gapLabels: string[]; keyFields: KeyFieldValue[] }

// ── Blueprint Personnel — Profil riche du dirigeant humain ──

// ── Blueprint Personnel — Sections avec vrais FieldDef qui persistent via canvas API ──
// Les clés "personnel.xxx" se sauvegardent dans le même canvas (blueprint_CEOB)
// et alimentent les sections Direction (profil, objectifs_vitaa, equipe_direction, etc.)

const PERSONAL_SECTIONS: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; fields: FieldDef[] }[] = [
  {
    id: "personnel_identite", label: "Mon Profil", icon: User,
    fields: [
      { id: "nom_complet", label: "Nom complet", type: "text", tier: "T1" as SizeTier, required: true, placeholder: "Ex: Carl Fugere" },
      { id: "titre_poste", label: "Titre / Poste", type: "text", tier: "T1" as SizeTier, required: true, placeholder: "Ex: CEO & Fondateur" },
      { id: "entreprise", label: "Entreprise", type: "text", tier: "T1" as SizeTier, placeholder: "Ex: Usine Bleue AI" },
      { id: "parcours_resume", label: "Parcours en bref", type: "textarea", tier: "T1" as SizeTier, placeholder: "26 ans d'experience, 7 entreprises, 50M$+ en ventes..." },
      { id: "forces_cles", label: "Forces cles (une par ligne)", type: "list", tier: "T1" as SizeTier, placeholder: "Vision strategique\nLeadership entrepreneurial\nDeveloppement d'affaires" },
    ],
  },
  {
    id: "personnel_vitaa", label: "Scores VITAA", icon: Heart,
    fields: [
      { id: "score_vente", label: "Score Vente — reseau, closing (0-100)", type: "number", tier: "T1" as SizeTier, placeholder: "72" },
      { id: "score_idee", label: "Score Idee — creativite, vision (0-100)", type: "number", tier: "T1" as SizeTier, placeholder: "85" },
      { id: "score_temps", label: "Score Temps — productivite, focus (0-100)", type: "number", tier: "T1" as SizeTier, placeholder: "38" },
      { id: "score_argent", label: "Score Argent — gestion, levier (0-100)", type: "number", tier: "T1" as SizeTier, placeholder: "61" },
      { id: "score_actif", label: "Score Actif — assets, IP, equipe (0-100)", type: "number", tier: "T1" as SizeTier, placeholder: "45" },
    ],
  },
  {
    id: "personnel_vision", label: "Vision & Leadership", icon: Eye,
    fields: [
      { id: "mission_personnelle", label: "Ma mission en tant que dirigeant", type: "textarea", tier: "T1" as SizeTier, required: true, placeholder: "Pourquoi je fais ce que je fais. Ce qui me drive." },
      { id: "vision_personnelle", label: "Ma vision pour l'entreprise (5-10 ans)", type: "textarea", tier: "T1" as SizeTier, placeholder: "Ou je veux amener l'entreprise" },
      { id: "valeurs", label: "Mes valeurs non-negociables (une par ligne)", type: "list", tier: "T1" as SizeTier, required: true, placeholder: "Authenticite — Dire la verite meme quand ca fait mal\nExcellence — Livrer le meilleur\nInnovation — Remettre en question" },
      { id: "style_primaire", label: "Style de leadership primaire", type: "select", tier: "T1" as SizeTier, options: ["Visionnaire", "Coach", "Directif", "Collaboratif", "Analytique", "Transformationnel", "Servant Leader"] },
      { id: "style_secondaire", label: "Style de leadership secondaire", type: "select", tier: "T1" as SizeTier, options: ["Visionnaire", "Coach", "Directif", "Collaboratif", "Analytique", "Transformationnel", "Servant Leader"] },
      { id: "style_description", label: "Comment je dirige au quotidien", type: "textarea", tier: "T1" as SizeTier, placeholder: "Part de la destination finale et remonte vers l'execution..." },
      { id: "legacy", label: "L'heritage que je veux laisser", type: "textarea", tier: "T2" as SizeTier, placeholder: "Quel impact durable apres mon depart?" },
    ],
  },
  {
    id: "personnel_objectifs", label: "Objectifs 12 mois", icon: Target,
    fields: [
      { id: "objectif_1", label: "Objectif #1", type: "textarea", tier: "T1" as SizeTier, required: true, placeholder: "Ex: Lancer Brain Team en mode Pioneer (9 clients)" },
      { id: "objectif_1_cible", label: "Objectif #1 — Echeance", type: "text", tier: "T1" as SizeTier, placeholder: "Q2 2026" },
      { id: "objectif_2", label: "Objectif #2", type: "textarea", tier: "T1" as SizeTier, placeholder: "Ex: Atteindre 50K$ MRR" },
      { id: "objectif_2_cible", label: "Objectif #2 — Echeance", type: "text", tier: "T1" as SizeTier, placeholder: "Q4 2026" },
      { id: "objectif_3", label: "Objectif #3", type: "textarea", tier: "T1" as SizeTier, placeholder: "Ex: Recruter 3 developpeurs" },
      { id: "objectif_3_cible", label: "Objectif #3 — Echeance", type: "text", tier: "T1" as SizeTier, placeholder: "Q3 2026" },
      { id: "objectif_4", label: "Objectif #4", type: "textarea", tier: "T2" as SizeTier, placeholder: "Ex: Fermer ronde seed 500K$" },
      { id: "objectif_4_cible", label: "Objectif #4 — Echeance", type: "text", tier: "T2" as SizeTier, placeholder: "Q2 2026" },
      { id: "objectif_5", label: "Objectif #5", type: "textarea", tier: "T2" as SizeTier, placeholder: "Ex: 130 a 200 membres REAI" },
      { id: "objectif_5_cible", label: "Objectif #5 — Echeance", type: "text", tier: "T2" as SizeTier, placeholder: "Q4 2026" },
    ],
  },
  {
    id: "personnel_performance", label: "Performance", icon: BarChart3,
    fields: [
      { id: "kpi_pipeline", label: "Pipeline qualifie ($)", type: "currency", tier: "T1" as SizeTier, placeholder: "320000" },
      { id: "kpi_pipeline_cible", label: "Pipeline — Cible ($)", type: "currency", tier: "T1" as SizeTier, placeholder: "500000" },
      { id: "kpi_mrr", label: "MRR ($)", type: "currency", tier: "T1" as SizeTier, placeholder: "12500" },
      { id: "kpi_mrr_cible", label: "MRR — Cible ($)", type: "currency", tier: "T1" as SizeTier, placeholder: "50000" },
      { id: "projets_livres", label: "Projets livres (ce trimestre)", type: "number", tier: "T1" as SizeTier, placeholder: "7" },
      { id: "projets_cible", label: "Projets — Cible", type: "number", tier: "T1" as SizeTier, placeholder: "12" },
      { id: "satisfaction_equipe", label: "Satisfaction equipe (%)", type: "percentage", tier: "T2" as SizeTier, placeholder: "82" },
      { id: "decisions_strategiques", label: "Decisions strategiques (ce trimestre)", type: "number", tier: "T2" as SizeTier, placeholder: "23" },
    ],
  },
  {
    id: "personnel_developpement", label: "Developpement", icon: TrendingUp,
    fields: [
      { id: "competences_a_developper", label: "Competences a developper (une par ligne)", type: "list", tier: "T1" as SizeTier, placeholder: "Vente enterprise (B2B SaaS)\nGestion de produit (Product-Led Growth)\nLevee de fonds (Pitch, Term Sheets)" },
      { id: "formations", label: "Formations en cours ou planifiees (une par ligne)", type: "list", tier: "T1" as SizeTier, placeholder: "YC Startup School — complete\nReforge Growth Series — planifie\nAI Leadership (Stanford) — planifie" },
      { id: "mentorat", label: "Mentorat (mentors actuels et recherches)", type: "list", tier: "T1" as SizeTier, placeholder: "Mentor SaaS B2B — recherche\nReseau REAI — mentorat reciproque — actif" },
      { id: "lectures", label: "Lectures / Apprentissages en cours", type: "list", tier: "T2" as SizeTier, placeholder: "Livres, podcasts, cours en ligne..." },
    ],
  },
  {
    id: "personnel_equilibre", label: "Equilibre", icon: Heart,
    fields: [
      { id: "heures_actuelles", label: "Heures de travail / semaine (actuelles)", type: "number", tier: "T1" as SizeTier, required: true, placeholder: "58" },
      { id: "heures_cible", label: "Heures de travail / semaine (cible)", type: "number", tier: "T1" as SizeTier, placeholder: "45" },
      { id: "taches_a_deleguer", label: "Taches a deleguer (une par ligne)", type: "list", tier: "T1" as SizeTier, placeholder: "Support technique niveau 1\nGestion des deploiements\nAdmin comptable" },
      { id: "temps_non_negociable", label: "Temps non-negociable (une par ligne)", type: "list", tier: "T1" as SizeTier, required: true, placeholder: "Souper en famille 5x/sem\nSport 3x/sem\nDeconnexion dimanche" },
      { id: "indicateurs_stress", label: "Indicateurs de stress a surveiller", type: "list", tier: "T2" as SizeTier, placeholder: "Insomnie, irritabilite, micro-management..." },
    ],
  },
  {
    id: "personnel_succession", label: "Succession", icon: Users,
    fields: [
      { id: "horizon", label: "Horizon de planification", type: "select", tier: "T1" as SizeTier, options: ["1-2 ans", "3-5 ans", "5-10 ans", "10+ ans"] },
      { id: "plan_succession", label: "Plan de succession", type: "textarea", tier: "T1" as SizeTier, placeholder: "Batir une equipe de leadership autonome..." },
      { id: "personnes_cles", label: "Personnes cles (une par ligne: Nom — Role — Readiness %)", type: "list", tier: "T1" as SizeTier, placeholder: "Tim (CTOB) — CTO — 75%\nRich (CROB) — VP Ventes — 45%\nOlivier (COOB) — COO — 60%" },
      { id: "connaissances_critiques", label: "Connaissances critiques a documenter (une par ligne)", type: "list", tier: "T1" as SizeTier, placeholder: "Vision produit & roadmap\nRelations REAI (130+ contacts)\nArchitecture BTML\nVente consultative" },
      { id: "scenario_urgence", label: "Scenario d'urgence (si absent 6 mois)", type: "textarea", tier: "T2" as SizeTier, placeholder: "Qui prend les decisions? Quels processus survivent?" },
    ],
  },
];

// ── Données de simulation — pre-remplissage pour "Vue completee" ──
const SIMULATION_DATA: Record<string, string> = {
  "personnel_identite.nom_complet": "Carl Fugere",
  "personnel_identite.titre_poste": "CEO & Fondateur",
  "personnel_identite.entreprise": "Usine Bleue AI",
  "personnel_identite.parcours_resume": "26 ans d'experience entrepreneuriale, 7 entreprises, 50M$+ en ventes cumulees. Fondateur du REAI (reseau de 130+ manufacturiers au Quebec).",
  "personnel_identite.forces_cles": "Vision strategique\nLeadership entrepreneurial\nDeveloppement d'affaires\nReseautage et partenariats",
  "personnel_vitaa.score_vente": "72",
  "personnel_vitaa.score_idee": "85",
  "personnel_vitaa.score_temps": "38",
  "personnel_vitaa.score_argent": "61",
  "personnel_vitaa.score_actif": "45",
  "personnel_vision.mission_personnelle": "Je crois que chaque dirigeant de PME merite un copilote IA qui comprend sa realite. Brain Team est cette revolution — un conseil d'administration virtuel accessible, abordable et aligne sur les besoins reels du terrain.",
  "personnel_vision.vision_personnelle": "Devenir la plateforme #1 d'intelligence d'affaires pour les PME manufacturieres au Canada, avec 1000+ entreprises actives d'ici 2029.",
  "personnel_vision.valeurs": "Authenticite — Dire la verite, meme quand ca fait mal\nExcellence — Livrer le meilleur dans les contraintes reelles\nInnovation — Remettre en question chaque processus",
  "personnel_vision.style_primaire": "Visionnaire",
  "personnel_vision.style_secondaire": "Directif",
  "personnel_vision.style_description": "Part de la destination finale et remonte vers l'execution. Communique la vision de facon obsessive, prend des decisions rapides et assume les consequences.",
  "personnel_vision.legacy": "Avoir donne aux PME quebecoises les memes outils d'intelligence d'affaires que les Fortune 500, a une fraction du cout.",
  "personnel_objectifs.objectif_1": "Lancer Brain Team en mode Pioneer (9 clients)",
  "personnel_objectifs.objectif_1_cible": "Q2 2026",
  "personnel_objectifs.objectif_2": "Atteindre 50K$ MRR",
  "personnel_objectifs.objectif_2_cible": "Q4 2026",
  "personnel_objectifs.objectif_3": "Recruter 3 developpeurs",
  "personnel_objectifs.objectif_3_cible": "Q3 2026",
  "personnel_objectifs.objectif_4": "Fermer ronde seed 500K$",
  "personnel_objectifs.objectif_4_cible": "Q2 2026",
  "personnel_objectifs.objectif_5": "130 a 200 membres REAI",
  "personnel_objectifs.objectif_5_cible": "Q4 2026",
  "personnel_performance.kpi_pipeline": "320000",
  "personnel_performance.kpi_pipeline_cible": "500000",
  "personnel_performance.kpi_mrr": "12500",
  "personnel_performance.kpi_mrr_cible": "50000",
  "personnel_performance.projets_livres": "7",
  "personnel_performance.projets_cible": "12",
  "personnel_performance.satisfaction_equipe": "82",
  "personnel_performance.decisions_strategiques": "23",
  "personnel_developpement.competences_a_developper": "Vente enterprise (B2B SaaS)\nGestion de produit (Product-Led Growth)\nLevee de fonds (Pitch, Term Sheets)",
  "personnel_developpement.formations": "YC Startup School — complete\nReforge Growth Series — planifie\nAI Leadership (Stanford Online) — planifie",
  "personnel_developpement.mentorat": "Mentor en SaaS B2B — recherche\nReseau REAI — mentorat reciproque — actif",
  "personnel_developpement.lectures": "Zero to One (Peter Thiel)\nThe Hard Thing About Hard Things (Ben Horowitz)",
  "personnel_equilibre.heures_actuelles": "58",
  "personnel_equilibre.heures_cible": "45",
  "personnel_equilibre.taches_a_deleguer": "Support technique niveau 1\nGestion des deploiements\nAdmin comptable\nPlanification meetings recurrents",
  "personnel_equilibre.temps_non_negociable": "Souper en famille 5x/sem\nSport 3x/sem\nDeconnexion dimanche",
  "personnel_equilibre.indicateurs_stress": "Insomnie\nMicro-management\nSauter des repas",
  "personnel_succession.horizon": "5-10 ans",
  "personnel_succession.plan_succession": "Batir une equipe de leadership autonome capable de gerer les operations sans dependance quotidienne au fondateur. Objectif: ne plus etre indispensable d'ici 2031.",
  "personnel_succession.personnes_cles": "Tim (CTOB) — CTO, pipeline technique autonome — 75%\nRich (CROB) — VP Ventes, pipeline commercial — 45%\nOlivier (COOB) — COO, operations quotidiennes — 60%",
  "personnel_succession.connaissances_critiques": "Vision produit & roadmap\nRelations REAI (130+ contacts)\nArchitecture BTML / GHML\nProcessus de vente consultative",
  "personnel_succession.scenario_urgence": "Tim assume la direction technique, Rich prend le pipeline ventes, Olivier gere les operations. CA consultatif prend les decisions strategiques majeures.",
};

// VitaaTable — EXACTE copie de l'ancien code, branchée sur les données réelles via `data` prop
function VitaaTable({ data, title }: { data: { letter: string; label: string; score: number; avg: number; color: string }[]; title: string }) {
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
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

export function BlueprintPersonnel({ botCode, headerGradient, data, onFieldChange, onSave, saving, dirty, tier }: {
  botCode: string; headerGradient: string;
  data: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
  tier: SizeTier;
}) {
  const [activeSection, setActiveSection] = useState(PERSONAL_SECTIONS[0].id);
  const [previewMode, setPreviewMode] = useState(true);

  // En mode preview: fusionner données réelles + simulation pour les champs vides
  const d = previewMode
    ? { ...SIMULATION_DATA, ...Object.fromEntries(Object.entries(data).filter(([, v]) => v !== "")) }
    : data;

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Calculer progression par section (champs remplis / total)
  const sectionProgress = (section: typeof PERSONAL_SECTIONS[0]) => {
    const fields = getFieldsForTier(section.fields, tier);
    const filled = fields.filter(f => {
      const v = d[`${section.id}.${f.id}`];
      return v !== undefined && v !== "" && v !== "[]";
    }).length;
    return fields.length > 0 ? Math.round((filled / fields.length) * 100) : 0;
  };

  // Helper: lire une valeur depuis d (données fusionnées en preview)
  const val = (key: string) => d[key] || "";
  const num = (key: string) => parseInt(d[key] || "0", 10) || 0;
  const lines = (key: string) => (d[key] || "").split("\n").filter(Boolean);

  // Nom depuis les données saisies (ou placeholder)
  const nom = d["personnel_identite.nom_complet"] || "Mon Profil";
  const titre = d["personnel_identite.titre_poste"] || "";
  const entreprise = d["personnel_identite.entreprise"] || "";

  return (
    <div className="space-y-3">
      {/* ── HERO — Dynamique depuis les données saisies — full width ── */}
      <div className={cn("relative bg-gradient-to-r rounded-xl overflow-hidden", headerGradient)}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-4 p-4">
          <img src="/agents/carl-fugere.jpg" alt={nom} className="w-16 h-16 rounded-xl object-cover border-2 border-white/30 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">{nom}</h3>
              {titre && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{titre}</span>}
              {entreprise && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{entreprise}</span>}
            </div>
            <p className="text-xs text-white/80">
              {data["personnel_vision.mission_personnelle"]
                ? data["personnel_vision.mission_personnelle"].slice(0, 150) + (data["personnel_vision.mission_personnelle"].length > 150 ? "..." : "")
                : "Remplissez votre profil personnel pour alimenter le Blueprint de votre entreprise."}
            </p>
          </div>
          {/* Toggle Vue complétée / Mode édition */}
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={cn(
              "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              previewMode
                ? "bg-white text-gray-800 shadow-sm hover:bg-gray-50"
                : "bg-white/20 text-white hover:bg-white/30"
            )}
          >
            {previewMode ? <PenLine className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {previewMode ? "Mode edition" : "Vue completee"}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
      {/* Sidebar — sections nav avec progression */}
      <div className="w-[180px] shrink-0 space-y-0.5 sticky top-0 self-start">
        {PERSONAL_SECTIONS.map(s => {
          const isActive = activeSection === s.id;
          const Icon = s.icon;
          const progress = sectionProgress(s);
          return (
            <button key={s.id} onClick={() => scrollToSection(s.id)} className={cn(
              "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
              isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
            )}>
              <div className="flex items-center gap-1.5">
                <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-blue-500" : "text-gray-400")} />
                <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-700")}>{s.label}</span>
                <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-full",
                  progress === 0 ? "bg-gray-100 text-gray-400" :
                  progress < 50 ? "bg-amber-50 text-amber-600" :
                  progress < 100 ? "bg-blue-50 text-blue-600" :
                  "bg-emerald-50 text-emerald-600"
                )}>{progress}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Contenu — sections avec vrais champs editables */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* ── MODE PREVIEW: Version visuelle riche (celle d'avant les champs editables) ── */}
        {previewMode ? (
          <div className="space-y-4">
            {/* ── VITAAFAST — VITAA (5 piliers) + FAAS (4 piliers) côte à côte ── */}
            <div className="grid grid-cols-2 gap-3">
              {/* VITAA — 5 piliers d'affaires */}
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Heart className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900 flex-1">VITAA — Piliers d'affaires</span>
                </div>
                <div className="p-2.5 space-y-1.5">
                  {[
                    { letter: "V", label: "Vente", score: num("personnel_vitaa.score_vente"), color: "bg-blue-500" },
                    { letter: "I", label: "Idee", score: num("personnel_vitaa.score_idee"), color: "bg-purple-500" },
                    { letter: "T", label: "Temps", score: num("personnel_vitaa.score_temps"), color: "bg-emerald-500" },
                    { letter: "A", label: "Argent", score: num("personnel_vitaa.score_argent"), color: "bg-amber-500" },
                    { letter: "A", label: "Actif", score: num("personnel_vitaa.score_actif"), color: "bg-red-500" },
                  ].map((p) => (
                    <div key={p.letter + p.label}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0", p.color)}>{p.letter}</div>
                        <span className="text-[9px] font-medium text-gray-800 flex-1">{p.label}</span>
                        <span className={cn("text-xs font-bold", p.score >= 50 ? "text-green-600" : p.score >= 35 ? "text-amber-600" : "text-red-600")}>{p.score}</span>
                        <span className={cn("text-[8px] px-1 py-0.5 rounded border font-medium",
                          p.score < 35 ? "text-red-600 bg-red-50 border-red-200" :
                          p.score < 50 ? "text-amber-600 bg-amber-50 border-amber-200" :
                          "text-green-600 bg-green-50 border-green-200"
                        )}>{p.score < 35 ? "critique" : p.score < 50 ? "risque" : "sain"}</span>
                      </div>
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden ml-7">
                        <div className={cn("h-full rounded-full absolute", p.color)} style={{ width: `${p.score}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-1.5 border-t border-gray-100 mt-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-gray-500 uppercase">Score VITAA</span>
                      <span className="text-sm font-bold text-gray-800">{Math.round((num("personnel_vitaa.score_vente") + num("personnel_vitaa.score_idee") + num("personnel_vitaa.score_temps") + num("personnel_vitaa.score_argent") + num("personnel_vitaa.score_actif")) / 5)}/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAAS — 4 piliers relationnels */}
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900 flex-1">FAAS — Capital social</span>
                </div>
                <div className="p-2.5 space-y-1.5">
                  {[
                    { letter: "F", label: "Fraternite", score: 52, color: "bg-rose-500", desc: "Cohesion equipe, retention, culture" },
                    { letter: "A", label: "Alliance", score: 35, color: "bg-pink-500", desc: "Partenaires B2B, co-creation, REAI" },
                    { letter: "A", label: "Associes", score: 28, color: "bg-fuchsia-500", desc: "CA, mentors, conseillers, pairs" },
                    { letter: "S", label: "Social", score: 44, color: "bg-violet-500", desc: "Reputation, thought leadership" },
                  ].map((p) => (
                    <div key={p.letter + p.label}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0", p.color)}>{p.letter}</div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-medium text-gray-800">{p.label}</span>
                          <p className="text-[8px] text-gray-400 leading-tight truncate">{p.desc}</p>
                        </div>
                        <span className={cn("text-xs font-bold", p.score >= 50 ? "text-green-600" : p.score >= 35 ? "text-amber-600" : "text-red-600")}>{p.score}</span>
                        <span className={cn("text-[8px] px-1 py-0.5 rounded border font-medium",
                          p.score < 35 ? "text-red-600 bg-red-50 border-red-200" :
                          p.score < 50 ? "text-amber-600 bg-amber-50 border-amber-200" :
                          "text-green-600 bg-green-50 border-green-200"
                        )}>{p.score < 35 ? "critique" : p.score < 50 ? "risque" : "sain"}</span>
                      </div>
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden ml-7">
                        <div className={cn("h-full rounded-full absolute", p.color)} style={{ width: `${p.score}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-1.5 border-t border-gray-100 mt-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-gray-500 uppercase">Score FAAS</span>
                      <span className="text-sm font-bold text-gray-800">40/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── MON PROFIL ── */}
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <User className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900 flex-1">Mon Profil</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><div className="text-[10px] text-gray-400 uppercase mb-0.5">Poste</div><div className="text-sm font-bold text-gray-800">{val("personnel_identite.titre_poste") || "—"}</div></div>
                  <div><div className="text-[10px] text-gray-400 uppercase mb-0.5">Entreprise</div><div className="text-sm font-bold text-gray-800">{val("personnel_identite.entreprise") || "—"}</div></div>
                </div>
                {val("personnel_identite.parcours_resume") && (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 uppercase mb-1">Parcours</div>
                    <p className="text-xs text-gray-700 leading-relaxed">{val("personnel_identite.parcours_resume")}</p>
                  </div>
                )}
                {val("personnel_identite.forces_cles") && (
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase mb-1.5">Forces cles</div>
                    <div className="flex flex-wrap gap-1.5">
                      {lines("personnel_identite.forces_cles").map((f, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── VISION & LEADERSHIP ── */}
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <Compass className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900 flex-1">Vision & Leadership</span>
              </div>
              <div className="p-4 space-y-3">
                {val("personnel_vision.mission_personnelle") && (
                  <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-blue-400 bg-blue-50/30">
                    <div className="text-[10px] text-gray-400 uppercase mb-0.5">Mission</div>
                    <p className="text-sm text-gray-700 leading-relaxed">{val("personnel_vision.mission_personnelle")}</p>
                  </div>
                )}
                {val("personnel_vision.vision_personnelle") && (
                  <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-violet-400 bg-violet-50/30">
                    <div className="text-[10px] text-gray-400 uppercase mb-0.5">Vision 3-5 ans</div>
                    <p className="text-sm text-gray-700 leading-relaxed">{val("personnel_vision.vision_personnelle")}</p>
                  </div>
                )}
                {val("personnel_vision.valeurs") && (
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase mb-1.5">Valeurs fondamentales</div>
                    <div className="flex flex-wrap gap-1.5">
                      {lines("personnel_vision.valeurs").map((v, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-medium border border-violet-100">{v}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {val("personnel_vision.style_primaire") && (
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <div className="text-[10px] text-gray-400 uppercase mb-0.5">Style primaire</div>
                      <div className="text-sm font-bold text-gray-800">{val("personnel_vision.style_primaire")}</div>
                    </div>
                  )}
                  {val("personnel_vision.style_secondaire") && (
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <div className="text-[10px] text-gray-400 uppercase mb-0.5">Style secondaire</div>
                      <div className="text-sm font-bold text-gray-800">{val("personnel_vision.style_secondaire")}</div>
                    </div>
                  )}
                </div>
                {val("personnel_vision.legacy") && (
                  <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-amber-400 bg-amber-50/30">
                    <div className="text-[10px] text-gray-400 uppercase mb-0.5">Legacy</div>
                    <p className="text-xs text-gray-700 leading-relaxed italic">{val("personnel_vision.legacy")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── OBJECTIFS 12 MOIS ── */}
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <Target className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900 flex-1">Objectifs 12 mois</span>
              </div>
              <div className="p-4 space-y-2">
                {[1, 2, 3, 4, 5].map(i => {
                  const obj = val(`personnel_objectifs.objectif_${i}`);
                  const cible = val(`personnel_objectifs.objectif_${i}_cible`);
                  if (!obj) return null;
                  return (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white">{i}</span>
                      </div>
                      <div className="flex-1 min-w-0"><div className="text-xs font-bold text-gray-800">{obj}</div></div>
                      {cible && <span className="shrink-0 text-[9px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{cible}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── PERFORMANCE — KPI cards ── */}
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <BarChart3 className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900 flex-1">Performance</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Pipeline", key: "kpi_pipeline", cible: "kpi_pipeline_cible", suffix: "$", color: "from-green-600 to-green-500", textColor: "text-green-600" },
                    { label: "MRR", key: "kpi_mrr", cible: "kpi_mrr_cible", suffix: "$/mois", color: "from-blue-600 to-blue-500", textColor: "text-blue-600" },
                    { label: "Projets livres", key: "projets_livres", cible: "projets_cible", suffix: "", color: "from-violet-600 to-violet-500", textColor: "text-violet-600" },
                    { label: "Satisfaction", key: "satisfaction_equipe", cible: "", suffix: "%", color: "from-amber-600 to-amber-500", textColor: "text-amber-600" },
                  ].map(kpi => {
                    const v = num(`personnel_performance.${kpi.key}`);
                    const c = num(`personnel_performance.${kpi.cible}`);
                    const pct = c > 0 ? Math.min(100, Math.round((v / c) * 100)) : 0;
                    const formatted = v >= 1000 ? `${Math.round(v / 1000)}K` : `${v}`;
                    return (
                      <div key={kpi.key} className="rounded-xl border border-gray-200 shadow-sm bg-white">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                          <span className="text-sm font-bold text-gray-900">{kpi.label}</span>
                        </div>
                        <div className="px-4 py-3">
                          <div className={cn("text-2xl font-bold", kpi.textColor)}>{formatted}{kpi.suffix}</div>
                          {c > 0 && (
                            <>
                              <div className="text-[10px] text-gray-500">Cible: {c >= 1000 ? `${Math.round(c / 1000)}K` : c}{kpi.suffix}</div>
                              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                                <div className={cn("h-full rounded-full transition-all duration-700", pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${pct}%` }} />
                              </div>
                              <div className="text-[9px] text-gray-400 mt-0.5">{pct}% atteint</div>
                            </>
                          )}
                          {!c && kpi.key === "satisfaction_equipe" && <div className="text-[10px] text-gray-500">Score equipe</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {val("personnel_performance.decisions_strategiques") && (
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                    <Target className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-600">Decisions strategiques:</span>
                    <span className="text-sm font-bold text-gray-800">{val("personnel_performance.decisions_strategiques")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── DEVELOPPEMENT ── */}
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <TrendingUp className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900 flex-1">Developpement</span>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { key: "competences_a_developper", label: "Competences a developper", color: "bg-blue-50 text-blue-700 border-blue-100", icon: Target },
                  { key: "formations", label: "Formations", color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: BookOpen },
                  { key: "mentorat", label: "Mentorat", color: "bg-violet-50 text-violet-700 border-violet-100", icon: Users },
                  { key: "lectures", label: "Lectures", color: "bg-amber-50 text-amber-700 border-amber-100", icon: FileText },
                ].map(cat => {
                  const items = lines(`personnel_developpement.${cat.key}`);
                  if (items.length === 0) return null;
                  const CatIcon = cat.icon;
                  return (
                    <div key={cat.key}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <CatIcon className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">{cat.label}</span>
                      </div>
                      <div className="space-y-1">
                        {items.map((item, i) => (
                          <div key={i} className={cn("text-xs px-2.5 py-1.5 rounded-lg border font-medium", cat.color)}>{item}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── EQUILIBRE ── */}
            {(() => {
              const actuel = num("personnel_equilibre.heures_actuelles");
              const cible = num("personnel_equilibre.heures_cible");
              const maxH = Math.max(actuel, cible, 60);
              return (
                <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                    <Heart className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                    <span className="text-sm font-bold text-gray-900 flex-1">Equilibre</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <div className="text-[10px] text-gray-400 uppercase mb-2">Charge de travail (heures/semaine)</div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs text-gray-600">Actuel</span>
                            <span className={cn("text-sm font-bold", actuel > cible ? "text-red-600" : "text-emerald-600")}>{actuel}h</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all duration-700", actuel > cible ? "bg-red-400" : "bg-emerald-400")} style={{ width: `${(actuel / maxH) * 100}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs text-gray-600">Cible</span>
                            <span className="text-sm font-bold text-blue-600">{cible}h</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-blue-400 transition-all duration-700" style={{ width: `${(cible / maxH) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    {[
                      { key: "taches_a_deleguer", label: "A deleguer", icon: Share2, color: "text-amber-600" },
                      { key: "temps_non_negociable", label: "Temps non-negociable", icon: Lock, color: "text-emerald-600" },
                      { key: "indicateurs_stress", label: "Indicateurs de stress", icon: Bell, color: "text-red-500" },
                    ].map(cat => {
                      const items = lines(`personnel_equilibre.${cat.key}`);
                      if (items.length === 0) return null;
                      const CatIcon = cat.icon;
                      return (
                        <div key={cat.key}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <CatIcon className={cn("h-3.5 w-3.5", cat.color)} />
                            <span className="text-[10px] font-bold text-gray-500 uppercase">{cat.label}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {items.map((item, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium border border-gray-200">{item}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* ── SUCCESSION ── */}
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900 flex-1">Succession</span>
              </div>
              <div className="p-4 space-y-3">
                {val("personnel_succession.horizon") && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-600">Horizon:</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{val("personnel_succession.horizon")}</span>
                  </div>
                )}
                {val("personnel_succession.plan_succession") && (
                  <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-blue-400 bg-blue-50/30">
                    <p className="text-xs text-gray-700 leading-relaxed">{val("personnel_succession.plan_succession")}</p>
                  </div>
                )}
                {val("personnel_succession.personnes_cles") && (
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase mb-1.5">Personnes cles</div>
                    <div className="space-y-1.5">
                      {lines("personnel_succession.personnes_cles").map((p, i) => {
                        const pctMatch = p.match(/(\d+)%/);
                        const pct = pctMatch ? parseInt(pctMatch[1], 10) : 0;
                        return (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-500 flex items-center justify-center shrink-0">
                              <User className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="text-xs text-gray-700 flex-1">{p.replace(/\s*—\s*\d+%$/, "")}</span>
                            {pct > 0 && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className={cn("h-full rounded-full transition-all duration-700", pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[9px] font-bold text-gray-500">{pct}%</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {val("personnel_succession.connaissances_critiques") && (
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase mb-1.5">Connaissances critiques</div>
                    <div className="flex flex-wrap gap-1.5">
                      {lines("personnel_succession.connaissances_critiques").map((k, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-medium border border-red-100">{k}</span>
                      ))}
                    </div>
                  </div>
                )}
                {val("personnel_succession.scenario_urgence") && (
                  <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-amber-400 bg-amber-50/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-[10px] font-bold text-amber-700 uppercase">Scenario d'urgence</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{val("personnel_succession.scenario_urgence")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bandeau info */}
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span className="text-[10px] text-blue-700">
                Vue completee — les champs vides sont remplis avec des donnees d'exemple. Cliquez "Mode edition" pour modifier.
              </span>
            </div>
          </div>
        ) : (
          /* ── MODE EDITION: Toutes les sections avec champs editables ── */
          <>
            {PERSONAL_SECTIONS.map(section => {
              const Icon = section.icon;
              const fields = getFieldsForTier(section.fields, tier);
              const wideFields = fields.filter(isWideField);
              const narrowFields = fields.filter(f => !isWideField(f));

              return (
                <div key={section.id} id={section.id} className="space-y-3">
                  <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
                    <div className={cn("flex items-center gap-2 px-4 py-3 bg-gradient-to-r", headerGradient)}>
                      <Icon className="h-4 w-4 text-white" />
                      <span className="text-sm font-bold text-white flex-1">{section.label}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">Personnel</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {narrowFields.length > 0 && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          {narrowFields.map(field => (
                            <div key={field.id}>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">{field.label}</label>
                              <BlueprintField
                                field={field}
                                value={data[`${section.id}.${field.id}`] || ""}
                                onChange={v => onFieldChange(`${section.id}.${field.id}`, v)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      {wideFields.map(field => (
                        <div key={field.id}>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">{field.label}</label>
                          <BlueprintField
                            field={field}
                            value={data[`${section.id}.${field.id}`] || ""}
                            onChange={v => onFieldChange(`${section.id}.${field.id}`, v)}
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              );
            })}

            {/* Bouton sauvegarder global */}
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
          </>
        )}
      </div>
      </div>
    </div>
  );
}

// ── Blueprint Bot — Profil, Trisociation, Skills, APIs, Performance ──

// Ghost Archetypes (from AgentSettingsView)
const GHOST_ARCHETYPES: Record<string, { emoji: string; nom: string; categorie: string; signature: string }> = {
  "Bezos": { emoji: "📦", nom: "L'Architecte Client", categorie: "Strategie", signature: "Obsession client, vision à rebours" },
  "Sun Tzu": { emoji: "⚔️", nom: "Le Stratège Silencieux", categorie: "Strategie", signature: "Gagner sans combattre" },
  "Munger": { emoji: "🧠", nom: "L'Inverseur", categorie: "Strategie", signature: "Modèles mentaux croisés" },
  "Thiel": { emoji: "🔮", nom: "Le Contrarian", categorie: "Strategie", signature: "Vérités cachées, zéro à un" },
  "Chanel": { emoji: "👗", nom: "L'Élégante", categorie: "Strategie", signature: "Marque personnelle comme arme" },
  "Jobs": { emoji: "🍎", nom: "L'Épureur", categorie: "Innovation", signature: "Simplification radicale" },
  "Musk": { emoji: "🚀", nom: "Le Disrupteur", categorie: "Innovation", signature: "Premiers principes, objectifs 10×" },
  "Tesla": { emoji: "⚡", nom: "Le Catalyseur", categorie: "Innovation", signature: "Patterns universels, résonance" },
  "Vinci": { emoji: "🎨", nom: "L'Universel", categorie: "Creativite", signature: "Fusion art et science" },
  "Marc Aurèle": { emoji: "🏛️", nom: "Le Stoïque", categorie: "Leadership", signature: "Maîtrise de soi" },
  "Churchill": { emoji: "🎩", nom: "L'Inébranlable", categorie: "Leadership", signature: "Persévérance absolue" },
  "Oprah": { emoji: "💜", nom: "L'Authentique", categorie: "Leadership", signature: "Empathie et vérité" },
  "Franklin": { emoji: "📜", nom: "Le Fondateur Sage", categorie: "Leadership", signature: "Pragmatisme, bâtir pour durer" },
  "Buffett": { emoji: "💰", nom: "Le Gardien de Valeur", categorie: "Finance", signature: "Patience disciplinée" },
  "Curie": { emoji: "🔬", nom: "La Méthodique", categorie: "Analyse", signature: "Données avant conclusions" },
  "Deming": { emoji: "📊", nom: "Le Mesureur", categorie: "Operations", signature: "On améliore ce qu'on mesure" },
  "Ohno": { emoji: "🏭", nom: "Le Flux", categorie: "Operations", signature: "Éliminer le gaspillage" },
  "Nightingale": { emoji: "🕯️", nom: "La Pionnière", categorie: "Operations", signature: "Innovation par les données" },
  "Mandela": { emoji: "✊", nom: "Le Transformateur", categorie: "Leadership", signature: "Leadership = service" },
};

const BOT_GHOSTS: Record<string, string[]> = {
  CEOB: ["Bezos", "Munger", "Churchill"], CTOB: ["Musk", "Curie", "Vinci"],
  CFOB: ["Buffett", "Munger", "Franklin"], CMOB: ["Jobs", "Tesla", "Oprah"],
  CSOB: ["Sun Tzu", "Thiel", "Chanel"], COOB: ["Marc Aurèle", "Deming", "Nightingale"],
  CPOB: ["Ohno", "Deming", "Nightingale"], CHROB: ["Oprah", "Marc Aurèle", "Deming"],
  CINOB: ["Musk", "Curie", "Tesla"], CROB: ["Thiel", "Bezos", "Chanel"],
  CLOB: ["Munger", "Franklin", "Marc Aurèle"], CISOB: ["Sun Tzu", "Curie", "Franklin"],
};

const BOT_PROFILES_BP: Record<string, { style: string; forces: string[]; approche: string; scores: Record<string, number> }> = {
  CEOB: { style: "Directif et visionnaire", forces: ["Vision strategique", "Prise de decision", "Leadership", "Gestion de crise"], approche: "Part du resultat client et remonte vers la strategie.", scores: { strategique: 95, analytique: 75, creatif: 70, operationnel: 60, relationnel: 80 } },
  CTOB: { style: "Innovateur et methodique", forces: ["Architecture technique", "Innovation", "Resolution complexe", "Prototypage"], approche: "Premiers principes, challenge les contraintes.", scores: { strategique: 70, analytique: 90, creatif: 95, operationnel: 80, relationnel: 55 } },
  CFOB: { style: "Prudent et discipline", forces: ["Analyse financiere", "Gestion du risque", "Valorisation", "Budget"], approche: "Valeur intrinseque avant prix apparent.", scores: { strategique: 80, analytique: 95, creatif: 40, operationnel: 70, relationnel: 50 } },
  CMOB: { style: "Creatif et empathique", forces: ["Positionnement", "Storytelling", "Audience", "Innovation marketing"], approche: "Simplifie le message, connexion emotionnelle.", scores: { strategique: 65, analytique: 60, creatif: 95, operationnel: 50, relationnel: 90 } },
  CSOB: { style: "Stratege et incisif", forces: ["Analyse concurrentielle", "Planification", "Anticipation", "Marche"], approche: "Analyse les forces avant toute recommandation.", scores: { strategique: 95, analytique: 85, creatif: 60, operationnel: 50, relationnel: 45 } },
  COOB: { style: "Methodique et fiable", forces: ["Processus", "Qualite", "Logistique", "Amelioration continue"], approche: "Mesure tout, elimine le gaspillage.", scores: { strategique: 60, analytique: 80, creatif: 40, operationnel: 95, relationnel: 65 } },
  CPOB: { style: "Pragmatique et terrain", forces: ["Planification production", "Lean manufacturing", "Maintenance preventive", "5S / Kaizen"], approche: "Elimine le gaspillage, optimise chaque poste.", scores: { strategique: 45, analytique: 75, creatif: 35, operationnel: 98, relationnel: 55 } },
  CHROB: { style: "Bienveillante et structuree", forces: ["Recrutement", "Retention des talents", "Culture d'entreprise", "Formation"], approche: "Chaque employe est un investissement, pas un cout.", scores: { strategique: 65, analytique: 60, creatif: 55, operationnel: 70, relationnel: 95 } },
  CINOB: { style: "Curieux et disruptif", forces: ["Veille technologique", "R&D", "Propriete intellectuelle", "Transfert techno"], approche: "Explorer les frontieres, valider par l'experimentation.", scores: { strategique: 75, analytique: 90, creatif: 95, operationnel: 45, relationnel: 50 } },
  CROB: { style: "Chasseur et persuasif", forces: ["Developpement d'affaires", "Closing", "Pipeline CRM", "Pricing"], approche: "Chaque interaction est une opportunite de creer de la valeur.", scores: { strategique: 80, analytique: 70, creatif: 65, operationnel: 60, relationnel: 90 } },
  CLOB: { style: "Rigoureux et protecteur", forces: ["Conformite legale", "Contrats", "Propriete intellectuelle", "Loi 25 / RGPD"], approche: "Proteger l'entreprise avant, pas apres le probleme.", scores: { strategique: 70, analytique: 90, creatif: 30, operationnel: 65, relationnel: 45 } },
  CISOB: { style: "Vigilant et methodique", forces: ["Cybersecurite", "Audit de vulnerabilites", "Plan de reponse", "Conformite NIST"], approche: "La securite est un processus continu, pas un produit.", scores: { strategique: 65, analytique: 95, creatif: 40, operationnel: 85, relationnel: 40 } },
};

const BOT_CAPACITES_BP: Record<string, { equivHumain: string; coutHumain: string; tachesCount: number; heuresMois: string; coutIA: string }> = {
  CEOB: { equivHumain: "CEO conseil", coutHumain: "100-200K$", tachesCount: 15, heuresMois: "80-120h", coutIA: "47$" },
  CTOB: { equivHumain: "CTO fractionnaire", coutHumain: "150-300K$", tachesCount: 16, heuresMois: "120-180h", coutIA: "62$" },
  CFOB: { equivHumain: "CFO fractionnaire", coutHumain: "150-250K$", tachesCount: 18, heuresMois: "100-160h", coutIA: "38$" },
  CMOB: { equivHumain: "Directeur marketing", coutHumain: "120-200K$", tachesCount: 14, heuresMois: "100-160h", coutIA: "55$" },
  CSOB: { equivHumain: "Consultant strategie", coutHumain: "120-200K$", tachesCount: 12, heuresMois: "80-120h", coutIA: "41$" },
  COOB: { equivHumain: "Directeur operations", coutHumain: "120-200K$", tachesCount: 15, heuresMois: "120-200h", coutIA: "52$" },
  CPOB: { equivHumain: "Directeur usine", coutHumain: "100-180K$", tachesCount: 20, heuresMois: "140-220h", coutIA: "58$" },
  CHROB: { equivHumain: "DRH fractionnaire", coutHumain: "100-180K$", tachesCount: 14, heuresMois: "80-140h", coutIA: "35$" },
  CINOB: { equivHumain: "VP Innovation", coutHumain: "130-220K$", tachesCount: 10, heuresMois: "60-100h", coutIA: "44$" },
  CROB: { equivHumain: "VP Ventes", coutHumain: "120-250K$", tachesCount: 16, heuresMois: "100-160h", coutIA: "49$" },
  CLOB: { equivHumain: "Avocat d'entreprise", coutHumain: "150-300K$", tachesCount: 12, heuresMois: "60-100h", coutIA: "32$" },
  CISOB: { equivHumain: "CISO fractionnaire", coutHumain: "140-250K$", tachesCount: 18, heuresMois: "100-160h", coutIA: "56$" },
};

const SLOT_LABELS_BP = ["Primaire", "Calibrateur", "Amplificateur"];
const SLOT_COLORS = ["from-blue-600 to-blue-500", "from-violet-600 to-violet-500", "from-amber-600 to-amber-500"];
const SLOT_BG = ["bg-blue-50 border-blue-200", "bg-violet-50 border-violet-200", "bg-amber-50 border-amber-200"];
const SLOT_TEXT_C = ["text-blue-700", "text-violet-700", "text-amber-700"];

const BOT_APIS: Record<string, { name: string; status: "active" | "config" | "off"; icon: string; color: string }[]> = {
  CEOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "Claude Sonnet 4", status: "active", icon: "LLM", color: "bg-violet-500" },
    { name: "ElevenLabs (Chris)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "Deepgram Nova-3", status: "active", icon: "STT", color: "bg-cyan-500" },
    { name: "LiveKit WebRTC", status: "active", icon: "RTC", color: "bg-orange-500" },
    { name: "Tavus Video Avatar", status: "active", icon: "VID", color: "bg-pink-500" },
    { name: "PostgreSQL (carlosdb)", status: "active", icon: "DB", color: "bg-indigo-500" },
    { name: "Telnyx Telephonie", status: "active", icon: "TEL", color: "bg-teal-500" },
    { name: "Google Calendar", status: "config", icon: "CAL", color: "bg-amber-500" },
    { name: "Slack Notifications", status: "off", icon: "MSG", color: "bg-purple-500" },
  ],
  CTOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "GitHub Copilot", status: "active", icon: "DEV", color: "bg-gray-800" },
    { name: "ElevenLabs (Daniel)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "Sentry", status: "active", icon: "MON", color: "bg-red-500" },
    { name: "PostgreSQL", status: "active", icon: "DB", color: "bg-indigo-500" },
    { name: "Docker Engine", status: "active", icon: "CNT", color: "bg-blue-600" },
    { name: "Nginx Reverse Proxy", status: "active", icon: "SRV", color: "bg-green-600" },
    { name: "AWS CloudWatch", status: "config", icon: "INF", color: "bg-cyan-600" },
    { name: "Vercel Deploy", status: "off", icon: "CD", color: "bg-gray-700" },
  ],
  CFOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "QuickBooks Online", status: "active", icon: "FIN", color: "bg-emerald-600" },
    { name: "ElevenLabs (James)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "PostgreSQL", status: "active", icon: "DB", color: "bg-indigo-500" },
    { name: "Stripe Payments", status: "config", icon: "PAY", color: "bg-violet-500" },
    { name: "Wave Accounting", status: "config", icon: "FIN", color: "bg-blue-400" },
    { name: "Dext (factures)", status: "off", icon: "OCR", color: "bg-teal-500" },
  ],
  CMOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "ElevenLabs (Sarah)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "Canva API", status: "active", icon: "DSN", color: "bg-cyan-500" },
    { name: "Google Analytics 4", status: "active", icon: "ANA", color: "bg-amber-500" },
    { name: "HubSpot Marketing", status: "config", icon: "MKT", color: "bg-orange-500" },
    { name: "Mailchimp", status: "config", icon: "EML", color: "bg-amber-600" },
    { name: "Meta Ads Manager", status: "config", icon: "ADS", color: "bg-blue-600" },
    { name: "Hootsuite", status: "off", icon: "SOC", color: "bg-gray-600" },
  ],
  CSOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "ElevenLabs (Nicole)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "LinkedIn Sales Nav", status: "config", icon: "CRM", color: "bg-blue-700" },
    { name: "Apollo.io", status: "config", icon: "PRO", color: "bg-violet-500" },
    { name: "ZoomInfo", status: "off", icon: "DAT", color: "bg-orange-600" },
    { name: "Pipedrive", status: "off", icon: "CRM", color: "bg-green-600" },
  ],
  COOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "ElevenLabs (Marcus)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "Notion", status: "active", icon: "DOC", color: "bg-gray-800" },
    { name: "Monday.com", status: "config", icon: "PMO", color: "bg-red-500" },
    { name: "Jira", status: "config", icon: "TKT", color: "bg-blue-600" },
    { name: "Slack", status: "config", icon: "MSG", color: "bg-purple-500" },
    { name: "Power Automate", status: "off", icon: "AUT", color: "bg-blue-500" },
  ],
  CPOB: [
    { name: "Gemini Flash 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "ElevenLabs (Tom)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "Epicor ERP", status: "config", icon: "ERP", color: "bg-orange-600" },
    { name: "SCADA Interface", status: "config", icon: "IOT", color: "bg-teal-600" },
    { name: "Siemens MindSphere", status: "off", icon: "IOT", color: "bg-cyan-700" },
    { name: "MES (Mfg Exec)", status: "off", icon: "MES", color: "bg-gray-600" },
  ],
  CHROB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "ElevenLabs (Emily)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "BambooHR", status: "config", icon: "RH", color: "bg-teal-500" },
    { name: "Indeed Posting", status: "config", icon: "JOB", color: "bg-blue-500" },
    { name: "Workday", status: "off", icon: "RH", color: "bg-orange-500" },
    { name: "Teams (comm interne)", status: "off", icon: "MSG", color: "bg-violet-600" },
  ],
  CINOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "Claude Opus 4", status: "active", icon: "LLM", color: "bg-violet-500" },
    { name: "ElevenLabs (Aria)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "Miro (ideation)", status: "active", icon: "WB", color: "bg-amber-500" },
    { name: "Google Patents", status: "config", icon: "PAT", color: "bg-amber-600" },
    { name: "Figma API", status: "off", icon: "DSN", color: "bg-purple-500" },
  ],
  CROB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "ElevenLabs (Brian)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "HubSpot CRM", status: "active", icon: "CRM", color: "bg-orange-500" },
    { name: "PandaDoc", status: "active", icon: "DOC", color: "bg-green-500" },
    { name: "Calendly", status: "config", icon: "CAL", color: "bg-blue-400" },
    { name: "Gong.io (calls)", status: "config", icon: "ANA", color: "bg-purple-600" },
    { name: "Salesforce", status: "off", icon: "CRM", color: "bg-blue-600" },
  ],
  CLOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "Claude Sonnet 4", status: "active", icon: "LLM", color: "bg-violet-500" },
    { name: "ElevenLabs (Grace)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "DocuSign", status: "config", icon: "SGN", color: "bg-amber-500" },
    { name: "Clio (gestion juridique)", status: "config", icon: "LAW", color: "bg-indigo-500" },
    { name: "LexisNexis", status: "off", icon: "RCH", color: "bg-red-600" },
  ],
  CISOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "ElevenLabs (Adam)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "Snyk", status: "active", icon: "SEC", color: "bg-purple-600" },
    { name: "Cloudflare WAF", status: "active", icon: "WAF", color: "bg-orange-500" },
    { name: "CrowdStrike", status: "config", icon: "EDR", color: "bg-red-600" },
    { name: "HashiCorp Vault", status: "config", icon: "KEY", color: "bg-gray-700" },
    { name: "Nessus Scanner", status: "off", icon: "SCN", color: "bg-teal-600" },
  ],
};

const VITAA_BOT: Record<string, { letter: string; label: string; score: number; avg: number; color: string }[]> = {
  CEOB: [
    { letter: "V", label: "Vente (leads qualifies)", score: 68, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (insights generes)", score: 82, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (taches/heure)", score: 91, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (ROI genere)", score: 74, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (docs produits)", score: 56, avg: 50, color: "bg-red-500" },
  ],
  CTOB: [
    { letter: "V", label: "Vente (solutions tech)", score: 42, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (architectures)", score: 94, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (sprints livres)", score: 88, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (cout infra)", score: 71, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (code + docs)", score: 85, avg: 50, color: "bg-red-500" },
  ],
  CFOB: [
    { letter: "V", label: "Vente (pricing)", score: 55, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (modeles financiers)", score: 78, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (rapports auto)", score: 92, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (tresorerie)", score: 96, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (etats financiers)", score: 88, avg: 50, color: "bg-red-500" },
  ],
  CMOB: [
    { letter: "V", label: "Vente (leads marketing)", score: 82, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (campagnes)", score: 91, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (contenu/sem)", score: 76, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (ROAS)", score: 64, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (brand assets)", score: 72, avg: 50, color: "bg-red-500" },
  ],
  CSOB: [
    { letter: "V", label: "Vente (pipeline)", score: 88, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (strategies)", score: 85, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (analyses/sem)", score: 70, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (marges)", score: 72, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (plans strat)", score: 65, avg: 50, color: "bg-red-500" },
  ],
  COOB: [
    { letter: "V", label: "Vente (delivery)", score: 48, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (processus)", score: 62, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (efficacite)", score: 95, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (couts ops)", score: 84, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (SOPs)", score: 90, avg: 50, color: "bg-red-500" },
  ],
  CPOB: [
    { letter: "V", label: "Vente (capacite prod)", score: 38, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (ameliorations)", score: 55, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (OEE/TRS)", score: 92, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (cout/unite)", score: 88, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (equipements)", score: 78, avg: 50, color: "bg-red-500" },
  ],
  CHROB: [
    { letter: "V", label: "Vente (marque employeur)", score: 52, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (programmes RH)", score: 68, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (embauche moy)", score: 74, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (cout embauche)", score: 62, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (talents retenus)", score: 71, avg: 50, color: "bg-red-500" },
  ],
  CINOB: [
    { letter: "V", label: "Vente (produits R&D)", score: 35, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (brevets/concepts)", score: 96, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (prototypes)", score: 65, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (budget R&D)", score: 58, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (PI deposee)", score: 45, avg: 50, color: "bg-red-500" },
  ],
  CROB: [
    { letter: "V", label: "Vente (closing rate)", score: 92, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (offres)", score: 72, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (cycle vente)", score: 78, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (revenus)", score: 90, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (propositions)", score: 68, avg: 50, color: "bg-red-500" },
  ],
  CLOB: [
    { letter: "V", label: "Vente (contrats signes)", score: 45, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (cadres legaux)", score: 70, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (revisions)", score: 85, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (risques evites)", score: 92, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (politiques)", score: 82, avg: 50, color: "bg-red-500" },
  ],
  CISOB: [
    { letter: "V", label: "Vente (certifications)", score: 40, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idee (defenses)", score: 75, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (scans/jour)", score: 94, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (incidents evites)", score: 88, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (politiques sec)", score: 80, avg: 50, color: "bg-red-500" },
  ],
};

const BOT_SECTION_META: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "sec-overview", label: "Vue d'ensemble", icon: Eye },
  { id: "sec-outils", label: "Outils & APIs", icon: Cpu },
  { id: "sec-config", label: "Configuration", icon: Settings },
];

// ── Modes de décision (de AgentSettingsView) ──
const DECISION_MODES: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string; gradient: string; description: string; comportement: string; exemple: string }[] = [
  { id: "strategique", label: "Strategique", icon: Target, color: "text-blue-600", bgColor: "bg-blue-50 border-blue-300", gradient: "from-blue-600 to-blue-500", description: "Vision long terme, implications systemiques", comportement: "Pense a 3-5 ans, analyse les effets de second ordre.", exemple: "Quels sont les risques invisibles a 3 ans?" },
  { id: "tactique", label: "Tactique", icon: Zap, color: "text-amber-600", bgColor: "bg-amber-50 border-amber-300", gradient: "from-amber-600 to-amber-500", description: "Action concrete dans les 48h", comportement: "Compresse l'analyse, pousse vers des actions immediates.", exemple: "Quelle est l'action precise pour demain matin?" },
  { id: "analytique", label: "Analytique", icon: BarChart3, color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-300", gradient: "from-emerald-600 to-emerald-500", description: "Data-driven, hypotheses testables", comportement: "Demande les donnees avant de conclure. Structure en comparatifs.", exemple: "Quelles donnees me manquent pour valider?" },
  { id: "creatif", label: "Creatif", icon: Sparkles, color: "text-purple-600", bgColor: "bg-purple-50 border-purple-300", gradient: "from-purple-600 to-fuchsia-500", description: "Angles inattendus, rapprochements", comportement: "Sort des sentiers battus. Propose 3 options non-conventionnelles.", exemple: "Et si on faisait l'exact oppose?" },
  { id: "crise", label: "Crise", icon: ShieldAlert, color: "text-red-600", bgColor: "bg-red-50 border-red-300", gradient: "from-red-600 to-red-500", description: "Triage immediat, zero superflu", comportement: "Repond direct. Structure en: 24h / 7j / ignorer.", exemple: "L'unique chose a regler aujourd'hui?" },
];

// ── Catégories d'archétypes pour le catalogue ──
const ARCHETYPE_CATEGORIES = ["Strategie", "Innovation", "Leadership", "Finance", "Analyse", "Creativite", "Operations"];
const CATEGORY_META: Record<string, { emoji: string; badgeClass: string }> = {
  Strategie:   { emoji: "⚔️",  badgeClass: "text-blue-600 bg-blue-50 border-blue-200" },
  Innovation:  { emoji: "🚀",  badgeClass: "text-violet-600 bg-violet-50 border-violet-200" },
  Leadership:  { emoji: "🏛️",  badgeClass: "text-amber-600 bg-amber-50 border-amber-200" },
  Finance:     { emoji: "💰",  badgeClass: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  Analyse:     { emoji: "🔬",  badgeClass: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  Creativite:  { emoji: "✨",  badgeClass: "text-pink-600 bg-pink-50 border-pink-200" },
  Operations:  { emoji: "🏭",  badgeClass: "text-orange-600 bg-orange-50 border-orange-200" },
};

// ── Missions & objectifs par bot ──
const BOT_MISSIONS: Record<string, { mission: string; objectifs: { label: string; progres: number; cible: string }[]; chantiers: { nom: string; statut: "actif" | "pause" | "complete" }[] }> = {
  CEOB: {
    mission: "Orchestrer l'ensemble des operations de l'entreprise, prendre les decisions strategiques et coordonner l'equipe de 11 agents specialises.",
    objectifs: [
      { label: "Augmenter le score VITAA global a 65/100", progres: 72, cible: "Q2 2026" },
      { label: "Deployer 3 playbooks Pioneer par trimestre", progres: 45, cible: "Q2 2026" },
      { label: "Reduire le temps de decision de 48h a 4h", progres: 88, cible: "Q1 2026" },
    ],
    chantiers: [
      { nom: "Blueprint Direction", statut: "actif" },
      { nom: "Gouvernance IA", statut: "actif" },
      { nom: "Onboarding Pioneer", statut: "pause" },
    ],
  },
  CTOB: {
    mission: "Maintenir et faire evoluer l'architecture technique, superviser les deploiements et assurer la fiabilite de la plateforme.",
    objectifs: [
      { label: "Uptime 99.9% sur VPS1 et VPS2", progres: 98, cible: "Continu" },
      { label: "Reduire la dette technique de 40%", progres: 35, cible: "Q3 2026" },
      { label: "Migrer 3 services vers architecture microservices", progres: 20, cible: "Q3 2026" },
    ],
    chantiers: [
      { nom: "Migration Telnyx", statut: "pause" },
      { nom: "Infrastructure 2 VPS", statut: "complete" },
      { nom: "Pipeline CI/CD", statut: "actif" },
    ],
  },
  CFOB: {
    mission: "Gerer la sante financiere, produire les previsions et rapports, controler les couts et maximiser la rentabilite.",
    objectifs: [
      { label: "Marge brute > 60%", progres: 82, cible: "Q2 2026" },
      { label: "Budget API < 150$/mois", progres: 94, cible: "Continu" },
      { label: "Produire le rapport financier mensuel automatise", progres: 60, cible: "Q2 2026" },
    ],
    chantiers: [
      { nom: "Modelisation financiere SaaS", statut: "actif" },
      { nom: "Audit couts Q1", statut: "complete" },
    ],
  },
  CMOB: {
    mission: "Developper la notoriete de la marque, generer des leads qualifies et creer du contenu engageant pour les PME manufacturieres.",
    objectifs: [
      { label: "Generer 50 MQL/mois", progres: 38, cible: "Q3 2026" },
      { label: "Publier 12 contenus/mois sur LinkedIn", progres: 75, cible: "Continu" },
      { label: "Taux d'ouverture newsletters > 35%", progres: 65, cible: "Q2 2026" },
    ],
    chantiers: [
      { nom: "Campagne lancement Pioneer", statut: "actif" },
      { nom: "Refonte site web", statut: "pause" },
    ],
  },
  CSOB: {
    mission: "Analyser le marche et la concurrence, definir le positionnement strategique et identifier les opportunites de croissance.",
    objectifs: [
      { label: "Completer l'analyse concurrentielle Q2", progres: 55, cible: "Q2 2026" },
      { label: "Identifier 10 segments de marche inexploites", progres: 70, cible: "Q2 2026" },
      { label: "Plan strategique 2026-2028", progres: 25, cible: "Q3 2026" },
    ],
    chantiers: [
      { nom: "Veille concurrentielle", statut: "actif" },
      { nom: "Strategie expansion US", statut: "pause" },
    ],
  },
  COOB: {
    mission: "Optimiser les processus operationnels, gerer la chaine d'approvisionnement et assurer la qualite de livraison.",
    objectifs: [
      { label: "Reduire les delais de livraison de 20%", progres: 45, cible: "Q3 2026" },
      { label: "Taux de satisfaction client > 90%", progres: 82, cible: "Continu" },
      { label: "Documenter 100% des SOPs critiques", progres: 68, cible: "Q2 2026" },
    ],
    chantiers: [
      { nom: "Optimisation workflow", statut: "actif" },
      { nom: "Certification ISO 9001", statut: "pause" },
    ],
  },
  CPOB: {
    mission: "Gerer la planification de production, optimiser le rendement usine et deployer les pratiques Lean manufacturing.",
    objectifs: [
      { label: "OEE/TRS > 75%", progres: 68, cible: "Q3 2026" },
      { label: "Zero arret non planifie/mois", progres: 40, cible: "Q3 2026" },
      { label: "Reduire les rejets de 30%", progres: 55, cible: "Q2 2026" },
    ],
    chantiers: [
      { nom: "Programme 5S", statut: "actif" },
      { nom: "Maintenance preventive IoT", statut: "pause" },
    ],
  },
  CHROB: {
    mission: "Recruter et retenir les meilleurs talents, developper la culture d'entreprise et assurer la conformite RH.",
    objectifs: [
      { label: "Taux de retention > 85%", progres: 78, cible: "Continu" },
      { label: "Temps d'embauche moyen < 30 jours", progres: 62, cible: "Q2 2026" },
      { label: "100% des employes formes sur Brain Team", progres: 35, cible: "Q3 2026" },
    ],
    chantiers: [
      { nom: "Programme d'accueil", statut: "actif" },
      { nom: "Sondage engagement", statut: "complete" },
    ],
  },
  CINOB: {
    mission: "Piloter la recherche et developpement, identifier les technologies emergentes et proteger la propriete intellectuelle.",
    objectifs: [
      { label: "Deposer 2 brevets en 2026", progres: 15, cible: "Q4 2026" },
      { label: "Lancer 1 POC par trimestre", progres: 50, cible: "Continu" },
      { label: "Veille techno hebdomadaire", progres: 90, cible: "Continu" },
    ],
    chantiers: [
      { nom: "POC Agent autonome V2", statut: "actif" },
      { nom: "Etude faisabilite edge AI", statut: "pause" },
    ],
  },
  CROB: {
    mission: "Maximiser les revenus par le developpement d'affaires, la gestion du pipeline CRM et l'optimisation du cycle de vente.",
    objectifs: [
      { label: "Pipeline qualifie > 500K$", progres: 62, cible: "Q2 2026" },
      { label: "Taux de closing > 25%", progres: 78, cible: "Continu" },
      { label: "Revenu recurrent mensuel (MRR) > 50K$", progres: 38, cible: "Q4 2026" },
    ],
    chantiers: [
      { nom: "Programme referral REAI", statut: "actif" },
      { nom: "Expansion marche Ontario", statut: "pause" },
    ],
  },
  CLOB: {
    mission: "Proteger les interets legaux de l'entreprise, gerer les contrats et assurer la conformite reglementaire (Loi 25, CNESST).",
    objectifs: [
      { label: "Conformite Loi 25 a 100%", progres: 85, cible: "Q2 2026" },
      { label: "Reviser tous les contrats fournisseurs", progres: 60, cible: "Q2 2026" },
      { label: "Politique de confidentialite V2", progres: 90, cible: "Q1 2026" },
    ],
    chantiers: [
      { nom: "Audit conformite Loi 25", statut: "actif" },
      { nom: "Revision contrats SaaS", statut: "actif" },
    ],
  },
  CISOB: {
    mission: "Proteger l'infrastructure contre les cybermenaces, gerer les vulnerabilites et maintenir la posture de securite.",
    objectifs: [
      { label: "Zero breche de securite", progres: 100, cible: "Continu" },
      { label: "Score NIST CSF > 3.5/5", progres: 55, cible: "Q3 2026" },
      { label: "Tests de penetration trimestriels", progres: 50, cible: "Continu" },
    ],
    chantiers: [
      { nom: "Hardening VPS1 + VPS2", statut: "complete" },
      { nom: "Programme sensibilisation phishing", statut: "actif" },
    ],
  },
};

// ── Stats performance differenciees par bot ──
const BOT_STATS: Record<string, { messages: string; taches: string; tempsRep: string; deltaMsgs: string; deltaTaches: string; deltaTemps: string }> = {
  CEOB: { messages: "1,247", taches: "89", tempsRep: "2.3s", deltaMsgs: "+18%", deltaTaches: "12 en cours", deltaTemps: "-0.4s" },
  CTOB: { messages: "834", taches: "142", tempsRep: "1.8s", deltaMsgs: "+24%", deltaTaches: "8 en cours", deltaTemps: "-0.2s" },
  CFOB: { messages: "612", taches: "67", tempsRep: "3.1s", deltaMsgs: "+12%", deltaTaches: "5 en cours", deltaTemps: "-0.6s" },
  CMOB: { messages: "956", taches: "78", tempsRep: "2.7s", deltaMsgs: "+31%", deltaTaches: "9 en cours", deltaTemps: "-0.3s" },
  CSOB: { messages: "487", taches: "45", tempsRep: "4.2s", deltaMsgs: "+8%", deltaTaches: "3 en cours", deltaTemps: "+0.1s" },
  COOB: { messages: "723", taches: "112", tempsRep: "2.0s", deltaMsgs: "+15%", deltaTaches: "14 en cours", deltaTemps: "-0.5s" },
  CPOB: { messages: "541", taches: "156", tempsRep: "1.5s", deltaMsgs: "+22%", deltaTaches: "11 en cours", deltaTemps: "-0.3s" },
  CHROB: { messages: "398", taches: "52", tempsRep: "3.5s", deltaMsgs: "+9%", deltaTaches: "6 en cours", deltaTemps: "-0.2s" },
  CINOB: { messages: "312", taches: "38", tempsRep: "5.1s", deltaMsgs: "+45%", deltaTaches: "4 en cours", deltaTemps: "+0.8s" },
  CROB: { messages: "1,089", taches: "94", tempsRep: "1.9s", deltaMsgs: "+28%", deltaTaches: "15 en cours", deltaTemps: "-0.7s" },
  CLOB: { messages: "267", taches: "41", tempsRep: "4.8s", deltaMsgs: "+5%", deltaTaches: "3 en cours", deltaTemps: "-0.1s" },
  CISOB: { messages: "445", taches: "98", tempsRep: "1.2s", deltaMsgs: "+19%", deltaTaches: "7 en cours", deltaTemps: "-0.4s" },
};

// ── Configuration par bot ──
const BOT_CONFIG: Record<string, { temperature: number; tonalite: string; modele: string; langue: string; escalade: string; delegation: string[] }> = {
  CEOB: { temperature: 0.7, tonalite: "Conversationnel", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "—", delegation: ["CTOB", "CFOB", "CSOB"] },
  CTOB: { temperature: 0.4, tonalite: "Technique", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "CEOB si budget > 10K$", delegation: ["CISOB", "CINOB"] },
  CFOB: { temperature: 0.3, tonalite: "Formel", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "CEOB si montant > 50K$", delegation: ["CLOB"] },
  CMOB: { temperature: 0.8, tonalite: "Creatif", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "CEOB si campagne > 5K$", delegation: ["CROB"] },
  CSOB: { temperature: 0.5, tonalite: "Analytique", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "CEOB si pivot strategique", delegation: ["CROB", "CMOB"] },
  COOB: { temperature: 0.4, tonalite: "Directif", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "CEOB si arret production", delegation: ["CPOB"] },
  CPOB: { temperature: 0.3, tonalite: "Terrain", modele: "Gemini Flash 2.0", langue: "Francais (QC)", escalade: "COOB si defaut qualite", delegation: [] },
  CHROB: { temperature: 0.6, tonalite: "Bienveillant", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "CEOB si litige", delegation: [] },
  CINOB: { temperature: 0.9, tonalite: "Exploratoire", modele: "Claude Opus 4", langue: "Francais (QC)", escalade: "CTOB si faisabilite technique", delegation: [] },
  CROB: { temperature: 0.6, tonalite: "Persuasif", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "CEOB si deal > 100K$", delegation: [] },
  CLOB: { temperature: 0.2, tonalite: "Juridique", modele: "Claude Sonnet 4", langue: "Francais (QC)", escalade: "CEOB si risque legal eleve", delegation: [] },
  CISOB: { temperature: 0.3, tonalite: "Alerte", modele: "Gemini Pro 2.0", langue: "Francais (QC)", escalade: "CEOB + CTOB si breche detectee", delegation: [] },
};

// ── Section: Trisociation (3 Ghosts interactifs) ──
// BotTrisociationSection supprimé — fusionné dans BotConfigSection

// BotSkillsSection supprimé — psychométrique fusionné dans BotPerformanceSection

// ── Section: APIs & Connexions ──
function BotApisSection({ botCode }: { botCode: string }) {
  const apis = BOT_APIS[botCode] || BOT_APIS.CEOB;
  const active = apis.filter(a => a.status === "active");
  const rest = apis.filter(a => a.status !== "active");
  const renderApi = (a: typeof apis[0]) => (
    <div key={a.name} className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all",
      a.status === "active" ? "bg-white border-gray-200 shadow-sm" :
      a.status === "config" ? "bg-amber-50/50 border-amber-200" : "bg-gray-50 border-gray-100 opacity-60"
    )}>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-[9px] font-bold shrink-0", a.status === "off" ? "bg-gray-300" : a.color)}>{a.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-gray-800 truncate">{a.name}</div>
        <div className={cn("text-[9px] font-medium", a.status === "active" ? "text-emerald-600" : a.status === "config" ? "text-amber-600" : "text-gray-400")}>{a.status === "active" ? "Connecté" : a.status === "config" ? "À configurer" : "Désactivé"}</div>
      </div>
      <button className={cn("text-[9px] px-2.5 py-1 rounded-full font-medium border cursor-pointer transition-all shrink-0",
        a.status === "active" ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" :
        a.status === "config" ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" :
        "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
      )}>
        {a.status === "active" ? "Déconnecter" : a.status === "config" ? "Configurer" : "Activer"}
      </button>
    </div>
  );
  return (
    <div className="space-y-3">
      <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Activity className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900 flex-1">Connexions Actives</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{active.length} live</span>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">{active.map(renderApi)}</div>
      </Card>
      {rest.length > 0 && (
        <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Cpu className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900 flex-1">À configurer / Disponibles</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{rest.length}</span>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">{rest.map(renderApi)}</div>
        </Card>
      )}
    </div>
  );
}

// BotPerformanceSection supprimé — KPIs, psychométrique et ROI intégrés dans BlueprintBot Vue d'ensemble

// ── Avatar paths pour tous les bots ──
const BOT_AVATAR_MAP: Record<string, string> = {
  CEOB: "/agents/generated/ceo-carlos-profil-v3.png",
  CTOB: "/agents/generated/cto-thierry-profil-v3.png",
  CFOB: "/agents/generated/cfo-francois-profil-v3.png",
  CMOB: "/agents/generated/cmo-martine-profil-v3.png",
  CSOB: "/agents/generated/cso-sophie-profil-v3.png",
  COOB: "/agents/generated/coo-olivier-profil-v3.png",
  CPOB: "/agents/generated/factory-bot-profil-v3.png",
  CHROB: "/agents/generated/chro-helene-profil-v3.png",
  CINOB: "/agents/generated/cino-ines-profil-v3.png",
  CROB: "/agents/generated/cro-raphael-profil-v3.png",
  CLOB: "/agents/generated/clo-louise-profil-v3.png",
  CISOB: "/agents/generated/ciso-secbot-profil-v3.png",
};

const BOT_DISPLAY: Record<string, { name: string; role: string; dept: string }> = {
  CEOB: { name: "CarlOS", role: "CEO", dept: "Direction" },
  CTOB: { name: "Tim", role: "CTO", dept: "Technologie & Innovation" },
  CFOB: { name: "Frank", role: "CFO", dept: "Finance & Tresorerie" },
  CMOB: { name: "Mathilde", role: "CMO", dept: "Marketing & Croissance" },
  CSOB: { name: "Simone", role: "CSO", dept: "Strategie & Ventes" },
  COOB: { name: "Olivier", role: "COO", dept: "Operations & Production" },
  CPOB: { name: "Paco", role: "CPO", dept: "Automatisation & Usine" },
  CHROB: { name: "Helene", role: "CHRO", dept: "Ressources Humaines" },
  CINOB: { name: "Ines", role: "CINO", dept: "Innovation & R&D" },
  CROB: { name: "Rich", role: "CRO", dept: "Revenus & Croissance" },
  CLOB: { name: "Loulou", role: "CLO", dept: "Juridique & Conformite" },
  CISOB: { name: "Sebastien", role: "CISO", dept: "Securite & Cyber" },
};

const BOT_GRADIENT: Record<string, string> = {
  CEOB: "from-blue-600 to-indigo-600", CTOB: "from-violet-600 to-purple-600",
  CFOB: "from-emerald-600 to-teal-600", CMOB: "from-pink-600 to-rose-600",
  CSOB: "from-red-600 to-orange-600", COOB: "from-orange-600 to-amber-600",
  CPOB: "from-amber-600 to-yellow-600", CHROB: "from-teal-600 to-cyan-600",
  CINOB: "from-rose-600 to-pink-600", CROB: "from-amber-600 to-orange-600",
  CLOB: "from-indigo-600 to-blue-600", CISOB: "from-gray-600 to-slate-600",
};

// VueConsolideeBot supprimé — remplacé par BlueprintBot (page unique avec ancres)

// ── Section: Configuration Complete (Parametres + Mode Decision + Trisociation + Catalogue) ──
function BotConfigSection({ botCode }: { botCode: string }) {
  const initial = BOT_CONFIG[botCode] || BOT_CONFIG.CEOB;
  const d = BOT_DISPLAY[botCode] || BOT_DISPLAY.CEOB;
  const ghosts = BOT_GHOSTS[botCode] || BOT_GHOSTS.CEOB;
  const [saved, setSaved] = useState(false);
  const [activeMode, setActiveMode] = useState("strategique");
  const [localGhosts, setLocalGhosts] = useState<string[]>(ghosts);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const currentMode = DECISION_MODES.find(m => m.id === activeMode)!;
  const ghostSet = new Set(localGhosts);
  const allArchetypes = Object.entries(GHOST_ARCHETYPES);
  const handleAssign = (name: string) => {
    if (editingSlot === null) return;
    const next = [...localGhosts];
    next[editingSlot] = name;
    setLocalGhosts(next);
    setEditingSlot(null);
  };

  return (
    <div className="space-y-3">
      {/* ── 1. Mode de Decision ── */}
      <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
        <div className={cn("bg-gradient-to-r px-4 py-2.5 flex items-center gap-2", currentMode.gradient)}>
          <Target className="h-4 w-4 text-white" />
          <span className="text-xs font-bold text-white flex-1">Mode de Decision</span>
          <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">{currentMode.label}</span>
        </div>
        <div className="p-3 space-y-2.5">
          <div className="grid grid-cols-5 gap-1.5">
            {DECISION_MODES.map(mode => {
              const MIcon = mode.icon;
              const isActive = activeMode === mode.id;
              return (
                <button key={mode.id} onClick={() => setActiveMode(mode.id)}
                  className={cn("flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer",
                    isActive ? cn(mode.bgColor, "shadow-sm") : "bg-gray-50 border-gray-200 hover:bg-white")}>
                  <MIcon className={cn("h-3.5 w-3.5", isActive ? mode.color : "text-gray-400")} />
                  <span className={cn("text-[9px] font-bold", isActive ? mode.color : "text-gray-500")}>{mode.label}</span>
                </button>
              );
            })}
          </div>
          <div className={cn("rounded-lg border p-2.5 space-y-1", currentMode.bgColor)}>
            <p className={cn("text-[10px] font-bold", currentMode.color)}>{currentMode.description}</p>
            <p className="text-[10px] text-gray-700 leading-relaxed">{currentMode.comportement}</p>
            <div className="flex items-start gap-1.5 bg-white/60 rounded-md px-2 py-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-[9px] text-gray-600 italic">"{currentMode.exemple}"</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 2. Trisociation — Skins Cognitifs ── */}
      <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Zap className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900 flex-1">Skins Cognitifs — Trisociation</span>
          <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full">{localGhosts.length} actifs</span>
        </div>
        <div className="p-3 space-y-2">
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Configurez les 3 archetypes qui definissent le comportement, le style de reflexion et les priorites de {d.name}.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {localGhosts.map((ghostName, i) => {
              const arch = GHOST_ARCHETYPES[ghostName];
              if (!arch) return null;
              const isEditing = editingSlot === i;
              return (
                <div key={i} className={cn("border rounded-xl overflow-hidden", SLOT_BG[i], isEditing && "ring-2 ring-violet-300")}>
                  <div className={cn("bg-gradient-to-r px-2.5 py-1.5 flex items-center gap-1.5", SLOT_COLORS[i])}>
                    <span className="text-sm">{arch.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[8px] font-bold text-white/70 uppercase">{SLOT_LABELS_BP[i]}</div>
                      <div className="text-[10px] font-bold text-white truncate">{arch.nom}</div>
                    </div>
                  </div>
                  <div className="p-2">
                    <span className={cn("text-[8px] font-medium px-1.5 py-0.5 rounded-full border", CATEGORY_META[arch.categorie]?.badgeClass || "text-gray-600 bg-gray-50 border-gray-200")}>{arch.categorie}</span>
                    <p className="text-[8px] text-gray-500 italic truncate mt-1">"{arch.signature}"</p>
                    <button onClick={() => setEditingSlot(isEditing ? null : i)} className={cn("w-full mt-1.5 text-[9px] px-2 py-1 rounded-full flex items-center justify-center gap-1 font-medium cursor-pointer border transition-all",
                      i === 0 ? "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100" :
                      i === 1 ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" :
                      "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    )}>
                      <Settings className="h-3.5 w-3.5" /> {isEditing ? "Fermer" : "Modifier"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {editingSlot !== null && (
            <div className="border border-dashed border-violet-200 rounded-xl p-3 bg-violet-50/30">
              <div className="text-[9px] font-bold text-violet-600 uppercase tracking-wider mb-2">
                Choisir une teinture pour le slot {SLOT_LABELS_BP[editingSlot]}
              </div>
              <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                {ARCHETYPE_CATEGORIES.map(cat => {
                  const catMeta = CATEGORY_META[cat];
                  const items = allArchetypes.filter(([, a]) => a.categorie === cat);
                  if (items.length === 0) return null;
                  return (
                    <div key={cat}>
                      <div className="flex items-center gap-1.5 px-1 py-1">
                        <span className="text-sm">{catMeta.emoji}</span>
                        <span className="text-[9px] font-bold text-gray-600">{cat}</span>
                        <span className="text-[8px] text-gray-400">({items.length})</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {items.map(([name, arch]) => {
                          const isCurrent = name === localGhosts[editingSlot];
                          const isUsed = ghostSet.has(name) && !isCurrent;
                          return (
                            <button key={name} onClick={() => !isUsed && handleAssign(name)} className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all",
                              isCurrent ? "border-violet-300 bg-violet-50 shadow-sm" :
                              isUsed ? "border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed" :
                              "border-gray-100 hover:bg-gray-50 hover:border-gray-200 cursor-pointer"
                            )}>
                              <span className="text-sm shrink-0">{arch.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-[9px] font-bold text-gray-800 truncate">{arch.nom}</div>
                                <div className="text-[8px] text-gray-500 truncate">{arch.signature.slice(0, 40)}...</div>
                              </div>
                              {isCurrent && <CheckCircle2 className="h-3.5 w-3.5 text-violet-500 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── 3. Parametres Agent ── */}
      <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Settings className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900 flex-1">Parametres — {d.name}</span>
        </div>
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50/50">
            <span className="text-xs font-medium text-gray-700">Escalade</span>
            <span className="text-[9px] font-bold text-gray-800">{initial.escalade}</span>
          </div>
          {initial.delegation.length > 0 && (
            <div>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Delegation vers</span>
              <div className="flex flex-wrap gap-1.5">
                {initial.delegation.map(code => {
                  const dd = BOT_DISPLAY[code];
                  return dd ? (
                    <span key={code} className="text-[9px] px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-medium">{dd.name} ({dd.role})</span>
                  ) : null;
                })}
                <button className="text-[9px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 border border-dashed border-gray-300 font-medium cursor-pointer hover:bg-gray-100 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── Sauvegarder ── */}
      <div className="flex items-center justify-center">
        <button onClick={handleSave} className={cn(
          "text-xs px-6 py-2.5 rounded-full flex items-center gap-1.5 font-medium cursor-pointer transition-all shadow-sm",
          saved ? "bg-emerald-600 text-white" : "bg-violet-600 text-white hover:bg-violet-700"
        )}>
          {saved ? <><CheckCircle2 className="h-3.5 w-3.5" /> Sauvegarde!</> : <><Save className="h-3.5 w-3.5" /> Sauvegarder la configuration</>}
        </button>
      </div>
    </div>
  );
}

export function BlueprintBot({ botCode, headerGradient }: { botCode: string; headerGradient: string }) {
  const [activeAnchor, setActiveAnchor] = useState(BOT_SECTION_META[0].id);
  const vitaa = VITAA_BOT[botCode] || VITAA_BOT.CEOB;
  const profile = BOT_PROFILES_BP[botCode] || BOT_PROFILES_BP.CEOB;
  const cap = BOT_CAPACITES_BP[botCode] || BOT_CAPACITES_BP.CEOB;
  const display = BOT_DISPLAY[botCode] || BOT_DISPLAY.CEOB;
  const avatar = BOT_AVATAR_MAP[botCode] || BOT_AVATAR_MAP.CEOB;
  const gradient = BOT_GRADIENT[botCode] || BOT_GRADIENT.CEOB;
  const missions = BOT_MISSIONS[botCode] || BOT_MISSIONS.CEOB;
  const botStats = BOT_STATS[botCode] || BOT_STATS.CEOB;

  const SCORE_LABELS: Record<string, string> = { strategique: "Strategique", analytique: "Analytique", creatif: "Creatif", operationnel: "Operationnel", relationnel: "Relationnel" };
  const SCORE_COLORS: Record<string, string> = { strategique: "bg-blue-500", analytique: "bg-emerald-500", creatif: "bg-purple-500", operationnel: "bg-orange-500", relationnel: "bg-pink-500" };

  const kpis = [
    { label: "Messages", value: botStats.messages, sub: botStats.deltaMsgs + " ce mois", icon: MessageCircle, gradient: "from-blue-600 to-blue-500", color: "text-blue-600" },
    { label: "Taches", value: botStats.taches, sub: botStats.deltaTaches, icon: CheckCircle2, gradient: "from-emerald-600 to-emerald-500", color: "text-emerald-600" },
    { label: "Temps rep.", value: botStats.tempsRep, sub: botStats.deltaTemps + " vs mois dernier", icon: Activity, gradient: "from-violet-600 to-violet-500", color: "text-violet-600" },
    { label: "Cout/mois", value: cap.coutIA, sub: cap.coutHumain + " si humain", icon: DollarSign, gradient: "from-amber-600 to-amber-500", color: "text-amber-600" },
  ];

  const scrollToSection = (id: string) => {
    setActiveAnchor(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-3">
      {/* ── HERO — Photo + Mission — full width ── */}
      <div className={cn("relative bg-gradient-to-r rounded-xl overflow-hidden", gradient)}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-4 p-4">
          <img src={avatar} alt={display.name} className="w-20 h-20 rounded-xl object-cover border-2 border-white/30 shadow-lg shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">{display.name}</h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{display.role}</span>
              <span className="flex items-center gap-1 text-[9px] font-medium text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                Actif
              </span>
            </div>
            <p className="text-xs text-white/90 leading-relaxed">{missions.mission}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/15 text-white font-medium">{display.dept}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/15 text-white font-medium">{profile.style}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/15 text-white font-medium">{cap.tachesCount} taches/mois</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
      <div className="w-[180px] shrink-0 space-y-0.5 sticky top-0 self-start">
        {BOT_SECTION_META.map(s => {
          const isActive = activeAnchor === s.id;
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => scrollToSection(s.id)} className={cn(
              "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
              isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
            )}>
              <div className="flex items-center gap-1.5">
                <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-blue-500" : "text-gray-400")} />
                <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-700")}>{s.label}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-blue-400" />}
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex-1 min-w-0 space-y-4">

        {/* ── VUE D'ENSEMBLE ── */}
        <div id="sec-overview" className="space-y-3">
          {/* VITAA + Profil Psychometrique côte à côte */}
          <div className="grid grid-cols-2 gap-3">
            <VitaaTable data={vitaa} title={`VITAA — ${display.name}`} />
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <Star className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900 flex-1">Profil Psychometrique</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{profile.style}</span>
              </div>
              <div className="p-2.5 space-y-2">
                {Object.entries(profile.scores).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] font-medium text-gray-600">{SCORE_LABELS[key] || key}</span>
                      <span className={cn("text-[9px] font-bold", val >= 80 ? "text-emerald-600" : val >= 60 ? "text-blue-600" : "text-gray-500")}>{val}/100</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", SCORE_COLORS[key] || "bg-gray-400")} style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4 KPIs */}
          <div className="grid grid-cols-4 gap-3">
            {kpis.map(k => {
              const Icon = k.icon;
              return (
                <div key={k.label} className="rounded-xl border border-gray-200 shadow-sm bg-white">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                    <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                    <span className="text-sm font-bold text-gray-900">{k.label}</span>
                  </div>
                  <div className="px-4 py-3">
                    <div className={cn("text-2xl font-bold", k.color)}>{k.value}</div>
                    <div className="text-[10px] text-gray-500">{k.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ROI compact + Objectifs côte à côte */}
          <div className="grid grid-cols-2 gap-3">
            {/* ROI small box */}
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <DollarSign className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900">ROI — Equiv. Humain</span>
              </div>
              <div className="p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-[9px] text-gray-500 uppercase font-bold">Agent IA</div>
                  <div className="text-xl font-bold text-emerald-600">{cap.coutIA}/mois</div>
                  <div className="text-[9px] text-gray-400">{cap.tachesCount} taches · {cap.heuresMois}</div>
                </div>
                <div className="text-lg font-bold text-gray-300">vs</div>
                <div className="flex-1">
                  <div className="text-[9px] text-gray-500 uppercase font-bold">{cap.equivHumain}</div>
                  <div className="text-xl font-bold text-red-500">{cap.coutHumain}/an</div>
                  <div className="text-[9px] text-gray-400">Meme scope</div>
                </div>
              </div>
            </div>

            {/* Objectifs */}
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <Target className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900 flex-1">Objectifs</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{missions.objectifs.length} actifs</span>
              </div>
              <div className="p-2.5 space-y-2">
                {missions.objectifs.map((obj, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] font-medium text-gray-800 truncate flex-1 mr-2">{obj.label}</span>
                      <span className={cn("text-[9px] font-bold shrink-0", obj.progres >= 75 ? "text-emerald-600" : obj.progres >= 50 ? "text-blue-600" : "text-amber-600")}>{obj.progres}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", obj.progres >= 75 ? "bg-emerald-500" : obj.progres >= 50 ? "bg-blue-500" : "bg-amber-500")} style={{ width: `${obj.progres}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── OUTILS & CONNEXIONS ── */}
        <div id="sec-outils">
          <BotApisSection botCode={botCode} />
        </div>

        {/* ── CONFIGURATION ── */}
        <div id="sec-config">
          <BotConfigSection botCode={botCode} />
        </div>
      </div>
      </div>
    </div>
  );
}


export function VueConsolidee({ tier }: { tier: SizeTier }) {
  const [scores, setScores] = useState<DeptScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const results: DeptScore[] = [];
      for (const bot of OTHER_BOTS) {
        const cfg = getBlueprintConfig(bot.code);
        if (!cfg) continue;
        let score = 0;
        let gaps = 0;
        const gapLabels: string[] = [];
        const keyFields: KeyFieldValue[] = [];
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
          // Extraire les champs-clés pour le résumé
          const deptFields = DEPT_KEY_FIELDS[bot.code] || [];
          for (const kf of deptFields) {
            const raw = d[`${kf.sectionId}.${kf.fieldId}`];
            const value = raw !== undefined && raw !== null && raw !== "" ? String(raw) : "";
            keyFields.push({ label: kf.label, value });
          }
        } catch { /* empty */ }
        results.push({ code: bot.code, score, sections: getVisibleSubSections(cfg, tier).length, gaps, gapLabels, keyFields });
      }
      setScores(results);
      setLoading(false);
    })();
  }, [tier]);

  if (loading) return <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  // Si tous les scores sont à 0 (aucun blueprint rempli = demo/simulation), injecter des données mock
  const allEmpty = scores.every(d => d.score === 0);
  const MOCK_SCORES: Record<string, { score: number; gaps: number; gapLabels: string[]; keyFields: KeyFieldValue[] }> = {
    CTOB: { score: 45, gaps: 3, gapLabels: ["Stack technique", "Infrastructure"], keyFields: [{ label: "Cloud", value: "AWS" }, { label: "Coût infra/mois", value: "2 400$" }, { label: "Dette technique", value: "Moyenne" }] },
    CFOB: { score: 72, gaps: 1, gapLabels: ["Trésorerie"], keyFields: [{ label: "CA estimé", value: "3.2M$" }, { label: "Solde bancaire", value: "485K$" }, { label: "Burn rate", value: "42K$/mois" }] },
    CMOB: { score: 38, gaps: 4, gapLabels: ["Personas ICP", "Positionnement", "Canaux"], keyFields: [{ label: "ICP principal", value: "PME manufact. 50-200 emp." }, { label: "Budget marketing", value: "8 500$/mois" }] },
    CSOB: { score: 61, gaps: 2, gapLabels: ["Concurrence", "Avantage concurrentiel"], keyFields: [{ label: "TAM", value: "890M$" }, { label: "Différenciateur", value: "IA + réseau REAI" }] },
    COOB: { score: 55, gaps: 2, gapLabels: ["Supply chain", "Capacité"], keyFields: [{ label: "Utilisation capacité", value: "78%" }, { label: "Fournisseurs clés", value: "12 actifs" }] },
    CPOB: { score: 29, gaps: 5, gapLabels: ["Planification", "Stocks", "Qualité"], keyFields: [{ label: "Capacité/jour", value: "—" }, { label: "Système qualité", value: "ISO en cours" }] },
    CHROB: { score: 67, gaps: 1, gapLabels: ["Rémunération"], keyFields: [{ label: "Employés", value: "47" }, { label: "Postes ouverts", value: "3" }, { label: "Avantages sociaux", value: "Groupe + REER" }] },
    CINOB: { score: 42, gaps: 3, gapLabels: ["Pipeline innovation", "PI"], keyFields: [{ label: "Projets R&D", value: "4 actifs" }, { label: "Brevets", value: "1 en cours" }] },
    CROB: { score: 58, gaps: 2, gapLabels: ["Pipeline funnel", "Méthodologie"], keyFields: [{ label: "Pipeline ($)", value: "1.8M$" }, { label: "Opportunités", value: "23" }, { label: "CRM intégré", value: "HubSpot" }] },
    CLOB: { score: 35, gaps: 4, gapLabels: ["Contrats", "PI/Marques", "Conformité"], keyFields: [{ label: "Type entité", value: "Inc. fédérale" }, { label: "Marques déposées", value: "2" }] },
    CISOB: { score: 22, gaps: 5, gapLabels: ["Politiques IAM", "Vulnérabilités", "Sauvegardes"], keyFields: [{ label: "MFA", value: "Partiel" }, { label: "Dernier pentest", value: "Jamais" }, { label: "Backup", value: "Manuel" }] },
  };
  const effectiveScores = allEmpty
    ? scores.map(d => ({ ...d, ...(MOCK_SCORES[d.code] || {}) }))
    : scores;

  const avg = effectiveScores.length > 0 ? Math.round(effectiveScores.reduce((s, d) => s + d.score, 0) / effectiveScores.length) : 0;
  const totalGaps = effectiveScores.reduce((s, d) => s + d.gaps, 0);
  const filledKeyFields = effectiveScores.reduce((s, d) => s + d.keyFields.filter(kf => kf.value).length, 0);
  const totalKeyFields = effectiveScores.reduce((s, d) => s + d.keyFields.length, 0);
  const sorted = [...effectiveScores].sort((a, b) => b.gaps - a.gaps || a.score - b.score);

  return (
    <div className="space-y-3">
      {/* ── VITAAFAST — VITAA (5 piliers) + FAAS (4 piliers) côte à côte ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* VITAA — 5 piliers d'affaires */}
        <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
            <Heart className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900 flex-1">VITAA — Piliers d'affaires</span>
          </div>
          <div className="p-2.5 space-y-1.5">
            {[
              { letter: "V", label: "Vente", score: 38, color: "bg-blue-500" },
              { letter: "I", label: "Idee", score: 42, color: "bg-purple-500" },
              { letter: "T", label: "Temps", score: 61, color: "bg-emerald-500" },
              { letter: "A", label: "Argent", score: 55, color: "bg-amber-500" },
              { letter: "A", label: "Actif", score: 29, color: "bg-red-500" },
            ].map((p) => (
              <div key={p.letter + p.label}>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0", p.color)}>{p.letter}</div>
                  <span className="text-[9px] font-medium text-gray-800 flex-1">{p.label}</span>
                  <span className={cn("text-xs font-bold", p.score >= 50 ? "text-green-600" : p.score >= 35 ? "text-amber-600" : "text-red-600")}>{p.score}</span>
                  <span className={cn("text-[9px] px-1 py-0.5 rounded border font-medium",
                    p.score < 35 ? "text-red-600 bg-red-50 border-red-200" :
                    p.score < 50 ? "text-amber-600 bg-amber-50 border-amber-200" :
                    "text-green-600 bg-green-50 border-green-200"
                  )}>{p.score < 35 ? "critique" : p.score < 50 ? "risque" : "sain"}</span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden ml-7">
                  <div className={cn("h-full rounded-full absolute", p.color)} style={{ width: `${p.score}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-1.5 border-t border-gray-100 mt-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-gray-500 uppercase">Score VITAA</span>
                <span className="text-sm font-bold text-gray-800">45/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAAS — 4 piliers relationnels */}
        <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
            <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900 flex-1">FAAS — Capital social</span>
          </div>
          <div className="p-2.5 space-y-1.5">
            {[
              { letter: "F", label: "Fraternite", score: 52, color: "bg-rose-500", desc: "Cohesion equipe, retention, culture" },
              { letter: "A", label: "Alliance", score: 35, color: "bg-pink-500", desc: "Partenaires B2B, co-creation, REAI" },
              { letter: "A", label: "Associes", score: 28, color: "bg-fuchsia-500", desc: "CA, mentors, conseillers, pairs" },
              { letter: "S", label: "Social", score: 44, color: "bg-violet-500", desc: "Reputation, thought leadership" },
            ].map((p) => (
              <div key={p.letter + p.label}>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0", p.color)}>{p.letter}</div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-medium text-gray-800">{p.label}</span>
                    <p className="text-[9px] text-gray-400 leading-tight truncate">{p.desc}</p>
                  </div>
                  <span className={cn("text-xs font-bold", p.score >= 50 ? "text-green-600" : p.score >= 35 ? "text-amber-600" : "text-red-600")}>{p.score}</span>
                  <span className={cn("text-[9px] px-1 py-0.5 rounded border font-medium",
                    p.score < 35 ? "text-red-600 bg-red-50 border-red-200" :
                    p.score < 50 ? "text-amber-600 bg-amber-50 border-amber-200" :
                    "text-green-600 bg-green-50 border-green-200"
                  )}>{p.score < 35 ? "critique" : p.score < 50 ? "risque" : "sain"}</span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden ml-7">
                  <div className={cn("h-full rounded-full absolute", p.color)} style={{ width: `${p.score}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-1.5 border-t border-gray-100 mt-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-gray-500 uppercase">Score FAAS</span>
                <span className="text-sm font-bold text-gray-800">40/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sorted.map(dept => {
          const info = OTHER_BOTS.find(b => b.code === dept.code)!;
          const isExpanded = expandedDept === dept.code;
          const filledFields = dept.keyFields.filter(kf => kf.value);

          return (
            <div
              key={dept.code}
              className={cn(
                "rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer",
                isExpanded && "border-blue-200 shadow-md"
              )}
              onClick={() => setExpandedDept(isExpanded ? null : dept.code)}
            >
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <span className="text-sm font-bold text-gray-900 flex-1">{info.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{info.bot}</span>
                <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{dept.score}%</span>
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

                {/* Résumé données clés — toujours visible si renseignées */}
                {filledFields.length > 0 && (
                  <div className="border-t border-gray-100 pt-1.5 space-y-0.5">
                    {(isExpanded ? dept.keyFields : filledFields.slice(0, 2)).map((kf, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[9px] text-gray-400">{kf.label}</span>
                        {kf.value ? (
                          <span className="text-[9px] font-medium text-gray-700 max-w-[60%] text-right truncate">{kf.value}</span>
                        ) : (
                          <span className="text-[9px] text-gray-300 italic">—</span>
                        )}
                      </div>
                    ))}
                    {!isExpanded && filledFields.length > 2 && (
                      <span className="text-[9px] text-blue-400 font-medium">+{filledFields.length - 2} données...</span>
                    )}
                  </div>
                )}

                {/* Expanded: champs vides aussi */}
                {isExpanded && filledFields.length === 0 && dept.keyFields.length > 0 && (
                  <div className="border-t border-gray-100 pt-1.5 space-y-0.5">
                    {dept.keyFields.map((kf, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[9px] text-gray-400">{kf.label}</span>
                        <span className="text-[9px] text-gray-300 italic">Non renseigné</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Types partagés — Membres humains (internes + externes) ──

interface Membre {
  nom: string;
  titre: string;
  courriel: string;
  type: "interne" | "externe";
}

function parseJSON<T>(raw: string, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

// ── Conseil d'Administration Manager — CEOB seulement ──

interface MembreCA extends Membre {
  expertise: string;
  independant: boolean;
  depuis: string;
}

interface ConseilAdmin {
  president: string;
  frequence: string;
  format: string;
  charte: string;
  assurance_do: string;
  prochaine_reunion: string;
  membres: MembreCA[];
}

const CA_DEFAULT: ConseilAdmin = {
  president: "", frequence: "Trimestrielle", format: "Conférence AI",
  charte: "Non", assurance_do: "Non", prochaine_reunion: "", membres: [],
};

// ── Mock data — Conseil d'Administration ──

const CA_MOCK_REUNIONS = [
  { date: "2026-03-15", type: "Trimestrielle", participants: 7, duree: "2h30", statut_pv: "Approuvé", sujet: "Bilan Q1 et orientations stratégiques" },
  { date: "2026-01-20", type: "Extraordinaire", participants: 5, duree: "1h15", statut_pv: "Approuvé", sujet: "Approbation budget 2026" },
  { date: "2025-12-12", type: "Trimestrielle", participants: 8, duree: "3h00", statut_pv: "Approuvé", sujet: "Bilan annuel et planification" },
  { date: "2026-04-25", type: "Trimestrielle", participants: 0, duree: "—", statut_pv: "À venir", sujet: "Revue Q1 et croissance" },
];

const CA_MOCK_CONFERENCES = [
  { date: "2026-03-10", sujet: "Analyse SWOT avec CarlOS", duree: "45min", bots: ["CEOB", "CSOB", "CFOB"], participants: 5 },
  { date: "2026-02-15", sujet: "Scénario de croissance M&A", duree: "1h10", bots: ["CEOB", "CFOB", "CROB"], participants: 6 },
  { date: "2026-01-28", sujet: "Revue technologique annuelle", duree: "55min", bots: ["CTOB", "CINOB", "CEOB"], participants: 4 },
];

const CA_MOCK_DOCUMENTS = [
  { titre: "Charte du CA", statut: "Actif", maj: "2026-01-15", type: "Gouvernance" },
  { titre: "Code d'éthique et de conduite", statut: "Actif", maj: "2025-11-20", type: "Éthique" },
  { titre: "Politique D&O (Assurance)", statut: "En révision", maj: "2026-03-01", type: "Assurance" },
  { titre: "Matrice RACI — Responsabilités CA", statut: "Brouillon", maj: "2026-02-28", type: "Opérationnel" },
  { titre: "Politique sur les conflits d'intérêts", statut: "Actif", maj: "2025-09-10", type: "Conformité" },
  { titre: "Règlements généraux de l'organisation", statut: "Actif", maj: "2024-06-15", type: "Juridique" },
];

const CA_BLUEPRINT_COMPLETIONS = [65, 82, 45, 73, 58, 91, 38, 70];

// ── Mock data — Comités ──

const COMITES_SUGGESTED_TEMPLATES = [
  { nom: "Comité stratégique", description: "Orientations long terme, analyse compétitive, M&A", frequence: "Trimestrielle" },
  { nom: "Comité SST", description: "Santé et sécurité au travail, conformité, prévention", frequence: "Mensuelle" },
  { nom: "Comité R&D", description: "Innovation, prototypes, veille technologique", frequence: "Bimensuelle" },
  { nom: "Comité finance", description: "Budget, trésorerie, investissements, audit interne", frequence: "Mensuelle" },
  { nom: "Comité RH", description: "Recrutement, rétention, formation, culture", frequence: "Mensuelle" },
];

const COMITE_MOCK_REUNIONS = [
  { date: "2026-03-20", type: "Régulière", participants: 5, duree: "1h30", statut_pv: "Approuvé", sujet: "Suivi des actions et objectifs Q1" },
  { date: "2026-02-18", type: "Régulière", participants: 4, duree: "1h15", statut_pv: "Approuvé", sujet: "Bilan mensuel et ajustements" },
  { date: "2026-01-15", type: "Spéciale", participants: 6, duree: "2h00", statut_pv: "Approuvé", sujet: "Planification annuelle 2026" },
];

const COMITE_MOCK_DOCUMENTS = [
  { titre: "Mandat du comité", statut: "Actif", maj: "2026-01-10", type: "Gouvernance" },
  { titre: "Procès-verbal — Mars 2026", statut: "Approuvé", maj: "2026-03-22", type: "PV" },
  { titre: "Feuille de route 2026", statut: "En révision", maj: "2026-02-28", type: "Planification" },
];

export function ConseilAdminManager({ headerGradient, data, onFieldChange, onSave, saving, dirty }: {
  headerGradient: string;
  data: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
}) {
  const [activeCASection, setActiveCASection] = useState("tableau");
  const KEY = "ca_conseil";
  const ca: ConseilAdmin = parseJSON(data[KEY] || "", CA_DEFAULT);

  const update = (patch: Partial<ConseilAdmin>) => {
    onFieldChange(KEY, JSON.stringify({ ...ca, ...patch }));
  };

  const addMembre = () => {
    update({ membres: [...ca.membres, { nom: "", titre: "", courriel: "", expertise: "", type: "externe", independant: true, depuis: "" }] });
  };

  const removeMembre = (idx: number) => {
    update({ membres: ca.membres.filter((_, i) => i !== idx) });
  };

  const updateMembre = (idx: number, patch: Partial<MembreCA>) => {
    update({ membres: ca.membres.map((m, i) => i === idx ? { ...m, ...patch } : m) });
  };

  const inputBase = "w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-white";
  const nbIndependants = ca.membres.filter(m => m.independant).length;
  const nbExternes = ca.membres.filter(m => m.type === "externe").length;

  const CA_SECTIONS = [
    { id: "tableau", label: "Vue d'ensemble", icon: BarChart3, meta: `${ca.membres.length} membres` },
    { id: "membres", label: "Membres du CA", icon: Users, meta: `${ca.membres.length} actifs` },
    { id: "reunions", label: "Réunions & PV", icon: Calendar, meta: `${CA_MOCK_REUNIONS.length} réunions` },
    { id: "conferences", label: "Conférences AI", icon: Headphones, meta: `${CA_MOCK_CONFERENCES.length} sessions` },
    { id: "documents", label: "Documents & Charte", icon: FileText, meta: `${CA_MOCK_DOCUMENTS.length} docs` },
    { id: "blueprints", label: "Blueprints personnels", icon: Target, meta: `${ca.membres.length} profils` },
    { id: "gouvernance", label: "Gouvernance", icon: Shield, meta: ca.charte === "Oui" ? "Charte active" : "À configurer" },
    { id: "surveillance", label: "Surveillance financière", icon: DollarSign, meta: "4 indicateurs" },
  ];

  return (
    <div className="space-y-3">
      {/* Header — style Personnel/Bot */}
      <div className={cn("relative bg-gradient-to-r rounded-xl overflow-hidden", headerGradient)}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-4 p-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">Conseil d'administration</h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{ca.membres.length} membre{ca.membres.length !== 1 ? "s" : ""}</span>
            </div>
            <p className="text-xs text-white/80">
              L'organe de gouvernance suprême de votre organisation. Suivez les résultats, participez aux réunions (Conférence AI) et recevez les minutes automatiquement.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
      {/* Sidebar TOC */}
      <div className="w-[180px] shrink-0 space-y-1">
        {CA_SECTIONS.map(s => {
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => setActiveCASection(s.id)} className={cn(
              "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
              activeCASection === s.id ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
            )}>
              <div className="flex items-center gap-1.5">
                <Icon className={cn("h-3.5 w-3.5", activeCASection === s.id ? "text-blue-600" : "text-gray-400")} />
                <span className={cn("text-[10px] font-bold leading-tight", activeCASection === s.id ? "text-blue-700" : "text-gray-700")}>{s.label}</span>
              </div>
              <div className="text-[9px] text-gray-400 ml-[20px]">{s.meta}</div>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-3">

          {/* 1. Tableau de bord */}
          {activeCASection === "tableau" && (<>
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Membres</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-gray-900">{ca.membres.length}</div>
                  <div className="text-[9px] text-gray-400">Total CA</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Shield className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Indépendants</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-gray-900">{nbIndependants}</div>
                  <div className="text-[9px] text-gray-400">{ca.membres.length > 0 ? Math.round((nbIndependants / ca.membres.length) * 100) : 0}% du CA</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <UserPlus className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Externes</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-gray-900">{nbExternes}</div>
                  <div className="text-[9px] text-gray-400">Invités plateforme</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Briefcase className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Réunions</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-gray-900">{ca.frequence || "—"}</div>
                  <div className="text-[9px] text-gray-400">{ca.format}</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <div>
                    <div className="text-[9px] text-gray-400">Prochaine réunion</div>
                    <div className="text-xs font-bold text-gray-700">{ca.prochaine_reunion || "Non planifiée"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-gray-400" />
                  <div>
                    <div className="text-[9px] text-gray-400">Charte du CA</div>
                    <div className="text-xs font-bold text-gray-700">{ca.charte}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-gray-400" />
                  <div>
                    <div className="text-[9px] text-gray-400">Assurance D&O</div>
                    <div className="text-xs font-bold text-gray-700">{ca.assurance_do}</div>
                  </div>
                </div>
              </div>
            </div>
          </>)}

          {/* 2. Membres du CA */}
          {activeCASection === "membres" && (
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
                  <span className="text-xs font-bold text-gray-900">Membres du conseil ({ca.membres.length})</span>
                </div>
                <button onClick={addMembre} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer">
                  <UserPlus className="h-3.5 w-3.5" /> Ajouter un membre
                </button>
              </div>
              <div className="p-4">
                {ca.membres.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                    <Users className="h-6 w-6 text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 mb-3">Aucun membre au conseil d'administration</p>
                    <button onClick={addMembre} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all mx-auto">
                      <UserPlus className="h-3.5 w-3.5" /> Ajouter le premier membre
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ca.membres.map((m, idx) => (
                      <div key={idx} className={cn("rounded-lg border px-3 py-3 group transition-all", m.type === "externe" ? "border-amber-200 bg-amber-50/30" : "border-gray-200 bg-white")}>
                        <div className="grid grid-cols-6 gap-2 items-center">
                          <div>
                            <label className="text-[9px] text-gray-400 block mb-0.5">Nom</label>
                            <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.nom} onChange={e => updateMembre(idx, { nom: e.target.value })} placeholder="Nom complet" />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-400 block mb-0.5">Rôle au CA</label>
                            <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.titre} onChange={e => updateMembre(idx, { titre: e.target.value })} placeholder="Président, Secrétaire..." />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-400 block mb-0.5">Expertise</label>
                            <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.expertise} onChange={e => updateMembre(idx, { expertise: e.target.value })} placeholder="Finance, Juridique..." />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-400 block mb-0.5">Courriel</label>
                            <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.courriel} onChange={e => updateMembre(idx, { courriel: e.target.value })} placeholder="courriel@..." />
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="text-[9px] text-gray-400 block mb-0.5">Type</label>
                              <select className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.type} onChange={e => updateMembre(idx, { type: e.target.value as "interne" | "externe" })}>
                                <option value="interne">Interne</option>
                                <option value="externe">Externe</option>
                              </select>
                            </div>
                            <div className="flex-1">
                              <label className="text-[9px] text-gray-400 block mb-0.5">Indépendant</label>
                              <select className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.independant ? "oui" : "non"} onChange={e => updateMembre(idx, { independant: e.target.value === "oui" })}>
                                <option value="oui">Oui</option>
                                <option value="non">Non</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <label className="text-[9px] text-gray-400 block mb-0.5">Membre depuis</label>
                              <input type="date" className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.depuis} onChange={e => updateMembre(idx, { depuis: e.target.value })} />
                            </div>
                            <button onClick={() => removeMembre(idx)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all cursor-pointer shrink-0 pb-1">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {ca.membres.some(m => m.type === "externe") && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200/50">
                    <Info className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-[9px] text-amber-700 leading-relaxed">
                      Les membres externes recevront une invitation par courriel pour accéder à la plateforme Brain Team en tant qu'administrateur invité. Ils pourront consulter les résultats, participer aux Conférences AI du CA et recevoir les minutes automatiquement.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Réunions & PV */}
          {activeCASection === "reunions" && (<>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">Historique des réunions</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all">
                <Plus className="h-3.5 w-3.5" /> Planifier une réunion
              </button>
            </div>
            <div className="space-y-2">
              {CA_MOCK_REUNIONS.map((r, i) => (
                <div key={i} className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[80px]">
                        <div className="text-xs font-bold text-gray-700">{r.date}</div>
                        <div className="text-[9px] text-gray-400">{r.duree}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-700">{r.sujet}</div>
                        <div className="text-[9px] text-gray-400">{r.type} · {r.participants} participants</div>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0",
                      r.statut_pv === "Approuvé" ? "bg-emerald-50 text-emerald-700" :
                      r.statut_pv === "À venir" ? "bg-blue-50 text-blue-600" :
                      "bg-amber-50 text-amber-700"
                    )}>{r.statut_pv}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <p className="text-[9px] text-blue-700">Brain Team peut générer automatiquement les procès-verbaux de vos réunions à partir des transcriptions de Conférence AI.</p>
            </div>
          </>)}

          {/* 4. Conférences AI */}
          {activeCASection === "conferences" && (<>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">Conférences AI du board</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all">
                <Headphones className="h-3.5 w-3.5" /> Lancer une Conférence AI
              </button>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 shadow-sm bg-gradient-to-r from-violet-50 to-blue-50/30">
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-violet-700 mb-1">Conférence AI pour le CA</p>
                  <p className="text-[9px] text-violet-600 leading-relaxed">Brain Team peut animer des sessions de conseil d'administration avec vos bots spécialisés (CEO, CFO, CSO...). Chaque bot apporte son expertise unique pour enrichir les discussions stratégiques.</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {CA_MOCK_CONFERENCES.map((c, i) => (
                <div key={i} className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[80px]">
                        <div className="text-xs font-bold text-gray-700">{c.date}</div>
                        <div className="text-[9px] text-gray-400">{c.duree}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-700">{c.sujet}</div>
                        <div className="text-[9px] text-gray-400">{c.participants} participants · Bots: {c.bots.join(", ")}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 shrink-0">Terminée</span>
                  </div>
                </div>
              ))}
            </div>
          </>)}

          {/* 5. Documents & Charte */}
          {activeCASection === "documents" && (<>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">Documents de gouvernance</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all">
                <Sparkles className="h-3.5 w-3.5" /> Générer un document avec AI
              </button>
            </div>
            <div className="space-y-2">
              {CA_MOCK_DOCUMENTS.map((d, i) => (
                <div key={i} className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-gray-700">{d.titre}</div>
                      <div className="text-[9px] text-gray-400">{d.type} · Dernière MAJ: {d.maj}</div>
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0",
                      d.statut === "Actif" ? "bg-emerald-50 text-emerald-700" :
                      d.statut === "En révision" ? "bg-amber-50 text-amber-700" :
                      "bg-gray-100 text-gray-500"
                    )}>{d.statut}</span>
                  </div>
                </div>
              ))}
            </div>
          </>)}

          {/* 6. Blueprints personnels */}
          {activeCASection === "blueprints" && (<>
            <div className="p-4 rounded-xl border border-gray-200 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50/30">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-700 mb-1">Blueprints personnels du CA</p>
                  <p className="text-[9px] text-blue-600 leading-relaxed">Chaque administrateur complète son blueprint personnel pour aligner ses intentions et compétences avec la croissance de l'organisation. Ce processus est guidé par Brain Team.</p>
                </div>
              </div>
            </div>
            {ca.membres.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                <Target className="h-6 w-6 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Ajoutez des membres au CA pour voir leurs blueprints personnels</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {ca.membres.map((m, i) => {
                  const completion = CA_BLUEPRINT_COMPLETIONS[i % CA_BLUEPRINT_COMPLETIONS.length];
                  return (
                    <div key={i} className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm bg-white cursor-pointer hover:shadow-md hover:border-blue-200 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-xs font-bold text-gray-700">{m.nom || "Sans nom"}</div>
                          <div className="text-[9px] text-gray-400">{m.titre || "Membre du CA"}</div>
                        </div>
                        <span className={cn("text-xs font-bold", completion >= 75 ? "text-emerald-600" : completion >= 50 ? "text-amber-600" : "text-red-500")}>{completion}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", completion >= 75 ? "bg-emerald-500" : completion >= 50 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${completion}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>)}

          {/* 7. Gouvernance */}
          {activeCASection === "gouvernance" && (
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <Settings className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
                <span className="text-xs font-bold text-gray-900">Configuration du CA</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Président(e) du CA</label>
                    <input className={inputBase} value={ca.president} onChange={e => update({ president: e.target.value })} placeholder="Nom du président(e)" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Fréquence des réunions</label>
                    <select className={inputBase} value={ca.frequence} onChange={e => update({ frequence: e.target.value })}>
                      <option value="Mensuelle">Mensuelle</option>
                      <option value="Bimestrielle">Bimestrielle</option>
                      <option value="Trimestrielle">Trimestrielle</option>
                      <option value="Semestrielle">Semestrielle</option>
                      <option value="Annuelle">Annuelle</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Format</label>
                    <select className={inputBase} value={ca.format} onChange={e => update({ format: e.target.value })}>
                      <option value="Conférence AI">Conférence AI</option>
                      <option value="Présentiel">Présentiel</option>
                      <option value="Hybride">Hybride</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Prochaine réunion</label>
                    <input type="date" className={inputBase} value={ca.prochaine_reunion} onChange={e => update({ prochaine_reunion: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Charte du CA</label>
                    <select className={inputBase} value={ca.charte} onChange={e => update({ charte: e.target.value })}>
                      <option value="Oui">Oui</option>
                      <option value="En rédaction">En rédaction</option>
                      <option value="Non">Non</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Assurance D&O</label>
                    <select className={inputBase} value={ca.assurance_do} onChange={e => update({ assurance_do: e.target.value })}>
                      <option value="Oui">Oui</option>
                      <option value="En évaluation">En évaluation</option>
                      <option value="Non">Non</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. Surveillance financière */}
          {activeCASection === "surveillance" && (<>
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <DollarSign className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Revenu YTD</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-gray-900">2.4M$</div>
                  <div className="text-[9px] text-gray-400">+12% vs objectif</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <TrendingUp className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">EBITDA</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-gray-900">18.5%</div>
                  <div className="text-[9px] text-gray-400">Marge opérationnelle</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Activity className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Cash Flow</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-gray-900">+340K$</div>
                  <div className="text-[9px] text-gray-400">Flux de trésorerie</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Shield className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Ratio dette</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-gray-900">1.8x</div>
                  <div className="text-[9px] text-gray-400">Dette/EBITDA</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 shadow-sm bg-gradient-to-r from-emerald-50 to-blue-50/20">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-700 mb-1">Surveillance financière automatisée</p>
                  <p className="text-[9px] text-emerald-600 leading-relaxed">Ce tableau de bord est alimenté automatiquement par les données de votre département Finance. Les administrateurs du CA peuvent suivre la santé financière en temps réel.</p>
                </div>
              </div>
            </div>
          </>)}

        {/* Save */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[9px] text-gray-400">{dirty ? "Modifications non sauvegardées" : "À jour"}</span>
          <button onClick={onSave} disabled={saving || !dirty} className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all",
            dirty ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>

      </div>
      </div>
    </div>
  );
}

// ── Comités Manager — Gestion des comités par département ──

interface Comite {
  id: string;
  nom: string;
  frequence: string;
  format: string;
  description: string;
  responsable: string;
  prochaine_reunion: string;
  membres: Membre[];
}

function parseComites(raw: string): Comite[] {
  return parseJSON<Comite[]>(raw, []);
}

export function ComitesManager({ botCode, deptLabel, headerGradient, data, onFieldChange, onSave, saving, dirty }: {
  botCode: string;
  deptLabel: string;
  headerGradient: string;
  data: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
}) {
  const KEY = `comites_${botCode}`;
  const comites = parseComites(data[KEY] || "");
  const [activeComite, setActiveComite] = useState<string | null>(comites[0]?.id || null);

  const updateComites = (updated: Comite[]) => {
    onFieldChange(KEY, JSON.stringify(updated));
  };

  const addComite = () => {
    const id = `comite_${Date.now()}`;
    const newComite: Comite = {
      id,
      nom: "",
      frequence: "Mensuelle",
      format: "Conférence AI",
      description: "",
      responsable: "",
      prochaine_reunion: "",
      membres: [],
    };
    updateComites([...comites, newComite]);
    setActiveComite(id);
  };

  const removeComite = (id: string) => {
    const updated = comites.filter(c => c.id !== id);
    updateComites(updated);
    if (activeComite === id) setActiveComite(updated[0]?.id || null);
  };

  const updateComite = (id: string, patch: Partial<Comite>) => {
    updateComites(comites.map(c => c.id === id ? { ...c, ...patch } : c));
  };

  const addMembre = (comiteId: string) => {
    const c = comites.find(c => c.id === comiteId);
    if (!c) return;
    updateComite(comiteId, { membres: [...c.membres, { nom: "", titre: "", courriel: "", type: "interne" }] });
  };

  const removeMembre = (comiteId: string, idx: number) => {
    const c = comites.find(c => c.id === comiteId);
    if (!c) return;
    updateComite(comiteId, { membres: c.membres.filter((_, i) => i !== idx) });
  };

  const updateMembre = (comiteId: string, idx: number, patch: Partial<Membre>) => {
    const c = comites.find(c => c.id === comiteId);
    if (!c) return;
    updateComite(comiteId, { membres: c.membres.map((m, i) => i === idx ? { ...m, ...patch } : m) });
  };

  const [showOverview, setShowOverview] = useState(true);
  const [comiteTab, setComiteTab] = useState<"config" | "participants" | "reunions" | "documents">("config");
  const active = comites.find(c => c.id === activeComite);
  const inputBase = "w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-white";

  const COMITE_TABS = [
    { id: "config" as const, label: "Config" },
    { id: "participants" as const, label: "Participants" },
    { id: "reunions" as const, label: "Réunions" },
    { id: "documents" as const, label: "Documents" },
  ];

  const totalParticipants = comites.reduce((sum, c) => sum + c.membres.length, 0);

  return (
    <div className="space-y-3">
      {/* Header — style Personnel/Bot */}
      <div className={cn("relative bg-gradient-to-r rounded-xl overflow-hidden", headerGradient)}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-4 p-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">Comités — {deptLabel}</h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{comites.length} comité{comites.length !== 1 ? "s" : ""}</span>
            </div>
            <p className="text-xs text-white/80">
              Créez et gérez les comités du département. Participants internes et externes, Conférences AI et minutes automatiques.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
      {/* Sidebar — Vue d'ensemble + liste des comités */}
      <div className="w-[180px] shrink-0 space-y-1">
        {/* Vue d'ensemble */}
        <button onClick={() => { setShowOverview(true); setActiveComite(null); }} className={cn(
          "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
          showOverview && !activeComite ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
        )}>
          <div className="flex items-center gap-1.5">
            <BarChart3 className={cn("h-3.5 w-3.5", showOverview && !activeComite ? "text-blue-600" : "text-gray-400")} />
            <span className={cn("text-[10px] font-bold leading-tight", showOverview && !activeComite ? "text-blue-700" : "text-gray-700")}>Vue d'ensemble</span>
          </div>
          <div className="text-[9px] text-gray-400 ml-[20px]">{comites.length} comités</div>
        </button>

        {/* Séparateur */}
        {comites.length > 0 && <div className="border-t border-gray-100 my-1" />}

        {/* Liste comités */}
        {comites.map(c => (
          <button key={c.id} onClick={() => { setActiveComite(c.id); setShowOverview(false); setComiteTab("config"); }} className={cn(
            "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer group",
            activeComite === c.id && !showOverview ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
          )}>
            <div className="flex items-center gap-1.5">
              <span className={cn("text-[10px] font-bold flex-1 leading-tight truncate", activeComite === c.id && !showOverview ? "text-blue-700" : "text-gray-700")}>
                {c.nom || "Nouveau comité"}
              </span>
              <button onClick={e => { e.stopPropagation(); removeComite(c.id); }} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all cursor-pointer">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-gray-400">{c.membres.length} membre{c.membres.length !== 1 ? "s" : ""}</span>
              <span className="text-[9px] text-gray-300">·</span>
              <span className="text-[9px] text-gray-400">{c.frequence}</span>
            </div>
          </button>
        ))}

        {/* Bouton ajouter */}
        <button onClick={addComite} className="w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer hover:bg-gray-50 border border-dashed border-gray-200 mt-1">
          <div className="flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400">Nouveau comité</span>
          </div>
        </button>
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0 space-y-3">

          {/* Vue d'ensemble */}
          {(showOverview || !activeComite) && (<>
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Briefcase className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Comités</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-gray-900">{comites.length}</div>
                  <div className="text-[9px] text-gray-400">Total actifs</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Participants</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-gray-900">{totalParticipants}</div>
                  <div className="text-[9px] text-gray-400">Total membres</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Calendar className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Réunions</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-gray-900">{comites.filter(c => c.prochaine_reunion).length}</div>
                  <div className="text-[9px] text-gray-400">Planifiées</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Activity className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900">Taux activité</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-gray-900">{comites.length > 0 ? Math.round((comites.filter(c => c.membres.length > 0).length / comites.length) * 100) : 0}%</div>
                  <div className="text-[9px] text-gray-400">Comités actifs</div>
                </div>
              </div>
            </div>

            {/* Résumé des comités */}
            {comites.length > 0 && (
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <ListChecks className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
                  <span className="text-xs font-bold text-gray-900">Résumé des comités</span>
                </div>
                <div className="p-3 space-y-2">
                  {comites.map(c => (
                    <div key={c.id} onClick={() => { setActiveComite(c.id); setShowOverview(false); setComiteTab("config"); }} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all">
                      <div>
                        <div className="text-xs font-bold text-gray-700">{c.nom || "Sans nom"}</div>
                        <div className="text-[9px] text-gray-400">{c.responsable || "Pas de responsable"} · {c.membres.length} membres · {c.frequence}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.prochaine_reunion && <span className="text-[9px] text-blue-600 font-medium">{c.prochaine_reunion}</span>}
                        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modèles suggérés */}
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                <Sparkles className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
                <span className="text-xs font-bold text-gray-900">Modèles de comités suggérés</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {COMITES_SUGGESTED_TEMPLATES.map((t, i) => (
                  <div key={i} onClick={() => {
                    const id = `comite_${Date.now()}_${i}`;
                    const newC: Comite = { id, nom: t.nom, frequence: t.frequence, format: "Conférence AI", description: t.description, responsable: "", prochaine_reunion: "", membres: [] };
                    updateComites([...comites, newC]);
                    setActiveComite(id);
                    setShowOverview(false);
                    setComiteTab("config");
                  }} className="px-3 py-2 rounded-lg border border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all">
                    <div className="text-xs font-bold text-gray-700">{t.nom}</div>
                    <div className="text-[9px] text-gray-400">{t.description}</div>
                    <div className="text-[9px] text-blue-500 font-medium mt-1">{t.frequence}</div>
                  </div>
                ))}
              </div>
            </div>
          </>)}

          {/* Comité actif avec sous-tabs */}
          {!showOverview && active && (<>
            {/* Sous-tabs */}
            <div className="flex items-center gap-1 pb-1">
              {COMITE_TABS.map(t => (
                <button key={t.id} onClick={() => setComiteTab(t.id)} className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                  comiteTab === t.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}>{t.label}</button>
              ))}
            </div>

            {/* Tab: Config */}
            {comiteTab === "config" && (
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <Settings className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
                  <span className="text-xs font-bold text-gray-900">Configuration du comité</span>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Nom du comité</label>
                      <input className={inputBase} value={active.nom} onChange={e => updateComite(active.id, { nom: e.target.value })} placeholder="Ex: Comité stratégique, Comité SST..." />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Mandat / Objectifs</label>
                      <input className={inputBase} value={active.description} onChange={e => updateComite(active.id, { description: e.target.value })} placeholder="Mandat et objectifs du comité" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Responsable</label>
                      <input className={inputBase} value={active.responsable || ""} onChange={e => updateComite(active.id, { responsable: e.target.value })} placeholder="Nom du responsable" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Fréquence</label>
                      <select className={inputBase} value={active.frequence} onChange={e => updateComite(active.id, { frequence: e.target.value })}>
                        <option value="Hebdomadaire">Hebdomadaire</option>
                        <option value="Bimensuelle">Bimensuelle</option>
                        <option value="Mensuelle">Mensuelle</option>
                        <option value="Bimestrielle">Bimestrielle</option>
                        <option value="Trimestrielle">Trimestrielle</option>
                        <option value="Semestrielle">Semestrielle</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Format de réunion</label>
                      <select className={inputBase} value={active.format} onChange={e => updateComite(active.id, { format: e.target.value })}>
                        <option value="Conférence AI">Conférence AI</option>
                        <option value="Présentiel">Présentiel</option>
                        <option value="Hybride">Hybride</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Prochaine réunion</label>
                      <input type="date" className={inputBase} value={active.prochaine_reunion || ""} onChange={e => updateComite(active.id, { prochaine_reunion: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Participants */}
            {comiteTab === "participants" && (
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
                    <span className="text-xs font-bold text-gray-900">Participants ({active.membres.length})</span>
                  </div>
                  <button onClick={() => addMembre(active.id)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer">
                    <UserPlus className="h-3.5 w-3.5" /> Ajouter un participant
                  </button>
                </div>
                <div className="p-4">
                  {active.membres.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                      <Users className="h-6 w-6 text-gray-200 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 mb-3">Aucun participant dans ce comité</p>
                      <button onClick={() => addMembre(active.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all mx-auto">
                        <UserPlus className="h-3.5 w-3.5" /> Ajouter le premier participant
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {active.membres.map((m, idx) => (
                        <div key={idx} className={cn("rounded-lg border px-3 py-3 group transition-all", m.type === "externe" ? "border-amber-200 bg-amber-50/30" : "border-gray-200 bg-white")}>
                          <div className="grid grid-cols-5 gap-2 items-center">
                            <div>
                              <label className="text-[9px] text-gray-400 block mb-0.5">Nom</label>
                              <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.nom} onChange={e => updateMembre(active.id, idx, { nom: e.target.value })} placeholder="Nom complet" />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-400 block mb-0.5">Titre / Rôle</label>
                              <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.titre} onChange={e => updateMembre(active.id, idx, { titre: e.target.value })} placeholder="VP Finance, Directeur..." />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-400 block mb-0.5">Courriel</label>
                              <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.courriel} onChange={e => updateMembre(active.id, idx, { courriel: e.target.value })} placeholder="courriel@..." />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-400 block mb-0.5">Type</label>
                              <select className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" value={m.type} onChange={e => updateMembre(active.id, idx, { type: e.target.value as "interne" | "externe" })}>
                                <option value="interne">Interne</option>
                                <option value="externe">Externe</option>
                              </select>
                            </div>
                            <div className="flex items-end">
                              <button onClick={() => removeMembre(active.id, idx)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all cursor-pointer shrink-0 pb-1">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {active.membres.some(m => m.type === "externe") && (
                    <div className="mt-3 flex items-start gap-2 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200/50">
                      <Info className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-[9px] text-amber-700 leading-relaxed">
                        Les membres externes recevront une invitation par courriel pour accéder à la plateforme en tant qu'invité et participer aux Conférences AI. Les minutes leur seront envoyées automatiquement.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Réunions */}
            {comiteTab === "reunions" && (<>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">Historique des réunions — {active.nom || "Comité"}</span>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all">
                  <Plus className="h-3.5 w-3.5" /> Planifier une réunion
                </button>
              </div>
              <div className="space-y-2">
                {COMITE_MOCK_REUNIONS.map((r, i) => (
                  <div key={i} className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[80px]">
                          <div className="text-xs font-bold text-gray-700">{r.date}</div>
                          <div className="text-[9px] text-gray-400">{r.duree}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-700">{r.sujet}</div>
                          <div className="text-[9px] text-gray-400">{r.type} · {r.participants} participants</div>
                        </div>
                      </div>
                      <span className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0",
                        r.statut_pv === "Approuvé" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      )}>{r.statut_pv}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <p className="text-[9px] text-blue-700">Brain Team peut générer les procès-verbaux automatiquement à partir des transcriptions de Conférence AI.</p>
              </div>
            </>)}

            {/* Tab: Documents */}
            {comiteTab === "documents" && (<>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">Documents — {active.nom || "Comité"}</span>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all">
                  <Sparkles className="h-3.5 w-3.5" /> Générer avec AI
                </button>
              </div>
              <div className="space-y-2">
                {COMITE_MOCK_DOCUMENTS.map((d, i) => (
                  <div key={i} className="px-4 py-3 rounded-xl border border-gray-200 shadow-sm bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-gray-700">{d.titre}</div>
                        <div className="text-[9px] text-gray-400">{d.type} · Dernière MAJ: {d.maj}</div>
                      </div>
                      <span className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0",
                        d.statut === "Actif" || d.statut === "Approuvé" ? "bg-emerald-50 text-emerald-700" :
                        d.statut === "En révision" ? "bg-amber-50 text-amber-700" :
                        "bg-gray-100 text-gray-500"
                      )}>{d.statut}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>)}

            {/* Save */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[9px] text-gray-400">{dirty ? "Modifications non sauvegardées" : "À jour"}</span>
              <button onClick={onSave} disabled={saving || !dirty} className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all",
                dirty ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </>)}

          {/* Empty state quand pas de comités et overview */}
          {!showOverview && !active && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-8 w-8 text-gray-200 mb-3" />
              <p className="text-xs text-gray-400 mb-2">Sélectionnez un comité ou créez-en un nouveau</p>
              <button onClick={addComite} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all">
                <Plus className="h-3.5 w-3.5" /> Créer un premier comité
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
  );
}

// ══════════════════════════════════════════
// DATA ROOM — Sections Opérationnelles (DS-01) + Documents + Templates
// ══════════════════════════════════════════

// Sections Opérationnelles (DS-01) — Nav quotidienne par département
// Pattern: chaque section = une vue interactive avec son propre pattern visuel
const OPERATIONAL_SECTIONS: Record<string, { id: string; label: string; description: string; patternVisuel: string; icon: React.ElementType; pertinence: Record<string, string> }[]> = {
  CEOB: [
    { id: "op_dashboard_consolide", label: "Dashboard consolide", description: "Synthese interdepartementale, 4 KPIs (Chantiers/Projets/Missions/Taches)", patternVisuel: "Grille widgets modulaire", icon: BarChart3, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_decisions_approbations", label: "Decisions & Approbations", description: "Signatures, depassements budget, approbations RH, goulots", patternVisuel: "Boite reception (Triage)", icon: CheckCircle2, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_suivi_okr", label: "Suivi OKR & Initiatives", description: "Execution vision, Objectifs Resultats Cles, initiatives bloquees", patternVisuel: "Arbre progression + jauges", icon: Target, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_comite_direction", label: "Comite de Direction", description: "Ordres du jour, suivi actions reunions hebdo/mensuelles", patternVisuel: "Editeur collaboratif + taches", icon: Users, pertinence: { T1: "X", T2: "X", T3: "C", T4: "C", T5: "C" } },
    { id: "op_gouvernance_ca", label: "Gouvernance (CA & Investisseurs)", description: "Portail securise, communication CA, bailleurs de fonds", patternVisuel: "Coffre-fort (Dataroom)", icon: Shield, pertinence: { T1: "X", T2: "X", T3: "O", T4: "C", T5: "C" } },
    { id: "op_pipeline_sortie", label: "Pipeline Sortie (M&A)", description: "Confidentiel, releve/vente entreprise, acquisition", patternVisuel: "Kanban confidentiel", icon: Briefcase, pertinence: { T1: "X", T2: "X", T3: "X", T4: "O", T5: "C" } },
  ],
  CROB: [
    { id: "op_pipeline_ventes", label: "Pipeline de ventes", description: "Kanban entonnoir (Prospection > Qualification > Proposition > Negociation > Cloture)", patternVisuel: "Kanban", icon: TrendingUp, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_contacts_comptes", label: "Contacts & Comptes", description: "Carnet centralise, historique interactions, decideurs", patternVisuel: "Tableau interactif", icon: Users, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_soumissions_cpq", label: "Soumissions & Contrats (CPQ)", description: "Devis, escomptes, statuts (Draft/Sent/Signed)", patternVisuel: "Liste documents + statuts", icon: FileText, pertinence: { T1: "O", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_activites_relances", label: "Activites & Relances", description: "Taches quotidiennes, appels, courriels, activites en retard", patternVisuel: "To-Do list", icon: ListChecks, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_previsions", label: "Previsions (Forecasting)", description: "Projection ventes, Commit vs Best Case", patternVisuel: "Graphique barres empilees", icon: BarChart3, pertinence: { T1: "O", T2: "O", T3: "C", T4: "C", T5: "C" } },
    { id: "op_territoires_quotas", label: "Territoires & Quotas", description: "Assignation geo/sectorielle, objectifs financiers, carte chaleur", patternVisuel: "Carte + matrice", icon: MapPin, pertinence: { T1: "X", T2: "X", T3: "O", T4: "C", T5: "C" } },
    { id: "op_performance_equipe", label: "Performance equipe", description: "Leaderboard representants, volume activites, coaching", patternVisuel: "Leaderboard dashboard", icon: Activity, pertinence: { T1: "X", T2: "O", T3: "C", T4: "C", T5: "C" } },
    { id: "op_remuneration_comm", label: "Remuneration & Commissions", description: "Calcul primes/commissions sur ventes cloturees", patternVisuel: "Tableau financier", icon: DollarSign, pertinence: { T1: "X", T2: "X", T3: "C", T4: "C", T5: "C" } },
    { id: "op_partenaires_prm", label: "Partenaires & Canaux (PRM)", description: "Ventes indirectes, distributeurs, affilies", patternVisuel: "Dashboard reseau", icon: Users, pertinence: { T1: "X", T2: "X", T3: "O", T4: "C", T5: "C" } },
  ],
  CFOB: [
    { id: "op_grand_livre", label: "Grand-livre general", description: "Comptes avec soldes, historique transactions", patternVisuel: "Tableau hierarchique", icon: FileText, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_facturation_ar", label: "Facturation & Comptes clients (AR)", description: "Factures, encaissements, clients retard, relances", patternVisuel: "Tableau vieillissement", icon: TrendingUp, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_depenses_ap", label: "Depenses & Fournisseurs (AP)", description: "Factures fournisseurs, paiements sortants", patternVisuel: "Workflow approbation", icon: Settings, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_tresorerie", label: "Tresorerie & Conciliation", description: "Rapprochement comptable vs releves bancaires", patternVisuel: "Split view (Livre vs Releve)", icon: DollarSign, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_previsions_90j", label: "Previsions tresorerie (90j)", description: "Simulation flux caisse, scenarios Pire/Meilleur", patternVisuel: "Graphique lineaire + zone danger", icon: BarChart3, pertinence: { T1: "X", T2: "O", T3: "C", T4: "C", T5: "C" } },
    { id: "op_paie_remises", label: "Paie & Remises gouvernementales", description: "Salaires, DAS, remises ARC/RQ", patternVisuel: "Registre paie", icon: DollarSign, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_taxes_tps_tvq", label: "Declarations taxes (TPS/TVQ)", description: "Calcul/production declarations taxes Quebec", patternVisuel: "Formulaire fiscal", icon: Shield, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_budgets_dept", label: "Budgets par departement", description: "Depenses reelles vs budgets, variances, jauges", patternVisuel: "Jauges + barres", icon: BarChart3, pertinence: { T1: "X", T2: "O", T3: "C", T4: "C", T5: "C" } },
    { id: "op_immobilisations", label: "Immobilisations", description: "Actifs corporels, amortissement, valeur nette", patternVisuel: "Registre tabulaire", icon: Database, pertinence: { T1: "X", T2: "X", T3: "O", T4: "C", T5: "C" } },
    { id: "op_financement", label: "Financement & Marges", description: "Lignes credit, emprunts, ratios", patternVisuel: "Dashboard ratios", icon: DollarSign, pertinence: { T1: "X", T2: "O", T3: "C", T4: "C", T5: "C" } },
  ],
  CMOB: [
    { id: "op_calendrier_campagnes", label: "Calendrier de campagnes", description: "Planification contenu, lancements, orchestration", patternVisuel: "Calendrier visuel + Gantt", icon: Calendar, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_generation_leads", label: "Generation de leads (MQL)", description: "Entonnoir acquisition, formulaires, qualification", patternVisuel: "Graphique funnel", icon: TrendingUp, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_infolettres", label: "Infolettres & Automatisation", description: "Emails masse, sequences automatisees, nurturing", patternVisuel: "Editeur workflow Drag&Drop", icon: Zap, pertinence: { T1: "O", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_medias_sociaux", label: "Publications & Medias sociaux", description: "Presence organique, grille programmation, croissance", patternVisuel: "Calendrier posts + flux", icon: MessageSquare, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_budget_mkt_roi", label: "Budget Marketing & ROI", description: "Ad spend, ROI campagnes, consommation budget", patternVisuel: "Tableau bord financier mkt", icon: DollarSign, pertinence: { T1: "X", T2: "O", T3: "C", T4: "C", T5: "C" } },
  ],
  CSOB: [
    { id: "op_radar_concurrentiel", label: "Radar concurrentiel", description: "Veille, annonces concurrence, nouveaux entrants", patternVisuel: "Flux actualites + cartes profil", icon: Search, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_bureau_gestion_strat", label: "Bureau gestion strategique", description: "Plans 3-5 ans vers initiatives trimestrielles mesurables", patternVisuel: "Gantt strategique + arbres", icon: Star, pertinence: { T1: "X", T2: "X", T3: "C", T4: "C", T5: "C" } },
    { id: "op_pipeline_ma", label: "Pipeline M&A", description: "Cibles acquisition, integration post-fusion", patternVisuel: "Kanban specialise M&A", icon: Briefcase, pertinence: { T1: "X", T2: "X", T3: "X", T4: "O", T5: "C" } },
  ],
  COOB: [
    { id: "op_gestion_stocks", label: "Gestion des stocks", description: "Inventaire, niveaux reappro, couts stock", patternVisuel: "Dashboard logistique + jauges", icon: Package, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_achats_po", label: "Achats & Bons de commande (PO)", description: "Approvisionnement, PO, receptions, perf fournisseur", patternVisuel: "Liste docs + statuts livraison", icon: Briefcase, pertinence: { T1: "O", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_commandes_clients", label: "Gestion commandes clients", description: "Reception/traitement commandes avant expedition", patternVisuel: "Triage Queue", icon: ListChecks, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_logistique_expedition", label: "Logistique & Expedition", description: "Transport, etiquettes, suivi transporteurs, couts fret", patternVisuel: "Carte suivi logistique", icon: Package, pertinence: { T1: "O", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_qualite_nc", label: "Qualite & Non-conformites", description: "Incidents, defauts, retours clients (RMA)", patternVisuel: "Registre tickets Helpdesk", icon: Bug, pertinence: { T1: "X", T2: "X", T3: "C", T4: "C", T5: "C" } },
    { id: "op_suivi_bpm", label: "Suivi processus (BPM)", description: "Cartographie workflows, amelioration continue, Kaizen", patternVisuel: "Diagramme flux interactif", icon: GitBranch, pertinence: { T1: "X", T2: "X", T3: "O", T4: "C", T5: "C" } },
    { id: "op_flotte", label: "Gestion de la flotte", description: "Vehicules, maintenance, essence, telemetrie", patternVisuel: "Carte telemetrie temps reel", icon: Truck, pertinence: { T1: "X", T2: "X", T3: "O", T4: "C", T5: "C" } },
  ],
  CTOB: [
    { id: "op_sprints_backlog", label: "Sprints & Backlog", description: "Gestion sprints, CI/CD pipeline, velocite equipe", patternVisuel: "Kanban complexe", icon: ListChecks, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_uptime_infra", label: "Uptime & Infrastructure", description: "Sante serveurs temps reel, disponibilite services", patternVisuel: "Jauges monitoring temps reel", icon: Activity, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_dette_technique", label: "Registre dette technique", description: "Documentation compromis code, matrice impact vs effort", patternVisuel: "Matrice risque + registre", icon: Bug, pertinence: { T1: "X", T2: "X", T3: "C", T4: "C", T5: "C" } },
    { id: "op_itsm_incidents", label: "Gestion incidents (ITSM)", description: "Helpdesk interne, pannes, bugs majeurs, tickets", patternVisuel: "Console tickets", icon: Bug, pertinence: { T1: "X", T2: "O", T3: "C", T4: "C", T5: "C" } },
    { id: "op_licences_saas", label: "Gestion licences & SaaS", description: "Inventaire abonnements, Shadow IT, optimisation couts", patternVisuel: "Registre financier tabulaire", icon: DollarSign, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
  ],
  CPOB: [
    { id: "op_bons_travail", label: "Bons de travail", description: "Suivi etats, % complete, priorites jour (Hot list)", patternVisuel: "Kanban industriel", icon: ListChecks, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_bom_routages", label: "Nomenclatures (BOM) & Routages", description: "Recette produit, materiaux, sequence operations, cout revient", patternVisuel: "Arborescence multiniveau", icon: GitBranch, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_planification_ordo", label: "Planification & Ordonnancement", description: "Calendrier usine, assignation machines, Gantt", patternVisuel: "Gantt interactif", icon: Calendar, pertinence: { T1: "X", T2: "X", T3: "C", T4: "C", T5: "C" } },
    { id: "op_temps_plancher", label: "Saisie temps de plancher", description: "Operateurs temps reel par tache, mode kiosk", patternVisuel: "Interface tablette kiosk", icon: Clock, pertinence: { T1: "X", T2: "X", T3: "C", T4: "C", T5: "C" } },
    { id: "op_maintenance_cmms", label: "Maintenance equipements (CMMS)", description: "Preventive/corrective, pieces rechange, historique", patternVisuel: "Calendrier + registre", icon: Settings, pertinence: { T1: "X", T2: "X", T3: "O", T4: "C", T5: "C" } },
    { id: "op_oee_trs", label: "Efficacite globale (OEE/TRS)", description: "Disponibilite/Performance/Qualite, telemetrie", patternVisuel: "Telemetrie industrielle", icon: Activity, pertinence: { T1: "X", T2: "X", T3: "X", T4: "O", T5: "C" } },
  ],
  CHROB: [
    { id: "op_dossiers_employes", label: "Dossiers employes", description: "Liste actifs/inactifs, profil individuel, historique", patternVisuel: "Grille profils + fiches", icon: Users, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_recrutement_ats", label: "Recrutement & Entrevues (ATS)", description: "Pipeline candidats par poste, evaluations", patternVisuel: "Kanban recrutement", icon: UserPlus, pertinence: { T1: "X", T2: "O", T3: "C", T4: "C", T5: "C" } },
    { id: "op_temps_presences", label: "Suivi temps & Presences", description: "Feuilles temps, retards, heures sup, approbations", patternVisuel: "Grille calendrier + approbation", icon: Clock, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_conges", label: "Demandes de conges", description: "Libre-service vacances/maladies, soldes, jauges", patternVisuel: "Calendrier visuel + jauges", icon: Calendar, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_onboarding", label: "Onboarding / Offboarding", description: "Integration recrues, departs, taches interdepartementales", patternVisuel: "Progress bars + checklists", icon: ListChecks, pertinence: { T1: "X", T2: "O", T3: "C", T4: "C", T5: "C" } },
    { id: "op_evaluations", label: "Evaluations performance", description: "Objectifs, evaluations annuelles, developpement", patternVisuel: "Formulaires + Radar", icon: Star, pertinence: { T1: "X", T2: "X", T3: "C", T4: "C", T5: "C" } },
    { id: "op_climat", label: "Climat & Engagement", description: "Pulse surveys, moral, risques epuisement", patternVisuel: "Heatmaps + tendances", icon: Heart, pertinence: { T1: "X", T2: "X", T3: "C", T4: "C", T5: "C" } },
    { id: "op_equite_sst", label: "Equite & SST (CNESST)", description: "Accidents travail, prevention, equite salariale", patternVisuel: "Registres legaux", icon: Shield, pertinence: { T1: "X", T2: "X", T3: "O", T4: "C", T5: "C" } },
    { id: "op_organigramme", label: "Organigramme dynamique", description: "Hierarchie, lignes rapport, restructurations", patternVisuel: "Arbre graphique interactif", icon: GitBranch, pertinence: { T1: "X", T2: "X", T3: "C", T4: "C", T5: "C" } },
  ],
  CINOB: [
    { id: "op_portefeuille_rd", label: "Portefeuille R&D", description: "Projets innovation, stage-gates, avancement", patternVisuel: "Kanban Stage-Gate", icon: Rocket, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_temps_rsde", label: "Suivi temps & depenses RS&DE", description: "Heures/materiaux pour credits impot, documentation ARC", patternVisuel: "Grille saisie temps detaillee", icon: Clock, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_documentation_incertitudes", label: "Documentation & Incertitudes", description: "Base connaissances, hypotheses, echecs, iterations", patternVisuel: "Wiki DocForge", icon: BookOpen, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
  ],
  CLOB: [
    { id: "op_depot_contrats", label: "Depot de contrats", description: "Liste type/statut, alertes expiration 30/60/90j, CLM", patternVisuel: "Explorateur fichiers avance", icon: FolderOpen, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_registre_loi25", label: "Registre incidents Loi 25", description: "Documentation obligatoire QC, pertes donnees, avis CAI", patternVisuel: "Registre conformite strict", icon: Shield, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_registres_corp", label: "Registres corporatifs", description: "Livre minutes, PV, resolutions actionnaires", patternVisuel: "Dossier structure", icon: Database, pertinence: { T1: "X", T2: "O", T3: "C", T4: "C", T5: "C" } },
  ],
  CISOB: [
    { id: "op_gestion_vuln", label: "Gestion vulnerabilites", description: "Failles criticite, postes non-conformes, correctifs", patternVisuel: "Dashboard risques + severite", icon: Bug, pertinence: { T1: "X", T2: "X", T3: "C", T4: "C", T5: "C" } },
    { id: "op_suivi_backups", label: "Suivi sauvegardes (Backups)", description: "Jobs nocturnes, tests restauration, retentions hors-site", patternVisuel: "Grille feux circulation", icon: Database, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_phishing_formation", label: "Tests hameconnage & Formation", description: "Simulations phishing, capsules formation, rapports", patternVisuel: "Dashboard stats comportement", icon: BookOpen, pertinence: { T1: "X", T2: "X", T3: "C", T4: "C", T5: "C" } },
  ],
};

// ══════════════════════════════════════════
// DATA ROOM — Types & Interfaces
// Source: Deep Search RESULT-06 + RESULT-07
// ══════════════════════════════════════════

type DocumentLifecycleStage =
  | "creation" | "coauthoring" | "cross_review" | "approbation"
  | "publie_indexe" | "consommation" | "versioning" | "depreciation" | "reactivation";

type AssetType = "Document" | "Dashboard" | "Flow" | "Dataset" | "Media" | "Procedure";

const ASSET_TYPE_CONFIG: Record<AssetType, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  Document:  { color: "text-blue-700",   bg: "bg-blue-50",    icon: FileText,   label: "Document" },
  Dashboard: { color: "text-violet-700", bg: "bg-violet-50",  icon: BarChart3,  label: "Dashboard" },
  Flow:      { color: "text-orange-700", bg: "bg-orange-50",  icon: Zap,        label: "Flow" },
  Dataset:   { color: "text-emerald-700",bg: "bg-emerald-50", icon: Database,    label: "Dataset" },
  Media:     { color: "text-pink-700",   bg: "bg-pink-50",    icon: Palette,     label: "Média" },
  Procedure: { color: "text-teal-700",   bg: "bg-teal-50",    icon: ListChecks,  label: "Procédure" },
};

function AssetTypeBadge({ type }: { type: AssetType }) {
  const config = ASSET_TYPE_CONFIG[type] || ASSET_TYPE_CONFIG.Document;
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium", config.bg, config.color)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

const LIFECYCLE_LABELS: Record<DocumentLifecycleStage, { label: string; color: string }> = {
  creation:     { label: "Création",     color: "text-gray-500" },
  coauthoring:  { label: "Co-rédaction", color: "text-blue-600" },
  cross_review: { label: "Révision",     color: "text-amber-600" },
  approbation:  { label: "Approbation",  color: "text-orange-600" },
  publie_indexe:{ label: "Publié",       color: "text-emerald-600" },
  consommation: { label: "En usage",     color: "text-emerald-700" },
  versioning:   { label: "Versionné",    color: "text-blue-700" },
  depreciation: { label: "Déprécié",     color: "text-red-500" },
  reactivation: { label: "Réactivé",     color: "text-purple-600" },
};

interface DataRoomDoc {
  titre: string;
  type: AssetType;
  sections: number;
  frequence: string;
  createur: string;
  statut: "actif" | "brouillon" | "a_creer";
  critique: boolean;
  lifecycle?: DocumentLifecycleStage;
}

interface DataRoomCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  volume: string;
  documents: DataRoomDoc[];
}

// Sections transversales
const TRANSVERSAL_SECTIONS = [
  { id: "clients",       label: "Dossiers Clients",       icon: Users },
  { id: "employes",      label: "Dossiers Employés",      icon: User },
  { id: "fournisseurs",  label: "Dossiers Fournisseurs",  icon: Package },
] as const;

// Nomenclature REAI — Structure par chantier
const REAI_FOLDERS = [
  { id: "admin",        num: "0",  label: "Admin",              icon: Briefcase, desc: "Ententes, NDA, comptes-rendus, horodateur" },
  { id: "intrants",     num: "10", label: "Intrants",           icon: Upload,    desc: "Photos, vidéos, mesures, docs reçus" },
  { id: "design",       num: "20", label: "Design/Calculs/Simul", icon: PenLine, desc: "Dessins 2D/3D, cahier des charges, VSM" },
  { id: "fournisseurs", num: "30", label: "Fournisseurs",       icon: ShoppingBag, desc: "Vidéos fournisseurs, soumissions" },
  { id: "livrables",    num: "40", label: "Livrables",          icon: FileText,  desc: "Rapports finaux, documentation livrée" },
] as const;

// Documents par département (bibliothèque)
// ══════════════════════════════════════════

const DATA_ROOM_SECTIONS: Record<string, DataRoomCategory[]> = {
  CEOB: [
    { id: "plans_strategiques", label: "Plans strategiques", icon: Target, volume: "~15 docs/an", documents: [
      { titre: "Plan strategique annuel 2024-2027", type: "Document", sections: 12, frequence: "Annuel", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "OKRs annuels et trimestriels", type: "Document", sections: 8, frequence: "Trimestriel", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "Blueprint d'entreprise (plan vivant)", type: "Document", sections: 16, frequence: "Continu", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "Declaration de vision et mission", type: "Document", sections: 4, frequence: "Annuel", createur: "CarlOS", statut: "actif", critique: false },
      { titre: "Roadmap produit 18 mois", type: "Document", sections: 6, frequence: "Semestriel", createur: "Tim", statut: "brouillon", critique: false },
      { titre: "Communications internes (memos)", type: "Document", sections: 2, frequence: "Hebdomadaire", createur: "CarlOS", statut: "actif", critique: false },
      { titre: "Notes de reflexion CEO", type: "Document", sections: 1, frequence: "Ad hoc", createur: "CarlOS", statut: "actif", critique: false },
    ]},
    { id: "gouvernance", label: "Gouvernance corporative", icon: Building2, volume: "~20 docs/an", documents: [
      { titre: "Proces-verbaux de CA", type: "Document", sections: 8, frequence: "Mensuel", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "Charte de gouvernance", type: "Document", sections: 10, frequence: "Annuel", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "Registre des decisions (D-001 a D-109)", type: "Dataset", sections: 1, frequence: "Continu", createur: "CarlOS", statut: "actif", critique: false },
      { titre: "Resolutions du CA", type: "Document", sections: 4, frequence: "Mensuel", createur: "Loulou", statut: "actif", critique: false },
      { titre: "Politique de delegation d'autorite", type: "Document", sections: 5, frequence: "Annuel", createur: "CarlOS", statut: "a_creer", critique: false },
      { titre: "Ordres du jour CA", type: "Document", sections: 3, frequence: "Mensuel", createur: "CarlOS", statut: "actif", critique: false },
    ]},
    { id: "rapports_direction", label: "Tableaux de bord et rapports", icon: BarChart3, volume: "~30 docs/an", documents: [
      { titre: "Dashboard executif VITAAFAST", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "Rapport trimestriel CEO aux actionnaires", type: "Document", sections: 6, frequence: "Trimestriel", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "Dashboard KPI direction (12 departements)", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "CarlOS", statut: "brouillon", critique: false },
      { titre: "Mises a jour OKRs mensuelles", type: "Document", sections: 4, frequence: "Mensuel", createur: "CarlOS", statut: "actif", critique: false },
      { titre: "Rapport de sante organisationnelle", type: "Document", sections: 8, frequence: "Trimestriel", createur: "CarlOS", statut: "a_creer", critique: false },
    ]},
    { id: "decisions_approbations", label: "Decisions & Approbations", icon: CheckCircle2, volume: "~60 docs/an", documents: [
      { titre: "Registre des approbations (depassements budget)", type: "Dataset", sections: 1, frequence: "Continu", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "Ordres du jour comite de direction", type: "Document", sections: 4, frequence: "Hebdomadaire", createur: "CarlOS", statut: "actif", critique: false },
      { titre: "Comptes rendus de comite executif", type: "Document", sections: 6, frequence: "Hebdomadaire", createur: "CarlOS", statut: "actif", critique: false },
      { titre: "Matrice de delegation d'autorite", type: "Document", sections: 5, frequence: "Annuel", createur: "CarlOS", statut: "brouillon", critique: true },
      { titre: "Suivi des actions decidees (tracker)", type: "Dashboard", sections: 1, frequence: "Continu", createur: "CarlOS", statut: "actif", critique: false },
    ]},
    { id: "relations_investisseurs", label: "Relations investisseurs & CA", icon: Briefcase, volume: "~10 docs/an", documents: [
      { titre: "Pitch deck investisseurs (version courante)", type: "Media", sections: 15, frequence: "Semestriel", createur: "CarlOS", statut: "actif", critique: true },
      { titre: "Term sheets et lettres d'intention", type: "Document", sections: 4, frequence: "Par levee", createur: "Loulou", statut: "a_creer", critique: true },
      { titre: "Rapports trimestriels aux investisseurs", type: "Document", sections: 6, frequence: "Trimestriel", createur: "Frank", statut: "a_creer", critique: false },
      { titre: "Valorisation entreprise (derniere)", type: "Document", sections: 8, frequence: "Annuel", createur: "Frank", statut: "a_creer", critique: true },
    ]},
    { id: "communications_internes", label: "Communications internes", icon: MessageSquare, volume: "~100 docs/an", documents: [
      { titre: "Memos du CEO (communications internes)", type: "Document", sections: 2, frequence: "Hebdomadaire", createur: "CarlOS", statut: "actif", critique: false },
      { titre: "Newsletter interne mensuelle", type: "Document", sections: 4, frequence: "Mensuel", createur: "Mathilde", statut: "brouillon", critique: false },
      { titre: "Discours et allocutions CEO", type: "Document", sections: 3, frequence: "Ad hoc", createur: "CarlOS", statut: "actif", critique: false },
      { titre: "FAQ employes (questions recurrentes)", type: "Document", sections: 8, frequence: "Continu", createur: "Helene", statut: "a_creer", critique: false },
    ]},
  ],
  CROB: [
    { id: "propositions_ventes", label: "Propositions commerciales", icon: FileText, volume: "~150 docs/an", documents: [
      { titre: "Devis et soumissions clients", type: "Document", sections: 8, frequence: "Quotidien", createur: "Rich", statut: "actif", critique: true },
      { titre: "Grille tarifaire 2026", type: "Document", sections: 4, frequence: "Annuel", createur: "Rich", statut: "actif", critique: false },
      { titre: "Pitch decks par segment", type: "Media", sections: 6, frequence: "Trimestriel", createur: "Rich", statut: "actif", critique: false },
      { titre: "Scripts de vente et objections", type: "Procedure", sections: 5, frequence: "Mensuel", createur: "Rich", statut: "brouillon", critique: false },
      { titre: "Temoignages clients et etudes de cas", type: "Document", sections: 4, frequence: "Mensuel", createur: "Rich", statut: "actif", critique: false },
    ]},
    { id: "contrats_clients", label: "Contrats clients", icon: Shield, volume: "~80 docs/an", documents: [
      { titre: "Contrats clients signes (registre)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Rich", statut: "actif", critique: true },
      { titre: "MSA (Master Service Agreement)", type: "Document", sections: 12, frequence: "Par client", createur: "Loulou", statut: "actif", critique: true },
      { titre: "SOW (Statement of Work)", type: "Document", sections: 8, frequence: "Par projet", createur: "Rich", statut: "actif", critique: true },
      { titre: "NDA standard bilingue", type: "Document", sections: 4, frequence: "Par client", createur: "Loulou", statut: "actif", critique: false },
    ]},
    { id: "pipeline_forecasts", label: "Pipeline et previsions", icon: TrendingUp, volume: "~50 docs/an", documents: [
      { titre: "Previsions de ventes trimestrielles", type: "Dashboard", sections: 1, frequence: "Trimestriel", createur: "Rich", statut: "actif", critique: true },
      { titre: "Pipeline CRM temps reel", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Rich", statut: "actif", critique: false },
      { titre: "Analyse win/loss par segment", type: "Document", sections: 6, frequence: "Mensuel", createur: "Rich", statut: "brouillon", critique: false },
      { titre: "Rapport conversion par source", type: "Dashboard", sections: 1, frequence: "Mensuel", createur: "Rich", statut: "a_creer", critique: false },
      { titre: "Suivi des leads qualifies", type: "Dataset", sections: 1, frequence: "Continu", createur: "Rich", statut: "actif", critique: false },
    ]},
    { id: "performance_ventes", label: "Performance equipe ventes", icon: Activity, volume: "~50 docs/an", documents: [
      { titre: "Leaderboard representants (classement)", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Rich", statut: "actif", critique: false },
      { titre: "Plan de compensation et commissions", type: "Document", sections: 6, frequence: "Annuel", createur: "Rich", statut: "actif", critique: true },
      { titre: "Quotas par territoire et segment", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Rich", statut: "actif", critique: false },
      { titre: "Rapports coaching individuel (1:1)", type: "Document", sections: 3, frequence: "Mensuel", createur: "Rich", statut: "brouillon", critique: false },
    ]},
    { id: "scripts_formation", label: "Scripts & formation ventes", icon: BookOpen, volume: "~20 docs/an", documents: [
      { titre: "Scripts appels a froid (cold call)", type: "Procedure", sections: 4, frequence: "Trimestriel", createur: "Rich", statut: "actif", critique: false },
      { titre: "Playbook de vente consultative", type: "Procedure", sections: 8, frequence: "Semestriel", createur: "Rich", statut: "brouillon", critique: true },
      { titre: "FAQ objections clients (rebuttals)", type: "Document", sections: 6, frequence: "Mensuel", createur: "Rich", statut: "actif", critique: false },
      { titre: "Programme onboarding nouveaux reps", type: "Procedure", sections: 10, frequence: "Par embauche", createur: "Helene", statut: "a_creer", critique: false },
    ]},
    { id: "partenaires_canaux", label: "Partenaires & canaux", icon: Users, volume: "~15 docs/an", documents: [
      { titre: "Ententes revendeurs et distributeurs", type: "Document", sections: 6, frequence: "Par partenaire", createur: "Rich", statut: "a_creer", critique: true },
      { titre: "Programme d'affiliation B2B", type: "Document", sections: 5, frequence: "Annuel", createur: "Rich", statut: "a_creer", critique: false },
      { titre: "Suivi performance canaux indirects", type: "Dashboard", sections: 1, frequence: "Mensuel", createur: "Rich", statut: "a_creer", critique: false },
    ]},
  ],
  CFOB: [
    { id: "etats_financiers", label: "Etats financiers", icon: DollarSign, volume: "~100 docs/an", documents: [
      { titre: "Etats des flux de tresorerie", type: "Dashboard", sections: 1, frequence: "Mensuel", createur: "Frank", statut: "actif", critique: true },
      { titre: "Bilans annuels certifies", type: "Document", sections: 8, frequence: "Annuel", createur: "Frank", statut: "actif", critique: true },
      { titre: "Etats des resultats mensuels", type: "Document", sections: 6, frequence: "Mensuel", createur: "Frank", statut: "actif", critique: false },
      { titre: "Conciliations bancaires", type: "Document", sections: 2, frequence: "Mensuel", createur: "Frank", statut: "actif", critique: false },
    ]},
    { id: "budgets_previsions", label: "Budgets et allocations", icon: BarChart3, volume: "~40 docs/an", documents: [
      { titre: "Budgets globaux annuels", type: "Document", sections: 10, frequence: "Annuel", createur: "Frank", statut: "actif", critique: true },
      { titre: "Budgets departementaux detailles", type: "Dashboard", sections: 1, frequence: "Mensuel", createur: "Frank", statut: "actif", critique: false },
      { titre: "Scenarios pessimiste/realiste/optimiste", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Frank", statut: "brouillon", critique: false },
      { titre: "Notes de frais et depenses", type: "Dataset", sections: 1, frequence: "Quotidien", createur: "Frank", statut: "actif", critique: false },
    ]},
    { id: "fiscalite_audit", label: "Fiscalite et audits", icon: Shield, volume: "~20 docs/an", documents: [
      { titre: "Rapports d'audit annuels", type: "Document", sections: 8, frequence: "Annuel", createur: "Frank", statut: "actif", critique: true },
      { titre: "Declarations fiscales (TPS/TVQ, T2)", type: "Document", sections: 6, frequence: "Trimestriel", createur: "Frank", statut: "actif", critique: true },
      { titre: "Acomptes provisionnels et calculs", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Frank", statut: "actif", critique: false },
      { titre: "Rapports TPS/TVQ mensuels", type: "Document", sections: 3, frequence: "Mensuel", createur: "Frank", statut: "actif", critique: false },
    ]},
    { id: "comptes_clients_ar", label: "Comptes clients (AR)", icon: TrendingUp, volume: "~200 docs/an", documents: [
      { titre: "Registre factures clients (aging)", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Frank", statut: "actif", critique: true },
      { titre: "Sequences de relance automatisees", type: "Procedure", sections: 4, frequence: "Continu", createur: "Frank", statut: "actif", critique: false },
      { titre: "Rapports encaissements mensuels", type: "Document", sections: 3, frequence: "Mensuel", createur: "Frank", statut: "actif", critique: false },
      { titre: "Politique de credit et conditions paiement", type: "Document", sections: 5, frequence: "Annuel", createur: "Frank", statut: "brouillon", critique: true },
    ]},
    { id: "comptes_fournisseurs_ap", label: "Comptes fournisseurs (AP)", icon: Settings, volume: "~300 docs/an", documents: [
      { titre: "Bons de commande (PO) actifs", type: "Dataset", sections: 1, frequence: "Continu", createur: "Frank", statut: "actif", critique: false },
      { titre: "Workflow approbation depenses", type: "Procedure", sections: 5, frequence: "Continu", createur: "Frank", statut: "actif", critique: true },
      { titre: "Registre fournisseurs approuves", type: "Dataset", sections: 1, frequence: "Continu", createur: "Olivier", statut: "actif", critique: false },
      { titre: "Rapports echeancier paiements", type: "Document", sections: 3, frequence: "Hebdomadaire", createur: "Frank", statut: "actif", critique: false },
    ]},
    { id: "paie_remises", label: "Paie & remises gouvernementales", icon: DollarSign, volume: "~50 docs/an", documents: [
      { titre: "Registre de paie (tous employes)", type: "Dataset", sections: 1, frequence: "Bimensuel", createur: "Frank", statut: "actif", critique: true },
      { titre: "Remises DAS (ARC/Revenu Quebec)", type: "Document", sections: 4, frequence: "Mensuel", createur: "Frank", statut: "actif", critique: true },
      { titre: "Feuillets T4/Releve 1 annuels", type: "Document", sections: 2, frequence: "Annuel", createur: "Frank", statut: "actif", critique: false },
      { titre: "Registre avantages sociaux", type: "Dataset", sections: 1, frequence: "Continu", createur: "Helene", statut: "brouillon", critique: false },
    ]},
  ],
  CMOB: [
    { id: "plans_campagnes", label: "Plans et campagnes", icon: Rocket, volume: "~40 docs/an", documents: [
      { titre: "Brand guidelines et charte graphique", type: "Media", sections: 8, frequence: "Annuel", createur: "Mathilde", statut: "actif", critique: true },
      { titre: "Plan marketing annuel 2026", type: "Document", sections: 10, frequence: "Annuel", createur: "Mathilde", statut: "actif", critique: true },
      { titre: "Calendrier editorial et contenus", type: "Document", sections: 4, frequence: "Mensuel", createur: "Mathilde", statut: "actif", critique: false },
      { titre: "Briefs creatifs par campagne", type: "Document", sections: 3, frequence: "Mensuel", createur: "Mathilde", statut: "actif", critique: false },
      { titre: "Budget campagnes globales", type: "Document", sections: 6, frequence: "Trimestriel", createur: "Mathilde", statut: "brouillon", critique: true },
    ]},
    { id: "analyses_personas", label: "Analyses et personas", icon: Search, volume: "~25 docs/an", documents: [
      { titre: "Etude de positionnement concurrentiel", type: "Document", sections: 8, frequence: "Semestriel", createur: "Mathilde", statut: "actif", critique: true },
      { titre: "Personas ICP detailles", type: "Document", sections: 6, frequence: "Semestriel", createur: "Mathilde", statut: "actif", critique: true },
      { titre: "Dashboard acquisition (ROAS, CPC)", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Mathilde", statut: "actif", critique: false },
      { titre: "Rapport ROI campagnes", type: "Document", sections: 6, frequence: "Mensuel", createur: "Mathilde", statut: "a_creer", critique: false },
      { titre: "Analyses concurrentielles rapides", type: "Document", sections: 4, frequence: "Mensuel", createur: "Mathilde", statut: "actif", critique: false },
    ]},
    { id: "contenu_social", label: "Contenu & medias sociaux", icon: MessageSquare, volume: "~200 docs/an", documents: [
      { titre: "Calendrier editorial (6 mois)", type: "Document", sections: 4, frequence: "Mensuel", createur: "Mathilde", statut: "actif", critique: false },
      { titre: "Grille de programmation reseaux sociaux", type: "Dataset", sections: 1, frequence: "Hebdomadaire", createur: "Mathilde", statut: "actif", critique: false },
      { titre: "Banque de visuels et creations", type: "Media", sections: 1, frequence: "Continu", createur: "Mathilde", statut: "actif", critique: false },
      { titre: "Rapports engagement social mensuel", type: "Dashboard", sections: 1, frequence: "Mensuel", createur: "Mathilde", statut: "brouillon", critique: false },
    ]},
    { id: "assets_marque", label: "Assets de marque", icon: Palette, volume: "~10 docs/an", documents: [
      { titre: "Charte graphique complete (logo, couleurs, typo)", type: "Media", sections: 8, frequence: "Annuel", createur: "Mathilde", statut: "actif", critique: true },
      { titre: "Gabarits presentations corporatives", type: "Media", sections: 4, frequence: "Annuel", createur: "Mathilde", statut: "actif", critique: false },
      { titre: "Kit media (communiques, photos officielles)", type: "Media", sections: 3, frequence: "Semestriel", createur: "Mathilde", statut: "brouillon", critique: false },
      { titre: "Guide de ton et voix de marque", type: "Document", sections: 6, frequence: "Annuel", createur: "Mathilde", statut: "a_creer", critique: true },
    ]},
    { id: "automatisation_mkt", label: "Automatisation marketing", icon: Zap, volume: "~30 docs/an", documents: [
      { titre: "Sequences email nurturing (par segment)", type: "Procedure", sections: 5, frequence: "Trimestriel", createur: "Mathilde", statut: "actif", critique: false },
      { titre: "Workflows d'automation marketing", type: "Procedure", sections: 8, frequence: "Mensuel", createur: "Mathilde", statut: "brouillon", critique: false },
      { titre: "Dashboard inbound leads (MQL)", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Mathilde", statut: "a_creer", critique: true },
      { titre: "Rapports performance email (open/click)", type: "Document", sections: 3, frequence: "Mensuel", createur: "Mathilde", statut: "actif", critique: false },
    ]},
  ],
  CSOB: [
    { id: "analyses_scenarios", label: "Analyses et scenarios", icon: Eye, volume: "~10 docs/an", documents: [
      { titre: "Business Model Canvas (BMC)", type: "Document", sections: 9, frequence: "Semestriel", createur: "Simone", statut: "actif", critique: true },
      { titre: "Plans d'expansion geographique", type: "Document", sections: 6, frequence: "Annuel", createur: "Simone", statut: "brouillon", critique: true },
      { titre: "Scenarios de crise macroeconomique", type: "Document", sections: 8, frequence: "Annuel", createur: "Simone", statut: "a_creer", critique: true },
      { titre: "Analyses SWOT approfondies", type: "Document", sections: 8, frequence: "Annuel", createur: "Simone", statut: "actif", critique: true },
      { titre: "Benchmarks concurrentiels", type: "Document", sections: 10, frequence: "Trimestriel", createur: "Simone", statut: "actif", critique: true },
    ]},
    { id: "veille_strat", label: "Veille et tendances", icon: Sparkles, volume: "~50 docs/an", documents: [
      { titre: "Notes de veille hebdomadaire", type: "Document", sections: 2, frequence: "Hebdomadaire", createur: "Simone", statut: "actif", critique: false },
      { titre: "Syntheses de tendances sectorielles", type: "Document", sections: 4, frequence: "Mensuel", createur: "Simone", statut: "actif", critique: false },
      { titre: "Mises a jour PESTEL", type: "Document", sections: 6, frequence: "Trimestriel", createur: "Simone", statut: "a_creer", critique: false },
      { titre: "Memos strategiques ad-hoc", type: "Document", sections: 2, frequence: "Ad hoc", createur: "Simone", statut: "actif", critique: false },
      { titre: "Evaluations rapides d'opportunites", type: "Document", sections: 3, frequence: "Ad hoc", createur: "Simone", statut: "brouillon", critique: false },
    ]},
    { id: "ma_expansion", label: "M&A & expansion", icon: Rocket, volume: "~5 docs/an", documents: [
      { titre: "Cibles d'acquisition identifiees", type: "Dataset", sections: 1, frequence: "Continu", createur: "Simone", statut: "a_creer", critique: true },
      { titre: "Due diligence (checklists)", type: "Document", sections: 12, frequence: "Par cible", createur: "Simone", statut: "a_creer", critique: true },
      { titre: "Plans d'integration post-fusion", type: "Document", sections: 10, frequence: "Par acquisition", createur: "Simone", statut: "a_creer", critique: false },
      { titre: "Etudes de marche par territoire", type: "Document", sections: 8, frequence: "Par territoire", createur: "Simone", statut: "brouillon", critique: false },
    ]},
    { id: "partenariats_strat", label: "Partenariats strategiques", icon: Users, volume: "~15 docs/an", documents: [
      { titre: "Evaluations de partenaires potentiels", type: "Document", sections: 6, frequence: "Par partenaire", createur: "Simone", statut: "actif", critique: false },
      { titre: "Protocoles d'entente (MOU)", type: "Document", sections: 4, frequence: "Par partenaire", createur: "Loulou", statut: "a_creer", critique: true },
      { titre: "Suivi performance alliances actives", type: "Dashboard", sections: 1, frequence: "Trimestriel", createur: "Simone", statut: "a_creer", critique: false },
    ]},
  ],
  COOB: [
    { id: "sops_workflows", label: "SOPs et workflows", icon: ListChecks, volume: "~30 docs/an", documents: [
      { titre: "Plan de continuite des affaires (BCP)", type: "Document", sections: 8, frequence: "Annuel", createur: "Olivier", statut: "actif", critique: true },
      { titre: "Manuels operationnels par processus", type: "Procedure", sections: 15, frequence: "Continu", createur: "Olivier", statut: "brouillon", critique: true },
      { titre: "SOPs critiques (top 10)", type: "Procedure", sections: 10, frequence: "Continu", createur: "Olivier", statut: "actif", critique: true },
      { titre: "Cartographie de la chaine de valeur", type: "Procedure", sections: 12, frequence: "Annuel", createur: "Olivier", statut: "actif", critique: true },
      { titre: "Audits de processus trimestriels", type: "Document", sections: 6, frequence: "Trimestriel", createur: "Olivier", statut: "actif", critique: true },
    ]},
    { id: "kpis_performance", label: "KPIs et performance", icon: Activity, volume: "~200 docs/an", documents: [
      { titre: "Dashboard KPIs operationnels", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Olivier", statut: "actif", critique: false },
      { titre: "Rapports KPIs hebdomadaires", type: "Document", sections: 4, frequence: "Hebdomadaire", createur: "Olivier", statut: "actif", critique: false },
      { titre: "Plannings d'equipes et horaires", type: "Dataset", sections: 1, frequence: "Hebdomadaire", createur: "Olivier", statut: "actif", critique: false },
      { titre: "Checklists quotidiennes operations", type: "Procedure", sections: 3, frequence: "Quotidien", createur: "Olivier", statut: "actif", critique: false },
    ]},
    { id: "achats_fournisseurs", label: "Achats & fournisseurs", icon: Briefcase, volume: "~100 docs/an", documents: [
      { titre: "Bons de commande (Purchase Orders)", type: "Dataset", sections: 1, frequence: "Quotidien", createur: "Olivier", statut: "actif", critique: false },
      { titre: "Evaluations fournisseurs annuelles", type: "Document", sections: 6, frequence: "Annuel", createur: "Olivier", statut: "actif", critique: true },
      { titre: "Contrats fournisseurs et SLAs", type: "Document", sections: 8, frequence: "Par fournisseur", createur: "Loulou", statut: "actif", critique: true },
      { titre: "Receptions et bons de livraison", type: "Dataset", sections: 1, frequence: "Quotidien", createur: "Olivier", statut: "actif", critique: false },
    ]},
    { id: "logistique_inventaire", label: "Logistique & inventaire", icon: Package, volume: "~500 docs/an", documents: [
      { titre: "Niveaux de stock en temps reel", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Olivier", statut: "actif", critique: true },
      { titre: "Politique de reapprovisionnement", type: "Document", sections: 6, frequence: "Annuel", createur: "Olivier", statut: "actif", critique: false },
      { titre: "Suivi expeditions et transport", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Olivier", statut: "brouillon", critique: false },
      { titre: "Inventaire annuel physique (resultats)", type: "Document", sections: 4, frequence: "Annuel", createur: "Olivier", statut: "actif", critique: true },
    ]},
    { id: "qualite_amelioration", label: "Qualite & amelioration continue", icon: CheckCircle2, volume: "~40 docs/an", documents: [
      { titre: "Rapports non-conformite (NCR)", type: "Document", sections: 6, frequence: "Ad hoc", createur: "Olivier", statut: "actif", critique: true },
      { titre: "Initiatives Kaizen / amelioration", type: "Document", sections: 4, frequence: "Mensuel", createur: "Olivier", statut: "brouillon", critique: false },
      { titre: "Audits qualite internes", type: "Document", sections: 8, frequence: "Trimestriel", createur: "Olivier", statut: "a_creer", critique: false },
      { titre: "Dashboard taux de retours clients (RMA)", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Olivier", statut: "a_creer", critique: false },
    ]},
  ],
  CPOB: [
    { id: "ingenierie_fab", label: "Ingenierie et fabrication", icon: Settings, volume: "~1000 docs/an", documents: [
      { titre: "BOM maitresses (Bill of Materials)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Paco", statut: "actif", critique: true },
      { titre: "Specifications de fabrication", type: "Document", sections: 10, frequence: "Par produit", createur: "Paco", statut: "actif", critique: true },
      { titre: "Protocoles de securite usine (SST)", type: "Procedure", sections: 8, frequence: "Annuel", createur: "Paco", statut: "actif", critique: true },
      { titre: "Planification capacite et ordres de travail", type: "Document", sections: 6, frequence: "Quotidien", createur: "Paco", statut: "actif", critique: false },
      { titre: "Checklists de maintenance preventive", type: "Procedure", sections: 3, frequence: "Quotidien", createur: "Paco", statut: "actif", critique: false },
    ]},
    { id: "qualite_inventaire", label: "Qualite et inventaire", icon: CheckCircle2, volume: "~500 docs/an", documents: [
      { titre: "Rapports de non-conformite majeurs", type: "Document", sections: 6, frequence: "Ad hoc", createur: "Paco", statut: "actif", critique: true },
      { titre: "Registres d'inventaire critiques", type: "Dataset", sections: 1, frequence: "Continu", createur: "Paco", statut: "actif", critique: true },
      { titre: "Manuel qualite ISO", type: "Document", sections: 12, frequence: "Annuel", createur: "Paco", statut: "a_creer", critique: false },
      { titre: "Fiches d'inspection qualite", type: "Procedure", sections: 4, frequence: "Quotidien", createur: "Paco", statut: "actif", critique: false },
      { titre: "Releves de rendement journaliers", type: "Dashboard", sections: 1, frequence: "Quotidien", createur: "Paco", statut: "actif", critique: false },
    ]},
    { id: "planification_prod", label: "Planification & ordonnancement", icon: Calendar, volume: "~250 docs/an", documents: [
      { titre: "Calendrier de production usine", type: "Dashboard", sections: 1, frequence: "Quotidien", createur: "Paco", statut: "actif", critique: true },
      { titre: "Ordres de fabrication (OF) en cours", type: "Dataset", sections: 1, frequence: "Quotidien", createur: "Paco", statut: "actif", critique: false },
      { titre: "Analyse capacite vs demande", type: "Document", sections: 4, frequence: "Hebdomadaire", createur: "Paco", statut: "actif", critique: true },
      { titre: "Planification des quarts de travail", type: "Document", sections: 3, frequence: "Hebdomadaire", createur: "Paco", statut: "actif", critique: false },
    ]},
    { id: "sst_conformite", label: "SST & conformite CNESST", icon: Shield, volume: "~30 docs/an", documents: [
      { titre: "Programme de prevention SST", type: "Document", sections: 10, frequence: "Annuel", createur: "Paco", statut: "actif", critique: true },
      { titre: "Registre des accidents de travail", type: "Dataset", sections: 1, frequence: "Continu", createur: "Paco", statut: "actif", critique: true },
      { titre: "Formations SST (registre)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Helene", statut: "actif", critique: false },
      { titre: "Fiches signalitiques (SIMDUT/SGH)", type: "Document", sections: 2, frequence: "Par produit", createur: "Paco", statut: "actif", critique: true },
    ]},
    { id: "maintenance_equip", label: "Maintenance equipements", icon: Settings, volume: "~200 docs/an", documents: [
      { titre: "Plans de maintenance preventive", type: "Procedure", sections: 8, frequence: "Annuel", createur: "Paco", statut: "actif", critique: true },
      { titre: "Registre interventions correctives", type: "Dataset", sections: 1, frequence: "Continu", createur: "Paco", statut: "actif", critique: false },
      { titre: "Inventaire pieces de rechange", type: "Dataset", sections: 1, frequence: "Continu", createur: "Paco", statut: "brouillon", critique: false },
      { titre: "Dashboard OEE/TRS (efficacite globale)", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Paco", statut: "a_creer", critique: true },
    ]},
  ],
  CHROB: [
    { id: "contrats_emploi", label: "Contrats et dossiers employes", icon: User, volume: "~50 docs/an", documents: [
      { titre: "Contrats d'emploi (permanents et temporaires)", type: "Document", sections: 8, frequence: "Par embauche", createur: "Helene", statut: "actif", critique: true },
      { titre: "Manuel des employes", type: "Document", sections: 14, frequence: "Annuel", createur: "Helene", statut: "actif", critique: true },
      { titre: "Descriptions de postes", type: "Document", sections: 4, frequence: "Par embauche", createur: "Helene", statut: "actif", critique: false },
      { titre: "Grille salariale et avantages", type: "Document", sections: 4, frequence: "Annuel", createur: "Helene", statut: "actif", critique: false },
      { titre: "Rapports d'integration (onboarding)", type: "Procedure", sections: 6, frequence: "Par embauche", createur: "Helene", statut: "actif", critique: false },
    ]},
    { id: "politiques_rh", label: "Politiques et conformite RH", icon: Shield, volume: "~30 docs/an", documents: [
      { titre: "Politique de prevention harcelement", type: "Document", sections: 6, frequence: "Annuel", createur: "Helene", statut: "actif", critique: true },
      { titre: "Dossiers disciplinaires", type: "Dataset", sections: 1, frequence: "Ad hoc", createur: "Helene", statut: "actif", critique: true },
      { titre: "Plan d'equite salariale", type: "Document", sections: 6, frequence: "Annuel", createur: "Helene", statut: "actif", critique: true },
      { titre: "Evaluations de performance", type: "Procedure", sections: 5, frequence: "Semestriel", createur: "Helene", statut: "a_creer", critique: false },
      { titre: "Programme de formation et developpement", type: "Document", sections: 8, frequence: "Annuel", createur: "Helene", statut: "brouillon", critique: false },
      { titre: "Certificats de formation (registre)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Helene", statut: "actif", critique: false },
    ]},
    { id: "recrutement_dotation", label: "Recrutement & dotation", icon: UserPlus, volume: "~40 docs/an", documents: [
      { titre: "Offres d'emploi actives", type: "Dataset", sections: 1, frequence: "Continu", createur: "Helene", statut: "actif", critique: false },
      { titre: "Pipeline candidats (ATS tracker)", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Helene", statut: "brouillon", critique: true },
      { titre: "Grilles d'evaluation d'entrevue", type: "Procedure", sections: 4, frequence: "Par poste", createur: "Helene", statut: "actif", critique: false },
      { titre: "Profils de competences par poste", type: "Document", sections: 6, frequence: "Annuel", createur: "Helene", statut: "a_creer", critique: false },
    ]},
    { id: "formation_dev", label: "Formation & developpement", icon: BookOpen, volume: "~30 docs/an", documents: [
      { titre: "Plan de formation annuel", type: "Document", sections: 8, frequence: "Annuel", createur: "Helene", statut: "brouillon", critique: true },
      { titre: "Catalogue de formations disponibles", type: "Dataset", sections: 1, frequence: "Semestriel", createur: "Helene", statut: "a_creer", critique: false },
      { titre: "Plans de developpement individuel", type: "Document", sections: 4, frequence: "Annuel", createur: "Helene", statut: "a_creer", critique: false },
      { titre: "Registre heures formation (Loi 90)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Helene", statut: "actif", critique: true },
    ]},
    { id: "temps_presences", label: "Temps & presences", icon: Clock, volume: "~500 docs/an", documents: [
      { titre: "Feuilles de temps (approbations)", type: "Dataset", sections: 1, frequence: "Bimensuel", createur: "Helene", statut: "actif", critique: false },
      { titre: "Calendrier conges et vacances", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Helene", statut: "actif", critique: false },
      { titre: "Politique heures supplementaires", type: "Document", sections: 4, frequence: "Annuel", createur: "Helene", statut: "actif", critique: true },
      { titre: "Rapports absenteisme et retards", type: "Document", sections: 3, frequence: "Mensuel", createur: "Helene", statut: "brouillon", critique: false },
    ]},
  ],
  CINOB: [
    { id: "rd_prototypes", label: "R&D et prototypes", icon: Sparkles, volume: "~5 docs/an", documents: [
      { titre: "Rapports de validation POC", type: "Document", sections: 6, frequence: "Par projet", createur: "Ines", statut: "actif", critique: true },
      { titre: "Roadmap innovation 2026-2028", type: "Document", sections: 8, frequence: "Annuel", createur: "Ines", statut: "actif", critique: true },
      { titre: "Etudes de faisabilite technique", type: "Document", sections: 8, frequence: "Par projet", createur: "Ines", statut: "brouillon", critique: true },
      { titre: "Comptes rendus de brainstorming", type: "Document", sections: 3, frequence: "Mensuel", createur: "Ines", statut: "actif", critique: false },
      { titre: "Brouillons de concepts (SCAMPER)", type: "Document", sections: 4, frequence: "Ad hoc", createur: "Ines", statut: "actif", critique: false },
    ]},
    { id: "brevets_pi", label: "Propriete intellectuelle", icon: Shield, volume: "~10 docs/an", documents: [
      { titre: "Depots de brevets actifs", type: "Document", sections: 10, frequence: "Par invention", createur: "Ines", statut: "actif", critique: true },
      { titre: "Registre de propriete intellectuelle", type: "Dataset", sections: 1, frequence: "Continu", createur: "Ines", statut: "actif", critique: true },
      { titre: "Notes de veille technologique", type: "Document", sections: 2, frequence: "Hebdomadaire", createur: "Ines", statut: "actif", critique: false },
      { titre: "Analyses d'impact technologique", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Ines", statut: "a_creer", critique: false },
    ]},
    { id: "rsde_subventions", label: "RS&DE & subventions", icon: DollarSign, volume: "~15 docs/an", documents: [
      { titre: "Documentation RS&DE (formulaire T661)", type: "Document", sections: 10, frequence: "Annuel", createur: "Ines", statut: "actif", critique: true },
      { titre: "Registre heures R&D par projet", type: "Dataset", sections: 1, frequence: "Continu", createur: "Ines", statut: "actif", critique: true },
      { titre: "Demandes de subventions (CRSNG, MITACS)", type: "Document", sections: 8, frequence: "Par programme", createur: "Ines", statut: "brouillon", critique: false },
      { titre: "Rapports d'avancement projets subventionnes", type: "Document", sections: 4, frequence: "Semestriel", createur: "Ines", statut: "a_creer", critique: false },
    ]},
    { id: "veille_ecosysteme", label: "Veille & ecosysteme R&D", icon: Search, volume: "~20 docs/an", documents: [
      { titre: "Cartographie ecosysteme innovation (partenaires)", type: "Document", sections: 6, frequence: "Annuel", createur: "Ines", statut: "a_creer", critique: false },
      { titre: "Rapports de participation symposiums/conferences", type: "Document", sections: 3, frequence: "Ad hoc", createur: "Ines", statut: "actif", critique: false },
      { titre: "Pipeline d'idees (boite a idees)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Ines", statut: "actif", critique: false },
    ]},
  ],
  CLOB: [
    { id: "contrats_types", label: "Contrats types et modeles", icon: FileText, volume: "~20 docs/an", documents: [
      { titre: "Conditions generales de vente (CGV/CGU)", type: "Document", sections: 8, frequence: "Annuel", createur: "Loulou", statut: "actif", critique: true },
      { titre: "Contrats types de partenariat", type: "Document", sections: 6, frequence: "Par partenaire", createur: "Loulou", statut: "actif", critique: true },
      { titre: "NDAs signes (registre)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Loulou", statut: "actif", critique: false },
      { titre: "Renouvellements de licences", type: "Document", sections: 3, frequence: "Annuel", createur: "Loulou", statut: "actif", critique: false },
    ]},
    { id: "conformite_registres", label: "Conformite et registres legaux", icon: Shield, volume: "~30 docs/an", documents: [
      { titre: "Politique de confidentialite (Loi 25)", type: "Document", sections: 10, frequence: "Annuel", createur: "Loulou", statut: "actif", critique: true },
      { titre: "Registre des actions et actionnaires", type: "Dataset", sections: 1, frequence: "Continu", createur: "Loulou", statut: "actif", critique: true },
      { titre: "Memos de litiges potentiels", type: "Document", sections: 4, frequence: "Ad hoc", createur: "Loulou", statut: "a_creer", critique: true },
      { titre: "Avis juridiques courts", type: "Document", sections: 2, frequence: "Ad hoc", createur: "Loulou", statut: "actif", critique: false },
      { titre: "Mises a jour de conformite reglementaire", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Loulou", statut: "actif", critique: false },
    ]},
    { id: "litiges_contentieux", label: "Litiges & contentieux", icon: Gavel, volume: "~10 docs/an", documents: [
      { titre: "Dossiers de litige actifs", type: "Dataset", sections: 1, frequence: "Continu", createur: "Loulou", statut: "actif", critique: true },
      { titre: "Mises en demeure envoyees/recues", type: "Document", sections: 4, frequence: "Ad hoc", createur: "Loulou", statut: "actif", critique: true },
      { titre: "Suivi judiciaire (echancier, decisions)", type: "Document", sections: 3, frequence: "Ad hoc", createur: "Loulou", statut: "a_creer", critique: false },
    ]},
    { id: "assurances_risques", label: "Assurances & risques", icon: Shield, volume: "~15 docs/an", documents: [
      { titre: "Polices d'assurance actives (registre)", type: "Dataset", sections: 1, frequence: "Annuel", createur: "Loulou", statut: "actif", critique: true },
      { titre: "Reclamations en cours", type: "Document", sections: 4, frequence: "Ad hoc", createur: "Loulou", statut: "actif", critique: false },
      { titre: "Analyse des couvertures et gaps", type: "Document", sections: 6, frequence: "Annuel", createur: "Loulou", statut: "brouillon", critique: true },
      { titre: "Renouvellements assurance (echeancier)", type: "Dataset", sections: 1, frequence: "Annuel", createur: "Loulou", statut: "actif", critique: false },
    ]},
  ],
  CISOB: [
    { id: "politiques_securite", label: "Politiques et continuite", icon: Shield, volume: "~5 docs/an", documents: [
      { titre: "Plan de reponse aux incidents (IRP)", type: "Procedure", sections: 8, frequence: "Annuel", createur: "Sebastien", statut: "actif", critique: true },
      { titre: "PSSI (Politique Securite de l'Information)", type: "Document", sections: 12, frequence: "Annuel", createur: "Sebastien", statut: "actif", critique: true },
      { titre: "DRP (Disaster Recovery Plan)", type: "Document", sections: 10, frequence: "Annuel", createur: "Sebastien", statut: "brouillon", critique: true },
      { titre: "Procedures de sauvegarde et restauration", type: "Procedure", sections: 5, frequence: "Annuel", createur: "Sebastien", statut: "actif", critique: false },
    ]},
    { id: "audits_risques", label: "Audits et evaluation des risques", icon: ClipboardCheck, volume: "~40 docs/an", documents: [
      { titre: "Audits de penetration externes (pentests)", type: "Document", sections: 8, frequence: "Annuel", createur: "Sebastien", statut: "a_creer", critique: true },
      { titre: "Evaluations de risques cyber", type: "Document", sections: 6, frequence: "Trimestriel", createur: "Sebastien", statut: "actif", critique: true },
      { titre: "Rapports de scans de vulnerabilite", type: "Document", sections: 4, frequence: "Mensuel", createur: "Sebastien", statut: "actif", critique: false },
      { titre: "Revues d'acces utilisateurs", type: "Dataset", sections: 1, frequence: "Trimestriel", createur: "Sebastien", statut: "actif", critique: false },
      { titre: "Formations et tests hameconnage", type: "Procedure", sections: 3, frequence: "Trimestriel", createur: "Sebastien", statut: "actif", critique: false },
    ]},
    { id: "gestion_vulnerabilites", label: "Gestion vulnerabilites", icon: Bug, volume: "~100 docs/an", documents: [
      { titre: "Inventaire vulnerabilites critiques", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Sebastien", statut: "actif", critique: true },
      { titre: "Suivi des correctifs (patch management)", type: "Dataset", sections: 1, frequence: "Mensuel", createur: "Sebastien", statut: "actif", critique: true },
      { titre: "Rapports de scan de vulnerabilites", type: "Document", sections: 4, frequence: "Mensuel", createur: "Sebastien", statut: "actif", critique: false },
    ]},
    { id: "formation_sensibilisation", label: "Formation & sensibilisation", icon: BookOpen, volume: "~20 docs/an", documents: [
      { titre: "Resultats campagnes de phishing interne", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Sebastien", statut: "actif", critique: false },
      { titre: "Capsules de formation cybersecurite", type: "Procedure", sections: 6, frequence: "Mensuel", createur: "Sebastien", statut: "brouillon", critique: false },
      { titre: "Attestations de formation (registre)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Sebastien", statut: "actif", critique: false },
    ]},
    { id: "controle_acces_iam", label: "Controle d'acces (IAM)", icon: Lock, volume: "~30 docs/an", documents: [
      { titre: "Matrice des droits d'acces par role", type: "Document", sections: 8, frequence: "Semestriel", createur: "Sebastien", statut: "actif", critique: true },
      { titre: "Revues trimestrielles d'acces utilisateurs", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Sebastien", statut: "actif", critique: true },
      { titre: "Politique MFA et gestion mots de passe", type: "Document", sections: 5, frequence: "Annuel", createur: "Sebastien", statut: "actif", critique: false },
    ]},
  ],
  CTOB: [
    { id: "architecture_specs", label: "Architecture et specifications", icon: Cpu, volume: "~20 docs/an", documents: [
      { titre: "Architecture systeme globale", type: "Document", sections: 14, frequence: "Semestriel", createur: "Tim", statut: "actif", critique: true },
      { titre: "Plans de reprise apres sinistre (DRP tech)", type: "Document", sections: 6, frequence: "Annuel", createur: "Tim", statut: "a_creer", critique: true },
      { titre: "Documentation API et specs techniques", type: "Document", sections: 10, frequence: "Continu", createur: "Tim", statut: "actif", critique: true },
      { titre: "Roadmap technique trimestrielle", type: "Document", sections: 6, frequence: "Trimestriel", createur: "Tim", statut: "actif", critique: false },
      { titre: "Notes de version (changelogs)", type: "Document", sections: 2, frequence: "Hebdomadaire", createur: "Tim", statut: "actif", critique: false },
    ]},
    { id: "audits_dette", label: "Audits et dette technique", icon: Bug, volume: "~150 docs/an", documents: [
      { titre: "Audits de securite du code", type: "Document", sections: 8, frequence: "Semestriel", createur: "Tim", statut: "brouillon", critique: true },
      { titre: "Inventaire dette technique", type: "Dataset", sections: 1, frequence: "Trimestriel", createur: "Tim", statut: "actif", critique: false },
      { titre: "Rapports d'incidents (post-mortems)", type: "Document", sections: 6, frequence: "Ad hoc", createur: "Tim", statut: "actif", critique: false },
      { titre: "Logs de deploiement", type: "Dataset", sections: 1, frequence: "Quotidien", createur: "Tim", statut: "actif", critique: false },
      { titre: "Audits de dependances et licences", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Tim", statut: "actif", critique: false },
    ]},
    { id: "infra_devops", label: "Infrastructure & DevOps", icon: Cpu, volume: "~100 docs/an", documents: [
      { titre: "Pipeline CI/CD (configuration)", type: "Document", sections: 6, frequence: "Continu", createur: "Tim", statut: "actif", critique: true },
      { titre: "Dashboard monitoring & uptime", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Tim", statut: "actif", critique: true },
      { titre: "Runbooks d'incidents (procedures)", type: "Procedure", sections: 8, frequence: "Par service", createur: "Tim", statut: "brouillon", critique: false },
      { titre: "Inventaire serveurs et infrastructure", type: "Dataset", sections: 1, frequence: "Continu", createur: "Tim", statut: "actif", critique: false },
    ]},
    { id: "licences_saas", label: "Licences & SaaS", icon: DollarSign, volume: "~30 docs/an", documents: [
      { titre: "Inventaire abonnements SaaS actifs", type: "Dataset", sections: 1, frequence: "Continu", createur: "Tim", statut: "actif", critique: true },
      { titre: "Rapport Shadow IT (outils non-approuves)", type: "Document", sections: 4, frequence: "Trimestriel", createur: "Tim", statut: "a_creer", critique: true },
      { titre: "Budget technologique vs consommation", type: "Dashboard", sections: 1, frequence: "Mensuel", createur: "Frank", statut: "brouillon", critique: false },
      { titre: "Renouvellements licences (echeancier)", type: "Dataset", sections: 1, frequence: "Continu", createur: "Tim", statut: "actif", critique: false },
    ]},
    { id: "support_itsm", label: "Support & incidents (ITSM)", icon: Headphones, volume: "~500 docs/an", documents: [
      { titre: "Dashboard tickets support ouverts", type: "Dashboard", sections: 1, frequence: "Temps reel", createur: "Tim", statut: "actif", critique: false },
      { titre: "Base de connaissances IT (FAQ)", type: "Document", sections: 20, frequence: "Continu", createur: "Tim", statut: "brouillon", critique: false },
      { titre: "SLAs et temps de reponse (rapport)", type: "Document", sections: 3, frequence: "Mensuel", createur: "Tim", statut: "a_creer", critique: false },
      { titre: "Post-mortems incidents majeurs", type: "Document", sections: 6, frequence: "Ad hoc", createur: "Tim", statut: "actif", critique: true },
    ]},
  ],
};

const STATUT_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  actif: { label: "Actif", bg: "bg-emerald-50", text: "text-emerald-700" },
  brouillon: { label: "Brouillon", bg: "bg-amber-50", text: "text-amber-700" },
  a_creer: { label: "A creer", bg: "bg-gray-100", text: "text-gray-500" },
};

const TYPE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  Document: { label: "Doc", bg: "bg-blue-50", text: "text-blue-700" },
  Dashboard: { label: "Dashboard", bg: "bg-purple-50", text: "text-purple-700" },
  Flow: { label: "Flow", bg: "bg-amber-50", text: "text-amber-700" },
  Dataset: { label: "Dataset", bg: "bg-teal-50", text: "text-teal-700" },
  Procedure: { label: "Procedure", bg: "bg-orange-50", text: "text-orange-700" },
  Media: { label: "Media", bg: "bg-pink-50", text: "text-pink-700" },
};

// 6 types d'actifs numeriques (DS-04 Part 9)
const ASSET_TYPES: { id: string; label: string; icon: React.ElementType; bgColor: string; iconColor: string; valueColor: string; desc: string; docType: string }[] = [
  { id: "documents", label: "Documents", icon: FileText, bgColor: "bg-blue-50", iconColor: "text-blue-500", valueColor: "text-blue-600", desc: "Contrats, rapports, plans", docType: "Document" },
  { id: "dashboards", label: "Dashboards", icon: BarChart3, bgColor: "bg-purple-50", iconColor: "text-purple-500", valueColor: "text-purple-600", desc: "KPIs temps reel", docType: "Dashboard" },
  { id: "flows", label: "Flows", icon: Zap, bgColor: "bg-amber-50", iconColor: "text-amber-500", valueColor: "text-amber-600", desc: "Automatisations", docType: "Flow" },
  { id: "datasets", label: "Datasets", icon: Database, bgColor: "bg-teal-50", iconColor: "text-teal-500", valueColor: "text-teal-600", desc: "Registres, inventaires", docType: "Dataset" },
  { id: "media", label: "Media", icon: Palette, bgColor: "bg-pink-50", iconColor: "text-pink-500", valueColor: "text-pink-600", desc: "Logos, visuels, brand", docType: "Media" },
  { id: "procedures", label: "Procedures", icon: ListChecks, bgColor: "bg-orange-50", iconColor: "text-orange-500", valueColor: "text-orange-600", desc: "SOPs, checklists", docType: "Procedure" },
];

// Format de fichier — type de document (Texte, Excel, Presentation, Etude, etc.)
const FORMAT_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  texte: { label: "Texte", bg: "bg-slate-50", text: "text-slate-600" },
  tableur: { label: "Excel", bg: "bg-green-50", text: "text-green-700" },
  presentation: { label: "Presentation", bg: "bg-indigo-50", text: "text-indigo-600" },
  etude: { label: "Etude", bg: "bg-violet-50", text: "text-violet-600" },
  reflexion: { label: "Pre-rapport", bg: "bg-rose-50", text: "text-rose-600" },
  conception: { label: "Conception", bg: "bg-yellow-50", text: "text-yellow-700" },
  interactif: { label: "Interactif", bg: "bg-cyan-50", text: "text-cyan-600" },
  media: { label: "Media", bg: "bg-pink-50", text: "text-pink-600" },
};

function inferFormat(type: string, titre: string): string {
  if (type === "Dashboard") return "interactif";
  if (type === "Dataset") return "tableur";
  if (type === "Flow") return "interactif";
  if (type === "Media") return "media";
  if (type === "Procedure") return "texte";
  const t = titre.toLowerCase();
  // Etudes et analyses
  if (t.includes("etude") || t.includes("faisabilite") || t.includes("benchmark") || t.includes("scenar") || t.includes("analyse concurr") || t.includes("veille") || t.includes("recherche") || t.includes("swot") || t.includes("bmc")) return "etude";
  // Pre-rapports de reflexion
  if (t.includes("reflexion") || t.includes("notes") || t.includes("brainstorm") || t.includes("exploration") || t.includes("pre-rapport") || t.includes("hypothes") || t.includes("ideation")) return "reflexion";
  // Documents en mode conception
  if (t.includes("conception") || t.includes("design") || t.includes("prototype") || t.includes("wireframe") || t.includes("maquette") || t.includes("specs") || t.includes("architecture") || t.includes("blueprint") || t.includes("roadmap") || t.includes("schema")) return "conception";
  // Tableurs / chiffres
  if (t.includes("rapport") || t.includes("bilan") || t.includes("budget") || t.includes("prevision") || t.includes("projection") || t.includes("kpi") || t.includes("flash") || t.includes("inventaire") || t.includes("tresorerie") || t.includes("cash") || t.includes("compilation") || t.includes("facturation") || t.includes("registre") || t.includes("suivi")) return "tableur";
  // Presentations
  if (t.includes("presentation") || t.includes("pitch") || t.includes("deck") || t.includes("ordre du jour") || t.includes("onboarding") || t.includes("persona") || t.includes("positionnement")) return "presentation";
  return "texte";
}

type DataRoomViewMode = "list" | "cards" | "table";

function DataRoomVueConsolidee({ onNavigateDept }: { onNavigateDept: (deptCode: string) => void }) {
  const deptSummaries = OTHER_BOTS.map(bot => {
    const sections = DATA_ROOM_SECTIONS[bot.code] || [];
    const totalDocs = sections.reduce((s, cat) => s + cat.documents.length, 0);
    const templates = getTemplatesForBot(bot.code).length;
    const actifs = sections.reduce((s, cat) => s + cat.documents.filter(d => d.statut === "actif").length, 0);
    const critiques = sections.reduce((s, cat) => s + cat.documents.filter(d => d.critique).length, 0);
    return { ...bot, sections, totalDocs, templates, actifs, critiques, pct: totalDocs > 0 ? Math.round((actifs / totalDocs) * 100) : 0 };
  });
  const totalDocs = deptSummaries.reduce((s, d) => s + d.totalDocs, 0);
  const totalActifs = deptSummaries.reduce((s, d) => s + d.actifs, 0);
  const totalCritiques = deptSummaries.reduce((s, d) => s + d.critiques, 0);
  const totalTemplates = BLUEPRINT_TEMPLATES.length;
  const santeScore = totalDocs > 0 ? Math.round((totalActifs / totalDocs) * 100) : 0;

  // Comptage par type a travers tous les departements
  const allDocs = Object.values(DATA_ROOM_SECTIONS).flatMap(cats => cats.flatMap(c => c.documents));
  const typeCountMap: Record<string, number> = {};
  allDocs.forEach(d => { typeCountMap[d.type] = (typeCountMap[d.type] || 0) + 1; });

  return (
    <div className="space-y-4">
      {/* ── KPI Cards — 4 metriques cles (design-system standard) ── */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-0 gap-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
            <FileText className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Documents</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-blue-600">{totalDocs}</div>
            <div className="text-[9px] text-gray-500">{totalActifs} actifs · {totalDocs - totalActifs} en cours</div>
          </div>
        </Card>
        <Card className="p-0 gap-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-500">
            <Layers className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Templates</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-purple-600">{totalTemplates}</div>
            <div className="text-[9px] text-gray-500">12 departements couverts</div>
          </div>
        </Card>
        <Card className="p-0 gap-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
            <Activity className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Sante Doc.</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-emerald-600">{santeScore}%</div>
            <div className="text-[9px] text-gray-500">{totalCritiques} critiques a traiter</div>
          </div>
        </Card>
        <Card className="p-0 gap-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
            <Database className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Types actifs</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-amber-600">6</div>
            <div className="text-[9px] text-gray-500">Doc · Dashboard · Flow · Data · Media · SOP</div>
          </div>
        </Card>
      </div>

      {/* ── 6 Types d'actifs numeriques ── */}
      <div className="border rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Database className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">6 types d'actifs numeriques</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">{allDocs.length} total</span>
        </div>
        <div className="grid grid-cols-6 divide-x divide-gray-100">
          {ASSET_TYPES.map(asset => {
            const count = typeCountMap[asset.docType] || 0;
            return (
              <div key={asset.id} className="px-2.5 py-3 text-center space-y-1">
                <div className={cn("w-8 h-8 rounded-lg mx-auto flex items-center justify-center", asset.bgColor)}>
                  <asset.icon className={cn("h-4 w-4", asset.iconColor)} />
                </div>
                <div className={cn("text-2xl font-bold", asset.valueColor)}>{count}</div>
                <div className="text-[9px] font-bold text-gray-700">{asset.label}</div>
                <div className="text-[9px] text-gray-400 leading-tight">{asset.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid departements — CLIQUABLES */}
      <div className="grid grid-cols-2 gap-2">
        {deptSummaries.map(dept => (
          <button
            key={dept.code}
            onClick={() => onNavigateDept(dept.code)}
            className="text-left p-0 overflow-hidden rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
          >
            <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", dept.gradient)}>
              <FolderOpen className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-bold text-white flex-1">{dept.label}</span>
              <ChevronRight className="h-3.5 w-3.5 text-white/60" />
            </div>
            <div className="px-3 py-2 space-y-1">
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-blue-600 font-medium">{dept.totalDocs} docs</span>
                <span className="text-purple-600">{dept.templates} templates</span>
                {dept.critiques > 0 && <span className="text-red-500 font-bold">{dept.critiques} critiques</span>}
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", dept.pct >= 70 ? "bg-emerald-500" : dept.pct >= 40 ? "bg-amber-400" : "bg-red-500")} style={{ width: `${dept.pct}%` }} />
              </div>
              <div className="text-[9px] text-gray-500 truncate">
                {dept.sections.map(s => s.label).join(" · ")}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function DataRoomAssetList({ documents, viewMode, sortField, sortDir, onSort }: {
  documents: DataRoomDoc[];
  viewMode: DataRoomViewMode;
  sortField: DataRoomSortField;
  sortDir: DataRoomSortDir;
  onSort: (field: DataRoomSortField) => void;
}) {
  if (documents.length === 0) return <p className="text-xs text-gray-400 text-center py-8">Aucun resultat pour cette recherche</p>;

  const actionLabel = (statut: string) => statut === "a_creer" ? "Creer" : statut === "brouillon" ? "Atelier" : "Consulter";
  const actionStyle = (statut: string) => statut === "a_creer" ? "bg-blue-600 hover:bg-blue-700" : statut === "brouillon" ? "bg-amber-600 hover:bg-amber-700" : "bg-gray-600 hover:bg-gray-700";

  const typeIcon = (type: string) => {
    const at = ASSET_TYPES.find(a => a.docType === type);
    return at ? at.icon : FileText;
  };

  // ── Sortable column header ──
  const SortTh = ({ field, w, children }: { field: DataRoomSortField; w: string; children: React.ReactNode }) => {
    const active = sortField === field;
    const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
    return (
      <button className={cn("text-left text-[9px] font-bold uppercase cursor-pointer select-none", w, active ? "text-blue-500" : "text-gray-500")}
        onClick={() => onSort(field)}>
        <span className="flex items-center gap-1">{children}<Icon className={cn("h-3.5 w-3.5", active ? "text-blue-500" : "text-gray-300")} /></span>
      </button>
    );
  };

  // ── TABLE VIEW (flat rows like Liste — sortable column headers) ──
  if (viewMode === "table") {
    return (
      <div className="space-y-0">
        {/* Header row */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-200">
          <SortTh field="titre" w="flex-1">Nom</SortTh>
          <SortTh field="format" w="w-[70px] shrink-0">Format</SortTh>
          <SortTh field="statut" w="w-[70px] shrink-0">Statut</SortTh>
          <SortTh field="createur" w="w-[80px] shrink-0">Createur</SortTh>
          <span className="text-[9px] font-bold text-gray-500 uppercase w-[55px] shrink-0">Taille</span>
          <SortTh field="frequence" w="w-[70px] shrink-0">Modifie</SortTh>
          <span className="w-[50px] shrink-0" />
        </div>
        {/* Data rows */}
        {documents.map((doc, i) => {
          const statut = STATUT_BADGE[doc.statut];
          const fmt = FORMAT_BADGE[doc.format] || FORMAT_BADGE.texte;
          const DocIcon = typeIcon(doc.type);
          const assetType = ASSET_TYPES.find(a => a.docType === doc.type);
          return (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer group">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                {doc.critique && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                <DocIcon className={cn("h-3.5 w-3.5 shrink-0", assetType ? assetType.iconColor : "text-gray-400")} />
                <span className="text-[9px] font-medium text-gray-800 truncate">{doc.titre}</span>
              </div>
              <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 w-[70px]", fmt.bg, fmt.text)}>{fmt.label}</span>
              <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 w-[70px]", statut.bg, statut.text)}>{statut.label}</span>
              <span className="text-[9px] text-gray-500 shrink-0 w-[80px] truncate">{doc.createur}</span>
              <span className="text-[9px] text-gray-400 shrink-0 w-[55px]">{doc.taille}</span>
              <span className="text-[9px] text-gray-400 shrink-0 w-[70px]">{doc.modifie}</span>
              <button className={cn("text-[9px] font-medium text-white px-2 py-0.5 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-[50px]", actionStyle(doc.statut))}>
                {actionLabel(doc.statut)}
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  // ── CARDS VIEW (boxes style) ──
  if (viewMode === "cards") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {documents.map((doc, i) => {
          const statut = STATUT_BADGE[doc.statut];
          const fmt = FORMAT_BADGE[doc.format] || FORMAT_BADGE.texte;
          const DocIcon = typeIcon(doc.type);
          const assetType = ASSET_TYPES.find(a => a.docType === doc.type);
          return (
            <button key={i} className="text-left p-0 overflow-hidden rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
              <div className={cn("flex items-center gap-2 px-3 py-1.5", assetType ? assetType.bgColor : "bg-gray-50")}>
                <DocIcon className={cn("h-3.5 w-3.5", assetType ? assetType.iconColor : "text-gray-400")} />
                <span className="text-[9px] font-bold text-gray-700 flex-1 truncate">{doc.titre}</span>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", statut.bg, statut.text)}>{statut.label}</span>
              </div>
              <div className="px-3 py-2 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {doc.critique && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600">Critique</span>}
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", fmt.bg, fmt.text)}>{fmt.label}</span>
                  <span className="text-[9px] text-gray-400">{doc.taille}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-gray-400">{doc.createur} · {doc.modifie}</span>
                  <span className={cn("text-[9px] font-medium text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity", actionStyle(doc.statut))}>
                    {actionLabel(doc.statut)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // ── LIST VIEW (flat file list — SharePoint style, no category grouping) ──
  return (
    <div className="space-y-0.5">
      {documents.map((doc, i) => {
        const statut = STATUT_BADGE[doc.statut];
        const fmt = FORMAT_BADGE[doc.format] || FORMAT_BADGE.texte;
        const DocIcon = typeIcon(doc.type);
        const assetType = ASSET_TYPES.find(a => a.docType === doc.type);
        return (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer group">
            <div className={cn("w-2 h-2 rounded-full shrink-0", doc.statut === "actif" ? "bg-emerald-500" : doc.statut === "brouillon" ? "bg-amber-400" : "bg-gray-300")} />
            <DocIcon className={cn("h-3.5 w-3.5 shrink-0", assetType ? assetType.iconColor : "text-gray-400")} />
            <span className="text-[9px] font-bold text-gray-800 flex-1 truncate">{doc.titre}</span>
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0", fmt.bg, fmt.text)}>{fmt.label}</span>
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0", statut.bg, statut.text)}>{statut.label}</span>
            <span className="text-[9px] text-gray-400 shrink-0 w-[60px]">{doc.taille}</span>
            <span className="text-[9px] text-gray-400 shrink-0 w-[70px]">{doc.modifie}</span>
            <button className={cn("text-[9px] font-medium text-white px-2 py-0.5 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shrink-0", actionStyle(doc.statut))}>
              {actionLabel(doc.statut)}
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 shrink-0" />
          </div>
        );
      })}
    </div>
  );
}

function DataRoomTemplatesList({ botCode, viewMode: _viewMode }: { botCode: string; viewMode: DataRoomViewMode }) {
  const allTemplates = BLUEPRINT_TEMPLATES;
  const deptTemplates = botCode === "CEOB" ? allTemplates : getTemplatesForBot(botCode);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string | null>(botCode !== "CEOB" ? botCode : null);
  const [searchTpl, setSearchTpl] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<BlueprintTemplate | null>(null);

  const CATEGORY_LABELS: Record<string, string> = { strategique: "Strategique", operationnel: "Operationnel", conformite: "Conformite", diagnostic: "Diagnostic" };
  const CATEGORY_ICONS: Record<string, React.ElementType> = { strategique: Target, operationnel: Activity, conformite: Shield, diagnostic: Search };
  const catBadgeStyle = (cat: string) => cat === "strategique" ? "bg-blue-50 text-blue-700" : cat === "conformite" ? "bg-purple-50 text-purple-700" : cat === "diagnostic" ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-700";
  const PHASE_LABELS: Record<string, string> = { startup: "Startup", scaleup: "Scale-up", exitup: "Exit" };

  const baseTemplates = filterDept ? allTemplates.filter(t => t.botCode === filterDept) : deptTemplates;
  let filtered = filterCat === "all" ? baseTemplates : baseTemplates.filter(t => t.category === filterCat);
  if (searchTpl.trim()) {
    const q = searchTpl.toLowerCase();
    filtered = filtered.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }

  const catCounts: Record<string, number> = {};
  baseTemplates.forEach(t => { catCounts[t.category] = (catCounts[t.category] || 0) + 1; });
  const docForgeCount = baseTemplates.filter(t => t.docForgeReady).length;

  const deptCounts: { code: string; label: string; count: number }[] = Object.entries(DEPT_SHORT_LABEL)
    .map(([code, label]) => ({ code, label, count: allTemplates.filter(t => t.botCode === code).length }))
    .filter(d => d.count > 0);

  if (selectedTemplate) {
    const t = selectedTemplate;
    const CatIcon = CATEGORY_ICONS[t.category] || Layers;
    const similarTemplates = allTemplates.filter(s => s.botCode === t.botCode && s.id !== t.id).slice(0, 4);
    return (
      <div className="space-y-3">
        <button onClick={() => setSelectedTemplate(null)} className="text-[10px] text-gray-500 hover:text-gray-700 flex items-center gap-1.5 cursor-pointer"><ChevronLeft className="h-3.5 w-3.5" /> Retour aux templates</button>
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-[#00B4D8]/10">
            <CatIcon className="h-5 w-5 text-gray-900 stroke-[2.5]" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900">{t.name}</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">{DEPT_SHORT_LABEL[t.botCode] || t.botCode}</p>
            </div>
            <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded", catBadgeStyle(t.category))}>{CATEGORY_LABELS[t.category]}</span>
            {t.docForgeReady && <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">DocForge</span>}
          </div>
          <div className="px-5 py-4 space-y-4">
            <p className="text-xs text-gray-600 leading-relaxed">{t.description}</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-[9px] text-gray-400 block mb-0.5">Categorie</span>
                <span className="text-xs font-bold text-gray-800">{CATEGORY_LABELS[t.category]}</span>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-[9px] text-gray-400 block mb-0.5">Phases</span>
                <span className="text-xs font-bold text-gray-800">{t.phases.map(p => PHASE_LABELS[p] || p).join(", ")}</span>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-[9px] text-gray-400 block mb-0.5">Source</span>
                <span className="text-xs font-bold text-gray-800">{t.source === "existant" ? "Existant" : "Nouveau"}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 px-3 py-2 text-[10px] font-bold bg-gray-900 text-white rounded-lg hover:bg-gray-800 cursor-pointer transition-colors flex items-center justify-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Ouvrir dans DocForge
              </button>
              <button className="px-3 py-2 text-[10px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> Telecharger
              </button>
            </div>
          </div>
        </div>
        {similarTemplates.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-2"><Layers className="h-3.5 w-3.5 text-gray-500" /> Templates similaires</h4>
            <div className="grid grid-cols-2 gap-3">
              {similarTemplates.map(s => {
                const SIcon = CATEGORY_ICONS[s.category] || Layers;
                return (
                  <div key={s.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => setSelectedTemplate(s)}>
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-[#00B4D8]/10">
                      <SIcon className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
                      <span className="text-[10px] font-bold text-gray-900 flex-1 truncate">{s.name}</span>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-[9px] text-gray-500 line-clamp-2">{s.description}</p>
                      <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block", catBadgeStyle(s.category))}>{CATEGORY_LABELS[s.category]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
          <span className="text-[9px] text-gray-400 block">Total</span>
          <span className="text-lg font-bold text-gray-900">{baseTemplates.length}</span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
          <span className="text-[9px] text-gray-400 block">DocForge</span>
          <span className="text-lg font-bold text-emerald-600">{docForgeCount}</span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
          <span className="text-[9px] text-gray-400 block">Categories</span>
          <span className="text-lg font-bold text-gray-900">{Object.keys(catCounts).length}</span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
          <span className="text-[9px] text-gray-400 block">Nouveaux</span>
          <span className="text-lg font-bold text-blue-600">{baseTemplates.filter(t => t.source === "nouveau").length}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="relative flex-1 max-w-[220px]">
          <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
          <input type="text" value={searchTpl} onChange={e => setSearchTpl(e.target.value)} placeholder="Rechercher templates..." className="w-full pl-7 pr-2 py-1 text-[9px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" />
        </div>
        {Object.entries(CATEGORY_LABELS).filter(([k]) => catCounts[k]).map(([k, v]) => {
          const CIcon = CATEGORY_ICONS[k] || Layers;
          return (
            <button key={k} onClick={() => setFilterCat(filterCat === k ? "all" : k)} className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-medium transition-all cursor-pointer border", filterCat === k ? `${catBadgeStyle(k)} border-current shadow-sm` : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>
              <CIcon className="h-3.5 w-3.5" /> {v} <span className="opacity-60">{catCounts[k]}</span>
            </button>
          );
        })}
        <span className="text-[9px] text-gray-400 ml-auto">{filtered.length} templates</span>
      </div>

      {botCode === "CEOB" && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => setFilterDept(null)} className={cn("px-2 py-0.5 rounded-full text-[9px] font-medium transition-all cursor-pointer border", !filterDept ? "bg-gray-900 text-white border-gray-900 shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>
            Tous
          </button>
          {deptCounts.map(d => (
            <button key={d.code} onClick={() => setFilterDept(filterDept === d.code ? null : d.code)} className={cn("px-2 py-0.5 rounded-full text-[9px] font-medium transition-all cursor-pointer border", filterDept === d.code ? "bg-gray-900 text-white border-gray-900 shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>
              {d.label} <span className="opacity-60">{d.count}</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {filtered.map(t => {
          const CatIcon = CATEGORY_ICONS[t.category] || Layers;
          return (
            <div key={t.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => setSelectedTemplate(t)}>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                <CatIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-[10px] font-bold text-gray-900 flex-1 truncate">{t.name}</span>
                {t.docForgeReady && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
              </div>
              <div className="px-4 py-3 space-y-2">
                <p className="text-[9px] text-gray-500 leading-relaxed line-clamp-2">{t.description}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded", catBadgeStyle(t.category))}>{CATEGORY_LABELS[t.category]}</span>
                  {t.phases.map(p => (
                    <span key={p} className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{PHASE_LABELS[p] || p}</span>
                  ))}
                  {botCode === "CEOB" && <span className="text-[8px] text-gray-400 ml-auto">{DEPT_SHORT_LABEL[t.botCode] || t.botCode}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Layers className="h-5 w-5 text-gray-300 mx-auto mb-2" />
          <p className="text-[10px] text-gray-400">Aucun template trouve</p>
        </div>
      )}

      <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2 flex items-center gap-3">
        <Info className="h-3.5 w-3.5 text-blue-500" />
        <span className="text-[9px] text-blue-700">Templates · {baseTemplates.length} disponibles · {docForgeCount} prets pour DocForge · {Object.keys(catCounts).length} categories</span>
      </div>
    </div>
  );
}

type DataRoomSortField = "titre" | "format" | "frequence" | "createur" | "statut" | "categorie";
type DataRoomSortDir = "asc" | "desc";

const DR_SORT_OPTIONS: { field: DataRoomSortField; label: string }[] = [
  { field: "titre", label: "Nom" },
  { field: "format", label: "Format" },
  { field: "statut", label: "Statut" },
  { field: "categorie", label: "Categorie" },
  { field: "frequence", label: "Frequence" },
  { field: "createur", label: "Createur" },
];

// Type enrichi avec categorie d'origine + format infere
type DataRoomDoc = {
  titre: string; type: string; sections: number; frequence: string; createur: string;
  statut: "actif" | "brouillon" | "a_creer"; critique: boolean;
  categorie: string; categorieId: string; format: string;
  modifie: string; taille: string;
};

// Mock date/taille derivees du titre (deterministe)
function mockDate(titre: string): string {
  let h = 0;
  for (let i = 0; i < titre.length; i++) h = ((h << 5) - h + titre.charCodeAt(i)) | 0;
  const day = (Math.abs(h) % 28) + 1;
  const month = (Math.abs(h >> 4) % 3); // 0=jan, 1=fev, 2=mar 2026
  return `${day} ${["jan", "fev", "mar"][month]} 2026`;
}
function mockTaille(titre: string, type: string): string {
  if (type === "Dashboard" || type === "Flow") return "—";
  let h = 0;
  for (let i = 0; i < titre.length; i++) h = ((h << 5) - h + titre.charCodeAt(i)) | 0;
  const kb = (Math.abs(h) % 900) + 100;
  return kb > 500 ? `${(kb / 100).toFixed(1)} MB` : `${kb} KB`;
}

export function DataRoomView({ botCode, headerGradient, showHeader = false }: { botCode: string; headerGradient: string; showHeader?: boolean }) {
  // Department navigation — sidebar shows ALL departments
  const [activeDept, setActiveDept] = useState(botCode);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set([botCode]));
  const sections = DATA_ROOM_SECTIONS[activeDept] || [];
  const templates = activeDept === "CEOB" ? BLUEPRINT_TEMPLATES : getTemplatesForBot(activeDept);
  const [activeFolder, setActiveFolder] = useState(botCode === "CEOB" ? "_consolidee" : (sections.length > 0 ? sections[0].id : ""));
  const [viewMode, setViewMode] = useState<DataRoomViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<DataRoomSortField>("titre");
  const [sortDir, setSortDir] = useState<DataRoomSortDir>("asc");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [formatFilter, setFormatFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showSort, setShowSort] = useState(false);

  // Synchroniser quand botCode change (navigation département dans ControlTowerPanel)
  useEffect(() => {
    setActiveDept(botCode);
    setExpandedDepts(new Set([botCode]));
    const deptSections = DATA_ROOM_SECTIONS[botCode] || [];
    setActiveFolder(botCode === "CEOB" ? "_consolidee" : (deptSections.length > 0 ? deptSections[0].id : ""));
    setSearchQuery(""); setTypeFilter(null); setStatusFilter(null); setFormatFilter(null);
  }, [botCode]);

  const toggleDept = (code: string) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };
  const selectDeptFolder = (deptCode: string, folderId: string) => {
    setActiveDept(deptCode);
    setActiveFolder(folderId);
    setSearchQuery(""); setTypeFilter(null); setStatusFilter(null); setFormatFilter(null);
    if (!expandedDepts.has(deptCode)) setExpandedDepts(prev => new Set([...prev, deptCode]));
  };

  // Flatten all docs for this department with category + format + date + taille
  const allDeptDocs: DataRoomDoc[] = sections.flatMap(s =>
    s.documents.map(d => ({ ...d, categorie: s.label, categorieId: s.id, format: inferFormat(d.type, d.titre), modifie: mockDate(d.titre), taille: mockTaille(d.titre, d.type) }))
  );

  // Active folder
  const activeSection = sections.find(s => s.id === activeFolder);
  const isFolderView = !!activeSection;

  // Get docs for active folder
  const folderDocs: DataRoomDoc[] = activeSection
    ? activeSection.documents.map(d => ({ ...d, categorie: activeSection.label, categorieId: activeSection.id, format: inferFormat(d.type, d.titre), modifie: mockDate(d.titre), taille: mockTaille(d.titre, d.type) }))
    : [];

  // Filter + sort documents
  const filteredDocs = (() => {
    if (!isFolderView) return [];
    let docs = [...folderDocs];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(d => d.titre.toLowerCase().includes(q) || d.createur.toLowerCase().includes(q) || d.format.toLowerCase().includes(q));
    }
    if (typeFilter) docs = docs.filter(d => d.type === typeFilter);
    if (statusFilter) docs = docs.filter(d => d.statut === statusFilter);
    if (formatFilter) docs = docs.filter(d => d.format === formatFilter);
    docs.sort((a, b) => {
      const av = String(a[sortField as keyof DataRoomDoc] ?? "");
      const bv = String(b[sortField as keyof DataRoomDoc] ?? "");
      const cmp = av.localeCompare(bv);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return docs;
  })();

  // Counts for filter pills (from unfiltered folder docs)
  const typeCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};
  const formatCounts: Record<string, number> = {};
  folderDocs.forEach(d => {
    typeCounts[d.type] = (typeCounts[d.type] || 0) + 1;
    statusCounts[d.statut] = (statusCounts[d.statut] || 0) + 1;
    formatCounts[d.format] = (formatCounts[d.format] || 0) + 1;
  });

  return (
    <div className="space-y-3">
      {/* Hero — Living Heroes V20 Data Room */}
      {showHeader && (
        <LivingHero
          blur1="bg-emerald-100/60" blur2="bg-teal-100/50"
          subtitleColor="text-emerald-600" subtitle="Documents & Fichiers"
          title="Vos documents importants, tous au même endroit."
          description="Rapports, contrats, analyses — classés, protégés, toujours accessibles en 2 clics."
        >
          <div className="relative w-[340px] h-[150px] flex items-center justify-center">
            <div className="absolute right-[100px] top-[15px] w-[140px] h-[120px] bg-white border border-emerald-100 rounded-xl shadow-xl transform rotate-3 overflow-hidden p-4 text-[7px] text-slate-300 leading-tight" style={{fontFamily:'ui-monospace,monospace'}}>
              <div className="font-bold text-emerald-600 mb-2 border-b border-emerald-100 pb-1">CLASSIFIED_DATA</div>
              <div className="anim-binary">01001000 01101111<br/>01101100 01100100<br/><span className="text-emerald-400">█████ ENCRYPT</span></div>
              <div className="absolute w-[140%] h-[1.5px] bg-[#10b981] -left-4 anim-laser flex items-center justify-center z-50">
                <div className="absolute w-full h-[30px] bg-gradient-to-b from-[#10b981]/[0.15] to-transparent -top-[1px]" />
                <div className="w-[80%] h-full bg-[#34d399] shadow-[0_0_20px_#10b981]" />
              </div>
            </div>
            <div className="glass-intense absolute right-[30px] bottom-[20px] w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.3)]">
              <svg className="absolute w-20 h-20 text-emerald-400 anim-vault-out" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="20 10 5 10"/></svg>
              <svg className="absolute w-14 h-14 text-teal-500 anim-vault-in" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="40 20"/></svg>
              <div className="w-6 h-8 bg-white border-[3px] border-emerald-500 rounded-md relative flex items-center justify-center"><div className="w-1.5 h-3 bg-emerald-500 rounded-full" /></div>
            </div>
          </div>
        </LivingHero>
      )}
    <div className="flex gap-3">
      {/* Sidebar — Navigation 12 départements (accordion) */}
      <div className="w-[180px] shrink-0 space-y-0.5">
        {/* Vue d'ensemble — disponible pour tous les départements */}
        <button
          onClick={() => { setActiveDept(botCode); setActiveFolder("_consolidee"); setSearchQuery(""); setTypeFilter(null); setStatusFilter(null); setFormatFilter(null); }}
          className={cn(
            "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
            activeFolder === "_consolidee" ? SF.btnActive : SF.btnInactive
          )}
        >
          <div className="flex items-center gap-1.5">
            <Building2 className={cn("h-3.5 w-3.5 shrink-0", activeFolder === "_consolidee" ? "text-blue-500" : "text-gray-400")} />
            <span className={cn("text-[10px] font-bold flex-1", activeFolder === "_consolidee" ? "text-blue-700" : "text-gray-700")}>Vue d'ensemble</span>
            <span className="text-[9px] text-gray-400">{botCode === "CEOB" ? Object.keys(DATA_ROOM_SECTIONS).length : (DATA_ROOM_SECTIONS[botCode] || []).length}</span>
          </div>
        </button>

        <div className={SF.separator} />

        {/* Départements — CEOB: accordion 12 depts | Autre: dossiers du dept actif seulement */}
        {botCode === "CEOB" ? (
          /* CEOB = Direction: accordion 12 départements (poupée russe: voit tout) */
          Object.keys(DATA_ROOM_SECTIONS).map(deptCode => {
            const deptSections = DATA_ROOM_SECTIONS[deptCode] || [];
            const isExpanded = expandedDepts.has(deptCode);
            const isDeptActive = activeDept === deptCode;
            const totalDocs = deptSections.reduce((sum, s) => sum + s.documents.length, 0);
            return (
              <div key={deptCode}>
                <button
                  onClick={() => toggleDept(deptCode)}
                  className={cn(
                    "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                    isDeptActive && !isExpanded ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", isExpanded ? "" : "-rotate-90", isDeptActive ? "text-blue-500" : "text-gray-300")} />
                    {(() => { const DIcon = DEPT_DASH_ICON[deptCode] || Zap; return <DIcon className={cn("h-3.5 w-3.5 shrink-0", isDeptActive ? "text-blue-500" : "text-gray-400")} />; })()}
                    <span className={cn("text-[10px] font-bold flex-1 leading-tight", isDeptActive ? "text-blue-700" : "text-gray-700")}>
                      {DEPT_LABELS[deptCode] || deptCode}
                    </span>
                    <span className="text-[9px] text-gray-400">{totalDocs}</span>
                  </div>
                </button>
                {isExpanded && deptSections.map(s => {
                  const isActive = activeDept === deptCode && activeFolder === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => selectDeptFolder(deptCode, s.id)}
                      className={cn(
                        "w-full pl-6 pr-2.5 py-1 rounded-lg text-left transition-all cursor-pointer",
                        isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <FolderOpen className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-blue-500" : "text-gray-400")} />
                        <span className={cn("text-[10px] font-medium flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-600")}>
                          {s.label}
                        </span>
                        <span className="text-[9px] text-gray-400">{s.documents.length}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })
        ) : (
          /* Autre département = dossiers du département actif seulement (scopé) */
          (DATA_ROOM_SECTIONS[botCode] || []).map(s => {
            const isActive = activeFolder === s.id;
            return (
              <button
                key={s.id}
                onClick={() => selectDeptFolder(botCode, s.id)}
                className={cn(
                  "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                  isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <FolderOpen className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-blue-500" : "text-gray-400")} />
                  <span className={cn("text-[10px] font-medium flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-600")}>
                    {s.label}
                  </span>
                  <span className="text-[9px] text-gray-400">{s.documents.length}</span>
                </div>
              </button>
            );
          })
        )}

        {/* Separator */}
        <div className={SF.separator} />

        {/* Sections dossiers */}
        <div className="px-2.5 py-1">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Dossiers</span>
        </div>
        {TRANSVERSAL_SECTIONS.map(ts => {
          const isActive = activeFolder === ts.id;
          const TsIcon = ts.icon;
          return (
            <button
              key={ts.id}
              onClick={() => { setActiveFolder(ts.id); setActiveDept(""); setSearchQuery(""); setTypeFilter(null); setStatusFilter(null); setFormatFilter(null); }}
              className={cn(
                "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
              )}
            >
              <div className="flex items-center gap-1.5">
                <TsIcon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-blue-500" : "text-gray-400")} />
                <span className={cn("text-[10px] font-bold flex-1", isActive ? "text-blue-700" : "text-gray-700")}>{ts.label}</span>
              </div>
            </button>
          );
        })}

        {/* Separator */}
        <div className={SF.separator} />

        {/* Templates */}
        <button
          onClick={() => { setActiveFolder("_templates"); setActiveDept(""); setSearchQuery(""); setTypeFilter(null); setStatusFilter(null); setFormatFilter(null); }}
          className={cn(
            "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
            activeFolder === "_templates" ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
          )}
        >
          <div className="flex items-center gap-1.5">
            <Layers className={cn("h-3.5 w-3.5 shrink-0", activeFolder === "_templates" ? "text-blue-500" : "text-gray-400")} />
            <span className={cn("text-[10px] font-bold flex-1", activeFolder === "_templates" ? "text-blue-700" : "text-gray-700")}>Templates</span>
            <span className="text-[9px] text-gray-400">{templates.length}</span>
          </div>
        </button>
      </div>

      {/* Contenu — full height */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* ── Rectangle bleu pastel — titre sous-section active ── */}
        {(isFolderView || activeFolder === "_templates" || TRANSVERSAL_SECTIONS.some(ts => ts.id === activeFolder)) && (
          <div className={cn("bg-gradient-to-r rounded-lg px-4 py-2.5 flex items-center gap-3", headerGradient)}>
            <Database className="h-5 w-5 text-white" />
            <h2 className="text-sm font-bold text-white">
              {activeFolder === "_templates" ? "Templates" : TRANSVERSAL_SECTIONS.find(ts => ts.id === activeFolder)?.label || activeSection?.label || ""}
            </h2>
          </div>
        )}

        {/* ── Toolbar — SF standard ── */}
        {(isFolderView || activeFolder === "_templates") && (
          <div className={SF.toolbarWrap}>
            <div className={SF.searchWrap}>
              <Search className={SF.searchIcon} />
              <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className={SF.searchInput} />
            </div>
            <span className={SF.itemCount}>{isFolderView ? `${filteredDocs.length} items` : ""}</span>
            {/* Sort dropdown (pattern DocumentsUnifie) */}
            <div className="relative">
              <button onClick={() => setShowSort(!showSort)} className="flex items-center gap-1 px-2 py-1.5 text-[9px] font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <Filter className="h-3.5 w-3.5" />
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                  {DR_SORT_OPTIONS.map(o => (
                    <button key={o.field} onClick={() => { if (sortField === o.field) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortField(o.field); setSortDir("asc"); } setShowSort(false); }}
                      className={cn("w-full text-left px-3 py-1.5 text-[9px] font-medium hover:bg-gray-50 transition-colors cursor-pointer", sortField === o.field ? "text-blue-600 bg-blue-50" : "text-gray-600")}>
                      {o.label} {sortField === o.field && (sortDir === "asc" ? "↑" : "↓")}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* + Nouveau (pattern SharePoint) */}
            <button className="flex items-center gap-1 px-3 py-1.5 text-[9px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shrink-0 cursor-pointer">
              <Plus className="h-3.5 w-3.5" /> Nouveau
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 text-[9px] font-bold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors shrink-0 cursor-pointer">
              <Upload className="h-3.5 w-3.5" /> Importer
            </button>
            {/* Vue mode compact toggle (pattern DocumentsUnifie) */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
              {([["list", LayoutList], ["cards", LayoutGrid], ["table", Table2]] as [DataRoomViewMode, React.ElementType][]).map(([mode, Icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)} className={cn("p-1.5 transition-colors cursor-pointer", viewMode === mode ? "bg-blue-600 text-white" : "bg-white text-gray-400 hover:text-gray-600")}>
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Filter pills (simplifie — Statut + Type + Format — pattern DocumentsUnifie) ── */}
        {isFolderView && activeSection && (
          <div className="flex items-center gap-3 flex-wrap">
            {/* Statut */}
            <div className="flex items-center gap-1.5">
              {Object.entries(STATUT_BADGE).filter(([k]) => statusCounts[k]).map(([k, v]) => (
                <button key={k} onClick={() => setStatusFilter(statusFilter === k ? null : k)}
                  className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
                    statusFilter === k ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
                  {v.label} ({statusCounts[k]})
                </button>
              ))}
            </div>
            {/* Type d'actif */}
            {Object.keys(typeCounts).length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-gray-400 font-medium">Type:</span>
                {ASSET_TYPES.filter(at => typeCounts[at.docType]).map(at => (
                  <button key={at.id} onClick={() => setTypeFilter(typeFilter === at.docType ? null : at.docType)}
                    className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
                      typeFilter === at.docType ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
                    {at.label} ({typeCounts[at.docType]})
                  </button>
                ))}
              </div>
            )}
            {/* Format */}
            {Object.keys(formatCounts).length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-gray-400 font-medium">Format:</span>
                {Object.entries(FORMAT_BADGE).filter(([k]) => formatCounts[k]).map(([k, v]) => (
                  <button key={k} onClick={() => setFormatFilter(formatFilter === k ? null : k)}
                    className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors border cursor-pointer",
                      formatFilter === k ? "bg-amber-600 text-white border-amber-600" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
                    {v.label} ({formatCounts[k]})
                  </button>
                ))}
              </div>
            )}
            {(typeFilter || formatFilter || statusFilter) && (
              <button onClick={() => { setTypeFilter(null); setFormatFilter(null); setStatusFilter(null); }} className="text-[9px] text-gray-400 hover:text-gray-600 cursor-pointer underline">Effacer filtres</button>
            )}
          </div>
        )}

        {/* Content */}
        {activeFolder === "_consolidee" && botCode === "CEOB" ? (
          <DataRoomVueConsolidee onNavigateDept={(code) => {
            const deptSections = DATA_ROOM_SECTIONS[code];
            if (deptSections && deptSections.length > 0) selectDeptFolder(code, deptSections[0].id);
          }} />
        ) : activeFolder === "_consolidee" ? (
          /* Vue d'ensemble département (non-CEOB) — grille des catégories avec compteurs */
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              {(() => { const DIcon = DEPT_DASH_ICON[botCode] || Database; return <DIcon className="h-4 w-4 text-blue-600" />; })()}
              <span className="text-xs font-bold text-gray-800">Data Room — {DEPT_SHORT_LABEL[botCode] || botCode}</span>
              <span className="text-[9px] text-gray-400">{sections.length} dossiers · {sections.reduce((s, c) => s + c.documents.length, 0)} documents</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(DATA_ROOM_SECTIONS[botCode] || []).map(cat => {
                const CatIcon = cat.icon;
                const critiques = cat.documents.filter(d => d.critique).length;
                const actifs = cat.documents.filter(d => d.statut === "actif").length;
                return (
                  <div key={cat.id}
                    onClick={() => selectDeptFolder(botCode, cat.id)}
                    className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                      <CatIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                      <span className="text-sm font-bold text-gray-900 flex-1 truncate">{cat.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{cat.documents.length}</span>
                    </div>
                    <div className="px-4 py-3 space-y-1.5">
                      <p className="text-[9px] text-gray-500">Volume estimé : {cat.volume}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-emerald-600 font-medium">{actifs} actifs</span>
                        {critiques > 0 && <span className="text-[9px] text-red-500 font-medium">{critiques} critiques</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeFolder === "_templates" ? (
          <DataRoomTemplatesList botCode={botCode} viewMode={viewMode} />
        ) : TRANSVERSAL_SECTIONS.some(ts => ts.id === activeFolder) ? (
          /* Dossiers sections */
          <div className="space-y-3">
            <p className="text-[10px] text-gray-500">Regroupe les dossiers de tous les départements liés à cette catégorie.</p>
            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-[10px] text-gray-400">Contenu à venir — cette section agrégera les documents transversaux.</p>
            </div>
          </div>
        ) : isFolderView ? (
          <DataRoomAssetList documents={filteredDocs} viewMode={viewMode} sortField={sortField} sortDir={sortDir} onSort={(f) => { if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortField(f); setSortDir("asc"); } }} />
        ) : (
          <p className="text-xs text-gray-400 text-center py-8">Selectionnez un dossier</p>
        )}
      </div>
    </div>
    </div>
  );
}

// ══════════════════════════════════════════
// PLAYBOOKS — Mes playbooks + Recommandés + Store (layout DocForge)
// ══════════════════════════════════════════

// 100+ playbooks from RESULT-07 deep search — Catalogue de base gratuit + Premium + Conference AI
const PLAYBOOK_STORE_DATA: { id: string; nom: string; departement: string; bots: string[]; etapes: number; duree: string; niveau: "Quick Win" | "Standard" | "Avance" | "Enterprise"; prix: string; rating: number; downloads: number; categorie: string; description: string; pilier: string; type: string }[] = [
  // ═══ DIRECTION / CEO (CarlOS) — 9 playbooks ═══
  { id: "pb-001", nom: "Revue hebdomadaire de direction", departement: "CEOB", bots: ["CarlOS", "Frank"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 1245, categorie: "Performance", pilier: "Temps", description: "Analyse des KPIs, fixation des priorites hebdomadaires, blockers a debloquer.", type: "mission" },
  { id: "pb-002", nom: "Preparation ordre du jour CA", departement: "CEOB", bots: ["CarlOS", "Loulou"], etapes: 7, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 567, categorie: "Gouvernance", pilier: "Actif", description: "Structure et compilation des donnees pour le conseil d'administration.", type: "document" },
  { id: "pb-003", nom: "Alignement OKR trimestriel", departement: "CEOB", bots: ["CarlOS", "Simone"], etapes: 9, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 891, categorie: "Strategie", pilier: "Idee", description: "Definition des objectifs cles et resultats attendus, cascade vers les departements.", type: "mission" },
  { id: "pb-004", nom: "Bilan annuel synthetique", departement: "CEOB", bots: ["CarlOS", "Mathilde"], etapes: 12, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 432, categorie: "Reporting", pilier: "Actif", description: "Agregation des accomplissements pour presentation aux parties prenantes.", type: "document" },
  { id: "pb-005", nom: "Memo direction general", departement: "CEOB", bots: ["CarlOS", "Helene"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 678, categorie: "Communication", pilier: "Temps", description: "Redaction et diffusion d'une communication interne structuree.", type: "document" },
  { id: "pb-006", nom: "Triage des urgences", departement: "CEOB", bots: ["CarlOS", "Sebastien"], etapes: 6, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 345, categorie: "Gestion crise", pilier: "Temps", description: "Analyse initiale des crises et assignation des taches par priorite.", type: "tache" },
  { id: "pb-007", nom: "Audit rapide culture entreprise", departement: "CEOB", bots: ["CarlOS", "Helene"], etapes: 8, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 234, categorie: "Culture", pilier: "Actif", description: "Sondage de pouls et analyse du climat organisationnel avec recommandations.", type: "diagnostic" },
  { id: "pb-008", nom: "Matrice RACI de projet", departement: "CEOB", bots: ["CarlOS", "Olivier"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 789, categorie: "Gestion projet", pilier: "Temps", description: "Assignation claire des responsabilites d'execution (Responsible, Accountable, Consulted, Informed).", type: "tache" },
  { id: "pb-009", nom: "Pre-qualification investisseur", departement: "CEOB", bots: ["CarlOS", "Frank"], etapes: 6, duree: "20min", niveau: "Quick Win", prix: "$49", rating: 4.4, downloads: 156, categorie: "Financement", pilier: "Argent", description: "Analyse preliminaire de l'adequation d'un VC/investisseur avec votre profil.", type: "diagnostic" },
  // ═══ TECHNOLOGIE / CTO (Tim) — 9 playbooks ═══
  { id: "pb-110", nom: "Onboarding logiciel standard", departement: "CTOB", bots: ["Tim", "Helene"], etapes: 6, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 567, categorie: "Onboarding", pilier: "Temps", description: "Creation des acces aux plateformes SaaS, configuration initiale, checklist securite.", type: "flow" },
  { id: "pb-111", nom: "Inventaire stack technologique", departement: "CTOB", bots: ["Tim", "Frank"], etapes: 8, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 345, categorie: "Audit", pilier: "Argent", description: "Compilation de tous les abonnements SaaS, couts mensuels et redondances.", type: "diagnostic" },
  { id: "pb-112", nom: "Triage ticket support IT", departement: "CTOB", bots: ["Tim", "Olivier"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.3, downloads: 890, categorie: "Support", pilier: "Temps", description: "Classification et routage automatise des demandes de depannage technique.", type: "tache" },
  { id: "pb-113", nom: "Verification sauvegardes", departement: "CTOB", bots: ["Tim", "Sebastien"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 456, categorie: "Securite", pilier: "Actif", description: "Audit automatise des procedures de backup et verification d'integrite.", type: "tache" },
  { id: "pb-114", nom: "Deduplication base de donnees CRM", departement: "CTOB", bots: ["Tim", "Rich"], etapes: 6, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 234, categorie: "Data quality", pilier: "Actif", description: "Nettoyage et fusion des fiches contacts doublons dans le CRM.", type: "tache" },
  { id: "pb-115", nom: "Revue architecture TI", departement: "CTOB", bots: ["Tim", "CarlOS"], etapes: 9, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 178, categorie: "Architecture", pilier: "Idee", description: "Analyse des points de defaillance uniques (SPOF) et recommandations d'evolution.", type: "diagnostic" },
  { id: "pb-116", nom: "Migration cloud structuree", departement: "CTOB", bots: ["Tim", "Sebastien", "Olivier"], etapes: 16, duree: "6 sem.", niveau: "Enterprise", prix: "$299", rating: 4.7, downloads: 98, categorie: "Infrastructure", pilier: "Actif", description: "Plan de migration cloud complet avec analyse risques, timeline et rollback.", type: "chantier" },
  { id: "pb-117", nom: "Documentation API starter", departement: "CTOB", bots: ["Tim"], etapes: 6, duree: "3 jours", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 456, categorie: "Documentation", pilier: "Actif", description: "Templates et structure pour documenter vos APIs REST avec exemples.", type: "document" },
  { id: "pb-118", nom: "Renouvellement SSL et domaines", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 1234, categorie: "Maintenance", pilier: "Actif", description: "Alertes et renouvellement automatique des certificats SSL et noms de domaine.", type: "tache" },
  // ═══ FINANCE / CFO (Frank) — 9 playbooks ═══
  { id: "pb-020", nom: "Facturation fin de mois", departement: "CFOB", bots: ["Frank", "Rich"], etapes: 6, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 678, categorie: "Comptabilite", pilier: "Argent", description: "Compilation et envoi automatise des factures mensuelles aux clients.", type: "flow" },
  { id: "pb-021", nom: "Relance comptes impayes", departement: "CFOB", bots: ["Frank", "CarlOS"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 890, categorie: "Recouvrement", pilier: "Argent", description: "Sequence de courriels echelonnes pour relancer les factures en souffrance.", type: "flow" },
  { id: "pb-022", nom: "Categorisation recus (IA)", departement: "CFOB", bots: ["Frank"], etapes: 8, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 345, categorie: "Comptabilite", pilier: "Temps", description: "Analyse optique OCR des recus et ventilation automatique au grand livre.", type: "flow" },
  { id: "pb-023", nom: "Rapprochement bancaire", departement: "CFOB", bots: ["Frank"], etapes: 7, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.2, downloads: 567, categorie: "Comptabilite", pilier: "Argent", description: "Tri automatise des transactions selon les extraits bancaires.", type: "flow" },
  { id: "pb-024", nom: "Compilation TPS/TVQ", departement: "CFOB", bots: ["Frank", "Loulou"], etapes: 9, duree: "40min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 456, categorie: "Fiscalite", pilier: "Argent", description: "Preparation des totaux pour les declarations de taxes (TPS/TVQ).", type: "flow" },
  { id: "pb-025", nom: "Flash report sante financiere", departement: "CFOB", bots: ["Frank"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 1123, categorie: "Reporting", pilier: "Argent", description: "Synthese en temps reel des liquidites, marges et burn rate.", type: "diagnostic" },
  { id: "pb-026", nom: "Circuit approbation achats", departement: "CFOB", bots: ["Frank", "CarlOS"], etapes: 6, duree: "20min", niveau: "Standard", prix: "$49", rating: 4.1, downloads: 234, categorie: "Controle", pilier: "Argent", description: "Escalade selon les seuils d'autorisation budgetaire (1K, 5K, 10K+).", type: "flow" },
  { id: "pb-027", nom: "Projection tresorerie 30 jours", departement: "CFOB", bots: ["Frank", "Simone"], etapes: 8, duree: "35min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 345, categorie: "Previsions", pilier: "Argent", description: "Modelisation des flux monetaires a court terme avec scenarios.", type: "diagnostic" },
  { id: "pb-028", nom: "Modelisation financiere startup", departement: "CFOB", bots: ["Frank", "CarlOS"], etapes: 10, duree: "1 sem.", niveau: "Avance", prix: "$149", rating: 4.7, downloads: 178, categorie: "Previsions", pilier: "Argent", description: "Modele financier complet (P&L, CF, bilan) avec projections 36 mois et scenarios.", type: "projet" },
  // ═══ MARKETING / CMO (Mathilde) — 9 playbooks ═══
  { id: "pb-030", nom: "Publication multi-reseaux", departement: "CMOB", bots: ["Mathilde"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 1567, categorie: "Social media", pilier: "Vente", description: "Adaptation du format et programmation du contenu sur LinkedIn, FB, Instagram.", type: "flow" },
  { id: "pb-031", nom: "Recyclage contenu blog", departement: "CMOB", bots: ["Mathilde", "Ines"], etapes: 7, duree: "25min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 678, categorie: "Contenu", pilier: "Vente", description: "Extraction d'un article de blog en publications sociales, carousel et infographie.", type: "flow" },
  { id: "pb-032", nom: "Creation infolettre mensuelle", departement: "CMOB", bots: ["Mathilde", "Tim"], etapes: 8, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 456, categorie: "Email", pilier: "Vente", description: "Brouillon, curation de liens et mise en page pour newsletter mensuelle.", type: "flow" },
  { id: "pb-033", nom: "Analyse performance campagne", departement: "CMOB", bots: ["Mathilde", "Frank"], etapes: 6, duree: "20min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 345, categorie: "Analytics", pilier: "Vente", description: "Synthese du cout par acquisition (CPA), ROAS et recommandations d'optimisation.", type: "diagnostic" },
  { id: "pb-034", nom: "Generation brief creatif", departement: "CMOB", bots: ["Mathilde", "Paco"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.2, downloads: 567, categorie: "Branding", pilier: "Idee", description: "Documentation des exigences creatives pour designer externe ou production.", type: "document" },
  { id: "pb-035", nom: "Audit SEO de base", departement: "CMOB", bots: ["Mathilde", "Tim"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 789, categorie: "SEO", pilier: "Actif", description: "Verification des balises meta, liens brises, vitesse et recommandations.", type: "diagnostic" },
  { id: "pb-036", nom: "Veille concurrentielle basique", departement: "CMOB", bots: ["Mathilde", "Simone"], etapes: 6, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 345, categorie: "Veille", pilier: "Idee", description: "Scraping de positionnement des 3 principaux rivaux, matrice comparative.", type: "diagnostic" },
  { id: "pb-037", nom: "Creation persona ICP", departement: "CMOB", bots: ["Mathilde", "Rich", "Simone"], etapes: 6, duree: "3 jours", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 1234, categorie: "Strategie", pilier: "Vente", description: "Atelier structure pour definir vos personas ICP avec templates et guide d'entrevue.", type: "blueprint" },
  { id: "pb-038", nom: "Lancement campagne digitale", departement: "CMOB", bots: ["Mathilde", "Rich"], etapes: 12, duree: "2 sem.", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 456, categorie: "Campagnes", pilier: "Vente", description: "Planification et execution d'une campagne multi-canal avec tracking ROI.", type: "projet" },
  // ═══ STRATEGIE / CSO (Simone) — 8 playbooks ═══
  { id: "pb-040", nom: "Matrice SWOT flash", departement: "CSOB", bots: ["Simone", "CarlOS"], etapes: 5, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 890, categorie: "Analyse", pilier: "Idee", description: "Generation des forces, faiblesses, opportunites et menaces en format visuel.", type: "diagnostic" },
  { id: "pb-041", nom: "Cartographie positionnement marche", departement: "CSOB", bots: ["Simone", "Mathilde"], etapes: 7, duree: "35min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 345, categorie: "Positionnement", pilier: "Idee", description: "Analyse des axes de differenciation vs concurrence avec matrice.", type: "blueprint" },
  { id: "pb-042", nom: "Synthese tendances sectorielles", departement: "CSOB", bots: ["Simone"], etapes: 4, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 678, categorie: "Veille", pilier: "Idee", description: "Resume executif des rapports de l'industrie et tendances emergentes.", type: "diagnostic" },
  { id: "pb-043", nom: "Scenario perte client majeur", departement: "CSOB", bots: ["Simone", "Frank"], etapes: 6, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 234, categorie: "Risques", pilier: "Actif", description: "Calcul d'impact de la perte du plus gros compte + plan de mitigation.", type: "diagnostic" },
  { id: "pb-044", nom: "Evaluation partenariat strategique", departement: "CSOB", bots: ["Simone", "Rich"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 456, categorie: "Alliances", pilier: "Vente", description: "Grille de ponderation pour evaluer les alliances B2B potentielles.", type: "diagnostic" },
  { id: "pb-045", nom: "Business Model Canvas workshop", departement: "CSOB", bots: ["Simone", "CarlOS"], etapes: 4, duree: "1 jour", niveau: "Quick Win", prix: "Gratuit", rating: 4.9, downloads: 1567, categorie: "Innovation", pilier: "Idee", description: "Atelier guide pour completer votre BMC avec exemples sectoriels.", type: "blueprint" },
  { id: "pb-046", nom: "Analyse risques macro-economiques", departement: "CSOB", bots: ["Simone", "Frank"], etapes: 6, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 189, categorie: "Risques", pilier: "Argent", description: "Impact modelise de l'inflation, taux d'interet et recession sur votre entreprise.", type: "diagnostic" },
  { id: "pb-047", nom: "Analyse concurrentielle 360", departement: "CSOB", bots: ["Simone", "Mathilde"], etapes: 10, duree: "1 sem.", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 234, categorie: "Veille", pilier: "Idee", description: "Analyse approfondie de 5-10 concurrents avec matrice et recommandations strategiques.", type: "projet" },
  // ═══ OPERATIONS / COO (Olivier) — 9 playbooks ═══
  { id: "pb-050", nom: "Standardisation processus (SOP)", departement: "COOB", bots: ["Olivier", "Tim"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 567, categorie: "Processus", pilier: "Temps", description: "Extraction de la logique d'un processus et mise en format SOP officiel.", type: "flow" },
  { id: "pb-051", nom: "Plan continuite des affaires", departement: "COOB", bots: ["Olivier", "Sebastien"], etapes: 12, duree: "2 sem.", niveau: "Avance", prix: "$99", rating: 4.5, downloads: 234, categorie: "Resilience", pilier: "Actif", description: "Elaboration d'un PCA complet avec scenarios de crise et procedures de reprise.", type: "chantier" },
  { id: "pb-052", nom: "Inventaire theorique mensuel", departement: "COOB", bots: ["Olivier", "Frank"], etapes: 7, duree: "35min", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 345, categorie: "Inventaire", pilier: "Argent", description: "Rapprochement des ventes et du stock presume, ecarts identifies.", type: "mission" },
  { id: "pb-053", nom: "Commande reapprovisionnement", departement: "COOB", bots: ["Olivier", "Frank"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 678, categorie: "Achats", pilier: "Argent", description: "Envoi automatise aux fournisseurs approuves quand seuil atteint.", type: "tache" },
  { id: "pb-054", nom: "Logbook entretien preventif", departement: "COOB", bots: ["Olivier", "Paco"], etapes: 6, duree: "25min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 456, categorie: "Maintenance", pilier: "Actif", description: "Suivi de la maintenance preventive de l'equipement avec alertes echeancier.", type: "mission" },
  { id: "pb-055", nom: "Rapport qualite et non-conformite", departement: "COOB", bots: ["Olivier", "Paco"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 345, categorie: "Qualite", pilier: "Actif", description: "Journalisation des defauts et anomalies avec analyse des causes racines.", type: "tache" },
  { id: "pb-056", nom: "Analyse des temps morts", departement: "COOB", bots: ["Olivier", "CarlOS"], etapes: 8, duree: "40min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 234, categorie: "Amelioration", pilier: "Temps", description: "Identification des inefficacites operationnelles majeures et plan d'action.", type: "diagnostic" },
  { id: "pb-057", nom: "Cartographie des processus", departement: "COOB", bots: ["Olivier", "Tim"], etapes: 10, duree: "2 sem.", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 178, categorie: "Amelioration", pilier: "Temps", description: "Documentation et optimisation de vos processus cles avec goulots identifies.", type: "projet" },
  { id: "pb-058", nom: "Protocole fermeture bureau", departement: "COOB", bots: ["Olivier", "Sebastien"], etapes: 3, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 890, categorie: "Securite", pilier: "Actif", description: "Checklist de securite et desactivation des systemes en fin de journee.", type: "tache" },
  // ═══ PRODUCTION / CPO (Paco) — 9 playbooks ═══
  { id: "pb-060", nom: "Generation BOM (Bill of Materials)", departement: "CPOB", bots: ["Paco", "Frank"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 345, categorie: "Ingenierie", pilier: "Actif", description: "Compilation des intrants necessaires avec couts unitaires et fournisseurs.", type: "document" },
  { id: "pb-061", nom: "Emission ordre de fabrication", departement: "CPOB", bots: ["Paco", "Olivier"], etapes: 7, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 456, categorie: "Production", pilier: "Temps", description: "Lancement officiel et validation des specifications de fabrication.", type: "document" },
  { id: "pb-062", nom: "Controle qualite fin de ligne", departement: "CPOB", bots: ["Paco", "Loulou"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 567, categorie: "Qualite", pilier: "Actif", description: "Inspection visuelle et consignation des resultats avec photos.", type: "tache" },
  { id: "pb-063", nom: "Journalisation rebuts (scrap log)", departement: "CPOB", bots: ["Paco", "Frank"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.2, downloads: 234, categorie: "Qualite", pilier: "Argent", description: "Suivi et calcul de la perte financiere associee aux rebuts de production.", type: "tache" },
  { id: "pb-064", nom: "Planification quarts de travail", departement: "CPOB", bots: ["Paco", "Helene"], etapes: 6, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 345, categorie: "Planification", pilier: "Temps", description: "Allocation des ressources humaines sur la chaine de production par quarts.", type: "mission" },
  { id: "pb-065", nom: "Calcul capacite production", departement: "CPOB", bots: ["Paco", "Olivier"], etapes: 7, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 234, categorie: "Planification", pilier: "Temps", description: "Evaluation de la charge vs ressources disponibles avec goulots identifies.", type: "diagnostic" },
  { id: "pb-066", nom: "Mise en place 5S usine", departement: "CPOB", bots: ["Paco", "Olivier"], etapes: 15, duree: "4 sem.", niveau: "Enterprise", prix: "$199", rating: 4.4, downloads: 89, categorie: "Lean", pilier: "Temps", description: "Implementation complete de la methodologie 5S avec audits et suivi.", type: "chantier" },
  { id: "pb-067", nom: "Brief ingenierie prototype", departement: "CPOB", bots: ["Paco", "Ines"], etapes: 8, duree: "40min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 178, categorie: "R&D", pilier: "Idee", description: "Demande de creation pour de nouveaux modeles avec specs et criteres.", type: "document" },
  { id: "pb-068", nom: "Tracabilite modifications recette", departement: "CPOB", bots: ["Paco", "Ines"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 123, categorie: "Qualite", pilier: "Actif", description: "Suivi des versions d'assemblage ou de formulation avec approbations.", type: "flow" },
  // ═══ RH / CHRO (Helene) — 9 playbooks ═══
  { id: "pb-070", nom: "Redaction offre d'emploi", departement: "CHROB", bots: ["Helene", "Mathilde"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 789, categorie: "Recrutement", pilier: "Actif", description: "Structure du profil recherche, exigences et affichage multi-plateformes.", type: "document" },
  { id: "pb-071", nom: "Onboarding RH complet", departement: "CHROB", bots: ["Helene", "Loulou"], etapes: 9, duree: "40min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 1234, categorie: "Integration", pilier: "Temps", description: "Signature contrat, code de conduite, inscription paie et plan 30-60-90 jours.", type: "flow" },
  { id: "pb-072", nom: "Offboarding employe", departement: "CHROB", bots: ["Helene", "Tim"], etapes: 8, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 456, categorie: "Depart", pilier: "Actif", description: "Desactivation d'acces, remise de materiel, entrevue de depart structuree.", type: "flow" },
  { id: "pb-073", nom: "Evaluation performance annuelle", departement: "CHROB", bots: ["Helene", "CarlOS"], etapes: 6, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 567, categorie: "Performance", pilier: "Actif", description: "Generation de la grille d'evaluation avec auto-evaluation et feedback 360.", type: "mission" },
  { id: "pb-074", nom: "Approbation conges et absences", departement: "CHROB", bots: ["Helene", "Olivier"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 890, categorie: "Administration", pilier: "Temps", description: "Validation et mise a jour du calendrier d'equipe automatiquement.", type: "tache" },
  { id: "pb-075", nom: "Alerte echeance formation CNESST", departement: "CHROB", bots: ["Helene", "Loulou"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.3, downloads: 345, categorie: "Conformite", pilier: "Actif", description: "Suivi des certifications de securite obligatoires avec rappels automatiques.", type: "tache" },
  { id: "pb-076", nom: "Sondage climat de travail", departement: "CHROB", bots: ["Helene", "Simone"], etapes: 7, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 234, categorie: "Culture", pilier: "Actif", description: "Elaboration de questions anonymes, agregation des resultats et recommandations.", type: "diagnostic" },
  { id: "pb-077", nom: "Declaration accident travail CNESST", departement: "CHROB", bots: ["Helene", "Loulou"], etapes: 8, duree: "35min", niveau: "Standard", prix: "Gratuit", rating: 4.2, downloads: 178, categorie: "Conformite", pilier: "Argent", description: "Aide au remplissage du formulaire officiel CNESST avec documentation requise.", type: "document" },
  { id: "pb-078", nom: "Evaluation performance 360", departement: "CHROB", bots: ["Helene", "CarlOS"], etapes: 8, duree: "1 sem.", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 345, categorie: "Performance", pilier: "Actif", description: "Processus complet avec auto-evaluation, feedback collegues et plan de developpement.", type: "mission" },
  // ═══ INNOVATION / CINO (Ines) — 8 playbooks ═══
  { id: "pb-080", nom: "Brainstorming nouveau produit", departement: "CINOB", bots: ["Ines", "Mathilde"], etapes: 6, duree: "40min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 567, categorie: "Ideation", pilier: "Idee", description: "Seance d'ideation structuree avec matrice de filtres et scoring.", type: "conference" },
  { id: "pb-081", nom: "Recherche anteriorite brevets", departement: "CINOB", bots: ["Ines", "Loulou"], etapes: 5, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 178, categorie: "PI", pilier: "Actif", description: "Balayage preliminaire des bases de donnees publiques de brevets.", type: "diagnostic" },
  { id: "pb-082", nom: "Triage boite a idees", departement: "CINOB", bots: ["Ines", "CarlOS"], etapes: 4, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 789, categorie: "Ideation", pilier: "Idee", description: "Evaluation rapide des suggestions de l'equipe avec criteres de faisabilite.", type: "tache" },
  { id: "pb-083", nom: "Synthese veille technologique", departement: "CINOB", bots: ["Ines", "Tim"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 456, categorie: "Veille", pilier: "Idee", description: "Compilation des avancees recentes du secteur avec impact potentiel.", type: "diagnostic" },
  { id: "pb-084", nom: "Evaluation faisabilite technique", departement: "CINOB", bots: ["Ines", "Tim"], etapes: 7, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 234, categorie: "R&D", pilier: "Idee", description: "Analyse d'un nouveau concept de processus avec criteres go/no-go.", type: "diagnostic" },
  { id: "pb-085", nom: "Tracking heures R&D (RS&DE)", departement: "CINOB", bots: ["Ines", "Frank"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 345, categorie: "Fiscalite", pilier: "Argent", description: "Log pour recuperation de credits d'impot RS&DE federal et provincial.", type: "flow" },
  { id: "pb-086", nom: "Sprint Design Thinking", departement: "CINOB", bots: ["Ines", "Mathilde", "Rich"], etapes: 10, duree: "1 sem.", niveau: "Avance", prix: "$99", rating: 4.8, downloads: 234, categorie: "Innovation", pilier: "Idee", description: "Sprint de 5 jours base sur le Design Thinking avec livrables concrets.", type: "projet" },
  { id: "pb-087", nom: "Definition POC (Preuve de concept)", departement: "CINOB", bots: ["Ines", "Paco"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 345, categorie: "R&D", pilier: "Idee", description: "Etablissement des criteres de succes et plan d'execution du POC.", type: "document" },
  // ═══ JURIDIQUE / CLO (Loulou) — 5 playbooks ═══
  { id: "pb-090", nom: "Conformite Loi 25 (vie privee)", departement: "CLOB", bots: ["Loulou", "Sebastien", "Tim"], etapes: 14, duree: "4 sem.", niveau: "Enterprise", prix: "$199", rating: 4.6, downloads: 567, categorie: "Conformite", pilier: "Actif", description: "Mise en conformite complete: nomination RPRP, inventaire donnees, politique, registre.", type: "chantier" },
  { id: "pb-091", nom: "Redaction NDA mutuel", departement: "CLOB", bots: ["Loulou"], etapes: 4, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 890, categorie: "Contrats", pilier: "Actif", description: "Generation d'un accord de confidentialite bilingue avec clauses standard.", type: "document" },
  { id: "pb-092", nom: "Revue contrat fournisseur", departement: "CLOB", bots: ["Loulou", "Frank"], etapes: 6, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 345, categorie: "Contrats", pilier: "Actif", description: "Analyse des clauses cles, risques et recommandations de negociation.", type: "diagnostic" },
  { id: "pb-093", nom: "Audit conformite reglementaire", departement: "CLOB", bots: ["Loulou", "CarlOS"], etapes: 10, duree: "1 sem.", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 178, categorie: "Conformite", pilier: "Actif", description: "Verification complete des obligations legales par secteur d'activite.", type: "diagnostic" },
  { id: "pb-094", nom: "Protection marque de commerce", departement: "CLOB", bots: ["Loulou", "Ines"], etapes: 8, duree: "2 sem.", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 234, categorie: "PI", pilier: "Actif", description: "Processus de depot de marque avec recherche de disponibilite et suivi.", type: "projet" },
  // ═══ CYBERSECURITE / CISO (Sebastien) — 5 playbooks ═══
  { id: "pb-100", nom: "Audit securite baseline", departement: "CISOB", bots: ["Sebastien", "Tim"], etapes: 10, duree: "1 sem.", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 345, categorie: "Audit", pilier: "Actif", description: "Evaluation de votre posture de securite: MFA, sauvegardes, acces, vulnerabilites.", type: "diagnostic" },
  { id: "pb-101", nom: "Plan reponse incidents cyber", departement: "CISOB", bots: ["Sebastien", "Tim", "Loulou"], etapes: 12, duree: "2 sem.", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 178, categorie: "Gestion crise", pilier: "Actif", description: "Isolement reseau, evaluation obligations legales, communication de crise.", type: "projet" },
  { id: "pb-102", nom: "Formation anti-hameconnage", departement: "CISOB", bots: ["Sebastien", "Helene"], etapes: 6, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 567, categorie: "Formation", pilier: "Actif", description: "Module de sensibilisation au phishing avec exemples et quiz.", type: "formation" },
  { id: "pb-103", nom: "Revue acces utilisateurs", departement: "CISOB", bots: ["Sebastien", "Tim"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.3, downloads: 456, categorie: "IAM", pilier: "Actif", description: "Audit des comptes actifs, permissions excessives et comptes orphelins.", type: "tache" },
  { id: "pb-104", nom: "Checklist sauvegarde mensuelle", departement: "CISOB", bots: ["Sebastien"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 890, categorie: "Backup", pilier: "Actif", description: "Verification integrite des sauvegardes, test de restauration et rapport.", type: "tache" },
  // ═══ VENTES / CRO (Rich) — 5 playbooks ═══
  { id: "pb-010", nom: "Pipeline prospection B2B", departement: "CROB", bots: ["Rich", "Mathilde"], etapes: 10, duree: "1 sem.", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 567, categorie: "Prospection", pilier: "Vente", description: "Mise en place d'un pipeline B2B structure avec sequences email et relances.", type: "projet" },
  { id: "pb-011", nom: "Onboarding nouveau client", departement: "CROB", bots: ["Rich", "Olivier"], etapes: 8, duree: "2 sem.", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 345, categorie: "Service client", pilier: "Vente", description: "Processus d'accueil structure avec checklist et follow-ups automatises.", type: "flow" },
  { id: "pb-012", nom: "Closing accelerator", departement: "CROB", bots: ["Rich", "Simone"], etapes: 6, duree: "3 jours", niveau: "Avance", prix: "$99", rating: 4.9, downloads: 178, categorie: "Negociation", pilier: "Vente", description: "Techniques avancees de closing avec analyse objections et scripts personnalises.", type: "formation" },
  { id: "pb-013", nom: "Qualification leads BANT", departement: "CROB", bots: ["Rich", "CarlOS"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 890, categorie: "Qualification", pilier: "Vente", description: "Grille Budget-Autorite-Need-Timeline pour qualifier rapidement les opportunites.", type: "tache" },
  { id: "pb-014", nom: "Win/Loss analysis post-vente", departement: "CROB", bots: ["Rich", "Simone"], etapes: 7, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 234, categorie: "Analytics", pilier: "Vente", description: "Analyse post-mortem des ventes gagnees et perdues avec patterns identifies.", type: "diagnostic" },
  // ═══ CONFERENCE AI — 5 playbooks ═══
  { id: "pb-200", nom: "Board Room — Revue strategique", departement: "CEOB", bots: ["CarlOS", "Simone", "Frank", "Rich"], etapes: 6, duree: "2h", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 1234, categorie: "Conference AI", pilier: "Idee", description: "Session de board avec 4 bots pour revue strategique trimestrielle.", type: "conference" },
  { id: "pb-201", nom: "Brainstorm innovation produit", departement: "CINOB", bots: ["Ines", "Mathilde", "Tim", "CarlOS"], etapes: 4, duree: "1h", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 890, categorie: "Conference AI", pilier: "Idee", description: "Session collaborative multi-bots pour generer des idees produit disruptives.", type: "conference" },
  { id: "pb-202", nom: "Coaching leadership 1-on-1", departement: "CEOB", bots: ["CarlOS"], etapes: 8, duree: "45min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 567, categorie: "Conference AI", pilier: "Actif", description: "Session de coaching personnalisee sur le leadership avec exercices pratiques.", type: "conference" },
  { id: "pb-203", nom: "War Room — Gestion de crise", departement: "CEOB", bots: ["CarlOS", "Sebastien", "Loulou", "Frank"], etapes: 8, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 345, categorie: "Conference AI", pilier: "Actif", description: "Session d'urgence multi-bots pour gerer une crise avec plan d'action immediat.", type: "conference" },
  { id: "pb-204", nom: "Podcast interne — Culture talk", departement: "CHROB", bots: ["Helene", "CarlOS"], etapes: 6, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 234, categorie: "Conference AI", pilier: "Actif", description: "Format podcast pour discuter culture, valeurs et engagement d'equipe.", type: "conference" },
  // ═══ TRANSVERSAUX — Playbooks multi-departements ═══
  { id: "pb-300", nom: "Audit annuel complet", departement: "CEOB", bots: ["CarlOS", "Frank", "Loulou", "Sebastien", "Tim"], etapes: 25, duree: "3 mois", niveau: "Enterprise", prix: "$299", rating: 4.8, downloads: 156, categorie: "Audit", pilier: "Actif", description: "Orchestration transversale: lasses fiscales, revue contrats, audit acces, conformite ISO.", type: "chantier" },
  { id: "pb-301", nom: "Go-To-Market nouveau produit", departement: "CMOB", bots: ["Mathilde", "Rich", "Frank", "Paco", "Simone"], etapes: 18, duree: "6 sem.", niveau: "Enterprise", prix: "$199", rating: 4.7, downloads: 234, categorie: "Lancement", pilier: "Vente", description: "Specs produit + strategie prix + plan marketing + pipeline ventes + formation equipe.", type: "chantier" },
  { id: "pb-302", nom: "Integration nouvel employe complete", departement: "CHROB", bots: ["Helene", "Tim", "Loulou", "Olivier"], etapes: 15, duree: "90 jours", niveau: "Avance", prix: "$49", rating: 4.6, downloads: 567, categorie: "Onboarding", pilier: "Temps", description: "Contrat + acces IT + plan 30-60-90 + formation securite + evaluation probation.", type: "flow" },
  { id: "pb-303", nom: "Dossier reclamation RS&DE", departement: "CINOB", bots: ["Ines", "Frank", "Tim", "Sebastien"], etapes: 14, duree: "4 sem.", niveau: "Enterprise", prix: "$199", rating: 4.5, downloads: 178, categorie: "Fiscalite", pilier: "Argent", description: "Logs techniques, narration scientifique, donnees financieres T661 et credit Quebec.", type: "projet" },
  { id: "pb-304", nom: "Plan d'affaires complet", departement: "CEOB", bots: ["CarlOS", "Frank", "Mathilde", "Simone"], etapes: 20, duree: "2 sem.", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 456, categorie: "Strategie", pilier: "Idee", description: "Synthese executive + projections 3 ans + strategie acquisition + analyse macro.", type: "blueprint" },
  // ═══ COLLABORATION ORBIT⁹ — 20 playbooks réseau ═══
  { id: "pb-O9-001", nom: "Qualification match Orbit⁹", departement: "ORBIT9", bots: ["CarlOS", "Simone"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 890, categorie: "Jumelage", pilier: "Vente", description: "Scoring automatise d'un match potentiel: VITAA croise, complementarite sectorielle, anti-cartel.", type: "diagnostic" },
  { id: "pb-O9-002", nom: "Creation cellule collaborative", departement: "ORBIT9", bots: ["CarlOS", "Olivier"], etapes: 7, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 567, categorie: "Cellules", pilier: "Actif", description: "Wizard de creation de cellule: nom, type, membres, sous-cellules, gouvernance initiale.", type: "flow" },
  { id: "pb-O9-003", nom: "Onboarding nouveau membre reseau", departement: "ORBIT9", bots: ["CarlOS", "Helene"], etapes: 9, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 1234, categorie: "Integration", pilier: "Temps", description: "Profil entreprise, qualification AI, criteres REAI, charte reseau, premier jumelage.", type: "flow" },
  { id: "pb-O9-004", nom: "Trisociation LiveKit — Meeting 3 bots", departement: "ORBIT9", bots: ["CarlOS", "Simone", "Rich"], etapes: 6, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 345, categorie: "Conference AI", pilier: "Idee", description: "Session collaborative avec 3 bots en trisociation pour debloquer un chantier inter-entreprises.", type: "conference" },
  { id: "pb-O9-005", nom: "Evaluation VITAA collectif", departement: "ORBIT9", bots: ["CarlOS"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 678, categorie: "Scoring", pilier: "Actif", description: "Calcul du score VITAA agrege de la cellule avec formule e^(V*I*T) et Triangle du Feu.", type: "diagnostic" },
  { id: "pb-O9-006", nom: "Sprint recrutement pionniers", departement: "ORBIT9", bots: ["CarlOS", "Rich", "Mathilde"], etapes: 12, duree: "4 sem.", niveau: "Avance", prix: "$149", rating: 4.7, downloads: 234, categorie: "Pionniers", pilier: "Vente", description: "Plan 30 jours de recrutement des 9 pionniers: rencontres, scripts, urgence progressive.", type: "reseau" },
  { id: "pb-O9-007", nom: "Negociation accord collaboration", departement: "ORBIT9", bots: ["CarlOS", "Loulou", "Frank"], etapes: 8, duree: "1 sem.", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 345, categorie: "Juridique", pilier: "Actif", description: "Structuration des termes: portee, duree, PI, TimeTokens, clause de sortie.", type: "reseau" },
  { id: "pb-O9-008", nom: "Mediation proactive CarlOS", departement: "ORBIT9", bots: ["CarlOS"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 456, categorie: "Gouvernance", pilier: "Temps", description: "Detection de tensions en meeting, intervention calibree, generation d'action items.", type: "conference" },
  { id: "pb-O9-009", nom: "Distribution TimeTokens mensuelle", departement: "ORBIT9", bots: ["CarlOS", "Frank"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 567, categorie: "TimeTokens", pilier: "Argent", description: "Calcul des contributions, formule 5D (A*D*I*Z*P), attribution et rapport.", type: "flow" },
  { id: "pb-O9-010", nom: "Audit qualite membre reseau", departement: "ORBIT9", bots: ["CarlOS", "Sebastien"], etapes: 8, duree: "35min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 234, categorie: "Qualite", pilier: "Actif", description: "Verification certifications, assurances, score reputation, litiges, taux livraison.", type: "diagnostic" },
  { id: "pb-O9-011", nom: "Planification evenement reseau", departement: "ORBIT9", bots: ["CarlOS", "Olivier", "Mathilde"], etapes: 10, duree: "2 sem.", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 178, categorie: "Evenements", pilier: "Actif", description: "Organisation meetup/webinaire: logistique, invitations, contenu, suivi post-evenement.", type: "reseau" },
  { id: "pb-O9-012", nom: "Scoring VITAAFAST cellule", departement: "ORBIT9", bots: ["CarlOS"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 789, categorie: "Scoring", pilier: "Actif", description: "Evaluation rapide des 5 piliers VITAA pour une cellule specifique avec benchmarks.", type: "diagnostic" },
  { id: "pb-O9-013", nom: "Rotation roles Orbit⁹ (gouvernance)", departement: "ORBIT9", bots: ["CarlOS", "Olivier"], etapes: 6, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 345, categorie: "Gouvernance", pilier: "Temps", description: "Processus de rotation des 4 roles structurels tous les 90 jours.", type: "flow" },
  { id: "pb-O9-014", nom: "Processus de sortie ordonnee", departement: "ORBIT9", bots: ["CarlOS", "Loulou", "Frank"], etapes: 8, duree: "90 jours", niveau: "Avance", prix: "$99", rating: 4.2, downloads: 123, categorie: "Juridique", pilier: "Argent", description: "Protocole selon la matrice 4 quadrants: rachat TT, transition, PI, succession.", type: "reseau" },
  { id: "pb-O9-015", nom: "Qualification fournisseur invite", departement: "ORBIT9", bots: ["CarlOS", "Sebastien"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 890, categorie: "Qualification", pilier: "Actif", description: "Validation automatisee: reputation web, NEQ, LinkedIn, references, certifications.", type: "diagnostic" },
  { id: "pb-O9-016", nom: "Session jumelage assiste IA", departement: "ORBIT9", bots: ["CarlOS", "Simone", "Rich"], etapes: 6, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 567, categorie: "Jumelage", pilier: "Vente", description: "Introduction structuree entre 2 entreprises: brief, presentation croisee, next steps.", type: "conference" },
  { id: "pb-O9-017", nom: "Revue trimestrielle cellule", departement: "ORBIT9", bots: ["CarlOS", "Olivier", "Frank"], etapes: 8, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 456, categorie: "Performance", pilier: "Temps", description: "Bilan VITAA collectif, ROI chantiers, heures sauvees, objectifs Q+1.", type: "mission" },
  { id: "pb-O9-018", nom: "Anti-cartel compliance check", departement: "ORBIT9", bots: ["CarlOS", "Loulou"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 345, categorie: "Conformite", pilier: "Actif", description: "Verification automatique qu'aucune cellule ne cree de monopole sectoriel.", type: "tache" },
  { id: "pb-O9-019", nom: "Ghost Delegate — Briefing bot-to-bot", departement: "ORBIT9", bots: ["CarlOS", "Tim"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 678, categorie: "Delegation", pilier: "Temps", description: "CarlOS prepare et envoie un delegue virtuel pour representer l'entreprise dans une cellule.", type: "flow" },
  { id: "pb-O9-020", nom: "Rapport impact reseau annuel", departement: "ORBIT9", bots: ["CarlOS", "Frank", "Simone"], etapes: 12, duree: "1 sem.", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 234, categorie: "Reporting", pilier: "Argent", description: "Bilan complet: economie collective, connexions B2B, ROI reseau, croissance 9→81.", type: "document" },
  // ═══ CONFERENCE AI — 222 Playbooks V4 (Mega-Prompt Gemini Deep Search) ═══
  // --- VENTE & REVENUS (12 playbooks) ---
  { id: "pb-CMOB-VENT-008", nom: "Création Script Cold Call", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 567, categorie: "Vente", description: "Arbre de décision téléphonique", pilier: "Vente", type: "conference" },
  { id: "pb-CMOB-VENT-012", nom: "Création Campagne de Réactivation", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 308, categorie: "Vente", description: "Séquence courriels de relance", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-001", nom: "Pitch Deck Animé", departement: "CROB", bots: ["CarlOS"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 363, categorie: "Vente", description: "Rapport dengagement client", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-002", nom: "Démo Produit Live", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "30min", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 758, categorie: "Vente", description: "Vidéo indexée, scoring", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-003", nom: "Closing Assisté", departement: "CROB", bots: ["Rich", "CarlOS"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 778, categorie: "Vente", description: "Transcrit annoté", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-004", nom: "Follow-up Automatique", departement: "CROB", bots: ["Mathilde"], etapes: 3, duree: "15min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 329, categorie: "Vente", description: "Séquence courriels CRM", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-005", nom: "Qualification CREDO", departement: "CROB", bots: ["CarlOS"], etapes: 3, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 365, categorie: "Vente", description: "Fiche BANT validée", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-006", nom: "War Room Négociation", departement: "CROB", bots: ["Rich", "Simone"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.8, downloads: 657, categorie: "Vente", description: "Grille tactique", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-007", nom: "Revue de Compte Stratégique", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 642, categorie: "Vente", description: "Plan de compte (Account Plan)", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-009", nom: "Audit Pipeline Ventes", departement: "CROB", bots: ["Rich", "Frank"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 1068, categorie: "Vente", description: "Prévision de ventes (Forecast) ajustée", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-010", nom: "Négociation Renouvellement SaaS", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 1164, categorie: "Vente", description: "Argumentaire de rétention", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-011", nom: "Post-Mortem Deal Perdu", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 1103, categorie: "Vente", description: "Rapport danalyse compétitive", pilier: "Vente", type: "conference" },
  // --- PODCAST (6 playbooks) ---
  { id: "pb-CMOB-POD-001", nom: "Studio Podcast Complet", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 763, categorie: "Podcast", description: "Fichiers HD séparés", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-POD-002", nom: "Auto-Clip & Distribution", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 810, categorie: "Podcast", description: "5 Shorts/Reels verticaux", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-POD-003", nom: "Calendrier Éditorial Annuel", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 1137, categorie: "Podcast", description: "Charte de publication (Gantt)", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-POD-005", nom: "SEO Épisode Audio", departement: "CMOB", bots: ["Tim", "Mathilde"], etapes: 3, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 938, categorie: "Podcast", description: "Notes démission (Show notes)", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-POD-006", nom: "pb-CMOB-POD-006", departement: "CMOB", bots: ["CarlOS"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 489, categorie: "Podcast", description: "Conference AI - pb-CMOB-POD-006", pilier: "Idee", type: "conference" },
  { id: "pb-GHOST-POD-006", nom: "Podcast Cognitif", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "45min", niveau: "Enterprise", prix: "$299", rating: 4.8, downloads: 627, categorie: "Podcast", description: "Épisode audio de lavatar", pilier: "Idee", type: "conference" },
  // --- CONTENU & PODCAST (15 playbooks) ---
  { id: "pb-CFOB-CONT-017", nom: "Rapport Annuel Investisseurs", departement: "CFOB", bots: ["Frank", "Mathilde"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.3, downloads: 510, categorie: "Contenu", description: "Squelette du rapport financier", pilier: "Actif", type: "document" },
  { id: "pb-CHROB-CONT-015", nom: "Audit Marque Employeur", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 481, categorie: "Contenu", description: "Diagnostic dattractivité RH", pilier: "Actif", type: "document" },
  { id: "pb-CINOB-CONT-020", nom: "Dossier de Brevet (Brouillon)", departement: "CINOB", bots: ["Ines", "Loulou"], etapes: 2, duree: "2h", niveau: "Enterprise", prix: "$149", rating: 4.6, downloads: 1129, categorie: "Contenu", description: "Pré-dossier propriété intellectuelle", pilier: "Actif", type: "document" },
  { id: "pb-CLOB-CONT-018", nom: "Rédaction Contrat Standardisé", departement: "CLOB", bots: ["Loulou"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 738, categorie: "Contenu", description: "Template (NDA, Prestation)", pilier: "Actif", type: "document" },
  { id: "pb-CMOB-CONT-007", nom: "Rédaction Article Expert", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 458, categorie: "Contenu", description: "Article SEO de 1500 mots", pilier: "Actif", type: "document" },
  { id: "pb-CMOB-CONT-008", nom: "Copywriting Landing Page", departement: "CMOB", bots: ["Mathilde"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.9, downloads: 852, categorie: "Contenu", description: "Wireframe textuel", pilier: "Actif", type: "document" },
  { id: "pb-CMOB-CONT-009", nom: "Script Vidéo Corporative", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 1163, categorie: "Contenu", description: "Scénario à deux colonnes (A/V)", pilier: "Actif", type: "document" },
  { id: "pb-CMOB-CONT-010", nom: "Séquence Lead Nurturing", departement: "CMOB", bots: ["Mathilde"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 1051, categorie: "Contenu", description: "Drip campaign formatée", pilier: "Actif", type: "document" },
  { id: "pb-CMOB-CONT-011", nom: "Audit SEO Sémantique", departement: "CMOB", bots: ["Tim"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.9, downloads: 715, categorie: "Contenu", description: "Plan de correction technique", pilier: "Actif", type: "document" },
  { id: "pb-CMOB-CONT-012", nom: "Ghostwriting LinkedIn B2B", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.2, downloads: 969, categorie: "Contenu", description: "12 publications formatées", pilier: "Actif", type: "document" },
  { id: "pb-CMOB-CONT-013", nom: "Création Étude de Cas (Case Study)", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 565, categorie: "Contenu", description: "Document PDF prêt à designer", pilier: "Actif", type: "document" },
  { id: "pb-CMOB-CONT-014", nom: "Préparation Webinaire Live", departement: "CMOB", bots: ["Mathilde"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 782, categorie: "Contenu", description: "Conducteur (Run of Show)", pilier: "Actif", type: "document" },
  { id: "pb-CPOB-CONT-019", nom: "Manuel d'Instructions Produit", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 346, categorie: "Contenu", description: "Livret utilisateur (User Guide)", pilier: "Actif", type: "document" },
  { id: "pb-CROSS-CONT-021", nom: "Livre Blanc (Whitepaper) Industrie", departement: "ORBIT9", bots: ["Mathilde", "Tim"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 445, categorie: "Contenu", description: "Document de recherche de 10 pages", pilier: "Actif", type: "document" },
  { id: "pb-CTOB-CONT-016", nom: "Documentation API Technique", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 995, categorie: "Contenu", description: "Doc Swagger/OpenAPI", pilier: "Actif", type: "document" },
  // --- PRE-ENTREVUE & RH (9 playbooks) ---
  { id: "pb-CHROB-PRE-001", nom: "Entrevue Candidat Complète", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 720, categorie: "Pre-entrevue", description: "Enregistrement et score", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-PRE-002", nom: "Grille FAAS-F (Fit Culturel)", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.3, downloads: 824, categorie: "Pre-entrevue", description: "Score dalignement culturel", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-PRE-003", nom: "Rapport Structuré Exécutif", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.3, downloads: 458, categorie: "Pre-entrevue", description: "Fiche de recommandation", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-PRE-004", nom: "Shortlist CV Automatisée", departement: "CHROB", bots: ["CarlOS"], etapes: 3, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 416, categorie: "Pre-entrevue", description: "Tableau de candidats qualifiés", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-PRE-006", nom: "Prise de Références Automatisée", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 456, categorie: "Pre-entrevue", description: "Rapport de vérification dantécédents", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-PRE-012", nom: "Entrevue de Départ", departement: "CHROB", bots: ["CarlOS"], etapes: 4, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 338, categorie: "Pre-entrevue", description: "Conference AI - Entrevue de Départ", pilier: "Actif", type: "conference" },
  { id: "pb-CMOB-PRE-014", nom: "Simulation Cas Marketing", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 486, categorie: "Pre-entrevue", description: "Évaluation de la pensée stratégique", pilier: "Actif", type: "conference" },
  { id: "pb-CPOB-PRE-013", nom: "Simulation Technique Usine", departement: "CPOB", bots: ["Paco"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 686, categorie: "Pre-entrevue", description: "Score de conformité SST", pilier: "Actif", type: "conference" },
  { id: "pb-CTOB-PRE-005", nom: "Simulation Technique Programmation", departement: "CTOB", bots: ["Tim"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.8, downloads: 948, categorie: "Pre-entrevue", description: "Évaluation des capacités de code", pilier: "Actif", type: "conference" },
  // --- RESSOURCES HUMAINES (6 playbooks) ---
  { id: "pb-CHROB-RH-007", nom: "Rédaction Offre d'Emploi", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 1048, categorie: "Ressources humaines", description: "Description de poste publiée", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-RH-008", nom: "Création Grille Salariale", departement: "CHROB", bots: ["Frank", "Helene"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.9, downloads: 1147, categorie: "Ressources humaines", description: "Matrice de rémunération", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-RH-009", nom: "Audit Loi Équité Salariale", departement: "CHROB", bots: ["Helene", "Loulou"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 808, categorie: "Ressources humaines", description: "Déclaration CNESST déquité", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-RH-010", nom: "Cartographie de Relève (Succession)", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 1103, categorie: "Ressources humaines", description: "Matrice de plan de relève (9-box)", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-RH-011", nom: "Sondage eNPS (Engagement)", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 566, categorie: "Ressources humaines", description: "Score net de promoteur employé", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-RH-012", nom: "Entrevue de Départ (Offboarding)", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 545, categorie: "Ressources humaines", description: "Rapport dattrition (Churn report)", pilier: "Actif", type: "conference" },
  // --- CREATIVITE & INNOVATION (29 playbooks) ---
  { id: "pb-CEOB-CREA-003", nom: "pb-CEOB-CREA-003", departement: "CEOB", bots: ["CarlOS"], etapes: 4, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.2, downloads: 381, categorie: "Creativite", description: "Conference AI - pb-CEOB-CREA-003", pilier: "Idee", type: "conference" },
  { id: "pb-CEOB-CREA-005", nom: "Lightning Decision Jam (LDJ) Dirigeants", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 504, categorie: "Creativite", description: "Plan daction priorisé et assigné", pilier: "Idee", type: "conference" },
  { id: "pb-CFOB-CREA-009", nom: "Six Hats Investissement (CAPEX)", departement: "CFOB", bots: ["Frank"], etapes: 1, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 534, categorie: "Creativite", description: "Mémorandum dinvestissement", pilier: "Idee", type: "conference" },
  { id: "pb-CFOB-CREA-017", nom: "Kaizen Blitz (Jour 1-2) Planification", departement: "CFOB", bots: ["Frank"], etapes: 2, duree: "1h", niveau: "Enterprise", prix: "$149", rating: 4.8, downloads: 821, categorie: "Creativite", description: "Diagnostic de létat présent.29", pilier: "Idee", type: "conference" },
  { id: "pb-CFOB-CREA-018", nom: "Kaizen Blitz (Jour 3-5) Exécution", departement: "CFOB", bots: ["Frank"], etapes: 3, duree: "1h", niveau: "Enterprise", prix: "$149", rating: 4.5, downloads: 293, categorie: "Creativite", description: "Nouveau standard de travail", pilier: "Idee", type: "conference" },
  { id: "pb-CHROB-CREA-007", nom: "LDJ Rétention RH", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 419, categorie: "Creativite", description: "Initiatives RH immédiates", pilier: "Idee", type: "conference" },
  { id: "pb-CHROB-CREA-024", nom: "Design de Parcours Employé", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 744, categorie: "Creativite", description: "Blueprint de lexpérience RH", pilier: "Idee", type: "conference" },
  { id: "pb-CINOB-CREA-001", nom: "Design Thinking (Atelier Complet)", departement: "CINOB", bots: ["Ines"], etapes: 4, duree: "2h", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 1111, categorie: "Creativite", description: "Concept de solution testable", pilier: "Idee", type: "conference" },
  { id: "pb-CINOB-CREA-002", nom: "SCAMPER Méthode Produit", departement: "CINOB", bots: ["Ines"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 333, categorie: "Creativite", description: "7 concepts dérivés", pilier: "Idee", type: "conference" },
  { id: "pb-CINOB-CREA-007", nom: "Trisociation Koestler", departement: "CINOB", bots: ["CarlOS"], etapes: 7, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 703, categorie: "Creativite", description: "Conference AI - Trisociation Koestler", pilier: "Idee", type: "conference" },
  { id: "pb-CINOB-CREA-014", nom: "Trisociation de Koestler (R&D)", departement: "CINOB", bots: ["Ines"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 140, categorie: "Creativite", description: "Description de brevet/concept.16", pilier: "Idee", type: "conference" },
  { id: "pb-CISOB-CREA-019", nom: "Red Team Exercice (Cybersécurité)", departement: "CISOB", bots: ["Sebastien"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 552, categorie: "Creativite", description: "Rapport de failles critiques", pilier: "Idee", type: "conference" },
  { id: "pb-CLOB-CREA-010", nom: "Six Hats Risque Légal", departement: "CLOB", bots: ["Loulou"], etapes: 1, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 937, categorie: "Creativite", description: "Recommandation de révision de clause", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-CREA-004", nom: "SCAMPER Campagne Marketing", departement: "CMOB", bots: ["Mathilde"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 967, categorie: "Creativite", description: "Nouvelle stratégie publicitaire", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-CREA-005", nom: "Reverse Brainstorming", departement: "CMOB", bots: ["CarlOS"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 881, categorie: "Creativite", description: "Conference AI - Reverse Brainstorming", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-CREA-011", nom: "Reverse Brainstorming Produit", departement: "CMOB", bots: ["Mathilde"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 150, categorie: "Creativite", description: "Liste dinnovations défensives", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-CREA-015", nom: "Trisociation Marketing", departement: "CMOB", bots: ["Mathilde"], etapes: 1, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 1037, categorie: "Creativite", description: "Pitch de campagne disruptive", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-CREA-022", nom: "Futuristic Thinking (3 Horizons)", departement: "CMOB", bots: ["Mathilde"], etapes: 4, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 463, categorie: "Creativite", description: "Vision stratégique H3", pilier: "Idee", type: "conference" },
  { id: "pb-COOB-CREA-006", nom: "LDJ Opérationnel (Logistique)", departement: "COOB", bots: ["Olivier"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 1191, categorie: "Creativite", description: "Tâches correctives dusine", pilier: "Idee", type: "conference" },
  { id: "pb-CPOB-CREA-021", nom: "Crazy 8s (Sketching UX/Design)", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 1124, categorie: "Creativite", description: "8 maquettes ou wireframes basiques", pilier: "Idee", type: "conference" },
  { id: "pb-CROB-CREA-012", nom: "Reverse Brainstorming Ventes", departement: "CROB", bots: ["Rich"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 158, categorie: "Creativite", description: "Procédure de sauvetage client", pilier: "Idee", type: "conference" },
  { id: "pb-CROSS-CREA-013", nom: "World Café Method", departement: "ORBIT9", bots: ["CarlOS"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.8, downloads: 456, categorie: "Creativite", description: "Fresque didées unifiée", pilier: "Idee", type: "conference" },
  { id: "pb-CSOB-CREA-008", nom: "Six Thinking Hats (Général)", departement: "CSOB", bots: ["Simone"], etapes: 1, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 191, categorie: "Creativite", description: "Bilan analytique 360°.25", pilier: "Idee", type: "conference" },
  { id: "pb-CSOB-CREA-020", nom: "Red Team Stratégie d'Affaires", departement: "CSOB", bots: ["Simone"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 513, categorie: "Creativite", description: "Stratégie de mitigation", pilier: "Idee", type: "conference" },
  { id: "pb-CSOB-CREA-023", nom: "Blue Ocean Strategy Formulation", departement: "CSOB", bots: ["Simone"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 898, categorie: "Creativite", description: "Proposition de valeur Blue Ocean", pilier: "Idee", type: "conference" },
  { id: "pb-CSOB-CREA-025", nom: "Business Model Canvas (Création)", departement: "CSOB", bots: ["Simone"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.9, downloads: 1190, categorie: "Creativite", description: "BMC complété et exportable", pilier: "Idee", type: "conference" },
  { id: "pb-CSOB-CREA-026", nom: "Business Model Canvas", departement: "CSOB", bots: ["CarlOS"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 338, categorie: "Creativite", description: "Conference AI - Business Model Canvas", pilier: "Idee", type: "conference" },
  { id: "pb-CTOB-CREA-003", nom: "SCAMPER Processus TI", departement: "CTOB", bots: ["Tim"], etapes: 1, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 876, categorie: "Creativite", description: "Nouveau diagramme de flux optimisé", pilier: "Idee", type: "conference" },
  { id: "pb-CTOB-CREA-016", nom: "Hackathon Express (Développement)", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "2h", niveau: "Avance", prix: "$99", rating: 4.8, downloads: 544, categorie: "Creativite", description: "Code brut (Minimum Viable Product)", pilier: "Idee", type: "conference" },
  // --- MEDIATION (22 playbooks) ---
  { id: "pb-CEOB-MED-015", nom: "Médiation Conseil d'Administration", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.8, downloads: 1044, categorie: "Mediation", description: "Résolution unanime du CA", pilier: "Actif", type: "conference" },
  { id: "pb-CFOB-MED-008", nom: "Médiation Conflit Budgétaire", departement: "CFOB", bots: ["Frank"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 864, categorie: "Mediation", description: "Réallocation des fonds", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-MED-002", nom: "Médiation Interpersonnelle (RH)", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 717, categorie: "Mediation", description: "Charte dinteraction", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-MED-003", nom: "Médiation Syndicale (Grief)", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 739, categorie: "Mediation", description: "Accord de grief", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-MED-012", nom: "Médiation Harcèlement Psychologique", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.8, downloads: 667, categorie: "Mediation", description: "Rapport préliminaire denquête", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-MED-016", nom: "Médiation Multigénérationnelle", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 803, categorie: "Mediation", description: "Mode demploi collaboratif déquipe", pilier: "Actif", type: "conference" },
  { id: "pb-CINOB-MED-014", nom: "Médiation Propriété Intellectuelle", departement: "CINOB", bots: ["Ines"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 1048, categorie: "Mediation", description: "Document de cession de droits", pilier: "Actif", type: "conference" },
  { id: "pb-CISOB-MED-010", nom: "Médiation Sécurité vs Opérations", departement: "CISOB", bots: ["Sebastien"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 846, categorie: "Mediation", description: "Politique de sécurité ajustée", pilier: "Actif", type: "conference" },
  { id: "pb-CLOB-MED-001", nom: "Médiation Commerciale (B2B)", departement: "CLOB", bots: ["Loulou"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.5, downloads: 730, categorie: "Mediation", description: "Entente de règlement", pilier: "Actif", type: "conference" },
  { id: "pb-CLOB-MED-011", nom: "Médiation Plainte Client (Escalade)", departement: "CLOB", bots: ["Loulou"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 943, categorie: "Mediation", description: "Offre de compensation acceptée", pilier: "Actif", type: "conference" },
  { id: "pb-CLOB-MED-020", nom: "Médiation Fin de Contrat Bailleur", departement: "CLOB", bots: ["Loulou"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 650, categorie: "Mediation", description: "Entente de résiliation de bail commercial", pilier: "Actif", type: "conference" },
  { id: "pb-CMOB-MED-009", nom: "Médiation Conflit Créatif (Marketing)", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 374, categorie: "Mediation", description: "Ligne directrice de campagne validée", pilier: "Actif", type: "conference" },
  { id: "pb-COOB-MED-013", nom: "Médiation Conflit de Plannings", departement: "COOB", bots: ["Olivier"], etapes: 3, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 758, categorie: "Mediation", description: "Nouveau calendrier de production", pilier: "Actif", type: "conference" },
  { id: "pb-CPOB-MED-006", nom: "Médiation Fournisseur (Pénalités)", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 225, categorie: "Mediation", description: "Plan de relance dexpédition", pilier: "Actif", type: "conference" },
  { id: "pb-CPOB-MED-019", nom: "Médiation Qualité vs Quantité", departement: "CPOB", bots: ["Paco"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 1102, categorie: "Mediation", description: "Norme de qualité minimale révisée", pilier: "Actif", type: "conference" },
  { id: "pb-CROB-MED-017", nom: "Médiation Conflit de Territoire Ventes", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 616, categorie: "Mediation", description: "Règle dattribution actée", pilier: "Actif", type: "conference" },
  { id: "pb-CROSS-MED-004", nom: "Médiation Inter-Départementale", departement: "ORBIT9", bots: ["CarlOS"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 622, categorie: "Mediation", description: "Contrat de service interne (SLA)", pilier: "Actif", type: "conference" },
  { id: "pb-CROSS-MED-018", nom: "Médiation Retour au Bureau (RTO)", departement: "ORBIT9", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 528, categorie: "Mediation", description: "Avenant de télétravail", pilier: "Actif", type: "conference" },
  { id: "pb-CTOB-MED-007", nom: "Médiation Conflit Architectural (TI)", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 653, categorie: "Mediation", description: "Document dArchitecture (ADR)", pilier: "Actif", type: "conference" },
  { id: "pb-DEST-MED-003", nom: "Succession Entreprise Familiale", departement: "CEOB", bots: ["Loulou"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.5, downloads: 703, categorie: "Mediation", description: "Protocole pré-succession", pilier: "Actif", type: "conference" },
  { id: "pb-DEST-MED-005", nom: "Médiation Actionnaires / Associés", departement: "CEOB", bots: ["Loulou"], etapes: 3, duree: "2h", niveau: "Avance", prix: "$99", rating: 4.3, downloads: 226, categorie: "Mediation", description: "Avenant à la convention", pilier: "Actif", type: "conference" },
  { id: "pb-DEST-MED-021", nom: "Médiation Divorce/Séparation Dirigeant", departement: "CEOB", bots: ["Loulou"], etapes: 2, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.9, downloads: 711, categorie: "Mediation", description: "Protocole financier de séparation", pilier: "Actif", type: "conference" },
  // --- GESTION DE CRISE (15 playbooks) ---
  { id: "pb-CEOB-CRISE-008", nom: "Crise Disparition/Décès Dirigeant", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "2h", niveau: "Enterprise", prix: "$149", rating: 4.9, downloads: 109, categorie: "Gestion crise", description: "Plan de continuité des affaires", pilier: "Temps", type: "conference" },
  { id: "pb-CFOB-CRISE-006", nom: "Crise Liquidité (Cashflow) Extrême", departement: "CFOB", bots: ["Frank"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 822, categorie: "Gestion crise", description: "Plan de sauvetage financier", pilier: "Temps", type: "conference" },
  { id: "pb-CHROB-CRISE-003", nom: "Crise Restructuration/Mises à pied", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 554, categorie: "Gestion crise", description: "Plan de licenciement massif", pilier: "Temps", type: "conference" },
  { id: "pb-CHROB-CRISE-005", nom: "Crise CNESST (Accident Grave)", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.9, downloads: 694, categorie: "Gestion crise", description: "Rapport préliminaire denquête", pilier: "Temps", type: "conference" },
  { id: "pb-CINOB-CRISE-014", nom: "Crise Vol de Propriété Intellectuelle", departement: "CINOB", bots: ["Ines"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.2, downloads: 414, categorie: "Gestion crise", description: "Dossier de preuve pour litige", pilier: "Temps", type: "conference" },
  { id: "pb-CISOB-CRISE-001", nom: "Crise Cybersécurité Complete", departement: "CISOB", bots: ["Sebastien"], etapes: 4, duree: "2h", niveau: "Enterprise", prix: "$149", rating: 4.7, downloads: 229, categorie: "Gestion crise", description: "Bilan de brèche Loi 25", pilier: "Temps", type: "conference" },
  { id: "pb-CLOB-CRISE-002", nom: "Crise Juridique (PR) ou Scandale", departement: "CLOB", bots: ["Loulou"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.5, downloads: 1027, categorie: "Gestion crise", description: "Kit de Relations Publiques", pilier: "Temps", type: "conference" },
  { id: "pb-CLOB-CRISE-013", nom: "Crise Saisie ou Inspection Fiscale (ARC)", departement: "CLOB", bots: ["Loulou"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 403, categorie: "Gestion crise", description: "Checklist dinspection gouvernementale", pilier: "Temps", type: "conference" },
  { id: "pb-CMOB-CRISE-010", nom: "Crise Bad Buzz Médias Sociaux", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.9, downloads: 528, categorie: "Gestion crise", description: "Protocole de communication sociale", pilier: "Temps", type: "conference" },
  { id: "pb-COOB-CRISE-012", nom: "Crise Grève ou Piquetage", departement: "COOB", bots: ["Olivier"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 515, categorie: "Gestion crise", description: "Plan de contingence de grève", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-CRISE-004", nom: "Crise Supply Chain Majeure", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 505, categorie: "Gestion crise", description: "Plan de contingence logistique", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-CRISE-007", nom: "Crise HACCP / Rappel de Produit", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "2h", niveau: "Enterprise", prix: "$149", rating: 4.8, downloads: 620, categorie: "Gestion crise", description: "Logistique de rappel de produit", pilier: "Temps", type: "conference" },
  { id: "pb-CROB-CRISE-011", nom: "Crise Perte Client Majeur (80/20)", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 348, categorie: "Gestion crise", description: "Plan de redressement commercial", pilier: "Temps", type: "conference" },
  { id: "pb-CROSS-CRISE-015", nom: "Crise Désastre Naturel (Feu/Inondation)", departement: "ORBIT9", bots: ["CarlOS"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 569, categorie: "Gestion crise", description: "Déclaration de sinistre complète", pilier: "Temps", type: "conference" },
  { id: "pb-CTOB-CRISE-009", nom: "Crise Panne Majeure Serveurs (Downtime)", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 718, categorie: "Gestion crise", description: "Rapport dincident (Post-mortem)", pilier: "Temps", type: "conference" },
  // --- EXPRESS (29 playbooks) ---
  { id: "pb-CEOB-EXP-006", nom: "Daily Standup Direction", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 739, categorie: "Express", description: "Notes directionnelles", pilier: "Temps", type: "conference" },
  { id: "pb-CFOB-EXP-016", nom: "Approbation Budget Express", departement: "CFOB", bots: ["Frank"], etapes: 3, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 175, categorie: "Express", description: "Trace dapprobation financière", pilier: "Temps", type: "conference" },
  { id: "pb-CFOB-EXP-024", nom: "Alerte Dépassement Budget", departement: "CFOB", bots: ["Frank"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 583, categorie: "Express", description: "Note de dérogation", pilier: "Temps", type: "conference" },
  { id: "pb-CHROB-EXP-018", nom: "Pouls d'Équipe Flash", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 414, categorie: "Express", description: "Indicateur de moral affiché", pilier: "Temps", type: "conference" },
  { id: "pb-CHROB-EXP-023", nom: "Gestion Plainte Flash (Conflit)", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 1096, categorie: "Express", description: "Ouverture de dossier RH", pilier: "Temps", type: "conference" },
  { id: "pb-CISOB-EXP-005", nom: "Triage Urgence Cyber", departement: "CISOB", bots: ["CarlOS"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 106, categorie: "Express", description: "Conference AI - Triage Urgence Cyber", pilier: "Temps", type: "conference" },
  { id: "pb-CISOB-EXP-013", nom: "Triage Urgence Cybersécurité", departement: "CISOB", bots: ["Sebastien"], etapes: 2, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 1023, categorie: "Express", description: "Alerte rouge déclenchée ou verte", pilier: "Temps", type: "conference" },
  { id: "pb-CLOB-EXP-010", nom: "Briefing Juridique Express", departement: "CLOB", bots: ["CarlOS"], etapes: 5, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 448, categorie: "Express", description: "Conference AI - Briefing Juridique Express", pilier: "Temps", type: "conference" },
  { id: "pb-CLOB-EXP-019", nom: "Briefing Juridique Express", departement: "CLOB", bots: ["Loulou"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 545, categorie: "Express", description: "Avis juridique flash documenté", pilier: "Temps", type: "conference" },
  { id: "pb-CMOB-EXP-004", nom: "Daily Standup Marketing", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 361, categorie: "Express", description: "Ajustements de budget média", pilier: "Temps", type: "conference" },
  { id: "pb-CMOB-EXP-021", nom: "Validation Visuel Express", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.3, downloads: 122, categorie: "Express", description: "Fichier visuel certifié", pilier: "Temps", type: "conference" },
  { id: "pb-COOB-EXP-001", nom: "Daily Standup Opérations", departement: "COOB", bots: ["Olivier"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 517, categorie: "Express", description: "Assignation Jira/Trello auto", pilier: "Temps", type: "conference" },
  { id: "pb-COOB-EXP-003", nom: "Shift Handoff", departement: "COOB", bots: ["CarlOS"], etapes: 4, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 452, categorie: "Express", description: "Conference AI - Shift Handoff", pilier: "Temps", type: "conference" },
  { id: "pb-COOB-EXP-009", nom: "Shift Handoff (Logistique)", departement: "COOB", bots: ["Olivier"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 1010, categorie: "Express", description: "Log textuel de transfert", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-EXP-002", nom: "Go/No-Go Express", departement: "CPOB", bots: ["CarlOS"], etapes: 7, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 487, categorie: "Express", description: "Conference AI - Go/No-Go Express", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-EXP-005", nom: "Daily Standup Production", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 502, categorie: "Express", description: "Planification journalière", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-EXP-007", nom: "Go/No-Go Express (Production)", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 381, categorie: "Express", description: "Bilan dautorisation", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-EXP-010", nom: "Shift Handoff (Usine de nuit/jour)", departement: "CPOB", bots: ["Paco"], etapes: 2, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 898, categorie: "Express", description: "Rapport de fin de quart", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-EXP-011", nom: "Check Qualité Express", departement: "CPOB", bots: ["CarlOS"], etapes: 4, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 743, categorie: "Express", description: "Conference AI - Check Qualité Express", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-EXP-014", nom: "Triage Urgence Brisure Machine", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 287, categorie: "Express", description: "Ticket de maintenance priorisé", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-EXP-020", nom: "Check Qualité Express (Lot)", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 491, categorie: "Express", description: "Billet dassurance qualité", pilier: "Temps", type: "conference" },
  { id: "pb-CROB-EXP-003", nom: "Daily Standup Ventes", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 1079, categorie: "Express", description: "Mise à jour CRM", pilier: "Temps", type: "conference" },
  { id: "pb-CROB-EXP-012", nom: "Debrief Flash Rencontre Client", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 1117, categorie: "Express", description: "Note CRM détaillée", pilier: "Temps", type: "conference" },
  { id: "pb-CROB-EXP-015", nom: "Quick Check-in Pipeline Deal", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 617, categorie: "Express", description: "Statut CRM actualisé", pilier: "Temps", type: "conference" },
  { id: "pb-CROSS-EXP-011", nom: "Debrief Flash Événementiel", departement: "ORBIT9", bots: ["CarlOS"], etapes: 2, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 1016, categorie: "Express", description: "Micro-bilan post-mortem daction", pilier: "Temps", type: "conference" },
  { id: "pb-CSOB-EXP-022", nom: "Alignement Objectif Express", departement: "CSOB", bots: ["Simone"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 110, categorie: "Express", description: "Re-priorisation de lagenda", pilier: "Temps", type: "conference" },
  { id: "pb-CTOB-EXP-002", nom: "Daily Standup Développement", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 884, categorie: "Express", description: "Ticket update système", pilier: "Temps", type: "conference" },
  { id: "pb-CTOB-EXP-008", nom: "Go/No-Go Express (Déploiement TI)", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 473, categorie: "Express", description: "Autorisation de mise en prod", pilier: "Temps", type: "conference" },
  { id: "pb-CTOB-EXP-017", nom: "Review Code Express (Merge)", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 560, categorie: "Express", description: "Notes intégrées dans Git", pilier: "Temps", type: "conference" },
  // --- RECURRENTS (12 playbooks) ---
  { id: "pb-CEOB-REC-001", nom: "Morning Brief CEO", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 125, categorie: "Recurrent", description: "Microcast audio personnalisé", pilier: "Temps", type: "flow" },
  { id: "pb-CEOB-REC-012", nom: "Annual Plan Initialization", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 702, categorie: "Recurrent", description: "Fichiers de préparation N+1", pilier: "Temps", type: "flow" },
  { id: "pb-CFOB-REC-002", nom: "Weekly Digest Financier", departement: "CFOB", bots: ["Frank"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 591, categorie: "Recurrent", description: "Dashboard PDF automatisé", pilier: "Temps", type: "flow" },
  { id: "pb-CHROB-REC-007", nom: "Monthly HR Dashboard", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 453, categorie: "Recurrent", description: "Tableau de bord RH exécutif", pilier: "Temps", type: "flow" },
  { id: "pb-CISOB-REC-008", nom: "Weekly Digest Menaces (Cyber)", departement: "CISOB", bots: ["Sebastien"], etapes: 3, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 971, categorie: "Recurrent", description: "Score de santé sécurité", pilier: "Temps", type: "flow" },
  { id: "pb-CLOB-REC-010", nom: "Monthly Compliance Tracker", departement: "CLOB", bots: ["Loulou"], etapes: 2, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.2, downloads: 543, categorie: "Recurrent", description: "Alertes de dates dexpiration", pilier: "Temps", type: "flow" },
  { id: "pb-CMOB-REC-004", nom: "Weekly Digest Marketing (ROAS)", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 818, categorie: "Recurrent", description: "Recommandation budgétaire", pilier: "Temps", type: "flow" },
  { id: "pb-COOB-REC-009", nom: "Weekly Digest Logistique", departement: "COOB", bots: ["Olivier"], etapes: 2, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 532, categorie: "Recurrent", description: "Liste dachat priorisée", pilier: "Temps", type: "flow" },
  { id: "pb-CPOB-REC-006", nom: "Weekly Digest Qualité Usine", departement: "CPOB", bots: ["Paco"], etapes: 2, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 342, categorie: "Recurrent", description: "Rapport opérationnel usine", pilier: "Temps", type: "flow" },
  { id: "pb-CROB-REC-005", nom: "Monthly Sales Dashboard", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 519, categorie: "Recurrent", description: "Rapport des ventes mensuel", pilier: "Temps", type: "flow" },
  { id: "pb-CSOB-REC-011", nom: "Quarterly Strategic Sync", departement: "CSOB", bots: ["Simone"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 458, categorie: "Recurrent", description: "Bilan stratégique (QBR)", pilier: "Temps", type: "flow" },
  { id: "pb-CTOB-REC-003", nom: "Watchdog Serveurs & Uptime", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 663, categorie: "Recurrent", description: "Rapport de SLA technique", pilier: "Temps", type: "flow" },
  // --- REUNIONS (14 playbooks) ---
  { id: "pb-CEOB-REU-001", nom: "Board Meeting (C.A.)", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "2h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 894, categorie: "Reunion", description: "Procès-verbal formel et actions", pilier: "Temps", type: "conference" },
  { id: "pb-CEOB-REU-002", nom: "Brainstorming Dirigé 8+1", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.2, downloads: 606, categorie: "Reunion", description: "Top 3 des idées retenues", pilier: "Temps", type: "conference" },
  { id: "pb-CEOB-REU-012", nom: "Town Hall (Assemblée Générale)", departement: "CEOB", bots: ["CarlOS"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 611, categorie: "Reunion", description: "FAQ interne et sondage de moral", pilier: "Temps", type: "conference" },
  { id: "pb-CFOB-REU-004", nom: "Revue Financière Exécutive", departement: "CFOB", bots: ["Frank"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 706, categorie: "Reunion", description: "Rapport financier consolidé", pilier: "Temps", type: "conference" },
  { id: "pb-CHROB-REU-008", nom: "Comité Santé/Sécurité (CNESST)", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 773, categorie: "Reunion", description: "PV réglementaire SST", pilier: "Temps", type: "conference" },
  { id: "pb-CINOB-REU-009", nom: "Comité Innovation & R&D", departement: "CINOB", bots: ["Ines"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 346, categorie: "Reunion", description: "Dossier de justification RS&DE", pilier: "Temps", type: "conference" },
  { id: "pb-CLOB-REU-010", nom: "Comité Gouvernance & Risques", departement: "CLOB", bots: ["Loulou"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 953, categorie: "Reunion", description: "Registre des risques corporatifs", pilier: "Temps", type: "conference" },
  { id: "pb-CMOB-REU-006", nom: "Comité Marketing & ROAS", departement: "CMOB", bots: ["Mathilde"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 654, categorie: "Reunion", description: "Stratégie doptimisation média", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-REU-007", nom: "Comité Production (Gemba)", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 1098, categorie: "Reunion", description: "Planification des arrêts machines", pilier: "Temps", type: "conference" },
  { id: "pb-CROB-REU-013", nom: "Revue des Ventes (Sales Sync)", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 1152, categorie: "Reunion", description: "Plan daction commercial de la semaine", pilier: "Temps", type: "conference" },
  { id: "pb-CROSS-REU-005", nom: "Cellule de Crise Exécutive", departement: "ORBIT9", bots: ["CarlOS et dir."], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 282, categorie: "Reunion", description: "Plan de mitigation de crise durgence", pilier: "Temps", type: "conference" },
  { id: "pb-CROSS-REU-014", nom: "Kick-off Projet Inter-Départemental", departement: "ORBIT9", bots: ["CarlOS"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.9, downloads: 493, categorie: "Reunion", description: "Charte de projet validée", pilier: "Temps", type: "conference" },
  { id: "pb-CSOB-REU-011", nom: "Revue Stratégique OKR", departement: "CSOB", bots: ["Simone"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 513, categorie: "Reunion", description: "Tableau de bord de performance OKR", pilier: "Temps", type: "conference" },
  { id: "pb-CTOB-REU-003", nom: "Rétrospective Sprint Agile", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 102, categorie: "Reunion", description: "Backlog technique damélioration", pilier: "Temps", type: "conference" },
  // --- VERTICAUX INDUSTRIE (20 playbooks) ---
  { id: "pb-CFOB-VERT-005", nom: "Fintech/Finance : Revue AML/KYC", departement: "CFOB", bots: ["Frank"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 1014, categorie: "Verticaux", description: "Dossier risque client", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CFOB-VERT-011", nom: "Immobilier : Audit OACIQ", departement: "CFOB", bots: ["Frank"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 115, categorie: "Verticaux", description: "Registre de conformité OACIQ", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CHROB-VERT-007", nom: "Santé : Conformité HIPAA/Loi 3", departement: "CHROB", bots: ["Loulou"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.9, downloads: 911, categorie: "Verticaux", description: "Document de sécurité des données de santé", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CHROB-VERT-017", nom: "Éducation : Conformité MEQ", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 400, categorie: "Verticaux", description: "Rapport de conformité ministérielle", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CISOB-VERT-002", nom: "Technologies : Audit Loi 25", departement: "CISOB", bots: ["Sebastien"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 954, categorie: "Verticaux", description: "Registre de conformité CAI", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CLOB-VERT-014", nom: "OBNL / Charité : Audit ARC", departement: "CLOB", bots: ["Frank"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 202, categorie: "Verticaux", description: "Préparation de la déclaration T3010", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CMOB-VERT-010", nom: "Détail (Retail) : Audit PCI-DSS", departement: "CMOB", bots: ["Sebastien"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 1187, categorie: "Verticaux", description: "Attestation de conformité (AoC)", pilier: "Actif", type: "diagnostic" },
  { id: "pb-COOB-VERT-003", nom: "Construction : Conformité CCQ", departement: "COOB", bots: ["Olivier"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 377, categorie: "Verticaux", description: "Rapport de risque solidaire", pilier: "Actif", type: "diagnostic" },
  { id: "pb-COOB-VERT-009", nom: "Logistique : Certification C-TPAT", departement: "COOB", bots: ["Olivier"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 258, categorie: "Verticaux", description: "Déclaration de sécurité frontalière", pilier: "Actif", type: "diagnostic" },
  { id: "pb-COOB-VERT-013", nom: "Transport : Conformité SAAQ (Loi 430)", departement: "COOB", bots: ["Olivier"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 853, categorie: "Verticaux", description: "Bilan de comportement de la flotte (PEVL)", pilier: "Actif", type: "diagnostic" },
  { id: "pb-COOB-VERT-016", nom: "Environnement : ISO 14001", departement: "COOB", bots: ["Paco"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.5, downloads: 109, categorie: "Verticaux", description: "Bilan dimpact écologique", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CPOB-VERT-001", nom: "Agroalimentaire : Audit HACCP", departement: "CPOB", bots: ["Paco"], etapes: 4, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 529, categorie: "Verticaux", description: "Registre HACCP complété", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CPOB-VERT-006", nom: "Aérospatiale : Norme AS9100", departement: "CPOB", bots: ["Paco"], etapes: 2, duree: "2h", niveau: "Enterprise", prix: "$149", rating: 4.6, downloads: 525, categorie: "Verticaux", description: "Rapport de non-conformité (NC)", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CPOB-VERT-008", nom: "Automobile : Norme IATF 16949", departement: "CPOB", bots: ["Paco"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.8, downloads: 415, categorie: "Verticaux", description: "Plan de contrôle qualité", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CPOB-VERT-012", nom: "Pharmaceutique : Bonnes Pratiques (BPF)", departement: "CPOB", bots: ["Paco"], etapes: 2, duree: "2h", niveau: "Enterprise", prix: "$149", rating: 4.2, downloads: 749, categorie: "Verticaux", description: "Dossier de lot approuvé", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CPOB-VERT-015", nom: "Manufacturier : ISO 9001:2015", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.2, downloads: 815, categorie: "Verticaux", description: "Manuel Qualité révisé", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CPOB-VERT-019", nom: "Cosmétiques : Conformité Santé Canada", departement: "CPOB", bots: ["Paco"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 217, categorie: "Verticaux", description: "Formulaire de déclaration cosmétique", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CROSS-VERT-020", nom: "Agriculture : Certification Biologique (CARTV)", departement: "ORBIT9", bots: ["Paco"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 939, categorie: "Verticaux", description: "Plan de gestion biologique", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CTOB-VERT-004", nom: "SaaS Cloud : Préparation SOC2", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "2h", niveau: "Enterprise", prix: "$149", rating: 4.2, downloads: 422, categorie: "Verticaux", description: "Checklist de readiness SOC2", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CTOB-VERT-018", nom: "Jeux Vidéo : Certification Console", departement: "CTOB", bots: ["Tim"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 135, categorie: "Verticaux", description: "Checklist de soumission (Lot Check)", pilier: "Actif", type: "diagnostic" },
  // --- ORBIT9 CROSS-ENTREPRISE (12 playbooks) ---
  { id: "pb-CROSS-ORB-001", nom: "Speed Matching Réseau (Orbit9)", departement: "ORBIT9", bots: ["CarlOS"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 206, categorie: "Collaboration", description: "Liste de contacts pré-qualifiés", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-002", nom: "Club d'Achat Groupé (Commodités)", departement: "ORBIT9", bots: ["Frank"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 617, categorie: "Collaboration", description: "Appel doffres commun", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-003", nom: "Mentorat Croisé Inter-Entreprises", departement: "ORBIT9", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 1081, categorie: "Collaboration", description: "Rapport de session de mentorat", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-004", nom: "Guest Matching Orbit9", departement: "ORBIT9", bots: ["CarlOS"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 806, categorie: "Collaboration", description: "5 profils B2B qualifiés", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-005", nom: "Cellule Innovation Communes (R&D)", departement: "ORBIT9", bots: ["Ines"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.5, downloads: 623, categorie: "Collaboration", description: "Charte de projet commun", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-006", nom: "Export & Alliances Stratégiques", departement: "ORBIT9", bots: ["Rich"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 962, categorie: "Collaboration", description: "Plan de co-entreprise (JV)", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-007", nom: "Partage de Flotte/Ressources", departement: "ORBIT9", bots: ["Olivier"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 598, categorie: "Collaboration", description: "Calendrier de prêt déquipement", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-008", nom: "Pool de Talents Partagés", departement: "ORBIT9", bots: ["Helene"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 675, categorie: "Collaboration", description: "Contrat de prêt demployé", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-009", nom: "Benchmarking Financier Anonyme", departement: "ORBIT9", bots: ["Frank"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 1097, categorie: "Collaboration", description: "Rapport de performance relative", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-010", nom: "Mutualisation des Audits de Qualité", departement: "ORBIT9", bots: ["Paco"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 815, categorie: "Collaboration", description: "Protocole daudit partagé", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-011", nom: "Table Ronde Secteur Industriel", departement: "ORBIT9", bots: ["CarlOS"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.5, downloads: 927, categorie: "Collaboration", description: "Livre blanc de lindustrie", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-012", nom: "Partage de CTI (Cyber Threat Intel)", departement: "ORBIT9", bots: ["Sebastien"], etapes: 2, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 1093, categorie: "Collaboration", description: "Alerte de sécurité réseau", pilier: "Vente", type: "conference" },
  // --- FORMATION (4 playbooks) ---
  { id: "pb-CHROB-FORM-001", nom: "Onboarding Employé", departement: "CHROB", bots: ["CarlOS"], etapes: 4, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 658, categorie: "Formation", description: "Conference AI - Onboarding Employé", pilier: "Actif", type: "formation" },
  { id: "pb-CHROB-FORM-004", nom: "Certification Interne", departement: "CHROB", bots: ["CarlOS"], etapes: 4, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 132, categorie: "Formation", description: "Conference AI - Certification Interne", pilier: "Actif", type: "formation" },
  { id: "pb-CROB-FORM-003", nom: "Simulation Négociation", departement: "CROB", bots: ["CarlOS"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 821, categorie: "Formation", description: "Conference AI - Simulation Négociation", pilier: "Actif", type: "formation" },
  { id: "pb-CROSS-FORM-002", nom: "Coaching Ghost Cognitif", departement: "ORBIT9", bots: ["CarlOS"], etapes: 4, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.2, downloads: 333, categorie: "Formation", description: "Conference AI - Coaching Ghost Cognitif", pilier: "Actif", type: "formation" },
  // --- SAISONNIERS (3 playbooks) ---
  { id: "pb-CFOB-SAIS-024", nom: "Prep Budget Année Suivante", departement: "CFOB", bots: ["CarlOS"], etapes: 5, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 854, categorie: "Saisonnier", description: "Conference AI - Prep Budget Année Suivante", pilier: "Temps", type: "flow" },
  { id: "pb-CHROB-SAIS-037", nom: "Déclaration CNESST", departement: "CHROB", bots: ["CarlOS"], etapes: 4, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 833, categorie: "Saisonnier", description: "Conference AI - Déclaration CNESST", pilier: "Temps", type: "flow" },
  { id: "pb-COOB-SAIS-019", nom: "Shutdown Vacances CCQ", departement: "COOB", bots: ["CarlOS"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 847, categorie: "Saisonnier", description: "Conference AI - Shutdown Vacances CCQ", pilier: "Temps", type: "flow" },
  // --- PERSONNEL & DESTINY (14 playbooks) ---
  { id: "pb-DEST-PERS-001", nom: "Speed Dating AI", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 1154, categorie: "Personnel", description: "Score de compatibilité", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-002", nom: "Coaching de Couple", departement: "CEOB", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 523, categorie: "Personnel", description: "Charte dengagement relationnel", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-004", nom: "Préparation Mariage / Vie Commune", departement: "CEOB", bots: ["Frank"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 699, categorie: "Personnel", description: "Plan nuptial ou budgétaire", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-005", nom: "Thérapie Assistée", departement: "CEOB", bots: ["CarlOS"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 824, categorie: "Personnel", description: "Notes chiffrées pour thérapeute", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-006", nom: "Coaching de Carrière", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 331, categorie: "Personnel", description: "Plan de développement", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-007", nom: "Gestion Stress du Dirigeant", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 927, categorie: "Personnel", description: "Baisse de tension évaluée", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-008", nom: "Préparation à la Retraite", departement: "CEOB", bots: ["Frank"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 1148, categorie: "Personnel", description: "Blueprint transition Retraite", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-009", nom: "Deuil Entrepreneurial", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 222, categorie: "Personnel", description: "Journal de résilience", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-010", nom: "Conciliation Travail-Vie Personnelle", departement: "CEOB", bots: ["CarlOS"], etapes: 4, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 528, categorie: "Personnel", description: "Emploi du temps purgé", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-011", nom: "Préparation Parentalité (Maternité/Paternité)", departement: "CEOB", bots: ["CarlOS"], etapes: 2, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 606, categorie: "Personnel", description: "Plan de transition de congé", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-012", nom: "Réorientation de Carrière Complète", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 242, categorie: "Personnel", description: "Plan daction de réorientation", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-013", nom: "Gestion de la Solitude Exécutive", departement: "CEOB", bots: ["CarlOS"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 322, categorie: "Personnel", description: "Notes effacées ou encryptées", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-014", nom: "Préparation Discours (Allocution)", departement: "CEOB", bots: ["CarlOS"], etapes: 2, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 850, categorie: "Personnel", description: "Score déloquence et corrections", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-015", nom: "Bilan de Compétences 360°", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 114, categorie: "Personnel", description: "Matrice de leadership.11", pilier: "Idee", type: "conference" },
  // ═══ V5 FINAL — 66 Playbooks (Formation + Ghost Cognitifs + Saisonniers) ═══
  // --- GAP-FILL V2 (2) ---
  { id: "pb-CMOB-MRQ-012", nom: "Audit Express Marque Employeur", departement: "CMOB", bots: ["Mathilde", "Helene"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 489, categorie: "Marque employeur", description: "Analyse des evaluations externes et friction recrutement.", pilier: "Actif", type: "diagnostic" },
  { id: "pb-COOB-OP-005", nom: "Resolution Goulot Logistique", departement: "COOB", bots: ["Olivier"], etapes: 5, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 750, categorie: "Operations", description: "Cartographie processus, identification contrainte, simulation scenarios.", pilier: "Temps", type: "conference" },
  // --- FORMATION (20) ---
  { id: "pb-CMOB-MRQ-012", nom: "Audit Express Marque Employeur", departement: "CMOB", bots: ["Mathilde", "Helene"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 489, categorie: "Marque employeur", description: "Analyse des evaluations externes et friction recrutement.", pilier: "Actif", type: "diagnostic" },
  { id: "pb-COOB-OP-005", nom: "Resolution Goulot Logistique", departement: "COOB", bots: ["Olivier"], etapes: 5, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 750, categorie: "Operations", description: "Cartographie processus, identification contrainte, simulation scenarios.", pilier: "Temps", type: "conference" },
  { id: "pb-CHROB-FOR-001", nom: "Onboarding Employe Immersif", departement: "CHROB", bots: ["Helene"], etapes: 6, duree: "3h", niveau: "Avance", prix: "$149", rating: 4.8, downloads: 266, categorie: "Formation", description: "Decouverte culture, formation outils, evaluations dynamiques, attestation.", pilier: "Actif", type: "formation" },
  { id: "pb-CHROB-FOR-002", nom: "Coaching Ghost Cognitif Individuel", departement: "CHROB", bots: ["CarlOS"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 314, categorie: "Formation", description: "Session avec empreinte numerique d'un dirigeant, plan d'action.", pilier: "Idee", type: "formation" },
  { id: "pb-CROB-FOR-003", nom: "Simulation Negociation Avancee", departement: "CROB", bots: ["Rich"], etapes: 5, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 818, categorie: "Formation", description: "IA profils psychologiques variables, score empathie, enregistrement annote.", pilier: "Vente", type: "formation" },
  { id: "pb-CINOB-FOR-004", nom: "Certification Interne IA", departement: "CINOB", bots: ["Ines"], etapes: 6, duree: "1h30", niveau: "Avance", prix: "$99", rating: 4.9, downloads: 763, categorie: "Formation", description: "Examens chronometres, diplome numerique blockchain.", pilier: "Actif", type: "formation" },
  { id: "pb-CROSS-FOR-005", nom: "Mentorat Cross-Entreprise Orbit9", departement: "ORBIT9", bots: ["Simone"], etapes: 5, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 750, categorie: "Formation", description: "Appariement anonyme professionnels differentes organisations.", pilier: "Idee", type: "formation" },
  { id: "pb-CTOB-FOR-006", nom: "Bootcamp Developpeur Accelere", departement: "CTOB", bots: ["Tim"], etapes: 7, duree: "2h", niveau: "Avance", prix: "$99", rating: 4.3, downloads: 846, categorie: "Formation", description: "Revision code en pair-programming IA, exercices pratiques.", pilier: "Actif", type: "formation" },
  { id: "pb-CTOB-FOR-007", nom: "Formation Architecture Cloud Securisee", departement: "CTOB", bots: ["Tim", "Sebastien"], etapes: 6, duree: "1h30", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 573, categorie: "Formation", description: "Optimisation couts infrastructure, securite cloud native.", pilier: "Actif", type: "formation" },
  { id: "pb-CTOB-FOR-008", nom: "Certification Agile Simulation", departement: "CTOB", bots: ["Tim", "Olivier"], etapes: 8, duree: "3h", niveau: "Enterprise", prix: "$149", rating: 4.5, downloads: 755, categorie: "Formation", description: "Simulations planification sprints, retrospectives, velocity.", pilier: "Temps", type: "formation" },
  { id: "pb-CFOB-FOR-009", nom: "Comptabilite pour Non-Comptables", departement: "CFOB", bots: ["Frank"], etapes: 5, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 324, categorie: "Formation", description: "Dechiffrer etats financiers, ratios cles, P&L.", pilier: "Argent", type: "formation" },
  { id: "pb-CFOB-FOR-010", nom: "Maitrise Flux de Tresorerie", departement: "CFOB", bots: ["Frank"], etapes: 5, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 886, categorie: "Formation", description: "Analyse fonds de roulement, previsions cash-flow.", pilier: "Argent", type: "formation" },
  { id: "pb-CMOB-FOR-011", nom: "Masterclass Redaction Persuasive", departement: "CMOB", bots: ["Mathilde"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 334, categorie: "Formation", description: "Cadres cognitifs acquisition, techniques copywriting.", pilier: "Vente", type: "formation" },
  { id: "pb-CMOB-FOR-012", nom: "Formation Referencement Strategique SEO", departement: "CMOB", bots: ["Mathilde", "Tim"], etapes: 6, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 423, categorie: "Formation", description: "Recherche mots-cles, optimisation on-page, strategie backlinks.", pilier: "Vente", type: "formation" },
  { id: "pb-CMOB-FOR-013", nom: "Analyse Donnees Marketing Avancee", departement: "CMOB", bots: ["Mathilde"], etapes: 6, duree: "1h30", niveau: "Avance", prix: "$49", rating: 4.5, downloads: 167, categorie: "Formation", description: "Modelisation attribution, analytics, KPIs marketing.", pilier: "Idee", type: "formation" },
  { id: "pb-COOB-FOR-014", nom: "Formation Lean Manufacturing", departement: "COOB", bots: ["Olivier"], etapes: 6, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 680, categorie: "Formation", description: "Elimination gaspillages, 5S, value stream mapping.", pilier: "Temps", type: "formation" },
  { id: "pb-COOB-FOR-015", nom: "Gestion Risques Logistiques", departement: "COOB", bots: ["Olivier"], etapes: 5, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 422, categorie: "Formation", description: "Identification risques supply chain, plans contingence.", pilier: "Actif", type: "formation" },
  { id: "pb-CPOB-FOR-016", nom: "Securite Machine et Verrouillage", departement: "CPOB", bots: ["Paco"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 611, categorie: "Formation", description: "Conformite normes industrielles, prevention accidents, LOTO.", pilier: "Actif", type: "formation" },
  { id: "pb-CHROB-FOR-017", nom: "Prevention du Harcelement", departement: "CHROB", bots: ["Helene"], etapes: 6, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 758, categorie: "Formation", description: "Scenarios signalement, cadre legal, politique interne.", pilier: "Actif", type: "formation" },
  { id: "pb-CROB-FOR-018", nom: "Techniques Avancees Conclusion Ventes", departement: "CROB", bots: ["Rich"], etapes: 6, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 371, categorie: "Formation", description: "Methodes closing, gestion objections, signaux achat.", pilier: "Vente", type: "formation" },
  { id: "pb-CLOB-FOR-019", nom: "Formation Loi 25 pour Employes", departement: "CLOB", bots: ["Loulou"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 862, categorie: "Formation", description: "Obligations consentement, renseignements personnels Quebec.", pilier: "Actif", type: "formation" },
  { id: "pb-CISOB-FOR-020", nom: "Sensibilisation Anti-Hameconnage", departement: "CISOB", bots: ["Sebastien"], etapes: 4, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 369, categorie: "Formation", description: "Simulations attaques ingenierie sociale, perimetres humains.", pilier: "Actif", type: "formation" },
  // --- GHOST COGNITIFS (8) ---
  { id: "pb-GHO-HER-001", nom: "Atelier Video Heritage — Session 1 Histoire", departement: "CEOB", bots: ["CarlOS"], etapes: 6, duree: "2h", niveau: "Enterprise", prix: "$299", rating: 4.7, downloads: 538, categorie: "Ghost Cognitif", description: "Exploration histoire personnelle, echecs formateurs, valeurs philosophiques.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-HER-002", nom: "Atelier Video Heritage — Session 2 Expertise", departement: "CEOB", bots: ["CarlOS", "Tim"], etapes: 6, duree: "2h", niveau: "Enterprise", prix: "$299", rating: 4.8, downloads: 508, categorie: "Ghost Cognitif", description: "Extraction heuristiques techniques, methodes non documentees.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-HER-003", nom: "Atelier Video Heritage — Session 3 Dilemmes", departement: "CEOB", bots: ["CarlOS", "Simone"], etapes: 6, duree: "2h", niveau: "Enterprise", prix: "$299", rating: 4.5, downloads: 241, categorie: "Ghost Cognitif", description: "Dilemmes operationnels et moraux, cartographie arbre decisionnel.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-TEC-004", nom: "Assemblage Ghost Cognitif", departement: "CTOB", bots: ["Tim"], etapes: 8, duree: "1 sem.", niveau: "Enterprise", prix: "$299", rating: 4.6, downloads: 193, categorie: "Ghost Cognitif", description: "Fine-tuning modele linguistique, synthese vocale, recueil apprentissages.", pilier: "Actif", type: "cognitif" },
  { id: "pb-GHO-USE-005", nom: "Session Coaching avec Ghost", departement: "CEOB", bots: ["CarlOS"], etapes: 5, duree: "45min", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 212, categorie: "Ghost Cognitif", description: "Soumettre problematique au Ghost, conseils selon schemas du dirigeant.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-USE-006", nom: "Trisociation Ghost Cognitif", departement: "CEOB", bots: ["CarlOS", "Simone", "Rich"], etapes: 6, duree: "1h", niveau: "Enterprise", prix: "$149", rating: 4.3, downloads: 263, categorie: "Ghost Cognitif", description: "Croisement Ghost interne avec 2 modeles historiques pour innovation.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-MED-007", nom: "Podcast Automatise Ghost", departement: "CMOB", bots: ["Mathilde"], etapes: 5, duree: "45min", niveau: "Enterprise", prix: "$149", rating: 4.8, downloads: 532, categorie: "Ghost Cognitif", description: "Le Ghost co-anime contenus mediatiques automatiquement.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-MNT-008", nom: "Calibration Periodique Ghost", departement: "CTOB", bots: ["Tim"], etapes: 4, duree: "30min", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 494, categorie: "Ghost Cognitif", description: "Integration experiences recentes, recalibration modele.", pilier: "Actif", type: "cognitif" },
  // --- SAISONNIERS (36) ---
  { id: "pb-CEOB-SAIS-01", nom: "Bilan Annuel Direction", departement: "CEOB", bots: ["CarlOS", "Frank"], etapes: 6, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 579, categorie: "Saisonnier", description: "Analyse resultats, axes strategiques, objectifs annuels.", pilier: "Temps", type: "flow" },
  { id: "pb-CSOB-SAIS-02", nom: "Structuration OKR Annuels", departement: "CSOB", bots: ["Simone"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 666, categorie: "Saisonnier", description: "Definition objectifs cles et resultats attendus.", pilier: "Idee", type: "flow" },
  { id: "pb-CFOB-SAIS-03", nom: "Cloture Comptable Annuelle", departement: "CFOB", bots: ["Frank"], etapes: 8, duree: "2h", niveau: "Avance", prix: "$49", rating: 4.8, downloads: 111, categorie: "Saisonnier", description: "Etats financiers preliminaires, rapprochements bancaires.", pilier: "Argent", type: "flow" },
  { id: "pb-CHROB-SAIS-04", nom: "Optimisation REER Employes", departement: "CHROB", bots: ["Helene", "Frank"], etapes: 5, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 217, categorie: "Saisonnier", description: "Simulations impact fiscal, rappel date limite REER.", pilier: "Argent", type: "flow" },
  { id: "pb-CROB-SAIS-05", nom: "Nettoyage Pipeline Ventes Q1", departement: "CROB", bots: ["Rich"], etapes: 4, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 649, categorie: "Saisonnier", description: "Purge opportunites mortes, requalification leads.", pilier: "Vente", type: "flow" },
  { id: "pb-COOB-SAIS-06", nom: "Planification Logistique Chantiers", departement: "COOB", bots: ["Olivier"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 887, categorie: "Saisonnier", description: "Preparation offensive operationnelle printemps.", pilier: "Temps", type: "flow" },
  { id: "pb-CFOB-SAIS-07", nom: "Cloture Q1 — Declarations Fiduciaires", departement: "CFOB", bots: ["Frank"], etapes: 6, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 214, categorie: "Saisonnier", description: "Production declarations, formulaires fiduciaires T3.", pilier: "Argent", type: "flow" },
  { id: "pb-CLOB-SAIS-08", nom: "Revue Conformite Annuelle Loi 25", departement: "CLOB", bots: ["Loulou", "Sebastien"], etapes: 6, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 261, categorie: "Saisonnier", description: "Audit registre incidents confidentialite, mise a jour politiques.", pilier: "Actif", type: "flow" },
  { id: "pb-CHROB-SAIS-09", nom: "Declaration Masse Salariale CNESST", departement: "CHROB", bots: ["Helene", "Frank"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 839, categorie: "Saisonnier", description: "Compilation donnees salariales, date butoir 15 mars.", pilier: "Argent", type: "flow" },
  { id: "pb-CFOB-SAIS-10", nom: "Preparation Impots Particuliers", departement: "CFOB", bots: ["Frank"], etapes: 6, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 369, categorie: "Saisonnier", description: "Date limite 30 avril, declarations T1/TP1.", pilier: "Argent", type: "flow" },
  { id: "pb-CFOB-SAIS-11", nom: "Impots Corporatifs", departement: "CFOB", bots: ["Frank", "Loulou"], etapes: 8, duree: "2h", niveau: "Avance", prix: "$99", rating: 4.9, downloads: 880, categorie: "Saisonnier", description: "Declarations T2, credits recherche, deductions.", pilier: "Argent", type: "flow" },
  { id: "pb-CEOB-SAIS-12", nom: "Audit Interne Q2", departement: "CEOB", bots: ["CarlOS", "Frank"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 208, categorie: "Saisonnier", description: "Analyse ecarts budgetaires, ajustements strategiques.", pilier: "Temps", type: "flow" },
  { id: "pb-CFOB-SAIS-13", nom: "Calcul Interets Travailleurs Autonomes", departement: "CFOB", bots: ["Frank"], etapes: 4, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 405, categorie: "Saisonnier", description: "Echeance 1er mai, calcul acomptes provisionnels.", pilier: "Argent", type: "flow" },
  { id: "pb-COOB-SAIS-14", nom: "Renegociation Contrats Fournisseurs", departement: "COOB", bots: ["Olivier", "Rich"], etapes: 6, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 619, categorie: "Saisonnier", description: "Analyse marche, benchmark prix, strategies negociation.", pilier: "Argent", type: "flow" },
  { id: "pb-CMOB-SAIS-15", nom: "Planification Evenementielle Q2", departement: "CMOB", bots: ["Mathilde"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 256, categorie: "Saisonnier", description: "Calendrier evenements, salons, webinaires ete.", pilier: "Vente", type: "flow" },
  { id: "pb-CFOB-SAIS-16", nom: "Declaration Travailleurs Autonomes", departement: "CFOB", bots: ["Frank"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 265, categorie: "Saisonnier", description: "Echeance 15 juin, production declarations.", pilier: "Argent", type: "flow" },
  { id: "pb-CHROB-SAIS-17", nom: "Evaluations Performance Mi-Annee", departement: "CHROB", bots: ["Helene"], etapes: 6, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 897, categorie: "Saisonnier", description: "Reviews 360, calibration performance, objectifs H2.", pilier: "Actif", type: "flow" },
  { id: "pb-COOB-SAIS-18", nom: "Preparation Fermeture Estivale", departement: "COOB", bots: ["Olivier"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 100, categorie: "Saisonnier", description: "Logistique pre-vacances construction CCQ.", pilier: "Temps", type: "flow" },
  { id: "pb-COOB-SAIS-19", nom: "Fermeture Estivale CCQ Juillet", departement: "COOB", bots: ["Olivier"], etapes: 7, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 600, categorie: "Saisonnier", description: "Securisation chantiers, 19 juillet au 1er aout.", pilier: "Temps", type: "flow" },
  { id: "pb-CSOB-SAIS-20", nom: "Feuille de Route Strategique Q3", departement: "CSOB", bots: ["Simone"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.2, downloads: 471, categorie: "Saisonnier", description: "Planification strategique deuxieme semestre.", pilier: "Idee", type: "flow" },
  { id: "pb-CEOB-SAIS-21", nom: "Revue Direction Ete", departement: "CEOB", bots: ["CarlOS"], etapes: 5, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 414, categorie: "Saisonnier", description: "Point rapide pendant periode estivale reduite.", pilier: "Temps", type: "flow" },
  { id: "pb-COOB-SAIS-22", nom: "Redemarrage Infrastructures Aout", departement: "COOB", bots: ["Olivier", "Tim"], etapes: 6, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 346, categorie: "Saisonnier", description: "Reprise operations post-vacances, checks systemes.", pilier: "Temps", type: "flow" },
  { id: "pb-CHROB-SAIS-23", nom: "Campagne Recrutement Rentree", departement: "CHROB", bots: ["Helene", "Mathilde"], etapes: 7, duree: "1 sem.", niveau: "Avance", prix: "$49", rating: 4.8, downloads: 180, categorie: "Saisonnier", description: "Recrutement intensif septembre, affichages, entrevues.", pilier: "Actif", type: "flow" },
  { id: "pb-CFOB-SAIS-24", nom: "Modelisation Budgets Annee Suivante", departement: "CFOB", bots: ["Frank", "CarlOS"], etapes: 8, duree: "2h", niveau: "Avance", prix: "$49", rating: 4.3, downloads: 597, categorie: "Saisonnier", description: "Budget previsionnel N+1, scenarios optimiste/pessimiste.", pilier: "Argent", type: "flow" },
  { id: "pb-CROB-SAIS-25", nom: "Effort Vente Final Q4", departement: "CROB", bots: ["Rich"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 878, categorie: "Saisonnier", description: "Sprint ventes dernier trimestre, objectifs annuels.", pilier: "Vente", type: "flow" },
  { id: "pb-CLOB-SAIS-26", nom: "Renouvellement Polices Assurance", departement: "CLOB", bots: ["Loulou"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 228, categorie: "Saisonnier", description: "Audit couvertures, comparaison soumissions, negociation.", pilier: "Argent", type: "flow" },
  { id: "pb-CISOB-SAIS-27", nom: "Acomptes Provisionnels Septembre", departement: "CISOB", bots: ["Frank"], etapes: 4, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.3, downloads: 586, categorie: "Saisonnier", description: "Calcul et versement avant 15 septembre.", pilier: "Argent", type: "flow" },
  { id: "pb-CFOB-SAIS-28", nom: "Strategie Bonus et Dividendes", departement: "CFOB", bots: ["Frank", "CarlOS"], etapes: 6, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.9, downloads: 269, categorie: "Saisonnier", description: "Optimisation fiscale bonus vs dividendes, scenarios.", pilier: "Argent", type: "flow" },
  { id: "pb-CISOB-SAIS-29", nom: "Audit Intrusion Cybersecurite Annuel", departement: "CISOB", bots: ["Sebastien", "Tim"], etapes: 8, duree: "2h", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 721, categorie: "Saisonnier", description: "Tests penetration, scan vulnerabilites, rapport remediation.", pilier: "Actif", type: "flow" },
  { id: "pb-CHROB-SAIS-30", nom: "Evaluations Salariales Fin Annee", departement: "CHROB", bots: ["Helene", "Frank"], etapes: 6, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 316, categorie: "Saisonnier", description: "Revue equite salariale, ajustements, benchmarks.", pilier: "Actif", type: "flow" },
  { id: "pb-CMOB-SAIS-31", nom: "Evenements Promotionnels Novembre", departement: "CMOB", bots: ["Mathilde"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 873, categorie: "Saisonnier", description: "Black Friday, Cyber Monday, campagnes fin annee.", pilier: "Vente", type: "flow" },
  { id: "pb-CEOB-SAIS-32", nom: "Approbation Budgets par le CA", departement: "CEOB", bots: ["CarlOS", "Frank"], etapes: 6, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 305, categorie: "Saisonnier", description: "Presentation budget N+1 au conseil d'administration.", pilier: "Argent", type: "flow" },
  { id: "pb-COOB-SAIS-33", nom: "Securisation Ententes Fournisseurs", departement: "COOB", bots: ["Olivier", "Loulou"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 508, categorie: "Saisonnier", description: "Renouvellement contrats critiques avant fin annee.", pilier: "Actif", type: "flow" },
  { id: "pb-COOB-SAIS-34", nom: "Fermeture Hivernale Decembre", departement: "COOB", bots: ["Olivier"], etapes: 7, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 765, categorie: "Saisonnier", description: "Protocole fermeture 20 dec au 2 jan, securisation sites.", pilier: "Temps", type: "flow" },
  { id: "pb-CFOB-SAIS-35", nom: "Acompte Provisionnel Q4 Decembre", departement: "CFOB", bots: ["Frank"], etapes: 4, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 629, categorie: "Saisonnier", description: "Paiement 4e acompte avant 15 decembre.", pilier: "Argent", type: "flow" },
  { id: "pb-CHROB-SAIS-36", nom: "Bilan Social Annuel IA", departement: "CHROB", bots: ["Helene", "CarlOS"], etapes: 8, duree: "2h", niveau: "Avance", prix: "$49", rating: 4.5, downloads: 353, categorie: "Saisonnier", description: "Rapport complet climat, retention, formation, diversite.", pilier: "Actif", type: "flow" },
];

const INSTALLED_PLAYBOOKS = ["pb-001", "pb-003", "pb-008", "pb-020", "pb-025", "pb-030", "pb-037", "pb-050", "pb-058", "pb-071", "pb-074", "pb-082", "pb-090", "pb-091", "pb-104", "pb-200", "pb-202"];

const RECOMMENDED_PLAYBOOKS: { playbookId: string; raison: string; pilier: string }[] = [
  { playbookId: "pb-012", raison: "Score VITAA Ventes a 38% — closing accelerator pour remonter le pipeline", pilier: "Vente" },
  { playbookId: "pb-028", raison: "Aucune modelisation financiere — essentiel pour levee de fonds ou acquisition", pilier: "Argent" },
  { playbookId: "pb-086", raison: "Score Innovation a 42% — sprint Design Thinking pour pipeline produit", pilier: "Idee" },
  { playbookId: "pb-051", raison: "Aucun PCA en place — risque operationnel critique si sinistre", pilier: "Actif" },
  { playbookId: "pb-100", raison: "Score Securite a 22% — audit baseline urgent (MFA partiel, 0 pentest)", pilier: "Actif" },
  { playbookId: "pb-044", raison: "Score FAAS Alliance a 35% — evaluer et structurer les partenariats B2B", pilier: "Vente" },
  { playbookId: "pb-076", raison: "Score FAAS Fraternite a 52% — sondage climat pour retention talents", pilier: "Actif" },
  { playbookId: "pb-047", raison: "Aucun benchmark concurrentiel recent — analyse 360 urgente", pilier: "Idee" },
];

const NIVEAU_BADGE: Record<string, { bg: string; text: string }> = {
  "Quick Win": { bg: "bg-green-50", text: "text-green-700" },
  "Standard": { bg: "bg-blue-50", text: "text-blue-700" },
  "Avance": { bg: "bg-purple-50", text: "text-purple-700" },
  "Enterprise": { bg: "bg-orange-50", text: "text-orange-700" },
};

// Mock data: playbooks en cours d'execution
const RUNNING_PLAYBOOKS: { playbookId: string; progress: number; etapeActuelle: string; botActif: string; tempsRestant: string; statut: "actif" | "pause"; actionRequise?: string }[] = [
  { playbookId: "pb-028", progress: 45, etapeActuelle: "Calcul des ratios de liquidite", botActif: "Frank", tempsRestant: "1h 15m", statut: "pause", actionRequise: "Frank a besoin du Bilan Q3" },
  { playbookId: "pb-038", progress: 85, etapeActuelle: "Redaction du brief creatif", botActif: "Mathilde", tempsRestant: "2 jours", statut: "actif" },
];

// Mock data: playbooks recemment completes
const COMPLETED_PLAYBOOKS: { playbookId: string; completeLe: string; impact: string; pilierImpact: string }[] = [
  { playbookId: "pb-100", completeLe: "12 oct.", impact: "Risque -40%", pilierImpact: "Actif" },
  { playbookId: "pb-071", completeLe: "05 oct.", impact: "Temps +10pts", pilierImpact: "Temps" },
  { playbookId: "pb-047", completeLe: "28 sep.", impact: "Idee +15pts", pilierImpact: "Idee" },
];

// Mock data: saisonnalite Quebec
const SEASONAL_PLAYBOOKS: { playbookId: string; raison: string; echeance: string }[] = [
  { playbookId: "pb-090", raison: "Loi 25 — Echeance annuelle de declaration aupres de la CAI", echeance: "31 dec. 2026" },
  { playbookId: "pb-075", raison: "CNESST — Renouvellement des formations SST obligatoires", echeance: "1 jan. 2027" },
];

const PILIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Vente: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Idee: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  Temps: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Argent: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Actif: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

// ── Collections V2 (12 collections curateés) ──
const STORE_COLLECTIONS_V2: { id: string; label: string; description: string; icon: React.ElementType; gradient: string; playbookIds: string[] }[] = [
  { id: "essentiels", label: "Les Essentiels pour demarrer", description: "Les 6 playbooks fondamentaux que chaque PME devrait activer en premier", icon: Star, gradient: "from-blue-500 to-indigo-500", playbookIds: ["pb-001", "pb-071", "pb-100", "pb-025", "pb-050", "pb-091"] },
  { id: "conformite", label: "Kit Conformite Quebec", description: "Respectez la Loi 25, CNESST, normes SST et obligations environnementales", icon: Shield, gradient: "from-emerald-500 to-teal-500", playbookIds: ["pb-090", "pb-075", "pb-024", "pb-077", "pb-085", "pb-104"] },
  { id: "croissance", label: "Accelerateurs de Croissance", description: "Boostez vos ventes, marketing et expansion avec des workflows automatises", icon: Rocket, gradient: "from-orange-500 to-red-500", playbookIds: ["pb-010", "pb-012", "pb-038", "pb-037", "pb-045", "pb-028"] },
  { id: "nouveau-ceo", label: "Kit Nouveau CEO", description: "Les 10 premiers playbooks qu'un nouveau dirigeant devrait activer", icon: Crown, gradient: "from-purple-500 to-pink-500", playbookIds: ["pb-001", "pb-028", "pb-100", "pb-071", "pb-050", "pb-091", "pb-003", "pb-008", "pb-025", "pb-030"] },
  { id: "diagnostic", label: "Diagnostic Complet", description: "Passez votre entreprise au scanner — finance, tech, RH, securite, operations", icon: Search, gradient: "from-cyan-500 to-blue-500", playbookIds: ["pb-028", "pb-100", "pb-047", "pb-050", "pb-071", "pb-037"] },
  { id: "crise", label: "Kit Urgence & Crise", description: "Playbooks d'urgence pour les situations critiques — cash flow, incident, rappel produit", icon: ShieldAlert, gradient: "from-red-500 to-rose-500", playbookIds: ["pb-028", "pb-100", "pb-085", "pb-104", "pb-090"] },
  { id: "operations", label: "Automatisation Operations", description: "Production, inventaire, qualite, maintenance — automatisez le plancher", icon: Settings, gradient: "from-gray-500 to-slate-500", playbookIds: ["pb-050", "pb-058", "pb-060", "pb-062", "pb-064"] },
  { id: "scale-up", label: "Scale-Up Pack", description: "Pour les entreprises T3-T5 (50+ employes) pretes a passer au niveau superieur", icon: TrendingUp, gradient: "from-violet-500 to-purple-500", playbookIds: ["pb-010", "pb-012", "pb-037", "pb-045", "pb-003"] },
  { id: "manufacturier", label: "Kit Manufacturier", description: "Specifiquement concu pour les PME manufacturieres quebecoises", icon: HardHat, gradient: "from-amber-500 to-yellow-500", playbookIds: ["pb-050", "pb-058", "pb-060", "pb-062", "pb-090", "pb-075"] },
  { id: "intelligence", label: "Intelligence Concurrentielle", description: "SWOT, veille concurrentielle, positionnement, analyse de marche", icon: Eye, gradient: "from-indigo-500 to-blue-500", playbookIds: ["pb-047", "pb-045", "pb-037", "pb-010"] },
  { id: "rh-complet", label: "Kit RH Complet", description: "Recrutement, onboarding, evaluation de performance, plan de formation", icon: Heart, gradient: "from-pink-500 to-rose-500", playbookIds: ["pb-071", "pb-074", "pb-077", "pb-082"] },
  { id: "planification", label: "Planification Strategique Annuelle", description: "Budget, OKR, plan d'action annuel, revue de performance — tout le cycle", icon: Calendar, gradient: "from-teal-500 to-emerald-500", playbookIds: ["pb-001", "pb-003", "pb-008", "pb-010", "pb-028"] },
];

// Playbook de la semaine (hero)
// Top 3 playbooks de la semaine
const FEATURED_PLAYBOOKS: { playbookId: string; editorial: string; rank: number; gradient: string }[] = [
  { playbookId: "pb-028", editorial: "Le diagnostic financier le plus complet. Frank et CarlOS analysent vos donnees et generent un plan d'action concret.", rank: 1, gradient: "from-blue-600 via-indigo-600 to-purple-600" },
  { playbookId: "pb-045", editorial: "L'atelier BMC le plus populaire du Store. Simone et CarlOS vous guident pas a pas pour structurer votre modele d'affaires.", rank: 2, gradient: "from-rose-600 via-pink-600 to-fuchsia-600" },
  { playbookId: "pb-100", editorial: "Votre premiere ligne de defense. Sebastien et Tim auditent votre posture securite et identifient les failles critiques.", rank: 3, gradient: "from-emerald-600 via-teal-600 to-cyan-600" },
];

// ── Workflows reels par playbook ──
const PLAYBOOK_WORKFLOWS: Record<string, { num: number; label: string; bot: string; duree: string; input?: string; validation?: boolean; livrable?: string }[]> = {
  "pb-028": [
    { num: 1, label: "Collecte des parametres et perimetre d'analyse", bot: "CarlOS", duree: "~1 min", input: "Confirmez le perimetre" },
    { num: 2, label: "Import des donnees financieres", bot: "Frank", duree: "~2 min" },
    { num: 3, label: "Calcul des ratios de liquidite et solvabilite", bot: "Frank", duree: "~3 min" },
    { num: 4, label: "Analyse comparative sectorielle", bot: "Frank", duree: "~3 min", validation: true },
    { num: 5, label: "Generation du rapport PDF", bot: "Frank", duree: "~2 min" },
    { num: 6, label: "Recommandations strategiques priorisees", bot: "CarlOS", duree: "~2 min" },
    { num: 7, label: "Livraison et plan d'action", bot: "CarlOS", duree: "~2 min", livrable: "rapport_diagnostic_financier.pdf" },
  ],
  "pb-100": [
    { num: 1, label: "Inventaire des actifs informatiques", bot: "Sebastien", duree: "~5 min" },
    { num: 2, label: "Analyse des configurations de securite", bot: "Sebastien", duree: "~10 min" },
    { num: 3, label: "Verification MFA et politiques d'acces", bot: "Sebastien", duree: "~5 min", validation: true },
    { num: 4, label: "Scan des vulnerabilites connues", bot: "Tim", duree: "~10 min" },
    { num: 5, label: "Evaluation des sauvegardes", bot: "Sebastien", duree: "~5 min" },
    { num: 6, label: "Generation du rapport d'audit", bot: "Sebastien", duree: "~5 min", livrable: "rapport_audit_securite.pdf" },
  ],
};

// ── Reviews mock ──
const PLAYBOOK_REVIEWS_FALLBACK: { auteur: string; role: string; industrie: string; rating: number; titre: string; texte: string; date: string; resultat?: string }[] = [
  { auteur: "Martin R.", role: "CEO", industrie: "Services, Quebec", rating: 5, titre: "Exactement ce qu'il nous fallait", texte: "Le workflow est clair, les bots livrent rapidement et le resultat est professionnel. On l'a adopte dans notre routine.", date: "2026-03-20", resultat: "Gain de temps estime +30%" },
  { auteur: "Nathalie P.", role: "Dir. Operations", industrie: "Manufacturier, Levis", rating: 4, titre: "Tres utile, bien structure", texte: "Facile a suivre etape par etape. Les livrables sont pertinents et actionnables. Je recommande.", date: "2026-02-28" },
  { auteur: "Yves C.", role: "VP Ventes", industrie: "Distribution, Laval", rating: 5, titre: "ROI immediat", texte: "On a vu des resultats concrets des la premiere semaine. L'equipe IA est impressionnante.", date: "2026-03-05", resultat: "Pipeline +25% en 2 semaines" },
];
const PLAYBOOK_REVIEWS: Record<string, { auteur: string; role: string; industrie: string; rating: number; titre: string; texte: string; date: string; resultat?: string }[]> = {
  "pb-012": [
    { auteur: "Francois M.", role: "VP Ventes", industrie: "SaaS, Montreal", rating: 5, titre: "Notre taux de closing a bondi", texte: "Les scripts personnalises et l'analyse d'objections ont transforme notre approche. Rich et Simone ont identifie nos 3 plus grosses failles dans le pitch.", date: "2026-03-18", resultat: "Taux de closing +22%" },
    { auteur: "Annie L.", role: "Dir. Commerciale", industrie: "Manufacturier, Drummondville", rating: 5, titre: "Game changer pour l'equipe ventes", texte: "Chaque vendeur a maintenant un script adapte a son style. Les objections sont anticipees et les reponses sont naturelles.", date: "2026-02-25", resultat: "Cycle de vente -15 jours" },
    { auteur: "Patrick T.", role: "CEO", industrie: "Services B2B, Quebec", rating: 4, titre: "Excellent pour structurer le closing", texte: "On improvisait avant. Maintenant on a un processus. Seul bemol: necessite du coaching pour bien integrer les scripts.", date: "2026-03-08" },
  ],
  "pb-028": [
    { auteur: "Marc D.", role: "Dir. Operations", industrie: "Manufacturier, Quebec", rating: 5, titre: "Exactement ce dont on avait besoin", texte: "Le diagnostic a revele 3 problemes qu'on ne voyait pas. Le plan d'action etait concret et applicable.", date: "2026-03-15", resultat: "Temps de diagnostic reduit de 40%" },
    { auteur: "Julie L.", role: "CFO", industrie: "Distribution, Montreal", rating: 4, titre: "Tres bon mais manque de granularite", texte: "L'analyse est pertinente mais j'aurais aime plus de details sur les ratios sectoriels.", date: "2026-02-10" },
    { auteur: "Pierre B.", role: "CEO", industrie: "Alimentaire, Trois-Rivieres", rating: 5, titre: "On l'utilise chaque trimestre maintenant", texte: "Simple, rapide, et le rapport est professionnel. Nos investisseurs sont impressionnes.", date: "2026-01-28", resultat: "Adopte comme outil trimestriel" },
  ],
  "pb-100": [
    { auteur: "Sophie G.", role: "Dir. TI", industrie: "Logistique, Laval", rating: 5, titre: "A revele des failles critiques", texte: "On pensait etre OK. L'audit a trouve 7 failles dont 2 critiques. Corrigees en 48h grace au plan.", date: "2026-03-01", resultat: "Score securite +35 points" },
    { auteur: "Eric T.", role: "CEO", industrie: "Manufacturier, Sherbrooke", rating: 4, titre: "Bon point de depart", texte: "Pour le prix, c'est un excellent premier audit. On a enchaine avec le plan de reponse incidents.", date: "2026-02-20" },
  ],
};

// ── Livrables mock ──
const PLAYBOOK_LIVRABLES: Record<string, { nom: string; type: string; icon: React.ElementType }[]> = {
  "pb-028": [
    { nom: "Rapport de diagnostic financier", type: "PDF", icon: FileText },
    { nom: "Tableau comparatif industrie", type: "Excel", icon: Table2 },
    { nom: "Plan d'action priorise", type: "PDF", icon: CheckCircle2 },
  ],
  "pb-100": [
    { nom: "Rapport d'audit securite", type: "PDF", icon: Shield },
    { nom: "Matrice de risques", type: "Excel", icon: ClipboardCheck },
    { nom: "Plan de correction (12 actions)", type: "PDF", icon: Wrench },
  ],
};

// ── Dept icons mapping for category grid ──
// ── ICÔNES OFFICIELLES DÉPARTEMENTS (source unique — catalogue Section B) ──
export const DEPT_DASH_ICON: Record<string, React.ElementType> = {
  CEOB: Crown, CFOB: DollarSign, CTOB: Cpu, CPOB: Factory, COOB: Settings,
  CROB: TrendingUp, CMOB: Megaphone, CSOB: Compass, CHROB: Users,
  CISOB: ShieldCheck, CLOB: Scale, CINOB: Lightbulb,
};
// Alias pour compatibilité interne (Playbooks, ConferenceAI, etc.)
const DEPT_ICONS = DEPT_DASH_ICON;

// ── PLAYBOOK_TYPES — 12 types de livrables ──
const PLAYBOOK_TYPES: Record<string, { label: string; icon: React.ElementType; description: string; bg: string; text: string; gradient: string }> = {
  chantier:    { label: "Chantier",    icon: Flame,          description: "Transformations completes (2-12 mois)",    bg: "bg-blue-50",    text: "text-blue-700",    gradient: "from-blue-600 to-blue-500" },
  projet:      { label: "Projet",      icon: FolderOpen,     description: "Livrables structures (1-3 mois)",          bg: "bg-indigo-50",  text: "text-indigo-700",  gradient: "from-indigo-600 to-indigo-500" },
  mission:     { label: "Mission",     icon: Target,         description: "Actions recurrentes (1-4 sem)",             bg: "bg-amber-50",   text: "text-amber-700",   gradient: "from-amber-600 to-amber-500" },
  tache:       { label: "Tache",       icon: ListChecks,     description: "Checklists/actions atomiques",              bg: "bg-emerald-50", text: "text-emerald-700", gradient: "from-emerald-600 to-emerald-500" },
  conference:  { label: "Conference",  icon: Video,          description: "Sessions temps reel",                       bg: "bg-pink-50",    text: "text-pink-700",    gradient: "from-pink-600 to-pink-500" },
  document:    { label: "Document",    icon: FileText,       description: "Fichiers generes (Word/Excel/PDF)",         bg: "bg-gray-50",    text: "text-gray-700",    gradient: "from-gray-600 to-gray-500" },
  flow:        { label: "Flow",        icon: Repeat,         description: "Workflows automatises (COMMAND)",           bg: "bg-violet-50",  text: "text-violet-700",  gradient: "from-violet-600 to-violet-500" },
  diagnostic:  { label: "Diagnostic",  icon: Stethoscope,    description: "Evaluations/scoring",                      bg: "bg-red-50",     text: "text-red-700",     gradient: "from-red-600 to-red-500" },
  formation:   { label: "Formation",   icon: GraduationCap,  description: "Parcours apprentissage/coaching",           bg: "bg-teal-50",    text: "text-teal-700",    gradient: "from-teal-600 to-teal-500" },
  blueprint:   { label: "Blueprint",   icon: MapPin,         description: "Documents strategiques",                    bg: "bg-purple-50",  text: "text-purple-700",  gradient: "from-purple-600 to-purple-500" },
  cognitif:    { label: "Cognitif",    icon: Cog,            description: "Cerveaux experts uploades",                 bg: "bg-orange-50",  text: "text-orange-700",  gradient: "from-orange-600 to-orange-500" },
  reseau:      { label: "Reseau",      icon: Network,        description: "Collaborations Orbit9",                    bg: "bg-cyan-50",    text: "text-cyan-700",    gradient: "from-cyan-600 to-cyan-500" },
};

// ── Descriptions longues pour la fiche detail ──
const PLAYBOOK_LONG_DESC: Record<string, string> = {
  "pb-012": "Rich et Simone analysent vos objections recurrentes et generent des scripts de closing personnalises pour votre industrie. Augmentez votre taux de closing de 15 a 25% avec un processus structure et repeatable.",
  "pb-028": "Frank calcule 25+ ratios financiers et compare vos resultats aux moyennes de votre secteur au Quebec. Vous recevez un rapport executif PDF avec des recommandations priorisees par impact.",
  "pb-100": "Sebastien et Tim auditent vos actifs informatiques, configurations de securite et politiques d'acces. Le rapport inclut une matrice de risques et un plan de correction en 12 actions concretes.",
};

// Precomputed thresholds for card badges
const _sortedByDownloads = [...PLAYBOOK_STORE_DATA].sort((a, b) => b.downloads - a.downloads);
const _bestsellersTop20 = new Set(_sortedByDownloads.slice(0, 20).map(p => p.id));
const _sortedByRating = [...PLAYBOOK_STORE_DATA].sort((a, b) => b.rating - a.rating);
const _trendingTop10 = new Set(_sortedByRating.slice(0, 10).map(p => p.id));
const _newestIds = new Set(PLAYBOOK_STORE_DATA.slice(-Math.ceil(PLAYBOOK_STORE_DATA.length * 0.1)).map(p => p.id));

function PlaybookCardV2({ pb, installed, recommended, badge, onOpenDetail }: { pb: typeof PLAYBOOK_STORE_DATA[0]; installed?: boolean; recommended?: boolean; badge?: "nouveau" | "populaire" | "trending"; onOpenDetail?: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  const niveauStyle = NIVEAU_BADGE[pb.niveau] || NIVEAU_BADGE.Standard;
  const DeptIcon = DEPT_ICONS[pb.departement] || Building2;
  const isInstalled = installed || INSTALLED_PLAYBOOKS.includes(pb.id);

  // Compute auto-badges from data
  const isBestseller = _bestsellersTop20.has(pb.id);
  const isTrending = _trendingTop10.has(pb.id);
  const isNew = _newestIds.has(pb.id);

  const badgeEl = badge === "nouveau" ? <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 shrink-0">Nouveau</span>
    : badge === "populaire" ? <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 shrink-0">Populaire</span>
    : badge === "trending" ? <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 shrink-0">Trending</span>
    : recommended ? <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-green-50 text-green-700 shrink-0">IA Recommande</span>
    : isInstalled ? <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 shrink-0 flex items-center gap-0.5"><CheckCircle2 className="h-3.5 w-3.5" />Installe</span>
    : null;

  // 5-star visual rating
  const fullStars = Math.floor(pb.rating);
  const hasHalf = pb.rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="relative rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onOpenDetail?.(pb)}>
      {/* Absolute corner badges */}
      {!badge && (isBestseller || isTrending || isNew) && (
        <div className="absolute top-0 right-0 z-10 flex flex-col gap-0.5 p-1">
          {isBestseller && <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-bl rounded-tr-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-0.5"><Trophy className="h-3.5 w-3.5" />Best</span>}
          {isTrending && !isBestseller && <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 flex items-center gap-0.5"><Flame className="h-3.5 w-3.5" />Trend</span>}
          {isNew && !isBestseller && !isTrending && <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 flex items-center gap-0.5"><Sparkles className="h-3.5 w-3.5" />New</span>}
        </div>
      )}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
        <DeptIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
        <span className="text-sm font-bold text-gray-900 flex-1 truncate">{pb.nom}</span>
        {badgeEl}
      </div>
      <div className="px-4 py-3 space-y-2.5">
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{pb.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            {pb.bots.slice(0, 3).map((bot, i) => (
              <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{bot}</span>
            ))}
            {pb.bots.length > 3 && <span className="text-[10px] text-gray-400">+{pb.bots.length - 3}</span>}
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: fullStars }).map((_, i) => <Star key={`f${i}`} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />)}
            {hasHalf && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-200" />}
            {Array.from({ length: emptyStars }).map((_, i) => <Star key={`e${i}`} className="h-3.5 w-3.5 text-gray-200" />)}
            <span className="text-[10px] font-bold text-gray-700 ml-1">{pb.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", niveauStyle.bg, niveauStyle.text)}>{pb.niveau}</span>
          {pb.type && PLAYBOOK_TYPES[pb.type] && (() => { const t = PLAYBOOK_TYPES[pb.type]; const TIcon = t.icon; return <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5", t.bg, t.text)}><TIcon className="h-3.5 w-3.5" />{t.label}</span>; })()}
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", pb.prix === "Gratuit" ? "bg-emerald-50 text-emerald-700" : "bg-purple-50 text-purple-700")}>{pb.prix === "Gratuit" ? "Inclus" : pb.prix}</span>
          <span className="text-[10px] text-gray-500">{pb.duree}</span>
          <span className="text-[10px] text-gray-500">{pb.etapes} etapes</span>
        </div>
      </div>
    </div>
  );
}

// ── Fiche Playbook Detaillee INLINE (PAS de modal — drill-down dans le panel) ──
function PlaybookFicheDetailInline({ pb, onBack }: { pb: typeof PLAYBOOK_STORE_DATA[0]; onBack: () => void }) {
  const niveauStyle = NIVEAU_BADGE[pb.niveau] || NIVEAU_BADGE.Standard;
  const isInstalled = INSTALLED_PLAYBOOKS.includes(pb.id);
  const pilierColor = PILIER_COLORS[pb.pilier] || PILIER_COLORS.Actif;
  const workflows = PLAYBOOK_WORKFLOWS[pb.id] || Array.from({ length: pb.etapes }, (_, i) => ({
    num: i + 1, label: i === 0 ? "Collecte des donnees et parametres" : i === pb.etapes - 1 ? "Generation du livrable final" : `Etape ${i + 1} — Traitement automatise`, bot: pb.bots[i % pb.bots.length], duree: "~2 min", validation: i === Math.floor(pb.etapes / 2),
  }));
  const reviews = PLAYBOOK_REVIEWS[pb.id] || PLAYBOOK_REVIEWS_FALLBACK;
  const livrables = PLAYBOOK_LIVRABLES[pb.id] || [];
  const similarDept = PLAYBOOK_STORE_DATA.filter(p => p.departement === pb.departement && p.id !== pb.id).slice(0, 3);
  const similarPilier = PLAYBOOK_STORE_DATA.filter(p => p.pilier === pb.pilier && p.id !== pb.id && p.departement !== pb.departement).slice(0, 3);

  // Resolve bot name → code for avatars
  const botNameToCode = Object.fromEntries(Object.entries(BOT_DISPLAY).map(([code, d]) => [d.name, code]));
  const deptColor = DEPT_COLORS[pb.departement] || DEPT_COLORS.CEOB;
  const DeptIcon = DEPT_ICONS[pb.departement] || Building2;

  return (
    <div className="space-y-3">
      {/* Back button */}
      <button onClick={onBack} className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
        <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Retour au Store
      </button>

      {/* Section 1 — Hero + Details side by side */}
      <div className="grid grid-cols-5 gap-3">
        {/* Hero (3/5) — style Top 3 gradient */}
        <div className={cn("col-span-3 relative bg-gradient-to-r rounded-xl overflow-hidden shadow-sm", deptColor.gradient)}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative p-4 space-y-3">
            <h3 className="text-lg font-bold text-white leading-tight flex items-center gap-2">
              <DeptIcon className="h-5 w-5 text-white shrink-0" />
              {pb.nom}
            </h3>
            <p className="text-xs text-white/80 leading-relaxed">{PLAYBOOK_LONG_DESC[pb.id] || pb.description}</p>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={cn("h-3.5 w-3.5", s <= Math.round(pb.rating) ? "text-amber-300 fill-amber-300" : "text-white/20")} />
                ))}
              </div>
              <span className="text-xs text-white font-bold">{pb.rating}/5</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-white/70">
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{pb.downloads} activations</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{pb.duree}</span>
              <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />{pb.etapes} etapes</span>
              <span className="font-medium px-1.5 py-0.5 rounded bg-white/15 text-white">v1.0</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {isInstalled ? (
                <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-900 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all">
                  <Rocket className="h-3.5 w-3.5" /> Executer
                </button>
              ) : pb.prix === "Gratuit" ? (
                <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-900 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all">
                  <Plus className="h-3.5 w-3.5" /> Activer ce playbook
                </button>
              ) : (
                <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-900 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all">
                  <ShoppingBag className="h-3.5 w-3.5" /> Acheter {pb.prix}
                </button>
              )}
              <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 rounded-lg cursor-pointer transition-colors">
                <Eye className="h-3.5 w-3.5" /> Previsualiser
              </button>
            </div>
          </div>
        </div>

        {/* Details (2/5) */}
        <div className="col-span-2 rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Settings className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Details</span>
          </div>
          <div className="px-4 py-3 flex-1 flex flex-col">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Departement</span>
                <span className="text-xs font-bold text-gray-700">{DEPT_LABELS[pb.departement] || pb.departement}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Categorie</span>
                <span className="text-xs font-bold text-gray-700">{pb.categorie}</span>
              </div>
              {pb.type && PLAYBOOK_TYPES[pb.type] && (() => { const t = PLAYBOOK_TYPES[pb.type]; const TIcon = t.icon; return (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Type</span>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1", t.bg, t.text)}><TIcon className="h-3.5 w-3.5" />{t.label}</span>
              </div>); })()}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Pilier VITAA</span>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", pilierColor.bg, pilierColor.text, pilierColor.border, "border")}>{pb.pilier}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Createur</span>
                <span className="text-xs font-bold text-gray-700">Brain Team</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2+3 — Ce que ce playbook fait + Equipe (side by side) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Ce que ce playbook fait */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <CheckCircle2 className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Ce que ce playbook fait</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {(pb.description + ". Analyse automatique de vos donnees. Generation d'un rapport complet. Plan d'action priorise.").split(". ").filter(Boolean).slice(0, 4).map((point, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700 leading-relaxed">{point.trim()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Equipe IA impliquee */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Equipe IA</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {pb.bots.map((bot, i) => {
              const bCode = botNameToCode[bot] || "CEOB";
              const bAvatar = BOT_AVATAR_MAP[bCode] || BOT_AVATAR_MAP.CEOB;
              const bDisplay = BOT_DISPLAY[bCode];
              return (
                <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                  <img src={bAvatar} className="h-7 w-7 rounded-full ring-2 ring-white/80 object-cover shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-gray-800 block">{bot}</span>
                    <span className="text-[10px] text-gray-500">{bDisplay?.role || "Agent"} — {bDisplay?.dept || ""}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{i === 0 ? "Pilote" : i === 1 ? "Analyste" : "Support"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 4 — Workflow */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Activity className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Workflow</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 ml-auto">{workflows.length} etapes</span>
        </div>
        <div className="px-4 py-3 space-y-1">
          {workflows.map((step) => {
            const sCode = botNameToCode[step.bot] || "CEOB";
            const sAvatar = BOT_AVATAR_MAP[sCode] || BOT_AVATAR_MAP.CEOB;
            return (
              <div key={step.num} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-[10px] font-bold text-white bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0">{step.num}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-800">{step.label}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {step.validation && <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5"><AlertTriangle className="h-3.5 w-3.5" /> Validation requise</span>}
                    {step.livrable && <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5"><FileText className="h-3.5 w-3.5" /> {step.livrable}</span>}
                    {step.input && <span className="text-[10px] text-gray-500 italic">{step.input}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <img src={sAvatar} className="h-5 w-5 rounded-full object-cover" alt="" />
                  <span className="text-[10px] font-bold text-blue-600">{step.bot}</span>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{step.duree}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 5 — Ce que vous recevez (livrables) */}
      {livrables.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <FileText className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Ce que vous recevez</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {livrables.map((l, i) => {
              const LivIcon = l.icon;
              return (
                <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                  <LivIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-700 flex-1">{l.nom}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-600">{l.type}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 6 — Avis utilisateurs */}
      {reviews.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Star className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Avis utilisateurs</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 ml-auto">{reviews.length} avis</span>
          </div>
          <div className="px-4 py-3 space-y-3">
            {/* Rating distribution */}
            <div className="space-y-0.5">
              {[5,4,3,2,1].map(stars => {
                const count = reviews.filter(r => r.rating === stars).length;
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-500 w-3">{stars}</span>
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <div className="flex-1 bg-gray-100 rounded-full h-2"><div className="bg-amber-400 rounded-full h-2 transition-all" style={{ width: `${pct}%` }} /></div>
                    <span className="text-[10px] text-gray-400 w-4 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
            {/* Reviews */}
            <div className="space-y-2.5">
              {reviews.map((r, i) => (
                <div key={i} className="border-t border-gray-100 pt-2.5">
                  <div className="flex items-center gap-1 mb-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className={cn("h-3.5 w-3.5", s <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200")} />)}
                    <span className="text-xs font-bold text-gray-800 ml-1.5">{r.titre}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{r.texte}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                    <span className="font-medium">{r.auteur}, {r.role}</span>
                    <span>{r.industrie}</span>
                    {r.resultat && <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">{r.resultat}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 7 — Playbooks similaires */}
      {(similarDept.length > 0 || similarPilier.length > 0) && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Zap className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Playbooks similaires</span>
          </div>
          <div className="px-4 py-3 space-y-3">
            {similarDept.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Souvent active ensemble</h4>
                <div className="grid grid-cols-3 gap-2">
                  {similarDept.map(sp => {
                    const spCode = botNameToCode[sp.bots[0]] || "CEOB";
                    const spAvatar = BOT_AVATAR_MAP[spCode] || BOT_AVATAR_MAP.CEOB;
                    return (
                      <div key={sp.id} className="bg-gray-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-1.5 mb-1">
                          <img src={spAvatar} className="h-5 w-5 rounded-full object-cover" alt="" />
                          <span className="text-[10px] text-gray-500">{sp.bots[0]}</span>
                        </div>
                        <div className="text-xs font-bold text-gray-800 line-clamp-2">{sp.nom}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{sp.niveau} · {sp.prix}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {similarPilier.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Vous pourriez aussi aimer</h4>
                <div className="grid grid-cols-3 gap-2">
                  {similarPilier.map(sp => {
                    const spCode = botNameToCode[sp.bots[0]] || "CEOB";
                    const spAvatar = BOT_AVATAR_MAP[spCode] || BOT_AVATAR_MAP.CEOB;
                    return (
                      <div key={sp.id} className="bg-gray-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-1.5 mb-1">
                          <img src={spAvatar} className="h-5 w-5 rounded-full object-cover" alt="" />
                          <span className="text-[10px] text-gray-500">{sp.bots[0]}</span>
                        </div>
                        <div className="text-xs font-bold text-gray-800 line-clamp-2">{sp.nom}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{sp.niveau} · {sp.prix}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// ══════════════════════════════════════════
// PLAYBOOK STORE — Vues individuelles
// ══════════════════════════════════════════

type PlaybookStoreView = "decouvrir" | "categorie" | "types" | "conferenceai" | "collections" | "installed" | "encours" | "historique" | "builder";

// ── Vue DECOUVRIR (homepage du Store) ──
function PlaybookDecouvrir({ botCode, onOpenDetail, onNavigate }: { botCode: string; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void; onNavigate: (view: PlaybookStoreView, extra?: { dept?: string; collection?: string }) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterNiveau, setFilterNiveau] = useState<string>("all");
  const [filterPrix, setFilterPrix] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("populaires");
  const [viewMode, setViewMode] = useState<"cards" | "list" | "table">("cards");

  const hasFilters = searchTerm.trim() || filterDept !== "all" || filterType !== "all" || filterNiveau !== "all" || filterPrix !== "all";

  // Base pool: CEOB = tout, autre = priorise son département
  const basePool = botCode === "CEOB" ? PLAYBOOK_STORE_DATA : [...PLAYBOOK_STORE_DATA.filter(p => p.departement === botCode), ...PLAYBOOK_STORE_DATA.filter(p => p.departement !== botCode)];

  // Filtered pool
  let filteredPool = basePool.filter(pb => {
    if (searchTerm.trim() && !pb.nom.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.categorie.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterDept !== "all" && pb.departement !== filterDept) return false;
    if (filterType !== "all" && pb.type !== filterType) return false;
    if (filterNiveau !== "all" && pb.niveau !== filterNiveau) return false;
    if (filterPrix === "gratuit" && pb.prix !== "Gratuit") return false;
    if (filterPrix === "premium" && pb.prix === "Gratuit") return false;
    return true;
  });

  if (sortBy === "populaires") filteredPool.sort((a, b) => b.downloads - a.downloads);
  else if (sortBy === "rating") filteredPool.sort((a, b) => b.rating - a.rating);
  else if (sortBy === "alpha") filteredPool.sort((a, b) => a.nom.localeCompare(b.nom));

  // Curated sections — filtré par département quand non-CEOB
  const deptPool = botCode !== "CEOB" ? PLAYBOOK_STORE_DATA.filter(p => p.departement === botCode) : PLAYBOOK_STORE_DATA;
  const bestsellers = [...deptPool].sort((a, b) => b.downloads - a.downloads).slice(0, 8);
  const recent = [...deptPool].slice(-8).reverse();
  const gratuits = [...deptPool].filter(p => p.prix === "Gratuit").sort((a, b) => b.downloads - a.downloads).slice(0, 8);

  // Section row helper — respecte viewMode global
  const SectionRow = ({ title, icon: Icon, iconColor, items, badge, seeAllAction }: { title: string; icon: React.ElementType; iconColor: string; items: typeof PLAYBOOK_STORE_DATA; badge?: "nouveau" | "populaire" | "trending"; seeAllAction?: () => void }) => {
    if (items.length === 0) return null;
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Icon className={cn("h-3.5 w-3.5", iconColor)} /> {title}</h3>
          {seeAllAction && <button onClick={seeAllAction} className="text-[9px] text-blue-500 hover:text-blue-700 cursor-pointer font-bold">Voir tout →</button>}
        </div>
        <PlaybookMultiView playbooks={items.slice(0, 8)} viewMode={viewMode} onOpenDetail={onOpenDetail} />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* ═══ TOOLBAR — 2 lignes équilibrées ═══ */}
      <div className="space-y-2">
        {/* Ligne 1 : Recherche pleine largeur */}
        <div className={SF.searchWrap}>
          <Search className={SF.searchIcon} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher un playbook..." className={SF.searchInput} />
        </div>
        {/* Ligne 2 : Filtres + Classement + Mode de vue + Count */}
        <div className="flex items-center gap-2">
          {botCode === "CEOB" && (
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className={SF.select}>
              <option value="all">Departement</option>
              {Object.entries(DEPT_SHORT_LABEL).filter(([code]) => code !== "ORBIT9").map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          )}
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className={SF.select}>
            <option value="all">Type</option>
            {Object.entries(PLAYBOOK_TYPES).map(([key, t]) => <option key={key} value={key}>{t.label}</option>)}
          </select>
          <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)} className={SF.select}>
            <option value="all">Niveau</option>
            <option value="Quick Win">Quick Win</option>
            <option value="Standard">Standard</option>
            <option value="Avance">Avance</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          <select value={filterPrix} onChange={e => setFilterPrix(e.target.value)} className={SF.select}>
            <option value="all">Prix</option>
            <option value="gratuit">Inclus</option>
            <option value="premium">Premium</option>
          </select>
          <div className="flex-1" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={SF.select}>
            <option value="populaires">Populaires</option>
            <option value="rating">Mieux notes</option>
            <option value="alpha">A-Z</option>
          </select>
          <PlaybookViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          <span className={SF.itemCount}>{hasFilters ? `${filteredPool.length} trouves` : `${basePool.length} playbooks`}</span>
        </div>
      </div>

      {/* ═══ FILTERED RESULTS (when filters active) ═══ */}
      {hasFilters ? (
        filteredPool.length > 0 ? (
          <PlaybookMultiView playbooks={filteredPool} viewMode={viewMode} onOpenDetail={onOpenDetail} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-8 w-8 text-gray-200 mb-3" />
            <p className="text-xs text-gray-400 mb-2">Aucun playbook ne correspond a vos criteres</p>
            <button onClick={() => { setSearchTerm(""); setFilterDept("all"); setFilterType("all"); setFilterNiveau("all"); setFilterPrix("all"); }} className="text-[9px] text-blue-600 font-bold cursor-pointer">Reinitialiser les filtres</button>
          </div>
        )
      ) : (
        <>
          {/* ═══ CURATED SECTIONS (no filters) ═══ */}

          {/* Section 1 — Bestsellers */}
          <SectionRow title="Bestsellers" icon={Trophy} iconColor="text-amber-500" items={bestsellers} badge="populaire" />

          {/* Section 2 — Nouveautes */}
          <SectionRow title={botCode !== "CEOB" ? `Nouveautes ${DEPT_SHORT_LABEL[botCode] || botCode}` : "Nouveautes"} icon={Sparkles} iconColor="text-blue-500" items={recent} badge="nouveau" />

          {/* Section 3 — Gratuits populaires */}
          <SectionRow title="Gratuits populaires" icon={Award} iconColor="text-emerald-500" items={gratuits} />

          {/* Section 5 — Collections vedettes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Bookmark className="h-3.5 w-3.5 text-purple-500" /> Collections vedettes</h3>
              <button onClick={() => onNavigate("collections")} className="text-[9px] text-blue-500 hover:text-blue-700 cursor-pointer font-bold">Voir tout →</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {STORE_COLLECTIONS_V2.slice(0, 4).map(col => {
                const ColIcon = col.icon;
                return (
                  <Card key={col.id} className="p-0 gap-0 overflow-hidden rounded-xl cursor-pointer hover:shadow-md transition-all" onClick={() => onNavigate("collections", { collection: col.id })}>
                    <div className={cn("bg-gradient-to-r px-3 py-3", col.gradient)}>
                      <ColIcon className="h-4 w-4 text-white mb-1" />
                      <div className="text-[10px] font-bold text-white">{col.label}</div>
                      <div className="text-[8px] text-white/70 mt-0.5 line-clamp-1">{col.description}</div>
                      <div className="text-[8px] text-white/60 mt-1">{col.playbookIds.length} playbooks</div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Section 6 — Explorer par departement (CEOB only) */}
          {botCode === "CEOB" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><LayoutGrid className="h-3.5 w-3.5 text-gray-500" /> Explorer par departement</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(DEPT_LABELS).filter(([code]) => code !== "ORBIT9").map(([code, label]) => {
                  const DIcon = DEPT_ICONS[code] || Building2;
                  const deptPlaybooks = PLAYBOOK_STORE_DATA.filter(p => p.departement === code);
                  const count = deptPlaybooks.length;
                  const avgRating = count > 0 ? (deptPlaybooks.reduce((s, p) => s + p.rating, 0) / count).toFixed(1) : "0";
                  const avatarSrc = BOT_AVATAR[code];
                  const botName = BOT_NAME[code] || code;
                  return (
                    <div key={code} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onNavigate("categorie", { dept: code })}>
                      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                        {avatarSrc ? (
                          <img src={avatarSrc} alt={botName} className="h-6 w-6 rounded-full ring-1 ring-white/80 object-cover shrink-0" />
                        ) : (
                          <DIcon className="h-4 w-4 text-gray-900 stroke-[2.5] shrink-0" />
                        )}
                        <span className="text-xs font-bold text-gray-900 flex-1 truncate">{label}</span>
                      </div>
                      <div className="px-3 py-2 flex items-center gap-3 text-[10px] text-gray-500">
                        <span className="font-bold text-gray-700">{count}</span>
                        <span className="flex items-center gap-0.5"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />{avgRating}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 7 — Explorer par type */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-indigo-500" /> {botCode !== "CEOB" ? `Types ${DEPT_SHORT_LABEL[botCode] || botCode}` : "Explorer par type"}</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(PLAYBOOK_TYPES).map(([key, t]) => {
                const TIcon = t.icon;
                const typePlaybooks = botCode !== "CEOB"
                  ? PLAYBOOK_STORE_DATA.filter(p => p.type === key && p.departement === botCode)
                  : PLAYBOOK_STORE_DATA.filter(p => p.type === key);
                const count = typePlaybooks.length;
                if (count === 0) return null;
                return (
                  <div key={key} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onNavigate("types", { dept: key })}>
                    <div className={cn("flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gradient-to-r text-white", t.gradient)}>
                      <TIcon className="h-3.5 w-3.5 text-white shrink-0" />
                      <span className="text-[10px] font-bold text-white">{t.label}</span>
                    </div>
                    <div className="px-3 py-2 text-[10px] text-gray-500">
                      <span className="font-bold text-gray-700">{count}</span> playbooks
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Bandeau Marketplace */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2 flex items-center gap-2">
        <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <span className="text-[9px] text-blue-700">Playbook Store · {botCode !== "CEOB" ? `${PLAYBOOK_STORE_DATA.filter(p => p.departement === botCode).length} playbooks ${DEPT_SHORT_LABEL[botCode] || botCode}` : `${PLAYBOOK_STORE_DATA.length} playbooks disponibles`} · 85% createur / 15% plateforme</span>
        <button onClick={() => onNavigate("builder")} className="text-[9px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer ml-auto shrink-0">Publiez le votre →</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// CONFERENCE AI — Mega Section (toutes les familles)
// ══════════════════════════════════════════

const CONFERENCE_FAMILIES: Record<string, { label: string; icon: React.ElementType; description: string; gradient: string; bg: string; text: string }> = {
  VENT: { label: "Vente & Revenus", icon: Banknote, description: "Pitch decks, closing assiste, prospection, negociation", gradient: "from-emerald-600 to-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  POD: { label: "Podcast & Audio", icon: Headphones, description: "Studio podcast, distribution, guest matching, SEO audio", gradient: "from-violet-600 to-violet-500", bg: "bg-violet-50", text: "text-violet-700" },
  CONT: { label: "Contenu & Redaction", icon: FileText, description: "Articles, copywriting, whitepapers, documentation", gradient: "from-blue-600 to-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  PRE: { label: "Pre-Entrevue & RH", icon: User, description: "Entrevues candidats, grilles evaluation, rapports", gradient: "from-pink-600 to-pink-500", bg: "bg-pink-50", text: "text-pink-700" },
  RH: { label: "Ressources Humaines", icon: Heart, description: "Evaluations, plans individuels, entrevues de depart", gradient: "from-rose-600 to-rose-500", bg: "bg-rose-50", text: "text-rose-700" },
  CREA: { label: "Creativite & Innovation", icon: Sparkles, description: "Design Thinking, SCAMPER, brainstorming, Kaizen", gradient: "from-amber-600 to-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
  MED: { label: "Mediation", icon: Handshake, description: "Mediation commerciale, syndicale, succession familiale", gradient: "from-teal-600 to-teal-500", bg: "bg-teal-50", text: "text-teal-700" },
  CRISE: { label: "Gestion de Crise", icon: ShieldAlert, description: "Cybersecurite, restructuration, rappels produits", gradient: "from-red-600 to-red-500", bg: "bg-red-50", text: "text-red-700" },
  EXP: { label: "Express (<15min)", icon: Zap, description: "Daily standups, triage urgent, reviews rapides", gradient: "from-orange-600 to-orange-500", bg: "bg-orange-50", text: "text-orange-700" },
  REC: { label: "Recurrents", icon: Repeat, description: "Bilans hebdo, digests financiers, revues strategiques", gradient: "from-cyan-600 to-cyan-500", bg: "bg-cyan-50", text: "text-cyan-700" },
  REU: { label: "Reunions Structurees", icon: Video, description: "Board meetings, comites techniques, retrospectives", gradient: "from-indigo-600 to-indigo-500", bg: "bg-indigo-50", text: "text-indigo-700" },
  VERT: { label: "Verticaux Industrie", icon: HardHat, description: "HACCP, CCQ, SOC 2, Loi 25, aerospatiale, cosmetiques", gradient: "from-gray-700 to-gray-600", bg: "bg-gray-100", text: "text-gray-700" },
  ORB: { label: "Orbit9 Cross-Entreprise", icon: Globe, description: "Matching, achats groupes, export, mentorat croise", gradient: "from-purple-600 to-purple-500", bg: "bg-purple-50", text: "text-purple-700" },
  FORM: { label: "Formation & Coaching", icon: GraduationCap, description: "Onboarding, certifications, bootcamps, simulations", gradient: "from-sky-600 to-sky-500", bg: "bg-sky-50", text: "text-sky-700" },
  SAIS: { label: "Saisonniers", icon: Calendar, description: "Fiscalite, REER, CNESST, fermetures CCQ, budgets", gradient: "from-lime-600 to-lime-500", bg: "bg-lime-50", text: "text-lime-700" },
  PERS: { label: "Personnel & Destiny", icon: Route, description: "Coaching couple, retraite, stress, deuil entrepreneurial", gradient: "from-fuchsia-600 to-fuchsia-500", bg: "bg-fuchsia-50", text: "text-fuchsia-700" },
};

function getPlaybookFamily(pb: typeof PLAYBOOK_STORE_DATA[0]): string {
  const match = pb.id.match(/^pb-[A-Z]+-([A-Z]+)-/);
  if (match) return match[1];
  if (pb.id.startsWith("pb-GHO-")) return "GHO";
  return "";
}

// ── Vue interne Conference AI (contenu principal dans la section) ──
function ConferenceAIContent({ onOpenDetail, onSelectFamily, selectedFamily }: {
  onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void;
  onSelectFamily: (family: string | null) => void;
  selectedFamily: string | null;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rating" | "downloads" | "nom" | "prix">("rating");

  const allConferencePlaybooks = PLAYBOOK_STORE_DATA.filter(pb => {
    const family = getPlaybookFamily(pb);
    return family !== "" && CONFERENCE_FAMILIES[family] !== undefined || pb.id.startsWith("pb-GHO-") || pb.type === "conference" || pb.type === "formation" || pb.type === "cognitif";
  });

  const conferenceCount = allConferencePlaybooks.length;

  if (selectedFamily) {
    const familyInfo = CONFERENCE_FAMILIES[selectedFamily];
    const familyPlaybooks = allConferencePlaybooks.filter(pb => getPlaybookFamily(pb) === selectedFamily)
    .filter(pb => !searchTerm || pb.nom.toLowerCase().includes(searchTerm.toLowerCase()) || pb.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(pb => filterDept === "all" || pb.departement === filterDept);

    const sortedPlaybooks = [...familyPlaybooks].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "downloads") return b.downloads - a.downloads;
      if (sortBy === "nom") return a.nom.localeCompare(b.nom);
      return (a.prix === "Gratuit" ? 0 : 1) - (b.prix === "Gratuit" ? 0 : 1);
    });

    const FIcon = familyInfo?.icon || Video;
    const depts = [...new Set(familyPlaybooks.map(p => p.departement))];

    return (
      <div className="space-y-3">
        <div className={cn("bg-gradient-to-r rounded-xl px-5 py-4 text-white", familyInfo?.gradient || "from-blue-600 to-blue-500")}>
          <button onClick={() => onSelectFamily(null)} className="text-[10px] text-white/70 hover:text-white mb-2 flex items-center gap-1 cursor-pointer"><ChevronLeft className="h-3.5 w-3.5" /> Retour aux familles</button>
          <div className="flex items-center gap-3">
            <FIcon className="h-7 w-7 text-white" />
            <div>
              <h2 className="text-base font-bold">{familyInfo?.label || selectedFamily}</h2>
              <p className="text-[11px] text-white/80">{familyInfo?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-white/70">
            <span>{familyPlaybooks.length} playbooks</span>
            <span>{familyPlaybooks.filter(p => p.prix === "Gratuit").length} gratuits</span>
            <span>{depts.length} departements</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[120px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full text-xs pl-7 pr-2 py-1.5 rounded-lg border border-gray-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none" />
          </div>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white cursor-pointer">
            <option value="all">Tous les depts</option>
            {depts.map(d => <option key={d} value={d}>{DEPT_LABELS[d] || d}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white cursor-pointer">
            <option value="rating">Note</option>
            <option value="downloads">Populaire</option>
            <option value="nom">A-Z</option>
            <option value="prix">Prix</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {sortedPlaybooks.map(pb => (
            <PlaybookCardV2 key={pb.id} pb={pb} onOpenDetail={onOpenDetail} />
          ))}
        </div>
        {sortedPlaybooks.length === 0 && <p className="text-xs text-gray-400 text-center py-6">Aucun playbook ne correspond a vos filtres</p>}
      </div>
    );
  }

  const topFamilies = Object.entries(CONFERENCE_FAMILIES).map(([key, info]) => {
    const pbs = allConferencePlaybooks.filter(pb => getPlaybookFamily(pb) === key);
    return { key, ...info, count: pbs.length, avgRating: pbs.length > 0 ? (pbs.reduce((s, p) => s + p.rating, 0) / pbs.length).toFixed(1) : "0", gratuit: pbs.filter(p => p.prix === "Gratuit").length };
  }).filter(f => f.count > 0).sort((a, b) => b.count - a.count);

  const featuredPlaybooks = [...allConferencePlaybooks].sort((a, b) => b.rating - a.rating).slice(0, 6);
  const ghostPlaybooks = allConferencePlaybooks.filter(pb => pb.id.startsWith("pb-GHO-"));
  const saisonniersPlaybooks = allConferencePlaybooks.filter(pb => getPlaybookFamily(pb) === "SAIS");

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl px-5 py-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Video className="h-8 w-8 text-white" />
          <div>
            <h2 className="text-lg font-bold">Conference AI</h2>
            <p className="text-[11px] text-white/70">Sessions interactives video, vocal et texte avec vos 12 bots Brain Team</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 text-[10px] text-white/70">
          <span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" /> {conferenceCount} playbooks</span>
          <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {topFamilies.length} familles</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> 12 bots</span>
          <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> 5 modes de travail</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white/90">Discussion</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-400/30 text-white/90">Reflexion</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/30 text-white/90">Conception</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-400/30 text-white/90">Execution</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-teal-400/30 text-white/90">Retroaction</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-500" /> Vedettes Conference AI</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {featuredPlaybooks.map(pb => (
            <PlaybookCardV2 key={pb.id} pb={pb} badge="populaire" onOpenDetail={onOpenDetail} />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><LayoutGrid className="h-3.5 w-3.5 text-indigo-500" /> Explorer par famille</h3>
          <span className="text-[9px] text-gray-400">{topFamilies.length} familles · {conferenceCount} playbooks</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {topFamilies.map(f => {
            const FIcon = f.icon;
            return (
              <div key={f.key} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onSelectFamily(f.key)}>
                <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gradient-to-r text-white", f.gradient)}>
                  <FIcon className="h-4 w-4 text-white shrink-0" />
                  <span className="text-xs font-bold text-white flex-1 truncate">{f.label}</span>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <p className="text-[10px] text-gray-500 leading-snug line-clamp-2">{f.description}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", f.bg, f.text)}>{f.count} playbooks</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> <span className="text-xs font-bold text-gray-800">{f.avgRating}</span></span>
                    <span>{f.gratuit} gratuits</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {ghostPlaybooks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Brain className="h-3.5 w-3.5 text-orange-500" /> Ghost Cognitifs</h3>
            <span className="text-[9px] text-gray-400">{ghostPlaybooks.length} playbooks</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {ghostPlaybooks.map(pb => (
              <PlaybookCardV2 key={pb.id} pb={pb} onOpenDetail={onOpenDetail} />
            ))}
          </div>
        </div>
      )}

      {saisonniersPlaybooks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-lime-500" /> Calendrier Saisonnier</h3>
            <button onClick={() => onSelectFamily("SAIS")} className="text-[9px] text-blue-500 hover:text-blue-700 cursor-pointer font-bold">Voir les {saisonniersPlaybooks.length}</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {saisonniersPlaybooks.slice(0, 6).map(pb => (
              <div key={pb.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-lime-200 transition-all cursor-pointer" onClick={() => onOpenDetail(pb)}>
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                  <Calendar className="h-3.5 w-3.5 text-lime-600 shrink-0" />
                  <span className="text-[11px] font-bold text-gray-900 flex-1 truncate">{pb.nom}</span>
                </div>
                <div className="px-3 py-2">
                  <p className="text-[10px] text-gray-500 line-clamp-1">{pb.description}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[9px] text-gray-400">{pb.duree}</span>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", pb.prix === "Gratuit" ? "bg-emerald-50 text-emerald-700" : "bg-purple-50 text-purple-700")}>{pb.prix === "Gratuit" ? "Inclus" : pb.prix}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2 flex items-center gap-2">
        <Video className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <span className="text-[9px] text-blue-700">Conference AI · {conferenceCount} playbooks · {topFamilies.length} familles · 3 modes communication · 5 modes de travail cognitifs</span>
      </div>
    </div>
  );
}

// ── Vue CATEGORIE (filtree par departement) ──
function PlaybookCategorie({ botCode, selectedDept, onOpenDetail, onBack }: { botCode: string; selectedDept: string; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void; onBack: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNiveau, setFilterNiveau] = useState<string>("all");
  const [filterPrix, setFilterPrix] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("populaires");
  const [viewMode, setViewMode] = useState<"cards" | "list" | "table">("cards");

  const deptColor = DEPT_COLORS[selectedDept] || DEPT_COLORS.CEOB;
  const deptLabel = DEPT_LABELS[selectedDept] || selectedDept;
  const DIcon = DEPT_ICONS[selectedDept] || Building2;

  let filtered = PLAYBOOK_STORE_DATA.filter(pb => {
    if (pb.departement !== selectedDept) return false;
    if (searchTerm && !pb.nom.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.categorie.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterNiveau !== "all" && pb.niveau !== filterNiveau) return false;
    if (filterPrix === "gratuit" && pb.prix !== "Gratuit") return false;
    if (filterPrix === "premium" && pb.prix === "Gratuit") return false;
    if (filterType !== "all" && pb.type !== filterType) return false;
    return true;
  });

  if (sortBy === "populaires") filtered.sort((a, b) => b.downloads - a.downloads);
  else if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);
  else if (sortBy === "alpha") filtered.sort((a, b) => a.nom.localeCompare(b.nom));

  const installedCount = filtered.filter(p => INSTALLED_PLAYBOOKS.includes(p.id)).length;
  const runningCount = RUNNING_PLAYBOOKS.filter(r => { const p = PLAYBOOK_STORE_DATA.find(x => x.id === r.playbookId); return p?.departement === selectedDept; }).length;

  return (
    <div className="space-y-3">
      {/* Header gradient */}
      <div className={cn("bg-gradient-to-r rounded-xl px-4 py-3", deptColor.gradient)}>
        <div className="flex items-center gap-2">
          <DIcon className="h-4 w-4 text-white" />
          <h3 className="text-sm font-bold text-white">Playbooks — {deptLabel}</h3>
        </div>
        <div className="text-[9px] text-white/70 mt-1">{filtered.length} playbooks · {installedCount} installes · {runningCount} en cours</div>
      </div>

      {/* Barre filtres + view toggle — SF standard */}
      <div className={SF.toolbarWrap}>
        <div className={SF.searchWrap}>
          <Search className={SF.searchIcon} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher..." className={SF.searchInput} />
        </div>
        <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)} className={SF.select}>
          <option value="all">Difficulte</option>
          <option value="Quick Win">Quick Win</option>
          <option value="Standard">Standard</option>
          <option value="Avance">Avance</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <select value={filterPrix} onChange={e => setFilterPrix(e.target.value)} className={SF.select}>
          <option value="all">Prix</option>
          <option value="gratuit">Inclus</option>
          <option value="premium">Premium</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className={SF.select}>
          <option value="all">Type</option>
          {Object.entries(PLAYBOOK_TYPES).map(([key, t]) => <option key={key} value={key}>{t.label}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={SF.select}>
          <option value="populaires">Populaires</option>
          <option value="rating">Mieux notes</option>
          <option value="alpha">Alphabetique</option>
        </select>
        <PlaybookViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <span className={SF.itemCount}>{filtered.length} trouves</span>
      </div>

      {/* Contenu selon viewMode */}
      {filtered.length > 0 ? (
        <>
          <PlaybookMultiView playbooks={filtered} viewMode={viewMode} onOpenDetail={onOpenDetail} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-8 w-8 text-gray-200 mb-3" />
          <p className="text-xs text-gray-400 mb-2">Aucun playbook ne correspond a vos criteres</p>
          <button onClick={() => { setSearchTerm(""); setFilterNiveau("all"); setFilterPrix("all"); setFilterType("all"); }} className="text-[9px] text-blue-600 font-bold cursor-pointer">Reinitialiser les filtres</button>
        </div>
      )}
    </div>
  );
}

// ── Vue PAR TYPE (filtree par type de livrable) ──
function PlaybookParType({ selectedType, onOpenDetail, onBack }: { selectedType: string; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void; onBack: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNiveau, setFilterNiveau] = useState<string>("all");
  const [filterPrix, setFilterPrix] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("populaires");
  const [viewMode, setViewMode] = useState<"cards" | "list" | "table">("cards");

  const typeInfo = PLAYBOOK_TYPES[selectedType];
  if (!typeInfo) return null;
  const TIcon = typeInfo.icon;

  let filtered = PLAYBOOK_STORE_DATA.filter(pb => {
    if (pb.type !== selectedType) return false;
    if (searchTerm && !pb.nom.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.categorie.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterNiveau !== "all" && pb.niveau !== filterNiveau) return false;
    if (filterPrix === "gratuit" && pb.prix !== "Gratuit") return false;
    if (filterPrix === "premium" && pb.prix === "Gratuit") return false;
    if (filterDept !== "all" && pb.departement !== filterDept) return false;
    return true;
  });

  if (sortBy === "populaires") filtered.sort((a, b) => b.downloads - a.downloads);
  else if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);
  else if (sortBy === "alpha") filtered.sort((a, b) => a.nom.localeCompare(b.nom));

  const installedCount = filtered.filter(p => INSTALLED_PLAYBOOKS.includes(p.id)).length;

  return (
    <div className="space-y-3">
      {/* Header gradient */}
      <div className={cn("bg-gradient-to-r rounded-xl px-4 py-3", typeInfo.gradient)}>
        <div className="flex items-center gap-2">
          <TIcon className="h-4 w-4 text-white" />
          <h3 className="text-sm font-bold text-white">Playbooks — {typeInfo.label}</h3>
        </div>
        <div className="text-[9px] text-white/70 mt-1">{typeInfo.description} · {filtered.length} playbooks · {installedCount} installes</div>
      </div>

      {/* Barre filtres + view toggle — SF standard */}
      <div className={SF.toolbarWrap}>
        <div className={SF.searchWrap}>
          <Search className={SF.searchIcon} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher..." className={SF.searchInput} />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className={SF.select}>
          <option value="all">Departement</option>
          {Object.entries(DEPT_LABELS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
        </select>
        <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)} className={SF.select}>
          <option value="all">Difficulte</option>
          <option value="Quick Win">Quick Win</option>
          <option value="Standard">Standard</option>
          <option value="Avance">Avance</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <select value={filterPrix} onChange={e => setFilterPrix(e.target.value)} className={SF.select}>
          <option value="all">Prix</option>
          <option value="gratuit">Inclus</option>
          <option value="premium">Premium</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={SF.select}>
          <option value="populaires">Populaires</option>
          <option value="rating">Mieux notes</option>
          <option value="alpha">Alphabetique</option>
        </select>
        <PlaybookViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <span className={SF.itemCount}>{filtered.length} trouves</span>
      </div>

      {/* Contenu selon viewMode */}
      {filtered.length > 0 ? (
        <PlaybookMultiView playbooks={filtered} viewMode={viewMode} onOpenDetail={onOpenDetail} />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-8 w-8 text-gray-200 mb-3" />
          <p className="text-xs text-gray-400 mb-2">Aucun playbook ne correspond a vos criteres</p>
          <button onClick={() => { setSearchTerm(""); setFilterNiveau("all"); setFilterPrix("all"); setFilterDept("all"); }} className="text-[9px] text-blue-600 font-bold cursor-pointer">Reinitialiser les filtres</button>
        </div>
      )}
    </div>
  );
}

// ── Vue COLLECTIONS ──
// ── Composant reutilisable: rendu liste/tableur pour playbooks ──
function PlaybookListView({ playbooks, onOpenDetail }: { playbooks: typeof PLAYBOOK_STORE_DATA; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  return (
    <div className="space-y-0.5">
      {playbooks.map(pb => {
        const niveauStyle = NIVEAU_BADGE[pb.niveau] || NIVEAU_BADGE.Standard;
        const isInstalled = INSTALLED_PLAYBOOKS.includes(pb.id);
        const PbIcon = DEPT_ICONS[pb.departement] || Building2;
        return (
          <div key={pb.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer group" onClick={() => onOpenDetail(pb)}>
            <PbIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-[10px] font-bold text-gray-800 flex-1 truncate">{pb.nom}</span>
            <div className="flex items-center gap-1 shrink-0">
              {pb.bots.slice(0, 2).map((bot, i) => <span key={i} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{bot}</span>)}
            </div>
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0", niveauStyle.bg, niveauStyle.text)}>{pb.niveau}</span>
            {pb.type && PLAYBOOK_TYPES[pb.type] && <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0", PLAYBOOK_TYPES[pb.type].bg, PLAYBOOK_TYPES[pb.type].text)}>{PLAYBOOK_TYPES[pb.type].label}</span>}
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0", pb.prix === "Gratuit" ? "bg-emerald-50 text-emerald-700" : "bg-purple-50 text-purple-700")}>{pb.prix === "Gratuit" ? "Inclus" : pb.prix}</span>
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-bold text-gray-700">{pb.rating}</span>
            </div>
            {isInstalled && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
            <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 shrink-0" />
          </div>
        );
      })}
    </div>
  );
}

function PlaybookTableView({ playbooks, onOpenDetail }: { playbooks: typeof PLAYBOOK_STORE_DATA; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  const [tblSort, setTblSort] = useState<{ field: string; dir: "asc" | "desc" }>({ field: "nom", dir: "asc" });
  const toggleSort = (f: string) => setTblSort(prev => prev.field === f ? { field: f, dir: prev.dir === "asc" ? "desc" : "asc" } : { field: f, dir: "asc" });
  const SortCol = ({ field, w, children }: { field: string; w: string; children: React.ReactNode }) => {
    const active = tblSort.field === field;
    const Icon = active ? (tblSort.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
    return (
      <button onClick={() => toggleSort(field)} className={cn("text-left text-[9px] font-bold uppercase cursor-pointer select-none flex items-center gap-0.5", w, active ? "text-blue-500" : "text-gray-500")}>
        {children}<Icon className={cn("h-3.5 w-3.5", active ? "text-blue-500" : "text-gray-300")} />
      </button>
    );
  };
  const sorted = [...playbooks].sort((a, b) => {
    const dir = tblSort.dir === "asc" ? 1 : -1;
    switch (tblSort.field) {
      case "nom": return dir * a.nom.localeCompare(b.nom);
      case "categorie": return dir * a.categorie.localeCompare(b.categorie);
      case "type": return dir * (a.type || "").localeCompare(b.type || "");
      case "niveau": return dir * a.niveau.localeCompare(b.niveau);
      case "prix": return dir * ((a.prix === "Gratuit" ? 0 : 1) - (b.prix === "Gratuit" ? 0 : 1));
      case "rating": return dir * (a.rating - b.rating);
      case "etapes": return dir * (a.etapes - b.etapes);
      default: return 0;
    }
  });
  return (
    <div className="space-y-0">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-200">
        <SortCol field="nom" w="flex-1">Nom</SortCol>
        <SortCol field="categorie" w="w-[70px] shrink-0">Categorie</SortCol>
        <SortCol field="type" w="w-[65px] shrink-0">Type</SortCol>
        <SortCol field="niveau" w="w-[70px] shrink-0">Niveau</SortCol>
        <SortCol field="prix" w="w-[55px] shrink-0">Prix</SortCol>
        <SortCol field="rating" w="w-[50px] shrink-0">Rating</SortCol>
        <span className="text-[9px] font-bold text-gray-500 uppercase w-[55px] shrink-0">Duree</span>
        <SortCol field="etapes" w="w-[50px] shrink-0">Etapes</SortCol>
      </div>
      {sorted.map(pb => {
        const niveauStyle = NIVEAU_BADGE[pb.niveau] || NIVEAU_BADGE.Standard;
        const PbIcon = DEPT_ICONS[pb.departement] || Building2;
        return (
          <div key={pb.id} className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer group" onClick={() => onOpenDetail(pb)}>
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <PbIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="text-[9px] font-medium text-gray-800 truncate">{pb.nom}</span>
            </div>
            <span className="text-[9px] text-gray-500 w-[70px] shrink-0 truncate">{pb.categorie}</span>
            {pb.type && PLAYBOOK_TYPES[pb.type] ? <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded w-[65px] shrink-0", PLAYBOOK_TYPES[pb.type].bg, PLAYBOOK_TYPES[pb.type].text)}>{PLAYBOOK_TYPES[pb.type].label}</span> : <span className="w-[65px] shrink-0" />}
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded w-[70px] shrink-0", niveauStyle.bg, niveauStyle.text)}>{pb.niveau}</span>
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded w-[55px] shrink-0", pb.prix === "Gratuit" ? "bg-emerald-50 text-emerald-700" : "bg-purple-50 text-purple-700")}>{pb.prix === "Gratuit" ? "Inclus" : pb.prix}</span>
            <span className="text-[9px] text-gray-700 w-[50px] shrink-0 flex items-center gap-0.5"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />{pb.rating}</span>
            <span className="text-[9px] text-gray-400 w-[55px] shrink-0">{pb.duree}</span>
            <span className="text-[9px] text-gray-400 w-[50px] shrink-0">{pb.etapes} etapes</span>
          </div>
        );
      })}
    </div>
  );
}

function PlaybookViewToggle({ viewMode, setViewMode }: { viewMode: "cards" | "list" | "table"; setViewMode: (m: "cards" | "list" | "table") => void }) {
  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
      {([["list", LayoutList], ["cards", LayoutGrid], ["table", Table2]] as ["list" | "cards" | "table", React.ElementType][]).map(([mode, Icon]) => (
        <button key={mode} onClick={() => setViewMode(mode)} className={cn("p-1.5 transition-colors cursor-pointer", viewMode === mode ? "bg-blue-600 text-white" : "bg-white text-gray-400 hover:text-gray-600")}>
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

function PlaybookMultiView({ playbooks, viewMode, onOpenDetail }: { playbooks: typeof PLAYBOOK_STORE_DATA; viewMode: "cards" | "list" | "table"; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  if (playbooks.length === 0) return <p className="text-[9px] text-gray-400 text-center py-8">Aucun playbook a afficher</p>;
  if (viewMode === "list") return <PlaybookListView playbooks={playbooks} onOpenDetail={onOpenDetail} />;
  if (viewMode === "table") return <PlaybookTableView playbooks={playbooks} onOpenDetail={onOpenDetail} />;
  return (
    <div className="grid grid-cols-2 gap-3">
      {playbooks.map(pb => <PlaybookCardV2 key={pb.id} pb={pb} onOpenDetail={onOpenDetail} />)}
    </div>
  );
}

function PlaybookCollectionsView({ selectedCollection, onOpenDetail, onSelectCollection, onBack }: { selectedCollection: string | null; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void; onSelectCollection: (id: string | null) => void; onBack: () => void }) {
  const [viewMode, setViewMode] = useState<"cards" | "list" | "table">("cards");
  if (selectedCollection) {
    const col = STORE_COLLECTIONS_V2.find(c => c.id === selectedCollection);
    if (!col) return null;
    const ColIcon = col.icon;
    const playbooks = col.playbookIds.map(id => PLAYBOOK_STORE_DATA.find(p => p.id === id)).filter(Boolean) as typeof PLAYBOOK_STORE_DATA;
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button onClick={() => onSelectCollection(null)} className="text-[9px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Retour aux collections
          </button>
          <PlaybookViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
        <div className={cn("bg-gradient-to-r rounded-xl px-4 py-3", col.gradient)}>
          <ColIcon className="h-4 w-4 text-white mb-1" />
          <h3 className="text-sm font-bold text-white">{col.label}</h3>
          <p className="text-[9px] text-white/80 mt-1">{col.description}</p>
          <span className="text-[8px] text-white/60 mt-1 block">{playbooks.length} playbooks</span>
        </div>
        <PlaybookMultiView playbooks={playbooks} viewMode={viewMode} onOpenDetail={onOpenDetail} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {STORE_COLLECTIONS_V2.map(col => {
          const ColIcon = col.icon;
          return (
            <Card key={col.id} className="p-0 gap-0 overflow-hidden rounded-xl cursor-pointer hover:shadow-md transition-all" onClick={() => onSelectCollection(col.id)}>
              <div className={cn("bg-gradient-to-r px-3 py-3", col.gradient)}>
                <ColIcon className="h-4 w-4 text-white mb-1" />
                <div className="text-[10px] font-bold text-white">{col.label}</div>
                <div className="text-[8px] text-white/70 mt-0.5 line-clamp-2">{col.description}</div>
                <div className="text-[8px] text-white/60 mt-1">{col.playbookIds.length} playbooks</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Vue MES PLAYBOOKS (installes seulement) ──
function PlaybookMesInstalledView({ botCode, onOpenDetail }: { botCode: string; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list" | "table">("cards");
  const [filterNiveau, setFilterNiveau] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("populaires");
  const installed = PLAYBOOK_STORE_DATA.filter(pb => INSTALLED_PLAYBOOKS.includes(pb.id) && (botCode === "CEOB" || pb.departement === botCode));
  let filtered = installed.filter(pb => {
    if (searchTerm && !pb.nom.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterNiveau !== "all" && pb.niveau !== filterNiveau) return false;
    return true;
  });
  if (sortBy === "populaires") filtered.sort((a, b) => b.downloads - a.downloads);
  else if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);
  else if (sortBy === "alpha") filtered.sort((a, b) => a.nom.localeCompare(b.nom));

  return (
    <div className="space-y-3">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-white" />
          <h3 className="text-sm font-bold text-white">Mes playbooks installes</h3>
        </div>
        <div className="text-[9px] text-white/70 mt-1">{installed.length} playbooks installes · {[...new Set(installed.map(p => p.departement))].length} departements</div>
      </div>

      {/* Barre filtres + view toggle — SF standard */}
      <div className={SF.toolbarWrap}>
        <div className={SF.searchWrap}>
          <Search className={SF.searchIcon} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher..." className={SF.searchInput} />
        </div>
        <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)} className={SF.select}>
          <option value="all">Difficulte</option>
          <option value="Quick Win">Quick Win</option>
          <option value="Standard">Standard</option>
          <option value="Avance">Avance</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={SF.select}>
          <option value="populaires">Populaires</option>
          <option value="rating">Mieux notes</option>
          <option value="alpha">Alphabetique</option>
        </select>
        <PlaybookViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <span className={SF.itemCount}>{filtered.length} trouves</span>
      </div>

      {/* Contenu */}
      {filtered.length > 0 ? (
        <PlaybookMultiView playbooks={filtered} viewMode={viewMode} onOpenDetail={onOpenDetail} />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-8 w-8 text-gray-200 mb-3" />
          <p className="text-xs text-gray-400 mb-2">{installed.length === 0 ? "Aucun playbook installe — explorez le Store" : "Aucun playbook ne correspond a vos criteres"}</p>
          {installed.length > 0 && <button onClick={() => { setSearchTerm(""); setFilterNiveau("all"); }} className="text-[9px] text-blue-600 font-bold cursor-pointer">Reinitialiser les filtres</button>}
        </div>
      )}
    </div>
  );
}

// ── Vue EN COURS (executions actives) ──
function PlaybookEnCours({ onOpenDetail }: { onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  const [viewMode, setViewMode] = useState<"cards" | "list" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState("");
  const runningPbs = RUNNING_PLAYBOOKS.map(r => PLAYBOOK_STORE_DATA.find(p => p.id === r.playbookId)).filter(Boolean) as typeof PLAYBOOK_STORE_DATA;
  const filtered = searchTerm ? runningPbs.filter(pb => pb.nom.toLowerCase().includes(searchTerm.toLowerCase())) : runningPbs;
  const activeCount = RUNNING_PLAYBOOKS.filter(r => r.statut === "actif").length;
  const pauseCount = RUNNING_PLAYBOOKS.length - activeCount;

  return (
    <div className="space-y-3">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-white" />
          <h3 className="text-sm font-bold text-white">Playbooks en cours</h3>
        </div>
        <div className="text-[9px] text-white/70 mt-1">{RUNNING_PLAYBOOKS.length} en cours · {activeCount} actifs · {pauseCount} en pause</div>
      </div>

      {/* Barre filtres + view toggle — SF standard */}
      <div className={SF.toolbarWrap}>
        <div className={SF.searchWrap}>
          <Search className={SF.searchIcon} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher..." className={SF.searchInput} />
        </div>
        <PlaybookViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <span className={SF.itemCount}>{filtered.length} trouves</span>
      </div>

      {/* Contenu */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Activity className="h-8 w-8 text-gray-200 mb-3" />
          <p className="text-xs text-gray-400 mb-1">{RUNNING_PLAYBOOKS.length === 0 ? "Aucun playbook en cours d'execution" : "Aucun resultat"}</p>
          <p className="text-[9px] text-gray-300">Lancez-en un depuis le Store</p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="space-y-3">
          {RUNNING_PLAYBOOKS.filter(r => {
            const pb = PLAYBOOK_STORE_DATA.find(p => p.id === r.playbookId);
            return pb && (!searchTerm || pb.nom.toLowerCase().includes(searchTerm.toLowerCase()));
          }).map(run => {
            const pb = PLAYBOOK_STORE_DATA.find(p => p.id === run.playbookId)!;
            return (
              <Card key={run.playbookId} className="p-0 gap-0 overflow-hidden rounded-xl border-l-4 border-l-emerald-500">
                <div className="px-3 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1", run.statut === "actif" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                        {run.statut === "actif" && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                        {run.statut === "actif" ? "Actif" : "En pause"}
                      </span>
                      <span className="text-xs font-bold text-gray-800 cursor-pointer hover:text-blue-600" onClick={() => onOpenDetail(pb)}>{pb.nom}</span>
                    </div>
                    <span className="text-[9px] font-bold text-gray-500">{run.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${run.progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-gray-500">
                    <span>Etape: <span className="text-gray-700">{run.etapeActuelle}</span></span>
                    <span>Bot actif: <span className="font-bold text-gray-700">{run.botActif}</span></span>
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-gray-400">Temps restant: {run.tempsRestant}</span>
                    <div className="flex items-center gap-1">
                      {pb.bots.map((bot, i) => (
                        <span key={i} className={cn("px-1.5 py-0.5 rounded text-[8px]", bot === run.botActif ? "bg-emerald-100 text-emerald-700 font-bold" : "bg-gray-100 text-gray-400")}>{bot}</span>
                      ))}
                    </div>
                  </div>
                  {run.actionRequise && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span className="text-[9px] text-amber-700 flex-1">{run.actionRequise}</span>
                      <button className="text-[9px] font-bold text-amber-700 bg-amber-200 hover:bg-amber-300 px-2.5 py-1 rounded cursor-pointer">Fournir</button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <button className="flex items-center gap-1 text-[9px] font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg cursor-pointer transition-colors">
                      <Pause className="h-3.5 w-3.5" /> Pause
                    </button>
                    <button className="flex items-center gap-1 text-[9px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg cursor-pointer transition-colors">
                      <Trash2 className="h-3.5 w-3.5" /> Annuler
                    </button>
                    <button onClick={() => onOpenDetail(pb)} className="flex items-center gap-1 text-[9px] font-bold text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg cursor-pointer transition-colors ml-auto">
                      <FileText className="h-3.5 w-3.5" /> Details
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <PlaybookMultiView playbooks={filtered} viewMode={viewMode} onOpenDetail={onOpenDetail} />
      )}
    </div>
  );
}

// ── Vue HISTORIQUE (completes + livrables) ──
function PlaybookHistorique({ onOpenDetail }: { onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  const [viewMode, setViewMode] = useState<"cards" | "list" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState("");
  const completedPbs = COMPLETED_PLAYBOOKS.map(cp => PLAYBOOK_STORE_DATA.find(p => p.id === cp.playbookId)).filter(Boolean) as typeof PLAYBOOK_STORE_DATA;
  const filtered = searchTerm ? completedPbs.filter(pb => pb.nom.toLowerCase().includes(searchTerm.toLowerCase())) : completedPbs;
  const totalLivrables = COMPLETED_PLAYBOOKS.reduce((s, cp) => s + (PLAYBOOK_LIVRABLES[cp.playbookId]?.length || 0), 0);

  return (
    <div className="space-y-3">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-500 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-white" />
          <h3 className="text-sm font-bold text-white">Historique</h3>
        </div>
        <div className="text-[9px] text-white/70 mt-1">{COMPLETED_PLAYBOOKS.length} completes · {totalLivrables} livrables generes</div>
      </div>

      {/* Barre filtres + view toggle — SF standard */}
      <div className={SF.toolbarWrap}>
        <div className={SF.searchWrap}>
          <Search className={SF.searchIcon} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher..." className={SF.searchInput} />
        </div>
        <PlaybookViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <span className={SF.itemCount}>{filtered.length} trouves</span>
      </div>

      {/* Contenu */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="h-8 w-8 text-gray-200 mb-3" />
          <p className="text-xs text-gray-400 mb-1">{COMPLETED_PLAYBOOKS.length === 0 ? "Aucun playbook complete" : "Aucun resultat"}</p>
          <p className="text-[9px] text-gray-300">Vos playbooks termines apparaitront ici avec leurs livrables</p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="space-y-3">
          {COMPLETED_PLAYBOOKS.filter(cp => {
            const pb = PLAYBOOK_STORE_DATA.find(p => p.id === cp.playbookId);
            return pb && (!searchTerm || pb.nom.toLowerCase().includes(searchTerm.toLowerCase()));
          }).map(cp => {
            const pb = PLAYBOOK_STORE_DATA.find(p => p.id === cp.playbookId)!;
            const pilierColor = PILIER_COLORS[cp.pilierImpact] || PILIER_COLORS.Actif;
            const livrables = PLAYBOOK_LIVRABLES[pb.id] || [];
            return (
              <Card key={cp.playbookId} className="p-0 gap-0 overflow-hidden rounded-xl">
                <div className="px-3 py-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => onOpenDetail(pb)}>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-gray-800">{pb.nom}</span>
                      </div>
                      <div className="text-[9px] text-gray-400 mt-0.5 ml-5">Complete le {cp.completeLe}</div>
                    </div>
                    <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0", pilierColor.bg, pilierColor.text)}>Impact: {cp.impact}</span>
                  </div>
                  <div className="flex items-center gap-1 ml-5">
                    {pb.bots.map((bot, i) => (
                      <span key={i} className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{bot}</span>
                    ))}
                  </div>
                  {livrables.length > 0 && (
                    <div className="ml-5 space-y-1">
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Livrables</span>
                      {livrables.map((l, i) => {
                        const LivIcon = l.icon;
                        return (
                          <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1">
                            <LivIcon className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-[9px] text-gray-700 flex-1">{l.nom}</span>
                            <span className="text-[8px] text-gray-400">{l.type}</span>
                            <button className="text-[8px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer">Ouvrir</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex items-center gap-2 ml-5 pt-1">
                    <button className="flex items-center gap-1 text-[9px] font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg cursor-pointer transition-colors">
                      <RotateCcw className="h-3.5 w-3.5" /> Relancer
                    </button>
                    <button className="flex items-center gap-1 text-[9px] font-bold text-amber-500 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg cursor-pointer transition-colors">
                      <Star className="h-3.5 w-3.5" /> Evaluer
                    </button>
                    <button className="flex items-center gap-1 text-[9px] font-bold text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg cursor-pointer transition-colors">
                      <Share2 className="h-3.5 w-3.5" /> Partager
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <PlaybookMultiView playbooks={filtered} viewMode={viewMode} onOpenDetail={onOpenDetail} />
      )}
    </div>
  );
}

// ── Vue PLAYBOOK BUILDER (mock) ──
function PlaybookBuilder() {
  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <Wrench className="h-8 w-8 text-gray-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-gray-800">Playbook Builder</h3>
        <p className="text-[9px] text-gray-500 mt-1 max-w-sm mx-auto">Creez vos propres playbooks et publiez-les dans le Playbook Store.</p>
      </div>

      {/* KPIs mock */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Mes brouillons", value: "0", icon: FileText, color: "text-gray-500" },
          { label: "Publies", value: "0", icon: Upload, color: "text-blue-500" },
          { label: "Revenus", value: "0.00$", icon: DollarSign, color: "text-emerald-500" },
        ].map(kpi => (
          <Card key={kpi.label} className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
            <div className="px-3 py-2.5 text-center">
              <kpi.icon className={cn("h-4 w-4 mx-auto mb-1", kpi.color)} />
              <div className="text-sm font-bold text-gray-800">{kpi.value}</div>
              <div className="text-[8px] text-gray-400">{kpi.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* CTA disabled */}
      <button className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed" disabled>
        <Plus className="h-3.5 w-3.5" /> Creer un nouveau playbook
      </button>

      {/* Comment ca marche */}
      <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
        <div className="px-4 py-3">
          <h4 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-2">Comment ca marche</h4>
          <div className="space-y-2">
            {[
              "Definissez les etapes du workflow",
              "Assignez les bots a chaque etape",
              "Testez avec vos donnees",
              "Publiez dans le Store (85% createur / 15% plateforme)",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[8px] font-bold text-white bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-[9px] text-gray-700">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Marketplace CTA */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl px-4 py-4 text-center space-y-2">
        <Sparkles className="h-5 w-5 text-purple-500 mx-auto" />
        <p className="text-xs font-bold text-gray-800">Creez votre propre playbook et vendez-le sur le Store</p>
        <p className="text-[10px] text-purple-700 font-semibold">85% createur / 15% plateforme</p>
        <p className="text-[9px] text-gray-500">Les meilleurs createurs gagnent 2000-5000$/mois avec leurs playbooks.</p>
        <p className="text-[8px] text-purple-400">Bientot disponible</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// BLUEPRINT PLAYBOOKS — Conteneur principal avec sidebar 8 items
// ══════════════════════════════════════════

export function PlaybookStoreView({ botCode, headerGradient, showHeader = false }: { botCode: string; headerGradient: string; showHeader?: boolean }) {
  const [activeView, setActiveView] = useState<PlaybookStoreView>("decouvrir");
  const [selectedPlaybook, setSelectedPlaybook] = useState<typeof PLAYBOOK_STORE_DATA[0] | null>(null);
  const [expandCategories, setExpandCategories] = useState(false);
  const [expandTypes, setExpandTypes] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedConferenceFamily, setSelectedConferenceFamily] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // Synchroniser quand botCode change — revenir à l'accueil (le contenu s'adapte via PlaybookDecouvrir)
  useEffect(() => {
    setSelectedPlaybook(null);
    setActiveView("decouvrir");
    setSelectedCategorie(null);
    setSelectedType(null);
  }, [botCode]);

  const handleNavigate = (view: PlaybookStoreView, extra?: { dept?: string; collection?: string }) => {
    setSelectedPlaybook(null);
    if (view === "types" && extra?.dept) { setSelectedType(extra.dept); setActiveView("types"); }
    else if (extra?.dept) { setSelectedCategorie(extra.dept); setActiveView("categorie"); }
    else if (extra?.collection) { setSelectedCollection(extra.collection); setActiveView("collections"); }
    else setActiveView(view);
  };

  const handleOpenDetail = (pb: typeof PLAYBOOK_STORE_DATA[0]) => setSelectedPlaybook(pb);
  const handleBack = () => setSelectedPlaybook(null);

  const pbIsNonCEOB = botCode !== "CEOB";
  const pbDeptCount = pbIsNonCEOB ? PLAYBOOK_STORE_DATA.filter(p => p.departement === botCode).length : PLAYBOOK_STORE_DATA.length;
  const SIDEBAR_ITEMS: { id: PlaybookStoreView; label: string; icon: React.ElementType; count?: number; dot?: boolean; separator?: boolean }[] = [
    { id: "decouvrir", label: "Decouvrir", icon: Sparkles, count: pbDeptCount },
    // Poupée russe: non-CEOB = pas d'explorateur départements (on est déjà DANS un département)
    ...(pbIsNonCEOB ? [] : [{ id: "categorie" as PlaybookStoreView, label: "Departements", icon: LayoutGrid }]),
    { id: "types", label: "Types", icon: FolderOpen },
    { id: "conferenceai", label: "Conference AI", icon: Video, count: (pbIsNonCEOB ? PLAYBOOK_STORE_DATA.filter(p => p.departement === botCode && (p.type === "conference" || p.type === "formation" || p.type === "cognitif" || p.id.startsWith("pb-GHO-") || p.id.match(/^pb-[A-Z]+-[A-Z]+-/))) : PLAYBOOK_STORE_DATA.filter(p => p.type === "conference" || p.type === "formation" || p.type === "cognitif" || p.id.startsWith("pb-GHO-") || p.id.match(/^pb-[A-Z]+-[A-Z]+-/))).length },
    { id: "collections", label: "Collections", icon: Bookmark, count: STORE_COLLECTIONS_V2.length },
    { id: "installed", label: "Mes Playbooks", icon: BookOpen, count: INSTALLED_PLAYBOOKS.length, separator: true },
    { id: "encours", label: "En cours", icon: Activity, count: RUNNING_PLAYBOOKS.length, dot: RUNNING_PLAYBOOKS.length > 0 },
    { id: "historique", label: "Historique", icon: Clock, count: COMPLETED_PLAYBOOKS.length },
    { id: "builder", label: "Playbook Builder", icon: Wrench, separator: true },
  ];

  const VIEW_LABELS: Record<PlaybookStoreView, string> = {
    decouvrir: "Decouvrir", categorie: "Departements", types: "Types", collections: "Collections",
    installed: "Mes Playbooks", encours: "En cours", historique: "Historique", builder: "Playbook Builder",
  };

  return (
    <div className="space-y-3">
      {/* Hero — Living Heroes V20 Playbook Store */}
      {showHeader && (
        <LivingHero
          blur1="bg-cyan-100/60" blur2="bg-blue-100/40"
          subtitleColor="text-cyan-600" subtitle="Automatisations"
          title="Des recettes prêtes à lancer."
          description="Chaque playbook est une séquence d'actions que le système exécute pour vous. Choisissez, lancez, c'est fait."
        >
          <div className="relative w-[380px] h-[160px] flex items-center">
            <div className="absolute right-[20px] flex flex-row items-center gap-0 w-[340px]">
              {/* Step 1 */}
              <div className="pb-node w-24 h-24 flex flex-col items-center justify-center anim-p-node-1 relative z-10">
                <div className="w-8 h-8 rounded bg-cyan-50 text-cyan-500 flex items-center justify-center mb-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
                <div className="w-12 h-1 bg-slate-200 rounded-full" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full anim-p-pulse-1" />
              </div>
              {/* Connection Line 1 */}
              <div className="w-16 h-1 bg-slate-200 relative -ml-1 -mr-1 z-0"><div className="absolute left-0 top-0 bottom-0 bg-cyan-400 shadow-[0_0_8px_#22d3ee] anim-p-line-1" /></div>
              {/* Step 2 */}
              <div className="pb-node w-24 h-24 flex flex-col items-center justify-center anim-p-node-2 relative z-10">
                <div className="w-8 h-8 rounded bg-blue-50 text-blue-500 flex items-center justify-center mb-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg></div>
                <div className="w-12 h-1 bg-slate-200 rounded-full" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full anim-p-pulse-2" />
              </div>
              {/* Connection Line 2 */}
              <div className="w-16 h-1 bg-slate-200 relative -ml-1 -mr-1 z-0"><div className="absolute left-0 top-0 bottom-0 bg-blue-400 shadow-[0_0_8px_#3b82f6] anim-p-line-2" /></div>
              {/* Step 3 */}
              <div className="pb-node anim-p-node-3 anim-p-node-3-activate w-24 h-24 flex flex-col items-center justify-center text-white shadow-lg relative z-10" style={{ background: '#3b82f6' }}>
                <div className="w-8 h-8 flex items-center justify-center mb-1 drop-shadow-md"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg></div>
                <div className="w-12 h-1.5 bg-white/50 rounded-full" />
              </div>
            </div>
          </div>
        </LivingHero>
      )}

      {/* Blocs pleine largeur — Top 3 (au-dessus du sidebar) */}
      {activeView === "decouvrir" && !selectedPlaybook && (
        <>
          {/* Top 3 Playbooks de la semaine — adaptatif au département */}
          {(() => {
            // Poupée russe: non-CEOB = top 3 du département par rating, CEOB = featured hardcodés
            const featuredItems = botCode !== "CEOB"
              ? [...PLAYBOOK_STORE_DATA]
                  .filter(p => p.departement === botCode)
                  .sort((a, b) => b.rating - a.rating || b.downloads - a.downloads)
                  .slice(0, 3)
                  .map((pb, i) => ({
                    playbookId: pb.id,
                    editorial: pb.description,
                    rank: i + 1,
                    gradient: DEPT_GRADIENT[botCode] || DEPT_GRADIENT.CEOB,
                    pb,
                  }))
              : FEATURED_PLAYBOOKS.map(f => ({ ...f, pb: PLAYBOOK_STORE_DATA.find(p => p.id === f.playbookId) })).filter(f => f.pb);
            if (featuredItems.length === 0) return null;
            return (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <h3 className="text-xs font-bold text-gray-800">{botCode !== "CEOB" ? `Top 3 — ${DEPT_SHORT_LABEL[botCode] || botCode}` : "Top 3 — Playbooks de la semaine"}</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {featuredItems.map(f => {
                    if (!f.pb) return null;
                    return (
                      <div key={f.playbookId} className={cn("relative bg-gradient-to-r rounded-xl overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow", f.gradient)} onClick={() => handleOpenDetail(f.pb!)}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                        <div className="relative p-4">
                          <div className="flex items-center gap-1.5 mb-2.5">
                            <span className={cn("text-[9px] font-bold w-6 h-6 rounded-full flex items-center justify-center gap-0.5", f.rank === 1 ? "bg-amber-400 text-amber-900" : "bg-white/20 text-white")}>
                              {f.rank === 1 && <Crown className="h-3.5 w-3.5" />}
                              {f.rank !== 1 && f.rank}
                            </span>
                            <span className="text-[8px] font-medium px-2 py-0.5 rounded-full bg-white/15 text-white">{f.pb.niveau}</span>
                            <span className="text-[8px] font-medium px-2 py-0.5 rounded-full bg-white/15 text-white">{f.pb.prix === "Gratuit" ? "Inclus" : f.pb.prix}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white leading-tight">{f.pb.nom}</h4>
                          <p className="text-[9px] text-white/80 mt-1.5 line-clamp-3 leading-relaxed">{f.editorial}</p>
                          <div className="flex items-center gap-1.5 mt-3">
                            <div className="flex items-center gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={cn("h-3.5 w-3.5", s <= Math.round(f.pb!.rating) ? "text-amber-300 fill-amber-300" : "text-white/20")} />
                              ))}
                            </div>
                            <span className="text-[9px] text-white font-bold">{f.pb.rating}/5</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-[8px] text-white/70">
                            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{f.pb.downloads} activations</span>
                            <span>{f.pb.etapes} etapes</span>
                            <span>{f.pb.duree}</span>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button className="flex-1 px-3 py-2 text-[9px] font-bold bg-white text-gray-900 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all flex items-center justify-center gap-1">
                              <Rocket className="h-3.5 w-3.5" /> Decouvrir
                            </button>
                            <button className="flex-1 px-3 py-2 text-[9px] font-bold text-white bg-white/15 hover:bg-white/25 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1">
                              <Eye className="h-3.5 w-3.5" /> Previsualiser
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* Header pleine largeur — masqué si showHeader est actif (évite le dédoublement) */}
      {!showHeader && (
        <div className={cn("bg-gradient-to-r rounded-lg px-4 py-2.5", headerGradient)}>
          <h2 className="text-sm font-bold text-white">Playbook Store{activeView !== "decouvrir" ? ` — ${VIEW_LABELS[activeView]}` : ""}</h2>
        </div>
      )}

    <div className="flex gap-3">
      {/* Sidebar TOC */}
      <div className={SF.sidebarW}>
        {SIDEBAR_ITEMS.map((item, idx) => {
          const isActive = activeView === item.id;
          return (
            <div key={item.id}>
              {item.separator && idx > 0 && <div className={SF.separator} />}
              <button
                onClick={() => {
                  if (item.id === "categorie") { setExpandCategories(!expandCategories); }
                  else if (item.id === "types") { setExpandTypes(!expandTypes); }
                  else { setActiveView(item.id); setSelectedPlaybook(null); }
                }}
                className={cn(
                  "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                  isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <item.icon className={cn("h-3.5 w-3.5", isActive ? "text-blue-500" : "text-gray-400")} />
                  <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-700")}>{item.label}</span>
                  {item.dot && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                  {item.count !== undefined && <span className="text-[9px] text-gray-400">{item.count}</span>}
                  {item.id === "categorie" && <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", expandCategories && "rotate-180")} />}
                  {item.id === "types" && <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", expandTypes && "rotate-180")} />}
                </div>
              </button>
              {/* Expandable categories (departements) — CEOB seulement */}
              {!pbIsNonCEOB && item.id === "categorie" && expandCategories && (
                <div className="ml-3 mt-0.5 space-y-0.5">
                  {Object.entries(DEPT_LABELS).map(([code, label]) => {
                    const isActiveDept = activeView === "categorie" && selectedCategorie === code;
                    return (
                      <button key={code} onClick={() => { setSelectedCategorie(code); setActiveView("categorie"); setSelectedPlaybook(null); }}
                        className={cn("w-full px-2 py-1 rounded text-left text-[9px] cursor-pointer transition-all",
                          isActiveDept ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        )}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
              {/* Expandable types */}
              {item.id === "types" && expandTypes && (
                <div className="ml-3 mt-0.5 space-y-0.5">
                  {Object.entries(PLAYBOOK_TYPES).map(([key, t]) => {
                    const TIcon = t.icon;
                    const isActiveType = activeView === "types" && selectedType === key;
                    const count = PLAYBOOK_STORE_DATA.filter(p => p.type === key).length;
                    return (
                      <button key={key} onClick={() => { setSelectedType(key); setActiveView("types"); setSelectedPlaybook(null); }}
                        className={cn("w-full px-2 py-1 rounded text-left text-[9px] cursor-pointer transition-all flex items-center gap-1",
                          isActiveType ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        )}>
                        <TIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1">{t.label}</span>
                        <span className="text-[8px] text-gray-400">{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0 space-y-2">

        {/* Fiche detaillee INLINE (drill-down) */}
        {selectedPlaybook ? (
          <PlaybookFicheDetailInline pb={selectedPlaybook} onBack={handleBack} />
        ) : (
          <>
            {activeView === "decouvrir" && <PlaybookDecouvrir botCode={botCode} onOpenDetail={handleOpenDetail} onNavigate={handleNavigate} />}
            {activeView === "categorie" && selectedCategorie && <PlaybookCategorie botCode={botCode} selectedDept={selectedCategorie} onOpenDetail={handleOpenDetail} onBack={() => setActiveView("decouvrir")} />}
            {activeView === "categorie" && !selectedCategorie && <PlaybookDecouvrir botCode={botCode} onOpenDetail={handleOpenDetail} onNavigate={handleNavigate} />}
            {activeView === "types" && selectedType && <PlaybookParType selectedType={selectedType} onOpenDetail={handleOpenDetail} onBack={() => setActiveView("decouvrir")} />}
            {activeView === "types" && !selectedType && <PlaybookDecouvrir botCode={botCode} onOpenDetail={handleOpenDetail} onNavigate={handleNavigate} />}
            {activeView === "collections" && <PlaybookCollectionsView selectedCollection={selectedCollection} onOpenDetail={handleOpenDetail} onSelectCollection={setSelectedCollection} onBack={() => setActiveView("decouvrir")} />}
            {activeView === "conferenceai" && <ConferenceAIContent onOpenDetail={handleOpenDetail} onSelectFamily={setSelectedConferenceFamily} selectedFamily={selectedConferenceFamily} />}
            {activeView === "installed" && <PlaybookMesInstalledView botCode={botCode} onOpenDetail={handleOpenDetail} />}
            {activeView === "encours" && <PlaybookEnCours onOpenDetail={handleOpenDetail} />}
            {activeView === "historique" && <PlaybookHistorique onOpenDetail={handleOpenDetail} />}
            {activeView === "builder" && <PlaybookBuilder />}
          </>
        )}
      </div>
    </div>
    </div>
  );
}

// ══════════════════════════════════════════
// CONFERENCE AI — Section DEDIEE (tab departement)
// Centre d'utilisation — lancer et planifier des conferences (PAS un store)
// Donnees = filtre sur PLAYBOOK_STORE_DATA (pas un silo)
// ══════════════════════════════════════════

const CONF_TOOLS: { key: string; label: string; icon: React.ElementType; description: string }[] = [
  { key: "transcription", label: "Transcription live", icon: MessageSquare, description: "Sous-titres temps reel" },
  { key: "enregistrement", label: "Enregistrement", icon: Video, description: "Timestamps automatiques" },
  { key: "sondages", label: "Sondages", icon: BarChart3, description: "Resultats en direct" },
  { key: "breakout", label: "Sous-groupes", icon: Users, description: "Exercices paralleles" },
  { key: "tableau_blanc", label: "Tableau blanc", icon: PenLine, description: "Canvas collaboratif" },
  { key: "presentateur", label: "Mode presentateur", icon: Eye, description: "Plein ecran" },
  { key: "chronometre", label: "Chronometre", icon: Clock, description: "Timer visible" },
  { key: "queue_parole", label: "Tour de parole", icon: ListChecks, description: "Gere par le bot" },
  { key: "reactions", label: "Reactions", icon: Heart, description: "Emoji temps reel" },
  { key: "annotation", label: "Annotation", icon: FileText, description: "Surligner documents" },
];

const CONF_CAMERA_MODES = [
  { key: "work", label: "Travail", description: "Vignettes en haut, DocForge maximise" },
  { key: "discussion", label: "Discussion", description: "Grille plein ecran, transcription minimale" },
];

const CONF_WORK_PHASES = [
  { key: "discussion", color: "blue", label: "Discussion libre" },
  { key: "reflexion", color: "red", label: "Ideation, brainstorm" },
  { key: "conception", color: "yellow", label: "Structuration, blueprint" },
  { key: "execution", color: "green", label: "Actions COMMAND" },
  { key: "retroaction", color: "emerald", label: "Bilan, VITAA recalcule" },
];

const MOCK_RECENT_SESSIONS = [
  { id: "rs-1", pbId: "pb-CEOB-VENT-001", date: "2026-04-07", duree: "47min", participants: 3, livrables: 2 },
  { id: "rs-2", pbId: "pb-CFOB-REC-001", date: "2026-04-05", duree: "1h12", participants: 5, livrables: 4 },
  { id: "rs-3", pbId: "pb-CMOB-POD-001", date: "2026-04-03", duree: "35min", participants: 2, livrables: 1 },
  { id: "rs-4", pbId: "pb-CEOB-EXP-001", date: "2026-04-01", duree: "12min", participants: 1, livrables: 1 },
  { id: "rs-5", pbId: "pb-CSOB-CREA-001", date: "2026-03-28", duree: "1h05", participants: 4, livrables: 3 },
];

const MOCK_PLANNED_SESSIONS: { id: string; pbId: string; date: string; heure: string; participants: string[] }[] = [];

type ConfAIView = "accueil" | "recentes" | "planifiees" | "famille" | "departement" | "tous";

export function ConferenceAIView({ headerGradient, onNavigateToStore, onLaunch, botCode }: {
  headerGradient: string;
  onNavigateToStore?: () => void;
  onLaunch?: (type: string, title: string) => void;
  botCode?: string;
}) {
  const [activeView, setActiveView] = useState<ConfAIView>("accueil");
  const [selectedPlaybook, setSelectedPlaybook] = useState<typeof PLAYBOOK_STORE_DATA[0] | null>(null);
  const [expandFamilies, setExpandFamilies] = useState(false);
  const [expandDepts, setExpandDepts] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  // Synchroniser quand botCode change — revenir à l'accueil (le contenu s'adapte au département)
  useEffect(() => {
    setSelectedPlaybook(null);
    setActiveView("accueil");
    setSelectedFamily(null);
    setSelectedDept(botCode && botCode !== "CEOB" ? botCode : null);
  }, [botCode]);

  // Filtre les playbooks conference depuis le MEME PLAYBOOK_STORE_DATA
  // Poupée russe: non-CEOB = priorise les conférences du département
  const allConfRaw = PLAYBOOK_STORE_DATA.filter(pb => {
    const family = getPlaybookFamily(pb);
    return (family !== "" && CONFERENCE_FAMILIES[family] !== undefined) || pb.id.startsWith("pb-GHO-") || pb.type === "conference" || pb.type === "formation" || pb.type === "cognitif";
  });
  const allConf = botCode && botCode !== "CEOB"
    ? [...allConfRaw.filter(pb => pb.departement === botCode), ...allConfRaw.filter(pb => pb.departement !== botCode)]
    : allConfRaw;

  const familyEntries = Object.entries(CONFERENCE_FAMILIES).map(([key, info]) => {
    const count = allConf.filter(pb => getPlaybookFamily(pb) === key).length;
    return { key, ...info, count };
  }).filter(f => f.count > 0);

  const deptEntries = Object.entries(DEPT_LABELS).filter(([code]) => code !== "ORBIT9").map(([code, label]) => {
    const count = allConf.filter(pb => pb.departement === code).length;
    return { code, label, count };
  }).filter(d => d.count > 0);

  const handleOpenDetail = (pb: typeof PLAYBOOK_STORE_DATA[0]) => setSelectedPlaybook(pb);
  const handleBack = () => setSelectedPlaybook(null);

  const handleNavigate = (view: ConfAIView, extra?: { family?: string; dept?: string }) => {
    setSelectedPlaybook(null);
    if (view === "famille" && extra?.family) { setSelectedFamily(extra.family); setActiveView("famille"); }
    else if (view === "departement" && extra?.dept) { setSelectedDept(extra.dept); setActiveView("departement"); }
    else setActiveView(view);
  };

  const isNonCEOB = botCode && botCode !== "CEOB";
  const deptConfCount = isNonCEOB ? allConfRaw.filter(pb => pb.departement === botCode).length : allConf.length;
  type SidebarItem = { id: ConfAIView | "store"; label: string; icon: React.ElementType; count?: number; separator?: boolean; expandable?: "families" | "depts"; external?: boolean };
  const SIDEBAR_ITEMS: SidebarItem[] = [
    { id: "accueil", label: "Accueil", icon: Sparkles, count: deptConfCount },
    { id: "recentes", label: "Recentes", icon: Clock },
    { id: "planifiees", label: "Planifiees", icon: Calendar },
    { id: "famille", label: "Categories", icon: FolderOpen, separator: true, expandable: "families" },
    // Poupée russe: non-CEOB = pas d'explorateur départements (on est déjà DANS un département)
    ...(isNonCEOB ? [] : [{ id: "departement" as ConfAIView | "store", label: "Departements", icon: Building2, expandable: "depts" as const }]),
    { id: "store", label: "Playbook Store", icon: ShoppingBag, separator: true, external: true },
  ];

  return (
    <div className="space-y-3">
      {/* Hero — Living Heroes V20 Conference AI */}
      <LivingHero
        blur1="bg-fuchsia-100/60" blur2="bg-violet-100/50"
        subtitleColor="text-fuchsia-600" subtitle="Réunions intelligentes"
        title="Ici, l'organique fusionne avec l'artificielle."
        description="Mettez vos experts humains et AI face à face. Ce qui prenait des semaines se règle en une session."
      >
        <div className="relative w-[360px] h-[140px] flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full opacity-[0.15] text-violet-800" viewBox="0 0 360 140"><path d="M 20 70 L 60 40 L 180 40 L 220 70 L 180 100 L 60 100 Z" fill="none" stroke="currentColor" strokeWidth="1"/><path d="M 60 40 L 60 100 M 180 40 L 180 100 M 20 70 L 220 70" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2"/><circle cx="120" cy="70" r="50" fill="none" stroke="currentColor" strokeWidth="0.5"/></svg>
          {/* Nodes */}
          <div className="absolute left-[40px] top-[50px] w-12 h-12 bg-white/80 border-2 border-fuchsia-200 rounded-full flex items-center justify-center z-10"><div className="w-2 h-2 bg-fuchsia-500 rounded-full" /></div>
          <div className="absolute right-[100px] top-[50px] w-12 h-12 bg-white/80 border-2 border-violet-200 rounded-full flex items-center justify-center z-10"><div className="w-2 h-2 bg-violet-500 rounded-full" /></div>
          <div className="absolute left-[120px] top-[10px] w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center z-10"><div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /></div>
          <div className="absolute left-[120px] bottom-[10px] w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center z-10"><div className="w-1.5 h-1.5 bg-pink-400 rounded-full" /></div>
          {/* Packets */}
          <div className="absolute top-[55px] left-[55px] w-2.5 h-2.5 bg-fuchsia-500 rounded-full text-fuchsia-500 anim-packet-1" />
          <div className="absolute top-[55px] left-[55px] w-2.5 h-2.5 bg-violet-500 rounded-full text-violet-500 anim-packet-2" />
          <div className="absolute top-[55px] left-[55px] w-2.5 h-2.5 bg-indigo-500 rounded-full text-indigo-500 anim-packet-3" />
          {/* Hub */}
          <div className="glass-intense absolute top-[40px] left-[100px] w-[80px] h-16 rounded-2xl flex items-center justify-center gap-1 z-0 shadow-lg">
            <div className="w-1.5 bg-fuchsia-400 rounded-full" style={{height:'30%', animation:'wave-pulse 2s ease-in-out infinite 0.1s'}} />
            <div className="w-1.5 bg-violet-500 rounded-full" style={{height:'60%', animation:'wave-pulse 2.5s ease-in-out infinite 0.5s'}} />
            <div className="w-1.5 bg-indigo-400 rounded-full" style={{height:'90%', animation:'wave-pulse 1.8s ease-in-out infinite 0.2s'}} />
            <div className="w-1.5 bg-fuchsia-500 rounded-full" style={{height:'50%', animation:'wave-pulse 2.2s ease-in-out infinite 0.7s'}} />
            <div className="w-1.5 bg-pink-400 rounded-full" style={{height:'40%', animation:'wave-pulse 2.8s ease-in-out infinite 0.4s'}} />
          </div>
        </div>
      </LivingHero>

      {/* Top 3 Conferences — adaptatif au département (même pattern que Playbook Store) */}
      {activeView === "accueil" && !selectedPlaybook && (() => {
        const confPool = isNonCEOB
          ? allConfRaw.filter(pb => pb.departement === botCode)
          : allConfRaw;
        const top3 = [...confPool]
          .sort((a, b) => b.rating - a.rating || b.downloads - a.downloads)
          .slice(0, 3)
          .map((pb, i) => ({
            playbookId: pb.id,
            editorial: pb.description,
            rank: i + 1,
            gradient: isNonCEOB ? (DEPT_GRADIENT[botCode!] || DEPT_GRADIENT.CEOB) : "from-fuchsia-600 to-violet-600",
            pb,
          }));
        if (top3.length === 0) return null;
        return (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <h3 className="text-xs font-bold text-gray-800">{isNonCEOB ? `Top 3 Conferences — ${DEPT_SHORT_LABEL[botCode!] || botCode}` : "Top 3 — Conferences les plus utiles"}</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {top3.map(f => (
                <div key={f.playbookId} className={cn("relative bg-gradient-to-r rounded-xl overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow", f.gradient)} onClick={() => handleOpenDetail(f.pb)}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <div className="relative p-4">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className={cn("text-[9px] font-bold w-6 h-6 rounded-full flex items-center justify-center gap-0.5", f.rank === 1 ? "bg-amber-400 text-amber-900" : "bg-white/20 text-white")}>
                        {f.rank === 1 && <Crown className="h-3.5 w-3.5" />}
                        {f.rank !== 1 && f.rank}
                      </span>
                      <span className="text-[8px] font-medium px-2 py-0.5 rounded-full bg-white/15 text-white">{f.pb.niveau}</span>
                      <span className="text-[8px] font-medium px-2 py-0.5 rounded-full bg-white/15 text-white">{f.pb.prix === "Gratuit" ? "Inclus" : f.pb.prix}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-tight">{f.pb.nom}</h4>
                    <p className="text-[9px] text-white/80 mt-1.5 line-clamp-3 leading-relaxed">{f.editorial}</p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={cn("h-3.5 w-3.5", s <= Math.round(f.pb.rating) ? "text-amber-300 fill-amber-300" : "text-white/20")} />
                        ))}
                      </div>
                      <span className="text-[9px] text-white font-bold">{f.pb.rating}/5</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[8px] text-white/70">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{f.pb.downloads} activations</span>
                      <span>{f.pb.etapes} etapes</span>
                      <span>{f.pb.duree}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 px-3 py-2 text-[9px] font-bold bg-white text-gray-900 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all flex items-center justify-center gap-1">
                        <Rocket className="h-3.5 w-3.5" /> Decouvrir
                      </button>
                      <button className="flex-1 px-3 py-2 text-[9px] font-bold text-white bg-white/15 hover:bg-white/25 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> Previsualiser
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

    <div className="flex gap-3">
      {/* Sidebar TOC */}
      <div className={SF.sidebarW}>
        {SIDEBAR_ITEMS.map((item, idx) => {
          const isActive = activeView === item.id && !item.expandable && !item.external;
          return (
            <div key={item.id}>
              {item.separator && idx > 0 && <div className={SF.separator} />}
              <button
                onClick={() => {
                  if (item.external && onNavigateToStore) { onNavigateToStore(); return; }
                  if (item.expandable === "families") { setExpandFamilies(!expandFamilies); }
                  else if (item.expandable === "depts") { setExpandDepts(!expandDepts); }
                  else if (item.id !== "store") { setActiveView(item.id as ConfAIView); setSelectedPlaybook(null); }
                }}
                className={cn(
                  "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                  isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <item.icon className={cn("h-3.5 w-3.5", isActive ? "text-blue-500" : item.external ? "text-gray-300" : "text-gray-400")} />
                  <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActive ? "text-blue-700" : item.external ? "text-gray-400" : "text-gray-700")}>{item.label}</span>
                  {item.count !== undefined && <span className="text-[9px] text-gray-400">{item.count}</span>}
                  {item.external && <ExternalLink className="h-3.5 w-3.5 text-gray-300" />}
                  {item.expandable === "families" && <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", expandFamilies && "rotate-180")} />}
                  {item.expandable === "depts" && <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", expandDepts && "rotate-180")} />}
                </div>
              </button>
              {/* Expandable familles */}
              {item.expandable === "families" && expandFamilies && (
                <div className="ml-3 mt-0.5 space-y-0.5">
                  {familyEntries.map(f => {
                    const FIcon = f.icon;
                    const isActiveF = activeView === "famille" && selectedFamily === f.key;
                    return (
                      <button key={f.key} onClick={() => { setSelectedFamily(f.key); setActiveView("famille"); setSelectedPlaybook(null); }}
                        className={cn("w-full px-2 py-1 rounded text-left text-[9px] cursor-pointer transition-all flex items-center gap-1",
                          isActiveF ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        )}>
                        <FIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1">{f.label}</span>
                        <span className="text-[8px] text-gray-400">{f.count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {/* Expandable departements */}
              {item.expandable === "depts" && expandDepts && (
                <div className="ml-3 mt-0.5 space-y-0.5">
                  {deptEntries.map(d => {
                    const isActiveD = activeView === "departement" && selectedDept === d.code;
                    return (
                      <button key={d.code} onClick={() => { setSelectedDept(d.code); setActiveView("departement"); setSelectedPlaybook(null); }}
                        className={cn("w-full px-2 py-1 rounded text-left text-[9px] cursor-pointer transition-all",
                          isActiveD ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        )}>
                        {d.label} <span className="text-[8px] text-gray-400 ml-1">{d.count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Fiche detaillee INLINE (drill-down) */}
        {selectedPlaybook ? (
          <ConfAIFicheDetail pb={selectedPlaybook} onBack={handleBack} onLaunch={onLaunch} allConf={allConf} />
        ) : (
          <>
            {activeView === "accueil" && <ConfAIAccueil playbooks={allConf} onOpenDetail={handleOpenDetail} onNavigate={handleNavigate} onLaunch={onLaunch} familyEntries={familyEntries} deptEntries={deptEntries} botCode={botCode} />}
            {activeView === "recentes" && <ConfAIRecentes allConf={allConf} onOpenDetail={handleOpenDetail} onLaunch={onLaunch} onBack={() => setActiveView("accueil")} />}
            {activeView === "planifiees" && <ConfAIPlanifiees onBack={() => setActiveView("accueil")} />}
            {activeView === "famille" && selectedFamily && <ConfAIFiltered playbooks={allConf.filter(pb => getPlaybookFamily(pb) === selectedFamily)} title={CONFERENCE_FAMILIES[selectedFamily]?.label || selectedFamily} icon={CONFERENCE_FAMILIES[selectedFamily]?.icon || Video} onOpenDetail={handleOpenDetail} onLaunch={onLaunch} onBack={() => setActiveView("accueil")} />}
            {activeView === "famille" && !selectedFamily && <ConfAIAccueil playbooks={allConf} onOpenDetail={handleOpenDetail} onNavigate={handleNavigate} onLaunch={onLaunch} familyEntries={familyEntries} deptEntries={deptEntries} botCode={botCode} />}
            {activeView === "departement" && selectedDept && <ConfAIFiltered playbooks={allConf.filter(pb => pb.departement === selectedDept)} title={DEPT_LABELS[selectedDept] || selectedDept} icon={DEPT_ICONS[selectedDept] || Building2} onOpenDetail={handleOpenDetail} onLaunch={onLaunch} onBack={() => setActiveView("accueil")} />}
            {activeView === "departement" && !selectedDept && <ConfAIAccueil playbooks={allConf} onOpenDetail={handleOpenDetail} onNavigate={handleNavigate} onLaunch={onLaunch} familyEntries={familyEntries} deptEntries={deptEntries} botCode={botCode} />}
            {activeView === "tous" && <ConfAIFiltered playbooks={allConf} title="Toutes les conferences" icon={Video} onOpenDetail={handleOpenDetail} onLaunch={onLaunch} onBack={() => setActiveView("accueil")} />}
          </>
        )}
      </div>
    </div>
    </div>
  );
}

/* ConfAIAccueil — Centre d'utilisation (pas un store) */
function ConfAIAccueil({ playbooks, onOpenDetail, onNavigate, onLaunch, familyEntries, deptEntries, botCode }: {
  playbooks: typeof PLAYBOOK_STORE_DATA;
  onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void;
  onNavigate: (view: ConfAIView, extra?: { family?: string; dept?: string }) => void;
  onLaunch?: (type: string, title: string) => void;
  familyEntries: { key: string; label: string; icon: React.ElementType; description: string; gradient: string; bg: string; text: string; count: number }[];
  deptEntries: { code: string; label: string; count: number }[];
  botCode?: string;
}) {
  const isNonCEOB = botCode && botCode !== "CEOB";
  // Poupée russe: non-CEOB = priorise les conférences du département
  const deptPlaybooks = isNonCEOB ? playbooks.filter(pb => pb.departement === botCode) : playbooks;
  const topUsed = [...deptPlaybooks].sort((a, b) => b.downloads - a.downloads).slice(0, 6);
  const express = deptPlaybooks.filter(pb => {
    const family = getPlaybookFamily(pb);
    return family === "EXP" || pb.duree.includes("5") || pb.duree.includes("10") || pb.duree.includes("15");
  }).slice(0, 6);
  // Familles filtrées par département pour non-CEOB
  const deptFamilyEntries = isNonCEOB
    ? familyEntries.map(f => ({ ...f, count: deptPlaybooks.filter(pb => getPlaybookFamily(pb) === f.key).length })).filter(f => f.count > 0)
    : familyEntries;

  return (
    <div className="space-y-4">
      {/* Section 1 — Les plus utilisees */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-500" /> {isNonCEOB ? `Conferences ${DEPT_SHORT_LABEL[botCode!] || botCode}` : "Les plus utilisees"}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {topUsed.map(pb => {
            const DeptIcon = DEPT_ICONS[pb.departement] || Target;
            return (
              <div key={pb.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onOpenDetail(pb)}>
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                  <DeptIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                  <span className="text-sm font-bold text-gray-900 flex-1 truncate">{pb.nom}</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 shrink-0">Inclus</span>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{pb.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {pb.bots.slice(0, 3).map((bot, i) => (
                        <span key={i} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">{bot}</span>
                      ))}
                      {pb.bots.length > 3 && <span className="text-[10px] text-gray-400">+{pb.bots.length - 3}</span>}
                    </div>
                    <button onClick={e => { e.stopPropagation(); onLaunch?.(pb.type, pb.nom); }} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold cursor-pointer transition-colors">
                      <Play className="h-3.5 w-3.5" /> Lancer
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-gray-500">{pb.duree}</span>
                    <span className="text-[10px] text-gray-500">{pb.etapes} etapes</span>
                    <span className="text-[10px] text-gray-400">({pb.downloads} utilisations)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2 — Lancement rapide (express) */}
      {express.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-orange-500" /> Lancement rapide</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {express.map(pb => {
              const DeptIcon = DEPT_ICONS[pb.departement] || Target;
              return (
                <div key={pb.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onOpenDetail(pb)}>
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-[#00B4D8]/10">
                    <DeptIcon className="h-3.5 w-3.5 text-gray-900 stroke-[2.5]" />
                    <span className="text-xs font-bold text-gray-900 flex-1 truncate">{pb.nom}</span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">{pb.duree}</span>
                    <button onClick={e => { e.stopPropagation(); onLaunch?.(pb.type, pb.nom); }} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold cursor-pointer transition-colors">
                      <Play className="h-3.5 w-3.5" /> Lancer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 3 — Explorer par categorie */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><LayoutGrid className="h-3.5 w-3.5 text-gray-500" /> {isNonCEOB ? `Categories ${DEPT_SHORT_LABEL[botCode!] || botCode}` : "Explorer par categorie"}</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {deptFamilyEntries.map(f => {
            const FIcon = f.icon;
            return (
              <div key={f.key} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onNavigate("famille", { family: f.key })}>
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                  <FIcon className="h-4 w-4 text-gray-900 stroke-[2.5] shrink-0" />
                  <span className="text-sm font-bold text-gray-900">{f.label}</span>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  <p className="text-[10px] text-gray-500 leading-snug line-clamp-2">{f.description}</p>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", f.bg, f.text)}>{f.count} conferences</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4 — Explorer par departement (CEOB seulement — poupée russe) */}
      {!isNonCEOB && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-gray-500" /> Explorer par departement</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {deptEntries.map(d => {
              const DIcon = DEPT_ICONS[d.code] || Building2;
              const avatarSrc = BOT_AVATAR[d.code];
              const botName = BOT_NAME[d.code] || d.code;
              return (
                <div key={d.code} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onNavigate("departement", { dept: d.code })}>
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt={botName} className="h-7 w-7 rounded-full ring-2 ring-white/80 object-cover shrink-0" />
                    ) : (
                      <DIcon className="h-5 w-5 text-gray-900 stroke-[2.5] shrink-0" />
                    )}
                    <span className="text-sm font-bold text-gray-900">{d.label}</span>
                  </div>
                  <div className="px-4 py-3 space-y-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">{d.count} conferences</span>
                    <span className="text-[10px] text-gray-500 ml-1.5">pour {botName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bandeau bottom */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2 flex items-center gap-2">
        <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <span className="text-[9px] text-blue-700">Conference AI · {isNonCEOB ? `${deptPlaybooks.length} conferences ${DEPT_SHORT_LABEL[botCode!] || botCode}` : `${playbooks.length} conferences incluses`} · {deptFamilyEntries.length} categories · 10 outils interactifs</span>
      </div>
    </div>
  );
}

/* ConfAIRecentes — Dernieres sessions lancees */
function ConfAIRecentes({ allConf, onOpenDetail, onLaunch, onBack }: {
  allConf: typeof PLAYBOOK_STORE_DATA;
  onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void;
  onLaunch?: (type: string, title: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-[10px] text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer"><ChevronLeft className="h-3.5 w-3.5" /> Retour</button>
      <div className="flex items-center gap-2 mb-1">
        <Clock className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-bold text-gray-800">Sessions recentes</h3>
      </div>
      {MOCK_RECENT_SESSIONS.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-6">Aucune session recente</p>
      ) : (
        <div className="space-y-2">
          {MOCK_RECENT_SESSIONS.map(session => {
            const pb = allConf.find(p => p.id === session.pbId);
            const name = pb?.nom || session.pbId;
            return (
              <div key={session.id} className="rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-800 block truncate">{name}</span>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                    <span>{session.date}</span>
                    <span>{session.duree}</span>
                    <span>{session.participants} participants</span>
                    <span>{session.livrables} livrables</span>
                  </div>
                </div>
                <button onClick={() => { if (pb) onOpenDetail(pb); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 text-[10px] font-bold cursor-pointer transition-colors">
                  <Eye className="h-3.5 w-3.5" /> Voir
                </button>
                <button onClick={() => { if (pb) onLaunch?.(pb.type, pb.nom); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold cursor-pointer transition-colors">
                  <RotateCcw className="h-3.5 w-3.5" /> Relancer
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ConfAIPlanifiees — Conferences planifiees a venir */
function ConfAIPlanifiees({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-[10px] text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer"><ChevronLeft className="h-3.5 w-3.5" /> Retour</button>
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-bold text-gray-800">Conferences planifiees</h3>
      </div>
      {MOCK_PLANNED_SESSIONS.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-400">Aucune conference planifiee</p>
          <p className="text-[10px] text-gray-400 mt-1">Ouvrez une conference et cliquez "Planifier" pour programmer une session</p>
        </div>
      ) : (
        <div className="space-y-2">
          {MOCK_PLANNED_SESSIONS.map(session => (
            <div key={session.id} className="rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-gray-800 block truncate">{session.pbId}</span>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                  <span>{session.date} a {session.heure}</span>
                  <span>{session.participants.length} invites</span>
                </div>
              </div>
              <button className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer">Modifier</button>
              <button className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer">Annuler</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ConfAIFicheDetail — Fiche detail orientee UTILISATION (pas store) */
function ConfAIFicheDetail({ pb, onBack, onLaunch, allConf }: {
  pb: typeof PLAYBOOK_STORE_DATA[0];
  onBack: () => void;
  onLaunch?: (type: string, title: string) => void;
  allConf: typeof PLAYBOOK_STORE_DATA;
}) {
  const [planDate, setPlanDate] = useState("");
  const [planHeure, setPlanHeure] = useState("");
  const [planParticipants, setPlanParticipants] = useState("");
  const [planMessage, setPlanMessage] = useState("");

  const deptColor = DEPT_COLORS[pb.departement] || DEPT_COLORS.CEOB;
  const DeptIcon = DEPT_ICONS[pb.departement] || Building2;
  const botNameToCode = Object.fromEntries(Object.entries(BOT_DISPLAY).map(([code, d]) => [d.name, code]));
  const workflows = PLAYBOOK_WORKFLOWS[pb.id] || Array.from({ length: pb.etapes }, (_, i) => ({
    num: i + 1, label: i === 0 ? "Collecte des donnees et parametres" : i === pb.etapes - 1 ? "Generation du livrable final" : `Etape ${i + 1} — Traitement automatise`, bot: pb.bots[i % pb.bots.length], duree: "~2 min",
  }));
  const livrables = PLAYBOOK_LIVRABLES[pb.id] || [];
  const similarDept = allConf.filter(p => p.departement === pb.departement && p.id !== pb.id).slice(0, 3);
  const recentForThis = MOCK_RECENT_SESSIONS.filter(s => s.pbId === pb.id).slice(0, 3);

  return (
    <div className="space-y-3">
      {/* Back button */}
      <button onClick={onBack} className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
        <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Retour
      </button>

      {/* Section 1 — Hero + Details side by side */}
      <div className="grid grid-cols-5 gap-3">
        {/* Hero (3/5) */}
        <div className={cn("col-span-3 relative bg-gradient-to-r rounded-xl overflow-hidden shadow-sm", deptColor.gradient)}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative p-4 space-y-3">
            <h3 className="text-lg font-bold text-white leading-tight flex items-center gap-2">
              <DeptIcon className="h-5 w-5 text-white shrink-0" />
              {pb.nom}
            </h3>
            <p className="text-xs text-white/80 leading-relaxed">{PLAYBOOK_LONG_DESC[pb.id] || pb.description}</p>
            <div className="flex items-center gap-3 text-[10px] text-white/70">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{pb.duree}</span>
              <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />{pb.etapes} etapes</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />2-8 participants</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={() => onLaunch?.(pb.type, pb.nom)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-900 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all">
                <Rocket className="h-3.5 w-3.5" /> Lancer maintenant
              </button>
              <button onClick={() => { const el = document.getElementById("conf-plan-section"); el?.scrollIntoView({ behavior: "smooth" }); }} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 rounded-lg cursor-pointer transition-colors">
                <Calendar className="h-3.5 w-3.5" /> Planifier
              </button>
            </div>
          </div>
        </div>

        {/* Details (2/5) */}
        <div className="col-span-2 rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Settings className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Details</span>
          </div>
          <div className="px-4 py-3 flex-1 flex flex-col">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Departement</span>
                <span className="text-xs font-bold text-gray-700">{DEPT_LABELS[pb.departement] || pb.departement}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Bot principal</span>
                <span className="text-xs font-bold text-gray-700">{pb.bots[0]}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Mode camera</span>
                <span className="text-xs font-bold text-gray-700">Travail</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Phase</span>
                <span className="text-xs font-bold text-gray-700">Discussion</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Duree</span>
                <span className="text-xs font-bold text-gray-700">{pb.duree}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 — Preparation de la conference (INLINE, pas de modal) */}
      <div id="conf-plan-section" className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Calendar className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Preparer la conference</span>
        </div>
        <div className="px-4 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Date</label>
              <input type="date" value={planDate} onChange={e => setPlanDate(e.target.value)} className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Heure</label>
              <input type="time" value={planHeure} onChange={e => setPlanHeure(e.target.value)} className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Participants (emails)</label>
            <textarea value={planParticipants} onChange={e => setPlanParticipants(e.target.value)} placeholder="carl@usinebleue.ai, collegue@entreprise.com" rows={2} className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none resize-none" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Message personnalise (optionnel)</label>
            <input type="text" value={planMessage} onChange={e => setPlanMessage(e.target.value)} placeholder="Contexte ou objectif de la session..." className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => onLaunch?.(pb.type, pb.nom)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors">
              <Rocket className="h-3.5 w-3.5" /> Lancer maintenant
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors">
              <Calendar className="h-3.5 w-3.5" /> Planifier pour plus tard
            </button>
          </div>
        </div>
      </div>

      {/* Section 3 — Outils disponibles (features de conference) */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Settings className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Outils disponibles</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 ml-auto">{CONF_TOOLS.length} outils</span>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-2">
          {CONF_TOOLS.map(tool => {
            const ToolIcon = tool.icon;
            return (
              <div key={tool.key} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                <ToolIcon className="h-4 w-4 text-gray-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-800 block">{tool.label}</span>
                  <span className="text-[10px] text-gray-500">{tool.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4 — Equipe IA */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Equipe IA</span>
        </div>
        <div className="px-4 py-3 space-y-2">
          {pb.bots.map((bot, i) => {
            const bCode = botNameToCode[bot] || "CEOB";
            const bAvatar = BOT_AVATAR_MAP[bCode] || BOT_AVATAR_MAP.CEOB;
            const bDisplay = BOT_DISPLAY[bCode];
            return (
              <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                <img src={bAvatar} className="h-7 w-7 rounded-full ring-2 ring-white/80 object-cover shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-800 block">{bot}</span>
                  <span className="text-[10px] text-gray-500">{bDisplay?.role || "Agent"} — {bDisplay?.dept || ""}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{i === 0 ? "Pilote" : i === 1 ? "Analyste" : "Support"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 5 — Deroulement (workflow) */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Activity className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Deroulement</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 ml-auto">{workflows.length} etapes</span>
        </div>
        <div className="px-4 py-3 space-y-1">
          {workflows.map((step: any) => {
            const sCode = botNameToCode[step.bot] || "CEOB";
            const sAvatar = BOT_AVATAR_MAP[sCode] || BOT_AVATAR_MAP.CEOB;
            return (
              <div key={step.num} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-[10px] font-bold text-white bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0">{step.num}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-800">{step.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <img src={sAvatar} className="h-5 w-5 rounded-full object-cover" alt="" />
                  <span className="text-[10px] font-bold text-blue-600">{step.bot}</span>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{step.duree}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 6 — Livrables */}
      {livrables.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <FileText className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Livrables</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {livrables.map((l, i) => {
              const LivIcon = l.icon;
              return (
                <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                  <LivIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-700 flex-1">{l.nom}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-600">{l.type}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 7 — Dernieres sessions */}
      {recentForThis.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Clock className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Dernieres sessions</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {recentForThis.map(s => (
              <div key={s.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-700 flex-1">{s.date}</span>
                <span className="text-[10px] text-gray-500">{s.duree}</span>
                <span className="text-[10px] text-gray-500">{s.participants} participants</span>
                <span className="text-[10px] text-gray-500">{s.livrables} livrables</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 8 — Conferences similaires */}
      {similarDept.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Layers className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Conferences similaires</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {similarDept.map(sp => (
              <div key={sp.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => { onBack(); setTimeout(() => { /* parent will re-render */ }, 50); }}>
                <span className="text-xs font-bold text-gray-800 flex-1">{sp.nom}</span>
                <span className="text-[10px] text-gray-500">{sp.duree}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Inclus</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ConfAIFiltered — Liste filtree de conferences */
function ConfAIFiltered({ playbooks, title, icon: TitleIcon, onOpenDetail, onLaunch, onBack }: {
  playbooks: typeof PLAYBOOK_STORE_DATA;
  title: string;
  icon: React.ElementType;
  onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void;
  onLaunch?: (type: string, title: string) => void;
  onBack: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [filterDept, setFilterDept] = useState<string>("all");

  const depts = [...new Set(playbooks.map(p => p.departement))];
  let filtered = playbooks
    .filter(pb => !searchTerm || pb.nom.toLowerCase().includes(searchTerm.toLowerCase()) || pb.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(pb => filterDept === "all" || pb.departement === filterDept);

  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  else if (sortBy === "populaires") filtered = [...filtered].sort((a, b) => b.downloads - a.downloads);
  else if (sortBy === "alpha") filtered = [...filtered].sort((a, b) => a.nom.localeCompare(b.nom));

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-[10px] text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer"><ChevronLeft className="h-3.5 w-3.5" /> Retour</button>
      <div className="flex items-center gap-2 mb-1">
        <TitleIcon className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{playbooks.length}</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[120px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full text-xs pl-7 pr-2 py-1.5 rounded-lg border border-gray-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none" />
        </div>
        {depts.length > 1 && (
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white cursor-pointer">
            <option value="all">Tous les depts</option>
            {depts.map(d => <option key={d} value={d}>{DEPT_LABELS[d] || d}</option>)}
          </select>
        )}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white cursor-pointer">
          <option value="rating">Note</option>
          <option value="populaires">Populaire</option>
          <option value="alpha">A-Z</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(pb => {
          const DeptIcon = DEPT_ICONS[pb.departement] || Target;
          return (
            <div key={pb.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onOpenDetail(pb)}>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                <DeptIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900 flex-1 truncate">{pb.nom}</span>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 shrink-0">Inclus</span>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{pb.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {pb.bots.slice(0, 3).map((bot, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">{bot}</span>
                    ))}
                  </div>
                  <button onClick={e => { e.stopPropagation(); onLaunch?.(pb.type, pb.nom); }} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold cursor-pointer transition-colors">
                    <Play className="h-3.5 w-3.5" /> Lancer
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-gray-500">{pb.duree}</span>
                  <span className="text-[10px] text-gray-500">{pb.etapes} etapes</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <p className="text-xs text-gray-400 text-center py-6">Aucune conference ne correspond a vos filtres</p>}
    </div>
  );
}

// ══════════════════════════════════════════
// ══════════════════════════════════════════
// DEPT DASHBOARD VIEW — Dashboard par département (12 bots)
// Pattern: gradient header + 5 VITAA + 3 rows × 3 blocs (style UB_PASTEL)
// ══════════════════════════════════════════

const UB_PASTEL_DEPT = "bg-[#00B4D8]/10";

// Phase colors AMORCER (badge only — same as VueEnsemble/SimAmorcer PC map)
type PhaseKey = "attention" | "moderation" | "observation" | "reflexion" | "creation" | "execution" | "retroaction" | "discussion";
const PHASE_COLORS: Record<PhaseKey, { label: string; badge: string; dot: string }> = {
  discussion:   { label: "Discussion",   badge: "bg-blue-100 text-blue-700",     dot: "bg-blue-500" },
  attention:    { label: "Attention",    badge: "bg-red-100 text-red-700",       dot: "bg-red-500" },
  moderation:   { label: "Modération",   badge: "bg-pink-100 text-pink-700",     dot: "bg-pink-500" },
  observation:  { label: "Observation",  badge: "bg-blue-100 text-blue-700",     dot: "bg-blue-500" },
  reflexion:    { label: "Réflexion",    badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  creation:     { label: "Conception",   badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  execution:    { label: "Exécution",    badge: "bg-green-100 text-green-700",   dot: "bg-green-500" },
  retroaction:  { label: "Rétroaction",  badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

interface VitaaItem {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  icon: React.ElementType;
}

interface DashboardBlocItem {
  primary: string;
  value?: string;
  valueColor?: string;
  pct?: number;
  pctColor?: string;
  secondary: string;
  bot?: string;
  phase?: PhaseKey;
  urgent?: boolean;
}

interface DashboardBlocConfig {
  icon: React.ElementType;
  title: string;
  count?: number;
  items: DashboardBlocItem[];
}

interface DeptDashboardConfig {
  deptLabel: string;
  deptFullLabel?: string;
  summary: string;
  vitaa: VitaaItem[];
  row1: DashboardBlocConfig[];
  row2: DashboardBlocConfig[];
  row3: DashboardBlocConfig[];
}

const DEPT_GRADIENT: Record<string, string> = {
  CEOB: "from-blue-700 to-blue-500",
  CFOB: "from-emerald-600 to-emerald-500",
  CTOB: "from-violet-600 to-violet-500",
  CPOB: "from-slate-700 to-slate-600",
  COOB: "from-orange-600 to-orange-500",
  CROB: "from-amber-600 to-amber-500",
  CMOB: "from-pink-600 to-pink-500",
  CSOB: "from-red-600 to-red-500",
  CHROB: "from-teal-600 to-teal-500",
  CISOB: "from-zinc-700 to-zinc-600",
  CLOB: "from-indigo-600 to-indigo-500",
  CINOB: "from-rose-600 to-rose-500",
};

// DEPT_DASH_ICON déplacé en haut du fichier (avant DEPT_ICONS alias)

export const DEPT_FULL_LABEL: Record<string, string> = {
  CEOB: "de la direction", CROB: "des ventes", CFOB: "des finances",
  CMOB: "marketing", CTOB: "de la technologie", COOB: "des opérations",
  CPOB: "de la production", CHROB: "des ressources humaines",
  CINOB: "de l'innovation & R&D", CSOB: "de la stratégie",
  CLOB: "juridique", CISOB: "de la sécurité",
};

// DEPT_SHORT_LABEL déplacé en haut du fichier (source unique pour labels départements)

const DEPT_DASHBOARD_SECTIONS: Record<string, DeptDashboardConfig> = {
  CEOB: {
    deptLabel: "Direction",
    deptFullLabel: "de la direction",
    summary: "Vue consolidée de l'entreprise — pilotage stratégique et gouvernance",
    vitaa: [
      { label: "Ventes", value: "890K$", delta: "+12%", up: true, icon: TrendingUp },
      { label: "Idées", value: "47", delta: "+8 ce mois", up: true, icon: Sparkles },
      { label: "Temps", value: "186h", delta: "92% alloué", up: true, icon: Clock },
      { label: "Argent", value: "2.4M$", delta: "+18%", up: true, icon: DollarSign },
      { label: "Actifs", value: "63", delta: "+5 ce mois", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Subvention MESI", value: "Nouveau", valueColor: "text-green-600", secondary: "50K$ — manufacturiers innovants" },
        { primary: "Tarifs douaniers US", value: "Alerte", valueColor: "text-red-600", urgent: true, secondary: "Impact potentiel 8% revenus", phase: "attention" },
        { primary: "Tendance IA manuf.", secondary: "Article CEFRIO — adoption +40%" },
      ]},
      { icon: ClipboardCheck, title: "Décisions", count: 8, items: [
        { primary: "Expansion Laval", value: "En cours", valueColor: "text-blue-600", secondary: "D-097 — validée mars", phase: "execution" },
        { primary: "Nouveau CRM", value: "Approuvé", valueColor: "text-green-600", secondary: "D-101 — budget 45K$", phase: "retroaction" },
        { primary: "Restructuration prod.", value: "En attente", valueColor: "text-amber-600", secondary: "D-103 — analyse ROI", phase: "reflexion" },
      ]},
      { icon: Award, title: "OKR", count: 4, items: [
        { primary: "Croissance 15%", pct: 72, pctColor: "bg-green-500", secondary: "Objectif annuel", phase: "execution" },
        { primary: "Satisfaction client >90", pct: 88, pctColor: "bg-green-500", secondary: "NPS actuel: 88", phase: "retroaction" },
        { primary: "Marge brute 35%", pct: 91, pctColor: "bg-green-500", secondary: "En avance sur cible", phase: "retroaction" },
      ]},
    ],
    row2: [
      { icon: User, title: "Comité", count: 3, items: [
        { primary: "CA mensuel", value: "12 avr.", secondary: "5 points à l'ordre du jour" },
        { primary: "Comité stratégique", value: "18 avr.", secondary: "Revue portefeuille", phase: "reflexion" },
        { primary: "1:1 avec Frank (CFO)", value: "8 avr.", secondary: "Budget Q2" },
      ]},
      { icon: Shield, title: "Gouvernance", count: 2, items: [
        { primary: "Conformité LPRPDE", pct: 85, pctColor: "bg-green-500", secondary: "Audit complété mars", phase: "retroaction" },
        { primary: "Politique ESG", value: "V2", valueColor: "text-blue-600", secondary: "Mise à jour trimestrielle", phase: "execution" },
        { primary: "Registre risques", value: "14", secondary: "3 risques élevés", phase: "attention" },
      ]},
      { icon: TrendingUp, title: "Pipeline", count: 7, items: [
        { primary: "Pipeline total", value: "3.2M$", valueColor: "text-green-600", secondary: "32 opportunités actives" },
        { primary: "Taux conversion", pct: 24, pctColor: "bg-amber-500", secondary: "Cible: 30%", phase: "reflexion" },
        { primary: "Temps moyen cycle", value: "42j", secondary: "En baisse vs Q4 (51j)", phase: "retroaction" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 23, items: [
        { primary: "Valider budget marketing Q2", value: "Urgent", valueColor: "text-red-600", secondary: "Échéance: 10 avril", urgent: true, phase: "attention" },
        { primary: "Revoir proposition Laval", value: "Normal", valueColor: "text-blue-600", secondary: "Échéance: 15 avril", phase: "reflexion" },
        { primary: "Feedback plan embauche", value: "Normal", valueColor: "text-blue-600", secondary: "Échéance: 12 avril" },
      ]},
      { icon: Calendar, title: "Agenda", count: 6, items: [
        { primary: "Board meeting", value: "12 avr. 9h", secondary: "Salle virtuelle — 12 participants" },
        { primary: "Client Boréal", value: "10 avr. 14h", secondary: "Renouvellement contrat", phase: "execution" },
        { primary: "Demo investisseurs", value: "18 avr. 10h", secondary: "Série A — pitch deck", phase: "creation" },
      ]},
      { icon: Gauge, title: "Consolidé", count: 5, items: [
        { primary: "Revenus Q1", value: "1.2M$", valueColor: "text-green-600", secondary: "+12% vs objectif", phase: "retroaction" },
        { primary: "Marge nette", value: "8.4%", valueColor: "text-amber-600", secondary: "Cible: 10%", phase: "reflexion" },
        { primary: "Effectifs", value: "47", secondary: "3 postes ouverts" },
      ]},
    ],
  },

  CROB: {
    deptLabel: "Ventes",
    deptFullLabel: "des ventes",
    summary: "Pipeline commercial, contacts et performance des revenus",
    vitaa: [
      { label: "Ventes", value: "3.2M$", delta: "pipeline actif", up: true, icon: TrendingUp },
      { label: "Idées", value: "18", delta: "+6 leads", up: true, icon: Sparkles },
      { label: "Temps", value: "210h", delta: "88% alloué", up: true, icon: Clock },
      { label: "Argent", value: "1.8M$", delta: "Q1 réalisé", up: true, icon: DollarSign },
      { label: "Actifs", value: "247", delta: "contacts", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Appel d'offres HQ", value: "Nouveau", valueColor: "text-green-600", secondary: "Automation industrielle — 500K$" },
        { primary: "Concurrent Acme", value: "Alerte", valueColor: "text-red-600", urgent: true, secondary: "Nouveau produit lancé", phase: "attention" },
        { primary: "Tendance secteur", secondary: "Demande +15% automatisation" },
      ]},
      { icon: User, title: "Contacts", count: 247, items: [
        { primary: "Leads qualifiés", value: "18", valueColor: "text-green-600", secondary: "Nouveaux ce mois" },
        { primary: "Relances en retard", value: "7", valueColor: "text-red-600", secondary: ">5 jours sans suivi", phase: "attention" },
        { primary: "Score moyen lead", pct: 62, pctColor: "bg-blue-500", secondary: "Scoring automatique" },
      ]},
      { icon: FileText, title: "Soumissions", count: 12, items: [
        { primary: "En attente réponse", value: "5", valueColor: "text-amber-600", secondary: "Valeur: 890K$", phase: "reflexion" },
        { primary: "Envoyées ce mois", value: "8", secondary: "Délai moyen: 3.2 jours" },
        { primary: "Taux acceptation", pct: 42, pctColor: "bg-green-500", secondary: "Vs 38% trimestre passé", phase: "retroaction" },
      ]},
    ],
    row2: [
      { icon: BarChart3, title: "Prévisions", items: [
        { primary: "Q2 projeté", value: "1.8M$", valueColor: "text-green-600", secondary: "Confiance: 72%" },
        { primary: "Annuel projeté", value: "6.4M$", valueColor: "text-blue-600", secondary: "Budget: 7M$" },
        { primary: "Écart budget", value: "-8.6%", valueColor: "text-amber-600", secondary: "Plan rattrapage actif", phase: "reflexion" },
      ]},
      { icon: Globe, title: "Territoires", count: 4, items: [
        { primary: "Montréal/Laval", value: "1.4M$", valueColor: "text-green-600", secondary: "42% du pipeline" },
        { primary: "Québec/Est", value: "680K$", secondary: "21% du pipeline" },
        { primary: "Rive-Sud/Montérégie", value: "540K$", secondary: "17% du pipeline" },
      ]},
      { icon: Award, title: "Performance", items: [
        { primary: "Atteinte quota", pct: 78, pctColor: "bg-green-500", secondary: "Q1 — 78% du 1.5M$", phase: "execution" },
        { primary: "Deals perdus", value: "6", valueColor: "text-red-600", secondary: "Analyse: prix (3), délais (2)", phase: "attention" },
        { primary: "Upsell existants", value: "4", valueColor: "text-green-600", secondary: "Valeur: 120K$", phase: "execution" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 18, items: [
        { primary: "Relance clients Boréal", value: "Urgent", valueColor: "text-red-600", secondary: "Échéance: 8 avril", urgent: true, phase: "attention" },
        { primary: "Mise à jour CRM", value: "Normal", valueColor: "text-blue-600", secondary: "12 fiches à compléter", phase: "execution" },
        { primary: "Proposition AutomatePro", value: "Normal", valueColor: "text-blue-600", secondary: "Échéance: 15 avril", phase: "creation" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Revue pipeline", value: "8 avr. 9h", secondary: "Équipe ventes complète" },
        { primary: "Client Boréal", value: "10 avr. 14h", secondary: "Renouvellement contrat", phase: "execution" },
        { primary: "Formation CRM", value: "15 avr. 10h", secondary: "Nouveaux outils scoring" },
      ]},
      { icon: TrendingUp, title: "Pipeline ventes", count: 32, items: [
        { primary: "Valeur totale", value: "3.2M$", valueColor: "text-green-600", secondary: "32 opportunités actives" },
        { primary: "Closings ce mois", value: "4", valueColor: "text-blue-600", secondary: "Valeur: 380K$", phase: "execution" },
        { primary: "Win rate", pct: 28, pctColor: "bg-amber-500", secondary: "Cible: 35%", phase: "reflexion" },
      ]},
    ],
  },

  CFOB: {
    deptLabel: "Finances",
    deptFullLabel: "des finances",
    summary: "Santé financière, trésorerie et conformité comptable",
    vitaa: [
      { label: "Ventes", value: "287K$", delta: "A/R ouvert", up: false, icon: TrendingUp },
      { label: "Idées", value: "6", delta: "projets actifs", up: true, icon: Sparkles },
      { label: "Temps", value: "160h", delta: "95% alloué", up: true, icon: Clock },
      { label: "Argent", value: "1.2M$", delta: "cash dispo", up: true, icon: DollarSign },
      { label: "Actifs", value: "1.8M$", delta: "nets", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Taux directeur BoC", value: "Info", valueColor: "text-blue-600", secondary: "Prochaine annonce: 16 avril" },
        { primary: "RS&DE fédéral", value: "Nouveau", valueColor: "text-green-600", secondary: "Crédit estimé: 68K$" },
        { primary: "Réforme fiscale QC", secondary: "Impact PME manufacturières" },
      ]},
      { icon: Receipt, title: "Facturation", count: 28, items: [
        { primary: "À recevoir", value: "287K$", valueColor: "text-amber-600", secondary: "28 factures ouvertes" },
        { primary: "En retard >30j", value: "43K$", valueColor: "text-red-600", secondary: "4 clients — suivi actif", phase: "attention" },
        { primary: "DSO moyen", value: "38j", secondary: "Cible: <35 jours" },
      ]},
      { icon: Wallet, title: "Trésorerie", items: [
        { primary: "Solde bancaire", value: "1.2M$", valueColor: "text-green-600", secondary: "Au 6 avril 2026" },
        { primary: "Runway", value: "14 mois", valueColor: "text-green-600", secondary: "Au rythme actuel", phase: "retroaction" },
        { primary: "Prochaine paie", value: "15 avr.", secondary: "Montant: 189K$" },
      ]},
    ],
    row2: [
      { icon: ShoppingBag, title: "Dépenses", items: [
        { primary: "Opérationnelles", value: "187K$/mois", secondary: "Stable vs Q4" },
        { primary: "Matières premières", value: "94K$/mois", valueColor: "text-amber-600", secondary: "+8% vs trimestre passé", phase: "attention" },
        { primary: "Demandes en attente", value: "6", secondary: "Approbation requise", phase: "reflexion" },
      ]},
      { icon: BarChart3, title: "Prévisions", items: [
        { primary: "Revenus Q2", value: "1.9M$", valueColor: "text-blue-600", secondary: "Projection optimiste" },
        { primary: "Cash flow projeté", value: "+120K$", valueColor: "text-green-600", secondary: "Avant investissements" },
        { primary: "Break-even mensuel", value: "260K$", secondary: "Atteint depuis Q4", phase: "retroaction" },
      ]},
      { icon: PieChart, title: "Budgets", count: 8, items: [
        { primary: "Marketing", pct: 82, pctColor: "bg-green-500", secondary: "12K$ de 14.5K$ utilisé" },
        { primary: "R&D", pct: 65, pctColor: "bg-blue-500", secondary: "32K$ de 50K$ utilisé" },
        { primary: "Opérations", pct: 93, pctColor: "bg-amber-500", secondary: "Attention — bientôt dépassé", phase: "attention" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 14, items: [
        { primary: "Rapport financier Q1", value: "Urgent", valueColor: "text-red-600", secondary: "Échéance: 10 avril", urgent: true, phase: "attention" },
        { primary: "Revoir budgets départements", value: "Normal", valueColor: "text-blue-600", secondary: "Échéance: 15 avril", phase: "reflexion" },
        { primary: "Dossier RS&DE", value: "Normal", valueColor: "text-blue-600", secondary: "Échéance: 30 avril", phase: "creation" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Comité audit", value: "10 avr. 10h", secondary: "Révision Q1" },
        { primary: "Revue mensuelle", value: "12 avr. 14h", secondary: "CFO + Direction" },
        { primary: "Clôture Q1", value: "15 avr.", secondary: "Deadline comptable", phase: "execution" },
      ]},
      { icon: BookOpen, title: "Grand-livre", items: [
        { primary: "Revenus YTD", value: "3.6M$", valueColor: "text-green-600", secondary: "Sur budget de 3.5M$", phase: "retroaction" },
        { primary: "Dépenses YTD", value: "3.1M$", secondary: "Sous budget de 3.2M$", phase: "retroaction" },
        { primary: "EBITDA", value: "412K$", valueColor: "text-green-600", secondary: "Marge: 11.4%", phase: "retroaction" },
      ]},
    ],
  },

  CMOB: {
    deptLabel: "Marketing",
    deptFullLabel: "marketing",
    summary: "Campagnes, contenu et génération de leads qualifiés",
    vitaa: [
      { label: "Ventes", value: "18", delta: "+40% leads", up: true, icon: TrendingUp },
      { label: "Idées", value: "12", delta: "contenus", up: true, icon: Sparkles },
      { label: "Temps", value: "140h", delta: "85% alloué", up: true, icon: Clock },
      { label: "Argent", value: "14.5K$", delta: "/mois budget", up: true, icon: DollarSign },
      { label: "Actifs", value: "2,340", delta: "followers", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "IA marketing B2B", value: "Tendance", valueColor: "text-blue-600", secondary: "Adoption +35% en 2026" },
        { primary: "LinkedIn algorithme", value: "Info", valueColor: "text-blue-600", secondary: "Changements Q2 2026" },
        { primary: "Marketing manufacturier", secondary: "Étude CEFRIO — budget moyen" },
      ]},
      { icon: FileText, title: "Contenu", count: 12, items: [
        { primary: "Articles publiés", value: "8", secondary: "Ce trimestre — blog + LinkedIn", phase: "retroaction" },
        { primary: "Vidéos témoignages", value: "3", secondary: "Clients Boréal, MetalPro, TechFab", phase: "retroaction" },
        { primary: "En production", value: "4", valueColor: "text-blue-600", secondary: "2 articles + 2 études de cas", phase: "execution" },
      ]},
      { icon: User, title: "Leads", count: 18, items: [
        { primary: "Leads ce mois", value: "18", valueColor: "text-green-600", secondary: "Qualifiés par scoring" },
        { primary: "Coût par lead", value: "420$", secondary: "Cible: <500$" },
        { primary: "Conversion lead→client", pct: 12, pctColor: "bg-amber-500", secondary: "Cible: 15%", phase: "reflexion" },
      ]},
    ],
    row2: [
      { icon: Globe, title: "Réseaux sociaux", items: [
        { primary: "LinkedIn followers", value: "2,340", secondary: "+180 ce mois" },
        { primary: "Engagement moyen", pct: 4, pctColor: "bg-green-500", secondary: "4.2% — excellent pour B2B", phase: "retroaction" },
        { primary: "Publications/sem.", value: "5", secondary: "Cible atteinte", phase: "retroaction" },
      ]},
      { icon: Search, title: "SEO / Web", items: [
        { primary: "Trafic mensuel", value: "4,200", secondary: "+22% vs mois dernier" },
        { primary: "Mots-clés page 1", value: "34", valueColor: "text-green-600", secondary: "Sur 120 ciblés", phase: "retroaction" },
        { primary: "Taux rebond", value: "42%", secondary: "En amélioration (-5 pts)", phase: "reflexion" },
      ]},
      { icon: BarChart3, title: "Analytics", items: [
        { primary: "ROI marketing", value: "3.2x", valueColor: "text-green-600", secondary: "Sur 12 mois glissants", phase: "retroaction" },
        { primary: "CAC", value: "2,100$", secondary: "Coût acquisition client" },
        { primary: "LTV/CAC ratio", value: "4.8", valueColor: "text-green-600", secondary: "Excellent — >3 cible", phase: "retroaction" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 16, items: [
        { primary: "Validation contenu LinkedIn", value: "Urgent", valueColor: "text-red-600", secondary: "Échéance: 8 avril", urgent: true, phase: "attention" },
        { primary: "Rapport analytics Q1", value: "Normal", valueColor: "text-blue-600", secondary: "Échéance: 12 avril" },
        { primary: "Préparation webinaire", value: "Normal", valueColor: "text-blue-600", secondary: "Échéance: 20 avril", phase: "creation" },
      ]},
      { icon: Calendar, title: "Agenda", count: 3, items: [
        { primary: "Petit-déjeuner REAI", value: "24 avr.", secondary: "Présentation Brain Team" },
        { primary: "Webinaire mensuel", value: "22 avr.", secondary: "Thème: diagnostic VITAA" },
        { primary: "Salon manufacturier", value: "8-9 mai", secondary: "Kiosque réservé — Mtl" },
      ]},
      { icon: Newspaper, title: "Campagnes", count: 4, items: [
        { primary: "Campagne LinkedIn Q2", pct: 45, pctColor: "bg-pink-500", secondary: "Lancement: 15 avril", phase: "execution" },
        { primary: "Email nurturing", value: "Actif", valueColor: "text-green-600", secondary: "Taux ouverture: 34%", phase: "execution" },
        { primary: "Webinaire VITAA", value: "Planifié", valueColor: "text-blue-600", secondary: "22 avril — 40 inscrits", phase: "creation" },
      ]},
    ],
  },

  CTOB: {
    deptLabel: "Technologie",
    deptFullLabel: "de la technologie",
    summary: "Infrastructure technique, sprints et sécurité informatique",
    vitaa: [
      { label: "Ventes", value: "12K", delta: "req/jour", up: true, icon: TrendingUp },
      { label: "Idées", value: "8", delta: "features", up: true, icon: Sparkles },
      { label: "Temps", value: "200h", delta: "90% alloué", up: true, icon: Clock },
      { label: "Argent", value: "45K$", delta: "infra/mois", up: true, icon: DollarSign },
      { label: "Actifs", value: "52", delta: "repos", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Claude 4.5 Opus", value: "Nouveau", valueColor: "text-green-600", secondary: "Évaluer pour T4 routing" },
        { primary: "LiveKit 2.0", value: "Stable", valueColor: "text-blue-600", secondary: "Migration planifiée Q2" },
        { primary: "React 19", secondary: "RC — tester compatibilité" },
      ]},
      { icon: Database, title: "Infrastructure", items: [
        { primary: "Uptime", pct: 99, pctColor: "bg-green-500", secondary: "99.7% — 30 derniers jours", phase: "retroaction" },
        { primary: "VPS1 (dev)", value: "OK", valueColor: "text-green-600", secondary: "CPU: 23%, RAM: 68%" },
        { primary: "VPS2 (prod)", value: "OK", valueColor: "text-green-600", secondary: "CPU: 12%, RAM: 45%" },
      ]},
      { icon: Bug, title: "Bugs", count: 7, items: [
        { primary: "Critiques", value: "0", valueColor: "text-green-600", secondary: "Aucun bloquant", phase: "retroaction" },
        { primary: "Majeurs", value: "2", valueColor: "text-amber-600", secondary: "Voice coupure + search bar", phase: "attention" },
        { primary: "Mineurs", value: "5", secondary: "Backlog priorisé", phase: "reflexion" },
      ]},
    ],
    row2: [
      { icon: ShieldCheck, title: "Sécurité", items: [
        { primary: "Score sécurité", pct: 87, pctColor: "bg-green-500", secondary: "Dernier scan: 5 avril", phase: "retroaction" },
        { primary: "Vulnérabilités", value: "1", valueColor: "text-amber-600", secondary: "Low — dépendance npm", phase: "attention" },
        { primary: "Certificat SSL", value: "OK", valueColor: "text-green-600", secondary: "Expire: 2 juin 2026", phase: "retroaction" },
      ]},
      { icon: Settings, title: "DevOps", items: [
        { primary: "Déploiements/sem.", value: "8", secondary: "CI/CD automatisé", phase: "execution" },
        { primary: "Temps build", value: "2.3 min", secondary: "Vite + TypeScript" },
        { primary: "Tests passants", pct: 94, pctColor: "bg-green-500", secondary: "94/100 — 6 skippés", phase: "retroaction" },
      ]},
      { icon: BarChart3, title: "Métriques", items: [
        { primary: "Latence API p95", value: "180ms", valueColor: "text-green-600", secondary: "Cible: <200ms", phase: "retroaction" },
        { primary: "Erreurs 5xx/jour", value: "3", secondary: "En baisse (-70% vs mars)" },
        { primary: "Requêtes/jour", value: "12K", secondary: "Peak: 850/heure" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 31, items: [
        { primary: "Migration DB phase 2", value: "Urgent", valueColor: "text-red-600", secondary: "Deadline: 10 avril", urgent: true, phase: "attention" },
        { primary: "API Orbit9 endpoints", value: "Normal", valueColor: "text-blue-600", secondary: "5 endpoints restants", phase: "execution" },
        { primary: "Fix voice pipeline", value: "Urgent", valueColor: "text-red-600", secondary: "Coupure après 2 min", urgent: true, phase: "attention" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Sprint review", value: "12 avr. 14h", secondary: "Demo + rétrospective" },
        { primary: "Tech debt review", value: "15 avr. 10h", secondary: "Priorisation Q2", phase: "reflexion" },
        { primary: "Infra planning", value: "18 avr. 9h", secondary: "Scale VPS3?", phase: "reflexion" },
      ]},
      { icon: Rocket, title: "Sprint actif", count: 12, items: [
        { primary: "Sprint 14 — CarlOS v2", pct: 65, pctColor: "bg-violet-500", secondary: "8/12 stories complétées", phase: "execution" },
        { primary: "Vélocité", value: "34 pts", secondary: "Moyenne: 31 pts" },
        { primary: "Fin sprint", value: "12 avr.", secondary: "Demo vendredi 14h" },
      ]},
    ],
  },

  COOB: {
    deptLabel: "Opérations",
    deptFullLabel: "des opérations",
    summary: "Processus, logistique, fournisseurs et contrôle qualité",
    vitaa: [
      { label: "Ventes", value: "91%", delta: "on-time", up: true, icon: TrendingUp },
      { label: "Idées", value: "5", delta: "kaizen", up: true, icon: Sparkles },
      { label: "Temps", value: "180h", delta: "88% alloué", up: true, icon: Clock },
      { label: "Argent", value: "18K$", delta: "/mois transport", up: true, icon: DollarSign },
      { label: "Actifs", value: "24", delta: "fournisseurs", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Norme ISO 9001:2025", value: "Info", valueColor: "text-blue-600", secondary: "Transition requise d'ici 2027" },
        { primary: "Tarifs douaniers US", value: "Alerte", valueColor: "text-red-600", urgent: true, secondary: "Impact fournisseurs", phase: "attention" },
        { primary: "Lean 4.0 Québec", secondary: "Programme MESI — subvention dispo" },
      ]},
      { icon: Truck, title: "Logistique", items: [
        { primary: "Livraisons à temps", pct: 91, pctColor: "bg-green-500", secondary: "Ce mois — cible: 95%" },
        { primary: "Coût transport", value: "18K$/mois", secondary: "Stable vs Q4" },
        { primary: "Retours/défauts", value: "1.2%", valueColor: "text-green-600", secondary: "Sous la cible de 2%", phase: "retroaction" },
      ]},
      { icon: Handshake, title: "Fournisseurs", count: 24, items: [
        { primary: "Fournisseurs actifs", value: "24", secondary: "6 critiques identifiés" },
        { primary: "Score qualité moy.", pct: 88, pctColor: "bg-green-500", secondary: "Évaluation trimestrielle", phase: "retroaction" },
        { primary: "En retard livraison", value: "2", valueColor: "text-amber-600", secondary: "Acier Québec, PlastiCo", phase: "attention" },
      ]},
    ],
    row2: [
      { icon: Award, title: "Qualité", items: [
        { primary: "Taux conformité", pct: 97, pctColor: "bg-green-500", secondary: "ISO 9001 maintenu", phase: "retroaction" },
        { primary: "NCR ouverts", value: "3", valueColor: "text-amber-600", secondary: "2 mineurs, 1 majeur", phase: "attention" },
        { primary: "Audits planifiés", value: "2", secondary: "Avril: interne + client" },
      ]},
      { icon: BarChart3, title: "Capacité", items: [
        { primary: "Utilisation capacité", pct: 78, pctColor: "bg-blue-500", secondary: "Marge disponible" },
        { primary: "Goulot identifié", value: "CNC 3 axes", secondary: "Taux utilisation: 94%", phase: "attention" },
        { primary: "Heures dispo.", value: "320h/mois", secondary: "Avant overtime" },
      ]},
      { icon: Gauge, title: "Métriques", items: [
        { primary: "Coût/unité", value: "23.40$", secondary: "Cible: 22.50$ (-4%)" },
        { primary: "Lead time moyen", value: "8.5j", secondary: "Cible: 7 jours", phase: "reflexion" },
        { primary: "Taux rebut", value: "2.1%", valueColor: "text-amber-600", secondary: "Cible: <1.5%", phase: "attention" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 22, items: [
        { primary: "Audit 5S ligne B", value: "Urgent", valueColor: "text-red-600", secondary: "Échéance: 8 avril", urgent: true, phase: "attention" },
        { primary: "Renouveler contrat transport", value: "Normal", valueColor: "text-blue-600", secondary: "Expire: 30 avril", phase: "reflexion" },
        { primary: "Mise à jour procédures", value: "Normal", valueColor: "text-blue-600", secondary: "3 SOP à réviser", phase: "execution" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Audit interne ISO", value: "14 avr.", secondary: "2 jours — production + logistique" },
        { primary: "Revue fournisseurs", value: "20 avr.", secondary: "6 fournisseurs critiques" },
        { primary: "Kaizen workshop", value: "22 avr.", secondary: "Ligne A — assemblage" },
      ]},
      { icon: Settings, title: "Processus", count: 8, items: [
        { primary: "Processus documentés", pct: 72, pctColor: "bg-orange-500", secondary: "26/36 complétés", phase: "execution" },
        { primary: "Efficacité globale", pct: 84, pctColor: "bg-green-500", secondary: "OEE — cible: 85%" },
        { primary: "Améliorations actives", value: "5", secondary: "Kaizen en cours", phase: "execution" },
      ]},
    ],
  },

  CPOB: {
    deptLabel: "Production",
    deptFullLabel: "de la production",
    summary: "Lignes de production, maintenance, inventaire et commandes",
    vitaa: [
      { label: "Ventes", value: "8", delta: "commandes", up: true, icon: TrendingUp },
      { label: "Idées", value: "3", delta: "améliorations", up: true, icon: Sparkles },
      { label: "Temps", value: "720h", delta: "production", up: true, icon: Clock },
      { label: "Argent", value: "340K$", delta: "inventaire", up: true, icon: DollarSign },
      { label: "Actifs", value: "3", delta: "lignes", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Robot collaboratif", value: "Étude", valueColor: "text-blue-600", secondary: "Universal Robots UR10e", phase: "reflexion" },
        { primary: "Industrie 4.0", secondary: "Programme MESI — capteurs IoT" },
        { primary: "Formation CNESST", value: "Requis", valueColor: "text-amber-600", secondary: "Renouvellement annuel", phase: "attention" },
      ]},
      { icon: Award, title: "Qualité", items: [
        { primary: "First pass yield", pct: 96, pctColor: "bg-green-500", secondary: "Cible: 95%", phase: "retroaction" },
        { primary: "PPM défauts", value: "340", secondary: "En baisse — cible: <500", phase: "retroaction" },
        { primary: "Réclamations client", value: "1", secondary: "En traitement — MetalPro", phase: "execution" },
      ]},
      { icon: Wrench, title: "Maintenance", count: 4, items: [
        { primary: "Préventive planifiée", value: "4", secondary: "Ce mois", phase: "execution" },
        { primary: "MTBF", value: "720h", valueColor: "text-green-600", secondary: "En hausse (+80h vs Q4)", phase: "retroaction" },
        { primary: "Pièces en commande", value: "3", secondary: "Délai: 5-8 jours", phase: "reflexion" },
      ]},
    ],
    row2: [
      { icon: Package, title: "Inventaire", items: [
        { primary: "Matières premières", value: "340K$", secondary: "Rotation: 6x/an" },
        { primary: "Produits finis", value: "180K$", secondary: "12 jours de stock" },
        { primary: "Seuils critiques", value: "2 items", valueColor: "text-red-600", secondary: "Aluminium + joints", phase: "attention" },
      ]},
      { icon: ClipboardCheck, title: "Commandes", count: 18, items: [
        { primary: "En production", value: "8", secondary: "Valeur: 420K$", phase: "execution" },
        { primary: "En attente", value: "6", secondary: "Matériel en commande", phase: "reflexion" },
        { primary: "Retard", value: "1", valueColor: "text-red-600", secondary: "Client Boréal — 3j", phase: "attention" },
      ]},
      { icon: BarChart3, title: "Indicateurs", items: [
        { primary: "OEE global", pct: 84, pctColor: "bg-green-500", secondary: "Cible: 85%" },
        { primary: "Takt time", value: "4.2 min", secondary: "Vs cible: 4.0 min" },
        { primary: "Overtime", value: "8%", valueColor: "text-amber-600", secondary: "Cible: <5%", phase: "attention" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 20, items: [
        { primary: "Calibration CNC #4", value: "Urgent", valueColor: "text-red-600", secondary: "Échéance: 8 avril", urgent: true, phase: "attention" },
        { primary: "Formation nouvel opérateur", value: "Normal", valueColor: "text-blue-600", secondary: "Semaine du 14 avril", phase: "execution" },
        { primary: "5S ligne B", value: "Planifié", valueColor: "text-blue-600", secondary: "Audit: 20 avril", phase: "creation" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Maintenance CNC #2", value: "10 avr.", secondary: "Préventive — 4h arrêt", phase: "execution" },
        { primary: "Audit qualité client", value: "14 avr.", secondary: "MetalPro — ligne A" },
        { primary: "Réunion production", value: "Lun. 7h30", secondary: "Revue hebdomadaire" },
      ]},
      { icon: Package, title: "Lignes", count: 3, items: [
        { primary: "Ligne A — Assemblage", pct: 92, pctColor: "bg-green-500", secondary: "Plein régime", phase: "execution" },
        { primary: "Ligne B — Usinage", pct: 78, pctColor: "bg-blue-500", secondary: "Capacité disponible" },
        { primary: "Ligne C — Finition", pct: 65, pctColor: "bg-amber-500", secondary: "Maintenance préventive 10 avr.", phase: "reflexion" },
      ]},
    ],
  },

  CHROB: {
    deptLabel: "Ressources Humaines",
    deptFullLabel: "des ressources humaines",
    summary: "Effectifs, recrutement, formation et climat organisationnel",
    vitaa: [
      { label: "Ventes", value: "47", delta: "employés", up: true, icon: TrendingUp },
      { label: "Idées", value: "3", delta: "postes ouverts", up: false, icon: Sparkles },
      { label: "Temps", value: "240h", delta: "formation Q1", up: true, icon: Clock },
      { label: "Argent", value: "189K$", delta: "/mois paie", up: true, icon: DollarSign },
      { label: "Actifs", value: "12", delta: "certifications", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Pénurie main-d'œuvre QC", value: "Alerte", valueColor: "text-red-600", urgent: true, secondary: "Secteur manufacturier -8%", phase: "attention" },
        { primary: "Loi 96 francisation", value: "Info", valueColor: "text-blue-600", secondary: "Nouvelles obligations 2026" },
        { primary: "Tendance télétravail", secondary: "Hybride 3j/sem. — norme PME" },
      ]},
      { icon: Search, title: "Recrutement", count: 3, items: [
        { primary: "Postes ouverts", value: "3", secondary: "Machiniste, soudeur, dev", phase: "execution" },
        { primary: "Candidatures actives", value: "12", secondary: "Pipeline recrutement" },
        { primary: "Délai embauche moy.", value: "28j", secondary: "Cible: <21 jours", phase: "reflexion" },
      ]},
      { icon: GraduationCap, title: "Formation", items: [
        { primary: "Heures formation Q1", value: "240h", secondary: "Budget: 18K$ / 25K$", phase: "retroaction" },
        { primary: "Certifications actives", value: "12", secondary: "CNESST, ISO, soudure", phase: "retroaction" },
        { primary: "Plan développement", pct: 60, pctColor: "bg-blue-500", secondary: "28/47 employés couverts", phase: "execution" },
      ]},
    ],
    row2: [
      { icon: DollarSign, title: "Paie", items: [
        { primary: "Masse salariale", value: "189K$/mois", secondary: "47 employés" },
        { primary: "Avantages sociaux", value: "22K$/mois", secondary: "Assurances + REER" },
        { primary: "Heures supp.", value: "8%", valueColor: "text-amber-600", secondary: "Production — cible: <5%", phase: "attention" },
      ]},
      { icon: Shield, title: "Conformité", items: [
        { primary: "CNESST", value: "Conforme", valueColor: "text-green-600", secondary: "Dernier audit: mars", phase: "retroaction" },
        { primary: "Normes du travail", value: "Conforme", valueColor: "text-green-600", secondary: "Prochaine vérification: Q3", phase: "retroaction" },
        { primary: "Équité salariale", value: "En cours", valueColor: "text-blue-600", secondary: "Exercice 2026", phase: "execution" },
      ]},
      { icon: Heart, title: "Climat", items: [
        { primary: "Satisfaction globale", pct: 78, pctColor: "bg-green-500", secondary: "Sondage Q1 2026", phase: "retroaction" },
        { primary: "Engagement", pct: 72, pctColor: "bg-blue-500", secondary: "En hausse (+4 pts)" },
        { primary: "Absentéisme", value: "3.2%", valueColor: "text-green-600", secondary: "Sous la cible de 4%", phase: "retroaction" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 12, items: [
        { primary: "Entrevues machiniste", value: "Urgent", valueColor: "text-red-600", secondary: "3 candidats cette semaine", urgent: true, phase: "attention" },
        { primary: "Évaluation mi-année", value: "Planifié", valueColor: "text-blue-600", secondary: "Début: 15 avril", phase: "creation" },
        { primary: "Mise à jour manuel", value: "Normal", valueColor: "text-blue-600", secondary: "Politique télétravail" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Entrevues machiniste", value: "8-10 avr.", secondary: "3 candidats shortlistés", phase: "execution" },
        { primary: "Formation sécurité", value: "15 avr.", secondary: "Production — obligatoire" },
        { primary: "5 à 7 équipe", value: "25 avr.", secondary: "Team building mensuel" },
      ]},
      { icon: User, title: "Effectifs", items: [
        { primary: "Total employés", value: "47", secondary: "44 temps plein + 3 temps partiel" },
        { primary: "Roulement annuel", value: "8%", valueColor: "text-green-600", secondary: "Industrie: 12%", phase: "retroaction" },
        { primary: "Ancienneté moyenne", value: "4.2 ans", secondary: "En hausse (+0.5 an)", phase: "retroaction" },
      ]},
    ],
  },

  CINOB: {
    deptLabel: "Innovation & R&D",
    deptFullLabel: "de l'innovation & R&D",
    summary: "Projets de recherche, brevets, veille technologique et crédits RS&DE",
    vitaa: [
      { label: "Ventes", value: "3", delta: "projets R&D", up: true, icon: TrendingUp },
      { label: "Idées", value: "8", delta: "idées soumises", up: true, icon: Sparkles },
      { label: "Temps", value: "160h", delta: "R&D", up: true, icon: Clock },
      { label: "Argent", value: "200K$", delta: "budget annuel", up: true, icon: DollarSign },
      { label: "Actifs", value: "2", delta: "brevets", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "IA manufacturière", value: "Tendance", valueColor: "text-blue-600", secondary: "Adoption +40% en 2026" },
        { primary: "Crédits RS&DE", value: "Info", valueColor: "text-green-600", secondary: "Total estimé: 92K$" },
        { primary: "Industrie 4.0 Québec", secondary: "Programme MESI — capteurs IoT" },
      ]},
      { icon: FileLock, title: "Brevets", count: 2, items: [
        { primary: "BTML framework", value: "Déposé", valueColor: "text-blue-600", secondary: "Demande provisoire — mars 2026", phase: "retroaction" },
        { primary: "Diagnostic VITAA", value: "En prep.", valueColor: "text-amber-600", secondary: "Consultation avocat brevets", phase: "creation" },
        { primary: "Portfolio PI", value: "2", secondary: "Valeur estimée: 180K$" },
      ]},
      { icon: Search, title: "Veille techno", items: [
        { primary: "Articles suivis", value: "34", secondary: "IA, IoT, vision par ordinateur" },
        { primary: "Brevets concurrents", value: "8", secondary: "Monitoring mensuel" },
        { primary: "Rapport mensuel", value: "Publié", valueColor: "text-green-600", secondary: "Mars 2026 disponible", phase: "retroaction" },
      ]},
    ],
    row2: [
      { icon: DollarSign, title: "Budget R&D", items: [
        { primary: "Budget annuel", value: "200K$", secondary: "Dépensé: 68K$ (Q1)" },
        { primary: "RS&DE admissible", value: "148K$", valueColor: "text-green-600", secondary: "Crédit estimé: 68K$", phase: "retroaction" },
        { primary: "Subventions", value: "50K$", valueColor: "text-green-600", secondary: "MESI confirmé", phase: "retroaction" },
      ]},
      { icon: Handshake, title: "Partenariats", count: 3, items: [
        { primary: "Université Laval", value: "Actif", valueColor: "text-green-600", secondary: "Projet IA manufacturing", phase: "execution" },
        { primary: "CRIQ", value: "Actif", valueColor: "text-green-600", secondary: "Essais matériaux", phase: "execution" },
        { primary: "NRC-IRAP", value: "En discussion", valueColor: "text-blue-600", secondary: "Financement R&D fédéral", phase: "reflexion" },
      ]},
      { icon: Sparkles, title: "Pipeline idées", count: 8, items: [
        { primary: "Idées soumises", value: "8", secondary: "Ce trimestre — employés", phase: "creation" },
        { primary: "En évaluation", value: "3", secondary: "Comité innovation", phase: "reflexion" },
        { primary: "Implémentées", value: "2", valueColor: "text-green-600", secondary: "Kaizen + outil interne", phase: "retroaction" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 10, items: [
        { primary: "Rapport RS&DE Q1", value: "Urgent", valueColor: "text-red-600", secondary: "Échéance: 15 avril", urgent: true, phase: "attention" },
        { primary: "POC capteurs ligne A", value: "Normal", valueColor: "text-blue-600", secondary: "Installation test", phase: "execution" },
        { primary: "Benchmark outils IA", value: "Normal", valueColor: "text-blue-600", secondary: "Évaluation 3 solutions" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Comité R&D", value: "12 avr. 13h", secondary: "Revue projets trimestrielle" },
        { primary: "Visite U. Laval", value: "18 avr.", secondary: "Lab IA manufacturing" },
        { primary: "Deadline RS&DE", value: "15 avr.", secondary: "Documents comptables", phase: "execution" },
      ]},
      { icon: Rocket, title: "Projets R&D", count: 3, items: [
        { primary: "CarlOS v2 — IA", pct: 65, pctColor: "bg-rose-500", secondary: "Phase: prototype avancé", phase: "execution" },
        { primary: "Capteurs IoT usine", pct: 30, pctColor: "bg-blue-500", secondary: "Phase: étude faisabilité", phase: "reflexion" },
        { primary: "Vision qualité auto", pct: 15, pctColor: "bg-amber-500", secondary: "Phase: recherche", phase: "creation" },
      ]},
    ],
  },

  CSOB: {
    deptLabel: "Stratégie",
    deptFullLabel: "de la stratégie",
    summary: "Positionnement concurrentiel, alliances stratégiques et expansion",
    vitaa: [
      { label: "Ventes", value: "4.2%", delta: "part marché", up: true, icon: TrendingUp },
      { label: "Idées", value: "3", delta: "alliances", up: true, icon: Sparkles },
      { label: "Temps", value: "120h", delta: "stratégie", up: true, icon: Clock },
      { label: "Argent", value: "0$", delta: "pas de budget propre", up: true, icon: DollarSign },
      { label: "Actifs", value: "14", delta: "risques suivis", up: false, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Budget fédéral 2026", value: "Info", valueColor: "text-blue-600", secondary: "Programmes PME manufacturing" },
        { primary: "IA générative B2B", secondary: "McKinsey: +23% productivité" },
        { primary: "Nearshoring trend", secondary: "Opportunité: US → QC" },
      ]},
      { icon: Eye, title: "Concurrents", count: 5, items: [
        { primary: "Acme Solutions", value: "Alerte", valueColor: "text-red-600", urgent: true, secondary: "Nouveau produit — mars", phase: "attention" },
        { primary: "TechFab QC", value: "Stable", valueColor: "text-blue-600", secondary: "Même segment" },
        { primary: "Mouvements détectés", value: "3", secondary: "Ce trimestre" },
      ]},
      { icon: Handshake, title: "Alliances", count: 4, items: [
        { primary: "REAI", value: "Actif", valueColor: "text-green-600", secondary: "130+ manufacturiers", phase: "execution" },
        { primary: "Partenariat distributeur", value: "Négociation", valueColor: "text-amber-600", secondary: "AutomatePro — exclusivité", phase: "reflexion" },
        { primary: "Consortium IA", value: "Membre", secondary: "MILA + IVADO", phase: "retroaction" },
      ]},
    ],
    row2: [
      { icon: Globe, title: "Expansion", items: [
        { primary: "Expansion Laval", value: "En cours", valueColor: "text-blue-600", secondary: "Ouverture Q3 2026", phase: "execution" },
        { primary: "Ontario", value: "Étude", valueColor: "text-amber-600", secondary: "Marché: 2,400 PME cibles", phase: "reflexion" },
        { primary: "Export US", value: "Phase 0", secondary: "Veille réglementaire" },
      ]},
      { icon: Bell, title: "Risques", count: 14, items: [
        { primary: "Tarifs US", value: "Élevé", valueColor: "text-red-600", secondary: "Impact: 8% revenus", phase: "attention" },
        { primary: "Pénurie main-d'œuvre", value: "Moyen", valueColor: "text-amber-600", secondary: "3 postes ouverts", phase: "attention" },
        { primary: "Concentration clients", value: "Moyen", valueColor: "text-amber-600", secondary: "Top 3 = 35% revenus", phase: "reflexion" },
      ]},
      { icon: BarChart3, title: "Indicateurs", items: [
        { primary: "Score stratégique", pct: 76, pctColor: "bg-green-500", secondary: "Composite — 8 dimensions" },
        { primary: "Alignement équipe", pct: 82, pctColor: "bg-green-500", secondary: "Sondage trimestriel", phase: "retroaction" },
        { primary: "Agilité décisionnelle", value: "3.2j", secondary: "Temps moyen décision" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 9, items: [
        { primary: "Analyse impact tarifs", value: "Urgent", valueColor: "text-red-600", secondary: "Scénarios pour le CA", urgent: true, phase: "attention" },
        { primary: "Étude Ontario", value: "Normal", valueColor: "text-blue-600", secondary: "Phase 1 — desk research", phase: "reflexion" },
        { primary: "Mise à jour SWOT", value: "Normal", valueColor: "text-blue-600", secondary: "Version Q2" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Comité stratégique", value: "18 avr. 9h", secondary: "Revue portefeuille", phase: "reflexion" },
        { primary: "Board meeting", value: "12 avr.", secondary: "Présentation expansion" },
        { primary: "Veille concurrentielle", value: "Hebdo lun.", secondary: "Rapport automatisé" },
      ]},
      { icon: Eye, title: "Positionnement", items: [
        { primary: "Part de marché QC", value: "4.2%", secondary: "Manufacturiers automatisés" },
        { primary: "Avantage concurrentiel", value: "IA+Humain", secondary: "Positionnement unique", phase: "retroaction" },
        { primary: "NPS marché", pct: 72, pctColor: "bg-green-500", secondary: "Enquête Q1 2026", phase: "retroaction" },
      ]},
    ],
  },

  CLOB: {
    deptLabel: "Juridique",
    deptFullLabel: "juridique",
    summary: "Contrats, conformité réglementaire, propriété intellectuelle et litiges",
    vitaa: [
      { label: "Ventes", value: "34", delta: "contrats actifs", up: true, icon: TrendingUp },
      { label: "Idées", value: "1", delta: "litige", up: false, icon: Sparkles },
      { label: "Temps", value: "80h", delta: "juridique", up: true, icon: Clock },
      { label: "Argent", value: "34K$", delta: "frais YTD", up: true, icon: DollarSign },
      { label: "Actifs", value: "287", delta: "documents", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Loi C-27 fédérale", value: "Suivi", valueColor: "text-blue-600", secondary: "Impact données IA" },
        { primary: "Tarifs douaniers US", value: "Alerte", valueColor: "text-red-600", urgent: true, secondary: "Révision contrats export", phase: "attention" },
        { primary: "Réforme droit travail QC", secondary: "Projet de loi en cours" },
      ]},
      { icon: Shield, title: "Conformité", items: [
        { primary: "LPRPDE", pct: 85, pctColor: "bg-green-500", secondary: "Audit mars — conforme", phase: "retroaction" },
        { primary: "Loi 25 (QC)", pct: 90, pctColor: "bg-green-500", secondary: "PIA complété", phase: "retroaction" },
        { primary: "CNESST/SST", value: "Conforme", valueColor: "text-green-600", secondary: "Prochaine inspection: Q3", phase: "retroaction" },
      ]},
      { icon: Gavel, title: "Litiges", count: 1, items: [
        { primary: "Litiges actifs", value: "1", secondary: "Fournisseur — vice caché", phase: "attention" },
        { primary: "Montant en jeu", value: "45K$", secondary: "Médiation en cours", phase: "execution" },
        { primary: "Provision comptable", value: "20K$", secondary: "Risque modéré" },
      ]},
    ],
    row2: [
      { icon: Lock, title: "Propriété intel.", count: 4, items: [
        { primary: "Marques déposées", value: "2", secondary: "Brain Team + Usine Bleue", phase: "retroaction" },
        { primary: "Brevets", value: "1 déposé", valueColor: "text-blue-600", secondary: "BTML framework", phase: "execution" },
        { primary: "NDA actifs", value: "8", secondary: "Clients + partenaires" },
      ]},
      { icon: Crown, title: "Gouvernance", items: [
        { primary: "Structure corporative", value: "À jour", valueColor: "text-green-600", secondary: "REQ renouvelé", phase: "retroaction" },
        { primary: "Convention actionnaires", value: "V3", secondary: "Mise à jour: février 2026", phase: "retroaction" },
        { primary: "Registre résolutions", value: "À jour", valueColor: "text-green-600", secondary: "12 résolutions 2026", phase: "retroaction" },
      ]},
      { icon: Database, title: "Registre", items: [
        { primary: "Documents archivés", value: "287", secondary: "Classement numérique" },
        { primary: "Échéances actives", value: "14", secondary: "Renouvellements + deadlines" },
        { primary: "Templates légaux", value: "12", secondary: "NDA, contrat, bail, etc." },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 8, items: [
        { primary: "Renouvellement contrat Boréal", value: "Urgent", valueColor: "text-red-600", secondary: "Expire: 30 avril", urgent: true, phase: "attention" },
        { primary: "Revue NDA partenaire", value: "Normal", valueColor: "text-blue-600", secondary: "AutomatePro", phase: "reflexion" },
        { primary: "Mise à jour politique PI", value: "Normal", valueColor: "text-blue-600", secondary: "Inventions employés" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Médiation litige", value: "14 avr.", secondary: "Avocat Me Tremblay", phase: "execution" },
        { primary: "Consultation PI", value: "18 avr.", secondary: "Brevet #2 — VITAA", phase: "reflexion" },
        { primary: "Assemblée annuelle", value: "30 avr.", secondary: "Résolutions + PV" },
      ]},
      { icon: FileText, title: "Contrats", count: 34, items: [
        { primary: "Contrats actifs", value: "34", secondary: "Clients + fournisseurs" },
        { primary: "Renouvellements Q2", value: "6", valueColor: "text-amber-600", secondary: "2 critiques — avril", phase: "attention" },
        { primary: "En négociation", value: "3", secondary: "Valeur: 280K$", phase: "execution" },
      ]},
    ],
  },

  CISOB: {
    deptLabel: "Sécurité",
    deptFullLabel: "de la sécurité",
    summary: "Cybersécurité, contrôle d'accès, gestion des incidents et conformité",
    vitaa: [
      { label: "Ventes", value: "87", delta: "/100 score", up: true, icon: TrendingUp },
      { label: "Idées", value: "0", delta: "incidents", up: true, icon: Sparkles },
      { label: "Temps", value: "100h", delta: "sécu/mois", up: true, icon: Clock },
      { label: "Argent", value: "420$", delta: "/employé", up: true, icon: DollarSign },
      { label: "Actifs", value: "52", delta: "comptes", up: true, icon: Activity },
    ],
    row1: [
      { icon: Bell, title: "Signaux", items: [
        { primary: "Ransomware PME", value: "Alerte", valueColor: "text-red-600", urgent: true, secondary: "Hausse +60% au Canada", phase: "attention" },
        { primary: "Zero Trust architecture", value: "Tendance", valueColor: "text-blue-600", secondary: "Adoption croissante PME" },
        { primary: "Loi 25 échéances", secondary: "Prochaine phase: septembre 2026" },
      ]},
      { icon: Lock, title: "Accès", items: [
        { primary: "Comptes actifs", value: "52", secondary: "47 employés + 5 services" },
        { primary: "MFA activé", pct: 94, pctColor: "bg-green-500", secondary: "49/52 comptes", phase: "retroaction" },
        { primary: "Revue accès", value: "Planifiée", valueColor: "text-blue-600", secondary: "Prochaine: 15 avril", phase: "reflexion" },
      ]},
      { icon: Bug, title: "Incidents", count: 0, items: [
        { primary: "Incidents ce mois", value: "0", valueColor: "text-green-600", secondary: "Aucun incident", phase: "retroaction" },
        { primary: "Tentatives bloquées", value: "127", secondary: "Firewall + rate limiting" },
        { primary: "Phishing détecté", value: "3", secondary: "Emails bloqués cette semaine" },
      ]},
    ],
    row2: [
      { icon: Shield, title: "Conformité", items: [
        { primary: "SOC 2 Type I", value: "En cours", valueColor: "text-blue-600", secondary: "Audit prévu Q3", phase: "execution" },
        { primary: "LPRPDE / Loi 25", pct: 90, pctColor: "bg-green-500", secondary: "Données personnelles", phase: "retroaction" },
        { primary: "Politique BYOD", value: "Active", valueColor: "text-green-600", secondary: "12 appareils gérés", phase: "retroaction" },
      ]},
      { icon: Bug, title: "Vulnérabilités", items: [
        { primary: "Critiques", value: "0", valueColor: "text-green-600", secondary: "Scan: 5 avril", phase: "retroaction" },
        { primary: "Élevées", value: "1", valueColor: "text-amber-600", secondary: "npm dependency — fix planifié", phase: "attention" },
        { primary: "Patch cadence", value: "48h", valueColor: "text-green-600", secondary: "Moyenne critique → déployé", phase: "retroaction" },
      ]},
      { icon: GraduationCap, title: "Formation", items: [
        { primary: "Sensibilisation sécu.", pct: 82, pctColor: "bg-green-500", secondary: "39/47 formés ce trimestre", phase: "execution" },
        { primary: "Score test phishing", pct: 88, pctColor: "bg-green-500", secondary: "Dernier test: mars", phase: "retroaction" },
        { primary: "Prochaine session", value: "22 avr.", secondary: "Nouvelles menaces IA" },
      ]},
    ],
    row3: [
      { icon: ListChecks, title: "Tâches", count: 10, items: [
        { primary: "Revue accès trimestrielle", value: "Urgent", valueColor: "text-red-600", secondary: "Échéance: 15 avril", urgent: true, phase: "attention" },
        { primary: "Patch npm dependency", value: "Normal", valueColor: "text-blue-600", secondary: "Vulnérabilité élevée", phase: "execution" },
        { primary: "Test backup restore", value: "Planifié", valueColor: "text-blue-600", secondary: "Test mensuel", phase: "creation" },
      ]},
      { icon: Calendar, title: "Agenda", items: [
        { primary: "Revue accès", value: "15 avr.", secondary: "Tous les comptes" },
        { primary: "Test intrusion", value: "20 avr.", secondary: "Pentest externe annuel" },
        { primary: "Formation phishing", value: "22 avr.", secondary: "Simulation mensuelle" },
      ]},
      { icon: ShieldCheck, title: "Posture sécurité", items: [
        { primary: "Score global", pct: 87, pctColor: "bg-green-500", secondary: "Dernière évaluation: 5 avril", phase: "retroaction" },
        { primary: "Politique sécurité", value: "V4", valueColor: "text-green-600", secondary: "Mise à jour: mars 2026", phase: "retroaction" },
        { primary: "Formation complétée", pct: 82, pctColor: "bg-green-500", secondary: "39/47 employés", phase: "execution" },
      ]},
    ],
  },

  // ══════════════════════════════════════════
  // ORBIT9 — Dashboard réseau collaboratif
  // Même pattern que les départements mais pour le réseau inter-entreprises
  // ══════════════════════════════════════════
  ORBIT9: {
    deptLabel: "Orbit9",
    deptFullLabel: "du réseau collaboratif",
    summary: "Tour de contrôle du réseau — cellules, jumelages, intelligence et économie collaborative",
    vitaa: [
      { label: "Cellules", value: "4", delta: "+1 ce mois", up: true, icon: Atom },
      { label: "Membres", value: "18", delta: "+3 ce trimestre", up: true, icon: Users },
      { label: "Matches", value: "7", delta: "+2 cette semaine", up: true, icon: Handshake },
      { label: "Score VITAA", value: "76%", delta: "+5 pts", up: true, icon: Activity },
      { label: "ROI Réseau", value: "59K$", delta: "+22% Q1", up: true, icon: TrendingUp },
    ],
    row1: [
      { icon: Bell, title: "Signaux & Alertes", count: 5, items: [
        { primary: "Score confiance MetalPro", value: "-8%", valueColor: "text-red-600", urgent: true, secondary: "Trust Engine — baisse détectée ce mois", phase: "attention" },
        { primary: "Contrat Cellule Ops", value: "Expire 30 avr.", valueColor: "text-amber-600", secondary: "Renouvellement requis — LogiTrans", phase: "attention" },
        { primary: "Ghost Delegate", value: "2 requêtes", valueColor: "text-blue-600", secondary: "Négociations en attente d'approbation", phase: "reflexion" },
      ]},
      { icon: Star, title: "Cellule vedette", items: [
        { primary: "Les Titans", value: "87%", valueColor: "text-green-600", secondary: "Score le plus élevé — 3 leads convertis", phase: "retroaction" },
        { primary: "ROI cellule", value: "12K$", valueColor: "text-emerald-600", secondary: "Ce trimestre — en hausse +18%", phase: "execution" },
        { primary: "Distinction", value: "Or", valueColor: "text-amber-600", secondary: "Badge confiance — 6 mois consécutifs", phase: "retroaction" },
      ]},
      { icon: Handshake, title: "Matches en cours", count: 3, items: [
        { primary: "Usine Bleue ↔ MetalPro", pct: 87, pctColor: "bg-green-500", secondary: "Automatisation — appel d'offres 2.1M$", phase: "execution" },
        { primary: "Usine Bleue ↔ TechFab", pct: 73, pctColor: "bg-blue-500", secondary: "Distribution équipements", phase: "reflexion" },
        { primary: "Cellule Ops ↔ LogiTrans", pct: 65, pctColor: "bg-amber-500", secondary: "Supply chain mutualisée", phase: "observation" },
      ]},
    ],
    row2: [
      { icon: Newspaper, title: "Fil d'activité", count: 8, items: [
        { primary: "3 leads qualifiés (Rich)", value: "Bot", valueColor: "text-blue-600", secondary: "Scoring automatique cette semaine", phase: "execution" },
        { primary: "Contrat Éco+ signé", value: "Humain", valueColor: "text-emerald-600", secondary: "Cellule Les Titans — 45K$", phase: "retroaction" },
        { primary: "Match Orbit9 trouvé", value: "B2B", valueColor: "text-violet-600", secondary: "Simone → Rich — score 87%", phase: "reflexion" },
      ]},
      { icon: HardHat, title: "Intelligence industrie", count: 5, items: [
        { primary: "Adoption IA manufacturing", value: "43%", valueColor: "text-green-600", secondary: "+39 pts depuis 2019 — STIQ/MEIE", phase: "retroaction" },
        { primary: "Programme Grand V (IQ)", value: "1 G$", valueColor: "text-blue-600", secondary: "225 projets financés en 5 mois", phase: "execution" },
        { primary: "Productivité QC", value: "65.90$/h", valueColor: "text-amber-600", secondary: "-10.5% vs Ontario — écart persistant", phase: "attention" },
      ]},
      { icon: Calendar, title: "Prochains événements", count: 4, items: [
        { primary: "Meetup Pionniers #1", value: "15 avr.", secondary: "Montréal — 9 participants", phase: "execution" },
        { primary: "Webinaire VITAA 101", value: "22 avr.", secondary: "Virtuel — 25 inscrits", phase: "creation" },
        { primary: "Hackathon Bot-to-Bot", value: "5 mai", secondary: "Hybride — Québec — 18 équipes", phase: "creation" },
      ]},
    ],
    row3: [
      { icon: Rocket, title: "Pionniers", count: 9, items: [
        { primary: "Sièges occupés", value: "3/9", valueColor: "text-blue-600", secondary: "33% rempli — 6 places restantes", phase: "execution" },
        { primary: "Prochaine cible", value: "Distrib.", valueColor: "text-amber-600", secondary: "Distributeur automatisation recherché", phase: "reflexion" },
        { primary: "Tarif pionnier", value: "1,350$/m", secondary: "Exclusivité sectorielle garantie", phase: "retroaction" },
      ]},
      { icon: DollarSign, title: "Économie réseau", items: [
        { primary: "Revenus générés", value: "47K$", valueColor: "text-emerald-600", secondary: "Ce trimestre — via cellules actives", phase: "retroaction" },
        { primary: "Coûts évités", value: "12K$", valueColor: "text-blue-600", secondary: "Mutualisation achats & ressources", phase: "retroaction" },
        { primary: "TimeTokens distribués", value: "2,340 UT", secondary: "+180 ce mois — économie active", phase: "execution" },
      ]},
      { icon: Bot, title: "Ghost Delegate", items: [
        { primary: "Statut agent", value: "Actif", valueColor: "text-green-600", secondary: "Pre-flight check: OK", phase: "execution" },
        { primary: "Négociations autonomes", value: "3", valueColor: "text-blue-600", secondary: "Ce mois — 2 conclues, 1 en cours", phase: "execution" },
        { primary: "Briefing matinal", value: "Prêt", valueColor: "text-green-600", secondary: "Prochain: 6h00 demain", phase: "retroaction" },
      ]},
    ],
  },
};

// 5 états de travail — boutons d'action sur chaque item
const WORK_ACTIONS: { key: PhaseKey; icon: React.ElementType; label: string; hover: string }[] = [
  { key: "discussion",  icon: MessageCircle, label: "Discussion",   hover: "hover:bg-blue-50 hover:text-blue-700" },
  { key: "reflexion",   icon: Brain,         label: "Réflexion",    hover: "hover:bg-orange-50 hover:text-orange-700" },
  { key: "creation",    icon: Hammer,        label: "Conception",   hover: "hover:bg-yellow-50 hover:text-yellow-700" },
  { key: "execution",   icon: Rocket,        label: "Exécution",    hover: "hover:bg-green-50 hover:text-green-700" },
  { key: "retroaction", icon: BarChart3,     label: "Rétroaction",  hover: "hover:bg-emerald-50 hover:text-emerald-700" },
];

/** Rollover unique — 5 boutons d'action. UN composant, ZÉRO silo.
 *  position="center" (défaut) = centré vertical (pour lignes de liste)
 *  position="top"            = coin haut-droit (pour cards hautes) */
function WorkActionsOverlay({ context, onAction, position = "center" }: { context: string; onAction: (phase: PhaseKey, ctx: string) => void; position?: "center" | "top" }) {
  return (
    <div className={cn(
      "hidden group-hover:flex items-center gap-1 absolute right-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 px-1 py-0.5 z-20",
      position === "center" ? "top-1/2 -translate-y-1/2" : "top-2"
    )}>
      {WORK_ACTIONS.map(wa => (
        <button
          key={wa.key}
          onClick={(e) => { e.stopPropagation(); onAction(wa.key, context); }}
          className={cn("p-1 rounded-md transition-colors cursor-pointer text-gray-700", wa.hover)}
          title={wa.label}
        >
          <wa.icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

// ── CockpitItemRow — Ligne d'item réutilisable (box grid + drill-down detail) ──
// Structure plate : <li group relative> → contenu + WorkActionsOverlay sibling direct
function CockpitItemRow({ item, index, onAction, showNumber }: {
  item: DashboardBlocItem;
  index: number;
  onAction?: (phase: PhaseKey, context: string) => void;
  showNumber?: boolean;
}) {
  const ps = item.phase ? PHASE_COLORS[item.phase] : null;
  return (
    <li className="group relative px-4 py-2 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2.5 text-xs text-gray-800">
        {showNumber && (
          <span className="text-[10px] font-bold text-white bg-gray-400 rounded-full w-5 h-5 flex items-center justify-center shrink-0">{index + 1}</span>
        )}
        {item.urgent && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Urgent" />}
        <div className="flex-1 min-w-0">
          {item.pct !== undefined ? (
            <>
              <div className="flex justify-between mb-0.5">
                <span className="font-medium">{item.primary}</span>
                <span className="font-bold">{item.pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", item.pctColor || "bg-blue-500")} style={{ width: `${item.pct}%` }} />
              </div>
              {item.secondary && <p className="text-[11px] text-gray-400 mt-0.5">{item.secondary}</p>}
            </>
          ) : item.value ? (
            <>
              <div className="flex justify-between">
                <span className="font-medium">{item.primary}</span>
                <span className={cn("font-bold", item.valueColor || "text-gray-700")}>{item.value}</span>
              </div>
              <p className="text-[11px] text-gray-400">{item.secondary}</p>
            </>
          ) : (
            <>
              <span className="font-medium">{item.primary}</span>
              {item.secondary && <p className="text-[11px] text-gray-400">{item.secondary}</p>}
            </>
          )}
        </div>
        {ps && (
          <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", ps.badge)}>
            <span className={cn("w-2 h-2 rounded-full", ps.dot)} />
            {ps.label}
          </span>
        )}
      </div>
      {onAction && <WorkActionsOverlay context={item.primary} onAction={onAction} />}
    </li>
  );
}

// ── CockpitCard — Pattern Playbook Store card (box dans la grid 2 cols) ──
// Pas de overflow-hidden sur le wrapper → WorkActionsOverlay visible
function CockpitCard({ config, onAction, onHeaderClick }: {
  config: DashboardBlocConfig;
  onAction?: (phase: PhaseKey, context: string) => void;
  onHeaderClick?: () => void;
}) {
  const Icon = config.icon;
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
      <div
        className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl", onHeaderClick && "cursor-pointer hover:bg-[#00B4D8]/20 transition-colors")}
        onClick={onHeaderClick}
      >
        <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
        <span className="text-sm font-bold text-gray-900 flex-1 truncate">{config.title}</span>
        {config.count !== undefined && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{config.count}</span>
        )}
        {onHeaderClick && <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
      </div>
      <ul className="py-1">
        {config.items.map((item, i) => (
          <CockpitItemRow key={i} item={item} index={i} onAction={onAction} />
        ))}
      </ul>
    </div>
  );
}

// ── CockpitSignalCard — Card vedette gradient "À porter attention" ──
// group relative sur le div principal, WorkActionsOverlay sibling direct, PAS de overflow-hidden
function CockpitSignalCard({ item, onAction }: {
  item: DashboardBlocItem;
  onAction?: (phase: PhaseKey, context: string) => void;
}) {
  const tag = getSignalTag(item);
  const ps = item.phase ? PHASE_COLORS[item.phase] : null;
  return (
    <div className={cn("group relative rounded-xl p-4 hover:shadow-lg transition-shadow bg-gradient-to-r", getSignalGradient(item))}>
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        {item.urgent && <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />}
        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", tag.classes)}>{tag.label}</span>
        {ps && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            {ps.label}
          </span>
        )}
      </div>
      <h4 className="text-sm font-bold text-white leading-tight">{item.primary}</h4>
      <p className="text-[9px] text-white/80 mt-1.5 leading-relaxed">{item.secondary}</p>
      {onAction && <WorkActionsOverlay context={item.primary} onAction={onAction} position="top" />}
    </div>
  );
}

// ── CockpitSectionHeader — Header de section (exact Playbook Store) ──
function CockpitSectionHeader({ icon: Icon, title, count, color = "text-amber-500" }: {
  icon: React.ElementType;
  title: string;
  count?: number;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
        <Icon className={cn("h-3.5 w-3.5", color)} /> {title}
      </h3>
      {count !== undefined && <span className="text-[9px] text-gray-400">{count}</span>}
    </div>
  );
}

// DashboardBloc legacy + DeptDashboardView — RETIRÉS (remplacés par CockpitView)

// ══════════════════════════════════════════
// COCKPIT STORE VIEW — Template Playbook Store appliquée au Dashboard
// Carl vocal 14h07: sidebar = par département, grid = 2 cols, click = drill-down,
//                   garder WORK_ACTIONS hover, pas de header compact dupliqué
// ══════════════════════════════════════════

const DEPT_ORDER = ["CEOB", "CTOB", "CFOB", "CMOB", "CSOB", "COOB", "CPOB", "CHROB", "CINOB", "CROB", "CLOB", "CISOB"];

// 2 boxes supplémentaires par département pour le Cockpit (10 boxes total)
// Carl: "je veux toujours 10 box sur les vues d'ensemble de chaque département"
const COCKPIT_EXTRA_BLOCS: Record<string, DashboardBlocConfig[]> = {
  CEOB: [
    { icon: Rocket, title: "Projets stratégiques", count: 5, items: [
      { primary: "Brain Team V2", pct: 65, pctColor: "bg-blue-500", secondary: "Plateforme IA pour PME", phase: "execution" },
      { primary: "Expansion Laval", pct: 40, pctColor: "bg-amber-500", secondary: "Ouverture Q3 2026", phase: "execution" },
      { primary: "Certification ISO", pct: 85, pctColor: "bg-green-500", secondary: "Audit planifié avril", phase: "retroaction" },
    ]},
    { icon: MessageCircle, title: "Communications", count: 4, items: [
      { primary: "Communiqué presse", value: "En prep.", valueColor: "text-blue-600", secondary: "Lancement Brain Team", phase: "creation" },
      { primary: "Newsletter interne", value: "Envoyée", valueColor: "text-green-600", secondary: "Mars — 94% ouverture", phase: "retroaction" },
      { primary: "Présentation CA", value: "12 avr.", secondary: "Résultats Q1 + stratégie", phase: "creation" },
    ]},
  ],
  CTOB: [
    { icon: Cpu, title: "Architecture", items: [
      { primary: "Migration microservices", pct: 35, pctColor: "bg-violet-500", secondary: "Phase 1 — API Gateway", phase: "execution" },
      { primary: "Cache Redis", value: "Actif", valueColor: "text-green-600", secondary: "Hit rate: 89%", phase: "retroaction" },
      { primary: "WebSocket pipeline", pct: 90, pctColor: "bg-green-500", secondary: "Real-time events", phase: "retroaction" },
    ]},
    { icon: FileText, title: "Documentation", count: 12, items: [
      { primary: "API docs", pct: 72, pctColor: "bg-blue-500", secondary: "38/52 endpoints documentés", phase: "execution" },
      { primary: "Runbooks ops", value: "8", secondary: "Procédures incident", phase: "retroaction" },
      { primary: "Architecture Decision Records", value: "14", secondary: "Depuis Q1 2026", phase: "retroaction" },
    ]},
  ],
  CFOB: [
    { icon: Banknote, title: "Comptes payables", count: 18, items: [
      { primary: "À payer", value: "142K$", valueColor: "text-amber-600", secondary: "18 factures en attente" },
      { primary: "Retard >30j", value: "0", valueColor: "text-green-600", secondary: "Aucun retard fournisseur", phase: "retroaction" },
      { primary: "Prochains paiements", value: "15 avr.", secondary: "Fournisseurs majeurs — 67K$", phase: "execution" },
    ]},
    { icon: Building2, title: "Immobilisations", items: [
      { primary: "Valeur nette", value: "890K$", secondary: "Équipements + bâtiment" },
      { primary: "Amortissement Q1", value: "34K$", secondary: "Linéaire — selon plan" },
      { primary: "Investissements prévus", value: "120K$", valueColor: "text-blue-600", secondary: "CNC + robot Q2", phase: "reflexion" },
    ]},
  ],
  CMOB: [
    { icon: Crown, title: "Image de marque", items: [
      { primary: "Notoriété assistée", pct: 28, pctColor: "bg-pink-500", secondary: "Secteur manufacturier QC", phase: "execution" },
      { primary: "Mentions presse", value: "4", secondary: "Ce trimestre — Les Affaires, Info Industrie" },
      { primary: "Perception marque", value: "Positive", valueColor: "text-green-600", secondary: "Sondage Q1 — 82% favorable", phase: "retroaction" },
    ]},
    { icon: Calendar, title: "Événements", count: 5, items: [
      { primary: "Petit-déjeuner REAI", value: "24 avr.", secondary: "Présentation Brain Team", phase: "execution" },
      { primary: "Webinaire VITAA", value: "22 avr.", secondary: "40 inscrits — record", phase: "creation" },
      { primary: "Salon manufacturier", value: "8-9 mai", secondary: "Kiosque réservé — Montréal" },
    ]},
  ],
  CSOB: [
    { icon: Eye, title: "SWOT", items: [
      { primary: "Forces", value: "8", valueColor: "text-green-600", secondary: "IA+Humain, réseau REAI, Brain Team" },
      { primary: "Faiblesses", value: "4", valueColor: "text-amber-600", secondary: "Scale, dépendance Carl, cash" },
      { primary: "Opportunités", value: "6", valueColor: "text-blue-600", secondary: "Nearshoring, IA manuf, Orbit9" },
    ]},
    { icon: Network, title: "Veille stratégique", items: [
      { primary: "Rapports ce mois", value: "3", secondary: "Concurrence + marché + techno" },
      { primary: "Sources actives", value: "24", secondary: "CEFRIO, McKinsey, STIQ, etc." },
      { primary: "Prochaine publication", value: "12 avr.", secondary: "Analyse impact tarifs US", phase: "execution" },
    ]},
  ],
  COOB: [
    { icon: Package, title: "Inventaire", items: [
      { primary: "Valeur totale", value: "520K$", secondary: "Matières + produits finis" },
      { primary: "Rotation", value: "6x/an", valueColor: "text-green-600", secondary: "Au-dessus de la cible 5x" },
      { primary: "Items sous seuil", value: "2", valueColor: "text-red-600", secondary: "Aluminium + joints", phase: "attention" },
    ]},
    { icon: GraduationCap, title: "Formation SST", items: [
      { primary: "Employés formés", pct: 92, pctColor: "bg-green-500", secondary: "43/47 — CNESST à jour", phase: "retroaction" },
      { primary: "Prochaine session", value: "15 avr.", secondary: "Nouveaux employés — 3h" },
      { primary: "Incidents YTD", value: "0", valueColor: "text-green-600", secondary: "Zéro accident — 148 jours", phase: "retroaction" },
    ]},
  ],
  CPOB: [
    { icon: ClipboardCheck, title: "Planification", items: [
      { primary: "Carnet commandes", value: "18", secondary: "6 semaines de production" },
      { primary: "Charge prochaine sem.", pct: 88, pctColor: "bg-green-500", secondary: "3 lignes — capacité OK" },
      { primary: "Délai livraison moy.", value: "8.5j", secondary: "Cible: 7 jours", phase: "reflexion" },
    ]},
    { icon: Cog, title: "Outillage", count: 6, items: [
      { primary: "Outils en service", value: "48", secondary: "12 CNC + 36 manuels" },
      { primary: "Maintenance préventive", value: "4", secondary: "Ce mois — calendrier OK", phase: "execution" },
      { primary: "Remplacement prévu", value: "2", valueColor: "text-amber-600", secondary: "Perceuse #3 + fraise #7", phase: "reflexion" },
    ]},
  ],
  CHROB: [
    { icon: Award, title: "Rétention", items: [
      { primary: "Taux rétention", pct: 92, pctColor: "bg-green-500", secondary: "12 derniers mois", phase: "retroaction" },
      { primary: "Départs prévisibles", value: "1", valueColor: "text-amber-600", secondary: "Retraite — usinage", phase: "reflexion" },
      { primary: "Plan succession", pct: 60, pctColor: "bg-blue-500", secondary: "Postes clés couverts 6/10", phase: "execution" },
    ]},
    { icon: Heart, title: "Santé & bien-être", items: [
      { primary: "Programme PAE", value: "Actif", valueColor: "text-green-600", secondary: "Utilisation: 12% employés", phase: "retroaction" },
      { primary: "Jours maladie moy.", value: "3.2/an", secondary: "Sous la moyenne industrie (5.1)" },
      { primary: "Activités sociales", value: "2", secondary: "Ce mois — 5à7 + yoga", phase: "execution" },
    ]},
  ],
  CINOB: [
    { icon: Rocket, title: "Prototypes", count: 2, items: [
      { primary: "CarlOS v2 prototype", pct: 65, pctColor: "bg-rose-500", secondary: "Tests internes en cours", phase: "execution" },
      { primary: "Capteur IoT v1", pct: 30, pctColor: "bg-blue-500", secondary: "Ligne A — proof of concept", phase: "reflexion" },
      { primary: "Vision qualité", pct: 15, pctColor: "bg-amber-500", secondary: "Phase recherche", phase: "creation" },
    ]},
    { icon: Newspaper, title: "Publications", items: [
      { primary: "Article IA manuf.", value: "Publié", valueColor: "text-green-600", secondary: "Info Industrie — mars 2026", phase: "retroaction" },
      { primary: "Rapport RS&DE", value: "En prep.", valueColor: "text-blue-600", secondary: "Deadline: 15 avril", phase: "creation" },
      { primary: "White paper BTML", value: "Draft", valueColor: "text-amber-600", secondary: "Framework propriétaire", phase: "creation" },
    ]},
  ],
  CROB: [
    { icon: Database, title: "CRM", items: [
      { primary: "Contacts totaux", value: "1,247", secondary: "Base de données complète" },
      { primary: "Fiches à jour", pct: 78, pctColor: "bg-blue-500", secondary: "968/1247 — mise à jour Q1", phase: "execution" },
      { primary: "Score engagement", pct: 62, pctColor: "bg-amber-500", secondary: "Moyenne des leads actifs", phase: "reflexion" },
    ]},
    { icon: GraduationCap, title: "Formation ventes", items: [
      { primary: "Heures formation Q1", value: "48h", secondary: "CRM + techniques vente" },
      { primary: "Certification produit", pct: 85, pctColor: "bg-green-500", secondary: "Équipe formée sur nouveautés", phase: "retroaction" },
      { primary: "Coaching terrain", value: "3/mois", secondary: "Accompagnement actif", phase: "execution" },
    ]},
  ],
  CLOB: [
    { icon: ShieldCheck, title: "Assurances", items: [
      { primary: "Couverture totale", value: "5M$", secondary: "RC pro + biens + D&O" },
      { primary: "Renouvellement", value: "1 juil.", secondary: "Négociation courtier en cours", phase: "reflexion" },
      { primary: "Réclamations actives", value: "0", valueColor: "text-green-600", secondary: "Aucune réclamation", phase: "retroaction" },
    ]},
    { icon: Search, title: "Veille juridique", items: [
      { primary: "Changements réglementaires", value: "3", secondary: "Loi C-27, Loi 96, droit travail" },
      { primary: "Impact estimé", value: "Modéré", valueColor: "text-amber-600", secondary: "Conformité requise 2026-2027" },
      { primary: "Prochain bulletin", value: "15 avr.", secondary: "Résumé mensuel", phase: "execution" },
    ]},
  ],
  CISOB: [
    { icon: Database, title: "Backups", items: [
      { primary: "Dernier backup", value: "6 avr. 3h", valueColor: "text-green-600", secondary: "Automatique — VPS2 Guardian" },
      { primary: "Rétention", value: "30 jours", secondary: "Rotation automatique" },
      { primary: "Test restore", value: "OK", valueColor: "text-green-600", secondary: "Dernier: 1 avril", phase: "retroaction" },
    ]},
    { icon: Globe, title: "Réseau", items: [
      { primary: "Firewall rules", value: "24", secondary: "UFW — deny default" },
      { primary: "IPs bloquées", value: "847", secondary: "Ce mois — auto-ban fail2ban" },
      { primary: "Ports ouverts", value: "3", valueColor: "text-green-600", secondary: "2222, 80, 443 uniquement", phase: "retroaction" },
    ]},
  ],
};

function CockpitBlocDetail({ config, deptLabel, deptGradient, onBack, onAction }: {
  config: DashboardBlocConfig;
  deptLabel: string;
  deptGradient: string;
  onBack: () => void;
  onAction?: (phase: PhaseKey, context: string) => void;
}) {
  const Icon = config.icon;
  const urgentCount = config.items.filter(it => it.urgent).length;
  const withPhase = config.items.filter(it => it.phase);
  const phaseDistrib = withPhase.reduce((acc, it) => { if (it.phase) acc[it.phase] = (acc[it.phase] || 0) + 1; return acc; }, {} as Record<string, number>);
  const avgPct = config.items.filter(it => it.pct !== undefined).length > 0
    ? Math.round(config.items.filter(it => it.pct !== undefined).reduce((a, it) => a + (it.pct || 0), 0) / config.items.filter(it => it.pct !== undefined).length)
    : null;

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
        <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Retour à la vue d&apos;ensemble
      </button>

      {/* Hero compact + Stats inline */}
      <div className={cn("relative bg-gradient-to-r rounded-xl overflow-hidden shadow-sm", deptGradient)}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white leading-tight flex items-center gap-2">
              <Icon className="h-5 w-5 text-white shrink-0" />
              {config.title}
            </h3>
            <span className="text-[10px] text-white/60 font-medium">{deptLabel}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] text-white/80"><ListChecks className="h-3.5 w-3.5" />{config.items.length} éléments</span>
            {config.count !== undefined && <span className="flex items-center gap-1 text-[10px] text-white/80"><Activity className="h-3.5 w-3.5" />{config.count} total</span>}
            {urgentCount > 0 && <span className="flex items-center gap-1 text-[10px] font-bold text-white"><AlertTriangle className="h-3.5 w-3.5" />{urgentCount} urgent{urgentCount > 1 ? "s" : ""}</span>}
            {avgPct !== null && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/15 text-white">{avgPct}% moy.</span>}
            {Object.entries(phaseDistrib).map(([phase, count]) => {
              const pc = PHASE_COLORS[phase as PhaseKey];
              return pc ? (
                <span key={phase} className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1", pc.badge)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", pc.dot)} />
                  {pc.label} ({count})
                </span>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Liste détaillée — réutilise CockpitItemRow avec numéros */}
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
        <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl")}>
          <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900 flex-1 truncate">Éléments — {config.title}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">{config.items.length} items</span>
        </div>
        <ul className="divide-y divide-gray-100">
          {config.items.map((item, i) => (
            <CockpitItemRow key={i} item={item} index={i} onAction={onAction} showNumber />
          ))}
        </ul>
      </div>
    </div>
  );
}

// Gradient colors for signal vedette cards based on urgency/type
function getSignalGradient(item: DashboardBlocItem): string {
  if (item.urgent || item.value === "Alerte") return "from-red-600 to-red-500";
  if (item.value === "Nouveau") return "from-emerald-600 to-emerald-500";
  if (item.value === "Tendance" || item.value === "Info" || item.value === "Stable" || item.value === "Suivi") return "from-blue-600 to-blue-500";
  if (item.value === "Étude" || item.value === "Requis") return "from-amber-600 to-amber-500";
  return "from-slate-600 to-slate-500";
}

// Tag label + style for signal vedette cards — consistent across all departments
function getSignalTag(item: DashboardBlocItem): { label: string; classes: string } {
  if (item.urgent || item.value === "Alerte") return { label: "Alerte", classes: "bg-red-400/30 text-white" };
  if (item.value === "Nouveau") return { label: "Opportunité", classes: "bg-emerald-400/30 text-white" };
  if (item.value === "Tendance") return { label: "Tendance", classes: "bg-sky-400/30 text-white" };
  if (item.value === "Info" || item.value === "Stable" || item.value === "Suivi") return { label: "Veille", classes: "bg-sky-400/30 text-white" };
  if (item.value === "Étude" || item.value === "Requis") return { label: "À suivre", classes: "bg-amber-400/30 text-white" };
  return { label: "Veille", classes: "bg-white/15 text-white" };
}

export function CockpitView({ embedded = false, onAction, initialDept = "CEOB" }: { embedded?: boolean; onAction?: (phase: string, context: string) => void; initialDept?: string }) {
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [selectedBloc, setSelectedBloc] = useState<DashboardBlocConfig | null>(null);

  // Sync quand le bot change depuis l'extérieur
  useEffect(() => { setSelectedDept(initialDept); setSelectedBloc(null); }, [initialDept]);
  const config = DEPT_DASHBOARD_SECTIONS[selectedDept] || DEPT_DASHBOARD_SECTIONS.CEOB;
  const DeptIcon = DEPT_DASH_ICON[selectedDept] || Zap;
  const deptLabel = DEPT_SHORT_LABEL[selectedDept] || "Direction";
  const gradient = DEPT_GRADIENT[selectedDept] || DEPT_GRADIENT.CEOB;
  const handleAction = onAction as ((phase: PhaseKey, context: string) => void) | undefined;

  // Signaux = row1[0] → bande vedette. Reste = 8 boxes + 2 extras = 10 boxes.
  const signalItems = config.row1[0]?.items || [];
  const gridBlocs = [
    ...config.row1.slice(1),
    ...config.row2,
    ...config.row3,
    ...(COCKPIT_EXTRA_BLOCS[selectedDept] || []),
  ];

  const Wrapper = embedded ? "div" : PageLayout;
  const wrapperProps = embedded ? { className: "space-y-3" } : { maxWidth: "5xl" as const };

  return (
    <Wrapper {...wrapperProps as any}>
      {/* Hero — Living Heroes V20 Cockpit */}
      <LivingHero
        blur1="bg-blue-100" blur2="bg-cyan-100/50"
        subtitleColor="text-blue-600" subtitle="Tableau de bord"
        title="Tout voir d'un coup d'oeil."
        description="Vos chiffres clés, alertes et signaux importants. Décidez vite, décidez bien."
      >
        <div className="relative w-[360px] h-[140px]">
          <div className="absolute right-[10px] bottom-[-20px] w-40 h-40 opacity-40">
            <svg viewBox="0 0 100 100" className="w-full h-full text-blue-400"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4"/><circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5"/><circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2"/><line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/><line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/><g className="anim-radar"><path d="M50 50 L50 5 A45 45 0 0 1 95 50 Z" fill="url(#radar-grad-ck)"/></g><defs><radialGradient id="radar-grad-ck" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/><stop offset="100%" stopColor="currentColor" stopOpacity="0"/></radialGradient></defs></svg>
          </div>
          <div className="glass-base absolute right-[60px] top-[10px] w-64 h-40 p-5 border-blue-100">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest" style={{fontFamily:'ui-monospace,monospace'}}>Vitesse de croissance</h4>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /><span className="text-[9px] font-bold text-blue-500 tracking-wider">EN DIRECT</span></div>
            </div>
            <div className="absolute inset-x-5 top-12 bottom-6 flex flex-col justify-between opacity-20"><div className="w-full h-px bg-blue-300" /><div className="w-full h-px bg-blue-300" /><div className="w-full h-px bg-blue-300" /></div>
            <div className="relative flex items-end justify-between gap-3 h-[60px] w-full mt-2">
              <div className="w-8 bg-gradient-to-t from-blue-100 to-blue-300 rounded-sm anim-bar-1" style={{height:'30%'}} />
              <div className="w-8 bg-gradient-to-t from-blue-100 to-blue-400 rounded-sm anim-bar-2" style={{height:'50%'}} />
              <div className="w-8 bg-gradient-to-t from-cyan-200 to-cyan-400 rounded-t-sm shadow-[0_0_15px_rgba(34,211,238,0.4)] anim-bar-3 relative" style={{height:'80%'}}><div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-white rounded-full" /></div>
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100"><path d="M 10 70 Q 50 60 90 20" fill="none" stroke="url(#line-grad-ck)" strokeWidth="3" strokeLinecap="round" className="anim-curve"/><defs><linearGradient id="line-grad-ck" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#2dd4bf"/></linearGradient></defs></svg>
            </div>
          </div>
        </div>
      </LivingHero>

      {/* VITAA 5 piliers */}
      <div className="grid grid-cols-5 gap-3">
        {config.vitaa.map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 shadow-sm bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
              <kpi.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">{kpi.label}</span>
            </div>
            <div className="px-4 py-3">
              <div className="text-2xl font-bold text-gray-800">{kpi.value}</div>
              <div className={cn("text-xs flex items-center gap-1 mt-0.5", kpi.up ? "text-emerald-600" : "text-red-500")}>
                {kpi.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {kpi.delta}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bande vedette — CockpitSignalCard */}
      {signalItems.length > 0 && (
        <div>
          <CockpitSectionHeader icon={AlertTriangle} title="À porter attention" count={signalItems.length} />
          <div className="grid grid-cols-3 gap-3">
            {signalItems.map((item, i) => (
              <CockpitSignalCard key={i} item={item} onAction={handleAction} />
            ))}
          </div>
        </div>
      )}

      {/* Sidebar départements + Contenu */}
      <div className="flex gap-3">
        {/* Sidebar départements — CEOB seulement (poupée russe: Direction voit tout, autres = scopé) */}
        {initialDept === "CEOB" && (
        <div className={cn("w-[180px] shrink-0 space-y-0.5 transition-all", selectedBloc && "pt-8")}>
          {DEPT_ORDER.map(code => {
            const isActive = selectedDept === code;
            const Icon = DEPT_DASH_ICON[code] || Zap;
            const label = DEPT_SHORT_LABEL[code] || code;
            const deptConfig = DEPT_DASHBOARD_SECTIONS[code];
            const extras = COCKPIT_EXTRA_BLOCS[code] || [];
            const itemCount = deptConfig ? [...deptConfig.row1.slice(1), ...deptConfig.row2, ...deptConfig.row3, ...extras].reduce((acc, b) => acc + b.items.length, 0) : 0;
            return (
              <button
                key={code}
                onClick={() => { setSelectedDept(code); setSelectedBloc(null); }}
                className={cn(
                  "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                  isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-blue-500" : "text-gray-400")} />
                  <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-700")}>{label}</span>
                  <span className="text-[9px] text-gray-400">{itemCount}</span>
                </div>
              </button>
            );
          })}
        </div>
        )}

        {/* Contenu — CockpitCard grid 2 cols OU drill-down CockpitBlocDetail */}
        <div className="flex-1 min-w-0 space-y-3">
          {selectedBloc ? (
            <CockpitBlocDetail config={selectedBloc} deptLabel={deptLabel} deptGradient={gradient} onBack={() => setSelectedBloc(null)} onAction={handleAction} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {gridBlocs.map((bloc, i) => (
                <CockpitCard key={i} config={bloc} onAction={handleAction} onHeaderClick={() => setSelectedBloc(bloc)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

// ══════════════════════════════════════════
// COMPOSANT PRINCIPAL — Layout DocForge (Sidebar TOC + Contenu)
// ══════════════════════════════════════════

interface BlueprintViewProps {
  botCode: string;
  headerGradient: string;
  sizeTier?: SizeTier;
  /** Quand true, le header gradient interne est caché (intégré dans la top barre parent) */
  hideHeader?: boolean;
  /** State lifté: vue active (blueprint/ca/comites/personnel/bot) contrôlée par le parent */
  activeHeaderView?: HeaderView;
  /** Callback quand l'utilisateur change de sous-tab */
  onHeaderViewChange?: (view: HeaderView) => void;
  /** Callback pour remonter tier + score au parent */
  onStats?: (stats: { tier: string; tierLabel: string; score: number }) => void;
  /** Quand true, applique le style V2 (pattern Cockpit/Playbook Store) */
  useV2Style?: boolean;
  /** Quand true, rend SEULEMENT le contenu (grille sections + drill-down), sans sidebar/hero/KPIs */
  contentOnly?: boolean;
  /** Section active forcée depuis le parent (utilisé avec contentOnly pour synchroniser sidebar parent) */
  activeSectionId?: string;
}

export type HeaderView = "blueprint" | "ca" | "comites" | "personnel" | "bot";

export const BLUEPRINT_HEADER_TABS: { key: HeaderView; label: string; icon: React.ElementType; ceoOnly?: boolean }[] = [
  { key: "blueprint", label: "Direction", icon: Zap },
  { key: "ca", label: "CA", icon: Users, ceoOnly: true },
  { key: "comites", label: "Comités", icon: GitBranch },
  { key: "personnel", label: "Personnel", icon: User },
  { key: "bot", label: "Brain Team", icon: Bot },
];

export function BlueprintView({ botCode, headerGradient, sizeTier: propTier, hideHeader, activeHeaderView, onHeaderViewChange, onStats, useV2Style, contentOnly, activeSectionId }: BlueprintViewProps) {
  const config = getBlueprintConfig(botCode);
  const { dispatch } = useCanvasActions();
  const [tier, setTier] = useState<SizeTier>(propTier || "T2");
  const [phase, setPhase] = useState<Phase>("startup");
  const [headerViewLocal, setHeaderViewLocal] = useState<HeaderView>("blueprint");
  const headerView = activeHeaderView ?? headerViewLocal;
  const setHeaderView = onHeaderViewChange ?? setHeaderViewLocal;
  const [activeSub, setActiveSub] = useState<string>("");
  const [data, setData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sectionGridView, setSectionGridView] = useState(true);
  // Département sélectionné dans la section "Départements" (sidebar) — null = pas de drill-down dept
  const [selectedDeptCode, setSelectedDeptCode] = useState<string | null>(null);
  // Sous-section active du département sélectionné (indépendant de activeSub qui est pour Direction)
  const [selectedDeptSub, setSelectedDeptSub] = useState<string | undefined>(undefined);
  // Départements expandés dans la sidebar (accordion, même pattern que Data Room)
  const [expandedBpDepts, setExpandedBpDepts] = useState<Set<string>>(new Set());

  // Synchroniser activeSub avec activeSectionId (prop parent → contentOnly mode)
  useEffect(() => {
    if (activeSectionId) {
      setActiveSub(activeSectionId);
      setSectionGridView(false);
    }
  }, [activeSectionId]);

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

  const openInAtelier = (section: SubSectionDef) => {
    dispatch({
      layer: "focus",
      type: "focus",
      bot: botCode,
      data: {
        title: section.label,
        element_type: "blueprint_section",
        data: {
          canvasKey: `blueprint_${botCode}`,
          botCode,
          sectionId: section.id,
          sectionLabel: section.label,
          sectionDescription: section.description,
          sectionIntro: section.intro,
        },
      },
    });
  };

  if (!config) return <p className="text-xs text-gray-400 text-center py-8">Configuration Blueprint non disponible pour {botCode}</p>;

  // Filtrer CA et comités hors de la sidebar (CEOB seulement — ils ont leurs propres boutons header)
  const allVisibleSections = getVisibleSubSections(config, tier);
  const HEADER_SECTION_IDS = botCode === "CEOB" ? ["conseil_administration"] : [];
  const visibleSections = allVisibleSections.filter(s => !HEADER_SECTION_IDS.includes(s.id) && !s.id.startsWith("playbooks_"));
  const caSection = allVisibleSections.find(s => s.id === "conseil_administration");
  const activeSection = visibleSections.find(s => s.id === activeSub) || visibleSections[0];
  const completionScore = calculateCompletionScore(config, tier, data as Record<string, unknown>);

  useEffect(() => {
    if (onStats) {
      const tierInfo = SIZE_TIERS.find(t => t.id === tier);
      onStats({ tier, tierLabel: tierInfo?.label || tier, score: completionScore });
    }
  }, [tier, completionScore, onStats]);

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  // Calcul progression par section pour la sidebar
  const sectionProgress = (section: SubSectionDef) => {
    const sectionFields = getFieldsForTier(section.fields, tier);
    const filled = sectionFields.filter(f => {
      const v = data[`${section.id}.${f.id}`];
      return v !== undefined && v !== "" && v !== "[]";
    }).length;
    const total = sectionFields.length;
    return total > 0 ? Math.round((filled / total) * 100) : (section.kpis.length > 0 ? 0 : 100);
  };

  // ═══ MODE CONTENT ONLY — Rend SEULEMENT le contenu (grille sections + drill-down), pas de sidebar/hero/KPIs ═══
  if (contentOnly) {
    const coActiveSection = visibleSections.find(s => s.id === activeSub) || visibleSections[0];
    const coSectionGridView = !activeSectionId; // Grille si pas de section forcée

    return (
      <div className="space-y-3">
        {coSectionGridView ? (
          /* Grille de sections avec % complétion — même pattern que le mode normal */
          <div className="grid grid-cols-2 gap-3">
            {visibleSections.filter(s => s.id !== "vue_consolidee").map(section => {
              const SIcon = resolveIcon(section.icon);
              const pct = sectionProgress(section);
              const fields = getFieldsForTier(section.fields, tier);
              const filled = fields.filter(f => { const v = data[`${section.id}.${f.id}`]; return v !== undefined && v !== "" && v !== "[]"; }).length;
              return (
                <div key={section.id} className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
                  <div
                    className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl cursor-pointer hover:bg-[#00B4D8]/20 transition-colors"
                    onClick={() => { setActiveSub(section.id); }}
                  >
                    <SIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                    <span className="text-sm font-bold text-gray-900 flex-1 truncate">{section.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{pct}%</span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{section.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[9px] text-gray-400">{filled}/{fields.length}</span>
                    </div>
                    <PertinenceBadge p={section.pertinence[tier]} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : coActiveSection && (
          /* Drill-down section — même pattern que le mode normal */
          <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
              {(() => { const Icon = resolveIcon(coActiveSection.icon); return <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />; })()}
              <span className="text-sm font-bold text-gray-900 flex-1 truncate">{coActiveSection.label}</span>
              <button onClick={(e) => { e.stopPropagation(); openInAtelier(coActiveSection); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer bg-[#00B4D8]/15 text-[#00B4D8] hover:bg-[#00B4D8]/25"
                title="Ouvrir dans l'Atelier">
                <PenLine className="h-3.5 w-3.5" /> Atelier
              </button>
              <PertinenceBadge p={coActiveSection.pertinence[tier]} />
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-gray-600 font-medium leading-relaxed">{coActiveSection.description}</p>
              {coActiveSection.intro && (
                <div className="mt-2 flex items-start gap-2 bg-white/60 rounded-lg px-3 py-2 border border-blue-100/50">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-[9px] text-gray-500 leading-relaxed">{coActiveSection.intro}</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100">
              <SubSectionContent section={coActiveSection} tier={tier} data={data} onFieldChange={handleFieldChange} onSave={handleSave} saving={saving} dirty={dirty} />
              <CrossReferencePanel botCode={botCode} sectionId={coActiveSection.id} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* HEADER — caché quand hideHeader (intégré dans top barre parent) */}
      {!hideHeader && (
        <div className={cn("bg-gradient-to-r rounded-xl px-4 py-3 transition-all duration-300", headerGradient)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Layers className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Blueprint — {
                  headerView === "blueprint" ? config.deptLabel :
                  headerView === "ca" ? "Conseil d'administration" :
                  headerView === "comites" ? "Comités" :
                  headerView === "personnel" ? "Personnel" :
                  headerView === "bot" ? "Brain Team" :
                  config.deptLabel
                }</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-white/60">{SIZE_TIERS.find(t => t.id === tier)?.label} · {PHASES.find(p => p.id === phase)?.emoji} {PHASES.find(p => p.id === phase)?.label}</span>
                  <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">{completionScore}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-wrap justify-end">
              {BLUEPRINT_HEADER_TABS.filter(t => !t.ceoOnly || botCode === "CEOB").map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setHeaderView(tab.key)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer",
                    headerView === tab.key
                      ? "bg-white/25 text-white shadow-sm"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.key === "blueprint" ? config.deptLabel : tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VUE CA — Conseil d'administration */}
      {headerView === "ca" && (
        <ConseilAdminManager
          headerGradient={headerGradient}
          data={data}
          onFieldChange={handleFieldChange}
          onSave={handleSave}
          saving={saving}
          dirty={dirty}
        />
      )}

      {/* VUE COMITÉS — Gestion des comités par département */}
      {headerView === "comites" && (
        <ComitesManager
          botCode={botCode}
          deptLabel={config.deptLabel}
          headerGradient={headerGradient}
          data={data}
          onFieldChange={handleFieldChange}
          onSave={handleSave}
          saving={saving}
          dirty={dirty}
        />
      )}

      {/* VUE PERSONNEL — Blueprint Personnel du dirigeant */}
      {headerView === "personnel" && (
        <BlueprintPersonnel botCode={botCode} headerGradient={headerGradient} data={data} onFieldChange={handleFieldChange} onSave={handleSave} saving={saving} dirty={dirty} tier={tier} />
      )}

      {/* VUE BOT — Blueprint de l'Agent IA */}
      {headerView === "bot" && (
        <BlueprintBot botCode={botCode} headerGradient={headerGradient} />
      )}

      {/* LAYOUT DOCFORGE — Sidebar TOC + Contenu (pattern SectionView standard) */}
      {headerView === "blueprint" && (
        <div className="space-y-3">
          {/* Hero — Living Heroes V20 Blueprint */}
          <LivingHero
            blur1="bg-indigo-100/60" blur2="bg-sky-100/50"
            subtitleColor="text-indigo-600" subtitle="Plan de match"
            title="Le plan de votre département, noir sur blanc."
            description="Objectifs, équipe, forces, faiblesses — tout ce qui définit où vous allez et comment."
          >
            <div className="relative w-[340px] h-[160px] flex flex-col items-center justify-center mt-2 px-6">
              {/* ROOT NODE */}
              <div className="org-node anim-org-root bg-gradient-to-br from-indigo-500 to-sky-500 shadow-md w-32 h-10 flex items-center justify-center text-white relative z-10 scale-90">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-90 relative pt-1">Architecture</span>
              </div>
              {/* VERTICAL LINE DOWN FROM ROOT */}
              <div className="relative w-full h-8 z-0">
                <div className="absolute w-px bg-slate-200 left-1/2 top-0 bottom-0 -ml-[0.5px]" />
                <div className="absolute w-px bg-indigo-400 left-1/2 top-0 -ml-[0.5px] shadow-[0_0_10px_#6366f1] anim-org-line-vert" />
              </div>
              {/* HORIZONTAL BRANCHING LINE */}
              <div className="relative w-[220px] h-px bg-slate-200 z-0">
                <div className="absolute left-1/2 top-0 h-full bg-sky-400 shadow-[0_0_8px_#38bdf8] anim-org-line-hor" style={{transform:'translateX(-50%)'}} />
                <div className="absolute w-px h-6 bg-slate-200 left-0 top-0" /><div className="absolute w-px h-6 bg-slate-200 left-1/2 top-0" /><div className="absolute w-px h-6 bg-slate-200 right-0 top-0" />
              </div>
              {/* CHILD NODES */}
              <div className="flex justify-between w-[260px] mt-6 relative z-10">
                <div className="org-node anim-org-child-1 w-20 h-8 flex flex-col items-center justify-center px-1">
                  <div className="w-8 h-1 bg-slate-200 rounded-full mb-1" /><div className="w-12 h-1 bg-slate-100 rounded-full" />
                </div>
                <div className="org-node anim-org-child-2 w-20 h-8 flex flex-col items-center justify-center px-1">
                  <div className="w-8 h-1 bg-slate-200 rounded-full mb-1" /><div className="w-12 h-1 bg-slate-100 rounded-full" />
                </div>
                <div className="org-node anim-org-child-3 w-20 h-8 flex flex-col items-center justify-center px-1">
                  <div className="w-8 h-1 bg-slate-200 rounded-full mb-1" /><div className="w-12 h-1 bg-slate-100 rounded-full" />
                </div>
              </div>
            </div>
          </LivingHero>

          {/* KPI Cards — Pattern Cockpit VITAA (grid-cols-5, bg-[#00B4D8]/10 rounded-t-xl) */}
          {(() => {
            const totalFields = visibleSections.reduce((acc, s) => acc + getFieldsForTier(s.fields, tier).length, 0);
            const filledFields = visibleSections.reduce((acc, s) => {
              return acc + getFieldsForTier(s.fields, tier).filter(f => { const v = data[`${s.id}.${f.id}`]; return v !== undefined && v !== "" && v !== "[]"; }).length;
            }, 0);
            const completedSections = visibleSections.filter(s => sectionProgress(s) >= 100).length;
            const prioritySections = visibleSections.filter(s => s.fields.length > 0 && sectionProgress(s) < 50).length;
            const kpis = [
              { icon: Award, label: "Score", value: `${completionScore}%`, delta: completionScore >= 50 ? "En bonne voie" : "À compléter", up: completionScore >= 50 },
              { icon: FolderOpen, label: "Sections", value: `${completedSections}/${visibleSections.length}`, delta: `${completedSections} complétées`, up: completedSections > 0 },
              { icon: FileText, label: "Champs", value: `${filledFields}/${totalFields}`, delta: `${totalFields - filledFields} restants`, up: filledFields > totalFields / 2 },
              { icon: Bell, label: "Priorités", value: `${prioritySections}`, delta: prioritySections === 0 ? "Aucune urgence" : "À compléter", up: prioritySections === 0 },
              { icon: Zap, label: "Phase", value: PHASES.find(p => p.id === phase)?.emoji || "🚀", delta: PHASES.find(p => p.id === phase)?.label || "Démarrage", up: true },
            ];
            return (
              <div className="grid grid-cols-5 gap-3">
                {kpis.map(kpi => (
                  <div key={kpi.label} className="rounded-xl border border-gray-200 shadow-sm bg-white">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                      <kpi.icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                      <span className="text-sm font-bold text-gray-900">{kpi.label}</span>
                    </div>
                    <div className="px-4 py-3">
                      <div className="text-2xl font-bold text-gray-800">{kpi.value}</div>
                      <div className={cn("text-xs flex items-center gap-1 mt-0.5", kpi.up ? "text-emerald-600" : "text-red-500")}>
                        {kpi.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {kpi.delta}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* SECTIONS EN VEDETTE — Pattern CockpitSignalCard (grid-cols-3, gradients vibrants) */}
          {(() => {
            const vedettes = visibleSections
              .filter(s => s.id !== "vue_consolidee" && s.fields.length > 0)
              .map(s => ({ ...s, pct: sectionProgress(s) }))
              .filter(s => s.pct < 100)
              .sort((a, b) => a.pct - b.pct)
              .slice(0, 3);
            if (vedettes.length === 0) return null;
            const getVedetteGradient = (pct: number) => {
              if (pct === 0) return "from-red-600 to-red-500";
              if (pct < 50) return "from-amber-600 to-amber-500";
              return "from-sky-600 to-sky-500";
            };
            const getVedetteTag = (pct: number) => {
              if (pct === 0) return { label: "À démarrer", classes: "bg-red-400/30 text-white" };
              if (pct < 50) return { label: `${pct}% complété`, classes: "bg-amber-400/30 text-white" };
              return { label: `${pct}% complété`, classes: "bg-sky-400/30 text-white" };
            };
            return (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Sections prioritaires
                  </h3>
                  <span className="text-[9px] text-gray-400">{vedettes.length} à compléter</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {vedettes.map(s => {
                    const SIcon = resolveIcon(s.icon);
                    const tag = getVedetteTag(s.pct);
                    return (
                      <button key={s.id} onClick={() => { setActiveSub(s.id); setSectionGridView(false); }}
                        className={cn("group relative rounded-xl p-4 hover:shadow-lg transition-shadow bg-gradient-to-r text-left cursor-pointer", getVedetteGradient(s.pct))}>
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", tag.classes)}>{tag.label}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white leading-tight">{s.label}</h4>
                        <p className="text-[9px] text-white/80 mt-1.5 leading-relaxed line-clamp-2">{s.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div className="flex gap-3">

          {/* SIDEBAR — Pattern identique au Cockpit (w-[180px], items rounded-lg, icon + label + count) */}
          <div className="w-[180px] shrink-0 space-y-0.5">
            {visibleSections.map(section => {
              const pct = sectionProgress(section);
              const isActive = activeSub === section.id && !selectedDeptCode;
              const isConsolidee = section.id === "vue_consolidee";
              const SectionIcon = resolveIcon(section.icon);

              return (
                <button
                  key={section.id}
                  onClick={() => { setActiveSub(section.id); setSectionGridView(isConsolidee); setSelectedDeptCode(null); setSelectedDeptSub(undefined); }}
                  className={cn(
                    "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                    isConsolidee && sectionGridView && !selectedDeptCode ? "bg-blue-50 border border-blue-200 shadow-sm" : isActive && !sectionGridView ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent",
                    isConsolidee && !sectionGridView && !selectedDeptCode && "bg-gradient-to-r from-slate-50 to-blue-50/50 border-blue-100/50"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <SectionIcon className={cn("h-3.5 w-3.5", isActive && !sectionGridView ? "text-blue-500" : "text-gray-400")} />
                    <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActive && !sectionGridView ? "text-blue-700" : "text-gray-700")}>{section.label}</span>
                    <span className="text-[9px] text-gray-400">{pct}%</span>
                  </div>
                </button>
              );
            })}

            {/* ── SECTION DÉPARTEMENTS — Accordion (même pattern que Data Room sidebar) ── */}
            {botCode === "CEOB" && (
              <>
                <div className={SF.separator} />
                <div className={SF.sectionLabel}>
                  Départements
                </div>
                {OTHER_BOTS.map(dept => {
                  const DIcon = DEPT_DASH_ICON[dept.code] || Zap;
                  const isActiveDept = selectedDeptCode === dept.code;
                  const isExpanded = expandedBpDepts.has(dept.code);
                  const deptConfig = getBlueprintConfig(dept.code);
                  const deptSections = deptConfig ? getVisibleSubSections(deptConfig, tier).filter(s => s.id !== "vue_consolidee" && !s.id.startsWith("playbooks_")) : [];
                  return (
                    <div key={dept.code}>
                      <button
                        onClick={() => {
                          setExpandedBpDepts(prev => {
                            const next = new Set(prev);
                            if (next.has(dept.code)) next.delete(dept.code); else next.add(dept.code);
                            return next;
                          });
                          setSelectedDeptCode(dept.code);
                          setSelectedDeptSub(undefined);
                          setSectionGridView(false);
                        }}
                        className={cn(
                          "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                          isActiveDept && !isExpanded ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", isExpanded ? "" : "-rotate-90", isActiveDept ? "text-blue-500" : "text-gray-300")} />
                          <DIcon className={cn("h-3.5 w-3.5 shrink-0", isActiveDept ? "text-blue-500" : "text-gray-400")} />
                          <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActiveDept ? "text-blue-700" : "text-gray-700")}>{dept.label}</span>
                          <span className="text-[9px] text-gray-400">{deptSections.length}</span>
                        </div>
                      </button>
                      {isExpanded && deptSections.map(s => {
                        const SIcon = resolveIcon(s.icon);
                        const isSubActive = selectedDeptCode === dept.code && selectedDeptSub === s.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => { setSelectedDeptCode(dept.code); setSelectedDeptSub(s.id); setSectionGridView(false); }}
                            className={cn(
                              "w-full pl-6 pr-2.5 py-1 rounded-lg text-left transition-all cursor-pointer",
                              isSubActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                            )}
                          >
                            <div className="flex items-center gap-1.5">
                              <SIcon className={cn("h-3.5 w-3.5 shrink-0", isSubActive ? "text-blue-500" : "text-gray-400")} />
                              <span className={cn("text-[10px] font-medium flex-1 leading-tight", isSubActive ? "text-blue-700" : "text-gray-600")}>{s.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* CONTENU — Pattern Store exact: grid-cols-2 CockpitCards OU drill-down CockpitBlocDetail OU Blueprint département */}
          <div className="flex-1 min-w-0 space-y-3">
            {selectedDeptCode ? (
              /* DRILL-DOWN DÉPARTEMENT — Contenu seulement (pas de double sidebar) */
              <BlueprintView
                botCode={selectedDeptCode}
                headerGradient={OTHER_BOTS.find(b => b.code === selectedDeptCode)?.gradient || "from-blue-600 to-blue-500"}
                sizeTier={tier}
                contentOnly
                activeSectionId={selectedDeptSub}
                hideHeader
              />
            ) : sectionGridView ? (
              /* VUE D'ENSEMBLE — VITAA/FAAS + grille sections */
              <div className="space-y-3">
                {/* VITAA + FAAS — boxes côte à côte */}
                <div className="grid grid-cols-2 gap-3">
                  {/* VITAA — 5 piliers d'affaires */}
                  <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                      <Heart className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                      <span className="text-sm font-bold text-gray-900 flex-1">VITAA — Piliers d'affaires</span>
                    </div>
                    <div className="p-2.5 space-y-1.5">
                      {[
                        { letter: "V", label: "Vente", score: 38, color: "bg-blue-500" },
                        { letter: "I", label: "Idée", score: 42, color: "bg-purple-500" },
                        { letter: "T", label: "Temps", score: 61, color: "bg-emerald-500" },
                        { letter: "A", label: "Argent", score: 55, color: "bg-amber-500" },
                        { letter: "A", label: "Actif", score: 29, color: "bg-red-500" },
                      ].map((p) => (
                        <div key={p.letter + p.label}>
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0", p.color)}>{p.letter}</div>
                            <span className="text-[9px] font-medium text-gray-800 flex-1">{p.label}</span>
                            <span className={cn("text-xs font-bold", p.score >= 50 ? "text-green-600" : p.score >= 35 ? "text-amber-600" : "text-red-600")}>{p.score}</span>
                            <span className={cn("text-[9px] px-1 py-0.5 rounded border font-medium",
                              p.score < 35 ? "text-red-600 bg-red-50 border-red-200" :
                              p.score < 50 ? "text-amber-600 bg-amber-50 border-amber-200" :
                              "text-green-600 bg-green-50 border-green-200"
                            )}>{p.score < 35 ? "critique" : p.score < 50 ? "risque" : "sain"}</span>
                          </div>
                          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden ml-7">
                            <div className={cn("h-full rounded-full absolute", p.color)} style={{ width: `${p.score}%` }} />
                          </div>
                        </div>
                      ))}
                      <div className="pt-1.5 border-t border-gray-100 mt-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-gray-500 uppercase">Score VITAA</span>
                          <span className="text-sm font-bold text-gray-800">45/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* FAAS — 4 piliers relationnels */}
                  <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                      <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                      <span className="text-sm font-bold text-gray-900 flex-1">FAAS — Capital social</span>
                    </div>
                    <div className="p-2.5 space-y-1.5">
                      {[
                        { letter: "F", label: "Fraternité", score: 52, color: "bg-rose-500", desc: "Cohésion équipe, rétention, culture" },
                        { letter: "A", label: "Alliance", score: 35, color: "bg-pink-500", desc: "Partenaires B2B, co-création, REAI" },
                        { letter: "A", label: "Associés", score: 28, color: "bg-fuchsia-500", desc: "CA, mentors, conseillers, pairs" },
                        { letter: "S", label: "Social", score: 44, color: "bg-violet-500", desc: "Réputation, thought leadership" },
                      ].map((p) => (
                        <div key={p.letter + p.label}>
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold shrink-0", p.color)}>{p.letter}</div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] font-medium text-gray-800">{p.label}</span>
                              <p className="text-[9px] text-gray-400 leading-tight truncate">{p.desc}</p>
                            </div>
                            <span className={cn("text-xs font-bold", p.score >= 50 ? "text-green-600" : p.score >= 35 ? "text-amber-600" : "text-red-600")}>{p.score}</span>
                            <span className={cn("text-[9px] px-1 py-0.5 rounded border font-medium",
                              p.score < 35 ? "text-red-600 bg-red-50 border-red-200" :
                              p.score < 50 ? "text-amber-600 bg-amber-50 border-amber-200" :
                              "text-green-600 bg-green-50 border-green-200"
                            )}>{p.score < 35 ? "critique" : p.score < 50 ? "risque" : "sain"}</span>
                          </div>
                          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden ml-7">
                            <div className={cn("h-full rounded-full absolute", p.color)} style={{ width: `${p.score}%` }} />
                          </div>
                        </div>
                      ))}
                      <div className="pt-1.5 border-t border-gray-100 mt-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-gray-500 uppercase">Score FAAS</span>
                          <span className="text-sm font-bold text-gray-800">40/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Sections du Blueprint — grille avec % complétion */}
                <div className="grid grid-cols-2 gap-3">
                {visibleSections.filter(s => s.id !== "vue_consolidee").map(section => {
                  const SIcon = resolveIcon(section.icon);
                  const pct = sectionProgress(section);
                  const fields = getFieldsForTier(section.fields, tier);
                  const filled = fields.filter(f => { const v = data[`${section.id}.${f.id}`]; return v !== undefined && v !== "" && v !== "[]"; }).length;
                  return (
                    <div key={section.id} className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
                      <div
                        className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl cursor-pointer hover:bg-[#00B4D8]/20 transition-colors"
                        onClick={() => { setActiveSub(section.id); setSectionGridView(false); }}
                      >
                        <SIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                        <span className="text-sm font-bold text-gray-900 flex-1 truncate">{section.label}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{pct}%</span>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                      <div className="px-4 py-3 space-y-2">
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{section.description}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[9px] text-gray-400">{filled}/{fields.length}</span>
                        </div>
                        <PertinenceBadge p={section.pertinence[tier]} />
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            ) : activeSection && activeSection.id === "vue_consolidee" && botCode === "CEOB" ? (
              /* VUE CONSOLIDÉE (CEOB seulement) */
              <div className="space-y-3">
                <VueConsolidee tier={tier} />
              </div>
            ) : activeSection && (
              /* DRILL-DOWN — Pattern CockpitBlocDetail exact */
              <div className="space-y-3">
                <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
                    {(() => { const Icon = resolveIcon(activeSection.icon); return <Icon className="h-4 w-4 text-gray-900 stroke-[2.5]" />; })()}
                    <span className="text-sm font-bold text-gray-900 flex-1 truncate">{activeSection.label}</span>
                    <button onClick={(e) => { e.stopPropagation(); openInAtelier(activeSection); }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer bg-[#00B4D8]/15 text-[#00B4D8] hover:bg-[#00B4D8]/25"
                      title="Ouvrir dans l'Atelier">
                      <PenLine className="h-3.5 w-3.5" /> Atelier
                    </button>
                    <PertinenceBadge p={activeSection.pertinence[tier]} />
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{activeSection.description}</p>
                    {activeSection.intro && (
                      <div className="mt-2 flex items-start gap-2 bg-white/60 rounded-lg px-3 py-2 border border-blue-100/50">
                        <Sparkles className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                        <p className="text-[9px] text-gray-500 leading-relaxed">{activeSection.intro}</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-100">
                    <SubSectionContent section={activeSection} tier={tier} data={data} onFieldChange={handleFieldChange} onSave={handleSave} saving={saving} dirty={dirty} />
                    <CrossReferencePanel botCode={botCode} sectionId={activeSection.id} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

// ═══ CHANTIER VIEW — Pattern SectionView OFFICIEL ═══
type ChantierLevel = "chantiers" | "projets" | "missions" | "taches" | "tache-detail";
type ChantierSortKey = "recent" | "progression" | "phase" | "alpha";

// Phase derivation — maps status/progression to visual work phase
function statusToPhase(status: string, progression: number): PhaseKey {
  if (status === "completee" || status === "done") return "retroaction";
  if (status === "en-cours" || status === "in_progress") return "execution";
  if (status === "actif") return progression >= 80 ? "retroaction" : progression >= 20 ? "execution" : "creation";
  if (status === "pause") return "reflexion";
  return "discussion";
}

// Phase-colored progress bar (uses PHASE_COLORS dot color for the bar)
function ProgressMiniPhased({ value, phase }: { value: number; phase?: PhaseKey }) {
  const pct = Math.min(100, Math.max(0, value));
  const phaseColor = phase ? PHASE_COLORS[phase]?.dot : null;
  const fallback = pct >= 75 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", phaseColor || fallback)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[9px] font-bold text-gray-500 w-7 text-right">{pct}%</span>
    </div>
  );
}

// ── Mock data réaliste par département pour simulation ──
// Types enrichis — chaque niveau a ses propres éléments (poupées russes)
interface MockDocument { id: string; titre: string; type: string; format: string; modifie: string; auteur: string }
interface MockJalon { date: string; label: string; done: boolean }
interface MockRACIItem { role: string; bot: string; type: "R" | "A" | "C" | "I" }
interface MockCriterion { label: string; done: boolean }
interface MockDependency { label: string; type: "bloque" | "bloque-par"; entite: string; statut: "resolu" | "en-cours" | "critique" }
interface MockDecisionLog { date: string; decision: string; decideur: string; rationnel: string }
interface MockConferenceAI { id: string; date: string; titre: string; participants: string[]; duree: string; resume?: string }
interface MockActivityLog { date: string; action: string; auteur: string; type: "creation" | "modification" | "decision" | "livrable" | "commentaire" }
interface MockTacheItem { id: number; titre: string; description: string; phase: PhaseKey; progression: number; assignee: string; echeance: string; documents: MockDocument[]; jalons: MockJalon[]; instructions?: string; validateur?: string; criteresAcceptation?: MockCriterion[]; dependances?: MockDependency[]; conferences?: MockConferenceAI[]; tempsEstime?: string; tempsReel?: string }
interface MockMissionItem { id: number; titre: string; description: string; phase: PhaseKey; progression: number; botPrimaire: string; echeance: string; livrables: string[]; documents: MockDocument[]; jalons: MockJalon[]; taches: MockTacheItem[]; objectifs?: string[]; equipe?: string[]; criteresAcceptation?: MockCriterion[]; dependances?: MockDependency[]; conferences?: MockConferenceAI[] }
interface MockProjetItem { id: number; titre: string; description: string; phase: PhaseKey; progression: number; botPrimaire: string; echeance: string; objectifs: string[]; livrables: string[]; budget: string; documents: MockDocument[]; jalons: MockJalon[]; missions: MockMissionItem[]; raci?: MockRACIItem[]; dependances?: MockDependency[]; decisions?: MockDecisionLog[]; conferences?: MockConferenceAI[]; sante?: { score: number; tendance: "up" | "down" | "stable"; burnRate?: string; roi?: string } }
interface MockChantierItem {
  id: number; titre: string; description: string; phase: PhaseKey; progression: number;
  echeance: string; dateDebut: string; botPrimaire: string; botCodes: string[];
  objectifs: string[]; budget: string; risques: string[];
  documents: MockDocument[]; jalons: MockJalon[];
  projets: MockProjetItem[];
  dateMaj?: string; sante?: { score: number; tendance: "up" | "down" | "stable"; burnRate?: string; roi?: string };
  raci?: MockRACIItem[]; decisions?: MockDecisionLog[]; conferences?: MockConferenceAI[];
  activites?: MockActivityLog[]; retrospective?: { positifs: string[]; negatifs: string[]; actions: string[] };
}

const MOCK_CHANTIERS: Record<string, MockChantierItem[]> = {
  CEOB: [
    { id: 1, titre: "Transformation numérique PME", description: "Moderniser l'infrastructure technologique et les processus d'affaires pour accélérer la croissance. Ce chantier couvre la migration cloud, l'automatisation des processus clés et la formation de toutes les équipes aux nouveaux outils.", phase: "execution", progression: 65, dateDebut: "2026-02-15", echeance: "2026-06-30", botPrimaire: "CTOB", botCodes: ["CTOB", "COOB", "CINOB"],
      objectifs: ["Réduire les coûts opérationnels de 20%", "Automatiser 5 processus clés", "Former 100% de l'équipe aux outils numériques", "Migrer 100% des services vers le cloud"],
      budget: "125 000 $", risques: ["Résistance au changement des équipes terrain", "Dépendance à un fournisseur cloud unique", "Délais de migration des données legacy"],
      documents: [
        { id: "d1", titre: "Plan stratégique transformation", type: "plan", format: "PDF", modifie: "2026-04-10", auteur: "CarlOS" },
        { id: "d2", titre: "Architecture cible cloud", type: "technique", format: "Diagramme", modifie: "2026-04-08", auteur: "Tim (CTO)" },
        { id: "d3", titre: "Budget détaillé Q2-Q3", type: "finance", format: "Excel", modifie: "2026-04-05", auteur: "Frank (CFO)" },
        { id: "d4", titre: "Matrice des risques", type: "risque", format: "PDF", modifie: "2026-03-28", auteur: "Simone (CSO)" },
      ],
      jalons: [
        { date: "2026-02-15", label: "Lancement du chantier", done: true },
        { date: "2026-03-15", label: "Audit infrastructure terminé", done: true },
        { date: "2026-04-30", label: "Migration phase 1 (non-critique)", done: true },
        { date: "2026-05-15", label: "Migration phase 2 (DB principale)", done: false },
        { date: "2026-06-01", label: "Formation équipes", done: false },
        { date: "2026-06-30", label: "Livraison finale + rétroaction", done: false },
      ],
      dateMaj: "2026-04-12",
      sante: { score: 72, tendance: "up", burnRate: "58%", roi: "3.2x projeté" },
      raci: [
        { role: "Migration cloud", bot: "CTOB", type: "R" },
        { role: "Automatisation processus", bot: "COOB", type: "R" },
        { role: "Budget & ROI", bot: "CFOB", type: "A" },
        { role: "Sécurité infra", bot: "CISOB", type: "C" },
        { role: "Formation équipes", bot: "CHROB", type: "C" },
        { role: "Direction générale", bot: "CEOB", type: "I" },
      ],
      decisions: [
        { date: "2026-04-08", decision: "Choisir AWS plutôt qu'Azure pour la migration", decideur: "CarlOS (CEO)", rationnel: "Meilleur rapport coût/performance pour nos volumes, plus d'expertise disponible dans l'équipe" },
        { date: "2026-03-20", decision: "Reporter la migration DB principale à mai", decideur: "Tim (CTO)", rationnel: "Tests de charge insuffisants, risque de perte de données si migration précipitée" },
        { date: "2026-03-01", decision: "Allouer 125K$ au chantier transformation", decideur: "Frank (CFO)", rationnel: "ROI projeté de 3.2x sur 18 mois justifie l'investissement" },
      ],
      conferences: [
        { id: "conf-1", date: "2026-04-10", titre: "Revue hebdo migration cloud", participants: ["CTOB", "COOB", "CEOB"], duree: "45 min", resume: "Discussion sur le timeline migration DB. Tim propose un dry-run avant le cutover." },
        { id: "conf-2", date: "2026-04-03", titre: "Brainstorm automatisation processus", participants: ["COOB", "CINOB", "CPOB"], duree: "30 min", resume: "Identification des 10 processus prioritaires. Focus sur la facturation et le reporting." },
        { id: "conf-3", date: "2026-03-15", titre: "Kickoff transformation numérique", participants: ["CEOB", "CTOB", "CFOB", "COOB", "CISOB"], duree: "60 min", resume: "Définition du scope, allocation budget, assignment des responsabilités." },
      ],
      activites: [
        { date: "2026-04-12", action: "Migration phase 1 complétée — 8 services non-critiques migrés", auteur: "Tim (CTO)", type: "livrable" },
        { date: "2026-04-10", action: "Revue hebdomadaire du chantier", auteur: "CarlOS", type: "commentaire" },
        { date: "2026-04-08", action: "Décision: AWS sélectionné comme provider cloud", auteur: "CarlOS", type: "decision" },
        { date: "2026-04-05", action: "Budget Q2-Q3 révisé et approuvé", auteur: "Frank (CFO)", type: "modification" },
        { date: "2026-04-03", action: "Brainstorm automatisation — 10 processus identifiés", auteur: "Olivier (COO)", type: "commentaire" },
        { date: "2026-03-28", action: "Matrice des risques mise à jour", auteur: "Simone (CSO)", type: "modification" },
        { date: "2026-03-15", action: "Chantier créé — kickoff réunion complétée", auteur: "CarlOS", type: "creation" },
      ],
      retrospective: { positifs: ["Migration phase 1 sans incident", "Bonne collaboration CTO-COO", "Budget respecté à ce jour"], negatifs: ["Retard sur la migration DB principale", "Formation équipes pas encore planifiée en détail"], actions: ["Planifier dry-run migration DB avant mai", "Préparer le calendrier de formation avec CHRO"] },
      projets: [
        { id: 101, titre: "Migration cloud", description: "Migrer les serveurs on-premise vers AWS/Azure pour plus de flexibilité et réduire les coûts d'hébergement de 40%.", phase: "execution", progression: 80, botPrimaire: "CTOB", echeance: "2026-05-15",
          objectifs: ["Migrer 12 serveurs vers AWS", "Configurer le failover automatique", "Zéro downtime pendant la migration"],
          livrables: ["Architecture cloud documentée", "Scripts Terraform", "Runbook de migration", "Tests de charge validés"],
          budget: "45 000 $",
          documents: [
            { id: "d5", titre: "Terraform modules", type: "code", format: "HCL", modifie: "2026-04-10", auteur: "Tim (CTO)" },
            { id: "d6", titre: "Runbook migration", type: "procedure", format: "Markdown", modifie: "2026-04-08", auteur: "Tim (CTO)" },
            { id: "d7", titre: "Rapport tests de charge", type: "rapport", format: "PDF", modifie: "2026-04-12", auteur: "Sébastien (CISO)" },
          ],
          jalons: [
            { date: "2026-03-01", label: "Audit serveurs terminé", done: true },
            { date: "2026-04-01", label: "VPC et réseau configurés", done: true },
            { date: "2026-04-20", label: "Services non-critiques migrés", done: true },
            { date: "2026-05-10", label: "Base de données principale migrée", done: false },
            { date: "2026-05-15", label: "Validation et cutover", done: false },
          ],
          sante: { score: 82, tendance: "up", burnRate: "65%", roi: "4x projeté" },
          raci: [
            { role: "Architecture cloud", bot: "CTOB", type: "R" },
            { role: "Validation sécurité", bot: "CISOB", type: "A" },
            { role: "Budget migration", bot: "CFOB", type: "C" },
          ],
          dependances: [
            { label: "Tests de charge validés", type: "bloque-par", entite: "Rapport Sébastien (CISO)", statut: "en-cours" },
            { label: "Migration DB bloque déploiement production", type: "bloque", entite: "Projet Automatisation processus", statut: "en-cours" },
          ],
          decisions: [
            { date: "2026-04-08", decision: "AWS sélectionné — migration multi-AZ", decideur: "Tim (CTO)", rationnel: "Redundancy et latence optimale pour le Québec" },
          ],
          conferences: [
            { id: "conf-p1", date: "2026-04-10", titre: "Sprint review migration S15", participants: ["CTOB", "CISOB"], duree: "30 min", resume: "Phase 1 complétée. Phase 2 planifiée pour mai." },
          ],
          missions: [
            { id: 1001, titre: "Audit infrastructure actuelle", description: "Cartographier tous les serveurs, bases de données et applications existantes. Documenter les dépendances, les versions et les configurations.", phase: "retroaction", progression: 100, botPrimaire: "CTOB", echeance: "2026-03-15",
              objectifs: ["Inventorier 100% des serveurs", "Documenter toutes les dépendances inter-services", "Identifier les SPOF critiques"],
              equipe: ["CTOB", "CISOB"],
              livrables: ["Inventaire complet des serveurs", "Carte des dépendances", "Rapport de recommandations"],
              documents: [
                { id: "d8", titre: "Inventaire serveurs v3", type: "inventaire", format: "Excel", modifie: "2026-03-14", auteur: "Tim (CTO)" },
                { id: "d9", titre: "Diagramme dépendances", type: "technique", format: "Draw.io", modifie: "2026-03-12", auteur: "Tim (CTO)" },
              ],
              jalons: [
                { date: "2026-03-01", label: "Inventaire physique terminé", done: true },
                { date: "2026-03-10", label: "Dépendances cartographiées", done: true },
                { date: "2026-03-15", label: "Rapport livré", done: true },
              ],
              criteresAcceptation: [
                { label: "100% des serveurs physiques et virtuels documentés", done: true },
                { label: "Diagramme de dépendances validé par CISO", done: true },
                { label: "Rapport de recommandations approuvé", done: true },
              ],
              conferences: [
                { id: "conf-m1", date: "2026-03-10", titre: "Revue audit infra", participants: ["CTOB", "CISOB"], duree: "25 min", resume: "Validation de l'inventaire. 3 SPOF critiques identifiés." },
              ],
              taches: [
                { id: 10001, titre: "Inventaire des serveurs", description: "Lister tous les serveurs physiques et virtuels avec leurs specs (CPU, RAM, stockage), rôles et uptime. Inclure les services Docker et les cronjobs.", phase: "retroaction", progression: 100, assignee: "Tim (CTO)", echeance: "2026-03-05",
                  instructions: "Utiliser les scripts d'inventaire existants (inventory.sh) + audit manuel Docker. Vérifier chaque VM dans le dashboard OVH.",
                  validateur: "Sébastien (CISO)",
                  criteresAcceptation: [{ label: "Tous les serveurs listés avec specs", done: true }, { label: "Services Docker inventoriés", done: true }, { label: "Cronjobs documentés", done: true }],
                  tempsEstime: "3 jours", tempsReel: "2.5 jours",
                  documents: [{ id: "d10", titre: "Liste serveurs.xlsx", type: "données", format: "Excel", modifie: "2026-03-04", auteur: "Tim (CTO)" }],
                  jalons: [{ date: "2026-03-05", label: "Inventaire complété", done: true }] },
                { id: 10002, titre: "Cartographie des dépendances", description: "Documenter les connexions entre services, APIs et bases de données. Identifier les single points of failure et les bottlenecks.", phase: "retroaction", progression: 100, assignee: "Tim (CTO)", echeance: "2026-03-10",
                  instructions: "Tracer les appels API entre services. Utiliser Draw.io pour le diagramme. Marquer en rouge les SPOF.",
                  validateur: "Sébastien (CISO)",
                  criteresAcceptation: [{ label: "Toutes les connexions API documentées", done: true }, { label: "SPOF identifiés et marqués", done: true }],
                  dependances: [{ label: "Inventaire serveurs terminé", type: "bloque-par", entite: "Tâche #10001", statut: "resolu" }],
                  tempsEstime: "4 jours", tempsReel: "3 jours",
                  documents: [{ id: "d11", titre: "dependency-map.drawio", type: "technique", format: "Draw.io", modifie: "2026-03-09", auteur: "Tim (CTO)" }],
                  jalons: [{ date: "2026-03-10", label: "Carte complétée", done: true }] },
              ] },
            { id: 1002, titre: "Déploiement environnement cloud", description: "Configurer VPC, groupes de sécurité, IAM et services managés sur AWS. Implémenter l'infrastructure as code avec Terraform.", phase: "execution", progression: 60, botPrimaire: "CTOB", echeance: "2026-05-10",
              livrables: ["VPC configuré", "IAM policies", "RDS PostgreSQL", "Scripts Terraform"],
              documents: [
                { id: "d12", titre: "main.tf", type: "code", format: "Terraform", modifie: "2026-04-10", auteur: "Tim (CTO)" },
                { id: "d13", titre: "Guide IAM policies", type: "sécurité", format: "PDF", modifie: "2026-04-08", auteur: "Sébastien (CISO)" },
              ],
              jalons: [
                { date: "2026-04-01", label: "VPC opérationnel", done: true },
                { date: "2026-04-15", label: "IAM et sécurité configurés", done: true },
                { date: "2026-05-01", label: "RDS prêt pour migration", done: false },
                { date: "2026-05-10", label: "Migration DB complétée", done: false },
              ],
              taches: [
                { id: 10003, titre: "Configurer le VPC et sous-réseaux", description: "Créer l'architecture réseau cloud avec zones publiques et privées, NAT gateways et routing tables.", phase: "retroaction", progression: 100, assignee: "Tim (CTO)", echeance: "2026-04-01",
                  documents: [{ id: "d14", titre: "vpc-config.tf", type: "code", format: "Terraform", modifie: "2026-03-30", auteur: "Tim (CTO)" }],
                  jalons: [{ date: "2026-04-01", label: "VPC live", done: true }] },
                { id: 10004, titre: "Migrer la base de données principale", description: "Transférer PostgreSQL vers RDS avec réplication et failover. Valider l'intégrité des données et les performances.", phase: "execution", progression: 45, assignee: "Tim (CTO)", echeance: "2026-05-10",
                  documents: [
                    { id: "d15", titre: "Script migration pg_dump", type: "code", format: "Shell", modifie: "2026-04-08", auteur: "Tim (CTO)" },
                    { id: "d16", titre: "Checklist validation données", type: "checklist", format: "Markdown", modifie: "2026-04-10", auteur: "Tim (CTO)" },
                  ],
                  jalons: [
                    { date: "2026-04-20", label: "Réplication configurée", done: true },
                    { date: "2026-05-01", label: "Tests intégrité passés", done: false },
                    { date: "2026-05-10", label: "Cutover production", done: false },
                  ] },
              ] },
          ] },
        { id: 102, titre: "Automatisation des processus", description: "Identifier et automatiser les tâches répétitives avec des playbooks. Réduire le temps consacré aux opérations manuelles de 60%.", phase: "reflexion", progression: 25, botPrimaire: "COOB", echeance: "2026-06-30",
          objectifs: ["Cartographier 20 processus manuels", "Automatiser les 10 plus chronophages", "Réduire 60% du temps manuel"],
          livrables: ["Cartographie des processus", "10 playbooks d'automatisation", "Dashboard de monitoring"],
          budget: "35 000 $",
          documents: [
            { id: "d17", titre: "Cartographie processus V1", type: "analyse", format: "Miro", modifie: "2026-04-05", auteur: "Olivier (COO)" },
          ],
          jalons: [
            { date: "2026-04-15", label: "Cartographie terminée", done: false },
            { date: "2026-05-15", label: "5 premiers playbooks prêts", done: false },
            { date: "2026-06-30", label: "10 playbooks déployés", done: false },
          ],
          missions: [
            { id: 1003, titre: "Cartographie des processus", description: "Documenter tous les workflows manuels avec temps et coûts. Interviewer chaque département.", phase: "execution", progression: 50, botPrimaire: "COOB", echeance: "2026-04-15",
              livrables: ["Flowcharts de 20 processus", "Matrice temps/coût", "Priorisation des automatisations"],
              documents: [{ id: "d18", titre: "Process-map-draft.miro", type: "analyse", format: "Miro", modifie: "2026-04-03", auteur: "Olivier (COO)" }],
              jalons: [{ date: "2026-04-05", label: "Interviews 50% complétées", done: true }, { date: "2026-04-15", label: "Cartographie livrée", done: false }],
              taches: [
                { id: 10005, titre: "Interviewer les chefs d'équipe", description: "Rencontrer chaque département (30min/personne) pour identifier les goulots d'étranglement et les tâches les plus chronophages.", phase: "execution", progression: 60, assignee: "Olivier (COO)", echeance: "2026-04-08",
                  documents: [{ id: "d19", titre: "Guide d'interview", type: "template", format: "Google Doc", modifie: "2026-03-25", auteur: "Olivier (COO)" }],
                  jalons: [{ date: "2026-04-01", label: "6/12 départements interviewés", done: true }, { date: "2026-04-08", label: "12/12 complétés", done: false }] },
                { id: 10006, titre: "Documenter les 10 processus prioritaires", description: "Créer des flowcharts détaillés pour les processus les plus chronophages avec temps estimé, coût et fréquence.", phase: "discussion", progression: 10, assignee: "Olivier (COO)", echeance: "2026-04-15",
                  documents: [], jalons: [{ date: "2026-04-15", label: "10 flowcharts livrés", done: false }] },
              ] },
          ] },
      ] },
    { id: 2, titre: "Expansion marché Ontario", description: "Pénétrer le marché ontarien avec une stratégie adaptée au contexte anglophone. Identifier les segments prioritaires, adapter le messaging et établir une présence locale.", phase: "reflexion", progression: 15, dateDebut: "2026-03-01", echeance: "2026-09-30", botPrimaire: "CSOB", botCodes: ["CSOB", "CMOB", "CROB"],
      objectifs: ["Identifier 50 prospects qualifiés", "Ouvrir un bureau satellite à Toronto", "Générer 500K$ en pipeline Q3", "Recruter 2 représentants bilingues"],
      budget: "200 000 $", risques: ["Concurrence forte des acteurs locaux établis", "Différences culturelles business QC vs ON", "Coût immobilier Toronto élevé"],
      documents: [
        { id: "d20", titre: "Étude de marché Ontario V2", type: "recherche", format: "PDF", modifie: "2026-04-08", auteur: "Simone (CSO)" },
        { id: "d21", titre: "Business case expansion", type: "finance", format: "Excel", modifie: "2026-03-20", auteur: "Frank (CFO)" },
        { id: "d22", titre: "Personas acheteurs Ontario", type: "marketing", format: "PDF", modifie: "2026-04-01", auteur: "Mathilde (CMO)" },
      ],
      jalons: [
        { date: "2026-03-01", label: "Lancement analyse", done: true },
        { date: "2026-04-30", label: "Étude de marché livrée", done: false },
        { date: "2026-06-15", label: "Stratégie GTM validée", done: false },
        { date: "2026-07-15", label: "Premiers prospects contactés", done: false },
        { date: "2026-09-30", label: "Bureau Toronto opérationnel", done: false },
      ],
      dateMaj: "2026-04-08",
      sante: { score: 45, tendance: "stable", burnRate: "12%", roi: "En évaluation" },
      decisions: [
        { date: "2026-03-15", decision: "Focus sur le segment manufacturier en Ontario", decideur: "Simone (CSO)", rationnel: "Meilleur fit avec notre expertise et notre réseau REAI" },
      ],
      conferences: [
        { id: "conf-4", date: "2026-04-05", titre: "Revue étude de marché Ontario", participants: ["CSOB", "CMOB", "CEOB"], duree: "35 min", resume: "Premiers résultats encourageants. 50+ manufacturiers identifiés dans la GTA." },
      ],
      activites: [
        { date: "2026-04-08", action: "Étude de marché — analyse concurrentielle en cours", auteur: "Simone (CSO)", type: "modification" },
        { date: "2026-03-15", action: "Segment manufacturier sélectionné comme cible prioritaire", auteur: "Simone (CSO)", type: "decision" },
        { date: "2026-03-01", action: "Chantier lancé — équipe Simone + Mathilde + Rich", auteur: "CarlOS", type: "creation" },
      ],
      projets: [
        { id: 103, titre: "Étude de marché Ontario", description: "Analyser le paysage concurrentiel, identifier les segments prioritaires et quantifier l'opportunité.", phase: "execution", progression: 70, botPrimaire: "CSOB", echeance: "2026-04-30",
          objectifs: ["Profiler 20 compétiteurs", "Identifier 5 segments prioritaires", "Estimer le TAM/SAM/SOM"],
          livrables: ["Rapport d'analyse concurrentielle", "Segmentation marché", "Recommandations stratégiques"],
          budget: "15 000 $",
          documents: [{ id: "d23", titre: "Competitive-landscape.pdf", type: "recherche", format: "PDF", modifie: "2026-04-08", auteur: "Simone (CSO)" }],
          jalons: [{ date: "2026-03-15", label: "Données collectées", done: true }, { date: "2026-04-15", label: "Analyse complétée", done: false }, { date: "2026-04-30", label: "Rapport livré", done: false }],
          missions: [
            { id: 1004, titre: "Analyse concurrentielle", description: "Profiler les 20 compétiteurs principaux en Ontario. Documenter leurs forces, faiblesses, pricing et positionnement.", phase: "retroaction", progression: 90, botPrimaire: "CSOB", echeance: "2026-04-15",
              livrables: ["20 fiches compétiteurs", "Matrice positionnement", "SWOT global"],
              documents: [{ id: "d24", titre: "Fiches compétiteurs", type: "recherche", format: "Google Sheets", modifie: "2026-04-10", auteur: "Simone (CSO)" }],
              jalons: [{ date: "2026-04-01", label: "10/20 profils complétés", done: true }, { date: "2026-04-15", label: "20/20 + synthèse", done: false }],
              taches: [
                { id: 10007, titre: "Recherche web et rapports industrie", description: "Compiler les données publiques sur les compétiteurs (revenus, parts de marché, positionnement, avis clients).", phase: "retroaction", progression: 100, assignee: "Simone (CSO)", echeance: "2026-04-01",
                  documents: [{ id: "d25", titre: "Sources et liens", type: "recherche", format: "Notion", modifie: "2026-03-30", auteur: "Simone (CSO)" }],
                  jalons: [{ date: "2026-04-01", label: "Recherche terminée", done: true }] },
                { id: 10008, titre: "Synthèse SWOT par compétiteur", description: "Rédiger une fiche SWOT pour chaque compétiteur. Identifier les angles d'attaque et les différenciateurs.", phase: "execution", progression: 75, assignee: "Simone (CSO)", echeance: "2026-04-15",
                  documents: [{ id: "d26", titre: "SWOT-template.docx", type: "template", format: "Word", modifie: "2026-04-05", auteur: "Simone (CSO)" }],
                  jalons: [{ date: "2026-04-10", label: "15/20 SWOT rédigés", done: true }, { date: "2026-04-15", label: "20/20 livrés", done: false }] },
              ] },
          ] },
        { id: 104, titre: "Stratégie go-to-market", description: "Définir le positionnement, pricing, canaux et messaging pour le marché ontarien.", phase: "discussion", progression: 5, botPrimaire: "CMOB", echeance: "2026-06-15",
          objectifs: ["Définir le positionnement différencié", "Adapter le pricing au marché ON", "Choisir 3 canaux d'acquisition"],
          livrables: ["Document GTM", "Pricing grid", "Plan média"], budget: "25 000 $",
          documents: [], jalons: [{ date: "2026-05-01", label: "Kickoff GTM", done: false }, { date: "2026-06-15", label: "GTM validé", done: false }],
          missions: [] },
      ] },
    { id: 3, titre: "Programme fidélisation clients", description: "Réduire le churn de 15% et augmenter le LTV de 25% via un programme de fidélisation structuré. Inclut tiers, récompenses, gamification et portail client.", phase: "creation", progression: 40, dateDebut: "2026-03-15", echeance: "2026-08-15", botPrimaire: "CROB", botCodes: ["CROB", "CMOB", "CFOB"],
      objectifs: ["Réduire le churn à moins de 5%", "Augmenter le NPS de 20 points", "Lancer le programme loyalty Q2", "Atteindre 80% d'adoption en 3 mois"],
      budget: "85 000 $", risques: ["Faible adoption si UX complexe", "Coût des récompenses mal calibré", "Intégration CRM difficile"],
      documents: [
        { id: "d27", titre: "Blueprint programme loyalty", type: "stratégie", format: "PDF", modifie: "2026-04-10", auteur: "Mathilde (CMO)" },
        { id: "d28", titre: "Analyse churn Q1 2026", type: "données", format: "Excel", modifie: "2026-04-01", auteur: "Rich (CRO)" },
        { id: "d29", titre: "Budget rewards program", type: "finance", format: "Excel", modifie: "2026-03-25", auteur: "Frank (CFO)" },
      ],
      jalons: [
        { date: "2026-03-15", label: "Kickoff chantier", done: true },
        { date: "2026-04-15", label: "Benchmark terminé", done: true },
        { date: "2026-05-15", label: "Design programme validé", done: false },
        { date: "2026-06-30", label: "Développement portail", done: false },
        { date: "2026-08-15", label: "Lancement programme", done: false },
      ],
      dateMaj: "2026-04-10",
      sante: { score: 60, tendance: "down", burnRate: "35%", roi: "2.5x projeté" },
      decisions: [
        { date: "2026-04-10", decision: "Programme à 3 tiers: Bronze, Argent, Or", decideur: "Rich (CRO)", rationnel: "Simple à comprendre pour les clients, scalable" },
        { date: "2026-03-20", decision: "Gamification intégrée dès le V1", decideur: "Mathilde (CMO)", rationnel: "Les benchmarks montrent +40% d'engagement avec gamification" },
      ],
      conferences: [
        { id: "conf-5", date: "2026-04-08", titre: "Design review programme fidélisation", participants: ["CROB", "CMOB", "CFOB"], duree: "40 min", resume: "Validation des 3 tiers. Discussion sur le coût des récompenses — Frank veut un cap à 5% du revenu." },
      ],
      activites: [
        { date: "2026-04-10", action: "Décision sur les 3 tiers du programme", auteur: "Rich (CRO)", type: "decision" },
        { date: "2026-04-08", action: "Design review complétée", auteur: "Mathilde (CMO)", type: "commentaire" },
        { date: "2026-04-01", action: "Benchmark de 10 programmes B2B livré", auteur: "Mathilde (CMO)", type: "livrable" },
        { date: "2026-03-15", action: "Chantier fidélisation lancé", auteur: "CarlOS", type: "creation" },
      ],
      projets: [
        { id: 105, titre: "Design du programme loyalty", description: "Concevoir les tiers, récompenses et mécaniques de fidélisation. Valider avec un panel de 10 clients.", phase: "creation", progression: 55, botPrimaire: "CMOB", echeance: "2026-05-15",
          objectifs: ["3 tiers de fidélisation définis", "Catalogue de 20 récompenses", "Mécaniques de gamification validées"],
          livrables: ["Document de design", "Maquettes UI", "Plan de test client"], budget: "20 000 $",
          documents: [
            { id: "d30", titre: "Loyalty-design-v2.fig", type: "design", format: "Figma", modifie: "2026-04-08", auteur: "Mathilde (CMO)" },
            { id: "d31", titre: "Tiers et rewards matrix", type: "stratégie", format: "Google Sheets", modifie: "2026-04-05", auteur: "Rich (CRO)" },
          ],
          jalons: [{ date: "2026-04-01", label: "Benchmark complété", done: true }, { date: "2026-04-20", label: "Tiers définis", done: false }, { date: "2026-05-15", label: "Design validé", done: false }],
          missions: [
            { id: 1005, titre: "Benchmark programmes existants", description: "Étudier les meilleurs programmes de fidélisation B2B (Salesforce, HubSpot, Slack, etc.).", phase: "retroaction", progression: 100, botPrimaire: "CMOB", echeance: "2026-04-01",
              livrables: ["Rapport benchmark 10 programmes", "Matrice de comparaison", "Recommandations"],
              documents: [{ id: "d32", titre: "Benchmark-B2B-loyalty.pdf", type: "recherche", format: "PDF", modifie: "2026-03-30", auteur: "Mathilde (CMO)" }],
              jalons: [{ date: "2026-04-01", label: "Benchmark livré", done: true }],
              taches: [
                { id: 10009, titre: "Analyser 10 programmes B2B leaders", description: "Documenter les mécaniques de Salesforce, HubSpot, Slack, Notion, Figma, Linear, Atlassian, Datadog, Stripe, Twilio.", phase: "retroaction", progression: 100, assignee: "Mathilde (CMO)", echeance: "2026-03-25",
                  documents: [{ id: "d33", titre: "Fiches programmes", type: "recherche", format: "Notion", modifie: "2026-03-24", auteur: "Mathilde (CMO)" }],
                  jalons: [{ date: "2026-03-25", label: "10 fiches rédigées", done: true }] },
              ] },
          ] },
      ] },
  ],
  CTOB: [
    { id: 4, titre: "Refonte architecture microservices", description: "Découper le monolithe en microservices pour améliorer la scalabilité et la vélocité de développement.", phase: "execution", progression: 45, dateDebut: "2026-03-01", echeance: "2026-07-31", botPrimaire: "CTOB", botCodes: ["CTOB", "CISOB"],
      objectifs: ["Découper 8 domaines en services indépendants", "Réduire le temps de déploiement de 4h à 15min", "Atteindre 99.9% uptime"],
      budget: "90 000 $", risques: ["Complexité de la migration de données entre services", "Performance des appels inter-services"],
      documents: [
        { id: "dt1", titre: "Architecture microservices v3", type: "technique", format: "Diagramme", modifie: "2026-04-10", auteur: "Tim (CTO)" },
        { id: "dt2", titre: "ADR-001 — Choix message broker", type: "décision", format: "Markdown", modifie: "2026-03-20", auteur: "Tim (CTO)" },
      ],
      jalons: [
        { date: "2026-03-01", label: "Kickoff architecture", done: true },
        { date: "2026-04-01", label: "Service auth extrait", done: true },
        { date: "2026-05-15", label: "Service billing extrait", done: false },
        { date: "2026-07-31", label: "8 services opérationnels", done: false },
      ],
      projets: [
        { id: 106, titre: "Service authentification", description: "Extraire l'auth en microservice avec JWT + OAuth2. Zero downtime migration.", phase: "retroaction", progression: 95, botPrimaire: "CTOB", echeance: "2026-05-01",
          objectifs: ["JWT refresh tokens", "OAuth2 flows", "Rate limiting"], livrables: ["Service Go déployé", "Documentation API", "Tests E2E"], budget: "15 000 $",
          documents: [{ id: "dt3", titre: "auth-service/README.md", type: "doc", format: "Markdown", modifie: "2026-04-10", auteur: "Tim (CTO)" }],
          jalons: [{ date: "2026-04-01", label: "MVP auth service", done: true }, { date: "2026-04-20", label: "Migration traffic", done: true }, { date: "2026-05-01", label: "Ancien code retiré", done: false }],
          missions: [
            { id: 1006, titre: "Implémenter JWT refresh tokens", description: "Ajouter le mécanisme de refresh avec rotation et invalidation automatique.", phase: "retroaction", progression: 100, botPrimaire: "CTOB", echeance: "2026-04-20",
              livrables: ["Endpoint /auth/refresh", "Tests unitaires", "Documentation Swagger"],
              documents: [{ id: "dt4", titre: "jwt-refresh.go", type: "code", format: "Go", modifie: "2026-04-18", auteur: "Tim (CTO)" }],
              jalons: [{ date: "2026-04-20", label: "Déployé en prod", done: true }],
              taches: [
                { id: 10010, titre: "Coder le endpoint /auth/refresh", description: "Implémenter la rotation de tokens avec invalidation de l'ancien. Inclure le rate limiting par IP.", phase: "retroaction", progression: 100, assignee: "Tim (CTO)", echeance: "2026-04-15",
                  documents: [{ id: "dt5", titre: "refresh_handler.go", type: "code", format: "Go", modifie: "2026-04-14", auteur: "Tim (CTO)" }],
                  jalons: [{ date: "2026-04-15", label: "Code mergé", done: true }] },
              ] },
          ] },
        { id: 107, titre: "Service facturation", description: "Microservice de billing avec Stripe integration et gestion des abonnements.", phase: "execution", progression: 35, botPrimaire: "CFOB", echeance: "2026-06-15",
          objectifs: ["Stripe webhooks", "Dashboard revenus", "Relances automatiques"], livrables: ["Service Python déployé", "Dashboard Metabase", "Alertes Slack"], budget: "25 000 $",
          documents: [{ id: "dt6", titre: "billing-service/architecture.md", type: "technique", format: "Markdown", modifie: "2026-04-05", auteur: "Frank (CFO)" }],
          jalons: [{ date: "2026-04-15", label: "Stripe connecté", done: true }, { date: "2026-05-15", label: "Webhooks opérationnels", done: false }, { date: "2026-06-15", label: "Dashboard live", done: false }],
          missions: [
            { id: 1007, titre: "Intégration Stripe", description: "Connecter l'API Stripe pour les paiements récurrents et gérer les webhooks.", phase: "execution", progression: 40, botPrimaire: "CFOB", echeance: "2026-05-15",
              livrables: ["Webhooks configurés", "Tests de paiement", "Monitoring erreurs"],
              documents: [{ id: "dt7", titre: "stripe-webhook-handler.py", type: "code", format: "Python", modifie: "2026-04-08", auteur: "Frank (CFO)" }],
              jalons: [{ date: "2026-04-15", label: "API connectée", done: true }, { date: "2026-05-15", label: "Webhooks live", done: false }],
              taches: [
                { id: 10011, titre: "Configurer webhooks Stripe", description: "Écouter payment_intent.succeeded, invoice.paid, subscription.updated. Gérer les retries et les erreurs.", phase: "execution", progression: 60, assignee: "Frank (CFO)", echeance: "2026-05-01",
                  documents: [{ id: "dt8", titre: "webhook_config.json", type: "config", format: "JSON", modifie: "2026-04-10", auteur: "Frank (CFO)" }],
                  jalons: [{ date: "2026-04-20", label: "3/6 events configurés", done: true }, { date: "2026-05-01", label: "6/6 events live", done: false }] },
                { id: 10012, titre: "Dashboard revenus temps réel", description: "Afficher MRR, churn, ARPU, LTV en temps réel avec alertes sur anomalies.", phase: "discussion", progression: 0, assignee: "Frank (CFO)", echeance: "2026-06-01",
                  documents: [], jalons: [{ date: "2026-05-15", label: "Maquette validée", done: false }, { date: "2026-06-01", label: "Dashboard déployé", done: false }] },
              ] },
          ] },
      ] },
  ],
  CMOB: [
    { id: 5, titre: "Campagne lancement produit V2", description: "Orchestrer le lancement marketing du produit V2 sur tous les canaux. Vidéo, landing page, PR, social media, email nurturing.", phase: "creation", progression: 50, dateDebut: "2026-03-15", echeance: "2026-06-15", botPrimaire: "CMOB", botCodes: ["CMOB", "CROB"],
      objectifs: ["Générer 10K visiteurs uniques jour du lancement", "Obtenir 500 inscriptions en 48h", "Coverage dans 5 médias spécialisés"],
      budget: "60 000 $", risques: ["Retard vidéo = décalage lancement", "Budget média insuffisant si CPC élevé"],
      documents: [
        { id: "dm1", titre: "Plan lancement V2", type: "stratégie", format: "PDF", modifie: "2026-04-05", auteur: "Mathilde (CMO)" },
        { id: "dm2", titre: "Brief créatif vidéo", type: "brief", format: "Google Doc", modifie: "2026-04-01", auteur: "Mathilde (CMO)" },
      ],
      jalons: [
        { date: "2026-03-15", label: "Kickoff campagne", done: true },
        { date: "2026-04-30", label: "Assets créatifs terminés", done: false },
        { date: "2026-05-30", label: "Landing page live", done: false },
        { date: "2026-06-15", label: "Jour de lancement", done: false },
      ],
      projets: [
        { id: 108, titre: "Contenu et assets créatifs", description: "Produire vidéo de présentation, landing page, séquence email et posts sociaux.", phase: "execution", progression: 65, botPrimaire: "CMOB", echeance: "2026-05-30",
          objectifs: ["Vidéo 2min tournée et montée", "Landing page responsive", "10 emails de nurturing"], livrables: ["Vidéo MP4 HD", "Landing page HTML", "Templates emails"], budget: "30 000 $",
          documents: [{ id: "dm3", titre: "Storyboard vidéo", type: "creative", format: "Figma", modifie: "2026-04-03", auteur: "Mathilde (CMO)" }],
          jalons: [{ date: "2026-04-15", label: "Script validé", done: true }, { date: "2026-05-15", label: "Vidéo montée", done: false }, { date: "2026-05-30", label: "Tous assets livrés", done: false }],
          missions: [
            { id: 1008, titre: "Vidéo de présentation 2min", description: "Script, tournage et montage de la vidéo produit avec témoignages clients.", phase: "execution", progression: 70, botPrimaire: "CMOB", echeance: "2026-05-15",
              livrables: ["Script final", "Rush vidéo", "Vidéo montée", "Sous-titres FR/EN"],
              documents: [
                { id: "dm4", titre: "Script-V2-final.docx", type: "script", format: "Word", modifie: "2026-04-10", auteur: "Mathilde (CMO)" },
                { id: "dm5", titre: "Rush tournage 2026-04-12", type: "vidéo", format: "MP4", modifie: "2026-04-12", auteur: "Mathilde (CMO)" },
              ],
              jalons: [{ date: "2026-04-10", label: "Script approuvé", done: true }, { date: "2026-04-12", label: "Tournage terminé", done: true }, { date: "2026-05-01", label: "Premier montage", done: false }, { date: "2026-05-15", label: "Version finale", done: false }],
              taches: [
                { id: 10013, titre: "Écrire le script vidéo", description: "Rédiger le script avec les points clés: problème, solution, preuve sociale, CTA. Inclure les transitions et les notes de réalisation.", phase: "retroaction", progression: 100, assignee: "Mathilde (CMO)", echeance: "2026-04-10",
                  documents: [{ id: "dm6", titre: "Script-draft-v3.docx", type: "script", format: "Word", modifie: "2026-04-08", auteur: "Mathilde (CMO)" }],
                  jalons: [{ date: "2026-04-10", label: "Script validé par Carl", done: true }] },
                { id: 10014, titre: "Montage et post-production", description: "Assembler les séquences, ajouter animations, lower thirds, sous-titres bilingues et musique.", phase: "execution", progression: 40, assignee: "Mathilde (CMO)", echeance: "2026-05-15",
                  documents: [{ id: "dm7", titre: "Timeline Premiere Pro", type: "projet", format: "Premiere", modifie: "2026-04-12", auteur: "Mathilde (CMO)" }],
                  jalons: [{ date: "2026-04-20", label: "Rough cut", done: false }, { date: "2026-05-01", label: "Fine cut", done: false }, { date: "2026-05-15", label: "Master final", done: false }] },
              ] },
          ] },
      ] },
  ],
  CFOB: [
    { id: 6, titre: "Optimisation trésorerie Q2-Q3", description: "Améliorer le BFR et sécuriser le runway pour les 12 prochains mois. Automatiser la facturation et réduire les délais de paiement.", phase: "execution", progression: 55, dateDebut: "2026-02-01", echeance: "2026-07-31", botPrimaire: "CFOB", botCodes: ["CFOB", "COOB"],
      objectifs: ["Réduire le DSO de 45 à 30 jours", "Augmenter la réserve de cash de 200K$", "Automatiser 80% de la facturation"],
      budget: "40 000 $", risques: ["Clients résistants aux nouvelles conditions de paiement", "Intégration ERP complexe"],
      documents: [
        { id: "df1", titre: "Plan trésorerie Q2-Q3", type: "finance", format: "Excel", modifie: "2026-04-08", auteur: "Frank (CFO)" },
        { id: "df2", titre: "Analyse DSO par client", type: "données", format: "Excel", modifie: "2026-04-05", auteur: "Frank (CFO)" },
      ],
      jalons: [
        { date: "2026-02-01", label: "Audit trésorerie", done: true },
        { date: "2026-03-15", label: "Nouvelles conditions paiement", done: true },
        { date: "2026-05-01", label: "Facturation automatique live", done: false },
        { date: "2026-07-31", label: "Objectif DSO 30j atteint", done: false },
      ],
      projets: [
        { id: 109, titre: "Automatisation facturation", description: "Mettre en place la facturation automatique, les relances et le suivi des paiements.", phase: "execution", progression: 70, botPrimaire: "CFOB", echeance: "2026-05-01",
          objectifs: ["Templates factures automatiques", "Relances J+7/J+15/J+30", "Dashboard suivi paiements"], livrables: ["Système de facturation", "Templates email relance", "Dashboard"], budget: "15 000 $",
          documents: [{ id: "df3", titre: "Specs facturation auto", type: "specs", format: "PDF", modifie: "2026-03-25", auteur: "Frank (CFO)" }],
          jalons: [{ date: "2026-03-15", label: "Specs validées", done: true }, { date: "2026-04-15", label: "Templates configurés", done: true }, { date: "2026-05-01", label: "Système live", done: false }],
          missions: [
            { id: 1009, titre: "Intégrer le système de facturation", description: "Connecter ERP → facturation automatique → relances → dashboard de suivi.", phase: "execution", progression: 70, botPrimaire: "CFOB", echeance: "2026-05-01",
              livrables: ["Connecteur ERP", "Engine de relance", "Dashboard revenus"],
              documents: [{ id: "df4", titre: "erp-connector.py", type: "code", format: "Python", modifie: "2026-04-10", auteur: "Frank (CFO)" }],
              jalons: [{ date: "2026-04-01", label: "Connecteur ERP prêt", done: true }, { date: "2026-04-20", label: "Relances automatiques testées", done: true }, { date: "2026-05-01", label: "Production", done: false }],
              taches: [
                { id: 10015, titre: "Configurer les templates de factures", description: "Créer les modèles avec branding, termes de paiement, calculs automatiques et numérotation séquentielle.", phase: "retroaction", progression: 100, assignee: "Frank (CFO)", echeance: "2026-04-15",
                  documents: [{ id: "df5", titre: "invoice-template.html", type: "template", format: "HTML", modifie: "2026-04-14", auteur: "Frank (CFO)" }],
                  jalons: [{ date: "2026-04-15", label: "Templates déployés", done: true }] },
              ] },
          ] },
      ] },
  ],
};
// Fallback: départements sans mock spécifique → utiliser CEOB
const getMockChantiers = (botCode: string): MockChantierItem[] => MOCK_CHANTIERS[botCode] || MOCK_CHANTIERS.CEOB || [];

// ── ChantierCard — Card standard pattern SectionView (grid-cols-2, header bg-[#00B4D8]/10) ──
function ChantierCard({ typeLabel, typeIcon: TypeIcon, title, description, phase, progression, subCount, subLabel, echeance, assignee, onAction, onClick }: {
  typeLabel: string; typeIcon: React.ElementType;
  title: string; description?: string; phase: PhaseKey; progression: number;
  subCount?: number; subLabel?: string; echeance?: string; assignee?: string;
  onAction?: (phase: PhaseKey, ctx: string) => void; onClick: () => void;
}) {
  const ps = PHASE_COLORS[phase];
  return (
    <div className="group relative rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10 rounded-t-xl">
        <TypeIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">{typeLabel}</span>
        <span className="text-sm font-bold text-gray-900 truncate flex-1">{title}</span>
        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", ps.badge)}>
          <span className={cn("w-2 h-2 rounded-full", ps.dot)} />{ps.label}
        </span>
      </div>
      <div className="px-4 py-3 space-y-2">
        {description && <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{description}</p>}
        <ProgressMiniPhased value={progression} phase={phase} />
        <div className="flex items-center gap-3 text-[9px] text-gray-400">
          {subCount !== undefined && <span>{subCount} {subLabel || "éléments"}</span>}
          {assignee && <span>{assignee}</span>}
          {echeance && <span>{echeance}</span>}
        </div>
      </div>
      {onAction && <WorkActionsOverlay context={title} onAction={onAction} />}
    </div>
  );
}

// ── ChantierEntityDetail — Fiche detail inline (pattern PlaybookFicheDetailInline) ──
function ChantierEntityDetail({ type, title, description, phase, progression, echeance, dateDebut, dateMaj, botPrimaire, botCodes, objectifs, budget, risques, livrables, documents, jalons, sante, raci, decisions, conferences, activites, retrospective, criteresAcceptation, dependances, equipe, instructions, validateur, tempsEstime, tempsReel, subItems, onSubItemClick, subTitle, subCount, extraContent, onBack, onAction, backLabel }: {
  type: "chantier" | "projet" | "mission" | "tache";
  title: string; description?: string; phase: PhaseKey; progression: number;
  echeance?: string; dateDebut?: string; dateMaj?: string; botPrimaire?: string; botCodes?: string[];
  objectifs?: string[]; budget?: string; risques?: string[]; livrables?: string[];
  documents?: MockDocument[]; jalons?: MockJalon[];
  sante?: { score: number; tendance: "up" | "down" | "stable"; burnRate?: string; roi?: string };
  raci?: MockRACIItem[]; decisions?: MockDecisionLog[]; conferences?: MockConferenceAI[];
  activites?: MockActivityLog[]; retrospective?: { positifs: string[]; negatifs: string[]; actions: string[] };
  criteresAcceptation?: MockCriterion[]; dependances?: MockDependency[]; equipe?: string[];
  instructions?: string; validateur?: string; tempsEstime?: string; tempsReel?: string;
  subItems?: Array<{ id: number; titre: string; phase: PhaseKey; progression: number; echeance?: string; assignee?: string; subCount?: number; subLabel?: string }>;
  onSubItemClick?: (id: number) => void; subTitle?: string; subCount?: number;
  extraContent?: React.ReactNode;
  onBack: () => void; onAction?: (phase: PhaseKey, ctx: string) => void; backLabel: string;
}) {
  const ps = PHASE_COLORS[phase];
  const TypeIcon = type === "chantier" ? Flame : type === "projet" ? FolderOpen : type === "mission" ? Target : ListChecks;
  const gradients: Record<string, string> = { chantier: "from-orange-500 to-amber-500", projet: "from-blue-500 to-cyan-500", mission: "from-green-500 to-emerald-500", tache: "from-violet-500 to-purple-500" };
  const typeLabels: Record<string, string> = { chantier: "Chantier", projet: "Projet", mission: "Mission", tache: "Tâche" };
  const subTypeLabels: Record<string, string> = { projets: "Projets", missions: "Missions", "tâches": "Tâches", détails: "Détails" };
  const subTypeIcons: Record<string, React.ElementType> = { projets: FolderOpen, missions: Target, "tâches": ListChecks, détails: FileText };
  const SubIcon = subTitle ? (subTypeIcons[subTitle] || Layers) : Layers;

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
        <ChevronRight className="h-3.5 w-3.5 rotate-180" /> {backLabel}
      </button>
          {/* Hero + Details grid-cols-5 */}
          <div className="grid grid-cols-5 gap-3">
            <div className={cn("col-span-3 relative bg-gradient-to-r rounded-xl overflow-hidden shadow-sm", gradients[type])}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <TypeIcon className="h-5 w-5 text-white" />
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white uppercase tracking-wider">{typeLabels[type]}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white bg-white/15 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60" />{ps.label}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
                {description && <p className="text-xs text-white/80 leading-relaxed line-clamp-3">{description}</p>}
                <div className="flex items-center gap-3 text-[10px] text-white/70">
                  <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />{progression}%</span>
                  {echeance && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{echeance}</span>}
                  {subCount !== undefined && <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" />{subCount} {subTitle}</span>}
                </div>
                {onAction && (
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    {WORK_ACTIONS.map(wa => (
                      <button key={wa.key} onClick={(e) => { e.stopPropagation(); onAction(wa.key, title); }}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-bold text-white bg-white/15 hover:bg-white/25 rounded-lg cursor-pointer transition-colors">
                        <wa.icon className="h-3.5 w-3.5" /> {wa.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-2 rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white flex flex-col">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                <Settings className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                <span className="text-sm font-bold text-gray-900">Détails</span>
              </div>
              <div className="px-4 py-3 space-y-1.5 flex-1">
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Phase</span>
                  <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1", ps.badge)}><span className={cn("w-2 h-2 rounded-full", ps.dot)} />{ps.label}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Progression</span>
                  <span className="text-xs font-bold text-gray-700">{progression}%</span>
                </div>
                {botPrimaire && BOT_DISPLAY[botPrimaire] && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Responsable</span>
                    <div className="flex items-center gap-1.5">
                      {BOT_AVATAR_MAP[botPrimaire] && <img src={BOT_AVATAR_MAP[botPrimaire]} className="h-5 w-5 rounded-full object-cover" alt="" />}
                      <span className="text-xs font-bold text-gray-700">{BOT_DISPLAY[botPrimaire]?.name || botPrimaire}</span>
                    </div>
                  </div>
                )}
                {echeance && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Échéance</span>
                    <span className="text-xs font-bold text-gray-700">{echeance}</span>
                  </div>
                )}
                {dateMaj && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Mise à jour</span>
                    <span className="text-xs font-bold text-gray-500">{dateMaj}</span>
                  </div>
                )}
                <div className="pt-1"><ProgressMiniPhased value={progression} phase={phase} /></div>
              </div>
            </div>
          </div>

      {/* ── ZONE 1: Sous-éléments (projets/missions/tâches) — box liste compacte ── */}
      {subItems && subItems.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <SubIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">{subTypeLabels[subTitle || ""] || subTitle}</span>
            <span className="text-[9px] text-gray-400 ml-auto">{subItems.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {subItems.map(item => {
              const ips = PHASE_COLORS[item.phase];
              return (
                <div key={item.id} onClick={() => onSubItemClick?.(item.id)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors">
                  <SubIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="text-xs font-bold text-gray-900 flex-1 min-w-0 truncate">{item.titre}</span>
                  <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", ips.badge)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", ips.dot)} />{ips.label}
                  </span>
                  <div className="w-20 shrink-0"><ProgressMiniPhased value={item.progression} phase={item.phase} /></div>
                  {item.subCount !== undefined && <span className="text-[9px] text-gray-400 shrink-0">{item.subCount} {item.subLabel}</span>}
                  {item.echeance && <span className="text-[9px] text-gray-400 shrink-0">{item.echeance}</span>}
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Smart detail blocks grid — packing intelligent par zones sémantiques ── */}
      {(() => {
        // Collect all visible detail blocks with weight (1=compact, 2=large)
        const dBlocks: { key: string; w: 1 | 2; node: React.ReactNode }[] = [];
        const formatColors: Record<string, string> = { PDF: "bg-red-100 text-red-700", XLSX: "bg-green-100 text-green-700", DOCX: "bg-blue-100 text-blue-700", PPTX: "bg-orange-100 text-orange-700", MD: "bg-gray-100 text-gray-700", JSON: "bg-violet-100 text-violet-700", SQL: "bg-cyan-100 text-cyan-700", PY: "bg-yellow-100 text-yellow-700" };

        if (objectifs && objectifs.length > 0) dBlocks.push({ key: "obj", w: objectifs.length > 4 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Target className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Objectifs</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {objectifs.map((obj, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 leading-relaxed">{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )});
        if (botCodes && botCodes.length > 0) dBlocks.push({ key: "team", w: botCodes.length > 4 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Équipe</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {botCodes.map(code => (
                <div key={code} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                  {BOT_AVATAR_MAP[code] && <img src={BOT_AVATAR_MAP[code]} className="h-7 w-7 rounded-full ring-2 ring-white/80 object-cover shrink-0" alt="" />}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-gray-800 block">{BOT_DISPLAY[code]?.name || code}</span>
                    <span className="text-[10px] text-gray-500">{BOT_DISPLAY[code]?.role || ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )});
        if (budget) dBlocks.push({ key: "budget", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <DollarSign className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Budget</span>
            </div>
            <div className="px-4 py-3">
              <div className="text-lg font-bold text-gray-900">{budget}</div>
              <div className="flex items-center gap-1.5 mt-1.5"><ProgressMiniPhased value={progression} phase={phase} /></div>
              <span className="text-[9px] text-gray-400 mt-1 block">{progression}% du budget consommé</span>
            </div>
          </div>
        )});
        if (risques && risques.length > 0) dBlocks.push({ key: "risques", w: risques.length > 3 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <AlertTriangle className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Risques</span>
              <span className="text-[9px] text-gray-400 ml-auto">{risques.length}</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {risques.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
          </div>
        )});
        if (jalons && jalons.length > 0) dBlocks.push({ key: "jalons", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Calendar className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Timeline — Jalons</span>
              <span className="text-[9px] text-gray-400 ml-auto">{jalons.filter(j => j.done).length}/{jalons.length} complétés</span>
            </div>
            <div className="px-4 py-3">
              {dateDebut && echeance && (
                <div className="flex items-center gap-2 mb-3 text-[10px] text-gray-500">
                  <span>Début: <span className="font-bold text-gray-700">{dateDebut}</span></span>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span>Fin: <span className="font-bold text-gray-700">{echeance}</span></span>
                </div>
              )}
              <div className="space-y-1.5">
                {jalons.map((j, i) => (
                  <div key={i} className="group relative flex items-center gap-2.5">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2", j.done ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-300")}>
                      {j.done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className="text-[10px] text-gray-400 w-20 shrink-0">{j.date}</span>
                    <span className={cn("text-xs leading-tight flex-1", j.done ? "text-gray-500 line-through" : "text-gray-800 font-medium")}>{j.label}</span>
                    {onAction && <WorkActionsOverlay context={`Jalon: ${j.label}`} onAction={onAction} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )});
        if (livrables && livrables.length > 0) dBlocks.push({ key: "livrables", w: livrables.length > 4 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Package className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Livrables attendus</span>
              <span className="text-[9px] text-gray-400 ml-auto">{livrables.length}</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {livrables.map((l, i) => (
                <div key={i} className="group relative flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <CheckSquare className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span className="text-xs text-gray-700">{l}</span>
                  {onAction && <WorkActionsOverlay context={`Livrable: ${l}`} onAction={onAction} />}
                </div>
              ))}
            </div>
          </div>
        )});
        if (documents && documents.length > 0) dBlocks.push({ key: "docs", w: documents.length > 3 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <FileText className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Documents liés</span>
              <span className="text-[9px] text-gray-400 ml-auto">{documents.length}</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {documents.map(doc => (
                <div key={doc.id} className="group relative flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors cursor-pointer">
                  <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-gray-800 block truncate">{doc.titre}</span>
                    <span className="text-[9px] text-gray-400">{doc.auteur} — {doc.modifie}</span>
                  </div>
                  <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded", formatColors[doc.format] || "bg-gray-100 text-gray-600")}>{doc.format}</span>
                  {onAction && <WorkActionsOverlay context={`Document: ${doc.titre}`} onAction={onAction} />}
                </div>
              ))}
            </div>
          </div>
        )});

        // ── BOX 1: Santé & KPIs (chantier, projet) ──
        if (sante) dBlocks.push({ key: "sante", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Stethoscope className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Santé & KPIs</span>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className={cn("text-2xl font-black", sante.score >= 70 ? "text-emerald-600" : sante.score >= 40 ? "text-amber-500" : "text-red-500")}>{sante.score}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    {sante.tendance === "up" ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : sante.tendance === "down" ? <TrendingDown className="h-3.5 w-3.5 text-red-500" /> : <Activity className="h-3.5 w-3.5 text-gray-400" />}
                    <span className="text-[10px] text-gray-500">{sante.tendance === "up" ? "En hausse" : sante.tendance === "down" ? "En baisse" : "Stable"}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                    <div className={cn("h-full rounded-full", sante.score >= 70 ? "bg-emerald-500" : sante.score >= 40 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${sante.score}%` }} />
                  </div>
                </div>
              </div>
              {sante.burnRate && <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5"><span className="text-[10px] text-gray-400">Burn rate</span><span className="text-xs font-bold text-gray-700">{sante.burnRate}</span></div>}
              {sante.roi && <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5"><span className="text-[10px] text-gray-400">ROI</span><span className="text-xs font-bold text-gray-700">{sante.roi}</span></div>}
            </div>
          </div>
        )});

        // ── BOX 2: Matrice RACI (chantier, projet) ──
        if (raci && raci.length > 0) dBlocks.push({ key: "raci", w: raci.length > 4 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Matrice RACI</span>
              <span className="text-[9px] text-gray-400 ml-auto">{raci.length}</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {raci.map((r, i) => {
                const raciColors: Record<string, string> = { R: "bg-blue-100 text-blue-700", A: "bg-red-100 text-red-700", C: "bg-amber-100 text-amber-700", I: "bg-gray-100 text-gray-600" };
                const raciLabels: Record<string, string> = { R: "Responsable", A: "Approbateur", C: "Consulté", I: "Informé" };
                return (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded", raciColors[r.type])}>{r.type}</span>
                    {BOT_AVATAR_MAP[r.bot] && <img src={BOT_AVATAR_MAP[r.bot]} className="h-5 w-5 rounded-full object-cover shrink-0" alt="" />}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-gray-800 block truncate">{r.role}</span>
                      <span className="text-[9px] text-gray-400">{BOT_DISPLAY[r.bot]?.name || r.bot} — {raciLabels[r.type]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )});

        // ── BOX 3: Critères d'acceptation (mission, tâche) ──
        if (criteresAcceptation && criteresAcceptation.length > 0) dBlocks.push({ key: "criteres", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <ClipboardCheck className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Critères d'acceptation</span>
              <span className="text-[9px] text-gray-400 ml-auto">{criteresAcceptation.filter(c => c.done).length}/{criteresAcceptation.length}</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {criteresAcceptation.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center shrink-0", c.done ? "bg-emerald-500 border-emerald-500" : "border-gray-300")}>
                    {c.done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <span className={cn("text-xs leading-relaxed", c.done ? "text-gray-400 line-through" : "text-gray-700")}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        )});

        // ── BOX 4: Journal des décisions (chantier, projet) ──
        if (decisions && decisions.length > 0) dBlocks.push({ key: "decisions", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Gavel className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Journal des décisions</span>
              <span className="text-[9px] text-gray-400 ml-auto">{decisions.length}</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {decisions.map((d, i) => (
                <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 shrink-0">{d.date}</span>
                    <span className="text-xs font-bold text-gray-800 flex-1">{d.decision}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="text-[10px] text-gray-500">{d.decideur}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 italic leading-relaxed">{d.rationnel}</p>
                </div>
              ))}
            </div>
          </div>
        )});

        // ── BOX 5: Dépendances & Bloquants (projet, mission, tâche) ──
        if (dependances && dependances.length > 0) dBlocks.push({ key: "deps", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <GitBranch className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Dépendances</span>
              <span className="text-[9px] text-gray-400 ml-auto">{dependances.length}</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {dependances.map((dep, i) => {
                const statusColors: Record<string, string> = { resolu: "bg-emerald-100 text-emerald-700", "en-cours": "bg-amber-100 text-amber-700", critique: "bg-red-100 text-red-700" };
                const statusLabels: Record<string, string> = { resolu: "Résolu", "en-cours": "En cours", critique: "Critique" };
                return (
                  <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 space-y-1">
                    <div className="flex items-center gap-2">
                      {dep.type === "bloque" ? <Lock className="h-3.5 w-3.5 text-red-400 shrink-0" /> : <Route className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                      <span className="text-xs text-gray-700 flex-1">{dep.label}</span>
                      <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded", statusColors[dep.statut])}>{statusLabels[dep.statut]}</span>
                    </div>
                    <span className="text-[9px] text-gray-400">{dep.type === "bloque" ? "Bloque →" : "Bloqué par ←"} {dep.entite}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )});

        // ── BOX 6: Conférences AI (tous niveaux) ──
        if (conferences && conferences.length > 0) dBlocks.push({ key: "conferences", w: conferences.length > 2 ? 2 : 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Video className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Conférences AI</span>
              <span className="text-[9px] text-gray-400 ml-auto">{conferences.length}</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {conferences.map(conf => (
                <div key={conf.id} className="group relative bg-gray-50 rounded-lg px-3 py-2 space-y-1 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 shrink-0">{conf.date}</span>
                    <span className="text-xs font-bold text-gray-800 flex-1 truncate">{conf.titre}</span>
                    <span className="text-[9px] text-gray-400">{conf.duree}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {conf.participants.slice(0, 4).map(p => BOT_AVATAR_MAP[p] ? <img key={p} src={BOT_AVATAR_MAP[p]} className="h-4 w-4 rounded-full object-cover ring-1 ring-white" alt="" /> : <span key={p} className="text-[8px] text-gray-400">{BOT_DISPLAY[p]?.name?.charAt(0) || p}</span>)}
                    {conf.participants.length > 4 && <span className="text-[8px] text-gray-400">+{conf.participants.length - 4}</span>}
                  </div>
                  {conf.resume && <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2">{conf.resume}</p>}
                  {onAction && <WorkActionsOverlay context={`Conférence: ${conf.titre}`} onAction={onAction} />}
                </div>
              ))}
            </div>
          </div>
        )});

        // ── BOX 7: Logs d'activité (chantier, projet) ──
        if (activites && activites.length > 0) dBlocks.push({ key: "activites", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <ClipboardList className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Logs d'activité</span>
              <span className="text-[9px] text-gray-400 ml-auto">{activites.length} entrées</span>
            </div>
            <div className="px-4 py-3 space-y-1">
              {activites.slice(0, 8).map((a, i) => {
                const typeIcons: Record<string, React.ElementType> = { creation: Plus, modification: PenLine, decision: Gavel, livrable: Package, commentaire: MessageCircle };
                const typeColors: Record<string, string> = { creation: "text-emerald-500", modification: "text-blue-500", decision: "text-amber-500", livrable: "text-violet-500", commentaire: "text-gray-400" };
                const TI = typeIcons[a.type] || Activity;
                return (
                  <div key={i} className="flex items-start gap-2 py-1">
                    <TI className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", typeColors[a.type] || "text-gray-400")} />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-700 leading-relaxed">{a.action}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-gray-400">{a.date}</span>
                        <span className="text-[9px] text-gray-400">— {a.auteur}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )});

        // ── BOX 8: Rétrospective (chantier) ──
        if (retrospective) dBlocks.push({ key: "retro", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <RotateCcw className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Rétrospective</span>
            </div>
            <div className="px-4 py-3 grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Ce qui va bien</span>
                {retrospective.positifs.map((p, i) => <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-emerald-50 rounded px-2 py-1">{p}</div>)}
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> À améliorer</span>
                {retrospective.negatifs.map((n, i) => <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-red-50 rounded px-2 py-1">{n}</div>)}
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1"><Rocket className="h-3.5 w-3.5" /> Actions</span>
                {retrospective.actions.map((a, i) => <div key={i} className="text-[10px] text-gray-600 leading-relaxed bg-blue-50 rounded px-2 py-1">{a}</div>)}
              </div>
            </div>
          </div>
        )});

        // ── BOX tâche: Instructions & Contexte ──
        if (type === "tache" && instructions) dBlocks.push({ key: "instructions", w: 2, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <BookOpen className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Instructions & Contexte</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs text-gray-700 leading-relaxed">{instructions}</p>
              {validateur && <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"><Shield className="h-3.5 w-3.5 text-blue-400 shrink-0" /><span className="text-xs text-gray-600">Validateur: <span className="font-bold">{validateur}</span></span></div>}
            </div>
          </div>
        )});

        // ── BOX tâche: Temps & Délais ──
        if (type === "tache" && (tempsEstime || tempsReel)) dBlocks.push({ key: "temps", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Clock className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Temps & Délais</span>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {tempsEstime && <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"><span className="text-[10px] text-gray-400">Estimé</span><span className="text-xs font-bold text-gray-700">{tempsEstime}</span></div>}
              {tempsReel && <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"><span className="text-[10px] text-gray-400">Réel</span><span className="text-xs font-bold text-gray-700">{tempsReel}</span></div>}
              {tempsEstime && tempsReel && (() => {
                const est = parseFloat(tempsEstime); const reel = parseFloat(tempsReel);
                if (!isNaN(est) && !isNaN(reel) && est > 0) {
                  const ratio = reel / est;
                  return <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"><span className="text-[10px] text-gray-400">Efficacité</span><span className={cn("text-xs font-bold", ratio <= 1 ? "text-emerald-600" : "text-amber-600")}>{Math.round(ratio * 100)}%</span></div>;
                }
                return null;
              })()}
            </div>
          </div>
        )});

        // ── BOX mission/tâche: Équipe ──
        if ((type === "mission" || type === "tache") && equipe && equipe.length > 0) dBlocks.push({ key: "equipe-mi", w: 1, node: (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
              <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
              <span className="text-sm font-bold text-gray-900">Équipe</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {equipe.map(code => (
                <div key={code} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                  {BOT_AVATAR_MAP[code] && <img src={BOT_AVATAR_MAP[code]} className="h-7 w-7 rounded-full ring-2 ring-white/80 object-cover shrink-0" alt="" />}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-gray-800 block">{BOT_DISPLAY[code]?.name || code}</span>
                    <span className="text-[10px] text-gray-500">{BOT_DISPLAY[code]?.role || ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )});

        if (dBlocks.length === 0) return null;

        // Zone mapping — group blocks by semantic zone for logical flow
        const zoneMap: Record<string, number> = {
          sante: 2, budget: 2, temps: 2,
          obj: 3, team: 3, "equipe-mi": 3, raci: 3, risques: 3, livrables: 3, criteres: 3,
          jalons: 4, deps: 4, docs: 4,
          decisions: 5, conferences: 5, activites: 5,
          retro: 6, instructions: 6,
        };

        // Group blocks by zone
        const zoneGroups: Map<number, typeof dBlocks> = new Map();
        for (const b of dBlocks) {
          const z = zoneMap[b.key] || 3;
          if (!zoneGroups.has(z)) zoneGroups.set(z, []);
          zoneGroups.get(z)!.push(b);
        }

        // Pack a group of blocks into rows (capacity 3, merge solo w=2 pairs)
        const packToRows = (blocks: typeof dBlocks) => {
          const rows: { blocks: typeof dBlocks; totalW: number }[] = [];
          let curRow: typeof dBlocks = [];
          let curW = 0;
          for (const b of blocks) {
            if (curW + b.w > 3) {
              if (curRow.length > 0) rows.push({ blocks: curRow, totalW: curW });
              curRow = [b]; curW = b.w;
            } else {
              curRow.push(b); curW += b.w;
            }
          }
          if (curRow.length > 0) rows.push({ blocks: curRow, totalW: curW });
          // Merge consecutive solo w=2 rows into pairs
          const merged: typeof rows = [];
          let mi = 0;
          while (mi < rows.length) {
            const cur = rows[mi];
            if (cur.blocks.length === 1 && cur.blocks[0].w === 2 && mi + 1 < rows.length && rows[mi + 1].blocks.length === 1 && rows[mi + 1].blocks[0].w === 2) {
              merged.push({ blocks: [cur.blocks[0], rows[mi + 1].blocks[0]], totalW: 4 });
              mi += 2;
            } else { merged.push(cur); mi++; }
          }
          return merged;
        };

        const renderRow = (row: { blocks: typeof dBlocks; totalW: number }, ri: number) => {
          const n = row.blocks.length;
          if (n === 2 && row.totalW === 4) return <div key={ri} className="grid grid-cols-2 gap-3">{row.blocks.map(b => <div key={b.key}>{b.node}</div>)}</div>;
          if (n === 1) return <div key={ri}>{row.blocks[0].node}</div>;
          if (n === 2 && row.totalW === 2) return <div key={ri} className="grid grid-cols-2 gap-3">{row.blocks.map(b => <div key={b.key}>{b.node}</div>)}</div>;
          if (n === 3) return <div key={ri} className="grid grid-cols-3 gap-3">{row.blocks.map(b => <div key={b.key}>{b.node}</div>)}</div>;
          if (n === 2 && row.totalW === 3) return <div key={ri} className="grid grid-cols-3 gap-3">{row.blocks.map(b => <div key={b.key} className={b.w === 2 ? "col-span-2" : ""}>{b.node}</div>)}</div>;
          return <div key={ri} className="grid grid-cols-2 gap-3">{row.blocks.map(b => <div key={b.key}>{b.node}</div>)}</div>;
        };

        // Render zones in order (2→3→4→5→6)
        return Array.from(zoneGroups.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([zoneNum, zoneBlocks]) => {
            const rows = packToRows(zoneBlocks);
            return <div key={`z${zoneNum}`} className="space-y-3">{rows.map((r, ri) => renderRow(r, ri))}</div>;
          });
      })()}

      {/* Extra content (tâche-detail actions) */}
      {extraContent && (
        <div className="space-y-3">{extraContent}</div>
      )}

    </div>
  );
}

// ── SubElementsToolbar — Toolbar viewMode (cards/list/table) pour sous-éléments drill-down ──
function SubElementsToolbar({ viewMode, onViewMode, count, label }: { viewMode: "cards" | "list" | "table"; onViewMode: (m: "cards" | "list" | "table") => void; count: number; label: string }) {
  const views = [
    { key: "cards" as const, icon: LayoutGrid, tip: "Cartes" },
    { key: "list" as const, icon: LayoutList, tip: "Liste" },
    { key: "table" as const, icon: Table2, tip: "Tableau" },
  ];
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
        {views.map(v => (
          <button key={v.key} onClick={() => onViewMode(v.key)} title={v.tip}
            className={cn("p-1.5 rounded-md cursor-pointer transition-colors", viewMode === v.key ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>
            <v.icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
      <div className="flex-1" />
      <span className={SF.itemCount}>{count} {label}</span>
    </div>
  );
}

// ── SubElementsList — Rendu en mode liste ──
function SubElementsList({ items, onAction }: { items: { typeLabel: string; typeIcon: React.ElementType; title: string; phase: PhaseKey; progression: number; echeance?: string; assignee?: string; onClick: () => void }[]; onAction?: (phase: PhaseKey, ctx: string) => void }) {
  return (
    <div className="space-y-1">
      {items.map((item, i) => {
        const ps = PHASE_COLORS[item.phase];
        return (
          <div key={i} onClick={item.onClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
            <item.typeIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-xs font-bold text-gray-900 flex-1 min-w-0 truncate">{item.title}</span>
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0", ps.badge)}><span className={cn("w-1.5 h-1.5 rounded-full", ps.dot)} />{ps.label}</span>
            <div className="w-16 shrink-0"><ProgressMiniPhased value={item.progression} phase={item.phase} /></div>
            {item.echeance && <span className="text-[9px] text-gray-400 shrink-0">{item.echeance}</span>}
            {item.assignee && <span className="text-[9px] text-gray-500 shrink-0">{item.assignee}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ── SubElementsTable — Rendu en mode tableau ──
function SubElementsTable({ items, onAction }: { items: { typeLabel: string; title: string; phase: PhaseKey; progression: number; echeance?: string; assignee?: string; onClick: () => void }[]; onAction?: (phase: PhaseKey, ctx: string) => void }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Nom</th>
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Phase</th>
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase w-24">Progression</th>
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Échéance</th>
            <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Assigné</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const ps = PHASE_COLORS[item.phase];
            return (
              <tr key={i} onClick={item.onClick} className="border-b border-gray-100 last:border-0 hover:bg-blue-50/50 cursor-pointer transition-colors">
                <td className="px-3 py-2 font-medium text-gray-900">{item.title}</td>
                <td className="px-3 py-2"><span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", ps.badge)}>{ps.label}</span></td>
                <td className="px-3 py-2"><ProgressMiniPhased value={item.progression} phase={item.phase} /></td>
                <td className="px-3 py-2 text-gray-500">{item.echeance || "—"}</td>
                <td className="px-3 py-2 text-gray-500">{item.assignee || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ChantierView({ botCode, showHeader = true, onAction }: { botCode: string; showHeader?: boolean; onAction?: (phase: PhaseKey, ctx: string) => void }) {
  // API data (real DB) + mock data (simulation réaliste)
  const { chantiers: apiChantiers, loading: loadingCh } = useChantiers();
  const mockData = getMockChantiers(botCode);
  const [selectedDept, setSelectedDept] = useState(botCode);
  const [level, setLevel] = useState<ChantierLevel>("chantiers");
  const [selectedChantier, setSelectedChantier] = useState<number | null>(null);
  const [selectedProjet, setSelectedProjet] = useState<number | null>(null);
  const [selectedMission, setSelectedMission] = useState<number | null>(null);
  const [detailTache, setDetailTache] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPhase, setFilterPhase] = useState<string>("all");
  const [sortKey, setSortKey] = useState<ChantierSortKey>("phase");
  const [subViewMode, setSubViewMode] = useState<"cards" | "list" | "table">("cards");

  // Sync quand botCode change
  useEffect(() => { setSelectedDept(botCode); resetNav(); }, [botCode]);
  const resetNav = () => { setLevel("chantiers"); setSelectedChantier(null); setSelectedProjet(null); setSelectedMission(null); setDetailTache(null); };

  // Merge API + mock — mock data toujours visible pour la simulation
  const deptMock = selectedDept === botCode ? mockData : getMockChantiers(selectedDept);
  const allChantiers = deptMock;

  // Filter + sort
  const filtered = allChantiers
    .filter(c => !searchTerm || c.titre.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(c => filterPhase === "all" || c.phase === filterPhase)
    .sort((a, b) => {
      if (sortKey === "phase") { const phaseOrder: Record<string, number> = { discussion: 0, reflexion: 1, creation: 2, execution: 3, retroaction: 4 }; return (phaseOrder[a.phase] ?? 5) - (phaseOrder[b.phase] ?? 5); }
      if (sortKey === "progression") return b.progression - a.progression;
      if (sortKey === "alpha") return a.titre.localeCompare(b.titre);
      return 0;
    });

  // Drill-down selections
  const selCh = allChantiers.find(c => c.id === selectedChantier);
  const selPr = selCh?.projets.find(p => p.id === selectedProjet);
  const selMi = selPr?.missions.find(m => m.id === selectedMission);
  const selTa = selMi?.taches.find(t => t.id === detailTache);

  // Top 3 = highest progression in execution phase
  const top3 = [...allChantiers].sort((a, b) => {
    const phaseWeight: Record<string, number> = { execution: 3, creation: 2, reflexion: 1, retroaction: 0, discussion: 0 };
    return (phaseWeight[b.phase] ?? 0) - (phaseWeight[a.phase] ?? 0) || b.progression - a.progression;
  }).slice(0, 3);

  return (
    <div className="space-y-3">
      {/* 1. LIVING HERO — Pattern SectionView */}
      {showHeader && level === "chantiers" && (
        <LivingHero blur1="bg-orange-100/70" blur2="bg-amber-100/60" subtitleColor="text-orange-600" subtitle="Gestion & Vélocité" title="Vos visions, érigées brique par brique." description="Suivez l'avancement stratégique, consolidez vos sprints et regardez vos chantiers prendre vie.">
          <div className="relative w-[360px] h-[140px]">
            <div className="absolute right-[30px] bottom-[-20px] w-48 h-32 flex items-end justify-between px-4 opacity-50 space-x-2">
              <div className="w-12 bg-orange-200 border-t-4 border-orange-400 anim-block-1" />
              <div className="w-12 bg-amber-200 border-t-4 border-amber-400 anim-block-2" />
              <div className="w-12 bg-orange-300 border-t-4 border-orange-500 anim-block-3" />
            </div>
            <div className="glass-base absolute right-[70px] top-[10px] w-64 h-32 p-4 border-orange-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sprints Q2</h4>
                <div className="w-4 h-4 rounded bg-orange-100 text-orange-500 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
              </div>
              <div className="space-y-3">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative"><div className="absolute left-0 top-0 bottom-0 w-[60%] bg-orange-400 rounded-full" /></div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative"><div className="absolute left-0 top-0 bottom-0 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b] anim-progress" /></div>
              </div>
            </div>
          </div>
        </LivingHero>
      )}

      {/* 2. TOP 3 VEDETTES — Pattern SectionView (grid-cols-3 + CockpitSectionHeader) */}
      {level === "chantiers" && top3.length > 0 && (
        <div>
          <CockpitSectionHeader icon={Flame} title={`Top 3 — Chantiers prioritaires${selectedDept !== "CEOB" ? ` (${DEPT_SHORT_LABEL[selectedDept] || selectedDept})` : ""}`} count={allChantiers.length} color="text-orange-500" />
          <div className="grid grid-cols-3 gap-3">
            {top3.map((ch, i) => {
              const ps = PHASE_COLORS[ch.phase];
              const gradient = i === 0 ? "from-orange-500 to-amber-500" : i === 1 ? "from-blue-500 to-cyan-500" : "from-emerald-500 to-teal-500";
              return (
                <div key={ch.id} className={cn("group relative rounded-xl p-4 hover:shadow-lg transition-shadow bg-gradient-to-r cursor-pointer", gradient)} onClick={() => { setSelectedChantier(ch.id); setLevel("projets"); }}>
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <Flame className="h-3.5 w-3.5 text-white/80" />
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white uppercase tracking-wider">Chantier</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60" />{ps.label}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-tight">{ch.titre}</h4>
                  <p className="text-[9px] text-white/80 mt-1.5 leading-relaxed line-clamp-2">{ch.description}</p>
                  <div className="flex items-center gap-3 mt-2.5 text-[9px] text-white/70">
                    <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />{ch.progression}%</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{ch.projets.length} projets</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{ch.echeance}</span>
                  </div>
                  {onAction && <WorkActionsOverlay context={ch.titre} onAction={onAction} position="top" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SIDEBAR DÉPARTEMENTS + CONTENT — Pattern SectionView */}
      <div className="flex gap-3">
        {/* Sidebar w-[180px] — départements (comme Cockpit) */}
        {level === "chantiers" && (
          <div className={SF.sidebarW}>
            {/* Vue d'ensemble */}
            <button onClick={() => { setSelectedDept(botCode); resetNav(); }} className={cn(SF.btnBase, selectedDept === botCode && level === "chantiers" ? SF.btnActive : SF.btnInactive)}>
              <Home className={selectedDept === botCode ? SF.iconActive : SF.iconInactive} />
              <span className={selectedDept === botCode ? SF.labelActive : SF.labelInactive}>Vue d'ensemble</span>
              <span className={SF.count}>{getMockChantiers(botCode).length}</span>
            </button>
            <div className={SF.separator} />
            {/* Départements — comme Cockpit sidebar */}
            {(botCode === "CEOB" ? DEPT_ORDER : [botCode]).map(code => {
              const isActive = selectedDept === code && selectedDept !== botCode;
              const Icon = DEPT_DASH_ICON[code] || Zap;
              const label = DEPT_SHORT_LABEL[code] || code;
              const deptCount = getMockChantiers(code).length;
              return (
                <button key={code} onClick={() => { setSelectedDept(code); resetNav(); }}
                  className={cn(SF.btnBase, isActive ? SF.btnActive : SF.btnInactive)}>
                  <Icon className={isActive ? SF.iconActive : SF.iconInactive} />
                  <span className={isActive ? SF.labelActive : SF.labelInactive}>{label}</span>
                  <span className={SF.count}>{deptCount}</span>
                </button>
              );
            })}
            <div className={SF.separator} />
            {/* Filtres par phase */}
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-2.5 pt-1">Phases</span>
            {([
              { key: "all", label: "Toutes", icon: Layers, count: allChantiers.length },
              { key: "discussion", label: "Discussion", icon: MessageCircle, count: allChantiers.filter(c => c.phase === "discussion").length },
              { key: "reflexion", label: "Réflexion", icon: Brain, count: allChantiers.filter(c => c.phase === "reflexion").length },
              { key: "creation", label: "Conception", icon: Hammer, count: allChantiers.filter(c => c.phase === "creation").length },
              { key: "execution", label: "Exécution", icon: Rocket, count: allChantiers.filter(c => c.phase === "execution").length },
              { key: "retroaction", label: "Rétroaction", icon: BarChart3, count: allChantiers.filter(c => c.phase === "retroaction").length },
            ] as const).map(item => {
              const isPhaseActive = filterPhase === item.key;
              const phaseColor = item.key !== "all" ? PHASE_COLORS[item.key as PhaseKey] : null;
              return (
                <button key={item.key} onClick={() => setFilterPhase(item.key)}
                  className={cn(SF.btnBase, isPhaseActive ? SF.btnActive : SF.btnInactive)}>
                  {phaseColor && <span className={cn("w-2 h-2 rounded-full shrink-0", phaseColor.dot)} />}
                  {!phaseColor && <item.icon className={isPhaseActive ? SF.iconActive : SF.iconInactive} />}
                  <span className={isPhaseActive ? SF.labelActive : SF.labelInactive}>{item.label}</span>
                  <span className={SF.count}>{item.count}</span>
                </button>
              );
            })}
            <div className={SF.separator} />
            {/* Sous-sections par type */}
            {[
              { id: "projets", label: "Projets", icon: FolderOpen, count: allChantiers.reduce((s, c) => s + c.projets.length, 0) },
              { id: "missions", label: "Missions", icon: Target, count: allChantiers.reduce((s, c) => s + c.projets.reduce((s2, p) => s2 + p.missions.length, 0), 0) },
              { id: "taches", label: "Tâches", icon: ListChecks, count: allChantiers.reduce((s, c) => s + c.projets.reduce((s2, p) => s2 + p.missions.reduce((s3, m) => s3 + m.taches.length, 0), 0), 0) },
            ].map(item => (
              <button key={item.id} onClick={() => {}} className={cn(SF.btnBase, SF.btnInactive)}>
                <item.icon className={SF.iconInactive} />
                <span className={SF.labelInactive}>{item.label}</span>
                <span className={SF.count}>{item.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Content — Pattern SectionView (grid-cols-2 OU fiche detail) */}
        <div className={SF.content}>
          {/* LEVEL: chantiers — Toolbar + grid-cols-2 cards */}
          {level === "chantiers" && (
            <>
              {/* Toolbar — Pattern SectionView */}
              <div className="space-y-2">
                <div className={SF.searchWrap}>
                  <Search className={SF.searchIcon} />
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher un chantier..." className={SF.searchInput} />
                </div>
                <div className="flex items-center gap-2">
                  <select value={filterPhase} onChange={e => setFilterPhase(e.target.value)} className={SF.select}>
                    <option value="all">Toutes les phases</option>
                    <option value="discussion">Discussion</option>
                    <option value="reflexion">Réflexion</option>
                    <option value="creation">Conception</option>
                    <option value="execution">Exécution</option>
                    <option value="retroaction">Rétroaction</option>
                  </select>
                  <select value={sortKey} onChange={e => setSortKey(e.target.value as ChantierSortKey)} className={SF.select}>
                    <option value="phase">Phase</option>
                    <option value="progression">Progression</option>
                    <option value="recent">Récent</option>
                    <option value="alpha">A → Z</option>
                  </select>
                  <div className="flex-1" />
                  <span className={SF.itemCount}>{filtered.length} chantier{filtered.length > 1 ? "s" : ""}</span>
                </div>
              </div>

              {/* Section header + grid-cols-2 cards */}
              <CockpitSectionHeader icon={Flame} title="Chantiers" count={filtered.length} color="text-orange-500" />
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">Aucun chantier trouvé</div>
              ) : (
                <div className={SF.gridContent}>
                  {filtered.map(ch => (
                    <ChantierCard key={ch.id} typeLabel="Chantier" typeIcon={Flame} title={ch.titre} description={ch.description} phase={ch.phase} progression={ch.progression} subCount={ch.projets.length} subLabel="projets" echeance={ch.echeance} assignee={BOT_DISPLAY[ch.botPrimaire]?.name} onAction={onAction} onClick={() => { setSelectedChantier(ch.id); setLevel("projets"); }} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* LEVEL: projets — Fiche detail chantier + sous-éléments projets en grid-cols-2 */}
          {level === "projets" && selCh && (
            <ChantierEntityDetail type="chantier" title={selCh.titre} description={selCh.description} phase={selCh.phase} progression={selCh.progression} echeance={selCh.echeance} dateDebut={selCh.dateDebut} dateMaj={selCh.dateMaj} botPrimaire={selCh.botPrimaire} botCodes={selCh.botCodes} objectifs={selCh.objectifs} budget={selCh.budget} risques={selCh.risques} documents={selCh.documents} jalons={selCh.jalons} sante={selCh.sante} raci={selCh.raci} decisions={selCh.decisions} conferences={selCh.conferences} activites={selCh.activites} retrospective={selCh.retrospective} onBack={resetNav} onAction={onAction} backLabel="Retour aux chantiers" subTitle="projets" subCount={selCh.projets.length}
              subItems={selCh.projets.map(pr => ({ id: pr.id, titre: pr.titre, phase: pr.phase, progression: pr.progression, echeance: pr.echeance, subCount: pr.missions.length, subLabel: "missions" }))}
              onSubItemClick={(id) => { setSelectedProjet(id); setLevel("missions"); }} />
          )}

          {/* LEVEL: missions — Fiche detail projet + sous-éléments missions en grid-cols-2 */}
          {level === "missions" && selPr && (
            <ChantierEntityDetail type="projet" title={selPr.titre} description={selPr.description} phase={selPr.phase} progression={selPr.progression} echeance={selPr.echeance} botPrimaire={selPr.botPrimaire} objectifs={selPr.objectifs} budget={selPr.budget} livrables={selPr.livrables} documents={selPr.documents} jalons={selPr.jalons} sante={selPr.sante} raci={selPr.raci} dependances={selPr.dependances} decisions={selPr.decisions} conferences={selPr.conferences} onBack={() => { setSelectedProjet(null); setSelectedMission(null); setDetailTache(null); setLevel("projets"); }} onAction={onAction} backLabel={`Retour — ${selCh?.titre || "Chantier"}`} subTitle="missions" subCount={selPr.missions.length}
              subItems={selPr.missions.map(mi => ({ id: mi.id, titre: mi.titre, phase: mi.phase, progression: mi.progression, echeance: mi.echeance, subCount: mi.taches.length, subLabel: "tâches" }))}
              onSubItemClick={(id) => { setSelectedMission(id); setLevel("taches"); }} />
          )}

          {/* LEVEL: taches — Fiche detail mission + sous-éléments tâches en grid-cols-2 */}
          {level === "taches" && selMi && (
            <ChantierEntityDetail type="mission" title={selMi.titre} description={selMi.description} phase={selMi.phase} progression={selMi.progression} botPrimaire={selMi.botPrimaire} objectifs={selMi.objectifs} equipe={selMi.equipe} livrables={selMi.livrables} documents={selMi.documents} jalons={selMi.jalons} criteresAcceptation={selMi.criteresAcceptation} dependances={selMi.dependances} conferences={selMi.conferences} onBack={() => { setSelectedMission(null); setDetailTache(null); setLevel("missions"); }} onAction={onAction} backLabel={`Retour — ${selPr?.titre || "Projet"}`} subTitle="tâches" subCount={selMi.taches.length}
              subItems={selMi.taches.map(ta => ({ id: ta.id, titre: ta.titre, phase: ta.phase, progression: ta.progression, echeance: ta.echeance, assignee: ta.assignee }))}
              onSubItemClick={(id) => { setDetailTache(id); setLevel("tache-detail"); }} />
          )}

          {/* LEVEL: tache-detail — Fiche detail tâche avec contenu actionnable */}
          {level === "tache-detail" && selTa && (
            <ChantierEntityDetail type="tache" title={selTa.titre} description={selTa.description} phase={selTa.phase} progression={selTa.progression} echeance={selTa.echeance} documents={selTa.documents} jalons={selTa.jalons} instructions={selTa.instructions} validateur={selTa.validateur} criteresAcceptation={selTa.criteresAcceptation} dependances={selTa.dependances} conferences={selTa.conferences} tempsEstime={selTa.tempsEstime} tempsReel={selTa.tempsReel} onBack={() => { setDetailTache(null); setLevel("taches"); }} onAction={onAction} backLabel={`Retour — ${selMi?.titre || "Mission"}`} extraContent={
              <div className="space-y-3">
                {/* Contenu contextuel selon la phase */}
                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                    <FileText className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                    <span className="text-sm font-bold text-gray-900">Contenu de la tâche</span>
                  </div>
                  <div className="px-4 py-3 space-y-3">
                    {selTa.description && <p className="text-xs text-gray-700 leading-relaxed">{selTa.description}</p>}
                    {selTa.assignee && <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"><Users className="h-3.5 w-3.5 text-gray-400" /><span className="text-xs text-gray-600">Assigné à <span className="font-bold">{selTa.assignee}</span></span></div>}
                    {selTa.echeance && <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"><Clock className="h-3.5 w-3.5 text-gray-400" /><span className="text-xs text-gray-600">Échéance: <span className="font-bold">{selTa.echeance}</span></span></div>}
                  </div>
                </div>
                {/* Actions possibles selon la phase */}
                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                    <Rocket className="h-4 w-4 text-gray-900 stroke-[2.5]" />
                    <span className="text-sm font-bold text-gray-900">Actions disponibles</span>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    {selTa.phase === "discussion" && (
                      <>
                        <button className="w-full text-left flex items-center gap-2.5 bg-sky-50 rounded-lg px-3 py-2.5 hover:bg-sky-100 transition-colors cursor-pointer"><MessageCircle className="h-3.5 w-3.5 text-sky-600 shrink-0" /><div><span className="text-xs font-bold text-sky-800 block">Discuter de cette tâche</span><span className="text-[9px] text-sky-600">Ouvrir une discussion avec l'équipe assignée</span></div></button>
                        <button className="w-full text-left flex items-center gap-2.5 bg-orange-50 rounded-lg px-3 py-2.5 hover:bg-orange-100 transition-colors cursor-pointer"><Brain className="h-3.5 w-3.5 text-orange-600 shrink-0" /><div><span className="text-xs font-bold text-orange-800 block">Lancer une réflexion</span><span className="text-[9px] text-orange-600">Analyser les enjeux avant de commencer</span></div></button>
                      </>
                    )}
                    {selTa.phase === "reflexion" && (
                      <>
                        <button className="w-full text-left flex items-center gap-2.5 bg-orange-50 rounded-lg px-3 py-2.5 hover:bg-orange-100 transition-colors cursor-pointer"><Brain className="h-3.5 w-3.5 text-orange-600 shrink-0" /><div><span className="text-xs font-bold text-orange-800 block">Cristalliser la réflexion</span><span className="text-[9px] text-orange-600">Ouvrir DocForge pour documenter les conclusions</span></div></button>
                        <button className="w-full text-left flex items-center gap-2.5 bg-yellow-50 rounded-lg px-3 py-2.5 hover:bg-yellow-100 transition-colors cursor-pointer"><Hammer className="h-3.5 w-3.5 text-yellow-600 shrink-0" /><div><span className="text-xs font-bold text-yellow-800 block">Passer en conception</span><span className="text-[9px] text-yellow-600">Structurer le plan d'exécution</span></div></button>
                      </>
                    )}
                    {selTa.phase === "creation" && (
                      <>
                        <button className="w-full text-left flex items-center gap-2.5 bg-yellow-50 rounded-lg px-3 py-2.5 hover:bg-yellow-100 transition-colors cursor-pointer"><Hammer className="h-3.5 w-3.5 text-yellow-600 shrink-0" /><div><span className="text-xs font-bold text-yellow-800 block">Compléter le document</span><span className="text-[9px] text-yellow-600">Finaliser la conception en mode DocForge</span></div></button>
                        <button className="w-full text-left flex items-center gap-2.5 bg-green-50 rounded-lg px-3 py-2.5 hover:bg-green-100 transition-colors cursor-pointer"><Rocket className="h-3.5 w-3.5 text-green-600 shrink-0" /><div><span className="text-xs font-bold text-green-800 block">Lancer l'exécution</span><span className="text-[9px] text-green-600">Démarrer l'implémentation</span></div></button>
                      </>
                    )}
                    {selTa.phase === "execution" && (
                      <>
                        <button className="w-full text-left flex items-center gap-2.5 bg-green-50 rounded-lg px-3 py-2.5 hover:bg-green-100 transition-colors cursor-pointer"><CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" /><div><span className="text-xs font-bold text-green-800 block">Marquer comme complété</span><span className="text-[9px] text-green-600">Confirmer que la tâche est terminée</span></div></button>
                        <button className="w-full text-left flex items-center gap-2.5 bg-emerald-50 rounded-lg px-3 py-2.5 hover:bg-emerald-100 transition-colors cursor-pointer"><BarChart3 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /><div><span className="text-xs font-bold text-emerald-800 block">Passer en rétroaction</span><span className="text-[9px] text-emerald-600">Évaluer les résultats et documenter les apprentissages</span></div></button>
                      </>
                    )}
                    {selTa.phase === "retroaction" && (
                      <>
                        <button className="w-full text-left flex items-center gap-2.5 bg-emerald-50 rounded-lg px-3 py-2.5 hover:bg-emerald-100 transition-colors cursor-pointer"><BarChart3 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /><div><span className="text-xs font-bold text-emerald-800 block">Voir le bilan</span><span className="text-[9px] text-emerald-600">Consulter les métriques et le résumé d'exécution</span></div></button>
                        <button className="w-full text-left flex items-center gap-2.5 bg-sky-50 rounded-lg px-3 py-2.5 hover:bg-sky-100 transition-colors cursor-pointer"><MessageCircle className="h-3.5 w-3.5 text-sky-600 shrink-0" /><div><span className="text-xs font-bold text-sky-800 block">Discuter des résultats</span><span className="text-[9px] text-sky-600">Partager les apprentissages avec l'équipe</span></div></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            } />
          )}
        </div>
      </div>
    </div>
  );
}

// ═══ BACKWARD-COMPAT ALIASES ═══
export const BlueprintDepartement = BlueprintView;
export const BlueprintDataRoom = DataRoomView;
export const BlueprintPlaybooks = PlaybookStoreView;
export const BlueprintConferenceAI = ConferenceAIView;
export const CockpitStoreView = CockpitView;
