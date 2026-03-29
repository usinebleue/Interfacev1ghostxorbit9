/**
 * unified-diagnostics.ts — Modele de donnees unifie des 3 vagues de diagnostics
 *
 * Vague 3 (54 squelettes MasterDiagnosticsPage) = SQUELETTE — titres, mesures, KPIs
 * Vague 1 (43 enrichis diagnostics-enrichis.json) = CHAIR — data_points, options, benchmarks
 * Vague 2 (wizard DiagnosticIAPage) = MOTEUR — 6 types clients, scoring, questions adaptatives
 *
 * Resultat: 54 diagnostics unifies, 43 enrichis + 11 squelette-only ("a venir")
 */

import type { DiagnosticCatalogue } from "../../../api/types";
import { PROFIL_TYPES, type ProfilType } from "./diagnostic-questions";

// ══════════════════════════════════════════
// INTERFACES
// ══════════════════════════════════════════

export interface UnifiedDiagnostic {
  id: string;
  titre: string;
  description: string;
  departement: string;
  bot_primaire: string;
  bots_support: string[];
  industrie: string | null;
  duree_minutes: number;
  nb_questions: number;
  valeur_potentielle: string;
  gradient: string;
  data_points: DiagnosticDataPointEnrichi[];
  gaps_typiques: Array<{ gap: string; impact: string; fournisseurs_types: string[]; chantier_suggere: string }>;
  /** V3 measures textuels (quand pas enrichi) */
  measures?: string;
  /** V3 raw dataPoints textuels */
  rawDataPoints?: string;
  /** Types de profils clients concernes */
  profilTypes: ProfilType[];
  /** true si enrichi (data_points interactifs), false si squelette only */
  enrichi: boolean;
}

export interface DiagnosticDataPointEnrichi {
  cle: string;
  label: string;
  type: string;
  options?: string[];
  benchmark: string;
  critique: boolean;
  unite: string;
}

// ══════════════════════════════════════════
// SEUILS VITAA — Source: MasterDiagnosticsPage Prompt 2
// ══════════════════════════════════════════

export const VITAA_SEUILS = [
  { pilier: "Argent", agent: "CFOB", metrique: "Cycle Conversion Encaisse (CCC)", unite: "Jours", vert: "< 45 jours", jaune: "45 a 89 jours", rouge: "> 90 jours", contexte: "Mediane NA = 89j. Alimentaire (311) : < 35j sous peine de crise de liquidite." },
  { pilier: "Argent", agent: "CFOB", metrique: "Delai Recouvrement Clients (DSO)", unite: "Jours", vert: "< 35 jours", jaune: "36 a 51 jours", rouge: "> 55 jours", contexte: "DSO de 60j en usinage (3327) est commun mais pese lourdement sur la PME." },
  { pilier: "Argent", agent: "CFOB", metrique: "Rotation des Stocks (DIO)", unite: "Jours", vert: "< 45 jours", jaune: "46 a 80 jours", rouge: "> 85 jours", contexte: "Aerospatiale (3364) tolere jusqu'a 120j+. Metal (332) vise 45-60j." },
  { pilier: "Actif", agent: "COOB", metrique: "Taux Rendement Synthetique (TRS/OEE)", unite: "%", vert: "> 75%", jaune: "50% a 74%", rouge: "< 50%", contexte: "Moyenne PME QC = 55%. Sous 50%, capacite gaspillee. Benchmark mondial : 85%." },
  { pilier: "Actif", agent: "COOB", metrique: "Livraison a Temps (OTD)", unite: "%", vert: "> 98%", jaune: "90% a 97%", rouge: "< 90%", contexte: "Sous 90% : risque d'eviction des chaines d'approvisionnement (auto/aero)." },
  { pilier: "Temps", agent: "CHROB", metrique: "Taux de Roulement (Turnover)", unite: "%", vert: "< 8%", jaune: "8% a 15%", rouge: "> 16%", contexte: "Au-dela de 15%, la PME se vide de sa memoire institutionnelle tous les 6 ans." },
  { pilier: "Idee", agent: "CTOB", metrique: "Interconnexion Numerique", unite: "Stade", vert: "Elevee (Niv. 4-5)", jaune: "Silos (Niv. 2-3)", rouge: "Papier (Niv. 1)", contexte: "Seules 14% des PME QC maitrisent l'interconnexion. 39% = zero." },
  { pilier: "Vente", agent: "CMOB", metrique: "CRM Structure", unite: "--", vert: "Deploiement complet", jaune: "Utilisation basique", rouge: "Aucun (Excel)", contexte: "33% des entreprises B2B QC operent sans CRM en 2025." },
] as const;

// ══════════════════════════════════════════
// BENCHMARKS SECTORIELS — Source: MasterDiagnosticsPage Prompt 2
// ══════════════════════════════════════════

export const BENCHMARKS_SECTORIELS = [
  { secteur: "Transformation alimentaire", scian: "311", dio: "15-25j", dso: "< 30j", ccc: "< 35j", marge: "2-5% net", detail: "Rotation ultra-rapide (produits perissables). CCC > 35j = signal de detresse.", color: "green" },
  { secteur: "Aerospatiale / Pieces", scian: "3364", dio: "100-120j", dso: "60-75j", ccc: "~95j normal", marge: "> 18% BAIIA", detail: "Cycles dilates (certification, materiaux exotiques). BFR structurellement eleve.", color: "blue" },
  { secteur: "Produits metalliques / Usinage", scian: "332/3327", dio: "45-60j", dso: "> 60j commun", ccc: "Variable", marge: "10-15% BAIIA", detail: "Goulot = DSO, clients industriels retardent les paiements.", color: "gray" },
  { secteur: "Plastique / Caoutchouc", scian: "326", dio: "50-65j", dso: "Variable", ccc: "Variable", marge: "6-9% brute", detail: "Resines indexees petrole. Rebuts = levier #1 de rentabilite.", color: "amber" },
  { secteur: "Machines industrielles", scian: "333", dio: "WIP dominant", dso: "Par jalons", ccc: "> 100j si mal structure", marge: "Variable", detail: "Projets d'ingenierie longs. Facturation par milestones critique.", color: "violet" },
] as const;

// ══════════════════════════════════════════
// TOP 5 CEO QUESTIONS — Source: MasterDiagnosticsPage
// ══════════════════════════════════════════

export const TOP5_CEO_QUESTIONS = [
  { question: "Combien de jours s'ecoulent entre le paiement de vos materiaux et l'encaissement du cheque de votre client?", metrique: "CCC", pourquoi: "CCC qui s'allonge = premier signe d'infarctus de tresorerie (etat Meurt)." },
  { question: "Sur 40h/semaine, combien d'heures votre machine la plus couteuse produit-elle des pieces parfaites?", metrique: "TRS/OEE", pourquoi: "TRS de 50% = CAPEX inutile. Optimiser setup et micro-arrets suffit souvent." },
  { question: "Quel % de votre personnel de plancher a quitte dans les 12 derniers mois?", metrique: "Turnover", pourquoi: "78% des PME peinent a recruter. Fuite > 15% = paralysie des commandes." },
  { question: "Quel % de vos commandes est livre a la date exacte promise au client?", metrique: "OTD", pourquoi: "OTD defaillant = symptome aval d'un probleme amont (MRP, achats, pannes)." },
  { question: "Si une commande entre par courriel, combien d'interventions humaines avant qu'elle apparaisse sur l'ecran du machiniste?", metrique: "Interconnexion", pourquoi: "39% des entreprises QC = zero interconnexion. Des heures brulees en admin redondant." },
] as const;

// ══════════════════════════════════════════
// SQUELETTE V3 — 54 diagnostics (12 departements × 4-5 chacun)
// ══════════════════════════════════════════

interface V3Diag {
  title: string;
  measures: string;
  dataPoints: string;
}

interface V3Dept {
  code: string;
  bot: string;
  gradient: string;
  diagnostics: V3Diag[];
}

const DEPT_DIAGNOSTICS_V3: V3Dept[] = [
  {
    code: "direction", bot: "CEOB", gradient: "from-blue-700 to-blue-500",
    diagnostics: [
      { title: "Maturite organisationnelle", measures: "Structure decisionnelle, processus documentes, delegation, gouvernance", dataPoints: "Nb niveaux hierarchiques, % processus documentes, frequence CA, organigramme a jour" },
      { title: "Plan de succession et releve", measures: "Postes cles identifies, plan B, transfert de connaissances", dataPoints: "Nb postes critiques, % avec successeur identifie, age moyen direction" },
      { title: "Alignement vision-execution", measures: "Ecart entre strategie annoncee et realite terrain", dataPoints: "% employes qui connaissent la vision, objectifs cascades, suivi KPI" },
      { title: "Gestion des parties prenantes", measures: "Sante des relations CA, banques, fournisseurs, communaute", dataPoints: "Frequence rapports CA, satisfaction banquier, concentration fournisseurs" },
    ],
  },
  {
    code: "finance", bot: "CFOB", gradient: "from-emerald-600 to-emerald-500",
    diagnostics: [
      { title: "Sante financiere et ratios", measures: "Liquidite, solvabilite, rentabilite vs benchmarks", dataPoints: "Ratio courant, ratio dette/equite, marge nette, ROE, EBITDA" },
      { title: "Structure de couts et marges", measures: "Cout de revient par produit, overhead, prix vs marche", dataPoints: "% couts fixes vs variables, overhead rate, marge brute par produit" },
      { title: "Fonds de roulement et cashflow", measures: "Cycle de conversion cash, DSO, DPO", dataPoints: "DSO jours, DPO jours, DIO jours, cashflow libre" },
      { title: "Budget et previsions", measures: "Fiabilite des previsions, processus budgetaire", dataPoints: "Variance budget vs reel %, frequence reforecast, jours cloture" },
      { title: "Risques financiers", measures: "Concentration, devises, taux, assurances, fiscalite", dataPoints: "% CA top 3 clients, exposition devises, couverture assurance" },
    ],
  },
  {
    code: "technologie", bot: "CTOB", gradient: "from-violet-600 to-violet-500",
    diagnostics: [
      { title: "Maturite numerique", measures: "Niveau 1.0 a 4.0 sur l'echelle de transformation digitale", dataPoints: "Nb systemes, % cloud vs on-prem, automatisation processus, IoT" },
      { title: "Infrastructure TI", measures: "Serveurs, reseau, securite, backup, disaster recovery", dataPoints: "Age infra, uptime, temps reponse, backup frequence, PRA teste" },
      { title: "Systemes d'information", measures: "ERP, CRM, MES, WMS — couverture et integration", dataPoints: "Nb systemes, % integres, satisfaction usagers, ressaisies/jour" },
      { title: "Data et analytique", measures: "Qualite donnees, BI, prise de decision data-driven", dataPoints: "Nb tableaux de bord, frequence consultation, confiance donnees" },
      { title: "Dette technologique", measures: "Applications vieillissantes, langages obsoletes, risques", dataPoints: "Nb apps > 10 ans, % code sans mainteneur, licences expirees" },
    ],
  },
  {
    code: "marketing", bot: "CMOB", gradient: "from-pink-600 to-pink-500",
    diagnostics: [
      { title: "Positionnement et marque", measures: "Notoriete, differenciation, coherence messaging", dataPoints: "Score notoriete, proposition valeur claire, coherence visuelle" },
      { title: "Marketing digital et acquisition", measures: "Site web, SEO, reseaux sociaux, cout d'acquisition", dataPoints: "Trafic web/mois, taux conversion, CAC, leads/mois, budget mktg % CA" },
      { title: "Experience client (CX)", measures: "Parcours client, NPS, satisfaction, points de friction", dataPoints: "NPS, delai reponse, nb touchpoints, taux resolution 1er contact" },
      { title: "Go-to-Market et lancement", measures: "Processus lancement, canaux, analyse win/loss", dataPoints: "Nb lancements/an, delai idee->marche, taux succes, win/loss formel" },
    ],
  },
  {
    code: "strategie", bot: "CSOB", gradient: "from-red-600 to-red-500",
    diagnostics: [
      { title: "Positionnement concurrentiel", measures: "Parts de marche, avantages competitifs, menaces", dataPoints: "Part de marche, nb concurrents directs, barrieres entree" },
      { title: "Modele d'affaires", measures: "Sources revenus, recurrence, scalabilite, marges", dataPoints: "% revenus recurrents, nb segments, marge par segment, scalabilite" },
      { title: "Croissance et expansion", measures: "Nouveaux marches, produits, M&A, partenariats", dataPoints: "Croissance CA 3 ans, produits/an, pipeline M&A, partenariats strat." },
      { title: "Veille strategique", measures: "Tendances, disruption, signaux faibles", dataPoints: "Processus veille formel, budget veille, frequence rapports" },
    ],
  },
  {
    code: "operations", bot: "COOB", gradient: "from-orange-600 to-orange-500",
    diagnostics: [
      { title: "Efficacite operationnelle", measures: "Flux, processus, bottlenecks, valeur ajoutee vs gaspillage", dataPoints: "Nb etapes processus, % valeur ajoutee, temps de cycle, lead time" },
      { title: "Chaine d'approvisionnement", measures: "Fournisseurs, delais, fiabilite, risques", dataPoints: "Nb fournisseurs critiques, % livraisons a temps, sources alternatives" },
      { title: "Qualite et amelioration continue", measures: "Defauts, couts non-qualite, certifications", dataPoints: "Taux rejets %, cout non-qualite % CA, certification, actions correctives" },
      { title: "Planification et ordonnancement", measures: "Capacite vs demande, previsions, adequation", dataPoints: "% utilisation capacite, precision previsions, changements urgents/sem" },
      { title: "Achats et approvisionnement", measures: "Processus, negociation, contrats, evaluation fournisseurs", dataPoints: "% achats sous contrat, frequence eval fournisseurs, savings/an" },
    ],
  },
  {
    code: "production", bot: "CPOB", gradient: "from-amber-600 to-amber-500",
    diagnostics: [
      { title: "Performance production (TRS/OEE)", measures: "Disponibilite x performance x qualite par ligne", dataPoints: "TRS global, TRS par ligne, top 3 causes arrets, SMED" },
      { title: "Maintenance et fiabilite", measures: "Preventif vs correctif, MTBF, MTTR, couts", dataPoints: "% maintenance preventive, MTBF, MTTR, cout maintenance % actifs" },
      { title: "SST et environnement", measures: "Taux frequence, inspections, ergonomie, CNESST", dataPoints: "Taux frequence accidents, quasi-accidents/mois, audit SST, ergonomie" },
      { title: "Layout et flux de production", measures: "Distances, croisements, 5S, organisation physique", dataPoints: "Distance parcourue piece typique, croisements flux, score 5S, age layout" },
      { title: "Potentiel d'automatisation", measures: "Par famille (soudage, assemblage, manutention), ROI", dataPoints: "Nb postes repetitifs, taux robotisation, payback estime" },
    ],
  },
  {
    code: "rh", bot: "CHROB", gradient: "from-teal-600 to-teal-500",
    diagnostics: [
      { title: "Culture organisationnelle", measures: "Valeurs vecues vs affichees, engagement, appartenance", dataPoints: "Valeurs formalisees, score engagement, eNPS, participation" },
      { title: "Gestion des talents", measures: "Inventaire competences, ecarts, plans developpement", dataPoints: "% postes avec profil, plans developpement actifs, matrice talents" },
      { title: "Retention et attraction", measures: "Taux roulement, couts recrutement, marque employeur", dataPoints: "Taux roulement annuel, cout moyen recrutement, delai comblement" },
      { title: "Formation et developpement", measures: "Budget, heures, efficacite, plans de carriere", dataPoints: "Budget formation % masse salariale, heures/employe/an, % plan carriere" },
      { title: "Climat et bien-etre", measures: "Satisfaction, communication, leadership, sante psy", dataPoints: "Score satisfaction, frequence sondages, absenteisme, sante mentale" },
    ],
  },
  {
    code: "innovation", bot: "CINOB", gradient: "from-rose-600 to-rose-500",
    diagnostics: [
      { title: "Capacite d'innovation", measures: "Processus ideation, pipeline, budget R&D, time-to-market", dataPoints: "Budget R&D % CA, projets innovation actifs, delai idee->prototype" },
      { title: "Propriete intellectuelle", measures: "Brevets, marques, secrets commerciaux, valorisation", dataPoints: "Nb brevets actifs, nb marques, budget PI/an, valeur portefeuille PI" },
      { title: "Veille technologique", measures: "Processus veille, partenariats universites", dataPoints: "Veille formelle, partenariats academiques, foires/conferences" },
      { title: "Culture d'innovation", measures: "Programme idees employes, labs, incitatifs", dataPoints: "Programme suggestion, nb idees/an, % implantees, budget dedie" },
    ],
  },
  {
    code: "ventes", bot: "CROB", gradient: "from-cyan-600 to-cyan-500",
    diagnostics: [
      { title: "Processus de vente et pipeline", measures: "Etapes, conversion, cycle de vente, CRM", dataPoints: "Nb etapes pipeline, taux conversion, cycle vente jours, CRM utilise" },
      { title: "Performance commerciale", measures: "Revenus par rep, quotas, win rate, panier moyen", dataPoints: "CA par rep, % atteinte quota, win rate, panier moyen" },
      { title: "Fidelisation et retention", measures: "Churn, upsell, satisfaction post-vente", dataPoints: "Taux retention, % revenus upsell/cross-sell, satisfaction post-vente" },
      { title: "Pricing et soumissions", measures: "Methode pricing, delai soumission, taux succes", dataPoints: "Methode pricing, delai soumission jours, taux succes soumissions" },
      { title: "Developpement de territoire", measures: "Couverture geo, penetration, comptes dormants", dataPoints: "% territoire couvert, comptes actifs vs potentiel, comptes dormants" },
    ],
  },
  {
    code: "legal", bot: "CLOB", gradient: "from-indigo-600 to-indigo-500",
    diagnostics: [
      { title: "Conformite reglementaire", measures: "Lois applicables, licences, permis, risques", dataPoints: "Nb lois applicables, % permis a jour, derniere verification, amendes 3 ans" },
      { title: "Gestion contractuelle", measures: "Contrats actifs, renouvellements, clauses critiques", dataPoints: "Nb contrats actifs, % renouvellement auto, clauses penalite, centralisation" },
      { title: "Protection donnees (Loi 25)", measures: "Consentement, registre, politiques, incidents", dataPoints: "Politique vie privee a jour, responsable nomme, registre incidents" },
      { title: "Gouvernance et structure legale", measures: "Structure, conventions, CA, risques litigieux", dataPoints: "Type societe, convention actionnaires, frequence CA, litiges en cours" },
    ],
  },
  {
    code: "securite", bot: "CISOB", gradient: "from-gray-600 to-gray-500",
    diagnostics: [
      { title: "Posture cybersecurite", measures: "Pare-feu, MFA, formation, tests penetration", dataPoints: "MFA active %, antivirus a jour, formation employes, tests penetration" },
      { title: "Resilience (PCA/PRA)", measures: "Plan continuite, backup, RTO/RPO, tests reprise", dataPoints: "PCA documente, frequence backup, RTO cible, dernier test reprise" },
      { title: "Gestion risques informationnels", measures: "Classification donnees, acces, journalisation", dataPoints: "Donnees classifiees, moindre privilege, logs centralises, incidents/an" },
      { title: "Conformite securite", measures: "Ecart vs norme cible (SOC 2, ISO 27001, NIST)", dataPoints: "Norme cible identifiee, % controles implantes, dernier audit, roadmap" },
    ],
  },
];

// ══════════════════════════════════════════
// PROFIL TYPES → DEPARTEMENT MAPPING
// Quel type de client est concerne par quel departement
// ══════════════════════════════════════════

const ALL_PROFILS: ProfilType[] = ["MFG", "EXP", "DEV", "INT", "DST", "ORG", "OPS", "FND"];
const DEPT_PROFIL_MAP: Record<string, ProfilType[]> = {
  direction:   ALL_PROFILS,
  finance:     ALL_PROFILS,
  technologie: ["MFG", "EXP", "DEV", "INT", "OPS"],
  marketing:   ["MFG", "EXP", "DEV", "INT", "DST", "ORG"],
  strategie:   ALL_PROFILS,
  operations:  ["MFG", "EXP", "DST", "OPS"],
  production:  ["MFG", "OPS"],
  rh:          ALL_PROFILS,
  innovation:  ["MFG", "EXP", "DEV"],
  ventes:      ["MFG", "EXP", "DEV", "INT", "DST"],
  legal:       ["MFG", "EXP", "DEV", "INT", "DST", "ORG"],
  securite:    ["MFG", "EXP", "DEV", "INT", "OPS"],
};

// ══════════════════════════════════════════
// MERGE FUNCTION — buildUnifiedCatalogue
// ══════════════════════════════════════════

/**
 * Normalise un titre pour le matching (lowercase, sans accents, sans ponctuation)
 */
function normalizeTitle(t: string): string {
  return t.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

/**
 * Tente de matcher un diagnostic enrichi (V1) avec un squelette V3 par departement + titre
 * Matching flou: contient les mots cles du titre V3
 */
function findEnrichedMatch(v3Title: string, v3Dept: string, enrichis: DiagnosticCatalogue[]): DiagnosticCatalogue | undefined {
  const normV3 = normalizeTitle(v3Title);
  const deptEnrichis = enrichis.filter(e => e.departement === v3Dept);

  // Exact match first
  const exact = deptEnrichis.find(e => normalizeTitle(e.titre) === normV3);
  if (exact) return exact;

  // Fuzzy: check if V3 title keywords appear in enriched title
  const v3Words = normV3.split(" ").filter(w => w.length > 3);
  return deptEnrichis.find(e => {
    const normE = normalizeTitle(e.titre);
    return v3Words.filter(w => normE.includes(w)).length >= Math.ceil(v3Words.length * 0.5);
  });
}

/**
 * Fusionne les 54 squelettes V3 avec les 43 diagnostics enrichis V1.
 * Retourne 54 UnifiedDiagnostic: 43 enrichis + 11 squelette-only.
 */
export function buildUnifiedCatalogue(enrichis: DiagnosticCatalogue[]): UnifiedDiagnostic[] {
  const result: UnifiedDiagnostic[] = [];
  const usedEnrichedIds = new Set<string>();

  for (const dept of DEPT_DIAGNOSTICS_V3) {
    for (const v3Diag of dept.diagnostics) {
      const match = findEnrichedMatch(v3Diag.title, dept.code, enrichis);

      if (match) {
        usedEnrichedIds.add(match.id);
        result.push({
          id: match.id,
          titre: match.titre,
          description: match.description,
          departement: match.departement,
          bot_primaire: match.bot_primaire,
          bots_support: match.bots_support || [],
          industrie: match.industrie,
          duree_minutes: match.duree_minutes,
          nb_questions: match.nb_questions,
          valeur_potentielle: match.valeur_potentielle,
          gradient: match.gradient || dept.gradient,
          data_points: (match.data_points || []).map(dp => ({
            cle: dp.cle,
            label: dp.label,
            type: dp.type,
            options: dp.options,
            benchmark: (dp as any).benchmark || (dp as any).benchmark_industrie || "",
            critique: dp.critique,
            unite: dp.unite,
          })),
          gaps_typiques: (match.gaps_typiques || []).map(g => ({
            gap: (g as any).gap || "",
            impact: (g as any).impact || "",
            fournisseurs_types: (g as any).fournisseurs_types || [],
            chantier_suggere: (g as any).chantier_suggere || "",
          })),
          measures: v3Diag.measures,
          rawDataPoints: v3Diag.dataPoints,
          profilTypes: DEPT_PROFIL_MAP[dept.code] || ALL_PROFILS,
          enrichi: true,
        });
      } else {
        // Squelette only — pas de data_points interactifs
        const slug = `${dept.code}-${normalizeTitle(v3Diag.title).replace(/ /g, "-").slice(0, 40)}`;
        result.push({
          id: slug,
          titre: v3Diag.title,
          description: v3Diag.measures,
          departement: dept.code,
          bot_primaire: dept.bot,
          bots_support: [],
          industrie: null,
          duree_minutes: 15,
          nb_questions: 0,
          valeur_potentielle: "",
          gradient: dept.gradient,
          data_points: [],
          gaps_typiques: [],
          measures: v3Diag.measures,
          rawDataPoints: v3Diag.dataPoints,
          profilTypes: DEPT_PROFIL_MAP[dept.code] || ALL_PROFILS,
          enrichi: false,
        });
      }
    }
  }

  // Ajouter les enrichis non-matche (orphelins V1 qui n'ont pas de squelette V3 correspondant)
  for (const e of enrichis) {
    if (!usedEnrichedIds.has(e.id)) {
      result.push({
        id: e.id,
        titre: e.titre,
        description: e.description,
        departement: e.departement,
        bot_primaire: e.bot_primaire,
        bots_support: e.bots_support || [],
        industrie: e.industrie,
        duree_minutes: e.duree_minutes,
        nb_questions: e.nb_questions,
        valeur_potentielle: e.valeur_potentielle,
        gradient: e.gradient,
        data_points: (e.data_points || []).map(dp => ({
          cle: dp.cle,
          label: dp.label,
          type: dp.type,
          options: dp.options,
          benchmark: (dp as any).benchmark || (dp as any).benchmark_industrie || "",
          critique: dp.critique,
          unite: dp.unite,
        })),
        gaps_typiques: (e.gaps_typiques || []).map(g => ({
          gap: (g as any).gap || "",
          impact: (g as any).impact || "",
          fournisseurs_types: (g as any).fournisseurs_types || [],
          chantier_suggere: (g as any).chantier_suggere || "",
        })),
        profilTypes: DEPT_PROFIL_MAP[e.departement] || ALL_PROFILS,
        enrichi: true,
      });
    }
  }

  return result;
}

// ══════════════════════════════════════════
// HELPER EXPORTS
// ══════════════════════════════════════════

/** PROFIL_TYPES_MAP — Record indexe par code (l'original est un array) */
export const PROFIL_TYPES_MAP: Record<ProfilType, { nom: string; description: string; color: string }> = Object.fromEntries(
  PROFIL_TYPES.map(p => [p.code, { nom: p.nom, description: p.description, color: p.color }])
) as any;
export type { ProfilType };

/** Filtre le catalogue par type de profil client */
export function filterByProfil(catalogue: UnifiedDiagnostic[], profil: ProfilType | null): UnifiedDiagnostic[] {
  if (!profil) return catalogue;
  return catalogue.filter(d => d.profilTypes.includes(profil));
}

/** Filtre par departement */
export function filterByDept(catalogue: UnifiedDiagnostic[], dept: string | null): UnifiedDiagnostic[] {
  if (!dept) return catalogue;
  return catalogue.filter(d => d.departement === dept);
}

/** Compte les diagnostics enrichis vs total */
export function getCatalogueStats(catalogue: UnifiedDiagnostic[]) {
  const total = catalogue.length;
  const enrichis = catalogue.filter(d => d.enrichi).length;
  const aVenir = total - enrichis;
  return { total, enrichis, aVenir };
}
