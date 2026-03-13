/**
 * MasterDiagnosticsPage.tsx — Moteur Diagnostics CarlOS (54 universels + sectoriels)
 * Source: mega-prompt-diagnostics-departements.md + mega-prompt-diagnostics-gemini.md
 *         + Deep Research Prompt 2 — Benchmarks Opérationnels VITAA (mars 2026)
 * Master GHML — Session 48 / enrichi Session 49
 */

import {
  Stethoscope, Building2, DollarSign, Server, Megaphone,
  Target, Settings, Factory, Users, Lightbulb, TrendingUp,
  Scale, Shield, ArrowRight, FileText, Clock, BarChart3,
  CheckCircle2, AlertTriangle, Layers, Activity, HelpCircle,
  Database,
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
// DATA — Moteur Diagnostics
// ======================================================================

const FUNNEL_STEPS = [
  { step: "1", label: "Diagnostic gratuit", detail: "15-25 min, score par département (0-100)", color: "bg-blue-50 text-blue-700" },
  { step: "2", label: "Gaps identifiés", detail: "Écarts spécifiques vs benchmarks PME QC", color: "bg-amber-50 text-amber-700" },
  { step: "3", label: "Cahier de Projet", detail: "Document PDF auto-généré avec chantiers prioritaires", color: "bg-green-50 text-green-700" },
  { step: "4", label: "Connexion Orbit9", detail: "Fournisseurs/experts qualifiés matchés aux gaps", color: "bg-purple-50 text-purple-700" },
  { step: "5", label: "Leads qualifiés", detail: "Les fournisseurs PAIENT pour ces leads — revenus CarlOS", color: "bg-rose-50 text-rose-700" },
];

interface DiagDept {
  code: string;
  name: string;
  bot: string;
  botName: string;
  icon: React.ElementType;
  gradient: string;
  diagnostics: { title: string; measures: string; dataPoints: string }[];
}

const DEPT_DIAGNOSTICS: DiagDept[] = [
  {
    code: "direction", name: "Direction / CEO", bot: "CEOB", botName: "CarlOS",
    icon: Building2, gradient: "from-blue-700 to-blue-500",
    diagnostics: [
      { title: "Maturité organisationnelle", measures: "Structure décisionnelle, processus documentés, délégation, gouvernance", dataPoints: "Nb niveaux hiérarchiques, % processus documentés, fréquence CA, organigramme à jour" },
      { title: "Plan de succession et relève", measures: "Postes clés identifiés, plan B, transfert de connaissances", dataPoints: "Nb postes critiques, % avec successeur identifié, âge moyen direction" },
      { title: "Alignement vision-exécution", measures: "Écart entre stratégie annoncée et réalité terrain", dataPoints: "% employés qui connaissent la vision, objectifs cascadés, suivi KPI" },
      { title: "Gestion des parties prenantes", measures: "Santé des relations CA, banques, fournisseurs, communauté", dataPoints: "Fréquence rapports CA, satisfaction banquier, concentration fournisseurs" },
    ],
  },
  {
    code: "finance", name: "Finance / CFO", bot: "CFOB", botName: "Frank",
    icon: DollarSign, gradient: "from-emerald-600 to-emerald-500",
    diagnostics: [
      { title: "Santé financière et ratios", measures: "Liquidité, solvabilité, rentabilité vs benchmarks", dataPoints: "Ratio courant, ratio dette/équité, marge nette, ROE, EBITDA" },
      { title: "Structure de coûts et marges", measures: "Coût de revient par produit, overhead, prix vs marché", dataPoints: "% coûts fixes vs variables, overhead rate, marge brute par produit" },
      { title: "Fonds de roulement et cashflow", measures: "Cycle de conversion cash, DSO, DPO", dataPoints: "DSO jours, DPO jours, DIO jours, cashflow libre" },
      { title: "Budget et prévisions", measures: "Fiabilité des prévisions, processus budgétaire", dataPoints: "Variance budget vs réel %, fréquence reforecast, jours clôture" },
      { title: "Risques financiers", measures: "Concentration, devises, taux, assurances, fiscalité", dataPoints: "% CA top 3 clients, exposition devises, couverture assurance" },
    ],
  },
  {
    code: "technologie", name: "Technologie / CTO", bot: "CTOB", botName: "Tim",
    icon: Server, gradient: "from-violet-600 to-violet-500",
    diagnostics: [
      { title: "Maturité numérique", measures: "Niveau 1.0→4.0 sur l'échelle de transformation digitale", dataPoints: "Nb systèmes, % cloud vs on-prem, automatisation processus, IoT" },
      { title: "Infrastructure TI", measures: "Serveurs, réseau, sécurité, backup, disaster recovery", dataPoints: "Âge infra, uptime, temps réponse, backup fréquence, PRA testé" },
      { title: "Systèmes d'information", measures: "ERP, CRM, MES, WMS — couverture et intégration", dataPoints: "Nb systèmes, % intégrés, satisfaction usagers, ressaisies/jour" },
      { title: "Data et analytique", measures: "Qualité données, BI, prise de décision data-driven", dataPoints: "Nb tableaux de bord, fréquence consultation, confiance données" },
      { title: "Dette technologique", measures: "Applications vieillissantes, langages obsolètes, risques", dataPoints: "Nb apps > 10 ans, % code sans mainteneur, licences expirées" },
    ],
  },
  {
    code: "marketing", name: "Marketing / CMO", bot: "CMOB", botName: "Mathilde",
    icon: Megaphone, gradient: "from-pink-600 to-pink-500",
    diagnostics: [
      { title: "Positionnement et marque", measures: "Notoriété, différenciation, cohérence messaging", dataPoints: "Score notoriété, proposition valeur claire, cohérence visuelle" },
      { title: "Marketing digital et acquisition", measures: "Site web, SEO, réseaux sociaux, coût d'acquisition", dataPoints: "Trafic web/mois, taux conversion, CAC, leads/mois, budget mktg % CA" },
      { title: "Expérience client (CX)", measures: "Parcours client, NPS, satisfaction, points de friction", dataPoints: "NPS, délai réponse, nb touchpoints, taux résolution 1er contact" },
      { title: "Go-to-Market et lancement", measures: "Processus lancement, canaux, analyse win/loss", dataPoints: "Nb lancements/an, délai idée→marché, taux succès, win/loss formel" },
    ],
  },
  {
    code: "strategie", name: "Stratégie / CSO", bot: "CSOB", botName: "Simone",
    icon: Target, gradient: "from-red-600 to-red-500",
    diagnostics: [
      { title: "Positionnement concurrentiel", measures: "Parts de marché, avantages compétitifs, menaces", dataPoints: "Part de marché, nb concurrents directs, barrières entrée" },
      { title: "Modèle d'affaires", measures: "Sources revenus, récurrence, scalabilité, marges", dataPoints: "% revenus récurrents, nb segments, marge par segment, scalabilité" },
      { title: "Croissance et expansion", measures: "Nouveaux marchés, produits, M&A, partenariats", dataPoints: "Croissance CA 3 ans, produits/an, pipeline M&A, partenariats strat." },
      { title: "Veille stratégique", measures: "Tendances, disruption, signaux faibles", dataPoints: "Processus veille formel, budget veille, fréquence rapports" },
    ],
  },
  {
    code: "operations", name: "Opérations / COO", bot: "COOB", botName: "Olivier",
    icon: Settings, gradient: "from-orange-600 to-orange-500",
    diagnostics: [
      { title: "Efficacité opérationnelle", measures: "Flux, processus, bottlenecks, valeur ajoutée vs gaspillage", dataPoints: "Nb étapes processus, % valeur ajoutée, temps de cycle, lead time" },
      { title: "Chaîne d'approvisionnement", measures: "Fournisseurs, délais, fiabilité, risques", dataPoints: "Nb fournisseurs critiques, % livraisons à temps, sources alternatives" },
      { title: "Qualité et amélioration continue", measures: "Défauts, coûts non-qualité, certifications", dataPoints: "Taux rejets %, coût non-qualité % CA, certification, actions correctives" },
      { title: "Planification et ordonnancement", measures: "Capacité vs demande, prévisions, adéquation", dataPoints: "% utilisation capacité, précision prévisions, changements urgents/sem" },
      { title: "Achats et approvisionnement", measures: "Processus, négociation, contrats, évaluation fournisseurs", dataPoints: "% achats sous contrat, fréquence éval fournisseurs, savings/an" },
    ],
  },
  {
    code: "production", name: "Production / Factory", bot: "CPOB", botName: "Paco",
    icon: Factory, gradient: "from-amber-600 to-amber-500",
    diagnostics: [
      { title: "Performance production (TRS/OEE)", measures: "Disponibilité × performance × qualité par ligne", dataPoints: "TRS global, TRS par ligne, top 3 causes arrêts, SMED" },
      { title: "Maintenance et fiabilité", measures: "Préventif vs correctif, MTBF, MTTR, coûts", dataPoints: "% maintenance préventive, MTBF, MTTR, coût maintenance % actifs" },
      { title: "SST et environnement", measures: "Taux fréquence, inspections, ergonomie, CNESST", dataPoints: "Taux fréquence accidents, quasi-accidents/mois, audit SST, ergonomie" },
      { title: "Layout et flux de production", measures: "Distances, croisements, 5S, organisation physique", dataPoints: "Distance parcourue pièce typique, croisements flux, score 5S, âge layout" },
      { title: "Potentiel d'automatisation", measures: "Par famille (soudage, assemblage, manutention), ROI", dataPoints: "Nb postes répétitifs, taux robotisation, payback estimé" },
    ],
  },
  {
    code: "rh", name: "RH / CHRO", bot: "CHROB", botName: "Hélène",
    icon: Users, gradient: "from-teal-600 to-teal-500",
    diagnostics: [
      { title: "Culture organisationnelle", measures: "Valeurs vécues vs affichées, engagement, appartenance", dataPoints: "Valeurs formalisées, score engagement, eNPS, participation" },
      { title: "Gestion des talents", measures: "Inventaire compétences, écarts, plans développement", dataPoints: "% postes avec profil, plans développement actifs, matrice talents" },
      { title: "Rétention et attraction", measures: "Taux roulement, coûts recrutement, marque employeur", dataPoints: "Taux roulement annuel, coût moyen recrutement, délai comblement" },
      { title: "Formation et développement", measures: "Budget, heures, efficacité, plans de carrière", dataPoints: "Budget formation % masse salariale, heures/employé/an, % plan carrière" },
      { title: "Climat et bien-être", measures: "Satisfaction, communication, leadership, santé psy", dataPoints: "Score satisfaction, fréquence sondages, absentéisme, santé mentale" },
    ],
  },
  {
    code: "innovation", name: "Innovation / CINO", bot: "CINOB", botName: "Inès",
    icon: Lightbulb, gradient: "from-rose-600 to-rose-500",
    diagnostics: [
      { title: "Capacité d'innovation", measures: "Processus idéation, pipeline, budget R&D, time-to-market", dataPoints: "Budget R&D % CA, projets innovation actifs, délai idée→prototype" },
      { title: "Propriété intellectuelle", measures: "Brevets, marques, secrets commerciaux, valorisation", dataPoints: "Nb brevets actifs, nb marques, budget PI/an, valeur portefeuille PI" },
      { title: "Veille technologique", measures: "Processus veille, partenariats universités", dataPoints: "Veille formelle, partenariats académiques, foires/conférences" },
      { title: "Culture d'innovation", measures: "Programme idées employés, labs, incitatifs", dataPoints: "Programme suggestion, nb idées/an, % implantées, budget dédié" },
    ],
  },
  {
    code: "ventes", name: "Ventes / CRO", bot: "CROB", botName: "Rich",
    icon: TrendingUp, gradient: "from-cyan-600 to-cyan-500",
    diagnostics: [
      { title: "Processus de vente et pipeline", measures: "Étapes, conversion, cycle de vente, CRM", dataPoints: "Nb étapes pipeline, taux conversion, cycle vente jours, CRM utilisé" },
      { title: "Performance commerciale", measures: "Revenus par rep, quotas, win rate, panier moyen", dataPoints: "CA par rep, % atteinte quota, win rate, panier moyen" },
      { title: "Fidélisation et rétention", measures: "Churn, upsell, satisfaction post-vente", dataPoints: "Taux rétention, % revenus upsell/cross-sell, satisfaction post-vente" },
      { title: "Pricing et soumissions", measures: "Méthode pricing, délai soumission, taux succès", dataPoints: "Méthode pricing, délai soumission jours, taux succès soumissions" },
      { title: "Développement de territoire", measures: "Couverture géo, pénétration, comptes dormants", dataPoints: "% territoire couvert, comptes actifs vs potentiel, comptes dormants" },
    ],
  },
  {
    code: "legal", name: "Légal / CLO", bot: "CLOB", botName: "Loulou",
    icon: Scale, gradient: "from-indigo-600 to-indigo-500",
    diagnostics: [
      { title: "Conformité réglementaire", measures: "Lois applicables, licences, permis, risques", dataPoints: "Nb lois applicables, % permis à jour, dernière vérification, amendes 3 ans" },
      { title: "Gestion contractuelle", measures: "Contrats actifs, renouvellements, clauses critiques", dataPoints: "Nb contrats actifs, % renouvellement auto, clauses pénalité, centralisation" },
      { title: "Protection données (Loi 25)", measures: "Consentement, registre, politiques, incidents", dataPoints: "Politique vie privée à jour, responsable nommé, registre incidents" },
      { title: "Gouvernance et structure légale", measures: "Structure, conventions, CA, risques litigieux", dataPoints: "Type société, convention actionnaires, fréquence CA, litiges en cours" },
    ],
  },
  {
    code: "securite", name: "Sécurité / CISO", bot: "CISOB", botName: "Sébastien",
    icon: Shield, gradient: "from-gray-600 to-gray-500",
    diagnostics: [
      { title: "Posture cybersécurité", measures: "Pare-feu, MFA, formation, tests pénétration", dataPoints: "MFA activé %, antivirus à jour, formation employés, tests pénétration" },
      { title: "Résilience (PCA/PRA)", measures: "Plan continuité, backup, RTO/RPO, tests reprise", dataPoints: "PCA documenté, fréquence backup, RTO cible, dernier test reprise" },
      { title: "Gestion risques informationnels", measures: "Classification données, accès, journalisation", dataPoints: "Données classifiées, moindre privilège, logs centralisés, incidents/an" },
      { title: "Conformité sécurité", measures: "Écart vs norme cible (SOC 2, ISO 27001, NIST)", dataPoints: "Norme cible identifiée, % contrôles implantés, dernier audit, roadmap" },
    ],
  },
];

const DIAG_EXISTING = [
  "IA & Automatisation", "Sécurité", "Robotique & 4.0",
  "Logistique", "Fins de Lignes", "Énergétique",
];

const RULES = [
  { rule: "15-25 minutes max par diagnostic", detail: "Un CEO n'a pas 2 heures. 10-15 data_points par diag." },
  { rule: "Data points MESURABLES", detail: "Pas de « Comment trouvez-vous votre... ». Des chiffres, des %, des choix concrets." },
  { rule: "Benchmarks PME québécoises", detail: "Pas des benchmarks Fortune 500. Réalités de PME 10-500 employés." },
  { rule: "Chaque diagnostic génère au moins 1 document", detail: "Scorecard, rapport ou benchmark — livrable tangible." },
  { rule: "Chaque gap pointe vers des fournisseurs", detail: "Types de fournisseurs/experts qui peuvent résoudre le gap." },
  { rule: "Langage CEO direct", detail: "Pas de jargon MBA. « Marge brute » pas « EBITDA normalized »." },
];

const CHAIN = [
  { bot: "CPOB", role: "Observe terrain" },
  { bot: "CTOB", role: "Analyse faisabilité" },
  { bot: "CFOB", role: "Calcule ROI" },
  { bot: "CSOB", role: "Qualifie lead" },
  { bot: "CEOB", role: "Présente / Décide" },
];

// --- Prompt 2 — Matrice des Seuils VITAA (Bonification A) ---
const VITAA_SEUILS = [
  { pilier: "Argent", agent: "CFOB", metrique: "Cycle Conversion Encaisse (CCC)", unite: "Jours", vert: "< 45 jours", jaune: "45 a 89 jours", rouge: "> 90 jours", contexte: "Mediane NA = 89j. Alimentaire (311) : < 35j sous peine de crise de liquidite." },
  { pilier: "Argent", agent: "CFOB", metrique: "Delai Recouvrement Clients (DSO)", unite: "Jours", vert: "< 35 jours", jaune: "36 a 51 jours", rouge: "> 55 jours", contexte: "DSO de 60j en usinage (3327) est commun mais pese lourdement sur la PME." },
  { pilier: "Argent", agent: "CFOB", metrique: "Rotation des Stocks (DIO)", unite: "Jours", vert: "< 45 jours", jaune: "46 a 80 jours", rouge: "> 85 jours", contexte: "Aerospatiale (3364) tolere jusqu'a 120j+. Metal (332) vise 45-60j." },
  { pilier: "Actif", agent: "COOB", metrique: "Taux Rendement Synthetique (TRS/OEE)", unite: "%", vert: "> 75%", jaune: "50% a 74%", rouge: "< 50%", contexte: "Moyenne PME QC = 55%. Sous 50%, capacite gaspillee. Benchmark mondial : 85%." },
  { pilier: "Actif", agent: "COOB", metrique: "Livraison a Temps (OTD)", unite: "%", vert: "> 98%", jaune: "90% a 97%", rouge: "< 90%", contexte: "Sous 90% : risque d'eviction des chaines d'approvisionnement (auto/aero)." },
  { pilier: "Temps", agent: "CHROB", metrique: "Taux de Roulement (Turnover)", unite: "%", vert: "< 8%", jaune: "8% a 15%", rouge: "> 16%", contexte: "Au-dela de 15%, la PME se vide de sa memoire institutionnelle tous les 6 ans." },
  { pilier: "Idee", agent: "CTOB", metrique: "Interconnexion Numerique", unite: "Stade", vert: "Elevee (Niv. 4-5)", jaune: "Silos (Niv. 2-3)", rouge: "Papier (Niv. 1)", contexte: "Seules 14% des PME QC maitrisent l'interconnexion. 39% = zero." },
  { pilier: "Vente", agent: "CMOB", metrique: "CRM Structure", unite: "--", vert: "Deploiement complet", jaune: "Utilisation basique", rouge: "Aucun (Excel)", contexte: "33% des entreprises B2B QC operent sans CRM en 2025." },
];

// --- Prompt 2 — Benchmarks Sectoriels par code SCIAN ---
const BENCHMARKS_SECTORIELS = [
  { secteur: "Transformation alimentaire", scian: "311", dio: "15-25j", dso: "< 30j", ccc: "< 35j", marge: "2-5% net", detail: "Rotation ultra-rapide (produits perissables). CCC > 35j = signal de detresse.", color: "green" },
  { secteur: "Aerospatiale / Pieces", scian: "3364", dio: "100-120j", dso: "60-75j", ccc: "~95j normal", marge: "> 18% BAIIA", detail: "Cycles dilates (certification, materiaux exotiques). BFR structurellement eleve.", color: "blue" },
  { secteur: "Produits metalliques / Usinage", scian: "332/3327", dio: "45-60j", dso: "> 60j commun", ccc: "Variable", marge: "10-15% BAIIA", detail: "Goulot = DSO, clients industriels retardent les paiements.", color: "gray" },
  { secteur: "Plastique / Caoutchouc", scian: "326", dio: "50-65j", dso: "Variable", ccc: "Variable", marge: "6-9% brute", detail: "Resines indexees petrole. Rebuts = levier #1 de rentabilite.", color: "amber" },
  { secteur: "Machines industrielles", scian: "333", dio: "WIP dominant", dso: "Par jalons", ccc: "> 100j si mal structure", marge: "Variable", detail: "Projets d'ingenierie longs. Facturation par milestones critique.", color: "violet" },
];

// --- Prompt 2 — Top 5 Canary Questions CEO (Bonification B) ---
const TOP5_CEO_QUESTIONS = [
  { question: "Combien de jours s'ecoulent entre le paiement de vos materiaux et l'encaissement du cheque de votre client?", metrique: "CCC", pourquoi: "CCC qui s'allonge = premier signe d'infarctus de tresorerie (etat Meurt)." },
  { question: "Sur 40h/semaine, combien d'heures votre machine la plus couteuse produit-elle des pieces parfaites?", metrique: "TRS/OEE", pourquoi: "TRS de 50% = CAPEX inutile. Optimiser setup et micro-arrets suffit souvent." },
  { question: "Quel % de votre personnel de plancher a quitte dans les 12 derniers mois?", metrique: "Turnover", pourquoi: "78% des PME peinent a recruter. Fuite > 15% = paralysie des commandes." },
  { question: "Quel % de vos commandes est livre a la date exacte promise au client?", metrique: "OTD", pourquoi: "OTD defaillant = symptome aval d'un probleme amont (MRP, achats, pannes)." },
  { question: "Si une commande entre par courriel, combien d'interventions humaines avant qu'elle apparaisse sur l'ecran du machiniste?", metrique: "Interconnexion", pourquoi: "39% des entreprises QC = zero interconnexion. Des heures brulees en admin redondant." },
];

// ======================================================================
// COMPOSANT
// ======================================================================

export default function MasterDiagnosticsPage() {
  const totalDiag = DEPT_DIAGNOSTICS.reduce((sum, d) => sum + d.diagnostics.length, 0);

  return (
    <PageLayout maxWidth="4xl" showPresence={false}>
      <PageHeader
        title="Moteur Diagnostics CarlOS"
        subtitle={`${totalDiag} diagnostics universels × 12 départements × 10 industries`}
        gradient="from-blue-600 to-teal-500"
        icon={Stethoscope}
      />

      {/* ── Funnel Diagnostics ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">F.1.1</span>Cercle Vertueux — Le Diagnostic est la Porte d'Entrée</h2>
        <div className="space-y-2">
          {FUNNEL_STEPS.map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <span className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", s.color)}>
                {s.step}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800">{s.label}</p>
                <p className="text-xs text-gray-500">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Chaîne de valeur inter-agents ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3"><span className="text-[9px] font-bold text-gray-400 mr-1">F.1.2</span>Chaîne de Valeur Inter-Agents</h2>
        <div className="flex flex-wrap items-center gap-2">
          {CHAIN.map((c, i) => (
            <div key={c.bot} className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{c.bot}</Badge>
              <span className="text-xs text-gray-600">{c.role}</span>
              {i < CHAIN.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-gray-400" />}
            </div>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── 6 Diagnostics existants ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3"><span className="text-[9px] font-bold text-gray-400 mr-1">F.1.3</span>6 Diagnostics Déjà Implémentés</h2>
        <div className="flex flex-wrap gap-2">
          {DIAG_EXISTING.map((d) => (
            <Badge key={d} className="bg-green-50 text-green-700 border-green-200">{d}</Badge>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── 54 Diagnostics par Département ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          <span className="text-[9px] font-bold text-gray-400 mr-1">F.1.4</span>{totalDiag} Diagnostics Universels par Département
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Chaque département a 3 à 5 diagnostics ciblés de 15-25 min. Total : {totalDiag} diagnostics.
        </p>

        <div className="space-y-6">
          {DEPT_DIAGNOSTICS.map((dept) => {
            const Icon = dept.icon;
            return (
              <Card key={dept.code} className="overflow-hidden">
                <div className={cn("bg-gradient-to-r px-4 py-3 flex items-center gap-3", dept.gradient)}>
                  <Icon className="h-5 w-5 text-white" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">{dept.name}</h3>
                    <p className="text-xs text-white/80">{dept.bot} — {dept.botName} · {dept.diagnostics.length} diagnostics</p>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {dept.diagnostics.map((diag, i) => (
                    <div key={i} className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">#{i + 1}</span>
                        <p className="text-sm font-medium text-gray-800">{diag.title}</p>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{diag.measures}</p>
                      <div className="flex items-start gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-gray-400">{diag.dataPoints}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* ── Règles du Moteur ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">F.1.5</span>Règles du Moteur Diagnostics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {RULES.map((r, i) => (
            <Card key={i} className="p-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{r.rule}</p>
                  <p className="text-xs text-gray-500">{r.detail}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Matrice des Seuils VITAA (Prompt 2 — Bonification A) ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          <span className="text-[9px] font-bold text-gray-400 mr-1">F.1.6</span>Matrice des Seuils VITAA — Vert / Jaune / Rouge
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Seuils calibres pour les PME manufacturieres QC (SCIAN 31-33). Zone rouge = alerte de survie (etat Meurt du Triangle du Feu).
        </p>
        <div className="space-y-3">
          {VITAA_SEUILS.map((s, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-[9px] font-mono">{s.pilier}</Badge>
                  <Badge variant="outline" className="text-[9px] text-gray-500">{s.agent}</Badge>
                  <span className="text-sm font-medium text-gray-800">{s.metrique}</span>
                  <span className="text-[9px] text-gray-400 ml-auto">({s.unite})</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
                    <div className="text-[9px] font-bold text-green-600 uppercase mb-0.5">Vert</div>
                    <div className="text-xs font-semibold text-green-800">{s.vert}</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
                    <div className="text-[9px] font-bold text-amber-600 uppercase mb-0.5">Jaune</div>
                    <div className="text-xs font-semibold text-amber-800">{s.jaune}</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
                    <div className="text-[9px] font-bold text-red-600 uppercase mb-0.5">Rouge</div>
                    <div className="text-xs font-semibold text-red-800">{s.rouge}</div>
                  </div>
                </div>
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-500">{s.contexte}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Source :</span> Deep Research Prompt 2 — 30 sources validees (mars 2026).
            Seuils bases sur KPMG, ISED Canada, STIQ, MEIE, Statistique Canada, ISQ.
          </p>
        </div>
      </div>

      <SectionDivider />

      {/* ── Benchmarks Sectoriels par SCIAN (Prompt 2) ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          <span className="text-[9px] font-bold text-gray-400 mr-1">F.1.7</span>Benchmarks Sectoriels par Code SCIAN
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Un DSO de 45j = excellence en machines (333), mais hemorragie en alimentaire (311). Les seuils doivent etre contextualises par secteur.
        </p>
        <div className="space-y-3">
          {BENCHMARKS_SECTORIELS.map((b) => (
            <Card key={b.scian} className="overflow-hidden">
              <div className={cn("bg-gradient-to-r px-4 py-2.5 flex items-center gap-2", {
                "from-green-600 to-green-500": b.color === "green",
                "from-blue-600 to-blue-500": b.color === "blue",
                "from-gray-600 to-gray-500": b.color === "gray",
                "from-amber-600 to-amber-500": b.color === "amber",
                "from-violet-600 to-violet-500": b.color === "violet",
              })}>
                <Database className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">{b.secteur}</span>
                <Badge className="ml-auto bg-white/20 text-white border-0 text-[9px]">SCIAN {b.scian}</Badge>
              </div>
              <div className="px-4 py-3">
                <div className="grid grid-cols-4 gap-3 mb-2">
                  <div>
                    <div className="text-[9px] text-gray-400 uppercase">DIO</div>
                    <div className="text-xs font-semibold text-gray-800">{b.dio}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-400 uppercase">DSO</div>
                    <div className="text-xs font-semibold text-gray-800">{b.dso}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-400 uppercase">CCC</div>
                    <div className="text-xs font-semibold text-gray-800">{b.ccc}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-400 uppercase">Marge</div>
                    <div className="text-xs font-semibold text-gray-800">{b.marge}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{b.detail}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Top 5 Canary Questions CEO (Prompt 2 — Bonification B) ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          <span className="text-[9px] font-bold text-gray-400 mr-1">F.1.8</span>Top 5 — Questions Canari du CEO
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Si CarlOS ne pouvait poser que 5 questions pour determiner l'etat du Triangle du Feu, ce seraient celles-ci.
        </p>
        <div className="space-y-3">
          {TOP5_CEO_QUESTIONS.map((q, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <HelpCircle className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <p className="text-sm font-medium text-gray-800">"{q.question}"</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-[9px] text-blue-600 bg-blue-50">{q.metrique}</Badge>
                    <p className="text-xs text-gray-500">{q.pourquoi}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <div className="flex items-start gap-2">
            <Activity className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">
              <span className="font-semibold">Interface ideale :</span> Jauges semi-circulaires (rouge vers vert) pour chaque metrique.
              Le basculement d'une seule aiguille en rouge declenche la convocation des bots specialises (CFO, COO, CHRO).
            </p>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── Diagnostics Sectoriels (10 industries) ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"><span className="text-[9px] font-bold text-gray-400 mr-1">F.1.9</span>10 Industries Cibles — Diagnostics Sectoriels</h2>
        <p className="text-sm text-gray-500 mb-4">
          En plus des {totalDiag} diagnostics universels, chaque industrie a des diagnostics spécifiques.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: "Manufacturier", detail: "TRS/OEE, soudage robotisé, 2500+ ateliers QC", icon: Factory },
            { name: "Agroalimentaire", detail: "HACCP, traçabilité lots, chaîne du froid, ACIA/MAPAQ", icon: Layers },
            { name: "Construction", detail: "BIM, SST zéro accident, gestion multi-sites", icon: Building2 },
            { name: "Services professionnels", detail: "Taux utilisation, facturation, croissance, talents", icon: Users },
            { name: "Distribution / Commerce de gros", detail: "Inventaire, logistique, marges, e-commerce B2B", icon: TrendingUp },
            { name: "Technologie / SaaS", detail: "MRR, churn, CAC, produit, scaling", icon: Server },
            { name: "Ressources naturelles", detail: "SST, conformité, équipement, environnement", icon: AlertTriangle },
            { name: "Santé / Sciences de la vie", detail: "FDA, Santé Canada, ISO 13485, essais cliniques", icon: Stethoscope },
            { name: "Transport / Logistique", detail: "Coûts carburant, routes, conformité, dernière mile", icon: Settings },
            { name: "Économie sociale", detail: "Gouvernance, impact social, financement, mission", icon: Scale },
          ].map((ind) => {
            const Icon = ind.icon;
            return (
              <Card key={ind.name} className="p-3 flex items-start gap-3">
                <Icon className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{ind.name}</p>
                  <p className="text-xs text-gray-500">{ind.detail}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SectionDivider />

      {/* ── Pipeline Paco (CPOB) ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3"><span className="text-[9px] font-bold text-gray-400 mr-1">F.1.10</span>Pipeline Consultation CPOB — VIST → JUAN → CPRJ</h2>
        <div className="space-y-3">
          {[
            { code: "VIST", title: "Visite SMART", detail: "Observer, identifier douleurs et opportunités → Rapport SMART" },
            { code: "JUAN", title: "Jumelage-Analyse", detail: "Apparier les bons intégrateurs/experts → Description projet" },
            { code: "CPRJ", title: "Cahier de Projet", detail: "S00 Intro → S01 Analyse → S02 Cahier des charges → S03 Ingénierie → S04 Budget → S05 Conclusions" },
          ].map((p) => (
            <Card key={p.code} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs font-mono">{p.code}</Badge>
                <span className="text-sm font-medium text-gray-800">{p.title}</span>
              </div>
              <p className="text-xs text-gray-500">{p.detail}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── 8 Gaspillages + 7 Familles Automatisation ── */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3"><span className="text-[9px] font-bold text-gray-400 mr-1">F.1.11.1</span>8 Gaspillages (Grille Diagnostic)</h3>
          <div className="space-y-1">
            {["Surproduction", "Attentes", "Transport", "Sur-traitement", "Stocks excessifs", "Mouvements inutiles", "Défauts", "Sous-utilisation compétences"].map((g, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="text-gray-400 font-mono">{i + 1}.</span>
                {g}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3"><span className="text-[9px] font-bold text-gray-400 mr-1">F.1.11.2</span>7 Familles d'Automatisation</h3>
          <div className="space-y-1">
            {[
              "Soudage robotisé (150K-500K$/cellule)",
              "Assemblage automatisé (100K-1M$/ligne)",
              "Manutention et logistique (50K-2M$)",
              "Pick & Pack (200K-3M$)",
              "Stockage AS/RS (500K-10M$)",
              "Usinage CNC et robotisé (100K-2M$)",
              "Contrôle qualité automatisé (30K-500K$)",
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="text-gray-400 font-mono">{i + 1}.</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sources ── */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Sources : mega-prompt-diagnostics-departements.md · mega-prompt-diagnostics-gemini.md ·
          Deep Research Prompt 2 (30 sources, mars 2026) · KPMG Working Capital 2024 · ISED Canada ·
          Barometre STIQ 2025 · MEIE Enquete Numerique 2025 · ISQ · Statistique Canada ·
          Pipeline CPOB (VIST/JUAN/CPRJ) · 8 Gaspillages Lean · 7 Familles Automatisation REAI
        </p>
      </div>
    </PageLayout>
  );
}
