/** BlueprintPersonnel.tsx — Blueprint Personnel du dirigeant. Extracted from BlueprintDepartement.tsx */

import { useState } from "react";
import {
  Target, TrendingUp, Loader2, Save, AlertTriangle, Info, FileText, BookOpen,
  Heart, Sparkles, Users, User, Briefcase, PenLine,
  BarChart3, Eye, Clock, Lock, Share2, Bell, Compass,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { cn } from "../../../components/ui/utils";
import { useDataSource } from "../../data/use-data-source";
import { DomainBadge } from "../../data/source-badge";
import { getFieldsForTier, type SizeTier, type FieldDef } from "../../../v2/zones/center/blueprint/blueprint-config";
import { BlueprintField, isWideField } from "./blueprint-helpers";

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

import { SIMULATION_DATA } from "../../data/mock/blueprint.mock";

export function BlueprintPersonnel({ botCode, headerGradient, data, onFieldChange, onSave, saving, dirty, tier }: {
  botCode: string; headerGradient: string;
  data: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
  tier: SizeTier;
}) {
  const { data: simulationSourceData } = useDataSource("blueprint-sections", SIMULATION_DATA);

  const [activeSection, setActiveSection] = useState(PERSONAL_SECTIONS[0].id);
  const [previewMode, setPreviewMode] = useState(true);

  // En mode preview: fusionner données réelles + simulation pour les champs vides
  const d = previewMode
    ? { ...simulationSourceData, ...Object.fromEntries(Object.entries(data).filter(([, v]) => v !== "")) }
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
              <DomainBadge domain="blueprint-sections" className="ml-1" />
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
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
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
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
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
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
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
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
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
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
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
                      <div key={kpi.key} className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
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
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
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
                <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
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
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all">
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
                  <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
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
