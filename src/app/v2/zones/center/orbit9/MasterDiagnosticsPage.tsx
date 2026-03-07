/**
 * MasterDiagnosticsPage.tsx — Moteur Diagnostics CarlOS (54 universels + sectoriels)
 * Source: mega-prompt-diagnostics-departements.md + mega-prompt-diagnostics-gemini.md
 * Master GHML — Session 48
 */

import {
  Stethoscope, Building2, DollarSign, Server, Megaphone,
  Target, Settings, Factory, Users, Lightbulb, TrendingUp,
  Scale, Shield, ArrowRight, FileText, Clock, BarChart3,
  CheckCircle2, AlertTriangle, Layers,
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
    code: "direction", name: "Direction / CEO", bot: "BCO", botName: "CarlOS",
    icon: Building2, gradient: "from-blue-700 to-blue-500",
    diagnostics: [
      { title: "Maturité organisationnelle", measures: "Structure décisionnelle, processus documentés, délégation, gouvernance", dataPoints: "Nb niveaux hiérarchiques, % processus documentés, fréquence CA, organigramme à jour" },
      { title: "Plan de succession et relève", measures: "Postes clés identifiés, plan B, transfert de connaissances", dataPoints: "Nb postes critiques, % avec successeur identifié, âge moyen direction" },
      { title: "Alignement vision-exécution", measures: "Écart entre stratégie annoncée et réalité terrain", dataPoints: "% employés qui connaissent la vision, objectifs cascadés, suivi KPI" },
      { title: "Gestion des parties prenantes", measures: "Santé des relations CA, banques, fournisseurs, communauté", dataPoints: "Fréquence rapports CA, satisfaction banquier, concentration fournisseurs" },
    ],
  },
  {
    code: "finance", name: "Finance / CFO", bot: "BCF", botName: "François",
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
    code: "technologie", name: "Technologie / CTO", bot: "BCT", botName: "Thierry",
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
    code: "marketing", name: "Marketing / CMO", bot: "BCM", botName: "Martine",
    icon: Megaphone, gradient: "from-pink-600 to-pink-500",
    diagnostics: [
      { title: "Positionnement et marque", measures: "Notoriété, différenciation, cohérence messaging", dataPoints: "Score notoriété, proposition valeur claire, cohérence visuelle" },
      { title: "Marketing digital et acquisition", measures: "Site web, SEO, réseaux sociaux, coût d'acquisition", dataPoints: "Trafic web/mois, taux conversion, CAC, leads/mois, budget mktg % CA" },
      { title: "Expérience client (CX)", measures: "Parcours client, NPS, satisfaction, points de friction", dataPoints: "NPS, délai réponse, nb touchpoints, taux résolution 1er contact" },
      { title: "Go-to-Market et lancement", measures: "Processus lancement, canaux, analyse win/loss", dataPoints: "Nb lancements/an, délai idée→marché, taux succès, win/loss formel" },
    ],
  },
  {
    code: "strategie", name: "Stratégie / CSO", bot: "BCS", botName: "Sophie",
    icon: Target, gradient: "from-red-600 to-red-500",
    diagnostics: [
      { title: "Positionnement concurrentiel", measures: "Parts de marché, avantages compétitifs, menaces", dataPoints: "Part de marché, nb concurrents directs, barrières entrée" },
      { title: "Modèle d'affaires", measures: "Sources revenus, récurrence, scalabilité, marges", dataPoints: "% revenus récurrents, nb segments, marge par segment, scalabilité" },
      { title: "Croissance et expansion", measures: "Nouveaux marchés, produits, M&A, partenariats", dataPoints: "Croissance CA 3 ans, produits/an, pipeline M&A, partenariats strat." },
      { title: "Veille stratégique", measures: "Tendances, disruption, signaux faibles", dataPoints: "Processus veille formel, budget veille, fréquence rapports" },
    ],
  },
  {
    code: "operations", name: "Opérations / COO", bot: "BOO", botName: "Olivier",
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
    code: "production", name: "Production / Factory", bot: "BFA", botName: "Fabien",
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
    code: "rh", name: "RH / CHRO", bot: "BHR", botName: "Hélène",
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
    code: "innovation", name: "Innovation / CINO", bot: "BIO", botName: "Inès",
    icon: Lightbulb, gradient: "from-rose-600 to-rose-500",
    diagnostics: [
      { title: "Capacité d'innovation", measures: "Processus idéation, pipeline, budget R&D, time-to-market", dataPoints: "Budget R&D % CA, projets innovation actifs, délai idée→prototype" },
      { title: "Propriété intellectuelle", measures: "Brevets, marques, secrets commerciaux, valorisation", dataPoints: "Nb brevets actifs, nb marques, budget PI/an, valeur portefeuille PI" },
      { title: "Veille technologique", measures: "Processus veille, partenariats universités", dataPoints: "Veille formelle, partenariats académiques, foires/conférences" },
      { title: "Culture d'innovation", measures: "Programme idées employés, labs, incitatifs", dataPoints: "Programme suggestion, nb idées/an, % implantées, budget dédié" },
    ],
  },
  {
    code: "ventes", name: "Ventes / CRO", bot: "BRO", botName: "Raphaël",
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
    code: "legal", name: "Légal / CLO", bot: "BLE", botName: "Louise",
    icon: Scale, gradient: "from-indigo-600 to-indigo-500",
    diagnostics: [
      { title: "Conformité réglementaire", measures: "Lois applicables, licences, permis, risques", dataPoints: "Nb lois applicables, % permis à jour, dernière vérification, amendes 3 ans" },
      { title: "Gestion contractuelle", measures: "Contrats actifs, renouvellements, clauses critiques", dataPoints: "Nb contrats actifs, % renouvellement auto, clauses pénalité, centralisation" },
      { title: "Protection données (Loi 25)", measures: "Consentement, registre, politiques, incidents", dataPoints: "Politique vie privée à jour, responsable nommé, registre incidents" },
      { title: "Gouvernance et structure légale", measures: "Structure, conventions, CA, risques litigieux", dataPoints: "Type société, convention actionnaires, fréquence CA, litiges en cours" },
    ],
  },
  {
    code: "securite", name: "Sécurité / CISO", bot: "BSE", botName: "Sébastien",
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
  { bot: "BFA", role: "Observe terrain" },
  { bot: "BCT", role: "Analyse faisabilité" },
  { bot: "BCF", role: "Calcule ROI" },
  { bot: "BCS", role: "Qualifie lead" },
  { bot: "BCO", role: "Présente / Décide" },
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
        icon={<Stethoscope className="h-5 w-5" />}
      />

      {/* ── Funnel Diagnostics ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Cercle Vertueux — Le Diagnostic est la Porte d'Entrée</h2>
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
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Chaîne de Valeur Inter-Agents</h2>
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
        <h2 className="text-lg font-semibold text-gray-800 mb-3">6 Diagnostics Déjà Implémentés</h2>
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
          {totalDiag} Diagnostics Universels par Département
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Règles du Moteur Diagnostics</h2>
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

      {/* ── Diagnostics Sectoriels (10 industries) ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">10 Industries Cibles — Diagnostics Sectoriels</h2>
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

      {/* ── Pipeline Fabien (BFA) ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Pipeline Consultation BFA — VIST → JUAN → CPRJ</h2>
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
          <h3 className="text-sm font-semibold text-gray-800 mb-3">8 Gaspillages (Grille Diagnostic)</h3>
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
          <h3 className="text-sm font-semibold text-gray-800 mb-3">7 Familles d'Automatisation</h3>
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
          Pipeline BFA (VIST/JUAN/CPRJ) · 8 Gaspillages Lean · 7 Familles Automatisation REAI
        </p>
      </div>
    </PageLayout>
  );
}
