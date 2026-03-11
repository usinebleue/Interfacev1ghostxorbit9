/**
 * MasterStrategiePage.tsx — Vision & Strategie d'Affaires
 * MERGED page: Identite Produit, Strategie & Lancement, Pricing & Segments,
 * Projections, Concurrence.
 * 5 tabs: identite | strategie | pricing | projections | concurrence
 */

import { useState } from "react";
import {
  Rocket, Target, Users, TrendingUp, Zap, ArrowRight,
  Shield, DollarSign, Clock, CheckCircle2, Globe,
  Cpu, BarChart3, Network, Award,
  Layers, Star, ChevronRight, CircleDot,
  MessageSquare, Mic, Video, Monitor, Database,
  FileText, Phone, Settings, Brain, Crown, Building2,
  AlertTriangle, BookOpen, Briefcase,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { PageLayout } from "../layouts/PageLayout";
import { PageHeader } from "../layouts/PageHeader";
import { useFrameMaster } from "../../../context/FrameMasterContext";

// ======================================================================
// TABS
// ======================================================================

const tabs = [
  { id: "identite", label: "Identite Produit" },
  { id: "strategie", label: "Strategie & Lancement" },
  { id: "pricing", label: "Pricing & Segments" },
  { id: "projections", label: "Projections" },
  { id: "concurrence", label: "Concurrence" },
];

// ======================================================================
// DATA ARRAYS
// ======================================================================

const FEATURES = [
  { name: "LiveChat multi-bot", status: "live" as const, icon: MessageSquare },
  { name: "12 Bots C-Level", status: "live" as const, icon: Users },
  { name: "Voice pipeline (LiveKit)", status: "live" as const, icon: Mic },
  { name: "Video avatar (Tavus)", status: "live" as const, icon: Video },
  { name: "Canvas auto-nav", status: "live" as const, icon: Monitor },
  { name: "COMMAND Engine", status: "live" as const, icon: Zap },
  { name: "Mon Bureau (PostgreSQL)", status: "live" as const, icon: Database },
  { name: "Orbit9 Matching", status: "live" as const, icon: Globe },
  { name: "Decision Log", status: "live" as const, icon: FileText },
  { name: "Templates (141)", status: "live" as const, icon: Layers },
  { name: "Telephonie (Telnyx)", status: "en-cours" as const, icon: Phone },
  { name: "Auth JWT", status: "planifie" as const, icon: Shield },
  { name: "Multi-tenant", status: "planifie" as const, icon: Settings },
  { name: "Bot-to-Bot V2", status: "planifie" as const, icon: Brain },
];

const PRICING_FONDATEURS = [
  { plan: "CEO Solo", prix: "500$", cible: "Solopreneur, micro", inclus: "CarlOS seul, chat illimite, 1 carnet", color: "blue", icon: Star },
  { plan: "Direction", prix: "1,000$", cible: "PME 5-20 employes", inclus: "CarlOS + 2 C-Level au choix", color: "emerald", icon: Users },
  { plan: "C-Suite Complet", prix: "1,800$", cible: "PME 20-200", inclus: "6 bots complets, onboarding, priorite", color: "violet", icon: Crown, popular: true },
  { plan: "Enterprise", prix: "Sur mesure", cible: "200+ employes", inclus: "Multi-users, API, white-label", color: "gray", icon: Building2 },
  { plan: "Partner", prix: "299$", cible: "Experts, consultants", inclus: "Instance partenaire, matching", color: "amber", icon: Network },
];

const PRICING_V2 = [
  { plan: "Solo", prix: "699$/mois", color: "blue" },
  { plan: "Direction", prix: "1,499$/mois", color: "emerald" },
  { plan: "C-Suite", prix: "2,499$/mois", color: "violet" },
  { plan: "Partner", prix: "499$/mois", color: "amber" },
];

const ORBIT9_RABAIS = [
  { membres: 1, rabais: "0%" },
  { membres: 3, rabais: "-10%" },
  { membres: 5, rabais: "-15%" },
  { membres: 7, rabais: "-20%" },
  { membres: 9, rabais: "-25%" },
];

const PROJECTIONS = [
  {
    scenario: "Pessimiste", subtitle: "Le Prudent", color: "amber", icon: Shield,
    rows: [
      { year: "Y1", clients: "36", revenue: "557K$", profit: "221K$" },
      { year: "Y2", clients: "265", revenue: "1.86M$", profit: "840K$" },
      { year: "Y3", clients: "957", revenue: "5.96M$", profit: "2.96M$" },
      { year: "Y5", clients: "3,409", revenue: "15M$", profit: "---" },
    ],
    valuation: "150M$",
  },
  {
    scenario: "Realiste", subtitle: "Le Plan de Match", color: "emerald", icon: Target,
    rows: [
      { year: "Y1", clients: "62", revenue: "1.08M$", profit: "---" },
      { year: "Y2", clients: "700", revenue: "5.27M$", profit: "3.11M$" },
      { year: "Y3", clients: "3,000", revenue: "21.2M$", profit: "15.2M$" },
      { year: "Y5", clients: "9,500", revenue: "55M$", profit: "---" },
    ],
    valuation: "825M$",
  },
  {
    scenario: "Optimiste", subtitle: "Le Moonshot", color: "violet", icon: Rocket,
    rows: [
      { year: "Y1", clients: "---", revenue: "16.8M$", profit: "---" },
      { year: "Y2", clients: "---", revenue: "27.2M$", profit: "20M$" },
      { year: "Y3", clients: "---", revenue: "75M$", profit: "---" },
      { year: "Y5", clients: "50,000", revenue: "200M$", profit: "---" },
    ],
    valuation: "4G$",
  },
];

const FONDS_DATA = [
  { name: "CDPQ", aum: "517G$" },
  { name: "BDC", aum: "43G$" },
  { name: "Fonds FTQ", aum: "23G$" },
  { name: "Novacap", aum: "10.5G$" },
  { name: "IQ", aum: "7.5G$" },
  { name: "Claridge", aum: "5.25G$" },
  { name: "Fondaction", aum: "4.28G$" },
  { name: "CRCD", aum: "2.81G$" },
  { name: "Teralys", aum: "2.5G$" },
];

const RISKS = [
  {
    risk: "Responsabilite legale",
    probability: "Moyenne",
    impact: "Eleve",
    mitigation: "Clause de non-conseil, assurance E&O, disclaimers clairs. Les bots ne remplacent pas un avocat/comptable.",
    color: "red",
  },
  {
    risk: "Vie privee Loi 25",
    probability: "Haute",
    impact: "Eleve",
    mitigation: "Hebergement Quebec (OVH Montreal), consentement explicite, politique de retention, droit a l'oubli implemente.",
    color: "red",
  },
  {
    risk: "Dependance API (OpenAI, Google, Anthropic)",
    probability: "Moyenne",
    impact: "Moyen",
    mitigation: "Routage 5 tiers multi-fournisseur. 80% sur tiers gratuits. Migration possible en 48h si un provider tombe.",
    color: "amber",
  },
  {
    risk: "Cycle vente fonds trop long",
    probability: "Haute",
    impact: "Moyen",
    mitigation: "PME individuelles d'abord (cycle court). Les fonds = Phase 2-3, pas de dependance sur leur timing.",
    color: "amber",
  },
  {
    risk: "BigTech entre dans le marche PME",
    probability: "Faible",
    impact: "Eleve",
    mitigation: "GHML = moat proprietaire. Effets reseau Orbit9 = switching cost. Data specifique PME manufacturieres = inimitable.",
    color: "blue",
  },
];

const COMPETITORS_EXTENDED = [
  {
    name: "ChatGPT Enterprise",
    weakness: "30$/user/mois. Generique, 3.3% adoption reelle. Pas de multi-agent, pas de persona persistante, pas de reseau.",
    ghostx: "GHML = framework structure. 12 bots specialises. Trisociation. Memoire persistante. Orbit9 matching.",
  },
  {
    name: "Agentforce (Salesforce)",
    weakness: "550$/mois/role. Lock-in Salesforce. Necessite CRM existant. Pas de methodologie proprietaire.",
    ghostx: "Standalone. GHML proprietaire. Multi-departement. Pas de dependance ecosysteme.",
  },
  {
    name: "M365 Copilot (Microsoft)",
    weakness: "30$/user/mois. Productivite individuelle. Pas de strategie C-Level, pas de diagnostics sectoriels.",
    ghostx: "Intelligence decisionnelle. Benchmarks VITAA sectoriels. Scoring. Orbit9 reseau.",
  },
  {
    name: "C-Suite fractionnaire",
    weakness: "56-83K$ par poste/an (336K$/an x 6). Disponible sur RDV. Un seul cerveau a la fois. Turnover.",
    ghostx: "93% moins cher (24K$/an). 24/7. 6 cerveaux simultanes. Memoire permanente. Scaling infini.",
  },
  {
    name: "Consultants McKinsey-style",
    weakness: "50K-100K$ par mandat. Diagnostic ponctuel. Pas de suivi continu. Pas de scaling PME.",
    ghostx: "Diagnostic permanent + suivi quotidien. CREDO + Tableau Periodique = methodologie continue.",
  },
  {
    name: "ERP (SAP, Oracle, Dynamics)",
    weakness: "Implementation 6-18 mois. Gestion operationnelle seulement. 51% ont un ERP mais 3% 'completement connecte'.",
    ghostx: "Se superpose aux ERP existants. Intelligence C-Level immediate. Brise les silos sans migration.",
  },
];

const DRIVE_DOCS = [
  { name: "Bible Produit GhostX V2.1", section: "A-Bibles" },
  { name: "Roadmap V3.4", section: "A-Bibles" },
  { name: "Consolidation Chronologique BTML-GHML", section: "C-Consolidations" },
  { name: "Protocole CREDO 296 pages", section: "B-Protocoles" },
  { name: "Kit Sprint C Pioneer-Ready", section: "D-Sprints" },
  { name: "12 Profils Deep Search Ghosts", section: "E-Ghosts" },
  { name: "Audit Stress-Test Architecture", section: "F-Deep-Think" },
];

// ======================================================================
// HELPER COMPONENTS
// ======================================================================

function SectionDivider() {
  return <div className="border-t border-gray-100 pt-6 mt-6" />;
}

function FeatureStatusBadge({ status }: { status: "live" | "en-cours" | "planifie" }) {
  const config = {
    live: { label: "LIVE", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
    "en-cours": { label: "EN COURS", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
    planifie: { label: "PLANIFIE", bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  }[status];

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold", config.bg, config.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

// ======================================================================
// TAB 1 — Identite Produit
// ======================================================================

function TabIdentiteProduit() {
  return (
    <>
      {/* Identity Cards */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.3.1</span>
          Identite Produit
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              title: "CarlOS",
              subtitle: "CEO Bot",
              desc: "Instance personnelle du CEO. Orchestrateur chef d'equipe. Point d'entree unique vers les 12 C-Level.",
              color: "blue",
              icon: Brain,
            },
            {
              title: "GhostX",
              subtitle: "La marque",
              desc: "Gh(OS)T-X = formule chimique. La marque grand public. ghostx.ai. Le produit SaaS vendu aux PME.",
              color: "violet",
              icon: Zap,
            },
            {
              title: "GHML",
              subtitle: "Moteur proprietaire",
              desc: "Ghost Modeling Language. Framework qui modelise l'intelligence d'affaires comme la chimie modelise la matiere. Trisociation + CREDO + Tableau Periodique.",
              color: "emerald",
              icon: Cpu,
            },
            {
              title: "4 Skins",
              subtitle: "White-label",
              desc: "CarlOS (CEO personnel), GhostX Team (12 bots), Orbit9 (matching reseau), Expert Marketplace (consultants).",
              color: "amber",
              icon: Layers,
            },
          ].map((card) => {
            const CardIcon = card.icon;
            return (
              <Card key={card.title} className="p-4 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", `bg-${card.color}-100`)}>
                    <CardIcon className={cn("h-5 w-5", `text-${card.color}-600`)} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">{card.title}</div>
                    <div className={cn("text-[9px] font-bold uppercase tracking-wide mb-1", `text-${card.color}-500`)}>{card.subtitle}</div>
                    <p className="text-xs text-gray-600 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* 14 Features List */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.3.2</span>
          14 Features — Statut
        </h3>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {FEATURES.map((f) => {
              const FIcon = f.icon;
              return (
                <div key={f.name} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <FIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-700 flex-1">{f.name}</span>
                  <FeatureStatusBadge status={f.status} />
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <FeatureStatusBadge status="live" />
              <span className="text-[9px] text-gray-400">10 features</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FeatureStatusBadge status="en-cours" />
              <span className="text-[9px] text-gray-400">1 feature</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FeatureStatusBadge status="planifie" />
              <span className="text-[9px] text-gray-400">3 features</span>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ROI — Le Calcul qui Tue */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">C.4</span>
          ROI — Le Calcul qui Tue
        </h3>

        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 shadow-sm">
          <div className="text-center mb-4">
            <p className="text-sm font-medium text-gray-700 italic">
              "6 cerveaux C-Level 24/7 pour 6K-36K$/an vs 336K$ en fractionnaires"
            </p>
          </div>

          {/* Comparaison principale — 3 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-white rounded-lg border border-emerald-200 text-center">
              <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide mb-1">GhostX</div>
              <div className="text-lg font-bold text-emerald-600">6K - 36K$/an</div>
              <div className="text-[9px] text-gray-400">CEO Solo (500$/m) a C-Suite (1,800$/m + add-ons)</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-amber-200 text-center">
              <div className="text-[9px] font-bold text-amber-600 uppercase tracking-wide mb-1">C-Suite Fractionnaire</div>
              <div className="text-lg font-bold text-amber-600">336K - 500K$/an</div>
              <div className="text-[9px] text-gray-400">Comparaison realiste PME — 6 fractionnaires @ 56-83K$ chacun</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-red-200 text-center">
              <div className="text-[9px] font-bold text-red-500 uppercase tracking-wide mb-1">C-Suite Plein Temps</div>
              <div className="text-lg font-bold text-red-500">890K - 1.05M$/an</div>
              <div className="text-[9px] text-gray-400">6 cadres temps plein @ 148-175K$ + avantages sociaux</div>
            </div>
          </div>

          {/* ROI par rapport au fractionnaire */}
          <Card className="p-3 bg-blue-50 border-blue-200 mb-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-blue-700">312K$/an</div>
                <div className="text-[9px] text-blue-600">Economies vs fractionnaire</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-700">93%</div>
                <div className="text-[9px] text-blue-600">Reduction vs fractionnaire</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-700">14 ans</div>
                <div className="text-[9px] text-blue-600">Finance GhostX (312K/24K)</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-700">97%</div>
                <div className="text-[9px] text-blue-600">Reduction vs plein temps</div>
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>24/7 — Pas de vacances, pas de turnover, pas de politique interne</span>
          </div>
          <p className="text-[9px] text-gray-400 text-center mt-2 italic">Source: Deep Research Prompt 1 — 58 sources validees (mars 2026)</p>
        </Card>
      </div>

      <SectionDivider />

      {/* C.4.1 — ROI par Archetype Orbit9 (Prompt 3) */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-2">
          <span className="text-[9px] font-bold text-gray-400 mr-1">C.4.1</span>
          ROI par Archetype — 3 Scenarios Calibres
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Modelisation financiere par taille d'entreprise — archetypes Orbit9 V2.5 (34 sources)
        </p>

        <div className="space-y-4">
          {[
            {
              archetype: "A — TPE Innovatrice",
              taille: "10-25 employes",
              ca: "1.5 - 5M$",
              plan: "Pionnier (500$/m)",
              cout: "6 000$/an",
              roi: "100%",
              payback: "6 mois",
              impact: "92 400$",
              color: "emerald",
              profil: "Fondateur = PDG + CFO + CTO + CMO. 42% effectifs en R&D. Pilier Argent en zone ROUGE.",
              mecanisme: "Mode Primaire — execute les fonctions C-Level absentes. Recupere 12h/semaine strategiques au fondateur.",
              details: [
                "Economies honoraires externes : 12 000$/an (comptable + marketing)",
                "Temps strategique recupere : 86 400$/an (12h/sem × 150$ valeur nette × 48 sem)",
                "Infrastructure TI (MSP) : inchangee (24 000$/an — reste indispensable)",
              ],
            },
            {
              archetype: "B — PE Championne de Niche",
              taille: "50-100 employes",
              ca: "5 - 25M$",
              plan: "Croissance (1,995$/m)",
              cout: "23 940$/an",
              roi: "321%",
              payback: "2.8 mois",
              impact: "77 060$",
              color: "blue",
              profil: "43% CA en exportation. VP Finance et VP Operations en poste. Pas de CMO ni CTO dedies.",
              mecanisme: "Mode Calibrateur — brise les silos entre VP existants + comble CMO/CTO manquants via bots specialises.",
              details: [
                "Agence marketing internalisee : 30 000$/an (strategie par bot CMO, execution conservee)",
                "Consultation TI reduite : 26 000$/an (audits remplaces par bot CTO)",
                "Gains efficience (alignement TRS/CCC via VITAA) : 45 000$/an (reduction CNQ)",
              ],
            },
            {
              archetype: "C — MGE Integratrice",
              taille: "150-300 employes",
              ca: "25 - 75M$",
              plan: "Entreprise (2,995$/m)",
              cout: "35 940$/an",
              roi: "907%",
              payback: "1.2 mois",
              impact: "326 060$",
              color: "violet",
              profil: "100% exportation. CCC > 100 jours. Suite executive etablie mais saturee cognitivement.",
              mecanisme: "Mode Amplificateur — decuple la capacite analytique du CFO a 200K$/an. 12 bots interconnectes via GHML.",
              details: [
                "Embauches evitees (CMO + CSO) : 312 000$/an (2 postes × 120-130K$ + 30% charges)",
                "Mandats consultation Mid-Market evites : 50 000$/an (RCGT, MNP, BDC)",
                "Plateforme finance 10 ans d'utilisation sur 1 an d'economies",
              ],
            },
          ].map((s) => (
            <Card key={s.archetype} className={cn("p-4 bg-white border shadow-sm", `border-${s.color}-200`)}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-xs font-bold", `text-${s.color}-700`)}>{s.archetype}</span>
                    <span className="text-[9px] text-gray-400">{s.taille} | CA {s.ca}</span>
                  </div>
                  <div className="text-[9px] text-gray-500">{s.profil}</div>
                </div>
                <div className="text-right">
                  <div className={cn("text-lg font-bold", `text-${s.color}-600`)}>{s.roi}</div>
                  <div className="text-[9px] text-gray-400">ROI</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="p-2 bg-gray-50 rounded text-center">
                  <div className="text-xs font-bold text-gray-700">{s.plan}</div>
                  <div className="text-[9px] text-gray-400">{s.cout}</div>
                </div>
                <div className={cn("p-2 rounded text-center", `bg-${s.color}-50`)}>
                  <div className={cn("text-xs font-bold", `text-${s.color}-700`)}>Payback {s.payback}</div>
                  <div className="text-[9px] text-gray-400">Recuperation capital</div>
                </div>
                <div className="p-2 bg-emerald-50 rounded text-center">
                  <div className="text-xs font-bold text-emerald-700">+{s.impact}</div>
                  <div className="text-[9px] text-gray-400">Impact net annuel</div>
                </div>
              </div>

              <div className="text-[9px] text-gray-500 mb-2">
                <span className="font-bold">Trisociation :</span> {s.mecanisme}
              </div>

              <div className="space-y-1">
                {s.details.map((d, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", `text-${s.color}-400`)} />
                    <span className="text-[9px] text-gray-600">{d}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Coût d'opportunité PDG */}
        <Card className="mt-4 p-4 bg-amber-50 border border-amber-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-700">Le cout invisible — Deficit d'attention strategique du PDG</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
            <div className="text-center">
              <div className="text-sm font-bold text-amber-700">59h/sem</div>
              <div className="text-[9px] text-amber-600">Semaine du PDG PME (FCEI)</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-amber-700">20h/sem</div>
              <div className="text-[9px] text-amber-600">En taches palliatives (admin, TI, relance)</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-red-600">144K$/an</div>
              <div className="text-[9px] text-amber-600">Valeur strategique detruite</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-amber-700">&lt; 1 jour/sem</div>
              <div className="text-[9px] text-amber-600">Pour la reflexion strategique</div>
            </div>
          </div>
          <p className="text-[9px] text-amber-600 text-center italic">
            20h/sem × (225$/h valeur strategique - 75$/h valeur admin) × 48 sem = 144 000$/an de potentiel de croissance detruit
          </p>
        </Card>

        {/* Cas d'usage IA QC */}
        <Card className="mt-4 p-4 bg-blue-50 border border-blue-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-700">Preuves empiriques — IA manufacturiere QC (SCALE AI / IQ / FloatAI)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { entreprise: "Genius Solutions + 150 fabricants", resultat: "137M$ economies projetees", detail: "IA predictive dans ERP (stocks + soumissions auto)", source: "SCALE AI" },
              { entreprise: "Groupe ADF", resultat: "DIO et CCC optimises", detail: "12M$ projet — IA synchronise achats acier + calendriers production", source: "SCALE AI" },
              { entreprise: "NordFab (Projet SaCad)", resultat: "62 min → quelques minutes", detail: "Vision par ordi interprete croquis clients → devis + BOM + plans auto", source: "SCALE AI" },
              { entreprise: "Cohortes IQ (2019-2023)", resultat: "+44% productivite", detail: "PME ayant investi massivement avec appui Investissement Quebec", source: "IQ" },
              { entreprise: "Mic Metal (FloatAI)", resultat: "-50% temps reponse", detail: "Suivi client automatise par IA", source: "FloatAI" },
              { entreprise: "Protech Peinture (FloatAI)", resultat: "+32% efficacite", detail: "Planification de projets deleguee a un systeme intelligent", source: "FloatAI" },
            ].map((c, i) => (
              <div key={i} className="p-2 bg-white rounded border border-blue-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold text-gray-700">{c.entreprise}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{c.source}</span>
                </div>
                <div className="text-xs font-bold text-blue-700">{c.resultat}</div>
                <div className="text-[9px] text-gray-500">{c.detail}</div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-blue-500 text-center mt-2 italic">
            Source: Deep Research Prompt 3 — 34 sources validees (mars 2026)
          </p>
        </Card>
      </div>

      <SectionDivider />

      {/* Vue d'ensemble Quick Stats */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          Vue d'ensemble
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "TAM Quebec", value: "7,210", subtext: "Manuf. 10-499 emp", color: "blue" },
            { label: "TAM Canada", value: "26,500", subtext: "Manuf. 10-499 emp", color: "emerald" },
            { label: "TAM US", value: "143,028", subtext: "Manuf. 10-499 emp", color: "violet" },
            { label: "ARR moyen", value: "14.4K$", subtext: "Par client pondere", color: "amber" },
          ].map((stat) => (
            <Card key={stat.label} className="p-3 bg-white border border-gray-100 text-center">
              <div className={cn("text-lg font-bold", `text-${stat.color}-600`)}>{stat.value}</div>
              <div className="text-xs font-medium text-gray-700">{stat.label}</div>
              <div className="text-[9px] text-gray-400">{stat.subtext}</div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

// ======================================================================
// TAB 2 — Strategie & Lancement
// ======================================================================

function TabStrategieLancement() {
  return (
    <>
      {/* Vision Strategique */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.2.1</span>
          Vision Strategique
        </h3>

        <Card className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
          <div className="text-center mb-5">
            <p className="text-sm font-medium text-gray-700 italic leading-relaxed">
              "La chimie a son tableau periodique.
              <br />
              L'intelligence d'affaires a GHML."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-700">Mission</div>
                  <p className="text-xs text-gray-600 mt-0.5">Democratiser l'acces a l'intelligence C-Level pour les PME. Un C-Suite AI complet pour 3-5% du cout humain.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Globe className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-700">Marche</div>
                  <p className="text-xs text-gray-600 mt-0.5">PME manufacturieres — Quebec d'abord (REAI 130+ manufacturiers), puis expansion Canada, puis international.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-700">Avantage competitif</div>
                  <p className="text-xs text-gray-600 mt-0.5">GHML = framework proprietaire. Pas un chatbot generique. Trisociation + CREDO + Tableau Periodique = methodologie unique.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <DollarSign className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-700">Proposition de valeur</div>
                  <p className="text-xs text-gray-600 mt-0.5">6 cerveaux C-Level 24/7 pour 6K-36K$/an au lieu de 336K$ en fractionnaires (economies de 312K$/an validees).</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Strategie Suppliers First */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.2.2</span>
          Strategie "Suppliers First"
        </h3>

        <Card className="p-5 bg-white border border-gray-100 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <Network className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-800 mb-1">Cibler les integrateurs et fournisseurs EN PREMIER</div>
              <p className="text-xs text-gray-600">Effet reseau : chaque fournisseur connecte 5-10 PME clientes. Fournir l'arme, pas le soldat.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                title: "Effet multiplicateur",
                desc: "1 fournisseur = 5-10 PME clientes connectees. Entrer par le fournisseur pour atteindre son reseau.",
                icon: TrendingUp,
                color: "emerald",
              },
              {
                title: "Exclusivite sectorielle",
                desc: "UN leader par secteur. Si c'est pas toi, c'est ton competiteur. Urgence naturelle.",
                icon: Award,
                color: "amber",
              },
              {
                title: "Avantage du premier arrive",
                desc: "6 mois d'avance pendant lesquels tes bots apprennent ton business, ton reseau se construit.",
                icon: Zap,
                color: "blue",
              },
              {
                title: "Orbit9 = moteur de matching",
                desc: "Le reseau se construit organiquement. Chaque membre enrichit le matching pour les autres.",
                icon: CircleDot,
                color: "violet",
              },
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
                  <ItemIcon className={cn("h-4 w-4 mt-0.5 shrink-0", `text-${item.color}-500`)} />
                  <div>
                    <div className="text-xs font-bold text-gray-700">{item.title}</div>
                    <p className="text-[9px] text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Programme Pionniers (9 -> 81) */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.2.3</span>
          Programme Pionniers (9 vers 81)
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          3 phases de scaling : beta privee, referral, croissance organique.
        </p>

        <div className="space-y-4">
          {/* Phase 1 */}
          <Card className="p-0 overflow-hidden bg-white border border-gray-100 shadow-sm">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">
                  <span className="text-[9px] font-bold text-white/60 mr-1">B.2.3.1</span>
                  Phase 1 — 9 Pionniers Bleus
                </span>
                <Badge className="ml-auto bg-white/20 text-white border-white/30 text-[9px]">Beta Privee</Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wide mb-1">Selection</div>
                  <p className="text-xs text-gray-600">Manufacturiers REAI, $100K+ revenus, CEO engage</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wide mb-1">Accompagnement</div>
                  <p className="text-xs text-gray-600">Boost Camp 165 jours (VIST + JUAN + CPRJ)</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wide mb-1">Validation</div>
                  <p className="text-xs text-gray-600">Product-market fit, pricing, UX</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <span>Tournee du Baton de Pelerin — 30 jours chrono, 9 places, portes qui ferment</span>
              </div>
            </div>
          </Card>

          {/* Phase 2 */}
          <Card className="p-0 overflow-hidden bg-white border border-gray-100 shadow-sm">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">
                  <span className="text-[9px] font-bold text-white/60 mr-1">B.2.3.2</span>
                  Phase 2 — 81 Clients
                </span>
                <Badge className="ml-auto bg-white/20 text-white border-white/30 text-[9px]">9 x 9 Referres</Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {[
                  "Multi-tenant active — chaque pionnier a son instance",
                  "Bot-to-Bot collaboration entre instances",
                  "Marketplace operationnelle (Orbit9 matching)",
                  "Chaque pionnier refere 9 contacts qualifies",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-xs text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Phase 3 */}
          <Card className="p-0 overflow-hidden bg-white border border-gray-100 shadow-sm">
            <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">
                  <span className="text-[9px] font-bold text-white/60 mr-1">B.2.3.3</span>
                  Phase 3 — 729+ Scaling Organique
                </span>
                <Badge className="ml-auto bg-white/20 text-white border-white/30 text-[9px]">Ecosysteme</Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {[
                  "Auto-generation de bots specialises par industrie",
                  "Orbit9 matching automatique entre membres",
                  "Expert Marketplace (consultants, integrateurs, partenaires)",
                  "Expansion geographique hors Quebec",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <ChevronRight className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                    <span className="text-xs text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SectionDivider />

      {/* Boost Camp 3 Phases */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.2.4</span>
          Boost Camp — 3 Phases (165 jours)
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Protocole d'accompagnement intensif Usine Bleue pour chaque pionnier.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              phase: "VIST",
              duration: "15 jours",
              color: "amber",
              title: "Diagnostic",
              desc: "Diagnostic VITAA complet, Triangle du Feu, scoring initial. Comprendre ou en est le dirigeant.",
              items: ["Evaluation 5 piliers VITAA", "Profil Herrmann", "Triangle du Feu (BRULE/COUVE/MEURT)", "Scoring initial 0-100"],
            },
            {
              phase: "JUAN",
              duration: "45 jours",
              color: "blue",
              title: "Matching",
              desc: "Matching Orbit9, cellules de collaboration, trisociation. Connecter le dirigeant au reseau.",
              items: ["Matching Orbit9 scoring", "Cellules de collaboration", "Trisociation LiveKit (3 bots)", "Qualification pipeline 5 etapes"],
            },
            {
              phase: "CPRJ",
              duration: "105 jours",
              color: "emerald",
              title: "Execution",
              desc: "Cahier de projet, documents generes, livrables concrets. Produire des resultats tangibles.",
              items: ["Cahier de projet complet (S00-S05)", "Documents strategiques generes", "Plan d'action avec jalons", "KPIs mesurables"],
            },
          ].map((p) => (
            <Card key={p.phase} className="p-0 overflow-hidden bg-white border border-gray-100 shadow-sm">
              <div className={cn("px-4 py-2.5", `bg-${p.color}-100 border-b border-${p.color}-200`)}>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-bold", `text-${p.color}-800`)}>{p.phase}</span>
                  <span className={cn("text-[9px] font-medium", `text-${p.color}-600`)}>{p.duration}</span>
                </div>
                <div className={cn("text-xs font-medium mt-0.5", `text-${p.color}-700`)}>{p.title}</div>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-600 mb-3">{p.desc}</p>
                <div className="space-y-1.5">
                  {p.items.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <ArrowRight className={cn("h-3.5 w-3.5 shrink-0", `text-${p.color}-400`)} />
                      <span className="text-[9px] text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Modele Orbit9 Effet Reseau */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.2.5</span>
          Modele Orbit9 — Effet Reseau
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          9 cercles concentriques. Chaque niveau multiplie par 3. Anti-cartel integre.
        </p>

        <Card className="p-5 bg-white border border-gray-100 shadow-sm">
          {/* Concentric circles visualization */}
          <div className="flex items-center justify-center mb-5">
            <div className="flex items-center gap-1.5">
              {[
                { n: 1, label: "1" },
                { n: 2, label: "3" },
                { n: 3, label: "9" },
                { n: 4, label: "27" },
                { n: 5, label: "81" },
                { n: 6, label: "243" },
                { n: 7, label: "729" },
                { n: 8, label: "2187" },
                { n: 9, label: "6561" },
              ].map((circle, i) => (
                <div key={circle.n} className="flex items-center gap-1.5">
                  <div className={cn(
                    "rounded-full flex items-center justify-center font-bold border-2",
                    i < 2 ? "w-9 h-9 text-[9px] bg-blue-100 border-blue-300 text-blue-700" :
                    i < 4 ? "w-9 h-9 text-[9px] bg-emerald-100 border-emerald-300 text-emerald-700" :
                    i < 6 ? "w-9 h-9 text-[9px] bg-amber-100 border-amber-300 text-amber-700" :
                    "w-9 h-9 text-[9px] bg-violet-100 border-violet-300 text-violet-700"
                  )}>
                    {circle.label}
                  </div>
                  {i < 8 && (
                    <span className="text-[9px] text-gray-400 font-bold">x3</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1.5">
                <Layers className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-bold text-gray-700">Cellules de collaboration</span>
              </div>
              <p className="text-[9px] text-gray-500">Unite de base du reseau. 3-9 membres par cellule. Scoring automatique. Qualification en 5 etapes.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1.5">
                <Shield className="h-3.5 w-3.5 text-red-500" />
                <span className="text-xs font-bold text-gray-700">Anti-cartel integre</span>
              </div>
              <p className="text-[9px] text-gray-500">Pas de monopole sectoriel. Comparaison des specialites. Distribution equilibree du reseau.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-bold text-gray-700">Multiplication par 3</span>
              </div>
              <p className="text-[9px] text-gray-500">Chaque membre connecte 3 nouveaux. De 1 a 6561 en 9 niveaux. Croissance organique, pas forcee.</p>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Go-to-Market 3 phases */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.2.6</span>
          Go-to-Market — 3 Phases
        </h3>

        <div className="space-y-3">
          {[
            {
              phase: "Phase 1",
              title: "Pioneer Blitz (30 jours)",
              desc: "FOMO + exclusivite. 9 places seulement. Tournee du Baton de Pelerin. Chaque rencontre = 2h max. On signe ou on passe.",
              color: "blue",
              icon: Zap,
              metrics: ["9 places", "30 jours", "2h/rencontre"],
            },
            {
              phase: "Phase 2",
              title: "Effet Domino Orbit9",
              desc: "Croissance virale par le reseau. Chaque pionnier refere 9 contacts. CAC proche de 0$ via referral. Le produit se vend par les resultats.",
              color: "emerald",
              icon: Network,
              metrics: ["CAC ~0$", "9x referral", "Viral organique"],
            },
            {
              phase: "Phase 3",
              title: "Conquete des 9 Fonds",
              desc: "616G$ d'actifs sous gestion combines. CDPQ, BDC, Fonds FTQ, Novacap, IQ, Claridge, Fondaction, CRCD, Teralys. Chaque fonds = porte vers des milliers de PME.",
              color: "violet",
              icon: Building2,
              metrics: ["9 fonds", "616G$ AUM", "4000+ PME"],
            },
          ].map((p) => {
            const PIcon = p.icon;
            return (
              <Card key={p.phase} className="p-4 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", `bg-${p.color}-100`)}>
                    <PIcon className={cn("h-5 w-5", `text-${p.color}-600`)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[9px] font-bold uppercase tracking-wide", `text-${p.color}-500`)}>{p.phase}</span>
                      <span className="text-sm font-bold text-gray-800">{p.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{p.desc}</p>
                    <div className="flex items-center gap-3">
                      {p.metrics.map((m) => (
                        <span key={m} className={cn("text-[9px] font-medium px-2 py-0.5 rounded-full", `bg-${p.color}-50 text-${p.color}-600`)}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Footer key numbers */}
      <div className="border-t border-gray-100 pt-6 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Pionniers cibles", value: "9", subtext: "Beta privee", color: "blue" },
            { label: "Scaling cible", value: "81", subtext: "9 x 9 referres", color: "emerald" },
            { label: "Boost Camp", value: "165j", subtext: "VIST+JUAN+CPRJ", color: "amber" },
            { label: "Orbit9 max", value: "6561", subtext: "9 cercles x3", color: "violet" },
          ].map((stat) => (
            <Card key={stat.label} className="p-3 bg-white border border-gray-100 text-center">
              <div className={cn("text-lg font-bold", `text-${stat.color}-600`)}>{stat.value}</div>
              <div className="text-xs font-medium text-gray-700">{stat.label}</div>
              <div className="text-[9px] text-gray-400">{stat.subtext}</div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

// ======================================================================
// TAB 3 — Pricing & Segments
// ======================================================================

function TabPricingSegments() {
  return (
    <>
      {/* Tarifs Fondateurs V1 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.3.4</span>
          Pricing — Tarifs Fondateurs V1
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Prix de lancement pour les Pionniers Bleus. Verrouilles a vie.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {PRICING_FONDATEURS.filter((p) => p.plan !== "Enterprise" && p.plan !== "Partner").map((p) => {
            const PIcon = p.icon;
            return (
              <Card key={p.plan} className={cn("p-0 overflow-hidden bg-white border shadow-sm relative", p.popular ? "border-violet-300 ring-2 ring-violet-100" : "border-gray-100")}>
                {p.popular && (
                  <div className="bg-violet-500 text-white text-[9px] font-bold text-center py-1">POPULAIRE</div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", `bg-${p.color}-100`)}>
                      <PIcon className={cn("h-4 w-4", `text-${p.color}-600`)} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{p.plan}</div>
                      <div className="text-[9px] text-gray-400">{p.cible}</div>
                    </div>
                  </div>
                  <div className={cn("text-2xl font-bold mb-2", `text-${p.color}-600`)}>
                    {p.prix}<span className="text-xs font-normal text-gray-400">/mois</span>
                  </div>
                  <p className="text-xs text-gray-600">{p.inclus}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRICING_FONDATEURS.filter((p) => p.plan === "Enterprise" || p.plan === "Partner").map((p) => {
            const PIcon = p.icon;
            return (
              <Card key={p.plan} className="p-4 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", `bg-${p.color}-100`)}>
                    <PIcon className={cn("h-4 w-4", `text-${p.color}-600`)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">{p.plan}</span>
                      <span className={cn("text-sm font-bold", `text-${p.color}-600`)}>{p.prix}{p.plan === "Partner" ? "/mois" : ""}</span>
                    </div>
                    <div className="text-[9px] text-gray-400">{p.cible}</div>
                    <p className="text-xs text-gray-600 mt-1">{p.inclus}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* Add-ons */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.3.5</span>
          Add-ons
        </h3>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Bot additionnel", prix: "+195$/mois", desc: "Ajouter un C-Level supplementaire au forfait", icon: Brain, color: "violet" },
              { label: "Utilisateur supplementaire", prix: "+95$/mois", desc: "Acces multi-utilisateurs pour l'equipe", icon: Users, color: "blue" },
              { label: "Onboarding VIP", prix: "500$ (one-time)", desc: "Setup personnalise, import de donnees, formation", icon: Star, color: "amber" },
            ].map((addon) => {
              const AIcon = addon.icon;
              return (
                <div key={addon.label} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1.5">
                    <AIcon className={cn("h-3.5 w-3.5", `text-${addon.color}-500`)} />
                    <span className="text-xs font-bold text-gray-700">{addon.label}</span>
                  </div>
                  <div className={cn("text-sm font-bold mb-1", `text-${addon.color}-600`)}>{addon.prix}</div>
                  <p className="text-[9px] text-gray-500">{addon.desc}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Pricing V2 Regulier */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          Pricing V2 — Regulier (post-Pioneer)
        </h3>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRICING_V2.map((p) => (
              <div key={p.plan} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-bold text-gray-700 mb-1">{p.plan}</div>
                <div className={cn("text-lg font-bold", `text-${p.color}-600`)}>{p.prix}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Augmentation de 40% vs tarifs fondateurs — les pionniers gardent leur prix verrouille a vie</span>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Orbit9 Rabais Cercle */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.3.6</span>
          Pricing Orbit9 — Rabais Cercle
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Plus il y a de membres dans un cercle Orbit9, plus le rabais est grand. Prix plancher verrouille.
        </p>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            {ORBIT9_RABAIS.map((r) => (
              <div key={r.membres} className={cn(
                "flex-1 text-center p-3 rounded-lg border",
                r.membres === 9 ? "bg-violet-50 border-violet-200" : "bg-gray-50 border-gray-100"
              )}>
                <div className="text-lg font-bold text-gray-800">{r.membres}</div>
                <div className="text-[9px] text-gray-500 mb-1">membre{r.membres > 1 ? "s" : ""}</div>
                <div className={cn(
                  "text-sm font-bold",
                  r.membres === 9 ? "text-violet-600" :
                  r.membres >= 5 ? "text-emerald-600" :
                  r.membres >= 3 ? "text-blue-600" : "text-gray-400"
                )}>
                  {r.rabais}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-3.5 w-3.5 text-violet-500" />
              <span className="text-xs font-bold text-violet-700">Pioneer Package</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-violet-600">1,350$/mois</span>
              <span className="text-[9px] text-violet-500">verrouille a vie</span>
            </div>
            <div className="mt-2 space-y-1">
              {[
                "9 places seulement",
                "Ambassadeur Or — badge exclusif",
                "Commission 5% sur chaque referral",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                  <span className="text-[9px] text-violet-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Segments Clients 3 Niveaux */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          Segments Clients — 3 Niveaux
        </h3>

        <div className="space-y-3">
          {[
            {
              segment: "PME Individuelles",
              prix: "500-1,800$/mois",
              desc: "Coeur de cible. Manufacturiers 10-200 employes. CEO qui veut une equipe C-Level AI.",
              color: "blue",
              icon: Briefcase,
            },
            {
              segment: "Fonds d'investissement",
              prix: "10K-50K$/mois",
              desc: "9 fonds cibles totalisant 616G$ d'actifs sous gestion. Chaque fonds = porte vers des milliers de PME portfolio.",
              color: "emerald",
              icon: Building2,
              extra: FONDS_DATA,
            },
            {
              segment: "Reseau d'experts",
              prix: "Commission 15-20%",
              desc: "Consultants, integrateurs, partenaires. Instance Partner a 299$/mois. Commission sur matching Orbit9.",
              color: "violet",
              icon: Network,
            },
          ].map((seg) => {
            const SIcon = seg.icon;
            return (
              <Card key={seg.segment} className="p-4 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", `bg-${seg.color}-100`)}>
                    <SIcon className={cn("h-5 w-5", `text-${seg.color}-600`)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-800">{seg.segment}</span>
                      <span className={cn("text-sm font-bold", `text-${seg.color}-600`)}>{seg.prix}</span>
                    </div>
                    <p className="text-xs text-gray-600">{seg.desc}</p>
                    {seg.extra && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {seg.extra.map((f) => (
                          <span key={f.name} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[9px] font-medium text-emerald-700 border border-emerald-100">
                            {f.name} <span className="text-emerald-500">{f.aum}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* 4 Moteurs de Revenus */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          4 Moteurs de Revenus
        </h3>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-3">
            {[
              { moteur: "SaaS (abonnements)", pct: "~70%", desc: "Revenus recurrents mensuels. CEO Solo, Direction, C-Suite, Enterprise, Partner.", color: "bg-blue-500", width: "70%" },
              { moteur: "Performance Fees", pct: "~15%", desc: "Commission sur resultats mesurables. ROI tracking, KPI atteints, valeur creee.", color: "bg-emerald-500", width: "15%" },
              { moteur: "Expert Marketplace", pct: "~10%", desc: "Commission 15-20% sur matching Orbit9. Consultants, integrateurs, partenaires.", color: "bg-violet-500", width: "10%" },
              { moteur: "Data & Intelligence", pct: "~5%", desc: "Anonymized sector insights, benchmarks, rapport industrie. Valeur de la data agregee.", color: "bg-amber-500", width: "5%" },
            ].map((m) => (
              <div key={m.moteur}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-700">{m.moteur}</span>
                  <span className="text-xs font-bold text-gray-800">{m.pct}</span>
                </div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className={cn("h-full rounded-full", m.color)} style={{ width: m.width }} />
                  </div>
                </div>
                <p className="text-[9px] text-gray-500">{m.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

// ======================================================================
// TAB 4 — Projections
// ======================================================================

function TabProjections() {
  return (
    <>
      {/* TAM/SAM/SOM Defensible — Deep Research Prompt 5 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.3.7</span>
          TAM / SAM / SOM Defensible
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Calcul bottom-up rigoureux — 203 sources cumulees. Chaque chiffre avec source StatCan / US Census / ISQ.
        </p>

        {/* TAM by geography */}
        <Card className="p-4 bg-white border border-gray-100 shadow-sm mb-4">
          <div className="text-xs font-bold text-gray-700 mb-3">Marche Adressable Total (TAM) — Manufacturiers 10-499 employes</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { geo: "Quebec", count: "7,210", detail: "Petite (6,273) + Moyenne (937)", source: "StatCan juin 2024", color: "blue" },
              { geo: "Canada", count: "26,500", detail: "Expansion annee 2-3", source: "StatCan SCIAN 31-33", color: "emerald" },
              { geo: "Etats-Unis", count: "143,028", detail: "10-19: 49.7K / 20-49: 47.9K / 50-99: 22.7K / 100-249: 17.1K / 250-499: 5.5K", source: "US Census CBP 2022", color: "violet" },
            ].map((m) => (
              <div key={m.geo} className={`p-3 bg-${m.color}-50 rounded-lg border border-${m.color}-100`}>
                <div className={`text-lg font-bold text-${m.color}-600`}>{m.count}</div>
                <div className="text-xs font-bold text-gray-700">{m.geo}</div>
                <div className="text-[9px] text-gray-500 mt-1">{m.detail}</div>
                <div className="text-[8px] text-gray-400 mt-0.5 italic">{m.source}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* 3 Couches de revenus */}
        <Card className="p-4 bg-white border border-gray-100 shadow-sm mb-4">
          <div className="text-xs font-bold text-gray-700 mb-3">3 Couches de Revenus</div>
          <div className="space-y-3">
            {[
              { couche: "Couche 1 — PME Directes", desc: "ARR moyen 14.4K$/client (60% TPE x 6K + 30% PE x 24K + 10% MGE x 36K)", scenarios: "QC 15%: 15.56M$ / Canada 15%: 57M$ / NA 5%: 122M$", color: "blue" },
              { couche: "Couche 2 — Fonds d'investissement", desc: "5-25K$/mois par fonds. Effet multiplicateur: 50-200 PME acquises par contrat fonds.", scenarios: "5 fonds QC = 300K-1.5M$ ARR + acquisition indirecte massive Couche 1", color: "emerald" },
              { couche: "Couche 3 — Orbit9 Matching", desc: "Commission 3% sur jumelages technologiques. Investissement moyen 3.0M$/entreprise.", scenarios: "100 jumelages/an x 500K$ x 3% = 1.5M$ ARR additionnel", color: "violet" },
            ].map((c) => (
              <div key={c.couche} className={`p-3 bg-${c.color}-50 rounded-lg border border-${c.color}-100`}>
                <div className={`text-xs font-bold text-${c.color}-800`}>{c.couche}</div>
                <div className="text-[9px] text-gray-600 mt-1">{c.desc}</div>
                <div className="text-[9px] font-medium text-gray-500 mt-1">{c.scenarios}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* SOM Trajectoire */}
        <Card className="p-4 bg-white border border-gray-100 shadow-sm mb-4">
          <div className="text-xs font-bold text-gray-700 mb-3">SOM — Trajectoire Obtainable</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { year: "Annee 1", clients: "50 PME + 1 fonds", arr: "800K$", color: "blue" },
              { year: "Annee 2", clients: "200 PME + 3 fonds", arr: "3.2M$", color: "emerald" },
              { year: "Annee 3", clients: "500 PME + matching", arr: "8.5M$", color: "violet" },
            ].map((y) => (
              <div key={y.year} className={`p-3 bg-${y.color}-50 rounded-lg border border-${y.color}-100 text-center`}>
                <div className={`text-lg font-bold text-${y.color}-600`}>{y.arr}</div>
                <div className="text-xs font-bold text-gray-700">{y.year}</div>
                <div className="text-[9px] text-gray-500 mt-1">{y.clients}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Valorisation & Comparables */}
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="text-xs font-bold text-gray-700 mb-3">Multiples de Valorisation & Comparables IA</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {[
              { label: "SaaS mediane", value: "6.6-7.5x", desc: "EV/ARR public", color: "gray" },
              { label: "Vertical SaaS IA", value: "9-12x", desc: "Mediane (NRR>120%)", color: "emerald" },
              { label: "Top quartile IA", value: ">15x", desc: "Prime agentic AI", color: "violet" },
              { label: "CAGR segment", value: "13.9%", desc: "Analytique d'entreprise 2030", color: "blue" },
            ].map((m) => (
              <div key={m.label} className="p-2.5 bg-gray-50 rounded-lg text-center">
                <div className={`text-sm font-bold text-${m.color}-600`}>{m.value}</div>
                <div className="text-[9px] font-medium text-gray-700">{m.label}</div>
                <div className="text-[8px] text-gray-400">{m.desc}</div>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {[
              { name: "Aaru", detail: "Agents IA etudes de marche — 50M$ Serie A, valorisation 1G$" },
              { name: "Mercor", detail: "Recrutement IA — valorisation 2G$" },
              { name: "Ankar", detail: "Brevets IA (R&D) — 20M$ Serie A" },
              { name: "Kaaj", detail: "Credit PME IA agentique — analyse en 3 minutes" },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-xs text-gray-600">
                <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="font-bold text-gray-700">{c.name}:</span>
                <span>{c.detail}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs">
              <Award className="h-4 w-4 text-violet-500 shrink-0" />
              <span className="text-gray-600">
                <span className="font-bold text-violet-700">Categorie recommandee:</span> "Strategic AI Operating System for SMEs" — NI "CEO AI Assistant" NI "AI-powered ERP"
              </span>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Projections Financieres 3 Scenarios */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.3.8</span>
          Projections Financieres — 3 Scenarios
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Pessimiste, realiste, optimiste. Tous les scenarios montrent un business viable.
        </p>

        <div className="space-y-4">
          {PROJECTIONS.map((proj) => {
            const PIcon = proj.icon;
            return (
              <Card key={proj.scenario} className="p-0 overflow-hidden bg-white border border-gray-100 shadow-sm">
                <div className={cn("px-4 py-2.5 flex items-center gap-2", `bg-${proj.color}-100 border-b border-${proj.color}-200`)}>
                  <PIcon className={cn("h-4 w-4", `text-${proj.color}-600`)} />
                  <span className={cn("text-sm font-bold", `text-${proj.color}-800`)}>{proj.scenario}</span>
                  <span className={cn("text-[9px] font-medium", `text-${proj.color}-600`)}>{proj.subtitle}</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-500">Valuation Y5:</span>
                    <span className={cn("text-sm font-bold", `text-${proj.color}-700`)}>{proj.valuation}</span>
                  </div>
                </div>
                <div className="p-4">
                  {/* Table header */}
                  <div className="grid grid-cols-4 gap-2 mb-2 px-2">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Annee</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Clients</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Revenue</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Profit</span>
                  </div>
                  {/* Table rows */}
                  {proj.rows.map((row) => (
                    <div key={row.year} className="grid grid-cols-4 gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg transition-colors">
                      <span className={cn("text-xs font-bold", `text-${proj.color}-600`)}>{row.year}</span>
                      <span className="text-xs text-gray-700">{row.clients}</span>
                      <span className="text-xs font-medium text-gray-800">{row.revenue}</span>
                      <span className="text-xs text-gray-600">{row.profit}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* Potentiel Economique Orbit9 */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.3.9</span>
          Potentiel Economique Orbit9
        </h3>

        <Card className="p-5 bg-white border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-800">Cercle Type Metal Quebec</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">PME dans le cercle</span>
                  <span className="text-xs font-bold text-gray-800">9</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Connexions bot-to-bot</span>
                  <span className="text-xs font-bold text-gray-800">36</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Revenue par cercle</span>
                  <span className="text-xs font-bold text-blue-600">~16K$/mois</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-800">FTQ — Impact potentiel</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">PME dans le portfolio FTQ</span>
                  <span className="text-xs font-bold text-gray-800">4,000+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Impact economique potentiel</span>
                  <span className="text-xs font-bold text-emerald-600">366M$+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">AUM Fonds FTQ</span>
                  <span className="text-xs font-bold text-gray-800">23G$</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Unit Economics */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.3.10</span>
          Unit Economics
        </h3>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "CAC", value: "2,800$", desc: "Cout d'acquisition client", color: "blue" },
              { label: "LTV", value: "18,500$", desc: "Valeur vie client", color: "emerald" },
              { label: "LTV:CAC", value: "6.6x", desc: "Ratio sante", color: "violet" },
              { label: "Churn", value: "2%", desc: "Taux de depart mensuel", color: "amber" },
              { label: "ARR/client", value: "14,400$", desc: "Revenue annuel pondere", color: "emerald" },
              { label: "Payback", value: "3.2 mois", desc: "Temps de retour sur CAC", color: "blue" },
              { label: "Marge brute", value: "94-95%", desc: "SaaS margins superieure", color: "violet" },
              { label: "Cout API", value: "20-30$/mois", desc: "Par client (routage 5 tiers)", color: "amber" },
            ].map((metric) => (
              <div key={metric.label} className="p-3 bg-gray-50 rounded-lg text-center">
                <div className={cn("text-lg font-bold", `text-${metric.color}-600`)}>{metric.value}</div>
                <div className="text-xs font-medium text-gray-700">{metric.label}</div>
                <div className="text-[9px] text-gray-400">{metric.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Burn Rate */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.3.11</span>
          Burn Rate — Situation actuelle
        </h3>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Burn mensuel", value: "85K$", color: "red", icon: TrendingUp },
              { label: "Cash disponible", value: "420K$", color: "emerald", icon: DollarSign },
              { label: "Runway", value: "4.9 mois", color: "amber", icon: Clock },
              { label: "MRR", value: "12,450$", color: "blue", icon: BarChart3 },
            ].map((item) => {
              const BIcon = item.icon;
              return (
                <div key={item.label} className="p-3 bg-gray-50 rounded-lg text-center">
                  <BIcon className={cn("h-4 w-4 mx-auto mb-1.5", `text-${item.color}-500`)} />
                  <div className={cn("text-lg font-bold", `text-${item.color}-600`)}>{item.value}</div>
                  <div className="text-xs font-medium text-gray-700">{item.label}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>MRR en croissance +96% QoQ — objectif breakeven dans 4-6 mois</span>
          </div>
        </Card>
      </div>
    </>
  );
}

// ======================================================================
// TAB 5 — Concurrence
// ======================================================================

function TabConcurrence() {
  return (
    <>
      {/* Avantages Competitifs — Le Moat */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.3.12</span>
          Avantages Competitifs — Le Moat
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          4 couches de protection. Chaque couche renforce les autres.
        </p>

        <div className="space-y-3">
          {[
            {
              layer: "Couche 1",
              title: "GHML Framework",
              desc: "Methodologie proprietaire. Trisociation + CREDO + Tableau Periodique + 220 elements. Impossible a reproduire sans des annees de R&D.",
              color: "blue",
              icon: Cpu,
            },
            {
              layer: "Couche 2",
              title: "Network Effects (Orbit9)",
              desc: "Chaque nouveau membre enrichit le reseau pour tous. Matching scoring ameliore avec la data. Switching cost augmente avec le temps.",
              color: "emerald",
              icon: Network,
            },
            {
              layer: "Couche 3",
              title: "Data Moat",
              desc: "Donnees proprietaires PME manufacturieres Quebec. Benchmarks sectoriels. Intelligence d'affaires agregee. Plus de data = meilleurs bots.",
              color: "violet",
              icon: Database,
            },
            {
              layer: "Couche 4",
              title: "Distribution (REAI + Fonds)",
              desc: "Acces direct a 130+ manufacturiers REAI. Pipeline vers 9 fonds (616G$ AUM). Canal de distribution inimitable.",
              color: "amber",
              icon: Globe,
            },
          ].map((moat) => {
            const MIcon = moat.icon;
            return (
              <Card key={moat.layer} className="p-4 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", `bg-${moat.color}-100`)}>
                    <MIcon className={cn("h-5 w-5", `text-${moat.color}-600`)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[9px] font-bold uppercase tracking-wide", `text-${moat.color}-500`)}>{moat.layer}</span>
                      <span className="text-sm font-bold text-gray-800">{moat.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{moat.desc}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* Competitors Comparison (short) */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.2.7</span>
          Concurrence & Differenciation
        </h3>

        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[120px_1fr_1fr] gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Competiteur</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Leur approche</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Avantage GhostX</span>
          </div>

          <div className="divide-y divide-gray-50">
            {[
              {
                competitor: "ChatGPT Enterprise",
                their: "30$/user/mois. Chat generique, 3.3% adoption par les employes. Pas de multi-agent ni framework.",
                ours: "GHML = framework structure, Trisociation, CREDO, 12 bots specialises, adoption dirigee.",
              },
              {
                competitor: "Agentforce (SF)",
                their: "550$/mois/role. Lock-in Salesforce. Necessites donnees CRM existantes. Pas de methodologie.",
                ours: "Standalone. Methodologie GHML proprietaire. Multi-departement. Pas de lock-in ecosysteme.",
              },
              {
                competitor: "Consultants",
                their: "Fractionnaires: 56-83K$/poste/an. RDV seulement. Turnover. Un seul cerveau a la fois.",
                ours: "6K-36K$/an = 6 cerveaux simultanement. 24/7. Memoire persistante. Scaling infini.",
              },
              {
                competitor: "M365 Copilot",
                their: "30$/user/mois. Productivite individuelle. Pas de strategie C-Level ni reseau d'affaires.",
                ours: "Intelligence decisionnelle. Diagnostic, Orbit9 matching, scoring sectoriel.",
              },
              {
                competitor: "ERP / CRM",
                their: "Gestion operationnelle. Implementation 6-18 mois. Pas d'intelligence decisionnelle.",
                ours: "Intelligence C-Level immediate. Se superpose aux ERP existants comme couche strategie.",
              },
            ].map((row) => (
              <div
                key={row.competitor}
                className="grid grid-cols-[120px_1fr_1fr] gap-2 px-4 py-3 items-start hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-bold text-gray-800">{row.competitor}</span>
                <div className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                  <span className="text-xs text-gray-500">{row.their}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-700 font-medium">{row.ours}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Extended Competitors */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.3.13</span>
          Analyse Etendue des Competiteurs
        </h3>

        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[140px_1fr_1fr] gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Competiteur</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Faiblesse</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Avantage GhostX</span>
          </div>

          <div className="divide-y divide-gray-50">
            {COMPETITORS_EXTENDED.map((row) => (
              <div
                key={row.name}
                className="grid grid-cols-[140px_1fr_1fr] gap-2 px-4 py-3 items-start hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-bold text-gray-800">{row.name}</span>
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-500">{row.weakness}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-700 font-medium">{row.ghostx}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* Risques & Mitigations */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">B.3.14</span>
          Risques & Mitigations
        </h3>

        <div className="space-y-3">
          {RISKS.map((risk) => (
            <Card key={risk.risk} className="p-4 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  risk.color === "red" ? "bg-red-100" :
                  risk.color === "amber" ? "bg-amber-100" : "bg-blue-100"
                )}>
                  <AlertTriangle className={cn(
                    "h-4 w-4",
                    risk.color === "red" ? "text-red-500" :
                    risk.color === "amber" ? "text-amber-500" : "text-blue-500"
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-800">{risk.risk}</span>
                    <Badge className={cn(
                      "text-[9px]",
                      risk.probability === "Haute" ? "bg-red-100 text-red-700 border-red-200" :
                      risk.probability === "Moyenne" ? "bg-amber-100 text-amber-700 border-amber-200" :
                      "bg-blue-100 text-blue-700 border-blue-200"
                    )}>
                      P: {risk.probability}
                    </Badge>
                    <Badge className={cn(
                      "text-[9px]",
                      risk.impact === "Eleve" ? "bg-red-100 text-red-700 border-red-200" :
                      "bg-amber-100 text-amber-700 border-amber-200"
                    )}>
                      I: {risk.impact}
                    </Badge>
                  </div>
                  <div className="flex items-start gap-1.5 mt-1.5">
                    <Shield className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-600">{risk.mitigation}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Documents Source sur Drive */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">
          Documents Source sur Drive
        </h3>

        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="space-y-2">
            {DRIVE_DOCS.map((doc) => (
              <div key={doc.name} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <BookOpen className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-700 flex-1">{doc.name}</span>
                <span className="text-[9px] text-gray-400 font-medium">{doc.section}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

// ======================================================================
// MAIN COMPONENT
// ======================================================================

export function MasterStrategiePage() {
  const { setActiveView } = useFrameMaster();
  const [tab, setTab] = useState("identite");

  return (
    <PageLayout
      maxWidth="4xl"
      showPresence={false}
      header={
        <PageHeader
          icon={Rocket}
          iconColor="text-red-600"
          title="Vision & Strategie d'Affaires"
          subtitle="Identite produit, strategie, pricing, projections, concurrence"
          onBack={() => setActiveView("dashboard")}
          rightSlot={
            <>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    tab === t.id
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </>
          }
        />
      }
    >
      {tab === "identite" && <TabIdentiteProduit />}
      {tab === "strategie" && <TabStrategieLancement />}
      {tab === "pricing" && <TabPricingSegments />}
      {tab === "projections" && <TabProjections />}
      {tab === "concurrence" && <TabConcurrence />}
    </PageLayout>
  );
}
