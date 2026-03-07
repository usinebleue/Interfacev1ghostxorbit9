/**
 * MasterParcoursPage.tsx — Parcours Client
 * Complete customer journey from first minute to 150+ AI agents.
 * CarlOS GPS philosophy vs conventional AI tools.
 * Single scrollable page (no tabs): GPS Philosophy, 4 Starting Points, 7 Steps, Metrics, Uniqueness.
 */

import {
  Route, Navigation, Compass, MapPin, User, Users, Building2, Rocket,
  Target, CheckCircle2, ArrowRight, Star, Trophy, Brain, Zap, Clock,
  TrendingUp, DollarSign, Shield, Layers, GitBranch, Play, Flag,
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

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

// ======================================================================
// DATA — Comparison Table
// ======================================================================

const COMPARISON_ROWS = [
  { aspect: "Interaction", conventional: "Questions ponctuelles", carlos: "Track de developpement continu" },
  { aspect: "Contexte", conventional: "Reset a chaque conversation", carlos: "Memoire persistante + SOUL files" },
  { aspect: "Output", conventional: "Reponses generiques", carlos: "Actions structurees CREDO" },
  { aspect: "Equipe", conventional: "1 assistant generaliste", carlos: "12+ agents C-Level specialises" },
  { aspect: "Progression", conventional: "Aucune", carlos: "Idees → Projets → Pipeline → Resultats" },
  { aspect: "Gouvernance", conventional: "Aucune", carlos: "Orbit9, TimeTokens, decisions tracees" },
  { aspect: "Donnees", conventional: "Generiques", carlos: "Kits entreprise + donnees terrain" },
];

// ======================================================================
// DATA — 4 Starting Points
// ======================================================================

interface StartingPoint {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  situation: string;
  premierContact: string;
  carlosActive: string;
  parcours: string;
  duree: string;
  agents: string;
}

const STARTING_POINTS: StartingPoint[] = [
  {
    id: "A",
    title: "Pigiste Solo / Solopreneur",
    icon: User,
    color: "blue",
    situation: "1 personne, idees en vrac, pas de structure",
    premierContact: "Diagnostic VITAA rapide (5 piliers: Vente, Idee, Temps, Argent, Actif)",
    carlosActive: "BCO (CEO) + BCM (Marketing) + BCF (Finance)",
    parcours: "Structurer les idees → Valider le modele → Premier pipeline → Premiers clients",
    duree: "0 → productif en ~2 semaines",
    agents: "3-5 agents actifs",
  },
  {
    id: "B",
    title: "CEO d'une Startup",
    icon: Rocket,
    color: "emerald",
    situation: "Equipe de 5-20, produit en construction, cash limite",
    premierContact: "Diagnostic complet + Boost Camp Phase 1 (VIST 15 jours)",
    carlosActive: "Toute la GhostX Team (12 C-Level)",
    parcours: "Audit VIST → Jumelage (JUAN 45 jours) → Cahier de projet (CPRJ 105 jours)",
    duree: "0 → autonome en ~3 mois",
    agents: "12 agents + integrateurs matches",
  },
  {
    id: "C",
    title: "CEO d'une Scale-up",
    icon: Building2,
    color: "violet",
    situation: "50-200 employes, croissance, complexite qui explose",
    premierContact: "Diagnostic multi-departemental + Orbit9 Matching",
    carlosActive: "12 C-Level + agents sectoriels par departement",
    parcours: "Audit par departement → Cellules Orbit9 → Pipeline multi-projets → Gouvernance CA",
    duree: "0 → structure en ~2 mois",
    agents: "50-80 agents (12 C-Level + specialistes par departement)",
  },
  {
    id: "D",
    title: "CEO d'un Exit-up",
    icon: Trophy,
    color: "amber",
    situation: "Entreprise mature, preparation vente/succession",
    premierContact: "Audit de valorisation + Due diligence IA",
    carlosActive: "BCF (Finance) + BLE (Legal) + BCS (Strategie) prioritaires",
    parcours: "Valorisation → Nettoyage operations → Data room → Matching acheteurs",
    duree: "0 → exit-ready en ~6 mois",
    agents: "80-150+ agents (full enterprise stack)",
  },
];

// ======================================================================
// DATA — 7 Universal Steps
// ======================================================================

interface JourneyStep {
  id: number;
  timing: string;
  label: string;
  description: string;
  details: string[];
  icon: React.ElementType;
  color: string;
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: 1,
    timing: "MINUTE 0-5",
    label: "Connexion",
    description: "Login → CarlOS accueille → Diagnostic express VITAA",
    details: [
      "\"Salut! Raconte-moi ton entreprise en 3 phrases.\"",
    ],
    icon: Play,
    color: "blue",
  },
  {
    id: 2,
    timing: "JOUR 1",
    label: "Cartographie",
    description: "Score VITAA (5 piliers 0-100) + Triangle du Feu",
    details: [
      "Score VITAA (5 piliers 0-100)",
      "Triangle du Feu: BRULE / COUVE / MEURT",
      "CarlOS propose un plan d'action",
    ],
    icon: Compass,
    color: "blue",
  },
  {
    id: 3,
    timing: "SEMAINE 1",
    label: "Premiers Resultats",
    description: "Idees structurees, premier projet lance, premier diagnostic",
    details: [
      "2-3 idees structurees dans Mon Bureau",
      "Premier projet lance avec pipeline",
      "1 diagnostic departement complete",
    ],
    icon: Zap,
    color: "emerald",
  },
  {
    id: 4,
    timing: "MOIS 1",
    label: "Ecosysteme Actif",
    description: "12 departements C-Level actifs, chantiers en cours, jumelage Orbit9",
    details: [
      "12 departements C-Level actifs",
      "Chantiers en cours avec missions assignees",
      "Jumelage Orbit9 en cours (matching integrateurs)",
      "Board Room pour decisions strategiques",
    ],
    icon: Users,
    color: "emerald",
  },
  {
    id: 5,
    timing: "MOIS 3",
    label: "Pipeline Complet",
    description: "Boost Camp Phase 1+2, Cellules Orbit9, Templates actifs",
    details: [
      "Boost Camp Phase 1+2 completees (VIST + JUAN)",
      "Cellules Orbit9 formees",
      "Templates et playbooks actifs",
      "Think Room + War Room utilisees regulierement",
    ],
    icon: TrendingUp,
    color: "violet",
  },
  {
    id: 6,
    timing: "MOIS 6",
    label: "Autonomie",
    description: "50+ agents actifs, gouvernance automatisee, COMMAND Protocol",
    details: [
      "50+ agents actifs par departement",
      "Gouvernance automatisee (decisions tracees, tensions resolues)",
      "COMMAND Protocol actif (CarlOS compile et livre automatiquement)",
      "Cahier de projet (CPRJ) livre",
    ],
    icon: Shield,
    color: "amber",
  },
  {
    id: 7,
    timing: "MOIS 12+",
    label: "Full Enterprise",
    description: "150+ agents IA, Bot-to-Bot, Marketplace, TimeTokens",
    details: [
      "150+ agents IA specialises",
      "Bot-to-Bot communication (COMMAND cross-tenant)",
      "Marketplace active (experts, integrateurs, fournisseurs)",
      "TimeTokens pour collaboration inter-entreprises",
      "Auto-generation de nouveaux agents via GHML",
    ],
    icon: Star,
    color: "red",
  },
];

// ======================================================================
// DATA — Metrics
// ======================================================================

const METRICS = [
  { label: "Score VITAA global", value: "0-500", icon: Target, color: "blue" },
  { label: "Idees → projets convertis", value: "Ratio", icon: GitBranch, color: "emerald" },
  { label: "Pipeline actif", value: "$ en cours", icon: DollarSign, color: "violet" },
  { label: "Decisions prises", value: "Journal", icon: Flag, color: "amber" },
  { label: "Agents actifs / dept", value: "Count", icon: Brain, color: "red" },
  { label: "Temps economise", value: "h/sem", icon: Clock, color: "orange" },
  { label: "ROI mesure", value: "x Return", icon: TrendingUp, color: "emerald" },
];

// ======================================================================
// DATA — Uniqueness (5 differentiators)
// ======================================================================

interface Differentiator {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const DIFFERENTIATORS: Differentiator[] = [
  {
    title: "CREDO Protocol",
    description: "Chaque interaction suit C→R→E→D→O — structure commerciale integree. Pas de conversation sans direction.",
    icon: Navigation,
    color: "blue",
  },
  {
    title: "Trisociation\u2122",
    description: "Chaque bot combine 3 modeles mentaux de grands leaders. Bezos + Munger + Churchill = CarlOS CEO.",
    icon: Brain,
    color: "violet",
  },
  {
    title: "Orbit9 Governance",
    description: "Holacracy + Slicing Pie + GHML = gouvernance dynamique. Anti-cartel integre, matching automatique.",
    icon: Layers,
    color: "emerald",
  },
  {
    title: "Mine d'Or integree",
    description: "296 pages de formation CREDO + templates + processus reels. Pas de la theorie — des playbooks terrains.",
    icon: Star,
    color: "amber",
  },
  {
    title: "12 → 150+ agents",
    description: "Architecture qui scale de solo a enterprise sans refonte. Auto-generation via GHML.",
    icon: Rocket,
    color: "red",
  },
];

// ======================================================================
// MAIN COMPONENT
// ======================================================================

export function MasterParcoursPage() {
  const { setActiveView } = useFrameMaster();

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Route}
          iconColor="text-teal-600"
          title="Parcours Client"
          subtitle="De la premiere minute a 150+ agents IA — GPS d'affaires CarlOS"
          onBack={() => setActiveView("dashboard")}
        />
      }
    >
      {/* ============================================================ */}
      {/* SECTION 1 — Philosophie CarlOS GPS */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Philosophie CarlOS GPS</h3>

        <Card className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 shadow-lg mb-5">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Navigation className="h-4 w-4 text-teal-400" />
              <span className="text-[9px] font-bold text-teal-400 uppercase tracking-widest">Principe Fondateur</span>
            </div>
            <p className="text-base font-bold text-white leading-relaxed">
              "CarlOS n'est pas un chatbot.
              <br />
              C'est un GPS d'affaires."
            </p>
            <p className="text-xs text-gray-400 mt-3 max-w-lg mx-auto leading-relaxed">
              Le client est TOUJOURS sur une track de developpement. Pas de conversation sans contexte.
              Chaque interaction fait avancer un projet, une idee, ou un diagnostic.
              CarlOS guide, structure, et livre — comme un GPS qui recalcule la route quand tu devies.
            </p>
          </div>
        </Card>

        {/* Comparison Table */}
        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[120px_1fr_1fr] gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Aspect</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">ChatGPT / Copilot</span>
            <span className="text-[9px] font-bold text-teal-600 uppercase tracking-wide">CarlOS GPS</span>
          </div>

          <div className="divide-y divide-gray-50">
            {COMPARISON_ROWS.map((row) => (
              <div
                key={row.aspect}
                className="grid grid-cols-[120px_1fr_1fr] gap-2 px-4 py-3 items-start hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-bold text-gray-800">{row.aspect}</span>
                <div className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                  <span className="text-xs text-gray-500">{row.conventional}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-700 font-medium">{row.carlos}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 2 — Les 4 Points de Depart */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Les 4 Points de Depart</h3>
        <p className="text-xs text-gray-400 mb-4">
          4 profils de dirigeants, 4 parcours adaptes. CarlOS s'ajuste au stade de l'entreprise.
        </p>

        <div className="space-y-4">
          {STARTING_POINTS.map((sp) => {
            const SpIcon = sp.icon;
            return (
              <Card
                key={sp.id}
                className={cn(
                  "p-0 overflow-hidden bg-white shadow-sm",
                  `border-l-4 border-${sp.color}-400 border-t border-r border-b border-t-gray-100 border-r-gray-100 border-b-gray-100`
                )}
              >
                {/* Header */}
                <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-50">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    `bg-${sp.color}-100`
                  )}>
                    <SpIcon className={cn("h-4 w-4", `text-${sp.color}-600`)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 border",
                        `bg-${sp.color}-50 text-${sp.color}-700 border-${sp.color}-200`
                      )}>
                        {sp.id}
                      </Badge>
                      <span className="text-sm font-bold text-gray-800">{sp.title}</span>
                    </div>
                  </div>
                  <Badge className="text-[9px] bg-gray-100 text-gray-500 border-gray-200">{sp.agents}</Badge>
                </div>

                {/* Body */}
                <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2.5">
                    <div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Situation</div>
                      <p className="text-xs text-gray-600">{sp.situation}</p>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Premier Contact</div>
                      <p className="text-xs text-gray-600">{sp.premierContact}</p>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">CarlOS Active</div>
                      <p className="text-xs text-gray-600">{sp.carlosActive}</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Parcours</div>
                      <p className="text-xs text-gray-600">{sp.parcours}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="text-xs font-medium text-gray-700">{sp.duree}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 3 — Le Parcours Universel — 7 Etapes */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Le Parcours Universel — 7 Etapes</h3>
        <p className="text-xs text-gray-400 mb-4">
          De la premiere minute a l'entreprise full AI. Chaque etape construit sur la precedente.
        </p>

        {/* Vertical timeline */}
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-gray-200" />

          <div className="space-y-0">
            {JOURNEY_STEPS.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="relative">
                  <div className="flex items-start gap-4 py-3">
                    {/* Dot */}
                    <div className="relative z-10 mt-1">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm",
                        `bg-${step.color}-500`
                      )}>
                        <span className="text-white font-bold text-[9px]">{step.id}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <Card className="p-4 bg-white border border-gray-100 shadow-sm">
                        {/* Step header */}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 border",
                            `bg-${step.color}-50 text-${step.color}-700 border-${step.color}-200`
                          )}>
                            {step.timing}
                          </Badge>
                          <StepIcon className={cn("h-4 w-4 shrink-0", `text-${step.color}-500`)} />
                          <span className="text-sm font-bold text-gray-800">{step.label}</span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-600 mb-2">{step.description}</p>

                        {/* Details */}
                        <div className="space-y-1">
                          {step.details.map((d, di) => (
                            <div key={di} className="flex items-start gap-1.5">
                              <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0 mt-0.5" />
                              <span className="text-[9px] text-gray-500">{d}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 4 — Metriques de Progression */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Metriques de Progression</h3>
        <p className="text-xs text-gray-400 mb-4">
          Ce qui est mesure a chaque etape. Progression visible, pas abstraite.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {METRICS.map((m) => {
            const MIcon = m.icon;
            return (
              <Card key={m.label} className="p-3 bg-white border border-gray-100 text-center">
                <MIcon className={cn("h-4 w-4 mx-auto mb-1.5", `text-${m.color}-500`)} />
                <div className="text-sm font-bold text-gray-800">{m.value}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-wide">{m.label}</div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* ============================================================ */}
      {/* SECTION 5 — Ce qui rend CarlOS unique */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Ce qui rend CarlOS unique</h3>
        <p className="text-xs text-gray-400 mb-4">
          5 avantages structurels qu'aucun chatbot generique ne peut reproduire.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DIFFERENTIATORS.map((diff) => {
            const DiffIcon = diff.icon;
            return (
              <Card key={diff.title} className="p-4 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    `bg-${diff.color}-100`
                  )}>
                    <DiffIcon className={cn("h-4 w-4", `text-${diff.color}-600`)} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800 mb-1">{diff.title}</div>
                    <p className="text-[9px] text-gray-500 leading-relaxed">{diff.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* FOOTER — Key Numbers */}
      {/* ============================================================ */}
      <div className="border-t border-gray-100 pt-6 mt-6">
        <Card className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
          <div className="text-center mb-4">
            <div className="text-[9px] font-bold text-teal-600 uppercase tracking-widest mb-1">Parcours Complet</div>
            <p className="text-sm font-bold text-gray-800">De 0 a Full Enterprise en 12 mois</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Minute 5", value: "Diagnostic", subtext: "Score VITAA", color: "blue" },
              { label: "Semaine 1", value: "Premiers resultats", subtext: "Idees structurees", color: "emerald" },
              { label: "Mois 1", value: "Ecosysteme", subtext: "12 depts actifs", color: "violet" },
              { label: "Mois 6", value: "Autonomie", subtext: "50+ agents", color: "amber" },
              { label: "Mois 12+", value: "Full Enterprise", subtext: "150+ agents", color: "red" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={cn("text-sm font-bold", `text-${stat.color}-600`)}>{stat.value}</div>
                <div className="text-xs font-medium text-gray-700">{stat.label}</div>
                <div className="text-[9px] text-gray-400">{stat.subtext}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
