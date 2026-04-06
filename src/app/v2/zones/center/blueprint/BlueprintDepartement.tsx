/**
 * BlueprintDepartement.tsx — Composant generique Blueprint Vivant par departement
 * Layout DocForge: Sidebar Table des Matieres (~25%) + Zone Contenu (~75%)
 * Source: blueprint-config.ts (12 departements x ~97 sous-sections)
 *
 * Utilise dans DepartmentTourDeControle.tsx pour le tab "Blueprint" de TOUS les bots.
 * CEOB = le plus complet (16 sections + Vue d'ensemble des 11 autres departements)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Building2, Target, Layers, Rocket, DollarSign, Shield, Compass,
  TrendingUp, ListChecks, Settings, Flame, Save, Loader2,
  CheckCircle2, AlertTriangle, Info, FileText, BookOpen, Heart,
  ChevronRight, Sparkles, Link2, Users, User, Briefcase, Plus, Trash2, UserPlus, PenLine,
  Bot, Cpu, Zap, Activity, BarChart3, Star, MessageCircle,
  Database, Search, GitBranch, ShoppingBag,
  LayoutList, LayoutGrid, Table2, FolderOpen, Filter,
  Package, Calendar, Clock, Lock, Bug, Headphones, Palette, MessageSquare,
  ChevronDown, ArrowUp, ArrowDown, ArrowUpDown, Upload,
  Crown, Eye, Factory, Wrench, Bookmark, Pause, Play, Share2, RotateCcw, ExternalLink,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
import { BLUEPRINT_TEMPLATES, getTemplatesForBot, type BlueprintTemplate } from "./blueprint-templates";
import { useCanvasActions } from "../../../context/CanvasActionContext";
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

// ── Icon resolver ──
const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Target, Layers, Rocket, DollarSign, Shield, Compass,
  TrendingUp, ListChecks, Settings, Flame, FileText, BookOpen, Sparkles,
};
function resolveIcon(name: string): React.ElementType {
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

// ── Sub-section content — champs + KPIs ──
function SubSectionContent({ section, tier, data, onFieldChange, onSave, saving, dirty }: {
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
};

const DEPT_LABELS: Record<string, string> = {
  CEOB: "Direction", CTOB: "Technologie", CFOB: "Finance", CMOB: "Marketing",
  CSOB: "Stratégie", COOB: "Opérations", CPOB: "Production", CHROB: "RH",
  CINOB: "Innovation", CROB: "Ventes", CLOB: "Juridique", CISOB: "Sécurité",
};

interface LinkedFieldValue {
  ref: CrossRef;
  values: { fieldId: string; label: string; value: string }[];
  loaded: boolean;
}

function CrossReferencePanel({ botCode, sectionId }: { botCode: string; sectionId: string }) {
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
    id: "personnel_vision", label: "Vision & Leadership", icon: Compass,
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
    <div className="border rounded-xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 border-b border-blue-100 flex items-center gap-1.5">
        <Heart className="h-3.5 w-3.5 text-blue-500" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700 flex-1">{title}</span>
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

function BlueprintPersonnel({ botCode, headerGradient, data, onFieldChange, onSave, saving, dirty, tier }: {
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
        {/* ── HERO — Dynamique depuis les données saisies ── */}
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

        {/* ── MODE PREVIEW: Version visuelle riche (celle d'avant les champs editables) ── */}
        {previewMode ? (
          <div className="space-y-4">
            {/* ── VITAAFAST — VITAA (5 piliers) + FAAS (4 piliers) côte à côte ── */}
            <div className="grid grid-cols-2 gap-2">
              {/* VITAA — 5 piliers d'affaires */}
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 border-b border-blue-100 flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700 flex-1">VITAA — Piliers d'affaires</span>
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
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-3 py-2 border-b border-rose-100 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-rose-500" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700 flex-1">FAAS — Capital social</span>
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
            <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
              <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-2.5 flex items-center gap-2">
                <User className="h-4 w-4 text-white" />
                <span className="text-xs font-bold text-white flex-1">Mon Profil</span>
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
            </Card>

            {/* ── VISION & LEADERSHIP ── */}
            <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
              <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-2.5 flex items-center gap-2">
                <Compass className="h-4 w-4 text-white" />
                <span className="text-xs font-bold text-white flex-1">Vision & Leadership</span>
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
            </Card>

            {/* ── OBJECTIFS 12 MOIS ── */}
            <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
              <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-2.5 flex items-center gap-2">
                <Target className="h-4 w-4 text-white" />
                <span className="text-xs font-bold text-white flex-1">Objectifs 12 mois</span>
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
            </Card>

            {/* ── PERFORMANCE — KPI cards ── */}
            <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
              <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-2.5 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-white" />
                <span className="text-xs font-bold text-white flex-1">Performance</span>
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
                      <Card key={kpi.key} className="p-0 gap-0 overflow-hidden">
                        <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", kpi.color)}>
                          <span className="text-xs font-bold text-white">{kpi.label}</span>
                        </div>
                        <div className="px-3 py-2">
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
                      </Card>
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
            </Card>

            {/* ── DEVELOPPEMENT ── */}
            <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
              <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-2.5 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-white" />
                <span className="text-xs font-bold text-white flex-1">Developpement</span>
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
            </Card>

            {/* ── EQUILIBRE ── */}
            {(() => {
              const actuel = num("personnel_equilibre.heures_actuelles");
              const cible = num("personnel_equilibre.heures_cible");
              const maxH = Math.max(actuel, cible, 60);
              return (
                <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
                  <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-2.5 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-white" />
                    <span className="text-xs font-bold text-white flex-1">Equilibre</span>
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
                      { key: "indicateurs_stress", label: "Indicateurs de stress", icon: AlertTriangle, color: "text-red-500" },
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
                </Card>
              );
            })()}

            {/* ── SUCCESSION ── */}
            <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
              <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-2.5 flex items-center gap-2">
                <Users className="h-4 w-4 text-white" />
                <span className="text-xs font-bold text-white flex-1">Succession</span>
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
            </Card>

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
  { id: "crise", label: "Crise", icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50 border-red-300", gradient: "from-red-600 to-red-500", description: "Triage immediat, zero superflu", comportement: "Repond direct. Structure en: 24h / 7j / ignorer.", exemple: "L'unique chose a regler aujourd'hui?" },
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
        <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-2.5 flex items-center gap-2">
          <Activity className="h-4 w-4 text-white" />
          <span className="text-xs font-bold text-white flex-1">Connexions Actives</span>
          <span className="text-[9px] bg-white/25 text-white px-2 py-0.5 rounded-full font-bold">{active.length} live</span>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">{active.map(renderApi)}</div>
      </Card>
      {rest.length > 0 && (
        <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-r from-gray-500 to-gray-400 px-4 py-2.5 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-white" />
            <span className="text-xs font-bold text-white flex-1">À configurer / Disponibles</span>
            <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full">{rest.length}</span>
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
        <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-2.5 flex items-center gap-2">
          <Zap className="h-4 w-4 text-white" />
          <span className="text-xs font-bold text-white flex-1">Skins Cognitifs — Trisociation</span>
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
        <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-2.5 flex items-center gap-2">
          <Settings className="h-4 w-4 text-white" />
          <span className="text-xs font-bold text-white flex-1">Parametres — {d.name}</span>
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

function BlueprintBot({ botCode, headerGradient }: { botCode: string; headerGradient: string }) {
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
    <div className="flex gap-3">
      <div className="w-[180px] shrink-0 space-y-0.5 sticky top-0 self-start">
        {BOT_SECTION_META.map(s => {
          const isActive = activeAnchor === s.id;
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => scrollToSection(s.id)} className={cn(
              "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
              isActive ? "bg-violet-50 border border-violet-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
            )}>
              <div className="flex items-center gap-1.5">
                <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-violet-500" : "text-gray-400")} />
                <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActive ? "text-violet-700" : "text-gray-700")}>{s.label}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-violet-400" />}
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex-1 min-w-0 space-y-4">
        {/* ── HERO — Photo + Mission ── */}
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

        {/* ── VUE D'ENSEMBLE ── */}
        <div id="sec-overview" className="space-y-3">
          {/* VITAA + Profil Psychometrique côte à côte */}
          <div className="grid grid-cols-2 gap-3">
            <VitaaTable data={vitaa} title={`VITAA — ${display.name}`} />
            <div className="border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-3 py-2 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-white flex-1">Profil Psychometrique</span>
                <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full">{profile.style}</span>
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
                <Card key={k.label} className="p-0 overflow-hidden">
                  <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", k.gradient)}>
                    <Icon className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white">{k.label}</span>
                  </div>
                  <div className="px-3 py-2">
                    <div className={cn("text-2xl font-bold", k.color)}>{k.value}</div>
                    <div className="text-[10px] text-gray-500">{k.sub}</div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* ROI compact + Objectifs côte à côte */}
          <div className="grid grid-cols-2 gap-3">
            {/* ROI small box */}
            <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
              <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-3 py-2 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-white">ROI — Equiv. Humain</span>
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
            </Card>

            {/* Objectifs */}
            <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
              <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-3 py-2 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-white flex-1">Objectifs</span>
                <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full">{missions.objectifs.length} actifs</span>
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
            </Card>
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
  );
}


function VueConsolidee({ tier }: { tier: SizeTier }) {
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
      <div className="grid grid-cols-2 gap-2">
        {/* VITAA — 5 piliers d'affaires */}
        <div className="border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 border-b border-blue-100 flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700 flex-1">VITAA — Piliers d'affaires</span>
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
        <div className="border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-3 py-2 border-b border-rose-100 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700 flex-1">FAAS — Capital social</span>
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

      <div className="grid grid-cols-2 gap-2">
        {sorted.map(dept => {
          const info = OTHER_BOTS.find(b => b.code === dept.code)!;
          const isExpanded = expandedDept === dept.code;
          const filledFields = dept.keyFields.filter(kf => kf.value);

          return (
            <Card
              key={dept.code}
              className={cn(
                "p-0 gap-0 overflow-hidden rounded-xl shadow-sm transition-all cursor-pointer hover:shadow-md",
                dept.gaps > 0 ? "ring-1 ring-red-200" : "",
                isExpanded && "ring-1 ring-blue-300"
              )}
              onClick={() => setExpandedDept(isExpanded ? null : dept.code)}
            >
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
            </Card>
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

function ConseilAdminManager({ headerGradient, data, onFieldChange, onSave, saving, dirty }: {
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
        {/* Header card */}
        <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
          <div className={cn("flex items-center gap-2 px-4 py-3 bg-gradient-to-r", headerGradient)}>
            <Users className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white flex-1">Conseil d'administration</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">{ca.membres.length} membre{ca.membres.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50/20">
            <p className="text-xs text-gray-600 leading-relaxed">
              Le conseil d'administration est l'organe de gouvernance suprême de votre organisation. Les membres du CA ont accès à la plateforme pour suivre les résultats, participer aux réunions (Conférence AI) et recevoir les minutes automatiquement.
            </p>
          </div>
        </Card>

          {/* 1. Tableau de bord */}
          {activeCASection === "tableau" && (<>
            <div className="grid grid-cols-4 gap-3">
              <Card className="p-0 gap-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
                  <Users className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Membres</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-blue-600">{ca.membres.length}</div>
                  <div className="text-[9px] text-gray-400">Total CA</div>
                </div>
              </Card>
              <Card className="p-0 gap-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
                  <Shield className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Indépendants</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-emerald-600">{nbIndependants}</div>
                  <div className="text-[9px] text-gray-400">{ca.membres.length > 0 ? Math.round((nbIndependants / ca.membres.length) * 100) : 0}% du CA</div>
                </div>
              </Card>
              <Card className="p-0 gap-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
                  <UserPlus className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Externes</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-amber-600">{nbExternes}</div>
                  <div className="text-[9px] text-gray-400">Invités plateforme</div>
                </div>
              </Card>
              <Card className="p-0 gap-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
                  <Briefcase className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Réunions</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-violet-600">{ca.frequence || "—"}</div>
                  <div className="text-[9px] text-gray-400">{ca.format}</div>
                </div>
              </Card>
            </div>
            <Card className="p-4 rounded-xl shadow-sm">
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
            </Card>
          </>)}

          {/* 2. Membres du CA */}
          {activeCASection === "membres" && (
            <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
              <div className={cn("flex items-center justify-between px-4 py-2.5 bg-gradient-to-r", headerGradient)}>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-bold text-white">Membres du conseil ({ca.membres.length})</span>
                </div>
                <button onClick={addMembre} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer">
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
            </Card>
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
                <Card key={i} className="px-4 py-3 rounded-xl shadow-sm">
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
                </Card>
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
            <Card className="p-4 rounded-xl shadow-sm bg-gradient-to-r from-violet-50 to-blue-50/30 border border-violet-100">
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-violet-700 mb-1">Conférence AI pour le CA</p>
                  <p className="text-[9px] text-violet-600 leading-relaxed">Brain Team peut animer des sessions de conseil d'administration avec vos bots spécialisés (CEO, CFO, CSO...). Chaque bot apporte son expertise unique pour enrichir les discussions stratégiques.</p>
                </div>
              </div>
            </Card>
            <div className="space-y-2">
              {CA_MOCK_CONFERENCES.map((c, i) => (
                <Card key={i} className="px-4 py-3 rounded-xl shadow-sm">
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
                </Card>
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
                <Card key={i} className="px-4 py-3 rounded-xl shadow-sm">
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
                </Card>
              ))}
            </div>
          </>)}

          {/* 6. Blueprints personnels */}
          {activeCASection === "blueprints" && (<>
            <Card className="p-4 rounded-xl shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50/30 border border-blue-100">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-700 mb-1">Blueprints personnels du CA</p>
                  <p className="text-[9px] text-blue-600 leading-relaxed">Chaque administrateur complète son blueprint personnel pour aligner ses intentions et compétences avec la croissance de l'organisation. Ce processus est guidé par Brain Team.</p>
                </div>
              </div>
            </Card>
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
                    <Card key={i} className="px-4 py-3 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all">
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
                    </Card>
                  );
                })}
              </div>
            )}
          </>)}

          {/* 7. Gouvernance */}
          {activeCASection === "gouvernance" && (
            <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-700 to-gray-600">
                <Settings className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-bold text-white">Configuration du CA</span>
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
            </Card>
          )}

          {/* 8. Surveillance financière */}
          {activeCASection === "surveillance" && (<>
            <div className="grid grid-cols-4 gap-3">
              <Card className="p-0 gap-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
                  <DollarSign className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Revenu YTD</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-emerald-600">2.4M$</div>
                  <div className="text-[9px] text-gray-400">+12% vs objectif</div>
                </div>
              </Card>
              <Card className="p-0 gap-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
                  <TrendingUp className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">EBITDA</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-blue-600">18.5%</div>
                  <div className="text-[9px] text-gray-400">Marge opérationnelle</div>
                </div>
              </Card>
              <Card className="p-0 gap-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
                  <Activity className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Cash Flow</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-violet-600">+340K$</div>
                  <div className="text-[9px] text-gray-400">Flux de trésorerie</div>
                </div>
              </Card>
              <Card className="p-0 gap-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
                  <Shield className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Ratio dette</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-amber-600">1.8x</div>
                  <div className="text-[9px] text-gray-400">Dette/EBITDA</div>
                </div>
              </Card>
            </div>
            <Card className="p-4 rounded-xl shadow-sm bg-gradient-to-r from-emerald-50 to-blue-50/20 border border-emerald-100">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-700 mb-1">Surveillance financière automatisée</p>
                  <p className="text-[9px] text-emerald-600 leading-relaxed">Ce tableau de bord est alimenté automatiquement par les données de votre département Finance. Les administrateurs du CA peuvent suivre la santé financière en temps réel.</p>
                </div>
              </div>
            </Card>
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

function ComitesManager({ botCode, deptLabel, headerGradient, data, onFieldChange, onSave, saving, dirty }: {
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
        {/* Header card */}
        <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
          <div className={cn("flex items-center gap-2 px-4 py-3 bg-gradient-to-r", headerGradient)}>
            <Briefcase className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white flex-1">Comités — {deptLabel}</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">{comites.length} comité{comites.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50/20">
            <p className="text-xs text-gray-600 leading-relaxed">
              Créez et gérez les comités liés au département {deptLabel}. Chaque comité peut avoir des participants internes (employés) et externes (invités), avec la possibilité de lancer des Conférences AI et de distribuer les minutes automatiquement.
            </p>
          </div>
        </Card>

          {/* Vue d'ensemble */}
          {(showOverview || !activeComite) && (<>
            <div className="grid grid-cols-4 gap-3">
              <Card className="p-0 gap-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
                  <Briefcase className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Comités</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-blue-600">{comites.length}</div>
                  <div className="text-[9px] text-gray-400">Total actifs</div>
                </div>
              </Card>
              <Card className="p-0 gap-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
                  <Users className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Participants</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-emerald-600">{totalParticipants}</div>
                  <div className="text-[9px] text-gray-400">Total membres</div>
                </div>
              </Card>
              <Card className="p-0 gap-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
                  <Calendar className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Réunions</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-violet-600">{comites.filter(c => c.prochaine_reunion).length}</div>
                  <div className="text-[9px] text-gray-400">Planifiées</div>
                </div>
              </Card>
              <Card className="p-0 gap-0 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
                  <Activity className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Taux activité</span>
                </div>
                <div className="px-3 py-2">
                  <div className="text-2xl font-bold text-amber-600">{comites.length > 0 ? Math.round((comites.filter(c => c.membres.length > 0).length / comites.length) * 100) : 0}%</div>
                  <div className="text-[9px] text-gray-400">Comités actifs</div>
                </div>
              </Card>
            </div>

            {/* Résumé des comités */}
            {comites.length > 0 && (
              <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-700 to-gray-600">
                  <ListChecks className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-bold text-white">Résumé des comités</span>
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
              </Card>
            )}

            {/* Modèles suggérés */}
            <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-700 to-gray-600">
                <Sparkles className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-bold text-white">Modèles de comités suggérés</span>
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
            </Card>
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
              <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-700 to-gray-600">
                  <Settings className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-bold text-white">Configuration du comité</span>
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
              </Card>
            )}

            {/* Tab: Participants */}
            {comiteTab === "participants" && (
              <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
                <div className={cn("flex items-center justify-between px-4 py-2.5 bg-gradient-to-r", headerGradient)}>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-bold text-white">Participants ({active.membres.length})</span>
                  </div>
                  <button onClick={() => addMembre(active.id)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer">
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
              </Card>
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
                  <Card key={i} className="px-4 py-3 rounded-xl shadow-sm">
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
                  </Card>
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
                  <Card key={i} className="px-4 py-3 rounded-xl shadow-sm">
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
                  </Card>
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
    { id: "op_territoires_quotas", label: "Territoires & Quotas", description: "Assignation geo/sectorielle, objectifs financiers, carte chaleur", patternVisuel: "Carte + matrice", icon: Compass, pertinence: { T1: "X", T2: "X", T3: "O", T4: "C", T5: "C" } },
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
    { id: "op_bureau_gestion_strat", label: "Bureau gestion strategique", description: "Plans 3-5 ans vers initiatives trimestrielles mesurables", patternVisuel: "Gantt strategique + arbres", icon: Compass, pertinence: { T1: "X", T2: "X", T3: "C", T4: "C", T5: "C" } },
    { id: "op_pipeline_ma", label: "Pipeline M&A", description: "Cibles acquisition, integration post-fusion", patternVisuel: "Kanban specialise M&A", icon: Briefcase, pertinence: { T1: "X", T2: "X", T3: "X", T4: "O", T5: "C" } },
  ],
  COOB: [
    { id: "op_gestion_stocks", label: "Gestion des stocks", description: "Inventaire, niveaux reappro, couts stock", patternVisuel: "Dashboard logistique + jauges", icon: Package, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_achats_po", label: "Achats & Bons de commande (PO)", description: "Approvisionnement, PO, receptions, perf fournisseur", patternVisuel: "Liste docs + statuts livraison", icon: Briefcase, pertinence: { T1: "O", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_commandes_clients", label: "Gestion commandes clients", description: "Reception/traitement commandes avant expedition", patternVisuel: "Triage Queue", icon: ListChecks, pertinence: { T1: "C", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_logistique_expedition", label: "Logistique & Expedition", description: "Transport, etiquettes, suivi transporteurs, couts fret", patternVisuel: "Carte suivi logistique", icon: Package, pertinence: { T1: "O", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_qualite_nc", label: "Qualite & Non-conformites", description: "Incidents, defauts, retours clients (RMA)", patternVisuel: "Registre tickets Helpdesk", icon: AlertTriangle, pertinence: { T1: "X", T2: "X", T3: "C", T4: "C", T5: "C" } },
    { id: "op_suivi_bpm", label: "Suivi processus (BPM)", description: "Cartographie workflows, amelioration continue, Kaizen", patternVisuel: "Diagramme flux interactif", icon: GitBranch, pertinence: { T1: "X", T2: "X", T3: "O", T4: "C", T5: "C" } },
    { id: "op_flotte", label: "Gestion de la flotte", description: "Vehicules, maintenance, essence, telemetrie", patternVisuel: "Carte telemetrie temps reel", icon: Compass, pertinence: { T1: "X", T2: "X", T3: "O", T4: "C", T5: "C" } },
  ],
  CTOB: [
    { id: "op_sprints_backlog", label: "Sprints & Backlog", description: "Gestion sprints, CI/CD pipeline, velocite equipe", patternVisuel: "Kanban complexe", icon: ListChecks, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_uptime_infra", label: "Uptime & Infrastructure", description: "Sante serveurs temps reel, disponibilite services", patternVisuel: "Jauges monitoring temps reel", icon: Activity, pertinence: { T1: "X", T2: "C", T3: "C", T4: "C", T5: "C" } },
    { id: "op_dette_technique", label: "Registre dette technique", description: "Documentation compromis code, matrice impact vs effort", patternVisuel: "Matrice risque + registre", icon: AlertTriangle, pertinence: { T1: "X", T2: "X", T3: "C", T4: "C", T5: "C" } },
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
  { id: "chantiers",     label: "Chantiers (REAI)",       icon: FolderOpen },
  { id: "bibliotheque",  label: "Bibliothèque Centrale",  icon: BookOpen },
] as const;

// Nomenclature REAI — Structure par chantier
const REAI_FOLDERS = [
  { id: "admin",        num: "0",  label: "Admin",              icon: Briefcase, desc: "Ententes, NDA, comptes-rendus, horodateur" },
  { id: "intrants",     num: "10", label: "Intrants",           icon: Upload,    desc: "Photos, vidéos, mesures, docs reçus" },
  { id: "design",       num: "20", label: "Design/Calculs/Simul", icon: Compass, desc: "Dessins 2D/3D, cahier des charges, VSM" },
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
    { id: "analyses_scenarios", label: "Analyses et scenarios", icon: Compass, volume: "~10 docs/an", documents: [
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
    { id: "litiges_contentieux", label: "Litiges & contentieux", icon: AlertTriangle, volume: "~10 docs/an", documents: [
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
    { id: "audits_risques", label: "Audits et evaluation des risques", icon: AlertTriangle, volume: "~40 docs/an", documents: [
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
    { id: "audits_dette", label: "Audits et dette technique", icon: AlertTriangle, volume: "~150 docs/an", documents: [
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
        <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-2.5 flex items-center gap-2">
          <Database className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">6 types d'actifs numeriques</span>
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

  // ── Sortable table header (pattern copie de DocumentsUnifie SortTh) ──
  const SortTh = ({ field, w, children }: { field: DataRoomSortField; w: string; children: React.ReactNode }) => {
    const active = sortField === field;
    const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
    return (
      <th className={cn("text-left px-2 py-2 text-[9px] font-bold uppercase cursor-pointer select-none hover:bg-gray-100 transition-colors", w, active ? "text-blue-500" : "text-gray-500")}
        onClick={() => onSort(field)}>
        <div className="flex items-center gap-1">{children}<Icon className={cn("h-3.5 w-3.5", active ? "text-blue-500" : "text-gray-300")} /></div>
      </th>
    );
  };

  // ── TABLE VIEW (SharePoint style — clickable column headers) ──
  if (viewMode === "table") {
    return (
      <div className="border rounded-lg overflow-x-auto bg-white">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <SortTh field="titre" w="w-[30%]">Nom</SortTh>
              <SortTh field="format" w="w-[10%]">Format</SortTh>
              <SortTh field="statut" w="w-[10%]">Statut</SortTh>
              <SortTh field="createur" w="w-[12%]">Createur</SortTh>
              <th className="text-left px-2 py-2 text-[9px] font-bold text-gray-500 uppercase w-[10%]">Taille</th>
              <SortTh field="frequence" w="w-[10%]">Modifie</SortTh>
              <th className="w-[8%]" />
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, i) => {
              const statut = STATUT_BADGE[doc.statut];
              const fmt = FORMAT_BADGE[doc.format] || FORMAT_BADGE.texte;
              const DocIcon = typeIcon(doc.type);
              const assetType = ASSET_TYPES.find(a => a.docType === doc.type);
              return (
                <tr key={i} className="border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer group">
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-1.5">
                      {doc.critique && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                      <DocIcon className={cn("h-3.5 w-3.5 shrink-0", assetType ? assetType.iconColor : "text-gray-400")} />
                      <span className="text-[9px] font-medium text-gray-800 truncate">{doc.titre}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5"><span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", fmt.bg, fmt.text)}>{fmt.label}</span></td>
                  <td className="px-2 py-1.5"><span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", statut.bg, statut.text)}>{statut.label}</span></td>
                  <td className="px-2 py-1.5"><span className="text-[9px] text-gray-500">{doc.createur}</span></td>
                  <td className="px-2 py-1.5"><span className="text-[9px] text-gray-400">{doc.taille}</span></td>
                  <td className="px-2 py-1.5"><span className="text-[9px] text-gray-400">{doc.modifie}</span></td>
                  <td className="px-2 py-1.5">
                    <button className={cn("text-[9px] font-medium text-white px-2 py-0.5 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity", actionStyle(doc.statut))}>
                      {actionLabel(doc.statut)}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

function DataRoomTemplatesList({ botCode, viewMode }: { botCode: string; viewMode: DataRoomViewMode }) {
  const templates = botCode === "CEOB" ? BLUEPRINT_TEMPLATES : getTemplatesForBot(botCode);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [searchTpl, setSearchTpl] = useState("");

  const CATEGORY_LABELS: Record<string, string> = { strategique: "Strategique", operationnel: "Operationnel", conformite: "Conformite", diagnostic: "Diagnostic" };
  const catBadgeStyle = (cat: string) => cat === "strategique" ? "bg-blue-50 text-blue-700" : cat === "conformite" ? "bg-purple-50 text-purple-700" : cat === "diagnostic" ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-700";

  let filtered = filterCat === "all" ? templates : templates.filter(t => t.category === filterCat);
  if (searchTpl.trim()) {
    const q = searchTpl.toLowerCase();
    filtered = filtered.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }

  // Category counts for filter pills
  const catCounts: Record<string, number> = {};
  templates.forEach(t => { catCounts[t.category] = (catCounts[t.category] || 0) + 1; });

  return (
    <div className="space-y-2">
      {/* Filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="relative flex-1 min-w-[120px] max-w-[220px]">
          <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
          <input type="text" value={searchTpl} onChange={e => setSearchTpl(e.target.value)} placeholder="Rechercher templates..." className="w-full pl-7 pr-2 py-1 text-[9px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" />
        </div>
        {Object.entries(CATEGORY_LABELS).filter(([k]) => catCounts[k]).map(([k, v]) => (
          <button key={k} onClick={() => setFilterCat(filterCat === k ? "all" : k)} className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium transition-all cursor-pointer border", filterCat === k ? `${catBadgeStyle(k)} border-current shadow-sm` : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>
            {v} <span className="opacity-60">{catCounts[k]}</span>
          </button>
        ))}
        <span className="text-[9px] text-gray-400 ml-auto">{filtered.length} templates</span>
      </div>

      {viewMode === "table" ? (
        <table className="w-full text-xs border rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-3 py-2 text-[9px] font-bold text-gray-500 uppercase">Template</th>
              <th className="text-left px-2 py-2 text-[9px] font-bold text-gray-500 uppercase">Categorie</th>
              <th className="text-left px-2 py-2 text-[9px] font-bold text-gray-500 uppercase">Phases</th>
              <th className="text-left px-2 py-2 text-[9px] font-bold text-gray-500 uppercase">DocForge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 group">
                <td className="px-3 py-2">
                  <div className="text-xs text-gray-800">{t.name}</div>
                  <div className="text-[9px] text-gray-400 truncate max-w-[250px]">{t.description}</div>
                </td>
                <td className="px-2 py-2"><span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", catBadgeStyle(t.category))}>{CATEGORY_LABELS[t.category]}</span></td>
                <td className="px-2 py-2 text-[9px] text-gray-500">{t.phases.join(", ")}</td>
                <td className="px-2 py-2">{t.docForgeReady ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <span className="text-[9px] text-gray-400">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-2 gap-2">
          {filtered.map(t => (
            <button key={t.id} className="text-left p-0 overflow-hidden rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-50 to-gray-50">
                <Layers className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[9px] font-bold text-gray-700 flex-1 truncate">{t.name}</span>
                {t.docForgeReady && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
              </div>
              <div className="px-3 py-2 space-y-1">
                <p className="text-[9px] text-gray-500 line-clamp-2">{t.description}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", catBadgeStyle(t.category))}>{CATEGORY_LABELS[t.category]}</span>
                  <span className="text-[9px] text-gray-400">{t.source === "existant" ? "Existant" : "Nouveau"}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(t => (
            <div key={t.id} className="px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 border border-transparent hover:border-gray-100">
              <Layers className="h-4 w-4 text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-800">{t.name}</div>
                <div className="text-[9px] text-gray-400 truncate">{t.description}</div>
              </div>
              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0", catBadgeStyle(t.category))}>{CATEGORY_LABELS[t.category]}</span>
              {t.docForgeReady && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
            </div>
          ))}
        </div>
      )}
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

export function BlueprintDataRoom({ botCode, headerGradient }: { botCode: string; headerGradient: string }) {
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
    <div className="flex gap-3">
      {/* Sidebar — Navigation 12 départements (accordion) */}
      <div className="w-[180px] shrink-0 overflow-y-auto max-h-[calc(100vh-200px)] space-y-0.5">
        {/* Vue d'ensemble (CEOB only) */}
        {botCode === "CEOB" && (
          <button
            onClick={() => { setActiveDept("CEOB"); setActiveFolder("_consolidee"); setSearchQuery(""); setTypeFilter(null); setStatusFilter(null); setFormatFilter(null); }}
            className={cn(
              "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
              activeFolder === "_consolidee" ? "bg-blue-50 border border-blue-200 shadow-sm" : "bg-gradient-to-r from-slate-50 to-blue-50/50 border border-blue-100/50 hover:bg-blue-50"
            )}
          >
            <div className="flex items-center gap-1.5">
              <Building2 className={cn("h-3.5 w-3.5 shrink-0", activeFolder === "_consolidee" ? "text-blue-500" : "text-gray-400")} />
              <span className={cn("text-[10px] font-bold flex-1", activeFolder === "_consolidee" ? "text-blue-700" : "text-gray-700")}>Vue d'ensemble</span>
              <span className="text-[9px] text-gray-400">12</span>
            </div>
          </button>
        )}

        {botCode === "CEOB" && <div className="h-px bg-gray-100 mx-2 my-1" />}

        {/* 12 départements — accordion collapsible */}
        {Object.keys(DATA_ROOM_SECTIONS).map(deptCode => {
          const deptSections = DATA_ROOM_SECTIONS[deptCode] || [];
          const isExpanded = expandedDepts.has(deptCode);
          const isDeptActive = activeDept === deptCode;
          const totalDocs = deptSections.reduce((sum, s) => sum + s.documents.length, 0);
          return (
            <div key={deptCode}>
              {/* Department header — click to expand/collapse */}
              <button
                onClick={() => toggleDept(deptCode)}
                className={cn(
                  "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                  isDeptActive && !isExpanded ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", isExpanded ? "" : "-rotate-90", isDeptActive ? "text-blue-500" : "text-gray-400")} />
                  <span className={cn("text-[10px] font-bold flex-1 leading-tight", isDeptActive ? "text-blue-700" : "text-gray-700")}>
                    {DEPT_LABELS[deptCode] || deptCode}
                  </span>
                  <span className="text-[9px] text-gray-400">{totalDocs}</span>
                </div>
              </button>
              {/* Categories sous le département — visibles si expanded */}
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
        })}

        {/* Separator */}
        <div className="h-px bg-gray-100 mx-2 my-1" />

        {/* Sections transversales */}
        <div className="px-2.5 py-1">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Transversal</span>
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
        <div className="h-px bg-gray-100 mx-2 my-1" />

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
        {(isFolderView || activeFolder === "_templates" || activeFolder === "chantiers" || TRANSVERSAL_SECTIONS.some(ts => ts.id === activeFolder)) && (
          <div className={cn("bg-gradient-to-r rounded-lg px-4 py-2.5 flex items-center gap-3", headerGradient)}>
            <Database className="h-5 w-5 text-white" />
            <h2 className="text-sm font-bold text-white">
              {activeFolder === "_templates" ? "Templates" : activeFolder === "chantiers" ? "Chantiers (REAI)" : TRANSVERSAL_SECTIONS.find(ts => ts.id === activeFolder)?.label || activeSection?.label || ""}
            </h2>
          </div>
        )}

        {/* ── Toolbar (copie pattern DocumentsUnifie — SharePoint style) ── */}
        {(isFolderView || activeFolder === "_templates") && (
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white" />
            </div>
            <span className="text-[9px] font-bold text-gray-500 whitespace-nowrap">{isFolderView ? `${filteredDocs.length} items` : ""}</span>
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
        ) : activeFolder === "_templates" ? (
          <DataRoomTemplatesList botCode={botCode} viewMode={viewMode} />
        ) : activeFolder === "chantiers" ? (
          /* DR-07: Vue Dossier Chantier REAI — 5 sections accordion */
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <FolderOpen className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-bold text-gray-800">Dossiers Chantiers — Nomenclature REAI</span>
            </div>
            <p className="text-[9px] text-gray-500 mb-3">Structure standardisée pour chaque chantier d'intégration de robotique et automatisation industrielle.</p>
            {REAI_FOLDERS.map(folder => {
              const FIcon = folder.icon;
              return (
                <div key={folder.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">{folder.num}</span>
                    <FIcon className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-[9px] font-bold text-gray-700 flex-1">{folder.label}</span>
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-[9px] text-gray-500">{folder.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : TRANSVERSAL_SECTIONS.some(ts => ts.id === activeFolder) ? (
          /* Transversal sections placeholder */
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold text-gray-800">{TRANSVERSAL_SECTIONS.find(ts => ts.id === activeFolder)?.label}</span>
            </div>
            <p className="text-[9px] text-gray-500">Section transversale — regroupe les dossiers de tous les départements liés à cette catégorie.</p>
            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-[9px] text-gray-400">Contenu à venir — cette section agrégera les documents transversaux.</p>
            </div>
          </div>
        ) : isFolderView ? (
          <DataRoomAssetList documents={filteredDocs} viewMode={viewMode} sortField={sortField} sortDir={sortDir} onSort={(f) => { if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortField(f); setSortDir("asc"); } }} />
        ) : (
          <p className="text-xs text-gray-400 text-center py-8">Selectionnez un dossier</p>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// PLAYBOOKS — Mes playbooks + Recommandés + Store (layout DocForge)
// ══════════════════════════════════════════

// 100+ playbooks from RESULT-07 deep search — Catalogue de base gratuit + Premium + Conference AI
const PLAYBOOK_STORE_DATA: { id: string; nom: string; departement: string; bots: string[]; etapes: number; duree: string; niveau: "Quick Win" | "Standard" | "Avance" | "Enterprise"; prix: string; rating: number; downloads: number; categorie: string; description: string; pilier: string }[] = [
  // ═══ DIRECTION / CEO (CarlOS) — 9 playbooks ═══
  { id: "pb-001", nom: "Revue hebdomadaire de direction", departement: "CEOB", bots: ["CarlOS", "Frank"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 1245, categorie: "Performance", pilier: "Temps", description: "Analyse des KPIs, fixation des priorites hebdomadaires, blockers a debloquer." },
  { id: "pb-002", nom: "Preparation ordre du jour CA", departement: "CEOB", bots: ["CarlOS", "Loulou"], etapes: 7, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 567, categorie: "Gouvernance", pilier: "Actif", description: "Structure et compilation des donnees pour le conseil d'administration." },
  { id: "pb-003", nom: "Alignement OKR trimestriel", departement: "CEOB", bots: ["CarlOS", "Simone"], etapes: 9, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 891, categorie: "Strategie", pilier: "Idee", description: "Definition des objectifs cles et resultats attendus, cascade vers les departements." },
  { id: "pb-004", nom: "Bilan annuel synthetique", departement: "CEOB", bots: ["CarlOS", "Mathilde"], etapes: 12, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 432, categorie: "Reporting", pilier: "Actif", description: "Agregation des accomplissements pour presentation aux parties prenantes." },
  { id: "pb-005", nom: "Memo direction general", departement: "CEOB", bots: ["CarlOS", "Helene"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 678, categorie: "Communication", pilier: "Temps", description: "Redaction et diffusion d'une communication interne structuree." },
  { id: "pb-006", nom: "Triage des urgences", departement: "CEOB", bots: ["CarlOS", "Sebastien"], etapes: 6, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 345, categorie: "Gestion crise", pilier: "Temps", description: "Analyse initiale des crises et assignation des taches par priorite." },
  { id: "pb-007", nom: "Audit rapide culture entreprise", departement: "CEOB", bots: ["CarlOS", "Helene"], etapes: 8, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 234, categorie: "Culture", pilier: "Actif", description: "Sondage de pouls et analyse du climat organisationnel avec recommandations." },
  { id: "pb-008", nom: "Matrice RACI de projet", departement: "CEOB", bots: ["CarlOS", "Olivier"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 789, categorie: "Gestion projet", pilier: "Temps", description: "Assignation claire des responsabilites d'execution (Responsible, Accountable, Consulted, Informed)." },
  { id: "pb-009", nom: "Pre-qualification investisseur", departement: "CEOB", bots: ["CarlOS", "Frank"], etapes: 6, duree: "20min", niveau: "Quick Win", prix: "$49", rating: 4.4, downloads: 156, categorie: "Financement", pilier: "Argent", description: "Analyse preliminaire de l'adequation d'un VC/investisseur avec votre profil." },
  // ═══ TECHNOLOGIE / CTO (Tim) — 9 playbooks ═══
  { id: "pb-110", nom: "Onboarding logiciel standard", departement: "CTOB", bots: ["Tim", "Helene"], etapes: 6, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 567, categorie: "Onboarding", pilier: "Temps", description: "Creation des acces aux plateformes SaaS, configuration initiale, checklist securite." },
  { id: "pb-111", nom: "Inventaire stack technologique", departement: "CTOB", bots: ["Tim", "Frank"], etapes: 8, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 345, categorie: "Audit", pilier: "Argent", description: "Compilation de tous les abonnements SaaS, couts mensuels et redondances." },
  { id: "pb-112", nom: "Triage ticket support IT", departement: "CTOB", bots: ["Tim", "Olivier"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.3, downloads: 890, categorie: "Support", pilier: "Temps", description: "Classification et routage automatise des demandes de depannage technique." },
  { id: "pb-113", nom: "Verification sauvegardes", departement: "CTOB", bots: ["Tim", "Sebastien"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 456, categorie: "Securite", pilier: "Actif", description: "Audit automatise des procedures de backup et verification d'integrite." },
  { id: "pb-114", nom: "Deduplication base de donnees CRM", departement: "CTOB", bots: ["Tim", "Rich"], etapes: 6, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 234, categorie: "Data quality", pilier: "Actif", description: "Nettoyage et fusion des fiches contacts doublons dans le CRM." },
  { id: "pb-115", nom: "Revue architecture TI", departement: "CTOB", bots: ["Tim", "CarlOS"], etapes: 9, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 178, categorie: "Architecture", pilier: "Idee", description: "Analyse des points de defaillance uniques (SPOF) et recommandations d'evolution." },
  { id: "pb-116", nom: "Migration cloud structuree", departement: "CTOB", bots: ["Tim", "Sebastien", "Olivier"], etapes: 16, duree: "6 sem.", niveau: "Enterprise", prix: "$299", rating: 4.7, downloads: 98, categorie: "Infrastructure", pilier: "Actif", description: "Plan de migration cloud complet avec analyse risques, timeline et rollback." },
  { id: "pb-117", nom: "Documentation API starter", departement: "CTOB", bots: ["Tim"], etapes: 6, duree: "3 jours", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 456, categorie: "Documentation", pilier: "Actif", description: "Templates et structure pour documenter vos APIs REST avec exemples." },
  { id: "pb-118", nom: "Renouvellement SSL et domaines", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 1234, categorie: "Maintenance", pilier: "Actif", description: "Alertes et renouvellement automatique des certificats SSL et noms de domaine." },
  // ═══ FINANCE / CFO (Frank) — 9 playbooks ═══
  { id: "pb-020", nom: "Facturation fin de mois", departement: "CFOB", bots: ["Frank", "Rich"], etapes: 6, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 678, categorie: "Comptabilite", pilier: "Argent", description: "Compilation et envoi automatise des factures mensuelles aux clients." },
  { id: "pb-021", nom: "Relance comptes impayes", departement: "CFOB", bots: ["Frank", "CarlOS"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 890, categorie: "Recouvrement", pilier: "Argent", description: "Sequence de courriels echelonnes pour relancer les factures en souffrance." },
  { id: "pb-022", nom: "Categorisation recus (IA)", departement: "CFOB", bots: ["Frank"], etapes: 8, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 345, categorie: "Comptabilite", pilier: "Temps", description: "Analyse optique OCR des recus et ventilation automatique au grand livre." },
  { id: "pb-023", nom: "Rapprochement bancaire", departement: "CFOB", bots: ["Frank"], etapes: 7, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.2, downloads: 567, categorie: "Comptabilite", pilier: "Argent", description: "Tri automatise des transactions selon les extraits bancaires." },
  { id: "pb-024", nom: "Compilation TPS/TVQ", departement: "CFOB", bots: ["Frank", "Loulou"], etapes: 9, duree: "40min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 456, categorie: "Fiscalite", pilier: "Argent", description: "Preparation des totaux pour les declarations de taxes (TPS/TVQ)." },
  { id: "pb-025", nom: "Flash report sante financiere", departement: "CFOB", bots: ["Frank"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 1123, categorie: "Reporting", pilier: "Argent", description: "Synthese en temps reel des liquidites, marges et burn rate." },
  { id: "pb-026", nom: "Circuit approbation achats", departement: "CFOB", bots: ["Frank", "CarlOS"], etapes: 6, duree: "20min", niveau: "Standard", prix: "$49", rating: 4.1, downloads: 234, categorie: "Controle", pilier: "Argent", description: "Escalade selon les seuils d'autorisation budgetaire (1K, 5K, 10K+)." },
  { id: "pb-027", nom: "Projection tresorerie 30 jours", departement: "CFOB", bots: ["Frank", "Simone"], etapes: 8, duree: "35min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 345, categorie: "Previsions", pilier: "Argent", description: "Modelisation des flux monetaires a court terme avec scenarios." },
  { id: "pb-028", nom: "Modelisation financiere startup", departement: "CFOB", bots: ["Frank", "CarlOS"], etapes: 10, duree: "1 sem.", niveau: "Avance", prix: "$149", rating: 4.7, downloads: 178, categorie: "Previsions", pilier: "Argent", description: "Modele financier complet (P&L, CF, bilan) avec projections 36 mois et scenarios." },
  // ═══ MARKETING / CMO (Mathilde) — 9 playbooks ═══
  { id: "pb-030", nom: "Publication multi-reseaux", departement: "CMOB", bots: ["Mathilde"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 1567, categorie: "Social media", pilier: "Vente", description: "Adaptation du format et programmation du contenu sur LinkedIn, FB, Instagram." },
  { id: "pb-031", nom: "Recyclage contenu blog", departement: "CMOB", bots: ["Mathilde", "Ines"], etapes: 7, duree: "25min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 678, categorie: "Contenu", pilier: "Vente", description: "Extraction d'un article de blog en publications sociales, carousel et infographie." },
  { id: "pb-032", nom: "Creation infolettre mensuelle", departement: "CMOB", bots: ["Mathilde", "Tim"], etapes: 8, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 456, categorie: "Email", pilier: "Vente", description: "Brouillon, curation de liens et mise en page pour newsletter mensuelle." },
  { id: "pb-033", nom: "Analyse performance campagne", departement: "CMOB", bots: ["Mathilde", "Frank"], etapes: 6, duree: "20min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 345, categorie: "Analytics", pilier: "Vente", description: "Synthese du cout par acquisition (CPA), ROAS et recommandations d'optimisation." },
  { id: "pb-034", nom: "Generation brief creatif", departement: "CMOB", bots: ["Mathilde", "Paco"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.2, downloads: 567, categorie: "Branding", pilier: "Idee", description: "Documentation des exigences creatives pour designer externe ou production." },
  { id: "pb-035", nom: "Audit SEO de base", departement: "CMOB", bots: ["Mathilde", "Tim"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 789, categorie: "SEO", pilier: "Actif", description: "Verification des balises meta, liens brises, vitesse et recommandations." },
  { id: "pb-036", nom: "Veille concurrentielle basique", departement: "CMOB", bots: ["Mathilde", "Simone"], etapes: 6, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 345, categorie: "Veille", pilier: "Idee", description: "Scraping de positionnement des 3 principaux rivaux, matrice comparative." },
  { id: "pb-037", nom: "Creation persona ICP", departement: "CMOB", bots: ["Mathilde", "Rich", "Simone"], etapes: 6, duree: "3 jours", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 1234, categorie: "Strategie", pilier: "Vente", description: "Atelier structure pour definir vos personas ICP avec templates et guide d'entrevue." },
  { id: "pb-038", nom: "Lancement campagne digitale", departement: "CMOB", bots: ["Mathilde", "Rich"], etapes: 12, duree: "2 sem.", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 456, categorie: "Campagnes", pilier: "Vente", description: "Planification et execution d'une campagne multi-canal avec tracking ROI." },
  // ═══ STRATEGIE / CSO (Simone) — 8 playbooks ═══
  { id: "pb-040", nom: "Matrice SWOT flash", departement: "CSOB", bots: ["Simone", "CarlOS"], etapes: 5, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 890, categorie: "Analyse", pilier: "Idee", description: "Generation des forces, faiblesses, opportunites et menaces en format visuel." },
  { id: "pb-041", nom: "Cartographie positionnement marche", departement: "CSOB", bots: ["Simone", "Mathilde"], etapes: 7, duree: "35min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 345, categorie: "Positionnement", pilier: "Idee", description: "Analyse des axes de differenciation vs concurrence avec matrice." },
  { id: "pb-042", nom: "Synthese tendances sectorielles", departement: "CSOB", bots: ["Simone"], etapes: 4, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 678, categorie: "Veille", pilier: "Idee", description: "Resume executif des rapports de l'industrie et tendances emergentes." },
  { id: "pb-043", nom: "Scenario perte client majeur", departement: "CSOB", bots: ["Simone", "Frank"], etapes: 6, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 234, categorie: "Risques", pilier: "Actif", description: "Calcul d'impact de la perte du plus gros compte + plan de mitigation." },
  { id: "pb-044", nom: "Evaluation partenariat strategique", departement: "CSOB", bots: ["Simone", "Rich"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 456, categorie: "Alliances", pilier: "Vente", description: "Grille de ponderation pour evaluer les alliances B2B potentielles." },
  { id: "pb-045", nom: "Business Model Canvas workshop", departement: "CSOB", bots: ["Simone", "CarlOS"], etapes: 4, duree: "1 jour", niveau: "Quick Win", prix: "Gratuit", rating: 4.9, downloads: 1567, categorie: "Innovation", pilier: "Idee", description: "Atelier guide pour completer votre BMC avec exemples sectoriels." },
  { id: "pb-046", nom: "Analyse risques macro-economiques", departement: "CSOB", bots: ["Simone", "Frank"], etapes: 6, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 189, categorie: "Risques", pilier: "Argent", description: "Impact modelise de l'inflation, taux d'interet et recession sur votre entreprise." },
  { id: "pb-047", nom: "Analyse concurrentielle 360", departement: "CSOB", bots: ["Simone", "Mathilde"], etapes: 10, duree: "1 sem.", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 234, categorie: "Veille", pilier: "Idee", description: "Analyse approfondie de 5-10 concurrents avec matrice et recommandations strategiques." },
  // ═══ OPERATIONS / COO (Olivier) — 9 playbooks ═══
  { id: "pb-050", nom: "Standardisation processus (SOP)", departement: "COOB", bots: ["Olivier", "Tim"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 567, categorie: "Processus", pilier: "Temps", description: "Extraction de la logique d'un processus et mise en format SOP officiel." },
  { id: "pb-051", nom: "Plan continuite des affaires", departement: "COOB", bots: ["Olivier", "Sebastien"], etapes: 12, duree: "2 sem.", niveau: "Avance", prix: "$99", rating: 4.5, downloads: 234, categorie: "Resilience", pilier: "Actif", description: "Elaboration d'un PCA complet avec scenarios de crise et procedures de reprise." },
  { id: "pb-052", nom: "Inventaire theorique mensuel", departement: "COOB", bots: ["Olivier", "Frank"], etapes: 7, duree: "35min", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 345, categorie: "Inventaire", pilier: "Argent", description: "Rapprochement des ventes et du stock presume, ecarts identifies." },
  { id: "pb-053", nom: "Commande reapprovisionnement", departement: "COOB", bots: ["Olivier", "Frank"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 678, categorie: "Achats", pilier: "Argent", description: "Envoi automatise aux fournisseurs approuves quand seuil atteint." },
  { id: "pb-054", nom: "Logbook entretien preventif", departement: "COOB", bots: ["Olivier", "Paco"], etapes: 6, duree: "25min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 456, categorie: "Maintenance", pilier: "Actif", description: "Suivi de la maintenance preventive de l'equipement avec alertes echeancier." },
  { id: "pb-055", nom: "Rapport qualite et non-conformite", departement: "COOB", bots: ["Olivier", "Paco"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 345, categorie: "Qualite", pilier: "Actif", description: "Journalisation des defauts et anomalies avec analyse des causes racines." },
  { id: "pb-056", nom: "Analyse des temps morts", departement: "COOB", bots: ["Olivier", "CarlOS"], etapes: 8, duree: "40min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 234, categorie: "Amelioration", pilier: "Temps", description: "Identification des inefficacites operationnelles majeures et plan d'action." },
  { id: "pb-057", nom: "Cartographie des processus", departement: "COOB", bots: ["Olivier", "Tim"], etapes: 10, duree: "2 sem.", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 178, categorie: "Amelioration", pilier: "Temps", description: "Documentation et optimisation de vos processus cles avec goulots identifies." },
  { id: "pb-058", nom: "Protocole fermeture bureau", departement: "COOB", bots: ["Olivier", "Sebastien"], etapes: 3, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 890, categorie: "Securite", pilier: "Actif", description: "Checklist de securite et desactivation des systemes en fin de journee." },
  // ═══ PRODUCTION / CPO (Paco) — 9 playbooks ═══
  { id: "pb-060", nom: "Generation BOM (Bill of Materials)", departement: "CPOB", bots: ["Paco", "Frank"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 345, categorie: "Ingenierie", pilier: "Actif", description: "Compilation des intrants necessaires avec couts unitaires et fournisseurs." },
  { id: "pb-061", nom: "Emission ordre de fabrication", departement: "CPOB", bots: ["Paco", "Olivier"], etapes: 7, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 456, categorie: "Production", pilier: "Temps", description: "Lancement officiel et validation des specifications de fabrication." },
  { id: "pb-062", nom: "Controle qualite fin de ligne", departement: "CPOB", bots: ["Paco", "Loulou"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 567, categorie: "Qualite", pilier: "Actif", description: "Inspection visuelle et consignation des resultats avec photos." },
  { id: "pb-063", nom: "Journalisation rebuts (scrap log)", departement: "CPOB", bots: ["Paco", "Frank"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.2, downloads: 234, categorie: "Qualite", pilier: "Argent", description: "Suivi et calcul de la perte financiere associee aux rebuts de production." },
  { id: "pb-064", nom: "Planification quarts de travail", departement: "CPOB", bots: ["Paco", "Helene"], etapes: 6, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 345, categorie: "Planification", pilier: "Temps", description: "Allocation des ressources humaines sur la chaine de production par quarts." },
  { id: "pb-065", nom: "Calcul capacite production", departement: "CPOB", bots: ["Paco", "Olivier"], etapes: 7, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 234, categorie: "Planification", pilier: "Temps", description: "Evaluation de la charge vs ressources disponibles avec goulots identifies." },
  { id: "pb-066", nom: "Mise en place 5S usine", departement: "CPOB", bots: ["Paco", "Olivier"], etapes: 15, duree: "4 sem.", niveau: "Enterprise", prix: "$199", rating: 4.4, downloads: 89, categorie: "Lean", pilier: "Temps", description: "Implementation complete de la methodologie 5S avec audits et suivi." },
  { id: "pb-067", nom: "Brief ingenierie prototype", departement: "CPOB", bots: ["Paco", "Ines"], etapes: 8, duree: "40min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 178, categorie: "R&D", pilier: "Idee", description: "Demande de creation pour de nouveaux modeles avec specs et criteres." },
  { id: "pb-068", nom: "Tracabilite modifications recette", departement: "CPOB", bots: ["Paco", "Ines"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 123, categorie: "Qualite", pilier: "Actif", description: "Suivi des versions d'assemblage ou de formulation avec approbations." },
  // ═══ RH / CHRO (Helene) — 9 playbooks ═══
  { id: "pb-070", nom: "Redaction offre d'emploi", departement: "CHROB", bots: ["Helene", "Mathilde"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 789, categorie: "Recrutement", pilier: "Actif", description: "Structure du profil recherche, exigences et affichage multi-plateformes." },
  { id: "pb-071", nom: "Onboarding RH complet", departement: "CHROB", bots: ["Helene", "Loulou"], etapes: 9, duree: "40min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 1234, categorie: "Integration", pilier: "Temps", description: "Signature contrat, code de conduite, inscription paie et plan 30-60-90 jours." },
  { id: "pb-072", nom: "Offboarding employe", departement: "CHROB", bots: ["Helene", "Tim"], etapes: 8, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 456, categorie: "Depart", pilier: "Actif", description: "Desactivation d'acces, remise de materiel, entrevue de depart structuree." },
  { id: "pb-073", nom: "Evaluation performance annuelle", departement: "CHROB", bots: ["Helene", "CarlOS"], etapes: 6, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 567, categorie: "Performance", pilier: "Actif", description: "Generation de la grille d'evaluation avec auto-evaluation et feedback 360." },
  { id: "pb-074", nom: "Approbation conges et absences", departement: "CHROB", bots: ["Helene", "Olivier"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 890, categorie: "Administration", pilier: "Temps", description: "Validation et mise a jour du calendrier d'equipe automatiquement." },
  { id: "pb-075", nom: "Alerte echeance formation CNESST", departement: "CHROB", bots: ["Helene", "Loulou"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.3, downloads: 345, categorie: "Conformite", pilier: "Actif", description: "Suivi des certifications de securite obligatoires avec rappels automatiques." },
  { id: "pb-076", nom: "Sondage climat de travail", departement: "CHROB", bots: ["Helene", "Simone"], etapes: 7, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 234, categorie: "Culture", pilier: "Actif", description: "Elaboration de questions anonymes, agregation des resultats et recommandations." },
  { id: "pb-077", nom: "Declaration accident travail CNESST", departement: "CHROB", bots: ["Helene", "Loulou"], etapes: 8, duree: "35min", niveau: "Standard", prix: "Gratuit", rating: 4.2, downloads: 178, categorie: "Conformite", pilier: "Argent", description: "Aide au remplissage du formulaire officiel CNESST avec documentation requise." },
  { id: "pb-078", nom: "Evaluation performance 360", departement: "CHROB", bots: ["Helene", "CarlOS"], etapes: 8, duree: "1 sem.", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 345, categorie: "Performance", pilier: "Actif", description: "Processus complet avec auto-evaluation, feedback collegues et plan de developpement." },
  // ═══ INNOVATION / CINO (Ines) — 8 playbooks ═══
  { id: "pb-080", nom: "Brainstorming nouveau produit", departement: "CINOB", bots: ["Ines", "Mathilde"], etapes: 6, duree: "40min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 567, categorie: "Ideation", pilier: "Idee", description: "Seance d'ideation structuree avec matrice de filtres et scoring." },
  { id: "pb-081", nom: "Recherche anteriorite brevets", departement: "CINOB", bots: ["Ines", "Loulou"], etapes: 5, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 178, categorie: "PI", pilier: "Actif", description: "Balayage preliminaire des bases de donnees publiques de brevets." },
  { id: "pb-082", nom: "Triage boite a idees", departement: "CINOB", bots: ["Ines", "CarlOS"], etapes: 4, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 789, categorie: "Ideation", pilier: "Idee", description: "Evaluation rapide des suggestions de l'equipe avec criteres de faisabilite." },
  { id: "pb-083", nom: "Synthese veille technologique", departement: "CINOB", bots: ["Ines", "Tim"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 456, categorie: "Veille", pilier: "Idee", description: "Compilation des avancees recentes du secteur avec impact potentiel." },
  { id: "pb-084", nom: "Evaluation faisabilite technique", departement: "CINOB", bots: ["Ines", "Tim"], etapes: 7, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 234, categorie: "R&D", pilier: "Idee", description: "Analyse d'un nouveau concept de processus avec criteres go/no-go." },
  { id: "pb-085", nom: "Tracking heures R&D (RS&DE)", departement: "CINOB", bots: ["Ines", "Frank"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 345, categorie: "Fiscalite", pilier: "Argent", description: "Log pour recuperation de credits d'impot RS&DE federal et provincial." },
  { id: "pb-086", nom: "Sprint Design Thinking", departement: "CINOB", bots: ["Ines", "Mathilde", "Rich"], etapes: 10, duree: "1 sem.", niveau: "Avance", prix: "$99", rating: 4.8, downloads: 234, categorie: "Innovation", pilier: "Idee", description: "Sprint de 5 jours base sur le Design Thinking avec livrables concrets." },
  { id: "pb-087", nom: "Definition POC (Preuve de concept)", departement: "CINOB", bots: ["Ines", "Paco"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 345, categorie: "R&D", pilier: "Idee", description: "Etablissement des criteres de succes et plan d'execution du POC." },
  // ═══ JURIDIQUE / CLO (Loulou) — 5 playbooks ═══
  { id: "pb-090", nom: "Conformite Loi 25 (vie privee)", departement: "CLOB", bots: ["Loulou", "Sebastien", "Tim"], etapes: 14, duree: "4 sem.", niveau: "Enterprise", prix: "$199", rating: 4.6, downloads: 567, categorie: "Conformite", pilier: "Actif", description: "Mise en conformite complete: nomination RPRP, inventaire donnees, politique, registre." },
  { id: "pb-091", nom: "Redaction NDA mutuel", departement: "CLOB", bots: ["Loulou"], etapes: 4, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 890, categorie: "Contrats", pilier: "Actif", description: "Generation d'un accord de confidentialite bilingue avec clauses standard." },
  { id: "pb-092", nom: "Revue contrat fournisseur", departement: "CLOB", bots: ["Loulou", "Frank"], etapes: 6, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 345, categorie: "Contrats", pilier: "Actif", description: "Analyse des clauses cles, risques et recommandations de negociation." },
  { id: "pb-093", nom: "Audit conformite reglementaire", departement: "CLOB", bots: ["Loulou", "CarlOS"], etapes: 10, duree: "1 sem.", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 178, categorie: "Conformite", pilier: "Actif", description: "Verification complete des obligations legales par secteur d'activite." },
  { id: "pb-094", nom: "Protection marque de commerce", departement: "CLOB", bots: ["Loulou", "Ines"], etapes: 8, duree: "2 sem.", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 234, categorie: "PI", pilier: "Actif", description: "Processus de depot de marque avec recherche de disponibilite et suivi." },
  // ═══ CYBERSECURITE / CISO (Sebastien) — 5 playbooks ═══
  { id: "pb-100", nom: "Audit securite baseline", departement: "CISOB", bots: ["Sebastien", "Tim"], etapes: 10, duree: "1 sem.", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 345, categorie: "Audit", pilier: "Actif", description: "Evaluation de votre posture de securite: MFA, sauvegardes, acces, vulnerabilites." },
  { id: "pb-101", nom: "Plan reponse incidents cyber", departement: "CISOB", bots: ["Sebastien", "Tim", "Loulou"], etapes: 12, duree: "2 sem.", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 178, categorie: "Gestion crise", pilier: "Actif", description: "Isolement reseau, evaluation obligations legales, communication de crise." },
  { id: "pb-102", nom: "Formation anti-hameconnage", departement: "CISOB", bots: ["Sebastien", "Helene"], etapes: 6, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 567, categorie: "Formation", pilier: "Actif", description: "Module de sensibilisation au phishing avec exemples et quiz." },
  { id: "pb-103", nom: "Revue acces utilisateurs", departement: "CISOB", bots: ["Sebastien", "Tim"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.3, downloads: 456, categorie: "IAM", pilier: "Actif", description: "Audit des comptes actifs, permissions excessives et comptes orphelins." },
  { id: "pb-104", nom: "Checklist sauvegarde mensuelle", departement: "CISOB", bots: ["Sebastien"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 890, categorie: "Backup", pilier: "Actif", description: "Verification integrite des sauvegardes, test de restauration et rapport." },
  // ═══ VENTES / CRO (Rich) — 5 playbooks ═══
  { id: "pb-010", nom: "Pipeline prospection B2B", departement: "CROB", bots: ["Rich", "Mathilde"], etapes: 10, duree: "1 sem.", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 567, categorie: "Prospection", pilier: "Vente", description: "Mise en place d'un pipeline B2B structure avec sequences email et relances." },
  { id: "pb-011", nom: "Onboarding nouveau client", departement: "CROB", bots: ["Rich", "Olivier"], etapes: 8, duree: "2 sem.", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 345, categorie: "Service client", pilier: "Vente", description: "Processus d'accueil structure avec checklist et follow-ups automatises." },
  { id: "pb-012", nom: "Closing accelerator", departement: "CROB", bots: ["Rich", "Simone"], etapes: 6, duree: "3 jours", niveau: "Avance", prix: "$99", rating: 4.9, downloads: 178, categorie: "Negociation", pilier: "Vente", description: "Techniques avancees de closing avec analyse objections et scripts personnalises." },
  { id: "pb-013", nom: "Qualification leads BANT", departement: "CROB", bots: ["Rich", "CarlOS"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 890, categorie: "Qualification", pilier: "Vente", description: "Grille Budget-Autorite-Need-Timeline pour qualifier rapidement les opportunites." },
  { id: "pb-014", nom: "Win/Loss analysis post-vente", departement: "CROB", bots: ["Rich", "Simone"], etapes: 7, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 234, categorie: "Analytics", pilier: "Vente", description: "Analyse post-mortem des ventes gagnees et perdues avec patterns identifies." },
  // ═══ CONFERENCE AI — 5 playbooks ═══
  { id: "pb-200", nom: "Board Room — Revue strategique", departement: "CEOB", bots: ["CarlOS", "Simone", "Frank", "Rich"], etapes: 6, duree: "2h", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 1234, categorie: "Conference AI", pilier: "Idee", description: "Session de board avec 4 bots pour revue strategique trimestrielle." },
  { id: "pb-201", nom: "Brainstorm innovation produit", departement: "CINOB", bots: ["Ines", "Mathilde", "Tim", "CarlOS"], etapes: 4, duree: "1h", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 890, categorie: "Conference AI", pilier: "Idee", description: "Session collaborative multi-bots pour generer des idees produit disruptives." },
  { id: "pb-202", nom: "Coaching leadership 1-on-1", departement: "CEOB", bots: ["CarlOS"], etapes: 8, duree: "45min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 567, categorie: "Conference AI", pilier: "Actif", description: "Session de coaching personnalisee sur le leadership avec exercices pratiques." },
  { id: "pb-203", nom: "War Room — Gestion de crise", departement: "CEOB", bots: ["CarlOS", "Sebastien", "Loulou", "Frank"], etapes: 8, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 345, categorie: "Conference AI", pilier: "Actif", description: "Session d'urgence multi-bots pour gerer une crise avec plan d'action immediat." },
  { id: "pb-204", nom: "Podcast interne — Culture talk", departement: "CHROB", bots: ["Helene", "CarlOS"], etapes: 6, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 234, categorie: "Conference AI", pilier: "Actif", description: "Format podcast pour discuter culture, valeurs et engagement d'equipe." },
  // ═══ TRANSVERSAUX — Playbooks multi-departements ═══
  { id: "pb-300", nom: "Audit annuel complet", departement: "CEOB", bots: ["CarlOS", "Frank", "Loulou", "Sebastien", "Tim"], etapes: 25, duree: "3 mois", niveau: "Enterprise", prix: "$299", rating: 4.8, downloads: 156, categorie: "Audit", pilier: "Actif", description: "Orchestration transversale: lasses fiscales, revue contrats, audit acces, conformite ISO." },
  { id: "pb-301", nom: "Go-To-Market nouveau produit", departement: "CMOB", bots: ["Mathilde", "Rich", "Frank", "Paco", "Simone"], etapes: 18, duree: "6 sem.", niveau: "Enterprise", prix: "$199", rating: 4.7, downloads: 234, categorie: "Lancement", pilier: "Vente", description: "Specs produit + strategie prix + plan marketing + pipeline ventes + formation equipe." },
  { id: "pb-302", nom: "Integration nouvel employe complete", departement: "CHROB", bots: ["Helene", "Tim", "Loulou", "Olivier"], etapes: 15, duree: "90 jours", niveau: "Avance", prix: "$49", rating: 4.6, downloads: 567, categorie: "Onboarding", pilier: "Temps", description: "Contrat + acces IT + plan 30-60-90 + formation securite + evaluation probation." },
  { id: "pb-303", nom: "Dossier reclamation RS&DE", departement: "CINOB", bots: ["Ines", "Frank", "Tim", "Sebastien"], etapes: 14, duree: "4 sem.", niveau: "Enterprise", prix: "$199", rating: 4.5, downloads: 178, categorie: "Fiscalite", pilier: "Argent", description: "Logs techniques, narration scientifique, donnees financieres T661 et credit Quebec." },
  { id: "pb-304", nom: "Plan d'affaires complet", departement: "CEOB", bots: ["CarlOS", "Frank", "Mathilde", "Simone"], etapes: 20, duree: "2 sem.", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 456, categorie: "Strategie", pilier: "Idee", description: "Synthese executive + projections 3 ans + strategie acquisition + analyse macro." },
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
  { id: "crise", label: "Kit Urgence & Crise", description: "Playbooks d'urgence pour les situations critiques — cash flow, incident, rappel produit", icon: AlertTriangle, gradient: "from-red-500 to-rose-500", playbookIds: ["pb-028", "pb-100", "pb-085", "pb-104", "pb-090"] },
  { id: "operations", label: "Automatisation Operations", description: "Production, inventaire, qualite, maintenance — automatisez le plancher", icon: Settings, gradient: "from-gray-500 to-slate-500", playbookIds: ["pb-050", "pb-058", "pb-060", "pb-062", "pb-064"] },
  { id: "scale-up", label: "Scale-Up Pack", description: "Pour les entreprises T3-T5 (50+ employes) pretes a passer au niveau superieur", icon: TrendingUp, gradient: "from-violet-500 to-purple-500", playbookIds: ["pb-010", "pb-012", "pb-037", "pb-045", "pb-003"] },
  { id: "manufacturier", label: "Kit Manufacturier", description: "Specifiquement concu pour les PME manufacturieres quebecoises", icon: Factory, gradient: "from-amber-500 to-yellow-500", playbookIds: ["pb-050", "pb-058", "pb-060", "pb-062", "pb-090", "pb-075"] },
  { id: "intelligence", label: "Intelligence Concurrentielle", description: "SWOT, veille concurrentielle, positionnement, analyse de marche", icon: Eye, gradient: "from-indigo-500 to-blue-500", playbookIds: ["pb-047", "pb-045", "pb-037", "pb-010"] },
  { id: "rh-complet", label: "Kit RH Complet", description: "Recrutement, onboarding, evaluation de performance, plan de formation", icon: Users, gradient: "from-pink-500 to-rose-500", playbookIds: ["pb-071", "pb-074", "pb-077", "pb-082"] },
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
const PLAYBOOK_REVIEWS: Record<string, { auteur: string; role: string; industrie: string; rating: number; titre: string; texte: string; date: string; resultat?: string }[]> = {
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
    { nom: "Matrice de risques", type: "Excel", icon: AlertTriangle },
    { nom: "Plan de correction (12 actions)", type: "PDF", icon: Wrench },
  ],
};

// ── Dept icons mapping for category grid ──
const DEPT_ICONS: Record<string, React.ElementType> = {
  CEOB: Building2, CTOB: Cpu, CFOB: DollarSign, CMOB: Palette,
  CSOB: Compass, COOB: Settings, CPOB: Factory, CHROB: Users,
  CINOB: Sparkles, CROB: TrendingUp, CLOB: Shield, CISOB: Lock,
};

function PlaybookCardV2({ pb, installed, recommended, badge, onOpenDetail }: { pb: typeof PLAYBOOK_STORE_DATA[0]; installed?: boolean; recommended?: boolean; badge?: "nouveau" | "populaire" | "trending"; onOpenDetail?: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  const niveauStyle = NIVEAU_BADGE[pb.niveau] || NIVEAU_BADGE.Standard;
  const deptColor = DEPT_COLORS[pb.departement] || DEPT_COLORS.CEOB;
  const isInstalled = installed || INSTALLED_PLAYBOOKS.includes(pb.id);
  return (
    <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group" onClick={() => onOpenDetail?.(pb)}>
      {/* Mini gradient header */}
      <div className={cn("h-1.5 bg-gradient-to-r", deptColor.gradient)} />
      <div className="px-3 py-2.5 space-y-1.5">
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-gray-800 leading-tight line-clamp-1">{pb.nom}</div>
            <p className="text-[9px] text-gray-500 mt-0.5 line-clamp-1">{pb.description}</p>
          </div>
          {badge === "nouveau" && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 shrink-0">Nouveau</span>}
          {badge === "populaire" && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 shrink-0">Populaire</span>}
          {badge === "trending" && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 shrink-0">Trending</span>}
          {!badge && recommended && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-green-50 text-green-700 shrink-0">IA Recommande</span>}
          {!badge && !recommended && isInstalled && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 shrink-0 flex items-center gap-0.5"><CheckCircle2 className="h-3.5 w-3.5" />Installe</span>}
        </div>
        {/* Bot avatars + rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {pb.bots.slice(0, 3).map((bot, i) => (
              <span key={i} className="text-[8px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{bot}</span>
            ))}
            {pb.bots.length > 3 && <span className="text-[8px] text-gray-400">+{pb.bots.length - 3}</span>}
          </div>
          <div className="flex items-center gap-0.5">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span className="text-[9px] font-bold text-gray-600">{pb.rating}</span>
            <span className="text-[8px] text-gray-400">({pb.downloads})</span>
          </div>
        </div>
        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded", niveauStyle.bg, niveauStyle.text)}>{pb.niveau}</span>
          <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded", pb.prix === "Gratuit" ? "bg-emerald-50 text-emerald-700" : "bg-purple-50 text-purple-700")}>{pb.prix === "Gratuit" ? "Inclus" : pb.prix}</span>
          <span className="text-[8px] text-gray-400">{pb.duree}</span>
        </div>
      </div>
    </Card>
  );
}

// ── Fiche Playbook Detaillee INLINE (PAS de modal — drill-down dans le panel) ──
function PlaybookFicheDetailInline({ pb, onBack }: { pb: typeof PLAYBOOK_STORE_DATA[0]; onBack: () => void }) {
  const niveauStyle = NIVEAU_BADGE[pb.niveau] || NIVEAU_BADGE.Standard;
  const isInstalled = INSTALLED_PLAYBOOKS.includes(pb.id);
  const deptColor = DEPT_COLORS[pb.departement] || DEPT_COLORS.CEOB;
  const pilierColor = PILIER_COLORS[pb.pilier] || PILIER_COLORS.Actif;
  const workflows = PLAYBOOK_WORKFLOWS[pb.id] || Array.from({ length: pb.etapes }, (_, i) => ({
    num: i + 1, label: i === 0 ? "Collecte des donnees et parametres" : i === pb.etapes - 1 ? "Generation du livrable final" : `Etape ${i + 1} — Traitement automatise`, bot: pb.bots[i % pb.bots.length], duree: "~2 min", validation: i === Math.floor(pb.etapes / 2),
  }));
  const reviews = PLAYBOOK_REVIEWS[pb.id] || [];
  const livrables = PLAYBOOK_LIVRABLES[pb.id] || [];
  const similarDept = PLAYBOOK_STORE_DATA.filter(p => p.departement === pb.departement && p.id !== pb.id).slice(0, 3);
  const similarPilier = PLAYBOOK_STORE_DATA.filter(p => p.pilier === pb.pilier && p.id !== pb.id && p.departement !== pb.departement).slice(0, 3);

  return (
    <div className="space-y-3">
      {/* Back button */}
      <button onClick={onBack} className="text-[9px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
        <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Retour au Store
      </button>

      {/* Section 1 — Hero */}
      <div className={cn("bg-gradient-to-r rounded-xl px-4 py-4", deptColor.gradient)}>
        <div className="flex items-center gap-1.5 mb-2">
          <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white")}>{pb.niveau}</span>
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white">{pb.prix === "Gratuit" ? "Inclus" : pb.prix}</span>
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white">{DEPT_LABELS[pb.departement]}</span>
        </div>
        <h3 className="text-sm font-bold text-white">{pb.nom}</h3>
        <p className="text-[10px] text-white/80 mt-1">{pb.description}</p>
        <div className="flex items-center gap-3 mt-3 text-[9px] text-white/70">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={cn("h-3.5 w-3.5", s <= Math.round(pb.rating) ? "text-white fill-white" : "text-white/30")} />
            ))}
            <span className="ml-1 text-white">{pb.rating}/5</span>
          </div>
          <span>{pb.downloads} activations</span>
          <span>{pb.duree}</span>
          <span>{pb.etapes} etapes</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {isInstalled ? (
            <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-700 bg-white rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
              <Rocket className="h-3.5 w-3.5" /> Executer
            </button>
          ) : pb.prix === "Gratuit" ? (
            <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-white rounded-lg cursor-pointer hover:bg-emerald-50 transition-colors">
              <Plus className="h-3.5 w-3.5" /> Activer ce playbook
            </button>
          ) : (
            <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-700 bg-white rounded-lg cursor-pointer hover:bg-amber-50 transition-colors">
              <ShoppingBag className="h-3.5 w-3.5" /> Acheter {pb.prix}
            </button>
          )}
        </div>
      </div>

      {/* Section 2 — Ce que ce playbook fait */}
      <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
        <div className="px-4 py-3">
          <h4 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-2">Ce que ce playbook fait</h4>
          <div className="space-y-1.5">
            {(pb.description + ". Analyse automatique de vos donnees. Generation d'un rapport complet. Plan d'action priorise.").split(". ").filter(Boolean).slice(0, 4).map((point, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[9px] text-gray-700">{point.trim()}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Section 3 — Equipe IA impliquee */}
      <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
        <div className="px-4 py-3">
          <h4 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-2">Equipe IA impliquee</h4>
          <div className="space-y-1.5">
            {pb.bots.map((bot, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                <Bot className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[9px] font-bold text-gray-800 flex-1">{bot}</span>
                <span className="text-[8px] text-gray-400">{i === 0 ? "Pilote" : i === 1 ? "Analyste" : "Support"}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Section 4 — Workflow */}
      <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
        <div className="px-4 py-3">
          <h4 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-2">Workflow ({workflows.length} etapes)</h4>
          <div className="space-y-2">
            {workflows.map((step) => (
              <div key={step.num} className="flex items-start gap-2">
                <span className="text-[8px] font-bold text-white bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">{step.num}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-700">{step.label}</span>
                    <span className="text-[8px] text-gray-400 shrink-0 ml-2">{step.duree}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] text-blue-600 font-bold">{step.bot}</span>
                    {step.validation && <span className="text-[8px] text-amber-600 font-bold flex items-center gap-0.5"><AlertTriangle className="h-3.5 w-3.5" /> Validation requise</span>}
                    {step.livrable && <span className="text-[8px] text-emerald-600 font-bold flex items-center gap-0.5"><FileText className="h-3.5 w-3.5" /> {step.livrable}</span>}
                    {step.input && <span className="text-[8px] text-gray-500 italic">{step.input}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Section 5 — Ce que vous recevez (livrables) */}
      {livrables.length > 0 && (
        <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
          <div className="px-4 py-3">
            <h4 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-2">Ce que vous recevez</h4>
            <div className="space-y-1.5">
              {livrables.map((l, i) => {
                const LivIcon = l.icon;
                return (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                    <LivIcon className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-[9px] text-gray-700 flex-1">{l.nom}</span>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">{l.type}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Section 6 — Avis utilisateurs */}
      {reviews.length > 0 && (
        <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
          <div className="px-4 py-3">
            <h4 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-2">Avis utilisateurs</h4>
            {/* Rating distribution */}
            <div className="space-y-0.5 mb-3">
              {[5,4,3,2,1].map(stars => {
                const count = reviews.filter(r => r.rating === stars).length;
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-1.5">
                    <span className="text-[8px] text-gray-500 w-3">{stars}</span>
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5"><div className="bg-amber-400 rounded-full h-1.5" style={{ width: `${pct}%` }} /></div>
                    <span className="text-[8px] text-gray-400 w-3">{count}</span>
                  </div>
                );
              })}
            </div>
            {/* Reviews */}
            <div className="space-y-2">
              {reviews.map((r, i) => (
                <div key={i} className="border-t border-gray-100 pt-2">
                  <div className="flex items-center gap-1 mb-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className={cn("h-3.5 w-3.5", s <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200")} />)}
                    <span className="text-[9px] font-bold text-gray-800 ml-1">{r.titre}</span>
                  </div>
                  <p className="text-[9px] text-gray-600">{r.texte}</p>
                  <div className="flex items-center gap-2 mt-1 text-[8px] text-gray-400">
                    <span>{r.auteur}, {r.role}</span>
                    <span>{r.industrie}</span>
                    {r.resultat && <span className="text-emerald-600 font-bold">{r.resultat}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Section 7 — Playbooks similaires */}
      {(similarDept.length > 0 || similarPilier.length > 0) && (
        <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
          <div className="px-4 py-3 space-y-3">
            {similarDept.length > 0 && (
              <div>
                <h4 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-2">Souvent active ensemble</h4>
                <div className="grid grid-cols-3 gap-2">
                  {similarDept.map(sp => (
                    <div key={sp.id} className="bg-gray-50 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => { /* would navigate */ }}>
                      <div className="text-[8px] font-bold text-gray-800 line-clamp-1">{sp.nom}</div>
                      <div className="text-[8px] text-gray-400">{sp.bots[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {similarPilier.length > 0 && (
              <div>
                <h4 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-2">Vous pourriez aussi aimer</h4>
                <div className="grid grid-cols-3 gap-2">
                  {similarPilier.map(sp => (
                    <div key={sp.id} className="bg-gray-50 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="text-[8px] font-bold text-gray-800 line-clamp-1">{sp.nom}</div>
                      <div className="text-[8px] text-gray-400">{sp.bots[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Section 8 — Details techniques */}
      <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
        <div className="px-4 py-3">
          <h4 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-2">Details</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div><span className="text-[8px] text-gray-400 block">Departement</span><span className="text-[9px] text-gray-700">{DEPT_LABELS[pb.departement] || pb.departement}</span></div>
            <div><span className="text-[8px] text-gray-400 block">Categorie</span><span className="text-[9px] text-gray-700">{pb.categorie}</span></div>
            <div><span className="text-[8px] text-gray-400 block">Pilier VITAA</span><span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", pilierColor.bg, pilierColor.text)}>{pb.pilier}</span></div>
            <div><span className="text-[8px] text-gray-400 block">Duree estimee</span><span className="text-[9px] text-gray-700">{pb.duree}</span></div>
            <div><span className="text-[8px] text-gray-400 block">Createur</span><span className="text-[9px] text-gray-700">Brain Team (officiel)</span></div>
            <div><span className="text-[8px] text-gray-400 block">Version</span><span className="text-[9px] text-gray-700">1.0</span></div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════
// PLAYBOOK STORE — Vues individuelles
// ══════════════════════════════════════════

type PlaybookStoreView = "decouvrir" | "categorie" | "collections" | "installed" | "encours" | "historique" | "builder";

// ── Vue DECOUVRIR (homepage du Store) ──
function PlaybookDecouvrir({ botCode, onOpenDetail, onNavigate }: { botCode: string; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void; onNavigate: (view: PlaybookStoreView, extra?: { dept?: string; collection?: string }) => void }) {
  const featuredItems = FEATURED_PLAYBOOKS.map(f => ({ ...f, pb: PLAYBOOK_STORE_DATA.find(p => p.id === f.playbookId) })).filter(f => f.pb);
  const recommended = RECOMMENDED_PLAYBOOKS.map(r => ({ ...r, pb: PLAYBOOK_STORE_DATA.find(p => p.id === r.playbookId) })).filter(r => r.pb && (botCode === "CEOB" || r.pb!.departement === botCode));
  const popular = [...PLAYBOOK_STORE_DATA].sort((a, b) => b.downloads - a.downloads).slice(0, 6);
  const recent = [...PLAYBOOK_STORE_DATA].slice(-6).reverse();

  return (
    <div className="space-y-4">
      {/* Intro — Bienvenue dans le Playbook Store */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 rounded-xl px-4 py-4">
        <h3 className="text-sm font-bold text-gray-900">Bienvenue dans le Playbook Store</h3>
        <p className="text-[10px] text-gray-600 leading-relaxed mt-1">
          Votre equipe IA est prete a travailler pour vous. Un playbook, c'est un processus d'affaires complet,
          execute automatiquement par vos bots — de la collecte de donnees jusqu'a la livraison du resultat final.
        </p>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="bg-white rounded-lg px-3 py-2 border border-gray-100">
            <span className="text-[9px] font-bold text-gray-800">1. Choisissez</span>
            <p className="text-[8px] text-gray-500 leading-relaxed mt-1">Parcourez {PLAYBOOK_STORE_DATA.length} playbooks classes par departement, difficulte et objectif. Diagnostic financier, audit securite, conformite Loi 25, plan marketing — tout y est.</p>
          </div>
          <div className="bg-white rounded-lg px-3 py-2 border border-gray-100">
            <span className="text-[9px] font-bold text-gray-800">2. Activez</span>
            <p className="text-[8px] text-gray-500 leading-relaxed mt-1">Un clic et vos bots se mettent au travail. Frank analyse vos finances, Tim audite votre securite, Mathilde cree votre contenu — chacun son expertise.</p>
          </div>
          <div className="bg-white rounded-lg px-3 py-2 border border-gray-100">
            <span className="text-[9px] font-bold text-gray-800">3. Recevez</span>
            <p className="text-[8px] text-gray-500 leading-relaxed mt-1">Rapports PDF, tableaux Excel, plans d'action priorises — des livrables concrets que vous pouvez utiliser immediatement avec votre equipe.</p>
          </div>
        </div>
      </div>

      {/* Section 1 — Top 3 Playbooks de la semaine */}
      {featuredItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <h3 className="text-xs font-bold text-gray-800">Top 3 — Playbooks de la semaine</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {featuredItems.map(f => {
              if (!f.pb) return null;
              const livrables = PLAYBOOK_LIVRABLES[f.pb.id] || [];
              return (
                <div key={f.playbookId} className={cn("relative bg-gradient-to-r rounded-xl overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow", f.gradient)} onClick={() => onOpenDetail(f.pb!)}>
                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <div className="relative p-4">
                    {/* Rank badge + pills */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className={cn("text-[9px] font-bold w-6 h-6 rounded-full flex items-center justify-center gap-0.5", f.rank === 1 ? "bg-amber-400 text-amber-900" : "bg-white/20 text-white")}>
                        {f.rank === 1 && <Crown className="h-3.5 w-3.5" />}
                        {f.rank !== 1 && f.rank}
                      </span>
                      <span className="text-[8px] font-medium px-2 py-0.5 rounded-full bg-white/15 text-white">{f.pb.niveau}</span>
                      <span className="text-[8px] font-medium px-2 py-0.5 rounded-full bg-white/15 text-white">{f.pb.prix === "Gratuit" ? "Inclus" : f.pb.prix}</span>
                    </div>
                    {/* Title */}
                    <h4 className="text-sm font-bold text-white leading-tight">{f.pb.nom}</h4>
                    <p className="text-[9px] text-white/80 mt-1.5 line-clamp-3 leading-relaxed">{f.editorial}</p>
                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mt-3">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={cn("h-3.5 w-3.5", s <= Math.round(f.pb!.rating) ? "text-amber-300 fill-amber-300" : "text-white/20")} />
                        ))}
                      </div>
                      <span className="text-[9px] text-white font-bold">{f.pb.rating}/5</span>
                    </div>
                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-2 text-[8px] text-white/70">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{f.pb.downloads} activations</span>
                      <span>{f.pb.etapes} etapes</span>
                      <span>{f.pb.duree}</span>
                    </div>
                    {/* 2 CTA buttons */}
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
      )}

      {/* Section 2 — Recommandes pour vous */}
      {recommended.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-green-500" /> Recommandes pour vous</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {recommended.slice(0, 6).map(r => r.pb && (
              <PlaybookCardV2 key={r.playbookId} pb={r.pb} recommended onOpenDetail={onOpenDetail} />
            ))}
          </div>
        </div>
      )}

      {/* Section 3 — Populaires cette semaine */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-amber-500" /> Populaires cette semaine</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {popular.map(pb => (
            <PlaybookCardV2 key={pb.id} pb={pb} badge={pb.downloads > 500 ? "populaire" : undefined} onOpenDetail={onOpenDetail} />
          ))}
        </div>
      </div>

      {/* Section 4 — Nouveautes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-blue-500" /> Recemment ajoutes</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {recent.map(pb => (
            <PlaybookCardV2 key={pb.id} pb={pb} badge="nouveau" onOpenDetail={onOpenDetail} />
          ))}
        </div>
      </div>

      {/* Section 5 — Navigation par departement */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><LayoutGrid className="h-3.5 w-3.5 text-gray-500" /> Explorer par departement</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(DEPT_LABELS).map(([code, label]) => {
            const DIcon = DEPT_ICONS[code] || Building2;
            const dColor = DEPT_COLORS[code] || DEPT_COLORS.CEOB;
            const count = PLAYBOOK_STORE_DATA.filter(p => p.departement === code).length;
            return (
              <Card key={code} className="p-0 gap-0 overflow-hidden rounded-lg cursor-pointer hover:shadow-md hover:border-blue-200 transition-all" onClick={() => onNavigate("categorie", { dept: code })}>
                <div className={cn("h-1 bg-gradient-to-r", dColor.gradient)} />
                <div className="px-2.5 py-2 text-center">
                  <DIcon className={cn("h-4 w-4 mx-auto mb-1", dColor.text)} />
                  <div className="text-[9px] font-bold text-gray-800">{label}</div>
                  <div className="text-[8px] text-gray-400">{count} playbooks</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Section 6 — Collections */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Bookmark className="h-3.5 w-3.5 text-purple-500" /> Collections</h3>
          <button onClick={() => onNavigate("collections")} className="text-[9px] text-blue-500 hover:text-blue-700 cursor-pointer font-bold">Voir tout</button>
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

      {/* Section 7 — Bandeau Marketplace */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2 flex items-center gap-2">
        <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <span className="text-[9px] text-blue-700">Playbook Store · {PLAYBOOK_STORE_DATA.length} playbooks disponibles · 85% createur / 15% plateforme</span>
        <button onClick={() => onNavigate("builder")} className="text-[9px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer ml-auto shrink-0">Publiez le votre</button>
      </div>
    </div>
  );
}

// ── Vue CATEGORIE (filtree par departement) ──
function PlaybookCategorie({ botCode, selectedDept, onOpenDetail, onBack }: { botCode: string; selectedDept: string; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void; onBack: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNiveau, setFilterNiveau] = useState<string>("all");
  const [filterPrix, setFilterPrix] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("populaires");

  const deptColor = DEPT_COLORS[selectedDept] || DEPT_COLORS.CEOB;
  const deptLabel = DEPT_LABELS[selectedDept] || selectedDept;
  const DIcon = DEPT_ICONS[selectedDept] || Building2;

  let filtered = PLAYBOOK_STORE_DATA.filter(pb => {
    if (pb.departement !== selectedDept) return false;
    if (searchTerm && !pb.nom.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.categorie.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterNiveau !== "all" && pb.niveau !== filterNiveau) return false;
    if (filterPrix === "gratuit" && pb.prix !== "Gratuit") return false;
    if (filterPrix === "premium" && pb.prix === "Gratuit") return false;
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

      {/* Barre filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-[180px] relative">
          <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher..." className="w-full text-xs border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)} className="text-[9px] border border-gray-200 rounded-lg px-2 py-1.5">
          <option value="all">Difficulte</option>
          <option value="Quick Win">Quick Win</option>
          <option value="Standard">Standard</option>
          <option value="Avance">Avance</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <select value={filterPrix} onChange={e => setFilterPrix(e.target.value)} className="text-[9px] border border-gray-200 rounded-lg px-2 py-1.5">
          <option value="all">Prix</option>
          <option value="gratuit">Inclus</option>
          <option value="premium">Premium</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-[9px] border border-gray-200 rounded-lg px-2 py-1.5">
          <option value="populaires">Populaires</option>
          <option value="rating">Mieux notes</option>
          <option value="alpha">Alphabetique</option>
        </select>
      </div>

      {/* Compteur */}
      <span className="text-[9px] text-gray-400">{filtered.length} playbooks trouves</span>

      {/* Grille */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(pb => <PlaybookCardV2 key={pb.id} pb={pb} onOpenDetail={onOpenDetail} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-8 w-8 text-gray-200 mb-3" />
          <p className="text-xs text-gray-400 mb-2">Aucun playbook ne correspond a vos criteres</p>
          <button onClick={() => { setSearchTerm(""); setFilterNiveau("all"); setFilterPrix("all"); }} className="text-[9px] text-blue-600 font-bold cursor-pointer">Reinitialiser les filtres</button>
        </div>
      )}
    </div>
  );
}

// ── Vue COLLECTIONS ──
function PlaybookCollectionsView({ selectedCollection, onOpenDetail, onSelectCollection, onBack }: { selectedCollection: string | null; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void; onSelectCollection: (id: string | null) => void; onBack: () => void }) {
  if (selectedCollection) {
    const col = STORE_COLLECTIONS_V2.find(c => c.id === selectedCollection);
    if (!col) return null;
    const ColIcon = col.icon;
    const playbooks = col.playbookIds.map(id => PLAYBOOK_STORE_DATA.find(p => p.id === id)).filter(Boolean) as typeof PLAYBOOK_STORE_DATA;
    return (
      <div className="space-y-3">
        <button onClick={() => onSelectCollection(null)} className="text-[9px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Retour aux collections
        </button>
        <div className={cn("bg-gradient-to-r rounded-xl px-4 py-3", col.gradient)}>
          <ColIcon className="h-4 w-4 text-white mb-1" />
          <h3 className="text-sm font-bold text-white">{col.label}</h3>
          <p className="text-[9px] text-white/80 mt-1">{col.description}</p>
          <span className="text-[8px] text-white/60 mt-1 block">{playbooks.length} playbooks</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {playbooks.map(pb => <PlaybookCardV2 key={pb.id} pb={pb} onOpenDetail={onOpenDetail} />)}
        </div>
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
  const installed = PLAYBOOK_STORE_DATA.filter(pb => INSTALLED_PLAYBOOKS.includes(pb.id) && (botCode === "CEOB" || pb.departement === botCode));
  const filtered = searchTerm ? installed.filter(pb => pb.nom.toLowerCase().includes(searchTerm.toLowerCase())) : installed;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-gray-400" /> Mes playbooks installes ({installed.length})</h3>
      </div>
      {installed.length > 3 && (
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Filtrer mes playbooks..." className="w-full text-xs border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
      )}
      {filtered.length === 0 ? (
        <p className="text-[9px] text-gray-400 text-center py-8">Aucun playbook installe — explorez le Store</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(pb => <PlaybookCardV2 key={pb.id} pb={pb} installed onOpenDetail={onOpenDetail} />)}
        </div>
      )}
    </div>
  );
}

// ── Vue EN COURS (executions actives) ──
function PlaybookEnCours({ onOpenDetail }: { onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  if (RUNNING_PLAYBOOKS.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="h-8 w-8 text-gray-200 mb-3" />
        <p className="text-xs text-gray-400 mb-1">Aucun playbook en cours d'execution</p>
        <p className="text-[9px] text-gray-300">Lancez-en un depuis le Store</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {RUNNING_PLAYBOOKS.map(run => {
        const pb = PLAYBOOK_STORE_DATA.find(p => p.id === run.playbookId);
        if (!pb) return null;
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
              {/* Progress bar */}
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
              {/* Action buttons */}
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
  );
}

// ── Vue HISTORIQUE (completes + livrables) ──
function PlaybookHistorique({ onOpenDetail }: { onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  if (COMPLETED_PLAYBOOKS.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-8 w-8 text-gray-200 mb-3" />
        <p className="text-xs text-gray-400 mb-1">Aucun playbook complete</p>
        <p className="text-[9px] text-gray-300">Vos playbooks termines apparaitront ici avec leurs livrables</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {COMPLETED_PLAYBOOKS.map(cp => {
        const pb = PLAYBOOK_STORE_DATA.find(p => p.id === cp.playbookId);
        if (!pb) return null;
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
              {/* Livrables */}
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
              {/* Action buttons */}
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

      {/* Motivation */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl px-4 py-3 text-center">
        <p className="text-[9px] text-purple-700 font-bold">Les meilleurs createurs gagnent 2000-5000$/mois avec leurs playbooks.</p>
        <p className="text-[8px] text-purple-500 mt-1">Bientot disponible</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// BLUEPRINT PLAYBOOKS — Conteneur principal avec sidebar 8 items
// ══════════════════════════════════════════

export function BlueprintPlaybooks({ botCode, headerGradient }: { botCode: string; headerGradient: string }) {
  const [activeView, setActiveView] = useState<PlaybookStoreView>("decouvrir");
  const [selectedPlaybook, setSelectedPlaybook] = useState<typeof PLAYBOOK_STORE_DATA[0] | null>(null);
  const [expandCategories, setExpandCategories] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const handleNavigate = (view: PlaybookStoreView, extra?: { dept?: string; collection?: string }) => {
    setSelectedPlaybook(null);
    if (extra?.dept) { setSelectedCategorie(extra.dept); setActiveView("categorie"); }
    else if (extra?.collection) { setSelectedCollection(extra.collection); setActiveView("collections"); }
    else setActiveView(view);
  };

  const handleOpenDetail = (pb: typeof PLAYBOOK_STORE_DATA[0]) => setSelectedPlaybook(pb);
  const handleBack = () => setSelectedPlaybook(null);

  const SIDEBAR_ITEMS: { id: PlaybookStoreView; label: string; icon: React.ElementType; count?: number; dot?: boolean; separator?: boolean }[] = [
    { id: "decouvrir", label: "Decouvrir", icon: Sparkles, count: PLAYBOOK_STORE_DATA.length },
    { id: "categorie", label: "Categories", icon: LayoutGrid },
    { id: "collections", label: "Collections", icon: Bookmark, count: STORE_COLLECTIONS_V2.length },
    { id: "installed", label: "Mes Playbooks", icon: BookOpen, count: INSTALLED_PLAYBOOKS.length, separator: true },
    { id: "encours", label: "En cours", icon: Activity, count: RUNNING_PLAYBOOKS.length, dot: RUNNING_PLAYBOOKS.length > 0 },
    { id: "historique", label: "Historique", icon: Clock, count: COMPLETED_PLAYBOOKS.length },
    { id: "builder", label: "Playbook Builder", icon: Wrench, separator: true },
  ];

  const VIEW_LABELS: Record<PlaybookStoreView, string> = {
    decouvrir: "Decouvrir", categorie: "Categories", collections: "Collections",
    installed: "Mes Playbooks", encours: "En cours", historique: "Historique", builder: "Playbook Builder",
  };

  return (
    <div className="flex gap-3">
      {/* Sidebar TOC */}
      <div className="w-[180px] shrink-0 space-y-0.5">
        {SIDEBAR_ITEMS.map((item, idx) => {
          const isActive = activeView === item.id;
          return (
            <div key={item.id}>
              {item.separator && idx > 0 && <div className="h-px bg-gray-100 mx-2 my-2" />}
              <button
                onClick={() => {
                  if (item.id === "categorie") { setExpandCategories(!expandCategories); if (!expandCategories) setActiveView("categorie"); }
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
                </div>
              </button>
              {/* Expandable categories */}
              {item.id === "categorie" && expandCategories && (
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
            </div>
          );
        })}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header */}
        <div className={cn("bg-gradient-to-r rounded-lg px-4 py-2.5", headerGradient)}>
          <h2 className="text-sm font-bold text-white">Playbook Store{activeView !== "decouvrir" ? ` — ${VIEW_LABELS[activeView]}` : ""}</h2>
        </div>

        {/* Fiche detaillee INLINE (drill-down) */}
        {selectedPlaybook ? (
          <PlaybookFicheDetailInline pb={selectedPlaybook} onBack={handleBack} />
        ) : (
          <>
            {activeView === "decouvrir" && <PlaybookDecouvrir botCode={botCode} onOpenDetail={handleOpenDetail} onNavigate={handleNavigate} />}
            {activeView === "categorie" && selectedCategorie && <PlaybookCategorie botCode={botCode} selectedDept={selectedCategorie} onOpenDetail={handleOpenDetail} onBack={() => setActiveView("decouvrir")} />}
            {activeView === "categorie" && !selectedCategorie && (
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(DEPT_LABELS).map(([code, label]) => {
                  const DIcon = DEPT_ICONS[code] || Building2;
                  const dColor = DEPT_COLORS[code] || DEPT_COLORS.CEOB;
                  const count = PLAYBOOK_STORE_DATA.filter(p => p.departement === code).length;
                  return (
                    <Card key={code} className="p-0 gap-0 overflow-hidden rounded-lg cursor-pointer hover:shadow-md hover:border-blue-200 transition-all" onClick={() => { setSelectedCategorie(code); }}>
                      <div className={cn("h-1.5 bg-gradient-to-r", dColor.gradient)} />
                      <div className="px-3 py-2.5 text-center">
                        <DIcon className={cn("h-4 w-4 mx-auto mb-1", dColor.text)} />
                        <div className="text-[9px] font-bold text-gray-800">{label}</div>
                        <div className="text-[8px] text-gray-400">{count} playbooks</div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
            {activeView === "collections" && <PlaybookCollectionsView selectedCollection={selectedCollection} onOpenDetail={handleOpenDetail} onSelectCollection={setSelectedCollection} onBack={() => setActiveView("decouvrir")} />}
            {activeView === "installed" && <PlaybookMesInstalledView botCode={botCode} onOpenDetail={handleOpenDetail} />}
            {activeView === "encours" && <PlaybookEnCours onOpenDetail={handleOpenDetail} />}
            {activeView === "historique" && <PlaybookHistorique onOpenDetail={handleOpenDetail} />}
            {activeView === "builder" && <PlaybookBuilder />}
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// COMPOSANT PRINCIPAL — Layout DocForge (Sidebar TOC + Contenu)
// ══════════════════════════════════════════

interface BlueprintDepartementProps {
  botCode: string;
  headerGradient: string;
  sizeTier?: SizeTier;
}

type HeaderView = "blueprint" | "ca" | "comites" | "personnel" | "bot";

export function BlueprintDepartement({ botCode, headerGradient, sizeTier: propTier }: BlueprintDepartementProps) {
  const config = getBlueprintConfig(botCode);
  const { dispatch } = useCanvasActions();
  const [tier, setTier] = useState<SizeTier>(propTier || "T2");
  const [phase, setPhase] = useState<Phase>("startup");
  const [headerView, setHeaderView] = useState<HeaderView>("blueprint");
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
  const visibleSections = allVisibleSections.filter(s => !HEADER_SECTION_IDS.includes(s.id));
  const caSection = allVisibleSections.find(s => s.id === "conseil_administration");
  const activeSection = visibleSections.find(s => s.id === activeSub) || visibleSections[0];
  const completionScore = calculateCompletionScore(config, tier, data as Record<string, unknown>);

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

  return (
    <div className="space-y-3">
      {/* HEADER — Titre dynamique selon tab actif + tier/phase/score */}
      <div className={cn("bg-gradient-to-r rounded-xl px-4 py-3 transition-all duration-300", headerGradient)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-white">Blueprint {
                headerView === "blueprint" ? config.deptLabel :
                headerView === "ca" ? "CA" :
                headerView === "comites" ? "Comités" :
                headerView === "personnel" ? "Personnel" :
                headerView === "bot" ? "Brain Team" :
                config.deptLabel
              }</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-white/60">{SIZE_TIERS.find(t => t.id === tier)?.label} · {PHASES.find(p => p.id === phase)?.emoji} {PHASES.find(p => p.id === phase)?.label}</span>
            <span className="text-sm font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">{completionScore}%</span>
          </div>
        </div>
      </div>

      {/* SOUS-TABS — Centrées, texte plus gros pour occuper l'espace */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {([
          { key: "blueprint" as HeaderView, label: "Direction", icon: Zap, show: true },
          { key: "ca" as HeaderView, label: "CA", icon: Users, show: botCode === "CEOB" },
          { key: "comites" as HeaderView, label: "Comités", icon: GitBranch, show: true },
          { key: "personnel" as HeaderView, label: "Personnel", icon: User, show: true },
          { key: "bot" as HeaderView, label: "Brain Team", icon: Bot, show: true },
        ]).filter(t => t.show).map(tab => (
          <button
            key={tab.key}
            onClick={() => setHeaderView(tab.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all cursor-pointer",
              headerView === tab.key
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

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

      {/* LAYOUT DOCFORGE — Sidebar TOC (240px) + Contenu (flex-1) */}
      {headerView === "blueprint" && (
        <div className="flex gap-3">

          {/* SIDEBAR — Table des matieres */}
          <div className="w-[180px] shrink-0 space-y-1">
            <div className="space-y-0.5">
              {visibleSections.map(section => {
                const pct = sectionProgress(section);
                const p = section.pertinence[tier];
                const isActive = activeSub === section.id;
                const isConsolidee = section.id === "vue_consolidee";

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSub(section.id)}
                    className={cn(
                      "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                      isActive
                        ? "bg-blue-50 border border-blue-200 shadow-sm"
                        : "hover:bg-gray-50 border border-transparent",
                      isConsolidee && !isActive && "bg-gradient-to-r from-slate-50 to-blue-50/50 border-blue-100/50"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-700")}>
                        {section.label}
                      </span>
                      {isActive && <ChevronRight className="h-3.5 w-3.5 text-blue-400" />}
                    </div>

                    {section.fields.length > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all",
                              pct === 100 ? "bg-emerald-500" : pct > 0 ? "bg-blue-500" : "bg-gray-200"
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-gray-400 shrink-0 w-6 text-right">{pct}%</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTENU — Section active */}
          <div className="flex-1 min-w-0">
            {activeSection && activeSection.id === "vue_consolidee" && botCode === "CEOB" ? (
              <VueConsolidee tier={tier} />
            ) : activeSection && (
              <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
                {/* Section header gradient */}
                <div className={cn("flex items-center gap-2 px-4 py-3 bg-gradient-to-r", headerGradient)}>
                  {(() => { const Icon = resolveIcon(activeSection.icon); return <Icon className="h-4 w-4 text-white" />; })()}
                  <span className="text-sm font-bold text-white flex-1">{activeSection.label}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); openInAtelier(activeSection); }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer"
                    title="Ouvrir dans l'Atelier (split-screen avec le bot)"
                  >
                    <PenLine className="h-3.5 w-3.5" /> Atelier
                  </button>
                  <PertinenceBadge p={activeSection.pertinence[tier]} />
                </div>

                {/* Bloc d'introduction */}
                <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50/20">
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">{activeSection.description}</p>
                  {activeSection.intro && (
                    <div className="mt-2 flex items-start gap-2 bg-white/60 rounded-lg px-3 py-2 border border-blue-100/50">
                      <Sparkles className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                      <p className="text-[9px] text-gray-500 leading-relaxed">{activeSection.intro}</p>
                    </div>
                  )}
                </div>

                {/* Content — champs + KPIs + save */}
                <div className="p-4">
                  <SubSectionContent
                    section={activeSection}
                    tier={tier}
                    data={data}
                    onFieldChange={handleFieldChange}
                    onSave={handleSave}
                    saving={saving}
                    dirty={dirty}
                  />

                  {/* Données liées — Cross-références inter-départements */}
                  <CrossReferencePanel botCode={botCode} sectionId={activeSection.id} />
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
