/**
 * MasterHydroQuebecPage.tsx — Strategie Hydro-Quebec x Efficience Energetique x IA
 * Source: Bible-GHML-V2 Section 9.6 + Prompt 7 Deep Research (Bloc 3 Transition Energetique)
 * Master GHML — Session 48 + Enrichissement Session 49
 */

import {
  Zap, Building2, Leaf, BarChart3, Users, Target,
  TrendingUp, Settings, ArrowRight, DollarSign,
  Lightbulb, Layers, AlertTriangle, Globe,
  Thermometer, Factory, Timer, Shield,
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

const EVOLUTION = [
  { dim: "Budget", v1: "0,8 M$", v2: "Par projet" },
  { dim: "Humain vs IA", v1: "100% humain", v2: "80-95% IA" },
  { dim: "Delai", v1: "16-24 semaines", v2: "6-10 semaines" },
  { dim: "Approche", v1: "Promoteur requis", v2: "Prouver la valeur d'abord" },
];

const EEA_ROLES = [
  { role: "Strategie energetique", desc: "Feuille de route decarbonation" },
  { role: "Conformite ESG", desc: "Rapports, empreinte carbone, KPIs" },
  { role: "Interface HQ", desc: "Programmes PPIA, tarifs, GDP, RED, outils DEA/RETScreen/EXPLORE/INTEGRATION" },
  { role: "Veille reglementaire", desc: "Tarifs, programmes d'aide, carbone" },
];

const MULTI_AGENT_PALIERS = [
  {
    palier: "1", name: "Multi-perspective synthese", sprint: "Sprint 7", lines: "~200", cost: "~0.30$/jour",
    desc: "CEO Bot dispatche a 2-3 agents en parallele via asyncio.gather(), collecte les reponses, synthetise en UNE reponse multi-perspective en ~6-8 sec.",
    example: "Carl: \u00AB Evaluer migration AWS \u00BB \u2192 CTO (faisabilite) + CFO (impact financier) + COO (impact ops) \u2192 CEO synthese"
  },
  {
    palier: "2", name: "Delegation fichiers et docs", sprint: "Sprint 8-9", lines: "~400", cost: "~1$/jour",
    desc: "Les agents creent des livrables concrets : Google Docs (business case), code, brouillons. Nouvel etat : DELEGATION \u2014 Carl peut faire autre chose.",
    example: "Agent CTO genere un document d'architecture pendant que Carl continue a travailler"
  },
  {
    palier: "3", name: "War Room autonome", sprint: "Sprint 10+", lines: "~800", cost: "Cape $5-20/War Room",
    desc: "Carl lance un projet complet. Les agents se coordonnent 30-60 min. CEO orchestre, detecte conflits, livre resultat final teste.",
    example: "\u00AB Lance War Room AeroQuote \u00BB \u2192 CTO prototype, CFO business case, CSO go-to-market, CMO one-pager \u2192 45 min \u2192 4 livrables"
  },
];

// ======================================================================
// PROMPT 7 — DEEP RESEARCH DATA (Transition Energetique)
// ======================================================================

const HQ_PLAN_2035_KPIS = [
  { label: "Investissement efficacite", value: "10G$", sublabel: "Plan d'action 2035", color: "cyan" },
  { label: "Reduction cible PME", value: "-10%", sublabel: "Consommation globale", color: "cyan" },
  { label: "Nouvelle capacite", value: "+11,000 MW", sublabel: "Production additionnelle", color: "cyan" },
];

const HQ_TARIFS = [
  { tarif: "Tarif L", type: "Grande puissance", desc: "Industriels majeurs (>5 MW)", avantage: "Tarifs les plus competitifs en Amerique du Nord" },
  { tarif: "Tarif M", type: "Moyenne puissance", desc: "PME manufacturieres (100 kW - 5 MW)", avantage: "Avantage cle du secteur manufacturier QC" },
  { tarif: "Tarif G", type: "Petite puissance", desc: "Petites entreprises (<100 kW)", avantage: "Cout energetique inferieur vs Ontario/US" },
];

const GDP_PROGRAMME = {
  titre: "Gestion de la Demande de Puissance (GDP)",
  desc: "Credits financiers pour les entreprises capables de delester leur demande electrique durant les ~100 heures critiques de pointe hivernale au Quebec.",
  avantageGhostX: "Le bot GhostX agit comme chef d'orchestre predictif du delestage : evalue mathematiquement (via VITAA) quel equipement peut etre interrompu avec l'impact financier et de livraison (OTD) le moins prejudiciable. Transforme une contrainte electrique en centre de profit optimise.",
};

const RETSCREEN = {
  nom: "RETScreen Expert",
  prix: "869$/an",
  dev: "Ressources naturelles Canada (CanmetENERGIE)",
  capacites: "Algorithmes pointus + bases de donnees climatiques mondiales satellitaires (NASA) pour evaluer la faisabilite technique et financiere des projets d'efficacite energetique",
  limites: "Outil essentiellement passif — environnement de bureau Windows, exige qu'un ingenieur/technicien qualifie saisisse les donnees, concoive les scenarios et interprete les modeles mathematiques complexes",
  opportunite: "GhostX ne se substitue PAS a RETScreen (modelisation thermodynamique lourde), mais democratise la surveillance energetique ACTIVE pour les PME via IA",
};

const CONCURRENTS_ENERGIE = [
  { nom: "Econoler", type: "Cabinet conseil QC", desc: "Evaluation programmes HQ, audits ponctuels — intervention humaine onereuse", force: "Expertise locale", faiblesse: "Ponctuel, pas continu" },
  { nom: "DNV", type: "Firme internationale", desc: "Analyses approfondies ingenierie energetique, standards internationaux", force: "Reputation mondiale", faiblesse: "Couts eleves, pas PME" },
  { nom: "RETScreen Expert", type: "Logiciel NRCan", desc: "Modelisation energetique avancee, donnees climatiques NASA", force: "Outil de reference", faiblesse: "Passif, 869$/an, Windows" },
];

const CENO_BOT_FEATURES = [
  { feature: "Intelligence active", desc: "Jumeaux numeriques a boucle fermee + integrations API telemetrie IoT — croise en temps reel le TRS avec les courbes kWh", icon: Zap },
  { feature: "Diagnostic predictif", desc: "Triangle du Feu applique a l'energie — alerte si ligne de production en attente tire pleine charge electrique = pilier Brule", icon: Thermometer },
  { feature: "Orchestration GDP", desc: "Evalue quel equipement delester avec impact OTD/financier minimal — chef d'orchestre predictif des ~100h de pointe hivernale", icon: Timer },
  { feature: "Benchmarks sectoriels", desc: "Apres 20 clients : benchmarks energetiques sectoriels QC inegalables — donnees cumulatives dans les 4 groupes GHML (S/T/P/H)", icon: BarChart3 },
];

const HQ_PARTENARIAT = [
  { etape: "Pont logiciel certifie", desc: "Connexion GhostX aux profils de consommation Hydro-Quebec clientele d'affaires" },
  { etape: "Admissibilite subventions", desc: "Frais d'abonnement GhostX module energetique admissibles aux subventions automatisation procedes industriels (Plan 2035, 10G$)" },
  { etape: "Avantage concurrentiel mutuel", desc: "PME : analyse temps reel facilite participation aux programmes GDP lucratifs. HQ : atteinte objectif -10% PME" },
];

// ======================================================================
// COMPOSANT
// ======================================================================

export default function MasterHydroQuebecPage() {
  return (
    <PageLayout maxWidth="4xl" showPresence={false}>
      <PageHeader
        title="Strategie Hydro-Quebec x IA + Multi-Agent"
        subtitle="Plan 2035 + GDP + RETScreen + CEnO Bot + EEA sub-agent + Flywheel energetique"
        gradient="from-cyan-700 to-blue-500"
        icon={Zap}
      />

      {/* ── Contexte ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3"><span className="text-[9px] font-bold text-gray-400 mr-1">G.2.1</span>Contexte — Usine Bleue Efficiente</h2>
        <p className="text-sm text-gray-600 mb-4">
          Le projet « Usine Bleue Efficiente » (mai 2025) proposait d'integrer l'efficience energetique et la gestion de la demande en pointe (GDP) dans le programme Usine Bleue du REAI. Alignement sur 4/5 priorites du Plan d'action 2035 d'Hydro-Quebec.
        </p>
      </div>

      <SectionDivider />

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* PROMPT 7 — HQ PLAN D'ACTION 2035                                */}
      {/* ══════════════════════════════════════════════════════════════════ */}

      {/* ── Plan d'action 2035 — KPIs ── */}
      <div className="mb-8">
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-500 px-4 py-2.5 flex items-center gap-2 border-b">
            <Globe className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Plan d'Action 2035 — Vers un Quebec Decarbone</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-cyan-800">Fin de l'abondance</span>
          </div>
          <div className="p-4 space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3">
              {HQ_PLAN_2035_KPIS.map((k) => (
                <Card key={k.label} className="p-0 overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500">
                    <span className="text-sm font-bold text-white">{k.label}</span>
                  </div>
                  <div className="px-3 py-2">
                    <div className="text-2xl font-bold text-cyan-600">{k.value}</div>
                    <div className="text-[9px] text-gray-500">{k.sublabel}</div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Contexte rupture */}
            <Card className="p-3 bg-amber-50/30 border-l-[3px] border-l-amber-400">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Fin des surplus structurels</p>
                  <p className="text-xs text-gray-600 mt-1">Hydro-Quebec est confronte a la fin de ses surplus structurels. L'industrie QC operait dans un paradigme d'abondance grace aux tarifs competitifs — ce paradigme est termine. La priorite energetique est assortie d'un objectif de reduction contraignant de -10% pour les PME.</p>
                </div>
              </div>
            </Card>

            {/* Axes financements */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Axes de modernisation finances (Plan 2035)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Card className="p-3 flex items-start gap-2">
                  <Factory className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Procedes industriels performants</p>
                    <p className="text-xs text-gray-500">Optimisation et mise en oeuvre de procedes avances</p>
                  </div>
                </Card>
                <Card className="p-3 flex items-start gap-2">
                  <Settings className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Automatisation batiments</p>
                    <p className="text-xs text-gray-500">Controles intelligents et telemetrie pour clientele d'affaires</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── Tarifs HQ — Avantage competitif QC ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">G.2.1.1</span>Tarifs Hydro-Quebec — Avantage Competitif QC</h2>
        <div className="space-y-2">
          {HQ_TARIFS.map((t) => (
            <Card key={t.tarif} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="text-[9px] bg-cyan-50 text-cyan-700">{t.tarif}</Badge>
                <p className="text-sm font-medium text-gray-800">{t.type}</p>
              </div>
              <p className="text-xs text-gray-500">{t.desc}</p>
              <p className="text-xs text-cyan-600 mt-1">{t.avantage}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── GDP — Gestion Demande Puissance ── */}
      <div className="mb-8">
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-2.5 flex items-center gap-2 border-b">
            <Timer className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">{GDP_PROGRAMME.titre}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-amber-800">~100h pointe hivernale</span>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-gray-700 leading-relaxed">{GDP_PROGRAMME.desc}</p>
            <Card className="p-3 bg-cyan-50/50 border-cyan-100">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-cyan-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-cyan-800">Opportunite GhostX</p>
                  <p className="text-xs text-gray-600">{GDP_PROGRAMME.avantageGhostX}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── RETScreen Expert ── */}
      <div className="mb-8">
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-2.5 flex items-center gap-2 border-b">
            <Leaf className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">RETScreen Expert — Reference Methodologique</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-green-800">{RETSCREEN.prix}</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="p-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Developpeur</p>
                <p className="text-sm text-gray-700">{RETSCREEN.dev}</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Prix</p>
                <p className="text-sm font-bold text-green-600">{RETSCREEN.prix} (abonnement professionnel)</p>
              </Card>
            </div>
            <Card className="p-3 border-l-[3px] border-l-green-400 bg-green-50/30">
              <p className="text-xs font-medium text-gray-500 mb-1">Capacites</p>
              <p className="text-xs text-gray-700 leading-relaxed">{RETSCREEN.capacites}</p>
            </Card>
            <Card className="p-3 border-l-[3px] border-l-amber-400 bg-amber-50/30">
              <p className="text-xs font-medium text-gray-500 mb-1">Limites</p>
              <p className="text-xs text-gray-700 leading-relaxed">{RETSCREEN.limites}</p>
            </Card>
            <Card className="p-3 bg-cyan-50/50 border-cyan-100">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-cyan-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-cyan-800">Positionnement GhostX</p>
                  <p className="text-xs text-gray-600">{RETSCREEN.opportunite}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── Concurrents Energie ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">G.2.1.2</span>Ecosysteme Analytique Energetique — Concurrents</h2>
        <div className="space-y-2">
          {CONCURRENTS_ENERGIE.map((c) => (
            <Card key={c.nom} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-800">{c.nom}</p>
                <Badge variant="outline" className="text-[9px]">{c.type}</Badge>
              </div>
              <p className="text-xs text-gray-500 mb-1">{c.desc}</p>
              <div className="flex gap-3">
                <span className="text-xs text-green-600">+ {c.force}</span>
                <span className="text-xs text-red-500">- {c.faiblesse}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── CEnO Bot — Chief Energy Officer ── */}
      <div className="mb-8">
        <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-cyan-600 to-teal-500 px-4 py-2.5 flex items-center gap-2 border-b">
            <Lightbulb className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Bot CEnO — Chief Energy Officer (Concept)</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-cyan-800">13e Agent C-Level</span>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-gray-600 mb-2">
              Extension de l'EEA en agent C-Level autonome. Ne se substitue pas a RETScreen (modelisation thermodynamique) mais democratise la surveillance energetique active pour les PME via le Triangle du Feu applique a l'energie.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {CENO_BOT_FEATURES.map((f) => (
                <Card key={f.feature} className="p-3 flex items-start gap-2">
                  <f.icon className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{f.feature}</p>
                    <p className="text-xs text-gray-500">{f.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── Strategie partenariat HQ ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">G.2.1.3</span>Strategie de Partenariat Vecteur avec Hydro-Quebec</h2>
        <div className="space-y-2">
          {HQ_PARTENARIAT.map((p, i) => (
            <div key={p.etape} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-50 text-cyan-700 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <Card className="flex-1 p-3">
                <p className="text-sm font-medium text-gray-800">{p.etape}</p>
                <p className="text-xs text-gray-500">{p.desc}</p>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Evolution V1 → V2 ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">G.2.2</span>{"Strategie V1 (2025) → V2 (2026) : IA-First"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EVOLUTION.map((e) => (
            <Card key={e.dim} className="p-3">
              <p className="text-xs font-medium text-gray-500 mb-2">{e.dim}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-400">V1</p>
                  <p className="text-sm text-gray-600">{e.v1}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-cyan-500">V2</p>
                  <p className="text-sm font-medium text-gray-800">{e.v2}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── EEA Agent ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">G.2.3</span>Energy Efficiency Agent (EEA) — Sous-Agent CTO</h2>
        <p className="text-sm text-gray-500 mb-4">
          L'EEA ajoute une dimension energetique (kWh/unite, GDP, GES, RETScreen) a chaque analyse de productivite manufacturiere. Position GHML : Groupe T, interactions S + P + H.
        </p>
        <div className="space-y-2">
          {EEA_ROLES.map((r) => (
            <Card key={r.role} className="p-3 flex items-start gap-3">
              <Zap className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">{r.role}</p>
                <p className="text-xs text-gray-500">{r.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── CESO Potentiel ── */}
      <div className="mb-8">
        <Card className="p-4 bg-cyan-50/50">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-cyan-600" />
            <h3 className="text-sm font-semibold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">G.2.3.1</span>7e Agent Potentiel : CESO</h3>
          </div>
          <p className="text-xs text-gray-600">
            Si la collaboration HQ prend de l'ampleur, l'EEA est promu en agent C-Level autonome — le CESO (Chief Energy & Sustainability Officer), 7e membre du Brain Team. Responsable de la feuille de route decarbonation, conformite ESG, interface Hydro-Quebec.
          </p>
        </Card>
      </div>

      <SectionDivider />

      {/* ── Visite SMART Energetique ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3"><span className="text-[9px] font-bold text-gray-400 mr-1">G.2.4</span>Visite SMART Energetique</h2>
        <Card className="p-4">
          <p className="text-sm text-gray-700 mb-2">
            Extension de la Visite SMART existante : diagnostic terrain combine productivite (AM) + energie (PM).
          </p>
          <p className="text-sm text-gray-700">
            Rapport automatise incluant bilan energetique et plan de decarbonation en <strong>15 minutes via IA</strong>.
          </p>
        </Card>
      </div>

      {/* ── Revenus ── */}
      <div className="mb-8">
        <Card className="p-4 bg-green-50/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-800"><span className="text-[9px] font-bold text-gray-400 mr-1">G.2.4.1</span>Modele de Revenus Integre</h3>
          </div>
          <p className="text-sm text-gray-700">
            Scenario 20 clients PME (12 mois) : revenus recurrents estimes <strong>~420 000 $/an</strong> + commissions projets.
          </p>
        </Card>
      </div>

      {/* ── Flywheel ── */}
      <div className="mb-8">
        <Card className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50">
          <h3 className="text-sm font-semibold text-gray-800 mb-2"><span className="text-[9px] font-bold text-gray-400 mr-1">G.2.4.2</span>Flywheel Energetique GHML</h3>
          <p className="text-xs text-gray-700">
            Apres 20 clients, le systeme dispose de <strong>benchmarks energetiques sectoriels quebecois</strong> qu'aucun consultant ne peut egaler. Chaque interaction manufacturier + energie genere de nouveaux elements GHML dans les 4 groupes (S, T, P, H). C'est la Bibliotheque d'Intelligence appliquee a l'energie — avantage competitif cumulatif et insurmontable.
          </p>
        </Card>
      </div>

      <SectionDivider />

      {/* ── Roadmap Multi-Agent 3 Paliers ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">G.2.5</span>Roadmap Multi-Agent V3 — 3 Paliers</h2>
        <p className="text-sm text-gray-500 mb-4">
          Du « seul cerveau qui change de chapeau » au War Room autonome. Paradigme multi-agent adapte au business decision-making avec cout maitrise.
        </p>
        <div className="space-y-4">
          {MULTI_AGENT_PALIERS.map((p) => (
            <Card key={p.palier} className="overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-500 px-4 py-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Palier {p.palier} — {p.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white text-xs">{p.sprint}</Badge>
                  <Badge className="bg-white/20 text-white text-xs">{p.cost}</Badge>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 mb-2">{p.desc}</p>
                <Card className="p-3 bg-gray-50">
                  <p className="text-xs text-gray-600 font-mono">{p.example}</p>
                </Card>
                <p className="text-xs text-gray-400 mt-2">{p.lines} lignes de code</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Garde-fous War Room ── */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-800 mb-3"><span className="text-[9px] font-bold text-gray-400 mr-1">G.2.5.1</span>Garde-fous War Room (Palier 3)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "Budget cap par War Room ($5 defaut, $20 max)",
            "Timeout global (60 min defaut, 2h max)",
            "Verification coherence inter-agents a chaque tour",
            "Carl peut interrompre a tout moment (/stop)",
            "Log complet pour auditabilite",
          ].map((g, i) => (
            <Card key={i} className="p-2 flex items-center gap-2">
              <Settings className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-600">{g}</span>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Sources ── */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Sources : Bible-GHML-V2 Section 9.6 -- usine-bleue-ai-hydro-quebec-strategie.docx --
          CONSOLIDATION-STRATEGIE-HQ-2DESTINY -- BTML-V3-Roadmap-MultiAgent (Anthropic Agent Teams) --
          Prompt 7 Deep Research Bloc 3 (Plan 2035, GDP, RETScreen, Econoler/DNV, CEnO concept) --
          hydroquebec.com/plan-action-2035 -- natural-resources.canada.ca/retscreen
        </p>
      </div>
    </PageLayout>
  );
}
