/**
 * execution.mock.ts — Mock data pour Exécution (En direct + Opérations + Rétroaction)
 *
 * Centralise TOUTES les données mock des 3 onglets Exécution:
 * - ExecutionLiveTab: MOCK_KPIS, MOCK_PRIORITIES, MOCK_ACTIVITY
 * - RetroactionTab: MOCK_CYCLES, MOCK_APPRENTISSAGES, MOCK_RECOMMANDATIONS, MOCK_METRIQUES
 * - OperationsView: MOCK_OPERATIONS + getMockOperations()
 */

import {
  Flame, Settings, Target, BarChart3,
  CheckCircle2, TrendingUp, Lightbulb,
} from "lucide-react";
import type { PhaseKey } from "../../sections/shared/dept-data";

// ═══════════════════════════════════════════════════════════════
// Types — ExecutionLiveTab
// ═══════════════════════════════════════════════════════════════

export interface PriorityItem {
  id: number;
  titre: string;
  type: "chantier" | "operation";
  phase: PhaseKey;
  progression: number;
  urgence: "critique" | "haute" | "normale";
  botPrimaire: string;
  echeance: string;
  description: string;
}

export interface ActivityItem {
  id: number;
  date: string;
  type: "livrable" | "decision" | "alerte" | "completion" | "creation";
  message: string;
  source: "chantier" | "operation";
  sourceName: string;
  auteur: string;
}

// ═══════════════════════════════════════════════════════════════
// Types — RetroactionTab
// ═══════════════════════════════════════════════════════════════

export interface CompletedCycle {
  id: number;
  titre: string;
  type: "chantier" | "operation";
  dateCompletion: string;
  duree: string;
  scorePerformance: number;
  botPrimaire: string;
  resultats: string;
}

export interface Apprentissage {
  type: "positif" | "negatif" | "action";
  message: string;
  source: string;
}

export interface Recommandation {
  bot: string;
  message: string;
  priorite: "haute" | "moyenne" | "basse";
  categorie: string;
}

// ═══════════════════════════════════════════════════════════════
// Types — OperationsView
// ═══════════════════════════════════════════════════════════════

export interface MockExecutionLog { date: string; statut: "conforme" | "retard" | "echec" | "partiel"; duree: string; note?: string }
export interface MockDocument { id: string; titre: string; type: string; format: string; modifie: string; auteur: string }
export interface MockCheckItem { label: string; done: boolean }
export interface MockRACIItem { type: "R" | "A" | "C" | "I"; bot: string; role: string }
export interface MockDecisionLog { date: string; decision: string; decideur: string; rationnel: string }
export interface MockDependency { label: string; type: "bloque" | "depend"; entite: string; statut: "resolu" | "en-cours" | "critique" }
export interface MockConferenceAI { id: string; date: string; titre: string; duree: string; participants: string[]; resume?: string }
export interface MockActivityLog { date: string; type: "creation" | "modification" | "decision" | "livrable" | "commentaire"; action: string; auteur: string }
export interface MockKPICible { label: string; cible: string; actuel: string; ok: boolean }

export interface MockEtapeItem {
  id: number; titre: string; description: string; cadence: string;
  dureeEstimee: string; assignee: string; statut: "complete" | "en_cours" | "a-faire";
  instructions?: string; validateur?: string;
}

export interface MockRoutineItem {
  id: number; titre: string; description: string; cadence: string;
  sla: string; regularity: number; botPrimaire: string;
  etapes: MockEtapeItem[];
  checklist?: MockCheckItem[];
  historique?: MockExecutionLog[];
  documents?: MockDocument[];
  risques?: string[];
  kpisCibles?: MockKPICible[];
}

export interface MockProcessusItem {
  id: number; titre: string; description: string; cadence: string;
  regularity: number; botPrimaire: string; echeance: string;
  routines: MockRoutineItem[];
  documents?: MockDocument[];
  historique?: MockExecutionLog[];
  derniereExecution?: string;
  prochaineExecution?: string;
  raci?: MockRACIItem[];
  risques?: string[];
  dependances?: MockDependency[];
}

export interface MockOperationItem {
  id: number; titre: string; description: string; phase: PhaseKey;
  cadence: string; sla: string; regularity: number;
  botPrimaire: string; botCodes: string[];
  processus: MockProcessusItem[];
  sourceChantier?: string;
  derniereExecution?: string;
  prochaineExecution?: string;
  historique?: MockExecutionLog[];
  documents?: MockDocument[];
  sante?: { score: number; tendance: "up" | "down" | "stable"; conformite?: string; optimisation?: string };
  raci?: MockRACIItem[];
  risques?: string[];
  livrables?: string[];
  kpisCibles?: MockKPICible[];
  coutRecurrent?: string;
  dependances?: MockDependency[];
  decisions?: MockDecisionLog[];
  conferences?: MockConferenceAI[];
  activites?: MockActivityLog[];
  bilanOptimisation?: { positifs: string[]; negatifs: string[]; actions: string[] };
}

// ═══════════════════════════════════════════════════════════════
// Mock data — ExecutionLiveTab
// ═══════════════════════════════════════════════════════════════

export const MOCK_KPIS = [
  { label: "Chantiers", value: "4", icon: Flame, delta: "+1 ce mois", up: true, color: "text-orange-600" },
  { label: "Missions", value: "12", icon: Target, delta: "3 à livrer", up: false, color: "text-blue-600" },
  { label: "Opérations", value: "6", icon: Settings, delta: "98% SLA", up: true, color: "text-cyan-600" },
  { label: "Régularité", value: "87%", icon: BarChart3, delta: "+3 pts", up: true, color: "text-emerald-600" },
];

export const MOCK_PRIORITIES: PriorityItem[] = [
  { id: 1, titre: "Implantation ERP Module Ventes", type: "chantier", phase: "execution", progression: 65, urgence: "critique", botPrimaire: "CTOB", echeance: "2026-05-15", description: "Migration CRM → ERP ventes. Phase Go-Live critique." },
  { id: 2, titre: "Cycle de facturation mensuel", type: "operation", phase: "execution", progression: 92, urgence: "haute", botPrimaire: "CFOB", echeance: "2026-04-30", description: "Processus récurrent — SLA 48h. Relance automatique." },
  { id: 3, titre: "Refonte site web corporatif", type: "chantier", phase: "creation", progression: 35, urgence: "haute", botPrimaire: "CMOB", echeance: "2026-06-01", description: "Design V3 + migration contenu. Maquettes en validation." },
  { id: 4, titre: "Pipeline CI/CD automatisation", type: "operation", phase: "execution", progression: 88, urgence: "normale", botPrimaire: "CTOB", echeance: "Récurrent", description: "Déploiement continu — tests + staging + prod." },
  { id: 5, titre: "Campagne acquisition Q2", type: "chantier", phase: "reflexion", progression: 15, urgence: "normale", botPrimaire: "CMOB", echeance: "2026-07-01", description: "Stratégie multicanal en planification." },
  { id: 6, titre: "Revue de performance mensuelle", type: "operation", phase: "execution", progression: 95, urgence: "haute", botPrimaire: "COOB", echeance: "2026-04-28", description: "Boucle PDCA — collecte KPIs + bilan direction." },
];

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 1, date: "il y a 2h", type: "livrable", message: "Maquette homepage V3 livrée", source: "chantier", sourceName: "Refonte site web", auteur: "Mathilde (CMO)" },
  { id: 2, date: "il y a 3h", type: "decision", message: "Go-Live ERP reporté au 15 mai (validation QA)", source: "chantier", sourceName: "Implantation ERP", auteur: "CarlOS (CEO)" },
  { id: 3, date: "il y a 5h", type: "completion", message: "Cycle facturation avril — 98% conformité", source: "operation", sourceName: "Facturation mensuelle", auteur: "Frank (CFO)" },
  { id: 4, date: "hier", type: "alerte", message: "SLA relance dépassé de 4h sur 2 comptes", source: "operation", sourceName: "Facturation mensuelle", auteur: "Système" },
  { id: 5, date: "hier", type: "creation", message: "Nouveau chantier: Campagne acquisition Q2", source: "chantier", sourceName: "Campagne Q2", auteur: "Simone (CSO)" },
  { id: 6, date: "il y a 2j", type: "livrable", message: "Pipeline CI/CD V2 déployé — temps de build -40%", source: "operation", sourceName: "Pipeline CI/CD", auteur: "Tim (CTO)" },
  { id: 7, date: "il y a 2j", type: "decision", message: "Budget marketing Q2 approuvé: 45K$", source: "chantier", sourceName: "Campagne Q2", auteur: "CarlOS (CEO)" },
  { id: 8, date: "il y a 3j", type: "completion", message: "Revue performance mars terminée — 4 actions identifiées", source: "operation", sourceName: "Revue de performance", auteur: "Olivier (COO)" },
];

// ═══════════════════════════════════════════════════════════════
// Mock data — RetroactionTab
// ═══════════════════════════════════════════════════════════════

export const MOCK_CYCLES: CompletedCycle[] = [
  { id: 1, titre: "Migration CRM Salesforce", type: "chantier", dateCompletion: "2026-04-10", duree: "3 mois", scorePerformance: 88, botPrimaire: "CTOB", resultats: "Migration complétée. 230 utilisateurs transférés. 2 semaines de retard (intégration API)." },
  { id: 2, titre: "Onboarding Q1 2026", type: "operation", dateCompletion: "2026-03-31", duree: "Cycle Q1", scorePerformance: 94, botPrimaire: "CHROB", resultats: "12 employés onboardés. Satisfaction 94%. Temps moyen réduit de 2 semaines à 8 jours." },
  { id: 3, titre: "Audit sécurité annuel", type: "operation", dateCompletion: "2026-04-05", duree: "Cycle annuel", scorePerformance: 91, botPrimaire: "CISOB", resultats: "42 vulnérabilités corrigées. 3 critiques, 15 hautes. Score passé de 72% à 91%." },
  { id: 4, titre: "Sprint design V2 marque", type: "chantier", dateCompletion: "2026-03-20", duree: "6 semaines", scorePerformance: 76, botPrimaire: "CMOB", resultats: "Nouveau brand book livré. 3 itérations nécessaires (brief initial incomplet)." },
  { id: 5, titre: "Boucle PDCA Mars", type: "operation", dateCompletion: "2026-03-31", duree: "Mensuel", scorePerformance: 85, botPrimaire: "COOB", resultats: "14 KPIs mesurés. 11 dans la cible. 3 actions correctives lancées." },
];

export const MOCK_APPRENTISSAGES: Apprentissage[] = [
  { type: "positif", message: "Le pipeline CI/CD a réduit les incidents de déploiement de 67%", source: "Pipeline CI/CD" },
  { type: "positif", message: "L'onboarding structuré en 8 jours augmente la rétention à 6 mois de 23%", source: "Onboarding Q1" },
  { type: "positif", message: "Les revues de code systématiques ont éliminé les bugs critiques en prod", source: "Pipeline CI/CD" },
  { type: "negatif", message: "Le brief incomplet du sprint design a causé 3 itérations évitables", source: "Sprint design V2" },
  { type: "negatif", message: "Sous-estimation du temps d'intégration API dans la migration CRM", source: "Migration CRM" },
  { type: "negatif", message: "Manque de documentation des processus opérationnels existants", source: "Boucle PDCA" },
  { type: "action", message: "Standardiser les briefs créatifs avec un template obligatoire", source: "Sprint design V2" },
  { type: "action", message: "Ajouter un buffer de 30% pour les intégrations tierces", source: "Migration CRM" },
  { type: "action", message: "Créer une base de connaissances opérationnelle dans la Data Room", source: "Boucle PDCA" },
  { type: "action", message: "Automatiser les tests de régression avant chaque cycle", source: "Pipeline CI/CD" },
];

export const MOCK_RECOMMANDATIONS: Recommandation[] = [
  { bot: "COOB", message: "La régularité des opérations a augmenté de 8 points ce trimestre. Recommandation: transformer le chantier 'Pipeline CI/CD' en opération permanente avec SLA de 99.5%.", priorite: "haute", categorie: "Pérennisation" },
  { bot: "CEOB", message: "3 chantiers terminés sans retro formelle. Planifier une session de lessons learned consolidée avant le kick-off Q2.", priorite: "haute", categorie: "Gouvernance" },
  { bot: "CFOB", message: "Le coût moyen des chantiers a baissé de 12% grâce à la réutilisation de composants. Capitaliser ce pattern dans le playbook 'Efficience CAPEX'.", priorite: "moyenne", categorie: "Optimisation" },
  { bot: "CTOB", message: "Le temps de résolution des incidents a augmenté de 15% — investiguer la charge de l'équipe tech et évaluer un recrutement.", priorite: "moyenne", categorie: "Capacité" },
];

export const MOCK_METRIQUES = [
  { label: "Régularité", value: "87%", delta: "+3 pts", up: true, icon: BarChart3 },
  { label: "Vélocité", value: "1.2x", delta: "+0.1x", up: true, icon: TrendingUp },
  { label: "SLA", value: "96%", delta: "+2 pts", up: true, icon: CheckCircle2 },
  { label: "Amélioration", value: "14%", delta: "+5 pts QoQ", up: true, icon: Lightbulb },
];

// ═══════════════════════════════════════════════════════════════
// Mock data — OperationsView
// ═══════════════════════════════════════════════════════════════

export const MOCK_OPERATIONS: Record<string, MockOperationItem[]> = {
  CEOB: [
    {
      id: 1, titre: "Cycle de facturation mensuel", description: "Processus récurrent de facturation client, encaissement et relance. Transformé du chantier 'Refonte facturation' (CAPEX→OPEX).",
      phase: "execution", cadence: "Mensuel", sla: "J+5", regularity: 92,
      botPrimaire: "CFOB", botCodes: ["CFOB", "COOB", "CROB"],
      sourceChantier: "Refonte facturation Q1",
      derniereExecution: "2026-04-05", prochaineExecution: "2026-05-01",
      coutRecurrent: "2 450 $/mois",
      sante: { score: 92, tendance: "up", conformite: "11/12 cycles conformes", optimisation: "Automatiser l'envoi batch pour gagner 2h/mois" },
      historique: [
        { date: "2026-04-05", statut: "conforme", duree: "4.5 jours", note: "Toutes factures envoyées J+4" },
        { date: "2026-03-05", statut: "conforme", duree: "5 jours" },
        { date: "2026-02-05", statut: "retard", duree: "7 jours", note: "Retard extraction ERP — bug corrigé" },
        { date: "2026-01-05", statut: "conforme", duree: "4 jours" },
      ],
      documents: [
        { id: "od1", titre: "SOP Facturation mensuelle", type: "procédure", format: "PDF", modifie: "2026-03-15", auteur: "Frank (CFO)" },
        { id: "od2", titre: "Template facture V3", type: "template", format: "HTML", modifie: "2026-04-01", auteur: "Frank (CFO)" },
        { id: "od3", titre: "Rapport conformité Q1", type: "rapport", format: "Excel", modifie: "2026-04-10", auteur: "Olivier (COO)" },
      ],
      raci: [
        { type: "R", bot: "CFOB", role: "Exécution facturation & validation" },
        { type: "A", bot: "CEOB", role: "Approbation finale cycle" },
        { type: "C", bot: "CROB", role: "Suivi relances & encaissement" },
        { type: "I", bot: "COOB", role: "Reporting conformité" },
      ],
      risques: [
        "Timeout ERP lors de l'extraction (récurrence: 1/12 mois)",
        "Erreur de tarification si grille pas à jour",
        "Retard envoi si serveur email indisponible",
      ],
      livrables: [
        "Factures PDF générées et envoyées",
        "Rapport de conformité mensuel",
        "Tableau de suivi encaissements",
        "Relances automatiques J+15/30/45",
      ],
      kpisCibles: [
        { label: "Délai envoi factures", cible: "≤ J+5", actuel: "J+4", ok: true },
        { label: "Taux erreurs factures", cible: "< 2%", actuel: "0.8%", ok: true },
        { label: "Taux encaissement J+30", cible: "> 85%", actuel: "82%", ok: false },
        { label: "Temps cycle complet", cible: "≤ 5 jours", actuel: "4.5 jours", ok: true },
      ],
      dependances: [
        { label: "Extraction ERP doit être complétée avant calcul", type: "depend", entite: "Processus: Génération factures", statut: "resolu" },
        { label: "Relances bloquent la clôture mensuelle si non envoyées", type: "bloque", entite: "Processus: Encaissement", statut: "en-cours" },
      ],
      decisions: [
        { date: "2026-04-02", decision: "Passage à l'envoi batch automatique en mai", decideur: "Frank (CFO)", rationnel: "Réduire le temps cycle de 5j à 3j et éliminer les erreurs manuelles d'envoi." },
        { date: "2026-03-10", decision: "Ajout validation croisée ERP↔Dashboard", decideur: "Tim (CTO)", rationnel: "Suite au retard février, on valide automatiquement les montants extraits." },
      ],
      conferences: [
        { id: "oc1", date: "2026-04-08", titre: "Revue cycle facturation Q1", duree: "25 min", participants: ["CFOB", "COOB", "CROB"], resume: "Performance 92% — objectif 95% pour Q2. Automatisation batch prioritaire." },
      ],
      activites: [
        { date: "2026-04-10", type: "livrable", action: "Rapport conformité Q1 livré", auteur: "Olivier (COO)" },
        { date: "2026-04-08", type: "decision", action: "Envoi batch automatique approuvé pour mai", auteur: "Frank (CFO)" },
        { date: "2026-04-05", type: "modification", action: "Cycle avril exécuté — J+4 conforme", auteur: "Frank (CFO)" },
        { date: "2026-03-10", type: "creation", action: "Script validation croisée ERP ajouté", auteur: "Tim (CTO)" },
        { date: "2026-02-20", type: "commentaire", action: "Bug extraction ERP documenté et corrigé", auteur: "Tim (CTO)" },
      ],
      bilanOptimisation: {
        positifs: ["Régularité 92% maintenue sur 12 mois", "Temps cycle réduit de 7j à 4.5j", "Zéro erreur tarification depuis mars"],
        negatifs: ["Envoi encore manuel (2h/mois)", "Taux encaissement J+30 sous la cible", "Pas de fallback si serveur email down"],
        actions: ["Implémenter envoi batch automatique (mai)", "Ajouter alerte SMS pour relances critiques", "Créer procédure de fallback email"],
      },
      processus: [
        {
          id: 101, titre: "Génération des factures", description: "Extraction des données de livraison, calcul des montants, génération PDF et envoi automatique.",
          cadence: "Mensuel (J+1)", regularity: 95, botPrimaire: "CFOB", echeance: "Récurrent",
          derniereExecution: "2026-04-01", prochaineExecution: "2026-05-01",
          documents: [{ id: "pd1", titre: "Script extract_billing.py", type: "code", format: "Python", modifie: "2026-03-20", auteur: "Tim (CTO)" }],
          historique: [
            { date: "2026-04-01", statut: "conforme", duree: "6h" },
            { date: "2026-03-01", statut: "conforme", duree: "7h" },
            { date: "2026-02-01", statut: "retard", duree: "14h", note: "Timeout ERP, relance manuelle" },
          ],
          raci: [
            { type: "R", bot: "CFOB", role: "Exécution extraction & génération" },
            { type: "C", bot: "CTOB", role: "Support technique script" },
          ],
          risques: ["Timeout ERP si volume > 500 lignes", "Grille tarifaire périmée"],
          routines: [
            { id: 1001, titre: "Extraction données ERP", description: "Collecter les données de livraison du mois écoulé depuis l'ERP.", cadence: "Mensuel J+1", sla: "4h", regularity: 98, botPrimaire: "CTOB",
              checklist: [{ label: "Paramètres mois configurés", done: true }, { label: "Connexion ERP vérifiée", done: true }, { label: "Données extraites sans erreur", done: true }, { label: "Montants validés vs dashboard", done: false }],
              historique: [{ date: "2026-04-01", statut: "conforme", duree: "35 min" }, { date: "2026-03-01", statut: "conforme", duree: "40 min" }],
              documents: [{ id: "rd1", titre: "Runbook extraction ERP", type: "procédure", format: "Markdown", modifie: "2026-03-10", auteur: "Tim (CTO)" }],
              kpisCibles: [{ label: "Durée extraction", cible: "< 1h", actuel: "35 min", ok: true }, { label: "Erreurs données", cible: "0", actuel: "0", ok: true }],
              etapes: [
                { id: 10001, titre: "Lancer le script d'extraction", description: "Exécuter extract_billing.py avec les paramètres du mois.", cadence: "Mensuel", dureeEstimee: "15 min", assignee: "Tim (CTO)", statut: "complete", instructions: "cd /opt/billing && python3 extract_billing.py --month=$(date +%Y-%m) --validate", validateur: "Frank (CFO)" },
                { id: 10002, titre: "Valider les données extraites", description: "Vérifier la cohérence des montants avec le dashboard.", cadence: "Mensuel", dureeEstimee: "30 min", assignee: "Frank (CFO)", statut: "complete" },
              ],
            },
            { id: 1002, titre: "Calcul et génération PDF", description: "Appliquer les tarifs, calculer les taxes et générer les factures PDF.", cadence: "Mensuel J+2", sla: "8h", regularity: 90, botPrimaire: "CFOB",
              checklist: [{ label: "Grille tarifaire à jour", done: true }, { label: "Taxes calculées correctement", done: false }, { label: "PDFs générés sans erreur", done: false }],
              etapes: [
                { id: 10003, titre: "Appliquer la grille tarifaire", description: "Vérifier les contrats actifs et appliquer les bons tarifs.", cadence: "Mensuel", dureeEstimee: "1h", assignee: "Frank (CFO)", statut: "en_cours" },
                { id: 10004, titre: "Générer les PDF", description: "Lancer la génération batch des factures.", cadence: "Mensuel", dureeEstimee: "20 min", assignee: "Tim (CTO)", statut: "a-faire" },
              ],
            },
            { id: 1003, titre: "Envoi et suivi", description: "Envoi des factures par email et suivi des ouvertures.", cadence: "Mensuel J+3", sla: "24h", regularity: 88, botPrimaire: "CMOB",
              etapes: [
                { id: 10005, titre: "Envoi batch par email", description: "Déclencher l'envoi via le système de mailing.", cadence: "Mensuel", dureeEstimee: "10 min", assignee: "Mathilde (CMO)", statut: "a-faire" },
              ],
            },
          ],
        },
        {
          id: 102, titre: "Encaissement et relances", description: "Suivi des paiements reçus, rapprochement bancaire et relances automatiques.",
          cadence: "Continu", regularity: 85, botPrimaire: "CFOB", echeance: "Récurrent",
          dependances: [{ label: "Factures doivent être envoyées avant relances", type: "depend", entite: "Processus: Génération factures", statut: "resolu" }],
          routines: [
            { id: 1004, titre: "Rapprochement bancaire", description: "Comparer les paiements reçus avec les factures émises.", cadence: "Hebdo", sla: "48h", regularity: 82, botPrimaire: "CFOB",
              etapes: [
                { id: 10006, titre: "Importer le relevé bancaire", description: "Télécharger le relevé et l'importer dans le système.", cadence: "Hebdo", dureeEstimee: "15 min", assignee: "Frank (CFO)", statut: "complete" },
              ],
            },
            { id: 1005, titre: "Relances automatiques", description: "Envoyer les relances J+15, J+30, J+45.", cadence: "Auto", sla: "J+15/30/45", regularity: 90, botPrimaire: "CROB",
              etapes: [
                { id: 10007, titre: "Vérifier la file de relances", description: "Contrôler les relances en attente.", cadence: "Quotidien", dureeEstimee: "10 min", assignee: "Rich (CRO)", statut: "en_cours" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 2, titre: "Maintenance préventive équipements", description: "Cycle récurrent d'inspection, maintenance et calibration des équipements de production.",
      phase: "execution", cadence: "Hebdo/Mensuel", sla: "72h", regularity: 78,
      botPrimaire: "CPOB", botCodes: ["CPOB", "COOB", "CISOB"],
      derniereExecution: "2026-04-14", prochaineExecution: "2026-04-21",
      coutRecurrent: "1 800 $/mois",
      sante: { score: 78, tendance: "down", conformite: "8/12 inspections conformes", optimisation: "Standardiser la check-list ligne 2 — trop de variabilité" },
      historique: [
        { date: "2026-04-14", statut: "partiel", duree: "3h", note: "Ligne 2 reportée — pièce en commande" },
        { date: "2026-04-07", statut: "conforme", duree: "4h" },
        { date: "2026-03-31", statut: "conforme", duree: "3.5h" },
      ],
      raci: [
        { type: "R", bot: "CPOB", role: "Exécution inspections & calibrations" },
        { type: "A", bot: "COOB", role: "Validation conformité" },
        { type: "I", bot: "CISOB", role: "Suivi sécurité" },
      ],
      risques: [
        "Pièces de rechange non disponibles (délai fournisseur 2-3 sem.)",
        "Variabilité check-list ligne 2 — résultats non reproductibles",
      ],
      livrables: [
        "Rapport d'inspection hebdomadaire",
        "Certificat de calibration mensuel",
        "Plan de maintenance préventive mis à jour",
      ],
      processus: [
        {
          id: 201, titre: "Inspections hebdomadaires", description: "Tour d'inspection visuel et fonctionnel des équipements critiques.",
          cadence: "Hebdo (lundi)", regularity: 85, botPrimaire: "CPOB", echeance: "Récurrent",
          routines: [
            { id: 2001, titre: "Check-list équipements", description: "Parcourir la check-list de 42 points pour chaque équipement.", cadence: "Hebdo", sla: "4h", regularity: 88, botPrimaire: "CPOB",
              checklist: [{ label: "Pression vérifiée", done: true }, { label: "Température dans les normes", done: true }, { label: "Vibrations normales", done: false }, { label: "Lubrification OK", done: false }],
              etapes: [
                { id: 20001, titre: "Inspection ligne 1", description: "Vérifier pression, température, vibrations.", cadence: "Hebdo", dureeEstimee: "45 min", assignee: "Paco (CPO)", statut: "complete" },
                { id: 20002, titre: "Inspection ligne 2", description: "Vérifier alignement, lubrification.", cadence: "Hebdo", dureeEstimee: "45 min", assignee: "Paco (CPO)", statut: "en_cours" },
              ],
            },
          ],
        },
        {
          id: 202, titre: "Calibration mensuelle", description: "Calibration des instruments de mesure et capteurs.",
          cadence: "Mensuel (1er lundi)", regularity: 72, botPrimaire: "CPOB", echeance: "Récurrent",
          routines: [
            { id: 2002, titre: "Calibration capteurs", description: "Recalibrer les capteurs de température et pression.", cadence: "Mensuel", sla: "8h", regularity: 70, botPrimaire: "CPOB",
              etapes: [
                { id: 20003, titre: "Préparer les standards", description: "Sortir les étalons certifiés.", cadence: "Mensuel", dureeEstimee: "30 min", assignee: "Paco (CPO)", statut: "a-faire" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 3, titre: "Reporting exécutif hebdomadaire", description: "Compilation et diffusion des KPIs stratégiques à la direction. Inclut le dashboard IA et les alertes VITAA.",
      phase: "execution", cadence: "Hebdo (vendredi)", sla: "EOD", regularity: 95,
      botPrimaire: "CEOB", botCodes: ["CEOB", "CFOB", "COOB"],
      derniereExecution: "2026-04-11", prochaineExecution: "2026-04-18",
      sante: { score: 95, tendance: "stable", conformite: "12/12 rapports livrés à temps" },
      kpisCibles: [
        { label: "Livraison avant 17h", cible: "100%", actuel: "100%", ok: true },
        { label: "Couverture départements", cible: "12/12", actuel: "12/12", ok: true },
      ],
      processus: [
        {
          id: 301, titre: "Collecte des KPIs", description: "Agrégation automatique des métriques de tous les départements.",
          cadence: "Hebdo (jeudi soir)", regularity: 96, botPrimaire: "COOB", echeance: "Récurrent",
          routines: [
            { id: 3001, titre: "Pull données départements", description: "Extraire les KPIs de chaque département via API.", cadence: "Hebdo", sla: "2h", regularity: 98, botPrimaire: "CTOB",
              etapes: [
                { id: 30001, titre: "Lancer l'agrégation", description: "Déclencher le script weekly_kpi_pull.py.", cadence: "Hebdo", dureeEstimee: "5 min", assignee: "Tim (CTO)", statut: "complete" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export function getMockOperations(botCode: string): MockOperationItem[] {
  return MOCK_OPERATIONS[botCode] || MOCK_OPERATIONS.CEOB || [];
}
