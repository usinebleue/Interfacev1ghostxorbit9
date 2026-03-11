/**
 * MasterCortexRobotPage.tsx — GHML x Robots Humanoides — Le Cortex Manufacturier
 * Source: Bible-GHML-V2 Section 4.11 + Deep Research Prompt 6 (66 sources, mars 2026)
 * Master GHML — Session 48+
 */

import {
  Bot, Cpu, Layers, Factory, Zap, Brain, Target,
  Shield, Settings, BarChart3, Star, ArrowRight,
  Globe, DollarSign, Clock, Wrench, Building2,
  Scale, BookOpen, Network, Award, AlertTriangle,
  CheckCircle2, TrendingUp, Users, Handshake,
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

const CONSTRUCTEURS = [
  {
    name: "Figure 03", country: "US", price: "30-150K$ USD", status: "Pilotes actifs (BMW)",
    specs: "Helix VLA integre, capteurs tactiles 3g, 4 min autonome sur taches sequentielles",
    color: "blue",
  },
  {
    name: "Tesla Optimus Gen 3", country: "US", price: "20-30K$ USD", status: "1000+ unites internes",
    specs: "Integration verticale (Dojo + actionneurs propres), FSD, mains 22 DOF",
    color: "gray",
  },
  {
    name: "Agility Digit", country: "US", price: "~250K$ (RaaS)", status: "Commercial grande echelle",
    specs: "98% taux de succes Amazon, cout operationnel 10-12$/h, locomotion dynamique",
    color: "emerald",
  },
  {
    name: "Apptronik Apollo", country: "US", price: "<50K$ USD", status: "Pilotes entreprise",
    specs: "Actuateurs lineaires, batteries a chaud, integration NVIDIA GR00T",
    color: "violet",
  },
  {
    name: "Sanctuary AI Phoenix Gen 8", country: "CA", price: "B2B (non divulgue)", status: "Pilotes Magna",
    specs: "Carbon AI (symbolique + LLM + renforcement), mains hydrauliques 21 DOF, haptique 5 mN",
    color: "red",
  },
  {
    name: "Unitree G1", country: "CN", price: "13,500$ USD", status: "Production masse",
    specs: "Pression tarifaire mondiale, capacites humanoides completes a prix cobot",
    color: "amber",
  },
  {
    name: "BYD", country: "CN", price: "N/A (interne)", status: "20K unites fin 2026",
    specs: "Echelle massive, expertise chaine approvisionnement batteries/moteurs VE",
    color: "orange",
  },
];

const ROBOT_OS = [
  {
    name: "Physical Intelligence pi0 / OpenPi",
    desc: "API WebSocket, inference distante, JSON bidirectionnel. Separe la puissance de calcul (serveurs GPU) du robot physique.",
    tags: ["WebSocket", "VLA", "Open-source"],
    color: "blue",
    icon: Globe,
  },
  {
    name: "NVIDIA GR00T + Isaac Lab",
    desc: "Modele de fondation humanoides, simulation Cosmos (donnees synthetiques infinies), domain randomization pre-deploiement.",
    tags: ["Foundation Model", "Simulation", "GPU"],
    color: "emerald",
    icon: Cpu,
  },
  {
    name: "LeRobot (HuggingFace)",
    desc: "Python, robot.send_action() agnostique hardware. Standard de facto open-source pour interfacage universel.",
    tags: ["Python", "Agnostique", "Open-source"],
    color: "violet",
    icon: Settings,
  },
];

const A2A_VS_GHML = [
  {
    dimension: "Portee",
    a2a: "Communication generique entre agents (50+ partenaires dont Google, Salesforce, SAP)",
    ghml: "Intelligence decisionnelle industrielle — 220 elements deterministes S/P/T/H",
  },
  {
    dimension: "Architecture",
    a2a: "Agent Card JSON (identite, capacites, securite) — plomberie de communication",
    ghml: "CREDO comme protocole, diagnostics VITAA, Triangle du Feu dynamique",
  },
  {
    dimension: "Determinisme",
    a2a: "Probabiliste — chaque agent decide sa logique interne independamment",
    ghml: "Non-probabiliste — taxonomie fermee, calibrage previsible (System 2 sur System 1 VLA)",
  },
  {
    dimension: "Verdict",
    a2a: "Excellent pour la communication entre agents logiciels",
    ghml: "Indispensable pour la sagesse decisionnelle manufacturing",
  },
];

const TCO_DATA = {
  capex_usd: "50,000$",
  capex_cad: "67,500$",
  opex_entretien: "8,500$",
  opex_licences: "6,000$",
  opex_energie: "1,000$",
  opex_total: "15,500$",
  tco_brut_y1: "83,000$",
  humain_salaire: "67,800$",
  humain_charges: "+30%",
  humain_total: "88,140$",
  subvention_pct: "30%",
  capex_net: "47,250$",
  tco_net_y1: "62,750$",
  payback: "8.5 mois",
  fte_equivalent: "1.5-2x",
};

const ARCH_LAYERS = [
  {
    layer: "1", name: "Hardware Robot",
    resp: "Figure, Tesla, Sanctuary, Unitree, BYD",
    func: "Capteurs, actuateurs, locomotion. GHML ne touche pas — commoditise.",
    color: "bg-gray-100 text-gray-700",
  },
  {
    layer: "2", name: "OS Moteur / Cervelet",
    resp: "pi0, GR00T, LeRobot",
    func: "Perception, planification mouvement, execution physique. GHML interface via API WebSocket/Python.",
    color: "bg-blue-50 text-blue-700",
  },
  {
    layer: "3", name: "GHML Cortex",
    resp: "CarlOS + GhostX",
    func: "Trisociation active (3 OS par decision), contexte GHML injecte, CREDO comme protocole, Triangle du Feu.",
    color: "bg-purple-50 text-purple-700",
  },
  {
    layer: "4", name: "Orchestration",
    resp: "Brain Team Master",
    func: "Coordination multi-robots, allocation de taches via VITAA, learning loop, interop A2A.",
    color: "bg-amber-50 text-amber-700",
  },
];

const HORIZONS = [
  {
    id: "H1", period: "2026", title: "Physical Bridge Pilote",
    desc: "Unitree G1 + LeRobot/OpenPi API. Preuve concept TPE — GhostX envoie des directives strategiques actionnables a du materiel physique via standards ouverts.",
    color: "blue",
    icon: Zap,
  },
  {
    id: "H2", period: "2027-28", title: "GHML = Protocole de Planification",
    desc: "GHML transcende l'analyse pour devenir le standard de structuration des requetes pour les flottes robotiques. System 2 (GHML) sur System 1 (VLA). Encodage CREDO dans chaque commande.",
    color: "violet",
    icon: Brain,
  },
  {
    id: "H3", period: "2029-31", title: "Cortex Flotte + Verrouillage TAM",
    desc: "Orchestration systemique multi-robots. Interop A2A pour negocier avec agents externes. Zero-Trust IEC 62443. GhostX = OS strategique commandant une armee d'actifs physiques.",
    color: "amber",
    icon: Network,
  },
];

const NORMES = [
  {
    norme: "ISO 10218-1/-2:2025",
    scope: "Securite cellules robotisees",
    impact: "Le qualificatif 'collaboratif' s'applique au systeme complet, pas a la seule machine.",
    icon: Shield,
    color: "blue",
  },
  {
    norme: "ISO 25785-1 (SOTIF)",
    scope: "Securite humanoides",
    impact: "ODD (domaine operationnel) defini et applique par garde-fous logiciels. Derive de ISO 21448 automobile.",
    icon: AlertTriangle,
    color: "amber",
  },
  {
    norme: "AMF — Cote risque SIA",
    scope: "Tracabilite decisionnelle",
    impact: "GHML = avantage deterministe. Taxonomie fermee 220 elements = tracabilite cristalline pour auditeurs.",
    icon: Scale,
    color: "emerald",
  },
  {
    norme: "IEC 62443",
    scope: "Cybersecurite OT",
    impact: "Zero-Trust obligatoire pour technologie operationnelle connectee. Prerequis pour flottes robotiques.",
    icon: Settings,
    color: "red",
  },
];

const TOP_BOTS_MANUF = [
  { rank: 1, name: "QA Spectre", func: "Controle qualite visuel temps reel", impact: "Reduction rebuts %, satisfaction client", complexity: "Complexe" },
  { rank: 2, name: "Inventory Sentinel", func: "Surveillance stocks, commandes auto", impact: "Reduction couts stockage, ruptures", complexity: "Moyen" },
  { rank: 3, name: "Maintenance Whisperer", func: "Prediction pannes via capteurs", impact: "Temps d'arret %, couts maintenance", complexity: "Complexe" },
  { rank: 4, name: "Safety Specter", func: "Surveillance conditions securite plancher", impact: "Accidents travail, conformite", complexity: "Moyen" },
  { rank: 5, name: "Shift Scheduler", func: "Optimisation horaires selon production", impact: "Utilisation main-d'oeuvre, moral", complexity: "Moyen" },
  { rank: 6, name: "Energy Eye", func: "Monitoring consommation energie temps reel", impact: "Consommation, empreinte carbone", complexity: "Simple" },
  { rank: 7, name: "Material Mover", func: "Optimisation trajets chariots/AGV", impact: "Temps de cycle, reduction millage", complexity: "Moyen" },
  { rank: 8, name: "Changeover Chaser", func: "Optimisation changements production (SMED)", impact: "Temps changement, reduction erreurs", complexity: "Moyen" },
  { rank: 9, name: "OEE Oracle", func: "Efficacite production TRS temps reel", impact: "OEE %, amelioration continue", complexity: "Simple" },
  { rank: 10, name: "Training Tracker", func: "Suivi formation + micro-learning", impact: "Competences, reduction erreurs", complexity: "Moyen" },
];

const TOP_BOTS_FOURNISSEURS = [
  { rank: 1, name: "Opportunity Navigator", func: "Scan web pour projets d'automatisation", impact: "Prospects qualifies, temps prospection" },
  { rank: 2, name: "Proposal Architect", func: "Generation propositions techniques auto", impact: "Temps creation propositions, taux conversion" },
  { rank: 3, name: "Integration Orchestrator", func: "Coordination equipes + suivi projets", impact: "Delais livraison, satisfaction client" },
  { rank: 4, name: "Demo Doctor", func: "Simulations et demonstrations interactives", impact: "Engagement client" },
  { rank: 5, name: "ROI Raconteur", func: "Calcul et presentation ROI projets", impact: "Confiance clients, ventes" },
];

const PRIORITY_MATRIX = [
  { rank: 1, bot: "OEE Oracle", segment: "Manufacturiers", why: "Impact eleve, facile, identification rapide gaspillages" },
  { rank: 2, bot: "Lead Logger", segment: "Fournisseurs", why: "Impact eleve, facile, ameliore pipeline ventes" },
  { rank: 3, bot: "Inventory Sentinel", segment: "Manufacturiers", why: "Impact moyen, reduit couts et ruptures" },
  { rank: 4, bot: "Opportunity Navigator", segment: "Fournisseurs", why: "Impact moyen, automatise la prospection" },
  { rank: 5, bot: "Communication Concierge", segment: "Transversal", why: "Impact eleve, facile, sert les deux segments" },
];

// ======================================================================
// COMPOSANT
// ======================================================================

export default function MasterCortexRobotPage() {
  return (
    <PageLayout maxWidth="4xl" showPresence={false}>
      <PageHeader
        title="Cortex Robot Humanoide GHML"
        subtitle="Deep Research Prompt 6 — 66 sources — Goldman Sachs, IFR, Physical Intelligence, Sanctuary AI"
        icon={Bot}
        iconColor="text-gray-600"
      />

      {/* ── D.4.1 La These ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">D.4.1</span>
          La These
        </h2>

        <Card className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 shadow-sm">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            Goldman Sachs projette <strong>29.5-38G$ USD</strong> d'ici 2035 pour le marche des humanoides.
            L'IFR prevoit <strong>700K+ installations/an</strong> d'ici 2028. BYD cible 20,000 robots fin 2026.
            Figure AI est valorise a 39 milliards.
          </p>
          <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-purple-400 bg-purple-50/30 mb-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              Tous construisent des OS de <strong>MOUVEMENT</strong> (cervelet).
              Personne ne construit le <strong>CORTEX PREFRONTAL</strong> — le systeme decisionnel qui sait
              QUOI faire et POURQUOI dans le contexte d'une usine.
              Le hardware est <strong>commoditise</strong> — la valeur = couche logicielle.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 bg-white shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cervelet (Helix/pi0/GR00T)</p>
              <p className="text-sm text-gray-700">Comment marcher, saisir, naviguer</p>
              <p className="text-xs text-gray-400 mt-1">System 1 — rapide, reactif</p>
            </Card>
            <Card className="p-3 bg-white shadow-sm">
              <p className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-1">Cortex (GHML/CarlOS)</p>
              <p className="text-sm text-gray-700">Quoi faire, pourquoi, dans quel contexte</p>
              <p className="text-xs text-gray-400 mt-1">System 2 — deliberatif, strategique</p>
            </Card>
          </div>
        </Card>

        {/* KPI Market */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          {[
            { label: "Marche 2035", value: "38G$", sub: "Goldman Sachs (haut)", color: "blue" },
            { label: "Install./an 2028", value: "700K+", sub: "IFR projections", color: "emerald" },
            { label: "BYD 2026", value: "20K", sub: "unites internes VE", color: "amber" },
            { label: "Figure AI", value: "39G$", sub: "valorisation 2026", color: "violet" },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-0 overflow-hidden">
              <div className={cn("flex items-center gap-2 px-3 py-2 bg-gradient-to-r", `from-${kpi.color}-600 to-${kpi.color}-500`)}>
                <TrendingUp className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">{kpi.label}</span>
              </div>
              <div className="px-3 py-2">
                <div className={cn("text-2xl font-bold", `text-${kpi.color}-600`)}>{kpi.value}</div>
                <div className="text-[9px] text-gray-500">{kpi.sub}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── D.4.2 Constructeurs Humanoides 2026 ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">D.4.2</span>
          Constructeurs Humanoides 2026
        </h2>

        <div className="space-y-2">
          {CONSTRUCTEURS.map((c) => (
            <Card key={c.name} className="p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Bot className={cn("h-4 w-4 shrink-0", `text-${c.color}-500`)} />
                <p className="text-sm font-medium text-gray-800">{c.name}</p>
                <Badge variant="outline" className="text-[9px] ml-auto">{c.country}</Badge>
                <Badge variant="outline" className={cn("text-[9px]", `text-${c.color}-600 bg-${c.color}-50`)}>{c.price}</Badge>
              </div>
              <p className="text-xs text-gray-500 ml-6 mb-1">{c.status}</p>
              <p className="text-xs text-gray-600 ml-6">{c.specs}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── D.4.3 Sanctuary AI — Partenaire Naturel ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">D.4.3</span>
          Sanctuary AI — Partenaire Naturel
        </h2>

        <Card className="p-0 overflow-hidden shadow-sm border-2 border-red-300">
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-4 py-2.5 flex items-center gap-2 border-b">
            <Handshake className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Sanctuary AI — Vancouver</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-red-800">CANADIEN</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="text-xs text-gray-700"><strong>140M$+</strong> leves</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span className="text-xs text-gray-700">BDC Capital + InBC + FSI (federal)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                  <span className="text-xs text-gray-700">Carbon AI: symbolique + LLM + renforcement</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Wrench className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="text-xs text-gray-700">Mains hydrauliques <strong>21 DOF</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span className="text-xs text-gray-700">Sensibilite haptique <strong>5 mN</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Factory className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                  <span className="text-xs text-gray-700">Partenariat <strong>Magna</strong> (QC/Ontario)</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-purple-400 bg-purple-50/30">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Symbiose GhostX x Sanctuary</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                GhostX diagnostique <strong>QUOI</strong> optimiser (VITAA, TRS, CCC) —
                Sanctuary execute le <strong>COMMENT</strong> physique (reorganiser, inspecter, palettiser).
              </p>
            </div>
          </div>
        </Card>
      </div>

      <SectionDivider />

      {/* ── D.4.4 Robot OS & Couche Intelligence ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">D.4.4</span>
          Robot OS & Couche Intelligence
        </h2>

        <div className="space-y-3">
          {ROBOT_OS.map((os) => {
            const OsIcon = os.icon;
            return (
              <Card key={os.name} className="p-0 overflow-hidden shadow-sm">
                <div className={cn("bg-gradient-to-r px-4 py-2.5 flex items-center gap-2 border-b", `from-${os.color}-500 to-${os.color}-400`)}>
                  <OsIcon className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">{os.name}</span>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">{os.desc}</p>
                  <div className="flex gap-1.5">
                    {os.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className={cn("text-[9px]", `text-${os.color}-600 bg-${os.color}-50`)}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* ── D.4.5 A2A vs GHML ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">D.4.5</span>
          A2A vs GHML — Le Choc des Protocoles
        </h2>

        <Card className="p-0 overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="grid grid-cols-3 bg-gray-100 border-b">
            <div className="px-3 py-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dimension</span>
            </div>
            <div className="px-3 py-2 border-l border-gray-200">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">A2A (Google)</span>
            </div>
            <div className="px-3 py-2 border-l border-gray-200">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">GHML (GhostX)</span>
            </div>
          </div>
          {/* Table rows */}
          {A2A_VS_GHML.map((row, i) => (
            <div key={row.dimension} className={cn("grid grid-cols-3", i < A2A_VS_GHML.length - 1 ? "border-b border-gray-100" : "")}>
              <div className="px-3 py-2.5">
                <span className="text-xs font-medium text-gray-800">{row.dimension}</span>
              </div>
              <div className="px-3 py-2.5 border-l border-gray-100">
                <p className="text-xs text-gray-600 leading-relaxed">{row.a2a}</p>
              </div>
              <div className="px-3 py-2.5 border-l border-gray-100 bg-purple-50/30">
                <p className="text-xs text-gray-700 leading-relaxed">{row.ghml}</p>
              </div>
            </div>
          ))}
        </Card>

        <div className="border rounded-lg px-3 py-2.5 border-l-[3px] border-l-emerald-400 bg-emerald-50/30 mt-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>Conclusion :</strong> A2A = communication entre agents (plomberie).
            GHML = sagesse decisionnelle industrielle (cerveau). Les deux sont <strong>complementaires</strong>,
            pas concurrents — GHML utilise A2A en H3 pour l'interop.
          </p>
        </div>
      </div>

      <SectionDivider />

      {/* ── D.4.6 TCO Robot vs Humain QC ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">D.4.6</span>
          TCO Robot vs Humain QC
        </h2>

        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 shadow-sm">
          {/* CAPEX / OPEX breakdown */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
                <DollarSign className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">CAPEX</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-blue-600">67.5K$</div>
                <div className="text-[9px] text-gray-500">50K$ USD = ~67.5K$ CAD</div>
              </div>
            </Card>
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
                <Wrench className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">OPEX/an</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-amber-600">15.5K$</div>
                <div className="text-[9px] text-gray-500">Entretien 8.5K + Licences 6K + Energie 1K</div>
              </div>
            </Card>
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-600 to-red-500">
                <BarChart3 className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">TCO Brut Y1</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-red-600">83K$</div>
                <div className="text-[9px] text-gray-500">CAPEX + OPEX annuel</div>
              </div>
            </Card>
          </div>

          {/* Comparaison */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="p-3 bg-white border-amber-200">
              <div className="text-[9px] font-bold text-amber-600 uppercase tracking-wide mb-1">Humain manufacturier QC</div>
              <div className="text-lg font-bold text-amber-600">88,140$/an</div>
              <div className="text-[9px] text-gray-400">67,800$ salaire + 30% charges sociales</div>
            </Card>
            <Card className="p-3 bg-white border-emerald-200">
              <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide mb-1">Robot avec subventions (RS&DE + CRIC)</div>
              <div className="text-lg font-bold text-emerald-600">62,750$/an</div>
              <div className="text-[9px] text-gray-400">CAPEX net 47.25K$ (-30%) + OPEX 15.5K$</div>
            </Card>
          </div>

          {/* Payback & FTE */}
          <Card className="p-3 bg-blue-50 border-blue-200">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-blue-700">{TCO_DATA.payback}</div>
                <div className="text-[9px] text-blue-600">Payback</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-700">{TCO_DATA.fte_equivalent}</div>
                <div className="text-[9px] text-blue-600">FTE equivalent (24/7)</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-700">-29%</div>
                <div className="text-[9px] text-blue-600">TCO net vs humain Y1</div>
              </div>
            </div>
          </Card>

          <p className="text-[9px] text-gray-400 text-center mt-3 italic">
            Hypothese : Apptronik Apollo / Figure 03 ~ 50K$ US. Subventionnement modere 30% CAPEX via CRIC/RS&DE.
          </p>
        </Card>
      </div>

      <SectionDivider />

      {/* ── D.4.7 Architecture 4 Couches ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">D.4.7</span>
          Architecture d'Integration — 4 Couches
        </h2>
        <div className="space-y-3">
          {ARCH_LAYERS.map((l) => (
            <Card key={l.layer} className="p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold", l.color)}>
                  {l.layer}
                </span>
                <p className="text-sm font-medium text-gray-800">{l.name}</p>
                <Badge variant="outline" className="text-[9px] ml-auto">{l.resp}</Badge>
              </div>
              <p className="text-xs text-gray-600 ml-9">{l.func}</p>
            </Card>
          ))}
        </div>
        <Card className="p-3 mt-4 bg-purple-50/50 shadow-sm">
          <p className="text-xs text-gray-700 italic leading-relaxed">
            Le robot humanoide est simplement un nouveau "Bot" dans la Brain Team — avec un corps physique
            au lieu d'un chat. L'architecture GHML s'y adapte naturellement : meme CREDO, meme VITAA,
            meme Triangle du Feu.
          </p>
        </Card>
      </div>

      <SectionDivider />

      {/* ── D.4.8 3 Horizons — GhostX Cortex Robot ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">D.4.8</span>
          3 Horizons — GhostX Cortex Robot
        </h2>
        <div className="space-y-3">
          {HORIZONS.map((h) => {
            const HIcon = h.icon;
            return (
              <Card key={h.id} className="p-0 overflow-hidden shadow-sm">
                <div className={cn("bg-gradient-to-r px-4 py-2.5 flex items-center gap-2 border-b", `from-${h.color}-500 to-${h.color}-400`)}>
                  <HIcon className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">{h.id} — {h.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-gray-800 ml-auto">{h.period}</span>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-600 leading-relaxed">{h.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* ── D.4.9 Reglementation & Normes ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">D.4.9</span>
          Reglementation & Normes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {NORMES.map((n) => {
            const NIcon = n.icon;
            return (
              <Card key={n.norme} className="p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <NIcon className={cn("h-4 w-4 shrink-0", `text-${n.color}-500`)} />
                  <span className="text-sm font-medium text-gray-800">{n.norme}</span>
                </div>
                <Badge variant="outline" className={cn("text-[9px] mb-2", `text-${n.color}-600 bg-${n.color}-50`)}>
                  {n.scope}
                </Badge>
                <p className="text-xs text-gray-600 leading-relaxed">{n.impact}</p>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* ── D.4.10 Top 10 Bots Manufacturiers ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">D.4.10</span>
          Top 10 Bots — Manufacturiers
        </h2>
        <div className="space-y-2">
          {TOP_BOTS_MANUF.map((b) => (
            <Card key={b.rank} className="p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-400">#{b.rank}</span>
                <p className="text-sm font-medium text-gray-800">{b.name}</p>
                <Badge variant="outline" className="text-[9px] ml-auto">{b.complexity}</Badge>
              </div>
              <p className="text-xs text-gray-600">{b.func}</p>
              <p className="text-xs text-gray-400 mt-1">Impact : {b.impact}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── D.4.11 Top 5 Bots Fournisseurs ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">D.4.11</span>
          Top 5 Bots — Fournisseurs Automatisation
        </h2>
        <div className="space-y-2">
          {TOP_BOTS_FOURNISSEURS.map((b) => (
            <Card key={b.rank} className="p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-400">#{b.rank}</span>
                <p className="text-sm font-medium text-gray-800">{b.name}</p>
              </div>
              <p className="text-xs text-gray-600">{b.func}</p>
              <p className="text-xs text-gray-400 mt-1">Impact : {b.impact}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── D.4.12 Matrice de Priorisation ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          <span className="text-[9px] font-bold text-gray-400 mr-1">D.4.12</span>
          Matrice de Priorisation — Top 5
        </h2>
        <p className="text-sm text-gray-500 mb-3">Criteres : Impact x Facilite x Revenus</p>
        <div className="space-y-2">
          {PRIORITY_MATRIX.map((p) => (
            <Card key={p.rank} className="p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-xs font-mono text-gray-400">#{p.rank}</span>
                <p className="text-sm font-medium text-gray-800">{p.bot}</p>
                <Badge variant="outline" className="text-[9px] ml-auto">{p.segment}</Badge>
              </div>
              <p className="text-xs text-gray-500">{p.why}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Sources ── */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 leading-relaxed">
          Sources : 66 sources — Deep Research Prompt 6, Mars 2026 ·
          Goldman Sachs · IFR · Physical Intelligence · Sanctuary AI ·
          PwC Canada · NVIDIA · HuggingFace · Google A2A ·
          Bible-GHML-V2 Section 4.11 · CHALLENGE-FACTORY-GHOST-BOTS.md ·
          Trisociation CPOB: Ohno + Deming + Nightingale · 137 taches operationnelles mappees
        </p>
      </div>
    </PageLayout>
  );
}
