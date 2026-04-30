/**
 * chantiers.mock.ts — Mock data for ChantierView (drill-down 5 niveaux)
 *
 * Extracted from ChantierView.tsx — interfaces + MOCK_CHANTIERS + getMockChantiers
 */

import type { PhaseKey } from "../../sections/shared/dept-data";

// ── Mock interfaces ──
export interface MockDocument { id: string; titre: string; type: string; format: string; modifie: string; auteur: string }
export interface MockJalon { date: string; label: string; done: boolean }
export interface MockRACIItem { role: string; bot: string; type: "R" | "A" | "C" | "I" }
export interface MockCriterion { label: string; done: boolean }
export interface MockDependency { label: string; type: "bloque" | "bloque-par"; entite: string; statut: "resolu" | "en-cours" | "critique" }
export interface MockDecisionLog { date: string; decision: string; decideur: string; rationnel: string }
export interface MockConferenceAI { id: string; date: string; titre: string; participants: string[]; duree: string; resume?: string }
export interface MockActivityLog { date: string; action: string; auteur: string; type: "creation" | "modification" | "decision" | "livrable" | "commentaire" }
export interface MockTacheItem { id: number; titre: string; description: string; phase: PhaseKey; progression: number; assignee: string; echeance: string; documents: MockDocument[]; jalons: MockJalon[]; instructions?: string; validateur?: string; criteresAcceptation?: MockCriterion[]; dependances?: MockDependency[]; conferences?: MockConferenceAI[]; tempsEstime?: string; tempsReel?: string }
export interface MockMissionItem { id: number; titre: string; description: string; phase: PhaseKey; progression: number; botPrimaire: string; echeance: string; livrables: string[]; documents: MockDocument[]; jalons: MockJalon[]; taches: MockTacheItem[]; objectifs?: string[]; equipe?: string[]; criteresAcceptation?: MockCriterion[]; dependances?: MockDependency[]; conferences?: MockConferenceAI[] }
export interface MockProjetItem { id: number; titre: string; description: string; phase: PhaseKey; progression: number; botPrimaire: string; echeance: string; objectifs: string[]; livrables: string[]; budget: string; documents: MockDocument[]; jalons: MockJalon[]; missions: MockMissionItem[]; raci?: MockRACIItem[]; dependances?: MockDependency[]; decisions?: MockDecisionLog[]; conferences?: MockConferenceAI[]; sante?: { score: number; tendance: "up" | "down" | "stable"; burnRate?: string; roi?: string } }
export interface MockChantierItem {
  id: number; titre: string; description: string; phase: PhaseKey; progression: number;
  echeance: string; dateDebut: string; botPrimaire: string; botCodes: string[];
  objectifs: string[]; budget: string; risques: string[];
  documents: MockDocument[]; jalons: MockJalon[];
  projets: MockProjetItem[];
  dateMaj?: string; sante?: { score: number; tendance: "up" | "down" | "stable"; burnRate?: string; roi?: string };
  raci?: MockRACIItem[]; decisions?: MockDecisionLog[]; conferences?: MockConferenceAI[];
  activites?: MockActivityLog[]; retrospective?: { positifs: string[]; negatifs: string[]; actions: string[] };
}

// ── Mock data realiste par departement pour simulation ──
export const MOCK_CHANTIERS: Record<string, MockChantierItem[]> = {
  CEOB: [
    { id: 1, titre: "Transformation numerique PME", description: "Moderniser l'infrastructure technologique et les processus d'affaires pour accelerer la croissance. Ce chantier couvre la migration cloud, l'automatisation des processus cles et la formation de toutes les equipes aux nouveaux outils.", phase: "execution", progression: 65, dateDebut: "2026-02-15", echeance: "2026-06-30", botPrimaire: "CTOB", botCodes: ["CTOB", "COOB", "CINOB"],
      objectifs: ["Reduire les couts operationnels de 20%", "Automatiser 5 processus cles", "Former 100% de l'equipe aux outils numeriques", "Migrer 100% des services vers le cloud"],
      budget: "125 000 $", risques: ["Resistance au changement des equipes terrain", "Dependance a un fournisseur cloud unique", "Delais de migration des donnees legacy"],
      documents: [
        { id: "d1", titre: "Plan strategique transformation", type: "plan", format: "PDF", modifie: "2026-04-10", auteur: "CarlOS" },
        { id: "d2", titre: "Architecture cible cloud", type: "technique", format: "Diagramme", modifie: "2026-04-08", auteur: "Tim (CTO)" },
        { id: "d3", titre: "Budget detaille Q2-Q3", type: "finance", format: "Excel", modifie: "2026-04-05", auteur: "Frank (CFO)" },
        { id: "d4", titre: "Matrice des risques", type: "risque", format: "PDF", modifie: "2026-03-28", auteur: "Simone (CSO)" },
      ],
      jalons: [
        { date: "2026-02-15", label: "Lancement du chantier", done: true },
        { date: "2026-03-15", label: "Audit infrastructure termine", done: true },
        { date: "2026-04-30", label: "Migration phase 1 (non-critique)", done: true },
        { date: "2026-05-15", label: "Migration phase 2 (DB principale)", done: false },
        { date: "2026-06-01", label: "Formation equipes", done: false },
        { date: "2026-06-30", label: "Livraison finale + retroaction", done: false },
      ],
      dateMaj: "2026-04-12",
      sante: { score: 72, tendance: "up", burnRate: "58%", roi: "3.2x projete" },
      raci: [
        { role: "Migration cloud", bot: "CTOB", type: "R" },
        { role: "Automatisation processus", bot: "COOB", type: "R" },
        { role: "Budget & ROI", bot: "CFOB", type: "A" },
        { role: "Securite infra", bot: "CISOB", type: "C" },
        { role: "Formation equipes", bot: "CHROB", type: "C" },
        { role: "Direction generale", bot: "CEOB", type: "I" },
      ],
      decisions: [
        { date: "2026-04-08", decision: "Choisir AWS plutot qu'Azure pour la migration", decideur: "CarlOS (CEO)", rationnel: "Meilleur rapport cout/performance pour nos volumes, plus d'expertise disponible dans l'equipe" },
        { date: "2026-03-20", decision: "Reporter la migration DB principale a mai", decideur: "Tim (CTO)", rationnel: "Tests de charge insuffisants, risque de perte de donnees si migration precipitee" },
        { date: "2026-03-01", decision: "Allouer 125K$ au chantier transformation", decideur: "Frank (CFO)", rationnel: "ROI projete de 3.2x sur 18 mois justifie l'investissement" },
      ],
      conferences: [
        { id: "conf-1", date: "2026-04-10", titre: "Revue hebdo migration cloud", participants: ["CTOB", "COOB", "CEOB"], duree: "45 min", resume: "Discussion sur le timeline migration DB. Tim propose un dry-run avant le cutover." },
        { id: "conf-2", date: "2026-04-03", titre: "Brainstorm automatisation processus", participants: ["COOB", "CINOB", "CPOB"], duree: "30 min", resume: "Identification des 10 processus prioritaires. Focus sur la facturation et le reporting." },
        { id: "conf-3", date: "2026-03-15", titre: "Kickoff transformation numerique", participants: ["CEOB", "CTOB", "CFOB", "COOB", "CISOB"], duree: "60 min", resume: "Definition du scope, allocation budget, assignment des responsabilites." },
      ],
      activites: [
        { date: "2026-04-12", action: "Migration phase 1 completee — 8 services non-critiques migres", auteur: "Tim (CTO)", type: "livrable" },
        { date: "2026-04-10", action: "Revue hebdomadaire du chantier", auteur: "CarlOS", type: "commentaire" },
        { date: "2026-04-08", action: "Decision: AWS selectionne comme provider cloud", auteur: "CarlOS", type: "decision" },
        { date: "2026-04-05", action: "Budget Q2-Q3 revise et approuve", auteur: "Frank (CFO)", type: "modification" },
        { date: "2026-04-03", action: "Brainstorm automatisation — 10 processus identifies", auteur: "Olivier (COO)", type: "commentaire" },
        { date: "2026-03-28", action: "Matrice des risques mise a jour", auteur: "Simone (CSO)", type: "modification" },
        { date: "2026-03-15", action: "Chantier cree — kickoff reunion completee", auteur: "CarlOS", type: "creation" },
      ],
      retrospective: { positifs: ["Migration phase 1 sans incident", "Bonne collaboration CTO-COO", "Budget respecte a ce jour"], negatifs: ["Retard sur la migration DB principale", "Formation equipes pas encore planifiee en detail"], actions: ["Planifier dry-run migration DB avant mai", "Preparer le calendrier de formation avec CHRO"] },
      projets: [
        { id: 101, titre: "Migration cloud", description: "Migrer les serveurs on-premise vers AWS/Azure pour plus de flexibilite et reduire les couts d'hebergement de 40%.", phase: "execution", progression: 80, botPrimaire: "CTOB", echeance: "2026-05-15",
          objectifs: ["Migrer 12 serveurs vers AWS", "Configurer le failover automatique", "Zero downtime pendant la migration"],
          livrables: ["Architecture cloud documentee", "Scripts Terraform", "Runbook de migration", "Tests de charge valides"],
          budget: "45 000 $",
          documents: [
            { id: "d5", titre: "Terraform modules", type: "code", format: "HCL", modifie: "2026-04-10", auteur: "Tim (CTO)" },
            { id: "d6", titre: "Runbook migration", type: "procedure", format: "Markdown", modifie: "2026-04-08", auteur: "Tim (CTO)" },
            { id: "d7", titre: "Rapport tests de charge", type: "rapport", format: "PDF", modifie: "2026-04-12", auteur: "Sebastien (CISO)" },
          ],
          jalons: [
            { date: "2026-03-01", label: "Audit serveurs termine", done: true },
            { date: "2026-04-01", label: "VPC et reseau configures", done: true },
            { date: "2026-04-20", label: "Services non-critiques migres", done: true },
            { date: "2026-05-10", label: "Base de donnees principale migree", done: false },
            { date: "2026-05-15", label: "Validation et cutover", done: false },
          ],
          sante: { score: 82, tendance: "up", burnRate: "65%", roi: "4x projete" },
          raci: [
            { role: "Architecture cloud", bot: "CTOB", type: "R" },
            { role: "Validation securite", bot: "CISOB", type: "A" },
            { role: "Budget migration", bot: "CFOB", type: "C" },
          ],
          dependances: [
            { label: "Tests de charge valides", type: "bloque-par", entite: "Rapport Sebastien (CISO)", statut: "en-cours" },
            { label: "Migration DB bloque deploiement production", type: "bloque", entite: "Projet Automatisation processus", statut: "en-cours" },
          ],
          decisions: [
            { date: "2026-04-08", decision: "AWS selectionne — migration multi-AZ", decideur: "Tim (CTO)", rationnel: "Redundancy et latence optimale pour le Quebec" },
          ],
          conferences: [
            { id: "conf-p1", date: "2026-04-10", titre: "Sprint review migration S15", participants: ["CTOB", "CISOB"], duree: "30 min", resume: "Phase 1 completee. Phase 2 planifiee pour mai." },
          ],
          missions: [
            { id: 1001, titre: "Audit infrastructure actuelle", description: "Cartographier tous les serveurs, bases de donnees et applications existantes. Documenter les dependances, les versions et les configurations.", phase: "retroaction", progression: 100, botPrimaire: "CTOB", echeance: "2026-03-15",
              objectifs: ["Inventorier 100% des serveurs", "Documenter toutes les dependances inter-services", "Identifier les SPOF critiques"],
              equipe: ["CTOB", "CISOB"],
              livrables: ["Inventaire complet des serveurs", "Carte des dependances", "Rapport de recommandations"],
              documents: [
                { id: "d8", titre: "Inventaire serveurs v3", type: "inventaire", format: "Excel", modifie: "2026-03-14", auteur: "Tim (CTO)" },
                { id: "d9", titre: "Diagramme dependances", type: "technique", format: "Draw.io", modifie: "2026-03-12", auteur: "Tim (CTO)" },
              ],
              jalons: [
                { date: "2026-03-01", label: "Inventaire physique termine", done: true },
                { date: "2026-03-10", label: "Dependances cartographiees", done: true },
                { date: "2026-03-15", label: "Rapport livre", done: true },
              ],
              criteresAcceptation: [
                { label: "100% des serveurs physiques et virtuels documentes", done: true },
                { label: "Diagramme de dependances valide par CISO", done: true },
                { label: "Rapport de recommandations approuve", done: true },
              ],
              conferences: [
                { id: "conf-m1", date: "2026-03-10", titre: "Revue audit infra", participants: ["CTOB", "CISOB"], duree: "25 min", resume: "Validation de l'inventaire. 3 SPOF critiques identifies." },
              ],
              taches: [
                { id: 10001, titre: "Inventaire des serveurs", description: "Lister tous les serveurs physiques et virtuels avec leurs specs (CPU, RAM, stockage), roles et uptime. Inclure les services Docker et les cronjobs.", phase: "retroaction", progression: 100, assignee: "Tim (CTO)", echeance: "2026-03-05",
                  instructions: "Utiliser les scripts d'inventaire existants (inventory.sh) + audit manuel Docker. Verifier chaque VM dans le dashboard OVH.",
                  validateur: "Sebastien (CISO)",
                  criteresAcceptation: [{ label: "Tous les serveurs listes avec specs", done: true }, { label: "Services Docker inventories", done: true }, { label: "Cronjobs documentes", done: true }],
                  tempsEstime: "3 jours", tempsReel: "2.5 jours",
                  documents: [{ id: "d10", titre: "Liste serveurs.xlsx", type: "donnees", format: "Excel", modifie: "2026-03-04", auteur: "Tim (CTO)" }],
                  jalons: [{ date: "2026-03-05", label: "Inventaire complete", done: true }] },
                { id: 10002, titre: "Cartographie des dependances", description: "Documenter les connexions entre services, APIs et bases de donnees. Identifier les single points of failure et les bottlenecks.", phase: "retroaction", progression: 100, assignee: "Tim (CTO)", echeance: "2026-03-10",
                  instructions: "Tracer les appels API entre services. Utiliser Draw.io pour le diagramme. Marquer en rouge les SPOF.",
                  validateur: "Sebastien (CISO)",
                  criteresAcceptation: [{ label: "Toutes les connexions API documentees", done: true }, { label: "SPOF identifies et marques", done: true }],
                  dependances: [{ label: "Inventaire serveurs termine", type: "bloque-par", entite: "Tache #10001", statut: "resolu" }],
                  tempsEstime: "4 jours", tempsReel: "3 jours",
                  documents: [{ id: "d11", titre: "dependency-map.drawio", type: "technique", format: "Draw.io", modifie: "2026-03-09", auteur: "Tim (CTO)" }],
                  jalons: [{ date: "2026-03-10", label: "Carte completee", done: true }] },
              ] },
            { id: 1002, titre: "Deploiement environnement cloud", description: "Configurer VPC, groupes de securite, IAM et services manages sur AWS. Implementer l'infrastructure as code avec Terraform.", phase: "execution", progression: 60, botPrimaire: "CTOB", echeance: "2026-05-10",
              livrables: ["VPC configure", "IAM policies", "RDS PostgreSQL", "Scripts Terraform"],
              documents: [
                { id: "d12", titre: "main.tf", type: "code", format: "Terraform", modifie: "2026-04-10", auteur: "Tim (CTO)" },
                { id: "d13", titre: "Guide IAM policies", type: "securite", format: "PDF", modifie: "2026-04-08", auteur: "Sebastien (CISO)" },
              ],
              jalons: [
                { date: "2026-04-01", label: "VPC operationnel", done: true },
                { date: "2026-04-15", label: "IAM et securite configures", done: true },
                { date: "2026-05-01", label: "RDS pret pour migration", done: false },
                { date: "2026-05-10", label: "Migration DB completee", done: false },
              ],
              taches: [
                { id: 10003, titre: "Configurer le VPC et sous-reseaux", description: "Creer l'architecture reseau cloud avec zones publiques et privees, NAT gateways et routing tables.", phase: "retroaction", progression: 100, assignee: "Tim (CTO)", echeance: "2026-04-01",
                  documents: [{ id: "d14", titre: "vpc-config.tf", type: "code", format: "Terraform", modifie: "2026-03-30", auteur: "Tim (CTO)" }],
                  jalons: [{ date: "2026-04-01", label: "VPC live", done: true }] },
                { id: 10004, titre: "Migrer la base de donnees principale", description: "Transferer PostgreSQL vers RDS avec replication et failover. Valider l'integrite des donnees et les performances.", phase: "execution", progression: 45, assignee: "Tim (CTO)", echeance: "2026-05-10",
                  documents: [
                    { id: "d15", titre: "Script migration pg_dump", type: "code", format: "Shell", modifie: "2026-04-08", auteur: "Tim (CTO)" },
                    { id: "d16", titre: "Checklist validation donnees", type: "checklist", format: "Markdown", modifie: "2026-04-10", auteur: "Tim (CTO)" },
                  ],
                  jalons: [
                    { date: "2026-04-20", label: "Replication configuree", done: true },
                    { date: "2026-05-01", label: "Tests integrite passes", done: false },
                    { date: "2026-05-10", label: "Cutover production", done: false },
                  ] },
              ] },
          ] },
        { id: 102, titre: "Automatisation des processus", description: "Identifier et automatiser les taches repetitives avec des playbooks. Reduire le temps consacre aux operations manuelles de 60%.", phase: "reflexion", progression: 25, botPrimaire: "COOB", echeance: "2026-06-30",
          objectifs: ["Cartographier 20 processus manuels", "Automatiser les 10 plus chronophages", "Reduire 60% du temps manuel"],
          livrables: ["Cartographie des processus", "10 playbooks d'automatisation", "Dashboard de monitoring"],
          budget: "35 000 $",
          documents: [
            { id: "d17", titre: "Cartographie processus V1", type: "analyse", format: "Miro", modifie: "2026-04-05", auteur: "Olivier (COO)" },
          ],
          jalons: [
            { date: "2026-04-15", label: "Cartographie terminee", done: false },
            { date: "2026-05-15", label: "5 premiers playbooks prets", done: false },
            { date: "2026-06-30", label: "10 playbooks deployes", done: false },
          ],
          missions: [
            { id: 1003, titre: "Cartographie des processus", description: "Documenter tous les workflows manuels avec temps et couts. Interviewer chaque departement.", phase: "execution", progression: 50, botPrimaire: "COOB", echeance: "2026-04-15",
              livrables: ["Flowcharts de 20 processus", "Matrice temps/cout", "Priorisation des automatisations"],
              documents: [{ id: "d18", titre: "Process-map-draft.miro", type: "analyse", format: "Miro", modifie: "2026-04-03", auteur: "Olivier (COO)" }],
              jalons: [{ date: "2026-04-05", label: "Interviews 50% completees", done: true }, { date: "2026-04-15", label: "Cartographie livree", done: false }],
              taches: [
                { id: 10005, titre: "Interviewer les chefs d'equipe", description: "Rencontrer chaque departement (30min/personne) pour identifier les goulots d'etranglement et les taches les plus chronophages.", phase: "execution", progression: 60, assignee: "Olivier (COO)", echeance: "2026-04-08",
                  documents: [{ id: "d19", titre: "Guide d'interview", type: "template", format: "Google Doc", modifie: "2026-03-25", auteur: "Olivier (COO)" }],
                  jalons: [{ date: "2026-04-01", label: "6/12 departements interviewes", done: true }, { date: "2026-04-08", label: "12/12 completes", done: false }] },
                { id: 10006, titre: "Documenter les 10 processus prioritaires", description: "Creer des flowcharts detailles pour les processus les plus chronophages avec temps estime, cout et frequence.", phase: "discussion", progression: 10, assignee: "Olivier (COO)", echeance: "2026-04-15",
                  documents: [], jalons: [{ date: "2026-04-15", label: "10 flowcharts livres", done: false }] },
              ] },
          ] },
      ] },
    { id: 2, titre: "Expansion marche Ontario", description: "Penetrer le marche ontarien avec une strategie adaptee au contexte anglophone. Identifier les segments prioritaires, adapter le messaging et etablir une presence locale.", phase: "reflexion", progression: 15, dateDebut: "2026-03-01", echeance: "2026-09-30", botPrimaire: "CSOB", botCodes: ["CSOB", "CMOB", "CROB"],
      objectifs: ["Identifier 50 prospects qualifies", "Ouvrir un bureau satellite a Toronto", "Generer 500K$ en pipeline Q3", "Recruter 2 representants bilingues"],
      budget: "200 000 $", risques: ["Concurrence forte des acteurs locaux etablis", "Differences culturelles business QC vs ON", "Cout immobilier Toronto eleve"],
      documents: [
        { id: "d20", titre: "Etude de marche Ontario V2", type: "recherche", format: "PDF", modifie: "2026-04-08", auteur: "Simone (CSO)" },
        { id: "d21", titre: "Business case expansion", type: "finance", format: "Excel", modifie: "2026-03-20", auteur: "Frank (CFO)" },
        { id: "d22", titre: "Personas acheteurs Ontario", type: "marketing", format: "PDF", modifie: "2026-04-01", auteur: "Mathilde (CMO)" },
      ],
      jalons: [
        { date: "2026-03-01", label: "Lancement analyse", done: true },
        { date: "2026-04-30", label: "Etude de marche livree", done: false },
        { date: "2026-06-15", label: "Strategie GTM validee", done: false },
        { date: "2026-07-15", label: "Premiers prospects contactes", done: false },
        { date: "2026-09-30", label: "Bureau Toronto operationnel", done: false },
      ],
      dateMaj: "2026-04-08",
      sante: { score: 45, tendance: "stable", burnRate: "12%", roi: "En evaluation" },
      decisions: [
        { date: "2026-03-15", decision: "Focus sur le segment manufacturier en Ontario", decideur: "Simone (CSO)", rationnel: "Meilleur fit avec notre expertise et notre reseau REAI" },
      ],
      conferences: [
        { id: "conf-4", date: "2026-04-05", titre: "Revue etude de marche Ontario", participants: ["CSOB", "CMOB", "CEOB"], duree: "35 min", resume: "Premiers resultats encourageants. 50+ manufacturiers identifies dans la GTA." },
      ],
      activites: [
        { date: "2026-04-08", action: "Etude de marche — analyse concurrentielle en cours", auteur: "Simone (CSO)", type: "modification" },
        { date: "2026-03-15", action: "Segment manufacturier selectionne comme cible prioritaire", auteur: "Simone (CSO)", type: "decision" },
        { date: "2026-03-01", action: "Chantier lance — equipe Simone + Mathilde + Rich", auteur: "CarlOS", type: "creation" },
      ],
      projets: [
        { id: 103, titre: "Etude de marche Ontario", description: "Analyser le paysage concurrentiel, identifier les segments prioritaires et quantifier l'opportunite.", phase: "execution", progression: 70, botPrimaire: "CSOB", echeance: "2026-04-30",
          objectifs: ["Profiler 20 competiteurs", "Identifier 5 segments prioritaires", "Estimer le TAM/SAM/SOM"],
          livrables: ["Rapport d'analyse concurrentielle", "Segmentation marche", "Recommandations strategiques"],
          budget: "15 000 $",
          documents: [{ id: "d23", titre: "Competitive-landscape.pdf", type: "recherche", format: "PDF", modifie: "2026-04-08", auteur: "Simone (CSO)" }],
          jalons: [{ date: "2026-03-15", label: "Donnees collectees", done: true }, { date: "2026-04-15", label: "Analyse completee", done: false }, { date: "2026-04-30", label: "Rapport livre", done: false }],
          missions: [
            { id: 1004, titre: "Analyse concurrentielle", description: "Profiler les 20 competiteurs principaux en Ontario. Documenter leurs forces, faiblesses, pricing et positionnement.", phase: "retroaction", progression: 90, botPrimaire: "CSOB", echeance: "2026-04-15",
              livrables: ["20 fiches competiteurs", "Matrice positionnement", "SWOT global"],
              documents: [{ id: "d24", titre: "Fiches competiteurs", type: "recherche", format: "Google Sheets", modifie: "2026-04-10", auteur: "Simone (CSO)" }],
              jalons: [{ date: "2026-04-01", label: "10/20 profils completes", done: true }, { date: "2026-04-15", label: "20/20 + synthese", done: false }],
              taches: [
                { id: 10007, titre: "Recherche web et rapports industrie", description: "Compiler les donnees publiques sur les competiteurs (revenus, parts de marche, positionnement, avis clients).", phase: "retroaction", progression: 100, assignee: "Simone (CSO)", echeance: "2026-04-01",
                  documents: [{ id: "d25", titre: "Sources et liens", type: "recherche", format: "Notion", modifie: "2026-03-30", auteur: "Simone (CSO)" }],
                  jalons: [{ date: "2026-04-01", label: "Recherche terminee", done: true }] },
                { id: 10008, titre: "Synthese SWOT par competiteur", description: "Rediger une fiche SWOT pour chaque competiteur. Identifier les angles d'attaque et les differenciateurs.", phase: "execution", progression: 75, assignee: "Simone (CSO)", echeance: "2026-04-15",
                  documents: [{ id: "d26", titre: "SWOT-template.docx", type: "template", format: "Word", modifie: "2026-04-05", auteur: "Simone (CSO)" }],
                  jalons: [{ date: "2026-04-10", label: "15/20 SWOT rediges", done: true }, { date: "2026-04-15", label: "20/20 livres", done: false }] },
              ] },
          ] },
        { id: 104, titre: "Strategie go-to-market", description: "Definir le positionnement, pricing, canaux et messaging pour le marche ontarien.", phase: "discussion", progression: 5, botPrimaire: "CMOB", echeance: "2026-06-15",
          objectifs: ["Definir le positionnement differencie", "Adapter le pricing au marche ON", "Choisir 3 canaux d'acquisition"],
          livrables: ["Document GTM", "Pricing grid", "Plan media"], budget: "25 000 $",
          documents: [], jalons: [{ date: "2026-05-01", label: "Kickoff GTM", done: false }, { date: "2026-06-15", label: "GTM valide", done: false }],
          missions: [] },
      ] },
    { id: 3, titre: "Programme fidelisation clients", description: "Reduire le churn de 15% et augmenter le LTV de 25% via un programme de fidelisation structure. Inclut tiers, recompenses, gamification et portail client.", phase: "creation", progression: 40, dateDebut: "2026-03-15", echeance: "2026-08-15", botPrimaire: "CROB", botCodes: ["CROB", "CMOB", "CFOB"],
      objectifs: ["Reduire le churn a moins de 5%", "Augmenter le NPS de 20 points", "Lancer le programme loyalty Q2", "Atteindre 80% d'adoption en 3 mois"],
      budget: "85 000 $", risques: ["Faible adoption si UX complexe", "Cout des recompenses mal calibre", "Integration CRM difficile"],
      documents: [
        { id: "d27", titre: "Blueprint programme loyalty", type: "strategie", format: "PDF", modifie: "2026-04-10", auteur: "Mathilde (CMO)" },
        { id: "d28", titre: "Analyse churn Q1 2026", type: "donnees", format: "Excel", modifie: "2026-04-01", auteur: "Rich (CRO)" },
        { id: "d29", titre: "Budget rewards program", type: "finance", format: "Excel", modifie: "2026-03-25", auteur: "Frank (CFO)" },
      ],
      jalons: [
        { date: "2026-03-15", label: "Kickoff chantier", done: true },
        { date: "2026-04-15", label: "Benchmark termine", done: true },
        { date: "2026-05-15", label: "Design programme valide", done: false },
        { date: "2026-06-30", label: "Developpement portail", done: false },
        { date: "2026-08-15", label: "Lancement programme", done: false },
      ],
      dateMaj: "2026-04-10",
      sante: { score: 60, tendance: "down", burnRate: "35%", roi: "2.5x projete" },
      decisions: [
        { date: "2026-04-10", decision: "Programme a 3 tiers: Bronze, Argent, Or", decideur: "Rich (CRO)", rationnel: "Simple a comprendre pour les clients, scalable" },
        { date: "2026-03-20", decision: "Gamification integree des le V1", decideur: "Mathilde (CMO)", rationnel: "Les benchmarks montrent +40% d'engagement avec gamification" },
      ],
      conferences: [
        { id: "conf-5", date: "2026-04-08", titre: "Design review programme fidelisation", participants: ["CROB", "CMOB", "CFOB"], duree: "40 min", resume: "Validation des 3 tiers. Discussion sur le cout des recompenses — Frank veut un cap a 5% du revenu." },
      ],
      activites: [
        { date: "2026-04-10", action: "Decision sur les 3 tiers du programme", auteur: "Rich (CRO)", type: "decision" },
        { date: "2026-04-08", action: "Design review completee", auteur: "Mathilde (CMO)", type: "commentaire" },
        { date: "2026-04-01", action: "Benchmark de 10 programmes B2B livre", auteur: "Mathilde (CMO)", type: "livrable" },
        { date: "2026-03-15", action: "Chantier fidelisation lance", auteur: "CarlOS", type: "creation" },
      ],
      projets: [
        { id: 105, titre: "Design du programme loyalty", description: "Concevoir les tiers, recompenses et mecaniques de fidelisation. Valider avec un panel de 10 clients.", phase: "creation", progression: 55, botPrimaire: "CMOB", echeance: "2026-05-15",
          objectifs: ["3 tiers de fidelisation definis", "Catalogue de 20 recompenses", "Mecaniques de gamification validees"],
          livrables: ["Document de design", "Maquettes UI", "Plan de test client"], budget: "20 000 $",
          documents: [
            { id: "d30", titre: "Loyalty-design-v2.fig", type: "design", format: "Figma", modifie: "2026-04-08", auteur: "Mathilde (CMO)" },
            { id: "d31", titre: "Tiers et rewards matrix", type: "strategie", format: "Google Sheets", modifie: "2026-04-05", auteur: "Rich (CRO)" },
          ],
          jalons: [{ date: "2026-04-01", label: "Benchmark complete", done: true }, { date: "2026-04-20", label: "Tiers definis", done: false }, { date: "2026-05-15", label: "Design valide", done: false }],
          missions: [
            { id: 1005, titre: "Benchmark programmes existants", description: "Etudier les meilleurs programmes de fidelisation B2B (Salesforce, HubSpot, Slack, etc.).", phase: "retroaction", progression: 100, botPrimaire: "CMOB", echeance: "2026-04-01",
              livrables: ["Rapport benchmark 10 programmes", "Matrice de comparaison", "Recommandations"],
              documents: [{ id: "d32", titre: "Benchmark-B2B-loyalty.pdf", type: "recherche", format: "PDF", modifie: "2026-03-30", auteur: "Mathilde (CMO)" }],
              jalons: [{ date: "2026-04-01", label: "Benchmark livre", done: true }],
              taches: [
                { id: 10009, titre: "Analyser 10 programmes B2B leaders", description: "Documenter les mecaniques de Salesforce, HubSpot, Slack, Notion, Figma, Linear, Atlassian, Datadog, Stripe, Twilio.", phase: "retroaction", progression: 100, assignee: "Mathilde (CMO)", echeance: "2026-03-25",
                  documents: [{ id: "d33", titre: "Fiches programmes", type: "recherche", format: "Notion", modifie: "2026-03-24", auteur: "Mathilde (CMO)" }],
                  jalons: [{ date: "2026-03-25", label: "10 fiches redigees", done: true }] },
              ] },
          ] },
      ] },
  ],
  CTOB: [
    { id: 4, titre: "Refonte architecture microservices", description: "Decouper le monolithe en microservices pour ameliorer la scalabilite et la velocite de developpement.", phase: "execution", progression: 45, dateDebut: "2026-03-01", echeance: "2026-07-31", botPrimaire: "CTOB", botCodes: ["CTOB", "CISOB"],
      objectifs: ["Decouper 8 domaines en services independants", "Reduire le temps de deploiement de 4h a 15min", "Atteindre 99.9% uptime"],
      budget: "90 000 $", risques: ["Complexite de la migration de donnees entre services", "Performance des appels inter-services"],
      documents: [
        { id: "dt1", titre: "Architecture microservices v3", type: "technique", format: "Diagramme", modifie: "2026-04-10", auteur: "Tim (CTO)" },
        { id: "dt2", titre: "ADR-001 — Choix message broker", type: "decision", format: "Markdown", modifie: "2026-03-20", auteur: "Tim (CTO)" },
      ],
      jalons: [
        { date: "2026-03-01", label: "Kickoff architecture", done: true },
        { date: "2026-04-01", label: "Service auth extrait", done: true },
        { date: "2026-05-15", label: "Service billing extrait", done: false },
        { date: "2026-07-31", label: "8 services operationnels", done: false },
      ],
      projets: [
        { id: 106, titre: "Service authentification", description: "Extraire l'auth en microservice avec JWT + OAuth2. Zero downtime migration.", phase: "retroaction", progression: 95, botPrimaire: "CTOB", echeance: "2026-05-01",
          objectifs: ["JWT refresh tokens", "OAuth2 flows", "Rate limiting"], livrables: ["Service Go deploye", "Documentation API", "Tests E2E"], budget: "15 000 $",
          documents: [{ id: "dt3", titre: "auth-service/README.md", type: "doc", format: "Markdown", modifie: "2026-04-10", auteur: "Tim (CTO)" }],
          jalons: [{ date: "2026-04-01", label: "MVP auth service", done: true }, { date: "2026-04-20", label: "Migration traffic", done: true }, { date: "2026-05-01", label: "Ancien code retire", done: false }],
          missions: [
            { id: 1006, titre: "Implementer JWT refresh tokens", description: "Ajouter le mecanisme de refresh avec rotation et invalidation automatique.", phase: "retroaction", progression: 100, botPrimaire: "CTOB", echeance: "2026-04-20",
              livrables: ["Endpoint /auth/refresh", "Tests unitaires", "Documentation Swagger"],
              documents: [{ id: "dt4", titre: "jwt-refresh.go", type: "code", format: "Go", modifie: "2026-04-18", auteur: "Tim (CTO)" }],
              jalons: [{ date: "2026-04-20", label: "Deploye en prod", done: true }],
              taches: [
                { id: 10010, titre: "Coder le endpoint /auth/refresh", description: "Implementer la rotation de tokens avec invalidation de l'ancien. Inclure le rate limiting par IP.", phase: "retroaction", progression: 100, assignee: "Tim (CTO)", echeance: "2026-04-15",
                  documents: [{ id: "dt5", titre: "refresh_handler.go", type: "code", format: "Go", modifie: "2026-04-14", auteur: "Tim (CTO)" }],
                  jalons: [{ date: "2026-04-15", label: "Code merge", done: true }] },
              ] },
          ] },
        { id: 107, titre: "Service facturation", description: "Microservice de billing avec Stripe integration et gestion des abonnements.", phase: "execution", progression: 35, botPrimaire: "CFOB", echeance: "2026-06-15",
          objectifs: ["Stripe webhooks", "Dashboard revenus", "Relances automatiques"], livrables: ["Service Python deploye", "Dashboard Metabase", "Alertes Slack"], budget: "25 000 $",
          documents: [{ id: "dt6", titre: "billing-service/architecture.md", type: "technique", format: "Markdown", modifie: "2026-04-05", auteur: "Frank (CFO)" }],
          jalons: [{ date: "2026-04-15", label: "Stripe connecte", done: true }, { date: "2026-05-15", label: "Webhooks operationnels", done: false }, { date: "2026-06-15", label: "Dashboard live", done: false }],
          missions: [
            { id: 1007, titre: "Integration Stripe", description: "Connecter l'API Stripe pour les paiements recurrents et gerer les webhooks.", phase: "execution", progression: 40, botPrimaire: "CFOB", echeance: "2026-05-15",
              livrables: ["Webhooks configures", "Tests de paiement", "Monitoring erreurs"],
              documents: [{ id: "dt7", titre: "stripe-webhook-handler.py", type: "code", format: "Python", modifie: "2026-04-08", auteur: "Frank (CFO)" }],
              jalons: [{ date: "2026-04-15", label: "API connectee", done: true }, { date: "2026-05-15", label: "Webhooks live", done: false }],
              taches: [
                { id: 10011, titre: "Configurer webhooks Stripe", description: "Ecouter payment_intent.succeeded, invoice.paid, subscription.updated. Gerer les retries et les erreurs.", phase: "execution", progression: 60, assignee: "Frank (CFO)", echeance: "2026-05-01",
                  documents: [{ id: "dt8", titre: "webhook_config.json", type: "config", format: "JSON", modifie: "2026-04-10", auteur: "Frank (CFO)" }],
                  jalons: [{ date: "2026-04-20", label: "3/6 events configures", done: true }, { date: "2026-05-01", label: "6/6 events live", done: false }] },
                { id: 10012, titre: "Dashboard revenus temps reel", description: "Afficher MRR, churn, ARPU, LTV en temps reel avec alertes sur anomalies.", phase: "discussion", progression: 0, assignee: "Frank (CFO)", echeance: "2026-06-01",
                  documents: [], jalons: [{ date: "2026-05-15", label: "Maquette validee", done: false }, { date: "2026-06-01", label: "Dashboard deploye", done: false }] },
              ] },
          ] },
      ] },
  ],
  CMOB: [
    { id: 5, titre: "Campagne lancement produit V2", description: "Orchestrer le lancement marketing du produit V2 sur tous les canaux. Video, landing page, PR, social media, email nurturing.", phase: "creation", progression: 50, dateDebut: "2026-03-15", echeance: "2026-06-15", botPrimaire: "CMOB", botCodes: ["CMOB", "CROB"],
      objectifs: ["Generer 10K visiteurs uniques jour du lancement", "Obtenir 500 inscriptions en 48h", "Coverage dans 5 medias specialises"],
      budget: "60 000 $", risques: ["Retard video = decalage lancement", "Budget media insuffisant si CPC eleve"],
      documents: [
        { id: "dm1", titre: "Plan lancement V2", type: "strategie", format: "PDF", modifie: "2026-04-05", auteur: "Mathilde (CMO)" },
        { id: "dm2", titre: "Brief creatif video", type: "brief", format: "Google Doc", modifie: "2026-04-01", auteur: "Mathilde (CMO)" },
      ],
      jalons: [
        { date: "2026-03-15", label: "Kickoff campagne", done: true },
        { date: "2026-04-30", label: "Assets creatifs termines", done: false },
        { date: "2026-05-30", label: "Landing page live", done: false },
        { date: "2026-06-15", label: "Jour de lancement", done: false },
      ],
      projets: [
        { id: 108, titre: "Contenu et assets creatifs", description: "Produire video de presentation, landing page, sequence email et posts sociaux.", phase: "execution", progression: 65, botPrimaire: "CMOB", echeance: "2026-05-30",
          objectifs: ["Video 2min tournee et montee", "Landing page responsive", "10 emails de nurturing"], livrables: ["Video MP4 HD", "Landing page HTML", "Templates emails"], budget: "30 000 $",
          documents: [{ id: "dm3", titre: "Storyboard video", type: "creative", format: "Figma", modifie: "2026-04-03", auteur: "Mathilde (CMO)" }],
          jalons: [{ date: "2026-04-15", label: "Script valide", done: true }, { date: "2026-05-15", label: "Video montee", done: false }, { date: "2026-05-30", label: "Tous assets livres", done: false }],
          missions: [
            { id: 1008, titre: "Video de presentation 2min", description: "Script, tournage et montage de la video produit avec temoignages clients.", phase: "execution", progression: 70, botPrimaire: "CMOB", echeance: "2026-05-15",
              livrables: ["Script final", "Rush video", "Video montee", "Sous-titres FR/EN"],
              documents: [
                { id: "dm4", titre: "Script-V2-final.docx", type: "script", format: "Word", modifie: "2026-04-10", auteur: "Mathilde (CMO)" },
                { id: "dm5", titre: "Rush tournage 2026-04-12", type: "video", format: "MP4", modifie: "2026-04-12", auteur: "Mathilde (CMO)" },
              ],
              jalons: [{ date: "2026-04-10", label: "Script approuve", done: true }, { date: "2026-04-12", label: "Tournage termine", done: true }, { date: "2026-05-01", label: "Premier montage", done: false }, { date: "2026-05-15", label: "Version finale", done: false }],
              taches: [
                { id: 10013, titre: "Ecrire le script video", description: "Rediger le script avec les points cles: probleme, solution, preuve sociale, CTA. Inclure les transitions et les notes de realisation.", phase: "retroaction", progression: 100, assignee: "Mathilde (CMO)", echeance: "2026-04-10",
                  documents: [{ id: "dm6", titre: "Script-draft-v3.docx", type: "script", format: "Word", modifie: "2026-04-08", auteur: "Mathilde (CMO)" }],
                  jalons: [{ date: "2026-04-10", label: "Script valide par Carl", done: true }] },
                { id: 10014, titre: "Montage et post-production", description: "Assembler les sequences, ajouter animations, lower thirds, sous-titres bilingues et musique.", phase: "execution", progression: 40, assignee: "Mathilde (CMO)", echeance: "2026-05-15",
                  documents: [{ id: "dm7", titre: "Timeline Premiere Pro", type: "projet", format: "Premiere", modifie: "2026-04-12", auteur: "Mathilde (CMO)" }],
                  jalons: [{ date: "2026-04-20", label: "Rough cut", done: false }, { date: "2026-05-01", label: "Fine cut", done: false }, { date: "2026-05-15", label: "Master final", done: false }] },
              ] },
          ] },
      ] },
  ],
  CFOB: [
    { id: 6, titre: "Optimisation tresorerie Q2-Q3", description: "Ameliorer le BFR et securiser le runway pour les 12 prochains mois. Automatiser la facturation et reduire les delais de paiement.", phase: "execution", progression: 55, dateDebut: "2026-02-01", echeance: "2026-07-31", botPrimaire: "CFOB", botCodes: ["CFOB", "COOB"],
      objectifs: ["Reduire le DSO de 45 a 30 jours", "Augmenter la reserve de cash de 200K$", "Automatiser 80% de la facturation"],
      budget: "40 000 $", risques: ["Clients resistants aux nouvelles conditions de paiement", "Integration ERP complexe"],
      documents: [
        { id: "df1", titre: "Plan tresorerie Q2-Q3", type: "finance", format: "Excel", modifie: "2026-04-08", auteur: "Frank (CFO)" },
        { id: "df2", titre: "Analyse DSO par client", type: "donnees", format: "Excel", modifie: "2026-04-05", auteur: "Frank (CFO)" },
      ],
      jalons: [
        { date: "2026-02-01", label: "Audit tresorerie", done: true },
        { date: "2026-03-15", label: "Nouvelles conditions paiement", done: true },
        { date: "2026-05-01", label: "Facturation automatique live", done: false },
        { date: "2026-07-31", label: "Objectif DSO 30j atteint", done: false },
      ],
      projets: [
        { id: 109, titre: "Automatisation facturation", description: "Mettre en place la facturation automatique, les relances et le suivi des paiements.", phase: "execution", progression: 70, botPrimaire: "CFOB", echeance: "2026-05-01",
          objectifs: ["Templates factures automatiques", "Relances J+7/J+15/J+30", "Dashboard suivi paiements"], livrables: ["Systeme de facturation", "Templates email relance", "Dashboard"], budget: "15 000 $",
          documents: [{ id: "df3", titre: "Specs facturation auto", type: "specs", format: "PDF", modifie: "2026-03-25", auteur: "Frank (CFO)" }],
          jalons: [{ date: "2026-03-15", label: "Specs validees", done: true }, { date: "2026-04-15", label: "Templates configures", done: true }, { date: "2026-05-01", label: "Systeme live", done: false }],
          missions: [
            { id: 1009, titre: "Integrer le systeme de facturation", description: "Connecter ERP → facturation automatique → relances → dashboard de suivi.", phase: "execution", progression: 70, botPrimaire: "CFOB", echeance: "2026-05-01",
              livrables: ["Connecteur ERP", "Engine de relance", "Dashboard revenus"],
              documents: [{ id: "df4", titre: "erp-connector.py", type: "code", format: "Python", modifie: "2026-04-10", auteur: "Frank (CFO)" }],
              jalons: [{ date: "2026-04-01", label: "Connecteur ERP pret", done: true }, { date: "2026-04-20", label: "Relances automatiques testees", done: true }, { date: "2026-05-01", label: "Production", done: false }],
              taches: [
                { id: 10015, titre: "Configurer les templates de factures", description: "Creer les modeles avec branding, termes de paiement, calculs automatiques et numerotation sequentielle.", phase: "retroaction", progression: 100, assignee: "Frank (CFO)", echeance: "2026-04-15",
                  documents: [{ id: "df5", titre: "invoice-template.html", type: "template", format: "HTML", modifie: "2026-04-14", auteur: "Frank (CFO)" }],
                  jalons: [{ date: "2026-04-15", label: "Templates deployes", done: true }] },
              ] },
          ] },
      ] },
  ],
};

// Fallback: departements sans mock specifique → utiliser CEOB
export const getMockChantiers = (botCode: string): MockChantierItem[] => MOCK_CHANTIERS[botCode] || MOCK_CHANTIERS.CEOB || [];
