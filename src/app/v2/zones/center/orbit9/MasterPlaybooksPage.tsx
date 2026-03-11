/**
 * MasterPlaybooksPage.tsx — Playbooks, Templates Projets & Missions Récurrentes
 * Source: mega-prompt-playbooks-gemini.md
 * Master GHML — Session 48
 */

import {
  BookTemplate, Rocket, Server, Settings, Users, Leaf, Cog,
  FileText, Target, BarChart3, Clock, Layers, CheckCircle2,
  ArrowRight, Briefcase, Lightbulb, Shield,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ======================================================================
// DATA
// ======================================================================

const CHANTIER_TYPES = [
  { type: "strategique", label: "Stratégique", color: "bg-red-50 text-red-700", examples: "Nouveau marché, pivot, M&A, diversification, plan 3 ans" },
  { type: "technologique", label: "Technologique", color: "bg-violet-50 text-violet-700", examples: "Migration cloud, ERP, IA, cybersécurité, IoT industriel" },
  { type: "organisationnel", label: "Organisationnel", color: "bg-blue-50 text-blue-700", examples: "Restructuration, lean, agilité, gestion du changement" },
  { type: "culturel", label: "Culturel", color: "bg-teal-50 text-teal-700", examples: "Marque employeur, DEI, innovation culture, leadership" },
  { type: "environnemental", label: "Environnemental", color: "bg-green-50 text-green-700", examples: "ESG, économie circulaire, bilan carbone, ISO 14001" },
  { type: "operationnel", label: "Opérationnel", color: "bg-amber-50 text-amber-700", examples: "Supply chain, qualité, production, maintenance, logistique" },
];

interface Playbook {
  title: string;
  type: string;
  industry: string | null;
  bots: string[];
  duration: string;
  kpis: string[];
}

const PLAYBOOKS_UNIVERSELS: Playbook[] = [
  { title: "Plan stratégique 3 ans", type: "strategique", industry: null, bots: ["BCO", "BCS", "BCF"], duration: "3-6 mois", kpis: ["Taux atteinte objectifs", "Croissance CA", "Part de marché"] },
  { title: "Transformation numérique globale", type: "technologique", industry: null, bots: ["BCT", "BOO", "BCO"], duration: "6-12 mois", kpis: ["% processus automatisés", "Coût IT/employé", "Score maturité numérique"] },
  { title: "Optimisation chaîne d'approvisionnement", type: "operationnel", industry: null, bots: ["BOO", "BCF", "BFA"], duration: "3-6 mois", kpis: ["OTIF %", "Coût logistique % CA", "Rotation inventaire"] },
  { title: "Programme de cybersécurité", type: "technologique", industry: null, bots: ["BSE", "BCT", "BLE"], duration: "3-6 mois", kpis: ["Score NIST", "Incidents/trimestre", "Temps réponse incident"] },
  { title: "Fusion / Acquisition — Intégration post-merger", type: "strategique", industry: null, bots: ["BCO", "BCF", "BHR"], duration: "6-12 mois", kpis: ["Synergies réalisées $/an", "Rétention talents clés %", "Intégration systèmes %"] },
  { title: "Développement de nouveaux produits (NPD)", type: "strategique", industry: null, bots: ["BIO", "BCM", "BCT"], duration: "3-9 mois", kpis: ["Time-to-market jours", "Taux succès lancement", "CA nouveaux produits %"] },
  { title: "Certification qualité (ISO 9001, 13485)", type: "operationnel", industry: null, bots: ["BOO", "BFA", "BLE"], duration: "6-12 mois", kpis: ["Taux conformité %", "Non-conformités/audit", "Coût non-qualité %"] },
  { title: "Programme de relève et succession", type: "organisationnel", industry: null, bots: ["BHR", "BCO"], duration: "6-18 mois", kpis: ["% postes clés avec successeur", "Préparation successeurs score", "Rétention hauts potentiels"] },
  { title: "Restructuration financière / redressement", type: "strategique", industry: null, bots: ["BCF", "BCO", "BOO"], duration: "3-6 mois", kpis: ["Ratio liquidité", "Réduction coûts %", "EBITDA margin"] },
  { title: "Expansion internationale", type: "strategique", industry: null, bots: ["BCS", "BCM", "BLE"], duration: "6-12 mois", kpis: ["CA export %", "Nb marchés pénétrés", "Coût entrée vs budget"] },
  { title: "Programme d'innovation ouverte", type: "culturel", industry: null, bots: ["BIO", "BCT", "BCS"], duration: "3-6 mois", kpis: ["Nb idées soumises", "Taux implantation", "CA innovation %"] },
  { title: "Marque employeur et attraction", type: "culturel", industry: null, bots: ["BHR", "BCM"], duration: "3-6 mois", kpis: ["Candidatures spontanées", "Score Glassdoor", "Taux acceptation offres"] },
  { title: "Migration cloud et modernisation TI", type: "technologique", industry: null, bots: ["BCT", "BSE", "BCF"], duration: "3-6 mois", kpis: ["% workloads cloud", "Temps indisponibilité", "Économies infra $/mois"] },
  { title: "Programme ESG complet", type: "environnemental", industry: null, bots: ["BCO", "BLE", "BOO"], duration: "6-12 mois", kpis: ["Score ESG", "Émissions CO2 réduction %", "Conformité reporting"] },
  { title: "Optimisation maintenance (TPM)", type: "operationnel", industry: null, bots: ["BFA", "BOO", "BCT"], duration: "3-6 mois", kpis: ["Ratio préventif/correctif", "MTBF heures", "Coût maintenance % actifs"] },
];

const PLAYBOOKS_SECTORIELS: Playbook[] = [
  { title: "Ligne de production automatisée", type: "operationnel", industry: "Manufacturier", bots: ["BFA", "BCT", "BOO"], duration: "3-6 mois", kpis: ["TRS/OEE", "Cadence pièces/h", "Payback mois"] },
  { title: "Certification IATF 16949 (auto)", type: "operationnel", industry: "Manufacturier", bots: ["BOO", "BFA", "BLE"], duration: "6-12 mois", kpis: ["PPM client", "Score audit IATF", "APQP complets"] },
  { title: "Implantation MES", type: "technologique", industry: "Manufacturier", bots: ["BCT", "BFA", "BOO"], duration: "3-9 mois", kpis: ["Visibilité temps réel %", "Réduction saisie manuelle", "TRS accuracy"] },
  { title: "Programme maintenance prédictive", type: "technologique", industry: "Manufacturier", bots: ["BFA", "BCT"], duration: "3-6 mois", kpis: ["Prédictions correctes %", "Arrêts imprévus réduction", "ROI capteurs"] },
  { title: "Économie circulaire usine", type: "environnemental", industry: "Manufacturier", bots: ["BOO", "BFA", "BCO"], duration: "6-12 mois", kpis: ["Taux recyclage %", "Réduction déchets %", "Coût matière $/unité"] },
  { title: "Certification HACCP / SQF", type: "operationnel", industry: "Agroalimentaire", bots: ["BOO", "BFA", "BLE"], duration: "4-8 mois", kpis: ["Score audit GFSI", "Rappels 0", "Traçabilité 100%"] },
  { title: "Traçabilité de lot complète", type: "technologique", industry: "Agroalimentaire", bots: ["BCT", "BOO", "BFA"], duration: "3-6 mois", kpis: ["Recall time minutes", "Couverture traçabilité %", "Erreurs lot 0"] },
  { title: "Optimisation chaîne du froid", type: "operationnel", industry: "Agroalimentaire", bots: ["BOO", "BFA", "BCT"], duration: "2-4 mois", kpis: ["Bris chaîne froid 0", "Pertes température %", "Conformité ACIA 100%"] },
  { title: "BIM et construction numérique", type: "technologique", industry: "Construction", bots: ["BCT", "BOO"], duration: "6-12 mois", kpis: ["Clash detection %", "Rework réduction %", "Adoption BIM %"] },
  { title: "Programme SST zéro accident", type: "organisationnel", industry: "Construction", bots: ["BFA", "BHR", "BLE"], duration: "6-12 mois", kpis: ["Taux fréquence", "Quasi-accidents signalés", "Score audit SST"] },
  { title: "Conformité FDA / Santé Canada", type: "operationnel", industry: "Santé", bots: ["BLE", "BOO", "BIO"], duration: "6-18 mois", kpis: ["FDA 483 observations 0", "Temps approbation", "Conformité GMP %"] },
  { title: "ISO 13485 dispositifs médicaux", type: "operationnel", industry: "Santé", bots: ["BOO", "BLE", "BIO"], duration: "6-12 mois", kpis: ["Score audit ISO", "CAPA cycle jours", "Documentation 100%"] },
  { title: "Optimisation flottes transport", type: "operationnel", industry: "Transport", bots: ["BOO", "BCT", "BCF"], duration: "3-6 mois", kpis: ["Coût/km", "Taux utilisation flotte %", "Émissions CO2/tkm"] },
  { title: "Entrepôt automatisé 4.0", type: "technologique", industry: "Distribution", bots: ["BCT", "BOO", "BFA"], duration: "6-12 mois", kpis: ["Lignes/h", "Erreurs préparation %", "Utilisation espace %"] },
  { title: "Programme impact social OBNL", type: "culturel", industry: "Économie sociale", bots: ["BCO", "BCF", "BHR"], duration: "3-6 mois", kpis: ["Score impact social", "$ levés/dépensé", "Portée bénéficiaires"] },
];

const MISSION_CATEGORIES = [
  { cat: "analyse", label: "Analyse", count: 5, color: "bg-blue-50 text-blue-700", examples: "Étude de marché, analyse concurrentielle, audit financier, benchmark sectoriel, diagnostic de risques" },
  { cat: "planification", label: "Planification", count: 5, color: "bg-purple-50 text-purple-700", examples: "Plan stratégique, budget prévisionnel, roadmap produit, plan de projet, plan de recrutement" },
  { cat: "execution", label: "Exécution", count: 5, color: "bg-amber-50 text-amber-700", examples: "Implantation système, migration données, déploiement processus, formation équipe, lancement produit" },
  { cat: "evaluation", label: "Évaluation", count: 5, color: "bg-green-50 text-green-700", examples: "Revue de performance, post-mortem projet, satisfaction client, audit conformité, évaluation ROI" },
  { cat: "communication", label: "Communication", count: 5, color: "bg-pink-50 text-pink-700", examples: "Rapport de direction, présentation CA, communication interne, plan de crise, contenu marketing" },
  { cat: "gouvernance", label: "Gouvernance", count: 5, color: "bg-gray-50 text-gray-700", examples: "Mise à jour politiques, revue contractuelle, conformité réglementaire, gestion risques, plan succession" },
];

const DOC_TYPES = [
  { type: "rapport", label: "Rapport", desc: "Analyse, audit, diagnostic, performance" },
  { type: "plan", label: "Plan", desc: "Stratégique, projet, action, budget" },
  { type: "grille", label: "Grille", desc: "Évaluation, scoring, checklist" },
  { type: "checklist", label: "Checklist", desc: "Vérification, conformité, audit" },
  { type: "tableau", label: "Tableau", desc: "KPIs, benchmarks, comparatifs" },
  { type: "presentation", label: "Présentation", desc: "CA, direction, clients, investisseurs" },
  { type: "politique", label: "Politique", desc: "RH, sécurité, qualité, éthique" },
  { type: "procedure", label: "Procédure", desc: "SOP, processus, instructions" },
  { type: "formulaire", label: "Formulaire", desc: "Évaluation, demande, suivi" },
];

// ======================================================================
// COMPOSANT
// ======================================================================

export default function MasterPlaybooksPage() {
  return (
    <PageLayout maxWidth="4xl" showPresence={false}>
      <PageHeader
        title="Playbooks & Templates CarlOS"
        subtitle={`${PLAYBOOKS_UNIVERSELS.length} playbooks universels + ${PLAYBOOKS_SECTORIELS.length} sectoriels + 30 missions types`}
        gradient="from-amber-600 to-orange-500"
        icon={BookTemplate}
      />

      {/* ── 6 Types de Chantiers ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">F.2.1</span>6 Types de Chantiers (Transformations)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CHANTIER_TYPES.map((c) => (
            <Card key={c.type} className="p-3">
              <Badge className={cn("mb-2", c.color)}>{c.label}</Badge>
              <p className="text-xs text-gray-600">{c.examples}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Playbooks Universels ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2"><span className="text-[9px] font-bold text-gray-400 mr-1">F.2.2</span>{PLAYBOOKS_UNIVERSELS.length} Playbooks Universels</h2>
        <p className="text-sm text-gray-500 mb-4">Chaque playbook = 1 chantier + 2-4 projets + 3-5 missions par projet.</p>
        <div className="space-y-2">
          {PLAYBOOKS_UNIVERSELS.map((p, i) => (
            <Card key={i} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">U-{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-sm font-medium text-gray-800">{p.title}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">{p.duration}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">{p.type}</Badge>
                {p.bots.map((b) => (
                  <Badge key={b} className="text-xs bg-gray-50 text-gray-600">{b}</Badge>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {p.kpis.map((k) => (
                  <span key={k} className="text-xs text-gray-400">· {k}</span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Playbooks Sectoriels ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2"><span className="text-[9px] font-bold text-gray-400 mr-1">F.2.3</span>{PLAYBOOKS_SECTORIELS.length} Playbooks Sectoriels</h2>
        <p className="text-sm text-gray-500 mb-4">Spécifiques à une industrie — benchmarks et KPIs adaptés au secteur.</p>
        <div className="space-y-2">
          {PLAYBOOKS_SECTORIELS.map((p, i) => (
            <Card key={i} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">S-{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-sm font-medium text-gray-800">{p.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  {p.industry && <Badge className="text-xs bg-indigo-50 text-indigo-700">{p.industry}</Badge>}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">{p.duration}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {p.bots.map((b) => (
                  <Badge key={b} className="text-xs bg-gray-50 text-gray-600">{b}</Badge>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {p.kpis.map((k) => (
                  <span key={k} className="text-xs text-gray-400">· {k}</span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── 30 Missions Récurrentes ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">F.2.4</span>30 Missions Types Récurrentes (6 catégories)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MISSION_CATEGORIES.map((m) => (
            <Card key={m.cat} className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={cn("text-xs", m.color)}>{m.label}</Badge>
                <span className="text-xs text-gray-400">{m.count} missions</span>
              </div>
              <p className="text-xs text-gray-600">{m.examples}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── 9 Types de Documents Générés ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">F.2.5</span>9 Types de Documents Générés</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DOC_TYPES.map((d) => (
            <Card key={d.type} className="p-3 flex items-start gap-2">
              <FileText className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">{d.label}</p>
                <p className="text-xs text-gray-500">{d.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Architecture Playbook ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3"><span className="text-[9px] font-bold text-gray-400 mr-1">F.2.6</span>Architecture d'un Playbook</h2>
        <Card className="p-4 bg-gray-50">
          <div className="space-y-3">
            {[
              { level: "Playbook", desc: "Template complet — 1 chantier de transformation", icon: Layers },
              { level: "Projets (2-4)", desc: "Découpages logiques du chantier", icon: Briefcase },
              { level: "Missions (3-5/projet)", desc: "Tâches concrètes avec bot assigné et livrables", icon: Target },
              { level: "Documents suggérés", desc: "Rapports, plans, grilles auto-générés par les bots", icon: FileText },
              { level: "KPIs", desc: "Métriques mesurables pour suivre la progression", icon: BarChart3 },
            ].map((l, i) => (
              <div key={i} className="flex items-start gap-3">
                <l.icon className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{l.level}</p>
                  <p className="text-xs text-gray-500">{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Sources ── */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Sources : mega-prompt-playbooks-gemini.md · 30 playbooks + 20 templates projets + 30 missions types + 20 templates documents
        </p>
      </div>
    </PageLayout>
  );
}
