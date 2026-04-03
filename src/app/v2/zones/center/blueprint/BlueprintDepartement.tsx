/**
 * BlueprintDepartement.tsx — Composant generique Blueprint Vivant par departement
 * Layout DocForge: Sidebar Table des Matieres (~25%) + Zone Contenu (~75%)
 * Source: blueprint-config.ts (12 departements x ~97 sous-sections)
 *
 * Utilise dans DepartmentTourDeControle.tsx pour le tab "Blueprint" de TOUS les bots.
 * CEOB = le plus complet (16 sections + Vue d'ensemble des 11 autres departements)
 */

import { useState, useEffect, useCallback } from "react";
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

// ── Blueprint Personnel — Objectifs et profil du dirigeant humain ──

const PERSONAL_SECTIONS: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; fields: { id: string; label: string }[] }[] = [
  {
    id: "vue_consolidee_perso",
    label: "Vue d'ensemble",
    icon: Layers,
    fields: [],
  },
  {
    id: "profil_dirigeant",
    label: "Profil du dirigeant",
    icon: User,
    fields: [
      { id: "nom_complet", label: "Nom complet" },
      { id: "titre_poste", label: "Titre / Poste" },
      { id: "annees_experience", label: "Années d'expérience" },
      { id: "formation", label: "Formation académique" },
      { id: "forces_principales", label: "Forces principales (top 3)" },
      { id: "zones_developpement", label: "Zones de développement" },
    ],
  },
  {
    id: "vision_personnelle",
    label: "Vision personnelle",
    icon: Compass,
    fields: [
      { id: "mission_personnelle", label: "Ma mission en tant que dirigeant" },
      { id: "valeurs_personnelles", label: "Mes 3 valeurs non-négociables" },
      { id: "legacy", label: "L'héritage que je veux laisser" },
      { id: "style_leadership", label: "Mon style de leadership" },
    ],
  },
  {
    id: "objectifs_12mois",
    label: "Objectifs 12 mois",
    icon: Target,
    fields: [
      { id: "obj_financier", label: "Objectif financier personnel" },
      { id: "obj_croissance", label: "Objectif de croissance entreprise" },
      { id: "obj_equipe", label: "Objectif d'équipe (recrutement, culture)" },
      { id: "obj_innovation", label: "Objectif innovation / R&D" },
      { id: "obj_reseau", label: "Objectif réseau / partenariats" },
      { id: "obj_personnel", label: "Objectif personnel (santé, famille)" },
    ],
  },
  {
    id: "performance",
    label: "Performance",
    icon: BarChart3,
    fields: [
      { id: "kpi_principal", label: "KPI principal (chiffre clé à atteindre)" },
      { id: "cible_ca", label: "Cible de CA / revenus" },
      { id: "projets_livres", label: "Projets livrés ce trimestre" },
      { id: "satisfaction_equipe", label: "Score satisfaction équipe" },
      { id: "decisions_prises", label: "Décisions stratégiques prises ce mois" },
      { id: "blocages_resolus", label: "Blocages résolus" },
    ],
  },
  {
    id: "developpement_competences",
    label: "Développement & compétences",
    icon: TrendingUp,
    fields: [
      { id: "competences_a_acquerir", label: "Compétences à acquérir cette année" },
      { id: "formations_planifiees", label: "Formations / certifications planifiées" },
      { id: "mentorat", label: "Mentorat (mentors actuels ou recherchés)" },
      { id: "lectures_ressources", label: "Lectures / ressources clés" },
    ],
  },
  {
    id: "equilibre",
    label: "Équilibre & bien-être",
    icon: Heart,
    fields: [
      { id: "heures_semaine", label: "Heures de travail / semaine (cible)" },
      { id: "delegation", label: "Ce que je dois déléguer" },
      { id: "non_negociable", label: "Mon temps non-négociable (famille, santé)" },
      { id: "indicateurs_bienetre", label: "Mes indicateurs de bien-être" },
    ],
  },
  {
    id: "succession_mentorat",
    label: "Succession & mentorat",
    icon: Users,
    fields: [
      { id: "plan_succession", label: "Plan de succession (qui peut me remplacer?)" },
      { id: "personnes_cles", label: "Personnes clés à développer" },
      { id: "transfert_connaissances", label: "Connaissances critiques à documenter" },
      { id: "timeline_transition", label: "Horizon de transition (3-5-10 ans)" },
    ],
  },
];

// VITAA Personnel — les scores personnels de l'humain
const VITAA_PERSONNEL = [
  { letter: "V", label: "Vente (réseau, closing)", score: 72, avg: 50, color: "bg-blue-500" },
  { letter: "I", label: "Idée (créativité, vision)", score: 85, avg: 50, color: "bg-purple-500" },
  { letter: "T", label: "Temps (productivité, focus)", score: 38, avg: 50, color: "bg-emerald-500" },
  { letter: "A", label: "Argent (gestion, levier)", score: 61, avg: 50, color: "bg-amber-500" },
  { letter: "A", label: "Actif (assets, IP, équipe)", score: 45, avg: 50, color: "bg-red-500" },
];

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

function VueConsolideePersonnel() {
  const sections = PERSONAL_SECTIONS.filter(s => s.id !== "vue_consolidee_perso");
  return (
    <div className="space-y-3">
      <VitaaTable data={VITAA_PERSONNEL} title="VITAA Personnel — Toi vs Secteur" />
      <div className="grid grid-cols-2 gap-2">
        {sections.map(s => {
          const Icon = s.icon;
          const filled = 0; // mock — pas encore de données
          return (
            <Card key={s.id} className="p-0 overflow-hidden rounded-xl shadow-sm">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-600 to-slate-500">
                <Icon className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-bold text-white flex-1">{s.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 text-white">{filled}/{s.fields.length}</span>
              </div>
              <div className="px-3 py-2 space-y-1">
                {s.fields.slice(0, 3).map(f => (
                  <div key={f.id} className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-500 truncate flex-1">{f.label}</span>
                    <span className="text-[9px] text-gray-300 italic ml-2">—</span>
                  </div>
                ))}
                {s.fields.length > 3 && <span className="text-[9px] text-gray-400">+{s.fields.length - 3} champs...</span>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function BlueprintPersonnel({ botCode, headerGradient }: { botCode: string; headerGradient: string }) {
  const [activePersonalSection, setActivePersonalSection] = useState(PERSONAL_SECTIONS[0].id);
  const section = PERSONAL_SECTIONS.find(s => s.id === activePersonalSection) || PERSONAL_SECTIONS[0];

  return (
    <div className="flex gap-3">
      {/* Sidebar — sections personnelles */}
      <div className="w-[180px] shrink-0 space-y-0.5">
        {PERSONAL_SECTIONS.map(s => {
          const isActive = activePersonalSection === s.id;
          const isConsolidee = s.id === "vue_consolidee_perso";
          return (
            <button
              key={s.id}
              onClick={() => setActivePersonalSection(s.id)}
              className={cn(
                "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent",
                isConsolidee && !isActive && "bg-gradient-to-r from-slate-50 to-blue-50/50 border-blue-100/50"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className={cn("text-[9px] font-bold flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-700")}>
                  {s.label}
                </span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-blue-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Contenu — section active */}
      <div className="flex-1 min-w-0">
        {activePersonalSection === "vue_consolidee_perso" ? (
          <VueConsolideePersonnel />
        ) : (
          <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
            <div className={cn("flex items-center gap-2 px-4 py-3 bg-gradient-to-r", headerGradient)}>
              {(() => { const Icon = section.icon; return <Icon className="h-4 w-4 text-white" />; })()}
              <span className="text-sm font-bold text-white flex-1">{section.label}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">Personnel</span>
            </div>
            <div className="p-4 space-y-3">
              {section.fields.map(f => (
                <div key={f.id}>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{f.label}</label>
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 min-h-[60px]"
                    rows={2}
                    placeholder={`Décrivez: ${f.label.toLowerCase()}...`}
                  />
                </div>
              ))}
            </div>
          </Card>
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
  CEOB: { style: "Directif et visionnaire", forces: ["Vision stratégique", "Prise de décision", "Leadership", "Gestion de crise"], approche: "Part du résultat client et remonte vers la stratégie.", scores: { strategique: 95, analytique: 75, creatif: 70, operationnel: 60, relationnel: 80 } },
  CTOB: { style: "Innovateur et méthodique", forces: ["Architecture technique", "Innovation", "Résolution complexe", "Prototypage"], approche: "Premiers principes, challenge les contraintes.", scores: { strategique: 70, analytique: 90, creatif: 95, operationnel: 80, relationnel: 55 } },
  CFOB: { style: "Prudent et discipliné", forces: ["Analyse financière", "Gestion du risque", "Valorisation", "Budget"], approche: "Valeur intrinsèque avant prix apparent.", scores: { strategique: 80, analytique: 95, creatif: 40, operationnel: 70, relationnel: 50 } },
  CMOB: { style: "Créatif et empathique", forces: ["Positionnement", "Storytelling", "Audience", "Innovation marketing"], approche: "Simplifie le message, connexion émotionnelle.", scores: { strategique: 65, analytique: 60, creatif: 95, operationnel: 50, relationnel: 90 } },
  CSOB: { style: "Stratège et incisif", forces: ["Analyse concurrentielle", "Planification", "Anticipation", "Marché"], approche: "Analyse les forces avant toute recommandation.", scores: { strategique: 95, analytique: 85, creatif: 60, operationnel: 50, relationnel: 45 } },
  COOB: { style: "Méthodique et fiable", forces: ["Processus", "Qualité", "Logistique", "Amélioration continue"], approche: "Mesure tout, élimine le gaspillage.", scores: { strategique: 60, analytique: 80, creatif: 40, operationnel: 95, relationnel: 65 } },
};

const BOT_CAPACITES_BP: Record<string, { equivHumain: string; coutHumain: string; tachesCount: number; heuresMois: string }> = {
  CEOB: { equivHumain: "CEO conseil", coutHumain: "100-200K$", tachesCount: 15, heuresMois: "80-120h" },
  CTOB: { equivHumain: "CTO fractionnaire", coutHumain: "150-300K$", tachesCount: 16, heuresMois: "120-180h" },
  CFOB: { equivHumain: "CFO fractionnaire", coutHumain: "150-250K$", tachesCount: 18, heuresMois: "100-160h" },
  CMOB: { equivHumain: "Directeur marketing", coutHumain: "120-200K$", tachesCount: 14, heuresMois: "100-160h" },
  CSOB: { equivHumain: "Consultant stratégie", coutHumain: "120-200K$", tachesCount: 12, heuresMois: "80-120h" },
  COOB: { equivHumain: "Directeur opérations", coutHumain: "120-200K$", tachesCount: 15, heuresMois: "120-200h" },
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
    { name: "Google Calendar", status: "config", icon: "CAL", color: "bg-amber-500" },
    { name: "HubSpot CRM", status: "off", icon: "CRM", color: "bg-gray-400" },
    { name: "Slack", status: "off", icon: "MSG", color: "bg-gray-400" },
  ],
  CTOB: [
    { name: "Gemini Pro 2.0", status: "active", icon: "LLM", color: "bg-blue-500" },
    { name: "GitHub Copilot", status: "active", icon: "DEV", color: "bg-gray-800" },
    { name: "ElevenLabs (Daniel)", status: "active", icon: "TTS", color: "bg-emerald-500" },
    { name: "Sentry", status: "config", icon: "MON", color: "bg-red-500" },
    { name: "AWS CloudWatch", status: "off", icon: "INF", color: "bg-gray-400" },
  ],
};

const VITAA_BOT: Record<string, { letter: string; label: string; score: number; avg: number; color: string }[]> = {
  CEOB: [
    { letter: "V", label: "Vente (leads qualifiés)", score: 68, avg: 50, color: "bg-blue-500" },
    { letter: "I", label: "Idée (insights générés)", score: 82, avg: 50, color: "bg-purple-500" },
    { letter: "T", label: "Temps (tâches/heure)", score: 91, avg: 50, color: "bg-emerald-500" },
    { letter: "A", label: "Argent (ROI généré)", score: 74, avg: 50, color: "bg-amber-500" },
    { letter: "A", label: "Actif (docs produits)", score: 56, avg: 50, color: "bg-red-500" },
  ],
};

const BOT_SECTION_META: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "vue_consolidee_bot", label: "Vue d'ensemble", icon: Layers },
  { id: "trisociation", label: "Trisociation & Ghosts", icon: Zap },
  { id: "skills_profil", label: "Skills & profil cognitif", icon: Star },
  { id: "apis_connexions", label: "APIs & connexions", icon: Cpu },
  { id: "objectifs_missions", label: "Objectifs & missions", icon: Target },
  { id: "performance_bot", label: "Performance", icon: BarChart3 },
  { id: "reglages_bot", label: "Réglages", icon: Settings },
];

// ── Section: Trisociation (3 Ghosts interactifs) ──
function BotTrisociationSection({ botCode }: { botCode: string }) {
  const ghosts = BOT_GHOSTS[botCode] || BOT_GHOSTS.CEOB;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {ghosts.map((ghostName, i) => {
          const arch = GHOST_ARCHETYPES[ghostName];
          if (!arch) return null;
          return (
            <div key={i} className={cn("border rounded-xl overflow-hidden shadow-sm", SLOT_BG[i])}>
              <div className={cn("bg-gradient-to-r px-3 py-2 flex items-center gap-2", SLOT_COLORS[i])}>
                <span className="text-base">{arch.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold text-white/70 uppercase tracking-wider">{SLOT_LABELS_BP[i]}</span>
                  <div className="text-xs font-bold text-white truncate">{arch.nom}</div>
                </div>
              </div>
              <div className="p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-800">{ghostName}</span>
                  <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full border font-medium", SLOT_BG[i], SLOT_TEXT_C[i])}>{arch.categorie}</span>
                </div>
                <p className="text-[9px] text-gray-600 italic leading-snug">"{arch.signature}"</p>
              </div>
            </div>
          );
        })}
      </div>
      <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
        <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-2.5 flex items-center gap-2">
          <Zap className="h-4 w-4 text-white" />
          <span className="text-xs font-bold text-white flex-1">Catalogue des Teintures Cognitives</span>
          <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full">{Object.keys(GHOST_ARCHETYPES).length} archétypes</span>
        </div>
        <div className="p-3 grid grid-cols-2 gap-1.5 max-h-[300px] overflow-y-auto">
          {Object.entries(GHOST_ARCHETYPES).map(([name, arch]) => {
            const isActive = (BOT_GHOSTS[botCode] || []).includes(name);
            return (
              <div key={name} className={cn(
                "flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-all cursor-pointer",
                isActive ? "bg-violet-50 border-violet-200 shadow-sm" : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              )}>
                <span className="text-lg shrink-0">{arch.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-bold text-gray-800 truncate">{name}</div>
                  <div className="text-[9px] text-gray-500 truncate">{arch.nom}</div>
                </div>
                {isActive && <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── Section: Skills & Profil Cognitif ──
function BotSkillsSection({ botCode }: { botCode: string }) {
  const profile = BOT_PROFILES_BP[botCode] || BOT_PROFILES_BP.CEOB;
  const scoreEntries = Object.entries(profile.scores);
  const SCORE_COLORS: Record<string, string> = { strategique: "bg-blue-500", analytique: "bg-emerald-500", creatif: "bg-purple-500", operationnel: "bg-orange-500", relationnel: "bg-pink-500" };
  const SCORE_LABELS: Record<string, string> = { strategique: "Stratégique", analytique: "Analytique", creatif: "Créatif", operationnel: "Opérationnel", relationnel: "Relationnel" };
  return (
    <div className="space-y-3">
      <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
        <div className="bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2.5 flex items-center gap-2">
          <Star className="h-4 w-4 text-white" />
          <span className="text-xs font-bold text-white flex-1">Profil Psychométrique</span>
          <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full">{profile.style}</span>
        </div>
        <div className="p-4 space-y-3">
          {scoreEntries.map(([key, val]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-[9px] font-medium text-gray-600 w-24 text-right">{SCORE_LABELS[key] || key}</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden relative">
                <div className={cn("h-full rounded-full transition-all", SCORE_COLORS[key] || "bg-gray-400")} style={{ width: `${val}%` }} />
                <span className="absolute inset-y-0 right-2 flex items-center text-[8px] font-bold text-gray-500">{val}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
        <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-2.5 flex items-center gap-2">
          <Shield className="h-4 w-4 text-white" />
          <span className="text-xs font-bold text-white">Forces Principales</span>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">
          {profile.forces.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-white rounded-lg px-3 py-2.5 border border-gray-100">
              <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                <Zap className="h-3.5 w-3.5 text-violet-600" />
              </div>
              <span className="text-[9px] font-medium text-gray-800">{f}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-white" />
          <span className="text-xs font-bold text-white">Style de Communication</span>
        </div>
        <div className="p-3">
          <p className="text-xs text-gray-700 leading-relaxed bg-indigo-50/50 rounded-lg p-3 border border-indigo-100">{profile.approche}</p>
        </div>
      </Card>
    </div>
  );
}

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
      <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", a.status === "active" ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : a.status === "config" ? "bg-amber-400" : "bg-gray-300")} />
    </div>
  );
  return (
    <div className="space-y-3">
      <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 flex items-center gap-2">
          <Activity className="h-4 w-4 text-white" />
          <span className="text-xs font-bold text-white flex-1">Connexions Actives</span>
          <span className="text-[9px] bg-white/25 text-white px-2 py-0.5 rounded-full font-bold">{active.length} live</span>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">{active.map(renderApi)}</div>
      </Card>
      {rest.length > 0 && (
        <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
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

// ── Section: Performance Bot ──
function BotPerformanceSection({ botCode }: { botCode: string }) {
  const cap = BOT_CAPACITES_BP[botCode] || BOT_CAPACITES_BP.CEOB;
  const stats = [
    { label: "Messages traités", value: "1,247", delta: "+18% ce mois", icon: MessageCircle, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Tâches complétées", value: "89", delta: "12 en cours", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Temps réponse moy.", value: "2.3s", delta: "-0.4s vs mois dernier", icon: Activity, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Coût mensuel API", value: "47$", delta: cap.coutHumain + " si humain", icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-0 overflow-hidden rounded-xl shadow-sm">
              <div className="px-3 py-3 flex items-start gap-3">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", s.bg)}>
                  <Icon className={cn("h-4 w-4", s.color)} />
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-medium uppercase tracking-wider">{s.label}</div>
                  <div className="text-xl font-bold text-gray-800">{s.value}</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">{s.delta}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-2.5 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-white" />
          <span className="text-xs font-bold text-white flex-1">ROI — Équivalent Humain</span>
        </div>
        <div className="p-3 flex items-center gap-4">
          <div className="flex-1 text-center">
            <div className="text-[9px] text-gray-500 uppercase font-bold">Agent IA</div>
            <div className="text-lg font-bold text-emerald-600">47$/mois</div>
            <div className="text-[9px] text-gray-400">{cap.tachesCount} tâches · {cap.heuresMois}</div>
          </div>
          <div className="text-2xl font-bold text-gray-300">vs</div>
          <div className="flex-1 text-center">
            <div className="text-[9px] text-gray-500 uppercase font-bold">{cap.equivHumain}</div>
            <div className="text-lg font-bold text-red-500">{cap.coutHumain}/an</div>
            <div className="text-[9px] text-gray-400">Même scope de travail</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Vue Consolidée Bot ──
function VueConsolideeBot({ botCode }: { botCode: string }) {
  const vitaa = VITAA_BOT[botCode] || VITAA_BOT.CEOB;
  const ghosts = BOT_GHOSTS[botCode] || BOT_GHOSTS.CEOB;
  const profile = BOT_PROFILES_BP[botCode] || BOT_PROFILES_BP.CEOB;
  const apis = BOT_APIS[botCode] || BOT_APIS.CEOB;
  const activeApis = apis.filter(a => a.status === "active");
  return (
    <div className="space-y-3">
      <VitaaTable data={vitaa} title="VITAA Agent IA — Performance vs Benchmark" />
      <div className="grid grid-cols-3 gap-2">
        {ghosts.map((g, i) => {
          const arch = GHOST_ARCHETYPES[g];
          if (!arch) return null;
          return (
            <div key={i} className={cn("rounded-xl overflow-hidden border shadow-sm", SLOT_BG[i])}>
              <div className={cn("bg-gradient-to-r px-2.5 py-1.5 flex items-center gap-1.5", SLOT_COLORS[i])}>
                <span className="text-sm">{arch.emoji}</span>
                <span className="text-[9px] font-bold text-white uppercase">{SLOT_LABELS_BP[i]}</span>
              </div>
              <div className="px-2.5 py-1.5">
                <div className="text-[9px] font-bold text-gray-800">{g}</div>
                <div className="text-[9px] text-gray-500">{arch.nom}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-r from-violet-600 to-purple-500 px-3 py-2 flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-bold text-white">Skills</span>
            <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full ml-auto">{profile.style}</span>
          </div>
          <div className="p-2.5 space-y-1.5">
            {Object.entries(profile.scores).slice(0, 5).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <span className="text-[9px] text-gray-500 w-16 text-right capitalize">{k}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-violet-400" style={{ width: `${v}%` }} />
                </div>
                <span className="text-[9px] font-bold text-gray-600 w-6">{v}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-2 flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-bold text-white">APIs</span>
            <span className="text-[9px] bg-white/25 text-white px-1.5 py-0.5 rounded-full ml-auto">{activeApis.length} live</span>
          </div>
          <div className="p-2.5 space-y-1">
            {activeApis.slice(0, 5).map(a => (
              <div key={a.name} className="flex items-center gap-2">
                <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[7px] font-bold shrink-0", a.color)}>{a.icon}</div>
                <span className="text-[9px] text-gray-700 flex-1 truncate">{a.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            ))}
            {activeApis.length > 5 && <span className="text-[9px] text-gray-400">+{activeApis.length - 5} autres...</span>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function BlueprintBot({ botCode, headerGradient }: { botCode: string; headerGradient: string }) {
  const [activeBotSection, setActiveBotSection] = useState(BOT_SECTION_META[0].id);
  return (
    <div className="flex gap-3">
      <div className="w-[180px] shrink-0 space-y-0.5">
        {BOT_SECTION_META.map(s => {
          const isActive = activeBotSection === s.id;
          const isConsolidee = s.id === "vue_consolidee_bot";
          return (
            <button key={s.id} onClick={() => setActiveBotSection(s.id)} className={cn(
              "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
              isActive ? "bg-violet-50 border border-violet-200 shadow-sm" : "hover:bg-gray-50 border border-transparent",
              isConsolidee && !isActive && "bg-gradient-to-r from-violet-50/50 to-blue-50/50 border-violet-100/50"
            )}>
              <div className="flex items-center gap-1.5">
                <span className={cn("text-[9px] font-bold flex-1 leading-tight", isActive ? "text-violet-700" : "text-gray-700")}>{s.label}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-violet-400" />}
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex-1 min-w-0">
        {activeBotSection === "vue_consolidee_bot" && <VueConsolideeBot botCode={botCode} />}
        {activeBotSection === "trisociation" && <BotTrisociationSection botCode={botCode} />}
        {activeBotSection === "skills_profil" && <BotSkillsSection botCode={botCode} />}
        {activeBotSection === "apis_connexions" && <BotApisSection botCode={botCode} />}
        {activeBotSection === "performance_bot" && <BotPerformanceSection botCode={botCode} />}
        {activeBotSection === "objectifs_missions" && (
          <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
            <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white flex-1">Objectifs & Missions</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">Agent IA</span>
            </div>
            <div className="p-4 space-y-3">
              {["Mission principale de l'agent", "Objectif ce trimestre", "Tâches actives assignées", "Chantiers en responsabilité", "KPI cible à atteindre"].map(f => (
                <div key={f}>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{f}</label>
                  <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 min-h-[60px]" rows={2} placeholder={`${f}...`} />
                </div>
              ))}
            </div>
          </Card>
        )}
        {activeBotSection === "reglages_bot" && (
          <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-3 flex items-center gap-2">
              <Settings className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white flex-1">Réglages</span>
            </div>
            <div className="p-4 space-y-3">
              {["Température (créativité 0.0 → 1.0)", "Max tokens par réponse", "Mode décision par défaut", "Langue principale", "Tonalité (formel / conversationnel)", "Auto-escalade vers le CEO (seuil)"].map(f => (
                <div key={f}>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{f}</label>
                  <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 min-h-[60px]" rows={2} placeholder={`${f}...`} />
                </div>
              ))}
            </div>
          </Card>
        )}
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

      <div className="grid grid-cols-2 gap-2">
        {sorted.map(dept => {
          const info = OTHER_BOTS.find(b => b.code === dept.code)!;
          const isExpanded = expandedDept === dept.code;
          const filledFields = dept.keyFields.filter(kf => kf.value);

          return (
            <Card
              key={dept.code}
              className={cn(
                "p-0 overflow-hidden rounded-xl shadow-sm transition-all cursor-pointer hover:shadow-md",
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

function ConseilAdminManager({ headerGradient, data, onFieldChange, onSave, saving, dirty }: {
  headerGradient: string;
  data: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
}) {
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

  return (
    <div className="space-y-3">
      <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
        <div className={cn("flex items-center gap-2 px-4 py-3 bg-gradient-to-r", headerGradient)}>
          <Users className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white flex-1">Conseil d'administration</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">{ca.membres.length} membre{ca.membres.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50/20 border-b border-gray-100">
          <p className="text-xs text-gray-600 leading-relaxed">
            Le conseil d'administration est l'organe de gouvernance suprême de votre organisation. Les membres du CA ont accès à la plateforme pour suivre les résultats, participer aux réunions (Conférence AI) et recevoir les minutes automatiquement.
          </p>
        </div>
      </Card>

      {/* KPIs rapides */}
      {ca.membres.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
              <Users className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Membres</span>
            </div>
            <div className="px-3 py-2">
              <div className="text-2xl font-bold text-blue-600">{ca.membres.length}</div>
              <div className="text-[9px] text-gray-400">Total CA</div>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <Shield className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Indépendants</span>
            </div>
            <div className="px-3 py-2">
              <div className="text-2xl font-bold text-emerald-600">{nbIndependants}</div>
              <div className="text-[9px] text-gray-400">{ca.membres.length > 0 ? Math.round((nbIndependants / ca.membres.length) * 100) : 0}% du CA</div>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
              <UserPlus className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Externes</span>
            </div>
            <div className="px-3 py-2">
              <div className="text-2xl font-bold text-amber-600">{nbExternes}</div>
              <div className="text-[9px] text-gray-400">Invités plateforme</div>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden">
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
      )}

      {/* Configuration + Membres */}
      <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
        <div className={cn("flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-700 to-gray-600")}>
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

      {/* Membres du CA */}
      <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
        <div className={cn("flex items-center justify-between px-4 py-2.5 bg-gradient-to-r", headerGradient)}>
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-bold text-white">Membres du conseil ({ca.membres.length})</span>
          </div>
          <button
            onClick={addMembre}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" /> Ajouter un membre
          </button>
        </div>

        <div className="p-4">
          {ca.membres.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
              <Users className="h-6 w-6 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400 mb-3">Aucun membre au conseil d'administration</p>
              <button
                onClick={addMembre}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all mx-auto"
              >
                <UserPlus className="h-3.5 w-3.5" /> Ajouter le premier membre
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {ca.membres.map((m, idx) => (
                <div key={idx} className={cn(
                  "rounded-lg border px-3 py-3 group transition-all",
                  m.type === "externe" ? "border-amber-200 bg-amber-50/30" : "border-gray-200 bg-white"
                )}>
                  <div className="grid grid-cols-6 gap-2 items-center">
                    <div>
                      <label className="text-[9px] text-gray-400 block mb-0.5">Nom</label>
                      <input
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                        value={m.nom} onChange={e => updateMembre(idx, { nom: e.target.value })} placeholder="Nom complet"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 block mb-0.5">Rôle au CA</label>
                      <input
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                        value={m.titre} onChange={e => updateMembre(idx, { titre: e.target.value })} placeholder="Président, Secrétaire..."
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 block mb-0.5">Expertise</label>
                      <input
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                        value={m.expertise} onChange={e => updateMembre(idx, { expertise: e.target.value })} placeholder="Finance, Juridique..."
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 block mb-0.5">Courriel</label>
                      <input
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                        value={m.courriel} onChange={e => updateMembre(idx, { courriel: e.target.value })} placeholder="courriel@..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[9px] text-gray-400 block mb-0.5">Type</label>
                        <select
                          className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                          value={m.type} onChange={e => updateMembre(idx, { type: e.target.value as "interne" | "externe" })}
                        >
                          <option value="interne">Interne</option>
                          <option value="externe">Externe</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-[9px] text-gray-400 block mb-0.5">Indépendant</label>
                        <select
                          className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                          value={m.independant ? "oui" : "non"} onChange={e => updateMembre(idx, { independant: e.target.value === "oui" })}
                        >
                          <option value="oui">Oui</option>
                          <option value="non">Non</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-[9px] text-gray-400 block mb-0.5">Membre depuis</label>
                        <input
                          type="date"
                          className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                          value={m.depuis} onChange={e => updateMembre(idx, { depuis: e.target.value })}
                        />
                      </div>
                      <button
                        onClick={() => removeMembre(idx)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all cursor-pointer shrink-0 pb-1"
                      >
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
                Les membres externes recevront une invitation par courriel pour accéder à la plateforme GhostX en tant qu'administrateur invité. Ils pourront consulter les résultats de l'organisation, participer aux Conférences AI du CA et recevoir les minutes automatiquement.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Save */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[9px] text-gray-400">{dirty ? "Modifications non sauvegardées" : "À jour"}</span>
        <button
          onClick={onSave}
          disabled={saving || !dirty}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all",
            dirty ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
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

  const active = comites.find(c => c.id === activeComite);
  const inputBase = "w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-white";

  return (
    <div className="space-y-3">
      <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
        <div className={cn("flex items-center gap-2 px-4 py-3 bg-gradient-to-r", headerGradient)}>
          <Briefcase className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white flex-1">Comités — {deptLabel}</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">{comites.length} comité{comites.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50/20 border-b border-gray-100">
          <p className="text-xs text-gray-600 leading-relaxed">
            Créez et gérez les comités liés au département {deptLabel}. Chaque comité peut avoir des participants internes (employés) et externes (invités), avec la possibilité de lancer des Conférences AI et de distribuer les minutes automatiquement.
          </p>
        </div>
      </Card>

      <div className="flex gap-3">
        {/* Sidebar — liste des comités */}
        <div className="w-[180px] shrink-0 space-y-1">
          {comites.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveComite(c.id)}
              className={cn(
                "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer group",
                activeComite === c.id
                  ? "bg-blue-50 border border-blue-200 shadow-sm"
                  : "hover:bg-gray-50 border border-transparent"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className={cn("text-[9px] font-bold flex-1 leading-tight truncate", activeComite === c.id ? "text-blue-700" : "text-gray-700")}>
                  {c.nom || "Nouveau comité"}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); removeComite(c.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all cursor-pointer"
                >
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

        </div>

        {/* Contenu — comité actif */}
        <div className="flex-1 min-w-0 space-y-3">
          {active ? (
            <>
              {/* KPIs du comité */}
              <div className="grid grid-cols-4 gap-3">
                <Card className="p-0 overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
                    <Users className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white">Participants</span>
                  </div>
                  <div className="px-3 py-2">
                    <div className="text-2xl font-bold text-blue-600">{active.membres.length}</div>
                    <div className="text-[9px] text-gray-400">{active.membres.filter(m => m.type === "interne").length} int. / {active.membres.filter(m => m.type === "externe").length} ext.</div>
                  </div>
                </Card>
                <Card className="p-0 overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
                    <Briefcase className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white">Fréquence</span>
                  </div>
                  <div className="px-3 py-2">
                    <div className="text-2xl font-bold text-violet-600">{active.frequence || "—"}</div>
                    <div className="text-[9px] text-gray-400">{active.format}</div>
                  </div>
                </Card>
                <Card className="p-0 overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
                    <UserPlus className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white">Externes</span>
                  </div>
                  <div className="px-3 py-2">
                    <div className="text-2xl font-bold text-amber-600">{active.membres.filter(m => m.type === "externe").length}</div>
                    <div className="text-[9px] text-gray-400">Invités plateforme</div>
                  </div>
                </Card>
                <Card className="p-0 overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    <span className="text-sm font-bold text-white">Statut</span>
                  </div>
                  <div className="px-3 py-2">
                    <div className="text-2xl font-bold text-emerald-600">{active.membres.length > 0 ? "Actif" : "—"}</div>
                    <div className="text-[9px] text-gray-400">{active.nom || "Non nommé"}</div>
                  </div>
                </Card>
              </div>

              {/* Configuration du comité */}
              <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
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

              {/* Membres du comité */}
              <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
                <div className={cn("flex items-center justify-between px-4 py-2.5 bg-gradient-to-r", headerGradient)}>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-bold text-white">Participants ({active.membres.length})</span>
                  </div>
                  <button
                    onClick={() => addMembre(active.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Ajouter un participant
                  </button>
                </div>

                <div className="p-4">
                  {active.membres.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                      <Users className="h-6 w-6 text-gray-200 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 mb-3">Aucun participant dans ce comité</p>
                      <button
                        onClick={() => addMembre(active.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all mx-auto"
                      >
                        <UserPlus className="h-3.5 w-3.5" /> Ajouter le premier participant
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {active.membres.map((m, idx) => (
                        <div key={idx} className={cn(
                          "rounded-lg border px-3 py-3 group transition-all",
                          m.type === "externe" ? "border-amber-200 bg-amber-50/30" : "border-gray-200 bg-white"
                        )}>
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
                              <button
                                onClick={() => removeMembre(active.id, idx)}
                                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all cursor-pointer shrink-0 pb-1"
                              >
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

              {/* Save */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[9px] text-gray-400">{dirty ? "Modifications non sauvegardées" : "À jour"}</span>
                <button
                  onClick={onSave}
                  disabled={saving || !dirty}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all",
                    dirty ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-8 w-8 text-gray-200 mb-3" />
              <p className="text-xs text-gray-400 mb-2">Aucun comité créé pour {deptLabel}</p>
              <button
                onClick={addComite}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all"
              >
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
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
            <FileText className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Documents</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-blue-600">{totalDocs}</div>
            <div className="text-[9px] text-gray-500">{totalActifs} actifs · {totalDocs - totalActifs} en cours</div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-500">
            <Layers className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Templates</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-purple-600">{totalTemplates}</div>
            <div className="text-[9px] text-gray-500">12 departements couverts</div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
            <Activity className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Sante Doc.</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-emerald-600">{santeScore}%</div>
            <div className="text-[9px] text-gray-500">{totalCritiques} critiques a traiter</div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
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
                <div className={cn("text-lg font-bold", asset.valueColor)}>{count}</div>
                <div className="text-[9px] font-bold text-gray-700">{asset.label}</div>
                <div className="text-[7px] text-gray-400 leading-tight">{asset.desc}</div>
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

function BlueprintDataRoom({ botCode, headerGradient }: { botCode: string; headerGradient: string }) {
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
              <span className={cn("text-[9px] font-bold flex-1", activeFolder === "_consolidee" ? "text-blue-700" : "text-gray-700")}>Vue d'ensemble</span>
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
                  <span className={cn("text-[9px] font-bold flex-1 leading-tight", isDeptActive ? "text-blue-700" : "text-gray-700")}>
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
                      <span className={cn("text-[9px] font-medium flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-600")}>
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
                <span className={cn("text-[9px] font-bold flex-1", isActive ? "text-blue-700" : "text-gray-700")}>{ts.label}</span>
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
            <span className={cn("text-[9px] font-bold flex-1", activeFolder === "_templates" ? "text-blue-700" : "text-gray-700")}>Templates</span>
            <span className="text-[9px] text-gray-400">{templates.length}</span>
          </div>
        </button>
      </div>

      {/* Contenu — full height */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* ── Breadcrumb (SharePoint style) ── */}
        {(isFolderView || activeFolder === "_templates" || activeFolder === "chantiers" || TRANSVERSAL_SECTIONS.some(ts => ts.id === activeFolder)) && (
          <div className="flex items-center gap-1 text-[9px] text-gray-400 px-1">
            <button onClick={() => { if (botCode === "CEOB") { setActiveDept("CEOB"); setActiveFolder("_consolidee"); } }} className="hover:text-blue-600 cursor-pointer font-medium">Data Room</button>
            <ChevronRight className="h-3.5 w-3.5" />
            {activeDept && activeDept !== "CEOB" && isFolderView && (<>
              <span className="text-gray-500 font-medium">{DEPT_LABELS[activeDept] || activeDept}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </>)}
            <span className="text-gray-700 font-bold">
              {activeFolder === "_templates" ? "Templates" : activeFolder === "chantiers" ? "Chantiers (REAI)" : TRANSVERSAL_SECTIONS.find(ts => ts.id === activeFolder)?.label || activeSection?.label || ""}
            </span>
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

// Collections thematiques pour le Store
const STORE_COLLECTIONS: { id: string; label: string; icon: React.ElementType; playbookIds: string[] }[] = [
  { id: "essentiels", label: "Les Essentiels pour Demarrer", icon: Star, playbookIds: ["pb-001", "pb-071", "pb-100", "pb-025", "pb-050", "pb-091"] },
  { id: "conformite", label: "Pack Conformite Quebec", icon: Shield, playbookIds: ["pb-090", "pb-075", "pb-024", "pb-077", "pb-085", "pb-104"] },
  { id: "croissance", label: "Accelerateurs de Croissance", icon: Rocket, playbookIds: ["pb-010", "pb-012", "pb-038", "pb-037", "pb-045", "pb-028"] },
];

function PlaybookCard({ pb, installed, recommended, onOpenDetail }: { pb: typeof PLAYBOOK_STORE_DATA[0]; installed?: boolean; recommended?: string; onOpenDetail?: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  const niveauStyle = NIVEAU_BADGE[pb.niveau] || NIVEAU_BADGE.Standard;
  return (
    <Card className="p-0 overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onOpenDetail?.(pb)}>
      <div className="px-3 py-2.5 space-y-1.5">
        <div className="flex items-start gap-2">
          <BookOpen className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-gray-800 leading-tight">{pb.nom}</div>
            <p className="text-[9px] text-gray-500 mt-0.5 line-clamp-2">{pb.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", niveauStyle.bg, niveauStyle.text)}>{pb.niveau}</span>
          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", pb.prix === "Gratuit" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{pb.prix}</span>
          {installed && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">Installe</span>}
          {recommended && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700">Recommande</span>}
        </div>
        <div className="flex items-center justify-between text-[9px] text-gray-400">
          <span>{pb.bots.join(", ")}</span>
          <span>{pb.etapes} etapes · {pb.duree}</span>
        </div>
        <div className="flex items-center gap-2 text-[9px]">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={cn("h-3.5 w-3.5", s <= Math.round(pb.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200")} />
            ))}
            <span className="text-gray-500 ml-1">{pb.rating}</span>
          </div>
          <span className="text-gray-400">{pb.downloads} installations</span>
        </div>
      </div>
    </Card>
  );
}

// ── Fiche Playbook Detaillee (modal overlay) ──
function PlaybookFicheDetail({ pb, onClose }: { pb: typeof PLAYBOOK_STORE_DATA[0]; onClose: () => void }) {
  const niveauStyle = NIVEAU_BADGE[pb.niveau] || NIVEAU_BADGE.Standard;
  const isInstalled = INSTALLED_PLAYBOOKS.includes(pb.id);
  // Generate mock workflow steps from etapes count
  const mockSteps = Array.from({ length: pb.etapes }, (_, i) => ({
    num: i + 1,
    label: i === 0 ? "Collecte des donnees et parametres initiaux" :
           i === pb.etapes - 1 ? "Generation du livrable final et validation" :
           i === 1 ? `Analyse et traitement par ${pb.bots[0]}` :
           i === 2 && pb.bots.length > 1 ? `Collaboration ${pb.bots[0]} + ${pb.bots[Math.min(1, pb.bots.length - 1)]}` :
           `Etape ${i + 1} — Traitement automatise`,
    bot: pb.bots[i % pb.bots.length],
    needsApproval: i === Math.floor(pb.etapes / 2),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto m-4" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="text-[9px] text-gray-400 hover:text-gray-600 cursor-pointer">← Retour</button>
            <div className="flex items-center gap-1.5">
              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", niveauStyle.bg, niveauStyle.text)}>{pb.niveau}</span>
              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", pb.prix === "Gratuit" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{pb.prix}</span>
            </div>
          </div>
          <h3 className="text-sm font-bold text-gray-900 mt-2">{pb.nom}</h3>
          <p className="text-[9px] text-gray-500 mt-1">{pb.description}</p>
          <div className="flex items-center gap-3 mt-2 text-[9px] text-gray-400">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={cn("h-3.5 w-3.5", s <= Math.round(pb.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200")} />
              ))}
              <span className="ml-1">{pb.rating}/5</span>
            </div>
            <span>{pb.downloads} installations</span>
            <span>{pb.duree}</span>
            <span>{pb.etapes} etapes</span>
          </div>
        </div>

        {/* Equipe IA impliquee */}
        <div className="px-4 py-3 border-b border-gray-100">
          <h4 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-2">Equipe IA impliquee</h4>
          <div className="flex items-center gap-2 flex-wrap">
            {pb.bots.map((bot, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1">
                <Bot className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[9px] font-bold text-gray-700">{bot}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Etapes du workflow */}
        <div className="px-4 py-3 border-b border-gray-100">
          <h4 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-2">Etapes du workflow</h4>
          <div className="space-y-1.5">
            {mockSteps.map(step => (
              <div key={step.num} className="flex items-start gap-2">
                <span className="text-[9px] font-bold text-white bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">{step.num}</span>
                <div className="flex-1">
                  <span className="text-[9px] text-gray-700">{step.label}</span>
                  <span className="text-[9px] text-gray-400 ml-1">({step.bot})</span>
                  {step.needsApproval && <span className="text-[9px] text-amber-600 ml-1 font-bold">⚠ Approbation requise</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info supplementaire */}
        <div className="px-4 py-3 border-b border-gray-100 grid grid-cols-2 gap-3">
          <div>
            <h4 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-1">Departement</h4>
            <span className="text-[9px] text-gray-600">{DEPT_LABELS[pb.departement] || pb.departement}</span>
          </div>
          <div>
            <h4 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-1">Categorie</h4>
            <span className="text-[9px] text-gray-600">{pb.categorie}</span>
          </div>
          <div>
            <h4 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-1">Pilier VITAA</h4>
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", PILIER_COLORS[pb.pilier]?.bg || "bg-gray-50", PILIER_COLORS[pb.pilier]?.text || "text-gray-700")}>{pb.pilier}</span>
          </div>
          <div>
            <h4 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-1">Duree estimee</h4>
            <span className="text-[9px] text-gray-600">{pb.duree}</span>
          </div>
        </div>

        {/* Action button */}
        <div className="px-4 py-3 flex items-center gap-2">
          {isInstalled ? (
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer">
              <Rocket className="h-3.5 w-3.5" /> Executer
            </button>
          ) : pb.prix === "Gratuit" ? (
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer">
              <Plus className="h-3.5 w-3.5" /> Installer
            </button>
          ) : (
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer">
              <ShoppingBag className="h-3.5 w-3.5" /> Acheter {pb.prix}
            </button>
          )}
          <button className="px-3 py-2 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors cursor-pointer">
            <Star className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mes Playbooks — En cours + Completes + Installes ──
function PlaybookMesInstalled({ botCode, onOpenDetail }: { botCode: string; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  const installed = PLAYBOOK_STORE_DATA.filter(pb => INSTALLED_PLAYBOOKS.includes(pb.id) && (botCode === "CEOB" || pb.departement === botCode));

  return (
    <div className="space-y-4">
      {/* En cours d'execution */}
      {RUNNING_PLAYBOOKS.length > 0 && (
        <div>
          <h3 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-emerald-500" /> En cours d'execution ({RUNNING_PLAYBOOKS.length})
          </h3>
          <div className="space-y-2">
            {RUNNING_PLAYBOOKS.map(run => {
              const pb = PLAYBOOK_STORE_DATA.find(p => p.id === run.playbookId);
              if (!pb) return null;
              return (
                <Card key={run.playbookId} className="p-0 overflow-hidden rounded-xl border-l-4 border-l-emerald-500">
                  <div className="px-3 py-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", run.statut === "actif" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                          {run.statut === "actif" ? "Actif" : "En pause"}
                        </span>
                        <span className="text-xs font-bold text-gray-800">{pb.nom}</span>
                      </div>
                      <span className="text-[9px] font-bold text-gray-500">{run.progress}%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${run.progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-gray-500">
                      <span>Etape: {run.etapeActuelle}</span>
                      <span>Bot actif: <span className="font-bold text-gray-700">{run.botActif}</span></span>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-gray-400">Temps restant: {run.tempsRestant}</span>
                      <div className="flex items-center gap-1">
                        {pb.bots.map((bot, i) => (
                          <span key={i} className={cn("px-1 py-0.5 rounded text-[9px]", bot === run.botActif ? "bg-emerald-100 text-emerald-700 font-bold" : "bg-gray-100 text-gray-400")}>{bot}</span>
                        ))}
                      </div>
                    </div>
                    {run.actionRequise && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="text-[9px] text-amber-700 flex-1">{run.actionRequise}</span>
                        <button className="text-[9px] font-bold text-amber-700 bg-amber-200 hover:bg-amber-300 px-2 py-0.5 rounded cursor-pointer">Fournir</button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Recemment completes */}
      {COMPLETED_PLAYBOOKS.length > 0 && (
        <div>
          <h3 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Recemment completes
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {COMPLETED_PLAYBOOKS.map(cp => {
              const pb = PLAYBOOK_STORE_DATA.find(p => p.id === cp.playbookId);
              if (!pb) return null;
              const pilierColor = PILIER_COLORS[cp.pilierImpact] || PILIER_COLORS.Actif;
              return (
                <Card key={cp.playbookId} className="p-0 overflow-hidden rounded-xl cursor-pointer hover:shadow-md transition-shadow" onClick={() => onOpenDetail(pb)}>
                  <div className="px-2.5 py-2 space-y-1">
                    <div className="text-[9px] font-bold text-gray-800 leading-tight">{pb.nom}</div>
                    <div className="text-[9px] text-gray-400">{pb.bots.join(" + ")}</div>
                    <div className="text-[9px] text-gray-400">Termine le {cp.completeLe}</div>
                    <div className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded inline-block", pilierColor.bg, pilierColor.text)}>Impact: {cp.impact}</div>
                    <button className="w-full text-[9px] font-bold text-blue-600 hover:text-blue-700 mt-1 cursor-pointer">Voir les livrables</button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Mes playbooks installes */}
      <div>
        <h3 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-gray-400" /> Mes playbooks installes ({installed.length})
        </h3>
        {installed.length === 0 ? (
          <p className="text-[9px] text-gray-400 text-center py-4">Aucun playbook installe — explorez le Store</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {installed.map(pb => <PlaybookCard key={pb.id} pb={pb} installed onOpenDetail={onOpenDetail} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Recommandes — Gaps VITAA + Saisonnalite Quebec ──
function PlaybookRecommandes({ botCode, onOpenDetail }: { botCode: string; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const recs = RECOMMENDED_PLAYBOOKS
    .map(r => ({ ...r, pb: PLAYBOOK_STORE_DATA.find(p => p.id === r.playbookId) }))
    .filter(r => r.pb && (botCode === "CEOB" || r.pb!.departement === botCode) && !dismissed.has(r.playbookId));

  const seasonal = SEASONAL_PLAYBOOKS
    .map(s => ({ ...s, pb: PLAYBOOK_STORE_DATA.find(p => p.id === s.playbookId) }))
    .filter(s => s.pb && !dismissed.has(s.playbookId));

  return (
    <div className="space-y-4">
      {/* Header score VITAA */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-600" />
          <div>
            <span className="text-[9px] font-bold text-gray-800">Recommandations strategiques pour votre PME</span>
            <span className="text-[9px] text-gray-500 ml-2">Score VITAA actuel: 62/100</span>
          </div>
        </div>
      </div>

      {/* Gaps VITAA prioritaires */}
      {recs.length > 0 && (
        <div>
          <h3 className="text-[9px] font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Priorite haute — Gaps identifies
          </h3>
          <div className="space-y-2">
            {recs.map(r => {
              if (!r.pb) return null;
              const pilierColor = PILIER_COLORS[r.pilier] || PILIER_COLORS.Actif;
              return (
                <Card key={r.playbookId} className={cn("p-0 overflow-hidden rounded-xl border-l-4", pilierColor.border)}>
                  <div className="px-3 py-2.5 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => onOpenDetail(r.pb!)}>
                        <div className="text-xs font-bold text-gray-800">{r.pb.nom}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Bot className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-[9px] text-gray-500">{r.pb.bots.join(", ")}</span>
                          <span className="text-[9px] text-gray-400">·</span>
                          <span className="text-[9px] text-gray-500">{r.pb.duree}</span>
                          <span className="text-[9px] text-gray-400">·</span>
                          <span className={cn("text-[9px] font-bold", r.pb.prix === "Gratuit" ? "text-emerald-600" : "text-amber-600")}>{r.pb.prix}</span>
                        </div>
                      </div>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0", pilierColor.bg, pilierColor.text)}>{r.pilier}</span>
                    </div>
                    <div className={cn("rounded px-2 py-1 text-[9px]", pilierColor.bg, pilierColor.text)}>
                      {r.raison}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onOpenDetail(r.pb!)} className="flex-1 text-[9px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5 transition-colors cursor-pointer text-center">
                        {r.pb.prix === "Gratuit" ? "Installer" : `Acheter ${r.pb.prix}`}
                      </button>
                      <button onClick={() => setDismissed(prev => new Set([...prev, r.playbookId]))} className="text-[9px] text-gray-400 hover:text-gray-600 px-2 py-1.5 cursor-pointer">
                        Ignorer
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Saisonnalite & Conformite Quebec */}
      {seasonal.length > 0 && (
        <div>
          <h3 className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Saisonnalite & Conformite Quebec
          </h3>
          <div className="space-y-2">
            {seasonal.map(s => {
              if (!s.pb) return null;
              return (
                <Card key={s.playbookId} className="p-0 overflow-hidden rounded-xl border-l-4 border-l-amber-400">
                  <div className="px-3 py-2.5 space-y-1.5">
                    <div className="flex items-start justify-between cursor-pointer" onClick={() => onOpenDetail(s.pb!)}>
                      <div>
                        <div className="text-xs font-bold text-gray-800">{s.pb.nom}</div>
                        <div className="text-[9px] text-gray-500 mt-0.5">{s.pb.bots.join(", ")} · {s.pb.duree} · {s.pb.prix}</div>
                      </div>
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">Echeance: {s.echeance}</span>
                    </div>
                    <div className="bg-amber-50 rounded px-2 py-1 text-[9px] text-amber-700">{s.raison}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onOpenDetail(s.pb!)} className="flex-1 text-[9px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg px-3 py-1.5 transition-colors cursor-pointer text-center">
                        {s.pb.prix === "Gratuit" ? "Installer" : `Acheter ${s.pb.prix}`}
                      </button>
                      <button onClick={() => setDismissed(prev => new Set([...prev, s.playbookId]))} className="text-[9px] text-gray-400 hover:text-gray-600 px-2 py-1.5 cursor-pointer">
                        Ignorer
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {recs.length === 0 && seasonal.length === 0 && (
        <p className="text-[9px] text-gray-400 text-center py-8">Aucune recommandation pour ce departement</p>
      )}
    </div>
  );
}

// ── Store — Marketplace avec collections + filtres departement ──
function PlaybookStore({ botCode, onOpenDetail }: { botCode: string; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNiveau, setFilterNiveau] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [filterPrix, setFilterPrix] = useState<string>("all");

  const available = PLAYBOOK_STORE_DATA.filter(pb => {
    if (filterDept !== "all" && pb.departement !== filterDept) return false;
    if (botCode !== "CEOB" && filterDept === "all" && pb.departement !== botCode) return false;
    if (searchTerm && !pb.nom.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.categorie.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterNiveau !== "all" && pb.niveau !== filterNiveau) return false;
    if (filterPrix === "gratuit" && pb.prix !== "Gratuit") return false;
    if (filterPrix === "premium" && pb.prix === "Gratuit") return false;
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Search + filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher un processus, un objectif ou un bot..."
            className="w-full text-xs border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        {botCode === "CEOB" && (
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="text-[9px] border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="all">Tous departements</option>
            {Object.entries(DEPT_LABELS).map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        )}
        <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)} className="text-[9px] border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300">
          <option value="all">Tous niveaux</option>
          <option value="Quick Win">Quick Win</option>
          <option value="Standard">Standard</option>
          <option value="Avance">Avance</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <select value={filterPrix} onChange={e => setFilterPrix(e.target.value)} className="text-[9px] border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300">
          <option value="all">Tous prix</option>
          <option value="gratuit">Gratuit</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {/* Collections horizontales (seulement si pas de recherche active) */}
      {!searchTerm && filterDept === "all" && filterNiveau === "all" && filterPrix === "all" && STORE_COLLECTIONS.map(col => {
        const colPlaybooks = col.playbookIds.map(id => PLAYBOOK_STORE_DATA.find(p => p.id === id)).filter(Boolean) as typeof PLAYBOOK_STORE_DATA;
        if (colPlaybooks.length === 0) return null;
        const ColIcon = col.icon;
        return (
          <div key={col.id}>
            <h3 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ColIcon className="h-3.5 w-3.5 text-blue-500" /> {col.label}
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {colPlaybooks.map(pb => (
                <div key={pb.id} className="min-w-[200px] max-w-[200px]">
                  <PlaybookCard pb={pb} installed={INSTALLED_PLAYBOOKS.includes(pb.id)} onOpenDetail={onOpenDetail} />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Separateur si collections affichees */}
      {!searchTerm && filterDept === "all" && filterNiveau === "all" && filterPrix === "all" && (
        <div className="h-px bg-gray-100 my-2" />
      )}

      {/* Commission info */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2 flex items-center gap-2">
        <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <span className="text-[9px] text-blue-700">Marketplace: 85% createur / 15% plateforme Brain Team · {available.length} playbooks disponibles</span>
      </div>

      {/* Grid complete */}
      <div className="grid grid-cols-2 gap-2">
        {available.map(pb => (
          <PlaybookCard key={pb.id} pb={pb} installed={INSTALLED_PLAYBOOKS.includes(pb.id)} onOpenDetail={onOpenDetail} />
        ))}
      </div>

      {available.length === 0 && (
        <p className="text-[9px] text-gray-400 text-center py-8">Aucun playbook ne correspond a vos criteres</p>
      )}
    </div>
  );
}

function BlueprintPlaybooks({ botCode, headerGradient }: { botCode: string; headerGradient: string }) {
  const [activePlaybookView, setActivePlaybookView] = useState<"installed" | "recommandes" | "store">("installed");
  const [selectedPlaybook, setSelectedPlaybook] = useState<typeof PLAYBOOK_STORE_DATA[0] | null>(null);

  const views = [
    { id: "installed" as const, label: "Mes Playbooks", icon: BookOpen, count: INSTALLED_PLAYBOOKS.length },
    { id: "recommandes" as const, label: "Recommandes", icon: Sparkles, count: RECOMMENDED_PLAYBOOKS.length },
    { id: "store" as const, label: "Store", icon: ShoppingBag, count: PLAYBOOK_STORE_DATA.length },
  ];

  return (
    <div className="flex gap-3">
      {/* Sidebar TOC */}
      <div className="w-[180px] shrink-0 space-y-0.5">
        {views.map(v => {
          const isActive = activePlaybookView === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setActivePlaybookView(v.id)}
              className={cn(
                "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
              )}
            >
              <div className="flex items-center gap-1.5">
                <v.icon className={cn("h-3.5 w-3.5", isActive ? "text-blue-500" : "text-gray-400")} />
                <span className={cn("text-[9px] font-bold flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-700")}>
                  {v.label}
                </span>
                <span className="text-[9px] text-gray-400">{v.count}</span>
              </div>
            </button>
          );
        })}

        {/* Stats rapides */}
        <div className="h-px bg-gray-100 mx-2 my-2" />
        <div className="px-2.5 space-y-1">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-gray-400">En cours</span>
            <span className="font-bold text-emerald-600">{RUNNING_PLAYBOOKS.length}</span>
          </div>
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-gray-400">Completes</span>
            <span className="font-bold text-blue-600">{COMPLETED_PLAYBOOKS.length}</span>
          </div>
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-gray-400">Installes</span>
            <span className="font-bold text-gray-600">{INSTALLED_PLAYBOOKS.length}</span>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        {activePlaybookView === "installed" && <PlaybookMesInstalled botCode={botCode} onOpenDetail={setSelectedPlaybook} />}
        {activePlaybookView === "recommandes" && <PlaybookRecommandes botCode={botCode} onOpenDetail={setSelectedPlaybook} />}
        {activePlaybookView === "store" && <PlaybookStore botCode={botCode} onOpenDetail={setSelectedPlaybook} />}
      </div>

      {/* Modal fiche detaillee */}
      {selectedPlaybook && <PlaybookFicheDetail pb={selectedPlaybook} onClose={() => setSelectedPlaybook(null)} />}
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

type HeaderView = "blueprint" | "ca" | "comites" | "personnel" | "bot" | "dataroom" | "playbooks";

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
                headerView === "dataroom" ? "Data Room" :
                headerView === "playbooks" ? "Playbooks" :
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
          { key: "dataroom" as HeaderView, label: "Data Room", icon: Database, show: true },
          { key: "playbooks" as HeaderView, label: "Playbooks", icon: BookOpen, show: true },
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
        <BlueprintPersonnel botCode={botCode} headerGradient={headerGradient} />
      )}

      {/* VUE BOT — Blueprint de l'Agent IA */}
      {headerView === "bot" && (
        <BlueprintBot botCode={botCode} headerGradient={headerGradient} />
      )}

      {/* SECTION HEADER — Rectangle bleu entre boutons et contenu (Data Room / Playbooks) */}
      {(headerView === "dataroom" || headerView === "playbooks") && (
        <div className={cn("bg-gradient-to-r rounded-lg px-4 py-2.5 flex items-center gap-3", headerGradient)}>
          {headerView === "dataroom" ? <Database className="h-5 w-5 text-white" /> : <BookOpen className="h-5 w-5 text-white" />}
          <h2 className="text-lg font-bold text-white">{headerView === "dataroom" ? "Data Room" : "Playbooks"}</h2>
          <span className="text-xs text-white/60 ml-auto">{config.deptLabel}</span>
        </div>
      )}

      {/* VUE DATA ROOM — Documents par département */}
      {headerView === "dataroom" && (
        <BlueprintDataRoom botCode={botCode} headerGradient={headerGradient} />
      )}

      {/* VUE PLAYBOOKS — Mes playbooks + Recommandés + Store */}
      {headerView === "playbooks" && (
        <BlueprintPlaybooks botCode={botCode} headerGradient={headerGradient} />
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
                      <span className={cn("text-[9px] font-bold flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-700")}>
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
              <Card className="p-0 overflow-hidden rounded-xl shadow-sm">
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

                {/* Bloc d'introduction — bien visible */}
                <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50/20 border-b border-gray-100">
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
