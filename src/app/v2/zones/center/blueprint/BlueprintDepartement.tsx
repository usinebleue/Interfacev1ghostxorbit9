/**
 * BlueprintDepartement.tsx — Composant generique Blueprint Vivant par departement
 * Layout DocForge: Sidebar Table des Matieres (~25%) + Zone Contenu (~75%)
 * Source: blueprint-config.ts (12 departements x ~97 sous-sections)
 *
 * Utilise dans DepartmentTourDeControle.tsx pour le tab "Blueprint" de TOUS les bots.
 * CEOB = le plus complet (16 sections + Vue consolidee des 11 autres departements)
 */

import { useState, useEffect, useCallback } from "react";
import {
  Building2, Target, Layers, Rocket, DollarSign, Shield, Compass,
  TrendingUp, ListChecks, Settings, Flame, Save, Loader2,
  CheckCircle2, AlertTriangle, Info, FileText, BookOpen, Heart,
  ChevronRight, Sparkles, Link2, Users, User, Briefcase, Plus, Trash2, UserPlus, PenLine,
  Bot, Cpu, Zap, Activity, BarChart3, Star, MessageCircle,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { cn } from "../../../../components/ui/utils";
import { api } from "../../../api/client";
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

// ── Vue consolidee 11 departements — CEOB uniquement ──
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
    label: "Vue consolidée",
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
  { id: "vue_consolidee_bot", label: "Vue consolidée", icon: Layers },
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
      {/* ── VITAA — Toi vs Secteur (copié de SanteGlobaleView) ── */}
      <div className="border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 border-b border-blue-100 flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700 flex-1">VITAA — Toi vs Secteur</span>
          <span className="flex items-center gap-1 text-[9px] text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Secteur</span>
          <span className="flex items-center gap-1 text-[9px] text-gray-400 ml-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Toi</span>
        </div>
        <div className="p-2.5 space-y-2">
          {[
            { letter: "V", label: "Vente", score: 0, avg: 50, color: "bg-blue-500" },
            { letter: "I", label: "Idee", score: 0, avg: 50, color: "bg-purple-500" },
            { letter: "T", label: "Temps", score: 0, avg: 50, color: "bg-emerald-500" },
            { letter: "A", label: "Argent", score: 0, avg: 50, color: "bg-amber-500" },
            { letter: "A", label: "Actif", score: 0, avg: 50, color: "bg-red-500" },
          ].map((p) => (
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
      {/* HEADER — Compact: titre + % + tier/phase + boutons */}
      <div className={cn("bg-gradient-to-r rounded-xl px-4 py-3 transition-all duration-300", headerGradient)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Blueprint {headerView === "blueprint" ? config.deptLabel : headerView === "ca" ? "CA" : headerView === "comites" ? "Comités" : headerView === "personnel" ? "Personnel" : "Agent IA"}</h2>
                <span className="text-sm font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">{completionScore}%</span>
              </div>
              <p className="text-[9px] text-white/50">{SIZE_TIERS.find(t => t.id === tier)?.label} ({SIZE_TIERS.find(t => t.id === tier)?.range} emp.) · {PHASES.find(p => p.id === phase)?.emoji} {PHASES.find(p => p.id === phase)?.label}</p>
            </div>
          </div>

          {/* Boutons Blueprint + CA (CEOB) + Comités (tous) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setHeaderView("blueprint")}
              className={cn("px-3 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                headerView === "blueprint" ? "bg-white/25 text-white" : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white")}
            >
              <Layers className="h-3.5 w-3.5" /> Direction
            </button>
            {botCode === "CEOB" && (
              <button
                onClick={() => setHeaderView("ca")}
                className={cn("px-3 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                  headerView === "ca" ? "bg-white/25 text-white" : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white")}
              >
                <Users className="h-3.5 w-3.5" /> CA
              </button>
            )}
            <button
              onClick={() => setHeaderView("comites")}
              className={cn("px-3 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                headerView === "comites" ? "bg-white/25 text-white" : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white")}
            >
              <Briefcase className="h-3.5 w-3.5" /> Comités
            </button>
            <button
              onClick={() => setHeaderView("personnel")}
              className={cn("px-3 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                headerView === "personnel" ? "bg-white/25 text-white" : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white")}
            >
              <User className="h-3.5 w-3.5" /> Personnel
            </button>
            <button
              onClick={() => setHeaderView("bot")}
              className={cn("px-3 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                headerView === "bot" ? "bg-white/25 text-white" : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white")}
            >
              <Bot className="h-3.5 w-3.5" /> Agent IA
            </button>
          </div>
        </div>
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

      {/* LAYOUT DOCFORGE — Sidebar TOC (240px) + Contenu (flex-1) */}
      {headerView === "blueprint" && (
        <div className="flex gap-3">

          {/* SIDEBAR — Table des matieres */}
          <div className="w-[180px] shrink-0 space-y-1">
            <div className="space-y-0.5 overflow-y-auto pr-1">
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
