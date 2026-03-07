/**
 * MasterProfilsPage.tsx — Profils & Demos
 * SUMMARY page: all fake/real company profiles for demos.
 * Single scrollable page (no tabs): Vue d'ensemble, Patient Zero, Demo Primaire,
 * Secondaire, Entreprises Quebec, Integrateurs, Scenarios, Cibles, Donnees Manquantes.
 */

import {
  Users, Building2, Factory, MapPin, DollarSign, Target,
  CheckCircle2, AlertCircle, Star, Trophy, Eye, Layers,
  BarChart3, Briefcase, Globe, ArrowRight, FileText,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ======================================================================
// HELPER COMPONENTS
// ======================================================================

function StatusBadge({ status }: { status: "complet" | "partiel" | "a-monter" | "cible" }) {
  const config = {
    complet: { label: "COMPLET", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    partiel: { label: "PARTIEL", className: "bg-blue-100 text-blue-700 border-blue-200" },
    "a-monter": { label: "A MONTER", className: "bg-amber-100 text-amber-700 border-amber-200" },
    cible: { label: "CIBLE", className: "bg-red-100 text-red-700 border-red-200" },
  }[status];

  return (
    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", config.className)}>
      {config.label}
    </span>
  );
}

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ======================================================================
// DATA — Entreprises Quebec
// ======================================================================

interface EntrepriseQC {
  nom: string;
  ticker?: string;
  employes: string;
  description: string;
  status: "complet" | "partiel" | "a-monter" | "cible";
}

const ENTREPRISES_QC: EntrepriseQC[] = [
  { nom: "Saputo Inc.", ticker: "TSX:SAP", employes: "19,400", description: "Multinationale laitiere", status: "complet" },
  { nom: "Couche-Tard Inc.", employes: "17,000+", description: "Depanneurs", status: "complet" },
  { nom: "Premier Tech", employes: "20,000+", description: "Horticulture / environnement", status: "complet" },
  { nom: "WSP Global", employes: "50,000+", description: "Ingenierie", status: "complet" },
  { nom: "Consignaction Inc.", employes: "—", description: "Recyclage", status: "complet" },
  { nom: "MILA", employes: "—", description: "Institut IA Quebec", status: "complet" },
  { nom: "Novacap", employes: "—", description: "Fonds VC", status: "complet" },
  { nom: "Fonds FTQ", employes: "—", description: "Solidarite", status: "complet" },
  { nom: "Claridge Investments", employes: "—", description: "Investissements", status: "complet" },
  { nom: "CRCD", employes: "—", description: "Developpement communautaire", status: "complet" },
  { nom: "Investissement Quebec", employes: "—", description: "Organisme public", status: "complet" },
];

// ======================================================================
// DATA — Integrateurs Simules
// ======================================================================

interface Integrateur {
  nom: string;
  localisation: string;
  score: number;
  personnes: number;
  experience: string;
  specialites: string;
  projets?: number;
  approbation?: string;
  color: string;
}

const INTEGRATEURS: Integrateur[] = [
  {
    nom: "Energia Solutions",
    localisation: "Quebec",
    score: 94,
    personnes: 35,
    experience: "15 ans",
    specialites: "CO2 / robotique / IoT",
    projets: 42,
    approbation: "98% approbation HQ",
    color: "emerald",
  },
  {
    nom: "Techno-Froid Saguenay",
    localisation: "Chicoutimi",
    score: 87,
    personnes: 18,
    experience: "12 ans",
    specialites: "HVAC / froid commercial",
    color: "blue",
  },
  {
    nom: "GreenTech Industries",
    localisation: "Montreal",
    score: 82,
    personnes: 25,
    experience: "8 ans",
    specialites: "IoT / cobots / maintenance predictive",
    color: "amber",
  },
];

// ======================================================================
// DATA — Scenarios de Demo
// ======================================================================

interface Scenario {
  fichier: string;
  description: string;
}

const SCENARIOS: Scenario[] = [
  { fichier: "DiagnosticDemo.tsx", description: "Acte 1: Multi-bot diagnostic sur Aliments Boreal" },
  { fichier: "JumelageDemo.tsx", description: "Acte 2: Matching integrateur (3 candidats evalues)" },
  { fichier: "CahierProjetDemo.tsx", description: "Acte 3: Generation rapport de projet" },
  { fichier: "AnalyseDemo.tsx", description: "Mode Analyse — decomposition structuree" },
  { fichier: "DebatDemo.tsx", description: "Mode Debat — confrontation multi-perspectives" },
  { fichier: "BrainstormDemo.tsx", description: "Mode Brainstorm — ideation libre" },
  { fichier: "StrategieDemo.tsx", description: "Mode Strategie — planification long terme" },
  { fichier: "InnovationDemo.tsx", description: "Mode Innovation — exploration disruptive" },
  { fichier: "DeepResonanceDemo.tsx", description: "Mode Deep Resonance — reflexion profonde" },
  { fichier: "DecisionDemo.tsx", description: "Mode Decision — arbitrage structure" },
  { fichier: "CriseDemo.tsx", description: "Mode Crise — gestion urgence" },
  { fichier: "BranchPatternsDemo.tsx", description: "Patterns de branchement LiveChat" },
  { fichier: "ScenarioComplet.tsx", description: "Demo complete bout-en-bout" },
];

// ======================================================================
// DATA — Cibles de Demo
// ======================================================================

interface CibleDemo {
  titre: string;
  description: string;
  icon: React.ElementType;
}

const CIBLES: CibleDemo[] = [
  { titre: "PME manufacturieres Quebec", description: "Reseau REAI — 134 membres actifs", icon: Factory },
  { titre: "Startups tech Montreal", description: "Accelerateurs: FounderFuel, NextAI, CDL", icon: Briefcase },
  { titre: "Scaleups industrielles", description: "10M-100M$ CA — croissance rapide", icon: BarChart3 },
  { titre: "Investisseurs / fonds", description: "Novacap, FTQ, BDC, Caisse de depot", icon: DollarSign },
  { titre: "Organismes economiques", description: "MEI, DEC, InvestQC", icon: Globe },
];

// ======================================================================
// DATA — Donnees Manquantes
// ======================================================================

const DONNEES_MANQUANTES = [
  "Profils avec donnees financieres reelles (actuellement simulees dans usine-bleue.json)",
  "Video temoignages clients",
  "Captures d'ecran \"avant/apres\" CarlOS",
  "ROI documente sur cas reels",
  "Benchmark comparatif concurrents",
];

// ======================================================================
// MAIN COMPONENT
// ======================================================================

export function MasterProfilsPage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Users}
          iconColor="text-violet-600"
          title="Profils & Demos"
          subtitle="Company kits, scenarios de demo, profils entreprises"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* ============================================================ */}
      {/* SECTION 1 — Vue d'Ensemble */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Vue d'Ensemble</h3>

        <Card className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800">21</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">Company kits JSON</div>
                <div className="text-[9px] text-gray-400">dans clients/cahier/</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Eye className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800">13</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">Scenarios de demo</div>
                <div className="text-[9px] text-gray-400">scenarios/*.tsx</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <Layers className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800">3</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">Integrateurs simules</div>
                <div className="text-[9px] text-gray-400">Energia, Techno-Froid, GreenTech</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5">
                <Star className="h-4 w-4 text-amber-500" />
                <div>
                  <div className="text-xs font-bold text-gray-700">Patient Zero</div>
                  <p className="text-[9px] text-gray-500">Carl Fugere / Usine Bleue AI</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Target className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-xs font-bold text-gray-700">Demo primaire</div>
                  <p className="text-[9px] text-gray-500">Aliments Boreal Inc.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 2 — Profil Patient Zero — Usine Bleue AI */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800">Profil Patient Zero — Usine Bleue AI</h3>
          <StatusBadge status="complet" />
        </div>

        <Card className="p-5 bg-white border border-gray-100 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <Trophy className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-800">Carl Fugere — CEO</div>
              <p className="text-xs text-gray-500">26 ans experience, 7 entreprises, 50M+ ventes cumulees</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
              <Building2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-gray-700">Entreprise</div>
                <p className="text-[9px] text-gray-500 mt-0.5">Usine Bleue AI Inc., Drummondville QC</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
              <Briefcase className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-gray-700">Secteur</div>
                <p className="text-[9px] text-gray-500 mt-0.5">IA / SaaS B2B pour PME manufacturieres</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
              <Layers className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-gray-700">Produits</div>
                <p className="text-[9px] text-gray-500 mt-0.5 leading-relaxed">
                  GhostX CarlOS (499-2499$/mois) — Diagnostic GhostX (3500$/diag) — REAI Network (134 membres)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
              <DollarSign className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-gray-700">Revenus</div>
                <p className="text-[9px] text-gray-500 mt-0.5">MRR: 12,450$ / ARR projete: 149,400$</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>47 diagnostics completes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Target className="h-4 w-4 text-blue-500" />
              <span>Pipeline 23</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="font-mono text-[9px]">usine-bleue.json</span>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 3 — Demo Primaire — Aliments Boreal Inc. */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800">Demo Primaire — Aliments Boreal Inc.</h3>
          <StatusBadge status="complet" />
        </div>

        <Card className="p-5 bg-white border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-gray-700">Localisation</div>
                <p className="text-[9px] text-gray-500 mt-0.5">Saguenay, Quebec</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-gray-700">Employes</div>
                <p className="text-[9px] text-gray-500 mt-0.5">52-85</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
              <Factory className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-gray-700">Secteur</div>
                <p className="text-[9px] text-gray-500 mt-0.5">Agroalimentaire (sauces, marinades, condiments)</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
              <Layers className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-gray-700">Produits</div>
                <p className="text-[9px] text-gray-500 mt-0.5">Ligne Pail (seaux) + Ligne Jar (pots) — 80+ SKUs</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-red-50 rounded-lg border border-red-100 mb-4">
            <div className="text-xs font-bold text-red-700 mb-1.5">Problemes identifies</div>
            <div className="space-y-1">
              {[
                "Energie (+40% en 2 ans)",
                "Palettisation manuelle (6 employes)",
                "Pas d'IoT",
              ].map((p) => (
                <div key={p} className="flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <span className="text-[9px] text-red-600">{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-sm font-bold text-gray-800">800K-1.2M$</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wide">Budget</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-sm font-bold text-gray-800">22 mois</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wide">ROI post-subventions</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-sm font-bold text-gray-800">3</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wide">Scenarios actifs</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex flex-wrap gap-1.5">
              {["DiagnosticDemo", "JumelageDemo", "CahierProjetDemo"].map((s) => (
                <Badge key={s} variant="outline" className="text-[9px] font-medium">{s}</Badge>
              ))}
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="font-mono text-[9px]">alimentation-boreal.json</span>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 4 — Profil Secondaire — Acier Plus Fabrication */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800">Profil Secondaire — Acier Plus Fabrication</h3>
          <StatusBadge status="complet" />
        </div>

        <Card className="p-5 bg-white border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-gray-700">Localisation</div>
                <p className="text-[9px] text-gray-500 mt-0.5">Trois-Rivieres, Quebec</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-gray-700">Employes</div>
                <p className="text-[9px] text-gray-500 mt-0.5">180</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
              <Factory className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-gray-700">Secteur</div>
                <p className="text-[9px] text-gray-500 mt-0.5">Metal / Soudure / Fabrication</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
              <DollarSign className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-gray-700">CA annuel</div>
                <p className="text-[9px] text-gray-500 mt-0.5">35M$/an</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 mb-4">
            <div className="text-xs font-bold text-amber-700 mb-1.5">Problematique</div>
            <p className="text-[9px] text-amber-600">Robotisation production, penurie main-d'oeuvre (45 operateurs/quart)</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span>Budget: 950K$</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="font-mono text-[9px]">acier-plus.json</span>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 5 — Entreprises Quebec — Donnees Publiques */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800">Entreprises Quebec — Donnees Publiques</h3>
          <StatusBadge status="partiel" />
        </div>
        <p className="text-xs text-gray-400 mb-4">
          {ENTREPRISES_QC.length} profils entreprises reelles avec deep research files + mega-prompts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ENTREPRISES_QC.map((e) => (
            <Card key={e.nom} className="p-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-gray-800 truncate">{e.nom}</span>
                    {e.ticker && (
                      <code className="text-[9px] font-mono text-gray-400">{e.ticker}</code>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-500">{e.description}</span>
                    {e.employes !== "—" && (
                      <span className="text-[9px] text-gray-400">— {e.employes} employes</span>
                    )}
                  </div>
                </div>
                <StatusBadge status={e.status} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 6 — Integrateurs Simules */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800">Integrateurs Simules</h3>
          <StatusBadge status="complet" />
        </div>
        <p className="text-xs text-gray-400 mb-4">
          3 integrateurs fictifs pour les demos de matching Orbit9.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {INTEGRATEURS.map((integ) => (
            <Card key={integ.nom} className="p-0 overflow-hidden bg-white border border-gray-100 shadow-sm">
              <div className={cn("px-4 py-2.5", `bg-${integ.color}-100 border-b border-${integ.color}-200`)}>
                <div className="flex items-center justify-between">
                  <span className={cn("text-sm font-bold", `text-${integ.color}-800`)}>{integ.nom}</span>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                    `bg-${integ.color}-200 text-${integ.color}-800 border-${integ.color}-300`
                  )}>
                    Score {integ.score}
                  </span>
                </div>
                <div className={cn("text-[9px] mt-0.5 flex items-center gap-1", `text-${integ.color}-600`)}>
                  <MapPin className="h-3.5 w-3.5" />
                  {integ.localisation}
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="text-[9px] text-gray-600">{integ.personnes} personnes — {integ.experience}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="text-[9px] text-gray-600">{integ.specialites}</span>
                  </div>
                  {integ.projets && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="text-[9px] text-gray-600">{integ.projets} projets — {integ.approbation}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 7 — Scenarios de Demo Actifs */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-800">Scenarios de Demo Actifs</h3>
          <StatusBadge status="complet" />
        </div>
        <p className="text-xs text-gray-400 mb-4">
          {SCENARIOS.length} scenarios de demo disponibles dans scenarios/.
        </p>

        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[180px_1fr] gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Fichier</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Description</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {SCENARIOS.map((s) => (
              <div
                key={s.fichier}
                className="grid grid-cols-[180px_1fr] gap-2 px-4 py-2.5 items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                  <code className="text-xs font-mono text-violet-700">{s.fichier}</code>
                </div>
                <span className="text-xs text-gray-600">{s.description}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 8 — Cibles de Demo — A Monter */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Cibles de Demo — A Monter</h3>
        <p className="text-xs text-gray-400 mb-4">
          Segments de marche a preparer pour les futures demos.
        </p>

        <div className="space-y-3">
          {CIBLES.map((cible) => {
            const CIcon = cible.icon;
            return (
              <Card key={cible.titre} className="p-4 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <CIcon className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-gray-800">{cible.titre}</span>
                      <StatusBadge status="cible" />
                    </div>
                    <p className="text-xs text-gray-500">{cible.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 shrink-0" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 9 — Donnees Manquantes pour Demos */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Donnees Manquantes pour Demos</h3>
        <p className="text-xs text-gray-400 mb-4">
          Elements a collecter pour renforcer la credibilite des demos.
        </p>

        <Card className="p-4 bg-amber-50 border border-amber-200 shadow-sm">
          <div className="space-y-2">
            {DONNEES_MANQUANTES.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-xs text-amber-800">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* FOOTER — Quick Stats */}
      {/* ============================================================ */}
      <div className="border-t border-gray-100 pt-6 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Company Kits", value: "21", icon: FileText, color: "blue" },
            { label: "Scenarios", value: "13", icon: Eye, color: "violet" },
            { label: "Entreprises QC", value: "11", icon: Building2, color: "emerald" },
            { label: "Integrateurs", value: "3", icon: Layers, color: "amber" },
          ].map((stat) => {
            const SIcon = stat.icon;
            return (
              <Card key={stat.label} className="p-3 bg-white border border-gray-100 text-center">
                <SIcon className={cn("h-4 w-4 mx-auto mb-1.5", `text-${stat.color}-500`)} />
                <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">{stat.label}</div>
              </Card>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
